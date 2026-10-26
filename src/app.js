import express from 'express';
import tasksRouter from './routes/tasks.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/tasks', tasksRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
