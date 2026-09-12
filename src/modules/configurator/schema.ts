import { z } from 'zod';

export const configurationBodySchema = z.object({
  vehicleId: z.string().min(1),
  variantId: z.string().min(1),
  colorId: z.string().optional(),
  wheelId: z.string().optional(),
  interiorId: z.string().optional(),
  trimId: z.string().optional(),
  accessoryIds: z.array(z.string()).optional(),
  options: z
    .object({
      exteriorColor: z.string().optional(),
      wheel: z.string().optional(),
      interior: z.string().optional(),
      seatMaterial: z.string().optional(),
      trim: z.string().optional(),
      accessories: z.array(z.string()).optional(),
    })
    .optional(),
});

export const configurationIdSchema = z.object({ id: z.string().min(1) });
