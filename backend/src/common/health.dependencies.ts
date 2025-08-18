import { AppDataSource } from "@config/typeorm.config";
import { RedisService } from "@services/redis.service";
import { RabbitMQConfig } from "src/queue/config/rabbitmq.config";
import { QueueService } from "src/queue/services/queue.service";

export class HealthController {
  constructor(
    private redisService: RedisService,
    private queueService: QueueService
  ) {}

  async checkHealth(): Promise<any> {
    const [redis, rabbitmq, database] = await Promise.allSettled([
      this.checkRedis(),
      this.checkRabbitMQ(), 
      this.checkDatabase()
    ]);

    return {
      status: redis.status === 'fulfilled' && rabbitmq.status === 'fulfilled' && database.status === 'fulfilled' 
        ? 'healthy' : 'unhealthy',
      services: {
        redis: redis.status === 'fulfilled' ? 'up' : 'down',
        rabbitmq: rabbitmq.status === 'fulfilled' ? 'up' : 'down',
        database: database.status === 'fulfilled' ? 'up' : 'down',
      },
      timestamp: new Date().toISOString()
    };
  }

  private async checkRedis(): Promise<boolean> {
    return await this.redisService.exists('health:check');
  }

  private async checkRabbitMQ(): Promise<boolean> {
    try {
      const channel = await RabbitMQConfig.getInstance().getChannel();
      return !!channel;
    } catch {
      return false;
    }
  }

  private async checkDatabase(): Promise<boolean> {
    return AppDataSource.isInitialized;
  }
}