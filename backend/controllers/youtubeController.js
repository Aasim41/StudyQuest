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

    // 1. Fetch transcript using closed captions
    let fullTranscript = "";
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      fullTranscript = transcriptItems.map(item => item.text).join(' ');
    } catch (e) {
      console.log(`No CC available for ${videoId}, attempting Whisper audio extraction...`);
    }

    // 2. Whisper Fallback if CC fails
    const groq = req.app.locals.groqClients && req.app.locals.groqClients.length > 0 ? req.app.locals.groqClients[0] : null;
    
    if (!fullTranscript) {
      if (!groq) {
        return res.status(500).json({ success: false, error: 'Groq client not configured for Whisper fallback.' });
      }

      try {
        const ytdl = require('@distube/ytdl-core');
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        let info;
        try {
          info = await ytdl.getInfo(videoUrl);
        } catch (infoErr) {
          throw new Error('Video unavailable or restricted.');
        }
        
        try {
          const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
          if (!audioFormat) throw new Error('No audio format found');

          const tempFilePath = path.join(os.tmpdir(), `${videoId}.mp4`);
          
          await new Promise((resolve, reject) => {
            ytdl.downloadFromInfo(info, { format: audioFormat })
              .pipe(fs.createWriteStream(tempFilePath))
              .on('finish', resolve)
              .on('error', reject);
          });

          // Send to Groq Whisper
          const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-large-v3-turbo",
          });
          
          fullTranscript = transcription.text;
          fs.unlinkSync(tempFilePath); // Cleanup
        } catch (streamErr) {
          console.log("Audio stream failed, using metadata fallback:", streamErr.message);
          if (info && info.videoDetails) {
            fullTranscript = `Title: ${info.videoDetails.title}\n\nDescription: ${info.videoDetails.description}`;
          } else {
            throw new Error('Could not extract metadata.');
          }
        }
      } catch (audioErr) {
        console.error("Ultimate fallback failed:", audioErr);
        return res.status(400).json({ 
          success: false, 
          error: 'Could not fetch transcript or extract data. The video might be restricted.' 
        });
      }
    }

    // 3. Guardrail & Summarize using Groq
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
