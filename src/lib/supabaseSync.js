// src/lib/supabaseSync.js
// Utilidad standalone para sincronizar arrays completos con Supabase siso_store
// Patrón: localStorage primero (inmediato) → Supabase (async, sin bloquear UI)

const SB_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://yqrrktrgoijgzccrxnpz.supabase.co';
const SB_KEY =
  import.meta.env.VITE_SUPABASE_KEY ||
  'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7';

const SB_HEADERS = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=minimal',
};

/**
 * Guarda un array completo en Supabase siso_store.
 * Guarda en localStorage SIEMPRE (sync), Supabase SIEMPRE (async).
 *
 * @param {string} supabaseKey  — clave en siso_store (ej: 'siso_encuestas')
 * @param {Array}  data         — array completo a guardar
 * @returns {Promise<{ok: boolean, source: string}>}
 */
export async function syncArrayToSupabase(supabaseKey, data) {
  // 1. localStorage inmediato — nunca falla
  try {
    localStorage.setItem(supabaseKey, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage write failed:', e.message);
  }

  // 2. Supabase — upsert completo del array
  try {
    const res = await fetch(`${SB_URL}/rest/v1/siso_store`, {
      method: 'POST',
      headers: SB_HEADERS,
      body: JSON.stringify({
        key: supabaseKey,
        value: data,
        updated_at: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      return { ok: true, source: 'supabase' };
    }

    // Si falla por conflicto de clave, intentar PATCH
    const patchRes = await fetch(
      `${SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(supabaseKey)}`,
      {
        method: 'PATCH',
        headers: SB_HEADERS,
        body: JSON.stringify({
          value: data,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    return { ok: patchRes.ok, source: 'supabase-patch' };
  } catch (err) {
    console.warn(`[supabaseSync] ${supabaseKey} — guardado solo local:`, err.message);
    return { ok: false, source: 'local-only' };
  }
}

/**
 * Lee un array desde Supabase siso_store.
 * Fallback a localStorage si Supabase falla.
 *
 * @param {string} supabaseKey  — clave en siso_store
 * @param {string} localKey     — clave localStorage de respaldo (puede ser igual)
 * @returns {Promise<Array>}
 */
export async function readArrayFromSupabase(supabaseKey, localKey) {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(supabaseKey)}&select=value`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    if (res.ok) {
      const rows = await res.json();
      if (rows?.[0]?.value && Array.isArray(rows[0].value)) {
        // Sincroniza localStorage con lo de Supabase
        try { localStorage.setItem(localKey || supabaseKey, JSON.stringify(rows[0].value)); } catch {}
        return rows[0].value;
      }
    }
  } catch (err) {
    console.warn(`[supabaseSync] read ${supabaseKey} failed:`, err.message);
  }

  // Fallback localStorage
  try {
    const stored = JSON.parse(localStorage.getItem(localKey || supabaseKey) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}
