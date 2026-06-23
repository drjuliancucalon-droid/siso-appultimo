import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { d1Get } from '../../../lib/d1Client';
import { Download, FileText, BarChart3, Users, Activity, Briefcase, Calendar, Sparkles, Loader2, AlertCircle, Send, Archive, CheckCircle2, TrendingUp } from 'lucide-react';
import { useAIStore } from '../../../stores/aiStore';
import { analyzeEpidemiologicalData } from '../../ai/services/aiAnalysis';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Barra de porcentaje reutilizable
const PctBar = ({ label, pct }) => (
  <div className="flex items-center gap-2 mb-1.5">
    <span className="text-[11px] text-gray-600 w-36 truncate">{label}</span>
    <div className="flex-1 bg-gray-100 rounded-full h-2">
      <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: pct || '0%' }} />
    </div>
    <span className="text-[11px] font-bold text-gray-700 w-10 text-right">{pct}</span>
  </div>
);

export default function ReportsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  const [patients, setPatients] = useState(() => {
    try {
      const stored = localStorage.getItem(`siso_patients_${currentUser?.user}`);
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return [];
  });

  const [companies, setCompanies] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // SIEMPRE cargar desde D1 (localStorage solo es caché inicial)
  useEffect(() => {
    if (!currentUser?.user) return;
    d1Get(`siso_patients_${currentUser.user}`)
      .then(({ value }) => {
        if (Array.isArray(value) && value.length > 0) {
          setPatients(value);
          try { localStorage.setItem(`siso_patients_${currentUser.user}`, JSON.stringify(value)); } catch (_) {}
        }
      })
      .catch(() => {});
    d1Get(`siso_companies_${currentUser.user}`)
      .then(({ value }) => { if (Array.isArray(value)) setCompanies(value); })
      .catch(() => {
        try {
          const raw = localStorage.getItem(`siso_companies_${currentUser.user}`);
          if (raw) setCompanies(JSON.parse(raw));
        } catch (_) {}
      });
    d1Get('siso_users')
      .then(({ value }) => { if (Array.isArray(value)) setUsersList(value); })
      .catch(() => {});
  }, [currentUser?.user]);

  const [reportType, setReportType] = useState('resumen');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterMedico, setFilterMedico] = useState('');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');
  const [modoPrecio, setModoPrecio] = useState('unico');
  const [precioUnico, setPrecioUnico] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [iaResult, setIaResult] = useState('');
  const [iaError, setIaError] = useState('');
  const [emitidoInfo, setEmitidoInfo] = useState(null);

  useEffect(() => {
    if (!filterEmpresa) { setEmitidoInfo(null); return; }
    const empMatch = patients.find(p => p.empresa?.toLowerCase() === filterEmpresa.toLowerCase());
    if (!empMatch) return;
    const nit = empMatch.empresaNit || empMatch.nit || '';
    if (!nit) return;
    d1Get(`siso_portal_empresa_atenciones_${nit}`)
      .then(({ value }) => {
        if (Array.isArray(value) && value.length > 0) {
          const ultimo = value.reduce((max, v) =>
            new Date(v.fecha || 0) > new Date(max.fecha || 0) ? v : max, value[0]);
          setEmitidoInfo({ fecha: ultimo.fecha || '', count: value.length, nit });
        } else setEmitidoInfo(null);
      })
      .catch(() => setEmitidoInfo(null));
  }, [filterEmpresa, patients]);

  const medicos = useMemo(() =>
    usersList.filter(u => ['medico', 'administrador', 'super_admin'].includes(u.role)),
    [usersList]
  );

  // Filtrado Maestro
  const filteredData = useMemo(() => {
    return patients.filter(p => {
      const matchEmpresa = filterEmpresa
        ? p.empresa?.toLowerCase().includes(filterEmpresa.toLowerCase())
        : true;
      const matchMedico = filterMedico
        ? (p.medicoId === filterMedico || p.medicoUser === filterMedico || p.medico === filterMedico)
        : true;
      const fechaExamen = p.fechaExamen || p.fechaCreacion;
      const matchInicio = filterFechaInicio ? fechaExamen >= filterFechaInicio : true;
      const matchFin = filterFechaFin ? fechaExamen <= filterFechaFin : true;
      return matchEmpresa && matchMedico && matchInicio && matchFin;
    });
  }, [patients, filterEmpresa, filterMedico, filterFechaInicio, filterFechaFin]);

  const handleDescargarZip = useCallback(async () => {
    if (filteredData.length === 0) { alert('No hay certificados con los filtros actuales.'); return; }
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      filteredData.forEach((p, i) => {
        const content = [
          'SISO OcupaSalud — Certificado de Aptitud',
          `Paciente: ${p.nombreCompleto || '—'}`,
          `Documento: ${p.docNumero || '—'}`,
          `Empresa: ${p.empresa || '—'}`,
          `Tipo: ${p.tipoExamen || '—'}`,
          `Concepto: ${p.conceptoAptitud || '—'}`,
          `Fecha: ${p.fechaExamen || '—'}`,
        ].join('\n');
        zip.file(`certificado_${i + 1}_${p.docNumero || i}.txt`, content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `certificados_${filterEmpresa || 'todos'}_${new Date().toISOString().slice(0, 10)}.zip`);
    } catch (err) {
      alert('Error generando ZIP: ' + (err.message || 'verifique jszip'));
    }
  }, [filteredData, filterEmpresa]);

  const handleGenerateEpiReport = async () => {
    const { canUse, getConfig } = useAIStore.getState();
    if (!canUse('ia_analisis')) {
      alert('🔒 El análisis IA requiere plan Pro. Ve a Planes para actualizar.');
      return;
    }
    if (filteredData.length === 0) { setIaError('No hay datos para analizar. Ajuste los filtros.'); return; }
    const aiConfig = getConfig();
    if (!useAIStore.getState().hasAnyKey()) {
      alert('⚠️ Configure al menos un proveedor de IA en el panel (⚙️).');
      return;
    }
    setIsGenerating(true); setIaError(''); setIaResult('');
    try {
      const result = await analyzeEpidemiologicalData(filteredData, aiConfig);
      setIaResult(result);
    } catch (err) {
      setIaError('Error IA: ' + (err.message || 'desconocido'));
    } finally {
      setIsGenerating(false);
    }
  };

  // --- CÁLCULOS ---
  const total = filteredData.length;

  const stats = useMemo(() => {
    const aptos = filteredData.filter(p => p.conceptoAptitud?.includes('APTO') && !p.conceptoAptitud.includes('RESTRICCIONES')).length;
    const conRestricciones = filteredData.filter(p => p.conceptoAptitud?.includes('RESTRICCIONES')).length;
    const noAptos = filteredData.filter(p => p.conceptoAptitud?.includes('NO APTO')).length;
    const conHallazgos = filteredData.filter(p => p.hallazgos && Object.keys(p.hallazgos).some(k => p.hallazgos[k])).length;
    const conRiesgos = filteredData.filter(p => Array.isArray(p.riesgosLaborales) && p.riesgosLaborales.length > 0).length;
    const edadPromedio = total > 0
      ? Math.round(filteredData.reduce((s, p) => s + (Number(p.edad) || 0), 0) / total)
      : 0;
    const tasaNoAptos = total > 0 ? ((noAptos / total) * 100).toFixed(1) : '0';
    const porEmpresa = filteredData.reduce((acc, curr) => {
      const emp = curr.empresa || 'Sin Empresa';
      acc[emp] = (acc[emp] || 0) + 1;
      return acc;
    }, {});
    const tendenciaMensual = filteredData.reduce((acc, p) => {
      const mes = (p.fechaExamen || '').slice(0, 7);
      if (mes) acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {});
    return { aptos, conRestricciones, noAptos, conHallazgos, conRiesgos, edadPromedio, tasaNoAptos, porEmpresa, tendenciaMensual };
  }, [filteredData, total]);

  const morbilidadData = useMemo(() => {
    const diagnosticos = {};
    filteredData.forEach(p => {
      if (p.diagnosticoPrincipal) diagnosticos[p.diagnosticoPrincipal] = (diagnosticos[p.diagnosticoPrincipal] || 0) + 1;
      if (p.diagnosticoSecundario1) diagnosticos[p.diagnosticoSecundario1] = (diagnosticos[p.diagnosticoSecundario1] || 0) + 1;
    });
    return Object.entries(diagnosticos).map(([codigo, cantidad]) => ({ codigo, cantidad })).sort((a, b) => b.cantidad - a.cantidad);
  }, [filteredData]);

  const ausentismoData = useMemo(() => {
    let totalDias = 0;
    const casos = [];
    filteredData.forEach(p => {
      if (p.incapacidad?.aplica && p.incapacidad?.dias > 0) {
        totalDias += p.incapacidad.dias;
        casos.push({ paciente: p.nombreCompleto, empresa: p.empresa, dias: p.incapacidad.dias, motivo: p.incapacidad.motivo });
      }
    });
    return { totalDias, casos };
  }, [filteredData]);

  // Perfil Sociodemográfico
  const perfilSocio = useMemo(() => {
    if (total === 0) return null;
    const pct = (n) => `${((n / total) * 100).toFixed(0)}%`;
    const groupBy = (key) => {
      const res = filteredData.reduce((a, p) => {
        const v = p[key] || 'N/D';
        a[v] = (a[v] || 0) + 1;
        return a;
      }, {});
      return Object.entries(res).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, pct: pct(count), count }));
    };
    const edades = { '18-27': 0, '28-37': 0, '38-47': 0, '48-57': 0, '58+': 0 };
    filteredData.forEach(p => {
      const e = Number(p.edad) || 0;
      if (e <= 27) edades['18-27']++;
      else if (e <= 37) edades['28-37']++;
      else if (e <= 47) edades['38-47']++;
      else if (e <= 57) edades['48-57']++;
      else if (e > 0) edades['58+']++;
    });
    return {
      genero: groupBy('genero'),
      rangoEtario: Object.entries(edades).filter(([,v]) => v > 0).map(([k, v]) => ({ label: k, pct: pct(v), count: v })),
      escolaridad: groupBy('escolaridad'),
      estadoCivil: groupBy('estadoCivil'),
      estrato: groupBy('estrato'),
      zona: groupBy('zonaResidencia'),
      etnia: groupBy('grupoEtnico'),
      cargo: groupBy('cargo').slice(0, 5),
      tipoContrato: groupBy('tipoContrato'),
      turno: groupBy('turno'),
      tipoExamen: groupBy('tipoExamen'),
    };
  }, [filteredData, total]);

  // Perfil Clínico
  const perfilClinico = useMemo(() => {
    if (total === 0) return null;
    const pct = (n) => `${((n / total) * 100).toFixed(0)}%`;
    return {
      imc: [
        { label: 'Normal (18.5-24.9)', pct: pct(filteredData.filter(p => { const i = Number(p.imc); return i >= 18.5 && i < 25; }).length) },
        { label: 'Sobrepeso (25-29.9)', pct: pct(filteredData.filter(p => { const i = Number(p.imc); return i >= 25 && i < 30; }).length) },
        { label: 'Obesidad (≥30)', pct: pct(filteredData.filter(p => Number(p.imc) >= 30).length) },
        { label: 'No registrado', pct: pct(filteredData.filter(p => !p.imc).length) },
      ],
      aptitud: [
        { label: 'APTO', pct: pct(filteredData.filter(p => p.conceptoAptitud?.includes('APTO') && !p.conceptoAptitud.includes('RESTRICCIONES')).length) },
        { label: 'CON RESTRICCIONES', pct: pct(filteredData.filter(p => p.conceptoAptitud?.includes('RESTRICCIONES')).length) },
        { label: 'NO APTO', pct: pct(filteredData.filter(p => p.conceptoAptitud?.includes('NO APTO')).length) },
      ],
      top5CIE10: morbilidadData.slice(0, 5),
      conHallazgos: stats.conHallazgos,
      pctHallazgos: pct(stats.conHallazgos),
      conRiesgos: stats.conRiesgos,
      pctRiesgos: pct(stats.conRiesgos),
    };
  }, [filteredData, total, morbilidadData, stats]);

  // Exportaciones
  const handleExportExcel = () => {
    const dataToExport = filteredData.map(p => ({
      Fecha: p.fechaExamen, Paciente: p.nombreCompleto, Documento: p.docNumero,
      Empresa: p.empresa, Cargo: p.cargo, Tipo_Examen: p.tipoExamen,
      Diagnostico_Principal: p.diagnosticoPrincipal, Concepto_Aptitud: p.conceptoAptitud,
      Vigencia_Meses: p.vigencia, ARL: p.arl, Riesgo: p.nivelRiesgo,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `Reporte_SISO_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Paciente', 'Documento', 'Empresa', 'Cargo', 'Tipo Examen', 'Concepto Aptitud', 'Diagnóstico Principal'];
    const rows = filteredData.map(p => [
      p.fechaExamen || '', p.nombreCompleto || '', p.docNumero || '', p.empresa || '',
      p.cargo || '', p.tipoExamen || '', p.conceptoAptitud || '', p.diagnosticoPrincipal || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`));
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `reporte_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-indigo-600" size={22} /> Reportes y Estadísticas
          </h1>
          <p className="text-xs text-gray-500">Diagnóstico de Condiciones de Salud · {total} evaluados</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleGenerateEpiReport}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isGenerating ? 'Analizando...' : 'Generar Análisis IA'}
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-bold">
            <Download size={14} /> Excel
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-xs font-bold">
            <FileText size={14} /> CSV
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs font-bold">
            🖨️ Imprimir
          </button>
          {filterEmpresa && (
            <button
              onClick={() => {
                const emp = patients.find(p => p.empresa?.toLowerCase() === filterEmpresa.toLowerCase());
                const nit = emp?.empresaNit || emp?.nit || '';
                navigate(`/portal-certificados${nit ? `?nit=${nit}` : ''}`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-bold"
            >
              <Send size={14} /> Enviar TODO
            </button>
          )}
          {emitidoInfo && (
            <div className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold">
              <CheckCircle2 size={12} className="text-blue-500" />
              Emitido{emitidoInfo.fecha && <span className="ml-1">{new Date(emitidoInfo.fecha).toLocaleDateString('es-CO')}</span>}
              <span className="bg-blue-200 text-blue-800 px-1 py-0.5 rounded-full ml-1">{emitidoInfo.count}</span>
            </div>
          )}
          <button onClick={handleDescargarZip} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-bold">
            <Archive size={14} /> ZIP
          </button>
        </div>
      </div>

      {/* Módulo de precios */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-black text-amber-800">💰 Modo precio:</span>
        {[['unico', '🔵 Precio único'], ['individual', '👤 Individual'], ['fecha', '📅 Por fecha']].map(([m, l]) => (
          <button key={m} onClick={() => setModoPrecio(m)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${modoPrecio === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
            {l}
          </button>
        ))}
        {modoPrecio === 'unico' && (
          <input type="number" placeholder="$ por paciente" value={precioUnico}
            onChange={e => setPrecioUnico(e.target.value)}
            className="border rounded p-1 text-[10px] w-32 bg-white" />
        )}
        <span className="text-[9px] text-gray-400 ml-auto">⚠ Res.1843/2025 Art.19</span>
      </div>

      {/* IA Result */}
      {iaError && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-xs text-red-800">
          <AlertCircle size={16} /> {iaError}
        </div>
      )}
      {iaResult && (
        <div className="mb-3 bg-white border border-indigo-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-indigo-600" />
            <h3 className="text-xs font-black text-indigo-800">Análisis IA</h3>
          </div>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{iaResult}</pre>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-3 rounded-lg shadow-sm mb-3 grid grid-cols-2 md:grid-cols-5 gap-2">
        <div>
          <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Empresa</label>
          <select className="w-full p-1.5 border rounded text-xs" value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)}>
            <option value="">-- Todas --</option>
            {companies.length > 0
              ? companies.map((c, i) => (
                  <option key={c.nit || c.id || i} value={c.nombre}>{c.nombre}</option>
                ))
              : [...new Set(patients.map(p => p.empresa).filter(Boolean))].sort().map((emp, i) => (
                  <option key={i} value={emp}>{emp}</option>
                ))
            }
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Médico</label>
          <select className="w-full p-1.5 border rounded text-xs" value={filterMedico} onChange={e => setFilterMedico(e.target.value)}>
            <option value="">👨‍⚕️ Todos</option>
            {medicos.map(m => <option key={m.user} value={m.user}>{m.name || m.user}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Desde</label>
          <input type="date" className="w-full p-1.5 border rounded text-xs" value={filterFechaInicio} onChange={e => setFilterFechaInicio(e.target.value)} />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Hasta</label>
          <input type="date" className="w-full p-1.5 border rounded text-xs" value={filterFechaFin} onChange={e => setFilterFechaFin(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button onClick={() => { setFilterEmpresa(''); setFilterMedico(''); setFilterFechaInicio(''); setFilterFechaFin(''); }}
            className="w-full py-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-xs font-bold">
            Limpiar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-3">
        {[
          { label: 'Total', val: total, bg: 'bg-blue-50', text: 'text-blue-900', sub: 'text-blue-600' },
          { label: 'Aptos', val: stats.aptos, bg: 'bg-green-50', text: 'text-green-900', sub: 'text-green-600' },
          { label: 'Con Restricc.', val: stats.conRestricciones, bg: 'bg-yellow-50', text: 'text-yellow-900', sub: 'text-yellow-600' },
          { label: 'No Aptos', val: stats.noAptos, bg: 'bg-red-50', text: 'text-red-900', sub: 'text-red-600' },
          { label: 'Con Hallazgos', val: stats.conHallazgos, bg: 'bg-orange-50', text: 'text-orange-900', sub: 'text-orange-600' },
          { label: 'Con Riesgos', val: stats.conRiesgos, bg: 'bg-purple-50', text: 'text-purple-900', sub: 'text-purple-600' },
          { label: 'Edad Prom.', val: `${stats.edadPromedio}a`, bg: 'bg-indigo-50', text: 'text-indigo-900', sub: 'text-indigo-600' },
          { label: 'Tasa No Apt.', val: `${stats.tasaNoAptos}%`, bg: 'bg-pink-50', text: 'text-pink-900', sub: 'text-pink-600' },
        ].map(({ label, val, bg, text, sub }) => (
          <div key={label} className={`${bg} rounded-lg p-2.5 border border-opacity-20`}>
            <div className={`text-[9px] ${sub} font-bold uppercase truncate`}>{label}</div>
            <div className={`text-lg font-black ${text}`}>{val}</div>
          </div>
        ))}
      </div>

      {/* Tendencia Mensual */}
      {Object.keys(stats.tendenciaMensual).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <h3 className="text-xs font-black text-gray-700 mb-2 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-indigo-600" /> 📈 Tendencia Mensual
          </h3>
          <div className="flex items-end gap-1 h-20">
            {Object.entries(stats.tendenciaMensual).sort().map(([mes, cnt]) => {
              const maxVal = Math.max(...Object.values(stats.tendenciaMensual));
              const h = maxVal > 0 ? Math.max(4, Math.round((cnt / maxVal) * 64)) : 4;
              return (
                <div key={mes} className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
                  <span className="text-[8px] font-bold text-indigo-700">{cnt}</span>
                  <div className="w-full bg-indigo-500 rounded-t-sm" style={{ height: `${h}px` }} />
                  <span className="text-[7px] text-gray-400 truncate w-full text-center">{mes.slice(5)}/{mes.slice(2, 4)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TOP 5 CIE-10 */}
      {morbilidadData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <h3 className="text-xs font-black text-gray-700 mb-2">🏆 TOP 5 DIAGNÓSTICOS (CIE-10)</h3>
          <div className="space-y-1">
            {morbilidadData.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="text-xs text-gray-700 flex-1 truncate">{item.codigo}</span>
                <span className="text-xs font-bold text-indigo-600">{item.cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-3 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'resumen', label: 'Resumen', icon: FileText },
          { id: 'diagnostico', label: '📊 Diagnóstico', icon: BarChart3 },
          { id: 'morbilidad', label: 'Morbilidad', icon: Activity },
          { id: 'ausentismo', label: 'Ausentismo', icon: Calendar },
          { id: 'empresas', label: 'Por Empresa', icon: Briefcase },
          { id: 'marcolegal', label: '⚖️ Marco Legal', icon: TrendingUp },
        ].map(tab => (
          <button key={tab.id} onClick={() => setReportType(tab.id)}
            className={`flex items-center gap-1 px-3 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              reportType === tab.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 min-h-[300px]">

        {/* RESUMEN EJECUTIVO */}
        {reportType === 'resumen' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-[10px]">
                <tr>
                  {['Fecha', 'Paciente', 'Empresa', 'Tipo', 'Concepto', 'Diagnóstico'].map(h => (
                    <th key={h} className="p-2 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 20).map((p, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2">{formatDate(p.fechaExamen)}</td>
                    <td className="p-2 font-medium">{p.nombreCompleto}</td>
                    <td className="p-2 text-gray-600 truncate max-w-[120px]">{p.empresa}</td>
                    <td className="p-2"><span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">{p.tipoExamen}</span></td>
                    <td className={`p-2 font-bold ${p.conceptoAptitud?.includes('NO') ? 'text-red-600' : 'text-green-600'}`}>
                      {(p.conceptoAptitud || '').slice(0, 20)}{(p.conceptoAptitud || '').length > 20 ? '…' : ''}
                    </td>
                    <td className="p-2 text-gray-500">{p.diagnosticoPrincipal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {total === 0 && <p className="text-center py-8 text-gray-400 text-sm">No hay datos con los filtros actuales.</p>}
            {total > 20 && <p className="text-center py-2 text-gray-400 text-[10px]">Mostrando 20 de {total}. Exporte para ver todos.</p>}
          </div>
        )}

        {/* DIAGNÓSTICO */}
        {reportType === 'diagnostico' && (
          <div>
            <p className="text-[9px] text-gray-400 mb-4">⚠ Res.1843/2025 Art.19 - Confidencial · {total} trabajadores evaluados</p>
            {!perfilSocio
              ? <p className="text-center py-8 text-gray-400 text-sm">Aplique filtros para ver el diagnóstico.</p>
              : (
                <>
                  <h3 className="font-black text-gray-800 mb-3 text-xs uppercase tracking-wider border-b pb-1.5">
                    1. PERFIL SOCIODEMOGRÁFICO Y OCUPACIONAL
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[
                      { title: 'GÉNERO', data: perfilSocio.genero },
                      { title: 'RANGO ETARIO', data: perfilSocio.rangoEtario },
                      { title: 'ESCOLARIDAD', data: perfilSocio.escolaridad },
                      { title: 'ESTADO CIVIL', data: perfilSocio.estadoCivil },
                      { title: 'ESTRATO', data: perfilSocio.estrato },
                      { title: 'ZONA RESIDENCIA', data: perfilSocio.zona },
                      { title: 'GRUPO ÉTNICO', data: perfilSocio.etnia },
                      { title: 'CARGO/PUESTO (TOP 5)', data: perfilSocio.cargo },
                      { title: 'TIPO CONTRATO', data: perfilSocio.tipoContrato },
                      { title: 'TURNO', data: perfilSocio.turno },
                      { title: 'TIPO EXAMEN', data: perfilSocio.tipoExamen },
                    ].map(({ title, data }) => (
                      <div key={title} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider mb-2">{title}</p>
                        {(data || []).filter(d => d.count > 0).slice(0, 6).map((item, i) => (
                          <PctBar key={i} label={item.label} pct={item.pct} />
                        ))}
                      </div>
                    ))}
                  </div>

                  <h3 className="font-black text-gray-800 mb-3 text-xs uppercase tracking-wider border-b pb-1.5">
                    2. PERFIL CLÍNICO Y DE SALUD
                  </h3>
                  {perfilClinico && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider mb-2">IMC</p>
                        {perfilClinico.imc.map((item, i) => <PctBar key={i} label={item.label} pct={item.pct} />)}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider mb-2">CONCEPTO APTITUD</p>
                        {perfilClinico.aptitud.map((item, i) => <PctBar key={i} label={item.label} pct={item.pct} />)}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider mb-2">TOP DIAGNÓSTICOS CIE-10</p>
                        {perfilClinico.top5CIE10.map((item, i) => (
                          <div key={i} className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-gray-600 flex-1 truncate">{item.codigo}</span>
                            <span className="text-[10px] font-black text-indigo-700 ml-2">{item.cantidad}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-[9px] font-black text-orange-700 uppercase tracking-wider mb-1">HALLAZGOS FÍSICOS</p>
                        <p className="text-2xl font-black text-orange-800">{perfilClinico.conHallazgos}</p>
                        <p className="text-[10px] text-orange-600">{perfilClinico.pctHallazgos} del total</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3">
                        <p className="text-[9px] font-black text-purple-700 uppercase tracking-wider mb-1">RIESGOS ACTIVOS</p>
                        <p className="text-2xl font-black text-purple-800">{perfilClinico.conRiesgos}</p>
                        <p className="text-[10px] text-purple-600">{perfilClinico.pctRiesgos} del total</p>
                      </div>
                    </div>
                  )}

                  {iaResult && (
                    <div>
                      <h3 className="font-black text-gray-800 mb-2 text-xs uppercase tracking-wider border-b pb-1.5">
                        3. ANÁLISIS INTELIGENTE IA
                      </h3>
                      <div className="bg-indigo-50 rounded-xl p-4">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{iaResult}</pre>
                      </div>
                    </div>
                  )}
                  {!iaResult && (
                    <div className="text-center py-4">
                      <button onClick={handleGenerateEpiReport} disabled={isGenerating}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold mx-auto disabled:opacity-50">
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {isGenerating ? 'Generando análisis IA...' : 'Generar Análisis IA del Diagnóstico'}
                      </button>
                    </div>
                  )}
                </>
              )
            }
          </div>
        )}

        {/* MORBILIDAD */}
        {reportType === 'morbilidad' && (
          <div>
            <h3 className="font-bold text-gray-700 mb-3 text-sm">Top Diagnósticos (CIE-10)</h3>
            <div className="space-y-2.5">
              {morbilidadData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="font-bold text-gray-800 text-xs">{item.codigo}</span>
                      <span className="text-xs text-gray-500">{item.cantidad} casos</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.min((item.cantidad / (total || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {morbilidadData.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No hay diagnósticos registrados.</p>}
            </div>
          </div>
        )}

        {/* AUSENTISMO */}
        {reportType === 'ausentismo' && (
          <div>
            <div className="p-4 bg-orange-50 rounded-lg mb-4 border border-orange-200 inline-block">
              <div className="text-xs text-orange-700 font-bold">Total Días de Incapacidad</div>
              <div className="text-3xl font-black text-orange-900">{ausentismoData.totalDias} días</div>
            </div>
            {ausentismoData.casos.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Paciente</th><th className="p-2">Empresa</th>
                    <th className="p-2">Motivo</th><th className="p-2 text-right">Días</th>
                  </tr>
                </thead>
                <tbody>
                  {ausentismoData.casos.map((c, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 font-medium">{c.paciente}</td>
                      <td className="p-2 text-gray-600">{c.empresa}</td>
                      <td className="p-2 text-gray-500">{c.motivo}</td>
                      <td className="p-2 text-right font-bold text-red-600">{c.dias}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-center py-8 text-gray-400 text-sm">No se registraron incapacidades en este periodo.</p>}
          </div>
        )}

        {/* POR EMPRESA */}
        {reportType === 'empresas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.porEmpresa).sort((a, b) => b[1] - a[1]).map(([emp, count]) => (
              <div key={emp} className="p-4 border rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => { setFilterEmpresa(emp); setReportType('diagnostico'); }}>
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="text-gray-400" size={16} />
                  <h4 className="font-bold text-gray-800 truncate text-sm">{emp}</h4>
                </div>
                <div className="text-3xl font-bold text-indigo-600">{count}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">trabajadores evaluados</div>
                <div className="mt-3 w-full py-1.5 text-[10px] bg-indigo-50 text-indigo-700 rounded text-center font-bold">
                  Ver Diagnóstico →
                </div>
              </div>
            ))}
            {Object.keys(stats.porEmpresa).length === 0 && (
                            <p className="col-span-full text-center py-8 text-gray-400 text-sm">No hay datos agrupados por empresa.</p>
            )}
          </div>
        )}

        {/* MARCO LEGAL */}
        {reportType === 'marcolegal' && (
          <div>
            <p className="text-[9px] text-gray-400 mb-4">Marco normativo SST aplicable · Res. 1843/2025 · Dec. 1072/2015</p>

            <div className="mb-5">
              <h3 className="text-xs font-black text-gray-800 uppercase mb-3 border-b pb-1.5">📋 Normativa SST Aplicable</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { norma: 'Resolución 1843/2025', desc: 'Evaluaciones médicas ocupacionales. Norma vigente. Deroga Res. 2346/2007 y 1918/2009.', color: 'indigo' },
                  { norma: 'Decreto 1072/2015 Art. 2.2.4.6', desc: 'Obligaciones del empleador en el Sistema de Gestión SST. Exámenes obligatorios.', color: 'blue' },
                  { norma: 'Resolución 0312/2019', desc: 'Estándares mínimos del SG-SST. Tabla de valores límite para evaluaciones periódicas.', color: 'teal' },
                  { norma: 'Ley 1562/2012', desc: 'Sistema General de Riesgos Laborales. Define enfermedad laboral y accidente de trabajo.', color: 'purple' },
                  { norma: 'Decreto 1477/2014', desc: 'Tabla de enfermedades laborales. Lista de agentes de riesgo y enfermedades.', color: 'rose' },
                  { norma: 'Resolución 2400/1979', desc: 'Estatuto de Seguridad Industrial. Higiene industrial y ergonomía.', color: 'amber' },
                  { norma: 'Ley 527/1999 + Decreto 2364/2012', desc: 'Validez jurídica de documentos y firmas electrónicas. Base legal del certificado digital.', color: 'emerald' },
                  { norma: 'Resolución 1918/2009 (derogada)', desc: 'Referencia histórica para registros anteriores a abril 2025.', color: 'gray' },
                ].map(({ norma, desc, color }) => (
                  <div key={norma} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-3`}>
                    <p className={`text-[10px] font-black text-${color}-800 mb-1`}>{norma}</p>
                    <p className={`text-[10px] text-${color}-700 leading-relaxed`}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {morbilidadData.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-black text-gray-800 uppercase mb-3 border-b pb-1.5">⚖️ Matriz Legal — Diagnósticos Detectados</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="bg-indigo-50 text-indigo-800 uppercase text-[9px]">
                        <th className="p-2 font-black border border-indigo-100">#</th>
                        <th className="p-2 font-black border border-indigo-100">CIE-10</th>
                        <th className="p-2 font-black border border-indigo-100">Casos</th>
                        <th className="p-2 font-black border border-indigo-100">Normativa</th>
                        <th className="p-2 font-black border border-indigo-100">Obligación Empleador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {morbilidadData.slice(0, 10).map((item, i) => {
                        const cie = (item.codigo || '').toUpperCase();
                        let norma = 'Dec. 1477/2014';
                        let obligacion = 'Vigilancia epidemiológica activa';
                        if (cie.startsWith('M') || cie.startsWith('G54') || cie.startsWith('G56')) {
                          norma = 'GTC-45 · Dec.1477/2014';
                          obligacion = 'Programa prevención DME obligatorio';
                        } else if (cie.startsWith('H8') || cie.startsWith('H9')) {
                          norma = 'Res.8321/1983 · Dec.1477/2014';
                          obligacion = 'Audiometría periódica + EPP auditivo';
                        } else if (cie.startsWith('J') || cie.startsWith('Z57')) {
                          norma = 'Res.1843/2025 Art.10';
                          obligacion = 'Espirometría periódica obligatoria';
                        } else if (cie.startsWith('F') || cie.startsWith('Z73')) {
                          norma = 'Res.2404/2019';
                          obligacion = 'Batería riesgo psicosocial obligatoria';
                        } else if (cie.startsWith('E1')) {
                          norma = 'Res.0312/2019';
                          obligacion = 'Control metabólico + restricciones laborales';
                        }
                        return (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-2 border border-gray-100 font-bold text-indigo-600">{i + 1}</td>
                            <td className="p-2 border border-gray-100 font-medium">{item.codigo}</td>
                            <td className="p-2 border border-gray-100 text-center font-black">{item.cantidad}</td>
                            <td className="p-2 border border-gray-100 text-gray-600">{norma}</td>
                            <td className="p-2 border border-gray-100 text-gray-700">{obligacion}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-black text-gray-800 uppercase mb-3 border-b pb-1.5">🗂️ Obligaciones por Tipo de Examen (Res. 1843/2025)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { tipo: 'INGRESO', color: 'emerald', items: ['Antes de iniciar contrato', 'Determinar aptitud para el cargo', 'Identificar condiciones preexistentes', 'Historia clínica ocupacional (Art. 8)'] },
                  { tipo: 'PERIÓDICO', color: 'blue', items: ['Según riesgo del cargo (mínimo anual nivel III-V)', 'Detectar cambios estado de salud', 'Monitorear exposición a riesgos', 'Bloque ≥3 trabajadores: informe + carta custodia'] },
                  { tipo: 'EGRESO / RETIRO', color: 'orange', items: ['Al finalizar vínculo laboral', 'Identificar daños a la salud por trabajo', 'Dentro de los 5 días hábiles del retiro (Art. 12)', 'Base para reclamaciones de EL'] },
                ].map(({ tipo, color, items }) => (
                  <div key={tipo} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-3`}>
                    <p className={`text-[10px] font-black text-${color}-800 uppercase mb-2`}>{tipo}</p>
                    <ul className="space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className={`text-[10px] text-${color}-700 flex items-start gap-1`}>
                          <span className="mt-0.5 flex-shrink-0">·</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
