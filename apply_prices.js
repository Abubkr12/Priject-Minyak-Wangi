const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runUpdates() {
  const sql = fs.readFileSync('update_bibit_prices.sql', 'utf8');
  const lines = sql.split('\n');
  
  let count = 0;
  for (const line of lines) {
    if (line.trim().startsWith('UPDATE')) {
      // e.g. UPDATE bibit SET price_per_ml = 2000 WHERE name ILIKE '%5th AVENUE%';
      const match = line.match(/UPDATE bibit SET price_per_ml = (\d+) WHERE name ILIKE '%(.*)%';/);
      if (match) {
        const price = parseInt(match[1]);
        const namePart = match[2];
        const { error } = await supabase
          .from('bibit')
          .update({ price_per_ml: price })
          .ilike('name', `%${namePart}%`);
          
        if (error) {
          console.error(`Error updating ${namePart}:`, error);
        } else {
          count++;
          if (count % 50 === 0) console.log(`Updated ${count} items...`);
        }
      }
    }
  }
  console.log(`Finished updating ${count} items.`);
}

runUpdates().catch(console.error);
