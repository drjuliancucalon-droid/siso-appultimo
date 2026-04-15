// src/stores/authStore.js — Zustand store for authentication
// Replaces: currentUser, loginAttempts, loginBlockedUntil, privacidadAceptada, etc.
// from the monolith's 120+ useState declarations
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../lib/apiClient';

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 min

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────
      currentUser: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loginAttempts: 0,
      blockedUntil: null,
      lastActivity: null,
      privacidadAceptada: false,
      mustChangePassword: false,
      twoFARequired: false,

      // ── Actions ────────────────────────────────
      login: async (username, password) => {
        const { loginAttempts, blockedUntil } = get();

        // Check if blocked
        if (blockedUntil && Date.now() < blockedUntil) {
          const minLeft = Math.ceil((blockedUntil - Date.now()) / 60000);
          throw new Error(`Cuenta bloqueada. Intenta en ${minLeft} minuto(s).`);
        }

        try {
          // TODO: Replace with real backend call when backend is ready
          // For now, use the existing auth flow from useAuth.js
          const response = await apiClient.post('/auth/login', { username, password });
          const { user, token, refreshToken } = response;

          set({
            currentUser: user,
            token,
            refreshToken,
            isAuthenticated: true,
            loginAttempts: 0,
            blockedUntil: null,
            lastActivity: Date.now(),
            mustChangePassword: !!user.mustChangePassword,
            twoFARequired: !!user.twoFAEnabled && !user._twoFAVerified,
          });

          return user;
        } catch (error) {
          // Record failed attempt
          const newAttempts = loginAttempts + 1;
          const updates = { loginAttempts: newAttempts };

          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            updates.blockedUntil = Date.now() + BLOCK_DURATION_MS;
            updates.loginAttempts = 0;
          }

          set(updates);
          throw error;
        }
      },

      // Temporary login for transition period (uses local auth like monolith)
      loginLocal: (user) => {
        set({
          currentUser: user,
          isAuthenticated: true,
          loginAttempts: 0,
          blockedUntil: null,
          lastActivity: Date.now(),
          mustChangePassword: !!user.mustChangePassword,
          twoFARequired: false,
        });
      },

      logout: () => {
        set({
          currentUser: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          lastActivity: null,
          privacidadAceptada: false,
          mustChangePassword: false,
          twoFARequired: false,
        });
      },

      resetActivity: () => {
        set({ lastActivity: Date.now() });
      },

      acceptPrivacy: () => {
        set({ privacidadAceptada: true });
      },

      setMustChangePassword: (val) => {
        set({ mustChangePassword: val });
      },

      setTwoFARequired: (val) => {
        set({ twoFARequired: val });
      },

      // ── Computed helpers ───────────────────────
      isAdmin: () => {
        const { currentUser } = get();
        return currentUser?.role === 'administrador' || currentUser?.role === 'super_admin';
      },

      isMedico: () => {
        const { currentUser } = get();
        return currentUser?.role === 'medico' || currentUser?.role === 'administrador';
      },

      isSecretaria: () => {
        const { currentUser } = get();
        return currentUser?.role === 'secretaria';
      },

      canAccess: (feature) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        if (currentUser.role === 'super_admin' || currentUser.role === 'administrador') return true;
        if (currentUser.role === 'secretaria') {
          return !!(currentUser.permisosSecretaria || {})[feature];
        }
        return true;
      },
    }),
    {
      name: 'siso-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        privacidadAceptada: state.privacidadAceptada,
      }),
    }
  )
);
