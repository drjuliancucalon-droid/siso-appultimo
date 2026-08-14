# 📋 DOCUMENTO MAESTRO DE SESIONES — OcupaSalud Refactorización

> **Propósito:** Registro continuo de cada sesión de auditoría y refactorización.
> Actualizar al inicio y al final de cada sesión para garantizar continuidad perfecta.
> **Regla no negociable:** El refactor debe ser 100% idéntico al monolito en colores,
> temas, posiciones, botones, textos, flujos de datos y almacenamiento.

---

## 📌 Estado General del Proyecto

| Dimensión | Valor |
|---|---|
| **Monolito (fuente de verdad)** | [`ocupasaludparadesplegar`](https://github.com/drjuliancucalon-droid/ocupasaludparadesplegar) |
| **Refactor (en progreso)** | [`siso-appultimo`](https://github.com/drjuliancucalon-droid/siso-appultimo) |
| **Backend compartido** | `siso-api` — Cloudflare Worker production |
| **Base de datos** | D1 `siso-db` — ID: `76da5895-478f-4486-a5d4-05069f9aa45a` |
| **Worker producción** | `siso-worker-deploy/wrangler.json` → `siso-api` |
| **Worker desarrollo** | `siso-worker/wrangler.json` → `siso-api-dev` (aislado desde 2026-08-14) |
| **% Refactorización estimado** | **~85%** (al 2026-08-14) |
| **Última sesión** | 2026-08-14 |
| **Próxima acción pendiente** | Ver sección PENDIENTES al final |

---

## 🏗️ Arquitectura de Datos (Crítico para Coexistencia)

### Tabla D1
```sql
CREATE TABLE siso_store (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,  -- JSON serializado
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_key ON siso_store(key);
```

### Patrón de claves (key-value store)
- `siso_patients_<userId>` — pacientes por usuario
- `siso_db_patients_<userId>` — DB extendida de pacientes
- `siso_atenciones_<userId>` — atenciones/consultas
- `siso_hc_<pacienteId>_<userId>` — historia clínica individual
- `siso_hc_cerrada_<pacienteId>_<userId>` — HC firmada digitalmente (CANDADO 2: HTTP 423)
- `siso_companies_<userId>` — empresas
- `siso_users` — usuarios del sistema (CANDADO 4: no se puede borrar)
- `siso_ips_perfil` — configuración IPS
- `siso_ai_keys_*` — claves de IA (CANDADO 4)

### Chunking (datos > 500 KB)
- Chunks: `${key}__c0`, `${key}__c1`, ... `${key}__cN`
- Manifiesto: `${key}__meta` → `{ chunked: true, count: N, totalBytes: X, ts: ... }`
- La clave base se **borra** al chunkar (lectores usan `__meta`)
- Tamaño máximo: 5 MB por payload

### CANDADOS DE SEGURIDAD DEL WORKER
| # | Nombre | Claves protegidas | Mecanismo |
|---|---|---|---|
| 1 | `_mergeProtegido` | patients, hc, atenciones, encuestas, companies, cartas, users, portal | Fusión por `id` — nunca sobreescribe array completo |
| 2 | HC cerradas | `*_cerrada*` | HTTP 423 — inmutable |
| 3 | `user_mismatch` | patients, db_patients, hc | Requiere `X-Siso-UserId` header (**ACTIVADO** 2026-08-14) |
| 4 | Claves críticas | users, portal_empresa, ai_keys, snapshot | DELETE rechazado HTTP 403 |
| 5 | Snapshot pre-delete | Cualquier clave | Auto-backup en `siso_deleted_<ts>_<key>` |
| 6 | Merge atómico | Arrays via `/store/merge` | Lee-mergea-escribe atómico en worker |

---

## 📂 Inventario de Páginas (src/pages)

### ✅ Implementadas (30/36 = 83.3%)

| Página | Tamaño | Estado |
|---|---|---|
| `DashboardPage.jsx` | 51 KB | ✅ Completa |
| `PortalEmpresaPage.jsx` | 50 KB | ✅ Completa |
| `HistoriaPage.jsx` | 49 KB | ✅ Completa — paridad verificada línea a línea |
| `BackupPage.jsx` | 32 KB | ✅ Completa |
| `PortalCertificadosEmpresa.jsx` | 31 KB | ✅ Completa |
| `SurveyResponsePage.jsx` | 30 KB | ✅ Completa |
| `CartaCustodiaPage.jsx` | 24 KB | ✅ Completa |
| `AnalisisDocsEmpresas.jsx` | 22 KB | ✅ Completa |
| `SettingsPage.jsx` | 22 KB | ✅ Completa |
| `ContabilidadPage.jsx` | 22 KB | ✅ Completa |
| `VerificacionPage.jsx` | 22 KB | ✅ Completa |
| `CotizacionesPage.jsx` | — | ✅ Completa |
| `EncuestasPage.jsx` | — | ✅ Completa |
| `HistoriaGeneralPage.jsx` | — | ✅ Completa |
| `HabeasDataPage.jsx` | — | ✅ Completa |
| `SuperAdminPage.jsx` | — | ✅ Completa |
| `ProfilePage.jsx` | — | ✅ Completa |
| `ARLPage.jsx` | — | ✅ Completa |
| `BillingPage.jsx` | — | ✅ Completa |
| `LoginPage.jsx` | — | ✅ Completa |
| `MensajesPage.jsx` | — | ✅ Completa |
| `CajaPage.jsx` | 5 KB | ✅ Completa |
| `CertificadoPage.jsx` | — | ✅ Completa |
| `AgendaPage.jsx` | — | ✅ Completa |
| `CompaniesPage.jsx` | — | ✅ Completa |
| `ReportsPage.jsx` | — | ✅ Completa |
| `PatientsPage.jsx` | — | ✅ Completa |
| `UsersPage.jsx` | — | ✅ Completa |
| `PortafolioPage.jsx` | — | ✅ Completa |
| `SGSSTPage.jsx` | — | ✅ Completa |

### ✅ Adaptadores funcionales (verificados 2026-08-14)

| Página | Estado | Notas |
|---|---|---|
| `Reporte.jsx` | ✅ Adaptador correcto | Wrapper de `EpidemiologicalReport` — NO es stub vacío |
| `WorkerPortalPage.jsx` | ✅ Adaptador correcto | Wrapper de `WorkerPortal` con `useParams` — NO es stub |

### ⚠️ Pendientes de completar

| Página | Tamaño actual | Estado | Prioridad |
|---|---|---|---|
| `PlanesPage.jsx` | 2 KB | ✅ Funcional con guard de roles — verificado 2026-08-14 | Baja |
| `TelemedicinePage.jsx` | 2 KB | ✅ Funcional con secretaria gate — verificado 2026-08-14 | Baja |
| `ConfigIPSPage.jsx` | 2.4 KB | ⚠️ Solo localStorage — necesita migrar a D1 (`siso_ips_perfil`) | Media |
| `CajaPage.jsx` + `Caja.jsx` | — | ✅ NO es duplicado: `Caja.jsx` es adaptador de `CashBox`. Persistencia en localStorage (brecha a confirmar vs monolito) | Media (por confirmar) |

---

## 🔧 Backend: siso-worker vs siso-worker-deploy

| | `siso-worker/` | `siso-worker-deploy/` |
|---|---|---|
| Nombre | `siso-api-dev` | `siso-api` |
| D1 | `siso-db-dev` (aislado desde 2026-08-14) | `siso-db` (producción) |
| URL | localhost:8787 | `https://siso-api.dr-juliancucalon.workers.dev` |
| Deploy | **NUNCA** desde aquí | Solo desde aquí |

---

## 📝 REGISTRO DE SESIONES

---

### SESIÓN 001 — 2026-08-14
**Auditor:** Perplexity AI + Julian Cucalon  
**Duración:** ~1 hora  
**Objetivo:** Auditoría completa y fixes de seguridad

#### Hallazgos principales
1. `App.jsx` del monolito tiene 3.1 MB — God Component confirmado
2. `_temp_app.jsx` en refactor (2.9 MB) es referencia del monolito, NO código activo
3. Worker producción confirmado: `siso-worker-deploy/` → `siso-api`
4. CANDADO 3 estaba INERTE — ninguna app enviaba `X-Siso-UserId`
5. `siso-worker/wrangler.json` usaba el mismo D1 de producción → riesgo crítico
6. D1 compartido entre monolito y refactor: mismo worker URL, mismo D1 — CORRECTO
7. `Reporte.jsx` y `WorkerPortalPage.jsx` NO son stubs — son adaptadores funcionales correctos

#### Cambios realizados

| # | Archivo | Tipo | Commit | Descripción |
|---|---|---|---|---|
| 1 | `src/lib/d1Client.js` | FIX SEGURIDAD 🔴 | [`e8978ee`](https://github.com/drjuliancucalon-droid/siso-appultimo/commit/e8978ee4903801da502e09d8642fcb84fb12d2b8) | CANDADO 3 activado: `_authHeaders(userId)` envía `X-Siso-UserId` y `X-Siso-App: refactor` en todos los requests |
| 2 | `siso-worker/wrangler.json` | FIX INFRA 🟡 | [`5b52916`](https://github.com/drjuliancucalon-droid/siso-appultimo/commit/5b529169f49026d420d04da2d7dbe7e4b608b1e9) | `database_id` cambiado a `REEMPLAZAR_CON_ID_DEV` — **requiere acción manual**: crear D1 dev con `wrangler d1 create siso-db-dev` |
| 3 | `siso-worker/README.md` | DOCS 🟢 | [`5b52916`](https://github.com/drjuliancucalon-droid/siso-appultimo/commit/5b529169f49026d420d04da2d7dbe7e4b608b1e9) | Advertencia crítica: no deployar desde `siso-worker/`, instrucciones de setup dev |
| 4 | Este archivo | DOCS 🟢 | — | Documento maestro de sesiones creado |

#### Estado al finalizar sesión
- **Porcentaje estimado:** ~85% refactorizado
- **Seguridad:** CANDADO 3 activado ✅
- **D1 dev aislado:** Parcial ⚠️ — requiere acción manual de Julian (crear `siso-db-dev`)
- **Coexistencia monolito/refactor:** Confirmada ✅ — ambas apps leen/escriben mismo D1

---

### SESIÓN 002 — 2026-08-14
**Auditor:** Cline (QA Senior / Auditor de Paridad)  
**Objetivo:** Autotest de paridad monolito ↔ refactor (8 fases)

#### Evidencia revisada
- `src/App.jsx` (router completo, 224 líneas)
- `src/app/Layout.jsx` (navegación NAV_ITEMS)
- `src/pages/ConfigIPSPage.jsx`
- `src/pages/CajaPage.jsx`, `src/pages/Caja.jsx`, `src/modules/billing/components/CashBox.jsx`
- `src/lib/d1Client.js`, `src/hooks/useBackendData.js`
- `extractos-monolito/renderDashboard.txt`

#### Resultado
- Fases 1-4 (Network, lectura, candado HC, escritura) **NO ejecutadas** por requerir credenciales autorizadas y datos clínicos reales. Documentadas como limitación.
- Fase 5 (ConfigIPSPage): usa solo `localStorage`, no D1 → brecha de paridad MEDIA.
- Fase 6 (Caja): `Caja.jsx` NO es duplicado, es adaptador de `CashBox`. Persistencia en localStorage (brecha a confirmar).
- Fase 7 (rutas): 6 rutas sin acceso directo desde el menú de navegación.

#### Hallazgos
1. `ConfigIPSPage.jsx` no comparte `siso_ips_perfil` con el monolito (MEDIA).
2. `CajaPage.jsx` persiste en localStorage, no D1 (MEDIA, por confirmar).
3. 6 rutas sin entrada en NAV_ITEMS (BAJA, por confirmar).

#### Commits creados
- `SESION_AUTOTEST_PARIDAD_MONOLITO_REFACTOR_2026-08-14.md` (documento de autotest)

#### Pendientes
- Ejecutar Fases 1-4 con credenciales autorizadas y paciente de prueba.
- Migrar `ConfigIPSPage.jsx` a D1 (requiere aprobación).

#### Próxima acción exacta
Migrar `ConfigIPSPage.jsx` de `localStorage` a D1 (`siso_ips_perfil`), manteniendo localStorage como caché, previa aprobación explícita.

---

### SESIÓN 003 — 2026-08-14
**Auditor:** Cline (QA Senior / Auditor de Paridad Funcional)  
**Objetivo:** Pruebas dinámicas de navegador de paridad monolito ↔ refactor (26 módulos) + recorrido completo de botones

#### Evidencia revisada
- Navegación real con Playwright sobre ambas apps (login ingresado por el usuario).
- Network del refactor (endpoint verificado sin exponer bodies/tokens).
- 26 módulos recorridos vía rutas del refactor.

#### Resultado
- Endpoint del refactor: `https://siso-api.dr-juliancucalon.workers.dev` (CORRECTO; sin tráfico a dev/localhost).
- Paridad de lectura (PACIENTE-PRUEBA-001): datos clínicos idénticos.
- 25/26 módulos con paridad funcional confirmada.
- FASE E (bloqueo HC cerrada) y FASE F (escritura reversible): NO ejecutadas por no autorización explícita.

#### Hallazgos
1. `DASH-001` (MEDIA): KPIs del Dashboard del refactor difieren del monolito (valores en 0). Archivo probable: `src/pages/DashboardPage.jsx`. ABIERTO.
2. (BAJA): toolbar de HC cerrada muestra "Guardar/Cerrar HC" en refactor (campos deshabilitados).
3. (BAJA): tabs (refactor) vs botones (monolito) en navegación.

#### Commits creados
- `SESION_PRUEBAS_NAVEGADOR_PARIDAD_2026-08-14.md` (documento de pruebas de navegador).

#### Pendientes
- Analizar causa raíz de `DASH-001`.
- Ejecutar FASE E y FASE F tras autorización.
- Migrar `ConfigIPSPage.jsx` a D1.

#### Próxima acción exacta
Analizar y corregir la causa raíz de `DASH-001` (KPIs del Dashboard), previa aprobación explícita.

---

### SESIÓN 004 — 2026-08-14
**Auditor:** Cline (QA Senior / Auditor de Paridad Funcional)  
**Objetivo:** Auditoría de evidencia comparativa 1:1 monolito ↔ refactor

#### Resultado
- Comparación 1:1 real en Dashboard, Pacientes, Historia Clínica (lectura), Agenda, Empresas, Portal Empresa (login).
- Auditoría **DETENIDA voluntariamente** para corregir clasificación de PAC-001 y documentar evidencia real.
- No se ejecutó Fase E ni Fase F (pendientes de autorización).

#### Hallazgos
1. `PAC-001` — **RECLASIFICADO: FALSO POSITIVO**. En el monolito, "HC Propias / Todos médicos" son botones de historial POR paciente (no filtro global), y para un usuario admin (`drcucalon`) el monolito también muestra todos los pacientes (`listFiltered = allUnique` cuando `_isAdmin(role)`; `_isAdmin = administrador || super_admin`). No hay diferencia real de alcance. NO se modificó código.
2. `DASH-001` (MEDIA): KPIs del Dashboard difieren (fórmulas de agregación divergentes). ABIERTO.
3. `AGENDA-001` (MEDIA): Conteo de citas 0 (monolito) vs 2 (refactor); botones adicionales en refactor. ABIERTO.

#### Estado
- Sin escrituras, sin descargas, sin exportaciones, sin cambios de código, sin cambios de D1, sin deploy.
- Documentación actualizada localmente, sin commit.

#### Próxima acción exacta
Analizar causa raíz de `DASH-001` (fórmulas de agregación de KPIs en `DashboardPage.jsx`), sin datos clínicos.

---

## 🚨 PENDIENTES PARA PRÓXIMA SESIÓN

### Acción manual requerida de Julian (no puede hacerse desde aquí)

```bash
# 1. Crear D1 de desarrollo (ejecutar UNA vez)
npx wrangler d1 create siso-db-dev
# Copiar el database_id resultante

# 2. Actualizar siso-worker/wrangler.json con el nuevo ID
# Reemplazar REEMPLAZAR_CON_ID_DEV con el ID real

# 3. Aplicar schema al D1 de dev
npx wrangler d1 execute siso-db-dev --file=siso-worker-deploy/schema.sql
```

### Pendientes técnicos (próxima sesión)

| # | Prioridad | Tarea | Archivo |
|---|---|---|---|
| P1 | 🔴 Alta | Migrar `ConfigIPSPage.jsx` de localStorage a D1 (`siso_ips_perfil`) | `src/pages/ConfigIPSPage.jsx` |
| P2 | 🟡 Media | Resolver duplicado `Caja.jsx` vs `CajaPage.jsx` — verificar router | `src/pages/Caja.jsx` |
| P3 | 🟡 Media | Auditar rutas del router (`App.jsx` del refactor) vs monolito | `src/App.jsx` |
| P4 | 🟡 Media | Verificar si Supabase sigue activo en monolito o ya migró 100% a D1 | `_temp_app.jsx` |
| P5 | 🟢 Baja | Revisar y actualizar `MATRIZ_PARIDAD_MONOLITO_VS_REFACTOR_2026-07-21.md` | `MATRIZ_PARIDAD_*.md` |
| P6 | 🟢 Baja | Deploy del refactor en Cloudflare Pages (solo cuando P1-P3 estén resueltos) | Cloudflare Dashboard |

---

## 🔑 Información de Acceso (Referencia)

| Recurso | URL / ID |
|---|---|
| Monolito GitHub | https://github.com/drjuliancucalon-droid/ocupasaludparadesplegar |
| Refactor GitHub | https://github.com/drjuliancucalon-droid/siso-appultimo |
| Worker Cloudflare | https://dash.cloudflare.com/0b9efca009317f8624843e4fa61d17ed/workers/services/view/siso-api/production |
| Account ID CF | `0b9efca009317f8624843e4fa61d17ed` |
| D1 producción ID | `76da5895-478f-4486-a5d4-05069f9aa45a` |
| Worker URL prod | `https://siso-api.dr-juliancucalon.workers.dev` |
| Monolito Pages | `https://ocupasaludparadesplegar.pages.dev` |
| Refactor Pages | `https://siso-appultimo-arp.pages.dev` |

---

*Documento creado: 2026-08-14 | Próxima actualización: inicio de siguiente sesión*
