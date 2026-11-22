'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/enrollments/me  — logged-in user's enrolled courses
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT e.*, c.title AS course_title, c.thumbnail_url, c.description
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  })
);

// GET /api/enrollments?user_id=&course_id= (admin)
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { user_id, course_id } = req.query;
    let sql = `SELECT e.*, p.full_name, p.phone, c.title AS course_title
               FROM enrollments e
               JOIN profiles p ON p.id = e.user_id
               JOIN courses c ON c.id = e.course_id WHERE 1=1`;
    const params = [];
    if (user_id) { params.push(user_id); sql += ` AND e.user_id = $${params.length}`; }
    if (course_id) { params.push(course_id); sql += ` AND e.course_id = $${params.length}`; }
    sql += ' ORDER BY e.enrolled_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  })
);

// POST /api/enrollments  — enroll a user (admin grants access)
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { user_id, course_id, expires_at } = req.body;
    if (!user_id || !course_id) throw new AppError('user_id and course_id are required', 400);

    const result = await query(
      `INSERT INTO enrollments (user_id, course_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, course_id) DO NOTHING
       RETURNING *`,
      [user_id, course_id, expires_at || null]
    );
    if (!result.rows.length) {
      return res.status(409).json({ success: false, message: 'Already enrolled' });
    }
    res.status(201).json({ success: true, data: result.rows[0] });
  })
);

// DELETE /api/enrollments/:id
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM enrollments WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) throw new AppError('Enrollment not found', 404);
    res.json({ success: true, message: 'Enrollment removed' });
  })
);

module.exports = router;
