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
import { CreateProxyPoolDto } from './dto/create-proxy-pool.dto';
import { UpdateProxyPoolDto } from './dto/update-proxy-pool.dto';
import { AddProxyDto } from './dto/add-proxy.dto';

@UseGuards(JwtAuthGuard)
@Controller('proxies')
export class ProxiesController {
  constructor(private readonly proxiesService: ProxiesService) {}

  @Post()
  create(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateProxyPoolDto,
  ) {
    return this.proxiesService.create(req.user.userId, dto);
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
    @Body() dto: UpdateProxyPoolDto,
  ) {
    return this.proxiesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.proxiesService.remove(id, req.user.userId);
  }

  @Post(':poolId/proxies')
  addProxy(
    @Param('poolId') poolId: string,
    @Body() dto: AddProxyDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.proxiesService.addProxy(poolId, req.user.userId, dto);
  }

  @Post(':id/test')
  testProxy(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.proxiesService.testProxy(id, req.user.userId);
  }
}
