import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// Import all stores
import { useAuthStore } from '../stores/authStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { usePatientsStore } from '../stores/patientsStore.js';
import { useCompaniesStore } from '../stores/companiesStore.js';
// Import all utils
import { _ls, _ss, _SB_URL, _SB_KEY, _sbSet, _sbGetAll, _sbDelete, _sync, _patKey, _patKeyCloud, _compKey, _sbStorageUpload, _sbStorageGetSignedUrl, _sbStorageDelete, sp, sps, _compKeyCloud, _sbQueue } from '../utils/storage.js';
import { _sha256, _pbkdf2Hash, _verifyPassword, _sanitize, _H } from '../utils/crypto.js';
import { _totpBase32Chars, _totpBase32ToBytes, _totpGenSecret, _totpVerify, _totpGetOtpAuthUrl, _totpGetQRCodeUrl } from '../utils/totp.js';
import { _rl, _rlCheck, _SESSION_TIMEOUT_MS, _resetSessionTimer } from '../utils/security.jsx';
import { numeroALetras, analyzeBP, analyzeHR, analyzeBMI, getSpanishDate, NORMAL_DESCRIPTIONS_SYSTEMS } from '../utils/helpers.js';
import { _generarHashHC, _generarCodigoQR, _formatFirmaDigital } from '../utils/firma.js';
import { _generarRIPSJson, _generarFHIRBundle, _generarFHIRPatient, validarRIPSPaciente, validarRIPSLote } from '../utils/rips.js';
import { _generarRDA, _descargarRDA } from '../utils/rda.js';
import { _generarCertificadoHTMLNormalizado, _ipsDocLeftHtml } from '../utils/certificado.js';
import { AI_PROVIDERS, AI_CONFIG_VERSION, fetchWithTimeout, parseAIJSON } from '../utils/aiEngine.js';
import { MEDICAMENTOS_CO_BASE, getAllMeds, addCustomMed, MEDICAMENTOS_CO_CUSTOM_KEY } from '../data/medicamentos.js';
import { DERIVACIONES_CATALOG } from '../data/derivaciones.js';
import { RESTRICCIONES_CATALOG } from '../data/restricciones.js';
import { RECOMENDACIONES_CATALOG, DEFAULT_RECOMENDACIONES_SELECTED } from '../data/recomendaciones.js';
import { CIE11_EQUIVALENCIAS } from '../data/cie11.js';
import { CUPS_OCUPACIONAL } from '../data/cups.js';
import { CIE10_OCUPACIONAL } from '../data/cie10.js';
import { PLAN_CONFIG } from '../data/planConfig.js';
import { ARL_LIST, AFP_LIST, EPS_LIST, CONTRATO_LIST, TURNO_LIST, ETNIA_LIST, SPECIALTIES_LIST } from '../data/dropdowns.js';
import { ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT, _genOrgId, SECRETARIA_PERMISOS_DEFAULT, MEDICO_SIEMPRE_PUEDE, DEFAULT_DOCTOR_DATA, initialOccupPatientState, initialGeneralPatientState, initialUsers, initialCompanyState, _isAdmin, _isAdminEmpresa, _secretariaPuede, _canUse, _contarHC , _isAdminOrEmpresa, _secretariaMedicoAsignado} from '../data/initialState.js';

