// src/pages/ReportsPage.jsx — Reports with backend data
import React from 'react';
import { AnalyticsDashboard } from '../modules/reports/components/AnalyticsDashboard';
import { useBackendData } from '../hooks/useBackendData';
import { BarChart3, Loader2, Cloud, HardDrive } from 'lucide-react';

export default function ReportsPage() {
  const { data: patients, loading: lp, source } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
  const { data: companies, loading: lc } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const { data: users, loading: lu } = useBackendData('/data/users', 'siso_users', 'users');

  const loading = lp || lc || lu;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h1>
        </div>
        {!loading && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {source !== 'local' && source !== 'none' ? <Cloud className="w-3 h-3 text-emerald-500" /> : <HardDrive className="w-3 h-3" />}
            <span>{source === 'local' || source === 'none' ? 'Local' : 'Supabase'}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <AnalyticsDashboard patients={patients} companies={companies} users={users} />
      )}
    </div>
  );
}
