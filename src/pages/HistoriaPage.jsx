// src/pages/HistoriaPage.jsx — HC Ocupacional with action tabs (like ocupasalud)
// Tabs: Formulario | Certificado | Fórmula | Derivación | Exámenes | Adjuntos | Incapacidad | Evolución
// Action buttons: Imprimir | RIPS | FHIR | RDA | Cerrar HC | Carnet
import React, { useReducer, useCallback, useRef, useMemo, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import { useSaveData } from '../hooks/useSaveData';
import { printHC } from '../lib/printService';
import { initialOccupPatientState } from '../shared/data/initialStates';
import {
  ArrowLeft, Save, Printer, Loader2, CheckCircle, AlertTriangle,
  Stethoscope, FileText, Pill, GitBranch, TestTube, Paperclip,
  Hospital, Sparkles, Database, Heart, Lock, CreditCard, ClipboardList,
  Download
} from 'lucide-react';

// Lazy load all components
const OccupationalHC = React.lazy(() => import('../modules/clinical/components/OccupationalHC'));
const CertificateView = React.lazy(() => import('../modules/clinical/components/CertificateView').then(m => ({ default: m.CertificateView || m.default })));
const TabFormulaDerivacion = React.lazy(() => import('../components/forms/TabFormulaDerivacion').then(m => ({ default: m.TabFormulaDerivacion || m.default })));
const PrescriptionTab = React.lazy(() => import('../modules/clinical/components/PrescriptionTab').then(m => ({ default: m.PrescriptionTab || m.default })));
const ExamRequestTab = React.lazy(() => import('../modules/clinical/components/ExamRequestTab').then(m => ({ default: m.ExamRequestTab || m.default })));
const AttachmentsTab = React.lazy(() => import('../modules/clinical/components/AttachmentsTab').then(m => ({ default: m.AttachmentsTab || m.default })));
const DisabilityTab = React.lazy(() => import('../modules/clinical/components/DisabilityTab').then(m => ({ default: m.DisabilityTab || m.default })));
const EvolucionModal = React.lazy(() => import('../modules/clinical/components/EvolucionModal').then(m => ({ default: m.EvolucionModal || m.default })));

// Error boundary
class HCErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(e) { console.error('HC Tab Error:', e.message); }
  render() {
    if (this.state.error) return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-4">
        <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
        <h3 className="font-bold text-amber-800">Error en este módulo</h3>
        <p className="text-sm text-amber-700 mt-2">{this.state.error.message}</p>
        <button onClick={() => this.setState({ error: null })} className="mt-3 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-bold">Reintentar</button>
      </div>
    );
    return this.props.children;
  }
}

// HC Tabs definition
const HC_TABS = [
  { id: 'form', label: 'HC', icon: Stethoscope, color: 'emerald' },
  { id: 'certificado', label: 'Certificado', icon: FileText, color: 'blue' },
  { id: 'formula', label: 'Fórmula', icon: Pill, color: 'purple' },
  { id: 'derivacion', label: 'Derivación', icon: GitBranch, color: 'indigo' },
  { id: 'examenes', label: 'Exámenes', icon: TestTube, color: 'teal' },
  { id: 'adjuntos', label: 'Adjuntos', icon: Paperclip, color: 'orange' },
  { id: 'incapacidad', label: 'Incapacidad', icon: Hospital, color: 'red' },
  { id: 'evolucion', label: 'Evolución', icon: ClipboardList, color: 'violet' },
];

function hcReducer(state, action) {
  if (typeof action === 'function') return action(state);
  return { ...state, ...action };
}

const TabLoader = () => <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>;

