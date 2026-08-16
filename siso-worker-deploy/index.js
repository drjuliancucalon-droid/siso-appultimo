// SISO API Worker — Cloudflare D1 backend
// Reemplaza Supabase siso_store como almacenamiento en nube
// OPT-2026-08-16: Cache HTTP catálogo, GET /store filtrado, batch pre-read merge

// Lista explícita de orígenes permitidos. Incluye el proyecto git-connected
// (-f4q) Y el alias antiguo sin sufijo, por compatibilidad histórica.
const ALLOWED_ORIGINS = [
  "https://ocupasaludparadesplegar.pages.dev",
  "https://ocupasaludparadesplegar-f4q.pages.dev",
    "https://siso-appultimo-arp.pages.dev",
  "http://localhost:5173",
  "http://localhost:4173",
];
// Fallback usado en respuestas cuando el Origin no fue reconocido (preserva
// retro-compatibilidad: si alguien llama sin Origin válido, igual recibe CORS
// dirigido al alias original).
const DEFAULT_ORIGIN = ALLOWED_ORIGINS[0];

async function compressValue(text) {
  return text; // no-op: guardar siempre JSON plano
}
async function decompressValue(stored) {
  if (typeof stored !== "string" || !stored.startsWith("gz:")) return stored;
  try {
    const binary = atob(stored.slice(3));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const stream = new DecompressionStream("gzip");
    const writer = stream.writable.getWriter();
    writer.write(bytes);
    writer.close();
    return await new Response(stream.readable).text();
  } catch (e) {
    return stored;
  }
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.ocupasaludparadesplegar.pages.dev')) return true;
  if (origin.endsWith('.ocupasaludparadesplegar-f4q.pages.dev')) return true;
  if (origin.endsWith('.siso-appultimo-arp.pages.dev')) return true; // BUG-A-08 preview URLs
  return false;
}

// ── CLAVES PROTEGIDAS (fusión por id, nunca reemplazo total) ───────────────
// COMMIT 3531448: siso_encuestas entra en la protección
// COMMIT a28c77e: siso_companies entra en la protección
// COMMIT 1661b5f: custodias, informes, propuestas, usuarios
// COMMIT 50f852b: portal_empresa_docs, portal_empresa_atenciones
const _PROTECTED = /^siso_(db_)?patients_|^siso_atenciones|^siso_hc_|^siso_encuestas|^siso_companies|^siso_cartas_custodia|^siso_saved_reports|^siso_informes|^siso_users|^siso_portal_empresa_docs|^siso_portal_empresa_atenciones/;

// COMMIT 50f852b: siso_portal_empresa_docs_<nit> no es un arreglo: es un objeto
// {nit, nombre, codigoAcceso, periodos:[{periodo, informe, cuenta, custodia, certificados}]}.
// Fusiona por periodo, y dentro de cada periodo preserva informe/cuenta/custodia/
// certificados que el entrante traiga en null pero el viejo sí tenía.
async function _mergePeriodosObjeto(env, key, incoming) {
  try {
    const oldRow = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key).first();
    if (!oldRow?.value) return incoming;
    let old = null;
    try { old = JSON.parse(await decompressValue(oldRow.value)); } catch { return incoming; }
    if (!old || typeof old !== "object" || !Array.isArray(old.periodos)) return incoming;
    const byPeriodo = new Map(old.periodos.map(p => [p?.periodo, p]));
    const merged = incoming.periodos.map(p => {
      const op = byPeriodo.get(p?.periodo);
      if (!op) return p;
      byPeriodo.delete(p?.periodo);
      return {
        ...op, ...p,
        informe: p.informe || op.informe || null,
        cuenta: p.cuenta || op.cuenta || null,
        custodia: p.custodia || op.custodia || null,
        certificados: (p.certificados && p.certificados.count) ? p.certificados : (op.certificados || p.certificados || null),
      };
    });
    const extras = [...byPeriodo.values()];
    if (extras.length > 0) console.log(`[merge] CANDADO ${key}: +${extras.length} periodos preservados`);
    return { ...incoming, periodos: [...merged, ...extras] };
  } catch (e) { console.warn(`[merge] candado-objeto ${key} error:`, e.message); return incoming; }
}

