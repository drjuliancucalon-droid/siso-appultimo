// src/utils/storage.js - Almacenamiento local persistente

const _memStore = {}; // fallback si localStorage no est� disponible
const _ls = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return _memStore[k] ?? null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, String(v));
    } catch {
      _memStore[k] = String(v);
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      delete _memStore[k];
    }
  },
};
// sessionStorage: para API Keys - se limpia autom�ticamente al cerrar la pesta�a
const _ss = {
  getItem: (k) => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return _memStore["_ss_" + k] ?? null;
    }
  },
  setItem: (k, v) => {
    try {
      sessionStorage.setItem(k, String(v));
    } catch {
      _memStore["_ss_" + k] = String(v);
    }
  },
  removeItem: (k) => {
    try {
      sessionStorage.removeItem(k);
    } catch {
      delete _memStore["_ss_" + k];
    }
  },
};
// Helper global - accesible desde cualquier funci�n incluyendo goTo
const sp = (k, fb) => {
  const s = _ls.getItem(k);
  if (!s) return fb;
  try {
    return JSON.parse(s);
  } catch {
    return fb;
  }
};
const sps = (k, fb) => {
  const s = _ss.getItem(k);
  if (!s) return fb;
  try {
    return JSON.parse(s);
  } catch {
    return fb;
  }
};

export { _memStore, _ls, _ss, sp, sps };
