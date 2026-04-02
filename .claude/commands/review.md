# /review

Ejecuta un code review completo adaptado a la fase del proyecto.

## Procedimiento

1. Lee el `CLAUDE.md` local para detectar `PHASE:`
2. Si no encuentra fase, asume `xp`
3. Analiza los cambios (staged, unstaged, o últimos commits según contexto)
4. Aplica criterios de la fase actual — nunca de una fase superior
5. Genera reporte en el formato estándar

## Criterios por fase

### Fase xp
- Secrets expuestos → Crítico
- Errores silenciados (catch vacío, `_ = err`) → Crítico
- Código que no compila o ejecuta → Crítico
- Todo lo demás → Sugerencia como máximo

### Fase solid
- Todo lo de `xp` +
- Falta de tests unitarios para lógica nueva → Crítico
- Violación de SRP (módulo con múltiples responsabilidades) → Importante
- Dependencias no inyectadas (hardcoded) → Importante
- Type hints faltantes en Python → Importante
- `any` en TypeScript → Importante
- `unwrap()` en Rust sin justificación → Crítico
- Dockerfile sin multi-stage → Importante

### Fase clean
- Todo lo de `solid` +
- Import cruzado entre capas → Crítico
- Lógica de negocio en capa de infraestructura → Crítico
- UI/Controller accediendo directamente a DB/API → Crítico
- Falta de tests de integración en capas externas → Importante

### Fase hexagonal
- Todo lo de `clean` +
- Core importando framework (express, django, nestjs) → Crítico
- Puerto sin definición como interface/trait/protocol → Crítico
- Tests de core que requieren infra real → Importante
- Adaptador que no implementa el puerto correspondiente → Crítico

### Fase ddd
- Todo lo de `hexagonal` +
- Aggregate sin invariantes protegidas → Crítico
- Evento de dominio no documentado → Importante
- Bounded context importando entidades de otro contexto → Crítico
- Value Object mutable → Crítico
- Tests sin ubiquitous language → Sugerencia

## Formato del reporte

```
## Code Review — Fase: [fase]

### Crítico (bloquea PR)
- [archivo:línea] — [descripción del problema]

### Importante (debe corregirse pronto)
- [archivo:línea] — [descripción y sugerencia]

### Sugerencia (mejora opcional)
- [archivo:línea] — [descripción]

### Positivo (buenas prácticas detectadas)
- [archivo:línea] — [qué se hizo bien y por qué]
```
