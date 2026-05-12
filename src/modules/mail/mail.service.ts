import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your email',
      template: 'verification',
      context: {
        token,
        frontendUrl,
        verifyUrl: `${frontendUrl}/verify?token=${token}`,
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      template: 'reset-password',
      context: {
        resetUrl: `${frontendUrl}/reset-password?token=${token}`,
      },
    });
  }
}
