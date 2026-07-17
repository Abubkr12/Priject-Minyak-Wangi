require('dotenv').config({ path: '.env.local' });
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const { GoogleGenAI } = require('@google/genai');

// Parse arguments
const isDryRun = process.argv.includes('--dry-run');

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables in .env.local");
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Load API Keys and Models from AI Limitation.xlsx
let apiKeys = [];
let availableModels = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-flash'];
let currentKeyIndex = 0;
let currentModelIndex = 0;
let ai;
try {
  const workbookLimit = xlsx.readFile('../AI Limitation.xlsx');
  const apiKeySheet = workbookLimit.Sheets['API Key List'];
  const rawKeys = xlsx.utils.sheet_to_json(apiKeySheet, { header: 1 });
  apiKeys = rawKeys.flat().filter(k => k && typeof k === 'string' && k.startsWith('AQ.'));
  if (apiKeys.length === 0) throw new Error("No keys found");
  console.log(`Loaded ${apiKeys.length} API keys from AI Limitation.xlsx.`);

  const freePlanSheet = workbookLimit.Sheets['Avalaibe for use AI Free Plan'];
  if (freePlanSheet) {
    const freePlanData = xlsx.utils.sheet_to_json(freePlanSheet);
    const parsedModels = freePlanData.filter(row => {
      if (!row.Model) return false;
      if (row.Category !== 'Text-out models') return false;
      if (row.RPM && row.RPM.replace(/\s+/g, '') === '0/0') return false;
      return true;
    }).map(row => row.Model.toLowerCase().replace(/ /g, '-'));
    
    if (parsedModels.length > 0) {
      availableModels = parsedModels;
      console.log(`Loaded ${availableModels.length} valid models from Free Plan:`, availableModels);
    }
  }

  ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
} catch (e) {
  console.log("Failed to load AI Limitation.xlsx, falling back to GEMINI_API_KEY in .env.local", e.message);
  apiKeys = [process.env.GEMINI_API_KEY];
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Load Excel
const workbook = xlsx.readFile('./public/assets/Data Bibit Botol Ela parfum.xlsx');

// Extract bottle prices
const bottleSheet = workbook.Sheets['Jenis Botol & Harga'];
const bottlesRaw = xlsx.utils.sheet_to_json(bottleSheet);
const bottleSizes = bottlesRaw.map(b => ({
  size: parseInt(b['Ukuran'].replace('ml', '')),
  label: b['Ukuran'],
  price: b['HARGA PERBOTOL'] * 1000 // Convert 10 to 10000
})).filter(b => !isNaN(b.size));

const uniqueBottles = [];
const map = new Map();
for (const item of bottleSizes) {
    if(!map.has(item.size)){
        map.set(item.size, true);
        uniqueBottles.push({
            size_ml: item.size,
            size_label: item.label,
            bottle_price: item.price
        });
    }
}

// Scent family mapping (based on database seed)
const SCENT_FAMILIES = {
  'fresh': 1,
  'floral': 2,
  'woody': 3,
  'citrus': 4,
  'sweet': 5,
  'aquatic': 6,
  'spicy': 7,
  'musky': 8
};

async function getAIProfile(name) {
  const prompt = `Analisa detail wangi (fragrance notes) untuk biang parfum / fragrance oil bernama "${name}".
Berikan penjelasan mendetail namun ringkas dalam Bahasa Indonesia.
Untuk setiap Note (Top, Middle, Base), berikan aroma dan kategorikan karakternya menjadi salah satu dari: "Strong", "Medium", atau "Soft".

Format output harus JSON murni seperti ini, tanpa markdown dan tanpa penjelasan lain:
{
  "description": "Deskripsi singkat mengenai aroma ini...",
  "top_notes": [{"note": "Nama aroma (misal Citrus)", "character": "Strong"}],
  "middle_notes": [{"note": "Nama aroma (misal Jasmine)", "character": "Medium"}],
  "base_notes": [{"note": "Nama aroma (misal Musk)", "character": "Soft"}]
}`;

  while (true) {
    if (currentKeyIndex >= apiKeys.length) {
      console.error(`  [FATAL] All API keys and models exhausted!`);
      // Optional: Add logic here to wait until reset time if desired, but returning null for now.
      return null;
    }
    
    if (currentModelIndex >= availableModels.length) {
      console.error(`  [API Key Exhausted] All models exhausted on key index ${currentKeyIndex}. Switching to next key...`);
      currentKeyIndex++;
      currentModelIndex = 0;
      if (currentKeyIndex < apiKeys.length) {
        console.log(`  [Switched Key] Now using API Key index ${currentKeyIndex}.`);
        ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
      }
      continue;
    }

    const model = availableModels[currentModelIndex];
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text);
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('503') || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('quota')) {
        console.error(`  [AI Limit] ${model} exhausted for ${name} on key index ${currentKeyIndex}. Switching to next model...`);
        currentModelIndex++;
        continue;
      } else if (error.message.includes('NOT_FOUND') || error.message.includes('404')) {
        console.error(`  [AI Error] ${model} not found. Switching to next model...`);
        currentModelIndex++;
        continue;
      }
      console.error(`  [AI Error for ${name} on ${model}]:`, error.message);
      return null;
    }
  }
}

