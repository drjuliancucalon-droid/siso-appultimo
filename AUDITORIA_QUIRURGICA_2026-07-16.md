# 🔬 AUDITORÍA QUIRÚRGICA COMPARATIVA — Monolito vs Refactorizado
## OCUPASALUDPARADESPLEGAR → SISO-APPULTIMO

**Fecha:** 2026-07-16  
**Monolito:** `ocupasaludparadesplegar` (HEAD `736ddd4`, 15 julio 2026) — **522 líneas**  
**Refactorizado:** `siso-appultimo` (HEAD `e5897aa`, 13 julio 2026)  
**Backend compartido:** `siso-api.dr-juliancucalon.workers.dev` (mismo D1 `siso-db`)  
**Objetivo:** Preparar refactorizado como nuevo punto de producción

---

## 🚨 FASE 0.5: AISLAMIENTO DE DATOS EN WORKER COMPARTIDO (NUEVA PRIORIDAD ABSOLUTA)

> **Hallazgo crítico:** Dos aplicaciones (monolito + refactorizado) comparten el MISMO D1 y Worker. El worker actual **no tiene ningún mecanismo de aislamiento** entre apps. Cualquier app puede sobrescribir o borrar datos de la otra.

### 0.5.1 MATRIZ DE CLAVES COMPARTIDAS — 48 claves con riesgo de conflicto

| Categoría | # Claves | Riesgo | Ejemplos |
|-----------|:---:|:---:|---|
| Pacientes / HC | 18 | 🔴 ALTO | `siso_patients_*`, `siso_hc_*`, `siso_db_patients` |
| Portal / Empresa | 9 | 🔴 ALTO | `siso_portal_*`, `siso_portal_empresa_*` |
| Configuración | 7 | 🟡 MEDIO | `siso_ai_keys_*`, `siso_doctor_*`, `siso_ips` |
| Sistema | 6 | 🟡 MEDIO | `siso_snapshot_*`, `siso_autosave_*` |
| Encuestas | 5 | 🟡 MEDIO | `siso_encuesta_*`, `siso_db_encuestas_*` |
| Usuarios | 3 | 🔴 ALTO | `siso_users`, `siso_companies_*` |

### 0.5.2 5 VULNERABILIDADES CRÍTICAS EN EL WORKER COMPARTIDO

#### V1: POST /store — UPSERT INCONDICIONAL (Última escritura GANA)
```javascript
// Ambos workers (monolito y refactorizado) — SIN protección de app
const stmt = env.DB.prepare(
  "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) 
   ON CONFLICT(key) DO UPDATE SET value = excluded.value"
);
```
**Escenario catastrófico:** Monolito guarda 100 pacientes. Refactorizado guarda 102 pacientes. El paciente #101 del monolito SE PIERDE.

#### V2: DELETE /store/:key — SIN PROTECCIÓN
```javascript
// CUALQUIER app puede borrar CUALQUIER clave — sin validación
if (request.method === "DELETE" && path.startsWith("/store/")) {
  await env.DB.prepare("DELETE FROM siso_store WHERE key = ?").bind(key).run();
}
```
**Escenario catastrófico:** App A borra `siso_users` → AMBAS apps se quedan sin usuarios.

#### V3: POST /store/chunked — SIN PROTECCIÓN DE APP
El candado anti-encogimiento compara tamaño pero NO verifica quién escribe. Si el refactorizado guarda datos MÁS grandes pero INCORRECTOS, el candado no lo detecta.

#### V4: POST /store/append — SIN PROTECCIÓN DE CLAVE
El merge por ID es bueno, pero no verifica si la clave pertenece a la app que escribe. Si ambas apps hacen append a `siso_portal_empresa_docs_<NIT>` con estructuras diferentes, puede haber corrupción.

#### V5: POST /cleanup (SOLO EN MONOLITO) — PUEDE BORRAR DATOS DE LA OTRA APP
El cleanup del monolito borra snapshots >7d, chunks huérfanos, autosaves >48h. Si el refactorizado también usa estas claves, el cleanup del monolito puede borrar datos que el refactorizado aún necesita.

### 0.5.3 ESTRATEGIA DE AISLAMIENTO — 6 CANDADOS NUEVOS

