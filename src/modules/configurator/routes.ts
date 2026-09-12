import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { validate } from '../../common/validation/validate.js';
import { optionalAuth, requireAuth } from '../../middleware/authenticate.js';
import { configurationBodySchema, configurationIdSchema } from './schema.js';
import { configuratorService } from './service.js';

export const configurationRoutes = Router();

configurationRoutes.post('/', optionalAuth, validate({ body: configurationBodySchema }), async (req: Request, res: Response) => {
  sendSuccess(res, await configuratorService.create(req.user?.id, req.body), { status: 201 });
});

configurationRoutes.get('/:id', optionalAuth, validate({ params: configurationIdSchema }), async (req: Request, res: Response) => {
  sendSuccess(res, await configuratorService.get(String(req.params.id), req.user?.id));
});

configurationRoutes.patch(
  '/:id',
  requireAuth,
  validate({ params: configurationIdSchema, body: configurationBodySchema.partial() }),
  async (req: Request, res: Response) => {
    sendSuccess(res, await configuratorService.update(String(req.params.id), req.user!.id, req.body));
  },
);

configurationRoutes.delete(
  '/:id',
  requireAuth,
  validate({ params: configurationIdSchema }),
  async (req: Request, res: Response) => {
    await configuratorService.remove(String(req.params.id), req.user!.id);
    sendSuccess(res, { ok: true });
  },
);
