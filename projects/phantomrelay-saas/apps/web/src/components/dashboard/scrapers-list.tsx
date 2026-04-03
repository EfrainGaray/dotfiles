import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Plus, Play, Pause, Trash2, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import * as api from "@/lib/api-client";
import type { Scraper } from "@/lib/api-client";

const mockScrapers = [
  { id: "1", name: "Amazon_Price_Monitor", targetUrl: "amazon.com/dp/*", mode: "stealth", status: "active", config: {}, createdAt: "", updatedAt: "" },
  { id: "2", name: "LinkedIn_Profile_Scraper", targetUrl: "linkedin.com/in/*", mode: "human", status: "active", config: {}, createdAt: "", updatedAt: "" },
  { id: "3", name: "Google_SERP_Tracker", targetUrl: "google.com/search?q=*", mode: "http", status: "paused", config: {}, createdAt: "", updatedAt: "" },
  { id: "4", name: "Zillow_Listings", targetUrl: "zillow.com/homes/*", mode: "auto", status: "active", config: {}, createdAt: "", updatedAt: "" },
  { id: "5", name: "HackerNews_Feed", targetUrl: "news.ycombinator.com", mode: "http", status: "active", config: {}, createdAt: "", updatedAt: "" },
  { id: "6", name: "Twitter_Mentions", targetUrl: "x.com/search?q=*", mode: "stealth", status: "error", config: {}, createdAt: "", updatedAt: "" },
  { id: "7", name: "Shopify_Product_Watch", targetUrl: "myshopify.com/products/*", mode: "headless", status: "active", config: {}, createdAt: "", updatedAt: "" },
];

const modeColors: Record<string, string> = {
  http: "secondary", headless: "secondary", stealth: "default", human: "warning", auto: "info",
};

const statusColors: Record<string, string> = {
  active: "bg-success", ACTIVE: "bg-success",
  paused: "bg-warning", PAUSED: "bg-warning",
  error: "bg-destructive", ERROR: "bg-destructive",
  RUNNING: "bg-info",
};

export function ScrapersList() {
  const [scrapers, setScrapers] = useState<Scraper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadScrapers();
  }, []);

  async function loadScrapers() {
    try {
      setLoading(true);
      const result = await api.getScrapers();
      setScrapers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scrapers");
      setScrapers(mockScrapers as Scraper[]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete scraper "${name}"? This cannot be undone.`)) return;
    try {
      await api.deleteScraper(id);
      setScrapers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete scraper");
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus.toLowerCase() === "active" ? "PAUSED" : "ACTIVE";
    try {
      const updated = await api.updateScraper(id, { status: newStatus });
      setScrapers((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update scraper");
    }
  }

  // Client-side filtering
  const filtered = scrapers.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (modeFilter && s.mode.toLowerCase() !== modeFilter) return false;
    if (statusFilter && s.status.toLowerCase() !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Scrapers</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your scraping configurations</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground animate-pulse">
          Loading scrapers...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scrapers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your scraping configurations</p>
        </div>
        <a href="/dashboard/scrapers/new">
          <Button size="default">
            <Plus className="h-4 w-4" />
            New Scraper
          </Button>
        </a>
      </div>

      {error && (
        <div className="rounded-lg border border-warning bg-warning/10 p-3 text-sm text-warning">
          {error} — showing cached data
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search scrapers..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-8 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
        >
          <option value="">All modes</option>
          <option value="http">HTTP</option>
          <option value="headless">Headless</option>
          <option value="stealth">Stealth</option>
          <option value="human">Human</option>
          <option value="auto">Auto</option>
        </select>
        <select
          className="h-8 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Target</th>
              <th className="px-5 py-3 font-medium">Mode</th>
              <th className="px-5 py-3 font-medium">Updated</th>
              <th className="px-5 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3">
                  <span className={`inline-block h-2 w-2 rounded-full ${statusColors[s.status] ?? "bg-muted-foreground"}`} />
                </td>
                <td className="px-5 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{s.targetUrl}</td>
                <td className="px-5 py-3">
                  <Badge variant={modeColors[s.mode?.toLowerCase()] as any}>{s.mode}</Badge>
                </td>
                <td className="px-5 py-3 text-muted-foreground text-xs">
                  {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleToggleStatus(s.id, s.status)}
                      title={s.status.toLowerCase() === "active" ? "Pause" : "Resume"}
                    >
                      {s.status.toLowerCase() === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      className="p-1 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(s.id, s.name)}
                      title="Delete"
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

      <p className="text-xs text-muted-foreground">{filtered.length} scrapers</p>
    </div>
  );
}
