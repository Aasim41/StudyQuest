const mergeSchedule = async (req, res) => {
  try {
    const { timetable, calendar, syllabus } = req.body;
    
    if (!timetable || !calendar || !syllabus) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required data: timetable, calendar, or syllabus' 
      });
    }

    const groq = req.app.locals.groqClients && req.app.locals.groqClients.length > 0 ? req.app.locals.groqClients[0] : null;
    if (!groq) {
      return res.status(500).json({ success: false, error: 'Groq client not configured' });
    }

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
6. Return STRICTLY as a JSON array of objects wrapped in a "schedule" key.

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
Timetable: ${JSON.stringify(timetable)}
Calendar: ${JSON.stringify(calendar)}
Syllabus: ${JSON.stringify(syllabus)}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    let studyPlan = [];
    try {
      const parsed = JSON.parse(content);
      if (parsed.schedule && Array.isArray(parsed.schedule)) {
        studyPlan = parsed.schedule;
      } else {
        const keys = Object.keys(parsed);
        for (let key of keys) {
          if (Array.isArray(parsed[key])) {
            studyPlan = parsed[key];
            break;
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse Groq response:", e);
      return res.status(500).json({ success: false, error: 'Failed to generate schedule' });
    }

    res.json({ success: true, studyPlan });

  } catch (error) {
    console.error('[MERGE SCHEDULE ERROR]', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  mergeSchedule
};
