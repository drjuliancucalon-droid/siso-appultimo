# Índices D1 Pendientes — Schema v2

> Estado al 2026-08-16: los ALTER TABLE + tablas de trazabilidad fueron aplicados exitosamente.
> Los índices `idx_updated_at`, `idx_tenant_key`, `idx_tenant_updated` e `idx_audit_key` fallan
> con `--file` por limitación de D1 (fetch failed en upload multi-statement).
> Deben ejecutarse uno por uno con `--command`.

## Comandos a ejecutar (en orden)

```powershell
# 1. Índice por updated_at
npx wrangler d1 execute siso-db --remote --command "CREATE INDEX IF NOT EXISTS idx_updated_at ON siso_store(updated_at)"

# 2. Índice compuesto tenant+key
npx wrangler d1 execute siso-db --remote --command "CREATE INDEX IF NOT EXISTS idx_tenant_key ON siso_store(tenant, key)"

# 3. Índice compuesto tenant+updated_at
npx wrangler d1 execute siso-db --remote --command "CREATE INDEX IF NOT EXISTS idx_tenant_updated ON siso_store(tenant, updated_at)"

# 4. Índice audit_log por key
npx wrangler d1 execute siso-db --remote --command "CREATE INDEX IF NOT EXISTS idx_audit_key ON siso_audit_log(key)"

# 5. Verificación final
npx wrangler d1 execute siso-db --remote --command "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name"
```

## Índices ya presentes (NO ejecutar)
- `idx_key` ✅
- `idx_audit_ts` ✅
- `idx_audit_tenant` ✅
- `sqlite_autoindex_siso_store_1` ✅

## Estado esperado post-ejecución

| Índice | Tabla | Propósito |
|--------|-------|-----------|
| `idx_key` | siso_store | Lookup exacto por key (PK virtual) |
| `idx_updated_at` | siso_store | ORDER BY updated_at, cleanup, rotación snapshots |
| `idx_tenant_key` | siso_store | Multi-tenant: GET /store?tenant=X |
| `idx_tenant_updated` | siso_store | Multi-tenant: ORDER BY updated_at por tenant |
| `idx_audit_ts` | siso_audit_log | Búsqueda por timestamp |
| `idx_audit_tenant` | siso_audit_log | Búsqueda por tenant+ts |
| `idx_audit_key` | siso_audit_log | Trazabilidad por clave D1 |
