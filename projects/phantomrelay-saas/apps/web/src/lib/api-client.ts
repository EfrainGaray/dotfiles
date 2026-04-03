// API Client for PhantomRelay SaaS
// Typed fetch wrapper with auth token management

function getBaseUrl(): string {
  if (typeof import.meta !== "undefined") {
    const envUrl = (import.meta.env as Record<string, string>)?.PUBLIC_API_URL;
    if (envUrl) return envUrl;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return `http://${host}:3001/api`;
  }
  return "http://localhost:3001/api";
}

let _baseUrl: string | null = null;
function BASE_URL(): string {
  if (!_baseUrl) _baseUrl = getBaseUrl();
  return _baseUrl;
}

// --- Token helpers ---

const TOKEN_KEY = "auth-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // Also set as cookie for SSR middleware to read
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

// --- Core fetch wrapper ---

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL()}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized", null);
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // response may not be JSON
    }
    throw new ApiError(response.status, response.statusText, body);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();
  // Unwrap NestJS TransformInterceptor envelope { data, timestamp }
  if (json && typeof json === "object" && "data" in json && "timestamp" in json) {
    return json.data as T;
  }
  return json as T;
}

// --- Auth types ---

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  createdAt: string;
}

// --- Scraper types ---

export interface Scraper {
  id: string;
  name: string;
  targetUrl: string;
  mode: string;
  config: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScraperData {
  name: string;
  targetUrl: string;
  mode?: string;
  config?: Record<string, unknown>;
}

export interface UpdateScraperData {
  name?: string;
  targetUrl?: string;
  mode?: string;
  status?: string;
  config?: Record<string, unknown>;
}

// --- Run types ---

export interface Run {
  id: string;
  scraperId: string;
  status: string;
  mode: string;
  result: Record<string, unknown> | null;
  error: string | null;
  latencyMs: number | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface RunStats {
  totalRuns: number;
  successRate: number;
  avgLatency: number;
  runsByMode: Record<string, number>;
}

export interface RunsParams {
  scraperId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// --- Proxy types ---

export interface ProxyPool {
  id: string;
  name: string;
  strategy: string;
  proxies: number;
  createdAt: string;
}

export interface CreateProxyPoolData {
  name: string;
  strategy?: string;
  proxies: Array<{
    host: string;
    port: number;
    username?: string;
    password?: string;
    country?: string;
  }>;
}

// --- ApiKey types ---

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  createdAt: string;
}

// --- Auth methods ---

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.accessToken);
  return data;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  setToken(data.accessToken);
  return data;
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}

// --- Scraper methods ---

export async function getScrapers(): Promise<Scraper[]> {
  return apiFetch<Scraper[]>("/scrapers");
}

export async function getScraper(id: string): Promise<Scraper> {
  return apiFetch<Scraper>(`/scrapers/${id}`);
}