// OPT-2026-08-16: _mergeProtegido con batch pre-read para reducir queries D1
// Cuando se llama desde POST /store con múltiples claves, pre-leemos todas
// las claves protegidas en una sola query IN(...) antes del loop individual.
// La lógica de fusión (CANDADO 1) es idéntica — solo el orden de lectura cambió.
async function _mergeProtegidoBatch(env, rows) {
  // Separar claves protegidas de no protegidas
  const protectedRows = rows.filter(r => r?.key && _PROTECTED.test(r.key));
  const unprotectedRows = rows.filter(r => !r?.key || !_PROTECTED.test(r.key));

  if (protectedRows.length === 0) return rows;

  // Pre-leer todas las claves protegidas en una sola query
  const keys = protectedRows.map(r => r.key);
  const placeholders = keys.map(() => '?').join(',');
  let existingMap = new Map();
  try {
    const existing = await env.DB.prepare(
      `SELECT key, value FROM siso_store WHERE key IN (${placeholders})`
    ).bind(...keys).all();
    for (const row of (existing.results || [])) {
      existingMap.set(row.key, row.value);
    }
  } catch (e) {
    console.warn('[batch-pre-read] error, fallback a individual:', e.message);
    // Fallback: si el batch falla, procesar individualmente
    return await Promise.all(rows.map(async r => ({
      key: r.key,
      value: await _mergeProtegido(env, r.key, r.value)
    })));
  }

  // Procesar claves protegidas con datos pre-leídos
  const mergedProtected = await Promise.all(protectedRows.map(async r => {
    const { key, value: incoming } = r;

    // Caso especial: portal_empresa_docs (objeto con .periodos)
    if (incoming && typeof incoming === "object" && !Array.isArray(incoming) && Array.isArray(incoming.periodos)) {
      return { key, value: await _mergePeriodosObjeto(env, key, incoming) };
    }

    if (!Array.isArray(incoming)) return { key, value: incoming };

    const storedRaw = existingMap.get(key);
    if (!storedRaw) return { key, value: incoming };

    let old = null;
    try { old = JSON.parse(await decompressValue(storedRaw)); } catch {}

    // Si no es array directo, intentar reconstruir desde chunks
    if (!Array.isArray(old)) {
      const metaRaw = existingMap.get(key + '__meta');
      if (metaRaw) {
        try {
          const m = JSON.parse(await decompressValue(metaRaw));
          if (m?.chunked && Number.isFinite(m.count)) {
            let joined = '';
            for (let i = 0; i < m.count; i++) {
              const pr = await env.DB.prepare('SELECT value FROM siso_store WHERE key = ?').bind(`${key}__c${i}`).first();
              if (!pr?.value) { joined = null; break; }
              const pv = JSON.parse(await decompressValue(pr.value));
              joined += (typeof pv === 'string') ? pv : '';
            }
            if (joined) { try { const p = JSON.parse(joined); if (Array.isArray(p)) old = p; } catch {} }
          }
        } catch {}
      }
    }

    if (Array.isArray(old) && old.length > 0) {
      const ids = new Set(incoming.filter(x => x && x.id != null).map(x => String(x.id)));
      const idsByToken = new Set(incoming.filter(x => x && x.token != null).map(x => String(x.token)));
      const extras = old.filter(x => x && ((x.id != null && !ids.has(String(x.id))) || (x.id == null && x.token != null && !idsByToken.has(String(x.token)))));
      if (extras.length > 0) {
        console.log(`[merge] CANDADO ${key}: +${extras.length} preservados (entrante=${incoming.length}, final=${incoming.length + extras.length})`);
        return { key, value: [...incoming, ...extras] };
      }
    }
    return { key, value: incoming };
  }));

  // Recombinar en el orden original
  const mergedMap = new Map([...mergedProtected, ...unprotectedRows.map(r => [r.key, r])].map(item => 
    Array.isArray(item) ? [item[0], { key: item[0], value: item[1] }] : [item.key, item]
  ));
  return rows.map(r => mergedMap.get(r.key) || r);
}

