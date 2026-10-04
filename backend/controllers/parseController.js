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
 * Tries Gemini keys in sequence. If all fail, tries Groq keys in sequence using llama-3.2-90b-vision-preview.
 */
async function callVisionModelWithFallback(prompt, imageParts, req) {
  const geminiClients = req.app.locals.geminiClients || [];
  const groqClients = req.app.locals.groqClients || [];
  
  // 1. Try Gemini
  for (let i = 0; i < geminiClients.length; i++) {
    try {
      const response = await geminiClients[i].models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ text: prompt }, ...imageParts],
        config: { responseMimeType: "application/json" }
      });
      return response.text;
    } catch (err) {
      console.warn(`[API] Gemini Key ${i + 1} failed:`, err.message);
      if (!err.message.includes('429') && !err.message.includes('RESOURCE_EXHAUSTED')) {
         throw err;
      }
    }
  }

  // 2. Try Groq (Llama 3.2 Vision)
  console.warn('[API] All Gemini keys exhausted. Falling back to Groq Vision...');
  const groqContent = [{ type: "text", text: prompt }];
  for (const part of imageParts) {
    if (part.inlineData) {
      groqContent.push({
        type: "image_url",
        image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` }
      });
    }
  }

  for (let i = 0; i < groqClients.length; i++) {
    try {
      const response = await groqClients[i].chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: groqContent }],
      });
      return response.choices[0].message.content;
    } catch (err) {
      console.warn(`[API] Groq Key ${i + 1} failed:`, err.message);
      if (!err.message.includes('429') && !err.message.includes('rate_limit')) {
         if (err.message.includes('invalid image data')) {
             throw new Error("Our backup AI does not support PDF files. Please take a screenshot and upload the image, or tap 'Fill Manually'.");
         }
         throw err;
      }
    }
  }

  throw new Error("429: All API keys (Gemini and Groq) have exhausted their quotas.");
}

/**
 * POST /api/parse/timetable
 */
async function parseTimetable(req, res) {
  try {
    const imageParts = [];
    if (req.body && req.body.files && Array.isArray(req.body.files)) {
      for (const file of req.body.files) {
        imageParts.push({ inlineData: { data: file.fileData, mimeType: file.mimeType || 'application/octet-stream' } });
      }
    } else if (req.body && req.body.fileData) {
      imageParts.push({ inlineData: { data: req.body.fileData, mimeType: req.body.mimeType || 'application/octet-stream' } });
    } else if (req.file) {
      imageParts.push({ inlineData: { data: fs.readFileSync(req.file.path).toString('base64'), mimeType: req.file.mimetype } });
      fs.unlinkSync(req.file.path);
    } else {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const fileUrl = "skipped";

    // 4. Call Gemini 2.5 Pro Vision to extract timetable
    const prompt = `
You are an expert data extraction AI. You are parsing a college timetable image to build an attendance tracking app. 
Absolute precision is required. Do not hallucinate classes.

Rules:
1. Extract EVERY single valid class.
2. If a class spans 2 hours (e.g. 10:00 - 12:00), CREATE TWO SEPARATE 1-HOUR ENTRIES (e.g. one for 10:00-11:00, one for 11:00-12:00) so attendance can be tracked per hour.
3. Ignore blank slots, lunch breaks, and holidays.
4. Correct spelling errors.
5. Return STRICTLY a JSON array.

Schema for each object in the array:
- "id": a unique string (e.g. "uuid")
- "day": exactly one of "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
- "time": the specific 1-hour slot (e.g., "10:00 - 11:00")
- "subject": exact subject name
- "type": "Lecture", "Lab", "Tutorial", or "Seminar"
- "confidence": number between 0.0 and 1.0
`;

    const parsedText = await callVisionModelWithFallback(prompt, imageParts, req);

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
    
    let errorMessage = error.message || 'An unknown error occurred';
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = 'Gemini API quota exceeded. Please try again later or use the "Fill Manually" option.';
    }
    
    res.status(500).json({ success: false, error: errorMessage });
  }
}

/**
 * POST /api/parse/calendar
 */
async function parseCalendar(req, res) {
  try {
    const imageParts = [];
    if (req.body && req.body.files && Array.isArray(req.body.files)) {
      for (const file of req.body.files) {
        imageParts.push({ inlineData: { data: file.fileData, mimeType: file.mimeType || 'application/octet-stream' } });
      }
    } else if (req.body && req.body.fileData) {
      imageParts.push({ inlineData: { data: req.body.fileData, mimeType: req.body.mimeType || 'application/octet-stream' } });
    } else if (req.file) {
      imageParts.push({ inlineData: { data: fs.readFileSync(req.file.path).toString('base64'), mimeType: req.file.mimetype } });
      fs.unlinkSync(req.file.path);
    } else {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const adminApp = req.app.locals.firebaseAdmin;
    const genai = req.app.locals.genai;
    const fileUrl = "skipped";

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

    const parsedText = await callVisionModelWithFallback(prompt, imageParts, req);

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
    
    let errorMessage = error.message || 'An unknown error occurred';
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = 'Gemini API quota exceeded. Please try again later or use the "Fill Manually" option.';
    }

    res.status(500).json({ success: false, error: errorMessage });
  }
}

/**
 * POST /api/parse/syllabus
 */
async function parseSyllabus(req, res) {
  try {
    const imageParts = [];
    if (req.body && req.body.files && Array.isArray(req.body.files)) {
      for (const file of req.body.files) {
        imageParts.push({ inlineData: { data: file.fileData, mimeType: file.mimeType || 'application/octet-stream' } });
      }
    } else if (req.body && req.body.fileData) {
      imageParts.push({ inlineData: { data: req.body.fileData, mimeType: req.body.mimeType || 'application/octet-stream' } });
    } else if (req.file) {
      imageParts.push({ inlineData: { data: fs.readFileSync(req.file.path).toString('base64'), mimeType: req.file.mimetype } });
      fs.unlinkSync(req.file.path);
    } else {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const adminApp = req.app.locals.firebaseAdmin;
    const genai = req.app.locals.genai;
    const fileUrl = "skipped";

    const userType = req.body.userType || 'unknown';
    const institute = req.body.institute || {};

    let prompt = `You are a highly advanced OCR and data extraction AI for a student planner application. Extract the syllabus information from this document with PIN-POINT ACCURACY.
`;

    if (userType === 'college') {
      prompt += `
CONTEXT: This is a college syllabus for a student in ${institute.semester || 'an unknown semester'}.

Rules:
1. Identify every subject/course listed.
2. Extract credit hours/units if mentioned. If not mentioned, estimate based on typical university standards (3 for theory, 1-2 for lab).
3. Calculate weightage as a percentage: (subject_credits / total_credits_sum) * 100, rounded to 1 decimal.
4. Mention the exact Semester "${institute.semester || ''}" in the "semester" field for every subject.
5. Assign a confidence score (0.0 to 1.0) to each entry.
6. Return STRICTLY as a JSON array.

Each object MUST have:
- "id": unique string
- "subject": subject/course name
- "credits": number of credits
- "weightage": computed percentage
- "semester": "${institute.semester || ''}"
- "confidence": 0.0 to 1.0
`;
    } else {
      prompt += `
CONTEXT: This is a syllabus for a ${userType} student in ${institute.extra || 'an unknown class'}.

Rules:
1. Identify every subject listed.
2. For EACH subject, extract ALL the Chapters/Topics listed in the syllabus.
3. Identify the target Exam name (e.g. JEE, NEET, Class 10 Boards) if mentioned or inferred.
4. Assign a confidence score (0.0 to 1.0) to each entry.
5. Return STRICTLY as a JSON array.

Each object MUST have:
- "id": unique string
- "subject": subject name
- "chapters": an array of strings (e.g. ["Kinematics", "Laws of Motion"])
- "exam": the name of the exam
- "credits": set to 3 by default
- "confidence": 0.0 to 1.0
`;
    }

    const parsedText = await callVisionModelWithFallback(prompt, imageParts, req);

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
    
    let errorMessage = error.message || 'An unknown error occurred';
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = 'Gemini API quota exceeded. Please try again later or use the "Fill Manually" option.';
    }

    res.status(500).json({ success: false, error: errorMessage });
  }
}

module.exports = {
  upload,
  parseTimetable,
  parseCalendar,
  parseSyllabus
};
