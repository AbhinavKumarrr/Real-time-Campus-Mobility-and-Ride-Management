import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import env from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigins, credentials: true }));
  app.use(express.json());
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/', (req, res) =>
    res.json({ name: 'Campus Ride API', version: '1.0.0', docs: '/api/health' })
  );

  app.use('/api', apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
