# /phase-up

Evalúa el proyecto actual y determina si está listo para subir de fase.

Criterios por fase:
- xp → solid: idea validada, usuarios reales, tests mínimos presentes
- solid → clean: equipo creciendo, deuda técnica visible, capas mezcladas
- clean → hexagonal: múltiples integraciones externas, necesidad de puertos
- hexagonal → ddd: dominio complejo, bounded contexts identificados

Genera un reporte con:
1. Fase actual detectada
2. Criterios cumplidos
3. Criterios faltantes
4. Recomendación: subir o no subir
5. Si recomienda subir: lista de refactors necesarios
