// src/stores/aiStore.js — Zustand store for AI configuration
// Replaces: aiConfig, showAIConfig, aiStatus from monolith
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { d1Get, d1Set } from '../lib/d1Client';

export const useAIStore = create(
  persist(
    (set, get) => ({
      activeProvider: 'gemini',
      keys: { gemini: '', groq: '', together: '', openrouter: '' },
      showConfig: false,
      status: null,
      setActiveProvider: (provider) => set({ activeProvider: provider }),
      setKey: (provider, key) => set((s) => ({ keys: { ...s.keys, [provider]: key } })),
      setShowConfig: (show) => set({ showConfig: show }),
      setStatus: (status) => set({ status }),
      getConfig: () => { const { activeProvider, keys } = get(); return { activeProvider, keys }; },
      hasAnyKey: () => Object.values(get().keys).some((k) => k?.trim()?.length > 0),
      loadFromD1: (userId) => {
        if (!userId) return;
        d1Get('siso_ai_keys_' + userId).then(({ value }) => {
          if (!value || typeof value !== 'object') return;
          const k = { ...get().keys };
          if (value.gemini) k.gemini = value.gemini;
          if (value.groq) k.groq = value.groq;
          if (value.together) k.together = value.together;
          if (value.openrouter) k.openrouter = value.openrouter;
          set({ keys: k });
          if (value.activeProvider) set({ activeProvider: value.activeProvider });
        }).catch((e) => console.warn('[aiStore] loadFromD1:', e.message));
      },
      saveToD1: (userId) => {
        if (!userId) return;
        const { activeProvider, keys } = get();
        d1Set('siso_ai_keys_' + userId, { activeProvider, ...keys })
          .catch((e) => console.warn('[aiStore] saveToD1:', e.message));
      },
    }),
    { name: 'siso-ai-config', partialize: (s) => ({ activeProvider: s.activeProvider, keys: s.keys }) }
  )
);
