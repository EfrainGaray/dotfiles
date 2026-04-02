# /audit

Ejecuta auditoría de seguridad completa del proyecto.

## Procedimiento

1. Detecta el stack del proyecto (por archivos: Cargo.toml, package.json, go.mod, requirements.txt, pubspec.yaml)
2. Ejecuta herramientas de audit por stack detectado
3. Revisa Dockerfile y Docker Compose si existen
4. Revisa GitHub Actions si existen
5. Busca secrets expuestos
6. Genera reporte con severidad y remediación

## Auditoría por stack

### Rust
```bash
cargo audit
cargo clippy -- -D warnings
```

### Node/TypeScript
```bash
npm audit
npx eslint . --max-warnings 0
```

### Go
```bash
govulncheck ./...
golangci-lint run
```

### Python
```bash
pip-audit -r requirements.txt
ruff check .
```

### Flutter/Dart
```bash
flutter analyze
dart pub outdated
```

## Auditoría de Docker (si existe Dockerfile)

- [ ] Base image con versión exacta (no `latest`, no tags flotantes)
- [ ] Multi-stage build (builder separado de runner)
- [ ] Non-root user en imagen final (`USER` directive)
- [ ] Sin secrets en `ARG`, `ENV` o `COPY` de archivos sensibles
- [ ] `.dockerignore` presente y apropiado
- [ ] Healthcheck definido si es un servicio
- [ ] Sin herramientas de build en imagen final (gcc, make, etc.)

## Auditoría de GitHub Actions (si existe .github/workflows/)

- [ ] Actions de terceros con SHA pin (no tags)
- [ ] `permissions:` explícitos (no `write-all`)
- [ ] Secrets referenciados con `${{ secrets.X }}` (no hardcoded)
- [ ] Sin echo/print de variables que podrían contener secrets
- [ ] Checkout con `persist-credentials: false` si no necesita push
- [ ] Artifacts con retención limitada

## Detección de secrets

Buscar patrones en todo el código:
- API keys, tokens, passwords hardcodeados
- Archivos `.env` commiteados
- Claves privadas (SSH, SSL)
- Connection strings con credenciales
- AWS/GCP/Azure credentials

## Formato del reporte

```
## Security Audit — [nombre-proyecto]

### Stack detectado: [stacks]

### Critical (acción inmediata)
- [CVE/hallazgo] — [descripción] — [remediación]

### High (bloquea PR)
- [CVE/hallazgo] — [descripción] — [remediación]

### Medium (priorizar fix)
- [CVE/hallazgo] — [descripción] — [remediación]

### Low (documentar)
- [CVE/hallazgo] — [descripción] — [remediación]

### Docker Security
- [hallazgo] — [status: ✅ OK | ❌ FAIL] — [remediación si FAIL]

### GitHub Actions Security
- [hallazgo] — [status: ✅ OK | ❌ FAIL] — [remediación si FAIL]

### Secrets Scan
- [status: ✅ No secrets found | ❌ Secrets detected] — [detalles si detectados]

### Resumen
- Total vulnerabilidades: [N]
- Critical: [N] | High: [N] | Medium: [N] | Low: [N]
- Recomendación: [PASS | FAIL — no mergear hasta resolver Critical/High]
```
