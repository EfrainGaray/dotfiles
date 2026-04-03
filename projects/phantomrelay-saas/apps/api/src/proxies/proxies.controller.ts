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
import { ProxiesService } from './proxies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('proxies')
export class ProxiesController {
  constructor(private readonly proxiesService: ProxiesService) {}

  @Post()
  create(
    @Request() req: { user: { userId: string } },
    @Body() body: { name: string; description?: string; proxies: { url: string; protocol: 'HTTP' | 'HTTPS' | 'SOCKS5' }[] },
  ) {
    return this.proxiesService.create(req.user.userId, body);
  }

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.proxiesService.findAll(req.user.userId);
  }

  @Get('details')
  findAllWithDetails(@Request() req: { user: { userId: string } }) {
    return this.proxiesService.findAllWithDetails(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.proxiesService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
    @Body() body: { name?: string; description?: string },
  ) {
    return this.proxiesService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.proxiesService.remove(id, req.user.userId);
  }
}
