// src/pages/BillingPage.jsx — Billing with backend data
import React from 'react';
import { BillGenerator } from '../modules/billing/components/BillGenerator';
import { useBackendData } from '../hooks/useBackendData';
import { Receipt, Loader2, Cloud, HardDrive } from 'lucide-react';

export default function BillingPage() {
  const { data: companies, loading: loadingComp } = useBackendData(
    '/data/companies', 'siso_companies', 'companies'
  );
  const { data: bills, loading: loadingBills, source } = useBackendData(
    '/data/bills', 'siso_saved_bills', 'bills'
  );

  const loading = loadingComp || loadingBills;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Receipt className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">Facturación</h1>
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
        <BillGenerator companies={companies} savedBills={bills} />
      )}
    </div>
  );
}
