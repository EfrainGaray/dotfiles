import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Copy, Eye, EyeOff, Plus, Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";

const apiKeys = [
  { id: "k1", prefix: "pr_live_", name: "Production", created: "Jan 15, 2026", lastUsed: "2 min ago", expiresAt: "Never" },
  { id: "k2", prefix: "pr_test_", name: "Development", created: "Feb 1, 2026", lastUsed: "3 days ago", expiresAt: "Jun 1, 2026" },
];

const webhooks = [
  { id: "w1", url: "https://api.myapp.com/webhooks/phantom", events: ["run.completed", "run.failed"], active: true },
  { id: "w2", url: "https://slack.com/webhook/T123", events: ["alert"], active: true },
];

export function SettingsPage() {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account, API keys, webhooks, and notifications</p>
      </div>

      {/* Profile */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input defaultValue="Efrain Garay" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input defaultValue="efrain@phantomrelay.com" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm">Save Changes</Button>
          </div>
        </div>
      </section>

      {/* API Keys */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">API Keys</h2>
          <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5" />Generate Key</Button>
        </div>
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Key</th>
                <th className="px-5 py-2.5 font-medium">Created</th>
                <th className="px-5 py-2.5 font-medium">Last Used</th>
                <th className="px-5 py-2.5 font-medium">Expires</th>
                <th className="px-5 py-2.5 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr key={key.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-2.5 font-medium text-foreground">{key.name}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground">
                        {showKey ? `${key.prefix}sk_a1b2c3d4e5f6` : `${key.prefix}sk_••••••••••••`}
                      </code>
                      <button onClick={() => setShowKey(!showKey)} className="text-muted-foreground hover:text-foreground">
                        {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-muted-foreground text-xs">{key.created}</td>
                  <td className="px-5 py-2.5 text-muted-foreground text-xs">{key.lastUsed}</td>
                  <td className="px-5 py-2.5 text-muted-foreground text-xs">{key.expiresAt}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex gap-1">
                      <button className="p-1 text-muted-foreground hover:text-foreground"><RefreshCw className="h-3.5 w-3.5" /></button>
                      <button className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Webhooks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Webhooks</h2>
          <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5" />Add Webhook</Button>
        </div>
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <code className="text-xs text-foreground">{wh.url}</code>
                <div className="mt-1.5 flex gap-1.5">
                  {wh.events.map((e) => (
                    <Badge key={e} variant="secondary">{e}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={wh.active ? "success" : "secondary"}>{wh.active ? "Active" : "Inactive"}</Badge>
                <button className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Notification Preferences</h2>
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          {[
            { label: "Run failures", desc: "Notify when a scraper run fails", checked: true },
            { label: "Usage warnings", desc: "Alert at 80% and 95% of monthly quota", checked: true },
            { label: "Fleet health", desc: "Notify when instances die or proxies degrade", checked: true },
            { label: "CAPTCHA detections", desc: "Alert when CAPTCHAs are detected", checked: false },
            { label: "Weekly digest", desc: "Summary of runs, success rates, and usage", checked: true },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{pref.label}</p>
                <p className="text-xs text-muted-foreground">{pref.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked={pref.checked} className="peer sr-only" />
                <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        <div className="rounded-lg border border-destructive/30 bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
