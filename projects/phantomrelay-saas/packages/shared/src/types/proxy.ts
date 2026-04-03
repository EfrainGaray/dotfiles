export enum ProxyProtocol {
  HTTP = "http",
  HTTPS = "https",
  SOCKS5 = "socks5",
}

export interface Proxy {
  id: string;
  poolId: string;
  url: string;
  protocol: ProxyProtocol;
  healthScore: number;
  lastCheckedAt: string | null;
  failCount: number;
}

export interface ProxyPool {
  id: string;
  name: string;
  description: string | null;
  proxies: Proxy[];
  createdAt: string;
}
