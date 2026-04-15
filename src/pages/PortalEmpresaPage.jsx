// src/pages/PortalEmpresaPage.jsx — Company Portal
// Sprint 1.7: Connect CompanyPortal.jsx
import React from 'react';
import { CompanyPortal } from '../modules/companies/components/CompanyPortal';
import { useBackendData } from '../hooks/useBackendData';
import { Building2, Loader2 } from 'lucide-react';

export default function PortalEmpresaPage() {
  const { data: companies, loading } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const { data: patients } = useBackendData('/data/patients', 'siso_db_patients', 'patients');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-orange-600" />
        <h1 className="text-2xl font-bold text-gray-800">Portal Empresa</h1>
      </div>
      <CompanyPortal companies={companies} patients={patients} />
    </div>
  );
}
