// SISO API Worker — Cloudflare D1 backend
// Reemplaza Supabase siso_store como almacenamiento en nube

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

// COMMIT 3531448: Fusiona por id: lo entrante gana por-id, lo existente que el
// entrante no conoce se preserva. Usado por POST /store y POST /store/chunked.
// COMMIT 50f852b: extendido para detectar objetos con .periodos y delegar a
// _mergePeriodosObjeto (portal_empresa_docs).
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
      if (request.method === "GET" && path.startsWith("/store/") && !path.startsWith("/store/prefix/")) {
        const key = decodeURIComponent(path.slice(7));
        const rawMode = url.searchParams.get("raw") === "1";
        const row = await env.DB.prepare("SELECT value, updated_at FROM siso_store WHERE key = ?").bind(key).first();
        if (!row) return new Response(JSON.stringify([]), { headers });
        const ts = row.updated_at;
        const respHeaders = { ...headers, "ETag": ts ? `"${ts}"` : '""', "X-Siso-Ts": ts || "" };
        if (rawMode) {
          // Modo raw: retorna value como string crudo sin JSON.parse
          return new Response(JSON.stringify([{ key, value: row.value, ts }]), { headers: respHeaders });
        }
        // FIX 2026-07-21: decompressValue por si el valor legacy viene con prefijo gz:
        const dv = await decompressValue(row.value);
        const value = JSON.parse(dv);
        return new Response(JSON.stringify([{ key, value, ts }]), { headers: respHeaders });
      }

      // ── GET /store/prefix/:prefix — buscar por prefijo ───────────────
      // COMMIT 4f8b81f — modo ?raw=1 salta JSON.parse por fila (reduce
      // latencia y CPU cuando el cliente solo necesita las claves).
      // FIX 2026-07-21: excluir piezas de chunk para no contaminar la
      // respuesta con __cN y _chunk_N_of_N (monolito ya lo hace).
      if (request.method === "GET" && path.startsWith("/store/prefix/")) {
        const prefix = decodeURIComponent(path.slice(14));
        const raw = url.searchParams.get("raw") === "1";
        const rows = await env.DB.prepare(
          "SELECT key, value FROM siso_store WHERE key LIKE ? AND key NOT GLOB '*__c[0-9]*' AND key NOT LIKE '%__new%' AND key NOT GLOB '*_chunk_[0-9]*_of_[0-9]*' LIMIT 2000"
        ).bind(prefix + "%").all();
        // FIX 2026-07-21: decompressValue por si el valor legacy viene con prefijo gz:
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

      // ── GET /store — listar todas las claves ─────────────────────────
      if (request.method === "GET" && path === "/store") {
        const userId = url.searchParams.get("userId") || "";
        let rows;
        if (userId) {
          rows = await env.DB.prepare(
            "SELECT key, value, updated_at FROM siso_store WHERE key LIKE ? OR key LIKE ? LIMIT 2000"
          ).bind(`%_${userId}`, `%_${userId}_%`).all();
        } else {
          rows = await env.DB.prepare(
            "SELECT key, value, updated_at FROM siso_store LIMIT 2000"
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
      // Soporta header If-Match: <ts> para escritura optimista (FASE 3):
      //   • Si el ts del row actual != If-Match → 409 con el nuevo ts
      //   • Si coincide o no envió header → ejecuta normal
      // COMMIT a98eff1 — CANDADO 2: rechaza escrituras a HC cerradas
      if (request.method === "POST" && path === "/store") {
        const body = await request.json();
        const rows = Array.isArray(body) ? body : [body];
        const ifMatch = (request.headers.get("If-Match") || request.headers.get("X-Siso-If-Match") || "").replace(/"/g, "").trim();

        // CANDADO 3 (2026-07-21 — INERTE): validar userId en claves de pacientes.
        // Ningún cliente (monolito ni refactor) envía actualmente los headers
        // X-Siso-App / X-Siso-UserId que este bloque requiere. Permanece aquí para
        // futura activación cuando d1Client.js envíe esos headers en cada request
        // (ver FASE 5.6 del PROMPT_MAESTRO_IGUALACION_2026-07-21). Mientras tanto,
        // la protección real contra escritura cruzada la da _mergeProtegido (CANDADO 1).
        // La app que escribe debe coincidir con el userId del sufijo de la clave

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

        // CANDADO 2: Rechazar escrituras a claves de HC cerradas (inmutables)
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

        // Validación If-Match: solo aplica a escrituras de UNA clave
        if (ifMatch && rows.length === 1 && rows[0]?.key) {
          const currentRow = await env.DB.prepare("SELECT updated_at FROM siso_store WHERE key = ?").bind(rows[0].key).first();
          const currentTs = currentRow?.updated_at || "";
          // Si la clave existe Y su ts no coincide con If-Match → conflicto
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
        // Batch en chunks de 50 — COMMIT 3531448: fusión por id para claves
        // protegidas (incluye siso_encuestas)
        const CHUNK = 50;
        for (let i = 0; i < rows.length; i += CHUNK) {
          const chunk = rows.slice(i, i + CHUNK);
          const comp = await Promise.all(chunk.map(async ({ key, value }) => {
            const merged = await _mergeProtegido(env, key, value);
            return { key, cv: JSON.stringify(merged) };
          }));
          const batch = comp.map(({ key, cv }) => stmt.bind(key, cv));
          await env.DB.batch(batch);
        }
        return new Response(JSON.stringify({ ok: true, count: rows.length }), { headers });
      }

      // ── POST /store/append — agrega/actualiza UN item dentro de un array
      // almacenado, con la fusión hecha EN EL SERVIDOR (2026-07-09).
      // Evita la carrera read-modify-write de clientes concurrentes: varios
      // trabajadores enviando la encuesta a la vez se pisaban la respuesta.
      // COMMIT 3531448 — fusión por ID para siso_encuestas (antes se reemplazaba completo)
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
        // F1-02: para siso_encuestas, usar doble ID (encuestaId + trabajadorId)
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

      // ── POST /store/chunked — escritura chunked ATÓMICA (2026-07-11) ──
      // El troceo cliente (piezas __cN escritas una a una) no es atómico:
      // dos guardados simultáneos (dos pestañas, o monolito + refactor)
      // entrelazaban piezas de generaciones distintas → hash mismatch →
      // "CORRUPCIÓN detectada" y lectura descartada. Aquí el servidor
      // trocea y escribe TODO (piezas + __meta con hash + borrado de la
      // clave base y de piezas sobrantes) en UN env.DB.batch — transaccional
      // en D1: los lectores ven la generación vieja o la nueva, nunca mezcla.
      // Body: { key, value }. Formato 100% compatible con _workerGet del
      // monolito y _chunkGet del refactor.
      if (request.method === "POST" && path === "/store/chunked") {
        const body = await request.json();
        const { key, value } = body || {};
        if (!key || value === undefined) {
          return new Response(JSON.stringify({ ok: false, error: "key y value requeridos" }), { status: 400, headers });
        }
        // ── CANDADO ANTI-ENCOGIMIENTO (2026-07-11, compartido con POST /store) ──
        // Incidente: una pestaña con estado viejo reescribió la lista de
        // pacientes y borró de la nube los 23 exámenes del día (3 veces).
        // Para colecciones protegidas, el SERVIDOR fusiona por id con lo ya
        // almacenado: lo entrante gana por-id (ediciones), pero los
        // registros existentes que lo entrante NO conoce se PRESERVAN.
        // Ninguna sesión — ni con código viejo, ni con estado incompleto —
        // puede volver a encoger estas listas. Ver _mergeProtegido (module
        // scope) — misma función que usa POST /store.
        const toStore = await _mergeProtegido(env, key, value);
        const payload = JSON.stringify(toStore);
        // Hash idéntico al _hash64 del monolito (h1 base31 + h2 base127*31)
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
        // Piezas viejas a borrar más allá del nuevo count (evita __cN huérfanos)
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
          del.bind(key), // los lectores caen al __meta
        ];
        for (let i = pieces.length; i < oldCount; i++) batch.push(del.bind(key + "__c" + i));
        await env.DB.batch(batch); // ← transaccional: todo o nada
        return new Response(JSON.stringify({ ok: true, chunks: pieces.length, hash }), { headers });
      }

      // ── POST /cleanup — limpieza de emergencia ─────────────────────────
      // F1-03: Borra snapshots viejos (>7d), chunks huérfanos, autosaves (>48h).
      // Útil cuando D1 se llena y no se puede esperar al cron diario.
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

      // ── GET /storage-stats — monitoreo de uso D1 ──────────────────────
      // F1-04: Retorna filas, MB usados, % uso y alertas 70/90%.
      // FIX 2026-07-21: usa SUM(LENGTH(value)) real en vez de estimación filas*2048.
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

      // ── POST /store/merge — merge atómico server-side ──────────────────
      // CANDADO 6 (FASE 0.5): fusión atómica de arrays por idField.
      // Reemplaza el read-modify-write del cliente, vulnerable a carreras
      // entre apps. El worker lee, mergea y escribe en una sola operación.
      // Body: { key, items[], idField }
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

      // ── GET /health — endpoint de healthcheck para FASE 4 monitoring ──
      // AUDITORÍA 2026-07-10: los 5 COUNT(*) escanean ~2.300 filas cada uno
      // (~11K filas leídas POR LLAMADA). Ambas apps (monolito y refactor) lo
      // llaman cada 2 min → ~7M filas/día con 2 pestañas, superando el límite
      // gratis de D1 (5M lecturas/día). Por defecto ahora responde con un ping
      // barato (SELECT 1 ≈ 0 filas); los conteos completos solo con ?full=1.
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
          ok: true,
          counts,
          latencyMs: Date.now() - t0,
          ts: new Date().toISOString(),
        }), { headers });
      }

      // ── DELETE /store/:key ───────────────────────────────────────────
      // CANDADO 4 (FASE 0.5): anti-borrado de claves críticas del sistema
      // CANDADO 5 (FASE 0.5): snapshot automático antes de borrar
      if (request.method === "DELETE" && path.startsWith("/store/")) {
        const key = decodeURIComponent(path.slice(7));

        // CANDADO 4: claves críticas NO pueden ser eliminadas directamente
        const UNDELETABLE_PREFIXES = [
          'siso_users', 'siso_portal_empresa_', 'siso_portal_empresa_docs_',
          'siso_portal_empresa_atenciones_', 'siso_ai_keys_', 'siso_snapshot_'
        ];
        if (UNDELETABLE_PREFIXES.some(p => key.startsWith(p))) {
          return new Response(JSON.stringify({
            ok: false, error: "undeletable_key",
            message: `CANDADO 4: la clave ${key} es crítica y no puede ser eliminada directamente. Use /cleanup para mantenimiento programado.`,
          }), { status: 403, headers });
        }

        // CANDADO 5: guardar copia de respaldo antes de borrar
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

      // ── POST /snapshot — disparar snapshot manualmente ───────────────
      if (request.method === "POST" && path === "/snapshot") {
        const result = await runDailySnapshot(env);
        return new Response(JSON.stringify(result), { headers });
      }

      // ── GET /snapshot/list — listar snapshots disponibles ────────────
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

  // ─────────────────────────────────────────────────────────────────────
  // CRON TRIGGER — corre automáticamente según cron expression definido en wrangler.json
  // Genera snapshot diario + rota viejos (>7 días).
  // ─────────────────────────────────────────────────────────────────────
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDailySnapshot(env).catch(err => {
      console.error("[CRON snapshot] error:", err?.message);
    }));
  },
};

