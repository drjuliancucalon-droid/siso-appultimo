// AppTabAdjuntos.jsx — SISO-APP módulo extraído del monolito
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

export default function AppTabAdjuntos() {
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

  // ──────────────────────────────────────────────────────
  return renderTabAdjuntos();
}
