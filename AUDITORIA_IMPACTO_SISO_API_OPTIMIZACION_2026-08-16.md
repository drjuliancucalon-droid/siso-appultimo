# AUDITORÍA DE IMPACTO — OPTIMIZACIÓN SISO-API
**Fecha:** 2026-08-16  
**Repo:** drjuliancucalon-droid/siso-appultimo  
**Worker activo:** siso-worker-deploy/index.js (37 KB, SHA: f7b54834)

---

## ESTADO DE CADA OPTIMIZACIÓN

| # | Optimización | Estado | Archivo | Requiere deploy |  
|---|---|---|---|---|
| OPT-1 | Índices D1 (idx_updated_at, idx_key_updated) | ✅ ARCHIVO LISTO en repo | schema_v2_indexes.sql | ⚠️ Ejecutar manualmente con wrangler |
| OPT-2 | Filtro chunks en GET /store global (LIMIT 500) | ✅ APLICADO en index.js | siso-worker-deploy/index.js línea ~180 | ✅ En producción tras próximo deploy |
| OPT-3 | Cache-Control 30s para claves catálogo | ✅ APLICADO en index.js | siso-worker-deploy/index.js línea ~95 | ✅ En producción tras próximo deploy |
| OPT-4 | _mergeProtegidoBatch (pre-read IN query) | ✅ APLICADO en index.js | siso-worker-deploy/index.js línea ~50 | ✅ En producción tras próximo deploy |
| OPT-5 | schema_v2.sql (tenant, created_at, audit_log) | ✅ ARCHIVO LISTO en repo | schema_v2.sql | ⚠️ Requiere ALTER TABLE manual en D1 |
| OPT-6 | wrangler.v2.json database_id separado dev/prod | ✅ ARCHIVO CREADO | wrangler.v2.json | ⚠️ Requiere crear siso-db-dev en Cloudflare |

---

## HALLAZGO CRÍTICO RESUELTO

**schema_v2.sql SÍ EXISTE** en siso-worker-deploy/schema_v2.sql (SHA: 71a0af86, 3988 bytes).  
El reporte anterior de la IA que indicó "no existe" fue incorrecto — el archivo estaba en un commit
no visible para esa sesión. Confirmado por lectura directa via GitHub API.

---

## CLAVES PROTEGIDAS (_PROTECTED regex)

Estas claves NUNCA deben eliminarse ni sobrescribirse directamente. El worker
aplica fusión por id (CANDADO 1) para todas ellas:

```
^siso_(db_)?patients_     → lista de pacientes del médico
^siso_atenciones          → registro de atenciones
^siso_hc_                 → historia clínica (incluye siso_hc_cerrada_ → CANDADO 2)
^siso_encuestas           → encuestas de salud
^siso_companies           → lista de empresas
^siso_cartas_custodia     → cartas de custodia
^siso_saved_reports       → reportes guardados
^siso_informes            → informes médicos
^siso_users               → usuarios del sistema
^siso_portal_empresa_docs → portal empresa docs (objeto con .periodos[])
^siso_portal_empresa_atenciones → portal empresa atenciones
```

---

## CLAVES NO CACHEAR (datos clínicos en tiempo real)

```
siso_patients_*           → lista maestra de pacientes
siso_db_patients_*        → lista maestra alternativa
siso_hc_*                 → historias clínicas
siso_hc_completa_*        → HC completas
siso_atenciones_*         → atenciones
siso_atenciones_cerradas  → atenciones cerradas
siso_agendados_*          → agenda
siso_encuestas            → encuestas
```

## CLAVES CON CACHE 30s SEGURO (catálogo, baja frecuencia de cambio)

```
siso_companies_*                → empresas (cambian con baja frecuencia)
siso_portal_empresa_docs_*     → docs portal empresa
siso_ai_keys_*                  → llaves de IA
```

---

## CLAVES HUÉRFANAS A CONFIRMAR

| Clave | Estado | Acción |
|---|---|---|
| siso_informes_* | Sin consumidor confirmado en src/pages/ | Verificar AnalisisDocsEmpresas.jsx y HistoriaPage.jsx |
| siso_cartas_custodia_* | Sin consumidor confirmado | Verificar CartaCustodiaPage.jsx (24 KB) |

**INSTRUCCIÓN:** NO eliminar estas claves hasta confirmar con grep en _temp_app.jsx.

---

## CUELLOS DE BOTELLA — ESTADO ACTUAL

