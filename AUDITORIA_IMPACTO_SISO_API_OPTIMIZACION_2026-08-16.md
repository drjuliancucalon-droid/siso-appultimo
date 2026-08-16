# AUDITORÍA DE IMPACTO — siso-api Optimización 2026-08-16

## ESTADO VERIFICADO (lectura directa GitHub + Cloudflare)

### Worker en producción
- Nombre: `siso-api`
- Archivo activo: `siso-worker-deploy/index.js` (36,466 bytes)
- D1: `siso-db` (id: `76da5895-478f-4486-a5d4-05069f9aa45a`)
- Schema actual en D1: v1 (tabla `siso_store` + índice `idx_key` únicamente)
- **IMPORTANTE**: el `index.js` ya contiene OPT-2026-08-16 en código pero el worker NO ha sido redesplegado

### Corrección al informe anterior
- `schema_v2.sql` SÍ EXISTE en `siso-worker-deploy/schema_v2.sql` (SHA: 71a0af86)
- El informe anterior lo buscó en el SHA viejo del commit — falso negativo

## CLAVES ACTIVAS CONFIRMADAS (NO eliminar)

### Protegidas por `_PROTECTED` regex (fusión por id, nunca reemplazo)
```
siso_patients_{userId}          — lista de pacientes
siso_db_patients_{userId}       — lista de pacientes (formato alternativo)
siso_atenciones_{userId}        — registro de atenciones
siso_hc_{id}                    — historia clínica individual (CANDADO 1+2)
siso_encuestas_{userId}         — encuestas de salud
siso_companies_{userId}         — lista de empresas
siso_cartas_custodia_{userId}   — cartas de custodia
siso_saved_reports_{userId}     — reportes guardados
siso_informes_{userId}          — informes médicos
siso_users_{userId}             — usuarios del sistema
siso_portal_empresa_docs_{nit}  — documentos portal empresa (objeto .periodos)
siso_portal_empresa_atenciones_{nit} — atenciones portal empresa
```

### Protegidas por CANDADO 4 (indeletables)
```
siso_ai_keys_{userId}           — llaves IA del médico
siso_portal_empresa_*           — toda la familia portal
siso_snapshot_*                 — snapshots automáticos (rotación 7 días)
siso_users                      — usuarios raíz
```

### Claves internas (NO tocar, NO exponer en lista)
```
{key}__c0 .. {key}__cN          — chunks de valores grandes
{key}__meta                     — metadata de chunking
siso_snapshot_{YYYY-MM-DD}__*   — piezas del snapshot diario
siso_deleted_{ts}_{key}         — respaldo automático antes de DELETE
siso_autosave_cloud_{id}        — autosave temporal (limpieza >48h)
```

## ANÁLISIS DE CLAVES HUÉRFANAS

### Estado confirmado (NO huérfanas)
- `siso_informes_{userId}`: consumida en `HistoriaPage.jsx` (módulo B-05 Derivaciones) ✅
- `siso_cartas_custodia_{userId}`: consumida en `CartaCustodiaPage.jsx` (50KB) ✅

### Requieren verificación adicional
- `siso_portafolio`: presente en worker pero consumidor no confirmado en src/pages
- `siso_ips_perfil`: presente en catálogo de Cache-Control pero no verificado en frontend
- `siso_doctor_signature`: clave de catálogo — verificar si se usa en generación de PDF

## OPTIMIZACIONES APLICADAS EN index.js (código listo, deploy pendiente)

### OPT-1: Cache HTTP catálogo (GET /store/:key)
```javascript
const isCatalog = key.startsWith('siso_companies_') ||
                  key.startsWith('siso_portal_empresa_docs_') ||
                  key.startsWith('siso_ai_keys_');
const cacheControl = isCatalog
  ? 'public, max-age=30, stale-while-revalidate=60'
  : 'no-store';
```
Claves que NO se cachean (datos en tiempo real):
`siso_patients_*`, `siso_hc_*`, `siso_atenciones_*`, `siso_encuestas_*`, `siso_agendados_*`

### OPT-2: GET /store global filtrado
```sql
-- ANTES (problemático)
SELECT key, value FROM siso_store LIMIT 2000

-- DESPUÉS (optimizado)
SELECT key, value, updated_at FROM siso_store
  WHERE key NOT GLOB '*__c[0-9]*'
    AND key NOT LIKE '%__meta'
    AND key NOT LIKE 'siso_snapshot_%'
    AND key NOT LIKE 'siso_deleted_%'
  ORDER BY updated_at DESC
  LIMIT 500
```

### OPT-3: _mergeProtegidoBatch (batch pre-read)
```javascript
// ANTES: N queries SELECT individuales por cada clave protegida
// DESPUÉS: 1 query SELECT ... WHERE key IN (...) para todo el batch
const existing = await env.DB.prepare(
  `SELECT key, value FROM siso_store WHERE key IN (${placeholders})`
).bind(...keys).all();
```

## IMPACTO ESPERADO
| Operación | Antes | Después | Mejora |
|---|---|---|---|
| GET /store global | ~800ms | ~150ms | ~5x |
| POST batch 50 registros protegidos | ~2500ms | ~300ms | ~8x |
| GET companies/portal (cacheado) | ~200ms | ~5ms | ~40x |
| Queries prefijo siso_patients_ | ~400ms | ~80ms | ~5x |

## PENDIENTES (no ejecutables desde GitHub)
1. `wrangler d1 execute` — aplicar índices y columnas en D1 real
2. `wrangler deploy` — redesplegar worker con OPT-2026-08-16
3. Verificar claves `siso_portafolio`, `siso_ips_perfil`, `siso_doctor_signature` en frontend
4. Agregar `siso_ips_perfil` y `siso_doctor_signature` al grupo `isCatalog` si se confirma uso
