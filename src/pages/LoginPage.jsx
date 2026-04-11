import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { User, FileText, Stethoscope, ClipboardList, Printer, Activity, Building2, FileCheck, AlertCircle, Sparkles, BrainCircuit, Loader2, Save, History, CheckCircle2, Trash2, Eye, LogOut, Users, BarChart3, PlusCircle, Search, Cloud, ShieldCheck, UserPlus, AlertTriangle, Pill, GraduationCap, Clock, ShieldAlert, UploadCloud, FileSignature, Share2, Plus, HardDrive, UserCheck, ChevronDown, Lock, Unlock, FileSearch, Banknote, Receipt, Pencil, X, Heart, CheckSquare, Square, ChevronRight, ChevronLeft, RefreshCw, WifiOff, Wifi, Shield, MessageSquare, Download, Upload } from 'lucide-react';

const LoginPage = () => {
  const {
    view, setView, navStack, setNavStack, currentUser, setCurrentUser,
    loginAttempts, setLoginAttempts, loginBlockedUntil, setLoginBlockedUntil,
    privacidadAceptada, setPrivacidadAceptada, syncStatus, setSyncStatus,
    showSyncReport, setShowSyncReport, syncReport, setSyncReport,
    alertMsg, setAlertMsg, confirmConfig, setConfirmConfig,
    promptConfig, setPromptConfig, promptValue, setPromptValue,
    aiConfig, setAiConfig, showAIConfig, setShowAIConfig, aiStatus, setAiStatus,
    companies, setCompanies, usersList, setUsersList, usersReady, setUsersReady,
    patientsList, setPatientsList, savedReports, setSavedReports,
    savedBills, setSavedBills, atencionesCerradas, setAtencionesCerradas,
    doctorSignature, setDoctorSignature, auditLog, setAuditLog,
    activeTab, setActiveTab, data, setData, dataType, setDataType,
    isGenerating, setIsGenerating, isGeneratingRestr, setIsGeneratingRestr,
    isGeneratingReco, setIsGeneratingReco, saveStatus, setSaveStatus,
    patientSuggestions, setPatientSuggestions,
    historyNotification, setHistoryNotification,
    showRestriccionesPanel, setShowRestriccionesPanel,
    showRecomendacionesPanel, setShowRecomendacionesPanel,
    showHistoryModal, setShowHistoryModal,
    ripsModalData, setRipsModalData, backupModalData, setBackupModalData,
    hcChoiceAgenda, setHcChoiceAgenda, historyRecords, setHistoryRecords,
    patientSearchTerm, setPatientSearchTerm, genPatSearch, setGenPatSearch,
    examSearch, setExamSearch, examList, setExamList, showExamSuggs, setShowExamSuggs,
    diagExamen, setDiagExamen, justExamen, setJustExamen, printPreview, setPrintPreview,
    selectedCompanyReport, setSelectedCompanyReport, selectedMedicoReport, setSelectedMedicoReport,
    reporteActiveTab, setReporteActiveTab, certSelected, setCertSelected,
    reportStartDate, setReportStartDate, reportEndDate, setReportEndDate,
    reportAIResult, setReportAIResult, isGeneratingReport, setIsGeneratingReport,
    showExportTable, setShowExportTable, precioPorPaciente, setPrecioPorPaciente,
    showDianPanel, setShowDianPanel, showSecretariaPatientModal, setShowSecretariaPatientModal,
    showTodoChecklist, setShowTodoChecklist, todoSelection, setTodoSelection,
    dianProvider, setDianProvider, dianApiKey, setDianApiKey,
    billData, setBillData, savedBillsList, setSavedBillsList,
    portafolioItems, setPortafolioItems, portafolioForm, setPortafolioForm,
    portafolioEditId, setPortafolioEditId,
    cotizaciones, setCotizaciones, cotizacionForm, setCotizacionForm,
    cotizacionView, setCotizacionView, cotizacionSelId, setCotizacionSelId,
    cajaMovimientos, setCajaMovimientos, cajaForm, setCajaForm, cajaTab, setCajaTab,
    cajaFiltroPeriodo, setCajaFiltroPeriodo, cajaFiltroDesde, setCajaFiltroDesde,
    cajaFiltroHasta, setCajaFiltroHasta, contabTab, setContabTab, contabPeriodo, setContabPeriodo,
    asistenciaFecha, setAsistenciaFecha,
    evolucionForm, setEvolucionForm, showEvolucionModal, setShowEvolucionModal,
    selectedPackage, setSelectedPackage, packageChecklist, setPackageChecklist,
    showPackages, setShowPackages, newComp, setNewComp, ipsPerfilForm, setIpsPerfilForm,
    verificationCode, setVerificationCode, verificationFound, setVerificationFound,
    activeUserMgmtTab, setActiveUserMgmtTab, pendingActivationPlan, setPendingActivationPlan,
    sbCloudData, setSbCloudData, sbLoading, setSbLoading,
    newUserForm, setNewUserForm, userEditId, setUserEditId, editForm, setEditForm,
    propForm, setPropForm, selSvc, setSelSvc, propModulo, setPropModulo,
    mensajes, setMensajes, showMensajePanel, setShowMensajePanel,
    showConsentModal, setShowConsentModal,
    habeasRequests, setHabeasRequests, showHabeasModal, setShowHabeasModal,
    habeasForm, setHabeasForm, showPortalPublico, setShowPortalPublico,
    arlTab, setArlTab, svePrograma, setSvePrograma,
    sveFiltroEmpresa, setSveFiltroEmpresa,
    sveAIAnalisis, setSveAIAnalisis, sveAICargando, setSveAIAnalisisCargando,
    sveAIFiltroEmpresa, setSveAIFiltroEmpresa,
    arlForm, setArlForm, arlGuardados, setArlGuardados,
    showNotifModal, setShowNotifModal, notifData, setNotifData,
    portalCodigo, setPortalCodigo, portalPaciente, setPortalPaciente, portalMultiple, setPortalMultiple,
    epiEmpresa, setEpiEmpresa, epiPeriodo, setEpiPeriodo, epiTab, setEpiTab,
    teleconsultas, setTeleconsultas, teleForm, setTeleForm,
    teleSalaActiva, setTeleSalaActiva, teleTab, setTeleTab,
    mensajeRespuesta, setMensajeRespuesta,
    agendados, setAgendados, showAgenda, setShowAgenda,
    agendaForm, setAgendaForm, agendaSuggs, setAgendaSuggs, agendaTab, setAgendaTab,
    showComposeMensaje, setShowComposeMensaje, composeMensaje, setComposeMensaje,
    companiesTab, setCompaniesTab, editingCompany, setEditingCompany,
    cajaMedicoPeriodo, setCajaMedicoPeriodo, porcentajeMedico, setPorcentajeMedico,
    medicoTurnoActivo, setMedicoTurnoActivo,
    superAdminTab, setSuperAdminTab, newOrgForm, setNewOrgForm,
    portalEmpresaCodigo, setPortalEmpresaCodigo,
    portalEmpresaEncontrada, setPortalEmpresaEncontrada,
    portalEmpresaPacientes, setPortalEmpresaPacientes,
    portalEmpresaTab, setPortalEmpresaTab,
    portalEmpresaBuscando, setPortalEmpresaBuscando,
    portalEmpresaFiltroDoc, setPortalEmpresaFiltroDoc,
    portalActivadoInfo, setPortalActivadoInfo,
    portalEmpresaAdmin, setPortalEmpresaAdmin,
    portalAdminTab, setPortalAdminTab,
    portalAdminLoginUser, setPortalAdminLoginUser,
    portalAdminLoginPass, setPortalAdminLoginPass,
    nuevoMedicoEmpForm, setNuevoMedicoEmpForm,
    sedeForm, setSedeForm, ipsCredForm, setIpsCredForm,
    ipsEditingEmpId, setIpsEditingEmpId,
    showConsentimiento, setShowConsentimiento,
    _hcDirty, _setHcDirty, _exitHcConfirm, _setExitHcConfirm,
    activeDoctorData, activeSignature,
    fileInputRef, fileInputSigRef, csvInputRef,
    goTo, goBack, showAlert, handleChange, handleNameChange, handleSavePatient,
    handleCloseHistory, handleEditHistory, handlePrint, logAccess,
    canViewPatient, isHcOwner, openPatient, handleNewOccupHistory, handleNewGeneralHistory,
    selectPatientSuggestion, generateAIAnalysis, generateAIRestricciones, generateAIRecomendaciones,
    applyRestriccionesChecklist, applyRecomendacionesChecklist, handleManualCloudSave,
    handleExportData, handleImportData, handleSignatureUpload, handleLogin, handleSaveAIConfig,
    exportPatientTable, _printHCClean, handleAceptarPrivacidad,
    renderNavbar,
    BrandLogo, DoctorSignature, DoctorSignatureMemo, InputGroup, PlanGate, LoginForm,
    _isAdmin, _isAdminEmpresa, _isAdminOrEmpresa, _canUse, _contarHC,
    _generarCertificadoHTMLNormalizado,
    PLAN_CONFIG, SECRETARIA_PERMISOS_DEFAULT, DEFAULT_DOCTOR_DATA, ORG_DEFAULT_ID,
    _ls, _sbSet, _sbGet, _SB_URL, _SB_KEY, sanitizeInput,
  } = useApp();

return (
<div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center font-sans p-4">
  <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden animate-fade-in">
    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-center">
      <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
        <Stethoscope className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-xl font-black text-white tracking-tight">
        OCUPASALUD
      </h1>
      <p className="text-emerald-100 text-xs font-bold tracking-widest mt-1">
        PLATAFORMA MÉDICA OCUPACIONAL v3.0
      </p>
    </div>
    <div className="p-8">
      <LoginForm
        onLogin={handleLogin}
        blockedUntil={loginBlockedUntil}
        attempts={loginAttempts}
      />
      <div className="mt-4 space-y-2">
        <button
          onClick={() => setShowAIConfig(true)}
          className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
        >
          <BrainCircuit className="w-4 h-4" /> Configurar IA (Recomendado)
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".json"
          onChange={handleImportData}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full bg-gray-50 text-gray-600 border border-gray-200 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
        >
          <UploadCloud className="w-4 h-4" /> Restaurar Copia
        </button>
      </div>
    </div>
  </div>
</div>
);
};

export default LoginPage;
