// src/lib/d1Client.js — SPRINT 1: D1 Client completo
// Cloudflare D1 via Worker API
// Ref: PROMPT_MAESTRO_V5.md secciones 4, 5.2, 6
// Monolito referencia: línea 21366 (_writeArrayMergeD1)

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://siso-api.dr-juliancucalon.workers.dev';
const WORKER_TOKEN = import.meta.env.VITE_WORKER_TOKEN || '';
const CHUNK_THRESHOLD = 500_000; // 500KB
// COMMIT 6d4a2fc: aumentado de 60KB a 5MB para permitir objetos grandes
const PENDING_D1_MAX_VALUE = 5_000_000; // 5MB (antes 60KB)
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1s base para backoff exponencial

// ── Helpers ───────────────────────────────────────────────────────────

function _authHeaders() {
  if (!WORKER_TOKEN) {
    console.warn('[d1Client] VITE_WORKER_TOKEN no configurado. Las operaciones D1 pueden fallar.');
  }
  return {
    'Content-Type': 'application/json',
    'X-Siso-Token': WORKER_TOKEN,
  };
}

/**
 * _hash64 - Hash simple de 64 bits para verificación de integridad de chunks.
 * Usado para verificar que los datos no se corrompieron en tránsito.
 */
export function _hash64(s) {
  let h1 = 0, h2 = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = ((h1 << 5) - h1 + c) | 0;
    h2 = ((h2 << 7) - h2 + c) | 0;
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

async function _sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Retry wrapper con backoff exponencial.
 * Solo reintenta en errores de red, timeout, o 502/503/504.
 * NO reintenta en 400, 401, 403, 404, 409 (conflicto de locking).
 */
async function _retry(fn, label) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err.status || 0;
      const isRetryable =
        status === 0 || // Network error
        status === 502 ||
        status === 503 ||
        status === 504 ||
        err.message?.includes('fetch') ||
        err.message?.includes('network');

      if (!isRetryable || attempt === MAX_RETRIES) {
        // 409 (conflict) → propagate with etag info
        if (status === 409) throw err;
        throw new Error(
          `[d1Client] ${label} falló tras ${attempt} intento(s): ${err.message}`
        );
      }

      const delay = BASE_DELAY * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      console.warn(`[d1Client] ${label} intento ${attempt}/${MAX_RETRIES}, reintentando en ${delay}ms...`);
      await _sleep(delay);
    }
  }
  throw lastError;
}

/**
 * Chunkea una string JSON si excede el umbral.
 *
 * AUDITORÍA 2026-07-10: escribe en el formato CANÓNICO del monolito
 * (piezas string en `${key}__cN` + manifiesto en `${key}__meta`, y la clave
 * base se BORRA). El formato propio anterior (manifiesto {_chunked:true} en
 * la clave base + `${key}_chunk_i_of_N`) era ilegible para el monolito: al
 * leer la clave base tomaba el manifiesto como si fuera el dato y al
 * guardar la pisaba. Ambas apps comparten D1, así que solo puede existir UN
 * formato de escritura. _chunkGet conserva la lectura de ambos formatos
 * para poder leer residuos legacy durante la transición.
 */
