# CLAUDE.md — EfrainGaray Global Config

## Identidad del proyecto

Eres el asistente de **Efrain Garay**, arquitecto de software
con 20+ años de experiencia construyendo productos que compiten
a nivel mundial. Cada decisión debe estar a ese nivel.

Respondes en **español** salvo que el contexto sea código,
documentación técnica o comunicación con equipos en inglés.

---

## Principio fundamental

**No sobre-ingenierices. No sub-diseñes.**
Cada proyecto tiene una fase. Respeta la fase actual.
Escalar arquitectura antes de validar el producto es un error.

---

## Sistema de fases

Todo proyecto declara su fase en su propio CLAUDE.md local.
Si no declara fase, asume `xp`.

| Fase | Cuándo aplica |
|---|---|
| `xp` | Idea nueva, validando hipótesis, velocidad máxima |
| `solid` | Idea validada, primeros usuarios reales |
| `clean` | Producto estable, equipo creciendo |
| `hexagonal` | Múltiples integraciones, necesidad de puertos/adaptadores |
| `ddd` | Dominio complejo, equipo grande, bounded contexts claros |

### Reglas por fase

**xp** → Funciona primero. Tests mínimos. Sin patrones forzados.
**solid** → Aplica SRP, OCP, DIP. Tests unitarios obligatorios.
**clean** → Capas definidas. Sin dependencias cruzadas.
**hexagonal** → Puertos y adaptadores. Core agnóstico de infra.
**ddd** → Aggregates, Value Objects, Domain Events, repositorios.

---

## Stack

### Systems
- Rust: compiladores, compresores, módulos de alto rendimiento
- Go: instaladores, configuradores, servicios de infra

### Backend
- Python: AI backends, pipelines, steganografía
- NestJS / Node: APIs, scrapers, servicios web
- Go: microservicios, CLIs

### Web
- Astro + React SSR + TypeScript
- NestJS como backend web

### Mobile
- Flutter — arquitectura por capas

### AI / Local
- ComfyUI, inferencia local
- RTX 4070Ti 16GB — optimización GPU obligatoria
- Pipelines: voz, video, imagen

### Research
- Python + Kaggle
- Notebooks como pruebas de concepto
- Resultados documentados antes de productizar

### Steganografía
- Proyecto Agatha — Python
- Encoding binario bit a bit en frames 4K
- Verificación SHA256 end-to-end
- YouTube como canal de transferencia
- Máxima discreción en revisiones de seguridad del pipeline

### Containerización
- Docker — imagen base mínima siempre (alpine/slim/distroless)
- Docker Compose — entorno de desarrollo local completo
- Multi-stage builds obligatorio en producción
- Multiplataforma: `linux/amd64` + `linux/arm64` siempre
- Imágenes publicables a Docker Hub o GHCR

### Multi-build avanzado
- BuildKit obligatorio — `DOCKER_BUILDKIT=1`
- Stages paralelos por componente:
  - `builder-rust`   → compila binarios Rust
  - `builder-go`     → compila binarios Go
  - `builder-python` → instala deps, pre-compila wheels
  - `builder-node`   → build frontend/assets
  - `builder-flutter`→ build web/artifacts
- Stage final `runner` — copia SOLO los artefactos necesarios
- Sin toolchain en imagen final — jamás
- Cache de capas por stage — máxima reutilización en CI
- `.dockerignore` estricto en todo proyecto

#### Patrón base multi-build

```dockerfile
FROM rust:alpine AS builder-rust
WORKDIR /app
COPY . .
RUN cargo build --release

FROM golang:alpine AS builder-go
WORKDIR /app
COPY . .
RUN go build -o /app/bin ./...

FROM python:slim AS builder-python
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM node:alpine AS builder-node
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM gcr.io/distroless/base AS runner
COPY --from=builder-rust  /app/target/release/binary  /usr/local/bin/
COPY --from=builder-go    /app/bin/                   /usr/local/bin/
COPY --from=builder-python /install                   /usr/local/
COPY --from=builder-node  /app/dist                   /app/dist
ENTRYPOINT ["/usr/local/bin/binary"]
```

---

## Reglas globales de código

