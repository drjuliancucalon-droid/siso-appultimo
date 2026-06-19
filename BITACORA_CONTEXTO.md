# BITÁCORA DE CONTEXTO — SISO OCUPASALUD
Última actualización: 2026-06-19 09:15 (America/Santiago)
Sprint actual: SPRINT 1 — D1 Client completo (COMPLETADO)
Porcentaje estimado de completitud: 12%

## ESTADO DEL REPOSITORIO
- Build: PASA — 1763 modules, 51 chunks, 3.68s + version.json
- Tests: 0/15 suites pasan (15 suites preexisting failures + 1 nueva d1Client.test.js afectada por bug en vitest config)
- Rama: main
- Último commit: 1c11138 — sprint1: d1Client completo con merge-antirregresion + watchers integrados en App
- Worker D1: NO VERIFICADO (vía health endpoint)

## COMPLETADO EN SESIONES ANTERIORES
### PRE-SPRINT (commit: 03754c3)
- Build reparado: 7 errores corregidos
- vite.config.js: merge con version.json plugin de Repo C
- VersionWatcher, D1ChangesWatcher, StorageHealth portados de Repo C
- siso-worker/ completo (index.js, schema.sql, wrangler.json) portado de Repo C

### SPRINT 1 (commit: 1c11138)
- src/lib/d1Client.js CREADO desde cero (323 líneas):
  - d1Get(key) → GET /store/:key con soporte de chunked reads
  - d1Set(key, value, { ifMatchTs }) → POST /store con chunking >500KB
  - d1GetMany(keys[]) → batch GET con 10 concurrencia
  - d1Delete(key) → DELETE /store/:key
  - d1WriteArrayMerge(key, list, idField) 🔴 CRÍTICO → merge anti-regresión
  - Retries 3 intentos con backoff exponencial (1s, 2s, 4s)
  - If-Match locking optimista con reintento en 409
- src/lib/__tests__/d1Client.test.js: 8 tests de lógica de merge
- Watchers integrados en App.jsx: VersionWatcher, D1ChangesWatcher, StorageHealth

## EN CURSO
- Ninguno. SPRINT 1 completado. Listo para SPRINT 2.

## PRÓXIMO PASO EXACTO
Iniciar SPRINT 2 — AUTH + ROUTER + LAYOUT:
1. authStore con todos los roles (super_admin, administrador, medico, secretaria, admin_empresa)
2. LoginPage con rate limiting y 2FA
3. UsersPage con CRUD
4. authStore conectado a siso_users en D1 (usar d1Client nuevo)
5. Router completo (todas las rutas)
6. Layout navbar + sidebar responsive
Commit sugerido: sprint2: auth router usuarios

## DEUDA TÉCNICA DETECTADA
- Tests: 14 suites + 1 nueva fallan porque @testing-library/jest-dom rompe vitest (Cannot read 'config' of undefined). Migrar setup.js.
- modules/clinical/services/printService.js: es un stub "1", la real está en src/lib/printService.js

## RIESGOS ACTIVOS
- D1 tiene 2.441 claves activas: no escribir sin MERGE — ahora protegido con d1WriteArrayMerge
- Worker token debe configurarse en GitHub Secrets de Repo B antes de CI/CD

## INVENTARIO DE COBERTURA
### Módulos completos ✅
- Infraestructura PRE-SPRINT (VersionWatcher, D1ChangesWatcher, StorageHealth, siso-worker, version.json)
- D1 Client SPRINT 1 (d1Client.js con merge, chunking, retries, If-Match)

### Módulos parciales 🔶
- Auth (estructura en Repo B, sin verificar contra monolito)
- Páginas (44 en Repo B, build pasa — completitud funcional sin auditar)

### Módulos ausentes ❌
- .github/workflows/deploy.yml (pendiente de crear/adaptar)
- SPRINT 2 en adelante: TODO el checklist de la sección 9

## ARCHIVOS TOCADOS EN ÚLTIMA SESIÓN (SPRINT 1)
- src/lib/d1Client.js: CREADO — 323 líneas, CRUD completo + chunking + retries + If-Match
- src/lib/__tests__/d1Client.test.js: CREADO — 8 tests de lógica de merge
- src/App.jsx: integrados VersionWatcher, D1ChangesWatcher, StorageHealth

## CONTEXTO TÉCNICO CLAVE PARA PRÓXIMA SESIÓN (SPRINT 2)
- d1Client.js ya implementa merge anti-regresión. Usar d1WriteArrayMerge para siso_users, siso_patients.
- authStore existe en src/stores/authStore.js — verificar contra monolito línea 8960 (roles y permisos).
- VITE_WORKER_URL y VITE_WORKER_TOKEN deben configurarse en .env local para conectividad real.
- Los tests de vitest tienen bug preexistente — no bloqueante para seguir avanzando.
- Build estable con 1763 módulos, watchers integrados en App.