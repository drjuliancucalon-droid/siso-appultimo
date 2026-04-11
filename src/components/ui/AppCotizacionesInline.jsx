// AppCotizacionesInline.jsx — SISO-APP módulo extraído del monolito
// Estado via Zustand stores
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuthStore } from "../../stores/authStore.js";
import { useUIStore } from "../../stores/uiStore.js";
import { usePatientsStore } from "../../stores/patientsStore.js";
import { useCompaniesStore } from "../../stores/companiesStore.js";
import { useAppStore } from "../../stores/appStore.js";
import { initialOccupPatientState, initialGeneralPatientState, initialUsers, DEFAULT_DOCTOR_DATA } from "../../data/initialState.js";
import {
  _ls, _ss, _sync, _patKey, _patKeyCloud, _compKey, _compKeyCloud,
  _sbSet, _sbGetAll, _sbDelete, _sbQueue,
  _SB_URL, _SB_KEY, _SB_SERVICE_KEY, _SB_HEADERS,
  _sbStorageUpload, _sbStorageGetSignedUrl, _sbStorageDelete,
  _sha256, _pbkdf2Hash, _verifyPassword, _hashSync, _H, _sanitize,
  _isAdmin, _isAdminEmpresa, _isEmpresaUser, _isAdminOrEmpresa, _canUse,
  _contarHC, _secretariaPuede, _secretariaMedicoAsignado,
  _safeLogoUrl, _ipsDocLeftHtml,
  _generarFacturaDIAN_UBL, _generarPaqueteRetencion, _generarCertificadoHTMLNormalizado,
  getAllMeds, MEDICAMENTOS_CO_BASE, MEDICAMENTOS_CO,
  ARL_LIST, AFP_LIST, EPS_LIST, CONTRATO_LIST, TURNO_LIST, ETNIA_LIST, SPECIALTIES_LIST,
  DERIVACIONES_CATALOG, RESTRICCIONES_CATALOG,
  PLAN_CONFIG, ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT, _genOrgId,
  numeroALetras, sanitizeInput, validatePasswordStrength,
  _totpVerify, _totpGenSecret, _totpGetOtpAuthUrl, _totpGetQRCodeUrl,
  _rlCheck, _sbRl, _securePost,
  PrivacyModal, NotificacionModal, LoginForm, AgendaFieldF,
  PortalPublicoTrabajador, ChangePasswordForm,
  fetchWithTimeout, AI_PROVIDERS, parseAIJSON,
  _generarRIPSJson, _descargarRIPSJson, _generarRDA, _descargarRDA,
  _generarHashHC, _generarCodigoQR, _formatFirmaDigital,
  _generarFHIRBundle, validarRIPSPaciente, validarRIPSLote,
  CIE10_OCUPACIONAL, _buscarCIE10, CUPS_OCUPACIONAL, _buscarCUPS,
  CIE11Badge, CUPSInput,
  BrandLogo, DoctorSignature, DoctorSignatureMemo,
  MedicamentoAutocomplete, ConsentimientoModal,
  RecomendacionesChecklistPanel, LicenciasTab,
  RECOMENDACIONES_CATALOG, DEFAULT_RECOMENDACIONES_SELECTED,
  _validarContrasena, _FortalezaPass,
} from "../../globals.jsx";
import {
  User, FileText, Stethoscope, ClipboardList, Printer, Activity,
  Building2, FileCheck, AlertCircle, Sparkles, BrainCircuit, Loader2,
  Save, History, CheckCircle2, Trash2, Eye, LogOut, Users, BarChart3,
  PlusCircle, Search, Cloud, ShieldCheck, UserPlus, AlertTriangle,
  Pill, GraduationCap, Clock, ShieldAlert, UploadCloud, FileSignature,
  Share2, Plus, HardDrive, UserCheck, ChevronDown, Lock, Unlock,
  FileSearch, Banknote, Receipt, Pencil, X, Heart, CheckSquare, Square,
  ChevronRight, ChevronLeft, RefreshCw, WifiOff, Wifi, Shield,
  MessageSquare, Download, Upload,
} from "lucide-react";
import { DoctorSignature as DoctorSignatureCmp } from "../../components/medico/DoctorSignature.jsx";
import { CIE10Input as CIE10InputCmp } from "../../components/medico/CIE10Input.jsx";
import { TabFormulaDerivacion } from "../../components/historia/TabFormulaDerivacion.jsx";
import { AIConfigPanel } from "../../components/ui/AIConfigPanel.jsx";
import { PlanGate } from "../../components/ui/PlanGate.jsx";
import { InputGroup } from "../../components/ui/InputGroup.jsx";
import { PrintStyles } from "../../components/ui/PrintStyles.jsx";

