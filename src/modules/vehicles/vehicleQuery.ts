import type { Prisma } from '@prisma/client';
import type { SortKey } from './dto.js';

export interface VehicleQueryInput {
  search?: string;
  category?: string;
  brands?: string[];
  brand?: string;
  bodyType?: string;
  bodyTypes?: string[];
  fuelType?: string;
  fuelTypes?: string[];
  transmission?: string;
  transmissions?: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  minPower?: number;
  minRange?: number;
  seats?: number;
  minSeats?: number;
  sort?: SortKey;
  page?: number;
  limit?: number;
}

const TRANSMISSION_DB: Record<string, string> = {
  automatic: 'automatic',
  manual: 'manual',
  'single-speed': 'single_speed',
  single_speed: 'single_speed',
  'dual-clutch': 'dual_clutch',
  dual_clutch: 'dual_clutch',
};

export function normalizeSort(sort?: string): SortKey {
  switch (sort) {
    case 'price_asc':
    case 'price-asc':
      return 'price-asc';
    case 'price_desc':
    case 'price-desc':
      return 'price-desc';
    case 'power_desc':
    case 'performance':
      return 'performance';
    case 'range_desc':
    case 'range':
      return 'range';
    case 'name_asc':
    case 'alphabetical':
      return 'alphabetical';
    case 'name_desc':
      return 'name_desc';
    case 'newest':
      return 'newest';
    default:
      return 'recommended';
  }
}

export function buildVehicleWhere(query: VehicleQueryInput): Prisma.VehicleWhereInput {
  const and: Prisma.VehicleWhereInput[] = [{ isPublished: true }];

  if (query.search?.trim()) {
    const term = query.search.trim();
    const or: Prisma.VehicleWhereInput[] = [
      { manufacturer: { contains: term } },
      { model: { contains: term } },
      { variant: { contains: term } },
      { tagline: { contains: term } },
      { id: { contains: term } },
    ];
    const bodyTypes = ['sedan', 'suv', 'coupe', 'hatchback', 'wagon', 'roadster', 'crossover', 'pickup'];
    const fuelTypes = ['electric', 'hybrid', 'petrol', 'diesel'];
    if (bodyTypes.includes(term.toLowerCase())) or.push({ bodyType: { equals: term.toLowerCase() as never } });
    if (fuelTypes.includes(term.toLowerCase())) or.push({ fuelType: { equals: term.toLowerCase() as never } });
    and.push({ OR: or });
  }

  if (query.category && query.category !== 'all') {
    and.push({ categories: { some: { category: { slug: query.category } } } });
  }

  const brands = [...(query.brands ?? []), ...(query.brand ? [query.brand] : [])];
  if (brands.length) {
    and.push({ manufacturer: { in: brands } });
  }

  const bodyTypes = [...(query.bodyTypes ?? []), ...(query.bodyType ? [query.bodyType] : [])];
  if (bodyTypes.length) {
    and.push({ bodyType: { in: bodyTypes as never } });
  }

  const fuelTypes = [...(query.fuelTypes ?? []), ...(query.fuelType ? [query.fuelType] : [])];
  if (fuelTypes.length) {
    and.push({ fuelType: { in: fuelTypes as never } });
  }

  const transmissions = [...(query.transmissions ?? []), ...(query.transmission ? [query.transmission] : [])]
    .map((t) => TRANSMISSION_DB[t] ?? t);
  if (transmissions.length) {
    and.push({ transmission: { in: transmissions as never } });
  }

  if (query.minPrice !== undefined) and.push({ price: { gte: query.minPrice } });
  if (query.maxPrice !== undefined) and.push({ price: { lte: query.maxPrice } });
  if (query.minYear !== undefined) and.push({ year: { gte: query.minYear } });
  if (query.minPower !== undefined) and.push({ power: { gte: query.minPower } });
  if (query.minRange !== undefined) and.push({ range: { gte: query.minRange } });
  const seats = query.seats ?? query.minSeats;
  if (seats !== undefined) and.push({ seats: { gte: seats } });

  return { AND: and };
}

export function buildVehicleOrderBy(sort: SortKey): Prisma.VehicleOrderByWithRelationInput[] {
  switch (sort) {
    case 'newest':
      return [{ year: 'desc' }, { rating: 'desc' }];
    case 'price-asc':
      return [{ price: 'asc' }];
    case 'price-desc':
      return [{ price: 'desc' }];
    case 'performance':
      return [{ acceleration: 'asc' }, { power: 'desc' }];
    case 'range':
      return [{ range: 'desc' }];
    case 'alphabetical':
      return [{ manufacturer: 'asc' }, { model: 'asc' }];
    case 'name_desc':
      return [{ manufacturer: 'desc' }, { model: 'desc' }];
    case 'recommended':
    default:
      return [{ isFeatured: 'desc' }, { rating: 'desc' }];
  }
}

export function matchesSearchBlob(
  haystack: string,
  query: string,
): boolean {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const q = normalize(query);
  if (!q) return true;
  const text = normalize(haystack);
  return q.split(' ').every((term) => text.includes(term));
}
