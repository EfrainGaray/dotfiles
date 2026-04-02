import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import type { WizardData } from "./wizard";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

const scheduleOptions = [
  { id: "once", label: "Run Once", desc: "Execute immediately, no recurring schedule" },
  { id: "cron", label: "Cron Schedule", desc: "Unix cron expression (e.g. every 6 hours)" },
  { id: "interval", label: "Interval", desc: "Run at fixed intervals (e.g. every 30 minutes)" },
];

const cronPresets = [
  { label: "Every 30m", value: "*/30 * * * *" },
  { label: "Every 1h", value: "0 * * * *" },
  { label: "Every 6h", value: "0 */6 * * *" },
  { label: "Every 12h", value: "0 */12 * * *" },
  { label: "Daily 9am", value: "0 9 * * *" },
  { label: "Daily 6am", value: "0 6 * * *" },
];

export function StepSchedule({ data, update }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Schedule</h2>
        <p className="mt-1 text-sm text-muted-foreground">When and how often to run this scraper</p>
      </div>

      <div className="space-y-3">
        {scheduleOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => update({ scheduleType: opt.id })}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors",
              data.scheduleType === opt.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/20"
            )}
          >
            <div className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
              data.scheduleType === opt.id ? "border-primary bg-primary" : "border-muted-foreground"
            )}>
              {data.scheduleType === opt.id && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">{opt.label}</span>
              <p className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {data.scheduleType === "cron" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Cron Expression</label>
            <Input
              value={data.cron}
              onChange={(e) => update({ cron: e.target.value })}
              placeholder="*/30 * * * *"
              className="font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {cronPresets.map((p) => (
              <button
                key={p.value}
                onClick={() => update({ cron: p.value })}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs transition-colors",
                  data.cron === p.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {data.scheduleType === "interval" && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Interval (minutes)</label>
          <Input
            type="number"
            value={data.intervalMs}
            onChange={(e) => update({ intervalMs: e.target.value })}
            placeholder="30"
            min="5"
          />
          <p className="text-xs text-muted-foreground">Minimum 5 minutes. Runs will be queued via BullMQ.</p>
        </div>
      )}
    </div>
  );
}