export function useAppState() {
  let _syncStatusCallback = null;
  const [view, setView] = useState(() => {
    // Restaurar vista activa al recargar - si había sesión activa
    try {
      const sess = JSON.parse(_ls.getItem("siso_session") || "null");
      if (sess?.user && sess?.view && sess.view !== "login") return sess.view;
    } catch {}
    return "login";
  });
  const [navStack, setNavStack] = useState(() => {
    try {
      const sess = JSON.parse(_ls.getItem("siso_session") || "null");
      return sess?.navStack || [];
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    // Restaurar usuario de sesión al recargar
    try {
      const sess = JSON.parse(_ls.getItem("siso_session") || "null");
      if (sess?.user) {
        // Verificar que el usuario sigue existiendo en la lista guardada
        const users = JSON.parse(_ls.getItem("siso_users") || "[]");
        const found = users.find((u) => u.user === sess.user);
        if (!found) return null;
        // Migración: si doctorData.nombre está vacío, rellenar desde initialUsers (no sobreescribir datos ya guardados)
        const init = initialUsers.find((i) => i.user === found.user);
        if (init && init.doctorData?.nombre && !found.doctorData?.nombre) {
          // Usar init como base, sobreescribir solo con valores no vacíos del stored
          const mergedDoc = Object.fromEntries(
            Object.entries(init.doctorData).map(([k, v]) => [k, found.doctorData?.[k] || v])
          );
          return { ...found, doctorData: mergedDoc };
        }
        return found;
      }
    } catch {}
    return null;
  });
  // SEGURIDAD: protección fuerza bruta
  // ══ B-05: Rate limiting persistente en localStorage (OWASP A07) ══
  const [loginAttempts, setLoginAttempts] = useState(() => {
    const stored = parseInt(_ls.getItem("siso_login_attempts") || "0");
    return isNaN(stored) ? 0 : stored;
  });
  const [loginBlockedUntil, setLoginBlockedUntil] = useState(() => {
    const stored = parseInt(_ls.getItem("siso_login_blocked_until") || "0");
    return stored > Date.now() ? stored : null;
  });
  // NORMATIVO: Ley 1581/2012 - aceptación política de privacidad
  const [privacidadAceptada, setPrivacidadAceptada] = useState(() => {
    try {
      const raw = _ls.getItem("siso_privacidad_aceptada"); if (!raw) return false; const parsed = JSON.parse(raw); if (typeof parsed === 'boolean') return parsed; if (typeof parsed === 'string') return parsed === 'true'; if (typeof parsed === 'object' && parsed !== null) return true; return false;
    } catch {
      return false;
    }
  });
  const handleAceptarPrivacidad = () => {
    const registro = { fecha: new Date().toISOString(), version: "1.0" };
    _sync("siso_privacidad_aceptada", JSON.stringify(registro));
    setPrivacidadAceptada(true);
  };
  // NORMATIVO: Res. 1888/2025 RDA - Función de registro de auditoría (reemplaza Res. 1918/2009 Art. 8)
  // NORMATIVO: Res. 1888/2025 RDA - Registro de Datos Autorizados (trazabilidad completa)
  // Campos obligatorios: usuario, accion, seccion, pacienteId, timestamp ISO, userAgent
  const logAccess = (accion, pacienteId, extra, seccion) => {
    const entrada = {
      id: Date.now(),
      fecha: new Date().toISOString(), // timestamp ISO 8601 completo (Res. 1888/2025)
      usuario: currentUser?.user || "sistema",
      nombreUsuario: currentUser?.name || "Sistema",
      rol: currentUser?.role || "desconocido",
      accion, // 'Apertura'|'Guardado'|'Cierre'|'Edicion'|'Login'|'Impresion'|'Exportacion'
      seccion: seccion || extra || null, // sección específica accedida (RDA)
      tipo: extra || null,
      pacienteId: pacienteId || null,
      userAgent:
        typeof navigator !== "undefined"
          ? navigator.userAgent?.substring(0, 120) || "N/A"
          : "N/A",
      sesionId: currentUser?.sesionId || null,
    };
    setAuditLog((prev) => {
      const nuevo = [entrada, ...prev].slice(0, 1000); // Res. 1888/2025: conservar ≥1000 registros
      setTimeout(() => _sync("siso_audit_log", JSON.stringify(nuevo)), 0);
      return nuevo;
    });
  };
  // SUPABASE: estado del indicador de sincronización en la nube
  const [syncStatus, setSyncStatus] = useState("idle");
  const [showSyncReport, setShowSyncReport] = useState(false);
  const [syncReport, setSyncReport] = useState(null); // 'idle'|'loading'|'syncing'|'ok'|'error'
  const [alertMsg, setAlertMsg] = useState("");
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [promptConfig, setPromptConfig] = useState(null);
  const [promptValue, setPromptValue] = useState("");
  const [aiConfig, setAiConfig] = useState({
    activeProvider: "gemini",
    keys: { groq: "", gemini: "", openrouter: "", together: "" },
  });
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiStatus, setAiStatus] = useState(null); // null | 'ok' | 'error'
  const [companies, setCompanies] = useState([]);
  const [usersList, setUsersList] = useState(initialUsers);
  const [patientsList, setPatientsList] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [savedBills, setSavedBills] = useState([]);
  // ── Atenciones cerradas desde agenda (tiempo real) ────────────────────────
  const [atencionesCerradas, setAtencionesCerradas] = useState(() => {
    try {
      return JSON.parse(_ls.getItem("siso_atenciones_cerradas") || "[]");
    } catch {
      return [];
    }
  });
  const [doctorSignature, setDoctorSignature] = useState(null);
  // NORMATIVO: Res. 1888/2025 RDA - Log de auditoría de accesos (trazabilidad completa)
  const [auditLog, setAuditLog] = useState(() => {
    try {
      return JSON.parse(_ls.getItem("siso_audit_log") || "[]");
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return (
        JSON.parse(_ls.getItem("siso_session") || "null")?.activeTab || "form"
      );
    } catch {
      return "form";
    }
  });
  const [data, setData] = useState(() => {
    try {
      const saved = _ls.getItem("siso_active_form");
      if (saved) return { ...initialOccupPatientState, ...JSON.parse(saved) };
    } catch {}
    return initialOccupPatientState;
  });
  const [dataType, setDataType] = useState(() => {
    try {
      return (
        JSON.parse(_ls.getItem("siso_session") || "null")?.dataType ||
        "ocupacional"
      );
    } catch {
      return "ocupacional";
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRestr, setIsGeneratingRestr] = useState(false);
  const [isGeneratingReco, setIsGeneratingReco] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  // ── GUARD: cambios sin guardar en HC ─────────────────────────────────────
  const [_hcDirty, _setHcDirty] = useState(false);
  const [_exitHcConfirm, _setExitHcConfirm] = useState(null); // { onProceed }
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [historyNotification, setHistoryNotification] = useState(null);
  const [showRestriccionesPanel, setShowRestriccionesPanel] = useState(false);
  const [showRecomendacionesPanel, setShowRecomendacionesPanel] =
    useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [ripsModalData, setRipsModalData] = useState(null); // {json: string, filename: string}
  const [backupModalData, setBackupModalData] = useState(null); // {json: string, filename: string}
  const [hcChoiceAgenda, setHcChoiceAgenda] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [genPatSearch, setGenPatSearch] = useState(""); // búsqueda paciente HC General
  const [examSearch, setExamSearch] = useState(""); // solicitud examenes
  const [examList, setExamList] = useState([]); // lista exámenes solicitados
  const [showExamSuggs, setShowExamSuggs] = useState(false);
  const [diagExamen, setDiagExamen] = useState("");
  const [justExamen, setJustExamen] = useState("");
  const [printPreview, setPrintPreview] = useState(null); // 'prescripcion'|'examenes'|'incapacidad'|null
  const [selectedCompanyReport, setSelectedCompanyReport] = useState("");
  const [reporteActiveTab, setReporteActiveTab] = useState("estadisticas"); // 'estadisticas' | 'certificados'
  const [certSelected, setCertSelected] = useState({}); // {[patientId]: bool}
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportAIResult, setReportAIResult] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showExportTable, setShowExportTable] = useState(false);
  const [precioPorPaciente, setPrecioPorPaciente] = useState("");
  // Exportar tabla de pacientes como CSV (sin datos sensibles -- confidencialidad Res.1843/2025 Art.19)
  const exportPatientTable = (patients, compName) => {
    const headers = [
      "N°",
      "Nombre_Trabajador",
      "Tipo_Doc",
      "Documento",
      "Sexo",
      "Edad",
      "Cargo",
      "Empresa",
      "EPS",
      "ARL",
      "Tipo_Examen",
      "Enfasis",
      "Fecha_Examen",
    ];
    const rows = patients.map((p, idx) => [
      idx + 1,
      p.nombres || "N/R",
      p.docTipo || "CC",
      p.docNumero || "N/R",
      p.genero === "Masculino"
        ? "M"
        : p.genero === "Femenino"
        ? "F"
        : p.genero || "N/R",
      p.edad || "N/R",
      p.cargo || "N/R",
      p.empresaNombre || "N/R",
      p.eps || "N/R",
      p.arl || "N/R",
      p.tipoExamen || "N/R",
      p.enfasisExamen || "N/R",
      p.fechaExamen || "N/R",
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    // Descarga CSV sin createObjectURL (compatible sandbox)
    const b64csv = btoa(unescape(encodeURIComponent("\uFEFF" + csv)));
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8;base64," + b64csv;
    a.download = `Trabajadores_${compName.replace(/\s/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  // B-20: DIAN Facturación Electrónica
  const [showDianPanel, setShowDianPanel] = useState(false);
  const [dianProvider, setDianProvider] = useState("siigo"); // 'siigo' | 'alegra' | 'manual'
  const [dianApiKey, setDianApiKey] = useState(() => {
    try {
      return _ss.getItem("siso_dian_apikey") || "";
    } catch {
      return "";
    }
  });
  const [billData, setBillData] = useState({
    number: "01",
    type: "empresa",
    companyId: "",
    clientName: "",
    clientNit: "",
    medicoId: "",
    tipoServicio: "ingreso",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    amountWords: "",
    concept:
      "EXAMENES MEDICOS OCUPACIONALES E INFORME DE SALUD DE LOS TRABAJADORES",
    bankName: "",
    accountType: "",
    accountNumber: "",
    totalPacientes: 0,
    precioPaciente: 0,
    billDoctorId: "",
    emitidaPor: "organizacion", // FASE 2: 'organizacion' | 'medico_independiente'
  });
  const [savedBillsList, setSavedBillsList] = useState([]);
  // ── B-F1-03 Portafolio de servicios ──────────────────────────────────
  const [portafolioItems, setPortafolioItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("siso_portafolio") || "[]");
    } catch {
      return [];
    }
  });
  const [portafolioForm, setPortafolioForm] = useState({
    nombre: "",
    codigo: "",
    precio: "",
    unidad: "Sesión",
    descripcion: "",
  });
  const [portafolioEditId, setPortafolioEditId] = useState(null);
  // ── B-F1-04 Cotizaciones ──────────────────────────────────────────────
  const [cotizaciones, setCotizaciones] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("siso_cotizaciones") || "[]");
    } catch {
      return [];
    }
  });
  const [cotizacionForm, setCotizacionForm] = useState({
    clienteNombre: "",
    clienteEmpresa: "",
    clienteEmail: "",
    clienteTel: "",
    items: [],
    notas: "",
    validezDias: 30,
    fecha: new Date().toISOString().split("T")[0],
    estado: "Pendiente",
  });
  const [cotizacionView, setCotizacionView] = useState("list");
  const [cotizacionSelId, setCotizacionSelId] = useState(null);
  // ── B-F2-01 Caja diaria ───────────────────────────────────────────────
  const [cajaMovimientos, setCajaMovimientos] = useState(() => {
    try {
      // PASO 6: usar clave aislada por empresa/usuario (si hay sesión guardada)
      const sess = JSON.parse(localStorage.getItem("siso_session") || "{}");
      const suf = sess?.empresaId
        ? "empresa_" + sess.empresaId
        : sess?.user || "shared";
      const scoped = JSON.parse(
        localStorage.getItem(`siso_caja_${suf}`) || "null"
      );
      if (scoped !== null) return scoped;
      return JSON.parse(localStorage.getItem("siso_caja") || "[]");
    } catch {
      return [];
    }
  });
  const [cajaForm, setCajaForm] = useState({
    tipo: "ingreso",
    concepto: "",
    monto: "",
    formaPago: "Efectivo",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [cajaTab, setCajaTab] = useState("hoy");
  // PASO 4: filtros de periodo en caja
  const [cajaFiltroPeriodo, setCajaFiltroPeriodo] = useState("hoy");
  const [cajaFiltroDesde, setCajaFiltroDesde] = useState("");
  const [cajaFiltroHasta, setCajaFiltroHasta] = useState("");
  // PASO 5: Módulo Contabilidad
  const [contabTab, setContabTab] = useState("resumen");
  const [contabPeriodo, setContabPeriodo] = useState("mes");
  // ── B-F2-04 Asistencia agenda ─────────────────────────────────────────
  const [asistenciaFecha, setAsistenciaFecha] = useState(
    new Date().toISOString().split("T")[0]
  );
  // ── B-F2-05 Evoluciones HC ────────────────────────────────────────────
  const [evolucionForm, setEvolucionForm] = useState({
    texto: "",
    nuevoConcept: "",
    fecha: new Date().toISOString().split("T")[0],
    // Sub-consulta completa (se llena al abrir modal de Evolución)
    codigoEvolucion: "",
    activeEvTab: "nota",
    motivoConsulta: "",
    diagnosticos: [{ cie10: "", descripcion: "", tipo: "Principal" }],
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
  });
  const [showEvolucionModal, setShowEvolucionModal] = useState(false);
  // ── B-PKG: Package de exámenes ────────────────────────────────────────────
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageChecklist, setPackageChecklist] = useState({});
  const [showPackages, setShowPackages] = useState(false);
  const [newComp, setNewComp] = useState(initialCompanyState);
  // ── PASO 1: Perfil IPS ──────────────────────────────────────────────────────
  const [ipsPerfilForm, setIpsPerfilForm] = useState({
    nombre: "",
    nit: "",
    dv: "",
    direccion: "",
    ciudad: "",
    telefono: "",
    correo: "",
    actividad: "",
    lema: "",
    logo: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationFound, setVerificationFound] = useState(null);
  const [activeUserMgmtTab, setActiveUserMgmtTab] = useState("list");
  const [pendingActivationPlan, setPendingActivationPlan] = useState(null); // plan pre-seleccionado desde renderPlanes
  const [sbCloudData, setSbCloudData] = useState(null); // datos reales de Supabase para almacenamiento
  const [sbLoading, setSbLoading] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    user: "",
    pass: "",
    name: "",
    role: "medico",
    license: "libre",
    secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT },
    medicosAsignados: [],
  });
  const [userEditId, setUserEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [propForm, setPropForm] = useState({
    empresa: "",
    nit: "",
    contacto: "",
    cargo: "",
    fecha: new Date().toISOString().split("T")[0],
    ciudad: "",
    numTrabajadores: "",
    servicios: [],
    observaciones: "",
    validez: "30",
    numero: "001",
  });
  const [selSvc, setSelSvc] = useState("");
  const [propModulo, setPropModulo] = useState("propuesta"); // 'propuesta' | 'cotizacion'
  // ── MENSAJERÍA INTERNA ──────────────────────────────────────────
  const [mensajes, setMensajes] = useState([]); // [{id,from,to,text,fecha,leido,respuesta,respondido}]
  const [showMensajePanel, setShowMensajePanel] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false); // B-19
  // B-18: 2FA TOTP
  const [twoFAStep, setTwoFAStep] = useState(null); // null | {user, foundUser}
  const [twoFAToken, setTwoFAToken] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  // B-22: Habeas Data - Ley 1581/2012
  const [habeasRequests, setHabeasRequests] = useState(() => {
    try {
      return JSON.parse(_ls.getItem("siso_habeas_requests") || "[]");
    } catch {
      return [];
    }
  });
  const [showHabeasModal, setShowHabeasModal] = useState(false);
  const [habeasForm, setHabeasForm] = useState({
    nombre: "",
    documento: "",
    tipo: "",
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  // Portal Público (acceso sin login)
  const [showPortalPublico, setShowPortalPublico] = useState(false);
  // B-29: IA Resumen
  const [aiResumen, setAiResumen] = useState("");
  const [aiCargando, setAiCargando] = useState(false);
  // B-26: ARL
  const [arlTab, setArlTab] = useState("at");
  // B-31: SVE
  const [svePrograma, setSvePrograma] = useState("DME");
  const [sveFiltroEmpresa, setSveFiltroEmpresa] = useState("");
  const [sveAIAnalisis, setSveAIAnalisis] = useState(null);
  const [sveAICargando, setSveAIAnalisisCargando] = useState(false);
  const [sveAIFiltroEmpresa, setSveAIFiltroEmpresa] = useState("");

  const [arlForm, setArlForm] = useState({});
  const [arlGuardados, setArlGuardados] = useState(() =>
    sp("siso_arl_reportes", [])
  );
  // B-15: Notificaciones
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifData, setNotifData] = useState({});
  // B-24: Portal del Trabajador
  const [portalCodigo, setPortalCodigo] = useState("");
  const [portalPaciente, setPortalPaciente] = useState(null);
  const [portalMultiple, setPortalMultiple] = useState([]); // múltiples HCs por cédula
  // B-21: Diagnóstico Epidemiológico
  const [epiEmpresa, setEpiEmpresa] = useState("todas");
  const [epiPeriodo, setEpiPeriodo] = useState("anio");
  const [epiTab, setEpiTab] = useState("resumen");
  // B-17: Telemedicina (Jitsi Meet)
  const [teleconsultas, setTeleconsultas] = useState(() => {
    try {
      return JSON.parse(_ls.getItem("siso_teleconsultas") || "[]");
    } catch {
      return [];
    }
  });
  const [teleForm, setTeleForm] = useState({
    paciente: "",
    documento: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: "",
    motivo: "",
    notas: "",
    consentimientoTele: false,
  });
  const [teleSalaActiva, setTeleSalaActiva] = useState(null); // {roomName, paciente, fecha, hora}
  const [teleTab, setTeleTab] = useState("nueva"); // 'nueva' | 'historial'
  const [mensajeRespuesta, setMensajeRespuesta] = useState(""); // texto de respuesta libre
  // ── AGENDA / SALA DE ESPERA ─────────────────────────────────────
  const [agendados, setAgendados] = useState([]); // [{id,nombre,doc,tipo,medicoId,hora,estado:'espera'|'atendiendo'|'atendido',horaInicio,horaFin}]
  const [showAgenda, setShowAgenda] = useState(false);
  const [agendaForm, setAgendaForm] = useState({
    // Identificación
    nombre: "",
    docTipo: "CC",
    docNumero: "",
    // Sociodemográficos
    fechaNacimiento: "",
    edad: "",
    genero: "",
    estadoCivil: "",
    escolaridad: "",
    grupoSanguineo: "",
    grupoEtnico: "",
    identidadGenero: "",
    // Contacto
    celular: "",
    telefono: "",
    email: "",
    residencia: "",
    zonaResidencia: "",
    estrato: "",
    tipoVivienda: "",
    numPersonasCargo: "",
    // Afiliaciones
    eps: "",
    arl: "",
    afp: "",
    nivelRiesgoARL: "",
    // Laboral
    empresa: "",
    cargo: "",
    dependencia: "",
    tipoContrato: "",
    turnoTrabajo: "",
    antiguedadEmpresa: "",
    // Agenda
    medicoId: "",
    tipoConsulta: "ingreso",
    fechaCita: "",
    horaCita: "",
    observacion: "",
    // Búsqueda
    _busquedaQuery: "",
    _showSuggs: false,
  });
  const [agendaSuggs, setAgendaSuggs] = useState([]);
  const [agendaTab, setAgendaTab] = useState("hoy"); // 'hoy' | 'proximas' | 'nueva'
  const [showComposeMensaje, setShowComposeMensaje] = useState(false);
  const [composeMensaje, setComposeMensaje] = useState({
    destinatarios: [],
    texto: "",
  });
  const fileInputRef = useRef(null);
  const fileInputSigRef = useRef(null);
  const csvInputRef = useRef(null);
  // ── SEGURIDAD: Auto-logout por inactividad (30 min) ─────────────────────
  const _inactivityRef = useRef(null);
  const _warnRef = useRef(null);
  const [inactivityWarning, setInactivityWarning] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(0);
  // ── EMPRESAS (component-level to avoid React #310) ──
  const [companiesTab, setCompaniesTab] = useState("lista");
  const [editingCompany, setEditingCompany] = useState(null);
  // ── CAJA POR MÉDICO (component-level) ──
  const [cajaMedicoPeriodo, setCajaMedicoPeriodo] = useState("mes");
  const [porcentajeMedico, setPorcentajeMedico] = useState(60); // % honorarios médico vs clínica
  // ── FASE 2: Médico de turno activo ──────────────────────────────────────
  const [medicoTurnoActivo, setMedicoTurnoActivo] = useState(() => {
    try {
      return localStorage.getItem("siso_medico_turno") || "";
    } catch {
      return "";
    }
  });
  // ── FASE 2: Lista de organizaciones (multi-tenant) ──────────────────────
  const [orgsList, setOrgsList] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("siso_orgs_list") || "null"
      );
      if (saved && Array.isArray(saved)) return saved;
    } catch {
      /* */
    }
    return [{ ...ORG_CONFIG_DEFAULT }]; // organización inicial
  });
  // ── FASE 2: Org activa para super_admin (puede navegar entre orgs) ───────
  const [activeOrgId, setActiveOrgId] = useState(ORG_DEFAULT_ID);
  // ── FASE 2: Tab panel super_admin ────────────────────────────────────────
  const [superAdminTab, setSuperAdminTab] = useState("orgs");
  // ── FASE 2: Form nueva organización ──────────────────────────────────────
  const [newOrgForm, setNewOrgForm] = useState({
    orgName: "",
    orgNit: "",
    adminUser: "",
    adminName: "",
    adminEmail: "",
    plan: "pro",
  });
  // ── PORTAL EMPRESA (component-level) ──
  const [portalEmpresaCodigo, setPortalEmpresaCodigo] = useState("");
  const [portalEmpresaEncontrada, setPortalEmpresaEncontrada] = useState(null);
  const [portalEmpresaPacientes, setPortalEmpresaPacientes] = useState([]);
  const [portalEmpresaTab, setPortalEmpresaTab] = useState("trabajadores");
  const [portalEmpresaBuscando, setPortalEmpresaBuscando] = useState(false);
  const [portalEmpresaFiltroDoc, setPortalEmpresaFiltroDoc] = useState(""); // filtro cédula en portal empresa
  const [portalActivadoInfo, setPortalActivadoInfo] = useState(null); // {empresa, portalCode} post-activación
  // ── PORTAL EMPRESA ADMIN (FASE 2) ──
  const [portalEmpresaAdmin, setPortalEmpresaAdmin] = useState(null); // empresa admin logueado
  const [portalAdminTab, setPortalAdminTab] = useState("medicos");
  const [portalAdminLoginUser, setPortalAdminLoginUser] = useState("");
  const [portalAdminLoginPass, setPortalAdminLoginPass] = useState("");
  const [nuevoMedicoEmpForm, setNuevoMedicoEmpForm] = useState({
    nombre: "",
    user: "",
    pass: "",
    rol: "medico",
  });
  const [sedeForm, setSedeForm] = useState({
    nombre: "",
    ciudad: "",
    direccion: "",
  });
  // ── IPS: Credenciales IPS desde Super Admin ──
  const [ipsCredForm, setIpsCredForm] = useState({
    nombre: "",
    user: "",
    pass: "",
    empresaId: null,
  });
  const [ipsEditingEmpId, setIpsEditingEmpId] = useState(null);
  const activeDoctorData = currentUser?.doctorData || DEFAULT_DOCTOR_DATA;
  const activeSignature = currentUser?.doctorData?.signature || doctorSignature;
  // ── Bloque 4-A: useMemo para cómputos costosos (bajo rendimiento) ─────────
  const _memoPatients = useMemo(() => patientsList, [patientsList]);
  const _memoCompanies = useMemo(() => companies, [companies]);
  const _memoBills = useMemo(() => savedBillsList, [savedBillsList]);
  const _memoReports = useMemo(() => savedReports, [savedReports]);
  const _memoPatientsCount = useMemo(() => patientsList.length, [patientsList]);
  const _memoClosedHCs = useMemo(
    () => patientsList.filter(p => p.estadoHistoria === "Cerrada" && !p._archivado),
    [patientsList]
  );
  // Debounce ref para guardado de caja (evita escrituras en cada keystroke)
  const _cajaSaveTimer = useRef(null);
  const saveCajaDebounced = useCallback((movs) => {
    if (_cajaSaveTimer.current) clearTimeout(_cajaSaveTimer.current);
    _cajaSaveTimer.current = setTimeout(() => {
      try {
        const suf = currentUser?.empresaId
          ? "empresa_" + currentUser.empresaId
          : currentUser?.user || "shared";
        localStorage.setItem(`siso_caja_${suf}`, JSON.stringify(movs));
        _sbSet(`siso_caja_movs_${suf}`, movs);
      } catch {}
    }, 800);
  }, [currentUser]);
  const showAlert = (msg) => setAlertMsg(msg);
  const showConfirm = (msg, onConfirm) => setConfirmConfig({ msg, onConfirm });
  const showPrompt = (msg, onSubmit, type = "text") => {
    setPromptValue("");
    setPromptConfig({ msg, onSubmit, type });
  };
  // B-24: Detectar acceso público al portal desde URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#portaltrabajador" || hash === "#portal") {
      history.replaceState(null, "", window.location.pathname);
      setShowPortalPublico(true);
    }
    // Deep-link: #portalempresa?code=EMP-XXXX-XXXX
    if (hash.startsWith("#portalempresa")) {
      const params = new URLSearchParams(
        hash.replace("#portalempresa", "").replace("?", "")
      );
      const code = params.get("code");
      if (code) setPortalEmpresaCodigo(code);
      history.replaceState(null, "", window.location.pathname);
      setView("portalempresa");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Portal empresa: auto-buscar empresa cuando llega deep-link con código
  useEffect(() => {
    if (
      view === "portalempresa" &&
      portalEmpresaCodigo &&
      !portalEmpresaEncontrada
    ) {
      const q = portalEmpresaCodigo.trim().toLowerCase();
      const emp = companies.find(
        (c) =>
          c.nit === q ||
          c.nit === portalEmpresaCodigo.trim() ||
          (c.id && c.id === q) ||
          (c.portalCode && c.portalCode.toLowerCase() === q) ||
          c.nombre?.toLowerCase().includes(q)
      );
      if (emp && emp.portalActivo) {
        const pacs = patientsList.filter(
          (p) =>
            (p.empresaId === emp.id || p.empresaNit === emp.nit) &&
            p.estadoHistoria === "Cerrada" &&
            !p._archivado
        );
        setPortalEmpresaEncontrada(emp);
        setPortalEmpresaPacientes(pacs);
      }
    }
  }, [view, portalEmpresaCodigo]); // eslint-disable-line react-hooks/exhaustive-deps

  // SUPABASE: conectar callback de status al estado React
  useEffect(() => {
    _syncStatusCallback = setSyncStatus;
    return () => {
      _syncStatusCallback = null;
    };
  }, []);
  // ══ B-09: Seguridad de cabeceras ═══════════════════════════════════════════
  // NOTA: El meta CSP ha sido eliminado porque causa el error 'unsafe-eval'.
  // Razón técnica: CodeSandbox/React/Babel usan eval() internamente para el
  // compilador en tiempo real (HMR). Un meta CSP sin 'unsafe-eval' bloquea el
  // propio bundler, rompiendo la aplicación.
  // La política CSP correcta debe ir en los HTTP headers del servidor:
  //   Content-Security-Policy: script-src 'self' 'unsafe-inline' 'unsafe-eval' ...
  // Solo X-Frame-Options se mantiene (es seguro y no interfiere con nada).
  useEffect(() => {
    // SEC-FIX-08a: X-Frame-Options - previene clickjacking (CWE-1021)
    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      const xfo = document.createElement("meta");
      xfo.httpEquiv = "X-Frame-Options";
      xfo.content = "SAMEORIGIN";
      document.head.appendChild(xfo);
    }
    // SEC-FIX-08b: Referrer-Policy - no expone URL en peticiones externas (CWE-200)
    if (!document.querySelector('meta[name="referrer"]')) {
      const rp = document.createElement("meta");
      rp.name = "referrer";
      rp.content = "strict-origin-when-cross-origin";
      document.head.appendChild(rp);
    }
    // SEC-FIX-08c: Permissions-Policy - restringe APIs del navegador no usadas
    if (!document.querySelector('meta[http-equiv="Permissions-Policy"]')) {
      const pp = document.createElement("meta");
      pp.httpEquiv = "Permissions-Policy";
      pp.content = "geolocation=(), microphone=(), camera=(), payment=()";
      document.head.appendChild(pp);
    }
  }, []);
  // ── PERF-01: CSS Global — Print + Mobile + content-visibility ─────────────
  useEffect(() => {
    if (document.getElementById("siso-perf-styles")) return;
    const style = document.createElement("style");
    style.id = "siso-perf-styles";
    style.textContent = `
      /* ── PRINT: evitar texto cortado en historias clínicas ── */
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-size: 9pt !important; }

        /* Todos los contenedores de texto: wrap completo, nunca cortar */
        p, span, div, td, th, li, label, input, textarea, pre {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          white-space: pre-wrap !important;
          overflow: visible !important;
          max-width: 100% !important;
        }

        /* Tablas: 100% ancho, sin overflow */
        table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
        td, th { word-break: break-word !important; overflow-wrap: break-word !important; vertical-align: top !important; padding: 3px 5px !important; }

        /* Secciones que NO deben cortarse entre páginas */
        .no-break-inside, section, article, .rounded-2xl, .rounded-xl, .bg-white {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        /* Grids y flex en columna única para impresión */
        .grid, .grid-cols-2, .grid-cols-3, .grid-cols-4 {
          display: block !important;
        }

        /* Ocultar elementos no imprimibles */
        .no-print, button:not(.print-btn), nav, [class*="no-print"] {
          display: none !important;
        }

        /* Asegurar que el contenido de textareas se vea completo */
        textarea, [contenteditable] {
          height: auto !important;
          min-height: unset !important;
          overflow: visible !important;
          white-space: pre-wrap !important;
        }

        /* Campos de formulario visibles */
        input[type="text"], input[type="date"], select {
          border: none !important;
          border-bottom: 1px solid #ccc !important;
          padding: 0 !important;
        }

        /* Saltos de página antes de secciones principales */
        .page-break-before { page-break-before: always !important; }

        /* Tamaño de página */
        @page { size: letter portrait; margin: 1.5cm; }
      }

      /* ── MOBILE: responsive para Android e iOS ── */
      @media (max-width: 768px) {
        /* Navbar compacta */
        nav { flex-wrap: wrap !important; gap: 4px !important; padding: 8px !important; }
        nav button, nav a { font-size: 11px !important; padding: 6px 8px !important; }

        /* Formularios en columna única */
        .grid-cols-2, .grid-cols-3, .grid-cols-4 {
          grid-template-columns: 1fr !important;
        }

        /* Tablas scroll horizontal */
        table { display: block !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }

        /* Touch targets mínimo 44px (Apple HIG / WCAG 2.5.5) */
        button, a, [role="button"], input[type="submit"] {
          min-height: 44px !important;
          min-width: 44px !important;
        }

        /* Texto legible en mobile */
        body, p, span, td, th { font-size: 14px !important; line-height: 1.5 !important; }
        h1 { font-size: 20px !important; }
        h2 { font-size: 17px !important; }
        h3 { font-size: 15px !important; }

        /* Contenedores: ancho completo sin overflow */
        .max-w-4xl, .max-w-5xl, .max-w-6xl, .max-w-7xl {
          max-width: 100% !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
        }

        /* Modales ocupan pantalla completa */
        .fixed.inset-0 > div { width: 96vw !important; max-width: 96vw !important; margin: 0 auto !important; }

        /* Inputs más grandes para touch */
        input, select, textarea {
          font-size: 16px !important; /* Evita zoom automático en iOS */
          padding: 10px 12px !important;
        }
      }

      /* ── EXTRA SMALL: teléfonos 360px ── */
      @media (max-width: 480px) {
        .grid-cols-2 { grid-template-columns: 1fr !important; }
        .flex.gap-2, .flex.gap-3 { flex-wrap: wrap !important; }
        .text-xs { font-size: 12px !important; }
        .px-4 { padding-left: 10px !important; padding-right: 10px !important; }
      }

      /* ── PERF: content-visibility para carga inicial rápida ── */
      /* Solo aplica a secciones que no están visibles al inicio */
      .siso-lazy-section {
        content-visibility: auto;
        contain-intrinsic-size: 0 400px;
      }

      /* Smooth scrolling nativo (sin JS) */
      html { scroll-behavior: smooth; }

      /* Evitar parpadeo/reflow en imágenes */
      img { max-width: 100%; height: auto; }
    `;
    document.head.appendChild(style);
  }, []);
  // Load desde localStorage (inmediato) + Supabase (en background, gana si más reciente)
  useEffect(() => {
    // 1. Carga local inmediata para que la UI no espere
    const _sessionUserInit = (() => {
      try {
        return JSON.parse(_ls.getItem("siso_session") || "null")?.user;
      } catch {
        return null;
      }
    })();
    setCompanies(sp(_compKey(_sessionUserInit || "shared"), []));
    // Pacientes: cargar SOLO los del usuario de sesión activa (aislamiento absoluto)
    // Si no hay sesión guardada, dejar la lista vacía - se cargará en handleLogin
    if (_sessionUserInit) {
      setPatientsList(sp(_patKey(_sessionUserInit), []));
    }
    // NO cargar 'siso_db_patients' genérico - mezclaria pacientes de todos los médicos
    // ══ RECUPERACIÓN: Si usuario guardado tiene passHash vacío (post B-03), restaurar desde initialUsers ══
    const storedUsers = sp("siso_users", null);
    if (storedUsers && Array.isArray(storedUsers)) {
      const fixed = storedUsers.map((u) => {
        const init = initialUsers.find((i) => i.user === u.user);
        // Recuperar passHash vacío
        if (!u.passHash && init) {
          return { ...u, passHash: init.passHash, mustChangePassword: init.mustChangePassword ?? false };
        }
        // Migración: si doctorData.nombre está vacío, rellenar desde initialUsers (primera carga)
        if (init && init.doctorData?.nombre && !u.doctorData?.nombre) {
          return { ...u, doctorData: { ...init.doctorData, ...(u.doctorData || {}) } };
        }
        return u;
      });
      setUsersList(fixed);
    } else {
      setUsersList(initialUsers);
    }
    setSavedReports(sp("siso_saved_reports", []));
    setMensajes(sp("siso_mensajes", []));
    // PASO 6: cargar datos aislados por empresa/usuario desde sesión previa
    const _initSess = (() => {
      try {
        return JSON.parse(_ls.getItem("siso_session") || "{}");
      } catch {
        return {};
      }
    })();
    const _initSuf = _initSess?.empresaId
      ? "empresa_" + _initSess.empresaId
      : _initSess?.user || "shared";
    setAgendados(
      sp(`siso_agendados_${_initSuf}`, null) ?? sp("siso_agendados", [])
    );
    setAtencionesCerradas(
      sp(`siso_atenciones_${_initSuf}`, null) ??
        sp("siso_atenciones_cerradas", [])
    );
    setSavedBillsList(
      sp(`siso_saved_bills_${_initSuf}`, null) ?? sp("siso_saved_bills", [])
    );
    setDoctorSignature(_ls.getItem("siso_doctor_signature") || null);
    const emptyKeys = { groq: "", gemini: "", openrouter: "", together: "" };
    const savedProvider = sp("siso_ai_config_provider", {
      activeProvider: "gemini",
    });
    const savedKeys = sps("siso_ai_keys", emptyKeys);
    const mergedKeys = { ...emptyKeys, ...savedKeys };
    _ls.setItem("siso_ai_config_version", AI_CONFIG_VERSION);
    setAiConfig({
      activeProvider: savedProvider.activeProvider || "gemini",
      keys: mergedKeys,
    });
    // 2. Carga desde Supabase en background (datos más actualizados / otros dispositivos)
    setSyncStatus("loading");
    _sbGetAll().then((cloud) => {
      if (!cloud) {
        setSyncStatus("error");
        return;
      }
      // Para cada colección: si Supabase tiene datos más recientes, actualizar local y estado
      const applyCloud = (key, setter, fallback, localKey) => {
        if (!cloud[key]) return;
        const cloudVal = cloud[key].value;
        const cloudTs = new Date(cloud[key].updatedAt || 0).getTime();
        const localRaw = _ls.getItem(localKey || key);
        // Supabase siempre gana: tiene los datos de todos los dispositivos
        if (cloudVal !== null && cloudVal !== undefined) {
          const asString = JSON.stringify(cloudVal);
          _ls.setItem(localKey || key, asString);
          if (Array.isArray(cloudVal)) setter(cloudVal);
          else setter(cloudVal);
        }
      };
      // Pacientes: cargados por usuario específico en handleLogin - no cargar genérico
      // Empresas: se cargan por usuario en handleLogin, no aquí
      applyCloud("siso_saved_bills", setSavedBillsList, [], "siso_saved_bills");
      applyCloud(
        "siso_saved_reports",
        setSavedReports,
        [],
        "siso_saved_reports"
      );
      applyCloud("siso_audit_log", setAuditLog, [], "siso_audit_log");
      applyCloud("siso_mensajes", setMensajes, [], "siso_mensajes");
      applyCloud("siso_agendados", setAgendados, [], "siso_agendados");
      applyCloud(
        "siso_atenciones_cerradas",
        setAtencionesCerradas,
        [],
        "siso_atenciones_cerradas"
      );
      // Usuarios: merge - agregar los que no existen localmente
      if (
        cloud["siso_users"]?.value &&
        Array.isArray(cloud["siso_users"].value)
      ) {
        const cloudUsers = cloud["siso_users"].value;
        setUsersList((prev) => {
          const merged = [...prev];
          cloudUsers.forEach((cu) => {
            if (!merged.find((u) => u.user === cu.user)) merged.push(cu);
          });
          _ls.setItem("siso_users", JSON.stringify(merged));
          return merged;
        });
      }
      // Doctor signature
      if (cloud["siso_doctor_signature"]?.value) {
        const sig = cloud["siso_doctor_signature"].value;
        setDoctorSignature(sig);
        _ls.setItem("siso_doctor_signature", sig);
      }
      // AI provider
      if (cloud["siso_ai_config_provider"]?.value) {
        const prov = cloud["siso_ai_config_provider"].value;
        setAiConfig((prev) => ({
          ...prev,
          activeProvider: prov.activeProvider || prev.activeProvider,
        }));
      }
      setSyncStatus("ok");
      // Intentar vaciar la cola de pendientes
      _sbQueue.flush();
    });
  }, []);
  // ── AUTO-GUARDADO CADA 2 MINUTOS ─────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || view !== "historia") return;
    const timer = setInterval(() => {
      if (data.id && data.nombres) {
        const toSave = {
          ...data,
          fechaExamen:
            data.fechaExamen || new Date().toISOString().split("T")[0],
          _autoSaved: new Date().toISOString(),
        };
        const list = [...patientsList];
        const idx = list.findIndex((p) => p.id === toSave.id);
        if (idx >= 0) list[idx] = toSave;
        else list.push(toSave);
        setPatientsList(list);
        _syncPatients(list);
        setSaveStatus("auto");
        setTimeout(() => setSaveStatus(""), 2000);
      }
    }, 120000); // 2 minutos
    return () => clearInterval(timer);
  }, [currentUser, view, data, patientsList]);
  // ── BEFOREUNLOAD: advertir al recargar/cerrar pestaña con HC sucia ────────
  useEffect(() => {
    if (!_hcDirty || view !== "historia") return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [_hcDirty, view]);
  // Auto-IMC
  useEffect(() => {
    if (data.peso && data.talla) {
      const p = parseFloat(data.peso),
        t = parseFloat(data.talla) / 100;
      if (t > 0)
        setData((prev) => ({ ...prev, imc: (p / (t * t)).toFixed(2) }));
    }
  }, [data.peso, data.talla]);
  // Auto bill amount words
  useEffect(() => {
    if (billData.amount)
      setBillData((p) => ({
        ...p,
        amountWords:
          numeroALetras(billData.amount).toLowerCase() + " pesos mcte",
      }));
    else setBillData((p) => ({ ...p, amountWords: "" }));
  }, [billData.amount]);
  // ── AUTO-SYNC A SUPABASE CADA 2 MINUTOS ─────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const AUTO_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos
    const doAutoBackup = async () => {
      try {
        if (_syncStatusCallback) _syncStatusCallback("syncing");
        // Sincronizar todas las colecciones a Supabase
        // PASO 6: usar claves aisladas por empresa/usuario
        const _asSuf = currentUser?.empresaId
          ? "empresa_" + currentUser.empresaId
          : currentUser?.user || "shared";
        const tasks = [
          _sbSet(_patKeyCloud(currentUser?.user || "shared"), patientsList),
          _sbSet(_compKeyCloud(currentUser?.user || "shared"), companies),
          _sbSet("siso_users", usersList),
          _sbSet(`siso_saved_bills_${_asSuf}`, savedBillsList),
          _sbSet("siso_saved_reports", savedReports),
          _sbSet("siso_audit_log", auditLog),
          _sbSet("siso_mensajes", mensajes),
          _sbSet(`siso_agendados_${_asSuf}`, agendados),
          _sbSet(`siso_atenciones_${_asSuf}`, atencionesCerradas),
          _sbSet("siso_ai_config_provider", {
            activeProvider: aiConfig.activeProvider,
          }),
        ];
        if (doctorSignature)
          tasks.push(_sbSet("siso_doctor_signature", doctorSignature));
        // Bloque 3: módulos que antes solo vivían en localStorage
        const _u = currentUser?.user || "shared";
        if (cajaMovimientos?.length)
          tasks.push(_sbSet(`siso_caja_movs_${_u}`, cajaMovimientos));
        if (arlGuardados?.length)
          tasks.push(_sbSet(`siso_arl_${_u}`, arlGuardados));
        if (teleconsultas?.length)
          tasks.push(_sbSet(`siso_teleconsultas_${_u}`, teleconsultas));
        if (habeasRequests?.length)
          tasks.push(_sbSet(`siso_habeas_${_u}`, habeasRequests));
        // API keys del usuario actual
        const currentKeys = sps("siso_ai_keys", aiConfig.keys || {});
        if (currentUser?.user)
          tasks.push(_sbSet(`siso_ai_keys_${currentUser.user}`, currentKeys));
        const results = await Promise.all(tasks);
        const allOk = results.every(Boolean);
        if (_syncStatusCallback) _syncStatusCallback(allOk ? "ok" : "error");
        // Vaciar cola de pendientes
        await _sbQueue.flush();
      } catch (err) {
        console.warn("[OCUPASALUD] Auto-sync falló:", err.message);
        if (_syncStatusCallback) _syncStatusCallback("error");
      }
    };
    const timer = setInterval(doAutoBackup, AUTO_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [
    currentUser,
    patientsList,
    companies,
    usersList,
    savedReports,
    savedBillsList,
    aiConfig,
    doctorSignature,
    propForm,
    cajaMovimientos,
    arlGuardados,
    teleconsultas,
    habeasRequests,
  ]);
  // ── PERSISTENCIA DE SESIÓN: guarda estado completo en localStorage ────────
  useEffect(() => {
    if (!currentUser) return;
    _ls.setItem(
      "siso_last_activity",
      JSON.stringify({
        user: currentUser.user,
        ts: new Date().toISOString(),
        patientsCount: patientsList.length,
        companiesCount: companies.length,
      })
    );
  }, [
    currentUser,
    patientsList,
    companies,
    savedBillsList,
    savedReports,
    aiConfig,
  ]);
  // ── PERSISTENCIA DE VISTA Y SESIÓN: guarda la vista activa y usuario para restaurar al recargar
  useEffect(() => {
    if (currentUser && view !== "login") {
      _ls.setItem(
        "siso_session",
        JSON.stringify({
          user: currentUser.user,
          empresaId: currentUser.empresaId || null,
          view,
          navStack,
          activeTab,
          dataType,
        })
      );
    } else if (!currentUser) {
      // Al cerrar sesión, limpiar la sesión guardada
      _ls.removeItem("siso_session");
      _ls.removeItem("siso_active_form");
    }
  }, [currentUser, view, navStack, activeTab, dataType]);
  // ── PASO 1: Cargar datos empresa cuando se navega a perfilips ──────────────
  useEffect(() => {
    if (view !== "perfilips" || currentUser?.role !== "admin_empresa") return;
    const me = companies.find((c) => c.id === currentUser.empresaId) || {};
    setIpsPerfilForm({
      nombre: me.nombre || "",
      nit: me.nit || "",
      dv: me.dv || "",
      direccion: me.direccion || "",
      ciudad: me.ciudad || "",
      telefono: me.telefono || "",
      correo: me.correo || "",
      actividad: me.actividad || "",
      lema: me.lema || "",
      logo: me.logo || "",
      _loaded: true,
    });
  }, [view, currentUser?.empresaId, companies]);
  // ── PERSISTENCIA DEL FORMULARIO ACTIVO: guarda el borrador en tiempo real
  useEffect(() => {
    if (!currentUser || view !== "historia") return;
    // Solo guardar si hay datos mínimos para no sobreescribir con formulario vacío
    if (data && (data.nombres || data.id)) {
      _ls.setItem("siso_active_form", JSON.stringify(data));
    }
  }, [data, currentUser, view]);
  const _TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos
  const _WARN_MS = 29 * 60 * 1000; // aviso 1 min antes
  const _resetInactivity = useCallback(() => {
    setInactivityWarning(false);
    clearTimeout(_inactivityRef.current);
    clearTimeout(_warnRef.current);
    if (!currentUser) return;
    _warnRef.current = setTimeout(() => {
      setInactivityWarning(true);
      let secs = 60;
      setInactivityCountdown(secs);
      const cd = setInterval(() => {
        secs--;
        setInactivityCountdown(secs);
        if (secs <= 0) {
          clearInterval(cd);
        }
      }, 1000);
    }, _WARN_MS);
    _inactivityRef.current = setTimeout(() => {
      setCurrentUser(null);
      setView("login");
      setInactivityWarning(false);
      _ls.removeItem("siso_session");
      _ls.removeItem("siso_active_form");
      showAlert(
        "⏱️ Sesión cerrada por inactividad (30 min). Vuelva a iniciar sesión."
      );
    }, _TIMEOUT_MS);
  }, [currentUser]);
  useEffect(() => {
    if (!currentUser) return;
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((ev) =>
      window.addEventListener(ev, _resetInactivity, { passive: true })
    );
    _resetInactivity();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, _resetInactivity));
      clearTimeout(_inactivityRef.current);
      clearTimeout(_warnRef.current);
    };
  }, [currentUser, _resetInactivity]);
  // ── MOTOR IA ──────────────────────────────────────────────────────────────
  const callAI = useCallback(
    async (prompt, expectJson = false) => {
      const systemPrompt = expectJson
        ? `Eres médico especialista en Medicina del Trabajo y Salud Ocupacional en Colombia, con más de 15 años de experiencia en evaluaciones de aptitud laboral, ingresos, egresos, seguimientos periódicos y post-incapacidad, manejo de enfermedades laborales, calificación de origen y PCL, y gestión de programas de vigilancia epidemiológica (PVE) conforme a la Res. 1843/2025 (deroga 2346/2007), Res. 2404/2019, Dec. 1072/2015 y Ley 1562/2012. Cuando la consulta sea de medicina general, actúas como médico general con especialización en medicina interna y más de 15 años de experiencia clínica. Redactas con lenguaje técnico-médico formal, directo y puntual. RESPONDE ÚNICAMENTE CON JSON VÁLIDO, sin texto previo, sin bloques markdown, sin explicaciones adicionales. El JSON debe comenzar con { y terminar con }.`
        : `Eres médico especialista en Medicina del Trabajo y Salud Ocupacional en Colombia, con más de 15 años de experiencia en evaluaciones ocupacionales (ingreso, egreso, periódico, reintegro, post-incapacidad), restricciones médico-laborales, enfermedades laborales, vigilancia epidemiológica, calificación de origen y pérdida de capacidad laboral (PCL). Conoces a fondo la normativa vigente: Res. 1843/2025 (norma vigente, deroga Res. 2346/2007), Res. 2404/2019, Dec. 1072/2015, GTC-45:2012, GATISO-DME, GATISO-TME, Ley 1562/2012 y Res. 0312/2019. Cuando la consulta corresponde a medicina general, actúas como médico general con especialización clínica y más de 15 años de experiencia, manejando patología ambulatoria, crónica y aguda con criterio clínico sólido. Tu lenguaje es técnico, formal, directo y puntual. Respondes en español.`;
      // Orden de prioridad fijo: gemini → openrouter → groq → together
      // Groq puede fallar por CORS según el dominio; gemini y openrouter son más estables en browser
      const PRIORITY_ORDER = ["gemini", "openrouter", "groq", "together"];
      const activeKey = aiConfig.activeProvider || "gemini";
      // Poner el activo primero, luego el resto en orden de prioridad
      const fallbackOrder = [
        activeKey,
        ...PRIORITY_ORDER.filter((k) => k !== activeKey),
      ].filter((v, i, a) => a.indexOf(v) === i); // deduplicar
      let lastError = null;
      for (const providerKey of fallbackOrder) {
        const provider = AI_PROVIDERS[providerKey];
        if (!provider) continue;
        const key = aiConfig.keys?.[providerKey];
        if (!key || key === "auto") continue; // skip si no tiene key válida
        try {
          // [SEGURIDAD] log eliminado
          const text = await provider.call(prompt, systemPrompt, key);
          if (text && text.trim().length > 10) {
            setAiStatus("ok");
            // [SEGURIDAD] log eliminado
            return text; // ← BUG CORREGIDO: return siempre, no solo si no es activeKey
          }
        } catch (e) {
          console.warn(`[IA] ${providerKey} falló: ${e.message}`);
          lastError = e;
        }
      }
      setAiStatus("error");
      const providerNames = fallbackOrder
        .map((k) => AI_PROVIDERS[k]?.name || k)
        .join(", ");
      throw new Error(
        `⚠️ IA no disponible. Probados: ${providerNames}\n` +
          `Último error: ${lastError?.message || "sin respuesta"}\n\n` +
          `SOLUCIÓN: Abra ⚙️ IA → use el botón "Probar" en cada proveedor → obtenga una key nueva gratis en el enlace que aparece → guarde.\n` +
          `Las keys gratuitas expiran o alcanzan su límite. Renovarlas toma menos de 2 minutos.`
      );
    },
    [aiConfig]
  );
  // ── GENERACIÓN IA COMPLETA (Concepto + Diagnósticos) ─────────────────────
  const generateAIAnalysis = async () => {
    if (!_canUse("ia_analisis", currentUser)) {
      showAlert(
        "🔒 El análisis IA está disponible en el plan ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes para actualizar."
      );
      return;
    }
    if (!data.cargo) {
      showAlert("Ingrese el cargo del trabajador para usar el análisis IA.");
      return;
    }
    setIsGenerating(true);
    const hallazgos =
      Object.entries(data.examenFisicoSistemas || {})
        .filter(([, v]) => v.estado === "Anormal")
        .map(([k, v]) => `${k}: ${v.hallazgo}`)
        .join("; ") || "Sin hallazgos patológicos";
    const antecedentes =
      Object.entries(data.antecedentesAgrupados || {})
        .filter(([, v]) => v.val)
        .map(([k, v]) => `${k}: ${v.det}`)
        .join(" | ") || "Niega";
    const riesgos =
      Object.entries(data.riesgos || {})
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ") || "No reportados";
    // ── Contexto clínico adaptado al TIPO DE EXAMEN ──────────────────────────
    const _tipoExamen = (data.tipoExamen || "").toUpperCase();
    const _contextoTipo = (() => {
      if (_tipoExamen.includes("INGRESO"))
        return "EXAMEN DE INGRESO: Evalúa la aptitud INICIAL para el cargo. Las recomendaciones deben incluir: (A) Medidas preventivas desde el inicio de la relación laboral, (B) Identificación de factores de riesgo preexistentes vs laborales, (C) Línea de base para seguimiento futuro, (D) Programa de inducción en SST, (E) Exámenes paraclínicos de ingreso recomendados según riesgos.";
      if (
        _tipoExamen.includes("PERIÓDICO") ||
        _tipoExamen.includes("PERIODICO")
      )
        return "EXAMEN PERIÓDICO: Evalúa cambios en el estado de salud respecto al examen anterior. Las recomendaciones deben incluir: (A) Comparación con hallazgos previos y tendencias, (B) Seguimiento de patologías crónicas ya identificadas, (C) Adherencia a PVE (Programas de Vigilancia Epidemiológica) activos, (D) Refuerzo de medidas de control de riesgos laborales, (E) Indicadores de salud ocupacional: ausentismo, accidentes recientes.";
      if (_tipoExamen.includes("EGRESO") || _tipoExamen.includes("RETIRO"))
        return "EXAMEN DE EGRESO: Evalúa el estado de salud AL FINALIZAR el vínculo laboral. Las recomendaciones deben incluir: (A) Detección de enfermedades o secuelas de origen laboral (Decreto 1477/2014), (B) Determinación de origen laboral o común de hallazgos, (C) Indicar si el trabajador requiere seguimiento médico post-retiro, (D) Documentación de condiciones para eventual reporte a ARL, (E) Concepto sobre relación de causalidad con el cargo/empresa.";
      if (
        _tipoExamen.includes("POST") ||
        _tipoExamen.includes("INCAPACIDAD") ||
        _tipoExamen.includes("REINTEGRO")
      )
        return "EXAMEN POST-INCAPACIDAD / REINTEGRO LABORAL: Evalúa aptitud para retornar al trabajo tras incapacidad. Las recomendaciones deben incluir: (A) Condiciones específicas para el reintegro (gradual, modificado, pleno), (B) Restricciones temporales o permanentes con plazos y seguimiento, (C) Adaptaciones del puesto de trabajo necesarias, (D) Plan de rehabilitación laboral si aplica, (E) Criterios de seguimiento médico post-reintegro, (F) Articular con ARL para plan de reincorporación.";
      if (_tipoExamen.includes("SEGUIMIENTO"))
        return "EXAMEN DE SEGUIMIENTO: Evalúa la evolución de condiciones ya identificadas. Las recomendaciones deben incluir: (A) Respuesta al tratamiento o intervención previa, (B) Actualización del concepto de aptitud si hay cambios clínicos, (C) Ajuste de restricciones según evolución, (D) Próxima cita de seguimiento, (E) Indicadores de mejora o deterioro documentados.";
      // Default genérico
      return "Evalúa la aptitud del trabajador según los hallazgos clínicos actuales. Las recomendaciones deben ser específicas para el cargo, la empresa y los riesgos identificados.";
    })();

    const prompt = `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en evaluaciones ocupacionales en Colombia (ingresos, egresos, periódicos, reintegros, post-incapacidad). Analiza con criterio clínico-ocupacional experto la siguiente historia y genera el concepto médico ocupacional conforme a Res. 1843/2025 (norma vigente - deroga Res. 2346/2007). Devuelve ÚNICAMENTE JSON.
DATOS DEL TRABAJADOR: Cargo: ${data.cargo} | Empresa: ${data.empresaNombre} (${
      data.actividadEconomica || "N/E"
    }) | Tipo examen: ${data.tipoExamen} | Énfasis: ${data.enfasisExamen}
Edad: ${data.edad}a | Género: ${data.genero} | Escolaridad: ${
      data.escolaridad
    } | ARL: ${data.arl || "N/R"}
Signos vitales: TA ${data.ta || "N/R"} | FC ${data.fc || "N/R"} | IMC ${
      data.imc || "N/R"
    } | Talla ${data.talla || "N/R"}cm | Peso ${data.peso || "N/R"}kg
Hallazgos físicos patológicos: ${hallazgos}
Antecedentes personales relevantes: ${antecedentes}
Riesgos ocupacionales identificados: ${riesgos}
Hábitos: Tabaquismo ${data.habitos?.fuma} | Alcohol ${
      data.habitos?.alcohol
    } | Actividad física ${data.habitos?.deporte}
CONTEXTO ESPECÍFICO DEL TIPO DE EXAMEN: ${_contextoTipo}
CRITERIOS OBLIGATORIOS: 1) El concepto de aptitud debe citar el artículo de la Res. 1843/2025 correspondiente (norma vigente desde 29 abril 2025 - Res. 2346/2007 derogada). 2) Si es egreso o post-incapacidad, incluir análisis de reintegro laboral. 3) Las restricciones deben ser operativas, cuantificables y con base normativa (GTC-45, GATISO). 4) Las recomendaciones deben ser específicas para el cargo y los riesgos, no genéricas, y deben responder al contexto del tipo de examen indicado arriba.
JSON REQUERIDO (sin markdown, sin texto adicional):
{"diagnosticoPrincipal":"Z10.0 - EXAMEN MÉDICO OCUPACIONAL","diagnosticoSecundario1":"CIE-10 - Hallazgo clínico identificado o cadena vacía","diagnosticoSecundario2":"CIE-10 - Segundo hallazgo o cadena vacía","conceptoAptitud":"Concepto de aptitud laboral (APTO/APTO CON RESTRICCIONES/NO APTO) con justificación cargo-hallazgos. NO mencionar diagnósticos específicos, medicamentos, ni tratamientos. Solo aptitud y condiciones laborales. Conforme Res. 1843/2025 Art. 20","vigencia":"X meses con justificación clínica","recomendaciones":"Mínimo 10 recomendaciones de medicina preventiva y salud ocupacional enfocadas en cargo y riesgos. NO incluir medicamentos ni tratamiento farmacológico. NO referir tratamiento médico actual","restriccionesTexto":"Restricciones médico-laborales operativas y cuantificables (mínimo 5 si hay hallazgos), formato: [TIPO] (Segmento) Descripción - Base legal","derivaciones":[{"especialidad":"Especialidad médica requerida","motivo":"Motivo clínico concreto","urgencia":"Electiva"}],"examenesSugeridos":["Examen paraclínico 1"],"interconsultaResumen":"Resumen clínico para interconsulta o cadena vacía","incapacidadSugerida":{"aplica":false,"dias":0,"motivo":"","diagnosticoCIE":""}}`;
    try {
      const text = await callAI(prompt, true);
      const parsed = parseAIJSON(text);
      // Para énfasis OCUPACIONAL: diagnóstico principal siempre Z10.0 (examen ocupacional)
      // Los diagnósticos encontrados pasan a secundarios
      const isOcupacional =
        (data.enfasisExamen || "GENERAL").toUpperCase() !== "GENERAL" ||
        [
          "INGRESO",
          "PERIODICO",
          "PERIÓDICO",
          "EGRESO",
          "RETIRO",
          "POST-INCAPACIDAD",
          "REINTEGRO",
          "SEGUIMIENTO",
        ].some((t) => (data.tipoExamen || "").toUpperCase().includes(t));
      const dxPrincipalFinal = "Z10.0 - EXAMEN MÉDICO OCUPACIONAL";
      // El dx que traería la IA como principal pasa a secundario1 si es ocupacional
      const aiDxPrincipal = parsed.diagnosticoPrincipal || "";
      const dxSec1Final = isOcupacional
        ? aiDxPrincipal && !aiDxPrincipal.includes("Z10")
          ? aiDxPrincipal
          : parsed.diagnosticoSecundario1 || ""
        : parsed.diagnosticoSecundario1 || "";
      const dxSec2Final = isOcupacional
        ? aiDxPrincipal &&
          !aiDxPrincipal.includes("Z10") &&
          parsed.diagnosticoSecundario1
          ? parsed.diagnosticoSecundario1
          : parsed.diagnosticoSecundario2 || ""
        : parsed.diagnosticoSecundario2 || "";
      setData((prev) => ({
        ...prev,
        diagnosticoPrincipal: isOcupacional
          ? dxPrincipalFinal
          : parsed.diagnosticoPrincipal || prev.diagnosticoPrincipal,
        diagnosticoSecundario1: dxSec1Final || prev.diagnosticoSecundario1,
        diagnosticoSecundario2: dxSec2Final || prev.diagnosticoSecundario2,
        conceptoAptitud: parsed.conceptoAptitud || prev.conceptoAptitud,
        vigencia: parsed.vigencia || prev.vigencia,
        recomendaciones: parsed.recomendaciones || prev.recomendaciones,
        analisisRestricciones:
          parsed.restriccionesTexto || prev.analisisRestricciones,
        formulaMedica: parsed.formulaMedica || prev.formulaMedica,
        formulaMedicamentos: parsed.formulaMedicamentos?.length
          ? parsed.formulaMedicamentos.map((m, i) => ({
              ...m,
              id: Date.now() + i,
            }))
          : prev.formulaMedicamentos,
      }));
      // Aplicar también derivaciones, exámenes, interconsulta e incapacidad si la IA los sugirió
      if (parsed.derivaciones?.length > 0) {
        const newDervs = parsed.derivaciones.map((d, i) => ({
          id: Date.now() + i,
          especialidad: d.especialidad || "",
          motivo: d.motivo || "",
          urgencia: d.urgencia || "Electiva",
          _fromAI: true,
        }));
        setData((prev) => ({
          ...prev,
          derivaciones: [...(prev.derivaciones || []), ...newDervs],
        }));
      }
      if (parsed.examenesSugeridos?.length > 0) {
        setData((prev) => ({
          ...prev,
          paraclinicosCheck: {
            ...(prev.paraclinicosCheck || {}),
            _aiSugeridos: parsed.examenesSugeridos.join("\n"),
          },
        }));
      }
      if (
        parsed.incapacidadSugerida?.aplica &&
        parsed.incapacidadSugerida.dias > 0
      ) {
        setData((prev) => ({
          ...prev,
          incapacidad: {
            ...(prev.incapacidad || {}),
            dias: parsed.incapacidadSugerida.dias,
            motivo:
              parsed.incapacidadSugerida.motivo ||
              prev.incapacidad?.motivo ||
              "",
            diagnosticoCIE:
              parsed.incapacidadSugerida.diagnosticoCIE ||
              prev.incapacidad?.diagnosticoCIE ||
              dxSec1Final ||
              "",
          },
        }));
      }
      const extraMsg = [
        parsed.derivaciones?.length > 0
          ? `\n• ${parsed.derivaciones.length} derivación(es) sugerida(s)`
          : "",
        parsed.examenesSugeridos?.length > 0
          ? `\n• ${parsed.examenesSugeridos.length} examen(es) sugerido(s)`
          : "",
        parsed.incapacidadSugerida?.aplica
          ? `\n• Incapacidad sugerida: ${parsed.incapacidadSugerida.dias} días`
          : "",
      ].join("");
      showAlert(
        "✅ Análisis IA completado.\n• Diagnóstico principal: Z10.0 - EXAMEN MÉDICO OCUPACIONAL\n• Diagnósticos secundarios incluidos si hay hallazgos." +
          extraMsg +
          "\n\nRevise y ajuste los campos según su criterio clínico."
      );
    } catch (e) {
      showAlert(
        `Error IA: ${e.message}\n\nConfigure un proveedor de IA en el botón ⚙️ IA o verifique su conexión.`
      );
    } finally {
      setIsGenerating(false);
    }
  };
  // ── GENERACIÓN IA SOLO RESTRICCIONES ─────────────────────────────────────
  const generateAIRestricciones = async () => {
    setIsGeneratingRestr(true);
    const hallazgos =
      Object.entries(data.examenFisicoSistemas || {})
        .filter(([, v]) => v.estado === "Anormal")
        .map(([k, v]) => `${k}: ${v.hallazgo}`)
        .join("; ") || "Sin hallazgos";
    const osteo = Object.entries(data.maniobrasOsteomusculares || {})
      .filter(([, v]) => v.estado === "Anormal")
      .map(([k, v]) => `${k}: ${v.hallazgo}`)
      .join("; ");
    const prompt = `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia, experto en restricciones médico-laborales, reintegro laboral y vigilancia epidemiológica. Con base en los hallazgos clínicos del trabajador, genera las restricciones médico-laborales correspondientes. Devuelve ÚNICAMENTE JSON.
