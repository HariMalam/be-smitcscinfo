import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig, JwtConfig } from 'src/modules/config/configuration';
import { ConfigModule as AppConfigModule } from '../config/config.module';
import { JwtAuthService } from './jwt-auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const jwt = configService.get<JwtConfig>('jwt');
        return {
          secret: jwt?.secret,
          signOptions: {
            expiresIn: jwt?.expiresIn,
          },
        };
      },
    }),
  ],
  providers: [JwtAuthService],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}
