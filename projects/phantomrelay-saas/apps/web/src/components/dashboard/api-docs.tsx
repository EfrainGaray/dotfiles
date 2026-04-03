import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useState, useEffect, useCallback } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Play, Loader2 } from "lucide-react";
import * as api from "@/lib/api-client";
import type { ApiKey } from "@/lib/api-client";

// --- i18n-ready labels (extract to locale files when needed) ---
const labels = {
  title: "API Reference",
  subtitle: "REST API for programmatic access. Base URL:",
  auth: "Authentication",
  authDesc: "All requests require a Bearer token in the Authorization header.",
  rateLimits: "Rate Limits",
  codeExamples: "Code Examples",
  copy: "Copy",
  copied: "Copied!",
  tryIt: "Try it",
  running: "Running...",
  responseTime: "Response time",
  usingKey: "Using your key:",
  noKeys: "No API keys found. Create one in Settings.",
  endpoints: "endpoints",
};

// --- Endpoint group definitions ---
interface EndpointParam {
  name: string;
  type: string;
  required: boolean;
  desc: string;
}

interface Endpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  desc: string;
  params: EndpointParam[];
  tryable?: boolean;
}

interface EndpointGroup {
  name: string;
  endpoints: Endpoint[];
}

const endpointGroups: EndpointGroup[] = [
  {
    name: "Auth",
    endpoints: [
      {
        method: "POST", path: "/auth/register", desc: "Register a new user account",
        params: [
          { name: "email", type: "string", required: true, desc: "User email address" },
          { name: "password", type: "string", required: true, desc: "User password (min 8 chars)" },
          { name: "name", type: "string", required: true, desc: "Display name" },
        ],
      },
      {
        method: "POST", path: "/auth/login", desc: "Authenticate and receive JWT tokens",
        params: [
          { name: "email", type: "string", required: true, desc: "User email address" },
          { name: "password", type: "string", required: true, desc: "User password" },
        ],
      },
      {
        method: "GET", path: "/auth/me", desc: "Get current authenticated user",
        params: [], tryable: true,
      },
    ],
  },
  {
    name: "Scrapers",
    endpoints: [
      {
        method: "GET", path: "/scrapers", desc: "List all scrapers for the current user",
        params: [], tryable: true,
      },
      {
        method: "POST", path: "/scrapers", desc: "Create a new scraper configuration",
        params: [
          { name: "name", type: "string", required: true, desc: "Scraper name" },
          { name: "targetUrl", type: "string", required: true, desc: "Target URL to scrape" },
          { name: "mode", type: "string", required: false, desc: "Scraping mode (http | headless | stealth)" },
          { name: "config", type: "object", required: false, desc: "Additional scraper configuration" },
        ],
      },
      {
        method: "GET", path: "/scrapers/:id", desc: "Get a specific scraper by ID",
        params: [{ name: "id", type: "string", required: true, desc: "Scraper ID" }],
      },
      {
        method: "PATCH", path: "/scrapers/:id", desc: "Update a scraper configuration",
        params: [
          { name: "id", type: "string", required: true, desc: "Scraper ID (path)" },
          { name: "name", type: "string", required: false, desc: "Updated scraper name" },
          { name: "targetUrl", type: "string", required: false, desc: "Updated target URL" },
          { name: "mode", type: "string", required: false, desc: "Updated scraping mode" },
          { name: "status", type: "string", required: false, desc: "Updated status" },
        ],
      },
      {
        method: "DELETE", path: "/scrapers/:id", desc: "Delete a scraper",
        params: [{ name: "id", type: "string", required: true, desc: "Scraper ID" }],
      },
    ],
  },
  {
    name: "Runs",
    endpoints: [
      {
        method: "POST", path: "/runs/:scraperId/execute", desc: "Execute a scraper run",
        params: [{ name: "scraperId", type: "string", required: true, desc: "Scraper ID to execute" }],
      },
      {
        method: "GET", path: "/runs", desc: "List all runs with optional filters",
        params: [
          { name: "scraperId", type: "string", required: false, desc: "Filter by scraper ID" },
          { name: "status", type: "string", required: false, desc: "Filter by status" },
          { name: "page", type: "number", required: false, desc: "Page number" },
          { name: "limit", type: "number", required: false, desc: "Items per page" },
        ],
        tryable: true,
      },
      {
        method: "GET", path: "/runs/stats", desc: "Get aggregated run statistics",
        params: [], tryable: true,
      },
      {
        method: "GET", path: "/runs/:id", desc: "Get a specific run by ID",
        params: [{ name: "id", type: "string", required: true, desc: "Run ID" }],
      },
    ],
  },
  {
    name: "Schedules",
    endpoints: [
      {
        method: "POST", path: "/schedules/:scraperId", desc: "Create a schedule for a scraper",
        params: [
          { name: "scraperId", type: "string", required: true, desc: "Scraper ID (path)" },
          { name: "cron", type: "string", required: true, desc: "Cron expression" },
          { name: "enabled", type: "boolean", required: false, desc: "Whether schedule is active" },
        ],
      },
      {
        method: "GET", path: "/schedules", desc: "List all schedules",
        params: [], tryable: true,
      },
      {
        method: "PATCH", path: "/schedules/:id", desc: "Update a schedule",
        params: [
          { name: "id", type: "string", required: true, desc: "Schedule ID (path)" },
          { name: "cron", type: "string", required: false, desc: "Updated cron expression" },
          { name: "enabled", type: "boolean", required: false, desc: "Updated enabled state" },
        ],
      },
      {
        method: "DELETE", path: "/schedules/:id", desc: "Delete a schedule",
        params: [{ name: "id", type: "string", required: true, desc: "Schedule ID" }],
      },
    ],
  },
  {
    name: "Billing",
    endpoints: [
      {
        method: "GET", path: "/billing/plans", desc: "List available billing plans",
        params: [], tryable: true,
      },
      {
        method: "GET", path: "/billing/usage", desc: "Get current usage and limits",
        params: [], tryable: true,
      },
    ],
  },
  {
    name: "Monitoring",
    endpoints: [
      {
        method: "GET", path: "/monitoring/health", desc: "Health check (200/503)",
        params: [], tryable: true,
      },
    ],
  },
  {
    name: "Notifications",
    endpoints: [
      {
        method: "GET", path: "/notifications", desc: "List all notifications",
        params: [], tryable: true,
      },
      {
        method: "GET", path: "/notifications/unread-count", desc: "Get unread notification count",
        params: [], tryable: true,
      },
    ],
  },
  {
    name: "API Keys",
    endpoints: [
      {
        method: "GET", path: "/api-keys", desc: "List all API keys",
        params: [], tryable: true,
      },
      {
        method: "POST", path: "/api-keys", desc: "Create a new API key",
        params: [{ name: "name", type: "string", required: true, desc: "Key name / label" }],
      },
      {
        method: "DELETE", path: "/api-keys/:id", desc: "Revoke an API key",
        params: [{ name: "id", type: "string", required: true, desc: "API key ID" }],
      },
    ],
  },
];

