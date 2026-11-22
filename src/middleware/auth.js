'use strict';

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

/**
 * Verifies the JWT from the Authorization: Bearer <token> header.
 * Attaches decoded payload to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return next(new AppError('Authentication token required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, phone, full_name, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired, please login again', 401));
    }
    return next(new AppError('Invalid token', 401));
  }
};

module.exports = { authenticate };
