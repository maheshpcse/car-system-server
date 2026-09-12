import type { Request, Response } from 'express';
import { env } from '../../config/environment.js';
import { AppError } from '../../common/errors/AppError.js';
import { DEMO_USERS, PERSONA_MAP, REFRESH_COOKIE } from '../../common/constants/index.js';
import { prisma } from '../../database/prisma/client.js';
import { createEmailProvider } from '../../infrastructure/email/createEmailProvider.js';
import { hashPassword, randomToken, sha256, verifyPassword } from '../../utils/crypto.js';
import { refreshCookieOptions, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/tokens.js';
import { toPublicUser } from '../users/dto.js';

const email = createEmailProvider();

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: 0 });
}

async function issueSession(user: { id: string; email: string; role: Parameters<typeof signAccessToken>[0]['role'] }, res: Response) {
  const tokenId = randomToken(16);
  const refresh = signRefreshToken(user.id, tokenId);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refresh),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  setRefreshCookie(res, refresh);
  return {
    accessToken: signAccessToken({ sub: user.id, email: user.email, role: user.role }),
    tokenType: 'Bearer',
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  };
}

export class AuthService {
  async signup(input: { name: string; email: string; password: string; phone?: string; country?: string }, res: Response) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw AppError.conflict('EMAIL_IN_USE', 'An account with this email already exists');
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash: await hashPassword(input.password),
        name: input.name.trim(),
        phone: input.phone,
        location: input.country ?? 'Remote',
        title: 'Customer',
        role: 'CUSTOMER',
        avatarSeed: 6,
        preferences: { create: {} },
        notifications: {
          create: {
            type: 'account',
            title: 'Welcome to Aurora Motors',
            body: 'Your studio account is ready. Start exploring the line-up.',
          },
        },
      },
    });
    const verify = randomToken();
    await prisma.emailVerifyToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(verify),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await email.send({
      to: user.email,
      subject: 'Verify your Aurora Motors account',
      text: `Your verification token is ${verify}`,
    });
    const tokens = await issueSession(user, res);
    return { user: toPublicUser(user), ...tokens };
  }

  async login(input: { email: string; password: string }, res: Response) {
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || !user.isActive) throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    const tokens = await issueSession(user, res);
    return { user: toPublicUser(user), ...tokens };
  }

  async demoLogin(persona: string, res: Response) {
    if (!env.demoMode) throw AppError.forbidden('Demo mode is disabled', 'DEMO_DISABLED');
    const key = persona as keyof typeof PERSONA_MAP;
    const personaId = PERSONA_MAP[key];
    if (!personaId) throw AppError.badRequest('UNKNOWN_PERSONA', 'Persona is not recognised');
    const demo = DEMO_USERS.find((d) => d.personaId === personaId);
    if (!demo) throw AppError.badRequest('UNKNOWN_PERSONA', 'Persona is not recognised');
    const user = await prisma.user.findUnique({ where: { email: demo.email } });
    if (!user) throw AppError.notFound('DEMO_USER_MISSING', 'Demo accounts have not been seeded');
    const tokens = await issueSession(user, res);
    return { user: toPublicUser(user), ...tokens };
  }

  async logout(req: Request, res: Response) {
    const cookie = req.cookies?.[REFRESH_COOKIE];
    if (cookie) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: sha256(cookie), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    clearRefreshCookie(res);
  }

  async refresh(req: Request, res: Response) {
    const cookie = req.cookies?.[REFRESH_COOKIE];
    if (!cookie) throw AppError.unauthorized('Refresh token is missing', 'REFRESH_MISSING');
    let payload: { sub: string; jti: string };
    try {
      payload = verifyRefreshToken(cookie);
    } catch {
      throw AppError.unauthorized('Refresh token is invalid', 'REFRESH_INVALID');
    }
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(cookie) } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
      throw AppError.unauthorized('Refresh token is invalid', 'REFRESH_INVALID');
    }
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || !user.isActive) throw AppError.unauthorized();
    const tokens = await issueSession(user, res);
    return { user: toPublicUser(user), ...tokens };
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.unauthorized();
    return toPublicUser(user);
  }

  async forgotPassword(inputEmail: string) {
    const user = await prisma.user.findUnique({ where: { email: inputEmail.toLowerCase() } });
    if (user) {
      const token = env.isProduction ? randomToken() : '482910';
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: sha256(token),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      await email.send({
        to: user.email,
        subject: 'Reset your Aurora Motors password',
        text: `Your password reset code is ${token}`,
      });
      if (!env.isProduction) return { code: token };
    }
    return { message: 'If an account exists, a reset email has been sent' };
  }

  async resetPassword(input: { email: string; token: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user) throw AppError.badRequest('RESET_INVALID', 'Reset token is invalid');
    const record = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        tokenHash: sha256(input.token),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!record) throw AppError.badRequest('RESET_INVALID', 'Reset token is invalid');
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(input.password) },
      }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  }

  async verifyEmail(token: string) {
    const record = await prisma.emailVerifyToken.findUnique({ where: { tokenHash: sha256(token) } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw AppError.badRequest('VERIFY_INVALID', 'Verification token is invalid');
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
      prisma.emailVerifyToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
  }
}

export const authService = new AuthService();
