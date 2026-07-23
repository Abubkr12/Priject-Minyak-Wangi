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
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": keys[index] },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Return exactly: OK" }] }] }),
      },
    );
    const body = await response.json().catch(() => ({}));
    diagnostics.push({
      keyIndex: index + 1,
      status: response.status,
      text: body.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || null,
      error: body.error?.message || null,
      details: body.error?.details?.map((detail) => ({
        reason: detail.reason || null,
        quotaMetric: detail.quota_metric || null,
        quotaLimit: detail.quota_limit || null,
      })) || [],
    });
  }
  console.log(JSON.stringify({ keyCount: keys.length, diagnostics }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
