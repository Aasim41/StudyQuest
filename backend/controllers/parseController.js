const multer = require('multer');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const fs = require('fs');

// ─── Multer Config ──────────────────────────────────────────────────────────
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
});

/**
 * Uploads a local file to Firebase Storage
 */
async function uploadToFirebaseStorage(file, adminApp, folder = 'timetables') {
  const bucket = getStorage(adminApp).bucket();
  const ext = path.extname(file.originalname);
  const destination = `${folder}/${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;

  await bucket.upload(file.path, {
    destination: destination,
    metadata: { contentType: file.mimetype },
  });

  return `gs://${bucket.name}/${destination}`;
}

/**
 * POST /api/parse/timetable
 */
async function parseTimetable(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = req.file;
    const adminApp = req.app.locals.firebaseAdmin;
    const genai = req.app.locals.genai;

    // 1. Read file to buffer for Gemini Vision
    const fileBuffer = fs.readFileSync(file.path);
    const mimeType = file.mimetype;

    // 2. Bypass Firebase Storage upload since we only need the parsed data
    const fileUrl = "skipped";

    // 3. Clean up local temp file
    fs.unlinkSync(file.path);

    // 4. Call Gemini Vision to extract timetable
    const prompt = `
You are a highly advanced OCR and data extraction AI for a student planner application. Your job is to extract the weekly class schedule from the provided timetable (which may be blurry, have merged cells, or unusual layouts) with PIN-POINT ACCURACY.

Rules:
1. Extract EVERY SINGLE CLASS listed. Do not miss any.
2. If a cell spans multiple hours, create separate entries for each hour, OR accurately represent the full duration in the "time" field (e.g., "09:00 - 11:00").
3. Ignore blank cells, lunch breaks, or empty slots.
4. Correct obvious OCR typos (e.g., "Phy5ics" -> "Physics").
5. Return the result STRICTLY as a JSON array of objects.

Each object MUST have the following schema EXACTLY:
- "id": a unique string (e.g. "1", "2")
- "day": the day of the week, abbreviated to 3 letters (e.g., "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
- "time": the time slot in 24-hour format if possible (e.g., "09:00 - 10:00")
- "subject": the name of the subject or class
- "type": the type of class (e.g., "Lecture", "Lab", "Tutorial", "Seminar"). If not mentioned, assume "Lecture".
- "confidence": a number between 0.0 and 1.0 indicating extraction confidence.
`;

    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: prompt },
        {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: mimeType
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedText = response.text;
    let timetableData = [];
    try {
      timetableData = JSON.parse(parsedText);
    } catch (e) {
      // Fallback: sometimes models wrap in markdown despite responseMimeType
      const cleanText = parsedText.replace(/```json/g, '').replace(/```/g, '').trim();
      timetableData = JSON.parse(cleanText);
    }

    res.json({
      success: true,
      fileUrl,
      timetable: timetableData
    });

  } catch (error) {
    console.error('[PARSE TIMETABLE ERROR]', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/parse/calendar
 */
async function parseCalendar(req, res) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const file = req.file;
    const adminApp = req.app.locals.firebaseAdmin;
    const genai = req.app.locals.genai;

    const fileBuffer = fs.readFileSync(file.path);
    const mimeType = file.mimetype;
    const fileUrl = "skipped";
    fs.unlinkSync(file.path);

    const prompt = `
You are a highly advanced OCR and data extraction AI for a student planner application. Your job is to extract the academic calendar from the provided document with PIN-POINT ACCURACY.

Rules:
1. Identify all key academic dates: Exams, Midterms, Holidays, Fests, Semester Start/End, Academic Events.
2. Convert all dates to a standard format (YYYY-MM-DD). If the year is missing, infer it from the context or use the current academic year.
3. Ignore generic text, signatures, or preamble.
4. Return the result STRICTLY as a JSON array of objects.

Each object MUST have the following schema EXACTLY:
- "id": a unique string
- "date": the date of the event in "YYYY-MM-DD" format. If it spans multiple days, use the start date.
- "title": the name of the event (e.g., "Midterm Exams Begin", "Winter Break", "Annual Fest")
- "type": categorize as one of: ["Exam", "Holiday", "Fest", "Academic Event"]
- "confidence": a number between 0.0 and 1.0 indicating extraction confidence.
`;

    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: prompt },
        { inlineData: { data: fileBuffer.toString('base64'), mimeType: mimeType } }
      ],
      config: { responseMimeType: "application/json" }
    });

    const parsedText = response.text;
    let calendarData = [];
    try {
      calendarData = JSON.parse(parsedText);
    } catch (e) {
      const cleanText = parsedText.replace(/```json/g, '').replace(/```/g, '').trim();
      calendarData = JSON.parse(cleanText);
    }

    res.json({ success: true, fileUrl, calendar: calendarData });

  } catch (error) {
    console.error('[PARSE CALENDAR ERROR]', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/parse/syllabus
 */
async function parseSyllabus(req, res) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const file = req.file;
    const adminApp = req.app.locals.firebaseAdmin;
    const genai = req.app.locals.genai;

    const fileBuffer = fs.readFileSync(file.path);
    const mimeType = file.mimetype;
    const fileUrl = "skipped";
    fs.unlinkSync(file.path);

    const prompt = `
You are a highly advanced OCR and data extraction AI for a student planner application. Extract the syllabus information from this document with PIN-POINT ACCURACY.

Rules:
1. Identify every subject/course listed.
2. Extract credit hours/units if mentioned. If not mentioned, estimate based on typical university standards (3 for theory, 1-2 for lab).
3. Calculate weightage as a percentage: (subject_credits / total_credits_sum) * 100, rounded to 1 decimal.
4. Assign a confidence score (0.0 to 1.0) to each entry.
5. Return STRICTLY as a JSON array.

Each object MUST have:
- "id": unique string
- "subject": subject/course name
- "credits": number of credits
- "weightage": computed percentage (will be recalculated by frontend too)
- "confidence": 0.0 to 1.0
`;

    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: prompt },
        { inlineData: { data: fileBuffer.toString('base64'), mimeType: mimeType } }
      ],
      config: { responseMimeType: "application/json" }
    });

    const parsedText = response.text;
    let syllabusData = [];
    try {
      syllabusData = JSON.parse(parsedText);
    } catch (e) {
      const cleanText = parsedText.replace(/```json/g, '').replace(/```/g, '').trim();
      syllabusData = JSON.parse(cleanText);
    }

    res.json({ success: true, fileUrl, syllabus: syllabusData });

  } catch (error) {
    console.error('[PARSE SYLLABUS ERROR]', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  upload,
  parseTimetable,
  parseCalendar,
  parseSyllabus
};
