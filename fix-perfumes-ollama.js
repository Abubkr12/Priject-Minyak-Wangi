const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3.1'; // Ganti ke gemma2 atau mistral sesuai yang didownload

async function getOllamaProfile(perfumeName) {
  const prompt = `You are a perfume expert. Provide the description, notes, and intensity for the perfume "${perfumeName}".
Respond ONLY with a strict JSON format exactly like this:
{
  "description": "[A brief description in Indonesian]",
  "intensity": "[Strong / Medium / Soft]",
  "top_notes": [{"name": "[note name]", "intensity": "[Strong/Medium/Soft]"}],
  "middle_notes": [{"name": "[note name]", "intensity": "[Strong/Medium/Soft]"}],
  "base_notes": [{"name": "[note name]", "intensity": "[Strong/Medium/Soft]"}]
}
Do not include markdown blocks, explanations, or any other text. Just the JSON object.`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        format: 'json' // Memaksa Ollama merespon dalam bentuk JSON
      })
    });

    if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);
    
    const data = await response.json();
    const resultJson = JSON.parse(data.response);
    
    return {
      description: resultJson.description,
      intensity: resultJson.intensity,
      top_notes: resultJson.top_notes || [],
      middle_notes: resultJson.middle_notes || [],
      base_notes: resultJson.base_notes || []
    };
  } catch (error) {
    console.error(`[Error parsing Ollama response for ${perfumeName}]:`, error.message);
    return null;
  }
}

async function run() {
  console.log('Mengambil data bibit dari Supabase...');
  const { data: bibitList, error: fetchError } = await supabase
    .from('bibit')
    .select('id, name, top_notes, intensity');

  if (fetchError) {
    console.error('Gagal mengambil data:', fetchError.message);
    return;
  }

  const toUpdate = bibitList.filter(b => {
    if (!b.intensity) return true;
    if (b.top_notes && Array.isArray(b.top_notes) && b.top_notes.length > 0) {
      if (b.top_notes[0].note || b.top_notes[0].character) return true;
    } else {
      return true;
    }
    return false;
  });

  console.log(`Ditemukan ${toUpdate.length} bibit untuk diperbaiki via Ollama.`);

  for (let i = 0; i < toUpdate.length; i++) {
    const item = toUpdate[i];
    console.log(`\n[${i + 1}/${toUpdate.length}] Memperbaiki: ${item.name}`);
    
    let retryCount = 0;
    let success = false;
    
    while (retryCount < 3 && !success) {
      try {
        const aiData = await getOllamaProfile(item.name);
        
        if (aiData) {
          const { error: updateError } = await supabase
            .from('bibit')
            .update({
              description: aiData.description,
              intensity: aiData.intensity,
              top_notes: aiData.top_notes,
              middle_notes: aiData.middle_notes,
              base_notes: aiData.base_notes
            })
            .eq('id', item.id);

          if (updateError) {
            console.error(`[Gagal Update DB ${item.name}]:`, updateError.message);
          } else {
            console.log(`[Sukses] ${item.name} -> Intensitas: ${aiData.intensity}`);
            success = true;
          }
        }
      } catch (error) {
        retryCount++;
        console.error(`[Error eksekusi Ollama]:`, error.message);
      }
      
      if (!success) {
        console.log(`Gagal, mencoba ulang (${retryCount}/3)...`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    // Nggak perlu delay panjang karena berjalan di lokal (Ollama nggak punya limit)
    // Tapi kasih 100ms biar CPU nggak meledak 100% terus-terusan
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log('\n✅ Proses perbaikan dengan Ollama selesai.');
}

run();
