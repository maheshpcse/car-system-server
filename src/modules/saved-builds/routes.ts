import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma/client.js';
import { AppError } from '../../common/errors/AppError.js';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { validate } from '../../common/validation/validate.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { configuratorService } from '../configurator/service.js';
import { vehicleService } from '../vehicles/service.js';

const createSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  vehicleId: z.string().min(1),
  variantId: z.string().min(1),
  colorId: z.string().min(1),
  wheelId: z.string().min(1),
  interiorId: z.string().min(1),
  trimId: z.string().min(1),
  accessoryIds: z.array(z.string()).default([]),
  configurationId: z.string().optional(),
});

export const savedBuildRoutes = Router();
savedBuildRoutes.use(requireAuth);

function toFrontend(row: {
  id: string;
  vehicleId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  configuration: {
    variantId: string;
    colorId: string;
    wheelId: string;
    interiorId: string;
    trimId: string;
    accessoryIds: unknown;
    totalPrice: number;
  };
}) {
  return {
    id: row.id,
    vehicleId: row.vehicleId,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    variantId: row.configuration.variantId,
    colorId: row.configuration.colorId,
    wheelId: row.configuration.wheelId,
    interiorId: row.configuration.interiorId,
    trimId: row.configuration.trimId,
    accessoryIds: row.configuration.accessoryIds,
    totalPrice: row.configuration.totalPrice,
    configurationId: undefined as string | undefined,
  };
}

savedBuildRoutes.get('/', async (req: Request, res: Response) => {
  const rows = await prisma.savedBuild.findMany({
    where: { userId: req.user!.id },
    include: { configuration: true },
    orderBy: { createdAt: 'desc' },
  });
  sendSuccess(
    res,
    rows.map((row) => ({ ...toFrontend(row), configurationId: row.configurationId })),
  );
});

savedBuildRoutes.post('/', validate({ body: createSchema }), async (req: Request, res: Response) => {
  const vehicle = await vehicleService.getById(req.body.vehicleId);
  const configuration = req.body.configurationId
    ? await configuratorService.get(req.body.configurationId, req.user!.id)
    : await configuratorService.create(req.user!.id, req.body);
  const name = req.body.name ?? `${vehicle.manufacturer} ${vehicle.model}`;
  const created = await prisma.savedBuild.create({
    data: {
      userId: req.user!.id,
      vehicleId: req.body.vehicleId,
      configurationId: configuration.id,
      name,
    },
    include: { configuration: true },
  });
  await prisma.notification.create({
    data: {
      userId: req.user!.id,
      type: 'configuration_saved',
      title: 'Build saved',
      body: `${name} is now in your garage.`,
    },
  });
  sendSuccess(res, { ...toFrontend(created), configurationId: created.configurationId }, { status: 201 });
});

savedBuildRoutes.get('/:id', validate({ params: z.object({ id: z.string() }) }), async (req: Request, res: Response) => {
  const row = await prisma.savedBuild.findFirst({
    where: { id: String(req.params.id), userId: req.user!.id },
    include: { configuration: true },
  });
  if (!row) throw AppError.notFound('SAVED_BUILD_NOT_FOUND', 'Saved build was not found');
  sendSuccess(res, { ...toFrontend(row), configurationId: row.configurationId });
});

savedBuildRoutes.patch(
  '/:id',
  validate({ params: z.object({ id: z.string() }), body: createSchema.partial() }),
  async (req: Request, res: Response) => {
    const existing = await prisma.savedBuild.findFirst({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    if (!existing) throw AppError.notFound('SAVED_BUILD_NOT_FOUND', 'Saved build was not found');
    if (req.body.variantId) {
      await configuratorService.update(existing.configurationId, req.user!.id, req.body);
    }
    const row = await prisma.savedBuild.update({
      where: { id: existing.id },
      data: { name: req.body.name },
      include: { configuration: true },
    });
    sendSuccess(res, { ...toFrontend(row), configurationId: row.configurationId });
  },
);

savedBuildRoutes.delete('/:id', validate({ params: z.object({ id: z.string() }) }), async (req: Request, res: Response) => {
  await prisma.savedBuild.deleteMany({ where: { id: String(req.params.id), userId: req.user!.id } });
  sendSuccess(res, { ok: true });
});
