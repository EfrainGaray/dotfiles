import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  getHealth() {
    return this.monitoringService.getHealth();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req: { user: { userId: string } }) {
    return this.monitoringService.getStats(req.user.userId);
  }
}
