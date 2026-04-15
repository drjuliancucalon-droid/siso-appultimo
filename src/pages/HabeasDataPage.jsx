// src/pages/HabeasDataPage.jsx
// Sprint 3.5: Habeas Data requests (Ley 1581/2012)
// ARCO rights: Consulta, Rectificación, Supresión, Revocatoria
import React, { useState, useCallback, useEffect } from 'react';
import { ShieldCheck, Send, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const SOLICITUD_TYPES = [
  { value: 'consulta', label: 'Consulta', desc: 'Conocer qué datos personales se almacenan' },
  { value: 'rectificacion', label: 'Rectificación', desc: 'Corregir datos inexactos o incompletos' },
  { value: 'supresion', label: 'Supresión', desc: 'Eliminar datos personales' },
  { value: 'revocatoria', label: 'Revocatoria', desc: 'Revocar autorización de tratamiento de datos' },
];

const STATUS_COLORS = {
  pendiente: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  en_proceso: { bg: 'bg-blue-50', text: 'text-blue-700', icon: AlertTriangle },
  completada: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  rechazada: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
};

const STORAGE_KEY = 'siso_habeas_data_requests';

export default function HabeasDataPage() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    tipo: 'consulta',
    nombreTitular: '',
    docTipo: 'CC',
    docNumero: '',
    email: '',
    telefono: '',
    descripcion: '',
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setRequests(stored);
    } catch { /* empty */ }
  }, []);

  const saveRequests = useCallback((updated) => {
    setRequests(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!form.nombreTitular.trim() || !form.docNumero.trim() || !form.descripcion.trim()) {
      alert('Complete todos los campos requeridos (nombre, documento y descripción).');
      return;
    }

    const newRequest = {
      ...form,
      id: `hd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
      fechaRespuesta: null,
      respuesta: '',
    };

    saveRequests([newRequest, ...requests]);
    setForm({
      tipo: 'consulta',
      nombreTitular: '',
      docTipo: 'CC',
      docNumero: '',
      email: '',
      telefono: '',
      descripcion: '',
    });
    alert('✅ Solicitud registrada correctamente. Será procesada en los términos de la Ley 1581/2012.');
  }, [form, requests, saveRequests]);

  const handleDelete = useCallback((id) => {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    saveRequests(requests.filter((r) => r.id !== id));
  }, [requests, saveRequests]);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-7 h-7 text-emerald-600" />
        <div>
          <h1 className="text-xl font-black text-gray-800">Habeas Data</h1>
          <p className="text-xs text-gray-500">Gestión de solicitudes ARCO — Ley 1581/2012 · Decreto 1377/2013</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-bold text-emerald-800 mb-1">Derechos del Titular de Datos Personales</h3>
        <p className="text-xs text-emerald-700">
          Según la Ley 1581 de 2012 (Ley de Protección de Datos Personales), todo titular tiene derecho a:
          <strong> Consultar, Rectificar, Suprimir</strong> sus datos personales y <strong>Revocar</strong> la autorización
          otorgada para su tratamiento. Plazo máximo de respuesta: 10 días hábiles (consultas) o 15 días hábiles (reclamos).
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-5 shadow-sm mb-6 space-y-4">
        <h2 className="text-sm font-black text-gray-800 uppercase flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-600" />
          Nueva Solicitud
        </h2>

        {/* Type selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SOLICITUD_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, tipo: type.value }))}
              className={`p-3 rounded-lg border text-left transition-all ${
                form.tipo === type.value
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <p className="text-xs font-bold text-gray-800">{type.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{type.desc}</p>
            </button>
          ))}
        </div>

        {/* Patient identification */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Nombre Completo *</label>
            <input
              type="text"
              value={form.nombreTitular}
              onChange={(e) => setForm((p) => ({ ...p, nombreTitular: e.target.value }))}
              className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs"
              placeholder="Nombre del titular"
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="w-24">
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Tipo Doc</label>
              <select
                value={form.docTipo}
                onChange={(e) => setForm((p) => ({ ...p, docTipo: e.target.value }))}
                className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs bg-white"
              >
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="PA">PA</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Nro. Documento *</label>
              <input
                type="text"
                value={form.docNumero}
                onChange={(e) => setForm((p) => ({ ...p, docNumero: e.target.value }))}
                className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Descripción de la Solicitud *</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
            rows={4}
            className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs resize-none"
            placeholder="Describa detalladamente su solicitud..."
            required
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-5 py-2 rounded-lg font-bold text-sm hover:opacity-90 shadow-sm"
        >
          <Send className="w-4 h-4" /> Enviar Solicitud
        </button>
      </form>

      {/* Requests list */}
      <div>
        <h2 className="text-sm font-black text-gray-800 uppercase mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          Solicitudes Registradas ({requests.length})
        </h2>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay solicitudes registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const statusConfig = STATUS_COLORS[req.estado] || STATUS_COLORS.pendiente;
              const StatusIcon = statusConfig.icon;
              const typeLabel = SOLICITUD_TYPES.find((t) => t.value === req.tipo)?.label || req.tipo;

              return (
                <div key={req.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{typeLabel}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {req.estado.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-800">{req.nombreTitular}</p>
                      <p className="text-xs text-gray-500">{req.docTipo} {req.docNumero} • {new Date(req.fechaCreacion).toLocaleDateString('es-CO')}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{req.descripcion}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
