# 🔬 AUDITORÍA QUIRÚRGICA COMPARATIVA — Monolito vs Refactorizado
## OCUPASALUDPARADESPLEGAR → SISO-APPULTIMO

**Fecha:** 2026-07-16  
**Monolito:** `ocupasaludparadesplegar` (HEAD `736ddd4`, 15 julio 2026)  
**Refactorizado:** `siso-appultimo` (HEAD `e5897aa`, 13 julio 2026)  
**Backend compartido:** `siso-api.dr-juliancucalon.workers.dev` (mismo D1 `siso-db`)  
**Objetivo:** Preparar refactorizado como nuevo punto de producción

---

## 0. RESUMEN EJECUTIVO

| Métrica | Monolito | Refactorizado | Brecha |
|---------|----------|---------------|--------|
| **Líneas App.jsx / código** | 60,312 (App.jsx único) | ~25,000 (12 módulos) | N/A |
| **Commits rezagados** | HEAD 15-jul | HEAD 13-jul | **5 commits** |
| **Worker (líneas)** | 639 | 471 | **168 líneas** |
| **Endpoints worker** | 14 | 11 | **3 faltantes** |
| **Funciones totales** | ~250 | ~180 exportadas | **~70 por verificar** |
| **Énfasis HC** | 6 | 5 | **1 faltante (CONDUCCIÓN)** |
| **Proveedores IA** | Cerebras + 3 más | ✅ Cerebras + 3 más | Synced |
| **Documentos de auditoría** | — | 6 generados | Todos del 13-jul |

---

## 🚨 FASE 0: GUARDADO, CIERRE DE HC Y PORTAL DE CERTIFICADOS (NUEVA PRIORIDAD ABSOLUTA)

> **Hallazgo de subagentes:** El refactorizado NO implementa el flujo de guardado/cierre de HC ni la publicación en el portal de certificados. Esto es lo MÁS crítico porque impide que el refactorizado sea el punto de producción.

### 0.1 LO QUE HACE EL MONOLITO AL CERRAR UNA HC (`handleCloseHistory`, ~L23678-24147)

El monolito ejecuta **9 acciones en cadena** al cerrar una HC. Cada acción escribe en D1 de forma **bloqueante** (espera confirmación antes de continuar):

| # | Acción | Clave D1 | Contenido | Destino |
|---|--------|----------|-----------|---------|
| 1 | Firma digital SHA-256 + QR (Ley 527/1999) | — | Hash + códigoQR + firmadoPor + medicoId + fechaFirma | Objeto JS en memoria |
| 2 | Portal público por código | `siso_portal_<code>` | portalData completo (~25 campos) | D1 + SB backup |
| 3 | Portal público por cédula | `siso_portal_doc_<cc>` | Mismo portalData indexado por cédula | D1 + SB |
| 4 | HC completa en D1 | `siso_hc_completa_<cc>` | HC completa + `_doctorData` + `_firma` + `_ipsName` | D1 + SB |
| 5 | HC completa por código | `siso_hc_completa_codigo_<code>` | HC completa indexada por código mayúsculas | D1 + SB |
| 6 | Compatibilidad códigos viejos | `siso_portal_CV-<code>` | Si el código no empieza por CV- | D1 + SB |
| 7 | Indexar empresa | `siso_portal_empresa_<NIT>` | `{documentos: [cc,...], nombre, nit, updatedAt}` | D1 + SB |
| 8 | Atenciones por empresa | `siso_portal_empresa_atenciones_<NIT>` | `{atenciones: [...], _firma, _doctorData}` merge por docNumero+fecha | D1 + SB |
| 9 | Documentos por período | `siso_portal_empresa_docs_<NIT>` | `{periodos: [{periodo, certificados:{count,updatedAt}}]}` | D1 + SB |

**El refactorizado NO ejecuta NINGUNA de estas 9 acciones.** La HC se guarda en localStorage y D1 vía `d1Set`, pero NO se publica en el portal público, NO se indexa por empresa, y NO se genera el paquete completo de documentos.

### 0.2 PORTAL DE CERTIFICADOS — Comparativa exhaustiva

#### Portal del MONOLITO (`#portaltrabajador` en ocupasaludparadesplegar-f4q.pages.dev)

**Tab TRABAJADOR (sub-tabs: Código / Cédula):**
| Funcionalidad | Descripción | Estado refactorizado |
|---|---|---|
| Búsqueda por código verificación | SISO-..., CV-..., 5 variantes de clave | ❌ FALTA |
| Búsqueda por cédula | `siso_portal_doc_<cc>` | ❌ FALTA |
| Resultado: datos del paciente | nombre, documento, empresa, cargo, tipo examen, fecha, médico | ❌ FALTA |
| Concepto de aptitud con color | Verde/Amarillo/Rojo según concepto | ❌ FALTA |
| Restricciones visibles | Panel ámbar con restricciones | ❌ FALTA |
| **Botón "Descargar Certificado PDF"** | `_generarCertificadoDesdePortal(resultado)` | ❌ FALTA |
| **"Documentos Emitidos en tu Consulta"** | Grid de botones condicionales: | ❌ FALTA |
| → Receta Médica | Si hay medicamentos → `_portalPrint("formula")` | ❌ FALTA |
| → Derivaciones | Si hay derivaciones → `_portalPrint("derivaciones")` | ❌ FALTA |
| → Exámenes | Si hay exámenes → `_portalPrint("examenes")` | ❌ FALTA |
| → Incapacidad | Si aplica → `_portalPrint("incapacidad")` | ❌ FALTA |
| **"Ver / Descargar HC Completa"** | `_generarHCPortalHTML(hcCompleta)` con 18 secciones | ❌ FALTA |
| Intento de phishing detectado | Bloqueo por múltiples consultas fallidas | ❌ FALTA |

