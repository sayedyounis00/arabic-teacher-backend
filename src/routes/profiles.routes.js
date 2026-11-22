'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/profiles — admin: list all users
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { year_id, search } = req.query;
    let sql = `SELECT id, full_name, phone, email, student_id, current_year_id,
                      governorate_name, center_name, created_at
               FROM profiles WHERE 1=1`;
    const params = [];
    if (year_id) { params.push(year_id); sql += ` AND current_year_id = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (full_name ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  })
);

// GET /api/profiles/:id
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT id, full_name, phone, email, student_id, current_year_id,
              governorate_name, center_name, parent_phone_number, created_at, updated_at
       FROM profiles WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) throw new AppError('Profile not found', 404);
    res.json({ success: true, data: result.rows[0] });
  })
);

// PATCH /api/profiles/:id  — user updates own profile
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    // Only allow self-update (or admin can skip this check)
    if (req.user.id !== req.params.id) {
      throw new AppError('You can only update your own profile', 403);
    }

    const { full_name, email, governorate_name, center_name, parent_phone_number, current_year_id } = req.body;

    const result = await query(
      `UPDATE profiles SET
         full_name           = COALESCE($1, full_name),
         email               = COALESCE($2, email),
         governorate_name    = COALESCE($3, governorate_name),
         center_name         = COALESCE($4, center_name),
         parent_phone_number = COALESCE($5, parent_phone_number),
         current_year_id     = COALESCE($6, current_year_id),
         updated_at          = NOW()
       WHERE id = $7 RETURNING
         id, full_name, phone, email, student_id, current_year_id,
         governorate_name, center_name, parent_phone_number, created_at, updated_at`,
      [full_name, email, governorate_name, center_name, parent_phone_number, current_year_id, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Profile not found', 404);
    res.json({ success: true, data: result.rows[0] });
  })
);

module.exports = router;
