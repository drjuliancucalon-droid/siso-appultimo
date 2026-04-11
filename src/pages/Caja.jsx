import React from 'react';
import {
  Download
} from "lucide-react";

// ─── Caja Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const Caja = (props) => {
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

    // Secretaria necesita permiso 'caja' para acceder al módulo financiero
    if (
      currentUser?.role === "secretaria" &&
      !_secretariaPuede("caja", currentUser, usersList)
    )
      return (
        <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
          {renderNavbar()}
          <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm">
            <p className="text-4xl mb-3">🔒</p>
            <p className="font-black text-gray-800 mb-1">Acceso restringido</p>
            <p className="text-xs text-gray-500">
              El módulo financiero no está habilitado para su perfil. Solicite
              acceso al administrador.
            </p>
            <button
              onClick={() => goTo("dashboard")}
              className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-bold"
            >
              ← Volver
            </button>
          </div>
        </div>
      );
    const hoy = new Date().toISOString().split("T")[0];
    // ── IPS: scope caja movements to empresa ──
    const _scopedCaja = currentUser?.empresaId
      ? cajaMovimientos.filter(
          (m) =>
            m.empresaId === currentUser.empresaId ||
            m.medicoId === currentUser?.user
        )
      : cajaMovimientos;
    const movHoy = _scopedCaja.filter((m) => m.fecha === hoy);
    const movHistorial = [..._scopedCaja].reverse();
    // PASO 4: filtros de periodo
    const _getPeriodoRange = () => {
      const d = new Date();
      if (cajaFiltroPeriodo === "hoy") return { desde: hoy, hasta: hoy };
      if (cajaFiltroPeriodo === "semana") {
        const dow = d.getDay();
        const diff = d.getDate() - (dow === 0 ? 6 : dow - 1);
        const lun = new Date(d.setDate(diff));
        const dom = new Date(new Date(lun).setDate(lun.getDate() + 6));
        return {
          desde: lun.toISOString().split("T")[0],
          hasta: dom.toISOString().split("T")[0],
        };
      }
      if (cajaFiltroPeriodo === "mes")
        return { desde: hoy.slice(0, 7) + "-01", hasta: hoy };
      if (cajaFiltroPeriodo === "anio")
        return { desde: hoy.slice(0, 4) + "-01-01", hasta: hoy };
      if (cajaFiltroPeriodo === "rango")
        return { desde: cajaFiltroDesde || hoy, hasta: cajaFiltroHasta || hoy };
      return { desde: hoy, hasta: hoy };
    };
    const { desde: _pDesde, hasta: _pHasta } = _getPeriodoRange();
    const movPeriodo = _scopedCaja.filter(
      (m) => m.fecha >= _pDesde && m.fecha <= _pHasta
    );
    const ingresosTot = movPeriodo
      .filter((m) => m.tipo === "ingreso")
      .reduce((s, m) => s + Number(m.monto || 0), 0);
    const egresosTot = movPeriodo
      .filter((m) => m.tipo === "egreso")
      .reduce((s, m) => s + Number(m.monto || 0), 0);
    const saldoHoy = ingresosTot - egresosTot;
    const porCobrarTot = movPeriodo
      .filter((m) => m._autoGenerated && m.estado === "pendiente")
      .reduce((s, m) => s + Number(m.monto || 0), 0);
    const pacientesVistosCount = movPeriodo.filter(
      (m) => m._autoGenerated
    ).length;
    // Marcar autoMov como cobrado
    const cobrarAutoMov = (movId, monto, forma) => {
      const updCaja = cajaMovimientos.map((m) =>
        m.id === movId
          ? {
              ...m,
              estado: "cobrado",
              montoCobrado: monto,
              formaPagoCobro: forma,
              cobradoEn: new Date().toISOString(),
            }
          : m
      );
      saveCaja(updCaja);
    };
    const handleAddMov = () => {
      if (!cajaForm.concepto.trim()) {
        showAlert("Ingrese el concepto del movimiento.");
        return;
      }
      if (
        !cajaForm.monto ||
        isNaN(Number(cajaForm.monto)) ||
        Number(cajaForm.monto) <= 0
      ) {
        showAlert("Ingrese un monto válido mayor a 0.");
        return;
      }
      const nuevo = {
        ...cajaForm,
        id: "mov_" + Date.now(),
        timestamp: new Date().toISOString(),
        usuario: currentUser?.user || "-",
        medicoId: currentUser?.user || "-",
        medicoNombre: currentUser?.name || currentUser?.user || "-",
        // ── IPS: auto-tag con empresaId ──
        ...(currentUser?.empresaId ? { empresaId: currentUser.empresaId } : {}),
      };
      const updated = [...cajaMovimientos, nuevo];
      saveCaja(updated);
      setCajaForm({
        tipo: "ingreso",
        concepto: "",
        monto: "",
        formaPago: "Efectivo",
        fecha: new Date().toISOString().split("T")[0],
      });
    };
    const deleteMovimiento = (id) => {
      if (currentUser?.role === "secretaria") {
        showAlert(
          "⛔ Solo el administrador puede eliminar movimientos de caja."
        );
        return;
      }
      showConfirm("¿Eliminar este movimiento?", () =>
        saveCaja(cajaMovimientos.filter((m) => m.id !== id))
      );
    };
    // Cuentas por cobrar - de savedBillsList (si existen)
    // ── IPS: scope billing to empresa ──
    const _scopedBills = currentUser?.empresaId
      ? savedBillsList.filter(
          (b) =>
            b.empresaId === currentUser.empresaId ||
            b.companyId === currentUser.empresaId
        )
      : savedBillsList;
    const cuentasPendientes = _scopedBills.filter((b) => !b.pagada);
    const cuentasPagadas = _scopedBills.filter((b) => b.pagada);
    const totalPendiente = cuentasPendientes.reduce(
      (s, b) => s + Number(b.amount || 0),
      0
    );
    const totalCobrado = cuentasPagadas.reduce(
      (s, b) => s + Number(b.amount || 0),
      0
    );
    const marcarPagada = (id) => {
      const updated = savedBillsList.map((b) =>
        b.id === id
          ? {
              ...b,
              pagada: true,
              fechaPago: new Date().toISOString().split("T")[0],
            }
          : b
      );
      setSavedBillsList(updated);
      {
        const _bSuf = currentUser?.empresaId
          ? "empresa_" + currentUser.empresaId
          : currentUser?.user || "shared";
        _sync(`siso_saved_bills_${_bSuf}`, JSON.stringify(updated));
      }
    };
    const editarCuenta = (bill) => {
      showPrompt("Código de seguridad para editar:", (secCode) => {
        if (secCode !== "9207") {
          showAlert("⛔ Código incorrecto.");
          return;
        }
        showPrompt(
          "Nuevo monto (actual: $" +
            Number(bill.amount || 0).toLocaleString("es-CO") +
            ")\nDeje en blanco para no cambiar el monto:",
          (nuevoMonto) => {
            const montoFinal =
              nuevoMonto &&
              nuevoMonto.trim() &&
              !isNaN(Number(nuevoMonto.trim()))
                ? nuevoMonto.trim()
                : bill.amount;
            showPrompt(
              "¿Marcar como pagada? Escriba SI para confirmar (o deje en blanco):",
              (confirm) => {
                const marcarPag = (confirm || "").trim().toUpperCase() === "SI";
                const updated = savedBillsList.map((b) =>
                  b.id === bill.id
                    ? {
                        ...b,
                        amount: montoFinal,
                        pagada: marcarPag || b.pagada,
                        fechaPago:
                          marcarPag && !b.fechaPago
                            ? new Date().toISOString().split("T")[0]
                            : b.fechaPago,
                        editadoEn: new Date().toISOString(),
                      }
                    : b
                );
                setSavedBillsList(updated);
                {
                  const _bSuf = currentUser?.empresaId
                    ? "empresa_" + currentUser.empresaId
                    : currentUser?.user || "shared";
                  _sync(`siso_saved_bills_${_bSuf}`, JSON.stringify(updated));
                }
                showAlert(
                  "✅ Cuenta actualizada." +
                    (marcarPag ? "\nMarcada como pagada." : "")
                );
              }
            );
          }
        );
      });
    };
    const eliminarCuenta = (id) => {
      showPrompt("Código de seguridad para eliminar:", (code) => {
        if (code !== "9207") {
          showAlert("⛔ Código incorrecto.");
          return;
        }
        showConfirm("¿Eliminar esta cuenta permanentemente?", () => {
          const updated = savedBillsList.filter((b) => b.id !== id);
          setSavedBillsList(updated);
          {
            const _bSuf = currentUser?.empresaId
              ? "empresa_" + currentUser.empresaId
              : currentUser?.user || "shared";
            _sync(`siso_saved_bills_${_bSuf}`, JSON.stringify(updated));
          }
        });
      });
    };
    // Agrupación de cuentas por empresa/convenio
    const cuentasFiltro = savedBillsList;
    const groupByEmpresa = {};
    cuentasFiltro.forEach((b) => {
      const key = b.companyName || b.empresa || b.clientName || "Sin empresa";
      if (!groupByEmpresa[key]) groupByEmpresa[key] = [];
      groupByEmpresa[key].push(b);
    });
    // Pacientes de hoy para caja
    const pacientesHoy = patientsList.filter(
      (p) => p.fechaExamen === hoy || p.fechaRegistro?.startsWith(hoy)
    );
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderNavbar()}
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
              💰 Módulo Financiero
            </h2>
            <button
              onClick={() => goTo("dashboard")}
              className="text-gray-500 font-bold text-sm hover:text-gray-700"
            >
              ← Volver
            </button>
          </div>
          {/* PASO 4: Selector de periodo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 flex flex-wrap gap-2 items-center">
            {[
              { k: "hoy", l: "Hoy" },
              { k: "semana", l: "Semana" },
              { k: "mes", l: "Mes" },
              { k: "anio", l: "Año" },
              { k: "rango", l: "📅 Rango" },
            ].map((p) => (
              <button
                key={p.k}
                onClick={() => setCajaFiltroPeriodo(p.k)}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition ${
                  cajaFiltroPeriodo === p.k
                    ? "bg-blue-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p.l}
              </button>
            ))}
            {cajaFiltroPeriodo === "rango" && (
              <div className="flex gap-2 items-center ml-2">
                <input
                  type="date"
                  value={cajaFiltroDesde}
                  onChange={(e) => setCajaFiltroDesde(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                />
                <span className="text-gray-400 text-xs">–</span>
                <input
                  type="date"
                  value={cajaFiltroHasta}
                  onChange={(e) => setCajaFiltroHasta(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                />
              </div>
            )}
          </div>
          {/* Resumen del periodo */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="text-xs font-black text-emerald-700 uppercase mb-1">
                Ingresos
              </div>
              <div className="text-lg font-black text-emerald-800">
                $ {ingresosTot.toLocaleString("es-CO")}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-xs font-black text-red-700 uppercase mb-1">
                Egresos
              </div>
              <div className="text-lg font-black text-red-800">
                $ {egresosTot.toLocaleString("es-CO")}
              </div>
            </div>
            <div
              className={`${
                saldoHoy >= 0
                  ? "bg-blue-50 border-blue-200"
                  : "bg-orange-50 border-orange-200"
              } border rounded-xl p-3 text-center`}
            >
              <div className="text-xs font-black text-gray-700 uppercase mb-1">
                Balance
              </div>
              <div
                className={`text-lg font-black ${
                  saldoHoy >= 0 ? "text-blue-800" : "text-orange-800"
                }`}
              >
                $ {saldoHoy.toLocaleString("es-CO")}
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
              <div className="text-xs font-black text-yellow-700 uppercase mb-1">
                Por cobrar
              </div>
              <div className="text-lg font-black text-yellow-800">
                $ {porCobrarTot.toLocaleString("es-CO")}
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
              <div className="text-xs font-black text-purple-700 uppercase mb-1">
                Pacientes
              </div>
              <div className="text-lg font-black text-purple-800">
                {pacientesVistosCount}
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-4 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            {[
              { k: "hoy", l: "💵 Caja del Día" },
              { k: "historial", l: "📜 Historial" },
              { k: "comprobantes", l: "📋 Comprobantes" },
              {
                k: "cuentas",
                l: `💳 Cuentas (${cuentasPendientes.length} pend.)`,
              },
              {
                k: "pacientes_vistos",
                l: `👁️ Pacientes Vistos (${pacientesVistosCount})`,
              },
              ...(_isAdmin(currentUser?.role)
                ? [{ k: "por_medico", l: "👨‍⚕️ Por Médico" }]
                : []),
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setCajaTab(t.k)}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                  cajaTab === t.k
                    ? "bg-blue-700 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
          {/* TAB: CAJA DEL DÍA */}
          {cajaTab === "hoy" && (
            <div className="space-y-4">
              {/* Formulario nuevo movimiento */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs font-black text-gray-700 uppercase mb-3">
                  ➕ Registrar movimiento
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                      Tipo
                    </label>
                    <select
                      value={cajaForm.tipo}
                      onChange={(e) =>
                        setCajaForm((p) => ({ ...p, tipo: e.target.value }))
                      }
                      className="w-full p-2 border rounded-lg text-xs font-bold"
                    >
                      <option value="ingreso">💚 Ingreso</option>
                      <option value="egreso">❤️ Egreso</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                      Concepto *
                    </label>
                    <input
                      value={cajaForm.concepto}
                      onChange={(e) =>
                        setCajaForm((p) => ({ ...p, concepto: e.target.value }))
                      }
                      className="w-full p-2 border rounded-lg text-xs"
                      placeholder="Consulta Pto. Fuentes S.A.S · Materiales..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                      Monto COP *
                    </label>
                    <input
                      type="number"
                      value={cajaForm.monto}
                      onChange={(e) =>
                        setCajaForm((p) => ({ ...p, monto: e.target.value }))
                      }
                      className="w-full p-2 border rounded-lg text-xs"
                      placeholder="150000"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                      Forma de pago
                    </label>
                    <select
                      value={cajaForm.formaPago}
                      onChange={(e) =>
                        setCajaForm((p) => ({
                          ...p,
                          formaPago: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-lg text-xs"
                    >
                      {[
                        "Efectivo",
                        "Transferencia",
                        "Nequi",
                        "Daviplata",
                        "Cheque",
                        "Datafono",
                        "Otro",
                      ].map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={cajaForm.fecha}
                      onChange={(e) =>
                        setCajaForm((p) => ({ ...p, fecha: e.target.value }))
                      }
                      className="w-full p-2 border rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddMov}
                      className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-lg"
                    >
                      💾 Registrar
                    </button>
                  </div>
                </div>
              </div>
              {/* Movimientos del día */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs font-black text-gray-700 uppercase mb-3">
                  Movimientos del{" "}
                  {new Date(hoy + "T12:00").toLocaleDateString("es-CO")} (
                  {movHoy.length})
                </p>
                {movHoy.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-6">
                    Sin movimientos hoy. Registre el primero.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {movHoy.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          m.tipo === "ingreso"
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {m.tipo === "ingreso" ? "💚" : "❤️"}
                          </span>
                          <div>
                            <p className="font-black text-xs text-gray-800">
                              {m.concepto}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {m.formaPago} · {m.usuario}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-black text-sm ${
                              m.tipo === "ingreso"
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            {m.tipo === "ingreso" ? "+" : "-"}${" "}
                            {Number(m.monto || 0).toLocaleString("es-CO")}
                          </span>
                          <button
                            onClick={() => deleteMovimiento(m.id)}
                            className="text-gray-400 hover:text-red-500 font-black"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* ── PACIENTES DE HOY - checklist cobro ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs font-black text-gray-700 uppercase mb-3">
                  👥 Pacientes de hoy ({pacientesHoy.length}) - Checklist de
                  cobro
                </p>
                {pacientesHoy.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-4">
                    Sin pacientes registrados hoy.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pacientesHoy.map((pac) => {
                      const movPac = movHoy.find(
                        (m) => m.tipo === "ingreso" && m.pacienteId === pac.id
                      );
                      return (
                        <div
                          key={pac.id}
                          className={`flex items-center justify-between p-3 rounded-xl border ${
                            movPac
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span>{movPac ? "✅" : "⏳"}</span>
                            <div>
                              <p className="font-black text-xs text-gray-800">
                                {pac.nombres}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {pac.empresaNombre ||
                                  pac.empresa ||
                                  "Particular"}{" "}
                                · {pac.tipoExamen || "Consulta"}
                              </p>
                            </div>
                          </div>
                          {!movPac ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Monto"
                                id={`mp-${pac.id}`}
                                className="w-24 p-1.5 border rounded-lg text-xs"
                              />
                              <select
                                id={`fp-${pac.id}`}
                                className="p-1.5 border rounded-lg text-xs"
                              >
                                {[
                                  "Efectivo",
                                  "Transferencia",
                                  "Nequi",
                                  "Daviplata",
                                  "Datafono",
                                ].map((f) => (
                                  <option key={f}>{f}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  const monto = document.getElementById(
                                    "mp-" + pac.id
                                  )?.value;
                                  const forma =
                                    document.getElementById("fp-" + pac.id)
                                      ?.value || "Efectivo";
                                  if (!monto || isNaN(+monto) || +monto <= 0) {
                                    showAlert("Ingrese un monto.");
                                    return;
                                  }
                                  saveCaja([
                                    ...cajaMovimientos,
                                    {
                                      tipo: "ingreso",
                                      concepto: `Consulta - ${pac.nombres}`,
                                      monto,
                                      formaPago: forma,
                                      fecha: hoy,
                                      id: "mov_" + Date.now(),
                                      timestamp: new Date().toISOString(),
                                      usuario: currentUser?.user || "-",
                                      pacienteId: pac.id,
                                      empresa:
                                        pac.empresaNombre ||
                                        pac.empresa ||
                                        "Particular",
                                    },
                                  ]);
                                }}
                                className="px-3 py-1.5 bg-emerald-700 text-white text-[10px] font-black rounded-lg"
                              >
                                ✅ Cobrar
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-black text-emerald-700">
                              ${" "}
                              {Number(movPac.monto || 0).toLocaleString(
                                "es-CO"
                              )}{" "}
                              · {movPac.formaPago}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* TAB: HISTORIAL */}
          {cajaTab === "historial" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-black text-gray-700 uppercase">
                  Historial completo ({cajaMovimientos.length} movimientos)
                </p>
                <button
                  onClick={() => {
                    const rows = [
                      [
                        "ID",
                        "Fecha",
                        "Tipo",
                        "Concepto",
                        "Monto",
                        "FormaPago",
                        "Usuario",
                      ],
                    ];
                    cajaMovimientos.forEach((m) =>
                      rows.push([
                        m.id,
                        m.fecha,
                        m.tipo,
                        m.concepto,
                        m.monto,
                        m.formaPago,
                        m.usuario,
                      ])
                    );
                    const csv = rows
                      .map((r) =>
                        r
                          .map(
                            (v) => `"${String(v || "").replace(/"/g, '""')}"`
                          )
                          .join(",")
                      )
                      .join("\n");
                    const b = new Blob([csv], { type: "text/csv" });
                    const u = URL.createObjectURL(b);
                    const a = document.createElement("a");
                    a.href = u;
                    a.download = "caja_historial.csv";
                    a.click();
                    URL.revokeObjectURL(u);
                  }}
                  className="px-3 py-1 bg-emerald-700 text-white text-[10px] font-black rounded-lg"
                >
                  📥 CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      {[
                        "Fecha",
                        "Tipo",
                        "Concepto",
                        "Monto",
                        "Forma Pago",
                        "Usuario",
                        "Acc.",
                      ].map((h) => (
                        <th key={h} className="p-2 text-left font-black">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movHistorial.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-gray-400"
                        >
                          Sin movimientos registrados
                        </td>
                      </tr>
                    ) : (
                      movHistorial.map((m, i) => (
                        <tr
                          key={m.id}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="p-2">{m.fecha}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                                m.tipo === "ingreso"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {m.tipo}
                            </span>
                          </td>
                          <td className="p-2 font-bold">{m.concepto}</td>
                          <td
                            className={`p-2 font-black ${
                              m.tipo === "ingreso"
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            $ {Number(m.monto || 0).toLocaleString("es-CO")}
                          </td>
                          <td className="p-2 text-gray-500">{m.formaPago}</td>
                          <td className="p-2 text-gray-400">{m.usuario}</td>
                          <td className="p-2 flex gap-1">
                            <button
                              onClick={() => openComprobanteWindow(m.tipo, m)}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold hover:bg-blue-200 text-[10px]"
                            >
                              🖨️
                            </button>
                            <button
                              onClick={() => deleteMovimiento(m.id)}
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
          {/* TAB: COMPROBANTES */}
          {cajaTab === "comprobantes" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-black text-gray-700 uppercase mb-3">
                📋 Comprobantes de Contabilidad
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Seleccione cualquier movimiento del historial y pulse 🖨️ para
                generar su comprobante imprimible.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    titulo: "Comprobante de Ingreso",
                    desc: "Para pagos recibidos de pacientes o empresas",
                    tipo: "ingreso",
                    color: "emerald",
                  },
                  {
                    titulo: "Comprobante de Egreso",
                    desc: "Para pagos realizados a proveedores",
                    tipo: "egreso",
                    color: "red",
                  },
                  {
                    titulo: "Recibo de Caja",
                    desc: "Recibo simple de transacción",
                    tipo: "recibo",
                    color: "blue",
                  },
                  {
                    titulo: "Documento Equivalente",
                    desc: "Para transacciones sin factura formal",
                    tipo: "equivalente",
                    color: "purple",
                  },
                ].map((c) => (
                  <div
                    key={c.tipo}
                    className={`bg-${c.color}-50 border border-${c.color}-200 rounded-xl p-4`}
                  >
                    <h3
                      className={`font-black text-${c.color}-800 text-sm mb-1`}
                    >
                      {c.titulo}
                    </h3>
                    <p className={`text-${c.color}-600 text-[10px] mb-3`}>
                      {c.desc}
                    </p>
                    <button
                      onClick={() => {
                        const mov = {
                          tipo: c.tipo,
                          concepto: "[Complete en el comprobante]",
                          monto: 0,
                          formaPago: "",
                          fecha: new Date().toLocaleDateString("es-CO"),
                          id: "MANUAL-" + Date.now(),
                        };
                        openComprobanteWindow(c.tipo, mov);
                      }}
                      className={`px-3 py-1.5 bg-${c.color}-700 hover:bg-${c.color}-800 text-white text-[10px] font-black rounded-lg`}
                    >
                      🖨️ Generar en blanco
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                💡 Para generar comprobantes de movimientos ya registrados, vaya
                a <strong>📜 Historial</strong> y pulse el ícono 🖨️
              </div>
            </div>
          )}
          {/* TAB: CUENTAS POR COBRAR */}
          {cajaTab === "cuentas" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <div className="text-xs font-black text-red-700 uppercase mb-1">
                    ⏳ Pendiente por cobrar
                  </div>
                  <div className="text-2xl font-black text-red-800">
                    $ {totalPendiente.toLocaleString("es-CO")}
                  </div>
                  <div className="text-[10px] text-red-600">
                    {cuentasPendientes.length} cuenta(s)
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <div className="text-xs font-black text-emerald-700 uppercase mb-1">
                    ✅ Total cobrado
                  </div>
                  <div className="text-2xl font-black text-emerald-800">
                    $ {totalCobrado.toLocaleString("es-CO")}
                  </div>
                  <div className="text-[10px] text-emerald-600">
                    {cuentasPagadas.length} cuenta(s)
                  </div>
                </div>
              </div>
              {/* ── RESUMEN POR EMPRESA ── */}
              <div className="space-y-3">
                {Object.entries(groupByEmpresa).map(([empresa, bills]) => {
                  const pendEmp = bills
                    .filter((b) => !b.pagada)
                    .reduce((s, b) => s + Number(b.amount || 0), 0);
                  const pagEmp = bills
                    .filter((b) => b.pagada)
                    .reduce((s, b) => s + Number(b.amount || 0), 0);
                  return (
                    <div
                      key={empresa}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-black text-sm text-gray-800">
                            {empresa}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {bills.length} cuenta(s) · Pend:{" "}
                            <span className="text-red-700 font-black">
                              $ {pendEmp.toLocaleString("es-CO")}
                            </span>{" "}
                            · Pag:{" "}
                            <span className="text-emerald-700 font-black">
                              $ {pagEmp.toLocaleString("es-CO")}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => goTo("bill")}
                          className="px-2 py-1 bg-orange-600 text-white text-[10px] font-black rounded-lg"
                        >
                          + Nueva
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {[...bills].reverse().map((b, i) => (
                          <div
                            key={b.id || i}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                              b.pagada
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{b.pagada ? "✅" : "⏳"}</span>
                              <div>
                                <p className="font-bold text-gray-800">
                                  {b.clientName || b.clienteNombre || "-"} ·{" "}
                                  {b.date || b.savedAt?.split("T")[0] || "-"}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {b.description ||
                                    b.concepto ||
                                    "Servicio médico ocupacional"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-gray-800">
                                ${" "}
                                {Number(b.amount || 0).toLocaleString("es-CO")}
                              </span>
                              {!b.pagada && (
                                <button
                                  onClick={() => marcarPagada(b.id)}
                                  className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-bold hover:bg-emerald-200 text-[10px]"
                                >
                                  ✅
                                </button>
                              )}
                              <button
                                onClick={() => editarCuenta(b)}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold hover:bg-blue-200 text-[10px]"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => eliminarCuenta(b.id)}
                                className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold hover:bg-red-200 text-[10px]"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {savedBillsList.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <p className="text-gray-400 text-sm mb-3">
                      Sin cuentas de cobro registradas.
                    </p>
                    <button
                      onClick={() => goTo("bill")}
                      className="px-4 py-2 bg-orange-600 text-white text-xs font-black rounded-xl"
                    >
                      + Crear primera cuenta
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PACIENTES VISTOS - PASO 4 */}
          {cajaTab === "pacientes_vistos" &&
            (() => {
              const movsPV = movPeriodo.filter((m) => m._autoGenerated);
              const csvPV = () => {
                const rows = [
                  [
                    "Fecha",
                    "Paciente",
                    "Doc",
                    "Empresa Cliente",
                    "Tipo",
                    "Médico",
                    "Tarifa",
                    "Estado",
                  ],
                ];
                movsPV.forEach((m) =>
                  rows.push([
                    m.fecha,
                    m.pacienteNombre || "",
                    m.pacienteDoc || "",
                    m.empresaClienteNombre || "",
                    m.tipoConsulta || "",
                    m.medicoNombre || "",
                    m.monto || "0",
                    m.estado || "pendiente",
                  ])
                );
                const csv = rows
                  .map((r) =>
                    r
                      .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
                      .join(",")
                  )
                  .join("\n");
                const b = new Blob([csv], { type: "text/csv" });
                const u = URL.createObjectURL(b);
                const a = document.createElement("a");
                a.href = u;
                a.download = `pacientes_vistos_${_pDesde}_${_pHasta}.csv`;
                a.click();
                URL.revokeObjectURL(u);
              };
              return (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-black text-gray-800 text-sm">
                      👁️ Pacientes Vistos ·{" "}
                      {_pDesde !== _pHasta
                        ? `${_pDesde} – ${_pHasta}`
                        : _pDesde}
                    </h3>
                    <button
                      onClick={csvPV}
                      className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-black hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> CSV
                    </button>
                  </div>
                  {movsPV.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      No hay pacientes vistos en este periodo.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            {[
                              "Fecha",
                              "Paciente",
                              "Empresa",
                              "Tipo",
                              "Médico",
                              "Tarifa",
                              "Estado",
                              "",
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
                          {movsPV.map((m) => {
                            const estadoColor =
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
                                <td className="px-3 py-2 text-gray-500">
                                  {m.medicoNombre || "—"}
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-800">
                                  ${" "}
                                  {Number(m.monto || 0).toLocaleString("es-CO")}
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${estadoColor}`}
                                  >
                                    {m.estado === "cobrado"
                                      ? "Cobrado"
                                      : m.estado === "pagado"
                                      ? "Pagado"
                                      : "Por cobrar"}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  {m.estado === "pendiente" && (
                                    <button
                                      onClick={() => {
                                        showPrompt(
                                          `Monto a cobrar (sugerido $${Number(
                                            m.monto || 0
                                          ).toLocaleString("es-CO")}):`,
                                          (mto) => {
                                            showPrompt(
                                              "Forma de pago (Efectivo/Transferencia/Cheque):",
                                              (forma) => {
                                                cobrarAutoMov(
                                                  m.id,
                                                  mto || m.monto,
                                                  forma || "Efectivo"
                                                );
                                                showAlert(
                                                  "✅ Movimiento marcado como cobrado."
                                                );
                                              }
                                            );
                                          }
                                        );
                                      }}
                                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-black hover:bg-blue-100"
                                    >
                                      Cobrar
                                    </button>
                                  )}
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

          {/* TAB: INGRESOS POR MÉDICO - solo admin */}
          {cajaTab === "por_medico" &&
            _isAdmin(currentUser?.role) &&
            (() => {
              const medicos = usersList.filter(
                (u) =>
                  ["medico", "administrador", "super_admin"].includes(u.role) &&
                  u.activo !== false
              );
              const periodoFiltro = cajaMedicoPeriodo;
              const setPeriodoFiltro = setCajaMedicoPeriodo;
              const ahora = new Date();
              const hoyStr = ahora.toISOString().split("T")[0];
              const inicioMes = new Date(
                ahora.getFullYear(),
                ahora.getMonth(),
                1
              )
                .toISOString()
                .split("T")[0];
              const inicioSem = (() => {
                const d = new Date(ahora);
                d.setDate(d.getDate() - d.getDay());
                return d.toISOString().split("T")[0];
              })();
              const inicioAnio = new Date(ahora.getFullYear(), 0, 1)
                .toISOString()
                .split("T")[0];
              const desde =
                periodoFiltro === "hoy"
                  ? hoyStr
                  : periodoFiltro === "semana"
                  ? inicioSem
                  : periodoFiltro === "mes"
                  ? inicioMes
                  : inicioAnio;
              const movsFiltro = cajaMovimientos.filter(
                (m) => m.tipo === "ingreso" && m.fecha >= desde
              );
              const billsFiltro = savedBillsList.filter(
                (b) => b.savedAt && b.savedAt >= desde
              );
              const totalGlobal = movsFiltro.reduce(
                (s, m) => s + Number(m.monto || 0),
                0
              );
              const pendienteGlobal = billsFiltro
                .filter((b) => !b.pagada)
                .reduce((s, b) => s + Number(b.amount || 0), 0);
              return (
                <div className="space-y-4">
                  <div className="flex gap-2 mb-2">
                    {["hoy", "semana", "mes", "año"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriodoFiltro(p)}
                        className={`px-3 py-1 rounded-lg text-xs font-black ${
                          periodoFiltro === p
                            ? "bg-blue-700 text-white"
                            : "bg-white border text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                      <p className="text-xs font-black text-emerald-700">
                        Total cobrado
                      </p>
                      <p className="text-2xl font-black text-emerald-800">
                        $ {totalGlobal.toLocaleString("es-CO")}
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                      <p className="text-xs font-black text-red-700">
                        Pendiente por cobrar
                      </p>
                      <p className="text-2xl font-black text-red-800">
                        $ {pendienteGlobal.toLocaleString("es-CO")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          {[
                            "Médico",
                            "Atenciones",
                            "Cobrado",
                            "Cuentas pend.",
                            "% del total",
                          ].map((h) => (
                            <th key={h} className="p-2 text-left font-black">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {medicos.map((med, i) => {
                          const movsMed = movsFiltro.filter(
                            (m) =>
                              m.medicoId === med.user ||
                              (!m.medicoId && _isAdmin(med.role))
                          );
                          const cobradoMed = movsMed.reduce(
                            (s, m) => s + Number(m.monto || 0),
                            0
                          );
                          const atenMed = movsMed.filter(
                            (m) => m.pacienteId
                          ).length;
                          const pendMed = billsFiltro
                            .filter(
                              (b) =>
                                !b.pagada &&
                                (b.medicoId === med.user ||
                                  (!b.medicoId && _isAdmin(med.role)))
                            )
                            .reduce((s, b) => s + Number(b.amount || 0), 0);
                          const pct =
                            totalGlobal > 0
                              ? ((cobradoMed / totalGlobal) * 100).toFixed(1)
                              : "0";
                          return (
                            <tr
                              key={med.user}
                              className={
                                i % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="p-2 font-bold">
                                {med.name || med.user}
                              </td>
                              <td className="p-2">{atenMed}</td>
                              <td className="p-2 font-black text-emerald-700">
                                $ {cobradoMed.toLocaleString("es-CO")}
                              </td>
                              <td className="p-2 text-red-600">
                                $ {pendMed.toLocaleString("es-CO")}
                              </td>
                              <td className="p-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-blue-600 h-1.5 rounded-full"
                                      style={{
                                        width: `${Math.min(100, pct)}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-black">
                                    {pct}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={() => {
                      const rows = [
                        ["Médico", "Atenciones", "Cobrado", "Pendiente"],
                      ];
                      medicos.forEach((med) => {
                        const movsMed = movsFiltro.filter(
                          (m) =>
                            m.medicoId === med.user ||
                            (!m.medicoId && _isAdmin(med.role))
                        );
                        const cob = movsMed.reduce(
                          (s, m) => s + Number(m.monto || 0),
                          0
                        );
                        const pend = billsFiltro
                          .filter((b) => !b.pagada && b.medicoId === med.user)
                          .reduce((s, b) => s + Number(b.amount || 0), 0);
                        rows.push([
                          med.name || med.user,
                          movsMed.filter((m) => m.pacienteId).length,
                          cob,
                          pend,
                        ]);
                      });
                      const csv = rows
                        .map((r) =>
                          r
                            .map(
                              (v) => `"${String(v || "").replace(/"/g, '""')}"`
                            )
                            .join(",")
                        )
                        .join("\n");
                      const b = new Blob([csv], { type: "text/csv" });
                      const u = URL.createObjectURL(b);
                      const a = document.createElement("a");
                      a.href = u;
                      a.download = "ingresos_por_medico.csv";
                      a.click();
                      URL.revokeObjectURL(u);
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white text-xs font-black rounded-xl hover:bg-emerald-800"
                  >
                    📥 Exportar CSV
                  </button>
                  {/* ── LIQUIDACIÓN MÉDICO-CLÍNICA (FASE 4) ── */}
                  <div className="mt-6 bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                    <div className="bg-indigo-700 px-4 py-3 flex items-center justify-between">
                      <h4 className="text-white font-black text-sm">
                        💰 Liquidación Médico-Clínica
                      </h4>
                      <span className="text-indigo-200 text-xs">
                        Periodo: {cajaMedicoPeriodo}
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Configuración del porcentaje */}
                      <div className="flex items-center gap-4 bg-indigo-50 rounded-xl p-3">
                        <div className="flex-1">
                          <p className="text-xs font-black text-indigo-800 mb-1">
                            % Honorarios médico:{" "}
                            <span className="text-indigo-600">
                              {porcentajeMedico}%
                            </span>
                          </p>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={porcentajeMedico}
                            onChange={(e) =>
                              setPorcentajeMedico(Number(e.target.value))
                            }
                            className="w-full accent-indigo-600"
                          />
                          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                            <span>0% médico</span>
                            <span>100% médico</span>
                          </div>
                        </div>
                        <div className="text-center min-w-[90px]">
                          <p className="text-[10px] text-gray-500">Clínica</p>
                          <p className="text-lg font-black text-purple-700">
                            {100 - porcentajeMedico}%
                          </p>
                        </div>
                      </div>
                      {/* Tabla por médico con liquidación */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-indigo-700 text-white">
                            <tr>
                              {[
                                "Médico",
                                "Cobrado",
                                `Médico (${porcentajeMedico}%)`,
                                `Clínica (${100 - porcentajeMedico}%)`,
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="p-2 text-left font-black"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {medicos.map((med, i) => {
                              const movsMed = movsFiltro.filter(
                                (m) =>
                                  m.medicoId === med.user ||
                                  (!m.medicoId && _isAdmin(med.role))
                              );
                              const cobradoMed = movsMed.reduce(
                                (s, m) => s + Number(m.monto || 0),
                                0
                              );
                              const valorMedico = Math.round(
                                cobradoMed * (porcentajeMedico / 100)
                              );
                              const valorClinica = cobradoMed - valorMedico;
                              return (
                                <tr
                                  key={med.user}
                                  className={
                                    i % 2 === 0 ? "bg-white" : "bg-indigo-50"
                                  }
                                >
                                  <td className="p-2 font-bold">
                                    {med.name || med.user}
                                  </td>
                                  <td className="p-2 font-black text-gray-700">
                                    $ {cobradoMed.toLocaleString("es-CO")}
                                  </td>
                                  <td className="p-2 font-black text-indigo-700">
                                    $ {valorMedico.toLocaleString("es-CO")}
                                  </td>
                                  <td className="p-2 font-black text-purple-700">
                                    $ {valorClinica.toLocaleString("es-CO")}
                                  </td>
                                </tr>
                              );
                            })}
                            {/* Fila de totales */}
                            <tr className="bg-indigo-700 text-white font-black">
                              <td className="p-2">TOTAL</td>
                              <td className="p-2">
                                $ {totalGlobal.toLocaleString("es-CO")}
                              </td>
                              <td className="p-2">
                                ${" "}
                                {Math.round(
                                  totalGlobal * (porcentajeMedico / 100)
                                ).toLocaleString("es-CO")}
                              </td>
                              <td className="p-2">
                                ${" "}
                                {Math.round(
                                  totalGlobal * ((100 - porcentajeMedico) / 100)
                                ).toLocaleString("es-CO")}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      {/* Botón comprobante imprimible */}
                      <button
                        onClick={() => {
                          const filas = medicos
                            .map((med) => {
                              const movsMed = movsFiltro.filter(
                                (m) =>
                                  m.medicoId === med.user ||
                                  (!m.medicoId && _isAdmin(med.role))
                              );
                              const cob = movsMed.reduce(
                                (s, m) => s + Number(m.monto || 0),
                                0
                              );
                              const vm = Math.round(
                                cob * (porcentajeMedico / 100)
                              );
                              const vc = cob - vm;
                              return `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${
                                med.name || med.user
                              }</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:right">$${cob.toLocaleString(
                                "es-CO"
                              )}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#4338ca;text-align:right">$${vm.toLocaleString(
                                "es-CO"
                              )}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#7e22ce;text-align:right">$${vc.toLocaleString(
                                "es-CO"
                              )}</td></tr>`;
                            })
                            .join("");
                          const _miIPSLiq = currentUser?.empresaId
                            ? companies.find(
                                (c) => c.id === currentUser.empresaId
                              ) || null
                            : null;
                          const _liqLeftHtml = _ipsDocLeftHtml(
                            _miIPSLiq,
                            activeDoctorData,
                            "#3730a3"
                          );
                          const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Liquidación SISO</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#1f2937}.doc-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #3730a3;padding-bottom:12px;margin-bottom:16px;}h1{font-size:18px;color:#3730a3;margin:0 0 2px 0;}h2{font-size:13px;color:#6b7280;font-weight:normal;margin-top:2px}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#3730a3;color:white;padding:8px 10px;text-align:left;font-size:12px}td{font-size:12px}.total-row td{background:#3730a3;color:white;font-weight:bold;padding:8px 10px;text-align:right}.total-label{text-align:left!important}footer{margin-top:32px;font-size:10px;color:#9ca3af}</style></head><body><div class="doc-header">${_liqLeftHtml}<div><h1>Comprobante de Liquidación Médico-Clínica</h1><h2>Periodo: ${cajaMedicoPeriodo} &nbsp;|&nbsp; Distribución: Médico ${porcentajeMedico}% / Clínica ${
                            100 - porcentajeMedico
                          }%</h2></div></div><table><thead><tr><th>Médico</th><th style="text-align:right">Cobrado</th><th style="text-align:right">Honorarios médico</th><th style="text-align:right">Ingreso clínica</th></tr></thead><tbody>${filas}<tr class="total-row"><td class="total-label">TOTAL</td><td style="text-align:right">$${totalGlobal.toLocaleString(
                            "es-CO"
                          )}</td><td style="text-align:right">$${Math.round(
                            totalGlobal * (porcentajeMedico / 100)
                          ).toLocaleString(
                            "es-CO"
                          )}</td><td style="text-align:right">$${Math.round(
                            totalGlobal * ((100 - porcentajeMedico) / 100)
                          ).toLocaleString(
                            "es-CO"
                          )}</td></tr></tbody></table><footer>Generado por SISO OcupaSalud &mdash; ${new Date().toLocaleString(
                            "es-CO"
                          )}</footer></body></html>`;
                          const w = window.open("", "_blank");
                          if (w) {
                            w.document.write(html);
                            w.document.close();
                            w.print();
                          }
                        }}
                        className="w-full px-4 py-2 bg-indigo-700 text-white text-xs font-black rounded-xl hover:bg-indigo-800 flex items-center justify-center gap-2"
                      >
                        🖨️ Imprimir Comprobante de Liquidación
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    );

};

export default Caja;
