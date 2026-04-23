import { useCallback } from 'react';

export const useSync = () => {
  // Hook para _sync del monolito: localStorage + Supabase upsert async
  // Uso: const { _sync, isSyncing } = useSync();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const _sync = useCallback((key, data) => {
    // 1. LocalStorage inmediato (offline-first)
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage sync fail:', e);
    }
    
    // 2. Supabase async (fire-and-forget)
    setIsSyncing(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: data }),
    }).finally(() => setIsSyncing(false));
    
    return true; // Optimistic sync
  }, []);
  
  return { _sync, isSyncing };
};

