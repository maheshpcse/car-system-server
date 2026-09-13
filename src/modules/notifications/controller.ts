import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { notificationService } from './service.js';

export async function listNotifications(req: Request, res: Response) {
  sendSuccess(res, await notificationService.list(req.user!.id));
}

export async function unreadCount(req: Request, res: Response) {
  sendSuccess(res, await notificationService.unreadCount(req.user!.id));
}

export async function markRead(req: Request, res: Response) {
  await notificationService.markRead(req.user!.id, String(req.params.id));
  sendSuccess(res, { ok: true });
}

export async function markAllRead(req: Request, res: Response) {
  await notificationService.markAllRead(req.user!.id);
  sendSuccess(res, { ok: true });
}

export async function removeNotification(req: Request, res: Response) {
  await notificationService.remove(req.user!.id, String(req.params.id));
  sendSuccess(res, { ok: true });
}

export async function clearNotifications(req: Request, res: Response) {
  await notificationService.clear(req.user!.id);
  sendSuccess(res, { ok: true });
}

export async function pushSubscribe(req: Request, res: Response) {
  sendSuccess(res, await notificationService.subscribePush(req.user!.id, req.body));
}
