import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../database/prisma/client.js';

export const healthRoutes = Router();

healthRoutes.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

healthRoutes.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', checks: { database: 'ok' } });
  } catch {
    res.status(503).json({ status: 'degraded', checks: { database: 'unavailable' } });
  }
});
