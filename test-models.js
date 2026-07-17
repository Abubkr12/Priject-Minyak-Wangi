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
  await testModel('gemini-1.5-flash');
  await testModel('gemini-1.5-flash-latest');
  await testModel('gemini-2.5-flash');
  await testModel('gemini-2.0-flash-exp');
  await testModel('gemini-pro');
}
run();
