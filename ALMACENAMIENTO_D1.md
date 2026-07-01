# 📦 ALMACENAMIENTO D1 — SISO OcupaSalud

> **Auditoría forense completa — 1 de julio de 2026**  
> Basada en: backend `siso-worker/index.js` (318 líneas), `d1Client.js` (425 líneas), monolito `App.jsx` (~59K líneas), `handleCloseHC()` en `HistoriaPage.jsx`

---

## 🔗 INFRAESTRUCTURA

| Componente | Valor |
|-----------|-------|
| **Worker URL** | `https://siso-api.dr-juliancucalon.workers.dev` |
| **Panel Cloudflare** | `https://dash.cloudflare.com/0b9efca009317f8624843e4fa61d17ed/workers/services/view/siso-api/production` |
| **Auth** | Header `X-Siso-Token` (secreto en variable de entorno `SISO_TOKEN`) |
| **DB** | Cloudflare D1 (SQLite en el edge) |
| **Database ID** | `76da5895-478f-4486-a5d4-05069f9aa45a` |
| **Binding** | `DB` → `siso-db` |
| **Cron** | `0 6 * * *` (6:00 AM UTC = 1:00 AM Colombia) — snapshot diario |

---

## 🗄️ ESQUEMA

```sql
-- Única tabla. Modelo key-value.
CREATE TABLE IF NOT EXISTS siso_store (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,         -- JSON serializado
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_key ON siso_store(key);
```

**Características:**
- **Sin límite de filas** (D1 escala horizontalmente)
- **Sin TTL automático** — los snapshots rotan manualmente vía cron
- **Chunking automático** desde el frontend: payloads >500KB se parten en piezas `__c0`, `__c1`, etc. y se reconstruyen con metadato `__meta`
- **Optimistic Locking**: header `If-Match` con timestamp para prevenir escrituras concurrentes (HTTP 409 en conflicto)

---

## 🌐 API DEL WORKER — ENDPOINTS COMPLETOS

### `GET /store/:key`
Obtiene un valor por clave. Retorna:
```json
[{ "key": "...", "value": {...}, "ts": "2026-07-01T..." }]
```
Headers: `ETag`, `X-Siso-Ts`

### `GET /store/prefix/:prefix`
Busca claves por prefijo (LIKE `prefix%`). Límite: 2000 resultados.

### `GET /store?userId=X`
Lista todas las claves, opcionalmente filtradas por userId. Límite: 2000.

### `POST /store`
Upsert masivo. Soporta:
- **Batch**: array de `{key, value}` en lotes de 50
- **If-Match**: escritura optimista (409 si el timestamp no coincide)

### `DELETE /store/:key`
Elimina una clave.

### `GET /health`
Healthcheck con contadores:
```json
{
  "ok": true,
  "counts": { "total": 150, "patients_keys": 45, "portal_docs": 30, "hc_completas": 25, "portal_empresa_keys": 18 },
  "latencyMs": 42,
  "ts": "2026-07-01T14:00:00Z"
}
```

### `POST /snapshot` + `GET /snapshot/list`
Dispara snapshot manual o lista snapshots existentes.

---

## ⏰ CRON — SNAPSHOT DIARIO

| Parámetro | Valor |
|-----------|-------|
| **Expresión** | `0 6 * * *` (diario 6:00 AM UTC) |
| **Función** | `runDailySnapshot(env)` |
| **Estrategia** | Lee TODAS las claves → reconstruye chunks → serializa → parte en piezas de 500KB → guarda como `siso_snapshot_YYYY-MM-DD__c0..cN` |
| **Rotación** | Borra snapshots con fecha > 7 días atrás |
| **Metadato** | `siso_snapshot_YYYY-MM-DD__manifest` con totalKeys, totalBytes, pieceCount, durationMs |

---

## 🛡️ SEGURIDAD — CAPA POR CAPA

### Capa 1: Autenticación del Worker
- **TODAS las rutas** requieren `X-Siso-Token` header (excepto `OPTIONS` preflight)
- El token se compara contra `env.SISO_TOKEN` (variable de entorno secreta)
- Si no coincide → **HTTP 401 Unauthorized**

