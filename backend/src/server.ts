import 'reflect-metadata';
import dotenv from 'dotenv';
import app from './app.js';
import { AppDataSource } from '@config/typeorm.config';
import { logger } from './logger/logger';
import { port } from '@constants/env.constants';

dotenv.config();

const PORT = port || 3000;

const startServer = async () => {
  logger.info('Starting server...');
  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

startServer();
