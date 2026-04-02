import { Badge } from "../ui/badge";
import { Search, Filter, Download } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const runs = [
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

const statusDot: Record<string, string> = {
  success: "bg-success", blocked: "bg-destructive", captcha: "bg-warning", error: "bg-destructive", timeout: "bg-muted-foreground",
};

const statusBadge: Record<string, string> = {
  success: "success", blocked: "destructive", captcha: "warning", error: "destructive", timeout: "secondary",
};

const modeColors: Record<string, string> = {
  http: "secondary", headless: "secondary", stealth: "default", human: "warning", auto: "info",
};

export function RunHistory() {
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Runs", value: "1,247" },
          { label: "Success Rate", value: "94.2%" },
          { label: "Avg Latency", value: "892ms" },
          { label: "Blocked", value: "72" },
        ].map((s) => (
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
          <Input placeholder="Search by scraper name..." className="pl-9" />
        </div>
        <select className="h-8 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">All statuses</option>
          <option>success</option>
          <option>blocked</option>
          <option>captcha</option>
          <option>timeout</option>
          <option>error</option>
        </select>
        <select className="h-8 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">All modes</option>
          <option>http</option>
          <option>headless</option>
          <option>stealth</option>
          <option>human</option>
          <option>auto</option>
        </select>
        <Input type="date" className="w-36" />
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
              <th className="px-5 py-3 font-medium">Signals</th>
              <th className="px-5 py-3 font-medium">Duration</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer">
                <td className="px-5 py-3">
                  <Badge variant={statusBadge[run.status] as any}>{run.status}</Badge>
                </td>
                <td className="px-5 py-3 font-medium text-foreground">{run.scraper}</td>
                <td className="px-5 py-3">
                  <Badge variant={modeColors[run.mode] as any}>{run.mode}</Badge>
                </td>
                <td className="px-5 py-3 text-muted-foreground font-mono">{run.latency}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {run.signals > 0 ? <span className="text-warning">{run.signals}</span> : "0"}
                </td>
                <td className="px-5 py-3 text-muted-foreground font-mono">{run.duration}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{run.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