### Capa 2: CORS — Orígenes permitidos
```js
ALLOWED_ORIGINS = [
  "https://ocupasaludparadesplegar.pages.dev",       // Monolito producción
  "https://ocupasaludparadesplegar-f4q.pages.dev",   // Monolito (alias git)
  "https://siso-appultimo-arp.pages.dev",            // Refactorizado producción
]
// + wildcards: *.ocupasaludparadesplegar*.pages.dev + *.siso-appultimo-arp.pages.dev
// + localhost:5173, localhost:4173
```

### Capa 3: Protección de datos en tránsito
- **HTTPS obligatorio** (Cloudflare Pages + Workers)
- **TLS 1.3** en el edge
- Headers CORS explícitos (no wildcard `*`)

### Capa 4: Protección de datos en reposo
- D1 encripta datos en reposo (Cloudflare managed)
- No se almacenan contraseñas en texto plano (SHA-256 + PBKDF2)
- **El portal NUNCA expone diagnósticos** — solo muestra concepto de aptitud, cargo, tipo de examen (Art. 16 Res. 1843/2025)

### Capa 5: Rate limiting implícito
- D1 tiene cuota de 100 filas/consulta y 500 filas/escritura por batch
- El frontend hace retry con backoff exponencial (1s, 2s, 4s)

---

## 🔑 MAPA COMPLETO DE CLAVES D1

### 📂 CATEGORÍA: Pacientes / HC

| Clave | Escritura | Lectura | Formato | Tamaño aprox |
|-------|----------|---------|---------|-------------|
| `siso_db_patients_{userId}` | `handleSave` en HistoriaPage | `useBackendData` en Dashboard, Pacientes, Reportes | Array de objetos | 10-200 KB |
| `siso_patients_{userId}` | `handleSave` → auto-save cada 60s si dirty | Misma página | Array (chunked si >500KB) | Variable |
| `siso_hc_completa_{docNumero}` | `handleCloseHC` | Portal (búsqueda individual) | Objeto 30+ campos con _doctorData, _firma | 2-5 KB |

### 📂 CATEGORÍA: Portal Empresa (6 claves)

| Clave | Escritura | Lectura | Formato | Tamaño aprox |
|-------|----------|---------|---------|-------------|
| ⭐ `siso_portal_empresa_atenciones_{nit}` | `handleCloseHC` — merge incremental | Portal empresa (principal) | `{atenciones:[...], _firma, _doctorData, nombre, nit}` | 5-200 KB |
| `siso_portal_empresa_{nit}` | `handleCloseHC` | Portal empresa (índice) | Array `[{id, docNumero, ...}]` | 2-50 KB |
| `siso_portal_empresa_docs_{nit}` | `handleCloseHC` | Portal empresa (validación código) | Array `[{periodo, docNumero, codigoAcceso}]` | 1-20 KB |
| `siso_portal_doc_{cedula}` | `handleCloseHC` | Portal empresa (búsqueda por cc) | Objeto portalData (~25 campos) | 1-3 KB |
| `siso_portal_{codigo}` | `handleCloseHC` | Portal empresa (búsqueda por código) | Objeto portalData | 1-3 KB |

### 📂 CATEGORÍA: Documentos del portal

| Clave | Escritura | Lectura | Formato | Tamaño aprox |
|-------|----------|---------|---------|-------------|
| `siso_saved_bills_{userId}` | Módulo facturación / handleCloseHC | Portal empresa (DOCUMENTOS → Cuentas) | Array de facturas | 1-50 KB |
| `siso_cartas_custodia_{userId}` | `CartaCustodiaPage` → `d1WriteArrayMerge` | Portal empresa (DOCUMENTOS → Custodia) | Array de cartas | 1-30 KB |
| `siso_caja_movs_{userId}` | `handleCloseHC` (auto-billing) | Portal empresa (DOCUMENTOS → Cuentas complemento) | Array de movimientos | 1-100 KB |

