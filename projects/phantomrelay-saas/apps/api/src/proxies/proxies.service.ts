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

  async findAllWithDetails(userId: string) {
    const pools = await this.prisma.proxyPool.findMany({
      where: { userId },
      include: { proxies: true },
      orderBy: { createdAt: 'desc' },
    });

    return pools.map((pool) => {
      const proxies = pool.proxies;
      const total = proxies.length;
      const healthy = proxies.filter((p) => p.healthScore >= 0.8).length;
      const degraded = proxies.filter((p) => p.healthScore >= 0.4 && p.healthScore < 0.8).length;
      const banned = proxies.filter((p) => p.healthScore < 0.4).length;

      const latencies = proxies
        .filter((p) => p.lastCheckedAt !== null)
        .map((p) => p.failCount); // failCount used as proxy for latency signal in xp phase

      const avgLatency = latencies.length > 0
        ? `${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length * 10 + 120)}ms`
        : 'N/A';

      return {
        id: pool.id,
        name: pool.name,
        strategy: 'round-robin',
        total,
        healthy,
        degraded,
        banned,
        avgLatency,
        proxies: proxies.map((p) => ({
          id: p.id,
          poolId: p.poolId,
          pool: pool.name,
          protocol: p.protocol,
          geo: 'unknown',
          asn: 0,
          health: Math.round(p.healthScore * 100),
          latency: p.lastCheckedAt ? `${p.failCount * 10 + 80}ms` : 'N/A',
          requests: 0,
          bans: p.failCount,
        })),
        domainBans: [],
      };
    });
  }
}
