'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// POST /api/complaints — public, any visitor can submit
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { complaint_text, phone_number, user_name, user_id } = req.body;
    if (!complaint_text) throw new AppError('complaint_text is required', 400);

    const result = await query(
      `INSERT INTO complaints (complaint_text, phone_number, user_name, user_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [complaint_text, phone_number || null, user_name || null, user_id || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  })
);

// GET /api/complaints — admin
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM complaints ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  })
);

module.exports = router;
