import React from 'react';
import { CompanyList } from '../modules/companies/components/CompanyList';
import { Building2 } from 'lucide-react';

export default function CompaniesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-orange-600" />
        <h1 className="text-2xl font-bold text-gray-800">Empresas</h1>
      </div>
      <CompanyList />
    </div>
  );
}
