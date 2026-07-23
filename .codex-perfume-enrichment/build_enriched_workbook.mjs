import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import { createClient } from "@supabase/supabase-js";

const [projectRoot, sourcePath, outputPath, previewDir] = process.argv.slice(2);

if (!projectRoot || !sourcePath || !outputPath || !previewDir) {
  throw new Error("Usage: node build_enriched_workbook.mjs <project-root> <source.xlsx> <output.xlsx> <preview-dir>");
}

const envText = await fs.readFile(`${projectRoot}/.env.local`, "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/)
    .map((line) => line.match(/^([^=]+)=(.*)$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2]]),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const normalizeName = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[^a-zA-Z0-9]+/g, " ")
  .trim()
  .toLowerCase();

const normalizeNotes = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const noteNames = (notes) => normalizeNotes(notes)
  .map((note) => typeof note === "string" ? note : note?.name)
  .map((name) => String(name || "").trim())
  .filter(Boolean);

const formatNotes = (profile) => [
  ["Top", noteNames(profile.top_notes)],
  ["Middle", noteNames(profile.middle_notes)],
  ["Base", noteNames(profile.base_notes)],
].map(([label, names]) => `${label}: ${names.length ? names.join(", ") : "-"}`).join("\n");

const { data: profiles, error } = await supabase
  .from("bibit")
  .select("name,intensity,top_notes,middle_notes,base_notes")
  .order("id", { ascending: true })
  .range(0, 1999);

if (error) throw new Error(`Failed to read perfume catalog: ${error.message}`);

const profilesByName = new Map((profiles || []).map((profile) => [normalizeName(profile.name), profile]));
const input = await FileBlob.load(sourcePath);
const workbook = await SpreadsheetFile.importXlsx(input);

const sheetConfigs = [
  { sheetName: "Parfum Umum", nameColumnIndex: 1 },
  { sheetName: "Parfum Arab", nameColumnIndex: 1 },
];
const summaries = [];

for (const { sheetName, nameColumnIndex } of sheetConfigs) {
  const sheet = workbook.worksheets.getItem(sheetName);
  const usedRange = sheet.getUsedRange();
  const values = usedRange.values;
  const rowCount = values.length;
  const enrichedRows = values.slice(1).map((row, rowIndex) => {
    const name = row[nameColumnIndex];
    const profile = profilesByName.get(normalizeName(name));
    if (!profile) throw new Error(`No catalog profile found for ${sheetName}!B${rowIndex + 2}: ${name}`);
    const intensity = String(profile.intensity || "").trim();
    const notes = formatNotes(profile);
    if (!intensity || !notes) throw new Error(`Incomplete catalog profile for ${name}`);
    return [intensity, notes];
  });

  sheet.getRange("C1").copyTo(sheet.getRange("D1"), "all");
  sheet.getRange("B1").copyTo(sheet.getRange("E1"), "all");
  sheet.getRange("D1:E1").values = [["INTENSITAS", "NOTES"]];

  sheet.getRange(`C2:C${rowCount}`).copyTo(sheet.getRange(`D2:D${rowCount}`), "all");
  sheet.getRange(`B2:B${rowCount}`).copyTo(sheet.getRange(`E2:E${rowCount}`), "all");
  sheet.getRange(`D2:E${rowCount}`).values = enrichedRows;

  sheet.getRange("D1:E1").format = {
    font: { bold: true },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "medium", color: "#000000" },
  };
  sheet.getRange(`D2:D${rowCount}`).format.borders = { preset: "all", style: "medium", color: "#000000" };
  sheet.getRange(`E2:E${rowCount}`).format.borders = { preset: "all", style: "medium", color: "#000000" };
  sheet.getRange(`D1:D${rowCount}`).format.columnWidth = 16;
  sheet.getRange(`E1:E${rowCount}`).format.columnWidth = 72;
  sheet.getRange(`D1:E${rowCount}`).format.wrapText = true;
  sheet.getRange(`D2:D${rowCount}`).format.horizontalAlignment = "center";
  sheet.getRange(`D1:E${rowCount}`).format.autofitRows();
  sheet.freezePanes.freezeRows(1);

  summaries.push({ sheetName, rows: enrichedRows.length });
}

const ordinaryCheck = await workbook.inspect({
  kind: "table",
  range: "Parfum Umum!A1:E8",
  include: "values,formulas",
  tableMaxRows: 8,
  tableMaxCols: 5,
});
const arabicCheck = await workbook.inspect({
  kind: "table",
  range: "Parfum Arab!A1:E8",
  include: "values,formulas",
  tableMaxRows: 8,
  tableMaxCols: 5,
});
const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});

await fs.mkdir(previewDir, { recursive: true });
for (const { sheetName } of sheetConfigs) {
  const preview = await workbook.render({
    sheetName,
    range: sheetName === "Parfum Umum" ? "A1:E18" : "A1:E41",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(`${previewDir}/${sheetName.replaceAll(" ", "_")}_final.png`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({
  outputPath,
  summaries,
  ordinaryCheck: ordinaryCheck.ndjson,
  arabicCheck: arabicCheck.ndjson,
  formulaErrors: formulaErrors.ndjson,
}, null, 2));
