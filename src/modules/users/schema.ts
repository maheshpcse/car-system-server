import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  firstName: z.string().min(1).max(40).optional(),
  lastName: z.string().min(1).max(40).optional(),
  displayName: z.string().min(1).max(80).optional(),
  phone: z.string().max(32).optional(),
  title: z.string().max(80).optional(),
  location: z.string().max(80).optional(),
  avatar: z.string().url().nullable().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  nextPassword: z.string().min(6).max(128),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  defaultVehicleView: z.string().optional(),
  defaultGridMode: z.enum(['grid', 'list']).optional(),
  measurementUnits: z.enum(['metric', 'imperial']).optional(),
  currency: z.string().length(3).optional(),
  notificationPreferences: z.record(z.string(), z.unknown()).optional(),
  sidebarCollapsed: z.boolean().optional(),
  reducedEffects: z.boolean().optional(),
});
