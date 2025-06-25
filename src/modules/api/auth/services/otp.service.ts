import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { Otp } from '../entities/otp.entity';
import { MailerService } from '../../../../modules/mailer/mailer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { generateOtp } from '../../../../common/utils/otp.util';
import { compareValue, hashValue } from '../../../../common/utils/bcrypt.util';
import { User } from '../../user/entites/user.entity';
import { I18nServiceWrapper } from '../../../../modules/i18n/i18n.service';
import { SendOtpDto } from '../dto/send-otp.dto';
import { OtpType } from '../../../../common/enums/otp-type.emum';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nServiceWrapper,
  ) {}

  async sendOtp(sendOtpDto: SendOtpDto): Promise<void> {
    const otp = generateOtp();
    const hashedOtp = await hashValue(otp);

    if (sendOtpDto.type === OtpType.VERIFY_EMAIL) {
      await this.sendVerifyEmailOtp(sendOtpDto.email, otp);
    }

    if (sendOtpDto.type === OtpType.RESET_PASSWORD) {
      await this.sendResetPasswordOtp(sendOtpDto.email, otp);
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const existingOtp = await this.otpRepository.findOne({
      where: { email: sendOtpDto.email },
    });

    if (existingOtp) {
      existingOtp.otp = hashedOtp;
      existingOtp.expiresAt = expiresAt;
      await this.otpRepository.save(existingOtp);
      return;
    }
    const otpEntity = this.otpRepository.create({
      email: sendOtpDto.email,
      otp: hashedOtp,
      expiresAt,
    });
    await this.otpRepository.save(otpEntity);
  }

  async sendVerifyEmailOtp(email: string, otp: string): Promise<void> {
    const existingUser = await this.userRepository.findBy({
      email,
    });
    if (existingUser.length > 0) {
      throw new ConflictException(this.i18n.t('auth', 'USER_ALREADY_EXISTS'));
    }
    await this.mailerService.sendResetPasswordEmail(email, otp);
  }

  async sendResetPasswordOtp(email: string, otp: string): Promise<void> {
    const existingUser = await this.userRepository.findBy({
      email: email,
    });
    if (existingUser.length === 0) {
      throw new ConflictException(this.i18n.t('user', 'NOT_FOUND'));
    }
    await this.mailerService.sendVerifyEmailOtp(email, otp);
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const record = await this.otpRepository.findOne({ where: { email } });
    if (!record || record.expiresAt < new Date()) return false;
    const isMatch = await compareValue(otp, record.otp);
    if (isMatch) {
      await this.otpRepository.delete({ email });
    }
    return isMatch;
  }

  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    const result = await this.otpRepository.delete({
      expiresAt: LessThan(now),
    });
    if (result.affected) {
      this.logger.log(`🧹 Deleted ${result.affected} expired OTPs.`);
    }
  }
}
