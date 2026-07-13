# 🔬 PROTOCOLO DE HALLAZGOS — Últimos 10 Commits del Monolito
## OCUPASALUDPARADESPLEGAR → Replicación en SISO-APPULTIMO (Refactorizado)

**Fecha:** 2026-07-13  
**Monolito HEAD:** `6d4a2fc` (ocupasaludparadesplegar) — 13 julio 2026  
**Refactorizado HEAD:** `34d26b9` (siso-appultimo) — 11 julio 2026  
**Diferencia:** 2 días de desarrollo — 10 commits rezagados  
**Backend compartido:** ✅ Mismo D1 (`siso-db`), mismo worker producción (`siso-api`)

---

## 0. VERIFICACIÓN: Son Repositorios SEPARADOS

| Atributo | Monolito (OCUPASALUDPARADESPLEGAR) | Refactorizado (SISO-APPULTIMO) |
|----------|-------------------------------------|-------------------------------|
| Remote | `ocupasaludparadesplegar` | `siso-appultimo` |
| HEAD | `6d4a2fc` (13 julio) | `34d26b9` (11 julio) |
| Estructura | `src/App.jsx` monolítico (~34,000 líneas) | Modular: `src/modules/`, `src/pages/`, `src/lib/` |
| Worker local | `mono-real/siso-worker/` → nombre `siso-api` | `siso-worker/` → nombre `siso-api-dev` |
| Worker deploy | MISMO worker `siso-api` (compartido) | `siso-worker-deploy/` → nombre `siso-api` |
| D1 Database | `siso-db` (ID: `76da5895`) | MISMO `siso-db` (ID: `76da5895`) |
| URL producción | `ocupasaludparadesplegar.pages.dev` | `siso-appultimo-arp.pages.dev` |

> ⚠️ **IMPORTANTE:** Ambos proyectos comparten el mismo backend. Cualquier cambio en el worker del monolito que no se replique en el refactorizado romperá la compatibilidad para los usuarios del refactorizado.

---

## 1. LOS 10 COMMITS DEL MONOLITO (ocupasaludparadesplegar)

| # | Hash | Fecha | Mensaje | Archivos | Tipo |
|---|------|-------|---------|----------|------|
| 1 | `6d4a2fc` | 07-13 | fix: S3 — aumentar PENDING_D1_MAX_VALUE 60KB a 5MB + referencias ligeras + docs | `src/App.jsx` + 19 archivos | 🔧 Storage + 📄 Docs |
| 2 | `868d235` | 07-13 | fix(certificado): unifica el borde de las dos rutas de descarga y elimina el corte de texto | `src/App.jsx` | 🖨️ Certificados |
| 3 | `7cd3434` | 07-13 | feat(ia): escalado de profundidad al re-presionar análisis/recomendaciones/restricciones | `src/App.jsx` | 🤖 IA |
| 4 | `cd2c963` | 07-13 | feat(ia): los 3 prompts leen la HC completa — motivo de consulta, todos los énfasis y campos que se perdían | `src/App.jsx` (+41/-5) | 🤖 IA |
| 5 | `a98eff1` | 07-13 | feat(worker): CANDADO 2 — cierres de HC congelados en el servidor | `siso-worker/index.js` | 🔒 Worker |
| 6 | `4f8b81f` | 07-12 | perf(worker+sync): /store/prefix salta JSON.parse por fila en modo opt-in ?raw=1 | `siso-worker/index.js` | ⚡ Worker |
| 7 | `e4f53e9` | 07-12 | fix(sync): cierra grieta del candado + alivia descarga completa cada sync + reduce pool QUIC | `src/App.jsx` (+33/-6), `src/utils/syncManager.js` (+22/-2) | 🔄 Sync |
| 8 | `e7ed13a` | 07-11 | feat(worker): candado anti-encogimiento server-side en /store/chunked | `siso-worker/index.js` | 🔒 Worker |
| 9 | `687f256` | 07-11 | feat(ia): los prompts de HC ahora analizan el énfasis y los exámenes subidos | `src/App.jsx` | 🤖 IA |
| 10 | `e219b26` | 07-11 | fix(sync): timeout de /store/chunked 45s → 180s | `src/App.jsx` (+5/-1) | ⚡ Sync |

---

## 2. MAPA DE EQUIVALENCIAS: Monolito → Refactorizado

