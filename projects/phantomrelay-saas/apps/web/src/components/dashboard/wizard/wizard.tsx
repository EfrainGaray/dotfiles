import { useState } from "react";
import { Button } from "../../ui/button";
import { StepTarget } from "./step-target";
import { StepMode } from "./step-mode";
import { StepActions } from "./step-actions";
import { StepExtraction } from "./step-extraction";
import { StepAntiDetection } from "./step-anti-detection";
import { StepSchedule } from "./step-schedule";
import { StepNotifications } from "./step-notifications";
import { StepReview } from "./step-review";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Target" },
  { id: 2, label: "Mode" },
  { id: 3, label: "Actions" },
  { id: 4, label: "Extraction" },
  { id: 5, label: "Anti-Detection" },
  { id: 6, label: "Schedule" },
  { id: 7, label: "Notifications" },
  { id: 8, label: "Review" },
];

export interface WizardData {
  name: string;
  url: string;
  mode: string;
  engine: string;
  waitFor: string;
  actions: { type: string; selector?: string; value?: string }[];
  extractHtml: boolean;
  extractText: boolean;
  extractScreenshot: boolean;
  extractHar: boolean;
  selectors: { name: string; selector: string; attribute: string }[];
  proxyPool: string;
  captchaSolve: boolean;
  profileId: string;
  extraHeaders: { key: string; value: string }[];
  scheduleType: string;
  cron: string;
  intervalMs: string;
  notifyEmail: boolean;
  notifyWebhook: boolean;
  webhookUrl: string;
}

const defaultData: WizardData = {
  name: "",
  url: "",
  mode: "auto",
  engine: "chrome",
  waitFor: "load",
  actions: [],
  extractHtml: true,
  extractText: false,
  extractScreenshot: false,
  extractHar: false,
  selectors: [],
  proxyPool: "",
  captchaSolve: true,
  profileId: "",
  extraHeaders: [],
  scheduleType: "once",
  cron: "",
  intervalMs: "",
  notifyEmail: true,
  notifyWebhook: false,
  webhookUrl: "",
};

export function ScraperWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(defaultData);

  const update = (partial: Partial<WizardData>) => setData((prev) => ({ ...prev, ...partial }));

  const canNext = () => {
    if (step === 1) return data.name.trim() !== "" && data.url.trim() !== "";
    return true;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Scraper</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure your scraper step by step</p>
      </div>

      {/* Stepper */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-1 min-w-[600px]">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => s.id <= step && setStep(s.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                  s.id === step
                    ? "bg-primary text-primary-foreground"
                    : s.id < step
                      ? "bg-muted text-foreground cursor-pointer hover:bg-accent"
                      : "text-muted-foreground"
                )}
              >
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                  s.id === step ? "bg-primary-foreground/20" : s.id < step ? "bg-success/20 text-success" : "bg-muted"
                )}>
                  {s.id < step ? "✓" : s.id}
                </span>
                {s.label}
              </button>
              {i < steps.length - 1 && (
                <div className={cn("h-px flex-1 min-w-4", s.id < step ? "bg-primary/30" : "bg-border")} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-lg border border-border bg-card p-6">
        {step === 1 && <StepTarget data={data} update={update} />}
        {step === 2 && <StepMode data={data} update={update} />}
        {step === 3 && <StepActions data={data} update={update} />}
        {step === 4 && <StepExtraction data={data} update={update} />}
        {step === 5 && <StepAntiDetection data={data} update={update} />}
        {step === 6 && <StepSchedule data={data} update={update} />}
        {step === 7 && <StepNotifications data={data} update={update} />}
        {step === 8 && <StepReview data={data} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          Back
        </Button>
        <p className="text-xs text-muted-foreground">Step {step} of {steps.length}</p>
        {step < 8 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            Continue
          </Button>
        ) : (
          <Button onClick={() => alert("Scraper created! (mock)")}>
            Launch Scraper
          </Button>
        )}
      </div>
    </div>
  );
}