**Tab EMPRESA (sub-tabs: Certificados / Atenciones / Documentos):**
| Funcionalidad | Descripción | Estado refactorizado |
|---|---|---|
| Búsqueda por NIT | `siso_portal_empresa_<NIT>` | ❌ FALTA |
| Sub-tab Certificados | Lista de certificados emitidos con fecha, trabajador, concepto | ❌ FALTA |
| Sub-tab Atenciones | Registro de atenciones con filtro por fecha | ❌ FALTA |
| Sub-tab Documentos | Documentación por período (cuentas cobro, custodia, informes) | ❌ FALTA |
| Stats con derivaciones | Conteo de derivaciones en el período | ❌ FALTA |
| Vista individual | Documentos Emitidos: medicamentos, derivaciones, exámenes, incapacidad | ❌ FALTA |
| Botones Ver/Descargar PDF | `_openPrintRecetaDeriv` para cada documento | ❌ FALTA |
| **Botón "Publicar en Portal"** | Guarda informe en D1 `siso_portal_empresa_docs` | ❌ FALTA |
| **Certificados premium** | HTMLs reales con datos D1 | ❌ FALTA |
| **Cuenta de cobro** | Con tabla de items | ❌ FALTA |
| **Carta custodia legal** | Completa Res. 1995/1999 | ❌ FALTA |

#### Portal del REFACTORIZADO (`siso-appultimo-arp.pages.dev`)
- ⚠️ Existe `PortalEmpresaPage.jsx` pero es una implementación **parcial**
- ❌ NO existe portal de Trabajador público
- ❌ NO existe búsqueda por código/cédula
- ❌ NO existen los botones de descarga de documentos emitidos
- ❌ NO existe descarga de HC completa desde portal
- ❌ NO existen cuentas de cobro ni cartas de custodia
- ❌ NO existe "Publicar en Portal" desde la HC

### 0.3 DOCUMENTOS A GENERAR AL CERRAR HC

| Documento | Monolito | Refactorizado | Dónde implementarlo |
|-----------|:---:|:---:|---|
| Certificado de aptitud → D1 | ✅ `siso_portal_<code>` | ❌ | `HistoriaOcupacional.jsx` |
| HC completa → D1 | ✅ `siso_hc_completa_<cc>` | ❌ | `HistoriaOcupacional.jsx` |
| Cuenta de cobro (tabla items) | ✅ En `siso_portal_empresa_docs` | ❌ | `printService.js` + `HistoriaOcupacional.jsx` |
| Carta de custodia (Res. 1995/1999) | ✅ En `siso_portal_empresa_docs` | ❌ | `printService.js` + `HistoriaOcupacional.jsx` |
| Informe periódico | ✅ En `siso_portal_empresa_docs` | ❌ | `printService.js` |
| Perfil sociodemográfico | ✅ Publicado en portal | ❌ | `components/` |
| Indexación por empresa | ✅ 3 claves D1 | ❌ | `HistoriaOcupacional.jsx` |

### 0.4 FUNCIONES A IMPLEMENTAR (FASE 0)

| # | Función | Archivo(s) | Líneas estimadas |
|---|---------|-----------|:---:|
| 1 | `handleCloseHistory` — 9 acciones en cadena | `src/sections/HistoriaOcupacional.jsx` | ~300 |
| 2 | Publicar portal: `siso_portal_<code>`, `siso_portal_doc_<cc>` | `HistoriaOcupacional.jsx` | ~50 |
| 3 | Guardar HC completa: `siso_hc_completa_<cc>` | `HistoriaOcupacional.jsx` | ~30 |
| 4 | Indexar empresa: `siso_portal_empresa_<NIT>`, `_atenciones`, `_docs` | `HistoriaOcupacional.jsx` | ~100 |
| 5 | Portal de Trabajador público | `src/pages/PortalTrabajadorPage.jsx` (NUEVO) | ~400 |
| 6 | Portal de Empresa completo | `src/pages/PortalEmpresaPage.jsx` (actualizar) | ~300 |
| 7 | `_portalPrint` — imprimir docs desde portal | `src/lib/printService.js` | ~80 |
| 8 | `_generarCertificadoDesdePortal` | `src/lib/printService.js` | ~100 |
| 9 | `_generarHCPortalHTML` — HC completa para portal | `src/lib/printService.js` | ~150 |
| 10 | Cuenta de cobro HTML | `src/lib/printService.js` | ~60 |
| 11 | Carta custodia HTML (Res. 1995/1999) | `src/lib/printService.js` | ~80 |
| 12 | Botón "Publicar en Portal" en HC | `HistoriaOcupacional.jsx` | ~30 |

