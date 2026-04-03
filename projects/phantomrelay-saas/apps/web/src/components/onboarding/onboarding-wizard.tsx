import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getMe,
  createScraper,
  executeRun,
  getRun,
  type User,
  type Scraper,
  type Run,
} from "@/lib/api-client";
import type { Locale } from "@/i18n/translations";

// --- i18n ---

const texts = {
  en: {
    stepWelcome: "Welcome",
    stepCreate: "Create Scraper",
    stepRun: "Run It",
    welcomeTitle: "Welcome to PhantomRelay",
    welcomeHello: "Hello",
    welcomeDesc:
      "PhantomRelay is a web scraping infrastructure that defeats anti-bot at every level — TLS fingerprinting, HTTP/2 spoofing, behavioral simulation, and smart auto-escalation.",
    welcomeReady:
      "Let's set up your first scraper in under 2 minutes.",
    displayNameLabel: "Display name",
    getStarted: "Get Started",
    createTitle: "Create Your First Scraper",
    createDesc:
      "Give your scraper a name, a target URL, and pick an evasion mode.",
    scraperNameLabel: "Scraper name",
    scraperNamePlaceholder: "e.g. My First Scraper",
    targetUrlLabel: "Target URL",
    targetUrlPlaceholder: "https://example.com",
    modeLabel: "Evasion mode",
    modeHttpName: "HTTP",
    modeHttpDesc: "Fast TLS fingerprinting. 10-50ms latency.",
    modeHeadlessName: "Headless",
    modeHeadlessDesc: "Chrome + 11 stealth patches. 200ms-2s.",
    modeStealthName: "Stealth",
    modeStealthDesc: "Behavioral simulation. 2-15s.",
    modeHumanName: "Human",
    modeHumanDesc: "Aged profiles + proxy rotation. 5-30s.",
    modeAutoName: "Auto",
    modeAutoDesc: "Smart escalation. Starts HTTP, upgrades on detection.",
    createScraper: "Create Scraper",
    creating: "Creating...",
    back: "Back",
    runTitle: "Run It!",
    runDesc: "Your scraper is ready. Let's run it and see the results.",
    scraperCreated: "Scraper created",
    target: "Target",
    mode: "Mode",
    runNow: "Run Now",
    running: "Running...",
    runQueued: "Queued",
    runRunning: "Running",
    runSuccess: "Success",
    runFailed: "Failed",
    firstScrapeTitle: "Your first scrape is done!",
    firstScrapeDesc: "You can view the full results in your dashboard.",
    viewResults: "View Results",
    goToDashboard: "Go to Dashboard",
    skipToDashboard: "Skip to dashboard",
    errorGeneric: "Something went wrong. Please try again.",
  },
  es: {
    stepWelcome: "Bienvenida",
    stepCreate: "Crear Scraper",
    stepRun: "Ejecutar",
    welcomeTitle: "Bienvenido a PhantomRelay",
    welcomeHello: "Hola",
    welcomeDesc:
      "PhantomRelay es una infraestructura de web scraping que derrota al anti-bot en cada nivel — fingerprinting TLS, spoofing HTTP/2, simulacion de comportamiento y auto-escalacion inteligente.",
    welcomeReady:
      "Vamos a configurar tu primer scraper en menos de 2 minutos.",
    displayNameLabel: "Nombre para mostrar",
    getStarted: "Comenzar",
    createTitle: "Crea Tu Primer Scraper",
    createDesc:
      "Dale un nombre a tu scraper, una URL objetivo y elige un modo de evasion.",
    scraperNameLabel: "Nombre del scraper",
    scraperNamePlaceholder: "ej. Mi Primer Scraper",
    targetUrlLabel: "URL objetivo",
    targetUrlPlaceholder: "https://example.com",
    modeLabel: "Modo de evasion",
    modeHttpName: "HTTP",
    modeHttpDesc: "Fingerprinting TLS rapido. 10-50ms de latencia.",
    modeHeadlessName: "Headless",
    modeHeadlessDesc: "Chrome + 11 parches stealth. 200ms-2s.",
    modeStealthName: "Stealth",
    modeStealthDesc: "Simulacion de comportamiento. 2-15s.",
    modeHumanName: "Human",
    modeHumanDesc: "Perfiles envejecidos + rotacion de proxies. 5-30s.",
    modeAutoName: "Auto",
    modeAutoDesc: "Escalacion inteligente. Empieza en HTTP, sube al detectar bloqueos.",
    createScraper: "Crear Scraper",
    creating: "Creando...",
    back: "Volver",
    runTitle: "Ejecutalo!",
    runDesc: "Tu scraper esta listo. Ejecutalo y mira los resultados.",
    scraperCreated: "Scraper creado",
    target: "Objetivo",
    mode: "Modo",
    runNow: "Ejecutar Ahora",
    running: "Ejecutando...",
    runQueued: "En cola",
    runRunning: "Ejecutando",
    runSuccess: "Exitoso",
    runFailed: "Fallido",
    firstScrapeTitle: "Tu primer scrape esta listo!",
    firstScrapeDesc: "Puedes ver los resultados completos en tu dashboard.",
    viewResults: "Ver Resultados",
    goToDashboard: "Ir al Dashboard",
    skipToDashboard: "Ir al dashboard",
    errorGeneric: "Algo salio mal. Intenta de nuevo.",
  },
} as const;

