import React from 'react';

// ─── PortalEmpresa Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const PortalEmpresa = (props) => {
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

    const codigoEmpresa = portalEmpresaCodigo;
    const setCodigoEmpresa = setPortalEmpresaCodigo;
    const empresaEncontrada = portalEmpresaEncontrada;
    const setEmpresaEncontrada = setPortalEmpresaEncontrada;
    const pacientesEmpresa = portalEmpresaPacientes;
    const setPacientesEmpresa = setPortalEmpresaPacientes;
    const portalTab = portalEmpresaTab;
    const setPortalTab = setPortalEmpresaTab;
    const buscando = portalEmpresaBuscando;
    const setBuscando = setPortalEmpresaBuscando;

    const buscarEmpresa = () => {
      if (!codigoEmpresa.trim()) {
        showAlert("Ingrese el NIT o código de acceso de su empresa.");
        return;
      }
      setBuscando(true);
      const q = codigoEmpresa.trim().toLowerCase();
      const emp = companies.find(
        (c) =>
          c.nit === q ||
          c.nit === codigoEmpresa.trim() ||
          (c.id && c.id === q) ||
          (c.portalCode && c.portalCode.toLowerCase() === q) ||
          c.nombre?.toLowerCase().includes(q)
      );
      if (!emp) {
        showAlert(
          "No se encontró empresa con ese código. Contacte al médico para obtener el código de acceso."
        );
        setBuscando(false);
        return;
      }
      if (!emp.portalActivo) {
        showAlert(
          "El portal cliente no está habilitado para esta empresa. Contacte al médico para activarlo."
        );
        setBuscando(false);
        return;
      }
      // Obtener pacientes de esta empresa (solo HCs cerradas)
      const pacs = patientsList.filter(
        (p) =>
          (p.empresaId === emp.id || p.empresaNit === emp.nit) &&
          p.estadoHistoria === "Cerrada" &&
          !p._archivado
      );
      setEmpresaEncontrada(emp);
      setPacientesEmpresa(pacs);
      setBuscando(false);
    };

    const hoy = new Date().toISOString().split("T")[0];
    const cuentasEmpresa = savedBillsList.filter(
      (b) =>
        b.companyId === empresaEncontrada?.id ||
        b.clientNit === empresaEncontrada?.nit
    );
    const pendientesEmpresa = cuentasEmpresa.filter((b) => !b.pagada);
    const pagadasEmpresa = cuentasEmpresa.filter((b) => b.pagada);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 font-sans flex flex-col">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            <div>
              <p className="text-white font-black text-sm">Portal Empresa</p>
              <p className="text-blue-200 text-[10px]">
                SISO OcupaSalud - Acceso confidencial
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {empresaEncontrada && (
              <button
                onClick={() => {
                  setEmpresaEncontrada(null);
                  setPacientesEmpresa([]);
                  setCodigoEmpresa("");
                  setPortalEmpresaFiltroDoc("");
                }}
                className="px-3 py-1.5 bg-white/20 text-white text-xs font-black rounded-lg hover:bg-white/30"
              >
                🔄 Otra empresa
              </button>
            )}
            <button
              onClick={() => goBack()}
              className="px-3 py-1.5 bg-white/20 text-white text-xs font-black rounded-lg hover:bg-white/30"
            >
              ← Salir
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          {!empresaEncontrada ? (
            /* LOGIN */
            <div className="bg-white rounded-2xl shadow-2xl p-8 mt-8 max-w-md mx-auto text-center">
              <p className="text-4xl mb-3">🔐</p>
              <h2 className="font-black text-gray-800 text-xl mb-1">
                Acceso Portal Empresa
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Ingrese el NIT de su empresa o el código de acceso proporcionado
                por su médico ocupacional.
              </p>
              <input
                value={codigoEmpresa}
                onChange={(e) => setCodigoEmpresa(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarEmpresa()}
                placeholder="NIT o código de acceso..."
                className="w-full p-3 border-2 border-blue-200 rounded-xl text-sm mb-4 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={buscarEmpresa}
                disabled={buscando}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl text-sm disabled:opacity-60"
              >
                {buscando ? "⏳ Buscando..." : "🔍 Acceder al portal"}
              </button>
              <p className="text-[10px] text-gray-400 mt-4">
                ⚠️ Los diagnósticos clínicos son confidenciales y NO están
                disponibles en este portal (Art. 16 Res. 1843/2025)
              </p>
              {/* FASE 2: Login Admin de Empresa */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <p className="text-xs text-gray-400 mb-3 font-bold">
                  ━━ O ingresar como administrador de empresa ━━
                </p>
                <input
                  value={portalAdminLoginUser}
                  onChange={(e) => setPortalAdminLoginUser(e.target.value)}
                  placeholder="Usuario admin"
                  className="w-full p-2.5 border border-purple-200 rounded-xl text-sm mb-2 focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="password"
                  value={portalAdminLoginPass}
                  onChange={(e) => setPortalAdminLoginPass(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // Buscar empresa por usuario admin
                      const empAdmin = companies.find(
                        (c) =>
                          c.portalAdminUser === portalAdminLoginUser.trim() &&
                          c.portalActivo
                      );
                      if (!empAdmin) {
                        showAlert("Administrador no encontrado.");
                        return;
                      }
                      _sha256(portalAdminLoginPass).then((hash) => {
                        if (hash === empAdmin.portalAdminPassHash) {
                          const pacs = patientsList.filter(
                            (p) =>
                              (p.empresaId === empAdmin.id ||
                                p.empresaNit === empAdmin.nit) &&
                              !p._archivado
                          );
                          setEmpresaEncontrada(empAdmin);
                          setPacientesEmpresa(pacs);
                          setPortalEmpresaAdmin(empAdmin);
                          setPortalAdminTab("medicos");
                        } else {
                          showAlert("Contraseña incorrecta.");
                        }
                      });
                    }
                  }}
                  placeholder="Contraseña"
                  className="w-full p-2.5 border border-purple-200 rounded-xl text-sm mb-3 focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const empAdmin = companies.find(
                      (c) =>
                        c.portalAdminUser === portalAdminLoginUser.trim() &&
                        c.portalActivo
                    );
                    if (!empAdmin) {
                      showAlert(
                        "Administrador no encontrado. Verifique el usuario."
                      );
                      return;
                    }
                    _sha256(portalAdminLoginPass).then((hash) => {
                      if (hash === empAdmin.portalAdminPassHash) {
                        const pacs = patientsList.filter(
                          (p) =>
                            (p.empresaId === empAdmin.id ||
                              p.empresaNit === empAdmin.nit) &&
                            !p._archivado
                        );
                        setEmpresaEncontrada(empAdmin);
                        setPacientesEmpresa(pacs);
                        setPortalEmpresaAdmin(empAdmin);
                        setPortalAdminTab("medicos");
                      } else {
                        showAlert("Contraseña incorrecta.");
                      }
                    });
                  }}
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl text-sm"
                >
                  🔐 Entrar como Administrador
                </button>
              </div>
            </div>
          ) : portalEmpresaAdmin ? (
            /* DASHBOARD ADMIN */
            <div className="space-y-4">
              {/* Header admin */}
              <div className="bg-purple-900 text-white rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-black text-lg">
                    {empresaEncontrada.nombre}
                  </p>
                  <p className="text-purple-200 text-xs">
                    🔐 Panel de Administración · NIT: {empresaEncontrada.nit}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPortalEmpresaAdmin(null);
                    setEmpresaEncontrada(null);
                    setPacientesEmpresa([]);
                    setPortalAdminLoginUser("");
                    setPortalAdminLoginPass("");
                  }}
                  className="px-3 py-1.5 bg-white/20 text-white text-xs font-black rounded-lg hover:bg-white/30"
                >
                  🚪 Cerrar sesión
                </button>
              </div>
              {/* Tabs admin */}
              <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-purple-100 overflow-x-auto">
                {[
                  { k: "medicos", l: "👨‍⚕️ Mis Médicos" },
                  { k: "secretarias", l: "🗂️ Secretarias" },
                  { k: "trabajadores", l: "📋 Trabajadores" },
                  { k: "cuentas", l: "📄 Cuentas" },
                  { k: "sedes", l: "🏢 Sedes" },
                ].map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setPortalAdminTab(t.k)}
                    className={`flex-shrink-0 px-4 py-2 text-xs font-black rounded-lg transition ${
                      portalAdminTab === t.k
                        ? "bg-purple-700 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {t.l}
                  </button>
                ))}
              </div>
              {/* Tab: Médicos */}
              {portalAdminTab === "medicos" && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-black text-gray-800">
                      👨‍⚕️ Médicos de {empresaEncontrada.nombre}
                    </p>
                  </div>
                  {/* Lista médicos existentes */}
                  <div className="space-y-2 mb-4">
                    {usersList
                      .filter(
                        (u) =>
                          u.role === "medico" &&
                          (u.empresaId === empresaEncontrada.id ||
                            (empresaEncontrada.medicoIds || []).includes(
                              u.user
                            ))
                      )
                      .map((m) => (
                        <div
                          key={m.user}
                          className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-3"
                        >
                          <div>
                            <p className="font-black text-sm text-gray-800">
                              {m.name || m.user}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              @{m.user} ·{" "}
                              {m.empresaId === empresaEncontrada.id
                                ? "Médico exclusivo"
                                : "Médico asignado"}
                            </p>
                          </div>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                            Médico
                          </span>
                        </div>
                      ))}
                    {usersList.filter(
                      (u) =>
                        u.role === "medico" &&
                        (u.empresaId === empresaEncontrada.id ||
                          (empresaEncontrada.medicoIds || []).includes(u.user))
                    ).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Sin médicos asignados aún.
                      </p>
                    )}
                  </div>
                  {/* Formulario nuevo médico */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-black text-purple-700 mb-2">
                      ➕ Crear nuevo médico para esta empresa
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        value={nuevoMedicoEmpForm.nombre}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            nombre: e.target.value,
                          }))
                        }
                        placeholder="Nombre completo"
                        className="border rounded-lg p-2 text-xs"
                      />
                      <input
                        value={nuevoMedicoEmpForm.user}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            user: e.target.value,
                          }))
                        }
                        placeholder="Usuario (ej: dr_garcia)"
                        className="border rounded-lg p-2 text-xs"
                      />
                      <input
                        type="password"
                        value={nuevoMedicoEmpForm.pass}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            pass: e.target.value,
                          }))
                        }
                        placeholder="Contraseña temporal"
                        className="border rounded-lg p-2 text-xs"
                      />
                      <select
                        value={nuevoMedicoEmpForm.rol}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            rol: e.target.value,
                          }))
                        }
                        className="border rounded-lg p-2 text-xs"
                      >
                        <option value="medico">Médico</option>
                        <option value="secretaria">Secretaria</option>
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        if (
                          !nuevoMedicoEmpForm.nombre ||
                          !nuevoMedicoEmpForm.user ||
                          !nuevoMedicoEmpForm.pass
                        ) {
                          showAlert("Complete nombre, usuario y contraseña.");
                          return;
                        }
                        if (
                          usersList.find(
                            (u) => u.user === nuevoMedicoEmpForm.user
                          )
                        ) {
                          showAlert("Ese nombre de usuario ya existe.");
                          return;
                        }
                        const hash = await _sha256(nuevoMedicoEmpForm.pass);
                        const nuevoUser = {
                          id: Date.now(),
                          user: nuevoMedicoEmpForm.user,
                          passHash: hash,
                          mustChangePassword: true,
                          name: nuevoMedicoEmpForm.nombre,
                          role: nuevoMedicoEmpForm.rol,
                          orgId: empresaEncontrada.orgId || ORG_DEFAULT_ID,
                          empresaId: empresaEncontrada.id,
                          license: "libre",
                          licenseExpiry: "2099-12-31",
                          licenseStarted: new Date()
                            .toISOString()
                            .split("T")[0],
                          porcentajeHonorarios: 0,
                          secretariaPermisos: {
                            ...SECRETARIA_PERMISOS_DEFAULT,
                          },
                          doctorData: { ...DEFAULT_DOCTOR_DATA },
                        };
                        // Agregar usuario al sistema
                        const updUsers = [...usersList, nuevoUser];
                        setUsersList(updUsers);
                        _sync("siso_users", JSON.stringify(updUsers));
                        // Actualizar medicoIds en la empresa
                        const updComp = companies.map((c) =>
                          c.id === empresaEncontrada.id
                            ? {
                                ...c,
                                medicoIds: [
                                  ...(c.medicoIds || []),
                                  nuevoMedicoEmpForm.user,
                                ],
                              }
                            : c
                        );
                        setCompanies(updComp);
                        _syncCompanies(updComp);
                        setNuevoMedicoEmpForm({
                          nombre: "",
                          user: "",
                          pass: "",
                          rol: "medico",
                        });
                        showAlert(
                          `✅ ${
                            nuevoMedicoEmpForm.rol === "medico"
                              ? "Médico"
                              : "Secretaria"
                          } "${
                            nuevoMedicoEmpForm.nombre
                          }" creado. Debe cambiar contraseña en primer acceso.`
                        );
                      }}
                      className="w-full bg-purple-700 text-white py-2 rounded-xl text-xs font-black hover:bg-purple-800"
                    >
                      ✅ Crear perfil
                    </button>
                  </div>
                </div>
              )}
              {/* Tab: Secretarias — misma lógica que médicos pero filtro por rol */}
              {portalAdminTab === "secretarias" && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="font-black text-gray-800 mb-3">
                    🗂️ Secretarias de {empresaEncontrada.nombre}
                  </p>
                  <div className="space-y-2 mb-4">
                    {usersList
                      .filter(
                        (u) =>
                          u.role === "secretaria" &&
                          u.empresaId === empresaEncontrada.id
                      )
                      .map((s) => (
                        <div
                          key={s.user}
                          className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3"
                        >
                          <div>
                            <p className="font-black text-sm">
                              {s.name || s.user}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              @{s.user}
                            </p>
                          </div>
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                            Secretaria
                          </span>
                        </div>
                      ))}
                    {usersList.filter(
                      (u) =>
                        u.role === "secretaria" &&
                        u.empresaId === empresaEncontrada.id
                    ).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Sin secretarias asignadas.
                      </p>
                    )}
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-black text-purple-700 mb-2">
                      ➕ Crear nueva secretaria
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        value={nuevoMedicoEmpForm.nombre}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            nombre: e.target.value,
                          }))
                        }
                        placeholder="Nombre completo"
                        className="border rounded-lg p-2 text-xs"
                      />
                      <input
                        value={nuevoMedicoEmpForm.user}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            user: e.target.value,
                          }))
                        }
                        placeholder="Usuario"
                        className="border rounded-lg p-2 text-xs"
                      />
                      <input
                        type="password"
                        value={nuevoMedicoEmpForm.pass}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            pass: e.target.value,
                          }))
                        }
                        placeholder="Contraseña temporal"
                        className="border rounded-lg p-2 text-xs col-span-2"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (
                          !nuevoMedicoEmpForm.nombre ||
                          !nuevoMedicoEmpForm.user ||
                          !nuevoMedicoEmpForm.pass
                        ) {
                          showAlert("Complete todos los campos.");
                          return;
                        }
                        if (
                          usersList.find(
                            (u) => u.user === nuevoMedicoEmpForm.user
                          )
                        ) {
                          showAlert("Usuario ya existe.");
                          return;
                        }
                        const hash = await _sha256(nuevoMedicoEmpForm.pass);
                        const nuevoUser = {
                          id: Date.now(),
                          user: nuevoMedicoEmpForm.user,
                          passHash: hash,
                          mustChangePassword: true,
                          name: nuevoMedicoEmpForm.nombre,
                          role: "secretaria",
                          orgId: empresaEncontrada.orgId || ORG_DEFAULT_ID,
                          empresaId: empresaEncontrada.id,
                          license: "libre",
                          licenseExpiry: "2099-12-31",
                          licenseStarted: new Date()
                            .toISOString()
                            .split("T")[0],
                          porcentajeHonorarios: 0,
                          secretariaPermisos: {
                            ...SECRETARIA_PERMISOS_DEFAULT,
                          },
                          doctorData: { ...DEFAULT_DOCTOR_DATA },
                        };
                        const updUsers = [...usersList, nuevoUser];
                        setUsersList(updUsers);
                        _sync("siso_users", JSON.stringify(updUsers));
                        setNuevoMedicoEmpForm({
                          nombre: "",
                          user: "",
                          pass: "",
                          rol: "medico",
                        });
                        showAlert(
                          `✅ Secretaria "${nuevoMedicoEmpForm.nombre}" creada.`
                        );
                      }}
                      className="w-full bg-amber-600 text-white py-2 rounded-xl text-xs font-black hover:bg-amber-700"
                    >
                      ✅ Crear secretaria
                    </button>
                  </div>
                </div>
              )}
              {/* Tab: Trabajadores */}
              {portalAdminTab === "trabajadores" && (
                <div className="bg-white rounded-2xl p-4 shadow-sm overflow-x-auto">
                  <p className="font-black text-gray-800 mb-3">
                    📋 Trabajadores de {empresaEncontrada.nombre} (
                    {pacientesEmpresa.length} evaluados)
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        {[
                          "Nombre",
                          "Cédula",
                          "Cargo",
                          "Concepto",
                          "Médico",
                        ].map((h) => (
                          <th
                            key={h}
                            className="p-2 text-left font-black text-gray-600"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pacientesEmpresa.map((p) => {
                        const med = usersList.find(
                          (u) => u.user === p._medicoId
                        );
                        return (
                          <tr
                            key={p.id || p.cedula}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="p-2 font-bold">
                              {p.nombre} {p.apellido}
                            </td>
                            <td className="p-2">{p.cedula}</td>
                            <td className="p-2">{p.cargo || "-"}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  p.conceptoAptitud === "Apto"
                                    ? "bg-green-100 text-green-700"
                                    : p.conceptoAptitud === "No Apto"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {p.conceptoAptitud || "-"}
                              </span>
                            </td>
                            <td className="p-2">
                              {med?.name || p._medicoId || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Tab: Cuentas */}
              {portalAdminTab === "cuentas" && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="font-black text-gray-800 mb-3">
                    📄 Cuentas de {empresaEncontrada.nombre}
                  </p>
                  <div className="space-y-2">
                    {cuentasEmpresa.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-4">
                        Sin cuentas de cobro.
                      </p>
                    )}
                    {cuentasEmpresa.map((b) => (
                      <div
                        key={b.id}
                        className={`flex justify-between items-center rounded-xl p-3 border ${
                          b.pagada
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div>
                          <p className="font-black text-sm">
                            {b.invoiceNumber || b.id}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {b.fecha || "-"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm">
                            ${Number(b.amount || 0).toLocaleString("es-CO")}
                          </p>
                          <span
                            className={`text-[10px] font-bold ${
                              b.pagada ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {b.pagada ? "✅ Pagada" : "⏳ Pendiente"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Tab: Sedes */}
              {portalAdminTab === "sedes" && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="font-black text-gray-800 mb-3">
                    🏢 Sedes de {empresaEncontrada.nombre}
                  </p>
                  {(empresaEncontrada.sedes || []).length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">
                      Sin sedes registradas. El administrador principal puede
                      agregar sedes desde el módulo de empresas.
                    </p>
                  )}
                  <div className="grid gap-3">
                    {(empresaEncontrada.sedes || []).map((s, i) => (
                      <div
                        key={i}
                        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                      >
                        <p className="font-black text-blue-800">{s.nombre}</p>
                        <p className="text-xs text-blue-600">
                          {s.ciudad}
                          {s.direccion && ` · ${s.direccion}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* DASHBOARD EMPRESA */
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-black text-gray-800 text-lg">
                    {empresaEncontrada.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    NIT: {empresaEncontrada.nit}
                    {empresaEncontrada.dv
                      ? `-${empresaEncontrada.dv}`
                      : ""} · {empresaEncontrada.ciudad}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Acceso desde</p>
                  <p className="font-black text-sm text-gray-800">{hoy}</p>
                </div>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xs font-black text-gray-600 mb-1">
                    Trabajadores evaluados
                  </p>
                  <p className="text-3xl font-black text-blue-700">
                    {pacientesEmpresa.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xs font-black text-gray-600 mb-1">
                    Cuentas pendientes
                  </p>
                  <p className="text-3xl font-black text-red-700">
                    {pendientesEmpresa.length}
                  </p>
                  <p className="text-[10px] text-red-500">
                    ${" "}
                    {pendientesEmpresa
                      .reduce((s, b) => s + Number(b.amount || 0), 0)
                      .toLocaleString("es-CO")}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xs font-black text-gray-600 mb-1">
                    Con restricciones
                  </p>
                  <p className="text-3xl font-black text-amber-700">
                    {
                      pacientesEmpresa.filter(
                        (p) =>
                          p.conceptoAptitud
                            ?.toLowerCase()
                            .includes("restriccion") ||
                          p.conceptoAptitud
                            ?.toLowerCase()
                            .includes("restricción")
                      ).length
                    }
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
                {[
                  { k: "trabajadores", l: "👥 Trabajadores" },
                  { k: "cuentas", l: "💳 Cuentas" },
                  { k: "noAptos", l: "⛔ No Aptos / Restricciones" },
                ].map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setPortalTab(t.k)}
                    className={`flex-1 py-2 text-xs font-black rounded-lg ${
                      portalTab === t.k
                        ? "bg-blue-700 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {t.l}
                  </button>
                ))}
              </div>

              {/* TAB: TRABAJADORES */}
              {portalTab === "trabajadores" && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-3 border-b">
                    <p className="text-xs font-black text-gray-700 uppercase">
                      Trabajadores evaluados - Certificados de aptitud
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Los diagnósticos clínicos no se muestran en cumplimiento
                      de la Res. 1843/2025 Art. 16
                    </p>
                    {/* Filtro por cédula / nombre */}
                    <div className="mt-2 flex gap-2">
                      <input
                        value={portalEmpresaFiltroDoc}
                        onChange={(e) => setPortalEmpresaFiltroDoc(e.target.value)}
                        placeholder="🔍 Filtrar por cédula o nombre del trabajador..."
                        className="flex-1 px-3 py-1.5 border border-blue-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                        maxLength={30}
                      />
                      {portalEmpresaFiltroDoc && (
                        <button
                          onClick={() => setPortalEmpresaFiltroDoc("")}
                          className="px-2 py-1 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-bold"
                        >
                          ✕ Limpiar
                        </button>
                      )}
                    </div>
                  </div>
                  {(() => {
                    const filtro = portalEmpresaFiltroDoc.trim().toLowerCase().replace(/\s/g, "");
                    const lista = filtro
                      ? pacientesEmpresa.filter((p) =>
                          (p.docNumero && p.docNumero.replace(/\s/g, "").toLowerCase().includes(filtro)) ||
                          (p.nombres && p.nombres.toLowerCase().includes(filtro))
                        )
                      : pacientesEmpresa;
                    return (
                  <table className="w-full text-xs">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        {[
                          "Nombre",
                          "Cédula",
                          "Cargo",
                          "Fecha Examen",
                          "Tipo",
                          "Aptitud",
                          "Vigencia",
                        ].map((h) => (
                          <th key={h} className="p-2 text-left font-black">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lista.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="p-8 text-center text-gray-400"
                          >
                            Sin trabajadores evaluados registrados.
                          </td>
                        </tr>
                      ) : (
                        lista.map((p, i) => {
                          const apto = p.conceptoAptitud || "--";
                          const aptColor = apto
                            .toLowerCase()
                            .includes("no apto")
                            ? "text-red-700"
                            : apto.toLowerCase().includes("restricc")
                            ? "text-amber-700"
                            : "text-emerald-700";
                          const vigencia = p.vigenciaCertificado
                            ? p.vigenciaCertificado
                            : p.fechaExamen
                            ? (() => {
                                const d = new Date(p.fechaExamen);
                                d.setFullYear(d.getFullYear() + 1);
                                return d.toISOString().split("T")[0];
                              })()
                            : "--";
                          return (
                            <tr
                              key={p.id}
                              className={
                                i % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="p-2 font-bold">{p.nombres}</td>
                              <td className="p-2 text-gray-600">
                                {p.docNumero}
                              </td>
                              <td className="p-2">{p.cargo || "--"}</td>
                              <td className="p-2">{p.fechaExamen || "--"}</td>
                              <td className="p-2">
                                {p.tipoExamen || p.enfasisExamen || "--"}
                              </td>
                              <td className={`p-2 font-black ${aptColor}`}>
                                {apto}
                              </td>
                              <td className="p-2 text-gray-500">{vigencia}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                    );
                  })()}
                </div>
              )}

              {/* TAB: CUENTAS */}
              {portalTab === "cuentas" && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-3 border-b flex justify-between items-center">
                    <p className="text-xs font-black text-gray-700 uppercase">
                      Estado de cuentas
                    </p>
                    <div className="flex gap-3 text-xs">
                      <span className="font-black text-red-600">
                        Pendiente: ${" "}
                        {pendientesEmpresa
                          .reduce((s, b) => s + Number(b.amount || 0), 0)
                          .toLocaleString("es-CO")}
                      </span>
                      <span className="font-black text-emerald-600">
                        Pagado: ${" "}
                        {pagadasEmpresa
                          .reduce((s, b) => s + Number(b.amount || 0), 0)
                          .toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                  {cuentasEmpresa.length === 0 ? (
                    <p className="p-8 text-center text-gray-400 text-sm">
                      Sin facturas registradas para esta empresa.
                    </p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          {["Fecha", "Descripción", "Monto", "Estado"].map(
                            (h) => (
                              <th key={h} className="p-2 text-left font-black">
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {[...cuentasEmpresa].reverse().map((b, i) => (
                          <tr
                            key={b.id || i}
                            className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            <td className="p-2">
                              {b.date || b.savedAt?.split("T")[0] || "--"}
                            </td>
                            <td className="p-2">
                              {b.description ||
                                b.concepto ||
                                "Servicio médico ocupacional"}
                            </td>
                            <td className="p-2 font-black">
                              $ {Number(b.amount || 0).toLocaleString("es-CO")}
                            </td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                                  b.pagada
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {b.pagada
                                  ? `✅ Pagada ${b.fechaPago || ""}`
                                  : "⏳ Pendiente"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* TAB: NO APTOS */}
              {portalTab === "noAptos" && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-3 border-b">
                    <p className="text-xs font-black text-gray-700 uppercase">
                      Trabajadores con restricciones o no aptos
                    </p>
                  </div>
                  {pacientesEmpresa.filter(
                    (p) =>
                      p.conceptoAptitud &&
                      !p.conceptoAptitud.toUpperCase().includes("APTO SIN")
                  ).length === 0 ? (
                    <p className="p-8 text-center text-emerald-600 font-bold text-sm">
                      ✅ Todos los trabajadores evaluados están aptos sin
                      restricciones.
                    </p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          {[
                            "Nombre",
                            "Cargo",
                            "Fecha",
                            "Concepto",
                            "Recomendaciones",
                          ].map((h) => (
                            <th key={h} className="p-2 text-left font-black">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pacientesEmpresa
                          .filter(
                            (p) =>
                              p.conceptoAptitud &&
                              !p.conceptoAptitud
                                .toUpperCase()
                                .startsWith("APTO")
                          )
                          .map((p, i) => (
                            <tr
                              key={p.id}
                              className={
                                i % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="p-2 font-bold">{p.nombres}</td>
                              <td className="p-2">{p.cargo || "--"}</td>
                              <td className="p-2">{p.fechaExamen || "--"}</td>
                              <td className="p-2 font-black text-red-700">
                                {p.conceptoAptitud}
                              </td>
                              <td className="p-2 text-gray-600 max-w-[200px]">
                                {String(
                                  Array.isArray(p.recomendacionesOcupacionales)
                                    ? p.recomendacionesOcupacionales.join("; ")
                                    : p.recomendacionesOcupacionales || "--"
                                ).slice(0, 120)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-center py-4 text-blue-300 text-[10px]">
          SISO OcupaSalud · Portal confidencial · Art. 16 Res. 1843/2025
        </div>
      </div>
    );

};

export default PortalEmpresa;
