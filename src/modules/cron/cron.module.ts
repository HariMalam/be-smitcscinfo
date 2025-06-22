import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { AuthModule } from '../api/auth/auth.module';
@Module({
  imports: [ScheduleModule.forRoot(), AuthModule],
  providers: [CronService],
})
export class CronModule {}
