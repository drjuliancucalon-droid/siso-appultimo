// src/pages/Reporte.jsx
// ═══════════════════════════════════════════════════════════════════════
// REPORTES — Estadísticas, indicadores SVE, exportación RIPS/FHIR,
// certificados batch, generación con IA
// ═══════════════════════════════════════════════════════════════════════
import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart3, Download, FileText, Building2, Calendar, Filter,
  Users, Stethoscope, Brain, Shield, Heart, Eye, Ear,
  Wind, Activity, AlertTriangle, CheckCircle2, TrendingUp,
  PieChart, Printer, RefreshCw, Loader2, FileCheck, Search,
  ChevronDown, ChevronUp, Copy, Star, Zap, ClipboardList,
  DollarSign, Send, FilePlus, Save, Trash2, Briefcase,
} from 'lucide-react';
import { SVEPrograms } from '../modules/reports/components/SVEPrograms';

// ═══════════════════════════════════════════════════════════════════════
// REPORTE COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function Reporte({
  patientsList = [], companies = [], currentUser, aiConfig, savedReports = [], goTo,
  // Report state from App
  selectedCompanyReport, setSelectedCompanyReport,
  reporteActiveTab, setReporteActiveTab,
  certSelected = {}, setCertSelected,
  reportStartDate, setReportStartDate, reportEndDate, setReportEndDate,
  reportAIResult, setReportAIResult,
  isGeneratingReport, setIsGeneratingReport,
  showExportTable, setShowExportTable,
  precioPorPaciente, setPrecioPorPaciente,
  selectedMedicoReport, setSelectedMedicoReport,
  // AI
  callAI, showAlert, showConfirm,
  usersList = [],
  ...rest
}) {
  const [localTab, setLocalTab] = useState(reporteActiveTab || 'estadisticas');

  const activeTab = reporteActiveTab || localTab;
  const setActiveTab = (t) => {
    setLocalTab(t);
    setReporteActiveTab?.(t);
  };

  // ── Filtered patients ───────────────────────────────────────────────
  const filteredPatients = useMemo(() => {
    let list = patientsList.filter(p => p.fechaExamen && !p._archivado);

    if (selectedCompanyReport) {
      const comp = companies.find(c => c.id === selectedCompanyReport || c.nit === selectedCompanyReport);
      if (comp) {
        list = list.filter(p =>
          p.empresaId === comp.id || p.empresaNit === comp.nit ||
          (p.empresaNombre || '').toLowerCase() === (comp.nombre || '').toLowerCase()
        );
      }
    }

    if (reportStartDate) list = list.filter(p => p.fechaExamen >= reportStartDate);
    if (reportEndDate) list = list.filter(p => p.fechaExamen <= reportEndDate);

    return list;
  }, [patientsList, selectedCompanyReport, reportStartDate, reportEndDate, companies]);

  // ── Statistics ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = filteredPatients.length;

    // By tipo examen
    const byTipo = {};
    filteredPatients.forEach(p => {
      const tipo = p.tipoExamen || 'Sin clasificar';
      byTipo[tipo] = (byTipo[tipo] || 0) + 1;
    });

    // By concepto aptitud
    const byConcepto = {};
    filteredPatients.forEach(p => {
      const concepto = p.conceptoAptitud || p.conceptoOcupacional || 'Sin concepto';
      byConcepto[concepto] = (byConcepto[concepto] || 0) + 1;
    });

    // Top 10 CIE-10 diagnosis
    const diagCount = {};
    filteredPatients.forEach(p => {
      const diags = [
        p.diagnostico1, p.diagnostico2, p.diagnostico3,
        p.diagPrincipal, p.cie10Principal,
        ...(p.diagnosticos || []).map(d => d.cie10 || d.descripcion),
      ].filter(Boolean);
      diags.forEach(d => {
        const key = d.trim();
        if (key) diagCount[key] = (diagCount[key] || 0) + 1;
      });
    });
    const topDiag = Object.entries(diagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // By gender
    const byGender = {};
    filteredPatients.forEach(p => {
      const g = p.genero || 'No registrado';
      byGender[g] = (byGender[g] || 0) + 1;
    });

    // By age group
    const byAge = { '< 20': 0, '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60+': 0 };
    filteredPatients.forEach(p => {
      const age = parseInt(p.edad) || 0;
      if (age < 20) byAge['< 20']++;
      else if (age < 30) byAge['20-29']++;
      else if (age < 40) byAge['30-39']++;
      else if (age < 50) byAge['40-49']++;
      else if (age < 60) byAge['50-59']++;
      else byAge['60+']++;
    });

    // By escolaridad
    const byEscolaridad = {};
    filteredPatients.forEach(p => {
      const esc = p.escolaridad || 'No registrada';
      byEscolaridad[esc] = (byEscolaridad[esc] || 0) + 1;
    });

    // By estado civil
    const byEstadoCivil = {};
    filteredPatients.forEach(p => {
      const ec = p.estadoCivil || 'No registrado';
      byEstadoCivil[ec] = (byEstadoCivil[ec] || 0) + 1;
    });

    // By estrato
    const byEstrato = {};
    filteredPatients.forEach(p => {
      const est = p.estrato || 'No registrado';
      byEstrato[est] = (byEstrato[est] || 0) + 1;
    });

    // By zona residencia
    const byZona = {};
    filteredPatients.forEach(p => {
      const zona = p.zonaResidencia || 'No registrada';
      byZona[zona] = (byZona[zona] || 0) + 1;
    });

    // By cargo
    const byCargo = {};
    filteredPatients.forEach(p => {
      const cargo = p.cargo || 'No registrado';
      byCargo[cargo] = (byCargo[cargo] || 0) + 1;
    });

    // By tipo contrato
    const byContrato = {};
    filteredPatients.forEach(p => {
      const tc = p.tipoContrato || 'No registrado';
      byContrato[tc] = (byContrato[tc] || 0) + 1;
    });

    // By turno
    const byTurno = {};
    filteredPatients.forEach(p => {
      const turno = p.turnoTrabajo || 'No registrado';
      byTurno[turno] = (byTurno[turno] || 0) + 1;
    });

    // By riesgos ocupacionales
    const byRiesgos = { 'Físicos': 0, 'Químicos': 0, 'Biológicos': 0, 'Mecánicos': 0, 'Biomecánicos': 0, 'Psicosocial': 0, 'Seguridad': 0, 'Locativos': 0 };
    filteredPatients.forEach(p => {
      const riesgos = p.riesgos || {};
      if (riesgos.fisicos) byRiesgos['Físicos']++;
      if (riesgos.quimicos) byRiesgos['Químicos']++;
      if (riesgos.biologicos) byRiesgos['Biológicos']++;
      if (riesgos.mecanicos) byRiesgos['Mecánicos']++;
      if (riesgos.biomecanicos) byRiesgos['Biomecánicos']++;
      if (riesgos.psicosocial) byRiesgos['Psicosocial']++;
      if (riesgos.seguridad) byRiesgos['Seguridad']++;
      if (riesgos.locativos) byRiesgos['Locativos']++;
    });

    // By estilos de vida
    const byEstilos = { 'Fumadores': 0, 'Alcohol': 0, 'Deporte': 0 };
    filteredPatients.forEach(p => {
      if ((p.habitos?.fuma || p.fuma || '').toLowerCase().includes('si')) byEstilos['Fumadores']++;
      if ((p.habitos?.alcohol || p.alcohol || '').toLowerCase().includes('si')) byEstilos['Alcohol']++;
      if ((p.habitos?.deporte || p.deporte || '').toLowerCase().includes('si')) byEstilos['Deporte']++;
    });

    // ── Perfil Clínico: IMC ───────────────────────────────────────────────
    const byIMC = { 'Bajo peso': 0, 'Normal': 0, 'Sobrepeso': 0, 'Obesidad I': 0, 'Obesidad II': 0, 'Obesidad III': 0 };
    filteredPatients.forEach(p => {
      const peso = parseFloat(p.peso) || 0;
      const talla = parseFloat(p.talla) || 0; // en metros
      if (peso > 0 && talla > 0) {
        const imc = peso / (talla * talla);
        if (imc < 18.5) byIMC['Bajo peso']++;
        else if (imc < 25) byIMC['Normal']++;
        else if (imc < 30) byIMC['Sobrepeso']++;
        else if (imc < 35) byIMC['Obesidad I']++;
        else if (imc < 40) byIMC['Obesidad II']++;
        else byIMC['Obesidad III']++;
      }
    });

    // ── Perfil Clínico: Tensión Arterial ─────────────────────────────────
    const byTension = { 'Óptima': 0, 'Normal': 0, 'Pre-hipertensión': 0, 'HTA Etapa 1': 0, 'HTA Etapa 2': 0 };
    filteredPatients.forEach(p => {
      const ta = p.tensionArterial || p.ta || '';
      if (ta.includes('/')) {
        const [sistolica, diastolica] = ta.split('/').map(n => parseInt(n) || 0);
        if (sistolica < 120 && diastolica < 80) byTension['Óptima']++;
        else if (sistolica < 130 && diastolica < 80) byTension['Normal']++;
        else if (sistolica < 140 || diastolica < 90) byTension['Pre-hipertensión']++;
        else if (sistolica < 160 || diastolica < 100) byTension['HTA Etapa 1']++;
        else byTension['HTA Etapa 2']++;
      }
    });

    // ── Perfil Clínico: Examen Físico Alterado ─────────────────────────────
    const examenFisicoAlterado = { 'Cardiovascular': 0, 'Respiratorio': 0, 'Neurológico': 0, 'Musculoesquelético': 0, 'Piel': 0, 'Abdomen': 0 };
    filteredPatients.forEach(p => {
      if ((p.examenFisicoCardiovascular || '').toLowerCase().includes('alter')) examenFisicoAlterado['Cardiovascular']++;
      if ((p.examenFisicoRespiratorio || '').toLowerCase().includes('alter')) examenFisicoAlterado['Respiratorio']++;
      if ((p.examenFisicoNeurologico || '').toLowerCase().includes('alter')) examenFisicoAlterado['Neurológico']++;
      if ((p.examenFisicoMusculoesq || '').toLowerCase().includes('alter')) examenFisicoAlterado['Musculoesquelético']++;
      if ((p.examenFisicoPiel || '').toLowerCase().includes('alter')) examenFisicoAlterado['Piel']++;
      if ((p.examenFisicoAbdomen || '').toLowerCase().includes('alter')) examenFisicoAlterado['Abdomen']++;
    });

    return { 
      total, byTipo, byConcepto, topDiag, byGender, byAge, 
      byEscolaridad, byEstadoCivil, byEstrato, byZona, 
      byCargo, byContrato, byTurno, byRiesgos, byEstilos,
      byIMC, byTension, examenFisicoAlterado
    };
  }, [filteredPatients]);

  // ── SVE Indicators ──────────────────────────────────────────────────
  const sveIndicators = useMemo(() => {
    const total = filteredPatients.length || 1;

    // DME (Desórdenes Musculoesqueléticos)
    const dme = filteredPatients.filter(p =>
      (p.sintomatologiaDME || p.dolorOsteomusular || p.osteomuscular_dolor || '').toLowerCase().includes('si') ||
      (p.diagPrincipal || '').toLowerCase().includes('m') // CIE-10 M codes
    ).length;

    // Cardiovascular
    const cardio = filteredPatients.filter(p => {
      const ta = p.tensionArterial || p.ta || '';
      if (!ta.includes('/')) return false;
      const [s] = ta.split('/').map(Number);
      return s >= 140;
    }).length;

    // Respiratorio
    const resp = filteredPatients.filter(p =>
      (p.espirometria || '').toLowerCase().includes('anormal') ||
      (p.diagPrincipal || '').toLowerCase().startsWith('j')
    ).length;

    // Auditivo
    const audit = filteredPatients.filter(p =>
      (p.audiometria || '').toLowerCase().includes('anormal') ||
      (p.audiometria || '').toLowerCase().includes('hipoacusia') ||
      (p.diagPrincipal || '').toLowerCase().startsWith('h9')
    ).length;

    // Psicosocial
    const psico = filteredPatients.filter(p =>
      (p.riesgoPsicosocial || '').toLowerCase().includes('alto') ||
      (p.riesgoPsicosocial || '').toLowerCase().includes('muy alto') ||
      (p.diagPrincipal || '').toLowerCase().startsWith('f')
    ).length;

    return {
      dme: { count: dme, pct: ((dme / total) * 100).toFixed(1) },
      cardiovascular: { count: cardio, pct: ((cardio / total) * 100).toFixed(1) },
      respiratorio: { count: resp, pct: ((resp / total) * 100).toFixed(1) },
      auditivo: { count: audit, pct: ((audit / total) * 100).toFixed(1) },
      psicosocial: { count: psico, pct: ((psico / total) * 100).toFixed(1) },
    };
  }, [filteredPatients]);

  // ── AI Report Generation ────────────────────────────────────────────
  const handleGenerateAIReport = async () => {
    if (!callAI) {
      showAlert?.('⚠️ Configure las API keys de IA primero.');
      return;
    }
    if (filteredPatients.length === 0) {
      showAlert?.('⚠️ No hay pacientes para generar el reporte.');
      return;
    }

    setIsGeneratingReport?.(true);
    try {
      const compName = selectedCompanyReport
        ? companies.find(c => c.id === selectedCompanyReport)?.nombre || 'Todas'
        : 'Todas las empresas';

      const prompt = `Genera un informe epidemiológico ocupacional detallado con los siguientes datos:
        - Empresa: ${compName}
        - Total pacientes evaluados: ${stats.total}
        - Distribución por tipo de examen: ${JSON.stringify(stats.byTipo)}
        - Distribución por concepto de aptitud: ${JSON.stringify(stats.byConcepto)}
        - Top diagnósticos CIE-10: ${JSON.stringify(stats.topDiag)}
        - Distribución por género: ${JSON.stringify(stats.byGender)}
        - Distribución por grupo etario: ${JSON.stringify(stats.byAge)}
        - Indicadores SVE:
          DME: ${sveIndicators.dme.pct}%
          Cardiovascular: ${sveIndicators.cardiovascular.pct}%
          Respiratorio: ${sveIndicators.respiratorio.pct}%
          Auditivo: ${sveIndicators.auditivo.pct}%
          Psicosocial: ${sveIndicators.psicosocial.pct}%

        Incluye: resumen ejecutivo, hallazgos principales, análisis por programa SVE,
        recomendaciones priorizadas, y conclusiones. Formato: texto estructurado con encabezados.
        Normativa colombiana: Res. 1843/2025, Res. 0312/2019, Decreto 1072/2015.`;

      const result = await callAI(prompt);
      setReportAIResult?.(result);
      showAlert?.('✅ Informe IA generado correctamente.');
    } catch (err) {
      showAlert?.(`❌ Error generando informe: ${err.message}`);
    } finally {
      setIsGeneratingReport?.(false);
    }
  };

  // ── RIPS Export ─────────────────────────────────────────────────────
  const handleExportRIPS = () => {
    const ripsData = {
      identificacion: {
        codigoPrestador: currentUser?.doctorData?.licencia || '',
        fechaRemision: new Date().toISOString().split('T')[0],
        numFactura: '',
      },
      usuarios: filteredPatients.map(p => ({
        tipoDoc: p.docTipo || 'CC',
        numDoc: p.docNumero || '',
        nombre: p.nombres || '',
        fechaNac: p.fechaNacimiento || '',
        sexo: (p.genero || '').charAt(0) || 'M',
        zona: p.zonaResidencia || 'U',
        codMunicipio: p.ciudadResidencia || '',
      })),
      consultas: filteredPatients.map(p => ({
        numDoc: p.docNumero || '',
        fechaConsulta: p.fechaExamen || '',
        codConsulta: '890201',
        finalidadConsulta: p.tipoExamen === 'INGRESO' ? '01' : '06',
        causaExterna: '13',
        diagPrincipal: p.diagPrincipal || p.cie10Principal || '',
        diagRelacionado: p.diagnostico2 || '',
        tipoDoc: p.docTipo || 'CC',
      })),
    };

    const blob = new Blob([JSON.stringify(ripsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIPS_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert?.('✅ RIPS JSON exportado.');
  };

  // ── FHIR R4 Export ──────────────────────────────────────────────────
  const handleExportFHIR = () => {
    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: filteredPatients.map(p => ({
        resource: {
          resourceType: 'Encounter',
          id: p.id,
          status: 'finished',
          class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' },
          type: [{
            coding: [{ system: 'http://snomed.info/sct', code: '410620009', display: 'Occupational health assessment' }],
          }],
          subject: {
            reference: `Patient/${p.docNumero || p.id}`,
            display: p.nombres || '',
          },
          period: {
            start: p.fechaExamen || '',
            end: p.fechaExamen || '',
          },
          diagnosis: [
            p.diagPrincipal && {
              condition: { display: p.diagPrincipal },
              use: { coding: [{ code: 'AD', display: 'Admission diagnosis' }] },
            },
          ].filter(Boolean),
        },
      })),
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/fhir+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_R4_Bundle_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert?.('✅ FHIR R4 Bundle exportado.');
  };

  // ── CSV Export ──────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = 'Documento,Nombres,Fecha Examen,Tipo Examen,Empresa,Concepto,Diagnóstico Principal,Género,Edad\n';
    const rows = filteredPatients.map(p =>
      [
        p.docNumero || '',
        (p.nombres || '').replace(/,/g, ';'),
        p.fechaExamen || '',
        p.tipoExamen || '',
        (p.empresaNombre || '').replace(/,/g, ';'),
        p.conceptoAptitud || p.conceptoOcupacional || '',
        (p.diagPrincipal || p.cie10Principal || '').replace(/,/g, ';'),
        p.genero || '',
        p.edad || '',
      ].join(',')
    ).join('\n');
    const csv = '\uFEFF' + headers + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_pacientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert?.('✅ CSV exportado.');
  };

  // ── Simple bar chart renderer ───────────────────────────────────────
  const renderBarChart = (data, maxWidth = 200, colorClass = 'bg-emerald-500') => {
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

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: ESTADÍSTICAS
  // ═══════════════════════════════════════════════════════════════════════
  const renderEstadisticas = () => (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-200 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-black text-emerald-700">{stats.total}</p>
          <p className="text-xs font-bold text-gray-500">Total Pacientes</p>
        </div>
        <div className="bg-white border border-blue-200 rounded-xl p-4 text-center">
          <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-black text-blue-700">{companies.length}</p>
          <p className="text-xs font-bold text-gray-500">Empresas</p>
        </div>
        <div className="bg-white border border-purple-200 rounded-xl p-4 text-center">
          <Stethoscope className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-2xl font-black text-purple-700">
            {Object.keys(stats.byTipo).length}
          </p>
          <p className="text-xs font-bold text-gray-500">Tipos Examen</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4 text-center">
          <ClipboardList className="w-6 h-6 text-amber-600 mx-auto mb-1" />
          <p className="text-2xl font-black text-amber-700">{stats.topDiag.length}</p>
          <p className="text-xs font-bold text-gray-500">Diagnósticos</p>
        </div>
      </div>

      {/* Tipo examen chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" /> Distribución por Tipo de Examen
        </h3>
        <div className="space-y-2">
          {renderBarChart(stats.byTipo, 300, 'bg-emerald-500')}
          {Object.keys(stats.byTipo).length === 0 && (
            <p className="text-gray-400 text-xs text-center py-4">Sin datos</p>
          )}
        </div>
      </div>

      {/* Concepto aptitud chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" /> Distribución por Concepto de Aptitud
        </h3>
        <div className="space-y-2">
          {renderBarChart(stats.byConcepto, 300, 'bg-blue-500')}
          {Object.keys(stats.byConcepto).length === 0 && (
            <p className="text-gray-400 text-xs text-center py-4">Sin datos</p>
          )}
        </div>
      </div>

      {/* Top CIE-10 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-600" /> Top 10 Diagnósticos (CIE-10)
        </h3>
        {stats.topDiag.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-4">Sin diagnósticos registrados</p>
        ) : (
          <div className="space-y-2">
            {stats.topDiag.map(([diag, count], i) => (
              <div key={diag} className="flex items-center gap-3 text-xs">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-[10px] ${
                  i < 3 ? 'bg-red-500' : 'bg-gray-400'
                }`}>{i + 1}</span>
                <span className="flex-1 text-gray-700 font-bold truncate">{diag}</span>
                <span className="font-black text-gray-800">{count}</span>
                <div className="w-20 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full"
                    style={{ width: `${(count / (stats.topDiag[0]?.[1] || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" /> Por Género
          </h3>
          <div className="space-y-2">
            {renderBarChart(stats.byGender, 200, 'bg-purple-500')}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" /> Por Grupo Etario
          </h3>
          <div className="space-y-2">
            {renderBarChart(stats.byAge, 200, 'bg-teal-500')}
          </div>
        </div>
      </div>

      {/* Perfil Clínico: IMC */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-600" /> Índice de Masa Corporal (IMC)
        </h3>
        <div className="space-y-2">
          {renderBarChart(stats.byIMC, 300, 'bg-orange-500')}
          {Object.keys(stats.byIMC).every(k => stats.byIMC[k] === 0) && (
            <p className="text-gray-400 text-xs text-center py-4">Sin datos de IMC</p>
          )}
        </div>
      </div>

      {/* Perfil Clínico: Tensión Arterial */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-600" /> Presión Arterial
        </h3>
        <div className="space-y-2">
          {renderBarChart(stats.byTension, 300, 'bg-red-500')}
          {Object.keys(stats.byTension).every(k => stats.byTension[k] === 0) && (
            <p className="text-gray-400 text-xs text-center py-4">Sin datos de presión arterial</p>
          )}
        </div>
      </div>

      {/* Perfil Clínico: Examen Físico */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-amber-600" /> Examen Físico Alterado por Sistemas
        </h3>
        <div className="space-y-2">
          {renderBarChart(stats.examenFisicoAlterado, 300, 'bg-amber-500')}
          {Object.keys(stats.examenFisicoAlterado).every(k => stats.examenFisicoAlterado[k] === 0) && (
            <p className="text-gray-400 text-xs text-center py-4">Sin datos de examen físico</p>
          )}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: SVE INDICATORS
  // ═══════════════════════════════════════════════════════════════════════
  const renderSVE = () => {
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

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: AI REPORT
  // ═══════════════════════════════════════════════════════════════════════
  const renderAIReport = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" /> Informe Generado con IA
        </h3>
        <button onClick={handleGenerateAIReport}
          disabled={isGeneratingReport}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50 shadow">
          {isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {isGeneratingReport ? 'Generando...' : 'Generar Informe IA'}
        </button>
      </div>

      {reportAIResult ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {reportAIResult}
          </div>
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
            <button onClick={() => {
              navigator.clipboard?.writeText(reportAIResult);
              showAlert?.('📋 Copiado al portapapeles.');
            }}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">
              <Copy className="w-3 h-3" /> Copiar
            </button>
            <button onClick={() => {
              const blob = new Blob([reportAIResult], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `informe_ia_${new Date().toISOString().split('T')[0]}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">
              <Download className="w-3 h-3" /> Descargar
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-bold">No hay informe generado</p>
          <p className="text-gray-400 text-xs mt-1">Haga clic en "Generar Informe IA" para crear un análisis epidemiológico</p>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: EXPORTACIÓN PDF DE TABLA
  // ═══════════════════════════════════════════════════════════════════════
  const handlePrintTable = () => {
    const printContent = document.getElementById('tabla-trabajadores-print');
    if (!printContent) {
      showAlert?.('⚠️ No hay contenido para imprimir');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Trabajadores - ${new Date().toLocaleDateString('es-CO')}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background: #333; color: white; }
            .bg-amber-50 { background: #fffbeb; }
            .text-red-600 { color: #dc2626; }
            .text-emerald-600 { color: #059669; }
            @media print {
              body { margin: 0; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <h1>Reporte de Trabajadores</h1>
          <p>Empresa: ${companies.find(c => c.id === selectedCompanyReport)?.nombre || 'Todas'}</p>
          <p>Fecha: ${new Date().toLocaleDateString('es-CO')}</p>
          <p>Total trabajadores: ${filteredPatients.length}</p>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: RESUMEN EJECUTIVO AUTOMÁTICO
  // ═══════════════════════════════════════════════════════════════════════
  const renderResumenEjecutivo = () => {
    // Calcular métricas clave
    const total = filteredPatients.length;
    const conHallazgos = filteredPatients.filter(p => 
      (p.conceptoAptitud || '').toLowerCase().includes('no apt') ||
      (p.conceptoAptitud || '').toLowerCase().includes('reubic')
    ).length;
    const conRestricciones = filteredPatients.filter(p => 
      p.restriccionesLaborales && p.restriccionesLaborales.length > 0
    ).length;
    const tasaNoAptos = total > 0 ? ((conHallazgos / total) * 100).toFixed(1) : 0;
    
    // Hallazgos principales
    const hallazgosPrincipales = [];
    if (sveIndicators.dme.count > 0) {
      hallazgosPrincipales.push(`• DME: ${sveIndicators.dme.count} casos (${sveIndicators.dme.pct}%)`);
    }
    if (sveIndicators.cardiovascular.count > 0) {
      hallazgosPrincipales.push(`• Cardiovascular: ${sveIndicators.cardiovascular.count} casos (${sveIndicators.cardiovascular.pct}%)`);
    }
    if (sveIndicators.respiratorio.count > 0) {
      hallazgosPrincipales.push(`• Respiratorio: ${sveIndicators.respiratorio.count} casos (${sveIndicators.respiratorio.pct}%)`);
    }
    if (sveIndicators.psicosocial.count > 0) {
      hallazgosPrincipales.push(`• Psicosocial: ${sveIndicators.psicosocial.count} casos (${sveIndicators.psicosocial.pct}%)`);
    }

    // Recomendaciones
    const recomendaciones = [];
    if (sveIndicators.dme.pct > 10) {
      recomendaciones.push('⚠️ Implementar programa de vigilancia ergonómica');
    }
    if (sveIndicators.cardiovascular.pct > 10) {
      recomendaciones.push('⚠️ Programa de control de factores de riesgo cardiovascular');
    }
    if (sveIndicators.psicosocial.pct > 10) {
      recomendaciones.push('⚠️ Intervención en factores de riesgo psicosocial');
    }
    recomendaciones.push('✓ Continuar con el programa de exámenes ocupacionales');

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white">
          <p className="font-black flex items-center gap-2">
            <FileText className="w-4 h-4" /> Resumen Ejecutivo Automático
          </p>
          <p className="text-xs text-indigo-100 mt-1">
            Análisis instantáneo sin necesidad de IA
          </p>
        </div>

        {/* Métricas clave */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-blue-600">{total}</p>
            <p className="text-xs font-bold text-gray-500">Total Evaluados</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-amber-600">{conHallazgos}</p>
            <p className="text-xs font-bold text-gray-500">Con Hallazgos</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-red-600">{conRestricciones}</p>
            <p className="text-xs font-bold text-gray-500">Con Restricciones</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-purple-600">{tasaNoAptos}%</p>
            <p className="text-xs font-bold text-gray-500">Tasa No Aptos</p>
          </div>
        </div>

        {/* Hallazgos */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-black text-sm text-gray-800 mb-4">📋 Hallazgos Principales</h3>
          {hallazgosPrincipales.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-700">
              {hallazgosPrincipales.map((h, i) => (
                <li key={i} className="bg-gray-50 p-2 rounded">{h}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No se detectaron hallazgos relevantes</p>
          )}
        </div>

        {/* Recomendaciones */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-black text-sm text-gray-800 mb-4">💡 Recomendaciones</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {recomendaciones.map((r, i) => (
              <li key={i} className="bg-emerald-50 p-2 rounded">{r}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: ENVÍO INTEGRAL A EMPRESAS
  // ═══════════════════════════════════════════════════════════════════════
  const renderEnvioIntegral = () => {
    const empresa = companies.find(c => c.id === selectedCompanyReport);
    const totalPacientes = filteredPatients.length;
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
          <p className="font-black flex items-center gap-2">
            <Send className="w-4 h-4" /> Envío Integral a Empresa
          </p>
          <p className="text-xs text-green-100 mt-1">
            Genera y envía todos los documentos a la empresa
          </p>
        </div>

        {!selectedCompanyReport ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="font-bold text-amber-800">Selecciona una empresa</p>
            <p className="text-xs text-amber-600 mt-1">Elige una empresa del filtro para continuar</p>
          </div>
        ) : (
          <>
            {/* Checklist de completitud */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-black text-sm text-gray-800 mb-4">✅ Checklist de Documentos</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked className="w-5 h-5 text-emerald-600 rounded" readOnly />
                  <span className="text-sm text-gray-700">Informe Epidemiológico</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={totalPacientes > 0} className="w-5 h-5 text-emerald-600 rounded" readOnly />
                  <span className="text-sm text-gray-700">Certificados ({totalPacientes} exámenes)</span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked className="w-5 h-5 text-emerald-600 rounded" readOnly />
                  <span className="text-sm text-gray-700">Cuenta de Cobro</span>
                </div>
              </div>
            </div>

            {/* Datos de la empresa */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-black text-sm text-gray-800 mb-4">🏢 Datos de la Empresa</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nombre:</p>
                  <p className="font-bold">{empresa?.nombre || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">NIT:</p>
                  <p className="font-bold">{empresa?.nit || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email:</p>
                  <p className="font-bold">{empresa?.email || empresa?.emailContacto || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Pacientes:</p>
                  <p className="font-bold">{totalPacientes}</p>
                </div>
              </div>
            </div>

            {/* Botón de envío */}
            <button 
              onClick={() => showAlert?.('📧 Funcionalidad de envío por email - Configure servidor SMTP')}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg"
            >
              <Send className="w-5 h-5" /> Enviar Todo a la Empresa
            </button>
          </>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: HISTORIAL DE REPORTES GUARDADOS
  // ═══════════════════════════════════════════════════════════════════════
  const renderHistorial = () => {
    return (
      <div className="space-y-6">
        {/* Resumen */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="font-black text-blue-800 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Historial de Informes Guardados
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Visualiza los informes epidemiológicos guardados anteriormente
          </p>
        </div>

        {/* Lista de reportes guardados */}
        {savedReports && savedReports.length > 0 ? (
          <div className="space-y-3">
            {savedReports.map((report, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{report.nombre || `Informe ${idx + 1}`}</p>
                    <p className="text-xs text-gray-500">
                      {report.empresaNombre || 'Empresa'} · {report.fecha || new Date().toLocaleDateString('es-CO')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => showAlert?.('📋 Copiando contenido...')}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Ver
                    </button>
                    <button 
                      onClick={() => showAlert?.('🗑️ Eliminado')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">No hay informes guardados</p>
            <p className="text-gray-400 text-xs mt-1">Genera un informe IA y guárdalo para verlo aquí</p>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: TABLA TRABAJADORES CON RESTRICCIONES
  // ═══════════════════════════════════════════════════════════════════════
  const renderTablaWorkers = () => {
    // Pacientes con restricciones
    const pacientesConRestricciones = filteredPatients.filter(p => 
      p.restriccionesLaborales && p.restriccionesLaborales.length > 0
    );
    
    // Todos los pacientes para la tabla
    const todosPacientes = filteredPatients;
    
    return (
      <div className="space-y-6">
        {/* Resumen de restricciones */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Trabajadores con Restricciones Laborales
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Listado de trabajadores que requieren adaptaciones o restricciones en su labor
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-amber-600">{pacientesConRestricciones.length}</p>
              <p className="text-xs text-amber-500">de {todosPacientes.length} evaluados</p>
            </div>
          </div>
        </div>

        {/* Tabla completa de trabajadores */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 text-left font-bold">#</th>
                  <th className="p-3 text-left font-bold">Trabajador</th>
                  <th className="p-3 text-left font-bold">Documento</th>
                  <th className="p-3 text-left font-bold">Cargo / Área</th>
                  <th className="p-3 text-left font-bold">Fecha Exam</th>
                  <th className="p-3 text-left font-bold">Dx Principal (CIE-10)</th>
                  <th className="p-3 text-left font-bold">Restricciones</th>
                  <th className="p-3 text-left font-bold">Base Normativa</th>
                  <th className="p-3 text-left font-bold">Concepto</th>
                </tr>
              </thead>
              <tbody>
                {todosPacientes.map((p, idx) => {
                  const restricciones = p.restriccionesLaborales || [];
                  const tieneRestricciones = restricciones.length > 0;
                  
                  return (
                    <tr key={p.id} className={`border-b hover:bg-gray-50 ${tieneRestricciones ? 'bg-amber-50' : ''}`}>
                      <td className="p-2 text-center font-bold text-gray-500">{idx + 1}</td>
                      <td className="p-2 font-bold text-gray-800">{p.nombres || '—'}</td>
                      <td className="p-2 text-gray-600">{p.docNumero || '—'}</td>
                      <td className="p-2">
                        <div className="text-gray-800 font-medium">{p.cargo || '—'}</div>
                        <div className="text-gray-400 text-[10px]">{p.area || '—'}</div>
                      </td>
                      <td className="p-2 text-gray-600">{p.fechaExamen || '—'}</td>
                      <td className="p-2">
                        <div className="text-gray-800 font-medium">{p.diagPrincipal || '—'}</div>
                        <div className="text-gray-400 text-[10px]">{p.cie10Principal || '—'}</div>
                      </td>
                      <td className="p-2">
                        {tieneRestricciones ? (
                          <div className="space-y-1">
                            {restricciones.map((r, i) => (
                              <div key={i} className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded text-[10px]">
                                {r}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-600 font-medium">Sin restricciones</span>
                        )}
                      </td>
                      <td className="p-2">
                        {p.baseNormativa && p.baseNormativa.length > 0 ? (
                          <div className="space-y-1">
                            {p.baseNormativa.map((n, i) => (
                              <div key={i} className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-[10px]">
                                {n}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                          (p.conceptoAptitud || '').toLowerCase().includes('apto')
                            ? 'bg-emerald-100 text-emerald-700'
                            : (p.conceptoAptitud || '').toLowerCase().includes('restric')
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {p.conceptoAptitud || p.conceptoOcupacional || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {todosPacientes.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      No hay trabajadores para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {todosPacientes.length > 0 && (
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p>Total: {todosPacientes.length} trabajadores</p>
            <p>Con restricciones: {pacientesConRestricciones.length}</p>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: CERTIFICADOS
  // ═══════════════════════════════════════════════════════════════════════
  const renderCertificados = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" /> Certificados Batch
        </h3>
        <div className="flex gap-2">
          <button onClick={() => {
            const all = {};
            filteredPatients.forEach(p => { all[p.id] = true; });
            setCertSelected?.(all);
          }}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">
            Seleccionar Todos
          </button>
          <button onClick={() => setCertSelected?.({})}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">
            Limpiar
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 w-10"></th>
                <th className="text-left p-3 font-bold text-gray-600">Paciente</th>
                <th className="text-left p-3 font-bold text-gray-600">Documento</th>
                <th className="text-left p-3 font-bold text-gray-600">Fecha</th>
                <th className="text-left p-3 font-bold text-gray-600">Tipo</th>
                <th className="text-left p-3 font-bold text-gray-600">Concepto</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.slice(0, 100).map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={!!certSelected?.[p.id]}
                      onChange={e => setCertSelected?.(prev => ({ ...prev, [p.id]: e.target.checked }))}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  </td>
                  <td className="p-3 font-bold text-gray-800">{p.nombres || '—'}</td>
                  <td className="p-3 text-gray-600">{p.docNumero || '—'}</td>
                  <td className="p-3 text-gray-600">{p.fechaExamen || '—'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">
                      {p.tipoExamen || '—'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      (p.conceptoAptitud || '').toLowerCase().includes('apto')
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.conceptoAptitud || p.conceptoOcupacional || '—'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">No hay pacientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {filteredPatients.length > 100 && (
        <p className="text-xs text-gray-400 text-center">Mostrando primeros 100 de {filteredPatients.length}</p>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: MÓDULO FINANCIERO
  // ═══════════════════════════════════════════════════════════════════════
  const renderFinanciero = () => {
    const totalPacientes = filteredPatients.length;
    const precioUnitario = precioPorPaciente || 35000;
    const totalAPagar = totalPacientes * precioUnitario;
    
    // Generar cuenta de cobro
    const generarCuentaCobro = () => {
      const empresa = companies.find(c => c.id === selectedCompanyReport);
      const cuenta = {
        numero: `CC-${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        empresa: empresa?.nombre || 'Varias empresas',
        nit: empresa?.nit || 'N/A',
        cantidad: totalPacientes,
        precioUnitario: precioUnitario,
        total: totalAPagar,
        concepto: 'Servicios de Medicina Ocupacional - Exámenes Ocupacionales',
        periodo: `${reportStartDate || '...'} a ${reportEndDate || '...'}`,
      };
      return cuenta;
    };

    const cuenta = generarCuentaCobro();

    return (
      <div className="space-y-6">
        {/* Resumen financiero */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="font-black text-orange-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Módulo Financiero - Cuenta de Cobro
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Cálculo automático basado en pacientes evaluados en el período seleccionado
          </p>
        </div>

        {/* Cards de cálculo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-black text-gray-800">{totalPacientes}</p>
            <p className="text-xs font-bold text-gray-500">Pacientes Evaluados</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-3xl font-black text-gray-800">${precioUnitario.toLocaleString('es-CO')}</p>
            <p className="text-xs font-bold text-gray-500">Precio por Paciente</p>
          </div>
          <div className="bg-white border border-orange-200 rounded-xl p-5 text-center">
            <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-black text-orange-600">${totalAPagar.toLocaleString('es-CO')}</p>
            <p className="text-xs font-bold text-orange-500">Total a Cobrar</p>
          </div>
        </div>

        {/* Precio por paciente - editable */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="text-sm font-bold text-gray-700 block mb-2">
            💰 Precio por paciente ($):
          </label>
          <input 
            type="number" 
            value={precioPorPaciente || 35000}
            onChange={e => setPrecioPorPaciente?.(parseInt(e.target.value) || 0)}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm font-bold"
            placeholder="35000"
          />
          <p className="text-xs text-gray-400 mt-2">
            Valor por defecto: $35,000 por examen ocupacional
          </p>
        </div>

        {/* Vista previa de cuenta de cobro */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-black text-sm text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-600" /> Vista Previa - Cuenta de Cobro
          </h3>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 font-mono text-xs">
            <div className="border-b border-gray-300 pb-2 mb-2">
              <p className="font-black text-lg">CUENTA DE COBRO</p>
              <p className="text-gray-500">No. {cuenta.numero}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-bold">{cuenta.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Empresa:</span>
                <span className="font-bold">{cuenta.empresa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NIT:</span>
                <span className="font-bold">{cuenta.nit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Período:</span>
                <span className="font-bold">{cuenta.periodo}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cantidad de exámenes:</span>
                  <span className="font-bold">{cuenta.cantidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor unitario:</span>
                  <span className="font-bold">${cuenta.precioUnitario.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                  <span className="font-black text-gray-800">TOTAL A COBRAR:</span>
                  <span className="font-black text-orange-600 text-lg">${cuenta.total.toLocaleString('es-CO')}</span>
                </div>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <p className="text-gray-600">Concepto:</p>
                <p className="font-bold">{cuenta.concepto}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button 
              onClick={() => {
                const contenido = `
CUENTA DE COBRO No. ${cuenta.numero}
Fecha: ${cuenta.fecha}

Empresa: ${cuenta.empresa}
NIT: ${cuenta.nit}
Período: ${cuenta.periodo}

Cantidad de exámenes: ${cuenta.cantidad}
Valor unitario: $${cuenta.precioUnitario.toLocaleString('es-CO')}

TOTAL A COBRAR: $${cuenta.total.toLocaleString('es-CO')}

Concepto: ${cuenta.concepto}
                `.trim();
                const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cuenta_cobro_${cuenta.numero}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                showAlert?.('✅ Cuenta de cobro exportada.');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-200"
            >
              <Download className="w-4 h-4" /> Descargar Cuenta de Cobro
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-black flex items-center gap-2">
          <BarChart3 className="w-6 h-6" /> Reportes y Estadísticas
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          {stats.total} pacientes evaluados · {companies.length} empresas
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-600 block mb-1">
              <Building2 className="w-3 h-3 inline mr-1" /> Empresa
            </label>
            <select value={selectedCompanyReport || ''}
              onChange={e => setSelectedCompanyReport?.(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
              <option value="">Todas las empresas</option>
              {companies.map(c => (
                <option key={c.id || c.nit} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">
              <Calendar className="w-3 h-3 inline mr-1" /> Desde
            </label>
            <input type="date" value={reportStartDate || ''}
              onChange={e => setReportStartDate?.(e.target.value)}
              className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Hasta</label>
            <input type="date" value={reportEndDate || ''}
              onChange={e => setReportEndDate?.(e.target.value)}
              className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-2.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200">
              <Download className="w-3 h-3" /> CSV
            </button>
            <button onClick={handleExportRIPS}
              className="flex items-center gap-1 px-3 py-2.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">
              <FileText className="w-3 h-3" /> RIPS
            </button>
            <button onClick={handleExportFHIR}
              className="flex items-center gap-1 px-3 py-2.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200">
              <FileText className="w-3 h-3" /> FHIR R4
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'resumen', label: 'Resumen', icon: ClipboardList },
          { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
          { id: 'trabajadores', label: 'Trabajadores', icon: Users },
          { id: 'sve', label: 'Indicadores SVE', icon: Shield },
          { id: 'ia', label: 'Informe IA', icon: Brain },
          { id: 'certificados', label: 'Certificados', icon: FileCheck },
          { id: 'financiero', label: 'Financiero', icon: DollarSign },
          { id: 'envio', label: 'Envío', icon: Send },
          { id: 'historial', label: 'Historial', icon: FileText },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'resumen' && renderResumenEjecutivo()}
      {activeTab === 'estadisticas' && renderEstadisticas()}
      {activeTab === 'trabajadores' && renderTablaWorkers()}
      {activeTab === 'sve' && (
        <SVEPrograms
          patients={patientsList}
          companies={companies}
          aiConfig={aiConfig}
          callAI={callAI}
          showAlert={showAlert}
          usersList={usersList}
        />
      )}
      {activeTab === 'ia' && renderAIReport()}
      {activeTab === 'certificados' && renderCertificados()}
      {activeTab === 'financiero' && renderFinanciero()}
      {activeTab === 'envio' && renderEnvioIntegral()}
      {activeTab === 'historial' && renderHistorial()}
    </div>
  );
}
