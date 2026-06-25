const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = 'C:\\Users\\Abu Bakar Al Adny\\Downloads\\Compressed\\wilayah-2025.7\\wilayah-2025.7\\db\\wilayah.sql';
const content = fs.readFileSync(filePath, 'utf-8');

const regex = /\('([^']+)',\s*'([^']+)'\)/g;
let match;
const records = [];

while ((match = regex.exec(content)) !== null) {
  records.push({ kode: match[1], nama: match[2].replace(/''/g, "'") });
}

console.log(`Found ${records.length} records. Starting injection in batches of 2000...`);

async function run() {
  const BATCH_SIZE = 2000;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('wilayah').upsert(batch, { onConflict: 'kode' });
    if (error) {
      console.error(`Error at batch ${i}:`, error.message);
    } else {
      console.log(`Inserted batch ${i} to ${i + batch.length}`);
    }
  }
  console.log('Injection complete!');
}

run();
