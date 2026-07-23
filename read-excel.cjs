const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'assets', 'Data Bibit Botol Ela Parfum.xlsx');
try {
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  console.log("Sheets:", sheetNames);
  
  for (const sheet of sheetNames) {
    if (sheet.toLowerCase().includes('botol')) continue;
    console.log(`\n--- Sheet: ${sheet} ---`);
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
    console.log(data);
  }
} catch (e) {
  console.error("Error reading excel:", e.message);
}
