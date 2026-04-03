import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AppEvent {
  type:
    | 'run.started'
    | 'run.completed'
    | 'run.failed'
    | 'schedule.triggered';
  data: Record<string, unknown>;
}

export interface SseMessage {
  data: string;
  type?: string;
}

@Injectable()
export class EventsService {
  private readonly events$ = new Subject<AppEvent>();

  emit(event: AppEvent): void {
    this.events$.next(event);
  }

  subscribe(): Observable<SseMessage> {
    return this.events$.asObservable().pipe(
      map((event) => ({
        type: event.type,
        data: JSON.stringify(event.data),
      })),
    );
  }
}
