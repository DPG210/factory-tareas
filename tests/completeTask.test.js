import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { resetTasks } from '../src/services/tasksService.js';

describe('PATCH /tasks/:id/complete', () => {
  beforeEach(() => {
    resetTasks();
  });

  it('marca la tarea como completada', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Estudiar' });

    const res = await request(app).patch(`/tasks/${created.body.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...created.body, completed: true });
  });

  it('persiste el cambio', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Estudiar' });
    await request(app).patch(`/tasks/${created.body.id}/complete`);

    const res = await request(app).get(`/tasks/${created.body.id}`);

    expect(res.body.completed).toBe(true);
  });

  it('es idempotente si la tarea ya estaba completada', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Estudiar' });
    await request(app).patch(`/tasks/${created.body.id}/complete`);

    const res = await request(app).patch(`/tasks/${created.body.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('responde 404 si la tarea no existe', async () => {
    const res = await request(app).patch('/tasks/no-existe/complete');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No existe/);
  });
});
