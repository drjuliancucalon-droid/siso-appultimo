// src/pages/Reporte.jsx
// ═══════════════════════════════════════════════════════════════════════
// REPORTES EPIDEMIOLÓGICOS — Diagnóstico de condiciones de salud,
// estadísticas por empresa, tendencia, top diagnósticos, SVE, RIPS/FHIR
// ═══════════════════════════════════════════════════════════════════════
import React, { useState, useMemo, useCallback } from 'react';
import { BarChart3, Printer } from 'lucide-react';

export default function Reporte({
  currentUser,
  goTo,
  patientsList = [],
  companies = [],
  atencionesCerradas = [],
}) {
  const showAlert = useCallback((msg) => window.alert(msg), []);

  const [selectedCompany, setSelectedCompany] = useState('');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportTab, setReportTab] = useState('estadisticas');

  // Filter patients by company and date range
  const filtered = useMemo(() => {
    if (!selectedCompany) return [];
    return patientsList.filter(p =>
      p.empresaId === selectedCompany &&
      p.fechaExamen &&
      (reportStartDate ? p.fechaExamen >= reportStartDate : true) &&
      (reportEndDate ? p.fechaExamen <= reportEndDate : true)
    );
  }, [patientsList, selectedCompany, reportStartDate, reportEndDate]);

  const total = filtered.length;
  const compName = companies.find(c => c.id === selectedCompany)?.nombre || 'Empresa';

  // Stats helpers
  const countBy = (list, fn) => list.reduce((acc, p) => { const k = fn(p) || 'N/R'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const getAgeRange = (a) => { const n = parseInt(a); if (isNaN(n)) return 'N/R'; if (n < 28) return '18-27'; if (n < 38) return '28-37'; if (n < 48) return '38-47'; if (n < 58) return '48-57'; return '58+'; };
  const getIMC = (v) => { const b = parseFloat(v); if (isNaN(b)) return 'N/R'; if (b < 18.5) return 'Bajo Peso'; if (b < 25) return 'Normal'; if (b < 30) return 'Sobrepeso'; return 'Obesidad'; };
  const getTA = (v) => { if (!v || !v.includes('/')) return 'N/R'; const [s, d] = v.split('/').map(Number); if (s < 120 && d < 80) return 'Normal'; if (s < 130 && d < 80) return 'Elevada'; if (s < 140 || d < 90) return 'HTA I'; return 'HTA II'; };
  const getSeniority = (v) => { if (!v) return 'N/R'; const n = parseFloat((v.match(/\d+(\.\d+)?/) || [0])[0]); if (!n) return 'N/R'; if (v.toLowerCase().includes('mes') || n < 1) return '<1 año'; if (n <= 3) return '1-3 años'; if (n <= 5) return '3-5 años'; if (n <= 10) return '5-10 años'; return '>10 años'; };

  const stats = useMemo(() => {
    if (total === 0) return null;
    return {
      genero: countBy(filtered, p => p.genero),
      edad: countBy(filtered, p => getAgeRange(p.edad)),
      imc: countBy(filtered, p => getIMC(p.imc)),
      ta: countBy(filtered, p => getTA(p.ta)),
      escolaridad: countBy(filtered, p => p.escolaridad),
      cargo: countBy(filtered, p => p.cargo || 'N/R'),
      tipoExamen: countBy(filtered, p => p.tipoExamen || 'N/R'),
      conceptoAptitud: countBy(filtered, p => p.conceptoAptitud || 'N/R'),
      diagnosticos: countBy(filtered, p => p.diagnosticoPrincipal?.split(' - ')[0] || 'Z10.0'),
      antiguedad: countBy(filtered, p => getSeniority(p.antiguedadEmpresa)),
      topDx: Object.entries(countBy(filtered, p => (p.diagnosticos || [{ descripcion: p.diagnosticoPrincipal }])[0]?.descripcion || 'Sin dx')).sort((a, b) => b[1] - a[1]).slice(0, 10),
      tendenciaMensual: filtered.reduce((acc, p) => { const m = (p.fechaExamen || '').substring(0, 7); if (m) acc[m] = (acc[m] || 0) + 1; return acc; }, {}),
      promedioEdad: Math.round(filtered.reduce((s, p) => s + (parseInt(p.edad) || 0), 0) / filtered.length),
      tasaNoAptos: Math.round((filtered.filter(p => (p.conceptoAptitud || '').toLowerCase().includes('no apto')).length / total) * 100),
      conHallazgos: filtered.filter(p => Object.values(p.examenFisicoSistemas || {}).some(s => s.estado === 'Anormal')).length,
      conRestricciones: filtered.filter(p => p.analisisRestricciones && p.analisisRestricciones.length > 10).length,
      conRiesgos: filtered.filter(p => p.riesgos && Object.values(p.riesgos).some(Boolean)).length,
      fumadores: filtered.filter(p => p.habitos?.fuma === 'Si').length,
      alcohol: filtered.filter(p => p.habitos?.alcohol === 'Si').length,
      deporte: filtered.filter(p => p.habitos?.deporte === 'Si').length,
    };
  }, [filtered, total]);

  // Render stat table
  const StatTable = ({ title, data, color = 'blue' }) => {
    if (!data) return null;
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...entries.map(([, v]) => v), 1);
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`bg-${color}-50 px-3 py-2 border-b border-${color}-100`}>
          <p className={`text-[10px] font-black text-${color}-700 uppercase`}>{title}</p>
        </div>
        <div className="p-3 space-y-1.5">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-700 w-24 truncate font-bold">{k}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className={`bg-${color}-400 h-full rounded-full transition-all`} style={{ width: `${(v / max) * 100}%` }} />
              </div>
              <span className="text-[10px] font-black text-gray-800 w-8 text-right">{v}</span>
              <span className="text-[9px] text-gray-400 w-10 text-right">{total ? Math.round((v / total) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Controls */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3 no-print">
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" className="text-xs border rounded p-1.5" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} />
          <span className="text-gray-400 text-xs">—</span>
          <input type="date" className="text-xs border rounded p-1.5" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} />
          <select className="border rounded p-1.5 text-sm max-w-[200px]" value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
            <option value="">Seleccione empresa...</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
          <Printer className="w-4 h-4" /> Imprimir
        </button>
      </div>

      {!selectedCompany && (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-bold text-gray-600 text-lg">Seleccione una empresa para generar el reporte</p>
          <p className="text-xs mt-2">Use el selector arriba para elegir la empresa y el rango de fechas</p>
        </div>
      )}

      {selectedCompany && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-200 no-print">
            {[
              { k: 'estadisticas', l: '📊 Estadísticas y Diagnóstico' },
              { k: 'certificados', l: '📄 Certificados por empresa' },
            ].map(t => (
              <button key={t.k} onClick={() => setReportTab(t.k)} className={`px-5 py-2.5 text-xs font-black rounded-t-lg border-b-2 transition ${reportTab === t.k ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t.l}
              </button>
            ))}
          </div>

          {/* ESTADÍSTICAS TAB */}
          {reportTab === 'estadisticas' && (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-xl font-black text-blue-900">DIAGNÓSTICO DE CONDICIONES DE SALUD</h1>
                <div className="mt-2 inline-block p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="font-bold text-blue-800 text-lg">{compName}</p>
                  <p className="text-xs text-gray-500 mt-1">Población evaluada: <strong>{total} trabajadores</strong></p>
                </div>
              </div>

              {total === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                  <p className="text-amber-700 font-bold">Sin evaluaciones para esta empresa en el periodo seleccionado.</p>
                </div>
              ) : stats && (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-4 gap-4 mb-6 text-center">
                    {[
                      { l: 'Total evaluados', v: total, c: 'blue' },
                      { l: 'Con hallazgos', v: stats.conHallazgos, c: 'yellow' },
                      { l: 'Con restricciones', v: stats.conRestricciones, c: 'red' },
                      { l: 'Con riesgos activos', v: stats.conRiesgos, c: 'orange' },
                    ].map(s => (
                      <div key={s.l} className={`bg-${s.c}-50 border border-${s.c}-200 rounded-xl p-3`}>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">{s.l}</p>
                        <p className={`text-3xl font-black text-${s.c}-600 mt-1`}>{s.v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Analytics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
                      <p className="text-[10px] font-black text-violet-600 uppercase mb-2">🏆 Top Diagnósticos</p>
                      {stats.topDx.length === 0 ? (
                        <p className="text-xs text-gray-400">Sin datos</p>
                      ) : stats.topDx.map(([dx, n]) => (
                        <div key={dx} className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-700 truncate flex-1">{dx}</span>
                          <span className="text-[10px] font-black text-violet-700 ml-2 bg-violet-100 px-1.5 rounded">{n}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-2">📈 Tendencia Mensual</p>
                      {Object.entries(stats.tendenciaMensual).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([m, n]) => (
                        <div key={m} className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-600">{m}</span>
                          <div className="flex items-center gap-1 flex-1 ml-2">
                            <div className="flex-1 bg-blue-100 rounded-full h-2 overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (n / total) * 100 * 3)}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-blue-700 w-5 text-right">{n}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-3 mt-2 pt-2 border-t border-blue-100">
                        <div className="text-center flex-1">
                          <p className="text-[9px] text-gray-400">Edad prom.</p>
                          <p className="text-xs font-black text-gray-700">{stats.promedioEdad} años</p>
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-[9px] text-gray-400">Tasa No Aptos</p>
                          <p className="text-xs font-black text-red-600">{stats.tasaNoAptos}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estilos de vida */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <p className="text-xs font-black text-green-800 uppercase mb-3">🏃 Estilos de Vida</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-[10px] text-gray-500">🚬 Fumadores</p>
                        <p className="text-lg font-black text-red-600">{stats.fumadores}</p>
                        <p className="text-[10px] text-gray-400">{total ? Math.round(stats.fumadores / total * 100) : 0}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">🍺 Alcohol</p>
                        <p className="text-lg font-black text-amber-600">{stats.alcohol}</p>
                        <p className="text-[10px] text-gray-400">{total ? Math.round(stats.alcohol / total * 100) : 0}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">🏃 Deporte</p>
                        <p className="text-lg font-black text-emerald-600">{stats.deporte}</p>
                        <p className="text-[10px] text-gray-400">{total ? Math.round(stats.deporte / total * 100) : 0}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Stat tables grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <StatTable title="Distribución por Género" data={stats.genero} color="blue" />
                    <StatTable title="Distribución por Edad" data={stats.edad} color="emerald" />
                    <StatTable title="Índice de Masa Corporal" data={stats.imc} color="orange" />
                    <StatTable title="Tensión Arterial" data={stats.ta} color="red" />
                    <StatTable title="Tipo de Examen" data={stats.tipoExamen} color="teal" />
                    <StatTable title="Concepto de Aptitud" data={stats.conceptoAptitud} color="purple" />
                    <StatTable title="Cargo" data={stats.cargo} color="indigo" />
                    <StatTable title="Antigüedad" data={stats.antiguedad} color="amber" />
                  </div>

                  {/* Diagnósticos */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                    <div className="bg-red-50 px-3 py-2 border-b border-red-100">
                      <p className="text-[10px] font-black text-red-700 uppercase">Diagnósticos CIE-10 ({Object.keys(stats.diagnosticos).length} distintos)</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-2 text-left font-black">Código CIE-10</th>
                            <th className="p-2 text-center font-black">N</th>
                            <th className="p-2 text-center font-black">%</th>
                            <th className="p-2 text-left font-black">Distribución</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(stats.diagnosticos).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([dx, n], i) => (
                            <tr key={dx} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="p-2 font-bold">{dx}</td>
                              <td className="p-2 text-center font-black">{n}</td>
                              <td className="p-2 text-center">{Math.round((n / total) * 100)}%</td>
                              <td className="p-2">
                                <div className="bg-gray-200 rounded-full h-2 w-full"><div className="bg-red-400 h-full rounded-full" style={{ width: `${(n / total) * 100}%` }} /></div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SVE / Programas de vigilancia */}
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
                    <p className="text-xs font-black text-teal-800 uppercase mb-3">📋 Programas de Vigilancia Epidemiológica (SVE) - Res. 2346/2007</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { name: 'DME (Desórdenes Músculo-Esqueléticos)', icon: '🦴', count: filtered.filter(p => (p.diagnosticoPrincipal || '').match(/M[0-9]/)).length },
                        { name: 'Cardiovascular', icon: '❤️', count: filtered.filter(p => (p.diagnosticoPrincipal || '').match(/I[0-9]/)).length },
                        { name: 'Respiratorio', icon: '🫁', count: filtered.filter(p => (p.diagnosticoPrincipal || '').match(/J[0-9]/)).length },
                        { name: 'Auditivo', icon: '👂', count: filtered.filter(p => (p.diagnosticoPrincipal || '').match(/H[689][0-9]/)).length },
                        { name: 'Psicosocial', icon: '🧠', count: filtered.filter(p => (p.diagnosticoPrincipal || '').match(/F[0-9]/)).length },
                        { name: 'Visual', icon: '👁️', count: filtered.filter(p => (p.diagnosticoPrincipal || '').match(/H[0-5][0-9]/)).length },
                      ].map(sve => (
                        <div key={sve.name} className="bg-white border border-teal-100 rounded-lg p-3 text-center">
                          <p className="text-2xl mb-1">{sve.icon}</p>
                          <p className="text-[10px] font-black text-teal-700">{sve.name}</p>
                          <p className="text-lg font-black text-teal-900 mt-1">{sve.count}</p>
                          <p className="text-[9px] text-gray-400">{total ? Math.round(sve.count / total * 100) : 0}% de evaluados</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Marco normativo */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-[10px] text-gray-600">
                    <p className="font-black text-gray-800 mb-1">📋 Marco normativo</p>
                    <p>Res. 2346/2007 · Res. 1843/2025 · Res. 0312/2019 · Ley 1562/2012 · Decreto 1072/2015</p>
                    <p className="mt-1">Este reporte cumple con los requisitos del diagnóstico de condiciones de salud exigido por la normativa colombiana de SST. Los datos presentados son confidenciales y de uso exclusivo para el SG-SST de la empresa.</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CERTIFICADOS TAB */}
          {reportTab === 'certificados' && (
            <div>
              <h2 className="text-lg font-black text-gray-800 mb-4">📄 Certificados generados para {compName}</h2>
              {filtered.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400">Sin evaluaciones.</div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        {['Fecha', 'Paciente', 'Documento', 'Cargo', 'Tipo', 'Concepto', 'Estado'].map(h => (
                          <th key={h} className="p-2 text-left font-black">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => (
                        <tr key={p.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2">{p.fechaExamen}</td>
                          <td className="p-2 font-bold">{p.nombres}</td>
                          <td className="p-2">{p.docNumero}</td>
                          <td className="p-2">{p.cargo || '--'}</td>
                          <td className="p-2">{p.tipoExamen || '--'}</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                              (p.conceptoAptitud || '').toLowerCase().includes('no apto') ? 'bg-red-100 text-red-700' :
                              (p.conceptoAptitud || '').toLowerCase().includes('condicion') ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {p.conceptoAptitud || 'Pendiente'}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${p.estadoHistoria === 'Cerrada' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {p.estadoHistoria || 'Abierta'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
