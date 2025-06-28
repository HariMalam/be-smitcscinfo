import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../modules/api/user/user.service';
import { AppConfig } from '../../modules/config/configuration';
import { I18nServiceWrapper } from '../../modules/i18n/i18n.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService<AppConfig>,
    private userService: UserService,
    private readonly i18n: I18nServiceWrapper,
  ) {
    const jwtSecret = config.get<AppConfig['jwt']>('jwt')?.secret;
    if (!jwtSecret) {
      throw new Error('JWT secret is not defined in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOneById(payload.sub);

    if (!user)
      throw new UnauthorizedException(this.i18n.t('user', 'NOT_FOUND'));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((r) => r.name),
    };
  }
}
