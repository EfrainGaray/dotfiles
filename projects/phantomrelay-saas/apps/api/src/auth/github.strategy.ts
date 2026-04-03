import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: Record<string, unknown>) => void,
  ): Promise<void> {
    const email =
      profile.emails?.[0]?.value ||
      `${profile.username}@github.noemail`;
    const name = profile.displayName || profile.username || '';
    const avatarUrl =
      (profile.photos?.[0]?.value as string | undefined) || null;

    const user = await this.authService.findOrCreateOAuthUser(
      'GITHUB',
      profile.id,
      email,
      name,
      avatarUrl,
    );

    done(null, user);
  }
}
