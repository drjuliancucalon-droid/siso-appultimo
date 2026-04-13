// src/pages/Dashboard.jsx
// Página principal — Dashboard con estadísticas, accesos rápidos y alertas
import React, { useMemo } from 'react';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, Activity,
  FileText, Calendar, Plus, AlertTriangle, Shield, TrendingUp,
  Clock, ChevronRight
} from 'lucide-react';

export default function Dashboard({
  currentUser,
  patientsList = [],
  companies = [],
  atencionesCerradas = [],
  goTo,
  canUseSGSST = false,
}) {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.slice(0, 7);
    return {
      totalPacientes: patientsList.length,
      totalEmpresas: companies.length,
      hcEsteMes: patientsList.filter(p => p.fechaExamen?.startsWith(thisMonth)).length,
      atencionesHoy: atencionesCerradas.filter(a => a.fecha?.startsWith(today)).length,
      hcAbiertas: patientsList.filter(p => p.estadoHistoria === 'Abierta').length,
      recientes: patientsList
        .filter(p => p.nombres && p.fechaExamen)
        .sort((a, b) => (b.fechaExamen || '').localeCompare(a.fechaExamen || ''))
        .slice(0, 5),
    };
  }, [patientsList, companies, atencionesCerradas]);

  const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <button
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left w-full group`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-3xl font-black mt-1 text-${color}-600`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center group-hover:bg-${color}-100 transition-colors`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
      </div>
    </button>
  );

  const QuickAction = ({ icon: Icon, label, color, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-${color}-50 hover:bg-${color}-100 text-${color}-700 font-semibold text-sm transition-all border border-${color}-100`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-black">
          ¡Bienvenido, {currentUser?.name || currentUser?.user || 'Doctor'}! 👋
        </h1>
        <p className="text-blue-100 mt-1">
          {currentUser?.role === 'super_admin' ? 'Administrador del Sistema' :
           currentUser?.role === 'administrador' ? 'Administrador' :
           currentUser?.role === 'medico' ? 'Médico Ocupacional' :
           currentUser?.role === 'secretaria' ? 'Secretaria' : 'Usuario'}
          {' — '}{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Pacientes" value={stats.totalPacientes} color="blue" onClick={() => goTo('hc_ocupacional')} />
        <StatCard icon={Building2} label="Empresas" value={stats.totalEmpresas} color="emerald" onClick={() => goTo('empresas')} />
        <StatCard icon={FileText} label="HC este mes" value={stats.hcEsteMes} color="purple" onClick={() => goTo('hc_ocupacional')} />
        <StatCard icon={Activity} label="HC Abiertas" value={stats.hcAbiertas} color="amber" />
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Acciones Rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <QuickAction icon={Plus} label="Nueva HC Ocupacional" color="blue" onClick={() => goTo('hc_ocupacional')} />
          <QuickAction icon={Calendar} label="Ver Agenda" color="green" onClick={() => goTo('agenda')} />
          <QuickAction icon={Building2} label="Nueva Empresa" color="purple" onClick={() => goTo('empresas')} />
          <QuickAction icon={FileText} label="Facturación" color="amber" onClick={() => goTo('facturacion')} />
          {canUseSGSST && (
            <QuickAction icon={Shield} label="SG-SST" color="red" onClick={() => goTo('sgsst')} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacientes Recientes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Pacientes Recientes
          </h2>
          {stats.recientes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin pacientes registrados aún</p>
          ) : (
            <div className="space-y-2">
              {stats.recientes.map((p, i) => (
                <div key={p.id || i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.nombres} {p.apellidos || ''}</p>
                    <p className="text-xs text-gray-500">{p.docTipo} {p.docNumero} — {p.cargo || 'Sin cargo'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{p.fechaExamen}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.estadoHistoria === 'Cerrada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.estadoHistoria || 'Abierta'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas de Cumplimiento */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Alertas y Recordatorios
          </h2>
          <div className="space-y-3">
            {stats.hcAbiertas > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">HC sin cerrar</p>
                  <p className="text-xs text-yellow-600">
                    Tiene {stats.hcAbiertas} historia(s) clínica(s) abiertas pendientes de cierre.
                  </p>
                </div>
              </div>
            )}
            {canUseSGSST && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">SG-SST Activo</p>
                  <p className="text-xs text-blue-600">
                    Revise el cumplimiento de estándares mínimos (Res. 0312/2019).
                  </p>
                  <button onClick={() => goTo('sgsst')} className="text-xs text-blue-700 font-bold mt-1 flex items-center gap-1 hover:underline">
                    Ver Dashboard SG-SST <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            {stats.totalEmpresas === 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <Building2 className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Sin empresas registradas</p>
                  <p className="text-xs text-gray-500">Registre su primera empresa cliente para comenzar.</p>
                </div>
              </div>
            )}
            {stats.hcAbiertas === 0 && stats.totalEmpresas > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                <CalendarCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Todo al día ✓</p>
                  <p className="text-xs text-green-600">No hay alertas pendientes.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
