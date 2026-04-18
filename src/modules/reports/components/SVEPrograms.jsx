import React, { useState, useMemo } from 'react';
import { Activity, AlertTriangle, TrendingUp, Download, Eye } from 'lucide-react';

/**
 * SVEPrograms - Sistemas de Vigilancia Epidemiológica
 * GATISO / Decreto 1072/2015 / Res. 0312/2019
 */
export const SVEPrograms = ({ patients = [], companies = [] }) => {
  const [activeProgram, setActiveProgram] = useState('osteomuscular');

  // B-08: 7 programas de Vigilancia Epidemiológica (monolito líneas 29367-30200)
  const SVE_PROGRAMS = [
    { id: 'osteomuscular', label: 'SVE Osteomuscular (DME)', icon: '🦴', norm: 'GATISO-DME · Res. 2844/2007 · GTC-45:2012' },
    { id: 'psicosocial', label: 'SVE Psicosocial', icon: '🧠', norm: 'Res. 2764/2022 · Res. 2646/2008' },
    { id: 'visual', label: 'SVE Visual', icon: '👁️', norm: 'Res. 1843/2025 · ICONTEC' },
    { id: 'auditivo', label: 'SVE Auditivo / HNIR', icon: '👂', norm: 'GATISO-HNIR · Res. 8321/1983' },
    { id: 'respiratorio', label: 'SVE Respiratorio', icon: '🫁', norm: 'GATISO-NEU · Res. 2400/1979' },
    { id: 'neurologico', label: 'SVE Neurológico', icon: '🧪', norm: 'GATISO · Dec. 1072/2015' },
    { id: 'dermatologico', label: 'SVE Dermatológico', icon: '🩹', norm: 'GATISO-DERM' },
  ];

  const programs = useMemo(() => {
    const classify = (pat, condition) => patients.filter(condition);
    return {
      osteomuscular: {
        ...SVE_PROGRAMS[0],
        pacientes: classify(null, (p) => {
          const dx = [p.diagnostico1, p.diagnostico2, p.diagnostico3].filter(Boolean).join(' ').toLowerCase();
          return dx.includes('lumbalgia') || dx.includes('tunel') || dx.includes('tendin') ||
            dx.includes('epicondil') || dx.includes('cervicalgia') || dx.includes('osteomuscular') || dx.includes('dme');
        }),
      },
      psicosocial: {
        ...SVE_PROGRAMS[1],
        pacientes: classify(null, (p) => !!p.riesgoPsicosocial || (p.conceptoAptitud || '').toLowerCase().includes('psicosocial')),
      },
      visual: {
        ...SVE_PROGRAMS[2],
        pacientes: classify(null, (p) => {
          const dx = [p.diagnostico1, p.diagnostico2, p.diagnostico3].filter(Boolean).join(' ').toLowerCase();
          return dx.includes('miopia') || dx.includes('astigma') || dx.includes('presbicia') || dx.includes('ametro') || dx.includes('visual');
        }),
      },
      auditivo: {
        ...SVE_PROGRAMS[3],
        pacientes: classify(null, (p) => {
          const dx = [p.diagnostico1, p.diagnostico2, p.diagnostico3].filter(Boolean).join(' ').toLowerCase();
          return dx.includes('hipoacusia') || dx.includes('auditiv') || !!p.riesgoFisico || dx.includes('hnir');
        }),
      },
      respiratorio: {
        ...SVE_PROGRAMS[4],
        pacientes: classify(null, (p) => {
          const dx = [p.diagnostico1, p.diagnostico2, p.diagnostico3].filter(Boolean).join(' ').toLowerCase();
          return dx.includes('asma') || dx.includes('rinitis') || dx.includes('neumoconiosis') || dx.includes('respiratorio') || dx.includes('alergico');
        }),
      },
      neurologico: {
        ...SVE_PROGRAMS[5],
        pacientes: classify(null, (p) => {
          const dx = [p.diagnostico1, p.diagnostico2, p.diagnostico3].filter(Boolean).join(' ').toLowerCase();
          return dx.includes('neuro') || dx.includes('ictus') || dx.includes('meningitis') || dx.includes('sindrome') || dx.includes('epilep');
        }),
      },
      dermatologico: {
        ...SVE_PROGRAMS[6],
        pacientes: classify(null, (p) => {
          const dx = [p.diagnostico1, p.diagnostico2, p.diagnostico3].filter(Boolean).join(' ').toLowerCase();
          return dx.includes('dermat') || dx.includes('dermatitis') || dx.includes('eczema') || dx.includes('alergia cutanea') || dx.includes('derm');
        }),
      },
    };
  }, [patients]);

  const current = programs[activeProgram];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
        <Activity className="w-5 h-5 text-purple-600" /> Programas SVE
      </h2>

      {/* Program tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {Object.entries(programs).map(([key, prog]) => (
          <button key={key} onClick={() => setActiveProgram(key)}
            className={`px-3 py-2 text-[10px] font-black rounded-xl whitespace-nowrap transition flex items-center gap-1 ${
              activeProgram === key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <span>{prog.icon}</span>
            {prog.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${
              activeProgram === key ? 'bg-white/25' : 'bg-gray-200'
            }`}>{prog.patients.length}</span>
          </button>
        ))}
      </div>

      {/* Active program detail */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-purple-800">{current.icon} {current.label}</h3>
            <p className="text-[10px] text-purple-600">{current.norm}</p>
          </div>
          <span className="text-lg font-black text-purple-700">{current.patients.length} trabajadores</span>
        </div>

        {current.patients.length > 0 ? (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {current.patients.map((p) => (
              <div key={p.id} className="bg-white rounded-lg p-2 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-800">{p.nombres}</p>
                  <p className="text-[10px] text-gray-500">{p.cargo || '--'} · {p.empresaNombre || '--'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-600">{p.diagnostico1 || '--'}</p>
                  <p className="text-[9px] text-gray-400">{p.fechaExamen || '--'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-purple-400 italic text-center py-4">
            No hay trabajadores identificados para este programa SVE
          </p>
        )}
      </div>

      {/* SVE recommendations */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-700">
        <p className="font-black">📋 Res. 0312/2019 - Estándares mínimos SG-SST</p>
        <p className="mt-1">
          Los programas SVE deben incluir: vigilancia activa, seguimiento periódico,
          intervenciones preventivas, indicadores de gestión y evaluación de efectividad.
        </p>
      </div>
    </div>
  );
};
