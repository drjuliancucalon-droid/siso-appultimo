import React from 'react';

// ─── Cotizaciones Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const Cotizaciones = (props) => {
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

    const cotizSel = cotizaciones.find((c) => c.id === cotizacionSelId);
    const handleNewItem = () => {
      setCotizacionForm((p) => ({
        ...p,
        items: [...p.items, { servId: "", desc: "", cant: 1, precio: 0 }],
      }));
    };
    const handleRemoveItem = (idx) => {
      setCotizacionForm((p) => ({
        ...p,
        items: p.items.filter((_, i) => i !== idx),
      }));
    };
    const subtotal = cotizacionForm.items.reduce(
      (s, it) => s + Number(it.precio || 0) * Number(it.cant || 1),
      0
    );
    const saveCotiz = (estado) => {
      if (!cotizacionForm.clienteNombre.trim()) {
        showAlert("Ingrese el nombre del cliente.");
        return;
      }
      if (cotizacionForm.items.length === 0) {
        showAlert("Agregue al menos un ítem.");
        return;
      }
      const cot = {
        ...cotizacionForm,
        id: "cot_" + Date.now(),
        numero: nextCotizNum(),
        estado: estado || "Pendiente",
        subtotal,
        total: subtotal,
        medico: activeDoctorData?.nombre || currentUser?.nombre || "Dr.",
        fechaCreacion: new Date().toISOString(),
      };
      saveCotizaciones([...cotizaciones, cot]);
      setCotizacionView("list");
      setCotizacionForm({
        clienteNombre: "",
        clienteEmpresa: "",
        clienteEmail: "",
        clienteTel: "",
        items: [],
        notas: "",
        validezDias: 30,
        fecha: new Date().toISOString().split("T")[0],
        estado: "Pendiente",
      });
      showAlert("✅ Cotización guardada exitosamente");
    };
    const openPrintCotiz = (cot) => {
      const doc = activeDoctorData;
      const _miIPSCotiz = currentUser?.empresaId
        ? companies.find((c) => c.id === currentUser.empresaId) || null
        : null;
      const _cotizLeftHtml = _ipsDocLeftHtml(_miIPSCotiz, doc, "#1a4f8a");
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Cotización ${cot.numero}</title>
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:24px;font-size:11px;color:#111}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1a4f8a;padding-bottom:12px;margin-bottom:16px}
  .cotiz-num{text-align:right}
  .cotiz-num h2{font-size:22px;font-weight:900;color:#1a4f8a;margin:0}
  .cotiz-num p{margin:2px 0;font-size:10px;color:#555}
  .cliente{background:#f0f4ff;border-radius:8px;padding:10px 14px;margin-bottom:14px}
  .cliente p{margin:0 0 2px;font-size:11px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#1a4f8a;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
  td{padding:5px 8px;border-bottom:1px solid #e0e0e0;font-size:11px}
  .total-area{text-align:right;font-size:13px;font-weight:900;border-top:2px solid #1a4f8a;padding-top:8px;margin-top:4px}
  .notas{background:#fffbeb;border:1px solid #f0d070;border-radius:6px;padding:8px;font-size:10px;margin-bottom:14px}
  .validez{font-size:10px;color:#888;text-align:center;margin-top:10px}
  .firma{margin-top:30px;text-align:right}
  .firma-line{border-top:1px solid #555;width:200px;margin-left:auto;padding-top:4px;font-size:10px;text-align:center}
  .no-print{text-align:center;padding:12px;display:flex;gap:8px;justify-content:center}
  @media print{.no-print{display:none}}
  .estado-badge{display:inline-block;padding:2px 8px;border-radius:4px;font-weight:900;font-size:10px;background:#d1fae5;color:#065f46}
</style>
</head><body>
<div class="header">
  ${_cotizLeftHtml}
  <div class="cotiz-num">
    <h2>COTIZACIÓN</h2>
    <p>No. ${cot.numero}</p>
    <p>Fecha: ${cot.fecha}</p>
    <p>Válida por: ${cot.validezDias} días</p>
    <span class="estado-badge">${cot.estado}</span>
  </div>
</div>
<div class="cliente">
  <p><strong>CLIENTE:</strong> ${cot.clienteNombre}</p>
  ${
    cot.clienteEmpresa
      ? `<p><strong>EMPRESA:</strong> ${cot.clienteEmpresa}</p>`
      : ""
  }
  ${
    cot.clienteEmail ? `<p><strong>EMAIL:</strong> ${cot.clienteEmail}</p>` : ""
  }
  ${cot.clienteTel ? `<p><strong>TEL:</strong> ${cot.clienteTel}</p>` : ""}
</div>
<table>
  <thead><tr><th>#</th><th>Descripción</th><th>Cant.</th><th>Precio Unitario</th><th>Total</th></tr></thead>
  <tbody>
    ${cot.items
      .map(
        (it, i) => `<tr>
      <td>${i + 1}</td>
      <td>${it.desc}</td>
      <td style="text-align:center">${it.cant}</td>
      <td>$ ${Number(it.precio || 0).toLocaleString("es-CO")}</td>
      <td>$ ${(Number(it.precio || 0) * Number(it.cant || 1)).toLocaleString(
        "es-CO"
      )}</td>
    </tr>`
      )
      .join("")}
  </tbody>
</table>
<div class="total-area">TOTAL: $ ${Number(cot.total || 0).toLocaleString(
        "es-CO"
      )} COP</div>
${
  cot.notas
    ? `<div class="notas"><strong>Notas:</strong> ${cot.notas}</div>`
    : ""
}
<div class="validez">Esta cotización es válida por ${
        cot.validezDias
      } días a partir de la fecha de emisión.</div>
<div class="firma">
  <div class="firma-line">${doc?.nombre || ""}<br/>${
        doc?.titulo || ""
      }<br/>Lic: ${doc?.licencia || ""}</div>
</div>
<div class="no-print">
  <button onclick="window.print()" style="background:#1a4f8a;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:900;cursor:pointer">🖨️ Imprimir</button>
  <button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:900;cursor:pointer">✕ Cerrar</button>
</div>
</body></html>`;
      const w = window.open("", "_blank", "width=720,height=820");
      if (w) {
        w.document.write(html);
        w.document.close();
      }
    };
    const changeEstado = (id, est) => {
      saveCotizaciones(
        cotizaciones.map((c) => (c.id === id ? { ...c, estado: est } : c))
      );
    };
    const deleteCotiz = (id) => {
      showConfirm("¿Eliminar esta cotización?", () => {
        saveCotizaciones(cotizaciones.filter((c) => c.id !== id));
        if (cotizacionSelId === id) setCotizacionSelId(null);
      });
    };
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderNavbar()}
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* VISTA LISTA */}
          {cotizacionView === "list" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-gray-800">
                  📄 Cotizaciones Formales
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCotizacionView("nueva")}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-lg"
                  >
                    ➕ Nueva Cotización
                  </button>
                  <button
                    onClick={() => goTo("dashboard")}
                    className="text-gray-500 font-bold text-sm flex items-center gap-1 hover:text-gray-700"
                  >
                    ← Volver
                  </button>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { l: "Total", v: cotizaciones.length, c: "blue" },
                  {
                    l: "Pendientes",
                    v: cotizaciones.filter((c) => c.estado === "Pendiente")
                      .length,
                    c: "amber",
                  },
                  {
                    l: "Aprobadas",
                    v: cotizaciones.filter((c) => c.estado === "Aprobada")
                      .length,
                    c: "emerald",
                  },
                ].map((s) => (
                  <div
                    key={s.l}
                    className={`bg-${s.c}-50 border border-${s.c}-200 rounded-xl p-3 text-center`}
                  >
                    <div className={`text-2xl font-black text-${s.c}-700`}>
                      {s.v}
                    </div>
                    <div className="text-[10px] font-bold uppercase text-gray-500">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      {[
                        "N°",
                        "Fecha",
                        "Cliente",
                        "Empresa",
                        "Total",
                        "Estado",
                        "Acciones",
                      ].map((h) => (
                        <th key={h} className="p-2 text-left font-black">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cotizaciones.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-gray-400"
                        >
                          Sin cotizaciones. Cree la primera con "Nueva
                          Cotización".
                        </td>
                      </tr>
                    ) : (
                      [...cotizaciones].reverse().map((cot, i) => (
                        <tr
                          key={cot.id}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="p-2 font-mono font-black text-blue-700">
                            #{cot.numero}
                          </td>
                          <td className="p-2">{cot.fecha}</td>
                          <td className="p-2 font-bold">{cot.clienteNombre}</td>
                          <td className="p-2 text-gray-500">
                            {cot.clienteEmpresa || "-"}
                          </td>
                          <td className="p-2 font-black text-emerald-700">
                            $ {Number(cot.total || 0).toLocaleString("es-CO")}
                          </td>
                          <td className="p-2">
                            <select
                              value={cot.estado}
                              onChange={(e) =>
                                changeEstado(cot.id, e.target.value)
                              }
                              className="text-[10px] border rounded px-1 py-0.5 font-bold"
                            >
                              {[
                                "Pendiente",
                                "Aprobada",
                                "Rechazada",
                                "Vencida",
                              ].map((e) => (
                                <option key={e}>{e}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2 flex gap-1 flex-wrap">
                            <button
                              onClick={() => openPrintCotiz(cot)}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold hover:bg-blue-200 text-[10px]"
                            >
                              🖨️
                            </button>
                            <button
                              onClick={() => deleteCotiz(cot.id)}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold hover:bg-red-200 text-[10px]"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* VISTA NUEVA COTIZACIÓN */}
          {cotizacionView === "nueva" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-gray-800">
                  ➕ Nueva Cotización
                </h2>
                <button
                  onClick={() => setCotizacionView("list")}
                  className="text-gray-500 font-bold text-sm hover:text-gray-700"
                >
                  ← Cancelar
                </button>
              </div>
              {/* Datos cliente */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-black text-blue-800 uppercase mb-3">
                  👤 Datos del Cliente
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      f: "clienteNombre",
                      l: "Nombre / Razón social *",
                      placeholder: "Dr. Juan Pérez / Empresa S.A.S",
                    },
                    {
                      f: "clienteEmpresa",
                      l: "Empresa",
                      placeholder: "Nombre empresa",
                    },
                    {
                      f: "clienteEmail",
                      l: "Email",
                      placeholder: "correo@empresa.com",
                    },
                    {
                      f: "clienteTel",
                      l: "Teléfono",
                      placeholder: "310 000 0000",
                    },
                  ].map(({ f, l, placeholder }) => (
                    <div key={f}>
                      <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                        {l}
                      </label>
                      <input
                        value={cotizacionForm[f]}
                        onChange={(e) =>
                          setCotizacionForm((p) => ({
                            ...p,
                            [f]: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-blue-300 rounded-lg text-xs"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={cotizacionForm.fecha}
                      onChange={(e) =>
                        setCotizacionForm((p) => ({
                          ...p,
                          fecha: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-blue-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                      Válida por (días)
                    </label>
                    <input
                      type="number"
                      value={cotizacionForm.validezDias}
                      onChange={(e) =>
                        setCotizacionForm((p) => ({
                          ...p,
                          validezDias: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-blue-300 rounded-lg text-xs"
                      min="1"
                    />
                  </div>
                </div>
              </div>
              {/* Ítems */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-black text-emerald-800 uppercase">
                    📋 Ítems / Servicios
                  </p>
                  <button
                    onClick={handleNewItem}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black rounded-lg"
                  >
                    ➕ Agregar ítem
                  </button>
                </div>
                {cotizacionForm.items.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Sin ítems. Pulse "Agregar ítem" para comenzar.
                  </p>
                ) : (
                  cotizacionForm.items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 mb-2 items-end">
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-gray-600 block mb-1">
                          Descripción *
                        </label>
                        <input
                          value={it.desc}
                          onChange={(e) => {
                            const its = [...cotizacionForm.items];
                            its[idx] = { ...its[idx], desc: e.target.value };
                            setCotizacionForm((p) => ({ ...p, items: its }));
                          }}
                          list="portafolio-list"
                          className="w-full p-2 border rounded-lg text-xs"
                          placeholder="Nombre del servicio"
                        />
                        <datalist id="portafolio-list">
                          {portafolioItems.map((pi) => (
                            <option
                              key={pi.id}
                              value={pi.nombre}
                              data-precio={pi.precio}
                            >
                              {pi.nombre} - ${" "}
                              {Number(pi.precio).toLocaleString("es-CO")}
                            </option>
                          ))}
                        </datalist>
                      </div>
                      <div style={{ width: "70px" }}>
                        <label className="text-[10px] font-black text-gray-600 block mb-1">
                          Cant.
                        </label>
                        <input
                          type="number"
                          value={it.cant}
                          min="1"
                          onChange={(e) => {
                            const its = [...cotizacionForm.items];
                            its[idx] = { ...its[idx], cant: e.target.value };
                            setCotizacionForm((p) => ({ ...p, items: its }));
                          }}
                          className="w-full p-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div style={{ width: "120px" }}>
                        <label className="text-[10px] font-black text-gray-600 block mb-1">
                          Precio unit.
                        </label>
                        <input
                          type="number"
                          value={it.precio}
                          onChange={(e) => {
                            const its = [...cotizacionForm.items];
                            its[idx] = { ...its[idx], precio: e.target.value };
                            setCotizacionForm((p) => ({ ...p, items: its }));
                          }}
                          className="w-full p-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div
                        className="text-xs font-black text-emerald-700 pb-2"
                        style={{ width: "100px" }}
                      >
                        = ${" "}
                        {(
                          Number(it.precio || 0) * Number(it.cant || 1)
                        ).toLocaleString("es-CO")}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="pb-2 text-red-400 hover:text-red-600 font-black text-base"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
                {cotizacionForm.items.length > 0 && (
                  <div className="text-right font-black text-emerald-800 text-sm pt-2 border-t border-emerald-300">
                    SUBTOTAL: $ {subtotal.toLocaleString("es-CO")} COP
                  </div>
                )}
              </div>
              {/* Notas */}
              <div className="mb-4">
                <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                  Notas / Condiciones
                </label>
                <textarea
                  value={cotizacionForm.notas}
                  onChange={(e) =>
                    setCotizacionForm((p) => ({ ...p, notas: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs resize-none"
                  rows={2}
                  placeholder="Condiciones de pago, vigencia, términos especiales..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => saveCotiz("Pendiente")}
                  className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-black rounded-lg"
                >
                  💾 Guardar cotización
                </button>
                <button
                  onClick={() => saveCotiz("Aprobada")}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black rounded-lg"
                >
                  ✅ Guardar como Aprobada
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );

};

export default Cotizaciones;
