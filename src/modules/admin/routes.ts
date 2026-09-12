import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import type { Transmission } from '@prisma/client';
import { prisma } from '../../database/prisma/client.js';
import { AppError } from '../../common/errors/AppError.js';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { validate } from '../../common/validation/validate.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/authorize.js';
import { writeAudit } from '../audit/service.js';
import { adminVehicleSchema } from '../vehicles/schema.js';
import { cache } from '../../infrastructure/cache/MemoryCacheProvider.js';

const TRANSMISSION_DB: Record<string, Transmission> = {
  automatic: 'automatic',
  manual: 'manual',
  'single-speed': 'single_speed',
  'dual-clutch': 'dual_clutch',
};

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireAdmin);

adminRoutes.get('/vehicles', async (_req: Request, res: Response) => {
  const rows = await prisma.vehicle.findMany({ orderBy: { updatedAt: 'desc' }, take: 100 });
  sendSuccess(res, rows);
});

adminRoutes.post('/vehicles', validate({ body: adminVehicleSchema }), async (req: Request, res: Response) => {
  const body = req.body;
  const id = body.id ?? `${body.manufacturer}-${body.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const brand = await prisma.brand.upsert({
    where: { slug: body.manufacturer.toLowerCase() },
    update: {},
    create: { slug: body.manufacturer.toLowerCase(), name: body.manufacturer },
  });
  const created = await prisma.vehicle.create({
    data: {
      id,
      slug: body.slug ?? id,
      brandId: brand.id,
      manufacturer: body.manufacturer,
      model: body.model,
      variant: body.variant,
      year: body.year,
      tagline: body.tagline,
      description: body.description,
      bodyType: body.bodyType,
      fuelType: body.fuelType,
      transmission: TRANSMISSION_DB[body.transmission] ?? 'automatic',
      power: body.power,
      torque: body.torque,
      topSpeed: body.topSpeed,
      acceleration: body.acceleration,
      range: body.range,
      mileage: body.mileage,
      seats: body.seats,
      price: body.price,
      rating: body.rating ?? 4.5,
      isNew: body.isNew ?? false,
      isFeatured: body.isFeatured ?? false,
      isPublished: body.isPublished ?? true,
      model3d: body.model3d,
      silhouette: body.silhouette,
      renderMode: body.renderMode ?? 'procedural',
      renderConfig: body.renderConfig,
    },
  });
  await writeAudit({
    actorUserId: req.user!.id,
    action: 'VEHICLE_CREATED',
    resourceType: 'vehicle',
    resourceId: created.id,
    afterData: { id: created.id, price: created.price },
    requestId: req.requestId,
  });
  await cache.del('filter-options');
  sendSuccess(res, created, { status: 201 });
});

adminRoutes.patch(
  '/vehicles/:id',
  validate({ params: z.object({ id: z.string() }), body: adminVehicleSchema.partial() }),
  async (req: Request, res: Response) => {
    const existing = await prisma.vehicle.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw AppError.notFound('VEHICLE_NOT_FOUND', 'Vehicle was not found');
    const data: Record<string, unknown> = { ...req.body };
    if (req.body.transmission) data.transmission = TRANSMISSION_DB[req.body.transmission];
    delete data.category;
    const updated = await prisma.vehicle.update({ where: { id: existing.id }, data });
    if (req.body.price !== undefined && req.body.price !== existing.price) {
      await writeAudit({
        actorUserId: req.user!.id,
        action: 'PRICE_CHANGED',
        resourceType: 'vehicle',
        resourceId: existing.id,
        beforeData: { price: existing.price },
        afterData: { price: req.body.price },
        requestId: req.requestId,
      });
    } else {
      await writeAudit({
        actorUserId: req.user!.id,
        action: 'VEHICLE_UPDATED',
        resourceType: 'vehicle',
        resourceId: existing.id,
        beforeData: { price: existing.price, variant: existing.variant },
        afterData: { price: updated.price, variant: updated.variant },
        requestId: req.requestId,
      });
    }
    await cache.del(`vehicle:${existing.id}`);
    sendSuccess(res, updated);
  },
);

adminRoutes.delete('/vehicles/:id', async (req: Request, res: Response) => {
  const existing = await prisma.vehicle.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) throw AppError.notFound('VEHICLE_NOT_FOUND', 'Vehicle was not found');
  await prisma.vehicle.update({ where: { id: existing.id }, data: { isPublished: false } });
  await writeAudit({
    actorUserId: req.user!.id,
    action: 'VEHICLE_ARCHIVED',
    resourceType: 'vehicle',
    resourceId: existing.id,
    beforeData: { isPublished: true },
    afterData: { isPublished: false },
    requestId: req.requestId,
  });
  sendSuccess(res, { ok: true });
});

adminRoutes.post(
  '/brands',
  validate({ body: z.object({ name: z.string(), slug: z.string().optional(), description: z.string().optional() }) }),
  async (req: Request, res: Response) => {
    const created = await prisma.brand.create({
      data: {
        name: req.body.name,
        slug: req.body.slug ?? req.body.name.toLowerCase(),
        description: req.body.description,
      },
    });
    await writeAudit({
      actorUserId: req.user!.id,
      action: 'BRAND_CREATED',
      resourceType: 'brand',
      resourceId: created.id,
      afterData: created,
      requestId: req.requestId,
    });
    sendSuccess(res, created, { status: 201 });
  },
);

adminRoutes.post(
  '/categories',
  validate({
    body: z.object({
      slug: z.string(),
      label: z.string(),
      description: z.string(),
      icon: z.string(),
    }),
  }),
  async (req: Request, res: Response) => {
    const created = await prisma.category.create({ data: req.body });
    await writeAudit({
      actorUserId: req.user!.id,
      action: 'CATEGORY_CREATED',
      resourceType: 'category',
      resourceId: created.id,
      afterData: created,
      requestId: req.requestId,
    });
    sendSuccess(res, created, { status: 201 });
  },
);

adminRoutes.post(
  '/vehicles/:id/variants',
  validate({
    body: z.object({
      optionId: z.string(),
      name: z.string(),
      price: z.number(),
      power: z.number(),
      range: z.number(),
      acceleration: z.number(),
    }),
  }),
  async (req: Request, res: Response) => {
    const created = await prisma.vehicleVariant.create({
      data: { vehicleId: String(req.params.id), ...req.body },
    });
    await writeAudit({
      actorUserId: req.user!.id,
      action: 'VARIANT_CREATED',
      resourceType: 'vehicle_variant',
      resourceId: created.id,
      afterData: created,
      requestId: req.requestId,
    });
    sendSuccess(res, created, { status: 201 });
  },
);

adminRoutes.post(
  '/vehicles/:id/features',
  validate({
    body: z.object({
      kind: z.enum(['FEATURE', 'TECHNOLOGY', 'SAFETY']),
      label: z.string(),
    }),
  }),
  async (req: Request, res: Response) => {
    const created = await prisma.vehicleFeature.create({
      data: { vehicleId: String(req.params.id), kind: req.body.kind, label: req.body.label },
    });
    sendSuccess(res, created, { status: 201 });
  },
);

adminRoutes.post(
  '/vehicles/:id/specifications',
  validate({
    body: z.object({
      lengthMm: z.number(),
      widthMm: z.number(),
      heightMm: z.number(),
      wheelbaseMm: z.number(),
      cargoLiters: z.number(),
      weightKg: z.number(),
    }),
  }),
  async (req: Request, res: Response) => {
    const created = await prisma.vehicleSpecification.upsert({
      where: { vehicleId: String(req.params.id) },
      update: req.body,
      create: { vehicleId: String(req.params.id), ...req.body },
    });
    sendSuccess(res, created);
  },
);

adminRoutes.post(
  '/vehicles/:id/media',
  validate({
    body: z.object({
      mediaType: z.enum(['IMAGE', 'GALLERY', 'MODEL_3D', 'TEXTURE', 'HDR', 'AVATAR', 'THUMBNAIL']),
      storageKey: z.string(),
      cdnUrl: z.string(),
      mimeType: z.string(),
      fileSize: z.number(),
      displayOrder: z.number().optional(),
    }),
  }),
  async (req: Request, res: Response) => {
    const created = await prisma.vehicleMedia.create({
      data: { vehicleId: String(req.params.id), displayOrder: 0, ...req.body },
    });
    sendSuccess(res, created, { status: 201 });
  },
);

adminRoutes.get('/audit-logs', async (_req: Request, res: Response) => {
  const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  sendSuccess(res, rows);
});

adminRoutes.patch(
  '/users/:id/role',
  validate({ body: z.object({ role: z.enum(['CUSTOMER', 'SHOWROOM_VISITOR', 'SALES_ADVISOR', 'ADMIN', 'SUPER_ADMIN']) }) }),
  async (req: Request, res: Response) => {
    const existing = await prisma.user.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw AppError.notFound('USER_NOT_FOUND', 'User was not found');
    const updated = await prisma.user.update({ where: { id: existing.id }, data: { role: req.body.role } });
    await writeAudit({
      actorUserId: req.user!.id,
      action: 'ROLE_CHANGED',
      resourceType: 'user',
      resourceId: existing.id,
      beforeData: { role: existing.role },
      afterData: { role: updated.role },
      requestId: req.requestId,
    });
    sendSuccess(res, { id: updated.id, role: updated.role });
  },
);

adminRoutes.patch('/users/:id/disable', async (req: Request, res: Response) => {
  const updated = await prisma.user.update({
    where: { id: String(req.params.id) },
    data: { isActive: false },
  });
  await writeAudit({
    actorUserId: req.user!.id,
    action: 'USER_DISABLED',
    resourceType: 'user',
    resourceId: updated.id,
    afterData: { isActive: false },
    requestId: req.requestId,
  });
  sendSuccess(res, { id: updated.id, isActive: false });
});