type TextKey = keyof (typeof texts)["en"];

// --- Mode definitions ---

const MODES = [
  { id: "http", icon: "bolt" },
  { id: "headless", icon: "monitor" },
  { id: "stealth", icon: "shield" },
  { id: "human", icon: "user" },
  { id: "auto", icon: "zap" },
] as const;

type ModeId = (typeof MODES)[number]["id"];

const MODE_NAME_KEYS: Record<ModeId, TextKey> = {
  http: "modeHttpName",
  headless: "modeHeadlessName",
  stealth: "modeStealthName",
  human: "modeHumanName",
  auto: "modeAutoName",
};

const MODE_DESC_KEYS: Record<ModeId, TextKey> = {
  http: "modeHttpDesc",
  headless: "modeHeadlessDesc",
  stealth: "modeStealthDesc",
  human: "modeHumanDesc",
  auto: "modeAutoDesc",
};

// --- Simple SVG icons (inline to avoid extra deps) ---

function ModeIcon({ mode, className }: { mode: ModeId; className?: string }) {
  const c = className ?? "w-5 h-5";
  switch (mode) {
    case "http":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case "headless":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case "stealth":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "human":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "auto":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
  }
}

// --- Step Indicator ---

function StepIndicator({
  currentStep,
  labels,
}: {
  currentStep: number;
  labels: [string, string, string];
}) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto mb-8">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-xs whitespace-nowrap ${
                  isActive ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`h-px flex-1 mx-3 mt-[-1.25rem] ${
                  stepNum < currentStep ? "bg-primary/40" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Run status badge ---

function RunStatusBadge({ status, t }: { status: string; t: (k: TextKey) => string }) {
  const map: Record<string, { label: TextKey; cls: string }> = {
    queued: { label: "runQueued", cls: "bg-muted text-muted-foreground" },
    running: { label: "runRunning", cls: "bg-yellow-500/10 text-yellow-600" },
    success: { label: "runSuccess", cls: "bg-green-500/10 text-green-600" },
    failed: { label: "runFailed", cls: "bg-red-500/10 text-red-600" },
  };
  const entry = map[status] ?? map.queued;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.cls}`}>
      {status === "running" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
      )}
      {status === "success" && (
        <svg className="mr-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {t(entry.label)}
    </span>
  );
}

// --- Main component ---

interface OnboardingWizardProps {
  locale?: Locale;
}

