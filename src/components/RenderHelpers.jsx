import React from 'react';
import {
  BrainCircuit, ClipboardList, Cloud, Download, FileCheck, FileSignature, HardDrive, Lock, LogOut, MessageSquare, Plus, Printer, Save, Unlock, UploadCloud, Wifi, WifiOff
} from "lucide-react";

// ─── Render Helpers Factory ──────────────────────────────────────────────────
// Returns all render helper functions bound to the provided state
export function createRenderHelpers(state) {
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
  goBack
  } = state;

  // ─── renderNavbar ───────────────────────────────────────────────────────────────
  const renderNavbar = () => {
    const _aiBg =
      aiStatus === "ok"
        ? "bg-green-50 text-green-700 border-green-200"
        : aiStatus === "error"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-gray-50 text-gray-600 border-gray-200";
    const _syncBg =
      syncStatus === "ok"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : syncStatus === "syncing" || syncStatus === "loading"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-red-50 text-red-500 border-red-200";
    const _syncTxt =
      syncStatus === "ok"
        ? "Nube ✓"
        : syncStatus === "syncing"
        ? "Sync..."
        : syncStatus === "loading"
        ? "Cargando..."
        : "Sin nube";
    const _syncTitle =
      syncStatus === "ok"
        ? "Sincronizado"
        : syncStatus === "syncing"
        ? "Sincronizando..."
        : syncStatus === "loading"
        ? "Cargando datos..."
        : syncStatus === "error"
        ? "Error de sincronización"
        : "Listo";
    const _agCls =
      view === "agenda"
        ? "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
        : "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100";
    const _agN = [
      "administrador",
      "secretaria",
      "medico",
      "admin_empresa",
    ].includes(currentUser?.role)
      ? agendados.filter(
          (a) =>
            a.fecha === new Date().toISOString().split("T")[0] &&
            a.estado === "espera" &&
            (currentUser?.role !== "medico" || a.medicoId === currentUser?.user)
        ).length
      : 0;
    const _noLeidos = mensajes.filter(
      (m) => m.destinatarios?.includes(currentUser?.user) && !m.leido
    ).length;
    const _tabCls = (k) =>
      activeTab === k
        ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white"
        : "px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100";
    const _tabBlue = (k) =>
      activeTab === k
        ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white"
        : "px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100";
    return (
      <nav className="bg-white border-b border-gray-100 px-4 py-2.5 shadow-sm no-print sticky top-0 z-50 flex justify-between items-center">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => goTo("dashboard")}
        >
          <BrandLogo data={activeDoctorData} />
          {/* ── IPS: nombre de empresa en navbar ── */}
          {currentUser?.empresaId &&
            (() => {
              const _navEmp = companies.find(
                (c) => c.id === currentUser.empresaId
              );
              return _navEmp ? (
                <span className="text-[10px] font-black text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg ml-1 hidden sm:inline-block">
                  🏥{" "}
                  {_navEmp.nombre?.length > 25
                    ? _navEmp.nombre.substring(0, 25) + "…"
                    : _navEmp.nombre}
                </span>
              ) : null;
            })()}
        </div>
        {/* ── Bloque 1: Datos médico activo en header ── */}
        {currentUser && activeDoctorData?.nombre && (
          <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-2">
            {activeSignature ? (
              <img
                src={activeSignature}
                alt="Firma"
                className="h-7 w-auto max-w-[60px] object-contain opacity-80"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-black">
                {(activeDoctorData.nombre || "?")[0]}
              </div>
            )}
            <div className="leading-tight">
              <p className="text-[10px] font-black text-gray-800 truncate max-w-[140px]">{activeDoctorData.nombre}</p>
              {activeDoctorData.titulo && (
                <p className="text-[9px] text-teal-600 truncate max-w-[140px]">{activeDoctorData.titulo}</p>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setShowAIConfig(true)}
            className={
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition " +
              _aiBg
            }
          >
            {aiStatus === "ok" ? (
              <Wifi className="w-3 h-3" />
            ) : aiStatus === "error" ? (
              <WifiOff className="w-3 h-3" />
            ) : (
              <BrainCircuit className="w-3 h-3" />
            )}
            {" ⚙️ IA"}
          </button>
          {view === "historia" && (
            <>
              <button
                onClick={() => data.estadoHistoria === "Cerrada" ? goTo("dashboard") : goBack()}
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 flex items-center gap-1 border border-gray-200 no-print"
              >
                ← Volver
              </button>
              <div className="w-px h-6 bg-gray-200 no-print" />
              {data.estadoHistoria === "Cerrada" && (
                <div className="hidden no-print bg-red-50 border border-red-300 rounded-lg px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold text-red-700">
                  <Lock className="w-3 h-3" /> Historia Cerrada ·{" "}
                  {data.firmaDigital?.codigoQR || data.codigoVerificacion || ""}
                </div>
              )}
              {data.estadoHistoria === "Cerrada" ? (
                <div className="flex items-center gap-1">
                  {/* Botón principal: Evolución */}
                  <button
                    onClick={() => {
                      setEvolucionForm({
                        texto: "",
                        nuevoConcept: "",
                        fecha: new Date().toISOString().split("T")[0],
                        codigoEvolucion:
                          "EV-" +
                          Date.now().toString(36).toUpperCase().slice(-6),
                        activeEvTab: "nota",
                        motivoConsulta: "",
                        diagnosticos: [
                          { cie10: "", descripcion: "", tipo: "Principal" },
                        ],
                        planConducta: "",
                        recomendaciones: "",
                        formulaMedicamentos: [],
                        derivaciones: [],
                        incapacidad: {
                          aplica: false,
                          dias: 0,
                          origen: "Común",
                          diagnostico: "",
                          desde: "",
                          hasta: "",
                        },
                      });
                      setShowEvolucionModal(true);
                    }}
                    className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 flex items-center gap-1"
                  >
                    <ClipboardList className="w-3 h-3" /> Evolución
                  </button>
                                <button
                onClick={() => {
                  setEvolucionForm((p) => ({ ...p, activeEvTab: "concepto", nuevoConcept: p.nuevoConcept || "", recomendaciones: p.recomendaciones || "" }));
                  setShowEvolucionModal(true);
                }}
                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow hover:bg-emerald-700"
              >
                📄 Nuevo Certificado
              </button>
                  {/* Mini-botón admin: Nota Aclaratoria / Reapertura */}
                  {(_isAdmin(currentUser?.role) ||
                    currentUser?.role === "admin_empresa") && (
                    <button
                      onClick={handleEditHistory}
                      className="bg-yellow-500 text-white px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-600 flex items-center gap-1"
                      title="Admin: Nota Aclaratoria / Reapertura"
                    >
                      <Unlock className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleCloseHistory}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Firma y Cerrar
                </button>
              )}
              <div className="w-px h-6 bg-gray-200" />
              {dataType === "ocupacional" && (
                <>
                  <button
                    onClick={() => setActiveTab("form")}
                    className={_tabCls("form")}
                  >
                    HC Ocup.
                  </button>
                  <button
                    onClick={() => setActiveTab("certificado")}
                    className={_tabCls("certificado")}
                  >
                    Certificado
                  </button>
                  <button
                    onClick={() => setActiveTab("incapacidad")}
                    className={_tabCls("incapacidad")}
                  >
                    Incapacidad
                  </button>
                  <button
                    onClick={() => setActiveTab("formulaTab")}
                    className={_tabBlue("formulaTab")}
                  >
                    Formula/Deriv.
                  </button>
                  <button
                    onClick={() => setActiveTab("solicitudExamenes")}
                    className={_tabBlue("solicitudExamenes")}
                  >
                    🔬 Exámenes
                  </button>
                  <button
                    onClick={() => setActiveTab("adjuntos")}
                    className={_tabBlue("adjuntos")}
                  >
                    📎 Adjuntos
                  </button>
                  {data.enfasisExamen === "ALIMENTOS" && (
                    <button
                      onClick={() => setActiveTab("carnetAlimentos")}
                      className={_tabBlue("carnetAlimentos")}
                    >
                      🍽️ Carné
                    </button>
                  )}
                </>
              )}
              {dataType === "general" && (
                <>
                  <button
                    onClick={() => setActiveTab("formGeneral")}
                    className={_tabBlue("formGeneral")}
                  >
                    HC General
                  </button>
                  <button
                    onClick={() => setActiveTab("ordenMedica")}
                    className={_tabBlue("ordenMedica")}
                  >
                    Orden/Formula
                  </button>
                  <button
                    onClick={() => setActiveTab("solicitudExamenes")}
                    className={_tabBlue("solicitudExamenes")}
                  >
                    Examenes
                  </button>
                  <button
                    onClick={() => setActiveTab("incapacidadGeneral")}
                    className={_tabBlue("incapacidadGeneral")}
                  >
                    Incapacidad
                  </button>
                </>
              )}
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={() => handlePrint(data.nombres)}
                className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Printer className="w-3 h-3" /> PDF
              </button>

              {/* ── Descargar Todo: Certificado + Incapacidad + Fórmula/Derivación ── */}
              {dataType === "ocupacional" && (
                <button
                  onClick={() => {
                    const docData = activeDoctorData || {};
                    const sig = activeSignature || "";
                    const _esc = (v) =>
                      String(v || "")
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;");

                    // ── Estilos compartidos ────────────────────────────────────────────
                    const sharedCss = `
                    *{margin:0;padding:0;box-sizing:border-box;}
                    body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5pt;color:#111;}
                    .page{padding:14mm 16mm;min-height:100vh;}
                    .page-break{page-break-before:always;}
                    .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid var(--accent,#065f46);padding-bottom:10px;margin-bottom:14px;}
                    .hdr-left .doc-name{font-size:11pt;font-weight:900;color:var(--accent,#065f46);}
                    .hdr-left p,.hdr-right p{font-size:8pt;color:#555;margin-top:1px;}
                    .hdr-right{text-align:right;}
                    .doc-title{font-size:13pt;font-weight:900;text-transform:uppercase;color:var(--accent,#065f46);}
                    table{width:100%;border-collapse:collapse;margin:8px 0;}
                    td,th{border:1px solid #ccc;padding:6px 10px;font-size:9pt;}
                    th{font-weight:900;text-align:left;}
                    .sig-row{margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;}
                    .sig-block{text-align:center;}
                    .sig-line{border-top:1.5px solid #333;padding-top:4px;font-size:8pt;font-weight:700;margin-top:50px;width:200px;}
                    .dl-bar{position:fixed;top:0;left:0;right:0;background:#065f46;color:#fff;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.3);}
                    .dl-bar .title{flex:1;font-size:9.5pt;font-weight:700;}
                    .dl-bar button{border:none;padding:6px 16px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
                    .btn-print{background:#10b981;color:#fff;} .btn-close{background:#ef4444;color:#fff;}
                    .toc{background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:10px 14px;margin-bottom:16px;}
                    .toc p{font-size:8.5pt;color:#166534;margin:2px 0;}
                    .toc .toc-title{font-size:10pt;font-weight:900;color:#14532d;margin-bottom:6px;}
                    .badge{display:inline-block;padding:3px 10px;border-radius:4px;font-size:11pt;font-weight:900;color:#fff;}
                    .alerta{background:#fef9c3;border:1px solid #fde047;padding:7px 12px;border-radius:6px;font-size:8.5pt;color:#713f12;margin:8px 0;}
                    .consent{margin-top:8px;font-size:7pt;color:#9ca3af;border-top:1px dashed #e5e7eb;padding-top:6px;}
                    @page{size:letter portrait;margin:0;}
                    @media print{.dl-bar{display:none!important;}.page{padding:12mm 15mm;}}
                  `;

                    // ── 1. CERTIFICADO DE APTITUD ──────────────────────────────────────
                    const cLow = (data.conceptoAptitud || "").toLowerCase();
                    const aptBg = cLow.includes("no apto")
                      ? "#7f1d1d"
                      : cLow.includes("condic")
                      ? "#78350f"
                      : cLow.includes("apto")
                      ? "#14532d"
                      : "#1e3a5f";
                    const fmtTxt = (txt) => {
                      const s = Array.isArray(txt)
                        ? txt.join("\n")
                        : String(txt || "");
                      if (!s.trim()) return "";
                      const lines = s
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean);
                      if (
                        lines.some(
                          (l) =>
                            /^[•*\-]/.test(l) ||
                            /^\*\*/.test(l) ||
                            /^\d+\./.test(l)
                        )
                      ) {
                        return (
                          '<ul style="margin:5px 0;padding-left:18px;">' +
                          lines
                            .map(
                              (l) =>
                                '<li style="margin-bottom:2px;font-size:9.5pt;">' +
                                l
                                  .replace(/^[•*\-]+\s*/, "")
                                  .replace(/^\d+\.\s*/, "")
                                  .replace(
                                    /\*\*(.+?)\*\*/g,
                                    "<strong>$1</strong>"
                                  ) +
                                "</li>"
                            )
                            .join("") +
                          "</ul>"
                        );
                      }
                      return (
                        '<p style="font-size:9.5pt;margin-top:4px;line-height:1.5;">' +
                        s.replace(/\n/g, "<br/>") +
                        "</p>"
                      );
                    };
                    const sigHtml = sig
                      ? `<img src="${sig}" style="max-height:68px;display:block;margin:0 auto 4px;" alt="Firma"/>`
                      : '<div style="height:60px;"></div>';
                    const restricTxt = Array.isArray(data.analisisRestricciones)
                      ? data.analisisRestricciones.join("\n")
                      : data.analisisRestricciones || data.restricciones || "";
                    const recomTxt = [
                      data.recomendacionesOcupacionales,
                      data.recomendacionesMedicas,
                      data.recomendaciones,
                    ]
                      .filter(Boolean)
                      .join("\n");
                    const certSec = `
                    <div class="page" style="--accent:#065f46;">
                      <div class="hdr">
                        <div class="hdr-left">
                          <div class="doc-name">${_esc(
                            docData.nombre || "MÉDICO OCUPACIONAL"
                          )}</div>
                          <p>${_esc(
                            docData.titulo ||
                              "Médico Especialista en Salud Ocupacional"
                          )}</p>
                          <p>Lic. ${_esc(docData.licencia || "--")} · ${_esc(
                      docData.ciudad || "Popayán"
                    )}</p>
                        </div>
                        <div class="hdr-right">
                          <p>Res. 1843/2025</p>
                          <p>Generado: ${new Date().toLocaleDateString(
                            "es-CO"
                          )}</p>
                        </div>
                      </div>
                      <h2 style="text-align:center;font-size:14pt;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:8px 0 4px;">Certificado de Aptitud Laboral</h2>
                      <p style="text-align:center;font-size:8.5pt;color:#6b7280;margin-bottom:10px;">Conforme a la Resolución 1843 de 2025</p>
                      <p style="font-size:9.5pt;margin-bottom:10px;line-height:1.5;">El suscrito Médico Especialista en Salud Ocupacional certifica que realizó la evaluación de tipo <strong>${_esc(
                        data.tipoExamen || "--"
                      )}</strong> con énfasis <strong>${_esc(
                      data.enfasisExamen || "GENERAL"
                    )}</strong> a:</p>
                      <table style="margin-bottom:10px;">
                        <tr><th style="background:#d1fae5;width:20%;">Nombre</th><td>${_esc(
                          data.nombres
                        )}</td><th style="background:#d1fae5;width:20%;">Documento</th><td>${_esc(
                      data.docTipo || "CC"
                    )} ${_esc(data.docNumero)}</td></tr>
                        <tr><th style="background:#d1fae5;">Cargo</th><td>${_esc(
                          data.cargo
                        )}</td><th style="background:#d1fae5;">Empresa</th><td>${_esc(
                      data.empresaNombre || data.empresa || "PARTICULAR"
                    )}</td></tr>
                        <tr><th style="background:#d1fae5;">Fecha</th><td>${_esc(
                          data.fechaExamen
                        )}</td><th style="background:#d1fae5;">Vigencia</th><td>${_esc(
                      data.vigencia || "1 año"
                    )}</td></tr>
                      </table>
                      <p style="text-align:center;font-size:8pt;font-weight:900;text-transform:uppercase;color:#6b7280;margin:6px 0 4px;">Concepto Emitido</p>
                      <div style="background:${aptBg};border-radius:8px;padding:14px;text-align:center;margin-bottom:10px;">
                        <div style="font-size:14pt;font-weight:900;color:#fff;text-transform:uppercase;">${_esc(
                          data.conceptoAptitud || "PENDIENTE DE CONCEPTO"
                        )}</div>
                        <div style="font-size:8pt;color:#e5e7eb;margin-top:4px;">Concepto emitido bajo Res. 1843 de 2025, Art. 20</div>
                      </div>
                      ${
                        recomTxt
                          ? '<div style="margin-bottom:10px;"><p style="font-size:9pt;font-weight:900;text-transform:uppercase;border-bottom:2px solid #d1d5db;padding-bottom:3px;margin-bottom:6px;">Recomendaciones</p>' +
                            fmtTxt(recomTxt) +
                            "</div>"
                          : ""
                      }
                      ${
                        restricTxt
                          ? '<div style="margin-bottom:10px;"><p style="font-size:9pt;font-weight:900;text-transform:uppercase;border-bottom:2px solid #d1d5db;padding-bottom:3px;margin-bottom:6px;">Restricciones Laborales</p>' +
                            fmtTxt(restricTxt) +
                            "</div>"
                          : ""
                      }
                      <div class="alerta">⚠ <strong>Confidencialidad:</strong> El diagnóstico clínico no es entregado al empleador (Art. 16 Res. 1843/2025).</div>
                      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:20px;align-items:end;border-top:2px solid #d1d5db;padding-top:12px;margin-top:4px;">
                        <div style="text-align:center;"><div style="height:50px;"></div><div style="border-top:1px solid #333;width:180px;margin:0 auto;padding-top:4px;font-size:8pt;font-weight:700;">Firma del Trabajador<br/>${_esc(
                          data.docTipo || "CC"
                        )}: ${_esc(data.docNumero)}</div></div>
                        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:8px 16px;text-align:center;"><p style="font-size:7.5pt;font-weight:900;color:#6b7280;text-transform:uppercase;">Código Verificación</p><p style="font-size:13pt;font-family:monospace;font-weight:900;letter-spacing:3px;color:#065f46;">${_esc(
                          data.codigoVerificacion || "--"
                        )}</p></div>
                        <div style="text-align:center;">${sigHtml}<div style="border-top:1px solid #333;width:180px;margin:0 auto;padding-top:4px;font-size:8pt;font-weight:700;">${_esc(
                      docData.nombre || ""
                    )}<br/>${_esc(docData.titulo || "")}<br/>Lic: ${_esc(
                      docData.licencia || ""
                    )}${
                      docData.celular
                        ? "<br/>Cel: " + _esc(docData.celular)
                        : ""
                    }${
                      docData.email ? "<br/>" + _esc(docData.email) : ""
                    }</div></div>
                      </div>
                      <div class="consent">El suscrito Médico Especialista certifica la evaluación realizada. Res. 1843/2025 · Ley 1581/2012 · Ley 23/1981.</div>
                    </div>`;

                    // ── 2. CERTIFICADO DE INCAPACIDAD ──────────────────────────────────
                    const inc = data.incapacidad || {};
                    const diasInc =
                      inc.dias ||
                      (() => {
                        if (!inc.desde || !inc.hasta) return 0;
                        return (
                          Math.ceil(
                            Math.abs(
                              new Date(inc.hasta) - new Date(inc.desde)
                            ) /
                              (1000 * 60 * 60 * 24)
                          ) + 1
                        );
                      })();
                    const incapSec = `
                    <div class="page page-break" style="--accent:#dc2626;">
                      <div class="hdr">
                        <div class="hdr-left">
                          <div class="doc-name">${_esc(
                            docData.nombre || "MÉDICO OCUPACIONAL"
                          )}</div>
                          <p>${_esc(docData.titulo || "")} · Lic: ${_esc(
                      docData.licencia || ""
                    )}</p>
                          <p>Tel: ${_esc(docData.celular || "")} · ${_esc(
                      docData.ciudad || ""
                    )}</p>
                        </div>
                        <div class="hdr-right">
                          <div class="doc-title" style="color:#dc2626;">Certificado de Incapacidad Médica</div>
                          <p>Expedición: ${new Date().toLocaleDateString(
                            "es-CO"
                          )}</p>
                          <p style="font-size:7.5pt;color:#888;">Res. 1995/1999 · Ley 100/1993 Art. 227 · Dec. 2943/2013</p>
                        </div>
                      </div>
                      <table>
                        <tr><th style="background:#fee2e2;">Paciente</th><td>${_esc(
                          data.nombres
                        )}</td><th style="background:#fee2e2;">Documento</th><td>${_esc(
                      data.docTipo || "CC"
                    )} ${_esc(data.docNumero)}</td></tr>
                        <tr><th style="background:#fee2e2;">EPS / Aseguradora</th><td>${_esc(
                          data.eps || "--"
                        )}</td><th style="background:#fee2e2;">Género</th><td>${_esc(
                      data.genero || "--"
                    )}</td></tr>
                        <tr><th style="background:#fee2e2;">Diagnóstico (CIE-10)</th><td colspan="3">${_esc(
                          inc.diagnosticoCIE ||
                            inc.diagnostico ||
                            data.diagnosticoPrincipal ||
                            "--"
                        )}</td></tr>
                        <tr><th style="background:#fee2e2;">Origen</th><td>${_esc(
                          inc.origen || "Enfermedad General"
                        )}</td><th style="background:#fee2e2;">Prórroga N°</th><td>${_esc(
                      inc.prorroga || "N/A"
                    )}</td></tr>
                        <tr><th style="background:#fee2e2;">Fecha inicio</th><td>${_esc(
                          inc.desde || "--"
                        )}</td><th style="background:#fee2e2;">Fecha fin</th><td>${_esc(
                      inc.hasta || "--"
                    )}</td></tr>
                        <tr>
                          <th colspan="2" style="background:#dc2626;color:white;text-align:center;font-size:13pt;padding:10px;">DÍAS DE INCAPACIDAD: ${diasInc}</th>
                          <th colspan="2" style="text-align:center;font-size:11pt;padding:10px;">${_esc(
                            inc.motivo || "Incapacidad Médica"
                          )}</th>
                        </tr>
                        <tr><th style="background:#fee2e2;">Restricciones</th><td colspan="3">${_esc(
                          inc.restricciones ||
                            "Reposo relativo. Evitar esfuerzo físico intenso."
                        )}</td></tr>
                        <tr><th style="background:#fee2e2;">Recomendaciones</th><td colspan="3">${_esc(
                          inc.recoIncapacidad ||
                            "Consultar nuevamente si no hay mejoría."
                        )}</td></tr>
                      </table>
                      <p style="font-size:7.5pt;color:#888;margin-top:8px;">Incapacidad expedida conforme Ley 100/1993 Art. 227, Decreto 2943/2013.</p>
                      <div class="sig-row">
                        <div class="sig-block"><div class="sig-line">Firma Paciente / Responsable</div></div>
                        <div class="sig-block">${sigHtml}<div class="sig-line">${_esc(
                      docData.nombre || ""
                    )}<br/>${_esc(docData.titulo || "")} · Lic: ${_esc(
                      docData.licencia || ""
                    )}</div></div>
                      </div>
                    </div>`;

                    // ── 3. FÓRMULA MÉDICA ──────────────────────────────────────────────
                    const meds = data.formulaMedicamentos || [];
                    const medRows =
                      meds.length > 0
                        ? meds
                            .map(
                              (m) => `<tr>
                        <td>${_esc(m.nombre)}</td>
                        <td>${_esc(m.presentacion)}</td>
                        <td>${_esc(m.dosis)}</td>
                        <td>${_esc(m.frecuencia)}</td>
                        <td>${_esc(m.duracion)}</td>
                        <td>${_esc(m.indicaciones || "")}</td>
                      </tr>`
                            )
                            .join("")
                        : `<tr><td colspan="6" style="text-align:center;color:#9ca3af;font-style:italic;padding:14px;">Sin medicamentos formulados</td></tr>`;
                    const formulaSec = `
                    <div class="page page-break" style="--accent:#7c3aed;">
                      <div class="hdr">
                        <div class="hdr-left">
                          <div class="doc-name">${_esc(
                            docData.nombre || "MÉDICO OCUPACIONAL"
                          )}</div>
                          <p>${_esc(docData.titulo || "")} · Lic: ${_esc(
                      docData.licencia || ""
                    )}</p>
                          <p>Tel: ${_esc(docData.celular || "")} · ${_esc(
                      docData.ciudad || ""
                    )}</p>
                        </div>
                        <div class="hdr-right">
                          <div class="doc-title" style="color:#7c3aed;">Fórmula Médica</div>
                          <p>Fecha: ${_esc(
                            data.fechaExamen ||
                              new Date().toLocaleDateString("es-CO")
                          )}</p>
                        </div>
                      </div>
                      <p style="margin-bottom:10px;font-size:9.5pt;">Paciente: <strong>${_esc(
                        data.nombres
                      )}</strong> &nbsp;·&nbsp; ${_esc(
                      data.docTipo || "CC"
                    )} ${_esc(data.docNumero)} &nbsp;·&nbsp; ${_esc(
                      String(data.edad || "--")
                    )} años &nbsp;·&nbsp; EPS: ${_esc(data.eps || "--")}</p>
                      <table>
                        <thead><tr style="background:#ede9fe;">
                          <th>Medicamento</th><th>Presentación</th><th>Dosis</th><th>Frecuencia</th><th>Duración</th><th>Indicaciones</th>
                        </tr></thead>
                        <tbody>${medRows}</tbody>
                      </table>
                      ${
                        data.formulaMedica
                          ? '<p style="font-size:9pt;margin-top:8px;"><strong>Indicaciones adicionales:</strong> ' +
                            _esc(data.formulaMedica) +
                            "</p>"
                          : ""
                      }
                      <div class="sig-row" style="margin-top:40px;">
                        <div></div>
                        <div class="sig-block">${sigHtml}<div class="sig-line">${_esc(
                      docData.nombre || ""
                    )}<br/>${_esc(docData.titulo || "")}<br/>Lic: ${_esc(
                      docData.licencia || ""
                    )}</div></div>
                      </div>
                    </div>`;

                    // ── 4. DERIVACIONES / INTERCONSULTAS ──────────────────────────────
                    const derivs = data.derivaciones || [];
                    const derivRows =
                      derivs.length > 0
                        ? derivs
                            .map(
                              (d) => `<tr>
                        <td>${_esc(d.especialidad || "--")}</td>
                        <td>${_esc(d.motivo || "--")}</td>
                        <td>${_esc(d.urgencia || "Electiva")}</td>
                      </tr>`
                            )
                            .join("")
                        : `<tr><td colspan="3" style="text-align:center;color:#9ca3af;font-style:italic;padding:14px;">Sin derivaciones registradas</td></tr>`;
                    const derivSec = `
                    <div class="page page-break" style="--accent:#065f46;">
                      <div class="hdr">
                        <div class="hdr-left">
                          <div class="doc-name">${_esc(
                            docData.nombre || "MÉDICO OCUPACIONAL"
                          )}</div>
                          <p>${_esc(docData.titulo || "")} · Lic: ${_esc(
                      docData.licencia || ""
                    )}</p>
                          <p>Tel: ${_esc(docData.celular || "")} · ${_esc(
                      docData.ciudad || ""
                    )}</p>
                        </div>
                        <div class="hdr-right">
                          <div class="doc-title">Fórmula de Derivación / Interconsulta</div>
                          <p>Fecha: ${_esc(
                            data.fechaExamen ||
                              new Date().toLocaleDateString("es-CO")
                          )}</p>
                        </div>
                      </div>
                      <p style="margin-bottom:10px;font-size:9.5pt;">Remito a <strong>${_esc(
                        data.nombres
                      )}</strong> (${_esc(data.docTipo || "CC")} ${_esc(
                      data.docNumero
                    )}) para valoración especializada:</p>
                      <table>
                        <thead><tr style="background:#d1fae5;">
                          <th>Especialidad / Servicio</th><th>Motivo de consulta / Hallazgo clínico</th><th>Prioridad</th>
                        </tr></thead>
                        <tbody>${derivRows}</tbody>
                      </table>
                      ${
                        data.otrasObservaciones
                          ? '<p style="font-size:9pt;margin-top:10px;"><strong>Observaciones:</strong> ' +
                            _esc(data.otrasObservaciones) +
                            "</p>"
                          : ""
                      }
                      <div class="sig-row" style="margin-top:40px;">
                        <div></div>
                        <div class="sig-block">${sigHtml}<div class="sig-line">${_esc(
                      docData.nombre || ""
                    )}<br/>${_esc(docData.titulo || "")}<br/>Lic: ${_esc(
                      docData.licencia || ""
                    )}</div></div>
                      </div>
                    </div>`;

                    // ── Ensamblar ventana ──────────────────────────────────────────────
                    const w = window.open(
                      "",
                      "_blank",
                      "width=950,height=1200"
                    );
                    if (!w) {
                      showAlert(
                        "El navegador bloqueó la ventana emergente. Permita los popups e intente de nuevo."
                      );
                      return;
                    }
                    w.document
                      .write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
                    <title>Documentos - ${_esc(data.nombres)} · ${_esc(
                      data.fechaExamen || ""
                    )}</title>
                    <style>${sharedCss}</style>
                    </head><body>
                    <div class="dl-bar">
                      <span class="title">📄 4 documentos - ${_esc(
                        data.nombres
                      )} · ${_esc(data.fechaExamen || "")}</span>
                      <button class="btn-print" onclick="window.print()">📥 Guardar / Imprimir PDF</button>
                      <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
                    </div>
                    ${certSec}${incapSec}${formulaSec}${derivSec}
                    </body></html>`);
                    w.document.close();
                    w.focus();
                  }}
                  className="bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 no-print hover:bg-cyan-800"
                  title="Descargar todos los documentos: certificado + incapacidad + fórmula + derivaciones"
                >
                  <Download className="w-3 h-3" /> Todo
                </button>
              )}

              {dataType === "ocupacional" &&
                data.estadoHistoria === "Cerrada" && (
                  <button
                    onClick={async () => {
                      try {
                        showAlert("⏳ Generando paquete SHA-256...");
                        const pkg = await _generarPaqueteRetencion(
                          data,
                          activeDoctorData
                        );
                        const blob = new Blob([JSON.stringify(pkg, null, 2)], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download =
                          "HC_SHA256_" +
                          (data.docNumero || "").replace(/\s+/g, "_") +
                          "_" +
                          (data.fechaExamen || "sin-fecha") +
                          ".json";
                        a.click();
                        URL.revokeObjectURL(url);
                        const entrada = {
                          id: Date.now(),
                          fecha: new Date().toISOString(),
                          usuario: currentUser?.user,
                          accion: "PRESERVACION_CERTIFICADA",
                          paciente: data.nombres,
                          hash: pkg.hashSHA256.substring(0, 16),
                        };
                        setAuditLog((prev) => {
                          const n = [entrada, ...prev].slice(0, 500);
                          _sync("siso_audit_log", JSON.stringify(n));
                          return n;
                        });
                        showAlert(
                          "✅ HC preservada.\nHash SHA-256: " +
                            pkg.hashSHA256.substring(0, 16) +
                            "...\nVigente hasta: " +
                            pkg.metadata.anioVencimientoLegal
                        );
                      } catch (e) {
                        showAlert("Error: " + e.message);
                      }
                    }}
                    className="bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 no-print hover:bg-purple-800"
                    title="Preservar HC (Res.1995/1999 - 20 años)"
                  >
                    <HardDrive className="w-3 h-3" /> 20 años
                  </button>
                )}
              <button
                onClick={() => {
                  setNotifData(data);
                  setShowNotifModal(true);
                }}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 no-print hover:bg-green-700"
                title="Notificar resultado al paciente (Res. 1552/2013)"
              >
                📲 Notificar
              </button>
              {/* FASE 2: Indicador HC de otro médico (modo lectura) */}
              {currentUser?.role === "medico" &&
                data._medicoId &&
                data._medicoId !== currentUser?.user && (
                  <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                    👁 Lectura — HC del Dr.{" "}
                    {usersList.find((u) => u.user === data._medicoId)?.name ||
                      data._medicoId}
                  </span>
                )}
              {isHcOwner(data) && (
                <button
                  onClick={handleSavePatient}
                  className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Save className="w-3 h-3" /> Guardar
                </button>
              )}
            </>
          )}
          {view === "dashboard" && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".json"
                onChange={handleImportData}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="text-xs flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-bold hover:bg-blue-100"
              >
                <UploadCloud className="w-3 h-3 mr-1" /> Importar
              </button>
              <button
                onClick={handleExportData}
                className="text-xs flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold hover:bg-emerald-100"
              >
                <HardDrive className="w-3 h-3 mr-1" /> Backup
              </button>
              {/* NORMATIVO: Res. 2275/2023 - Exportación RIPS JSON */}
              <button
                onClick={() => {
                  try {
                    const pats = patientsList.filter(
                      (p) => p.fechaExamen && !p._archivado
                    );
                    if (!pats.length) {
                      showAlert(
                        "Sin pacientes con fecha de examen registrada."
                      );
                      return;
                    }
                    // B-25: Validar antes de generar
                    const ripsErrs = validarRIPSLote(pats);
                    if (ripsErrs.length > 0) {
                      const msg = `⚠️ ${
                        ripsErrs.length
                      } paciente(s) con datos incompletos para RIPS:\n\n${ripsErrs
                        .slice(0, 5)
                        .join("\n")}${
                        ripsErrs.length > 5 ? "\n...y más" : ""
                      }\n\n¿Generar RIPS de todas formas?`;
                      if (!window.confirm(msg)) return;
                    }
                    const rips = _generarRIPSJson(
                      pats,
                      activeDoctorData,
                      new Date().toISOString().substring(0, 7)
                    );
                    const jsonStr = JSON.stringify(rips, null, 2);
                    const filename = `RIPS_SISO_${new Date()
                      .toISOString()
                      .substring(0, 7)}.json`;
                    setRipsModalData({ json: jsonStr, filename });
                  } catch (e) {
                    showAlert("Error al generar RIPS: " + e.message);
                  }
                }}
                className="text-xs flex items-center bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-200 font-bold hover:bg-orange-100"
              >
                <FileCheck className="w-3 h-3 mr-1" /> RIPS
              </button>
              <button
                onClick={handleManualCloudSave}
                disabled={syncStatus === "syncing"}
                className="text-xs flex items-center bg-violet-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-violet-700 disabled:opacity-60 gap-1 shadow-sm"
              >
                {syncStatus === "syncing" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Cloud className="w-3 h-3" />
                )}
                {" Guardar en Nube"}
              </button>
              <input
                type="file"
                ref={fileInputSigRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleSignatureUpload}
              />
              <button
                onClick={() => fileInputSigRef.current.click()}
                className="text-xs flex items-center bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-200 font-bold hover:bg-teal-100"
              >
                <FileSignature className="w-3 h-3 mr-1" /> Firma
              </button>
            </>
          )}
          <span
            title={_syncTitle}
            className={
              "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border no-print " +
              _syncBg
            }
          >
            {syncStatus === "syncing" || syncStatus === "loading" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : syncStatus === "ok" ? (
              <Cloud className="w-3 h-3" />
            ) : syncStatus === "error" ? (
              <WifiOff className="w-3 h-3" />
            ) : (
              <Cloud className="w-3 h-3 opacity-40" />
            )}{" "}
            {_syncTxt}
          </span>
          {["administrador", "medico", "super_admin"].includes(
            currentUser?.role
          ) && (
            <button
              onClick={() => goTo("habeasdata")}
              className={
                view === "habeasdata"
                  ? "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white"
                  : "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
              }
              title="Habeas Data - Ley 1581/2012"
            >
              🔐 Privacidad
            </button>
          )}
          {(_isAdmin(currentUser?.role) ||
            currentUser?.role === "medico" ||
            (currentUser?.role === "secretaria" &&
              _secretariaPuede("telemedicina", currentUser, usersList))) && (
            <button
              onClick={() => goTo("telemedicina")}
              className={
                view === "telemedicina"
                  ? "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
                  : "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
              }
              title="Telemedicina - Res. 2654/2019"
            >
              🩺 Tele
            </button>
          )}
          {["administrador", "secretaria", "medico", "super_admin"].includes(
            currentUser?.role
          ) && (
            <button onClick={() => goTo("agenda")} className={_agCls}>
              {"🗓️ Agenda"}
              {_agN > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[8px] font-black px-1 rounded-full">
                  {_agN}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setShowMensajePanel((v) => !v)}
            className="relative p-2 rounded-xl hover:bg-indigo-50 transition"
            title="Mensajes internos"
          >
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            {_noLeidos > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {_noLeidos}
              </span>
            )}
          </button>
          {/* ── VER PLANES ── */}
          <button
            onClick={() => goTo("planes")}
            className={
              view === "planes"
                ? "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
                : "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
            }
            title="Ver planes y precios"
          >
            ⭐ Planes
          </button>
          <button
            onClick={() => {
              setCurrentUser(null);
              setView("login");
              _ls.removeItem("siso_session");
              _ls.removeItem("siso_active_form");
            }}
            className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 ml-1"
          >
            <LogOut className="w-3 h-3" /> Salir
          </button>
        </div>
      </nav>
    );
  };

  // ─── renderTabAdjuntos ───────────────────────────────────────────────────────────────
  const renderTabAdjuntos = () => {
    const TIPOS_ADJUNTO = [
      { valor: "espirometria", etiqueta: "🫁 Espirometría" },
      { valor: "audiometria", etiqueta: "👂 Audiometría" },
      { valor: "rayos_x", etiqueta: "🩻 Rayos X / Imágenes" },
      { valor: "laboratorio", etiqueta: "🧪 Laboratorio" },
      { valor: "optometria", etiqueta: "👁 Optometría" },
      { valor: "ecg", etiqueta: "❤️ ECG / Holter" },
      { valor: "vacunacion", etiqueta: "💉 Carnet Vacunación" },
      { valor: "otro", etiqueta: "📄 Otro documento" },
    ];
    const adjuntos = data.adjuntos || [];
    const MAX_MB = 10;
    const MAX_BYTES = MAX_MB * 1024 * 1024;
    const TIPOS_MIME = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/tiff",
      "image/webp",
    ];

    const handleSubirAdjunto = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!TIPOS_MIME.includes(file.type)) {
        showAlert("⚠️ Solo se permiten PDF, PNG, JPG, TIFF o WebP.");
        return;
      }
      if (file.size > MAX_BYTES) {
        showAlert(`⚠️ El archivo supera el límite de ${MAX_MB} MB.`);
        return;
      }

      const tipoSelect = document.getElementById("adjunto-tipo-select");
      const tipoVal = tipoSelect ? tipoSelect.value : "otro";
      const tipoLabel =
        TIPOS_ADJUNTO.find((t) => t.valor === tipoVal)?.etiqueta || "Documento";

      const ts = Date.now();
      const ext = file.name.split(".").pop().toLowerCase();
      const userId = currentUser?.user || "unknown";
      const hcId = data.id || "hc_" + ts;
      const storagePath = `${userId}/${hcId}/${ts}-${tipoVal}.${ext}`;
      const nombreVisible = `${tipoLabel.replace(/[^\w\s]/g, "").trim()} - ${
        file.name
      }`;

      showAlert("⏳ Subiendo archivo a Supabase Storage...");

      const result = await _sbStorageUpload(storagePath, file);
      if (!result.ok) {
        showAlert(
          `❌ Error al subir: ${
            result.error ||
            "Verifica que el bucket siso-adjuntos esté habilitado en Supabase."
          }`
        );
        return;
      }

      const nuevoAdj = {
        id: `adj_${ts}`,
        nombre: nombreVisible,
        tipo: tipoVal,
        tipoLabel,
        mimeType: file.type,
        tamano: file.size,
        fecha: new Date().toISOString(),
        subidoPor: userId,
        path: storagePath,
      };

      const nuevosAdjuntos = [...adjuntos, nuevoAdj];
      setData((prev) => ({ ...prev, adjuntos: nuevosAdjuntos }));
      showAlert(`✅ "${file.name}" subido correctamente como ${tipoLabel}.`);
      if (tipoSelect) tipoSelect.value = "otro";
      e.target.value = "";
    };

    const handleVerAdjunto = async (adj) => {
      const url = await _sbStorageGetSignedUrl(adj.path);
      if (url) {
        window.open(url, "_blank");
      } else {
        showAlert(
          "⚠️ No se pudo obtener el enlace. Verifica la conexión con Supabase."
        );
      }
    };

    const handleEliminarAdjunto = async (adj) => {
      if (data.estadoHistoria === "Cerrada") {
        showAlert("ℹ️ No se pueden eliminar adjuntos de una HC cerrada.");
        return;
      }
      const ok = await new Promise((res) =>
        setConfirmConfig({
          msg: `¿Eliminar "${adj.nombre}"? Esta acción no se puede deshacer.`,
          onConfirm: () => res(true),
          onCancel: () => res(false),
        })
      );
      if (!ok) return;
      await _sbStorageDelete(adj.path);
      const filtrados = adjuntos.filter((a) => a.id !== adj.id);
      setData((prev) => ({ ...prev, adjuntos: filtrados }));
      showAlert("🗑 Adjunto eliminado.");
    };

    const formatBytes = (b) =>
      b < 1024 * 1024
        ? `${(b / 1024).toFixed(1)} KB`
        : `${(b / 1024 / 1024).toFixed(2)} MB`;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-teal-50">
          <span className="text-sm font-black text-teal-800">
            📎 Adjuntos de Paraclínicos
          </span>
          <span className="text-[10px] text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
            Res. 1843/2025 · Supabase Storage
          </span>
          <span className="ml-auto text-[10px] text-gray-400">
            {adjuntos.length} archivo{adjuntos.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Upload area */}
          {data.estadoHistoria !== "Cerrada" && (
            <div className="border-2 border-dashed border-teal-300 rounded-xl p-4 bg-teal-50/40 space-y-3">
              <p className="text-xs font-bold text-teal-800">
                Subir nuevo adjunto
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase">
                    Tipo de documento
                  </label>
                  <select
                    id="adjunto-tipo-select"
                    className="p-2 border rounded-lg text-xs bg-white min-w-[180px]"
                    defaultValue="otro"
                  >
                    {TIPOS_ADJUNTO.map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-lg flex items-center gap-2">
                  <span>⬆ Seleccionar archivo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.tiff,.webp"
                    onChange={handleSubirAdjunto}
                  />
                </label>
              </div>
              <p className="text-[10px] text-gray-400">
                Formatos: PDF, PNG, JPG, TIFF, WebP · Máx. {MAX_MB} MB · Se
                almacena en Supabase Storage
              </p>
            </div>
          )}

          {/* Lista de adjuntos */}
          {adjuntos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📂</p>
              <p className="text-sm font-bold">Sin adjuntos</p>
              <p className="text-xs mt-1">
                Suba espirometrías, audiometrías, resultados de laboratorio u
                otros documentos clínicos
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {adjuntos.map((adj) => (
                <div
                  key={adj.id}
                  className="flex items-center justify-between gap-3 py-3 px-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">
                      {adj.mimeType === "application/pdf" ? "📄" : "🖼️"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {adj.nombre}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatBytes(adj.tamano)} ·{" "}
                        {new Date(adj.fecha).toLocaleDateString("es-CO")} ·{" "}
                        {adj.subidoPor}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleVerAdjunto(adj)}
                      className="px-3 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                    >
                      👁 Ver
                    </button>
                    {data.estadoHistoria !== "Cerrada" && (
                      <button
                        onClick={() => handleEliminarAdjunto(adj)}
                        className="px-3 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nota normativa */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-[10px] text-amber-800 font-bold">
              📋 Normativa aplicable
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5">
              Los resultados de paraclínicos forman parte integral de la
              Historia Clínica Ocupacional según la Res. 1843/2025 Art. 12 y la
              Res. 1995/1999 (retención 20 años). Los archivos se almacenan en
              Supabase Storage con acceso restringido por credenciales del
              médico.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ─── ROUTER ───────────────────────────────────────────────────────────────
  // ─── RENDER: GESTIÓN DE USUARIOS ─────────────────────────────────────────

  // ─── renderTabSolicitudExamenes ───────────────────────────────────────────────────────────────
  const renderTabSolicitudExamenes = () => {
    // FIX: definir _billDocData/_billDocSig en scope de renderTabSolicitudExamenes
    const _examDocUser2 =
      typeof billData !== "undefined" && billData?.billDoctorId
        ? usersList?.find((u) => u.user === billData.billDoctorId)
        : null;
    const _billDocData = _examDocUser2?.doctorData || activeDoctorData;
    const _billDocSig = _examDocUser2?.doctorData?.firma || activeSignature;
    const EXAMENES_DB = [
      // Laboratorio Clínico
      "Hemograma completo (CBC)",
      "Cuadro hemático",
      "Hemograma con diferencial",
      "Hematocrito y hemoglobina",
      "Glicemia en ayunas",
      "Glicemia posprandial",
      "Hemoglobina glicosilada (HbA1c)",
      "Glucosa sérica",
      "Creatinina sérica",
      "BUN (nitrógeno ureico)",
      "Ácido úrico",
      "Urea",
      "Perfil lipídico completo",
      "Colesterol total",
      "Colesterol HDL",
      "Colesterol LDL",
      "Triglicéridos",
      "Pruebas de función hepática",
      "ALT (TGP)",
      "AST (TGO)",
      "Fosfatasa alcalina",
      "Bilirrubinas totales y fraccionadas",
      "TSH (hormona estimulante de tiroides)",
      "T3 libre",
      "T4 libre",
      "Perfil tiroideo",
      "Sodio sérico",
      "Potasio sérico",
      "Cloro sérico",
      "Calcio sérico",
      "Magnesio sérico",
      "Fósforo sérico",
      "Proteína C reactiva (PCR)",
      "PCR ultrasensible",
      "VSG (velocidad de sedimentación globular)",
      "Parcial de orina (uroanálisis)",
      "Urocultivo",
      "Coprocultivo",
      "Coproscópico",
      "Tiempo de protrombina (TP)",
      "Tiempo de tromboplastina (PTT)",
      "INR",
      "Tiempo de sangría",
      "Ferritina",
      "Hierro sérico",
      "Transferrina",
      "Saturación de transferrina",
      "Vitamina B12",
      "Ácido fólico",
      "Vitamina D (25-OH)",
      "Calcio iónico",
      "Parathormona (PTH)",
      "PSA (antígeno prostático)",
      "PSA libre",
      "AFP (alfa fetoproteína)",
      "CEA",
      "CA 19-9",
      "CA 125",
      "VDRL",
      "FTA-ABS",
      "Prueba de VIH (ELISA)",
      "Antígeno de superficie hepatitis B (HBsAg)",
      "Anti-HBs",
      "Anti-HBc total",
      "Anti-VHC",
      "Carga viral VIH",
      "PCR para hepatitis C",
      "Prueba de embarazo (Beta HCG)",
      "FSH",
      "LH",
      "Estradiol",
      "Progesterona",
      "Testosterona total",
      "Prolactina",
      "DHEA-S",
      "Cortisol sérico (8am)",
      "Cortisol en orina 24h",
      "Espermograma",
      "Proteína en orina 24h",
      "Creatinuria en orina 24h",
      // Imagenología
      "Radiografía de tórax PA y lateral",
      "Radiografía columna lumbosacra AP y lateral",
      "Radiografía columna cervical AP y lateral",
      "Radiografía de manos AP bilateral",
      "Radiografía de pelvis AP",
      "Radiografía de rodilla AP y lateral",
      "Radiografía de pies bilateral",
      "Radiografía de cráneo",
      "Radiografía de senos paranasales",
      "Ecografía abdominal total",
      "Ecografía pélvica transabdominal",
      "Ecografía pélvica transvaginal",
      "Ecografía de tiroides",
      "Ecografía de mama bilateral",
      "Ecografía de partes blandas",
      "Ecografía renal y vías urinarias",
      "Ecografía Doppler venoso miembros inferiores",
      "Ecografía Doppler arterial miembros inferiores",
      "Ecografía de cuello",
      "TAC de cráneo simple",
      "TAC de cráneo con contraste",
      "TAC de tórax simple",
      "TAC de tórax con contraste",
      "TAC de abdomen y pelvis con contraste",
      "TAC de columna lumbosacra",
      "TAC de columna cervical",
      "TAC de huesos y articulaciones",
      "Resonancia magnética de cráneo",
      "Resonancia magnética de columna lumbar",
      "Resonancia magnética de columna cervical",
      "Resonancia magnética de rodilla",
      "Resonancia magnética de hombro",
      "Resonancia magnética de cadera",
      "Gamagrafía ósea",
      "Gamagrafía tiroidea",
      "Densitometría ósea (DXA)",
      "Mamografía bilateral",
      "Mamografía digital bilateral",
      // Cardiología / Fisiología
      "Electrocardiograma (ECG) de 12 derivaciones",
      "Electrocardiograma en reposo",
      "Ecocardiograma transtorácico",
      "Ecocardiograma con Doppler",
      "Prueba de esfuerzo (ergometría)",
      "Holter de ritmo 24 horas",
      "Holter de presión arterial (MAPA)",
      "Espirometría simple",
      "Espirometría con broncodilatador",
      "Pleuroscopia",
      "Audiometría",
      "Audiometría tonal",
      "Audiometría de palabras",
      "Impedanciometría",
      "Optometría",
      "Agudeza visual",
      "Tonometría ocular",
      "Campimetría",
      "Electroencefalograma (EEG)",
      "Electromiografía (EMG)",
      "Velocidad de conducción nerviosa",
      // Procedimientos
      "Endoscopia digestiva alta",
      "Colonoscopia",
      "Colonoscopia con toma de biopsia",
      "Gastroscopia",
      "Rectosigmoidoscopia",
      "CPRE (colangiopancreatografía retrógrada)",
      "Culdocentesis",
      "Amniocentesis",
      "Biopsia de piel",
      "Biopsia de ganglio",
      "Biopsia de próstata guiada por ecografía",
      "Biopsia de mama guiada",
      "Punción lumbar",
      "Punción aspiración con aguja fina (PAAF) tiroides",
      "Drenaje de absceso",
      "Curación de herida",
      "Citología cervicouterina (PAP)",
      "Colposcopia",
      "Histeroscopia",
      "Laparoscopia diagnóstica",
      // Medicina Laboral / Ocupacional
      "Espirometría ocupacional",
      "Audiometría ocupacional",
      "Optometría ocupacional",
      "Visiometría",
      "Examen de optometría y visiometría",
      "Perfil de columna ocupacional",
      "Evaluación osteomuscular",
      "Test de Wells",
      "Test de Phalen",
      "Test de Tinel",
      "Valoración de riesgo cardiovascular (Framingham)",
      "Índice tobillo-brazo (ITB)",
      "Glicemia en ayunas (preocupacional)",
      "Perfil lipídico (preocupacional)",
      "Hemograma (preocupacional)",
      "Cuadro hemático (preocupacional)",
      "Hepatitis B antígeno (HBsAg)",
      "Serología completa",
      "Tamizaje VIH",
      // Psicología / Neuropsicología
      "Test de Minnesota (MMPI)",
      "Test de Bender",
      "Test de matrices de Raven",
      "Evaluación neuropsicológica",
      "Evaluación psicológica forense",
      "Test de personalidad",
      "Evaluación de aptitudes laborales",
      "Evaluación de estrés laboral (Bonn)",
      "Evaluación del riesgo psicosocial",
    ];
    // States moved to component level (no hooks in conditionals - React rule)
    const showSuggs = showExamSuggs;
    const setShowSuggs = setShowExamSuggs;
    const suggestions =
      examSearch.length >= 2
        ? EXAMENES_DB.filter((e) =>
            e.toLowerCase().includes(examSearch.toLowerCase())
          ).slice(0, 12)
        : [];
    // ══ B-11: Pruebas prohibidas como requisito laboral - Res. 1843/2025 Art. 10 ══
    const _PRUEBAS_PROHIBIDAS_RES1843 = [
      {
        terminos: [
          "embarazo",
          "gravidez",
          "beta hcg",
          "bhcg",
          "prueba de embarazo",
          "test de embarazo",
          "gestacion",
        ],
        nombre: "Prueba de embarazo",
      },
      {
        terminos: [
          "vih",
          "hiv",
          "sida",
          "aids",
          "prueba de vih",
          "elisa vih",
          "western blot",
        ],
        nombre: "Prueba de VIH/SIDA",
      },
      {
        terminos: [
          "serologia",
          "serológico",
          "vdrl",
          "rpr",
          "sifilis",
          "treponema",
        ],
        nombre: "Prueba serológica (sífilis/treponema)",
      },
    ];
    const _esPruebaProhibida = (nombre) => {
      const n = nombre.toLowerCase();
      return _PRUEBAS_PROHIBIDAS_RES1843.find((p) =>
        p.terminos.some((t) => n.includes(t))
      );
    };
    const addExam = (nombre) => {
      // ── Verificar si es prueba prohibida como requisito laboral ──
      const prohibida = _esPruebaProhibida(nombre);
      const tipoExActual = data?.tipoExamen || "";
      const esEvalOcupacional = ["INGRESO", "PERIODICO", "RETIRO"].includes(
        tipoExActual
      );
      if (prohibida && esEvalOcupacional) {
        // Mostrar advertencia - el médico PUEDE agregarla con justificación clínica
        showPrompt(
          `⚠️ Res. 1843/2025 Art. 10 - PRUEBA RESTRINGIDA\n\n"${prohibida.nombre}" está prohibida como requisito de ingreso o permanencia laboral.\n\nSi hay indicación CLÍNICA justificada, escriba la justificación aquí. De lo contrario, cancele.\n\nJustificación clínica (requerida):`,
          (justificacion) => {
            if (!justificacion || !justificacion.trim()) return; // canceló
            const nuevo = {
              nombre,
              fecha: new Date().toISOString().split("T")[0],
              urgente: false,
              justificacionClin: justificacion.trim(),
              alertaRes1843: true,
            };
            const updated = [...examList, nuevo];
            setExamList(updated);
            setData((p) => ({
              ...p,
              solicitudExamenes: updated,
              justificacionPruebaEspecial:
                (p.justificacionPruebaEspecial
                  ? p.justificacionPruebaEspecial + " | "
                  : "") + `${prohibida.nombre}: ${justificacion.trim()}`,
            }));
            setExamSearch("");
            setShowExamSuggs(false);
          }
        );
        return; // espera confirmación del médico
      }
      // ── Examen sin restricción - agregar normalmente ──
      const nuevo = {
        nombre,
        fecha: new Date().toISOString().split("T")[0],
        urgente: false,
      };
      const updated = [...examList, nuevo];
      setExamList(updated);
      setData((p) => ({ ...p, solicitudExamenes: updated }));
      setExamSearch("");
      setShowExamSuggs(false);
    };
    const addFreeText = () => {
      if (!examSearch.trim()) return;
      addExam(examSearch.trim());
    };
    const removeExam = (i) => {
      const updated = examList.filter((_, j) => j !== i);
      setExamList(updated);
      setData((p) => ({ ...p, solicitudExamenes: updated }));
    };
    const saveLocal = () => {
      setData((p) => ({
        ...p,
        solicitudExamenes: examList,
        solicitudExamenesDiag: diagExamen,
        solicitudExamenesJust: justExamen,
      }));
    };
    // Paquetes de exámenes por grupo/frecuencia
    const EXAM_PACKAGES = [
      {
        id: "ocup_ingreso",
        nombre: "📋 Ingreso Ocupacional",
        frecuencia: "Por evento",
        examenes: [
          "Hemograma completo (CBC)",
          "Glicemia en ayunas",
          "Perfil lipídico completo",
          "Creatinina sérica",
          "Parcial de orina (uroanálisis)",
          "Radiografía de tórax PA y lateral",
          "Electrocardiograma (ECG) de 12 derivaciones",
          "Audiometría ocupacional",
          "Optometría ocupacional",
          "Visiometría",
        ],
      },
      {
        id: "ocup_periodico",
        nombre: "🔄 Periódico Ocupacional",
        frecuencia: "Anual",
        examenes: [
          "Hemograma completo (CBC)",
          "Glicemia en ayunas",
          "Perfil lipídico completo",
          "Creatinina sérica",
          "Parcial de orina (uroanálisis)",
          "Audiometría ocupacional",
          "Optometría ocupacional",
        ],
      },
      {
        id: "alturas",
        nombre: "⛰️ Trabajo en Alturas (Res. 4272/2021)",
        frecuencia: "Anual",
        examenes: [
          "Electrocardiograma (ECG) de 12 derivaciones",
          "Espirometría simple",
          "Audiometría ocupacional",
          "Optometría ocupacional",
          "Glucosa sérica",
          "Hemograma completo (CBC)",
          "Radiografía de tórax PA y lateral",
        ],
      },
      {
        id: "alimentos",
        nombre: "🍽️ Manipulación Alimentos (Res. 2674/2013)",
        frecuencia: "Anual",
        examenes: [
          "Coproscópico",
          "Coprocultivo",
          "VDRL",
          "Parcial de orina (uroanálisis)",
          "Hemograma completo (CBC)",
          "Citología cervicouterina (PAP)",
        ],
      },
      {
        id: "cardiovascular",
        nombre: "❤️ Riesgo Cardiovascular",
        frecuencia: "Semestral",
        examenes: [
          "Perfil lipídico completo",
          "Glicemia en ayunas",
          "Hemoglobina glicosilada (HbA1c)",
          "Electrocardiograma (ECG) de 12 derivaciones",
          "Proteína C reactiva (PCR) ultrasensible",
          "Creatinina sérica",
        ],
      },
      {
        id: "respiratorio",
        nombre: "🫁 Riesgo Respiratorio (SVE)",
        frecuencia: "Anual",
        examenes: [
          "Espirometría simple",
          "Espirometría con broncodilatador",
          "Radiografía de tórax PA y lateral",
          "Hemograma completo (CBC)",
        ],
      },
      {
        id: "osteomuscular",
        nombre: "🦴 Riesgo Osteomuscular (SVE)",
        frecuencia: "Anual",
        examenes: [
          "Radiografía columna lumbosacra AP y lateral",
          "Radiografía columna cervical AP y lateral",
          "Radiografía de manos AP bilateral",
          "Electromiografía (EMG)",
        ],
      },
      {
        id: "ruido",
        nombre: "🔊 Exposición a Ruido (SVE)",
        frecuencia: "Anual",
        examenes: [
          "Audiometría ocupacional",
          "Audiometría tonal",
          "Audiometría de palabras",
          "Impedanciometría",
        ],
      },
      {
        id: "quimico",
        nombre: "⚗️ Riesgo Químico",
        frecuencia: "Anual",
        examenes: [
          "Hemograma completo (CBC)",
          "Pruebas de función hepática",
          "Creatinina sérica",
          "Parcial de orina (uroanálisis)",
          "Plomo en sangre (si exposición)",
        ],
      },
      {
        id: "visual",
        nombre: "👁️ Riesgo Visual",
        frecuencia: "Anual",
        examenes: [
          "Optometría ocupacional",
          "Agudeza visual",
          "Tonometría ocular",
          "Campimetría",
          "Visiometría",
        ],
      },
    ];
    const applyPackage = () => {
      if (!selectedPackage) return;
      const pkg = EXAM_PACKAGES.find((p) => p.id === selectedPackage);
      if (!pkg) return;
      const toAdd = pkg.examenes.filter((e) => packageChecklist[e] !== false); // por defecto todos marcados
      const nuevos = toAdd.map((nombre) => ({
        nombre,
        fecha: new Date().toISOString().split("T")[0],
        urgente: false,
        paquete: pkg.nombre,
      }));
      const updated = [...examList, ...nuevos];
      setExamList(updated);
      setData((p) => ({ ...p, solicitudExamenes: updated }));
      setSelectedPackage(null);
      setPackageChecklist({});
      setShowPackages(false);
    };
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-5">
          <h3 className="text-base font-black text-teal-800 flex items-center gap-2 mb-1">
            🔬 Solicitud de Exámenes y Procedimientos
          </h3>
          <p className="text-xs text-gray-400">
            Busque el examen o escríbalo libremente · Se imprimirá con los datos
            del paciente
          </p>
        </div>
        {/* ── PAQUETES DE EXÁMENES ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-indigo-800 uppercase">
              📦 Paquetes por Grupo / Frecuencia
            </p>
            <button
              onClick={() => setShowPackages((v) => !v)}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700"
            >
              {showPackages ? "✕ Cerrar" : "+ Seleccionar Paquete"}
            </button>
          </div>
          {showPackages && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {EXAM_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      setPackageChecklist(
                        Object.fromEntries(pkg.examenes.map((e) => [e, true]))
                      );
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      selectedPackage === pkg.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <p className="font-black text-gray-800">{pkg.nombre}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      🔁 {pkg.frecuencia} · {pkg.examenes.length} exámenes
                    </p>
                  </button>
                ))}
              </div>
              {selectedPackage &&
                (() => {
                  const pkg = EXAM_PACKAGES.find(
                    (p) => p.id === selectedPackage
                  );
                  return (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                      <p className="text-xs font-black text-indigo-800 mb-2">
                        {pkg.nombre} - Seleccione los exámenes a agregar:
                      </p>
                      <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto mb-3">
                        {pkg.examenes.map((ex) => (
                          <label
                            key={ex}
                            className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-white rounded p-1"
                          >
                            <input
                              type="checkbox"
                              checked={packageChecklist[ex] !== false}
                              onChange={(e) =>
                                setPackageChecklist((p) => ({
                                  ...p,
                                  [ex]: e.target.checked,
                                }))
                              }
                              className="accent-indigo-600 w-3.5 h-3.5 flex-shrink-0"
                            />
                            <span className="text-gray-700">{ex}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={applyPackage}
                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-lg hover:bg-indigo-700"
                        >
                          ✓ Agregar seleccionados
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPackage(null);
                            setPackageChecklist({});
                          }}
                          className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })()}
            </div>
          )}
        </div>
        {/* Buscador */}
        <div className="bg-white rounded-2xl shadow-sm border border-teal-200 p-5">
          <label className="block text-xs font-black text-teal-700 uppercase mb-2">
            Buscar o añadir examen / procedimiento
          </label>
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                {/* Buscador CUPS integrado + búsqueda libre */}
                <input
                  value={examSearch}
                  onChange={(e) => {
                    setExamSearch(e.target.value);
                    setShowExamSuggs(true);
                  }}
                  onFocus={() => setShowSuggs(true)}
                  placeholder="Buscar CUPS o examen - Ej: 903001 hemograma, 912701 espirometría, audiometría..."
                  className="w-full p-2.5 border-2 border-teal-200 rounded-xl text-sm focus:border-teal-500 outline-none"
                />
                {showSuggs && suggestions.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-teal-200 rounded-xl shadow-2xl z-50 w-full max-h-52 overflow-y-auto">
                    {/* CUPS matches first */}
                    {_buscarCUPS(examSearch, 5).map((item, i) => (
                      <button
                        key={"cups" + i}
                        type="button"
                        onClick={() => addExam(item.code + " - " + item.desc)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 border-b border-teal-50 last:border-none"
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: "900",
                            color: "#134e4a",
                            background: "#ccfbf1",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            marginRight: "6px",
                            fontSize: "10px",
                          }}
                        >
                          {item.code}
                        </span>
                        <span className="text-gray-800">{item.desc}</span>
                        <span
                          style={{
                            fontSize: "8px",
                            color: "#0d9488",
                            marginLeft: "4px",
                          }}
                        >
                          ({item.group})
                        </span>
                      </button>
                    ))}
                    {/* Regular exam DB matches */}
                    {suggestions
                      .filter(
                        (s) =>
                          !_buscarCUPS(examSearch, 5).some((c) =>
                            s.includes(c.code)
                          )
                      )
                      .map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addExam(s)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 border-b border-gray-50 last:border-none font-medium text-gray-800"
                        >
                          🔬 {s}
                        </button>
                      ))}
                    {examSearch.trim() &&
                      !EXAMENES_DB.some(
                        (e) => e.toLowerCase() === examSearch.toLowerCase()
                      ) && (
                        <button
                          type="button"
                          onClick={addFreeText}
                          className="w-full text-left px-3 py-2 text-xs bg-teal-50 text-teal-700 font-black border-t"
                        >
                          ✏️ Agregar "{examSearch}" como texto libre
                        </button>
                      )}
                  </div>
                )}
              </div>
              <button
                onClick={addFreeText}
                className="bg-teal-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-teal-700 whitespace-nowrap"
              >
                + Agregar
              </button>
            </div>
          </div>
          {/* Lista de exámenes agregados */}
          {examList.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase">
                Exámenes solicitados ({examList.length})
              </p>
              {examList.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2"
                >
                  <span className="text-teal-500 font-black text-sm">🔬</span>
                  <span className="flex-1 text-xs font-semibold text-gray-800">
                    {ex.nombre}
                    {ex.alertaRes1843 && (
                      <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1 rounded font-black">
                        ⚠️ Justif. clínica - Res.1843 Art.10
                      </span>
                    )}
                  </span>
                  <label className="flex items-center gap-1 text-[10px] text-red-600 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ex.urgente || false}
                      onChange={(e) => {
                        const u = [...examList];
                        u[i] = { ...u[i], urgente: e.target.checked };
                        setExamList(u);
                        setData((p) => ({ ...p, solicitudExamenes: u }));
                      }}
                      className="accent-red-500"
                    />
                    Urgente
                  </label>
                  <button
                    onClick={() => removeExam(i)}
                    className="text-red-400 hover:text-red-600 font-black text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Diagnóstico y justificación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase mb-1">
              Diagnóstico / Impresión Diagnóstica
            </label>
            <input
              value={diagExamen}
              onChange={(e) => {
                setDiagExamen(e.target.value);
                setData((p) => ({
                  ...p,
                  solicitudExamenesDiag: e.target.value,
                }));
              }}
              placeholder="Ej: Hipertensión arterial esencial (I10), Diabetes tipo 2 (E11)..."
              className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase mb-1">
              Justificación / Motivo del examen
            </label>
            <textarea
              rows={3}
              value={justExamen}
              onChange={(e) => {
                setJustExamen(e.target.value);
                setData((p) => ({
                  ...p,
                  solicitudExamenesJust: e.target.value,
                }));
              }}
              placeholder="Explique el motivo clínico por el cual se solicitan los exámenes..."
              className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-sm resize-none focus:border-blue-400 outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                saveLocal();
                showAlert("✅ Solicitud de exámenes guardada correctamente.");
              }}
              className="bg-teal-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-teal-700 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> Guardar solicitud
            </button>
          </div>
        </div>
        {/* Preview de impresión */}
        {examList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-gray-600 uppercase">
                Vista previa del documento imprimible
              </p>
              <button
                onClick={() => {
                  const w = window.open("", "_blank", "width=870,height=1100");
                  if (!w) return;
                  const fd =
                    data.fechaConsulta ||
                    new Date().toLocaleDateString("es-CO");
                  const exHtml = examList
                    .map(
                      (ex, i) =>
                        `<tr style="background:${
                          i % 2 === 0 ? "#f0fdfa" : "white"
                        }"><td style="padding:7px 10px;font-size:9pt;">${
                          i + 1
                        }. ${ex.nombre}${
                          ex.urgente
                            ? ' <b style="color:#dc2626;">(URGENTE)</b>'
                            : ""
                        }</td></tr>`
                    )
                    .join("");
                  const _miIPSExam = currentUser?.empresaId
                    ? companies.find((c) => c.id === currentUser.empresaId) ||
                      null
                    : null;
                  w.document.write(
                    `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Solicitud de Exámenes</title><style>@page{size:letter portrait;margin:1.2cm 1.5cm;}body{font-family:Arial,sans-serif;font-size:9pt;color:#222;}h2{margin:0;font-size:13pt;color:#0d9488;text-transform:uppercase;}table{width:100%;border-collapse:collapse;margin-top:8px;}th{background:#0d9488;color:white;padding:7px 10px;font-size:8.5pt;text-align:left;}td{border-bottom:1px solid #e5e7eb;}p{margin:3px 0;font-size:9pt;}.sig{margin-top:40px;display:flex;justify-content:space-between;}.sig-line{border-top:1.5px solid #222;width:200px;text-align:center;padding-top:4px;font-size:8pt;font-weight:bold;}</style></head><body><div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0d9488;padding-bottom:10px;margin-bottom:14px;">${_ipsDocLeftHtml(
                      _miIPSExam,
                      _billDocData,
                      "#0d9488"
                    )}<div style="text-align:right;"><h2>Solicitud de Exámenes</h2><p>Fecha: ${fd}</p></div></div><div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:4px;padding:10px;margin-bottom:10px;"><p><b>Paciente:</b> ${
                      data.nombres || ""
                    } &nbsp; <b>Doc:</b> ${data.docTipo || "CC"} ${
                      data.docNumero || ""
                    } &nbsp; <b>Edad:</b> ${
                      data.edad || "--"
                    } años &nbsp; <b>EPS:</b> ${data.eps || "--"}</p>${
                      diagExamen
                        ? `<p style="margin-top:4px;"><b>Diagnóstico:</b> ${diagExamen}</p>`
                        : ""
                    }</div><table><thead><tr><th>Examen / Procedimiento Solicitado</th></tr></thead><tbody>${exHtml}</tbody></table>${
                      justExamen
                        ? `<div style="margin-top:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:4px;padding:8px;"><p style="font-weight:bold;font-size:8.5pt;color:#92400e;text-transform:uppercase;margin-bottom:4px;">Justificación clínica:</p><p style="white-space:pre-wrap;">${justExamen}</p></div>`
                        : ""
                    }<div class="sig"><div class="sig-line">Firma Paciente / Responsable</div><div style="text-align:center;"><img src="${
                      _billDocSig || ""
                    }" style="max-height:60px;" onerror="this.style.display='none'"/><div class="sig-line">${
                      _billDocData?.nombre || ""
                    }<br>${
                      _billDocData?.licencia || ""
                    }</div></div></div></body></html>`
                  );
                  w.document.close();
                  w.focus();
                  setTimeout(() => {
                    w.print();
                    w.close();
                  }, 700);
                }}
                className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Solicitud
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-teal-700 text-white px-4 py-2 text-xs font-bold uppercase">
                Exámenes Solicitados - {data.nombres || "Paciente"}
              </div>
              {examList.map((ex, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 text-xs flex items-center gap-2 border-b last:border-none ${
                    i % 2 === 0 ? "bg-white" : "bg-teal-50/30"
                  }`}
                >
                  <span className="text-teal-600 font-black">{i + 1}.</span>
                  <span className="flex-1">{ex.nombre}</span>
                  {ex.urgente && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded">
                      URGENTE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  // ─── RENDER: TAB INCAPACIDAD GENERAL ────────────────────────────────────

  // ─── renderTabIncapacidadGeneral ───────────────────────────────────────────────────────────────
  const renderTabIncapacidadGeneral = () => {
    const diasCalc = (() => {
      if (!data.incapacidad?.desde || !data.incapacidad?.hasta)
        return data.incapacidad?.dias || 0;
      const s = new Date(data.incapacidad.desde);
      const e = new Date(data.incapacidad.hasta);
      return Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
    })();
    const printIncap = () => {
      const w = window.open("", "_blank", "width=870,height=1100");
      if (!w) return;
      const dias = data.incapacidad?.dias || diasCalc;
      // FIX: usar activeDoctorData y activeSignature (disponibles en scope del componente principal)
      const doc = activeDoctorData || {};
      const sig = activeSignature || "";
      const _miIPSIncap = currentUser?.empresaId
        ? companies.find((c) => c.id === currentUser.empresaId) || null
        : null;
      const headerHtml = `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #dc2626;padding-bottom:10px;margin-bottom:14px;">
    ${_ipsDocLeftHtml(_miIPSIncap, doc, "#dc2626")}
    <div style="text-align:right;">
      <h2 style="margin:0;font-size:13pt;font-weight:900;color:#dc2626;text-transform:uppercase;">Certificado de Incapacidad Médica</h2>
      <p style="font-size:8.5pt;color:#555;">Fecha de expedición: ${_sanitize(
        data.fechaConsulta || new Date().toLocaleDateString("es-CO")
      )}</p>
      <p style="font-size:7.5pt;color:#888;">Res. 1995/1999 · Ley 100/1993 Art. 227 · Dec. 2943/2013</p>
    </div>
  </div>`;
      const bodyHtml = `
    <table><tr><th>Paciente</th><td>${_sanitize(
      data.nombres || ""
    )}</td><th>Documento</th><td>${_sanitize(
        data.docTipo || "CC"
      )}: ${_sanitize(data.docNumero || "")}</td></tr>
    <tr><th>Edad</th><td>${_sanitize(
      String(data.edad || "--")
    )} años</td><th>Fecha de nacimiento</th><td>${_sanitize(
        data.fechaNacimiento || "--"
      )}</td></tr>
    <tr><th>EPS / Aseguradora</th><td>${_sanitize(
      data.eps || "--"
    )}</td><th>Género</th><td>${_sanitize(data.genero || "--")}</td></tr>
    <tr><th>Diagnóstico (CIE-10)</th><td colspan="3">${_sanitize(
      data.incapacidad?.diagnosticoCIE || data.incapacidad?.diagnostico || "--"
    )}</td></tr>
    <tr><th>Origen de la incapacidad</th><td>${_sanitize(
      data.incapacidad?.origen || "Enfermedad General"
    )}</td><th>Prórroga N°</th><td>${_sanitize(
        data.incapacidad?.prorroga || "N/A"
      )}</td></tr>
    <tr><th>Fecha de inicio</th><td>${_sanitize(
      data.incapacidad?.desde || "--"
    )}</td><th>Fecha de fin</th><td>${_sanitize(
        data.incapacidad?.hasta || "--"
      )}</td></tr>
    <tr><th colspan="2" style="background:#dc2626;color:white;text-align:center;font-size:12pt;">DÍAS DE INCAPACIDAD: ${dias}</th>
        <th colspan="2" style="text-align:center;font-size:11pt;">${_sanitize(
          numeroALetras(dias)
        )} (${dias}) DÍAS</th></tr>
    <tr><th>Restricciones durante la incapacidad</th><td colspan="3">${_sanitize(
      data.incapacidad?.restricciones ||
        "Reposo relativo en casa. Evitar esfuerzo físico intenso."
    )}</td></tr>
    <tr><th>Recomendaciones al paciente</th><td colspan="3">${_sanitize(
      data.incapacidad?.recoIncapacidad ||
        "Consultar nuevamente si no hay mejoría o si los síntomas empeoran."
    )}</td></tr>
    </table>
    <p class="legal">La presente incapacidad es expedida conforme a la Ley 100/1993 Art. 227, Decreto 2943/2013, y la normatividad vigente del SGSSS. Para incapacidades por accidente de trabajo o enfermedad laboral aplica el Decreto 1295/1994.</p>
    <div class="sig">
      <div class="sig-line">Firma Paciente / Responsable</div>
      <div style="text-align:center;">
        ${
          sig
            ? `<img src="${sig}" style="max-height:60px;max-width:150px;object-fit:contain;display:block;margin:0 auto 4px;" onerror="this.style.display='none'"/>`
            : '<div style="height:60px;"></div>'
        }
        <div class="sig-line">${_sanitize(doc.nombre || "")}<br/>${_sanitize(
        doc.titulo || ""
      )} · Lic: ${_sanitize(doc.licencia || "")}</div>
      </div>
    </div>`;
      w.document
        .write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Certificado de Incapacidad - ${_sanitize(
        data.nombres || ""
      )}</title><style>
@page{size:letter portrait;margin:1.2cm 1.5cm;}
*{box-sizing:border-box;}
body{font-family:Arial,sans-serif;font-size:9pt;color:#111;padding-top:52px;}
h2{margin:4px 0;font-size:13pt;text-transform:uppercase;color:#dc2626;}
table{width:100%;border-collapse:collapse;margin-top:8px;}
td,th{border:1px solid #ccc;padding:6px 10px;font-size:9pt;}
th{background:#fee2e2;font-weight:900;text-align:left;color:#7f1d1d;}
.sig{margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;}
.sig-line{border-top:1.5px solid #222;width:200px;text-align:center;padding-top:4px;font-size:8pt;font-weight:bold;}
.legal{font-size:7.5pt;color:#888;margin-top:8px;}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#991b1b;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.3);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;}
.print-toolbar button{border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
.print-toolbar .btn-print{background:#10b981;color:white;}
.print-toolbar .btn-close{background:#374151;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#fca5a5;}
[contenteditable]{outline:1.5px dashed #fca5a5;border-radius:2px;cursor:text;}
[contenteditable]:focus{outline:2px solid #f87171;background:#fff5f5;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}body{padding-top:0;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">🏥 Certificado de Incapacidad - ${_sanitize(
    data.nombres || ""
  )}</span>
  <span class="hint">✏️ Haz clic en cualquier celda para editar</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir certificado</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${headerHtml}</div>
<div contenteditable="true" spellcheck="false">${bodyHtml}</div>
</body></html>`);
      w.document.close();
      w.focus();
      // No auto-print - el médico edita y luego hace clic en "Imprimir certificado"
    };
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5">
          <h3 className="text-base font-black text-red-800 flex items-center gap-2 mb-1">
            🏥 Certificado de Incapacidad Médica
          </h3>
          <p className="text-xs text-gray-400">
            Ley 100/1993 Art. 227 · Decreto 2943/2013 · Res. 1995/1999 · Decreto
            1295/1994
          </p>
        </div>
        {/* Datos del paciente (solo lectura) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-black text-gray-500 uppercase mb-3">
            Datos del Paciente (de la HC)
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ["Paciente", data.nombres || "--"],
              [
                "Documento",
                `${data.docTipo || "CC"}: ${data.docNumero || "--"}`,
              ],
              ["Edad", `${data.edad || "--"} años`],
              ["Fecha Nac.", data.fechaNacimiento || "--"],
              ["EPS", data.eps || "--"],
              ["Género", data.genero || "--"],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  {k}
                </p>
                <p className="font-black text-gray-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Datos de incapacidad */}
        <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm space-y-4">
          <p className="text-xs font-black text-red-700 uppercase">
            Datos de la Incapacidad
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                Diagnóstico Principal (CIE-10)
              </label>
              <CIE10Input
                value={
                  data.incapacidad?.diagnosticoCIE ||
                  (data.diagnosticos?.[0]
                    ? data.diagnosticos[0].cie10 +
                      " - " +
                      data.diagnosticos[0].descripcion
                    : "")
                }
                onChange={(v) =>
                  setData((p) => ({
                    ...p,
                    incapacidad: { ...p.incapacidad, diagnosticoCIE: v },
                  }))
                }
                placeholder="Buscar CIE-10 - J06.9, lumbalgia, túnel carpo..."
                className="w-full p-2 border-2 border-gray-200 rounded-xl text-xs focus:border-red-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                Origen de la Incapacidad
              </label>
              <select
                value={data.incapacidad?.origen || "Enfermedad General"}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    incapacidad: { ...p.incapacidad, origen: e.target.value },
                  }))
                }
                className="w-full p-2 border-2 border-gray-200 rounded-xl text-xs focus:border-red-400 outline-none font-bold"
              >
                <option>Enfermedad General</option>
                <option>Accidente de Trabajo</option>
                <option>Enfermedad Laboral</option>
                <option>Maternidad</option>
                <option>Accidente de Tránsito</option>
                <option>Lesión Común</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={data.incapacidad?.desde || ""}
                onChange={(e) => {
                  const desde = e.target.value;
                  const hasta = data.incapacidad?.hasta;
                  const dias =
                    desde && hasta
                      ? Math.ceil(
                          Math.abs(new Date(hasta) - new Date(desde)) /
                            (1000 * 60 * 60 * 24)
                        ) + 1
                      : data.incapacidad?.dias || 0;
                  setData((p) => ({
                    ...p,
                    incapacidad: {
                      ...p.incapacidad,
                      desde,
                      dias: dias > 0 ? dias : 0,
                    },
                  }));
                }}
                className="w-full p-2 border-2 border-gray-200 rounded-xl text-xs focus:border-red-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={data.incapacidad?.hasta || ""}
                onChange={(e) => {
                  const hasta = e.target.value;
                  const desde = data.incapacidad?.desde;
                  const dias =
                    desde && hasta
                      ? Math.ceil(
                          Math.abs(new Date(hasta) - new Date(desde)) /
                            (1000 * 60 * 60 * 24)
                        ) + 1
                      : data.incapacidad?.dias || 0;
                  setData((p) => ({
                    ...p,
                    incapacidad: {
                      ...p.incapacidad,
                      hasta,
                      dias: dias > 0 ? dias : 0,
                    },
                  }));
                }}
                className="w-full p-2 border-2 border-gray-200 rounded-xl text-xs focus:border-red-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                Prorroga N°
              </label>
              <input
                value={data.incapacidad?.prorroga || ""}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    incapacidad: { ...p.incapacidad, prorroga: e.target.value },
                  }))
                }
                placeholder="N/A si es primera vez"
                className="w-full p-2 border-2 border-gray-200 rounded-xl text-xs focus:border-red-400 outline-none"
              />
            </div>
            <div className="flex flex-col justify-center items-center bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-[10px] font-black text-red-600 uppercase">
                Días de Incapacidad
              </p>
              <p className="text-5xl font-black text-red-900">
                {data.incapacidad?.dias || diasCalc}
              </p>
              <p className="text-[10px] text-red-700 font-bold text-center">
                {numeroALetras(data.incapacidad?.dias || diasCalc)} DÍAS
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
              Restricciones durante la incapacidad
            </label>
            <textarea
              rows={2}
              value={
                data.incapacidad?.restricciones ||
                "Reposo relativo en casa. Evitar esfuerzo físico y exposición al frío."
              }
              onChange={(e) =>
                setData((p) => ({
                  ...p,
                  incapacidad: {
                    ...p.incapacidad,
                    restricciones: e.target.value,
                  },
                }))
              }
              className="w-full p-2 border-2 border-gray-200 rounded-xl text-xs resize-none focus:border-red-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
              Recomendaciones al paciente
            </label>
            <textarea
              rows={2}
              value={
                data.incapacidad?.recoIncapacidad ||
                "Consultar nuevamente si no hay mejoría o si presenta síntomas de alarma."
              }
              onChange={(e) =>
                setData((p) => ({
                  ...p,
                  incapacidad: {
                    ...p.incapacidad,
                    recoIncapacidad: e.target.value,
                  },
                }))
              }
              className="w-full p-2 border-2 border-gray-200 rounded-xl text-xs resize-none focus:border-red-400 outline-none"
            />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 italic">
              Ley 100/1993 Art. 227 · Decreto 2943/2013 · Decreto 1295/1994 (AT)
            </p>
            <div className="flex gap-2">
              <button
                onClick={printIncap}
                className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Certificado
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // ─── RENDER: AGENDA / SALA DE ESPERA ───────────────────────────────────────

  // ─── renderEvolucionModal ───────────────────────────────────────────────────────────────
  const renderEvolucionModal = () => {
    if (!showEvolucionModal) return null;
    const evoluciones = data.evoluciones || [];
    const evTab = evolucionForm.activeEvTab || "nota";
    const _evTabCls = (t) =>
      `px-3 py-1.5 text-[11px] font-bold rounded-lg transition ${
        evTab === t
          ? "bg-purple-700 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`;

    const guardarEvolucion = () => {
      if (!evolucionForm.texto.trim() && !evolucionForm.motivoConsulta.trim()) {
        showAlert("Ingrese al menos la nota clínica o el motivo de consulta.");
        return;
      }
      const nuevaEv = {
        ...evolucionForm,
        id: Date.now(),
        codigoEvolucion:
          evolucionForm.codigoEvolucion ||
          "EV-" + Date.now().toString(36).toUpperCase().slice(-6),
        medico: activeDoctorData?.nombre || currentUser?.name || "Dr.",
        medicoRM: activeDoctorData?.licencia || "",
        timestamp: new Date().toISOString(),
        tipo: "evolucion_completa",
      };
      const evolsAct = [...(data.evoluciones || []), nuevaEv];
      const updData = {
        ...data,
        evoluciones: evolsAct,
        conceptoAptitud: evolucionForm.nuevoConcept || data.conceptoAptitud,
      };
      setData(updData);
      const updPats = patientsList.map((p) =>
        p.id === data.id
          ? {
              ...p,
              evoluciones: evolsAct,
              conceptoAptitud: updData.conceptoAptitud,
            }
          : p
      );
      setPatientsList(updPats);
      const _suid = currentUser?.empresaId
        ? "empresa_" + currentUser.empresaId
        : currentUser?.user;
      _ls.setItem(_patKey(_suid), JSON.stringify(updPats));
      setEvolucionForm((prev) => ({
        ...prev,
        texto: "",
        motivoConsulta: "",
        planConducta: "",
        recomendaciones: "",
        formulaMedicamentos: [],
        derivaciones: [],
        incapacidad: {
          aplica: false,
          dias: 0,
          origen: "Común",
          diagnostico: "",
          desde: "",
          hasta: "",
        },
        diagnosticos: [{ cie10: "", descripcion: "", tipo: "Principal" }],
        nuevoConcept: "",
        codigoEvolucion:
          "EV-" + Date.now().toString(36).toUpperCase().slice(-6),
        fecha: new Date().toISOString().split("T")[0],
        activeEvTab: "nota",
      }));
      showAlert(
        `✅ Evolución ${nuevaEv.codigoEvolucion} guardada correctamente.`
      );
    };

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-4 flex justify-between items-start flex-shrink-0">
            <div>
              <h2 className="text-white font-black text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Evolución Clínica
              </h2>
              <p className="text-purple-200 text-xs mt-0.5">
                {data.nombres} · HC:{" "}
                <strong className="text-white">
                  {data.codigoVerificacion || "—"}
                </strong>
                {evolucionForm.codigoEvolucion && (
                  <>
                    {" "}
                    · Nuevo código:{" "}
                    <strong className="text-yellow-300">
                      {evolucionForm.codigoEvolucion}
                    </strong>
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowEvolucionModal(false)}
              className="text-white hover:text-purple-200 text-xl font-black mt-0.5"
            >
              ✕
            </button>
          </div>

          {/* Historial previo */}
          {evoluciones.length > 0 && (
            <div className="px-4 pt-3 pb-0 flex-shrink-0 max-h-36 overflow-y-auto border-b border-gray-100">
              <p className="text-[10px] font-black text-gray-500 uppercase mb-1.5">
                📜 Historial ({evoluciones.length} evoluciones previas)
              </p>
              <div className="space-y-1.5">
                {evoluciones
                  .slice()
                  .reverse()
                  .map((ev, idx) => (
                    <div
                      key={ev.id || idx}
                      className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 text-xs"
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-black text-purple-800">
                          {ev.fecha} — {ev.medico || "Dr."}
                        </span>
                        <div className="flex gap-1.5 items-center">
                          {ev.codigoEvolucion && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-[9px] font-black">
                              {ev.codigoEvolucion}
                            </span>
                          )}
                          {ev.nuevoConcept && (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-black">
                              {ev.nuevoConcept}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 text-[10px] leading-snug line-clamp-2">
                        {ev.texto || ev.motivoConsulta || "—"}
                      </p>
                      {ev.formulaMedicamentos?.length > 0 && (
                        <p className="text-[9px] text-blue-600 mt-0.5">
                          💊 {ev.formulaMedicamentos.length} medicamento(s)
                        </p>
                      )}
                      {ev.incapacidad?.aplica && (
                        <p className="text-[9px] text-red-600 mt-0.5">
                          🏥 Incapacidad: {ev.incapacidad.dias} días
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tabs navegación */}
          <div className="flex gap-1 px-4 pt-3 pb-1 flex-shrink-0 flex-wrap">
            {[
              { id: "nota", label: "📝 Nota Clínica" },
              { id: "dx", label: "🩺 Diagnósticos" },
              { id: "plan", label: "📋 Plan" },
              { id: "formula", label: "💊 Fórmula" },
              { id: "incapacidad", label: "🏥 Incapacidad" },
                          { id: "concepto", label: "📄 Concepto Médico" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() =>
                  setEvolucionForm((p) => ({ ...p, activeEvTab: t.id }))
                }
                className={_evTabCls(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
            {/* TAB: Nota Clínica */}
            {evTab === "nota" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={evolucionForm.fecha}
                      onChange={(e) =>
                        setEvolucionForm((p) => ({
                          ...p,
                          fecha: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-purple-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                      Actualizar Concepto
                    </label>
                    <select
                      value={evolucionForm.nuevoConcept}
                      onChange={(e) =>
                        setEvolucionForm((p) => ({
                          ...p,
                          nuevoConcept: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-purple-200 rounded-lg text-xs"
                    >
                      <option value="">— Sin cambio —</option>
                      {[
                        "APTO",
                        "APTO CON RESTRICCIONES",
                        "NO APTO TEMPORAL",
                        "NO APTO DEFINITIVO",
                        "EN SEGUIMIENTO",
                        "PENDIENTE EXÁMENES",
                      ].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                    Motivo de Consulta / Evolución
                  </label>
                  <textarea
                    value={evolucionForm.motivoConsulta}
                    onChange={(e) =>
                      setEvolucionForm((p) => ({
                        ...p,
                        motivoConsulta: e.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Razón de la consulta o seguimiento..."
                    className="w-full p-2 border border-purple-200 rounded-lg text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                    Nota Clínica / Hallazgos *
                  </label>
                  <textarea
                    value={evolucionForm.texto}
                    onChange={(e) =>
                      setEvolucionForm((p) => ({ ...p, texto: e.target.value }))
                    }
                    rows={5}
                    placeholder="Descripción clínica, hallazgos, seguimiento, cambios observados..."
                    className="w-full p-2 border border-purple-200 rounded-lg text-xs resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB: Diagnósticos */}
            {evTab === "dx" && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase">
                  Diagnósticos CIE-10
                </p>
                {(evolucionForm.diagnosticos || []).map((diag, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={diag.cie10}
                      onChange={(e) => {
                        const d = [...evolucionForm.diagnosticos];
                        d[i] = { ...d[i], cie10: e.target.value };
                        setEvolucionForm((p) => ({ ...p, diagnosticos: d }));
                      }}
                      className="w-28 p-1.5 border rounded text-xs font-mono"
                      placeholder="CIE-10"
                    />
                    <input
                      value={diag.descripcion}
                      onChange={(e) => {
                        const d = [...evolucionForm.diagnosticos];
                        d[i] = { ...d[i], descripcion: e.target.value };
                        setEvolucionForm((p) => ({ ...p, diagnosticos: d }));
                      }}
                      className="flex-1 p-1.5 border rounded text-xs"
                      placeholder="Descripción diagnóstico..."
                    />
                    <select
                      value={diag.tipo}
                      onChange={(e) => {
                        const d = [...evolucionForm.diagnosticos];
                        d[i] = { ...d[i], tipo: e.target.value };
                        setEvolucionForm((p) => ({ ...p, diagnosticos: d }));
                      }}
                      className="w-28 p-1.5 border rounded text-xs"
                    >
                      <option>Principal</option>
                      <option>Secundario</option>
                      <option>En estudio</option>
                    </select>
                    {i > 0 && (
                      <button
                        onClick={() =>
                          setEvolucionForm((p) => ({
                            ...p,
                            diagnosticos: p.diagnosticos.filter(
                              (_, j) => j !== i
                            ),
                          }))
                        }
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() =>
                    setEvolucionForm((p) => ({
                      ...p,
                      diagnosticos: [
                        ...p.diagnosticos,
                        { cie10: "", descripcion: "", tipo: "Secundario" },
                      ],
                    }))
                  }
                  className="text-purple-600 text-[11px] font-bold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3 h-3" /> Agregar diagnóstico
                </button>
              </div>
            )}

            {/* TAB: Plan y Conducta */}
            {evTab === "plan" && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                    Conducta y Plan de Manejo
                  </label>
                  <textarea
                    value={evolucionForm.planConducta}
                    onChange={(e) =>
                      setEvolucionForm((p) => ({
                        ...p,
                        planConducta: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Tratamiento, conducta médica, decisiones clínicas..."
                    className="w-full p-2 border border-purple-200 rounded-lg text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                    Recomendaciones al Paciente
                  </label>
                  <textarea
                    value={evolucionForm.recomendaciones}
                    onChange={(e) =>
                      setEvolucionForm((p) => ({
                        ...p,
                        recomendaciones: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Indicaciones, cuidados, próxima cita..."
                    className="w-full p-2 border border-purple-200 rounded-lg text-xs resize-none"
                  />
                </div>
                {/* Derivaciones */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase">
                      Derivaciones / Interconsultas
                    </label>
                    <button
                      onClick={() =>
                        setEvolucionForm((p) => ({
                          ...p,
                          derivaciones: [
                            ...(p.derivaciones || []),
                            {
                              especialidad: "",
                              motivo: "",
                              urgencia: "Electiva",
                            },
                          ],
                        }))
                      }
                      className="text-purple-600 text-[10px] font-bold flex items-center gap-0.5 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Agregar
                    </button>
                  </div>
                  {(evolucionForm.derivaciones || []).map((der, i) => (
                    <div key={i} className="flex gap-1.5 items-center mb-1.5">
                      <input
                        value={der.especialidad}
                        onChange={(e) => {
                          const d = [...evolucionForm.derivaciones];
                          d[i] = { ...d[i], especialidad: e.target.value };
                          setEvolucionForm((p) => ({ ...p, derivaciones: d }));
                        }}
                        className="flex-1 p-1.5 border rounded text-xs"
                        placeholder="Especialidad..."
                      />
                      <input
                        value={der.motivo}
                        onChange={(e) => {
                          const d = [...evolucionForm.derivaciones];
                          d[i] = { ...d[i], motivo: e.target.value };
                          setEvolucionForm((p) => ({ ...p, derivaciones: d }));
                        }}
                        className="flex-1 p-1.5 border rounded text-xs"
                        placeholder="Motivo..."
                      />
                      <select
                        value={der.urgencia}
                        onChange={(e) => {
                          const d = [...evolucionForm.derivaciones];
                          d[i] = { ...d[i], urgencia: e.target.value };
                          setEvolucionForm((p) => ({ ...p, derivaciones: d }));
                        }}
                        className="w-24 p-1.5 border rounded text-xs"
                      >
                        <option>Electiva</option>
                        <option>Prioritaria</option>
                        <option>Urgente</option>
                      </select>
                      <button
                        onClick={() =>
                          setEvolucionForm((p) => ({
                            ...p,
                            derivaciones: p.derivaciones.filter(
                              (_, j) => j !== i
                            ),
                          }))
                        }
                        className="text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Fórmula Médica */}
            {evTab === "formula" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase">
                    Medicamentos Prescritos
                  </p>
                  <button
                    onClick={() =>
                      setEvolucionForm((p) => ({
                        ...p,
                        formulaMedicamentos: [
                          ...(p.formulaMedicamentos || []),
                          {
                            nombre: "",
                            presentacion: "",
                            dosis: "",
                            frecuencia: "",
                            duracion: "",
                            indicaciones: "",
                          },
                        ],
                      }))
                    }
                    className="text-purple-600 text-[11px] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Agregar medicamento
                  </button>
                </div>
                {(evolucionForm.formulaMedicamentos || []).length === 0 && (
                  <p className="text-center text-gray-400 text-xs py-6 border border-dashed rounded-xl">
                    Sin medicamentos. Use el botón + para agregar.
                  </p>
                )}
                {(evolucionForm.formulaMedicamentos || []).map((med, i) => (
                  <div
                    key={i}
                    className="border border-purple-100 rounded-xl p-3 space-y-2 bg-purple-50/50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-purple-700">
                        Medicamento #{i + 1}
                      </span>
                      <button
                        onClick={() =>
                          setEvolucionForm((p) => ({
                            ...p,
                            formulaMedicamentos: p.formulaMedicamentos.filter(
                              (_, j) => j !== i
                            ),
                          }))
                        }
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={med.nombre}
                        onChange={(e) => {
                          const m = [...evolucionForm.formulaMedicamentos];
                          m[i] = { ...m[i], nombre: e.target.value };
                          setEvolucionForm((p) => ({
                            ...p,
                            formulaMedicamentos: m,
                          }));
                        }}
                        className="p-1.5 border rounded text-xs"
                        placeholder="Nombre medicamento *"
                      />
                      <input
                        value={med.presentacion}
                        onChange={(e) => {
                          const m = [...evolucionForm.formulaMedicamentos];
                          m[i] = { ...m[i], presentacion: e.target.value };
                          setEvolucionForm((p) => ({
                            ...p,
                            formulaMedicamentos: m,
                          }));
                        }}
                        className="p-1.5 border rounded text-xs"
                        placeholder="Presentación (mg, ml...)"
                      />
                      <input
                        value={med.dosis}
                        onChange={(e) => {
                          const m = [...evolucionForm.formulaMedicamentos];
                          m[i] = { ...m[i], dosis: e.target.value };
                          setEvolucionForm((p) => ({
                            ...p,
                            formulaMedicamentos: m,
                          }));
                        }}
                        className="p-1.5 border rounded text-xs"
                        placeholder="Dosis"
                      />
                      <input
                        value={med.frecuencia}
                        onChange={(e) => {
                          const m = [...evolucionForm.formulaMedicamentos];
                          m[i] = { ...m[i], frecuencia: e.target.value };
                          setEvolucionForm((p) => ({
                            ...p,
                            formulaMedicamentos: m,
                          }));
                        }}
                        className="p-1.5 border rounded text-xs"
                        placeholder="Frecuencia (c/8h...)"
                      />
                      <input
                        value={med.duracion}
                        onChange={(e) => {
                          const m = [...evolucionForm.formulaMedicamentos];
                          m[i] = { ...m[i], duracion: e.target.value };
                          setEvolucionForm((p) => ({
                            ...p,
                            formulaMedicamentos: m,
                          }));
                        }}
                        className="p-1.5 border rounded text-xs"
                        placeholder="Duración (5 días...)"
                      />
                      <input
                        value={med.indicaciones}
                        onChange={(e) => {
                          const m = [...evolucionForm.formulaMedicamentos];
                          m[i] = { ...m[i], indicaciones: e.target.value };
                          setEvolucionForm((p) => ({
                            ...p,
                            formulaMedicamentos: m,
                          }));
                        }}
                        className="p-1.5 border rounded text-xs"
                        placeholder="Indicaciones especiales"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Incapacidad */}
            {evTab === "incapacidad" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <input
                    type="checkbox"
                    checked={evolucionForm.incapacidad?.aplica || false}
                    onChange={(e) =>
                      setEvolucionForm((p) => ({
                        ...p,
                        incapacidad: {
                          ...p.incapacidad,
                          aplica: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-red-600"
                    id="evIncapCheck"
                  />
                  <label
                    htmlFor="evIncapCheck"
                    className="text-sm font-black text-red-700 cursor-pointer"
                  >
                    Aplica incapacidad médica
                  </label>
                </div>
                {evolucionForm.incapacidad?.aplica && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                        Días de incapacidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="540"
                        value={evolucionForm.incapacidad?.dias || ""}
                        onChange={(e) =>
                          setEvolucionForm((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              dias: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-red-200 rounded-lg text-sm font-bold text-red-700"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                        Origen
                      </label>
                      <select
                        value={evolucionForm.incapacidad?.origen || "Común"}
                        onChange={(e) =>
                          setEvolucionForm((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              origen: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-red-200 rounded-lg text-xs"
                      >
                        <option>Común</option>
                        <option>Laboral</option>
                        <option>Accidente de Trabajo</option>
                        <option>Enfermedad Profesional</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                        Fecha inicio
                      </label>
                      <input
                        type="date"
                        value={evolucionForm.incapacidad?.desde || ""}
                        onChange={(e) =>
                          setEvolucionForm((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              desde: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                        Fecha fin
                      </label>
                      <input
                        type="date"
                        value={evolucionForm.incapacidad?.hasta || ""}
                        onChange={(e) =>
                          setEvolucionForm((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              hasta: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                        Diagnóstico (CIE-10)
                      </label>
                      <input
                        value={evolucionForm.incapacidad?.diagnostico || ""}
                        onChange={(e) =>
                          setEvolucionForm((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              diagnostico: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border rounded-lg text-xs"
                        placeholder="Código CIE-10 y descripción..."
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
                    {/* TAB: Concepto Médico + Certificado */}
          {evTab === "concepto" && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-emerald-800 mb-2">📄 Concepto Médico Ocupacional</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-black text-gray-600 block mb-1">Concepto de Aptitud</label>
                    <select
                      value={evolucionForm.nuevoConcept || ""}
                      onChange={(e) => setEvolucionForm((p) => ({ ...p, nuevoConcept: e.target.value }))}
                      className="w-full p-2 border border-emerald-300 rounded text-xs bg-white"
                    >
                      <option value="">-- Seleccione concepto --</option>
                      <option value="APTO">APTO</option>
                      <option value="APTO CON RESTRICCIONES">APTO CON RESTRICCIONES</option>
                      <option value="NO APTO">NO APTO</option>
                      <option value="APTO CON LIMITACIONES">APTO CON LIMITACIONES</option>
                      <option value="PENDIENTE">PENDIENTE - Requiere evaluación adicional</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-600 block mb-1">Recomendaciones y Restricciones</label>
                    <textarea
                      rows={3}
                      value={evolucionForm.recomendaciones || ""}
                      onChange={(e) => setEvolucionForm((p) => ({ ...p, recomendaciones: e.target.value }))}
                      className="w-full p-2 border border-emerald-300 rounded text-xs"
                      placeholder="Describa restricciones, recomendaciones y condiciones especiales..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-600 block mb-1">Observaciones adicionales</label>
                    <textarea
                      rows={2}
                      value={evolucionForm.texto || ""}
                      onChange={(e) => setEvolucionForm((p) => ({ ...p, texto: e.target.value }))}
                      className="w-full p-2 border border-emerald-300 rounded text-xs"
                      placeholder="Observaciones del médico..."
                    />
                  </div>
                </div>
              </div>
              {evolucionForm.nuevoConcept && (
                <button
                  onClick={() => {
                    const certData = { ...data, conceptoMedico: evolucionForm.nuevoConcept, recomendaciones: evolucionForm.recomendaciones, fechaCierre: new Date().toISOString().split("T")[0] };
                    const html = _generarCertificadoHTMLNormalizado(certData, activeDoctorData || {}, activeSignature, companies.find((c) => c.id === currentUser?.empresaId) || {});
                    const win = window.open("", "_blank");
                    if (win) { win.document.write(html); win.document.close(); win.print(); }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2"
                >
                  📄 Expedir Nuevo Certificado Médico
                </button>
              )}
            </div>
          )}

          {/* Footer: guardar */}
          <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center flex-shrink-0 bg-gray-50 rounded-b-2xl">
            <div className="text-[10px] text-gray-400">
              Médico:{" "}
              <span className="font-bold text-gray-600">
                {activeDoctorData?.nombre || currentUser?.name}
              </span>
              {activeDoctorData?.licencia && (
                <span className="ml-2 text-emerald-600 font-bold">
                  RM: {activeDoctorData.licencia}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEvolucionModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEvolucion}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-xl flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Guardar Evolución
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER: MENSAJERÍA INTERNA ────────────────────────────────────────────
  // Called inline as overlay + floating panel - not a full-page view

  // ─── renderMensajesOverlay ───────────────────────────────────────────────────────────────
  const renderMensajesOverlay = () => {
    if (!showMensajePanel) return null;
    const esMensajeAdmin = _isAdmin(currentUser?.role);
    // Mensajes que me corresponden (como destinatario) o que yo envié
    const misMensajes = mensajes
      .filter(
        (m) =>
          m.destinatarios?.includes(currentUser?.user) ||
          m.from === currentUser?.user
      )
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const noLeidos = misMensajes.filter(
      (m) => !m.leido && m.destinatarios?.includes(currentUser?.user)
    ).length;
    const saveMensajes = (upd) => {
      setMensajes(upd);
      _sync("siso_mensajes", JSON.stringify(upd));
      _sbSet("siso_mensajes", upd);
    };
    const enviarMensaje = () => {
      if (!composeMensaje.texto.trim()) {
        showAlert("Escriba un mensaje.");
        return;
      }
      if (!composeMensaje.destinatarios.length) {
        showAlert("Seleccione al menos un destinatario.");
        return;
      }
      const nm = {
        id: "msg_" + Date.now(),
        from: currentUser?.user,
        fromName: currentUser?.name,
        destinatarios: composeMensaje.destinatarios,
        texto: composeMensaje.texto.trim(),
        fecha: new Date().toISOString(),
        leido: false,
        respuesta: null,
        respondido: false,
      };
      saveMensajes([...mensajes, nm]);
      setComposeMensaje({ destinatarios: [], texto: "" });
      setShowComposeMensaje(false);
      showAlert("✅ Aviso enviado.");
    };
    const responderMensaje = (msg) => {
      if (!mensajeRespuesta.trim()) {
        showAlert("Escriba una respuesta.");
        return;
      }
      const upd = mensajes.map((m) =>
        m.id === msg.id
          ? {
              ...m,
              respuesta: mensajeRespuesta.trim(),
              respondido: true,
              leido: true,
              respondidoPor: currentUser?.name,
              respondidoEn: new Date().toISOString(),
            }
          : m
      );
      saveMensajes(upd);
      setMensajeRespuesta("");
      showAlert("✅ Respuesta enviada.");
    };
    const marcarLeido = (msgId) => {
      const upd = mensajes.map((m) =>
        m.id === msgId ? { ...m, leido: true } : m
      );
      saveMensajes(upd);
    };
    const todosUsuarios = usersList.filter(
      (u) => u.user !== currentUser?.user && u.activo !== false
    );
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-start pointer-events-none">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 pointer-events-auto"
          onClick={() => setShowMensajePanel(false)}
        />
        {/* Panel */}
        <div
          className="relative pointer-events-auto m-4 w-96 max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxWidth: "calc(100vw - 2rem)" }}
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white px-5 py-3 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <p className="font-black text-sm">Mensajes Internos</p>
              {noLeidos > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {noLeidos}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {esMensajeAdmin && (
                <button
                  onClick={() => setShowComposeMensaje((v) => !v)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1"
                >
                  ✏️ Nuevo
                </button>
              )}
              <button
                onClick={() => setShowMensajePanel(false)}
                className="text-white/80 hover:text-white text-lg font-black leading-none"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Compose (admin only) */}
          {esMensajeAdmin && showComposeMensaje && (
            <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex-shrink-0">
              <p className="text-[10px] font-black text-indigo-700 uppercase mb-2">
                Nuevo Aviso
              </p>
              <div className="mb-2">
                <p className="text-[10px] font-bold text-gray-500 mb-1">
                  Destinatarios:
                </p>
                <div className="flex flex-wrap gap-1">
                  {todosUsuarios.map((u) => (
                    <button
                      key={u.user}
                      onClick={() =>
                        setComposeMensaje((p) => ({
                          ...p,
                          destinatarios: p.destinatarios.includes(u.user)
                            ? p.destinatarios.filter((d) => d !== u.user)
                            : [...p.destinatarios, u.user],
                        }))
                      }
                      className={`text-[9px] px-2 py-1 rounded-full font-bold border transition ${
                        composeMensaje.destinatarios.includes(u.user)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                      }`}
                    >
                      {u.name}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setComposeMensaje((p) => ({
                        ...p,
                        destinatarios: todosUsuarios.map((u) => u.user),
                      }))
                    }
                    className="text-[9px] px-2 py-1 rounded-full font-bold border bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                  >
                    ✓ Todos
                  </button>
                </div>
              </div>
              <textarea
                value={composeMensaje.texto}
                onChange={(e) =>
                  setComposeMensaje((p) => ({ ...p, texto: e.target.value }))
                }
                placeholder="Escriba el aviso para los usuarios seleccionados..."
                rows={3}
                className="w-full p-2 border border-indigo-200 rounded-lg text-xs resize-none focus:ring-2 focus:ring-indigo-300 outline-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={enviarMensaje}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-black hover:bg-indigo-700"
                >
                  Enviar Aviso
                </button>
                <button
                  onClick={() => setShowComposeMensaje(false)}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {/* Lista de mensajes */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {misMensajes.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-xs font-bold">Sin mensajes</p>
              </div>
            )}
            {misMensajes.map((msg) => {
              const esParaMi = msg.destinatarios?.includes(currentUser?.user);
              const esMio = msg.from === currentUser?.user;
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    if (esParaMi && !msg.leido) marcarLeido(msg.id);
                  }}
                  className={`rounded-xl border p-3 cursor-default transition ${
                    !msg.leido && esParaMi
                      ? "bg-indigo-50 border-indigo-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="text-[10px] font-black text-gray-600">
                      {esMio
                        ? `📤 Tú → ${
                            msg.destinatarios?.length > 1
                              ? "Varios"
                              : usersList.find(
                                  (u) => u.user === msg.destinatarios?.[0]
                                )?.name || "?"
                          }`
                        : `📥 ${msg.fromName || msg.from}`}
                    </p>
                    <p className="text-[9px] text-gray-400 flex-shrink-0">
                      {new Date(msg.fecha).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    {msg.texto}
                  </p>
                  {/* Respuesta ya enviada */}
                  {msg.respondido && (
                    <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                      <p className="text-[9px] font-black text-emerald-700">
                        Respondido por {msg.respondidoPor}:
                      </p>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        {msg.respuesta}
                      </p>
                    </div>
                  )}
                  {/* Form responder (si es para mí y no ha sido respondido) */}
                  {esParaMi && !msg.respondido && (
                    <div className="mt-2 space-y-1.5">
                      <textarea
                        value={mensajeRespuesta}
                        onChange={(e) => setMensajeRespuesta(e.target.value)}
                        placeholder="Respuesta libre (opcional)..."
                        rows={2}
                        className="w-full p-1.5 border border-gray-300 rounded-lg text-xs resize-none focus:ring-1 focus:ring-indigo-300 outline-none"
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => responderMensaje(msg)}
                          className="flex-1 bg-indigo-600 text-white py-1.5 rounded-lg text-[10px] font-black hover:bg-indigo-700"
                        >
                          Responder
                        </button>
                        <button
                          onClick={() => {
                            const upd = mensajes.map((m) =>
                              m.id === msg.id ? { ...m, leido: true } : m
                            );
                            saveMensajes(upd);
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded-lg text-[10px] font-black hover:bg-gray-300"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => {
                            const upd = mensajes.map((m) =>
                              m.id === msg.id
                                ? { ...m, leido: true, rechazado: true }
                                : m
                            );
                            saveMensajes(upd);
                          }}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-[10px] font-black hover:bg-red-200"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  // ── B-F1-03: Persistir portafolio ──────────────────────────────────────
  const savePortafolio = (items) => {
    setPortafolioItems(items);
    try {
      localStorage.setItem("siso_portafolio", JSON.stringify(items));
    } catch {}
  };
  // ── B-F1-04: Persistir cotizaciones ──────────────────────────────────
  const saveCotizaciones = (list) => {
    setCotizaciones(list);
    try {
      localStorage.setItem("siso_cotizaciones", JSON.stringify(list));
    } catch {}
  };
  const nextCotizNum = () => {
    const max = cotizaciones.reduce(
      (m, c) => Math.max(m, parseInt(c.numero || "0") || 0),
      0
    );
    return String(max + 1).padStart(4, "0");
  };
  // ── B-F2-01: Persistir caja ───────────────────────────────────────────
  const saveCaja = (movs) => {
    setCajaMovimientos(movs);
    try {
      // PASO 6: clave aislada por empresa/usuario
      const suf = currentUser?.empresaId
        ? "empresa_" + currentUser.empresaId
        : currentUser?.user || "shared";
      localStorage.setItem(`siso_caja_${suf}`, JSON.stringify(movs));
      _sbSet(`siso_caja_movs_${suf}`, movs); // Bloque 3: sync Supabase
    } catch {}
  };
  // ── B-F2-01/02: Generar comprobante ──────────────────────────────────
  const openComprobanteWindow = (tipo, mov) => {
    const doc = activeDoctorData;
    const _miIPSComp = currentUser?.empresaId
      ? companies.find((c) => c.id === currentUser.empresaId) || null
      : null;
    const num = mov.id || Date.now();
    const fecha = mov.fecha || new Date().toLocaleDateString("es-CO");
    const tipoLabel =
      tipo === "ingreso"
        ? "COMPROBANTE DE INGRESO"
        : tipo === "egreso"
        ? "COMPROBANTE DE EGRESO"
        : "RECIBO DE CAJA";
    const _compLeftHtml = _miIPSComp
      ? `<div style="text-align:left;">
          ${
            _safeLogoUrl(_miIPSComp.logo || "") // SEC-FIX-02
              ? `<img src="${_safeLogoUrl(_miIPSComp.logo)}" style="max-height:36px;max-width:90px;object-fit:contain;display:block;margin-bottom:3px;"/>`
              : ""
          }
          <div style="font-size:11px;font-weight:900;color:#1a1a1a;">${_sanitize(
            _miIPSComp.nombre || ""
          )}</div>
          ${
            _miIPSComp.nit
              ? `<div style="font-size:9px;color:#555;">NIT: ${_sanitize(
                  _miIPSComp.nit
                )}${_miIPSComp.dv ? "-" + _sanitize(_miIPSComp.dv) : ""}</div>`
              : ""
          }
          ${
            _miIPSComp.direccion
              ? `<div style="font-size:9px;color:#555;">${_sanitize(
                  _miIPSComp.direccion
                )}${
                  _miIPSComp.ciudad ? " · " + _sanitize(_miIPSComp.ciudad) : ""
                }</div>`
              : ""
          }
          ${
            _miIPSComp.telefono
              ? `<div style="font-size:9px;color:#555;">Tel: ${_sanitize(
                  _miIPSComp.telefono
                )}</div>`
              : ""
          }
        </div>`
      : `<div style="text-align:left;">
          <div style="font-size:11px;font-weight:900;color:#1a1a1a;">${_sanitize(
            doc?.nombre || ""
          )}</div>
          <div style="font-size:9px;color:#555;">${_sanitize(
            doc?.titulo || ""
          )}</div>
          <div style="font-size:9px;color:#555;">Lic: ${_sanitize(
            doc?.licencia || ""
          )} · ${_sanitize(doc?.ciudad || "")}</div>
        </div>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${tipoLabel}</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:24px;font-size:11px;color:#111}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a1a1a;padding-bottom:12px;margin-bottom:16px}
.title{font-size:14px;font-weight:900;text-transform:uppercase;margin:4px 0;text-align:right}
.sub{font-size:10px;color:#555;text-align:right}
table{width:100%;border-collapse:collapse;margin-top:8px}
th{background:#1a1a1a;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
td{padding:5px 8px;border-bottom:1px solid #ddd;font-size:11px}
.total-row td{font-weight:900;font-size:13px;background:#f0f0f0}
.firma{margin-top:40px;text-align:right}
.firma-line{border-top:1px solid #555;width:200px;margin-left:auto;padding-top:4px;font-size:10px;text-align:center}
.no-print{margin-top:16px;display:flex;gap:8px;justify-content:center}
@media print{.no-print{display:none}}
</style></head><body>
<div class="header">
${_compLeftHtml}
<div>
<div class="title">${tipoLabel}</div>
<div class="sub">No. ${num} · Fecha: ${fecha}</div>
</div>
</div>
<table>
<tr><th>Campo</th><th>Detalle</th></tr>
<tr><td>Concepto</td><td>${mov.concepto || ""}</td></tr>
<tr><td>Forma de pago</td><td>${mov.formaPago || ""}</td></tr>
<tr class="total-row"><td>MONTO</td><td>$ ${Number(
      mov.monto || 0
    ).toLocaleString("es-CO")} COP</td></tr>
</table>
<div class="firma">
<div class="firma-line">${_sanitize(doc?.nombre || "")}<br/>${_sanitize(
      doc?.titulo || ""
    )}<br/>Lic: ${_sanitize(doc?.licencia || "")}</div>
</div>
<div class="no-print">
<button onclick="window.print()" style="background:#1a1a1a;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:900;cursor:pointer">🖨️ Imprimir</button>
<button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:900;cursor:pointer">✕ Cerrar</button>
</div></body></html>`;
    const w = window.open("", "_blank", "width=560,height=620");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };
  // ── B-F1-05: Carné manipulación alimentos ────────────────────────────
  const openCarnetAlimentos = (paciente, docData) => {
    const doc = docData || activeDoctorData;
    const p = paciente || {};
    const empresa = companies.find((c) => c.id === p.empresaId);
    const fechaVig = p.vigencia
      ? new Date(
          new Date(p.fechaConsulta || Date.now()).getTime() +
            parseInt(p.vigencia) * 24 * 60 * 60 * 1000
        ).toLocaleDateString("es-CO")
      : "Ver concepto médico";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Carné Manipulación de Alimentos</title>
<style>
@media print{body{margin:0}@page{size:8.5cm 5.5cm;margin:0}}
body{font-family:Arial,sans-serif;margin:0;background:#f5f5f5}
.carne{width:8.5cm;height:5.5cm;background:#fff;border:2px solid #1a6b2f;border-radius:8px;
  overflow:hidden;display:flex;flex-direction:column;padding:8px;box-sizing:border-box;
  margin:10px auto;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.hdr{background:#1a6b2f;color:#fff;text-align:center;padding:3px;border-radius:4px;margin-bottom:4px}
.hdr h1{font-size:7px;margin:0;font-weight:900;text-transform:uppercase}
.body{display:flex;gap:6px;flex:1}
.foto{width:35px;height:45px;border:1px solid #1a6b2f;border-radius:4px;
  display:flex;align-items:center;justify-content:center;font-size:18px;
  background:#f0faf0;flex-shrink:0;overflow:hidden}
.foto img{width:100%;height:100%;object-fit:cover}
.info{flex:1;font-size:7px;line-height:1.4}
.info .nom{font-weight:900;font-size:8px;color:#1a6b2f}
.bottom{display:flex;justify-content:space-between;align-items:flex-end;margin-top:3px}
.firma{text-align:center;font-size:6px;border-top:1px solid #333;padding-top:1px;width:60px}
.valid{background:#d1fae5;border:1px solid #1a6b2f;border-radius:4px;padding:2px 6px;
  font-size:7px;font-weight:900;color:#065f46;text-align:center}
.no-print{text-align:center;padding:10px;display:flex;gap:8px;justify-content:center}
@media print{.no-print{display:none}}
</style></head><body>
<div class="carne">
<div class="hdr"><h1>🍽️ Carné Médico - Manipulación de Alimentos</h1></div>
<div class="body">
<div class="foto">${
      p.fotoPaciente ? `<img src="${p.fotoPaciente}" alt="Foto"/>` : "📷"
    }</div>
<div class="info">
<div class="nom">${p.nombres || "Paciente"}</div>
<div><b>Doc:</b> ${p.docTipo || "CC"} ${p.docNumero || ""}</div>
<div><b>Empresa:</b> ${empresa?.nombre || p.empresaId || "Particular"}</div>
<div><b>Cargo:</b> ${p.cargo || "-"}</div>
<div><b>Concepto:</b> ${p.conceptoAptitud || "APTO"}</div>
<div><b>Fecha:</b> ${
      p.fechaConsulta || new Date().toLocaleDateString("es-CO")
    }</div>
</div></div>
<div class="bottom">
<div class="firma">${doc?.nombre || ""}<br/>${doc?.titulo || ""}<br/>Lic: ${
      doc?.licencia || ""
    }</div>
<div class="valid">✅ VÁLIDO<br/>Hasta: ${fechaVig}</div>
</div></div>
<div class="no-print">
<button onclick="window.print()" style="background:#1a6b2f;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:900;cursor:pointer">🖨️ Imprimir Carné</button>
<button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:900;cursor:pointer">✕ Cerrar</button>
</div></body></html>`;
    const w = window.open("", "_blank", "width=380,height=320");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };


  return {
    renderNavbar,
    renderTabAdjuntos,
    renderTabSolicitudExamenes,
    renderTabIncapacidadGeneral,
    renderEvolucionModal,
    renderMensajesOverlay,
  };
}