async function _chunkSet(key, value) {
  const payload = JSON.stringify(value);
  if (payload.length <= CHUNK_THRESHOLD) {
    // Small payload → direct POST
    const resp = await _retry(
      () =>
        fetch(`${WORKER_URL}/store`, {
          method: 'POST',
          headers: _authHeaders(),
          body: JSON.stringify({ key, value }),
        }).then(_checkResponse),
      `d1Set(${key})`
    );
    // Igual que el monolito: si quedó un __meta chunked de una versión
    // grande anterior, limpiarlo en background para que ningún lector
    // reconstruya datos viejos.
    (async () => {
      try {
        const r = await fetch(`${WORKER_URL}/store/${encodeURIComponent(key + '__meta')}`, { headers: _authHeaders() });
        if (!r.ok) return;
        const rows = await r.json();
        const meta = rows?.[0]?.value;
        if (meta && meta.chunked && Number.isFinite(meta.count)) {
          for (let i = 0; i < meta.count; i++) {
            await fetch(`${WORKER_URL}/store/${encodeURIComponent(key + '__c' + i)}`, { method: 'DELETE', headers: _authHeaders() }).catch(() => {});
          }
          await fetch(`${WORKER_URL}/store/${encodeURIComponent(key + '__meta')}`, { method: 'DELETE', headers: _authHeaders() }).catch(() => {});
        }
      } catch {}
    })();
    return resp;
  }

  // ── Intento PRIMARIO 2026-07-11: troceo ATÓMICO server-side ──
  // /store/chunked escribe piezas+__meta+borrado de base en UNA transacción
  // D1 (formato canónico, con hash) — inmune a escrituras simultáneas de
  // otras pestañas o del monolito. Fallback: troceo cliente (abajo).
  // COMMIT e219b26: timeout 45s → 180s para conexiones lentas (consultorio).
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 180000);
    const r = await fetch(`${WORKER_URL}/store/chunked`, {
      method: 'POST',
      headers: _authHeaders(),
      body: JSON.stringify({ key, value }),
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (r.ok) {
      const d = await r.json().catch(() => null);
      if (d && d.ok) return { ok: true, chunked: true, chunks: d.chunks };
    }
    console.warn(`[d1Client] /store/chunked no disponible (${r.status}) — fallback a troceo cliente para ${key}`);
  } catch (e) {
    console.warn(`[d1Client] /store/chunked falló (${e?.message}) — fallback a troceo cliente para ${key}`);
  }

  // COMMIT e4f53e9: claves protegidas ABORTAN si /store/chunked falla.
  // El troceo cliente sin candado PUEDE causar pérdida de datos.
  const PROTECTED_PREFIXES = ['siso_patients_', 'siso_db_patients_', 'siso_atenciones', 'siso_hc_'];
  if (PROTECTED_PREFIXES.some(p => key.startsWith(p))) {
    console.error(`[d1Client] ABORTANDO escritura de clave protegida ${key}: /store/chunked no disponible`);
    return { ok: false, error: 'chunked_unavailable_for_protected_key' };
  }

  // ── Detectar manifiesto legacy propio para limpiar sus piezas al final ──
  let legacyChunks = 0;
  try {
    const r0 = await fetch(`${WORKER_URL}/store/${encodeURIComponent(key)}`, { headers: _authHeaders() });
    if (r0.ok) {
      const rows0 = await r0.json();
      const v0 = rows0?.[0]?.value;
      if (v0 && typeof v0 === 'object' && v0._chunked && Number.isFinite(v0._chunks)) legacyChunks = v0._chunks;
    }
  } catch {}

  // ── Piezas string crudas en `${key}__cN` (formato monolito) ──
  const pieces = [];
  for (let offset = 0; offset < payload.length; offset += CHUNK_THRESHOLD) {
    pieces.push(payload.substring(offset, offset + CHUNK_THRESHOLD));
  }
  for (let i = 0; i < pieces.length; i++) {
    await _retry(
      () =>
        fetch(`${WORKER_URL}/store`, {
          method: 'POST',
          headers: _authHeaders(),
          body: JSON.stringify({ key: `${key}__c${i}`, value: pieces[i] }),
        }).then(_checkResponse),
      `d1Set chunk ${i + 1}/${pieces.length} (${key})`
    );
  }

  // ── Manifiesto `${key}__meta` (punto de commit para los lectores) ──
  await _retry(
    () =>
      fetch(`${WORKER_URL}/store`, {
        method: 'POST',
        headers: _authHeaders(),
        body: JSON.stringify({
          key: `${key}__meta`,
          value: { chunked: true, count: pieces.length, totalBytes: payload.length, ts: Date.now() },
        }),
      }).then(_checkResponse),
    `d1Set meta (${key})`
  );

  // ── Borrar la clave base (los lectores caen al __meta) y limpiar legacy ──
  await _retry(
    () =>
      fetch(`${WORKER_URL}/store/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: _authHeaders(),
      }).then(_checkResponse),
    `d1Set delete-base (${key})`
  );
  if (legacyChunks > 0) {
    (async () => {
      for (let i = 0; i < legacyChunks; i++) {
        await fetch(`${WORKER_URL}/store/${encodeURIComponent(`${key}_chunk_${i}_of_${legacyChunks}`)}`, { method: 'DELETE', headers: _authHeaders() }).catch(() => {});
      }
    })();
  }

  return { ok: true, chunked: true, chunks: pieces.length };
}

async function _chunkGet(key, ts, opts = {}) {
  const rawParam = opts.raw ? '?raw=1' : '';
  const resp = await _retry(
    () =>
      fetch(`${WORKER_URL}/store/${encodeURIComponent(key)}${rawParam}`, {
        method: 'GET',
        headers: _authHeaders(),
      }).then(_checkResponse),
    `d1Get(${key})${opts.raw ? ' raw' : ''}`
  );

  const rows = resp.json || (Array.isArray(resp) ? resp : []);
  const row = rows?.[0] || null;
  let value = row?.value ?? null;
  // F1-07: si modo raw, el valor es string crudo → parsear en cliente
  if (opts.raw && typeof value === 'string') {
    try { value = JSON.parse(value); } catch { /* dejar como string */ }
  }

  // ── Formato Platform A: manifest en la clave principal ──────────────
  if (value && typeof value === 'object' && value._chunked) {
    const totalChunks = value._chunks || 1;
    let assembled = '';
    for (let i = 0; i < totalChunks; i++) {
          const chunkResp = await _retry(
            () =>
              fetch(`${WORKER_URL}/store/${encodeURIComponent(key + '_chunk_' + i + '_of_' + totalChunks)}?raw=1`, {
                method: 'GET',
                headers: _authHeaders(),
              }).then(_checkResponse),
            `d1Get chunk ${i}/${totalChunks} (${key})`
          );
      const chunkRows = chunkResp.json || (Array.isArray(chunkResp) ? chunkResp : []);
      if (chunkRows.length > 0 && chunkRows[0].value?.data) {
        assembled += chunkRows[0].value.data;
      }
    }
    try {
      return { value: JSON.parse(assembled), ts: row.ts || null };
    } catch {
      return { value: assembled, ts: row.ts || null };
    }
  }

  // ── Formato monolito: manifest en key__meta, chunks en key__c0..cN ──
  // Se activa cuando la clave principal está vacía/null
  if (!value) {
    try {
      const metaResp = await _retry(
        () =>
          fetch(`${WORKER_URL}/store/${encodeURIComponent(key + '__meta')}`, {
            method: 'GET',
            headers: _authHeaders(),
          }).then(_checkResponse),
        `d1Get meta (${key})`
      );
      const metaRows = metaResp.json || (Array.isArray(metaResp) ? metaResp : []);
      const meta = metaRows?.[0]?.value;
      if (meta && (meta.chunked || meta.count)) {
        const count = meta.count || meta.chunks || 1;
        let assembled = '';
        for (let i = 0; i < count; i++) {
          const chunkResp = await _retry(
            () =>
              fetch(`${WORKER_URL}/store/${encodeURIComponent(key + '__c' + i)}?raw=1`, {
                method: 'GET',
                headers: _authHeaders(),
              }).then(_checkResponse),
            `d1Get monolith-chunk ${i}/${count} (${key})`
          );
          const chunkRows = chunkResp.json || (Array.isArray(chunkResp) ? chunkResp : []);
          const chunkVal = chunkRows?.[0]?.value;
          if (typeof chunkVal === 'string') assembled += chunkVal;
          else if (chunkVal?.data) assembled += chunkVal.data;
        }
        try {
          return { value: JSON.parse(assembled), ts: metaRows[0]?.ts || null };
        } catch {
          return { value: assembled, ts: null };
        }
      }
    } catch {
      // Meta no existe → clave realmente vacía
    }
  }

  return { value, ts: row?.ts || null };
}

async function _checkResponse(response) {
  if (!response.ok) {
    const err = new Error(`D1 Worker error ${response.status}`);
    err.status = response.status;
    // Extract etag info on 409
    if (response.status === 409) {
      try {
        const body = await response.json();
        err.currentTs = body.currentTs;
        err.expectedTs = body.expectedTs;
        err.code = body.error || 'etag_mismatch';
      } catch {}
    }
    try {
      const body = await response.json();
      err.message = body.error || err.message;
    } catch {}
    throw err;
  }
  // Return parsed JSON + keep raw for etag extraction
  const raw = response;
  const cloned = raw.clone ? await raw.clone().json().catch(() => raw.body) : await raw.json().catch(() => null);
  return {
    json: cloned,
    etag: response.headers.get('ETag')?.replace(/"/g, '') || null,
    ts: response.headers.get('X-Siso-Ts') || null,
  };
}

// ── PUBLIC API ─────────────────────────────────────────────────────────

/**
 * d1Get(key, opts?)
 * GET /store/:key del Worker.
 * Devuelve { value, ts } donde ts es el timestamp para If-Match.
 * opts.raw: si true, usa ?raw=1 para evitar JSON.parse en el worker
 *           (reduce riesgo de 503 por CPU timeout en valores grandes).
 *
 * Ejemplo:
 *   const { value, ts } = await d1Get('siso_patients_drcucalon');
 *   const { value } = await d1Get('siso_encuestas', { raw: true });
 */
export async function d1Get(key, opts = {}) {
  return _chunkGet(key, undefined, opts);
}

/**
 * d1Set(key, value, opts)
 * POST /store con body { key, value }.
 * opts.ifMatchTs: envía header If-Match para locking optimista.
 * Soporta chunking automático si JSON.stringify(value) > 500KB.
 *
 * Ejemplo:
 *   await d1Set('siso_patients_drcucalon', patientsList);
 *   await d1Set('siso_patients_drcucalon', patientsList, { ifMatchTs: ts });
 */
export async function d1Set(key, value, opts = {}) {
  if (opts.ifMatchTs) {
    return _retry(
      () =>
        fetch(`${WORKER_URL}/store`, {
          method: 'POST',
          headers: {
            ..._authHeaders(),
            'If-Match': `"${opts.ifMatchTs}"`,
          },
          body: JSON.stringify({ key, value }),
        }).then(_checkResponse),
      `d1Set(${key}) con If-Match`
    );
  }

  // Chunking automático si payload supera umbral
  return _chunkSet(key, value);
}

/**
 * d1Delete(key)
 * DELETE /store/:key del Worker.
 *
 * Ejemplo:
 *   await d1Delete('siso_patients_old');
 */
export async function d1Delete(key) {
  return _retry(
    () =>
      fetch(`${WORKER_URL}/store/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: _authHeaders(),
      }).then(_checkResponse),
    `d1Delete(${key})`
  );
}

