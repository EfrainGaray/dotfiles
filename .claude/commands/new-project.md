# /new-project

Crea la estructura completa de un nuevo proyecto adaptada al stack y fase.

## Flujo interactivo

Cuando el usuario ejecute este comando, pregunta en orden:

1. **Nombre del proyecto** — slug en kebab-case (ej: `mi-proyecto`)
2. **Stack principal** — opciones: `rust` | `go` | `python` | `node` | `typescript` | `flutter` | `mixed` | `ai`
3. **Fase inicial** — opciones: `xp` (default) | `solid` | `clean` | `hexagonal` | `ddd`
4. **¿Requiere Docker?** — default: no en `xp`, sí desde `solid`
5. **¿Requiere CI/CD?** — default: no en `xp`, sí desde `solid`

## Generación según respuestas

### Siempre genera:
- `CLAUDE.md` local con `PHASE: [fase]` declarada, stack, y reglas de la fase
- `README.md` base con nombre, descripción, stack y comandos de setup
- `.gitignore` apropiado al stack seleccionado

### Si requiere Docker (o fase >= solid):
- `Dockerfile` multi-stage adaptado al stack:
  - rust → `FROM rust:alpine AS builder` + `FROM scratch AS runner`
  - go → `FROM golang:alpine AS builder` + `FROM scratch AS runner`
  - python → `FROM python:slim AS builder` + `FROM python:slim AS runner`
  - node/typescript → `FROM node:alpine AS builder` + `FROM nginx:alpine AS runner`
  - flutter → `FROM ghcr.io/cirruslabs/flutter AS builder` + `FROM nginx:alpine AS runner`
  - mixed → multi-stage con un builder por stack
- `docker-compose.yml` con healthchecks en cada servicio
- `.dockerignore` estricto

### Si requiere CI/CD (o fase >= solid):
- `.github/workflows/ci.yml` adaptado al stack:
  - Lint + format
  - Tests
  - Dependency audit (cargo audit / npm audit / pip-audit / govulncheck)
  - Docker build si aplica
  - Image scan si Docker está habilitado

### Estructura de carpetas por stack:

**rust**: `src/main.rs`, `Cargo.toml`
**go**: `cmd/main.go`, `go.mod`, `internal/`
**python**: `src/__init__.py`, `src/main.py`, `requirements.txt`, `pyproject.toml`
**node/typescript**: `src/index.ts`, `package.json`, `tsconfig.json`
**flutter**: `lib/main.dart`, `pubspec.yaml`, `lib/{presentation,domain,data}/`
**mixed**: combina según stacks indicados
**ai**: `src/main.py`, `requirements.txt`, `workflows/`, `models/.gitkeep`

### Estructura de capas por fase:

**xp**: sin capas — archivos planos en `src/`
**solid**: `src/` con módulos separados por responsabilidad
**clean**: `src/{domain,application,infrastructure,presentation}/`
**hexagonal**: `src/{domain/{ports,model},infrastructure/{adapters},application/}`
**ddd**: `src/{bounded-contexts/{context-name}/{domain,application,infrastructure}}/`
