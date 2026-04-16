// src/hooks/useBackendData.js — Hook to fetch data from backend API
// Falls back to Supabase direct → localStorage if backend is unavailable
// Skips backend entirely when isLocalAuth=true (no JWT token)
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

// Read auth state without hook (avoids React hook rules in async context)
const getAuthState = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('siso-auth') || '{}');
    return {
      isLocalAuth: stored?.state?.isLocalAuth ?? true,
      token: stored?.state?.token || null,
    };
  } catch { return { isLocalAuth: true, token: null }; }
};

/**
 * Fetch data from backend with localStorage fallback
 * @param {string} endpoint - Backend endpoint (e.g., '/data/patients')
 * @param {string} localStorageKey - localStorage key for fallback
 * @param {string} dataField - Field name in response (e.g., 'patients')
 */
export function useBackendData(endpoint, localStorageKey, dataField) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('none'); // 'backend' | 'local' | 'none'

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      // Try backend first (requires valid JWT) — skip if using local auth
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
        } catch (err) {
          // Silent fail — will try Supabase direct next
        }
      }

      // Try Supabase directly (transition mode — uses anon key like monolith)
      try {
        const sbUrl = (import.meta.env.VITE_SUPABASE_URL || '');
        const sbKey = (import.meta.env.VITE_SUPABASE_KEY || '');
        // Determine the siso_store key from the endpoint
        const keyMap = {
          '/data/patients': 'siso_patients_drcucalon',
          '/data/patients/db': 'siso_db_patients_drcucalon',
          '/data/companies': 'siso_companies_drcucalon',
          '/data/users': 'siso_users',
          '/data/agenda': 'siso_agendados_drcucalon',
          '/data/bills': 'siso_saved_bills_drcucalon',
        };
        const storeKey = keyMap[endpoint];
        if (storeKey) {
          const res = await fetch(
            `${sbUrl}/rest/v1/siso_store?key=eq.${encodeURIComponent(storeKey)}&select=value`,
            { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
          );
          if (res.ok) {
            const rows = await res.json();
            if (!cancelled && rows?.[0]?.value) {
              const items = Array.isArray(rows[0].value) ? rows[0].value : [];
              setData(items);
              setSource('supabase-direct');
              try { localStorage.setItem(localStorageKey, JSON.stringify(items)); } catch {}
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn(`Supabase direct for ${endpoint} failed:`, err.message);
      }

      // Fallback to localStorage
      if (!cancelled) {
        try {
          const stored = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
          setData(Array.isArray(stored) ? stored : []);
          setSource('local');
        } catch {
          setData([]);
          setSource('none');
        }
        setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [endpoint, localStorageKey, dataField]);

  return { data, loading, error, source, setData };
}

/**
 * Fetch single object from backend
 */
export function useBackendObject(endpoint, localStorageKey, dataField) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      // Try backend (skip if local auth)
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

      // Try Supabase direct (transition)
      try {
        const sbUrl = (import.meta.env.VITE_SUPABASE_URL || '');
        const sbKey = (import.meta.env.VITE_SUPABASE_KEY || '');
        const keyMap = { '/data/doctor': 'siso_doctor_data_drcucalon' };
        const storeKey = keyMap[endpoint];
        if (storeKey) {
          const res = await fetch(
            `${sbUrl}/rest/v1/siso_store?key=eq.${encodeURIComponent(storeKey)}&select=value`,
            { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
          );
          if (res.ok) {
            const rows = await res.json();
            if (!cancelled && rows?.[0]?.value) {
              setData(rows[0].value);
              setLoading(false);
              return;
            }
          }
        }
      } catch {}

      // Fallback localStorage
      if (!cancelled) {
        try {
          setData(JSON.parse(localStorage.getItem(localStorageKey) || 'null'));
        } catch { setData(null); }
        setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [endpoint, localStorageKey, dataField]);

  return { data, loading, setData };
}
