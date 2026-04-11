import React from 'react';
import {
  Eye, FileCheck, History, LogOut, PlusCircle, Search, Users
} from "lucide-react";

// ─── Patients Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const Patients = (props) => {
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

    const unique = new Map();
    patientsList.forEach((p) => {
      if (!p.docNumero) return;
      const ex = unique.get(p.docNumero);
      const hc = !!p.fechaExamen;
      if (!ex) unique.set(p.docNumero, { data: p, historyCount: hc ? 1 : 0 });
      else {
        if (hc) ex.historyCount++;
        if (
          p.fechaExamen &&
          (!ex.data.fechaExamen || p.fechaExamen > ex.data.fechaExamen)
        )
          ex.data = p;
      }
    });
    const allUnique = Array.from(unique.values()).map((x) => ({
      ...x.data,
      historyCount: x.historyCount,
    }));
    // ── IPS: usuarios con empresaId ven todos los pacientes de su empresa ──
    const _miEmpresaP = currentUser?.empresaId
      ? companies.find((c) => c.id === currentUser.empresaId)
      : null;
    const listFiltered = currentUser?.empresaId
      ? allUnique.filter(
          (p) =>
            p.empresaId === currentUser.empresaId ||
            (_miEmpresaP && p.empresaNit === _miEmpresaP.nit)
        )
      : _isAdmin(currentUser?.role)
      ? allUnique
      : allUnique.filter((p) => p._medicoId === currentUser?.user);
    const list = listFiltered.filter(
      (p) =>
        p.nombres?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        p.docNumero?.includes(patientSearchTerm)
    );
    return (
      <div className="min-h-screen bg-gray-50 font-sans p-8">
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-teal-900 flex items-center gap-2">
              <Users className="w-5 h-5" /> Gestión de Pacientes ({list.length})
            </h2>
            <button
              onClick={() => goBack()}
              className="text-gray-500 font-bold flex items-center gap-1 text-sm hover:text-gray-700"
            >
              <LogOut className="rotate-180 w-4 h-4" /> Volver
            </button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              className="pl-10 w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-400 outline-none"
              placeholder="Buscar por nombre o documento..."
              value={patientSearchTerm}
              onChange={(e) => setPatientSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto max-h-[600px] border border-gray-100 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 font-bold text-gray-500 uppercase sticky top-0 shadow-sm">
                <tr>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3">Documento</th>
                  <th className="p-3">Empresa / Cargo</th>
                  <th className="p-3 text-center">Historial</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p, i) => (
                  <tr
                    key={`${p.id}-${i}`}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="p-3 font-bold text-teal-900">
                      {p.nombres}
                      {/* ══ B-12: Badge periodicidad - Res. 1843/2025 Art. 4 ══ */}
                      {(() => {
                        const ps = _getPeriodicidadStatus(p);
                        if (ps.nivel === "vigente") return null;
                        const cls =
                          ps.color === "red"
                            ? "block mt-0.5 text-[9px] font-black bg-red-100 text-red-700 border border-red-300 px-1.5 py-0.5 rounded-full w-fit"
                            : "block mt-0.5 text-[9px] font-black bg-yellow-100 text-yellow-700 border border-yellow-300 px-1.5 py-0.5 rounded-full w-fit";
                        return (
                          <span className={cls}>
                            {ps.label} - Res.1843 Art.4
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-3 text-center">{p.docNumero}</td>
                    <td className="p-3 text-gray-500">
                      {p.empresaNombre}
                      <br />
                      <span className="text-[10px]">{p.cargo}</span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <button
                          onClick={() => handleOpenHistoryModal(p.docNumero)}
                          disabled={p.historyCount === 0}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            p.historyCount > 0
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-default"
                          }`}
                        >
                          {p.historyCount} HC Propias
                        </button>
                        <button
                          onClick={() =>
                            handleOpenHistoryModal(p.docNumero, true)
                          }
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200"
                          title="Consultar certificados de todos los médicos"
                        >
                          🔍 Todos médicos
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => {
                            const newHC = {
                              ...initialOccupPatientState,
                              id: Date.now().toString(),
                              nombres: p.nombres,
                              docNumero: p.docNumero,
                              edad: p.edad,
                              genero: p.genero,
                              estadoCivil: p.estadoCivil,
                              escolaridad: p.escolaridad,
                              telefono: p.telefono || "",
                              eps: p.eps || "",
                              arl: p.arl || "",
                              cargo: p.cargo,
                              empresaId: p.empresaId || "particular",
                              empresaNombre: p.empresaNombre || "PARTICULAR",
                              empresaNit: p.empresaNit || "",
                              actividadEconomica: p.actividadEconomica || "",
                              riesgos: p.riesgos
                                ? { ...p.riesgos }
                                : { ...initialOccupPatientState.riesgos },
                              antecedentesAgrupados: p.antecedentesAgrupados
                                ? JSON.parse(
                                    JSON.stringify(p.antecedentesAgrupados)
                                  )
                                : initialOccupPatientState.antecedentesAgrupados,
                            };
                            setData(newHC);
                            setDataType("ocupacional");
                            setActiveTab("form");
                            goTo("historia");
                          }}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-200 font-bold flex items-center gap-1 hover:bg-blue-100"
                        >
                          <PlusCircle className="w-3 h-3" /> HC Ocup.
                        </button>
                        <button
                          onClick={() => handleDeletePatient(p.id)}
                          className="p-1.5 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">
                      No se encontraron pacientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto animate-fade-in">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" /> Historial
                  Clínico
                </h3>
                <button onClick={() => setShowHistoryModal(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
              {historyRecords.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">
                    {historyRecords[0].nombres}
                  </p>
                  <p className="text-xs text-blue-600">
                    CC: {historyRecords[0].docNumero}
                  </p>
                </div>
              )}
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 font-bold text-gray-600">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Empresa</th>
                      <th className="p-3">Concepto</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRecords.map((rec, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-2">{rec.fechaExamen}</td>
                        <td className="p-2">{rec.tipoExamen || rec.type}</td>
                        <td className="p-2 max-w-[120px] truncate">
                          {rec.empresaNombre}
                        </td>
                        <td className="p-2 max-w-[150px] truncate text-[10px]">
                          {rec.conceptoAptitud || "--"}
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              rec.estadoHistoria === "Cerrada"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {rec.estadoHistoria || "Abierta"}
                          </span>
                        </td>
                        <td className="p-2 flex justify-center gap-1">
                          <button
                            onClick={() => {
                              setData(rec);
                              setDataType(rec.type || "ocupacional");
                              setActiveTab(
                                rec.type === "general" ? "formGeneral" : "form"
                              );
                              goTo("historia");
                              setShowHistoryModal(false);
                            }}
                            className="p-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setData(rec);
                              setDataType(rec.type || "ocupacional");
                              setActiveTab(
                                rec.type === "general"
                                  ? "formGeneral"
                                  : "certificado"
                              );
                              goTo("historia");
                              setShowHistoryModal(false);
                            }}
                            className="p-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-200 hover:bg-emerald-100"
                          >
                            <FileCheck className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );

};

export default Patients;
