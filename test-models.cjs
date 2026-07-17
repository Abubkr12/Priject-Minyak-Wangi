const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const models = await ai.models.list();
    // In SDK v1beta, models might not be iterable directly if it's a Pager object
    // but usually it has a page or items property, or async iterator
    for await (const m of models) {
      console.log(m.name);
    }
  } catch(e) {
    console.error('Error fetching models:', e.message || e);
  }
}
run();
