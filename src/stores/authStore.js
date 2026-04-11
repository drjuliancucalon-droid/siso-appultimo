import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const _lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
};

const _hydrateCurrentUser = () => {
  try {
    const sess = _lsGet('siso_session', null);
    if (sess?.user) {
      const users = _lsGet('siso_users', []);
      return users.find((u) => u.user === sess.user) || null;
    }
  } catch {}
  return null;
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: _hydrateCurrentUser(),
      privacidadAceptada: _lsGet('siso_privacidad_aceptada', false),
      loginAttempts: 0,
      loginBlockedUntil: null,

      setCurrentUser: (user) => set({ currentUser: user }),
      setPrivacidadAceptada: (v) => {
        try { localStorage.setItem('siso_privacidad_aceptada', JSON.stringify(v)); } catch {}
        set({ privacidadAceptada: v });
      },
      setLoginAttempts: (valOrFn) =>
        set((s) => ({ loginAttempts: typeof valOrFn === 'function' ? valOrFn(s.loginAttempts) : valOrFn })),
      setLoginBlockedUntil: (v) => set({ loginBlockedUntil: v }),
      recordFailedAttempt: () =>
        set((s) => {
          const attempts = s.loginAttempts + 1;
          const blocked = attempts >= 5 ? Date.now() + 15 * 60 * 1000 : s.loginBlockedUntil;
          return { loginAttempts: attempts, loginBlockedUntil: blocked };
        }),
      resetLoginBlock: () => set({ loginAttempts: 0, loginBlockedUntil: null }),
      logout: () => {
        try { localStorage.removeItem('siso_session'); } catch {}
        set({ currentUser: null, loginAttempts: 0, loginBlockedUntil: null });
      },
    }),
    {
      name: 'siso_auth',
      partialize: (s) => ({
        privacidadAceptada: s.privacidadAceptada,
        loginBlockedUntil: s.loginBlockedUntil,
        loginAttempts: s.loginAttempts,
      }),
    }
  )
);
