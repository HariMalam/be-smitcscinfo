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

@Module({
  imports: [
    UserModule,
    MailerModule,
    TypeOrmModule.forFeature([Otp, User]),
    JwtAuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService],
  exports: [AuthService, OtpService],
})
export class AuthModule {}
