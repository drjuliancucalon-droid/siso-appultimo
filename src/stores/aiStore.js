// src/stores/aiStore.js — Zustand store for AI configuration
// Replaces: aiConfig, showAIConfig, aiStatus from monolith
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAIStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────
      activeProvider: 'gemini',
      keys: {
        gemini: '',
        groq: '',
        together: '',
        openrouter: '',
      },
      showConfig: false,
      status: null, // null | 'loading' | 'ok' | 'error'

      // ── Actions ────────────────────────────────
      setActiveProvider: (provider) => set({ activeProvider: provider }),

      setKey: (provider, key) => set((s) => ({
        keys: { ...s.keys, [provider]: key },
      })),

      setShowConfig: (show) => set({ showConfig: show }),
      setStatus: (status) => set({ status }),

      getConfig: () => {
        const { activeProvider, keys } = get();
        return { activeProvider, keys };
      },

      // Check if any provider is configured
      hasAnyKey: () => {
        const { keys } = get();
        return Object.values(keys).some((k) => k?.trim()?.length > 0);
      },

      // Sincroniza keys desde D1 al iniciar sesión
      loadFromD1: async (userId) => {
        if (!userId) return;
        try {
          const { d1Get } = await import('../lib/d1Client');
          const { value } = await d1Get(`siso_ai_keys_${userId}`);
          if (value && typeof value === 'object') {
            const safeKeys = { ...get().keys };
            if (value.gemini)     safeKeys.gemini     = value.gemini;
            if (value.groq)       safeKeys.groq       = value.groq;
            if (value.together)   safeKeys.together   = value.together;
            if (value.openrouter) safeKeys.openrouter = value.openrouter;
            set({ keys: safeKeys });
            if (value.activeProvider) set({ activeProvider: value.activeProvider });
          }
        } catch (e) {
          console.warn('[aiStore] No se pudo cargar keys de D1:', e.message);
        }
      },

      // Persiste keys en D1 tras Guardar Configuración
      saveToD1: async (userId) => {
        if (!userId) return;
        try {
          const { d1Set } = await import('../lib/d1Client');
          const { activeProvider, keys } = get();
          await d1Set(`siso_ai_keys_${userId}`, { activeProvider, ...keys });
        } catch (e) {
          console.warn('[aiStore] No se pudo guardar keys en D1:', e.message);
        }
      },
    }),
    {
      name: 'siso-ai-config',
      partialize: (state) => ({
        activeProvider: state.activeProvider,
        keys: state.keys,
      }),
    }
  )
);
