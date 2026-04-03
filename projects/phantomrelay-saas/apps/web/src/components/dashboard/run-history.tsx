import { Badge } from "../ui/badge";
import { Search, Download } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import * as api from "@/lib/api-client";
import type { Run, RunStats } from "@/lib/api-client";

const mockRuns = [
  { id: "r1", scraper: "Amazon_Price_Monitor", status: "success", mode: "stealth", latency: "3.2s", signals: 0, date: "Apr 2, 2026 18:45", duration: "4.1s" },
  { id: "r2", scraper: "LinkedIn_Profile_Scraper", status: "success", mode: "human", latency: "8.1s", signals: 1, date: "Apr 2, 2026 18:30", duration: "12.4s" },
  { id: "r3", scraper: "Google_SERP_Tracker", status: "blocked", mode: "http", latency: "—", signals: 3, date: "Apr 2, 2026 18:13", duration: "1.2s" },
  { id: "r4", scraper: "Google_SERP_Tracker", status: "success", mode: "stealth", latency: "2.1s", signals: 0, date: "Apr 2, 2026 18:13", duration: "5.8s" },
  { id: "r5", scraper: "Zillow_Listings", status: "success", mode: "auto", latency: "2.8s", signals: 0, date: "Apr 2, 2026 17:00", duration: "3.9s" },
  { id: "r6", scraper: "HackerNews_Feed", status: "success", mode: "http", latency: "0.4s", signals: 0, date: "Apr 2, 2026 16:30", duration: "0.6s" },
  { id: "r7", scraper: "Twitter_Mentions", status: "captcha", mode: "stealth", latency: "—", signals: 2, date: "Apr 2, 2026 14:00", duration: "15.2s" },
  { id: "r8", scraper: "Amazon_Price_Monitor", status: "success", mode: "stealth", latency: "2.9s", signals: 0, date: "Apr 2, 2026 12:45", duration: "3.7s" },
  { id: "r9", scraper: "Shopify_Product_Watch", status: "success", mode: "headless", latency: "1.2s", signals: 0, date: "Apr 2, 2026 06:00", duration: "2.1s" },
  { id: "r10", scraper: "LinkedIn_Profile_Scraper", status: "timeout", mode: "human", latency: "—", signals: 0, date: "Apr 1, 2026 09:00", duration: "30.0s" },
];

const mockStats = [
  { label: "Total Runs", value: "1,247" },
  { label: "Success Rate", value: "94.2%" },
  { label: "Avg Latency", value: "892ms" },
  { label: "Blocked", value: "72" },
];

const statusBadge: Record<string, string> = {
  success: "success", SUCCESS: "success",
  blocked: "destructive", BLOCKED: "destructive",
  captcha: "warning", CAPTCHA: "warning",
  error: "destructive", ERROR: "destructive",
  timeout: "secondary", TIMEOUT: "secondary",
  RUNNING: "info",
};

const modeColors: Record<string, string> = {
  http: "secondary", headless: "secondary", stealth: "default", human: "warning", auto: "info",
};

const PAGE_SIZE = 20;

function formatLatency(ms: number | null): string {
  if (ms === null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function formatDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return "—";
  const diff = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  return diff >= 1000 ? `${(diff / 1000).toFixed(1)}s` : `${diff}ms`;
}

export function RunHistory() {
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [runStats, setRunStats] = useState<RunStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const [runsResult, statsResult] = await Promise.all([
        api.getRuns({
          limit: PAGE_SIZE,
          page,
          status: statusFilter || undefined,
        }),
        api.getRunStats(),
      ]);
      setRuns(runsResult);
      setRunStats(statsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load run history");
    } finally {
      setLoading(false);
    }
  }

  // Stats cards from API or fallback
  const statsDisplay = runStats
    ? [
        { label: "Total Runs", value: runStats.totalRuns.toLocaleString() },
        { label: "Success Rate", value: `${runStats.successRate.toFixed(1)}%` },
        { label: "Avg Latency", value: `${Math.round(runStats.avgLatency)}ms` },
        { label: "By Mode", value: Object.keys(runStats.runsByMode).length.toString() },
      ]
    : mockStats;

  // Build display rows from API runs or fallback mock
  const displayRuns = runs
    ? runs.map((run) => ({
        id: run.id,
        scraper: run.scraperId,
        status: run.status.toLowerCase(),
        mode: run.mode?.toLowerCase() ?? "http",
        latency: formatLatency(run.latencyMs),
        signals: 0,
        date: new Date(run.startedAt).toLocaleString(),
        duration: formatDuration(run.startedAt, run.finishedAt),
      }))
    : mockRuns;

  // Client-side filter for mode and search (status is sent to API)
  const filtered = displayRuns.filter((r) => {
    if (modeFilter && r.mode !== modeFilter) return false;
    if (searchQuery && !r.scraper.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading && !runs) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Run History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse and inspect past scraping runs</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="mt-2 h-6 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Run History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse and inspect past scraping runs</p>
        </div>
        <Button variant="outline" size="default">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-warning bg-warning/10 p-3 text-sm text-warning">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statsDisplay.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by scraper name..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-8 rounded-md border border-input bg-transparent px-3 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="SUCCESS">success</option>
          <option value="BLOCKED">blocked</option>
          <option value="CAPTCHA">captcha</option>
          <option value="TIMEOUT">timeout</option>
          <option value="ERROR">error</option>
        </select>
        <select
          className="h-8 rounded-md border border-input bg-transparent px-3 text-sm"
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
        >
          <option value="">All modes</option>
          <option value="http">http</option>
          <option value="headless">headless</option>
          <option value="stealth">stealth</option>
          <option value="human">human</option>
          <option value="auto">auto</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Scraper</th>
              <th className="px-5 py-3 font-medium">Mode</th>
              <th className="px-5 py-3 font-medium">Latency</th>
              <th className="px-5 py-3 font-medium">Duration</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((run) => (
              <tr key={run.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer">
                <td className="px-5 py-3">
                  <Badge variant={statusBadge[run.status] as any ?? "secondary"}>{run.status}</Badge>
                </td>
                <td className="px-5 py-3 font-medium text-foreground">{run.scraper}</td>
                <td className="px-5 py-3">
                  <Badge variant={modeColors[run.mode] as any}>{run.mode}</Badge>
                </td>
                <td className="px-5 py-3 text-muted-foreground font-mono">{run.latency}</td>
                <td className="px-5 py-3 text-muted-foreground font-mono">{run.duration}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{run.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Page {page}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={filtered.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
