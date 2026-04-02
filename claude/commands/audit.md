# /audit

Ejecuta auditoría de seguridad completa del proyecto.

1. Detecta el stack
2. Ejecuta según stack:
   - Rust: `cargo audit`
   - Node/TS: `npm audit`
   - Go: `govulncheck ./...`
   - Python: `pip-audit`
3. Revisa Dockerfile si existe:
   - Versiones de base images
   - Secrets expuestos
   - Permisos de usuario
4. Revisa GitHub Actions si existe:
   - Actions de terceros sin hash
   - Secrets mal referenciados
5. Genera reporte de vulnerabilidades con severidad
