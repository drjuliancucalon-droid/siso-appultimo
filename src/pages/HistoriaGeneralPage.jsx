// src/pages/HistoriaGeneralPage.jsx — HC General with action tabs
import React, { useReducer, useCallback, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import { useSaveData } from '../hooks/useSaveData';
import { printHC } from '../lib/printService';
import { initialGeneralPatientState } from '../shared/data/initialStates';
import {
  ArrowLeft, Save, Printer, Loader2, CheckCircle, AlertTriangle,
  FileText, Pill, TestTube, Paperclip, Hospital, Sparkles, ClipboardList
} from 'lucide-react';

const GeneralHC = React.lazy(() => import('../modules/clinical/components/GeneralHC').then(m => ({ default: m.GeneralHC || m.default })));
const TabFormulaDerivacion = React.lazy(() => import('../components/forms/TabFormulaDerivacion').then(m => ({ default: m.TabFormulaDerivacion || m.default })));
const ExamRequestTab = React.lazy(() => import('../modules/clinical/components/ExamRequestTab').then(m => ({ default: m.ExamRequestTab || m.default })));
const AttachmentsTab = React.lazy(() => import('../modules/clinical/components/AttachmentsTab').then(m => ({ default: m.AttachmentsTab || m.default })));
const DisabilityTab = React.lazy(() => import('../modules/clinical/components/DisabilityTab').then(m => ({ default: m.DisabilityTab || m.default })));
const EvolucionModal = React.lazy(() => import('../modules/clinical/components/EvolucionModal').then(m => ({ default: m.EvolucionModal || m.default })));

class HCErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
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

const TABS = [
  { id: 'form', label: 'HC General', icon: FileText, color: 'teal' },
  { id: 'formula', label: 'Fórmula', icon: Pill, color: 'purple' },
  { id: 'examenes', label: 'Exámenes', icon: TestTube, color: 'blue' },
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

  const [data, dispatch] = useReducer(hcReducer, { ...initialGeneralPatientState, tipoHistoria: 'general', fechaExamen: new Date().toISOString().split('T')[0] });
  const setData = useCallback((updates) => dispatch(updates), []);
  const [activeTab, setActiveTab] = React.useState('form');
  const [isGenerating, setIsGenerating] = React.useState(false);

  const { save, saving, lastSaveStatus } = useSaveData();
  const handleSave = useCallback(async () => {
    const userId = currentUser?.user || 'drcucalon';
    const toSave = { ...data, medicoId: userId, fechaModificacion: new Date().toISOString() };
    if (!toSave.id) { toSave.id = `hcg_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; toSave.fechaCreacion = new Date().toISOString(); }
    const result = await save('/write/hc/save', toSave, `siso_patients_${userId}`);
    if (result.ok) alert('✅ HC General guardada'); else alert('❌ Error al guardar');
  }, [data, save, currentUser]);

  const onGenerateAI = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { callAIWithFailover } = await import('../modules/ai/services/aiAnalysis');
      const result = await callAIWithFailover(`Analiza esta HC general:\n${JSON.stringify(data)}`, 'Eres un médico general colombiano experto.', aiConfig);
      dispatch({ analisis: result });
    } catch (e) { alert('Error IA: ' + e.message); }
    finally { setIsGenerating(false); }
  }, [data, aiConfig]);

  const activeDoctorData = useMemo(() => doctor || { nombre: currentUser?.nombre || 'Médico', licencia: '' }, [doctor]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 mb-3">
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
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => printHC(data, activeDoctorData)} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg whitespace-nowrap">
            <Printer className="w-3 h-3" /> Imprimir
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Guardar
          </button>
          <button onClick={onGenerateAI} disabled={isGenerating} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg whitespace-nowrap">
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} IA
          </button>
        </div>
      </div>

      {/* Tab content */}
      <HCErrorBoundary>
        <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>}>
          {activeTab === 'form' && <GeneralHC data={data} setData={setData} activeDoctorData={activeDoctorData} activeSignature={null} patientsList={patients} currentUser={currentUser} onGenerateAI={onGenerateAI} isGenerating={isGenerating} historyNotification={null} />}
          {activeTab === 'formula' && <TabFormulaDerivacion data={data} setData={setData} tipo="formula" doctorData={activeDoctorData} />}
          {activeTab === 'examenes' && <ExamRequestTab patientData={data} doctorData={activeDoctorData} />}
          {activeTab === 'adjuntos' && <AttachmentsTab patientId={data.docNumero} />}
          {activeTab === 'incapacidad' && <DisabilityTab patientData={data} doctorData={activeDoctorData} />}
          {activeTab === 'evolucion' && <EvolucionModal patientData={data} doctorData={activeDoctorData} onSave={(ev) => dispatch({ evoluciones: [...(data.evoluciones || []), ev] })} />}
        </Suspense>
      </HCErrorBoundary>
    </div>
  );
}