export default function AppCotizacionesInline() {
  const {
    currentUser, setCurrentUser,
    privacidadAceptada, setPrivacidadAceptada,
    loginAttempts, setLoginAttempts, loginBlockedUntil, setLoginBlockedUntil,
    recordFailedAttempt, resetLoginBlock, logout,
  } = useAuthStore();
  const {
    view, setView, navStack, setNavStack, navigate, goBack,
    alertMsg, setAlertMsg, clearAlert,
    confirmConfig, setConfirmConfig,
    promptConfig, setPromptConfig, promptValue, setPromptValue, clearModals,
    syncStatus, setSyncStatus, showSyncReport, setShowSyncReport, syncReport, setSyncReport,
    showAIConfig, setShowAIConfig, aiStatus, setAiStatus,
    activeTab, setActiveTab, dataType, setDataType,
  } = useUIStore();
  const {
    patientsList, setPatientsList, upsertPatient, deletePatient,
    patientSearchTerm, setSearchTerm,
    activePatientId, setActivePatientId,
    atencionesCerradas, setAtencionesCerradas,
    savedReports, setSavedReports,
    savedBills, setSavedBills,
  } = usePatientsStore();
  const {
    companies, setCompaniesList, upsertCompany, deleteCompany,
    usersList, setUsersList,
    doctorSignature, setDoctorSignature,
    aiConfig, setAiConfig,
  } = useCompaniesStore();
  const {
    auditLog, setAuditLog, data, setData,
    isGenerating, setIsGenerating, isGeneratingRestr, setIsGeneratingRestr,
    isGeneratingReco, setIsGeneratingReco, saveStatus, setSaveStatus,
    _hcDirty, _setHcDirty, _exitHcConfirm, _setExitHcConfirm,
    patientSuggestions, setPatientSuggestions,
    historyNotification, setHistoryNotification,
    showRestriccionesPanel, setShowRestriccionesPanel,
    showHistoryModal, setShowHistoryModal,
    ripsModalData, setRipsModalData, backupModalData, setBackupModalData,
    hcChoiceAgenda, setHcChoiceAgenda, historyRecords, setHistoryRecords,
    genPatSearch, setGenPatSearch, examSearch, setExamSearch,
    examList, setExamList, showExamSuggs, setShowExamSuggs,
    diagExamen, setDiagExamen, justExamen, setJustExamen,
    printPreview, setPrintPreview,
    selectedCompanyReport, setSelectedCompanyReport,
    reporteActiveTab, setReporteActiveTab, certSelected, setCertSelected,
    reportStartDate, setReportStartDate, reportEndDate, setReportEndDate,
    reportAIResult, setReportAIResult, isGeneratingReport, setIsGeneratingReport,
    showExportTable, setShowExportTable, precioPorPaciente, setPrecioPorPaciente,
    showDianPanel, setShowDianPanel, dianProvider, setDianProvider, dianApiKey, setDianApiKey,
    billData, setBillData, savedBillsList, setSavedBillsList,
    portafolioItems, setPortafolioItems, portafolioForm, setPortafolioForm, portafolioEditId, setPortafolioEditId,
    cotizaciones, setCotizaciones, cotizacionForm, setCotizacionForm,
    cotizacionView, setCotizacionView, cotizacionSelId, setCotizacionSelId,
    cajaMovimientos, setCajaMovimientos, cajaForm, setCajaForm, cajaTab, setCajaTab,
    cajaFiltroPeriodo, setCajaFiltroPeriodo, cajaFiltroDesde, setCajaFiltroDesde, cajaFiltroHasta, setCajaFiltroHasta,
    contabTab, setContabTab, contabPeriodo, setContabPeriodo,
    asistenciaFecha, setAsistenciaFecha,
    evolucionForm, setEvolucionForm, showEvolucionModal, setShowEvolucionModal,
    selectedPackage, setSelectedPackage, packageChecklist, setPackageChecklist, showPackages, setShowPackages,
    newComp, setNewComp, ipsPerfilForm, setIpsPerfilForm,
    verificationCode, setVerificationCode, verificationFound, setVerificationFound,
    activeUserMgmtTab, setActiveUserMgmtTab, pendingActivationPlan, setPendingActivationPlan,
    sbCloudData, setSbCloudData, sbLoading, setSbLoading,
    newUserForm, setNewUserForm, userEditId, setUserEditId, editForm, setEditForm,
    propForm, setPropForm, selSvc, setSelSvc, propModulo, setPropModulo,
    mensajes, setMensajes, showMensajePanel, setShowMensajePanel, showConsentModal, setShowConsentModal,
    twoFAStep, setTwoFAStep, twoFAToken, setTwoFAToken, twoFAError, setTwoFAError,
    habeasRequests, setHabeasRequests, showHabeasModal, setShowHabeasModal, habeasForm, setHabeasForm,
    showPortalPublico, setShowPortalPublico,
    arlTab, setArlTab, svePrograma, setSvePrograma, sveFiltroEmpresa, setSveFiltroEmpresa,
    sveAIAnalisis, setSveAIAnalisis, sveAICargando, setSveAICargando, sveAIFiltroEmpresa, setSveAIFiltroEmpresa,
    arlForm, setArlForm, arlGuardados, setArlGuardados,
    showNotifModal, setShowNotifModal, notifData, setNotifData,
    portalCodigo, setPortalCodigo, portalPaciente, setPortalPaciente, portalMultiple, setPortalMultiple,
    epiEmpresa, setEpiEmpresa, epiPeriodo, setEpiPeriodo, epiTab, setEpiTab,
    teleconsultas, setTeleconsultas, teleForm, setTeleForm, teleSalaActiva, setTeleSalaActiva, teleTab, setTeleTab,
    mensajeRespuesta, setMensajeRespuesta,
    agendados, setAgendados, showAgenda, setShowAgenda, agendaForm, setAgendaForm,
    agendaSuggs, setAgendaSuggs, agendaTab, setAgendaTab,
    showComposeMensaje, setShowComposeMensaje, composeMensaje, setComposeMensaje,
    inactivityWarning, setInactivityWarning, inactivityCountdown, setInactivityCountdown,
    companiesTab, setCompaniesTab, editingCompany, setEditingCompany,
    cajaMedicoPeriodo, setCajaMedicoPeriodo, porcentajeMedico, setPorcentajeMedico,
    medicoTurnoActivo, setMedicoTurnoActivo,
    orgsList, setOrgsList, activeOrgId, setActiveOrgId, superAdminTab, setSuperAdminTab, newOrgForm, setNewOrgForm,
    portalEmpresaCodigo, setPortalEmpresaCodigo, portalEmpresaEncontrada, setPortalEmpresaEncontrada,
    portalEmpresaPacientes, setPortalEmpresaPacientes, portalEmpresaTab, setPortalEmpresaTab,
    portalEmpresaBuscando, setPortalEmpresaBuscando, portalEmpresaFiltroDoc, setPortalEmpresaFiltroDoc,
    portalActivadoInfo, setPortalActivadoInfo, portalEmpresaAdmin, setPortalEmpresaAdmin,
    portalAdminTab, setPortalAdminTab, portalAdminLoginUser, setPortalAdminLoginUser,
    portalAdminLoginPass, setPortalAdminLoginPass, nuevoMedicoEmpForm, setNuevoMedicoEmpForm,
    sedeForm, setSedeForm, ipsCredForm, setIpsCredForm, ipsEditingEmpId, setIpsEditingEmpId,
  } = useAppStore();

  // ── Render function original ─────────────────────────
  const renderCotizacionesInline = () => {
    const cotizSel = cotizaciones.find((c) => c.id === cotizacionSelId);
    const handleNewItem = () =>
      setCotizacionForm((p) => ({
        ...p,
        items: [...p.items, { servId: "", desc: "", cant: 1, precio: 0 }],
      }));
    const handleRemoveItem = (idx) =>
      setCotizacionForm((p) => ({
        ...p,
        items: p.items.filter((_, i2) => i2 !== idx),
      }));
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
        validez: 30,
        fecha: new Date().toISOString().split("T")[0],
      });
      showAlert("✅ Cotización guardada.");
    };
    const changeEstado = (id, est) => {
      const upd = cotizaciones.map((c) =>
        c.id === id ? { ...c, estado: est } : c
      );
      saveCotizaciones(upd);
    };
    const deleteCotiz = (id) => {
      if (!window.confirm("¿Eliminar esta cotización?")) return;
      saveCotizaciones(cotizaciones.filter((c) => c.id !== id));
    };
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5 mt-2">
        {cotizacionView === "list" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-gray-800">
                🧾 Cotizaciones Rápidas
              </h2>
              <button
                onClick={() => setCotizacionView("nueva")}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black rounded-lg"
              >
                ➕ Nueva Cotización
              </button>
            </div>
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
                  v: cotizaciones.filter((c) => c.estado === "Aprobada").length,
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
                        Sin cotizaciones. Cree la primera.
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
                            onClick={() =>
                              setCotizacionSelId(
                                cot.id === cotizacionSelId ? null : cot.id
                              )
                            }
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded"
                          >
                            👁 Ver
                          </button>
                          <button
                            onClick={() => deleteCotiz(cot.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {cotizSel && (
              <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs">
                <p className="font-black text-indigo-800 mb-2">
                  📋 Cotización #{cotizSel.numero} - {cotizSel.clienteNombre}
                </p>
                <table className="w-full mb-2">
                  <thead className="bg-indigo-700 text-white">
                    <tr>
                      {["Servicio", "Cant", "Precio", "Subtotal"].map((h) => (
                        <th key={h} className="p-1 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(cotizSel.items || []).map((it, i2) => (
                      <tr key={i2} className="border-b border-indigo-100">
                        <td className="p-1">{it.desc || it.servId}</td>
                        <td className="p-1">{it.cant || 1}</td>
                        <td className="p-1">
                          $ {Number(it.precio || 0).toLocaleString("es-CO")}
                        </td>
                        <td className="p-1 font-black">
                          ${" "}
                          {(
                            Number(it.precio || 0) * Number(it.cant || 1)
                          ).toLocaleString("es-CO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-right font-black text-emerald-700">
                  TOTAL: $ {Number(cotizSel.total || 0).toLocaleString("es-CO")}
                </p>
              </div>
            )}
          </div>
        )}
        {cotizacionView === "nueva" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-gray-800">
                ➕ Nueva Cotización
              </h2>
              <button
                onClick={() => setCotizacionView("list")}
                className="text-gray-500 font-bold text-sm"
              >
                ← Volver
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold mb-1">
                  Cliente / Contacto *
                </label>
                <input
                  value={cotizacionForm.clienteNombre}
                  onChange={(e) =>
                    setCotizacionForm((p) => ({
                      ...p,
                      clienteNombre: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Empresa</label>
                <input
                  value={cotizacionForm.clienteEmpresa}
                  onChange={(e) =>
                    setCotizacionForm((p) => ({
                      ...p,
                      clienteEmpresa: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Empresa (opcional)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Email</label>
                <input
                  value={cotizacionForm.clienteEmail}
                  onChange={(e) =>
                    setCotizacionForm((p) => ({
                      ...p,
                      clienteEmail: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Teléfono</label>
                <input
                  value={cotizacionForm.clienteTel}
                  onChange={(e) =>
                    setCotizacionForm((p) => ({
                      ...p,
                      clienteTel: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="300 000 0000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Fecha</label>
                <input
                  type="date"
                  value={cotizacionForm.fecha}
                  onChange={(e) =>
                    setCotizacionForm((p) => ({ ...p, fecha: e.target.value }))
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  Validez (días)
                </label>
                <input
                  type="number"
                  value={cotizacionForm.validez || 30}
                  onChange={(e) =>
                    setCotizacionForm((p) => ({
                      ...p,
                      validez: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="mb-3">
              <p className="text-xs font-black uppercase mb-2">Ítems</p>
              {cotizacionForm.items.map((it, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-4 gap-2 mb-1.5 items-center"
                >
                  <input
                    value={it.desc}
                    onChange={(e) => {
                      const itms = [...cotizacionForm.items];
                      itms[idx] = { ...itms[idx], desc: e.target.value };
                      setCotizacionForm((p) => ({ ...p, items: itms }));
                    }}
                    className="col-span-2 p-1.5 border rounded text-xs"
                    placeholder="Descripción del servicio"
                  />
                  <input
                    type="number"
                    value={it.cant}
                    onChange={(e) => {
                      const itms = [...cotizacionForm.items];
                      itms[idx] = { ...itms[idx], cant: e.target.value };
                      setCotizacionForm((p) => ({ ...p, items: itms }));
                    }}
                    className="p-1.5 border rounded text-xs"
                    placeholder="Cant"
                  />
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={it.precio}
                      onChange={(e) => {
                        const itms = [...cotizacionForm.items];
                        itms[idx] = { ...itms[idx], precio: e.target.value };
                        setCotizacionForm((p) => ({ ...p, items: itms }));
                      }}
                      className="flex-1 p-1.5 border rounded text-xs"
                      placeholder="Precio"
                    />
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 font-black px-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleNewItem}
                className="mt-1 text-xs font-bold text-blue-700 hover:underline"
              >
                + Agregar ítem
              </button>
              <p className="text-right font-black text-emerald-700 mt-2">
                Subtotal: $ {subtotal.toLocaleString("es-CO")}
              </p>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-bold mb-1">Notas</label>
              <textarea
                value={cotizacionForm.notas}
                onChange={(e) =>
                  setCotizacionForm((p) => ({ ...p, notas: e.target.value }))
                }
                className="w-full p-2 border rounded-lg text-xs"
                rows={2}
                placeholder="Condiciones, observaciones..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => saveCotiz("Pendiente")}
                className="flex-1 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-black rounded-lg"
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
    );
  };

  // ──────────────────────────────────────────────────────
  return renderCotizacionesInline();
}
