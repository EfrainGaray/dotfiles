import { Badge } from "../ui/badge";

const endpoints = [
  {
    method: "POST", path: "/scrape", desc: "Execute a one-shot scraping task",
    params: [
      { name: "url", type: "string", required: true, desc: "Target URL (SSRF-protected)" },
      { name: "mode", type: "enum", required: false, desc: "http | headless | stealth | human | auto (default: headless)" },
      { name: "engine", type: "enum", required: false, desc: "chrome | firefox (default: chrome)" },
      { name: "waitFor", type: "WaitCondition", required: false, desc: "load | domcontentloaded | networkidle | selector | function | delay" },
      { name: "timeout", type: "number", required: false, desc: "Timeout in ms (default: 30000)" },
      { name: "extractText", type: "boolean", required: false, desc: "Include plain text extraction" },
      { name: "screenshot", type: "boolean", required: false, desc: "Capture full page screenshot" },
      { name: "har", type: "boolean", required: false, desc: "Record HAR 1.2" },
      { name: "captchaSolve", type: "boolean", required: false, desc: "Auto-solve detected CAPTCHAs" },
      { name: "actions", type: "PageAction[]", required: false, desc: "Page action sequence" },
      { name: "extraHeaders", type: "object", required: false, desc: "Custom HTTP headers" },
      { name: "profileId", type: "string", required: false, desc: "Pin to aged browser profile" },
    ],
  },
  {
    method: "POST", path: "/sessions", desc: "Create a new browser session",
    params: [
      { name: "mode", type: "enum", required: true, desc: "Evasion mode" },
      { name: "engine", type: "enum", required: false, desc: "Browser engine" },
      { name: "profileId", type: "string", required: false, desc: "Profile ID" },
      { name: "persistent", type: "boolean", required: false, desc: "Keep alive after task" },
    ],
  },
  {
    method: "GET", path: "/sessions", desc: "List all active sessions with health",
    params: [],
  },
  {
    method: "DELETE", path: "/sessions/:id", desc: "Destroy a session immediately",
    params: [{ name: "id", type: "string", required: true, desc: "Session ID" }],
  },
  {
    method: "GET", path: "/health", desc: "Fleet health check (200/503)",
    params: [],
  },
  {
    method: "GET", path: "/metrics/json", desc: "JSON fleet + process stats",
    params: [],
  },
];

const codeExamples = {
  curl: `curl -X POST https://api.phantomrelay.com/scrape \\
  -H "Authorization: Bearer pr_live_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "mode": "stealth",
    "extractText": true,
    "screenshot": true,
    "captchaSolve": true,
    "actions": [
      {"type": "wait", "condition": {"type": "selector", "selector": "#content"}},
      {"type": "scroll", "y": 500},
      {"type": "screenshot"}
    ]
  }'`,
  python: `import requests

response = requests.post(
    "https://api.phantomrelay.com/scrape",
    headers={"Authorization": "Bearer pr_live_sk_..."},
    json={
        "url": "https://example.com",
        "mode": "stealth",
        "extractText": True,
        "screenshot": True,
        "captchaSolve": True,
        "actions": [
            {"type": "wait", "condition": {"type": "selector", "selector": "#content"}},
            {"type": "scroll", "y": 500},
            {"type": "screenshot"}
        ]
    }
)

result = response.json()
print(f"Status: {result['status']}, Latency: {result['latencyMs']}ms")`,
  node: `const response = await fetch("https://api.phantomrelay.com/scrape", {
  method: "POST",
  headers: {
    "Authorization": "Bearer pr_live_sk_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://example.com",
    mode: "stealth",
    extractText: true,
    screenshot: true,
    captchaSolve: true,
    actions: [
      { type: "wait", condition: { type: "selector", selector: "#content" } },
      { type: "scroll", y: 500 },
      { type: "screenshot" },
    ],
  }),
});

const result = await response.json();
console.log(\`Status: \${result.status}, Latency: \${result.latencyMs}ms\`);`,
};

export function ApiDocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Reference</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          REST API for programmatic access. Base URL: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">https://api.phantomrelay.com</code>
        </p>
      </div>

      {/* Auth */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Authentication</h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            All requests require a Bearer token in the <code className="text-xs bg-muted px-1 py-0.5 rounded">Authorization</code> header.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono text-foreground">
            Authorization: Bearer pr_live_sk_your_api_key
          </pre>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Rate Limits</h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><code className="text-xs bg-muted px-1 py-0.5 rounded">/scrape</code><p className="mt-1 text-xs text-muted-foreground">10 req/min</p></div>
            <div><code className="text-xs bg-muted px-1 py-0.5 rounded">/sessions</code><p className="mt-1 text-xs text-muted-foreground">30 req/min</p></div>
            <div><code className="text-xs bg-muted px-1 py-0.5 rounded">other</code><p className="mt-1 text-xs text-muted-foreground">100 req/min</p></div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Response headers: <code className="bg-muted px-1 py-0.5 rounded">X-RateLimit-Limit</code>, <code className="bg-muted px-1 py-0.5 rounded">X-RateLimit-Remaining</code>, <code className="bg-muted px-1 py-0.5 rounded">X-RateLimit-Reset</code>
          </p>
        </div>
      </section>

      {/* Endpoints */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Endpoints</h2>
        {endpoints.map((ep) => (
          <div key={`${ep.method}-${ep.path}`} className="rounded-lg border border-border bg-card overflow-x-auto">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3">
              <Badge variant={ep.method === "POST" ? "default" : ep.method === "DELETE" ? "destructive" : "success"}>
                {ep.method}
              </Badge>
              <code className="text-sm font-medium text-foreground">{ep.path}</code>
              <span className="text-xs text-muted-foreground">{ep.desc}</span>
            </div>
            {ep.params.length > 0 && (
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-2 font-medium">Parameter</th>
                    <th className="px-5 py-2 font-medium">Type</th>
                    <th className="px-5 py-2 font-medium">Required</th>
                    <th className="px-5 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {ep.params.map((p) => (
                    <tr key={p.name} className="border-b border-border last:border-0">
                      <td className="px-5 py-2 font-mono text-xs text-foreground">{p.name}</td>
                      <td className="px-5 py-2 font-mono text-xs text-muted-foreground">{p.type}</td>
                      <td className="px-5 py-2">{p.required ? <span className="text-xs text-destructive">required</span> : <span className="text-xs text-muted-foreground">optional</span>}</td>
                      <td className="px-5 py-2 text-xs text-muted-foreground">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </section>

      {/* Code Examples */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Code Examples</h2>
        {(["curl", "python", "node"] as const).map((lang) => (
          <div key={lang} className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-2.5">
              <Badge variant="secondary">{lang}</Badge>
            </div>
            <pre className="overflow-x-auto p-5 text-xs font-mono text-foreground leading-relaxed">
              {codeExamples[lang]}
            </pre>
          </div>
        ))}
      </section>
    </div>
  );
}
