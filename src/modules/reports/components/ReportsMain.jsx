import React from 'react';
import { BarChart3, Users, Activity, FileText, Shield, DollarSign, Send } from 'lucide-react';

// ReportsMain - Componente principal estadísticas (extraído SESIÓN 3 de Reporte.jsx)
export const ReportsMain = ({
  stats, sveIndicators, filteredPatients, total,
  activeTab, setActiveTab,
  certSelected, setCertSelected,
  precioPorPaciente, setPrecioPorPaciente,
  isGeneratingReport,
  handlePrintTable, handleGenerateAIReport, handleExportCSV,
  handleExportRIPS, handleExportFHIR,
  companies, selectedCompanyReport, currentUser
}) => {
  const compName = companies.find(c => c.id === selectedCompanyReport)?.nombre || 'Todas';

  const renderBarChart = (data, maxWidth = 300, colorClass = 'bg-emerald-500') => {
    const max = Math.max(...Object.values(data), 1);
    return Object.entries(data).map(([label, count]) => (
      <div key={label} className="flex items-center gap-2 text-xs">
        <span className="w-32 text-right text-gray-600 truncate font-bold">{label}</span>
        <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} rounded-full transition-all`}
            style={{ width: `${(count / max) * 100}%` }} />
        </div>
        <span className="w-10 text-right font-black text-gray-700">{count}</span>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white border border-emerald-200 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-black text-emerald-700">{stats.total}</p>
          <p className="text-xs font-bold text-gray-500">Total Evaluados</p>
        </div>
        {/* Más cards... */}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
          { id: 'sve', label: 'Indicadores SVE', icon: Shield },
          { id: 'certificados', label: 'Certificados', icon: FileCheck },
          { id: 'financiero', label: 'Financiero', icon: DollarSign },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'estadisticas' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-black text-sm text-gray-800 mb-4">Estadísticas</h3>
          <div className="space-y-4">
            {renderBarChart(stats.byTipo, 300, 'bg-blue-500')}
            {renderBarChart(stats.byConcepto, 300, 'bg-emerald-500')}
            {/* Más charts del monolito... */}
          </div>
        </div>
      )}

      {activeTab === 'sve' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 5 SVE cards del monolito */}
        </div>
      )}

      {activeTab === 'certificados' && renderCertificadosPanel()}
      {activeTab === 'financiero' && renderFinancieroPanel()}

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2 pt-3 border-t">
        <button onClick={handleExportCSV} className="flex items-center gap-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200">
          <Download className="w-3 h-3" /> CSV
        </button>
        <button onClick={handleExportRIPS} className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">
          <FileText className="w-3 h-3" /> RIPS
        </button>
        <button onClick={handleExportFHIR} className="flex items-center gap-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200">
          <FileText className="w-3 h-3" /> FHIR
        </button>
        <button onClick={handlePrintTable} className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
          <Printer className="w-3 h-3" /> Imprimir Tabla
        </button>
      </div>
    </div>
  );
};

// Subcomponentes extraídos
const renderCertificadosPanel = () => {/* ... */};
const renderFinancieroPanel = () => {/* ... */};

