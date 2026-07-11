const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envLocal = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envLocal.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Applying ALTER TABLE orders ADD COLUMN payment_proof TEXT");
  const res1 = await supabase.rpc('exec_sql', {
    query: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof TEXT;"
  });
  console.log(res1);

  console.log("Applying ALTER TABLE custom_requests ADD COLUMN payment_proof TEXT");
  const res2 = await supabase.rpc('exec_sql', {
    query: "ALTER TABLE custom_requests ADD COLUMN IF NOT EXISTS payment_proof TEXT;"
  });
  console.log(res2);
}

run();
