import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Unhandled API Error', {
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    error: err.userMessage || err.message || 'An unexpected server error occurred. Please try again.'
  });
}
