'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection, pool } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// ── Route imports ───────────────────────────────────────────────────────────
const authRoutes          = require('./routes/auth.routes');
const yearsRoutes         = require('./routes/years.routes');
const coursesRoutes       = require('./routes/courses.routes');
const lessonsRoutes       = require('./routes/lessons.routes');
const enrollmentsRoutes   = require('./routes/enrollments.routes');
const lessonAccessRoutes  = require('./routes/lessonAccess.routes');
const progressRoutes      = require('./routes/progress.routes');
const courseRequestRoutes = require('./routes/courseRequests.routes');
const examsRoutes         = require('./routes/exams.routes');
const complaintsRoutes    = require('./routes/complaints.routes');
const profilesRoutes      = require('./routes/profiles.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4200'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev) ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Health check (Railway uses this) ─────────────────────────────────────────
app.get('/health', async (req, res) => {
  const db = await testConnection();
  if (!db.ok) return res.status(503).json({ status: 'error', db: db.error });
  res.json({ status: 'ok', db: { connected: true, database: db.database, timestamp: db.timestamp } });
});

app.get('/', (req, res) => {
  res.json({ message: 'Arabic Educational Platform API', version: '1.0.0' });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/years',           yearsRoutes);
app.use('/api/courses',         coursesRoutes);
app.use('/api/lessons',         lessonsRoutes);
app.use('/api/enrollments',     enrollmentsRoutes);
app.use('/api/lesson-access',   lessonAccessRoutes);
app.use('/api/progress',        progressRoutes);
app.use('/api/course-requests', courseRequestRoutes);
app.use('/api/exams',           examsRoutes);
app.use('/api/complaints',      complaintsRoutes);
app.use('/api/profiles',        profilesRoutes);

// ── 404 + Error handler (must be last) ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully…`);
  server.close(async () => {
    await pool.end();
    console.log('✅ DB pool closed. Exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
