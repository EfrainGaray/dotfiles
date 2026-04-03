import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(
    @Request() req: { user: { userId: string } },
    @Body() body: { scraperId: string; cron: string },
  ) {
    return this.schedulesService.create(body.scraperId, body.cron, req.user.userId);
  }

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.schedulesService.findAll(req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.schedulesService.remove(id, req.user.userId);
  }
}
