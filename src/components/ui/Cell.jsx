import React from 'react';
// ============================================================
// Cell.jsx — Módulo extraído del monolito SISO-APP
// Estado centralizado via AppContext (useApp hook)
// ============================================================
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useApp } from "../../AppContext.jsx";
import * as G from "../../globals.jsx";
// Componentes base disponibles via globals
const {
  PrivacyModal, NotificacionModal,
  PortalPublicoTrabajador, ChangePasswordForm,
  LoginForm, AgendaFieldF,
  initialOccupPatientState, initialUsers,
  DEFAULT_DOCTOR_DATA,
  ARL_LIST, AFP_LIST, EPS_LIST, CONTRATO_LIST, TURNO_LIST, ETNIA_LIST, SPECIALTIES_LIST,
  DERIVACIONES_CATALOG, RESTRICCIONES_CATALOG,
  PLAN_CONFIG, ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT,
  _isAdmin, _isAdminEmpresa, _isEmpresaUser, _isAdminOrEmpresa, _canUse,
  _contarHC, _secretariaPuede, _secretariaMedicoAsignado,
  _ls, _ss, _sync, _patKey, _patKeyCloud, _compKey, _compKeyCloud,
  _sbSet, _sbGetAll, _sbDelete, _sbQueue, _SB_URL, _SB_KEY,
  _sbStorageUpload, _sbStorageGetSignedUrl, _sbStorageDelete,
  _sha256, _pbkdf2Hash, _verifyPassword, _hashSync, _H, _sanitize,
  _safeLogoUrl, _ipsDocLeftHtml,
  _generarFacturaDIAN_UBL, _generarPaqueteRetencion, _generarCertificadoHTMLNormalizado,
  getAllMeds, MEDICAMENTOS_CO_BASE, MEDICAMENTOS_CO,
  numeroALetras, _genOrgId,
  sanitizeInput, validatePasswordStrength,
} = G;

// Imports de lucide-react (todos los usados en el monolito)
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

// Imports de componentes del proyecto
import DoctorSignature from "../../components/medico/DoctorSignature.jsx";
import CIE10Input from "../../components/medico/CIE10Input.jsx";
import TabFormulaDerivacion from "../../components/historia/TabFormulaDerivacion.jsx";
import AIConfigPanel from "../../components/ui/AIConfigPanel.jsx";
import PlanGate from "../../components/ui/PlanGate.jsx";
import InputGroup from "../../components/ui/InputGroup.jsx";
import PrintStyles from "../../components/ui/PrintStyles.jsx";

