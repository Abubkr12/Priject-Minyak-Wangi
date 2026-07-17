import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function resetAll() { 
  console.log('Resetting all notes in bibit table to empty JSON arrays to force re-verification...');
  const { error } = await s.from('bibit').update({ top_notes: [], middle_notes: [], base_notes: [] }).neq('id', 0); 
  if (error) {
    console.error('Failed to reset:', error);
  } else {
    console.log('Successfully reset all perfumes!');
  }
}
resetAll();
