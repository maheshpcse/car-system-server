import { prisma } from '../../database/prisma/client.js';
import { cache } from '../../infrastructure/cache/MemoryCacheProvider.js';
import { toVehicleDto, vehicleInclude, type VehicleRecord } from './mapper.js';
import type { VehicleDto } from './dto.js';
import { buildVehicleOrderBy, buildVehicleWhere, normalizeSort, type VehicleQueryInput } from './vehicleQuery.js';

export class VehicleRepository {
  async list(query: VehicleQueryInput) {
    const sort = normalizeSort(query.sort);
    const where = buildVehicleWhere(query);
    const [total, rows] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where,
        include: vehicleInclude,
        orderBy: buildVehicleOrderBy(sort),
        skip: query.page && query.limit ? (query.page - 1) * query.limit : undefined,
        take: query.limit,
      }),
    ]);
    return { total, items: (rows as VehicleRecord[]).map(toVehicleDto) };
  }

  async findById(id: string): Promise<VehicleDto | null> {
    const cached = await cache.get<VehicleDto>(`vehicle:${id}`);
    if (cached) return cached;
    const row = await prisma.vehicle.findFirst({
      where: { OR: [{ id }, { slug: id }], isPublished: true },
      include: vehicleInclude,
    });
    if (!row) return null;
    const dto = toVehicleDto(row as VehicleRecord);
    await cache.set(`vehicle:${id}`, dto, 30_000);
    return dto;
  }

  async findManyByIds(ids: string[]) {
    const rows = await prisma.vehicle.findMany({
      where: { id: { in: ids }, isPublished: true },
      include: vehicleInclude,
    });
    const mapped = new Map((rows as VehicleRecord[]).map((row) => [row.id, toVehicleDto(row)]));
    return ids.map((id) => mapped.get(id)).filter((v): v is VehicleDto => Boolean(v));
  }

  async brands() {
    const cached = await cache.get<{ id: string; slug: string; name: string }[]>('brands');
    if (cached) return cached;
    const rows = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    const data = rows.map((b) => ({ id: b.id, slug: b.slug, name: b.name }));
    await cache.set('brands', data, 120_000);
    return data;
  }

  async categories() {
    const cached = await cache.get<{ id: string; slug: string; label: string; description: string; icon: string }[]>(
      'categories',
    );
    if (cached) return cached;
    const rows = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
    const data = rows.map((c) => ({
      id: c.slug,
      slug: c.slug,
      label: c.label,
      description: c.description,
      icon: c.icon,
    }));
    await cache.set('categories', data, 120_000);
    return data;
  }

  async filterOptions() {
    const cached = await cache.get<Record<string, unknown>>('filter-options');
    if (cached) return cached;
    const [brands, categories, vehicles] = await Promise.all([
      this.brands(),
      this.categories(),
      prisma.vehicle.findMany({
        where: { isPublished: true },
        select: { bodyType: true, fuelType: true, transmission: true, price: true, year: true, seats: true },
      }),
    ]);
    const data = {
      brands: brands.map((b) => b.name),
      categories,
      bodyTypes: [...new Set(vehicles.map((v) => v.bodyType))],
      fuelTypes: [...new Set(vehicles.map((v) => v.fuelType))],
      transmissions: [...new Set(vehicles.map((v) => v.transmission))].map((t) =>
        t === 'single_speed' ? 'single-speed' : t === 'dual_clutch' ? 'dual-clutch' : t,
      ),
      priceBounds: [
        Math.min(...vehicles.map((v) => v.price)),
        Math.max(...vehicles.map((v) => v.price)),
      ],
      years: [...new Set(vehicles.map((v) => v.year))].sort((a, b) => b - a),
      seats: [...new Set(vehicles.map((v) => v.seats))].sort((a, b) => a - b),
    };
    await cache.set('filter-options', data, 120_000);
    return data;
  }

  async featured() {
    const rows = await prisma.vehicle.findMany({
      where: { isPublished: true, isFeatured: true },
      include: vehicleInclude,
      orderBy: { rating: 'desc' },
    });
    return (rows as VehicleRecord[]).map(toVehicleDto);
  }
}

export const vehicleRepository = new VehicleRepository();
