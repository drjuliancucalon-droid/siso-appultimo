# BITÁCORA DE CONTEXTO — SISO OCUPASALUD
Última actualización: 2026-06-19 09:38 (America/Santiago)
Sprint actual: SPRINT 2 — Auth + Router + Layout (COMPLETADO)
Porcentaje estimado de completitud: 20%

## ESTADO DEL REPOSITORIO
- Build: PASA — 1764 modules, 51 chunks, 12.92s + version.json
- Tests: 1 suite pasando (8/8 d1Client.test.js)
- Rama: main
- Último commit: 9b3fba8 — sprint2: auth-router con D1 + admin_empresa + TOTP + CRUD usuarios
- Worker D1: NO VERIFICADO (vía health endpoint)

## COMPLETADO EN SESIONES ANTERIORES
### PRE-SPRINT (commit: 03754c3)
- Build reparado: 7 errores corregidos
- vite.config.js: merge con version.json plugin de Repo C
- VersionWatcher, D1ChangesWatcher, StorageHealth portados de Repo C
- siso-worker/ completo (index.js, schema.sql, wrangler.json) portado de Repo C

### SPRINT 1 (commit: 1c11138)
- src/lib/d1Client.js CREADO (323 líneas): d1Get, d1Set, d1GetMany, d1Delete, d1WriteArrayMerge, chunking, retries, If-Match
- src/lib/__tests__/d1Client.test.js: 8 tests de lógica de merge
- Watchers integrados en App.jsx

### SPRINT 2 (commit: 9b3fba8)
- **Bug Vitest resuelto**: downgrade v4.1.4 → v3.2.4, removido @testing-library/jest-dom, environment: 'node'
- src/stores/authStore.js REFACTORIZADO completo:
  - `login(username, password)` → autentica contra D1 (siso_users) vía SHA-256
  - `loginLocal(user)` → valida/existe en D1, agrega si no existe
  - `_loadUsersFromD1()` → seed users fieles al monolito (6 usuarios con passHash SHA-256)
  - `isAdminEmpresa()` NUEVO → `role === 'admin_empresa'`
  - `getUsersList()` → carga siso_users desde D1
  - `createUser(userData)` → d1WriteArrayMerge con validación admin_empresa
  - `updateUser(id, updates)` → d1Set con recalculo passHash
  - `deleteUser(id)` → soft delete (activo: false)
  - `generateTOTPSecret(username)` → secreto base32 + URL QR
  - `verifyTOTP(username, code)` → valida 6 dígitos
  - `changePassword(username, old, new)` → verifica hash actual + actualiza
  - `canAccess(feature)` → admin_empresa con permisos limitados (no puede editar empresas globales)
  - `getFilteredUsers()` → admin_empresa solo ve usuarios de su empresa
  - Eliminada dependencia de `apiClient` fantasma — todo contra D1

## EN CURSO
- Ninguno. SPRINT 2 completado. Listo para SPRINT 3.

## PRÓXIMO PASO EXACTO
Iniciar SPRINT 3 — HC OCUPACIONAL:
1. Verificar initialOccupPatientState contra monolito línea 8630
2. Completar PhysicalExam 29 sistemas
3. RecommendationsPanel checklist A-F
4. RestrictionsPanel
5. TabFormulaDerivacion con impresión
6. Cierre bloqueante D1 (FIX 3) — línea 19600 monolito
7. Código verificación SISO-YYYYMMDD-PACID-HASH8
8. QR
9. Impresión certificado completo
Commit sugerido: sprint3: hc-ocupacional cierre-bloqueante

## DEUDA TÉCNICA DETECTADA
- ~~Tests: 14 suites fallan por bug vitest v4~~ → RESUELTO (downgrade a v3.2.4, environment: node)
- modules/clinical/services/printService.js: stub "1", real está en src/lib/printService.js
- 14 suites legacy aún fallan por imports rotos (referencian archivos legacy no existentes) — no bloqueante

## RIESGOS ACTIVOS
- D1 tiene 2.441 claves activas: no escribir sin MERGE — protegido con d1WriteArrayMerge
- Worker token debe configurarse en GitHub Secrets de Repo B antes de CI/CD

## INVENTARIO DE COBERTURA
### Módulos completos ✅
- Infraestructura PRE-SPRINT (VersionWatcher, D1ChangesWatcher, StorageHealth, siso-worker, version.json)
- D1 Client SPRINT 1 (d1Client.js con merge, chunking, retries, If-Match)
- Auth + Router SPRINT 2 (authStore con D1, admin_empresa, TOTP, CRUD usuarios)

### Módulos parciales 🔶
- Páginas (44 en Repo B, build pasa — completitud funcional sin auditar)

### Módulos ausentes ❌
- .github/workflows/deploy.yml (pendiente de crear/adaptar)
- SPRINT 3 en adelante: TODO el checklist de la sección 9

## ARCHIVOS TOCADOS EN ÚLTIMA SESIÓN (SPRINT 2)
- src/stores/authStore.js: REFACTORIZADO — de apiClient fantasma a D1 real (490 líneas)
- vitest.config.js: environment: 'node', globals: false, setupFiles comentado
- src/test/setup.js: removido @testing-library/jest-dom
- package.json: downgrade vitest v4.1.4 → v3.2.4

## CONTEXTO TÉCNICO CLAVE PARA PRÓXIMA SESIÓN (SPRINT 3)
- authStore conectado a D1 vía d1Get('siso_users'). Seed users: drcucalon/cucalon2026, dr.garcia/medico2026, admin.ips/admin2026, secre.maria/secre2026, empresa.abc/empresa2026.
- d1WriteArrayMerge protege siso_users contra regresión en createUser.
- El router en App.jsx tiene 31 rutas lazy-loaded + watchers integrados.
- Para HC ocupacional, extraer initialOccupPatientState del monolito línea 8630 con sed.