// Función original _mergeProtegido mantenida intacta para uso individual
// (POST /store/chunked, POST /store/append la usan directamente)
async function _mergeProtegido(env, key, incoming) {
  if (!_PROTECTED.test(key)) return incoming;
  if (incoming && typeof incoming === "object" && !Array.isArray(incoming) && Array.isArray(incoming.periodos)) {
    return _mergePeriodosObjeto(env, key, incoming);
  }
  if (!Array.isArray(incoming)) return incoming;
  try {
    let old = null;
    const oldRow = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key).first();
    if (oldRow?.value) {
      try { old = JSON.parse(await decompressValue(oldRow.value)); } catch {}
    }
    if (!Array.isArray(old)) {
      const om = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key + "__meta").first();
      if (om?.value) {
        const m = JSON.parse(await decompressValue(om.value));
        if (m?.chunked && Number.isFinite(m.count)) {
          let joined = "";
          for (let i = 0; i < m.count; i++) {
            const pr = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(`${key}__c${i}`).first();
            if (!pr?.value) { joined = null; break; }
            const pv = JSON.parse(await decompressValue(pr.value));
            joined += (typeof pv === "string") ? pv : "";
          }
          if (joined) { try { const p = JSON.parse(joined); if (Array.isArray(p)) old = p; } catch {} }
        }
      }
    }
    if (Array.isArray(old) && old.length > 0) {
      const ids = new Set(incoming.filter(x => x && x.id != null).map(x => String(x.id)));
      const idsByToken = new Set(incoming.filter(x => x && x.token != null).map(x => String(x.token)));
      const extras = old.filter(x => x && ((x.id != null && !ids.has(String(x.id))) || (x.id == null && x.token != null && !idsByToken.has(String(x.token)))));
      if (extras.length > 0) {
        console.log(`[merge] CANDADO ${key}: +${extras.length} preservados (entrante=${incoming.length}, final=${incoming.length + extras.length})`);
        return [...incoming, ...extras];
      }
    }
  } catch (e) { console.warn(`[merge] candado ${key} error:`, e.message); }
  return incoming;
}