DATOS: Cargo: ${data.cargo} | Empresa: ${data.empresaNombre} | Tipo examen: ${
      data.tipoExamen
    }
Riesgos ocupacionales: ${
      Object.entries(data.riesgos || {})
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ") || "No reportados"
    }
Hallazgos físicos patológicos: ${hallazgos}
Maniobras osteomusculares positivas: ${osteo || "Ninguna"}
IMC: ${data.imc} | TA: ${data.ta} | Diagnóstico principal: ${
      data.diagnosticoPrincipal
    }
INSTRUCCIÓN: Las restricciones deben ser operativas, cuantificables (en kg, min, grados o frecuencias), con segmento anatómico identificado, tipo (TEMPORAL/PERMANENTE/PREVENTIVA), duración si temporal, y base normativa. Si el examen es egreso, post-incapacidad o retorno-laboral (Res. 1843/2025 Art. 13), incluir restricciones de reintegro progresivo.
JSON REQUERIDO (sin markdown):
{"restricciones":[{"segmento":"Miembro Superior/Lumbar/Cervical/Postural/General","tipo":"TEMPORAL/PERMANENTE/PREVENTIVA","duracion":"X semanas o N/A","descripcion":"Restricción específica, operativa y cuantificable para el puesto de trabajo","normativa":"GTC-45:2012 / GATISO-DME / GATISO-TME / Res. 1843/2025 / Res. 2404/2019"}]}`;
    try {
      const text = await callAI(prompt, true);
      const parsed = parseAIJSON(text);
      const lista = (parsed.restricciones || [])
        .map(
          (r, i) =>
            `${i + 1}. [${r.tipo}${
              r.duracion && r.duracion !== "N/A" ? " - " + r.duracion : ""
            }] (${r.segmento}) ${r.descripcion} -- ${r.normativa}`
        )
        .join("\n");
      setData((prev) => ({ ...prev, analisisRestricciones: lista }));
      showAlert(
        "✅ Restricciones generadas por IA. Seleccione las adicionales en el checklist."
      );
    } catch (e) {
      showAlert(`Error IA Restricciones: ${e.message}`);
    } finally {
      setIsGeneratingRestr(false);
    }
  };
  // ── GENERACIÓN IA SOLO RECOMENDACIONES ───────────────────────────────────
  const generateAIRecomendaciones = async () => {
    setIsGeneratingReco(true);
    const prompt = `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia. Genera recomendaciones médico-laborales y de promoción de la salud ESPECÍFICAS para el trabajador evaluado. No uses recomendaciones genéricas. Responde en texto plano numerado, sin JSON, en español formal y directo.
