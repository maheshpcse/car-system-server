import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { DEFAULT_NAV } from './nav.js';

export const navigationRoutes = Router();

navigationRoutes.get('/', (_req: Request, res: Response) => {
  sendSuccess(res, { groups: DEFAULT_NAV });
});
