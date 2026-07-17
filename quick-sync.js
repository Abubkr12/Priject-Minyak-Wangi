require('dotenv').config({ path: '.env.local' });
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const workbook = xlsx.readFile('./public/assets/Data Bibit Botol Ela parfum.xlsx');
  
  // 1. Botol
  const bottleSheet = workbook.Sheets['Jenis Botol & Harga'];
  const bottlesRaw = xlsx.utils.sheet_to_json(bottleSheet);
  const bottleSizes = bottlesRaw.map(b => ({
    size: parseInt(b['Ukuran'].replace('ml', '')),
    label: b['Ukuran'],
    price: b['HARGA PERBOTOL'] * 1000
  })).filter(b => !isNaN(b.size));

  const uniqueBottles = [];
  const map = new Map();
  for (const item of bottleSizes) {
      if(!map.has(item.size)){
          map.set(item.size, true);
          uniqueBottles.push({ size_ml: item.size, size_label: item.label, bottle_price: item.price });
      }
  }

  console.log('Inserting bottles...');
  for (const bottle of uniqueBottles) {
    const name = `Botol ${bottle.size_label}`;
    const { data: existing } = await supabase.from('bottles').select('id').eq('name', name).maybeSingle();
    let bError;
    if (existing) {
      const res = await supabase.from('bottles').update({ capacity_ml: bottle.size_ml, price: bottle.bottle_price }).eq('id', existing.id);
      bError = res.error;
    } else {
      const res = await supabase.from('bottles').insert({ name, capacity_ml: bottle.size_ml, price: bottle.bottle_price, stock: 100 });
      bError = res.error;
    }
    if (bError) console.error(bError.message);
  }
  console.log('Bottles inserted.');

  // 2. Arabian Parfumes (Without AI, just raw inserts)
  const arabSheet = workbook.Sheets['Parfum Arab'];
  const arabRows = xlsx.utils.sheet_to_json(arabSheet);
  console.log('Inserting Arabian perfumes...', arabRows.length);
  for(const row of arabRows) {
     const name = row['NAMA PARFUM ARAB'];
     if(!name) continue;
     const slug = name.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
     await supabase.from('bibit').upsert({
        name,
        slug,
        collection: 'Arabian Parfume',
        description: '',
        top_notes: [],
        middle_notes: [],
        base_notes: [],
        is_active: true
     }, { onConflict: 'slug' });
  }
  console.log('Arabian perfumes inserted.');
}
run();
