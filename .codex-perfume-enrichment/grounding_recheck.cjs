const fs = require("fs");
const xlsx = require("xlsx");
const { GoogleGenAI } = require("@google/genai");

const envText = fs.readFileSync(process.argv[2], "utf8");
const envKeys = [...envText.matchAll(/^GEMINI_API_KEY=(.+)$/gm)]
  .map((match) => match[1].trim())
  .filter(Boolean);
const workbook = xlsx.readFile(process.argv[3]);
const apiKeySheet = workbook.Sheets["API Key List"];
const workbookKeys = apiKeySheet
  ? xlsx.utils.sheet_to_json(apiKeySheet, { header: 1 }).flat()
    .filter((value) => typeof value === "string" && value.startsWith("AQ."))
  : [];
const keys = [...new Set([...envKeys, ...workbookKeys])];
const requestedKeyIndex = Number.parseInt(process.argv[4] || "", 10);
const candidateKeys = Number.isInteger(requestedKeyIndex) && requestedKeyIndex >= 1 && requestedKeyIndex <= keys.length
  ? [{ key: keys[requestedKeyIndex - 1], index: requestedKeyIndex }]
  : keys.map((key, index) => ({ key, index: index + 1 }));

async function main() {
  const failures = [];
  for (const candidate of candidateKeys) {
    try {
      const ai = new GoogleGenAI({ apiKey: candidate.key });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Cari data publik untuk parfum Baccarat Rouge 540. Jawab JSON murni {\"intensitas\":\"Soft|Medium|Strong\",\"notes\":\"...\"}.",
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }],
        },
      });
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      console.log(JSON.stringify({
        usableKeyIndex: candidate.index,
        grounded: chunks.length > 0,
        sourceCount: chunks.length,
        response: response.text,
      }, null, 2));
      return;
    } catch (error) {
      failures.push({
        keyIndex: candidate.index,
        code: error?.status || error?.code || null,
        error: error?.message || String(error),
      });
    }
  }
  console.log(JSON.stringify({ usableKeyIndex: null, failures }, null, 2));
  process.exitCode = 1;
}

main();
