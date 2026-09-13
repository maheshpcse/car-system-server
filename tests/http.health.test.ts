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

  it('returns sidebar navigation including Notifications', async () => {
    const res = await request(app).get('/api/v1/navigation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const items = res.body.data.groups.flatMap((group: { items: { id: string }[] }) => group.items);
    expect(items.map((item: { id: string }) => item.id)).toContain('notifications');
  });

  it('rejects unauthenticated notification reads', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated unread-count', async () => {
    const res = await request(app).get('/api/v1/notifications/unread-count');
    expect(res.status).toBe(401);
  });
});