// ─────────────────────────────────────────────────────────────────────────
// runDailySnapshot — reconstruye estado completo y lo guarda como snapshot
// Estrategia:
//   1) Lee TODAS las claves operacionales (excluye snapshots/legacy)
//   2) Reconstruye claves chunked en memoria (concatena __cN)
//   3) Serializa el estado completo y lo trocea en piezas de 500KB
//   4) Guarda como siso_snapshot_YYYY-MM-DD__c0..cN + __meta + __manifest
//   5) Rota: borra snapshots con fecha > 7 días atrás
// ─────────────────────────────────────────────────────────────────────────
async function runDailySnapshot(env) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const snapPrefix = `siso_snapshot_${today}`;
  const t0 = Date.now();
  const log = [];

  // FIX 2026-07-21: limpieza de chunks temporales __new<ts>__cN/__meta abandonados
  // (>1h) — mismo GC que el monolito, evita que D1 acumule piezas huérfanas de
  // escrituras interrumpidas.
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

  // 1) Leer claves en lotes paginados (100 filas) para no explotar la memoria
  //    del isolate de D1. Antes se hacía un único SELECT ... .all() que cargaba
  //    ~466 MB de value en memoria de una vez → "isolate exceeded its memory
  //    limit and was reset". Ahora se pagina con LIMIT/OFFSET.
  const PAGE_SIZE = 100;
  const metas = {};         // baseKey → meta value
  const chunkBags = {};     // baseKey → { idx → string }
  const direct = {};
  const chunkRe = /__c(\d+)$/;
  let offset = 0;
  let totalRead = 0;
  while (true) {
    const page = await env.DB.prepare(
      "SELECT key, value FROM siso_store WHERE key NOT LIKE 'siso_snapshot_%' AND key NOT LIKE 'siso_legacy_%' LIMIT ? OFFSET ?"
    ).bind(PAGE_SIZE, offset).all();
    const rows = page.results || [];
    if (rows.length === 0) break;
    totalRead += rows.length;

    // 2) Indexar y reconstruir chunks (por lote)
    for (const row of rows) {
      // FIX 2026-07-21: decompressValue por si el valor legacy viene con prefijo gz:
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

    offset += PAGE_SIZE;
  }
  log.push(`leídas ${totalRead} claves operacionales (paginado en lotes de ${PAGE_SIZE})`);

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

  // 3) Rotar snapshots viejos ANTES de escribir el nuevo (monolito ya lo hace)
  //    Evita que D1 se llene con snapshots acumulados si el cron diario falla.
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const delRes = await env.DB.prepare(
    "DELETE FROM siso_store WHERE key LIKE 'siso_snapshot_%' AND substr(key, 15, 10) < ?"
  ).bind(cutoff).run();
  log.push(`rotación previa: borradas ${delRes.meta?.changes ?? 0} claves anteriores a ${cutoff}`);

  // 4) Serializar y trocear el snapshot
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

  // 5) Escribir piezas + meta + manifest

  const insertStmt = env.DB.prepare(
    "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  );
  // Batch para piezas (max 50 por batch para no exceder D1 binds)
  const writeBatch = [];
  for (let i = 0; i < pieceCount; i++) {
    const piece = serialized.slice(i * CHUNK, (i + 1) * CHUNK);
    writeBatch.push(insertStmt.bind(`${snapPrefix}__c${i}`, JSON.stringify(piece)));
  }
  // Meta y manifest
  const meta = {
    chunked: true,
    count: pieceCount,
    totalBytes,
    ts: Date.now(),
  };
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

  // Ejecutar en batches de 50
  for (let i = 0; i < writeBatch.length; i += 50) {
    await env.DB.batch(writeBatch.slice(i, i + 50));
  }
  log.push(`escritas ${writeBatch.length} claves del snapshot`);
  // (La rotación ya se hizo antes de escribir — ver paso 3)
  return { ok: true, snapshotKey: snapPrefix, manifest, log };
}
