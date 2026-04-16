// src/pages/HistoriaGeneralPage.jsx — HC General (reconstrucción desde ocupasalud)
// REGLA: CERO React.lazy() para tabs internos.
import React, { useReducer, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import { useSaveData } from '../hooks/useSaveData';
import { printHC } from '../lib/printService';
import { initialGeneralPatientState } from '../shared/data/initialStates';
import {
  ArrowLeft, Save, Printer, Loader2, CheckCircle, AlertTriangle,
  FileText, Pill, TestTube, Paperclip, Hospital, Sparkles, ClipboardList, Settings, Lock
} from 'lucide-react';

// ═══ STATIC IMPORTS ═══
import { GeneralHC } from '../modules/clinical/components/GeneralHC';
import TabFormulaDerivacion from '../components/forms/TabFormulaDerivacion';
import { ExamRequestTab } from '../modules/clinical/components/ExamRequestTab';
import { AttachmentsTab } from '../modules/clinical/components/AttachmentsTab';
import { DisabilityTab } from '../modules/clinical/components/DisabilityTab';
import { EvolucionModal } from '../modules/clinical/components/EvolucionModal';
import { AIConfigPanel } from '../modules/ai/components/AIConfigPanel';

// Error boundary
class HCErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(e) { console.error('HC General Error:', e.message, e.stack); }
  render() {
    if (this.state.error) return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-4">
        <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
        <h3 className="font-bold text-red-800 text-sm">Error en este módulo</h3>
        <p className="text-xs text-red-600 mt-1 font-mono">{this.state.error.message}</p>
        <button onClick={() => this.setState({ error: null })} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold">Reintentar</button>
      </div>
    );
    return this.props.children;
  }
}

const TABS = [
  { id: 'form', label: 'HC General', icon: FileText, color: 'blue' },
  { id: 'formulaTab', label: 'Fórmula', icon: Pill, color: 'purple' },
  { id: 'examenes', label: 'Exámenes', icon: TestTube, color: 'teal' },
  { id: 'adjuntos', label: 'Adjuntos', icon: Paperclip, color: 'orange' },
  { id: 'incapacidad', label: 'Incapacidad', icon: Hospital, color: 'red' },
  { id: 'evolucion', label: 'Evolución', icon: ClipboardList, color: 'violet' },
];

function hcReducer(state, action) {
  if (typeof action === 'function') return action(state);
  return { ...state, ...action };
}

