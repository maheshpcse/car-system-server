import { rateLimit } from 'express-rate-limit';
import { env } from '../config/environment.js';

const skip = () => env.isTest;

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts' } },
});
