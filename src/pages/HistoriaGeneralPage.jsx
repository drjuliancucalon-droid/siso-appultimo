// src/pages/HistoriaGeneralPage.jsx — HC General wrapper
// Sprint 1.1: Connect GeneralHC.jsx (33KB) to the app
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneralHC } from '../modules/clinical/components/GeneralHC';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import { useSaveData } from '../hooks/useSaveData';
import { analyzeGeneralHC, suggestDiagnosis } from '../modules/ai/services/aiAnalysis';
import { printHC } from '../lib/printService';
import { initialGeneralPatientState } from '../shared/data/initialStates';
import { ArrowLeft, Save, Printer, Loader2, CheckCircle, Stethoscope } from 'lucide-react';

export default function HistoriaGeneralPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const aiConfig = useAIStore((s) => s.getConfig());
  const { data: patients } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
  const { data: doctor } = useBackendObject('/data/doctor', 'siso_doctor_data', 'doctor');

  // HC state
  const [data, setData] = useState({ ...initialGeneralPatientState, tipoHistoria: 'general', fechaExamen: new Date().toISOString().split('T')[0] });
  const [isGenerating, setIsGenerating] = useState(false);

  // Save
  const { save, saving, lastSaveStatus } = useSaveData();
  const handleSave = useCallback(async () => {
    const userId = currentUser?.user || 'drcucalon';
    const toSave = { ...data, medicoId: userId, medicoNombre: doctor?.nombre || userId, fechaModificacion: new Date().toISOString() };
    if (!toSave.id) { toSave.id = `hcg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; toSave.fechaCreacion = new Date().toISOString(); }
    const result = await save('/write/hc/save', toSave, `siso_patients_${userId}`);
    if (result.ok) alert('✅ Historia clínica general guardada');
    else alert('❌ Error al guardar');
  }, [data, save, currentUser, doctor]);

  // AI — dispatches by type
  const onGenerateAI = useCallback(async (type) => {
    if (!aiConfig.keys || !Object.values(aiConfig.keys).some((k) => k?.trim())) {
      alert('Configura una API Key de IA primero'); return;
    }
    setIsGenerating(true);
    try {
      if (type === 'diagnosis') {
        const result = await suggestDiagnosis(data, aiConfig);
        if (Array.isArray(result)) {
          const updates = {};
          if (result[0]) updates.diagnostico1 = `${result[0].code} - ${result[0].description}`;
          if (result[1]) updates.diagnostico2 = `${result[1].code} - ${result[1].description}`;
          if (result[2]) updates.diagnostico3 = `${result[2].code} - ${result[2].description}`;
          setData((prev) => ({ ...prev, ...updates }));
        }
      } else {
        // Default: full general analysis
        const result = await analyzeGeneralHC(data, aiConfig);
        setData((prev) => ({ ...prev, analisis: result }));
      }
    } catch (err) { alert('Error IA: ' + err.message); }
    finally { setIsGenerating(false); }
  }, [aiConfig, data]);

  const activeDoctorData = doctor || { nombre: currentUser?.nombre || 'Médico', licencia: '', titulo: 'Médico General' };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a pacientes
      </button>

      {/* Action buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {lastSaveStatus === 'ok' && (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
            <CheckCircle className="w-3.5 h-3.5" /> Guardado
          </span>
        )}
        <button onClick={() => printHC(data, activeDoctorData)} className="bg-white text-emerald-700 border-2 border-emerald-300 px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2">
          <Printer className="w-4 h-4" /><span className="hidden sm:inline">Imprimir</span>
        </button>
        <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <GeneralHC
        data={data}
        setData={(updates) => typeof updates === 'function' ? setData(updates) : setData((p) => ({ ...p, ...updates }))}
        activeDoctorData={activeDoctorData}
        activeSignature={null}
        patientsList={patients}
        currentUser={currentUser}
        onGenerateAI={onGenerateAI}
        isGenerating={isGenerating}
        historyNotification={null}
      />
    </div>
  );
}
