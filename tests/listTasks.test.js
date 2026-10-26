import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { resetTasks } from '../src/services/tasksService.js';

describe('GET /tasks', () => {
  beforeEach(() => {
    resetTasks();
  });

  it('devuelve una lista vacía si no hay tareas', async () => {
    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('devuelve todas las tareas creadas en orden de creación', async () => {
    await request(app).post('/tasks').send({ title: 'Primera' });
    await request(app).post('/tasks').send({ title: 'Segunda' });

    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((t) => t.title)).toEqual(['Primera', 'Segunda']);
  });
});
