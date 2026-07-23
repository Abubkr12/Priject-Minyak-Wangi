const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const xlsx = require('xlsx');

// 1. Get API Keys
const envFile = fs.readFileSync('.env.local', 'utf-8');
const apiKeys = [...envFile.matchAll(/GEMINI_API_KEY=(.+)/g)].map(m => m[1].trim());
let currentKeyIndex = 0;
let ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });

async function generateContentWithRetry(prompt) {
  while (currentKeyIndex < apiKeys.length) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.1,
          systemInstruction: 'Anda adalah seorang ahli parfum (fragrance expert). Kembalikan JSON (sebuah Array yang berisi objek dengan properties "NAMA", "INTENSITAS", dan "NOTES"). Pastikan format valid JSON dan jangan gunakan markdown blok (seperti ```json).'
        }
      });
      return response.text;
    } catch (e) {
      if (e.status === 429) {
        console.log(`Key ${currentKeyIndex + 1} quota exceeded, switching...`);
        currentKeyIndex++;
        if (currentKeyIndex < apiKeys.length) {
          ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
        }
      } else {
        throw e;
      }
    }
  }
  throw new Error('All API keys exceeded quota.');
}

// 2. Process Excel
const excelPath = 'C:/Users/Abu Bakar Al Adny/OneDrive/Dokumen/Project Web/Minyak Wangi/public/assets/Data Bibit Botol Ela parfum.xlsx';
const wb = xlsx.readFile(excelPath);

async function processSheet(sheetName) {
  if (!wb.Sheets[sheetName]) return;
  const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
  console.log(`Processing ${sheetName}, Total: ${data.length} rows.`);

  const batchSize = 25;
  let changes = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    // Check if already processed
    if (batch.every(row => row['Intensitas'] && row['Notes'])) {
        console.log(`Batch ${i / batchSize} already processed, skipping.`);
        continue;
    }

    const nameKey = sheetName === 'Parfum Arab' ? 'NAMA PARFUM ARAB' : 'NAMA PARFUM';
    const names = batch.map(r => r[nameKey]);
    
    const prompt = `Carikan informasi intensitas (e.g., Soft, Medium, Strong) dan notes utama (e.g., Floral, Citrus, Woody) untuk daftar parfum berikut. Format JSON array: [{"NAMA": "...", "INTENSITAS": "...", "NOTES": "..."}].\n\nDaftar:\n${names.join('\n')}`;

    console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(data.length / batchSize)}...`);
    
    try {
      const resultStr = await generateContentWithRetry(prompt);
      const cleanStr = resultStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const results = JSON.parse(cleanStr);
      
      results.forEach(res => {
        const row = batch.find(r => (r[nameKey] || '').toString().toLowerCase() === (res.NAMA || '').toString().toLowerCase());
        if (row) {
          row['Intensitas'] = res.INTENSITAS;
          row['Notes'] = res.NOTES;
          changes++;
        }
      });
      console.log(`Batch success! Changes: ${changes}`);
      
      // Save periodically
      const newSheet = xlsx.utils.json_to_sheet(data);
      wb.Sheets[sheetName] = newSheet;
      xlsx.writeFile(wb, excelPath);
      
      // Delay to avoid hitting rate limits too quickly on the same key
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error(`Error processing batch: ${e.message}`);
    }
  }
}

async function run() {
  await processSheet('Parfum Umum');
  await processSheet('Parfum Arab');
  console.log('Done!');
}

run();
