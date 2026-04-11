import React from 'react';
import {
  AlertCircle, AlertTriangle, CheckCircle2, Cloud, FileCheck, HardDrive, X,
  Lock, Printer, RefreshCw, Save
} from "lucide-react";
// ─── AppComponents: all utilities + sub-components ──────────────────────────
import {
  _ls, _ss, _SB_URL, _SB_KEY, _sync, _patKey,
  RestriccionesChecklistPanel, RecomendacionesChecklistPanel,
  TabFormulaDerivacion, ConsentimientoModal, NotificacionModal,
  LoginForm, PrivacyModal, AgendaFieldF, ChangePasswordForm, _sanitize, _safeLogoUrl,
  PrintStyles, PortalPublicoTrabajador,
  DoctorSignature, DoctorSignatureMemo, BrandLogo,
  InputGroup, SelectGroup, TextAreaGroup, SectionTitle,
  PlanGate, LicenciasTab, AIConfigPanel, MedicamentoAutocomplete,
  CIE11Badge, CUPSInput, CIE10Input, _FortalezaPass,
  PLAN_CONFIG, ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT,
  _isAdmin, _isAdminEmpresa, _secretariaPuede, _canUse, _contarHC,
  initialOccupPatientState, initialGeneralPatientState, initialUsers, initialCompanyState,
  DEFAULT_DOCTOR_DATA, _genOrgId, SECRETARIA_PERMISOS_DEFAULT, MEDICO_SIEMPRE_PUEDE,
} from './components/AppComponents.jsx';
// ─── Modular hooks and helpers ───────────────────────────────────────────────
import { useAppState } from './hooks/useAppState.js';
import { createRenderHelpers } from './components/RenderHelpers.jsx';
// ─── Page Imports ─────────────────────────────────────────────────────────
import { LoginPage } from './pages/LoginPage.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { HistoriaOcupacional } from './pages/HistoriaOcupacional.jsx';
import { HistoriaGeneral } from './pages/HistoriaGeneral.jsx';
import { Certificado } from './pages/Certificado.jsx';
import { Reporte } from './pages/Reporte.jsx';
import { Patients } from './pages/Patients.jsx';
import { Companies } from './pages/Companies.jsx';
import { Verification } from './pages/Verification.jsx';
import { Bill } from './pages/Bill.jsx';
import { PortalTrabajador } from './pages/PortalTrabajador.jsx';
import { SVE } from './pages/SVE.jsx';
import { ARL } from './pages/ARL.jsx';
import { HabeasData } from './pages/HabeasData.jsx';
import { Telemedicina } from './pages/Telemedicina.jsx';
import { Users as UsersPage } from './pages/Users.jsx';
import { Planes } from './pages/Planes.jsx';
import { Propuestas } from './pages/Propuestas.jsx';
import { Agenda } from './pages/Agenda.jsx';
import { AsistenciaAgenda } from './pages/AsistenciaAgenda.jsx';
import { Portafolio } from './pages/Portafolio.jsx';
import { Cotizaciones } from './pages/Cotizaciones.jsx';
import { Contabilidad } from './pages/Contabilidad.jsx';
import { PerfilIPS } from './pages/PerfilIPS.jsx';
import { Caja } from './pages/Caja.jsx';
import { SuperAdmin } from './pages/SuperAdmin.jsx';
import { PortalEmpresa } from './pages/PortalEmpresa.jsx';

