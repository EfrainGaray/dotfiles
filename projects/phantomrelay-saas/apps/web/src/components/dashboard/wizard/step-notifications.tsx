import { Input } from "../../ui/input";
import type { WizardData } from "./wizard";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

export function StepNotifications({ data, update }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="mt-1 text-sm text-muted-foreground">Get notified when runs complete or fail</p>
      </div>

      <div className="space-y-3">
        {/* Email */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">Email Notifications</p>
            <p className="text-xs text-muted-foreground">Receive email on failure and completion</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={data.notifyEmail}
              onChange={(e) => update({ notifyEmail: e.target.checked })}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>

        {/* Webhook */}
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Webhook</p>
              <p className="text-xs text-muted-foreground">POST JSON payload on run events (HMAC signed)</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={data.notifyWebhook}
                onChange={(e) => update({ notifyWebhook: e.target.checked })}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
          {data.notifyWebhook && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Webhook URL</label>
              <Input
                value={data.webhookUrl}
                onChange={(e) => update({ webhookUrl: e.target.value })}
                placeholder="https://api.yourapp.com/webhooks/phantomrelay"
                className="text-xs font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Events: run.started, run.completed, run.failed. Payload includes full TaskResult.
              </p>
            </div>
          )}
        </div>

        {/* In-app */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">In-App Alerts</p>
            <p className="text-xs text-muted-foreground">Always enabled. See alerts in the dashboard.</p>
          </div>
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Always on</span>
        </div>
      </div>
    </div>
  );
}
