# /phase-up

Evalúa el proyecto actual y determina si está listo para subir de fase.

## Procedimiento

1. Lee el `CLAUDE.md` local para detectar la fase actual (`PHASE:`)
2. Si no encuentra fase declarada, asume `xp`
3. Analiza el código contra los criterios de graduación
4. Genera un reporte estructurado

## Criterios de graduación por fase

### xp → solid
- [ ] Idea validada con usuarios reales o feedback concreto
- [ ] Tests mínimos presentes (al menos smoke tests)
- [ ] Sin secrets hardcodeados en el código
- [ ] Errores manejados explícitamente (no silenciados)
- [ ] Al menos un usuario además del autor ha usado el proyecto
- [ ] El proyecto tiene un propósito claro y definido

### solid → clean
- [ ] Equipo creciendo o múltiples contribuidores
- [ ] Deuda técnica visible: módulos con más de una responsabilidad
- [ ] Tests unitarios con coverage > 60%
- [ ] Capas mezcladas: lógica de negocio junto a infraestructura
- [ ] El proyecto necesita mantenimiento a largo plazo
- [ ] Dockerfile multi-stage funcional
- [ ] CI/CD pipeline operativo

### clean → hexagonal
- [ ] Múltiples integraciones externas (APIs, DBs, servicios)
- [ ] Necesidad de intercambiar adaptadores (ej: cambiar DB, cambiar API)
- [ ] Core de negocio estable que no debería depender de frameworks
- [ ] Tests del core imposibles sin levantar infraestructura
- [ ] Al menos 3 puertos/adaptadores identificables

### hexagonal → ddd
- [ ] Dominio complejo con reglas de negocio no triviales
- [ ] Bounded contexts identificados naturalmente (no forzados)
- [ ] Equipo grande que necesita trabajar en contextos independientes
- [ ] Ubiquitous language definido con stakeholders
- [ ] Aggregates con invariantes que deben protegerse

## Formato del reporte

```
## Phase-Up Report: [nombre-proyecto]

### Fase actual: [xp|solid|clean|hexagonal]
### Fase propuesta: [solid|clean|hexagonal|ddd]

### Criterios cumplidos
- ✅ [criterio]

### Criterios faltantes
- ❌ [criterio] — [qué falta específicamente]

### Recomendación: [SUBIR | NO SUBIR | SUBIR CON CONDICIONES]

### Refactors necesarios (si recomienda subir)
1. [refactor específico con archivos afectados]
2. [refactor específico con archivos afectados]
```
