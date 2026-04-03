# WIP — PhantomRelay SaaS

## Fase actual: `xp` — Implementación en curso

## Estado real del proyecto

### Completado

**Backend (NestJS + Prisma)**
- [x] Monorepo pnpm + Turborepo
- [x] NestJS API con global prefix `/api`
- [x] Prisma schema completo (User, ApiKey, Scraper, Schedule, Run, ProxyPool, Proxy, ScraperWebhook, Notification, Plan, UsageRecord)
- [x] Docker Compose (postgres + redis + api + web)
- [x] Auth module: email/password + JWT + Google OAuth + GitHub OAuth
- [x] Scrapers CRUD
- [x] Runs: ejecución, historial, stats
- [x] Schedules: BullMQ recurring jobs
- [x] Billing: Stripe checkout + portal + webhooks
- [x] Notifications: CRUD + mark-read + unread count
- [x] Monitoring: fleet stats + health
- [x] Proxies: CRUD de pools + proxies
- [x] ApiKeys: crear + revocar
- [x] SSE events (relay execution)
- [x] Global interceptors: LoggingInterceptor, TransformInterceptor, HttpExceptionFilter
- [x] CI/CD GitHub Actions

**Frontend (Astro 5 SSR + React 19)**
- [x] Astro SSR con node adapter (standalone), i18n en/es
- [x] Design system "PhantomRelay Notion" definido en DESIGN.md
- [x] shadcn/ui + Tailwind CSS 4
- [x] Landing page (index.astro)
- [x] Auth pages: login, signup, onboarding
- [x] Dashboard: overview, scrapers, runs, monitoring, proxies, alerts, billing, settings, api-docs
- [x] Typed API client (`api-client.ts`) con token management y envelope unwrap

**Shared**
- [x] Package `@phantomrelay-saas/shared` con tipos comunes

### Pendiente

**Backend**
- [ ] `GET /proxies/details` — endpoint de detalle agregado de pools (health stats, domain bans)
- [ ] Tests: auth controller (login 200/401, register 201/409, JWT guard 200/401)
- [ ] Tests: ampliar cobertura billing y relay
- [ ] Rate limiting por plan

**Frontend**
- [ ] Conectar dashboard pages al API real (actualmente con datos mock en algunos)
- [ ] Wizard de creación de scraper completo (steps: target → mode → actions → extraction → anti-detection → schedule → notifications → review)
- [ ] Run detail page

**Infra**
- [ ] Variables de entorno de producción documentadas
- [ ] Deploy script / Kubernetes manifests

## Design System

El design system está definido en `DESIGN.md`. Es "PhantomRelay Notion": Notion-inspired, minimal, content-first.
Tokens CSS mapeados a shadcn/ui en `globals.css`.

## Próximos pasos inmediatos

1. Implementar `GET /proxies/details` en el backend (proxy pool details con health aggregation)
2. Ampliar tests de auth (controller e2e: login válido/inválido, registro/duplicado, JWT guard)
3. Conectar páginas de dashboard al API real (proxies, monitoring)
