import { z } from 'zod';

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url().min(8),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const notificationIdParams = z.object({
  id: z.string().min(1),
});
