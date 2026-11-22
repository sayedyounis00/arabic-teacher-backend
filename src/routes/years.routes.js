'use strict';

const router = require('express').Router();
const { query } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/years — public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM years ORDER BY order_index ASC');
    res.json({ success: true, data: result.rows });
  })
);

// GET /api/years/:id — public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM years WHERE id = $1', [req.params.id]);
    if (!result.rows.length) throw new AppError('Year not found', 404);
    res.json({ success: true, data: result.rows[0] });
  })
);

// POST /api/years — protected (admin use)
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, description, order_index } = req.body;
    if (!title) throw new AppError('title is required', 400);

    const result = await query(
      `INSERT INTO years (title, description, order_index) VALUES ($1, $2, $3) RETURNING *`,
      [title, description || null, order_index || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  })
);

// PATCH /api/years/:id
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, description, order_index } = req.body;
    const result = await query(
      `UPDATE years SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         order_index = COALESCE($3, order_index)
       WHERE id = $4 RETURNING *`,
      [title, description, order_index, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Year not found', 404);
    res.json({ success: true, data: result.rows[0] });
  })
);

// DELETE /api/years/:id
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query('DELETE FROM years WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) throw new AppError('Year not found', 404);
    res.json({ success: true, message: 'Year deleted' });
  })
);

module.exports = router;
