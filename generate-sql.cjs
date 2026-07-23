const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'public', 'assets', 'Data Bibit Botol Ela Parfum.xlsx');
let sql = `ALTER TABLE bibit ADD COLUMN IF NOT EXISTS price_per_ml INT DEFAULT 1500;\n\n`;

try {
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  
  for (const sheet of sheetNames) {
    if (sheet.toLowerCase().includes('botol')) continue;
    
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);
    
    for (const row of data) {
      const name = row['NAMA PARFUM'] || row['NAMA PARFUM ARAB'];
      const price = row['HARGA PERMILI'];
      
      if (name && price) {
        // Escape single quotes in names
        const safeName = name.toString().trim().replace(/'/g, "''");
        sql += `UPDATE bibit SET price_per_ml = ${price} WHERE name ILIKE '%${safeName}%';\n`;
      }
    }
  }
  
  fs.writeFileSync('update_bibit_prices.sql', sql);
  console.log("SQL file generated: update_bibit_prices.sql");
} catch (e) {
  console.error("Error reading excel:", e.message);
}
