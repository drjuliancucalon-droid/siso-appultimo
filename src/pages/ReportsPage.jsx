// src/pages/ReportsPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// REPORTES — Wrapper que conecta con hooks de data fetching
// FIX: Ahora carga datos desde Supabase usando useBackendData
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useState, useCallback, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import Reporte from './Reporte';

export default function ReportsPage() {
  const { currentUser } = useAuthStore();
  
  // ═══ CARGAR DATOS DESDE SUPABASE ═══
  const { data: patientsList } = useBackendData(
    '/data/patients',
    'siso_db_patients',
    'patients'
  );
  
  const { data: companies } = useBackendData(
    '/data/companies',
    'siso_companies',
    'companies'
  );
  
  const { data: doctor } = useBackendObject(
    '/data/doctor',
    'siso_doctor_data',
    'doctor'
  );

  // ═══ ESTADO LOCAL PARA FILTROS Y REPORTES ═══
  const [selectedCompanyReport, setSelectedCompanyReport] = useState('');
  const [reporteActiveTab, setReporteActiveTab] = useState('estadisticas');
  const [certSelected, setCertSelected] = useState({});
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportAIResult, setReportAIResult] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [precioPorPaciente, setPrecioPorPaciente] = useState('');
  const [selectedMedicoReport, setSelectedMedicoReport] = useState('');
  const [showExportTable, setShowExportTable] = useState(false);

  // ═══ HELPERS ═══
  const showAlert = useCallback((msg) => {
    alert(msg);
  }, []);

  const showConfirm = useCallback((msg) => {
    return window.confirm(msg);
  }, []);

  // ═══ CONFIG AI ═══
  const aiConfig = useMemo(() => ({
    provider: localStorage.getItem('siso_ai_provider') || 'openai',
    apiKey: sessionStorage.getItem('siso_ai_key') || '',
    model: localStorage.getItem('siso_ai_model') || 'gpt-4',
  }), []);

  // ═══ CALLBACK AI ═══
  const callAI = useCallback(async (prompt) => {
    const config = aiConfig;
    if (!config.apiKey) throw new Error('API key no configurada');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) throw new Error('Error en API de IA');
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }, [aiConfig]);

  // ═══ PASAR TODOS LOS PROPS AL COMPONENTE REPORTE ═══
  return (
    <Reporte
      patientsList={patientsList || []}
      companies={companies || []}
      currentUser={currentUser}
      aiConfig={aiConfig}
      savedReports={[]}
      goTo={() => {}}
      selectedCompanyReport={selectedCompanyReport}
      setSelectedCompanyReport={setSelectedCompanyReport}
      reporteActiveTab={reporteActiveTab}
      setReporteActiveTab={setReporteActiveTab}
      certSelected={certSelected}
      setCertSelected={setCertSelected}
      reportStartDate={reportStartDate}
      setReportStartDate={setReportStartDate}
      reportEndDate={reportEndDate}
      setReportEndDate={setReportEndDate}
      reportAIResult={reportAIResult}
      setReportAIResult={setReportAIResult}
      isGeneratingReport={isGeneratingReport}
      setIsGeneratingReport={setIsGeneratingReport}
      showExportTable={showExportTable}
      setShowExportTable={setShowExportTable}
      precioPorPaciente={precioPorPaciente}
      setPrecioPorPaciente={setPrecioPorPaciente}
      selectedMedicoReport={selectedMedicoReport}
      setSelectedMedicoReport={setSelectedMedicoReport}
      callAI={callAI}
      showAlert={showAlert}
      showConfirm={showConfirm}
      usersList={[]}
    />
  );
}