**Total FASE 0: ~1,680 líneas en 4 archivos**

---

## 🛡️ FASE 0.5: AISLAMIENTO DE DATOS EN WORKER COMPARTIDO (NUEVA)

> **Hallazgo de subagentes:** El worker NO tiene ningún mecanismo de aislamiento entre las dos apps que comparten el mismo D1. Ambas usan el mismo token (`SISO_TOKEN`), por lo que el worker no puede distinguir quién escribe. Las protecciones existentes (If-Match, CANDADO anti-encogimiento, CANDADO 2) mitigan algunos escenarios pero NO cubren el caso de dos apps compitiendo por las mismas claves.

### 0.5.1 MATRIZ DE CLAVES COMPARTIDAS (48 claves con riesgo de conflicto)

| Categoría | # Claves compartidas | Riesgo | Ejemplos |
|-----------|:---:|:---:|---|
| Pacientes / HC | 18 | 🔴 ALTO | `siso_db_patients`, `siso_patients_*`, `siso_hc_*` |
| Portal / Empresa | 9 | 🔴 ALTO | `siso_portal_*`, `siso_portal_empresa_*` |
| Configuración | 7 | 🟡 MEDIO | `siso_ai_keys_*`, `siso_doctor_*`, `siso_ips` |
| Sistema | 6 | 🟡 MEDIO | `siso_snapshot_*`, `siso_autosave_*` |
| Encuestas | 5 | 🟡 MEDIO | `siso_encuesta_*`, `siso_db_encuestas_*` |
| Usuarios | 3 | 🔴 ALTO | `siso_users`, `siso_companies_*` |

### 0.5.2 VULNERABILIDADES POR ENDPOINT

#### V1: POST /store — UPSERT INCONDICIONAL (Severidad: 🔴 CRÍTICA)

**Código del worker (idéntico en los 3):**
```javascript
// Línea ~171: INSERT ON CONFLICT DO UPDATE - última escritura GANA
const stmt = env.DB.prepare(
  "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
);
```

**Escenario de conflicto:**
1. Monolito lee `siso_patients_drcucalon` (100 pacientes)
2. Refactorizado lee `siso_patients_drcucalon` (100 pacientes)
3. Monolito agrega paciente #101 → escribe 101 pacientes
4. Refactorizado agrega paciente #102 → escribe 102 pacientes → **PIERDE el paciente #101 del monolito**

**El If-Match ayuda pero NO resuelve:** Si una app no usa If-Match (y actualmente el refactorizado solo lo usa en `d1WriteArrayMerge`, no en todas las escrituras), la última escritura gana sin verificar.

**Mitigación:** ✅ `d1WriteArrayMerge` en el cliente ya hace merge server-side para arrays. Pero NO todas las escrituras pasan por esta función.

#### V2: DELETE /store/:key — SIN PROTECCIÓN (Severidad: 🔴 CRÍTICA)

```javascript
// Línea ~293: CUALQUIER app puede borrar CUALQUIER clave
if (request.method === "DELETE" && path.startsWith("/store/")) {
  const key = decodeURIComponent(path.slice(7));
  await env.DB.prepare("DELETE FROM siso_store WHERE key = ?").bind(key).run();
  return new Response(JSON.stringify({ ok: true }), { headers });
}
```

**NO hay validación de:**
- ¿Es una clave crítica? (`siso_users`, `siso_patients_*`)
- ¿La app que borra es la dueña de la clave?
- ¿Hay backup/snapshot antes de borrar?

**Escenario catastrófico:** La app A borra `siso_users` → AMBAS apps se quedan sin usuarios.

#### V3: POST /store/chunked — SIN CANDADO ANTI-SOBRESCRITURA ENTRE APPS (Severidad: 🟡 MEDIA)

El candado anti-encogimiento compara tamaño (`previousSize vs newSize`), pero NO verifica quién escribe. Si el monolito guarda una HC grande (500KB) y el refactorizado guarda la misma clave con datos incompletos (200KB), el candado lo rechaza. PERO si el refactorizado guarda datos MÁS grandes pero INCORRECTOS, el candado NO lo detecta.

#### V4: POST /store/append — SIN PROTECCIÓN DE CLAVE (Severidad: 🟡 MEDIA)

El append hace merge por ID (`idField`) en el servidor, lo cual es bueno. Pero NO verifica si la clave pertenece a la app que escribe. Si ambas apps hacen append a `siso_portal_empresa_docs_<NIT>` con estructuras diferentes, puede haber corrupción.

#### V5: POST /cleanup — PUEDE BORRAR DATOS DE LA OTRA APP (Severidad: 🟡 MEDIA)

