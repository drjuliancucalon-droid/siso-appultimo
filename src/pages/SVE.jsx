import React from 'react';
import {
  BrainCircuit
} from "lucide-react";

// ─── SVE Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const SVE = (props) => {
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

    // ── PLAN GATE: SVE requiere plan STARTER o superior ──
    if (!_canUse("sve_starter", currentUser))
      return (
        <div className="min-h-screen bg-gray-50 font-sans">
          {renderNavbar()}
          <div className="max-w-2xl mx-auto px-4 py-12">
            <PlanGate
              feature="sve_starter"
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
    // ── SECRETARIA GATE: "Sistema de Vigilancia Epidemiológica (SVE)" requiere autorización del admin ──
    if (
      currentUser?.role === "secretaria" &&
      !_secretariaPuede("sve", currentUser, usersList)
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
                Sistema de Vigilancia Epidemiológica (SVE)
              </p>
              <p className="text-amber-600 text-xs leading-relaxed">
                Este módulo requiere autorización explícita del administrador.
                <br />
                Solicita que habilite el permiso{" "}
                <strong>"Sistema de Vigilancia Epidemiológica (SVE)"</strong> en
                tu perfil.
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
    const maxProgramas =
      PLAN_CONFIG[currentUser?.license || "libre"].maxSVEprogramas;
    const PROGRAMAS_ALL = [
      {
        id: "DME",
        label: "DME (Desórdenes Músculo-Esqueléticos)",
        riesgo: "Ergonómico",
        cie: "M00-M99",
      },
      {
        id: "PREC",
        label: "Precursores Cardiovasculares",
        riesgo: "Cardiovascular",
        cie: "I10-I15",
      },
      {
        id: "RESP",
        label: "Resp. Ocupacional",
        riesgo: "Inhalación",
        cie: "J00-J99",
      },
      {
        id: "DER",
        label: "Dermatosis Ocupacional",
        riesgo: "Químico/Físico",
        cie: "L00-L99",
      },
      {
        id: "PSICO",
        label: "Riesgo Psicosocial",
        riesgo: "Psicosocial",
        cie: "F10-F99",
      },
      {
        id: "RUI",
        label: "HNIR (Ruido)",
        riesgo: "Físico-Ruido",
        cie: "H60-H95",
      },
      {
        id: "QUIM",
        label: "Exposición a sustancias químicas",
        riesgo: "Químico",
        cie: "T36-T65",
      },
    ];
    // STARTER solo ve los primeros 2 programas; PRO+ todos
    const PROGRAMAS =
      maxProgramas < 7 ? PROGRAMAS_ALL.slice(0, maxProgramas) : PROGRAMAS_ALL;
    const prog = PROGRAMAS.find((p) => p.id === svePrograma) || PROGRAMAS[0];
    const SVE_RISK_MAP = {
      DME: ["musculoesquelético", "ergon", "lumbar", "columna"],
      PREC: ["cardiovascular", "hipertensión", "colesterol"],
      RESP: ["respiratorio", "pulmonar", "asma", "silicosis"],
      DER: ["dermatitis", "piel"],
      PSICO: ["psicosocial", "estrés", "burnout"],
      RUI: ["auditivo", "ruido", "hipoacusia"],
      QUIM: ["químico", "solvente", "plomo", "mercurio"],
    };
    const keywords = SVE_RISK_MAP[svePrograma] || [];
    const allPats = patientsList.filter(
      (p) => p.fechaExamen && !p._archivado && p.estadoHistoria === "Cerrada"
    );
    const filteredProg = allPats.filter((p) => {
      const hasDx = (p.diagnosticos || []).some((d) =>
        keywords.some((k) =>
          (d.descripcion || d.codigo || "").toLowerCase().includes(k)
        )
      );
      const hasRiesgo = keywords.some((k) =>
        (JSON.stringify(p.riesgos || {}) || "").toLowerCase().includes(k)
      );
      return hasDx || hasRiesgo;
    });
    const filtered = sveFiltroEmpresa
      ? filteredProg.filter(
          (p) =>
            p.empresaId === sveFiltroEmpresa || p.empresa === sveFiltroEmpresa
        )
      : filteredProg;
    const exportarSVE = () => {
      const header = [
        "Nombre",
        "Cédula",
        "Empresa",
        "Cargo",
        "Fecha examen",
        "Concepto",
        "Programa SVE",
        "Restricciones",
      ];
      const rows = filtered.map((p) => [
        p.nombres,
        p.docNumero,
        p.empresaNombre || p.empresa,
        p.cargo,
        p.fechaExamen,
        p.conceptoAptitud,
        prog.label,
        p.restricciones || "",
      ]);
      const csv = [header, ...rows]
        .map((r) =>
          r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SVE_${prog.id}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      URL.revokeObjectURL(url);
    };
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderNavbar()}
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goBack()}
              className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50"
            >
              <span className="text-gray-600 text-sm">←</span>
            </button>
            <div>
              <h1 className="font-black text-gray-800 text-lg">
                Sistema de Vigilancia Epidemiológica
              </h1>
              <p className="text-xs text-gray-400">
                SVE · Res. 2346/2007 · Res. 1843/2025 · Identificación de
                trabajadores en riesgo
              </p>
            </div>
          </div>
          {/* Selector de programa */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">
              Programa SVE
            </p>
            <div className="flex gap-2 flex-wrap">
              {PROGRAMAS.map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => setSvePrograma(pr.id)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-lg border transition ${
                    svePrograma === pr.id
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                  }`}
                >
                  {pr.id}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-3 items-center flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                  Filtrar por empresa
                </p>
                <select
                  value={sveFiltroEmpresa}
                  onChange={(e) => setSveFiltroEmpresa(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                >
                  <option value="">Todas las empresas</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-xs">
                <p className="font-black text-teal-700">{prog.label}</p>
                <p className="text-teal-600">
                  Riesgo: {prog.riesgo} · CIE-10: {prog.cie}
                </p>
              </div>
            </div>
          </div>
          {/* ── IA SVE: Análisis por empresa ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-black text-violet-800 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> Análisis IA por Empresa -
                  SVE
                </p>
                <p className="text-[10px] text-violet-500">
                  Clasificación automática de trabajadores por factor de riesgo,
                  diagnóstico, recomendaciones y fecha de control
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-end mb-3 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">
                  Empresa a analizar
                </label>
                <select
                  value={sveAIFiltroEmpresa}
                  onChange={(e) => setSveAIFiltroEmpresa(e.target.value)}
                  className="w-full p-2 border border-violet-200 rounded-lg text-xs"
                >
                  <option value="">Todas las empresas</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <button
                disabled={sveAICargando}
                onClick={async () => {
                  if (!_canUse("ia_analisis", currentUser)) {
                    showAlert(
                      "🔒 El análisis IA requiere plan ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes"
                    );
                    return;
                  }
                  const _sveEmpNombre = sveAIFiltroEmpresa
                    ? companies.find((c) => c.id === sveAIFiltroEmpresa)
                        ?.nombre || ""
                    : "";
                  const patsToAnalyze = patientsList.filter(
                    (p) =>
                      p.estadoHistoria === "Cerrada" &&
                      p.fechaExamen &&
                      (!sveAIFiltroEmpresa ||
                        p.empresaId === sveAIFiltroEmpresa ||
                        p.empresaNombre === _sveEmpNombre)
                  );
                  if (!patsToAnalyze.length) {
                    showAlert(
                      "Sin pacientes cerrados para analizar.\nVerifique que las HCs estén cerradas y firmadas."
                    );
                    return;
                  }
                  setSveAIAnalisisCargando(true);
                  setSveAIAnalisis(null);
                  try {
                    const empresaNombreAI = sveAIFiltroEmpresa
                      ? companies.find((c) => c.id === sveAIFiltroEmpresa)
                          ?.nombre || "empresa seleccionada"
                      : "todas las empresas";
                    // Preparar resumen compacto para no exceder tokens
                    const resumen = patsToAnalyze.map((p) => ({
                      n: String(p.nombres || "").slice(0, 40),
                      d: String(p.docNumero || "").slice(0, 20),
                      c: String(p.cargo || "--").slice(0, 30),
                      e: String(p.empresaNombre || p.empresa || "").slice(
                        0,
                        30
                      ),
                      nit: String(p.empresaNit || "").slice(0, 20),
                      r: Object.entries(p.riesgos || {})
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join(",")
                        .slice(0, 60),
                      // ── FIX: campo dx (diagnósticos) — antes ausente ──
                      dx:
                        (p.diagnosticos || [])
                          .map((d) =>
                            `${d.codigo || ""} ${d.descripcion || ""}`.trim()
                          )
                          .join("; ")
                          .slice(0, 120) ||
                        (p.diagnosticoPrincipal || "--").slice(0, 80),
                      co: String(p.conceptoAptitud || "--").slice(0, 50),
                      rs: String(
                        Array.isArray(p.analisisRestricciones)
                          ? p.analisisRestricciones.join("; ")
                          : p.analisisRestricciones || p.restricciones || ""
                      ).slice(0, 80),
                      rc: String(
                        Array.isArray(p.recomendacionesOcupacionales)
                          ? p.recomendacionesOcupacionales.join("; ")
                          : p.recomendacionesOcupacionales ||
                              p.recomendaciones ||
                              ""
                      ).slice(0, 80),
                      f: String(p.fechaExamen || "").slice(0, 12),
                    }));
                    const prompt = `Eres médico especialista en Medicina del Trabajo y SVE (Vigilancia Epidemiológica) en Colombia (Res. 2346/2007 · Res. 1843/2025). Analiza ${
                      patsToAnalyze.length
                    } trabajadores${
                      sveAIFiltroEmpresa
                        ? ` de "${empresaNombreAI}"`
                        : " de varias empresas"
                    } y clasifícalos en programas SVE.

DATOS TRABAJADORES (n=nombre, d=doc, c=cargo, e=empresa, nit=NIT empresa, r=riesgos exposición, dx=diagnósticos CIE-10, co=concepto aptitud, rs=restricciones, rc=recomendaciones, f=fechaExamen):
${JSON.stringify(resumen)}

INSTRUCCIONES:
1. AGRUPA los resultados POR EMPRESA (campo "e")
2. Clasifica cada trabajador: DME (músculo-esquelético/ergonómico) | PREC (cardiovascular/hipertensión) | RESP (respiratorio/pulmonar) | DER (dermatológico) | PSICO (psicosocial/estrés) | RUI (ruido/hipoacusia) | QUIM (sustancias químicas) | NINGUNO
3. Basa la clasificación en: diagnósticos dx, riesgos r, restricciones rs y recomendaciones rc
4. Factor de riesgo: describe el principal hallazgo clínico/ocupacional
5. Acción recomendada: concreta y aplicable (ingreso a programa, evaluación, examen específico)
6. Meses control: tiempo hasta próxima evaluación (1-12)
7. Prioridad: alta (síntomas activos/riesgo inminente) | media (hallazgos a seguir) | baja (preventivo/rutina)
8. Para cada empresa: perfil epidemiológico en 2-3 frases (riesgos predominantes, % en SVE)

RESPONDE ÚNICAMENTE JSON VÁLIDO sin texto previo ni bloques markdown:
{"resumenGeneral":"texto resumen global todos los trabajadores analizados","totalAnalizados":${
                      patsToAnalyze.length
                    },"totalEnSVE":N,"empresas":[{"nombre":"nombre empresa","nit":"NIT","totalTrabajadores":N,"trabajadoresEnSVE":N,"perfilEpidemiologico":"texto 2-3 frases","trabajadores":[{"nombre":"nombre completo","doc":"cedula","cargo":"cargo","programaSVE":"DME","factorRiesgo":"descripcion concreta","accionRecomendada":"accion concreta","mesesControl":6,"prioridad":"media"}]}],"programas":{"DME":0,"PREC":0,"RESP":0,"DER":0,"PSICO":0,"RUI":0,"QUIM":0,"NINGUNO":0}}`;

                    const txt = await callAI(prompt, true);
                    let clean = (txt || "").replace(/```json|```/g, "").trim();
                    // Extract JSON object robustly
                    const jStart = clean.indexOf("{");
                    const jEnd = clean.lastIndexOf("}");
                    if (jStart !== -1 && jEnd > jStart)
                      clean = clean.slice(jStart, jEnd + 1);
                    else if (!clean.startsWith("{")) clean = "{}";
                    const parsed = JSON.parse(clean);
                    // Compatibilidad hacia atrás: si la IA devuelve esquema viejo (trabajadores flat)
                    // convertir al nuevo esquema por empresa
                    if (
                      !parsed.empresas &&
                      Array.isArray(parsed.trabajadores)
                    ) {
                      const grouped = {};
                      (parsed.trabajadores || []).forEach((t) => {
                        const emp =
                          t.empresa || empresaNombreAI || "Sin empresa";
                        if (!grouped[emp]) grouped[emp] = [];
                        grouped[emp].push(t);
                      });
                      parsed.empresas = Object.entries(grouped).map(
                        ([nombre, trab]) => ({
                          nombre,
                          nit: "",
                          totalTrabajadores: trab.length,
                          trabajadoresEnSVE: trab.filter(
                            (t) => t.programaSVE !== "NINGUNO"
                          ).length,
                          perfilEpidemiologico: parsed.resumenEmpresa || "",
                          trabajadores: trab,
                        })
                      );
                      parsed.totalEnSVE = (parsed.empresas || []).reduce(
                        (s, e) => s + e.trabajadoresEnSVE,
                        0
                      );
                    }
                    // Normalizar programas: si es array de nombres → convertir a conteo
                    if (
                      parsed.programas &&
                      Array.isArray(Object.values(parsed.programas)[0])
                    ) {
                      const normProg = {};
                      Object.entries(parsed.programas).forEach(([k, v]) => {
                        normProg[k] = Array.isArray(v) ? v.length : v;
                      });
                      parsed.programas = normProg;
                    }
                    setSveAIAnalisis({
                      ...parsed,
                      empresaNombre: empresaNombreAI,
                      fecha: new Date().toLocaleDateString("es-CO"),
                    });
                  } catch (e) {
                    showAlert(
                      "Error en análisis IA SVE:\n" +
                        (e.message || "Error desconocido") +
                        "\n\nVerifique su API Key en ⚙️ Configuración → IA"
                    );
                  } finally {
                    setSveAIAnalisisCargando(false);
                  }
                }}
                className="px-4 py-2 bg-violet-700 text-white text-xs font-black rounded-xl hover:bg-violet-800 flex items-center gap-2 disabled:opacity-60"
              >
                {sveAICargando ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                    Analizando...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-3.5 h-3.5" /> Analizar con IA
                  </>
                )}
              </button>
            </div>
            {sveAIAnalisis && (
              <div className="space-y-4">
                {/* ── Tarjetas resumen global ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-violet-700">
                      {sveAIAnalisis.totalAnalizados || 0}
                    </p>
                    <p className="text-[10px] font-black text-violet-500 uppercase">
                      Analizados
                    </p>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-teal-700">
                      {sveAIAnalisis.totalEnSVE || 0}
                    </p>
                    <p className="text-[10px] font-black text-teal-500 uppercase">
                      En algún SVE
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-blue-700">
                      {(sveAIAnalisis.empresas || []).length}
                    </p>
                    <p className="text-[10px] font-black text-blue-500 uppercase">
                      Empresas
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-amber-700">
                      {sveAIAnalisis.totalAnalizados > 0
                        ? Math.round(
                            ((sveAIAnalisis.totalEnSVE || 0) /
                              sveAIAnalisis.totalAnalizados) *
                              100
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-[10px] font-black text-amber-500 uppercase">
                      Cobertura SVE
                    </p>
                  </div>
                </div>
                {/* ── Resumen general ── */}
                {sveAIAnalisis.resumenGeneral && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                    <p className="text-xs font-black text-violet-800 mb-1">
                      📊 Resumen Epidemiológico General
                    </p>
                    <p className="text-xs text-violet-700 leading-relaxed">
                      {sveAIAnalisis.resumenGeneral}
                    </p>
                    <p className="text-[10px] text-violet-400 mt-1">
                      Análisis IA · {sveAIAnalisis.fecha}
                    </p>
                  </div>
                )}
                {/* ── Distribución por programa ── */}
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(sveAIAnalisis.programas || {})
                    .filter(([, v]) => Number(v) > 0)
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .map(([prog, count]) => (
                      <div
                        key={prog}
                        className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-center"
                      >
                        <p className="text-lg font-black text-teal-700">
                          {count}
                        </p>
                        <p className="text-[10px] font-black text-teal-600">
                          {prog}
                        </p>
                      </div>
                    ))}
                </div>
                {/* ── Tabla POR EMPRESA ── */}
                {(sveAIAnalisis.empresas || []).map((emp, ei) => (
                  <div
                    key={ei}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Header empresa */}
                    <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-black text-white text-sm">
                          🏢 {emp.nombre}
                        </p>
                        {emp.nit && (
                          <p className="text-violet-200 text-[10px]">
                            NIT: {emp.nit}
                          </p>
                        )}
                        {emp.perfilEpidemiologico && (
                          <p className="text-violet-100 text-[10px] mt-0.5 leading-relaxed max-w-lg">
                            {emp.perfilEpidemiologico}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="bg-white/20 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                          {emp.trabajadoresEnSVE || 0} /{" "}
                          {emp.totalTrabajadores ||
                            emp.trabajadores?.length ||
                            0}{" "}
                          en SVE
                        </span>
                      </div>
                    </div>
                    {/* Tabla trabajadores */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-violet-50 text-[10px] font-black text-violet-600 uppercase">
                          <tr>
                            {[
                              "Trabajador",
                              "Doc.",
                              "Cargo",
                              "Programa SVE",
                              "Factor de Riesgo",
                              "Acción Recomendada",
                              "Control",
                              "Prioridad",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-2 text-left whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(emp.trabajadores || []).map((t, ti) => (
                            <tr
                              key={ti}
                              className={`hover:bg-violet-50/30 ${
                                t.programaSVE === "NINGUNO" ? "opacity-60" : ""
                              }`}
                            >
                              <td className="px-3 py-2 font-bold text-gray-800 whitespace-nowrap">
                                {t.nombre}
                              </td>
                              <td className="px-3 py-2 text-gray-500 font-mono text-[10px]">
                                {t.doc}
                              </td>
                              <td className="px-3 py-2 text-gray-600 max-w-[120px]">
                                {t.cargo || "--"}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap ${
                                    t.programaSVE === "NINGUNO"
                                      ? "bg-gray-100 text-gray-500"
                                      : t.programaSVE === "DME"
                                      ? "bg-blue-100 text-blue-800"
                                      : t.programaSVE === "PREC"
                                      ? "bg-red-100 text-red-800"
                                      : t.programaSVE === "RESP"
                                      ? "bg-cyan-100 text-cyan-800"
                                      : t.programaSVE === "PSICO"
                                      ? "bg-purple-100 text-purple-800"
                                      : t.programaSVE === "RUI"
                                      ? "bg-orange-100 text-orange-800"
                                      : t.programaSVE === "QUIM"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-teal-100 text-teal-800"
                                  }`}
                                >
                                  {t.programaSVE}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-gray-600 max-w-[160px]">
                                {t.factorRiesgo}
                              </td>
                              <td className="px-3 py-2 text-gray-600 max-w-[200px]">
                                {t.accionRecomendada}
                              </td>
                              <td className="px-3 py-2 text-center font-black text-violet-700 whitespace-nowrap">
                                {t.mesesControl ? `${t.mesesControl}m` : "--"}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap ${
                                    t.prioridad === "alta"
                                      ? "bg-red-100 text-red-700"
                                      : t.prioridad === "media"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {t.prioridad}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                {/* ── Exportar CSV completo ── */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const header = [
                        "Empresa",
                        "NIT",
                        "Trabajador",
                        "Doc.",
                        "Cargo",
                        "Programa SVE",
                        "Factor Riesgo",
                        "Acción Recomendada",
                        "Meses Control",
                        "Prioridad",
                      ];
                      const rows = [];
                      (sveAIAnalisis.empresas || []).forEach((emp) => {
                        (emp.trabajadores || []).forEach((t) => {
                          rows.push([
                            emp.nombre,
                            emp.nit || "",
                            t.nombre,
                            t.doc,
                            t.cargo || "--",
                            t.programaSVE,
                            t.factorRiesgo,
                            t.accionRecomendada,
                            t.mesesControl,
                            t.prioridad,
                          ]);
                        });
                      });
                      const csv = [header, ...rows]
                        .map((r) =>
                          r
                            .map(
                              (c) =>
                                `"${(c || "").toString().replace(/"/g, '""')}"`
                            )
                            .join(",")
                        )
                        .join("\n");
                      const blob = new Blob([csv], {
                        type: "text/csv;charset=utf-8;",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `SVE_IA_${
                        new Date().toISOString().split("T")[0]
                      }.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-teal-600 text-white text-xs font-black rounded-xl hover:bg-teal-700 flex items-center gap-2"
                  >
                    📥 Exportar CSV completo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tabla SVE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-black text-gray-700 text-sm">
                  Trabajadores en programa {prog.id}
                </p>
                <p className="text-[10px] text-gray-400">
                  {filtered.length} trabajadores identificados
                </p>
              </div>
              {filtered.length > 0 && (
                <button
                  onClick={exportarSVE}
                  className="text-xs font-black px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-1"
                >
                  📥 Exportar CSV
                </button>
              )}
            </div>
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-2xl mb-2">🔬</p>
                <p className="text-sm font-bold">
                  Sin trabajadores identificados en este programa
                </p>
                <p className="text-xs mt-1">
                  Los trabajadores aparecen automáticamente cuando tienen
                  diagnósticos o riesgos asociados al programa
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase">
                    <tr>
                      {[
                        "Trabajador",
                        "Empresa",
                        "Cargo",
                        "Fecha",
                        "Concepto",
                        "Restricciones",
                      ].map((h) => (
                        <th key={h} className="px-4 py-2 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5">
                          <p className="font-bold text-gray-800">{p.nombres}</p>
                          <p className="text-gray-400">
                            {p.docTipo} {p.docNumero}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">
                          {p.empresaNombre || p.empresa || "--"}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">
                          {p.cargo || "--"}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {p.fechaExamen || "--"}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              (p.conceptoAptitud || "")
                                .toLowerCase()
                                .includes("no apto")
                                ? "bg-red-100 text-red-700"
                                : (p.conceptoAptitud || "")
                                    .toLowerCase()
                                    .includes("condic")
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {p.conceptoAptitud || "--"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 max-w-[180px] truncate">
                          {p.restricciones || "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );

};

export default SVE;
