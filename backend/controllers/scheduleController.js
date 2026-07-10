/**
 * Schedule Controller
 * Uses Groq API to generate an optimized study schedule based on the user's timetable,
 * topics to cover, and difficulty ratings.
 */

async function generateSchedule(req, res) {
  try {
    const { timetable, topics, preferredStudyHours } = req.body;

    if (!timetable || !topics) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: timetable and topics'
      });
    }

    const groq = req.app.locals.groq;

    // Construct the prompt for Groq
    const prompt = `
You are an expert AI Study Planner. I have a user's class timetable and a list of topics they need to study.
Assign these study topics to empty time blocks in their schedule.

Here is their class timetable (JSON array):
${JSON.stringify(timetable, null, 2)}

Here are the topics they need to study (JSON array, includes difficulty 1-5):
${JSON.stringify(topics, null, 2)}

User's preferred study hours per day: ${preferredStudyHours || '3 hours'}

Rules:
1. Do not schedule study sessions during class times from the timetable.
2. Assign harder topics (difficulty 4-5) to earlier slots in the day when possible.
3. Break study blocks into chunks (e.g. 1 hour).
4. Return a JSON array of the planned study blocks.
5. Each object in the array MUST have these keys:
   - "id": a unique string
   - "day": the day (e.g. "Mon", "Tue")
   - "time": the time slot (e.g. "16:00 - 17:00")
   - "subject": the subject name
   - "topic": the specific topic to study
   - "difficulty": the difficulty rating (1-5)
   - "color": a hex color code (e.g., "#FF6B35") for UI rendering

Return EXACTLY a JSON array, with NO markdown formatting, NO blockquotes (\`\`\`json), and NO extra text.
`;

    // We use the Llama 3 or Mixtral model on Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-70b-8192', // Fast and capable of JSON adherence
      temperature: 0.2, // Low temperature for deterministic JSON output
    });

    const parsedText = chatCompletion.choices[0]?.message?.content || '[]';
    
    let generatedPlan = [];
    try {
      generatedPlan = JSON.parse(parsedText);
    } catch (e) {
      // Fallback: strip potential markdown
      const cleanText = parsedText.replace(/```json/g, '').replace(/```/g, '').trim();
      generatedPlan = JSON.parse(cleanText);
    }

    res.json({
      success: true,
      studyPlan: generatedPlan
    });

  } catch (error) {
    console.error('[SCHEDULE GENERATE ERROR]', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  generateSchedule
};