/**
 * d1Append(key, item, idField = 'id')
 * POST /store/append — agrega o actualiza UN item dentro de un array en D1
 * con fusión server-side. Evita carreras de escritura concurrentes.
 * Usado como vía primaria para respuestas de encuestas.
 *
 * @param {string} key - Clave D1
 * @param {object} item - Item a agregar/actualizar
 * @param {string} idField - Campo único para identificar (default: 'id')
 * @returns {Promise<{ok: boolean, count: number}>}
 */
export async function d1Append(key, item, idField = 'id') {
  return _retry(
    () =>
      fetch(`${WORKER_URL}/store/append`, {
        method: 'POST',
        headers: _authHeaders(),
        body: JSON.stringify({ key, item, idField }),
      }).then(_checkResponse),
    `d1Append(${key})`
  );
}

/**
 * d1GetMany(keys)
 * Batch GET de múltiples keys. Usa Promise.all con concurrencia
 * controlada (máximo 10 en paralelo).
 *
 * Ejemplo:
 *   const results = await d1GetMany(['siso_portal_ABC', 'siso_patients_X']);
 *   // results: { 'siso_portal_ABC': value, 'siso_patients_X': value }
 */
export async function d1GetMany(keys) {
  const result = {};
  // COMMIT e4f53e9: pool reducido 10→2 para no saturar QUIC/UDP
  for (let i = 0; i < keys.length; i += 2) {
    const batch = keys.slice(i, i + 2);
    const promises = batch.map(async (k) => {
      const { value } = await d1Get(k);
      return { key: k, value };
    });
    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ key, value }) => {
      result[key] = value;
    });
  }
  return result;
}

