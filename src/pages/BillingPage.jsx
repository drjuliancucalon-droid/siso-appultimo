import React from 'react';
import BillGenerator from '../modules/billing/components/BillGenerator';
import { Receipt } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">Facturación</h1>
      </div>
      <BillGenerator />
    </div>
  );
}