function generateSlug(name) {
  return name.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function processPerfumes(sheetName, nameColumn, existingSlugs) {
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);
  
  console.log(`\nProcessing ${rows.length} perfumes from [${sheetName}]...`);
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row[nameColumn];
    let pricePerMl = row['HARGA PERMILI'];
    
    if (!name || !pricePerMl) continue;
    // ensure pricePerMl is a number
    if (typeof pricePerMl === 'string') {
        pricePerMl = parseInt(pricePerMl.replace(/[^0-9]/g, ''), 10);
    }
    
    const slug = generateSlug(name);
    
    // Skip if already complete in bibit
    if (existingSlugs.has(slug)) {
        console.log(`  [SKIP] ${name} is already complete in bibit table.`);
        continue;
    }
    const { data: existingBibit } = await supabase.from('bibit').select('id, description, top_notes').eq('slug', slug).maybeSingle();
    if (existingBibit) {
        const isComplete = existingBibit.description && existingBibit.description.trim() !== '' && existingBibit.top_notes && existingBibit.top_notes.length > 0;
        if (isComplete) {
            console.log(`  [SKIP] ${name} is already complete in bibit table.`);
            existingSlugs.add(slug);
            continue;
        } else {
            console.log(`  [UPDATE] ${name} is incomplete. Generating AI details...`);
        }
    }
    
    console.log(`\n[${i+1}/${rows.length}] Analyzing: ${name}`);
    
    let profile = await getAIProfile(name);
    if (!profile) {
      console.log(`  Falling back to empty profile for ${name} due to AI failure.`);
      profile = { description: "", top_notes: [], middle_notes: [], base_notes: [] };
    }

    if (isDryRun) {
      console.log("  [DRY RUN] Generated Data:", { name, slug, profile });
      if (i >= 1) break; 
      continue;
    }

    const { data: insertedBibit, error: bibitError } = await supabase
      .from('bibit')
      .upsert({
        name,
        slug,
        collection: sheetName === 'Parfum Arab' ? 'Arabian Parfume' : 'Global Parfume',
        description: profile.description,
        top_notes: profile.top_notes || [],
        middle_notes: profile.middle_notes || [],
        base_notes: profile.base_notes || [],
        is_active: true
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (bibitError) {
      console.error(`  [DB Error - Bibit] ${name}:`, bibitError.message);
      continue;
    }
    
    console.log(`  Successfully inserted/updated ${name} into Bibit.`);
    
    // Add delay to avoid rate limiting (15 RPM limit on flash-lite means 4000ms delay. We use 4500ms to be safe)
    await new Promise(r => setTimeout(r, 4500));
  }
}

async function run() {
  if (isDryRun) console.log("=== DRY RUN MODE ===");
  
  // Fetch existing bibit to avoid quota waste
  console.log("Fetching existing bibit records...");
  const { data: existing } = await supabase.from('bibit').select('slug, description, top_notes');
  const existingSlugs = new Set();
  let incompleteCount = 0;
  if (existing) {
    for (const p of existing) {
      const isComplete = p.description && p.description.trim() !== '' && p.top_notes && p.top_notes.length > 0;
      if (isComplete) {
        existingSlugs.add(p.slug);
      } else {
        incompleteCount++;
      }
    }
  }
  console.log(`Found ${existingSlugs.size} complete perfumes. Found ${incompleteCount} incomplete perfumes to update.`);
  
  await processPerfumes('Parfum Umum', 'NAMA PARFUM', existingSlugs);
  await processPerfumes('Parfum Arab', 'NAMA PARFUM ARAB', existingSlugs);
  
  console.log("\nImporting bottles...");
  for (const bottle of uniqueBottles) {
    const name = `Botol ${bottle.size_label}`;
    const { data: existing } = await supabase.from('bottles').select('id').eq('name', name).maybeSingle();
    let bError;
    
    if (existing) {
      const res = await supabase.from('bottles').update({ capacity_ml: bottle.size_ml, price: bottle.bottle_price }).eq('id', existing.id);
      bError = res.error;
    } else {
      const res = await supabase.from('bottles').insert({ name, capacity_ml: bottle.size_ml, price: bottle.bottle_price, stock: 100 });
      bError = res.error;
    }
    
    if (bError) console.error(`  [DB Error - Bottle] ${bottle.size_label}:`, bError.message);
    else console.log(`  Successfully inserted/updated Botol ${bottle.size_label}.`);
  }

  console.log("\nFinished importing perfumes and bottles!");
}

run();