export async function createScraper(
  data: CreateScraperData
): Promise<Scraper> {
  return apiFetch<Scraper>("/scrapers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateScraper(
  id: string,
  data: UpdateScraperData
): Promise<Scraper> {
  return apiFetch<Scraper>(`/scrapers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteScraper(id: string): Promise<void> {
  return apiFetch<void>(`/scrapers/${id}`, {
    method: "DELETE",
  });
}

// --- Run methods ---

export async function executeRun(scraperId: string): Promise<Run> {
  return apiFetch<Run>(`/scrapers/${scraperId}/run`, {
    method: "POST",
  });
}

export async function getRuns(params?: RunsParams): Promise<Run[]> {
  const searchParams = new URLSearchParams();
  if (params?.scraperId) searchParams.set("scraperId", params.scraperId);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return apiFetch<Run[]>(`/runs${query ? `?${query}` : ""}`);
}

export async function getRun(id: string): Promise<Run> {
  return apiFetch<Run>(`/runs/${id}`);
}

export async function getRunStats(): Promise<RunStats> {
  return apiFetch<RunStats>("/runs/stats");
}

// --- Proxy methods ---

export async function getProxyPools(): Promise<ProxyPool[]> {
  return apiFetch<ProxyPool[]>("/proxies");
}

export async function createProxyPool(
  data: CreateProxyPoolData
): Promise<ProxyPool> {
  return apiFetch<ProxyPool>("/proxies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- ApiKey methods ---

export async function getApiKeys(): Promise<ApiKey[]> {
  return apiFetch<ApiKey[]>("/api-keys");
}

export async function createApiKey(name: string): Promise<ApiKey> {
  return apiFetch<ApiKey>("/api-keys", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function revokeApiKey(id: string): Promise<void> {
  return apiFetch<void>(`/api-keys/${id}`, {
    method: "DELETE",
  });
}

// --- Billing types ---

export interface BillingUsage {
  requests: number;
  requestsLimit: number;
  scrapers: number;
  scrapersLimit: number;
  concurrent: number;
  concurrentLimit: number;
  currentPlan: string;
  renewsAt: string;
}

export interface BillingPlan {
  name: string;
  price: string;
  period: string;
  requests: string;
  scrapers: string;
  concurrent: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
}

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}

// --- Billing methods ---

export async function getUsage(): Promise<BillingUsage> {
  return apiFetch<BillingUsage>("/billing/usage");
}

export async function getPlans(): Promise<BillingPlan[]> {
  return apiFetch<BillingPlan[]>("/billing/plans");
}

export async function getInvoices(): Promise<Invoice[]> {
  return apiFetch<Invoice[]>("/billing/invoices");
}

export async function createCheckout(planName: string): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>("/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ planName }),
  });
}

export async function createPortal(): Promise<PortalResponse> {
  return apiFetch<PortalResponse>("/billing/portal", {
    method: "POST",
  });
}

// --- Monitoring types ---

export interface MonitoringStats {
  fleet: {
    ready: number;
    busy: number;
    dead: number;
    capacity: number;
    utilization: string;
  };
  instances: Array<{
    id: string;
    status: string;
    mode: string;
    profile: string;
    uptime: string;
    requests: number;
    port: number;
  }>;
  latency: Array<{
    label: string;
    http: string;
    headless: string;
    stealth: string;
    human: string;
  }>;
  detectionSignals: Array<{
    source: string;
    type: string;
    count: number;
    blocked: number;
  }>;
}

export interface MonitoringHealth {
  status: string;
  uptime: number;
  services: Record<string, string>;
}

// --- Monitoring methods ---

export async function getMonitoringStats(): Promise<MonitoringStats> {
  return apiFetch<MonitoringStats>("/monitoring/stats");
}

export async function getMonitoringHealth(): Promise<MonitoringHealth> {
  return apiFetch<MonitoringHealth>("/monitoring/health");
}

// --- Proxy extended methods ---

export async function deleteProxyPool(id: string): Promise<void> {
  return apiFetch<void>(`/proxies/${id}`, {
    method: "DELETE",
  });
}

export interface Proxy {
  id: string;
  poolId: string;
  pool: string;
  protocol: string;
  geo: string;
  asn: number;
  health: number;
  latency: string;
  requests: number;
  bans: number;
}

export interface AddProxyData {
  host: string;
  port: number;
  username?: string;
  password?: string;
  country?: string;
}

export async function addProxy(poolId: string, data: AddProxyData): Promise<Proxy> {
  return apiFetch<Proxy>(`/proxies/${poolId}/proxies`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteProxy(id: string): Promise<void> {
  return apiFetch<void>(`/proxies/${id}`, {
    method: "DELETE",
  });
}

export async function testProxy(id: string): Promise<{ healthy: boolean; latencyMs: number }> {
  return apiFetch<{ healthy: boolean; latencyMs: number }>(`/proxies/${id}/test`, {
    method: "POST",
  });
}

export interface ProxyPoolDetail {
  id: string;
  name: string;
  strategy: string;
  total: number;
  healthy: number;
  degraded: number;
  banned: number;
  avgLatency: string;
  proxies: Proxy[];
  domainBans: Array<{
    proxy: string;
    domain: string;
    since: string;
    reason: string;
  }>;
}

export async function getProxyPoolDetails(): Promise<ProxyPoolDetail[]> {
  return apiFetch<ProxyPoolDetail[]>("/proxies/details");
}

// --- Notification types ---

export interface Notification {
  id: string;
  type: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
}

export interface UnreadCount {
  count: number;
}

// --- Notification methods ---

export async function getNotifications(unreadOnly?: boolean): Promise<Notification[]> {
  const params = unreadOnly ? "?unreadOnly=true" : "";
  return apiFetch<Notification[]>(`/notifications${params}`);
}

export async function markNotificationRead(id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  return apiFetch<void>("/notifications/mark-all-read", {
    method: "POST",
  });
}

export async function deleteNotification(id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${id}`, {
    method: "DELETE",
  });
}

export async function getUnreadCount(): Promise<UnreadCount> {
  return apiFetch<UnreadCount>("/notifications/unread-count");
}
