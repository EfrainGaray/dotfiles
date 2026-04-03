import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ScrapersService } from './scrapers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateScraperDto } from './dto/create-scraper.dto';
import { UpdateScraperDto } from './dto/update-scraper.dto';

@UseGuards(JwtAuthGuard)
@Controller('scrapers')
export class ScrapersController {
  constructor(private readonly scrapersService: ScrapersService) {}

  @Post()
  create(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateScraperDto,
  ) {
    return this.scrapersService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.scrapersService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.scrapersService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
    @Body() dto: UpdateScraperDto,
  ) {
    return this.scrapersService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.scrapersService.remove(id, req.user.userId);
  }
}
