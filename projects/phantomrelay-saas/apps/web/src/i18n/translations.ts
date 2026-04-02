export const translations = {
  en: {
    // Nav
    "nav.signin": "Sign in",
    "nav.getStarted": "Get started",

    // Landing Hero
    "hero.title1": "The only scraper with",
    "hero.title2": "Chrome-identical TLS",
    "hero.title3": "fingerprints",
    "hero.subtitle": "BoringSSL native JA4 fingerprinting, 11 stealth patches, behavioral simulation with Bezier curves and Markov chains. From 10ms HTTP to 30s full human emulation.",
    "hero.cta": "Start for free",
    "hero.secondary": "See how it works",
    "hero.badge": "Only relay with native JA4 + MCP for Claude",

    // Landing Stats
    "stats.modes": "Evasion Modes",
    "stats.patches": "Stealth Patches",
    "stats.tests": "Passing Tests",
    "stats.latency": "HTTP Mode Latency",

    // Features
    "features.title": "Anti-bot evasion at every layer of the stack",
    "features.subtitle": "TLS, HTTP/2, DOM, JavaScript, and behavioral — not just headers.",

    "features.tls.title": "JA4 TLS Fingerprinting",
    "features.tls.desc": "Native BoringSSL addon for exact Chrome 124 JA4 match. Correct cipher suite order, extension order control, ALPN protocol ordering. The only implementation with JA4 extension control via NAPI-RS.",

    "features.h2.title": "HTTP/2 SETTINGS Spoofing",
    "features.h2.desc": "Exact Chrome values: HEADER_TABLE_SIZE 65536, INITIAL_WINDOW_SIZE 6MB, WINDOW_UPDATE 15663105. Correct frame ordering. Header priority matching.",

    "features.stealth.title": "11 Stealth Patches",
    "features.stealth.desc": "navigator.webdriver, chrome.runtime, WebGL vendor/renderer spoofing, canvas noise, AudioContext, CDP leak patching, iframe leaks, Permissions API, screen dimensions, Performance.now() jitter, languages array.",

    "features.behavioral.title": "Behavioral Simulation",
    "features.behavioral.desc": "Bezier curve mouse movement, Markov chain keyboard timing with realistic WPM variance, momentum-based scrolling. Not random waits — actual human-like patterns.",

    "features.profiles.title": "6-Month Aged Profiles",
    "features.profiles.desc": "Real SQLite browsing history, 6 persona archetypes (developer, shopper, student...), cookie accumulation, health scoring that decays on blocks and recovers on success.",

    "features.auto.title": "Auto Escalation",
    "features.auto.desc": "HTTP → Headless → Stealth → Human. Challenge detection for Cloudflare, DataDome, Imperva, PerimeterX, reCAPTCHA, hCaptcha. Confidence scoring triggers automatic mode upgrade.",

    "features.captcha.title": "CAPTCHA Detection & Solving",
    "features.captcha.desc": "Detects Turnstile, reCAPTCHA v2/v3, hCaptcha, DataDome, PerimeterX. Solvers: 2captcha, CapMonster, or Claude AI Vision. Auto site-key extraction.",

    "features.proxy.title": "Smart Proxy Rotation",
    "features.proxy.desc": "EMA health scoring (alpha=0.2), per-domain banning, 4 rotation strategies (best-score, round-robin, least-used, random). Geo-filtering by country/region/city + ASN tracking.",

    "features.extraction.title": "Full Extraction Suite",
    "features.extraction.desc": "HTML, plain text, CSS selector extraction (single/multiple, any attribute), JavaScript evaluation, full-page screenshots (PNG/JPEG), HAR 1.2 recording with all timings.",

    "features.actions.title": "Page Actions",
    "features.actions.desc": "11 action types: click (left/right/middle), type (with clearFirst), scroll, hover, select, wait (6 conditions), navigate, evaluate JS, screenshot. Chainable sequences.",

    "features.fleet.title": "Fleet Management",
    "features.fleet.desc": "Chrome session pooling, auto-port allocation, idle timeout recycling, capacity management. Local or remote Chrome (Docker/K8s). 5 lifecycle states with health tracking.",

    "features.mcp.title": "Claude MCP Native",
    "features.mcp.desc": "Built-in MCP server for Claude Desktop and Claude Code. Two tools: scrape_url and scrape_with_actions. Direct AI-to-scraper integration without API wrappers.",

    // Modes Section
    "modes.title": "5 escalating evasion modes",
    "modes.subtitle": "Each mode adds anti-detection layers. Auto mode escalates through all of them.",
    "modes.http.name": "HTTP",
    "modes.http.latency": "10-50ms",
    "modes.http.desc": "TLS fingerprinting (JA4), HTTP/2 SETTINGS spoofing, header order matching. Challenge detection before escalation.",
    "modes.headless.name": "Headless",
    "modes.headless.latency": "200ms-2s",
    "modes.headless.desc": "Chrome --headless=new with 11 stealth patches. navigator.webdriver, WebGL, canvas, AudioContext, CDP leaks all patched.",
    "modes.stealth.name": "Stealth",
    "modes.stealth.latency": "2-15s",
    "modes.stealth.desc": "All of Headless plus Bezier mouse curves, Markov keyboard timing, momentum scrolling. Real behavioral patterns.",
    "modes.human.name": "Human",
    "modes.human.latency": "5-30s",
    "modes.human.desc": "All of Stealth plus 6-month aged profiles, proxy rotation with EMA scoring, random dwell times. Maximum evasion.",
    "modes.auto.name": "Auto",
    "modes.auto.latency": "Smart",
    "modes.auto.desc": "Starts at HTTP, escalates on detection. Cloudflare, DataDome, Imperva, PerimeterX — auto-detected and auto-bypassed.",

    // Pricing
    "pricing.title": "Simple, transparent pricing",
    "pricing.subtitle": "Start free. Scale as you grow. No hidden fees.",
    "pricing.free": "Free",
    "pricing.free.price": "$0",
    "pricing.free.period": "forever",
    "pricing.free.cta": "Get started",
    "pricing.pro": "Pro",
    "pricing.pro.popular": "Popular",
    "pricing.pro.price": "$49",
    "pricing.pro.period": "per month",
    "pricing.pro.cta": "Start free trial",
    "pricing.enterprise": "Enterprise",
    "pricing.enterprise.price": "$199",
    "pricing.enterprise.period": "per month",
    "pricing.enterprise.cta": "Contact sales",
    "pricing.requests": "requests/month",
    "pricing.scrapers": "scrapers",
    "pricing.concurrent": "concurrent instance",
    "pricing.concurrents": "concurrent instances",
    "pricing.unlimited": "Unlimited scrapers",

    // Tech Stack
    "tech.title": "Built for production",
    "tech.subtitle": "Not a toy. 732 tests. Strict TypeScript. CI/CD with stealth verification gate.",
    "tech.tests": "732 passing tests across 12 packages",
    "tech.typescript": "Strict TypeScript — zero any",
    "tech.ci": "CI/CD: lint, test, type-check, audit, SAST, Docker, stealth verification",
    "tech.metrics": "Prometheus metrics + Grafana dashboard",
    "tech.docker": "Docker multi-stage, multi-arch (amd64 + arm64)",
    "tech.logging": "Structured logging (Pino) with child loggers per module",

    // Footer
    "footer.rights": "All rights reserved.",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy",

    // Auth
    "auth.welcomeBack": "Welcome back",
    "auth.signinSubtitle": "Sign in to your account to continue",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.signin": "Sign in",
    "auth.orContinue": "or continue with",
    "auth.noAccount": "Don't have an account?",
    "auth.signup": "Sign up",
    "auth.createAccount": "Create your account",
    "auth.signupSubtitle": "Start scraping in minutes. Free plan includes 500 requests/month.",
    "auth.name": "Name",
    "auth.namePlaceholder": "Your name",
    "auth.createPassword": "Create a password",
    "auth.minChars": "Minimum 8 characters",
    "auth.terms": "I agree to the",
    "auth.termsLink": "Terms of Service",
    "auth.and": "and",
    "auth.privacyLink": "Privacy Policy",
    "auth.createBtn": "Create account",
    "auth.hasAccount": "Already have an account?",

    // Brand
    "brand.tagline1": "Web scraping infrastructure",
    "brand.tagline2": "that defeats anti-bot",
    "brand.tagline3": "at every level.",
    "brand.taglineSub": "From TLS fingerprinting to behavioral simulation.",
    "brand.signupTagline1": "Configure, run, and monitor",
    "brand.signupTagline2": "web scrapers with",
    "brand.signupTagline3": "zero detection.",
    "brand.signupTaglineSub": "5 evasion modes. Smart escalation. Scheduled runs.",

    // Dashboard
    "dash.overview": "System Overview",
    "dash.overviewSub": "Real-time status of your extraction infrastructure",
    "dash.totalScrapers": "Total Scrapers",
    "dash.successRate": "Success Rate",
    "dash.activeFleet": "Active Fleet",
    "dash.avgLatency": "Avg Latency",
    "dash.monthlyUsage": "Monthly Usage",
    "dash.requests": "requests",
    "dash.used": "used",
    "dash.resetsIn": "resets in",
    "dash.days": "days",
    "dash.recentRuns": "Recent Runs",
    "dash.fleetStatus": "Fleet Status",
    "dash.status": "Status",
    "dash.name": "Name",
    "dash.mode": "Mode",
    "dash.latency": "Latency",
    "dash.date": "Date",
    "dash.ready": "Ready",
    "dash.busy": "Busy",
    "dash.dead": "Dead",
    "dash.capacity": "Capacity",

    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.scrapers": "Scrapers",
    "sidebar.runHistory": "Run History",
    "sidebar.monitoring": "Monitoring",
    "sidebar.proxies": "Proxies",
    "sidebar.alerts": "Alerts",
    "sidebar.billing": "Billing",
    "sidebar.settings": "Settings",
    "sidebar.apiDocs": "API Docs",
  },

  es: {
    // Nav
    "nav.signin": "Iniciar sesión",
    "nav.getStarted": "Comenzar",

    // Landing Hero
    "hero.title1": "El único scraper con",
    "hero.title2": "fingerprints TLS",
    "hero.title3": "idénticos a Chrome",
    "hero.subtitle": "Fingerprinting JA4 nativo con BoringSSL, 11 parches stealth, simulación de comportamiento con curvas Bezier y cadenas de Markov. Desde 10ms en HTTP hasta 30s en emulación humana completa.",
    "hero.cta": "Comenzar gratis",
    "hero.secondary": "Ver cómo funciona",
    "hero.badge": "Único relay con JA4 nativo + MCP para Claude",

    // Landing Stats
    "stats.modes": "Modos de Evasión",
    "stats.patches": "Parches Stealth",
    "stats.tests": "Tests Pasando",
    "stats.latency": "Latencia Modo HTTP",

    // Features
    "features.title": "Evasión anti-bot en cada capa del stack",
    "features.subtitle": "TLS, HTTP/2, DOM, JavaScript y comportamiento — no solo headers.",

    "features.tls.title": "Fingerprinting TLS JA4",
    "features.tls.desc": "Addon nativo BoringSSL para match exacto con Chrome 124 JA4. Orden correcto de cipher suites, control de orden de extensiones, ordenamiento de protocolo ALPN. La única implementación con control de extensiones JA4 vía NAPI-RS.",

    "features.h2.title": "Spoofing de SETTINGS HTTP/2",
    "features.h2.desc": "Valores exactos de Chrome: HEADER_TABLE_SIZE 65536, INITIAL_WINDOW_SIZE 6MB, WINDOW_UPDATE 15663105. Orden correcto de frames. Header priority matching.",

    "features.stealth.title": "11 Parches Stealth",
    "features.stealth.desc": "navigator.webdriver, chrome.runtime, spoofing de WebGL vendor/renderer, ruido en canvas, AudioContext, parcheado de leaks CDP, iframes, Permissions API, dimensiones de pantalla, jitter en Performance.now(), array de idiomas.",

    "features.behavioral.title": "Simulación de Comportamiento",
    "features.behavioral.desc": "Movimiento de mouse con curvas Bezier, timing de teclado con cadenas de Markov y varianza realista de WPM, scroll basado en momentum. No waits random — patrones realmente humanos.",

    "features.profiles.title": "Perfiles Envejecidos de 6 Meses",
    "features.profiles.desc": "Historial de navegación real en SQLite, 6 arquetipos de persona (developer, shopper, estudiante...), acumulación de cookies, health scoring que decae con bloqueos y se recupera con éxitos.",

    "features.auto.title": "Escalación Automática",
    "features.auto.desc": "HTTP → Headless → Stealth → Human. Detección de challenges de Cloudflare, DataDome, Imperva, PerimeterX, reCAPTCHA, hCaptcha. Scoring de confianza gatilla upgrade automático de modo.",

    "features.captcha.title": "Detección y Resolución de CAPTCHA",
    "features.captcha.desc": "Detecta Turnstile, reCAPTCHA v2/v3, hCaptcha, DataDome, PerimeterX. Solvers: 2captcha, CapMonster o Claude AI Vision. Extracción automática de site-key.",

    "features.proxy.title": "Rotación Inteligente de Proxies",
    "features.proxy.desc": "Health scoring EMA (alpha=0.2), banning por dominio, 4 estrategias de rotación (best-score, round-robin, least-used, random). Filtrado geo por país/región/ciudad + tracking de ASN.",

    "features.extraction.title": "Suite Completa de Extracción",
    "features.extraction.desc": "HTML, texto plano, extracción por CSS selector (simple/múltiple, cualquier atributo), evaluación JavaScript, screenshots full-page (PNG/JPEG), grabación HAR 1.2 con todos los timings.",

    "features.actions.title": "Acciones de Página",
    "features.actions.desc": "11 tipos de acción: click (izq/der/medio), type (con clearFirst), scroll, hover, select, wait (6 condiciones), navigate, evaluar JS, screenshot. Secuencias encadenables.",

    "features.fleet.title": "Gestión de Flota",
    "features.fleet.desc": "Pooling de sesiones Chrome, asignación automática de puertos, reciclaje por timeout ocioso, gestión de capacidad. Chrome local o remoto (Docker/K8s). 5 estados de ciclo de vida con health tracking.",

    "features.mcp.title": "MCP Nativo para Claude",
    "features.mcp.desc": "Servidor MCP integrado para Claude Desktop y Claude Code. Dos herramientas: scrape_url y scrape_with_actions. Integración directa AI-a-scraper sin wrappers de API.",

    // Modes Section
    "modes.title": "5 modos de evasión escalables",
    "modes.subtitle": "Cada modo añade capas de anti-detección. El modo Auto escala por todos ellos.",
    "modes.http.name": "HTTP",
    "modes.http.latency": "10-50ms",
    "modes.http.desc": "Fingerprinting TLS (JA4), spoofing de SETTINGS HTTP/2, matching de orden de headers. Detección de challenges antes de escalar.",
    "modes.headless.name": "Headless",
    "modes.headless.latency": "200ms-2s",
    "modes.headless.desc": "Chrome --headless=new con 11 parches stealth. navigator.webdriver, WebGL, canvas, AudioContext, leaks CDP todos parcheados.",
    "modes.stealth.name": "Stealth",
    "modes.stealth.latency": "2-15s",
    "modes.stealth.desc": "Todo lo de Headless más curvas Bezier para mouse, timing Markov para teclado, scroll con momentum. Patrones de comportamiento reales.",
    "modes.human.name": "Human",
    "modes.human.latency": "5-30s",
    "modes.human.desc": "Todo lo de Stealth más perfiles envejecidos de 6 meses, rotación de proxies con scoring EMA, tiempos de espera aleatorios. Máxima evasión.",
    "modes.auto.name": "Auto",
    "modes.auto.latency": "Inteligente",
    "modes.auto.desc": "Comienza en HTTP, escala al detectar bloqueos. Cloudflare, DataDome, Imperva, PerimeterX — auto-detectados y auto-bypasseados.",

    // Pricing
    "pricing.title": "Precios simples y transparentes",
    "pricing.subtitle": "Comienza gratis. Escala a tu ritmo. Sin costos ocultos.",
    "pricing.free": "Gratis",
    "pricing.free.price": "$0",
    "pricing.free.period": "para siempre",
    "pricing.free.cta": "Comenzar",
    "pricing.pro": "Pro",
    "pricing.pro.popular": "Popular",
    "pricing.pro.price": "$49",
    "pricing.pro.period": "por mes",
    "pricing.pro.cta": "Prueba gratuita",
    "pricing.enterprise": "Enterprise",
    "pricing.enterprise.price": "$199",
    "pricing.enterprise.period": "por mes",
    "pricing.enterprise.cta": "Contactar ventas",
    "pricing.requests": "requests/mes",
    "pricing.scrapers": "scrapers",
    "pricing.concurrent": "instancia concurrente",
    "pricing.concurrents": "instancias concurrentes",
    "pricing.unlimited": "Scrapers ilimitados",

    // Tech Stack
    "tech.title": "Construido para producción",
    "tech.subtitle": "No es un juguete. 732 tests. TypeScript estricto. CI/CD con gate de verificación stealth.",
    "tech.tests": "732 tests pasando en 12 paquetes",
    "tech.typescript": "TypeScript estricto — cero any",
    "tech.ci": "CI/CD: lint, test, type-check, audit, SAST, Docker, verificación stealth",
    "tech.metrics": "Métricas Prometheus + dashboard Grafana",
    "tech.docker": "Docker multi-stage, multi-arch (amd64 + arm64)",
    "tech.logging": "Logging estructurado (Pino) con child loggers por módulo",

    // Footer
    "footer.rights": "Todos los derechos reservados.",
    "footer.terms": "Términos",
    "footer.privacy": "Privacidad",

    // Auth
    "auth.welcomeBack": "Bienvenido de vuelta",
    "auth.signinSubtitle": "Inicia sesión en tu cuenta para continuar",
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.forgotPassword": "¿Olvidaste tu contraseña?",
    "auth.signin": "Iniciar sesión",
    "auth.orContinue": "o continúa con",
    "auth.noAccount": "¿No tienes cuenta?",
    "auth.signup": "Regístrate",
    "auth.createAccount": "Crea tu cuenta",
    "auth.signupSubtitle": "Comienza a scrapear en minutos. El plan gratis incluye 500 requests/mes.",
    "auth.name": "Nombre",
    "auth.namePlaceholder": "Tu nombre",
    "auth.createPassword": "Crea una contraseña",
    "auth.minChars": "Mínimo 8 caracteres",
    "auth.terms": "Acepto los",
    "auth.termsLink": "Términos de Servicio",
    "auth.and": "y la",
    "auth.privacyLink": "Política de Privacidad",
    "auth.createBtn": "Crear cuenta",
    "auth.hasAccount": "¿Ya tienes cuenta?",

    // Brand
    "brand.tagline1": "Infraestructura de web scraping",
    "brand.tagline2": "que derrota al anti-bot",
    "brand.tagline3": "en cada nivel.",
    "brand.taglineSub": "Desde fingerprinting TLS hasta simulación de comportamiento.",
    "brand.signupTagline1": "Configura, ejecuta y monitorea",
    "brand.signupTagline2": "web scrapers con",
    "brand.signupTagline3": "cero detección.",
    "brand.signupTaglineSub": "5 modos de evasión. Escalación inteligente. Ejecuciones programadas.",

    // Dashboard
    "dash.overview": "Vista General",
    "dash.overviewSub": "Estado en tiempo real de tu infraestructura de extracción",
    "dash.totalScrapers": "Scrapers Totales",
    "dash.successRate": "Tasa de Éxito",
    "dash.activeFleet": "Flota Activa",
    "dash.avgLatency": "Latencia Promedio",
    "dash.monthlyUsage": "Uso Mensual",
    "dash.requests": "requests",
    "dash.used": "usado",
    "dash.resetsIn": "se reinicia en",
    "dash.days": "días",
    "dash.recentRuns": "Ejecuciones Recientes",
    "dash.fleetStatus": "Estado de Flota",
    "dash.status": "Estado",
    "dash.name": "Nombre",
    "dash.mode": "Modo",
    "dash.latency": "Latencia",
    "dash.date": "Fecha",
    "dash.ready": "Listo",
    "dash.busy": "Ocupado",
    "dash.dead": "Caído",
    "dash.capacity": "Capacidad",

    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.scrapers": "Scrapers",
    "sidebar.runHistory": "Historial",
    "sidebar.monitoring": "Monitoreo",
    "sidebar.proxies": "Proxies",
    "sidebar.alerts": "Alertas",
    "sidebar.billing": "Facturación",
    "sidebar.settings": "Configuración",
    "sidebar.apiDocs": "API Docs",
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)["en"];

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations.en[key] || key;
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split("/");
  if (lang === "es") return "es";
  return "en";
}

export function getLocalizedPath(path: string, locale: Locale): string {
  if (locale === "en") return path;
  return `/${locale}${path}`;
}
