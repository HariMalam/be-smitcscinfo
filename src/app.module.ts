import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule as AppConfigModule } from './modules/config/config.module';
import { DatabaseModule } from './modules/database/database.module';
import { CustomI18nModule } from './modules/i18n/i18n.module';
import { requestMiddleware } from './common/middleware/request.middleware';
import { MailerModule } from './modules/mailer/mailer.module';
import { JwtAuthModule } from './modules/jwt-auth/jwt-auth.module';
import { ApiModule } from './modules/api/api.module';
import { CronModule } from './modules/cron/cron.module';
import { RedisModule } from './modules/redis/redis.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // time window in seconds
          limit: 100, // max 100 requests per IP in that time
        },
      ],
    }),
    AppConfigModule,
    DatabaseModule,
    CustomI18nModule,
    MailerModule,
    JwtAuthModule,
    ApiModule,
    CronModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(requestMiddleware).forRoutes('*');
  }
}
