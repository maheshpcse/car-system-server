import type { AuditAction, Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma/client.js';

const SENSITIVE = /password|token|secret|hash|authorization/i;

function sanitize(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object') return value as Prisma.InputJsonValue;
  if (Array.isArray(value)) return value.map((item) => sanitize(item)) as Prisma.InputJsonValue;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE.test(key) ? '[redacted]' : sanitize(item);
  }
  return out as Prisma.InputJsonValue;
}

export async function writeAudit(input: {
  actorUserId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  beforeData?: unknown;
  afterData?: unknown;
  requestId?: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      beforeData: sanitize(input.beforeData),
      afterData: sanitize(input.afterData),
      requestId: input.requestId,
    },
  });
}
