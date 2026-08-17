-- ÍNDICES v2 — aplicar en D1 producción (SAFE: no modifica datos)
-- Ejecutar STATEMENT POR STATEMENT con --command (no --file) por limitación D1
-- Fecha: 2026-08-16

-- Índice por updated_at (cleanup/snapshots/ORDER BY)
CREATE INDEX IF NOT EXISTS idx_updated_at     ON siso_store(updated_at);

-- Índices compuestos para multi-tenant (requiere columna tenant ya agregada)
CREATE INDEX IF NOT EXISTS idx_tenant_key     ON siso_store(tenant, key);
CREATE INDEX IF NOT EXISTS idx_tenant_updated ON siso_store(tenant, updated_at);

-- Índice backward-compat v1 (ya existe, IF NOT EXISTS previene error)
CREATE INDEX IF NOT EXISTS idx_key            ON siso_store(key);

-- Índices audit_log (tabla ya creada)
CREATE INDEX IF NOT EXISTS idx_audit_ts       ON siso_audit_log(ts);
CREATE INDEX IF NOT EXISTS idx_audit_tenant   ON siso_audit_log(tenant, ts);
CREATE INDEX IF NOT EXISTS idx_audit_key      ON siso_audit_log(key);

-- NOTA: D1 no acepta --file con múltiples statements en la misma llamada HTTP.
-- Aplicar índice por índice con:
--   npx wrangler d1 execute siso-db --remote --command "<sentencia>"
