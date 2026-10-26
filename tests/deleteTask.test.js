import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { resetTasks } from '../src/services/tasksService.js';

describe('DELETE /tasks/:id', () => {
  beforeEach(() => {
    resetTasks();
  });

  it('borra la tarea y responde 204 sin cuerpo', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Estudiar' });

    const res = await request(app).delete(`/tasks/${created.body.id}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  it('la tarea deja de existir tras borrarla', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Estudiar' });
    await request(app).delete(`/tasks/${created.body.id}`);

    const res = await request(app).get(`/tasks/${created.body.id}`);

    expect(res.status).toBe(404);
  });

  it('solo borra la tarea indicada', async () => {
    const a = await request(app).post('/tasks').send({ title: 'A' });
    const b = await request(app).post('/tasks').send({ title: 'B' });

    await request(app).delete(`/tasks/${a.body.id}`);
    const res = await request(app).get('/tasks');

    expect(res.body).toEqual([b.body]);
  });

  it('responde 404 si la tarea no existe', async () => {
    const res = await request(app).delete('/tasks/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No existe/);
  });

  it('responde 404 al borrar dos veces la misma tarea', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Estudiar' });
    await request(app).delete(`/tasks/${created.body.id}`);

    const res = await request(app).delete(`/tasks/${created.body.id}`);

    expect(res.status).toBe(404);
  });
});
