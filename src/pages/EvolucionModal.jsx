import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { User, FileText, Stethoscope, ClipboardList, Printer, Activity, Building2, FileCheck, AlertCircle, Sparkles, BrainCircuit, Loader2, Save, History, CheckCircle2, Trash2, Eye, LogOut, Users, BarChart3, PlusCircle, Search, Cloud, ShieldCheck, UserPlus, AlertTriangle, Pill, GraduationCap, Clock, ShieldAlert, UploadCloud, FileSignature, Share2, Plus, HardDrive, UserCheck, ChevronDown, Lock, Unlock, FileSearch, Banknote, Receipt, Pencil, X, Heart, CheckSquare, Square, ChevronRight, ChevronLeft, RefreshCw, WifiOff, Wifi, Shield, MessageSquare, Download, Upload } from 'lucide-react';

const EvolucionModal = () => {
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
  } = useApp();

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
        codigoHCMadre: data.codigoVerificacion || data.firmaDigital?.codigoQR || "",
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
              { id: "examenes_ev", label: "🔬 Exámenes" },
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
                            via: "",
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
                      <select
                        value={med.via || ""}
                        onChange={(e) => {
                          const m = [...evolucionForm.formulaMedicamentos];
                          m[i] = { ...m[i], via: e.target.value };
                          setEvolucionForm((p) => ({
                            ...p,
                            formulaMedicamentos: m,
                          }));
                        }}
                        className="p-1.5 border rounded text-xs"
                      >
                        <option value="">Vía...</option>
                        <option>Oral</option>
                        <option>Sublingual</option>
                        <option>Intramuscular (IM)</option>
                        <option>Intravenosa (IV)</option>
                        <option>Subcutánea (SC)</option>
                        <option>Tópica</option>
                        <option>Oftálmica</option>
                        <option>Ótica</option>
                        <option>Inhalatoria</option>
                        <option>Rectal</option>
                        <option>Transdérmica</option>
                        <option>Nasal</option>
                      </select>
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
            {evTab === "examenes_ev" && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase">
                  Exámenes y Procedimientos Solicitados
                </p>
                <div className="flex gap-2">
                  <input
                    value={evolucionForm._examSearch || ""}
                    onChange={(e) => setEvolucionForm(p => ({ ...p, _examSearch: e.target.value }))}
                    className="flex-1 p-2 border border-purple-200 rounded-lg text-xs"
                    placeholder="Buscar examen..."
                  />
                  <button
                    onClick={() => {
                      const v = (evolucionForm._examSearch || "").trim();
                      if (!v) return;
                      setEvolucionForm(p => ({
                        ...p,
                        examenesSolicitados: [...(p.examenesSolicitados || []), { nombre: v, urgente: false }],
                        _examSearch: "",
                      }));
                    }}
                    className="bg-purple-600 text-white px-3 py-2 rounded-lg text-xs font-bold"
                  >
                    + Agregar
                  </button>
                </div>
                {(evolucionForm.examenesSolicitados || []).length === 0 && (
                  <p className="text-center text-gray-400 text-xs py-6 border border-dashed rounded-xl">
                    Sin exámenes solicitados. Escriba y agregue.
                  </p>
                )}
                {(evolucionForm.examenesSolicitados || []).map((ex, i) => (
                  <div key={i} className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
                    <span className="text-teal-500 font-black text-sm">🔬</span>
                    <span className="flex-1 text-xs font-semibold text-gray-800">{ex.nombre}</span>
                    <label className="flex items-center gap-1 text-[10px] text-red-600 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ex.urgente || false}
                        onChange={(e) => {
                          const u = [...(evolucionForm.examenesSolicitados || [])];
                          u[i] = { ...u[i], urgente: e.target.checked };
                          setEvolucionForm(p => ({ ...p, examenesSolicitados: u }));
                        }}
                        className="accent-red-500"
                      />
                      Urgente
                    </label>
                    <button
                      onClick={() => setEvolucionForm(p => ({ ...p, examenesSolicitados: (p.examenesSolicitados || []).filter((_, j) => j !== i) }))}
                      className="text-red-400 hover:text-red-600 font-black text-sm"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            {/* TAB: Incapacidad (original) */}
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
                    const newCode = "SISO-EV-" + new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14) + "-" + Math.random().toString(36).substr(2, 8).toUpperCase();
                    const certData = {
                      ...data,
                      conceptoAptitud: evolucionForm.nuevoConcept,
                      recomendaciones: evolucionForm.recomendaciones || data.recomendaciones,
                      analisisRestricciones: evolucionForm.recomendaciones || data.analisisRestricciones,
                      fechaCierre: new Date().toISOString().split("T")[0],
                      codigoVerificacion: newCode,
                      _codigoHCOriginal: data.codigoVerificacion || "",
                      _esEvolucion: true,
                    };
                    // Guardar evolución con nuevo código
                    const nuevaEv = {
                      id: Date.now(),
                      codigoEvolucion: newCode,
                      codigoHCMadre: data.codigoVerificacion || "",
                      tipo: "certificado_evolucion",
                      concepto: evolucionForm.nuevoConcept,
                      fecha: new Date().toISOString().split("T")[0],
                      medico: activeDoctorData?.nombre || currentUser?.name || "Dr.",
                      timestamp: new Date().toISOString(),
                    };
                    setData((p) => ({
                      ...p,
                      evoluciones: [...(p.evoluciones || []), nuevaEv],
                    }));
                    const html = _generarCertificadoHTMLNormalizado(certData, activeDoctorData || {}, activeSignature, companies.find((c) => c.id === currentUser?.empresaId) || {});
                    const win = window.open("", "_blank");
                    if (win) { win.document.write(html); win.document.close(); win.print(); }
                    showAlert(`✅ Certificado de evolución generado.\nNuevo código: ${newCode}\nVinculado a HC original: ${data.codigoVerificacion || "—"}`);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2"
                >
                  📄 Expedir Nuevo Certificado (con nuevo código)
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

export default EvolucionModal;