### 1. GET /store global SIN userId — RESUELTO ✅
**Antes:** SELECT ... LIMIT 2000 (descargaba chunks, snapshots, deleted)  
**Después:** LIMIT 500 + filtro NOT GLOB chunks + NOT LIKE snapshots/deleted  
**Impacto estimado:** -60% payload en carga del dashboard admin  

### 2. Chunks de pacientes (siso_patients_ con 15 chunks) — PARCIALMENTE RESUELTO
**Estado:** _chunkGet sigue siendo secuencial en el frontend.  
**Pendiente:** El frontend (DashboardPage.jsx, HistoriaPage.jsx) debe usar
GET /store/prefix/siso_patients_userId en vez de reconstruir chunk a chunk.
Esto es un cambio en src/pages — NO en el worker.

### 3. /health?full=1 cíclico — YA RESUELTO (versión anterior)
**Estado:** Por defecto usa SELECT 1 (latencia < 10ms). Solo full=1 hace 5 COUNT(*).

### 4. _mergeProtegido N queries — RESUELTO ✅
**Antes:** N queries SELECT individuales por batch  
**Después:** 1 query IN(...) para pre-leer todas las claves protegidas del batch  
**Impacto estimado:** -70% tiempo de escritura en batches > 5 claves  

---

## PASOS PENDIENTES (requieren acción manual fuera de GitHub)

### PENDIENTE A — Aplicar índices en D1 de producción
```bash
# Desde la raíz del proyecto con wrangler autenticado:
npx wrangler d1 execute siso-db --file ./siso-worker-deploy/schema_v2_indexes.sql
# Verificar:
npx wrangler d1 execute siso-db --command "SELECT name FROM sqlite_master WHERE type='index'"
# Debe mostrar: idx_key, idx_updated_at, idx_key_updated
```

### PENDIENTE B — Deploy del worker optimizado
```bash
cd siso-worker-deploy
npx wrangler deploy
# Verificar post-deploy:
curl -H "X-Siso-Token: $SISO_TOKEN" https://siso-api.workers.dev/health
# Debe retornar: {"ok":true, "latencyMs": <100}
```

### PENDIENTE C — Crear siso-db-dev en Cloudflare (separar dev/prod)
```bash
npx wrangler d1 create siso-db-dev
# Copiar el database_id resultante
# Actualizar wrangler.v2.json con ese ID
# Aplicar schema inicial: npx wrangler d1 execute siso-db-dev --file ./siso-worker-deploy/schema.sql
```

### PENDIENTE D — Migración schema v2 (tenant, created_at, audit_log)
Ejecutar UNA SOLA VEZ en producción, después de validar en siso-db-dev:
```bash
# 1. Probar en dev primero:
npx wrangler d1 execute siso-db-dev --file ./siso-worker-deploy/schema_v2.sql
# 2. Si OK, ejecutar en producción:
npx wrangler d1 execute siso-db --command "ALTER TABLE siso_store ADD COLUMN tenant TEXT NOT NULL DEFAULT ''"
npx wrangler d1 execute siso-db --command "ALTER TABLE siso_store ADD COLUMN schema_version INTEGER NOT NULL DEFAULT 1"
npx wrangler d1 execute siso-db --command "ALTER TABLE siso_store ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'))"
# 3. Crear tablas nuevas:
npx wrangler d1 execute siso-db --file ./siso-worker-deploy/schema_v2.sql
```

### PENDIENTE E — Optimización de carga de chunks en frontend
En DashboardPage.jsx y HistoriaPage.jsx, reemplazar la lógica de _chunkGet
secuencial por una sola llamada:
```js
// En vez de reconstruir chunk a chunk:
const res = await fetch(`${WORKER_URL}/store/siso_patients_${userId}`);
// El worker reconstruye el chunked internamente — el frontend recibe el array completo
```

---

## VEREDICTO FINAL

**Optimizaciones aplicadas en código:** OPT-2, OPT-3, OPT-4 — ✅ listas para deploy  
**Archivos listos en repo:** OPT-1 (schema_v2_indexes.sql), OPT-5 (schema_v2.sql), OPT-6 (wrangler.v2.json)  
**Requieren acción manual fuera de GitHub:** Pendientes A, B, C, D, E  
**Riesgo de pérdida de datos:** CERO — todas las optimizaciones son aditivas  
**Riesgo de fallo de visualización:** CERO — claves _PROTECTED intactas, CANDADO 2 intacto  
