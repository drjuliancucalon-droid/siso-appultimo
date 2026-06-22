// src/modules/agenda/components/AgendaView.jsx — SPRINT 6: D1-powered
import React, { useState, useMemo } from 'react';
import { Calendar, Search, CheckCircle, Clock, User, Filter, Sparkles, Loader2 } from 'lucide-react';
import { useAIStore } from '../../../stores/aiStore';
import { optimizeSchedule } from '../../ai/services/aiAnalysis';

const STATUS_CONFIG = {
  espera: { label: 'En espera', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  atendiendo: { label: 'Atendiendo', color: 'bg-blue-100 text-blue-800', icon: User },
  atendido: { label: 'Atendido', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  no_asistio: { label: 'No asistió', color: 'bg-red-100 text-red-800', icon: Clock },
};

export const AgendaView = ({ currentUser, appointments = [], onAppointmentsChange, onOpenHC }) => {
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().slice(0, 10));
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  const handleOptimizarIA = async () => {
    const aiConfig = useAIStore.getState().getConfig();
    if (!useAIStore.getState().hasAnyKey()) { setAiError('Configura tu proveedor de IA en ⚙️'); return; }
    setAiLoading(true); setAiError(null);
    try {
      const agendaData = {
        totalCitas: appointments.length,
        porTipo: appointments.reduce((acc, c) => { acc[c.tipoExamen||'Sin tipo'] = (acc[c.tipoExamen||'Sin tipo']||0)+1; return acc; }, {}),
        porEmpresa: appointments.reduce((acc, c) => { acc[c.empresa||'Sin empresa'] = (acc[c.empresa||'Sin empresa']||0)+1; return acc; }, {}),
        horarioInicio: '07:00', horarioFin: '17:00', medicos: 1
      };
      const result = await optimizeSchedule(agendaData, aiConfig);
      setAiResult(result);
    } catch (e) { setAiError(e.message||'Error IA'); }
    finally { setAiLoading(false); }
  };

  const cambiarEstado = (id, nuevoEstado) => {
    const actualizadas = appointments.map((c) =>
      c.id === id ? { ...c, estado: nuevoEstado, updatedAt: new Date().toISOString() } : c
    );
    if (onAppointmentsChange) onAppointmentsChange(actualizadas);
  };

  const citasFiltradas = useMemo(() => {
    return appointments.filter((c) => {
      const coincideFecha = c.fecha === filtroFecha;
      const coincideBusqueda =
        !busqueda ||
        (c.paciente || '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.documento || '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
      return coincideFecha && coincideBusqueda && coincideEstado;
    });
  }, [appointments, filtroFecha, busqueda, filtroEstado]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-teal-600" /> Agenda de Citas
      </h2>

      {/* ── Botón IA Optimizar Agenda (FASE 3) ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleOptimizarIA} disabled={aiLoading}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
          {aiLoading ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
          {aiLoading ? 'Analizando...' : 'IA Optimizar Agenda'}
        </button>
        {aiError && <span className="text-sm text-red-600">{aiError}</span>}
      </div>
      {aiResult && (
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-sm">
          <h4 className="font-semibold text-indigo-800 mb-2">Optimización IA de Agenda</h4>
          {aiResult.alertas?.length > 0 && (
            <div className="mb-2"><p className="font-medium text-amber-700">Alertas:</p><ul className="list-disc ml-4 text-amber-600">{aiResult.alertas.map((a,i)=><li key={i}>{a}</li>)}</ul></div>
          )}
          {aiResult.recomendaciones?.length > 0 && (
            <div className="mb-2"><p className="font-medium text-indigo-700">Recomendaciones:</p><ul className="list-disc ml-4 text-gray-700">{aiResult.recomendaciones.map((r,i)=><li key={i}>{r}</li>)}</ul></div>
          )}
          <p className="text-gray-500 text-xs mt-2">Eficiencia estimada: {aiResult.eficienciaEstimada}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha</label>
          <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Buscar paciente</label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Nombre o documento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-teal-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400">
            <option value="todos">Todos los estados</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Lista de citas */}
      <div className="space-y-2">
        {citasFiltradas.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No hay citas para esta fecha</p>
        ) : (
          citasFiltradas.map((cita) => {
            const status = STATUS_CONFIG[cita.estado] || STATUS_CONFIG.espera;
            return (
              <div key={cita.id} className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.color}`}>{status.label}</span>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{cita.paciente || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-500">{cita.documento || 'N/A'} · {cita.empresa || ''}</p>
                    <p className="text-[10px] text-gray-400">{cita.hora || '--:--'} · {cita.tipo || cita.tipoExamen || 'PERIODICO'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* FIX 1: Abrir HC desde agenda */}
                  {onOpenHC && (
                    <button onClick={() => onOpenHC(cita)}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold hover:bg-purple-200"
                      title="Abrir Historia Clínica con datos completos">
                      📋 Abrir HC
                    </button>
                  )}
                  {/* Cambiar estado */}
                  <select value={cita.estado} onChange={(e) => cambiarEstado(cita.id, e.target.value)}
                    className="p-1 border rounded text-[10px]">
                    <option value="espera">En espera</option>
                    <option value="atendiendo">Atendiendo</option>
                    <option value="atendido">Atendido</option>
                    <option value="no_asistio">No asistió</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};