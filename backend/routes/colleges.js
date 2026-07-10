/**
 * College Routes
 * GET /api/colleges/search?q=query - Fuzzy search colleges/universities
 */

const express = require('express');
const router = express.Router();
const { searchColleges } = require('../controllers/collegeController');

// Public endpoint - no auth required for search
router.get('/search', searchColleges);

module.exports = router;
