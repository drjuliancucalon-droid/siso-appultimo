
```jsx
// src/modules/backup/hooks/useBackup.js
import { useState, useEffect, useCallback } from 'react';

const SB_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yqrrktrgoijgzccrxnpz.supabase.co';
const SB_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7';

const SYSTEM_DISPLAY_KEYS = [
  { key: 'siso_patients_drcucalon',    label: 'Pacientes' },
  { key: 'siso_companies_drcucalon',   label: 'Empresas' },
  { key: 'siso_doctor_data_drcucalon', label: 'Doctor' },
  { key: 'siso_agendados_drcucalon',   label: 'Agenda' },
  { key: 'siso_saved_bills_drcucalon', label: 'Facturas' },
  { key: 'siso_privacidad_aceptada',   label: 'Habeas data' },
];

export const useBackup = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [systemCounts, setSystemCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [backupHistory, setBackupHistory] = useState([]);

  // ... [resto lógica de estado del BackupPage.jsx]
  // [loadSystemCounts, loadBackupHistory, etc.]

  return {
    exporting, importing, systemCounts, loadingCounts, backupHistory,
    loadSystemCounts, handleExport, handleImport,
    // ...
  };
};
```

