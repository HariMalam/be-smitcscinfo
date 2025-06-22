import { Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { getTypeOrmConfig } from '../config/database.config';
import { User } from '../api/user/entites/user.entity';
import { Role } from '../api/role/entities/role.entity';
import { SeederService } from './services/seeder.service';
import { MigrationService } from './services/migration.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    TypeOrmModule.forFeature([User, Role]),
  ],
  providers: [SeederService, MigrationService],
})
export class DatabaseModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    private readonly seederService: SeederService,
    private readonly migrationService: MigrationService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('📦 Database connected successfully!');
    await this.migrationService.runMigrations();
    await this.seederService.runSeeders();
  }
}
