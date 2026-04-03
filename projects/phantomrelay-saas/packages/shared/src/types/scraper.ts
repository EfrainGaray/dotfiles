export enum ScraperMode {
  HTTP = "http",
  HEADLESS = "headless",
  STEALTH = "stealth",
  HUMAN = "human",
  AUTO = "auto",
}

export enum ScraperStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  ERROR = "errored",
  ARCHIVED = "archived",
}

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
  waitFor?: "load" | "domcontentloaded" | "networkidle";
  actions: PageAction[];
  extract: ExtractionConfig;
  proxy?: string;
  captchaSolve: boolean;
  timeout: number;
  extraHeaders?: Record<string, string>;
  profileId?: string;
  proxyPoolId?: string;
}

export interface Scraper {
  id: string;
  name: string;
  url: string;
  mode: ScraperMode;
  config: ScraperConfig;
  status: ScraperStatus;
  schedule?: string | null;
  lastRunAt: string | null;
  createdAt: string;
}

export interface CreateScraperRequest {
  name: string;
  url: string;
  mode: ScraperMode;
  config: ScraperConfig;
}

export interface UpdateScraperRequest {
  name?: string;
  url?: string;
  mode?: ScraperMode;
  config?: Partial<ScraperConfig>;
  status?: ScraperStatus;
}
