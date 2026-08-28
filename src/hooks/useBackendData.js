// src/hooks/useBackendData.js — v2: D1 primary (igual que monolito), Supabase fallback
// MIGRACION SPR-SYNC: D1 es la fuente de verdad. Supabase es backup.
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { d1Get } from '../lib/d1Client';

const getAuthState = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('siso-auth') || '{}');
    return {
      isLocalAuth: stored?.state?.isLocalAuth ?? true,
      token: stored?.state?.token || null,
    };
  } catch { return { isLocalAuth: true, token: null }; }
};

const getUserId = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('siso-auth') || '{}');
    return stored?.state?.currentUser?.user || 'drcucalon';
  } catch { return 'drcucalon'; }
};

const sbGet = async (key) => {
  try {
    const sbUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yqrrktrgoijgzccrxnpz.supabase.co';
    const sbKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7';
    const res = await fetch(
      `${sbUrl}/rest/v1/siso_store?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows && rows[0] && rows[0].value !== undefined ? rows[0].value : null;
  } catch { return null; }
};

const buildKeyMap = (userId) => ({
  '/data/patients':            'siso_patients_' + userId,
  '/data/patients/db':         'siso_patients_' + userId,
  '/data/companies':           'siso_companies_' + userId,
  '/data/agenda':              'siso_agendados_' + userId,
  '/data/bills':               'siso_saved_bills_' + userId,
  '/data/doctor':              'siso_doctor_data_' + userId,
  '/data/sgsst':               'siso_sgsst_' + userId,
  '/data/ai_keys':             'siso_ai_keys_' + userId,
  '/data/atenciones':          'siso_atenciones_' + userId,
  '/data/atenciones_cerradas': 'siso_atenciones_cerradas_' + userId,
  '/data/users':               'siso_users',
  '/data/cotizaciones':        'siso_cotizaciones',
  '/data/mensajes':            'siso_mensajes',
  '/data/mensajes_drawer':     'siso_mensajes_drawer',
  '/data/encuestas':           'siso_encuestas',
  '/data/arl':                 'siso_atl_cases',
  '/data/habeas':              'siso_habeas_data_requests',
  '/data/telemedicine':        'siso_teleconsultas',
  '/data/teleSala':            'siso_teleSala',
  '/data/teleEspera':          'siso_teleEspera',
  '/data/portafolio':          'siso_portafolio',
  '/data/ips_perfil':          'siso_ips_perfil',
  '/data/orgs':                'siso_orgs',
  '/data/ai_config':           'siso_ai_config_provider',
  '/data/doctor_signature':    'siso_doctor_signature',
  '/data/email_config':        'siso_email_config',
  '/data/audit_log':           'siso_audit_log',
  '/data/privacidad':          'siso_privacidad_aceptada',
  '/data/reports':             'siso_saved_reports',
  '/data/backup_history':      'siso_backup_history',
  '/data/custom_meds':         'siso_custom_meds',
});

const getLegacyPatients = () => {
  try {
    const uid = getUserId();
    const candidates = ['siso_db_patients_' + uid, 'siso_db_patients', 'siso_pacientes'];
    for (const k of candidates) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch {}
  return [];
};

const getLegacyCompanies = () => {
  try {
    const uid = getUserId();
    const candidates = ['siso_companies_' + uid, 'siso_companies'];
    for (const k of candidates) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch {}
  return [];
};

export function useBackendData(endpoint, localStorageKey, dataField) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('none');

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const { isLocalAuth, token } = getAuthState();
      if (!isLocalAuth && token) {
        try {
          const result = await apiClient.get(endpoint);
          if (!cancelled && result[dataField]) {
            const items = result[dataField] || [];
            setData(items);
            setSource('backend');
            try { localStorage.setItem(localStorageKey, JSON.stringify(items)); } catch {}
            setLoading(false);
            return;
          }
        } catch {}
      }

      const userId = getUserId();
      const keyMap = buildKeyMap(userId);
      const d1Key = keyMap[endpoint];
      const isPatients = endpoint === '/data/patients' || endpoint === '/data/patients/db';
      const isCompanies = endpoint === '/data/companies';

      if (d1Key) {
        try {
          const { value } = await d1Get(d1Key, { userId });
          if (!cancelled && Array.isArray(value) && value.length > 0) {
            let items = value;
            if (isPatients) {
              const legacy = getLegacyPatients();
              if (legacy.length > items.length) {
                const merged = [...legacy];
                for (const p of items) {
                  const idx = merged.findIndex(function(x) { return x.docNumero === p.docNumero; });
                  if (idx >= 0) merged[idx] = Object.assign({}, merged[idx], p);
                  else merged.push(p);
                }
                items = merged;
              }
            }
            setData(items);
            setSource('d1');
            try { localStorage.setItem(localStorageKey, JSON.stringify(items)); } catch {}
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('[useBackendData] D1 fallo ' + d1Key + ':', e.message);
        }
      }

      if (d1Key) {
        try {
          const sbVal = await sbGet(d1Key);
          if (!cancelled && Array.isArray(sbVal) && sbVal.length > 0) {
            let items = sbVal;
            if (isPatients && items.length <= 1) {
              const legacy = getLegacyPatients();
              if (legacy.length > 0) items = legacy;
            }
            if (isCompanies && items.length === 0) {
              const legacy = getLegacyCompanies();
              if (legacy.length > 0) items = legacy;
            }
            setData(items);
            setSource('supabase');
            try { localStorage.setItem(localStorageKey, JSON.stringify(items)); } catch {}
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('[useBackendData] Supabase fallo ' + d1Key + ':', e.message);
        }
      }

      if (!cancelled) {
        try {
          let stored = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
          stored = Array.isArray(stored) ? stored : [];
          if (isPatients && stored.length <= 1) {
            const legacy = getLegacyPatients();
            if (legacy.length > 0) stored = legacy;
          }
          if (isCompanies && stored.length === 0) {
            const legacy = getLegacyCompanies();
            if (legacy.length > 0) stored = legacy;
          }
          setData(stored);
          setSource('local');
        } catch {
          setData([]);
          setSource('none');
        }
        setLoading(false);
      }
    }

    fetchData();
    return function() { cancelled = true; };
  }, [endpoint, localStorageKey, dataField]);

  return { data, loading, error, source, setData };
}

export function useBackendObject(endpoint, localStorageKey, dataField) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      const { isLocalAuth: isLocal, token: tk } = getAuthState();
      if (!isLocal && tk) {
        try {
          const result = await apiClient.get(endpoint);
          if (!cancelled && result[dataField] !== undefined) {
            setData(result[dataField] || null);
            setLoading(false);
            return;
          }
        } catch {}
      }

      const userId = getUserId();
      const keyMap = buildKeyMap(userId);
      const d1Key = keyMap[endpoint];

      if (d1Key) {
        try {
          const { value } = await d1Get(d1Key, { userId });
          if (!cancelled && value !== null && value !== undefined) {
            setData(value);
            try { localStorage.setItem(localStorageKey, JSON.stringify(value)); } catch {}
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('[useBackendObject] D1 fallo ' + d1Key + ':', e.message);
        }
      }

      if (d1Key) {
        try {
          const sbVal = await sbGet(d1Key);
          if (!cancelled && sbVal !== null && sbVal !== undefined) {
            setData(sbVal);
            try { localStorage.setItem(localStorageKey, JSON.stringify(sbVal)); } catch {}
            setLoading(false);
            return;
          }
        } catch {}
      }

      if (!cancelled) {
        try {
          setData(JSON.parse(localStorage.getItem(localStorageKey) || 'null'));
        } catch { setData(null); }
        setLoading(false);
      }
    }

    fetchData();
    return function() { cancelled = true; };
  }, [endpoint, localStorageKey, dataField]);

  return { data, loading, setData };
}
