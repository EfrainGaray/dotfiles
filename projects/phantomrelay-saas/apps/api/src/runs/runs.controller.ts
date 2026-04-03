import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RunsService } from './runs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post('scraper/:scraperId')
  create(
    @Param('scraperId') scraperId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.runsService.create(scraperId, req.user.userId);
  }

  @Get('scraper/:scraperId')
  findAll(
    @Param('scraperId') scraperId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.runsService.findAll(scraperId, req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.runsService.findOne(id, req.user.userId);
  }
}
