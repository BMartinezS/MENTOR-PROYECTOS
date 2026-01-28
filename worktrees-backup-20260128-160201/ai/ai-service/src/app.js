import express from 'express';
import { aiRouter } from './routes/ai.js';
import { errorHandler } from './middleware/error-handler.js';

export const createApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/', aiRouter);
  app.use(errorHandler);

  return app;
};

