// src/pages/Telemedicine.jsx
// Módulo de Telemedicina — Consultas virtuales
import React, { useState } from 'react';
import {
  Video, Plus, Clock, CheckCircle2, Play,
  Phone, Calendar, User, Monitor, History, X, Save
} from 'lucide-react';

const STATUS_COLORS = {
  activa: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  programada: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  finalizada: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

export default function Telemedicine({
  currentUser,
  consultations = [],
  onNewConsultation,
  onStartConsultation,
  onEndConsultation,
  patientsList = [],
}) {
  const [tab, setTab] = useState('activas');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ paciente: '', motivo: '', fecha: '', hora: '' });

  const activas = consultations.filter(c => c.estado === 'activa');
  const programadas = consultations.filter(c => c.estado === 'programada');
  const historial = consultations.filter(c => c.estado === 'finalizada');

  const handleSave = () => {
    if (!form.paciente.trim()) return;
    onNewConsultation?.({
      ...form,
      id: 'tele_' + Date.now(),
      estado: 'programada',
      createdAt: new Date().toISOString(),
    });
    setShowForm(false);
    setForm({ paciente: '', motivo: '', fecha: '', hora: '' });
  };

  const renderList = (items, emptyMsg) => {
    if (items.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{emptyMsg}</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {items.map((c, i) => {
          const st = STATUS_COLORS[c.estado] || STATUS_COLORS.programada;
          return (
            <div key={c.id || i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{c.paciente}</p>
                  <p className="text-xs text-gray-500">{c.motivo || 'Consulta general'} · {c.fecha} {c.hora}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${st.bg} ${st.text} font-medium flex items-center gap-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  {c.estado}
                </span>
                {c.estado === 'programada' && (
                  <button
                    onClick={() => onStartConsultation?.(c.id)}
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Iniciar
                  </button>
                )}
                {c.estado === 'activa' && (
                  <button
                    onClick={() => onEndConsultation?.(c.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Finalizar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Video className="w-7 h-7 text-purple-500" />
            Telemedicina
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Consultas virtuales y teleconsultas
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Consulta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-black text-green-600">{activas.length}</p>
          <p className="text-xs text-gray-500 font-medium">Activas</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-black text-blue-600">{programadas.length}</p>
          <p className="text-xs text-gray-500 font-medium">Programadas</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-black text-gray-600">{historial.length}</p>
          <p className="text-xs text-gray-500 font-medium">Finalizadas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
        {[
          { id: 'activas', label: 'Activas', icon: Monitor },
          { id: 'programadas', label: 'Programadas', icon: Calendar },
          { id: 'historial', label: 'Historial', icon: History },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === 'activas' && renderList(activas, 'No hay consultas activas en este momento')}
      {tab === 'programadas' && renderList(programadas, 'No hay consultas programadas')}
      {tab === 'historial' && renderList(historial, 'No hay consultas finalizadas')}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">Nueva Teleconsulta</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Paciente *</label>
                <input type="text" value={form.paciente} onChange={e => setForm(p => ({ ...p, paciente: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Motivo</label>
                <input type="text" value={form.motivo} onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Hora</label>
                  <input type="time" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Programar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
