import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() { 
  const {data, error} = await s.from('bibit').select('id, name, top_notes, middle_notes, base_notes').limit(5); 
  console.log(JSON.stringify(data, null, 2)); 
}
run();
