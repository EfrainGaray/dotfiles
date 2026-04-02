import { Badge } from "../ui/badge";

const fleet = [
  { id: "s1", status: "ready", mode: "stealth", profile: "developer-01", uptime: "2h 14m", requests: 47, port: 9222 },
  { id: "s2", status: "busy", mode: "human", profile: "shopper-03", uptime: "45m", requests: 12, port: 9223 },
  { id: "s3", status: "ready", mode: "headless", profile: "—", uptime: "1h 30m", requests: 83, port: 9224 },
  { id: "s4", status: "dead", mode: "stealth", profile: "student-02", uptime: "—", requests: 0, port: 9225 },
  { id: "s5", status: "ready", mode: "http", profile: "—", uptime: "3h 02m", requests: 156, port: 9226 },
];

const latencyData = [
  { label: "p50", http: "12ms", headless: "340ms", stealth: "3.1s", human: "8.4s" },
  { label: "p95", http: "38ms", headless: "1.2s", stealth: "8.7s", human: "18.2s" },
  { label: "p99", http: "48ms", headless: "1.9s", stealth: "14.1s", human: "27.5s" },
];

const detectionSignals = [
  { source: "Cloudflare", type: "JS Challenge", count: 12, blocked: 2 },
  { source: "DataDome", type: "Captcha", count: 5, blocked: 1 },
  { source: "PerimeterX", type: "Block Page", count: 3, blocked: 3 },
  { source: "Imperva", type: "Rate Limit", count: 8, blocked: 0 },
  { source: "reCAPTCHA", type: "v3 Score", count: 4, blocked: 0 },
];

const statusColors: Record<string, string> = {
  ready: "bg-success", busy: "bg-warning", starting: "bg-chart-1", draining: "bg-muted-foreground", dead: "bg-destructive",
};

export function MonitoringDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Monitoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fleet health, latency, and detection signals</p>
      </div>

      {/* Fleet Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "Ready", count: 3, color: "text-success" },
          { label: "Busy", count: 1, color: "text-warning" },
          { label: "Dead", count: 1, color: "text-destructive" },
          { label: "Capacity", count: 5, color: "text-foreground" },
          { label: "Utilization", count: "80%", color: "text-foreground" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4 text-center">
            <p className={`text-2xl font-semibold ${c.color}`}>{c.count}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Fleet Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <div className="border-b border-border px-5 py-3">
          <p className="text-sm font-medium text-foreground">Fleet Instances</p>
        </div>
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Session</th>
              <th className="px-5 py-2.5 font-medium">Mode</th>
              <th className="px-5 py-2.5 font-medium">Profile</th>
              <th className="px-5 py-2.5 font-medium">CDP Port</th>
              <th className="px-5 py-2.5 font-medium">Uptime</th>
              <th className="px-5 py-2.5 font-medium">Requests</th>
            </tr>
          </thead>
          <tbody>
            {fleet.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusColors[s.status]}`} />
                    <span className="text-xs">{s.status}</span>
                  </div>
                </td>
                <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{s.id}</td>
                <td className="px-5 py-2.5"><Badge variant="secondary">{s.mode}</Badge></td>
                <td className="px-5 py-2.5 text-muted-foreground text-xs">{s.profile}</td>
                <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{s.port}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{s.uptime}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{s.requests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Latency Percentiles */}
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <div className="border-b border-border px-5 py-3">
            <p className="text-sm font-medium text-foreground">Latency Percentiles</p>
          </div>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Percentile</th>
                <th className="px-5 py-2.5 font-medium">HTTP</th>
                <th className="px-5 py-2.5 font-medium">Headless</th>
                <th className="px-5 py-2.5 font-medium">Stealth</th>
                <th className="px-5 py-2.5 font-medium">Human</th>
              </tr>
            </thead>
            <tbody>
              {latencyData.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <td className="px-5 py-2.5 font-medium text-foreground">{row.label}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{row.http}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{row.headless}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{row.stealth}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{row.human}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detection Signals */}
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <div className="border-b border-border px-5 py-3">
            <p className="text-sm font-medium text-foreground">Detection Signals (24h)</p>
          </div>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Source</th>
                <th className="px-5 py-2.5 font-medium">Type</th>
                <th className="px-5 py-2.5 font-medium">Detected</th>
                <th className="px-5 py-2.5 font-medium">Blocked</th>
              </tr>
            </thead>
            <tbody>
              {detectionSignals.map((sig) => (
                <tr key={sig.source} className="border-b border-border last:border-0">
                  <td className="px-5 py-2.5 font-medium text-foreground">{sig.source}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{sig.type}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{sig.count}</td>
                  <td className="px-5 py-2.5">
                    {sig.blocked > 0 ? <span className="text-destructive">{sig.blocked}</span> : <span className="text-muted-foreground">0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
