import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const newBotolData = [
  { name: 'CASA 20ML', capacity_ml: 20, price: 10000, is_active: true },
  { name: 'CASA 30ML', capacity_ml: 30, price: 10000, is_active: true },
  { name: 'LE LABO 30ML', capacity_ml: 30, price: 10000, is_active: true },
  { name: 'D\'HERMES 30ML', capacity_ml: 30, price: 10000, is_active: true },
  { name: 'CASA 50ML', capacity_ml: 50, price: 10000, is_active: true },
  { name: 'JO MALONE 50ML', capacity_ml: 50, price: 10000, is_active: true },
  { name: 'XX/POT 50ML', capacity_ml: 50, price: 10000, is_active: true },
  { name: 'GEMOY 60ML', capacity_ml: 60, price: 10000, is_active: true },
  { name: 'KOTAK BINTIK 100ML', capacity_ml: 100, price: 10000, is_active: true },
  { name: 'SPRAY 20ML', capacity_ml: 20, price: 2500, is_active: true },
  { name: 'SPRAY 25ML', capacity_ml: 25, price: 2500, is_active: true },
  { name: 'SPRAY 40ML', capacity_ml: 40, price: 2500, is_active: true },
  { name: 'SPRAY 60ML', capacity_ml: 60, price: 3000, is_active: true },
  { name: 'SPRAY 100ML', capacity_ml: 100, price: 3000, is_active: true },
  { name: 'TOLA 3ML', capacity_ml: 3, price: 2000, is_active: true },
  { name: 'TOLA 6ML', capacity_ml: 6, price: 2000, is_active: true },
  { name: 'TOLA 12ML', capacity_ml: 12, price: 2000, is_active: true },
  { name: 'WAJIK 7ML', capacity_ml: 7, price: 2500, is_active: true },
  { name: 'ULIR 10ML', capacity_ml: 10, price: 2500, is_active: true }
];

async function run() {
  console.log('Deleting old botol data...');
  const { error: delErr } = await supabase.from('bottles').delete().neq('id', 0);
  if (delErr) {
    console.error('Delete error:', delErr);
    return;
  }
  
  console.log('Inserting new botol data...');
  const { data, error: insErr } = await supabase.from('bottles').insert(newBotolData);
  if (insErr) {
    console.error('Insert error:', insErr);
  } else {
    console.log('Successfully updated botol data!');
  }
}

run();
