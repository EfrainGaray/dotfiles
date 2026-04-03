import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ScrapersModule } from './scrapers/scrapers.module';
import { RunsModule } from './runs/runs.module';
import { RelayModule } from './relay/relay.module';
import { SchedulesModule } from './schedules/schedules.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ProxiesModule } from './proxies/proxies.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { EventsModule } from './common/events/events.module';
import { BullBoardSetupModule } from './bull-board/bull-board.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    ScrapersModule,
    RunsModule,
    RelayModule,
    SchedulesModule,
    BillingModule,
    NotificationsModule,
    MonitoringModule,
    ProxiesModule,
    ApiKeysModule,
    EventsModule,
    BullBoardSetupModule,
  ],
})
export class AppModule {}
