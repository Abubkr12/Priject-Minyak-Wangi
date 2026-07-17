require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.rpc('get_tables'); // Or a generic query if rpc doesn't exist
  if (error) {
    // try to get from information_schema if possible, but PostgREST doesn't expose it by default
    console.log("Error running rpc:", error.message);
  } else {
    console.log(data);
  }
}
check();
