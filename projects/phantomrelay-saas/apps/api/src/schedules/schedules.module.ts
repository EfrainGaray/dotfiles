import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { ScraperRunsProcessor } from './scraper-runs.processor';
import { RunsModule } from '../runs/runs.module';
import { EventsModule } from '../common/events/events.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'scraper-runs' }),
    RunsModule,
    EventsModule,
  ],
  providers: [SchedulesService, ScraperRunsProcessor],
  controllers: [SchedulesController],
  exports: [SchedulesService],
})
export class SchedulesModule {}
