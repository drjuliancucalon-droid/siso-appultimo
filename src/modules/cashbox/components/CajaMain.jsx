// modules/cashbox/components/CajaMain.jsx
// Main UI component using useCaja hook

import React from 'react';
import { DollarSign } from 'lucide-react';
import { useCaja } from '../hooks/useCaja.js';

export default function CajaMain({ bills, companies, onUpdateBillStatus }) {
  const {
    movements,
    filters,
    setFilters,
    isLoading,
    totals,
    filteredMovements,
    handlePago,
    refresh
  } = useCaja({ bills, companies, onUpdateBillStatus });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <DollarSign className="w-7 h-7 text-emerald-600" />
          Caja / Movimientos
        </h2>
        <div className="flex gap-2">
          <button onClick={refresh} disabled={isLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50">
            {isLoading ? 'Cargando...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium">Total Movimientos</p>
          <p className="text-2xl font-black text-emerald-600">{filteredMovements.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium">Ingresos</p>
          <p className="text-2xl font-black text-green-600">${totals.ingresos?.toLocaleString('es-CO') || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium">Saldo</p>
          <p className="text-2xl font-black text-blue-600">${totals.saldo?.toLocaleString('es-CO') || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="font-bold text-lg mb-4">Filtros</h3>
        {/* Filters form */}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase">Concepto</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase">Valor</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{movement.fecha}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      movement.tipo === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {movement.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">{movement.concepto}</td>
                  <td className="px-6 py-4 text-right font-bold text-lg">
                    ${movement.valor?.toLocaleString('es-CO') || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      movement.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' 
                      : movement.estado === 'pagado' ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                      {movement.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handlePago(movement)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700">
                      Pagar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

