import { prisma } from '../../database/prisma/client.js';
import { AppError } from '../../common/errors/AppError.js';
import { calculateConfigurationPrice } from './priceCalculator.js';
import { vehicleService } from '../vehicles/service.js';
import { toConfigurationCatalog } from '../vehicles/mapper.js';

function selectionFromBody(body: {
  variantId: string;
  colorId?: string;
  wheelId?: string;
  interiorId?: string;
  trimId?: string;
  accessoryIds?: string[];
  options?: {
    exteriorColor?: string;
    wheel?: string;
    interior?: string;
    trim?: string;
    accessories?: string[];
  };
}) {
  return {
    variantId: body.variantId,
    colorId: body.colorId ?? body.options?.exteriorColor ?? '',
    wheelId: body.wheelId ?? body.options?.wheel ?? '',
    interiorId: body.interiorId ?? body.options?.interior ?? '',
    trimId: body.trimId ?? body.options?.trim ?? '',
    accessoryIds: body.accessoryIds ?? body.options?.accessories ?? [],
  };
}

function withDefaults(
  selection: ReturnType<typeof selectionFromBody>,
  catalog: ReturnType<typeof toConfigurationCatalog>,
) {
  return {
    variantId: selection.variantId || catalog.variants[0]?.id || '',
    colorId: selection.colorId || catalog.colors[0]?.id || '',
    wheelId: selection.wheelId || catalog.wheels[0]?.id || '',
    interiorId: selection.interiorId || catalog.interiors[0]?.id || '',
    trimId: selection.trimId || catalog.trims[0]?.id || '',
    accessoryIds: selection.accessoryIds,
  };
}

export class ConfiguratorService {
  async quote(vehicleId: string, body: Parameters<typeof selectionFromBody>[0]) {
    const vehicle = await vehicleService.getById(vehicleId);
    const catalog = toConfigurationCatalog(vehicle);
    const selection = withDefaults(selectionFromBody(body), catalog);
    return { selection, pricing: calculateConfigurationPrice(catalog, selection) };
  }

  async create(userId: string | undefined, body: Parameters<typeof selectionFromBody>[0] & { vehicleId: string }) {
    const { selection, pricing } = await this.quote(body.vehicleId, body);
    const created = await prisma.vehicleConfiguration.create({
      data: {
        userId,
        vehicleId: body.vehicleId,
        variantId: selection.variantId,
        colorId: selection.colorId,
        wheelId: selection.wheelId,
        interiorId: selection.interiorId,
        trimId: selection.trimId,
        accessoryIds: selection.accessoryIds,
        basePrice: pricing.basePrice,
        optionPrice: pricing.optionPrice,
        totalPrice: pricing.totalPrice,
        currency: pricing.currency,
      },
    });
    return this.toDto(created);
  }

  async get(id: string, userId?: string) {
    const row = await prisma.vehicleConfiguration.findUnique({ where: { id } });
    if (!row) throw AppError.notFound('CONFIGURATION_NOT_FOUND', 'Configuration was not found');
    if (row.userId && userId && row.userId !== userId) throw AppError.forbidden();
    return this.toDto(row);
  }

  async update(id: string, userId: string | undefined, body: Parameters<typeof selectionFromBody>[0]) {
    const existing = await prisma.vehicleConfiguration.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('CONFIGURATION_NOT_FOUND', 'Configuration was not found');
    if (existing.userId && userId && existing.userId !== userId) throw AppError.forbidden();
    const { selection, pricing } = await this.quote(existing.vehicleId, {
      ...existing,
      accessoryIds: (existing.accessoryIds as string[]) ?? [],
      ...body,
    });
    const row = await prisma.vehicleConfiguration.update({
      where: { id },
      data: {
        variantId: selection.variantId,
        colorId: selection.colorId,
        wheelId: selection.wheelId,
        interiorId: selection.interiorId,
        trimId: selection.trimId,
        accessoryIds: selection.accessoryIds,
        basePrice: pricing.basePrice,
        optionPrice: pricing.optionPrice,
        totalPrice: pricing.totalPrice,
        currency: pricing.currency,
      },
    });
    return this.toDto(row);
  }

  async remove(id: string, userId: string | undefined) {
    const existing = await prisma.vehicleConfiguration.findUnique({ where: { id } });
    if (!existing) return;
    if (existing.userId && userId && existing.userId !== userId) throw AppError.forbidden();
    await prisma.vehicleConfiguration.delete({ where: { id } });
  }

  private toDto(row: {
    id: string;
    vehicleId: string;
    variantId: string;
    colorId: string;
    wheelId: string;
    interiorId: string;
    trimId: string;
    accessoryIds: unknown;
    basePrice: number;
    optionPrice: number;
    totalPrice: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: row.id,
      vehicleId: row.vehicleId,
      variantId: row.variantId,
      colorId: row.colorId,
      wheelId: row.wheelId,
      interiorId: row.interiorId,
      trimId: row.trimId,
      accessoryIds: row.accessoryIds,
      options: {
        exteriorColor: row.colorId,
        wheel: row.wheelId,
        interior: row.interiorId,
        trim: row.trimId,
        accessories: row.accessoryIds,
      },
      basePrice: row.basePrice,
      optionPrice: row.optionPrice,
      totalPrice: row.totalPrice,
      currency: row.currency,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

export const configuratorService = new ConfiguratorService();
