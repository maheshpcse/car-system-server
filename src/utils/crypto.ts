import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';

const ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}
