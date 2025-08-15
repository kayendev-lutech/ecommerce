import { RabbitMQConfig } from './config/rabbitmq.config';
import { QueueService } from './services/queue.service';
import { ImageUploadProcessor } from './processors/image-upload.processor';
import { logger } from '@logger/logger';
import { AppDataSource } from '@config/typeorm.config'; // Thêm dòng này

class QueueWorker {
  private queueService = new QueueService();
  private imageUploadProcessor = new ImageUploadProcessor();

  async start(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        logger.info('Database connected in worker');
      }

      await RabbitMQConfig.getInstance().connect();
      
      // Start processing queues
      await this.queueService.processQueue('image-upload', (jobData) =>
        this.imageUploadProcessor.processUploadImageJob(jobData)
      );

      logger.info('Queue worker started successfully');
    } catch (error) {
      logger.error('Failed to start queue worker:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      await RabbitMQConfig.getInstance().disconnect();
      
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        logger.info('Database disconnected in worker');
      }
      
      logger.info('Queue worker stopped');
    } catch (error) {
      logger.error('Error stopping worker:', error);
    }
  }
}

const worker = new QueueWorker();

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

// Start worker
worker.start();