```javascript
// El cleanup del monolito borra snapshots >7d, chunks huérfanos, autosaves >48h
// Si el refactorizado también hace snapshots/autosaves, el cleanup del monolito
// puede borrar datos que el refactorizado aún necesita.
```

### 0.5.3 ESTRATEGIA DE AISLAMIENTO — 5 CANDADOS NUEVOS

#### CANDADO 3: Validación de userId en claves de pacientes
```javascript
// AGREGAR en POST /store y POST /store/chunked:
// Si la clave empieza con siso_patients_ o siso_db_patients_, 
// verificar que el userId del token coincida con el sufijo de la clave.
const PROTECTED_PREFIXES_USER = ['siso_patients_', 'siso_db_patients_', 'siso_hc_'];
const userId = url.searchParams.get("userId") || request.headers.get("X-Siso-UserId") || "";
if (PROTECTED_PREFIXES_USER.some(p => key.startsWith(p))) {
  const keyUserId = key.split('_').pop();
  if (userId && keyUserId && userId !== keyUserId) {
    return new Response(JSON.stringify({
      ok: false, error: "user_mismatch",
      message: `Esta clave pertenece a otro usuario (${keyUserId})`,
    }), { status: 403, headers });
  }
}
```

#### CANDADO 4: Anti-borrado de claves críticas
```javascript
// AGREGAR en DELETE /store/:key:
const UNDELETABLE_PREFIXES = [
  'siso_users', 'siso_portal_empresa_', 'siso_portal_empresa_docs_',
  'siso_portal_empresa_atenciones_', 'siso_ai_keys_', 'siso_snapshot_'
];
if (UNDELETABLE_PREFIXES.some(p => key.startsWith(p))) {
  return new Response(JSON.stringify({
    ok: false, error: "undeletable_key",
    message: `Esta clave es crítica y no puede ser eliminada directamente. Use /cleanup para mantenimiento programado.`,
  }), { status: 403, headers });
}
```

#### CANDADO 5: Snapshot automático antes de DELETE
```javascript
// AGREGAR en DELETE /store/:key:
// Antes de borrar, guardar una copia en siso_deleted_<timestamp>_<key>
const backupKey = `siso_deleted_${Date.now()}_${key}`;
const row = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key).first();
if (row?.value) {
  await env.DB.prepare(
    "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now'))"
  ).bind(backupKey, row.value).run();
}
```

#### CANDADO 6: Merge atómico server-side para escrituras de arrays
```javascript
// NUEVO ENDPOINT: POST /store/merge
// Body: { key, items[], idField }
// El worker lee el array actual, mergea por idField, y escribe atómicamente.
// Esto reemplaza el read-modify-write del cliente que es vulnerable a carreras.
if (request.method === "POST" && path === "/store/merge") {
  const { key, items = [], idField = "id" } = body;
  // Leer array actual
  let arr = [];
  try {
    const row = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key).first();
    if (row?.value) arr = JSON.parse(row.value);
  } catch {}
  if (!Array.isArray(arr)) arr = [];
  // Merge por idField (items nuevos reemplazan viejos con mismo ID, items viejos se conservan)
  const merged = [...arr];
  for (const item of items) {
    const idVal = item[idField];
    if (idVal != null) {
      const idx = merged.findIndex(x => x && String(x[idField]) === String(idVal));
      if (idx >= 0) merged[idx] = item; else merged.push(item);
    } else {
      merged.push(item);
    }
  }
  await env.DB.prepare(
    "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  ).bind(key, JSON.stringify(merged)).run();
  return new Response(JSON.stringify({ ok: true, count: merged.length }), { headers });
}
```

#### Header X-Siso-App para identificación
```javascript
// AGREGAR en TODOS los endpoints:
const appId = request.headers.get("X-Siso-App") || "unknown";
// Registrar en logs y usar para decisiones de aislamiento
// El monolito envía: X-Siso-App: ocupasaludparadesplegar
// El refactorizado envía: X-Siso-App: siso-appultimo
```

### 0.5.4 MATRIZ DE RIESGO POST-MITIGACIÓN

| Operación | Sin protección | Con CANDADOS 3-6 |
|-----------|:---:|:---:|
| App A escribe `siso_patients_X`, App B escribe misma clave | 🔴 Última gana | 🟢 Merge atómico server-side |
| App A borra `siso_users` | 🔴 Catastrófico | 🟢 Bloqueado (CANDADO 4) |
| App A escribe chunks más pequeños que App B | 🟡 Rechazado (anti-encogimiento) | 🟢 Rechazado + log |
| App A y App B hacen append simultáneo | 🟡 Carrera posible | 🟢 Append atómico server-side |
| App A ejecuta cleanup, borra datos de App B | 🟡 Snapshots/autosaves pueden perderse | 🟢 Solo borra si owner coincide |
| App A escribe en `siso_hc_*` de otro userId | 🔴 Sin validación | 🟢 CANDADO 3 (userId) |

### 0.5.5 CÓDIGO TOTAL A IMPLEMENTAR

