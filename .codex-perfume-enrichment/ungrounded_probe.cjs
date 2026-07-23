const fs = require("fs");
const xlsx = require("xlsx");
const { GoogleGenAI } = require("@google/genai");

const envText = fs.readFileSync(process.argv[2], "utf8");
const envKeys = [...envText.matchAll(/^GEMINI_API_KEY=(.+)$/gm)]
  .map((match) => match[1].trim())
  .filter(Boolean);
const limitWorkbook = xlsx.readFile(process.argv[3]);
const apiKeySheet = limitWorkbook.Sheets["API Key List"];
const workbookKeys = apiKeySheet
  ? xlsx.utils.sheet_to_json(apiKeySheet, { header: 1 }).flat()
    .filter((value) => typeof value === "string" && value.startsWith("AQ."))
  : [];
const keys = [...new Set([...envKeys, ...workbookKeys])];

async function main() {
  const attempts = [];
  for (let index = 0; index < keys.length; index += 1) {
    try {
      const ai = new GoogleGenAI({ apiKey: keys[index] });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Jawab tepat dengan teks: OK",
        config: { temperature: 0 },
      });
      console.log(JSON.stringify({ keyCount: keys.length, usableKeyIndex: index + 1, response: response.text.trim() }));
      return;
    } catch (error) {
      attempts.push({ keyIndex: index + 1, code: error?.status || error?.code || null });
    }
  }
  console.log(JSON.stringify({ keyCount: keys.length, usableKeyIndex: null, attempts }));
  process.exitCode = 1;
}

main();
