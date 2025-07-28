import { AppDataSource } from './typeorm.config';
import { logger } from '../logger/logger';

export const connectDB = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info(`Successfully connected to PostgreSQL: ${AppDataSource.options.database}`);
    }
  } catch (error) {
    logger.error('Error connecting to PostgreSQL:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.warn('Disconnected from PostgreSQL');
    }
  } catch (error) {
    logger.error('Error disconnecting from PostgreSQL', error);
  }
};
