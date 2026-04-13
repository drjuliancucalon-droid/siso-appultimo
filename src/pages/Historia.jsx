// src/pages/Historia.jsx
// Historia Clínica — Ocupacional, General, Fórmula, Derivación
import React, { useState, useMemo, useCallback } from 'react';
import {
  FileText, Search, Plus, User, ClipboardList,
  Stethoscope, Pill, ArrowRightLeft, History, X, ChevronDown
} from 'lucide-react';

const TABS = [
  { id: 'ocupacional', label: 'HC Ocupacional', icon: ClipboardList, color: 'blue' },
  { id: 'general', label: 'HC General', icon: Stethoscope, color: 'emerald' },
  { id: 'formula', label: 'Fórmula Médica', icon: Pill, color: 'purple' },
  { id: 'derivacion', label: 'Derivación', icon: ArrowRightLeft, color: 'amber' },
];

export default function Historia({
  currentUser,
  patientsList = [],
  companies = [],
  activeTab = 'ocupacional',
  onTabChange,
  data,
  onDataChange,
  onNewPatient,
  onSelectPatient,
  onSave,
  onShowHistory,
  saveStatus = '',
  isGenerating = false,
}) {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return patientsList
      .filter(p =>
        (p.nombres || '').toLowerCase().includes(q) ||
        (p.docNumero || '').includes(q) ||
        (p.apellidos || '').toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [search, patientsList]);

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-500" />
            Historia Clínica
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Res. 1843/2025 · Res. 2346/2007 · Res. 1995/1999
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar Paciente
          </button>
          <button
            onClick={onNewPatient}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Paciente
          </button>
        </div>
      </div>

      {/* Buscador */}
      {showSearch && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o documento..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          {filteredPatients.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
              {filteredPatients.map((p, i) => (
                <button
                  key={p.id || i}
                  onClick={() => { onSelectPatient?.(p); setShowSearch(false); setSearch(''); }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3"
                >
                  <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{p.nombres} {p.apellidos || ''}</p>
                    <p className="text-xs text-gray-500">{p.docTipo} {p.docNumero} — {p.empresa || p.cargo || 'Sin empresa'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {search.trim() && filteredPatients.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No se encontraron pacientes</p>
          )}
        </div>
      )}

      {/* Tabs de tipo HC */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? `bg-${tab.color}-600 text-white shadow-sm`
                  : `text-gray-600 hover:bg-gray-50`
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Paciente Actual / Status */}
      {data?.nombres ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-${currentTab.color}-100 flex items-center justify-center`}>
                <User className={`w-5 h-5 text-${currentTab.color}-600`} />
              </div>
              <div>
                <p className="font-bold text-gray-800">{data.nombres} {data.apellidos || ''}</p>
                <p className="text-xs text-gray-500">{data.docTipo} {data.docNumero} · {data.cargo || ''} · {data.empresa || ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saveStatus && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  saveStatus === 'ok' ? 'bg-green-100 text-green-700' :
                  saveStatus === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {saveStatus === 'ok' ? '✓ Guardado' : saveStatus === 'error' ? '✗ Error' : 'Guardando...'}
                </span>
              )}
              <button
                onClick={onShowHistory}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 text-gray-700"
              >
                <History className="w-3.5 h-3.5" />
                Historial
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className={`w-16 h-16 rounded-2xl bg-${currentTab.color}-50 flex items-center justify-center mx-auto mb-4`}>
            <currentTab.icon className={`w-8 h-8 text-${currentTab.color}-400`} />
          </div>
          <h3 className="text-lg font-bold text-gray-700">
            {currentTab.label}
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            {activeTab === 'ocupacional' && 'Seleccione un paciente existente o cree uno nuevo para iniciar la historia clínica ocupacional.'}
            {activeTab === 'general' && 'Registre consultas de medicina general con su formulario completo.'}
            {activeTab === 'formula' && 'Genere fórmulas médicas con medicamentos del catálogo INVIMA.'}
            {activeTab === 'derivacion' && 'Cree órdenes de derivación a especialistas o interconsultas.'}
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => setShowSearch(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar Paciente
            </button>
            <button
              onClick={onNewPatient}
              className={`px-4 py-2 bg-${currentTab.color}-600 text-white rounded-xl text-sm font-bold hover:bg-${currentTab.color}-700 flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          </div>
        </div>
      )}

      {/* Placeholder para el formulario HC — se inyectará desde modules/clinical/ */}
      {data?.nombres && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 text-center">
            📋 Formulario de {currentTab.label} — componente del módulo clínico
          </p>
          {/* TODO: Importar e insertar componentes de modules/clinical/ aquí */}
        </div>
      )}
    </div>
  );
}
