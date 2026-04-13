// src/app/App.jsx
// ═══════════════════════════════════════════════════════════════════════
// SISO OcupaSalud Pro — Application Shell (Full State Coordinator)
// All state lives here. Pages receive state & handlers via props.
// Mirrors monolito-guia/src/App.jsx AppInner function (lines 12701-48136).
// ═══════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, ClipboardList, Stethoscope, Building2,
  Users, Calendar, Receipt, Wallet, CreditCard, BarChart3,
  Shield, Video, UserCheck, LogOut, RefreshCw, Menu, X,
  ChevronRight, ChevronLeft, Settings, Bell, Moon, Sun,
  Lock, Unlock, Cloud, Loader2, AlertTriangle, CheckCircle2,
  BrainCircuit, Wifi, WifiOff, Upload, FileText,
} from 'lucide-react';

// ── Shared libraries ──────────────────────────────────────────────────
import { _ls, _ss, sp, sps } from '../shared/lib/storage.js';
import { _sha256, _pbkdf2Hash, _verifyPassword } from '../shared/lib/crypto.js';
import {
  _sync, _sbGetAll, _sbSet, _sbDelete, _sbQueue,
  _patKey, _patKeyCloud, _compKey, _compKeyCloud,
  setSyncStatusCallback,
  _SB_URL, _SB_HEADERS, _SB_KEYS, _SB_KEY_PREFIXES,
} from '../shared/lib/supabase.js';
import {
  _auditLog, _rl, _resetSessionTimer, _clearSessionTimer,
  SESSION_TIMEOUT_MS, sanitizeInput, _sanitize, _safeLogoUrl,
} from '../shared/lib/security.js';
import {
  PLAN_CONFIG, _canUse, _contarHC, _isAdmin, _isAdminEmpresa,
  _isAdminOrEmpresa, _secretariaPuede, _secretariaMedicoAsignado,
  ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT, SECRETARIA_PERMISOS_DEFAULT,
  MEDICO_SIEMPRE_PUEDE,
} from '../shared/data/planConfig.js';
import {
  initialOccupPatientState, initialGeneralPatientState,
  initialUsers, initialCompanyState,
} from '../shared/data/initialStates.js';
import { _totpVerify } from '../shared/lib/totp.js';
import { AI_PROVIDERS, AI_CONFIG_VERSION, parseAIJSON } from '../shared/lib/aiProviders.js';
import { numeroALetras } from '../shared/lib/formatters.js';

// ── Auth UI ───────────────────────────────────────────────────────────
import LoginForm from '../modules/auth/ui/LoginForm.jsx';
import PrivacyModal from '../modules/auth/ui/PrivacyModal.jsx';
import ChangePasswordForm from '../modules/auth/ui/ChangePasswordForm.jsx';

// ── Page Components ───────────────────────────────────────────────────
import Dashboard from '../pages/Dashboard.jsx';
import Historia from '../pages/Historia.jsx';
import Companies from '../pages/Companies.jsx';
import UsersPage from '../pages/Users.jsx';
import Agenda from '../pages/Agenda.jsx';
import Bill from '../pages/Bill.jsx';
import Caja from '../pages/Caja.jsx';
import Planes from '../pages/Planes.jsx';
import Reporte from '../pages/Reporte.jsx';
import SGSST from '../pages/SGSST.jsx';
import Telemedicine from '../pages/Telemedicine.jsx';
import WorkerPortal from '../pages/WorkerPortal.jsx';

// ── Shared UI ─────────────────────────────────────────────────────────
import BrandLogo from '../shared/ui/BrandLogo.jsx';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════
const DEFAULT_DOCTOR_DATA = {
  nombre: "", cedula: "", titulo: "", licencia: "", ciudad: "",
  celular: "", email: "", direccion: "",
  banco: "", tipoCuenta: "Ahorros", numeroCuenta: "",
  rut: "", regimen: "", tarifaHora: "0",
  tarifaExamenOcup: "0", tarifaInforme: "0", tarifaDiaPVE: "0",
};

// ═══════════════════════════════════════════════════════════════════════
// NAV ITEMS
// ═══════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Dashboard',          icon: LayoutDashboard, roles: ['all'] },
  { id: 'patients',        label: 'Pacientes / HC',     icon: ClipboardList,   roles: ['super_admin', 'administrador', 'medico', 'secretaria', 'admin_empresa'] },
  { id: 'companies',       label: 'Empresas',           icon: Building2,       roles: ['super_admin', 'administrador', 'medico', 'secretaria', 'admin_empresa'], perm: 'empresas' },
  { id: 'users',           label: 'Usuarios',           icon: Users,           roles: ['super_admin', 'administrador', 'admin_empresa'] },
  { id: 'agenda',          label: 'Agenda',             icon: Calendar,        roles: ['super_admin', 'administrador', 'medico', 'secretaria', 'admin_empresa'], perm: 'agenda' },
  { id: 'bill',            label: 'Facturación',        icon: Receipt,         roles: ['super_admin', 'administrador', 'medico', 'secretaria'], perm: 'bill' },
  { id: 'caja',            label: 'Caja',               icon: Wallet,          roles: ['super_admin', 'administrador', 'medico', 'secretaria'], perm: 'caja' },
  { id: 'reporte',         label: 'Reportes',           icon: BarChart3,       roles: ['super_admin', 'administrador', 'medico'], perm: 'reporte' },
  { id: 'sve',             label: 'SVE / PVE',          icon: Shield,          roles: ['super_admin', 'administrador', 'medico'], perm: 'sve' },
  { id: 'arl',             label: 'ARL',                icon: Shield,          roles: ['super_admin', 'administrador', 'medico'] },
  { id: 'telemedicina',    label: 'Telemedicina',       icon: Video,           roles: ['super_admin', 'administrador', 'medico', 'secretaria'], perm: 'telemedicina' },
  { id: 'portaltrabajador',label: 'Portal Trabajador',  icon: UserCheck,       roles: ['super_admin', 'administrador', 'medico'] },
  { id: 'planes',          label: '⭐ Planes',          icon: CreditCard,      roles: ['super_admin', 'administrador'] },
];

