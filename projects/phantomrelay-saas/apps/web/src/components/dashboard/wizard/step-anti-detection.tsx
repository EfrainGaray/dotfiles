import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { WizardData } from "./wizard";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

export function StepAntiDetection({ data, update }: Props) {
  const addHeader = () => {
    update({ extraHeaders: [...data.extraHeaders, { key: "", value: "" }] });
  };

  const removeHeader = (index: number) => {
    update({ extraHeaders: data.extraHeaders.filter((_, i) => i !== index) });
  };

  const updateHeader = (index: number, field: string, value: string) => {
    const updated = data.extraHeaders.map((h, i) => (i === index ? { ...h, [field]: value } : h));
    update({ extraHeaders: updated });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Anti-Detection</h2>
        <p className="mt-1 text-sm text-muted-foreground">Configure proxy, CAPTCHA solving, and browser profile</p>
      </div>

      <div className="space-y-4">
        {/* Proxy Pool */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Proxy Pool</label>
          <select
            value={data.proxyPool}
            onChange={(e) => update({ proxyPool: e.target.value })}
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">None (direct connection)</option>
            <option value="residential-us">Residential US (50 proxies, best-score)</option>
            <option value="datacenter-eu">Datacenter EU (30 proxies, round-robin)</option>
            <option value="mobile-mix">Mobile Mix (15 proxies, least-used)</option>
          </select>
          <p className="text-xs text-muted-foreground">EMA health scoring with per-domain banning. Proxies rotate automatically.</p>
        </div>

        {/* CAPTCHA */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">CAPTCHA Auto-Solve</p>
            <p className="text-xs text-muted-foreground">
              Detect and solve Turnstile, reCAPTCHA, hCaptcha, DataDome, PerimeterX
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={data.captchaSolve}
              onChange={(e) => update({ captchaSolve: e.target.checked })}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>

        {/* Profile */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Aged Browser Profile</label>
          <select
            value={data.profileId}
            onChange={(e) => update({ profileId: e.target.value })}
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">Auto-assign (recommended)</option>
            <option value="developer-01">developer-01 (health: 92, 6mo history)</option>
            <option value="shopper-03">shopper-03 (health: 85, 6mo history)</option>
            <option value="student-02">student-02 (health: 78, 6mo history)</option>
            <option value="news-reader-01">news-reader-01 (health: 95, 6mo history)</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Profiles have 6 months of synthetic browsing history. Only used in Human and Auto modes.
          </p>
        </div>

        {/* Extra Headers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Extra Headers</h3>
              <p className="text-xs text-muted-foreground">Custom HTTP headers sent with every request</p>
            </div>
            <Button variant="outline" size="sm" onClick={addHeader}>
              <Plus className="h-3.5 w-3.5" />
              Add Header
            </Button>
          </div>
          {data.extraHeaders.map((header, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={header.key}
                onChange={(e) => updateHeader(i, "key", e.target.value)}
                placeholder="Header name"
                className="flex-1 text-xs font-mono"
              />
              <Input
                value={header.value}
                onChange={(e) => updateHeader(i, "value", e.target.value)}
                placeholder="Header value"
                className="flex-1 text-xs"
              />
              <button onClick={() => removeHeader(i)} className="p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
