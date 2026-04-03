import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const ACCESS_TOKEN_COOKIE = 'access_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes — matches JWT expiry
};

@Controller('auth')
export class AuthController {
  private readonly frontendUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4321';
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: { user: { id: string; email: string } },
    @Res({ passthrough: true }) res: Response,
    @Body() _dto: LoginDto,
  ) {
    const result = await this.authService.login(req.user);
    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, COOKIE_OPTIONS);
    return result;
  }

  @UseGuards(ThrottlerGuard)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto.email, dto.password, dto.name ?? '');
    res.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, COOKIE_OPTIONS);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: { user: { userId: string } }) {
    return this.authService.getProfile(req.user.userId);
  }

  // --- Google OAuth ---

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Request() req: { user: { id: string; email: string } },
    @Res() res: Response,
  ) {
    const { accessToken } = await this.authService.login(req.user);
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, COOKIE_OPTIONS);
    res.redirect(`${this.frontendUrl}/dashboard`);
  }

  // --- GitHub OAuth ---

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {
    // Guard redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Request() req: { user: { id: string; email: string } },
    @Res() res: Response,
  ) {
    const { accessToken } = await this.authService.login(req.user);
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, COOKIE_OPTIONS);
    res.redirect(`${this.frontendUrl}/dashboard`);
  }
}
