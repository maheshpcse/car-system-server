import type { CorsOptions } from 'cors';
import { env } from './environment.js';

/** Browsers send Origin without a path. FRONTEND_URLS may include /car-system/. */
function originHost(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/$/, '');
  }
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    const allowed = env.frontendOrigins.some((configured) => {
      if (configured === origin || originHost(configured) === origin) return true;
      if (origin.startsWith('https://maheshpcse.github.io') && originHost(configured).startsWith('https://maheshpcse.github.io')) {
        return true;
      }
      return false;
    });
    if (allowed) {
      callback(null, true);
      return;
    }
    if (!env.isProduction && origin.startsWith('http://localhost')) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
};
