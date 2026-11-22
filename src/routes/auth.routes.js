'use strict';

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, phone: user.phone, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const safeUser = (u) => ({
  id: u.id,
  full_name: u.full_name,
  phone: u.phone,
  email: u.email || null,
  student_id: u.student_id || null,
  current_year_id: u.current_year_id || null,
  governorate_name: u.governorate_name || null,
  center_name: u.center_name || null,
  created_at: u.created_at,
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
/**
 * Body: { full_name, phone, password, email?, governorate_name?, center_name?, parent_phone_number?, current_year_id? }
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const {
      full_name,
      phone,
      password,
      email,
      governorate_name,
      center_name,
      parent_phone_number,
      current_year_id,
    } = req.body;

    // Basic validation
    if (!full_name || !phone || !password) {
      throw new AppError('full_name, phone, and password are required', 400);
    }
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }
    // Normalize phone
    const normalizedPhone = String(phone).trim();

    // Check duplicate
    const existing = await query('SELECT id FROM profiles WHERE phone = $1', [normalizedPhone]);
    if (existing.rows.length > 0) {
      throw new AppError('Phone number already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert
    const result = await query(
      `INSERT INTO profiles
        (full_name, phone, password, email, governorate_name, center_name, parent_phone_number, current_year_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        full_name.trim(),
        normalizedPhone,
        hashedPassword,
        email || null,
        governorate_name || null,
        center_name || null,
        parent_phone_number || null,
        current_year_id || null,
      ]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: safeUser(user),
    });
  })
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
/**
 * Body: { phone, password }
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
      throw new AppError('phone and password are required', 400);
    }

    // Fetch user
    const result = await query('SELECT * FROM profiles WHERE phone = $1', [String(phone).trim()]);
    if (result.rows.length === 0) {
      throw new AppError('Invalid phone number or password', 401);
    }

    const user = result.rows[0];

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError('Invalid phone number or password', 401);
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser(user),
    });
  })
);

// ─── GET /api/auth/me  (requires token) ───────────────────────────────────────
const { authenticate } = require('../middleware/auth');

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM profiles WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) throw new AppError('User not found', 404);

    res.json({ success: true, user: safeUser(result.rows[0]) });
  })
);

module.exports = router;
