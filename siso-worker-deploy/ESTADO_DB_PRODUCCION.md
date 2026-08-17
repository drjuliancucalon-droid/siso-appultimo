# Estado DB Producción — siso-db

**Fecha snapshot:** 2026-08-16  
**Database ID:** `76da5895-478f-4486-a5d4-05069f9aa45a`  
**Account:** `0b9efca009317f8624843e4fa61d17ed`  
**Schema version:** 2  

## Schema siso_store (PRAGMA table_info verificado)

| cid | name | type | notnull | dflt_value | pk |
|-----|------|------|---------|------------|----|  
| 0 | key | TEXT | 0 | null | 1 |
| 1 | value | TEXT | 1 | null | 0 |
| 2 | updated_at | TEXT | 0 | datetime('now') | 0 |
| 3 | tenant | TEXT | 1 | '' | 0 |
| 4 | schema_version | INTEGER | 1 | 1 | 0 |
| 5 | created_at | TEXT | 1 | '2026-01-01T00:00:00Z' | 0 |

## Tablas presentes

| tabla | estado | notas |
|-------|--------|-------|
| `siso_store` | ✅ 3,521 registros | datos clínicos intactos |
| `siso_audit_log` | ✅ vacía | lista para trazabilidad |
| `siso_schema_migrations` | ✅ v1+v2 | control de versiones |
| `_cf_KV` | interna CF | no tocar |
| `sqlite_sequence` | interna SQLite | autoincrement tracker |

## Índices presentes (verificados)

| nombre | tabla | estado |
|--------|-------|--------|
| sqlite_autoindex_siso_store_1 | siso_store | ✅ auto (PK) |
| idx_key | siso_store | ✅ aplicado |
| idx_audit_ts | siso_audit_log | ✅ aplicado |
| idx_audit_tenant | siso_audit_log | ✅ aplicado |

## Índices pendientes (fallo conectividad transitoria)

```sql
-- Ejecutar uno a uno con buena conexión:
CREATE INDEX IF NOT EXISTS idx_tenant_key ON siso_store(tenant, key);
CREATE INDEX IF NOT EXISTS idx_updated_at ON siso_store(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_key  ON siso_audit_log(key);
```

## Datos críticos verificados

| entidad | count | clave patrón |
|---------|-------|--------------|
| Total registros | **3,521** | — |
| Pacientes | 36 | `siso_patients_*` |
| Historias clínicas | 926 | `siso_hc_*` |
| Empresas | 2 | `siso_companies_*` |

## Keys más recientes (top 15 por updated_at)

```
siso_atenciones_cerradas       679 bytes
siso_cartas_custodia           33,779 bytes
siso_ai_keys_drcucalon         53 bytes
siso_encuestas                 128,185 bytes
siso_encuestas_drcucalon       128,185 bytes
siso_cartas_custodia_drcucalon 33,779 bytes
siso_custom_meds               104 bytes
siso_ai_config_provider        27 bytes
siso_informes                  68,632 bytes
siso_doctor_data_drcucalon     437 bytes
siso_companies_shared          16,714 bytes
siso_mensajes                  2 bytes
siso_informes_drcucalon        68,632 bytes
siso_users                     9,025 bytes
siso_caja_movs_drcucalon       1,194 bytes
```

## Próximos pasos

1. `npx wrangler deploy` desde `siso-worker-deploy/` → deploy worker v2
2. Aplicar 3 índices pendientes (ver arriba)
3. Verificar cron job activo: `0 6 * * *` (ya configurado en wrangler.json)
4. Validar endpoint con: `npx wrangler tail --format pretty`
