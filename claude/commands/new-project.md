# /new-project

Cuando ejecutes este comando:
1. Pregunta: nombre del proyecto
2. Pregunta: stack principal (rust/go/python/node/typescript/flutter/mixed)
3. Pregunta: fase inicial (default: xp)
4. Pregunta: ¿requiere Docker? (default: sí desde solid)
5. Pregunta: ¿requiere CI/CD? (default: sí desde solid)

Con las respuestas genera:
- Estructura de carpetas del proyecto
- CLAUDE.md local con PHASE declarada
- Dockerfile multi-stage si aplica
- docker-compose.yml si aplica
- .github/workflows/ci.yml si aplica
- README.md base
- .gitignore apropiado al stack
- .dockerignore si aplica
