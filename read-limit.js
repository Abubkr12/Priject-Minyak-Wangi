const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('C:\\Users\\Abu Bakar Al Adny\\OneDrive\\Dokumen\\Project Web\\AI Limitation.xlsx');
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log(data);
  });
} catch (err) {
  console.error("Error reading excel file:", err.message);
}
