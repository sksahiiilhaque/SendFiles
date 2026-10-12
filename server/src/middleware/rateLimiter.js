import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

export const codeLookupLimiter = rateLimit({
  windowMs: config.rateLimitCodeWindowMinutes * 60 * 1000,
  max: config.rateLimitCodeMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many transfer lookup attempts. Please wait 15 minutes before trying again.'
  }
});

export const createTransferLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many upload sessions created. Please wait before creating more transfers.'
  }
});

export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 180,
  standardHeaders: true,
  legacyHeaders: false
});
