import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Plus, RefreshCw, Trash2, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import * as api from "@/lib/api-client";
import type { ProxyPoolDetail } from "@/lib/api-client";

const mockPools: ProxyPoolDetail[] = [
  {
    id: "pool1", name: "Residential US", strategy: "best-score", total: 50, healthy: 47, degraded: 2, banned: 1, avgLatency: "245ms",
    proxies: [
      { id: "p1", poolId: "pool1", pool: "Residential US", protocol: "https", geo: "US / New York", asn: 7922, health: 95, latency: "180ms", requests: 1247, bans: 0 },
      { id: "p2", poolId: "pool1", pool: "Residential US", protocol: "socks5", geo: "US / Chicago", asn: 20115, health: 88, latency: "220ms", requests: 892, bans: 1 },
      { id: "p6", poolId: "pool1", pool: "Residential US", protocol: "https", geo: "US / Miami", asn: 33363, health: 12, latency: "\u2014", requests: 89, bans: 5 },
    ],
    domainBans: [
      { proxy: "p2", domain: "linkedin.com", since: "2 days ago", reason: "403 blocked" },
      { proxy: "p6", domain: "*", since: "3 hrs ago", reason: "Connection timeout (all)" },
    ],
  },
  {
    id: "pool2", name: "Datacenter EU", strategy: "round-robin", total: 30, healthy: 28, degraded: 1, banned: 1, avgLatency: "89ms",
    proxies: [
      { id: "p3", poolId: "pool2", pool: "Datacenter EU", protocol: "https", geo: "DE / Frankfurt", asn: 24940, health: 97, latency: "65ms", requests: 2103, bans: 0 },
      { id: "p4", poolId: "pool2", pool: "Datacenter EU", protocol: "https", geo: "NL / Amsterdam", asn: 60781, health: 42, latency: "340ms", requests: 567, bans: 3 },
    ],
    domainBans: [
      { proxy: "p4", domain: "amazon.com", since: "1 day ago", reason: "CAPTCHA loop" },
      { proxy: "p4", domain: "google.com", since: "6 hrs ago", reason: "Rate limited" },
    ],
  },
  {
    id: "pool3", name: "Mobile Mix", strategy: "least-used", total: 15, healthy: 14, degraded: 1, banned: 0, avgLatency: "412ms",
    proxies: [
      { id: "p5", poolId: "pool3", pool: "Mobile Mix", protocol: "http", geo: "US / Los Angeles", asn: 21928, health: 91, latency: "380ms", requests: 234, bans: 0 },
    ],
    domainBans: [],
  },
];

function HealthBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-success" : score >= 40 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono">{score}</span>
    </div>
  );
}

