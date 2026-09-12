import { Router } from 'express';
import { validate } from '../../common/validation/validate.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import {
  demoLogin,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  resetPassword,
  signup,
  verifyEmail,
} from './controller.js';
import {
  demoLoginSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from './schema.js';

export const authRoutes = Router();

authRoutes.post('/signup', authLimiter, validate({ body: signupSchema }), signup);
authRoutes.post('/login', authLimiter, validate({ body: loginSchema }), login);
authRoutes.post('/demo-login', authLimiter, validate({ body: demoLoginSchema }), demoLogin);
authRoutes.post('/logout', logout);
authRoutes.post('/refresh', refresh);
authRoutes.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);
authRoutes.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), resetPassword);
authRoutes.post('/verify-email', validate({ body: verifyEmailSchema }), verifyEmail);
authRoutes.get('/me', requireAuth, me);
