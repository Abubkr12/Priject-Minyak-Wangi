const xlsx = require('xlsx');

const workbook = xlsx.readFile('C:\\Users\\Abu Bakar Al Adny\\OneDrive\\Dokumen\\Project Web\\AI Limitation.xlsx');
console.log('Sheet Names API Key:', workbook.SheetNames);
for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`\nSheet: ${sheetName}`);
  console.log(data.slice(0, 8));
}
