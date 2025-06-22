import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/modules/config/configuration';
import { AppDataSource } from '../data-source';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly configService: ConfigService<AppConfig>) {}
  async runMigrations() {
    const runMigrations = this.configService.get<boolean>('runMigrations');
    if (!runMigrations) {
      this.logger.warn('🚨 RUN_MIGRATIONS=false. Skipping all migrations.');
      return;
    }
    this.logger.log('✅ RUN_MIGRATIONS=true. Running pending migrations...');
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const migrations = await AppDataSource.runMigrations();
      this.logger.log(`🟢 Ran ${migrations.length} pending migrations.`);
    } catch (error) {
      this.logger.error('❌ Error running migrations:', error);
      process.exit(1);
    }
  }
}
