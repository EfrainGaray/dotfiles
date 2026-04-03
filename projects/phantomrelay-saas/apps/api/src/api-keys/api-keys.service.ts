import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(userId: string, name: string) {
    const rawKey = `pr_${randomBytes(32).toString('hex')}`;
    const prefix = rawKey.substring(0, 8);
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name,
        prefix,
        keyHash,
        userId,
      },
    });

    // Return raw key only once — it won't be stored in plain text
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
      prefix: apiKey.prefix,
      createdAt: apiKey.createdAt,
    };
  }

  async findAll(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId, revokedAt: null },
      select: {
        id: true,
        name: true,
        prefix: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(id: string, userId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, userId, revokedAt: null },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async validateKey(rawKey: string) {
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.prisma.apiKey.findFirst({
      where: { keyHash, revokedAt: null },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!apiKey) {
      return null;
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Update last used timestamp
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return apiKey.user;
  }
}
