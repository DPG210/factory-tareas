import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { resetTasks } from '../src/services/tasksService.js';

describe('GET /tasks/:id', () => {
  beforeEach(() => {
    resetTasks();
  });

  it('devuelve la tarea si existe', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Leer' });

    const res = await request(app).get(`/tasks/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(created.body);
  });

  it('responde 404 si la tarea no existe', async () => {
    const res = await request(app).get('/tasks/00000000-0000-4000-8000-000000000000');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No existe/);
  });
});
