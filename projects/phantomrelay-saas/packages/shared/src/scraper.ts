// Scraper modes matching PhantomRelay engine
export type ScrapeMode = "http" | "headless" | "stealth" | "human" | "auto";

export type ActionType =
  | "click"
  | "type"
  | "scroll"
  | "hover"
  | "select"
  | "wait"
  | "screenshot"
  | "evaluate"
  | "navigate";

export interface PageAction {
  type: ActionType;
  selector?: string;
  text?: string;
  ms?: number;
  fn?: string;
  url?: string;
  value?: string;
  clearFirst?: boolean;
  y?: number;
  x?: number;
  button?: "left" | "right" | "middle";
}

export interface ExtractionConfig {
  html: boolean;
  text: boolean;
  screenshot: boolean;
  har: boolean;
  selectors?: string[];
}

export interface ScraperConfig {
  engine: "chrome" | "firefox";
  mode: ScrapeMode;
  waitFor?: "load" | "domcontentloaded" | "networkidle";
  timeout: number;
  actions: PageAction[];
  extract: ExtractionConfig;
  captchaSolve: boolean;
  proxyPoolId?: string;
  profileId?: string;
  extraHeaders?: Record<string, string>;
}

export interface ScheduleConfig {
  type: "once" | "cron" | "interval";
  cron?: string;
  intervalMs?: number;
  runWindow?: {
    startHour: number;
    endHour: number;
    timezone: string;
  };
}

export interface NotificationConfig {
  emailOnFailure: boolean;
  emailOnSuccess: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  webhookEvents?: string[];
}

export type ScraperStatus = "active" | "paused" | "errored" | "archived";
export type RunStatus = "pending" | "running" | "success" | "failed" | "timeout" | "cancelled";

export interface DetectionSignal {
  type: "captcha" | "block_page" | "rate_limit" | "suspicious_redirect" | "js_challenge";
  confidence: number;
  evidence: string;
}
