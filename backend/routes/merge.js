const express = require('express');
const router = express.Router();
const { mergeSchedule } = require('../controllers/mergeController');
const authMiddleware = require('../middleware/auth');

// POST /api/schedule/merge/generate
router.post('/generate', mergeSchedule);

module.exports = router;
