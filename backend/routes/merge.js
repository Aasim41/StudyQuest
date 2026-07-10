const express = require('express');
const router = express.Router();
const { mergeSchedule } = require('../controllers/mergeController');
const { verifyToken } = require('../middleware/auth'); // assuming verifyToken exists, if not we'll just not use it or add it

// POST /api/schedule/merge/generate
router.post('/generate', mergeSchedule);

module.exports = router;
