require('dotenv').config();

async function test() {
  const apiKey = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',')[0].trim();
  if (!apiKey) {
    console.log("No API key found in .env");
    return;
  }
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.error) {
      console.log("API Error:", data.error);
    } else {
      console.log("Available models:");
      data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
    }
  } catch (e) {
    console.log("Fetch error:", e.message);
  }
}

test();
