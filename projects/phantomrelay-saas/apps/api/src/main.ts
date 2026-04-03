import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(cookieParser());
  app.use(helmet());

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow localhost and Tailscale/LAN origins in dev
      if (!origin || origin.match(/^https?:\/\/(localhost|127\.0\.0\.1|100\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  app.setGlobalPrefix('api');

  // Queue dashboard — admin-protected, optional via feature flag
  const queueDashboardEnabled = process.env.QUEUE_DASHBOARD_ENABLED !== 'false';
  if (queueDashboardEnabled) {
    const adminKey = process.env.ADMIN_KEY;
    app.use('/queues', (req: Request, res: Response, next: NextFunction) => {
      if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      next();
    });
  }

  await app.listen(3001);
  console.log('PhantomRelay API running on http://localhost:3001');
}

bootstrap();
