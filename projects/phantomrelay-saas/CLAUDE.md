# CLAUDE.md — PhantomRelay SaaS

## Fase actual: `xp`

---

## What It Is

SaaS web application for PhantomRelay — a browser relay scraper that defeats anti-bot at TLS/HTTP2/behavioral levels. Users configure scrapers step-by-step via a wizard, execute them, schedule recurring runs, monitor fleet health, and pay by usage. The SaaS connects to a PhantomRelay engine instance as the scraping backend.

## Install

```bash
pnpm install
```

## Commands

**Run all (dev):**
```bash
pnpm dev
```

**Run web only:**
```bash
pnpm --filter @phantomrelay-saas/web dev
```

**Run API only:**
```bash
pnpm --filter @phantomrelay-saas/api dev
```

**Build all:**
```bash
pnpm build
```

**Prisma migrations:**
```bash
pnpm --filter @phantomrelay-saas/api prisma:migrate
```

**Docker dev:**
```bash
docker compose -f docker/docker-compose.yml up -d
```

## Environment Variables

```bash
# API
DATABASE_URL=postgresql://phantom:phantom@localhost:5432/phantomrelay_saas
REDIS_URL=redis://localhost:6379
PHANTOMRELAY_URL=http://localhost:3000
PHANTOMRELAY_API_KEY=
JWT_SECRET=
JWT_REFRESH_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
RESEND_API_KEY=

# Web
PUBLIC_API_URL=http://localhost:3001
```

## Architecture

Monorepo with pnpm workspaces + Turborepo.

| Package | Stack | Purpose |
|---|---|---|
| `apps/web` | Astro 5 SSR + React 19 + Tailwind + shadcn/ui | Frontend |
| `apps/api` | NestJS + Prisma + PostgreSQL + BullMQ | Backend |
| `packages/shared` | TypeScript | Shared types |

### Key patterns
- Landing pages are Astro SSG (zero JS)
- Dashboard uses React islands (client:load) only where interactivity is needed
- NestJS modules organized by feature (scrapers, runs, schedules, billing)
- Auth via JWT (15min access + 7d refresh httpOnly cookie)
- Real-time via SSE (not WebSocket)
- Scraper config stored as JSON in DB (phase xp — no normalization)
- Screenshots stored as URLs (Cloudflare R2), never base64 in DB

### Database
PostgreSQL via Prisma. Tables: User, ApiKey, Scraper, Schedule, Run, ProxyPool, Proxy, ScraperWebhook, Notification, Plan, UsageRecord.

## Stack

- **Frontend**: Astro 5, React 19, Tailwind CSS 4, shadcn/ui, Recharts, Lucide icons
- **Backend**: NestJS 11, Prisma 6, PostgreSQL 16, BullMQ 5, Redis 7
- **Auth**: Passport (JWT, Google, GitHub), bcrypt
- **Billing**: Stripe
- **Email**: Resend
- **Build**: pnpm, Turborepo
- **Container**: Docker multi-stage

## Development Rules (phase xp)

1. Speed over architecture — ship working features fast
2. No forced patterns — flat files in src/, NestJS modules are enough structure
3. Tests only for critical paths (auth, billing, run execution)
4. Commits: `type(scope): message` in English
5. No secrets in code — env vars only
6. Errors explicit — never silence
7. TypeScript strict — no `any`
