// src/pages/CajaPage.jsx — Cash box page
import React, { useState, useEffect } from 'react';
import { CashBox } from '../modules/billing/components/CashBox';
import { DollarSign } from 'lucide-react';

const CAJA_KEY = 'siso_caja_movimientos';

function loadFromStorage(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
  catch { return fallback; }
}

export default function CajaPage() {
  const [movements, setMovements] = useState(() => loadFromStorage(CAJA_KEY));

  useEffect(() => {
    try { localStorage.setItem(CAJA_KEY, JSON.stringify(movements)); } catch {}
  }, [movements]);

  const handleAdd = (mov) => {
    setMovements((prev) => [...prev, { ...mov, id: 'mov_' + Date.now() }]);
  };

  const handleDelete = (mov) => {
    setMovements((prev) => prev.filter((m) => m.id !== mov.id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">Caja</h1>
      </div>
      <CashBox
        movements={movements}
        onAddMovement={handleAdd}
        onDeleteMovement={handleDelete}
      />
    </div>
  );
}
