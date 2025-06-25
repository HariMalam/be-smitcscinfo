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

@Module({
  imports: [
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
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(requestMiddleware).forRoutes('*');
  }
}
