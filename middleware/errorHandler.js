const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  // Log error
  logger.error('API Error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
    user: req.user ? req.user.id : null
  });

  // Handle specific error types
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: 'Invalid ID format',
      field: err.path
    });
  }

  if (err.code === 11000) { // MongoDB duplicate key
    return res.status(409).json({
      message: 'Duplicate value not allowed',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
