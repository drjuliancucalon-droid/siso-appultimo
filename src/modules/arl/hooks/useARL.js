import { useState, useEffect } from 'react';

const STORAGE_KEY = 'siso_atl_cases';

export const useARL = () => {
  const [atlCases, setAtlCases] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAtlCases(JSON.parse(saved));
    } catch {
      setAtlCases([]);
    }
  }, []);

  const saveATL = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setAtlCases(data);
    } catch {}
  };

  return { atlCases, setAtlCases, saveATL };
};
