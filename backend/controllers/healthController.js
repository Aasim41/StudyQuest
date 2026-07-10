/**
 * Health Controller
 * Returns server uptime, timestamp, and status of connected services.
 */

const fs = require('fs');
const path = require('path');

const UNIVERSITIES_PATH = path.join(__dirname, '..', 'universities.json');

async function getHealth(req, res) {
  const uptimeSeconds = process.uptime();

  // Check universities.json status
  let collegeDataStatus = 'unavailable';
  let collegeCount = 0;
  try {
    const stats = fs.statSync(UNIVERSITIES_PATH);
    if (stats.size > 10) {
      // Quick read to get count without loading full data
      const data = JSON.parse(fs.readFileSync(UNIVERSITIES_PATH, 'utf-8'));
      collegeCount = Array.isArray(data) ? data.length : 0;
      collegeDataStatus = collegeCount > 0 ? 'loaded' : 'empty';
    } else {
      collegeDataStatus = 'empty';
    }
  } catch {
    collegeDataStatus = 'file_missing';
  }

  // Check Firebase
  let firebaseStatus = 'unknown';
  try {
    const admin = req.app.locals.firebaseAdmin;
    // A lightweight check: if admin is initialized, it's good
    if (admin.app()) {
      firebaseStatus = 'connected';
    }
  } catch {
    firebaseStatus = 'error';
  }

  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptimeSeconds)}s`,
    services: {
      firebase: firebaseStatus,
      groq: process.env.GROQ_API_KEY ? 'configured' : 'missing_key',
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing_key',
    },
    data: {
      colleges: collegeDataStatus,
      collegeCount,
    },
  });
}

module.exports = { getHealth };
