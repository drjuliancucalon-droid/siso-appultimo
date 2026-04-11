import React from 'react';

// ─── Telemedicina Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const Telemedicina = (props) => {
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

    // ── SECRETARIA GATE: "Telemedicina" requiere autorización del admin ──
    if (
      currentUser?.role === "secretaria" &&
      !_secretariaPuede("telemedicina", currentUser, usersList)
    )
      return (
        <div className="min-h-screen bg-gray-50 font-sans">
          {renderNavbar()}
          <div className="max-w-xl mx-auto px-4 py-16 text-center">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 space-y-3">
              <div className="text-5xl">🔐</div>
              <p className="font-black text-amber-800 text-xl">
                Módulo restringido
              </p>
              <p className="text-amber-700 text-sm font-bold">Telemedicina</p>
              <p className="text-amber-600 text-xs leading-relaxed">
                Este módulo requiere autorización explícita del administrador.
                <br />
                Solicita que habilite el permiso <strong>
                  "Telemedicina"
                </strong>{" "}
                en tu perfil.
                <br />
                (Usuarios → tu nombre → 🔐 Permisos de secretaria)
              </p>
              <button
                onClick={() => goBack()}
                className="mt-3 bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition"
              >
                ← Volver al panel
              </button>
            </div>
          </div>
        </div>
      );
    const _genRoomName = (doc, fecha, hora) => {
      const ts = `${doc}-${fecha}-${hora}`.replace(/[^a-zA-Z0-9]/g, "");
      return `SISOOcupaSalud-${ts}`;
    };
    const _syncTele = (lista) => {
      setTeleconsultas(lista);
      _ls.setItem("siso_teleconsultas", JSON.stringify(lista));
      _sbSet(`siso_teleconsultas_${currentUser?.user || "shared"}`, lista);
    };

    const handleIniciarSala = () => {
      if (!teleForm.paciente.trim()) {
        showAlert("⚠️ Ingrese el nombre del paciente.");
        return;
      }
      if (!teleForm.documento.trim()) {
        showAlert("⚠️ Ingrese el número de documento del paciente.");
        return;
      }
      if (!teleForm.hora.trim()) {
        showAlert("⚠️ Ingrese la hora de la teleconsulta.");
        return;
      }
      if (!teleForm.consentimientoTele) {
        showAlert(
          "⚠️ El paciente debe aceptar el consentimiento de telemedicina."
        );
        return;
      }
      const roomName = _genRoomName(
        teleForm.documento,
        teleForm.fecha,
        teleForm.hora
      );
      const nuevaTele = {
        id: `tele_${Date.now()}`,
        roomName,
        paciente: teleForm.paciente,
        documento: teleForm.documento,
        fecha: teleForm.fecha,
        hora: teleForm.hora,
        motivo: teleForm.motivo,
        notas: teleForm.notas,
        consentimientoTele: true,
        consentimientoTs: new Date().toISOString(),
        medico: currentUser?.name || currentUser?.user,
        estado: "activa",
      };
      const lista = [nuevaTele, ...teleconsultas];
      _syncTele(lista);
      setTeleSalaActiva({
        roomName,
        paciente: teleForm.paciente,
        documento: teleForm.documento,
        fecha: teleForm.fecha,
        hora: teleForm.hora,
      });
    };

    const handleCerrarSala = () => {
      if (teleSalaActiva) {
        const lista = teleconsultas.map((t) =>
          t.roomName === teleSalaActiva.roomName
            ? { ...t, estado: "completada", finTs: new Date().toISOString() }
            : t
        );
        _syncTele(lista);
      }
      setTeleSalaActiva(null);
    };

    const jitsiUrl = teleSalaActiva
      ? `https://meet.jit.si/${
          teleSalaActiva.roomName
        }#userInfo.displayName="${encodeURIComponent(
          currentUser?.name || "Dr. Cucalón"
        )}"&config.startWithVideoMuted=false&config.prejoinPageEnabled=false`
      : null;

    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderNavbar()}
        <div className="p-4 max-w-5xl mx-auto space-y-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goBack()}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
                >
                  ← Volver
                </button>
                <div>
                  <h2 className="text-lg font-black">
                    🩺 Telemedicina Ocupacional
                  </h2>
                  <p className="text-blue-200 text-xs mt-0.5">
                    Res. 2654/2019 · Jitsi Meet · Sin costo por videollamada
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTeleTab("nueva")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                    teleTab === "nueva"
                      ? "bg-white text-blue-700"
                      : "bg-blue-800 text-blue-200 hover:bg-blue-600"
                  }`}
                >
                  ➕ Nueva consulta
                </button>
                <button
                  onClick={() => setTeleTab("historial")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                    teleTab === "historial"
                      ? "bg-white text-blue-700"
                      : "bg-blue-800 text-blue-200 hover:bg-blue-600"
                  }`}
                >
                  📋 Historial ({teleconsultas.length})
                </button>
              </div>
            </div>
          </div>

          {/* Sala activa - Jitsi iframe */}
          {teleSalaActiva && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-blue-500">
              <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                <div className="text-white text-xs font-bold">
                  🔴 CONSULTA EN CURSO - {teleSalaActiva.paciente} ·{" "}
                  {teleSalaActiva.fecha} {teleSalaActiva.hora}
                </div>
                <button
                  onClick={handleCerrarSala}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs font-black px-3 py-1 rounded-lg"
                >
                  ⏹ Finalizar consulta
                </button>
              </div>
              <div className="bg-gray-50 flex flex-col items-center justify-center gap-5 py-12">
                <div className="text-center">
                  <div className="text-5xl mb-3">🎥</div>
                  <p className="font-black text-gray-800 text-base">
                    Sala lista para iniciar
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    La videollamada se abre en una nueva pestaña del navegador
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                  <a
                    href={jitsiUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-6 rounded-xl text-sm text-center flex items-center justify-center gap-2 shadow-lg"
                  >
                    🎥 Abrir videollamada
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(jitsiUrl);
                      showAlert(
                        "🔗 Enlace copiado al portapapeles. Envíelo al paciente."
                      );
                    }}
                    className="w-full bg-white border border-blue-200 text-blue-700 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    📋 Copiar enlace para el paciente
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">
                    Enlace único: {jitsiUrl}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[10px] text-blue-700 max-w-sm">
                  <p className="font-black">ℹ️ Cómo funciona</p>
                  <p className="mt-0.5">
                    1. Presione "Abrir videollamada" - se abre en nueva pestaña
                  </p>
                  <p>
                    2. Comparta el enlace con el paciente por WhatsApp o Email
                  </p>
                  <p>
                    3. Ambos entran al mismo enlace y la sala es privada y
                    cifrada
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-blue-50 text-[10px] text-blue-700 font-bold">
                🔒 Sala privada: {teleSalaActiva.roomName} · La videollamada
                ocurre en servidores de Jitsi Meet (meet.jit.si) · Ningún dato
                clínico se transmite al proveedor de video
              </div>
            </div>
          )}

          {/* Formulario nueva consulta */}
          {teleTab === "nueva" && !teleSalaActiva && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h3 className="text-sm font-black text-gray-800">
                Datos de la teleconsulta
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">
                    Nombre del paciente *
                  </label>
                  <input
                    value={teleForm.paciente}
                    onChange={(e) =>
                      setTeleForm((p) => ({ ...p, paciente: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">
                    Documento de identidad *
                  </label>
                  <input
                    value={teleForm.documento}
                    onChange={(e) =>
                      setTeleForm((p) => ({ ...p, documento: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="CC / CE / PP"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={teleForm.fecha}
                    onChange={(e) =>
                      setTeleForm((p) => ({ ...p, fecha: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={teleForm.hora}
                    onChange={(e) =>
                      setTeleForm((p) => ({ ...p, hora: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">
                    Motivo de consulta
                  </label>
                  <input
                    value={teleForm.motivo}
                    onChange={(e) =>
                      setTeleForm((p) => ({ ...p, motivo: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="Ej: Evaluación periódica, seguimiento recomendación..."
                  />
                </div>
              </div>

              {/* Consentimiento telemedicina */}
              <div
                className={`p-4 rounded-xl border-2 ${
                  teleForm.consentimientoTele
                    ? "bg-emerald-50 border-emerald-400"
                    : "bg-amber-50 border-amber-300"
                }`}
              >
                <p className="text-xs font-black text-gray-800 mb-2">
                  Consentimiento Informado para Telemedicina (Res. 2654/2019)
                </p>
                <div className="text-[11px] text-gray-600 space-y-1 mb-3">
                  <p>
                    • La consulta se realizará por videollamada a través de
                    Jitsi Meet, una plataforma de comunicación cifrada.
                  </p>
                  <p>
                    • El médico puede tomar notas clínicas durante la sesión,
                    las cuales formarán parte de la Historia Clínica.
                  </p>
                  <p>
                    • Esta modalidad no reemplaza la evaluación física cuando la
                    condición clínica lo requiera.
                  </p>
                  <p>
                    • Tiene derecho a interrumpir la consulta en cualquier
                    momento sin afectar su atención posterior.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teleForm.consentimientoTele}
                    onChange={(e) =>
                      setTeleForm((p) => ({
                        ...p,
                        consentimientoTele: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-xs font-bold text-gray-700">
                    El paciente <strong>{teleForm.paciente || "---"}</strong> ha
                    leído y aceptado este consentimiento de telemedicina
                  </span>
                </label>
              </div>

              <button
                onClick={handleIniciarSala}
                disabled={
                  !teleForm.paciente ||
                  !teleForm.documento ||
                  !teleForm.hora ||
                  !teleForm.consentimientoTele
                }
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl flex items-center justify-center gap-2"
              >
                🎥 Iniciar videoconsulta
              </button>
            </div>
          )}

          {/* Historial de teleconsultas */}
          {teleTab === "historial" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-indigo-50">
                <p className="text-sm font-black text-indigo-800">
                  Historial de Teleconsultas
                </p>
              </div>
              {teleconsultas.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-3xl mb-2">📹</p>
                  <p className="text-sm font-bold">
                    Sin teleconsultas registradas
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {teleconsultas.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {t.paciente}{" "}
                          <span className="font-normal text-gray-400">
                            · {t.documento}
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          📅 {t.fecha} {t.hora} ·{" "}
                          {t.motivo || "Sin motivo registrado"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          👤 {t.medico}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-full ${
                          t.estado === "activa"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {t.estado === "activa"
                          ? "🟢 En curso"
                          : "✅ Completada"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Nota normativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-[10px] font-black text-blue-800 mb-1">
              📋 Marco normativo: Res. 2654 de 2019
            </p>
            <p className="text-[10px] text-blue-700">
              La telemedicina en Colombia está regulada por la Resolución 2654
              de 2019. Para prestar este servicio como IPS habilitada se
              requiere: (1) inscribir la modalidad en el REPS, (2) tener
              consentimiento informado firmado por el paciente, (3) garantizar
              la confidencialidad de la comunicación, y (4) registrar la
              atención en la HC. Jitsi Meet utiliza cifrado end-to-end
              (SRTP/DTLS). Ningún dato clínico se almacena en sus servidores.
            </p>
          </div>
        </div>
      </div>
    );

};

export default Telemedicina;
