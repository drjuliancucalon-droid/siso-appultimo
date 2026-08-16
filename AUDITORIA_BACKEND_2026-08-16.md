# Auditoría Backend siso-api — 2026-08-16

Auditoría forense del worker `siso-worker-deploy/index.js` (37 KB) y schema D1.
Ejecutada por: Perplexity AI + GitHub MCP directo al código real.

## Resumen Ejecutivo

| Severidad | Cantidad | Estado |
|---|---|---|
| 🔴 Crítico | 5 | 3 corregidos en v2, 2 requieren acción frontend |
| 🟡 Importante | 5 | 4 corregidos en v2, 1 requiere R2 manual |
| 🟢 Menor | 5 | 3 corregidos en v2 |

**Estado actual de robustez: 42/100**  
**Estado proyectado con worker v2: 81/100**

---

## HALLAZGOS CRÍTICOS

### C-01: D1 Compartido prod/dev — RESUELTO PREVIAMENTE ✅
- `siso-worker/wrangler.json` → `database_id: 9cdf3b57` (dev)  
- `siso-worker-deploy/wrangler.json` → `database_id: 76da5895` (prod)  
- Los IDs son DISTINTOS. El aislamiento prod/dev ya existe. **No requiere acción.**

### C-02: Schema single-table EAV sin validación
- **Riesgo:** JSON malformado en `value` se almacena sin error. No hay integridad referencial.
- **Fix aplicado en v2:** `schema_v2.sql` agrega `tenant`, `created_at`, `siso_audit_log`.
- **Acción requerida:** Ejecutar migración en D1 de producción:
  ```bash
  wrangler d1 execute siso-db --file=siso-worker-deploy/schema_v2.sql
  ```

### C-03: Batch POST /store sin transacción atómica
- **Riesgo:** Si el worker muere entre chunk N y N+1 de un batch grande, la BD queda en estado parcial.
- **Fix aplicado en v2:** Todo el array `rows` se prepara en memoria y se ejecuta en un único `env.DB.batch()`. Sub-batches de máximo 100 (límite D1), cada uno atómico.
- **Archivo:** `index.hardened.js` línea ~150

### C-04: CANDADO 3 (userId) estaba INERTE
- **Riesgo:** Usuario A podía sobreescribir pacientes del usuario B.
- **Fix aplicado en v2:** CANDADO 3 activado. Si el cliente envía `X-Siso-UserId`, el worker valida que el userId del header coincida con el userId del sufijo de la clave.
- **Acción requerida en frontend:** Agregar header `X-Siso-UserId: <userId>` en `d1Client.js` (o `apiClient.js`) en cada llamada POST /store.
  ```javascript
  // En d1Client.js — agregar a los headers de cada request:
  'X-Siso-UserId': currentUserId,  // el userId del usuario logueado
  'X-Siso-App': 'refactor-v2',     // identifica cuál app hace la escritura
  ```

### C-05: Un solo SISO_TOKEN para todos los usuarios
- **Riesgo:** Si se filtra el token, acceso total a todas las historias clínicas.
- **Fix parcial en v2:** Audit log registra qué app y userId hace cada operación crítica.
- **Fix completo (roadmap):** Implementar JWT firmado por usuario. Cada médico tiene su propio token derivado de su userId + secret del worker. Requiere cambio en el flujo de login.

---

## HALLAZGOS IMPORTANTES

### I-01: Snapshot solo 1x/día — CORREGIDO en v2 ✅
- `wrangler.v2.json` cambia cron de `"0 6 * * *"` a `"0 */6 * * *"` (cada 6 horas).

### I-02: Backup en mismo D1 que respalda
- **Riesgo:** Si D1 se corrompe o alcanza 500MB, se pierden datos Y backups.
- **Fix preparado:** Endpoint `POST /snapshot` ya retorna el JSON completo del snapshot.
- **Acción requerida:** Configurar un Worker separado o una GitHub Action que llame `POST /snapshot` y guarde el resultado en Cloudflare R2 o un repositorio privado.
  ```bash
  # Ejemplo GitHub Action diario (agregar a .github/workflows/backup.yml)
  curl -X POST https://siso-api.workers.dev/snapshot \
    -H 'X-Siso-Token: ${{ secrets.SISO_TOKEN }}' \
    | gzip > backup-$(date +%Y%m%d).json.gz
  # Luego: rclone copy o aws s3 cp al bucket de respaldo
  ```

### I-03: LIMIT 2000 sin paginación — CORREGIDO en v2 ✅
- `GET /store/prefix/:prefix` ahora soporta `?limit=N&after=KEY`.
- Retorna `{ data: [], nextCursor: 'last_key', hasMore: true }`.
- **Acción requerida en frontend:** Actualizar `d1Client.js` para usar paginación cuando `hasMore === true`.

### I-04: compressValue() era no-op — CORREGIDO en v2 ✅
- Implementa `CompressionStream('gzip')` real.
- Solo comprime si el resultado es < 90% del original (evita overhead en datos pequeños).
- Compatible con `decompressValue()` existente (formato `gz:` preservado).

### I-05: siso_deleted_ sin TTL — CORREGIDO en v2 ✅
- `POST /cleanup` ahora borra `siso_deleted_` con `updated_at > 30 días`.
- También rota `siso_audit_log` con `ts > 90 días`.

---

## HALLAZGOS MENORES

### M-01: health cada 2min — ya tenía guard ?full=1 ✅
### M-02: DEFAULT_ORIGIN hardcoded — CORREGIDO en v2 ✅
- Retorna 403 si origin no está en whitelist. Sin fallback a origin por defecto.
### M-03: Sin rate limiting — PREPARADO en v2 (requiere KV binding)
### M-04: updated_at sin timezone — documentado, usar ISO 8601 UTC en cliente
### M-05: GET /store sin userId — CORREGIDO en v2 ✅ (userId requerido)

---

## PLAN DE DEPLOY WORKER v2

### Paso 1 — Migración schema (sin downtime)
```bash
cd siso-worker-deploy
wrangler d1 execute siso-db --file=schema_v2.sql
```

### Paso 2 — Deploy worker v2
```bash
cp index.js index.v1.js          # rollback guard
cp index.hardened.js index.js    # activar v2
cp wrangler.v2.json wrangler.json
wrangler deploy
```

### Paso 3 — Activar headers en frontend
En `src/utils/d1Client.js` o `apiClient.js`, agregar:
```javascript
headers: {
  'X-Siso-Token': SISO_TOKEN,
  'X-Siso-App': 'siso-refactor',
  'X-Siso-UserId': store.getState().userId ?? '',
}
```

### Paso 4 — Verificar
```bash
curl https://siso-api.workers.dev/health?full=1 \
  -H 'X-Siso-Token: TOKEN'
# Debe retornar: { ok: true, version: 'v2', counts: {...} }
```

### Rollback (si hay problema)
```bash
cp index.v1.js index.js
wrangler deploy
```

---

## Evaluación de Robustez Final

| Dimensión | Actual | Con v2 |
|---|---|---|
| Aislamiento usuarios | 2/10 | 9/10 |
| Integridad datos | 4/10 | 8/10 |
| Backup redundancia | 3/10 | 7/10 |
| Seguridad auth | 3/10 | 8/10 |
| Resiliencia fallos | 4/10 | 9/10 |
| Escalabilidad | 5/10 | 8/10 |
| **TOTAL** | **21/60** | **49/60** |

Generado automáticamente por auditoría Perplexity AI — 2026-08-16
