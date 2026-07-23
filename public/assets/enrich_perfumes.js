const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const xlsx = require('xlsx');

// Load API Keys from .env.local
const envFile = fs.readFileSync('C:/Users/Abu Bakar Al Adny/OneDrive/Dokumen/Project Web/Minyak Wangi/.env.local', 'utf-8');
const apiKeys = [...envFile.matchAll(/GEMINI_API_KEY=(.+)/g)].map(m => m[1].trim());

if (apiKeys.length === 0) {
  console.error("No API keys found in .env.local");
  process.exit(1);
}

let currentKeyIndex = 0;
let ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });

async function generateWithRetry(prompt) {
  while (currentKeyIndex < apiKeys.length) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite', // Switch to gemini-3.5-flash when 503 clears
        contents: prompt,
        config: {
          // Search Grounding active
          tools: [{ googleSearch: {} }],
          temperature: 0.1,
          systemInstruction: 'Anda ahli parfum. Kembalikan array JSON berisi objek dengan properti "NAMA", "INTENSITAS", dan "NOTES". Hanya JSON mentah, tanpa markdown.'
        }
      });
      return response.text;
    } catch (e) {
      if (e.status === 429 || e.status === 503) {
        console.log(`Key ${currentKeyIndex + 1} hit ${e.status}, switching...`);
        currentKeyIndex++;
        if (currentKeyIndex < apiKeys.length) {
          ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
        }
      } else {
        throw e;
      }
    }
  }
  throw new Error('All API keys exhausted.');
}

async function run() {
  const excelPath = 'C:/Users/Abu Bakar Al Adny/OneDrive/Dokumen/Project Web/Minyak Wangi/public/assets/Data Bibit Botol Ela parfum.xlsx';
  const wb = xlsx.readFile(excelPath);
  
  for (const sheetName of ['Parfum Umum', 'Parfum Arab']) {
    if (!wb.Sheets[sheetName]) continue;
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
    const batchSize = 25;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      // Skip if already has Intesitas and Notes
      if (batch.every(row => row['Intensitas'] && row['Notes'])) continue;

      const nameKey = sheetName === 'Parfum Arab' ? 'NAMA PARFUM ARAB' : 'NAMA PARFUM';
      const names = batch.map(r => r[nameKey]).filter(Boolean);
      if (names.length === 0) continue;

      const prompt = `Carikan intensitas (Soft, Medium, Strong) dan notes utama (Floral, Citrus, Woody dll) untuk parfum berikut:\n${names.join('\n')}\nFormat: [{"NAMA": "...", "INTENSITAS": "...", "NOTES": "..."}]`;
      
      console.log(`Processing ${sheetName} batch ${Math.floor(i / batchSize) + 1}...`);
      try {
        const result = await generateWithRetry(prompt);
        const parsed = JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
        
        parsed.forEach(res => {
          const row = batch.find(r => (r[nameKey] || '').toString().toLowerCase() === (res.NAMA || '').toString().toLowerCase());
          if (row) {
            row['Intensitas'] = res.INTENSITAS;
            row['Notes'] = res.NOTES;
          }
        });
        
        wb.Sheets[sheetName] = xlsx.utils.json_to_sheet(data);
        xlsx.writeFile(wb, excelPath);
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.error(`Batch failed: ${e.message}`);
        break;
      }
    }
  }
  console.log('Finished.');
}

run();
