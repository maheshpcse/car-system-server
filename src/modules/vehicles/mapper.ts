import type { Prisma } from '@prisma/client';
import type { VehicleDto } from './dto.js';

const TRANSMISSION_API: Record<string, VehicleDto['transmission']> = {
  automatic: 'automatic',
  manual: 'manual',
  single_speed: 'single-speed',
  dual_clutch: 'dual-clutch',
};

const MATERIAL_API: Record<string, VehicleDto['interiors'][number]['material']> = {
  fabric: 'fabric',
  leather: 'leather',
  vegan_leather: 'vegan-leather',
  alcantara: 'alcantara',
};

export const vehicleInclude = {
  categories: { include: { category: true } },
  specifications: true,
  features: { orderBy: { sortOrder: 'asc' as const } },
  colors: { orderBy: { sortOrder: 'asc' as const } },
  wheels: { orderBy: { sortOrder: 'asc' as const } },
  interiors: { orderBy: { sortOrder: 'asc' as const } },
  trims: { orderBy: { sortOrder: 'asc' as const } },
  accessories: { orderBy: { sortOrder: 'asc' as const } },
  variants: true,
  media: { orderBy: { displayOrder: 'asc' as const } },
} satisfies Prisma.VehicleInclude;

export type VehicleRecord = Prisma.VehicleGetPayload<{ include: typeof vehicleInclude }>;

export function toVehicleDto(vehicle: VehicleRecord): VehicleDto {
  const thumbnail = vehicle.media.find((m) => m.mediaType === 'THUMBNAIL')?.cdnUrl ?? null;
  const modelUrl = vehicle.model3d ?? vehicle.media.find((m) => m.mediaType === 'MODEL_3D')?.cdnUrl ?? null;
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    manufacturer: vehicle.manufacturer,
    model: vehicle.model,
    variant: vehicle.variant,
    year: vehicle.year,
    tagline: vehicle.tagline,
    description: vehicle.description,
    category: vehicle.categories.map((link) => link.category.slug) as VehicleDto['category'],
    bodyType: vehicle.bodyType,
    fuelType: vehicle.fuelType,
    transmission: TRANSMISSION_API[vehicle.transmission] ?? 'automatic',
    power: vehicle.power,
    torque: vehicle.torque,
    topSpeed: vehicle.topSpeed,
    acceleration: Number(vehicle.acceleration),
    range: vehicle.range,
    mileage: vehicle.mileage === null ? null : Number(vehicle.mileage),
    seats: vehicle.seats,
    price: vehicle.price,
    startingPrice: vehicle.price,
    currency: vehicle.currency,
    rating: Number(vehicle.rating),
    isNew: vehicle.isNew,
    isFeatured: vehicle.isFeatured,
    featured: vehicle.isFeatured,
    thumbnail,
    colors: vehicle.colors.map((c) => ({
      id: c.optionId,
      name: c.name,
      hex: c.hex,
      finish: c.finish,
      price: c.price,
    })),
    wheels: vehicle.wheels.map((w) => ({
      id: w.optionId,
      name: w.name,
      sizeInches: w.sizeInches,
      style: w.style,
      price: w.price,
    })),
    interiors: vehicle.interiors.map((i) => ({
      id: i.optionId,
      name: i.name,
      accent: i.accent,
      material: MATERIAL_API[i.material] ?? 'fabric',
      price: i.price,
    })),
    trims: vehicle.trims.map((t) => ({
      id: t.optionId,
      name: t.name,
      description: t.description,
      price: t.price,
    })),
    accessories: vehicle.accessories.map((a) => ({
      id: a.optionId,
      name: a.name,
      description: a.description,
      price: a.price,
    })),
    variants: vehicle.variants.map((v) => ({
      id: v.optionId,
      name: v.name,
      price: v.price,
      power: v.power,
      range: v.range,
      acceleration: Number(v.acceleration),
    })),
    dimensions: vehicle.specifications
      ? {
          lengthMm: vehicle.specifications.lengthMm,
          widthMm: vehicle.specifications.widthMm,
          heightMm: vehicle.specifications.heightMm,
          wheelbaseMm: vehicle.specifications.wheelbaseMm,
          cargoLiters: vehicle.specifications.cargoLiters,
          weightKg: vehicle.specifications.weightKg,
        }
      : { lengthMm: 0, widthMm: 0, heightMm: 0, wheelbaseMm: 0, cargoLiters: 0, weightKg: 0 },
    features: vehicle.features.filter((f) => f.kind === 'FEATURE').map((f) => f.label),
    technology: vehicle.features.filter((f) => f.kind === 'TECHNOLOGY').map((f) => f.label),
    safety: vehicle.features.filter((f) => f.kind === 'SAFETY').map((f) => f.label),
    model3d: vehicle.model3d,
    silhouette: vehicle.silhouette,
    renderMode: vehicle.renderMode,
    renderConfig: (vehicle.renderConfig as Record<string, unknown> | null) ?? {
      silhouette: vehicle.silhouette,
    },
    modelUrl,
  };
}

export function toConfigurationCatalog(vehicle: VehicleDto) {
  return {
    vehicleId: vehicle.id,
    variants: vehicle.variants,
    colors: vehicle.colors,
    wheels: vehicle.wheels,
    interiors: vehicle.interiors,
    trims: vehicle.trims,
    accessories: vehicle.accessories,
    currency: vehicle.currency,
  };
}