DATOS: Cargo: ${data.cargo} | Empresa: ${
      data.empresaNombre
    } | Actividad económica: ${data.actividadEconomica || "N/E"}
Riesgos laborales identificados: ${
      Object.entries(data.riesgos || {})
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ") || "N/R"
    }
IMC: ${data.imc} | TA: ${data.ta} | Tabaquismo: ${
      data.habitos?.fuma
    } | Alcohol: ${data.habitos?.alcohol} | Actividad física: ${
      data.habitos?.deporte
    }
Diagnóstico principal: ${data.diagnosticoPrincipal}
Tipo de examen: ${data.tipoExamen}
INSTRUCCIÓN: Genera mínimo 12 recomendaciones numeradas diferenciando: (A) Recomendaciones médicas y de estilo de vida (B) Recomendaciones ergonómicas específicas para el cargo (C) Recomendaciones de vigilancia epidemiológica y seguimiento (D) Recomendaciones al empleador conforme Res. 1843/2025 y Dec. 1072/2015. Lenguaje técnico-médico, formal, directo y puntual.`;
    try {
      const text = await callAI(prompt, false);
      setData((prev) => ({ ...prev, recomendaciones: text.trim() }));
      showAlert("✅ Recomendaciones generadas por IA.");
    } catch (e) {
      showAlert(`Error IA Recomendaciones: ${e.message}`);
    } finally {
      setIsGeneratingReco(false);
    }
  };
  // ── GENERACIÓN IA MEDICINA GENERAL ───────────────────────────────────────
  const generateAIGeneral = async () => {
    if (!_canUse("ia_analisis", currentUser)) {
      showAlert(
        "🔒 El análisis IA está disponible en el plan ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes para actualizar."
      );
      return;
    }
    if (!data.motivoConsulta) {
      showAlert("Ingrese el motivo de consulta para usar IA.");
      return;
    }
    setIsGenerating(true);
    const prompt = `Eres médico general con más de 15 años de experiencia clínica en Colombia, especializado en medicina ambulatoria, patología crónica y aguda. Analiza la consulta médica del paciente con criterio clínico sólido y elabora el plan de manejo completo. Devuelve ÚNICAMENTE JSON.
DATOS DEL PACIENTE: ${data.nombres} | Edad: ${data.edad}a | Género: ${
      data.genero
    }
Motivo de consulta: ${data.motivoConsulta}
Enfermedad actual: ${data.enfermedadActual || "No detallada"}
Antecedentes: ${JSON.stringify(data.antecedentes || {})}
Examen físico: TA ${data.examenFisico?.ta || "N/R"} | FC ${
      data.examenFisico?.fc || "N/R"
    } | Temp ${data.examenFisico?.temp || "N/R"} | IMC ${
      data.examenFisico?.imc || "N/R"
    }
