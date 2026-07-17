require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');
const xlsx = require('xlsx');
const fs = require('fs');

// 1. Setup Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 2. Setup AI
let apiKeys = [];
let availableModels = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite'
];
let currentKeyIndex = 0;
let currentModelIndex = 0;
let ai;

try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const envKeys = envContent.split('\n')
    .filter(line => line.startsWith('GEMINI_API_KEY='))
    .map(line => line.replace('GEMINI_API_KEY=', '').trim());
  
  const workbookLimit = xlsx.readFile('../AI Limitation.xlsx');
  const apiKeySheet = workbookLimit.Sheets['API Key List'];
  const rawKeys = xlsx.utils.sheet_to_json(apiKeySheet, { header: 1 });
  apiKeys = rawKeys.flat().filter(k => k && typeof k === 'string' && k.startsWith('AQ.'));
  
  apiKeys = [...new Set([...envKeys, ...apiKeys])];
  if (apiKeys.length === 0) throw new Error("No keys found");
  console.log(`Loaded ${apiKeys.length} API keys untuk verifikasi.`);
} catch (e) {
  apiKeys = [process.env.GEMINI_API_KEY];
}
ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });

// Tracker file to remember which ones are verified so we can resume if killed
const trackerFile = 'verified-tracker.json';
let verifiedIds = [];
if (fs.existsSync(trackerFile)) {
  verifiedIds = JSON.parse(fs.readFileSync(trackerFile, 'utf-8'));
}

async function verifyAIProfile(bibit) {
  const prompt = `Lakukan pencarian internet (grounding) mengenai wangi parfum bernama "${bibit.name}".
Data saat ini:
- Deskripsi: ${bibit.description}
- Intensitas: ${bibit.intensity}
- Top Notes: ${JSON.stringify(bibit.top_notes)}
- Middle Notes: ${JSON.stringify(bibit.middle_notes)}
- Base Notes: ${JSON.stringify(bibit.base_notes)}

Tugas Anda:
1. Verifikasi apakah profil aroma di atas sudah akurat (Faktual) berdasarkan pencarian Google.
2. Jika SUDAH akurat, tulis JSON HANYA: {"is_correct": true}
3. Jika ADA YANG SALAH/KURANG AKURAT, tulis JSON perbaikannya HANYA dengan format:
\`\`\`json
{
  "is_correct": false,
  "description": "Deskripsi yang diperbaiki...",
  "intensity": "Strong/Medium/Soft",
  "top_notes": [{"name": "Aroma", "intensity": "Strong/Medium/Soft"}],
  "middle_notes": [{"name": "Aroma", "intensity": "Strong/Medium/Soft"}],
  "base_notes": [{"name": "Aroma", "intensity": "Strong/Medium/Soft"}]
}
\`\`\`
Jangan menulis teks apapun selain JSON murni.`;

  let retryCount = 0;
  
  while (true) {
    if (retryCount > 100) {
      console.log(`[Peringatan] Sudah mencoba 100 kali untuk ${bibit.name}, istirahat 5 menit...`);
      await new Promise(r => setTimeout(r, 300000));
      retryCount = 0;
    }
    
    if (currentModelIndex >= availableModels.length) {
      currentKeyIndex++;
      currentModelIndex = 0;
      if (currentKeyIndex >= apiKeys.length) {
        currentKeyIndex = 0;
        console.log(`[Wait] Loop key habis, tunggu 2 menit untuk reset limit Grounding...`);
        await new Promise(r => setTimeout(r, 120000));
      }
      ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
      continue;
    }

    const model = availableModels[currentModelIndex];
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          temperature: 0.1,
          tools: [{ googleSearch: {} }]
        }
      });
      
      let text = response.text;
      let jsonStr = text;
      if (text.includes('```json')) {
        jsonStr = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonStr = text.split('```')[1].split('```')[0].trim();
      }
      return JSON.parse(jsonStr);

    } catch (error) {
      retryCount++;
      const msg = error.message;
      
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
      
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        // Karena grounding cepat kena limit, pindah model/key
        currentModelIndex++;
        continue;
      }
      
      await new Promise(r => setTimeout(r, 5000));
      currentModelIndex++;
    }
  }
}

async function run() {
  console.log("Mengambil data bibit untuk VERIFIKASI GROUNDING...");
  const { data: bibits, error } = await supabase.from('bibit').select('*').order('id', { ascending: true });
  if (error) {
    console.error("Gagal ambil bibit:", error.message);
    return;
  }

  const toVerify = bibits.filter(b => !verifiedIds.includes(b.id));
  console.log(`Ditemukan ${toVerify.length} bibit yang belum terverifikasi.`);

  const maxProcess = toVerify.length;
  for (let i = 0; i < maxProcess; i++) {
    const bibit = toVerify[i];
    console.log(`\n[${i+1}/${maxProcess}] Memverifikasi (Grounding): ${bibit.name}`);
    
    let result = await verifyAIProfile(bibit);
    
    if (result) {
      if (result.is_correct) {
        console.log(`[Valid] Data ${bibit.name} sudah akurat. (Skip update)`);
      } else {
        const { error: updateError } = await supabase
          .from('bibit')
          .update({
            description: result.description,
            intensity: result.intensity,
            top_notes: result.top_notes || [],
            middle_notes: result.middle_notes || [],
            base_notes: result.base_notes || []
          })
          .eq('id', bibit.id);

        if (updateError) {
          console.error(`[Gagal Update Verifikasi] ${bibit.name}:`, updateError.message);
          continue; // Jangan tandai verified kalau gagal ke db
        } else {
          console.log(`[Sukses Diperbaiki] Data ${bibit.name} dikoreksi. (Top: ${result.top_notes?.length||0}, Mid: ${result.middle_notes?.length||0}, Base: ${result.base_notes?.length||0})`);
        }
      }
      
      // Simpan ke tracker biar ga diulang
      verifiedIds.push(bibit.id);
      fs.writeFileSync(trackerFile, JSON.stringify(verifiedIds));
    }

    // Eksekusi "tidak barbar" - delay 15 detik antar request untuk hemat Grounding Quota
    await new Promise(r => setTimeout(r, 15000));
  }
  
  console.log("Selesai Verifikasi Grounding!");
}

run();
