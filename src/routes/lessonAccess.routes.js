'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/lesson-access/me?course_id=
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const { course_id } = req.query;
    let sql = `SELECT la.*, l.title AS lesson_title FROM lesson_access la
               JOIN lessons l ON l.id = la.lesson_id
               WHERE la.user_id = $1`;
    const params = [req.user.id];
    if (course_id) { params.push(course_id); sql += ` AND la.course_id = $${params.length}`; }

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  })
);

// POST /api/lesson-access  — grant individual lesson access
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { user_id, lesson_id, course_id, notes, expires_at } = req.body;
    if (!user_id || !lesson_id || !course_id) {
      throw new AppError('user_id, lesson_id, course_id are required', 400);
    }

    const result = await query(
      `INSERT INTO lesson_access (user_id, lesson_id, course_id, notes, expires_at)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id, lesson_id) DO NOTHING
       RETURNING *`,
      [user_id, lesson_id, course_id, notes || null, expires_at || null]
    );
    if (!result.rows.length) {
      return res.status(409).json({ success: false, message: 'Access already granted' });
    }
    res.status(201).json({ success: true, data: result.rows[0] });
  })
);

// DELETE /api/lesson-access/:id
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM lesson_access WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) throw new AppError('Record not found', 404);
    res.json({ success: true, message: 'Access revoked' });
  })
);

module.exports = router;