Hallazgos físicos: ${data.examenFisico?.hallazgos || "Ninguno referido"}
Revisión por sistemas: ${JSON.stringify(data.revisionSistemas || {})}
INSTRUCCIÓN: El análisis clínico debe ser razonado, con diagnóstico diferencial implícito. La conducta debe ser específica para este paciente. Los medicamentos deben incluir principio activo, presentación, dosis, frecuencia y duración. Las remisiones deben justificarse clínicamente. El control debe ser en tiempo específico. Lenguaje técnico-médico formal y directo.
JSON REQUERIDO (sin markdown, sin texto adicional):
{"diagnosticos":[{"cie10":"CIE-10","descripcion":"Nombre diagnóstico completo","tipo":"Principal/Secundario/Presuntivo"}],"plan":{"conducta":"Conducta médica detallada y razonada","medicamentos":"Resumen breve del plan farmacológico","formulaMedicamentos":[{"nombre":"Nombre genérico (principio activo)","presentacion":"Forma farmacéutica y concentración - ej: Tableta 500mg","dosis":"Cantidad por toma - ej: 1 tableta","frecuencia":"Intervalo - ej: cada 8 horas","duracion":"Ej: 7 días","indicaciones":"Indicación especial o cadena vacía"}],"paraclinicosSolicitados":"Paraclínicos con justificación clínica","remisiones":"Remisiones a especialista justificadas clínicamente o 'No aplica'","recomendaciones":"Recomendaciones específicas al paciente: dieta, actividad, signos de alarma, medidas no farmacológicas","controlEn":"Control en X días/semanas con criterios específicos"},"analisis":"Razonamiento clínico del caso en 4-5 líneas: hipótesis diagnóstica, correlación clínica y justificación del plan"}`;
    try {
      const text = await callAI(prompt, true);
      const parsed = parseAIJSON(text);
      setData((prev) => ({
        ...prev,
        diagnosticos: parsed.diagnosticos?.length
          ? parsed.diagnosticos
          : prev.diagnosticos,
        plan: { ...prev.plan, ...parsed.plan },
        formulaMedicamentos: parsed.plan?.formulaMedicamentos?.length
          ? parsed.plan.formulaMedicamentos.map((m, i) => ({
              ...m,
              id: Date.now() + i,
            }))
          : parsed.formulaMedicamentos?.length
          ? parsed.formulaMedicamentos.map((m, i) => ({
              ...m,
              id: Date.now() + i,
            }))
          : prev.formulaMedicamentos,
        enfermedadActual:
          prev.enfermedadActual ||
          (parsed.analisis
            ? `ANÁLISIS IA: ${parsed.analisis}`
            : prev.enfermedadActual),
      }));
      showAlert("✅ Análisis IA completado para consulta general.");
    } catch (e) {
      showAlert(`Error IA: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  // ── GENERACIÓN REPORTE IA ─────────────────────────────────────────────────
  const generateAIReport = async (stats, total, companyName) => {
    if (!_canUse("ia_reporte", currentUser)) {
      showAlert(
        "🔒 Los reportes IA están disponibles en el plan ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes para actualizar."
      );
      return;
    }
    setIsGeneratingReport(true);
    const fmtDist = (obj) =>
      Object.entries(obj || {})
        .sort(([, a], [, b]) => b - a)
        .map(([k, v]) => `${k}:${v}(${((v / total) * 100).toFixed(1)}%)`)
        .join(" | ");
    const datosBase = [
      `Empresa: "${companyName}" | Trabajadores: ${total}`,
      `SOCIODEM: Género: ${fmtDist(stats.genero)} | Edad: ${fmtDist(
        stats.edad
      )} | Escolaridad: ${fmtDist(stats.escolaridad)} | E.civil: ${fmtDist(
        stats.estadoCivil
      )} | Estrato: ${fmtDist(stats.estrato)}`,
      `OCUPACIONAL: Cargos: ${fmtDist(stats.cargo)} | Contrato: ${fmtDist(
        stats.tipoContrato
      )} | Turno: ${fmtDist(stats.turnoTrabajo)} | Antigüedad: ${fmtDist(
        stats.antiguedad
      )} | Tipo examen: ${fmtDist(stats.tipoExamen)}`,
      `CLÍNICO: IMC: ${fmtDist(stats.imc)} | TA: ${fmtDist(
        stats.ta
      )} | Diagnósticos: ${fmtDist(stats.diagnosticos)} | Aptitud: ${fmtDist(
        stats.conceptoAptitud
      )} | Hallazgos: ${fmtDist(stats.hallazgos)}`,
      `ANTECEDENTES: Cardio ${stats.antecCardio || 0} | Resp ${
        stats.antecResp || 0
      } | Osteo ${stats.antecOsteo || 0} | Neuro ${
        stats.antecNeuro || 0
      } | Metab ${stats.antecMetab || 0} | Qx ${stats.antecQuirurg || 0}`,
      `REV SISTEMAS: Cardio ${stats.revCardio || 0} | Resp ${
        stats.revResp || 0
      } | Osteo ${stats.revOsteo || 0} | Neuro ${stats.revNeuro || 0} | GI ${
        stats.revGastro || 0
      }`,
      `RIESGOS: ${fmtDist(stats.riesgos)} | Tabaco ${
        stats.fumadores || 0
      } | Alcohol ${stats.alcohol || 0} | Deporte ${stats.deporte || 0}`,
    ].join("\n");
    // LLAMADA 1 - campos cortos: resumen, PVE, tabla, normativa
    const prompt1 =
      "Médico especialista Medicina del Trabajo Colombia. Datos:\n" +
      datosBase +
      "\n\nDevuelve ÚNICAMENTE JSON sin markdown con 4 claves exactas:" +
      '{"resumenEjecutivo":"4 líneas gerencia: hallazgos críticos, morbilidad, aptitud, acciones. Max 400 chars.",' +
      '"pveRecomendados":["PVE Osteomuscular - Res.2404/2019","PVE Cardiovascular - Res.2404/2019","PVE Psicosocial - Res.2404/2019","PVE Auditivo - Res.2400/1979","PVE Visual - Res.2400/1979"],' +
      '"tabla":[{"diagnostico":"CIE-10 descripción","cantidad":0,"porcentaje":"0%","relacion":"probable/posible/no relacionado"}],' +
      '"matrizLegalNormativa":"Res.1843/2025, Dec.1072/2015, Res.0312/2019, Ley 1562/2012, Res.2404/2019 - cumplimiento verificado."}';
    // LLAMADA 2 - solo conclusiones (campo largo independiente)
    const prompt2 =
      "Médico especialista Medicina del Trabajo Colombia (Res.1843/2025, Dec.1072/2015, GTC-45:2012). Datos:\n" +
      datosBase +
      "\n\nElabora informe técnico con 8 secciones (máx 100 palabras/sección):" +
      "1.Perfil sociodemográfico 2.Perfil ocupacional 3.Morbilidad prevalente CIE-10 4.Hallazgos clínicos críticos 5.Antecedentes y revisión sistemas 6.Riesgos laborales GTC-45 7.Estilos de vida 8.PVE y conclusión." +
      '\n\nDevuelve ÚNICAMENTE JSON: {"conclusiones":"texto sección 1\\n\\ntexto sección 2\\n\\n..."}';
    try {
      const [text1, text2] = await Promise.all([
        callAI(prompt1, true),
        callAI(prompt2, true),
      ]);
      const parte1 = parseAIJSON(text1);
      const parte2 = parseAIJSON(text2);
      setReportAIResult({ ...parte1, conclusiones: parte2.conclusiones || "" });
    } catch (e) {
      showAlert(`⚠️ Error IA Reporte: ${e.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  // ── HANDLERS GENERALES ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (view === "historia") _setHcDirty(true);
  };
  // ── GUARDADO MANUAL EN NUBE CON REPORTE ─────────────────────────────────
  const handleManualCloudSave = async () => {
    setSyncStatus("syncing");
    const ts = new Date().toISOString();
    const currentKeys = sps("siso_ai_keys", aiConfig.keys || {});
    const keysGuardadas = Object.entries(currentKeys)
      .filter(([, v]) => v && v.length > 8)
      .map(([k]) => k);
    const tasks = {
      [`Pacientes / HC (${currentUser?.user})`]: _sbSet(
        _patKeyCloud(currentUser?.user || "shared"),
        patientsList
      ),
      Empresas: _sbSet(_compKeyCloud(currentUser?.user || "shared"), companies),
      "Usuarios y perfiles": _sbSet("siso_users", usersList),
      "Facturas / Cuentas de cobro": _sbSet("siso_saved_bills", savedBillsList),
      "Informes guardados": _sbSet("siso_saved_reports", savedReports),
      "Log de auditoría": _sbSet("siso_audit_log", auditLog),
      "Configuración IA (proveedor)": _sbSet("siso_ai_config_provider", {
        activeProvider: aiConfig.activeProvider,
      }),
      ...(doctorSignature
        ? { "Firma digital": _sbSet("siso_doctor_signature", doctorSignature) }
        : {}),
      ...(currentUser?.user && keysGuardadas.length
        ? {
            [`API Keys (${keysGuardadas.join(", ")})`]: _sbSet(
              `siso_ai_keys_${currentUser.user}`,
              currentKeys
            ),
          }
        : {}),
    };
    const results = {};
    for (const [label, promise] of Object.entries(tasks)) {
      try {
        results[label] = await promise;
      } catch {
        results[label] = false;
      }
    }
    await _sbQueue.flush();
    const allOk = Object.values(results).every(Boolean);
    setSyncStatus(allOk ? "ok" : "error");
    setSyncReport({
      ts,
      results,
      summary: {
        pacientes: patientsList.length,
        empresas: companies.length,
        usuarios: usersList.length,
        facturas: savedBillsList.length,
        informes: savedReports.length,
        auditLog: auditLog.length,
        firma: !!doctorSignature,
        apiKeys: keysGuardadas,
      },
    });
    setShowSyncReport(true);
  };
  const handleSaveAIConfig = (cfg) => {
    setAiConfig(cfg);
    // Keys en sessionStorage (seguridad) + Supabase (persistencia por usuario)
    const keysJson = JSON.stringify(cfg.keys || {});
    _ss.setItem("siso_ai_keys", keysJson);
    _sync(
      "siso_ai_config_provider",
      JSON.stringify({ activeProvider: cfg.activeProvider })
    );
    // Guardar keys en Supabase bajo clave específica del usuario
    const userKey = `siso_ai_keys_${currentUser?.user || "default"}`;
    _sbSet(userKey, cfg.keys || {}).then(() => {});
    // También guardar en localStorage para fallback offline
    _ls.setItem("siso_ai_config_version", "v3");
    showAlert("✅ Configuración de IA guardada en la nube.");
  };
  
  const handleLogin = (u, p) => {
      // SEC: Rate limiting - verificar bloqueo
      if (_rl.isBlocked()) {
        showAlert(`⛔ Demasiados intentos fallidos. Intente de nuevo en ${_rl.getRemainingMin()} minuto(s).`);
        return;
      }
  
    
  // ============================================================
      // FIX C-01: SOLO comparar contra passHash (SHA-256) - eliminado fallback texto plano
      _sha256(p).then(async (hash) => {
        // Migración automática: si el usuario tiene .pass en texto plano (versión anterior),
        // se migra a passHash en este momento sin exponer el texto plano
        const migratedList = usersList.map((usr) => {
          if (!usr.passHash && usr.pass) {
            // Programar migración asíncrona
            _sha256(usr.pass).then((h) => {
              const updated = usersList.map((x) =>
                x.id === usr.id ? { ...x, passHash: h, pass: undefined } : x
              );
              _sync("siso_users", JSON.stringify(updated));
            });
          }
          return usr;
        });
        // SEC-09: verificar con PBKDF2 (salt) o SHA-256 legacy (sin salt)
        let found = null;
        for (const x of migratedList) {
          if (x.user === u) {
            const ok = await _verifyPassword(p, x.passHash, x.passSalt);
            if (ok) {
              found = x;
              break;
            }
          }
        }
                  // CAMBIO 7 - SEC: Fallback a Supabase si usuario no hallado en lista local
                            // Resuelve el caso de nuevo dispositivo / caché borrado / contraseña cambiada
                                      if (!found) {
                                                    const cloudData = await _sbGetAll();
                                                                if (cloudData?.["siso_users"]?.value && Array.isArray(cloudData["siso_users"].value)) {
                                                                                const cloudUserList = cloudData["siso_users"].value;
                                                                                              // Sincronizar lista local con datos de Supabase
                                                                                                            setUsersList(prev => {
                                                                                                                              const merged = [...prev];
                                                                                                                                              cloudUserList.forEach(cu => {
                                                                                                                                                                  if (!merged.find(m => m.user === cu.user)) merged.push(cu);
                                                                                                                                                                                  });
                                                                                                                                                                                                  _ls.setItem("siso_users", JSON.stringify(merged));
                                                                                                                                                                                                                  return merged;
                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                              // Re-verificar credenciales contra lista de Supabase
                                                                                                                                                                                                                                                            for (const x of cloudUserList) {
                                                                                                                                                                                                                                                                              if (x.user === u) {
                                                                                                                                                                                                                                                                                                  const ok = await _verifyPassword(p, x.passHash, x.passSalt);
                                                                                                                                                                                                                                                                                                                    if (ok) { found = x; break; }
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                                                                                                        }
        if (found && found.activo === false) {
          showAlert(
            "⛔ Esta cuenta está desactivada. Contacte al administrador."
          );
          return;
        }
        if (found) {
          // B-18: Si el usuario tiene 2FA activo, pausar y pedir token
          if (found.twoFA?.enabled && found.twoFA?.secret) {
            setTwoFAStep({ foundUser: found });
            setTwoFAToken("");
            setTwoFAError("");
            return;
          }
          // ══ B-05: Resetear contador de intentos fallidos en login exitoso ══
          setLoginAttempts(0);
          _ls.removeItem("siso_login_attempts");
          _ls.removeItem("siso_login_blocked_until");
          // CIBERSEGURIDAD: Agregar sesionId único al usuario (trazabilidad RDA Res. 1888/2025)
          const sesId =
            "SES-" +
            Date.now().toString(36).toUpperCase() +
            "-" +
            Math.random().toString(36).substr(2, 6).toUpperCase();
          // FASE 2: Asegurar que el usuario tiene orgId (migración automática de datos existentes)
          const foundConOrg = found.orgId
            ? found
            : { ...found, orgId: ORG_DEFAULT_ID };
          const foundConSesion = { ...foundConOrg, sesionId: sesId };
          setCurrentUser(foundConSesion);
          // CIBERSEGURIDAD: Activar timer de sesión 30 min (Punto 4 - Supabase/sesión segura)
          _resetSessionTimer(() => {
            setCurrentUser(null);
            setView("login");
            _ls.removeItem("siso_session");
          });
          const entrada = {
            id: Date.now(),
            fecha: new Date().toISOString(),
            usuario: found.user,
            nombreUsuario: found.name,
            rol: found.role,
            sesionId: sesId,
            accion: "Login",
            pacienteId: null,
            tipo: "Autenticación",
            userAgent:
              typeof navigator !== "undefined"
                ? navigator.userAgent?.substring(0, 120)
                : "N/A",
          };
          setAuditLog((prev) => {
            const n = [entrada, ...prev].slice(0, 500);
            setTimeout(() => _sync("siso_audit_log", JSON.stringify(n)), 0);
            return n;
          });
          // Al hacer login: cargar pacientes del médico específico (aislamiento)
          // ── IPS: si el usuario tiene empresaId, usar storage compartido de empresa ──
          const _storageUserId = found.empresaId
            ? "empresa_" + found.empresaId
            : found.user;
          const userPatKey = _patKey(_storageUserId);
          const userPatKeyCloud = _patKeyCloud(_storageUserId);
          const localPats = sp(userPatKey, []);
          // IPS: migración — si el usuario tenía datos personales, copiarlos al bucket empresa
          if (found.empresaId) {
            const personalPats = sp(_patKey(found.user), []);
            if (personalPats.length > 0 && localPats.length === 0) {
              // Primera vez con empresaId: migrar datos personales al bucket empresa
              _ls.setItem(userPatKey, JSON.stringify(personalPats));
              setPatientsList(personalPats);
            } else if (personalPats.length > 0 && localPats.length > 0) {
              // Merge: agregar pacientes personales que no estén en el bucket empresa
              const existingIds = new Set(localPats.map((p) => p.id));
              const nuevos = personalPats.filter((p) => !existingIds.has(p.id));
              if (nuevos.length > 0) {
                const merged = [...localPats, ...nuevos];
                _ls.setItem(userPatKey, JSON.stringify(merged));
                setPatientsList(merged);
              } else {
                setPatientsList(localPats);
              }
            } else {
              setPatientsList(localPats);
            }
          } else {
            setPatientsList(localPats); // inmediato desde local
          }
          _ls.setItem("siso_active_form", ""); // limpiar borrador del usuario anterior
          // Cargar desde Supabase: pacientes propios, empresas propias + API keys
          const userCompKey = _compKey(_storageUserId);
          const userCompKeyCloud = _compKeyCloud(_storageUserId);
          let localComps = sp(userCompKey, []);
          // ── IPS: si empresa user no tiene companies, copiar del admin de la org ──
          if (found.empresaId && localComps.length === 0) {
            // Buscar companies en el storage del admin de la org
            const allUsers = JSON.parse(_ls.getItem("siso_users") || "[]");
            const orgAdmins = allUsers.filter(
              (u) =>
                u.orgId === found.orgId &&
                (_isAdmin(u.role) || u.role === "super_admin")
            );
            for (const adm of orgAdmins) {
              const admComps = sp(_compKey(adm.user), []);
              if (admComps.length > 0) {
                // Copiar la empresa específica + "PARTICULAR" si existe
                const miEmpresa = admComps.filter(
                  (c) => c.id === found.empresaId
                );
                if (miEmpresa.length > 0) {
                  localComps = miEmpresa;
                  _ls.setItem(userCompKey, JSON.stringify(localComps));
                  break;
                }
              }
            }
          }
          setCompanies(localComps);
          // ── PASO 6: cargar caja, agenda, atenciones y facturas aislados por empresa ──
          _loadScoped = (scopedKey, globalKey) => {
            const s = sp(scopedKey, null);
            if (s !== null) return s;
            // Migración: si hay datos en clave global, copiar a clave propia
            const g = sp(globalKey, []);
            if (g.length > 0) {
              try {
                _ls.setItem(scopedKey, JSON.stringify(g));
              } catch {}
            }
            return g;
          };
          setCajaMovimientos(
            _loadScoped(`siso_caja_${_storageUserId}`, "siso_caja")
          );
          setAgendados(
            _loadScoped(`siso_agendados_${_storageUserId}`, "siso_agendados")
          );
          setAtencionesCerradas(
            _loadScoped(
              `siso_atenciones_${_storageUserId}`,
              "siso_atenciones_cerradas"
            )
          );
          setSavedBillsList(
            _loadScoped(`siso_saved_bills_${_storageUserId}`, "siso_saved_bills")
          );
          _sbGetAll().then((cloud) => {
            // Pacientes del usuario específico (o empresa compartida)
            const cloudPats = cloud?.[userPatKeyCloud]?.value;
            const currentLocalPats = sp(userPatKey, []);
            if (
              Array.isArray(cloudPats) &&
              cloudPats.length >= currentLocalPats.length
            ) {
              setPatientsList(cloudPats);
              _ls.setItem(userPatKey, JSON.stringify(cloudPats));
            }
            // Empresas del usuario específico (o empresa compartida)
            const cloudComps = cloud?.[userCompKeyCloud]?.value;
            if (
              Array.isArray(cloudComps) &&
              cloudComps.length >= localComps.length
            ) {
              setCompanies(cloudComps);
              _ls.setItem(userCompKey, JSON.stringify(cloudComps));
            } else if (localComps.length === 0) {
              // Si no hay empresas propias, verificar clave legacy compartida
              const legacyComps = cloud?.["siso_companies"]?.value;
              if (Array.isArray(legacyComps) && legacyComps.length > 0) {
                const mine = legacyComps.filter(
                  (co) => co._userId === found.user || !co._userId
                );
                if (mine.length > 0) {
                  setCompanies(mine);
                  _ls.setItem(userCompKey, JSON.stringify(mine));
                  // Migrar automáticamente a clave propia
                  _sbSet(userCompKeyCloud, mine);
                }
              }
            }
            // API keys del usuario
            const aiKeyCloud = cloud?.[`siso_ai_keys_${found.user}`]?.value;
            if (aiKeyCloud) {
              _ss.setItem("siso_ai_keys", JSON.stringify(aiKeyCloud));
              setAiConfig((prev) => ({ ...prev, keys: aiKeyCloud }));
            }
          });
          // ══ B-07: Si primer login, forzar cambio de contraseña ══
          setTimeout(() => { if (foundConSesion.mustChangePassword) {
            goTo("changePassword");
          } else {
            goTo("dashboard");
          }
                                  }, 80);
        } else {
          // ══ B-05: Rate limiting mejorado - 15 min, persistente, con audit log ══
          setLoginAttempts((prev) => {
            const next = prev + 1;
            _ls.setItem("siso_login_attempts", String(next));
            if (next >= 5) {
              const blockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutos (OWASP rec.)
              setLoginBlockedUntil(blockedUntil);
              _ls.setItem("siso_login_blocked_until", String(blockedUntil));
              // Registrar en audit log como evento de seguridad
              const alertaSeguridad = {
                id: Date.now(),
                fecha: new Date().toISOString(),
                usuario: u,
                tipo: "ALERTA_SEGURIDAD",
                descripcion: `Login bloqueado tras 5 intentos fallidos para usuario: ${u}`,
                ip: "cliente-web",
              };
              setAuditLog((prev2) => {
                const n = [alertaSeguridad, ...prev2].slice(0, 500);
                setTimeout(() => _sync("siso_audit_log", JSON.stringify(n)), 0);
                return n;
              });
              showAlert(
                "🔒 Acceso bloqueado por 15 minutos debido a múltiples intentos fallidos.\nSi olvidó su contraseña, contacte al administrador del sistema."
              );
            } else {
              showAlert(
                `⚠️ Credenciales incorrectas. Intentos fallidos: ${next}/5. Tras 5 intentos se bloqueará el acceso por 15 minutos.`
              );
            }
            return next;
          });
        }
      });
    };
  // B-18: Verificar token TOTP
  const handleVerify2FA = async () => {
    if (!twoFAStep) return;
    const { foundUser } = twoFAStep;
    const ok = await _totpVerify(foundUser.twoFA.secret, twoFAToken.trim());
    if (!ok) {
      setTwoFAError(
        "❌ Código incorrecto. Verifique su app autenticadora e intente de nuevo."
      );
      setTwoFAToken("");
      return;
    }
    // Código correcto - continuar con el flujo normal de login
    setTwoFAStep(null);
    setTwoFAError("");
    setLoginAttempts(0);
    _ls.removeItem("siso_login_attempts");
    _ls.removeItem("siso_login_blocked_until");
    const sesId =
      "SES-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).substr(2, 6).toUpperCase();
    const foundConSesion = { ...foundUser, sesionId: sesId };
    setCurrentUser(foundConSesion);
    _resetSessionTimer(() => {
      setCurrentUser(null);
      setView("login");
      _ls.removeItem("siso_session");
    });
    const entrada = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      usuario: foundUser.user,
      nombreUsuario: foundUser.name,
      rol: foundUser.role,
      accion: "LOGIN_2FA_OK",
      sesionId: sesId,
    };
    setAuditLog((prev) => {
      const n = [entrada, ...prev].slice(0, 500);
      setTimeout(() => _sync("siso_audit_log", JSON.stringify(n)), 100);
      return n;
    });
    const userPatKey = _patKey(foundUser.user);
    const localPats = sp(userPatKey, []);
    setPatientsList(localPats);
    _ls.setItem("siso_active_form", "");
    const userCompKey = _compKey(foundUser.user);
    setCompanies(sp(userCompKey, []));
    if (foundUser.mustChangePassword) {
      goTo("changePassword");
    } else {
      goTo("dashboard");
    }
  };
  // ── Guard: visibilidad de HC según rol y org (FASE 2) ───────────────────
  const canViewPatient = (p) => {
    if (!p) return false;
    if (!currentUser) return false;
    // FASE 2: super_admin ve TODOS los pacientes de todas las orgs
    if (currentUser.role === "super_admin") return true;
    // FASE 2: aislamiento multi-org — si el paciente tiene _orgId de otra org: denegar
    const myOrgId = currentUser.orgId || ORG_DEFAULT_ID;
    if (p._orgId && p._orgId !== myOrgId) return false;
    if (_isAdmin(currentUser.role)) return true;
    // ── IPS: admin_empresa ve TODOS los pacientes de su empresa ──
    if (currentUser.role === "admin_empresa") {
      if (!currentUser.empresaId) return false;
      const empA = companies.find((c) => c.id === currentUser.empresaId);
      return (
        p.empresaId === currentUser.empresaId ||
        (empA && p.empresaNit === empA.nit)
      );
    }
    if (currentUser.role === "medico") {
      // IPS: médico vinculado a empresa → ve TODOS los pacientes de la empresa (cross-read)
      if (currentUser.empresaId) {
        const emp = companies.find((c) => c.id === currentUser.empresaId);
        return (
          p.empresaId === currentUser.empresaId ||
          (emp && p.empresaNit === emp.nit)
        );
      }
      // Médico sin empresa: ve todos los pacientes de la org (con lectura cruzada)
      if (!p._medicoId) return true; // paciente sin asignar
      if (p._medicoId === currentUser.user) return true;
      // Otro médico de la misma org: acceso en modo lectura ✅ (Fase 2 req.)
      return true;
    }
    if (currentUser.role === "secretaria") {
      if (!_secretariaPuede("pacientes_lista", currentUser, usersList))
        return false;
      return _secretariaMedicoAsignado(
        currentUser,
        p._medicoId || "",
        usersList
      );
    }
    return false;
  };
  // FASE 2: ¿el médico actual es el autor de esta HC? (controla edición vs lectura)
  const isHcOwner = (p) => {
    if (!p || !currentUser) return false;
    if (currentUser.role === "super_admin") return true;
    if (_isAdmin(currentUser.role)) return true;
    return !p._medicoId || p._medicoId === currentUser.user;
  };
  const openPatient = (p) => {
    if (!canViewPatient(p)) {
      showAlert(
        "⛔ No tiene permiso para ver esta historia clínica.\nSolo puede acceder a historias creadas por usted."
      );
      return;
    }
    setData(p);
    setDataType(p.type || "ocupacional");
    setActiveTab(p.type === "general" ? "formGeneral" : "form");
    _setHcDirty(false);
    setView("historia");
  };
  const handleNewOccupHistory = () => {
    if (currentUser?.role === "secretaria") {
      if (!_secretariaPuede("pacientes_crear", currentUser, usersList)) {
        showAlert(
          "⛔ No tiene permiso para crear pacientes. Solicite acceso al administrador."
        );
        return;
      }
    }
    // ── PLAN GATE: verificar límite de HC (super_admin, admin y admin_empresa exentos) ──
    if (!_isAdminOrEmpresa(currentUser?.role)) {
      const plan = PLAN_CONFIG[currentUser?.license || "libre"];
      const usadas = _contarHC(patientsList, currentUser?.user);
      if (usadas >= plan.maxHC) {
        showAlert(
          `🔒 Plan ${plan.label}: límite de ${plan.maxHC} historias clínicas alcanzado.\n\nActualiza tu plan para continuar creando HC.\nMenú → ⭐ Ver Planes`
        );
        return;
      }
    }
    const newId = Date.now().toString();
    const folioNum =
      "HC-" +
      new Date().getFullYear() +
      "-" +
      String(
        patientsList.filter((p) => p.fechaExamen && !p._archivado).length + 1
      ).padStart(4, "0");
    // FASE 2: org_id se asigna automáticamente al crear HC
    const myOrgId = currentUser?.orgId || ORG_DEFAULT_ID;
    // FASE 2: Médico de turno — si admin/secretaria crea HC, proponer turno activo
    const medicoDefault =
      _isAdmin(currentUser?.role) || currentUser?.role === "secretaria"
        ? medicoTurnoActivo || currentUser?.user
        : currentUser?.user;
    // ── IPS: auto-tag empresa si el usuario pertenece a una empresa ──
    const _empresaAutoTag = {};
    if (currentUser?.empresaId) {
      const _empAT = companies.find((c) => c.id === currentUser.empresaId);
      _empresaAutoTag.empresaId = currentUser.empresaId;
      if (_empAT) {
        _empresaAutoTag.empresaNombre = _empAT.nombre || "";
        _empresaAutoTag.empresaNit = _empAT.nit || "";
      }
    }
    setData({
      ...initialOccupPatientState,
      id: newId,
      _medicoId: medicoDefault,
      _orgId: myOrgId,
      folioHC: folioNum,
      ..._empresaAutoTag,
    });
    setDataType("ocupacional");
    setHistoryNotification(null);
    setActiveTab("form");
    _setHcDirty(false);
    goTo("historia");
    logAccess("Apertura", newId, "ocupacional"); // AUDIT: Res. 1888/2025 RDA
  };
  const handleNewGeneralHistory = () => {
    if (currentUser?.role === "secretaria") {
      if (!_secretariaPuede("pacientes_crear", currentUser, usersList)) {
        showAlert(
          "⛔ No tiene permiso para crear pacientes. Solicite acceso al administrador."
        );
        return;
      }
    }
    // ── PLAN GATE: verificar límite de HC (super_admin, admin y admin_empresa exentos) ──
    if (!_isAdminOrEmpresa(currentUser?.role)) {
      const plan = PLAN_CONFIG[currentUser?.license || "libre"];
      const usadas = _contarHC(patientsList, currentUser?.user);
      if (usadas >= plan.maxHC) {
        showAlert(
          `🔒 Plan ${plan.label}: límite de ${plan.maxHC} historias clínicas alcanzado.\n\nActualiza tu plan para continuar creando HC.\nMenú → ⭐ Ver Planes`
        );
        return;
      }
    }
    const newId = Date.now().toString();
    const myOrgId = currentUser?.orgId || ORG_DEFAULT_ID;
    const medicoDefault2 =
      _isAdmin(currentUser?.role) || currentUser?.role === "secretaria"
        ? medicoTurnoActivo || currentUser?.user
        : currentUser?.user;
    // ── IPS: auto-tag empresa para HC general ──
    const _empresaAutoTag2 = {};
    if (currentUser?.empresaId) {
      const _empAT2 = companies.find((c) => c.id === currentUser.empresaId);
      _empresaAutoTag2.empresaId = currentUser.empresaId;
      if (_empAT2) {
        _empresaAutoTag2.empresaNombre = _empAT2.nombre || "";
        _empresaAutoTag2.empresaNit = _empAT2.nit || "";
      }
    }
    setData({
      ...initialGeneralPatientState,
      id: newId,
      _medicoId: medicoDefault2,
      _orgId: myOrgId,
      ..._empresaAutoTag2,
    });
    setDataType("general");
    setActiveTab("formGeneral");
    _setHcDirty(false);
    goTo("historia");
    logAccess("Apertura", newId, "general"); // AUDIT: Res. 1888/2025 RDA
  };
  // Guardar pacientes bajo la clave del usuario activo (aislamiento por médico)
  // ── IPS: si el usuario tiene empresaId, usar storage compartido de empresa ──
  const _syncPatients = (list) => {
    const _suid = currentUser?.empresaId
      ? "empresa_" + currentUser.empresaId
      : currentUser?.user || "shared";
    const key = _patKey(_suid);
    const cloudKey = _patKeyCloud(_suid);
    _ls.setItem(key, JSON.stringify(list));
    setTimeout(() => {
      if (_syncStatusCallback) _syncStatusCallback("syncing");
    }, 0);
    _sbSet(cloudKey, list).then((ok) => {
      if (!ok) _sbQueue.pending[cloudKey] = list;
      setTimeout(() => {
        if (_syncStatusCallback) _syncStatusCallback(ok ? "ok" : "error");
      }, 0);
    });
  };
  const _syncCompanies = (list) => {
    const _suid2 = currentUser?.empresaId
      ? "empresa_" + currentUser.empresaId
      : currentUser?.user || "shared";
    const key = _compKey(_suid2);
    const cloudKey = _compKeyCloud(_suid2);
    _ls.setItem(key, JSON.stringify(list));
    _sbSet(cloudKey, list).then((ok) => {
      if (!ok) _sbQueue.pending[cloudKey] = list;
    });
  };
  // NORMATIVO: Res. 1843/2025 Art. 9 y 13 - Verificar alertas de evaluación obligatoria
  const checkAlertasObligatorias = (d) => {
    const alertas = [];
    // ══ B-10 Res. 1843/2025 Art. 4 - Periodicidad máxima 3 años ══
    // Validación de periodicidad vencida (>3 años sin evaluación) se maneja en CardPaciente con badge
    if (
      d.diasIncapacidad &&
      parseInt(d.diasIncapacidad) >= 30 &&
      d.tipoExamen !== "POST-INCAPACIDAD"
    ) {
      alertas.push(
        "⚠️ ALERTA Res. 1843/2025 Art. 9: Trabajador con ≥30 días de incapacidad - se requiere evaluación POST-INCAPACIDAD obligatoria."
      );
    }
    if (
      d.diasAusenciaNoMedica &&
      parseInt(d.diasAusenciaNoMedica) > 90 &&
      d.tipoExamen !== "RETORNO-LABORAL"
    ) {
      alertas.push(
        "⚠️ ALERTA Res. 1843/2025 Art. 13: Ausencia >90 días (no médica) - se requiere evaluación de RETORNO LABORAL obligatoria."
      );
    }
    return alertas;
  };
  const handleSavePatient = () => {
    // Verificar alertas normativas antes de guardar
    const alertasObl = checkAlertasObligatorias(data);
    if (alertasObl.length > 0) {
      showAlert(alertasObl.join("\n\n"));
    }
    const toSave = {
      ...data,
      _medicoId: currentUser?.user,
      fechaExamen: data.fechaExamen || new Date().toISOString().split("T")[0],
    };
    const list = [...patientsList];
    const idx = list.findIndex((p) => p.id === toSave.id);
    if (idx >= 0) list[idx] = toSave;
    else list.push(toSave);
    setPatientsList(list);
    _syncPatients(list);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(""), 2500);
    _setHcDirty(false);
    logAccess("Guardado", toSave.id, dataType); // AUDIT: Res. 1888/2025 RDA
  };
  const handleCloseHistory = () => {
    if (!data.conceptoAptitud && dataType === "ocupacional") {
      showAlert("Debe generar el concepto de aptitud antes de cerrar.");
      return;
    }
    // NORMATIVO: Res. 1843/2025 - aviso no-bloqueante de vigencia
    if (dataType === "ocupacional" && !data.vigencia) {
      showAlert(
        "⚠️ Recuerde registrar la vigencia del concepto de aptitud (Res. 1843/2025). Puede editar la HC para añadirla."
      );
    }
    showConfirm(
      "¿Cerrar la historia clínica? No podrá editarla sin código de auditoría.",
      async () => {
        // NORMATIVO: Ley 527/1999 - Firma electrónica con hash SHA-256 para integridad del documento
        const hashHC = await _generarHashHC(data);
        const fechaFirma = new Date().toISOString();
        const baseCode =
          data.codigoVerificacion ||
          "CV-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const codigoQR = _generarCodigoQR(
          data.id || baseCode,
          hashHC,
          fechaFirma
        );
        const firmaDigital = {
          hash: hashHC,
          codigoQR,
          firmadoPor: currentUser?.name || currentUser?.user || "médico",
          medicoId: currentUser?.user,
          fechaFirma,
          ley: "Ley 527/1999 - Decreto 2364/2012",
          verificable: true,
        };
        const code = codigoQR; // El código de verificación ES el código QR
        const closed = {
          ...data,
          estadoHistoria: "Cerrada",
          codigoVerificacion: code,
          firmaDigital,
        };
        setData(closed);
        const list = [...patientsList];
        const idx = list.findIndex((p) => p.id === closed.id);
        if (idx >= 0) list[idx] = closed;
        else list.push(closed);
        setPatientsList(list);
        _syncPatients(list);
        // PORTAL PÚBLICO: guardar resumen en clave pública (sin RLS)
        // Política SQL necesaria: CREATE POLICY portal_public_read ON siso_store FOR SELECT USING (key LIKE 'siso_portal_%');
        const portalData = {
          // ── Identificación paciente ─────────────────────────────────────────
          nombres: closed.nombres,
          docTipo: closed.docTipo,
          docNumero: closed.docNumero,
          eps: closed.eps || "",
          edad: closed.edad || "",
          empresaNombre: closed.empresaNombre || closed.empresa || "",
          empresaNit: closed.empresaNit || "",
          arl: closed.arl || "",
          cargo: closed.cargo,
          tipoExamen: closed.tipoExamen,
          enfasisExamen: closed.enfasisExamen || "GENERAL",
          fechaExamen: closed.fechaExamen,
          vigencia: closed.vigencia || "1 año",
          conceptoAptitud: closed.conceptoAptitud,
          codigoVerificacion: code,
          estadoHistoria: "Cerrada",
          fechaCierre: new Date().toISOString().split("T")[0],
          // ── Restricciones y recomendaciones completas ───────────────────────
          restricciones:
            closed.analisisRestricciones || closed.restricciones || "",
          restriccionesChecklist: closed.restriccionesChecklist || {},
          recomendaciones: closed.recomendaciones || "",
          recomendacionesMedicas: closed.recomendacionesMedicas || "",
          recomendacionesOcupacionales:
            closed.recomendacionesOcupacionales || "",
          recomendacionesChecklist: closed.recomendacionesChecklist || {},
          diagnosticoPrincipal: closed.diagnosticoPrincipal || "",
          // ── Datos completos del médico (para generar PDF en portal) ─────────
          medicoNombre: activeDoctorData?.nombre || currentUser?.name || "",
          _doctorData: {
            nombre:
              activeDoctorData?.nombre ||
              currentUser?.name ||
              "MÉDICO OCUPACIONAL",
            titulo:
              activeDoctorData?.titulo ||
              "Médico Especialista en Salud Ocupacional",
            licencia: activeDoctorData?.licencia || "--",
            ciudad: activeDoctorData?.ciudad || "Popayán",
            email: activeDoctorData?.email || "",
            cel: activeDoctorData?.cel || "",
          },
          _firma: activeSignature || "",
        };
        _sbSet("siso_portal_" + code, portalData);
        if (closed.docNumero)
          _sbSet(
            "siso_portal_doc_" + closed.docNumero.replace(/\s/g, ""),
            portalData
          );
        // FIX: también guardar con formato alternativo para compatibilidad con códigos viejos
        if (code && !code.startsWith("CV-")) {
          _sbSet("siso_portal_CV-" + code, portalData);
        }
        // ── Auto-marcar paciente agendado como "Visto" (tiempo real) ──────────
        if (data._agendaId) {
          const horaFin = new Date().toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const updAg = agendados.map((a) =>
            a.id === data._agendaId
              ? {
                  ...a,
                  estado: "atendido",
                  horaFin,
                  vistoEn: new Date().toISOString(),
                }
              : a
          );
          setAgendados(updAg);
          // PASO 6: clave aislada
          const _hcSuf = currentUser?.empresaId
            ? "empresa_" + currentUser.empresaId
            : currentUser?.user || "shared";
          _sync(`siso_agendados_${_hcSuf}`, JSON.stringify(updAg));
          _sbSet(`siso_agendados_${_hcSuf}`, updAg);
          // ── Registrar en Atenciones Recientes ────────────────────────────────
          const agOrig = agendados.find((a) => a.id === data._agendaId);
          const nuevaAtencion = {
            id: "ac_" + Date.now(),
            agendaId: data._agendaId,
            pacienteId: closed.id,
            nombre: closed.nombres || agOrig?.nombre || "",
            docNumero: closed.docNumero || agOrig?.docNumero || "",
            empresa: closed.empresa || agOrig?.empresa || "",
            cargo: closed.cargo || agOrig?.cargo || "",
            tipo: dataType,
            tipoConsulta: agOrig?.tipoConsulta || closed.motivoConsulta || "",
            conceptoAptitud: closed.conceptoAptitud || "",
            codigoVerificacion: code,
            medicoId: closed._medicoId || agOrig?.medicoId || currentUser?.user,
            medicoNombre: agOrig?.medicoNombre || currentUser?.name || "",
            fechaAtencion: new Date().toISOString().split("T")[0],
            horaInicio: agOrig?.horaInicio || agOrig?.horaCita || "",
            horaFin,
            cerradaEn: new Date().toISOString(),
            estadoHistoria: "Cerrada",
          };
          const updAC = [nuevaAtencion, ...atencionesCerradas].slice(0, 100); // máx 100 registros
          setAtencionesCerradas(updAC);
          _sync(`siso_atenciones_${_hcSuf}`, JSON.stringify(updAC));
          _sbSet(`siso_atenciones_${_hcSuf}`, updAC);
        }
        // ── PASO 3: Auto-facturación — generar movimiento en Caja ─────────────────
        try {
          const agOrig2 = data._agendaId
            ? agendados.find((a) => a.id === data._agendaId)
            : null;
          const _tipoConsulta = (
            agOrig2?.tipoConsulta ||
            data.tipoExamen ||
            closed.tipoExamen ||
            "general"
          ).toLowerCase();
          // Calcular tarifa: convenio empresa → tarifa médico → 0
          const _empCliente = companies.find(
            (c) =>
              c.id === closed.empresaId ||
              c.nit === closed.empresaNit ||
              c.nombre === closed.empresaNombre
          );
          let _tarifa = 0;
          if (_empCliente) {
            if (_tipoConsulta.includes("ingreso"))
              _tarifa = Number(_empCliente.tarifaIngreso || 0);
            else if (
              _tipoConsulta.includes("periodico") ||
              _tipoConsulta.includes("periódico")
            )
              _tarifa = Number(_empCliente.tarifaPeriodico || 0);
            else if (
              _tipoConsulta.includes("egreso") ||
              _tipoConsulta.includes("retiro")
            )
              _tarifa = Number(_empCliente.tarifaEgreso || 0);
            else _tarifa = Number(_empCliente.tarifaConsulta || 0);
          }
          if (!_tarifa)
            _tarifa = Number(activeDoctorData?.tarifaExamenOcup || 0);
          const _tipoLabel = _tipoConsulta.includes("ingreso")
            ? "Examen Ingreso"
            : _tipoConsulta.includes("periodico") ||
              _tipoConsulta.includes("periódico")
            ? "Examen Periódico"
            : _tipoConsulta.includes("egreso") ||
              _tipoConsulta.includes("retiro")
            ? "Examen Egreso"
            : _tipoConsulta.includes("general")
            ? "Consulta General"
            : "Examen Médico";
          const autoMov = {
            id: "mob_" + Date.now(),
            tipo: "ingreso",
            concepto: `${_tipoLabel} · ${_sanitize(
              closed.nombres || ""
            )} · ${_sanitize(
              closed.empresaNombre || agOrig2?.empresa || "Particular"
            )}`,
            monto: String(_tarifa),
            formaPago: "Por cobrar",
            estado: "pendiente",
            fecha: new Date().toISOString().split("T")[0],
            pacienteId: closed.id,
            pacienteNombre: closed.nombres || "",
            pacienteDoc: closed.docNumero || "",
            agendaId: data._agendaId || null,
            tipoConsulta: _tipoConsulta,
            empresaClienteId: _empCliente?.id || "",
            empresaClienteNombre:
              closed.empresaNombre || agOrig2?.empresa || "Particular",
            medicoId: currentUser?.user,
            medicoNombre: activeDoctorData?.nombre || currentUser?.name || "",
            codigoVerificacion: code,
            _autoGenerated: true,
            ...(currentUser?.empresaId
              ? { empresaId: currentUser.empresaId }
              : {}),
          };
          const nuevosCaja = [...cajaMovimientos, autoMov];
          saveCaja(nuevosCaja);
        } catch (_autoErr) {
          console.warn("[PASO3] Auto-billing error:", _autoErr);
        }
        showAlert(
          `✅ Historia cerrada y firmada digitalmente.\n📋 Código QR: ${code}\n🔐 Hash integridad: ${hashHC.substring(
            0,
            20
          )}...\n⚖️ Válido: Ley 527/1999 - Decreto 2364/2012`
        );
        logAccess("Cierre", data.id, dataType); // AUDIT: Res. 1888/2025 RDA
      }
    );
  };

  // B-29: Resumen IA de HC (Claude API)
  const handleAiResumen = async (hcData) => {
    if (!_canUse("ia_resumen", currentUser)) {
      showAlert(
        "🔒 El resumen IA está disponible en el plan ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes para actualizar."
      );
      return;
    }
    if (!hcData) return;
    setAiCargando(true);
    setAiResumen("");
    try {
      const prompt = `Eres un médico especialista en salud ocupacional. Resume de forma clara y profesional esta evaluación médica ocupacional para uso interno del médico tratante. Sé conciso (máximo 150 palabras). Datos: Paciente: ${
        hcData.nombres || "--"
      } | Empresa: ${hcData.empresaNombre || hcData.empresa || "--"} | Cargo: ${
        hcData.cargo || "--"
      } | Examen: ${hcData.tipoExamen || "--"} | Concepto: ${
        hcData.conceptoAptitud || "--"
      } | Restricciones: ${hcData.restricciones || "ninguna"} | Diagnósticos: ${
        (hcData.diagnosticos || [])
          .map((d) => d.descripcion || d.codigo)
          .filter(Boolean)
          .join(", ") || "--"
      } | Fecha: ${hcData.fechaExamen || "--"}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const d = await res.json();
      const txt =
        (d.content || []).find((b) => b.type === "text")?.text ||
        "Sin respuesta del modelo.";
      setAiResumen(txt);
    } catch (e) {
      setAiResumen("Error al generar resumen: " + e.message);
    } finally {
      setAiCargando(false);
    }
  };

  // ══ B-08: Notas aclaratorias - Res. 1995/1999 + Res. 3100/2019 ══
  // Una HC firmada NO se modifica. Solo se agregan notas aclaratorias con trazabilidad completa.
  const handleEditHistory = () => {
    if (currentUser?.role === "secretaria") {
      showAlert("⛔ La secretaria no puede modificar historias clínicas.");
      return;
    }
    // Selector de acción mediante showPrompt (selector de número)
    showPrompt(
      `📋 HC Cerrada - ${data.nombres}\nCódigo: ${
        data.codigoVerificacion || "-"
      }\n\nEscriba el número de la opción:\n1 - Evolución clínica + Re-emitir documentos\n2 - Nota Aclaratoria\n3 - Reapertura (solo Administrador)`,
      (opcion) => {
        const op = (opcion || "").trim();
        if (op === "1") {
          // Evolución - escribe nota clínica + puede re-emitir documentos bajo el mismo código
          setShowEvolucionModal(true);
        } else if (op === "2") {
          // Nota aclaratoria
          showPrompt(
            "Escriba la nota aclaratoria (se registrará con su nombre, fecha y hora):",
            (nota) => {
              if (!nota || nota.trim().length < 10) {
                showAlert("La nota debe tener al menos 10 caracteres.");
                return;
              }
              const notaAclaratoria = {
                id: Date.now(),
                fecha: new Date().toISOString(),
                autor: currentUser?.name || currentUser?.user,
                rol: currentUser?.role,
                contenido: nota.trim(),
                hcId: data.id,
                codigoHC:
                  data.codigoVerificacion ||
                  data.firmaDigital?.codigoQR ||
                  "N/A",
              };
              setData((p) => ({
                ...p,
                notasAclaratorias: [
                  ...(p.notasAclaratorias || []),
                  notaAclaratoria,
                ],
              }));
              setTimeout(() => {
                const updPats = patientsList.map((p) =>
                  p.id === data.id
                    ? {
                        ...p,
                        notasAclaratorias: [
                          ...(p.notasAclaratorias || []),
                          notaAclaratoria,
                        ],
                      }
                    : p
                );
                setPatientsList(updPats);
                _sync(_patKey(currentUser?.user), JSON.stringify(updPats));
              }, 0);
              logAccess("NotaAclaratoria", data.id, dataType);
              showAlert(
                `✅ Nota aclaratoria registrada.\nAutor: ${
                  notaAclaratoria.autor
                }\nFecha: ${new Date(notaAclaratoria.fecha).toLocaleString(
                  "es-CO"
                )}\n\nLa HC original permanece intacta.`
              );
            }
          );
        } else if (op === "3") {
          // Reapertura (solo admin)
          if (currentUser?.role !== "administrador") {
            showAlert(
              "⛔ Solo el administrador puede reabrir una HC firmada.\nUse la opción 1 (Evolución) o 2 (Nota Aclaratoria)."
            );
            return;
          }
          showPrompt("Código de administrador:", (adminCode) => {
            _sha256(adminCode).then((h) => {
              const storedCode = _ls.getItem("siso_admin_code_hash") || "";
              if (!storedCode) {
                showAlert(
                  "Configure el código de administrador primero desde el panel de usuarios."
                );
                return;
              }
              if (h !== storedCode) {
                showAlert("⛔ Código incorrecto.");
                return;
              }
              showPrompt(
                "Motivo de reapertura (mín. 20 caracteres - queda en auditoría):",
                (reason) => {
                  if (!reason || reason.trim().length < 20) {
                    showAlert("El motivo debe tener al menos 20 caracteres.");
                    return;
                  }
                  setData((p) => ({
                    ...p,
                    estadoHistoria: "Abierta",
                    conteoEdiciones: (p.conteoEdiciones || 0) + 1,
                    motivoEdicion: reason,
                    reaperturas: [
                      ...(p.reaperturas || []),
                      {
                        fecha: new Date().toISOString(),
                        autor: currentUser?.name,
                        motivo: reason,
                        codigoAnterior: data.codigoVerificacion,
                      },
                    ],
                  }));
                  logAccess("ReaperturaAdmin", data.id, dataType);
                  showAlert(
                    "⚠️ HC reabierta. Este evento quedó registrado en el audit log."
                  );
                }
              );
            });
          });
        } else {
          showAlert("Opción no válida. Ingrese 1, 2 o 3.");
        }
      }
    );
  };
  const handleCompanySelect = (e) => {
    const id = e.target.value;
    if (!id || id === "particular") {
      setData((p) => ({
        ...p,
        empresaId: "particular",
        empresaNombre: "PARTICULAR / INDEPENDIENTE",
        empresaNit: "",
        actividadEconomica: "",
      }));
      return;
    }
    const c = companies.find((x) => x.id === id);
    if (c)
      setData((p) => ({
        ...p,
        empresaId: c.id,
        empresaNombre: c.nombre,
        empresaNit: c.nit + (c.dv ? `-${c.dv}` : ""),
        actividadEconomica: c.actividad,
      }));
  };
  // NORMATIVO: Res. 1995/1999 Art. 15 - RETENCIÓN DOCUMENTAL MÍNIMA 20 AÑOS
  // Se reemplaza el borrado definitivo por ARCHIVADO para cumplir con la obligación de conservación
  const handleDeletePatient = (id) => {
    const pac = patientsList.find((p) => p.id === id);
    if (!pac) return;
    // Si la HC tiene menos de 20 años desde su creación, no se puede eliminar definitivamente
    const fechaCreacion = pac.fechaExamen || pac.fechaCreacion || null;
    const aniosTranscurridos = fechaCreacion
      ? new Date().getFullYear() - new Date(fechaCreacion).getFullYear()
      : 0;
    if (pac.estadoHistoria === "Cerrada" || aniosTranscurridos < 20) {
      showConfirm(
        `⚠️ RETENCIÓN DOCUMENTAL (Res. 1995/1999 Art. 15)
Esta historia clínica debe conservarse mínimo 20 años.
¿Desea ARCHIVAR el registro en vez de eliminarlo?
(Quedará oculto pero conservado para cumplimiento legal)`,
        () => {
          const upd = patientsList.map((p) =>
            p.id === id
              ? {
                  ...p,
                  _archivado: true,
                  _fechaArchivado: new Date().toISOString(),
                  _archivadoPor: currentUser?.user,
                }
              : p
          );
          setPatientsList(upd);
          _syncPatients(upd);
          logAccess("Archivado", id, "retención-documental", "Gestión HC");
          showAlert(
            "✅ Registro archivado correctamente.\nSe conserva según Res. 1995/1999 Art. 15 (20 años mínimo)."
          );
        }
      );
    } else {
      showConfirm(
        "¿Eliminar este registro? Han transcurrido más de 20 años desde su creación.",
        () => {
          const upd = patientsList.filter((p) => p.id !== id);
          setPatientsList(upd);
          _syncPatients(upd);
          logAccess("Eliminacion", id, "borrado-definitivo", "Gestión HC");
        }
      );
    }
  };
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDoctorSignature(reader.result);
      _sync("siso_doctor_signature", reader.result);
      showAlert("Firma actualizada.");
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };
  const handleExportData = (userId) => {
    // Full backup: all platform data + custom meds + signatures embedded per user
    const customMeds = getCustomMeds();
    // Ensure every user carries their signature inside doctorData
    const usersWithSigs = usersList.map((u) => {
      // If this is the currently active user, also capture the live doctorSignature state
      const isActive = u.id === currentUser?.id || u.user === currentUser?.user;
      const sig =
        u.doctorData?.signature || (isActive ? doctorSignature : null);
      return {
        ...u,
        doctorData: {
          ...(u.doctorData || DEFAULT_DOCTOR_DATA),
          signature: sig || u.doctorData?.signature || null,
        },
      };
    });
    // Leer keys desde sessionStorage para capturar las más recientes (incluye sesión actual)
    const savedKeys = sps("siso_ai_keys", aiConfig.keys || {});
    const aiConfigBackup = { ...aiConfig, keys: savedKeys };
    const backup = {
      version: "3.1",
      backupDate: new Date().toISOString(),
      platform: "OCUPASALUD v3.0",
      exportedBy: currentUser?.name || "Sistema",
      patients: patientsList,
      companies,
      users: usersWithSigs, // ← firmas embebidas en cada usuario
      savedReports,
      savedBills: savedBillsList,
      atencionesCerradas,
      aiConfig: aiConfigBackup, // ← keys incluidas desde sessionStorage
      customMedicamentos: customMeds,
      propuestas: propForm ? [propForm] : [],
    };
    const dateStr = new Date().toISOString().split("T")[0];
    const userStr =
      (currentUser?.name || "").replace(/\s+/g, "_") || "OCUPASALUD";
    const backupFilename = `BACKUP_${userStr}_${dateStr}.json`;
    const sigsCount = usersWithSigs.filter(
      (u) => u.doctorData?.signature
    ).length;
    // Mostrar en modal (compatible sandbox + descarga en browser real)
    setBackupModalData({
      json: JSON.stringify(backup, null, 2),
      filename: backupFilename,
      summary: `${patientsList.length} pacientes · ${companies.length} empresas · ${usersList.length} usuarios · ${sigsCount} firma(s) · ${customMeds.length} meds personalizados`,
    });
  };
  const handleImportData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // SEGURIDAD FIX 6: Validar tipo MIME y tamaño antes de leer
    if (
      file.type &&
      file.type !== "application/json" &&
      !file.name.endsWith(".json")
    ) {
      showAlert(
        "❌ Archivo inválido. Solo se permiten archivos .json de backup de OCUPASALUD."
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10 MB máximo
      showAlert("❌ Archivo demasiado grande (máximo 10 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        // SEGURIDAD: validar estructura mínima del backup
        const hasKnownKeys =
          d &&
          typeof d === "object" &&
          (d.patients ||
            d.companies ||
            d.users ||
            d.savedBills ||
            d.savedReports);
        if (!hasKnownKeys) {
          showAlert(
            "❌ Archivo no reconocido. El backup debe ser generado por OCUPASALUD."
          );
          return;
        }
        // Pacientes
        if (d.patients) {
          const cur = [...patientsList];
          d.patients.forEach((p) => {
            const i = cur.findIndex((x) => x.id === p.id);
            if (i >= 0) cur[i] = p;
            else cur.push(p);
          });
          setPatientsList(cur);
          _syncPatients(cur);
        }
        // Empresas
        if (d.companies) {
          const cur = [...companies];
          d.companies.forEach((c) => {
            if (!cur.find((x) => x.id === c.id)) cur.push(c);
          });
          setCompanies(cur);
          _syncCompanies(cur);
        }
        // Usuarios con sus firmas embebidas en doctorData
        if (d.users && Array.isArray(d.users)) {
          const cur = [...usersList];
          d.users.forEach((u) => {
            const idx = cur.findIndex(
              (x) => x.id === u.id || x.user === u.user
            );
            if (idx >= 0) {
              // Merge: conservar firma si viene en el backup
              cur[idx] = {
                ...cur[idx],
                ...u,
                doctorData: {
                  ...(cur[idx].doctorData || {}),
                  ...(u.doctorData || {}),
                  // Firma: priorizar la del backup si existe
                  signature:
                    u.doctorData?.signature ||
                    cur[idx].doctorData?.signature ||
                    null,
                },
              };
            } else {
              cur.push(u);
            }
          });
          setUsersList(cur);
          _sync("siso_users", JSON.stringify(cur));
          // Si el usuario activo tiene firma en el backup, actualizar la firma activa
          const activeRestored = d.users.find(
            (u) => u.id === currentUser?.id || u.user === currentUser?.user
          );
          if (activeRestored?.doctorData?.signature) {
            setDoctorSignature(activeRestored.doctorData.signature);
            _sync("siso_doctor_signature", activeRestored.doctorData.signature);
          }
        }
        // Configuración IA - FIX C-03: keys a sessionStorage, proveedor a localStorage
        if (d.aiConfig) {
          setAiConfig(d.aiConfig);
          _ss.setItem("siso_ai_keys", JSON.stringify(d.aiConfig.keys || {}));
          _sync(
            "siso_ai_config_provider",
            JSON.stringify({ activeProvider: d.aiConfig.activeProvider })
          );
        }
        // Cuentas de cobro
        if (d.savedBills && Array.isArray(d.savedBills)) {
          setSavedBillsList(d.savedBills);
          const _bSuf = currentUser?.empresaId
            ? "empresa_" + currentUser.empresaId
            : currentUser?.user || "shared";
          _sync(`siso_saved_bills_${_bSuf}`, JSON.stringify(d.savedBills));
        }
        // Informes / reportes guardados
        if (d.savedReports && Array.isArray(d.savedReports)) {
          setSavedReports(d.savedReports);
          _sync("siso_saved_reports", JSON.stringify(d.savedReports));
        }
        // Medicamentos personalizados
        if (
          d.customMedicamentos &&
          Array.isArray(d.customMedicamentos) &&
          d.customMedicamentos.length > 0
        ) {
          _ls.setItem("siso_custom_meds", JSON.stringify(d.customMedicamentos));
        }
        // Propuestas
        if (
          d.propuestas &&
          Array.isArray(d.propuestas) &&
          d.propuestas.length > 0
        ) {
          setPropForm(d.propuestas[0]);
        }
        const sigsRestored = (d.users || []).filter(
          (u) => u.doctorData?.signature
        ).length;
        const billsR = (d.savedBills || []).length;
        const repsR = (d.savedReports || []).length;
        // AUTO-SYNC PORTAL: publicar certificados en Supabase al restaurar backup
        const closedPats = (d.patients || []).filter(
          (p) => p.codigoVerificacion && p.estadoHistoria === "Cerrada"
        );
        if (closedPats.length > 0) {
          let synced = 0;
          for (const p of closedPats) {
            const portalData = {
              nombres: p.nombres || "",
              docTipo: p.docTipo || "CC",
              docNumero: p.docNumero || "",
              eps: p.eps || "",
              edad: p.edad || "",
              empresaNombre: p.empresaNombre || p.empresa || "",
              empresaNit: p.empresaNit || "",
              arl: p.arl || "",
              cargo: p.cargo || "",
              tipoExamen: p.tipoExamen || "",
              enfasisExamen: p.enfasisExamen || "GENERAL",
              fechaExamen: p.fechaExamen || "",
              vigencia: p.vigencia || "1 año",
              conceptoAptitud: p.conceptoAptitud || "",
              restricciones: p.analisisRestricciones || p.restricciones || "",
              restriccionesChecklist: p.restriccionesChecklist || {},
              recomendaciones: p.recomendaciones || "",
              recomendacionesMedicas: p.recomendacionesMedicas || "",
              recomendacionesOcupacionales:
                p.recomendacionesOcupacionales || "",
              recomendacionesChecklist: p.recomendacionesChecklist || {},
              diagnosticoPrincipal: p.diagnosticoPrincipal || "",
              codigoVerificacion: p.codigoVerificacion,
              medicoNombre:
                p.medicoNombre ||
                activeDoctorData?.nombre ||
                currentUser?.name ||
                "",
              estadoHistoria: "Cerrada",
              fechaCierre: p.fechaExamen || "",
              _doctorData: {
                nombre:
                  activeDoctorData?.nombre ||
                  currentUser?.name ||
                  "MÉDICO OCUPACIONAL",
                titulo:
                  activeDoctorData?.titulo ||
                  "Médico Especialista en Salud Ocupacional",
                licencia: activeDoctorData?.licencia || "--",
                ciudad: activeDoctorData?.ciudad || "Popayán",
                email: activeDoctorData?.email || "",
              },
              _firma: activeSignature || "",
            };
            const code = p.codigoVerificacion;
            await _sbSet("siso_portal_" + code, portalData);
            if (p.docNumero)
              await _sbSet(
                "siso_portal_doc_" + p.docNumero.replace(/\s/g, ""),
                portalData
              );
            // compatibilidad códigos viejos CV-
            if (!code.startsWith("CV-"))
              await _sbSet("siso_portal_CV-" + code, portalData);
            synced++;
          }
          showAlert(
            `✅ Restauración completada.\n📁 ${
              (d.patients || []).length
            } pacientes · ${(d.companies || []).length} empresas · ${
              (d.users || []).length
            } usuarios\n✍️ ${sigsRestored} firma(s) · 🧾 ${billsR} cuentas · 📊 ${repsR} informes restaurados\n☁️ ${synced} certificado(s) sincronizados al Portal del Trabajador`
          );
        } else {
          showAlert(
            `✅ Restauración completada.\n📁 ${
              (d.patients || []).length
            } pacientes · ${(d.companies || []).length} empresas · ${
              (d.users || []).length
            } usuarios\n✍️ ${sigsRestored} firma(s) · 🧾 ${billsR} cuentas · 📊 ${repsR} informes restaurados`
          );
        }
      } catch (err) {
        showAlert(
          "Error al leer el archivo de backup. Verifique que sea un archivo JSON válido de OCUPASALUD."
        );
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };
  const handleNameChange = (e) => {
    const val = e.target.value;
    setData((p) => ({ ...p, nombres: val }));
    setHistoryNotification(null);
    if (val.length >= 3) {
      const _ownPats = _isAdmin(currentUser?.role)
        ? patientsList
        : patientsList.filter(
            (p) => !p._medicoId || p._medicoId === currentUser?.user
          );
      const matches = _ownPats.filter((p) =>
        p.nombres?.toLowerCase().includes(val.toLowerCase())
      );
      const seen = new Set();
      const uniq = [];
      matches
        .sort(
          (a, b) => new Date(b.fechaExamen || 0) - new Date(a.fechaExamen || 0)
        )
        .forEach((m) => {
          if (!seen.has(m.docNumero)) {
            seen.add(m.docNumero);
            const hc = patientsList.filter(
              (h) => h.docNumero === m.docNumero && h.fechaExamen
            ).length;
            uniq.push({ ...m, historyCount: hc });
          }
        });
      setPatientSuggestions(uniq.slice(0, 8));
    } else setPatientSuggestions([]);
  };
  const selectPatientSuggestion = (p) => {
    if (p.historyCount > 0) setHistoryNotification(p.historyCount);
    else setHistoryNotification(null);
    // Memoria de antecedentes: copia todos los datos clínicos previos del paciente
    setData((prev) => ({
      ...prev,
      // ── Datos personales ──
      nombres: p.nombres,
      docNumero: p.docNumero,
      edad: p.edad,
      fechaNacimiento: p.fechaNacimiento || "",
      genero: p.genero,
      estadoCivil: p.estadoCivil,
      escolaridad: p.escolaridad,
      telefono: p.telefono || "",
      email: p.email || "",
      celular: p.celular || "",
      eps: p.eps || "",
      afp: p.afp || "",
      arl: p.arl || "",
      nivelRiesgoARL: p.nivelRiesgoARL || "",
      grupoSanguineo: p.grupoSanguineo || "",
      foto: p.foto || "",
      lateralidad: p.lateralidad || "",
      estrato: p.estrato || "",
      zonaResidencia: p.zonaResidencia || "",
      grupoEtnico: p.grupoEtnico || "",
      identidadGenero: p.identidadGenero || "",
      // ── Datos laborales ──
      cargo: p.cargo,
      dependencia: p.dependencia || "",
      turnoTrabajo: p.turnoTrabajo || "",
      tipoContrato: p.tipoContrato || "",
      antiguedadEmpresa: p.antiguedadEmpresa || "",
      ingresosMensuales: p.ingresosMensuales || "",
      numPersonasCargo: p.numPersonasCargo || "",
      empresaId:
        prev.empresaId !== "particular"
          ? prev.empresaId
          : p.empresaId || "particular",
      empresaNombre:
        prev.empresaId !== "particular"
          ? prev.empresaNombre
          : p.empresaNombre || "PARTICULAR",
      empresaNit:
        prev.empresaId !== "particular" ? prev.empresaNit : p.empresaNit || "",
      actividadEconomica:
        prev.empresaId !== "particular"
          ? prev.actividadEconomica
          : p.actividadEconomica || "",
      // ── ANTECEDENTES POR MEMORIA (núcleo de la función) ──
      antecedentesAgrupados: p.antecedentesAgrupados
        ? JSON.parse(JSON.stringify(p.antecedentesAgrupados))
        : initialOccupPatientState.antecedentesAgrupados,
      antecedentes: p.antecedentes
        ? { ...p.antecedentes }
        : { ...initialOccupPatientState.antecedentes },
      habitos: p.habitos
        ? { ...p.habitos }
        : { ...initialOccupPatientState.habitos },
      vacunacionCompleta: p.vacunacionCompleta || false,
      vacunas: p.vacunas || [],
      // ── Riesgos previos ──
      riesgos: p.riesgos
        ? { ...p.riesgos }
        : { ...initialOccupPatientState.riesgos },
      // ── Pausa: NO copiar examen físico, diagnósticos, conceptos - son propios de cada evaluación ──
    }));
    setPatientSuggestions([]);
  };
  const handleOpenHistoryModal = async (
    docNumber,
    searchAllDoctors = false
  ) => {
    let records = patientsList.filter(
      (p) => p.docNumero === docNumber && p.fechaExamen
    );
    // Para consultar certificados de TODOS los médicos (solo certificados)
    if (searchAllDoctors) {
      try {
        const cloud = await _sbGetAll();
        if (cloud) {
          Object.entries(cloud).forEach(([key, entry]) => {
            if (
              key.startsWith("siso_patients_") &&
              Array.isArray(entry.value)
            ) {
              const otherRecs = entry.value.filter(
                (p) =>
                  p.docNumero === docNumber &&
                  p.fechaExamen &&
                  p.conceptoAptitud
              );
              records = [...records, ...otherRecs];
            }
          });
        }
      } catch (e) {
        /* sin internet: solo los locales */
      }
    }
    const unique = records.filter(
      (r, i, arr) => arr.findIndex((x) => x.id === r.id) === i
    );
    setHistoryRecords(
      unique.sort((a, b) => new Date(b.fechaExamen) - new Date(a.fechaExamen))
    );
    setShowHistoryModal(true);
  };
  // ── APLICAR CHECKLIST DE RESTRICCIONES AL TEXTO ───────────────────────────
  const applyRestriccionesChecklist = (checklist) => {
    setData((prev) => ({ ...prev, restriccionesChecklist: checklist }));
    const selectedItems = [];
    Object.entries(RESTRICCIONES_CATALOG).forEach(([, seg]) => {
      seg.items.forEach((item) => {
        if (checklist[item.id])
          selectedItems.push(
            `• [PREVENTIVA] ${item.texto} -- ${item.normativa}`
          );
      });
    });
    if (selectedItems.length > 0) {
      setData((prev) => ({
        ...prev,
        analisisRestricciones:
          (prev.analisisRestricciones
            ? prev.analisisRestricciones + "\n\n"
            : "") +
          "RESTRICCIONES SELECCIONADAS EN CHECKLIST:\n" +
          selectedItems.join("\n"),
        restriccionesChecklist: checklist,
      }));
    }
  };
  const applyRecomendacionesChecklist = (checklist) => {
    const selectedItems = [];
    Object.entries(RECOMENDACIONES_CATALOG).forEach(([, cat]) => {
      cat.items.forEach((item) => {
        if (checklist[item.id]) selectedItems.push(`• ${item.texto}`);
      });
    });
    if (selectedItems.length > 0) {
      setData((prev) => ({
        ...prev,
        recomendaciones:
          (prev.recomendaciones ? prev.recomendaciones + "\n\n" : "") +
          "RECOMENDACIONES SELECCIONADAS:\n" +
          selectedItems.join("\n"),
        recomendacionesChecklist: checklist,
      }));
    }
  };
  const handlePrint = (title) => {
    const orig = document.title;
    document.title = `[OCUPASALUD] ${title || "Documento"}`;
    window.print();
    document.title = orig;
  };
  // ── Navegación con historial -- permite ← Volver sin volver al login ──────
  // Helper: mostrar diálogo guardar-antes-de-salir si la HC tiene cambios pendientes
  const _maybeExitHC = (proceed) => {
    if (view === "historia" && _hcDirty && (data.id || data.nombres)) {
      _setExitHcConfirm({ onProceed: proceed });
    } else {
      proceed();
    }
  };
  const _goToDirect = (newView) => {
    // Al entrar al dashboard, asegurar que todos los datos del _ls estén cargados
    if (newView === "dashboard") {
      // AISLAMIENTO: usar clave específica del usuario activo (o empresa compartida)
      const _activeUser = currentUser?.user;
      if (_activeUser) {
        const _suidGoTo = currentUser?.empresaId
          ? "empresa_" + currentUser.empresaId
          : _activeUser;
        const snPat = sp(_patKey(_suidGoTo), null);
        if (snPat !== null) setPatientsList(snPat);
        const snComp = sp(_compKey(_suidGoTo), null);
        if (snComp !== null) setCompanies(snComp);
      }
      const snBills = sp("siso_saved_bills", null);
      if (snBills !== null) setSavedBillsList(snBills);
      const snRep = sp("siso_saved_reports", null);
      if (snRep !== null) setSavedReports(snRep);
      // FIX C-03: cargar proveedor desde localStorage; keys desde sessionStorage
      const snAIProvider = sp("siso_ai_config_provider", null);
      const snAIKeys = sps("siso_ai_keys", null);
      if (snAIProvider !== null)
        setAiConfig((prev) => ({
          ...prev,
          activeProvider: snAIProvider.activeProvider || prev.activeProvider,
          keys: snAIKeys || prev.keys,
        }));
    }
    setNavStack((prev) => [...prev, view]); // guardar vista actual en historial
    setView(newView);
    // Registrar globalmente para que PlanGate pueda navegar sin prop drilling
    window._sisoGoTo = goTo;
  };
  const goTo = (newView) => {
    if (newView !== "historia") {
      _maybeExitHC(() => _goToDirect(newView));
    } else {
      _goToDirect(newView);
    }
  };
  const _goBackDirect = () => {
    setNavStack((prev) => {
      // Filtrar 'login' del historial para nunca volver al login por accidente
      const filtered = prev.filter((v) => v !== "login");
      if (filtered.length === 0) {
        setView("dashboard");
        return [];
      }
      const last = filtered[filtered.length - 1];
      setView(last);
      return filtered.slice(0, -1);
    });
  };
  const goBack = () => {
    _maybeExitHC(_goBackDirect);
  };
  // ─────────────────────────────────────────────────────────────────────────
  // ─── RETURN ALL STATE AND HANDLERS ───────────────────────────────────────
  // Hook-scoped refs for values computed inside useEffect
  let _initSess = null;
  let applyCloud = null;
  let handler = null;
  let doAutoBackup = null;
  let _tipoExamen = null;
  let _contextoTipo = null;
  let lista = null;
  let fmtDist = null;
  let _loadScoped = null;
  let _tipoConsulta = null;
  let op = null;
  let sigsRestored = null;
  let billsR = null;
  let repsR = null;
  let closedPats = null;

  const sessionUser = currentUser?.user || null;

  return {
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
    activeDoctorData,
    activeSignature,
    _resetInactivity,
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
    handleLogin,
        saveCaja: saveCajaDebounced,
  };
}