### 📂 CATEGORÍA: Usuarios / Configuración

| Clave | Escritura | Lectura | Formato |
|-------|----------|---------|---------|
| `siso_users` | Panel de usuarios | Login, Dashboard | Array de usuarios |
| `siso_companies_{userId}` | `CompaniesPage` | Toda la app | Array de empresas |
| `siso_companies_shared` | Admin | Portal empresa (login) | Array de empresas compartidas |
| `siso_doctor_data_{userId}` | Perfil médico | HistoriaPage, Portal | Objeto doctorData |
| `siso_encuestas` | `EncuestasTab` | Empresas (tab encuestas) | Array de encuestas |
| `siso_encuesta_resps_{encId}` | `SurveyResponsePage` | EncuestasTab | Array de respuestas |
| `siso_encuesta_importados_{encId}` | `EncuestasTab` (Excel import) | EncuestasTab | Array de trabajadores |
| `siso_agendados` | `handleSave` (auto-agenda) | AgendaPage | Array de citas |
| `siso_informes_{userId}` | `AnalisisDocsTab` (IA) | Portal empresa | Array de informes |

### 📂 CATEGORÍA: Snapshots / Sistema

| Clave | Escritura | Lectura | Formato |
|-------|----------|---------|---------|
| `siso_snapshot_YYYY-MM-DD__c0..cN` | Cron (diario 6 AM) | Recuperación manual | Piezas de 500KB |
| `siso_snapshot_YYYY-MM-DD__meta` | Cron | Recuperación | Metadatos de reconstrucción |
| `siso_snapshot_YYYY-MM-DD__manifest` | Cron | `/snapshot/list` | Resumen del snapshot |

---

## ⚡ FRONTEND CLIENT (`d1Client.js`) — MECANISMOS

### Chunking automático
```js
CHUNK_THRESHOLD = 500_000 // 500KB
```
Si el payload JSON excede 500KB:
1. Se serializa a string
2. Se parte en piezas de 500KB → `__c0`, `__c1`, ...
3. Se escribe metadato `__meta` con `{chunked: true, count: N}`
4. Al leer, `d1Get` detecta `__meta` y reconstruye uniendo las piezas

### Retry con backoff exponencial
```js
MAX_RETRIES = 3           // 3 intentos
BASE_DELAY = 1000         // 1s → 2s → 4s
```
Solo reintenta en errores: network, 502, 503, 504.  
**NO** reintenta en: 400, 401, 403, 404, 409 (conflicto).  
El 409 (If-Match mismatch) se propaga para que el caller maneje el conflicto.

### Optimistic locking (If-Match)
```js
headers: { "If-Match": timestamp }
```
Si dos usuarios editan la misma clave simultáneamente:
1. Ambos envían `If-Match` con el timestamp que tenían al leer
2. El Worker compara con `updated_at` real
3. Si no coincide → **HTTP 409** + timestamp actual
4. El frontend debe re-leer y re-intentar

---

## 🔄 FLUJO COMPLETO END-TO-END

### Fase 1: Creación del paciente
```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  AGENDA  │ ──→ │ HistoriaPage │ ──→ │ D1       │
│ (cita)   │     │ handleSave() │     │ siso_db_ │
└──────────┘     └──────────────┘     │ patients │
       │                              │ siso_    │
       │  ┌──────────────┐            │ agendados│
       └─→│ handleSave() │──────────→ │          │
          │ (auto-agenda)│            └──────────┘
          └──────────────┘
```

### Fase 2: Cierre de HC (publicación a 6 claves D1)
```
handleCloseHC()
  │
  ├─→ d1Set("siso_hc_completa_{cc}", hcCompleta)          // Clave 1
  ├─→ d1Set("siso_portal_doc_{cc}", portalData)           // Clave 2
  ├─→ d1Set("siso_portal_{codigo}", portalData)           // Clave 3
  ├─→ d1Set("siso_portal_empresa_atenciones_{nit}",       // Clave 4 ⭐
  │         grupoExistente)  [MERGE incremental]
  ├─→ d1WriteArrayMerge("siso_portal_empresa_{nit}",      // Clave 5
  │         [empresaReg], 'id')
  ├─→ d1WriteArrayMerge("siso_portal_empresa_docs_{nit}", // Clave 6
  │         [periodoDoc], 'periodo')
  └─→ save('/write/caja/add', ...)                         // Auto-billing
           └─→ d1WriteArrayMerge("siso_caja_movs_{userId}", [mov], 'id')
```

