import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
