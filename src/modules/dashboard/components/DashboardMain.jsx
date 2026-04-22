import React, { useMemo, useCallback } from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { 
  FileText, Building2, Lock, Unlock, Users, Receipt,
  Clock, Eye, FileCheck, Trash2, Stethoscope, Heart,
  BarChart3, Shield, UserCheck, FileSearch, AlertTriangle
} from 'lucide-react';
import { getSpanishDate } from '../../../shared/lib/formatters.js';

export const DashboardMain = ({
  currentUser,
  goTo,
  patientsList = [],
  companies = [],
  atencionesCerradas = [],
  canUseSGSST = false,
  showAlert
}) => {
  const {
    plan, 
    hcUsadas, 
    pct, 
    col,
    statCards,
    recentRecords,
    alertas
  } = useDashboardStats({ 
    currentUser, 
    patientsList, 
    companies, 
    atencionesCerradas, 
    canUseSGSST 
  });

  // Plan color classes
  const colorMap = { 
    libre: 'gray', 
    starter: 'teal', 
    pro: 'blue', 
    clinica: 'purple' 
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title + Plan Banner */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
          <h2 className="text-2xl font-black text-gray-800">Panel Principal</h2>
        </div>
        <p className="text-gray-500 text-sm">
          {getSpanishDate(null)} — {currentUser?.name}
        </p>

        {/* Plan status banner */}
        <div className={`mt-3 flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl bg-${col}-50 border border-${col}-200`}>
          <span className={`font-black text-${col}-700 text-sm`}>{plan.label}</span>
          <span className="text-gray-400 text-xs">·</span>
          {plan.maxHC < 9999 ? (
            <span className={`text-xs font-bold ${pct >= 100 ? 'text-red-600' : pct >= 80 ? 'text-amber-600' : 'text-gray-600'}`}>
              📋 {hcUsadas}/{plan.maxHC} HC {pct >= 80 && '⚠️'}
            </span>
          ) : (
            <span className="text-xs text-gray-500">📋 HC ilimitadas</span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className={`bg-white rounded-xl p-4 shadow-sm border border-${card.color}-100`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">{card.label}</p>
                <p className={`text-3xl font-black text-${card.color}-600 mt-1`}>{card.value}</p>
              </div>
              <div className={`bg-${card.color}-50 p-2 rounded-lg`}>
                <div className={`w-5 h-5 text-${card.color}-600`}>
                  {card.icon === 'FileText' && <FileText size={20} />}
                  {card.icon === 'Building2' && <Building2 size={20} />}
                  {card.icon === 'Lock' && <Lock size={20} />}
                  {card.icon === 'Unlock' && <Unlock size={20} />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => goTo('hc_ocupacional')}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-left"
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center mb-3">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-white text-sm leading-tight">Nueva HC Ocupacional</h3>
            <p className="text-emerald-100 text-[11px] mt-0.5">Evaluación médica del trabajo</p>
          </div>
        </button>
        <button
          onClick={() => goTo('hc_general')}
          className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-left"
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-white text-sm leading-tight">Nueva HC General</h3>
            <p className="text-blue-100 text-[11px] mt-0.5">Consulta medicina general</p>
          </div>
        </button>
      </div>

      {/* Resto del Dashboard JSX... (igual que original) */}
      {/* ... (Module Grid, Admin Alerts, Recent Records) ... */}

      {/* Recent Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-black text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" /> Registros Recientes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Paciente</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Concepto</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((p, i) => (
                <tr key={`${p.id}-${i}`} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="p-3 text-xs text-gray-500 whitespace-nowrap">{p.fechaExamen}</td>
                  <td className="p-3">
                    <div className="font-bold text-gray-800 text-xs">{p.nombres}</div>
                    <div className="text-[10px] text-gray-400">{p.docNumero} · {p.cargo || 'Sin cargo'}</div>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.type === 'general' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {p.type === 'general' ? 'General' : 'Ocupacional'}
                    </span>
                  </td>
                  <td className="p-3 text-[10px] text-gray-600 max-w-[200px] truncate">{p.conceptoAptitud || '--'}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.estadoHistoria === 'Cerrada' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {p.estadoHistoria || 'Abierta'}
                    </span>
                  </td>
                </tr>
              ))}
              {recentRecords.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400 text-sm">
                    No hay registros aún. Cree una nueva historia clínica.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

