import { create } from 'zustand';
import { initialOccupPatientState } from '../../../shared/data/initialStates';

export const useClinicalStore = create((set) => ({
  data: {
    ...initialOccupPatientState,
    tipoHistoria: 'ocupacional',
    fechaExamen: new Date().toISOString().split('T')[0],
  },
  setData: (updates) => set((state) => ({ data: { ...state.data, ...updates } })),
  resetData: () => set({ data: { ...initialOccupPatientState, tipoHistoria: 'ocupacional', fechaExamen: new Date().toISOString().split('T')[0] } }),
}));