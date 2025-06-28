import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { MailerModule } from '../../mailer/mailer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { JwtAuthModule } from '../../../modules/jwt-auth/jwt-auth.module';
import { User } from '../user/entites/user.entity';
import { GoogleAuthModule } from '../google-auth/google-auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../../common/strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    MailerModule,
    TypeOrmModule.forFeature([Otp, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtAuthModule,
    GoogleAuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JwtStrategy],
  exports: [AuthService, OtpService],
})
export class AuthModule {}