| Candado | Endpoint(s) | Líneas |
|---------|------------|:---:|
| CANDADO 3 (userId) | POST /store, POST /store/chunked | ~20 |
| CANDADO 4 (anti-borrado) | DELETE /store/:key | ~15 |
| CANDADO 5 (snapshot pre-delete) | DELETE /store/:key | ~10 |
| CANDADO 6 (merge atómico) | NUEVO POST /store/merge | ~35 |
| Header X-Siso-App | Todos los endpoints | ~5 |
| **TOTAL** | | **~85 líneas** |

---

## 1. WORKER: AUDITORÍA QUIRÚRGICA (471 vs 639 líneas)

### 1.1 Endpoints FALTANTES en el refactorizado

| # | Endpoint | Líneas monolito | Propósito | Severidad |
|---|----------|:---:|---|:---:|
| 1 | `POST /cleanup` | L403-433 | Limpieza emergencia: snapshots >7d + chunks huérfanos + autosaves >48h | 🔴 CRÍTICO |
| 2 | `GET /storage-stats` | L444-476 | Monitoreo D1: filas, MB usados, % uso, alertas 70/90% | 🟡 MEDIO |
| 3 | Modo `?raw=1` en `GET /store/:key` | L77-95 monolito | Evita JSON.parse + 503 por CPU timeout en chunks grandes | 🔴 CRÍTICO |

### 1.2 Endpoints COMPARTIDOS con diferencias

| Endpoint | Diferencias | Acción |
|----------|------------|--------|
| `POST /store/chunked` | Monolito tiene **CANDADO 2**: rechaza escrituras a `siso_hc_cerrada_*` con status 423. Refactorizado NO lo tiene en /store/chunked (solo en /store). | 🔴 Agregar CANDADO 2 en /store/chunked |
| `POST /store/append` | Monolito tiene fusión por ID para `siso_encuestas` — antes se reemplazaba completo. Refactorizado solo fusiona arrays genéricos. | 🔴 Agregar lógica de fusión de encuestas |
| `GET /health` | Monolito soporta `?full=1` para conteos detallados. Refactorizado no. | 🟢 Agregar |

### 1.3 CÓDIGO A IMPLEMENTAR

#### 1.3.1 `GET /store/:key?raw=1` (commit `1bf1233`)
```javascript
// En GET /store/:key, después de leer row.value:
const raw = url.searchParams.get("raw") === "1";
if (raw) {
  // Retornar value como string crudo sin JSON.parse
  return new Response(JSON.stringify([{ key, value: row.value, ts: row.updated_at }]), { headers });
}
```

#### 1.3.2 `POST /cleanup`
```javascript
if (request.method === "POST" && path === "/cleanup") {
  // Rotación de snapshots > 7 días
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const snapDel = await env.DB.prepare(
    "DELETE FROM siso_store WHERE key LIKE 'siso_snapshot_%' AND substr(key, 15, 10) < ?"
  ).bind(cutoff).run();
  
  // Limpiar chunks temporales huérfanos
  const tmpDel = await env.DB.prepare(
    "DELETE FROM siso_store WHERE key LIKE '%\\_\\_new%' ESCAPE '\\'"
  ).run();
  
  // Limpiar autosaves > 48h
  const autoCutoff = new Date(Date.now() - 48 * 3600000).toISOString();
  const autoDel = await env.DB.prepare(
    "DELETE FROM siso_store WHERE key LIKE 'siso_autosave_cloud_%' AND updated_at < ?"
  ).bind(autoCutoff).run();
  
  return new Response(JSON.stringify({
    ok: true,
    snapshotsDeleted: snapDel.meta?.changes ?? 0,
    tmpDeleted: tmpDel.meta?.changes ?? 0,
    autosavesDeleted: autoDel.meta?.changes ?? 0,
  }), { headers });
}
```

#### 1.3.3 `GET /storage-stats`
```javascript
if (request.method === "GET" && path === "/storage-stats") {
  const count = await env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store").first();
  const filas = count?.c ?? 0;
  const mbUsados = Math.round((filas * 2048) / (1024 * 1024) * 100) / 100; // estimate
  const limiteMb = 500;
  const usoPct = Math.round((mbUsados / limiteMb) * 100);
  
  // Top grupos
  const grupos = await env.DB.prepare(`
    SELECT 
      CASE 
        WHEN key LIKE 'siso_patients_%' OR key LIKE 'siso_db_patients_%' THEN 'patients'
        WHEN key LIKE 'siso_hc_%' THEN 'hc'
        WHEN key LIKE 'siso_portal_%' THEN 'portal'
        WHEN key LIKE 'siso_snapshot_%' THEN 'snapshots'
        WHEN key LIKE 'siso_encuesta_%' THEN 'encuestas'
        ELSE 'otros'
      END as grupo,
      COUNT(*) as cnt
    FROM siso_store GROUP BY grupo ORDER BY cnt DESC
  `).all();
  
  return new Response(JSON.stringify({
    filas, mb_usados: mbUsados, limite_mb: limiteMb, uso_pct: usoPct,
    alerta_70: usoPct > 70, alerta_90: usoPct > 90,
    top_grupos: grupos.results || [],
  }), { headers });
}
```

