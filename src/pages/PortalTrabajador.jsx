import React from 'react';

// ─── PortalTrabajador Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const PortalTrabajador = (props) => {
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

    const handleBuscar = () => {
      const q = portalCodigo.trim();
      if (!q) {
        showAlert("Ingrese su código de verificación o número de cédula.");
        return;
      }
      // 1️⃣ Buscar por código de verificación (cualquier formato: SISO-... o CV-...)
      const qUp = q.toUpperCase();
      let pac = patientsList.find(
        (p) => p.codigoVerificacion && p.codigoVerificacion.toUpperCase() === qUp
      );
      if (pac) {
        setPortalMultiple([]);
        setPortalPaciente(pac);
        return;
      }
      // 2️⃣ Buscar por número de documento (cédula) — solo HCs cerradas
      const qDoc = q.replace(/\s/g, "");
      const byDoc = patientsList.filter(
        (p) =>
          p.docNumero &&
          p.docNumero.replace(/\s/g, "") === qDoc &&
          p.estadoHistoria === "Cerrada" &&
          !p._archivado
      );
      if (byDoc.length === 1) {
        setPortalMultiple([]);
        setPortalPaciente(byDoc[0]);
        return;
      }
      if (byDoc.length > 1) {
        // Múltiples HCs para ese documento — mostrar selector
        setPortalPaciente(null);
        setPortalMultiple(byDoc);
        return;
      }
      // 3️⃣ No encontrado
      showAlert("❌ Código o cédula no encontrado.\nVerifique el dato e intente de nuevo.");
      setPortalPaciente(null);
      setPortalMultiple([]);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 font-sans">
        {renderNavbar()}
        <div className="p-6 max-w-3xl mx-auto space-y-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-700 to-blue-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => goBack()}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0"
              >
                ← Volver
              </button>
              <div>
                <h2 className="text-lg font-black flex items-center gap-2">
                  🧑‍💼 Portal del Trabajador
                </h2>
                <p className="text-teal-200 text-xs mt-0.5">
                  Res. 2346/2007 Art. 14 · Acceso a su Historia Clínica
                  Ocupacional
                </p>
              </div>
            </div>
          </div>

          {/* Buscador por código */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            {/* Link de acceso externo */}
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl">
              <p className="text-[10px] font-black text-teal-700 uppercase mb-1">
                🔗 Link de acceso para el trabajador
              </p>
              <p className="text-[10px] text-teal-600 font-mono break-all select-all mb-2">
                https://fw5fnt.csb.app/#portaltrabajador
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText("https://fw5fnt.csb.app/#portaltrabajador")
                      .then(() =>
                        showAlert(
                          "✅ Enlace copiado.\nComparta: https://fw5fnt.csb.app/#portaltrabajador\n\nEl trabajador ingresa con su código o cédula."
                        )
                      )
                      .catch(() =>
                        showAlert(
                          "URL: https://fw5fnt.csb.app/#portaltrabajador"
                        )
                      );
                  }}
                  className="text-[10px] bg-teal-600 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-700"
                >
                  📋 Copiar enlace
                </button>
                <a
                  href="https://fw5fnt.csb.app/#portaltrabajador"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] bg-white border border-teal-300 text-teal-700 px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-50"
                >
                  🔗 Abrir enlace
                </a>
                <button
                  onClick={() => setShowPortalPublico(true)}
                  className="text-[10px] bg-teal-50 border border-teal-200 text-teal-700 px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-teal-100"
                >
                  🧑‍💼 Vista previa
                </button>
              </div>
              <p className="text-[9px] text-teal-500 mt-1.5 leading-relaxed">
                El trabajador abre ese link en su teléfono o computador, ingresa
                su código o cédula, y ve su resultado sin necesidad de cuenta.
              </p>
            </div>
            <p className="text-sm font-black text-gray-800 mb-3">
              Consulta con código de verificación o número de cédula
            </p>
            <div className="flex gap-3">
              <input
                value={portalCodigo}
                onChange={(e) => setPortalCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                className="flex-1 p-2.5 border-2 border-teal-200 rounded-xl text-sm font-mono font-black tracking-widest uppercase"
                placeholder="Código (SISO-... / CV-...) o número de cédula"
                maxLength={50}
              />
              <button
                onClick={handleBuscar}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-xl"
              >
                🔍 Consultar
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Ingrese el código de verificación entregado por el médico, <strong>o su número de cédula</strong> para ver todas sus evaluaciones.
            </p>
          </div>

          {/* Selector múltiples HC por cédula */}
          {portalMultiple.length > 1 && !portalPaciente && (
            <div className="bg-white rounded-2xl shadow-sm border border-teal-200 overflow-hidden">
              <div className="bg-teal-50 px-5 py-3 border-b border-teal-100">
                <p className="text-sm font-black text-teal-800">
                  📋 Se encontraron {portalMultiple.length} evaluaciones para esa cédula
                </p>
                <p className="text-[10px] text-teal-600 mt-0.5">Seleccione la que desea consultar:</p>
              </div>
              <div className="divide-y divide-gray-100">
                {portalMultiple.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPortalPaciente(p); setPortalMultiple([]); }}
                    className="w-full text-left px-5 py-3 hover:bg-teal-50 transition flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-black text-gray-800">{p.tipoExamen || "Evaluación"} — {p.fechaExamen || "--"}</p>
                      <p className="text-[10px] text-gray-500">{p.empresaNombre || "--"} · {p.cargo || "--"}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                      (p.conceptoAptitud || "").toLowerCase().includes("no apto")
                        ? "bg-red-100 text-red-700"
                        : (p.conceptoAptitud || "").toLowerCase().includes("condicion")
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {p.conceptoAptitud || "Pendiente"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resultado */}
          {portalPaciente && (
            <div className="bg-white rounded-2xl shadow-sm border border-teal-200 overflow-hidden">
              <div className="bg-teal-50 px-5 py-3 border-b border-teal-100 flex items-center justify-between">
                <p className="text-sm font-black text-teal-800">
                  📋 Resumen de su evaluación médica
                </p>
                <span
                  className={`text-[10px] font-black px-2 py-1 rounded-full ${
                    (portalPaciente.conceptoAptitud || "")
                      .toLowerCase()
                      .includes("no apto")
                      ? "bg-red-100 text-red-700"
                      : (portalPaciente.conceptoAptitud || "")
                          .toLowerCase()
                          .includes("condicion")
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {portalPaciente.conceptoAptitud || "Pendiente"}
                </span>
              </div>
              <div className="p-5 grid md:grid-cols-2 gap-4">
                {[
                  ["Nombre", portalPaciente.nombres],
                  [
                    "Documento",
                    `${portalPaciente.docTipo || "CC"} ${
                      portalPaciente.docNumero
                    }`,
                  ],
                  ["Empresa", portalPaciente.empresaNombre || "--"],
                  ["Cargo", portalPaciente.cargo || "--"],
                  ["Tipo de examen", portalPaciente.tipoExamen || "--"],
                  ["Fecha de evaluación", portalPaciente.fechaExamen || "--"],
                  [
                    "Concepto de aptitud",
                    portalPaciente.conceptoAptitud || "Pendiente",
                  ],
                  ["Médico evaluador", portalPaciente.medicoNombre || "--"],
                  [
                    "Código verificación",
                    portalPaciente.codigoVerificacion || "--",
                  ],
                  ["Estado HC", portalPaciente.estadoHistoria || "--"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] font-black text-gray-400 uppercase">
                      {k}
                    </p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {v}
                    </p>
                  </div>
                ))}
              </div>
              {portalPaciente.restricciones && (
                <div className="px-5 pb-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                    Restricciones / Recomendaciones
                  </p>
                  <p className="text-xs text-gray-700 bg-amber-50 rounded-lg p-2 border border-amber-100">
                    {portalPaciente.restricciones}
                  </p>
                </div>
              )}
              {/* ── BOTÓN DESCARGAR CERTIFICADO PDF ─────────────────── */}
              <div className="px-5 pb-3">
                <button
                  onClick={() => {
                    const docData = portalPaciente._doctorData || {
                      nombre:
                        portalPaciente.medicoNombre || "MÉDICO OCUPACIONAL",
                      titulo: "Médico Especialista en Salud Ocupacional",
                      licencia: "--",
                      ciudad: "Popayán",
                      email: "",
                    };
                    const firma = portalPaciente._firma || "";
                    const _miIPSPortal = currentUser?.empresaId
                      ? companies.find((c) => c.id === currentUser.empresaId) ||
                        null
                      : null;
                    const html = _generarCertificadoHTMLNormalizado(
                      portalPaciente,
                      docData,
                      firma,
                      _miIPSPortal
                    );
                    const w = window.open(
                      "",
                      "_blank",
                      "width=920,height=1100"
                    );
                    if (!w) {
                      showAlert(
                        "El navegador bloqueó la ventana emergente. Permita los popups para descargar el certificado."
                      );
                      return;
                    }
                    w.document.write(
                      html.replace(
                        "</body>",
                        `<div id="np-dl" style="position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                        <button onclick="window.print()" style="background:#065f46;color:#fff;border:none;padding:10px 22px;border-radius:10px;font-weight:900;font-size:11pt;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.22);">📥 Guardar / Imprimir PDF</button>
                        <p style="font-size:8pt;color:#6b7280;text-align:right;">En el diálogo, selecciona <b>"Guardar como PDF"</b></p>
                      </div><style>@media print{#np-dl{display:none!important;}}</style></body>`
                      )
                    );
                    w.document.close();
                    w.focus();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2.5 shadow transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17a3 3 0 003 3h12a3 3 0 003-3v-1M3 17V7a3 3 0 013-3h8l5 5v8"
                    />
                  </svg>
                  📄 Descargar Certificado de Aptitud PDF
                </button>
              </div>
              <div className="px-5 pb-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[10px] text-blue-700">
                  <p className="font-black">🔒 Información confidencial</p>
                  <p className="mt-0.5">
                    Este acceso solo muestra información del resumen de su
                    evaluación. Su historia clínica completa es custodiada por
                    el médico ocupacional según la Res. 1995/1999 (20 años). Ley
                    1581/2012 garantiza sus derechos como titular de la
                    información.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!portalPaciente && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-5xl mb-3">🧑‍💼</p>
              <p className="font-bold text-gray-600">
                Ingrese su código de verificación para consultar su evaluación
              </p>
              <p className="text-xs mt-1">
                El código fue entregado por el médico al finalizar su evaluación
                médica ocupacional
              </p>
            </div>
          )}
        </div>
      </div>
    );

};

export default PortalTrabajador;
