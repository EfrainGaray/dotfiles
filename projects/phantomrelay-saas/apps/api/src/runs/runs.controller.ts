import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RunsService } from './runs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  /**
   * GET /runs/stats — must be before :id to avoid route collision
   */
  @Get('stats')
  getStats(@CurrentUser() user: JwtUser) {
    return this.runsService.getStats(user.userId);
  }

  /**
   * POST /runs/:scraperId/execute — trigger a new run
   */
  @Post(':scraperId/execute')
  create(
    @Param('scraperId') scraperId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.runsService.create(scraperId, user.userId);
  }

  /**
   * GET /runs — list all runs for user with optional filters
   */
  @Get()
  findAll(
    @CurrentUser() user: JwtUser,
    @Query('scraperId') scraperId?: string,
    @Query('status') status?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.runsService.findAll(user.userId, {
      scraperId,
      status,
      take: take ? parseInt(take, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
    });
  }

  /**
   * GET /runs/:id — get full run detail
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.runsService.findOne(id, user.userId);
  }
}
