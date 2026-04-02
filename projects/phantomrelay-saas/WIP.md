# WIP — PhantomRelay SaaS

## Fase actual: Diseño UI (Stitch) → luego Sprint 1 implementación

## Stitch Config
- **Proyecto v2 (limpio):** `16243053443926593898`
- **Design System:** "PhantomRelay Notion" (`assets/16291211105068034930`)
- **MCP:** HTTP directo `stitch.googleapis.com/mcp` (nativo en Claude Code)
- **URL:** https://stitch.withgoogle.com/project/16243053443926593898

## Generación de pantallas (4 variantes cada una)

Cada pantalla se genera en: **dark desktop, light desktop, dark mobile, light mobile**

| # | Pantalla | Dark Desktop | Light Desktop | Dark Mobile | Light Mobile |
|---|---|---|---|---|---|
| 1 | Login | [ ] | [ ] | [ ] | [ ] |
| 2 | Signup | [ ] | [ ] | [ ] | [ ] |
| 3 | Onboarding | [ ] | [ ] | [ ] | [ ] |
| 4 | Dashboard | [ ] | [ ] | [ ] | [ ] |
| 5 | Scrapers List | [ ] | [ ] | [ ] | [ ] |
| 6 | Wizard: Target | [ ] | [ ] | [ ] | [ ] |
| 7 | Wizard: Mode | [ ] | [ ] | [ ] | [ ] |
| 8 | Wizard: Actions | [ ] | [ ] | [ ] | [ ] |
| 9 | Wizard: Extraction | [ ] | [ ] | [ ] | [ ] |
| 10 | Wizard: Anti-Detection | [ ] | [ ] | [ ] | [ ] |
| 11 | Wizard: Schedule | [ ] | [ ] | [ ] | [ ] |
| 12 | Wizard: Notifications | [ ] | [ ] | [ ] | [ ] |
| 13 | Wizard: Review | [ ] | [ ] | [ ] | [ ] |
| 14 | Run History | [ ] | [ ] | [ ] | [ ] |
| 15 | Run Detail | [ ] | [ ] | [ ] | [ ] |
| 16 | Monitoring | [ ] | [ ] | [ ] | [ ] |
| 17 | Proxies | [ ] | [ ] | [ ] | [ ] |
| 18 | Alerts | [ ] | [ ] | [ ] | [ ] |
| 19 | Billing | [ ] | [ ] | [ ] | [ ] |
| 20 | Settings | [ ] | [ ] | [ ] | [ ] |
| 21 | API Docs | [ ] | [ ] | [ ] | [ ] |
| 22 | Landing | [ ] | [ ] | [ ] | [ ] |

**Total: 22 pantallas × 4 variantes = 88 screens**

## Después de diseño → Sprint 1: Foundation

- [ ] 1. Scaffold monorepo (pnpm workspace + turbo + tsconfig)
- [x] 2. Astro 5 + React 19 + Tailwind + shadcn/ui setup (parcial, actualizar tokens)
- [ ] 3. NestJS with Prisma + PostgreSQL schema
- [x] 4. Shared types package (done)
- [ ] 5. Docker compose (postgres + redis + api + web)
- [ ] 6. Auth module (email/password + JWT)
- [ ] 7. Landing page (static Astro)
- [ ] 8. Login/signup pages
- [ ] 9. Dashboard layout + overview page
- [ ] 10. CLAUDE.md + README.md + .gitignore

## Sprint 2: Core Scraper (pending)
## Sprint 3: Scheduling + History (pending)
## Sprint 4: Monetization + Polish (pending)

## Notas
- Design system "PhantomRelay Notion" tiene designMd completo (~4000 palabras)
- Cubre: colores dark/light, tipografía Inter, spacing 8px, layout, todos los componentes
- Las screens del proyecto v1 (18069814474819705735) quedan como referencia, no se usan
- Tokens CSS en globals.css deben actualizarse para matchear el design system nuevo
