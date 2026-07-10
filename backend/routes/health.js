/**
 * Health Check Route
 * GET /api/health - Returns server status and dependency health.
 */

const express = require('express');
const router = express.Router();
const { getHealth } = require('../controllers/healthController');

router.get('/', getHealth);

module.exports = router;
