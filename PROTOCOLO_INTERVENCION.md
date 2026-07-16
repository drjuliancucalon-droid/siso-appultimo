# 📋 PROTOCOLO DE INTERVENCIÓN — Monolito → Refactorizado
## OCUPASALUDPARADESPLEGAR → SISO-APPULTIMO

**Fecha inicio:** 2026-07-16  
**Documento base:** `AUDITORIA_QUIRURGICA_2026-07-16.md`  
**Objetivo:** Alcanzar 100% de paridad funcional con el monolito para que el refactorizado sea el punto de producción.

---

## 📊 ESTADO GLOBAL

| Métrica | Valor |
|---------|-------|
| **Total items a implementar** | **39** |
| **Completados** | 11 |
| **En progreso** | 0 |
| **Pendientes** | 28 |
| **Bloqueados** | 0 |
| **Progreso global** | **28%** |

```
████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 28% (11/39)
```

---

## 🛡️ FASE 0.5: AISLAMIENTO DE DATOS EN WORKER COMPARTIDO (5 items)

> **Severidad:** 🔴 CRÍTICA — Sin estos candados, una app puede borrar/sobrescribir datos de la otra.

| ID | Item | Archivo | Líneas | Estado | Notas |
|----|------|---------|:---:|:---:|---|
| **F0.5-C3** | CANDADO 3: Validación de userId en claves de pacientes | `siso-worker/index.js` | ~20 | ✅ Completado | POST /store — bloquea escrituras con userId incorrecto |
| **F0.5-C4** | CANDADO 4: Anti-borrado de claves críticas | `siso-worker/index.js` | ~15 | ✅ Completado | DELETE — bloquea borrado de `siso_users`, `siso_portal_empresa_*`, `siso_ai_keys_*`, `siso_snapshot_*` |
| **F0.5-C5** | CANDADO 5: Snapshot automático antes de DELETE | `siso-worker/index.js` | ~10 | ✅ Completado | Backup automático en `siso_deleted_<ts>_<key>` |
| **F0.5-C6** | CANDADO 6: Merge atómico server-side (NUEVO endpoint) | `siso-worker/index.js` | ~35 | ✅ Completado | POST /store/merge — fusión por idField |
| **F0.5-H** | Header X-Siso-App para identificación de app | `siso-worker/index.js` | ~5 | ✅ Completado | CORS permite X-Siso-App + X-Siso-UserId |

**Progreso FASE 0.5: 5/5 (100%)** `████████████████████████████ 100%`

---

## 🚨 FASE 0: GUARDADO, CIERRE DE HC Y PORTAL DE CERTIFICADOS (12 items)

> **Severidad:** 🔴 CRÍTICA — Sin esto, el refactorizado no puede ser punto de producción.

| ID | Item | Archivo | Líneas | Estado | Notas |
|----|------|---------|:---:|:---:|---|
| **F0-01** | `handleCloseHistory` — 9 acciones en cadena | `src/sections/HistoriaOcupacional.jsx` | ~300 | ⬜ Pendiente | Firma digital + QR + publicar portal |
| **F0-02** | Publicar portal: `siso_portal_<code>`, `siso_portal_doc_<cc>` | `HistoriaOcupacional.jsx` | ~50 | ⬜ Pendiente | 2 claves D1 |
| **F0-03** | Guardar HC completa: `siso_hc_completa_<cc>` | `HistoriaOcupacional.jsx` | ~30 | ⬜ Pendiente | D1 + SB backup |
| **F0-04** | Indexar empresa: `siso_portal_empresa_<NIT>`, `_atenciones`, `_docs` | `HistoriaOcupacional.jsx` | ~100 | ⬜ Pendiente | 3 claves D1 |
| **F0-05** | Portal de Trabajador público (NUEVO archivo) | `src/pages/PortalTrabajadorPage.jsx` | ~400 | ⬜ Pendiente | Búsqueda código/cédula + descarga |
| **F0-06** | Portal de Empresa completo | `src/pages/PortalEmpresaPage.jsx` | ~300 | ⬜ Pendiente | Actualizar existente |
| **F0-07** | `_portalPrint` — imprimir docs desde portal | `src/lib/printService.js` | ~80 | ⬜ Pendiente | Receta, derivación, exámenes, incapacidad |
| **F0-08** | `_generarCertificadoDesdePortal` | `src/lib/printService.js` | ~100 | ⬜ Pendiente | Certificado aptitud para portal |
| **F0-09** | `_generarHCPortalHTML` — HC completa para portal | `src/lib/printService.js` | ~150 | ⬜ Pendiente | 18 secciones HC |
| **F0-10** | Cuenta de cobro HTML | `src/lib/printService.js` | ~60 | ⬜ Pendiente | Tabla de items facturables |
| **F0-11** | Carta custodia HTML (Res. 1995/1999) | `src/lib/printService.js` | ~80 | ⬜ Pendiente | Documento legal |
| **F0-12** | Botón "Publicar en Portal" en HC | `HistoriaOcupacional.jsx` | ~30 | ⬜ Pendiente | UI trigger |

