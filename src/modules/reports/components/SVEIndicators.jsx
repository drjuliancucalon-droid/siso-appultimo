import React from 'react';
import { Heart, Wind, Ear, Brain, Activity } from 'lucide-react';

// SVEIndicators - Extraído de renderSVE() del monolito Reporte.jsx
export const SVEIndicators = ({ sveIndicators, filteredPatients }) => {
  const programs = [
    {
      name: 'DME (Desórdenes Musculoesqueléticos)',
      icon: Activity,
      color: 'blue',
      data: sveIndicators.dme,
      desc: 'Dolor osteomuscular, patologías M en CIE-10',
    },
    {
      name: 'Cardiovascular',
      icon: Heart,
      color: 'red',
      data: sveIndicators.cardiovascular,
      desc: 'Tensión arterial ≥ 140 mmHg sistólica',
    },
    {
      name: 'Respiratorio',
      icon: Wind,
      color: 'teal',
      data: sveIndicators.respiratorio,
      desc: 'Espirometría anormal, diagnósticos J en CIE-10',
    },
    {
      name: 'Auditivo',
      icon: Ear,
      color: 'amber',
      data: sveIndicators.auditivo,
      desc: 'Audiometría anormal, hipoacusia, códigos H9x',
    },
    {
      name: 'Psicosocial',
      icon: Brain,
      color: 'purple',
      data: sveIndicators.psicosocial,
      desc: 'Riesgo psicosocial alto/muy alto, diagnósticos F en CIE-10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Indicadores de Sistemas de Vigilancia Epidemiológica
        </p>
        <p className="text-xs text-amber-600 mt-1">
          Basados en Res. 0312/2019 y Decreto 1072/2015. Evaluando {filteredPatients.length} pacientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map(prog => {
          const Icon = prog.icon;
          const pct = parseFloat(prog.data.pct);
          const riskLevel = pct > 20 ? 'alto' : pct > 10 ? 'medio' : 'bajo';
          const riskColor = riskLevel === 'alto' ? 'text-red-600 bg-red-100'
            : riskLevel === 'medio' ? 'text-amber-600 bg-amber-100'
            : 'text-emerald-600 bg-emerald-100';

          return (
            <div key={prog.name} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 bg-${prog.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${prog.color}-600`} />
                  </div>
                  <h4 className="font-black text-sm text-gray-800">{prog.name}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${riskColor}`}>
                  {riskLevel.toUpperCase()}
                </span>
              </div>
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-3xl font-black text-gray-800">{prog.data.count}</p>
                  <p className="text-xs text-gray-500">casos detectados</p>
                </div>
                <div className="flex-1">
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-${prog.color}-500 rounded-full transition-all`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className="text-right text-xs font-black text-gray-600 mt-0.5">{prog.data.pct}%</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">{prog.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

