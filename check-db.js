require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('bibit').select('name, intensity, top_notes, middle_notes, base_notes').eq('name', 'ADIDAS ENERGIZE');
  console.log(JSON.stringify(data, null, 2));
}
check();
