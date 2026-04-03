import { Module } from '@nestjs/common';
import { ProxiesService } from './proxies.service';
import { ProxiesController } from './proxies.controller';

@Module({
  providers: [ProxiesService],
  controllers: [ProxiesController],
  exports: [ProxiesService],
})
export class ProxiesModule {}