export function ProxiesPage() {
  const [pools, setPools] = useState<ProxyPoolDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingProxy, setTestingProxy] = useState<string | null>(null);

  useEffect(() => {
    loadPools();
  }, []);

  async function loadPools() {
    try {
      setLoading(true);
      const result = await api.getProxyPoolDetails();
      setPools(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load proxy pools");
      setPools(mockPools);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPool() {
    const name = prompt("Pool name:");
    if (!name) return;
    const strategy = prompt("Strategy (round-robin, best-score, least-used):", "round-robin");
    if (!strategy) return;
    try {
      await api.createProxyPool({ name, strategy, proxies: [] });
      await loadPools();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create pool");
    }
  }

  async function handleDeletePool(id: string, name: string) {
    if (!confirm(`Delete pool "${name}"? This cannot be undone.`)) return;
    try {
      await api.deleteProxyPool(id);
      setPools((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete pool");
    }
  }

  async function handleDeleteProxy(proxyId: string) {
    if (!confirm("Delete this proxy?")) return;
    try {
      await api.deleteProxy(proxyId);
      setPools((prev) =>
        prev.map((pool) => ({
          ...pool,
          proxies: pool.proxies.filter((p) => p.id !== proxyId),
        }))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete proxy");
    }
  }

  async function handleTestProxy(proxyId: string) {
    setTestingProxy(proxyId);
    try {
      const result = await api.testProxy(proxyId);
      alert(`Proxy ${proxyId}: ${result.healthy ? "Healthy" : "Unhealthy"} (${result.latencyMs}ms)`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTestingProxy(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Proxies</h1>
            <p className="mt-1 text-sm text-muted-foreground">Proxy pool management with EMA health scoring</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground animate-pulse">
          Loading proxy pools...
        </div>
      </div>
    );
  }

  const allProxies = pools.flatMap((pool) => pool.proxies);
  const allDomainBans = pools.flatMap((pool) => pool.domainBans);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proxies</h1>
          <p className="mt-1 text-sm text-muted-foreground">Proxy pool management with EMA health scoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="default" onClick={loadPools}><RefreshCw className="h-4 w-4" />Health Check</Button>
          <Button size="default" onClick={handleAddPool}><Plus className="h-4 w-4" />Add Pool</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-warning bg-warning/10 p-3 text-sm text-warning">
          {error} — showing cached data
        </div>
      )}

      {/* Pool Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {pools.map((pool) => (
          <div key={pool.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{pool.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{pool.strategy}</Badge>
                <button
                  className="p-1 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeletePool(pool.id, pool.name)}
                  title="Delete pool"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
              <div><span className="text-muted-foreground">Total:</span> <span className="font-medium">{pool.total}</span></div>
              <div><span className="text-muted-foreground">Healthy:</span> <span className="font-medium text-success">{pool.healthy}</span></div>
              <div><span className="text-muted-foreground">Degraded:</span> <span className="font-medium text-warning">{pool.degraded}</span></div>
              <div><span className="text-muted-foreground">Banned:</span> <span className="font-medium text-destructive">{pool.banned}</span></div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-success" style={{ width: `${pool.total > 0 ? (pool.healthy / pool.total) * 100 : 0}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Avg latency: {pool.avgLatency}</p>
          </div>
        ))}
      </div>

      {/* Proxy Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <div className="border-b border-border px-5 py-3">
          <p className="text-sm font-medium text-foreground">All Proxies</p>
        </div>
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">ID</th>
              <th className="px-5 py-2.5 font-medium">Pool</th>
              <th className="px-5 py-2.5 font-medium">Protocol</th>
              <th className="px-5 py-2.5 font-medium">Geo</th>
              <th className="px-5 py-2.5 font-medium">ASN</th>
              <th className="px-5 py-2.5 font-medium">Health (EMA)</th>
              <th className="px-5 py-2.5 font-medium">Latency</th>
              <th className="px-5 py-2.5 font-medium">Requests</th>
              <th className="px-5 py-2.5 font-medium">Bans</th>
              <th className="px-5 py-2.5 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {allProxies.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{p.id}</td>
                <td className="px-5 py-2.5 text-foreground">{p.pool}</td>
                <td className="px-5 py-2.5"><Badge variant="secondary">{p.protocol}</Badge></td>
                <td className="px-5 py-2.5 text-muted-foreground text-xs">{p.geo}</td>
                <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{p.asn}</td>
                <td className="px-5 py-2.5"><HealthBar score={p.health} /></td>
                <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{p.latency}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{p.requests.toLocaleString()}</td>
                <td className="px-5 py-2.5">{p.bans > 0 ? <span className="text-destructive">{p.bans}</span> : "0"}</td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      onClick={() => handleTestProxy(p.id)}
                      disabled={testingProxy === p.id}
                      title="Test proxy"
                    >
                      <Zap className={`h-3.5 w-3.5 ${testingProxy === p.id ? "animate-pulse" : ""}`} />
                    </button>
                    <button
                      className="p-1 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteProxy(p.id)}
                      title="Delete proxy"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Domain Bans */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <div className="border-b border-border px-5 py-3">
          <p className="text-sm font-medium text-foreground">Domain Bans</p>
        </div>
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Proxy</th>
              <th className="px-5 py-2.5 font-medium">Domain</th>
              <th className="px-5 py-2.5 font-medium">Reason</th>
              <th className="px-5 py-2.5 font-medium">Since</th>
            </tr>
          </thead>
          <tbody>
            {allDomainBans.map((ban, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-5 py-2.5 font-mono text-xs">{ban.proxy}</td>
                <td className="px-5 py-2.5 font-medium text-foreground">{ban.domain}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{ban.reason}</td>
                <td className="px-5 py-2.5 text-muted-foreground text-xs">{ban.since}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
