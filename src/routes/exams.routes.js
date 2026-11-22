'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/exams?year_id=&course_id=
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { year_id, course_id } = req.query;
    let sql = 'SELECT * FROM exams WHERE 1=1';
    const params = [];
    if (year_id) { params.push(year_id); sql += ` AND year_id = $${params.length}`; }
    if (course_id) { params.push(course_id); sql += ` AND course_id = $${params.length}`; }
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  })
);

// GET /api/exams/submissions/me — student's own submissions
router.get(
  '/submissions/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT exam_id, submitted_at FROM exam_submissions WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  })
);

// GET /api/exams/:id
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM exams WHERE id = $1', [req.params.id]);
    if (!result.rows.length) throw new AppError('Exam not found', 404);
    res.json({ success: true, data: result.rows[0] });
  })
);

// POST /api/exams
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { course_id, year_id, title, exam_url } = req.body;
    if (!title || !exam_url) throw new AppError('title and exam_url are required', 400);

    const result = await query(
      `INSERT INTO exams (course_id, year_id, title, exam_url) VALUES ($1,$2,$3,$4) RETURNING *`,
      [course_id || null, year_id || null, title, exam_url]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  })
);

// PATCH /api/exams/:id
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { course_id, year_id, title, exam_url } = req.body;
    const result = await query(
      `UPDATE exams SET
         course_id = COALESCE($1, course_id),
         year_id   = COALESCE($2, year_id),
         title     = COALESCE($3, title),
         exam_url  = COALESCE($4, exam_url)
       WHERE id = $5 RETURNING *`,
      [course_id, year_id, title, exam_url, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Exam not found', 404);
    res.json({ success: true, data: result.rows[0] });
  })
);

// DELETE /api/exams/:id
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM exams WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) throw new AppError('Exam not found', 404);
    res.json({ success: true, message: 'Exam deleted' });
  })
);

// POST /api/exams/:id/submit — student submits exam
router.post(
  '/:id/submit',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query(
      `INSERT INTO exam_submissions (user_id, exam_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, exam_id) DO NOTHING
       RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!result.rows.length) {
      return res.status(409).json({ success: false, message: 'Already submitted' });
    }
    res.status(201).json({ success: true, data: result.rows[0] });
  })
);

// GET /api/exams/:id/submissions  — admin
router.get(
  '/:id/submissions',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT es.*, p.full_name, p.phone
       FROM exam_submissions es
       JOIN profiles p ON p.id = es.user_id
       WHERE es.exam_id = $1 ORDER BY es.submitted_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  })
);

module.exports = router;
