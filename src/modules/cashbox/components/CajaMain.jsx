// src/modules/cashbox/components/CajaMain.jsx
// Componente principal - UI extraída del monolito Caja.jsx
import React from 'react';
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, DollarSign, CreditCard } from 'lucide-react';
import { useCaja } from '../hooks/useCaja.js';

export const CajaMain = ({ cajaMovimientos, setCajaMovimientos, cajaForm, setCajaForm, saveCajaDebounced, currentUser, showAlert, showConfirm, ...props }) => {
  const { editingId, showForm, filteredMovimientos, stats, setEditingId, setShowForm, handleAddMovimiento, handleDelete, handleEdit, handleExportCSV, formatCOP, today } = useCaja({ cajaMovimientos, cajaForm, setCajaMovimientos, setCajaForm, saveCajaDebounced, currentUser, showAlert, showConfirm, ...props });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Wallet className="w-6 h-6" /> Caja
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Control de ingresos y egresos</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm">
            <Plus className="w-4 h-4" /> Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600">Ingresos</p>
              <p className="text-xl font-black text-emerald-700">{formatCOP(stats.ingresos)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-600">Egresos</p>
              <p className="text-xl font-black text-red-700">{formatCOP(stats.egresos)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600">Saldo</p>
              <p className={`text-xl font-black ${stats.saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCOP(stats.saldo)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            {editingId ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select value={cajaForm.tipo || 'ingreso'} onChange={e => setCajaForm(p => ({ ...p, tipo: e.target.value }))}
              className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
              <option value="ingreso">💰 Ingreso</option>
              <option value="egreso">💸 Egreso</option>
            </select>
            <input type="text" value={cajaForm.concepto || ''} onChange={e => setCajaForm(p => ({ ...p, concepto: e.target.value }))}
              placeholder="Descripción" className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 md:col-span-2" />
            <input type="number" min="0" value={cajaForm.monto || ''} onChange={e => setCajaForm(p => ({ ...p, monto: e.target.value }))}
              placeholder="0" className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
            <select value={cajaForm.formaPago || 'Efectivo'} onChange={e => setCajaForm(p => ({ ...p, formaPago: e.target.value }))}
              className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
              <option value="Efectivo">💵 Efectivo</option>
              <option value="Transferencia">🏦 Transferencia</option>
              <option value="Tarjeta">💳 Tarjeta</option>
            </select>
          </div>
          <button onClick={handleAddMovimiento} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700">
            {editingId ? 'Actualizar' : 'Registrar'}
          </button>
        </div>
      )}

      {/* Lista de movimientos */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-black text-sm text-gray-800">Movimientos ({filteredMovimientos.length})</h3>
        </div>
        {filteredMovimientos.map(mov => (
          <div key={mov.id} className="p-4 hover:bg-gray-50 flex items-center gap-4 border-b border-gray-50">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mov.tipo === 'ingreso' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {mov.tipo === 'ingreso' ? <ArrowUpCircle className="w-5 h-5 text-emerald-600" /> : <ArrowDownCircle className="w-5 h-5 text-red-600" />}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{mov.concepto}</p>
              <p className="text-xs text-gray-500">{mov.fecha} {mov.formaPago}</p>
            </div>
            <span className={`font-black text-sm ${mov.tipo === 'ingreso' ? 'text-emerald-700' : 'text-red-600'}`}>
              {mov.tipo === 'ingreso' ? '+' : '-'}{formatCOP(mov.monto)}
            </span>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(mov)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(mov.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleExportCSV} className="flex items-center gap-1 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg font-bold">
        <Download className="w-4 h-4" /> Exportar CSV
      </button>
    </div>
  );
};

