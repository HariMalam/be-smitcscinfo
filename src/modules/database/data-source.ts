import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import configuration from '../config/configuration';
import { getTypeOrmConfig } from '../config/database.config';
import { envSchema } from '../config/validation.schema';

// Zod validation
const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.format());
  process.exit(1);
}

// Create ConfigService manually using validated config
const configService = new ConfigService(configuration());

// Generate TypeORM options using your shared config
const dataSourceOptions = getTypeOrmConfig(configService);

// Ensure 'type' is always defined for DataSourceOptions
if (!dataSourceOptions.type) {
  throw new Error('Database type must be defined in dataSourceOptions.');
}

// Export TypeORM DataSource
export const AppDataSource = new DataSource(
  dataSourceOptions as import('typeorm').DataSourceOptions,
);
