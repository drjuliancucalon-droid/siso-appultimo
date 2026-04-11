import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, FileText, Stethoscope, ClipboardList, Printer, Activity, Building2, FileCheck, AlertCircle, Sparkles, BrainCircuit, Loader2, Save, History, CheckCircle2, Trash2, Eye, LogOut, Users, BarChart3, PlusCircle, Search, Cloud, ShieldCheck, UserPlus, AlertTriangle, Pill, GraduationCap, Clock, ShieldAlert, UploadCloud, FileSignature, Share2, Plus, HardDrive, UserCheck, ChevronDown, Lock, Unlock, FileSearch, Banknote, Receipt, Pencil, X, Heart, CheckSquare, Square, ChevronRight, ChevronLeft, RefreshCw, WifiOff, Wifi, Shield, MessageSquare, Download, Upload } from 'lucide-react';

const PortafolioPage = (props) => {
  const {
    view, setView, navStack, setNavStack, currentUser, setCurrentUser,
    loginAttempts, setLoginAttempts, loginBlockedUntil, setLoginBlockedUntil,
    privacidadAceptada, setPrivacidadAceptada, syncStatus, setSyncStatus,
    showSyncReport, setShowSyncReport, syncReport, setSyncReport,
    alertMsg, setAlertMsg, confirmConfig, setConfirmConfig,
    promptConfig, setPromptConfig, promptValue, setPromptValue,
    aiConfig, setAiConfig, showAIConfig, setShowAIConfig, aiStatus, setAiStatus,
    companies, setCompanies, usersList, setUsersList, usersReady, setUsersReady,
    patientsList, setPatientsList, savedReports, setSavedReports,
    savedBills, setSavedBills, atencionesCerradas, setAtencionesCerradas,
    doctorSignature, setDoctorSignature, auditLog, setAuditLog,
    activeTab, setActiveTab, data, setData, dataType, setDataType,
    isGenerating, setIsGenerating, isGeneratingRestr, setIsGeneratingRestr,
    isGeneratingReco, setIsGeneratingReco, saveStatus, setSaveStatus,
    patientSuggestions, setPatientSuggestions,
    historyNotification, setHistoryNotification,
    showRestriccionesPanel, setShowRestriccionesPanel,
    showRecomendacionesPanel, setShowRecomendacionesPanel,
    showHistoryModal, setShowHistoryModal,
    ripsModalData, setRipsModalData, backupModalData, setBackupModalData,
    hcChoiceAgenda, setHcChoiceAgenda, historyRecords, setHistoryRecords,
    patientSearchTerm, setPatientSearchTerm, genPatSearch, setGenPatSearch,
    examSearch, setExamSearch, examList, setExamList, showExamSuggs, setShowExamSuggs,
    diagExamen, setDiagExamen, justExamen, setJustExamen, printPreview, setPrintPreview,
    selectedCompanyReport, setSelectedCompanyReport, selectedMedicoReport, setSelectedMedicoReport,
    reporteActiveTab, setReporteActiveTab, certSelected, setCertSelected,
    reportStartDate, setReportStartDate, reportEndDate, setReportEndDate,
    reportAIResult, setReportAIResult, isGeneratingReport, setIsGeneratingReport,
    showExportTable, setShowExportTable, precioPorPaciente, setPrecioPorPaciente,
    showDianPanel, setShowDianPanel, showSecretariaPatientModal, setShowSecretariaPatientModal,
    showTodoChecklist, setShowTodoChecklist, todoSelection, setTodoSelection,
    dianProvider, setDianProvider, dianApiKey, setDianApiKey,
    billData, setBillData, savedBillsList, setSavedBillsList,
    portafolioItems, setPortafolioItems, portafolioForm, setPortafolioForm,
    portafolioEditId, setPortafolioEditId,
    cotizaciones, setCotizaciones, cotizacionForm, setCotizacionForm,
    cotizacionView, setCotizacionView, cotizacionSelId, setCotizacionSelId,
    cajaMovimientos, setCajaMovimientos, cajaForm, setCajaForm, cajaTab, setCajaTab,
    cajaFiltroPeriodo, setCajaFiltroPeriodo, cajaFiltroDesde, setCajaFiltroDesde,
    cajaFiltroHasta, setCajaFiltroHasta, contabTab, setContabTab, contabPeriodo, setContabPeriodo,
    asistenciaFecha, setAsistenciaFecha,
    evolucionForm, setEvolucionForm, showEvolucionModal, setShowEvolucionModal,
    selectedPackage, setSelectedPackage, packageChecklist, setPackageChecklist,
    showPackages, setShowPackages, newComp, setNewComp, ipsPerfilForm, setIpsPerfilForm,
    verificationCode, setVerificationCode, verificationFound, setVerificationFound,
    activeUserMgmtTab, setActiveUserMgmtTab, pendingActivationPlan, setPendingActivationPlan,
    sbCloudData, setSbCloudData, sbLoading, setSbLoading,
    newUserForm, setNewUserForm, userEditId, setUserEditId, editForm, setEditForm,
    propForm, setPropForm, selSvc, setSelSvc, propModulo, setPropModulo,
    mensajes, setMensajes, showMensajePanel, setShowMensajePanel,
    showConsentModal, setShowConsentModal,
    twoFAStep, setTwoFAStep, twoFAToken, setTwoFAToken, twoFAError, setTwoFAError,
    habeasRequests, setHabeasRequests, showHabeasModal, setShowHabeasModal,
    habeasForm, setHabeasForm, showPortalPublico, setShowPortalPublico,
    arlTab, setArlTab, svePrograma, setSvePrograma,
    sveFiltroEmpresa, setSveFiltroEmpresa,
    sveAIAnalisis, setSveAIAnalisis, sveAICargando, setSveAIAnalisisCargando,
    sveAIFiltroEmpresa, setSveAIFiltroEmpresa,
    arlForm, setArlForm, arlGuardados, setArlGuardados,
    showNotifModal, setShowNotifModal, notifData, setNotifData,
    portalCodigo, setPortalCodigo, portalPaciente, setPortalPaciente, portalMultiple, setPortalMultiple,
    epiEmpresa, setEpiEmpresa, epiPeriodo, setEpiPeriodo, epiTab, setEpiTab,
    teleconsultas, setTeleconsultas, teleForm, setTeleForm,
    teleSalaActiva, setTeleSalaActiva, teleTab, setTeleTab,
    mensajeRespuesta, setMensajeRespuesta,
    agendados, setAgendados, showAgenda, setShowAgenda,
    agendaForm, setAgendaForm, agendaSuggs, setAgendaSuggs, agendaTab, setAgendaTab,
    showComposeMensaje, setShowComposeMensaje, composeMensaje, setComposeMensaje,
    companiesTab, setCompaniesTab, editingCompany, setEditingCompany,
    cajaMedicoPeriodo, setCajaMedicoPeriodo, porcentajeMedico, setPorcentajeMedico,
    medicoTurnoActivo, setMedicoTurnoActivo,
    orgsList, setOrgsList, activeOrgId, setActiveOrgId,
    superAdminTab, setSuperAdminTab, newOrgForm, setNewOrgForm,
    portalEmpresaCodigo, setPortalEmpresaCodigo,
    portalEmpresaEncontrada, setPortalEmpresaEncontrada,
    portalEmpresaPacientes, setPortalEmpresaPacientes,
    portalEmpresaTab, setPortalEmpresaTab,
    portalEmpresaBuscando, setPortalEmpresaBuscando,
    portalEmpresaFiltroDoc, setPortalEmpresaFiltroDoc,
    portalActivadoInfo, setPortalActivadoInfo,
    portalEmpresaAdmin, setPortalEmpresaAdmin,
    portalAdminTab, setPortalAdminTab,
    portalAdminLoginUser, setPortalAdminLoginUser,
    portalAdminLoginPass, setPortalAdminLoginPass,
    nuevoMedicoEmpForm, setNuevoMedicoEmpForm,
    sedeForm, setSedeForm, ipsCredForm, setIpsCredForm,
    ipsEditingEmpId, setIpsEditingEmpId,
    showConsentimiento, setShowConsentimiento,
    _hcDirty, _setHcDirty, _exitHcConfirm, _setExitHcConfirm,
    activeDoctorData, activeSignature,
    fileInputRef, fileInputSigRef, csvInputRef,
    goTo, goBack, showAlert, handleChange, handleNameChange, handleSavePatient,
    handleCloseHistory, handleEditHistory, handlePrint, logAccess,
    canViewPatient, isHcOwner, openPatient, handleNewOccupHistory, handleNewGeneralHistory,
    selectPatientSuggestion, generateAIAnalysis, generateAIRestricciones, generateAIRecomendaciones,
    applyRestriccionesChecklist, applyRecomendacionesChecklist, handleManualCloudSave,
    handleExportData, handleImportData, handleSignatureUpload, handleLogin, handleSaveAIConfig,
    exportPatientTable, _printHCClean, handleAceptarPrivacidad,
    renderNavbar,
    BrandLogo, DoctorSignature, DoctorSignatureMemo, InputGroup, PlanGate, LoginForm,
    _isAdmin, _isAdminEmpresa, _isAdminOrEmpresa, _canUse, _contarHC,
    _generarCertificadoHTMLNormalizado,
    PLAN_CONFIG, SECRETARIA_PERMISOS_DEFAULT, DEFAULT_DOCTOR_DATA, ORG_DEFAULT_ID,
    _ls, _sbSet, _sbGet, _SB_URL, _SB_KEY, sanitizeInput,
  } = props;

    const UNIDADES = [
      "Sesión",
      "Examen",
      "Día",
      "Hora",
      "Informe",
      "Certificado",
      "Mes",
      "Paquete",
      "Otro",
    ];
    const handleSaveItem = () => {
      if (!portafolioForm.nombre.trim()) {
        showAlert("Ingrese el nombre del servicio.");
        return;
      }
      if (!portafolioForm.precio || isNaN(Number(portafolioForm.precio))) {
        showAlert("Ingrese un precio válido.");
        return;
      }
      let updated;
      if (portafolioEditId) {
        updated = portafolioItems.map((it) =>
          it.id === portafolioEditId
            ? { ...portafolioForm, id: portafolioEditId }
            : it
        );
        setPortafolioEditId(null);
      } else {
        updated = [
          ...portafolioItems,
          { ...portafolioForm, id: "srv_" + Date.now() },
        ];
      }
      savePortafolio(updated);
      setPortafolioForm({
        nombre: "",
        codigo: "",
        precio: "",
        unidad: "Sesión",
        descripcion: "",
      });
    };
    const handleEdit = (item) => {
      setPortafolioForm({ ...item });
      setPortafolioEditId(item.id);
    };
    const handleDelete = (id) => {
      showConfirm("¿Eliminar este servicio del portafolio?", () =>
        savePortafolio(portafolioItems.filter((it) => it.id !== id))
      );
    };
    const total = portafolioItems.reduce(
      (s, it) => s + Number(it.precio || 0),
      0
    );
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderNavbar()}
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                💼 Portafolio de Servicios / Lista de Precios
              </h2>
              <button
                onClick={() => goTo("dashboard")}
                className="text-gray-500 font-bold text-sm flex items-center gap-1 hover:text-gray-700"
              >
                ← Volver
              </button>
            </div>
            {/* Formulario */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-black text-blue-800 uppercase mb-3">
                {portafolioEditId
                  ? "✏️ Editando servicio"
                  : "➕ Nuevo servicio"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                    Nombre *
                  </label>
                  <input
                    value={portafolioForm.nombre}
                    onChange={(e) =>
                      setPortafolioForm((p) => ({
                        ...p,
                        nombre: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-blue-300 rounded-lg text-sm"
                    placeholder="Examen Médico Ocupacional"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                    Código
                  </label>
                  <input
                    value={portafolioForm.codigo}
                    onChange={(e) =>
                      setPortafolioForm((p) => ({
                        ...p,
                        codigo: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-blue-300 rounded-lg text-sm font-mono"
                    placeholder="EMO-001"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                    Precio COP *
                  </label>
                  <input
                    type="number"
                    value={portafolioForm.precio}
                    onChange={(e) =>
                      setPortafolioForm((p) => ({
                        ...p,
                        precio: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-blue-300 rounded-lg text-sm"
                    placeholder="80000"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                    Unidad
                  </label>
                  <select
                    value={portafolioForm.unidad}
                    onChange={(e) =>
                      setPortafolioForm((p) => ({
                        ...p,
                        unidad: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-blue-300 rounded-lg text-sm"
                  >
                    {UNIDADES.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-4">
                  <label className="text-[10px] font-black text-gray-600 uppercase block mb-1">
                    Descripción
                  </label>
                  <input
                    value={portafolioForm.descripcion}
                    onChange={(e) =>
                      setPortafolioForm((p) => ({
                        ...p,
                        descripcion: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-blue-300 rounded-lg text-sm"
                    placeholder="Descripción breve del servicio"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleSaveItem}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-lg flex-1"
                  >
                    {portafolioEditId ? "💾 Actualizar" : "➕ Agregar"}
                  </button>
                  {portafolioEditId && (
                    <button
                      onClick={() => {
                        setPortafolioEditId(null);
                        setPortafolioForm({
                          nombre: "",
                          codigo: "",
                          precio: "",
                          unidad: "Sesión",
                          descripcion: "",
                        });
                      }}
                      className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs font-black rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* Lista */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-black text-gray-700">
                {portafolioItems.length} servicio(s) registrado(s)
              </p>
              <p className="text-xs font-bold text-emerald-700">
                Valor total catálogo:{" "}
                <strong>$ {total.toLocaleString("es-CO")} COP</strong>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    {[
                      "Código",
                      "Nombre del Servicio",
                      "Precio COP",
                      "Unidad",
                      "Descripción",
                      "Acciones",
                    ].map((h) => (
                      <th key={h} className="p-2 text-left font-black">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portafolioItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-400"
                      >
                        Sin servicios. Agregue el primero con el formulario de
                        arriba.
                      </td>
                    </tr>
                  ) : (
                    portafolioItems.map((item, i) => (
                      <tr
                        key={item.id}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2 font-mono text-gray-500">
                          {item.codigo || "-"}
                        </td>
                        <td className="p-2 font-bold text-gray-800">
                          {item.nombre}
                        </td>
                        <td className="p-2 font-black text-emerald-700">
                          $ {Number(item.precio || 0).toLocaleString("es-CO")}
                        </td>
                        <td className="p-2 text-gray-600">{item.unidad}</td>
                        <td className="p-2 text-gray-500 max-w-[200px] truncate">
                          {item.descripcion || "-"}
                        </td>
                        <td className="p-2 flex gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold hover:bg-blue-200"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold hover:bg-red-200"
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
          {/* Acceso rápido */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-xs text-emerald-700">
            💡 Los servicios del portafolio están disponibles al crear{" "}
            <strong>Cotizaciones</strong> y <strong>Cuentas de Cobro</strong>
          </div>
        </div>
      </div>
    );
};

export default PortafolioPage;
