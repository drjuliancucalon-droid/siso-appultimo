-- SISO DB — Índices de rendimiento v2
-- Aplicar con: npx wrangler d1 execute siso-db --file ./schema_v2_indexes.sql
-- SEGURO: solo CREATE INDEX IF NOT EXISTS — no modifica datos existentes
-- Fecha: 2026-08-16

-- Índice para queries de updated_at (snapshot GC, rotación temporal)
CREATE INDEX IF NOT EXISTS idx_updated_at 
  ON siso_store(updated_at);

-- Índice compuesto para búsquedas por prefijo de clave + fecha
-- Acelera: WHERE key LIKE 'siso_patients_%' ORDER BY updated_at DESC
CREATE INDEX IF NOT EXISTS idx_key_updated 
  ON siso_store(key, updated_at);

-- Índice parcial lógico: claves de HC (más consultadas)
-- SQLite no soporta índices parciales con WHERE en D1, pero el índice compuesto
-- key+updated_at cubre este patrón eficientemente.
-- Para D1 future: CREATE INDEX IF NOT EXISTS idx_hc ON siso_store(key) WHERE key LIKE 'siso_hc_%';

-- Verificar índices aplicados:
-- SELECT name, sql FROM sqlite_master WHERE type='index' ORDER BY name;
