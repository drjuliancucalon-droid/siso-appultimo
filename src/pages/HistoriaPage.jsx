// src/pages/HistoriaPage.jsx — HC Ocupacional with useReducer to prevent loops
import React, { useReducer, useCallback, useRef, useMemo, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import { useSaveData } from '../hooks/useSaveData';
import { printHC } from '../lib/printService';
import { initialOccupPatientState } from '../shared/data/initialStates';
import { ArrowLeft, Save, Printer, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const OccupationalHC = React.lazy(() => import('../modules/clinical/components/OccupationalHC'));

class HCErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(e) { console.error('HC Error:', e.message); }
  render() {
    if (this.state.error) return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-4">
        <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
        <h3 className="font-bold text-amber-800">Formulario HC — Error de compatibilidad</h3>
        <p className="text-sm text-amber-700 mt-2">{this.state.error.message}</p>
        <button onClick={() => this.setState({ error: null })} className="mt-3 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-bold">Reintentar</button>
      </div>
    );
    return this.props.children;
  }
}

// Use reducer instead of useState to prevent infinite setState loops
function hcReducer(state, action) {
  if (typeof action === 'function') return action(state);
  return { ...state, ...action };
}

export default function HistoriaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore.getState().currentUser;
  const aiConfig = useMemo(() => useAIStore.getState().getConfig(), []);
  const { data: patients } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
  const { data: companies } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const { data: doctor } = useBackendObject('/data/doctor', 'siso_doctor_data', 'doctor');

  const [data, dispatch] = useReducer(hcReducer, {
    ...initialOccupPatientState,
    tipoHistoria: 'ocupacional',
    fechaExamen: new Date().toISOString().split('T')[0],
  });

  // Load patient once
  const loaded = useRef(false);
  React.useEffect(() => {
    if (id && patients.length > 0 && !loaded.current) {
      const p = patients.find((x) => x.docNumero === id || x.id === id);
      if (p) { dispatch(p); loaded.current = true; }
    }
  }, [id, patients.length]);

  // Stable dispatch — never changes reference
  const setData = useCallback((updates) => dispatch(updates), []);

  const { save, saving, lastSaveStatus } = useSaveData();
  const handleSave = useCallback(async () => {
    const userId = currentUser?.user || 'drcucalon';
    const toSave = { ...data, medicoId: userId, fechaModificacion: new Date().toISOString() };
    if (!toSave.id) { toSave.id = `hc_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; toSave.fechaCreacion = new Date().toISOString(); }
    const result = await save('/write/hc/save', toSave, `siso_patients_${userId}`);
    if (result.ok) alert('✅ HC guardada'); else alert('❌ Error al guardar');
  }, [data, save, currentUser]);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const onGenerateAI = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { callAIWithFailover } = await import('../modules/ai/services/aiAnalysis');
      const result = await callAIWithFailover(`Analiza esta HC:\n${JSON.stringify(data)}`, undefined, aiConfig);
      dispatch({ analisis: result });
    } catch (e) { alert('Error IA: ' + e.message); }
    finally { setIsGenerating(false); }
  }, [data, aiConfig]);

  const [showConsentModal, setShowConsentModal] = React.useState(false);
  const [showRecomendacionesPanel, setShowRecomendacionesPanel] = React.useState(false);
  const [showRestriccionesPanel, setShowRestriccionesPanel] = React.useState(false);

  const activeDoctorData = useMemo(() => doctor || { nombre: currentUser?.nombre || 'Médico', licencia: '' }, [doctor]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a pacientes
      </button>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {lastSaveStatus === 'ok' && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Guardado</span>}
        <button onClick={() => printHC(data, activeDoctorData)} className="bg-white text-emerald-700 border-2 border-emerald-300 px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-50 flex items-center gap-2">
          <Printer className="w-4 h-4" /><span className="hidden sm:inline">Imprimir</span>
        </button>
        <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Guardando...' : 'Guardar HC'}
        </button>
      </div>
      <HCErrorBoundary>
        <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>}>
          <OccupationalHC
            data={data}
            setData={setData}
            companies={companies}
            currentUser={currentUser}
            aiConfig={aiConfig}
            activeDoctorData={activeDoctorData}
            activeSignature={null}
            onGenerateAI={onGenerateAI}
            onOpenConsent={() => setShowConsentModal(true)}
            onOpenHistory={() => {}}
            onOpenRecommendations={() => setShowRecomendacionesPanel(true)}
            onOpenRestrictions={() => setShowRestriccionesPanel(true)}
            handleChange={null}
            handleCompanySelect={null}
            handleNameChange={null}
            patientSuggestions={[]}
            selectPatientSuggestion={() => {}}
            historyNotification={null}
            isGenerating={isGenerating}
            isGeneratingReco={false}
            isGeneratingRestr={false}
            showConsentModal={showConsentModal}
            setShowConsentModal={setShowConsentModal}
            showRecomendacionesPanel={showRecomendacionesPanel}
            setShowRecomendacionesPanel={setShowRecomendacionesPanel}
            showRestriccionesPanel={showRestriccionesPanel}
            setShowRestriccionesPanel={setShowRestriccionesPanel}
          />
        </Suspense>
      </HCErrorBoundary>
    </div>
  );
}
