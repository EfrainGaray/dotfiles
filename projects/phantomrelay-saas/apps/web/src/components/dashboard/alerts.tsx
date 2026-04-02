import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Bell, Check, AlertTriangle, XCircle, Info, CheckCircle } from "lucide-react";

const alerts = [
  { id: "a1", type: "error", title: "Scraper Twitter_Mentions failed 3 consecutive times", detail: "PerimeterX block page detected. Mode: stealth. Consider upgrading to human mode.", time: "3 hrs ago", read: false },
  { id: "a2", type: "warning", title: "Proxy p6 health dropped below 20", detail: "Residential US proxy in Miami. 5 domain bans, connection timeouts. Auto-removed from rotation.", time: "3 hrs ago", read: false },
  { id: "a3", type: "warning", title: "Usage at 80% of monthly quota", detail: "234 / 500 requests used. 18 days remaining. Consider upgrading to Pro for 10,000 requests/month.", time: "6 hrs ago", read: false },
  { id: "a4", type: "info", title: "Fleet instance s4 marked as dead", detail: "Chrome process exited unexpectedly (pid 42891). Port 9225 freed. A new instance will be spawned on next request.", time: "8 hrs ago", read: true },
  { id: "a5", type: "success", title: "Scraper Google_SERP_Tracker recovered", detail: "Auto-escalated from http to stealth. Cloudflare JS challenge bypassed successfully.", time: "12 hrs ago", read: true },
  { id: "a6", type: "warning", title: "DataDome CAPTCHA detected on LinkedIn", detail: "Scraper LinkedIn_Profile_Scraper encountered DataDome CAPTCHA. Solved via 2captcha in 8.2s.", time: "1 day ago", read: true },
  { id: "a7", type: "info", title: "Profile student-02 health restored to 85", detail: "After 3 successful runs, profile health recovered from 45 to 85.", time: "1 day ago", read: true },
  { id: "a8", type: "success", title: "Scheduled maintenance completed", detail: "All aged profiles refreshed. 6 profiles updated with new browsing history.", time: "2 days ago", read: true },
];

const iconMap: Record<string, typeof AlertTriangle> = {
  error: XCircle, warning: AlertTriangle, info: Info, success: CheckCircle,
};

const colorMap: Record<string, string> = {
  error: "text-destructive", warning: "text-warning", info: "text-primary", success: "text-success",
};

export function AlertsPage() {
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unread} unread notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="default"><Check className="h-4 w-4" />Mark all read</Button>
          <Button variant="outline" size="default"><Bell className="h-4 w-4" />Rules</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {["All", "Errors", "Warnings", "Info"].map((tab, i) => (
          <button key={tab} className={`px-3 py-2 text-sm transition-colors ${i === 0 ? "border-b-2 border-primary font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Alert Feed */}
      <div className="space-y-2">
        {alerts.map((alert) => {
          const Icon = iconMap[alert.type];
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30 ${!alert.read ? "bg-muted/20" : ""}`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${colorMap[alert.type]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${!alert.read ? "font-medium text-foreground" : "text-foreground"}`}>{alert.title}</p>
                  {!alert.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{alert.detail}</p>
                <p className="mt-2 text-xs text-muted-foreground">{alert.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
