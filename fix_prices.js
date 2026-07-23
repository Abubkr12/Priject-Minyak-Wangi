const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function normalizeStr(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

async function fixPrices() {
  console.log('Reading Excel...');
  const workbook = xlsx.readFile('public/assets/Data Bibit Botol Ela Parfum.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const excelMap = new Map();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row && row[1] && row[2]) {
      const name = row[1].toString().trim();
      const price = parseFloat(row[2]);
      excelMap.set(normalizeStr(name), price);
    }
  }

  console.log('Fetching DB items...');
  const { data: dbBibit, error } = await supabase.from('bibit').select('id, name, price_per_ml');
  
  if (error) {
    console.error('Error fetching DB:', error);
    return;
  }

  let updated = 0;
  for (const item of dbBibit) {
    const normDbName = normalizeStr(item.name);
    
    // Find best match in Excel
    let targetPrice = excelMap.get(normDbName);
    
    // If not exact match, try finding if excel name is in db name or vice versa
    if (!targetPrice) {
      for (const [exName, exPrice] of excelMap.entries()) {
        if (normDbName === exName) {
           targetPrice = exPrice;
           break;
        }
      }
      
      // Still no? fallback to partial match but exact words if possible
      if (!targetPrice) {
         for (const [exName, exPrice] of excelMap.entries()) {
           if (normDbName.includes(exName) || exName.includes(normDbName)) {
             // to avoid "SILVER" overriding "AFNAN SILVER", we only accept if lengths are close
             if (Math.abs(normDbName.length - exName.length) < 5) {
               targetPrice = exPrice;
               break;
             }
           }
         }
      }
    }
    
    if (targetPrice && targetPrice !== item.price_per_ml) {
       console.log(`Fixing ${item.name}: ${item.price_per_ml} -> ${targetPrice}`);
       await supabase.from('bibit').update({ price_per_ml: targetPrice }).eq('id', item.id);
       updated++;
    }
  }
  
  console.log(`Fixed ${updated} items.`);
}

fixPrices().catch(console.error);
