# MIGRACIÓN PRODUCCIÓN siso-api — 2026-08-16

## ESTADO ACTUAL CONFIRMADO
- Worker en producción: `siso-api` (Cloudflare Workers)
- D1: `siso-db` (database_id: `76da5895-478f-4486-a5d4-05069f9aa45a`)
- Schema activo: v1 (solo `siso_store` + `idx_key`)
- `index.js` ya tiene OPT-2026-08-16 en código → **NUNCA DESPLEGADO**
- `schema_v2.sql` existe pero **NUNCA APLICADO en producción**

## ORDEN DE EJECUCIÓN OBLIGATORIO

### PASO 1 — Aplicar índices v2 en D1 (SEGURO — no toca datos)
```bash
cd siso-worker-deploy

# 1a. Índice por updated_at (para cleanup y snapshots)
npx wrangler d1 execute siso-db --command \
  "CREATE INDEX IF NOT EXISTS idx_updated_at ON siso_store(updated_at)"

# 1b. Verificar índices resultantes
npx wrangler d1 execute siso-db --command \
  "SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY name"
```
Resultado esperado: `idx_key` (existente) + `idx_updated_at` (nuevo).

### PASO 2 — Agregar columnas v2 (SEGURO — columnas con DEFAULT vacío)
```bash
# 2a. Columna tenant (aislamiento multi-médico)
npx wrangler d1 execute siso-db --command \
  "ALTER TABLE siso_store ADD COLUMN tenant TEXT NOT NULL DEFAULT ''"

# 2b. Columna schema_version
npx wrangler d1 execute siso-db --command \
  "ALTER TABLE siso_store ADD COLUMN schema_version INTEGER NOT NULL DEFAULT 1"

# 2c. Columna created_at
npx wrangler d1 execute siso-db --command \
  "ALTER TABLE siso_store ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'))"

# 2d. Verificar estructura
npx wrangler d1 execute siso-db --command \
  "PRAGMA table_info(siso_store)"
```
Si algún ALTER falla con "duplicate column", significa que ya fue aplicado → continuar.

### PASO 3 — Índices compuestos v2 (DESPUÉS de columnas)
```bash
npx wrangler d1 execute siso-db --command \
  "CREATE INDEX IF NOT EXISTS idx_tenant_key ON siso_store(tenant, key)"

npx wrangler d1 execute siso-db --command \
  "CREATE INDEX IF NOT EXISTS idx_tenant_updated ON siso_store(tenant, updated_at)"
```

### PASO 4 — Crear tablas de trazabilidad
```bash
# Tabla de migraciones
npx wrangler d1 execute siso-db --command \
  "CREATE TABLE IF NOT EXISTS siso_schema_migrations (version INTEGER PRIMARY KEY, description TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT (datetime('now')))"

npx wrangler d1 execute siso-db --command \
  "INSERT OR IGNORE INTO siso_schema_migrations(version, description) VALUES (1, 'schema inicial siso_store key/value'), (2, 'agrega tenant, created_at, schema_version, indices compuestos, audit_log')"

# Tabla audit_log
npx wrangler d1 execute siso-db --command \
  "CREATE TABLE IF NOT EXISTS siso_audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL DEFAULT (datetime('now')), tenant TEXT NOT NULL DEFAULT '', operation TEXT NOT NULL, key TEXT NOT NULL, app_id TEXT NOT NULL DEFAULT 'unknown', user_id TEXT NOT NULL DEFAULT '', detail TEXT)"

npx wrangler d1 execute siso-db --command \
  "CREATE INDEX IF NOT EXISTS idx_audit_ts ON siso_audit_log(ts)"

npx wrangler d1 execute siso-db --command \
  "CREATE INDEX IF NOT EXISTS idx_audit_tenant ON siso_audit_log(tenant, ts)"
```

### PASO 5 — Deploy del worker con OPT-2026-08-16
```bash
cd siso-worker-deploy
npx wrangler deploy
```
El `index.js` ya contiene:
- ✅ Cache-Control 30s para claves de catálogo (`siso_companies_*`, `siso_portal_empresa_docs_*`, `siso_ai_keys_*`)
- ✅ GET /store global filtrado (excluye chunks/snapshots/deleted, LIMIT 500)
- ✅ `_mergeProtegidoBatch` para pre-leer claves protegidas en 1 sola query IN(...)
- ✅ Batch de escritura en chunks de 50 para POST /store masivo

### PASO 6 — Verificación post-deploy
```bash
# Verificar latencia y estado
curl -H "X-Siso-Token: $SISO_TOKEN" \
  https://siso-api.drjuliancucalon-droid.workers.dev/health

# Esperado: { ok: true, latencyMs: < 80 }

# Verificar índices activos
npx wrangler d1 execute siso-db --command \
  "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name"

# Esperado: idx_audit_tenant, idx_audit_ts, idx_key, idx_tenant_key,
#            idx_tenant_updated, idx_updated_at

# Verificar datos intactos (claves protegidas)
npx wrangler d1 execute siso-db --command \
  "SELECT key, LENGTH(value) as bytes FROM siso_store WHERE key GLOB 'siso_patients_*' OR key GLOB 'siso_hc_*' ORDER BY updated_at DESC LIMIT 10"
```
Si bytes > 0 para todas las claves → datos intactos ✅

## REGLAS DE ABORTO
- Si COUNT(*) de siso_store disminuye en cualquier paso → PARAR INMEDIATAMENTE
- Si /health devuelve ok: false → no continuar al siguiente paso
- Si alguna clave protegida tiene bytes = 0 → rollback de deploy

## ROLLBACK
```bash
# Revertir deploy al worker anterior (guarda la versión previa automáticamente)
npx wrangler rollback

# Los índices y columnas no necesitan rollback — son aditivos y no rompen v1
```

## IMPACTO ESPERADO EN VELOCIDAD
| Operación | Antes | Después | Mejora |
|---|---|---|---|
| GET /store global | ~800ms (2000 rows JSON.parse) | ~150ms (500 rows filtradas) | **~5x** |
| POST /store batch (50 registros protegidos) | ~2500ms (50 queries SELECT) | ~300ms (1 query IN + batch) | **~8x** |
| GET catálogo companies/portal | ~200ms (D1 query) | ~5ms (cache HTTP 30s) | **~40x** |
| GET /health | ~50ms (SELECT 1) | ~20ms (sin cambio) | estable |
| Queries con prefijo siso_patients_ | ~400ms (full scan) | ~80ms (idx_tenant_key) | **~5x** |
