import React from 'react';

// ─── AsistenciaAgenda Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const AsistenciaAgenda = (props) => {
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

    const fechaFin = asistenciaFecha;
    const fechaIni = new Date(
      new Date(asistenciaFecha).getTime() - 30 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];
    const citas = agendados.filter(
      (a) => a.fecha >= fechaIni && a.fecha <= fechaFin
    );
    const total = citas.length;
    const atendidas = citas.filter(
      (a) => a.estado === "atendido" || a.estado === "atendida"
    ).length;
    const espera = citas.filter((a) => a.estado === "espera").length;
    const cancel = citas.filter(
      (a) => a.estado === "cancelado" || a.estado === "cancelada"
    ).length;
    const noAsistio = total - atendidas - espera - cancel;
    const pct = total > 0 ? Math.round((atendidas / total) * 100) : 0;
    const exportCSV = () => {
      const rows = [
        [
          "Fecha",
          "Paciente",
          "Documento",
          "Empresa",
          "Tipo",
          "Estado",
          "Médico",
        ],
      ];
      citas.forEach((a) =>
        rows.push([
          a.fecha,
          a.nombre || "",
          a.doc || "",
          a.empresa || "",
          a.tipo || "",
          a.estado || "",
          a.medicoId || "",
        ])
      );
      const csv = rows
        .map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      const b = new Blob([csv], { type: "text/csv" });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = u;
      a.download = `asistencia_${fechaFin}.csv`;
      a.click();
      URL.revokeObjectURL(u);
    };
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderNavbar()}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                📊 Reporte de Asistencia
              </h2>
              <button
                onClick={() => goTo("agenda")}
                className="text-gray-500 font-bold text-sm flex items-center gap-1 hover:text-gray-700"
              >
                ← Volver
              </button>
            </div>
            <div className="flex gap-3 items-center mb-4">
              <div>
                <label className="text-xs font-black text-gray-600 block mb-1">
                  Hasta la fecha
                </label>
                <input
                  type="date"
                  value={asistenciaFecha}
                  onChange={(e) => setAsistenciaFecha(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="text-xs text-gray-500 pt-4">
                Mostrando últimos 30 días:{" "}
                {new Date(fechaIni + "T12:00").toLocaleDateString("es-CO")} -{" "}
                {new Date(fechaFin + "T12:00").toLocaleDateString("es-CO")}
              </div>
            </div>
            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {[
                {
                  label: "Total citas",
                  val: total,
                  color: "bg-blue-50 text-blue-800",
                },
                {
                  label: "Atendidas",
                  val: atendidas,
                  color: "bg-emerald-50 text-emerald-800",
                },
                {
                  label: "En espera",
                  val: espera,
                  color: "bg-amber-50 text-amber-800",
                },
                {
                  label: "No asistió",
                  val: noAsistio,
                  color: "bg-red-50 text-red-800",
                },
                {
                  label: "% Asistencia",
                  val: `${pct}%`,
                  color: `${
                    pct >= 70
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-800"
                  }`,
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`${s.color} rounded-xl p-3 text-center`}
                >
                  <div className="text-2xl font-black">{s.val}</div>
                  <div className="text-[10px] font-bold uppercase">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-lg"
              >
                📥 Exportar CSV
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-black rounded-lg"
              >
                🖨️ Imprimir
              </button>
            </div>
            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    {[
                      "Fecha",
                      "Paciente",
                      "Documento",
                      "Empresa",
                      "Tipo",
                      "Médico",
                      "Estado",
                    ].map((h) => (
                      <th key={h} className="p-2 text-left font-black">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {citas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-400"
                      >
                        Sin citas en el período seleccionado
                      </td>
                    </tr>
                  ) : (
                    citas.map((a, i) => (
                      <tr
                        key={a.id || i}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">{a.fecha}</td>
                        <td className="p-2 font-bold">{a.nombre || "-"}</td>
                        <td className="p-2">{a.docNumero || a.doc || "-"}</td>
                        <td className="p-2">{a.empresa || "-"}</td>
                        <td className="p-2">{a.tipo || "-"}</td>
                        <td className="p-2">{a.medicoId || "-"}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                              a.estado === "atendido" || a.estado === "atendida"
                                ? "bg-emerald-100 text-emerald-800"
                                : a.estado === "espera"
                                ? "bg-amber-100 text-amber-800"
                                : a.estado === "cancelado" ||
                                  a.estado === "cancelada"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {a.estado || "-"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );

};

export default AsistenciaAgenda;
