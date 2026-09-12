import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../database/prisma/client.js';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { requireAuth } from '../../middleware/authenticate.js';

export const notificationRoutes = Router();
notificationRoutes.use(requireAuth);

notificationRoutes.get('/', async (req: Request, res: Response) => {
  const rows = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  sendSuccess(
    res,
    rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
  );
});

notificationRoutes.patch('/read-all', async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, readAt: null },
    data: { readAt: new Date() },
  });
  sendSuccess(res, { ok: true });
});

notificationRoutes.patch('/:id/read', async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { id: String(req.params.id), userId: req.user!.id },
    data: { readAt: new Date() },
  });
  sendSuccess(res, { ok: true });
});
