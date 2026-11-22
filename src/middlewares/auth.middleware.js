'use strict';

const ApiError = require('../utils/ApiError');

// Optional auth token verification middleware stub
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing or invalid'));
  }

  const token = authHeader.split(' ')[1];
  // Placeholder: decode JWT / verify session token
  req.user = { token };
  next();
};

module.exports = authMiddleware;
