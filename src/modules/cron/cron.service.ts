import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';
import { CronJob } from 'cron';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as dotenv from 'dotenv';
import { OtpService } from '../api/auth/services/otp.service';
dotenv.config();
@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly otpService: OtpService,
  ) {}
  onModuleInit() {
    const enabled = this.configService.get<boolean>('enableCrons');

    if (!enabled) {
      this.logger.warn('🚨 ENABLE_CRONS=false. Skipping all cron jobs.');
      return;
    }
    this.logger.log('✅ ENABLE_CRONS=true. Registering cron jobs...');

    this.registerJob('otpCleanup', CronExpression.EVERY_DAY_AT_MIDNIGHT, () => {
      void (async () => {
        try {
          await this.otpService.cleanupExpiredOtps();
        } catch (error) {
          this.logger.error('❌ Error in otpCleanup job', error);
        }
      })();
    });
  }

  private registerJob(name: string, cronTime: string, callback: () => void) {
    const job = new CronJob(cronTime, callback);
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    this.logger.log(`🕒 Cron job "${name}" registered: ${cronTime}`);
  }
}
