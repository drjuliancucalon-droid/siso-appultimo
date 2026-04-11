import React from 'react';
import {
  LogOut, UserCheck
} from "lucide-react";

// ─── Agenda Page Component ─────────────────────────────────────────────
// Auto-extracted from App.jsx monolith
export const Agenda = (props) => {
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

    if (!_canUse("agenda", currentUser))
      return (
        <div className="min-h-screen bg-gray-50 font-sans">
          {renderNavbar()}
          <div className="max-w-2xl mx-auto px-4 py-12">
            <PlanGate
              feature="agenda"
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
    // ── SECRETARIA GATE: "Agenda del Día" requiere autorización del admin ──
    if (
      currentUser?.role === "secretaria" &&
      !_secretariaPuede("agenda", currentUser, usersList)
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
              <p className="text-amber-700 text-sm font-bold">Agenda del Día</p>
              <p className="text-amber-600 text-xs leading-relaxed">
                Este módulo requiere autorización explícita del administrador.
                <br />
                Solicita que habilite el permiso{" "}
                <strong>"Agenda del Día"</strong> en tu perfil.
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
    const isAdminOrSec = [
      "administrador",
      "secretaria",
      "admin_empresa",
    ].includes(currentUser?.role);
    const today = new Date().toISOString().split("T")[0];
    // ── IPS: scope agenda to empresa if applicable ──
    const _agendaEmpresaId = currentUser?.empresaId || null;
    // ── Duración por tipo de consulta ──────────────────────────────
    const DURACION = {
      ingreso: 20,
      egreso: 20,
      periodico: 20,
      seguimiento: 40,
      post_incapacidad: 40,
    };
    const TIPOS_CONSULTA = [
      { v: "ingreso", l: "Ingreso", mins: 20 },
      { v: "egreso", l: "Egreso", mins: 20 },
      { v: "periodico", l: "Periódico", mins: 20 },
      { v: "seguimiento", l: "Seguimiento", mins: 40 },
      { v: "post_incapacidad", l: "Post-Incapacidad", mins: 40 },
    ];
    // ── Helpers de hora ────────────────────────────────────────────
    const addMins = (hhmm, mins) => {
      const [h, m] = hhmm.split(":").map(Number);
      const total = h * 60 + m + mins;
      return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(
        total % 60
      ).padStart(2, "0")}`;
    };
    const horaActual = () =>
      new Date()
        .toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(".", ":");
    const nowISO = () => new Date().toISOString();
    // ── Filtrar agenda por fecha y usuario ─────────────────────────
    const filterAgenda = (fecha) =>
      agendados
        .filter((a) => {
          if (a.fecha !== fecha) return false;
          // IPS: si el usuario pertenece a empresa, filtrar por empresa
          if (_agendaEmpresaId)
            return (
              a.empresaId === _agendaEmpresaId ||
              a.medicoEmpresaId === _agendaEmpresaId
            );
          if (isAdminOrSec) return true;
          return a.medicoId === currentUser?.user;
        })
        .sort(
          (a, b) =>
            a.horaCita?.localeCompare(b.horaCita) ||
            a.hora?.localeCompare(b.hora)
        );
    const miAgendaHoy = filterAgenda(today);
    const enEspera = miAgendaHoy.filter((a) => a.estado === "espera");
    const atendiendo = miAgendaHoy.filter((a) => a.estado === "atendiendo");
    const atendidos = miAgendaHoy.filter((a) => a.estado === "atendido");
    // Próximas citas (fechas futuras)
    const proximas = agendados
      .filter((a) => {
        if (a.fecha <= today) return false;
        // IPS: scope by empresa
        if (_agendaEmpresaId)
          return (
            a.empresaId === _agendaEmpresaId ||
            a.medicoEmpresaId === _agendaEmpresaId
          );
        if (isAdminOrSec) return true;
        return a.medicoId === currentUser?.user;
      })
      .sort(
        (a, b) =>
          a.fecha.localeCompare(b.fecha) ||
          a.horaCita?.localeCompare(b.horaCita)
      );
    // ── Guardar agendados ──────────────────────────────────────────
    const saveAgendados = (upd) => {
      setAgendados(upd);
      // PASO 6: clave aislada por empresa/usuario
      const _agSuf = currentUser?.empresaId
        ? "empresa_" + currentUser.empresaId
        : currentUser?.user || "shared";
      _sync(`siso_agendados_${_agSuf}`, JSON.stringify(upd));
      _sbSet(`siso_agendados_${_agSuf}`, upd);
    };
    // ── Autocompletar desde pacientes existentes ───────────────────
    const handleBusqueda = (val) => {
      setAgendaForm((p) => ({ ...p, nombre: val, _busquedaQuery: val }));
      if (val.length < 2) {
        setAgendaSuggs([]);
        return;
      }
      const q = val.toLowerCase();
      let _agendaSearchBase = patientsList;
      // IPS: scope patient search to empresa
      if (_agendaEmpresaId) {
        const _asEmp = companies.find((c) => c.id === _agendaEmpresaId);
        _agendaSearchBase = patientsList.filter(
          (p) =>
            p.empresaId === _agendaEmpresaId ||
            (_asEmp && p.empresaNit === _asEmp.nit)
        );
      }
      const found = _agendaSearchBase
        .filter(
          (p) =>
            p.nombres?.toLowerCase().includes(q) ||
            p.docNumero?.toLowerCase().includes(q)
        )
        .slice(0, 6);
      setAgendaSuggs(found);
    };
    const seleccionarPaciente = (p) => {
      setAgendaForm((prev) => ({
        ...prev,
        nombre: p.nombres || "",
        docTipo: p.docTipo || "CC",
        docNumero: p.docNumero || "",
        fechaNacimiento: p.fechaNacimiento || "",
        edad: p.edad || "",
        genero: p.genero || "",
        estadoCivil: p.estadoCivil || "",
        escolaridad: p.escolaridad || "",
        grupoSanguineo: p.grupoSanguineo || "",
        grupoEtnico: p.grupoEtnico || "",
        identidadGenero: p.identidadGenero || "",
        celular: p.celular || "",
        telefono: p.telefono || "",
        email: p.email || "",
        residencia: p.residencia || "",
        zonaResidencia: p.zonaResidencia || "",
        estrato: p.estrato || "",
        tipoVivienda: p.tipoVivienda || "",
        numPersonasCargo: p.numPersonasCargo || "",
        eps: p.eps || "",
        arl: p.arl || "",
        afp: p.afp || "",
        nivelRiesgoARL: p.nivelRiesgoARL || "",
        empresa:
          p.empresa ||
          companies.find((c) => c.id === p.companyId)?.nombre ||
          "",
        cargo: p.cargo || "",
        dependencia: p.dependencia || "",
        tipoContrato: p.tipoContrato || "",
        turnoTrabajo: p.turnoTrabajo || "",
        antiguedadEmpresa: p.antiguedadEmpresa || "",
        _busquedaQuery: p.nombres || "",
      }));
      setAgendaSuggs([]);
    };
    // ── Calcular edad automática ───────────────────────────────────
    const calcEdad = (fNac) => {
      if (!fNac) return "";
      const hoy = new Date();
      const nac = new Date(fNac);
      let edad = hoy.getFullYear() - nac.getFullYear();
      const m = hoy.getMonth() - nac.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
      return String(edad);
    };
    // ── Registrar / Agendar paciente ───────────────────────────────
    const registrarPaciente = () => {
      if (!agendaForm.nombre.trim()) {
        showAlert("Ingrese el nombre del paciente.");
        return;
      }
      if (!agendaForm.medicoId) {
        showAlert("Seleccione el médico asignado.");
        return;
      }
      const fechaCita = agendaForm.fechaCita || today;
      const horaCita = agendaForm.horaCita || horaActual();
      const duracion = DURACION[agendaForm.tipoConsulta] || 20;
      const horaFin = addMins(horaCita, duracion);
      const esHoy = fechaCita === today;
      const nuevo = {
        id: "ag_" + Date.now(),
        // Identificación
        nombre: agendaForm.nombre.trim(),
        docTipo: agendaForm.docTipo,
        docNumero: agendaForm.docNumero.trim(),
        // Sociodemográficos
        fechaNacimiento: agendaForm.fechaNacimiento,
        edad: agendaForm.edad || calcEdad(agendaForm.fechaNacimiento),
        genero: agendaForm.genero,
        estadoCivil: agendaForm.estadoCivil,
        escolaridad: agendaForm.escolaridad,
        grupoSanguineo: agendaForm.grupoSanguineo,
        grupoEtnico: agendaForm.grupoEtnico,
        identidadGenero: agendaForm.identidadGenero,
        // Contacto
        celular: agendaForm.celular,
        telefono: agendaForm.telefono,
        email: agendaForm.email,
        residencia: agendaForm.residencia,
        zonaResidencia: agendaForm.zonaResidencia,
        estrato: agendaForm.estrato,
        tipoVivienda: agendaForm.tipoVivienda,
        numPersonasCargo: agendaForm.numPersonasCargo,
        // Afiliaciones
        eps: agendaForm.eps,
        arl: agendaForm.arl,
        afp: agendaForm.afp,
        nivelRiesgoARL: agendaForm.nivelRiesgoARL,
        // Laboral
        empresa: agendaForm.empresa,
        cargo: agendaForm.cargo,
        dependencia: agendaForm.dependencia,
        tipoContrato: agendaForm.tipoContrato,
        turnoTrabajo: agendaForm.turnoTrabajo,
        antiguedadEmpresa: agendaForm.antiguedadEmpresa,
        // Agenda
        medicoId: agendaForm.medicoId,
        medicoNombre:
          usersList.find((u) => u.user === agendaForm.medicoId)?.name ||
          agendaForm.medicoId,
        tipoConsulta: agendaForm.tipoConsulta,
        fecha: fechaCita,
        horaCita,
        horaFinCita: horaFin,
        duracion,
        hora: horaCita,
        observacion: agendaForm.observacion,
        estado: esHoy ? "espera" : "programado",
        registradoPor: currentUser?.user,
        registradoEn: nowISO(),
        // ── IPS: auto-tag con empresaId ──
        ...(currentUser?.empresaId
          ? {
              empresaId: currentUser.empresaId,
              medicoEmpresaId: currentUser.empresaId,
            }
          : {}),
      };
      saveAgendados([...agendados, nuevo]);
      setAgendaForm((p) => ({
        ...p,
        nombre: "",
        docTipo: "CC",
        docNumero: "",
        fechaNacimiento: "",
        edad: "",
        genero: "",
        estadoCivil: "",
        escolaridad: "",
        grupoSanguineo: "",
        grupoEtnico: "",
        identidadGenero: "",
        celular: "",
        telefono: "",
        email: "",
        residencia: "",
        zonaResidencia: "",
        estrato: "",
        tipoVivienda: "",
        numPersonasCargo: "",
        eps: "",
        arl: "",
        afp: "",
        nivelRiesgoARL: "",
        empresa: "",
        cargo: "",
        dependencia: "",
        tipoContrato: "",
        turnoTrabajo: "",
        antiguedadEmpresa: "",
        fechaCita: "",
        horaCita: "",
        observacion: "",
        _busquedaQuery: "",
      }));
      setAgendaSuggs([]);
      setAgendaTab("hoy");
      showAlert(
        `✅ ${
          esHoy
            ? "Paciente en sala de espera"
            : "Cita programada para " + fechaCita + " a las " + horaCita
        }.\nMédico: ${nuevo.medicoNombre} · Duración: ${duracion} min`
      );
    };
    // ── Iniciar atención ───────────────────────────────────────────
    const iniciarAtencion = (ag) => {
      const upd = agendados.map((a) =>
        a.id === ag.id
          ? { ...a, estado: "atendiendo", horaInicio: horaActual() }
          : a
      );
      saveAgendados(upd);
      // Mostrar modal de elección de tipo de HC
      setHcChoiceAgenda(ag);
    };
    const abrirHCDesdeAgenda = (ag, tipo) => {
      const newId = "pac_" + Date.now();
      if (tipo === "ocupacional") {
        setData({
          ...initialOccupPatientState,
          id: newId,
          _medicoId: ag.medicoId,
          nombres: ag.nombre,
          docTipo: ag.docTipo,
          docNumero: ag.docNumero,
          fechaNacimiento: ag.fechaNacimiento,
          edad: ag.edad,
          genero: ag.genero,
          estadoCivil: ag.estadoCivil,
          escolaridad: ag.escolaridad,
          celular: ag.celular,
          telefono: ag.telefono,
          email: ag.email,
          residencia: ag.residencia,
          zonaResidencia: ag.zonaResidencia,
          estrato: ag.estrato,
          eps: ag.eps,
          arl: ag.arl,
          afp: ag.afp,
          nivelRiesgoARL: ag.nivelRiesgoARL,
          cargo: ag.cargo,
          dependencia: ag.dependencia,
          tipoContrato: ag.tipoContrato,
          turnoTrabajo: ag.turnoTrabajo,
          antiguedadEmpresa: ag.antiguedadEmpresa,
          grupoSanguineo: ag.grupoSanguineo,
          motivoConsulta: ag.tipoConsulta || "",
          _agendaId: ag.id,
        });
        setDataType("ocupacional");
        setActiveTab("form");
      } else {
        setData({
          ...initialGeneralPatientState,
          id: newId,
          _medicoId: ag.medicoId,
          nombres: ag.nombre,
          docTipo: ag.docTipo,
          docNumero: ag.docNumero,
          fechaNacimiento: ag.fechaNacimiento,
          edad: ag.edad,
          genero: ag.genero,
          celular: ag.celular,
          telefono: ag.telefono,
          email: ag.email,
          residencia: ag.residencia,
          eps: ag.eps,
          arl: ag.arl,
          cargo: ag.cargo,
          _agendaId: ag.id,
        });
        setDataType("general");
        setActiveTab("formGeneral");
      }
      setHcChoiceAgenda(null);
      setView("historia");
    };
    const marcarAtendido = (agId) => {
      const upd = agendados.map((a) =>
        a.id === agId ? { ...a, estado: "atendido", horaFin: horaActual() } : a
      );
      saveAgendados(upd);
    };
    const eliminarCita = (agId) => {
      showConfirm("¿Eliminar esta cita programada?", () =>
        saveAgendados(agendados.filter((a) => a.id !== agId))
      );
    };
    const medicosDisp = usersList.filter(
      (u) =>
        ["medico", "administrador", "super_admin", "admin_empresa"].includes(
          u.role
        ) &&
        u.activo !== false &&
        // IPS: scope doctor list to empresa
        (_agendaEmpresaId
          ? u.empresaId === _agendaEmpresaId ||
            (u.role === "admin_empresa" && u.empresaId === _agendaEmpresaId)
          : true)
    );
    // ── Input helper: AgendaFieldF definida a nivel módulo ──
    // ── Badge estado ──────────────────────────────────────────────
    const EstadoBadge = ({ ag }) => {
      const map = {
        espera: "bg-yellow-100 text-yellow-800 border-yellow-300",
        atendiendo: "bg-blue-100 text-blue-800 border-blue-300",
        atendido: "bg-emerald-100 text-emerald-800 border-emerald-300",
        programado: "bg-purple-100 text-purple-800 border-purple-300",
      };
      const icons = {
        espera: "⏳",
        atendiendo: "🔵",
        atendido: "✅",
        programado: "📅",
      };
      const labels = {
        espera: "En espera",
        atendiendo: "Atendiendo",
        atendido: "Visto ✓",
        programado: "Programado",
      };
      return (
        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
            map[ag.estado] || map.espera
          }`}
        >
          {icons[ag.estado]} {labels[ag.estado]}
          {ag.estado === "atendido" && ag.horaFin ? " · " + ag.horaFin : ""}
        </span>
      );
    };
    const TipoConsultaBadge = ({ tipo }) => {
      const duracion = DURACION[tipo] || 20;
      const colors = {
        ingreso: "blue",
        egreso: "orange",
        periodico: "teal",
        seguimiento: "purple",
        post_incapacidad: "red",
      };
      const c = colors[tipo] || "gray";
      return (
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-${c}-50 text-${c}-700 border border-${c}-200`}
        >
          {tipo?.replace("_", " ")} · {duracion}min
        </span>
      );
    };
    // ── Tarjeta de paciente agendado ──────────────────────────────
    const CardPaciente = ({ ag, idx, showFecha = false }) => (
      <div
        className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition ${
          ag.estado === "atendido" ? "bg-emerald-50/40" : ""
        }`}
      >
        {ag.estado === "espera" && (
          <div className="w-7 h-7 bg-yellow-100 rounded-full flex items-center justify-center font-black text-yellow-700 text-sm flex-shrink-0 mt-0.5">
            {idx + 1}
          </div>
        )}
        {ag.estado === "atendiendo" && (
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse flex-shrink-0 mt-2" />
        )}
        {ag.estado === "atendido" && (
          <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ring-2 ring-emerald-400">
            <span className="text-sm">✅</span>
          </div>
        )}
        {ag.estado === "programado" && (
          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs">📅</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={`font-bold text-sm ${
                ag.estado === "atendido"
                  ? "line-through text-gray-400"
                  : "text-gray-800"
              }`}
            >
              {ag.nombre}
            </p>
            <TipoConsultaBadge tipo={ag.tipoConsulta} />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            <p className="text-[10px] text-gray-400">
              {ag.docTipo}: {ag.docNumero || "-"}
            </p>
            {ag.edad && (
              <p className="text-[10px] text-gray-400">
                {ag.edad} años · {ag.genero || "-"}
              </p>
            )}
            {ag.eps && (
              <p className="text-[10px] text-gray-400">EPS: {ag.eps}</p>
            )}
            {ag.cargo && (
              <p className="text-[10px] text-gray-400">Cargo: {ag.cargo}</p>
            )}
            {showFecha ? (
              <p className="text-[10px] font-bold text-purple-600">
                📅 {ag.fecha} {ag.horaCita} - {ag.horaFinCita}
              </p>
            ) : (
              <p className="text-[10px] text-gray-400">
                🕐 {ag.horaCita || ag.hora} - {ag.horaFinCita || "-"}
              </p>
            )}
            {isAdminOrSec && ag.medicoNombre && (
              <p className="text-[10px] text-blue-500">👨‍⚕️ {ag.medicoNombre}</p>
            )}
            {ag.estado === "atendido" && ag.horaFin && (
              <p className="text-[10px] font-bold text-emerald-600">
                ✔ Visto a las {ag.horaFin}
              </p>
            )}
          </div>
          {ag.observacion && (
            <p className="text-[10px] text-indigo-500 italic mt-0.5">
              {ag.observacion}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {ag.estado === "espera" &&
            (currentUser?.user === ag.medicoId ||
              _isAdmin(currentUser?.role)) && (
              <button
                onClick={() => iniciarAtencion(ag)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-blue-700 whitespace-nowrap"
              >
                ▶ Iniciar
              </button>
            )}
          {ag.estado === "atendiendo" && isAdminOrSec && (
            <button
              onClick={() => marcarAtendido(ag.id)}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-emerald-700"
            >
              ✅ Atendido
            </button>
          )}
          {ag.estado === "programado" && isAdminOrSec && (
            <button
              onClick={() => eliminarCita(ag.id)}
              className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-red-100"
            >
              🗑
            </button>
          )}
          <EstadoBadge ag={ag} />
        </div>
      </div>
    );
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderNavbar()}
        <div className="max-w-7xl mx-auto p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-black text-gray-800">🗓️ Agenda</h2>
              <p className="text-sm text-gray-500">{getSpanishDate(null)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goTo("asistencia")}
                className="text-blue-700 border border-blue-300 bg-blue-50 hover:bg-blue-100 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                📊 Reporte asistencia
              </button>
              <button
                onClick={() => goTo("dashboard")}
                className="text-gray-500 font-bold text-sm flex items-center gap-1 hover:text-gray-700"
              >
                <LogOut className="rotate-180 w-4 h-4" /> Volver
              </button>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { l: "En espera", v: enEspera.length, c: "yellow", e: "⏳" },
              { l: "Atendiendo", v: atendiendo.length, c: "blue", e: "🔵" },
              { l: "Atendidos", v: atendidos.length, c: "emerald", e: "✅" },
              { l: "Programadas", v: proximas.length, c: "purple", e: "📅" },
            ].map((s) => (
              <div
                key={s.l}
                className={`bg-white rounded-xl p-3 shadow-sm border border-${s.c}-100 flex items-center gap-3`}
              >
                <span className="text-xl">{s.e}</span>
                <div>
                  <p className={`text-2xl font-black text-${s.c}-700`}>{s.v}</p>
                  <p className="text-[10px] text-gray-500 font-bold">{s.l}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-fit">
            {[
              { k: "hoy", l: `📋 Hoy (${miAgendaHoy.length})` },
              { k: "proximas", l: `📅 Próximas (${proximas.length})` },
              ...(isAdminOrSec ? [{ k: "nueva", l: "➕ Nueva Cita" }] : []),
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setAgendaTab(t.k)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition ${
                  agendaTab === t.k
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
          <div
            className={`grid gap-6 ${
              isAdminOrSec && agendaTab === "nueva"
                ? "grid-cols-1"
                : "grid-cols-1"
            }`}
          >
            {/* ─── TAB: HOY ─────────────────────────────────────── */}
            {agendaTab === "hoy" && (
              <div className="space-y-4">
                {enEspera.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden">
                    <div className="bg-yellow-50 px-5 py-2.5 border-b border-yellow-100">
                      <p className="text-sm font-black text-yellow-800">
                        ⏳ En Espera ({enEspera.length})
                      </p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {enEspera.map((ag, i) => (
                        <CardPaciente key={ag.id} ag={ag} idx={i} />
                      ))}
                    </div>
                  </div>
                )}
                {atendiendo.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                    <div className="bg-blue-50 px-5 py-2.5 border-b border-blue-100">
                      <p className="text-sm font-black text-blue-800">
                        🔵 En Atención ({atendiendo.length})
                      </p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {atendiendo.map((ag, i) => (
                        <CardPaciente key={ag.id} ag={ag} idx={i} />
                      ))}
                    </div>
                  </div>
                )}
                {atendidos.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                    <div className="bg-emerald-50 px-5 py-2.5 border-b border-emerald-100">
                      <p className="text-sm font-black text-emerald-800">
                        ✅ Atendidos hoy ({atendidos.length})
                      </p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {atendidos.map((ag, i) => (
                        <CardPaciente key={ag.id} ag={ag} idx={i} />
                      ))}
                    </div>
                  </div>
                )}
                {/* ── ATENCIONES RECIENTES (desde agenda) ───────────── */}
                {(() => {
                  const misAtenciones = atencionesCerradas
                    .filter((ac) =>
                      isAdminOrSec ? true : ac.medicoId === currentUser?.user
                    )
                    .slice(0, 20);
                  if (misAtenciones.length === 0) return null;
                  return (
                    <div className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden">
                      <div className="bg-violet-50 px-5 py-2.5 border-b border-violet-100 flex justify-between items-center">
                        <p className="text-sm font-black text-violet-800">
                          🕐 Atenciones Recientes ({misAtenciones.length})
                        </p>
                        <span className="text-[9px] text-violet-500 font-bold">
                          Guardadas en la nube ☁️
                        </span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {misAtenciones.map((ac) => (
                          <div
                            key={ac.id}
                            className="px-4 py-3 flex items-start gap-3 hover:bg-violet-50/30 transition"
                          >
                            <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ring-2 ring-violet-300">
                              <span className="text-sm">✅</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-sm text-gray-700">
                                  {ac.nombre}
                                </p>
                                {ac.tipoConsulta && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
                                    {ac.tipoConsulta.replace("_", " ")}
                                  </span>
                                )}
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    ac.tipo === "general"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  {ac.tipo === "general"
                                    ? "General"
                                    : "Ocupacional"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                <p className="text-[10px] text-gray-400">
                                  {ac.docNumero || "-"}
                                </p>
                                {ac.empresa && (
                                  <p className="text-[10px] text-gray-400">
                                    🏢 {ac.empresa}
                                  </p>
                                )}
                                {ac.cargo && (
                                  <p className="text-[10px] text-gray-400">
                                    💼 {ac.cargo}
                                  </p>
                                )}
                                <p className="text-[10px] text-gray-400">
                                  📅 {ac.fechaAtencion}
                                </p>
                                {ac.horaInicio && ac.horaFin && (
                                  <p className="text-[10px] text-emerald-600 font-bold">
                                    🕐 {ac.horaInicio} → {ac.horaFin}
                                  </p>
                                )}
                                {isAdminOrSec && ac.medicoNombre && (
                                  <p className="text-[10px] text-blue-500">
                                    👨‍⚕️ {ac.medicoNombre}
                                  </p>
                                )}
                              </div>
                              {ac.conceptoAptitud && (
                                <p className="text-[10px] text-violet-600 font-bold mt-0.5">
                                  📋 {ac.conceptoAptitud}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-300">
                                ✅ Visto ✓
                              </span>
                              {ac.codigoVerificacion && (
                                <span className="text-[8px] text-gray-400 font-mono">
                                  {ac.codigoVerificacion}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                {miAgendaHoy.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
                    <p className="text-4xl mb-3">🗓️</p>
                    <p className="font-black text-gray-400">
                      Sin pacientes para hoy
                    </p>
                    {isAdminOrSec && (
                      <button
                        onClick={() => setAgendaTab("nueva")}
                        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-700"
                      >
                        ➕ Registrar paciente
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* ─── TAB: PRÓXIMAS ────────────────────────────────── */}
            {agendaTab === "proximas" && (
              <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                <div className="bg-purple-50 px-5 py-2.5 border-b border-purple-100">
                  <p className="text-sm font-black text-purple-800">
                    📅 Citas Programadas Futuras ({proximas.length})
                  </p>
                </div>
                {proximas.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <p className="text-3xl mb-2">📅</p>
                    <p className="text-sm font-bold">Sin citas programadas</p>
                  </div>
                ) : (
                  <div>
                    {/* Agrupar por fecha */}
                    {[...new Set(proximas.map((a) => a.fecha))].map((fecha) => (
                      <div key={fecha}>
                        <div className="bg-purple-100 px-5 py-1.5 border-b border-purple-200">
                          <p className="text-xs font-black text-purple-700">
                            {new Date(fecha + "T12:00:00").toLocaleDateString(
                              "es-CO",
                              {
                                weekday: "long",
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {proximas
                            .filter((a) => a.fecha === fecha)
                            .map((ag, i) => (
                              <CardPaciente
                                key={ag.id}
                                ag={ag}
                                idx={i}
                                showFecha={false}
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* ─── TAB: NUEVA CITA ──────────────────────────────── */}
            {agendaTab === "nueva" && isAdminOrSec && (
              <div className="grid grid-cols-5 gap-6">
                {/* Formulario */}
                <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-500" /> Registrar /
                    Agendar Paciente
                  </h3>
                  {/* Búsqueda paciente existente */}
                  <div className="relative mb-4">
                    <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">
                      🔍 Buscar paciente existente
                    </label>
                    <input
                      value={agendaForm._busquedaQuery || agendaForm.nombre}
                      onChange={(e) => handleBusqueda(e.target.value)}
                      placeholder="Nombre o número de documento..."
                      className="w-full p-2 border-2 border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                    />
                    {agendaSuggs.length > 0 && (
                      <div className="absolute z-50 top-full left-0 w-full bg-white border border-blue-200 shadow-xl rounded-xl mt-1 max-h-52 overflow-y-auto">
                        {agendaSuggs.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => seleccionarPaciente(p)}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                          >
                            <p className="font-bold text-sm text-gray-800">
                              {p.nombres}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {p.docTipo}: {p.docNumero} · {p.eps || "-"} ·{" "}
                              {p.cargo || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Sección: Agenda */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                    <p className="text-[10px] font-black text-blue-700 uppercase mb-2">
                      📅 Datos de la Cita
                    </p>
                    <div className="flex flex-wrap -mx-1">
                      <AgendaFieldF
                        label="Tipo de Consulta *"
                        name="tc"
                        value={agendaForm.tipoConsulta}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, tipoConsulta: v }))
                        }
                        opts={TIPOS_CONSULTA.map((t) => ({
                          v: t.v,
                          l: `${t.l} (${t.mins}min)`,
                        }))}
                        width="w-1/2"
                        req
                      />
                      <AgendaFieldF
                        label="Médico Asignado *"
                        name="med"
                        value={agendaForm.medicoId}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, medicoId: v }))
                        }
                        opts={medicosDisp.map((m) => ({
                          v: m.user,
                          l: m.name,
                        }))}
                        width="w-1/2"
                        req
                      />
                      <AgendaFieldF
                        label="Fecha Cita"
                        type="date"
                        name="fc"
                        value={agendaForm.fechaCita}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, fechaCita: v }))
                        }
                        width="w-1/2"
                      />
                      <AgendaFieldF
                        label="Hora Cita"
                        type="time"
                        name="hc"
                        value={agendaForm.horaCita}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, horaCita: v }))
                        }
                        width="w-1/2"
                      />
                      {agendaForm.horaCita && (
                        <div className="w-full px-1 mb-1">
                          <span className="text-[10px] text-blue-600 font-bold">
                            ⏱ Duración:{" "}
                            {DURACION[agendaForm.tipoConsulta] || 20} min · Fin
                            estimado:{" "}
                            {addMins(
                              agendaForm.horaCita,
                              DURACION[agendaForm.tipoConsulta] || 20
                            )}
                          </span>
                        </div>
                      )}
                      <AgendaFieldF
                        label="Observación / Motivo"
                        name="obs"
                        value={agendaForm.observacion}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, observacion: v }))
                        }
                        width="w-full"
                      />
                    </div>
                  </div>
                  {/* Sección: Identificación */}
                  <div className="mb-3">
                    <p className="text-[10px] font-black text-gray-600 uppercase mb-2 border-b pb-1">
                      👤 Identificación
                    </p>
                    <div className="flex flex-wrap -mx-1">
                      <AgendaFieldF
                        label="Nombres Completos *"
                        name="nom"
                        value={agendaForm.nombre}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, nombre: v }))
                        }
                        width="w-1/2"
                        req
                      />
                      <AgendaFieldF
                        label="Tipo Doc."
                        name="dt"
                        value={agendaForm.docTipo}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, docTipo: v }))
                        }
                        opts={["CC", "CE", "PA", "TI", "NUIP", "RC", "MS"]}
                        width="w-1/6"
                      />
                      <AgendaFieldF
                        label="Nro. Documento"
                        name="dn"
                        value={agendaForm.docNumero}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, docNumero: v }))
                        }
                        width="w-1/3"
                      />
                      <AgendaFieldF
                        label="F. Nacimiento"
                        type="date"
                        name="fn"
                        value={agendaForm.fechaNacimiento}
                        onChange={(v) =>
                          setAgendaForm((p) => ({
                            ...p,
                            fechaNacimiento: v,
                            edad: calcEdad(v),
                          }))
                        }
                        width="w-1/4"
                      />
                      <AgendaFieldF
                        label="Edad"
                        name="ed"
                        value={agendaForm.edad}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, edad: v }))
                        }
                        width="w-1/6"
                        placeholder="Auto"
                      />
                      <AgendaFieldF
                        label="Género"
                        name="gen"
                        value={agendaForm.genero}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, genero: v }))
                        }
                        opts={[
                          "Masculino",
                          "Femenino",
                          "No binario",
                          "Prefiero no decir",
                        ]}
                        width="w-1/4"
                      />
                      <AgendaFieldF
                        label="Estado Civil"
                        name="ec"
                        value={agendaForm.estadoCivil}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, estadoCivil: v }))
                        }
                        opts={[
                          "Soltero(a)",
                          "Casado(a)",
                          "Unión libre",
                          "Divorciado(a)",
                          "Viudo(a)",
                        ]}
                        width="w-1/4"
                      />
                      <AgendaFieldF
                        label="Escolaridad"
                        name="esc"
                        value={agendaForm.escolaridad}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, escolaridad: v }))
                        }
                        opts={[
                          "Primaria",
                          "Bachillerato",
                          "Técnico",
                          "Tecnólogo",
                          "Universitario",
                          "Posgrado",
                          "Ninguno",
                        ]}
                        width="w-1/4"
                      />
                      <AgendaFieldF
                        label="Grupo Sanguíneo"
                        name="gs"
                        value={agendaForm.grupoSanguineo}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, grupoSanguineo: v }))
                        }
                        opts={[
                          "A+",
                          "A-",
                          "B+",
                          "B-",
                          "AB+",
                          "AB-",
                          "O+",
                          "O-",
                        ]}
                        width="w-1/4"
                      />
                      <AgendaFieldF
                        label="Grupo Étnico"
                        name="ge"
                        value={agendaForm.grupoEtnico}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, grupoEtnico: v }))
                        }
                        opts={[
                          "Ninguno",
                          "Indígena",
                          "Afrocolombiano",
                          "Raizal",
                          "Palenquero",
                          "Rom",
                          "Otro",
                        ]}
                        width="w-1/4"
                      />
                      <AgendaFieldF
                        label="Identidad Género"
                        name="ig"
                        value={agendaForm.identidadGenero}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, identidadGenero: v }))
                        }
                        opts={[
                          "Cisgénero",
                          "Transgénero",
                          "No binario",
                          "Prefiero no decir",
                        ]}
                        width="w-1/4"
                      />
                    </div>
                  </div>
                  {/* Sección: Contacto */}
                  <div className="mb-3">
                    <p className="text-[10px] font-black text-gray-600 uppercase mb-2 border-b pb-1">
                      📞 Contacto y Residencia
                    </p>
                    <div className="flex flex-wrap -mx-1">
                      <AgendaFieldF
                        label="Celular"
                        name="cel"
                        value={agendaForm.celular}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, celular: v }))
                        }
                        width="w-1/4"
                      />
                      <AgendaFieldF
                        label="Teléfono"
                        name="tel"
                        value={agendaForm.telefono}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, telefono: v }))
                        }
                        width="w-1/4"
                      />
                      <AgendaFieldF
                        label="Email"
                        type="email"
                        name="em"
                        value={agendaForm.email}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, email: v }))
                        }
                        width="w-1/2"
                      />
                      <AgendaFieldF
                        label="Dirección Residencia"
                        name="res"
                        value={agendaForm.residencia}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, residencia: v }))
                        }
                        width="w-1/2"
                      />
                      <AgendaFieldF
                        label="Zona"
                        name="zr"
                        value={agendaForm.zonaResidencia}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, zonaResidencia: v }))
                        }
                        opts={["Urbana", "Rural"]}
                        width="w-1/6"
                      />
                      <AgendaFieldF
                        label="Estrato"
                        name="est"
                        value={agendaForm.estrato}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, estrato: v }))
                        }
                        opts={["1", "2", "3", "4", "5", "6"]}
                        width="w-1/6"
                      />
                      <AgendaFieldF
                        label="Tipo Vivienda"
                        name="tv"
                        value={agendaForm.tipoVivienda}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, tipoVivienda: v }))
                        }
                        opts={["Propia", "Arrendada", "Familiar", "Otro"]}
                        width="w-1/4"
                      />
                      <AgendaFieldF
                        label="Personas a Cargo"
                        name="pc"
                        value={agendaForm.numPersonasCargo}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, numPersonasCargo: v }))
                        }
                        width="w-1/6"
                      />
                    </div>
                  </div>
                  {/* Sección: Afiliaciones */}
                  <div className="mb-3">
                    <p className="text-[10px] font-black text-gray-600 uppercase mb-2 border-b pb-1">
                      🏥 Afiliaciones SGSSS
                    </p>
                    <div className="flex flex-wrap -mx-1">
                      <AgendaFieldF
                        label="EPS"
                        name="eps"
                        value={agendaForm.eps}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, eps: v }))
                        }
                        width="w-1/4"
                        list="eps-list"
                      />
                      <AgendaFieldF
                        label="ARL"
                        name="arl"
                        value={agendaForm.arl}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, arl: v }))
                        }
                        width="w-1/4"
                        list="arl-list"
                      />
                      <AgendaFieldF
                        label="Nivel Riesgo ARL"
                        name="nr"
                        value={agendaForm.nivelRiesgoARL}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, nivelRiesgoARL: v }))
                        }
                        opts={["I", "II", "III", "IV", "V"]}
                        width="w-1/6"
                      />
                      <AgendaFieldF
                        label="AFP"
                        name="afp"
                        value={agendaForm.afp}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, afp: v }))
                        }
                        width="w-1/4"
                        list="afp-list"
                      />
                    </div>
                  </div>
                  {/* Sección: Laboral */}
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-gray-600 uppercase mb-2 border-b pb-1">
                      💼 Datos Laborales
                    </p>
                    <div className="flex flex-wrap -mx-1">
                      <AgendaFieldF
                        label="Empresa"
                        name="emp"
                        value={agendaForm.empresa}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, empresa: v }))
                        }
                        width="w-1/2"
                      />
                      <AgendaFieldF
                        label="Cargo"
                        name="car"
                        value={agendaForm.cargo}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, cargo: v }))
                        }
                        width="w-1/2"
                      />
                      <AgendaFieldF
                        label="Área / Dependencia"
                        name="dep"
                        value={agendaForm.dependencia}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, dependencia: v }))
                        }
                        width="w-1/3"
                      />
                      <AgendaFieldF
                        label="Tipo Contrato"
                        name="tc2"
                        value={agendaForm.tipoContrato}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, tipoContrato: v }))
                        }
                        opts={[
                          "Término fijo",
                          "Término indefinido",
                          "Prestación de servicios",
                          "Obra o labor",
                          "Aprendizaje",
                        ]}
                        width="w-1/3"
                      />
                      <AgendaFieldF
                        label="Turno"
                        name="turno"
                        value={agendaForm.turnoTrabajo}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, turnoTrabajo: v }))
                        }
                        opts={[
                          "Diurno",
                          "Nocturno",
                          "Mixto",
                          "Rotativo",
                          "12h Día",
                          "12h Noche",
                        ]}
                        width="w-1/6"
                      />
                      <AgendaFieldF
                        label="Antigüedad"
                        name="ant"
                        value={agendaForm.antiguedadEmpresa}
                        onChange={(v) =>
                          setAgendaForm((p) => ({ ...p, antiguedadEmpresa: v }))
                        }
                        width="w-1/6"
                      />
                    </div>
                  </div>
                  <button
                    onClick={registrarPaciente}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-black hover:bg-blue-700 flex items-center justify-center gap-2 shadow"
                  >
                    <UserCheck className="w-5 h-5" />
                    {agendaForm.fechaCita && agendaForm.fechaCita > today
                      ? `📅 Programar cita para ${agendaForm.fechaCita}`
                      : "✅ Registrar en sala de espera"}
                  </button>
                </div>
                {/* Panel derecho: agenda del día resumida */}
                <div className="col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden">
                    <div className="bg-yellow-50 px-4 py-2.5 border-b border-yellow-100">
                      <p className="text-sm font-black text-yellow-800">
                        ⏳ En espera hoy ({enEspera.length})
                      </p>
                    </div>
                    {enEspera.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-6">
                        Sin pacientes en espera
                      </p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {enEspera.map((ag, i) => (
                          <CardPaciente key={ag.id} ag={ag} idx={i} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                    <div className="bg-purple-50 px-4 py-2.5 border-b border-purple-100">
                      <p className="text-sm font-black text-purple-800">
                        📅 Próximas ({proximas.slice(0, 5).length})
                      </p>
                    </div>
                    {proximas.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-6">
                        Sin citas programadas
                      </p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {proximas.slice(0, 5).map((ag, i) => (
                          <CardPaciente key={ag.id} ag={ag} idx={i} showFecha />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

};

export default Agenda;
