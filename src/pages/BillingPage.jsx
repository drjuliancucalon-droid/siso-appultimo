// src/pages/BillingPage.jsx — Billing page
import React, { useState } from 'react';
import { BillGenerator } from '../modules/billing/components/BillGenerator';
import { Receipt } from 'lucide-react';

const COMPANIES_KEY = 'siso_companies';
const BILLS_KEY = 'siso_saved_bills';

function loadFromStorage(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
  catch { return fallback; }
}

export default function BillingPage() {
  const [companies] = useState(() => loadFromStorage(COMPANIES_KEY));
  const [savedBills, setSavedBills] = useState(() => loadFromStorage(BILLS_KEY));

  const handleSave = (bill) => {
    const updated = [...savedBills, { ...bill, id: 'bill_' + Date.now() }];
    setSavedBills(updated);
    try { localStorage.setItem(BILLS_KEY, JSON.stringify(updated)); } catch {}
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">Facturación</h1>
      </div>
      <BillGenerator companies={companies} savedBills={savedBills} onSave={handleSave} />
    </div>
  );
}
