import React from 'react';
import {
  Shield
} from "lucide-react";

// ─── HabeasData Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const HabeasData = (props) => {
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

    const TIPOS_SOLICITUD = [
      { valor: "conocer", etiqueta: "🔍 Conocer mis datos (Art. 8a Ley 1581)" },
      {
        valor: "actualizar",
        etiqueta: "✏️ Actualizar / rectificar datos (Art. 8b)",
      },
      { valor: "suprimir", etiqueta: "🗑 Suprimir / eliminar datos (Art. 8c)" },
      {
        valor: "revocar",
        etiqueta: "🚫 Revocar autorización de tratamiento (Art. 8e)",
      },
      { valor: "queja", etiqueta: "⚠️ Presentar queja ante SIC (Art. 8f)" },
      {
        valor: "acceder",
        etiqueta: "📋 Acceder a Historia Clínica (Res. 1995/1999)",
      },
    ];
    const ESTADOS = ["Recibida", "En trámite", "Respondida", "Cerrada"];

    const _syncHabeas = (lista) => {
      setHabeasRequests(lista);
      _ls.setItem("siso_habeas_requests", JSON.stringify(lista));
      _sbSet(`siso_habeas_${currentUser?.user || "shared"}`, lista);
    };

    const handleRegistrarSolicitud = () => {
      const f = habeasForm;
      if (!f.nombre.trim()) {
        showAlert("⚠️ Ingrese el nombre del titular.");
        return;
      }
      if (!f.documento.trim()) {
        showAlert("⚠️ Ingrese el documento del titular.");
        return;
      }
      if (!f.tipo) {
        showAlert("⚠️ Seleccione el tipo de solicitud.");
        return;
      }
      if (!f.descripcion.trim()) {
        showAlert("⚠️ Ingrese la descripción de la solicitud.");
        return;
      }
      const nueva = {
        id: `hd_${Date.now()}`,
        ...f,
        estado: "Recibida",
        creadaEn: new Date().toISOString(),
        creadaPor: currentUser?.user,
        respuesta: "",
        respondidaEn: "",
      };
      const lista = [nueva, ...habeasRequests];
      _syncHabeas(lista);
      setHabeasForm({
        nombre: "",
        documento: "",
        tipo: "",
        descripcion: "",
        fecha: new Date().toISOString().split("T")[0],
      });
      showAlert(
        "✅ Solicitud de Habeas Data registrada. Plazo de respuesta: 10 días hábiles (Art. 14 Ley 1581/2012)."
      );
    };

    const handleCambiarEstado = (id, nuevoEstado) => {
      const lista = habeasRequests.map((r) =>
        r.id === id
          ? {
              ...r,
              estado: nuevoEstado,
              respondidaEn:
                nuevoEstado === "Respondida"
                  ? new Date().toISOString()
                  : r.respondidaEn,
            }
          : r
      );
      _syncHabeas(lista);
    };

    const diasRestantes = (creadaEn) => {
      const ms = 10 * 24 * 60 * 60 * 1000; // 10 días hábiles ≈ 14 días calendario
      const diff = Math.ceil(
        (new Date(creadaEn).getTime() + 14 * 24 * 60 * 60 * 1000 - Date.now()) /
          (24 * 60 * 60 * 1000)
      );
      return diff;
    };

    const pendientes = habeasRequests.filter(
      (r) => r.estado === "Recibida" || r.estado === "En trámite"
    );

    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderNavbar()}
        <div className="p-4 max-w-5xl mx-auto space-y-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goBack()}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0"
                >
                  ← Volver
                </button>
                <div>
                  <h2 className="text-lg font-black flex items-center gap-2">
                    <Shield className="w-5 h-5" /> Habeas Data
                  </h2>
                  <p className="text-indigo-200 text-xs mt-0.5">
                    Ley 1581 de 2012 · Decreto 1078 de 2015
                  </p>
                </div>
              </div>
              {pendientes.length > 0 && (
                <div className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full">
                  ⏰ {pendientes.length} solicitud
                  {pendientes.length > 1 ? "es" : ""} pendiente
                  {pendientes.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* PANEL IZQUIERDO: Registrar nueva solicitud */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h3 className="text-sm font-black text-gray-800">
                📋 Registrar solicitud del titular
              </h3>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">
                  Nombre del titular *
                </label>
                <input
                  value={habeasForm.nombre}
                  onChange={(e) =>
                    setHabeasForm((p) => ({ ...p, nombre: e.target.value }))
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
                  value={habeasForm.documento}
                  onChange={(e) =>
                    setHabeasForm((p) => ({ ...p, documento: e.target.value }))
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="CC / CE / PP"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">
                  Tipo de solicitud *
                </label>
                <select
                  value={habeasForm.tipo}
                  onChange={(e) =>
                    setHabeasForm((p) => ({ ...p, tipo: e.target.value }))
                  }
                  className="w-full p-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">-- Seleccionar --</option>
                  {TIPOS_SOLICITUD.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">
                  Descripción de la solicitud *
                </label>
                <textarea
                  value={habeasForm.descripcion}
                  onChange={(e) =>
                    setHabeasForm((p) => ({
                      ...p,
                      descripcion: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full p-2 border rounded-lg text-sm resize-none"
                  placeholder="Describa qué datos desea conocer, corregir o eliminar..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">
                  Fecha de recepción
                </label>
                <input
                  type="date"
                  value={habeasForm.fecha}
                  onChange={(e) =>
                    setHabeasForm((p) => ({ ...p, fecha: e.target.value }))
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              <button
                onClick={handleRegistrarSolicitud}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl"
              >
                📥 Registrar solicitud
              </button>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10px] text-amber-800 space-y-1">
                <p className="font-black">⚖️ Plazos legales (Ley 1581/2012):</p>
                <p>
                  • <strong>Consultas:</strong> 10 días hábiles (Art. 14)
                </p>
                <p>
                  • <strong>Reclamos:</strong> 15 días hábiles (Art. 15)
                </p>
                <p>
                  • <strong>Incumplimiento:</strong> denuncia ante SIC
                  (Superintendencia de Industria y Comercio)
                </p>
              </div>
            </div>

            {/* PANEL DERECHO: Política de privacidad resumida */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h3 className="text-sm font-black text-gray-800">
                📜 Política de tratamiento de datos personales
              </h3>
              <div className="text-[11px] text-gray-700 space-y-2 leading-relaxed">
                <p>
                  <span className="font-black text-gray-900">Responsable:</span>{" "}
                  El profesional médico registrado en el sistema (Ley 1581/2012
                  Art. 3).
                </p>
                <p>
                  <span className="font-black text-gray-900">
                    Datos tratados:
                  </span>{" "}
                  Identificación personal, datos de salud (historia clínica
                  ocupacional), datos laborales, resultados de paraclínicos.
                </p>
                <p>
                  <span className="font-black text-gray-900">Finalidad:</span>{" "}
                  Evaluaciones médicas ocupacionales, certificados de aptitud
                  laboral, vigilancia epidemiológica, facturación de servicios
                  médicos.
                </p>
                <p>
                  <span className="font-black text-gray-900">Base legal:</span>{" "}
                  Art. 10 Ley 1581/2012 - datos de salud tratados por
                  profesional de la salud vinculado con el titular.
                </p>
                <p>
                  <span className="font-black text-gray-900">
                    Transferencia:
                  </span>{" "}
                  Solo a la empresa empleadora del trabajador (certificado de
                  aptitud) y a autoridades de salud pública cuando la ley lo
                  exija.
                </p>
                <p>
                  <span className="font-black text-gray-900">Retención:</span>{" "}
                  20 años según Res. 1995/1999 Art. 15. Después: destrucción
                  certificada o anonimización.
                </p>
                <p>
                  <span className="font-black text-gray-900">Seguridad:</span>{" "}
                  Datos almacenados con cifrado en Supabase. Acceso restringido
                  por credenciales del médico.
                </p>
                <p>
                  <span className="font-black text-gray-900">Derechos:</span>{" "}
                  Conocer · Actualizar · Rectificar · Suprimir · Revocar · Queja
                  ante SIC (canalizar a través de este módulo).
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-[10px] text-gray-500 font-bold">
                  📧 Canal de contacto para ejercer derechos
                </p>
                <p className="text-[11px] text-gray-700 mt-1">
                  {activeDoctorData?.email ||
                    "Registre su email en Configuración de Usuario"}
                </p>
              </div>
            </div>
          </div>

          {/* Historial de solicitudes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-indigo-50 flex items-center justify-between">
              <p className="text-sm font-black text-indigo-800">
                Historial de solicitudes
              </p>
              <p className="text-xs text-gray-400">
                {habeasRequests.length} solicitud
                {habeasRequests.length !== 1 ? "es" : ""}
              </p>
            </div>
            {habeasRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">🔐</p>
                <p className="text-sm font-bold">Sin solicitudes registradas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {habeasRequests.map((r) => {
                  const dias =
                    r.estado === "Recibida" || r.estado === "En trámite"
                      ? diasRestantes(r.creadaEn)
                      : null;
                  return (
                    <div key={r.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800">
                            {r.nombre}{" "}
                            <span className="font-normal text-gray-400">
                              · {r.documento}
                            </span>
                          </p>
                          <p className="text-[10px] text-indigo-600 font-bold mt-0.5">
                            {TIPOS_SOLICITUD.find((t) => t.valor === r.tipo)
                              ?.etiqueta || r.tipo}
                          </p>
                          <p className="text-[10px] text-gray-600 mt-1 line-clamp-2">
                            {r.descripcion}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            📅 {r.fecha} · Registrada por {r.creadaPor}
                          </p>
                          {dias !== null && (
                            <p
                              className={`text-[10px] font-black mt-1 ${
                                dias < 3
                                  ? "text-red-600"
                                  : dias < 7
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {dias > 0
                                ? `⏰ ${dias} días hábiles para responder`
                                : "🚨 Plazo vencido - responder urgente"}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <span
                            className={`text-[10px] font-black px-2 py-1 rounded-full text-center ${
                              r.estado === "Recibida"
                                ? "bg-amber-100 text-amber-700"
                                : r.estado === "En trámite"
                                ? "bg-blue-100 text-blue-700"
                                : r.estado === "Respondida"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {r.estado}
                          </span>
                          <select
                            value={r.estado}
                            onChange={(e) =>
                              handleCambiarEstado(r.id, e.target.value)
                            }
                            className="text-[9px] p-1 border rounded bg-white"
                          >
                            {ESTADOS.map((e) => (
                              <option key={e}>{e}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );

};

export default HabeasData;
