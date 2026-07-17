require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');
const xlsx = require('xlsx');

// 1. Setup Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 2. Setup AI
let apiKeys = [];
let availableModels = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite'
];
let currentKeyIndex = 0;
let currentModelIndex = 0;
let ai;

const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envKeys = envContent.split('\n')
    .filter(line => line.startsWith('GEMINI_API_KEY='))
    .map(line => line.replace('GEMINI_API_KEY=', '').trim());
  
  const workbookLimit = xlsx.readFile('../AI Limitation.xlsx');
  const apiKeySheet = workbookLimit.Sheets['API Key List'];
  const rawKeys = xlsx.utils.sheet_to_json(apiKeySheet, { header: 1 });
  apiKeys = rawKeys.flat().filter(k => k && typeof k === 'string' && k.startsWith('AQ.'));
  
  // Gabungkan keys dari .env.local dan Excel, hilangkan duplikat
  apiKeys = [...new Set([...envKeys, ...apiKeys])];
  
  if (apiKeys.length === 0) throw new Error("No keys found");
  console.log(`Loaded ${apiKeys.length} API keys unik dari .env.local dan Excel.`);
  console.log(`Key 0 adalah: ${apiKeys[0]}`);
} catch (e) {
  console.log("Gagal membaca kunci:", e.message);
  apiKeys = [process.env.GEMINI_API_KEY];
  console.log(`Key 0 (fallback) adalah: ${apiKeys[0]}`);
}
ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });

async function getAIProfile(name) {
  const prompt = `Berikan informasi faktual mengenai wangi parfum bernama "${name}". 
Berikan penjelasan mendetail namun ringkas dalam Bahasa Indonesia mengenai aromanya.
Tentukan Intensitas (Sillage/Projection) keseluruhan wangi: "Strong", "Medium", atau "Soft".
Untuk setiap Note (Top, Middle, Base), berikan aroma dan kategorikan intensitas masing-masing: "Strong", "Medium", atau "Soft".

Tulis output HANYA berupa JSON murni dengan format berikut:
\`\`\`json
{
  "description": "Deskripsi singkat dan faktual mengenai aroma ini...",
  "intensity": "Strong",
  "top_notes": [{"name": "Nama aroma (misal Citrus)", "intensity": "Strong"}],
  "middle_notes": [{"name": "Nama aroma (misal Jasmine)", "intensity": "Medium"}],
  "base_notes": [{"name": "Nama aroma (misal Musk)", "intensity": "Soft"}]
}
\`\`\`
Jangan menulis teks apapun selain blok JSON di atas.`;

  let retryCount = 0;
  
  while (true) {
    if (retryCount > 100) {
      console.log(`[Peringatan] Sudah mencoba 100 kali untuk ${name}, istirahat 30 detik...`);
      await new Promise(r => setTimeout(r, 30000));
      retryCount = 0; // Reset count and try again
    }
    
    if (currentModelIndex >= availableModels.length) {
      currentKeyIndex++;
      currentModelIndex = 0;
      if (currentKeyIndex >= apiKeys.length) {
        currentKeyIndex = 0;
        console.log(`[Wait] Loop key habis, tunggu 60 detik untuk reset limit...`);
        await new Promise(r => setTimeout(r, 60000));
      }
      console.log(`[Switch Key] Pindah ke Key Index ${currentKeyIndex}.`);
      ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
      continue;
    }

    const model = availableModels[currentModelIndex];
    try {
      console.log(`Mencoba model ${model} dengan key ${currentKeyIndex}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          temperature: 0.1
        }
      });
      
      let text = response.text;
      let jsonStr = text;
      if (text.includes('\`\`\`json')) {
        jsonStr = text.split('\`\`\`json')[1].split('\`\`\`')[0].trim();
      } else if (text.includes('\`\`\`')) {
        jsonStr = text.split('\`\`\`')[1].split('\`\`\`')[0].trim();
      }
      return JSON.parse(jsonStr);

    } catch (error) {
      retryCount++;
      console.error(`[Error API ${model}]:`, error.message);
      
      if (error.message.includes('503') || error.message.includes('high demand') || error.message.includes('UNAVAILABLE')) {
        console.log(`[503 High Demand] Menunggu 15 detik sebelum mencoba lagi...`);
        await new Promise(r => setTimeout(r, 15000));
        continue; // Retry dengan model dan key yang sama
      }
      
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
        currentModelIndex++;
        continue;
      } else if (error.message.includes('404') || error.message.includes('unsupported') || error.message.includes('not found')) {
        currentModelIndex++;
        continue;
      }
      
      // Tunggu bentar sebelum retry
      await new Promise(r => setTimeout(r, 2000));
      currentModelIndex++;
    }
  }
}

async function run() {
  console.log("Mengambil data bibit...");
  const { data: bibits, error } = await supabase.from('bibit').select('id, name, top_notes, intensity').order('id', { ascending: true });
  if (error) {
    console.error("Gagal ambil bibit:", error.message);
    return;
  }

  const toUpdate = bibits; // Proses semuanya seperti permintaan user


  console.log(`Ditemukan ${toUpdate.length} bibit untuk diperbaiki.`);

  const maxProcess = toUpdate.length;
  for (let i = 0; i < maxProcess; i++) {
    const bibit = toUpdate[i];
    console.log(`\n[${i+1}/${maxProcess}] Memperbaiki: ${bibit.name}`);
    
    let profile = await getAIProfile(bibit.name);
    
    if (profile) {
      const { error: updateError } = await supabase
        .from('bibit')
        .update({
          description: profile.description,
          intensity: profile.intensity,
          top_notes: profile.top_notes || [],
          middle_notes: profile.middle_notes || [],
          base_notes: profile.base_notes || []
        })
        .eq('id', bibit.id);

      if (updateError) {
        console.error(`[Gagal Update DB] ${bibit.name}:`, updateError.message);
      } else {
        console.log(`[Sukses] Diperbarui ${bibit.name} (Intensitas: ${profile.intensity}, Top: ${profile.top_notes?.length||0}, Mid: ${profile.middle_notes?.length||0}, Base: ${profile.base_notes?.length||0} notes)`);
      }
    } else {
      console.log(`[Gagal AI] Dilewati ${bibit.name}.`);
    }

    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log("Selesai testing!");
}

run();
