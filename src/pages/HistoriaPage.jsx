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

  // Save
  const { save, saving, lastSaveStatus } = useSaveData();
  const handleSave = useCallback(async () => {
    const userId = currentUser?.user || 'drcucalon';
    const toSave = { ...data, medicoId: userId, fechaModificacion: new Date().toISOString() };
    if (!toSave.id) { toSave.id = `hc_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; toSave.fechaCreacion = new Date().toISOString(); }
    const result = await save('/write/hc/save', toSave, `siso_patients_${userId}`);
    if (result.ok) alert('✅ HC guardada'); else alert('❌ Error al guardar');
  }, [data, save, currentUser]);

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

  // Close HC
  const handleCloseHC = useCallback(() => {
    if (!confirm('¿Cerrar esta Historia Clínica? Una vez cerrada no se puede editar.')) return;
    const code = `SISO-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString().slice(-8)}-${Math.random().toString(16).slice(2, 18).toUpperCase()}`;
    dispatch({ estadoHistoria: 'Cerrada', codigoVerificacion: code, fechaCierre: new Date().toISOString() });
    alert(`✅ HC Cerrada\nCódigo de verificación: ${code}`);
  }, []);

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
            <EvolucionModal patientData={data} doctorData={activeDoctorData} onSave={(ev) => dispatch({ evoluciones: [...(data.evoluciones || []), ev] })} />
          )}
        </Suspense>
      </HCErrorBoundary>
    </div>
  );
}
