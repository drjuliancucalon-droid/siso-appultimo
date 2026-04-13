import React, { useState } from 'react';
import { Stethoscope, ChevronRight } from 'lucide-react';
import { SectionTitle } from '../../../shared/components/ui/SectionTitle';
import { SelectGroup } from '../../../shared/components/ui/SelectGroup';
import { TextAreaGroup } from '../../../shared/components/ui/TextAreaGroup';

/**
 * PhysicalExam - Examen Físico por Sistemas
 * Incluye todos los sistemas requeridos por Res. 1843/2025
 */
const SISTEMAS = [
  { key: 'cabezaCuello', label: 'Cabeza y Cuello', icon: '🧠', fields: ['cabezaCuello', 'orl', 'ojos', 'agudezaVisualOD', 'agudezaVisualOI'] },
  { key: 'cardiopulmonar', label: 'Cardiopulmonar', icon: '❤️', fields: ['cardiopulmonar', 'ruidos', 'pulmones'] },
  { key: 'abdomen', label: 'Abdomen', icon: '🫁', fields: ['abdomen'] },
  { key: 'extremidades', label: 'Extremidades', icon: '🦴', fields: ['extremidades', 'columnaVertebral', 'miembrosSup', 'miembrosInf'] },
  { key: 'neurologico', label: 'Neurológico', icon: '🧬', fields: ['neurologico', 'reflejos', 'sensibilidad', 'marcha'] },
  { key: 'pielFaneras', label: 'Piel y Faneras', icon: '🩹', fields: ['pielFaneras'] },
  { key: 'genitourinario', label: 'Genitourinario', icon: '🏥', fields: ['genitourinario'] },
  { key: 'psiquiatrico', label: 'Estado Mental', icon: '🧘', fields: ['estadoMental', 'orientacion', 'afecto'] },
];

const HALLAZGO_OPTIONS = ['Normal', 'Anormal'];

export const PhysicalExam = ({ data, onChange, disabled = false, enfasis = 'GENERAL' }) => {
  const [expanded, setExpanded] = useState({});

  const handleFieldChange = (field, value) => {
    const examen = { ...(data.examenFisicoSistemas || {}), [field]: value };
    onChange({ ...data, examenFisicoSistemas: examen });
  };

  const examen = data.examenFisicoSistemas || {};

  return (
    <fieldset disabled={disabled}>
      <SectionTitle title="Examen Físico por Sistemas" icon={Stethoscope} color="blue" />
      <div className="space-y-1.5">
        {SISTEMAS.map((sis) => {
          const hasAnormal = sis.fields.some((f) =>
            (examen[f] || '').toLowerCase().includes('anormal')
          );
          return (
            <div
              key={sis.key}
              className={`border rounded-xl overflow-hidden ${
                hasAnormal ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setExpanded((p) => ({ ...p, [sis.key]: !p[sis.key] }))}
                className={`w-full flex justify-between items-center px-3 py-2.5 text-left font-bold text-xs transition ${
                  hasAnormal ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{sis.icon}</span>
                  <span>{sis.label}</span>
                  {hasAnormal && (
                    <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                      Anormal
                    </span>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${expanded[sis.key] ? 'rotate-90' : ''}`} />
              </button>
              {expanded[sis.key] && (
                <div className="p-3 space-y-2 bg-white">
                  {sis.fields.map((field) => (
                    <div key={field} className="flex gap-2 items-start">
                      <div className="w-1/4 min-w-[100px]">
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-0.5">
                          {field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                        </label>
                        <select
                          value={(examen[field + '_hallazgo'] || 'Normal')}
                          onChange={(e) => handleFieldChange(field + '_hallazgo', e.target.value)}
                          className={`w-full p-1 border rounded text-[10px] font-bold ${
                            (examen[field + '_hallazgo'] || 'Normal') === 'Anormal'
                              ? 'border-red-300 bg-red-50 text-red-700'
                              : 'border-gray-200 text-gray-700'
                          }`}
                        >
                          {HALLAZGO_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={examen[field] || ''}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          placeholder={`Descripción hallazgos ${field}...`}
                          rows={2}
                          className="w-full p-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-300 outline-none resize-y"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Maniobras osteomusculares (mostrar si énfasis osteomuscular o alturas) */}
      {(enfasis === 'OSTEOMUSCULAR' || enfasis === 'ALTURAS' || enfasis === 'GENERAL') && (
        <div className="mt-3">
          <SectionTitle title="Maniobras Osteomusculares" icon={Stethoscope} color="purple" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'maniobra_phalen', label: 'Phalen (túnel carpiano)' },
              { name: 'maniobra_tinel', label: 'Tinel (túnel carpiano)' },
              { name: 'maniobra_finkelstein', label: 'Finkelstein (De Quervain)' },
              { name: 'maniobra_neer', label: 'Neer (manguito rotador)' },
              { name: 'maniobra_hawkins', label: 'Hawkins-Kennedy (manguito rotador)' },
              { name: 'maniobra_lassegue', label: 'Lasègue (ciática)' },
              { name: 'maniobra_romberg', label: 'Romberg (equilibrio)' },
              { name: 'maniobra_adams', label: 'Adams (escoliosis)' },
            ].map(({ name, label }) => (
              <div key={name} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <select
                  value={examen[name] || 'Negativo'}
                  onChange={(e) => handleFieldChange(name, e.target.value)}
                  className={`p-1 border rounded text-[10px] font-bold ${
                    (examen[name] || 'Negativo') === 'Positivo'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="Negativo">Neg (−)</option>
                  <option value="Positivo">Pos (+)</option>
                  <option value="No evaluado">N/E</option>
                </select>
                <span className="text-[10px] text-gray-700 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examen de alturas - Res. 4272/2021 */}
      {enfasis === 'ALTURAS' && (
        <div className="mt-3">
          <SectionTitle title="Examen Trabajo en Alturas - Res. 4272/2021" icon={Stethoscope} color="orange" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'alturas_vertigo', label: 'Vértigo / acrofobia' },
              { name: 'alturas_equilibrio', label: 'Equilibrio estático' },
              { name: 'alturas_coordinacion', label: 'Coordinación motora' },
              { name: 'alturas_agarre', label: 'Fuerza de agarre' },
              { name: 'alturas_vision_profundidad', label: 'Visión de profundidad' },
              { name: 'alturas_romberg_sensibilizado', label: 'Romberg sensibilizado' },
            ].map(({ name, label }) => (
              <SelectGroup
                key={name}
                label={label}
                name={name}
                value={examen[name] || ''}
                onChange={(e) => handleFieldChange(name, e.target.value)}
                options={['Normal', 'Anormal', 'No evaluado']}
                width="w-full"
              />
            ))}
          </div>
          <TextAreaGroup
            label="Concepto aptitud alturas"
            name="alturas_concepto"
            value={examen.alturas_concepto || ''}
            onChange={(e) => handleFieldChange('alturas_concepto', e.target.value)}
            placeholder="Concepto de aptitud para trabajo en alturas..."
            rows={2}
          />
        </div>
      )}
    </fieldset>
  );
};
