import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { I18nServiceWrapper } from '../../i18n/i18n.service';
import { ApiTags } from '@nestjs/swagger';
import { SendOtpDto } from './dto/send-otp.dto';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { RegisterDto } from './dto/register.dto';
import { ControllerResponse } from '../../../common/interfaces/api-response.interface';
import { loginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly i18n: I18nServiceWrapper,
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ControllerResponse> {
    const token = await this.authService.register(registerDto);
    return {
      message: this.i18n.t('auth', 'REGISTER_SUCCESS'),
      data: { token },
    };
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.CREATED)
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: SendOtpDto): Promise<ControllerResponse> {
    await this.otpService.sendOtp(body.email);
    return {
      message: this.i18n.t('auth', 'OTP_SENT_SUCCESS'),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: loginDto): Promise<ControllerResponse> {
    const token = await this.authService.login(body);
    return {
      message: this.i18n.t('auth', 'LOGIN_SUCCESS'),
      data: { token },
    };
  }

  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(): Promise<ControllerResponse> {
    const token = await this.authService.googleLogin();
    return {
      message: this.i18n.t('auth', 'LOGIN_SUCCESS'),
      data: { token },
    };
  }
}
