// src/hooks/useBackendData.js — Hook to fetch data from backend API
// Falls back to localStorage if backend is unavailable
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

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

      // Try backend first
      try {
        const result = await apiClient.get(endpoint);
        if (!cancelled) {
          const items = result[dataField] || [];
          setData(items);
          setSource('backend');
          // Also save to localStorage as cache
          try { localStorage.setItem(localStorageKey, JSON.stringify(items)); } catch {}
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn(`Backend ${endpoint} failed, falling back to localStorage:`, err.message);
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
      try {
        const result = await apiClient.get(endpoint);
        if (!cancelled) {
          setData(result[dataField] || null);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback
        if (!cancelled) {
          try {
            setData(JSON.parse(localStorage.getItem(localStorageKey) || 'null'));
          } catch { setData(null); }
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [endpoint, localStorageKey, dataField]);

  return { data, loading, setData };
}
