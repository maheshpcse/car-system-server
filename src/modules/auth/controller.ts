import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/response/apiResponse.js';
import { authService } from './service.js';

export async function signup(req: Request, res: Response) {
  sendSuccess(res, await authService.signup(req.body, res), { status: 201, message: 'Account created' });
}

export async function login(req: Request, res: Response) {
  sendSuccess(res, await authService.login(req.body, res), { message: 'Signed in' });
}

export async function demoLogin(req: Request, res: Response) {
  sendSuccess(res, await authService.demoLogin(req.body.persona, res), { message: 'Demo session started' });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req, res);
  sendSuccess(res, { ok: true }, { message: 'Signed out' });
}

export async function refresh(req: Request, res: Response) {
  sendSuccess(res, await authService.refresh(req, res));
}

export async function me(req: Request, res: Response) {
  sendSuccess(res, await authService.me(req.user!.id));
}

export async function forgotPassword(req: Request, res: Response) {
  sendSuccess(res, await authService.forgotPassword(req.body.email), {
    message: 'If an account exists, a reset email has been sent',
  });
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body);
  sendSuccess(res, { ok: true }, { message: 'Password updated' });
}

export async function verifyEmail(req: Request, res: Response) {
  await authService.verifyEmail(req.body.token);
  sendSuccess(res, { ok: true }, { message: 'Email verified' });
}