---

## 2. COMMITS NUEVOS DEL MONOLITO (14-15 julio) — 5 commits

### 2.1 `336c022` — style(certificado): unifica estilo secciones de énfasis
| Campo | Valor |
|-------|-------|
| **Archivos** | `src/App.jsx` (+73/-128) |
| **Tipo** | Frontend — solo estilos |
| **Refactorizado** | ✅ Ya está en `CertificateView.jsx` (usa grid CSS sin tablas, badNorm(), rowCls) |
| **Acción** | **NINGUNA** — ya implementado |

### 2.2 `f4b4431` — feat(hc+certificado): nuevo énfasis CONDUCCIÓN DE VEHÍCULOS (Res. 217/2014)
| Campo | Valor |
|-------|-------|
| **Archivos** | `src/App.jsx` (+200 líneas approx) |
| **Tipo** | Frontend — 6 capas: UI formulario, certificado, prompt IA, catálogo, select, HC impresión |
| **Refactorizado** | ❌ **NO EXISTE**. Hay que crearlo en 6 lugares |
| **Severidad** | 🟡 MEDIA |
| **Acción** | Implementar en 6 archivos del refactorizado (ver sección 3 abajo) |

### 2.3 `1bf1233` — fix(worker+d1): modo raw en GET /store/:key
| Campo | Valor |
|-------|-------|
| **Archivos** | `siso-worker/index.js` |
| **Tipo** | 🔧 **WORKER COMPARTIDO** |
| **Refactorizado** | ❌ **NO EXISTE** |
| **Severidad** | 🔴 **CRÍTICO** — previene 503 por CPU timeout en chunks grandes |
| **Acción** | Implementar en `siso-worker/index.js` y `siso-worker-deploy/index.js` |

### 2.4 `3531448` — fix(worker): siso_encuestas se fusiona por id
| Campo | Valor |
|-------|-------|
| **Archivos** | `siso-worker/index.js` |
| **Tipo** | 🔧 **WORKER COMPARTIDO** |
| **Refactorizado** | ❌ **NO EXISTE** — el /store/append actual no tiene lógica específica para encuestas |
| **Severidad** | 🔴 **CRÍTICO** — múltiples sesiones pueden sobrescribir encuestas |
| **Acción** | Agregar lógica de fusión por ID para `siso_encuestas` en `POST /store/append` |

### 2.5 `736ddd4` — fix(encuestas): parseo de valores string de /store/prefix
| Campo | Valor |
|-------|-------|
| **Archivos** | `src/App.jsx` (función `_reloadEncuestasFromSupabase`) |
| **Tipo** | Frontend |
| **Refactorizado** | ⚠️ Verificar si `EncuestasTab.jsx` o `useCompanies.js` hace parseo correcto con `?raw=1` |
| **Acción** | Revisar y corregir parseo en el refactorizado |

---

## 3. ÉNFASIS CONDUCCIÓN DE VEHÍCULOS — Implementación en 6 capas

El commit `f4b4431` agrega el énfasis CONDUCCIÓN en 6 lugares del monolito. Hay que replicarlo en 6 archivos del refactorizado:

| # | Capa | Monolito (App.jsx línea) | Refactorizado (archivo) | Complejidad |
|---|------|--------------------------|------------------------|:---:|
| 1 | **Catálogo de énfasis** | ~L13866 | `src/shared/data/catalogs.js` o `src/shared/data/initialStates.js` | 🟢 Baja |
| 2 | **UI — Formulario en HC** | ~L30037-30208 (170 líneas) | `src/sections/HistoriaOcupacional.jsx` o `src/modules/clinical/components/HCForm.jsx` | 🔴 Alta |
| 3 | **UI — Vista previa certificado** | ~L32263-32356 (93 líneas) | `src/modules/clinical/components/CertificateView.jsx` | 🟡 Media |
| 4 | **Prompt IA — análisis** | ~L21601-21615 | `src/modules/ai/services/aiAnalysis.js` | 🟡 Media |
| 5 | **Prompt IA — tipo énfasis** | ~L21652 | `src/modules/ai/services/aiAnalysis.js` | 🟢 Baja |
| 6 | **HC Impresión** | ~L25648-25683 (35 líneas) | `src/lib/printService.js` (sección `generateHCPrintHTML`) | 🟡 Media |

### 3.1 Catálogo
```javascript
// Ya existe _enfMeta en _buildFullContext de aiAnalysis.js
// Agregar:
CONDUCCION: { bg: "#dbeafe", fg: "#1e40af", titulo: "Conducción de Vehículos (Res. 217/2014)" }
```

