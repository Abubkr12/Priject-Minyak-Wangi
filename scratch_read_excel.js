const xlsx = require('xlsx');

const workbook = xlsx.readFile('./public/assets/Data Bibit Botol Ela parfum.xlsx');
console.log('Sheets:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet).slice(0, 5); // first 5 rows
  console.log(`\n=== Sheet: ${sheetName} ===`);
  console.log(JSON.stringify(data, null, 2));
});