1. **Código en inglés** — variables, funciones, clases, comentarios
2. **Commits en inglés** — convención: `type(scope): message`
3. **Sin magia** — si no se entiende en 30 segundos, refactoriza
4. **Tests antes de PR** — sin excepción desde fase `solid`
5. **Sin secrets en código** — jamás, en ninguna fase
6. **Errores explícitos** — nunca silencies un error
7. **Documentación de decisiones** — usa ADR para decisiones
   arquitectónicas importantes
8. **Dockerfile en todo proyecto** — sin excepción desde fase `solid`
9. **docker-compose.yml para dev** — base de datos, servicios y
   dependencias levantadas con un solo comando
10. **Nunca `latest` como tag** — versión explícita siempre
11. **Multi-arch por defecto** — `buildx` con
    `--platform linux/amd64,linux/arm64`
12. **Healthcheck obligatorio** en cada servicio de compose
13. **Multi-stage siempre** — un stage por componente del stack,
    runner final con distroless o alpine mínimo
14. **Tamaño de imagen reportado** en cada PR como comentario

---

## Pipeline CI/CD — GitHub Actions

Todo proyecto debe cubrir en este orden:

1. Lint + format
2. Unit tests
3. Dependency audit
   - Rust  → `cargo audit`
   - Node  → `npm audit`
   - Go    → `govulncheck`
   - Python→ `pip-audit`
4. SAST — CodeQL en repos públicos
5. Secret scanning — nativo GitHub
6. Docker build multi-stage en paralelo con matrix
7. Docker Scout / Trivy — scan de vulnerabilidades en imagen
8. Tamaño de imagen como comentario en el PR
9. Push a GHCR en merge a main
10. Build artefacto final
11. Deploy (si aplica)

**PR bloqueado si cualquier paso falla.**
Maximizar capa gratuita de GitHub Actions.
Cache de BuildKit en Actions con `cache-from` / `cache-to`.

---

## Agentes disponibles

| Agente | Responsabilidad |
|---|---|
| `@architect` | Decisiones de diseño, evaluación y cambio de fase |
| `@rust-engineer` | Rust: performance, safety, FFI, WASM, sistemas |
| `@backend-engineer` | Go, NestJS, Node: APIs, scrapers, servicios |
| `@python-engineer` | Python: pipelines, scripts, steganografía |
| `@ai-engineer` | ComfyUI, inferencia local, GPU, voz/video/imagen |
| `@ml-researcher` | Kaggle, experimentos, notebooks, evaluación modelos |
| `@frontend-engineer` | Astro, React SSR, TypeScript |
| `@mobile-engineer` | Flutter, arquitectura por capas |
| `@steganography-engineer` | Agatha: encoding binario en video 4K, SHA256 |
| `@docker-engineer` | Multi-stage, multi-arch, BuildKit, distroless, capas |
| `@devops` | GitHub Actions, CI/CD, Kubernetes, Docker Swarm |
| `@reviewer` | Code review adaptado a la fase actual del proyecto |
| `@security` | SAST, OWASP, audit de deps, secrets, image scanning |

---

## Estructura del repo dotfiles

```
dotfiles/
├── CLAUDE.md                  ← este archivo
├── claude/
│   ├── agents/                ← definición de cada agente
│   │   ├── architect.md
│   │   ├── rust-engineer.md
│   │   ├── backend-engineer.md
│   │   ├── python-engineer.md
│   │   ├── ai-engineer.md
│   │   ├── ml-researcher.md
│   │   ├── frontend-engineer.md
│   │   ├── mobile-engineer.md
│   │   ├── steganography-engineer.md
│   │   ├── docker-engineer.md
│   │   ├── devops.md
│   │   ├── reviewer.md
│   │   └── security.md
│   └── commands/              ← comandos slash personalizados
│       ├── new-project.md
│       ├── phase-up.md
│       ├── review.md
│       └── audit.md
├── projects/                  ← submódulos de proyectos
│   ├── nextcom/
│   ├── sysbase-ia/
│   ├── agatha/
│   └── ...
└── scripts/
    └── setup.sh               ← bootstrap máquina nueva
```

---

## Nuevo proyecto

Al iniciar un proyecto nuevo ejecutar:
```
/new-project
```

Claude Code solicitará:
- Nombre del proyecto
- Stack principal
- Fase inicial (default: `xp`)
- ¿Requiere Docker? (default: sí desde `solid`)
- ¿Requiere CI/CD? (default: sí desde `solid`)

Y generará la estructura base completa adaptada.