| Archivo Monolito | Archivo Refactorizado | Notas |
|------------------|----------------------|-------|
| `src/App.jsx` (IA/análisis HC) | `src/modules/ai/services/aiAnalysis.js` | Código de prompts IA y análisis de HC |
| `src/App.jsx` (certificados) | `src/lib/printService.js` | Generación de certificados PDF |
| `src/App.jsx` (_workerSet/_workerGet) | `src/lib/d1Client.js` | Cliente D1 con chunking |
| `src/App.jsx` (sync/login) | `src/stores/authStore.js` | Sincronización al hacer login |
| `src/utils/syncManager.js` | `src/lib/d1Client.js` + `src/stores/authStore.js` | No existe syncManager.js separado en refactorizado |
| `siso-worker/index.js` | `siso-worker/index.js` | **COMPARTIDO** — mismo archivo, debe sincronizarse |

---

## 3. ANÁLISIS DETALLADO POR COMMIT Y PLAN DE REPLICACIÓN

---

### COMMIT 10: `e219b26` — fix(sync): timeout de /store/chunked 45s → 180s

**Monolito — `src/App.jsx` (+5/-1):**
```javascript
// Antes:
const tid = setTimeout(() => ctrl.abort(), 45000);
// Después:
const tid = setTimeout(() => ctrl.abort(), 180000);
```
Razón: 45s cortaba subidas de ~4.5MB en conexiones con poco ancho de banda de SUBIDA (consultorio). 180s da margen real.

**Refactorizado — `src/lib/d1Client.js`:**
Buscar `setTimeout` con `AbortController` → verificar si el valor actual es 45000ms → cambiar a 180000ms.

| Aplicabilidad | Complejidad | Impacto |
|:---:|:---:|:---:|
| ✅ DIRECTA | 🟢 Baja (1 línea) | Evita fallos de subida en consultorios |

---

### COMMIT 9: `687f256` — feat(ia): los prompts de HC ahora analizan el énfasis y los exámenes subidos

**Monolito — `src/App.jsx`:**
Nuevo bloque que detecta énfasis (OSTEOMUSCULAR, CORAZÓN, etc.) y agrega marcadores textuales para la IA. Incorpora exámenes de apoyo subidos (laboratorio, imágenes) al contexto.

**Refactorizado — `src/modules/ai/services/aiAnalysis.js`:**
Verificar si `analyzeHC()` o similar YA incluye énfasis y exámenes en el prompt. Si no, replicar.

| Aplicabilidad | Complejidad | Impacto |
|:---:|:---:|:---:|
| ⚠️ ADAPTAR | 🟡 Media (~40 líneas) | Mejora precisión de IA en análisis de HC |

---

### COMMIT 8: `e7ed13a` — feat(worker): candado anti-encogimiento server-side en /store/chunked

**Monolito — `siso-worker/index.js`:**
Nuevo endpoint `POST /store/chunked` con validación de tamaño. El worker verifica que al reconstruir los chunks, el valor resultante NO sea menor que el original (anti-encogimiento). Si detecta encogimiento, rechaza y retorna error.

**Refactorizado — `siso-worker/index.js`:**
🔴 **NO EXISTE** el endpoint `/store/chunked`. El refactorizado tiene `d1Client.js` que YA intenta usar `/store/chunked` como vía primaria (commit `34d26b9`), pero siempre cae al fallback porque el worker no lo implementa.

| Aplicabilidad | Complejidad | Impacto |
|:---:|:---:|:---:|
| 🔴 **CRÍTICO** | 🔴 Alta (~80 líneas) | Sin esto, cada escritura grande cae al fallback vulnerable a carreras |

---

### COMMIT 7: `e4f53e9` — fix(sync): cierra grieta del candado + alivia descarga completa + reduce pool QUIC

**Monolito — `src/App.jsx` (+33/-6) + `src/utils/syncManager.js` (+22/-2):**

_workerSet: Claves protegidas (`siso_(db_)patients_`, `siso_atenciones`, `siso_hc_`) ahora **ABORTAN** escritura si `/store/chunked` falla (no hacen fallback a troceo cliente sin candado).

_workerGet: Pool de lectores concurrentes **6 → 2** + **1 reintento** 300ms.

syncManager.js: Throttle de descarga completa vía `lastFullSyncAt` + `_FULL_SYNC_MIN_INTERVAL`.

**Refactorizado:**
- `_workerSet` → `src/lib/d1Client.js` (`_chunkSet` o `d1Set`)
- `_workerGet` → `src/lib/d1Client.js` (`d1Get` o `_chunkedGet`)
- `syncManager.js` → `src/stores/authStore.js` + `src/lib/d1Client.js`

| Cambio | Dónde en refactorizado | Aplicabilidad |
|--------|----------------------|:---:|
| Abortar escritura si /store/chunked falla en claves protegidas | `src/lib/d1Client.js` `_chunkSet()` | ⚠️ ADAPTAR |
| Pool lectores 6→2 + reintento | `src/lib/d1Client.js` `d1Get()` | ✅ DIRECTA |
| Throttle descarga completa | `src/stores/authStore.js` o `src/lib/d1Client.js` | ⚠️ ADAPTAR |

