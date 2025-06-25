import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { GoogleAuthModule } from './google-auth/google-auth.module';

@Module({
  imports: [AuthModule, RoleModule, UserModule, GoogleAuthModule],
})
export class ApiModule {}
