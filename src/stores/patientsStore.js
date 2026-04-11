import { create } from 'zustand';

const _lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const _lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

export const usePatientsStore = create((set, get) => ({
  patientsList: [],
  atencionesCerradas: _lsGet('siso_atenciones_cerradas', []),
  savedReports: _lsGet('siso_saved_reports', []),
  savedBills: _lsGet('siso_saved_bills', []),
  patientSearchTerm: '',
  activePatientId: null,

  setPatientsList: (list) => set({ patientsList: list }),
  upsertPatient: (p) =>
    set((s) => {
      const list = s.patientsList.filter((x) => x.id !== p.id).concat(p);
      return { patientsList: list };
    }),
  deletePatient: (id) => set((s) => ({ patientsList: s.patientsList.filter((x) => x.id !== id) })),
  setSearchTerm: (term) => set({ patientSearchTerm: term }),
  setActivePatientId: (id) => set({ activePatientId: id }),
  setAtencionesCerradas: (list) => { _lsSet('siso_atenciones_cerradas', list); set({ atencionesCerradas: list }); },
  setSavedReports: (list) => { _lsSet('siso_saved_reports', list); set({ savedReports: list }); },
  setSavedBills: (list) => { _lsSet('siso_saved_bills', list); set({ savedBills: list }); },
}));
