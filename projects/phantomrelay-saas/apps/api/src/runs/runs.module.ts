import { Module } from '@nestjs/common';
import { RunsService } from './runs.service';
import { RunsController } from './runs.controller';
import { RelayModule } from '../relay/relay.module';

@Module({
  imports: [RelayModule],
  providers: [RunsService],
  controllers: [RunsController],
  exports: [RunsService],
})
export class RunsModule {}
