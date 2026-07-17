require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');
const xlsx = require('xlsx');

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE URL or KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Load AI Limitations Excel to get API Keys and Models
const excelPath = 'C:\\Users\\Abu Bakar Al Adny\\OneDrive\\Dokumen\\Project Web\\AI Limitation.xlsx';
let apiKeys = [];
let availableModels = [];

try {
  const workbook = xlsx.readFile(excelPath);
  
  // Parse API Key List sheet
  const apiSheet = workbook.Sheets['API Key List'];
  if (apiSheet) {
    const apiData = xlsx.utils.sheet_to_json(apiSheet, { header: 1 });
    apiKeys = apiData.map(row => row[0]).filter(key => key && typeof key === 'string' && key.trim() !== '');
  }
  
  // Parse Avalaibe for use AI Free Plan sheet
  const modelSheet = workbook.Sheets['Avalaibe for use AI Free Plan'];
  if (modelSheet) {
    const modelData = xlsx.utils.sheet_to_json(modelSheet);
    availableModels = modelData
      .filter(row => row['RPM'] && !row['RPM'].includes('0 / 0'))
      .map(row => row['Model'])
      .filter(name => name && name.trim() !== '')
      .map(name => name.toLowerCase().replace(/ /g, '-'));
  }
} catch (error) {
  console.error("Failed to read Excel file:", error.message);
  process.exit(1);
}

if (apiKeys.length === 0 || availableModels.length === 0) {
  console.error("No valid API keys or models found in Excel.");
  process.exit(1);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// AI Categorization Prompt
const SYSTEM_PROMPT = `Tugas lu adalah mengkategorikan parfum berdasarkan 'notes' (aroma) yang diberikan.
Kategori didasarkan pada diagram berikut:
1. "Top notes" yang dominan mengarah ke:
   - Floral & Romantic -> Intensity: Medium
   - Fresh & calm -> Intensity: Strong
2. "Base notes" yang dominan mengarah ke:
   - Woody & Earthy -> Intensity: Low (Soft)

Jika notes parfum dominan bunga (floral/rose/jasmine), main_accord = "Floral & Romantic", intensity = "Medium".
Jika notes parfum dominan segar (citrus/aquatic/fruity/fresh), main_accord = "Fresh & calm", intensity = "Strong".
Jika notes parfum dominan kayu/tanah/rempah (oud/sandalwood/patchouli/musk), main_accord = "Woody & Earthy", intensity = "Soft".

Berikan output JSON dengan format ketat:
{
  "main_accord": "Floral & Romantic" | "Fresh & calm" | "Woody & Earthy",
  "intensity": "Soft" | "Medium" | "Strong"
}`;

let currentKeyIndex = 0;
let currentModelIndex = 0;

async function getCategoryForPerfume(perfumeName, notes) {
  while (true) {
    if (currentKeyIndex >= apiKeys.length) {
      console.error(`  [API Key Exhausted] All API keys have been exhausted! Run script again tomorrow.`);
      process.exit(1);
    }
    
    if (currentModelIndex >= availableModels.length) {
      console.log(`  [API Key Exhausted] All models exhausted on key index ${currentKeyIndex}. Switching to next key...`);
      currentKeyIndex++;
      currentModelIndex = 0;
      continue;
    }
    
    const apiKey = apiKeys[currentKeyIndex];
    const modelName = availableModels[currentModelIndex];
    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nNama Parfum: ${perfumeName}\nNotes Aroma: ${notes}\n\nTentukan main_accord dan intensity dalam JSON!` }] }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });
      
      return JSON.parse(response.text);
    } catch (error) {
      const errorMsg = error.message || String(error);
      if (errorMsg.includes('429') || errorMsg.includes('exhausted') || errorMsg.includes('quota')) {
        console.log(`  [AI Limit] ${modelName} exhausted on key index ${currentKeyIndex}. Switching to next model...`);
        currentModelIndex++;
      } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        console.log(`  [AI Error] ${modelName} not found. Switching to next model...`);
        currentModelIndex++;
      } else {
        console.error(`  [Unexpected Error] ${modelName} failed: ${errorMsg}. Retrying in 5s...`);
        await delay(5000);
      }
    }
  }
}

async function runCategorization() {
  console.log("Fetching all bibit from database...");
  const { data: perfumes, error } = await supabase
    .from('bibit')
    .select('id, name, top_notes, middle_notes, base_notes, intensity')
    .is('intensity', null) // Only categorize those that haven't been categorized
    .order('id', { ascending: true });

  if (error) {
    console.error("Error fetching bibit:", error.message);
    process.exit(1);
  }

  console.log(`Found ${perfumes.length} uncategorized perfumes.`);
  let count = 0;

  for (const p of perfumes) {
    count++;
    console.log(`[${count}/${perfumes.length}] Categorizing: ${p.name}`);
    
    // Format notes for the prompt
    const notesStr = `Top Notes: ${JSON.stringify(p.top_notes)}\nMiddle Notes: ${JSON.stringify(p.middle_notes)}\nBase Notes: ${JSON.stringify(p.base_notes)}`;
    const notesToAnalyze = notesStr || "campuran standar";
    
    const categoryResult = await getCategoryForPerfume(p.name, notesToAnalyze);
    
    // Update database
    const { error: updateError } = await supabase
      .from('bibit')
      .update({
        intensity: categoryResult.intensity,
        main_accord: categoryResult.main_accord,
        stock_ml: 1000 // Default stock
      })
      .eq('id', p.id);
      
    if (updateError) {
      console.error(`  [ERROR] Failed to update ${p.name}:`, updateError.message);
    } else {
      console.log(`  [SUCCESS] ${p.name} -> ${categoryResult.main_accord} (${categoryResult.intensity})`);
    }
    
    // Respect RPM
    await delay(3500);
  }
  
  console.log("=== CATEGORIZATION COMPLETE ===");
}

runCategorization();
