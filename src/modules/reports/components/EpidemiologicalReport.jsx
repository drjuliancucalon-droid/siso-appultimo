import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, AlertTriangle, Download } from 'lucide-react';

/**
 * EpidemiologicalReport - Dashboard epidemiológico
 * Análisis de morbilidad ocupacional, distribución por diagnósticos
 */
export const EpidemiologicalReport = ({ patients = [], companies = [], selectedCompanyId }) => {
  const filteredPatients = useMemo(() => {
    if (!selectedCompanyId || selectedCompanyId === 'todas') return patients;
    return patients.filter((p) => p.empresaId === selectedCompanyId);
  }, [patients, selectedCompanyId]);

  const stats = useMemo(() => {
    const total = filteredPatients.length;
    if (total === 0) return null;

    // Age distribution
    const ageRanges = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
    // Gender
    const genderCount = { Masculino: 0, Femenino: 0, Otro: 0 };
    // IMC
    const imcRanges = { 'Bajo peso': 0, Normal: 0, Sobrepeso: 0, Obesidad: 0 };
    // TA
    const taCount = { Normal: 0, Elevada: 0, 'HTA 1': 0, 'HTA 2': 0 };
    // Concepts
    const conceptos = {};
    // Diagnoses
    const dxCount = {};
    // Monthly
    const monthly = {};

    filteredPatients.forEach((p) => {
      // Age
      const age = parseInt(p.edad) || 0;
      if (age <= 25) ageRanges['18-25']++;
      else if (age <= 35) ageRanges['26-35']++;
      else if (age <= 45) ageRanges['36-45']++;
      else if (age <= 55) ageRanges['46-55']++;
      else ageRanges['56+']++;

      // Gender
      genderCount[p.genero || 'Otro'] = (genderCount[p.genero || 'Otro'] || 0) + 1;

      // IMC
      const imc = parseFloat(p.imc) || 0;
      if (imc < 18.5) imcRanges['Bajo peso']++;
      else if (imc < 25) imcRanges.Normal++;
      else if (imc < 30) imcRanges.Sobrepeso++;
      else imcRanges.Obesidad++;

      // TA
      const [sys] = (p.tensionArterial || '').split('/').map(Number);
      if (sys >= 140) taCount['HTA 2']++;
      else if (sys >= 130) taCount['HTA 1']++;
      else if (sys >= 120) taCount.Elevada++;
      else if (sys > 0) taCount.Normal++;

      // Concept
      const c = p.conceptoAptitud || 'Pendiente';
      conceptos[c] = (conceptos[c] || 0) + 1;

      // Diagnoses
      [p.diagnostico1, p.diagnostico2, p.diagnostico3].filter(Boolean).forEach((dx) => {
        const code = dx.split(' ')[0] || dx;
        dxCount[code] = (dxCount[code] || 0) + 1;
      });

      // Monthly
      const m = (p.fechaExamen || '').substring(0, 7);
      if (m) monthly[m] = (monthly[m] || 0) + 1;
    });

    const topDx = Object.entries(dxCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return { total, ageRanges, genderCount, imcRanges, taCount, conceptos, topDx, monthly };
  }, [filteredPatients]);

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-400">
        <BarChart3 className="w-16 h-16 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-bold">No hay datos para el reporte epidemiológico</p>
      </div>
    );
  }

  const BarChart = ({ data, color = 'emerald', maxWidth = 200 }) => {
    const max = Math.max(...Object.values(data), 1);
    return (
      <div className="space-y-1">
        {Object.entries(data).map(([label, value]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600 w-20 text-right truncate">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden" style={{ maxWidth }}>
              <div className={`bg-${color}-500 h-full rounded-full transition-all`}
                style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <span className="text-[10px] font-bold text-gray-700 w-8">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" /> Reporte Epidemiológico
        </h2>
        <span className="text-xs font-bold text-gray-500">{stats.total} evaluados</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(stats.conceptos).map(([concepto, count]) => {
          const pct = ((count / stats.total) * 100).toFixed(1);
          const color =
            concepto.toLowerCase().includes('no apto') ? 'bg-red-50 border-red-200 text-red-800' :
            concepto.toLowerCase().includes('restricc') ? 'bg-amber-50 border-amber-200 text-amber-800' :
            concepto.toLowerCase().includes('apto') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            'bg-gray-50 border-gray-200 text-gray-600';
          return (
            <div key={concepto} className={`border rounded-xl p-3 ${color}`}>
              <p className="text-[10px] font-black uppercase truncate">{concepto}</p>
              <p className="text-xl font-black">{count} <span className="text-xs font-normal">({pct}%)</span></p>
            </div>
          );
        })}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-black text-gray-700 mb-2">Distribución por edad</p>
          <BarChart data={stats.ageRanges} color="blue" />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-black text-gray-700 mb-2">Clasificación IMC</p>
          <BarChart data={stats.imcRanges} color="amber" />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-black text-gray-700 mb-2">Tensión Arterial</p>
          <BarChart data={stats.taCount} color="red" />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-black text-gray-700 mb-2">Diagnósticos más frecuentes</p>
          <div className="space-y-1">
            {stats.topDx.map(([dx, count], i) => (
              <div key={dx} className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 w-4">{i + 1}</span>
                <span className="text-[10px] text-gray-700 flex-1 truncate">{dx}</span>
                <span className="text-[10px] font-bold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
