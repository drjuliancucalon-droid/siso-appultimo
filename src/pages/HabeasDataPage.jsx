// src/pages/HabeasDataPage.jsx — Habeas Data (Ley 1581/2012)
// Sprint 3.5: ARCO requests (Acceso, Rectificación, Cancelación, Oposición)
import React, { useState } from 'react';
import { Shield, Plus, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';

const TIPOS = ['Consulta', 'Rectificación', 'Supresión', 'Revocatoria'];
const ESTADOS = { pendiente: { color: 'bg-yellow-100 text-yellow-700', icon: Clock }, resuelto: { color: 'bg-green-100 text-green-700', icon: CheckCircle } };
const STORAGE_KEY = 'siso_habeas_requests';

const loadRequests = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };
const saveRequests = (r) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); } catch {} };

export default function HabeasDataPage() {
  const [requests, setRequests] = useState(loadRequests);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo: 'Consulta', nombres: '', documento: '', descripcion: '', email: '' });

  const handleSubmit = () => {
    if (!form.nombres || !form.documento || !form.descripcion) { alert('Completa todos los campos obligatorios'); return; }
    const newReq = { ...form, id: `hab_${Date.now()}`, fecha: new Date().toISOString(), estado: 'pendiente' };
    const updated = [newReq, ...requests];
    setRequests(updated); saveRequests(updated);
    setForm({ tipo: 'Consulta', nombres: '', documento: '', descripcion: '', email: '' }); setShowForm(false);
  };

  const handleResolve = (id) => {
    const updated = requests.map((r) => r.id === id ? { ...r, estado: 'resuelto', fechaResolucion: new Date().toISOString() } : r);
    setRequests(updated); saveRequests(updated);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-600" /><h1 className="text-2xl font-bold text-gray-800">Habeas Data</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Nueva solicitud
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-xs text-emerald-700">
        <p className="font-bold">Ley 1581 de 2012 — Protección de Datos Personales</p>
        <p className="mt-1">Los titulares tienen derecho a Acceder, Rectificar, Cancelar y Oponerse al tratamiento de sus datos personales (derechos ARCO).</p>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-5 mb-6 space-y-3">
          <h3 className="font-bold text-gray-800">Nueva Solicitud</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Tipo *</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Nombre del titular *</label>
              <input value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nombre completo" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Documento *</label>
              <input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Número de documento" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Para respuesta" /></div>
          </div>
          <div><label className="block text-xs font-bold text-gray-600 mb-1">Descripción de la solicitud *</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" placeholder="Detalle de la solicitud ARCO..." /></div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Registrar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><Shield className="w-12 h-12 mx-auto mb-2 opacity-40" /><p>No hay solicitudes registradas</p></div>
        ) : requests.map((r) => {
          const st = ESTADOS[r.estado] || ESTADOS.pendiente;
          const Icon = st.icon;
          return (
            <div key={r.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}><Icon className="w-3 h-3 inline mr-1" />{r.estado}</span>
                  <span className="text-xs font-bold text-gray-700">{r.tipo}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.fecha).toLocaleDateString('es-CO')}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">{r.nombres} — {r.documento}</p>
              <p className="text-xs text-gray-500 mt-1">{r.descripcion}</p>
              {r.estado === 'pendiente' && (
                <button onClick={() => handleResolve(r.id)} className="mt-2 text-xs text-emerald-600 font-bold hover:underline">Marcar como resuelto</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
