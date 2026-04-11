import React, { createContext, useContext } from "react";
import { useAuthStore } from "./stores/authStore.js";
import { useUIStore } from "./stores/uiStore.js";
import { usePatientsStore } from "./stores/patientsStore.js";
import { useCompaniesStore } from "./stores/companiesStore.js";
import { useAppStore } from "./stores/appStore.js";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const auth = useAuthStore();
  const ui = useUIStore();
  const patients = usePatientsStore();
  const companies = useCompaniesStore();
  const app = useAppStore();

  const ctx = { ...auth, ...ui, ...patients, ...companies, ...app };

  return (
    <AppContext.Provider value={ctx}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export default AppProvider;
