const { YoutubeTranscript } = require('youtube-transcript');

/**
 * Extract Video ID from various YouTube URL formats
 */
function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * POST /api/youtube/summarize
 */
async function summarizeVideo(req, res) {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ success: false, error: 'videoUrl is required' });
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
    }

    // 1. Fetch transcript
    let transcriptItems = [];
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        error: 'Could not fetch transcript. The video might not have closed captions enabled.' 
      });
    }

    // Combine text
    const fullTranscript = transcriptItems.map(item => item.text).join(' ');

    // 2. Guardrail & Summarize using Groq
    const groq = req.app.locals.groqClients && req.app.locals.groqClients.length > 0 ? req.app.locals.groqClients[0] : null;
    if (!groq) {
      return res.status(500).json({ success: false, error: 'Groq client not configured' });
    }
    const prompt = `
You are an expert AI Study Tutor. 
Your task is to summarize the following YouTube video transcript.

GUARDRAIL POLICY: You must first determine if this video is educational or related to studying (e.g., science, math, programming, history, study tips, etc.). 
If it is entertainment, gaming, or non-educational content, you must reject it by returning EXACTLY this JSON:
{"educational": false, "reason": "Brief explanation of why it was rejected"}

If it IS educational, generate a highly structured study note summary and return EXACTLY this JSON format:
{
  "educational": true,
  "title": "A concise title for the notes",
  "keyTakeaways": ["point 1", "point 2", "point 3"],
  "summary": "A 2-3 paragraph detailed summary of the core concepts taught in the video.",
  "quizQuestions": [
    {"question": "Q1?", "answer": "A1"}
  ]
}

TRANSCRIPT TO ANALYZE:
"${fullTranscript.substring(0, 15000)}" // limit to roughly 15k chars for prompt size

IMPORTANT: Return ONLY valid JSON. No markdown wrappers.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant', // Fast model for summarization
      temperature: 0.3,
    });

    const parsedText = chatCompletion.choices[0]?.message?.content || '{}';
    
    let summaryData = {};
    try {
      // Clean potential markdown
      const cleanText = parsedText.replace(/```json/g, '').replace(/```/g, '').trim();
      summaryData = JSON.parse(cleanText);
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Failed to parse AI response' });
    }

    res.json({
      success: true,
      videoId,
      ...summaryData
    });

  } catch (error) {
    console.error('[YOUTUBE SUMMARIZE ERROR]', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  summarizeVideo
};