// ─── App Component ────────────────────────────────────────────────────────────
export default function App() {
  // All state and handlers
  const state = useAppState();
  const {
    view,
    setView,
    navStack,
    setNavStack,
    currentUser,
    setCurrentUser,
    loginAttempts,
    setLoginAttempts,
    loginBlockedUntil,
    setLoginBlockedUntil,
    privacidadAceptada,
    setPrivacidadAceptada,
    syncStatus,
    setSyncStatus,
    showSyncReport,
    setShowSyncReport,
    syncReport,
    setSyncReport,
    alertMsg,
    setAlertMsg,
    confirmConfig,
    setConfirmConfig,
    promptConfig,
    setPromptConfig,
    promptValue,
    setPromptValue,
    aiConfig,
    setAiConfig,
    showAIConfig,
    setShowAIConfig,
    aiStatus,
    setAiStatus,
    companies,
    setCompanies,
    usersList,
    setUsersList,
    patientsList,
    setPatientsList,
    savedReports,
    setSavedReports,
    savedBills,
    setSavedBills,
    atencionesCerradas,
    setAtencionesCerradas,
    doctorSignature,
    setDoctorSignature,
    auditLog,
    setAuditLog,
    activeTab,
    setActiveTab,
    data,
    setData,
    dataType,
    setDataType,
    isGenerating,
    setIsGenerating,
    isGeneratingRestr,
    setIsGeneratingRestr,
    isGeneratingReco,
    setIsGeneratingReco,
    saveStatus,
    setSaveStatus,
    _hcDirty,
    _setHcDirty,
    _exitHcConfirm,
    _setExitHcConfirm,
    patientSuggestions,
    setPatientSuggestions,
    historyNotification,
    setHistoryNotification,
    showRestriccionesPanel,
    setShowRestriccionesPanel,
    showRecomendacionesPanel,
    setShowRecomendacionesPanel,
    showHistoryModal,
    setShowHistoryModal,
    ripsModalData,
    setRipsModalData,
    backupModalData,
    setBackupModalData,
    hcChoiceAgenda,
    setHcChoiceAgenda,
    historyRecords,
    setHistoryRecords,
    patientSearchTerm,
    setPatientSearchTerm,
    genPatSearch,
    setGenPatSearch,
    examSearch,
    setExamSearch,
    examList,
    setExamList,
    showExamSuggs,
    setShowExamSuggs,
    diagExamen,
    setDiagExamen,
    justExamen,
    setJustExamen,
    printPreview,
    setPrintPreview,
    selectedCompanyReport,
    setSelectedCompanyReport,
    reporteActiveTab,
    setReporteActiveTab,
    certSelected,
    setCertSelected,
    reportStartDate,
    setReportStartDate,
    reportEndDate,
    setReportEndDate,
    reportAIResult,
    setReportAIResult,
    isGeneratingReport,
    setIsGeneratingReport,
    showExportTable,
    setShowExportTable,
    precioPorPaciente,
    setPrecioPorPaciente,
    showDianPanel,
    setShowDianPanel,
    dianProvider,
    setDianProvider,
    dianApiKey,
    setDianApiKey,
    billData,
    setBillData,
    savedBillsList,
    setSavedBillsList,
    portafolioItems,
    setPortafolioItems,
    portafolioForm,
    setPortafolioForm,
    portafolioEditId,
    setPortafolioEditId,
    cotizaciones,
    setCotizaciones,
    cotizacionForm,
    setCotizacionForm,
    cotizacionView,
    setCotizacionView,
    cotizacionSelId,
    setCotizacionSelId,
    cajaMovimientos,
    setCajaMovimientos,
    cajaForm,
    setCajaForm,
    cajaTab,
    setCajaTab,
    cajaFiltroPeriodo,
    setCajaFiltroPeriodo,
    cajaFiltroDesde,
    setCajaFiltroDesde,
    cajaFiltroHasta,
    setCajaFiltroHasta,
    contabTab,
    setContabTab,
    contabPeriodo,
    setContabPeriodo,
    asistenciaFecha,
    setAsistenciaFecha,
    evolucionForm,
    setEvolucionForm,
    showEvolucionModal,
    setShowEvolucionModal,
    selectedPackage,
    setSelectedPackage,
    packageChecklist,
    setPackageChecklist,
    showPackages,
    setShowPackages,
    newComp,
    setNewComp,
    ipsPerfilForm,
    setIpsPerfilForm,
    verificationCode,
    setVerificationCode,
    verificationFound,
    setVerificationFound,
    activeUserMgmtTab,
    setActiveUserMgmtTab,
    pendingActivationPlan,
    setPendingActivationPlan,
    sbCloudData,
    setSbCloudData,
    sbLoading,
    setSbLoading,
    newUserForm,
    setNewUserForm,
    userEditId,
    setUserEditId,
    editForm,
    setEditForm,
    propForm,
    setPropForm,
    selSvc,
    setSelSvc,
    propModulo,
    setPropModulo,
    mensajes,
    setMensajes,
    showMensajePanel,
    setShowMensajePanel,
    showConsentModal,
    setShowConsentModal,
    twoFAStep,
    setTwoFAStep,
    twoFAToken,
    setTwoFAToken,
    twoFAError,
    setTwoFAError,
    habeasRequests,
    setHabeasRequests,
    showHabeasModal,
    setShowHabeasModal,
    habeasForm,
    setHabeasForm,
    showPortalPublico,
    setShowPortalPublico,
    arlTab,
    setArlTab,
    svePrograma,
    setSvePrograma,
    sveFiltroEmpresa,
    setSveFiltroEmpresa,
    sveAIAnalisis,
    setSveAIAnalisis,
    sveAICargando,
    setSveAIAnalisisCargando,
    sveAIFiltroEmpresa,
    setSveAIFiltroEmpresa,
    arlForm,
    setArlForm,
    arlGuardados,
    setArlGuardados,
    showNotifModal,
    setShowNotifModal,
    notifData,
    setNotifData,
    portalCodigo,
    setPortalCodigo,
    portalPaciente,
    setPortalPaciente,
    portalMultiple,
    setPortalMultiple,
    epiEmpresa,
    setEpiEmpresa,
    epiPeriodo,
    setEpiPeriodo,
    epiTab,
    setEpiTab,
    teleconsultas,
    setTeleconsultas,
    teleForm,
    setTeleForm,
    teleSalaActiva,
    setTeleSalaActiva,
    teleTab,
    setTeleTab,
    mensajeRespuesta,
    setMensajeRespuesta,
    agendados,
    setAgendados,
    showAgenda,
    setShowAgenda,
    agendaForm,
    setAgendaForm,
    agendaSuggs,
    setAgendaSuggs,
    agendaTab,
    setAgendaTab,
    showComposeMensaje,
    setShowComposeMensaje,
    composeMensaje,
    setComposeMensaje,
    inactivityWarning,
    setInactivityWarning,
    inactivityCountdown,
    setInactivityCountdown,
    companiesTab,
    setCompaniesTab,
    editingCompany,
    setEditingCompany,
    cajaMedicoPeriodo,
    setCajaMedicoPeriodo,
    porcentajeMedico,
    setPorcentajeMedico,
    medicoTurnoActivo,
    setMedicoTurnoActivo,
    orgsList,
    setOrgsList,
    activeOrgId,
    setActiveOrgId,
    superAdminTab,
    setSuperAdminTab,
    newOrgForm,
    setNewOrgForm,
    portalEmpresaCodigo,
    setPortalEmpresaCodigo,
    portalEmpresaEncontrada,
    setPortalEmpresaEncontrada,
    portalEmpresaPacientes,
    setPortalEmpresaPacientes,
    portalEmpresaTab,
    setPortalEmpresaTab,
    portalEmpresaBuscando,
    setPortalEmpresaBuscando,
    portalEmpresaFiltroDoc,
    setPortalEmpresaFiltroDoc,
    portalActivadoInfo,
    setPortalActivadoInfo,
    portalEmpresaAdmin,
    setPortalEmpresaAdmin,
    portalAdminTab,
    setPortalAdminTab,
    portalAdminLoginUser,
    setPortalAdminLoginUser,
    portalAdminLoginPass,
    setPortalAdminLoginPass,
    nuevoMedicoEmpForm,
    setNuevoMedicoEmpForm,
    sedeForm,
    setSedeForm,
    ipsCredForm,
    setIpsCredForm,
    ipsEditingEmpId,
    setIpsEditingEmpId,
    handleAceptarPrivacidad,
    logAccess,
    exportPatientTable,
    fileInputRef,
    fileInputSigRef,
    csvInputRef,
    _inactivityRef,
    _warnRef,
    _cajaSaveTimer,
    showAlert,
    showConfirm,
    showPrompt,
    sessionUser,
    activeDoctorData,
    activeSignature,
    _resetInactivity,
    _initSess,
    applyCloud,
    handler,
    doAutoBackup,
    callAI,
    generateAIAnalysis,
    _tipoExamen,
    _contextoTipo,
    generateAIRestricciones,
    lista,
    generateAIRecomendaciones,
    generateAIGeneral,
    generateAIReport,
    fmtDist,
    handleChange,
    handleManualCloudSave,
    handleSaveAIConfig,
    _loadScoped,
    handleVerify2FA,
    canViewPatient,
    isHcOwner,
    openPatient,
    handleNewOccupHistory,
    handleNewGeneralHistory,
    _syncPatients,
    _syncCompanies,
    checkAlertasObligatorias,
    handleSavePatient,
    handleCloseHistory,
    _tipoConsulta,
    handleAiResumen,
    handleEditHistory,
    op,
    handleCompanySelect,
    handleDeletePatient,
    handleSignatureUpload,
    handleExportData,
    handleImportData,
    sigsRestored,
    billsR,
    repsR,
    closedPats,
    handleNameChange,
    selectPatientSuggestion,
    handleOpenHistoryModal,
    applyRestriccionesChecklist,
    applyRecomendacionesChecklist,
    handlePrint,
    _maybeExitHC,
    _goToDirect,
    goTo,
    _goBackDirect,
    goBack,
    handleLogin,     saveCaja,
  } = state;

  // Render helpers (receive state via closure)
  const {
    renderNavbar,
    renderTabAdjuntos,
    renderTabSolicitudExamenes,
    renderTabIncapacidadGeneral,
    renderEvolucionModal,
    renderMensajesOverlay,
  } = createRenderHelpers(state);

    // Abrir HC desde agenda: resetear datos y navegar a historia
  const abrirHCDesdeAgenda = (agItem, tipo) => {
    setHcChoiceAgenda(null);
    if (tipo === 'ocupacional') {
      handleNewOccupHistory();
    } else {
      handleNewGeneralHistory();
    }
    // Pre-rellenar nombre y documento si vienen del item de agenda
    if (agItem) {
      setData(prev => ({
        ...prev,
        nombres: agItem.nombre || prev.nombres,
        docNumero: agItem.docNumero || prev.docNumero,
        _agendaId: agItem.id,
      }));
    }
  };

  const renderCurrentView = () => {

    // Shared props passed to all page components
    const sharedProps = {
      ...state,
      renderNavbar,
      renderTabAdjuntos,
      renderTabSolicitudExamenes,
      renderTabIncapacidadGeneral,
      renderEvolucionModal,
      renderMensajesOverlay,
      TabFormulaDerivacion,
      ConsentimientoModal,
      NotificacionModal,
      LoginForm,
      PortalPublicoTrabajador,
      AgendaFieldF,
    };

    // NORMATIVO: Ley 1581/2012 - mostrar aviso si no ha sido aceptado
    if (!privacidadAceptada)
      return <PrivacyModal onAccept={handleAceptarPrivacidad} />;
    if (view === "login") {
      // B-18: Intercepción 2FA - mostrar pantalla de verificación TOTP
      if (twoFAStep)
        return (
          <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center font-sans p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden animate-fade-in">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Verificación 2FA
                </h1>
                <p className="text-indigo-200 text-sm mt-1">
                  Autenticación de dos factores activa
                </p>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Ingrese el código de 6 dígitos de su aplicación autenticadora
                </p>
                <p className="text-xs text-center text-gray-400">
                  (Google Authenticator · Authy · Microsoft Authenticator)
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFAToken}
                  onChange={(e) => {
                    setTwoFAToken(e.target.value.replace(/\D/g, ""));
                    setTwoFAError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify2FA();
                  }}
                  placeholder="000000"
                  className="w-full p-3 border-2 border-indigo-200 rounded-xl text-center text-3xl font-black tracking-[0.5em] focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
                {twoFAError && (
                  <p className="text-red-600 text-xs text-center font-bold">
                    {twoFAError}
                  </p>
                )}
                <button
                  onClick={handleVerify2FA}
                  disabled={twoFAToken.length !== 6}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl transition shadow-lg"
                >
                  ✅ Verificar código
                </button>
                <button
                  onClick={() => {
                    setTwoFAStep(null);
                    setTwoFAToken("");
                    setTwoFAError("");
                  }}
                  className="w-full py-2 text-gray-500 text-xs hover:text-gray-700"
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            </div>
          </div>
        );
      return <LoginPage {...sharedProps} />;
    }
    if (view === "dashboard") return <Dashboard {...sharedProps} />;
    if (view === "superadmin") return <SuperAdmin {...sharedProps} />;
    if (view === "planes") return <Planes {...sharedProps} />;
    if (view === "portaltrabajador") return <PortalTrabajador {...sharedProps} />;
    if (view === "portalempresa") return <PortalEmpresa {...sharedProps} />;
    if (view === "habeasdata") return <HabeasData {...sharedProps} />;
    if (view === "arl") return <ARL {...sharedProps} />;
    if (view === "sve") return <SVE {...sharedProps} />;
    if (view === "telemedicina") return <Telemedicina {...sharedProps} />;
    if (view === "agenda") return <Agenda {...sharedProps} />;
    if (view === "asistencia") return <AsistenciaAgenda {...sharedProps} />;
    if (view === "patients") return <Patients {...sharedProps} />;
    // ══ B-07: Pantalla cambio de contraseña obligatorio (primer login o forzado) ══
    if (view === "changePassword")
      return (
        <ChangePasswordForm
          currentUser={currentUser}
          usersList={usersList}
          setUsersList={setUsersList}
          setCurrentUser={setCurrentUser}
          _sync={_sync}
          _patKey={_patKey}
          goTo={goTo}
          showAlert={showAlert}
        />
      );
    if (view === "companies") return <Companies {...sharedProps} />;
    if (view === "reporte") return <Reporte {...sharedProps} />;
    if (view === "bill") return <Bill {...sharedProps} />;
    if (view === "verification") return <Verification {...sharedProps} />;
    if (view === "users") return <UsersPage {...sharedProps} />;
    if (view === "portafolio") return <Portafolio {...sharedProps} />;
    if (view === "caja") return <Caja {...sharedProps} />;
    if (view === "perfilips") return <PerfilIPS {...sharedProps} />;
    if (view === "contabilidad") return <Contabilidad {...sharedProps} />;
    if (view === "cotizaciones") {
      if (propModulo !== "cotizacion") setPropModulo("cotizacion");
      return <Propuestas {...sharedProps} />;
    }
    if (view === "propuestas") return <Propuestas {...sharedProps} />;
    if (view === "historia") {
      // FIX: _billDocData necesario para incapacidad, fórmula, derivación
      const _billDocUser = billData.billDoctorId
        ? usersList.find((u) => u.user === billData.billDoctorId)
        : null;
      const _billDocData = _billDocUser?.doctorData || activeDoctorData;
      const _billDocSig = _billDocUser?.doctorData?.firma || activeSignature;
      return (
        <div className="min-h-screen flex flex-col bg-gray-100 font-sans print:bg-white">
          {saveStatus === "saved" && (
            <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 no-print animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> ✅ Guardado
            </div>
          )}
          {inactivityWarning && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[9998] flex items-center gap-3 no-print">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-black text-sm">⏱️ Sesión por expirar</p>
                <p className="text-xs">
                  Cierre automático en{" "}
                  <span className="font-black">{inactivityCountdown}s</span> por
                  inactividad
                </p>
              </div>
              <button
                onClick={_resetInactivity}
                className="ml-4 bg-white text-red-600 px-3 py-1 rounded-lg font-black text-xs hover:bg-red-50"
              >
                Continuar
              </button>
            </div>
          )}
          {saveStatus === "auto" && (
            <div className="fixed top-4 right-4 bg-blue-400 text-white px-3 py-1.5 rounded-lg shadow-lg z-50 flex items-center gap-2 no-print animate-fade-in text-xs">
              <RefreshCw className="w-3 h-3" /> Autoguardado
            </div>
          )}
          {renderNavbar()}
          <main className="flex-grow p-6 max-w-5xl mx-auto w-full print:p-0">
            {dataType === "ocupacional" &&
              activeTab === "form" &&
              <HistoriaOcupacional {...sharedProps} _billDocData={_billDocData} _billDocSig={_billDocSig} />}
            {dataType === "general" &&
              activeTab === "formGeneral" &&
              <HistoriaGeneral {...sharedProps} />}
            {dataType === "ocupacional" &&
              activeTab === "certificado" &&
              <Certificado {...sharedProps} _billDocData={_billDocData} _billDocSig={_billDocSig} />}
            {dataType === "ocupacional" &&
              (activeTab === "formulaTab" || activeTab === "derivacionTab") && (
                <TabFormulaDerivacion
                  data={data}
                  setData={setData}
                  _billDocData={_billDocData}
                  _billDocSig={_billDocSig}
                  onPrint={handlePrint}
                  forceTab={
                    activeTab === "derivacionTab" ? "derivacion" : "formula"
                  }
                />
              )}
            {dataType === "ocupacional" &&
              activeTab === "solicitudExamenes" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-teal-50">
                    <span className="text-sm font-black text-teal-800">
                      🔬 Solicitud de Exámenes Paraclínicos
                    </span>
                    <span className="text-[10px] text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
                      HC Ocupacional
                    </span>
                  </div>
                  <div className="p-4">{renderTabSolicitudExamenes()}</div>
                </div>
              )}
            {dataType === "ocupacional" && activeTab === "adjuntos" && (
              <div>{renderTabAdjuntos()}</div>
            )}
            {/* B-F1-05: CARNÉ MANIPULACIÓN ALIMENTOS */}
            {dataType === "ocupacional" &&
              activeTab === "carnetAlimentos" &&
              (() => {
                const doc = activeDoctorData;
                const sig = activeSignature;
                const printCarnet = () => {
                  const vigencia = (() => {
                    const d = new Date(
                      data.fechaExamen || new Date().toISOString().split("T")[0]
                    );
                    d.setFullYear(d.getFullYear() + 1);
                    return d.toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })();
                  const _miIPSCarnet = currentUser?.empresaId
                    ? companies.find((c) => c.id === currentUser.empresaId) ||
                      null
                    : null;
                  const _carnetIpsBrand = _miIPSCarnet
                    ? `<div style="display:flex;align-items:center;gap:6px;border-bottom:1px solid #d1fae5;padding-bottom:5px;margin-bottom:7px;">
                        ${
                          _safeLogoUrl(_miIPSCarnet.logo || "") // SEC-FIX-02
                            ? `<img src="${_safeLogoUrl(_miIPSCarnet.logo)}" style="max-height:20px;max-width:50px;object-fit:contain;"/>`
                            : ""
                        }
                        <span style="font-size:8px;font-weight:900;color:#065f46;text-transform:uppercase;">${_sanitize(
                          _miIPSCarnet.nombre || ""
                        )}</span>
                        ${
                          _miIPSCarnet.nit
                            ? `<span style="font-size:7px;color:#888;margin-left:auto;">NIT: ${_sanitize(
                                _miIPSCarnet.nit
                              )}</span>`
                            : ""
                        }
                      </div>`
                    : "";
                  const html = `<!DOCTYPE html><html><head><title>Carné - ${
                    data.nombres || "Paciente"
                  }</title>
                <style>
                  body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}
                  .card{width:8.56cm;min-height:5.4cm;background:white;border-radius:12px;padding:14px;box-shadow:0 4px 12px rgba(0,0,0,.15);margin:auto;border-top:5px solid #16a34a}
                  .header{display:flex;align-items:center;gap:10px;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:8px}
                  .photo{width:50px;height:50px;border-radius:50%;border:2px solid #16a34a;object-fit:cover;background:#dcfce7;display:flex;align-items:center;justify-content:center;font-size:20px;overflow:hidden}
                  .badge{background:#dcfce7;color:#15803d;font-size:9px;font-weight:bold;padding:2px 8px;border-radius:12px;text-transform:uppercase}
                  .sig{max-width:100px;max-height:40px}
                  .no-print{margin-bottom:16px}
                  @media print{.no-print{display:none}body{background:white;padding:0}.card{box-shadow:none}}
                </style></head><body>
                <div class="no-print">
                  <button onclick="document.body.contentEditable='true'" style="margin-right:8px;padding:6px 14px;background:#4B5563;color:white;border:none;border-radius:6px;cursor:pointer">✏️ Editar</button>
                  <button onclick="window.print()" style="padding:6px 14px;background:#16a34a;color:white;border:none;border-radius:6px;cursor:pointer">🖨️ Imprimir</button>
                </div>
                <div class="card">
                  ${_carnetIpsBrand}
                  <div class="header">
                    ${
                      data.fotoPaciente
                        ? `<div class="photo"><img src="${data.fotoPaciente}" style="width:100%;height:100%;object-fit:cover"/></div>`
                        : '<div class="photo" style="font-size:22px;display:flex;align-items:center;justify-content:center">👤</div>'
                    }
                    <div style="flex:1">
                      <div class="badge">🍽️ Manipulación de Alimentos</div>
                      <p style="margin:3px 0;font-size:13px;font-weight:bold">${
                        data.nombres || ""
                      }</p>
                      <p style="margin:2px 0;font-size:10px;color:#6b7280">CC ${
                        data.docNumero || ""
                      }</p>
                      <p style="margin:2px 0;font-size:10px;color:#6b7280">${
                        data.cargo || ""
                      }</p>
                    </div>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;font-size:10px">
                    <div><span style="color:#9ca3af">Empresa:</span><br><strong>${
                      companies.find((c) => c.id === data.empresaId)?.nombre ||
                      "Particular"
                    }</strong></div>
                    <div><span style="color:#9ca3af">Concepto:</span><br><strong style="color:#15803d">✅ APTO</strong></div>
                    <div><span style="color:#9ca3af">Fecha evaluación:</span><br><strong>${
                      data.fechaExamen || data.fechaConsulta || ""
                    }</strong></div>
                    <div><span style="color:#9ca3af">Vigente hasta:</span><br><strong style="color:#dc2626">${vigencia}</strong></div>
                  </div>
                  <div style="display:flex;justify-content:flex-end;align-items:flex-end;border-top:1px solid #e5e7eb;padding-top:6px">
                    <div style="text-align:center">
                      ${
                        sig
                          ? `<img src="${sig}" class="sig"/><br>`
                          : '<div style="width:100px;border-top:1px solid #333;margin-bottom:3px"></div>'
                      }
                      <p style="margin:0;font-size:8px;font-weight:bold">${
                        doc.nombre || ""
                      }</p>
                      <p style="margin:0;font-size:7px;color:#6b7280">Lic. ${
                        doc.licencia || ""
                      }</p>
                    </div>
                  </div>
                </div>
                </body></html>`;
                  const w = window.open("", "_blank", "width=500,height=420");
                  w.document.write(html);
                  w.document.close();
                };
                return (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                        🍽️ Carné de Aptitud - Manipulación de Alimentos
                      </h3>
                      <button
                        onClick={printCarnet}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm"
                      >
                        🖨️ Imprimir Carné
                      </button>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                      <p className="text-xs text-emerald-800 font-bold mb-2">
                        Vista previa del carné (8.56 × 5.4 cm)
                      </p>
                      <div className="bg-white rounded-xl p-3 shadow border-t-4 border-emerald-500 max-w-xs">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100 mb-2">
                          {data.fotoPaciente ? (
                            <img
                              src={data.fotoPaciente}
                              className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center text-lg">
                              👤
                            </div>
                          )}
                          <div>
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full">
                              🍽️ Manipulación de Alimentos
                            </span>
                            <p className="font-black text-gray-800 text-sm">
                              {data.nombres || "-"}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {data.cargo || ""}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] mb-2">
                          <div>
                            <span className="text-gray-400">Empresa:</span>
                            <br />
                            <strong>
                              {companies.find((c) => c.id === data.empresaId)
                                ?.nombre || "Particular"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-400">Concepto:</span>
                            <br />
                            <strong className="text-emerald-700">
                              ✅ APTO
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-400">Evaluación:</span>
                            <br />
                            <strong>
                              {data.fechaExamen || data.fechaConsulta || "-"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-400">Vigencia:</span>
                            <br />
                            <strong className="text-red-600">1 año</strong>
                          </div>
                        </div>
                        <div className="text-right border-t border-gray-100 pt-1">
                          <p className="text-[9px] font-bold">
                            {doc.nombre || ""}
                          </p>
                          <p className="text-[8px] text-gray-400">
                            Lic. {doc.licencia || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!data.fotoPaciente && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                        💡 Tip: Agrega la foto del paciente en la sección "Datos
                        Sociodemográficos" para que aparezca en el carné.
                      </div>
                    )}
                  </div>
                );
              })()}
            {activeTab === "incapacidad" && (
              <div
                className="bg-white mx-auto shadow-2xl print:shadow-none carta-visual"
                style={{
                  width: "21.59cm",
                  minHeight: "auto",
                  padding: "1.5cm",
                  boxSizing: "border-box",
                }}
              >
                <div className="text-center border-b-2 border-gray-800 pb-2 mb-4">
                  <div className="flex justify-center">
                    <BrandLogo data={_billDocData} />
                  </div>
                  <h2 className="text-2xl font-black uppercase mt-2">
                    Certificado de Incapacidad Médica
                  </h2>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        className="w-full p-1.5 border rounded font-bold bg-white"
                        value={data.incapacidad?.fechaInicio || ""}
                        onChange={(e) =>
                          setData((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              fechaInicio: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        className="w-full p-1.5 border rounded font-bold bg-white"
                        value={data.incapacidad?.fechaFin || ""}
                        onChange={(e) => {
                          const start = new Date(data.incapacidad?.fechaInicio);
                          const end = new Date(e.target.value);
                          const dias =
                            Math.ceil(
                              Math.abs(end - start) / (1000 * 60 * 60 * 24)
                            ) + 1;
                          setData((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              fechaFin: e.target.value,
                              dias: dias > 0 ? dias : 0,
                            },
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
                    <p className="text-xs font-bold text-emerald-700 uppercase mb-1">
                      Días
                    </p>
                    <p className="text-4xl font-black text-emerald-900">
                      {data.incapacidad?.dias || 0}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold">
                      {numeroALetras(data.incapacidad?.dias || 0)} DÍAS
                    </p>
                  </div>
                  <div className="space-y-3">
                    <select
                      value={data.incapacidad?.origen || "Enfermedad General"}
                      onChange={(e) =>
                        setData((p) => ({
                          ...p,
                          incapacidad: {
                            ...p.incapacidad,
                            origen: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded text-xs font-bold"
                    >
                      <option value="Enfermedad General">
                        Enfermedad General
                      </option>
                      <option value="Accidente de Trabajo">
                        Accidente de Trabajo
                      </option>
                      <option value="Enfermedad Laboral">
                        Enfermedad Laboral
                      </option>
                    </select>
                    <textarea
                      rows={3}
                      value={data.incapacidad?.diagnostico || ""}
                      onChange={(e) =>
                        setData((p) => ({
                          ...p,
                          incapacidad: {
                            ...p.incapacidad,
                            diagnostico: e.target.value,
                          },
                        }))
                      }
                      placeholder="Diagnóstico (CIE-10)..."
                      className="w-full p-2 border rounded text-xs resize-none"
                    />
                  </div>
                </div>
                <div className="mt-10 flex justify-end px-4">
                  <div className="text-center w-1/3">
                    <DoctorSignature
                      signature={_billDocSig}
                      data={_billDocData}
                      showData={true}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* ══ TAB: SOLICITUD DE EXÁMENES ══ */}
            {dataType === "general" &&
              activeTab === "solicitudExamenes" &&
              renderTabSolicitudExamenes()}
            {/* ══ TAB: INCAPACIDAD MÉDICA (HC GENERAL) ══ */}
            {dataType === "general" &&
              activeTab === "incapacidadGeneral" &&
              renderTabIncapacidadGeneral()}
            {activeTab === "ordenMedica" &&
              (() => {
                const buildGnHeader = (titleDoc, accent) => {
                  const fd = _sanitize(
                    data.fechaConsulta || new Date().toLocaleDateString("es-CO")
                  );
                  const accentSafe = /^#[0-9a-fA-F]{3,6}$/.test(accent)
                    ? accent
                    : "#2563eb";
                  const _miIPSGn = currentUser?.empresaId
                    ? companies.find((c) => c.id === currentUser.empresaId) ||
                      null
                    : null;
                  const pNom = _sanitize(data.nombres || "---");
                  const pDTipo = _sanitize(data.docTipo || "CC");
                  const pDNum = _sanitize(data.docNumero || "---");
                  const pEdad = _sanitize(String(data.edad || "--"));
                  const pSexo = _sanitize(data.genero || "---");
                  const pEps = _sanitize(data.eps || "---");
                  const pMotivo = _sanitize(data.motivoConsulta || "---");
                  return `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${accentSafe};padding-bottom:10px;margin-bottom:14px;">
                  ${_ipsDocLeftHtml(_miIPSGn, _billDocData, accentSafe)}
                  <div style="width:34%;text-align:center;border-left:1px solid #ddd;border-right:1px solid #ddd;padding:0 10px;">
                    <p style="font-size:13pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:2px 0;">${_sanitize(
                    titleDoc
                  )}</p>
                    <p style="font-size:7pt;color:#888;margin:2px 0;">Res. 1995&#x2F;1999 · Cons. Gral.</p>
                    <p style="font-size:8pt;font-weight:700;color:#333;margin:5px 0 2px 0;">Fecha: ${fd}</p>
                  </div>
                  <div style="width:32%;text-align:right;padding-left:8px;">
                    <p style="font-size:10.5pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:0 0 3px 0;">${pNom}</p>
                    <p style="font-size:7.5pt;color:#444;margin:1px 0;">${pDTipo}: <b>${pDNum}</b> · Edad: <b>${pEdad} años</b></p>
                    <p style="font-size:7.5pt;color:#444;margin:1px 0;">Sexo: ${pSexo} · EPS: <b>${pEps}</b></p>
                    <p style="font-size:7.5pt;color:#444;margin:1px 0;">Motivo: ${pMotivo}</p>
                  </div>
                </div>`;
                };
                const baseStyle = `@page{size:letter portrait;margin:1.1cm 1.3cm 1.3cm 1.3cm;}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body{font-family:Arial,Helvetica,sans-serif;font-size:9.5pt;color:#111;margin:0;padding:0;line-height:1.45;}.sec-title{font-size:8.5pt;font-weight:900;text-transform:uppercase;border-bottom:1.5px solid currentColor;padding-bottom:3px;margin:10px 0 6px 0;}.med-card{border:1px solid #d1fae5;border-left:4px solid #059669;border-radius:4px;padding:6px 10px;margin-bottom:6px;page-break-inside:avoid;background:#f0fdf4;}.deriv-card{border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:4px;padding:8px 10px;margin-bottom:7px;page-break-inside:avoid;background:#eff6ff;}.badge{display:inline-block;padding:1px 7px;border-radius:50px;font-size:7.5pt;font-weight:700;}.urgente{background:#fee2e2;color:#dc2626;}.prioritaria{background:#fef3c7;color:#92400e;}.electiva{background:#dcfce7;color:#166534;}.sig-block{display:flex;justify-content:space-between;align-items:flex-end;margin-top:18mm;}.sig-line{text-align:center;width:42%;}.sig-top{border-top:2px solid #222;padding-top:4px;font-size:7.5pt;font-weight:700;}.block-avoid{page-break-inside:avoid;}`;
                const sigBlock = `<div class="sig-block"><div class="sig-line"><div class="sig-top">Firma Paciente / Responsable</div><p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: ___________________</p></div><div class="sig-line">${
                  _billDocSig
                    ? `<img src="${_billDocSig}" style="max-height:55px;max-width:150px;" alt="Firma"/>`
                    : '<div style="height:55px;border-bottom:2px solid #222;"></div>'
                }<p style="font-size:8.5pt;font-weight:900;margin:3px 0;">${
                  _billDocData?.nombre || ""
                }</p><p style="font-size:7.5pt;color:#555;margin:1px 0;">${
                  _billDocData?.titulo || ""
                }</p></div></div>`;
                const printSection = (sectionId, titleDoc) => {
                  const w = window.open("", "_blank", "width=870,height=1100");
                  if (!w) return;
                  let accent = "#2563eb";
                  let bodyHtml = "";
                  if (sectionId === "gn-prescripcion") {
                    accent = "#059669";
                    const meds = data.formulaMedicamentos || [];
                    const medsHtml =
                      meds.length > 0
                        ? meds
                            .map(
                              (m, i) =>
                                `<div class="med-card" style="display:flex;gap:8px;align-items:flex-start;"><span style="background:#059669;color:white;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:8pt;font-weight:900;flex-shrink:0;">${
                                  i + 1
                                }</span><div style="flex:1;"><p style="font-size:10pt;font-weight:900;color:#065f46;margin:0 0 2px 0;">${
                                  m.nombre || ""
                                } <span style="font-size:8pt;font-weight:400;color:#6b7280;">${
                                  m.presentacion || ""
                                }</span></p><p style="font-size:8.5pt;color:#374151;margin:1px 0;"><b>Dosis:</b> ${
                                  m.dosis || "--"
                                } · <b>Frec.:</b> ${
                                  m.frecuencia || "--"
                                } · <b>Duración:</b> ${m.duracion || "--"}</p>${
                                  m.indicaciones
                                    ? `<p style="font-size:8pt;color:#92400e;font-style:italic;margin:2px 0;">&#9888; ${m.indicaciones}</p>`
                                    : ""
                                }</div></div>`
                            )
                            .join("")
                        : '<p style="color:#9ca3af;font-style:italic;text-align:center;padding:12px;">Sin medicamentos.</p>';
                    const planMeds =
                      !meds.length && data.plan?.medicamentos
                        ? `<div style="margin-top:8px;white-space:pre-wrap;font-size:8.5pt;">${data.plan.medicamentos}</div>`
                        : "";
                    const dx =
                      (data.diagnosticos || [])[0]?.descripcion ||
                      data.diagnosticoPrincipal ||
                      "--";
                    bodyHtml = `<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:10px 12px;margin-bottom:12px;"><p class="sec-title" style="color:#065f46;">&#128138; Prescripción Médica</p>${medsHtml}${planMeds}<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;border-top:1px solid #a7f3d0;padding-top:8px;"><p style="font-size:8.5pt;"><b>Diagnóstico:</b> ${dx}</p><p style="font-size:8.5pt;"><b>Control en:</b> ${
                      data.plan?.controlEn || "--"
                    }</p></div></div>${sigBlock}`;
                  } else if (sectionId === "gn-examenes") {
                    accent = "#0d9488";
                    const dxs = (data.diagnosticos || [])
                      .map(
                        (d, i) =>
                          `<p class="block-avoid" style="font-size:8.5pt;margin:2px 0;"><b>${
                            d.cie10 || ""
                          }</b>${d.cie10 ? " - " : ""} ${d.descripcion || ""} ${
                            d.tipo
                              ? `<span style="color:#9ca3af;">(${d.tipo})</span>`
                              : ""
                          }</p>`
                      )
                      .join("");
                    const paracl = data.plan?.paraclinicosSolicitados
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#128300; Paraclínicos / Exámenes Solicitados</p><p style="font-size:8.5pt;white-space:pre-wrap;line-height:1.5;">${data.plan.paraclinicosSolicitados}</p></div>`
                      : "";
                    const remis = data.plan?.remisiones
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#128279; Remisiones / Interconsultas</p><p style="font-size:8.5pt;white-space:pre-wrap;">${data.plan.remisiones}</p></div>`
                      : "";
                    const recos = data.plan?.recomendaciones
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#9989; Recomendaciones</p><p style="font-size:8.5pt;white-space:pre-wrap;line-height:1.6;">${data.plan.recomendaciones}</p></div>`
                      : "";
                    const conducta = data.plan?.conducta
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#128203; Conducta Médica</p><p style="font-size:8.5pt;white-space:pre-wrap;">${data.plan.conducta}</p></div>`
                      : "";
                    bodyHtml = `<div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:4px;padding:10px 12px;margin-bottom:12px;">${
                      dxs
                        ? `<div style="margin-bottom:8px;"><p class="sec-title" style="color:#0d9488;">&#128203; Diagnósticos</p>${dxs}</div>`
                        : ""
                    }${paracl}${remis}${recos}${conducta}</div>${sigBlock}`;
                  } else if (sectionId === "gn-derivaciones") {
                    accent = "#7c3aed";
                    const derivList = data.derivaciones || [];
                    const derivHtml =
                      derivList.length > 0
                        ? derivList
                            .map(
                              (d, i) =>
                                `<div style="margin-bottom:8px;border:1px solid #ddd6fe;border-radius:6px;padding:8px 10px;background:${
                                  i % 2 === 0 ? "#faf5ff" : "white"
                                };"><p style="font-weight:900;font-size:9.5pt;margin:0 0 2px;">${_sanitize(
                                  d.especialidad || "--"
                                )} <span style="font-size:8pt;color:#888;font-weight:400;">(${_sanitize(
                                  d.urgencia || "Electiva"
                                )})</span></p><p style="font-size:8pt;color:#444;margin:1px 0;"><b>Motivo:</b> ${_sanitize(
                                  d.motivo || "--"
                                )}</p>${
                                  d.observaciones
                                    ? `<p style="font-size:7.5pt;color:#666;margin-top:2px;font-style:italic;">${_sanitize(
                                        d.observaciones
                                      )}</p>`
                                    : ""
                                }</div>`
                            )
                            .join("")
                        : '<p style="color:#888;font-style:italic;font-size:8.5pt;">Sin derivaciones registradas.</p>';
                    bodyHtml = `<div style="background:#faf5ff;border:1px solid #ddd6fe;border-radius:4px;padding:10px 12px;margin-bottom:12px;">${derivHtml}</div>`;
                  } else if (sectionId === "gn-incapacidad") {
                    accent = "#dc2626";
                    bodyHtml = `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:12px;margin-bottom:12px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;"><div style="font-size:8.5pt;"><p><b>Paciente:</b> ${
                      data.nombres || "--"
                    }</p><p><b>CC:</b> ${
                      data.docNumero || "--"
                    }</p><p><b>Edad:</b> ${
                      data.edad || "--"
                    } años</p><p><b>EPS:</b> ${
                      data.eps || "--"
                    }</p></div><div style="text-align:center;background:#fee2e2;border-radius:4px;padding:8px;"><p style="font-size:8pt;font-weight:900;color:#dc2626;text-transform:uppercase;margin:0 0 4px 0;">Días de Incapacidad</p><p style="font-size:28pt;font-weight:900;color:#dc2626;line-height:1;margin:0;">${
                      data.incapacidad?.dias || 0
                    }</p><p style="font-size:8pt;color:#dc2626;font-weight:700;">${numeroALetras(
                      data.incapacidad?.dias || 0
                    )} DÍAS</p></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:8.5pt;"><p><b>Origen:</b> ${
                      data.incapacidad?.origen || "--"
                    }</p><p><b>Fecha inicio:</b> ${
                      data.incapacidad?.desde || "--"
                    }</p><p><b>Fecha fin:</b> ${
                      data.incapacidad?.hasta || "--"
                    }</p><p><b>Diagnóstico:</b> ${
                      data.incapacidad?.diagnostico || "--"
                    }</p></div></div>${sigBlock}`;
                  }
                  w.document
                    .write(`<!DOCTYPE html><html lang="es"><head><title>${_sanitize(
                    titleDoc
                  )}</title><meta charset="UTF-8"/><style>
${baseStyle}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#1e3a5f;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;}
.print-toolbar button{background:white;color:#1e3a5f;border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
.print-toolbar button.btn-print{background:#10b981;color:white;}
.print-toolbar button.btn-close{background:#ef4444;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#93c5fd;}
[contenteditable]{outline:1.5px dashed #93c5fd;border-radius:3px;padding:1px 3px;cursor:text;}
[contenteditable]:focus{outline:2px solid #3b82f6;background:#eff6ff;}
body{padding-top:52px;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">✏️ ${_sanitize(titleDoc)}</span>
  <span class="hint">Haz clic en cualquier texto para editar</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir ahora</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${buildGnHeader(
                    titleDoc,
                    accent
                  )}</div><div contenteditable="true" spellcheck="false">${bodyHtml}</div></body></html>`);
                  w.document.close();
                  w.focus();
                  // No auto-print - usuario edita y hace clic en Imprimir
                };
                // ── Impresión individual de receta (HC General) ──
                const openSingleMedWindow = (med, mIdx) => {
                  const w = window.open("", "_blank", "width=600,height=700");
                  if (!w) return;
                  const accent = "#059669";
                  const hdr = buildGnHeader("Receta Médica", accent);
                  const docSig = _billDocSig || null;
                  const singleHtml = `
                  <div class="med-card" style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
                    <span class="med-num">${mIdx + 1}</span>
                    <div style="flex:1;">
                      <p style="font-size:12pt;font-weight:900;color:#065f46;margin:0 0 4px 0;">${_sanitize(
                        med.nombre || ""
                      )} <span style="font-size:9pt;font-weight:400;color:#555;">(${_sanitize(
                    med.presentacion || ""
                  )})</span></p>
                      <p style="font-size:9.5pt;color:#374151;margin:2px 0;"><b>Dosis:</b> ${_sanitize(
                        med.dosis || "--"
                      )} &nbsp;·&nbsp; <b>Frecuencia:</b> ${_sanitize(
                    med.frecuencia || "--"
                  )} &nbsp;·&nbsp; <b>Duración:</b> ${_sanitize(
                    med.duracion || "--"
                  )}</p>
                      ${
                        med.indicaciones
                          ? `<p style="font-size:9pt;color:#92400e;font-style:italic;margin:4px 0;">⚠ ${_sanitize(
                              med.indicaciones
                            )}</p>`
                          : ""
                      }
                    </div>
                  </div>
                  <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:8px 12px;margin-top:8px;">
                    <p style="font-size:8.5pt;"><b>Diagnóstico:</b> ${_sanitize(
                      (data.diagnosticos || [])[0]?.descripcion || "--"
                    )}</p>
                    <p style="font-size:8.5pt;"><b>Control en:</b> ${_sanitize(
                      data.plan?.controlEn || "--"
                    )}</p>
                    <p style="font-size:8.5pt;"><b>Motivo:</b> ${_sanitize(
                      data.motivoConsulta || "--"
                    )}</p>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16mm;">
                    <div style="text-align:center;width:42%;">
                      <div style="border-top:2px solid #222;padding-top:4px;font-size:7.5pt;font-weight:700;">Firma del Paciente / Responsable</div>
                      <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: _______________________</p>
                    </div>
                    <div style="text-align:center;width:42%;">
                      ${
                        docSig
                          ? `<img src="${docSig}" style="max-height:50px;max-width:130px;object-fit:contain;display:block;margin:0 auto 4px;"/>`
                          : '<div style="height:50px;"></div>'
                      }
                      <div style="border-top:2px solid #222;padding-top:4px;">
                        <p style="font-size:8.5pt;font-weight:900;margin:2px 0;">${_sanitize(
                          _billDocData?.nombre || ""
                        )}</p>
                        <p style="font-size:7.5pt;color:#555;margin:1px 0;">${_sanitize(
                          _billDocData?.titulo || ""
                        )}</p>
                        <p style="font-size:7.5pt;color:#555;margin:1px 0;">Lic: ${_sanitize(
                          _billDocData?.licencia || ""
                        )}</p>
                      </div>
                    </div>
                  </div>`;
                  w.document
                    .write(`<!DOCTYPE html><html lang="es"><head><title>Receta - ${_sanitize(
                    med.nombre
                  )}</title><meta charset="UTF-8"/><style>
${baseStyle}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#065f46;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;}
.print-toolbar button{border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
.print-toolbar button.btn-print{background:#10b981;color:white;}
.print-toolbar button.btn-close{background:#ef4444;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#6ee7b7;}
[contenteditable]{outline:1.5px dashed #6ee7b7;border-radius:3px;padding:1px 3px;cursor:text;}
[contenteditable]:focus{outline:2px solid #10b981;background:#ecfdf5;}
body{padding-top:52px;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">💊 Receta - ${_sanitize(med.nombre)}</span>
  <span class="hint">Edita antes de imprimir</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir receta</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${hdr}</div>
<div contenteditable="true" spellcheck="false">${singleHtml}</div>
</body></html>`);
                  w.document.close();
                  w.focus();
                };
                return (
                  <div className="space-y-4">
                    {/* ── ENTRADA INTERACTIVA: FÓRMULA Y DERIVACIONES (mismo componente HC Ocup) ── */}
                    <div className="no-print">
                      <TabFormulaDerivacion
                        data={data}
                        setData={setData}
                        _billDocData={_billDocData}
                        _billDocSig={_billDocSig}
                        onPrint={handlePrint}
                      />
                    </div>
                    {/* ══ BARRA SELECCIÓN DE SECCIONES ══ */}
                    <div
                      className="no-print bg-white border border-blue-100 rounded-2xl shadow-sm p-4 mx-auto"
                      style={{ maxWidth: "21.59cm" }}
                    >
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-3 flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5 text-blue-500" />{" "}
                        Documentos - Haga clic para ver y luego imprimir
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            const el =
                              document.getElementById("gn-prescripcion");
                            if (el)
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                        >
                          💊 Prescripción Médica
                        </button>
                        <button
                          onClick={() => {
                            const el = document.getElementById("gn-examenes");
                            if (el)
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition"
                        >
                          🔬 Exámenes y Recomendaciones
                        </button>
                        <button
                          onClick={() => {
                            const el =
                              document.getElementById("gn-derivaciones");
                            if (el)
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                        >
                          🔀 Derivaciones / Interconsultas
                        </button>
                        {data.incapacidad?.aplica && (
                          <button
                            onClick={() => {
                              const el =
                                document.getElementById("gn-incapacidad");
                              if (el)
                                el.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition"
                          >
                            🏥 Incapacidad
                          </button>
                        )}
                        <div className="ml-auto flex gap-2">
                          <button
                            onClick={() =>
                              printSection(
                                "gn-prescripcion",
                                "Prescripción Médica"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            <Printer className="w-3 h-3" /> Presc.
                          </button>
                          <button
                            onClick={() =>
                              printSection(
                                "gn-examenes",
                                "Exámenes y Recomendaciones"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition"
                          >
                            <Printer className="w-3 h-3" /> Exám.
                          </button>
                          <button
                            onClick={() =>
                              printSection(
                                "gn-derivaciones",
                                "Derivaciones / Interconsultas"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition"
                          >
                            <Printer className="w-3 h-3" /> Deriv.
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-700 text-white hover:bg-slate-800 transition"
                          >
                            <Printer className="w-3 h-3" /> Todo
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: PRESCRIPCIÓN ══ */}
                    <div
                      id="gn-prescripcion"
                      className="bg-white mx-auto shadow-xl print:shadow-none carta-visual"
                      style={{
                        width: "21.59cm",
                        padding: "1.2cm",
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="flex justify-between items-center border-b-2 border-blue-500 pb-3 mb-4 print:border-black">
                        <div className="w-1/3">
                          <BrandLogo data={_billDocData} />
                        </div>
                        <div className="w-1/3 text-center">
                          <h2 className="text-sm font-black uppercase text-gray-800">
                            Prescripción Médica
                          </h2>
                          <p className="text-[9px] text-gray-500">
                            Fórmula Médica -- Res. 1995/1999
                          </p>
                        </div>
                        <div className="w-1/3 text-right text-[9px] text-gray-500">
                          <p className="font-bold">{data.nombres}</p>
                          <p>
                            CC: {data.docNumero} · {data.edad} años
                          </p>
                          <p>{data.fechaConsulta}</p>
                        </div>
                      </div>
                      {/* ── Datos del paciente horizontal ── */}
                      <div className="grid grid-cols-5 gap-1 mb-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 print:bg-transparent print:border print:border-gray-400">
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Paciente
                          </p>
                          <p className="text-[10px] font-black text-gray-900">
                            {data.nombres || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Documento
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.docTipo || "CC"}: {data.docNumero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Edad / Género
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.edad || "--"} años · {data.genero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            EPS
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.eps || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Dx Principal
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {(data.diagnosticos || [])[0]?.cie10 || "--"}{" "}
                            {(data.diagnosticos || [])[0]?.descripcion || ""}
                          </p>
                        </div>
                      </div>
                      {(data.formulaMedicamentos || []).length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {(data.formulaMedicamentos || []).map((med, idx) => (
                            <div
                              key={idx}
                              className="flex gap-3 border border-gray-200 rounded-lg p-2 print-break-avoid print:border-gray-300"
                            >
                              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-black text-sm text-gray-900">
                                  {med.nombre}{" "}
                                  <span className="font-normal text-gray-500 text-xs">
                                    {med.presentacion}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-700">
                                  <b>Dosis:</b> {med.dosis} · <b>Cada:</b>{" "}
                                  {med.frecuencia} · <b>Por:</b> {med.duracion}
                                </p>
                                {med.indicaciones && (
                                  <p className="text-[10px] italic text-amber-700">
                                    ⚠ {med.indicaciones}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => openSingleMedWindow(med, idx)}
                                title="Imprimir esta receta individual"
                                className="no-print flex items-center gap-0.5 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg px-2 py-1 text-[10px] font-bold transition self-start shrink-0"
                              >
                                <Printer className="w-3 h-3" /> Receta
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : data.plan?.medicamentos ? (
                        <div className="mb-4">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-200 mb-2 text-gray-600">
                            Prescripción
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.medicamentos}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic py-4 text-center">
                          Sin medicamentos prescritos.
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                        <p>
                          <b>Diagnóstico:</b>{" "}
                          {(data.diagnosticos || [])[0]?.descripcion ||
                            data.diagnosticoPrincipal ||
                            "--"}
                        </p>
                        <p>
                          <b>Control en:</b>{" "}
                          {data.plan?.controlEn ||
                            data.frecuenciaSeguimiento ||
                            "--"}
                        </p>
                      </div>
                      <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                        <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                          <p className="text-[10px] font-bold">
                            Firma Paciente / Responsable
                          </p>
                        </div>
                        <div className="text-center w-2/5">
                          <DoctorSignature
                            signature={_billDocSig}
                            data={_billDocData}
                            showData={true}
                          />
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: EXÁMENES Y RECOMENDACIONES ══ */}
                    <div
                      id="gn-examenes"
                      className="bg-white mx-auto shadow-xl print:shadow-none carta-visual print-page-break"
                      style={{
                        width: "21.59cm",
                        padding: "1.2cm",
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="flex justify-between items-center border-b-2 border-teal-500 pb-3 mb-4 print:border-black">
                        <div className="w-1/3">
                          <BrandLogo data={_billDocData} />
                        </div>
                        <div className="w-1/3 text-center">
                          <h2 className="text-sm font-black uppercase text-gray-800">
                            Exámenes y Recomendaciones
                          </h2>
                          <p className="text-[9px] text-gray-500">
                            Orden Médica -- Res. 1995/1999
                          </p>
                        </div>
                        <div className="w-1/3 text-right text-[9px] text-gray-500">
                          <p className="font-bold">{data.nombres}</p>
                          <p>CC: {data.docNumero}</p>
                          <p>{data.fechaConsulta}</p>
                        </div>
                      </div>
                      {/* ── Datos del paciente horizontal ── */}
                      <div className="grid grid-cols-5 gap-1 mb-4 bg-teal-50 border border-teal-100 rounded-xl px-4 py-2.5 print:bg-transparent print:border print:border-gray-400">
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Paciente
                          </p>
                          <p className="text-[10px] font-black text-gray-900">
                            {data.nombres || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Documento
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.docTipo || "CC"}: {data.docNumero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Edad / Género
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.edad || "--"} años · {data.genero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            EPS
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.eps || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Motivo de Consulta
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800 truncate">
                            {data.motivoConsulta || "--"}
                          </p>
                        </div>
                      </div>
                      {data.diagnosticos?.length > 0 && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Diagnósticos
                          </h4>
                          {data.diagnosticos.map((d, i) => (
                            <p key={i} className="text-xs mb-1">
                              <b>{d.cie10}</b> -- {d.descripcion}{" "}
                              <span className="text-gray-400">({d.tipo})</span>
                            </p>
                          ))}
                        </div>
                      )}
                      {data.plan?.paraclinicosSolicitados && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Paraclínicos / Exámenes Solicitados
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.paraclinicosSolicitados}
                          </p>
                        </div>
                      )}
                      {data.plan?.remisiones && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Remisiones / Interconsultas
                          </h4>
                          <p className="text-xs whitespace-pre-wrap">
                            {data.plan.remisiones}
                          </p>
                        </div>
                      )}
                      {data.plan?.recomendaciones && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Recomendaciones al Paciente
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.recomendaciones}
                          </p>
                        </div>
                      )}
                      {data.plan?.conducta && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Conducta Médica
                          </h4>
                          <p className="text-xs whitespace-pre-wrap">
                            {data.plan.conducta}
                          </p>
                        </div>
                      )}
                      <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                        <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                          <p className="text-[10px] font-bold">
                            Firma Paciente / Responsable
                          </p>
                        </div>
                        <div className="text-center w-2/5">
                          <DoctorSignature
                            signature={_billDocSig}
                            data={_billDocData}
                            showData={true}
                          />
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: DERIVACIONES / INTERCONSULTAS ══ */}
                    <div
                      id="gn-derivaciones"
                      className="bg-white mx-auto shadow-xl print:shadow-none carta-visual print-page-break"
                      style={{
                        width: "21.59cm",
                        padding: "1.2cm",
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="flex justify-between items-center border-b-2 border-purple-500 pb-3 mb-4 print:border-black">
                        <div className="w-1/3">
                          <BrandLogo data={_billDocData} />
                        </div>
                        <div className="w-1/3 text-center">
                          <h2 className="text-sm font-black uppercase text-gray-800">
                            Derivaciones / Interconsultas
                          </h2>
                          <p className="text-[9px] text-gray-500">
                            Orden Médica - Res. 1995/1999
                          </p>
                        </div>
                        <div className="w-1/3 text-right text-[9px] text-gray-500">
                          <p className="font-bold">{data.fechaConsulta}</p>
                        </div>
                      </div>
                      {/* Datos paciente horizontal */}
                      <div className="grid grid-cols-5 gap-1 mb-4 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5 print:bg-transparent print:border print:border-gray-400">
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Paciente
                          </p>
                          <p className="text-[10px] font-black text-gray-900">
                            {data.nombres || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Documento
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.docTipo || "CC"}: {data.docNumero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Edad / Género
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.edad || "--"} años · {data.genero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            EPS
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.eps || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Fecha
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.fechaConsulta || "--"}
                          </p>
                        </div>
                      </div>
                      {/* Diagnóstico de referencia */}
                      {(data.diagnosticos || []).length > 0 && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-purple-200 mb-2 text-purple-700">
                            Diagnóstico de Referencia
                          </h4>
                          {data.diagnosticos.map((d, i) => (
                            <p key={i} className="text-xs mb-1">
                              <b>{d.cie10}</b> - {d.descripcion}{" "}
                              <span className="text-gray-400">({d.tipo})</span>
                            </p>
                          ))}
                        </div>
                      )}
                      {/* Lista de derivaciones */}
                      {(data.derivaciones || []).length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {(data.derivaciones || []).map((der, idx) => (
                            <div
                              key={idx}
                              className="border border-purple-200 rounded-lg p-3 print-break-avoid print:border-gray-300 bg-purple-50/40 print:bg-transparent"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs flex-shrink-0">
                                      {idx + 1}
                                    </span>
                                    <p className="font-black text-sm text-gray-900">
                                      {der.especialidad || "--"}
                                    </p>
                                    <span
                                      className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                        der.urgencia === "Urgente"
                                          ? "bg-red-100 text-red-700"
                                          : der.urgencia === "Prioritaria"
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {der.urgencia || "Electiva"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700 ml-8">
                                    <b>Motivo:</b> {der.motivo || "--"}
                                  </p>
                                  {der.observaciones && (
                                    <p className="text-[10px] italic text-purple-700 ml-8 mt-0.5">
                                      📝 {der.observaciones}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-print py-6 text-center text-xs text-gray-400 italic border border-dashed border-purple-200 rounded-xl">
                          Sin derivaciones registradas. Use el formulario de
                          arriba para agregar.
                        </div>
                      )}
                      {/* Plan de conducta si aplica */}
                      {data.plan?.conducta && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-purple-200 mb-2 text-purple-700">
                            Plan de Conducta
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.conducta}
                          </p>
                        </div>
                      )}
                      {/* Firma */}
                      <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                        <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                          <p className="text-[10px] font-bold">
                            Firma Paciente / Responsable
                          </p>
                        </div>
                        <div className="text-center w-2/5">
                          <DoctorSignature
                            signature={_billDocSig}
                            data={_billDocData}
                            showData={true}
                          />
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: INCAPACIDAD ══ */}
                    {data.incapacidad?.aplica && (
                      <div
                        id="gn-incapacidad"
                        className="bg-white mx-auto shadow-xl print:shadow-none carta-visual print-page-break"
                        style={{
                          width: "21.59cm",
                          padding: "1.2cm",
                          boxSizing: "border-box",
                        }}
                      >
                        <div className="flex justify-between items-center border-b-2 border-red-500 pb-3 mb-4 print:border-black">
                          <div className="w-1/3">
                            <BrandLogo data={_billDocData} />
                          </div>
                          <div className="w-1/3 text-center">
                            <h2 className="text-sm font-black uppercase text-gray-800">
                              Certificado de Incapacidad Médica
                            </h2>
                            <p className="text-[9px] text-gray-500">
                              Formulario -- Res. 1995/1999
                            </p>
                          </div>
                          <div className="w-1/3 text-right text-[9px] text-gray-500">
                            <p className="font-bold">{data.fechaConsulta}</p>
                            <p className="text-[8px]">Res. 1995/1999</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                          <div className="bg-gray-50 p-3 rounded-lg print:bg-transparent print:border print:border-gray-300">
                            <p>
                              <b>Paciente:</b> {data.nombres}
                            </p>
                            <p>
                              <b>CC:</b> {data.docNumero}
                            </p>
                            <p>
                              <b>Edad:</b> {data.edad} años
                            </p>
                            <p>
                              <b>EPS:</b> {data.eps}
                            </p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg text-center print:bg-transparent print:border print:border-gray-300">
                            <p className="text-[10px] font-bold text-red-700 uppercase">
                              Días de Incapacidad
                            </p>
                            <p className="text-5xl font-black text-red-900">
                              {data.incapacidad?.dias || 0}
                            </p>
                            <p className="text-[10px] text-red-700 font-bold">
                              {numeroALetras(data.incapacidad?.dias || 0)} DÍAS
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4 text-xs print-break-avoid">
                          <p>
                            <b>Origen:</b>{" "}
                            {data.incapacidad?.origen || "Enfermedad General"}
                          </p>
                          <p>
                            <b>Fecha inicio:</b>{" "}
                            {data.incapacidad?.desde || "--"}
                          </p>
                          <p>
                            <b>Fecha fin:</b> {data.incapacidad?.hasta || "--"}
                          </p>
                          <p>
                            <b>Diagnóstico:</b>{" "}
                            {data.incapacidad?.diagnostico ||
                              data.diagnosticoPrincipal ||
                              "--"}
                          </p>
                        </div>
                        {data.plan?.medicamentos && (
                          <div className="mb-3">
                            <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                              Tratamiento
                            </h4>
                            <p className="text-xs whitespace-pre-wrap">
                              {data.plan.medicamentos}
                            </p>
                          </div>
                        )}
                        <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                          <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                            <p className="text-[10px] font-bold">
                              Firma Paciente / Responsable
                            </p>
                          </div>
                          <div className="text-center w-2/5">
                            <DoctorSignature
                              signature={_billDocSig}
                              data={_billDocData}
                              showData={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
          </main>
        </div>
      );
    }
    return <LoginPage {...sharedProps} />;
  };



  return (
    <>
      <PrintStyles />
      {showPortalPublico ? (
        <PortalPublicoTrabajador
          sbUrl={_SB_URL}
          sbKey={_SB_KEY}
          onVolver={currentUser ? () => setShowPortalPublico(false) : null}
        />
      ) : (
        renderCurrentView()
      )}
      {renderMensajesOverlay()}
      {showNotifModal && (
        <NotificacionModal
          data={notifData}
          onCerrar={() => setShowNotifModal(false)}
        />
      )}
      {/* Modal Alert */}
      {/* Modal RIPS - muestra JSON para copiar/descargar - sin bloquear sandbox */}
      {ripsModalData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[300] p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
            style={{ maxHeight: "88vh" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-orange-200 bg-orange-50 rounded-t-2xl">
              <div>
                <p className="font-black text-orange-800 text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4" /> RIPS JSON - Res. 2275/2023
                </p>
                <p className="text-[10px] text-orange-600 mt-0.5">
                  {ripsModalData.filename}
                </p>
              </div>
              <button
                onClick={() => setRipsModalData(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-black"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
              <p className="text-[11px] text-amber-800 font-bold">
                ⚠️ Para radicar ante MinSalud se requiere firma digital DIAN
                certificada (Certicámara/GSE).
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                Copie el JSON o descárguelo. Este archivo cumple la estructura
                Res. 2275/2023.
              </p>
            </div>
            <textarea
              readOnly
              value={ripsModalData.json}
              className="flex-1 font-mono text-[10px] p-4 bg-gray-900 text-green-300 resize-none outline-none"
              style={{ minHeight: "300px" }}
            />
            <div className="flex gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(ripsModalData.json)
                    .then(() => showAlert("✅ JSON copiado al portapapeles"))
                    .catch(() =>
                      showAlert("Use Ctrl+A / Ctrl+C en el área de texto")
                    );
                }}
                className="flex-1 bg-orange-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-orange-700 flex items-center justify-center gap-1"
              >
                📋 Copiar JSON
              </button>
              <button
                onClick={() => {
                  try {
                    const b64 = btoa(
                      unescape(encodeURIComponent(ripsModalData.json))
                    );
                    const a = document.createElement("a");
                    a.href = "data:application/json;base64," + b64;
                    a.download = ripsModalData.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } catch (e) {
                    showAlert(
                      "Use el botón Copiar y guarde en un archivo .json"
                    );
                  }
                }}
                className="flex-1 bg-gray-700 text-white font-bold text-xs py-2 rounded-xl hover:bg-gray-800 flex items-center justify-center gap-1"
              >
                ⬇️ Descargar .json
              </button>
              <button
                onClick={() => setRipsModalData(null)}
                className="px-4 bg-gray-100 text-gray-600 font-bold text-xs py-2 rounded-xl hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Backup - mismo patrón que RIPS */}
      {backupModalData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[300] p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
            style={{ maxHeight: "88vh" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-200 bg-emerald-50 rounded-t-2xl">
              <div>
                <p className="font-black text-emerald-800 text-sm flex items-center gap-2">
                  <HardDrive className="w-4 h-4" /> Backup Completo SISO
                </p>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  {backupModalData.filename}
                </p>
                {backupModalData.summary && (
                  <p className="text-[9px] text-emerald-500 mt-0.5">
                    📦 {backupModalData.summary}
                  </p>
                )}
              </div>
              <button
                onClick={() => setBackupModalData(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-black"
              >
                ✕
              </button>
            </div>
            <textarea
              readOnly
              value={backupModalData.json}
              className="flex-1 font-mono text-[10px] p-4 bg-gray-900 text-green-300 resize-none outline-none"
              style={{ minHeight: "300px" }}
            />
            <div className="flex gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(backupModalData.json)
                    .then(() => showAlert("✅ Backup copiado al portapapeles"))
                    .catch(() =>
                      showAlert("Use Ctrl+A / Ctrl+C en el área de texto")
                    );
                }}
                className="flex-1 bg-emerald-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-emerald-700"
              >
                📋 Copiar JSON
              </button>
              <button
                onClick={() => {
                  try {
                    const b64 = btoa(
                      unescape(encodeURIComponent(backupModalData.json))
                    );
                    const a = document.createElement("a");
                    a.href = "data:application/json;base64," + b64;
                    a.download = backupModalData.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } catch (e) {
                    showAlert(
                      "Use el botón Copiar y guarde en un archivo .json"
                    );
                  }
                }}
                className="flex-1 bg-gray-700 text-white font-bold text-xs py-2 rounded-xl hover:bg-gray-800"
              >
                ⬇️ Descargar .json
              </button>
              <button
                onClick={() => setBackupModalData(null)}
                className="px-4 bg-gray-100 text-gray-600 font-bold text-xs py-2 rounded-xl hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {alertMsg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <AlertCircle className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <p className="text-gray-800 font-bold mb-5 whitespace-pre-wrap text-sm">
              {alertMsg}
            </p>
            <button
              onClick={() => setAlertMsg("")}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold w-full hover:bg-blue-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
      {/* Modal Confirm */}
      {confirmConfig && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <p className="text-gray-800 font-bold mb-5 text-sm">
              {confirmConfig.msg}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmConfig(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmConfig.onConfirm();
                  setConfirmConfig(null);
                }}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal Guardar antes de salir de HC ──────────────────────────── */}
      {_exitHcConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[210] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-gray-800 font-black text-base mb-1">¿Guardar antes de salir?</h3>
            <p className="text-gray-500 text-xs mb-5">
              Tiene cambios sin guardar en esta Historia Clínica.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const proceed = _exitHcConfirm.onProceed;
                  _setExitHcConfirm(null);
                  handleSavePatient();
                  proceed();
                }}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-sm flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar y salir
              </button>
              <button
                onClick={() => {
                  const proceed = _exitHcConfirm.onProceed;
                  _setExitHcConfirm(null);
                  _setHcDirty(false);
                  proceed();
                }}
                className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 text-sm"
              >
                Salir sin guardar
              </button>
              <button
                onClick={() => _setExitHcConfirm(null)}
                className="w-full py-2 text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal elección tipo HC desde Agenda ─────────────────────────── */}
      {hcChoiceAgenda && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[210] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4 text-white">
              <h3 className="text-lg font-black">Iniciar Atención Médica</h3>
              <p className="text-blue-100 text-xs mt-0.5">
                Paciente:{" "}
                <span className="font-bold text-white">
                  {hcChoiceAgenda.nombre}
                </span>
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-5 text-center font-medium">
                Seleccione el tipo de Historia Clínica a abrir:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    abrirHCDesdeAgenda(hcChoiceAgenda, "ocupacional")
                  }
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition group"
                >
                  <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <span className="text-3xl">🏭</span>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-emerald-800 text-sm">
                      HC Ocupacional
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      Examen médico laboral · Aptitud
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => abrirHCDesdeAgenda(hcChoiceAgenda, "general")}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition group"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <span className="text-3xl">🏥</span>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-blue-800 text-sm">
                      HC General
                    </p>
                    <p className="text-[10px] text-blue-600 mt-0.5">
                      Consulta médica · Fórmula
                    </p>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setHcChoiceAgenda(null)}
                className="mt-4 w-full py-2 text-gray-500 text-sm font-bold hover:text-gray-700 hover:bg-gray-50 rounded-xl transition"
              >
                ✕ Cancelar - volver a la agenda
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Prompt */}
      {promptConfig && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <p className="text-gray-800 font-bold mb-3 text-sm">
              {promptConfig.msg}
            </p>
            <input
              autoFocus
              type={promptConfig.type}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptConfig.onSubmit(promptValue);
                  setPromptConfig(null);
                }
              }}
              className="w-full border-2 border-emerald-400 p-2.5 rounded-xl mb-4 text-sm focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setPromptConfig(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  promptConfig.onSubmit(promptValue);
                  setPromptConfig(null);
                }}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-sm"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Config Panel */}
      {showAIConfig && (
        <AIConfigPanel
          aiConfig={aiConfig}
          onSave={handleSaveAIConfig}
          onClose={() => setShowAIConfig(false)}
        />
      )}
      {/* ── MODAL REPORTE DE GUARDADO EN NUBE ── */}
      {showSyncReport && syncReport && (
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowSyncReport(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-violet-100 p-2 rounded-xl">
                  <Cloud className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-base">
                    Reporte de Guardado en Nube
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    {new Date(syncReport.ts).toLocaleString("es-CO")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Resumen numérico */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                {
                  label: "Pacientes",
                  val: syncReport.summary.pacientes,
                  icon: "👥",
                },
                {
                  label: "Empresas",
                  val: syncReport.summary.empresas,
                  icon: "🏢",
                },
                {
                  label: "Usuarios",
                  val: syncReport.summary.usuarios,
                  icon: "👤",
                },
                {
                  label: "Facturas",
                  val: syncReport.summary.facturas,
                  icon: "🧾",
                },
                {
                  label: "Informes",
                  val: syncReport.summary.informes,
                  icon: "📄",
                },
                {
                  label: "Audit log",
                  val: syncReport.summary.auditLog,
                  icon: "🛡️",
                },
              ].map(({ label, val, icon }) => (
                <div
                  key={label}
                  className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100"
                >
                  <p className="text-lg">{icon}</p>
                  <p className="text-lg font-black text-violet-700">{val}</p>
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {/* Detalle por colección */}
            <div className="space-y-1.5 mb-4">
              <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                Detalle de sincronización
              </p>
              {Object.entries(syncReport.results).map(([label, ok]) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                    ok
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span>{label}</span>
                  <span>
                    {ok ? "✅ Guardado" : "❌ Error - guardado local"}
                  </span>
                </div>
              ))}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                  syncReport.summary.firma
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                <span>✍️ Firma digital</span>
                <span>
                  {syncReport.summary.firma
                    ? "✅ Guardada"
                    : "- Sin firma registrada"}
                </span>
              </div>
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                  syncReport.summary.apiKeys.length
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <span>🔑 API Keys IA</span>
                <span>
                  {syncReport.summary.apiKeys.length
                    ? `✅ ${syncReport.summary.apiKeys.join(", ")}`
                    : "⚠ Sin keys configuradas"}
                </span>
              </div>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-800 font-semibold text-center mb-3">
              {Object.values(syncReport.results).every(Boolean)
                ? "☁️ Todo guardado correctamente en Supabase. Puede acceder desde cualquier dispositivo."
                : "⚠️ Algunos elementos fallaron. Están guardados localmente y se sincronizarán automáticamente."}
            </div>
            <button
              onClick={() => setShowSyncReport(false)}
              className="w-full bg-violet-600 text-white py-2.5 rounded-xl font-black text-sm hover:bg-violet-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      {/* Restricciones Checklist Panel */}
      {showRestriccionesPanel && (
        <RestriccionesChecklistPanel
          selected={data.restriccionesChecklist || {}}
          onChange={(fn) =>
            setData((p) => ({
              ...p,
              restriccionesChecklist: fn(p.restriccionesChecklist || {}),
            }))
          }
          onClose={() => setShowRestriccionesPanel(false)}
          onApply={() => {
            applyRestriccionesChecklist(data.restriccionesChecklist || {});
            setShowRestriccionesPanel(false);
          }}
          isGenerating={isGeneratingRestr}
          onGenerate={generateAIRestricciones}
        />
      )}
      {/* Recomendaciones Checklist Panel */}
      {showRecomendacionesPanel && (
        <RecomendacionesChecklistPanel
          selected={data.recomendacionesChecklist || {}}
          onChange={(fn) =>
            setData((p) => ({
              ...p,
              recomendacionesChecklist: fn(p.recomendacionesChecklist || {}),
            }))
          }
          onClose={() => setShowRecomendacionesPanel(false)}
          onApply={() => {
            applyRecomendacionesChecklist(data.recomendacionesChecklist || {});
            setShowRecomendacionesPanel(false);
          }}
          isGenerating={isGeneratingReco}
          onGenerate={generateAIRecomendaciones}
        />
      )}
    </>
  );
}
