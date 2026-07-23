const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");
const xlsx = require("xlsx");

const envPath = process.argv[2] || ".env.local";
const envText = fs.readFileSync(envPath, "utf8");
const envKeys = [...envText.matchAll(/^GEMINI_API_KEY=(.+)$/gm)]
  .map((match) => match[1].trim())
  .filter(Boolean);
const configuredModel = (envText.match(/^GEMINI_MODEL=(.+)$/m)?.[1] || "gemini-3.5-flash").trim();
const limitWorkbookPath = process.argv[3];
let workbookKeys = [];

if (limitWorkbookPath && fs.existsSync(limitWorkbookPath)) {
  const workbook = xlsx.readFile(limitWorkbookPath);
  const apiKeySheet = workbook.Sheets["API Key List"];
  if (apiKeySheet) {
    workbookKeys = xlsx.utils.sheet_to_json(apiKeySheet, { header: 1 })
      .flat()
      .filter((value) => typeof value === "string" && value.startsWith("AQ."));
  }
}

const keys = [...new Set([...envKeys, ...workbookKeys])];
const models = [...new Set([
  configuredModel,
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
])];

if (keys.length === 0) throw new Error("No GEMINI_API_KEY entry was found in .env.local.");

async function main() {
  const failures = [];
  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const ai = new GoogleGenAI({ apiKey: keys[keyIndex] });
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `Cari referensi publik untuk parfum \"Baccarat Rouge 540\". Jawab dalam JSON murni: {\"intensitas\":\"Soft|Medium|Strong\",\"notes\":\"maksimal 8 karakter aroma utama, dipisahkan koma\"}.`,
          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }],
            systemInstruction: "Anda ahli parfum. Gunakan Google Search Grounding untuk jawaban faktual. Jangan mengarang merek, konsentrasi, atau notes.",
          },
        });
        const grounding = response.candidates?.[0]?.groundingMetadata;
        const chunks = grounding?.groundingChunks || [];
        console.log(JSON.stringify({
          model,
          keyCount: keys.length,
          keyIndex: keyIndex + 1,
          text: response.text,
          grounded: Boolean(grounding),
          sourceCount: chunks.length,
          sources: chunks.slice(0, 3).map((chunk) => ({
            title: chunk.web?.title || null,
            url: chunk.web?.uri || null,
          })),
        }, null, 2));
        return;
      } catch (error) {
        failures.push({ keyIndex: keyIndex + 1, model, code: error?.status || error?.code || null });
      }
    }
  }
  throw new Error(`No usable Gemini Flash configuration. Attempts: ${JSON.stringify(failures)}`);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
