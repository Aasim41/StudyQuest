const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * GET /api/youtube/feed
 * Fetches default educational content for the home feed.
 */
async function getFeed(req, res) {
  try {
    const { pageToken, history } = req.query;
    
    // Default search for educational keywords
    let query = "study techniques OR science OR mathematics OR computer science OR educational";
    
    if (history) {
      // Clean history to form a personalized search query
      const historyItems = history.split(',').slice(0, 3).map(h => h.trim());
      query = historyItems.join(' OR ');
    }
    
    let url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=27&maxResults=15&key=${YOUTUBE_API_KEY}`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    res.json({
      success: true,
      items: data.items,
      nextPageToken: data.nextPageToken
    });

  } catch (error) {
    console.error('[YOUTUBE FEED ERROR]', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/youtube/search
 * Searches YouTube strictly for educational content based on user query.
 */
async function searchVideos(req, res) {
  try {
    const { q, pageToken } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    // Append 'educational' context to the search or restrict to Category 27 (Education)
    let url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(q)}&type=video&videoCategoryId=27&maxResults=15&key=${YOUTUBE_API_KEY}`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    res.json({
      success: true,
      items: data.items,
      nextPageToken: data.nextPageToken
    });

  } catch (error) {
    console.error('[YOUTUBE SEARCH ERROR]', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/youtube/suggest
 * Gets autocomplete suggestions using Google's suggest API
 */
async function getSuggestions(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query required' });
    }

    const url = `http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`;
    const response = await fetch(url);
    const data = await response.json();

    // The suggest API returns an array: [query, [suggestions...]]
    const suggestions = data[1] || [];

    res.json({
      success: true,
      suggestions: suggestions.slice(0, 5) // Send top 5 suggestions
    });
  } catch (error) {
    console.error('[YOUTUBE SUGGEST ERROR]', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/youtube/related
 * Simulates related videos by searching for the current video title (excluding itself)
 */
async function getRelatedVideos(req, res) {
  try {
    const { title, videoId } = req.query;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title required' });
    }

    // Clean title for better results (remove common stop words or punctuation if needed, 
    // but standard search handles it fine)
    let url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(title)}&type=video&videoCategoryId=27&maxResults=10&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    // Filter out the currently playing video
    const items = (data.items || []).filter(item => item.id.videoId !== videoId);

    res.json({
      success: true,
      items: items
    });
  } catch (error) {
    console.error('[YOUTUBE RELATED ERROR]', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getFeed,
  searchVideos,
  getSuggestions,
  getRelatedVideos
};
