import { prisma } from '../../database/prisma/client.js';
import { AppError } from '../../common/errors/AppError.js';
import { hashPassword, verifyPassword } from '../../utils/crypto.js';
import { toPublicUser } from './dto.js';

export class UserService {
  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('USER_NOT_FOUND', 'User was not found');
    return toPublicUser(user);
  }

  async updateMe(userId: string, patch: Record<string, unknown>) {
    const name =
      typeof patch.name === 'string'
        ? patch.name
        : [patch.firstName, patch.lastName].filter(Boolean).join(' ') || undefined;
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        firstName: typeof patch.firstName === 'string' ? patch.firstName : undefined,
        lastName: typeof patch.lastName === 'string' ? patch.lastName : undefined,
        displayName: typeof patch.displayName === 'string' ? patch.displayName : undefined,
        phone: typeof patch.phone === 'string' ? patch.phone : undefined,
        title: typeof patch.title === 'string' ? patch.title : undefined,
        location: typeof patch.location === 'string' ? patch.location : undefined,
        avatar: patch.avatar === null || typeof patch.avatar === 'string' ? (patch.avatar as string | null) : undefined,
      },
    });
    return toPublicUser(user);
  }

  async updatePassword(userId: string, currentPassword: string, nextPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('USER_NOT_FOUND', 'User was not found');
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      throw AppError.unauthorized('Current password is incorrect', 'INVALID_PASSWORD');
    }
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(nextPassword) },
    });
  }

  async deleteMe(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false, email: `deleted+${userId}@aurora.invalid` },
    });
  }

  async getPreferences(userId: string) {
    const prefs = await prisma.userPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    return {
      theme: prefs.theme,
      defaultVehicleView: prefs.defaultVehicleView,
      defaultGridMode: prefs.defaultGridMode,
      measurementUnits: prefs.measurementUnits,
      currency: prefs.currency,
      notificationPreferences: prefs.notificationPreferences,
      sidebarCollapsed: prefs.sidebarCollapsed,
      reducedEffects: prefs.reducedEffects,
    };
  }

  async updatePreferences(userId: string, patch: Record<string, unknown>) {
    const prefs = await prisma.userPreference.upsert({
      where: { userId },
      update: patch,
      create: { userId, ...patch },
    });
    return this.getPreferences(userId).then(() => ({
      theme: prefs.theme,
      defaultVehicleView: prefs.defaultVehicleView,
      defaultGridMode: prefs.defaultGridMode,
      measurementUnits: prefs.measurementUnits,
      currency: prefs.currency,
      notificationPreferences: prefs.notificationPreferences,
      sidebarCollapsed: prefs.sidebarCollapsed,
      reducedEffects: prefs.reducedEffects,
    }));
  }
}

export const userService = new UserService();
