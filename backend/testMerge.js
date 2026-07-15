require('dotenv').config({ path: './.env' });
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEYS.split(',')[0] });

async function test() {
  const prompt = `
You are an expert academic planner. You have been provided with three JSON arrays:
1. Timetable (class schedule)
2. Academic Calendar (holidays, fests, exams)
3. Syllabus (subjects with credit weightages)

Generate a day-by-day study schedule for the next 30 days starting from tomorrow.

Rules:
1. NEVER schedule study sessions during class hours (from Timetable).
2. NEVER schedule study sessions on holidays or fests (from Calendar).
3. Allocate study time proportionally to the "weightage" of each subject (from Syllabus).
4. Apply spaced repetition: schedule review sessions before exam dates if any exist in the Calendar.
5. Create realistic 1-2 hour study blocks.
6. Return STRICTLY as a JSON object with a single "schedule" key containing an array of objects. Do NOT return markdown formatting.

Each object MUST have:
- "id": a unique string
- "date": "YYYY-MM-DD"
- "day": e.g., "Monday"
- "time": e.g., "17:00 - 18:30"
- "subject": subject name
- "topic": specific topic to study or "General Review"
- "duration": duration in minutes (e.g., 90)
- "color": a hex color string based on the subject

Data:
Timetable: [{"id":"tt-0-1748259654157","day":"Mon","time":"09:00 - 10:00","subject":"Mathematics","type":"Lecture","confidence":1},{"id":"tt-1-1748259654157","day":"Mon","time":"10:15 - 11:15","subject":"Physics","type":"Lab","confidence":1}]
Calendar: [{"id":"cal-0-1748259659345","date":"2023-11-20","event":"Midterm Exams Begin","type":"Exam","confidence":1}]
Syllabus: [{"id":"syl-0-1748259664532","subject":"Mathematics","weightage":"30%","topics":["Calculus","Algebra"],"confidence":1}]
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
    console.log("Success:", chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error("Groq Error:", err.message);
  }
}
test();
