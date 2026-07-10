const express = require('express');
const router = express.Router();
const { summarizeVideo } = require('../controllers/youtubeController');
const { getFeed, searchVideos } = require('../controllers/youtubeFeedController');

router.post('/summarize', summarizeVideo);
router.get('/feed', getFeed);
router.get('/search', searchVideos);

module.exports = router;
