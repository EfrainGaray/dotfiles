import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScraperDto } from './dto/create-scraper.dto';
import { UpdateScraperDto } from './dto/update-scraper.dto';

@Injectable()
export class ScrapersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateScraperDto) {
    return this.prisma.scraper.create({
      data: {
        name: dto.name,
        url: dto.url,
        mode: dto.mode ?? 'AUTO',
        config: (dto.config ?? {}) as any,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.scraper.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const scraper = await this.prisma.scraper.findFirst({
      where: { id, userId },
    });

    if (!scraper) {
      throw new NotFoundException('Scraper not found');
    }

    return scraper;
  }

  async update(id: string, userId: string, dto: UpdateScraperDto) {
    await this.findOne(id, userId);

    return this.prisma.scraper.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.scraper.delete({
      where: { id },
    });
  }
}
