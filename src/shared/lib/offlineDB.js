// ═══════════════════════════════════════════════════════════════
// SISO OcupaSalud — offlineDB.js v1.0
// Ported from monolith. Base de datos IndexedDB local para modo offline.
// ═══════════════════════════════════════════════════════════════

const DB_NAME    = 'siso_offline_db';
const DB_VERSION = 1;

const STORES = {
  kv_store:      { keyPath: 'key' },
  sync_queue:    { keyPath: 'id', autoIncrement: true },
  audit_queue:   { keyPath: 'id', autoIncrement: true },
  sync_meta:     { keyPath: 'key' },
};

let _db = null;

const openDB = () => new Promise((resolve, reject) => {
  if (_db) return resolve(_db);
  if (typeof indexedDB === 'undefined') return reject(new Error('indexedDB not available'));

  const req = indexedDB.open(DB_NAME, DB_VERSION);

  req.onupgradeneeded = (event) => {
    const db = event.target.result;
    Object.entries(STORES).forEach(([name, opts]) => {
      if (!db.objectStoreNames.contains(name)) {
        db.createObjectStore(name, opts);
      }
    });
  };

  req.onsuccess = (event) => {
    _db = event.target.result;
    _db.onversionchange = () => { _db.close(); _db = null; };
    resolve(_db);
  };

  req.onerror = (event) => reject(event.target.error);
});

const withStore = async (storeName, mode, fn) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
};

// ── KV STORE ──────────────────────────────
export const idbSet = async (key, value, updatedAt = null) => {
  try {
    await withStore('kv_store', 'readwrite', store =>
      store.put({ key, value, updatedAt: updatedAt || new Date().toISOString() })
    );
    return true;
  } catch { return false; }
};

export const idbGet = async (key) => {
  try {
    const row = await withStore('kv_store', 'readonly', store => store.get(key));
    return row ? row.value : null;
  } catch { return null; }
};

export const idbDelete = async (key) => {
  try {
    await withStore('kv_store', 'readwrite', store => store.delete(key));
    return true;
  } catch { return false; }
};

export const idbGetAll = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('kv_store', 'readonly');
      const store = tx.objectStore('kv_store');
      const req = store.getAll();
      req.onsuccess = () => {
        const result = {};
        req.result.forEach(row => { result[row.key] = { value: row.value, updatedAt: row.updatedAt }; });
        resolve(result);
      };
      req.onerror = () => resolve({});
    });
  } catch { return {}; }
};

// ── SYNC QUEUE ────────────────────────────
export const enqueueSync = async (operation, key, value = null) => {
  try {
    await withStore('sync_queue', 'readwrite', store =>
      store.add({ operation, key, value, ts: new Date().toISOString(), retries: 0 })
    );
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg?.sync) await reg.sync.register('siso-sync-queue').catch(() => {});
    }
    return true;
  } catch { return false; }
};

export const drainSyncQueue = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const items = [];
      const cursor = store.openCursor();
      cursor.onsuccess = (e) => {
        const c = e.target.result;
        if (c) { items.push({ id: c.key, ...c.value }); c.continue(); }
        else { items.forEach(item => store.delete(item.id)); resolve(items); }
      };
      cursor.onerror = () => resolve([]);
    });
  } catch { return []; }
};

export const countSyncQueue = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const req = db.transaction('sync_queue', 'readonly').objectStore('sync_queue').count();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => resolve(0);
    });
  } catch { return 0; }
};

// ── AUDIT QUEUE ───────────────────────────
export const enqueueAuditLog = async (entry) => {
  try {
    await withStore('audit_queue', 'readwrite', store =>
      store.add({ ...entry, queuedAt: new Date().toISOString() })
    );
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg?.sync) await reg.sync.register('siso-audit-queue').catch(() => {});
    }
    return true;
  } catch { return false; }
};

export const drainAuditQueue = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('audit_queue', 'readwrite');
      const store = tx.objectStore('audit_queue');
      const items = [];
      const cursor = store.openCursor();
      cursor.onsuccess = (e) => {
        const c = e.target.result;
        if (c) { items.push({ id: c.key, ...c.value }); c.continue(); }
        else { items.forEach(i => store.delete(i.id)); resolve(items); }
      };
      cursor.onerror = () => resolve([]);
    });
  } catch { return []; }
};

// ── SYNC META ─────────────────────────────
export const setSyncMeta = async (key, serverTimestamp) => {
  try {
    await withStore('sync_meta', 'readwrite', store =>
      store.put({ key, serverTs: serverTimestamp, localTs: new Date().toISOString() })
    );
  } catch {}
};

export const getSyncMeta = async (key) => {
  try {
    const row = await withStore('sync_meta', 'readonly', store => store.get(key));
    return row || null;
  } catch { return null; }
};

export const isIndexedDBAvailable = () => {
  try { return typeof indexedDB !== 'undefined' && indexedDB !== null; }
  catch { return false; }
};

export const clearOfflineDB = async () => {
  try {
    const db = await openDB();
    const stores = Array.from(db.objectStoreNames);
    await Promise.all(stores.map(name => new Promise((resolve) => {
      const tx = db.transaction(name, 'readwrite');
      const req = tx.objectStore(name).clear();
      req.onsuccess = resolve;
      req.onerror   = resolve;
    })));
    return true;
  } catch { return false; }
};

export { openDB };