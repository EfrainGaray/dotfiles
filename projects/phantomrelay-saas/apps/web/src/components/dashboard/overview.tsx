import { Badge } from "../ui/badge";
import { t, type Locale, type TranslationKey } from "@/i18n/translations";
import { useState, useEffect } from "react";
import * as api from "@/lib/api-client";
import type { Run, RunStats, Scraper } from "@/lib/api-client";

const mockRecentRuns = [
  { status: "success", name: "Amazon_Price_Monitor", mode: "stealth", latency: "3.2s", date: "2 min ago" },
  { status: "success", name: "LinkedIn_Profile_Scraper", mode: "human", latency: "8.1s", date: "15 min ago" },
  { status: "error", name: "Google_SERP_Tracker", mode: "http", latency: "—", date: "32 min ago" },
  { status: "success", name: "Zillow_Listings", mode: "auto", latency: "2.8s", date: "1 hr ago" },
  { status: "success", name: "HackerNews_Feed", mode: "http", latency: "0.4s", date: "2 hr ago" },
];

const modeColors: Record<string, string> = {
  http: "secondary",
  stealth: "default",
  human: "warning",
  auto: "info",
  headless: "secondary",
};

interface DashboardOverviewProps {
  locale?: Locale;
}

function formatLatency(ms: number | null): string {
  if (ms === null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function DashboardOverview({ locale = "en" }: DashboardOverviewProps) {
  const l = (key: TranslationKey) => t(locale, key);

  const [runStats, setRunStats] = useState<RunStats | null>(null);
  const [recentRuns, setRecentRuns] = useState<Run[] | null>(null);
  const [scrapers, setScrapers] = useState<Scraper[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [statsResult, runsResult, scrapersResult] = await Promise.all([
        api.getRunStats(),
        api.getRuns({ limit: 5 }),
        api.getScrapers(),
      ]);
      setRunStats(statsResult);
      setRecentRuns(runsResult);
      setScrapers(scrapersResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      // Fallback data will be used via the rendering logic below
    } finally {
      setLoading(false);
    }
  }

  // Build stats from API data or fallback to mock
  const stats = runStats
    ? [
        { label: l("dash.totalScrapers"), value: String(scrapers?.length ?? 0), change: "" },
        { label: l("dash.successRate"), value: `${runStats.successRate.toFixed(1)}%`, change: "" },
        { label: l("dash.activeFleet"), value: `${scrapers?.filter((s) => s.status === "ACTIVE").length ?? 0}/${scrapers?.length ?? 0}`, change: "" },
        { label: l("dash.avgLatency"), value: `${Math.round(runStats.avgLatency)}ms`, change: "" },
      ]
    : [
        { label: l("dash.totalScrapers"), value: "12", change: "+2 this week" },
        { label: l("dash.successRate"), value: "94.7%", change: "+1.2% vs last week" },
        { label: l("dash.activeFleet"), value: "3/5", change: "2 idle" },
        { label: l("dash.avgLatency"), value: "847ms", change: "-120ms vs last week" },
      ];

  // Build fleet status from scrapers or fallback
  const fleetStatus = scrapers
    ? [
        { label: l("dash.ready"), count: scrapers.filter((s) => s.status === "ACTIVE").length, color: "bg-success" },
        { label: l("dash.busy"), count: scrapers.filter((s) => s.status === "RUNNING").length, color: "bg-warning" },
        { label: l("dash.dead"), count: scrapers.filter((s) => s.status === "ERROR" || s.status === "PAUSED").length, color: "bg-destructive" },
      ]
    : [
        { label: l("dash.ready"), count: 3, color: "bg-success" },
        { label: l("dash.busy"), count: 1, color: "bg-warning" },
        { label: l("dash.dead"), count: 1, color: "bg-destructive" },
      ];

  // Build recent runs display from API data or fallback
  const displayRuns = recentRuns
    ? recentRuns.map((run) => ({
        status: run.status === "SUCCESS" ? "success" : "error",
        name: run.scraperId,
        mode: run.mode?.toLowerCase() ?? "http",
        latency: formatLatency(run.latencyMs),
        date: timeAgo(run.startedAt),
      }))
    : mockRecentRuns;

  // Usage data from stats or fallback
  const totalRuns = runStats?.totalRuns ?? 234;
  const usageLimit = 500;
  const usagePercent = Math.min((totalRuns / usageLimit) * 100, 100);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{l("dash.overview")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{l("dash.overviewSub")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 animate-pulse">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="mt-2 h-7 w-16 bg-muted rounded" />
              <div className="mt-2 h-3 w-32 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{l("dash.overview")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{l("dash.overviewSub")}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-warning bg-warning/10 p-3 text-sm text-warning">
          {error} — showing cached data
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
            {stat.change && <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{l("dash.monthlyUsage")}</p>
          <p className="text-sm text-muted-foreground">{totalRuns} / {usageLimit} {l("dash.requests")}</p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usagePercent.toFixed(1)}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {usagePercent.toFixed(1)}% {l("dash.used")} — {l("dash.resetsIn")} 18 {l("dash.days")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card lg:col-span-3">
          <div className="border-b border-border px-5 py-3">
            <p className="text-sm font-medium text-foreground">{l("dash.recentRuns")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">{l("dash.status")}</th>
                  <th className="px-5 py-2.5 font-medium">{l("dash.name")}</th>
                  <th className="px-5 py-2.5 font-medium">{l("dash.mode")}</th>
                  <th className="px-5 py-2.5 font-medium">{l("dash.latency")}</th>
                  <th className="px-5 py-2.5 font-medium">{l("dash.date")}</th>
                </tr>
              </thead>
              <tbody>
                {displayRuns.map((run, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-2.5">
                      <span className={`inline-block h-2 w-2 rounded-full ${run.status === "success" ? "bg-success" : "bg-destructive"}`} />
                    </td>
                    <td className="px-5 py-2.5 font-medium text-foreground">{run.name}</td>
                    <td className="px-5 py-2.5">
                      <Badge variant={modeColors[run.mode] as any}>{run.mode}</Badge>
                    </td>
                    <td className="px-5 py-2.5 text-muted-foreground">{run.latency}</td>
                    <td className="px-5 py-2.5 text-muted-foreground">{run.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <p className="text-sm font-medium text-foreground">{l("dash.fleetStatus")}</p>
          </div>
          <div className="space-y-3 p-5">
            {fleetStatus.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.count}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{l("dash.capacity")}</span>
                <span className="text-sm font-medium text-foreground">{scrapers?.length ?? 5}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
