// src/pages/CompaniesPage.jsx — Company management with backend data
import React from 'react';
import { CompanyList } from '../modules/companies/components/CompanyList';
import { useBackendData } from '../hooks/useBackendData';
import { Building2, Loader2, Cloud, HardDrive } from 'lucide-react';

export default function CompaniesPage() {
  const { data: companies, loading, source } = useBackendData(
    '/data/companies', 'siso_companies', 'companies'
  );
  const { data: patients } = useBackendData(
    '/data/patients', 'siso_db_patients', 'patients'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-800">Empresas</h1>
          {!loading && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {companies.length} registros
            </span>
          )}
        </div>
        {!loading && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {source === 'backend' ? <Cloud className="w-3 h-3 text-emerald-500" /> : <HardDrive className="w-3 h-3" />}
            <span>{source === 'backend' ? 'Supabase' : 'Local'}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-gray-500">Cargando empresas...</span>
        </div>
      ) : (
        <CompanyList companies={companies} patients={patients} />
      )}
    </div>
  );
}
