'use strict';

const ApiError = require('../utils/ApiError');

const validateCreateUser = (req, res, next) => {
  const { full_name, phone, password } = req.body || {};
  const errors = [];

  if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
    errors.push('full_name is required');
  }
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    errors.push('phone is required');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Validation failed', errors));
  }

  next();
};

const validateGetUserById = (req, res, next) => {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-fA-F-]{36}$/;
  if (!id || !uuidRegex.test(id)) {
    return next(ApiError.badRequest('Invalid user id format (UUID expected)'));
  }
  next();
};

module.exports = {
  validateCreateUser,
  validateGetUserById,
};
