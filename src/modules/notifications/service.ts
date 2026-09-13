import { prisma } from '../../database/prisma/client.js';
import { sha256 } from '../../utils/crypto.js';
import { toAppNotification } from './dto.js';

export class NotificationService {
  async list(userId: string) {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return rows.map(toAppNotification);
  }

  async unreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { count };
  }

  async markRead(userId: string, id: string) {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async remove(userId: string, id: string) {
    await prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  async clear(userId: string) {
    await prisma.notification.deleteMany({
      where: { userId },
    });
  }

  async subscribePush(userId: string, input: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    const endpointHash = sha256(input.endpoint);
    await prisma.pushSubscription.upsert({
      where: { endpointHash },
      update: {
        userId,
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
      },
      create: {
        userId,
        endpoint: input.endpoint,
        endpointHash,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
      },
    });
    return { ok: true };
  }
}

export const notificationService = new NotificationService();
