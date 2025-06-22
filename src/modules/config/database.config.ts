import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('db.host'),
  port: configService.get<number>('db.port'),
  username: configService.get<string>('db.username'),
  password: configService.get<string>('db.password'),
  database: configService.get<string>('db.name'),
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
});
