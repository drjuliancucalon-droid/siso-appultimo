// src/pages/CotizacionesPage.jsx — Quotations
import React, { useState } from 'react';
import { FileText, Plus, Printer, Trash2, DollarSign, Building2 } from 'lucide-react';
import { useBackendData } from '../hooks/useBackendData';
import { openPrintWindow } from '../lib/printService';

const STORAGE_KEY = 'siso_cotizaciones';
const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };
const save = (d) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} };

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState(load);
  const { data: companies } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const [form, setForm] = useState({ empresa: '', servicios: '', valor: '', vigencia: '30 días', observaciones: '' });
  const [showForm, setShowForm] = useState(false);

  const handleSave = () => {
    if (!form.empresa || !form.servicios) { alert('Empresa y servicios son requeridos'); return; }
    const cot = { ...form, id: `cot_${Date.now()}`, fecha: new Date().toISOString(), estado: 'Pendiente' };
    const updated = [cot, ...cotizaciones]; setCotizaciones(updated); save(updated);
    setForm({ empresa: '', servicios: '', valor: '', vigencia: '30 días', observaciones: '' }); setShowForm(false);
  };

  const handlePrint = (cot) => {
    openPrintWindow(`Cotización — ${cot.empresa}`, `
      <h1 style="color:#059669;text-align:center;">COTIZACIÓN DE SERVICIOS</h1>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;"><tr><td style="padding:6px;font-weight:bold;border:1px solid #e5e7eb;width:30%;">Empresa</td><td style="padding:6px;border:1px solid #e5e7eb;">${cot.empresa}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;border:1px solid #e5e7eb;">Fecha</td><td style="padding:6px;border:1px solid #e5e7eb;">${new Date(cot.fecha).toLocaleDateString('es-CO')}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;border:1px solid #e5e7eb;">Servicios</td><td style="padding:6px;border:1px solid #e5e7eb;">${cot.servicios}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;border:1px solid #e5e7eb;">Valor</td><td style="padding:6px;border:1px solid #e5e7eb;font-weight:bold;color:#059669;">$${cot.valor}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;border:1px solid #e5e7eb;">Vigencia</td><td style="padding:6px;border:1px solid #e5e7eb;">${cot.vigencia}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;border:1px solid #e5e7eb;">Observaciones</td><td style="padding:6px;border:1px solid #e5e7eb;">${cot.observaciones || '—'}</td></tr></table>`);
  };

  const handleDelete = (id) => { if (confirm('¿Eliminar cotización?')) { const u = cotizaciones.filter((c) => c.id !== id); setCotizaciones(u); save(u); } };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><DollarSign className="w-6 h-6 text-emerald-600" /><h1 className="text-2xl font-bold text-gray-800">Cotizaciones</h1></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"><Plus className="w-4 h-4" /> Nueva</button>
      </div>
      {showForm && (
        <div className="bg-white border rounded-xl p-5 mb-6 space-y-3">
          <select value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Seleccionar empresa</option>{companies.map((c) => <option key={c.id} value={c.razonSocial || c.nombre}>{c.razonSocial || c.nombre}</option>)}
          </select>
          <textarea value={form.servicios} onChange={(e) => setForm({ ...form, servicios: e.target.value })} placeholder="Servicios ofrecidos..." rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="Valor ($)" className="border rounded-lg px-3 py-2 text-sm" />
            <input value={form.vigencia} onChange={(e) => setForm({ ...form, vigencia: e.target.value })} placeholder="Vigencia" className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Guardar</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {cotizaciones.length === 0 ? <div className="text-center py-12 text-gray-400"><FileText className="w-12 h-12 mx-auto mb-2 opacity-40" /><p>No hay cotizaciones</p></div>
        : cotizaciones.map((c) => (
          <div key={c.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
            <div><p className="font-bold text-sm text-gray-800">{c.empresa}</p><p className="text-xs text-gray-500">{new Date(c.fecha).toLocaleDateString('es-CO')} — ${c.valor}</p></div>
            <div className="flex gap-1">
              <button onClick={() => handlePrint(c)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Printer className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