### Fase 3: Portal empresa (carga de datos)
```
PortalEmpresaPage
  │
  ├─ buscarEmpresa(nit, codigo)
  │   ├─ fetchKey("siso_portal_empresa_docs_{nit}")        → valida código acceso
  │   └─ fetchKey("siso_portal_empresa_atenciones_{nit}")  → atencionesVisibles
  │
  └─ cargarDocumentos(nitClean)
      ├─ d1Get("siso_saved_bills_{userId}")   → docsCuentas
      ├─ d1Get("siso_caja_movs_{userId}")     → docsCuentas (complemento)
      ├─ d1Get("siso_cartas_custodia_{userId}") → docsCustodia
      └─ d1Get("siso_portal_empresa_docs_{nit}") → docsInformes
```

---

## 📊 ESTADÍSTICAS DE CARGA (estimadas)

| Operación | Frecuencia | Tamaño payload | Latencia D1 |
|-----------|-----------|---------------|-------------|
| GET /store/:key | Cada carga de página | 1-200 KB | ~40ms |
| POST /store (guardar HC) | Cada save (manual o auto) | 5-50 KB | ~80ms |
| POST /store (cerrar HC) | Una vez por paciente | 6 writes paralelos | ~200ms total |
| CRON snapshot | Diario 6 AM UTC | 500-2000 KB | ~5-30s |
| GET /health | Cada ~30s (monitoreo) | <1 KB | ~5ms |

---

## 🏗️ ESTRATEGIA DE RESPALDO Y RECUPERACIÓN

### Snapshots automáticos (cron diario)
- **Frecuencia**: Diaria a las 6:00 AM UTC
- **Contenido**: Estado completo de `siso_store` (excluyendo snapshots previos)
- **Formato**: Piezas chunked de 500KB con metadato de reconstrucción
- **Rotación**: 7 días de retención (borra snapshots >7 días)
- **Recuperación**: Leer `siso_snapshot_YYYY-MM-DD__manifest` → reconstruir piezas → restaurar

### localStorage (caché local)
- **Siempre secundario** — D1 es fuente de verdad
- Se sincroniza en cada lectura exitosa de D1
- Sirve como fallback offline inmediato

---

## ⚠️ NOTAS DE SEGURIDAD Y PROTECCIÓN DE DATOS

| Aspecto | Implementación |
|---------|---------------|
| **Autenticación API** | `X-Siso-Token` header obligatorio en todas las requests |
| **CORS** | Solo orígenes `*.pages.dev` del proyecto + localhost |
| **Encriptación en tránsito** | HTTPS (TLS 1.3) — obligatorio en Cloudflare |
| **Encriptación en reposo** | D1 managed encryption |
| **Contraseñas** | SHA-256 + PBKDF2 (100K iteraciones, salt aleatorio) |
| **Datos clínicos** | NUNCA expuestos en portal público (solo concepto de aptitud, Art. 16 Res. 1843/2025) |
| **Códigos de acceso** | Formato `EMP-XXXX-XXXX` generados aleatoriamente |
| **Rate limiting** | D1 cuotas nativas + retry con backoff en frontend |
| **Audit trail** | `updated_at` en cada fila + `X-Siso-Ts` en respuestas |
| **Optimistic locking** | `If-Match` header previene escrituras concurrentes corruptas |

---

*Documento generado por auditoría forense — 1 de julio de 2026*  
*Fuentes: `siso-worker/index.js`, `d1Client.js`, `siso-worker/schema.sql`, `siso-worker/wrangler.json`, `App.jsx` (monolito, ~59K líneas), `HistoriaPage.jsx`*