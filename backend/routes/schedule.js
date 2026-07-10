const express = require('express');
const router = express.Router();
const { generateSchedule } = require('../controllers/scheduleController');

router.post('/generate', generateSchedule);

module.exports = router;
