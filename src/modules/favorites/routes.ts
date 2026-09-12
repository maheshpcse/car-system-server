import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { validate } from '../../common/validation/validate.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { favoriteService } from './service.js';

export const favoriteRoutes = Router();
favoriteRoutes.use(requireAuth);

favoriteRoutes.get('/', async (req: Request, res: Response) => {
  sendSuccess(res, await favoriteService.list(req.user!.id));
});

favoriteRoutes.post(
  '/:vehicleId',
  validate({ params: z.object({ vehicleId: z.string().min(1) }) }),
  async (req: Request, res: Response) => {
    sendSuccess(res, await favoriteService.add(req.user!.id, String(req.params.vehicleId)), { status: 201 });
  },
);

favoriteRoutes.delete(
  '/:vehicleId',
  validate({ params: z.object({ vehicleId: z.string().min(1) }) }),
  async (req: Request, res: Response) => {
    await favoriteService.remove(req.user!.id, String(req.params.vehicleId));
    sendSuccess(res, { ok: true });
  },
);
