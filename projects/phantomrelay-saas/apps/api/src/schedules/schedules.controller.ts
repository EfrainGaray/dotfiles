import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  SchedulesService,
  CreateScheduleDto,
  UpdateScheduleDto,
} from './schedules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post(':scraperId')
  create(
    @Param('scraperId') scraperId: string,
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateScheduleDto,
  ) {
    return this.schedulesService.create(scraperId, req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.schedulesService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.schedulesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.schedulesService.remove(id, req.user.userId);
  }

  @Post(':id/pause')
  pause(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.schedulesService.pause(id, req.user.userId);
  }

  @Post(':id/resume')
  resume(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.schedulesService.resume(id, req.user.userId);
  }
}
