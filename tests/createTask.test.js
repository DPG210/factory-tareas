import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { resetTasks } from '../src/services/tasksService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('POST /tasks', () => {
  beforeEach(() => {
    resetTasks();
  });

  it('crea una tarea y responde 201', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Comprar pan' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.stringMatching(UUID_REGEX),
      title: 'Comprar pan',
      completed: false,
      createdAt: expect.any(String),
    });
    expect(new Date(res.body.createdAt).toISOString()).toBe(res.body.createdAt);
  });

  it('ignora el campo completed enviado por el cliente', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Tarea', completed: true });

    expect(res.status).toBe(201);
    expect(res.body.completed).toBe(false);
  });

  it('acepta un title de exactamente 200 caracteres', async () => {
    const title = 'a'.repeat(200);
    const res = await request(app).post('/tasks').send({ title });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(title);
  });

  it('responde 400 si falta el title', async () => {
    const res = await request(app).post('/tasks').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title.*obligatorio/);
  });

  it('responde 400 si no se envía cuerpo', async () => {
    const res = await request(app).post('/tasks');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/);
  });

  it('responde 400 si el title está vacío', async () => {
    const res = await request(app).post('/tasks').send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/vacío/);
  });

  it('responde 400 si el title solo tiene espacios', async () => {
    const res = await request(app).post('/tasks').send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/vacío/);
  });

  it('responde 400 si el title no es un texto', async () => {
    const res = await request(app).post('/tasks').send({ title: 123 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/texto/);
  });

  it('responde 400 si el title supera los 200 caracteres', async () => {
    const res = await request(app).post('/tasks').send({ title: 'a'.repeat(201) });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/200/);
  });

  it('responde 400 si el JSON está mal formado', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title": ');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/JSON/);
  });

  it('no guarda la tarea si la validación falla', async () => {
    await request(app).post('/tasks').send({ title: '' });
    const res = await request(app).get('/tasks');

    expect(res.body).toEqual([]);
  });
});
