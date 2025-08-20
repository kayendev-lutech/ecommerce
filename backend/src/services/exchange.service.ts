import { logger } from '@logger/logger';
import { RabbitMQConfig } from 'src/queue/config/rabbitmq.config';
import * as amqp from 'amqplib';

export class ExchangeService {
  private rabbitMQ = RabbitMQConfig.getInstance();

  /**
   * Publish message to exchange with routing key (không xác nhận)
   */
  async publishToExchange(
    exchange: string,
    routingKey: string,
    data: any,
    options?: {
      persistent?: boolean;
      expiration?: string;
      headers?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const channel = await this.rabbitMQ.getChannel();

      const message = Buffer.from(JSON.stringify({
        ...data,
        publishedAt: new Date().toISOString(),
      }));

      const publishOptions = {
        persistent: options?.persistent ?? true,
        expiration: options?.expiration,
        headers: options?.headers,
        messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      const published = channel.publish(
        exchange,
        routingKey,
        message,
        publishOptions
      );

      if (!published) {
        throw new Error('Failed to publish message to exchange');
      }

      logger.info(`Message published to exchange ${exchange} with routing key ${routingKey}`);
    } catch (error) {
      logger.error(`Error publishing to exchange ${exchange}:`, error);
      throw error;
    }
  }

  /**
   * Publish message with confirmation (publisher confirm)
   */
  async publishWithConfirm(
    exchange: string,
    routingKey: string,
    data: any,
    options?: {
      persistent?: boolean;
      expiration?: string;
      headers?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      // Lấy connection từ RabbitMQConfig
      const connection = await this.rabbitMQ['connection'];
      if (!connection) throw new Error('RabbitMQ connection not initialized');

      // Tạo ConfirmChannel
      const confirmChannel: amqp.ConfirmChannel = await connection.createConfirmChannel();

      const message = Buffer.from(JSON.stringify({
        ...data,
        publishedAt: new Date().toISOString(),
      }));

      const publishOptions = {
        persistent: options?.persistent ?? true,
        expiration: options?.expiration,
        headers: options?.headers,
        messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      return new Promise((resolve, reject) => {
        confirmChannel.publish(
          exchange,
          routingKey,
          message,
          publishOptions,
          (err) => {
            if (err) {
              logger.error(`Publish confirmation failed for ${exchange}:`, err);
              reject(err);
            } else {
              logger.info(`Message confirmed for exchange ${exchange} with routing key ${routingKey}`);
              resolve(true);
            }
          }
        );
      });
    } catch (error) {
      logger.error(`Error publishing with confirmation to exchange ${exchange}:`, error);
      throw error;
    }
  }

  /**
   * Publish batch messages to exchange (publisher confirm)
   */
  async publishBatch(
    exchange: string,
    messages: Array<{
      routingKey: string;
      data: any;
      options?: {
        persistent?: boolean;
        expiration?: string;
        headers?: Record<string, any>;
      };
    }>
  ): Promise<void> {
    try {
      // Lấy connection từ RabbitMQConfig
      const connection = await this.rabbitMQ['connection'];
      if (!connection) throw new Error('RabbitMQ connection not initialized');

      // Tạo ConfirmChannel
      const confirmChannel: amqp.ConfirmChannel = await connection.createConfirmChannel();

      const publishPromises = messages.map(({ routingKey, data, options }) => {
        const message = Buffer.from(JSON.stringify({
          ...data,
          publishedAt: new Date().toISOString(),
        }));

        const publishOptions = {
          persistent: options?.persistent ?? true,
          expiration: options?.expiration,
          headers: options?.headers,
          messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        return new Promise<void>((resolve, reject) => {
          confirmChannel.publish(
            exchange,
            routingKey,
            message,
            publishOptions,
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
      });

      await Promise.all(publishPromises);
      logger.info(`Batch published ${messages.length} messages to exchange ${exchange}`);

    } catch (error) {
      logger.error(`Error batch publishing to exchange ${exchange}:`, error);
      throw error;
    }
  }
}