// --- Helper: mask API key for display ---
function maskKey(key: string): string {
  if (key.length <= 10) return key;
  return key.slice(0, 10) + "...";
}

// --- Helper: get method badge variant ---
function methodVariant(method: string) {
  switch (method) {
    case "POST": return "default" as const;
    case "DELETE": return "destructive" as const;
    case "PATCH": return "warning" as const;
    default: return "success" as const;
  }
}

// --- Code block with copy button ---
function CopyableCode({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <div className={`relative group ${className || ""}`}>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/80 border border-border px-2 py-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? labels.copied : labels.copy}
      </button>
      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono text-foreground leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

// --- Try it panel ---
interface TryItResult {
  status: number;
  timeMs: number;
  body: unknown;
}

function TryItButton({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TryItResult | null>(null);
  const [open, setOpen] = useState(false);

  const handleTryIt = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setOpen(true);
    const start = performance.now();
    try {
      const token = api.getToken();
      const baseUrl =
        (typeof import.meta !== "undefined" &&
          (import.meta.env as Record<string, string>)?.PUBLIC_API_URL) ||
        "http://localhost:3001/api";
      const response = await fetch(`${baseUrl}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const timeMs = Math.round(performance.now() - start);
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }
      setResult({ status: response.status, timeMs, body });
    } catch (err) {
      const timeMs = Math.round(performance.now() - start);
      setResult({ status: 0, timeMs, body: { error: String(err) } });
    } finally {
      setLoading(false);
    }
  }, [path]);

  return (
    <div className="mt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTryIt}
        disabled={loading}
        className="gap-1.5 text-xs"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
        {loading ? labels.running : labels.tryIt}
      </Button>
      {result && open && (
        <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
          <button
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 w-full px-4 py-2 text-left text-xs border-b border-border hover:bg-muted/50"
          >
            <Badge variant={result.status >= 200 && result.status < 300 ? "success" : "destructive"}>
              {result.status || "ERR"}
            </Badge>
            <span className="text-muted-foreground">
              {labels.responseTime}: {result.timeMs}ms
            </span>
          </button>
          <CopyableCode code={JSON.stringify(result.body, null, 2)} className="rounded-none" />
        </div>
      )}
    </div>
  );
}

// --- Collapsible endpoint group ---
function EndpointGroupSection({
  group,
  defaultOpen,
  apiKeyDisplay,
}: {
  group: EndpointGroup;
  defaultOpen: boolean;
  apiKeyDisplay: string | null;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-5 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
        <span className="text-xs text-muted-foreground">
          ({group.endpoints.length} {labels.endpoints})
        </span>
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {group.endpoints.map((ep) => (
            <div key={`${ep.method}-${ep.path}`} className="px-5 py-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={methodVariant(ep.method)}>
                  {ep.method}
                </Badge>
                <code className="text-sm font-medium text-foreground">{ep.path}</code>
                <span className="text-xs text-muted-foreground">{ep.desc}</span>
              </div>
              {ep.params.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">Parameter</th>
                        <th className="pb-2 pr-4 font-medium">Type</th>
                        <th className="pb-2 pr-4 font-medium">Required</th>
                        <th className="pb-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.params.map((p) => (
                        <tr key={p.name} className="border-b border-border last:border-0">
                          <td className="py-1.5 pr-4 font-mono text-xs text-foreground">{p.name}</td>
                          <td className="py-1.5 pr-4 font-mono text-xs text-muted-foreground">{p.type}</td>
                          <td className="py-1.5 pr-4">
                            {p.required
                              ? <span className="text-xs text-destructive">required</span>
                              : <span className="text-xs text-muted-foreground">optional</span>}
                          </td>
                          <td className="py-1.5 text-xs text-muted-foreground">{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {ep.tryable && ep.method === "GET" && !ep.path.includes(":") && (
                <TryItButton path={ep.path} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Code examples with live API key insertion ---
function buildCodeExamples(apiKey: string) {
  return {
    curl: `curl -X POST https://api.phantomrelay.com/scrapers \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Scraper",
    "targetUrl": "https://example.com",
    "mode": "stealth"
  }'`,
    python: `import requests

response = requests.post(
    "https://api.phantomrelay.com/scrapers",
    headers={"Authorization": "Bearer ${apiKey}"},
    json={
        "name": "My Scraper",
        "targetUrl": "https://example.com",
        "mode": "stealth",
    }
)

result = response.json()
print(f"Created scraper: {result['id']}")`,
    node: `const response = await fetch("https://api.phantomrelay.com/scrapers", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "My Scraper",
    targetUrl: "https://example.com",
    mode: "stealth",
  }),
});

const result = await response.json();
console.log(\`Created scraper: \${result.id}\`);`,
  };
}

// --- Main component ---
export function ApiDocsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeTab, setActiveTab] = useState<"curl" | "python" | "node">("curl");

  useEffect(() => {
    api.getApiKeys().then(setApiKeys).catch(() => {
      // User may not be authenticated or no keys yet
    });
  }, []);

  const activeKey = apiKeys.length > 0 ? apiKeys[0] : null;
  const keyForExamples = activeKey ? activeKey.key : "YOUR_API_KEY";
  const keyDisplay = activeKey ? maskKey(activeKey.key) : null;
  const codeExamples = buildCodeExamples(keyForExamples);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{labels.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {labels.subtitle}{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">https://api.phantomrelay.com</code>
        </p>
      </div>

      {/* Auth */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">{labels.auth}</h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{labels.authDesc}</p>
          <CopyableCode
            code={`Authorization: Bearer ${keyForExamples}`}
            className="mt-3"
          />
          {keyDisplay && (
            <p className="mt-2 text-xs text-muted-foreground">
              {labels.usingKey} <code className="bg-muted px-1 py-0.5 rounded">{keyDisplay}</code>
            </p>
          )}
          {!activeKey && (
            <p className="mt-2 text-xs text-muted-foreground">{labels.noKeys}</p>
          )}
        </div>
      </section>

      {/* Rate Limits */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">{labels.rateLimits}</h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><code className="text-xs bg-muted px-1 py-0.5 rounded">/scrapers</code><p className="mt-1 text-xs text-muted-foreground">30 req/min</p></div>
            <div><code className="text-xs bg-muted px-1 py-0.5 rounded">/runs</code><p className="mt-1 text-xs text-muted-foreground">10 req/min</p></div>
            <div><code className="text-xs bg-muted px-1 py-0.5 rounded">other</code><p className="mt-1 text-xs text-muted-foreground">100 req/min</p></div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Response headers: <code className="bg-muted px-1 py-0.5 rounded">X-RateLimit-Limit</code>, <code className="bg-muted px-1 py-0.5 rounded">X-RateLimit-Remaining</code>, <code className="bg-muted px-1 py-0.5 rounded">X-RateLimit-Reset</code>
          </p>
        </div>
      </section>

      {/* Endpoint Groups */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Endpoints</h2>
        {endpointGroups.map((group, idx) => (
          <EndpointGroupSection
            key={group.name}
            group={group}
            defaultOpen={idx === 0}
            apiKeyDisplay={keyDisplay}
          />
        ))}
      </section>

      {/* Code Examples */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{labels.codeExamples}</h2>
        {keyDisplay && (
          <p className="text-xs text-muted-foreground">
            {labels.usingKey} <code className="bg-muted px-1 py-0.5 rounded">{keyDisplay}</code>
          </p>
        )}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex border-b border-border">
            {(["curl", "python", "node"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === lang
                    ? "bg-muted text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <CopyableCode code={codeExamples[activeTab]} />
        </div>
      </section>
    </div>
  );
}
