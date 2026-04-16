// src/pages/HistoriaPage.jsx — HC Ocupacional (reconstrucción desde ocupasalud)
// REGLA: CERO React.lazy() para tabs internos. Todo estático.
import React, { useReducer, useCallback, useRef, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import { useSaveData } from '../hooks/useSaveData';
import { printHC, generateHCPrintHTML, openPrintWindow } from '../lib/printService';
import { initialOccupPatientState } from '../shared/data/initialStates';
import { _sha256 } from '../shared/lib/crypto';

// Lucide icons — imported ONCE at page level
import {
  ArrowLeft, Save, Printer, Loader2, CheckCircle, AlertTriangle,
  Stethoscope, FileText, Pill, GitBranch, TestTube, Paperclip,
  Hospital, Sparkles, Database, Heart, Lock, ClipboardList,
  Download, Settings, X
} from 'lucide-react';

// ═══ STATIC IMPORTS — NO React.lazy() ═══
// Each component is bundled with this page chunk
import OccupationalHC from '../modules/clinical/components/OccupationalHC';
import { CertificateView } from '../modules/clinical/components/CertificateView';
import TabFormulaDerivacion from '../modules/clinical/components/PrescriptionTab';
import { ExamRequestTab } from '../modules/clinical/components/ExamRequestTab';
import { AttachmentsTab } from '../modules/clinical/components/AttachmentsTab';
import { DisabilityTab } from '../modules/clinical/components/DisabilityTab';
import { EvolucionModal } from '../modules/clinical/components/EvolucionModal';
import { AIConfigPanel } from '../modules/ai/components/AIConfigPanel';
import RestriccionesChecklistPanel from '../components/panels/RestriccionesChecklistPanel';
import RecomendacionesChecklistPanel from '../components/panels/RecomendacionesChecklistPanel';
import ConsentimientoModal from '../components/modals/ConsentimientoModal';

// ═══ Error Boundary ═══
class HCErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(e) { console.error('HC Error:', e.message, e.stack); }
  render() {
    if (this.state.error) return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-4">
        <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
        <h3 className="font-bold text-red-800 text-sm">Error en este módulo</h3>
        <p className="text-xs text-red-600 mt-1 font-mono">{this.state.error.message}</p>
        <button onClick={() => this.setState({ error: null })} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Reintentar</button>
      </div>
    );
    return this.props.children;
  }
}

