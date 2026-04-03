# /qa-run

Ejecuta suite de QA contra la SaaS de PhantomRelay usando el relay como motor de browser.

## Uso

```
/qa-run [opciones]
```

## Opciones

- `--target <url>` — URL del SaaS a testear (default: pide al usuario)
- `--relay <url>` — URL del PhantomRelay relay (default: pide al usuario)
- `--suite <nombre>` — Suite a ejecutar: `auth`, `scraper`, `billing`, `proxy`, `all` (default: `all`)
- `--report` — Crear GitHub Issues en fallos (requiere GITHUB_TOKEN y --repo)
- `--repo <org/repo>` — Repositorio GitHub para los issues

## Procedimiento

1. **Recopilar configuración** — si faltan parámetros, preguntar al usuario
2. **Verificar relay** — `GET {relay}/health` debe responder OK
3. **Verificar target** — `GET {target}` debe responder 200
4. **Ejecutar suite seleccionada**:

### Suite: `auth`
- Landing page carga correctamente
- Página de login accesible y form visible
- Página de signup accesible
- Dashboard redirige a login si no autenticado
- Health check del API responde

### Suite: `scraper`
- Endpoint de scrapers existe (401, no 404)
- Endpoint de runs existe (401, no 404)
- SSE endpoint disponible

### Suite: `billing`
- Página de plans accesible públicamente
- Checkout endpoint existe

### Suite: `proxy`
- Endpoint de proxies existe (401, no 404)

5. **Para cada test**:
   - Usar el relay para navegar/request
   - Tomar screenshot si es navegación visual
   - Verificar el resultado esperado
   - Registrar: ✅ PASS o ❌ FAIL con detalle

6. **Reportar resultados**:
   - Tabla resumen con pass/fail por test
   - Si `--report`: crear GitHub Issue por cada fallo

## Ejemplo

```
/qa-run --target https://app.phantomrelay.com --relay https://relay.phantomrelay.com --suite auth
```

## Notas

- No requiere credenciales de usuario para los tests básicos
- Para tests autenticados: configurar QA_TEST_EMAIL y QA_TEST_PASSWORD
- Los issues creados tienen label `qa-automated` para filtrarlos fácilmente
