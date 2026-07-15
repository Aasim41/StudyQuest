require('dotenv').config({ path: '../backend/.env' });
const { GoogleGenAI } = require('@google/genai');

async function test() {
  const apiKey = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',')[0].trim();
  if (!apiKey) {
    console.log("No API key found in .env");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-flash-latest'];
  
  for (const model of modelsToTest) {
    console.log(`Testing model: ${model}`);
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [{ text: "Hello" }]
      });
      console.log(`Success with ${model}:`, response.text.substring(0, 30));
    } catch (e) {
      console.log(`Error with ${model}:`, e.message);
    }
    console.log('---');
  }
}

test();
