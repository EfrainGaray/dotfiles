import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProxiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: { name: string; description?: string; proxies: { url: string; protocol: 'HTTP' | 'HTTPS' | 'SOCKS5' }[] },
  ) {
    return this.prisma.proxyPool.create({
      data: {
        name: data.name,
        description: data.description,
        userId,
        proxies: {
          create: data.proxies.map((p) => ({
            url: p.url,
            protocol: p.protocol,
          })),
        },
      },
      include: { proxies: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.proxyPool.findMany({
      where: { userId },
      include: { _count: { select: { proxies: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const pool = await this.prisma.proxyPool.findFirst({
      where: { id, userId },
      include: { proxies: true },
    });

    if (!pool) {
      throw new NotFoundException('Proxy pool not found');
    }

    return pool;
  }

  async update(id: string, userId: string, data: { name?: string; description?: string }) {
    await this.findOne(id, userId);

    return this.prisma.proxyPool.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.proxyPool.delete({
      where: { id },
    });
  }
}
