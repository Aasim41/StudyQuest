/**
 * StudyQuest Backend - Express Server
 * 
 * Main entry point. Sets up Express with security headers, CORS, Firebase Admin,
 * Groq SDK, Gemini API, and mounts all route handlers.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// ─── Firebase Admin ─────────────────────────────────────────────────────────
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const adminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "studyquest-43b26.firebasestorage.app",
});

// ─── Groq SDK ───────────────────────────────────────────────────────────────
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Gemini API ─────────────────────────────────────────────────────────────
const { GoogleGenAI } = require('@google/genai');
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Express App ────────────────────────────────────────────────────────────
const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// ─── Request Logger ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(
      `[${logLevel}] ${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  next();
});

// ─── Security Headers (helmet-like) ────────────────────────────────────────
app.use((req, res, next) => {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Strict transport security (1 year)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Remove powered-by header
  res.removeHeader('X-Powered-By');
  next();
});

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
}));

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ─── Attach shared clients to app.locals for route access ───────────────────
app.locals.firebaseAdmin = admin;
app.locals.groq = groq;
app.locals.genai = genai;

// ─── Routes ─────────────────────────────────────────────────────────────────
const healthRoutes = require('./routes/health');
const collegeRoutes = require('./routes/colleges');
const parseRoutes = require('./routes/parse');
const scheduleRoutes = require('./routes/schedule');
const youtubeRoutes = require('./routes/youtube');
const mergeRoutes = require('./routes/merge');

app.use('/api/health', healthRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/parse', parseRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/schedule/merge', mergeRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  console.error(err.stack || err);

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  StudyQuest Backend Server`);
  console.log(`  Port:        ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Firebase:    Initialized`);
  console.log(`  Groq:        ${process.env.GROQ_API_KEY ? 'Configured' : 'Missing API Key'}`);
  console.log(`  Gemini:      ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing API Key'}`);
  console.log(`${'='.repeat(50)}\n`);
});

module.exports = app;
