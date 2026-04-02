// API response wrappers

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  planId: string;
  createdAt: string;
}

// Fleet health (from PhantomRelay engine)
export interface FleetHealth {
  status: "ok" | "degraded";
  fleet: {
    total: number;
    ready: number;
    busy: number;
  };
  uptime: number;
  timestamp: string;
}

// Usage
export interface UsageSummary {
  current: number;
  limit: number;
  period: string;
  percent: number;
}

// SSE event types
export type SseEventType =
  | "run.started"
  | "run.completed"
  | "run.failed"
  | "fleet.update"
  | "alert"
  | "usage.warning";