/**
 * d1WriteArrayMerge(key, list, idField)
 * 🔴 CRÍTICA — PROTEGE D1 CONTRA REGRESIÓN (monolito línea 21366)
 *
 * Lee el valor actual de la key en D1 (array existente).
 * Si existe, mergea por idField:
 *   • Si un item del nuevo list existe en el viejo → reemplaza
 *   • Si no existe → agrega
 *   • Items que están en el viejo pero NO en el nuevo → se conservan
 *   • Items en el nuevo sin idField → siempre se agregan
 * Luego escribe el resultado en D1 con If-Match locking.
 *
 * Si ocurre 409 (conflicto), reintenta hasta 2 veces con el ts actualizado.
 *
 * @param {string} key - Clave D1
 * @param {Array} list - Lista nueva a mergear
 * @param {string} idField - Campo único para identificar items (default: 'id')
 * @returns {Promise<{ok: boolean, merged: number, total: number}>}
 *
 * Ejemplo:
 *   await d1WriteArrayMerge('siso_atenciones_cerradas', nuevasAtenciones, 'id');
 */
// ── SMART READ — D1 + Supabase fallback ─────────────────────────────────

/**
 * _tsOf - Extrae timestamp de un valor. Asume timestamp ISO en _updatedAt o ts.
 */
