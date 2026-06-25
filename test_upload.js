const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUpload() {
  const { data, error } = await supabase.storage.from('products').upload('test.txt', 'Hello World', {
    upsert: true
  });
  console.log('Upload Result:', data, error);
}

testUpload();
