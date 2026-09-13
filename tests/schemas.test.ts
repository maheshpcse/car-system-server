import { describe, expect, it } from 'vitest';
import { demoLoginSchema, loginSchema, signupSchema } from '../src/modules/auth/schema.js';
import { vehicleQuerySchema } from '../src/modules/vehicles/schema.js';

describe('zod schemas', () => {
  it('accepts frontend signup payloads', () => {
    const parsed = signupSchema.parse({
      name: 'Maya Lindqvist',
      username: 'Maya.L',
      email: 'maya@example.com',
      password: 'secret1',
      country: 'Denmark',
    });
    expect(parsed.email).toBe('maya@example.com');
    expect(parsed.username).toBe('maya.l');
  });

  it('accepts username login from the frontend', () => {
    const parsed = loginSchema.parse({ username: 'maya', password: 'demo1234', remember: true });
    expect(parsed.username).toBe('maya');
  });

  it('rejects login without username or email', () => {
    expect(() => loginSchema.parse({ password: 'x' })).toThrow();
  });

  it('accepts demo personas', () => {
    expect(demoLoginSchema.parse({ persona: 'customer' }).persona).toBe('customer');
  });

  it('coerces vehicle query filters', () => {
    const parsed = vehicleQuerySchema.parse({
      search: 'aureon',
      category: 'electric',
      minPrice: '30000',
      page: '1',
      limit: '12',
      brands: 'Aureon,Nexen',
    });
    expect(parsed.minPrice).toBe(30000);
    expect(parsed.brands).toEqual(['Aureon', 'Nexen']);
  });
});
