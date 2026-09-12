import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { userService } from './service.js';

export async function getMe(req: Request, res: Response) {
  sendSuccess(res, await userService.me(req.user!.id));
}

export async function patchMe(req: Request, res: Response) {
  sendSuccess(res, await userService.updateMe(req.user!.id, req.body), { message: 'Profile updated' });
}

export async function patchPassword(req: Request, res: Response) {
  await userService.updatePassword(req.user!.id, req.body.currentPassword, req.body.nextPassword);
  sendSuccess(res, { ok: true }, { message: 'Password updated' });
}

export async function deleteMe(req: Request, res: Response) {
  await userService.deleteMe(req.user!.id);
  sendSuccess(res, { ok: true }, { message: 'Account disabled' });
}

export async function getPreferences(req: Request, res: Response) {
  sendSuccess(res, await userService.getPreferences(req.user!.id));
}

export async function patchPreferences(req: Request, res: Response) {
  sendSuccess(res, await userService.updatePreferences(req.user!.id, req.body));
}
