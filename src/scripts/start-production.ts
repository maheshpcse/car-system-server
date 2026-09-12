import { execSync } from 'node:child_process';
import { env } from '../config/environment.js';
import { logger } from '../common/logging/logger.js';

logger.info('production.migrate', { app: env.APP_NAME });
execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });

if (process.env.RUN_DB_SEED === 'true') {
  logger.info('production.seed');
  execSync('node dist/database/seed/index.js', { stdio: 'inherit', env: process.env });
}

await import('../app/server.js');
