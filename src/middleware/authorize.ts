import type { UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/errors/AppError.js';

const ADMIN_ROLES: UserRole[] = ['ADMIN', 'SUPER_ADMIN'];

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden());
      return;
    }
    next();
  };
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    next(AppError.unauthorized());
    return;
  }
  if (!ADMIN_ROLES.includes(req.user.role)) {
    next(AppError.forbidden('Admin access is required', 'ADMIN_REQUIRED'));
    return;
  }
  next();
}

export function isAdminRole(role: UserRole) {
  return ADMIN_ROLES.includes(role);
}
