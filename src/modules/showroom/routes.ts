import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma/client.js';
import { AppError } from '../../common/errors/AppError.js';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { validate } from '../../common/validation/validate.js';
import { optionalAuth } from '../../middleware/authenticate.js';
import { vehicleRepository } from '../vehicles/repository.js';
import { vehicleService } from '../vehicles/service.js';

export const showroomRoutes = Router();

const modes = [
  { id: 'explore', label: 'Explore' },
  { id: 'focus', label: 'Focus' },
  { id: 'interior', label: 'Interior' },
  { id: 'compare', label: 'Compare' },
  { id: 'specification', label: 'Specification' },
];

showroomRoutes.get('/', async (_req: Request, res: Response) => {
  const featured = await vehicleRepository.featured();
  sendSuccess(res, {
    title: 'Aurora Virtual Showroom',
    modes,
    featured,
    renderOwner: 'frontend',
  });
});

showroomRoutes.get('/featured', async (_req: Request, res: Response) => {
  sendSuccess(res, await vehicleRepository.featured());
});

showroomRoutes.get('/vehicles', async (_req: Request, res: Response) => {
  const { items } = await vehicleRepository.list({ sort: 'recommended', limit: 24, page: 1 });
  sendSuccess(res, items);
});

showroomRoutes.get('/vehicles/:id', async (req: Request, res: Response) => {
  sendSuccess(res, await vehicleService.getById(String(req.params.id)));
});

showroomRoutes.post(
  '/sessions',
  optionalAuth,
  validate({ body: z.object({ mode: z.string().optional(), vehicleId: z.string().optional() }) }),
  async (req: Request, res: Response) => {
    const session = await prisma.showroomSession.create({
      data: {
        userId: req.user?.id,
        mode: req.body.mode ?? 'explore',
        vehicleId: req.body.vehicleId,
      },
    });
    sendSuccess(res, session, { status: 201 });
  },
);

showroomRoutes.patch(
  '/sessions/:id',
  optionalAuth,
  validate({ body: z.object({ mode: z.string().optional(), vehicleId: z.string().optional() }) }),
  async (req: Request, res: Response) => {
    const existing = await prisma.showroomSession.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw AppError.notFound('SESSION_NOT_FOUND', 'Showroom session was not found');
    const session = await prisma.showroomSession.update({
      where: { id: existing.id },
      data: { mode: req.body.mode, vehicleId: req.body.vehicleId },
    });
    sendSuccess(res, session);
  },
);

showroomRoutes.post(
  '/sessions/:id/events',
  optionalAuth,
  validate({
    body: z.object({
      type: z.enum(['vehicleOpened', 'configurationStarted', 'comparisonAdded', 'favoriteAdded']),
      payload: z.record(z.string(), z.unknown()).optional(),
    }),
  }),
  async (req: Request, res: Response) => {
    const existing = await prisma.showroomSession.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw AppError.notFound('SESSION_NOT_FOUND', 'Showroom session was not found');
    const event = await prisma.showroomEvent.create({
      data: { sessionId: existing.id, type: req.body.type, payload: req.body.payload },
    });
    sendSuccess(res, event, { status: 201 });
  },
);
