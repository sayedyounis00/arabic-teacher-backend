'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/lessons?course_id=
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { course_id } = req.query;
    if (!course_id) throw new AppError('course_id query param is required', 400);

    const result = await query(
      `SELECT * FROM lessons WHERE course_id = $1 AND is_published = TRUE ORDER BY order_index ASC`,
      [course_id]
    );
    res.json({ success: true, data: result.rows });
  })
);

// GET /api/lessons/:id
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    if (!result.rows.length) throw new AppError('Lesson not found', 404);
    res.json({ success: true, data: result.rows[0] });
  })
);

// POST /api/lessons
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { course_id, title, content, video_url, order_index, attachment_urls, is_published } = req.body;
    if (!course_id || !title) throw new AppError('course_id and title are required', 400);

    const result = await query(
      `INSERT INTO lessons (course_id, title, content, video_url, order_index, attachment_urls, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        course_id, title, content || null, video_url || null,
        order_index ?? 0, JSON.stringify(attachment_urls || []), is_published ?? true,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  })
);

// PATCH /api/lessons/:id
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, content, video_url, order_index, attachment_urls, is_published } = req.body;
    const result = await query(
      `UPDATE lessons SET
         title           = COALESCE($1, title),
         content         = COALESCE($2, content),
         video_url       = COALESCE($3, video_url),
         order_index     = COALESCE($4, order_index),
         attachment_urls = COALESCE($5, attachment_urls),
         is_published    = COALESCE($6, is_published)
       WHERE id = $7 RETURNING *`,
      [
        title, content, video_url, order_index,
        attachment_urls ? JSON.stringify(attachment_urls) : null,
        is_published, req.params.id,
      ]
    );
    if (!result.rows.length) throw new AppError('Lesson not found', 404);
    res.json({ success: true, data: result.rows[0] });
  })
);

// DELETE /api/lessons/:id
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM lessons WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) throw new AppError('Lesson not found', 404);
    res.json({ success: true, message: 'Lesson deleted' });
  })
);

module.exports = router;
