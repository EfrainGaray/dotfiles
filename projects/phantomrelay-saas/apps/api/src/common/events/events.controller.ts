import { Controller, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventsService, SseMessage } from './events.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Sse('stream')
  stream(): Observable<SseMessage> {
    return this.eventsService.subscribe();
  }
}