function getCorsHeaders(origin) {
  const allow = isAllowedOrigin(origin) ? origin : DEFAULT_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type, X-Siso-Token, X-Siso-App, X-Siso-UserId',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = getCorsHeaders(origin);

    // OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Auth check
    const token = request.headers.get("X-Siso-Token");
    if (!token || token !== env.SISO_TOKEN) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ── GET /store/:key ──────────────────────────────────────────────
      // Devuelve también `ts` (updated_at) para soporte de If-Match en POST
      // COMMIT 1bf1233 — modo ?raw=1 evita JSON.parse + 503 por CPU timeout
      // OPT-2026-08-16: Cache HTTP 30s para claves de catálogo (companies, portal_docs, ai_keys)
      if (request.method === "GET" && path.startsWith("/store/") && !path.startsWith("/store/prefix/")) {
        const key = decodeURIComponent(path.slice(7));
        const rawMode = url.searchParams.get("raw") === "1";
        const row = await env.DB.prepare("SELECT value, updated_at FROM siso_store WHERE key = ?").bind(key).first();
        if (!row) return new Response(JSON.stringify([]), { headers });
        const ts = row.updated_at;

        // OPT-2026-08-16: Cache HTTP para claves de catálogo (baja frecuencia de cambio)
        // HC, pacientes y atenciones siguen con no-store para garantizar datos frescos
        const isCatalog = key.startsWith('siso_companies_') ||
                          key.startsWith('siso_portal_empresa_docs_') ||
                          key.startsWith('siso_ai_keys_');
        const cacheControl = isCatalog
          ? 'public, max-age=30, stale-while-revalidate=60'
          : 'no-store';

        const respHeaders = {
          ...headers,
          "ETag": ts ? `"${ts}"` : '""',
          "X-Siso-Ts": ts || "",
          "Cache-Control": cacheControl,
        };
        if (rawMode) {
          return new Response(JSON.stringify([{ key, value: row.value, ts }]), { headers: respHeaders });
        }
        const dv = await decompressValue(row.value);
        const value = JSON.parse(dv);
        return new Response(JSON.stringify([{ key, value, ts }]), { headers: respHeaders });
      }

      // ── GET /store/prefix/:prefix — buscar por prefijo ───────────────
      // COMMIT 4f8b81f — modo ?raw=1 salta JSON.parse por fila
      // FIX 2026-07-21: excluir piezas de chunk
      if (request.method === "GET" && path.startsWith("/store/prefix/")) {
        const prefix = decodeURIComponent(path.slice(14));
        const raw = url.searchParams.get("raw") === "1";
        const rows = await env.DB.prepare(
          "SELECT key, value FROM siso_store WHERE key LIKE ? AND key NOT GLOB '*__c[0-9]*' AND key NOT LIKE '%__new%' AND key NOT GLOB '*_chunk_[0-9]*_of_[0-9]*' LIMIT 2000"
        ).bind(prefix + "%").all();
        const result = raw
          ? (rows.results || []).map(r => ({ key: r.key, value: r.value }))
          : await Promise.all((rows.results || []).map(async r => {
              try {
                const dv = await decompressValue(r.value);
                return { key: r.key, value: JSON.parse(dv) };
              } catch {
                return { key: r.key, value: r.value };
              }
            }));
        return new Response(JSON.stringify(result), { headers });
      }

      // ── GET /store — listar claves ────────────────────────────────────
      // OPT-2026-08-16: rama sin userId ahora filtra chunks/snapshots/deleted
      // y reduce LIMIT de 2000 a 500. Rama con userId: SIN CAMBIOS.
      if (request.method === "GET" && path === "/store") {
        const userId = url.searchParams.get("userId") || "";
        let rows;
        if (userId) {
          // Rama userId: intacta — la usan monolito y refactor
          rows = await env.DB.prepare(
            "SELECT key, value, updated_at FROM siso_store WHERE key LIKE ? OR key LIKE ? LIMIT 2000"
          ).bind(`%_${userId}`, `%_${userId}_%`).all();
        } else {
          // Rama general: filtrar internals para reducir payload
          rows = await env.DB.prepare(
            `SELECT key, value, updated_at FROM siso_store
             WHERE key NOT GLOB '*__c[0-9]*'
               AND key NOT LIKE '%__meta'
               AND key NOT LIKE 'siso_snapshot_%'
               AND key NOT LIKE 'siso_deleted_%'
             ORDER BY updated_at DESC
             LIMIT 500`
          ).all();
        }
        const result = await Promise.all((rows.results || []).map(async r => {
          try {
            const dv = await decompressValue(r.value);
            return { key: r.key, value: JSON.parse(dv), updated_at: r.updated_at };
          } catch {
            return { key: r.key, value: r.value, updated_at: r.updated_at };
          }
        }));
        return new Response(JSON.stringify(result), { headers });
      }

      // ── POST /store — upsert uno o varios {key, value} ───────────────
      // OPT-2026-08-16: usa _mergeProtegidoBatch para pre-leer claves protegidas
      // en una sola query IN(...) en vez de N queries individuales.
      if (request.method === "POST" && path === "/store") {
        const body = await request.json();
        const rows = Array.isArray(body) ? body : [body];
        const ifMatch = (request.headers.get("If-Match") || request.headers.get("X-Siso-If-Match") || "").replace(/"/g, "").trim();

        // CANDADO 3 (INERTE): validar userId en claves de pacientes.
        const appId = request.headers.get("X-Siso-App") || "unknown";
        const userId = request.headers.get("X-Siso-UserId") || "";
        const PROTECTED_PREFIXES_USER = ['siso_patients_', 'siso_db_patients_', 'siso_hc_'];
        for (const row of rows) {
          if (row?.key && PROTECTED_PREFIXES_USER.some(p => row.key.startsWith(p))) {
            const keyUserId = row.key.split('_').pop();
            if (userId && keyUserId && userId !== keyUserId && keyUserId.length >= 3) {
              return new Response(JSON.stringify({
                ok: false, error: "user_mismatch",
                message: `CANDADO 3: la clave ${row.key} pertenece a otro usuario (${keyUserId})`,
                app: appId,
              }), { status: 403, headers });
            }
          }
        }

        // CANDADO 2: Rechazar escrituras a HC cerradas
        for (const row of rows) {
          if (row?.key && (
            row.key.startsWith("siso_hc_cerrada_") ||
            /siso_hc_.*_cerrada$/.test(row.key)
          )) {
            return new Response(JSON.stringify({
              ok: false,
              error: "hc_frozen",
              message: "CANDADO 2: esta HC está cerrada y no puede modificarse",
              key: row.key,
            }), { status: 423, headers });
          }
        }

        // Validación If-Match
        if (ifMatch && rows.length === 1 && rows[0]?.key) {
          const currentRow = await env.DB.prepare("SELECT updated_at FROM siso_store WHERE key = ?").bind(rows[0].key).first();
          const currentTs = currentRow?.updated_at || "";
          if (currentTs && currentTs !== ifMatch) {
            return new Response(JSON.stringify({
              ok: false,
              error: "etag_mismatch",
              currentTs,
              expectedTs: ifMatch,
            }), { status: 409, headers: { ...headers, "X-Siso-Current-Ts": currentTs } });
          }
        }

        const stmt = env.DB.prepare(
          "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
        );

        // OPT-2026-08-16: batch pre-read para claves protegidas
        const CHUNK = 50;
        for (let i = 0; i < rows.length; i += CHUNK) {
          const chunk = rows.slice(i, i + CHUNK);
          // Pre-leer todas las claves protegidas del chunk en una query
          const mergedChunk = await _mergeProtegidoBatch(env, chunk);
          const comp = mergedChunk.map(r => ({ key: r.key, cv: JSON.stringify(r.value) }));
          const batch = comp.map(({ key, cv }) => stmt.bind(key, cv));
          await env.DB.batch(batch);
        }
        return new Response(JSON.stringify({ ok: true, count: rows.length }), { headers });
      }

      // ── POST /store/append ─────────────────────────────────────────────
      if (request.method === "POST" && path === "/store/append") {
        const body = await request.json();
        const { key, item, idField = "id" } = body;
        if (!key || !item) {
          return new Response(JSON.stringify({ error: "key e item requeridos" }), { status: 400, headers });
        }
        let arr = [];
        try {
          const row = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key).first();
          if (row?.value) {
            const parsed = JSON.parse(await decompressValue(row.value));
            if (Array.isArray(parsed)) arr = parsed;
          }
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

      // ── POST /store/chunked ────────────────────────────────────────────
      if (request.method === "POST" && path === "/store/chunked") {
        const body = await request.json();
        const { key, value } = body || {};
        if (!key || value === undefined) {
          return new Response(JSON.stringify({ ok: false, error: "key y value requeridos" }), { status: 400, headers });
        }
        const toStore = await _mergeProtegido(env, key, value);
        const payload = JSON.stringify(toStore);
        let h1 = 0, h2 = 0;
        for (let i = 0; i < payload.length; i++) {
          const c = payload.charCodeAt(i);
          h1 = ((h1 << 5) - h1 + c) | 0;
          h2 = ((h2 << 7) - h2 + c * 31) | 0;
        }
        const hash = (h1 >>> 0).toString(16) + "_" + (h2 >>> 0).toString(16);
        const PIECE = 500 * 1024;
        const pieces = [];
        for (let off = 0; off < payload.length; off += PIECE) pieces.push(payload.slice(off, off + PIECE));
        let oldCount = 0;
        try {
          const om = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key + "__meta").first();
          if (om?.value) { const m = JSON.parse(await decompressValue(om.value)); if (m?.chunked && Number.isFinite(m.count)) oldCount = m.count; }
        } catch {}
        const up = env.DB.prepare(
          "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
        );
        const del = env.DB.prepare("DELETE FROM siso_store WHERE key = ?");
        const meta = { chunked: true, count: pieces.length, totalBytes: payload.length, hash, ts: Date.now() };
        const batch = [
          ...pieces.map((p, i) => up.bind(key + "__c" + i, JSON.stringify(p))),
          up.bind(key + "__meta", JSON.stringify(meta)),
          del.bind(key),
        ];
        for (let i = pieces.length; i < oldCount; i++) batch.push(del.bind(key + "__c" + i));
        await env.DB.batch(batch);
        return new Response(JSON.stringify({ ok: true, chunks: pieces.length, hash }), { headers });
      }

      // ── POST /cleanup ─────────────────────────────────────────────────
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

      // ── GET /storage-stats ────────────────────────────────────────────
      if (request.method === "GET" && path === "/storage-stats") {
        const count = await env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store").first();
        const filas = count?.c ?? 0;
        const sizeRow = await env.DB.prepare("SELECT SUM(LENGTH(value)) AS total_bytes FROM siso_store").first();
        const mbUsados = sizeRow?.total_bytes ? Math.round((sizeRow.total_bytes / (1024 * 1024)) * 100) / 100 : 0;
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

      // ── POST /store/merge ─────────────────────────────────────────────
      if (request.method === "POST" && path === "/store/merge") {
        const body = await request.json();
        const { key, items = [], idField = "id" } = body;
        if (!key || !Array.isArray(items)) {
          return new Response(JSON.stringify({ error: "key e items[] requeridos" }), { status: 400, headers });
        }
        let arr = [];
        try {
          const row = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key).first();
          if (row?.value) {
            const parsed = JSON.parse(row.value);
            if (Array.isArray(parsed)) arr = parsed;
          }
        } catch {}
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
        return new Response(JSON.stringify({ ok: true, count: merged.length, added: merged.length - arr.length }), { headers });
      }

      // ── GET /health ───────────────────────────────────────────────────
      if (request.method === "GET" && path === "/health") {
        const t0 = Date.now();
        if (url.searchParams.get("full") !== "1") {
          try {
            await env.DB.prepare("SELECT 1").first();
            return new Response(JSON.stringify({ ok: true, latencyMs: Date.now() - t0, ts: new Date().toISOString() }), { headers });
          } catch (e) {
            return new Response(JSON.stringify({ ok: false, error: e.message, latencyMs: Date.now() - t0 }), { status: 500, headers });
          }
        }
        const counts = {};
        try {
          const r1 = await env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store").first();
          counts.total = r1?.c ?? 0;
          const r2 = await env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store WHERE key LIKE 'siso_db_patients_%' OR key LIKE 'siso_patients_%'").first();
          counts.patients_keys = r2?.c ?? 0;
          const r3 = await env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store WHERE key LIKE 'siso_portal_doc_%'").first();
          counts.portal_docs = r3?.c ?? 0;
          const r4 = await env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store WHERE key LIKE 'siso_hc_completa_%'").first();
          counts.hc_completas = r4?.c ?? 0;
          const r5 = await env.DB.prepare("SELECT COUNT(*) AS c FROM siso_store WHERE key LIKE 'siso_portal_empresa_%'").first();
          counts.portal_empresa_keys = r5?.c ?? 0;
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: e.message, latencyMs: Date.now() - t0 }), { status: 500, headers });
        }
        return new Response(JSON.stringify({
          ok: true, counts, latencyMs: Date.now() - t0, ts: new Date().toISOString(),
        }), { headers });
      }

      // ── DELETE /store/:key ────────────────────────────────────────────
      if (request.method === "DELETE" && path.startsWith("/store/")) {
        const key = decodeURIComponent(path.slice(7));
        const UNDELETABLE_PREFIXES = [
          'siso_users', 'siso_portal_empresa_', 'siso_portal_empresa_docs_',
          'siso_portal_empresa_atenciones_', 'siso_ai_keys_', 'siso_snapshot_'
        ];
        if (UNDELETABLE_PREFIXES.some(p => key.startsWith(p))) {
          return new Response(JSON.stringify({
            ok: false, error: "undeletable_key",
            message: `CANDADO 4: la clave ${key} es crítica y no puede ser eliminada directamente.`,
          }), { status: 403, headers });
        }
        try {
          const row = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key).first();
          if (row?.value) {
            const backupKey = `siso_deleted_${Date.now()}_${key}`;
            await env.DB.prepare(
              "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now'))"
            ).bind(backupKey, row.value).run();
          }
        } catch {}
        await env.DB.prepare("DELETE FROM siso_store WHERE key = ?").bind(key).run();
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      // ── POST /snapshot ────────────────────────────────────────────────
      if (request.method === "POST" && path === "/snapshot") {
        const result = await runDailySnapshot(env);
        return new Response(JSON.stringify(result), { headers });
      }

      // ── GET /snapshot/list ────────────────────────────────────────────
      if (request.method === "GET" && path === "/snapshot/list") {
        const rows = await env.DB.prepare(
          "SELECT key, updated_at FROM siso_store WHERE key LIKE 'siso_snapshot_%__manifest' ORDER BY key DESC"
        ).all();
        return new Response(JSON.stringify(rows.results || []), { headers });
      }

      return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDailySnapshot(env).catch(err => {
      console.error("[CRON snapshot] error:", err?.message);
    }));
  },
};

