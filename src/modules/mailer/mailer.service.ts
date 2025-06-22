import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from '../config/configuration';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly user: string;

  constructor(private readonly configService: ConfigService) {
    const { user, pass } = this.configService.getOrThrow<EmailConfig>('email');
    this.user = user || '';
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const templatePath = join(process.cwd(), 'templates', 'otp-email.hbs');
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
}