export default function HistoriaGeneralPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore.getState().currentUser;
  const aiConfig = useMemo(() => useAIStore.getState().getConfig(), []);
  const { data: patients } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
  const { data: doctor } = useBackendObject('/data/doctor', 'siso_doctor_data', 'doctor');

  // ═══ State (declarations EARLY) ═══
  const activeDoctorData = useMemo(() => doctor || {
    nombre: currentUser?.nombre || 'Médico', titulo: 'Medicina General',
    licencia: '--', cedula: '--', ciudad: '', celular: ''
  }, [doctor, currentUser]);

  const { save, saving, lastSaveStatus } = useSaveData();

  const [data, dispatch] = useReducer(hcReducer, {
    ...initialGeneralPatientState,
    tipoHistoria: 'general',
    fechaExamen: new Date().toISOString().split('T')[0],
  });
  const setData = useCallback((updates) => dispatch(updates), []);
  const [activeTab, setActiveTab] = useState('form');

  // ═══ Dirty tracking ═══
  const [isDirty, setIsDirty] = useState(false);
  const prevDataRef = useRef(JSON.stringify(data));
  useEffect(() => {
    const current = JSON.stringify(data);
    if (current !== prevDataRef.current) { setIsDirty(true); prevDataRef.current = current; }
  }, [data]);

  // ═══ Save ═══
  const handleSave = useCallback(async () => {
    const userId = currentUser?.user || 'drcucalon';
    const toSave = { ...data, medicoId: userId, fechaModificacion: new Date().toISOString() };
    if (!toSave.id) { toSave.id = `hcg_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; toSave.fechaCreacion = new Date().toISOString(); }
    const result = await save('/write/hc/save', toSave, `siso_patients_${userId}`);
    setIsDirty(false);
    if (result.ok) alert('✅ HC General guardada'); else alert('❌ Error al guardar');
  }, [data, save, currentUser]);

  // ═══ AI ═══
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRestr, setIsGeneratingRestr] = useState(false);
  const [isGeneratingReco, setIsGeneratingReco] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);

  const onGenerateAI = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { analyzeGeneralHC } = await import('../modules/ai/services/aiAnalysis');
      const result = await analyzeGeneralHC(data, aiConfig);
      try {
        const { parseAIJSON } = await import('../shared/lib/aiProviders');
        const parsed = parseAIJSON(result);
        dispatch({
          analisis: parsed.analisis || parsed.resumen || result,
          ...(parsed.diagnosticos && { diagnosticos: parsed.diagnosticos }),
          ...(parsed.planManejo && { planManejo: parsed.planManejo }),
          ...(parsed.recomendaciones && { recomendaciones: parsed.recomendaciones }),
        });
      } catch { dispatch({ analisis: result }); }
    } catch (e) { alert('Error IA: ' + e.message); }
    finally { setIsGenerating(false); }
  }, [data, aiConfig]);

  const onGenerateRestrictions = useCallback(async () => {
    setIsGeneratingRestr(true);
    try {
      const { generateRestrictions } = await import('../modules/ai/services/aiAnalysis');
      dispatch({ restriccionesTexto: await generateRestrictions(data, aiConfig) });
    } catch (e) { alert('Error IA: ' + e.message); }
    finally { setIsGeneratingRestr(false); }
  }, [data, aiConfig]);

  const onGenerateRecommendations = useCallback(async () => {
    setIsGeneratingReco(true);
    try {
      const { generateRecommendations } = await import('../modules/ai/services/aiAnalysis');
      dispatch({ recomendacionesTexto: await generateRecommendations(data, aiConfig) });
    } catch (e) { alert('Error IA: ' + e.message); }
    finally { setIsGeneratingReco(false); }
  }, [data, aiConfig]);

  // ═══ RENDER ═══
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 mb-3">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* Action bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-2 mb-3 shadow-sm">
        <div className="flex gap-1 overflow-x-auto pb-2 border-b border-gray-100 mb-2" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id ? `bg-${tab.color}-100 text-${tab.color}-800 shadow-sm` : 'text-gray-500 hover:bg-gray-100'
              }`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => printHC(data, activeDoctorData)} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <Printer className="w-3 h-3" /> Imprimir
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Guardar
          </button>
          {lastSaveStatus === 'ok' && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />OK</span>}
          <button onClick={onGenerateAI} disabled={isGenerating} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg">
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} IA
          </button>
          <button onClick={() => setShowAIConfig(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg">
            <Settings className="w-3 h-3" /> Config IA
          </button>
          {isDirty && <span className="text-[10px] text-amber-600 font-bold">⚠️ Sin guardar</span>}
        </div>
      </div>

      {/* Tab content */}
      <HCErrorBoundary>
        {activeTab === 'form' && (
          <GeneralHC data={data} setData={setData} activeDoctorData={activeDoctorData} activeSignature={null}
            patientsList={patients} currentUser={currentUser} onGenerateAI={onGenerateAI}
            onGenerateRestrictions={onGenerateRestrictions} onGenerateRecommendations={onGenerateRecommendations}
            isGenerating={isGenerating} isGeneratingRestr={isGeneratingRestr} isGeneratingReco={isGeneratingReco}
            historyNotification={null} />
        )}
        {activeTab === 'formulaTab' && (
          <TabFormulaDerivacion data={data} setData={setData} activeDoctorData={activeDoctorData} activeSignature={null} forceTab="formula" />
        )}
        {activeTab === 'examenes' && <ExamRequestTab patientData={data} doctorData={activeDoctorData} />}
        {activeTab === 'adjuntos' && <AttachmentsTab patientId={data.docNumero} />}
        {activeTab === 'incapacidad' && <DisabilityTab patientData={data} doctorData={activeDoctorData} />}
        {activeTab === 'evolucion' && <EvolucionModal patientId={data.docNumero || data.id} patientName={data.nombres} doctorData={activeDoctorData} onClose={() => setActiveTab('form')} />}
      </HCErrorBoundary>

      {/* AI Config Modal */}
      {showAIConfig && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAIConfig(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <AIConfigPanel aiConfig={aiConfig}
              onSave={(cfg) => { const s = useAIStore.getState(); if (cfg.activeProvider) s.setActiveProvider(cfg.activeProvider); if (cfg.keys) Object.entries(cfg.keys).forEach(([p,k]) => s.setKey(p,k)); setShowAIConfig(false); }}
              onClose={() => setShowAIConfig(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
