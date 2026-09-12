import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import { resolveDatabaseUrl } from './databaseUrl.js';

loadEnv();
process.env.DATABASE_URL = resolveDatabaseUrl();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  APP_NAME: z.string().default('aurora-motors-api'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DATABASE_URL: z.string().min(1).default('mysql://aurora:aurora@localhost:3306/aurora'),
  FRONTEND_URLS: z
    .string()
    .default('http://localhost:5173,http://localhost:4173,https://maheshpcse.github.io/car-system/'),
  JWT_ACCESS_SECRET: z.string().min(16).default('dev-access-secret-change-me-32'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-me-32'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).optional(),
  COOKIE_DOMAIN: z.string().optional().default(''),
  DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v !== 'false' && v !== '0'),
  DEMO_PASSWORD: z.string().default('demo1234'),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional().default(''),
  AWS_CLOUDFRONT_DOMAIN: z.string().optional().default(''),
  AWS_SES_FROM_EMAIL: z.string().default('noreply@example.com'),
  AWS_SECRETS_MANAGER_ID: z.string().optional().default(''),
  REDIS_URL: z.string().optional().default(''),
  EMAIL_PROVIDER: z.enum(['console', 'ses']).default('console'),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
});

const parsed = schema.parse(process.env);

const isProduction = parsed.NODE_ENV === 'production';

export const env = {
  ...parsed,
  isProduction,
  isTest: parsed.NODE_ENV === 'test',
  frontendOrigins: parsed.FRONTEND_URLS.split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  cookieSecure: parsed.COOKIE_SECURE ?? isProduction,
  COOKIE_SAMESITE: parsed.COOKIE_SAMESITE ?? (isProduction ? 'none' : 'lax'),
  demoMode: parsed.DEMO_MODE ?? true,
};

export type Env = typeof env;