export function _tsOf(v) {
  if (!v) return 0;
  if (v._updatedAt) return new Date(v._updatedAt).getTime();
  if (v.updatedAt) return new Date(v.updatedAt).getTime();
  if (v.updated_at) return new Date(v.updated_at).getTime();
  if (v.ts) return new Date(v.ts).getTime();
  return 0;
}

/**
 * _readSmart(key) — Lee desde D1 y Supabase en paralelo, usa el más reciente.
 * Lee D1 en paralelo con Supabase, compara timestamps y retorna el más actual.
 * Si D1 falla, usa Supabase como fallback.
 * Si D1 tiene valor pero Supabase también tiene una versión más reciente, usa la más reciente.
 */
export async function _readSmart(key, supabaseQuery) {
  const d1Promise = d1Get(key).catch(() => null);
  const sbPromise = supabaseQuery ? Promise.race([
    supabaseQuery,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 5000))
  ]).catch(() => null) : Promise.resolve(null);

  const [d1Result, sbResult] = await Promise.all([d1Promise, sbPromise]);
  const d1Val = d1Result?.value;
  const sbVal = sbResult;
  const d1Has = d1Val !== null && d1Val !== undefined;
  const sbHas = sbVal !== null && sbVal !== undefined;

  if (d1Has && sbHas) {
    const tD1 = _tsOf(d1Val);
    const tSB = _tsOf(sbVal);
    if (tSB > tD1) {
      // FIX 2026-07-21 (FASE 2 PROMPT_MAESTRO): catch-up a D1 cuando Supabase
      // gana — sin esto, D1 se queda desactualizado indefinidamente y la
      // próxima fusión server-side (_mergeProtegido) compara contra una
      // versión vieja. Mismo patrón que el monolito (App.jsx:804,813).
      d1Set(key, sbVal).catch(() => {});
      return sbVal;
    }
    return d1Val;
  }
  if (d1Has) return d1Val;
  if (sbHas) {
    d1Set(key, sbVal).catch(() => {});
    return sbVal;
  }
  return null;
}

// ── PENDING D1 WRITES — cola de escritura offline ───────────────────────

const _UNSYNCED_HC_KEY = 'siso_hc_sin_respaldo';

