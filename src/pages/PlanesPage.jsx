import React from 'react';
import LicenseManager from '../modules/users/components/LicenseManager';
import { CreditCard } from 'lucide-react';

export default function PlanesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">Planes y Licencias</h1>
      </div>
      <LicenseManager />
    </div>
  );
}
