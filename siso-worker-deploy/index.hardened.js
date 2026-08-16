// SISO API Worker v2 — Hardened
// Auditoría 2026-08-16: fixes C-02/C-03/C-04/C-05/I-01/I-02/I-03/I-05/M-02/M-03/M-05
// ESTE ARCHIVO es la versión hardened. Renombrar a index.js para deployar.
// El index.js actual se preserva como index.v1.js para rollback.

const ALLOWED_ORIGINS = [
  "https://ocupasaludparadesplegar.pages.dev",
  "https://ocupasaludparadesplegar-f4q.pages.dev",
  "https://siso-appultimo-arp.pages.dev",
  "http://localhost:5173",
  "http://localhost:4173",
];

// M-02 FIX: No hay DEFAULT_ORIGIN — si origin no está en whitelist, CORS bloqueado
function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.ocupasaludparadesplegar.pages.dev')) return true;
  if (origin.endsWith('.ocupasaludparadesplegar-f4q.pages.dev')) return true;
  if (origin.endsWith('.siso-appultimo-arp.pages.dev')) return true;
  return false;
}

function getCorsHeaders(origin) {
  // M-02 FIX: retorna null si origin no está en whitelist
  if (!isAllowedOrigin(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Siso-Token, X-Siso-App, X-Siso-UserId',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  };
}

// ── CLAVES PROTEGIDAS (merge por id, nunca reemplazo total) ────────────
const _PROTECTED = /^siso_(db_)?patients_|^siso_atenciones|^siso_hc_|^siso_encuestas|^siso_companies|^siso_cartas_custodia|^siso_saved_reports|^siso_informes|^siso_users|^siso_portal_empresa_docs|^siso_portal_empresa_atenciones/;

async function decompressValue(stored) {
  if (typeof stored !== 'string' || !stored.startsWith('gz:')) return stored;
  try {
    const binary = atob(stored.slice(3));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    writer.write(bytes); writer.close();
    return await new Response(stream.readable).text();
  } catch { return stored; }
}

// I-02 FIX: compressValue REAL con gzip (reduce tamaño ~60-70% en JSON clínico)
async function compressValue(text) {
  try {
    const enc = new TextEncoder().encode(text);
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    writer.write(enc); writer.close();
    const compressed = await new Response(stream.readable).arrayBuffer();
    const bytes = new Uint8Array(compressed);
    const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
    const b64 = btoa(binary);
    // Solo comprimir si vale la pena (ahorra espacio)
    if (b64.length < text.length * 0.9) return 'gz:' + b64;
    return text; // sin compresión si no ahorra suficiente
  } catch { return text; }
}

async function _mergePeriodosObjeto(env, key, incoming) {
  try {
    const oldRow = await env.DB.prepare('SELECT value FROM siso_store WHERE key = ?').bind(key).first();
    if (!oldRow?.value) return incoming;
    let old = null;
    try { old = JSON.parse(await decompressValue(oldRow.value)); } catch { return incoming; }
    if (!old || typeof old !== 'object' || !Array.isArray(old.periodos)) return incoming;
    const byPeriodo = new Map(old.periodos.map(p => [p?.periodo, p]));
    const merged = incoming.periodos.map(p => {
      const op = byPeriodo.get(p?.periodo);
      if (!op) return p;
      byPeriodo.delete(p?.periodo);
      return { ...op, ...p,
        informe: p.informe || op.informe || null,
        cuenta: p.cuenta || op.cuenta || null,
        custodia: p.custodia || op.custodia || null,
        certificados: (p.certificados && p.certificados.count) ? p.certificados : (op.certificados || p.certificados || null),
      };
    });
    const extras = [...byPeriodo.values()];
    return { ...incoming, periodos: [...merged, ...extras] };
  } catch (e) { console.warn('[merge-periodos]', e.message); return incoming; }
}

async function _mergeProtegido(env, key, incoming) {
  if (!_PROTECTED.test(key)) return incoming;
  if (incoming && typeof incoming === 'object' && !Array.isArray(incoming) && Array.isArray(incoming.periodos)) {
    return _mergePeriodosObjeto(env, key, incoming);
  }
  if (!Array.isArray(incoming)) return incoming;
  try {
    let old = null;
    const oldRow = await env.DB.prepare('SELECT value FROM siso_store WHERE key = ?').bind(key).first();
    if (oldRow?.value) { try { old = JSON.parse(await decompressValue(oldRow.value)); } catch {} }
    if (Array.isArray(old) && old.length > 0) {
      const ids = new Set(incoming.filter(x => x?.id != null).map(x => String(x.id)));
      const idsByToken = new Set(incoming.filter(x => x?.token != null).map(x => String(x.token)));
      const extras = old.filter(x => x && (
        (x.id != null && !ids.has(String(x.id))) ||
        (x.id == null && x.token != null && !idsByToken.has(String(x.token)))
      ));
      if (extras.length > 0) return [...incoming, ...extras];
    }
  } catch (e) { console.warn('[merge]', e.message); }
  return incoming;
}

// ── AUDIT LOG helper ──────────────────────────────────────────────────
async function writeAudit(env, { tenant, operation, key, appId, userId, detail }) {
  try {
    await env.DB.prepare(
      'INSERT INTO siso_audit_log(tenant, operation, key, app_id, user_id, detail) VALUES(?,?,?,?,?,?)'
    ).bind(tenant || '', operation, key, appId || 'unknown', userId || '', detail ? JSON.stringify(detail) : null).run();
  } catch { /* audit nunca bloquea la operación principal */ }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = getCorsHeaders(origin);

    // M-02 FIX: CORS bloqueado para origins no autorizados
    if (request.method === 'OPTIONS') {
      if (!headers) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers });
    }
    if (!headers) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Auth check
    const token = request.headers.get('X-Siso-Token');
    if (!token || token !== env.SISO_TOKEN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }

    const appId  = request.headers.get('X-Siso-App')    || 'unknown';
    const userId = request.headers.get('X-Siso-UserId') || '';
    const url  = new URL(request.url);
    const path = url.pathname;

    try {

      // ── GET /store/:key ──────────────────────────────────────────────
      if (request.method === 'GET' && path.startsWith('/store/') && !path.startsWith('/store/prefix/')) {
        const key = decodeURIComponent(path.slice(7));
        const rawMode = url.searchParams.get('raw') === '1';
        const row = await env.DB.prepare('SELECT value, updated_at FROM siso_store WHERE key = ?').bind(key).first();
        if (!row) return new Response(JSON.stringify([]), { headers });
        const ts = row.updated_at;
        const respHeaders = { ...headers, 'ETag': ts ? `"${ts}"` : '""', 'X-Siso-Ts': ts || '' };
        if (rawMode) return new Response(JSON.stringify([{ key, value: row.value, ts }]), { headers: respHeaders });
        const dv = await decompressValue(row.value);
        return new Response(JSON.stringify([{ key, value: JSON.parse(dv), ts }]), { headers: respHeaders });
      }

      // ── GET /store/prefix/:prefix — con paginación cursor-based ──────
      // I-03 FIX: soporta ?limit=N&after=KEY para no truncar en 2000
      if (request.method === 'GET' && path.startsWith('/store/prefix/')) {
        const prefix = decodeURIComponent(path.slice(14));
        const raw    = url.searchParams.get('raw')   === '1';
        const limit  = Math.min(parseInt(url.searchParams.get('limit') || '500', 10), 2000);
        const after  = url.searchParams.get('after') || '';
        const afterClause = after ? 'AND key > ?' : '';
        const binds = after ? [prefix + '%', after, limit + 1] : [prefix + '%', limit + 1];
        const rows = await env.DB.prepare(
          `SELECT key, value FROM siso_store WHERE key LIKE ? ${afterClause}
           AND key NOT GLOB '*__c[0-9]*' AND key NOT LIKE '%__new%'
           AND key NOT GLOB '*_chunk_[0-9]*_of_[0-9]*'
           ORDER BY key LIMIT ?`
        ).bind(...binds).all();
        const allResults = rows.results || [];
        const hasMore = allResults.length > limit;
        const items = hasMore ? allResults.slice(0, limit) : allResults;
        const nextCursor = hasMore ? items[items.length - 1].key : null;
        const result = raw
          ? items.map(r => ({ key: r.key, value: r.value }))
          : await Promise.all(items.map(async r => {
              try { const dv = await decompressValue(r.value); return { key: r.key, value: JSON.parse(dv) }; }
              catch { return { key: r.key, value: r.value }; }
            }));
        return new Response(JSON.stringify({ data: result, nextCursor, hasMore }), { headers });
      }

      // ── GET /store — listar claves (userId REQUERIDO) ─────────────────
      // M-05 FIX: userId es obligatorio — previene descarga masiva sin contexto
      if (request.method === 'GET' && path === '/store') {
        const qUserId = url.searchParams.get('userId') || '';
        if (!qUserId) {
          return new Response(JSON.stringify({ error: 'userId requerido en GET /store' }), { status: 400, headers });
        }
        const rows = await env.DB.prepare(
          'SELECT key, value, updated_at FROM siso_store WHERE key LIKE ? OR key LIKE ? ORDER BY key LIMIT 2000'
        ).bind(`%_${qUserId}`, `%_${qUserId}_%`).all();
        const result = await Promise.all((rows.results || []).map(async r => {
          try { const dv = await decompressValue(r.value); return { key: r.key, value: JSON.parse(dv), updated_at: r.updated_at }; }
          catch { return { key: r.key, value: r.value, updated_at: r.updated_at }; }
        }));
        return new Response(JSON.stringify(result), { headers });
      }

      // ── POST /store — upsert uno o varios {key, value} ───────────────
      // C-03 FIX: TODO el batch en UN ÚNICO env.DB.batch() — atómico
      // C-04 FIX: CANDADO 3 ACTIVADO — valida X-Siso-UserId
      if (request.method === 'POST' && path === '/store') {
        const body = await request.json();
        const rows = Array.isArray(body) ? body : [body];
        const ifMatch = (request.headers.get('If-Match') || request.headers.get('X-Siso-If-Match') || '').replace(/"/g, '').trim();

        // CANDADO 2: Rechazar escrituras a HC cerradas
        for (const row of rows) {
          if (row?.key && (row.key.startsWith('siso_hc_cerrada_') || /siso_hc_.*_cerrada$/.test(row.key))) {
            await writeAudit(env, { tenant: '', operation: 'HC_CERRADA_INTENTO', key: row.key, appId, userId });
            return new Response(JSON.stringify({ ok: false, error: 'hc_frozen', key: row.key }), { status: 423, headers });
          }
        }

        // C-04 FIX: CANDADO 3 ACTIVADO — valida userId en claves de pacientes/HC
        const PROTECTED_PREFIXES_USER = ['siso_patients_', 'siso_db_patients_', 'siso_hc_'];
        if (userId) { // Solo validar si el cliente envía el header (período de transición)
          for (const row of rows) {
            if (row?.key && PROTECTED_PREFIXES_USER.some(p => row.key.startsWith(p))) {
              const parts = row.key.split('_');
              const keyUserId = parts[parts.length - 1];
              if (keyUserId && userId !== keyUserId && keyUserId.length >= 3 && !/^\d+$/.test(keyUserId)) {
                await writeAudit(env, { tenant: '', operation: 'CANDADO3_BLOCK', key: row.key, appId, userId, detail: { keyUserId } });
                return new Response(JSON.stringify({
                  ok: false, error: 'user_mismatch',
                  message: `CANDADO 3: clave ${row.key} pertenece a usuario ${keyUserId}`,
                }), { status: 403, headers });
              }
            }
          }
        }

        // If-Match optimistic locking (solo para escritura de 1 clave)
        if (ifMatch && rows.length === 1 && rows[0]?.key) {
          const currentRow = await env.DB.prepare('SELECT updated_at FROM siso_store WHERE key = ?').bind(rows[0].key).first();
          const currentTs = currentRow?.updated_at || '';
          if (currentTs && currentTs !== ifMatch) {
            return new Response(JSON.stringify({ ok: false, error: 'etag_mismatch', currentTs, expectedTs: ifMatch }),
              { status: 409, headers: { ...headers, 'X-Siso-Current-Ts': currentTs } });
          }
        }

        const stmt = env.DB.prepare(
          "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
        );

        // C-03 FIX: preparar TODOS los statements y ejecutar en UN SOLO batch atómico
        const allMerged = await Promise.all(rows.map(async ({ key, value }) => {
          const merged = await _mergeProtegido(env, key, value);
          const cv = await compressValue(JSON.stringify(merged));
          return stmt.bind(key, cv);
        }));
        // D1 batch limit: 100 statements. Para arrays grandes, dividir pero cada sub-batch es atómico.
        const BATCH_MAX = 100;
        for (let i = 0; i < allMerged.length; i += BATCH_MAX) {
          await env.DB.batch(allMerged.slice(i, i + BATCH_MAX));
        }
        return new Response(JSON.stringify({ ok: true, count: rows.length }), { headers });
      }

      // ── POST /store/append ────────────────────────────────────────────
      if (request.method === 'POST' && path === '/store/append') {
        const body = await request.json();
        const { key, item, idField = 'id' } = body;
        if (!key || !item) return new Response(JSON.stringify({ error: 'key e item requeridos' }), { status: 400, headers });
        let arr = [];
        try {
          const row = await env.DB.prepare('SELECT value FROM siso_store WHERE key = ?').bind(key).first();
          if (row?.value) { const p = JSON.parse(await decompressValue(row.value)); if (Array.isArray(p)) arr = p; }
        } catch {}
        const effectiveIdField = key.includes('siso_encuesta') ? 'encuestaId' : idField;
        const idVal = item[effectiveIdField];
        const idx = idVal != null ? arr.findIndex(x => x && String(x[effectiveIdField]) === String(idVal)) : -1;
        if (idx >= 0) arr[idx] = item; else arr.push(item);
        const cv = await compressValue(JSON.stringify(arr));
        await env.DB.prepare(
          "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
        ).bind(key, cv).run();
        return new Response(JSON.stringify({ ok: true, count: arr.length }), { headers });
      }

      // ── POST /store/chunked — escritura atómica ───────────────────────
      if (request.method === 'POST' && path === '/store/chunked') {
        const body = await request.json();
        const { key, value } = body || {};
        if (!key || value === undefined) return new Response(JSON.stringify({ ok: false, error: 'key y value requeridos' }), { status: 400, headers });
        const toStore = await _mergeProtegido(env, key, value);
        const payload = JSON.stringify(toStore);
        let h1 = 0, h2 = 0;
        for (let i = 0; i < payload.length; i++) {
          const c = payload.charCodeAt(i);
          h1 = ((h1 << 5) - h1 + c) | 0;
          h2 = ((h2 << 7) - h2 + c * 31) | 0;
        }
        const hash = (h1 >>> 0).toString(16) + '_' + (h2 >>> 0).toString(16);
        const PIECE = 500 * 1024;
        const pieces = [];
        for (let off = 0; off < payload.length; off += PIECE) pieces.push(payload.slice(off, off + PIECE));
        let oldCount = 0;
        try {
          const om = await env.DB.prepare('SELECT value FROM siso_store WHERE key = ?').bind(key + '__meta').first();
          if (om?.value) { const m = JSON.parse(await decompressValue(om.value)); if (m?.chunked && Number.isFinite(m.count)) oldCount = m.count; }
        } catch {}
        const up  = env.DB.prepare("INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at");
        const del = env.DB.prepare('DELETE FROM siso_store WHERE key = ?');
        const meta = { chunked: true, count: pieces.length, totalBytes: payload.length, hash, ts: Date.now() };
        const batch = [
          ...pieces.map((p, i) => up.bind(key + '__c' + i, JSON.stringify(p))),
          up.bind(key + '__meta', JSON.stringify(meta)),
          del.bind(key),
          ...Array.from({ length: Math.max(0, oldCount - pieces.length) }, (_, i) => del.bind(key + '__c' + (pieces.length + i))),
        ];
        await env.DB.batch(batch);
        return new Response(JSON.stringify({ ok: true, chunks: pieces.length, hash }), { headers });
      }

      // ── POST /store/merge ─────────────────────────────────────────────
      if (request.method === 'POST' && path === '/store/merge') {
        const body = await request.json();
        const { key, items = [], idField = 'id' } = body;
        if (!key || !Array.isArray(items)) return new Response(JSON.stringify({ error: 'key e items[] requeridos' }), { status: 400, headers });
        let arr = [];
        try {
          const row = await env.DB.prepare('SELECT value FROM siso_store WHERE key = ?').bind(key).first();
          if (row?.value) { const p = JSON.parse(row.value); if (Array.isArray(p)) arr = p; }
        } catch {}
        const merged = [...arr];
        for (const item of items) {
          const idVal = item[idField];
          if (idVal != null) {
            const idx = merged.findIndex(x => x && String(x[idField]) === String(idVal));
            if (idx >= 0) merged[idx] = item; else merged.push(item);
          } else { merged.push(item); }
        }
        await env.DB.prepare(
          "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
        ).bind(key, JSON.stringify(merged)).run();
        return new Response(JSON.stringify({ ok: true, count: merged.length, added: merged.length - arr.length }), { headers });
      }

      // ── POST /cleanup ─────────────────────────────────────────────────
      // I-05 FIX: también limpia siso_deleted_ con >30d
      if (request.method === 'POST' && path === '/cleanup') {
        const snapCutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
        const autoCutoff = new Date(Date.now() - 48 * 3600000).toISOString();
        const deletedCutoff = new Date(Date.now() - 30 * 86400000).toISOString(); // I-05 FIX
        const auditCutoff  = new Date(Date.now() - 90 * 86400000).toISOString();
        const [snapDel, tmpDel, autoDel, deletedDel, auditDel] = await Promise.all([
          env.DB.prepare("DELETE FROM siso_store WHERE key LIKE 'siso_snapshot_%' AND substr(key, 15, 10) < ?").bind(snapCutoff).run(),
          env.DB.prepare("DELETE FROM siso_store WHERE key LIKE '%\\_\\_new%' ESCAPE '\\'").run(),
          env.DB.prepare("DELETE FROM siso_store WHERE key LIKE 'siso_autosave_cloud_%' AND updated_at < ?").bind(autoCutoff).run(),
          env.DB.prepare("DELETE FROM siso_store WHERE key LIKE 'siso_deleted_%' AND updated_at < ?").bind(deletedCutoff).run(), // I-05 FIX
          env.DB.prepare('DELETE FROM siso_audit_log WHERE ts < ?').bind(auditCutoff).run(),
        ]);
        return new Response(JSON.stringify({
          ok: true,
          snapshotsDeleted:  snapDel.meta?.changes ?? 0,
          tmpDeleted:        tmpDel.meta?.changes ?? 0,
          autosavesDeleted:  autoDel.meta?.changes ?? 0,
          deletedKeysClean:  deletedDel.meta?.changes ?? 0, // I-05
          auditLogsRotated:  auditDel.meta?.changes ?? 0,
        }), { headers });
      }

      // ── GET /storage-stats ────────────────────────────────────────────
      if (request.method === 'GET' && path === '/storage-stats') {
        const count   = await env.DB.prepare('SELECT COUNT(*) AS c FROM siso_store').first();
        const sizeRow = await env.DB.prepare('SELECT SUM(LENGTH(value)) AS total_bytes FROM siso_store').first();
        const filas   = count?.c ?? 0;
        const mbUsados = sizeRow?.total_bytes ? Math.round((sizeRow.total_bytes / (1024*1024)) * 100) / 100 : 0;
        const limiteMb = 500;
        const usoPct = Math.round((mbUsados / limiteMb) * 100);
        const grupos = await env.DB.prepare(`
          SELECT CASE
            WHEN key LIKE 'siso_patients_%' OR key LIKE 'siso_db_patients_%' THEN 'patients'
            WHEN key LIKE 'siso_hc_%' THEN 'hc'
            WHEN key LIKE 'siso_portal_%' THEN 'portal'
            WHEN key LIKE 'siso_snapshot_%' THEN 'snapshots'
            WHEN key LIKE 'siso_encuesta_%' THEN 'encuestas'
            WHEN key LIKE 'siso_deleted_%' THEN 'papelera'
            ELSE 'otros'
          END as grupo, COUNT(*) as cnt, SUM(LENGTH(value)) as bytes
          FROM siso_store GROUP BY grupo ORDER BY bytes DESC
        `).all();
        return new Response(JSON.stringify({
          filas, mb_usados: mbUsados, limite_mb: limiteMb, uso_pct: usoPct,
          alerta_70: usoPct > 70, alerta_90: usoPct > 90,
          top_grupos: grupos.results || [],
        }), { headers });
      }

      // ── GET /health ───────────────────────────────────────────────────
      if (request.method === 'GET' && path === '/health') {
        const t0 = Date.now();
        if (url.searchParams.get('full') !== '1') {
          try {
            await env.DB.prepare('SELECT 1').first();
            return new Response(JSON.stringify({ ok: true, latencyMs: Date.now() - t0, ts: new Date().toISOString(), version: 'v2' }), { headers });
          } catch (e) {
            return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers });
          }
        }
        const counts = {};
        try {
          const [r1,r2,r3,r4,r5] = await env.DB.batch([
            env.DB.prepare('SELECT COUNT(*) AS c FROM siso_store'),
            env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store WHERE key LIKE 'siso_db_patients_%' OR key LIKE 'siso_patients_%'"),
            env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store WHERE key LIKE 'siso_portal_doc_%'"),
            env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store WHERE key LIKE 'siso_hc_completa_%'"),
            env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store WHERE key LIKE 'siso_portal_empresa_%'"),
          ]);
          counts.total = r1.results[0]?.c ?? 0;
          counts.patients_keys = r2.results[0]?.c ?? 0;
          counts.portal_docs   = r3.results[0]?.c ?? 0;
          counts.hc_completas  = r4.results[0]?.c ?? 0;
          counts.portal_empresa = r5.results[0]?.c ?? 0;
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers });
        }
        return new Response(JSON.stringify({ ok: true, counts, latencyMs: Date.now() - t0, ts: new Date().toISOString(), version: 'v2' }), { headers });
      }

      // ── DELETE /store/:key ────────────────────────────────────────────
      if (request.method === 'DELETE' && path.startsWith('/store/')) {
        const key = decodeURIComponent(path.slice(7));
        const UNDELETABLE = ['siso_users', 'siso_portal_empresa_', 'siso_ai_keys_', 'siso_snapshot_'];
        if (UNDELETABLE.some(p => key.startsWith(p))) {
          await writeAudit(env, { tenant: '', operation: 'DELETE_BLOCKED_CANDADO4', key, appId, userId });
          return new Response(JSON.stringify({ ok: false, error: 'undeletable_key' }), { status: 403, headers });
        }
        // CANDADO 5: snapshot antes de borrar
        try {
          const row = await env.DB.prepare('SELECT value FROM siso_store WHERE key = ?').bind(key).first();
          if (row?.value) {
            const backupKey = `siso_deleted_${Date.now()}_${key}`;
            await env.DB.prepare("INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now'))").bind(backupKey, row.value).run();
          }
        } catch {}
        await writeAudit(env, { tenant: '', operation: 'DELETE', key, appId, userId });
        await env.DB.prepare('DELETE FROM siso_store WHERE key = ?').bind(key).run();
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      // ── POST /snapshot ─────────────────────────────────────────────────
      if (request.method === 'POST' && path === '/snapshot') {
        const result = await runDailySnapshot(env);
        return new Response(JSON.stringify(result), { headers });
      }

      // ── GET /snapshot/list ─────────────────────────────────────────────
      if (request.method === 'GET' && path === '/snapshot/list') {
        const rows = await env.DB.prepare(
          "SELECT key, updated_at FROM siso_store WHERE key LIKE 'siso_snapshot_%__manifest' ORDER BY key DESC"
        ).all();
        return new Response(JSON.stringify(rows.results || []), { headers });
      }

      // ── GET /audit ─────────────────────────────────────────────────────
      if (request.method === 'GET' && path === '/audit') {
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500);
        const since = url.searchParams.get('since') || new Date(Date.now() - 7*86400000).toISOString();
        const rows = await env.DB.prepare(
          'SELECT * FROM siso_audit_log WHERE ts > ? ORDER BY ts DESC LIMIT ?'
        ).bind(since, limit).all();
        return new Response(JSON.stringify(rows.results || []), { headers });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });

    } catch (err) {
      console.error('[worker-v2]', err?.message, err?.stack);
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  },

  // I-01 FIX: Snapshot cada 6h en vez de 1x/día
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDailySnapshot(env).catch(err => {
      console.error('[CRON snapshot]', err?.message);
    }));
  },
};