#### CANDADO 3: Validación de userId en claves de pacientes (POST /store)
```javascript
const PROTECTED_PREFIXES_USER = ['siso_patients_', 'siso_db_patients_', 'siso_hc_'];
const userId = request.headers.get("X-Siso-UserId") || "";
if (PROTECTED_PREFIXES_USER.some(p => row.key.startsWith(p))) {
  const keyUserId = row.key.split('_').pop();
  if (userId && keyUserId && userId !== keyUserId && keyUserId.length >= 3) {
    return new Response(JSON.stringify({ ok: false, error: "user_mismatch" }), { status: 403 });
  }
}
```

#### CANDADO 4: Anti-borrado de claves críticas (DELETE /store/:key)
```javascript
const UNDELETABLE_PREFIXES = [
  'siso_users', 'siso_portal_empresa_', 'siso_portal_empresa_docs_',
  'siso_portal_empresa_atenciones_', 'siso_ai_keys_', 'siso_snapshot_'
];
if (UNDELETABLE_PREFIXES.some(p => key.startsWith(p))) {
  return new Response(JSON.stringify({ ok: false, error: "undeletable_key" }), { status: 403 });
}
```

#### CANDADO 5: Snapshot automático antes de DELETE
```javascript
const backupKey = `siso_deleted_${Date.now()}_${key}`;
const row = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key).first();
if (row?.value) {
  await env.DB.prepare("INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now'))")
    .bind(backupKey, row.value).run();
}
```

#### CANDADO 6: Merge atómico server-side (NUEVO POST /store/merge)
Fusión atómica por `idField`. El worker lee, mergea y escribe en una sola operación. Reemplaza el vulnerable read-modify-write del cliente.

#### Header X-Siso-App para identificación de app
```javascript
const appId = request.headers.get("X-Siso-App") || "unknown";
// Monolito: X-Siso-App: ocupasaludparadesplegar
// Refactorizado: X-Siso-App: siso-appultimo
```

### 0.5.4 MATRIZ DE RIESGO POST-MITIGACIÓN

| Operación | Sin protección | Con CANDADOS |
|-----------|:---:|:---:|
| App A escribe `siso_patients_X`, App B escribe misma clave | 🔴 Última gana | 🟢 CANDADO 3 + Merge atómico |
| App A borra `siso_users` | 🔴 Catastrófico | 🟢 CANDADO 4 (bloqueado) |
| App A escribe chunks más pequeños que App B | 🟡 Rechazado (anti-encogimiento) | 🟢 Rechazado |
| App A y App B hacen append simultáneo | 🟡 Carrera posible | 🟢 CANDADO 6 (merge server-side) |
| App A ejecuta cleanup, borra datos de App B | 🟡 Snapshots/autosaves pueden perderse | 🟢 Solo borra con owner |
| App A escribe en `siso_hc_*` de otro userId | 🔴 Sin validación | 🟢 CANDADO 3 (403) |

---

## 1. WORKER COMPARTIDO — Endpoints Faltantes (522 vs 467 líneas)

### 1.1 Endpoints y protecciones que FALTAN en el worker del refactorizado

| # | Endpoint/Protección | Monolito | Refactorizado | Severidad |
|---|---------------------|:---:|:---:|:---:|
| 1 | `POST /store/chunked` con CANDADO 2 (HC cerradas inmutables) | ✅ | ✅ (implementado) | — |
| 2 | `POST /store/append` con fusión por ID para `siso_encuestas` | ✅ (commit `3531448`) | ❌ FALTA | 🔴 |
| 3 | `GET /store/:key?raw=1` — modo raw (evita 503 CPU timeout) | ✅ (commit `1bf1233`) | ❌ FALTA | 🔴 |
| 4 | `POST /cleanup` — limpieza de emergencia | ✅ L403-433 | ❌ FALTA | 🔴 |
| 5 | `GET /storage-stats` — monitoreo D1 | ✅ L444-476 | ❌ FALTA | 🟡 |
| 6 | CANDADO 3 (userId) en POST /store | ❌ (ninguno) | 🟡 PENDIENTE | 🔴 |
| 7 | CANDADO 4 (anti-borrado) en DELETE | ❌ (ninguno) | 🟡 PENDIENTE | 🔴 |
| 8 | CANDADO 5 (snapshot pre-delete) en DELETE | ❌ (ninguno) | 🟡 PENDIENTE | 🟡 |
| 9 | CANDADO 6 (merge atómico) NUEVO POST /store/merge | ❌ (ninguno) | 🟡 PENDIENTE | 🟡 |
| 10 | Header X-Siso-App (identificación de app) | ❌ (ninguno) | 🟡 PENDIENTE | 🟡 |

