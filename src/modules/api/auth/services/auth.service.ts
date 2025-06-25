import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { RegisterDto } from '../dto/register.dto';
import { OtpService } from './otp.service';
import { CreateUserDto } from '../../../../modules/api/user/dto/create-user.dto';
import { JwtAuthService } from '../../../../modules/jwt-auth/jwt-auth.service';
import { JwtAuthPayload } from '../../../../common/interfaces/jwt-auth.interface';
import { I18nServiceWrapper } from '../../../../modules/i18n/i18n.service';
import { LoginDto } from '../dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entites/user.entity';
import { Repository } from 'typeorm';
import { compareValue, hashValue } from '../../../../common/utils/bcrypt.util';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly i18n: I18nServiceWrapper,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('GOOGLE_OAUTH_CLIENT')
    private readonly oauthClient: OAuth2Client,
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

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { email, otp, password } = resetPasswordDto;
    const isValid = await this.otpService.verifyOtp(email, otp);
    if (!isValid) {
      throw new BadRequestException(this.i18n.t('auth', 'INVALID_OTP'));
    }
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException(this.i18n.t('user', 'NOT_FOUND'));
    }
    const hashedPassword = await hashValue(password);
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<string> {
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

  async googleLogin(googleLoginDto: GoogleLoginDto): Promise<string> {
    const ticket = await this.oauthClient.verifyIdToken({
      idToken: googleLoginDto.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestException('Invalid Google token provided');
    }

    if (!payload.email) {
      throw new BadRequestException('Email not found in Google token payload');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: payload.email },
    });

    if (existingUser) {
      const jwtAuthPayload: JwtAuthPayload = {
        sub: existingUser.id,
        email: existingUser.email,
        roles: existingUser.roles.map((role) => role.name),
      };
      return this.jwtAuthService.signAccessToken(jwtAuthPayload);
    }

    const roles = ['default'];
    const createUserDto: CreateUserDto = {
      email: payload.email,
      name: payload.family_name + ' ' + payload.given_name,
      googleId: payload.sub,
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
}
