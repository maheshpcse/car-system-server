import type { Notification } from '@prisma/client';

export type NotificationKind = 'info' | 'success' | 'vehicle' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  read: boolean;
  href?: string;
  kind?: NotificationKind;
}

const KINDS = new Set<NotificationKind>(['info', 'success', 'vehicle', 'system']);

export function toAppNotification(row: Notification): AppNotification {
  const kind = KINDS.has(row.kind as NotificationKind) ? (row.kind as NotificationKind) : 'info';
  return {
    id: row.id,
    title: row.title,
    detail: row.body,
    createdAt: row.createdAt.toISOString(),
    read: Boolean(row.readAt),
    ...(row.href ? { href: row.href } : {}),
    kind,
  };
}
