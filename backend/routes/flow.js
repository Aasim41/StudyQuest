const express = require('express');

const router = express.Router();

const YOUTUBE_RESULTS_URL = 'https://www.youtube.com/results?search_query=';
const SAFE_VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extract candidate YouTube video IDs from ytInitialData in public search HTML,
 * excluding YouTube Shorts (/shorts/), then verify embeddability via oEmbed.
 */
router.get('/search', async (req, res) => {
  const rawQuery = String(req.query.q || '').trim();
  if (!rawQuery) {
    return res.status(400).json({ success: false, error: 'Missing query parameter q' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  try {
    const searchResp = await fetch(`${YOUTUBE_RESULTS_URL}${encodeURIComponent(rawQuery)}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timer);

    if (!searchResp.ok) {
      return res.status(502).json({ success: false, error: 'Upstream search unavailable', items: [] });
    }

    const html = await searchResp.text();
    const candidates = [];
    const seen = new Set();

    // Parse videoRenderer blocks cleanly from embedded JSON
    const rendererRegex = /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"[\s\S]*?"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"\}/g;
    let m;
    while ((m = rendererRegex.exec(html)) !== null && candidates.length < 18) {
      const id = m[1];
      if (!SAFE_VIDEO_ID_RE.test(id) || seen.has(id)) continue;
      seen.add(id);
      const rawTitle = m[2].replace(/\\"/g, '"').replace(/\\u0026/g, '&');
      if (rawTitle.toLowerCase().includes('#shorts')) continue;
      candidates.push(id);
    }

    // Fallback plain ID extraction if layout changed
    if (candidates.length === 0) {
      const fallbackMatches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((x) => x[1]);
      for (const id of fallbackMatches) {
        if (!seen.has(id)) {
          seen.add(id);
          candidates.push(id);
          if (candidates.length >= 14) break;
        }
      }
    }

    // Verify embeddability in parallel via YouTube oEmbed
    const checks = await Promise.all(
      candidates.slice(0, 10).map(async (videoId) => {
        try {
          const oe = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
          );
          if (!oe.ok) return null;
          const meta = await oe.json();
          return {
            id: `yt-${videoId}`,
            videoId,
            title: String(meta.title || 'Educational Lecture').slice(0, 120),
            channel: String(meta.author_name || 'Educator').slice(0, 60),
            duration: 'Lecture',
          };
        } catch {
          return null;
        }
      })
    );

    const items = checks.filter(Boolean);
    return res.json({ success: true, items });
  } catch (err) {
    clearTimeout(timer);
    return res.status(504).json({ success: false, error: 'Search timeout', items: [] });
  }
});

module.exports = router;
