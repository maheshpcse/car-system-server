import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma/client.js';
import { AppError } from '../../common/errors/AppError.js';
import { MAX_COMPARE } from '../../common/constants/index.js';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { validate } from '../../common/validation/validate.js';
import { optionalAuth, requireAuth } from '../../middleware/authenticate.js';
import { vehicleService } from '../vehicles/service.js';

const bodySchema = z.object({
  vehicleIds: z.array(z.string()).min(1).max(MAX_COMPARE),
});

export const comparisonRoutes = Router();

comparisonRoutes.post('/', optionalAuth, validate({ body: bodySchema }), async (req: Request, res: Response) => {
  const created = await prisma.comparison.create({
    data: {
      userId: req.user?.id,
      items: {
        create: req.body.vehicleIds.map((vehicleId: string, sortOrder: number) => ({ vehicleId, sortOrder })),
      },
    },
    include: { items: true },
  });
  sendSuccess(res, await present(created.id), { status: 201 });
});

comparisonRoutes.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  sendSuccess(res, await present(String(req.params.id), req.user?.id));
});

comparisonRoutes.patch('/:id', requireAuth, validate({ body: bodySchema }), async (req: Request, res: Response) => {
  const existing = await prisma.comparison.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) throw AppError.notFound('COMPARISON_NOT_FOUND', 'Comparison was not found');
  if (existing.userId && existing.userId !== req.user!.id) throw AppError.forbidden();
  await prisma.comparisonItem.deleteMany({ where: { comparisonId: existing.id } });
  await prisma.comparisonItem.createMany({
    data: req.body.vehicleIds.map((vehicleId: string, sortOrder: number) => ({
      comparisonId: existing.id,
      vehicleId,
      sortOrder,
    })),
  });
  sendSuccess(res, await present(existing.id));
});

comparisonRoutes.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.comparison.deleteMany({ where: { id: String(req.params.id), userId: req.user!.id } });
  sendSuccess(res, { ok: true });
});

async function present(id: string, userId?: string) {
  const row = await prisma.comparison.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!row) throw AppError.notFound('COMPARISON_NOT_FOUND', 'Comparison was not found');
  if (row.userId && userId && row.userId !== userId) throw AppError.forbidden();
  const ids = row.items.map((item) => item.vehicleId);
  return {
    id: row.id,
    vehicleIds: ids,
    ...(await vehicleService.compare(ids)),
    createdAt: row.createdAt.toISOString(),
  };
}
