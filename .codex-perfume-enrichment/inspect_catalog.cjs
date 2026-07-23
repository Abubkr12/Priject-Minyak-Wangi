const fs = require("fs");
const xlsx = require("xlsx");
const { createClient } = require("@supabase/supabase-js");

const projectRoot = process.argv[2];
const workbookPath = process.argv[3];
const envText = fs.readFileSync(`${projectRoot}\\.env.local`, "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/)
    .map((line) => line.match(/^([^=]+)=(.*)$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2]]),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const normalize = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[^a-zA-Z0-9]+/g, " ")
  .trim()
  .toLowerCase();

async function main() {
  const workbook = xlsx.readFile(workbookPath);
  const workbookNames = ["Parfum Umum", "Parfum Arab"].flatMap((sheetName) => {
    const nameColumn = sheetName === "Parfum Arab" ? "NAMA PARFUM ARAB" : "NAMA PARFUM";
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]).map((row) => ({
      sheetName,
      name: row[nameColumn],
      normalized: normalize(row[nameColumn]),
    }));
  });
  const { data, error } = await supabase
    .from("bibit")
    .select("id,name,description,intensity,top_notes,middle_notes,base_notes")
    .order("id", { ascending: true })
    .range(0, 1999);
  if (error) throw new Error(error.message);

  const byName = new Map((data || []).map((item) => [normalize(item.name), item]));
  const matches = workbookNames.map((item) => ({ ...item, record: byName.get(item.normalized) || null }));
  const matched = matches.filter((item) => item.record);
  const populated = matched.filter((item) => item.record.intensity && (
    (Array.isArray(item.record.top_notes) && item.record.top_notes.length) ||
    (Array.isArray(item.record.middle_notes) && item.record.middle_notes.length) ||
    (Array.isArray(item.record.base_notes) && item.record.base_notes.length)
  ));
  console.log(JSON.stringify({
    catalogRows: data?.length || 0,
    workbookRows: workbookNames.length,
    exactNameMatches: matched.length,
    matchedWithProfile: populated.length,
    samples: populated.slice(0, 5).map((item) => ({
      workbookName: item.name,
      catalogName: item.record.name,
      intensity: item.record.intensity,
      topNotes: item.record.top_notes,
      middleNotes: item.record.middle_notes,
      baseNotes: item.record.base_notes,
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
