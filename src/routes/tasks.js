import { Router } from 'express';
import {
  completeTask,
  createTask,
  getTask,
  listTasks,
} from '../services/tasksService.js';

const router = Router();

router.post('/', (req, res) => {
  const task = createTask(req.body?.title);
  res.status(201).json(task);
});

router.get('/', (req, res) => {
  res.json(listTasks());
});

router.get('/:id', (req, res) => {
  res.json(getTask(req.params.id));
});

router.patch('/:id/complete', (req, res) => {
  res.json(completeTask(req.params.id));
});

export default router;
