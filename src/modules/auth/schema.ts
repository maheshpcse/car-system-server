import { z } from 'zod';
import { USERNAME_RE } from '../../common/constants/index.js';

const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(USERNAME_RE, 'Username must be 3-32 letters, numbers, dots, underscores, or hyphens');

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  username: usernameField,
  email: z.string().email(),
  password: z.string().min(6).max(128),
  phone: z.string().optional(),
  country: z.string().optional(),
});

export const loginSchema = z
  .object({
    username: z.string().trim().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(1),
    remember: z.boolean().optional(),
  })
  .refine((value) => Boolean(value.username || value.email), {
    message: 'Username or email is required',
    path: ['username'],
  });

export const demoLoginSchema = z.object({
  persona: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(4),
  password: z.string().min(6).max(128),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(8),
});
