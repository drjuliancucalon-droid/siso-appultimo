// src/pages/ReportsPage.jsx — Reports and analytics
import React, { useState } from 'react';
import { AnalyticsDashboard } from '../modules/reports/components/AnalyticsDashboard';
import { BarChart3 } from 'lucide-react';

const PATIENTS_KEY = 'siso_db_patients';
const COMPANIES_KEY = 'siso_companies';
const USERS_KEY = 'siso_users';

function loadFromStorage(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
  catch { return fallback; }
}

export default function ReportsPage() {
  const [patients] = useState(() => loadFromStorage(PATIENTS_KEY));
  const [companies] = useState(() => loadFromStorage(COMPANIES_KEY));
  const [users] = useState(() => loadFromStorage(USERS_KEY));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h1>
      </div>
      <AnalyticsDashboard patients={patients} companies={companies} users={users} />
    </div>
  );
}