export default function OnboardingWizard({ locale = "en" }: OnboardingWizardProps) {
  const lang = locale === "es" ? "es" : "en";
  const t = useCallback((key: TextKey) => texts[lang][key], [lang]);

  const dashboardPath = lang === "es" ? "/es/dashboard" : "/dashboard";

  const [step, setStep] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 2 state
  const [scraperName, setScraperName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedMode, setSelectedMode] = useState<ModeId>("auto");
  const [createdScraper, setCreatedScraper] = useState<Scraper | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Step 3 state
  const [run, setRun] = useState<Run | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load user on mount
  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        setDisplayName(u.name ?? "");
      })
      .catch(() => {
        // If not authenticated, redirect to login
        window.location.href = lang === "es" ? "/es/login" : "/login";
      })
      .finally(() => setLoading(false));
  }, [lang]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleCreateScraper = async () => {
    if (!scraperName.trim() || !targetUrl.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      const scraper = await createScraper({
        name: scraperName.trim(),
        targetUrl: targetUrl.trim(),
        mode: selectedMode,
      });
      setCreatedScraper(scraper);
      setStep(3);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setIsCreating(false);
    }
  };

  const handleRunScraper = async () => {
    if (!createdScraper) return;
    setIsRunning(true);
    setError(null);
    try {
      const newRun = await executeRun(createdScraper.id);
      setRun(newRun);

      // Poll for status
      pollingRef.current = setInterval(async () => {
        try {
          const updated = await getRun(newRun.id);
          setRun(updated);
          if (updated.status === "success" || updated.status === "failed") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = null;
            setIsRunning(false);
          }
        } catch {
          // Keep polling on transient errors
        }
      }, 2000);
    } catch {
      setError(t("errorGeneric"));
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isRunComplete = run?.status === "success" || run?.status === "failed";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <span className="text-lg font-semibold tracking-tight">
            Phantom<span className="text-primary">Relay</span>
          </span>
        </div>

        <StepIndicator
          currentStep={step}
          labels={[t("stepWelcome"), t("stepCreate"), t("stepRun")]}
        />

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        <Card className="p-6 sm:p-8">
          {/* --- Step 1: Welcome --- */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("welcomeTitle")}
                </h1>
                <p className="mt-1 text-muted-foreground">
                  {t("welcomeHello")}, {user?.name ?? ""}!
                </p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("welcomeDesc")}
              </p>

              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  {t("displayNameLabel")}
                </label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={user?.name ?? ""}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                {t("welcomeReady")}
              </p>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={dashboardPath}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("skipToDashboard")}
                </a>
                <Button size="lg" onClick={() => setStep(2)}>
                  {t("getStarted")}
                </Button>
              </div>
            </div>
          )}

          {/* --- Step 2: Create Scraper --- */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("createTitle")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("createDesc")}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="scraperName"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    {t("scraperNameLabel")}
                  </label>
                  <Input
                    id="scraperName"
                    value={scraperName}
                    onChange={(e) => setScraperName(e.target.value)}
                    placeholder={t("scraperNamePlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="targetUrl"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    {t("targetUrlLabel")}
                  </label>
                  <Input
                    id="targetUrl"
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder={t("targetUrlPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("modeLabel")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSelectedMode(mode.id)}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                          selectedMode === mode.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex-shrink-0 ${
                            selectedMode === mode.id
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <ModeIcon mode={mode.id} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium">
                            {t(MODE_NAME_KEYS[mode.id])}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {t(MODE_DESC_KEYS[mode.id])}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  {t("back")}
                </Button>
                <Button
                  size="lg"
                  onClick={handleCreateScraper}
                  disabled={!scraperName.trim() || !targetUrl.trim() || isCreating}
                >
                  {isCreating ? t("creating") : t("createScraper")}
                </Button>
              </div>
            </div>
          )}

          {/* --- Step 3: Run --- */}
          {step === 3 && createdScraper && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("runTitle")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("runDesc")}
                </p>
              </div>

              {/* Scraper summary */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t("scraperCreated")}
                  </span>
                  {run && <RunStatusBadge status={run.status} t={t} />}
                </div>
                <div className="text-sm font-medium">{createdScraper.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t("target")}: {createdScraper.targetUrl}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("mode")}: {createdScraper.mode}
                </div>
              </div>

              {/* Success state */}
              {run?.status === "success" && (
                <div className="rounded-lg border-2 border-green-500/30 bg-green-500/5 p-5 text-center space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold">{t("firstScrapeTitle")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("firstScrapeDesc")}
                  </p>
                  <div className="pt-2">
                    <a
                      href={`${dashboardPath}/runs`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {t("viewResults")}
                    </a>
                  </div>
                </div>
              )}

              {/* Failed state */}
              {run?.status === "failed" && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
                  {run.error ?? t("errorGeneric")}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <a
                  href={dashboardPath}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("skipToDashboard")}
                </a>
                {!run && (
                  <Button size="lg" onClick={handleRunScraper} disabled={isRunning}>
                    {isRunning ? t("running") : t("runNow")}
                  </Button>
                )}
                {isRunComplete && (
                  <Button size="lg" asChild>
                    <a href={dashboardPath}>{t("goToDashboard")}</a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
