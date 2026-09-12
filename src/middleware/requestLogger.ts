import type { NextFunction, Request, Response } from 'express';
import { logger } from '../common/logging/logger.js';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const started = Date.now();
  res.on('finish', () => {
    logger.info('request', {
      requestId: req.requestId,
      method: req.method,
      route: req.originalUrl.split('?')[0],
      responseStatus: res.statusCode,
      durationMs: Date.now() - started,
      userId: req.user?.id,
    });
  });
  next();
}
