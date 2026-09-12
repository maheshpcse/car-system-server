import type { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalItems?: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  options?: { message?: string; status?: number; pagination?: PaginationMeta },
) {
  const body: Record<string, unknown> = {
    success: true,
    data,
  };
  if (options?.message) body.message = options.message;
  if (options?.pagination) {
    body.pagination = {
      page: options.pagination.page,
      limit: options.pagination.limit,
      total: options.pagination.total,
      totalItems: options.pagination.totalItems ?? options.pagination.total,
      totalPages: options.pagination.totalPages,
    };
  }
  res.status(options?.status ?? 200).json(body);
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  requestId?: string,
  details?: unknown,
) {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      requestId,
      ...(details ? { details } : {}),
    },
  });
}
