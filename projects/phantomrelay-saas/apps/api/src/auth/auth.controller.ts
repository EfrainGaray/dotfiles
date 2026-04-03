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
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private readonly frontendUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4321';
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: { id: string; email: string } }) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string },
  ) {
    return this.authService.register(body.email, body.password, body.name);
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
    res.redirect(`${this.frontendUrl}/auth/callback?token=${accessToken}`);
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
    res.redirect(`${this.frontendUrl}/auth/callback?token=${accessToken}`);
  }
}
