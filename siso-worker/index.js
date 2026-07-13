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

function getCorsHeaders(origin) {
  const allow = isAllowedOrigin(origin) ? origin : DEFAULT_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type, X-Siso-Token',
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
      if (request.method === "GET" && path.startsWith("/store/") && !path.startsWith("/store/prefix/")) {
        const key = decodeURIComponent(path.slice(7));
        const row = await env.DB.prepare("SELECT value, updated_at FROM siso_store WHERE key = ?").bind(key).first();
        if (!row) return new Response(JSON.stringify([]), { headers });
        const value = JSON.parse(row.value);
        const ts = row.updated_at;
        // Exponer también el etag en header para uso fácil del cliente
        const respHeaders = { ...headers, "ETag": ts ? `"${ts}"` : '""', "X-Siso-Ts": ts || "" };
        return new Response(JSON.stringify([{ key, value, ts }]), { headers: respHeaders });
      }

      // ── GET /store/prefix/:prefix — buscar por prefijo ───────────────
      // COMMIT 4f8b81f — modo ?raw=1 salta JSON.parse por fila (reduce
      // latencia y CPU cuando el cliente solo necesita las claves).
      if (request.method === "GET" && path.startsWith("/store/prefix/")) {
        const prefix = decodeURIComponent(path.slice(14));
        const raw = url.searchParams.get("raw") === "1";
        const rows = await env.DB.prepare(
          "SELECT key, value FROM siso_store WHERE key LIKE ? LIMIT 2000"
        ).bind(prefix + "%").all();
        const result = raw
          ? (rows.results || []).map(r => ({ key: r.key, value: r.value }))
          : (rows.results || []).map(r => {
              try {
                return { key: r.key, value: JSON.parse(r.value) };
              } catch {
                return { key: r.key, value: r.value };
              }
            });
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
        const result = (rows.results || []).map(r => ({
          key: r.key,
          value: JSON.parse(r.value),
          updated_at: r.updated_at,
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
        // Batch en chunks de 50
        const CHUNK = 50;
        for (let i = 0; i < rows.length; i += CHUNK) {
          const chunk = rows.slice(i, i + CHUNK);
          const batch = chunk.map(({ key, value }) => stmt.bind(key, JSON.stringify(value)));
          await env.DB.batch(batch);
        }
        return new Response(JSON.stringify({ ok: true, count: rows.length }), { headers });
      }

      // ── POST /store/append — agrega/actualiza UN item dentro de un array
      // almacenado, con la fusión hecha EN EL SERVIDOR (2026-07-09).
      // Evita la carrera read-modify-write de clientes concurrentes: varios
      // trabajadores enviando la encuesta a la vez se pisaban la respuesta.
      if (request.method === "POST" && path === "/store/append") {
        const body = await request.json();
        const { key, item, idField = "id" } = body;
        if (!key || !item) {
          return new Response(JSON.stringify({ error: "key e item requeridos" }), { status: 400, headers });
        }
        // Leer array actual
        let arr = [];
        try {
          const row = await env.DB.prepare("SELECT value FROM siso_store WHERE key = ?").bind(key).first();
          if (row?.value) {
            const parsed = JSON.parse(await decompressValue(row.value));
            if (Array.isArray(parsed)) arr = parsed;
          }
        } catch {}
        const idVal = item[idField];
        const idx = idVal != null ? arr.findIndex(x => x && String(x[idField]) === String(idVal)) : -1;
        if (idx >= 0) arr[idx] = item; else arr.push(item);
        const cv = await compressValue(JSON.stringify(arr));
        await env.DB.prepare(
          "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
        ).bind(key, cv).run();
        return new Response(JSON.stringify({ ok: true, count: arr.length }), { headers });
      }

      // ── POST /store/chunked — escritura atómica multi-chunk ────────────
      // COMMIT e7ed13a — candado anti-encogimiento server-side.
      // Body: { baseKey: string, pieces: string[], meta: object }
      // El worker:
      //   1. Borra todos los chunks viejos (baseKey__c0..cN, baseKey__meta)
      //   2. Inserta chunks nuevos + meta en UNA transacción D1
      //   3. Verifica que el valor reconstruido NO sea menor que el anterior
      //      (anti-encogimiento). Si hay encogimiento → rechaza.
      // Propósito: eliminar condiciones de carrera entre pestañas/monolito
      // al escribir datos grandes (>500KB) que requieren chunking.
      if (request.method === "POST" && path === "/store/chunked") {
        const body = await request.json();
        const { baseKey, pieces = [], meta = {} } = body;
        if (!baseKey || !Array.isArray(pieces) || pieces.length === 0) {
          return new Response(JSON.stringify({ error: "baseKey y pieces[] requeridos" }), { status: 400, headers });
        }

        // CANDADO anti-encogimiento: leer tamaño anterior para comparar
        let previousSize = 0;
        try {
          const prevMetaRow = await env.DB.prepare(
            "SELECT value FROM siso_store WHERE key = ?"
          ).bind(baseKey + "__meta").first();
          if (prevMetaRow?.value) {
            const prevMeta = JSON.parse(prevMetaRow.value);
            previousSize = prevMeta?.totalBytes ?? prevMeta?.size ?? 0;
          }
        } catch {}

        // Calcular tamaño total de los nuevos chunks
        const totalBytes = pieces.reduce((sum, p) => sum + (typeof p === "string" ? p.length : JSON.stringify(p).length), 0);

        // Validación anti-encogimiento: si hay tamaño anterior y el nuevo es menor → rechazar
        if (previousSize > 0 && totalBytes < previousSize) {
          return new Response(JSON.stringify({
            ok: false,
            error: "shrink_detected",
            message: "CANDADO anti-encogimiento: valor nuevo menor que el anterior",
            previousBytes: previousSize,
            newBytes: totalBytes,
          }), { status: 409, headers });
        }

        // Borrar chunks viejos de esta baseKey
        await env.DB.prepare(
          "DELETE FROM siso_store WHERE key LIKE ?"
        ).bind(baseKey + "__c%").run();
        await env.DB.prepare(
          "DELETE FROM siso_store WHERE key = ?"
        ).bind(baseKey + "__meta").run();

        // Insertar chunks nuevos + meta en batch atómico
        const insertStmt = env.DB.prepare(
          "INSERT INTO siso_store(key, value, updated_at) VALUES(?, ?, datetime('now'))"
        );
        const batch = pieces.map((piece, i) =>
          insertStmt.bind(`${baseKey}__c${i}`, JSON.stringify(typeof piece === "string" ? piece : JSON.stringify(piece)))
        );
        batch.push(insertStmt.bind(`${baseKey}__meta`, JSON.stringify({
          ...meta,
          chunked: true,
          count: pieces.length,
          totalBytes,
          ts: Date.now(),
        })));

        // Ejecutar en batches de 50 (límite D1)
        for (let i = 0; i < batch.length; i += 50) {
          await env.DB.batch(batch.slice(i, i + 50));
        }

        return new Response(JSON.stringify({
          ok: true,
          count: pieces.length,
          totalBytes,
          previousBytes: previousSize,
        }), { headers });
      }

      // ── GET /health — endpoint de healthcheck para FASE 4 monitoring ──
      if (request.method === "GET" && path === "/health") {
        const t0 = Date.now();
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
      if (request.method === "DELETE" && path.startsWith("/store/")) {
        const key = decodeURIComponent(path.slice(7));
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

  // 1) Leer todas las claves (excluir snapshots y legacy — no respaldar respaldos)
  const allRows = await env.DB.prepare(
    "SELECT key, value FROM siso_store WHERE key NOT LIKE 'siso_snapshot_%' AND key NOT LIKE 'siso_legacy_%'"
  ).all();
  const rows = allRows.results || [];
  log.push(`leídas ${rows.length} claves operacionales`);

  // 2) Indexar y reconstruir chunks
  const metas = {};         // baseKey → meta value
  const chunkBags = {};     // baseKey → { idx → string }
  const direct = {};
  const chunkRe = /__c(\d+)$/;
  for (const row of rows) {
    if (row.key.endsWith("__meta")) {
      try { metas[row.key.slice(0, -6)] = JSON.parse(row.value); } catch {}
      continue;
    }
    const m = chunkRe.exec(row.key);
    if (m) {
      const base = row.key.slice(0, -m[0].length);
      (chunkBags[base] ||= {})[Number(m[1])] = JSON.parse(row.value);
      continue;
    }
    try { direct[row.key] = JSON.parse(row.value); } catch { direct[row.key] = row.value; }
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

  // 3) Serializar y trocear el snapshot
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

  // 4) Escribir piezas + meta + manifest
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

  // 5) Rotación: borrar snapshots cuya fecha (extraída de la clave) sea > 7 días atrás
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  // siso_snapshot_YYYY-MM-DD__... → substr(15, 10) = "YYYY-MM-DD"
  const delRes = await env.DB.prepare(
    "DELETE FROM siso_store WHERE key LIKE 'siso_snapshot_%' AND substr(key, 15, 10) < ?"
  ).bind(cutoff).run();
  log.push(`rotación: borradas ${delRes.meta?.changes ?? 0} claves anteriores a ${cutoff}`);

  return { ok: true, snapshotKey: snapPrefix, manifest, log };
}
