const express = require('express');
const router = express.Router();
const { upload, parseTimetable } = require('../controllers/parseController');

router.post('/timetable', upload.single('file'), parseTimetable);

module.exports = router;
