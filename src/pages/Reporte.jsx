// src/pages/Reporte.jsx
// Reportes epidemiológicos, SVE, ARL y exportación
import React, { useState, useMemo } from 'react';
import {
  BarChart3, FileText, Download, Filter, PieChart,
  Activity, Shield, Clipboard, FileSpreadsheet,
  TrendingUp, AlertTriangle, Users, Building2
} from 'lucide-react';

const REPORT_TABS = [
  { id: 'epidemiologico', label: 'Epidemiológico', icon: PieChart, color: 'blue' },
  { id: 'sve', label: 'Programas SVE', icon: Activity, color: 'emerald' },
  { id: 'arl', label: 'Informes ARL', icon: Shield, color: 'amber' },
  { id: 'exportar', label: 'Exportar', icon: Download, color: 'purple' },
];

export default function Reporte({
  currentUser,
  patientsList = [],
  companies = [],
  atencionesCerradas = [],
  onExportRIPS,
  onExportFHIR,
}) {
  const [tab, setTab] = useState('epidemiologico');
  const [periodoFiltro, setPeriodoFiltro] = useState('mes');
  const [empresaFiltro, setEmpresaFiltro] = useState('');

  const stats = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const pats = patientsList.filter(p => {
      if (empresaFiltro && p.empresa !== empresaFiltro && p.companyId !== empresaFiltro) return false;
      if (periodoFiltro === 'mes') return p.fechaExamen?.startsWith(thisMonth);
      return true;
    });

    const tipos = {};
    const conceptos = {};
    const generos = {};
    pats.forEach(p => {
      tipos[p.tipoExamen || 'SIN TIPO'] = (tipos[p.tipoExamen || 'SIN TIPO'] || 0) + 1;
      conceptos[p.conceptoAptitud || 'Sin concepto'] = (conceptos[p.conceptoAptitud || 'Sin concepto'] || 0) + 1;
      generos[p.genero || 'NR'] = (generos[p.genero || 'NR'] || 0) + 1;
    });

    return { total: pats.length, tipos, conceptos, generos, pats };
  }, [patientsList, periodoFiltro, empresaFiltro]);

  const StatBar = ({ label, value, total, color }) => {
    const pct = total > 0 ? (value / total * 100) : 0;
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-600 w-32 truncate">{label}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
          <div className={`h-full bg-${color}-500 rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-bold text-gray-700 w-10 text-right">{value}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-500" />
            Reportes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Informes epidemiológicos, SVE y exportación de datos
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={periodoFiltro}
          onChange={e => setPeriodoFiltro(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="mes">Este mes</option>
          <option value="todo">Todo el historial</option>
        </select>
        <select
          value={empresaFiltro}
          onChange={e => setEmpresaFiltro(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todas las empresas</option>
          {companies.map((c, i) => (
            <option key={c.id || i} value={c.nombre}>{c.nombre}</option>
          ))}
        </select>
        <span className="text-xs text-gray-500 ml-auto">
          {stats.total} registro(s) encontrados
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 overflow-x-auto">
        {REPORT_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                tab === t.id ? `bg-${t.color}-600 text-white shadow-sm` : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Epidemiológico */}
      {tab === 'epidemiologico' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-blue-500" />
              Por Tipo de Examen
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.tipos).sort(([,a],[,b]) => b - a).map(([tipo, count]) => (
                <StatBar key={tipo} label={tipo} value={count} total={stats.total} color="blue" />
              ))}
              {Object.keys(stats.tipos).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Por Concepto de Aptitud
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.conceptos).sort(([,a],[,b]) => b - a).map(([concepto, count]) => (
                <StatBar key={concepto} label={concepto} value={count} total={stats.total} color="emerald" />
              ))}
              {Object.keys(stats.conceptos).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Por Género
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.generos).sort(([,a],[,b]) => b - a).map(([gen, count]) => (
                <StatBar key={gen} label={gen || 'No registrado'} value={count} total={stats.total} color="purple" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Indicadores Clave
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Total atenciones</p>
                <p className="text-xl font-black text-blue-700">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Empresas cubiertas</p>
                <p className="text-xl font-black text-emerald-700">{companies.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SVE */}
      {tab === 'sve' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-500">Programas de Vigilancia Epidemiológica</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            SVE Osteomuscular, Cardiovascular, Auditivo, Visual, Respiratorio, Dermatológico, Psicosocial.
            Módulo integrado con datos de historias clínicas.
          </p>
        </div>
      )}

      {/* ARL */}
      {tab === 'arl' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-500">Informes para ARL</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Genere informes consolidados para las Administradoras de Riesgos Laborales según requerimientos normativos.
          </p>
        </div>
      )}

      {/* Exportar */}
      {tab === 'exportar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-500" />
              RIPS (Res. 3374/2000)
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Registro Individual de Prestación de Servicios. Exporta archivos JSON validados.
            </p>
            <button
              onClick={onExportRIPS}
              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Exportar RIPS
            </button>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              FHIR R4
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Fast Healthcare Interoperability Resources. Bundle interoperable HL7 FHIR.
            </p>
            <button
              onClick={onExportFHIR}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Exportar FHIR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
