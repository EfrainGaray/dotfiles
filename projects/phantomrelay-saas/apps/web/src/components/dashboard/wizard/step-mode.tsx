import { cn } from "@/lib/utils";
import type { WizardData } from "./wizard";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

const modes = [
  { id: "http", name: "HTTP", latency: "10-50ms", desc: "TLS fingerprinting (JA4), HTTP/2 SETTINGS spoofing. Fastest option.", color: "border-success" },
  { id: "headless", name: "Headless", latency: "200ms-2s", desc: "Chrome --headless=new with 11 stealth patches. Good balance of speed and evasion.", color: "border-chart-1" },
  { id: "stealth", name: "Stealth", latency: "2-15s", desc: "Bezier mouse curves, Markov keyboard timing, momentum scrolling. Behavioral simulation.", color: "border-chart-3" },
  { id: "human", name: "Human", latency: "5-30s", desc: "6-month aged profiles, proxy rotation, random dwell times. Maximum evasion power.", color: "border-chart-5" },
  { id: "auto", name: "Auto", latency: "Smart", desc: "Starts at HTTP, auto-escalates on detection. Recommended for most use cases.", color: "border-chart-4" },
];

export function StepMode({ data, update }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Evasion Mode</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose how aggressively to evade anti-bot detection</p>
      </div>

      <div className="space-y-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => update({ mode: mode.id })}
            className={cn(
              "flex w-full items-start gap-4 rounded-lg border-2 p-4 text-left transition-colors",
              data.mode === mode.id
                ? `${mode.color} bg-muted/30`
                : "border-border hover:bg-muted/20"
            )}
          >
            <div className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
              data.mode === mode.id ? "border-primary bg-primary" : "border-muted-foreground"
            )}>
              {data.mode === mode.id && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{mode.name}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{mode.latency}</span>
                {mode.id === "auto" && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">Recommended</span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{mode.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
