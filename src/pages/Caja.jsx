// src/pages/Caja.jsx
// Módulo financiero — Movimientos diarios, ingresos, egresos
import React, { useState, useMemo } from 'react';
import {
  Wallet, Plus, TrendingUp, TrendingDown, Calendar,
  DollarSign, ArrowUpRight, ArrowDownRight, Filter, X, Save,
  BarChart3, Download
} from 'lucide-react';

export default function Caja({
  currentUser,
  movimientos = [],
  onAddMovimiento,
}) {
  const [showForm, setShowForm] = useState(false);
  const [periodo, setPeriodo] = useState('hoy');
  const [form, setForm] = useState({ tipo: 'ingreso', concepto: '', monto: '', metodo: 'Efectivo', notas: '' });

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const filtered = useMemo(() => {
    return movimientos.filter(m => {
      if (periodo === 'hoy') return m.fecha === today;
      if (periodo === 'mes') return m.fecha?.startsWith(thisMonth);
      return true;
    });
  }, [movimientos, periodo, today, thisMonth]);

  const totals = useMemo(() => {
    const ingresos = filtered.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + (Number(m.monto) || 0), 0);
    const egresos = filtered.filter(m => m.tipo === 'egreso').reduce((s, m) => s + (Number(m.monto) || 0), 0);
    return { ingresos, egresos, balance: ingresos - egresos };
  }, [filtered]);

  const handleSave = () => {
    if (!form.concepto.trim() || !form.monto) return;
    onAddMovimiento?.({
      ...form,
      id: 'mov_' + Date.now(),
      fecha: today,
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      monto: Number(form.monto),
    });
    setShowForm(false);
    setForm({ tipo: 'ingreso', concepto: '', monto: '', metodo: 'Efectivo', notas: '' });
  };

  const formatCOP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-500" />
            Caja
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Control de ingresos y egresos diarios
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Movimiento
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500 font-medium">Ingresos</span>
          </div>
          <p className="text-2xl font-black text-green-600">{formatCOP(totals.ingresos)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-500 font-medium">Egresos</span>
          </div>
          <p className="text-2xl font-black text-red-600">{formatCOP(totals.egresos)}</p>
        </div>
        <div className={`bg-white rounded-2xl p-5 shadow-sm border ${totals.balance >= 0 ? 'border-green-100' : 'border-red-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`w-5 h-5 ${totals.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-sm text-gray-500 font-medium">Balance</span>
          </div>
          <p className={`text-2xl font-black ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCOP(totals.balance)}
          </p>
        </div>
      </div>

      {/* Filtro de período */}
      <div className="flex items-center gap-2">
        {[
          { id: 'hoy', label: 'Hoy' },
          { id: 'mes', label: 'Este mes' },
          { id: 'todo', label: 'Todo' },
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setPeriodo(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              periodo === p.id ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Lista de movimientos */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-500">Sin movimientos</h3>
          <p className="text-sm text-gray-400 mt-1">No hay movimientos registrados para este período.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {filtered.map((m, i) => (
            <div key={m.id || i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  m.tipo === 'ingreso' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {m.tipo === 'ingreso'
                    ? <ArrowUpRight className="w-5 h-5 text-green-500" />
                    : <ArrowDownRight className="w-5 h-5 text-red-500" />
                  }
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{m.concepto}</p>
                  <p className="text-xs text-gray-500">{m.fecha} {m.hora || ''} · {m.metodo || 'Efectivo'}</p>
                </div>
              </div>
              <span className={`font-black text-sm ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                {m.tipo === 'ingreso' ? '+' : '-'}{formatCOP(m.monto || 0)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Movimiento */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">Nuevo Movimiento</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                {['ingreso', 'egreso'].map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(p => ({ ...p, tipo: t }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      form.tipo === t
                        ? t === 'ingreso' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Concepto *</label>
                <input type="text" value={form.concepto} onChange={e => setForm(p => ({ ...p, concepto: e.target.value }))}
                  placeholder="Ej: Examen ocupacional"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Monto *</label>
                <input type="number" value={form.monto} onChange={e => setForm(p => ({ ...p, monto: e.target.value }))}
                  placeholder="0" min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Método de pago</label>
                <select value={form.metodo} onChange={e => setForm(p => ({ ...p, metodo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400">
                  {['Efectivo', 'Transferencia', 'Tarjeta', 'Nequi', 'Daviplata', 'Cheque'].map(m =>
                    <option key={m} value={m}>{m}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
