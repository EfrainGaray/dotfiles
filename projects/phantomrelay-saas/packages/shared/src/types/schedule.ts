export enum ScheduleType {
  ONCE = "once",
  CRON = "cron",
  INTERVAL = "interval",
}

export interface RunWindow {
  startHour: number;
  endHour: number;
  timezone: string;
  daysOfWeek?: number[];
}

export interface Schedule {
  id: string;
  scraperId: string;
  type: ScheduleType;
  cron: string | null;
  intervalMs: number | null;
  runWindow: RunWindow | null;
  nextRunAt: string | null;
  enabled: boolean;
}
