import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async onModuleInit() {
    try {
      const pong = await this.redisClient.ping();
      this.logger.log('🔥 Ping response from Redis: ' + pong);
    } catch (err) {
      this.logger.error('❌ Redis ping failed:', err);
    }
  }
}
