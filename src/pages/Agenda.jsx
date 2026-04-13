// src/pages/Agenda.jsx
// Agenda de citas y cola de atención
import React, { useState, useMemo } from 'react';
import {
  Calendar, Clock, Plus, User, Building2, ChevronLeft,
  ChevronRight, CheckCircle2, AlertCircle, Phone, X, Save
} from 'lucide-react';

const HORAS = Array.from({ length: 12 }, (_, i) => {
  const h = 7 + i;
  return `${String(h).padStart(2, '0')}:00`;
});

export default function Agenda({
  currentUser,
  patientsList = [],
  companies = [],
  appointments = [],
  onAddAppointment,
  onCompleteAppointment,
  goTo,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ paciente: '', empresa: '', hora: '08:00', tipo: 'INGRESO', notas: '' });

  const todayAppointments = useMemo(() =>
    appointments.filter(a => a.fecha === selectedDate)
      .sort((a, b) => (a.hora || '').localeCompare(b.hora || '')),
    [appointments, selectedDate]
  );

  const pendingToday = todayAppointments.filter(a => !a.completed).length;
  const completedToday = todayAppointments.filter(a => a.completed).length;

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSave = () => {
    if (!form.paciente.trim()) return;
    onAddAppointment?.({
      ...form,
      id: 'cita_' + Date.now(),
      fecha: selectedDate,
      completed: false,
    });
    setShowForm(false);
    setForm({ paciente: '', empresa: '', hora: '08:00', tipo: 'INGRESO', notas: '' });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-green-500" />
            Agenda de Citas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de citas y cola de atención
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Cita
        </button>
      </div>

      {/* Selector de fecha */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center">
            <p className="text-lg font-black text-gray-800">
              {new Date(selectedDate + 'T12:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {isToday && <span className="text-xs text-green-600 font-bold">📌 Hoy</span>}
          </div>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex gap-4 mt-3 justify-center">
          <span className="text-xs text-gray-500">
            <span className="font-bold text-blue-600">{todayAppointments.length}</span> citas
          </span>
          <span className="text-xs text-gray-500">
            <span className="font-bold text-amber-600">{pendingToday}</span> pendientes
          </span>
          <span className="text-xs text-gray-500">
            <span className="font-bold text-green-600">{completedToday}</span> atendidos
          </span>
        </div>
      </div>

      {/* Cola del día */}
      {todayAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-500">Sin citas programadas</h3>
          <p className="text-sm text-gray-400 mt-1">
            No hay citas para esta fecha. Agregue una nueva cita.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {todayAppointments.map((a, i) => (
            <div
              key={a.id || i}
              className={`bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between transition-all ${
                a.completed ? 'border-green-100 bg-green-50/50' : 'border-gray-100 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 text-center ${a.completed ? 'text-green-500' : 'text-blue-600'}`}>
                  <Clock className="w-4 h-4 mx-auto mb-0.5" />
                  <p className="text-sm font-black">{a.hora}</p>
                </div>
                <div>
                  <p className={`font-semibold text-sm ${a.completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                    {a.paciente}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {a.empresa && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{a.empresa}</span>}
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">{a.tipo}</span>
                  </div>
                  {a.notas && <p className="text-xs text-gray-400 mt-1">{a.notas}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!a.completed && (
                  <>
                    <button
                      onClick={() => goTo?.('hc_ocupacional')}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100"
                    >
                      Atender
                    </button>
                    <button
                      onClick={() => onCompleteAppointment?.(a.id)}
                      className="p-1.5 hover:bg-green-50 rounded-lg"
                      title="Marcar como atendido"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </button>
                  </>
                )}
                {a.completed && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Cita */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">Nueva Cita</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Paciente *</label>
                <input type="text" value={form.paciente} onChange={e => setForm(p => ({ ...p, paciente: e.target.value }))}
                  placeholder="Nombre del paciente"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Empresa</label>
                <select value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400">
                  <option value="">Sin empresa</option>
                  {companies.map((c, i) => <option key={c.id || i} value={c.nombre}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Hora</label>
                  <select value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400">
                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Tipo examen</label>
                  <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400">
                    {['INGRESO', 'PERIÓDICO', 'EGRESO', 'POST-INCAPACIDAD', 'REUBICACIÓN'].map(t =>
                      <option key={t} value={t}>{t}</option>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Notas</label>
                <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                  rows={2} placeholder="Observaciones..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