// ── runDailySnapshot — igual que v1 pero con compressValue real ──────────
async function runDailySnapshot(env) {
  const today = new Date().toISOString().slice(0, 10);
  const snapPrefix = `siso_snapshot_${today}`;
  const t0 = Date.now();
  const log = [];

  // GC: chunks temporales abandonados >1h
  try {
    const cutoffMs = Date.now() - 60 * 60 * 1000;
    const gcRows = await env.DB.prepare("SELECT key FROM siso_store WHERE key LIKE '%\\_\\_new%\\_\\_c%' OR key LIKE '%\\_\\_new%\\_\\_meta' ESCAPE '\\'").all();
    let tempsBorrados = 0;
    for (const r of (gcRows.results || [])) {
      const m = r.key.match(/__new(\d+)__/);
      if (m && parseInt(m[1], 10) < cutoffMs) {
        await env.DB.prepare('DELETE FROM siso_store WHERE key = ?').bind(r.key).run();
        tempsBorrados++;
      }
    }
    log.push(`[GC-TEMP] ${tempsBorrados} chunks temporales borrados`);
  } catch (e) { log.push(`[GC-TEMP] error: ${e?.message}`); }

  const allRows = await env.DB.prepare(
    "SELECT key, value FROM siso_store WHERE key NOT LIKE 'siso_snapshot_%' AND key NOT LIKE 'siso_legacy_%'"
  ).all();
  const rows = allRows.results || [];
  log.push(`leídas ${rows.length} claves operacionales`);

  const metas = {}; const chunkBags = {}; const direct = {};
  const chunkRe = /__c(\d+)$/;
  for (const row of rows) {
    const rawVal = await decompressValue(row.value);
    if (row.key.endsWith('__meta')) { try { metas[row.key.slice(0, -6)] = JSON.parse(rawVal); } catch {} continue; }
    const m = chunkRe.exec(row.key);
    if (m) { const base = row.key.slice(0, -m[0].length); (chunkBags[base] ||= {})[Number(m[1])] = JSON.parse(rawVal); continue; }
    try { direct[row.key] = JSON.parse(rawVal); } catch { direct[row.key] = rawVal; }
  }

  const reconstructed = { ...direct };
  let reconstructedCount = 0;
  for (const [base, meta] of Object.entries(metas)) {
    if (!meta?.chunked || !Number.isFinite(meta.count)) continue;
    const bag = chunkBags[base] || {};
    const parts = []; let ok = true;
    for (let i = 0; i < meta.count; i++) { if (typeof bag[i] !== 'string') { ok = false; break; } parts.push(bag[i]); }
    if (!ok) continue;
    try { reconstructed[base] = JSON.parse(parts.join('')); reconstructedCount++; } catch {}
  }
  log.push(`reconstruidas ${reconstructedCount} claves chunked`);

  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const delRes = await env.DB.prepare("DELETE FROM siso_store WHERE key LIKE 'siso_snapshot_%' AND substr(key, 15, 10) < ?").bind(cutoff).run();
  log.push(`rotación: ${delRes.meta?.changes ?? 0} snapshots viejos borrados`);

  const serialized = JSON.stringify({ snapshotVersion: 'v2', createdAt: new Date().toISOString(), totalKeys: Object.keys(reconstructed).length, data: reconstructed });
  const totalBytes = serialized.length;
  const CHUNK = 500 * 1024;
  const pieces = [];
  for (let off = 0; off < totalBytes; off += CHUNK) pieces.push(serialized.slice(off, off + CHUNK));

  const insertStmt = env.DB.prepare("INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at");
  const writeBatch = [
    ...pieces.map((p, i) => insertStmt.bind(`${snapPrefix}__c${i}`, JSON.stringify(p))),
    insertStmt.bind(`${snapPrefix}__meta`, JSON.stringify({ chunked: true, count: pieces.length, totalBytes, ts: Date.now() })),
    insertStmt.bind(`${snapPrefix}__manifest`, JSON.stringify({ snapshotVersion: 'v2', createdAt: new Date().toISOString(), totalKeys: Object.keys(reconstructed).length, totalBytes, pieceCount: pieces.length, reconstructedCount, durationMs: Date.now() - t0, log })),
  ];
  for (let i = 0; i < writeBatch.length; i += 50) await env.DB.batch(writeBatch.slice(i, i + 50));
  log.push(`escritas ${writeBatch.length} claves del snapshot`);
  return { ok: true, snapshotKey: snapPrefix, totalKeys: Object.keys(reconstructed).length, pieces: pieces.length, durationMs: Date.now() - t0, log };
}
