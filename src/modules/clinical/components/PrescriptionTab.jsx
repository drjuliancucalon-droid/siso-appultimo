import React, { useState, useEffect, useRef } from 'react';
import { Pill, Plus, Trash2, FileText, ExternalLink, Stethoscope } from 'lucide-react';
import { MedicamentoAutocomplete } from '../../../shared/components/MedicamentoAutocomplete';
import { DERIVACIONES_CATALOG } from '../../../shared/data/derivaciones';
import { SectionTitle } from '../../../shared/components/ui/SectionTitle';

/**
 * TabFormulaDerivacion - Fórmula Médica y Derivaciones
 * Prescripción con autocompletado de medicamentos colombianos
 * Derivaciones con catálogo de especialidades
 */
export const PrescriptionTab = ({
  data,
  setData,
  activeDoctorData,
  activeSignature,
  forceTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState(forceTab || 'formula');
  const [newMed, setNewMed] = useState({
    nombre: '', presentacion: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '',
  });
  const [newDeriv, setNewDeriv] = useState({
    especialidad: '', motivo: '', urgencia: 'Electiva', observaciones: '',
  });
  const [derivSearch, setDerivSearch] = useState('');
  const [showDerivSugg, setShowDerivSugg] = useState(false);
  const derivRef = useRef(null);

  useEffect(() => {
    if (forceTab) setActiveSubTab(forceTab);
  }, [forceTab]);

  useEffect(() => {
    const h = (e) => {
      if (derivRef.current && !derivRef.current.contains(e.target)) setShowDerivSugg(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const addMedicamento = () => {
    if (!newMed.nombre) return;
    setData((p) => ({
      ...p,
      formulaMedicamentos: [...(p.formulaMedicamentos || []), { ...newMed, id: Date.now() }],
    }));
    setNewMed({ nombre: '', presentacion: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' });
  };

  const removeMed = (id) =>
    setData((p) => ({ ...p, formulaMedicamentos: (p.formulaMedicamentos || []).filter((m) => m.id !== id) }));

  const addDerivacion = () => {
    if (!newDeriv.especialidad) return;
    setData((p) => ({
      ...p,
      derivaciones: [...(p.derivaciones || []), { ...newDeriv, id: Date.now() }],
    }));
    setNewDeriv({ especialidad: '', motivo: '', urgencia: 'Electiva', observaciones: '' });
    setDerivSearch('');
  };

  const removeDerivacion = (id) =>
    setData((p) => ({ ...p, derivaciones: (p.derivaciones || []).filter((d) => d.id !== id) }));

  const filteredDeriv = derivSearch.length >= 1
    ? DERIVACIONES_CATALOG.filter((d) =>
        d.esp.toLowerCase().includes(derivSearch.toLowerCase()) ||
        d.motivo.toLowerCase().includes(derivSearch.toLowerCase())
      ).slice(0, 15)
    : [];

  const meds = data.formulaMedicamentos || [];
  const derivs = data.derivaciones || [];

  return (
    <div className="space-y-3">
      {/* Sub-tab selector */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {[
          { key: 'formula', label: '💊 Fórmula Médica', count: meds.length },
          { key: 'derivaciones', label: '🏥 Derivaciones', count: derivs.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeSubTab === tab.key ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Fórmula Médica */}
      {activeSubTab === 'formula' && (
        <div className="space-y-3">
          <SectionTitle title="Prescripción Médica" icon={Pill} color="emerald" />

          {/* Nuevo medicamento */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-black text-emerald-700 uppercase">Agregar medicamento</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <MedicamentoAutocomplete
                  value={newMed.nombre}
                  onChange={(val) => setNewMed((p) => ({ ...p, nombre: val }))}
                  onSelectMed={(med) => {
                    setNewMed((p) => ({
                      ...p,
                      nombre: med.label,
                      dosis: med.dosis || p.dosis,
                      presentacion: (med.presentaciones || [])[0] || p.presentacion,
                    }));
                  }}
                  placeholder="Buscar medicamento (genérico o comercial)..."
                />
              </div>
              <input
                value={newMed.presentacion}
                onChange={(e) => setNewMed((p) => ({ ...p, presentacion: e.target.value }))}
                placeholder="Presentación (tab 500mg, amp 1g...)"
                className="p-1.5 border border-gray-200 rounded text-xs"
              />
              <input
                value={newMed.dosis}
                onChange={(e) => setNewMed((p) => ({ ...p, dosis: e.target.value }))}
                placeholder="Dosis"
                className="p-1.5 border border-gray-200 rounded text-xs"
              />
              <input
                value={newMed.frecuencia}
                onChange={(e) => setNewMed((p) => ({ ...p, frecuencia: e.target.value }))}
                placeholder="Frecuencia (c/8h, c/12h...)"
                className="p-1.5 border border-gray-200 rounded text-xs"
              />
              <input
                value={newMed.duracion}
                onChange={(e) => setNewMed((p) => ({ ...p, duracion: e.target.value }))}
                placeholder="Duración (7 días, 1 mes...)"
                className="p-1.5 border border-gray-200 rounded text-xs"
              />
              <textarea
                value={newMed.indicaciones}
                onChange={(e) => setNewMed((p) => ({ ...p, indicaciones: e.target.value }))}
                placeholder="Indicaciones especiales..."
                className="col-span-2 p-1.5 border border-gray-200 rounded text-xs resize-none"
                rows={2}
              />
            </div>
            <button onClick={addMedicamento} disabled={!newMed.nombre}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-black hover:bg-emerald-700 disabled:opacity-40 flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar a la prescripción
            </button>
          </div>

          {/* Lista de medicamentos */}
          {meds.length > 0 && (
            <div className="space-y-2">
              {meds.map((med, i) => (
                <div key={med.id} className="bg-white border border-emerald-200 rounded-xl p-3 flex gap-3 items-start">
                  <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-emerald-900">{med.nombre}</p>
                    <p className="text-[10px] text-gray-600">
                      {med.presentacion && `${med.presentacion} · `}
                      {med.dosis && `Dosis: ${med.dosis} · `}
                      {med.frecuencia && `${med.frecuencia} · `}
                      {med.duracion && `${med.duracion}`}
                    </p>
                    {med.indicaciones && (
                      <p className="text-[10px] text-amber-700 italic mt-0.5">⚠ {med.indicaciones}</p>
                    )}
                  </div>
                  <button onClick={() => removeMed(med.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Derivaciones */}
      {activeSubTab === 'derivaciones' && (
        <div className="space-y-3">
          <SectionTitle title="Derivaciones a Especialistas" icon={Stethoscope} color="blue" />

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-black text-blue-700 uppercase">Nueva derivación</p>
            <div className="space-y-2" ref={derivRef}>
              <div className="relative">
                <input
                  value={derivSearch}
                  onChange={(e) => { setDerivSearch(e.target.value); setShowDerivSugg(true); }}
                  placeholder="Buscar especialidad o motivo..."
                  className="w-full p-1.5 border border-gray-200 rounded text-xs"
                />
                {showDerivSugg && filteredDeriv.length > 0 && (
                  <div className="absolute z-50 bg-white border border-blue-200 rounded-lg shadow-xl mt-1 w-full max-h-48 overflow-y-auto">
                    {filteredDeriv.map((d, i) => (
                      <button key={i} type="button"
                        onClick={() => {
                          setNewDeriv((p) => ({ ...p, especialidad: d.esp, motivo: d.motivo }));
                          setDerivSearch(d.esp);
                          setShowDerivSugg(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-blue-50 border-b border-gray-50 last:border-none">
                        <p className="text-xs font-bold text-blue-900">{d.esp}</p>
                        <p className="text-[10px] text-gray-500">{d.motivo}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newDeriv.especialidad}
                  onChange={(e) => setNewDeriv((p) => ({ ...p, especialidad: e.target.value }))}
                  placeholder="Especialidad"
                  className="p-1.5 border border-gray-200 rounded text-xs"
                />
                <select
                  value={newDeriv.urgencia}
                  onChange={(e) => setNewDeriv((p) => ({ ...p, urgencia: e.target.value }))}
                  className="p-1.5 border border-gray-200 rounded text-xs"
                >
                  <option value="Electiva">Electiva</option>
                  <option value="Prioritaria">Prioritaria</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
              <textarea
                value={newDeriv.motivo}
                onChange={(e) => setNewDeriv((p) => ({ ...p, motivo: e.target.value }))}
                placeholder="Motivo de derivación..."
                className="w-full p-1.5 border border-gray-200 rounded text-xs resize-none"
                rows={2}
              />
            </div>
            <button onClick={addDerivacion} disabled={!newDeriv.especialidad}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-black hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar derivación
            </button>
          </div>

          {derivs.length > 0 && (
            <div className="space-y-2">
              {derivs.map((d) => (
                <div key={d.id} className="bg-white border border-blue-200 rounded-xl p-3 flex gap-3 items-start">
                  <div className={`px-2 py-1 rounded text-[9px] font-black ${
                    d.urgencia === 'Urgente' ? 'bg-red-100 text-red-700' :
                    d.urgencia === 'Prioritaria' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>{d.urgencia}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-blue-900">{d.especialidad}</p>
                    <p className="text-[10px] text-gray-600">{d.motivo}</p>
                    {d.observaciones && <p className="text-[10px] text-gray-500 italic mt-0.5">{d.observaciones}</p>}
                  </div>
                  <button onClick={() => removeDerivacion(d.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
