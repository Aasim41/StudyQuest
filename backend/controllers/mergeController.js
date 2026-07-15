const mergeSchedule = async (req, res) => {
  try {
    const { timetable, calendar, syllabus } = req.body;
    
    if (!timetable || !calendar || !syllabus) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required data: timetable, calendar, or syllabus' 
      });
    }

    const geminiClients = req.app.locals.geminiClients || [];
    const groqClients = req.app.locals.groqClients || [];

    if (geminiClients.length === 0 && groqClients.length === 0) {
      return res.status(500).json({ success: false, error: 'No AI clients configured' });
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
Timetable: ${JSON.stringify(timetable)}
Calendar: ${JSON.stringify(calendar)}
Syllabus: ${JSON.stringify(syllabus)}
`;

    let content = null;
    let errorToReport = null;

    // 1. Try Gemini
    for (let i = 0; i < geminiClients.length; i++) {
      try {
        const response = await geminiClients[i].models.generateContent({
          model: 'gemini-1.5-pro',
          contents: [{ text: prompt }],
          config: { responseMimeType: "application/json" }
        });
        content = response.text;
        break;
      } catch (err) {
        console.warn(`[MERGE] Gemini Key ${i + 1} failed:`, err.message);
        errorToReport = err;
      }
    }

    // 2. Try Groq if Gemini failed or wasn't configured
    if (!content && groqClients.length > 0) {
      for (let i = 0; i < groqClients.length; i++) {
        try {
          const chatCompletion = await groqClients[i].chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama3-70b-8192',
            temperature: 0.2,
            response_format: { type: "json_object" },
          });
          content = chatCompletion.choices[0]?.message?.content;
          if (content) break;
        } catch (err) {
          console.warn(`[MERGE] Groq Key ${i + 1} failed:`, err.message);
          errorToReport = err;
        }
      }
    }

    if (!content) {
      throw errorToReport || new Error("All API keys exhausted or failed.");
    }

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
      console.error("Failed to parse AI response:", e);
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