### 3.2 UI Formulario — ~170 líneas de JSX
Campos a agregar en el componente de HC (cuando `data.enfasisExamen === "CONDUCCION"`):
- Agudeza Visual Lejana (texto)
- Agudeza Visual Cercana (texto)
- Campimetría V/H (texto)
- Discriminación de Colores (radio: Normal/Alterada)
- Visión de Profundidad (radio: Normal/Alterada)
- Audiometría (radio: Normal/Hipoacusia Leve/Moderada/Severa)
- Epilepsia/Síncope/Apnea (radio: Niega/Refiere)
- Consumo Alcohol/Psicoactivos (radio: Niega/Refiere)
- Evaluación Psicomotriz (5 pruebas: Bajo/Medio/Alto + hallazgo)
- Valoración Psicológica General (textarea)
- Observaciones/Restricciones (textarea)

### 3.3 Vista previa certificado — ~93 líneas
Mostrar los mismos campos en formato grid CSS, con colores condicionales (rojo si alterado/Bajo/Refiere, verde si Alto, gris si normal).

### 3.4 Prompt IA — análisis
```javascript
} else if (enf.includes("CONDUC")) {
  const e = d.examenConduccion || {};
  const mC = d.maniobrasConduccion || {};
  // ... construir examenEspecial con todos los campos
}
```

### 3.5 Select de énfasis
Agregar `<option value="CONDUCCION">Conducción de Vehículos</option>` en el select de énfasis.

### 3.6 HC Impresión
Agregar sección en `generateHCPrintHTML` cuando el énfasis es CONDUCCION, con tabla de evaluación psicomotriz (Bajo = rojo, Medio = normal, Alto = verde).

---

## 4. MATRIZ DE COBERTURA FUNCIONAL

### 4.1 ✅ FUNCIONES CON PARIDAD TOTAL
| Área | Funciones clave | Estado |
|------|----------------|:---:|
| Login/Auth | LoginForm, ChangePasswordForm, _sha256, _pbkdf2Hash | ✅ |
| Pacientes CRUD | PatientList, PatientForm, búsqueda, filtros, importar CSV | ✅ |
| Dashboard | KPIs, alertas, estadísticas, badge offline | ✅ |
| IA | Gemini, Groq, Cerebras, OpenRouter, rotación multi-key, contador, escalado | ✅ |
| Certificados | printHC, printCertificateBatch, printDisability | ✅ |
| Worker | /store/chunked, CANDADO 2 en /store, /store/append, ?raw=1 en prefix | ✅ |
| D1 Client | Timeout 180s, pool 2, protección claves, PENDING_D1_MAX 5MB | ✅ |

### 4.2 ⚠️ FUNCIONES PARCIALES
| Área | Qué falta | Archivo destino |
|------|----------|----------------|
| Encuestas | Parseo valores string de /store/prefix (?raw=1) | `EncuestasTab.jsx` |
| Portal Empresa | Documentos por período, certificados premium, cuenta cobro, custodia | `PortalEmpresaPage.jsx` |
| Configuración | IPS personalizable, banner de IPS | `SettingsPage.jsx` |
| Agenda | Médico de turno funcional | `AgendaView.jsx` |

### 4.3 ❌ FUNCIONES FALTANTES
| Función monolito | Descripción | Archivo destino | Prioridad |
|------------------|------------|-----------------|:---:|
| `RecuperarAcceso` | Formulario de recuperación de contraseña | `modules/auth/components/RecuperarAcceso.jsx` | 🟡 |
| Énfasis CONDUCCIÓN | 6 capas (ver sección 3) | 6 archivos | 🟡 |
| `POST /cleanup` | Limpieza emergencia worker | `siso-worker/index.js` | 🔴 |
| `GET /storage-stats` | Monitoreo D1 | `siso-worker/index.js` | 🟡 |
| Export FHIR R4 | Exportar pacientes en formato FHIR | `modules/reports/services/fhirService.js` | 🟢 |
| Badge preservar HC | Indicador en tabla pacientes | `PatientList.jsx` | 🟢 |
| Timeout sesión 30min | Logout automático por inactividad | `authStore.js` | 🟡 |
| Notificaciones convenios | Alertas de convenios próximos a vencer | `DashboardPage.jsx` | 🟢 |
| Carta custodia | Documento legal de custodia de HC | `printService.js` | 🟢 |
| Cuenta de cobro | Documento de facturación | `printService.js` | 🟢 |

---

## 5. PLAN DE IMPLEMENTACIÓN PRIORIZADO

### 🔴 FASE CRÍTICA — Backend compartido + Correcciones de datos (HOY)

| # | Cambio | Archivo(s) | Líneas | Commit origen |
|---|--------|-----------|:---:|:---:|
| 1 | Modo `?raw=1` en `GET /store/:key` | `siso-worker/index.js` | ~15 | `1bf1233` |
| 2 | Fusión por ID para `siso_encuestas` en `POST /store/append` | `siso-worker/index.js` | ~20 | `3531448` |
| 3 | `POST /cleanup` — limpieza emergencia | `siso-worker/index.js` | ~30 | N/A |
| 4 | Replicar en producción | `siso-worker-deploy/index.js` | Copia | — |
| 5 | Verificar parseo encuestas con `?raw=1` | `EncuestasTab.jsx` o similar | ~5 | `736ddd4` |

