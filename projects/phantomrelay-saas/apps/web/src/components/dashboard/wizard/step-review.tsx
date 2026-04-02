import { Badge } from "../../ui/badge";
import type { WizardData } from "./wizard";

interface Props {
  data: WizardData;
}

export function StepReview({ data }: Props) {
  const sections = [
    {
      title: "Target",
      items: [
        { label: "Name", value: data.name || "—" },
        { label: "URL", value: data.url || "—", mono: true },
        { label: "Engine", value: data.engine },
        { label: "Wait For", value: data.waitFor },
      ],
    },
    {
      title: "Evasion",
      items: [
        { label: "Mode", value: data.mode, badge: true },
        { label: "Proxy Pool", value: data.proxyPool || "None" },
        { label: "CAPTCHA Solve", value: data.captchaSolve ? "Enabled" : "Disabled" },
        { label: "Profile", value: data.profileId || "Auto-assign" },
      ],
    },
    {
      title: "Actions",
      items: [
        { label: "Count", value: `${data.actions.length} action${data.actions.length !== 1 ? "s" : ""}` },
        ...data.actions.map((a, i) => ({
          label: `#${i + 1}`,
          value: `${a.type}${a.selector ? ` → ${a.selector}` : ""}${a.value ? ` = "${a.value}"` : ""}`,
          mono: true,
        })),
      ],
    },
    {
      title: "Extraction",
      items: [
        { label: "HTML", value: data.extractHtml ? "Yes" : "No" },
        { label: "Text", value: data.extractText ? "Yes" : "No" },
        { label: "Screenshot", value: data.extractScreenshot ? "Yes" : "No" },
        { label: "HAR", value: data.extractHar ? "Yes" : "No" },
        { label: "Selectors", value: data.selectors.length > 0 ? `${data.selectors.length} configured` : "None" },
      ],
    },
    {
      title: "Schedule",
      items: [
        { label: "Type", value: data.scheduleType === "once" ? "Run Once" : data.scheduleType === "cron" ? "Cron" : "Interval" },
        ...(data.scheduleType === "cron" ? [{ label: "Expression", value: data.cron || "—", mono: true }] : []),
        ...(data.scheduleType === "interval" ? [{ label: "Every", value: `${data.intervalMs || "—"} minutes` }] : []),
      ],
    },
    {
      title: "Notifications",
      items: [
        { label: "Email", value: data.notifyEmail ? "Enabled" : "Disabled" },
        { label: "Webhook", value: data.notifyWebhook ? data.webhookUrl || "URL not set" : "Disabled", mono: data.notifyWebhook },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Review & Launch</h2>
        <p className="mt-1 text-sm text-muted-foreground">Verify your configuration before launching</p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-lg border border-border">
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</p>
            </div>
            <div className="divide-y divide-border">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  {"badge" in item && item.badge ? (
                    <Badge variant="default">{item.value}</Badge>
                  ) : (
                    <span className={`text-sm font-medium text-foreground ${"mono" in item && item.mono ? "font-mono text-xs" : ""}`}>
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Estimated usage:</strong> ~1 request per run.
          {data.scheduleType === "cron" && data.cron === "*/30 * * * *" && " ~1,440 requests/month at every 30min."}
          {data.scheduleType === "cron" && data.cron === "0 * * * *" && " ~720 requests/month at every hour."}
          {data.scheduleType === "cron" && data.cron === "0 */6 * * *" && " ~120 requests/month at every 6 hours."}
          {data.scheduleType === "once" && " Single run, 1 request total."}
        </p>
      </div>
    </div>
  );
}
