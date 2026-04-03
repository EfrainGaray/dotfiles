import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Copy, Eye, EyeOff, Plus, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import * as api from "@/lib/api-client";
import type { ApiKey } from "@/lib/api-client";

const mockApiKeys: ApiKey[] = [
  { id: "k1", key: "pr_live_sk_••••••••••••", name: "Production", createdAt: "2026-01-15T00:00:00Z", lastUsedAt: "2026-04-02T12:00:00Z" },
  { id: "k2", key: "pr_test_sk_••••••••••••", name: "Development", createdAt: "2026-02-01T00:00:00Z", lastUsedAt: "2026-03-30T00:00:00Z" },
];

const webhooks = [
  { id: "w1", url: "https://api.myapp.com/webhooks/phantom", events: ["run.completed", "run.failed"], active: true },
  { id: "w2", url: "https://slack.com/webhook/T123", events: ["alert"], active: true },
];

export function SettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  async function loadApiKeys() {
    try {
      setLoading(true);
      const result = await api.getApiKeys();
      setApiKeys(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
      setApiKeys(mockApiKeys);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateKey() {
    if (!newKeyName.trim()) return;
    try {
      setGenerating(true);
      const newKey = await api.createApiKey(newKeyName.trim());
      setApiKeys((prev) => [...prev, newKey]);
      setGeneratedKey(newKey.key);
      setNewKeyName("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate API key");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevokeKey(id: string, name: string) {
    if (!confirm(`Revoke API key "${name}"? This cannot be undone.`)) return;
    try {
      await api.revokeApiKey(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke API key");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback: do nothing
    });
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString();
  }

  function timeAgo(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMin = Math.floor((now - then) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  }

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

      {/* Generated Key Alert */}
      {generatedKey && (
        <div className="rounded-lg border-2 border-success bg-success/10 p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">API Key Generated Successfully</p>
          <p className="text-xs text-muted-foreground">Copy this key now. You will not be able to see it again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono text-foreground break-all">
              {generatedKey}
            </code>
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedKey)}>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setGeneratedKey(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* API Keys */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">API Keys</h2>
          <div className="flex items-center gap-2">
            {showNewKeyModal ? (
              <>
                <Input
                  placeholder="Key name..."
                  className="h-8 w-40"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateKey()}
                />
                <Button size="sm" onClick={handleGenerateKey} disabled={generating || !newKeyName.trim()}>
                  {generating ? "Creating..." : "Create"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowNewKeyModal(false); setNewKeyName(""); }}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowNewKeyModal(true)}>
                <Plus className="h-3.5 w-3.5" />Generate Key
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-warning bg-warning/10 p-3 text-sm text-warning">
            {error} — showing cached data
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading API keys...
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-5 py-2.5 font-medium">Key</th>
                  <th className="px-5 py-2.5 font-medium">Created</th>
                  <th className="px-5 py-2.5 font-medium">Last Used</th>
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
                          {showKey ? key.key : key.key.replace(/(?<=.{8}).+/, "••••••••••••")}
                        </code>
                        <button onClick={() => setShowKey(!showKey)} className="text-muted-foreground hover:text-foreground">
                          {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button className="text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(key.key)}>
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-muted-foreground text-xs">{formatDate(key.createdAt)}</td>
                    <td className="px-5 py-2.5 text-muted-foreground text-xs">{timeAgo(key.lastUsedAt)}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex gap-1">
                        <button
                          className="p-1 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRevokeKey(key.id, key.name)}
                          title="Revoke key"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {apiKeys.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No API keys yet. Generate one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
