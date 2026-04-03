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
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  generate(
    @Request() req: { user: { userId: string } },
    @Body() body: { name: string },
  ) {
    return this.apiKeysService.generate(req.user.userId, body.name);
  }

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.apiKeysService.findAll(req.user.userId);
  }

  @Delete(':id')
  revoke(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.apiKeysService.revoke(id, req.user.userId);
  }
}
