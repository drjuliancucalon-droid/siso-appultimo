import { create } from 'zustand';

const _lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const _sess = () => _lsGet('siso_session', null);

export const useUIStore = create((set) => ({
  view: (() => { try { const s = _sess(); return (s?.user && s?.view && s.view !== 'login') ? s.view : 'login'; } catch { return 'login'; } })(),
  navStack: (() => { try { return _sess()?.navStack || []; } catch { return []; } })(),
  alertMsg: '',
  confirmConfig: null,
  promptConfig: null,
  promptValue: '',
  syncStatus: 'idle',
  showSyncReport: false,
  syncReport: null,
  showAIConfig: false,
  aiStatus: null,
  activeTab: (() => { try { return _sess()?.activeTab || 'form'; } catch { return 'form'; } })(),
  dataType: (() => { try { return _sess()?.dataType || 'ocupacional'; } catch { return 'ocupacional'; } })(),

  setView: (v) => set({ view: v }),
  setNavStack: (valOrFn) => set((s) => ({ navStack: typeof valOrFn === 'function' ? valOrFn(s.navStack) : valOrFn })),
  navigate: (viewName) => set((s) => ({ view: viewName, navStack: [...s.navStack, s.view] })),
  goBack: () => set((s) => { const stack = [...s.navStack]; const prev = stack.pop() || 'dashboard'; return { view: prev, navStack: stack }; }),
  setAlertMsg: (msg) => set({ alertMsg: msg }),
  clearAlert: () => set({ alertMsg: '' }),
  setConfirmConfig: (cfg) => set({ confirmConfig: cfg }),
  setPromptConfig: (cfg) => set({ promptConfig: cfg, promptValue: '' }),
  setPromptValue: (val) => set({ promptValue: val }),
  clearModals: () => set({ confirmConfig: null, promptConfig: null, promptValue: '' }),
  setSyncStatus: (st) => set({ syncStatus: st }),
  setShowSyncReport: (v) => set({ showSyncReport: v }),
  setSyncReport: (r) => set({ syncReport: r }),
  setShowAIConfig: (v) => set({ showAIConfig: v }),
  setAiStatus: (v) => set({ aiStatus: v }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDataType: (v) => set({ dataType: v }),
}));
