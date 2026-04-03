import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = ctx.getResponse<Response>();
        const duration = Date.now() - start;
        const isProduction = process.env.NODE_ENV === 'production';

        // In production, only log slow requests (>100ms) to reduce noise
        if (isProduction && duration <= 100) {
          return;
        }

        this.logger.log(
          `[${method} ${url}] ${response.statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}
