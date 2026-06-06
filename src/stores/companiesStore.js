// src/stores/companiesStore.js — Zustand store for Companies module state
// Extracts: companiesTab, editingCompany, encuestas from App.jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCompaniesStore = create(
  persist(
    (set, get) => ({
      // ── Tab navigation ────────────────────────
      companiesTab: 'lista',
      setCompaniesTab: (tab) => set({ companiesTab: tab }),

      // ── Editing state ─────────────────────────
      editingCompany: null,
      setEditingCompany: (company) => set({ editingCompany: company }),

      // ── Encuestas ─────────────────────────────
      encuestas: (() => {
        try {
          return JSON.parse(localStorage.getItem('siso_encuestas') || '[]');
        } catch {
          return [];
        }
      })(),
      setEncuestas: (encuestas) => {
        try {
          localStorage.setItem('siso_encuestas', JSON.stringify(encuestas));
        } catch {}
        set({ encuestas });
      },
      addEncuesta: (encuesta) => {
        const { encuestas } = get();
        const updated = [...encuestas, { ...encuesta, id: Date.now().toString(36) }];
        try {
          localStorage.setItem('siso_encuestas', JSON.stringify(updated));
        } catch {}
        set({ encuestas: updated });
      },
      deleteEncuesta: (id) => {
        const { encuestas } = get();
        const updated = encuestas.filter(e => e.id !== id);
        try {
          localStorage.setItem('siso_encuestas', JSON.stringify(updated));
        } catch {}
        set({ encuestas: updated });
      },
    }),
    {
      name: 'siso-companies',
      partialize: (state) => ({
        companiesTab: state.companiesTab,
        encuestas: state.encuestas,
      }),
    }
  )
);