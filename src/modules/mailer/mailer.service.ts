import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly user: string;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    const { user, pass } =
      this.configService.getOrThrow<AppConfig['email']>('email');
    this.user = user || '';
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  async sendVerifyEmailOtp(to: string, otp: string): Promise<void> {
    const templatePath = join(process.cwd(), 'templates', 'verify-email.hbs');
    const source = await readFile(templatePath, 'utf-8');

    const compiled = handlebars.compile(source);
    const html = compiled({
      otp,
      year: new Date().getFullYear(),
    });

    const mailOptions = {
      from: `"No Reply" <${this.user}>`,
      to,
      subject: 'Your OTP Code',
      html,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendResetPasswordEmail(to: string, otp: string): Promise<void> {
    const templatePath = join(
      process.cwd(),
      'templates',
      'reset-password-email.hbs',
    );
    const source = await readFile(templatePath, 'utf-8');
    const compiled = handlebars.compile(source);
    const html = compiled({
      otp,
      year: new Date().getFullYear(),
    });

    const mailOptions = {
      from: `"No Reply" <${this.user}>`,
      to,
      subject: 'Reset Your Password',
      html,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
