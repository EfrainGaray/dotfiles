import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Plus, Play, Pause, Trash2, MoreHorizontal, Search } from "lucide-react";
import { Input } from "../ui/input";

const scrapers = [
  { id: "1", name: "Amazon_Price_Monitor", url: "amazon.com/dp/*", mode: "stealth", status: "active", schedule: "Every 6h", lastRun: "2 min ago", successRate: "98.2%" },
  { id: "2", name: "LinkedIn_Profile_Scraper", url: "linkedin.com/in/*", mode: "human", status: "active", schedule: "Daily 9am", lastRun: "15 min ago", successRate: "91.5%" },
  { id: "3", name: "Google_SERP_Tracker", url: "google.com/search?q=*", mode: "http", status: "paused", schedule: "Every 1h", lastRun: "32 min ago", successRate: "87.3%" },
  { id: "4", name: "Zillow_Listings", url: "zillow.com/homes/*", mode: "auto", status: "active", schedule: "Every 12h", lastRun: "1 hr ago", successRate: "95.1%" },
  { id: "5", name: "HackerNews_Feed", url: "news.ycombinator.com", mode: "http", status: "active", schedule: "Every 30m", lastRun: "2 hr ago", successRate: "99.8%" },
  { id: "6", name: "Twitter_Mentions", url: "x.com/search?q=*", mode: "stealth", status: "error", schedule: "Every 2h", lastRun: "5 hr ago", successRate: "72.4%" },
  { id: "7", name: "Shopify_Product_Watch", url: "myshopify.com/products/*", mode: "headless", status: "active", schedule: "Daily 6am", lastRun: "8 hr ago", successRate: "96.7%" },
];

const modeColors: Record<string, string> = {
  http: "secondary", headless: "secondary", stealth: "default", human: "warning", auto: "info",
};

const statusColors: Record<string, string> = {
  active: "bg-success", paused: "bg-warning", error: "bg-destructive",
};

export function ScrapersList() {
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

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search scrapers..." className="pl-9" />
        </div>
        <select className="h-8 rounded-md border border-input bg-transparent px-3 text-sm text-foreground">
          <option value="">All modes</option>
          <option value="http">HTTP</option>
          <option value="headless">Headless</option>
          <option value="stealth">Stealth</option>
          <option value="human">Human</option>
          <option value="auto">Auto</option>
        </select>
        <select className="h-8 rounded-md border border-input bg-transparent px-3 text-sm text-foreground">
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
              <th className="px-5 py-3 font-medium">Schedule</th>
              <th className="px-5 py-3 font-medium">Last Run</th>
              <th className="px-5 py-3 font-medium">Success</th>
              <th className="px-5 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {scrapers.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3">
                  <span className={`inline-block h-2 w-2 rounded-full ${statusColors[s.status]}`} />
                </td>
                <td className="px-5 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{s.url}</td>
                <td className="px-5 py-3">
                  <Badge variant={modeColors[s.mode] as any}>{s.mode}</Badge>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{s.schedule}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.lastRun}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.successRate}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      {s.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                    <button className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">{scrapers.length} scrapers — 3 / 25 limit (Pro plan)</p>
    </div>
  );
}
