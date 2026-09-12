import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../../config/environment.js';
import { sendError } from '../response/apiResponse.js';
import { logger } from '../logging/logger.js';
import { AppError } from './AppError.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, req.requestId, err.details);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Request validation failed', req.requestId, err.issues);
    return;
  }

  if (err instanceof Error && err.message === 'Origin not allowed by CORS') {
    sendError(res, 403, 'CORS_FORBIDDEN', 'Origin is not allowed', req.requestId);
    return;
  }

  logger.error('Unhandled error', {
    requestId: req.requestId,
    method: req.method,
    route: req.originalUrl,
    errorCode: 'INTERNAL_ERROR',
    message: err instanceof Error ? err.message : 'unknown',
  });

  sendError(
    res,
    500,
    'INTERNAL_ERROR',
    env.isProduction ? 'An unexpected error occurred' : err instanceof Error ? err.message : 'Unknown error',
    req.requestId,
  );
};
