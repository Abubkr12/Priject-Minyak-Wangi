const fs = require("fs");
const xlsx = require("xlsx");

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

async function main() {
  const diagnostics = [];
  for (let index = 0; index < keys.length; index += 1) {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      headers: { "x-goog-api-key": keys[index] },
    });
    const body = await response.json().catch(() => ({}));
    const models = (body.models || []).map((model) => model.name || "");
    diagnostics.push({
      keyIndex: index + 1,
      status: response.status,
      supports25Flash: models.includes("models/gemini-2.5-flash"),
      supports31Lite: models.includes("models/gemini-3.1-flash-lite"),
      supports35Flash: models.includes("models/gemini-3.5-flash"),
      modelCount: models.length,
      error: body.error?.message || null,
    });
  }
  console.log(JSON.stringify({ keyCount: keys.length, diagnostics }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
