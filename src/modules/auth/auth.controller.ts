import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { User } from '../../database/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register new user' })
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login and receive JWT' })
  @ApiBody({ type: LoginDto })
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Body() _dto: LoginDto, @CurrentUser() user: User) {
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: User) {
    return this.authService.me(user.id);
  }

  @ApiOperation({ summary: 'Verify email with token from link' })
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @ApiOperation({ summary: 'Resend verification email' })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @ApiOperation({ summary: 'Request password reset email' })
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({ summary: 'Reset password using token from email' })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
