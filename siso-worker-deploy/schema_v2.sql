-- SISO Schema v2 — Robusto con aislamiento multi-tenant y trazabilidad
-- Auditoría 2026-08-16: fixes C-02, agrega tenant, created_at, audit_log
-- MIGRACIÓN: ejecutar en D1 de producción ANTES de deployar worker v2

-- ── TABLA PRINCIPAL ────────────────────────────────────────────────────
-- v2: agrega tenant (aislamiento), created_at (inmutable), schema_version
CREATE TABLE IF NOT EXISTS siso_store (
  key            TEXT    NOT NULL,
  tenant         TEXT    NOT NULL DEFAULT '',   -- ej: 'drjuliancucalon'
  value          TEXT    NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (key)  -- mantiene compatibilidad con v1
);

-- Índice compuesto para queries por tenant (fundamental para multi-médico)
CREATE INDEX IF NOT EXISTS idx_tenant_key    ON siso_store(tenant, key);
CREATE INDEX IF NOT EXISTS idx_key           ON siso_store(key);          -- backward compat v1
CREATE INDEX IF NOT EXISTS idx_updated_at    ON siso_store(updated_at);   -- para cleanup/snapshots
CREATE INDEX IF NOT EXISTS idx_tenant_updated ON siso_store(tenant, updated_at);

-- ── MIGRACIONES ────────────────────────────────────────────────────────
-- Tracking de versiones aplicadas — permite saber exactamente qué versión
-- de schema está corriendo en producción sin revisar la BD manualmente.
CREATE TABLE IF NOT EXISTS siso_schema_migrations (
  version     INTEGER PRIMARY KEY,
  description TEXT    NOT NULL,
  applied_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO siso_schema_migrations(version, description)
  VALUES (1, 'schema inicial siso_store key/value'),
         (2, 'agrega tenant, created_at, schema_version, índices compuestos, audit_log');

-- ── AUDIT LOG ──────────────────────────────────────────────────────────
-- Trazabilidad de operaciones críticas: DELETE, HC cerradas, candados.
-- IMPORTANTE: solo operaciones de alto riesgo — no loggear cada GET/POST
-- para no llenar D1. Rotación automática en /cleanup (>90 días).
CREATE TABLE IF NOT EXISTS siso_audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ts         TEXT    NOT NULL DEFAULT (datetime('now')),
  tenant     TEXT    NOT NULL DEFAULT '',
  operation  TEXT    NOT NULL,  -- 'DELETE', 'HC_CERRADA_INTENTO', 'CANDADO3_BLOCK', etc.
  key        TEXT    NOT NULL,
  app_id     TEXT    NOT NULL DEFAULT 'unknown',
  user_id    TEXT    NOT NULL DEFAULT '',
  detail     TEXT             -- JSON con contexto adicional
);
CREATE INDEX IF NOT EXISTS idx_audit_ts     ON siso_audit_log(ts);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON siso_audit_log(tenant, ts);
CREATE INDEX IF NOT EXISTS idx_audit_key    ON siso_audit_log(key);

-- ── MIGRACION v1 → v2 (EJECUTAR UNA VEZ EN PRODUCCION) ────────────────
-- Agrega columnas faltantes a tabla existente (D1 soporta ALTER TABLE ADD COLUMN)
-- Si las columnas ya existen, estas sentencias fallan silenciosamente (IF NOT EXISTS no existe
-- en SQLite para columnas, pero D1 retorna error ignorable en batch).
-- Usar el endpoint POST /admin/migrate del worker v2 que ejecuta esto de forma segura.

-- ALTER TABLE siso_store ADD COLUMN tenant TEXT NOT NULL DEFAULT '';
-- ALTER TABLE siso_store ADD COLUMN schema_version INTEGER NOT NULL DEFAULT 1;
-- ALTER TABLE siso_store ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'));
-- UPDATE siso_store SET tenant = '' WHERE tenant IS NULL;
-- (Las líneas de ALTER están comentadas — ejecutar manualmente via wrangler d1 execute)
