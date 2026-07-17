require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel(modelName) {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Hello",
    });
    console.log(`Success with ${modelName}`);
  } catch (error) {
    console.log(`Failed with ${modelName}:`, error.message);
  }
}

async function run() {
  await testModel('gemini-3.1-flash-lite');
  await testModel('gemini-3.5-flash');
}
run();
