import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppConfig, JwtConfig } from '../../modules/config/configuration';

@Injectable()
export class JwtAuthService {
  private readonly jwtConfig: JwtConfig;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
  ) {
    this.jwtConfig = this.configService.get<JwtConfig>('jwt') ?? {
      secret: undefined,
      expiresIn: undefined,
    };
  }

  // ✅ Sign access token
  signAccessToken(payload: object): string {
    const token = this.jwtService.sign(payload, {
      secret: this.jwtConfig.secret,
      expiresIn: this.jwtConfig.expiresIn,
    });
    return token;
  }

  // ✅ Verify and return decoded payload
  verifyToken<T extends object = any>(token: string): T {
    return this.jwtService.verify<T>(token, {
      secret: this.jwtConfig.secret,
    });
  }

  // ✅ Just decode without verifying (be careful)
  decodeToken<T = any>(token: string): T | null {
    return this.jwtService.decode(token);
  }
}