export default function HistoriaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore.getState().currentUser;
  const aiConfig = useMemo(() => useAIStore.getState().getConfig(), []);
  const { data: patients } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
  const { data: companies } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const { data: doctor } = useBackendObject('/data/doctor', 'siso_doctor_data', 'doctor');

  // HC state
  const [data, dispatch] = useReducer(hcReducer, { ...initialOccupPatientState, tipoHistoria: 'ocupacional', fechaExamen: new Date().toISOString().split('T')[0] });
  const setData = useCallback((updates) => dispatch(updates), []);
  const [activeTab, setActiveTab] = React.useState('form');

  // Load patient once
  const loaded = useRef(false);
  React.useEffect(() => {
    if (id && patients.length > 0 && !loaded.current) {
      const p = patients.find((x) => x.docNumero === id || x.id === id);
      if (p) { dispatch(p); loaded.current = true; }
    }
  }, [id, patients.length]);

  // Save (declared BEFORE auto-save effect to avoid TDZ)
  const { save, saving, lastSaveStatus } = useSaveData();

  // P10 FIX: Dirty tracking
  const [isDirty, setIsDirty] = React.useState(false);
  const prevDataRef = useRef(JSON.stringify(data));
  React.useEffect(() => {
    const current = JSON.stringify(data);
    if (current !== prevDataRef.current) {
      setIsDirty(true);
      prevDataRef.current = current;
    }
  }, [data]);

  // P9 FIX: Auto-save every 60 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty && data.nombres) {
        const userId = currentUser?.user || 'drcucalon';
        const toSave = { ...data, medicoId: userId, fechaModificacion: new Date().toISOString(), autoSaved: true };
        save('/write/hc/save', toSave, `siso_patients_${userId}`).then((r) => {
          if (r.ok) { setIsDirty(false); console.log('[AutoSave] HC guardada'); }
        }).catch(() => {});
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isDirty, data, currentUser, save]);
  const handleSave = useCallback(async () => {
    const userId = currentUser?.user || 'drcucalon';
    const isNew = !data.id;
    const toSave = { ...data, medicoId: userId, fechaModificacion: new Date().toISOString() };
    if (!toSave.id) {
      toSave.id = `hc_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      toSave.fechaCreacion = new Date().toISOString();
    }
    const result = await save('/write/hc/save', toSave, `siso_patients_${userId}`);

    // F14: Auto-registro en agenda para paciente nuevo
    if (result.ok && isNew && data.nombres) {
      try {
        const company = companies.find(c => c.id === data.empresaId);
        const tarifa = company?.tarifaPeriodico || company?.tarifaConsulta || 35000;
        const cita = {
          id: `cita_${Date.now()}`,
          paciente: data.nombres,
          docNumero: data.docNumero,
          empresa: company?.nombre || 'Particular',
          empresaId: data.empresaId,
          tipo: data.tipoExamen || 'PERIODICO',
          medicoId: userId,
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().slice(0, 5),
          estado: 'atendido',
          costo: tarifa,
          _autoGenerated: true,
        };
        await save('/write/agenda/add', cita, `siso_agendados`);
      } catch (e) { console.warn('Auto-agenda failed:', e.message); }
    }

    setIsDirty(false);
    if (result.ok) alert('✅ HC guardada'); else alert('❌ Error al guardar');
  }, [data, save, currentUser, companies]);

  // AI — Full integration (P1-P5 fixes: restrictions, recommendations, parseAIJSON)
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isGeneratingRestr, setIsGeneratingRestr] = React.useState(false);
  const [isGeneratingReco, setIsGeneratingReco] = React.useState(false);

  // Helper: try backend proxy first, fallback to direct AI call
  const callAI = useCallback(async (prompt, systemPrompt) => {
    // P1 FIX: Try backend /api/ai/analyze first (keys safe on server)
    try {
      const { apiClient } = await import('../lib/apiClient');
      const result = await apiClient.post('/api/ai/analyze', { prompt, systemPrompt, preferredProvider: aiConfig?.activeProvider });
      if (result?.result) return result.result;
    } catch {
      // Backend not available — fallback to direct call (development mode)
    }
    const { callAIWithFailover } = await import('../modules/ai/services/aiAnalysis');
    return callAIWithFailover(prompt, systemPrompt, aiConfig);
  }, [aiConfig]);

  // P5 FIX: Main AI analysis — generates analysis + tries to fill concept/restrictions/recommendations
  const onGenerateAI = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { analyzeHC } = await import('../modules/ai/services/aiAnalysis');
      const result = await analyzeHC(data, aiConfig);
      // Try to parse structured response
      try {
        const { parseAIJSON } = await import('../shared/lib/aiProviders');
        const parsed = parseAIJSON(result);
        dispatch({
          analisis: parsed.analisis || parsed.resumen || result,
          ...(parsed.conceptoAptitud && { conceptoAptitud: parsed.conceptoAptitud }),
          ...(parsed.restricciones && { restricciones: parsed.restricciones }),
          ...(parsed.recomendaciones && { recomendaciones: parsed.recomendaciones }),
        });
      } catch {
        // Not JSON — just set as text analysis
        dispatch({ analisis: result });
      }
    } catch (e) { alert('Error IA: ' + e.message); }
    finally { setIsGenerating(false); }
  }, [data, aiConfig]);

  // P2 FIX: Generate restrictions with AI
  const onGenerateRestrictions = useCallback(async () => {
    setIsGeneratingRestr(true);
    try {
      const { generateRestrictions } = await import('../modules/ai/services/aiAnalysis');
      const result = await generateRestrictions(data, aiConfig);
      dispatch({ restriccionesTexto: result, restricciones: result });
    } catch (e) { alert('Error IA Restricciones: ' + e.message); }
    finally { setIsGeneratingRestr(false); }
  }, [data, aiConfig]);

  // P2 FIX: Generate recommendations with AI
  const onGenerateRecommendations = useCallback(async () => {
    setIsGeneratingReco(true);
    try {
      const { generateRecommendations } = await import('../modules/ai/services/aiAnalysis');
      const result = await generateRecommendations(data, aiConfig);
      dispatch({ recomendacionesTexto: result, recomendaciones: result });
    } catch (e) { alert('Error IA Recomendaciones: ' + e.message); }
    finally { setIsGeneratingReco(false); }
  }, [data, aiConfig]);

  // Close HC — Full implementation matching ocupasalud (F15-F19)
  const handleCloseHC = useCallback(async () => {
    if (!confirm('¿Cerrar esta Historia Clínica? Una vez cerrada no se puede editar.')) return;

    const now = new Date();
    const code = `SISO-${now.toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString().slice(-8)}-${Math.random().toString(16).slice(2, 18).toUpperCase()}`;

    // F16: Hash SHA-256 de la HC completa
    let hcHash = '';
    try {
      const { _sha256 } = await import('../shared/lib/crypto');
      hcHash = await _sha256(JSON.stringify(data));
    } catch { hcHash = 'hash-error'; }

    const userId = currentUser?.user || 'drcucalon';
    const closeData = {
      estadoHistoria: 'Cerrada',
      codigoVerificacion: code,
      fechaCierre: now.toISOString(),
      hashHC: hcHash,
      firmaMedico: activeDoctorData?.nombre || userId,
      firmaFecha: now.toISOString(),
    };
    dispatch(closeData);

    // F15: Auto-billing — genera movimiento en caja
    try {
      const company = companies.find(c => c.id === data.empresaId);
      const tipoExamen = data.tipoExamen || 'PERIODICO';
      const tarifaKey = `tarifa${tipoExamen.charAt(0) + tipoExamen.slice(1).toLowerCase()}`;
      const tarifa = company?.[tarifaKey] || company?.tarifaPeriodico || company?.tarifaConsulta || 35000;
      const movimiento = {
        id: `mov_${Date.now()}`,
        tipo: 'ingreso',
        concepto: `HC ${tipoExamen} — ${data.nombres || 'Paciente'}`,
        monto: tarifa,
        empresa: company?.nombre || 'Particular',
        empresaId: data.empresaId,
        paciente: data.nombres,
        docNumero: data.docNumero,
        medicoId: userId,
        fecha: now.toISOString(),
        estado: 'pendiente',
        _autoGenerated: true,
      };
      await save('/write/caja/add', movimiento, `siso_caja_movs_${userId}`);
    } catch (e) { console.warn('Auto-billing failed:', e.message); }

    // F17-F18: Portal público indexing
    try {
      const portalData = {
        nombres: data.nombres,
        docNumero: data.docNumero,
        conceptoAptitud: data.conceptoAptitud,
        restricciones: data.restricciones,
        recomendaciones: data.recomendaciones,
        tipoExamen: data.tipoExamen,
        fecha: now.toISOString(),
        codigo: code,
        hashHC: hcHash,
        medico: activeDoctorData?.nombre || userId,
      };
      await save('/write/portal/index', portalData, `siso_portal_${code}`);
      if (data.docNumero) {
        await save('/write/portal/doc', portalData, `siso_portal_doc_${data.docNumero}`);
      }
    } catch (e) { console.warn('Portal indexing failed:', e.message); }

    // Save the closed HC
    const toSave = { ...data, ...closeData, medicoId: userId, fechaModificacion: now.toISOString() };
    await save('/write/hc/save', toSave, `siso_patients_${userId}`);
    setIsDirty(false);

    alert(`✅ HC Cerrada\nCódigo: ${code}\nHash: ${hcHash.substring(0, 16)}...`);
  }, [data, companies, currentUser, activeDoctorData, save]);

  // RIPS
  const handleRIPS = useCallback(async () => {
    try {
      const { generateRIPSBatch } = await import('../modules/reports/services/ripsService');
      const rips = generateRIPSBatch([data]);
      const blob = new Blob([JSON.stringify(rips, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `RIPS_${data.docNumero || 'paciente'}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert('Error RIPS: ' + e.message); }
  }, [data]);

  // FHIR
  const handleFHIR = useCallback(async () => {
    try {
      const { generateFHIRBundle } = await import('../modules/reports/services/fhirService');
      const bundle = generateFHIRBundle(data, activeDoctorData);
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `FHIR_${data.docNumero || 'paciente'}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert('Error FHIR: ' + e.message); }
  }, [data]);

  const [showConsentModal, setShowConsentModal] = React.useState(false);
  const [showRecomendacionesPanel, setShowRecomendacionesPanel] = React.useState(false);
  const [showRestriccionesPanel, setShowRestriccionesPanel] = React.useState(false);
  const [showEnviarPanel, setShowEnviarPanel] = React.useState(false);
  const [enviarChecklist, setEnviarChecklist] = React.useState({
    certificado: true, historia: true, formula: false, derivacion: false, examenes: false,
  });

  // F4: Descargar/Enviar con combinación multi-documento
  const handleEnviar = useCallback(async () => {
    const { generateHCPrintHTML, openPrintWindow } = await import('../lib/printService');
    const selected = Object.entries(enviarChecklist).filter(([_, v]) => v).map(([k]) => k);
    if (selected.length === 0) { alert('Selecciona al menos un documento'); return; }

    const sections = [];
    if (enviarChecklist.certificado) {
      const { _generarCertificadoHTMLNormalizado } = await import('../shared/lib/printUtils');
      if (_generarCertificadoHTMLNormalizado) {
        sections.push(_generarCertificadoHTMLNormalizado(data, activeDoctorData, null, null));
      }
    }
    if (enviarChecklist.historia) {
      sections.push(generateHCPrintHTML(data, activeDoctorData));
    }
    // Combine with page breaks
    const combined = sections.join('<div style="page-break-before:always"></div>');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>OcupaSalud — ${data.nombres || 'Paciente'}</title>
      <style>@media print { body { margin: 0; } .no-print { display: none; } }</style></head>
      <body>${combined}
      <div class="no-print" style="text-align:center;padding:20px;border-top:2px solid #10b981;margin-top:20px;">
        <button onclick="window.print()" style="padding:8px 24px;background:#10b981;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;margin:4px;">🖨️ Imprimir / PDF</button>
        <button onclick="window.close()" style="padding:8px 24px;background:#6b7280;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;margin:4px;">Cerrar</button>
      </div></body></html>`;
    openPrintWindow(html);
    setShowEnviarPanel(false);
  }, [data, activeDoctorData, enviarChecklist]);

  const activeDoctorData = useMemo(() => doctor || { nombre: currentUser?.nombre || 'Médico', licencia: '' }, [doctor]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Back button */}
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 mb-3">
        <ArrowLeft className="w-4 h-4" /> Volver a pacientes
      </button>

      {/* ═══ ACTION BAR — matches ocupasalud ═══ */}
      <div className="bg-white border border-gray-200 rounded-xl p-2 mb-3 shadow-sm">
        {/* Tab row */}
        <div className="flex gap-1 overflow-x-auto pb-2 border-b border-gray-100 mb-2" style={{ scrollbarWidth: 'none' }}>
          {HC_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? `bg-${tab.color}-100 text-${tab.color}-800 shadow-sm`
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action buttons row */}
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => printHC(data, activeDoctorData)} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg whitespace-nowrap">
            <Printer className="w-3 h-3" /> Imprimir HC
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Guardar
          </button>
          {lastSaveStatus === 'ok' && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />OK</span>}
          <button onClick={onGenerateAI} disabled={isGenerating} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg whitespace-nowrap">
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Análisis IA
          </button>
          <button onClick={onGenerateRestrictions} disabled={isGeneratingRestr} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg whitespace-nowrap">
            {isGeneratingRestr ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Restricciones IA
          </button>
          <button onClick={onGenerateRecommendations} disabled={isGeneratingReco} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg whitespace-nowrap">
            {isGeneratingReco ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Recomendaciones IA
          </button>
          {isDirty && <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">⚠️ Sin guardar</span>}
          <button onClick={handleRIPS} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg whitespace-nowrap">
            <Database className="w-3 h-3" /> RIPS
          </button>
          <button onClick={handleFHIR} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg whitespace-nowrap">
            <Heart className="w-3 h-3" /> FHIR
          </button>
          <div className="relative">
            <button onClick={() => setShowEnviarPanel(!showEnviarPanel)} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap">
              <Download className="w-3 h-3" /> 📤 Enviar
            </button>
            {showEnviarPanel && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 w-64">
                <p className="text-xs font-black text-gray-800 mb-2">Seleccionar documentos:</p>
                {[
                  { key: 'certificado', label: 'Certificado Ocupacional', has: !!data.conceptoAptitud },
                  { key: 'historia', label: 'Historia Clínica', has: true },
                  { key: 'formula', label: 'Fórmula Médica', has: !!(data.medicamentos?.length) },
                  { key: 'derivacion', label: 'Derivaciones', has: !!(data.derivaciones?.length) },
                  { key: 'examenes', label: 'Solicitud Exámenes', has: !!(data.examenesSolicitados?.length) },
                ].map(({ key, label, has }) => (
                  <label key={key} className="flex items-center gap-2 text-xs py-1 cursor-pointer">
                    <input type="checkbox" checked={enviarChecklist[key]} onChange={(e) => setEnviarChecklist(prev => ({ ...prev, [key]: e.target.checked }))} className="w-3.5 h-3.5 accent-emerald-600" />
                    <span className={has ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
                    <span className="ml-auto text-[9px]">{has ? '✅' : 'Sin datos'}</span>
                  </label>
                ))}
                <div className="flex gap-1 mt-2 pt-2 border-t">
                  <button onClick={handleEnviar} className="flex-1 px-2 py-1.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">🖨️ Generar</button>
                  <button onClick={() => setShowEnviarPanel(false)} className="px-2 py-1.5 text-[10px] font-bold text-gray-600 bg-gray-100 rounded-lg">✕</button>
                </div>
              </div>
            )}
          </div>
          <button onClick={handleCloseHC} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg whitespace-nowrap">
            <Lock className="w-3 h-3" /> Cerrar HC
          </button>
          {data.estadoHistoria === 'Cerrada' && (
            <span className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-red-700 bg-red-100 rounded-lg whitespace-nowrap">
              🔒 Cerrada — {data.codigoVerificacion}
            </span>
          )}
        </div>
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <HCErrorBoundary>
        <Suspense fallback={<TabLoader />}>
          {activeTab === 'form' && (
            <OccupationalHC
              data={data} setData={setData} companies={companies} currentUser={currentUser}
              aiConfig={aiConfig} activeDoctorData={activeDoctorData} activeSignature={null}
              onGenerateAI={onGenerateAI}
              onGenerateRestrictions={onGenerateRestrictions}
              onGenerateRecommendations={onGenerateRecommendations}
              onOpenConsent={() => setShowConsentModal(true)}
              onOpenHistory={() => {}} onOpenRecommendations={() => setShowRecomendacionesPanel(true)}
              onOpenRestrictions={() => setShowRestriccionesPanel(true)}
              handleChange={null}
              handleCompanySelect={(e) => {
                const compId = e.target.value;
                const comp = companies.find(c => c.id === compId);
                if (comp) {
                  dispatch({
                    empresaId: compId, empresaNombre: comp.nombre,
                    ...(comp.arl && { arl: comp.arl }),
                    ...(comp.actividadEconomica && { actividadEconomica: comp.actividadEconomica }),
                    ...(comp.claseRiesgo && { nivelRiesgoARL: comp.claseRiesgo }),
                  });
                } else {
                  dispatch({ empresaId: 'particular', empresaNombre: '' });
                }
              }}
              handleNameChange={null}
              patientSuggestions={[]} selectPatientSuggestion={() => {}}
              historyNotification={null} isGenerating={isGenerating}
              isGeneratingReco={isGeneratingReco} isGeneratingRestr={isGeneratingRestr}
              showConsentModal={showConsentModal} setShowConsentModal={setShowConsentModal}
              showRecomendacionesPanel={showRecomendacionesPanel} setShowRecomendacionesPanel={setShowRecomendacionesPanel}
              showRestriccionesPanel={showRestriccionesPanel} setShowRestriccionesPanel={setShowRestriccionesPanel}
            />
          )}
          {activeTab === 'certificado' && (
            <CertificateView data={data} activeDoctorData={activeDoctorData} activeSignature={null} currentUser={currentUser} onDownloadRDA={() => {}} onPrintCarnet={() => {}} />
          )}
          {activeTab === 'formula' && (
            <TabFormulaDerivacion data={data} setData={setData} tipo="formula" doctorData={activeDoctorData} />
          )}
          {activeTab === 'derivacion' && (
            <TabFormulaDerivacion data={data} setData={setData} tipo="derivacion" doctorData={activeDoctorData} />
          )}
          {activeTab === 'examenes' && (
            <ExamRequestTab patientData={data} doctorData={activeDoctorData} />
          )}
          {activeTab === 'adjuntos' && (
            <AttachmentsTab patientId={data.docNumero} />
          )}
          {activeTab === 'incapacidad' && (
            <DisabilityTab patientData={data} doctorData={activeDoctorData} />
          )}
          {activeTab === 'evolucion' && (
            <EvolucionModal patientId={data.docNumero || data.id} patientName={data.nombres} doctorData={activeDoctorData} onClose={() => setActiveTab('form')} />
          )}
        </Suspense>
      </HCErrorBoundary>
    </div>
  );
}
