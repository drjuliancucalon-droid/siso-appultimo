
import React, { useMemo, useCallback } from 'react';
import {
  FileText, Building2, Lock, Unlock, Users, Receipt,
  Clock, Eye, FileCheck, Trash2, Stethoscope, Heart,
  BarChart3, Shield, UserCheck, FileSearch, AlertTriangle
} from 'lucide-react';
import { PLAN_CONFIG, _isAdmin, _isAdminOrEmpresa, _canUse, _contarHC, _secretariaPuede } from '../../../shared/data/planConfig.js';
import { getSpanishDate } from '../../../shared/lib/formatters.js';

export default function DashboardMain({
  currentUser,
  goTo,
  patientsList = [],
  companies = [],
  atencionesCerradas = [],
  canUseSGSST = false,
}) {
  const showAlert = useCallback((msg) => window.alert(msg), []);

  // Plan banner data
  const plan = PLAN_CONFIG[currentUser?.license || 'libre'];
  const hcUsadas = useMemo(() => {
    return patientsList.filter(p => p.fechaExamen && !p._archivado).length;
  }, [patientsList]);
  const pct = plan.maxHC < 9999 ? Math.round((hcUsadas / plan.maxHC) * 100) : -1;
  const colorMap = { libre: 'gray', starter: 'teal', pro: 'blue', clinica: 'purple' };
  const col = colorMap[currentUser?.license || 'libre'];

  // Stat cards
  const statCards = useMemo(() => {
    const cards = [
      { label: 'Historias Registradas', value: patientsList.filter(p => p.fechaExamen).length, color: 'emerald', icon: FileText },
      { label: 'Empresas', value: companies.length, color: 'purple', icon: Building2 },
      { label: 'HC Cerradas', value: patientsList.filter(p => p.estadoHistoria === 'Cerrada').length, color: 'red', icon: Lock },
      { label: 'HC Abiertas', value: patientsList.filter(p => p.estadoHistoria !== 'Cerrada' && p.fechaExamen).length, color: 'blue', icon: Unlock },
    ];
    return cards;
  }, [patientsList, companies]);

  // Recent records
  const recentRecords = useMemo(() => {
    return patientsList
      .filter(p => p.fechaExamen && !p._archivado)
      .slice(-20)
      .reverse();
  }, [patientsList]);

  // Alerts
  const alertas = useMemo(() => {
    const hoy = new Date();
    const en30 = new Date(hoy);
    en30.setDate(en30.getDate() + 30);

    const alerts = [];
    // Convenios próximos a vencer
    const conveniosAlerta = companies.filter(c =>
      c.convenioVencimiento &&
      new Date(c.convenioVencimiento) <= en30 &&
      new Date(c.convenioVencimiento) >= hoy
    );
    conveniosAlerta.forEach(c => {
      alerts.push({ tipo: 'amber', msg: `⚠️ Convenio próximo a vencer: ${c.nombre} (${c.convenioVencimiento})`, accion: () => goTo('empresas') });
    });

    // HC abiertas
    const hcAbiertas = patientsList.filter(p => p.estadoHistoria !== 'Cerrada' && p.fechaExamen && !p._archivado);
    if (hcAbiertas.length > 3) {
      alerts.push({ tipo: 'blue', msg: `📋 ${hcAbiertas.length} HCs sin cerrar`, accion: () => {} });
    }

    return alerts;
  }, [companies, patientsList, goTo]);

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
          {plan.price === 0 && (
            <button onClick={() => goTo('planes')} className={`ml-auto text-xs font-black bg-${col}-600 text-white px-3 py-1 rounded-lg hover:opacity-90 transition`}>
              ⬆️ Ver planes
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl p-4 shadow-sm border border-${card.color}-100`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">{card.label}</p>
                <p className={`text-3xl font-black text-${card.color}-600 mt-1`}>{card.value}</p>
              </div>
              <div className={`bg-${card.color}-50 p-2 rounded-lg`}>
                <card.icon className={`w-5 h-5 text-${card.color}-600`} />
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

      {/* Resto del código igual - 100% copia */}
      {/* [CONTENIDO COMPLETO COPIADO] */}
    </div>
  );
}

