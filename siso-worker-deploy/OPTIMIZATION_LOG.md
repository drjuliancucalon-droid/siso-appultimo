# SISO-API Optimization Log — 16-Aug-2026

## Cambios Aplicados (index.js)

### OPT-01: Cache HTTP para claves de catálogo (GET /store/:key)
- **Qué:** `Cache-Control: public, max-age=30, stale-while-revalidate=60` para claves que empiecen con `siso_companies_`, `siso_portal_empresa_docs_`, `siso_ai_keys_`
- **Por qué:** Estas claves se leen frecuentemente pero cambian poco. 30s de cache en Cloudflare CDN elimina la mayoría de queries a D1 para estas claves.
- **Impacto:** 0 riesgo de datos incorrectos (TTL corto). HC, pacientes y atenciones siguen con `no-store`.

### OPT-02: GET /store sin userId — filtrado y LIMIT reducido
- **Antes:** `SELECT key, value FROM siso_store LIMIT 2000` — devolvía chunks internos, snapshots, deleted
- **Ahora:** Filtra `__c[0-9]*`, `__meta`, `siso_snapshot_*`, `siso_deleted_*` y reduce a LIMIT 500
- **Por qué:** La lista general no necesita internals. La rama con `userId` NO fue tocada.
- **Riesgo:** NINGUNO — las claves eliminadas del resultado son internas al worker.

### OPT-03: _mergeProtegido — batch pre-read
- **Antes:** Para cada clave protegida en un batch de POST, hacía SELECT individual + SELECT de chunks
- **Ahora:** Pre-lee todas las claves del batch en una sola query `WHERE key IN (...)` antes del loop
- **Impacto:** En un batch de 50 pacientes → de ~50-100 queries individuales a 1-2 queries batch
- **Seguridad:** La lógica de merge (CANDADO 1) no fue modificada, solo el orden de lectura.

### OPT-04: Índices compuestos (schema_v2_indexes.sql)
- `idx_updated_at ON siso_store(updated_at)` — para queries de snapshot y GC temporal
- `idx_key_prefix ON siso_store(key)` — ya existe como idx_key, refuerzo para LIKE queries
- **Aplicar con:** `npx wrangler d1 execute siso-db --file ./schema_v2_indexes.sql`

## Claves NO Modificadas (Protegidas)
- `_PROTECTED` regex: intacto
- `_mergeProtegido` logic: intacta (solo pre-read cambiado)
- `_mergePeriodosObjeto`: intacta
- CANDADO 2 (HC cerradas): intacto
- CANDADO 3 (userId mismatch): intacto  
- CANDADO 4 (undeletable): intacto
- CANDADO 5 (backup antes de delete): intacto
- `runDailySnapshot`: intacto
- `POST /store/chunked`: intacto
- `POST /store/append`: intacto
- `POST /store/merge`: intacto

## Verificación Post-Deploy
```bash
# 1. Verificar health
curl -H "X-Siso-Token: $SISO_TOKEN" https://siso-api.workers.dev/health
# Esperado: {"ok":true, "latencyMs": < 100}

# 2. Verificar storage stats
curl -H "X-Siso-Token: $SISO_TOKEN" https://siso-api.workers.dev/storage-stats
# Confirmar que filas y mb_usados son coherentes

# 3. Verificar que pacientes siguen intactos
curl -H "X-Siso-Token: $SISO_TOKEN" \
  "https://siso-api.workers.dev/store/siso_patients_drcucalon"
# Debe retornar array con todos los pacientes
```

## Índices D1 — Aplicar Manualmente
```bash
cd siso-worker-deploy
npx wrangler d1 execute siso-db --file ./schema_v2_indexes.sql
# Verificar:
npx wrangler d1 execute siso-db --command "SELECT name, sql FROM sqlite_master WHERE type='index'"
```
