const xlsx = require('xlsx');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDuplicatesAndPrices() {
  const workbook = xlsx.readFile('public/assets/Data Bibit Botol Ela Parfum.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let excelBibit = [];
  let currentCategory = '';
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (row.length === 1 && typeof row[0] === 'string') {
      currentCategory = row[0];
      continue;
    }
    const name = row[1];
    const price = row[2];
    if (name && price) {
      excelBibit.push({ name: name.toString().trim(), price: parseFloat(price) });
    }
  }

  // Check Excel for duplicates
  const nameMap = new Map();
  const duplicates = [];
  for (const item of excelBibit) {
    if (nameMap.has(item.name)) {
      const existing = nameMap.get(item.name);
      if (existing.price !== item.price) {
        duplicates.push(`Name: "${item.name}" has conflicting prices: ${existing.price} vs ${item.price}`);
      }
    } else {
      nameMap.set(item.name, item);
    }
  }
  console.log('--- EXCEL DUPLICATES WITH DIFFERENT PRICES ---');
  if (duplicates.length === 0) console.log('None found!');
  else duplicates.forEach(d => console.log(d));

  // Check DB for missing or incorrect prices
  console.log('\n--- FETCHING DB TO VERIFY PRICES ---');
  const { data: dbBibit, error } = await supabase.from('bibit').select('id, name, price_per_ml');
  if (error) {
    console.error('Error fetching DB:', error);
    return;
  }

  let priceMismatches = 0;
  let missingPrices = 0;

  for (const dbItem of dbBibit) {
    if (!dbItem.price_per_ml) {
      console.log(`Missing price in DB for: ${dbItem.name}`);
      missingPrices++;
      continue;
    }

    // find matching item in excel
    let matched = null;
    for (const exItem of excelBibit) {
      if (dbItem.name.toUpperCase().includes(exItem.name.toUpperCase())) {
        matched = exItem;
        break;
      }
    }
    
    if (matched && matched.price !== dbItem.price_per_ml) {
      console.log(`Mismatch for ${dbItem.name}: DB price = ${dbItem.price_per_ml}, Excel price = ${matched.price}`);
      priceMismatches++;
    } else if (!matched) {
      // some might be normalized in DB. E.g. 5th AVENUE
      // Let's do a loose search
      let looseMatched = null;
      for (const exItem of excelBibit) {
        // remove symbols
        const cleanDb = dbItem.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const cleanEx = exItem.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (cleanDb.includes(cleanEx) || cleanEx.includes(cleanDb)) {
          looseMatched = exItem;
          break;
        }
      }
      if (looseMatched && looseMatched.price !== dbItem.price_per_ml) {
        console.log(`Mismatch (loose) for ${dbItem.name}: DB price = ${dbItem.price_per_ml}, Excel price = ${looseMatched.price}`);
        priceMismatches++;
      } else if (!looseMatched && dbItem.price_per_ml === 1500) {
        // 1500 is default, might not have matched anything
      }
    }
  }
  console.log(`\nVerification Complete: ${priceMismatches} mismatches, ${missingPrices} missing prices.`);
}

checkDuplicatesAndPrices().catch(console.error);
