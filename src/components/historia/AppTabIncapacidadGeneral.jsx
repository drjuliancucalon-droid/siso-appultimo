// AppTabIncapacidadGeneral.jsx — SISO-APP módulo extraído del monolito
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

export default function AppTabIncapacidadGeneral() {
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

  // ──────────────────────────────────────────────────────
  return renderTabIncapacidadGeneral();
}
