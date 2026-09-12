import { Router } from 'express';
import { validate } from '../../common/validation/validate.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { deleteMe, getMe, getPreferences, patchMe, patchPassword, patchPreferences } from './controller.js';
import { updatePasswordSchema, updatePreferencesSchema, updateProfileSchema } from './schema.js';

export const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.get('/me', getMe);
userRoutes.patch('/me', validate({ body: updateProfileSchema }), patchMe);
userRoutes.patch('/me/password', validate({ body: updatePasswordSchema }), patchPassword);
userRoutes.delete('/me', deleteMe);
userRoutes.get('/me/preferences', getPreferences);
userRoutes.patch('/me/preferences', validate({ body: updatePreferencesSchema }), patchPreferences);
