const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const workbook = xlsx.readFile('C:\\Users\\Abu Bakar Al Adny\\OneDrive\\Dokumen\\Project Web\\AI Limitation.xlsx');
  const sheet = workbook.Sheets['API Key List'];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  // Clear existing
  await supabase.from('ai_api_keys').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
  
  const keysToInsert = [];
  for (const row of data) {
    if (row[0] && typeof row[0] === 'string' && row[0].startsWith('AQ.')) {
      keysToInsert.push({ api_key: row[0].trim() });
    }
  }
  
  console.log(`Inserting ${keysToInsert.length} keys to Supabase...`);
  if (keysToInsert.length > 0) {
    const { error } = await supabase.from('ai_api_keys').insert(keysToInsert);
    if (error) console.error('Insert Error:', error);
    else console.log('Successfully inserted API keys into Supabase!');
  }
}

run();
