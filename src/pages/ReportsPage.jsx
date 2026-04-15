// src/pages/ReportsPage.jsx — Reports with ALL sub-modules as tabs
// Sprint 1.4-1.5: Integrates ARL, SVE, Epidemiological, Compliance, Analytics
import React, { useState } from 'react';
import { AnalyticsDashboard } from '../modules/reports/components/AnalyticsDashboard';
import { ARLReports } from '../modules/reports/components/ARLReports';
import { SVEPrograms } from '../modules/reports/components/SVEPrograms';
import { EpidemiologicalReport } from '../modules/reports/components/EpidemiologicalReport';
import { ComplianceReport } from '../modules/reports/components/ComplianceReport';
import { useBackendData } from '../hooks/useBackendData';
import { BarChart3, Shield, Activity, FileText, CheckSquare, Loader2, Cloud, HardDrive } from 'lucide-react';

const TABS = [
  { id: 'analytics', label: 'Estadísticas', icon: BarChart3 },
  { id: 'epidemiologia', label: 'Epidemiología', icon: Activity },
  { id: 'sve', label: 'SVE', icon: FileText },
  { id: 'arl', label: 'ARL (FURAT/FUREP)', icon: Shield },
  { id: 'compliance', label: 'Cumplimiento', icon: CheckSquare },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const { data: patients, loading: lp, source } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
  const { data: companies, loading: lc } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const { data: users, loading: lu } = useBackendData('/data/users', 'siso_users', 'users');

  const loading = lp || lc || lu;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        </div>
        {!loading && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {source !== 'local' && source !== 'none' ? <Cloud className="w-3 h-3 text-emerald-500" /> : <HardDrive className="w-3 h-3" />}
            <span>{source === 'local' || source === 'none' ? 'Local' : 'Supabase'}</span>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-100 text-emerald-800 shadow-sm'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'analytics' && <AnalyticsDashboard patients={patients} companies={companies} users={users} />}
          {activeTab === 'epidemiologia' && <EpidemiologicalReport patients={patients} companies={companies} />}
          {activeTab === 'sve' && <SVEPrograms patients={patients} companies={companies} />}
          {activeTab === 'arl' && <ARLReports patients={patients} companies={companies} />}
          {activeTab === 'compliance' && <ComplianceReport patients={patients} companies={companies} users={users} />}
        </>
      )}
    </div>
  );
}