// ─────────────────────────────────────────────────────────────────────────
// runDailySnapshot — reconstruye estado completo y lo guarda como snapshot
// ─────────────────────────────────────────────────────────────────────────
async function runDailySnapshot(env) {
  const today = new Date().toISOString().slice(0, 10);
  const snapPrefix = `siso_snapshot_${today}`;
  const t0 = Date.now();
  const log = [];

  try {
    const cutoffMs = Date.now() - 60 * 60 * 1000;
    const gcRows = await env.DB.prepare(
      "SELECT key FROM siso_store WHERE key LIKE '%\\_\\_new%\\_\\_c%' OR key LIKE '%\\_\\_new%\\_\\_meta' ESCAPE '\\'"
    ).all();
    let tempsBorrados = 0;
    for (const r of (gcRows.results || [])) {
      const m = r.key.match(/__new(\d+)__/);
      if (m && parseInt(m[1], 10) < cutoffMs) {
        await env.DB.prepare("DELETE FROM siso_store WHERE key = ?").bind(r.key).run();
        tempsBorrados++;
      }
    }
    log.push(`[GC-TEMP] borrados ${tempsBorrados} chunks temporales abandonados`);
  } catch (e) {
    log.push(`[GC-TEMP] error: ${e?.message}`);
  }

  const allRows = await env.DB.prepare(
    "SELECT key, value FROM siso_store WHERE key NOT LIKE 'siso_snapshot_%' AND key NOT LIKE 'siso_legacy_%'"
  ).all();
  const rows = allRows.results || [];
  log.push(`leídas ${rows.length} claves operacionales`);

  const metas = {};
  const chunkBags = {};
  const direct = {};
  const chunkRe = /__c(\d+)$/;
  for (const row of rows) {
    const rawVal = await decompressValue(row.value);
    if (row.key.endsWith("__meta")) {
      try { metas[row.key.slice(0, -6)] = JSON.parse(rawVal); } catch {}
      continue;
    }
    const m = chunkRe.exec(row.key);
    if (m) {
      const base = row.key.slice(0, -m[0].length);
      (chunkBags[base] ||= {})[Number(m[1])] = JSON.parse(rawVal);
      continue;
    }
    try { direct[row.key] = JSON.parse(rawVal); } catch { direct[row.key] = rawVal; }
  }

  const reconstructed = { ...direct };
  let reconstructedCount = 0;
  for (const [base, meta] of Object.entries(metas)) {
    if (!meta?.chunked || !Number.isFinite(meta.count)) continue;
    const bag = chunkBags[base] || {};
    const parts = [];
    let ok = true;
    for (let i = 0; i < meta.count; i++) {
      if (typeof bag[i] !== "string") { ok = false; break; }
      parts.push(bag[i]);
    }
    if (!ok) continue;
    try { reconstructed[base] = JSON.parse(parts.join("")); reconstructedCount++; } catch {}
  }
  log.push(`reconstruidas ${reconstructedCount} claves chunked`);

  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const delRes = await env.DB.prepare(
    "DELETE FROM siso_store WHERE key LIKE 'siso_snapshot_%' AND substr(key, 15, 10) < ?"
  ).bind(cutoff).run();
  log.push(`rotación previa: borradas ${delRes.meta?.changes ?? 0} claves anteriores a ${cutoff}`);

  const serialized = JSON.stringify({
    snapshotVersion: "v1",
    createdAt: new Date().toISOString(),
    totalKeys: Object.keys(reconstructed).length,
    data: reconstructed,
  });
  const totalBytes = serialized.length;
  const CHUNK = 500 * 1024;
  const pieceCount = Math.ceil(totalBytes / CHUNK);
  log.push(`serializado ${(totalBytes/1024).toFixed(0)} KB → ${pieceCount} piezas`);

  const insertStmt = env.DB.prepare(
    "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  );
  const writeBatch = [];
  for (let i = 0; i < pieceCount; i++) {
    const piece = serialized.slice(i * CHUNK, (i + 1) * CHUNK);
    writeBatch.push(insertStmt.bind(`${snapPrefix}__c${i}`, JSON.stringify(piece)));
  }
  const meta = { chunked: true, count: pieceCount, totalBytes, ts: Date.now() };
  const manifest = {
    snapshotVersion: "v1",
    createdAt: new Date().toISOString(),
    totalKeys: Object.keys(reconstructed).length,
    totalBytes,
    pieceCount,
    reconstructedCount,
    durationMs: Date.now() - t0,
    log,
  };
  writeBatch.push(insertStmt.bind(`${snapPrefix}__meta`, JSON.stringify(meta)));
  writeBatch.push(insertStmt.bind(`${snapPrefix}__manifest`, JSON.stringify(manifest)));
  for (let i = 0; i < writeBatch.length; i += 50) {
    await env.DB.batch(writeBatch.slice(i, i + 50));
  }
  log.push(`escritas ${writeBatch.length} claves del snapshot`);
  return { ok: true, snapshotKey: snapPrefix, manifest, log };
}
