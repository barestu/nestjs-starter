import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      password: hashed,
    });
    const saved = await this.userRepository.save(user);
    await this.sendVerificationEmail(saved);

    return {
      message:
        'Registration successful. Please verify your email before logging in.',
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;

    const matches = await bcrypt.compare(password, user.password);
    return matches ? user : null;
  }

  login(user: User): { accessToken: string } {
    if (!user.isVerified) {
      throw new ForbiddenException('Email not verified');
    }
    return this.signToken(user);
  }

  async me(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (
      !user ||
      !user.verificationTokenExpiry ||
      user.verificationTokenExpiry < new Date()
    ) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('No account with that email');
    }
    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.sendVerificationEmail(user);
    return { message: 'Verification email sent' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      user.resetPasswordToken = token;
      user.resetPasswordTokenExpiry = expiry;
      await this.userRepository.save(user);

      await this.mailService.sendPasswordResetEmail(user.email, token);
    }

    return { message: 'If that email exists, a reset link was sent' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (
      !user ||
      !user.resetPasswordTokenExpiry ||
      user.resetPasswordTokenExpiry < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);

    user.verificationToken = token;
    user.verificationTokenExpiry = expiry;
    await this.userRepository.save(user);

    await this.mailService.sendVerificationEmail(user.email, token);
  }

  private signToken(user: User): { accessToken: string } {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
