import React from 'react';
import { CashBox } from '../modules/billing/components/CashBox';
import { DollarSign } from 'lucide-react';

export default function CajaPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">Caja</h1>
      </div>
      <CashBox />
    </div>
  );
}
