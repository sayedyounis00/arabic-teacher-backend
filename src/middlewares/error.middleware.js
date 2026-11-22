'use strict';

const { isProduction } = require('../config');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = (isProduction && status === 500) ? 'Internal server error' : err.message;

  logger.error(`${req.method} ${req.originalUrl} - ${status}: ${err.message}`, err.stack);

  res.status(status).json({
    success: false,
    error: message,
    ...(err.details ? { details: err.details } : {}),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