| Aplicabilidad | Complejidad | Impacto |
|:---:|:---:|:---:|
| ⚠️ ADAPTAR | 🟡 Media (~60 líneas) | Previene pérdida de datos y saturación de red |

---

### COMMIT 6: `4f8b81f` — perf(worker+sync): /store/prefix salta JSON.parse por fila en modo opt-in ?raw=1

**Monolito — `siso-worker/index.js`:**
Nuevo query param `?raw=1` en `GET /store/prefix/:prefix`. Cuando está presente, el worker retorna las filas SIN hacer `JSON.parse`. Reduce latencia y CPU cuando el cliente solo necesita las claves.

**Refactorizado — `siso-worker/index.js`:**
El endpoint `GET /store/prefix/:prefix` YA existe (línea 90) pero NO soporta `?raw=1`.

| Aplicabilidad | Complejidad | Impacto |
|:---:|:---:|:---:|
| ✅ DIRECTA | 🟢 Baja (~10 líneas) | Reduce latencia de sync |

---

### COMMIT 5: `a98eff1` — feat(worker): CANDADO 2 — cierres de HC congelados en el servidor

**Monolito — `siso-worker/index.js`:**
Nuevo endpoint/lógica en `/store` que detecta claves `siso_hc_cerrada_*`. Una vez marcada como cerrada, el worker **rechaza cualquier modificación**.

**Refactorizado — `siso-worker/index.js`:**
🔴 **NO IMPLEMENTADO** — el worker actual no tiene lógica de cierres congelados.

| Aplicabilidad | Complejidad | Impacto |
|:---:|:---:|:---:|
| 🔴 **CRÍTICO** | 🟡 Media (~40 líneas) | Seguridad de datos: HC cerradas inmutables |

---

### COMMIT 4: `cd2c963` — feat(ia): los 3 prompts leen la HC completa

**Monolito — `src/App.jsx` (+41/-5):**
- Campos osteomusculares que se perdían: `osteo.muscular` y `osteo.articular`
- Batería énfasis CORAZÓN: FC, TA, ritmo/tonos, pulsos, edemas, perfusión, riesgoCV
- Marcador énfasis OSTEOMUSCULAR: inyecta guía textual para la IA
- Bloque `extras` con datos clínicos omitidos

**Refactorizado — `src/modules/ai/services/aiAnalysis.js`:**
Replicar lógica de detección de énfasis + inyección de marcadores + campos completos.

| Aplicabilidad | Complejidad | Impacto |
|:---:|:---:|:---:|
| ⚠️ ADAPTAR | 🟡 Media (~50 líneas) | Mejora calidad de análisis IA |

---

### COMMIT 3: `7cd3434` — feat(ia): escalado de profundidad al re-presionar

**Monolito — `src/App.jsx`:**
Al presionar repetidamente "Analizar"/"Recomendaciones"/"Restricciones", tracking de `pressCount` → prompt más detallado.

**Refactorizado — `src/modules/ai/services/aiAnalysis.js`:**
Agregar contador de presiones por sección + escalado de profundidad.

| Aplicabilidad | Complejidad | Impacto |
|:---:|:---:|:---:|
| ⚠️ ADAPTAR | 🟡 Media (~30 líneas) | UX: análisis más profundos al reintentar |

---

### COMMIT 2: `868d235` — fix(certificado): unifica el borde y elimina corte de texto

**Monolito — `src/App.jsx`:**
Unifica estilo de borde CSS entre rutas de descarga de certificados. Corrige corte de texto.

**Refactorizado — `src/lib/printService.js`:**
Verificar estilos de impresión/PDF para certificados.

| Aplicabilidad | Complejidad | Impacto |
|:---:|:---:|:---:|
| ⚠️ ADAPTAR | 🟢 Baja (~15 líneas CSS) | Calidad visual de certificados |

---

### COMMIT 1: `6d4a2fc` — fix: S3 — PENDING_D1_MAX_VALUE 60KB a 5MB + docs

**Monolito — 19 archivos:**
- `src/App.jsx`: `PENDING_D1_MAX_VALUE` 60KB → 5MB + referencias ligeras
- 12 archivos de documentación (NO se replican)
- `dist/index.html`

**Refactorizado:**
El cambio de 60KB → 5MB aplica a `src/lib/d1Client.js`. Documentación no se replica.

| Aplicabilidad | Complejidad | Impacto |
|:---:|:---:|:---:|
| ⚠️ PARCIAL | 🟢 Baja (1 constante) | Permite objetos más grandes sin chunking innecesario |

---

