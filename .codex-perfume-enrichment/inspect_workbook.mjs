import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const sourcePath = process.argv[2];
const outputDir = process.argv[3];

if (!sourcePath || !outputDir) {
  throw new Error("Usage: node inspect_workbook.mjs <source.xlsx> <output-dir>");
}

await fs.mkdir(outputDir, { recursive: true });
const input = await FileBlob.load(sourcePath);
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 8,
  tableMaxCols: 12,
  tableMaxCellChars: 140,
});
console.log(summary.ndjson);

const sheetInfo = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 3000 });
console.log("--- SHEETS ---");
console.log(sheetInfo.ndjson);

for (const sheetName of ["Parfum Umum", "Parfum Arab"]) {
  const region = await workbook.inspect({
    kind: "region,computedStyle",
    sheetId: sheetName,
    range: "A1:Z16",
    maxChars: 12000,
  });
  console.log(`--- ${sheetName} REGION ---`);
  console.log(region.ndjson);

  const preview = await workbook.render({
    sheetName,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(`${outputDir}/${sheetName.replaceAll(" ", "_")}.png`, new Uint8Array(await preview.arrayBuffer()));
}
