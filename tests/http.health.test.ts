import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app/app.js';

describe('health and docs', () => {
  const app = createApp();

  it('returns liveness', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('serves OpenAPI JSON', async () => {
    const res = await request(app).get('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.info.title).toBe('Aurora Motors API');
  });

  it('rejects invalid signup payloads before hitting the database', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send({ email: 'bad', password: '1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects unauthenticated favorites', async () => {
    const res = await request(app).get('/api/v1/favorites');
    expect(res.status).toBe(401);
  });
});
