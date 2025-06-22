import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { Otp } from '../entities/otp.entity';
import { MailerService } from 'src/modules/mailer/mailer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { generateOtp } from 'src/common/utils/otp.util';
import { compareValue, hashValue } from 'src/common/utils/bcrypt.util';
import { User } from '../../user/entites/user.entity';
import { I18nServiceWrapper } from 'src/modules/i18n/i18n.service';

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

  async sendOtp(email: string): Promise<void> {
    const existingUser = await this.userRepository.findBy({ email });
    if (existingUser.length > 0) {
      throw new ConflictException(this.i18n.t('auth', 'USER_ALREADY_EXISTS'));
    }
    const otp = generateOtp();
    const hashedOtp = await hashValue(otp);

    await this.mailerService.sendOtpEmail(email, otp);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const existingOtp = await this.otpRepository.findOne({ where: { email } });

    if (existingOtp) {
      existingOtp.otp = hashedOtp;
      existingOtp.expiresAt = expiresAt;
      await this.otpRepository.save(existingOtp);
    } else {
      const otpEntity = this.otpRepository.create({
        email,
        otp: hashedOtp,
        expiresAt,
      });
      await this.otpRepository.save(otpEntity);
    }
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