### 1.2 Código a implementar

#### `POST /store/append` — Fusión de encuestas por ID (commit `3531448`)
```javascript
// Dentro de POST /store/append, reemplazar la lógica actual:
const effectiveIdField = key.includes('siso_encuesta') ? 'encuestaId' : (idField || 'id');
const idVal = item[effectiveIdField];
const idx = idVal != null ? arr.findIndex(x => x && String(x[effectiveIdField]) === String(idVal)) : -1;
if (idx >= 0) arr[idx] = item; else arr.push(item);
```

#### `GET /store/:key?raw=1` — Modo raw (commit `1bf1233`)
```javascript
// En GET /store/:key, antes de JSON.parse:
const rawMode = url.searchParams.get("raw") === "1";
if (rawMode) {
  return new Response(JSON.stringify([{ key, value: row.value, ts: row.updated_at }]), { headers });
}
```

#### `POST /cleanup` — Limpieza de emergencia
```javascript
if (request.method === "POST" && path === "/cleanup") {
  const snapCutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const autoCutoff = new Date(Date.now() - 48 * 3600000).toISOString();
  const snapDel = await env.DB.prepare(
    "DELETE FROM siso_store WHERE key LIKE 'siso_snapshot_%' AND substr(key, 15, 10) < ?"
  ).bind(snapCutoff).run();
  const tmpDel = await env.DB.prepare(
    "DELETE FROM siso_store WHERE key LIKE '%\\_\\_new%' ESCAPE '\\'"
  ).run();
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

#### `GET /storage-stats` — Monitoreo D1
```javascript
if (request.method === "GET" && path === "/storage-stats") {
  const count = await env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store").first();
  const filas = count?.c ?? 0;
  const mbUsados = Math.round((filas * 2048) / (1024 * 1024) * 100) / 100;
  const limiteMb = 500;
  const usoPct = Math.round((mbUsados / limiteMb) * 100);
  const grupos = await env.DB.prepare(`
    SELECT CASE 
      WHEN key LIKE 'siso_patients_%' OR key LIKE 'siso_db_patients_%' THEN 'patients'
      WHEN key LIKE 'siso_hc_%' THEN 'hc'
      WHEN key LIKE 'siso_portal_%' THEN 'portal'
      WHEN key LIKE 'siso_snapshot_%' THEN 'snapshots'
      WHEN key LIKE 'siso_encuesta_%' THEN 'encuestas'
      ELSE 'otros'
    END as grupo, COUNT(*) as cnt
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
| **Acción** | Implementar en 6 archivos del refactorizado |

### 2.3 `1bf1233` — fix(worker+d1): modo raw en GET /store/:key
| Campo | Valor |
|-------|-------|
| **Archivos** | `siso-worker/index.js` |
| **Tipo** | 🔧 **WORKER COMPARTIDO** |
| **Refactorizado** | ❌ **NO EXISTE** |
| **Severidad** | 🔴 **CRÍTICO** — previene 503 por CPU timeout en chunks grandes |

### 2.4 `3531448` — fix(worker): siso_encuestas se fusiona por id
| Campo | Valor |
|-------|-------|
| **Archivos** | `siso-worker/index.js` |
| **Tipo** | 🔧 **WORKER COMPARTIDO** |
| **Refactorizado** | ❌ **NO EXISTE** — el /store/append actual no tiene lógica específica para encuestas |
| **Severidad** | 🔴 **CRÍTICO** — múltiples sesiones pueden sobrescribir encuestas |

### 2.5 `736ddd4` — fix(encuestas): parseo de valores string de /store/prefix
| Campo | Valor |
|-------|-------|
| **Archivos** | `src/App.jsx` (función `_reloadEncuestasFromSupabase`) |
| **Tipo** | Frontend |
| **Refactorizado** | ⚠️ Verificar si `EncuestasTab.jsx` o `useCompanies.js` hace parseo correcto con `?raw=1` |

---

## 3. PORTAL DE CERTIFICADOS — Comparativa exhaustiva

### 3.1 Monolito: Portal unificado (`Portaltrabajador`)

El monolito tiene un **portal público unificado** con 2 tabs principales:

**Tab TRABAJADOR (sub-tabs: Código / Cédula):**
| Funcionalidad | Descripción | Estado refactorizado |
|---|---|---|
| Búsqueda por código | SISO-..., CV-..., 5 variantes de clave | ❌ FALTA |
| Búsqueda por cédula | `siso_portal_doc_<cc>` | ❌ FALTA |
| Resultado: datos paciente + concepto + restricciones | ~25 campos | ❌ FALTA |
| **Botón "Descargar Certificado PDF"** | `_generarCertificadoDesdePortal(resultado)` | ❌ FALTA |
| **"Documentos Emitidos en tu Consulta"** | Receta, Derivaciones, Exámenes, Incapacidad | ❌ FALTA |
| **"Ver / Descargar HC Completa"** | `_generarHCPortalHTML(hcCompleta)` con 18 secciones | ❌ FALTA |

**Tab EMPRESA (sub-tabs: Certificados / Atenciones / Documentos):**
| Funcionalidad | Descripción | Estado refactorizado |
|---|---|---|
| Búsqueda por NIT | `siso_portal_empresa_<NIT>` | ❌ FALTA |
| Documentos por período | certificados, cuentas cobro, custodia, informes | ❌ FALTA |
| Stats con derivaciones | Conteo de derivaciones en el período | ❌ FALTA |
| Botones Ver/Descargar PDF | `_openPrintRecetaDeriv` para cada documento | ❌ FALTA |
| **Botón "Publicar en Portal"** | Guarda informe en D1 `siso_portal_empresa_docs` | ❌ FALTA |

### 3.2 Refactorizado: PortalEmpresaPage.jsx (PARCIAL)

- ⚠️ Existe `PortalEmpresaPage.jsx` pero es una implementación **parcial**
- ❌ NO existe portal de Trabajador público
- ❌ NO existe búsqueda por código/cédula
- ❌ NO existen botones de descarga de documentos emitidos
- ❌ NO existe descarga de HC completa desde portal
- ❌ NO existen cuentas de cobro ni cartas de custodia
- ❌ NO existe "Publicar en Portal" desde la HC

---

## 4. GUARDADO Y CIERRE DE HC — 9 Acciones que FALTAN

El monolito ejecuta **9 acciones en cadena** al cerrar una HC (`handleCloseHistory`, ~L23678-24147):

| # | Acción | Clave D1 | Estado refactorizado |
|---|--------|----------|:---:|
| 1 | Firma digital SHA-256 + QR (Ley 527/1999) | — | ❌ FALTA |
| 2 | Portal público por código | `siso_portal_<code>` | ❌ FALTA |
| 3 | Portal público por cédula | `siso_portal_doc_<cc>` | ❌ FALTA |
| 4 | HC completa en D1 | `siso_hc_completa_<cc>` | ❌ FALTA |
| 5 | HC completa por código | `siso_hc_completa_codigo_<code>` | ❌ FALTA |
| 6 | Compatibilidad códigos viejos | `siso_portal_CV-<code>` | ❌ FALTA |
| 7 | Indexar empresa | `siso_portal_empresa_<NIT>` | ❌ FALTA |
| 8 | Atenciones por empresa | `siso_portal_empresa_atenciones_<NIT>` | ❌ FALTA |
| 9 | Documentos por período | `siso_portal_empresa_docs_<NIT>` | ❌ FALTA |

---

## 5. DOCUMENTOS QUE NO SE GENERAN AL CERRAR HC

| Documento | Monolito | Refactorizado |
|-----------|:---:|:---:|
| Certificado de aptitud → D1 | ✅ | ❌ |
| HC completa → D1 | ✅ | ❌ |
| Cuenta de cobro (tabla items) | ✅ | ❌ |
| Carta de custodia (Res. 1995/1999) | ✅ | ❌ |
| Informe periódico | ✅ | ❌ |
| Perfil sociodemográfico | ✅ | ❌ |
| Indexación por empresa (3 claves D1) | ✅ | ❌ |

---

## 6. PLAN DE IMPLEMENTACIÓN PRIORIZADO

### 🔴 FASE 0: AISLAMIENTO DEL WORKER COMPARTIDO (HOY — ~85 líneas)
| # | Cambio | Archivo | Líneas |
|---|--------|---------|:---:|
| 1 | CANDADO 3 (userId) en POST /store | `siso-worker/index.js` | ~20 |
| 2 | CANDADO 4 (anti-borrado) en DELETE | `siso-worker/index.js` | ~15 |
| 3 | CANDADO 5 (snapshot pre-delete) en DELETE | `siso-worker/index.js` | ~10 |
| 4 | CANDADO 6 (merge atómico) NUEVO POST /store/merge | `siso-worker/index.js` | ~35 |
| 5 | Header X-Siso-App en CORS | `siso-worker/index.js` | ~5 |

### 🔴 FASE 1: WORKER ENDPOINTS (HOY — ~115 líneas)
| # | Cambio | Archivo | Líneas |
|---|--------|---------|:---:|
| 6 | Modo `?raw=1` en GET /store/:key | `siso-worker/index.js` | ~15 |
| 7 | Fusión encuestas por ID en POST /store/append | `siso-worker/index.js` | ~20 |
| 8 | POST /cleanup — limpieza emergencia | `siso-worker/index.js` | ~30 |
| 9 | GET /storage-stats — monitoreo D1 | `siso-worker/index.js` | ~35 |
| 10 | CANDADO 2 también en POST /store/chunked | `siso-worker/index.js` | ~10 |
| 11 | Replicar en siso-worker-deploy | `siso-worker-deploy/index.js` | Copia |

### 🟡 FASE 2: ÉNFASIS CONDUCCIÓN (ESTA SEMANA — ~336 líneas)
| # | Cambio | Archivo | Líneas |
|---|--------|---------|:---:|
| 12 | Catálogo de énfasis CONDUCCIÓN | `aiAnalysis.js` | ~3 |
| 13 | UI Formulario HC (formulario CONDUCCIÓN) | `HistoriaOcupacional.jsx` | ~170 |
| 14 | UI Vista previa certificado | `CertificateView.jsx` | ~93 |
| 15 | Prompt IA análisis CONDUCCIÓN | `aiAnalysis.js` | ~25 |
| 16 | Prompt IA tipo énfasis | `aiAnalysis.js` | ~5 |
| 17 | HC Impresión sección CONDUCCIÓN | `printService.js` | ~35 |
| 18 | Select énfasis + badge color | `HistoriaOcupacional.jsx` | ~5 |

### 🟢 FASE 3: MEJORAS FINALES (FUTURAS SESIONES — ~320 líneas)
| # | Cambio | Archivo |
|---|--------|---------|
| 19 | `RecuperarAcceso` | `modules/auth/` |
| 20 | Export FHIR R4 | `modules/reports/` |
| 21 | Badge "preservar HC" | `PatientList.jsx` |
| 22 | Timeout sesión 30min | `authStore.js` |
| 23 | Notificaciones convenios | `DashboardPage.jsx` |
| 24 | Banner IPS personalizable | `SettingsPage.jsx` |
| 25 | Médico de turno funcional | `AgendaView.jsx` |

---

## 7. RESUMEN FINAL

| Fase | Items | Líneas | Prioridad |
|------|:---:|:---:|:---:|
| 🔴 FASE 0 (Aislamiento Worker) | 5 | ~85 | **ABSOLUTA** |
| � FASE 1 (Worker Endpoints) | 7 | ~115 | **CRÍTICA** |
| 🟡 FASE 2 (Énfasis CONDUCCIÓN) | 8 | ~336 | MEDIA |
| 🟢 FASE 3 (Mejoras) | 7 | ~320 | BAJA |
| **TOTAL** | **27** | **~856** | — |

---

*Documento de auditoría generado el 2026-07-16. Se actualiza con cada avance.*