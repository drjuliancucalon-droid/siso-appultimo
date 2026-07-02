// src/lib/d1Client.js — SPRINT 1: D1 Client completo
// Cloudflare D1 via Worker API
// Ref: PROMPT_MAESTRO_V5.md secciones 4, 5.2, 6
// Monolito referencia: línea 21366 (_writeArrayMergeD1)

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://siso-api.dr-juliancucalon.workers.dev';
const WORKER_TOKEN = import.meta.env.VITE_WORKER_TOKEN || '';
const CHUNK_THRESHOLD = 500_000; // 500KB
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
 * Cada chunk va como { key, value, _chunk: N }.
 * Luego D1WriteArrayMerge los reensambla.
 */
async function _chunkSet(key, value) {
  const payload = JSON.stringify(value);
  if (payload.length <= CHUNK_THRESHOLD) {
    // Small payload → direct POST
    return _retry(
      () =>
        fetch(`${WORKER_URL}/store`, {
          method: 'POST',
          headers: _authHeaders(),
          body: JSON.stringify({ key, value }),
        }).then(_checkResponse),
      `d1Set(${key})`
    );
  }

  // Chunk the payload
  const chunks = [];
  let offset = 0;
  let chunkIndex = 0;
  while (offset < payload.length) {
    const chunk = payload.substring(offset, offset + CHUNK_THRESHOLD);
    chunks.push({ _chunk: chunkIndex, _total: 0, _key: key, data: chunk });
    offset += CHUNK_THRESHOLD;
    chunkIndex++;
  }
  chunks.forEach((c, i) => {
    c._total = chunks.length;
    // Sólo el último chunk lleva el data real; los anteriores llevan prefijo
  });

  // Write chunks
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    await _retry(
      () =>
        fetch(`${WORKER_URL}/store`, {
          method: 'POST',
          headers: _authHeaders(),
          body: JSON.stringify({
            key: `${key}_chunk_${i}_of_${chunks.length}`,
            value: i === chunks.length - 1
              ? { data: payload.substring(i * CHUNK_THRESHOLD), _isLastChunk: true, _totalChunks: chunks.length }
              : { data: payload.substring(i * CHUNK_THRESHOLD, (i + 1) * CHUNK_THRESHOLD), _chunkIndex: i, _totalChunks: chunks.length },
          }),
        }).then(_checkResponse),
      `d1Set chunk ${i + 1}/${chunks.length} (${key})`
    );
  }

  // Write manifest
  await _retry(
    () =>
      fetch(`${WORKER_URL}/store`, {
        method: 'POST',
        headers: _authHeaders(),
        body: JSON.stringify({
          key,
          value: { _chunked: true, _chunks: chunks.length, _size: payload.length },
        }),
      }).then(_checkResponse),
    `d1Set manifest (${key})`
  );

  return { ok: true, chunked: true, chunks: chunks.length };
}

async function _chunkGet(key, ts) {
  const resp = await _retry(
    () =>
      fetch(`${WORKER_URL}/store/${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: _authHeaders(),
      }).then(_checkResponse),
    `d1Get(${key})`
  );

  const rows = resp.json || (Array.isArray(resp) ? resp : []);
  const row = rows?.[0] || null;
  const value = row?.value ?? null;

  // ── Formato Platform A: manifest en la clave principal ──────────────
  if (value && typeof value === 'object' && value._chunked) {
    const totalChunks = value._chunks || 1;
    let assembled = '';
    for (let i = 0; i < totalChunks; i++) {
      const chunkResp = await _retry(
        () =>
          fetch(`${WORKER_URL}/store/${encodeURIComponent(key + '_chunk_' + i + '_of_' + totalChunks)}`, {
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
              fetch(`${WORKER_URL}/store/${encodeURIComponent(key + '__c' + i)}`, {
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
 * d1Get(key)
 * GET /store/:key del Worker.
 * Devuelve { value, ts } donde ts es el timestamp para If-Match.
 *
 * Ejemplo:
 *   const { value, ts } = await d1Get('siso_patients_drcucalon');
 */
export async function d1Get(key) {
  return _chunkGet(key);
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
  // Procesar en batches de 10 para no saturar el Worker
  for (let i = 0; i < keys.length; i += 10) {
    const batch = keys.slice(i, i + 10);
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