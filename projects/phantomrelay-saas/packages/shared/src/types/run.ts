export enum RunStatus {
  PENDING = "pending",
  RUNNING = "running",
  SUCCESS = "success",
  FAILED = "failed",
  TIMEOUT = "timeout",
}

export interface DetectionSignal {
  type: "captcha" | "block_page" | "rate_limit" | "suspicious_redirect" | "js_challenge";
  detected: boolean;
  confidence: number;
  details?: string;
}

export interface Run {
  id: string;
  scraperId: string;
  status: RunStatus;
  mode: string;
  latencyMs: number | null;
  resultHtml: string | null;
  resultText: string | null;
  screenshotUrl: string | null;
  harData: unknown | null;
  detectionSignals: DetectionSignal[];
  errorCode: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}
