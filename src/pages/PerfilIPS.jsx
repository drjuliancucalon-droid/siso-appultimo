import React from 'react';
import {
  ChevronLeft, Save, Upload
} from "lucide-react";

// ─── PerfilIPS Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const PerfilIPS = (props) => {
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

    if (currentUser?.role !== "admin_empresa") {
      return (
        <div className="p-8 text-center text-gray-500">
          Acceso restringido a admin de empresa.
        </div>
      );
    }
    const miEmpresa =
      companies.find((c) => c.id === currentUser.empresaId) || {};
    const form = ipsPerfilForm;
    const setForm = setIpsPerfilForm;
    const handleLogoUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 200 * 1024) {
        showAlert("⚠️ El logo no debe superar 200 KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) =>
        setForm((p) => ({ ...p, logo: ev.target.result }));
      reader.readAsDataURL(file);
    };
    const handleSave = () => {
      if (!form.nombre.trim()) {
        showAlert("⚠️ El nombre de la empresa es obligatorio.");
        return;
      }
      const updated = { ...miEmpresa, ...form };
      const newComps = companies.map((c) =>
        c.id === currentUser.empresaId ? updated : c
      );
      setCompanies(newComps);
      const compKey = _compKey(
        currentUser?.empresaId
          ? "empresa_" + currentUser.empresaId
          : currentUser?.user
      );
      _ls.setItem(compKey, JSON.stringify(newComps));
      _sbSet(
        _compKeyCloud(
          currentUser?.empresaId
            ? "empresa_" + currentUser.empresaId
            : currentUser?.user
        ),
        newComps
      );
      showAlert("✅ Perfil de empresa guardado correctamente.");
    };
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => goBack()}
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                🏥 Perfil de Mi Empresa
              </h1>
              <p className="text-sm text-gray-500">
                Logo · Datos institucionales · Cabeceras de documentos
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Logo de la Empresa
              </label>
              <div className="flex items-center gap-4">
                {_safeLogoUrl(form.logo || "") ? (
                  <img
                    src={_safeLogoUrl(form.logo)}
                    alt="Logo"
                    className="w-24 h-24 object-contain rounded-xl border border-gray-200 bg-gray-50 p-2"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center">
                    Sin logo
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Subir logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {form.logo && (
                    <button
                      onClick={() => setForm((p) => ({ ...p, logo: "" }))}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      Quitar logo
                    </button>
                  )}
                  <p className="text-xs text-gray-400">PNG/JPG · Máx 200 KB</p>
                </div>
              </div>
            </div>

            {/* Datos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Nombre de la Empresa / IPS *
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nombre: e.target.value }))
                  }
                  placeholder="Nombre completo de la IPS"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  NIT
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  value={form.nit}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nit: e.target.value }))
                  }
                  placeholder="900123456"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Dígito de Verificación
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  value={form.dv}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dv: e.target.value }))
                  }
                  placeholder="5"
                  maxLength={1}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Dirección
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  value={form.direccion}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, direccion: e.target.value }))
                  }
                  placeholder="Calle 45 # 12-34"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Ciudad
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  value={form.ciudad}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ciudad: e.target.value }))
                  }
                  placeholder="Bogotá"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Teléfono / Celular
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, telefono: e.target.value }))
                  }
                  placeholder="601 2345678"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  value={form.correo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, correo: e.target.value }))
                  }
                  placeholder="info@ips.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Actividad Económica / Razón Social
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  value={form.actividad}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, actividad: e.target.value }))
                  }
                  placeholder="IPS - Medicina del Trabajo · CIIU 8621"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Lema / Eslogan (opcional)
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  value={form.lema}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lema: e.target.value }))
                  }
                  placeholder="Salud · Prevención · Bienestar"
                />
              </div>
            </div>

            {/* Preview cabecera */}
            {(form.nombre || form.logo) && (
              <div className="border border-blue-100 rounded-xl p-4 bg-blue-50">
                <p className="text-xs font-bold text-blue-700 mb-3">
                  Vista previa — Cabecera de documentos
                </p>
                <div className="bg-white rounded-lg p-3 flex items-start gap-3 border border-gray-200">
                  {_safeLogoUrl(form.logo || "") && (
                    <img
                      src={_safeLogoUrl(form.logo)}
                      alt="Logo"
                      className="w-16 h-16 object-contain"
                    />
                  )}
                  <div className="text-xs space-y-0.5">
                    <p className="font-black text-gray-900 text-sm">
                      {form.nombre || "Nombre IPS"}
                    </p>
                    {form.nit && (
                      <p className="text-gray-600">
                        NIT: {form.nit}
                        {form.dv ? "-" + form.dv : ""}
                      </p>
                    )}
                    {form.direccion && (
                      <p className="text-gray-600">
                        {form.direccion}
                        {form.ciudad ? " · " + form.ciudad : ""}
                      </p>
                    )}
                    {form.telefono && (
                      <p className="text-gray-600">Tel: {form.telefono}</p>
                    )}
                    {form.correo && (
                      <p className="text-gray-600">{form.correo}</p>
                    )}
                    {form.lema && (
                      <p className="text-gray-500 italic">{form.lema}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-black hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> Guardar perfil de empresa
            </button>
          </div>
        </div>
      </div>
    );

};

export default PerfilIPS;
