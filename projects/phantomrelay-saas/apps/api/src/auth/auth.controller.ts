import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