### 🟡 FASE MEDIA — Funcionalidad faltante (ESTA SEMANA)

| # | Cambio | Archivo(s) | Líneas | Commit origen |
|---|--------|-----------|:---:|:---:|
| 6 | Énfasis CONDUCCIÓN — UI formulario | `sections/HistoriaOcupacional.jsx` | ~170 | `f4b4431` |
| 7 | Énfasis CONDUCCIÓN — certificado preview | `CertificateView.jsx` | ~93 | `f4b4431` |
| 8 | Énfasis CONDUCCIÓN — prompt IA | `aiAnalysis.js` | ~25 | `f4b4431` |
| 9 | Énfasis CONDUCCIÓN — HC impresión | `printService.js` | ~35 | `f4b4431` |
| 10 | Énfasis CONDUCCIÓN — catálogo + select | `catalogs.js` + component | ~5 | `f4b4431` |
| 11 | `GET /storage-stats` | `siso-worker/index.js` | ~35 | N/A |
| 12 | `RecuperarAcceso` | `modules/auth/components/` | ~80 | N/A |

### 🟢 FASE BAJA — Mejoras (FUTURAS SESIONES)

| # | Cambio | Archivo(s) |
|---|--------|-----------|
| 13 | Export FHIR R4 | `modules/reports/services/fhirService.js` |
| 14 | Badge preservar HC | `PatientList.jsx` |
| 15 | Timeout sesión 30min | `authStore.js` |
| 16 | Notificaciones convenios | `DashboardPage.jsx` |
| 17 | Carta custodia | `printService.js` |
| 18 | Cuenta de cobro | `printService.js` |
| 19 | Banner IPS personalizable | `SettingsPage.jsx` |
| 20 | Médico de turno funcional | `AgendaView.jsx` |

---

## 6. ESTIMACIÓN DE ESFUERZO

| Fase | Items | Líneas estimadas | Tiempo estimado |
|------|:---:|:---:|---|
| 🔴 CRÍTICA | 5 | ~70 | 1-2 horas |
| 🟡 MEDIA | 7 | ~443 | 4-6 horas |
| 🟢 BAJA | 8 | ~300 | 3-4 horas |
| **TOTAL** | **20** | **~813** | **8-12 horas** |

---

## 7. ARCHIVOS MODIFICADOS EN ESTA AUDITORÍA

| Archivo | Cambios pendientes | Severidad |
|---------|-------------------|:---:|
| `siso-worker/index.js` | ?raw=1 en GET /store/:key, fusión encuestas, POST /cleanup, GET /storage-stats | 🔴 |
| `siso-worker-deploy/index.js` | Replicación completa | 🔴 |
| `src/modules/clinical/components/CertificateView.jsx` | Énfasis CONDUCCIÓN preview | 🟡 |
| `src/sections/HistoriaOcupacional.jsx` | Énfasis CONDUCCIÓN formulario (170 líneas) | 🟡 |
| `src/modules/ai/services/aiAnalysis.js` | Énfasis CONDUCCIÓN prompt IA + tipo | 🟡 |
| `src/lib/printService.js` | Énfasis CONDUCCIÓN impresión HC completa | 🟡 |
| `src/shared/data/catalogs.js` | Catálogo de énfasis CONDUCCIÓN | 🟢 |
| `src/modules/companies/components/EncuestasTab.jsx` | Verificar parseo ?raw=1 | 🟡 |
| `src/modules/auth/` | RecuperarAcceso | 🟡 |
| `src/pages/SettingsPage.jsx` | Banner IPS personalizable | 🟢 |
| `src/modules/patients/components/PatientList.jsx` | Badge preservar HC, Export FHIR | 🟢 |
| `src/modules/agenda/components/AgendaView.jsx` | Médico de turno | 🟢 |
| `src/stores/authStore.js` | Timeout sesión | 🟢 |
| `src/pages/DashboardPage.jsx` | Notificaciones convenios | 🟢 |

---

## 8. NOTAS DE LA AUDITORÍA

1. **Worker compartido es crítico:** Los 3 cambios en el worker afectan a AMBAS aplicaciones. Si se implementan en el monolito pero no en el refactorizado, el comportamiento del backend será inconsistente.

2. **El monolito tiene 60,312 líneas en un solo archivo.** El refactorizado distribuye la lógica en ~80 archivos. La correspondencia no es siempre 1:1 — una función del monolito puede estar repartida en 2-3 archivos del refactorizado.

3. **La persistencia D1 de API keys YA existe en el refactorizado** (`useAIStore.getState().loadFromD1()` en authStore.js). No requiere cambios.

4. **Los proveedores IA YA están actualizados** — Cerebras reemplazó a Together, OpenRouter tiene modelos julio 2026, Gemini tiene rotación multi-key.

5. **El énfasis CONDUCCIÓN es el cambio de frontend más grande** (~328 líneas en 5 archivos). Representa el 40% del esfuerzo estimado de la fase media.

---

*Documento de auditoría generado el 2026-07-16. Se actualizará con cada avance. Última actualización: inicio de sesión.*