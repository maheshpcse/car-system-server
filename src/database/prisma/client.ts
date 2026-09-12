import { PrismaClient } from '@prisma/client';
import { env } from '../../config/environment.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProduction ? ['error'] : env.isTest ? [] : ['error', 'warn'],
  });

if (!env.isProduction) globalForPrisma.prisma = prisma;
