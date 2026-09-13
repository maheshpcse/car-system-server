import { Router } from 'express';
import { validate } from '../../common/validation/validate.js';
import { requireAuth } from '../../middleware/authenticate.js';
import {
  clearNotifications,
  listNotifications,
  markAllRead,
  markRead,
  pushSubscribe,
  removeNotification,
  unreadCount,
} from './controller.js';
import { notificationIdParams, pushSubscribeSchema } from './schema.js';

export const notificationRoutes = Router();
notificationRoutes.use(requireAuth);

notificationRoutes.get('/', listNotifications);
notificationRoutes.get('/unread-count', unreadCount);
notificationRoutes.post('/read-all', markAllRead);
notificationRoutes.patch('/read-all', markAllRead);
notificationRoutes.post('/push-subscribe', validate({ body: pushSubscribeSchema }), pushSubscribe);
notificationRoutes.delete('/', clearNotifications);
notificationRoutes.post('/:id/read', validate({ params: notificationIdParams }), markRead);
notificationRoutes.patch('/:id/read', validate({ params: notificationIdParams }), markRead);
notificationRoutes.delete('/:id', validate({ params: notificationIdParams }), removeNotification);
