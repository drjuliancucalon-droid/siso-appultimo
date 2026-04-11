import React from 'react';
import {
  ChevronLeft, Download
} from "lucide-react";

// ─── Contabilidad Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const Contabilidad = (props) => {
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

    try {
      if (!_isAdminOrEmpresa(currentUser?.role)) {
        return (
          <div className="p-8 text-center text-gray-500">
            Acceso restringido a administradores.
          </div>
        );
      }
      const hoy = new Date().toISOString().split("T")[0];
      const ahora = new Date();
      const _rangoMes = { desde: hoy.slice(0, 7) + "-01", hasta: hoy };
      const _rangoAnio = { desde: hoy.slice(0, 4) + "-01-01", hasta: hoy };
      const { desde: _cDesde, hasta: _cHasta } =
        contabPeriodo === "mes" ? _rangoMes : _rangoAnio;
      const _scopedCajaC = currentUser?.empresaId
        ? cajaMovimientos.filter(
            (m) =>
              m.empresaId === currentUser.empresaId ||
              m.medicoId === currentUser?.user
          )
        : cajaMovimientos;
      const movsPeriodo = _scopedCajaC.filter(
        (m) => m.fecha >= _cDesde && m.fecha <= _cHasta
      );
      const ingresosTotal = movsPeriodo
        .filter((m) => m.tipo === "ingreso")
        .reduce((s, m) => s + Number(m.monto || 0), 0);
      const egresosTotal = movsPeriodo
        .filter((m) => m.tipo === "egreso")
        .reduce((s, m) => s + Number(m.monto || 0), 0);
      const utilidad = ingresosTotal - egresosTotal;
      const autoPendiente = movsPeriodo
        .filter((m) => m._autoGenerated && m.estado === "pendiente")
        .reduce((s, m) => s + Number(m.monto || 0), 0);
      const autoCobrado = movsPeriodo
        .filter((m) => m._autoGenerated && m.estado === "cobrado")
        .reduce((s, m) => s + Number(m.monto || 0), 0);
      const totalPacientes = movsPeriodo.filter((m) => m._autoGenerated).length;
      // KPIs
      const diasPeriodo = Math.max(
        1,
        Math.ceil(
          (new Date(_cHasta) - new Date(_cDesde)) / (1000 * 60 * 60 * 24)
        )
      );
      const dso =
        autoCobrado > 0
          ? Math.round((autoPendiente / autoCobrado) * diasPeriodo)
          : 0; // Days Sales Outstanding
      const tasaGlosa =
        ingresosTotal > 0
          ? Math.round((autoPendiente / ingresosTotal) * 100)
          : 0;
      const ingXPaciente =
        totalPacientes > 0 ? Math.round(ingresosTotal / totalPacientes) : 0;
      // Estimados fiscales (orientativos)
      const esIPS = currentUser?.role === "admin_empresa";
      const retencionPct = esIPS ? 4 : 10.5;
      const retencionEstimada = Math.round(
        (ingresosTotal * retencionPct) / 100
      );
      // Cartera por empresa cliente
      const cartEmp = {};
      movsPeriodo
        .filter((m) => m._autoGenerated)
        .forEach((m) => {
          const k = m.empresaClienteNombre || "Particular";
          if (!cartEmp[k])
            cartEmp[k] = { total: 0, pendiente: 0, cobrado: 0, pacientes: 0 };
          cartEmp[k].total += Number(m.monto || 0);
          cartEmp[k].pacientes++;
          if (m.estado === "pendiente")
            cartEmp[k].pendiente += Number(m.monto || 0);
          else if (m.estado === "cobrado")
            cartEmp[k].cobrado += Number(m.monto || 0);
        });
      const cartEmpArr = Object.entries(cartEmp).sort(
        (a, b) => b[1].total - a[1].total
      );
      // Por médico
      const ingXMedico = {};
      movsPeriodo
        .filter((m) => m.tipo === "ingreso")
        .forEach((m) => {
          const k = m.medicoNombre || m.medicoId || "Sin médico";
          ingXMedico[k] = (ingXMedico[k] || 0) + Number(m.monto || 0);
        });
      // CSV exports
      const exportCSV = (rows, fname) => {
        const csv = rows
          .map((r) =>
            r.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(",")
          )
          .join("\n");
        const b = new Blob([csv], { type: "text/csv" });
        const u = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = u;
        a.download = fname;
        a.click();
        URL.revokeObjectURL(u);
      };
      return (
        <div className="min-h-screen bg-gray-50">
          {renderNavbar()}
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goBack()}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">
                    📊 Contabilidad
                  </h1>
                  <p className="text-sm text-gray-500">
                    Gestión financiera · Marco colombiano
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {["mes", "anio"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setContabPeriodo(p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black ${
                      contabPeriodo === p
                        ? "bg-blue-700 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p === "mes" ? "Este mes" : "Este año"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
              {[
                { k: "resumen", l: "📈 P&L" },
                { k: "cartera", l: "💼 Cartera" },
                { k: "por_empresa", l: "🏭 Por Empresa" },
                { k: "kpis", l: "📊 KPIs" },
                { k: "fiscal", l: "🧾 Fiscal" },
                { k: "exportar", l: "📤 Exportar" },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setContabTab(t.k)}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                    contabTab === t.k
                      ? "bg-blue-700 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.l}
                </button>
              ))}
            </div>

            {/* ── P&L ── */}
            {contabTab === "resumen" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-xs font-black text-emerald-700 uppercase">
                      ↑ Ingresos
                    </p>
                    <p className="text-xl font-black text-emerald-900 mt-1">
                      $ {Number(ingresosTotal || 0).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-xs font-black text-red-700 uppercase">
                      ↓ Egresos
                    </p>
                    <p className="text-xl font-black text-red-900 mt-1">
                      $ {Number(egresosTotal || 0).toLocaleString("es-CO")}
                    </p>
                  </div>
                  {utilidad >= 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-xs font-black text-blue-700 uppercase">
                        = Utilidad Bruta
                      </p>
                      <p className="text-xl font-black text-blue-900 mt-1">
                        $ {Number(utilidad || 0).toLocaleString("es-CO")}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <p className="text-xs font-black text-orange-700 uppercase">
                        = Utilidad Bruta
                      </p>
                      <p className="text-xl font-black text-orange-900 mt-1">
                        $ {Number(utilidad || 0).toLocaleString("es-CO")}
                      </p>
                    </div>
                  )}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-xs font-black text-yellow-700 uppercase">
                      ⏳ Por cobrar
                    </p>
                    <p className="text-xl font-black text-yellow-900 mt-1">
                      $ {Number(autoPendiente || 0).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-black text-gray-800 mb-4">
                    Desglose de Ingresos por Concepto
                  </h3>
                  {Object.entries(
                    movsPeriodo
                      .filter((m) => m.tipo === "ingreso")
                      .reduce((acc, m) => {
                        const k = m._autoGenerated
                          ? m.tipoConsulta || "Consulta"
                          : "Manual";
                        acc[k] = (acc[k] || 0) + Number(m.monto || 0);
                        return acc;
                      }, {})
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-sm text-gray-700 capitalize">
                          {k}
                        </span>
                        <span className="font-black text-gray-800">
                          $ {v.toLocaleString("es-CO")}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── CARTERA ── */}
            {contabTab === "cartera" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-black text-gray-800">
                    💼 Cartera — Ciclo de Cobro
                  </h3>
                  <div className="flex gap-4 text-xs">
                    <span className="text-yellow-700 font-black">
                      Pendiente: $ {autoPendiente.toLocaleString("es-CO")}
                    </span>
                    <span className="text-green-700 font-black">
                      Cobrado: $ {autoCobrado.toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {[
                          "Fecha",
                          "Paciente",
                          "Empresa",
                          "Tipo",
                          "Tarifa",
                          "Estado",
                          "Código",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left font-black text-gray-600 uppercase tracking-wide text-[10px]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {movsPeriodo
                        .filter((m) => m._autoGenerated)
                        .sort((a, b) => a.fecha?.localeCompare(b.fecha))
                        .map((m) => {
                          const sc =
                            m.estado === "cobrado"
                              ? "bg-green-100 text-green-700"
                              : m.estado === "pagado"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700";
                          return (
                            <tr key={m.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-500">
                                {m.fecha}
                              </td>
                              <td className="px-3 py-2 font-bold text-gray-800">
                                {m.pacienteNombre || "—"}
                              </td>
                              <td className="px-3 py-2 text-gray-600">
                                {m.empresaClienteNombre || "Particular"}
                              </td>
                              <td className="px-3 py-2 text-gray-500 capitalize">
                                {m.tipoConsulta || "—"}
                              </td>
                              <td className="px-3 py-2 font-bold">
                                $ {Number(m.monto || 0).toLocaleString("es-CO")}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${sc}`}
                                >
                                  {m.estado === "cobrado"
                                    ? "Cobrado"
                                    : m.estado === "pagado"
                                    ? "Pagado"
                                    : "Pendiente"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-gray-400 font-mono">
                                {m.codigoVerificacion || "—"}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {movsPeriodo.filter((m) => m._autoGenerated).length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      No hay movimientos automáticos en este periodo.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── POR EMPRESA ── */}
            {contabTab === "por_empresa" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-xs font-black text-blue-700">
                      Empresas clientes
                    </p>
                    <p className="text-2xl font-black text-blue-900">
                      {cartEmpArr.length}
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <p className="text-xs font-black text-emerald-700">
                      Total facturado
                    </p>
                    <p className="text-xl font-black text-emerald-900">
                      ${" "}
                      {Object.values(cartEmp)
                        .reduce((s, e) => s + e.total, 0)
                        .toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                    <p className="text-xs font-black text-yellow-700">
                      Por cobrar
                    </p>
                    <p className="text-xl font-black text-yellow-900">
                      $ {autoPendiente.toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
                {cartEmpArr.map(([nombre, e]) => (
                  <div
                    key={nombre}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-black text-gray-800">{nombre}</h4>
                      <span className="text-xs text-gray-500">
                        {e.pacientes} pacientes
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-gray-500">Total</p>
                        <p className="font-black text-gray-800">
                          $ {e.total.toLocaleString("es-CO")}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-green-600">Cobrado</p>
                        <p className="font-black text-green-800">
                          $ {e.cobrado.toLocaleString("es-CO")}
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-2 text-center">
                        <p className="text-yellow-600">Pendiente</p>
                        <p className="font-black text-yellow-800">
                          $ {e.pendiente.toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {cartEmpArr.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No hay datos por empresa en este periodo.
                  </div>
                )}
              </div>
            )}

            {/* ── KPIs ── */}
            {contabTab === "kpis" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <p className="text-xs font-black text-blue-700 uppercase mb-1">
                    DSO (Días promedio cobro)
                  </p>
                  <p className="text-2xl font-black text-blue-900">
                    {dso} días
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Days Sales Outstanding. Menor = mejor. Objetivo &lt; 30d.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                  <p className="text-xs font-black text-yellow-700 uppercase mb-1">
                    Tasa por cobrar / total
                  </p>
                  <p className="text-2xl font-black text-yellow-900">
                    {tasaGlosa}%
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    % del valor total aún pendiente de cobro.
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <p className="text-xs font-black text-emerald-700 uppercase mb-1">
                    Ingreso promedio por paciente
                  </p>
                  <p className="text-2xl font-black text-emerald-900">
                    $ {Number(ingXPaciente || 0).toLocaleString("es-CO")}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Ticket promedio por atención.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                  <p className="text-xs font-black text-purple-700 uppercase mb-1">
                    Pacientes atendidos
                  </p>
                  <p className="text-2xl font-black text-purple-900">
                    {totalPacientes}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Total pacientes con historia cerrada en el periodo.
                  </p>
                </div>
                {utilidad >= 0 ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <p className="text-xs font-black text-emerald-700 uppercase mb-1">
                      Utilidad bruta del periodo
                    </p>
                    <p className="text-2xl font-black text-emerald-900">
                      $ {Number(utilidad || 0).toLocaleString("es-CO")}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Ingresos menos egresos registrados.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <p className="text-xs font-black text-red-700 uppercase mb-1">
                      Utilidad bruta del periodo
                    </p>
                    <p className="text-2xl font-black text-red-900">
                      $ {Number(utilidad || 0).toLocaleString("es-CO")}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Ingresos menos egresos registrados.
                    </p>
                  </div>
                )}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                  <p className="text-xs font-black text-indigo-700 uppercase mb-1">
                    Empresas clientes activas
                  </p>
                  <p className="text-2xl font-black text-indigo-900">
                    {cartEmpArr.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Empresas con al menos 1 atención en el periodo.
                  </p>
                </div>
                <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-4">
                  <h4 className="font-black text-gray-800 mb-3">
                    👨‍⚕️ Ingresos por Médico
                  </h4>
                  {Object.entries(ingXMedico)
                    .sort((a, b) => b[1] - a[1])
                    .map(([med, val]) => (
                      <div
                        key={med}
                        className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-sm text-gray-700">{med}</span>
                        <span className="font-black text-gray-800">
                          $ {val.toLocaleString("es-CO")}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── FISCAL ── */}
            {contabTab === "fiscal" && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-black text-amber-800 mb-1">
                    ⚠️ Nota legal
                  </p>
                  <p className="text-xs text-amber-700">
                    Estos cálculos son{" "}
                    <strong>orientativos e informativos</strong>. No reemplazan
                    la asesoría de un contador. Consulte siempre a su
                    profesional tributario. El uso de estos datos es
                    responsabilidad del usuario.
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                  <h3 className="font-black text-gray-800">
                    Estimados Fiscales —{" "}
                    {contabPeriodo === "mes" ? "Este Mes" : "Este Año"}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-black text-gray-600 uppercase mb-1">
                        Tipo de contribuyente
                      </p>
                      <p className="text-sm font-black text-gray-900">
                        {esIPS
                          ? "IPS (Persona Jurídica)"
                          : "Independiente (Persona Natural)"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {esIPS
                          ? "NIIF Grupo 2 · PYMES"
                          : "NIIF Grupo 3 · Simplificado"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-black text-gray-600 uppercase mb-1">
                        Base gravable estimada
                      </p>
                      <p className="text-xl font-black text-gray-900">
                        $ {ingresosTotal.toLocaleString("es-CO")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        IVA: Excluido (Art. 476 E.T.) — Servicios médicos
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs font-black text-blue-700 uppercase mb-1">
                        Retención en la Fuente
                      </p>
                      <p className="text-xl font-black text-blue-900">
                        $ {retencionEstimada.toLocaleString("es-CO")}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {retencionPct}% — retiene{" "}
                        {esIPS
                          ? "empresa pagadora (servicios IPS)"
                          : "empresa pagadora (honorarios médico)"}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="text-xs font-black text-emerald-700 uppercase mb-1">
                        Ingreso neto estimado
                      </p>
                      <p className="text-xl font-black text-emerald-900">
                        ${" "}
                        {(ingresosTotal - retencionEstimada).toLocaleString(
                          "es-CO"
                        )}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Antes de gastos operacionales
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-1.5">
                    <p className="font-black text-gray-800 mb-2">
                      Marco normativo aplicado:
                    </p>
                    <p>
                      • <strong>IVA:</strong> Servicios médicos excluidos (Art.
                      476 E.T.) · Capacitaciones SST: 19% IVA
                    </p>
                    <p>
                      • <strong>Retención fuente:</strong>{" "}
                      {esIPS
                        ? "4% servicios IPS (Art. 392 E.T.)"
                        : "10-11% honorarios profesionales (Art. 392 E.T.)"}
                    </p>
                    {esIPS && (
                      <p>
                        • <strong>FEV + RIPS:</strong> Obligatorio para IPS
                        (Res. 2275/2023) — facturación electrónica con RIPS JSON
                      </p>
                    )}
                    <p>
                      • <strong>ICA:</strong> Según tarifa del municipio
                      (consulte su contador)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── EXPORTAR ── */}
            {contabTab === "exportar" && (
              <div className="space-y-3">
                {[
                  {
                    title: "Movimientos de Caja",
                    desc: `${movsPeriodo.length} movimientos del periodo`,
                    action: () =>
                      exportCSV(
                        [
                          [
                            "Fecha",
                            "Tipo",
                            "Concepto",
                            "Monto",
                            "Forma Pago",
                            "Estado",
                            "Médico",
                            "Empresa",
                          ],
                          ...movsPeriodo.map((m) => [
                            m.fecha,
                            m.tipo,
                            m.concepto,
                            m.monto,
                            m.formaPago || "",
                            m.estado || "",
                            m.medicoNombre || "",
                            m.empresaClienteNombre || "",
                          ]),
                        ],
                        `caja_${_cDesde}_${_cHasta}.csv`
                      ),
                  },
                  {
                    title: "Pacientes Vistos",
                    desc: `${totalPacientes} atenciones del periodo`,
                    action: () =>
                      exportCSV(
                        [
                          [
                            "Fecha",
                            "Paciente",
                            "Doc",
                            "Empresa",
                            "Tipo",
                            "Tarifa",
                            "Estado",
                            "Código QR",
                          ],
                          ...movsPeriodo
                            .filter((m) => m._autoGenerated)
                            .map((m) => [
                              m.fecha,
                              m.pacienteNombre,
                              m.pacienteDoc,
                              m.empresaClienteNombre,
                              m.tipoConsulta,
                              m.monto,
                              m.estado,
                              m.codigoVerificacion || "",
                            ]),
                        ],
                        `pacientes_vistos_${_cDesde}_${_cHasta}.csv`
                      ),
                  },
                  {
                    title: "Resumen por Empresa Cliente",
                    desc: `${cartEmpArr.length} empresas`,
                    action: () =>
                      exportCSV(
                        [
                          [
                            "Empresa",
                            "Pacientes",
                            "Total",
                            "Cobrado",
                            "Pendiente",
                          ],
                          ...cartEmpArr.map(([n, e]) => [
                            n,
                            e.pacientes,
                            e.total,
                            e.cobrado,
                            e.pendiente,
                          ]),
                        ],
                        `cartera_empresas_${_cDesde}_${_cHasta}.csv`
                      ),
                  },
                  {
                    title: "Resumen Mensual P&L",
                    desc: "Ingresos, egresos y utilidad del periodo",
                    action: () =>
                      exportCSV(
                        [
                          [
                            "Periodo",
                            "Ingresos",
                            "Egresos",
                            "Utilidad",
                            "Por cobrar",
                            "Pacientes",
                          ],
                          [
                            `${_cDesde} a ${_cHasta}`,
                            ingresosTotal,
                            egresosTotal,
                            utilidad,
                            autoPendiente,
                            totalPacientes,
                          ],
                        ],
                        `resumen_pl_${_cDesde}_${_cHasta}.csv`
                      ),
                  },
                ].map((e) => (
                  <button
                    key={e.title}
                    onClick={e.action}
                    className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
                  >
                    <div>
                      <p className="font-black text-gray-800">{e.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{e.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                      <Download className="w-4 h-4" /> CSV
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    } catch (_contabErr) {
      return (
        <div
          style={{
            padding: 24,
            color: "#c00",
            background: "#fff",
            fontSize: 14,
          }}
        >
          <b>Error en Contabilidad:</b> {String(_contabErr)}
          <br />
          <pre style={{ marginTop: 8, fontSize: 11, overflow: "auto" }}>
            {_contabErr?.stack}
          </pre>
        </div>
      );
    }

};

export default Contabilidad;
