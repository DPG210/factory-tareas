import { randomUUID } from 'node:crypto';

export const TITLE_MAX_LENGTH = 200;

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

let tasks = [];

function validateTitle(title) {
  if (title === undefined || title === null) {
    throw new ValidationError('El campo "title" es obligatorio');
  }
  if (typeof title !== 'string') {
    throw new ValidationError('El campo "title" debe ser un texto');
  }
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('El campo "title" no puede estar vacío');
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    throw new ValidationError(
      `El campo "title" no puede superar los ${TITLE_MAX_LENGTH} caracteres`,
    );
  }
  return trimmed;
}

function findTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new NotFoundError(`No existe ninguna tarea con id "${id}"`);
  }
  return task;
}

export function createTask(title) {
  const task = {
    id: randomUUID(),
    title: validateTitle(title),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return { ...task };
}

export function listTasks() {
  return tasks.map((task) => ({ ...task }));
}

export function getTask(id) {
  return { ...findTask(id) };
}

export function completeTask(id) {
  const task = findTask(id);
  task.completed = true;
  return { ...task };
}

export function deleteTask(id) {
  const task = findTask(id);
  tasks = tasks.filter((t) => t !== task);
}

// Vacía el almacenamiento; pensado para aislar los tests entre sí.
export function resetTasks() {
  tasks = [];
}
