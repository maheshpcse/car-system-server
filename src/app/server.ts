import { env } from '../config/environment.js';
import { logger } from '../common/logging/logger.js';
import { prisma } from '../database/prisma/client.js';
import { createApp } from './app.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info('api.listening', { port: env.PORT, env: env.NODE_ENV, app: env.APP_NAME });
});

async function shutdown(signal: string) {
  logger.info('api.shutdown', { signal });
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