// ═══ Tabs definition (matches ocupasalud) ═══
const HC_TABS = [
  { id: 'form', label: 'HC', icon: Stethoscope, color: 'emerald' },
  { id: 'certificado', label: 'Certificado', icon: FileText, color: 'blue' },
  { id: 'formulaTab', label: 'Fórmula', icon: Pill, color: 'purple' },
  { id: 'derivacionTab', label: 'Derivación', icon: GitBranch, color: 'indigo' },
  { id: 'solicitudExamenes', label: 'Exámenes', icon: TestTube, color: 'teal' },
  { id: 'adjuntos', label: 'Adjuntos', icon: Paperclip, color: 'orange' },
  { id: 'incapacidad', label: 'Incapacidad', icon: Hospital, color: 'red' },
  { id: 'evolucion', label: 'Evolución', icon: ClipboardList, color: 'violet' },
];

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

  // ═══ State ═══
  const [data, dispatch] = useReducer(hcReducer, {
    ...initialOccupPatientState,
    tipoHistoria: 'ocupacional',
    fechaExamen: new Date().toISOString().split('T')[0],
  });
  const setData = useCallback((updates) => dispatch(updates), []);
  const [activeTab, setActiveTab] = useState('form');

  // Doctor data (declared EARLY to avoid TDZ)
  const activeDoctorData = useMemo(() => doctor || {
    nombre: currentUser?.nombre || 'Médico',
    titulo: 'Especialista SST',
    licencia: '--', cedula: '--', ciudad: '', celular: ''
  }, [doctor, currentUser]);

  // Save hook (declared EARLY)
  const { save, saving, lastSaveStatus } = useSaveData();

  // ═══ Load patient ═══
  const loaded = useRef(false);
  useEffect(() => {
    if (id && patients.length > 0 && !loaded.current) {
      const p = patients.find((x) => x.docNumero === id || x.id === id);
      if (p) { dispatch(p); loaded.current = true; }
    }
  }, [id, patients.length]);

  // ═══ Dirty tracking + Auto-save ═══
  const [isDirty, setIsDirty] = useState(false);
  const prevDataRef = useRef(JSON.stringify(data));
  useEffect(() => {
    const current = JSON.stringify(data);
    if (current !== prevDataRef.current) { setIsDirty(true); prevDataRef.current = current; }
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty && data.nombres) {
        const userId = currentUser?.user || 'drcucalon';
        const toSave = { ...data, medicoId: userId, fechaModificacion: new Date().toISOString(), autoSaved: true };
        save('/write/hc/save', toSave, `siso_patients_${userId}`).then((r) => {
          if (r.ok) { setIsDirty(false); }
        }).catch(() => {});
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isDirty, data, currentUser, save]);

  // ═══ Save ═══
  const handleSave = useCallback(async () => {
    const userId = currentUser?.user || 'drcucalon';
    const isNew = !data.id;
    const toSave = { ...data, medicoId: userId, fechaModificacion: new Date().toISOString() };
    if (!toSave.id) {
      toSave.id = `hc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      toSave.fechaCreacion = new Date().toISOString();
    }
    const result = await save('/write/hc/save', toSave, `siso_patients_${userId}`);
    // Auto-agenda para paciente nuevo
    if (result.ok && isNew && data.nombres) {
      try {
        const company = companies.find(c => c.id === data.empresaId);
        const tarifa = company?.tarifaPeriodico || company?.tarifaConsulta || 35000;
        await save('/write/agenda/add', {
          id: `cita_${Date.now()}`, paciente: data.nombres, docNumero: data.docNumero,
          empresa: company?.nombre || 'Particular', tipo: data.tipoExamen || 'PERIODICO',
          medicoId: userId, fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().slice(0, 5), estado: 'atendido', costo: tarifa,
        }, 'siso_agendados');
      } catch {}
    }
    setIsDirty(false);
    if (result.ok) alert('✅ HC guardada'); else alert('❌ Error al guardar');
  }, [data, save, currentUser, companies]);

  // ═══ AI ═══
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRestr, setIsGeneratingRestr] = useState(false);
  const [isGeneratingReco, setIsGeneratingReco] = useState(false);

  const onGenerateAI = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { analyzeHC } = await import('../modules/ai/services/aiAnalysis');
      const result = await analyzeHC(data, aiConfig);
      try {
        const { parseAIJSON } = await import('../shared/lib/aiProviders');
        const parsed = parseAIJSON(result);
        dispatch({
          analisis: parsed.analisis || parsed.resumen || result,
          ...(parsed.conceptoAptitud && { conceptoAptitud: parsed.conceptoAptitud }),
          ...(parsed.restricciones && { restricciones: parsed.restricciones }),
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

  // ═══ Close HC (full — hash + portal + billing) ═══
  const handleCloseHC = useCallback(async () => {
    if (!confirm('¿Cerrar esta Historia Clínica? Una vez cerrada no se puede editar.')) return;
    const now = new Date();
    const code = `SISO-${now.toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString().slice(-8)}-${Math.random().toString(16).slice(2, 18).toUpperCase()}`;
    let hcHash = '';
    try { hcHash = await _sha256(JSON.stringify(data)); } catch { hcHash = 'hash-error'; }

    const userId = currentUser?.user || 'drcucalon';
    const closeData = {
      estadoHistoria: 'Cerrada', codigoVerificacion: code, fechaCierre: now.toISOString(),
      hashHC: hcHash, firmaMedico: activeDoctorData?.nombre || userId, firmaFecha: now.toISOString(),
    };
    dispatch(closeData);

    // Auto-billing
    try {
      const company = companies.find(c => c.id === data.empresaId);
      const tarifa = company?.tarifaPeriodico || company?.tarifaConsulta || 35000;
      await save('/write/caja/add', {
        id: `mov_${Date.now()}`, tipo: 'ingreso',
        concepto: `HC ${data.tipoExamen || 'PERIODICO'} — ${data.nombres || 'Paciente'}`,
        monto: tarifa, empresa: company?.nombre || 'Particular', paciente: data.nombres,
        medicoId: userId, fecha: now.toISOString(), estado: 'pendiente', _autoGenerated: true,
      }, `siso_caja_movs_${userId}`);
    } catch {}

    // Portal indexing
    try {
      const portalData = {
        nombres: data.nombres, docNumero: data.docNumero, conceptoAptitud: data.conceptoAptitud,
        restricciones: data.restricciones, recomendaciones: data.recomendaciones,
        tipoExamen: data.tipoExamen, fecha: now.toISOString(), codigo: code, hashHC: hcHash,
        medico: activeDoctorData?.nombre || userId,
      };
      await save('/write/portal/index', portalData, `siso_portal_${code}`);
      if (data.docNumero) await save('/write/portal/doc', portalData, `siso_portal_doc_${data.docNumero}`);
    } catch {}

    const toSave = { ...data, ...closeData, medicoId: userId, fechaModificacion: now.toISOString() };
    await save('/write/hc/save', toSave, `siso_patients_${userId}`);
    setIsDirty(false);
    alert(`✅ HC Cerrada\nCódigo: ${code}\nHash: ${hcHash.substring(0, 16)}...`);
  }, [data, companies, currentUser, activeDoctorData, save]);

  // ═══ RIPS ═══
  const handleRIPS = useCallback(async () => {
    try {
      const { generateRIPSBatch } = await import('../modules/reports/services/ripsService');
      const blob = new Blob([JSON.stringify(generateRIPSBatch([data]), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: `RIPS_${data.docNumero || 'pac'}.json` }).click();
      URL.revokeObjectURL(url);
    } catch (e) { alert('Error RIPS: ' + e.message); }
  }, [data]);

  // ═══ FHIR ═══
  const handleFHIR = useCallback(async () => {
    try {
      const { generateFHIRBundle } = await import('../modules/reports/services/fhirService');
      const blob = new Blob([JSON.stringify(generateFHIRBundle(data, activeDoctorData), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: `FHIR_${data.docNumero || 'pac'}.json` }).click();
      URL.revokeObjectURL(url);
    } catch (e) { alert('Error FHIR: ' + e.message); }
  }, [data, activeDoctorData]);

  // ═══ UI state ═══
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showRecomendacionesPanel, setShowRecomendacionesPanel] = useState(false);
  const [showRestriccionesPanel, setShowRestriccionesPanel] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showEnviarPanel, setShowEnviarPanel] = useState(false);
  const [enviarChecklist, setEnviarChecklist] = useState({
    certificado: true, historia: true, formula: false, derivacion: false, examenes: false,
  });

  // ═══ Enviar multi-doc ═══
  const handleEnviar = useCallback(() => {
    const html = generateHCPrintHTML(data, activeDoctorData);
    openPrintWindow(html);
    setShowEnviarPanel(false);
  }, [data, activeDoctorData]);

  // ═══ RENDER ═══
  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 mb-3">
        <ArrowLeft className="w-4 h-4" /> Volver a pacientes
      </button>

      {/* ═══ ACTION BAR ═══ */}
      <div className="bg-white border border-gray-200 rounded-xl p-2 mb-3 shadow-sm">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 border-b border-gray-100 mb-2" style={{ scrollbarWidth: 'none' }}>
          {HC_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id ? `bg-${tab.color}-100 text-${tab.color}-800 shadow-sm` : 'text-gray-500 hover:bg-gray-100'
              }`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => printHC(data, activeDoctorData)} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg">
            <Printer className="w-3 h-3" /> Imprimir HC
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Guardar
          </button>
          {lastSaveStatus === 'ok' && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />OK</span>}
          <button onClick={onGenerateAI} disabled={isGenerating} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg">
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Análisis IA
          </button>
          <button onClick={onGenerateRestrictions} disabled={isGeneratingRestr} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg">
            {isGeneratingRestr ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Restricciones IA
          </button>
          <button onClick={onGenerateRecommendations} disabled={isGeneratingReco} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg">
            {isGeneratingReco ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Recomendaciones IA
          </button>
          <button onClick={() => setShowAIConfig(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg">
            <Settings className="w-3 h-3" /> Config IA
          </button>
          <button onClick={handleRIPS} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg">
            <Database className="w-3 h-3" /> RIPS
          </button>
          <button onClick={handleFHIR} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg">
            <Heart className="w-3 h-3" /> FHIR
          </button>
          <div className="relative">
            <button onClick={() => setShowEnviarPanel(!showEnviarPanel)} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
              <Download className="w-3 h-3" /> {showEnviarPanel ? '✕ Cerrar' : '📤 Enviar'}
            </button>
            {showEnviarPanel && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 w-64">
                <p className="text-xs font-black text-gray-800 mb-2">Documentos:</p>
                {[
                  { key: 'certificado', label: '✅ Certificado Ocupacional', has: !!data.conceptoAptitud },
                  { key: 'historia', label: '✅ Historia Clínica', has: true },
                  { key: 'formula', label: '💊 Fórmula / Prescripción', has: !!(data.formulaMedicamentos?.length) },
                  { key: 'derivacion', label: '🔀 Derivación / Interconsulta', has: !!(data.derivaciones?.length) },
                  { key: 'examenes', label: '🔬 Solicitud Exámenes', has: !!(data.examenesSolicitados?.length) },
                ].map(({ key, label, has }) => (
                  <label key={key} className="flex items-center gap-2 text-xs py-1 cursor-pointer">
                    <input type="checkbox" checked={has ? !!enviarChecklist[key] : false} disabled={!has}
                      onChange={(e) => setEnviarChecklist(prev => ({ ...prev, [key]: e.target.checked }))} className="w-3.5 h-3.5 accent-emerald-600" />
                    <span className={has ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
                    <span className="ml-auto text-[9px]">{has ? '✅' : 'Sin datos'}</span>
                  </label>
                ))}
                <button onClick={handleEnviar} className="w-full mt-2 px-2 py-1.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                  🖨️ Generar Documentos
                </button>
              </div>
            )}
          </div>
          <button onClick={handleCloseHC} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">
            <Lock className="w-3 h-3" /> Cerrar HC
          </button>
          {isDirty && <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">⚠️ Sin guardar</span>}
          {data.estadoHistoria === 'Cerrada' && (
            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-1 rounded-lg">🔒 {data.codigoVerificacion}</span>
          )}
        </div>
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <HCErrorBoundary>
        {activeTab === 'form' && (
          <OccupationalHC
            data={data} setData={setData} companies={companies} currentUser={currentUser}
            aiConfig={aiConfig} activeDoctorData={activeDoctorData} activeSignature={null}
            onGenerateAI={onGenerateAI} onGenerateRestrictions={onGenerateRestrictions}
            onGenerateRecommendations={onGenerateRecommendations}
            onOpenConsent={() => setShowConsentModal(true)}
            onOpenHistory={() => {}}
            onOpenRecommendations={() => setShowRecomendacionesPanel(true)}
            onOpenRestrictions={() => setShowRestriccionesPanel(true)}
            handleChange={null}
            handleCompanySelect={(e) => {
              const comp = companies.find(c => c.id === e.target.value);
              if (comp) dispatch({ empresaId: comp.id, empresaNombre: comp.nombre, ...(comp.arl && { arl: comp.arl }), ...(comp.claseRiesgo && { nivelRiesgoARL: comp.claseRiesgo }) });
              else dispatch({ empresaId: 'particular', empresaNombre: '' });
            }}
            handleNameChange={null} patientSuggestions={[]} selectPatientSuggestion={() => {}}
            historyNotification={null} isGenerating={isGenerating}
            isGeneratingReco={isGeneratingReco} isGeneratingRestr={isGeneratingRestr}
            showConsentModal={showConsentModal} setShowConsentModal={setShowConsentModal}
            showRecomendacionesPanel={showRecomendacionesPanel} setShowRecomendacionesPanel={setShowRecomendacionesPanel}
            showRestriccionesPanel={showRestriccionesPanel} setShowRestriccionesPanel={setShowRestriccionesPanel}
          />
        )}
        {activeTab === 'certificado' && (
          <CertificateView data={data} activeDoctorData={activeDoctorData} activeSignature={null} currentUser={currentUser} />
        )}
        {activeTab === 'formulaTab' && (
          <TabFormulaDerivacion data={data} setData={setData} activeDoctorData={activeDoctorData} activeSignature={null} forceTab="formula" />
        )}
        {activeTab === 'derivacionTab' && (
          <TabFormulaDerivacion data={data} setData={setData} activeDoctorData={activeDoctorData} activeSignature={null} forceTab="derivacion" />
        )}
        {activeTab === 'solicitudExamenes' && (
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
      </HCErrorBoundary>

      {/* ═══ Panels: Restricciones, Recomendaciones, Consentimiento ═══ */}
      {showRestriccionesPanel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowRestriccionesPanel(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <RestriccionesChecklistPanel data={data} setData={setData} onClose={() => setShowRestriccionesPanel(false)} isGenerating={isGeneratingRestr} />
          </div>
        </div>
      )}
      {showRecomendacionesPanel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowRecomendacionesPanel(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <RecomendacionesChecklistPanel data={data} setData={setData} onClose={() => setShowRecomendacionesPanel(false)} isGenerating={isGeneratingReco} />
          </div>
        </div>
      )}
      {showConsentModal && (
        <ConsentimientoModal data={data} estadoCerrada={data.estadoHistoria === 'Cerrada'}
          onCerrar={() => setShowConsentModal(false)}
          onConfirmar={(campos) => { dispatch(campos); setShowConsentModal(false); }} />
      )}

      {/* ═══ AI Config Modal ═══ */}
      {showAIConfig && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAIConfig(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <AIConfigPanel
              aiConfig={aiConfig}
              onSave={(newConfig) => {
                const store = useAIStore.getState();
                if (newConfig.activeProvider) store.setActiveProvider(newConfig.activeProvider);
                if (newConfig.keys) Object.entries(newConfig.keys).forEach(([p, k]) => store.setKey(p, k));
                setShowAIConfig(false);
              }}
              onClose={() => setShowAIConfig(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
