'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/courses  — optional ?year_id=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { year_id } = req.query;
    let sql = 'SELECT * FROM courses WHERE is_published = TRUE';
    const params = [];
    if (year_id) {
      params.push(year_id);
      sql += ` AND year_id = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  })
);

// GET /api/courses/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (!result.rows.length) throw new AppError('Course not found', 404);
    res.json({ success: true, data: result.rows[0] });
  })
);

// POST /api/courses
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { year_id, title, description, thumbnail_url, price, is_published } = req.body;
    if (!title) throw new AppError('title is required', 400);

    const result = await query(
      `INSERT INTO courses (year_id, title, description, thumbnail_url, price, is_published)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [year_id || null, title, description || null, thumbnail_url || null, price ?? 0, is_published ?? true]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  })
);

// PATCH /api/courses/:id
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { year_id, title, description, thumbnail_url, price, is_published } = req.body;
    const result = await query(
      `UPDATE courses SET
         year_id       = COALESCE($1, year_id),
         title         = COALESCE($2, title),
         description   = COALESCE($3, description),
         thumbnail_url = COALESCE($4, thumbnail_url),
         price         = COALESCE($5, price),
         is_published  = COALESCE($6, is_published),
         updated_at    = NOW()
       WHERE id = $7 RETURNING *`,
      [year_id, title, description, thumbnail_url, price, is_published, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Course not found', 404);
    res.json({ success: true, data: result.rows[0] });
  })
);

// DELETE /api/courses/:id
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM courses WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) throw new AppError('Course not found', 404);
    res.json({ success: true, message: 'Course deleted' });
  })
);

module.exports = router;