export function _markUnsyncedHC(failed) {
  try {
    if (failed) localStorage.setItem(_UNSYNCED_HC_KEY, JSON.stringify({ ts: Date.now() }));
    else localStorage.removeItem(_UNSYNCED_HC_KEY);
  } catch {}
}

export function _hasUnsyncedHC() {
  try { return !!localStorage.getItem(_UNSYNCED_HC_KEY); } catch { return false; }
}

const _PENDING_D1_KEY = 'siso_pending_d1_writes';
const _PENDING_D1_MAX_RETRIES = 20;

export function _getPendingD1() {
  try {
    return JSON.parse(localStorage.getItem(_PENDING_D1_KEY) || '{}');
  } catch {
    return {};
  }
}

export function _clearPendingD1(key) {
  const p = _getPendingD1();
  delete p[key];
  localStorage.setItem(_PENDING_D1_KEY, JSON.stringify(p));
}

export function _enqueuePendingD1(key, value) {
  try {
    const p = _getPendingD1();
    p[key] = { value, attempts: 0, queuedAt: Date.now() };
    localStorage.setItem(_PENDING_D1_KEY, JSON.stringify(p));
  } catch (e) {
    console.warn('[d1Client] No se pudo encolar escritura pendiente:', key, e);
  }
}

export async function d1WriteArrayMerge(key, list, idField = 'id') {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;

    // 1) Leer actual
    const { value: currentValue, ts } = await d1Get(key);
    const currentList = Array.isArray(currentValue) ? currentValue : [];

    // 🔴 FIX: Si la clave NO existe (primera escritura), escribir directamente sin If-Match
    if (!currentValue && list.length > 0) {
      try {
        await d1Set(key, list);
        return { ok: true, merged: list.length, total: list.length, firstWrite: true };
      } catch (err) {
        if (err.status === 409 && attempts < maxAttempts) {
          console.warn(`[d1Client] d1WriteArrayMerge(${key}) firstWrite fallo (409), reintento ${attempts}/${maxAttempts}...`);
          await _sleep(BASE_DELAY * Math.pow(2, attempts - 1));
          continue;
        }
        throw err;
      }
    }

    // 2) Merge
    const merged = [];
    const seenIds = new Set();

    // Primero: items del list existente (conservar)
    const newIds = new Set(list.map((item) => (item?.[idField] != null ? String(item[idField]) : null)).filter(Boolean));
    for (const oldItem of currentList) {
      if (oldItem?.[idField] != null) {
        const oldId = String(oldItem[idField]);
        seenIds.add(oldId);
        // Si el viejo está en la nueva lista → usar versión nueva
        if (newIds.has(oldId)) {
          const newVersion = list.find((item) => String(item?.[idField]) === oldId);
          if (newVersion) merged.push(newVersion);
          newIds.delete(oldId); // Marcar como procesado
        } else {
          // Si no está en la nueva lista → conservar viejo
          merged.push(oldItem);
        }
      } else {
        // Items viejos sin idField se conservan siempre
        merged.push(oldItem);
      }
    }

    // Agregar items nuevos que no estaban en la lista vieja
    for (const newItem of list) {
      if (newItem?.[idField] != null) {
        const id = String(newItem[idField]);
        if (!seenIds.has(id)) {
          merged.push(newItem);
          seenIds.add(id);
        }
      } else {
        // Items nuevos sin idField → siempre agregar
        merged.push(newItem);
      }
    }

    // 3) Escribir con If-Match
    try {
      await d1Set(key, merged, { ifMatchTs: ts || undefined });
      return { ok: true, merged: merged.length, total: merged.length };
    } catch (err) {
      if (err.status === 409 && attempts < maxAttempts) {
        // Conflicto: otro write ganó la carrera → reintentar con versión fresca
        console.warn(`[d1Client] d1WriteArrayMerge(${key}) conflicto (409), reintento ${attempts}/${maxAttempts}...`);
        await _sleep(BASE_DELAY * Math.pow(2, attempts - 1));
        continue;
      }
      throw err;
    }
  }

  throw new Error(`[d1Client] d1WriteArrayMerge(${key}) falló tras ${maxAttempts} intentos`);
}