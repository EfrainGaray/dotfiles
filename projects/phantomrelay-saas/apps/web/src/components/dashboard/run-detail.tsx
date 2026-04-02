import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowLeft, RefreshCw, Download } from "lucide-react";
import { useState } from "react";

const run = {
  id: "run_a1b2c3d4",
  scraper: "Amazon_Price_Monitor",
  status: "success" as const,
  mode: "stealth",
  modeUsed: "stealth",
  latency: "3.2s",
  duration: "4.1s",
  date: "Apr 2, 2026 18:45:12",
  proxyUsed: "p1 (Residential US / New York)",
  profileUsed: "developer-01",
  signals: [] as { type: string; confidence: number; evidence: string }[],
};

const tabs = ["Result", "Screenshot", "HAR", "Signals"];

const htmlPreview = `<!DOCTYPE html>
<html>
<head><title>Amazon.com: Product</title></head>
<body>
  <div id="productTitle">
    Wireless Noise Cancelling Headphones
  </div>
  <span class="a-price-whole">149</span>
  <span class="a-price-fraction">99</span>
  <div id="availability">
    <span>In Stock</span>
  </div>
  <!-- ... 2,847 more lines -->
</body>
</html>`;

export function RunDetail() {
  const [activeTab, setActiveTab] = useState("Result");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/dashboard/runs" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </a>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{run.scraper}</h1>
            <Badge variant="success">{run.status}</Badge>
            <Badge variant="default">{run.modeUsed}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{run.date} — {run.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="default"><RefreshCw className="h-4 w-4" />Retry</Button>
          <Button variant="outline" size="default"><Download className="h-4 w-4" />Export</Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "Latency", value: run.latency },
          { label: "Duration", value: run.duration },
          { label: "Mode Used", value: run.modeUsed },
          { label: "Proxy", value: "p1 (NY)" },
          { label: "Signals", value: `${run.signals.length}` },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-0.5 text-sm font-medium">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Result" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-2.5 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">HTML Response (2,851 lines)</p>
              <Button variant="ghost" size="sm"><Download className="h-3.5 w-3.5" />Download</Button>
            </div>
            <pre className="overflow-x-auto p-4 text-xs font-mono text-foreground leading-relaxed max-h-96 overflow-y-auto">
              {htmlPreview}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Extracted Text</p>
            <p className="text-sm text-foreground">
              Wireless Noise Cancelling Headphones — $149.99 — In Stock
            </p>
          </div>
        </div>
      )}

      {activeTab === "Screenshot" && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex aspect-video items-center justify-center rounded-md bg-muted">
            <p className="text-sm text-muted-foreground">Screenshot preview (base64 PNG)</p>
          </div>
        </div>
      )}

      {activeTab === "HAR" && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">HTTP Archive 1.2 — 23 entries</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Method</th>
                  <th className="px-4 py-2 font-medium">URL</th>
                  <th className="px-4 py-2 font-medium">Time</th>
                  <th className="px-4 py-2 font-medium">Size</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { status: 200, method: "GET", url: "amazon.com/dp/B0...", time: "1.2s", size: "145 KB" },
                  { status: 200, method: "GET", url: "images-na.ssl-images-amazon.com/...", time: "0.3s", size: "52 KB" },
                  { status: 200, method: "GET", url: "fls-na.amazon.com/...", time: "0.1s", size: "2 KB" },
                  { status: 200, method: "POST", url: "unagi.amazon.com/...", time: "0.2s", size: "1 KB" },
                  { status: 304, method: "GET", url: "m.media-amazon.com/...", time: "0.05s", size: "0 B" },
                ].map((entry, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">
                      <Badge variant={entry.status < 300 ? "success" : "secondary"}>{entry.status}</Badge>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{entry.method}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground truncate max-w-[200px]">{entry.url}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{entry.time}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{entry.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Signals" && (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-success font-medium">No detection signals</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The scraper completed without triggering any anti-bot detection.
          </p>
        </div>
      )}

      {/* Right metadata */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Run Details</h3>
        <div className="space-y-2 text-sm">
          {[
            ["Task ID", run.id],
            ["Status", run.status],
            ["Mode Requested", run.mode],
            ["Mode Used", run.modeUsed],
            ["Proxy Used", run.proxyUsed],
            ["Profile Used", run.profileUsed],
            ["Latency", run.latency],
            ["Total Duration", run.duration],
            ["Date", run.date],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground text-xs font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