// ═══════════════════════════════════════════════════════════════════════
// APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function App() {
  // ─────────────────────────────────────────────────────────────────────
  // 1. CORE STATE — View / Navigation / Session
  // ─────────────────────────────────────────────────────────────────────
  const [view, setView] = useState(() => {
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
    } catch { return []; }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const sess = JSON.parse(_ls.getItem("siso_session") || "null");
      if (sess?.user) {
        const users = JSON.parse(_ls.getItem("siso_users") || "[]");
        const found = users.find((u) => u.user === sess.user);
        if (!found) return null;
        const init = initialUsers.find((i) => i.user === found.user);
        if (init && init.doctorData?.nombre && !found.doctorData?.nombre) {
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

  // ── Security: brute force protection ────────────────────────────────
  const [loginAttempts, setLoginAttempts] = useState(() => {
    const stored = parseInt(_ls.getItem("siso_login_attempts") || "0");
    return isNaN(stored) ? 0 : stored;
  });
  const [loginBlockedUntil, setLoginBlockedUntil] = useState(() => {
    const stored = parseInt(_ls.getItem("siso_login_blocked_until") || "0");
    return stored > Date.now() ? stored : null;
  });

  // ── Privacy (Ley 1581/2012) ─────────────────────────────────────────
  const [privacidadAceptada, setPrivacidadAceptada] = useState(() => {
    try { return !!JSON.parse(_ls.getItem("siso_privacidad_aceptada") || "false"); }
    catch { return false; }
  });

  // ─────────────────────────────────────────────────────────────────────
  // 2. SYNC & UI STATE
  // ─────────────────────────────────────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState("idle");
  const [showSyncReport, setShowSyncReport] = useState(false);
  const [syncReport, setSyncReport] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [promptConfig, setPromptConfig] = useState(null);
  const [promptValue, setPromptValue] = useState("");

  // ─────────────────────────────────────────────────────────────────────
  // 3. AI CONFIG
  // ─────────────────────────────────────────────────────────────────────
  const [aiConfig, setAiConfig] = useState({
    activeProvider: "gemini",
    keys: { groq: "", gemini: "", openrouter: "", together: "" },
  });
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  // ─────────────────────────────────────────────────────────────────────
  // 4. DATA COLLECTIONS
  // ─────────────────────────────────────────────────────────────────────
  const [companies, setCompanies] = useState([]);
  const [usersList, setUsersList] = useState(initialUsers);
  const [usersReady, setUsersReady] = useState(false);
  const [patientsList, setPatientsList] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [savedBills, setSavedBills] = useState([]);

  // ── Atenciones cerradas ─────────────────────────────────────────────
  const [atencionesCerradas, setAtencionesCerradas] = useState(() => {
    try { return JSON.parse(_ls.getItem("siso_atenciones_cerradas") || "[]"); }
    catch { return []; }
  });

  const [doctorSignature, setDoctorSignature] = useState(null);

  // ── Audit Log (Res. 1888/2025 RDA) ─────────────────────────────────
  const [auditLog, setAuditLog] = useState(() => {
    try { return JSON.parse(_ls.getItem("siso_audit_log") || "[]"); }
    catch { return []; }
  });

  // ─────────────────────────────────────────────────────────────────────
  // 5. HISTORIA CLINICA STATE
  // ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(() => {
    try { return JSON.parse(_ls.getItem("siso_session") || "null")?.activeTab || "form"; }
    catch { return "form"; }
  });
  const [data, setData] = useState(() => {
    try {
      const saved = _ls.getItem("siso_active_form");
      if (saved) return { ...initialOccupPatientState, ...JSON.parse(saved) };
    } catch {}
    return initialOccupPatientState;
  });
  const [dataType, setDataType] = useState(() => {
    try { return JSON.parse(_ls.getItem("siso_session") || "null")?.dataType || "ocupacional"; }
    catch { return "ocupacional"; }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRestr, setIsGeneratingRestr] = useState(false);
  const [isGeneratingReco, setIsGeneratingReco] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [_hcDirty, _setHcDirty] = useState(false);
  const [_exitHcConfirm, _setExitHcConfirm] = useState(null);
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [historyNotification, setHistoryNotification] = useState(null);
  const [showRestriccionesPanel, setShowRestriccionesPanel] = useState(false);
  const [showRecomendacionesPanel, setShowRecomendacionesPanel] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [ripsModalData, setRipsModalData] = useState(null);
  const [backupModalData, setBackupModalData] = useState(null);
  const [hcChoiceAgenda, setHcChoiceAgenda] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [genPatSearch, setGenPatSearch] = useState("");
  const [printPreview, setPrintPreview] = useState(null);

  // ── Exams ───────────────────────────────────────────────────────────
  const [examSearch, setExamSearch] = useState("");
  const [examList, setExamList] = useState([]);
  const [showExamSuggs, setShowExamSuggs] = useState(false);
  const [diagExamen, setDiagExamen] = useState("");
  const [justExamen, setJustExamen] = useState("");

  // ─────────────────────────────────────────────────────────────────────
  // 6. REPORTS STATE
  // ─────────────────────────────────────────────────────────────────────
  const [selectedCompanyReport, setSelectedCompanyReport] = useState("");
  const [reporteActiveTab, setReporteActiveTab] = useState("estadisticas");
  const [certSelected, setCertSelected] = useState({});
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportAIResult, setReportAIResult] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showExportTable, setShowExportTable] = useState(false);
  const [precioPorPaciente, setPrecioPorPaciente] = useState("");
  const [selectedMedicoReport, setSelectedMedicoReport] = useState("");

  // ─────────────────────────────────────────────────────────────────────
  // 7. BILLING STATE
  // ─────────────────────────────────────────────────────────────────────
  const [showDianPanel, setShowDianPanel] = useState(false);
  const [showSecretariaPatientModal, setShowSecretariaPatientModal] = useState(null);
  const [showTodoChecklist, setShowTodoChecklist] = useState(false);
  const [todoSelection, setTodoSelection] = useState({
    certificado: true, hcCompleta: true, incapacidad: true,
    formula: true, derivaciones: true, examenes: true,
  });
  const [dianProvider, setDianProvider] = useState("siigo");
  const [dianApiKey, setDianApiKey] = useState(() => {
    try { return _ss.getItem("siso_dian_apikey") || ""; }
    catch { return ""; }
  });
  const [billData, setBillData] = useState({
    number: "01", type: "empresa", companyId: "", clientName: "",
    clientNit: "", medicoId: "", tipoServicio: "ingreso",
    date: new Date().toISOString().split("T")[0],
    amount: "", amountWords: "",
    concept: "EXAMENES MEDICOS OCUPACIONALES E INFORME DE SALUD DE LOS TRABAJADORES",
    bankName: "", accountType: "", accountNumber: "",
    totalPacientes: 0, precioPaciente: 0, billDoctorId: "",
    emitidaPor: "organizacion",
  });
  const [savedBillsList, setSavedBillsList] = useState([]);

  // ── Portafolio ──────────────────────────────────────────────────────
  const [portafolioItems, setPortafolioItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("siso_portafolio") || "[]"); }
    catch { return []; }
  });
  const [portafolioForm, setPortafolioForm] = useState({
    nombre: "", codigo: "", precio: "", unidad: "Sesión", descripcion: "",
  });
  const [portafolioEditId, setPortafolioEditId] = useState(null);

  // ── Cotizaciones ────────────────────────────────────────────────────
  const [cotizaciones, setCotizaciones] = useState(() => {
    try { return JSON.parse(localStorage.getItem("siso_cotizaciones") || "[]"); }
    catch { return []; }
  });
  const [cotizacionForm, setCotizacionForm] = useState({
    clienteNombre: "", clienteEmpresa: "", clienteEmail: "",
    clienteTel: "", items: [], notas: "", validezDias: 30,
    fecha: new Date().toISOString().split("T")[0], estado: "Pendiente",
  });
  const [cotizacionView, setCotizacionView] = useState("list");
  const [cotizacionSelId, setCotizacionSelId] = useState(null);

  // ─────────────────────────────────────────────────────────────────────
  // 8. CAJA STATE
  // ─────────────────────────────────────────────────────────────────────
  const [cajaMovimientos, setCajaMovimientos] = useState(() => {
    try {
      const sess = JSON.parse(localStorage.getItem("siso_session") || "{}");
      const suf = sess?.empresaId ? "empresa_" + sess.empresaId : sess?.user || "shared";
      const scoped = JSON.parse(localStorage.getItem(`siso_caja_${suf}`) || "null");
      if (scoped !== null) return scoped;
      return JSON.parse(localStorage.getItem("siso_caja") || "[]");
    } catch { return []; }
  });
  const [cajaForm, setCajaForm] = useState({
    tipo: "ingreso", concepto: "", monto: "", formaPago: "Efectivo",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [cajaTab, setCajaTab] = useState("hoy");
  const [cajaFiltroPeriodo, setCajaFiltroPeriodo] = useState("hoy");
  const [cajaFiltroDesde, setCajaFiltroDesde] = useState("");
  const [cajaFiltroHasta, setCajaFiltroHasta] = useState("");
  const [contabTab, setContabTab] = useState("resumen");
  const [contabPeriodo, setContabPeriodo] = useState("mes");
  const [asistenciaFecha, setAsistenciaFecha] = useState(new Date().toISOString().split("T")[0]);

  // ── Evoluciones ─────────────────────────────────────────────────────
  const [evolucionForm, setEvolucionForm] = useState({
    texto: "", nuevoConcept: "", fecha: new Date().toISOString().split("T")[0],
    codigoEvolucion: "", activeEvTab: "nota", motivoConsulta: "",
    diagnosticos: [{ cie10: "", descripcion: "", tipo: "Principal" }],
    planConducta: "", recomendaciones: "", formulaMedicamentos: [],
    derivaciones: [],
    incapacidad: { aplica: false, dias: 0, origen: "Común", diagnostico: "", desde: "", hasta: "" },
  });
  const [showEvolucionModal, setShowEvolucionModal] = useState(false);

  // ── Packages ────────────────────────────────────────────────────────
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageChecklist, setPackageChecklist] = useState({});
  const [showPackages, setShowPackages] = useState(false);
  const [newComp, setNewComp] = useState(initialCompanyState);

  // ── IPS Profile ─────────────────────────────────────────────────────
  const [ipsPerfilForm, setIpsPerfilForm] = useState({
    nombre: "", nit: "", dv: "", direccion: "", ciudad: "",
    telefono: "", correo: "", actividad: "", lema: "", logo: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationFound, setVerificationFound] = useState(null);
  const [activeUserMgmtTab, setActiveUserMgmtTab] = useState("list");
  const [pendingActivationPlan, setPendingActivationPlan] = useState(null);
  const [sbCloudData, setSbCloudData] = useState(null);
  const [sbLoading, setSbLoading] = useState(false);

  // ── User Management ─────────────────────────────────────────────────
  const [newUserForm, setNewUserForm] = useState({
    user: "", pass: "", name: "", role: "medico", license: "libre",
    secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT },
    medicosAsignados: [],
  });
  const [userEditId, setUserEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // ── Propuestas / Proposals ──────────────────────────────────────────
  const [propForm, setPropForm] = useState({
    empresa: "", nit: "", contacto: "", cargo: "",
    fecha: new Date().toISOString().split("T")[0], ciudad: "",
    numTrabajadores: "", servicios: [], observaciones: "",
    validez: "30", numero: "001",
  });
  const [selSvc, setSelSvc] = useState("");
  const [propModulo, setPropModulo] = useState("propuesta");

  // ─────────────────────────────────────────────────────────────────────
  // 9. MENSAJERÍA
  // ─────────────────────────────────────────────────────────────────────
  const [mensajes, setMensajes] = useState([]);
  const [showMensajePanel, setShowMensajePanel] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // ── 2FA ─────────────────────────────────────────────────────────────
  const [twoFAStep, setTwoFAStep] = useState(null);
  const [twoFAToken, setTwoFAToken] = useState("");
  const [twoFAError, setTwoFAError] = useState("");

  // ── Habeas Data (Ley 1581/2012) ─────────────────────────────────────
  const [habeasRequests, setHabeasRequests] = useState(() => {
    try { return JSON.parse(_ls.getItem("siso_habeas_requests") || "[]"); }
    catch { return []; }
  });
  const [showHabeasModal, setShowHabeasModal] = useState(false);
  const [habeasForm, setHabeasForm] = useState({
    nombre: "", documento: "", tipo: "", descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  // ── Portal Público ──────────────────────────────────────────────────
  const [showPortalPublico, setShowPortalPublico] = useState(false);

  // ── AI Resumen ──────────────────────────────────────────────────────
  const [aiResumen, setAiResumen] = useState("");
  const [aiCargando, setAiCargando] = useState(false);

  // ── ARL ─────────────────────────────────────────────────────────────
  const [arlTab, setArlTab] = useState("at");
  const [arlForm, setArlForm] = useState({});
  const [arlGuardados, setArlGuardados] = useState(() => sp("siso_arl_reportes", []));

  // ── SVE ─────────────────────────────────────────────────────────────
  const [svePrograma, setSvePrograma] = useState("DME");
  const [sveFiltroEmpresa, setSveFiltroEmpresa] = useState("");
  const [sveAIAnalisis, setSveAIAnalisis] = useState(null);
  const [sveAICargando, setSveAIAnalisisCargando] = useState(false);
  const [sveAIFiltroEmpresa, setSveAIFiltroEmpresa] = useState("");

  // ── Notifications ───────────────────────────────────────────────────
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifData, setNotifData] = useState({});

  // ── Portal del Trabajador ───────────────────────────────────────────
  const [portalCodigo, setPortalCodigo] = useState("");
  const [portalPaciente, setPortalPaciente] = useState(null);
  const [portalMultiple, setPortalMultiple] = useState([]);

  // ── Epidemiología ───────────────────────────────────────────────────
  const [epiEmpresa, setEpiEmpresa] = useState("todas");
  const [epiPeriodo, setEpiPeriodo] = useState("anio");
  const [epiTab, setEpiTab] = useState("resumen");

  // ── Telemedicina ────────────────────────────────────────────────────
  const [teleconsultas, setTeleconsultas] = useState(() => {
    try { return JSON.parse(_ls.getItem("siso_teleconsultas") || "[]"); }
    catch { return []; }
  });
  const [teleForm, setTeleForm] = useState({
    paciente: "", documento: "", celular: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: "", motivo: "", notas: "", consentimientoTele: false,
  });
  const [teleSalaActiva, setTeleSalaActiva] = useState(null);
  const [teleTab, setTeleTab] = useState("nueva");
  const [teleEspera, setTeleEspera] = useState([]);
  const [mensajeRespuesta, setMensajeRespuesta] = useState("");

  // ─────────────────────────────────────────────────────────────────────
  // 10. AGENDA / SALA DE ESPERA
  // ─────────────────────────────────────────────────────────────────────
  const [agendados, setAgendados] = useState([]);
  const [showAgenda, setShowAgenda] = useState(false);
  const [agendaForm, setAgendaForm] = useState({
    nombre: "", docTipo: "CC", docNumero: "",
    fechaNacimiento: "", edad: "", genero: "", estadoCivil: "",
    escolaridad: "", grupoSanguineo: "", grupoEtnico: "", identidadGenero: "",
    celular: "", telefono: "", email: "", residencia: "",
    zonaResidencia: "", estrato: "", tipoVivienda: "", numPersonasCargo: "",
    eps: "", arl: "", afp: "", nivelRiesgoARL: "",
    empresa: "", cargo: "", dependencia: "", tipoContrato: "",
    turnoTrabajo: "", antiguedadEmpresa: "",
    medicoId: "", tipoConsulta: "ingreso", fechaCita: "", horaCita: "",
    observacion: "", _busquedaQuery: "", _showSuggs: false,
  });
  const [agendaSuggs, setAgendaSuggs] = useState([]);
  const [agendaTab, setAgendaTab] = useState("hoy");
  const [agendaRecurrente, setAgendaRecurrente] = useState(false);
  const [agendaRecurrenciaPeriodo, setAgendaRecurrenciaPeriodo] = useState("3m");
  const [agendaSemanaOffset, setAgendaSemanaOffset] = useState(0);
  const [agendaMesOffset, setAgendaMesOffset] = useState(0);
  const [showComposeMensaje, setShowComposeMensaje] = useState(false);
  const [composeMensaje, setComposeMensaje] = useState({ destinatarios: [], texto: "" });

  // ── Refs ────────────────────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const fileInputSigRef = useRef(null);
  const csvInputRef = useRef(null);

  // ── Inactivity ──────────────────────────────────────────────────────
  const _inactivityRef = useRef(null);
  const _warnRef = useRef(null);
  const [inactivityWarning, setInactivityWarning] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(0);

  // ── Empresas tab ────────────────────────────────────────────────────
  const [companiesTab, setCompaniesTab] = useState("lista");
  const [editingCompany, setEditingCompany] = useState(null);

  // ── Caja por Médico ─────────────────────────────────────────────────
  const [cajaMedicoPeriodo, setCajaMedicoPeriodo] = useState("mes");
  const [porcentajeMedico, setPorcentajeMedico] = useState(60);

  // ── FASE 2: Multi-tenant / Orgs ─────────────────────────────────────
  const [medicoTurnoActivo, setMedicoTurnoActivo] = useState(() => {
    try { return localStorage.getItem("siso_medico_turno") || ""; }
    catch { return ""; }
  });
  const [orgsList, setOrgsList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("siso_orgs_list") || "null");
      if (saved && Array.isArray(saved)) return saved;
    } catch {}
    return [{ ...ORG_CONFIG_DEFAULT }];
  });
  const [activeOrgId, setActiveOrgId] = useState(ORG_DEFAULT_ID);
  const [superAdminTab, setSuperAdminTab] = useState("orgs");
  const [newOrgForm, setNewOrgForm] = useState({
    orgName: "", orgNit: "", adminUser: "", adminName: "", adminEmail: "", plan: "pro",
  });

  // ── Portal Empresa ──────────────────────────────────────────────────
  const [portalEmpresaCodigo, setPortalEmpresaCodigo] = useState("");
  const [portalEmpresaEncontrada, setPortalEmpresaEncontrada] = useState(null);
  const [portalEmpresaPacientes, setPortalEmpresaPacientes] = useState([]);
  const [portalEmpresaTab, setPortalEmpresaTab] = useState("trabajadores");
  const [portalEmpresaBuscando, setPortalEmpresaBuscando] = useState(false);
  const [portalEmpresaFiltroDoc, setPortalEmpresaFiltroDoc] = useState("");
  const [portalActivadoInfo, setPortalActivadoInfo] = useState(null);
  const [portalEmpresaAdmin, setPortalEmpresaAdmin] = useState(null);
  const [portalAdminTab, setPortalAdminTab] = useState("medicos");
  const [portalAdminLoginUser, setPortalAdminLoginUser] = useState("");
  const [portalAdminLoginPass, setPortalAdminLoginPass] = useState("");
  const [nuevoMedicoEmpForm, setNuevoMedicoEmpForm] = useState({
    nombre: "", user: "", pass: "", rol: "medico",
  });
  const [sedeForm, setSedeForm] = useState({ nombre: "", ciudad: "", direccion: "" });
  const [ipsCredForm, setIpsCredForm] = useState({
    nombre: "", user: "", pass: "", empresaId: null,
  });
  const [ipsEditingEmpId, setIpsEditingEmpId] = useState(null);

  // ── Sidebar ─────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════
  // DERIVED STATE
  // ═══════════════════════════════════════════════════════════════════════
  const activeDoctorData = currentUser?.doctorData || DEFAULT_DOCTOR_DATA;
  const activeSignature = currentUser?.doctorData?.signature || doctorSignature;
  const _cajaSaveTimer = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════
  const showAlert = (msg) => setAlertMsg(msg);
  const showConfirm = (msg, onConfirm) => setConfirmConfig({ msg, onConfirm });
  const showPrompt = (msg, onSubmit, type = "text") => {
    setPromptValue("");
    setPromptConfig({ msg, onSubmit, type });
  };

  // ── Audit Logging (Res. 1888/2025 RDA) ─────────────────────────────
  const logAccess = (accion, pacienteId, extra, seccion) => {
    const entrada = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      usuario: currentUser?.user || "sistema",
      nombreUsuario: currentUser?.name || "Sistema",
      rol: currentUser?.role || "desconocido",
      accion,
      seccion: seccion || extra || null,
      tipo: extra || null,
      pacienteId: pacienteId || null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent?.substring(0, 120) || "N/A" : "N/A",
      sesionId: currentUser?.sesionId || null,
    };
    setAuditLog((prev) => {
      const nuevo = [entrada, ...prev].slice(0, 1000);
      setTimeout(() => _sync("siso_audit_log", JSON.stringify(nuevo)), 0);
      return nuevo;
    });
  };

  // ── Patient Sync ────────────────────────────────────────────────────
  const _syncPatients = (list) => {
    const _suid = currentUser?.empresaId ? "empresa_" + currentUser.empresaId : currentUser?.user || "shared";
    const key = _patKey(_suid);
    const cloudKey = _patKeyCloud(_suid);
    _ls.setItem(key, JSON.stringify(list));
    _sbSet(cloudKey, list).then((ok) => {
      if (!ok) _sbQueue.pending[cloudKey] = list;
      setSyncStatus(ok ? "ok" : "error");
    });
  };

  // ── Company Sync ────────────────────────────────────────────────────
  const _syncCompanies = (list) => {
    const _suid2 = currentUser?.empresaId ? "empresa_" + currentUser.empresaId : currentUser?.user || "shared";
    const key = _compKey(_suid2);
    const cloudKey = _compKeyCloud(_suid2);
    _ls.setItem(key, JSON.stringify(list));
    _sbSet(cloudKey, list).then((ok) => {
      if (!ok) _sbQueue.pending[cloudKey] = list;
    });
  };

  // ── Caja Save (debounced) ───────────────────────────────────────────
  const saveCajaDebounced = useCallback((movs) => {
    if (_cajaSaveTimer.current) clearTimeout(_cajaSaveTimer.current);
    _cajaSaveTimer.current = setTimeout(() => {
      try {
        const suf = currentUser?.empresaId ? "empresa_" + currentUser.empresaId : currentUser?.user || "shared";
        localStorage.setItem(`siso_caja_${suf}`, JSON.stringify(movs));
        _sbSet(`siso_caja_movs_${suf}`, movs);
      } catch {}
    }, 800);
  }, [currentUser]);

  // ── Patient Visibility (FASE 2) ─────────────────────────────────────
  const canViewPatient = (p) => {
    if (!p || !currentUser) return false;
    if (currentUser.role === "super_admin") return true;
    const myOrgId = currentUser.orgId || ORG_DEFAULT_ID;
    if (p._orgId && p._orgId !== myOrgId) return false;
    if (_isAdmin(currentUser.role)) return true;
    if (currentUser.role === "admin_empresa") {
      if (!currentUser.empresaId) return false;
      const empA = companies.find((c) => c.id === currentUser.empresaId);
      return p.empresaId === currentUser.empresaId || (empA && p.empresaNit === empA.nit);
    }
    if (currentUser.role === "medico") {
      if (currentUser.empresaId) {
        const emp = companies.find((c) => c.id === currentUser.empresaId);
        return p.empresaId === currentUser.empresaId || (emp && p.empresaNit === emp.nit);
      }
      return true;
    }
    if (currentUser.role === "secretaria") {
      return _secretariaMedicoAsignado(currentUser, p._medicoId || "", usersList);
    }
    return false;
  };

  const isHcOwner = (p) => {
    if (!p || !currentUser) return false;
    if (currentUser.role === "super_admin") return true;
    if (_isAdmin(currentUser.role)) return true;
    return !p._medicoId || p._medicoId === currentUser.user;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════
  const _maybeExitHC = (proceed) => {
    if (view === "historia" && _hcDirty && (data.id || data.nombres)) {
      _setExitHcConfirm({ onProceed: proceed });
    } else {
      proceed();
    }
  };

  const _goToDirect = (newView) => {
    if (view === "historia" && data.nombres) {
      _ls.setItem("siso_active_form", JSON.stringify({ ...data, _autoSaved: new Date().toISOString() }));
    }
    if (newView === "dashboard") {
      const _activeUser = currentUser?.user;
      if (_activeUser) {
        const _suidGoTo = currentUser?.empresaId ? "empresa_" + currentUser.empresaId : _activeUser;
        const snPat = sp(_patKey(_suidGoTo), null);
        if (snPat !== null) setPatientsList(snPat);
        const snComp = sp(_compKey(_suidGoTo), null);
        if (snComp !== null) setCompanies(snComp);
      }
    }
    setNavStack((prev) => [...prev, view]);
    setView(newView);
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
      const filtered = prev.filter((v) => v !== "login");
      if (filtered.length === 0) { setView("dashboard"); return []; }
      const last = filtered[filtered.length - 1];
      setView(last);
      return filtered.slice(0, -1);
    });
  };

  const goBack = () => { _maybeExitHC(_goBackDirect); };

  // ═══════════════════════════════════════════════════════════════════════
  // PRIVACY HANDLER
  // ═══════════════════════════════════════════════════════════════════════
  const handleAceptarPrivacidad = () => {
    const registro = { fecha: new Date().toISOString(), version: "1.0" };
    _sync("siso_privacidad_aceptada", JSON.stringify(registro));
    setPrivacidadAceptada(true);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SAVE PATIENT HC
  // ═══════════════════════════════════════════════════════════════════════
  const handleSavePatient = () => {
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
    logAccess("Guardado", toSave.id, dataType);
  };

  // ── Open Patient ────────────────────────────────────────────────────
  const openPatient = (p) => {
    if (!canViewPatient(p)) {
      showAlert("⛔ No tiene permiso para ver esta historia clínica.");
      return;
    }
    setData(p);
    setDataType(p._dataType || "ocupacional");
    setActiveTab(p._dataType === "general" ? "formGeneral" : "form");
    _setHcDirty(false);
    logAccess("Apertura", p.id, p._dataType || "ocupacional");
    goTo("historia");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLE CHANGE
  // ═══════════════════════════════════════════════════════════════════════
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (view === "historia") _setHcDirty(true);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // AI ENGINE
  // ═══════════════════════════════════════════════════════════════════════
  const callAI = useCallback(async (prompt, expectJson = false) => {
    const systemPrompt = expectJson
      ? `Eres médico especialista en Medicina del Trabajo y Salud Ocupacional en Colombia. RESPONDE ÚNICAMENTE CON JSON VÁLIDO.`
      : `Eres médico especialista en Medicina del Trabajo y Salud Ocupacional en Colombia. Tu lenguaje es técnico, formal, directo.`;
    const PRIORITY_ORDER = ["gemini", "openrouter", "groq", "together"];
    const activeKey = aiConfig.activeProvider || "gemini";
    const fallbackOrder = [activeKey, ...PRIORITY_ORDER.filter((k) => k !== activeKey)]
      .filter((v, i, a) => a.indexOf(v) === i);
    let lastError = null;
    for (const providerKey of fallbackOrder) {
      const provider = AI_PROVIDERS[providerKey];
      if (!provider) continue;
      const key = aiConfig.keys?.[providerKey];
      if (!key || key === "auto") continue;
      try {
        const text = await provider.call(prompt, systemPrompt, key);
        if (text && text.trim().length > 10) {
          setAiStatus("ok");
          return text;
        }
      } catch (e) {
        console.warn(`[IA] ${providerKey} falló: ${e.message}`);
        lastError = e;
      }
    }
    setAiStatus("error");
    throw new Error(`⚠️ IA no disponible. Último error: ${lastError?.message || "sin respuesta"}`);
  }, [aiConfig]);

  // ── AI Config Save ──────────────────────────────────────────────────
  const handleSaveAIConfig = (cfg) => {
    setAiConfig(cfg);
    const uid = currentUser?.user || "default";
    const keysJson = JSON.stringify(cfg.keys || {});
    _ss.setItem("siso_ai_keys", keysJson);
    _ss.setItem("siso_ai_keys_" + uid, keysJson);
    _ls.setItem("siso_ai_keys_" + uid, keysJson);
    _ls.setItem("siso_ai_keys", keysJson);
    _sync("siso_ai_config_provider", JSON.stringify({ activeProvider: cfg.activeProvider }));
    _sbSet("siso_ai_keys_" + uid, cfg.keys || {});
    showAlert("✅ API Keys guardadas.");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIN HANDLER
  // ═══════════════════════════════════════════════════════════════════════
  const handleLogin = (u, p) => {
    if (_rl.isBlocked()) {
      showAlert(`⛔ Demasiados intentos fallidos. Intente de nuevo en ${_rl.getRemainingMin()} minuto(s).`);
      return;
    }
    _sha256(p).then(async (hash) => {
      // Verify with PBKDF2 or SHA-256 legacy
      let found = null;
      for (const x of usersList) {
        if (x.user === u) {
          const ok = await _verifyPassword(p, x.passHash, x.passSalt);
          if (ok) { found = x; break; }
        }
      }
      // Fallback to Supabase if not found locally
      if (!found) {
        try {
          const cloudData = await _sbGetAll();
          if (cloudData?.["siso_users"]?.value && Array.isArray(cloudData["siso_users"].value)) {
            const cloudUserList = cloudData["siso_users"].value;
            setUsersList(() => {
              _ls.setItem("siso_users", JSON.stringify(cloudUserList));
              return cloudUserList;
            });
            if (cloudData["siso_doctor_signature"]?.value) {
              setDoctorSignature(cloudData["siso_doctor_signature"].value);
              _ls.setItem("siso_doctor_signature", cloudData["siso_doctor_signature"].value);
            }
            if (cloudData["siso_companies"]?.value && Array.isArray(cloudData["siso_companies"].value)) {
              setCompanies(cloudData["siso_companies"].value);
              _ls.setItem("siso_companies", JSON.stringify(cloudData["siso_companies"].value));
            }
            for (const x of cloudUserList) {
              if (x.user === u) {
                const ok = await _verifyPassword(p, x.passHash, x.passSalt);
                if (ok) {
                  const dedicatedDD = cloudData[`siso_doctor_data_${x.user}`]?.value;
                  found = dedicatedDD && typeof dedicatedDD === "object"
                    ? { ...x, doctorData: { ...(x.doctorData || {}), ...dedicatedDD } }
                    : x;
                  break;
                }
              }
            }
            if (found) {
              const aiKeysCloud = cloudData[`siso_ai_keys_${found.user}`]?.value;
              if (aiKeysCloud && typeof aiKeysCloud === "object") {
                _ss.setItem("siso_ai_keys", JSON.stringify(aiKeysCloud));
                setAiConfig(prev => ({ ...prev, keys: aiKeysCloud }));
              }
            }
          }
        } catch (err) {
          console.warn("[SISO] Error en fallback Supabase login:", err);
        }
      }

      if (found && found.activo === false) {
        showAlert("⛔ Esta cuenta está desactivada.");
        return;
      }

      if (found) {
        // 2FA check
        if (found.twoFA?.enabled && found.twoFA?.secret) {
          setTwoFAStep({ foundUser: found });
          setTwoFAToken("");
          setTwoFAError("");
          return;
        }
        _completeLogin(found);
      } else {
        // Failed login — rate limiting
        setLoginAttempts((prev) => {
          const next = prev + 1;
          _ls.setItem("siso_login_attempts", String(next));
          if (next >= 5) {
            const blockedUntil = Date.now() + 15 * 60 * 1000;
            setLoginBlockedUntil(blockedUntil);
            _ls.setItem("siso_login_blocked_until", String(blockedUntil));
            showAlert("🔒 Acceso bloqueado por 15 minutos.");
          } else {
            showAlert(`⚠️ Credenciales incorrectas. Intentos: ${next}/5.`);
          }
          return next;
        });
      }
    });
  };

  // ── Complete Login (shared by normal and 2FA flows) ─────────────────
  const _completeLogin = (found) => {
    setLoginAttempts(0);
    _ls.removeItem("siso_login_attempts");
    _ls.removeItem("siso_login_blocked_until");

    const sesId = "SES-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const foundConOrg = found.orgId ? found : { ...found, orgId: ORG_DEFAULT_ID };
    const foundConSesion = { ...foundConOrg, sesionId: sesId };
    setCurrentUser(foundConSesion);

    _resetSessionTimer(() => {
      setCurrentUser(null);
      setView("login");
      _ls.removeItem("siso_session");
    });

    // Audit log
    const entrada = {
      id: Date.now(), fecha: new Date().toISOString(),
      usuario: found.user, nombreUsuario: found.name,
      rol: found.role, sesionId: sesId, accion: "Login",
      pacienteId: null, tipo: "Autenticación",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent?.substring(0, 120) : "N/A",
    };
    setAuditLog((prev) => {
      const n = [entrada, ...prev].slice(0, 500);
      setTimeout(() => _sync("siso_audit_log", JSON.stringify(n)), 0);
      return n;
    });

    // Load patient data (scoped by user/empresa)
    const _storageUserId = found.empresaId ? "empresa_" + found.empresaId : found.user;
    const userPatKey = _patKey(_storageUserId);
    const localPats = sp(userPatKey, []);

    // IPS migration
    if (found.empresaId) {
      const personalPats = sp(_patKey(found.user), []);
      if (personalPats.length > 0 && localPats.length === 0) {
        _ls.setItem(userPatKey, JSON.stringify(personalPats));
        setPatientsList(personalPats);
      } else if (personalPats.length > 0 && localPats.length > 0) {
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
      setPatientsList(localPats);
    }

    _ls.setItem("siso_active_form", "");

    // Load companies
    const userCompKey = _compKey(_storageUserId);
    let localComps = sp(userCompKey, []);
    if (found.empresaId && localComps.length === 0) {
      const allUsers = JSON.parse(_ls.getItem("siso_users") || "[]");
      const orgAdmins = allUsers.filter(
        (u) => u.orgId === found.orgId && (_isAdmin(u.role) || u.role === "super_admin")
      );
      for (const adm of orgAdmins) {
        const admComps = sp(_compKey(adm.user), []);
        if (admComps.length > 0) {
          const miEmpresa = admComps.filter((c) => c.id === found.empresaId);
          if (miEmpresa.length > 0) {
            localComps = miEmpresa;
            _ls.setItem(userCompKey, JSON.stringify(localComps));
            break;
          }
        }
      }
    }
    setCompanies(localComps);

    // Load scoped data
    const _loadScoped = (scopedKey, globalKey) => {
      const s = sp(scopedKey, null);
      if (s !== null) return s;
      const g = sp(globalKey, []);
      if (g.length > 0) { try { _ls.setItem(scopedKey, JSON.stringify(g)); } catch {} }
      return g;
    };
    setCajaMovimientos(_loadScoped(`siso_caja_${_storageUserId}`, "siso_caja"));
    setAgendados(_loadScoped(`siso_agendados_${_storageUserId}`, "siso_agendados"));
    setAtencionesCerradas(_loadScoped(`siso_atenciones_${_storageUserId}`, "siso_atenciones_cerradas"));
    setSavedBillsList(_loadScoped(`siso_saved_bills_${_storageUserId}`, "siso_saved_bills"));

    // Background Supabase sync
    _sbGetAll().then((cloud) => {
      if (!cloud) return;
      const cloudPats = cloud?.[_patKeyCloud(_storageUserId)]?.value;
      const currentLocalPats = sp(userPatKey, []);
      if (Array.isArray(cloudPats) && cloudPats.length >= currentLocalPats.length) {
        setPatientsList(cloudPats);
        _ls.setItem(userPatKey, JSON.stringify(cloudPats));
      }
      const cloudComps = cloud?.[_compKeyCloud(_storageUserId)]?.value;
      if (Array.isArray(cloudComps) && cloudComps.length >= localComps.length) {
        setCompanies(cloudComps);
        _ls.setItem(userCompKey, JSON.stringify(cloudComps));
      }
      // Restore AI keys
      const aiKeyCloud = cloud?.[`siso_ai_keys_${found.user}`]?.value;
      if (aiKeyCloud && typeof aiKeyCloud === "object" && Object.values(aiKeyCloud).some(v => v)) {
        _ss.setItem("siso_ai_keys", JSON.stringify(aiKeyCloud));
        _ls.setItem("siso_ai_keys_" + found.user, JSON.stringify(aiKeyCloud));
        setAiConfig((prev) => ({ ...prev, keys: { groq: "", gemini: "", openrouter: "", together: "", ...aiKeyCloud } }));
      }
      // Restore doctorData
      const doctorDataCloud = cloud?.[`siso_doctor_data_${found.user}`]?.value;
      const cloudUsersList = cloud?.["siso_users"]?.value;
      const cloudUserEntry = Array.isArray(cloudUsersList)
        ? cloudUsersList.find(u => u.user === found.user) : null;
      const mergedDoctorData = {
        ...(found.doctorData || {}),
        ...(cloudUserEntry?.doctorData || {}),
        ...(doctorDataCloud && typeof doctorDataCloud === "object" ? doctorDataCloud : {}),
      };
      if (mergedDoctorData.nombre || mergedDoctorData.licencia) {
        setCurrentUser((prev) => prev ? ({ ...prev, doctorData: mergedDoctorData }) : prev);
        setUsersList((prev) => {
          const updated = prev.map((u) =>
            u.user === found.user ? { ...u, doctorData: mergedDoctorData } : u
          );
          _ls.setItem("siso_users", JSON.stringify(updated));
          return updated;
        });
      }
      if (cloud?.["siso_doctor_signature"]?.value) {
        setDoctorSignature(cloud["siso_doctor_signature"].value);
        _ls.setItem("siso_doctor_signature", cloud["siso_doctor_signature"].value);
      }
    });

    // Navigate
    if (foundConSesion.mustChangePassword) {
      goTo("changePassword");
    } else {
      goTo("dashboard");
    }
  };

  // ── 2FA Verification ───────────────────────────────────────────────
  const handleVerify2FA = async () => {
    if (!twoFAStep) return;
    const { foundUser } = twoFAStep;
    const ok = await _totpVerify(foundUser.twoFA.secret, twoFAToken.trim());
    if (!ok) {
      setTwoFAError("❌ Código incorrecto.");
      setTwoFAToken("");
      return;
    }
    setTwoFAStep(null);
    setTwoFAError("");
    _completeLogin(foundUser);
  };

  // ── Logout ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    logAccess("Logout", null, "Cierre de sesión");
    _clearSessionTimer();
    setCurrentUser(null);
    setView("login");
    _ls.removeItem("siso_session");
    _ls.removeItem("siso_active_form");
    setData(initialOccupPatientState);
    _setHcDirty(false);
    setInactivityWarning(false);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MANUAL CLOUD SAVE
  // ═══════════════════════════════════════════════════════════════════════
  const handleManualCloudSave = async () => {
    setSyncStatus("syncing");
    const _bkSuf = currentUser?.empresaId ? "empresa_" + currentUser.empresaId : currentUser?.user || "shared";
    const tasks = [
      _sbSet(_patKeyCloud(currentUser?.user || "shared"), patientsList),
      _sbSet(_compKeyCloud(currentUser?.user || "shared"), companies),
      _sbSet("siso_users", usersList),
      _sbSet(`siso_saved_bills_${_bkSuf}`, savedBillsList),
      _sbSet("siso_saved_reports", savedReports),
      _sbSet("siso_audit_log", auditLog),
      _sbSet("siso_mensajes", mensajes),
      _sbSet(`siso_agendados_${_bkSuf}`, agendados),
      _sbSet(`siso_atenciones_${_bkSuf}`, atencionesCerradas),
      _sbSet("siso_ai_config_provider", { activeProvider: aiConfig.activeProvider }),
    ];
    if (doctorSignature) tasks.push(_sbSet("siso_doctor_signature", doctorSignature));
    if (currentUser?.doctorData && currentUser?.user)
      tasks.push(_sbSet(`siso_doctor_data_${currentUser.user}`, currentUser.doctorData));
    const results = await Promise.all(tasks);
    const allOk = results.every(Boolean);
    setSyncStatus(allOk ? "ok" : "error");
    await _sbQueue.flush();
    showAlert(allOk ? "✅ Sincronizado con la nube." : "⚠️ Algunos datos no se sincronizaron.");
  };

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS — Data Loading
  // ═══════════════════════════════════════════════════════════════════════

  // ── Initial data load from localStorage + Supabase ──────────────────
  useEffect(() => {
    const sessionUser = (() => {
      try { return JSON.parse(_ls.getItem("siso_session") || "null")?.user; }
      catch { return null; }
    })();
    setCompanies(sp(_compKey(sessionUser || "shared"), []));
    if (sessionUser) setPatientsList(sp(_patKey(sessionUser), []));

    // Load users
    const storedUsers = sp("siso_users", null);
    if (storedUsers && Array.isArray(storedUsers) && storedUsers.length > 0) {
      const fixed = storedUsers.map((u) => {
        const init = initialUsers.find((i) => i.user === u.user);
        if (!u.passHash && init) return { ...u, passHash: init.passHash, mustChangePassword: true };
        if (init && init.doctorData?.nombre && !u.doctorData?.nombre)
          return { ...u, doctorData: { ...init.doctorData, ...(u.doctorData || {}) } };
        return u;
      });
      setUsersList(fixed);
      setUsersReady(true);
    } else {
      // Empty cache — wait for Supabase
      (async () => {
        try {
          const cloud = await Promise.race([
            _sbGetAll(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
          ]);
          if (cloud?.["siso_users"]?.value && Array.isArray(cloud["siso_users"].value) && cloud["siso_users"].value.length > 0) {
            let cloudUsers = cloud["siso_users"].value;
            cloudUsers = cloudUsers.map(u => {
              const dedicatedDD = cloud[`siso_doctor_data_${u.user}`]?.value;
              if (dedicatedDD && typeof dedicatedDD === "object")
                return { ...u, doctorData: { ...(u.doctorData || {}), ...dedicatedDD } };
              return u;
            });
            setUsersList(cloudUsers);
            _ls.setItem("siso_users", JSON.stringify(cloudUsers));
            if (cloud["siso_doctor_signature"]?.value) {
              setDoctorSignature(cloud["siso_doctor_signature"].value);
              _ls.setItem("siso_doctor_signature", cloud["siso_doctor_signature"].value);
            }
            if (cloud["siso_companies"]?.value && Array.isArray(cloud["siso_companies"].value)) {
              setCompanies(cloud["siso_companies"].value);
              _ls.setItem("siso_companies", JSON.stringify(cloud["siso_companies"].value));
            }
          } else {
            setUsersList(initialUsers);
          }
        } catch {
          setUsersList(initialUsers);
        } finally {
          setUsersReady(true);
        }
      })();
    }

    setSavedReports(sp("siso_saved_reports", []));
    setMensajes(sp("siso_mensajes", []));

    // Load scoped data from previous session
    const _initSess = (() => {
      try { return JSON.parse(_ls.getItem("siso_session") || "{}"); }
      catch { return {}; }
    })();
    const _initSuf = _initSess?.empresaId ? "empresa_" + _initSess.empresaId : _initSess?.user || "shared";
    setAgendados(sp(`siso_agendados_${_initSuf}`, null) ?? sp("siso_agendados", []));
    setAtencionesCerradas(sp(`siso_atenciones_${_initSuf}`, null) ?? sp("siso_atenciones_cerradas", []));
    setSavedBillsList(sp(`siso_saved_bills_${_initSuf}`, null) ?? sp("siso_saved_bills", []));
    setDoctorSignature(_ls.getItem("siso_doctor_signature") || null);

    // AI keys
    const emptyKeys = { groq: "", gemini: "", openrouter: "", together: "" };
    const savedProvider = sp("siso_ai_config_provider", { activeProvider: "gemini" });
    const _initUser = (() => { try { return JSON.parse(_ls.getItem("siso_session") || "null")?.user; } catch { return null; } })();
    const savedKeysLS = _initUser ? sp("siso_ai_keys_" + _initUser, null) : null;
    const savedKeysSS = sps("siso_ai_keys", emptyKeys);
    const savedKeys = savedKeysLS || savedKeysSS;
    setAiConfig({ activeProvider: savedProvider.activeProvider || "gemini", keys: { ...emptyKeys, ...savedKeys } });

    // Supabase background sync
    setSyncStatus("loading");
    _sbGetAll().then((cloud) => {
      if (!cloud) { setSyncStatus("error"); return; }
      const applyCloud = (key, setter, localKey) => {
        if (!cloud[key]) return;
        const cloudVal = cloud[key].value;
        if (cloudVal !== null && cloudVal !== undefined) {
          _ls.setItem(localKey || key, JSON.stringify(cloudVal));
          setter(Array.isArray(cloudVal) ? cloudVal : cloudVal);
        }
      };
      applyCloud("siso_saved_bills", setSavedBillsList, "siso_saved_bills");
      applyCloud("siso_saved_reports", setSavedReports, "siso_saved_reports");
      applyCloud("siso_audit_log", setAuditLog, "siso_audit_log");
      applyCloud("siso_mensajes", setMensajes, "siso_mensajes");
      applyCloud("siso_agendados", setAgendados, "siso_agendados");
      applyCloud("siso_atenciones_cerradas", setAtencionesCerradas, "siso_atenciones_cerradas");

      // Users from cloud
      if (cloud["siso_users"]?.value && Array.isArray(cloud["siso_users"].value) && cloud["siso_users"].value.length > 0) {
        const cloudUsers = cloud["siso_users"].value;
        setUsersList((prev) => {
          const merged = prev.map((localUser) => {
            const cloudVersion = cloudUsers.find((cu) => cu.user === localUser.user);
            return cloudVersion ? { ...localUser, ...cloudVersion, id: localUser.id || cloudVersion.id } : localUser;
          });
          cloudUsers.forEach((cu) => {
            if (!merged.find((u) => u.user === cu.user)) merged.push(cu);
          });
          _ls.setItem("siso_users", JSON.stringify(merged));
          return merged;
        });
      }
      if (cloud["siso_doctor_signature"]?.value) {
        setDoctorSignature(cloud["siso_doctor_signature"].value);
        _ls.setItem("siso_doctor_signature", cloud["siso_doctor_signature"].value);
      }
      if (cloud["siso_ai_config_provider"]?.value) {
        const prov = cloud["siso_ai_config_provider"].value;
        setAiConfig((prev) => ({ ...prev, activeProvider: prov.activeProvider || prev.activeProvider }));
      }
      setSyncStatus("ok");
      _sbQueue.flush();
    });
  }, []);

  // ── Sync status callback ────────────────────────────────────────────
  useEffect(() => {
    setSyncStatusCallback(setSyncStatus);
    return () => setSyncStatusCallback(null);
  }, []);

  // ── Portal deep-links ───────────────────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#portaltrabajador" || hash === "#portal") {
      history.replaceState(null, "", window.location.pathname);
      setShowPortalPublico(true);
    }
    if (hash.startsWith("#portalempresa")) {
      const params = new URLSearchParams(hash.replace("#portalempresa", "").replace("?", ""));
      const code = params.get("code");
      if (code) setPortalEmpresaCodigo(code);
      history.replaceState(null, "", window.location.pathname);
      setView("portalempresa");
    }
  }, []);

  // ── Auto-save HC every 2 minutes ────────────────────────────────────
  useEffect(() => {
    if (!currentUser || view !== "historia") return;
    const timer = setInterval(() => {
      if (data.id && data.nombres) {
        const toSave = { ...data, fechaExamen: data.fechaExamen || new Date().toISOString().split("T")[0], _autoSaved: new Date().toISOString() };
        const list = [...patientsList];
        const idx = list.findIndex((p) => p.id === toSave.id);
        if (idx >= 0) list[idx] = toSave; else list.push(toSave);
        setPatientsList(list);
        _syncPatients(list);
        setSaveStatus("auto");
        setTimeout(() => setSaveStatus(""), 2000);
      }
    }, 120000);
    return () => clearInterval(timer);
  }, [currentUser, view, data, patientsList]);

  // ── Beforeunload warning ────────────────────────────────────────────
  useEffect(() => {
    if (!_hcDirty || view !== "historia") return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [_hcDirty, view]);

  // ── Local autosave every 15s ────────────────────────────────────────
  useEffect(() => {
    if (view !== "historia" || !data.nombres) return;
    const timer = setInterval(() => {
      _ls.setItem("siso_active_form", JSON.stringify({ ...data, _autoSaved: new Date().toISOString(), _userId: currentUser?.user }));
    }, 15000);
    return () => clearInterval(timer);
  }, [view, data, currentUser]);

  // ── Auto-IMC ────────────────────────────────────────────────────────
  useEffect(() => {
    if (data.peso && data.talla) {
      const p = parseFloat(data.peso), t = parseFloat(data.talla) / 100;
      if (t > 0) setData((prev) => ({ ...prev, imc: (p / (t * t)).toFixed(2) }));
    }
  }, [data.peso, data.talla]);

  // ── Auto-sync to Supabase every 2 minutes ───────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const doAutoBackup = async () => {
      try {
        setSyncStatus("syncing");
        const _asSuf = currentUser?.empresaId ? "empresa_" + currentUser.empresaId : currentUser?.user || "shared";
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
          _sbSet("siso_ai_config_provider", { activeProvider: aiConfig.activeProvider }),
        ];
        if (doctorSignature) tasks.push(_sbSet("siso_doctor_signature", doctorSignature));
        if (currentUser?.doctorData && currentUser?.user)
          tasks.push(_sbSet(`siso_doctor_data_${currentUser.user}`, currentUser.doctorData));
        const results = await Promise.all(tasks);
        setSyncStatus(results.every(Boolean) ? "ok" : "error");
        await _sbQueue.flush();
      } catch { setSyncStatus("error"); }
    };
    const timer = setInterval(doAutoBackup, 2 * 60 * 1000);
    return () => clearInterval(timer);
  }, [currentUser, patientsList, companies, usersList, savedReports, savedBillsList, aiConfig, doctorSignature, agendados, atencionesCerradas, mensajes]);

  // ── Session persistence ─────────────────────────────────────────────
  useEffect(() => {
    if (currentUser && view !== "login") {
      _ls.setItem("siso_session", JSON.stringify({
        user: currentUser.user, empresaId: currentUser.empresaId || null,
        view, navStack, activeTab, dataType,
      }));
    } else if (!currentUser) {
      _ls.removeItem("siso_session");
      _ls.removeItem("siso_active_form");
    }
  }, [currentUser, view, navStack, activeTab, dataType]);

  // ── Session timeout (30 min inactivity) ─────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const resetTimer = () => _resetSessionTimer(() => {
      showAlert("⏰ Sesión expirada por inactividad (30 minutos).");
      setCurrentUser(null);
      _ls.removeItem("siso_session");
      setView("login");
    });
    resetTimer();
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    return () => {
      _clearSessionTimer();
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [currentUser]);

  // ── Inactivity warning (30 min with 1 min countdown) ───────────────
  const _TIMEOUT_MS = 30 * 60 * 1000;
  const _WARN_MS = 29 * 60 * 1000;
  const _resetInactivity = useCallback(() => {
    setInactivityWarning(false);
    clearTimeout(_inactivityRef.current);
    clearTimeout(_warnRef.current);
    if (!currentUser) return;
    _warnRef.current = setTimeout(() => {
      setInactivityWarning(true);
      let secs = 60;
      setInactivityCountdown(secs);
      const cd = setInterval(() => { secs--; setInactivityCountdown(secs); if (secs <= 0) clearInterval(cd); }, 1000);
    }, _WARN_MS);
    _inactivityRef.current = setTimeout(() => {
      setCurrentUser(null); setView("login"); setInactivityWarning(false);
      _ls.removeItem("siso_session"); _ls.removeItem("siso_active_form");
      showAlert("⏱️ Sesión cerrada por inactividad (30 min).");
    }, _TIMEOUT_MS);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, _resetInactivity, { passive: true }));
    _resetInactivity();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, _resetInactivity));
      clearTimeout(_inactivityRef.current);
      clearTimeout(_warnRef.current);
    };
  }, [currentUser, _resetInactivity]);

  // ── Form data persistence ───────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || view !== "historia") return;
    if (data && (data.nombres || data.id)) {
      _ls.setItem("siso_active_form", JSON.stringify(data));
    }
  }, [data, currentUser, view]);

  // ── Auto-expand textareas ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "TEXTAREA") {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
      }
    };
    document.addEventListener("input", handler);
    return () => document.removeEventListener("input", handler);
  }, []);

  // ── Bill amount words ───────────────────────────────────────────────
  useEffect(() => {
    if (billData.amount)
      setBillData((p) => ({ ...p, amountWords: numeroALetras(billData.amount).toLowerCase() + " pesos mcte" }));
    else
      setBillData((p) => ({ ...p, amountWords: "" }));
  }, [billData.amount]);

  // ── IPS Profile load ────────────────────────────────────────────────
  useEffect(() => {
    if (view !== "perfilips" || currentUser?.role !== "admin_empresa") return;
    const me = companies.find((c) => c.id === currentUser.empresaId) || {};
    setIpsPerfilForm({
      nombre: me.nombre || "", nit: me.nit || "", dv: me.dv || "",
      direccion: me.direccion || "", ciudad: me.ciudad || "",
      telefono: me.telefono || "", correo: me.correo || "",
      actividad: me.actividad || "", lema: me.lema || "", logo: me.logo || "",
    });
  }, [view, currentUser?.empresaId, companies]);

  // ═══════════════════════════════════════════════════════════════════════
  // CALLBACK FUNCTIONS FOR PAGES
  // ═══════════════════════════════════════════════════════════════════════

  // Historia callbacks
  const handleDataChange = useCallback((e) => {
    if (e && e.target) {
      const { name, value, type, checked } = e.target;
      setData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
      _setHcDirty(true);
    }
  }, []);

  const handleNewPatient = useCallback(() => {
    const newState = dataType === 'general' ? { ...initialGeneralPatientState } : { ...initialOccupPatientState };
    newState.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    newState.fechaExamen = new Date().toISOString().split('T')[0];
    newState.fechaRegistro = new Date().toISOString();
    newState._medicoId = currentUser?.user;
    setData(newState);
    _setHcDirty(false);
    setActiveTab('form');
  }, [dataType, currentUser]);

  const handleSelectPatient = useCallback((patient) => {
    setData({ ...(dataType === 'general' ? initialGeneralPatientState : initialOccupPatientState), ...patient });
    setActiveTab('form');
    _setHcDirty(false);
  }, [dataType]);

  const handleSaveHC = useCallback(() => {
    if (!data || !data.nombres) { setAlertMsg('Complete al menos el nombre del paciente'); return; }
    const storageUserId = currentUser?.empresaId ? 'empresa_' + currentUser.empresaId : currentUser?.user;
    const key = _patKey(storageUserId);
    const existing = sp(key, []);
    let updated;
    if (data.id && existing.find(p => p.id === data.id)) {
      updated = existing.map(p => p.id === data.id ? { ...data, _medicoId: currentUser?.user, _lastModified: new Date().toISOString() } : p);
    } else {
      const newData = { ...data, id: data.id || Date.now().toString(36) + Math.random().toString(36).substr(2,5), _medicoId: currentUser?.user, _lastModified: new Date().toISOString() };
      updated = [newData, ...existing];
      setData(newData);
    }
    _sync(key, JSON.stringify(updated));
    setPatientsList(updated);
    setSaveStatus('✅ Guardado');
    _setHcDirty(false);
    setTimeout(() => setSaveStatus(''), 2000);
  }, [data, currentUser]);

  const handlePrintHC = useCallback(() => { window.print(); }, []);

  const handleShowHistory = useCallback(() => {
    if (!data?.docNumero) return;
    const storageUserId = currentUser?.empresaId ? 'empresa_' + currentUser.empresaId : currentUser?.user;
    const key = _patKey(storageUserId);
    const all = sp(key, []);
    const records = all.filter(p => p.docNumero === data.docNumero);
    setHistoryRecords(records);
    setShowHistoryModal(true);
  }, [data, currentUser]);

  const handleCompanySelect = useCallback((companyId) => {
    const comp = companies.find(c => c.id === companyId || c.nit === companyId);
    if (comp) {
      setData(prev => ({
        ...prev,
        empresaId: comp.id || comp.nit,
        empresaNombre: comp.nombre,
        empresaNit: comp.nit,
        arl: comp.arl || prev.arl,
      }));
    }
  }, [companies]);

  const handleNameChange = useCallback((e) => {
    const value = e.target.value;
    setData(prev => ({ ...prev, nombres: value }));
    _setHcDirty(true);
    if (value.length >= 2) {
      const storageUserId = currentUser?.empresaId ? 'empresa_' + currentUser.empresaId : currentUser?.user;
      const key = _patKey(storageUserId);
      const all = sp(key, []);
      const suggs = all.filter(p =>
        p.nombres?.toLowerCase().includes(value.toLowerCase()) ||
        p.docNumero?.includes(value)
      ).slice(0, 5);
      setPatientSuggestions(suggs);
    } else {
      setPatientSuggestions([]);
    }
  }, [currentUser]);

  // Users callbacks
  const handleAddUser = useCallback(async (newUser) => {
    const hash = await _sha256(newUser.pass);
    const user = { ...newUser, id: Date.now(), passHash: hash, pass: undefined, activo: true };
    const updated = [...usersList, user];
    setUsersList(updated);
    _sync('siso_users', JSON.stringify(updated));
  }, [usersList]);

  const handleEditUser = useCallback((userId, changes) => {
    const updated = usersList.map(u => u.id === userId ? { ...u, ...changes } : u);
    setUsersList(updated);
    _sync('siso_users', JSON.stringify(updated));
  }, [usersList]);

  const handleDeleteUser = useCallback((userId) => {
    const updated = usersList.map(u => u.id === userId ? { ...u, activo: false } : u);
    setUsersList(updated);
    _sync('siso_users', JSON.stringify(updated));
  }, [usersList]);

  // ═══════════════════════════════════════════════════════════════════════
  // COLLECTED PROPS — all state bundled for page components
  // ═══════════════════════════════════════════════════════════════════════
  const appState = {
    // Core
    view, setView, navStack, currentUser, setCurrentUser,
    loginAttempts, loginBlockedUntil, privacidadAceptada,
    syncStatus, setSyncStatus, alertMsg, setAlertMsg,
    confirmConfig, setConfirmConfig, promptConfig, setPromptConfig, promptValue, setPromptValue,
    // AI
    aiConfig, setAiConfig, showAIConfig, setShowAIConfig, aiStatus, setAiStatus, callAI,
    handleSaveAIConfig,
    // Data
    companies, setCompanies, usersList, setUsersList, usersReady,
    patientsList, setPatientsList, savedReports, setSavedReports,
    savedBills, setSavedBills, atencionesCerradas, setAtencionesCerradas,
    doctorSignature, setDoctorSignature, auditLog, setAuditLog,
    // HC
    activeTab, setActiveTab, data, setData, dataType, setDataType,
    isGenerating, setIsGenerating, isGeneratingRestr, setIsGeneratingRestr,
    isGeneratingReco, setIsGeneratingReco,
    saveStatus, setSaveStatus, _hcDirty, _setHcDirty,
    _exitHcConfirm, _setExitHcConfirm,
    patientSuggestions, setPatientSuggestions,
    historyNotification, setHistoryNotification,
    showRestriccionesPanel, setShowRestriccionesPanel,
    showRecomendacionesPanel, setShowRecomendacionesPanel,
    showHistoryModal, setShowHistoryModal,
    ripsModalData, setRipsModalData, backupModalData, setBackupModalData,
    hcChoiceAgenda, setHcChoiceAgenda,
    historyRecords, setHistoryRecords,
    patientSearchTerm, setPatientSearchTerm, genPatSearch, setGenPatSearch,
    printPreview, setPrintPreview,
    examSearch, setExamSearch, examList, setExamList,
    showExamSuggs, setShowExamSuggs,
    diagExamen, setDiagExamen, justExamen, setJustExamen,
    // Reports
    selectedCompanyReport, setSelectedCompanyReport,
    reporteActiveTab, setReporteActiveTab, certSelected, setCertSelected,
    reportStartDate, setReportStartDate, reportEndDate, setReportEndDate,
    reportAIResult, setReportAIResult,
    isGeneratingReport, setIsGeneratingReport,
    showExportTable, setShowExportTable,
    precioPorPaciente, setPrecioPorPaciente,
    selectedMedicoReport, setSelectedMedicoReport,
    // Billing
    showDianPanel, setShowDianPanel,
    showSecretariaPatientModal, setShowSecretariaPatientModal,
    showTodoChecklist, setShowTodoChecklist, todoSelection, setTodoSelection,
    dianProvider, setDianProvider, dianApiKey, setDianApiKey,
    billData, setBillData, savedBillsList, setSavedBillsList,
    // Portafolio
    portafolioItems, setPortafolioItems, portafolioForm, setPortafolioForm,
    portafolioEditId, setPortafolioEditId,
    // Cotizaciones
    cotizaciones, setCotizaciones, cotizacionForm, setCotizacionForm,
    cotizacionView, setCotizacionView, cotizacionSelId, setCotizacionSelId,
    // Caja
    cajaMovimientos, setCajaMovimientos, cajaForm, setCajaForm, cajaTab, setCajaTab,
    cajaFiltroPeriodo, setCajaFiltroPeriodo,
    cajaFiltroDesde, setCajaFiltroDesde, cajaFiltroHasta, setCajaFiltroHasta,
    contabTab, setContabTab, contabPeriodo, setContabPeriodo,
    asistenciaFecha, setAsistenciaFecha,
    // Evoluciones
    evolucionForm, setEvolucionForm, showEvolucionModal, setShowEvolucionModal,
    // Packages
    selectedPackage, setSelectedPackage, packageChecklist, setPackageChecklist,
    showPackages, setShowPackages, newComp, setNewComp,
    // IPS
    ipsPerfilForm, setIpsPerfilForm, verificationCode, setVerificationCode,
    verificationFound, setVerificationFound,
    activeUserMgmtTab, setActiveUserMgmtTab,
    pendingActivationPlan, setPendingActivationPlan,
    sbCloudData, setSbCloudData, sbLoading, setSbLoading,
    // User management
    newUserForm, setNewUserForm, userEditId, setUserEditId, editForm, setEditForm,
    // Propuestas
    propForm, setPropForm, selSvc, setSelSvc, propModulo, setPropModulo,
    // Mensajería
    mensajes, setMensajes, showMensajePanel, setShowMensajePanel,
    showConsentModal, setShowConsentModal,
    // 2FA
    twoFAStep, setTwoFAStep, twoFAToken, setTwoFAToken, twoFAError, setTwoFAError,
    // Habeas
    habeasRequests, setHabeasRequests, showHabeasModal, setShowHabeasModal,
    habeasForm, setHabeasForm,
    // Portal
    showPortalPublico, setShowPortalPublico,
    portalCodigo, setPortalCodigo, portalPaciente, setPortalPaciente,
    portalMultiple, setPortalMultiple,
    // AI Resumen
    aiResumen, setAiResumen, aiCargando, setAiCargando,
    // ARL
    arlTab, setArlTab, arlForm, setArlForm, arlGuardados, setArlGuardados,
    // SVE
    svePrograma, setSvePrograma, sveFiltroEmpresa, setSveFiltroEmpresa,
    sveAIAnalisis, setSveAIAnalisis, sveAICargando, setSveAIAnalisisCargando,
    sveAIFiltroEmpresa, setSveAIFiltroEmpresa,
    // Notifications
    showNotifModal, setShowNotifModal, notifData, setNotifData,
    // Epidemiología
    epiEmpresa, setEpiEmpresa, epiPeriodo, setEpiPeriodo, epiTab, setEpiTab,
    // Telemedicina
    teleconsultas, setTeleconsultas, teleForm, setTeleForm,
    teleSalaActiva, setTeleSalaActiva, teleTab, setTeleTab,
    teleEspera, setTeleEspera, mensajeRespuesta, setMensajeRespuesta,
    // Agenda
    agendados, setAgendados, showAgenda, setShowAgenda,
    agendaForm, setAgendaForm, agendaSuggs, setAgendaSuggs,
    agendaTab, setAgendaTab, agendaRecurrente, setAgendaRecurrente,
    agendaRecurrenciaPeriodo, setAgendaRecurrenciaPeriodo,
    agendaSemanaOffset, setAgendaSemanaOffset, agendaMesOffset, setAgendaMesOffset,
    showComposeMensaje, setShowComposeMensaje, composeMensaje, setComposeMensaje,
    // Refs
    fileInputRef, fileInputSigRef, csvInputRef,
    // Inactivity
    inactivityWarning, setInactivityWarning, inactivityCountdown,
    // Companies
    companiesTab, setCompaniesTab, editingCompany, setEditingCompany,
    // Caja medico
    cajaMedicoPeriodo, setCajaMedicoPeriodo, porcentajeMedico, setPorcentajeMedico,
    // Multi-tenant
    medicoTurnoActivo, setMedicoTurnoActivo, orgsList, setOrgsList,
    activeOrgId, setActiveOrgId, superAdminTab, setSuperAdminTab,
    newOrgForm, setNewOrgForm,
    // Portal empresa
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
    sedeForm, setSedeForm, ipsCredForm, setIpsCredForm, ipsEditingEmpId, setIpsEditingEmpId,
    // Derived
    activeDoctorData, activeSignature,
    // Functions
    showAlert, showConfirm, showPrompt, logAccess,
    goTo, goBack, handleChange, handleSavePatient, openPatient,
    handleLogin, handleLogout, handleManualCloudSave,
    _syncPatients, _syncCompanies, saveCajaDebounced,
    canViewPatient, isHcOwner, _resetInactivity,
    // HC Callbacks
    onDataChange: handleDataChange,
    onNewPatient: handleNewPatient,
    onSelectPatient: handleSelectPatient,
    onSave: handleSaveHC,
    onPrint: handlePrintHC,
    onShowHistory: handleShowHistory,
    handleCompanySelect,
    handleNameChange,
    selectPatientSuggestion: handleSelectPatient,
    // User callbacks
    onAddUser: handleAddUser,
    onEditUser: handleEditUser,
    onDeleteUser: handleDeleteUser,
    // Computed helpers
    canUseSGSST: !!(currentUser && typeof _canUse === 'function'),
    // Plan helpers
    _canUse, _contarHC, _isAdmin, _isAdminEmpresa, _isAdminOrEmpresa,
    _secretariaPuede, _secretariaMedicoAsignado,
    _patKey, _patKeyCloud, _compKey, _compKeyCloud,
    _sync, _sbSet, _sbGetAll, _sbDelete, _sbQueue,
    initialOccupPatientState, initialGeneralPatientState,
    initialUsers, initialCompanyState,
    SECRETARIA_PERMISOS_DEFAULT,
    ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT,
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  // ── Privacy gate ────────────────────────────────────────────────────
  if (!privacidadAceptada) return <PrivacyModal onAccept={handleAceptarPrivacidad} />;

  // ── Login screen ────────────────────────────────────────────────────
  if (view === "login") {
    if (!usersReady) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-96 p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Cloud className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
            <h2 className="text-lg font-black text-gray-800 mb-2">Conectando...</h2>
            <p className="text-sm text-gray-500">Restaurando datos desde la nube</p>
            <div className="mt-4 flex justify-center"><Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /></div>
          </div>
        </div>
      );
    }
    if (twoFAStep) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-xl font-black text-white">Verificación 2FA</h1>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 text-center">Ingrese el código de 6 dígitos</p>
              <input type="text" inputMode="numeric" maxLength={6} value={twoFAToken}
                onChange={(e) => { setTwoFAToken(e.target.value.replace(/\D/g, "")); setTwoFAError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerify2FA(); }}
                placeholder="000000"
                className="w-full p-3 border-2 border-indigo-200 rounded-xl text-center text-3xl font-black tracking-[0.5em] focus:border-indigo-500 focus:outline-none"
                autoFocus />
              {twoFAError && <p className="text-red-600 text-xs text-center font-bold">{twoFAError}</p>}
              <button onClick={handleVerify2FA} disabled={twoFAToken.length !== 6}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-sm rounded-xl">
                ✅ Verificar código
              </button>
              <button onClick={() => { setTwoFAStep(null); setTwoFAToken(""); setTwoFAError(""); }}
                className="w-full py-2 text-gray-500 text-xs hover:text-gray-700">
                ← Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <LoginForm onLogin={handleLogin} blockedUntil={loginBlockedUntil} attempts={loginAttempts} />;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // AUTHENTICATED VIEW
  // ═══════════════════════════════════════════════════════════════════════
  const renderCurrentView = () => {
    const props = appState;
    switch (view) {
      case "dashboard": return <Dashboard {...props} />;
      case "superadmin": return <Dashboard {...props} />; // TODO: SuperAdmin page
      case "planes": return <Planes {...props} />;
      case "portaltrabajador": return <WorkerPortal {...props} />;
      case "portalempresa": return <WorkerPortal {...props} mode="empresa" />;
      case "habeasdata": return <Dashboard {...props} />;
      case "arl": return <SGSST {...props} mode="arl" />;
      case "sve": return <SGSST {...props} mode="sve" />;
      case "telemedicina": return <Telemedicine {...props} />;
      case "agenda": return <Agenda {...props} />;
      case "asistencia": return <Agenda {...props} mode="asistencia" />;
      case "patients": return <Historia {...props} mode="list" />;
      case "changePassword":
        return <ChangePasswordForm currentUser={currentUser} usersList={usersList}
          setUsersList={setUsersList} setCurrentUser={setCurrentUser}
          _sync={_sync} _patKey={_patKey} goTo={goTo} showAlert={showAlert} />;
      case "companies": return <Companies {...props} />;
      case "reporte": return <Reporte {...props} />;
      case "bill": return <Bill {...props} />;
      case "verification": return <Dashboard {...props} />;
      case "users": return <UsersPage {...props} />;
      case "portafolio": return <Bill {...props} mode="portafolio" />;
      case "caja": return <Caja {...props} />;
      case "perfilips": return <Companies {...props} mode="perfilips" />;
      case "contabilidad": return <Caja {...props} mode="contabilidad" />;
      case "cotizaciones": return <Bill {...props} mode="cotizaciones" />;
      case "propuestas": return <Bill {...props} mode="propuestas" />;
      case "historia": return <Historia {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  // ── Filter nav items by role ────────────────────────────────────────
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.roles.includes('all')) return true;
    if (!currentUser?.role) return false;
    if (!item.roles.includes(currentUser.role)) return false;
    if (item.perm && currentUser.role === 'secretaria') {
      return _secretariaPuede(item.perm, currentUser, usersList);
    }
    return true;
  });

  // ── Sync status display ─────────────────────────────────────────────
  const _syncBg = syncStatus === "ok" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : (syncStatus === "syncing" || syncStatus === "loading") ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-red-50 text-red-500 border-red-200";
  const _syncTxt = syncStatus === "ok" ? "Nube ✓"
    : syncStatus === "syncing" ? "Sync..."
    : syncStatus === "loading" ? "Cargando..."
    : "Sin nube";
  const _agN = agendados.filter(
    (a) => a.fecha === new Date().toISOString().split("T")[0] && a.estado === "espera"
      && (currentUser?.role !== "medico" || a.medicoId === currentUser?.user)
  ).length;
  const _noLeidos = mensajes.filter(
    (m) => m.destinatarios?.includes(currentUser?.user) && !m.leido
  ).length;

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* ═══ SIDEBAR ═══ */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 shadow-sm transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer" onClick={() => goTo("dashboard")}>
          <BrandLogo data={activeDoctorData} />
          <div className="leading-tight overflow-hidden">
            <p className="text-sm font-black text-gray-800 truncate">{activeDoctorData?.nombre || "SISO OcupaSalud"}</p>
            {activeDoctorData?.titulo && <p className="text-[10px] text-teal-600 truncate">{activeDoctorData.titulo}</p>}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button key={item.id}
                onClick={() => { goTo(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                  isActive ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.id === 'agenda' && _agN > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{_agN}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Sidebar footer ── */}
        <div className="p-3 border-t border-gray-100 space-y-2">
          <button onClick={handleManualCloudSave}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition ${_syncBg}`}>
            <Cloud className="w-3.5 h-3.5" /> {_syncTxt}
          </button>
          <button onClick={() => setShowAIConfig(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 border border-gray-200">
            <BrainCircuit className="w-3.5 h-3.5" /> ⚙️ IA
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200">
            <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
          </button>
          <p className="text-[9px] text-gray-400 text-center">
            {currentUser?.name} · {currentUser?.role} · {patientsList.length} HC
          </p>
        </div>
      </aside>

      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* ── Top Bar ── */}
        <header className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between sticky top-0 z-20 no-print">
          <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {view !== 'dashboard' && (
              <button onClick={() => goBack()} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">
                <ChevronLeft className="w-3.5 h-3.5" /> Volver
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {_noLeidos > 0 && (
              <button onClick={() => setShowMensajePanel(true)} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{_noLeidos}</span>
              </button>
            )}
          </div>
        </header>

        {/* ── Inactivity warning ── */}
        {inactivityWarning && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[9998] flex items-center gap-3 no-print">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-black text-sm">⏱️ Sesión por expirar</p>
              <p className="text-xs">Cierre en <span className="font-black">{inactivityCountdown}s</span></p>
            </div>
            <button onClick={_resetInactivity} className="ml-4 bg-white text-red-600 px-3 py-1 rounded-lg font-black text-xs">Continuar</button>
          </div>
        )}

        {/* ── Save status ── */}
        {saveStatus === "saved" && (
          <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 no-print">
            <CheckCircle2 className="w-4 h-4" /> ✅ Guardado
          </div>
        )}
        {saveStatus === "auto" && (
          <div className="fixed top-4 right-4 bg-blue-400 text-white px-3 py-1.5 rounded-lg shadow-lg z-50 flex items-center gap-2 no-print text-xs">
            <RefreshCw className="w-3 h-3" /> Autoguardado
          </div>
        )}

        {/* ── Page content ── */}
        <div className="flex-1 p-4 md:p-6">
          {renderCurrentView()}
        </div>
      </main>

      {/* ═══ GLOBAL MODALS ═══ */}
      {/* Alert Modal */}
      {alertMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]" onClick={() => setAlertMsg("")}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{alertMsg}</p>
            <button onClick={() => setAlertMsg("")}
              className="mt-4 w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700">
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmConfig && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{confirmConfig.msg}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setConfirmConfig(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl text-sm">Cancelar</button>
              <button onClick={() => { confirmConfig.onConfirm(); setConfirmConfig(null); }}
                className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved HC exit confirm */}
      {_exitHcConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <p className="text-sm font-bold text-gray-800 mb-2">⚠️ Cambios sin guardar</p>
            <p className="text-xs text-gray-600 mb-4">La historia clínica tiene cambios sin guardar. ¿Desea salir sin guardar?</p>
            <div className="flex gap-2">
              <button onClick={() => _setExitHcConfirm(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl text-xs">Quedarse</button>
              <button onClick={() => {
                handleSavePatient();
                _exitHcConfirm.onProceed();
                _setExitHcConfirm(null);
              }} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs">Guardar y Salir</button>
              <button onClick={() => {
                _setHcDirty(false);
                _exitHcConfirm.onProceed();
                _setExitHcConfirm(null);
              }} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl text-xs">Salir sin Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
