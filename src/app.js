'use strict';

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { testConnection } = require('./config');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// ── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── System / Health routes ──────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const db = await testConnection();
  if (!db.ok) {
    return res.status(503).json({ status: 'error', db: db.error });
  }
  res.json({
    status: 'ok',
    db: { connected: true, database: db.database, timestamp: db.timestamp },
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Arabic Educational Platform API', version: '1.0.0' });
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Error Handling Middleware ───────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
