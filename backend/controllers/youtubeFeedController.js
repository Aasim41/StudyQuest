const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * GET /api/youtube/feed
 * Fetches default educational content for the home feed.
 */
async function getFeed(req, res) {
  try {
    const { pageToken } = req.query;
    
    // We search for general educational keywords to populate the default feed
    const query = "study techniques OR science OR mathematics OR computer science OR educational";
    
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

module.exports = {
  getFeed,
  searchVideos
};
