// src/hooks/useSaveData.js — v2: D1 primary (igual que monolito), Supabase backup async
// MIGRACION SPR-SYNC: escribe D1 primero, Supabase como backup silencioso.
import { useState, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';
import { d1WriteArrayMerge, d1Get } from '../lib/d1Client';

const SB_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yqrrktrgoijgzccrxnpz.supabase.co';
const SB_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7';
const SB_HEADERS = {
  apikey: SB_KEY,
  Authorization: 'Bearer ' + SB_KEY,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=minimal',
};

const getMergeKey = function(data) {
  if (data && data.docNumero) return 'docNumero';
  if (data && data.id) return 'id';
  return null;
};

const _backupToSupabase = async function(key, data) {
  if (!SB_URL || !SB_KEY || !key) return;
  try {
    const readRes = await fetch(
      SB_URL + '/rest/v1/siso_store?key=eq.' + encodeURIComponent(key) + '&select=value',
      { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } }
    );
    var current = [];
    if (readRes.ok) {
      var rows = await readRes.json();
      if (Array.isArray(rows && rows[0] && rows[0].value)) current = rows[0].value;
    }
    var mergeField = getMergeKey(data);
    if (mergeField && data[mergeField]) {
      var idx = current.findIndex(function(x) { return x[mergeField] === data[mergeField]; });
      if (idx >= 0) {
        current[idx] = Object.assign({}, current[idx], data, { fechaModificacion: new Date().toISOString() });
      } else {
        current.push(data);
      }
    } else {
      current.push(Object.assign({}, data, { id: data.id || ('item_' + Date.now()) }));
    }
    await fetch(SB_URL + '/rest/v1/siso_store', {
      method: 'POST',
      headers: SB_HEADERS,
      body: JSON.stringify({ key: key, value: current, updated_at: new Date().toISOString() }),
    });
  } catch (e) {
    // Silencioso — D1 ya tiene los datos
  }
};

export function useSaveData() {
  var [saving, setSaving] = useState(false);
  var [lastSaveStatus, setLastSaveStatus] = useState(null);

  var save = useCallback(async function(endpoint, data, d1Key) {
    setSaving(true);
    setLastSaveStatus(null);

    try {
      var authRaw = JSON.parse(localStorage.getItem('siso-auth') || '{}');
      var isLocalAuth = authRaw && authRaw.state ? (authRaw.state.isLocalAuth !== false) : true;
      if (!isLocalAuth) {
        var result = await apiClient.post(endpoint, data);
        if (result && result.ok) {
          setSaving(false);
          setLastSaveStatus('ok');
          return Object.assign({ ok: true, source: 'backend' }, result);
        }
      }
    } catch (e) { /* continuar */ }

    if (d1Key) {
      try {
        var mergeField = getMergeKey(data);
        var itemToSave = mergeField ? data : Object.assign({}, data, { id: data.id || ('item_' + Date.now()) });
        var mKey = mergeField || 'id';
        await d1WriteArrayMerge(d1Key, [itemToSave], mKey);
        _backupToSupabase(d1Key, data).catch(function() {});
        try {
          var fetched = await d1Get(d1Key);
          if (fetched && Array.isArray(fetched.value)) {
            localStorage.setItem(d1Key, JSON.stringify(fetched.value));
          }
        } catch (e) { /* no critico */ }
        setSaving(false);
        setLastSaveStatus('ok');
        return { ok: true, source: 'd1', key: d1Key };
      } catch (e) {
        console.warn('[useSaveData] D1 write fallo:', e.message);
        // Encolar operación offline si hay internet pero D1 falló, o si no hay internet
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          try {
            const { enqueueSync } = await import('../shared/lib/syncManager');
            await enqueueSync('upsert', d1Key, itemToSave);
          } catch (_) {}
        }
        setSaving(false);
        setLastSaveStatus('local-only');
        return { ok: true, source: 'local-only', key: d1Key };
      }
    }

    try {
      if (d1Key) {
        var stored = JSON.parse(localStorage.getItem(d1Key) || '[]');
        var arr = Array.isArray(stored) ? stored : [];
        var mf = getMergeKey(data);
        if (mf && data[mf]) {
          var i = arr.findIndex(function(x) { return x[mf] === data[mf]; });
          if (i >= 0) arr[i] = Object.assign({}, arr[i], data);
          else arr.push(Object.assign({}, data, { fechaCreacion: new Date().toISOString() }));
        } else {
          arr.push(Object.assign({}, data, { id: 'local_' + Date.now() }));
        }
        localStorage.setItem(d1Key, JSON.stringify(arr));
        setSaving(false);
        setLastSaveStatus('ok');
        return { ok: true, source: 'local', count: arr.length };
      }
    } catch (e) { /* fallo total */ }

    setSaving(false);
    setLastSaveStatus('error');
    return { ok: false, source: 'none' };
  }, []);

  return { save, saving, lastSaveStatus };
}
