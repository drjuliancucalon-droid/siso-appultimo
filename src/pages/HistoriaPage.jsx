// src/pages/HistoriaPage.jsx — Historia Clínica Ocupacional wrapper
// Provides all required props to OccupationalHC using hooks + stores
import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OccupationalHC } from '../modules/clinical/components/OccupationalHC';
import { useClinicalRecord } from '../modules/clinical/hooks/useClinicalRecord';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import { analyzeHC, generateRestrictions, generateRecommendations, suggestDiagnosis, suggestExams } from '../modules/ai/services/aiAnalysis';
import { useSaveData } from '../hooks/useSaveData';
import { printHC } from '../lib/printService';
import { Stethoscope, Loader2, ArrowLeft, Save, CheckCircle, Printer } from 'lucide-react';

export default function HistoriaPage() {
  const { id } = useParams(); // patient docNumero if editing
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const aiConfig = useAIStore((s) => s.getConfig());
  
  // Load real data
  const { data: patients } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
  const { data: companies } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const { data: doctor } = useBackendObject('/data/doctor', 'siso_doctor_data', 'doctor');

  // Clinical record hook
  const clinical = useClinicalRecord({
    currentUser,
    patients,
    setPatients: () => {}, // Read-only for now
    showAlert: (msg) => alert(msg),
  });

  // Initialize with patient data if we have an id
  React.useEffect(() => {
    if (id && patients.length > 0 && !clinical.data?.docNumero) {
      const patient = patients.find((p) => p.docNumero === id || p.id === id);
      if (patient) {
        clinical.initNewRecord('ocupacional', patient);
      }
    }
  }, [id, patients]);

  // Patient search suggestions
  const [patientSuggestions, setPatientSuggestions] = useState([]);

  const handleNameChange = useCallback((value) => {
    clinical.setData({ nombres: value });
    if (value.length >= 2) {
      const matches = patients.filter((p) =>
        (p.nombres || '').toLowerCase().includes(value.toLowerCase()) ||
        (p.docNumero || '').includes(value)
      ).slice(0, 5);
      setPatientSuggestions(matches);
    } else {
      setPatientSuggestions([]);
    }
  }, [patients, clinical]);

  const selectPatientSuggestion = useCallback((patient) => {
    clinical.initNewRecord('ocupacional', patient);
    setPatientSuggestions([]);
    // Load history
    clinical.loadPatientHistory(patient.docNumero);
  }, [clinical]);

  const handleCompanySelect = useCallback((empresaId) => {
    const company = companies.find((c) => c.id === empresaId);
    clinical.setData({
      empresaId,
      empresaNombre: company?.razonSocial || company?.nombre || '',
    });
  }, [companies, clinical]);

  // AI generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingReco, setIsGeneratingReco] = useState(false);
  const [isGeneratingRestr, setIsGeneratingRestr] = useState(false);

  const onGenerateAI = useCallback(async (type) => {
    if (!aiConfig.keys || !Object.values(aiConfig.keys).some((k) => k?.trim())) {
      alert('Configura una API Key de IA primero (Gemini, Groq, Together o OpenRouter)');
      return;
    }

    // Determine which loading state and AI function to use
    let setLoading;
    let aiFn;

    switch (type) {
      case 'reco':
        setLoading = setIsGeneratingReco;
        aiFn = () => generateRecommendations(clinical.data, aiConfig);
        break;
      case 'restr':
        setLoading = setIsGeneratingRestr;
        aiFn = () => generateRestrictions(clinical.data, aiConfig);
        break;
      case 'diagnosis':
        setLoading = setIsGenerating;
        aiFn = () => suggestDiagnosis(clinical.data, aiConfig);
        break;
      case 'exams':
        setLoading = setIsGenerating;
        aiFn = () => suggestExams(clinical.data, aiConfig);
        break;
      default:
        // Full analysis
        setLoading = setIsGenerating;
        aiFn = () => analyzeHC(clinical.data, aiConfig);
        break;
    }

    setLoading(true);
    try {
      const result = await aiFn();

      // Update clinical data based on result type
      if (type === 'reco' && typeof result === 'string') {
        clinical.setData({ recomendaciones: result });
      } else if (type === 'restr' && typeof result === 'string') {
        clinical.setData({ restricciones: result });
      } else if (type === 'diagnosis' && Array.isArray(result)) {
        const updates = {};
        if (result[0]) updates.diagnostico1 = `${result[0].code} - ${result[0].description}`;
        if (result[1]) updates.diagnostico2 = `${result[1].code} - ${result[1].description}`;
        if (result[2]) updates.diagnostico3 = `${result[2].code} - ${result[2].description}`;
        clinical.setData(updates);
      } else if (typeof result === 'string') {
        clinical.setData({ analisis: result });
      }

      return result;
    } catch (err) {
      alert('Error IA: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [aiConfig, clinical]);

  // Consent modal state
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showRecomendacionesPanel, setShowRecomendacionesPanel] = useState(false);
  const [showRestriccionesPanel, setShowRestriccionesPanel] = useState(false);

  // Save HC
  const { save, saving, lastSaveStatus } = useSaveData();

  const handleSaveHC = useCallback(async () => {
    const record = clinical.saveRecord();
    const userId = currentUser?.user || 'drcucalon';
    const result = await save('/write/hc/save', record, `siso_patients_${userId}`);
    if (result.ok) {
      alert('✅ Historia clínica guardada correctamente');
    } else {
      alert('❌ Error al guardar. Los datos se guardaron localmente.');
    }
  }, [clinical, save, currentUser]);

  // Doctor data
  const activeDoctorData = doctor || {
    nombre: currentUser?.nombre || currentUser?.user || 'Médico',
    licencia: '',
    titulo: 'Médico Especialista en Salud Ocupacional',
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a pacientes
      </button>

      {/* Action buttons — floating */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {lastSaveStatus === 'ok' && (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
            <CheckCircle className="w-3.5 h-3.5" /> Guardado
          </span>
        )}
        <button
          onClick={() => printHC(clinical.data, activeDoctorData)}
          className="bg-white text-emerald-700 border-2 border-emerald-300 px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2"
          title="Imprimir HC"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Imprimir</span>
        </button>
        <button
          onClick={handleSaveHC}
          disabled={saving}
          className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : 'Guardar HC'}
        </button>
      </div>

      <OccupationalHC
        data={clinical.data}
        setData={clinical.setData}
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
        handleChange={(field, value) => clinical.setData({ [field]: value })}
        handleCompanySelect={handleCompanySelect}
        handleNameChange={handleNameChange}
        patientSuggestions={patientSuggestions}
        selectPatientSuggestion={selectPatientSuggestion}
        historyNotification={clinical.historyNotification}
        isGenerating={isGenerating}
        isGeneratingReco={isGeneratingReco}
        isGeneratingRestr={isGeneratingRestr}
        showConsentModal={showConsentModal}
        setShowConsentModal={setShowConsentModal}
        showRecomendacionesPanel={showRecomendacionesPanel}
        setShowRecomendacionesPanel={setShowRecomendacionesPanel}
        showRestriccionesPanel={showRestriccionesPanel}
        setShowRestriccionesPanel={setShowRestriccionesPanel}
      />
    </div>
  );
}