## 4. RESUMEN POR PRIORIDAD

### 🔴 FASE CRÍTICA — Backend compartido (DEBE aplicarse ya)

| # | Commit | Qué cambiar | Dónde | Líneas |
|---|--------|------------|------|:---:|
| 1 | `e7ed13a` | **Crear endpoint `/store/chunked`** con candado anti-encogimiento | `siso-worker/index.js` | ~80 |
| 2 | `a98eff1` | **CANDADO 2** — rechazar modificaciones a HC cerradas | `siso-worker/index.js` | ~40 |
| 3 | `e4f53e9` | Abortar escritura claves protegidas si /store/chunked falla | `src/lib/d1Client.js` | ~20 |
| 4 | `4f8b81f` | Modo `?raw=1` en `GET /store/prefix/:prefix` | `siso-worker/index.js` | ~10 |

### 🟡 FASE MEDIA — Frontend que requiere adaptación

| # | Commit | Qué cambiar | Dónde | Líneas |
|---|--------|------------|------|:---:|
| 5 | `cd2c963` | Prompts IA: campos osteomusculares + énfasis CORAZÓN | `src/modules/ai/services/aiAnalysis.js` | ~50 |
| 6 | `687f256` | Prompts IA: analizar énfasis y exámenes subidos | `src/modules/ai/services/aiAnalysis.js` | ~40 |
| 7 | `e4f53e9` | Pool lectores 6→2 + reintento + throttle sync | `src/lib/d1Client.js` + `src/stores/authStore.js` | ~40 |
| 8 | `7cd3434` | Escalado de profundidad IA al re-presionar | `src/modules/ai/services/aiAnalysis.js` | ~30 |

### 🟢 FASE BAJA — Ajustes menores

| # | Commit | Qué cambiar | Dónde | Líneas |
|---|--------|------------|------|:---:|
| 9 | `868d235` | Unificar bordes certificados, eliminar corte texto | `src/lib/printService.js` | ~15 |
| 10 | `e219b26` | Timeout 45s → 180s | `src/lib/d1Client.js` | 1 |
| 11 | `6d4a2fc` | PENDING_D1_MAX_VALUE 60KB → 5MB | `src/lib/d1Client.js` | 1 |

---

## 5. PROTOCOLO DE IMPLEMENTACIÓN

### Paso 1: Sincronizar Worker (BACKEND COMPARTIDO)
1. **`POST /store/chunked`** con candado anti-encogimiento
2. **CANDADO 2** — rechazar escrituras a `siso_hc_cerrada_*`
3. **`GET /store/prefix/:prefix?raw=1`** — modo sin JSON.parse
4. Replicar en `siso-worker-deploy/index.js`

### Paso 2: Actualizar d1Client.js
1. Timeout 45s → 180s
2. Pool lectores 6→2 + reintento 300ms
3. Abortar escritura claves protegidas si `/store/chunked` falla
4. PENDING_D1_MAX_VALUE 60KB → 5MB

### Paso 3: Actualizar aiAnalysis.js
1. Campos osteomusculares completos
2. Batería énfasis CORAZÓN
3. Marcadores énfasis OSTEOMUSCULAR
4. Énfasis y exámenes en prompts
5. Escalado de profundidad al re-presionar

### Paso 4: Actualizar printService.js
1. Unificar bordes certificados
2. Eliminar corte de texto

---

## 6. IMPACTO EN BACKEND COMPARTIDO

| Escenario | Riesgo |
|-----------|--------|
| Worker monolito se actualiza, refactorizado NO | 🔴 Refactorizado usa endpoints/comportamientos que ya no existen |
| Worker refactorizado se actualiza, monolito NO | 🔴 Mismo riesgo a la inversa |
| Ambos se actualizan simultáneamente | 🟢 Sin riesgo |

**Recomendación:** Aplicar cambios al worker primero en `siso-worker/` (dev), probar, luego desplegar a `siso-worker-deploy/` (producción compartido).

---

## 7. CONCLUSIÓN

1. **Son repositorios independientes** que comparten backend (D1 + Worker `siso-api`).
2. **El monolito está 2 días adelante** con 10 commits no replicados.
3. **4 cambios CRÍTICOS** en el worker compartido:
   - `/store/chunked` (inexistente en refactorizado)
   - CANDADO 2 para HC cerradas
   - Protección de claves en escrituras fallidas
   - Modo `?raw=1` en prefix
4. **6 cambios de frontend** a adaptar de monolítico → modular.
5. **Riesgo principal:** Worker de producción compartido — si se actualiza para uno, debe actualizarse para ambos.

---

*Protocolo generado el 2026-07-13 11:30 AM (UTC-4) con datos de GitHub API + 5 subagentes.*