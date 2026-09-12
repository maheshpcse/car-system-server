import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../src/utils/tokens.js';
import { isAdminRole } from '../src/middleware/authorize.js';

describe('tokens and roles', () => {
  it('signs and verifies access tokens', () => {
    const token = signAccessToken({ sub: 'user_1', email: 'maya@demo.aurora', role: 'CUSTOMER' });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user_1');
    expect(payload.email).toBe('maya@demo.aurora');
    expect(payload.role).toBe('CUSTOMER');
  });

  it('treats admin roles as privileged', () => {
    expect(isAdminRole('ADMIN')).toBe(true);
    expect(isAdminRole('SUPER_ADMIN')).toBe(true);
    expect(isAdminRole('CUSTOMER')).toBe(false);
  });
});