**Progreso FASE 0: 0/12 (0%)** `████████████████████████████ 0%`

---

## 🔴 FASE 1: WORKER — ENDPOINTS Y CORRECCIONES (7 items)

> **Severidad:** 🔴 CRÍTICA — Afecta a AMBAS aplicaciones.

| ID | Item | Archivo | Líneas | Estado | Commit origen |
|----|------|---------|:---:|:---:|---|
| **F1-01** | Modo `?raw=1` en `GET /store/:key` | `siso-worker/index.js` | ~15 | ✅ Completado | `1bf1233` — evita 503 por CPU timeout |
| **F1-02** | Fusión por ID para `siso_encuestas` en `POST /store/append` | `siso-worker/index.js` | ~20 | ✅ Completado | `3531448` — usa encuestaId como idField |
| **F1-03** | `POST /cleanup` — limpieza emergencia | `siso-worker/index.js` | ~30 | ✅ Completado | Snapshots >7d + chunks huérfanos + autosaves >48h |
| **F1-04** | `GET /storage-stats` — monitoreo D1 | `siso-worker/index.js` | ~35 | ✅ Completado | Filas, MB, % uso, alertas 70/90% |
| **F1-05** | CANDADO 2 también en `POST /store/chunked` | `siso-worker/index.js` | ~10 | ✅ Completado | HC cerradas inmutables también en chunked |
| **F1-06** | Replicar worker en producción | `siso-worker-deploy/index.js` | Copia | ✅ Completado | — |
| **F1-07** | Verificar parseo encuestas con `?raw=1` | `EncuestasTab.jsx` | ~5 | ⬜ Pendiente | `736ddd4` — requiere revisión de frontend |

**Progreso FASE 1: 6/7 (86%)** `████████████████████████░░░░ 86%`

---

## 🟡 FASE 2: ÉNFASIS CONDUCCIÓN DE VEHÍCULOS (6 items)

> **Severidad:** 🟡 MEDIA — Nueva funcionalidad requerida por normativa (Res. 217/2014).

| ID | Item | Archivo | Líneas | Estado | Commit origen |
|----|------|---------|:---:|:---:|---|
| **F2-01** | Catálogo de énfasis CONDUCCIÓN | `src/shared/data/catalogs.js` | ~3 | ⬜ Pendiente | `f4b4431` |
| **F2-02** | UI — Formulario en HC (170 líneas JSX) | `src/sections/HistoriaOcupacional.jsx` | ~170 | ⬜ Pendiente | `f4b4431` |
| **F2-03** | UI — Vista previa certificado (93 líneas) | `src/modules/clinical/components/CertificateView.jsx` | ~93 | ⬜ Pendiente | `f4b4431` |
| **F2-04** | Prompt IA — análisis de énfasis | `src/modules/ai/services/aiAnalysis.js` | ~25 | ⬜ Pendiente | `f4b4431` |
| **F2-05** | Prompt IA — tipo de énfasis | `src/modules/ai/services/aiAnalysis.js` | ~5 | ⬜ Pendiente | `f4b4431` |
| **F2-06** | HC Impresión — sección CONDUCCIÓN | `src/lib/printService.js` | ~35 | ⬜ Pendiente | `f4b4431` |
| **F2-07** | Select de énfasis + badge color | Componente HC | ~5 | ⬜ Pendiente | `f4b4431` |

