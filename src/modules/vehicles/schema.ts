import { z } from 'zod';

export const vehicleQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  brands: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (typeof v === 'string' ? v.split(',').filter(Boolean) : v)),
  bodyType: z.string().optional(),
  bodyTypes: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (typeof v === 'string' ? v.split(',').filter(Boolean) : v)),
  fuelType: z.string().optional(),
  fuelTypes: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (typeof v === 'string' ? v.split(',').filter(Boolean) : v)),
  transmission: z.string().optional(),
  transmissions: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (typeof v === 'string' ? v.split(',').filter(Boolean) : v)),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minYear: z.coerce.number().optional(),
  minPower: z.coerce.number().optional(),
  minRange: z.coerce.number().optional(),
  seats: z.coerce.number().optional(),
  minSeats: z.coerce.number().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  ids: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const compareQuerySchema = z.object({
  ids: z.string().min(1),
});

export const adminVehicleSchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  variant: z.string().min(1),
  year: z.number().int(),
  tagline: z.string(),
  description: z.string(),
  category: z.array(z.string()).default([]),
  bodyType: z.enum(['sedan', 'suv', 'coupe', 'hatchback', 'wagon', 'roadster', 'crossover', 'pickup']),
  fuelType: z.enum(['electric', 'hybrid', 'petrol', 'diesel']),
  transmission: z.enum(['automatic', 'manual', 'single-speed', 'dual-clutch']),
  power: z.number(),
  torque: z.number(),
  topSpeed: z.number(),
  acceleration: z.number(),
  range: z.number(),
  mileage: z.number().nullable().optional(),
  seats: z.number(),
  price: z.number(),
  rating: z.number().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  model3d: z.string().nullable().optional(),
  silhouette: z.enum(['sedan', 'suv', 'coupe', 'hatch', 'wagon', 'roadster', 'pickup']),
  renderMode: z.enum(['procedural', 'asset']).optional(),
  renderConfig: z.record(z.string(), z.unknown()).optional(),
});
