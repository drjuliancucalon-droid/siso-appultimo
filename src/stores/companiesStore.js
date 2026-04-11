import { create } from 'zustand';
import { initialUsers } from '../data/initialState.js';

const _lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const _lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

export const useCompaniesStore = create((set, get) => ({
  companies: [],
  usersList: _lsGet('siso_users', initialUsers),
  doctorSignature: _lsGet('siso_doctor_signature', null),
  aiConfig: { activeProvider: 'gemini', keys: {}, model: '' },

  setCompaniesList: (list) => set({ companies: list }),
  upsertCompany: (c) =>
    set((s) => {
      const list = s.companies.filter((x) => x.id !== c.id).concat(c);
      return { companies: list };
    }),
  deleteCompany: (id) => set((s) => ({ companies: s.companies.filter((x) => x.id !== id) })),
  setUsersList: (list) => { _lsSet('siso_users', list); set({ usersList: list }); },
  setDoctorSignature: (sig) => { _lsSet('siso_doctor_signature', sig); set({ doctorSignature: sig }); },
  setAiConfig: (cfg) => set({ aiConfig: cfg }),
}));
