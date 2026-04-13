// src/pages/Bill.jsx
// Facturación — Cuentas de cobro, propuestas y exportación DIAN
import React, { useState, useMemo } from 'react';
import {
  Receipt, Plus, FileText, Download, Search,
  DollarSign, Send, Eye, Trash2, X, Save,
  FileSpreadsheet, Building2, Calendar
} from 'lucide-react';

const TABS = [
  { id: 'generar', label: 'Generar Cuenta', icon: Plus },
  { id: 'guardadas', label: 'Cuentas Guardadas', icon: FileText },
  { id: 'propuestas', label: 'Propuestas', icon: FileSpreadsheet },
];

export default function Bill({
  currentUser,
  companies = [],
  savedBills = [],
  onSaveBill,
  onDeleteBill,
  onExportDIAN,
}) {
  const [tab, setTab] = useState('generar');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    empresa: '', concepto: '', items: [{ desc: 'Examen médico ocupacional', cantidad: 1, valorUnit: 35000 }],
    notas: '', formaPago: 'Transferencia bancaria', plazo: '30 días',
  });

  const addItem = () => setForm(p => ({
    ...p,
    items: [...p.items, { desc: '', cantidad: 1, valorUnit: 0 }]
  }));

  const removeItem = (idx) => setForm(p => ({
    ...p,
    items: p.items.filter((_, i) => i !== idx)
  }));

  const updateItem = (idx, field, value) => setForm(p => ({
    ...p,
    items: p.items.map((it, i) => i === idx ? { ...it, [field]: value } : it)
  }));

  const total = useMemo(() =>
    form.items.reduce((sum, it) => sum + (Number(it.cantidad) || 0) * (Number(it.valorUnit) || 0), 0),
    [form.items]
  );

  const filteredBills = useMemo(() => {
    if (!search.trim()) return savedBills;
    const q = search.toLowerCase();
    return savedBills.filter(b =>
      (b.empresa || '').toLowerCase().includes(q) ||
      (b.numero || '').includes(q)
    );
  }, [savedBills, search]);

  const handleSave = () => {
    if (!form.empresa) return;
    onSaveBill?.({
      ...form,
      id: 'bill_' + Date.now(),
      numero: 'CC-' + String(savedBills.length + 1).padStart(4, '0'),
      fecha: new Date().toISOString().split('T')[0],
      total,
      estado: 'pendiente',
    });
    setTab('guardadas');
  };

  const formatCOP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-amber-500" />
            Facturación
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cuentas de cobro, propuestas económicas y exportación DIAN
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Generar Cuenta */}
      {tab === 'generar' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Empresa *</label>
              <select value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">Seleccionar empresa...</option>
                {companies.map((c, i) => <option key={c.id || i} value={c.nombre}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Forma de pago</label>
              <select value={form.formaPago} onChange={e => setForm(p => ({ ...p, formaPago: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400">
                {['Transferencia bancaria', 'Efectivo', 'Cheque', 'Tarjeta'].map(f =>
                  <option key={f} value={f}>{f}</option>
                )}
              </select>
            </div>
          </div>

          {/* Ítems */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">Servicios</label>
              <button onClick={addItem} className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Agregar ítem
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={it.desc}
                    onChange={e => updateItem(i, 'desc', e.target.value)}
                    placeholder="Descripción del servicio"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    type="number"
                    value={it.cantidad}
                    onChange={e => updateItem(i, 'cantidad', e.target.value)}
                    className="w-16 px-2 py-2 border border-gray-200 rounded-xl text-sm text-center outline-none focus:ring-2 focus:ring-amber-400"
                    min="1"
                  />
                  <input
                    type="number"
                    value={it.valorUnit}
                    onChange={e => updateItem(i, 'valorUnit', e.target.value)}
                    className="w-28 px-2 py-2 border border-gray-200 rounded-xl text-sm text-right outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-sm font-bold text-gray-600 w-28 text-right">
                    {formatCOP((Number(it.cantidad) || 0) * (Number(it.valorUnit) || 0))}
                  </span>
                  {form.items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="p-1 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
            <span className="font-bold text-amber-800">TOTAL</span>
            <span className="text-2xl font-black text-amber-700">{formatCOP(total)}</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Notas / Observaciones</label>
            <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Guardar Cuenta
            </button>
            <button onClick={onExportDIAN} className="px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 flex items-center gap-2">
              <Download className="w-4 h-4" /> DIAN XML
            </button>
          </div>
        </div>
      )}

      {/* Cuentas Guardadas */}
      {tab === 'guardadas' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cuenta..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400 shadow-sm" />
          </div>
          {filteredBills.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay cuentas guardadas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBills.map((b, i) => (
                <div key={b.id || i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{b.numero || 'Sin número'}</p>
                    <p className="text-xs text-gray-500">{b.empresa} · {b.fecha}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-amber-700">{formatCOP(b.total || 0)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      b.estado === 'pagada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{b.estado || 'pendiente'}</span>
                    <button onClick={() => onDeleteBill?.(b.id)} className="p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Propuestas */}
      {tab === 'propuestas' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-500">Propuestas Económicas</h3>
          <p className="text-sm text-gray-400 mt-1">
            Genere propuestas comerciales para empresas clientes. Módulo en desarrollo.
          </p>
        </div>
      )}
    </div>
  );
}
