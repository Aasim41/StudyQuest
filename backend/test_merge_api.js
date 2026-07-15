require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testMerge() {
  const apiKey = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '').split(',')[0].trim();
  if (!apiKey) {
    console.log("No API key");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const timetable = [{ day: "Monday", class: "Math", endTime: "14:00" }];
  const calendar = [{ date: "2026-07-20", event: "Holiday" }];
  const syllabus = [{ subject: "Math", weightage: 5 }];

  const prompt = `
You are an expert academic planner. You have been provided with three JSON arrays:
1. Timetable (class schedule)
2. Academic Calendar (holidays, fests, exams)
3. Syllabus (subjects with credit weightages)

Generate a day-by-day study schedule for the next 7 days starting from tomorrow.

Rules:
1. Find the LATEST ending time of any class in the Timetable for a given day. You MUST schedule all study sessions for that day strictly AFTER that latest class ending time.
2. NEVER schedule study sessions on holidays or fests (from Calendar).
3. Allocate study time proportionally to the "weightage" of each subject (from Syllabus).
4. Assign an "intensity" (Light, Moderate, Intense) based on the subject's difficulty and upcoming exams.
5. Return STRICTLY as a JSON object with a single "schedule" key containing an array of objects. Do NOT return markdown formatting.

Each object MUST have EXACTLY these fields:
- "id": a unique string
- "date": "YYYY-MM-DD"
- "day": e.g., "Monday"
- "time": e.g., "17:00 - 18:30"
- "subject": subject name
- "intensity": "Light", "Moderate", or "Intense"
- "duration": duration in minutes (e.g., 90)
- "color": a hex color string based on the subject

Data:
Timetable: ${JSON.stringify(timetable)}
Calendar: ${JSON.stringify(calendar)}
Syllabus: ${JSON.stringify(syllabus)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: prompt }],
      config: { responseMimeType: "application/json" }
    });
    
    const content = response.text;
    console.log("RAW CONTENT:", content);
    const parsed = JSON.parse(content);
    console.log("PARSED SCHEDULE LENGTH:", parsed.schedule?.length || parsed[Object.keys(parsed)[0]]?.length);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

testMerge();
