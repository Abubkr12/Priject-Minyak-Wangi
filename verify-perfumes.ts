import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

let apiKeys: string[] = [];

// Models that we will iterate through based on the user's Free Plan excel sheet
const MODELS_TO_TRY = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.0-flash'
];

async function getApiKeys() {
  const { data } = await supabase.from('ai_api_keys').select('api_key');
  if (data && data.length > 0) {
    apiKeys = data.map(k => k.api_key);
  }
  if (apiKeys.length === 0) {
    apiKeys = [process.env.GEMINI_API_KEY!];
  }
}

async function verifyPerfumes() {
  console.log('Starting Perfume Verification Process with Google Search Grounding...');
  
  await getApiKeys();
  console.log(`Loaded ${apiKeys.length} API keys for rotation.`);
  
  const { data: bibitList, error } = await supabase
    .from('bibit')
    .select('id, name, main_accord, intensity, top_notes, middle_notes, base_notes')
    .order('name');
    
  if (error || !bibitList) {
    console.error('Error fetching bibit:', error);
    return;
  }
  
  console.log(`Found ${bibitList.length} perfumes to verify.`);
  
  const batchSize = 3; 
  let totalUpdated = 0;
  
  let currentKeyIdx = 0;
  let currentModelIdx = 0;
  
  for (let i = 0; i < bibitList.length; i += batchSize) {
    const batch = bibitList.slice(i, i + batchSize);
    console.log(`\nVerifying batch ${i / batchSize + 1} of ${Math.ceil(bibitList.length / batchSize)} (${batch.length} perfumes)...`);
    
    const prompt = `You are an expert perfumer with access to Google Search.
I have a list of perfumes. You MUST search the internet (Fragrantica, official websites, Parfumo) to find the EXACT notes for each perfume listed below.

Valid Categories: "Woody & Earthy", "Fresh & calm", "Floral & Romantic".
Valid Intensities: "Soft", "Medium", "Strong".

For each perfume:
1. Search the internet for its true Top, Middle, and Base notes, and its overall scent profile and intensity.
2. If it is a dupe/clone (like many Mykonos or local brands), search for the specific local brand's description (e.g. "Mykonos Monaco Royale perfume notes").

Input Data:
${batch.map(b => `- ID: ${b.id} | Name: ${b.name}`).join('\n')}

Output format MUST be a valid JSON array containing the corrected info for ALL perfumes in this batch.
[
  {
    "id": "uuid-here",
    "correctCategory": "Valid Category String",
    "correctIntensity": "Valid Intensity String",
    "topNotes": [{"name": "Note Name", "intensity": "Soft/Medium/Strong"}],
    "middleNotes": [{"name": "Note Name", "intensity": "Soft/Medium/Strong"}],
    "baseNotes": [{"name": "Note Name", "intensity": "Soft/Medium/Strong"}],
    "reason": "Short explanation based on your search"
  }
]

Make sure note names are title-cased. Return pure JSON. Do not use markdown blocks like \`\`\`json.`;

    let success = false;
    let fallbackLoopSafety = 0;
    
    while (!success && fallbackLoopSafety < 50) {
      fallbackLoopSafety++;
      const activeKey = apiKeys[currentKeyIdx];
      const activeModel = MODELS_TO_TRY[currentModelIdx];
      
      try {
        console.log(`-> Try [Key #${currentKeyIdx + 1}] [Model: ${activeModel}]`);
        const ai = new GoogleGenAI({ apiKey: activeKey });
        
        const response = await ai.models.generateContent({
          model: activeModel,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            tools: [{ googleSearch: {} }]
          }
        });
        
        let text = response.text || "[]";
        if (text.includes('```')) {
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        
        let corrections = [];
        try {
          corrections = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON for this batch. Retrying...');
          continue; 
        }
        
        if (!Array.isArray(corrections) || corrections.length === 0) {
          console.log(`No corrections parsed for this batch. Continuing.`);
          success = true;
          break;
        }
        
        console.log(`Found ${corrections.length} perfumes processed.`);
        for (const correction of corrections) {
          const perfume = batch.find(b => b.id === correction.id);
          if (!perfume) continue;
          
          console.log(`- Updating: ${perfume.name}`);
          
          await supabase
            .from('bibit')
            .update({
              main_accord: correction.correctCategory,
              intensity: correction.correctIntensity,
              top_notes: correction.topNotes || [],
              middle_notes: correction.middleNotes || [],
              base_notes: correction.baseNotes || []
            })
            .eq('id', correction.id);
            
          totalUpdated++;
        }
        success = true;
        
      } catch (apiError: any) {
        // Fallback Logic:
        
        console.error(`Error: ${apiError.status || apiError.code} - ${apiError.message}`);
        
        // If it's a 429, it might just be the RPM (Requests Per Minute) limit.
        // Let's sleep for 10 seconds before trying the next model/key to let the quota bucket refill slightly.
        if (apiError.status === 429 || apiError.code === 429) {
          console.log(`Rate limit hit. Resting for 10 seconds before fallback...`);
          await new Promise(r => setTimeout(r, 10000));
        }
        
        // 1. Advance Model
        currentModelIdx++;
        
        // 2. If all models in the list have been tried
        if (currentModelIdx >= MODELS_TO_TRY.length) {
          console.error(`All models limit hit for Key #${currentKeyIdx + 1}. Switching to next API Key...`);
          currentModelIdx = 0; // Reset Model Index
          currentKeyIdx++; // Advance API Key
          
          // 3. If all API keys have been tried
          if (currentKeyIdx >= apiKeys.length) {
            console.error(`All models AND all API Keys have been exhausted! Waiting 60 seconds...`);
            await new Promise(r => setTimeout(r, 60000));
            // Reset to beginning of keys
            currentKeyIdx = 0;
            currentModelIdx = 0;
          }
        }
      }
    }
    
    // Add a strict 5-second delay between batches to stay under the 15 RPM limit of free tiers
    console.log('Batch complete. Sleeping for 5 seconds to respect RPM limits...');
    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log('\n=== VERIFICATION COMPLETE ===');
  console.log(`Total perfumes updated: ${totalUpdated}`);
}

verifyPerfumes();
