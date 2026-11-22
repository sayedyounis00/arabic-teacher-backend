'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/course-requests  — all requests (admin)
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    let sql = `SELECT cr.*, p.full_name, p.phone, c.title AS course_title
               FROM course_requests cr
               JOIN profiles p ON p.id = cr.user_id
               JOIN courses c ON c.id = cr.course_id WHERE 1=1`;
    const params = [];
    if (status) { params.push(status); sql += ` AND cr.status = $${params.length}`; }
    sql += ' ORDER BY cr.created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  })
);

// GET /api/course-requests/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT cr.*, c.title AS course_title FROM course_requests cr
       JOIN courses c ON c.id = cr.course_id
       WHERE cr.user_id = $1 ORDER BY cr.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  })
);

// POST /api/course-requests — student requests enrollment
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { course_id } = req.body;
    if (!course_id) throw new AppError('course_id is required', 400);

    const result = await query(
      `INSERT INTO course_requests (user_id, course_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (user_id, course_id) DO NOTHING
       RETURNING *`,
      [req.user.id, course_id]
    );
    if (!result.rows.length) {
      return res.status(409).json({ success: false, message: 'Request already submitted' });
    }
    res.status(201).json({ success: true, data: result.rows[0] });
  })
);

// PATCH /api/course-requests/:id  — admin approve / reject
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      throw new AppError('status must be: approved, rejected, or pending', 400);
    }

    const result = await query(
      `UPDATE course_requests SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Request not found', 404);

    // Auto-enroll when approved
    if (status === 'approved') {
      const req_ = result.rows[0];
      await query(
        `INSERT INTO enrollments (user_id, course_id)
         VALUES ($1, $2) ON CONFLICT (user_id, course_id) DO NOTHING`,
        [req_.user_id, req_.course_id]
      );
    }

    res.json({ success: true, data: result.rows[0] });
  })
);

module.exports = router;
