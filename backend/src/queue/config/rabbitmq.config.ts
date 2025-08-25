import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';
import { logger } from '@logger/logger';
import { EXCHANGES, QUEUES, ROUTING_KEYS } from './exchange.config';

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

      if (!this.connection) {
        throw new Error('RabbitMQ connection not established.');
      }

      this.channel = await this.connection.createChannel();

      // Declare exchanges
      await this.setupExchanges();

      // Declare queues and bindings
      await this.setupQueues();

      logger.info('RabbitMQ connected successfully with exchanges');
    } catch (error) {
      logger.error('RabbitMQ connection failed:', error);
      throw error;
    }
  }

  private async setupExchanges(): Promise<void> {
    if (!this.channel) return;

    // Declare exchanges
    await this.channel.assertExchange(EXCHANGES.ORDER_EXCHANGE, 'topic', { durable: true });
    await this.channel.assertExchange(EXCHANGES.NOTIFICATION_EXCHANGE, 'topic', { durable: true });
    await this.channel.assertExchange(EXCHANGES.INVENTORY_EXCHANGE, 'topic', { durable: true });

    logger.info('RabbitMQ exchanges declared successfully');
  }

  private async setupQueues(): Promise<void> {
    if (!this.channel) return;

    // Declare queues
    await this.channel.assertQueue(QUEUES.ORDER_PROCESSING, { durable: true });
    await this.channel.assertQueue(QUEUES.ORDER_NOTIFICATION, { durable: true });
    await this.channel.assertQueue(QUEUES.INVENTORY_UPDATE, { durable: true });
    await this.channel.assertQueue(QUEUES.EMAIL_NOTIFICATION, { durable: true });
    await this.channel.assertQueue(QUEUES.SMS_NOTIFICATION, { durable: true });

    // Image upload queues (existing)
    await this.channel.assertQueue('image-upload', { durable: true });
    await this.channel.assertQueue('image-upload-dlq', { durable: true });

    // Bind queues to exchanges
    await this.bindQueues();

    logger.info('RabbitMQ queues declared and bound successfully');
  }

  private async bindQueues(): Promise<void> {
    if (!this.channel) return;

    // Order processing queue bindings
    await this.channel.bindQueue(
      QUEUES.ORDER_PROCESSING,
      EXCHANGES.ORDER_EXCHANGE,
      ROUTING_KEYS.ORDER_CREATED,
    );
    await this.channel.bindQueue(
      QUEUES.ORDER_PROCESSING,
      EXCHANGES.ORDER_EXCHANGE,
      ROUTING_KEYS.ORDER_UPDATED,
    );

    // Notification queue bindings
    await this.channel.bindQueue(
      QUEUES.EMAIL_NOTIFICATION,
      EXCHANGES.NOTIFICATION_EXCHANGE,
      ROUTING_KEYS.NOTIFICATION_EMAIL,
    );
    await this.channel.bindQueue(
      QUEUES.SMS_NOTIFICATION,
      EXCHANGES.NOTIFICATION_EXCHANGE,
      ROUTING_KEYS.NOTIFICATION_SMS,
    );

    // Inventory queue bindings
    await this.channel.bindQueue(
      QUEUES.INVENTORY_UPDATE,
      EXCHANGES.INVENTORY_EXCHANGE,
      ROUTING_KEYS.INVENTORY_RESERVED,
    );
    await this.channel.bindQueue(
      QUEUES.INVENTORY_UPDATE,
      EXCHANGES.INVENTORY_EXCHANGE,
      ROUTING_KEYS.INVENTORY_RELEASED,
    );

    // Order notification bindings
    await this.channel.bindQueue(
      QUEUES.ORDER_NOTIFICATION,
      EXCHANGES.ORDER_EXCHANGE,
      'order.*', // Catch all order events
    );
  }

  public async getChannel(): Promise<Channel> {
    if (!this.channel || !this.connection) {
      await this.connect();
    }
    return this.channel!;
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      logger.info('RabbitMQ disconnected successfully');
    } catch (error) {
      logger.error('RabbitMQ disconnection error:', error);
    }
  }
}
