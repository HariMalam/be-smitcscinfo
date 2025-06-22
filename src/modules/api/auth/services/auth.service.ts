import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { RegisterDto } from '../dto/register.dto';
import { OtpService } from './otp.service';
import { CreateUserDto } from 'src/modules/api/user/dto/create-user.dto';
import { JwtAuthService } from 'src/modules/jwt-auth/jwt-auth.service';
import { JwtAuthPayload } from 'src/common/interfaces/jwt-auth.interface';
import { I18nServiceWrapper } from 'src/modules/i18n/i18n.service';
import { loginDto } from '../dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entites/user.entity';
import { Repository } from 'typeorm';
import { compareValue } from 'src/common/utils/bcrypt.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly i18n: I18nServiceWrapper,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<string> {
    const isValid = await this.otpService.verifyOtp(
      registerDto.email,
      registerDto.otp,
    );
    if (!isValid) {
      throw new BadRequestException(this.i18n.t('auth', 'INVALID_OTP'));
    }
    const roles = ['default'];
    const createUserDto: CreateUserDto = {
      ...registerDto,
      roles,
    };
    const user = await this.userService.create(createUserDto);
    const jwtAuthPayload: JwtAuthPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    };
    return this.jwtAuthService.signAccessToken(jwtAuthPayload);
  }

  async login(loginDto: loginDto): Promise<string> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException(
        this.i18n.t('auth', 'INVALID_LOGIN_CREDENTIALS'),
      );
    }
    if (!user.password) {
      throw new BadRequestException(
        this.i18n.t('auth', 'INVALID_LOGIN_CREDENTIALS'),
      );
    }
    const isValidPasword = await compareValue(password, user.password);
    if (!isValidPasword) {
      throw new BadRequestException(
        this.i18n.t('auth', 'INVALID_LOGIN_CREDENTIALS'),
      );
    }
    const jwtAuthPayload: JwtAuthPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    };
    return this.jwtAuthService.signAccessToken(jwtAuthPayload);
  }

  async googleLogin() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return 'jwt-token-google';
  }
}
