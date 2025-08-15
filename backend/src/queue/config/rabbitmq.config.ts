import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';
import { logger } from '@logger/logger';

export class RabbitMQConfig {
  private static instance: RabbitMQConfig;
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  private constructor() {}

  public static getInstance(): RabbitMQConfig {
    if (!RabbitMQConfig.instance) {
      RabbitMQConfig.instance = new RabbitMQConfig();
    }
    return RabbitMQConfig.instance;
  }

  public async connect(): Promise<void> {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);

      // Add a null check for the connection before creating a channel
      if (!this.connection) {
        throw new Error('RabbitMQ connection not established.');
      }

      this.channel = await this.connection.createChannel();

      // Declare queues
      await this.channel.assertQueue('image-upload', { durable: true });
      await this.channel.assertQueue('image-upload-dlq', { durable: true });

      logger.info('RabbitMQ connected successfully');
    } catch (error) {
      logger.error('RabbitMQ connection failed:', error);
      throw error;
    }
  }

  public getChannel(): Channel {
    // Add a null check for the channel
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }
    return this.channel;
  }

  public async disconnect(): Promise<void> {
    try {
      // Add null checks before attempting to close
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      logger.info('RabbitMQ disconnected');
    } catch (error) {
      logger.error('Error disconnecting RabbitMQ:', error);
    }
  }
}