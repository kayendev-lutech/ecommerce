import { RabbitMQConfig } from '../config/rabbitmq.config';
import { logger } from '@logger/logger';

export interface JobData {
  id: string;
  type: string;
  payload: any;
  retries?: number;
  maxRetries?: number;
  createdAt?: Date;
}

export class QueueService {
  private rabbitMQ = RabbitMQConfig.getInstance();

  async addJob(queueName: string, jobData: JobData): Promise<void> {
    try {
      const channel = this.rabbitMQ.getChannel();
      const message = Buffer.from(JSON.stringify({
        ...jobData,
        createdAt: new Date(),
        retries: 0,
        maxRetries: jobData.maxRetries || 3,
      }));

      await channel.sendToQueue(queueName, message, {
        persistent: true,
        messageId: jobData.id,
      });

      logger.info(`Job ${jobData.id} added to queue ${queueName}`);
    } catch (error) {
      logger.error(`Error adding job to queue ${queueName}:`, error);
      throw error;
    }
  }

  async processQueue(
    queueName: string, 
    processor: (data: JobData) => Promise<void>
  ): Promise<void> {
    try {
      const channel = this.rabbitMQ.getChannel();
      
      await channel.prefetch(1); // Process one job at a time
      
      await channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
          const jobData: JobData = JSON.parse(msg.content.toString());
          logger.info(`Processing job ${jobData.id} from queue ${queueName}`);
          
          await processor(jobData);
          
          channel.ack(msg);
          logger.info(`Job ${jobData.id} completed successfully`);
        } catch (error) {
          logger.error(`Error processing job:`, error);
          
          const jobData: JobData = JSON.parse(msg.content.toString());
          jobData.retries = (jobData.retries || 0) + 1;

          if (jobData.retries >= (jobData.maxRetries || 3)) {
            // Send to dead letter queue
            await this.addJob(`${queueName}-dlq`, jobData);
            channel.ack(msg);
            logger.error(`Job ${jobData.id} failed after ${jobData.retries} retries, moved to DLQ`);
          } else {
            // Requeue with delay
            setTimeout(() => {
              channel.nack(msg, false, true);
            }, 5000 * jobData.retries); // Exponential backoff
            logger.info(`Job ${jobData.id} requeued, retry ${jobData.retries}`);
          }
        }
      });
    } catch (error) {
      logger.error(`Error setting up queue processor for ${queueName}:`, error);
      throw error;
    }
  }
}