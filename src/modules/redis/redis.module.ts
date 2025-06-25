import { Global, Module } from '@nestjs/common';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';

@Global()
@Module({
  imports: [
    ConfigModule,
    IoRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const redisConfig = configService.get<AppConfig['redis']>('redis', {
          infer: true,
        });
        return {
          type: 'single',
          url: redisConfig.url,
          ...(redisConfig.tls ? { tls: {} } : {}),
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
