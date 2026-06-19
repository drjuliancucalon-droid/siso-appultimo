# BITÁCORA DE CONTEXTO — SISO OCUPASALUD
Última actualización: 2026-06-19 08:47 (America/Santiago)
Sprint actual: PRE-SPRINT — Saqueo Repo C (COMPLETADO)
Porcentaje estimado de completitud: 5%

## ESTADO DEL REPOSITORIO
- Build: PASA — 1757 modules, 49 chunks, 6.89s
- Tests: 0/14 suites pasan (pre-existing failures: tests usan Jest API con Vitest y referencian archivos inexistentes como `Companies.jsx`, `AIConfigPanel.jsx` legacy)
- Rama: main
- Último commit: ee0ae7023dae4317595aae6f59ddda9db957b269 (PRE-SPRINT pendiente de commit)
- Worker D1: NO VERIFICADO

## COMPLETADO EN SESIÓN ANTERIOR
- Build reparado: 7 errores corregidos (public/index.html duplicado, clinicalStore.js → .jsx + imports zustand v5, CompaniesPage ruta, Caja.jsx adapter, Reporte.jsx adapter, 3 archivos con imports rotos a catalogos.js → derivaciones.js/recomendaciones.js/restricciones.js, ChevronRight faltante, xlsx instalado, printService path, CompaniesPage default import fix)
- vite.config.js: merge con version.json plugin de Repo C
- PRE-SPRINT completado:
  - src/components/VersionWatcher.jsx ← portado de Repo C
  - src/components/D1ChangesWatcher.jsx ← portado de Repo C
  - src/components/StorageHealth.jsx ← portado de Repo C
  - siso-worker/ completo (index.js, schema.sql, wrangler.json) ← portado de Repo C
  - public/_headers y public/_redirects ya existían en Repo B
  - .github/workflows/deploy.yml — pendiente (no existe en Repo C como archivo plano)

## EN CURSO
- Ninguno. PRE-SPRINT completado. Listo para SPRINT 1.

## PRÓXIMO PASO EXACTO
Iniciar SPRINT 1 — D1 CLIENT COMPLETO:
1. Verificar/completar d1Client.js: d1Get, d1Set, d1GetMany, d1Delete, d1WriteArrayMerge(key, list, idField)
2. chunking automático si payload >500KB
3. retries 3 intentos con backoff exponencial
4. If-Match header para locking optimista
5. Integrar VersionWatcher + D1ChangesWatcher en App.jsx
6. Tests: d1Client.test.js
Commit sugerido: sprint1: d1client merge-antirregresion completo

## DEUDA TÉCNICA DETECTADA
- Tests: 14 suites fallan porque mezclan Jest API (jest.fn, jest.mock) con Vitest. Migrar a vi.fn/vi.mock.
- Tests: referencian archivos legacy que no existen (Companies.jsx, AIConfigPanel.jsx en components/panels/)
- modules/clinical/services/printService.js: es un stub "1", la real está en src/lib/printService.js

## RIESGOS ACTIVOS
- D1 tiene 2.441 claves activas: no escribir sin MERGE
- Worker token debe configurarse en GitHub Secrets de Repo B antes de CI/CD
- El build es estable pero hay ~300KB de chunks pendientes de optimizar (AIConfigPanel 152KB, ReportsPage 295KB)

## INVENTARIO DE COBERTURA
### Módulos completos ✅
- Infraestructura PRE-SPRINT (VersionWatcher, D1ChangesWatcher, StorageHealth, siso-worker, version.json)

### Módulos parciales 🔶
- Auth (estructura en Repo B, sin verificar contra monolito)
- D1Client (base en Repo B, MERGE y chunking sin verificar)
- Páginas (44 en Repo B, build pasa — completitud funcional sin auditar)

### Módulos ausentes ❌
- .github/workflows/deploy.yml (pendiente de crear/adaptar)
- SPRINT 1 en adelante: TODO el checklist de la sección 9

## ARCHIVOS TOCADOS EN ÚLTIMA SESIÓN
- index.html: eliminado <style> inline que rompía Vite 6
- src/modules/clinical/store/clinicalStore.js → .jsx: import paths corregidos
- src/pages/CompaniesPage.jsx: import corregido de ./Companies a { CompanyList } de ../modules/companies
- src/pages/Caja.jsx: NUEVO — adapter wrapper
- src/pages/Reporte.jsx: NUEVO — adapter wrapper
- src/components/forms/TabFormulaDerivacion.jsx: imports corregidos
- src/components/panels/RecomendacionesChecklistPanel.jsx: import corregido + ChevronRight
- src/components/panels/RestriccionesChecklistPanel.jsx: import corregido + ChevronRight
- src/pages/HistoriaPage.jsx: import printService path corregido
- vite.config.js: merge con version.json plugin
- src/components/VersionWatcher.jsx: portado de Repo C
- src/components/D1ChangesWatcher.jsx: portado de Repo C
- src/components/StorageHealth.jsx: portado de Repo C
- siso-worker/: portado de Repo C (3 archivos)

## CONTEXTO TÉCNICO CLAVE PARA PRÓXIMA SESIÓN
- Build estable con 1757 módulos. version.json se genera en cada build.
- 3 componentes watcher portados pero NO integrados en App.jsx — hacerlo en SPRINT 1.
- El módulo companies exporta named exports (CompanyList, CompanyForm, CompanyPortal, useCompanies).
- Los tests legacy usan `jest.mock()` en lugar de `vi.mock()` — migrar pendiente pero no bloqueante.
