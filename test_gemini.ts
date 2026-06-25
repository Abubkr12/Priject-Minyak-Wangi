import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf-8');
const apiKeyMatch = envFile.match(/GEMINI_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : '';
process.env.GEMINI_API_KEY = apiKey;

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: "Hello" }] }],
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
