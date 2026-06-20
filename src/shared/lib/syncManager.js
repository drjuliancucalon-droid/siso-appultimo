// ═══════════════════════════════════════════════════════════════
// SISO OcupaSalud — syncManager.js v1.0
// Ported from monolith. Híbrido Online ↔ Offline sync.
// D1 autoritativo, IndexedDB espejo local, Supabase backup.
// ═══════════════════════════════════════════════════════════════

import {
  idbGet, idbSet, idbDelete, idbGetAll,
  enqueueSync, drainSyncQueue,
  enqueueAuditLog, drainAuditQueue,
  countSyncQueue, setSyncMeta, getSyncMeta,
  clearOfflineDB,
} from './offlineDB.js';

// ── D1 Worker config ──────────────────────────────────
const _d1Config = () => {
  if (typeof window === 'undefined') return { url: '', token: '' };
  return {
    url: window.__SISO_CONFIG?.workerUrl || '',
    token: window.__SISO_CONFIG?.workerToken || '',
  };
};

const _d1GetAll = async () => {
  const { url: W, token: TOK } = _d1Config();
  if (!W || !TOK) return null;
  try {
    const r = await fetch(`${W}/store/prefix/siso_`, {
      headers: { 'X-Siso-Token': TOK },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    const out = {};
    for (const row of (rows || [])) {
      const rawVal = row.value;
      out[row.key] = {
        value: rawVal,
        updatedAt:
          (rawVal && typeof rawVal === 'object' && rawVal.updatedAt) ||
          row.ts || row.updatedAt || new Date().toISOString(),
      };
    }
    return out;
  } catch { return null; }
};

const _d1Get = async (key) => {
  const { url: W, token: TOK } = _d1Config();
  if (!W || !TOK) return null;
  try {
    const r = await fetch(`${W}/store/${encodeURIComponent(key)}`, {
      headers: { 'X-Siso-Token': TOK },
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d[0]?.value ?? null;
  } catch { return null; }
};

// ── Supabase helpers — adaptados para el destino ──────────
const _sbUrl = () => (typeof window !== 'undefined' && window.__SISO_CONFIG?.sbUrl) || '';
const _sbKey = () => (typeof window !== 'undefined' && window.__SISO_CONFIG?.sbKey) || '';

const _fetchFromSupabase = async (key) => {
  const URL = _sbUrl();
  const KEY = _sbKey();
  if (!URL || !KEY) return null;
  try {
    const r = await fetch(
      `${URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(key)}&select=value,updated_at`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
    );
    if (!r.ok) return null;
    const rows = await r.json();
    if (rows?.[0]?.value !== undefined) {
      await setSyncMeta(key, rows[0].updated_at);
      return rows[0].value;
    }
    return null;
  } catch { return null; }
};

const _sbSet = async (key, value) => {
  const URL = _sbUrl();
  const KEY = _sbKey();
  if (!URL || !KEY) return false;
  try {
    const r = await fetch(`${URL}/rest/v1/siso_store`, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
    });
    return r.ok;
  } catch { return false; }
};

const _sbDelete = async (key) => {
  const URL = _sbUrl();
  const KEY = _sbKey();
  if (!URL || !KEY) return false;
  try {
    const r = await fetch(`${URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    return r.ok;
  } catch { return false; }
};

const _sbGetAll = async () => {
  const URL = _sbUrl();
  const KEY = _sbKey();
  if (!URL || !KEY) return null;
  try {
    const r = await fetch(`${URL}/rest/v1/siso_store?select=key,value,updated_at`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    const out = {};
    for (const row of (rows || [])) {
      out[row.key] = { value: row.value, updatedAt: row.updated_at || new Date().toISOString() };
    }
    return out;
  } catch { return null; }
};

// ── Estado interno ──────────────────────────────────────
const _state = {
  isSyncing: false,
  lastSyncAt: null,
  pendingCount: 0,
  listeners: new Set(),
  syncInterval: null,
};

const _notify = (status, detail = {}) => {
  const payload = { status, pendingCount: _state.pendingCount, lastSyncAt: _state.lastSyncAt, ...detail };
  _state.listeners.forEach(fn => { try { fn(payload); } catch {} });
};

export const onSyncStatus = (fn) => {
  _state.listeners.add(fn);
  return () => _state.listeners.delete(fn);
};

// ── LECTURA HÍBRIDA ──────────────────────────────────────
export const hybridGet = async (key, fallback = null) => {
  try {
    const idbVal = await idbGet(key);
    if (idbVal !== null) {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        _refreshFromD1(key).catch(() => {});
      }
      return idbVal;
    }
  } catch {}

  try {
    const lsVal = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (lsVal) {
      const parsed = JSON.parse(lsVal);
      idbSet(key, parsed).catch(() => {});
      return parsed;
    }
  } catch {}

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const d1Val = await _d1Get(key);
      if (d1Val !== null) {
        await idbSet(key, d1Val);
        return d1Val;
      }
      const sbData = await _fetchFromSupabase(key);
      if (sbData !== null) {
        await idbSet(key, sbData);
        return sbData;
      }
    } catch {}
  }

  return fallback;
};

export const hybridSet = async (key, value) => {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(value)); } catch {}
  await idbSet(key, value);

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    const ok = await _sbSet(key, value).catch(() => false);
    if (ok) {
      await setSyncMeta(key, new Date().toISOString());
      _state.lastSyncAt = new Date().toISOString();
      _notify('synced', { key });
      return { ok: true, source: 'supabase' };
    }
  }

  await enqueueSync('upsert', key, value);
  _state.pendingCount = await countSyncQueue();
  _notify('queued', { key, pending: _state.pendingCount });
  return { ok: true, source: 'offline-queued' };
};

export const hybridDelete = async (key) => {
  try { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); } catch {}
  await idbDelete(key);

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    const ok = await _sbDelete(key).catch(() => false);
    if (ok) return { ok: true, source: 'supabase' };
  }

  await enqueueSync('delete', key);
  _state.pendingCount = await countSyncQueue();
  _notify('queued', { key, pending: _state.pendingCount });
  return { ok: true, source: 'offline-queued' };
};

// ── SINCRONIZACIÓN COMPLETA ──────────────────────────────
export const syncNow = async () => {
  if (_state.isSyncing || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
  _state.isSyncing = true;
  _notify('syncing');

  let errors = 0;

  try {
    const queue = await drainSyncQueue();
    for (const op of queue) {
      try {
        if (op.operation === 'upsert') {
          await _sbSet(op.key, op.value);
          await setSyncMeta(op.key, new Date().toISOString());
        } else if (op.operation === 'delete') {
          await _sbDelete(op.key);
        }
      } catch {
        await enqueueSync(op.operation, op.key, op.value);
        errors++;
      }
    }

    let cloudData = await _d1GetAll().catch(() => null);
    let fuente = 'D1';
    if (!cloudData) {
      cloudData = await _sbGetAll().catch(() => null);
      fuente = 'Supabase (fallback)';
    }
    if (cloudData) {
      const localData = await idbGetAll();
      let updated = 0;
      for (const [key, cloudEntry] of Object.entries(cloudData)) {
        const localEntry = localData[key];
        const cloudTs = new Date(cloudEntry.updatedAt || 0).getTime();
        const locTs = new Date(localEntry?.updatedAt || 0).getTime();
        if (!localEntry || cloudTs > locTs) {
          await idbSet(key, cloudEntry.value, cloudEntry.updatedAt);
          try { if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(cloudEntry.value)); } catch {}
          updated++;
        }
      }
      if (updated > 0) _notify('updated', { count: updated });
    }

    await _flushAuditQueue();
    _state.pendingCount = await countSyncQueue();
    _state.lastSyncAt = new Date().toISOString();
    _notify(errors > 0 ? 'partial' : 'synced');
  } catch {
    _notify('error');
  } finally {
    _state.isSyncing = false;
  }
};

// ── AUDIT LOG ────────────────────────────────────────────
export const hybridAuditLog = async (action, user, detail = '', extra = {}) => {
  const entry = {
    ts: new Date().toISOString(),
    action: String(action),
    user: String(user || 'anonymous'),
    detail: String(detail),
    ua: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 120) : '',
    modulo: extra.modulo || '',
    registro_id: extra.registroId || '',
    online: typeof navigator !== 'undefined' ? navigator.onLine : false,
  };

  try {
    const logs = JSON.parse(typeof localStorage !== 'undefined' ? localStorage.getItem('siso_audit_log') || '[]' : '[]');
    logs.push(entry);
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    if (typeof localStorage !== 'undefined') localStorage.setItem('siso_audit_log', JSON.stringify(logs));
  } catch {}

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    const ok = await _pushAuditToSupabase(entry).catch(() => false);
    if (ok) return;
  }

  await enqueueAuditLog(entry);
};

const _refreshFromD1 = async (key) => {
  const d1Val = await _d1Get(key);
  if (d1Val === null) return;
  await idbSet(key, d1Val);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(d1Val)); } catch {}
};

const _pushAuditToSupabase = async (entry) => {
  try {
    const existing = await _fetchFromSupabase('siso_audit_log_server') || [];
    const updated = Array.isArray(existing) ? [...existing, entry] : [entry];
    const trimmed = updated.slice(-1000);
    return await _sbSet('siso_audit_log_server', trimmed);
  } catch { return false; }
};

const _flushAuditQueue = async () => {
  const pending = await drainAuditQueue();
  for (const entry of pending) {
    await _pushAuditToSupabase(entry).catch(() => {});
  }
};

// ── INIT ─────────────────────────────────────────────────
export const initSyncManager = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    _notify('reconnected');
    setTimeout(syncNow, 1000);
  });

  window.addEventListener('offline', () => {
    _notify('offline');
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SISO_SYNC_NOW') {
        syncNow().catch(() => {});
      }
    });
  }

  _state.syncInterval = setInterval(() => {
    if (document.hidden) return;
    if (navigator.onLine && !_state.isSyncing) {
      syncNow().catch(() => {});
    }
  }, 5 * 60 * 1000);

  if (navigator.onLine) {
    setTimeout(() => syncNow().catch(() => {}), 3000);
  }

  countSyncQueue().then(count => {
    _state.pendingCount = count;
    if (count > 0) _notify('pending', { pending: count });
  });
};

export const stopSyncManager = async () => {
  if (_state.syncInterval) {
    clearInterval(_state.syncInterval);
    _state.syncInterval = null;
  }
  await clearOfflineDB();
  _state.listeners.clear();
};

export const trySync = syncNow;
export { _state as syncState };