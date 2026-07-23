const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envFile.match(/GEMINI_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : '';

const ai = new GoogleGenAI({ apiKey });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: 'Tolong cari informasi notes dan intensitas untuk parfum: "Baccarat Rouge 540". Berikan output dalam format JSON: {"intensitas": "Strong", "notes": "Amber, Floral"}',
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a perfume expert. Return raw JSON without markdown formatting."
      }
    });
    console.log(response.text);
  } catch(e) {
    console.error(e);
  }
}
test();
