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
        model: 'gemini-1.5-flash',
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
        // We omit response_format because the prompt asks for a JSON array, not an object.
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

    const adminApp = req.app.locals.firebaseAdmin;
    const genai = req.app.locals.genai;

    // Bypass Firebase Storage upload since we only need the parsed data
    const fileUrl = "skipped";

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
