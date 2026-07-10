const express = require('express');
const router = express.Router();
const { upload, parseTimetable, parseCalendar, parseSyllabus } = require('../controllers/parseController');

router.post('/timetable', upload.single('file'), parseTimetable);
router.post('/calendar', upload.single('file'), parseCalendar);
router.post('/syllabus', upload.single('file'), parseSyllabus);

module.exports = router;
