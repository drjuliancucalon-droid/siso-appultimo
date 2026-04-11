import React from 'react';
import {
  FileSearch, Lock, LogOut, Printer, Search
} from "lucide-react";

// ─── Verification Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const Verification = (props) => {
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
    renderNavbar,
    renderTabAdjuntos,
    renderTabSolicitudExamenes,
    renderTabIncapacidadGeneral,
    renderEvolucionModal,
    TabFormulaDerivacion,
    ConsentimientoModal,
    NotificacionModal,
    LoginForm,
    PortalPublicoTrabajador,
    AgendaFieldF,
    ...rest
  } = props;

    const code = verificationCode;
    const setCode = setVerificationCode;
    const found = verificationFound;
    const setFound = setVerificationFound;
    const search = () => {
      const q = code.trim();
      if (!q) {
        showAlert("Ingrese un código de verificación o número de documento.");
        return;
      }
      // Verificación pública: busca en TODOS los pacientes sin importar médico ni rol
      // Cualquier perfil puede verificar un certificado cerrado
      const allPats = patientsList; // ya contiene todos los registros del usuario/sistema
      const byCode = allPats.find(
        (p) =>
          p.codigoVerificacion &&
          p.codigoVerificacion.toUpperCase() === q.toUpperCase()
      );
      const byDoc = !byCode
        ? allPats.filter(
            (p) => p.docNumero === q && p.estadoHistoria === "Cerrada"
          )
        : [];
      if (byCode) {
        setFound(byCode);
      } else if (byDoc.length === 1) {
        setFound(byDoc[0]);
      } else if (byDoc.length > 1) {
        // Multiple closed HC for same doc - show selector
        setFound({ _multiple: byDoc });
      } else {
        showAlert(
          "No se encontró ningún certificado cerrado con ese código o documento."
        );
      }
    };
    return (
      <div className="min-h-screen bg-gray-50 p-8 font-sans print:bg-white print:p-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-2xl p-6 mb-6 no-print">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-indigo-900 flex items-center gap-2">
                <FileSearch className="w-5 h-5" /> Validación de Certificados
              </h2>
              <button
                onClick={() => goBack()}
                className="text-gray-500 font-bold text-sm flex items-center gap-1"
              >
                <LogOut className="rotate-180 w-4 h-4" /> Volver
              </button>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-600 font-bold mb-2">
                Buscar por código de verificación{" "}
                <span className="font-normal">o</span> número de documento del
                paciente:
              </p>
              <div className="flex gap-3">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  className="flex-1 p-2.5 border border-indigo-300 rounded-xl font-mono text-lg tracking-wider focus:ring-2 focus:ring-indigo-400 outline-none"
                  placeholder="Código de verificación Ej: CV-X9Y8Z7"
                />
                <button
                  onClick={search}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" /> Consultar
                </button>
              </div>
            </div>
          </div>
          {/* Multiple results selector */}
          {found?._multiple && (
            <div className="bg-white shadow rounded-2xl p-4 mb-4">
              <p className="text-sm font-black text-gray-700 mb-3">
                📋 Se encontraron {found._multiple.length} certificados para ese
                documento. Seleccione:
              </p>
              <div className="space-y-2">
                {found._multiple.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setVerificationFound(p)}
                    className="w-full text-left p-3 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition"
                  >
                    <p className="font-bold text-sm text-gray-800">
                      {p.nombres}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.fechaExamen} · {p.conceptoAptitud || "-"} · Código:{" "}
                      {p.codigoVerificacion}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {found && !found._multiple && (
            <div
              className="bg-white shadow-2xl print:shadow-none carta-visual mx-auto"
              style={{
                width: "21.59cm",
                minHeight: "auto",
                padding: "1.5cm",
                boxSizing: "border-box",
              }}
            >
              <div className="flex justify-end mb-4 no-print">
                <button
                  onClick={() => handlePrint(`Certificado-${found.nombres}`)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
              </div>
              <div className="text-center border-b-2 border-gray-800 pb-2 mb-4">
                <div className="flex justify-center">
                  <BrandLogo data={activeDoctorData} />
                </div>
                <h2 className="text-xl font-black uppercase mt-2">
                  Certificado de Aptitud Laboral Verificado
                </h2>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4 text-xs grid grid-cols-2 gap-2 print:bg-transparent">
                <p>
                  <strong>Nombre:</strong> {found.nombres}
                </p>
                <p>
                  <strong>ID:</strong> {found.docNumero}
                </p>
                <p>
                  <strong>Cargo:</strong> {found.cargo}
                </p>
                <p>
                  <strong>Empresa:</strong> {found.empresaNombre}
                </p>
                <p>
                  <strong>Fecha:</strong> {found.fechaExamen}
                </p>
                <p>
                  <strong>Tipo:</strong> {found.tipoExamen}
                </p>
              </div>
              <div className="text-center p-3 border-2 border-gray-800 rounded-xl mb-4">
                <h3 className="text-xs font-bold text-gray-500 mb-1 uppercase">
                  Concepto Emitido
                </h3>
                <div className="text-xl font-black uppercase">
                  {found.conceptoAptitud}
                </div>
              </div>
              {found.recomendaciones && (
                <div className="mb-3">
                  <h4 className="font-bold uppercase border-b mb-1 text-xs text-gray-500">
                    Recomendaciones
                  </h4>
                  <p className="text-xs whitespace-pre-wrap">
                    {found.recomendaciones}
                  </p>
                </div>
              )}
              {found.estadoHistoria === "Cerrada" && (
                <div className="mx-4 mb-3 bg-emerald-50 border-2 border-emerald-400 rounded-xl px-4 py-3 flex items-center gap-3 no-print">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-800">
                      Historia Clínica Firmada y Cerrada
                    </p>
                    <p className="text-[10px] text-emerald-600">
                      Código de verificación:{" "}
                      <span className="font-mono font-bold">
                        {found.codigoVerificacion || "--"}
                      </span>
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-between items-end px-4 print-break-avoid">
                <div className="text-center w-1/3">
                  <div className="border-t border-gray-800 pt-1 text-[10px] font-bold">
                    Firma del Trabajador
                  </div>
                </div>
                <div className="text-center w-1/3">
                  <div className="border-2 border-gray-300 p-2 rounded text-[10px]">
                    <p className="font-bold">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      Verificado
                    </p>
                    <p className="font-mono text-sm font-black">
                      {found.codigoVerificacion}
                    </p>
                  </div>
                </div>
                <div className="text-center w-1/3">
                  <DoctorSignature
                    signature={activeSignature}
                    data={activeDoctorData}
                    showData={true}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

};

export default Verification;