**Progreso FASE 2: 0/7 (0%)** `████████████████████████████ 0%`

---

## 🟢 FASE 3: MEJORAS FINALES (8 items)

> **Severidad:** 🟢 BAJA — Funcionalidades del monolito sin equivalente en refactorizado.

| ID | Item | Archivo | Líneas | Estado |
|----|------|---------|:---:|:---:|
| **F3-01** | `RecuperarAcceso` — formulario recuperación contraseña | `modules/auth/components/RecuperarAcceso.jsx` | ~80 | ⬜ Pendiente |
| **F3-02** | Export FHIR R4 desde tabla pacientes | `modules/reports/services/fhirService.js` | ~60 | ⬜ Pendiente |
| **F3-03** | Badge "preservar HC" en tabla pacientes | `PatientList.jsx` | ~10 | ⬜ Pendiente |
| **F3-04** | Timeout de sesión 30 min inactividad | `authStore.js` | ~30 | ⬜ Pendiente |
| **F3-05** | Notificaciones de convenios próximos a vencer | `DashboardPage.jsx` | ~20 | ⬜ Pendiente |
| **F3-06** | Banner de IPS personalizable desde admin | `SettingsPage.jsx` | ~30 | ⬜ Pendiente |
| **F3-07** | Médico de turno funcional | `AgendaView.jsx` | ~40 | ⬜ Pendiente |
| **F3-08** | Configuración IPS completa (logo, NIT, dirección) | `SettingsPage.jsx` | ~50 | ⬜ Pendiente |

**Progreso FASE 3: 0/8 (0%)** `████████████████████████████ 0%`

---

## 📊 RESUMEN POR FASE

| Fase | Items | Completados | Progreso | Líneas |
|------|:---:|:---:|:---:|:---:|
| 🛡️ FASE 0.5 (Aislamiento Worker) | 5 | 5 | 100% ✅ | ~85 |
| 🚨 FASE 0 (Guardado/Cierre/Portal) | 12 | 0 | 0% | ~1,680 |
| 🔴 FASE 1 (Worker Endpoints) | 7 | 6 | 86% 🟡 | ~115 |
| 🟡 FASE 2 (Énfasis CONDUCCIÓN) | 7 | 0 | 0% | ~336 |
| 🟢 FASE 3 (Mejoras) | 8 | 0 | 0% | ~320 |
| **TOTAL** | **39** | **11** | **28%** | **~2,536** |

---

## 🔍 HALLAZGOS NUEVOS (Sección Dinámica)

> *Esta sección se llena durante la implementación cuando se descubren brechas o problemas no documentados en la auditoría original.*

| # | Fecha | Hallazgo | Impacto | Decisión | Estado |
|---|-------|----------|---------|----------|:---:|
| — | — | *No hay hallazgos nuevos todavía* | — | — | — |

---

## 📝 BITÁCORA DE CAMBIOS

| Fecha | Hora | Acción | Items afectados | Progreso |
|-------|------|--------|:---:|:---:|
| 2026-07-16 | 10:45 | Creación del protocolo | — | 0% (0/39) |
| 2026-07-16 | 10:55 | FASE 0.5 completada — 5 candados de aislamiento en worker | F0.5-C3, C4, C5, C6, H | 13% (5/39) |
| 2026-07-16 | 10:58 | FASE 1 completada — 6 endpoints/correcciones en worker | F1-01 a F1-06 | 28% (11/39) |

---

*Protocolo de Intervención — Se actualiza con cada cambio implementado o hallazgo nuevo descubierto.*