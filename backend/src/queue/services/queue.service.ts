import { RabbitMQConfig } from '../config/rabbitmq.config';
import { logger } from '@logger/logger';
import { JobData } from '../interface/job-data.interface';

export class QueueService {
  private rabbitMQ = RabbitMQConfig.getInstance();
 /**
   * Đẩy một job vào queue RabbitMQ.
   * @param queueName Tên queue
   * @param jobData Dữ liệu job
   * @throws Nếu có lỗi khi gửi job vào queue
   */
  async addJob(queueName: string, jobData: JobData): Promise<void> {
    try {
      const channel = await this.rabbitMQ.getChannel();
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
  /**
   * Lắng nghe và xử lý các job từ queue RabbitMQ.
   * Tự động retry nếu job lỗi, chuyển vào dead-letter queue nếu vượt quá số lần retry.
   * @param queueName Tên queue
   * @param processor Hàm xử lý từng job (nhận vào JobData)
   * @throws Nếu có lỗi khi thiết lập consumer
   */
  async processQueue(
    queueName: string, 
    processor: (data: JobData) => Promise<void>
  ): Promise<void> {
    try {
      const channel = await this.rabbitMQ.getChannel();
      
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