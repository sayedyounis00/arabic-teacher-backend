'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/progress/me?course_id=
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const { course_id } = req.query;
    let sql = `SELECT lp.*, l.title AS lesson_title FROM lesson_progress lp
               JOIN lessons l ON l.id = lp.lesson_id
               WHERE lp.user_id = $1`;
    const params = [req.user.id];
    if (course_id) {
      params.push(course_id);
      sql += ` AND l.course_id = $${params.length}`;
    }
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  })
);

// POST /api/progress  — mark lesson complete
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { lesson_id } = req.body;
    if (!lesson_id) throw new AppError('lesson_id is required', 400);

    const result = await query(
      `INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, TRUE, NOW())
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET completed = TRUE, completed_at = NOW()
       RETURNING *`,
      [req.user.id, lesson_id]
    );
    res.json({ success: true, data: result.rows[0] });
  })
);

// DELETE /api/progress/:lesson_id — unmark
router.delete(
  '/:lesson_id',
  authenticate,
  asyncHandler(async (req, res) => {
    await query(
      'DELETE FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2',
      [req.user.id, req.params.lesson_id]
    );
    res.json({ success: true, message: 'Progress removed' });
  })
);

module.exports = router;
