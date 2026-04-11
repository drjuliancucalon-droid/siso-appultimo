import React from 'react';
import {
  FileText, LogOut, Plus, Printer, Save
} from "lucide-react";

// ─── Propuestas Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const Propuestas = (props) => {
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

    if (!_canUse("propuestas", currentUser))
      return (
        <div className="min-h-screen bg-gray-50 font-sans">
          {renderNavbar()}
          <div className="max-w-2xl mx-auto px-4 py-12">
            <PlanGate
              feature="propuestas"
              requiredPlan="starter"
              currentUser={currentUser}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => goBack()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Volver
              </button>
            </div>
          </div>
        </div>
      );
    // ── SECRETARIA GATE: "Propuestas Económicas" requiere autorización del admin ──
    if (
      currentUser?.role === "secretaria" &&
      !_secretariaPuede("propuestas", currentUser, usersList)
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
              <p className="text-amber-700 text-sm font-bold">
                Propuestas Económicas
              </p>
              <p className="text-amber-600 text-xs leading-relaxed">
                Este módulo requiere autorización explícita del administrador.
                <br />
                Solicita que habilite el permiso{" "}
                <strong>"Propuestas Económicas"</strong> en tu perfil.
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
    const _billDocUser = billData.billDoctorId
      ? usersList.find((u) => u.user === billData.billDoctorId)
      : null;
    const _billDocData = _billDocUser?.doctorData || activeDoctorData;
    const _billDocSig = _billDocUser?.doctorData?.firma || activeSignature;
    const SERVICIOS_CATALOGO = [
      {
        id: "s1",
        nombre: "Examen Médico Ocupacional de Ingreso",
        unidad: "Por trabajador",
        precioBase: parseInt(_billDocData.tarifaExamenOcup || 90000),
      },
      {
        id: "s2",
        nombre: "Examen Médico Ocupacional Periódico",
        unidad: "Por trabajador",
        precioBase: parseInt(_billDocData.tarifaExamenOcup || 90000),
      },
      {
        id: "s3",
        nombre: "Examen Médico Ocupacional de Egreso",
        unidad: "Por trabajador",
        precioBase: parseInt(_billDocData.tarifaExamenOcup || 90000),
      },
      {
        id: "s4",
        nombre: "Informe Ejecutivo de Salud y Perfil Epidemiológico",
        unidad: "Por empresa",
        precioBase: parseInt(_billDocData.tarifaInforme || 250000),
      },
      {
        id: "s5",
        nombre: "Programa de Vigilancia Epidemiológica (PVE)",
        unidad: "Por día",
        precioBase: parseInt(_billDocData.tarifaDiaPVE || 350000),
      },
      {
        id: "s6",
        nombre: "Asesoría en Sistema de Gestión SST",
        unidad: "Por hora",
        precioBase: parseInt(_billDocData.tarifaHora || 120000),
      },
      {
        id: "s7",
        nombre: "Capacitación en SST (grupos hasta 30 personas)",
        unidad: "Por sesión",
        precioBase: 280000,
      },
      {
        id: "s8",
        nombre: "Certificado de Aptitud Laboral Individual",
        unidad: "Por trabajador",
        precioBase: 45000,
      },
      {
        id: "s9",
        nombre: "Análisis de Puesto de Trabajo",
        unidad: "Por cargo",
        precioBase: 180000,
      },
      {
        id: "s10",
        nombre: "Restricciones y Recomendaciones Médico-Laborales",
        unidad: "Por trabajador",
        precioBase: 60000,
      },
    ];
    const addServicio = () => {
      const found = SERVICIOS_CATALOGO.find((s) => s.id === selSvc);
      if (!found) return;
      setPropForm((p) => ({
        ...p,
        servicios: [
          ...p.servicios,
          { ...found, cantidad: 1, precio: found.precioBase },
        ],
      }));
      setSelSvc("");
    };
    const total = propForm.servicios.reduce(
      (s, x) => s + (x.precio || 0) * (x.cantidad || 1),
      0
    );
    // Auto-consecutivo propuesta
    const _nextPropNumCalc = (() => {
      const mx = savedReports.reduce((m, r) => {
        const n = parseInt(r.numero || "0", 10);
        return n > m ? n : m;
      }, 0);
      return String(mx + 1).padStart(3, "0");
    })();
    if (!propForm.numero || propForm.numero === "001") {
      // Don't call setState during render - use the value inline instead
    }
    return (
      <div className="min-h-screen bg-gray-50 font-sans p-8 print:bg-white print:p-0">
        <div className="max-w-4xl mx-auto">
          {/* ── TAB SELECTOR: Propuesta Económica ↔ Cotización Rápida ↔ Historial ── */}
          <div className="flex gap-2 mb-4 no-print border-b border-gray-200 pb-3 flex-wrap">
            <button
              onClick={() => setPropModulo("propuesta")}
              className={`px-5 py-2 rounded-t-xl text-sm font-black transition-all ${
                propModulo === "propuesta"
                  ? "bg-teal-700 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              📄 Propuesta Económica
            </button>
            <button
              onClick={() => setPropModulo("cotizacion")}
              className={`px-5 py-2 rounded-t-xl text-sm font-black transition-all ${
                propModulo === "cotizacion"
                  ? "bg-indigo-700 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              🧾 Cotización Rápida
            </button>
            <button
              onClick={() => setPropModulo("historial")}
              className={`px-5 py-2 rounded-t-xl text-sm font-black transition-all ${
                propModulo === "historial"
                  ? "bg-amber-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              🗂 Historial ({savedReports.filter(r => r._tipo === "propuesta" || r.servicios).length})
            </button>
          </div>
          {propModulo === "cotizacion" && renderCotizacionesInline()}
          {/* ── HISTORIAL DE PROPUESTAS GUARDADAS ── */}
          {propModulo === "historial" && (() => {
            const propsSaved = savedReports.filter(r => r._tipo === "propuesta" || r.servicios);
            return (
              <div className="bg-white shadow rounded-2xl p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-black text-amber-800 flex items-center gap-2">
                    🗂 Propuestas Guardadas
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{propsSaved.length}</span>
                  </h2>
                  <button onClick={() => goBack()} className="text-gray-500 font-bold text-sm flex items-center gap-1">
                    <LogOut className="rotate-180 w-4 h-4" /> Volver
                  </button>
                </div>
                {propsSaved.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No hay propuestas guardadas aún.</p>
                    <p className="text-xs mt-1">Cree una propuesta y presione Guardar.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-amber-50 text-amber-800 text-xs font-black">
                          <th className="px-3 py-2 text-left rounded-tl-lg">N.°</th>
                          <th className="px-3 py-2 text-left">Empresa</th>
                          <th className="px-3 py-2 text-left">NIT</th>
                          <th className="px-3 py-2 text-left">Fecha</th>
                          <th className="px-3 py-2 text-right">Total</th>
                          <th className="px-3 py-2 text-center">Vigencia</th>
                          <th className="px-3 py-2 text-center rounded-tr-lg">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...propsSaved].reverse().map((prop, idx) => {
                          const totalProp = (prop.servicios || []).reduce((s, x) => s + (x.precio || 0) * (x.cantidad || 1), 0);
                          const fechaProp = prop.fecha || prop.savedAt?.split("T")[0] || "—";
                          const diasVig = parseInt(prop.validez || "30", 10);
                          const fechaVenc = prop.fecha ? new Date(new Date(prop.fecha).getTime() + diasVig * 86400000) : null;
                          const vencida = fechaVenc && fechaVenc < new Date();
                          return (
                            <tr key={prop.id || idx} className="border-b border-gray-100 hover:bg-amber-50 transition-colors">
                              <td className="px-3 py-2 font-black text-teal-700">#{prop.numero || "—"}</td>
                              <td className="px-3 py-2 font-medium text-gray-800 max-w-[160px] truncate">{prop.empresa || "—"}</td>
                              <td className="px-3 py-2 text-gray-500 text-xs">{prop.nit || "—"}</td>
                              <td className="px-3 py-2 text-gray-500 text-xs">{fechaProp}</td>
                              <td className="px-3 py-2 text-right font-black text-emerald-700">
                                ${(totalProp).toLocaleString("es-CO")}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${vencida ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                                  {vencida ? "Vencida" : "Vigente"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => { setPropForm(prop); setPropModulo("propuesta"); }}
                                    className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs font-bold hover:bg-teal-200"
                                    title="Abrir y editar"
                                  >
                                    Abrir
                                  </button>
                                  <button
                                    onClick={() => showConfirm("¿Eliminar esta propuesta del historial?", () => {
                                      const upd = savedReports.filter(r => r.id !== prop.id);
                                      setSavedReports(upd);
                                      _sync("siso_saved_reports", JSON.stringify(upd));
                                      _sbSet("siso_saved_reports", upd);
                                    })}
                                    className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold hover:bg-red-200"
                                    title="Eliminar"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}
          <div
            style={{ display: propModulo === "propuesta" ? "block" : "none" }}
          >
            {/* Controles no-print */}
            <div className="bg-white shadow rounded-2xl p-6 mb-6 no-print">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-black text-teal-800 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Propuestas Económicas y
                  Cotizaciones
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => goBack()}
                    className="text-gray-500 font-bold text-sm flex items-center gap-1"
                  >
                    <LogOut className="rotate-180 w-4 h-4" /> Volver
                  </button>
                  <button
                    onClick={() => {
                      const _maxProp = savedReports.reduce((mx, r) => {
                        const n = parseInt(r.numero || "0", 10);
                        return n > mx ? n : mx;
                      }, 0);
                      const nextPropNum = String(_maxProp + 1).padStart(3, "0");
                      const nb = {
                        ...propForm,
                        id: Date.now(),
                        savedAt: new Date().toISOString(),
                        numero: propForm.numero || nextPropNum,
                        _tipo: "propuesta",
                      };
                      if (!nb.empresa && !nb.nit) {
                        showAlert("Complete al menos empresa o NIT.");
                        return;
                      }
                      const upd = [...savedReports, nb];
                      setSavedReports(upd);
                      _sync("siso_saved_reports", JSON.stringify(upd));
                      _sbSet("siso_saved_reports", upd);
                      setPropForm((p) => ({
                        ...p,
                        numero: String(parseInt(nb.numero, 10) + 1).padStart(
                          3,
                          "0"
                        ),
                      }));
                      showAlert("✅ Propuesta guardada correctamente.");
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-emerald-700"
                  >
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                  <button
                    onClick={() => handlePrint("Propuesta-Economica")}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
                  >
                    <Printer className="w-4 h-4" /> Imprimir
                  </button>
                </div>
              </div>
              {["secretaria", "administrador"].includes(currentUser?.role) &&
                (() => {
                  const medicos = usersList.filter(
                    (u) =>
                      ["medico", "administrador", "super_admin"].includes(
                        u.role
                      ) && u.activo !== false
                  );
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                      <p className="text-xs font-black text-blue-800 mb-2">
                        👨‍⚕️ Médico que firma la propuesta
                      </p>
                      <select
                        className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white"
                        value={billData.billDoctorId || ""}
                        onChange={(e) =>
                          setBillData((p) => ({
                            ...p,
                            billDoctorId: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- Mi perfil --</option>
                        {medicos.map((u) => (
                          <option key={u.user} value={u.user}>
                            {u.doctorData?.nombre || u.nombre || u.user} (
                            {u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })()}
              <div className="grid grid-cols-3 gap-3 bg-teal-50 p-4 rounded-xl border border-teal-100 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    No. Propuesta
                  </label>
                  <input
                    value={propForm.numero || _nextPropNumCalc}
                    onChange={(e) =>
                      setPropForm((p) => ({ ...p, numero: e.target.value }))
                    }
                    placeholder={_nextPropNumCalc}
                    className="w-full p-2 border rounded-lg text-sm font-mono"
                    title={`Próximo consecutivo sugerido: ${_nextPropNumCalc}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={propForm.fecha}
                    onChange={(e) =>
                      setPropForm((p) => ({ ...p, fecha: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Validez (días)
                  </label>
                  <input
                    type="number"
                    value={propForm.validez}
                    onChange={(e) =>
                      setPropForm((p) => ({ ...p, validez: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Empresa Cliente
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg text-sm"
                    value={propForm.empresa}
                    onChange={(e) => {
                      const c = companies.find(
                        (x) => x.nombre === e.target.value
                      );
                      setPropForm((p) => ({
                        ...p,
                        empresa: e.target.value,
                        nit: c ? `${c.nit}${c.dv ? "-" + c.dv : ""}` : "",
                      }));
                    }}
                  >
                    <option value="">Particular / Otra...</option>
                    {companies.map((c) => (
                      <option key={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    NIT / CC
                  </label>
                  <input
                    value={propForm.nit}
                    onChange={(e) =>
                      setPropForm((p) => ({ ...p, nit: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    No. Trabajadores
                  </label>
                  <input
                    type="number"
                    value={propForm.numTrabajadores}
                    onChange={(e) =>
                      setPropForm((p) => ({
                        ...p,
                        numTrabajadores: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Persona de Contacto
                  </label>
                  <input
                    value={propForm.contacto || ""}
                    onChange={(e) =>
                      setPropForm((p) => ({ ...p, contacto: e.target.value }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="Nombre del responsable"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Cargo del Contacto
                  </label>
                  <input
                    value={propForm.cargoPropuesta || ""}
                    onChange={(e) =>
                      setPropForm((p) => ({
                        ...p,
                        cargoPropuesta: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="Jefe de RRHH / SST"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Ciudad de Atención
                  </label>
                  <input
                    value={
                      propForm.ciudadPropuesta || _billDocData.ciudad || ""
                    }
                    onChange={(e) =>
                      setPropForm((p) => ({
                        ...p,
                        ciudadPropuesta: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="Popayán - Cauca"
                  />
                </div>
              </div>
              {/* Agregar servicios */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-black text-gray-700 uppercase mb-3">
                  Agregar Servicios
                </p>
                <div className="flex gap-2">
                  <select
                    value={selSvc}
                    onChange={(e) => setSelSvc(e.target.value)}
                    className="flex-1 p-2 border rounded-lg text-sm"
                  >
                    <option value="">Seleccionar servicio...</option>
                    {SERVICIOS_CATALOGO.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} -- ${s.precioBase.toLocaleString("es-CO")}/
                        {s.unidad}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addServicio}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Agregar
                  </button>
                </div>
              </div>
              {/* Lista servicios editable */}
              {propForm.servicios.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-2 text-left font-bold">Servicio</th>
                        <th className="p-2 w-20 font-bold">Cant.</th>
                        <th className="p-2 w-28 font-bold">Precio Unit.</th>
                        <th className="p-2 w-28 font-bold text-right">Total</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {propForm.servicios.map((s, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            {s.nombre}{" "}
                            <span className="text-gray-400">({s.unidad})</span>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={s.cantidad || 1}
                              onChange={(e) => {
                                const svs = [...propForm.servicios];
                                svs[i] = {
                                  ...svs[i],
                                  cantidad: parseInt(e.target.value) || 1,
                                };
                                setPropForm((p) => ({ ...p, servicios: svs }));
                              }}
                              className="w-16 p-1 border rounded text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={s.precio || 0}
                              onChange={(e) => {
                                const svs = [...propForm.servicios];
                                svs[i] = {
                                  ...svs[i],
                                  precio: parseInt(e.target.value) || 0,
                                };
                                setPropForm((p) => ({ ...p, servicios: svs }));
                              }}
                              className="w-full p-1 border rounded font-mono"
                            />
                          </td>
                          <td className="p-2 text-right font-bold font-mono">
                            $
                            {(
                              (s.precio || 0) * (s.cantidad || 1)
                            ).toLocaleString("es-CO")}
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() =>
                                setPropForm((p) => ({
                                  ...p,
                                  servicios: p.servicios.filter(
                                    (_, j) => j !== i
                                  ),
                                }))
                              }
                              className="text-red-400 hover:text-red-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-teal-50 border-t-2 border-teal-600">
                      <tr>
                        <td
                          colSpan={3}
                          className="p-2 font-black text-right uppercase text-teal-800"
                        >
                          Total Propuesta:
                        </td>
                        <td className="p-2 font-black text-right text-teal-900 font-mono text-base">
                          ${total.toLocaleString("es-CO")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Observaciones y condiciones
                </label>
                <textarea
                  rows={2}
                  value={propForm.observaciones}
                  onChange={(e) =>
                    setPropForm((p) => ({
                      ...p,
                      observaciones: e.target.value,
                    }))
                  }
                  placeholder="Condiciones de pago, entrega, etc..."
                  className="w-full p-2 border rounded-lg text-xs"
                />
              </div>
            </div>

            <style>{`
            .doc-editable-prop [contenteditable]:hover { outline: 2px dashed #3b82f6; outline-offset:2px; border-radius:3px; cursor:text; }
            .doc-editable-prop [contenteditable]:focus { outline: 2px solid #2563eb; outline-offset:2px; border-radius:3px; background:#eff6ff; }
            .doc-editable-prop [contenteditable]:empty:before { content: attr(data-placeholder); color: #9ca3af; font-style: italic; }
            @media print { .doc-editable-prop [contenteditable] { outline:none !important; background:transparent !important; } }
          `}</style>
            <div className="doc-editable-prop">
              <div
                className="bg-white mx-auto shadow-2xl print:shadow-none carta-visual"
                style={{
                  width: "21.59cm",
                  minHeight: "auto",
                  padding: "1.5cm 1.8cm",
                  boxSizing: "border-box",
                  fontSize: "9pt",
                }}
              >
                {/* ── ENCABEZADO ── */}
                <div className="flex justify-between items-start border-b-2 border-gray-300 pb-3 mb-4">
                  <div className="scale-100 origin-left">
                    <BrandLogo data={_billDocData} />
                  </div>
                  <div className="text-right">
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="text-[9px] font-bold text-yellow-600 uppercase tracking-widest mb-0.5 outline-none"
                    >
                      PROPUESTA ECONÓMICA
                    </p>
                    <h1
                      contentEditable
                      suppressContentEditableWarning
                      className="text-xl font-black text-gray-900 uppercase tracking-wide outline-none"
                    >
                      SERVICIOS MÉDICOS OCUPACIONALES
                    </h1>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="text-[9px] text-gray-500 mt-1 uppercase tracking-wide outline-none"
                    >
                      No. {propForm.numero || _nextPropNumCalc} · Fecha:{" "}
                      {propForm.fecha} · Validez: {propForm.validez || "30"}{" "}
                      días
                    </p>
                  </div>
                </div>
                {/* ── PREPARADO PARA ── */}
                <div className="border border-gray-200 rounded p-3 mb-4 bg-gray-50 print:bg-transparent">
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1 outline-none"
                  >
                    Preparado para:
                  </p>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="text-base font-black text-gray-800 uppercase border-b border-gray-300 pb-1 mb-1 outline-none"
                  >
                    {propForm.empresa || "EMPRESA CLIENTE"}
                  </p>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="text-xs text-gray-600 mt-1 border-b border-gray-200 pb-1 mb-1 outline-none"
                  >
                    NIT / CC: {propForm.nit || "---"} · Trabajadores:{" "}
                    {propForm.numTrabajadores || "---"}
                  </p>
                  {propForm.contacto && (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="text-[9px] text-gray-600 mt-1 outline-none"
                    >
                      Atención: {propForm.contacto}
                      {propForm.cargoPropuesta
                        ? " · " + propForm.cargoPropuesta
                        : ""}
                    </p>
                  )}
                </div>
                {/* ── 1. OBJETIVO ── */}
                <div className="mb-3">
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700 mb-1.5 outline-none"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0 no-edit">
                      1
                    </span>
                    OBJETIVO
                  </h3>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="text-[9pt] text-gray-700 leading-relaxed pl-5 outline-none"
                  >
                    Establecer las condiciones para la realización de
                    evaluaciones médicas ocupacionales (EMO) orientadas a
                    determinar el estado de salud de los trabajadores, en
                    cumplimiento de la normativa vigente colombiana.
                  </p>
                </div>
                {/* ── 2. MARCO LEGAL ── */}
                <div className="mb-3">
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700 mb-1.5 outline-none"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0 no-edit">
                      2
                    </span>
                    MARCO LEGAL
                  </h3>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="pl-5 space-y-1 outline-none text-[9px] text-gray-700"
                  >
                    <p>
                      ✓ <strong>Resolución 1843 de 2025:</strong> Norma que
                      establece los lineamientos para la realización y custodia
                      de las historias clínicas ocupacionales.
                    </p>
                    <p>
                      ✓ <strong>Resolución 2346 de 2007:</strong> Regulación de
                      la práctica de evaluaciones médicas ocupacionales.
                    </p>
                    <p>
                      ✓ <strong>Resolución 0312 de 2019:</strong> Estándares
                      mínimos del SG-SST.
                    </p>
                    <p>
                      ✓ <strong>Decreto 1072 de 2015:</strong> Decreto Único
                      Reglamentario del Sector Trabajo.
                    </p>
                  </div>
                </div>
                {/* ── 3. ENTREGABLES ── */}
                <div className="mb-3">
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700 mb-1.5 outline-none"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0 no-edit">
                      3
                    </span>
                    ENTREGABLES
                  </h3>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="pl-5 outline-none text-[9px] text-gray-700 grid grid-cols-2 gap-x-4"
                  >
                    <p className="mb-1">
                      ✓ <strong>Certificado de Aptitud Laboral:</strong> Para el
                      archivo de la empresa (según MinTrabajo).
                    </p>
                    <p className="mb-1">
                      ✓ <strong>Remisiones médicas:</strong> Cuando se requiera
                      para trámite a la entidad correspondiente.
                    </p>
                    <p className="mb-1">
                      ✓ <strong>Informe de Condiciones de Salud:</strong> Perfil
                      epidemiológico consolidado de la población evaluada.
                    </p>
                    <p className="mb-1">
                      ✓ <strong>Historia Clínica:</strong> Custodiada bajo
                      reserva legal (Res. 1995/1999).
                    </p>
                  </div>
                </div>
                {/* ── 4. METODOLOGÍA ── */}
                <div className="mb-3">
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700 mb-1.5 outline-none"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0 no-edit">
                      4
                    </span>
                    METODOLOGÍA
                  </h3>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="text-[9pt] text-gray-700 leading-relaxed pl-5 outline-none"
                  >
                    Las evaluaciones médicas se realizarán en las instalaciones
                    acordadas, con historia clínica digital, examen físico
                    completo y los paraclínicos indicados según el cargo. Se
                    emite concepto de aptitud laboral de conformidad con la
                    Resolución 1843 de 2025.
                  </p>
                </div>
                {/* ── 5. PROPUESTA ECONÓMICA ── */}
                <div className="mb-3">
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700 mb-1.5 outline-none"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0 no-edit">
                      5
                    </span>
                    PROPUESTA ECONÓMICA
                  </h3>
                  <div className="border border-gray-300 rounded overflow-hidden">
                    <div
                      className="bg-gray-800 text-white grid text-[8px] font-black uppercase tracking-wide"
                      style={{ gridTemplateColumns: "1fr 140px" }}
                    >
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className="px-3 py-2 outline-none"
                      >
                        Ítem / Servicio Profesional
                      </div>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className="px-3 py-2 text-right outline-none"
                      >
                        Valor Unitario
                      </div>
                    </div>
                    {propForm.servicios.length > 0 ? (
                      propForm.servicios.map((s, i) => (
                        <div
                          key={i}
                          className={`grid text-[9pt] ${
                            i % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } border-t border-gray-200 print:bg-transparent`}
                          style={{ gridTemplateColumns: "1fr 140px" }}
                        >
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            className="px-3 py-2 outline-none"
                          >
                            <p className="font-medium text-gray-800">
                              {s.nombre}
                              {s.cantidad > 1 ? ` (x${s.cantidad})` : ""}
                            </p>
                            {s.descripcion && (
                              <p className="text-[8px] text-gray-400">
                                {s.descripcion}
                              </p>
                            )}
                          </div>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            className="px-3 py-2 text-right font-bold font-mono text-gray-800 outline-none"
                          >
                            ${" "}
                            {(
                              (s.precio || 0) * (s.cantidad || 1)
                            ).toLocaleString("es-CO")}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className="px-3 py-4 text-center text-gray-400 text-[9px] italic outline-none"
                      >
                        -- Agregue servicios desde el panel de configuración --
                      </div>
                    )}
                    {propForm.servicios.length > 1 && (
                      <div
                        className="grid bg-emerald-50 border-t-2 border-emerald-600 font-black text-[9pt] print:bg-transparent"
                        style={{ gridTemplateColumns: "1fr 140px" }}
                      >
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className="px-3 py-2 text-right uppercase text-emerald-800 outline-none"
                        >
                          TOTAL PROPUESTA
                        </div>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className="px-3 py-2 text-right font-black font-mono text-emerald-900 outline-none"
                        >
                          $ {total.toLocaleString("es-CO")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* ── 6. CONDICIONES COMERCIALES ── */}
                <div className="mb-4">
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-700 mb-1.5 outline-none"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0 no-edit">
                      6
                    </span>
                    CONDICIONES COMERCIALES
                  </h3>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="border border-gray-300 rounded overflow-hidden outline-none"
                  >
                    <div
                      className="grid text-[8px] font-black uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200"
                      style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
                    >
                      <div className="px-3 py-1.5">Forma de Pago</div>
                      <div className="px-3 py-1.5">Vigencia</div>
                      <div className="px-3 py-1.5">Facturación</div>
                    </div>
                    <div
                      className="grid text-[9pt] text-gray-700 bg-white print:bg-transparent"
                      style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
                    >
                      <div className="px-3 py-2">30 días factura vencida.</div>
                      <div className="px-3 py-2">
                        {propForm.validez || "30"} días calendario.
                      </div>
                      <div className="px-3 py-2">Factura electrónica.</div>
                    </div>
                  </div>
                  {propForm.observaciones && (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-[9px] text-gray-700 leading-relaxed print:bg-transparent outline-none"
                    >
                      <strong>Observaciones: </strong>
                      {propForm.observaciones}
                    </div>
                  )}
                </div>
                {/* ── FIRMA ── */}
                <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-end">
                  <div className="text-left">
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="text-[9px] text-gray-500 italic mb-6 outline-none"
                    >
                      Agradecemos su confianza. Quedamos atentos a cualquier
                      consulta adicional.
                    </p>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="text-[8px] text-gray-400 outline-none"
                    >
                      {propForm.ciudadPropuesta || _billDocData?.ciudad || ""},{" "}
                      {propForm.fecha}
                    </p>
                  </div>
                  <div className="text-center" style={{ minWidth: "180px" }}>
                    <DoctorSignature
                      signature={_billDocSig}
                      data={_billDocData}
                      showData={true}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* /doc-editable-prop */}
          </div>
          {/* /propuesta-content */}
        </div>
      </div>
    );

};

export default Propuestas;