export default function Cell() {
  const app = useApp();
  const {
    view,
    setView,
    sess,
    navStack,
    setNavStack,
    currentUser,
    setCurrentUser,
    users,
    found,
    init,
    mergedDoc,
    loginAttempts,
    setLoginAttempts,
    stored,
    loginBlockedUntil,
    setLoginBlockedUntil,
    privacidadAceptada,
    setPrivacidadAceptada,
    handleAceptarPrivacidad,
    registro,
    logAccess,
    entrada,
    nuevo,
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
    saved,
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
    showRecomendacionesPanel,
    setShowRecomendacionesPanel,
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
    exportPatientTable,
    headers,
    rows,
    csv,
    b64csv,
    a,
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
    suf,
    scoped,
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
    ...appRest
  } = app;


──────────────────
    const renderCell = (val) => {
      if (val === true)
        return <span className="text-emerald-500 font-black text-base">✓</span>;
      if (val === false)
        return <span className="text-gray-300 text-base">-</span>;
      return <span className="text-xs font-bold text-gray-700">{val}</span>;
    };
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderNavbar()}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-800 mb-1">
              ⭐ Planes y Precios
            </h1>
            <p className="text-gray-500 text-sm">
              Elige el plan que mejor se ajuste a tu práctica médica. Sin
              permanencia.
            </p>
          </div>
          {/* ═══ SECCIÓN 1: PLANES PARA PROFESIONALES INDIVIDUALES ═══ */}
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">👨‍⚕️</span>
              <div>
                <h2 className="font-black text-gray-800 text-base">
                  Para Profesionales - Médico Individual
                </h2>
                <p className="text-xs text-gray-400">
                  Un solo médico trabajando de forma independiente
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {["libre", "starter", "pro"].map((pk) => {
                const plan = PLAN_CONFIG[pk];
                const c = planColors2[pk];
                const isCurrent = pk === currentPlan;
                return (
                  <div
                    key={pk}
                    className={`rounded-2xl border-2 overflow-hidden ${
                      isCurrent
                        ? "border-blue-400 shadow-lg ring-2 ring-blue-100"
                        : "border-gray-100 shadow-sm"
                    }`}
                  >
                    {isCurrent && (
                      <div className="bg-blue-600 text-white text-[10px] font-black text-center py-1 tracking-widest">
                        ✅ PLAN ACTUAL
                      </div>
                    )}
                    <div className={`${c.bg} px-4 py-4 text-center`}>
                      <p className="text-white font-black text-base">
                        {plan.label}
                      </p>
                      <p className="text-white/80 text-[11px] mt-0.5">
                        {plan.priceLabel}
                      </p>
                      {pk !== "libre" && (
                        <p className="text-white/60 text-[10px]">
                          {plan.price > 0
                            ? `$${(plan.price * 10).toLocaleString(
                                "es-CO"
                              )}/año - ahorra 2 meses`
                            : ""}
                        </p>
                      )}
                    </div>
                    <div className={`${c.light} px-4 py-4 space-y-1.5`}>
                      <p className="text-xs text-gray-600">
                        <span className="font-black">HC:</span>{" "}
                        {plan.maxHC < 9999
                          ? plan.maxHC + " total/mes"
                          : "Ilimitadas"}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-black">Empresas:</span>{" "}
                        {plan.maxEmpresas < 9999 ? plan.maxEmpresas : "∞"}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-black">Médicos:</span>{" "}
                        {plan.maxMedicos < 9999 ? plan.maxMedicos : "∞"}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-black">SVE:</span>{" "}
                        {plan.maxSVEprogramas === 0
                          ? "-"
                          : plan.maxSVEprogramas === 7
                          ? "7 programas"
                          : plan.maxSVEprogramas + " prog."}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-black">Nube:</span>{" "}
                        {plan.storageMB === 0
                          ? "Local"
                          : plan.storageMB >= 1024
                          ? `${plan.storageMB / 1024}GB`
                          : `${plan.storageMB}MB`}
                      </p>
                    </div>
                    <div className="px-4 pb-4">
                      {isCurrent ? (
                        <div className="w-full text-center py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black">
                          ✅ Plan actual
                        </div>
                      ) : _isAdmin(currentUser?.role) ? (
                        <button
                          onClick={() => {
                            setPendingActivationPlan(pk);
                            setActiveUserMgmtTab("licencias");
                            setUserEditId(null);
                            goTo("users");
                          }}
                          className={`w-full py-2 ${c.bg} text-white rounded-xl text-xs font-black hover:opacity-90 transition`}
                        >
                          Activar para usuario
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            showAlert(
                              `Para activar el plan ${plan.label}, comunícate con el administrador.\n\nPrecio: ${plan.priceLabel}`
                            )
                          }
                          className={`w-full py-2 ${c.bg} text-white rounded-xl text-xs font-black hover:opacity-90 transition`}
                        >
                          {plan.price === 0
                            ? "Plan actual gratis"
                            : "Suscribirme ↗"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ SECCIÓN 2: PLAN PARA EMPRESAS / CLÍNICAS IPS ═══ */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🏢</span>
              <div>
                <h2 className="font-black text-gray-800 text-base">
                  Para Empresas - Clínica / IPS / Multi-médico
                </h2>
                <p className="text-xs text-gray-400">
                  Múltiples médicos, secretarias y módulos avanzados - sin
                  límite de usuarios
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["clinica"].map((pk) => {
                const plan = PLAN_CONFIG[pk];
                const c = planColors2[pk];
                const isCurrent = pk === currentPlan;
                return (
                  <div
                    key={pk}
                    className={`rounded-2xl border-2 overflow-hidden ${
                      isCurrent
                        ? "border-purple-400 shadow-lg ring-2 ring-purple-100"
                        : "border-purple-100 shadow-sm"
                    }`}
                  >
                    {isCurrent && (
                      <div className="bg-purple-600 text-white text-[10px] font-black text-center py-1 tracking-widest">
                        ✅ PLAN ACTUAL
                      </div>
                    )}
                    <div
                      className={`${c.bg} px-6 py-5 flex justify-between items-center`}
                    >
                      <div>
                        <p className="text-white font-black text-lg">
                          {plan.label}
                        </p>
                        <p className="text-white/80 text-sm mt-0.5">
                          {plan.priceLabel}
                        </p>
                        <p className="text-white/60 text-[11px]">
                          $${(plan.price * 10).toLocaleString("es-CO")}/año -
                          ahorra 2 meses
                        </p>
                      </div>
                      <div className="text-right text-white/80 text-xs space-y-1">
                        <p>✅ Médicos ilimitados</p>
                        <p>✅ Secretarias ilimitadas</p>
                        <p>✅ HC ilimitadas</p>
                        <p>✅ Todas las funciones</p>
                      </div>
                    </div>
                    <div className="px-6 py-4 grid grid-cols-2 gap-2">
                      {[
                        ["Médicos", "Ilimitados"],
                        ["Secretarias", "Ilimitadas"],
                        ["HC/mes", "Ilimitadas"],
                        ["Empresas-convenio", "Ilimitadas"],
                        ["SVE programas", "7 programas"],
                        ["Nube", `${plan.storageMB / 1024}GB`],
                        ["Telemedicina", "Ilimitada"],
                        ["IA / Análisis", "Incluido"],
                        ["Portal Empresa", "✅ Incluido"],
                        ["Facturación DIAN", "✅ Incluido"],
                        ["FHIR R4", "✅ Incluido"],
                        ["Soporte prioritario", "✅ Incluido"],
                      ].map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between items-center text-xs py-1 border-b border-gray-50"
                        >
                          <span className="text-gray-600 font-bold">{k}</span>
                          <span className="font-black text-gray-800">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 pb-5">
                      {isCurrent ? (
                        <div className="w-full text-center py-3 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-black">
                          ✅ Plan actual activo
                        </div>
                      ) : _isAdmin(currentUser?.role) ? (
                        <button
                          onClick={() => {
                            setPendingActivationPlan(pk);
                            setActiveUserMgmtTab("licencias");
                            setUserEditId(null);
                            goTo("users");
                          }}
                          className={`w-full py-3 ${c.bg} text-white rounded-xl text-sm font-black hover:opacity-90 transition`}
                        >
                          🏢 Activar Plan Clínica
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            showAlert(
                              `Para activar el Plan Clínica, comunícate con el administrador.\n\nPrecio: ${plan.priceLabel}`
                            )
                          }
                          className={`w-full py-3 ${c.bg} text-white rounded-xl text-sm font-black hover:opacity-90 transition`}
                        >
                          Contactar para activar ↗
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Card de contacto/personalizado */}
              <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-6 flex flex-col justify-center items-center text-center gap-3">
                <span className="text-4xl">🤝</span>
                <p className="font-black text-purple-800">
                  ¿Necesita un plan personalizado?
                </p>
                <p className="text-xs text-purple-600">
                  Para IPS grandes, múltiples sedes o necesidades específicas,
                  ofrecemos planes a medida con soporte dedicado.
                </p>
                <button
                  onClick={() =>
                    showAlert(
                      "Para un plan personalizado, comuníquese al:\n\n📧 siso@ocupasalud.com\n📱 +57 300 XXX XXXX\n\nLe atenderemos en menos de 24 horas."
                    )
                  }
                  className="px-5 py-2.5 bg-purple-700 text-white text-sm font-black rounded-xl hover:bg-purple-800 transition"
                >
                  💬 Solicitar cotización
                </button>
              </div>
            </div>
          </div>
          {/* Tabla comparativa */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-black text-gray-800 text-sm">
                Comparación detallada de funciones
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 font-black text-gray-600 w-1/3">
                      Función
                    </th>
                    {planOrder.map((pk) => (
                      <th
                        key={pk}
                        className={`text-center px-3 py-3 font-black ${
                          planColors2[pk].text
                        } ${pk === currentPlan ? "bg-blue-50" : ""}`}
                      >
                        {PLAN_CONFIG[pk].label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((f, i) => (
                    <tr
                      key={f.label}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
                    >
                      <td className="px-4 py-2 text-gray-700 font-bold">
                        {f.label}
                      </td>
                      {planOrder.map((pk) => (
                        <td
                          key={pk}
                          className={`text-center px-3 py-2 ${
                            pk === currentPlan ? "bg-blue-50/50" : ""
                          }`}
                        >
                          {renderCell(f[pk])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* FAQ */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-xs space-y-2">
            <p className="font-black text-amber-800 text-sm">
              ❓ Preguntas frecuentes
            </p>
            {[
              [
                "¿Mis datos se borran si no pago?",
                "No. Sus HC, pacientes y empresas siempre son suyos. Al vencer el plan puede seguir viendo todo en modo lectura.",
              ],
              [
                "¿Hay permanencia?",
                "No. Puede cancelar cuando quiera sin penalidad.",
              ],
              [
                "¿Puedo bajar de plan?",
                "Sí. El plan Libre siempre está disponible con sus 30 HC ya creadas.",
              ],
              [
                "¿Cómo pago?",
                "Transferencia, Nequi o Daviplata. Comuníquese con el administrador para activar su plan.",
              ],
            ].map(([q, a]) => (
              <div key={q}>
                <p className="font-bold text-amber-800">• {q}</p>
                <p className="text-amber-700 ml-3">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER: PROPUESTAS ECONÓMICAS ───────────────────────────────────────
  // ══════════════════════════════════════════════════════
  // B-F1-03: PORTAFOLIO DE SERVICIOS / LISTA DE PRECIOS
  // ══════════════════════════════════════════════════════

  return renderCell();
}
