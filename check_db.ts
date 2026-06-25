import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const supabaseKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1];

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function main() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) console.error(error);
  else console.log(Object.keys(data[0] || {}));
}
main();
