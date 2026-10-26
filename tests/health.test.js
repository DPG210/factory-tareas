import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('responde 200 con status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('rutas inexistentes', () => {
  it('responde 404 en JSON', async () => {
    const res = await request(app).get('/no-existe');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.error).toBeTypeOf('string');
  });
});
