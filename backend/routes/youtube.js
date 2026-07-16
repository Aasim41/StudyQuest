const express = require('express');
const router = express.Router();
const { summarizeVideo } = require('../controllers/youtubeController');
const { getFeed, searchVideos, getSuggestions, getRelatedVideos } = require('../controllers/youtubeFeedController');

router.post('/summarize', summarizeVideo);
router.get('/feed', getFeed);
router.get('/search', searchVideos);
router.get('/suggest', getSuggestions);
router.get('/related', getRelatedVideos);

module.exports = router;
