import type { CorsOptions } from 'cors';
import { env } from './environment.js';

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    const allowed = env.frontendOrigins.some((configured) => {
      if (configured === origin) return true;
      if (configured === 'https://maheshpcse.github.io' && origin.startsWith('https://maheshpcse.github.io')) {
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
