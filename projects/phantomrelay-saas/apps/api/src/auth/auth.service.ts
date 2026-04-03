import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async register(email: string, password: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Get or create the free plan for new users
    let freePlan = await this.prisma.plan.findUnique({ where: { name: 'free' } });
    if (!freePlan) {
      freePlan = await this.prisma.plan.create({
        data: {
          name: 'free',
          price: 0,
          requestsPerMonth: 100,
          maxScrapers: 3,
          maxConcurrent: 1,
          features: {},
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        planId: freePlan.id,
      },
    });

    const { passwordHash: _, ...result } = user;
    return this.login(result as { id: string; email: string });
  }

  async findOrCreateOAuthUser(
    provider: 'GOOGLE' | 'GITHUB',
    providerId: string,
    email: string,
    name: string,
    avatarUrl: string | null,
  ) {
    // 1. Try to find by provider + providerId
    let user = await this.prisma.user.findFirst({
      where: { provider, providerId },
    });

    if (user) {
      const { passwordHash: _, ...result } = user;
      return result;
    }

    // 2. Try to find by email (link accounts)
    user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      // Link OAuth provider to existing account
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          provider,
          providerId,
          avatarUrl: user.avatarUrl || avatarUrl,
          name: user.name || name,
        },
      });
      const { passwordHash: _, ...result } = user;
      return result;
    }

    // 3. Create new user
    let freePlan = await this.prisma.plan.findUnique({ where: { name: 'free' } });
    if (!freePlan) {
      freePlan = await this.prisma.plan.create({
        data: {
          name: 'free',
          price: 0,
          requestsPerMonth: 100,
          maxScrapers: 3,
          maxConcurrent: 1,
          features: {},
        },
      });
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        name,
        avatarUrl,
        provider,
        providerId,
        planId: freePlan.id,
      },
    });

    const { passwordHash: _, ...result } = newUser;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        provider: true,
        createdAt: true,
        plan: { select: { name: true, requestsPerMonth: true, maxScrapers: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
