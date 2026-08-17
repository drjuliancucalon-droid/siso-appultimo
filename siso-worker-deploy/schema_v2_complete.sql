-- =============================================================
-- SISO-DB Schema v2 — Estado canónico producción 2026-08-16
-- Compatible con Cloudflare D1 (SQLite)
-- REGLA D1: DEFAULT solo acepta literales, NO funciones como datetime('now')
-- =============================================================

-- ---------------------------------------------------------------
-- TABLA PRINCIPAL: siso_store
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS siso_store (
  key            TEXT PRIMARY KEY,
  value          TEXT NOT NULL,
  updated_at     TEXT DEFAULT (datetime('now')),
  tenant         TEXT NOT NULL DEFAULT '',
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT '2026-01-01T00:00:00Z'
);

CREATE INDEX IF NOT EXISTS idx_key         ON siso_store(key);
CREATE INDEX IF NOT EXISTS idx_tenant_key  ON siso_store(tenant, key);
CREATE INDEX IF NOT EXISTS idx_updated_at  ON siso_store(updated_at DESC);

-- ---------------------------------------------------------------
-- TABLA: siso_audit_log
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS siso_audit_log (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ts        TEXT NOT NULL DEFAULT '2026-01-01T00:00:00Z',
  tenant    TEXT NOT NULL DEFAULT '',
  operation TEXT NOT NULL,
  key       TEXT NOT NULL,
  app_id    TEXT NOT NULL DEFAULT 'unknown',
  user_id   TEXT NOT NULL DEFAULT '',
  detail    TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_ts     ON siso_audit_log(ts);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON siso_audit_log(tenant, ts);
CREATE INDEX IF NOT EXISTS idx_audit_key    ON siso_audit_log(key);

-- ---------------------------------------------------------------
-- TABLA: siso_schema_migrations
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS siso_schema_migrations (
  version     INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at  TEXT NOT NULL DEFAULT '2026-01-01T00:00:00Z'
);

INSERT OR IGNORE INTO siso_schema_migrations(version, description, applied_at) VALUES
  (1, 'schema v1 inicial',                            '2026-01-01T00:00:00Z'),
  (2, 'tenant + schema_version + audit + indices v2', '2026-08-16T00:00:00Z');

-- =============================================================
-- NOTAS D1:
-- 1. datetime('now') solo funciona en DEFAULT de CREATE TABLE, NO en ALTER TABLE
-- 2. Para timestamps reales en filas nuevas, el Worker debe pasar
--    new Date().toISOString() explícitamente en INSERT/UPDATE
-- 3. Registros existentes: created_at = '2026-01-01T00:00:00Z' (heredado ALTER TABLE)
-- =============================================================
