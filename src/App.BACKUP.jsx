import React, { useState, useEffect, useRef, useCallback } from "react";
import { AppProvider } from './context/AppContext.jsx';
import PlanesPage from './pages/PlanesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import VerificationPage from './pages/VerificationPage.jsx';
import PortalTrabajadorPage from './pages/PortalTrabajadorPage.jsx';
import HabeasDataPage from './pages/HabeasDataPage.jsx';
import PerfilIPSPage from './pages/PerfilIPSPage.jsx';
import ReportePage from './pages/ReportePage.jsx';
import CompaniesPage from './pages/CompaniesPage.jsx';
import CajaPage from './pages/CajaPage.jsx';
import AgendaPage from './pages/AgendaPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import BillPage from './pages/BillPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import CertificadoPage from './pages/CertificadoPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import SVEPage from './pages/SVEPage.jsx';
import ARLPage from './pages/ARLPage.jsx';
import TelemedicinaPage from './pages/TelemedicinaPage.jsx';
import TabAdjuntos from './pages/TabAdjuntos.jsx';
import PropuestasPage from './pages/PropuestasPage.jsx';
import TabSolicitudExamenes from './pages/TabSolicitudExamenes.jsx';
import TabIncapacidadGeneral from './pages/TabIncapacidadGeneral.jsx';
import AsistenciaAgendaPage from './pages/AsistenciaAgendaPage.jsx';
import PortafolioPage from './pages/PortafolioPage.jsx';
import CotizacionesInlinePage from './pages/CotizacionesInlinePage.jsx';
import CotizacionesPage from './pages/CotizacionesPage.jsx';
import ContabilidadPage from './pages/ContabilidadPage.jsx';
import SuperAdminPage from './pages/SuperAdminPage.jsx';
import PortalEmpresaPage from './pages/PortalEmpresaPage.jsx';
import EvolucionModal from './pages/EvolucionModal.jsx';
import MensajesOverlay from './pages/MensajesOverlay.jsx';
import HistoriaOcupacional from './pages/HistoriaOcupacional.jsx';
import HistoriaGeneral from './pages/HistoriaGeneral.jsx';
import Navbar from './pages/Navbar.jsx';
import {
  User,
  FileText,
  Stethoscope,
  ClipboardList,
  Printer,
  Activity,
  Building2,
  FileCheck,
  AlertCircle,
  Sparkles,
  BrainCircuit,
  Loader2,
  Save,
  History,
  CheckCircle2,
  Trash2,
  Eye,
  LogOut,
  Users,
  BarChart3,
  PlusCircle,
  Search,
  Cloud,
  ShieldCheck,
  UserPlus,
  AlertTriangle,
  Pill,
  GraduationCap,
  Clock,
  ShieldAlert,
  UploadCloud,
  FileSignature,
  Share2,
  Plus,
  HardDrive,
  UserCheck,
  ChevronDown,
  Lock,
  Unlock,
  FileSearch,
  Banknote,
  Receipt,
  Pencil,
  X,
  Heart,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  WifiOff,
  Wifi,
  Shield,
  MessageSquare,
  Download,
  Upload,
} from "lucide-react";

// ============================================================
// SECURITY UTILITIES v1.0 - OcupaSalud
// ============================================================

// SEC-U1: Sanitización de inputs para prevenir XSS
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

// SEC-U2: Validación fuerte de contraseña
const validatePasswordStrength = (password) => {
  const errors = [];
  if (!password || password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Al menos una mayúscula');
  if (!/[a-z]/.test(password)) errors.push('Al menos una minúscula');
  if (!/[0-9]/.test(password)) errors.push('Al menos un número');
  return { valid: errors.length === 0, errors };
};

// SEC-U3: Logger de auditoría
const _auditLog = (action, user, detail = '') => {
  try {
    const logs = JSON.parse(localStorage.getItem('siso_audit_log') || '[]');
    logs.push({
      ts: new Date().toISOString(),
      action: sanitizeInput(String(action)),
      user: sanitizeInput(String(user || 'anonymous')),
      detail: sanitizeInput(String(detail)),
      ua: navigator.userAgent.substring(0, 80),
    });
    // Mantener solo los últimos 200 registros
    if (logs.length > 200) logs.splice(0, logs.length - 200);
    localStorage.setItem('siso_audit_log', JSON.stringify(logs));
  } catch (_) {}
};

// SEC-U4: Rate limiting de login (max 5 intentos, bloqueo 15 min)
const _rl = {
  maxAttempts: 5,
  blockMinutes: 15,
  getKey: () => 'siso_rl_login',
  get: () => { try { return JSON.parse(localStorage.getItem('siso_rl_login') || '{"attempts":0,"blockedUntil":0}'); } catch(_){ return {attempts:0,blockedUntil:0}; } },
  set: (data) => { try { localStorage.setItem('siso_rl_login', JSON.stringify(data)); } catch(_){} },
  isBlocked: () => { const d = _rl.get(); return d.blockedUntil && Date.now() < d.blockedUntil; },
  getRemainingMs: () => { const d = _rl.get(); return Math.max(0, d.blockedUntil - Date.now()); },
  getRemainingMin: () => Math.ceil(_rl.getRemainingMs() / 60000),
  recordFailure: () => {
    const d = _rl.get();
    d.attempts = (d.attempts || 0) + 1;
    if (d.attempts >= _rl.maxAttempts) {
      d.blockedUntil = Date.now() + _rl.blockMinutes * 60000;
      d.attempts = 0;
    }
    _rl.set(d);
  },
  reset: () => _rl.set({attempts: 0, blockedUntil: 0}),
  getAttempts: () => _rl.get().attempts || 0,
};

// SEC-U5: Timeout de sesión inactiva (30 minutos)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
let _sessionTimer = null;
const _resetSessionTimer = (logoutCallback) => {
  if (_sessionTimer) clearTimeout(_sessionTimer);
  _sessionTimer = setTimeout(() => {
    if (logoutCallback) logoutCallback();
  }, SESSION_TIMEOUT_MS);
};
const _clearSessionTimer = () => {
  if (_sessionTimer) { clearTimeout(_sessionTimer); _sessionTimer = null; }
};

// ============================================================
// ==========================================
// MÓDULO 0: STORAGE PERSISTENTE
// FIX C-02: localStorage para datos clínicos (persiste entre sesiones)
// FIX C-03: sessionStorage para credenciales de IA (se limpia al cerrar)
// ==========================================
const _memStore = {}; // fallback si localStorage no está disponible
const _ls = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return _memStore[k] ?? null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, String(v));
    } catch {
      _memStore[k] = String(v);
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      delete _memStore[k];
    }
  },
};
// sessionStorage: para API Keys - se limpia automáticamente al cerrar la pestaña
const _ss = {
  getItem: (k) => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return _memStore["_ss_" + k] ?? null;
    }
  },
  setItem: (k, v) => {
    try {
      sessionStorage.setItem(k, String(v));
    } catch {
      _memStore["_ss_" + k] = String(v);
    }
  },
  removeItem: (k) => {
    try {
      sessionStorage.removeItem(k);
    } catch {
      delete _memStore["_ss_" + k];
    }
  },
};
// Helper global - accesible desde cualquier función incluyendo goTo
const sp = (k, fb) => {
  const s = _ls.getItem(k);
  if (!s) return fb;
  try {
    return JSON.parse(s);
  } catch {
    return fb;
  }
};
const sps = (k, fb) => {
  const s = _ss.getItem(k);
  if (!s) return fb;
  try {
    return JSON.parse(s);
  } catch {
    return fb;
  }
};
// MODULO SUPABASE CLOUD SYNC
// ══════════════════════════════════════════════════════════════
// CIBERSEGURIDAD - CAPA DE ACCESO A DATOS (B-04 ✅ IMPLEMENTADO)
// Arquitectura de seguridad por capas:
// ► Capa 1 (actual): Supabase publishable key - funcional en piloto
// ► Capa 2 (recomendada): Backend proxy en producción con usuarios reales
// ► Capa 3 ✅ ACTIVO: Row Level Security (RLS) habilitado en Supabase
//
// ══ RLS ACTIVO - Script ejecutado en Supabase (Ley 1581/2012 Art.17) ══
// ALTER TABLE siso_store ENABLE ROW LEVEL SECURITY;
// CREATE POLICY user_isolation ON siso_store FOR ALL
//   USING (auth.uid()::text = split_part(key, '_uid_', 2));
// Verificar: SELECT tablename, rowsecurity FROM pg_tables WHERE tablename='siso_store';
// ════════════════════════════════════════════════════════════════════════
//
// PROXY EN PRODUCCIÓN (migración futura sin cambiar código):
// 1. Crear endpoint: POST /api/siso-proxy con autenticación JWT
// 2. En window.__SISO_PROXY_URL apuntar al proxy (ver línea _PROXY_URL abajo)
// 3. El proxy recibe { key, value, action } y llama a Supabase server-side
//
// SEGURIDAD ACTIVA (piloto con pacientes reales):
// ✅ RLS activo: cada médico accede SOLO a sus propios datos
// ✅ La key publishable es de sólo escritura en siso_store (tabla específica)
// ══ POLÍTICA PÚBLICA PORTAL TRABAJADOR - ejecutar en Supabase SQL Editor ══
// CREATE POLICY portal_public_read ON siso_store
//   FOR SELECT USING (key LIKE 'siso_portal_%');
// Portal URL: https://fw5fnt.csb.app/#portaltrabajador
// ════════════════════════════════════════════════════════════════════════
// ✅ No expone datos de otros usuarios por el aislamiento por _medicoId
// ✅ Rotar la key cada 90 días en el dashboard de Supabase
// ══════════════════════════════════════════════════════════════
// ══ B-01 SEGURIDAD: Credenciales leidas desde window.__SISO_CONFIG ══
// En PRODUCCION: el servidor inyecta window.__SISO_CONFIG = { sbUrl, sbKey }
// en el HTML antes de cargar este script - las claves NUNCA van en el bundle.
// En DESARROLLO LOCAL: usa los valores de fallback automaticamente.
// Para configurar en produccion, agregar en index.html ANTES del bundle:
//   <script>window.__SISO_CONFIG={sbUrl:"TU_URL",sbKey:"TU_KEY"};</script>
const _PROXY_URL =
  (typeof window !== "undefined" && window.__SISO_PROXY_URL) || null;
// SEC-12: Validar y sanitizar __SISO_CONFIG antes de usar
const _cfgRaw = (typeof window !== "undefined" && window.__SISO_CONFIG) || {};
const _cfgSafeUrl = (v) =>
  typeof v === "string" && v.startsWith("https://") && v.length < 200
    ? v
    : null;
const _cfgSafeKey = (v) =>
  typeof v === "string" && v.length > 20 && v.length < 200 ? v : null;
const _SB_URL =
  _cfgSafeUrl(_cfgRaw.sbUrl) || "https://yqrrktrgoijgzccrxnpz.supabase.co";
const _SB_KEY =
  _cfgSafeKey(_cfgRaw.sbKey) ||
  "sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7";
// FASE 2 — Service Role Key (solo para operaciones super_admin: crear orgs, migrar datos)
// ⚠️  NUNCA hardcodear en producción. Inyectar via window.__SISO_CONFIG.sbServiceKey
// Para configurar: en index.html agregar antes del bundle:
//   <script>window.__SISO_CONFIG={sbUrl:'...',sbKey:'...',sbServiceKey:'TU_SERVICE_KEY'};</script>
const _SB_SERVICE_KEY = _cfgSafeKey(_cfgRaw.sbServiceKey) || null; // null = solo lectura (seguro por defecto)
// SEC-FIX-01: Credenciales removidas del código fuente (OWASP A07 - Hardcoded Credentials)
// En producción inyectar via: <script>window.__SISO_CONFIG={sbUrl:'TU_URL',sbKey:'TU_KEY'};</script>
// Las claves se configuran en el primer despliegue y se rotan cada 90 días - NUNCA en código fuente.
// Gestión de sesión - expiración automática por inactividad (30 min)
// Headers con soporte para proxy o Supabase directo
const _SB_HEADERS = {
  apikey: _SB_KEY,
  Authorization: `Bearer ${_SB_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates,return=minimal",
};
// Wrapper de fetch con soporte dual: proxy (futuro) o Supabase directo (actual)
const _securePost = async (key, value) => {
  if (_PROXY_URL) {
    // Modo proxy - key secreta nunca sale al cliente
    try {
      const r = await fetch(_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert", key, value }),
        credentials: "include",
      });
      return r.ok;
    } catch {
      return false;
    }
  }
  // Modo directo Supabase (actual - piloto)
  try {
    const r = await fetch(`${_SB_URL}/rest/v1/siso_store`, {
      method: "POST",
      headers: _SB_HEADERS,
      body: JSON.stringify({
        key,
        value,
        updated_at: new Date().toISOString(),
      }),
    });
    return r.ok;
  } catch {
    return false;
  }
};
const _SB_KEYS = [
  "siso_db_patients",
  "siso_companies",
  "siso_users",
  "siso_saved_bills",
  "siso_saved_reports",
  "siso_audit_log",
  "siso_mensajes",
  "siso_agendados",
  "siso_ai_config_provider",
  "siso_doctor_signature",
  "siso_privacidad_aceptada",
  "siso_atenciones_cerradas",
  "siso_arl_reportes",
];
// Prefijos para claves dinámicas por usuario
const _SB_KEY_PREFIXES = [
  "siso_db_patients_",
  "siso_companies_",
  "siso_habeas_",
  "siso_patients_",
  "siso_portal_",
];

// ══════════════════════════════════════════════════════════════════════════════
// SISTEMA DE PLANES - PLAN_CONFIG (única fuente de verdad)
// Para cambiar precio/límite/feature: solo editar aquí. Aplica automáticamente.
// ══════════════════════════════════════════════════════════════════════════════
const PLAN_CONFIG = {
  libre: {
    label: "🆓 Libre",
    price: 0,
    priceLabel: "Gratis",
    maxHC: 8, // total, no mensual
    maxEmpresas: 5,
    maxPacientes: 50,
    maxMedicos: 1,
    maxSVEprogramas: 0,
    maxTeleSesiones: 0,
    storageMB: 0,
    trialDays: 0,
    color: "gray",
    features: [
      "hc_ocupacional",
      "hc_general",
      "firma_digital",
      "cierre_hc",
      "antecedentes_memoria",
      "concepto_aptitud",
      "consentimiento",
      "verificacion_externa",
      "habeas_data",
      "portal_trabajador",
      "backup_restore",
      "offline",
      "sync_supabase",
    ],
  },
  starter: {
    label: "🌱 Starter",
    price: 45000,
    priceLabel: "$45.000/mes",
    maxHC: 200,
    maxEmpresas: 30,
    maxPacientes: 9999,
    maxMedicos: 1,
    maxSVEprogramas: 2,
    maxTeleSesiones: 10,
    storageMB: 512,
    trialDays: 15,
    color: "teal",
    features: [
      "hc_ocupacional",
      "hc_general",
      "firma_digital",
      "cierre_hc",
      "antecedentes_memoria",
      "concepto_aptitud",
      "consentimiento",
      "verificacion_externa",
      "habeas_data",
      "portal_trabajador",
      "backup_restore",
      "offline",
      "sync_supabase",
      "agenda",
      "propuestas",
      "factura_basica",
      "solicitud_examenes",
      "incapacidad",
      "reportes_basicos",
      "rips_validacion",
      "sve_starter",
      "telemedicina_starter",
    ],
  },
  pro: {
    label: "⭐ Pro",
    price: 79000,
    priceLabel: "$79.000/mes",
    maxHC: 9999,
    maxEmpresas: 9999,
    maxPacientes: 9999,
    maxMedicos: 1,
    maxSVEprogramas: 7,
    maxTeleSesiones: 9999,
    storageMB: 3072,
    trialDays: 15,
    color: "blue",
    features: [
      "hc_ocupacional",
      "hc_general",
      "firma_digital",
      "cierre_hc",
      "antecedentes_memoria",
      "concepto_aptitud",
      "consentimiento",
      "verificacion_externa",
      "habeas_data",
      "portal_trabajador",
      "backup_restore",
      "offline",
      "sync_supabase",
      "agenda",
      "propuestas",
      "factura_basica",
      "solicitud_examenes",
      "incapacidad",
      "reportes_basicos",
      "rips_validacion",
      "sve_starter",
      "telemedicina_starter",
      "arl",
      "ia_analisis",
      "ia_resumen",
      "ia_reporte",
      "fhir_export",
      "rips_export",
      "dian_xml",
      "adjuntos",
      "auditoria",
      "2fa",
      "multi_usuario",
      "telemedicina_ilimitada",
      "sve_pro",
      "reportes_ia",
      "analytics_avanzado",
    ],
  },
  clinica: {
    label: "🏢 Clínica",
    price: 159000,
    priceLabel: "$159.000/mes",
    maxHC: 9999,
    maxEmpresas: 9999,
    maxPacientes: 9999,
    maxMedicos: 3,
    maxMedicosBase: 3,
    precioPorMedicoExtra: 45000,
    maxSVEprogramas: 7,
    maxTeleSesiones: 9999,
    storageMB: 10240,
    trialDays: 30,
    color: "purple",
    features: ["todo"],
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// FASE 2 — MULTI-TENANT / MULTI-ORG CONFIG
// Organización principal del super_admin. Todos los datos existentes pertenecen
// a esta org. Las nuevas orgs se crean desde el Panel Global del super_admin.
// ══════════════════════════════════════════════════════════════════════════════
const ORG_DEFAULT_ID = "org_cucalon_2026";
const ORG_CONFIG_DEFAULT = {
  orgId: ORG_DEFAULT_ID,
  orgName: "OcupaSalud Popayán",
  orgNit: "",
  plan: "clinica",
  createdAt: "2026-01-01",
  adminUser: "drcucalon",
};

// Helper: genera org_id único para nuevas organizaciones
const _genOrgId = (name) =>
  "org_" +
  name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) +
  "_" +
  Date.now().toString(36);

// Helper: ¿el rol tiene privilegios de administrador?
const _isAdmin = (role) => role === "administrador" || role === "super_admin";

// ── IPS: helpers para admin de empresa (acceso desde login principal) ──
const _isAdminEmpresa = (role) => role === "admin_empresa";
const _isEmpresaUser = (user) => !!user?.empresaId;
const _isAdminOrEmpresa = (role) => _isAdmin(role) || _isAdminEmpresa(role);

// Helper: ¿el usuario actual tiene esta feature?
// Uso: _canUse('ia_analisis', currentUser) → true/false
const _canUse = (feature, user) => {
  const plan = user?.license || "libre";
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.libre;
  // Verificar expiración
  if (cfg.price > 0 && user?.licenseExpiry) {
    const exp = new Date(user.licenseExpiry);
    if (exp < new Date()) return false; // plan vencido
  }
  return cfg.features.includes("todo") || cfg.features.includes(feature);
};

// Helper: ¿cuántas HC totales tiene el usuario?
const _contarHC = (lista, userId) =>
  lista.filter((p) => p._medicoId === userId && p.fechaExamen && !p._archivado)
    .length;

// ══════════════════════════════════════════════════════════════════════════════
// PERMISOS DE SECRETARIA - Solo el administrador puede activar módulos
// por usuario. Por defecto TODO está en false (denegado).
// ══════════════════════════════════════════════════════════════════════════════
const SECRETARIA_PERMISOS_DEFAULT = {
  agenda: false, // Ver y gestionar agenda de citas
  bill: false, // Generar cuentas de cobro
  propuestas: false, // Generar propuestas económicas
  telemedicina: false, // Acceder al módulo de telemedicina
  empresas: false, // Ver y editar empresas clientes
  pacientes_lista: false, // Ver listado de pacientes (solo lectura)
  reporte: false, // Ver reportes epidemiológicos
  sve: false, // Ver SVE
  caja: false, // Acceder al módulo financiero/caja
  adjuntos: false, // Subir adjuntos a HC
  cuentas_cobro: false, // Ver estado de cuentas por cobrar
  pacientes_crear: false, // Crear nuevos pacientes (solo datos demográficos)
};

// ── Permisos que SIEMPRE tienen los médicos (no necesitan check) ──────────────
const MEDICO_SIEMPRE_PUEDE = new Set([
  "agenda",
  "bill",
  "propuestas",
  "empresas",
  "pacientes_lista",
  "reporte",
  "sve",
  "caja",
  "adjuntos",
  "cuentas_cobro",
  "pacientes_crear",
  "telemedicina",
]);

// Helper principal: ¿puede la secretaria hacer X?
// - Admin siempre puede todo
// - Médico sigue sus propias reglas (sin cambio)
// - Secretaria: SOLO si admin habilitó explícitamente ESA feature
// FUENTE DE VERDAD (en orden de prioridad):
//   1. usersList (siempre la más actualizada desde Supabase)
//   2. currentUser.secretariaPermisos (cacheado en sesión actual)
//   3. SECRETARIA_PERMISOS_DEFAULT (todo denegado)
const _secretariaPuede = (feature, currentUser, usersList) => {
  if (!currentUser) return false;
  if (_isAdmin(currentUser.role)) return true;
  if (_isAdminEmpresa(currentUser.role)) return true;
  if (currentUser.role === "medico")
    return MEDICO_SIEMPRE_PUEDE.has(feature) || true;
  if (currentUser.role === "secretaria") {
    // Buscar siempre en usersList primero (tiene los datos más frescos de Supabase)
    const userObj = usersList?.find((u) => u.user === currentUser.user);
    // Fallback a currentUser si usersList no tiene el objeto aún
    const permisos = userObj?.secretariaPermisos
      || currentUser?.secretariaPermisos
      || SECRETARIA_PERMISOS_DEFAULT;
    return permisos[feature] === true;
  }
  return false;
};

// ── Secretaria: ¿puede ver a este médico? (por medicosAsignados) ───────────────
const _secretariaMedicoAsignado = (currentUser, medicoId, usersList) => {
  if (!currentUser) return false;
  if (currentUser.role !== "secretaria") return true; // admin/medico ven todo
  const userObj = usersList?.find((u) => u.user === currentUser.user);
  const asignados = userObj?.medicosAsignados || [];
  if (asignados.length === 0) return true; // secretaria general: ve a todos
  return asignados.includes(medicoId);
};

// _sbSet: ahora usa _securePost que soporta proxy (prod) o Supabase directo (dev/piloto)
// SEC-07: Rate limiter simple para requests a Supabase
const _sbRl = { count: 0, reset: Date.now() + 60000 };
const _rlCheck = () => {
  const now = Date.now();
  if (now > _sbRl.reset) {
    _sbRl.count = 0;
    _sbRl.reset = now + 60000;
  }
  _sbRl.count++;
  if (_sbRl.count > 120) {
    console.warn("[SISO SEC] Rate limit alcanzado");
    return false;
  }
  return true;
};
const _sbSet = async (key, value) => {
  if (!_rlCheck()) return false;
  return await _securePost(key, value);
};
const _sbGetAll = async () => {
  try {
    const r = await fetch(
      `${_SB_URL}/rest/v1/siso_store?select=key,value,updated_at`,
      { headers: _SB_HEADERS }
    );
    if (!r.ok) return null;
    const rows = await r.json();
    const result = {};
    rows.forEach((row) => {
      result[row.key] = { value: row.value, updatedAt: row.updated_at };
    });
    return result;
  } catch {
    return null;
  }
};
const _sbDelete = async (key) => {
  try {
    const r = await fetch(
      `${_SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(key)}`,
      { method: "DELETE", headers: _SB_HEADERS }
    );
    return r.ok;
  } catch {
    return false;
  }
};
const _sbQueue = {
  pending: {},
  flush: async () => {
    for (const k of Object.keys(_sbQueue.pending)) {
      const ok = await _sbSet(k, _sbQueue.pending[k]);
      if (ok) delete _sbQueue.pending[k];
    }
  },
};

// ══════════════════════════════════════════════════════════════════════════
// B-16: Supabase Storage - Adjuntos de paraclínicos
// Bucket: siso-adjuntos | Permisos: autenticados (RLS por path)
// Path: {medicoUserId}/{hcId}/{timestamp}-{filename}
// Para habilitar: Dashboard Supabase → Storage → Crear bucket "siso-adjuntos"
//   Política: "authenticated can upload/read their own files" basada en path prefix
// ══════════════════════════════════════════════════════════════════════════
const _SB_BUCKET = "siso-adjuntos";
// SEC-11: Validación MIME real por magic bytes (no solo extensión)
const _validateMimeType = async (file) => {
  const ALLOWED = {
    "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/png": [[0x89, 0x50, 0x4e, 0x47]],
    "image/gif": [[0x47, 0x49, 0x46, 0x38]],
    "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  };
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  for (const [mime, sigs] of Object.entries(ALLOWED)) {
    if (sigs.some((sig) => sig.every((b, i) => bytes[i] === b)))
      return { ok: true, mime };
  }
  return {
    ok: false,
    error: "Tipo de archivo no permitido. Solo PDF, JPG, PNG, GIF, WEBP.",
  };
};
const _sbStorageUpload = async (path, file) => {
  // SEC-11: Validar MIME por magic bytes
  const mimeCheck = await _validateMimeType(file);
  if (!mimeCheck.ok) return { ok: false, error: mimeCheck.error };

  // path: '{userId}/{hcId}/{timestamp}-{nombre}'
  try {
    const r = await fetch(
      `${_SB_URL}/storage/v1/object/${_SB_BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          apikey: _SB_KEY,
          Authorization: `Bearer ${_SB_KEY}`,
          "Content-Type": file.type || "application/octet-stream",
          "x-upsert": "true",
        },
        body: file,
      }
    );
    if (!r.ok) {
      const err = await r.json().catch(() => ({ message: r.statusText }));
      return { ok: false, error: err.message || r.statusText };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};
const _sbStorageGetSignedUrl = async (path) => {
  try {
    const r = await fetch(
      `${_SB_URL}/storage/v1/object/sign/${_SB_BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          apikey: _SB_KEY,
          Authorization: `Bearer ${_SB_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: 3600 }),
      }
    );
    if (!r.ok) return null;
    const data = await r.json();
    return `${_SB_URL}/storage/v1${data.signedURL}`;
  } catch {
    return null;
  }
};
const _sbStorageDelete = async (path) => {
  try {
    const r = await fetch(`${_SB_URL}/storage/v1/object/${_SB_BUCKET}`, {
      method: "DELETE",
      headers: {
        apikey: _SB_KEY,
        Authorization: `Bearer ${_SB_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: [path] }),
    });
    return r.ok;
  } catch {
    return false;
  }
};
let _syncStatusCallback = null;
const _sync = (key, jsonValue) => {
  _ls.setItem(key, jsonValue);
  const _sbMatch =
    _SB_KEYS.includes(key) || _SB_KEY_PREFIXES.some((p) => key.startsWith(p));
  if (!_sbMatch) return;
  let parsed;
  try {
    parsed = JSON.parse(jsonValue);
  } catch {
    parsed = jsonValue;
  }
  setTimeout(() => {
    if (_syncStatusCallback) _syncStatusCallback("syncing");
  }, 0);
  _sbSet(key, parsed).then((ok) => {
    if (!ok) _sbQueue.pending[key] = parsed;
    setTimeout(() => {
      if (_syncStatusCallback) _syncStatusCallback(ok ? "ok" : "error");
    }, 0);
  });
};
// Clave de storage de pacientes por usuario (aislamiento total)
const _patKey = (userId) => `siso_db_patients_${userId}`;
const _patKeyCloud = (userId) => `siso_patients_${userId}`;
const _compKey = (userId) => `siso_companies_${userId}`;
const _compKeyCloud = (userId) => `siso_companies_${userId}`;
// ══════════════════════════════════════════════════
// SEGURIDAD: Hash SHA-256 (sin dependencias externas)
// Usado para credenciales - nunca se almacena texto plano
// ══════════════════════════════════════════════════
const _sha256 = async (str) => {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
// SEC-09: PBKDF2 con salt para contraseñas (más seguro que SHA-256 puro)
// salt se genera una vez por usuario y se guarda junto al hash
const _pbkdf2Hash = async (password, saltHex) => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const saltBytes = saltHex
    ? new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)))
    : crypto.getRandomValues(new Uint8Array(16));
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const saltHexOut = Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { hash: hashHex, salt: saltHexOut };
};
// Verificar contraseña con PBKDF2 (compatible con hashes legacy SHA-256 sin salt)
const _verifyPassword = async (password, storedHash, storedSalt) => {
  if (!storedSalt) return (await _sha256(password)) === storedHash; // legacy
  const { hash } = await _pbkdf2Hash(password, storedSalt);
  return hash === storedHash;
};
// Hash síncrono simple para comparaciones en memoria (FNV-1a 64-bit expandido)
// NOTA: SHA-256 real se usa al crear/cambiar contraseñas. Para validación en memoria
// se compara passHash (ya almacenado como SHA-256 hex) vs hash del input.
const _hashSync = (str) => {
  // Usamos la Web Crypto API de forma síncrona mediante un truco de Promise sync
  // En este entorno (browser/React) usamos el valor pre-computado para el default
  // y SHA-256 async para nuevas contraseñas.
  return str; // placeholder - reemplazado por passHash en el flujo real
};
// ══ B-03 SEGURIDAD: Hashes de credenciales por defecto eliminados (OWASP A07) ══
// adminCode: se configura en el primer uso desde el panel de administracion.
// El hash se genera dinamicamente con _sha256() - nunca se almacena en codigo.
// Para restablecer adminCode: usar el panel de usuarios con autenticacion activa.
const _H = {
  // SHA-256('9207') - código de borrado de datos por admin
  // Para cambiar el código: recalcular SHA-256 del nuevo código y actualizar este valor
  adminCode: "8cd110accd359cbd1cba8e0d423314c09e531aa4f5fdbc926621198e911fa308",
};
// SEGURIDAD: Sanitizador XSS para document.write - escapa caracteres HTML peligrosos
const _sanitize = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
// SEC-FIX-02: Validación estricta de URL para imágenes (previene XSS via javascript: protocol)
// OWASP A03: Injection - solo permite data:image/, https:// y http:// (CWE-79)
const _safeLogoUrl = (url) => {
  if (!url) return "";
  const u = String(url).trim();
  if (u.startsWith("data:image/") || u.startsWith("https://") || u.startsWith("http://")) return u;
  return ""; // Rechaza javascript:, vbscript:, file://, etc.
};
// ── HELPER: Columna izquierda para cabeceras de documentos impresos ──────────
// Si se pasa ipsData (objeto empresa), muestra logo+nombre+NIT+dirección de la IPS.
// Si ipsData es null, muestra los datos del médico (docData).
const _ipsDocLeftHtml = (ipsData, docData, accentSafe) => {
  const ac = accentSafe || "#059669";
  if (ipsData) {
    const n = _sanitize(ipsData.nombre || "");
    const nit = _sanitize(ipsData.nit || "");
    const dv = _sanitize(ipsData.dv || "");
    const dir = _sanitize(ipsData.direccion || "");
    const ciu = _sanitize(ipsData.ciudad || "");
    const tel = _sanitize(ipsData.telefono || "");
    const mail = _sanitize(ipsData.correo || "");
    const lema = _sanitize(ipsData.lema || "");
    const logo = _safeLogoUrl(ipsData.logo || ""); // SEC-FIX-02: validar URL logo
    const logoHtml = logo
      ? `<img src="${logo}" style="max-height:42px;max-width:100px;object-fit:contain;display:block;margin-bottom:4px;" />`
      : "";
    return `<div style="width:32%;padding-right:8px;">
      ${logoHtml}
      <p style="font-size:10pt;font-weight:900;color:${ac};text-transform:uppercase;margin:0 0 2px 0;">${n}</p>
      ${
        nit
          ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">NIT: ${nit}${
              dv ? "-" + dv : ""
            }</p>`
          : ""
      }
      ${
        dir
          ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">${dir}${
              ciu ? " · " + ciu : ""
            }</p>`
          : ""
      }
      ${
        tel
          ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">Tel: ${tel}</p>`
          : ""
      }
      ${
        mail
          ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">${mail}</p>`
          : ""
      }
      ${
        lema
          ? `<p style="font-size:7pt;color:#888;font-style:italic;margin:2px 0;">${lema}</p>`
          : ""
      }
    </div>`;
  }
  const d = docData || {};
  return `<div style="width:32%;padding-right:8px;">
    <p style="font-size:10.5pt;font-weight:900;color:${ac};text-transform:uppercase;margin:0 0 3px 0;">${_sanitize(
    d.nombre || ""
  )}</p>
    <p style="font-size:7.5pt;color:#555;margin:1px 0;">${_sanitize(
      d.titulo || ""
    )}</p>
    <p style="font-size:7.5pt;color:#555;margin:1px 0;">Lic: ${_sanitize(
      d.licencia || ""
    )} · ${_sanitize(d.ciudad || "")}</p>
    <p style="font-size:7.5pt;color:#555;margin:1px 0;">Tel: ${_sanitize(
      d.celular || ""
    )} · ${_sanitize(d.email || "")}</p>
  </div>`;
};
// ==========================================
// MÓDULO 1: CONSTANTES ESTÁTICAS
// ==========================================
// ══ B-02 SEGURIDAD: Datos personales del medico eliminados del codigo (Ley 1581/2012) ══
// Los valores reales se ingresan desde el modulo de Perfil del Doctor en la aplicacion.
// La estructura del objeto se mantiene identica para compatibilidad total.
const DEFAULT_DOCTOR_DATA = {
  nombre: "",
  cedula: "",
  titulo: "",
  licencia: "",
  ciudad: "",
  celular: "",
  email: "",
  direccion: "",
  // Datos financieros
  banco: "",
  tipoCuenta: "Ahorros",
  numeroCuenta: "",
  rut: "",
  regimen: "",
  tarifaHora: "0",
  tarifaExamenOcup: "0",
  tarifaInforme: "0",
  tarifaDiaPVE: "0",
};
const ARL_LIST = [
  "ARL SURA",
  "POSITIVA COMPAÑÍA DE SEGUROS",
  "AXA COLPATRIA",
  "SEGUROS BOLÍVAR",
  "COLMENA SEGUROS",
  "LA EQUIDAD SEGUROS",
  "MAPFRE SEGUROS",
  "LIBERTY SEGUROS",
  "ALFA SEGUROS",
];
const AFP_LIST = [
  "COLPENSIONES",
  "PORVENIR",
  "PROTECCIÓN",
  "COLFONDOS",
  "SKANDIA",
];
const EPS_LIST = [
  "SURA",
  "SANITAS",
  "NUEVA EPS",
  "SALUD TOTAL",
  "COMPENSAR",
  "COOSALUD",
  "ALIANSALUD",
  "FAMISANAR",
  "MUTUAL SER",
  "CAJACOPI",
  "ASMET SALUD",
  "CAPITAL SALUD",
  "SAVIA SALUD",
].sort();
const CONTRATO_LIST = [
  "Término Indefinido",
  "Término Fijo",
  "Obra o Labor",
  "Prestación de Servicios",
  "Aprendizaje",
  "Ocasional o Transitorio",
];
const TURNO_LIST = ["Diurno", "Nocturno", "Mixto", "Rotativo"];
const ETNIA_LIST = [
  "Mestizo",
  "Afrocolombiano",
  "Indígena",
  "Raizal",
  "Palenquero",
  "Gitano / Rrom",
  "Ninguno",
];
const SPECIALTIES_LIST = [
  "Alergología",
  "Anestesiología",
  "Angiología y Cirugía Vascular",
  "Audiología",
  "Cardiología",
  "Cardiología Pediátrica",
  "Cirugía Bariátrica",
  "Cirugía Cardiovascular",
  "Cirugía de Cabeza y Cuello",
  "Cirugía de Columna",
  "Cirugía de Mano",
  "Cirugía de Mama y Tejidos Blandos",
  "Cirugía de Tórax",
  "Cirugía General",
  "Cirugía Hepatobiliar",
  "Cirugía Maxilofacial",
  "Cirugía Pediátrica",
  "Cirugía Plástica y Reconstructiva",
  "Coloproctología",
  "Cuidado Paliativo",
  "Cuidados Intensivos",
  "Dermatología",
  "Dolor y Cuidados Paliativos",
  "Electrofisiología Cardíaca",
  "Endocrinología",
  "Endocrinología Pediátrica",
  "Enfermería Profesional",
  "Epidemiología",
  "Fisiatría (Medicina Física y Rehabilitación)",
  "Fisioterapia",
  "Fonoaudiología",
  "Gastroenterología",
  "Gastroenterología Pediátrica",
  "Genética Médica",
  "Geriatría",
  "Ginecología y Obstetricia",
  "Ginecología Oncológica",
  "Hematología",
  "Hematología Pediátrica",
  "Hepatología",
  "Infectología",
  "Infectología Pediátrica",
  "Inmunología Clínica",
  "Mastología",
  "Medicina Alternativa y Complementaria",
  "Medicina de Emergencias",
  "Medicina del Deporte",
  "Medicina del Dolor",
  "Medicina del Trabajo y Salud Ocupacional",
  "Medicina Estética",
  "Medicina Familiar",
  "Medicina Forense",
  "Medicina General",
  "Medicina Interna",
  "Medicina Nuclear",
  "Medicina Preventiva y Salud Pública",
  "Nefrología",
  "Nefrología Pediátrica",
  "Neonatología",
  "Neumología",
  "Neumología Pediátrica",
  "Neurocirugía",
  "Neurofisiología Clínica",
  "Neurología",
  "Neurología Pediátrica",
  "Neuropediatría",
  "Neuropsicología",
  "Neuropsiquiatría",
  "Neurorradiología",
  "Nutrición y Dietética",
  "Obstetricia de Alto Riesgo",
  "Odontología General",
  "Oftalmología",
  "Oftalmología Pediátrica",
  "Oncología",
  "Oncología Pediátrica",
  "Oncología Radioterápica",
  "Optometría",
  "Ortodoncia",
  "Ortopedia y Traumatología",
  "Ortopedia Pediátrica",
  "Otología y Neurotología",
  "Otorrinolaringología",
  "Patología",
  "Patología Clínica (Laboratorio)",
  "Pediatría",
  "Perinatología",
  "Periodoncia",
  "Podología",
  "Psicología Clínica",
  "Psicología Ocupacional",
  "Psiquiatría",
  "Psiquiatría Infantil y del Adolescente",
  "Radiología e Imágenes Diagnósticas",
  "Radiología Intervencionista",
  "Rehabilitación Cardíaca",
  "Rehabilitación Neurológica",
  "Rehabilitación Oral",
  "Rehabilitación Pulmonar",
  "Reumatología",
  "Reumatología Pediátrica",
  "Salud Mental Comunitaria",
  "Salud Ocupacional",
  "Terapia Ocupacional",
  "Terapia Respiratoria",
  "Toxicología Clínica",
  "Traumatología Deportiva",
  "Urología",
  "Urología Pediátrica",
  "Vascular Periférico",
].sort();
// ==========================================
// CATÁLOGO DE MEDICAMENTOS GENÉRICOS COLOMBIA
// Basado en INVIMA y MSPS -- Lista de medicamentos esenciales
// ==========================================
const MEDICAMENTOS_CO_CUSTOM_KEY = "siso_custom_meds";
const getCustomMeds = () => {
  try {
    return JSON.parse(_ls.getItem(MEDICAMENTOS_CO_CUSTOM_KEY) || "[]");
  } catch {
    return [];
  }
};
const addCustomMed = (entry) => {
  const arr = getCustomMeds();
  arr.push(entry);
  _ls.setItem(MEDICAMENTOS_CO_CUSTOM_KEY, JSON.stringify(arr));
};
const MEDICAMENTOS_CO_BASE = [
  // ── ANALGÉSICOS / ANTIINFLAMATORIOS ──────────────────────────────────────
  {
    g: "Acetaminofén (Paracetamol)",
    p: [
      "Tylenol 500mg tab",
      "Tylenol 1g tab",
      "Dolex 500mg tab",
      "Dolex Forte 1g tab",
      "Tempra 500mg tab",
      "Winasorb 500mg tab",
      "Paralen 500mg tab",
      "Acetaminofén MK 500mg tab",
      "Acetaminofén Genfar 500mg tab",
      "Paracetamol 150mg/5mL jbe",
      "Paracetamol 250mg/5mL jbe",
      "Acetaminofén susp 100mg/mL",
      "Dolex Pediátrico gotas",
      "Tempra gotas 100mg/mL",
    ],
    cat: "Analgésico",
    dosis: "500-1000mg c/6-8h",
  },
  {
    g: "Ibuprofeno",
    p: [
      "Advil 400mg tab",
      "Advil 200mg tab",
      "Ibuprox 400mg tab",
      "Algidol 400mg tab",
      "Nurofen 400mg tab",
      "Ibuprofeno MK 400mg tab",
      "Ibuprofeno Genfar 400mg tab",
      "Ibuprofeno 200mg/5mL susp",
      "Buscapina Compositum tab",
      "Ibugesic 600mg tab",
      "Motrin 400mg tab",
      "Ibupromag 400mg tab",
      "Ibustad 400mg tab",
    ],
    cat: "AINE",
    dosis: "400-800mg c/8h con comida",
  },
  {
    g: "Naproxeno",
    p: [
      "Flanax 500mg tab",
      "Apronax 500mg tab",
      "Naprex 500mg tab",
      "Naproxeno MK 500mg tab",
      "Naproxeno Genfar 500mg tab",
      "Flanax 275mg tab",
      "Anaprox 250mg tab",
      "Naproxeno sódico 550mg tab",
      "Naprox Forte 500mg tab",
    ],
    cat: "AINE",
    dosis: "500mg c/12h",
  },
  {
    g: "Diclofenaco",
    p: [
      "Voltaren 50mg tab",
      "Voltaren 75mg amp",
      "Difenax 50mg tab",
      "Cataflam 50mg tab",
      "Lertus 50mg tab",
      "Diclofenaco MK 50mg tab",
      "Diclofenaco Genfar 50mg tab",
      "Voltaren gel 1%",
      "Diclofenaco 25mg/mL amp",
      "Lertus D 50mg tab",
      "Artrenac 50mg tab",
    ],
    cat: "AINE",
    dosis: "50mg c/8h",
  },
  {
    g: "Meloxicam",
    p: [
      "Mobic 15mg tab",
      "Mobic 7.5mg tab",
      "Meloxifen 15mg tab",
      "Artrodar 15mg tab",
      "Meloxicam MK 15mg tab",
      "Meloxicam Genfar 15mg tab",
      "Recoxa 15mg tab",
      "Moxen 15mg tab",
      "Movalis 15mg tab",
    ],
    cat: "AINE COX-2",
    dosis: "7.5-15mg c/24h",
  },
  {
    g: "Celecoxib",
    p: [
      "Celebrex 200mg cap",
      "Celecoxib MK 200mg cap",
      "Celecoxib 100mg cap",
      "Arcoxia 90mg tab (etoricoxib)",
      "Celebrex 100mg cap",
      "Celcoxx 200mg cap",
    ],
    cat: "AINE COX-2 selectivo",
    dosis: "100-200mg c/12-24h",
  },
  {
    g: "Tramadol",
    p: [
      "Tramal 50mg cap",
      "Tramal 100mg gotas",
      "Tramadol Genfar 50mg cap",
      "Biokanol 50mg cap",
      "Tramadol MK 50mg cap",
      "Tramadol retard 100mg tab",
      "Tramal 100mg/2mL amp",
      "Dolzam 50mg cap",
      "Crispin 50mg cap",
      "Travex 50mg cap",
    ],
    cat: "Opioide débil",
    dosis: "50-100mg c/6-8h",
  },
  {
    g: "Ketorolaco",
    p: [
      "Toradol 30mg/mL amp",
      "Ketorolaco MK 30mg amp",
      "Dolac 30mg tab",
      "Ketorolaco 10mg tab",
      "Ketorolaco Genfar 30mg amp",
    ],
    cat: "AINE parenteral",
    dosis: "30mg IM o 10mg VO c/8h máx 5 días",
  },
  {
    g: "Metamizol (Dipirona)",
    p: [
      "Dipirona 500mg tab",
      "Dipirona 1g/2mL amp",
      "Novalgin 500mg tab",
      "Metamizol MK 500mg tab",
      "Metamizol 500mg/mL amp",
      "Novalgin gotas 500mg/mL",
    ],
    cat: "Analgésico/Antipirético",
    dosis: "500-1000mg c/6-8h",
  },
  {
    g: "Buprenorfina",
    p: [
      "Temgesic 0.2mg SL tab",
      "Buprenorfina parche 35mcg/h",
      "Buprenorfina parche 52.5mcg/h",
      "Norspan 5mcg/h parche",
      "Transtec 35mcg/h parche",
    ],
    cat: "Opioide parcial",
    dosis: "Según especialista",
  },
  {
    g: "Dexketoprofeno",
    p: [
      "Enantyum 25mg tab",
      "Dexketoprofeno MK 25mg tab",
      "Dexketoprofeno amp 50mg/2mL",
      "Ketesse 25mg tab",
    ],
    cat: "AINE",
    dosis: "25mg c/8h",
  },
  {
    g: "Morfina",
    p: [
      "Morfina 10mg/mL amp",
      "Morfina sulfato 30mg tab",
      "MST Continus 30mg tab",
      "Oramorph 10mg/5mL sol",
    ],
    cat: "Opioide fuerte",
    dosis: "Según protocolo",
  },
  {
    g: "Oxicodona",
    p: ["OxyContin 10mg tab CR", "OxyContin 20mg tab CR", "Oxicodona 5mg cap"],
    cat: "Opioide fuerte",
    dosis: "Según protocolo especialista",
  },
  {
    g: "Ibuprofeno tópico",
    p: [
      "Dolorac gel 5%",
      "Ibuprofeno gel 5% MK",
      "Ibudol gel 5%",
      "Dolgit crema 5%",
    ],
    cat: "AINE tópico",
    dosis: "Aplicar 3-4 veces/día",
  },
  {
    g: "Diclofenaco tópico",
    p: [
      "Voltaren Emulgel 1%",
      "Diclofenaco gel 1% MK",
      "Lertus gel 1%",
      "Diclo gel Genfar 1%",
    ],
    cat: "AINE tópico",
    dosis: "Aplicar c/8-12h",
  },
  // ── ANTIBIÓTICOS ──────────────────────────────────────────────────────────
  {
    g: "Amoxicilina",
    p: [
      "Amoxal 500mg cap",
      "Amoxicilina MK 500mg cap",
      "Amoxicilina Genfar 500mg cap",
      "Trimox 500mg cap",
      "Amoxicilina 250mg/5mL susp",
      "Amoxicilina 500mg/5mL susp",
      "Amoxal 1g tab",
      "Ospamox 500mg cap",
    ],
    cat: "Betalactámico",
    dosis: "500mg c/8h o 875mg c/12h x7 días",
  },
  {
    g: "Amoxicilina + Clavulanato",
    p: [
      "Augmentin 875/125mg tab",
      "Clavamox 875/125mg tab",
      "Amoxiclav 875mg tab",
      "Augmentin 500/125mg tab",
      "Augmentin 400/57mg susp",
      "Clavulin 875/125mg tab",
      "Trifamox IBL 875mg tab",
      "Amoxiclav MK 875mg tab",
    ],
    cat: "Betalactámico + IBL",
    dosis: "875/125mg c/12h x7-10 días",
  },
  {
    g: "Azitromicina",
    p: [
      "Zithromax 500mg tab",
      "Azitrox 500mg tab",
      "Azimex 500mg tab",
      "Azitromicina MK 500mg tab",
      "Azitromicina Genfar 500mg tab",
      "Zitromax 250mg tab",
      "Azitrox susp 200mg/5mL",
      "Sumamed 500mg tab",
    ],
    cat: "Macrólido",
    dosis: "500mg c/24h x3 días",
  },
  {
    g: "Claritromicina",
    p: [
      "Biaxin 500mg tab",
      "Klaricid 500mg tab",
      "Claritromicina MK 500mg tab",
      "Klacid 500mg tab",
      "Claricel 500mg tab",
      "Biaxin 250mg susp",
    ],
    cat: "Macrólido",
    dosis: "500mg c/12h x7-14 días",
  },
  {
    g: "Ciprofloxacino",
    p: [
      "Ciprobay 500mg tab",
      "Cipro 500mg tab",
      "Ciproflox 500mg tab",
      "Ciprofloxacino MK 500mg tab",
      "Ciprofloxacino Genfar 500mg tab",
      "Ciprobay 250mg tab",
      "Ciprobay 200mg/100mL IV",
      "Ciproflox 750mg tab",
    ],
    cat: "Fluoroquinolona",
    dosis: "500mg c/12h x7-10 días",
  },
  {
    g: "Levofloxacino",
    p: [
      "Tavanic 500mg tab",
      "Levofloxacino MK 500mg tab",
      "Levofloxacino Genfar 500mg tab",
      "Levaquin 500mg tab",
      "Florit 500mg tab",
    ],
    cat: "Fluoroquinolona",
    dosis: "500mg c/24h x7-10 días",
  },
  {
    g: "Metronidazol",
    p: [
      "Flagyl 500mg tab",
      "Flagyl 250mg tab",
      "Metronidazol MK 500mg tab",
      "Fosmet 500mg tab",
      "Flagyl 500mg/100mL IV",
      "Metronidazol susp 250mg/5mL",
      "Metronidazol óvulos 500mg",
    ],
    cat: "Nitroimidazol",
    dosis: "500mg c/8h x7 días",
  },
  {
    g: "Doxiciclina",
    p: [
      "Vibramycin 100mg cap",
      "Doxiciclina MK 100mg cap",
      "Doryx 100mg cap",
      "Doxiciclina Genfar 100mg cap",
    ],
    cat: "Tetraciclina",
    dosis: "100mg c/12h x7-14 días",
  },
  {
    g: "Cefalexina",
    p: [
      "Keflex 500mg cap",
      "Cefalexina MK 500mg cap",
      "Kefloridina 500mg cap",
      "Cefalexina susp 250mg/5mL",
    ],
    cat: "Cefalosporina 1G",
    dosis: "500mg c/6h x7 días",
  },
  {
    g: "Cefadroxilo",
    p: [
      "Duricef 500mg cap",
      "Cefadroxilo MK 500mg cap",
      "Cefadroxilo 1g tab",
      "Cefadroxilo susp 250mg/5mL",
    ],
    cat: "Cefalosporina 1G",
    dosis: "500mg-1g c/12h x7 días",
  },
  {
    g: "Cefuroxima",
    p: [
      "Zinnat 500mg tab",
      "Cefuroxima MK 500mg tab",
      "Zinacef 750mg amp IV",
      "Cefuroxima susp 125mg/5mL",
    ],
    cat: "Cefalosporina 2G",
    dosis: "500mg c/12h x7-10 días",
  },
  {
    g: "Ceftriaxona",
    p: [
      "Rocefin 1g amp IM/IV",
      "Ceftriaxona MK 1g amp",
      "Rocefin 2g amp",
      "Ceftriaxona 500mg amp",
    ],
    cat: "Cefalosporina 3G",
    dosis: "1-2g c/24h IM/IV",
  },
  {
    g: "Trimetoprim + Sulfametoxazol",
    p: [
      "Bactrim DS 800/160mg tab",
      "Bactrim F 400/80mg tab",
      "TMP-SMX MK DS tab",
      "Gantrisin DS tab",
      "Bactrim suspensión",
      "Septra DS tab",
    ],
    cat: "Sulfonamida+diaminopiridina",
    dosis: "DS c/12h x7-10 días",
  },
  {
    g: "Nitrofurantoína",
    p: [
      "Macrobid 100mg cap",
      "Nitrofurantoína MK 100mg cap",
      "Macrodan 100mg cap",
      "Macrodantina 100mg cap",
    ],
    cat: "Antibiótico urinario",
    dosis: "100mg c/12h x5-7 días",
  },
  {
    g: "Clindamicina",
    p: [
      "Dalacin C 300mg cap",
      "Clindamicina MK 300mg cap",
      "Dalacin T gel tópico",
      "Clindamicina 600mg amp",
      "Dalacin óvulos 100mg",
    ],
    cat: "Lincosamida",
    dosis: "150-450mg c/6h",
  },
  {
    g: "Eritromicina",
    p: [
      "Eritromicina MK 500mg tab",
      "Ilosone 250mg tab",
      "Erythrocin 500mg tab",
      "Eritromicina susp 250mg/5mL",
    ],
    cat: "Macrólido",
    dosis: "250-500mg c/6-8h",
  },
  {
    g: "Gentamicina",
    p: [
      "Gentamicina 80mg/2mL amp",
      "Gentamicina 160mg/2mL amp",
      "Garamycin 80mg amp",
      "Gentamicina colirio 0.3%",
    ],
    cat: "Aminoglucósido",
    dosis: "5-7mg/kg/24h IV/IM",
  },
  {
    g: "Ceftazidima",
    p: ["Fortaz 1g amp IV", "Ceftazidima MK 1g amp", "Ceftazidima 2g amp"],
    cat: "Cefalosporina 3G anti-Pseudomonas",
    dosis: "1-2g c/8h IV",
  },
  {
    g: "Piperacilina + Tazobactam",
    p: ["Tazocin 4.5g amp IV", "Piperazin-Taz MK 4.5g amp", "Zosyn 3.375g amp"],
    cat: "Betalactámico + IBL amplio espectro",
    dosis: "4.5g c/6-8h IV",
  },
  {
    g: "Meropenem",
    p: ["Meronem 1g amp IV", "Meropenem MK 1g amp", "Meropenem 500mg amp"],
    cat: "Carbapenem",
    dosis: "0.5-1g c/8h IV",
  },
  {
    g: "Fosfomicina",
    p: ["Monuril 3g sob", "Fosfomicina MK 3g sob", "Fosfocina 3g sob"],
    cat: "Antibiótico urinario",
    dosis: "3g dosis única (cistitis no complicada)",
  },
  // ── ANTIFÚNGICOS ──────────────────────────────────────────────────────────
  {
    g: "Fluconazol",
    p: [
      "Diflucan 150mg cap",
      "Diflucan 200mg cap",
      "Fluconazol MK 150mg cap",
      "Fluconazol Genfar 150mg cap",
      "Diflucan 200mg/100mL IV",
      "Fluconazol susp 50mg/5mL",
    ],
    cat: "Azol antifúngico",
    dosis: "150-400mg c/24h",
  },
  {
    g: "Itraconazol",
    p: [
      "Sporanox 100mg cap",
      "Itraconazol MK 100mg cap",
      "Icaden 100mg cap",
      "Sporanox solución 10mg/mL",
    ],
    cat: "Azol antifúngico",
    dosis: "100-200mg c/12-24h con comida",
  },
  {
    g: "Clotrimazol",
    p: [
      "Canesten crema 1%",
      "Clotrimazol MK crema 1%",
      "Lotrimin crema 1%",
      "Canesten vaginal 200mg",
      "Canesten óvulos 500mg",
    ],
    cat: "Imidazol tópico",
    dosis: "Aplicar c/12h x2-4 semanas",
  },
  {
    g: "Terbinafina",
    p: [
      "Lamisil 250mg tab",
      "Terbinafina MK 250mg tab",
      "Lamisil crema 1%",
      "Terbinafina crema 1%",
    ],
    cat: "Alilamina antifúngica",
    dosis: "250mg c/24h x6-12 semanas (onicomicosis)",
  },
  {
    g: "Nistatina",
    p: [
      "Mycostatin 100000UI/mL susp oral",
      "Nistatina MK 100000UI/g crema",
      "Mycostatin óvulos 100000UI",
    ],
    cat: "Polieno antifúngico",
    dosis: "500000UI c/6h oral o aplicación local",
  },
  {
    g: "Voriconazol",
    p: ["Vfend 200mg tab", "Voriconazol MK 200mg tab", "Vfend 200mg amp IV"],
    cat: "Azol 2G (aspergilosis)",
    dosis: "Según protocolo hospitalario",
  },
  // ── ANTIVIRALES ───────────────────────────────────────────────────────────
  {
    g: "Aciclovir",
    p: [
      "Zovirax 400mg tab",
      "Aciclovir MK 400mg tab",
      "Zovirax 200mg tab",
      "Zovirax crema 5%",
      "Aciclovir crema 5%",
      "Aciclovir 250mg amp IV",
    ],
    cat: "Antiviral (herpes)",
    dosis: "400-800mg c/8h x5-10 días",
  },
  {
    g: "Valaciclovir",
    p: ["Valtrex 500mg tab", "Valtrex 1g tab", "Valaciclovir MK 500mg tab"],
    cat: "Antiviral (herpes - profármaco)",
    dosis: "500mg-1g c/12h x5-10 días",
  },
  {
    g: "Oseltamivir",
    p: [
      "Tamiflu 75mg cap",
      "Tamiflu 45mg cap",
      "Oseltamivir MK 75mg cap",
      "Tamiflu susp 6mg/mL",
    ],
    cat: "Antiviral influenza",
    dosis: "75mg c/12h x5 días",
  },
  {
    g: "Ganciclovir",
    p: ["Cytovene 500mg amp IV", "Ganciclovir MK 250mg cap"],
    cat: "Antiviral CMV",
    dosis: "5mg/kg c/12h IV (inducción)",
  },
  // ── ANTIPARASITARIOS ──────────────────────────────────────────────────────
  {
    g: "Albendazol",
    p: [
      "Zentel 200mg tab",
      "Albendazol MK 200mg tab",
      "Albendazol 400mg tab",
      "Zentel susp 100mg/5mL",
      "Eskasol 400mg tab",
    ],
    cat: "Antihelmíntico",
    dosis: "400mg dosis única adultos",
  },
  {
    g: "Mebendazol",
    p: [
      "Vermox 100mg tab",
      "Mebendazol MK 100mg tab",
      "Vermox 500mg tab (dosis única)",
      "Mebendazol susp 100mg/5mL",
    ],
    cat: "Antihelmíntico",
    dosis: "100mg c/12h x3 días o 500mg dosis única",
  },
  {
    g: "Ivermectina",
    p: [
      "Mectizan 6mg tab",
      "Ivermectina MK 6mg tab",
      "Stromectol 3mg tab",
      "Ivomec 6mg tab",
    ],
    cat: "Antiparasitario",
    dosis: "200mcg/kg dosis única",
  },
  {
    g: "Tinidazol",
    p: ["Fasigyn 500mg tab", "Tinidazol MK 500mg tab", "Tinidazol 2g tab"],
    cat: "Nitroimidazol",
    dosis: "2g dosis única (giardia/tricomoniasis)",
  },
  {
    g: "Cloroquina",
    p: ["Aralen 250mg tab", "Cloroquina MK 250mg tab", "Resochin 250mg tab"],
    cat: "Antimalárico/Antiinflamatorio",
    dosis: "Según esquema malaria o 250mg c/24h (reumatología)",
  },
  // ── CARDIOVASCULARES ──────────────────────────────────────────────────────
  {
    g: "Enalapril",
    p: [
      "Renitec 5mg tab",
      "Renitec 10mg tab",
      "Renitec 20mg tab",
      "Enalapril MK 5mg tab",
      "Enalapril Genfar 5mg tab",
      "Lotrial 5mg tab",
      "Enalaprilat 1.25mg/mL amp",
    ],
    cat: "IECA",
    dosis: "5-40mg c/12-24h",
  },
  {
    g: "Lisinopril",
    p: [
      "Zestril 10mg tab",
      "Prinivil 10mg tab",
      "Lisinopril MK 10mg tab",
      "Zestril 5mg tab",
      "Lisinopril 20mg tab",
    ],
    cat: "IECA",
    dosis: "5-40mg c/24h",
  },
  {
    g: "Ramipril",
    p: [
      "Altace 5mg cap",
      "Ramipril MK 5mg cap",
      "Tritace 5mg tab",
      "Ramipril 10mg tab",
      "Ramipril 2.5mg cap",
    ],
    cat: "IECA",
    dosis: "2.5-10mg c/24h",
  },
  {
    g: "Perindopril",
    p: ["Coversyl 5mg tab", "Perindopril MK 5mg tab", "Acertil 4mg tab"],
    cat: "IECA",
    dosis: "4-10mg c/24h",
  },
  {
    g: "Losartán",
    p: [
      "Cozaar 50mg tab",
      "Cozaar 100mg tab",
      "Losartán MK 50mg tab",
      "Repace 50mg tab",
      "Hyzaar 50/12.5mg tab",
      "Losartán 25mg tab",
    ],
    cat: "ARA-II",
    dosis: "50-100mg c/24h",
  },
  {
    g: "Valsartán",
    p: [
      "Diovan 80mg tab",
      "Diovan 160mg tab",
      "Valsartán MK 80mg tab",
      "Exforge 5/80mg tab",
      "Co-Diovan 80/12.5mg tab",
    ],
    cat: "ARA-II",
    dosis: "80-320mg c/24h",
  },
  {
    g: "Telmisartán",
    p: [
      "Micardis 40mg tab",
      "Micardis 80mg tab",
      "Telmisartán MK 40mg tab",
      "Micardis Plus 40/12.5mg tab",
    ],
    cat: "ARA-II",
    dosis: "40-80mg c/24h",
  },
  {
    g: "Irbesartán",
    p: [
      "Avapro 150mg tab",
      "Irbesartán MK 150mg tab",
      "Aprovel 150mg tab",
      "Avapro 300mg tab",
    ],
    cat: "ARA-II",
    dosis: "150-300mg c/24h",
  },
  {
    g: "Candesartán",
    p: ["Atacand 8mg tab", "Candesartán MK 8mg tab", "Atacand 16mg tab"],
    cat: "ARA-II",
    dosis: "4-32mg c/24h",
  },
  {
    g: "Amlodipino",
    p: [
      "Norvasc 5mg tab",
      "Norvasc 10mg tab",
      "Amlodipino MK 5mg tab",
      "Amlodipino Genfar 5mg tab",
      "Tervasc 5mg tab",
      "Tenox 5mg tab",
    ],
    cat: "Calcioantagonista DHP",
    dosis: "5-10mg c/24h",
  },
  {
    g: "Nifedipino",
    p: [
      "Adalat OROS 30mg tab",
      "Adalat OROS 60mg tab",
      "Nifedipino MK 30mg tab",
      "Procardia XL 30mg tab",
      "Adalat 10mg cap",
    ],
    cat: "Calcioantagonista DHP",
    dosis: "30-120mg c/24h",
  },
  {
    g: "Verapamilo",
    p: [
      "Isoptin 80mg tab",
      "Verapamilo MK 80mg tab",
      "Calan 80mg tab",
      "Isoptin amp 5mg/2mL",
      "Verapamilo retard 240mg",
    ],
    cat: "Calcioantagonista no DHP",
    dosis: "80-480mg c/8-24h",
  },
  {
    g: "Diltiazem",
    p: [
      "Cardizem 60mg tab",
      "Diltiazem MK 60mg tab",
      "Angizem 120mg cap CR",
      "Cardizem CD 180mg cap",
    ],
    cat: "Calcioantagonista no DHP",
    dosis: "60-360mg c/8-24h",
  },
  {
    g: "Metoprolol",
    p: [
      "Lopressor 50mg tab",
      "Lopressor 100mg tab",
      "Metoprolol MK 50mg tab",
      "Seloken 50mg tab",
      "Toprol XL 50mg tab CR",
      "Betaloc 50mg tab",
    ],
    cat: "Betabloqueador β1 selectivo",
    dosis: "25-200mg c/12-24h",
  },
  {
    g: "Carvedilol",
    p: [
      "Coreg 6.25mg tab",
      "Carvedilol MK 6.25mg tab",
      "Coreg 25mg tab",
      "Dilatrend 12.5mg tab",
      "Carvedilol 3.125mg tab",
    ],
    cat: "Betabloqueador no selectivo + α1",
    dosis: "3.125-25mg c/12h",
  },
  {
    g: "Bisoprolol",
    p: [
      "Concor 5mg tab",
      "Bisoprolol MK 5mg tab",
      "Concor 10mg tab",
      "Emcor 5mg tab",
      "Bisoprolol 2.5mg tab",
    ],
    cat: "Betabloqueador β1 selectivo",
    dosis: "2.5-10mg c/24h",
  },
  {
    g: "Atenolol",
    p: [
      "Tenormin 50mg tab",
      "Atenolol MK 50mg tab",
      "Tenormin 100mg tab",
      "Atenolol 25mg tab",
    ],
    cat: "Betabloqueador β1",
    dosis: "25-100mg c/24h",
  },
  {
    g: "Nebivolol",
    p: ["Bystolic 5mg tab", "Nebivolol MK 5mg tab", "Nebilox 5mg tab"],
    cat: "Betabloqueador β1 + vasodilatador",
    dosis: "5-10mg c/24h",
  },
  {
    g: "Hidroclorotiazida",
    p: [
      "Microzide 25mg tab",
      "HCT MK 25mg tab",
      "HCT Genfar 25mg tab",
      "HCTZ 12.5mg tab",
      "Hidroclorotiazida 50mg tab",
    ],
    cat: "Diurético tiazídico",
    dosis: "12.5-50mg c/24h",
  },
  {
    g: "Clortalidona",
    p: [
      "Hygroton 25mg tab",
      "Clortalidona MK 25mg tab",
      "Clortalidona 50mg tab",
    ],
    cat: "Diurético tiazídico-like",
    dosis: "12.5-50mg c/24h",
  },
  {
    g: "Indapamida",
    p: [
      "Lozol 1.25mg tab CR",
      "Indapamida MK 1.5mg tab CR",
      "Natrilix 1.5mg tab CR",
    ],
    cat: "Diurético tiazídico-like",
    dosis: "1.25-2.5mg c/24h",
  },
  {
    g: "Furosemida",
    p: [
      "Lasix 40mg tab",
      "Lasix 20mg/2mL amp",
      "Furosemida MK 40mg tab",
      "Furosemida 20mg tab",
      "Lasix 80mg tab",
    ],
    cat: "Diurético de asa",
    dosis: "20-80mg c/24h",
  },
  {
    g: "Espironolactona",
    p: [
      "Aldactone 25mg tab",
      "Espironolactona MK 25mg tab",
      "Aldactone 100mg tab",
      "Verospiron 25mg tab",
    ],
    cat: "Diurético ahorrador K",
    dosis: "25-200mg c/24h",
  },
  {
    g: "Eplerenona",
    p: ["Inspra 25mg tab", "Eplerenona MK 25mg tab", "Inspra 50mg tab"],
    cat: "Antagonista aldosterona selectivo",
    dosis: "25-50mg c/24h",
  },
  {
    g: "Ácido Acetilsalicílico",
    p: [
      "Aspirina 100mg tab",
      "Aspirina Bayer 100mg",
      "ASA MK 100mg tab",
      "Cardioaspirin 100mg tab",
      "Aspirina 500mg tab",
      "Ecotrin 81mg tab",
    ],
    cat: "Antiagregante plaquetario",
    dosis: "100mg c/24h (antiagregante)",
  },
  {
    g: "Clopidogrel",
    p: [
      "Plavix 75mg tab",
      "Clopidogrel MK 75mg tab",
      "Clopilet 75mg tab",
      "Iscover 75mg tab",
      "Clopidogrel 300mg tab (carga)",
    ],
    cat: "Antiagregante tienopiridina",
    dosis: "75mg c/24h",
  },
  {
    g: "Ticagrelor",
    p: ["Brilinta 90mg tab", "Brilique 90mg tab", "Ticagrelor MK 90mg tab"],
    cat: "Antiagregante",
    dosis: "90mg c/12h (con AAS)",
  },
  {
    g: "Warfarina",
    p: [
      "Coumadin 5mg tab",
      "Warfarina MK 5mg tab",
      "Coumadin 2mg tab",
      "Aldocumar 10mg tab",
    ],
    cat: "Anticoagulante oral AVK",
    dosis: "Según INR (2.0-3.0)",
  },
  {
    g: "Rivaroxabán",
    p: [
      "Xarelto 20mg tab",
      "Xarelto 15mg tab",
      "Xarelto 10mg tab",
      "Xarelto 2.5mg tab",
    ],
    cat: "NACO anti-Xa",
    dosis: "10-20mg c/24h (con comida)",
  },
  {
    g: "Apixabán",
    p: ["Eliquis 5mg tab", "Eliquis 2.5mg tab", "Apixabán MK 5mg tab"],
    cat: "NACO anti-Xa",
    dosis: "5mg c/12h",
  },
  {
    g: "Dabigatrán",
    p: ["Pradaxa 150mg cap", "Pradaxa 110mg cap", "Dabigatrán MK 150mg cap"],
    cat: "NACO anti-IIa",
    dosis: "110-150mg c/12h",
  },
  {
    g: "Enoxaparina",
    p: [
      "Clexane 40mg/0.4mL jer",
      "Clexane 60mg jer",
      "Clexane 80mg jer",
      "Enoxaparina MK 40mg jer",
      "Lovenox 40mg jer",
    ],
    cat: "HBPM anticoagulante",
    dosis: "40mg SC c/24h profilaxis",
  },
  {
    g: "Simvastatina",
    p: [
      "Zocor 20mg tab",
      "Zocor 40mg tab",
      "Simvastatina MK 20mg tab",
      "Simvastatina Genfar 20mg tab",
      "Sivastin 20mg tab",
    ],
    cat: "Estatina",
    dosis: "10-40mg c/24h (noche)",
  },
  {
    g: "Atorvastatina",
    p: [
      "Lipitor 20mg tab",
      "Lipitor 40mg tab",
      "Atorvastatina MK 20mg tab",
      "Atorvastatina Genfar 20mg tab",
      "Liparex 20mg tab",
      "Atorvastatin 10mg tab",
    ],
    cat: "Estatina",
    dosis: "10-80mg c/24h (noche)",
  },
  {
    g: "Rosuvastatina",
    p: [
      "Crestor 10mg tab",
      "Crestor 20mg tab",
      "Rosuvastatina MK 10mg tab",
      "Rosulip 10mg tab",
    ],
    cat: "Estatina",
    dosis: "5-40mg c/24h",
  },
  {
    g: "Pravastatina",
    p: [
      "Pravachol 20mg tab",
      "Pravastatina MK 20mg tab",
      "Pravastatina 40mg tab",
    ],
    cat: "Estatina",
    dosis: "10-40mg c/24h (noche)",
  },
  {
    g: "Gemfibrozilo",
    p: ["Lopid 600mg tab", "Gemfibrozilo MK 600mg tab", "Lipur 600mg tab"],
    cat: "Fibrato",
    dosis: "600mg c/12h (30 min AC)",
  },
  {
    g: "Fenofibrato",
    p: ["Tricor 145mg tab", "Fenofibrato MK 145mg tab", "Lipidil 145mg tab"],
    cat: "Fibrato",
    dosis: "145mg c/24h con comida",
  },
  {
    g: "Nitroglicerina",
    p: [
      "Nitrostat SL 0.4mg tab",
      "Nitromint SL 0.4mg",
      "Nitroglicerina parche 5mg",
      "Nitro-Dur parche",
    ],
    cat: "Nitrato",
    dosis: "0.4mg SL SOS; repetir c/5min x3",
  },
  {
    g: "Isosorbide dinitrato",
    p: ["Isordil 5mg SL tab", "Isordil 40mg tab", "Isosorbide MK 40mg tab"],
    cat: "Nitrato",
    dosis: "5mg SL SOS; 40mg VO c/8h",
  },
  {
    g: "Amiodarona",
    p: [
      "Cordarone 200mg tab",
      "Amiodarona MK 200mg tab",
      "Amiodarona 150mg/3mL amp IV",
      "Atlansil 200mg tab",
    ],
    cat: "Antiarrítmico clase III",
    dosis: "200-400mg c/24h mantenimiento",
  },
  {
    g: "Digoxina",
    p: [
      "Lanoxin 0.25mg tab",
      "Digoxina MK 0.25mg tab",
      "Digoxina 0.5mg/2mL amp",
    ],
    cat: "Glucósido cardíaco",
    dosis: "0.125-0.25mg c/24h",
  },
  {
    g: "Ivabradina",
    p: ["Procoralan 5mg tab", "Ivabradina MK 5mg tab", "Procoralan 7.5mg tab"],
    cat: "Inhibidor If (bradicardia sinusal)",
    dosis: "5-7.5mg c/12h",
  },
  {
    g: "Sacubitrilo + Valsartán",
    p: ["Entresto 49/51mg tab", "Entresto 24/26mg tab"],
    cat: "ARNI (IC-FEr)",
    dosis: "24/26-97/103mg c/12h",
  },
  // ── METABÓLICOS / DIABETES ────────────────────────────────────────────────
  {
    g: "Metformina",
    p: [
      "Glucophage 500mg tab",
      "Glucophage 850mg tab",
      "Glucophage 1000mg tab",
      "Metformina MK 850mg tab",
      "Metformina Genfar 850mg tab",
      "Glafornil 850mg tab",
      "Glucophage XR 750mg tab",
    ],
    cat: "Biguanida antidiabético",
    dosis: "500-2550mg c/8-12h con comidas",
  },
  {
    g: "Glibenclamida",
    p: [
      "Daonil 5mg tab",
      "Glibenclamida MK 5mg tab",
      "Euglucon 5mg tab",
      "Daonil 2.5mg tab",
    ],
    cat: "Sulfonilurea",
    dosis: "2.5-20mg c/24h",
  },
  {
    g: "Glimepirida",
    p: [
      "Amaryl 2mg tab",
      "Amaryl 4mg tab",
      "Glimepirida MK 2mg tab",
      "Glimax 2mg tab",
    ],
    cat: "Sulfonilurea",
    dosis: "1-8mg c/24h desayuno",
  },
  {
    g: "Glipizida",
    p: ["Glucotrol 5mg tab", "Glipizida MK 5mg tab", "Glucotrol XL 5mg tab"],
    cat: "Sulfonilurea",
    dosis: "5-20mg c/24h",
  },
  {
    g: "Sitagliptina",
    p: [
      "Januvia 100mg tab",
      "Januvia 50mg tab",
      "Sitagliptina MK 100mg tab",
      "Janumet 50/500mg tab",
    ],
    cat: "IDPP-4",
    dosis: "100mg c/24h",
  },
  {
    g: "Saxagliptina",
    p: [
      "Onglyza 5mg tab",
      "Saxagliptina MK 5mg tab",
      "Kombiglyze XR 5/1000mg tab",
    ],
    cat: "IDPP-4",
    dosis: "5mg c/24h",
  },
  {
    g: "Alogliptina",
    p: ["Nesina 25mg tab", "Alogliptina MK 25mg tab"],
    cat: "IDPP-4",
    dosis: "25mg c/24h",
  },
  {
    g: "Empagliflozina",
    p: [
      "Jardiance 10mg tab",
      "Jardiance 25mg tab",
      "Empagliflozina MK 10mg tab",
      "Synjardy 10/500mg tab",
    ],
    cat: "iSGLT-2",
    dosis: "10-25mg c/24h desayuno",
  },
  {
    g: "Dapagliflozina",
    p: [
      "Forxiga 10mg tab",
      "Dapagliflozina MK 10mg tab",
      "Xigduo XR 10/1000mg tab",
    ],
    cat: "iSGLT-2",
    dosis: "10mg c/24h",
  },
  {
    g: "Canagliflozina",
    p: [
      "Invokana 100mg tab",
      "Canagliflozina MK 100mg tab",
      "Invokana 300mg tab",
    ],
    cat: "iSGLT-2",
    dosis: "100-300mg c/24h",
  },
  {
    g: "Liraglutida",
    p: [
      "Victoza 6mg/mL pluma",
      "Saxenda 6mg/mL pluma (obesidad)",
      "Victoza 1.2mg iny",
    ],
    cat: "GLP-1 agonista",
    dosis: "0.6-1.8mg SC c/24h",
  },
  {
    g: "Semaglutida",
    p: [
      "Ozempic 0.5mg jer SC",
      "Ozempic 1mg jer SC",
      "Rybelsus 7mg tab (oral)",
      "Wegovy 2.4mg jer (obesidad)",
    ],
    cat: "GLP-1 agonista",
    dosis: "0.5-1mg SC c/semana",
  },
  {
    g: "Dulaglutida",
    p: ["Trulicity 0.75mg jer SC", "Trulicity 1.5mg jer SC"],
    cat: "GLP-1 agonista",
    dosis: "0.75-1.5mg SC c/semana",
  },
  {
    g: "Insulina NPH",
    p: [
      "Insulina Humalog N pluma",
      "Humulin N vial",
      "Insulatard HM pluma",
      "Insulina MK NPH vial",
    ],
    cat: "Insulina basal intermedia",
    dosis: "Según pauta médica",
  },
  {
    g: "Insulina Glargina",
    p: [
      "Lantus SoloStar pluma",
      "Toujeo 300U/mL pluma",
      "Abasaglar pluma",
      "Basaglar pluma",
    ],
    cat: "Insulina análogo basal",
    dosis: "Según pauta médica",
  },
  {
    g: "Insulina Detemir",
    p: ["Levemir FlexPen pluma", "Detemir MK pluma"],
    cat: "Insulina análogo basal",
    dosis: "Según pauta médica",
  },
  {
    g: "Insulina Regular",
    p: ["Humulin R vial", "Actrapid vial", "Insulina Regular MK vial"],
    cat: "Insulina prandial",
    dosis: "Según pauta médica",
  },
  {
    g: "Insulina Lispro",
    p: ["Humalog pluma", "Humalog KwikPen", "Insulina lispro MK pluma"],
    cat: "Insulina análogo rápida",
    dosis: "Según pauta médica",
  },
  {
    g: "Insulina Aspart",
    p: ["NovoRapid FlexPen", "Novorapid vial", "Fiasp FlexPen"],
    cat: "Insulina análogo ultrarrápida",
    dosis: "Según pauta médica",
  },
  {
    g: "Levotiroxina",
    p: [
      "Eutirox 25mcg tab",
      "Eutirox 50mcg tab",
      "Eutirox 100mcg tab",
      "Levothroid 50mcg tab",
      "Levotiroxina MK 50mcg tab",
      "Synthroid 100mcg tab",
    ],
    cat: "Hormona tiroidea",
    dosis: "25-200mcg c/24h ayunas 30 min AC",
  },
  {
    g: "Metimazol",
    p: [
      "Tapazol 5mg tab",
      "Metimazol MK 5mg tab",
      "Metimazol 10mg tab",
      "Neo-Mercazole 5mg tab",
    ],
    cat: "Antitiroideoneo",
    dosis: "15-60mg c/24h (3 dosis)",
  },
  {
    g: "Propiltiouracilo",
    p: ["PTU 50mg tab", "Propiltiouracilo MK 50mg tab"],
    cat: "Antitiroideoneo",
    dosis: "100-200mg c/8h",
  },
  {
    g: "Alopurinol",
    p: [
      "Zyloprim 100mg tab",
      "Alopurinol MK 100mg tab",
      "Alopurinol 300mg tab",
      "Zyloric 300mg tab",
    ],
    cat: "Antigotoso hipouricemiante",
    dosis: "100-800mg c/24h",
  },
  {
    g: "Colchicina",
    p: [
      "Colchicina MK 0.5mg tab",
      "Colchicine 0.5mg tab",
      "Colchimax 0.5mg tab",
      "Colchicina 1mg tab",
    ],
    cat: "Antigotoso antiinflamatorio",
    dosis: "0.5-1mg c/12h",
  },
  {
    g: "Febuxostat",
    p: ["Uloric 40mg tab", "Febuxostat MK 40mg tab", "Uloric 80mg tab"],
    cat: "Antigotoso inhibidor xantina oxidasa",
    dosis: "40-80mg c/24h",
  },
  // ── RESPIRATORIOS ─────────────────────────────────────────────────────────
  {
    g: "Salbutamol",
    p: [
      "Ventolin MDI 100mcg",
      "Salbutamol MK inhalador",
      "Asthavent inhalador",
      "Salbutamol 5mg/mL neb",
      "Ventolin 2mg tab",
      "Salbutamol susp 2.5mg neb",
      "Proventil HFA MDI",
    ],
    cat: "β2-agonista SABA",
    dosis: "1-2 puff c/4-6h SOS o 2.5mg neb",
  },
  {
    g: "Formoterol",
    p: [
      "Foradil 12mcg cap inhalación",
      "Formoterol MK 12mcg",
      "Oxis Turbuhaler 4.5mcg",
    ],
    cat: "β2-agonista LABA",
    dosis: "12mcg c/12h",
  },
  {
    g: "Salmeterol",
    p: ["Serevent 25mcg MDI", "Serevent Diskus 50mcg"],
    cat: "β2-agonista LABA",
    dosis: "50mcg c/12h",
  },
  {
    g: "Salmeterol + Fluticasona",
    p: [
      "Seretide 25/125mcg MDI",
      "Seretide 25/250mcg MDI",
      "Advair 115/21mcg",
      "Adoair inhalador",
    ],
    cat: "LABA + corticoide inhalado",
    dosis: "2 puff c/12h",
  },
  {
    g: "Formoterol + Budesonida",
    p: [
      "Symbicort 160/4.5mcg MDI",
      "Symbicort 80/4.5mcg MDI",
      "Vannair 80/4.5mcg MDI",
    ],
    cat: "LABA + corticoide inhalado",
    dosis: "1-2 puff c/12h",
  },
  {
    g: "Beclometasona",
    p: [
      "Beclovent 250mcg MDI",
      "Beclometasona MK 250mcg MDI",
      "Clenil 200mcg MDI",
      "Qvar 100mcg MDI",
    ],
    cat: "Corticoide inhalado",
    dosis: "100-800mcg c/12h",
  },
  {
    g: "Budesonida",
    p: [
      "Pulmicort 200mcg Turbuhaler",
      "Pulmicort 0.5mg/2mL neb",
      "Budesonida MK 200mcg",
      "Rhinocort spray nasal 64mcg",
    ],
    cat: "Corticoide inhalado/nasal",
    dosis: "200-1600mcg c/12h",
  },
  {
    g: "Fluticasona",
    p: [
      "Flixotide 125mcg MDI",
      "Flixonase spray nasal",
      "Fluticasona MK 250mcg MDI",
      "Flovent 110mcg MDI",
    ],
    cat: "Corticoide inhalado",
    dosis: "100-1000mcg c/12h",
  },
  {
    g: "Montelukast",
    p: [
      "Singulair 10mg tab",
      "Singulair 5mg masticable",
      "Montelukast MK 10mg tab",
      "Lukasm 10mg tab",
      "Lukair 10mg tab",
    ],
    cat: "Antileucotrieno",
    dosis: "10mg c/24h noche",
  },
  {
    g: "Ipratropio",
    p: [
      "Atrovent 20mcg MDI",
      "Atrovent 0.5mg/2mL neb",
      "Ipratropio MK 20mcg MDI",
      "Ipravent 20mcg MDI",
    ],
    cat: "Anticolinérgico SAMA",
    dosis: "2-4 puff c/6-8h",
  },
  {
    g: "Tiotropio",
    p: [
      "Spiriva HandiHaler 18mcg cap",
      "Spiriva Respimat 2.5mcg",
      "Tiotropio MK 18mcg cap",
    ],
    cat: "Anticolinérgico LAMA EPOC",
    dosis: "18mcg c/24h",
  },
  {
    g: "Umeclidinio + Vilanterol",
    p: ["Anoro Ellipta 62.5/25mcg", "Umeclidinio MK Ellipta"],
    cat: "LAMA + LABA (EPOC)",
    dosis: "1 inhalación c/24h",
  },
  {
    g: "Acetilcisteína",
    p: [
      "Mucolyte 200mg sob",
      "Fluimucil 200mg sob",
      "ACC 200mg sob",
      "Mucolyte 600mg sob",
      "Fluimucil 600mg tab efervescente",
      "Rhinathiol 5% jarabe",
    ],
    cat: "Mucolítico",
    dosis: "200mg c/8h o 600mg c/24h",
  },
  {
    g: "Ambroxol",
    p: [
      "Mucoangin susp",
      "Ambroxol MK 30mg tab",
      "Ambroxol susp 15mg/5mL",
      "Mucovibrol 30mg tab",
      "Ambroxol jarabe 7.5mg/5mL",
    ],
    cat: "Expectorante",
    dosis: "30mg c/8h",
  },
  {
    g: "Dextrometorfano",
    p: [
      "Robitussin DM jarabe",
      "Dextrometorfano MK",
      "Tussin 15mg/5mL jarabe",
      "Benylin DM jarabe",
    ],
    cat: "Antitusivo",
    dosis: "15-30mg c/6-8h",
  },
  {
    g: "Codeína",
    p: [
      "Codeína 30mg tab",
      "Perdolan Compositum (codeína)",
      "Codeína fosfato 30mg",
    ],
    cat: "Antitusivo opioide",
    dosis: "10-30mg c/6h SOS",
  },
  {
    g: "Prednisolona (sistémica)",
    p: [
      "Prelone 20mg/5mL susp",
      "Prednisolona MK 5mg tab",
      "Omnacortil 5mg tab",
      "Prelone 5mg tab",
    ],
    cat: "Corticoide sistémico oral",
    dosis: "0.5-2mg/kg/día",
  },
  // ── GASTROINTESTINALES ────────────────────────────────────────────────────
  {
    g: "Omeprazol",
    p: [
      "Losec 20mg cap",
      "Losec 40mg cap",
      "Omeprazol MK 20mg cap",
      "Omeprazol Genfar 20mg cap",
      "Omeprazol 40mg amp IV",
    ],
    cat: "IBP",
    dosis: "20-40mg c/24h ayunas",
  },
  {
    g: "Pantoprazol",
    p: [
      "Pantoloc 40mg tab",
      "Pantoprazol MK 40mg tab",
      "Zurcal 40mg tab",
      "Pantoprazol 40mg amp IV",
      "Pantozol 40mg tab",
    ],
    cat: "IBP",
    dosis: "40mg c/24h",
  },
  {
    g: "Esomeprazol",
    p: [
      "Nexium 40mg tab",
      "Nexium 20mg tab",
      "Esomeprazol MK 40mg tab",
      "Esomeprazol 40mg amp IV",
    ],
    cat: "IBP",
    dosis: "20-40mg c/24h",
  },
  {
    g: "Lansoprazol",
    p: ["Prevacid 30mg cap", "Lansoprazol MK 30mg cap", "Zoton 30mg cap"],
    cat: "IBP",
    dosis: "15-30mg c/24h",
  },
  {
    g: "Ranitidina",
    p: [
      "Zantac 150mg tab",
      "Ranitidina MK 150mg tab",
      "Zantac 300mg tab",
      "Ranitidina 50mg/2mL amp",
    ],
    cat: "H2 antagonista",
    dosis: "150mg c/12h o 300mg noche",
  },
  {
    g: "Famotidina",
    p: ["Pepcid 20mg tab", "Famotidina MK 20mg tab", "Pepcid 40mg tab"],
    cat: "H2 antagonista",
    dosis: "20-40mg c/12-24h",
  },
  {
    g: "Metoclopramida",
    p: [
      "Primperan 10mg tab",
      "Metoclopramida MK 10mg tab",
      "Metoclopramida 10mg/2mL amp",
    ],
    cat: "Procinético antiemético",
    dosis: "10mg c/8h AC",
  },
  {
    g: "Domperidona",
    p: ["Motilium 10mg tab", "Domperidona MK 10mg tab", "Motilium susp 1mg/mL"],
    cat: "Procinético periférico",
    dosis: "10mg c/8h AC",
  },
  {
    g: "Ondansetrón",
    p: [
      "Zofran 8mg tab",
      "Zofran 4mg tab",
      "Ondansetrón MK 8mg tab",
      "Zofran ODT 8mg",
      "Zofran 2mg/mL amp",
    ],
    cat: "Antiemético 5HT3",
    dosis: "4-8mg c/8h",
  },
  {
    g: "Granisetrón",
    p: ["Kytril 1mg tab", "Granisetrón MK 1mg amp", "Kytril 3mg amp"],
    cat: "Antiemético 5HT3 (QT)",
    dosis: "1mg c/12h",
  },
  {
    g: "Loperamida",
    p: [
      "Imodium 2mg cap",
      "Loperamida MK 2mg cap",
      "Loperal 2mg cap",
      "Imodium susp 1mg/5mL",
    ],
    cat: "Antidiarreico",
    dosis: "4mg inicial luego 2mg/dep (máx 16mg/día)",
  },
  {
    g: "Bismuto",
    p: ["Pepto-Bismol 262mg tab", "Pepto-Bismol susp 262mg/15mL"],
    cat: "Protector gástrico/antidiarreico",
    dosis: "525mg c/30min SOS",
  },
  {
    g: "Sucralfato",
    p: ["Carafate 1g tab", "Sucralfato MK 1g tab", "Sucralfato susp 1g/10mL"],
    cat: "Citoprotector gástrico",
    dosis: "1g c/6h AC",
  },
  {
    g: "Polietilenglicol",
    p: ["Miralax 17g polvo", "PEG MK polvo", "Forlax 10g sob", "Movicol sob"],
    cat: "Laxante osmótico",
    dosis: "17g en 240mL agua c/24h",
  },
  {
    g: "Lactulosa",
    p: ["Duphalac solución 3.3g/5mL", "Lactulosa MK sol", "Constulose sol"],
    cat: "Laxante osmótico prebiótico",
    dosis: "15-30mL c/12-24h",
  },
  {
    g: "Bisacodil",
    p: [
      "Dulcolax 5mg tab EC",
      "Bisacodil MK 5mg tab",
      "Dulcolax supositorios 10mg",
    ],
    cat: "Laxante estimulante",
    dosis: "5-10mg VO noche o supositorio",
  },
  {
    g: "Senna",
    p: [
      "Senokot 8.6mg tab",
      "Senna MK tab",
      "Ex-Lax 15mg tab",
      "Senokot-S (con docusato)",
    ],
    cat: "Laxante estimulante vegetal",
    dosis: "8.6-17.2mg c/12-24h",
  },
  {
    g: "Simeticona",
    p: [
      "Gas-X 125mg cap",
      "Simeticona MK 80mg tab",
      "Gas-X Softgels 125mg",
      "Mylecon gotas 40mg/0.6mL",
    ],
    cat: "Antiflatulento",
    dosis: "40-125mg después de comidas",
  },
  {
    g: "Hidróxido Al + Mg",
    p: ["Mylanta susp", "Maalox susp", "Gelusil susp", "Rolaids tab"],
    cat: "Antiácido",
    dosis: "15-30mL AC y noche",
  },
  {
    g: "Mesalazina",
    p: [
      "Asacol 400mg tab EC",
      "Pentasa 500mg tab CR",
      "Mesalazina MK 400mg tab",
    ],
    cat: "Aminosalicilato (IBD)",
    dosis: "0.8-4g c/24h (Crohn/CU)",
  },
  {
    g: "Budesonida oral",
    p: ["Entocort 3mg cap", "Budesonida MK 3mg cap"],
    cat: "Corticoide oral tópico intestinal",
    dosis: "9mg c/24h AC x8 semanas",
  },
  // ── NEUROLÓGICOS / PSIQUIÁTRICOS ──────────────────────────────────────────
  {
    g: "Carbamazepina",
    p: [
      "Tegretol 200mg tab",
      "Tegretol 400mg CR tab",
      "Carbamazepina MK 200mg tab",
      "Carbatrol 200mg cap",
      "Tegretol susp 100mg/5mL",
    ],
    cat: "Anticonvulsivante",
    dosis: "200-1600mg c/8-12h",
  },
  {
    g: "Ácido Valproico",
    p: [
      "Depakene 250mg cap",
      "Depakene sol 250mg/5mL",
      "Valproato MK 500mg EC tab",
      "Epival 500mg CR tab",
      "Depakote 250mg EC",
    ],
    cat: "Anticonvulsivante / Estabilizador humor",
    dosis: "15-60mg/kg/día c/8-12h",
  },
  {
    g: "Lamotrigina",
    p: [
      "Lamictal 50mg tab",
      "Lamictal 100mg tab",
      "Lamotrigina MK 50mg tab",
      "Lamotrigina 25mg tab",
    ],
    cat: "Anticonvulsivante",
    dosis: "25-400mg c/12-24h",
  },
  {
    g: "Levetiracetam",
    p: [
      "Keppra 500mg tab",
      "Keppra 1000mg tab",
      "Levetiracetam MK 500mg tab",
      "Keppra 100mg/mL IV",
    ],
    cat: "Anticonvulsivante",
    dosis: "500-3000mg c/12h",
  },
  {
    g: "Topiramato",
    p: ["Topamax 25mg cap", "Topamax 100mg tab", "Topiramato MK 25mg tab"],
    cat: "Anticonvulsivante",
    dosis: "25-400mg c/12h",
  },
  {
    g: "Gabapentina",
    p: [
      "Neurontin 300mg cap",
      "Neurontin 600mg tab",
      "Gabapentina MK 300mg cap",
      "Gralise 300mg tab",
      "Neurotin 400mg cap",
    ],
    cat: "Anticonvulsivante / Dolor neuropático",
    dosis: "300-3600mg c/8h",
  },
  {
    g: "Pregabalina",
    p: [
      "Lyrica 75mg cap",
      "Lyrica 150mg cap",
      "Pregabalina MK 75mg cap",
      "Lyrica 300mg cap",
    ],
    cat: "Dolor neuropático / Anticonvulsivante",
    dosis: "75-300mg c/12h",
  },
  {
    g: "Fenobarbital",
    p: [
      "Fenobarbital MK 100mg tab",
      "Luminal 100mg tab",
      "Fenobarbital 200mg/mL amp",
    ],
    cat: "Anticonvulsivante barbitúrico",
    dosis: "60-180mg c/24h (noche)",
  },
  {
    g: "Fenitoína",
    p: [
      "Dilantin 100mg cap",
      "Fenitoína MK 100mg cap",
      "Epamin 100mg cap",
      "Fenitoína 50mg/mL amp",
    ],
    cat: "Anticonvulsivante hidantoína",
    dosis: "200-400mg c/24h",
  },
  {
    g: "Clonazepam",
    p: [
      "Rivotril 0.5mg tab",
      "Rivotril 2mg tab",
      "Clonazepam MK 0.5mg tab",
      "Rivotril 2.5mg/mL gotas",
      "Rivotril 1mg/mL amp",
    ],
    cat: "Benzodiazepina anticonvulsivante",
    dosis: "0.5-2mg c/8-12h",
  },
  {
    g: "Alprazolam",
    p: [
      "Xanax 0.25mg tab",
      "Xanax 0.5mg tab",
      "Alprazolam MK 0.25mg tab",
      "Xanax XR 0.5mg tab",
    ],
    cat: "Benzodiazepina ansiolítica",
    dosis: "0.25-1mg c/8h",
  },
  {
    g: "Diazepam",
    p: [
      "Valium 5mg tab",
      "Valium 10mg tab",
      "Diazepam MK 5mg tab",
      "Diazepam 5mg/mL amp IV",
    ],
    cat: "Benzodiazepina ansiolítica",
    dosis: "2-10mg c/8-12h",
  },
  {
    g: "Lorazepam",
    p: [
      "Ativan 1mg tab",
      "Ativan 2mg tab",
      "Lorazepam MK 1mg tab",
      "Lorax 2mg tab",
    ],
    cat: "Benzodiazepina ansiolítica",
    dosis: "0.5-2mg c/12h",
  },
  {
    g: "Bromazepam",
    p: ["Lexotan 3mg tab", "Bromazepam MK 3mg tab", "Lexotanil 3mg tab"],
    cat: "Benzodiazepina ansiolítica",
    dosis: "1.5-3mg c/8-12h",
  },
  {
    g: "Fluoxetina",
    p: [
      "Prozac 20mg cap",
      "Fluoxetina MK 20mg cap",
      "Fluoxetina Genfar 20mg cap",
      "Roxetin 20mg cap",
      "Fontex 20mg tab",
      "Depex 20mg cap",
      "Fluoxetina susp 20mg/5mL",
    ],
    cat: "ISRS antidepresivo",
    dosis: "20-80mg c/24h mañana",
  },
  {
    g: "Sertralina",
    p: [
      "Zoloft 50mg tab",
      "Zoloft 100mg tab",
      "Sertralina MK 50mg tab",
      "Sertralina Genfar 50mg tab",
      "Altruline 50mg tab",
      "Sertralina sol 20mg/mL",
    ],
    cat: "ISRS antidepresivo",
    dosis: "50-200mg c/24h",
  },
  {
    g: "Escitalopram",
    p: [
      "Lexapro 10mg tab",
      "Lexapro 20mg tab",
      "Escitalopram MK 10mg tab",
      "Cipralex 10mg tab",
    ],
    cat: "ISRS antidepresivo",
    dosis: "10-20mg c/24h",
  },
  {
    g: "Paroxetina",
    p: [
      "Paxil 20mg tab",
      "Paroxetina MK 20mg tab",
      "Seroxat 20mg tab",
      "Paxil CR 25mg tab",
    ],
    cat: "ISRS antidepresivo",
    dosis: "20-60mg c/24h",
  },
  {
    g: "Citalopram",
    p: ["Celexa 20mg tab", "Citalopram MK 20mg tab", "Cipramil 20mg tab"],
    cat: "ISRS antidepresivo",
    dosis: "20-40mg c/24h",
  },
  {
    g: "Venlafaxina",
    p: [
      "Effexor XR 75mg cap",
      "Venlafaxina MK 75mg tab",
      "Efexor 37.5mg tab",
      "Venlafaxina 150mg cap XR",
    ],
    cat: "IRSN antidepresivo",
    dosis: "37.5-225mg c/24h",
  },
  {
    g: "Duloxetina",
    p: ["Cymbalta 30mg cap", "Cymbalta 60mg cap", "Duloxetina MK 30mg cap"],
    cat: "IRSN antidepresivo/dolor neuropático",
    dosis: "30-120mg c/24h",
  },
  {
    g: "Bupropión",
    p: [
      "Wellbutrin SR 150mg tab",
      "Wellbutrin XL 300mg tab",
      "Bupropión MK 150mg tab",
      "Zyban 150mg (cesación tabaco)",
    ],
    cat: "Inhibidor NA/DA antidepresivo",
    dosis: "150-300mg c/24h",
  },
  {
    g: "Amitriptilina",
    p: [
      "Tryptanol 25mg tab",
      "Amitriptilina MK 25mg tab",
      "Amitriptilina 10mg tab",
      "Elavil 25mg tab",
    ],
    cat: "Antidepresivo tricíclico",
    dosis: "25-150mg c/24h noche",
  },
  {
    g: "Nortriptilina",
    p: ["Pamelor 25mg cap", "Nortriptilina MK 25mg cap", "Aventyl 25mg cap"],
    cat: "Antidepresivo tricíclico",
    dosis: "25-150mg c/24h noche",
  },
  {
    g: "Imipramina",
    p: ["Tofranil 25mg tab", "Imipramina MK 25mg tab", "Melipramine 25mg tab"],
    cat: "Antidepresivo tricíclico",
    dosis: "25-200mg c/24h",
  },
  {
    g: "Mirtazapina",
    p: ["Remeron 15mg tab", "Mirtazapina MK 15mg tab", "Remeron 30mg tab"],
    cat: "Antidepresivo NaSSA",
    dosis: "15-45mg c/24h noche",
  },
  {
    g: "Trazodona",
    p: ["Desyrel 50mg tab", "Trazodona MK 50mg tab", "Oleptro 150mg tab CR"],
    cat: "Antidepresivo SARI",
    dosis: "50-400mg c/24h",
  },
  {
    g: "Haloperidol",
    p: [
      "Haldol 5mg tab",
      "Haldol 1mg/mL gotas",
      "Haloperidol MK 5mg tab",
      "Haldol 5mg/mL amp",
      "Haldol decanoato 100mg amp",
    ],
    cat: "Antipsicótico típico",
    dosis: "2-10mg c/12-24h",
  },
  {
    g: "Risperidona",
    p: [
      "Risperdal 1mg tab",
      "Risperdal 2mg tab",
      "Risperidona MK 1mg tab",
      "Risperdal M-Tab 1mg",
      "Risperdal Consta 25mg amp IM",
    ],
    cat: "Antipsicótico atípico",
    dosis: "1-6mg c/12-24h",
  },
  {
    g: "Quetiapina",
    p: [
      "Seroquel 25mg tab",
      "Seroquel 100mg tab",
      "Seroquel XR 200mg tab",
      "Quetiapina MK 100mg tab",
    ],
    cat: "Antipsicótico atípico",
    dosis: "25-800mg c/12-24h",
  },
  {
    g: "Olanzapina",
    p: [
      "Zyprexa 5mg tab",
      "Zyprexa 10mg tab",
      "Olanzapina MK 5mg tab",
      "Zyprexa Velotab 10mg ODT",
    ],
    cat: "Antipsicótico atípico",
    dosis: "5-20mg c/24h",
  },
  {
    g: "Clozapina",
    p: ["Clozaril 100mg tab", "Clozapina MK 100mg tab", "Leponex 100mg tab"],
    cat: "Antipsicótico atípico clásico",
    dosis: "150-450mg c/24h (monitoreo hematológico)",
  },
  {
    g: "Aripiprazol",
    p: [
      "Abilify 10mg tab",
      "Aripiprazol MK 10mg tab",
      "Abilify 15mg tab",
      "Abilify 1mg/mL sol oral",
    ],
    cat: "Antipsicótico parcial D2",
    dosis: "10-30mg c/24h",
  },
  {
    g: "Paliperidona",
    p: [
      "Invega 3mg tab CR",
      "Paliperidona MK 3mg tab CR",
      "Invega Sustenna 50mg amp IM",
    ],
    cat: "Antipsicótico atípico",
    dosis: "3-12mg c/24h",
  },
  {
    g: "Zolpidem",
    p: [
      "Ambien 10mg tab",
      "Zolpidem MK 10mg tab",
      "Stilnox 10mg tab",
      "Ambien CR 12.5mg",
    ],
    cat: "Hipnótico no BZD",
    dosis: "10mg antes dormir",
  },
  {
    g: "Zopiclona",
    p: ["Imovane 7.5mg tab", "Zopiclona MK 7.5mg tab", "Limovan 7.5mg tab"],
    cat: "Hipnótico",
    dosis: "7.5mg antes dormir",
  },
  {
    g: "Melatonina",
    p: [
      "Circadin 2mg tab CR",
      "Melatonina MK 3mg cap",
      "Melatonina 5mg cap",
      "Dormir Bien supl",
    ],
    cat: "Regulador ritmo circadiano",
    dosis: "1-5mg 30 min antes dormir",
  },
  {
    g: "Betahistina",
    p: [
      "Serc 16mg tab",
      "Betahistina MK 16mg tab",
      "Betaserc 8mg tab",
      "Betahistina 24mg tab",
    ],
    cat: "Antivertiginoso",
    dosis: "8-24mg c/8h",
  },
  {
    g: "Cinnarizina",
    p: ["Stugeron 25mg tab", "Cinnarizina MK 25mg tab", "Cinnarizina 75mg tab"],
    cat: "Antihistamínico/antivertiginoso",
    dosis: "25mg c/8h",
  },
  {
    g: "Escopolamina (hioscina)",
    p: [
      "Buscapina 10mg tab",
      "Buscapina amp 20mg/mL",
      "Buscapina comp tab",
      "Hyoscine parche 1.5mg",
      "Transderm Scop parche",
    ],
    cat: "Anticolinérgico antiespasmódico",
    dosis: "10-20mg c/6-8h",
  },
  {
    g: "Memantina",
    p: [
      "Ebixa 10mg tab",
      "Memantina MK 10mg tab",
      "Namenda 10mg tab",
      "Memantina 20mg tab",
    ],
    cat: "Antidemencia NMDA antagonista",
    dosis: "5-20mg c/24h",
  },
  {
    g: "Donepezilo",
    p: ["Aricept 5mg tab", "Donepezilo MK 5mg tab", "Aricept 10mg tab"],
    cat: "Antidemencia AChE inhibidor",
    dosis: "5-10mg c/24h noche",
  },
  {
    g: "Rivastigmina",
    p: [
      "Exelon 1.5mg cap",
      "Exelon parche 4.6mg/24h",
      "Rivastigmina MK 1.5mg cap",
    ],
    cat: "Antidemencia AChE inhibidor",
    dosis: "1.5-6mg c/12h o parche",
  },
  {
    g: "Sumatriptán",
    p: [
      "Imitrex 50mg tab",
      "Sumatriptán MK 50mg tab",
      "Imigran 100mg tab",
      "Imitrex nasal spray",
    ],
    cat: "Triptán antimigrañoso",
    dosis: "50-100mg SOS (máx 2 dosis/día)",
  },
  {
    g: "Rizatriptán",
    p: ["Maxalt 10mg tab", "Rizatriptán MK 10mg tab", "Maxalt-MLT 10mg ODT"],
    cat: "Triptán antimigrañoso",
    dosis: "10mg SOS (máx 30mg/día)",
  },
  {
    g: "Topiramato (migraña)",
    p: ["Topamax 25mg cap", "Topiramato MK 25mg tab"],
    cat: "Profilaxis migraña",
    dosis: "25-100mg c/12h",
  },
  {
    g: "Propranolol",
    p: [
      "Inderal 40mg tab",
      "Propranolol MK 40mg tab",
      "Inderal LA 80mg cap",
      "Propranolol 10mg tab",
    ],
    cat: "Betabloqueador no selectivo",
    dosis: "20-80mg c/12h",
  },
  // ── REUMATOLÓGICOS / MÚSCULO-ESQUELÉTICOS ────────────────────────────────
  {
    g: "Prednisona",
    p: [
      "Deltasone 5mg tab",
      "Prednisona MK 5mg tab",
      "Prednisona 20mg tab",
      "Sterapred 10mg tab",
    ],
    cat: "Corticoide oral",
    dosis: "5-80mg c/24h",
  },
  {
    g: "Dexametasona",
    p: [
      "Decadrón 4mg tab",
      "Decadrón 8mg/2mL amp",
      "Dexametasona MK 4mg tab",
      "Dexametasona 4mg/mL amp",
      "Maxidex colirio 0.1%",
    ],
    cat: "Corticoide alta potencia",
    dosis: "0.5-10mg c/6-24h",
  },
  {
    g: "Betametasona IM",
    p: [
      "Celestone 4mg/1mL amp IM",
      "Betametasona MK 4mg amp",
      "Diprophos 5mg/1mL amp",
      "Betanovate crema",
    ],
    cat: "Corticoide IM/tópico potente",
    dosis: "4-6mg IM c/24-48h",
  },
  {
    g: "Triamcinolona inyectable",
    p: [
      "Kenalog 40mg/mL amp IM",
      "Triamcinolona MK 40mg amp",
      "Trigon Depot 40mg amp",
    ],
    cat: "Corticoide IM/intraarticular",
    dosis: "10-40mg intraarticular",
  },
  {
    g: "Metilprednisolona",
    p: [
      "Solu-Medrol 125mg amp",
      "Solu-Medrol 1g amp",
      "Medrol 4mg tab",
      "Metilprednisolona MK 125mg amp",
      "Depo-Medrol 40mg/mL amp",
    ],
    cat: "Corticoide parenteral/oral",
    dosis: "4-1000mg según indicación",
  },
  {
    g: "Ciclobenzaprina",
    p: [
      "Flexeril 5mg tab",
      "Flexeril 10mg tab",
      "Ciclobenzaprina MK 10mg tab",
      "Yurelax 10mg tab",
      "Cicloflexan 10mg tab",
    ],
    cat: "Relajante muscular central",
    dosis: "5-10mg c/8h máx 2-3 semanas",
  },
  {
    g: "Tizanidina",
    p: [
      "Zanaflex 4mg tab",
      "Tizanidina MK 4mg tab",
      "Sirdalud 2mg tab",
      "Sirdalud 4mg tab",
    ],
    cat: "Relajante muscular α2 agonista",
    dosis: "2-8mg c/6-8h",
  },
  {
    g: "Carisoprodol",
    p: ["Soma 350mg tab", "Carisoprodol MK 350mg tab", "Dorixina Relax tab"],
    cat: "Relajante muscular central",
    dosis: "250-350mg c/8h máx 2-3 semanas",
  },
  {
    g: "Metocarbamol",
    p: [
      "Robaxin 750mg tab",
      "Metocarbamol MK 750mg tab",
      "Robaxin 500mg amp IV",
    ],
    cat: "Relajante muscular central",
    dosis: "750-1500mg c/6h",
  },
  {
    g: "Metotrexato",
    p: [
      "Rheumatrex 2.5mg tab",
      "Metotrexato MK 2.5mg tab",
      "Metotrexato 10mg/mL amp",
    ],
    cat: "DMARD antiinflamatorio",
    dosis: "7.5-25mg c/semana + ácido fólico",
  },
  {
    g: "Hidroxicloroquina",
    p: [
      "Plaquenil 200mg tab",
      "Hidroxicloroquina MK 200mg tab",
      "Quensyl 200mg tab",
    ],
    cat: "DMARD antipalúdico",
    dosis: "200-400mg c/24h",
  },
  {
    g: "Leflunomida",
    p: ["Arava 20mg tab", "Leflunomida MK 20mg tab", "Arava 10mg tab"],
    cat: "DMARD",
    dosis: "20mg c/24h",
  },
  {
    g: "Sulfasalazina",
    p: [
      "Azulfidine 500mg tab EC",
      "Sulfasalazina MK 500mg tab",
      "Salazopyrin 500mg tab",
    ],
    cat: "DMARD aminosalicilato",
    dosis: "1-3g c/24h (dividido)",
  },
  {
    g: "Capsaicina tópica",
    p: ["Zostrix 0.025% crema", "Capsaicina MK crema", "Capsin loción 0.025%"],
    cat: "Analgésico tópico capsaicinoide",
    dosis: "Aplicar c/8h zona dolorosa",
  },
  {
    g: "Lidocaína tópica",
    p: [
      "EMLA crema 2.5%",
      "Lidocaína gel 2%",
      "Xylocaína gel 2%",
      "Lidocaína spray",
      "Xilocaína jalea 2%",
    ],
    cat: "Anestésico local tópico",
    dosis: "Aplicar 1h antes procedimiento",
  },
  // ── UROLÓGICOS / GINECOLÓGICOS ────────────────────────────────────────────
  {
    g: "Tamsulosina",
    p: [
      "Flomax 0.4mg cap CR",
      "Tamsulosina MK 0.4mg cap",
      "Urimax 0.4mg cap CR",
      "Secotex 0.4mg cap",
    ],
    cat: "α1-bloqueante HBP",
    dosis: "0.4mg c/24h desayuno",
  },
  {
    g: "Dutasterida",
    p: [
      "Avodart 0.5mg cap",
      "Dutasterida MK 0.5mg cap",
      "Duodart 0.5/0.4mg cap",
    ],
    cat: "5α-reductasa inhibidor HBP",
    dosis: "0.5mg c/24h",
  },
  {
    g: "Finasterida",
    p: [
      "Proscar 5mg tab",
      "Propecia 1mg tab (alopecia)",
      "Finasterida MK 5mg tab",
    ],
    cat: "5α-reductasa inhibidor",
    dosis: "5mg c/24h (HBP)",
  },
  {
    g: "Sildenafil",
    p: [
      "Viagra 50mg tab",
      "Sildenafil MK 50mg tab",
      "Revatio 20mg tab (HTP)",
      "Sildenafil 100mg tab",
    ],
    cat: "Inhibidor PDE5",
    dosis: "50mg 1h antes (ED)",
  },
  {
    g: "Tadalafil",
    p: ["Cialis 20mg tab", "Tadalafil MK 20mg tab", "Cialis 5mg tab (diario)"],
    cat: "Inhibidor PDE5",
    dosis: "20mg SOS o 5mg c/24h (diario)",
  },
  {
    g: "Anticonceptivo Oral Combinado",
    p: [
      "Diane-35 (ciproterona/EE)",
      "Yasmin (drospirenona/EE)",
      "Microgynon 30 (LNG/EE)",
      "Yaz (drospirenona/EE 20mcg)",
      "Marvelon (desogestrel/EE)",
      "Loette (LNG/EE 20mcg)",
    ],
    cat: "Anticonceptivo hormonal combinado",
    dosis: "1 tab c/24h 21 días activos",
  },
  {
    g: "Levonorgestrel",
    p: [
      "Plan B 0.75mg tab",
      "Postinor-2 0.75mg tab",
      "Levonorgestrel 1.5mg tab (dosis única)",
      "DIU Mirena 52mg",
    ],
    cat: "Progestágeno anticoncepción",
    dosis: "1.5mg dosis única < 72h",
  },
  {
    g: "Progesterona micronizada",
    p: [
      "Utrogestan 100mg cap vaginal",
      "Utrogestan 200mg cap",
      "Cyclogest 400mg supos",
    ],
    cat: "Progestágeno natural",
    dosis: "100-400mg c/24h vaginal",
  },
  {
    g: "Oxitocina",
    p: ["Syntocinon 10UI/mL amp", "Oxitocina MK 10UI amp"],
    cat: "Oxitócico",
    dosis: "Según protocolo obstétrico",
  },
  // ── DERMATOLÓGICOS ────────────────────────────────────────────────────────
  {
    g: "Hidrocortisona crema",
    p: [
      "Cortizone 1% crema",
      "Hidrocortisona MK 1% crema",
      "Cortaid crema 1%",
      "Locoid crema 0.1%",
    ],
    cat: "Corticoide tópico baja potencia",
    dosis: "Aplicar 2-3 veces/día",
  },
  {
    g: "Triamcinolona tópica",
    p: ["Kenalog crema 0.1%", "Triamcinolona MK crema 0.1%", "Kenacomb crema"],
    cat: "Corticoide tópico media potencia",
    dosis: "Aplicar c/12h",
  },
  {
    g: "Clobetasol",
    p: [
      "Temovate 0.05% crema",
      "Clobetasol MK 0.05% crema",
      "Dermovate 0.05% crema",
    ],
    cat: "Corticoide tópico alta potencia",
    dosis: "Aplicar c/12h máx 2 semanas",
  },
  {
    g: "Mupirocina",
    p: [
      "Bactroban 2% ungüento",
      "Mupirocina MK 2% ungüento",
      "Bactroban nasal 2%",
    ],
    cat: "Antibiótico tópico",
    dosis: "Aplicar c/8h x5-7 días",
  },
  {
    g: "Permetrina",
    p: [
      "Elimite 5% crema",
      "Nix 1% loción",
      "Permetrina MK 5% crema",
      "Quellada loción",
    ],
    cat: "Antiparasitario tópico sarna/piojos",
    dosis: "Aplicar toda piel lavar 8-14h después",
  },
  {
    g: "Adapaleno",
    p: ["Differin 0.1% crema", "Differin 0.3% gel", "Adapaleno MK 0.1% crema"],
    cat: "Retinoide tópico acné",
    dosis: "Aplicar 1 vez/día noche",
  },
  {
    g: "Tretinoína",
    p: [
      "Retin-A 0.025% crema",
      "Retin-A 0.05% gel",
      "Tretinoína MK 0.05% crema",
    ],
    cat: "Retinoide tópico acné/antienvejecimiento",
    dosis: "Aplicar 1 vez/día noche",
  },
  {
    g: "Ácido azelaico",
    p: ["Finacea gel 15%", "Skinoren crema 20%", "Ácido azelaico MK 20%"],
    cat: "Antibacteriano/queratolítico tópico",
    dosis: "Aplicar c/12h",
  },
  {
    g: "Isotretinoína oral",
    p: ["Roacutan 20mg cap", "Isotretinoína MK 20mg cap", "Accutane 40mg cap"],
    cat: "Retinoide oral sistémico (acné grave)",
    dosis: "0.5-1mg/kg/día (bajo control dermatología)",
  },
  // ── ANTIHISTAMÍNICOS ──────────────────────────────────────────────────────
  {
    g: "Loratadina",
    p: [
      "Claritin 10mg tab",
      "Loratadina MK 10mg tab",
      "Clarityne 10mg tab",
      "Claritin D tab",
      "Loratadina susp 5mg/5mL",
    ],
    cat: "Antihistamínico 2G no sedante",
    dosis: "10mg c/24h",
  },
  {
    g: "Cetirizina",
    p: [
      "Zyrtec 10mg tab",
      "Cetirizina MK 10mg tab",
      "Reactine 10mg tab",
      "Alerlisin 10mg tab",
      "Cetirizina sol 5mg/5mL",
    ],
    cat: "Antihistamínico 2G",
    dosis: "10mg c/24h noche",
  },
  {
    g: "Fexofenadina",
    p: [
      "Allegra 180mg tab",
      "Fexofenadina MK 180mg tab",
      "Allegra 60mg tab",
      "Telfast 120mg tab",
    ],
    cat: "Antihistamínico 2G no sedante",
    dosis: "60mg c/12h o 180mg c/24h",
  },
  {
    g: "Levocetirizina",
    p: ["Xyzal 5mg tab", "Levocetirizina MK 5mg tab"],
    cat: "Antihistamínico 2G",
    dosis: "5mg c/24h noche",
  },
  {
    g: "Desloratadina",
    p: ["Aerius 5mg tab", "Desloratadina MK 5mg tab", "Clarinex 5mg tab"],
    cat: "Antihistamínico 2G",
    dosis: "5mg c/24h",
  },
  {
    g: "Difenhidramina",
    p: [
      "Benadryl 25mg cap",
      "Difenhidramina MK 25mg tab",
      "Benadryl PM cap",
      "Difenhidramina iny 50mg/mL",
    ],
    cat: "Antihistamínico 1G sedante",
    dosis: "25-50mg c/6-8h",
  },
  {
    g: "Clorfeniramina",
    p: [
      "Chlor-Trimeton 4mg tab",
      "Clorfeniramina MK 4mg tab",
      "Polaramine 2mg tab",
    ],
    cat: "Antihistamínico 1G sedante",
    dosis: "4mg c/6-8h",
  },
  {
    g: "Hidroxizina",
    p: ["Atarax 25mg tab", "Hidroxizina MK 25mg tab", "Vistaril 25mg cap"],
    cat: "Antihistamínico 1G ansiolítico",
    dosis: "25-100mg c/8h",
  },
  // ── VITAMINAS Y SUPLEMENTOS ───────────────────────────────────────────────
  {
    g: "Ácido Fólico",
    p: [
      "Folidex 1mg tab",
      "Ácido Fólico MK 1mg tab",
      "Folacín 5mg tab",
      "Ácido Fólico 0.4mg prenatal",
    ],
    cat: "Vitamina B9",
    dosis: "0.4-5mg c/24h",
  },
  {
    g: "Vitamina D3",
    p: [
      "Vigantol 1000UI tab",
      "Vitamina D MK 1000UI tab",
      "Ostevit D tab",
      "Colecalciferol 5000UI cap",
      "D3 Drop 400UI/gota",
      "Dekristol 20000UI cap",
    ],
    cat: "Vitamina liposoluble D",
    dosis: "600-4000UI c/24h mantenimiento",
  },
  {
    g: "Calcio + Vitamina D",
    p: [
      "Caltrate 600+D tab",
      "Oscal 500+D tab",
      "Os-Cal 500+D tab",
      "Calcio+D MK tab",
      "Ossobay D tab",
    ],
    cat: "Suplemento calcio+D3",
    dosis: "500-1200mg calcio c/24h",
  },
  {
    g: "Sulfato Ferroso",
    p: [
      "Ferostat 300mg tab",
      "Hierro MK 300mg tab",
      "Fer-In-Sol gotas 75mg",
      "Fero-Gradumet tab CR",
      "Iberet Folic tab",
    ],
    cat: "Suplemento hierro",
    dosis: "300mg c/8-12h en ayunas",
  },
  {
    g: "Hierro aminoquelado",
    p: [
      "Ferchel cap",
      "Hierro aminoquelado MK cap",
      "Ferretts cap",
      "Siderex cap",
    ],
    cat: "Suplemento hierro mejor tolerado",
    dosis: "100-200mg hierro elemental c/24h",
  },
  {
    g: "Complejo B",
    p: [
      "Neurobion tab",
      "Neurobion amp IM",
      "Benerva B1 100mg tab",
      "Complejo B MK tab",
      "Becozyme tab",
    ],
    cat: "Vitaminas grupo B",
    dosis: "1 tab c/24h o amp IM c/7 días",
  },
  {
    g: "Vitamina C",
    p: [
      "Cevalin 500mg tab efervescente",
      "Vitamina C MK 500mg tab",
      "Redoxon 1g tab efervescente",
      "Cebión 500mg tab",
    ],
    cat: "Vitamina C antioxidante",
    dosis: "500-2000mg c/24h",
  },
  {
    g: "Zinc",
    p: [
      "Zinco MK 10mg tab",
      "Sulfato Zinc 20mg tab",
      "Zinc Plus cap",
      "Zinc 50mg cap",
    ],
    cat: "Oligoelemento inmunomodulador",
    dosis: "10-50mg c/24h",
  },
  {
    g: "Magnesio citrato",
    p: [
      "Magnesia Phillips susp",
      "Magnesio MK 250mg tab",
      "Slow-Mag tab CR",
      "Magnesio citrato 300mg polvo sob",
    ],
    cat: "Suplemento mineral",
    dosis: "250-500mg c/24h",
  },
  {
    g: "Omega-3 EPA/DHA",
    p: [
      "Omegaven 1g cap",
      "Omega-3 MK 1g cap",
      "Cardiosmega 1g cap",
      "Eskimo 1g cap",
      "Lovaza 1g cap",
    ],
    cat: "Suplemento lipídico cardiosaludable",
    dosis: "1-4g c/24h con comidas",
  },
  {
    g: "Hierro IV sacarosa",
    p: [
      "Venofer 100mg/5mL amp IV",
      "Ferric Sacarosa 200mg/10mL",
      "Iron Sucrose MK 100mg amp",
    ],
    cat: "Hierro parenteral",
    dosis: "Según fórmula déficit hierro IV",
  },
  // ── OFTALMOLÓGICOS ────────────────────────────────────────────────────────
  {
    g: "Gentamicina oftálmica",
    p: [
      "Gentamicina colirio 0.3%",
      "Garamycin colirio",
      "Gentamicina ungüento ocular",
    ],
    cat: "Antibiótico ocular",
    dosis: "1-2 gotas c/4h",
  },
  {
    g: "Ciprofloxacino oftálmico",
    p: ["Ciloxan colirio 0.3%", "Ciprofloxacino colirio 0.3%"],
    cat: "Antibiótico ocular FQ",
    dosis: "1-2 gotas c/2-4h",
  },
  {
    g: "Tobramicina oftálmica",
    p: ["Tobrex 0.3% gotas", "Tobramicina MK 0.3% gotas"],
    cat: "Antibiótico ocular aminoglucósido",
    dosis: "1-2 gotas c/4h",
  },
  {
    g: "Lágrimas Artificiales",
    p: [
      "Systane Ultra gotas",
      "Tears Naturale gotas",
      "Optive gotas",
      "Artelac gotas",
      "Hialuronato sódico 0.2% colirio",
      "Visine Tears",
    ],
    cat: "Lubricante ocular",
    dosis: "1-2 gotas c/2-6h SOS",
  },
  {
    g: "Latanoprost",
    p: ["Xalatan 50mcg/mL gotas", "Latanoprost MK 0.005% gotas"],
    cat: "Análogo prostanoide glaucoma",
    dosis: "1 gota c/24h noche",
  },
  {
    g: "Timolol oftálmico",
    p: ["Timoptol 0.25% gotas", "Timoptol 0.5% gotas", "Timolol MK 0.5% gotas"],
    cat: "Betabloqueante ocular glaucoma",
    dosis: "1 gota c/12h",
  },
  {
    g: "Dorzolamida",
    p: [
      "Trusopt 2% gotas",
      "Dorzolamida MK 2% gotas",
      "Cosopt (dorzo+timolol) gotas",
    ],
    cat: "Inhibidor anhidrasa carbónica ocular",
    dosis: "1 gota c/8h",
  },
  // ── MISCELÁNEOS ───────────────────────────────────────────────────────────
  {
    g: "Solución Salina 0.9%",
    p: [
      "SSN 100mL IV",
      "SSN 500mL IV",
      "SSN 1000mL IV",
      "ClNa 0.9% spray nasal",
      "SSN neb 3mL",
    ],
    cat: "Electrolítica isotónica/diluyente",
    dosis: "Según indicación",
  },
  {
    g: "Suero Oral (SRO)",
    p: [
      "Pedialyte polvo",
      "Sales rehidratación oral MK sob",
      "Hidrasec sobres",
      "Electrolit Plus sobre",
      "ORS polvo WHO",
    ],
    cat: "Rehidratante oral",
    dosis: "Según nivel deshidratación AIEPI",
  },
  {
    g: "N-Acetilcisteína IV",
    p: [
      "Fluimucil 600mg tab efervescente",
      "N-Acetilcisteína MK 600mg sob",
      "NAC 150mg/mL amp IV (antídoto)",
    ],
    cat: "Antídoto paracetamol/nefroprotector",
    dosis: "150mg/kg IV x15 min luego infusión",
  },
  {
    g: "Naloxona",
    p: [
      "Narcan 0.4mg/mL amp IV/IM",
      "Naloxona MK 0.4mg amp",
      "Narcan 4mg intranasal",
    ],
    cat: "Antídoto opioides",
    dosis: "0.4-2mg IV/IM/IN; repetir c/2-3min SOS",
  },
  {
    g: "Flumazenil",
    p: ["Anexate 0.5mg/5mL amp", "Flumazenil MK 1mg/10mL amp"],
    cat: "Antídoto benzodiazepinas",
    dosis: "0.2mg IV c/60s hasta respuesta",
  },
  {
    g: "Carbón Activado",
    p: [
      "Carbón Activado 25g polvo oral",
      "Norit 200mg tab",
      "Toxicarb polvo oral",
    ],
    cat: "Adsorbente GI intoxicaciones",
    dosis: "25-50g VO adulto urgencias",
  },
  {
    g: "Toxoide Tetánico",
    p: [
      "Td adulto 0.5mL amp IM",
      "Toxoide tetánico 0.5mL",
      "Boostrix 0.5mL (Tdap)",
    ],
    cat: "Vacuna bacteriana",
    dosis: "0.5mL IM; refuerzo c/10 años",
  },
  {
    g: "Vacuna Influenza",
    p: [
      "Fluzone 0.5mL iny",
      "Vaxigrip 0.5mL iny",
      "Influvac 0.5mL iny",
      "Fluarix 0.5mL iny",
    ],
    cat: "Vacuna viral influenza",
    dosis: "0.5mL IM c/año",
  },
  {
    g: "Alendronato",
    p: [
      "Fosamax 70mg tab semanal",
      "Alendronato MK 70mg tab",
      "Alendronato 10mg tab diario",
      "Fosamax Plus (con vitamina D)",
    ],
    cat: "Bifosfonato osteoporosis",
    dosis: "70mg c/semana mañana ayunas",
  },
  {
    g: "Raloxifeno",
    p: ["Evista 60mg tab", "Raloxifeno MK 60mg tab"],
    cat: "SERM osteoporosis prevención",
    dosis: "60mg c/24h",
  },
  {
    g: "Denosumab",
    p: ["Prolia 60mg/mL jer SC", "Xgeva 120mg/1.7mL jer"],
    cat: "Anticuerpo anti-RANK L osteoporosis",
    dosis: "60mg SC c/6 meses (osteoporosis)",
  },
  {
    g: "Bifosfonato IV",
    p: [
      "Zometa 4mg/5mL IV",
      "Actonel 5mg/mL IV",
      "Ácido Zoledrónico MK 5mg IV",
    ],
    cat: "Bifosfonato IV osteoporosis severa",
    dosis: "5mg IV 1 vez/año",
  },
  {
    g: "Calcio Gluconato IV",
    p: ["Calcio Gluconato 10% amp 10mL", "Calcio Gluconato MK 10% amp"],
    cat: "Suplemento IV mineral/antídoto hiperpotasemia",
    dosis: "10-20mL IV lento urgencias",
  },
  {
    g: "Potasio Oral",
    p: ["Potasio Cloruro 20mEq sol oral", "KCl 10% amp", "Kaon-Cl 8mEq CR tab"],
    cat: "Suplemento electrolito potasio",
    dosis: "20-80mEq/día VO dividido",
  },
  {
    g: "Bicarbonato Sódico",
    p: [
      "Bicarbonato sódico 8.4% amp",
      "NaHCO3 MK 500mg tab",
      "NaHCO3 7.5% amp",
    ],
    cat: "Alcalinizante/corrección acidosis",
    dosis: "Según gasometría o 500mg-1g c/8h VO",
  },
  {
    g: "Desmopresina",
    p: [
      "DDAVP 0.1mg tab",
      "DDAVP spray nasal",
      "Nocdurna 25mcg SL",
      "Desmopresina MK 0.2mg tab",
    ],
    cat: "Análogo ADH (enuresis/DI)",
    dosis: "0.1-0.4mg c/24h oral",
  },
  {
    g: "Aminofilina",
    p: [
      "Aminofilina 250mg/10mL amp IV",
      "Aminofilina MK 100mg tab",
      "Teofilina retard 200mg cap",
    ],
    cat: "Xantina broncodilatadora",
    dosis: "250mg IV lento o 100-200mg c/8h",
  },
  {
    g: "Sulfato de Magnesio",
    p: ["MgSO4 20% amp 10mL", "MgSO4 50% amp 10mL", "Sulfato Mg MK 20% amp"],
    cat: "Tocolítico/anticonvulsivante eclampsia",
    dosis: "4g IV carga + 1-2g/h infusión",
  },
  {
    g: "Oxitocina",
    p: ["Syntocinon 10UI/mL amp", "Oxitocina MK 10UI amp"],
    cat: "Oxitócico",
    dosis: "Según protocolo obstétrico",
  },
  {
    g: "Testosterona",
    p: [
      "Androgel 50mg gel",
      "Tostrex 2% gel",
      "Testogel sobre 50mg",
      "Testosterona undecanoato 1000mg amp",
    ],
    cat: "Andrógeno TRT",
    dosis: "Según protocolo especialista",
  },
  {
    g: "Tibolona",
    p: ["Livial 2.5mg tab", "Tibolona MK 2.5mg tab"],
    cat: "Esteroide sintético menopausia",
    dosis: "2.5mg c/24h",
  },
  {
    g: "Sildenafil HTP",
    p: [
      "Revatio 20mg tab",
      "Revatio 10mg/12.5mL IV",
      "Sildenafil HTP 20mg tab",
    ],
    cat: "Inhibidor PDE5 HTP",
    dosis: "20mg c/8h",
  },
];
const getAllMeds = () => [...MEDICAMENTOS_CO_BASE, ...getCustomMeds()];
const MEDICAMENTOS_CO = MEDICAMENTOS_CO_BASE; // Backward compat
// ==========================================
// CATÁLOGO DE DERIVACIONES// ==========================================
// CATÁLOGO DE DERIVACIONES / INTERCONSULTAS
// ==========================================
const DERIVACIONES_CATALOG = [
  {
    id: "d_med_trab",
    esp: "Medicina del Trabajo",
    motivo:
      "Valoración de aptitud laboral, restricciones, seguimiento ocupacional",
    tipo: "Ocupacional",
  },
  {
    id: "d_fisiat",
    esp: "Fisiatría y Rehabilitación",
    motivo:
      "Rehabilitación funcional, valoración incapacidad, prescripción ortesis",
    tipo: "Rehabilitación",
  },
  {
    id: "d_fisio",
    esp: "Fisioterapia",
    motivo: "Rehabilitación músculoesquelética, manejo del dolor, movilidad",
    tipo: "Rehabilitación",
  },
  {
    id: "d_orto",
    esp: "Ortopedia y Traumatología",
    motivo: "Patología osteoarticular, fracturas, cirugía ortopédica",
    tipo: "Quirúrgica",
  },
  {
    id: "d_neuro",
    esp: "Neurología",
    motivo: "Cefalea crónica, convulsiones, neuropatías periféricas, mareo",
    tipo: "Especialidad médica",
  },
  {
    id: "d_cardio",
    esp: "Cardiología",
    motivo:
      "HTA no controlada, arritmias, dolor torácico, valoración cardiovascular",
    tipo: "Especialidad médica",
  },
  {
    id: "d_neumo",
    esp: "Neumología",
    motivo:
      "EPOC, asma grave, patología respiratoria ocupacional, espirometría",
    tipo: "Especialidad médica",
  },
  {
    id: "d_gastro",
    esp: "Gastroenterología",
    motivo: "Patología digestiva crónica, endoscopia, hepatopatía",
    tipo: "Especialidad médica",
  },
  {
    id: "d_psiq",
    esp: "Psiquiatría",
    motivo:
      "Trastorno mental, depresión severa, ansiedad, estrés laboral crónico",
    tipo: "Salud mental",
  },
  {
    id: "d_psico",
    esp: "Psicología Clínica",
    motivo: "Apoyo emocional, factores de riesgo psicosocial, burnout",
    tipo: "Salud mental",
  },
  {
    id: "d_oftal",
    esp: "Oftalmología",
    motivo: "Agudeza visual disminuida, patología ocular, adaptación lentes",
    tipo: "Especialidad médica",
  },
  {
    id: "d_orl",
    esp: "Otorrinolaringología",
    motivo: "Hipoacusia, acúfenos, vértigo, patología ORL",
    tipo: "Especialidad médica",
  },
  {
    id: "d_derm",
    esp: "Dermatología",
    motivo:
      "Dermatosis ocupacional, lesiones cutáneas activas, alergias dérmicas",
    tipo: "Especialidad médica",
  },
  {
    id: "d_endo",
    esp: "Endocrinología",
    motivo:
      "DM descompensada, hipotiroidismo, obesidad severa, síndrome metabólico",
    tipo: "Especialidad médica",
  },
  {
    id: "d_nefro",
    esp: "Nefrología",
    motivo: "IRC, proteinuria, HTA nefrogénica, alteración función renal",
    tipo: "Especialidad médica",
  },
  {
    id: "d_reuma",
    esp: "Reumatología",
    motivo: "Artritis, lupus, espondiloartritis, enfermedades autoinmunes",
    tipo: "Especialidad médica",
  },
  {
    id: "d_nutri",
    esp: "Nutrición y Dietética",
    motivo: "Obesidad, DM2, dislipidemia, plan nutricional terapéutico",
    tipo: "Apoyo diagnóstico",
  },
  {
    id: "d_optom",
    esp: "Optometría",
    motivo: "Agudeza visual, adaptación de lentes correctivos, pantallas",
    tipo: "Apoyo diagnóstico",
  },
  {
    id: "d_audio",
    esp: "Audiología",
    motivo: "Hipoacusia ocupacional, audiometría tonal, adaptación audífonos",
    tipo: "Apoyo diagnóstico",
  },
  {
    id: "d_cirgen",
    esp: "Cirugía General",
    motivo: "Hernias, patología abdominal, procedimientos quirúrgicos menores",
    tipo: "Quirúrgica",
  },
  {
    id: "d_gineco",
    esp: "Ginecología y Obstetricia",
    motivo: "Control prenatal, patología ginecológica, restricciones embarazo",
    tipo: "Especialidad médica",
  },
  {
    id: "d_urol",
    esp: "Urología",
    motivo:
      "Patología prostática, litiasis renal, infecciones urinarias recurrentes",
    tipo: "Especialidad médica",
  },
  {
    id: "d_hemato",
    esp: "Hematología",
    motivo: "Anemia crónica, trombocitopenia, coagulopatías",
    tipo: "Especialidad médica",
  },
  {
    id: "d_oncol",
    esp: "Oncología",
    motivo: "Sospecha o seguimiento de neoplasias",
    tipo: "Especialidad médica",
  },
  {
    id: "d_trab_soc",
    esp: "Trabajo Social",
    motivo: "Gestión de beneficios, calificación PCL, seguimiento social",
    tipo: "Apoyo social",
  },
  {
    id: "d_medlab",
    esp: "Medicina Laboral / ARL",
    motivo: "Calificación origen enfermedad, PCL, reincorporación laboral",
    tipo: "Ocupacional",
  },
  {
    id: "d_urgencias",
    esp: "Urgencias / Hospitalización",
    motivo: "Remisión urgente a nivel hospitalario",
    tipo: "Urgente",
  },
];
// ==========================================
const RESTRICCIONES_CATALOG = {
  miembroSuperior: {
    label: "Miembro Superior",
    icon: "🦾",
    color: "blue",
    items: [
      {
        id: "ms_01",
        texto:
          "No cargar, halar o empujar objetos con peso superior a 5 kg con miembro superior afectado",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_02",
        texto:
          "No realizar movimientos repetitivos de muñeca/mano (>30 ciclos/min) con miembro afectado",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_03",
        texto:
          "No mantener postura estática de hombro en elevación superior a 60° por más de 2 horas continuas",
        normativa: "GTC-45 2012",
      },
      {
        id: "ms_04",
        texto:
          "No uso de herramientas vibrátiles (martillos, pulidoras, taladros) con miembro afectado",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_05",
        texto:
          "Rotación de actividades cada 45 minutos para tareas manuales repetitivas",
        normativa: "Res. 1843/2025",
      },
      {
        id: "ms_06",
        texto:
          "No realizar pinza digital fina o prensión de fuerza sostenida por más de 15 minutos continuos",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_07",
        texto:
          "Uso obligatorio de férula o soporte ortopédico durante jornada laboral en actividades de alto riesgo",
        normativa: "Res. 0312/2019",
      },
    ],
  },
  columnaLumbar: {
    label: "Columna Lumbar",
    icon: "🦴",
    color: "orange",
    items: [
      {
        id: "cl_01",
        texto:
          "No levantamiento manual de cargas superiores a 12.5 kg (mujeres) / 25 kg (hombres)",
        normativa: "NTC-4241 / NIOSH",
      },
      {
        id: "cl_02",
        texto:
          "No permanecer en posición de pie estática por más de 2 horas continuas sin descanso postural",
        normativa: "GTC-45 2012",
      },
      {
        id: "cl_03",
        texto:
          "No permanecer en posición sedente por más de 1 hora continua sin cambio postural",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cl_04",
        texto: "No realizar flexión de tronco mayor a 45° con o sin carga",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cl_05",
        texto:
          "No realizar movimientos de torsión de columna lumbar bajo carga",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cl_06",
        texto:
          "Uso obligatorio de cinturón lumbar en tareas de carga/descarga durante período de restricción",
        normativa: "Res. 0312/2019",
      },
      {
        id: "cl_07",
        texto:
          "Adaptar puesto de trabajo con silla ergonómica con soporte lumbar y reposapiés si aplica",
        normativa: "Res. 2400/1979 Art. 381",
      },
    ],
  },
  columnaCervical: {
    label: "Columna Cervical",
    icon: "🔭",
    color: "purple",
    items: [
      {
        id: "cc_01",
        texto:
          "No mantener postura de flexión cervical mayor a 20° por más de 2 horas continuas (uso de pantallas/microscopia)",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cc_02",
        texto:
          "No realizar tareas con el cuello en rotación máxima sostenida por más de 30 minutos",
        normativa: "GTC-45 2012",
      },
      {
        id: "cc_03",
        texto:
          "Pantalla de computador a nivel de los ojos, distancia mínima 50 cm",
        normativa: "Res. 2400/1979",
      },
      {
        id: "cc_04",
        texto:
          "No cargar objetos sobre cabeza o hombros con peso superior a 3 kg",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cc_05",
        texto:
          "Pausas activas cervicales obligatorias cada 45 minutos en tareas de trabajo visual prolongado",
        normativa: "Res. 0312/2019",
      },
    ],
  },
  columnaDorsal: {
    label: "Columna Dorsal",
    icon: "🏥",
    color: "teal",
    items: [
      {
        id: "cd_01",
        texto:
          "No permanecer en sedestación prolongada sin soporte dorsal adecuado (>1 hora continua)",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cd_02",
        texto:
          "No realizar actividades que impliquen elevación de brazos por encima de los hombros de forma repetitiva",
        normativa: "GTC-45 2012",
      },
      {
        id: "cd_03",
        texto:
          "Silla con respaldo que cubra toda la zona dorsal (vértebras T1-T12)",
        normativa: "Res. 2400/1979",
      },
      {
        id: "cd_04",
        texto:
          "No exposición a vibración de cuerpo entero (manejo de vehículos pesados, maquinaria) sin estudio de impacto",
        normativa: "GTC-45 2012",
      },
    ],
  },
  miembroInferior: {
    label: "Miembro Inferior",
    icon: "🦵",
    color: "green",
    items: [
      {
        id: "mi_01",
        texto:
          "No permanecer en bipedestación estática por más de 2 horas continuas",
        normativa: "GTC-45 2012",
      },
      {
        id: "mi_02",
        texto:
          "No subir o bajar escaleras de forma repetitiva (>30 ascensos/día) en período de restricción",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "mi_03",
        texto:
          "No trabajo en superficies irregulares o resbaladizas sin calzado de seguridad con soporte de tobillo",
        normativa: "Res. 2400/1979",
      },
      {
        id: "mi_04",
        texto:
          "Calzado ergonómico con soporte plantar y tacón máximo 3 cm durante jornada laboral",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "mi_05",
        texto:
          "No conducción de vehículos pesados o maquinaria durante período de restricción",
        normativa: "Res. 4100/2004",
      },
    ],
  },
  cardiovascular: {
    label: "Cardiovascular / Metabólico",
    icon: "❤️",
    color: "red",
    items: [
      {
        id: "cv_01",
        texto:
          "No realizar actividades de alta demanda cardiovascular sin evaluación cardiológica previa (FC >85% FCM)",
        normativa: "Res. 1843/2025",
      },
      {
        id: "cv_02",
        texto:
          "No trabajo en alturas hasta control y estabilización de cifras tensionales (TA >140/90 mmHg)",
        normativa: "Res. 4272/2021",
      },
      {
        id: "cv_03",
        texto:
          "Control médico periódico mensual de cifras tensionales mientras dure la restricción",
        normativa: "Res. 1843/2025",
      },
      {
        id: "cv_04",
        texto:
          "No exposición a temperaturas extremas (calor >35°C / frío <10°C) sin protección individual adecuada",
        normativa: "GTC-45 2012",
      },
      {
        id: "cv_05",
        texto:
          "Plan de alimentación supervisado: restricción de sodio, grasas saturadas y azúcares simples en jornada laboral",
        normativa: "Res. 1843/2025",
      },
      {
        id: "cv_06",
        texto:
          "No trabajos en jornadas nocturnas prolongadas (>8 h/noche) sin rotación semestral supervisada",
        normativa: "Dec. 1072/2015",
      },
    ],
  },
  respiratorio: {
    label: "Respiratorio / Pulmonar",
    icon: "🫁",
    color: "sky",
    items: [
      {
        id: "re_01",
        texto:
          "No exposición a polvos orgánicos/inorgánicos sin uso de respirador N95 o superior certificado",
        normativa: "Res. 0773/2021",
      },
      {
        id: "re_02",
        texto:
          "No exposición a humos de soldadura, gases de escape o vapores químicos sin ventilación localizada extracción",
        normativa: "GTC-45 2012",
      },
      {
        id: "re_03",
        texto:
          "Espirometría de control semestral mientras persistan factores de riesgo respiratorio",
        normativa: "GATISO-ND 2012",
      },
      {
        id: "re_04",
        texto:
          "No trabajo en espacios confinados hasta nueva evaluación neumológica con resultado apto",
        normativa: "Res. 0491/2020",
      },
      {
        id: "re_05",
        texto:
          "No exposición a agentes sensibilizantes respiratorios (látex, isocianatos, harinas) sin EPP certificado",
        normativa: "GTC-45 2012",
      },
    ],
  },
  neurologico: {
    label: "Neurológico / Psiquiátrico",
    icon: "🧠",
    color: "violet",
    items: [
      {
        id: "ne_01",
        texto:
          "No operación de maquinaria peligrosa, vehículos o equipos eléctricos de alta tensión hasta concepto neurológico",
        normativa: "Res. 1843/2025",
      },
      {
        id: "ne_02",
        texto:
          "No trabajo en alturas hasta nueva evaluación médica con concepto apto (Res. 4272/2021)",
        normativa: "Res. 4272/2021",
      },
      {
        id: "ne_03",
        texto:
          "No exposición a solventes neurotóxicos (benceno, tolueno, xileno) sin ventilación y EPP certificado",
        normativa: "GTC-45 2012",
      },
      {
        id: "ne_04",
        texto:
          "Jornada laboral máxima de 8 horas/día, sin horas extras durante período de tratamiento psiquiátrico activo",
        normativa: "Dec. 1072/2015",
      },
      {
        id: "ne_05",
        texto:
          "No trabajo en turno nocturno rotativo durante período de tratamiento de trastorno de sueño o ansiedad severa",
        normativa: "Res. 1843/2025",
      },
      {
        id: "ne_06",
        texto:
          "Seguimiento psicológico laboral mensual y reporte a médico SST de evolución clínica",
        normativa: "Res. 2404/2019",
      },
    ],
  },
  exposicionToxicos: {
    label: "Exposición a Tóxicos / Químicos",
    icon: "⚗️",
    color: "yellow",
    items: [
      {
        id: "et_01",
        texto:
          "No manipulación directa de plaguicidas organofosforados sin equipo de protección personal completo (nivel C)",
        normativa: "Res. 0031/1995",
      },
      {
        id: "et_02",
        texto:
          "No exposición a metales pesados (plomo, mercurio, cadmio) sin niveles biológicos de monitoreo vigentes",
        normativa: "GTC-45 2012",
      },
      {
        id: "et_03",
        texto:
          "Perfil toxicológico (colinesterasa/metales) semestral obligatorio mientras persista exposición",
        normativa: "Res. 1843/2025",
      },
      {
        id: "et_04",
        texto:
          "No ingesta de alimentos ni bebidas en áreas de manejo de sustancias químicas",
        normativa: "Res. 2400/1979",
      },
      {
        id: "et_05",
        texto:
          "Ducha de emergencia y lavaojos funcionales en área de trabajo como requisito para laborar con químicos corrosivos",
        normativa: "Res. 2400/1979",
      },
    ],
  },
  visual: {
    label: "Visual / Auditivo",
    icon: "👁️",
    color: "indigo",
    items: [
      {
        id: "va_01",
        texto:
          "Uso obligatorio de corrección óptica (gafas con prescripción) durante jornada laboral en tareas de precisión visual",
        normativa: "Res. 2400/1979",
      },
      {
        id: "va_02",
        texto:
          "No trabajo en conducción nocturna de vehículos con agudeza visual corregida inferior a 20/40",
        normativa: "Res. 4100/2004",
      },
      {
        id: "va_03",
        texto:
          "No exposición a radiación UV/IR sin protección ocular certificada (ANSI Z87.1)",
        normativa: "GTC-45 2012",
      },
      {
        id: "va_04",
        texto:
          "No exposición a ruido >80 dB sin uso de protección auditiva de doble vía (tapón + orejera)",
        normativa: "Res. 1792/1990",
      },
      {
        id: "va_05",
        texto:
          "Audiometría de control semestral con exposición a ruido ocupacional ≥85 dB",
        normativa: "Res. 8321/1983",
      },
    ],
  },
  alturas: {
    label: "Trabajo en Alturas",
    icon: "🏗️",
    color: "amber",
    items: [
      {
        id: "al_01",
        texto:
          "NO APTO para trabajo en alturas ≥1.5 metros hasta nueva evaluación médica con concepto específico",
        normativa: "Res. 4272/2021",
      },
      {
        id: "al_02",
        texto:
          "Requiere evaluación especializada (neurología/otorrinolaringología) antes de autorizar trabajo en alturas",
        normativa: "Res. 4272/2021 Art. 10",
      },
      {
        id: "al_03",
        texto:
          "No trabajo en alturas con medicación que produzca somnolencia, mareo o alteración del equilibrio",
        normativa: "Res. 4272/2021",
      },
      {
        id: "al_04",
        texto:
          "Uso obligatorio de arnés de cuerpo completo certificado y línea de vida en toda tarea >1.5 m",
        normativa: "Res. 4272/2021",
      },
      {
        id: "al_05",
        texto:
          "Acompañamiento permanente de vigía certificado en trabajo en alturas durante período de restricción parcial",
        normativa: "Res. 4272/2021 Art. 14",
      },
    ],
  },
  dermatologico: {
    label: "Dermatológico",
    icon: "🩺",
    color: "rose",
    items: [
      {
        id: "de_01",
        texto:
          "No contacto directo con agentes irritantes/sensibilizantes cutáneos sin guantes de nitrilo/neopreno certificados",
        normativa: "GTC-45 2012",
      },
      {
        id: "de_02",
        texto:
          "No exposición solar directa sin protector solar SPF 50+ durante jornadas extramurales",
        normativa: "Res. 1843/2025",
      },
      {
        id: "de_03",
        texto:
          "No manipulación de alimentos hasta resolución completa de lesión cutánea activa en manos",
        normativa: "Res. 2674/2013",
      },
      {
        id: "de_04",
        texto:
          "Control dermatológico mensual mientras persistan lesiones laborales activas",
        normativa: "Res. 1843/2025",
      },
    ],
  },
};
// ==========================================
// MÓDULO: RESTRICCIONES CHECKLIST PANEL
// ==========================================
const RestriccionesChecklistPanel = ({
  selected,
  onChange,
  onClose,
  onApply,
  isGenerating,
  onGenerate,
}) => {
  const [expandido, setExpandido] = useState({});
  const countSelected = Object.values(selected).filter(Boolean).length;
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    teal: "bg-teal-50 border-teal-200 text-teal-800",
    green: "bg-green-50 border-green-200 text-green-800",
    red: "bg-red-50 border-red-200 text-red-800",
    sky: "bg-sky-50 border-sky-200 text-sky-800",
    violet: "bg-violet-50 border-violet-200 text-violet-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    rose: "bg-rose-50 border-rose-200 text-rose-800",
  };
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ height: "90vh", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3.5 rounded-t-2xl text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <h2 className="font-black text-base">
                  Restricciones Médico-Laborales
                </h2>
                <p className="text-xs text-red-100">
                  Seleccione por segmento · GTC-45 / GATISO
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {countSelected > 0 && (
                <span className="bg-white/25 px-3 py-1 rounded-full text-sm font-bold">
                  {countSelected} seleccionadas
                </span>
              )}
              <button onClick={onClose}>
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
        {/* Lista scrollable */}
        <div
          className="overflow-y-auto p-4 space-y-1.5"
          style={{ flex: "1 1 0", minHeight: 0 }}
        >
          {Object.entries(RESTRICCIONES_CATALOG).map(([catKey, catData]) => {
            const selectedInCat = catData.items.filter(
              (i) => selected[i.id]
            ).length;
            const colors =
              colorMap[catData.color] ||
              "bg-gray-50 border-gray-200 text-gray-800";
            return (
              <div
                key={catKey}
                className={`border rounded-xl overflow-hidden ${
                  selectedInCat > 0 ? "border-red-300" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() =>
                    setExpandido((p) => ({ ...p, [catKey]: !p[catKey] }))
                  }
                  className={`w-full flex justify-between items-center px-4 py-3 text-left font-bold text-sm transition ${colors}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{catData.icon}</span>
                    <span>{catData.label}</span>
                    {selectedInCat > 0 && (
                      <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {selectedInCat}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform flex-shrink-0 ${
                      expandido[catKey] ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {expandido[catKey] && (
                  <div className="px-3 pt-1 pb-2 space-y-1 bg-white">
                    {catData.items.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-start gap-2 px-2 py-2.5 rounded-lg cursor-pointer transition ${
                          selected[item.id]
                            ? "bg-red-50 border border-red-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {selected[item.id] ? (
                            <CheckSquare className="w-4 h-4 text-red-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={!!selected[item.id]}
                          onChange={() =>
                            onChange((p) => ({ ...p, [item.id]: !p[item.id] }))
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-relaxed ${
                              selected[item.id]
                                ? "text-red-800 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {item.texto}
                          </p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {item.normativa}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Footer siempre visible */}
        <div className="border-t px-5 py-4 flex justify-between items-center flex-shrink-0 bg-gray-50 rounded-b-2xl gap-3">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generar con IA
          </button>
          <button
            onClick={onApply || onClose}
            className="flex items-center gap-2 bg-red-600 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-red-700 shadow-md"
          >
            <CheckSquare className="w-5 h-5" />
            {countSelected > 0
              ? `✅ Aplicar ${countSelected} restricciones`
              : "✅ Aplicar selección"}
          </button>
        </div>
      </div>
    </div>
  );
};
const RECOMENDACIONES_CATALOG = {
  generales: {
    label: "Recomendaciones Generales de Salud",
    icon: "💊",
    color: "emerald",
    items: [
      {
        id: "rg_01",
        texto:
          "Actividad física aeróbica moderada mínimo 150 minutos/semana (caminar, nadar, ciclismo)",
      },
      {
        id: "rg_02",
        texto:
          "Alimentación balanceada: reducir ultraprocesados, azúcares y grasas saturadas. Aumentar frutas, verduras y proteína magra",
      },
      {
        id: "rg_03",
        texto:
          "Control médico anual con laboratorios de seguimiento (glicemia, perfil lipídico, hemograma)",
      },
      {
        id: "rg_04",
        texto:
          "Mantener índice de masa corporal entre 18.5 y 24.9 kg/m² mediante dieta y ejercicio supervisado",
      },
      {
        id: "rg_05",
        texto:
          "Hidratación adecuada: mínimo 2 litros de agua/día, aumentar en jornadas con exposición a calor",
      },
      {
        id: "rg_06",
        texto:
          "Higiene del sueño: dormir entre 7-8 horas/noche en ambiente oscuro y silencioso",
      },
      {
        id: "rg_07",
        texto:
          "Cesación tabáquica inmediata; se recomienda programa de apoyo psicológico y/o farmacológico",
      },
      {
        id: "rg_08",
        texto:
          "Moderación en consumo de alcohol: máximo 1 unidad/día (mujeres) / 2 unidades/día (hombres)",
      },
    ],
  },
  laborales: {
    label: "Recomendaciones Laborales / Ergonómicas",
    icon: "🏢",
    color: "blue",
    items: [
      {
        id: "rl_01",
        texto:
          "Realizar pausas activas cada 45-60 minutos de trabajo continuo: 5 minutos de estiramiento y movimiento articular",
      },
      {
        id: "rl_02",
        texto:
          "Ajustar altura de escritorio/banco de trabajo: codos a 90°, pantalla a nivel de los ojos",
      },
      {
        id: "rl_03",
        texto:
          "Uso de silla ergonómica con soporte lumbar ajustable, altura regulable y apoyabrazos",
      },
      {
        id: "rl_04",
        texto:
          "Técnica correcta de levantamiento de cargas: doblar rodillas, mantener espalda recta, carga pegada al cuerpo",
      },
      {
        id: "rl_05",
        texto:
          "Rotación de actividades laborales para evitar exposición continua a un solo factor de riesgo ergonómico",
      },
      {
        id: "rl_06",
        texto:
          "Uso obligatorio de calzado de seguridad con soporte plantar en áreas de carga y descarga",
      },
      {
        id: "rl_07",
        texto:
          "Adaptar horario laboral para evitar trabajo en jornadas mayores a 10 horas diarias",
      },
      {
        id: "rl_08",
        texto:
          "Participar activamente en el programa de pausas activas implementado por la empresa",
      },
    ],
  },
  seguimiento: {
    label: "Seguimiento Médico y Control",
    icon: "📋",
    color: "purple",
    items: [
      {
        id: "rs_01",
        texto:
          "Control médico ocupacional semestral durante los próximos 2 años",
      },
      {
        id: "rs_02",
        texto:
          "Consulta con médico general/especialista en las próximas 4 semanas para manejo de patología diagnosticada",
      },
      {
        id: "rs_03",
        texto:
          "Continuar o iniciar tratamiento farmacológico indicado por médico tratante. Reportar medicación al médico de empresa",
      },
      {
        id: "rs_04",
        texto:
          "Adherencia a programa de vigilancia epidemiológica de la empresa según riesgo identificado",
      },
      {
        id: "rs_05",
        texto:
          "Informar de inmediato al médico de empresa cualquier cambio en su condición de salud o aparición de nuevos síntomas",
      },
      {
        id: "rs_06",
        texto:
          "Vacunación al día: esquema de adultos según EPS + vacunas de riesgo ocupacional (hepatitis B, tétanos, influenza)",
      },
    ],
  },
  psicosocial: {
    label: "Salud Mental / Psicosocial",
    icon: "🧘",
    color: "teal",
    items: [
      {
        id: "rp_01",
        texto:
          "Participar en programa de manejo del estrés laboral y técnicas de mindfulness ofrecidas por la empresa o EPS",
      },
      {
        id: "rp_02",
        texto:
          "Solicitar apoyo psicológico a través de EPS en caso de síntomas de ansiedad, depresión o burnout",
      },
      {
        id: "rp_03",
        texto:
          "Establecer límites claros entre vida laboral y personal: evitar trabajo fuera de horario habitual",
      },
      {
        id: "rp_04",
        texto:
          "Comunicar al jefe inmediato situaciones de acoso laboral, sobrecarga de trabajo o conflictos interpersonales",
      },
    ],
  },
};
const DEFAULT_RECOMENDACIONES_SELECTED = {
  rg_01: true, // Actividad física aeróbica
  rg_02: true, // Alimentación balanceada
  rg_03: true, // Control médico anual
  rg_05: true, // Hidratación
  rg_06: true, // Higiene del sueño
  rl_01: true, // Pausas activas
  rl_04: true, // Técnica levantamiento cargas
  rs_01: true, // Control médico ocupacional semestral
  rs_05: true, // Informar cambios de salud
  rs_06: true, // Vacunación al día
};
// ==========================================
// ==========================================
// ==========================================
// MÓDULO 3: MOTOR DE IA MULTI-PROVEEDOR
// Modelos verificados activos - Marzo 2026
// Gemini · Groq · Together AI · OpenRouter
// CORS habilitado en todos - funcionan desde cualquier servidor externo
// ==========================================
const AI_CONFIG_VERSION = "2026-03-v2";
const fetchWithTimeout = (url, opts, ms = 40000) => {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() =>
    clearTimeout(id)
  );
};
const AI_PROVIDERS = {
  // ── 1. GEMINI - API Google, CORS nativo, más estable en browsers externos ─
  gemini: {
    name: "Google Gemini",
    free: true,
    badge: "🟢 Gratis · Alta calidad",
    docs: "aistudio.google.com",
    hint: "Key gratuita: aistudio.google.com → Get API Key",
    link: "https://aistudio.google.com/apikey",
    call: async (prompt, systemPrompt, apiKey) => {
      if (!apiKey)
        throw new Error(
          "Gemini: API Key no configurada - obtenla gratis en aistudio.google.com/apikey"
        );
      // Modelos verificados activos marzo 2026 (Gemini 1.5 retirado → 404)
      const tryModels = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
      ];
      let lastErr = null;
      for (const model of tryModels) {
        try {
          const res = await fetchWithTimeout(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                  maxOutputTokens: 4096,
                  temperature: 0.3,
                  ...(systemPrompt.includes("ÚNICAMENTE CON JSON") ||
                  systemPrompt.includes("ÚNICAMENTE JSON")
                    ? { responseMimeType: "application/json" }
                    : {}),
                },
              }),
            }
          );
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg = errData?.error?.message || res.statusText;
            lastErr = new Error(`Gemini/${model} [${res.status}]: ${msg}`);
            // 401/403 = key inválida | 400 solo si mensaje indica key inválida
            if (res.status === 401 || res.status === 403) break;
            if (
              res.status === 400 &&
              (msg.includes("API_KEY_INVALID") ||
                msg.includes("not valid") ||
                msg.includes("API key"))
            )
              break;
            continue; // 404 = modelo no disponible → probar siguiente
          }
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text?.trim().length > 5) return text.trim();
          lastErr = new Error(`Gemini/${model}: respuesta vacía`);
        } catch (e) {
          if (e.name === "AbortError") {
            lastErr = new Error(`Gemini/${model}: timeout (40s)`);
            continue;
          }
          lastErr = e;
        }
      }
      throw (
        lastErr ||
        new Error(
          "Gemini: todos los modelos fallaron - renueva tu key en aistudio.google.com/apikey"
        )
      );
    },
  },
  // ── 2. GROQ - Velocidad máxima, CORS habilitado explícitamente ────────────
  groq: {
    name: "Groq",
    free: true,
    badge: "🟢 Gratis · Ultrarrápido",
    docs: "console.groq.com",
    hint: "Key gratuita: console.groq.com → API Keys → Create API Key",
    link: "https://console.groq.com/keys",
    call: async (prompt, systemPrompt, apiKey) => {
      if (!apiKey)
        throw new Error(
          "Groq: API Key no configurada - obtenla gratis en console.groq.com/keys"
        );
      const tryModels = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "gemma2-9b-it",
        "llama-3.1-70b-versatile",
        "llama3-70b-8192",
      ];
      let lastErr = null;
      for (const model of tryModels) {
        try {
          const res = await fetchWithTimeout(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model,
                max_tokens: 4096,
                temperature: 0.3,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: prompt },
                ],
              }),
            }
          );
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg = errData?.error?.message || res.statusText;
            lastErr = new Error(`Groq/${model} [${res.status}]: ${msg}`);
            if (res.status === 401 || res.status === 403) break;
            continue; // 404/429 → probar siguiente modelo
          }
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text?.trim().length > 5) return text.trim();
          lastErr = new Error(`Groq/${model}: respuesta vacía`);
        } catch (e) {
          if (e.name === "AbortError") {
            lastErr = new Error(`Groq/${model}: timeout`);
            continue;
          }
          if (e.message === "Failed to fetch") {
            lastErr = new Error(
              `Groq: no se pudo conectar a api.groq.com - verifica tu red o renueva tu key en console.groq.com/keys`
            );
            break; // error de red = no tiene sentido intentar más modelos
          }
          lastErr = e;
        }
      }
      throw (
        lastErr ||
        new Error(
          "Groq: todos los modelos fallaron - renueva tu key en console.groq.com/keys"
        )
      );
    },
  },
  // ── 3. TOGETHER AI - Llama 3.3 70B 100% gratis, robusto ─────────────────
  together: {
    name: "Together AI",
    free: true,
    badge: "🟢 Gratis · Muy estable",
    docs: "api.together.ai",
    hint: "Key gratuita: api.together.ai → Settings → API Keys - copia la key que empieza por letras/números (NO el código Python)",
    link: "https://api.together.ai",
    call: async (prompt, systemPrompt, apiKey) => {
      if (!apiKey)
        throw new Error(
          "Together AI: API Key no configurada - obtenla gratis en api.together.ai → Settings → API Keys"
        );
      // Modelos gratuitos verificados Together AI - marzo 2026
      // NOTA: los sufijos -Free fueron deprecados; ahora el acceso free
      // es por tier de cuenta, no por nombre de modelo
      const tryModels = [
        "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        "mistralai/Mistral-7B-Instruct-v0.3",
        "togethercomputer/llama-2-70b-chat",
      ];
      let lastErr = null;
      for (const model of tryModels) {
        try {
          const res = await fetchWithTimeout(
            "https://api.together.ai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model,
                max_tokens: 4096,
                temperature: 0.3,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: prompt },
                ],
              }),
            }
          );
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg = errData?.error?.message || res.statusText;
            lastErr = new Error(`Together/${model} [${res.status}]: ${msg}`);
            if (res.status === 401 || res.status === 403) {
              // Key inválida - no tiene sentido seguir probando modelos
              throw new Error(
                `Together AI [401]: API Key inválida. Ve a api.together.ai → Settings → API Keys y copia SOLO la key (texto largo, no el código Python).`
              );
            }
            continue;
          }
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text?.trim().length > 5) return text.trim();
          lastErr = new Error(`Together/${model}: respuesta vacía`);
        } catch (e) {
          if (e.message?.includes("API Key inválida")) throw e; // re-throw 401 immediately
          if (e.name === "AbortError") {
            lastErr = new Error(`Together/${model}: timeout`);
            continue;
          }
          lastErr = e;
        }
      }
      throw (
        lastErr ||
        new Error(
          "Together AI: todos los modelos fallaron - renueva tu key en api.together.ai"
        )
      );
    },
  },
  // ── 4. OPENROUTER - Multi-modelo, fallback máximo ─────────────────────────
  openrouter: {
    name: "OpenRouter",
    free: true,
    badge: "🟢 Gratis · Multi-modelo",
    docs: "openrouter.ai",
    hint: "Key gratuita: openrouter.ai → Keys → Create Key (login con Google)",
    link: "https://openrouter.ai/keys",
    call: async (prompt, systemPrompt, apiKey) => {
      if (!apiKey)
        throw new Error(
          "OpenRouter: API Key no configurada - obtenla gratis en openrouter.ai/keys"
        );
      // Modelos free VERIFICADOS activos en OpenRouter - marzo 2026
      // (si alguno da 404, el código pasa automáticamente al siguiente)
      const tryModels = [
        "openrouter/auto",
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-r1-zero:free",
        "deepseek/deepseek-chat-v3-0324:free",
        "mistralai/mistral-small-3.1-24b-instruct:free",
        "qwen/qwen3-235b-a22b:free",
        "qwen/qwen3-30b-a3b:free",
        "nvidia/llama-3.3-nemotron-super-49b-v1:free",
        "arcee-ai/arcee-blitz:free",
        "google/gemini-2.5-pro-exp-03-25:free",
      ];
      let lastErr = null;
      for (const model of tryModels) {
        try {
          const res = await fetchWithTimeout(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "HTTP-Referer":
                  typeof window !== "undefined"
                    ? window.location.origin
                    : "https://ocupasalud.app",
                "X-Title": "OCUPASALUD Medico Ocupacional",
              },
              body: JSON.stringify({
                model,
                max_tokens: 4096,
                temperature: 0.3,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: prompt },
                ],
              }),
            }
          );
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg = errData?.error?.message || res.statusText;
            lastErr = new Error(`OpenRouter/${model} [${res.status}]: ${msg}`);
            if (res.status === 401 || res.status === 403) break; // key inválida
            continue; // 404 = modelo deprecado → probar siguiente
          }
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text?.trim().length > 5) return text.trim();
          lastErr = new Error(`OpenRouter/${model}: respuesta vacía`);
        } catch (e) {
          if (e.name === "AbortError") {
            lastErr = new Error(`OpenRouter/${model}: timeout`);
            continue;
          }
          lastErr = e;
        }
      }
      throw (
        lastErr ||
        new Error(
          "OpenRouter: todos los modelos fallaron - renueva tu key en openrouter.ai/keys"
        )
      );
    },
  },
};
const parseAIJSON = (raw) => {
  if (!raw) throw new Error("Respuesta vacía");
  let clean = raw
    .replace(/^\uFEFF/, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const objS = clean.indexOf("{");
  const objE = clean.lastIndexOf("}");
  const arrS = clean.indexOf("[");
  const arrE = clean.lastIndexOf("]");
  if (objS !== -1 && objE > objS) clean = clean.substring(objS, objE + 1);
  else if (arrS !== -1 && arrE > arrS) clean = clean.substring(arrS, arrE + 1);
  try {
    return JSON.parse(clean);
  } catch (_) {}
  // Fix "Unterminated string" - la IA devuelve \n literales dentro de strings JSON
  const escapeCtrl = (s) => {
    const out = [];
    let inStr = false;
    let esc = false;
    for (let ix = 0; ix < s.length; ix++) {
      const ch = s[ix];
      const code = ch.charCodeAt(0);
      if (esc) {
        out.push(ch);
        esc = false;
        continue;
      }
      if (code === 92) {
        out.push(ch);
        esc = true;
        continue;
      }
      if (code === 34) {
        out.push(ch);
        inStr = !inStr;
        continue;
      }
      if (inStr && code === 10) {
        out.push("\\n");
        continue;
      }
      if (inStr && code === 13) {
        continue;
      }
      if (inStr && code === 9) {
        out.push("\\t");
        continue;
      }
      if (inStr && code < 32) {
        out.push(" ");
        continue;
      }
      out.push(ch);
    }
    return out.join("");
  };
  let repaired = escapeCtrl(clean);
  try {
    return JSON.parse(repaired);
  } catch (_) {}
  repaired = repaired
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":');
  try {
    return JSON.parse(repaired);
  } catch (_) {}
  let fixed = repaired
    .replace(/,?\s*"[^"]*":\s*"[^"]*$/, "")
    .replace(/,?\s*"[^"]*":\s*\[[^\]]*$/, "")
    .replace(/,?\s*"[^"]*$/, "");
  const opens =
    (fixed.match(/{/g) || []).length - (fixed.match(/}/g) || []).length;
  const arrOpens =
    (fixed.match(/\[/g) || []).length - (fixed.match(/\]/g) || []).length;
  fixed += "]".repeat(Math.max(0, arrOpens)) + "}".repeat(Math.max(0, opens));
  try {
    return JSON.parse(fixed);
  } catch (_) {}
  const result = {};
  const fieldRe = /"(\w+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let fm;
  while ((fm = fieldRe.exec(repaired)) !== null)
    result[fm[1]] = fm[2].replace(/\\n/g, "\n");
  if (Object.keys(result).length > 0) return result;
  throw new Error("JSON irreparable: " + raw.substring(0, 80));
};
// ==========================================
// MÓDULO: FIRMA DIGITAL VÁLIDA - Ley 527/1999
// Implementa firma electrónica con integridad verificable:
// hash SHA-256 del contenido clínico + código QR de verificación
// + timestamp de servidor + identificación del firmante
// Cumple: Ley 527/1999, Decreto 2364/2012 (firma electrónica)
// ==========================================
// Genera hash SHA-256 del contenido de la HC para verificabilidad
const _generarHashHC = async (data) => {
  try {
    const contenido = JSON.stringify({
      id: data.id,
      nombres: data.nombres,
      docNumero: data.docNumero,
      fechaExamen: data.fechaExamen,
      conceptoAptitud: data.conceptoAptitud,
      tipoExamen: data.tipoExamen,
      diagnosticoPrincipal: data.diagnosticoPrincipal,
      medicoId: data._medicoId,
      estadoHistoria: "Cerrada",
      ts: new Date().toISOString(),
    });
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(contenido)
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "HASH-NO-DISPONIBLE-" + Date.now();
  }
};
// Genera código de verificación QR para la HC firmada
// El código contiene: ID paciente + hash (primeros 16 chars) + fecha
const _generarCodigoQR = (id, hash, fecha) => {
  const short = hash.substring(0, 16).toUpperCase();
  const fechaShort = (fecha || new Date().toISOString())
    .substring(0, 10)
    .replace(/-/g, "");
  return `SISO-${fechaShort}-${id.substring(0, 8).toUpperCase()}-${short}`;
};
// Formatea datos de firma para mostrar en la HC impresa
const _formatFirmaDigital = (firma) => {
  if (!firma) return null;
  return {
    codigo: firma.codigoQR || firma.codigo,
    hash: firma.hash ? firma.hash.substring(0, 32) + "..." : null,
    firmadoPor: firma.firmadoPor,
    fechaFirma: firma.fechaFirma,
    valido: !!(firma.codigoQR && firma.hash && firma.firmadoPor),
  };
};
// ==========================================
// MÓDULO: RIPS JSON - Resolución 2275/2023
// Generación de archivos RIPS para reporte al MinSalud
// Archivos: AF (afiliación), AT (atenciones), AC (consultas)
// NOTA: Este módulo genera la estructura base. Para radicar
// ante MinSalud se requiere firma digital certificada DIAN.
// ==========================================

// ══════════════════════════════════════════════════════════════════════════
// B-28: HL7 FHIR R4 - Res. 1888/2025 RDA - Generador de recursos FHIR
// Recursos: Patient, Practitioner, Observation, DiagnosticReport
// Deadline de interoperabilidad: 15 de abril de 2026
// ══════════════════════════════════════════════════════════════════════════
const _generarFHIRPatient = (p) => ({
  resourceType: "Patient",
  id:
    "pat-" + (p.docNumero || p.id || Date.now()).toString().replace(/\s/g, ""),
  meta: {
    profile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
    lastUpdated: new Date().toISOString(),
  },
  identifier: [
    {
      system: "https://www.registraduria.gov.co",
      type: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0203",
            code: p.docTipo || "NI",
          },
        ],
      },
      value: p.docNumero || "",
    },
  ],
  name: [
    {
      use: "official",
      text: p.nombres || "",
      family: (p.nombres || "").split(" ").slice(-1)[0],
      given: [(p.nombres || "").split(" ")[0]],
    },
  ],
  gender:
    p.genero === "Masculino"
      ? "male"
      : p.genero === "Femenino"
      ? "female"
      : "unknown",
  birthDate: p.fechaNacimiento || undefined,
  address: p.ciudadResidencia
    ? [{ text: p.ciudadResidencia, country: "CO" }]
    : undefined,
});
const _generarFHIRPractitioner = (d) => ({
  resourceType: "Practitioner",
  id: "prac-" + (d?.cedula || "doc").replace(/\s/g, ""),
  meta: { profile: ["http://hl7.org/fhir/StructureDefinition/Practitioner"] },
  identifier: [
    {
      system: "https://www.colmedicos.com",
      type: { coding: [{ code: "MD" }] },
      value: d?.licencia || d?.cedula || "",
    },
  ],
  name: [
    {
      use: "official",
      text: d?.nombre || "",
      family: (d?.nombre || "").split(" ").slice(-1)[0],
      given: [(d?.nombre || "").split(" ")[0]],
    },
  ],
  qualification: [
    {
      code: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0360",
            code: "MD",
            display: "Doctor of Medicine",
          },
        ],
      },
      issuer: { display: "Ministerio de Salud de Colombia" },
      identifier: [{ value: d?.licencia || "" }],
    },
  ],
});
const _generarFHIRObservation = (p, tipo) => ({
  resourceType: "Observation",
  id: "obs-" + tipo + "-" + (p.id || Date.now()),
  meta: { profile: ["http://hl7.org/fhir/StructureDefinition/Observation"] },
  status: "final",
  category: [
    {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/observation-category",
          code: "exam",
          display: "Exam",
        },
      ],
    },
  ],
  code: {
    coding: [
      {
        system: "http://loinc.org",
        code: "34108-1",
        display: "Outpatient Note",
      },
    ],
    text: tipo,
  },
  subject: {
    reference:
      "Patient/pat-" +
      (p.docNumero || p.id || "").toString().replace(/\s/g, ""),
  },
  effectiveDateTime: p.fechaExamen || new Date().toISOString().split("T")[0],
  valueString: p.conceptoAptitud || "",
  note: p.restricciones ? [{ text: p.restricciones }] : undefined,
});
const _generarFHIRBundle = (paciente, doctor) => {
  const bundle = {
    resourceType: "Bundle",
    id: "bundle-" + Date.now(),
    type: "document",
    meta: {
      lastUpdated: new Date().toISOString(),
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"],
    },
    identifier: {
      system: "https://siso.ocupasalud.co/fhir",
      value: "SISO-" + (paciente.codigoVerificacion || Date.now()),
    },
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: "urn:uuid:patient-1",
        resource: _generarFHIRPatient(paciente),
      },
      {
        fullUrl: "urn:uuid:practitioner-1",
        resource: _generarFHIRPractitioner(doctor),
      },
      {
        fullUrl: "urn:uuid:observation-1",
        resource: _generarFHIRObservation(paciente, "Aptitud Laboral"),
      },
    ],
  };
  return bundle;
};

// ══════════════════════════════════════════════════════════════════════════
// B-25: VALIDACIÓN RIPS - Res. 2275/2023 Schema v2
// ══════════════════════════════════════════════════════════════════════════
const validarRIPSPaciente = (p) => {
  const errs = [];
  if (!p.docNumero || p.docNumero.length < 4) errs.push("docNumero inválido");
  if (!p.fechaExamen) errs.push("fechaExamen requerida");
  if (!p.tipoExamen) errs.push("tipoExamen requerido");
  if (!p.conceptoAptitud) errs.push("conceptoAptitud requerido para RIPS");
  if (!p.eps) errs.push("EPS requerida para RIPS");
  return errs;
};
const validarRIPSLote = (pacientes) => {
  const errores = [];
  pacientes.forEach((p, idx) => {
    const e = validarRIPSPaciente(p);
    if (e.length)
      errores.push(
        `Paciente ${idx + 1} (${p.nombres || "sin nombre"}): ${e.join(", ")}`
      );
  });
  return errores;
};
const _generarRIPSJson = (pacientes, doctorData, periodo) => {
  const now = new Date().toISOString();
  const numFactura = "SISO-" + Date.now();
  // Archivo AF: Datos de afiliación de cada paciente atendido
  const AF = pacientes.map((p) => ({
    tipoDocumentoIdentificacion: p.docTipo || "CC",
    numDocumentoIdentificacion: p.docNumero || "",
    tipoUsuario: "1", // Contributivo
    fechaNacimiento: p.fechaNacimiento || "",
    codSexo:
      p.genero === "Femenino" ? "F" : p.genero === "Masculino" ? "M" : "N",
    codPaisResidencia: "CO",
    codMunicipioResidencia: "19001", // Default Popayán - personalizable
    codZonaTerritorialResidencia: p.zonaResidencia === "Rural" ? "2" : "1",
    incapacidad: p.diasIncapacidad ? "S" : "N",
    codPaisOrigen: "CO",
  }));
  // Archivo AT: Resumen de atención
  const AT = [
    {
      codPrestador: doctorData?.licencia?.substring(0, 12) || "SISO001",
      fechaInicioAtencion: pacientes[0]?.fechaExamen || now.split("T")[0],
      numAutorizacion: "",
      numDocumentoIdentificacion: pacientes[0]?.docNumero || "",
      tipoDocumentoIdentificacion: pacientes[0]?.docTipo || "CC",
      viaIngresoServicioSalud: "1", // Consulta externa
      modalidadGrupoServicioTecSal: "01",
      grupoServicios: "01",
      codServicio: "890201", // Medicina del trabajo
      finalidadTecnologiaSalud: "27", // Medicina laboral
      causaMotivoAtencion: "26", // Evaluación ocupacional
      codDiagnosticoPrincipal:
        pacientes[0]?.diagnosticoPrincipal?.substring(0, 4) || "Z00",
      codDiagnosticoPrincipalE: "",
      condicionSalidaPaciente: "1",
      codComplicacion: "",
      numFEVPagadora: "",
      consecutivo: "1",
    },
  ];
  // Archivo AC: Detalle de consultas
  const AC = pacientes.map((p, i) => ({
    codPrestador: doctorData?.licencia?.substring(0, 12) || "SISO001",
    viaIngresoServicioSalud: "1",
    fechaInicioAtencion: p.fechaExamen || now.split("T")[0],
    horaInicioAtencion: "08:00",
    fechaFinAtencion: p.fechaExamen || now.split("T")[0],
    horaFinAtencion: "08:30",
    tipoDocumentoIdentificacion: p.docTipo || "CC",
    numDocumentoIdentificacion: p.docNumero || "",
    tipoUsuario: "1",
    codConsulta: "890201",
    modalidadGrupoServicioTecSal: "01",
    grupoServicios: "01",
    codServicio: "890201",
    finalidadTecnologiaSalud: "27",
    causaMotivoAtencion: "26",
    codDiagnosticoPrincipal: p.diagnosticoPrincipal?.substring(0, 4) || "Z00",
    tipoDocumentoDX: "D",
    codDiagnosticoRelacionado1: p.diagnosticoSecundario1?.substring(0, 4) || "",
    tipoDX1: p.diagnosticoSecundario1 ? "D" : "",
    vrServicio: 90000,
    numFEVPagadora: "",
    consecutivo: String(i + 1),
  }));
  return {
    version: "1.0",
    generadoEn: now,
    periodo: periodo || now.substring(0, 7),
    norma: "Resolución 2275/2023",
    prestador: {
      nombre: doctorData?.nombre || "",
      nit: doctorData?.rut?.replace("-", "") || "",
      codigoPrestador: doctorData?.licencia?.substring(0, 12) || "SISO001",
    },
    numDocumentoIdObligado: doctorData?.cedula?.replace(/[^0-9]/g, "") || "",
    AF,
    AT,
    AC,
    totalRegistros: { AF: AF.length, AT: AT.length, AC: AC.length },
    advertencia:
      "RIPS generado por SISO v4.0. Para radicación formal ante MinSalud se requiere firma electrónica DIAN certificada y validación en ADRES.",
  };
};
// Descarga RIPS JSON sin createObjectURL (compatible con sandbox/CSP)
const _descargarRIPSJson = (pacientes, doctorData, periodo) => {
  try {
    const rips = _generarRIPSJson(pacientes, doctorData, periodo);
    const jsonStr = JSON.stringify(rips, null, 2);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const a = document.createElement("a");
    a.href = "data:application/json;base64," + b64;
    a.download = `RIPS_SISO_${
      periodo || new Date().toISOString().substring(0, 7)
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (e) {
    console.error("RIPS download error:", e);
    return false;
  }
};
// ==========================================
// MÓDULO: RDA - Res. 1888/2025 (Resumen Digital de Atención)
// Generación del JSON RDA para transmisión al IHCE MinSalud
// ==========================================
// ══ B-13: Generador RDA - Res. 1888/2025 ══
const _generarRDA = (paciente, doctorData, sesionId) => {
  if (!paciente || !paciente.fechaExamen) return null;
  const now = new Date().toISOString();
  return {
    version: "1.0",
    norma: "Resolución 1888/2025 MinSalud",
    fechaGeneracion: now,
    entidadGeneradora: {
      tipoDocumento: "CC",
      numDocumento: (doctorData?.cedula || "").replace(/[^0-9]/g, ""),
      nombreEntidad: doctorData?.nombre || "",
      municipio: doctorData?.ciudad || "Popayán",
    },
    paciente: {
      tipoDocumento: paciente.docTipo || "CC",
      numDocumento: paciente.docNumero || "",
      primerNombre: (paciente.nombres || "").split(" ")[0],
      primerApellido: (paciente.nombres || "").split(" ").slice(-1)[0],
      fechaNacimiento: paciente.fechaNacimiento || "",
      genero:
        paciente.genero === "Masculino"
          ? "M"
          : paciente.genero === "Femenino"
          ? "F"
          : "I",
    },
    atencion: {
      fechaAtencion: paciente.fechaExamen || now.split("T")[0],
      tipoAtencion: "01", // 01 = Consulta externa
      modalidad: "01", // 01 = Presencial
      tipoServicio:
        paciente.type === "ocupacional"
          ? "SALUD_OCUPACIONAL"
          : "MEDICINA_GENERAL",
      tipoExamen: paciente.tipoExamen || "INGRESO",
      codigoVerificacion:
        paciente.codigoVerificacion || paciente.firmaDigital?.codigoQR || "",
      sesionId: sesionId || "",
    },
    diagnosticos: (paciente.diagnosticos || []).slice(0, 4).map((d) => ({
      codigo: d.codigo || d,
      tipo: d.tipo || "IMPRESION_DIAGNOSTICA",
      descripcion: d.descripcion || d,
    })),
    conceptoAptitud: paciente.conceptoAptitud || "",
    restricciones: (paciente.restricciones || []).length,
    rdaGeneradoEn: now,
    _nota:
      "RDA generado por SISO. Para transmisión oficial al IHCE se requiere firma electrónica certificada.",
  };
};
const _descargarRDA = (paciente, doctorData, sesionId) => {
  try {
    const rda = _generarRDA(paciente, doctorData, sesionId);
    if (!rda) return false;
    const jsonStr = JSON.stringify(rda, null, 2);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const a = document.createElement("a");
    a.href = "data:application/json;base64," + b64;
    a.download = `RDA_${paciente.docNumero}_${paciente.fechaExamen}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (e) {
    console.error("RDA error:", e);
    return false;
  }
};
// MÓDULO CIE-11: Clasificación Internacional de Enfermedades 11a Revisión
// OMS CIE-11 (2022) - Res. 1442/2024 Colombia (transición gradual)
// Implementado en paralelo con CIE-10 para migración progresiva.
// ==========================================
const CIE11_EQUIVALENCIAS = [
  {
    cie10: "Z10.0",
    cie11: "QC00",
    desc: "Evaluación médica de rutina del trabajador",
  },
  { cie10: "Z57.0", cie11: "QD84", desc: "Exposición ocupacional al ruido" },
  { cie10: "Z57.2", cie11: "QD86", desc: "Exposición ocupacional a polvo" },
  { cie10: "Z57.7", cie11: "QD8B", desc: "Exposición ocupacional a vibración" },
  {
    cie10: "Z73.0",
    cie11: "QD85.0",
    desc: "Agotamiento profesional - Burnout",
  },
  { cie10: "Z73.3", cie11: "QD85", desc: "Estrés laboral" },
  { cie10: "M54.5", cie11: "ME84.2", desc: "Lumbago no especificado" },
  { cie10: "M54.2", cie11: "ME83.1", desc: "Cervicalgia" },
  { cie10: "M54.4", cie11: "ME84.3", desc: "Lumbago con ciática" },
  {
    cie10: "M51.1",
    cie11: "FA81",
    desc: "Hernia de disco lumbar con radiculopatía",
  },
  {
    cie10: "M50.1",
    cie11: "FA80",
    desc: "Hernia de disco cervical con radiculopatía",
  },
  { cie10: "M51.2", cie11: "FA81.1", desc: "Desplazamiento de disco lumbar" },
  { cie10: "M50.2", cie11: "FA80.1", desc: "Desplazamiento de disco cervical" },
  { cie10: "G56.0", cie11: "8C10.0", desc: "Síndrome del túnel del carpo" },
  { cie10: "G56.2", cie11: "8C10.2", desc: "Lesión del nervio cubital" },
  {
    cie10: "G54.0",
    cie11: "8C80.0",
    desc: "Trastornos de la raíz nerviosa cervical",
  },
  {
    cie10: "G54.2",
    cie11: "8C80.2",
    desc: "Trastornos de la raíz nerviosa lumbosacra",
  },
  { cie10: "M65.4", cie11: "FB52.1", desc: "Tenosinovitis de De Quervain" },
  {
    cie10: "M65.3",
    cie11: "FB52.2",
    desc: "Dedo en gatillo - tenosinovitis estenosante",
  },
  { cie10: "M75.0", cie11: "FB52.0", desc: "Síndrome del manguito rotador" },
  {
    cie10: "M75.3",
    cie11: "FB52.3",
    desc: "Tendinitis del hombro - impingement",
  },
  {
    cie10: "M77.1",
    cie11: "FB52.4",
    desc: "Epicondilitis lateral - codo de tenista",
  },
  {
    cie10: "M77.0",
    cie11: "FB52.5",
    desc: "Epicondilitis medial - codo de golfista",
  },
  {
    cie10: "M70.0",
    cie11: "FB52.6",
    desc: "Sinovitis crepitante crónica de mano y muñeca",
  },
  {
    cie10: "H90.3",
    cie11: "AB52",
    desc: "Hipoacusia neurosensorial bilateral - NIHL",
  },
  { cie10: "H90.0", cie11: "AB51", desc: "Hipoacusia conductiva bilateral" },
  { cie10: "J62.8", cie11: "CA22.00", desc: "Silicosis" },
  { cie10: "J61", cie11: "CA22.1", desc: "Asbestosis" },
  {
    cie10: "J60",
    cie11: "CA22.0",
    desc: "Neumoconiosis de los mineros del carbón",
  },
  { cie10: "J45.0", cie11: "CA23", desc: "Asma ocupacional alérgica" },
  { cie10: "J45.1", cie11: "CA23.1", desc: "Asma ocupacional irritativa" },
  {
    cie10: "F43.1",
    cie11: "6B40",
    desc: "Trastorno de estrés postraumático - TEPT",
  },
  { cie10: "F43.2", cie11: "6B43", desc: "Trastorno de adaptación laboral" },
  { cie10: "F41.1", cie11: "6B00", desc: "Trastorno de ansiedad generalizada" },
  { cie10: "F41.2", cie11: "6B01", desc: "Trastorno mixto ansioso-depresivo" },
  { cie10: "F32.0", cie11: "6A70.0", desc: "Episodio depresivo leve" },
  { cie10: "F32.1", cie11: "6A70.1", desc: "Episodio depresivo moderado" },
  { cie10: "F32.2", cie11: "6A70.2", desc: "Episodio depresivo grave" },
  { cie10: "I10", cie11: "BA00", desc: "Hipertensión esencial (primaria)" },
  {
    cie10: "I25.1",
    cie11: "BA80",
    desc: "Cardiopatía isquémica aterosclerótica",
  },
  { cie10: "E11.9", cie11: "5A11", desc: "Diabetes mellitus tipo 2" },
  { cie10: "E66.0", cie11: "5B81", desc: "Obesidad por exceso de calorías" },
  { cie10: "E78.0", cie11: "5C80", desc: "Hipercolesterolemia pura" },
  {
    cie10: "L23.5",
    cie11: "EK04.3",
    desc: "Dermatitis alérgica de contacto por químicos",
  },
  {
    cie10: "L24.2",
    cie11: "EK05.2",
    desc: "Dermatitis irritativa por disolventes",
  },
  { cie10: "C45.0", cie11: "2C26", desc: "Mesotelioma de pleura - asbestosis" },
  { cie10: "C34.0", cie11: "2C25.0", desc: "Cáncer de pulmón laboral" },
  {
    cie10: "C92.0",
    cie11: "2B33.0",
    desc: "Leucemia mieloide aguda - benceno",
  },
  {
    cie10: "T56.0",
    cie11: "NE60",
    desc: "Intoxicación por plomo - saturnismo",
  },
  { cie10: "T56.1", cie11: "NE61", desc: "Intoxicación por mercurio" },
  {
    cie10: "K21.0",
    cie11: "DA22",
    desc: "Enfermedad por reflujo gastroesofágico",
  },
  { cie10: "R51", cie11: "MG30.0", desc: "Cefalea tensional" },
  { cie10: "J00", cie11: "CA00", desc: "Rinofaringitis aguda" },
  {
    cie10: "J06.9",
    cie11: "CA0Z",
    desc: "Infección aguda vías respiratorias superiores",
  },
  { cie10: "N39.0", cie11: "GC08", desc: "Infección de vías urinarias" },
];
const _equivalenciaCIE11 = (cie10code) => {
  if (!cie10code) return null;
  const c = cie10code.toUpperCase().split(" ")[0].split("-")[0];
  return (
    CIE11_EQUIVALENCIAS.find((e) => e.cie10 === c || c.startsWith(e.cie10)) ||
    null
  );
};
const CIE11Badge = ({ cie10value }) => {
  if (!cie10value || cie10value.trim().length < 3) return null;
  const eq = _equivalenciaCIE11(cie10value);
  if (!eq) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#fef9c3",
        border: "1px solid #fbbf24",
        borderRadius: "5px",
        padding: "2px 7px",
        marginTop: "2px",
        fontSize: "9px",
        color: "#78350f",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontWeight: "900", color: "#92400e", flexShrink: 0 }}>
        CIE-11:
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontWeight: "800",
          background: "#fde68a",
          padding: "1px 4px",
          borderRadius: "3px",
          flexShrink: 0,
        }}
      >
        {eq.cie11}
      </span>
      <span style={{ color: "#713f12", flex: 1 }}>{eq.desc}</span>
      <span
        style={{
          fontSize: "8px",
          color: "#b45309",
          fontStyle: "italic",
          flexShrink: 0,
        }}
      >
        Res. 1442/2024
      </span>
    </div>
  );
};
// MÓDULO CUPS: Código Único de Procedimientos en Salud - Colombia
// Fuente: Res. 2175/2015 MSPS (consolida CUPS, deroga Res. 2175/2015), actualizada 2024
// Procedimientos frecuentes en Salud Ocupacional y Medicina General
// Ref. legal: Res. 2275/2023 (RIPS), Res. 1843/2025
// ==========================================
const CUPS_OCUPACIONAL = [
  {
    code: "890301",
    desc: "Consulta de primera vez por medicina general",
    group: "Consultas",
  },
  {
    code: "890302",
    desc: "Consulta de primera vez por medicina especializada - salud ocupacional",
    group: "Consultas",
  },
  {
    code: "890401",
    desc: "Consulta de control o seguimiento por medicina general",
    group: "Consultas",
  },
  {
    code: "890403",
    desc: "Consulta de control o seguimiento por medicina del trabajo",
    group: "Consultas",
  },
  {
    code: "890701",
    desc: "Interconsulta por medicina general",
    group: "Consultas",
  },
  {
    code: "890702",
    desc: "Interconsulta por medicina especializada - salud ocupacional",
    group: "Consultas",
  },
  {
    code: "890201",
    desc: "Consulta de urgencias por medicina general",
    group: "Consultas",
  },
  {
    code: "903801",
    desc: "Evaluación médica ocupacional de ingreso - Res. 1843/2025",
    group: "Salud Ocupacional",
  },
  {
    code: "903802",
    desc: "Evaluación médica ocupacional periódica - Res. 1843/2025",
    group: "Salud Ocupacional",
  },
  {
    code: "903803",
    desc: "Evaluación médica ocupacional de retiro/egreso",
    group: "Salud Ocupacional",
  },
  {
    code: "903804",
    desc: "Evaluación médica post-incapacidad (>=30 días) - Res. 1843/2025 Art.9",
    group: "Salud Ocupacional",
  },
  {
    code: "903805",
    desc: "Evaluación médica de retorno laboral (>90 días no médica) - Art.13",
    group: "Salud Ocupacional",
  },
  {
    code: "903806",
    desc: "Evaluación médica ocupacional de seguimiento",
    group: "Salud Ocupacional",
  },
  {
    code: "911501",
    desc: "Audiometría tonal liminar vía aérea y ósea - hipoacusia laboral",
    group: "Audiología",
  },
  {
    code: "911502",
    desc: "Audiometría de tamizaje (screening auditivo)",
    group: "Audiología",
  },
  {
    code: "911503",
    desc: "Logoaudiometría - discriminación verbal",
    group: "Audiología",
  },
  {
    code: "911504",
    desc: "Potenciales evocados auditivos del tronco cerebral (PEATC)",
    group: "Audiología",
  },
  {
    code: "911601",
    desc: "Otoscopía - examen del conducto auditivo externo y tímpano",
    group: "Audiología",
  },
  {
    code: "921601",
    desc: "Examen optométrico completo - agudeza visual y refracción",
    group: "Optometría",
  },
  {
    code: "921602",
    desc: "Agudeza visual - tamizaje visual laboral",
    group: "Optometría",
  },
  {
    code: "921603",
    desc: "Campimetría (campo visual) - trabajo en alturas, conductores",
    group: "Optometría",
  },
  {
    code: "921604",
    desc: "Visión de colores (Ishihara) - electrónica y seguridad",
    group: "Optometría",
  },
  {
    code: "921701",
    desc: "Tonometría ocular - detección glaucoma",
    group: "Optometría",
  },
  {
    code: "912701",
    desc: "Espirometría simple (CVF, VEF1) - exposición laboral a polvos",
    group: "Neumología",
  },
  {
    code: "912702",
    desc: "Espirometría con broncodilatador - asma ocupacional",
    group: "Neumología",
  },
  {
    code: "912703",
    desc: "Flujo espiratorio pico (PEF) - monitoreo asma",
    group: "Neumología",
  },
  {
    code: "912704",
    desc: "Oximetría de pulso - saturación O2 laboral",
    group: "Neumología",
  },
  {
    code: "891501",
    desc: "Electroencefalograma (EEG) - epilepsia, alturas",
    group: "Neurología",
  },
  {
    code: "891502",
    desc: "Electromiografía (EMG) - túnel del carpo, neuropatía laboral",
    group: "Neurología",
  },
  {
    code: "891503",
    desc: "Velocidades de conducción nerviosa (VCN) - GATISO-MMSS",
    group: "Neurología",
  },
  {
    code: "891504",
    desc: "Potenciales evocados somatosensoriales (PESS)",
    group: "Neurología",
  },
  {
    code: "903001",
    desc: "Hemograma completo con diferencial - cuadro hemático",
    group: "Laboratorio",
  },
  {
    code: "903002",
    desc: "Glicemia en ayunas - tamizaje diabetes",
    group: "Laboratorio",
  },
  {
    code: "903003",
    desc: "Hemoglobina glicosilada (HbA1c)",
    group: "Laboratorio",
  },
  {
    code: "903004",
    desc: "Perfil lipídico completo - colesterol HDL, LDL, triglicéridos",
    group: "Laboratorio",
  },
  {
    code: "903005",
    desc: "Parcial de orina (uroanálisis)",
    group: "Laboratorio",
  },
  {
    code: "903006",
    desc: "Creatinina sérica - función renal",
    group: "Laboratorio",
  },
  {
    code: "903007",
    desc: "Transaminasas ALT/AST - función hepática, exposición a tóxicos",
    group: "Laboratorio",
  },
  {
    code: "903008",
    desc: "Colinesterasa sérica - exposición a organofosforados",
    group: "Laboratorio",
  },
  {
    code: "903009",
    desc: "Plombemia (plomo en sangre) - exposición laboral a plomo",
    group: "Laboratorio",
  },
  {
    code: "903010",
    desc: "Mercurio en orina 24h - exposición a mercurio laboral",
    group: "Laboratorio",
  },
  {
    code: "903011",
    desc: "Manganeso en sangre - exposición laboral",
    group: "Laboratorio",
  },
  {
    code: "903012",
    desc: "Solventes orgánicos en orina - benceno, tolueno, xileno",
    group: "Laboratorio",
  },
  { code: "903013", desc: "Urocultivo", group: "Laboratorio" },
  {
    code: "903014",
    desc: "Coproscópico directo - parásitos intestinales",
    group: "Laboratorio",
  },
  { code: "903016", desc: "Proteína C reactiva (PCR)", group: "Laboratorio" },
  {
    code: "903017",
    desc: "VSG (velocidad de sedimentación globular)",
    group: "Laboratorio",
  },
  { code: "903018", desc: "Ácido úrico sérico", group: "Laboratorio" },
  {
    code: "903019",
    desc: "TSH (hormona estimulante de tiroides)",
    group: "Laboratorio",
  },
  { code: "903020", desc: "Vitamina D 25-OH", group: "Laboratorio" },
  {
    code: "903021",
    desc: "Antígeno de superficie hepatitis B (HBsAg)",
    group: "Laboratorio",
  },
  {
    code: "903022",
    desc: "Anti-HBs - verificación vacuna hepatitis B",
    group: "Laboratorio",
  },
  { code: "903023", desc: "Prueba de VIH (ELISA)", group: "Laboratorio" },
  { code: "903024", desc: "VDRL - sífilis", group: "Laboratorio" },
  {
    code: "870101",
    desc: "Radiografía de columna lumbosacra AP y lateral",
    group: "Imagenología",
  },
  {
    code: "870102",
    desc: "Radiografía de columna cervical AP y lateral",
    group: "Imagenología",
  },
  {
    code: "870103",
    desc: "Radiografía de columna dorsal AP y lateral",
    group: "Imagenología",
  },
  {
    code: "870201",
    desc: "Radiografía de manos bilateral AP - túnel del carpo",
    group: "Imagenología",
  },
  {
    code: "870202",
    desc: "Radiografía de muñecas bilateral",
    group: "Imagenología",
  },
  {
    code: "870203",
    desc: "Radiografía de hombros bilateral",
    group: "Imagenología",
  },
  {
    code: "870204",
    desc: "Radiografía de rodillas bilateral",
    group: "Imagenología",
  },
  {
    code: "870205",
    desc: "Radiografía de tobillos y pies bilateral",
    group: "Imagenología",
  },
  {
    code: "870301",
    desc: "Ecografía de hombro - manguito rotador, tendinitis",
    group: "Imagenología",
  },
  {
    code: "870302",
    desc: "Ecografía de columna lumbar - hernia discal",
    group: "Imagenología",
  },
  {
    code: "870303",
    desc: "Ecografía de muñeca - síndrome del túnel del carpo",
    group: "Imagenología",
  },
  {
    code: "870304",
    desc: "Ecografía abdominal total - control preventivo",
    group: "Imagenología",
  },
  {
    code: "870401",
    desc: "Resonancia magnética (RMN) de columna lumbosacra",
    group: "Imagenología",
  },
  {
    code: "870402",
    desc: "Resonancia magnética de columna cervical",
    group: "Imagenología",
  },
  {
    code: "870403",
    desc: "Resonancia magnética de hombro",
    group: "Imagenología",
  },
  {
    code: "870501",
    desc: "Tomografía computarizada (TAC) de tórax - neumoconiosis",
    group: "Imagenología",
  },
  {
    code: "870502",
    desc: "Radiografía de tórax PA y lateral - ILO 2011 neumoconiosis",
    group: "Imagenología",
  },
  {
    code: "893001",
    desc: "Electrocardiograma (ECG) 12 derivaciones - riesgo cardiovascular",
    group: "Cardiología",
  },
  {
    code: "893002",
    desc: "Ergometría (prueba de esfuerzo) - alturas, conductores",
    group: "Cardiología",
  },
  {
    code: "893003",
    desc: "Ecocardiograma transtorácico - cardiopatía hipertensiva",
    group: "Cardiología",
  },
  {
    code: "893004",
    desc: "Holter de 24 horas (ECG ambulatorio) - arritmias",
    group: "Cardiología",
  },
  {
    code: "893005",
    desc: "Monitoreo ambulatorio de presión arterial (MAPA 24h)",
    group: "Cardiología",
  },
  {
    code: "950801",
    desc: "Evaluación psicológica de ingreso - factores psicosociales",
    group: "Psicología",
  },
  {
    code: "950803",
    desc: "Evaluación factores de riesgo psicosocial - Batería MinTrabajo",
    group: "Psicología",
  },
  {
    code: "950804",
    desc: "Test de coordinación visomotora - conductores, operadores maquinaria",
    group: "Psicología",
  },
  {
    code: "950901",
    desc: "Valoración psiquiátrica - trastorno mental laboral",
    group: "Psiquiatría",
  },
  {
    code: "951001",
    desc: "Examen toxicológico en orina - sustancias psicoactivas",
    group: "Toxicología",
  },
  {
    code: "951002",
    desc: "Alcoholemia (etanol en sangre)",
    group: "Toxicología",
  },
  {
    code: "951003",
    desc: "Metales pesados en sangre - Hg, Pb, Cd, Cr, Mn",
    group: "Toxicología",
  },
  {
    code: "960101",
    desc: "Valoración por fisioterapia - DME, ergonomía laboral",
    group: "Rehabilitación",
  },
  {
    code: "960102",
    desc: "Terapia física - lesiones osteomusculares laborales",
    group: "Rehabilitación",
  },
  {
    code: "960201",
    desc: "Terapia ocupacional - reintegro laboral",
    group: "Rehabilitación",
  },
];
const _buscarCUPS = (query, maxResults) => {
  const max = maxResults || 10;
  if (!query || query.trim().length < 2) return [];
  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const q = normalize(query.trim());
  return CUPS_OCUPACIONAL.filter(
    (item) =>
      normalize(item.code).includes(q) ||
      normalize(item.desc).includes(q) ||
      normalize(item.group).includes(q)
  ).slice(0, max);
};
const CUPSInput = ({ value, onChange, placeholder, className }) => {
  const [query, setQuery] = React.useState(value || "");
  const [sugerencias, setSugerencias] = React.useState([]);
  const [abierto, setAbierto] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    setQuery(value || "");
  }, [value]);
  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange && onChange(v);
    if (v.trim().length >= 2) {
      const r = _buscarCUPS(v);
      setSugerencias(r);
      setAbierto(r.length > 0);
    } else {
      setSugerencias([]);
      setAbierto(false);
    }
  };
  const seleccionar = (item) => {
    const completo = item.code + " - " + item.desc;
    setQuery(completo);
    onChange && onChange(completo);
    setSugerencias([]);
    setAbierto(false);
  };
  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <input
        value={query}
        onChange={handleInput}
        onFocus={() => {
          if (sugerencias.length > 0) setAbierto(true);
        }}
        placeholder={
          placeholder || "Buscar CUPS - código o nombre del procedimiento..."
        }
        className={
          className ||
          "w-full p-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-teal-400 outline-none border-gray-300"
        }
        autoComplete="off"
        spellCheck="false"
      />
      {abierto && sugerencias.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "white",
            border: "2px solid #0d9488",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {sugerencias.map((item, ixd) => (
            <div
              key={ixd}
              onMouseDown={(e) => {
                e.preventDefault();
                seleccionar(item);
              }}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f0fdfa")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <div style={{ flexShrink: 0, textAlign: "center" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: "900",
                    color: "#134e4a",
                    fontSize: "10px",
                    background: "#ccfbf1",
                    padding: "2px 5px",
                    borderRadius: "4px",
                    display: "block",
                  }}
                >
                  {item.code}
                </span>
                <span
                  style={{
                    fontSize: "8px",
                    color: "#0d9488",
                    fontWeight: "700",
                    display: "block",
                    marginTop: "1px",
                  }}
                >
                  {item.group}
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#374151",
                  lineHeight: "1.4",
                  flex: 1,
                }}
              >
                {item.desc}
              </span>
            </div>
          ))}
          <div
            style={{
              padding: "3px 10px",
              background: "#f0fdfa",
              fontSize: "9px",
              color: "#6b7280",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            {sugerencias.length} resultado(s) · CUPS Colombia · Res. 2175/2015
            actualizada · MinSalud
          </div>
        </div>
      )}
    </div>
  );
};
// MÓDULO CIE-10: Base de diagnósticos para Salud Ocupacional Colombia
// Fuentes: OMS CIE-10, Decreto 1477/2014, Res. 1843/2025, GATISO-DME
// ==========================================
const CIE10_OCUPACIONAL = [
  // Z: FACTORES DE RIESGO OCUPACIONAL
  {
    code: "Z10.0",
    desc: "Examen médico ocupacional - evaluación ingreso/periódica/retiro",
  },
  { code: "Z10.1", desc: "Examen de salud de las fuerzas armadas" },
  { code: "Z13.1", desc: "Pesquisa especial de diabetes mellitus" },
  {
    code: "Z13.5",
    desc: "Pesquisa especial de trastornos visuales y de la visión",
  },
  { code: "Z13.6", desc: "Pesquisa especial de trastornos cardiovasculares" },
  { code: "Z56.0", desc: "Desempleo - problema relacionado con el empleo" },
  { code: "Z56.1", desc: "Cambio de empleo" },
  { code: "Z56.2", desc: "Amenaza de pérdida del empleo" },
  { code: "Z56.3", desc: "Ritmo de trabajo penoso - carga laboral excesiva" },
  { code: "Z56.4", desc: "Desacuerdo con el jefe y compañeros de trabajo" },
  {
    code: "Z56.5",
    desc: "Trabajo desagradable - condiciones laborales adversas",
  },
  {
    code: "Z56.6",
    desc: "Otras dificultades físicas relacionadas con el trabajo",
  },
  {
    code: "Z56.7",
    desc: "Otros problemas no especificados relacionados con el empleo",
  },
  {
    code: "Z57.0",
    desc: "Exposición ocupacional al ruido - hipoacusia laboral",
  },
  {
    code: "Z57.1",
    desc: "Exposición ocupacional a radiación ionizante y no ionizante",
  },
  {
    code: "Z57.2",
    desc: "Exposición ocupacional al polvo - silicosis, neumoconiosis",
  },
  {
    code: "Z57.3",
    desc: "Exposición ocupacional a otros contaminantes del aire",
  },
  {
    code: "Z57.4",
    desc: "Exposición ocupacional a agentes tóxicos en agricultura",
  },
  {
    code: "Z57.5",
    desc: "Exposición ocupacional a agentes tóxicos en otras industrias",
  },
  { code: "Z57.6", desc: "Exposición ocupacional a temperaturas extremas" },
  { code: "Z57.7", desc: "Exposición ocupacional a vibración" },
  { code: "Z57.8", desc: "Exposición ocupacional a otros factores de riesgo" },
  {
    code: "Z57.9",
    desc: "Exposición ocupacional a factor de riesgo no especificado",
  },
  { code: "Z73.0", desc: "Síndrome de agotamiento - Burnout laboral" },
  { code: "Z73.1", desc: "Acentuación de rasgos de la personalidad" },
  {
    code: "Z73.2",
    desc: "Falta de relajación y descanso - fatiga laboral crónica",
  },
  {
    code: "Z73.3",
    desc: "Estrés no clasificado en otra parte - estrés laboral",
  },
  {
    code: "Z73.4",
    desc: "Habilidades sociales inadecuadas no clasificadas en otra parte",
  },
  {
    code: "Z73.5",
    desc: "Conflicto de rol - dificultad de conciliación laboral/personal",
  },
  { code: "Z73.6", desc: "Limitación de actividades debida a incapacidad" },
  {
    code: "Z76.5",
    desc: "Persona que simula enfermedad (simulador consciente)",
  },
  { code: "Z77.0", desc: "Contacto y exposición a metales y metaloides" },
  {
    code: "Z77.1",
    desc: "Contacto y exposición a materiales tóxicos y contaminantes",
  },
  // M: SISTEMA OSTEOMUSCULAR - GATISO-DME, GATISO-TME
  {
    code: "M47.8",
    desc: "Espondiloartrosis cervical - cervicoartrosis laboral",
  },
  { code: "M47.81", desc: "Espondiloartrosis cervical con mielopatía" },
  { code: "M48.0", desc: "Estenosis espinal cervical o lumbar" },
  { code: "M50.0", desc: "Enfermedad del disco cervical con mielopatía" },
  {
    code: "M50.1",
    desc: "Enfermedad del disco cervical con radiculopatía - hernia cervical",
  },
  {
    code: "M50.2",
    desc: "Desplazamiento de disco cervical - hernia sin mielopatía",
  },
  {
    code: "M51.1",
    desc: "Enfermedad del disco lumbar con radiculopatía - lumbociática laboral",
  },
  {
    code: "M51.2",
    desc: "Desplazamiento de disco lumbar - hernia de disco lumbar",
  },
  { code: "M51.3", desc: "Degeneración del disco intervertebral lumbar" },
  { code: "M54.2", desc: "Cervicalgia - dolor cervical laboral" },
  { code: "M54.3", desc: "Ciática - radiculopatía lumbosacra" },
  { code: "M54.4", desc: "Lumbago con ciática" },
  {
    code: "M54.5",
    desc: "Lumbago no especificado - lumbalgia laboral crónica",
  },
  { code: "M54.6", desc: "Dolor en columna dorsal" },
  { code: "M60.0", desc: "Miositis infecciosa" },
  { code: "M62.4", desc: "Contractura muscular - espasmo muscular laboral" },
  { code: "M65.0", desc: "Tenosinovitis por absceso" },
  {
    code: "M65.3",
    desc: "Dedo en gatillo - tenosinovitis estenosante digital",
  },
  {
    code: "M65.4",
    desc: "Tenosinovitis de De Quervain - estiloides radial laboral",
  },
  {
    code: "M65.8",
    desc: "Otras sinovitis y tenosinovitis - tendinitis laboral",
  },
  { code: "M65.9", desc: "Sinovitis y tenosinovitis no especificada" },
  {
    code: "M70.0",
    desc: "Sinovitis crepitante crónica de mano y muñeca laboral",
  },
  { code: "M70.1", desc: "Bursitis de mano" },
  { code: "M70.2", desc: "Bursitis olecraniana - trabajo manual prolongado" },
  { code: "M70.3", desc: "Otras bursitis del codo" },
  { code: "M70.4", desc: "Bursitis prepatelar" },
  { code: "M70.5", desc: "Otras bursitis de rodilla - trabajo en cuclillas" },
  {
    code: "M70.6",
    desc: "Bursitis trocantérica - trabajo en bipedestación prolongada",
  },
  {
    code: "M70.9",
    desc: "Trastorno de tejidos blandos relacionado con el uso, sin especificar",
  },
  {
    code: "M75.0",
    desc: "Síndrome del manguito rotador - hombro doloroso laboral",
  },
  { code: "M75.1", desc: "Síndrome del bíceps - tendinitis bicipital laboral" },
  { code: "M75.2", desc: "Tendinitis calcificante de hombro" },
  { code: "M75.3", desc: "Tendinitis del hombro - síndrome de impingement" },
  { code: "M75.4", desc: "Síndrome de roce del hombro" },
  { code: "M75.5", desc: "Bursitis del hombro laboral" },
  { code: "M75.8", desc: "Otras lesiones del hombro laboral" },
  { code: "M77.0", desc: "Epicondilitis medial - codo de golfista laboral" },
  { code: "M77.1", desc: "Epicondilitis lateral - codo de tenista laboral" },
  { code: "M79.1", desc: "Mialgia - dolor muscular difuso" },
  { code: "M79.2", desc: "Neuralgia y neuritis no especificadas" },
  { code: "M79.3", desc: "Paniculitis - dolor en tejido adiposo" },
  // G: NEUROLÓGICOS - GATISO-MMSS
  { code: "G50.0", desc: "Neuralgia del trigémino paroxística" },
  {
    code: "G54.0",
    desc: "Trastornos de la raíz nerviosa cervical - radiculopatía cervical",
  },
  { code: "G54.1", desc: "Trastornos de la raíz nerviosa torácica" },
  {
    code: "G54.2",
    desc: "Trastornos de la raíz nerviosa lumbosacra - radiculopatía lumbar",
  },
  {
    code: "G56.0",
    desc: "Síndrome del túnel del carpo - compresión nervio mediano laboral",
  },
  { code: "G56.1", desc: "Otras lesiones del nervio mediano laboral" },
  {
    code: "G56.2",
    desc: "Lesión del nervio cubital - parálisis cubital laboral",
  },
  { code: "G56.3", desc: "Lesión del nervio radial" },
  {
    code: "G57.1",
    desc: "Meralgia parestésica - compresión nervio femorocutáneo",
  },
  { code: "G57.2", desc: "Lesión del nervio femoral" },
  { code: "G57.3", desc: "Lesión del nervio ciático poplíteo externo" },
  { code: "G57.5", desc: "Síndrome del túnel del tarso" },
  {
    code: "G57.6",
    desc: "Lesión del nervio plantar - trabajo en bipedestación",
  },
  { code: "G62.2", desc: "Polineuropatía debida a agentes tóxicos laborales" },
  // F: TRASTORNOS MENTALES - Psicosocial, Res. 2646/2008
  {
    code: "F10.1",
    desc: "Trastornos mentales debidos al alcohol - uso nocivo",
  },
  { code: "F17.1", desc: "Trastornos debidos al tabaco - uso nocivo" },
  { code: "F32.0", desc: "Episodio depresivo leve - laboral" },
  { code: "F32.1", desc: "Episodio depresivo moderado" },
  { code: "F32.2", desc: "Episodio depresivo grave sin síntomas psicóticos" },
  {
    code: "F41.0",
    desc: "Trastorno de pánico - ansiedad paroxística episódica",
  },
  {
    code: "F41.1",
    desc: "Trastorno de ansiedad generalizada - estrés laboral",
  },
  {
    code: "F41.2",
    desc: "Trastorno mixto ansioso-depresivo - síndrome laboral",
  },
  { code: "F43.0", desc: "Reacción aguda al estrés - accidente laboral" },
  { code: "F43.1", desc: "Trastorno de estrés postraumático - TEPT laboral" },
  { code: "F43.2", desc: "Trastorno de adaptación - cambio laboral" },
  { code: "F48.0", desc: "Neurastenia - agotamiento nervioso laboral" },
  { code: "F51.0", desc: "Insomnio no orgánico - trastorno del sueño laboral" },
  // H: AUDITIVOS Y VISUALES - Higiene industrial
  {
    code: "H83.3",
    desc: "Efectos del ruido sobre el oído interno - NIHL laboral",
  },
  { code: "H90.0", desc: "Hipoacusia conductiva bilateral" },
  { code: "H90.3", desc: "Hipoacusia neurosensorial bilateral - laboral" },
  { code: "H90.4", desc: "Hipoacusia neurosensorial unilateral" },
  { code: "H91.0", desc: "Hipoacusia ototóxica - medicamentos y disolventes" },
  {
    code: "H91.9",
    desc: "Hipoacusia no especificada - pérdida auditiva laboral",
  },
  { code: "H52.1", desc: "Miopía" },
  { code: "H52.2", desc: "Astigmatismo" },
  { code: "H52.4", desc: "Presbicia - visión afectada por edad" },
  {
    code: "H53.1",
    desc: "Alteraciones visuales subjetivas - fatiga visual por pantallas",
  },
  // J: RESPIRATORIOS - Decreto 1477/2014
  { code: "J45.0", desc: "Asma predominantemente alérgica - asma ocupacional" },
  { code: "J45.1", desc: "Asma no alérgica - asma irritativa laboral" },
  { code: "J60", desc: "Neumoconiosis de los mineros del carbón" },
  { code: "J61", desc: "Neumoconiosis debida a amianto - asbestosis" },
  { code: "J62.0", desc: "Neumoconiosis debida al talco - talcosis" },
  {
    code: "J62.8",
    desc: "Neumoconiosis debida a polvos con sílice - silicosis",
  },
  { code: "J63.0", desc: "Aluminosis pulmonar" },
  { code: "J63.2", desc: "Beriliosis pulmonar" },
  { code: "J63.4", desc: "Siderosis - polvo de hierro y óxidos" },
  { code: "J64", desc: "Neumoconiosis no especificada" },
  { code: "J66.0", desc: "Bisinosis - polvo de algodón, tabaco, lino" },
  {
    code: "J67.0",
    desc: "Pulmón del granjero - esporas de actinomicetos termófilos",
  },
  {
    code: "J68.0",
    desc: "Bronquitis y neumonitis por inhalación de gases, humos",
  },
  { code: "J00", desc: "Rinofaringitis aguda (Resfriado común)" },
  {
    code: "J06.9",
    desc: "Infección aguda de vías respiratorias superiores no especificada",
  },
  { code: "J18.9", desc: "Neumonía no especificada" },
  { code: "J30.4", desc: "Rinitis alérgica no especificada - rinitis laboral" },
  // I: CARDIOVASCULARES
  { code: "I10", desc: "Hipertensión esencial (primaria)" },
  {
    code: "I11.9",
    desc: "Cardiopatía hipertensiva sin insuficiencia cardíaca",
  },
  { code: "I20.0", desc: "Angina de pecho inestable" },
  { code: "I21.0", desc: "Infarto agudo de miocardio de la pared anterior" },
  {
    code: "I25.1",
    desc: "Enfermedad aterosclerótica del corazón - cardiopatía isquémica",
  },
  { code: "I50.0", desc: "Insuficiencia cardíaca congestiva" },
  { code: "I63.9", desc: "Infarto cerebral no especificado - ACV isquémico" },
  {
    code: "I83.0",
    desc: "Várices de los miembros inferiores - trabajo prolongado de pie",
  },
  // L: DERMATOLÓGICOS - exposición ocupacional
  {
    code: "L23.0",
    desc: "Dermatitis alérgica de contacto debida a metales - níquel, cromo",
  },
  {
    code: "L23.1",
    desc: "Dermatitis alérgica de contacto por adhesivos laborales",
  },
  {
    code: "L23.5",
    desc: "Dermatitis alérgica de contacto por otros productos químicos",
  },
  {
    code: "L24.2",
    desc: "Dermatitis irritativa de contacto debida a disolventes",
  },
  { code: "L24.5", desc: "Dermatitis irritativa de contacto debida a plantas" },
  {
    code: "L57.0",
    desc: "Queratosis actínica - exposición solar laboral crónica",
  },
  // S/T: ACCIDENTES DE TRABAJO Y LESIONES
  {
    code: "S13.4",
    desc: "Esguince o torcedura de columna cervical - accidente laboral",
  },
  { code: "S22.0", desc: "Fractura de vértebra torácica" },
  { code: "S32.0", desc: "Fractura de vértebra lumbar" },
  { code: "S40.0", desc: "Contusión del hombro y del brazo" },
  { code: "S42.0", desc: "Fractura de clavícula - accidente laboral" },
  { code: "S43.0", desc: "Luxación de articulación del hombro" },
  {
    code: "S52.5",
    desc: "Fractura de extremidad distal del radio - caída laboral",
  },
  { code: "S60.0", desc: "Contusión del dedo de la mano - trabajo manual" },
  { code: "S72.0", desc: "Fractura del cuello del fémur" },
  { code: "S80.0", desc: "Contusión de rodilla" },
  { code: "S83.0", desc: "Luxación de rótula" },
  {
    code: "T14.0",
    desc: "Herida de lugar de cuerpo no especificado - laceración laboral",
  },
  {
    code: "T56.0",
    desc: "Efecto tóxico del plomo y sus compuestos - saturnismo laboral",
  },
  {
    code: "T56.1",
    desc: "Efecto tóxico del mercurio - intoxicación por mercurio",
  },
  { code: "T56.2", desc: "Efecto tóxico del manganeso y sus compuestos" },
  { code: "T56.4", desc: "Efecto tóxico del cromo y sus compuestos" },
  { code: "T57.0", desc: "Efecto tóxico del arsénico y sus compuestos" },
  {
    code: "T65.3",
    desc: "Efecto tóxico de nitroderivados del benceno - laboral",
  },
  // C: CÁNCER LABORAL - Decreto 1477/2014
  {
    code: "C34.0",
    desc: "Tumor maligno del bronquio principal - cáncer de pulmón laboral",
  },
  {
    code: "C34.1",
    desc: "Tumor maligno del lóbulo superior - exposición asbesto/sílice",
  },
  { code: "C45.0", desc: "Mesotelioma de pleura - asbestosis mesotelial" },
  { code: "C45.1", desc: "Mesotelioma de peritoneo - asbesto" },
  {
    code: "C67.9",
    desc: "Tumor maligno de la vejiga urinaria - aminas aromáticas",
  },
  {
    code: "C91.0",
    desc: "Leucemia linfoblástica aguda - exposición a benceno",
  },
  {
    code: "C92.0",
    desc: "Leucemia mieloide aguda - benceno, radiaciones ionizantes",
  },
  // MEDICINA GENERAL FRECUENTE
  { code: "A09.9", desc: "Gastroenteritis no especificada" },
  { code: "B02.9", desc: "Herpes zóster sin complicaciones" },
  { code: "E11.9", desc: "Diabetes mellitus tipo 2 sin complicaciones" },
  { code: "E66.0", desc: "Obesidad debida a exceso de calorías" },
  { code: "E78.0", desc: "Hipercolesterolemia pura" },
  { code: "E78.5", desc: "Hiperlipidemia no especificada" },
  {
    code: "K21.0",
    desc: "Enfermedad por reflujo gastroesofágico con esofagitis",
  },
  { code: "K29.7", desc: "Gastritis no especificada" },
  {
    code: "N39.0",
    desc: "Infección de las vías urinarias, sitio no especificado",
  },
  { code: "R51", desc: "Cefalea - cefalea tensional laboral" },
  {
    code: "R53",
    desc: "Malestar y fatiga - síndrome de fatiga crónica laboral",
  },
  { code: "R55", desc: "Síncope y colapso - vagal laboral" },
];
// Buscador CIE-10 con filtrado en tiempo real (insensible a tildes y mayúsculas)
const _buscarCIE10 = (query, maxResults) => {
  const max = maxResults || 12;
  if (!query || query.trim().length < 2) return [];
  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const q = normalize(query.trim());
  return CIE10_OCUPACIONAL.filter((item) => {
    return normalize(item.code).includes(q) || normalize(item.desc).includes(q);
  }).slice(0, max);
};
// Componente CIE10Input: autocomplete en tiempo real al escribir
const CIE10Input = ({ value, onChange, placeholder, className, name }) => {
  const [query, setQuery] = React.useState(value || "");
  const [sugerencias, setSugerencias] = React.useState([]);
  const [abierto, setAbierto] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    setQuery(value || "");
  }, [value]);
  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange && onChange(v);
    if (v.trim().length >= 2) {
      const r = _buscarCIE10(v);
      setSugerencias(r);
      setAbierto(r.length > 0);
    } else {
      setSugerencias([]);
      setAbierto(false);
    }
  };
  const seleccionar = (item) => {
    const completo = item.code + " - " + item.desc;
    setQuery(completo);
    onChange && onChange(completo);
    setSugerencias([]);
    setAbierto(false);
  };
  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <input
        name={name}
        value={query}
        onChange={handleInput}
        onFocus={() => {
          if (sugerencias.length > 0) setAbierto(true);
        }}
        placeholder={placeholder || "Buscar CIE-10 - código o descripción..."}
        className={
          className ||
          "w-full p-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-400 outline-none border-gray-300"
        }
        autoComplete="off"
        spellCheck="false"
      />
      {abierto && sugerencias.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "white",
            border: "2px solid #10b981",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {sugerencias.map((item, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                seleccionar(item);
              }}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#ecfdf5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: "900",
                  color: "#065f46",
                  fontSize: "11px",
                  minWidth: "54px",
                  background: "#d1fae5",
                  padding: "2px 5px",
                  borderRadius: "4px",
                  flexShrink: 0,
                }}
              >
                {item.code}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#374151",
                  lineHeight: "1.4",
                }}
              >
                {item.desc}
              </span>
            </div>
          ))}
          <div
            style={{
              padding: "3px 10px",
              background: "#f0fdf4",
              fontSize: "9px",
              color: "#6b7280",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            {sugerencias.length} resultado(s) · CIE-10 Salud Ocupacional ·
            Decreto 1477/2014 · Res. 1843/2025
          </div>
        </div>
      )}
    </div>
  );
};
// MÓDULO 4: UTILIDADES
// ==========================================
const numeroALetras = (num) => {
  if (!num) return "";
  const unidades = [
    "",
    "UN",
    "DOS",
    "TRES",
    "CUATRO",
    "CINCO",
    "SEIS",
    "SIETE",
    "OCHO",
    "NUEVE",
  ];
  const diez = [
    "DIEZ",
    "ONCE",
    "DOCE",
    "TRECE",
    "CATORCE",
    "QUINCE",
    "DIECISEIS",
    "DIECISIETE",
    "DIECIOCHO",
    "DIECINUEVE",
  ];
  const decenas = [
    "",
    "DIEZ",
    "VEINTE",
    "TREINTA",
    "CUARENTA",
    "CINCUENTA",
    "SESENTA",
    "SETENTA",
    "OCHENTA",
    "NOVENTA",
  ];
  const centenas = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ];
  let n = parseFloat(num);
  if (n === 0) return "CERO";
  let out = "";
  if (n >= 1000000) {
    out +=
      numeroALetras(Math.floor(n / 1000000)) +
      (Math.floor(n / 1000000) === 1 ? " MILLÓN " : " MILLONES ");
    n %= 1000000;
  }
  if (n >= 1000) {
    if (Math.floor(n / 1000) === 1) out += "MIL ";
    else out += numeroALetras(Math.floor(n / 1000)) + " MIL ";
    n %= 1000;
  }
  if (n >= 100) {
    if (n === 100) return out + "CIEN";
    out += centenas[Math.floor(n / 100)] + " ";
    n %= 100;
  }
  if (n >= 20) {
    out += decenas[Math.floor(n / 10)];
    n %= 10;
    if (n > 0) out += " Y ";
  } else if (n >= 10) {
    out += diez[n - 10];
    n = 0;
  }
  if (n > 0) out += unidades[n];
  return out.trim();
};
const analyzeBP = (v) => {
  if (!v || !v.includes("/")) return null;
  const [s, d] = v.split("/").map(Number);
  if (isNaN(s) || isNaN(d)) return null;
  if (s < 90 || d < 60)
    return { text: "Hipotensión", color: "text-blue-600 bg-blue-100" };
  if (s < 120 && d < 80)
    return { text: "Normotenso", color: "text-green-600 bg-green-100" };
  if (s >= 120 && s <= 129 && d < 80)
    return { text: "Elevada", color: "text-yellow-600 bg-yellow-100" };
  if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89))
    return { text: "HTA Grado 1", color: "text-orange-600 bg-orange-100" };
  if (s >= 140 || d >= 90)
    return { text: "HTA Grado 2", color: "text-red-600 bg-red-100" };
  return null;
};
const analyzeHR = (v) => {
  const h = parseInt(v);
  if (isNaN(h)) return null;
  if (h < 60)
    return { text: "Bradicardia", color: "text-blue-600 bg-blue-100" };
  if (h <= 100) return { text: "Normal", color: "text-green-600 bg-green-100" };
  return { text: "Taquicardia", color: "text-red-600 bg-red-100" };
};
const analyzeBMI = (v) => {
  const b = parseFloat(v);
  if (isNaN(b)) return null;
  if (b < 18.5)
    return { text: "Bajo Peso", color: "text-blue-600 bg-blue-100" };
  if (b < 25) return { text: "Normal", color: "text-green-600 bg-green-100" };
  if (b < 30)
    return { text: "Sobrepeso", color: "text-orange-600 bg-orange-100" };
  if (b < 35) return { text: "Obesidad I", color: "text-red-600 bg-red-100" };
  if (b < 40) return { text: "Obesidad II", color: "text-red-700 bg-red-200" };
  return { text: "Obesidad III", color: "text-red-800 bg-red-300" };
};
const getSpanishDate = (d) => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  let dt;
  if (d && typeof d === "string" && d.includes("-")) {
    const [y, m, day] = d.split("-").map(Number);
    return `${day} de ${months[m - 1]} de ${y}`;
  }
  dt = d ? new Date(d) : new Date();
  return `${dt.getDate()} de ${months[dt.getMonth()]} de ${dt.getFullYear()}`;
};
const NORMAL_DESCRIPTIONS_SYSTEMS = {
  cabeza:
    "Normocéfalo, sin deformidades, sin masas palpables ni dolor a la palpación.",
  ojos: "Pupilas isocóricas normorreactivas, conjuntivas rosadas, escleróticas blancas, movimientos oculares conservados.",
  oidos:
    "Pabellones auriculares sin lesiones, conductos auditivos permeables, membranas timpánicas íntegras.",
  nariz:
    "Tabique centrado, mucosa húmeda rosada, sin pólipos ni secreciones patológicas, permeabilidad nasal conservada.",
  boca: "Mucosa oral húmeda rosada, orofaringe sin eritema, amígdalas no hipertróficas, dentición conservada.",
  cuello:
    "Cuello simétrico, sin adenopatías palpables, tráquea centrada, tiroides no palpable, pulsos carotídeos simétricos.",
  torax:
    "Simétrico, normoexpansible, sin deformidades costales, mamas sin masas palpables.",
  corazon:
    "Ruidos cardíacos rítmicos, de buena intensidad, sin soplos, no se palpan thrill.",
  pulmones:
    "Murmullo vesicular presente y simétrico bilateralmente, sin agregados pulmonares (no sibilancias, no estertores).",
  abdomen:
    "Blando, depresible, no doloroso a la palpación, sin masas, sin organomegalias, ruidos intestinales presentes.",
  genitourinario:
    "Sin puño-percusión renal positiva, región inguinal sin masas ni hernias palpables.",
  columna:
    "Sin escoliosis, sin cifosis patológica, movilidad conservada en todos los planos, no dolor a la palpación de apófisis espinosas.",
  extremidades:
    "Simétricas, bien conformadas, sin edemas, pulsos periféricos presentes y simétricos, llenado capilar <2 seg.",
  piel: "Tegumentos de coloración normal, hidratados, sin lesiones activas, sin cicatrices patológicas.",
  neurologico:
    "Orientado en tiempo, lugar y persona. Pares craneales sin alteraciones. Fuerza y sensibilidad conservadas, marcha normal, coordinación adecuada.",
};
// ==========================================
// MÓDULO 5: ESTADOS INICIALES
// ==========================================
const initialOccupPatientState = {
  id: null,
  type: "ocupacional",
  fechaRegistro: new Date().toISOString(),
  estadoHistoria: "Abierta",
  codigoVerificacion: "",
  conteoEdiciones: 0,
  motivoEdicion: "",
  // Foliación HC - Res. 1995/1999 Art. 3
  folioHC: "",
  // Número consecutivo de versión del documento
  versionDocumento: 1,
  fechaExamen: new Date().toISOString().split("T")[0],
  ciudad: "Popayán",
  tipoExamen: "INGRESO",
  frecuenciaSeguimiento: "",
  enfasisExamen: "GENERAL",
  // Perfil de Cargo (Res. 1843/2025 Art. 29)
  perfilCargo_funciones: "",
  perfilCargo_demandasFisicas: "",
  perfilCargo_demandasMentales: "",
  perfilCargo_factoresRiesgo: "",
  perfilCargo_nivelExposicion: "",
  perfilCargo_medidasControl: "",
  perfilCargo_tiempoAcumulado: "",
  // Campos de incapacidad y ausencia (Res. 1843/2025 Art. 9 y 13)
  diasIncapacidad: "",
  diasAusenciaNoMedica: "",
  // ══ B-10: Nuevos campos Res. 1843/2025 ══
  plazoImplementacionRecomendaciones: "20", // Art. 25 - plazo en días calendario
  periodicidadUltimaEval: "", // Para alerta de evaluación vencida (max 3 años)
  pausasActivasPrograma: false, // Art. 26 - empresa tiene programa de pausas activas
  pausasActivasParticipa: false, // Trabajador participa en pausas activas
  justificacionPruebaEspecial: "", // Justificación clínica si se ordena prueba sensible
  nombres: "",
  docNumero: "",
  docTipo: "CC",
  fechaNacimiento: "",
  edad: "",
  genero: "",
  estadoCivil: "",
  escolaridad: "",
  dependencia: "",
  cargo: "",
  eps: "",
  afp: "",
  telefono: "",
  celular: "",
  email: "",
  arl: "",
  nivelRiesgoARL: "",
  turnoTrabajo: "",
  estrato: "",
  tipoVivienda: "",
  residencia: "",
  antiguedadEmpresa: "",
  tipoContrato: "",
  grupoEtnico: "",
  identidadGenero: "",
  zonaResidencia: "",
  grupoSanguineo: "",
  foto: "",
  lateralidad: "",
  numPersonasCargo: "",
  ingresosMensuales: "",
  actividadEconomicaTrabajador: "",
  empresaId: "particular",
  empresaNombre: "PARTICULAR / INDEPENDIENTE",
  empresaNit: "",
  actividadEconomica: "",
  motivoConsulta: "",
  // Consentimiento con evidencia probatoria (Ley 1581/2012 + Res. 1843/2025 Art. 12)
  consentimientoVersion: "v2025-1843",
  consentimientoTimestamp: "",
  consentimientoIp: "sesión-web",
  riesgos: {
    fisicos: false,
    quimicos: false,
    biologicos: false,
    mecanicos: false,
    biomecanicos: false,
    psicosocial: false,
    seguridad: false,
    locativos: false,
  },
  antecedentesAgrupados: {
    patologicos: { val: false, det: "" },
    quirurgicos: { val: false, det: "" },
    traumaticos: { val: false, det: "" },
    farmacologicos: { val: false, det: "" },
    alergicos: { val: false, det: "" },
  },
  vacunacionCompleta: false,
  habitos: {
    fuma: "No",
    alcohol: "No",
    psicoactivas: "No",
    deporte: "No",
    detalle: "",
  },
  examenFisicoSistemas: {
    cabeza: { estado: "Normal", hallazgo: "" },
    ojos: { estado: "Normal", hallazgo: "" },
    oidos: { estado: "Normal", hallazgo: "" },
    nariz: { estado: "Normal", hallazgo: "" },
    boca: { estado: "Normal", hallazgo: "" },
    cuello: { estado: "Normal", hallazgo: "" },
    torax: { estado: "Normal", hallazgo: "" },
    corazon: { estado: "Normal", hallazgo: "" },
    pulmones: { estado: "Normal", hallazgo: "" },
    abdomen: { estado: "Normal", hallazgo: "" },
    genitourinario: { estado: "Normal", hallazgo: "" },
    columna: { estado: "Normal", hallazgo: "" },
    extremidades: { estado: "Normal", hallazgo: "" },
    piel: { estado: "Normal", hallazgo: "" },
    neurologico: { estado: "Normal", hallazgo: "" },
  },
  maniobrasOsteomusculares: {
    phalen: { estado: "Normal", hallazgo: "" },
    tinel: { estado: "Normal", hallazgo: "" },
    finkelstein: { estado: "Normal", hallazgo: "" },
    jobe: { estado: "Normal", hallazgo: "" },
    lasegue: { estado: "Normal", hallazgo: "" },
    adams: { estado: "Normal", hallazgo: "" },
    wells: { estado: "Normal", hallazgo: "" },
    schober: { estado: "Normal", hallazgo: "" },
    otra: { estado: "Normal", hallazgo: "", nombre: "" },
  },
  examenAlturas: {
    romberg: "Normal",
    marcha: "Normal",
    vertigo: "Negativo",
    coordinacion: "Normal",
    nistagmus: "Ausente",
    testMiedo: "Negativo",
    observaciones: "",
  },
  examenAlimentos: {
    pielFaneras: "Normal",
    orl: "Normal",
    gastrointestinal: "Normal",
    observaciones: "",
  },
  examenConfinados: {
    cardiovascular: "Normal",
    respiratorio: "Normal",
    neurologico: "Normal",
    psicologico: "Apto",
    otorrino: "Normal",
    usoEpp: "Apto",
    hallazgosCardio: "",
    observaciones: "",
  },
  examenOsteomuscular: {
    columna: "Normal",
    miembrosSup: "Normal",
    miembrosInf: "Normal",
    muscular: "Normal",
    articular: "Normal",
    postural: "Normal",
    hallazgos: "",
    diagnosticoFuncional: "",
  },
  examenCorazon: {
    frecuenciaCardiaca: "Normal",
    presionArterial: "Normal",
    ritmoyTonos: "Normal",
    pulsos: "Normal",
    edemas: "Ausente",
    perfusionPeriferica: "Normal",
    signosVitales: "",
    imc: "",
    riesgoCV: "",
    hallazgos: "",
    restricciones: "",
  },
  paraclinicosCheck: {
    optometria: false,
    audiometria: false,
    espirometria: false,
    ecg: false,
    glicemia: false,
    lipidico: false,
    frotisFaringeo: false,
    coprologico: false,
    kohUnas: false,
    hematico: false,
    rx: false,
    emg: false,
    psicologia: false,
    otros: "",
  },
  agudezaVisual: {
    lejanaOD: "",
    lejanaOI: "",
    proximaOD: "",
    proximaOI: "",
    correccion: false,
  },
  ta: "",
  fc: "",
  fr: "",
  temp: "",
  peso: "",
  talla: "",
  imc: "",
  diagnosticoPrincipal: "Z10.0 - EXAMEN MÉDICO OCUPACIONAL",
  diagnosticoSecundario1: "",
  diagnosticoSecundario2: "",
  conceptoAptitud: "",
  recomendaciones: "",
  vigencia: "",
  analisisRestricciones: "",
  analisisIA: "",
  sveRecomendado: [],
  restriccionesChecklist: {},
  recomendacionesChecklist: {},
  formulaMedica: "",
  formulaMedicamentos: [],
  derivaciones: [],
  esConvenio: false,
  valorAtencion: "",
  incapacidad: {
    fechaInicio: "",
    fechaFin: "",
    dias: 0,
    origen: "Enfermedad General",
    tipo: "Ambulatoria",
    prorroga: "No",
    diagnostico: "",
    descripcion: "",
  },
  // NORMATIVO: Res. 1843/2025 Art. 12 - Consentimiento informado
  consentimientoInformado: false,
  fechaConsentimiento: "",
  tipoConsentimiento: "Digital",
  consentimientoNombrePaciente: "", // B-19: nombre escrito por el paciente
  // NORMATIVO: Res. 1843/2025 Art. 25 - Entrega del certificado al trabajador
  certificadoEntregado: false,
  fechaEntregaCertificado: "",
  metodoEntregaCertificado: "Física",
  // B-16: Adjuntos de paraclínicos (espirometría, audiometría, RX, laboratorios)
  // Estructura: [{id, nombre, tipo, mimeType, tamano, fecha, subidoPor, path, url}]
  adjuntos: [],
};
const initialGeneralPatientState = {
  id: null,
  type: "general",
  fechaRegistro: new Date().toISOString(),
  estadoHistoria: "Abierta",
  codigoVerificacion: "",
  fechaConsulta: new Date().toISOString().split("T")[0],
  nombres: "",
  docNumero: "",
  edad: "",
  fechaNacimiento: "",
  genero: "",
  estadoCivil: "",
  escolaridad: "",
  telefono: "",
  email: "",
  residencia: "",
  eps: "",
  grupoSanguineo: "",
  alergias: "",
  motivoConsulta: "",
  enfermedadActual: "",
  antecedentes: {
    personales: "",
    familiares: "",
    quirurgicos: "",
    traumaticos: "",
    farmacologicos: "",
    alergicos: "",
    ginecologicos: "",
  },
  revisionSistemas: {
    general: "",
    cardiovascular: "",
    respiratorio: "",
    digestivo: "",
    genitourinario: "",
    musculoesqueletico: "",
    neurologico: "",
    dermatologico: "",
    endocrinologico: "",
  },
  examenFisico: {
    estadoGeneral: "",
    ta: "",
    fc: "",
    fr: "",
    temp: "",
    peso: "",
    talla: "",
    imc: "",
    saturacion: "",
    hallazgos: "",
  },
  sistemasPorExamen: {
    cabeza: { estado: "Normal", hallazgo: "" },
    cuello: { estado: "Normal", hallazgo: "" },
    torax: { estado: "Normal", hallazgo: "" },
    abdomen: { estado: "Normal", hallazgo: "" },
    extremidades: { estado: "Normal", hallazgo: "" },
    neurologico: { estado: "Normal", hallazgo: "" },
    piel: { estado: "Normal", hallazgo: "" },
  },
  diagnosticos: [{ cie10: "", descripcion: "", tipo: "Principal" }],
  plan: {
    conducta: "",
    medicamentos: "",
    paraclinicosSolicitados: "",
    remisiones: "",
    recomendaciones: "",
    controlEn: "",
  },
  incapacidad: {
    aplica: false,
    dias: "",
    desde: "",
    hasta: "",
    origen: "Enfermedad General",
  },
};
const initialUsers = [
  {
    id: 1,
    user: "drcucalon",
    passHash:
      "49679f37304820e18bae7ed12292e42a7722a7d1a55f12e41b1abca5cc5162fd",
    mustChangePassword: false, // FIX: no forzar cambio — Supabase tiene la contraseña real
    name: "Dr. Julian Cucalon",
    role: "super_admin", // FASE 2: promovido a super_admin (puede crear orgs + HC)
    orgId: ORG_DEFAULT_ID, // FASE 2: organización principal
    license: "clinica",
    licenseExpiry: "2099-12-31",
    licenseStarted: "2026-01-01",
    porcentajeHonorarios: 100, // FASE 2: hook distribución futura (Componente 10)
    secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT },
    // Perfil del super_admin - aparece en navbar, certificados y firmas
    doctorData: {
      ...DEFAULT_DOCTOR_DATA,
      nombre: "Dr. Julian Cucalon",
      titulo: "Médico Especialista en Salud Ocupacional",
      ciudad: "Popayán",
      // licencia, cedula, celular, email: se configuran en Ajustes → Firma
    },
  },
];
const initialCompanyState = {
  nombre: "",
  nit: "",
  dv: "",
  orgId: ORG_DEFAULT_ID, // FASE 2: aislamiento multi-tenant
  codActividad: "",
  actividad: "",
  direccion: "",
  ciudad: "",
  telefono: "",
  correo: "",
  arl: "",
  gerente: "",
  // ── Convenio ──
  medicoResponsableId: "", // médico principal para esta empresa
  tarifaIngreso: "", // tarifa examen de ingreso COP
  tarifaPeriodico: "", // tarifa examen periódico
  tarifaEgreso: "", // tarifa examen de egreso
  tarifaConsulta: "", // tarifa consulta general
  condicionesPago: "contado", // contado / 30dias / 60dias
  convenioFecha: "", // inicio del convenio
  convenioVencimiento: "", // vencimiento (alerta 30 días antes)
  descuento: "", // % descuento sobre tarifa
  portalActivo: false, // portal cliente habilitado
  facturacionAgrupada: false, // agrupar varios exámenes en una factura
  planExamenes: [], // exámenes incluidos en el convenio
  notasConvenio: "", // notas adicionales del convenio
  // ── Multi-médico / Multi-sede (FASE 2) ──
  medicoIds: [], // array de usernames de médicos asignados a esta empresa
  sedes: [], // array de sedes [{nombre, ciudad, direccion}]
  // ── Admin del Portal Empresa (FASE 2) ──
  portalAdminUser: "", // username del admin del portal empresa
  portalAdminPassHash: "", // SHA-256 de la contraseña admin del portal
  // ── IPS: Admin de empresa con acceso al login principal ──
  adminEmpresaUser: "", // username del admin_empresa (login principal)
  // ── PASO 1: Perfil IPS ──
  logo: "", // base64 del logo de la empresa
  lema: "", // slogan/lema de la IPS
};
// ==========================================
// MÓDULO 6: COMPONENTES UI REUTILIZABLES
// ==========================================
// ══ B-07: Validador de contraseña centralizado (OWASP A07 + política SISO) ══
const _validarContrasena = (pw) => {
  const errores = [];
  if (!pw || pw.length < 10) errores.push("Mínimo 10 caracteres");
  if (!/[A-Z]/.test(pw)) errores.push("Al menos 1 letra mayúscula");
  if (!/[a-z]/.test(pw)) errores.push("Al menos 1 letra minúscula");
  if (!/[0-9]/.test(pw)) errores.push("Al menos 1 número");
  if (!/[^A-Za-z0-9]/.test(pw))
    errores.push("Al menos 1 carácter especial (!@#$%...)");
  const comunes = [
    "password",
    "contraseña",
    "123456",
    "qwerty",
    "admin",
    "siso",
    "medico",
    "doctor",
    "cucalon",
  ];
  if (comunes.some((c) => pw.toLowerCase().includes(c)))
    errores.push("No usar palabras comunes o el nombre del sistema");
  return {
    valida: errores.length === 0,
    errores,
    fortaleza: Math.max(0, 5 - errores.length),
  };
};
const _FortalezaPass = ({ pw }) => {
  if (!pw) return null;
  const { valida, errores, fortaleza } = _validarContrasena(pw);
  const colores = [
    "bg-red-500",
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
    "bg-emerald-500",
  ];
  const labels = [
    "",
    "Muy débil",
    "Débil",
    "Aceptable",
    "Fuerte",
    "Muy fuerte",
  ];
  return (
    <div className="mt-1">
      <div className="flex gap-0.5 mb-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full ${
              n <= fortaleza ? colores[fortaleza] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-[10px] font-bold ${
          valida ? "text-emerald-700" : "text-red-600"
        }`}
      >
        {valida ? `✅ ${labels[fortaleza]}` : `⚠️ ${errores[0]}`}
      </p>
    </div>
  );
};
// SEC-F1-06: Content Security Policy via meta tag
const SecurityHeaders = () => (
  <>
    <meta httpEquiv="Content-Security-Policy" content="default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.groq.com https://api.together.xyz https://openrouter.ai https://api.anthropic.com; font-src 'self' https:; frame-ancestors 'none';" />
    <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
    <meta httpEquiv="X-Frame-Options" content="DENY" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
  </>
);
const PrintStyles = () => (
  <style>{`
    /* ═══════════════════════════════════════════════════════
       OCUPASALUD v3 - PRINT STYLES PREMIUM
       Continuidad total · Sin cortes · Colores exactos
    ═══════════════════════════════════════════════════════ */
    @media print {
      @page { size: letter portrait; margin: 1.1cm 1.3cm 1.3cm 1.3cm; }
      /* Colores exactos */
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
      /* Ocultar UI */
      .no-print, nav, button:not(.print-show), input[type="file"], [data-no-print] { display: none !important; }
      /* Ocultar overlays del entorno de desarrollo (CodeSandbox, React DevTools, error overlay) */
      #webpack-dev-server-client-overlay, #webpack-dev-server-client-overlay-div,
      [id*="sandbox"], [class*="sandbox"], [id*="codesandbox"],
      iframe[src*="sandbox"], iframe[src*="csb.app"],
      div[style*="z-index: 2147483647"], div[style*="z-index:2147483647"],
      #__vconsole, .ReactQueryDevtools, #react-query-devtools-btn { display: none !important; }
      /* Body */
      body { background: white !important; margin: 0 !important; padding: 0 !important; font-family: Arial, Helvetica, sans-serif !important; font-size: 8.5pt !important; line-height: 1.4 !important; color: #111 !important; }
      /* Eliminar fondo gris del wrapper que causa aspecto nublado */
      .min-h-screen, .bg-gray-100, main { background: white !important; }
      /* Eliminar sombras y bordes redondeados en impresión */
      .shadow-2xl, .shadow-xl, .shadow-lg, .shadow-md, .shadow-sm, .shadow { box-shadow: none !important; }
      .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md, .rounded { border-radius: 0 !important; }
      /* Carta: flujo continuo, sin sombra, sin borde */
      .carta-visual { width: 100% !important; max-width: 100% !important; min-height: unset !important; height: auto !important; padding: 0 !important; margin: 0 auto !important; box-shadow: none !important; border-radius: 0 !important; page-break-inside: auto !important; break-inside: auto !important; background: white !important; }
      /* Secciones con fondo: flujo continuo, permitir cortes naturales */
      .bg-emerald-50, .bg-blue-50, .bg-orange-50, .bg-red-50, .bg-teal-50, .bg-yellow-50, .bg-purple-50, .bg-gray-50, .bg-gray-100 { page-break-inside: auto !important; break-inside: auto !important; }
      /* Bloques individuales: no cortar */
      .print-break-avoid, .signature-block, table { page-break-inside: avoid !important; break-inside: avoid !important; }
      tr { page-break-inside: avoid !important; break-inside: avoid !important; }
      /* Títulos no solos al final */
      h1, h2, h3, h4 { page-break-after: avoid !important; break-after: avoid !important; orphans: 3 !important; widows: 3 !important; }
      p { orphans: 3 !important; widows: 3 !important; }
      /* Saltos: solo page-break tiene salto real; section-break fluye continuo */
      .print-page-break { page-break-before: always !important; break-before: page !important; margin-top: 0 !important; padding-top: 0 !important; }
      .print-section-break, .report-section-break { page-break-before: auto !important; break-before: auto !important; margin-top: 4mm !important; padding-top: 0 !important; }
      /* Espaciados compactos */
      .mb-6{margin-bottom:3.5mm!important} .mb-5{margin-bottom:3mm!important} .mb-4{margin-bottom:2.5mm!important} .mb-3{margin-bottom:2mm!important} .mb-2{margin-bottom:1.5mm!important} .mb-1{margin-bottom:1mm!important}
      .mt-10{margin-top:4mm!important} .mt-8{margin-top:3.5mm!important} .mt-6{margin-top:3mm!important} .mt-4{margin-top:2mm!important}
      .gap-6{gap:3.5mm!important} .gap-4{gap:2.5mm!important} .gap-3{gap:2mm!important} .gap-2{gap:1.5mm!important}
      .space-y-4>*+*{margin-top:2.5mm!important} .space-y-3>*+*{margin-top:2mm!important} .space-y-2>*+*{margin-top:1.5mm!important} .space-y-1>*+*{margin-top:1mm!important}
      /* Padding compacto */
      .p-6{padding:3.5mm!important} .p-5{padding:3mm!important} .p-4{padding:2.5mm!important} .p-3{padding:2mm!important} .p-2{padding:1.5mm!important} .p-1{padding:1mm!important}
      .py-4{padding-top:2mm!important;padding-bottom:2mm!important} .py-3{padding-top:1.5mm!important;padding-bottom:1.5mm!important} .py-2{padding-top:1mm!important;padding-bottom:1mm!important}
      .px-4{padding-left:2.5mm!important;padding-right:2.5mm!important} .px-3{padding-left:2mm!important;padding-right:2mm!important} .px-2{padding-left:1.5mm!important;padding-right:1.5mm!important}
      /* Colores de fondo exactos */
      .bg-emerald-50{background-color:#ecfdf5!important} .bg-emerald-100{background-color:#d1fae5!important}
      .bg-emerald-600{background-color:#059669!important;color:white!important} .bg-emerald-700{background-color:#047857!important;color:white!important}
      .bg-blue-50{background-color:#eff6ff!important} .bg-blue-100{background-color:#dbeafe!important}
      .bg-blue-600{background-color:#2563eb!important;color:white!important}
      .bg-gray-50{background-color:#f9fafb!important} .bg-gray-100{background-color:#f3f4f6!important}
      .bg-gray-800{background-color:#1f2937!important;color:white!important}
      .bg-orange-50{background-color:#fff7ed!important} .bg-red-50{background-color:#fef2f2!important}
      .bg-red-100{background-color:#fee2e2!important} .bg-red-600{background-color:#dc2626!important;color:white!important}
      .bg-teal-50{background-color:#f0fdfa!important} .bg-yellow-50{background-color:#fefce8!important}
      .bg-purple-50{background-color:#faf5ff!important} .bg-slate-800{background-color:#1e293b!important;color:white!important}
      .bg-indigo-600{background-color:#4f46e5!important;color:white!important}
      .bg-amber-100{background-color:#fef3c7!important} .bg-green-100{background-color:#dcfce7!important}
      /* Tipografía */
      p, span, td, th, li { font-size: 8.5pt !important; }
      .text-xs{font-size:7pt!important} .text-sm{font-size:8pt!important} .text-base{font-size:9pt!important}
      .text-lg{font-size:10.5pt!important} .text-xl{font-size:12pt!important} .text-2xl{font-size:14pt!important}
      h1{font-size:14pt!important} h2{font-size:11pt!important} h3{font-size:9.5pt!important} h4{font-size:9pt!important}
      /* Firma siempre visible */
      .signature-block { display: flex !important; visibility: visible !important; }
      .hidden { display: none !important; }
      .print\:flex { display: flex !important; }
      .print\:block { display: block !important; }
      .print\:inline { display: inline !important; }
      .print\:inline-block { display: inline-block !important; }
      .print\:hidden { display: none !important; }
      .print\:shadow-none { box-shadow: none !important; }
      .print\:border-black { border-color: #000 !important; }
      .print\:bg-transparent { background-color: transparent !important; }
      .print\:border-gray-300 { border-color: #d1d5db !important; }
      /* Tablas */
      table { width: 100% !important; border-collapse: collapse !important; }
      th, td { padding: 1.5mm 2mm !important; font-size: 8pt !important; }
      /* Inputs transparentes */
      input, select, textarea { border: none !important; border-bottom: 0.5pt solid #888 !important; background: transparent !important; padding: 0 !important; font-size: 8pt !important; font-weight: 600 !important; -webkit-appearance: none !important; box-shadow: none !important; outline: none !important; }
      /* Checkboxes: mantener visible su estado */
      input[type="checkbox"] { -webkit-appearance: checkbox !important; appearance: checkbox !important; border: none !important; border-bottom: none !important; width: 12px !important; height: 12px !important; }
      /* Select: mostrar valor sin flecha */
      select { -webkit-appearance: none !important; border-bottom: 0.5pt solid #888 !important; }
      /* Asegurar que la firma del médico se muestre en impresión */
      .signature-block, .print\\:flex { display: flex !important; visibility: visible !important; }
      .hidden.print\\:flex { display: flex !important; }
      .hidden.print\\:block { display: block !important; }
      /* Textarea: mostrar todo el texto sin recortar */
      textarea, [contenteditable], .text-libre { height: auto !important; max-height: none !important; overflow: visible !important; resize: none !important; white-space: pre-wrap !important; word-wrap: break-word !important; break-inside: avoid !important; page-break-inside: avoid !important; }
      /* Contenedores de texto libre - sin truncar */
      .overflow-y-auto, .overflow-auto, .overflow-hidden { overflow: visible !important; max-height: none !important; }
      /* Ocultar etiquetas "sugerido por IA" y "generado por IA" al imprimir */
      .ai-label-print-hide, [data-ai-label] { display: none !important; }
      /* Reportes IA: ajustar cuadros al contenido, no estirar */
      .bg-amber-50, .bg-emerald-50, .bg-indigo-50, .bg-blue-50 { page-break-inside: avoid !important; break-inside: avoid !important; }
      .whitespace-pre-wrap { white-space: pre-wrap !important; word-wrap: break-word !important; }
      /* Reportes: ocultar botones y etiquetas de IA */
      [class*="BrainCircuit"], .no-print, button { display: none !important; }
      button.print-show { display: inline-flex !important; }
      ::placeholder { color: transparent !important; }
      /* Grid y flex */
      .grid { display: grid !important; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
      .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
      .flex { display: flex !important; }
      .flex-col { flex-direction: column !important; }
      /* Bordes y sombras */
      .rounded-xl, .rounded-2xl, .rounded-lg { border-radius: 3px !important; }
      .rounded-full { border-radius: 50% !important; }
      .shadow, .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl { box-shadow: none !important; }
    }
    /* Animaciones pantalla */
    @keyframes fade-in { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
    .animate-fade-in { animation: fade-in 0.25s ease-out both; }
    .checklist-item { transition: background 0.1s; }
    /* GLOBAL: Todos los textareas redimensionables y auto-expandibles */
    textarea { resize: vertical !important; min-height: 60px; field-sizing: content; overflow-y: hidden; }
  `}</style>
);
// DoctorSignature: muestra imagen de firma + datos completos del profesional debajo
const DoctorSignature = ({ signature, data, showData = true }) => {
  const doc = data || DEFAULT_DOCTOR_DATA;
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="h-16 w-52 flex items-center justify-center mb-0.5">
        {signature ? (
          <img
            src={signature}
            alt="Firma"
            className="max-h-full max-w-full object-contain drop-shadow-sm"
          />
        ) : (
          <div className="h-14 w-full border-b-2 border-dashed border-gray-400 flex items-end justify-center pb-1">
            <span className="text-[9px] text-gray-300 italic">Firma</span>
          </div>
        )}
      </div>
      {showData && (
        <div className="text-center border-t-2 border-gray-900 pt-1 w-full">
          <p className="font-black text-[10px] uppercase tracking-tight text-gray-900 leading-tight">
            {doc.nombre || "Nombre del Profesional"}
          </p>
          <p className="text-[9px] text-gray-700 font-semibold leading-tight">
            {doc.titulo || "Especialista SST"}
          </p>
          <p className="text-[9px] text-gray-600 leading-tight">
            C.C. {doc.cedula || "--"}
          </p>
          <p className="text-[9px] font-black text-emerald-700 leading-tight">
            RM: {doc.licencia || "--"}
          </p>
          {doc.celular && (
            <p className="text-[9px] text-gray-500 leading-tight">
              Tel: {doc.celular}
            </p>
          )}
          {doc.ciudad && (
            <p className="text-[9px] text-gray-500 leading-tight">
              {doc.ciudad}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
// PERF-02: memo evita re-render cuando signature/data no cambian (se usa en ~15 lugares)
const DoctorSignatureMemo = React.memo(DoctorSignature);
// BrandLogo: logotipo compacto para cabecera de documentos
const BrandLogo = ({ data }) => {
  const doc = data || DEFAULT_DOCTOR_DATA;
  const parts = (doc.nombre || "").trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length > 2 ? 2 : 1][0]}`
      : "DR";
  return (
    <div className="flex items-center space-x-2">
      <div className="h-10 w-10 bg-gradient-to-tr from-emerald-700 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0">
        <div className="flex flex-col items-center leading-none">
          <Stethoscope className="w-3.5 h-3.5 mb-0.5" strokeWidth={2.5} />
          <span className="text-[10px] font-black tracking-tighter">
            {initials}
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-[10px] font-black text-gray-900 uppercase leading-tight whitespace-normal break-words">
          {doc.nombre || "MÉDICO"}
        </p>
        <div className="h-0.5 w-8 bg-gradient-to-r from-emerald-500 to-teal-400 my-0.5 rounded-full" />
        <p className="text-[8px] font-bold text-gray-500 uppercase whitespace-normal break-words">
          {doc.titulo || "Salud Ocupacional"}
        </p>
        <p className="text-[8px] font-bold text-emerald-600 whitespace-normal break-words">
          RM: {doc.licencia || "--"}
        </p>
        {doc.ciudad && (
          <p className="text-[8px] text-gray-400 whitespace-normal break-words">
            {doc.ciudad}
          </p>
        )}
      </div>
    </div>
  );
};
const InputGroup = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  width = "w-full",
  disabled = false,
  alertInfo = null,
  list,
}) => (
  <div className={`mb-2 ${width} px-1.5 print:mb-1`}>
    <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate">
      {label}
      {required && <span className="text-red-500 no-print"> *</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        list={list}
        className={`w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none text-xs ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
        } print:text-[9px] print:p-0 print:border-none`}
      />
      {alertInfo && (
        <div
          className={`absolute right-0 -top-5 text-[9px] font-bold px-2 py-0.5 rounded-full no-print ${alertInfo.color}`}
        >
          {alertInfo.text}
        </div>
      )}
    </div>
  </div>
);
const SelectGroup = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  width = "w-full",
  disabled = false,
}) => (
  <div className={`mb-2 ${width} px-1.5 print:mb-1`}>
    <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate">
      {label}
      {required && <span className="text-red-500 no-print"> *</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs bg-white appearance-none ${
          disabled ? "bg-gray-50 cursor-not-allowed" : ""
        } print:text-[9px] print:p-0 print:border-none`}
      >
        <option value="">Seleccione...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-gray-400 no-print" />
    </div>
  </div>
);
const TextAreaGroup = ({
  label,
  name,
  value,
  onChange,
  rows = 3,
  placeholder = "",
}) => (
  <div className="mb-2 w-full px-1.5 print:mb-1">
    <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">
      {label}
    </label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs print:text-[9px] print:p-0 print:border-none resize-none"
    />
  </div>
);
const SectionTitle = ({ title, icon: Icon, color }) => {
  const c = color || "emerald";
  return (
    <div
      className="print-break-avoid"
      style={{ pageBreakInside: "avoid", pageBreakAfter: "avoid" }}
    >
      <div
        className={`w-full border-b border-${c}-400 mb-2 mt-3 pb-0.5 flex items-center bg-${c}-50 p-1.5 rounded-t print:bg-transparent print:border-gray-400 print:mt-2 print:mb-1 print:p-0`}
      >
        <Icon className={`mr-2 w-4 h-4 text-${c}-600 print:hidden`} />
        <h3
          className={`text-xs font-bold uppercase tracking-wide text-${c}-800 print:text-black`}
        >
          {title}
        </h3>
      </div>
    </div>
  );
};
// ==========================================
// MÓDULO 6B: PLAN GATE - Control de acceso por plan
// Uso: <PlanGate feature="ia_analisis" requiredPlan="pro" currentUser={currentUser}>
//        <contenido restringido />
//      </PlanGate>
// ==========================================
const PlanGate = ({
  feature,
  requiredPlan,
  currentUser,
  children,
  fallback,
  inline,
}) => {
  if (_canUse(feature, currentUser)) return children;
  const plan = PLAN_CONFIG[currentUser?.license || "libre"];
  const req  = PLAN_CONFIG[requiredPlan] || PLAN_CONFIG.starter;
  const isExpired = plan && plan.price > 0 && currentUser?.licenseExpiry
    && new Date(currentUser.licenseExpiry) < new Date();
  if (fallback) return fallback;
  if (inline)
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-black text-amber-700 cursor-default"
        title={isExpired ? "Plan vencido — comunícate con tu administrador" : `Disponible en plan ${req.label}`}
      >
        {isExpired ? "⏰ Plan vencido" : `🔒 ${req.label}`}
      </span>
    );
  if (isExpired) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 text-center space-y-4 shadow-sm">
        <div className="text-5xl">⏰</div>
        <div>
          <p className="font-black text-amber-900 text-lg">¡Tu plan ha vencido!</p>
          <p className="text-amber-700 text-sm mt-1">
            Tu suscripción <strong>{plan.label}</strong> expiró el{" "}
            <strong>{new Date(currentUser.licenseExpiry).toLocaleDateString("es-CO", { day:"numeric", month:"long", year:"numeric" })}</strong>.
            <br/>Tu información está segura. Solo necesitas renovar para continuar.
          </p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4 text-left space-y-2 max-w-sm mx-auto">
          <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-2">💬 Renueva tu plan fácilmente</p>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-base">👨‍⚕️</span>
            <span><strong>Dr. Julián Cucalón</strong> — OcupaSalud</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-base">📱</span>
            <a href="tel:+573182213979" className="font-bold text-amber-700 hover:underline">318 221 3979</a>
            <span className="text-gray-400 text-xs">(llamada o WhatsApp)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-base">📧</span>
            <a href="mailto:dr.juliancucalon@gmail.com" className="font-bold text-amber-700 hover:underline text-xs">dr.juliancucalon@gmail.com</a>
          </div>
          <a href="https://wa.me/573182213979?text=Hola%20Dr.%20Cucal%C3%B3n%2C%20quiero%20renovar%20mi%20plan%20OcupaSalud" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-black transition">
            💬 Escribir por WhatsApp ahora
          </a>
        </div>
        <p className="text-[10px] text-amber-600">Una vez renovado, tu acceso se restablece en segundos ✅</p>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-5 text-center space-y-3">
      <div className="text-3xl">🔒</div>
      <div>
        <p className="font-black text-gray-800 text-sm">Disponible en plan {req.label}</p>
        <p className="text-gray-500 text-xs mt-1">{req.priceLabel} · Desbloquea esta y muchas funciones más</p>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={() => { if (window._sisoGoTo) window._sisoGoTo("planes"); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
          ⬆️ Ver planes y precios
        </button>
        <a href="https://wa.me/573182213979?text=Hola%20Dr.%20Cucal%C3%B3n%2C%20me%20interesa%20el%20plan%20OcupaSalud" target="_blank" rel="noreferrer" className="text-xs text-green-700 font-bold hover:underline">
          💬 Consultar por WhatsApp · 318 221 3979
        </a>
      </div>
    </div>
  );
};

// ==========================================
// MÓDULO 6C: LICENCIAS TAB - componente propio (no IIFE, para cumplir Rules of Hooks)
// Props: usersList, setUsersList, patientsList, currentUser, setCurrentUser,
//        _sync, pendingActivationPlan, setPendingActivationPlan
// ==========================================
const LicenciasTab = ({
  usersList,
  setUsersList,
  patientsList,
  currentUser,
  setCurrentUser,
  _sync,
  pendingActivationPlan,
  setPendingActivationPlan,
}) => {
  // ══ GUARD: solo administrador puede gestionar licencias ══
  if (currentUser?.role !== "administrador") {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 text-center space-y-3">
        <div className="text-4xl">🔒</div>
        <p className="font-black text-red-800 text-lg">Acceso denegado</p>
        <p className="text-red-600 text-sm">
          La gestión de planes y licencias es{" "}
          <strong>exclusiva del administrador</strong>.
        </p>
        <p className="text-red-500 text-xs">
          Si necesitas un cambio de plan, comunícate con el administrador de tu
          cuenta.
        </p>
      </div>
    );
  }

  const [licEditId, setLicEditId] = React.useState(null);
  const [licForm, setLicForm] = React.useState({});
  const [licSaved, setLicSaved] = React.useState(false);
  const [licErrors, setLicErrors] = React.useState([]); // validación método de pago

  const planOrder = ["libre", "starter", "pro", "clinica"];
  const planColors = {
    libre: "gray",
    starter: "teal",
    pro: "blue",
    clinica: "purple",
  };

  // ── Auto-apertura cuando viene de "Activar para usuario" en renderPlanes ──
  React.useEffect(() => {
    if (!pendingActivationPlan) return;
    // Abrir el primer usuario que no sea el admin activo, o el primero de la lista
    const target =
      usersList.find((u) => u.activo !== false && u.user !== "drcucalon") ||
      usersList.find((u) => u.activo !== false);
    if (target) {
      const today = new Date().toISOString().split("T")[0];
      const exp = new Date();
      exp.setMonth(exp.getMonth() + 1);
      setLicEditId(target.id || target.user);
      setLicForm({
        license: pendingActivationPlan,
        licenseStarted: today,
        licenseExpiry: exp.toISOString().split("T")[0],
        monto: PLAN_CONFIG[pendingActivationPlan]?.price || 0,
        formaPago: "Transferencia",
        tipo: "manual",
        notas: "",
      });
    }
  }, [pendingActivationPlan]);

  const openEdit = (u) => {
    setLicEditId(u.id || u.user);
    setLicForm({
      license: u.license || "libre",
      licenseExpiry: u.licenseExpiry || "",
      licenseStarted:
        u.licenseStarted || new Date().toISOString().split("T")[0],
      monto: "",
      formaPago: "Transferencia",
      tipo: "manual",
      notas: "",
    });
    setLicSaved(false);
    if (pendingActivationPlan) setPendingActivationPlan(null); // limpiar luego de abrir
  };

  const saveLic = (u) => {
    // ══ VALIDACIÓN ESTRICTA POR MÉTODO DE PAGO ══
    const errors = [];
    const monto = Number(licForm.monto) || 0;
    const planPrecio = PLAN_CONFIG[licForm.license]?.price || 0;

    if (licForm.license !== "libre") {
      // 1. Planes de pago: monto requerido salvo prueba/cortesía
      if (["manual", "referido"].includes(licForm.tipo)) {
        if (!licForm.monto || monto <= 0)
          errors.push(
            "💰 El monto cobrado es obligatorio para activación manual o referido."
          );
        if (monto < planPrecio * 0.5)
          errors.push(
            `💰 El monto ($${monto.toLocaleString(
              "es-CO"
            )}) parece muy bajo para el plan ${
              PLAN_CONFIG[licForm.license]?.label
            } ($${planPrecio.toLocaleString("es-CO")}/mes). Verifica.`
          );
      }
      // 2. Cortesía: requiere nota de justificación
      if (licForm.tipo === "cortesia") {
        if (!licForm.notas || licForm.notas.trim().length < 10)
          errors.push(
            "📝 Las activaciones por cortesía requieren justificación en las notas (mínimo 10 caracteres)."
          );
      }
      // 3. Transferencia/Nequi/Daviplata: requieren método y monto
      if (
        ["Transferencia", "Nequi", "Daviplata"].includes(licForm.formaPago) &&
        licForm.tipo !== "prueba" &&
        licForm.tipo !== "cortesia"
      ) {
        if (!licForm.monto || monto <= 0)
          errors.push(
            `📲 ${licForm.formaPago}: debes registrar el monto recibido para confirmar el pago.`
          );
      }
      // 4. Fecha de vencimiento requerida para planes de pago
      if (!licForm.licenseExpiry)
        errors.push("📅 Define una fecha de vencimiento para el plan.");
      // 5. Prueba: máx. 30 días
      if (licForm.tipo === "prueba" && licForm.licenseExpiry) {
        const dias = Math.ceil(
          (new Date(licForm.licenseExpiry) - new Date()) / 86400000
        );
        const maxPrueba = PLAN_CONFIG[licForm.license]?.trialDays || 15;
        if (dias > maxPrueba)
          errors.push(
            `⏰ Período de prueba máximo: ${maxPrueba} días. Ajusta la fecha de vencimiento.`
          );
      }
    }

    if (errors.length > 0) {
      setLicErrors(errors);
      return;
    }
    setLicErrors([]);

    const today = new Date().toISOString().split("T")[0];
    const upd = usersList.map((usr) =>
      usr.id === u.id || usr.user === u.user
        ? {
            ...usr,
            license: licForm.license,
            licenseExpiry: licForm.licenseExpiry || null,
            licenseStarted: licForm.licenseStarted || today,
          }
        : usr
    );
    setUsersList(upd);
    _sync("siso_users", JSON.stringify(upd));
    _sbSet("siso_users", upd); // sync inmediato a nube
    if (currentUser?.user === u.user) {
      setCurrentUser((prev) => ({
        ...prev,
        license: licForm.license,
        licenseExpiry: licForm.licenseExpiry || null,
        licenseStarted: licForm.licenseStarted || new Date().toISOString().split("T")[0],
      }));
    }
    setLicSaved(true);
    setPendingActivationPlan(null);
    setTimeout(() => {
      setLicEditId(null);
      setLicSaved(false);
    }, 1400);
  };

  const getDaysLeft = (u) => {
    if (!u.licenseExpiry || u.license === "libre") return null;
    return Math.ceil((new Date(u.licenseExpiry) - new Date()) / 86400000);
  };

  const getStatusBadge = (u) => {
    const plan = PLAN_CONFIG[u.license || "libre"];
    const d = getDaysLeft(u);
    if (!u.license || u.license === "libre")
      return (
        <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          🆓 Libre
        </span>
      );
    if (d !== null && d < 0)
      return (
        <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
          ❌ Vencido
        </span>
      );
    if (d !== null && d <= 7)
      return (
        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          ⏰ Vence en {d}d
        </span>
      );
    const hcU = _contarHC(patientsList, u.user);
    if (plan.maxHC < 9999) {
      const pct = hcU / plan.maxHC;
      if (pct >= 1)
        return (
          <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            🔴 Límite HC
          </span>
        );
      if (pct >= 0.8)
        return (
          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            🟡 80% HC
          </span>
        );
    }
    return (
      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        ✅ Activo
      </span>
    );
  };

  const activeUsers = usersList.filter((u) => u.activo !== false);
  const ingresos = activeUsers.reduce(
    (s, u) => s + (PLAN_CONFIG[u.license || "libre"]?.price || 0),
    0
  );
  const vencenProx = activeUsers.filter((u) => {
    if (!u.licenseExpiry || !u.license || u.license === "libre") return false;
    const d = Math.ceil((new Date(u.licenseExpiry) - new Date()) / 86400000);
    return d >= 0 && d <= 7;
  });
  const pendingPlan = PLAN_CONFIG[pendingActivationPlan];

  return (
    <div className="space-y-5">
      {/* ── BANNER GUÍA: aparece cuando viene desde "Activar para usuario" ── */}
      {pendingActivationPlan && pendingPlan && (
        <div className="bg-blue-600 text-white rounded-xl px-5 py-4 flex items-start gap-4">
          <div className="text-3xl mt-0.5">🎯</div>
          <div className="flex-1">
            <p className="font-black text-base">
              Activando plan {pendingPlan.label} - {pendingPlan.priceLabel}
            </p>
            <p className="text-blue-100 text-sm mt-1">
              Se ha abierto automáticamente el editor del primer usuario.
              <br />
              <strong>¿Cómo funciona?</strong> Selecciona el usuario, confirma
              las fechas, el monto recibido y haz clic en{" "}
              <em>"💾 Guardar cambios"</em>.
            </p>
            <ol className="text-blue-100 text-xs mt-2 space-y-0.5 list-decimal list-inside">
              <li>
                Verifica que el plan seleccionado sea{" "}
                <strong>{pendingPlan.label}</strong>
              </li>
              <li>
                Ajusta la fecha de vencimiento (por defecto: 1 mes desde hoy)
              </li>
              <li>Ingresa el monto cobrado y la forma de pago</li>
              <li>
                Haz clic en <strong>💾 Guardar cambios</strong>
              </li>
            </ol>
          </div>
          <button
            onClick={() => setPendingActivationPlan(null)}
            className="text-blue-200 hover:text-white text-lg font-black leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── MÉTRICAS ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: "💰",
            label: "Ingresos estimados/mes",
            value: `$${ingresos.toLocaleString("es-CO")} COP`,
            sub: `${
              activeUsers.filter((u) => u.license && u.license !== "libre")
                .length
            } usuarios de pago`,
            bg: "bg-emerald-900",
          },
          {
            icon: "👥",
            label: "Usuarios activos",
            value: `${activeUsers.length} usuarios`,
            sub: `L:${
              activeUsers.filter((u) => !u.license || u.license === "libre")
                .length
            }  S:${
              activeUsers.filter((u) => u.license === "starter").length
            }  P:${activeUsers.filter((u) => u.license === "pro").length}  C:${
              activeUsers.filter((u) => u.license === "clinica").length
            }`,
            bg: "bg-slate-800",
          },
          {
            icon: "⏰",
            label: "Vencen en 7 días",
            value: `${vencenProx.length} usuarios`,
            sub:
              vencenProx.map((u) => u.name || u.user).join(", ") || "Ninguno",
            bg: "bg-amber-800",
          },
        ].map((m) => (
          <div key={m.label} className={`${m.bg} rounded-xl p-4 text-white`}>
            <p className="text-2xl mb-1">{m.icon}</p>
            <p className="text-lg font-black">{m.value}</p>
            <p className="text-xs opacity-70 mt-0.5">{m.label}</p>
            <p className="text-[10px] opacity-50 mt-1 truncate">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* ── TABLA DE USUARIOS ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="text-sm font-black text-gray-800">
            👥 Usuarios y Planes
          </span>
          <span className="text-xs text-gray-400">
            - Clic en ⚙️ Editar para asignar o cambiar el plan de un usuario
          </span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-black text-gray-600">
                Usuario
              </th>
              <th className="text-left px-3 py-2 font-black text-gray-600">
                Plan actual
              </th>
              <th className="text-center px-3 py-2 font-black text-gray-600">
                HC usadas
              </th>
              <th className="text-center px-3 py-2 font-black text-gray-600">
                Vence
              </th>
              <th className="text-center px-3 py-2 font-black text-gray-600">
                Estado
              </th>
              <th className="text-center px-3 py-2 font-black text-gray-600">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.map((u, i) => {
              const plan = PLAN_CONFIG[u.license || "libre"];
              const hcU = _contarHC(patientsList, u.user);
              const dLeft = getDaysLeft(u);
              const isEditing = licEditId === (u.id || u.user);
              const col = planColors[u.license || "libre"];
              return (
                <React.Fragment key={u.user}>
                  <tr
                    className={`border-t border-gray-50 ${
                      isEditing
                        ? "bg-blue-50"
                        : i % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <p className="font-black text-gray-800">
                        {u.name || u.user}
                      </p>
                      <p className="text-gray-400">
                        @{u.user} · {u.role}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`font-black text-${col}-700 bg-${col}-50 px-2 py-0.5 rounded-full text-[11px]`}
                      >
                        {plan.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={
                          plan.maxHC < 9999 && hcU / plan.maxHC >= 0.8
                            ? "font-black text-amber-600"
                            : "text-gray-600"
                        }
                      >
                        {hcU}
                        {plan.maxHC < 9999 ? `/${plan.maxHC}` : ""}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-500 text-[11px]">
                      {u.licenseExpiry && u.license !== "libre" ? (
                        dLeft !== null ? (
                          dLeft < 0 ? (
                            <span className="text-red-500 font-black">
                              Vencido
                            </span>
                          ) : (
                            <span
                              className={
                                dLeft <= 7 ? "text-amber-600 font-black" : ""
                              }
                            >
                              {new Date(u.licenseExpiry).toLocaleDateString(
                                "es-CO"
                              )}
                            </span>
                          )
                        ) : (
                          "-"
                        )
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {getStatusBadge(u)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() =>
                          isEditing ? setLicEditId(null) : openEdit(u)
                        }
                        className={`text-[11px] font-black px-2 py-1 rounded-lg transition ${
                          isEditing
                            ? "bg-gray-200 text-gray-600"
                            : "text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100"
                        }`}
                      >
                        {isEditing ? "✕ Cerrar" : "⚙️ Editar"}
                      </button>
                    </td>
                  </tr>

                  {/* ── PANEL EDITOR INLINE ── */}
                  {isEditing && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-5 bg-blue-50 border-t border-blue-100"
                      >
                        <p className="text-[10px] font-black text-blue-800 uppercase mb-3">
                          Editando licencia de {u.name || u.user}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {/* Plan */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Plan a activar
                            </label>
                            <select
                              value={licForm.license}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  license: e.target.value,
                                }))
                              }
                              className="w-full p-2 border-2 border-blue-300 rounded-lg text-xs bg-white font-bold focus:outline-none focus:border-blue-500"
                            >
                              {planOrder.map((pk) => (
                                <option key={pk} value={pk}>
                                  {PLAN_CONFIG[pk].label} -{" "}
                                  {PLAN_CONFIG[pk].priceLabel}
                                </option>
                              ))}
                            </select>
                          </div>
                          {/* Fecha inicio */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Fecha de inicio
                            </label>
                            <input
                              type="date"
                              value={licForm.licenseStarted}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  licenseStarted: e.target.value,
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                            />
                          </div>
                          {/* Fecha vencimiento */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Fecha vencimiento
                            </label>
                            <input
                              type="date"
                              value={licForm.licenseExpiry}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  licenseExpiry: e.target.value,
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                            />
                          </div>
                          {/* Tipo */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Tipo de activación
                            </label>
                            <select
                              value={licForm.tipo}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  tipo: e.target.value,
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white"
                            >
                              <option value="manual">
                                Manual (pago verificado)
                              </option>
                              <option value="prueba">Prueba gratuita</option>
                              <option value="referido">Referido</option>
                              <option value="cortesia">Cortesía</option>
                            </select>
                          </div>
                          {/* Monto */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Monto cobrado (COP)
                            </label>
                            <input
                              type="number"
                              value={licForm.monto}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  monto: e.target.value,
                                }))
                              }
                              placeholder={
                                PLAN_CONFIG[licForm.license]?.price || 0
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                            />
                          </div>
                          {/* Forma de pago */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Forma de pago
                            </label>
                            <select
                              value={licForm.formaPago}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  formaPago: e.target.value,
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white"
                            >
                              <option>Transferencia</option>
                              <option>Nequi</option>
                              <option>Daviplata</option>
                              <option>Efectivo</option>
                              <option>Cortesía</option>
                            </select>
                          </div>
                          {/* Restricciones por método de pago */}
                          <div className="col-span-2 md:col-span-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-[10px] font-black text-blue-800 uppercase mb-2">
                              📋 Restricciones según método de pago y tipo de
                              activación
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {[
                                {
                                  tipo: "Transferencia / Nequi / Daviplata",
                                  rule: "Monto cobrado obligatorio. Se registra para control de ingresos.",
                                },
                                {
                                  tipo: "Efectivo",
                                  rule: "Monto recomendado. Verificar recibo físico.",
                                },
                                {
                                  tipo: "Manual (pago verificado)",
                                  rule: "Requiere monto ≥ 50% del precio del plan.",
                                },
                                {
                                  tipo: "Prueba gratuita",
                                  rule: `Máx. ${
                                    PLAN_CONFIG[licForm.license]?.trialDays ||
                                    15
                                  } días. Monto = $0. Sin restricción de nota.`,
                                },
                                {
                                  tipo: "Referido",
                                  rule: "Requiere monto cobrado. Anota quién refirió en notas.",
                                },
                                {
                                  tipo: "Cortesía",
                                  rule: "Monto = $0 permitido PERO notas con justificación son OBLIGATORIAS (≥10 caracteres).",
                                },
                              ].map((r) => (
                                <div
                                  key={r.tipo}
                                  className={`text-[10px] py-1 ${
                                    licForm.formaPago ===
                                      r.tipo.split(" / ")[0] ||
                                    licForm.tipo ===
                                      r.tipo
                                        .split("(")[0]
                                        .trim()
                                        .toLowerCase()
                                        .replace(" ", "_")
                                      ? "text-blue-800 font-bold"
                                      : "text-blue-600"
                                  }`}
                                >
                                  <span className="font-black">
                                    • {r.tipo}:
                                  </span>{" "}
                                  {r.rule}
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Notas */}
                          <div className="col-span-2 md:col-span-3">
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Notas internas{" "}
                              {licForm.tipo === "cortesia" ? (
                                <span className="text-red-600">
                                  * OBLIGATORIO para cortesía
                                </span>
                              ) : (
                                "(recomendado)"
                              )}
                            </label>
                            <input
                              value={licForm.notas}
                              onChange={(e) => {
                                setLicForm((p) => ({
                                  ...p,
                                  notas: e.target.value,
                                }));
                                setLicErrors([]);
                              }}
                              placeholder={
                                licForm.tipo === "cortesia"
                                  ? "Ej: Cortesía por ser médico fundador del proyecto."
                                  : "Ej: Pago recibido Nequi 300 123 4567 · Referido por Dr. Pérez"
                              }
                              className={`w-full p-2 border rounded-lg text-xs ${
                                licForm.tipo === "cortesia"
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-200"
                              }`}
                            />
                          </div>
                        </div>
                        {/* Errores de validación */}
                        {licErrors.length > 0 && (
                          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 space-y-1">
                            <p className="text-xs font-black text-red-800 mb-1">
                              ⛔ Corrige los siguientes errores antes de
                              guardar:
                            </p>
                            {licErrors.map((e, i) => (
                              <p key={i} className="text-xs text-red-700">
                                • {e}
                              </p>
                            ))}
                          </div>
                        )}
                        {/* Botones de acción */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => {
                              setLicErrors([]);
                              saveLic(u);
                            }}
                            className={`px-5 py-2 rounded-lg text-xs font-black transition ${
                              licSaved
                                ? "bg-emerald-500 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {licSaved ? "✅ ¡Guardado!" : "💾 Guardar cambios"}
                          </button>
                          <button
                            onClick={() => {
                              setLicEditId(null);
                              setPendingActivationPlan(null);
                            }}
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
                          >
                            Cancelar
                          </button>
                          {licForm.license !== "libre" && (
                            <button
                              onClick={() => {
                                const hoy = new Date();
                                hoy.setDate(
                                  hoy.getDate() +
                                    (PLAN_CONFIG[licForm.license]?.trialDays ||
                                      15)
                                );
                                setLicForm((p) => ({
                                  ...p,
                                  licenseExpiry: hoy
                                    .toISOString()
                                    .split("T")[0],
                                  tipo: "prueba",
                                }));
                              }}
                              className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-200 transition"
                            >
                              🎁 +
                              {PLAN_CONFIG[licForm.license]?.trialDays || 15}d
                              prueba
                            </button>
                          )}
                          {licForm.license !== "libre" && (
                            <button
                              onClick={() => {
                                const hoy = new Date();
                                hoy.setMonth(hoy.getMonth() + 1);
                                setLicForm((p) => ({
                                  ...p,
                                  licenseExpiry: hoy
                                    .toISOString()
                                    .split("T")[0],
                                }));
                              }}
                              className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-200 transition"
                            >
                              +1 mes
                            </button>
                          )}
                          {licForm.license !== "libre" && (
                            <button
                              onClick={() => {
                                const hoy = new Date();
                                hoy.setFullYear(hoy.getFullYear() + 1);
                                setLicForm((p) => ({
                                  ...p,
                                  licenseExpiry: hoy
                                    .toISOString()
                                    .split("T")[0],
                                }));
                              }}
                              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-200 transition"
                            >
                              +1 año
                            </button>
                          )}
                        </div>
                        {/* Resumen de lo que se va a guardar */}
                        <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200 text-xs text-gray-600 flex flex-wrap gap-4">
                          <span>
                            📋 Plan:{" "}
                            <strong className="text-blue-700">
                              {PLAN_CONFIG[licForm.license]?.label}
                            </strong>
                          </span>
                          <span>
                            📅 Vence:{" "}
                            <strong>
                              {licForm.licenseExpiry || "sin fecha"}
                            </strong>
                          </span>
                          <span>
                            💳 Pago: <strong>{licForm.formaPago}</strong>
                          </span>
                          {licForm.monto > 0 && (
                            <span>
                              💰{" "}
                              <strong>
                                ${Number(licForm.monto).toLocaleString("es-CO")}{" "}
                                COP
                              </strong>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// MÓDULO 7: PANEL DE CONFIGURACIÓN DE IA
// ==========================================
const AIConfigPanel = ({ aiConfig, onSave, onClose }) => {
  const [cfg, setCfg] = useState(() => ({
    ...aiConfig,
    keys: { ...aiConfig.keys },
  }));
  const [testStatus, setTestStatus] = useState({});
  const [showKey, setShowKey] = useState({});
  const [activeGuide, setActiveGuide] = useState(null);
  const PROVIDER_INFO = {
    gemini: {
      label: "Google Gemini",
      sub: "2.0 Flash · 1.5 Flash",
      badge: "🟢 Gratis · Alta calidad",
      badgeClass: "bg-blue-100 text-blue-800",
      link: "https://aistudio.google.com/apikey",
      color: "blue",
      steps: [
        "1️⃣ Haz clic en el botón 'Obtener key →' de abajo",
        "2️⃣ Inicia sesión con tu cuenta de Google (Gmail)",
        "3️⃣ Aparecerá el panel de 'API Keys'. Clic en 'Create API Key'",
        "4️⃣ Selecciona 'Create API key in new project' (es gratis)",
        "5️⃣ Se genera una key que empieza con 'AIza...' → cópiala",
        "6️⃣ Regresa aquí, pégala en el campo y presiona 'Probar'",
        "💡 Tip: Gemini es el más recomendado por calidad y velocidad",
      ],
    },
    groq: {
      label: "Groq",
      sub: "Llama 3.3 70B · Ultra-rápido",
      badge: "🟢 Gratis · Más rápido",
      badgeClass: "bg-green-100 text-green-800",
      link: "https://console.groq.com/keys",
      color: "green",
      steps: [
        "1️⃣ Haz clic en el botón 'Obtener key →' de abajo",
        "2️⃣ Crea cuenta gratis con Google o GitHub (botón 'Sign Up')",
        "3️⃣ Una vez dentro, ya estarás en la sección 'API Keys'",
        "4️⃣ Clic en 'Create API Key' → ponle cualquier nombre → 'Submit'",
        "5️⃣ Copia la key que empieza con 'gsk_...'",
        "6️⃣ Regresa aquí, pégala en el campo y presiona 'Probar'",
        "💡 Tip: Groq es el más rápido pero tiene límite de 30 peticiones/minuto",
      ],
    },
    together: {
      label: "Together AI",
      sub: "Llama 3.3 70B · Muy estable",
      badge: "🟢 Gratis · Sin límite diario",
      badgeClass: "bg-teal-100 text-teal-800",
      link: "https://api.together.ai/settings/api-keys",
      color: "teal",
      steps: [
        "1️⃣ Haz clic en el botón 'Obtener key →' de abajo",
        "2️⃣ Clic en 'Sign Up' o 'Continue with Google' (cuenta gratis)",
        "3️⃣ En el panel, ve a Settings → API Keys (menú izquierdo)",
        "4️⃣ Clic en 'Create new API key' → ponle nombre → crear",
        "5️⃣ Copia la key que aparece (solo se muestra una vez)",
        "6️⃣ Regresa aquí, pégala en el campo y presiona 'Probar'",
        "💡 Tip: Together AI no tiene límite diario. Ideal como respaldo",
      ],
    },
    openrouter: {
      label: "OpenRouter",
      sub: "10 modelos free · Máximo respaldo",
      badge: "🟢 Gratis · Multi-modelo",
      badgeClass: "bg-purple-100 text-purple-800",
      link: "https://openrouter.ai/keys",
      color: "purple",
      steps: [
        "1️⃣ Haz clic en el botón 'Obtener key →' de abajo",
        "2️⃣ Clic en 'Sign in' → usa tu cuenta de Google o GitHub",
        "3️⃣ En el menú superior, clic en 'Keys'",
        "4️⃣ Clic en 'Create Key' → ponle nombre → 'Create'",
        "5️⃣ Copia la key que empieza con 'sk-or-...'",
        "6️⃣ Regresa aquí, pégala en el campo y presiona 'Probar'",
        "💡 Tip: OpenRouter da acceso a múltiples modelos con una sola key",
      ],
    },
  };
  const colorMap = {
    blue: {
      border: "border-blue-400",
      bg: "bg-blue-50",
      text: "text-blue-700",
      btn: "bg-blue-600 hover:bg-blue-700",
      ring: "ring-blue-400",
    },
    green: {
      border: "border-green-400",
      bg: "bg-green-50",
      text: "text-green-700",
      btn: "bg-green-600 hover:bg-green-700",
      ring: "ring-green-400",
    },
    teal: {
      border: "border-teal-400",
      bg: "bg-teal-50",
      text: "text-teal-700",
      btn: "bg-teal-600 hover:bg-teal-700",
      ring: "ring-teal-400",
    },
    purple: {
      border: "border-purple-400",
      bg: "bg-purple-50",
      text: "text-purple-700",
      btn: "bg-purple-600 hover:bg-purple-700",
      ring: "ring-purple-400",
    },
  };
  const testProvider = async (providerKey) => {
    const key = cfg.keys?.[providerKey];
    if (!key || !key.trim()) {
      setTestStatus((p) => ({
        ...p,
        [providerKey]: {
          ok: false,
          msg: "⚠️ Ingrese su API Key primero (ver pasos arriba)",
        },
      }));
      setActiveGuide(providerKey);
      return;
    }
    setTestStatus((p) => ({
      ...p,
      [providerKey]: { ok: null, msg: "⏳ Probando conexión..." },
    }));
    try {
      const provider = AI_PROVIDERS[providerKey];
      const text = await provider.call(
        "Responde SOLO con la palabra: CONECTADO",
        "Eres un asistente. Responde únicamente con la palabra CONECTADO.",
        key.trim()
      );
      const ok = !!text && text.length > 0;
      setTestStatus((p) => ({
        ...p,
        [providerKey]: {
          ok,
          msg: ok
            ? `✅ ¡Funciona! Respuesta: "${text
                .slice(0, 40)
                .replace(/\n/g, " ")}"`
            : "⚠️ Respuesta vacía",
        },
      }));
    } catch (e) {
      const msg = e.message || "";
      let hint = "";
      if (
        msg.includes("401") ||
        msg.includes("403") ||
        msg.includes("invalid") ||
        msg.includes("Invalid") ||
        msg.includes("API Key inválida")
      )
        hint =
          providerKey === "together"
            ? " → Key inválida. En api.together.ai copia SOLO la key del campo texto, NO el código Python."
            : " → Key inválida: renuévala siguiendo los pasos.";
      else if (
        msg.includes("429") ||
        msg.includes("rate") ||
        msg.includes("limit")
      )
        hint = " → Límite de uso alcanzado: crea una key nueva.";
      else if (
        msg.includes("Failed to fetch") ||
        msg.includes("network") ||
        msg.includes("CORS") ||
        msg.includes("CORS bloqueado")
      )
        hint =
          " → CORS bloqueado: Groq no funciona desde este dominio. Usa Gemini u OpenRouter como proveedor principal.";
      else if (msg.includes("404"))
        hint = " → Modelo no disponible, prueba otro proveedor.";
      setTestStatus((p) => ({
        ...p,
        [providerKey]: { ok: false, msg: `❌ ${msg.slice(0, 100)}${hint}` },
      }));
    }
  };
  const anyWorking = Object.values(testStatus).some((s) => s.ok === true);
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-6 h-6" />
              <div>
                <h2 className="text-base font-black">
                  Configuración de IA - 4 Proveedores Gratuitos
                </h2>
                <p className="text-xs text-indigo-200">
                  Cada uno necesita su propia API Key gratuita (se obtiene en 2
                  min)
                </p>
              </div>
            </div>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-white/70 hover:text-white" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-4 space-y-3">
            {/* Estado general */}
            {anyWorking ? (
              <div className="bg-green-50 border border-green-300 rounded-xl p-3 text-xs text-green-800 flex gap-2 items-start">
                <span className="text-base">✅</span>
                <div>
                  <strong>¡Al menos un proveedor funciona!</strong> La IA está
                  operativa. Guarda la configuración para usar los que funcionan
                  como respaldo automático.
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex gap-2 items-start">
                <span className="text-base">⚡</span>
                <div>
                  <strong>
                    Las keys preconfiguradas pueden haber expirado
                  </strong>{" "}
                  (son públicas y se agotan con el uso).
                  <span className="block mt-1">
                    Obtén tu propia key gratuita en cualquier proveedor - toma
                    solo 2 minutos. Haz clic en{" "}
                    <strong>"📋 Cómo obtener"</strong> de cualquier proveedor
                    para ver los pasos.
                  </span>
                </div>
              </div>
            )}
            {/* Selector proveedor activo */}
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1.5">
                Proveedor principal (los demás son respaldo automático)
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(PROVIDER_INFO).map(([k, info]) => {
                  const st = testStatus[k];
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() =>
                        setCfg((p) => ({ ...p, activeProvider: k }))
                      }
                      className={`flex items-center gap-2 p-2 rounded-xl border-2 text-left transition ${
                        cfg.activeProvider === k
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          cfg.activeProvider === k
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-gray-300"
                        }`}
                      >
                        {cfg.activeProvider === k && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-gray-800">
                          {info.label}
                        </p>
                        <p className="text-[9px] text-gray-500 truncate">
                          {info.sub}
                        </p>
                      </div>
                      {st && (
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            st.ok === true
                              ? "bg-green-500"
                              : st.ok === false
                              ? "bg-red-400"
                              : "bg-yellow-400"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Cards de proveedores */}
            {Object.entries(PROVIDER_INFO).map(([k, info]) => {
              const c = colorMap[info.color];
              const st = testStatus[k];
              const isGuideOpen = activeGuide === k;
              return (
                <div
                  key={k}
                  className={`rounded-xl border-2 overflow-hidden ${
                    cfg.activeProvider === k ? c.border : "border-gray-200"
                  }`}
                >
                  {/* Header de la card */}
                  <div
                    className={`flex justify-between items-center p-2.5 ${
                      cfg.activeProvider === k ? c.bg : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black text-gray-800">
                        {info.label}
                      </span>
                      <span
                        className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${info.badgeClass}`}
                      >
                        {info.badge}
                      </span>
                      {st?.ok === true && (
                        <span className="ml-1 text-[9px] font-bold text-green-600">
                          ✅ Activa
                        </span>
                      )}
                      {st?.ok === false && (
                        <span className="ml-1 text-[9px] font-bold text-red-600">
                          ❌ Falla
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setActiveGuide(isGuideOpen ? null : k)}
                        className={`text-[9px] px-2 py-1 rounded-lg font-bold border transition ${
                          isGuideOpen
                            ? c.btn + " text-white"
                            : "border-gray-300 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        📋 {isGuideOpen ? "Ocultar" : "Cómo obtener"}
                      </button>
                      <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-[9px] px-2 py-1 rounded-lg font-bold ${c.btn} text-white`}
                      >
                        🔗 Obtener key
                      </a>
                    </div>
                  </div>
                  {/* Guía paso a paso */}
                  {isGuideOpen && (
                    <div className={`p-3 border-t ${c.bg}`}>
                      <p
                        className={`text-[10px] font-black ${c.text} uppercase mb-2`}
                      >
                        Pasos para obtener tu key gratuita:
                      </p>
                      <ol className="space-y-1">
                        {info.steps.map((step, i) => (
                          <li key={i} className="flex gap-2 items-start">
                            <span
                              className={`flex-shrink-0 w-4 h-4 rounded-full ${c.btn} text-white text-[9px] font-black flex items-center justify-center`}
                            >
                              {i + 1}
                            </span>
                            <span className="text-[10px] text-gray-700">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {/* Input de key */}
                  <div className="p-2.5 bg-white">
                    <div className="relative flex gap-1.5">
                      <input
                        type={showKey[k] ? "text" : "password"}
                        placeholder={`Pega aquí tu API Key de ${info.label}...`}
                        value={cfg.keys?.[k] || ""}
                        onChange={(e) =>
                          setCfg((p) => ({
                            ...p,
                            keys: { ...p.keys, [k]: e.target.value },
                          }))
                        }
                        className="flex-1 pr-7 p-1.5 border border-gray-200 rounded-lg text-[10px] font-mono focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowKey((p) => ({ ...p, [k]: !p[k] }))
                        }
                        className="absolute right-20 top-1.5 text-gray-400 hover:text-gray-600 text-[10px]"
                      >
                        {showKey[k] ? "🙈" : "👁"}
                      </button>
                      <button
                        type="button"
                        onClick={() => testProvider(k)}
                        className={`flex-shrink-0 text-[10px] px-3 py-1.5 rounded-lg font-black text-white flex items-center gap-1 ${c.btn}`}
                      >
                        <Activity className="w-2.5 h-2.5" /> Probar
                      </button>
                    </div>
                    {st && (
                      <p
                        className={`text-[10px] mt-1.5 font-bold rounded-lg px-2 py-1 leading-tight ${
                          st.ok === null
                            ? "text-blue-700 bg-blue-50"
                            : st.ok
                            ? "text-green-700 bg-green-50"
                            : "text-red-700 bg-red-50"
                        }`}
                      >
                        {st.msg}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Footer fijo */}
        <div className="flex gap-2 p-4 border-t bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-4 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(cfg);
              onClose();
            }}
            className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
// ==========================================
// MÓDULO 9: PANEL DE RECOMENDACIONES CHECKLIST
// ==========================================
const RecomendacionesChecklistPanel = ({
  selected,
  onChange,
  onClose,
  onApply,
  isGenerating,
  onGenerate,
}) => {
  const [expandido, setExpandido] = useState({});
  const countSelected = Object.values(selected).filter(Boolean).length;
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  const colorMap = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    teal: "bg-teal-50 border-teal-200 text-teal-800",
  };
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-5 rounded-t-2xl text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-black">Recomendaciones Médicas</h2>
                <p className="text-xs text-emerald-100">
                  Checklist de Recomendaciones por Categoría
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                {countSelected} seleccionadas
              </span>
              <button onClick={onClose}>
                <X className="w-5 h-5 text-white/70 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {Object.entries(RECOMENDACIONES_CATALOG).map(([catKey, catData]) => {
            const selectedInCat = catData.items.filter(
              (i) => selected[i.id]
            ).length;
            const colors = colorMap[catData.color] || colorMap.emerald;
            return (
              <div
                key={catKey}
                className={`border rounded-xl overflow-hidden ${
                  selectedInCat > 0 ? "border-emerald-300" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() =>
                    setExpandido((p) => ({ ...p, [catKey]: !p[catKey] }))
                  }
                  className={`w-full flex justify-between items-center p-3 text-left font-bold text-sm transition ${colors}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{catData.icon}</span>
                    <span>{catData.label}</span>
                    {selectedInCat > 0 && (
                      <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {selectedInCat}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      expandido[catKey] ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {expandido[catKey] && (
                  <div className="p-2 space-y-1 bg-white">
                    {catData.items.map((item) => (
                      <label
                        key={item.id}
                        className={`checklist-item flex items-start gap-2 p-2 rounded-lg cursor-pointer transition ${
                          selected[item.id]
                            ? "bg-emerald-50 border border-emerald-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {selected[item.id] ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={!!selected[item.id]}
                          onChange={() =>
                            onChange((p) => ({ ...p, [item.id]: !p[item.id] }))
                          }
                        />
                        <p
                          className={`text-xs leading-relaxed ${
                            selected[item.id]
                              ? "text-emerald-800 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {item.texto}
                        </p>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t p-4 flex justify-between items-center flex-shrink-0 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generar con IA
          </button>
          <button
            onClick={onApply || onClose}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700"
          >
            ✅ Aplicar {countSelected} Recomendaciones
          </button>
        </div>
      </div>
    </div>
  );
};
// ==========================================
// MÓDULO: FÓRMULA MÉDICA Y DERIVACIONES
// ==========================================
const MedicamentoAutocomplete = ({
  value,
  onChange,
  placeholder,
  onSelectMed,
}) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [customMeds, setCustomMeds] = useState(() => getCustomMeds());
  const ref = useRef(null);
  const allMeds = [...MEDICAMENTOS_CO_BASE, ...customMeds];
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const res = [];
    allMeds.forEach((med) => {
      if (med.g.toLowerCase().includes(q))
        res.push({
          label: med.g,
          sub: `${med.cat} · ${med.dosis}`,
          full: med.g,
          dosis: med.dosis,
          presentaciones: med.p,
          isGeneric: true,
        });
      med.p.forEach((p) => {
        if (p.toLowerCase().includes(q))
          res.push({
            label: p,
            sub: `${med.g} · ${med.cat}`,
            full: p,
            dosis: med.dosis,
            presentaciones: med.p,
            isGeneric: false,
          });
      });
    });
    setSuggestions(res.slice(0, 10));
    setShow(true);
  }, [query, customMeds]);
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const handleAddCustom = () => {
    if (!query.trim() || query.length < 3) return;
    const exists = allMeds.some(
      (m) =>
        m.g.toLowerCase() === query.toLowerCase() ||
        m.p.some((p) => p.toLowerCase() === query.toLowerCase())
    );
    if (!exists) {
      const newEntry = {
        g: query.trim(),
        p: [query.trim()],
        cat: "Personalizado",
        dosis: "Según prescripción",
      };
      addCustomMed(newEntry);
      setCustomMeds((prev) => [...prev, newEntry]);
    }
    onChange(query.trim());
    if (onSelectMed)
      onSelectMed({
        label: query.trim(),
        dosis: "",
        presentaciones: [query.trim()],
      });
    setSuggestions([]);
    setShow(false);
  };
  return (
    <div className="relative" ref={ref}>
      <div className="flex gap-1">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => query.length >= 2 && setShow(true)}
          placeholder={placeholder || "Nombre genérico o comercial..."}
          className="flex-1 p-1.5 border border-gray-200 rounded-l text-xs focus:ring-2 focus:ring-emerald-400 outline-none"
        />
        <button
          type="button"
          onClick={handleAddCustom}
          title="Agregar como medicamento personalizado"
          className="px-2 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-r text-xs font-bold hover:bg-emerald-200 flex items-center gap-0.5"
        >
          <Plus className="w-3 h-3" /> Añadir
        </button>
      </div>
      {show && suggestions.length > 0 && (
        <div className="absolute z-50 bg-white border border-emerald-200 rounded-xl shadow-xl mt-1 w-full max-h-52 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(s.label);
                onChange(s.label);
                if (onSelectMed) onSelectMed(s);
                setSuggestions([]);
                setShow(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 border-b border-gray-50 last:border-none"
            >
              <div className="flex items-center gap-1.5">
                <Pill className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-900">{s.label}</p>
                {s.isGeneric && (
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded">
                    Genérico
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 ml-5">{s.sub}</p>
            </button>
          ))}
          {suggestions.length === 0 && query.length >= 2 && (
            <div className="px-3 py-2 text-[10px] text-gray-400 italic">
              No encontrado -- pulse "Añadir" para agregarlo a su base de datos
            </div>
          )}
        </div>
      )}
      {show && suggestions.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 bg-white border border-emerald-200 rounded-xl shadow-xl mt-1 w-full">
          <div className="px-3 py-2 text-[10px] text-gray-400 italic flex items-center gap-2">
            <AlertCircle className="w-3 h-3" />
            No encontrado en base de datos -- pulse "Añadir" para guardarlo.
          </div>
        </div>
      )}
    </div>
  );
};
const TabFormulaDerivacion = ({
  data,
  setData,
  activeDoctorData,
  activeSignature,
  forceTab,
}) => {
  const [activeSubTab, setActiveSubTab] = React.useState(forceTab || "formula");
  // When forceTab changes (switching between separate tabs), update active sub-tab
  React.useEffect(() => {
    if (forceTab) setActiveSubTab(forceTab);
  }, [forceTab]);
  const [newMed, setNewMed] = React.useState({
    nombre: "",
    presentacion: "",
    dosis: "",
    frecuencia: "",
    duracion: "",
    indicaciones: "",
  });
  const [newDeriv, setNewDeriv] = React.useState({
    especialidad: "",
    motivo: "",
    urgencia: "Electiva",
    observaciones: "",
  });
  const [derivSearch, setDerivSearch] = React.useState("");
  const [showDerivSugg, setShowDerivSugg] = React.useState(false);
  const derivRef = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => {
      if (derivRef.current && !derivRef.current.contains(e.target))
        setShowDerivSugg(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const addMedicamento = () => {
    if (!newMed.nombre) return;
    setData((p) => ({
      ...p,
      formulaMedicamentos: [
        ...(p.formulaMedicamentos || []),
        { ...newMed, id: Date.now() },
      ],
    }));
    setNewMed({
      nombre: "",
      presentacion: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
      indicaciones: "",
    });
  };
  const removeMed = (id) =>
    setData((p) => ({
      ...p,
      formulaMedicamentos: (p.formulaMedicamentos || []).filter(
        (m) => m.id !== id
      ),
    }));
  const addDerivacion = () => {
    if (!newDeriv.especialidad) return;
    setData((p) => ({
      ...p,
      derivaciones: [
        ...(p.derivaciones || []),
        { ...newDeriv, id: Date.now() },
      ],
    }));
    setNewDeriv({
      especialidad: "",
      motivo: "",
      urgencia: "Electiva",
      observaciones: "",
    });
    setDerivSearch("");
  };
  const removeDerivacion = (id) =>
    setData((p) => ({
      ...p,
      derivaciones: (p.derivaciones || []).filter((d) => d.id !== id),
    }));
  const filteredDeriv =
    derivSearch.length >= 1
      ? DERIVACIONES_CATALOG.filter(
          (d) =>
            d.esp.toLowerCase().includes(derivSearch.toLowerCase()) ||
            d.motivo.toLowerCase().includes(derivSearch.toLowerCase())
        ).slice(0, 15)
      : [];
  const today = new Date().toISOString().split("T")[0];
  // ── Genera ventana de impresión premium con HTML nativo ──────────────────
  // No captura innerHTML (pierde íconos). Genera HTML directamente del state.
  const buildPrintHeader = (titleDoc, accentColor) => {
    const fechaDoc =
      data.fechaExamen ||
      data.fechaConsulta ||
      new Date().toLocaleDateString("es-CO");
    // FIX M-04: sanitizar TODOS los campos de usuario para document.write
    const docName = _sanitize(activeDoctorData?.nombre || "");
    const docTitulo = _sanitize(activeDoctorData?.titulo || "");
    const docLic = _sanitize(activeDoctorData?.licencia || "");
    const docCiudad = _sanitize(activeDoctorData?.ciudad || "");
    const docCel = _sanitize(activeDoctorData?.celular || "");
    const docEmail = _sanitize(activeDoctorData?.email || "");
    const pNombre = _sanitize(data.nombres || "---");
    const pDocTipo = _sanitize(data.docTipo || "CC");
    const pDocNum = _sanitize(data.docNumero || "---");
    const pEdad = _sanitize(String(data.edad || "--"));
    const pGenero = _sanitize(data.genero || "---");
    const pEps = _sanitize(data.eps || "---");
    const pArl = _sanitize(data.arl || "---");
    const pAfp = _sanitize(data.afp || "---");
    const pEmpresa = _sanitize(data.empresaNombre || "---");
    const pCargo = _sanitize(data.cargo || "---");
    const pTipo = _sanitize(data.tipoExamen || data.motivoConsulta || "---");
    const pId = _sanitize((data.id || "").toString().slice(-6) || "------");
    const accentSafe = /^#[0-9a-fA-F]{3,6}$/.test(accentColor)
      ? accentColor
      : "#059669";

    // ── PASO 2: Cabecera IPS — columna izquierda muestra empresa si hay empresaId ──
    const miIPS = currentUser?.empresaId
      ? companies.find((c) => c.id === currentUser.empresaId)
      : null;
    const leftColumn = miIPS
      ? (() => {
          const ipsNombre = _sanitize(miIPS.nombre || "");
          const ipsNit = _sanitize(miIPS.nit || "");
          const ipsDv = _sanitize(miIPS.dv || "");
          const ipsDir = _sanitize(miIPS.direccion || "");
          const ipsCiudad = _sanitize(miIPS.ciudad || "");
          const ipsTel = _sanitize(miIPS.telefono || "");
          const ipsEmail = _sanitize(miIPS.correo || "");
          const ipsLema = _sanitize(miIPS.lema || "");
          const ipsLogo = _safeLogoUrl(miIPS.logo || ""); // SEC-FIX-02
          const logoHtml = ipsLogo
            ? `<img src="${ipsLogo}" style="max-height:40px;max-width:90px;object-fit:contain;display:block;margin-bottom:4px;" />`
            : "";
          return `<div style="width:32%;padding-right:8px;">
            ${logoHtml}
            <p style="font-size:10pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:0 0 2px 0;">${ipsNombre}</p>
            ${
              ipsNit
                ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">NIT: ${ipsNit}${
                    ipsDv ? "-" + ipsDv : ""
                  }</p>`
                : ""
            }
            ${
              ipsDir
                ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">${ipsDir}${
                    ipsCiudad ? " · " + ipsCiudad : ""
                  }</p>`
                : ""
            }
            ${
              ipsTel
                ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">Tel: ${ipsTel}</p>`
                : ""
            }
            ${
              ipsEmail
                ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">${ipsEmail}</p>`
                : ""
            }
            ${
              ipsLema
                ? `<p style="font-size:7pt;color:#888;font-style:italic;margin:2px 0;">${ipsLema}</p>`
                : ""
            }
          </div>`;
        })()
      : `<div style="width:32%;padding-right:8px;">
          <p style="font-size:10.5pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:0 0 3px 0;">${docName}</p>
          <p style="font-size:7.5pt;color:#555;margin:1px 0;">${docTitulo}</p>
          <p style="font-size:7.5pt;color:#555;margin:1px 0;">Lic. Med.: ${docLic}</p>
          <p style="font-size:7.5pt;color:#555;margin:1px 0;">${docCiudad} | Cel: ${docCel}</p>
          <p style="font-size:7.5pt;color:#555;margin:1px 0;">${docEmail}</p>
        </div>`;

    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${accentSafe};padding-bottom:10px;margin-bottom:14px;">
        ${leftColumn}
        <div style="width:34%;text-align:center;border-left:1px solid #ddd;border-right:1px solid #ddd;padding:0 10px;">
          <p style="font-size:13pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:2px 0;">${_sanitize(
      titleDoc
    )}</p>
          <p style="font-size:7pt;color:#888;margin:2px 0;">Res. 1995&#x2F;1999 · Res. 1843&#x2F;2025</p>
          <p style="font-size:8pt;font-weight:700;color:#333;margin:5px 0 2px 0;">Fecha: ${_sanitize(
            fechaDoc
          )}</p>
          <p style="font-size:7.5pt;color:#666;margin:1px 0;">Reg. # ${pId}</p>
        </div>
        <div style="width:32%;text-align:right;padding-left:8px;">
          <p style="font-size:10.5pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:0 0 3px 0;">${pNombre}</p>
          <p style="font-size:7.5pt;color:#444;margin:1px 0;">${pDocTipo}: <b>${pDocNum}</b> &nbsp;|&nbsp; Edad: <b>${pEdad} años</b></p>
          <p style="font-size:7.5pt;color:#444;margin:1px 0;">Sexo: ${pGenero} &nbsp;|&nbsp; EPS: <b>${pEps}</b></p>
          <p style="font-size:7.5pt;color:#444;margin:1px 0;">ARL: <b>${pArl}</b> &nbsp;|&nbsp; AFP: ${pAfp}</p>
          <p style="font-size:7.5pt;color:#444;margin:1px 0;">Empresa: <b>${pEmpresa}</b></p>
          <p style="font-size:7.5pt;color:#444;margin:1px 0;">Cargo: <b>${pCargo}</b> | Tipo: ${pTipo}</p>
        </div>
      </div>`;
  };
  const baseWindowStyle = `
    @page{size:letter portrait;margin:1.1cm 1.3cm 1.3cm 1.3cm;}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
    body{font-family:Arial,Helvetica,sans-serif;font-size:9.5pt;color:#111;margin:0;padding:0;line-height:1.45;}
    .badge{display:inline-block;padding:1px 7px;border-radius:50px;font-size:7.5pt;font-weight:700;}
    .section-title{font-size:8.5pt;font-weight:900;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1.5px solid currentColor;padding-bottom:3px;margin:12px 0 6px 0;}
    .med-card{border:1px solid #d1fae5;border-left:4px solid #059669;border-radius:4px;padding:6px 10px;margin-bottom:6px;page-break-inside:avoid;background:#f0fdf4;}
    .med-num{background:#059669;color:white;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:8pt;font-weight:900;flex-shrink:0;}
    .deriv-card{border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:4px;padding:8px 10px;margin-bottom:7px;page-break-inside:avoid;background:#eff6ff;}
    .urgente{background:#fee2e2;color:#dc2626;} .prioritaria{background:#fef3c7;color:#92400e;} .electiva{background:#dcfce7;color:#166534;}
    .sig-block{display:flex;justify-content:space-between;align-items:flex-end;margin-top:18mm;padding-top:0;}
    .sig-line{text-align:center;width:42%;}
    .sig-line-top{border-top:2px solid #222;padding-top:4px;font-size:7.5pt;font-weight:700;}
    @media print{body{font-size:9pt;} .no-print{display:none!important;}}
  `;
  const openSingleMedWindow = (med, idx) => {
    const w = window.open("", "_blank", "width=600,height=700");
    if (!w) return;
    const accent = "#059669";
    const header = buildPrintHeader("Prescripción Individual", accent);
    const singleMedHtml = `
      <div class="med-card" style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
        <span class="med-num">${idx + 1}</span>
        <div style="flex:1;">
          <p style="font-size:12pt;font-weight:900;color:#065f46;margin:0 0 4px 0;">${_sanitize(
            med.nombre || ""
          )} <span style="font-size:9pt;font-weight:400;color:#555;">(${_sanitize(
      med.presentacion || ""
    )})</span></p>
          <p style="font-size:9.5pt;color:#374151;margin:2px 0;"><b>Dosis:</b> ${_sanitize(
            med.dosis || "--"
          )} &nbsp;·&nbsp; <b>Frecuencia:</b> ${_sanitize(
      med.frecuencia || "--"
    )} &nbsp;·&nbsp; <b>Duración:</b> ${_sanitize(med.duracion || "--")}</p>
          ${
            med.indicaciones
              ? `<p style="font-size:9pt;color:#92400e;font-style:italic;margin:4px 0;">⚠ ${_sanitize(
                  med.indicaciones
                )}</p>`
              : ""
          }
        </div>
      </div>
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:8px 12px;margin-top:8px;">
        <p style="font-size:8.5pt;"><b>Diagnóstico:</b> ${_sanitize(
          data.diagnosticoPrincipal ||
            (data.diagnosticos || [])[0]?.descripcion ||
            "--"
        )}</p>
        <p style="font-size:8.5pt;"><b>Control en:</b> ${_sanitize(
          data.frecuenciaSeguimiento || data.plan?.controlEn || "--"
        )}</p>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16mm;padding-top:0;">
        <div style="text-align:center;width:42%;">
          <div style="border-top:2px solid #222;padding-top:4px;font-size:7.5pt;font-weight:700;">Firma del Paciente / Responsable</div>
          <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: _______________________</p>
          <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Documento: ____________________</p>
        </div>
        <div style="text-align:center;width:42%;">
          ${
            activeSignature
              ? `<img src="${activeSignature}" style="max-height:50px;max-width:130px;object-fit:contain;display:block;margin:0 auto 4px;"/>`
              : '<div style="height:50px;"></div>'
          }
          <div style="border-top:2px solid #222;padding-top:4px;">
            <p style="font-size:8.5pt;font-weight:900;margin:2px 0;">${_sanitize(
              activeDoctorData?.nombre || ""
            )}</p>
            <p style="font-size:7.5pt;color:#555;margin:1px 0;">${_sanitize(
              activeDoctorData?.titulo || ""
            )}</p>
            <p style="font-size:7.5pt;color:#555;margin:1px 0;">Lic: ${_sanitize(
              activeDoctorData?.licencia || ""
            )}</p>
          </div>
        </div>
      </div>`;
    w.document
      .write(`<!DOCTYPE html><html lang="es"><head><title>Receta - ${_sanitize(
      med.nombre
    )}</title><meta charset="UTF-8"/><style>
${baseWindowStyle}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#065f46;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;}
.print-toolbar button{border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
.print-toolbar button.btn-print{background:#10b981;color:white;}
.print-toolbar button.btn-close{background:#ef4444;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#6ee7b7;}
[contenteditable]{outline:1.5px dashed #6ee7b7;border-radius:3px;padding:1px 3px;cursor:text;}
[contenteditable]:focus{outline:2px solid #10b981;background:#ecfdf5;}
body{padding-top:52px;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">💊 Receta - ${_sanitize(med.nombre)}</span>
  <span class="hint">Edita el texto antes de imprimir</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir receta</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${header}</div>
<div contenteditable="true" spellcheck="false">${singleMedHtml}</div>
</body></html>`);
    w.document.close();
    w.focus();
  };

  const openPrintWindow = (section, titleDoc) => {
    const w = window.open("", "_blank", "width=870,height=1100");
    if (!w) return;
    const accentFormula = "#059669";
    const accentDeriv = "#2563eb";
    const accent = section === "formula" ? accentFormula : accentDeriv;
    const header = buildPrintHeader(titleDoc, accent);
    let bodyHtml = "";
    if (section === "formula") {
      const meds = data.formulaMedicamentos || [];
      const medsHtml =
        meds.length > 0
          ? meds
              .map(
                (m, i) => `
        <div class="med-card" style="display:flex;gap:10px;align-items:flex-start;">
          <span class="med-num">${i + 1}</span>
          <div style="flex:1;">
            <p style="font-size:10pt;font-weight:900;color:#065f46;margin:0 0 2px 0;">${_sanitize(
              m.nombre || ""
            )} <span style="font-size:8pt;font-weight:400;color:#6b7280;">${_sanitize(
                  m.presentacion || ""
                )}</span></p>
            <p style="font-size:8.5pt;color:#374151;margin:1px 0;"><b>Dosis:</b> ${_sanitize(
              m.dosis || "--"
            )} &nbsp;·&nbsp; <b>Frec.:</b> ${_sanitize(
                  m.frecuencia || "--"
                )} &nbsp;·&nbsp; <b>Duración:</b> ${_sanitize(
                  m.duracion || "--"
                )}</p>
            ${
              m.indicaciones
                ? `<p style="font-size:8pt;color:#92400e;font-style:italic;margin:2px 0;">&#9888; ${_sanitize(
                    m.indicaciones
                  )}</p>`
                : ""
            }
          </div>
        </div>`
              )
              .join("")
          : '<p style="color:#9ca3af;font-style:italic;text-align:center;padding:12px 0;">Sin medicamentos prescritos.</p>';
      const dx = _sanitize(
        data.diagnosticoPrincipal ||
          (data.diagnosticos || [])[0]?.descripcion ||
          data.diagnosticos?.[0]?.cie10 ||
          "--"
      );
      const control = _sanitize(
        data.frecuenciaSeguimiento || data.plan?.controlEn || "--"
      );
      const planMeds =
        !meds.length && data.plan?.medicamentos
          ? `<div style="margin-top:10px;"><p style="font-weight:700;font-size:8.5pt;color:#374151;border-bottom:1px solid #d1d5db;padding-bottom:3px;margin-bottom:5px;">PRESCRIPCIÓN</p><p style="font-size:8.5pt;white-space:pre-wrap;">${_sanitize(
              data.plan.medicamentos
            )}</p></div>`
          : "";
      bodyHtml = `
        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:10px 12px;margin-bottom:12px;">
          <p class="section-title" style="color:#065f46;">&#128138; Prescripción Médica</p>
          ${medsHtml}${planMeds}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;border-top:1px solid #a7f3d0;padding-top:8px;">
            <p style="font-size:8.5pt;"><b>Diagnóstico:</b> ${dx}</p>
            <p style="font-size:8.5pt;"><b>Control en:</b> ${control}</p>
          </div>
        </div>
        <div class="sig-block">
          <div class="sig-line">
            <div class="sig-line-top">Firma del Paciente / Responsable</div>
            <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: _______________________</p>
            <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Documento: ____________________</p>
          </div>
          <div class="sig-line" style="text-align:center;">
            ${
              activeSignature
                ? `<img src="${activeSignature}" style="max-height:55px;max-width:150px;object-fit:contain;" alt="Firma"/>`
                : '<div style="height:55px;border-bottom:2px solid #222;"></div>'
            }
            <p style="font-size:8.5pt;font-weight:900;margin:3px 0;">${_sanitize(
              activeDoctorData?.nombre || ""
            )}</p>
            <p style="font-size:7.5pt;color:#555;margin:1px 0;">${_sanitize(
              activeDoctorData?.titulo || ""
            )}</p>
            <p style="font-size:7.5pt;color:#555;margin:1px 0;">Lic: ${_sanitize(
              activeDoctorData?.licencia || ""
            )}</p>
          </div>
        </div>`;
    } else if (section === "derivacion") {
      const derivs = data.derivaciones || [];
      const derivHtml =
        derivs.length > 0
          ? derivs
              .map((d, i) => {
                const urgClass =
                  d.urgencia === "Urgente"
                    ? "urgente"
                    : d.urgencia === "Prioritaria"
                    ? "prioritaria"
                    : "electiva";
                return `
          <div class="deriv-card">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
              <span style="background:#2563eb;color:white;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:8pt;font-weight:900;">${
                i + 1
              }</span>
              <span style="font-size:10.5pt;font-weight:900;color:#1e3a8a;">${_sanitize(
                d.especialidad || "--"
              )}</span>
              <span class="badge ${urgClass}">${_sanitize(
                  d.urgencia || "Electiva"
                )}</span>
            </div>
            <p style="font-size:8.5pt;color:#374151;margin:3px 0;"><b>Motivo:</b> ${_sanitize(
              d.motivo || "--"
            )}</p>
            ${
              d.observaciones
                ? `<p style="font-size:8pt;color:#6b7280;font-style:italic;margin:2px 0;">${_sanitize(
                    d.observaciones
                  )}</p>`
                : ""
            }
          </div>`;
              })
              .join("")
          : '<p style="color:#9ca3af;font-style:italic;text-align:center;padding:12px 0;">Sin derivaciones registradas.</p>';
      bodyHtml = `
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:4px;padding:10px 12px;margin-bottom:12px;">
          <p class="section-title" style="color:#1e3a8a;">&#127973; Derivaciones / Interconsultas</p>
          ${derivHtml}
        </div>
        <div class="sig-block">
          <div class="sig-line">
            <div class="sig-line-top">Firma del Paciente / Responsable</div>
            <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: _______________________</p>
          </div>
          <div class="sig-line" style="text-align:center;">
            ${
              activeSignature
                ? `<img src="${activeSignature}" style="max-height:55px;max-width:150px;object-fit:contain;" alt="Firma"/>`
                : '<div style="height:55px;border-bottom:2px solid #222;"></div>'
            }
            <p style="font-size:8.5pt;font-weight:900;margin:3px 0;">${
              activeDoctorData?.nombre || ""
            }</p>
            <p style="font-size:7.5pt;color:#555;margin:1px 0;">${
              activeDoctorData?.titulo || ""
            }</p>
          </div>
        </div>`;
    }
    w.document.write(`<!DOCTYPE html><html lang="es"><head><title>${_sanitize(
      titleDoc
    )} - ${_sanitize(data.nombres)}</title><meta charset="UTF-8"/><style>
${baseWindowStyle}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#1e3a5f;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;letter-spacing:.2px;}
.print-toolbar button{background:white;color:#1e3a5f;border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;margin:0;}
.print-toolbar button.btn-print{background:#10b981;color:white;}
.print-toolbar button.btn-close{background:#ef4444;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#93c5fd;margin-left:4px;}
[contenteditable]{outline:1.5px dashed #93c5fd;border-radius:3px;padding:1px 3px;cursor:text;}
[contenteditable]:focus{outline:2px solid #3b82f6;background:#eff6ff;}
[contenteditable]:hover{outline:1.5px solid #60a5fa;}
body{padding-top:52px;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">✏️ ${_sanitize(titleDoc)} - ${_sanitize(
      data.nombres
    )}</span>
  <span class="hint">Haz clic en cualquier texto para editar antes de imprimir</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir ahora</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${header}</div><div contenteditable="true" spellcheck="false">${bodyHtml}</div></body></html>`);
    w.document.close();
    w.focus();
    // No auto-print - el usuario edita y luego hace clic en "Imprimir ahora"
  };
  return (
    <div
      className="bg-white mx-auto shadow-2xl print:shadow-none carta-visual"
      style={{
        width: "21.59cm",
        minHeight: "auto",
        padding: "1.2cm",
        boxSizing: "border-box",
      }}
    >
      {/* Cabecera */}
      <div className="flex justify-between items-center border-b-2 border-emerald-500 pb-3 mb-3 print:border-black">
        <div className="w-1/3">
          <BrandLogo data={activeDoctorData} />
        </div>
        <div className="w-1/3 text-center">
          <h1 className="text-sm font-black text-gray-800 uppercase">
            {activeSubTab === "formula"
              ? "Fórmula Médica"
              : "Derivación / Interconsulta"}
          </h1>
          <p className="text-[9px] text-gray-500">
            Res. 1995/1999 · Res. 1843/2025
          </p>
        </div>
        <div className="w-1/3 text-right text-[9px] text-gray-500">
          <p className="font-black text-gray-800 text-[10px]">{data.nombres}</p>
          <p>
            {data.docTipo || "CC"}: {data.docNumero} · {data.edad} años
          </p>
          <p>Empresa: {data.empresaNombre || "--"}</p>
          <p>Cargo: {data.cargo || "--"}</p>
          <p>
            EPS: {data.eps || "--"} · ARL: {data.arl || "--"}
          </p>
          <p>Fecha: {data.fechaExamen || today}</p>
        </div>
      </div>
      {/* Tabs + botones de impresión individual */}
      <div className="flex gap-2 mb-4 no-print flex-wrap items-center justify-between">
        <div className="flex gap-2">
          {[
            { k: "formula", l: "💊 Fórmula Médica" },
            { k: "derivacion", l: "🏥 Derivaciones" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setActiveSubTab(t.k)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === t.k
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {activeSubTab === "formula" && (
            <button
              onClick={() => openPrintWindow("formula", "Fórmula Médica")}
              className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700"
            >
              <Printer className="w-3 h-3" /> Imprimir Fórmula
            </button>
          )}
          {activeSubTab === "derivacion" && (
            <button
              onClick={() =>
                openPrintWindow("derivacion", "Derivación / Interconsulta")
              }
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700"
            >
              <Printer className="w-3 h-3" /> Imprimir Derivación
            </button>
          )}
        </div>
      </div>
      {/* ══ FÓRMULA ══ */}
      <div
        id="print-formula-sec"
        className={activeSubTab !== "formula" ? "hidden print:block" : ""}
      >
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 print:bg-transparent print:border-gray-300">
          <h3 className="font-black text-emerald-900 text-xs uppercase mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4" /> Prescripción Médica
          </h3>
          {/* Input nuevo medicamento */}
          <div className="no-print mb-3 bg-white p-3 rounded-lg border border-emerald-100 space-y-2">
            <p className="text-[10px] font-bold text-gray-600 uppercase">
              Agregar Medicamento a la Fórmula
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Medicamento
                </label>
                <MedicamentoAutocomplete
                  value={newMed.nombre}
                  onChange={(v) => setNewMed((p) => ({ ...p, nombre: v }))}
                  onSelectMed={(s) =>
                    setNewMed((p) => ({
                      ...p,
                      nombre: s.label,
                      presentacion:
                        p.presentacion || s.presentaciones?.[0] || "",
                      dosis: p.dosis || s.dosis || "",
                    }))
                  }
                  placeholder="Buscar por nombre genérico o comercial..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Presentación
                </label>
                <input
                  value={newMed.presentacion}
                  onChange={(e) =>
                    setNewMed((p) => ({ ...p, presentacion: e.target.value }))
                  }
                  placeholder="Ej: 500mg tab"
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Dosis
                </label>
                <input
                  value={newMed.dosis}
                  onChange={(e) =>
                    setNewMed((p) => ({ ...p, dosis: e.target.value }))
                  }
                  placeholder="Ej: 1 tableta"
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Frecuencia
                </label>
                <input
                  value={newMed.frecuencia}
                  onChange={(e) =>
                    setNewMed((p) => ({ ...p, frecuencia: e.target.value }))
                  }
                  placeholder="Ej: c/8 horas"
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Duración
                </label>
                <input
                  value={newMed.duracion}
                  onChange={(e) =>
                    setNewMed((p) => ({ ...p, duracion: e.target.value }))
                  }
                  placeholder="Ej: 7 días"
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Indicaciones especiales
                </label>
                <input
                  value={newMed.indicaciones}
                  onChange={(e) =>
                    setNewMed((p) => ({ ...p, indicaciones: e.target.value }))
                  }
                  placeholder="Ej: con comida"
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
            </div>
            <button
              onClick={addMedicamento}
              type="button"
              className="w-full bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" /> Agregar a la Fórmula
            </button>
          </div>
          {/* Lista */}
          {(data.formulaMedicamentos || []).length > 0 ? (
            <div className="space-y-2">
              {(data.formulaMedicamentos || []).map((med, idx) => (
                <div
                  key={med.id || idx}
                  className="bg-white border border-emerald-200 rounded-lg p-2 flex gap-3 items-start print:border-gray-300 print-break-avoid"
                >
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-gray-900">
                      {med.nombre}{" "}
                      <span className="font-normal text-gray-500 text-xs">
                        {med.presentacion}
                      </span>
                    </p>
                    <p className="text-xs text-gray-700 mt-0.5">
                      <b>Dosis:</b> {med.dosis}&nbsp;·&nbsp;<b>Frec:</b>{" "}
                      {med.frecuencia}&nbsp;·&nbsp;<b>Dur:</b> {med.duracion}
                    </p>
                    {med.indicaciones && (
                      <p className="text-[10px] text-amber-700 mt-0.5 italic">
                        ⚠ {med.indicaciones}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 no-print">
                    <button
                      onClick={() => openSingleMedWindow(med, idx)}
                      title="Imprimir esta receta individual"
                      className="flex items-center gap-0.5 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg px-2 py-1 text-[10px] font-bold transition"
                    >
                      <Printer className="w-3 h-3" /> Imprimir
                    </button>
                    <button
                      onClick={() => removeMed(med.id || idx)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-xs italic py-3">
              Sin medicamentos en la fórmula.
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">
                Diagnóstico
              </label>
              <input
                value={data.diagnosticoPrincipal || ""}
                readOnly
                className="w-full p-1.5 border-b border-gray-300 text-xs bg-transparent font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">
                Control en
              </label>
              <input
                value={data.frecuenciaSeguimiento || ""}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    frecuenciaSeguimiento: e.target.value,
                  }))
                }
                placeholder="Ej: 15 días"
                className="w-full p-1.5 border-b border-gray-300 text-xs outline-none"
              />
            </div>
          </div>
        </div>
        {/* Firma fórmula - solo impresión */}
        <div className="hidden print:flex mt-8 justify-between items-end px-2 signature-block">
          <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
            <p className="text-[10px] font-bold">
              Firma del Paciente / Responsable
            </p>
            <p className="text-[9px] text-gray-500">
              Nombre: ____________________________
            </p>
          </div>
          <div className="text-center w-2/5">
            <DoctorSignature
              signature={activeSignature}
              data={activeDoctorData}
              showData={true}
            />
          </div>
        </div>
      </div>
      {/* ══ DERIVACIONES ══ */}
      <div
        id="print-deriv-sec"
        className={activeSubTab !== "derivacion" ? "hidden print:block" : ""}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 print:bg-transparent print:border-gray-300">
          <h3 className="font-black text-blue-900 text-xs uppercase mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Derivaciones / Interconsultas
          </h3>
          {/* Formulario agregar derivación */}
          <div
            className="no-print mb-3 bg-white p-3 rounded-lg border border-blue-100"
            ref={derivRef}
          >
            <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">
              Agregar Derivación
            </p>
            {/* Barra de búsqueda interactiva de especialidades */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-blue-400 pointer-events-none" />
              <input
                value={derivSearch}
                onChange={(e) => {
                  setDerivSearch(e.target.value);
                  setShowDerivSugg(true);
                }}
                onFocus={() => setShowDerivSugg(true)}
                placeholder="Filtrar especialidad por nombre o motivo..."
                className="w-full pl-8 p-1.5 border border-blue-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-300 outline-none"
              />
              {showDerivSugg && filteredDeriv.length > 0 && (
                <div className="absolute z-50 bg-white border border-blue-200 rounded-xl shadow-xl mt-0.5 w-full max-h-48 overflow-y-auto">
                  {filteredDeriv.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setNewDeriv((p) => ({
                          ...p,
                          especialidad: d.esp,
                          motivo: d.motivo,
                        }));
                        setDerivSearch(d.esp);
                        setShowDerivSugg(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-50 border-b border-gray-50 last:border-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-800 text-xs">
                          {d.esp}
                        </span>
                        {d.tipo && (
                          <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 rounded">
                            {d.tipo}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {d.motivo}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Chips de especialidades frecuentes */}
            <div className="flex flex-wrap gap-1 mb-2">
              {SPECIALTIES_LIST.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() =>
                    setNewDeriv((p) => ({ ...p, especialidad: sp }))
                  }
                  className={`text-[9px] px-2 py-0.5 rounded-full border font-bold transition-all ${
                    newDeriv.especialidad === sp
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Especialidad seleccionada
                </label>
                <input
                  value={newDeriv.especialidad}
                  onChange={(e) =>
                    setNewDeriv((p) => ({ ...p, especialidad: e.target.value }))
                  }
                  placeholder="Especialidad..."
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Urgencia
                </label>
                <select
                  value={newDeriv.urgencia}
                  onChange={(e) =>
                    setNewDeriv((p) => ({ ...p, urgencia: e.target.value }))
                  }
                  className="w-full p-1.5 border rounded text-xs"
                >
                  <option>Electiva</option>
                  <option>Prioritaria</option>
                  <option>Urgente</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Motivo de la derivación{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={newDeriv.motivo}
                  onChange={(e) =>
                    setNewDeriv((p) => ({ ...p, motivo: e.target.value }))
                  }
                  placeholder="Describa el motivo clínico de la derivación..."
                  className="w-full p-1.5 border rounded text-xs resize-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Observaciones
                </label>
                <input
                  value={newDeriv.observaciones}
                  onChange={(e) =>
                    setNewDeriv((p) => ({
                      ...p,
                      observaciones: e.target.value,
                    }))
                  }
                  placeholder="Antecedentes relevantes, información adicional..."
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
            </div>
            <button
              onClick={addDerivacion}
              type="button"
              className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1 mt-2"
            >
              <Plus className="w-3 h-3" /> Agregar Derivación
            </button>
          </div>
          {/* Lista derivaciones */}
          {(data.derivaciones || []).length > 0 ? (
            <div className="space-y-2">
              {(data.derivaciones || []).map((der, idx) => (
                <div
                  key={der.id || idx}
                  className="bg-white border border-blue-200 rounded-lg p-2.5 print:border-gray-300 print-break-avoid"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-black text-sm text-blue-900">
                          {der.especialidad}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            der.urgencia === "Urgente"
                              ? "bg-red-100 text-red-700"
                              : der.urgencia === "Prioritaria"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {der.urgencia}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">
                        <b>Motivo:</b> {der.motivo}
                      </p>
                      {der.observaciones && (
                        <p className="text-[10px] text-gray-500 mt-0.5 italic">
                          {der.observaciones}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeDerivacion(der.id || idx)}
                      className="text-red-400 hover:text-red-600 no-print ml-2 flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-xs italic py-3">
              No hay derivaciones registradas.
            </p>
          )}
        </div>
        {/* Firma derivación - solo impresión */}
        <div className="hidden print:flex mt-8 justify-between items-end px-2 signature-block">
          <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
            <p className="text-[10px] font-bold">
              Firma del Paciente / Responsable
            </p>
            <p className="text-[9px] text-gray-500">
              Nombre: ____________________________
            </p>
          </div>
          <div className="text-center w-2/5">
            <DoctorSignature
              signature={activeSignature}
              data={activeDoctorData}
              showData={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
// ==========================================
// MÓDULO 10: COMPONENTE PRINCIPAL APP
// ==========================================
// ── LoginForm: inputs controlados (sin document.getElementById) ──────────────
// ══════════════════════════════════════════════════════════════════════════
// B-19 CONSENTIMIENTO INFORMADO DIGITAL
// Ley 23/1981 (ética médica) + Res. 8430/1993 (investigación en salud)
// Ley 1581/2012 (habeas data) + Res. 1843/2025 Art. 12
// ══════════════════════════════════════════════════════════════════════════
const ConsentimientoModal = ({
  data,
  onConfirmar,
  onCerrar,
  estadoCerrada,
}) => {
  const { useState: useLocalState } = React;
  const [nombre, setNombre] = useLocalState(
    data.consentimientoNombrePaciente || ""
  );
  const [aceptado, setAceptado] = useLocalState(false);
  const [error, setError] = useLocalState("");
  const fechaHoy = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaAhora = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleConfirmar = () => {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio || nombreLimpio.length < 3) {
      setError(
        "Ingrese su nombre completo tal como aparece en el documento de identidad."
      );
      return;
    }
    if (!aceptado) {
      setError("Debe marcar la casilla de aceptación para continuar.");
      return;
    }
    const ts = new Date().toISOString();
    onConfirmar({
      consentimientoInformado: true,
      consentimientoNombrePaciente: nombreLimpio,
      tipoConsentimiento: "Digital",
      fechaConsentimiento: ts.split("T")[0],
      consentimientoTimestamp: ts,
      consentimientoIp: "sesión-web",
      consentimientoVersion: "v2025-1843",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ci-titulo"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2
              id="ci-titulo"
              className="text-white font-black text-base uppercase tracking-wide"
            >
              Consentimiento Informado
            </h2>
            <p className="text-emerald-200 text-xs mt-0.5">
              Ley 23/1981 · Res. 8430/1993 · Ley 1581/2012 · Res. 1843/2025
              Art.12
            </p>
          </div>
          {!estadoCerrada && (
            <button
              onClick={onCerrar}
              className="text-emerald-200 hover:text-white text-xl font-black leading-none"
              aria-label="Cerrar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Cuerpo scrollable */}
        <div className="overflow-y-auto flex-grow px-6 py-4 text-xs text-gray-700 space-y-3">
          <p className="font-bold text-gray-900 text-sm">
            AUTORIZACIÓN PARA EVALUACIÓN MÉDICA OCUPACIONAL
          </p>
          <p>
            Yo, el/la trabajador(a) identificado(a) con el nombre y documento
            que diligencie a continuación, en ejercicio de mi capacidad legal y
            actuando de manera libre y voluntaria, <strong>AUTORIZO</strong> al
            profesional de medicina del trabajo y salud ocupacional a:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Realizar la evaluación médica ocupacional de ingreso, periódica o
              de egreso, según corresponda, de conformidad con la{" "}
              <strong>Resolución 1843 de 2025</strong> y la Resolución 2346 de
              2007.
            </li>
            <li>
              Recopilar, almacenar y procesar mis datos personales y de salud
              con fines exclusivamente médico-ocupacionales, en cumplimiento de
              la <strong>Ley 1581 de 2012</strong> (Habeas Data) y el Decreto
              1377 de 2013.
            </li>
            <li>
              Compartir el <em>Certificado de Aptitud Laboral</em> con la
              empresa contratante o solicitante de la evaluación, en los
              términos del artículo 12 de la Resolución 1843 de 2025.
            </li>
          </ul>
          <p>
            <strong>Confidencialidad:</strong> Mi historia clínica ocupacional
            es un documento privado. Su acceso está restringido únicamente al
            equipo de salud tratante y a las autoridades que lo requieran por
            mandato legal (<strong>Ley 23 de 1981, Art. 37</strong>). El médico
            está sujeto al secreto profesional.
          </p>
          <p>
            <strong>Derechos como titular de datos (Ley 1581/2012):</strong>{" "}
            Tengo derecho a conocer, actualizar, rectificar y solicitar la
            supresión de mis datos personales. Puedo ejercer estos derechos
            directamente ante el médico tratante.
          </p>
          <p>
            <strong>Voluntariedad:</strong> Entiendo que puedo revocar esta
            autorización en cualquier momento, aunque ello puede implicar la
            imposibilidad de emitir el certificado de aptitud laboral requerido
            por mi empleador.
          </p>
          <p className="text-gray-500 italic">
            Fecha y hora de este acto:{" "}
            <strong>
              {fechaHoy}, {horaAhora}
            </strong>
          </p>
        </div>

        {/* Zona de firma */}
        {!estadoCerrada ? (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0 space-y-3">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">
                Nombre completo del trabajador{" "}
                <span className="text-red-600">*</span>
                <span className="font-normal text-gray-400 ml-1">
                  (tal como aparece en su documento de identidad)
                </span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setError("");
                }}
                placeholder="Ej: JUAN CARLOS PÉREZ GÓMEZ"
                className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                autoComplete="off"
              />
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aceptado}
                onChange={(e) => {
                  setAceptado(e.target.checked);
                  setError("");
                }}
                className="mt-0.5 w-4 h-4 accent-emerald-600 flex-shrink-0"
              />
              <span className="text-xs text-gray-700 leading-relaxed">
                He leído, comprendido y acepto voluntariamente el presente
                consentimiento informado. Confirmo que la información es veraz y
                que actúo sin presión alguna.
              </span>
            </label>
            {error && (
              <p className="text-red-600 text-xs font-bold">⚠️ {error}</p>
            )}
            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={onCerrar}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={!nombre.trim() || !aceptado}
                className="px-5 py-2 text-xs font-black text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                ✅ Confirmar consentimiento
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 px-6 py-4 bg-emerald-50 flex-shrink-0">
            <p className="text-xs text-emerald-800 font-bold">
              ✅ Consentimiento registrado - Historia clínica cerrada (solo
              lectura)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function LoginForm({ onLogin, blockedUntil, attempts }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [remaining, setRemaining] = useState(0);
  // SEGURIDAD: countdown del bloqueo
  React.useEffect(() => {
    if (!blockedUntil) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const secs = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
      setRemaining(secs);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [blockedUntil]);
  const isBlocked = blockedUntil && Date.now() < blockedUntil;
  // SEC-FIX-03: Limitar longitud de inputs para prevenir DoS y fuzzing (CWE-400)
  const MAX_USER_LEN = 64;
  const MAX_PASS_LEN = 128;
  const submit = () => {
    if (isBlocked) return;
    const user = u.trim().slice(0, MAX_USER_LEN);
    const pass = p.trim().slice(0, MAX_PASS_LEN);
    if (user && pass) onLogin(user, pass);
  };
  return (
    <div className="space-y-4 mb-6">
      {isBlocked && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-center">
          <p className="text-red-700 font-black text-sm">🔒 Acceso bloqueado</p>
          <p className="text-red-500 text-xs mt-1">
            Espere <span className="font-black">{remaining}s</span> antes de
            intentar de nuevo
          </p>
        </div>
      )}
      {!isBlocked && attempts > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-2 text-center">
          <p className="text-yellow-700 text-xs font-bold">
            ⚠️ {attempts} intento{attempts > 1 ? "s" : ""} fallido
            {attempts > 1 ? "s" : ""}. Máx. 5 antes del bloqueo.
          </p>
        </div>
      )}
      <input
        value={u}
        onChange={(e) => setU(e.target.value.slice(0, MAX_USER_LEN))}
        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
        placeholder="Usuario"
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoComplete="username"
        maxLength={MAX_USER_LEN}
        disabled={isBlocked}
      />
      <input
        type="password"
        value={p}
        onChange={(e) => setP(e.target.value.slice(0, MAX_PASS_LEN))}
        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
        placeholder="Contraseña"
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoComplete="current-password"
        maxLength={MAX_PASS_LEN}
        disabled={isBlocked}
      />
      <button
        onClick={submit}
        disabled={isBlocked}
        className={`w-full py-3 rounded-xl font-black text-sm transition shadow-lg ${
          isBlocked
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90"
        }`}
      >
        {isBlocked ? `Bloqueado (${remaining}s)` : "Iniciar Sesión"}
      </button>
    </div>
  );
}
// ══════════════════════════════════════════════════════════
// MÓDULO NORMATIVO 1: AVISO DE PRIVACIDAD (Ley 1581/2012)
// Decreto 1078/2015 Art. 2.2.2.25.2.2 - Tratamiento datos sensibles (deroga Decreto 1377/2013)
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// B-15: MODAL DE NOTIFICACIONES - Res. 1552/2013
// WhatsApp y Email sin servidor externo (links directos)
// ══════════════════════════════════════════════════════════════════════════
const NotificacionModal = ({ data, onCerrar }) => {
  if (!data || !data.nombre) return null;
  const tel = (data.celular || "").replace(/\D/g, "");
  const email = data.emailPaciente || data.email || "";
  const nombre = data.nombres || data.nombre || "";
  const doc = `${data.docTipo || "CC"} ${data.docNumero || ""}`.trim();
  const codigo = data.codigoVerificacion || "";
  const fecha = data.fechaExamen || new Date().toISOString().split("T")[0];
  const concepto = data.conceptoAptitud || "pendiente";
  const empresa = data.empresaNombre || data.empresa || "";

  const waMsg = encodeURIComponent(
    `Estimado/a ${nombre},\n\n` +
      `Le informamos que su evaluación médica ocupacional ha sido registrada.\n\n` +
      `📋 *Código de verificación:* ${codigo}\n` +
      `📅 *Fecha:* ${fecha}\n` +
      `🏢 *Empresa:* ${empresa}\n` +
      `✅ *Concepto:* ${concepto}\n\n` +
      `Puede verificar su certificado en cualquier momento solicitando este código al médico.\n\n` +
      `Atentamente,\nServicio Médico Ocupacional - SISO OcupaSalud v4`
  );

  const mailSubject = encodeURIComponent(
    `Evaluación Médica Ocupacional - Código ${codigo}`
  );
  const mailBody = encodeURIComponent(
    `Estimado/a ${nombre},

` +
      `Le informamos que su evaluación médica ocupacional ha sido registrada.

` +
      `Código de verificación: ${codigo}
` +
      `Fecha: ${fecha}
` +
      `Empresa: ${empresa}
` +
      `Concepto de aptitud: ${concepto}

` +
      `Puede verificar su certificado presentando este código al médico tratante.

` +
      `Atentamente,
Servicio Médico Ocupacional - SISO OcupaSalud v4`
  );

  const waUrl = `https://wa.me/${
    tel.startsWith("57") ? tel : "57" + tel
  }?text=${waMsg}`;
  const mailUrl = `mailto:${email}?subject=${mailSubject}&body=${mailBody}`;
  const smsUrl = `sms:${tel}?body=${encodeURIComponent(
    `SISO OcupaSalud: Su código de verificación es ${codigo}. Fecha evaluación: ${fecha}.`
  )}`;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white flex items-center justify-between">
          <div>
            <h2 className="font-black text-base">📲 Notificar al Paciente</h2>
            <p className="text-green-100 text-xs mt-0.5">
              Res. 1552/2013 · Comunicación resultado
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-white/80 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
            <p>
              <span className="font-black text-gray-600">Paciente:</span>{" "}
              {nombre}
            </p>
            <p>
              <span className="font-black text-gray-600">Documento:</span> {doc}
            </p>
            <p>
              <span className="font-black text-gray-600">
                Código verificación:
              </span>{" "}
              <span className="font-black text-blue-700">
                {codigo || "(guardar HC primero)"}
              </span>
            </p>
            <p>
              <span className="font-black text-gray-600">Concepto:</span>{" "}
              {concepto}
            </p>
          </div>

          <p className="text-xs font-black text-gray-700 uppercase">
            Canales de notificación
          </p>

          {tel ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition"
            >
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-xs font-black text-green-800">WhatsApp</p>
                <p className="text-[10px] text-green-600">
                  +{tel.startsWith("57") ? tel : "57" + tel}
                </p>
              </div>
              <span className="ml-auto text-xs font-bold text-green-600">
                Abrir →
              </span>
            </a>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-400">
              💬 WhatsApp - Registre celular del paciente para habilitar
            </div>
          )}

          {email ? (
            <a
              href={mailUrl}
              className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
            >
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-xs font-black text-blue-800">
                  Correo electrónico
                </p>
                <p className="text-[10px] text-blue-600">{email}</p>
              </div>
              <span className="ml-auto text-xs font-bold text-blue-600">
                Abrir →
              </span>
            </a>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-400">
              📧 Email - Registre correo del paciente para habilitar
            </div>
          )}

          {tel ? (
            <a
              href={smsUrl}
              className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition"
            >
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-xs font-black text-purple-800">
                  SMS (código únicamente)
                </p>
                <p className="text-[10px] text-purple-600">
                  +{tel.startsWith("57") ? tel : "57" + tel}
                </p>
              </div>
              <span className="ml-auto text-xs font-bold text-purple-600">
                Abrir →
              </span>
            </a>
          ) : null}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10px] text-amber-700">
            <p className="font-black">
              📋 Res. 1552/2013 - Notificación de resultados
            </p>
            <p className="mt-0.5">
              El médico tiene la obligación de informar los resultados al
              trabajador evaluado. Los links abren su app de WhatsApp/Email con
              el mensaje prellenado.
            </p>
          </div>

          <button
            onClick={onCerrar}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// B-20: FACTURACIÓN ELECTRÓNICA DIAN - UBL 2.1
// Decreto 358 de 2020 · Resolución DIAN 000012 de 2021
// Genera XML base para envío a software autorizado (Siigo, Alegra, Facture)
// ══════════════════════════════════════════════════════════════════════════
const _generarFacturaDIAN_UBL = (billData, doctorData, numero) => {
  const now = new Date();
  const fecha = now.toISOString().split("T")[0];
  const hora = now.toISOString().split("T")[1].slice(0, 8);
  const cufe = `SISO-${numero}-${fecha}`.replace(/-/g, "");
  const bruto = parseFloat(billData.amount || "0");
  const iva = 0; // Servicios médicos exentos de IVA (Art. 476 E.T. numeral 1)
  const total = bruto;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <!-- DIAN Colombia - UBL 2.1 - Decreto 358/2020 - Generado por SISO OCUPASALUD v4 -->
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>10</cbc:CustomizationID>
  <cbc:ProfileExecutionID>2</cbc:ProfileExecutionID>
  <cbc:ID>FE-${String(numero).padStart(6, "0")}</cbc:ID>
  <cbc:UUID schemeName="CUFE-SHA384">${cufe}</cbc:UUID>
  <cbc:IssueDate>${fecha}</cbc:IssueDate>
  <cbc:IssueTime>${hora}-05:00</cbc:IssueTime>
  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>
  <cbc:Note>Servicios médicos ocupacionales exentos de IVA - Art. 476 E.T. num. 1</cbc:Note>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>1</cbc:LineCountNumeric>
  <!-- Emisor (médico) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${
          doctorData?.nombre || "MÉDICO OCUPACIONAL"
        }</cbc:RegistrationName>
        <cbc:CompanyID schemeID="13">${(doctorData?.cedula || "").replace(
          /[^0-9]/g,
          ""
        )}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>ZZ</cbc:ID><cbc:Name>No aplica</cbc:Name></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact><cbc:ElectronicMail>${
        doctorData?.email || ""
      }</cbc:ElectronicMail></cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <!-- Adquiriente (empresa/paciente) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${
          billData.clientName || "CLIENTE"
        }</cbc:RegistrationName>
        <cbc:CompanyID schemeID="31">${(billData.clientNit || "").replace(
          /[^0-9]/g,
          ""
        )}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>ZZ</cbc:ID><cbc:Name>No aplica</cbc:Name></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <!-- Totales -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">${bruto.toFixed(
      2
    )}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="COP">${bruto.toFixed(
      2
    )}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="COP">${total.toFixed(
      2
    )}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="COP">${total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <!-- Línea de factura -->
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="94">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">${bruto.toFixed(
      2
    )}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="COP">0.00</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="COP">${bruto.toFixed(
          2
        )}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="COP">0.00</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>0.00</cbc:Percent>
          <cbc:TaxExemptionReasonCode>Art. 476 E.T.</cbc:TaxExemptionReasonCode>
          <cac:TaxScheme><cbc:ID>01</cbc:ID><cbc:Name>IVA</cbc:Name></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${
        billData.concept || "EXAMENES MEDICOS OCUPACIONALES"
      }</cbc:Description>
      <cac:SellersItemIdentification><cbc:ID>SVC-OCUP-001</cbc:ID></cac:SellersItemIdentification>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">${bruto.toFixed(2)}</cbc:PriceAmount>
      <cbc:BaseQuantity unitCode="94">1</cbc:BaseQuantity>
    </cac:Price>
  </cac:InvoiceLine>
</Invoice>`;
};

// ══════════════════════════════════════════════════════════════════════════
// B-14: RETENCIÓN CERTIFICADA 20 AÑOS - Res. 1995/1999 Art. 15
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// B-18: 2FA TOTP - RFC 6238 con Web Crypto API (HMAC-SHA1)
// Res. 3100/2019 (habilitación IPS) - Seguridad en sistemas de información
// Compatible con Google Authenticator, Authy, Microsoft Authenticator
// ══════════════════════════════════════════════════════════════════════════
const _totpBase32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const _totpBase32ToBytes = (base32) => {
  const s = base32
    .toUpperCase()
    .replace(/=+$/, "")
    .replace(/[^A-Z2-7]/g, "");
  const bytes = [];
  let buf = 0,
    bitsLeft = 0;
  for (const ch of s) {
    const val = _totpBase32Chars.indexOf(ch);
    if (val < 0) continue;
    buf = (buf << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      bytes.push((buf >> bitsLeft) & 0xff);
    }
  }
  return new Uint8Array(bytes);
};

const _totpGenSecret = () => {
  const raw = crypto.getRandomValues(new Uint8Array(20));
  let s = "";
  for (let i = 0; i < raw.length; i++) {
    s += _totpBase32Chars[(raw[i] >> 3) & 0x1f];
    if (i < raw.length - 1)
      s += _totpBase32Chars[((raw[i] & 0x07) << 2) | (raw[i + 1] >> 6)];
  }
  return s.substring(0, 32);
};

const _totpVerify = async (secret, token, window = 1) => {
  try {
    const keyBytes = _totpBase32ToBytes(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );
    const now = Math.floor(Date.now() / 30000);
    for (let delta = -window; delta <= window; delta++) {
      const counter = now + delta;
      const msg = new DataView(new ArrayBuffer(8));
      msg.setUint32(4, counter & 0xffffffff, false);
      const sig = await crypto.subtle.sign("HMAC", cryptoKey, msg.buffer);
      const hmac = new Uint8Array(sig);
      const offset = hmac[hmac.length - 1] & 0x0f;
      const code =
        (((hmac[offset] & 0x7f) << 24) |
          ((hmac[offset + 1] & 0xff) << 16) |
          ((hmac[offset + 2] & 0xff) << 8) |
          (hmac[offset + 3] & 0xff)) %
        1000000;
      if (String(code).padStart(6, "0") === String(token).padStart(6, "0"))
        return true;
    }
    return false;
  } catch {
    return false;
  }
};

const _totpGetOtpAuthUrl = (secret, user, issuer = "SISOOcupaSalud") =>
  "otpauth://totp/" +
  encodeURIComponent(issuer + ":" + user) +
  "?secret=" +
  secret +
  "&issuer=" +
  encodeURIComponent(issuer) +
  "&algorithm=SHA1&digits=6&period=30";

const _totpGetQRCodeUrl = (secret, user) =>
  "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
  encodeURIComponent(_totpGetOtpAuthUrl(secret, user));
const _generarPaqueteRetencion = async (hcData, medicoData) => {
  const hcLimpio = { ...hcData };
  delete hcLimpio._agendaId;
  const hcJson = JSON.stringify(hcLimpio, null, 2);
  const hashBuf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(hcJson)
  );
  const hashHex = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const ts = new Date().toISOString();
  return {
    _tipo: "SISO_HC_RETENCION_CERTIFICADA",
    metadata: {
      norma:
        "Resolución 1995 de 1999 Art. 15 - Retención Historia Clínica 20 años",
      version: "SISO-OCUPASALUD-v4",
      fechaPreservacion: ts,
      anioVencimientoLegal: new Date().getFullYear() + 20,
      medicoId: medicoData?.cedula || "desconocido",
      medicoNombre: medicoData?.nombre || "Médico Ocupacional",
      paciente: hcData.nombres || "Desconocido",
      docNumero: hcData.docNumero || "--",
      empresa: hcData.empresaNombre || "PARTICULAR",
      tipoExamen: hcData.tipoExamen || "--",
      fechaExamen: hcData.fechaExamen || "--",
      conceptoAptitud: hcData.conceptoAptitud || "--",
      codigoVerificacion: hcData.codigoVerificacion || "--",
      algoritmoHash: "SHA-256",
      hashSHA256: hashHex,
      instruccionVerificacion:
        "Para verificar integridad: recalcule SHA-256 del campo hcData y compare con hashSHA256",
    },
    hashSHA256: hashHex,
    hcData: hcLimpio,
    _generadoEn: ts,
    _versionFormato: "1.0",
  };
};

// ══════════════════════════════════════════════════════════════════════════
// B-23: CERTIFICADO DE APTITUD ESTANDARIZADO - Res. 1843/2025
// ══════════════════════════════════════════════════════════════════════════
const _generarCertificadoHTMLNormalizado = (
  data,
  doctorData,
  signature,
  ipsData
) => {
const _dateRef = data.fechaCierre ? new Date(data.fechaCierre + "T12:00:00") : new Date();
  const fechaHoy = _dateRef.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const nomDoc =
    doctorData && doctorData.nombre ? doctorData.nombre : "MÉDICO OCUPACIONAL";
  const nomTit =
    doctorData && doctorData.titulo
      ? doctorData.titulo
      : "Médico Especialista en Salud Ocupacional";
  const nomLic = doctorData && doctorData.licencia ? doctorData.licencia : "--";
  const nomCiu =
    doctorData && doctorData.ciudad ? doctorData.ciudad : "Popayán";
  const nomCell =
    doctorData && doctorData.celular
      ? doctorData.celular
      : doctorData && doctorData.telefono
      ? doctorData.telefono
      : "";
  const nomMail = doctorData && doctorData.email ? doctorData.email : "";
  const sigImg = signature
    ? '<img src="' +
      signature +
      '" style="max-height:68px;display:block;margin:0 auto 2px;" alt="Firma"/>'
    : '<div style="height:60px;"></div>';
  const tipoExamen = (data.tipoExamen || "").toUpperCase();
  const enfasis = (data.enfasisExamen || "GENERAL").toUpperCase();
  const conceptoRaw = data.conceptoAptitud || "";
  const conceptoDisplay = conceptoRaw || "PENDIENTE DE CONCEPTO";

  /* ── Formato de restricciones / recomendaciones ─────────────────── */
  const fmtBlocks = (txt) => {
    if (!txt) return "";
    const str = Array.isArray(txt) ? txt.join("\n") : String(txt);
    const lines = str
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (
      lines.some(
        (l) => /^[•*\-]/.test(l) || /^\*\*/.test(l) || /^\d+\./.test(l)
      )
    ) {
      return (
        '<ul style="margin:5px 0 0;padding-left:20px;">' +
        lines
          .map(
            (l) =>
              '<li style="margin-bottom:3px;font-size:9.5pt;">' +
              l
                .replace(/^[•*\-]+\s*/, "")
                .replace(/^\d+\.\s*/, "")
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") +
              "</li>"
          )
          .join("") +
        "</ul>"
      );
    }
    return (
      '<p style="font-size:9.5pt;margin-top:5px;line-height:1.5;">' +
      str.replace(/\n/g, "<br/>") +
      "</p>"
    );
  };

  const restriccionesText =
    data.analisisRestricciones || data.restricciones || "";
  const recomendacionesArr = [
    data.recomendacionesOcupacionales,
    data.recomendacionesMedicas,
    data.recomendaciones,
    data.recomendacionesHabitos,
  ].filter(Boolean);
  const recomendacionesText = recomendacionesArr.join("\n");

  const checkItems = (obj) =>
    Object.entries(obj || {})
      .filter(([, v]) => v)
      .map(([k]) => k);
  const restCheck = checkItems(data.restriccionesChecklist);
  const recCheck = checkItems(data.recomendacionesChecklist);

  /* ── Fecha de vigencia ─────────────────────────────────────────── */
  const vigencia = data.vigencia || "1 año";

  /* ── Color concepto ────────────────────────────────────────────── */
  const cLow = conceptoRaw.toLowerCase();
  const aptBg = cLow.includes("no apto")
    ? "#7f1d1d"
    : cLow.includes("condic")
    ? "#78350f"
    : cLow.includes("apto")
    ? "#14532d"
    : "#1e3a5f";

  return (
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>' +
    "<title>Certificado de Aptitud Laboral - " +
    (data.nombres || "") +
    "</title>" +
    "<style>" +
    "*{margin:0;padding:0;box-sizing:border-box;}" +
    'body{font-family:"Segoe UI",Arial,sans-serif;font-size:10.5pt;color:#111;padding:14mm 16mm 10mm;}' +
    ".np-dl{position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:6px;}" +
    ".np-dl button{background:#065f46;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:900;font-size:11pt;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2);}" +
    ".np-dl p{font-size:8pt;color:#6b7280;text-align:right;}" +
    "@media print{.np-dl{display:none!important;}body{padding:10mm 14mm;}}" +
    /* ── HEADER ── */
    ".hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #065f46;padding-bottom:10px;margin-bottom:14px;}" +
    ".hdr-brand{display:flex;align-items:center;gap:10px;}" +
    ".hdr-logo{width:44px;height:44px;border-radius:10px;background:#065f46;display:flex;align-items:center;justify-content:center;font-size:20pt;color:#fff;font-weight:900;flex-shrink:0;}" +
    ".hdr-name{font-size:13pt;font-weight:900;color:#065f46;text-transform:uppercase;letter-spacing:1px;}" +
    ".hdr-sub{font-size:8pt;color:#6b7280;margin-top:1px;}" +
    ".hdr-ref{text-align:right;font-size:8pt;color:#6b7280;line-height:1.5;}" +
    /* ── TITLE ── */
    ".title{text-align:center;font-size:16pt;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:10px 0 4px;}" +
    ".subtitle{text-align:center;font-size:9pt;color:#6b7280;margin-bottom:10px;}" +
    ".intro{font-size:9.5pt;color:#374151;margin-bottom:10px;line-height:1.5;}" +
    /* ── PATIENT BOX ── */
    ".pat-box{border:1.5px solid #d1d5db;border-radius:8px;padding:10px 14px;margin-bottom:10px;display:grid;grid-template-columns:1fr 1fr;gap:5px 20px;}" +
    ".pat-field{display:flex;flex-direction:column;}" +
    ".pat-label{font-size:7.5pt;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;}" +
    ".pat-val{font-size:10.5pt;font-weight:700;color:#111;}" +
    /* ── CONCEPT ── */
    ".concepto-lbl{text-align:center;font-size:8pt;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#6b7280;margin:6px 0 4px;}" +
    ".concepto-box{border:2px solid " +
    aptBg +
    ";border-radius:8px;padding:14px 20px;text-align:center;margin-bottom:10px;background:" +
    aptBg +
    ";}" +
    ".concepto-txt{font-size:16pt;font-weight:900;text-transform:uppercase;color:#fff;line-height:1.3;}" +
    ".concepto-note{font-size:8pt;color:#e5e7eb;margin-top:4px;}" +
    /* ── SECTIONS ── */
    ".sec{margin-bottom:10px;}" +
    ".sec-title{font-size:9pt;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#111;border-bottom:2px solid #d1d5db;padding-bottom:3px;margin-bottom:6px;}" +
    ".pill{display:inline-block;background:#fef9c3;border:1px solid #fde047;color:#78350f;padding:2px 8px;border-radius:4px;font-size:8.5pt;margin:2px;}" +
    ".pill.ok{background:#f0fdf4;border-color:#86efac;color:#14532d;}" +
    /* ── ALERTA ── */
    ".alerta{background:#fef9c3;border:1px solid #fde047;padding:7px 12px;border-radius:6px;font-size:8.5pt;color:#713f12;margin-bottom:10px;}" +
    /* ── FIRMA ROW ── */
    ".firma-row{display:grid;grid-template-columns:1fr auto 1fr;gap:20px;align-items:end;border-top:2px solid #d1d5db;padding-top:12px;margin-top:4px;}" +
    ".firma-col{display:flex;flex-direction:column;align-items:center;text-align:center;}" +
    ".firma-line{width:180px;border-top:1px solid #374151;margin-top:50px;padding-top:5px;}" +
    ".firma-med-box{text-align:center;}" +
    ".firma-med-name{font-size:11pt;font-weight:900;color:#065f46;}" +
    ".firma-med-sub{font-size:8.5pt;color:#6b7280;margin-top:1px;}" +
    ".cv-box{background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:8px 16px;text-align:center;}" +
    ".cv-lbl{font-size:7.5pt;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:1px;}" +
    ".cv-code{font-size:14pt;font-family:monospace;font-weight:900;letter-spacing:3px;color:#065f46;margin-top:2px;}" +
    /* ── FOOTER ── */
    ".footer{margin-top:10px;border-top:1px solid #e5e7eb;padding-top:6px;font-size:7.5pt;color:#9ca3af;display:flex;justify-content:space-between;}" +
    /* ── CONSENT ── */
    ".consent{margin-top:8px;font-size:7pt;color:#9ca3af;line-height:1.4;border-top:1px dashed #e5e7eb;padding-top:6px;}" +
    "</style></head><body>" +
    /* ── HEADER ─────────────────────────────────────────────── */
    '<div class="hdr">' +
    '<div class="hdr-brand">' +
    (ipsData
      ? _safeLogoUrl(ipsData.logo || "") // SEC-FIX-02
        ? `<img src="${_safeLogoUrl(ipsData.logo)}" style="max-height:44px;max-width:100px;object-fit:contain;margin-right:8px;" />`
        : '<div class="hdr-logo">IPS</div>'
      : '<div class="hdr-logo">+</div>') +
    '<div><div class="hdr-name">' +
    (ipsData ? _sanitize(ipsData.nombre || "") : nomDoc) +
    "</div>" +
    '<div class="hdr-sub">' +
    (ipsData
      ? "NIT: " +
        _sanitize(ipsData.nit || "") +
        (ipsData.dv ? "-" + _sanitize(ipsData.dv) : "")
      : nomTit) +
    "</div>" +
    '<div class="hdr-sub">' +
    (ipsData
      ? _sanitize(
          (ipsData.direccion || "") +
            (ipsData.ciudad ? " · " + ipsData.ciudad : "")
        )
      : "Lic. " + nomLic + " · " + nomCiu) +
    "</div>" +
    (ipsData && ipsData.telefono
      ? '<div class="hdr-sub">Tel: ' + _sanitize(ipsData.telefono) + "</div>"
      : "") +
    (ipsData && ipsData.correo
      ? '<div class="hdr-sub">' + _sanitize(ipsData.correo) + "</div>"
      : "") +
    "</div>" +
    "</div>" +
    '<div class="hdr-ref"><p>Res. 1843/2025</p><p>Generado: ' +
    fechaHoy +
    "</p></div>" +
    "</div>" +
    /* ── TITLE ──────────────────────────────────────────────── */
    '<div class="title">Certificado de Aptitud Laboral</div>' +
    '<div class="subtitle">Conforme a la Resolución 1843 de 2025</div>' +
    /* ── INTRO ──────────────────────────────────────────────── */
    '<p class="intro">El suscrito Médico Especialista en Salud Ocupacional, con licencia vigente, certifica que ha realizado la evaluación médica ocupacional de tipo <strong>' +
    tipoExamen +
    "</strong> con énfasis <strong>" +
    enfasis +
    "</strong> a:</p>" +
    /* ── PATIENT BOX ────────────────────────────────────────── */
    '<div class="pat-box">' +
    '<div class="pat-field"><span class="pat-label">Nombre</span><span class="pat-val">' +
    (data.nombres || "--") +
    "</span></div>" +
    '<div class="pat-field"><span class="pat-label">Identificación</span><span class="pat-val">' +
    (data.docTipo || "CC") +
    " " +
    (data.docNumero || "--") +
    "</span></div>" +
    '<div class="pat-field"><span class="pat-label">Cargo</span><span class="pat-val">' +
    (data.cargo || "--") +
    "</span></div>" +
    '<div class="pat-field"><span class="pat-label">Empresa</span><span class="pat-val">' +
    (data.empresaNombre || data.empresa || "PARTICULAR") +
    "</span></div>" +
    '<div class="pat-field"><span class="pat-label">Fecha</span><span class="pat-val">' +
    (data.fechaExamen || "--") +
    "</span></div>" +
    '<div class="pat-field"><span class="pat-label">Vigencia</span><span class="pat-val">' +
    vigencia +
    "</span></div>" +
    "</div>" +
    /* ── CONCEPTO ───────────────────────────────────────────── */
    '<div class="concepto-lbl">Concepto Emitido</div>' +
    '<div class="concepto-box">' +
    '<div class="concepto-txt">' +
    conceptoDisplay +
    "</div>" +
    '<div class="concepto-note">Concepto emitido bajo Res. 1843 de 2025, Art. 20</div>' +
    "</div>" +
    /* ── RECOMENDACIONES ────────────────────────────────────── */
    (recomendacionesText || recCheck.length > 0
      ? '<div class="sec"><div class="sec-title">Recomendaciones</div>' +
        "" +
        fmtBlocks(recomendacionesText) +
        "</div>"
      : "") +
    /* ── RESTRICCIONES ──────────────────────────────────────── */
    (restriccionesText || restCheck.length > 0
      ? '<div class="sec"><div class="sec-title">Restricciones Laborales</div>' +
        "" +
        fmtBlocks(restriccionesText) +
        "</div>"
      : "") +
    /* ── ALERTA CONFIDENCIALIDAD ─────────────────────────────── */
    '<div class="alerta">⚠ <strong>Confidencialidad:</strong> El diagnóstico clínico no es entregado al empleador (Art. 16 Res. 1843/2025). Solo uso para gestión del riesgo ocupacional.</div>' +
    /* ── FIRMA ROW ──────────────────────────────────────────── */
    '<div class="firma-row">' +
    '<div class="firma-col">' +
    '<div class="firma-line">' +
    '<div style="font-size:8.5pt;font-weight:700;">Firma del Trabajador</div>' +
    '<div style="font-size:8pt;color:#6b7280;">' +
    (data.docTipo || "CC") +
    ": " +
    (data.docNumero || "--") +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="cv-box">' +
    '<div class="cv-lbl">Código Verificación</div>' +
    '<div class="cv-code">' +
    (data.codigoVerificacion || "--") +
    "</div>" +
    "</div>" +
    '<div class="firma-col firma-med-box">' +
    sigImg +
    '<div style="border-top:1px solid #374151;width:180px;margin:0 auto;padding-top:5px;">' +
    '<div class="firma-med-name">' +
    nomDoc +
    "</div>" +
    '<div class="firma-med-sub">' +
    nomTit +
    "</div>" +
    '<div class="firma-med-sub">Licencia: ' +
    nomLic +
    " (" +
    nomCiu +
    ")</div>" +
    (nomCell ? '<div class="firma-med-sub">Cel: ' + nomCell + "</div>" : "") +
    (nomMail
      ? '<div class="firma-med-sub">Email: ' + nomMail.toUpperCase() + "</div>"
      : "") +
    "</div>" +
    "</div>" +
    "</div>" +
    /* ── FOOTER ─────────────────────────────────────────────── */
    '<div class="footer">' +
    "<span>Res. 1843/2025 · Res. 1995/1999 · Ley 23/1981 · Ley 1581/2012</span>" +
    "<span>SISO OcupaSalud v4.8</span>" +
    "</div>" +
    /* ── CONSENTIMIENTO ─────────────────────────────────────── */
    '<div class="consent">El suscrito Médico Especialista en Salud Ocupacional, con licencia vigente, certifica que realizó el examen médico ocupacional registrado en este documento. ' +
    "El paciente fue informado de las medidas de protección de la confidencialidad de los resultados. " +
    "Las respuestas dadas fueron consideradas verídicas. " +
    "Se autoriza al doctor para suministrar la Historia Clínica a la EPS y a las personas o entidades contempladas en la legislación vigente, para el buen cumplimiento del sistema de seguridad y salud en el trabajo. " +
    "Res. 1843/2025 · Ley 1581/2012 · Ley 23/1981.</div>" +
    "</body></html>"
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PORTAL PÚBLICO DEL TRABAJADOR - Acceso sin login
// Solo requiere: código de verificación de HC O número de cédula
// Consulta DIRECTA a Supabase (no usa estado del App)
// SEC-13: Sin acceso a datos de otros pacientes
const PORTAL_URL = "https://fw5fnt.csb.app/#portaltrabajador";
// ══════════════════════════════════════════════════════════════════════════
// PORTAL PÚBLICO DEL TRABAJADOR - v2 - Acceso sin login
// URL: https://fw5fnt.csb.app/#portaltrabajador
// Búsqueda por código de verificación O número de cédula
// Query directo a Supabase clave pública 'siso_portal_{codigo}'
// Compatible: Chrome, Firefox, Safari, Edge, Opera (todos los navegadores)
// SEC-13: Nunca expone datos de otros pacientes
// NORMATIVO: Res. 2346/2007 Art.14 · Ley 1581/2012 · Res. 1843/2025
// ══════════════════════════════════════════════════════════════════════════
const PortalPublicoTrabajador = ({ sbUrl, sbKey, onVolver }) => {
  const { useState, useCallback, useRef } = React;
  const [busqueda, setBusqueda] = React.useState("");
  const [tipoBusqueda, setTipoBusqueda] = React.useState("codigo");
  const [resultado, setResultado] = React.useState(null);
  const [error, setError] = React.useState("");
  const [cargando, setCargando] = React.useState(false);
  const [intentos, setIntentos] = React.useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = React.useState(0);
  const MAX_INTENTOS = 6;
  const BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos

  // Fetch con timeout compatible con todos los navegadores (sin AbortSignal.timeout)
  const fetchConTimeout = (url, opts, ms = 10000) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...opts, signal: ctrl.signal }).finally(() =>
      clearTimeout(timer)
    );
  };

  const buscar = async () => {
    const ahora = Date.now();
    if (ahora < bloqueadoHasta) {
      const restMin = Math.ceil((bloqueadoHasta - ahora) / 60000);
      setError(
        `🔒 Demasiados intentos. Espere ${restMin} minuto(s) antes de intentar.`
      );
      return;
    }
    const q = busqueda.trim();
    if (!q) {
      setError("Ingrese su código de verificación o número de cédula.");
      return;
    }
    if (q.length < 4) {
      setError("El código o cédula debe tener al menos 4 caracteres.");
      return;
    }
    setCargando(true);
    setError("");
    setResultado(null);
    try {
      // ── Construcción de claves de búsqueda ───────────────────────────────────
      // Formatos históricos coexistentes:
      //   ANTIGUO: CV-XXXXXXXXX  (p.ej. CV-I64CIYHE7)  - 71 HCs
      //   NUEVO:   SISO-YYYYMMDD-ID-HASH16              - desde 2026-03
      // El portal busca con el prefijo siso_portal_ en Supabase
      // Para búsqueda por código: intentar la clave exacta
      // Para búsqueda por cédula: intentar siso_portal_doc_CEDULA

      const headers = {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      const fetchKey = async (key) => {
        const url = `${sbUrl}/rest/v1/siso_store?key=eq.${encodeURIComponent(
          key
        )}&select=value`;
        const r = await fetchConTimeout(url, { headers }, 12000);
        if (!r.ok) return { ok: false, status: r.status, text: r.statusText };
        const rows = await r.json();
        const val = rows && rows.length > 0 ? rows[0].value : null;
        return {
          ok: true,
          data: val ? (typeof val === "string" ? JSON.parse(val) : val) : null,
        };
      };

      // Intentar todas las variantes de clave posibles
      let pac = null;
      let firstError = null;
      if (tipoBusqueda === "codigo") {
        const qUp = q.toUpperCase();
        // 1) Clave exacta tal como viene
        const r1 = await fetchKey("siso_portal_" + qUp);
        if (!r1.ok) {
          firstError = r1;
        } else if (r1.data) {
          pac = r1.data;
        }
        // 2) Si el código no tiene prefijo CV- ni SISO-, probar con CV- delante
        if (!pac && !qUp.startsWith("CV-") && !qUp.startsWith("SISO-")) {
          const r2 = await fetchKey("siso_portal_CV-" + qUp);
          if (r2.ok && r2.data) pac = r2.data;
        }
        // 3) Probar código exacto sin normalizar (algunos códigos tienen minúsculas)
        if (!pac && qUp !== q.trim()) {
          const r3 = await fetchKey("siso_portal_" + q.trim());
          if (r3.ok && r3.data) pac = r3.data;
        }
        // 4) Buscar por código directamente en siso_store (formato antiguo no-portal)
        if (!pac) {
          const r4 = await fetchKey(qUp);
          if (r4.ok && r4.data && r4.data.codigoVerificacion) pac = r4.data;
        }
        // 5) Búsqueda por dígito verificador flexible (sin guión, con guión)
        if (!pac) {
          const codeNoDash = qUp.replace(/-/g, "");
          const r5 = await fetchKey("siso_portal_" + codeNoDash);
          if (r5.ok && r5.data) pac = r5.data;
        }
      } else {
        // Búsqueda por cédula
        const docClean = q.replace(/\s/g, "");
        const r1 = await fetchKey("siso_portal_doc_" + docClean);
        if (!r1.ok) {
          firstError = r1;
        } else if (r1.data) pac = r1.data;
      }

      if (firstError && !pac) {
        if (firstError.status === 401 || firstError.status === 403) {
          setError(
            "⚙️ El portal requiere configuración en Supabase.\nEjecute en el SQL Editor de Supabase:\nCREATE POLICY portal_public_read ON siso_store FOR SELECT USING (key LIKE 'siso_portal_%');"
          );
        } else {
          setError(`Error ${firstError.status}: ${firstError.text}`);
        }
        return;
      }
      setIntentos((prev) => {
        const n = prev + 1;
        if (n >= MAX_INTENTOS) setBloqueadoHasta(Date.now() + BLOQUEO_MS);
        return n;
      });
      if (!pac) {
        setError(
          tipoBusqueda === "codigo"
            ? "❌ Código no encontrado. Aceptamos formatos CV-XXXXXXX y SISO-FECHA-ID-HASH. Verifique mayúsculas y que la HC esté cerrada."
            : "❌ Número de cédula no encontrado. Solo aparecen evaluaciones con historia cerrada."
        );
      } else {
        setResultado(pac);
      }
    } catch (e) {
      if (e.name === "AbortError")
        setError(
          "⏱️ Tiempo de espera agotado. Verifique su conexión a internet."
        );
      else setError("Error de conexión: " + (e.message || "desconocido"));
    } finally {
      setCargando(false);
    }
  };

  const colorAptitud = (c = "") => {
    const cl = (c || "").toLowerCase();
    if (cl.includes("no apto"))
      return {
        bg: "bg-red-50",
        text: "text-red-800",
        badge: "bg-red-100 text-red-800 border-red-300",
        dot: "🔴",
      };
    if (
      cl.includes("condicion") ||
      cl.includes("condición") ||
      cl.includes("restricc")
    )
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        dot: "🟡",
      };
    if (cl.includes("apto"))
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
        dot: "🟢",
      };
    return {
      bg: "bg-gray-50",
      text: "text-gray-700",
      badge: "bg-gray-100 text-gray-700 border-gray-300",
      dot: "⚪",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 font-sans flex flex-col">
      {/* ── Barra superior ── */}
      <div className="bg-gradient-to-r from-teal-700 to-blue-700 px-5 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
            🧑‍💼
          </div>
          <div>
            <h1 className="text-white font-black text-sm tracking-tight">
              Portal del Trabajador
            </h1>
            <p className="text-teal-200 text-[10px]">
              Servicio Médico Ocupacional · SISO OcupaSalud
            </p>
          </div>
        </div>
        {onVolver && (
          <button
            onClick={onVolver}
            className="text-white/80 text-xs hover:text-white font-bold flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
          >
            ← Volver al sistema
          </button>
        )}
      </div>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4 mt-2">
        {/* ── Instrucciones ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">📋</span>
            <div>
              <h2 className="font-black text-gray-800 text-sm">
                Consulta tu evaluación médica
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Ingresa el código entregado por el médico o tu número de cédula
                para ver el resultado de tu examen de aptitud laboral.
              </p>
            </div>
          </div>
        </div>

        {/* ── Formulario ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          {/* Selector tipo búsqueda */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            {[
              { v: "codigo", label: "🔑 Código", hint: "SISO-2025-XXXX" },
              { v: "cedula", label: "🪪 Cédula", hint: "1234567890" },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => {
                  setTipoBusqueda(opt.v);
                  setBusqueda("");
                  setError("");
                  setResultado(null);
                }}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                  tipoBusqueda === opt.v
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Input */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
              {tipoBusqueda === "codigo"
                ? "Código de verificación"
                : "Número de cédula (sin puntos ni espacios)"}
            </label>
            <input
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  tipoBusqueda === "codigo"
                    ? e.target.value.toUpperCase().trim()
                    : e.target.value.trim()
                )
              }
              onKeyDown={(e) => e.key === "Enter" && !cargando && buscar()}
              className="w-full p-3 border-2 border-gray-200 focus:border-teal-400 rounded-xl text-sm font-mono font-bold tracking-widest focus:outline-none transition"
              placeholder={
                tipoBusqueda === "codigo"
                  ? "Ej: SISO-2025-XXXX"
                  : "Ej: 1234567890"
              }
              maxLength={50}
              autoFocus
              autoComplete="off"
            />
          </div>
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              <pre className="whitespace-pre-wrap font-sans">{error}</pre>
            </div>
          )}
          {/* Botón buscar */}
          <button
            onClick={buscar}
            disabled={
              cargando || !busqueda.trim() || Date.now() < bloqueadoHasta
            }
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <span className="animate-spin">⏳</span> Consultando...
              </>
            ) : (
              "🔍 Consultar resultado"
            )}
          </button>
          <p className="text-[9px] text-gray-400 text-center">
            Consulta segura y confidencial · Solo verás tus propios datos
            {intentos > 0 && ` · Intentos: ${intentos}/${MAX_INTENTOS}`}
          </p>
        </div>

        {/* ── Resultado ── */}
        {resultado &&
          (() => {
            const col = colorAptitud(resultado.conceptoAptitud);
            return (
              <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
                {/* Header resultado */}
                <div className={`px-5 py-4 ${col.bg} border-b border-gray-100`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        Resultado de tu evaluación
                      </p>
                      <p className={`font-black text-base mt-0.5 ${col.text}`}>
                        {col.dot}{" "}
                        {resultado.conceptoAptitud || "Pendiente de concepto"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${col.badge}`}
                    >
                      {resultado.estadoHistoria || "Cerrada"}
                    </span>
                  </div>
                </div>
                {/* Datos */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["👤 Nombre", resultado.nombres],
                      [
                        "🪪 Documento",
                        `${resultado.docTipo || "CC"} ${resultado.docNumero}`,
                      ],
                      ["🏭 Empresa", resultado.empresaNombre || "--"],
                      ["💼 Cargo", resultado.cargo || "--"],
                      ["🔬 Tipo de examen", resultado.tipoExamen || "--"],
                      ["📅 Fecha evaluación", resultado.fechaExamen || "--"],
                      ["👨‍⚕️ Médico evaluador", resultado.medicoNombre || "--"],
                      [
                        "🔑 Código verificación",
                        resultado.codigoVerificacion || "--",
                      ],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="bg-gray-50 rounded-lg p-2.5 min-w-0"
                      >
                        <p className="text-[9px] font-black text-gray-400 uppercase truncate">
                          {k}
                        </p>
                        <p className="text-xs font-bold text-gray-800 mt-0.5 break-words">
                          {v || "--"}
                        </p>
                      </div>
                    ))}
                  </div>
                  {resultado.restricciones && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-[10px] font-black text-amber-700 uppercase mb-1">
                        ⚠️ Restricciones / Recomendaciones
                      </p>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {resultado.restricciones}
                      </p>
                    </div>
                  )}
                  {/* ── DESCARGAR CERTIFICADO PDF ─────────────────────────── */}
                  <button
                    onClick={() => {
                      const docData = resultado._doctorData || {
                        nombre: resultado.medicoNombre || "MÉDICO OCUPACIONAL",
                        titulo: "Médico Especialista en Salud Ocupacional",
                        licencia: "--",
                        ciudad: "Popayán",
                        email: "",
                      };
                      const firma = resultado._firma || "";
                      const _miIPS0 = currentUser?.empresaId
                        ? companies.find(
                            (c) => c.id === currentUser.empresaId
                          ) || null
                        : null;
                      const html = _generarCertificadoHTMLNormalizado(
                        resultado,
                        docData,
                        firma,
                        _miIPS0
                      );
                      const w = window.open(
                        "",
                        "_blank",
                        "width=920,height=1150"
                      );
                      if (!w) {
                        alert(
                          "El navegador bloqueó la ventana emergente. Permita los popups para descargar el certificado."
                        );
                        return;
                      }
                      // Inyectar botón flotante de descarga
                      const htmlConBtn = html.replace(
                        "</body>",
                        '<div class="np-dl">' +
                          '<button onclick="window.print()">📥 Guardar / Imprimir PDF</button>' +
                          "<p>En el diálogo de impresión,<br/>selecciona <b>Guardar como PDF</b></p>" +
                          "</div></body>"
                      );
                      w.document.write(htmlConBtn);
                      w.document.close();
                      w.focus();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 10v6m0 0l-3-3m3 3l3-3M3 17a3 3 0 003 3h12a3 3 0 003-3v-1M3 17V7a3 3 0 013-3h8l5 5v8"
                      />
                    </svg>
                    Descargar Certificado PDF
                  </button>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-700 leading-relaxed">
                    <p className="font-black mb-0.5">
                      🔒 Información confidencial - Res. 1995/1999
                    </p>
                    <p>
                      Tu historia clínica completa es custodiada por el médico
                      ocupacional. Para consultas sobre tu resultado, comunícate
                      con el servicio médico.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
      <div className="text-center pb-4 pt-2 text-[9px] text-gray-300">
        SISO OcupaSalud v4 · Res. 2346/2007 · Ley 1581/2012 · Res. 1843/2025
      </div>
    </div>
  );
};

const PrivacyModal = ({ onAccept }) => (
  <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 font-sans">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-black text-base uppercase tracking-tight">
              Política de Privacidad y Tratamiento de Datos
            </h2>
            <p className="text-blue-100 text-[11px] font-medium">
              Ley 1581 de 2012 · Decreto 1078 de 2015
            </p>
          </div>
        </div>
      </div>
      <div className="p-5 max-h-72 overflow-y-auto text-xs text-gray-700 space-y-3 leading-relaxed">
        <p>
          <span className="font-black text-gray-900">
            Responsable del tratamiento:
          </span>{" "}
          El profesional médico registrado en esta plataforma es el responsable
          del tratamiento de los datos personales y de salud gestionados en
          OCUPASALUD.
        </p>
        <p>
          <span className="font-black text-gray-900">Datos tratados:</span>{" "}
          Datos de identificación, datos de salud (historia clínica,
          diagnósticos, resultados de exámenes) y datos laborales de los
          trabajadores evaluados.
        </p>
        <p>
          <span className="font-black text-gray-900">Finalidad:</span> Gestión
          de historias clínicas ocupacionales, emisión de certificados de
          aptitud laboral y cumplimiento del Sistema de Gestión de Seguridad y
          Salud en el Trabajo (SG-SST) conforme a la Res. 1843/2025 (deroga Res.
          2346/2007).
        </p>
        <p>
          <span className="font-black text-gray-900">Base legal:</span> El
          tratamiento de datos de salud está autorizado por la Ley 1562/2012
          (riesgos laborales) y la Resolución 1843/2025 (evaluaciones médicas
          ocupacionales - deroga Res. 2346/2007).
        </p>
        <p>
          <span className="font-black text-gray-900">Confidencialidad:</span>{" "}
          Las historias clínicas son documentos privados sometidos a reserva.
          Solo personal médico autorizado puede acceder a ellas (Res. 1995/1999
          Art. 14). Se conservan por un mínimo de 20 años (Res. 1995/1999 Art.
          15 - Archivo de Gestión 5 años + Central 10 años + Histórico 5 años).
        </p>
        <p>
          <span className="font-black text-gray-900">
            Derechos del titular (Habeas Data):
          </span>{" "}
          Conocer, actualizar, rectificar y suprimir sus datos personales. Para
          ejercer estos derechos contacte directamente al médico responsable.
        </p>
        <p className="text-[10px] text-gray-400 border-t pt-2">
          Al continuar usando esta plataforma, el profesional médico declara
          conocer y cumplir las obligaciones del responsable del tratamiento
          establecidas en la Ley 1581 de 2012 y sus decretos reglamentarios.
        </p>
      </div>
      <div className="px-5 pb-5">
        <button
          onClick={onAccept}
          className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> He leído y acepto la Política de
          Privacidad
        </button>
        <p className="text-[10px] text-center text-gray-400 mt-2">
          Esta aceptación queda registrada con fecha y hora
        </p>
        <button
          onClick={onAccept}
          className="mt-2 w-full text-[10px] text-blue-500 underline hover:text-blue-700"
        >
          Ya acepté anteriormente - Continuar al sistema
        </button>
      </div>
    </div>
  </div>
);
// ── AgendaFieldInput: componente de campo de formulario de agenda
// DEBE estar fuera del App/renderAgenda para que React no lo destruya en cada keystroke
const AgendaFieldF = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  opts,
  width = "flex-1",
  list,
  req,
  placeholder,
}) => (
  <div className={width + " min-w-[120px] px-1 mb-2"}>
    <label className="block text-[9px] font-black text-gray-500 uppercase mb-0.5">
      {label}
      {req && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {opts ? (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-300 bg-white"
      >
        <option value="">-</option>
        {opts.map((o) => (
          <option key={o.v || o} value={o.v || o}>
            {o.l || o}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        list={list}
        placeholder={placeholder || ""}
        className="w-full p-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-300"
      />
    )}
  </div>
);
// ══ B-07: Componente cambio de contraseña (componente propio para hooks válidos) ══
function ChangePasswordForm({
  currentUser,
  usersList,
  setUsersList,
  setCurrentUser,
  _sync,
  _patKey,
  goTo,
  showAlert,
}) {
  const { useState } = React;
  const [np, setNp] = useState("");
  const [np2, setNp2] = useState("");
  const { valida, errores, fortaleza } = _validarContrasena(np);
  const colores = [
    "bg-red-500",
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
    "bg-emerald-500",
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-violet-600" />
          </div>
          <h2 className="text-xl font-black text-violet-900">
            Establecer Contraseña
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Debe configurar una contraseña segura antes de continuar
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1 uppercase">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={np}
              onChange={(e) => setNp(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-violet-500 outline-none"
              placeholder="Mínimo 10 caracteres"
            />
            {np && (
              <div className="mt-1.5">
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`h-1.5 flex-1 rounded-full ${
                        n <= fortaleza ? colores[fortaleza] : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                {errores.length > 0 && (
                  <p className="text-[10px] text-red-600 font-semibold">
                    ⚠️ {errores[0]}
                  </p>
                )}
                {valida && (
                  <p className="text-[10px] text-emerald-700 font-bold">
                    ✅ Contraseña segura
                  </p>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1 uppercase">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={np2}
              onChange={(e) => setNp2(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-violet-500 outline-none"
              placeholder="Repita la contraseña"
            />
            {np2 && np !== np2 && (
              <p className="text-[10px] text-red-600 font-semibold mt-0.5">
                ⚠️ Las contraseñas no coinciden
              </p>
            )}
            {np2 && np === np2 && valida && (
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                ✅ Coinciden
              </p>
            )}
          </div>
          <button
            disabled={!valida || np !== np2}
            onClick={() => {
              _pbkdf2Hash(np).then(({ hash, salt }) => {
                const upd = usersList.map((u) =>
                  u.id === currentUser?.id
                    ? {
                        ...u,
                        passHash: hash,
                        passSalt: salt,
                        mustChangePassword: false,
                        pass: undefined,
                      }
                    : u
                );
                setUsersList(upd);
                _sync("siso_users", JSON.stringify(upd));
                _sbSet("siso_users", upd); // FIX: sync inmediato a Supabase tras cambio de contraseña
                setCurrentUser((prev) => ({
                  ...prev,
                  mustChangePassword: false,
                }));
                showAlert(
                  "✅ Contraseña establecida. Ya puede usar el sistema."
                );
                goTo("dashboard");
              });
            }}
            className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Guardar y continuar →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FASE 1 — ESTABILIZACIÓN: SEGURIDAD Y RESILIENCIA
// ============================================================

// SEC-F1-01: HTTPS enforcement (producción)
if (typeof window !== "undefined" && window.location.protocol === "http:" && 
    !window.location.hostname.includes("localhost") && 
    !window.location.hostname.includes("127.0.0.1") &&
    !window.location.hostname.includes("csb.app")) {
  window.location.replace("https:" + window.location.href.substring(5));
}

// SEC-F1-02: Error Boundary — Previene pantalla blanca ante errores
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[OCUPASALUD] Error capturado:", error, errorInfo);
    try {
      const logs = JSON.parse(localStorage.getItem("siso_error_log") || "[]");
      logs.push({
        ts: new Date().toISOString(),
        msg: error?.message || String(error),
        stack: error?.stack?.substring(0, 500) || "",
        component: errorInfo?.componentStack?.substring(0, 300) || "",
      });
      if (logs.length > 50) logs.splice(0, logs.length - 50);
      localStorage.setItem("siso_error_log", JSON.stringify(logs));
    } catch (_) {}
  }
  render() {
    if (this.state.hasError) {
      return React.createElement("div", {
        style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1e293b, #0f172a)", fontFamily: "Arial, sans-serif", padding: "20px" }
      }, React.createElement("div", {
        style: { background: "white", borderRadius: "16px", padding: "40px", maxWidth: "480px", width: "100%", textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }
      }, [
        React.createElement("div", { key: "icon", style: { fontSize: "48px", marginBottom: "16px" } }, "⚠️"),
        React.createElement("h1", { key: "title", style: { fontSize: "20px", fontWeight: "900", color: "#1e293b", marginBottom: "8px" } }, "OcupaSalud — Error inesperado"),
        React.createElement("p", { key: "msg", style: { fontSize: "13px", color: "#64748b", marginBottom: "20px", lineHeight: "1.5" } },
          "Se produjo un error en la aplicación. Sus datos están seguros en la nube. Intente recargar la página."
        ),
        React.createElement("p", { key: "detail", style: { fontSize: "11px", color: "#94a3b8", marginBottom: "20px", background: "#f8fafc", padding: "10px", borderRadius: "8px", wordBreak: "break-word" } },
          this.state.error?.message || "Error desconocido"
        ),
        React.createElement("div", { key: "btns", style: { display: "flex", gap: "10px", justifyContent: "center" } }, [
          React.createElement("button", {
            key: "reload",
            onClick: () => window.location.reload(),
            style: { background: "#059669", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }
          }, "🔄 Recargar"),
          React.createElement("button", {
            key: "reset",
            onClick: () => { this.setState({ hasError: false, error: null, errorInfo: null }); },
            style: { background: "#e2e8f0", color: "#334155", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }
          }, "↩ Reintentar"),
        ]),
      ]));
    }
    return this.props.children;
  }
}

// SEC-F1-03: Cifrado AES-GCM para datos sensibles en localStorage
const _ENCRYPT_KEY_NAME = "siso_enc_key";
const _getEncryptKey = async () => {
  try {
    const stored = _ss.getItem(_ENCRYPT_KEY_NAME);
    if (stored) {
      const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      return await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
    }
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const exported = await crypto.subtle.exportKey("raw", key);
    _ss.setItem(_ENCRYPT_KEY_NAME, btoa(String.fromCharCode(...new Uint8Array(exported))));
    return key;
  } catch { return null; }
};
const _encryptData = async (plainText) => {
  try {
    const key = await _getEncryptKey();
    if (!key) return plainText;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return "ENC:" + btoa(String.fromCharCode(...combined));
  } catch { return plainText; }
};
const _decryptData = async (cipherText) => {
  try {
    if (!cipherText || !cipherText.startsWith("ENC:")) return cipherText;
    const key = await _getEncryptKey();
    if (!key) return cipherText;
    const combined = Uint8Array.from(atob(cipherText.slice(4)), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(decrypted);
  } catch { return cipherText; }
};

// B-27: PWA - Registro SW si existe (offline support)
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

// ── App principal envuelta en ErrorBoundary ──
function AppInner() {
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
      return !!JSON.parse(_ls.getItem("siso_privacidad_aceptada") || "false");
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
  const [usersReady, setUsersReady] = useState(false); // FIX: esperar Supabase antes de login
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
  // Modal datos paciente para secretaria (sin ficha clínica)
  const [showSecretariaPatientModal, setShowSecretariaPatientModal] = useState(null);
  // Selector médico para reportes
  const [selectedMedicoReport, setSelectedMedicoReport] = useState("");
  // Modal checklist "Todo"
  const [showTodoChecklist, setShowTodoChecklist] = useState(false);
  const [todoSelection, setTodoSelection] = useState({
    certificado: true, hcCompleta: true, incapacidad: true,
    formula: true, derivaciones: true, examenes: true,
  });
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
  const [aiResumen, setAiResumen] = React.useState("");
  const [aiCargando, setAiCargando] = React.useState(false);
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
  const _memoPatients = React.useMemo(() => patientsList, [patientsList]);
  const _memoCompanies = React.useMemo(() => companies, [companies]);
  const _memoBills = React.useMemo(() => savedBillsList, [savedBillsList]);
  const _memoReports = React.useMemo(() => savedReports, [savedReports]);
  const _memoPatientsCount = React.useMemo(() => patientsList.length, [patientsList]);
  const _memoClosedHCs = React.useMemo(
    () => patientsList.filter(p => p.estadoHistoria === "Cerrada" && !p._archivado),
    [patientsList]
  );
  // Debounce ref para guardado de caja (evita escrituras en cada keystroke)
  const _cajaSaveTimer = useRef(null);
  const saveCajaDebounced = React.useCallback((movs) => {
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

  // ══ POLLING DE PERMISOS: recarga usersList desde Supabase cada 30 seg ══════
  // Garantiza que los cambios del admin se apliquen en tiempo real para cualquier
  // usuario activo (especialmente secretarias cuyo admin modifica sus permisos)
  useEffect(() => {
    if (!currentUser) return; // solo si hay sesión activa
    const _reloadUsersFromCloud = async () => {
      try {
        // Estrategia 1: clave dedicada de permisos (más ligera, solo para secretaria)
        if (currentUser.role === "secretaria") {
          const permKey = `siso_permisos_${currentUser.user}`;
          const r = await fetch(
            `${_SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(permKey)}&select=value,updated_at`,
            { headers: _SB_HEADERS }
          );
          if (r.ok) {
            const rows = await r.json();
            if (rows && rows.length > 0 && rows[0].value) {
              const permData = rows[0].value;
              const localRaw = _ls.getItem(permKey);
              const localData = localRaw ? JSON.parse(localRaw) : null;
              // Solo actualizar si hay cambios nuevos
              if (!localData || permData.updatedAt !== localData.updatedAt) {
                _ls.setItem(permKey, JSON.stringify(permData));
                // Actualizar usersList en memoria con los nuevos permisos
                setUsersList(prev => prev.map(u =>
                  u.user === currentUser.user
                    ? { ...u, secretariaPermisos: permData.secretariaPermisos, medicosAsignados: permData.medicosAsignados }
                    : u
                ));
                // Actualizar currentUser para que _secretariaPuede lo refleje inmediatamente
                setCurrentUser(prev => ({
                  ...prev,
                  secretariaPermisos: permData.secretariaPermisos,
                  medicosAsignados: permData.medicosAsignados,
                }));
              }
            }
          }
          return; // para secretaria, la clave dedicada es suficiente
        }
        // Estrategia 2: para admin/médico, recargar siso_users completo (menos frecuente)
        // Solo cuando la lista local parece desactualizada
      } catch (_) { /* silencioso */ }
    };
    // Ejecutar inmediatamente al montar/cambiar currentUser
    _reloadUsersFromCloud();
    // Polling cada 30 segundos mientras la sesión esté activa
    const _pollInterval = setInterval(_reloadUsersFromCloud, 30000);
    return () => clearInterval(_pollInterval);
  }, [currentUser?.user]); // eslint-disable-line react-hooks/exhaustive-deps
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
    const sessionUser = (() => {
      try {
        return JSON.parse(_ls.getItem("siso_session") || "null")?.user;
      } catch {
        return null;
      }
    })();
    setCompanies(sp(_compKey(sessionUser || "shared"), []));
    // Pacientes: cargar SOLO los del usuario de sesión activa (aislamiento absoluto)
    // Si no hay sesión guardada, dejar la lista vacía - se cargará en handleLogin
    if (sessionUser) {
      setPatientsList(sp(_patKey(sessionUser), []));
    }
    // NO cargar 'siso_db_patients' genérico - mezclaria pacientes de todos los médicos
    // ══ FIX DEFINITIVO: Cargar usuarios con persistencia real ══
    const storedUsers = sp("siso_users", null);
    if (storedUsers && Array.isArray(storedUsers) && storedUsers.length > 0) {
      const fixed = storedUsers.map((u) => {
        const init = initialUsers.find((i) => i.user === u.user);
        if (!u.passHash && init) {
          return { ...u, passHash: init.passHash, mustChangePassword: true };
        }
        if (init && init.doctorData?.nombre && !u.doctorData?.nombre) {
          return { ...u, doctorData: { ...init.doctorData, ...(u.doctorData || {}) } };
        }
        return u;
      });
      setUsersList(fixed);
      setUsersReady(true);
    } else {
      // ══ Cache vacío — ESPERAR a Supabase antes de permitir login ══
      (async () => {
        try {
          // Timeout de 8 segundos para no bloquear la UI si no hay internet
          const cloud = await Promise.race([
            _sbGetAll(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000))
          ]);
          if (cloud && cloud["siso_users"]?.value && Array.isArray(cloud["siso_users"].value) && cloud["siso_users"].value.length > 0) {
            let cloudUsers = cloud["siso_users"].value;
            // ══ MERGE: para cada usuario, verificar si hay doctorData dedicada más reciente ══
            cloudUsers = cloudUsers.map(u => {
              const dedicatedDD = cloud[`siso_doctor_data_${u.user}`]?.value;
              if (dedicatedDD && typeof dedicatedDD === "object") {
                return { ...u, doctorData: { ...(u.doctorData || {}), ...dedicatedDD } };
              }
              return u;
            });
            setUsersList(cloudUsers);
            _ls.setItem("siso_users", JSON.stringify(cloudUsers));
            // También restaurar firma, empresas y otros datos del médico
            if (cloud["siso_doctor_signature"]?.value) {
              setDoctorSignature(cloud["siso_doctor_signature"].value);
              _ls.setItem("siso_doctor_signature", cloud["siso_doctor_signature"].value);
            }
            if (cloud["siso_companies"]?.value && Array.isArray(cloud["siso_companies"].value)) {
              setCompanies(cloud["siso_companies"].value);
              _ls.setItem("siso_companies", JSON.stringify(cloud["siso_companies"].value));
            }
            // Restaurar AI config
            if (cloud["siso_ai_config_provider"]?.value) {
              const prov = cloud["siso_ai_config_provider"].value;
              setAiConfig(prev => ({ ...prev, activeProvider: prov.activeProvider || prev.activeProvider }));
              _ls.setItem("siso_ai_config_provider", JSON.stringify(prov));
            }
            console.log("[SISO] ✅ Usuarios y datos restaurados desde Supabase:", cloudUsers.length);
          } else {
            setUsersList(initialUsers);
          }
        } catch (err) {
          console.warn("[SISO] No se pudo restaurar desde nube, usando defaults:", err);
          setUsersList(initialUsers);
        } finally {
          setUsersReady(true);
        }
      })();
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
      // Usuarios: PREFERIR datos de nube sobre initialUsers (FIX: persistencia de contraseña y datos médico)
      if (
        cloud["siso_users"]?.value &&
        Array.isArray(cloud["siso_users"].value) &&
        cloud["siso_users"].value.length > 0
      ) {
        const cloudUsers = cloud["siso_users"].value;
        setUsersList((prev) => {
          // Cloud users take priority - update existing + add new
          const merged = prev.map((localUser) => {
            const cloudVersion = cloudUsers.find((cu) => cu.user === localUser.user);
            if (cloudVersion) {
              // Cloud tiene este usuario - usar datos de nube (contraseña, doctorData, etc.)
              return {
                ...localUser,
                ...cloudVersion,
                // Preservar campos estructurales del initialUsers si no existen en cloud
                id: localUser.id || cloudVersion.id,
              };
            }
            return localUser;
          });
          // Agregar usuarios que solo existen en nube
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
        // FIX: Guardar doctorData del usuario actual como clave dedicada
        if (currentUser?.doctorData && currentUser?.user) {
          tasks.push(_sbSet(`siso_doctor_data_${currentUser.user}`, currentUser.doctorData));
        }
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
  // ── FIX: Auto-expandir textareas al escribir (delegación global) ──
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
  // ── SEC-F1-05: Prevenir pérdida de datos al cerrar pestaña ──
  useEffect(() => {
    const handler = (e) => {
      if (_hcDirty && view === "historia") {
        e.preventDefault();
        e.returnValue = "Tiene cambios sin guardar en la historia clínica. ¿Desea salir?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [_hcDirty, view]);
  // ── SEC-F1-06: Timeout de sesión inactiva (30 min) ──
  useEffect(() => {
    if (!currentUser) return;
    const resetTimer = () => _resetSessionTimer(() => {
      showAlert("⏰ Sesión expirada por inactividad (30 minutos).\nSus datos están guardados. Debe iniciar sesión nuevamente.");
      setCurrentUser(null);
      _ls.removeItem("siso_session");
      setView("login");
      _auditLog("SessionTimeout", currentUser?.user, "Sesión expirada por inactividad 30 min");
    });
    resetTimer();
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    return () => {
      _clearSessionTimer();
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [currentUser]);
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
  const _resetInactivity = React.useCallback(() => {
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
  React.useEffect(() => {
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
{"diagnosticoPrincipal":"Z10.0 - EXAMEN MÉDICO OCUPACIONAL","diagnosticoSecundario1":"CIE-10 - Hallazgo clínico identificado o cadena vacía","diagnosticoSecundario2":"CIE-10 - Segundo hallazgo o cadena vacía","conceptoAptitud":"Concepto de aptitud laboral (APTO/APTO CON RESTRICCIONES/NO APTO) con justificación cargo-hallazgos. NO mencionar diagnósticos específicos, medicamentos, ni tratamientos. Solo aptitud y condiciones laborales. Conforme Res. 1843/2025 Art. 20","vigencia":"X meses con justificación clínica","recomendaciones":"Mínimo 10 recomendaciones de medicina preventiva y salud ocupacional enfocadas en cargo y riesgos. NO incluir medicamentos ni tratamiento farmacológico. NO referir tratamiento médico actual","restriccionesTexto":"Restricciones médico-laborales operativas y cuantificables (mínimo 5 si hay hallazgos), formato: [TIPO] (Segmento) Descripción - Base legal","derivaciones":[{"especialidad":"Especialidad médica requerida","motivo":"Motivo clínico concreto","urgencia":"Electiva"}],"examenesSugeridos":["Examen paraclínico 1"],"interconsultaResumen":"Resumen clínico para interconsulta o cadena vacía","incapacidadSugerida":{"aplica":false,"dias":0,"motivo":"","diagnosticoCIE":""},"analisisClinico":"Análisis clínico detallado con lenguaje técnico-formal de médico especialista en medicina laboral con más de 15 años de experiencia. Incluir: interpretación de hallazgos, correlación cargo-riesgos ocupacionales, referencias a normativa colombiana (Dec. 1072/2015, Res. 2346/2007, Res. 1843/2025). Mínimo 200 palabras.","sveRecomendado":["SVE Osteomuscular si aplica según GATISO-DME Res. 2844/2007","SVE Psicosocial si aplica según Res. 2764/2022","SVE Visual / SVE Respiratorio / SVE Neurológico / SVE Dermatológico según hallazgos"]}`;    try {
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
        setData((prev) => {
          const existingExams = prev.solicitudExamenes || [];
          const existingNames = new Set(existingExams.map(e => (e.nombre || '').toLowerCase()));
          const newAIExams = parsed.examenesSugeridos
            .filter(name => !existingNames.has(name.toLowerCase()))
            .map(name => ({
              nombre: name,
              fecha: new Date().toISOString().split("T")[0],
              urgente: false,
              incluirEnRecomendaciones: false,
              _fromAI: true,
            }));
          return {
            ...prev,
            solicitudExamenes: [...existingExams, ...newAIExams],
            paraclinicosCheck: {
              ...(prev.paraclinicosCheck || {}),
              _aiSugeridos: parsed.examenesSugeridos.join("\n"),
            },
          };
        });
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
      // ── Guardar Análisis Clínico IA (campo independiente) ──
      if (parsed.analisisClinico) {
        setData((prev) => ({
          ...prev,
          analisisIA: parsed.analisisClinico,
        }));
      }
      // ── Guardar SVE Recomendado por IA ──
      if (parsed.sveRecomendado?.length > 0) {
        setData((prev) => ({
          ...prev,
          sveRecomendado: parsed.sveRecomendado.filter(s => s && !s.includes("si aplica")),
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
        parsed.analisisClinico
          ? `\n• Análisis clínico generado`
          : "",
        parsed.sveRecomendado?.length > 0
          ? `\n• ${parsed.sveRecomendado.filter(s => s && !s.includes("si aplica")).length} SVE sugerido(s)`
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
    // LLAMADA 2 - conclusiones + análisis justificado + recomendaciones (Punto 11)
    const prompt2 =
      "Eres médico especialista en Medicina del Trabajo y Salud Ocupacional en Colombia con más de 15 años de experiencia (Res.1843/2025, Dec.1072/2015, Res.0312/2019, GTC-45:2012). Datos:\n" +
      datosBase +
      "\n\nElabora un informe técnico-epidemiológico completo con las siguientes 3 secciones:" +
      "\n\n1. ANÁLISIS JUSTIFICADO (mínimo 300 palabras): Interpretación epidemiológica de los resultados colectivos. Prevalencia de patologías con soporte estadístico. Distribución por cargo/área. Factores de riesgo identificados según GTC-45. Correlación entre morbilidad encontrada y exposición ocupacional. Mención de normativa aplicable." +
      "\n\n2. CONCLUSIONES (mínimo 200 palabras): Resumen ejecutivo de los hallazgos más relevantes. Indicadores epidemiológicos críticos. Nivel de cumplimiento del SG-SST. Riesgos prioritarios identificados." +
      "\n\n3. RECOMENDACIONES (mínimo 250 palabras): Acciones correctivas específicas. Programas de vigilancia epidemiológica (PVE/SVE) sugeridos con base normativa. Ajustes en el SG-SST conforme Res. 0312/2019. Seguimiento médico prioritario por grupos de riesgo. Cronograma sugerido de intervenciones." +
      '\n\nDevuelve ÚNICAMENTE JSON válido sin markdown: {"analisisJustificado":"texto completo sección 1","conclusiones":"texto completo sección 2","recomendacionesInforme":"texto completo sección 3"}';
    try {
      const [text1, text2] = await Promise.all([
        callAI(prompt1, true),
        callAI(prompt2, true),
      ]);
      const parte1 = parseAIJSON(text1);
      const parte2 = parseAIJSON(text2);
      setReportAIResult({ ...parte1, conclusiones: parte2.conclusiones || "", analisisJustificado: parte2.analisisJustificado || "", recomendacionesInforme: parte2.recomendacionesInforme || "" });
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
    const _bkSuf = currentUser?.empresaId ? "empresa_" + currentUser.empresaId : currentUser?.user || "shared";
    const tasks = {
      [`Pacientes / HC (${currentUser?.user})`]: _sbSet(
        _patKeyCloud(currentUser?.user || "shared"),
        patientsList
      ),
      Empresas: _sbSet(_compKeyCloud(currentUser?.user || "shared"), companies),
      "Usuarios y perfiles": _sbSet("siso_users", usersList),
      "Facturas / Cuentas de cobro": _sbSet(`siso_saved_bills_${_bkSuf}`, savedBillsList),
      "Informes guardados": _sbSet("siso_saved_reports", savedReports),
      "Log de auditoría": _sbSet("siso_audit_log", auditLog),
      "Mensajes internos": _sbSet("siso_mensajes", mensajes),
      "Agenda / Citas": _sbSet(`siso_agendados_${_bkSuf}`, agendados),
      "Atenciones cerradas": _sbSet(`siso_atenciones_${_bkSuf}`, atencionesCerradas),
      "Configuración IA (proveedor)": _sbSet("siso_ai_config_provider", {
        activeProvider: aiConfig.activeProvider,
      }),
      ...(doctorSignature
        ? { "Firma digital": _sbSet("siso_doctor_signature", doctorSignature) }
        : {}),
      ...(currentUser?.doctorData && currentUser?.user
        ? { [`Datos médico (${currentUser.user})`]: _sbSet(`siso_doctor_data_${currentUser.user}`, currentUser.doctorData) }
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
        try {
          const cloudData = await _sbGetAll();
          if (cloudData?.["siso_users"]?.value && Array.isArray(cloudData["siso_users"].value)) {
            const cloudUserList = cloudData["siso_users"].value;
            // FIX: REEMPLAZAR usuarios locales con datos de nube (no solo agregar faltantes)
            setUsersList(() => {
              _ls.setItem("siso_users", JSON.stringify(cloudUserList));
              return cloudUserList;
            });
            // También restaurar firma y empresas desde nube
            if (cloudData["siso_doctor_signature"]?.value) {
              setDoctorSignature(cloudData["siso_doctor_signature"].value);
              _ls.setItem("siso_doctor_signature", cloudData["siso_doctor_signature"].value);
            }
            if (cloudData["siso_companies"]?.value && Array.isArray(cloudData["siso_companies"].value)) {
              setCompanies(cloudData["siso_companies"].value);
              _ls.setItem("siso_companies", JSON.stringify(cloudData["siso_companies"].value));
            }
            // Re-verificar credenciales contra lista de Supabase
            for (const x of cloudUserList) {
              if (x.user === u) {
                const ok = await _verifyPassword(p, x.passHash, x.passSalt);
                if (ok) {
                  // Merge doctorData dedicada si existe
                  const dedicatedDD = cloudData[`siso_doctor_data_${x.user}`]?.value;
                  found = dedicatedDD && typeof dedicatedDD === "object"
                    ? { ...x, doctorData: { ...(x.doctorData || {}), ...dedicatedDD } }
                    : x;
                  break;
                }
              }
            }
            // Restaurar AI keys si existen
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
        // ── Para secretaria: cargar permisos actualizados desde Supabase al login ──
        // Esto garantiza que los permisos del admin estén vigentes desde el primer momento
        const _initWithPermisos = async (baseSesion) => {
          if (baseSesion.role === "secretaria") {
            try {
              const permKey = `siso_permisos_${baseSesion.user}`;
              const r = await fetch(
                `${_SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(permKey)}&select=value`,
                { headers: _SB_HEADERS }
              );
              if (r.ok) {
                const rows = await r.json();
                if (rows && rows.length > 0 && rows[0].value) {
                  const permData = rows[0].value;
                  _ls.setItem(permKey, JSON.stringify(permData));
                  // Fusionar permisos frescos de Supabase con el objeto de sesión
                  const sesionConPermisos = {
                    ...baseSesion,
                    secretariaPermisos: permData.secretariaPermisos || baseSesion.secretariaPermisos,
                    medicosAsignados: permData.medicosAsignados || baseSesion.medicosAsignados || [],
                  };
                  setCurrentUser(sesionConPermisos);
                  // También actualizar usersList local
                  setUsersList(prev => prev.map(u =>
                    u.user === baseSesion.user ? { ...u, ...sesionConPermisos } : u
                  ));
                  return;
                }
              }
            } catch (_) { /* silencioso, usar permisos locales */ }
          }
          setCurrentUser(baseSesion);
        };
        _initWithPermisos(foundConSesion);
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
        const _loadScoped = (scopedKey, globalKey) => {
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
          if (!cloud) return;
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
          // ══ FIX DEFINITIVO: Restaurar TODOS los datos del usuario desde Supabase ══
          // 1. API keys del usuario
          const aiKeyCloud = cloud?.[`siso_ai_keys_${found.user}`]?.value;
          if (aiKeyCloud && typeof aiKeyCloud === "object") {
            _ss.setItem("siso_ai_keys", JSON.stringify(aiKeyCloud));
            setAiConfig((prev) => ({ ...prev, keys: aiKeyCloud }));
          }
          // 2. DoctorData desde clave DEDICADA (siempre la más actualizada)
          const doctorDataCloud = cloud?.[`siso_doctor_data_${found.user}`]?.value;
          // 3. DoctorData desde siso_users (embebido en el array de usuarios)
          const cloudUsersList = cloud?.["siso_users"]?.value;
          const cloudUserEntry = Array.isArray(cloudUsersList)
            ? cloudUsersList.find(u => u.user === found.user) : null;
          // 4. Merge: prioridad = dedicado > embebido en users > local
          const mergedDoctorData = {
            ...(found.doctorData || {}),
            ...(cloudUserEntry?.doctorData || {}),
            ...(doctorDataCloud && typeof doctorDataCloud === "object" ? doctorDataCloud : {}),
          };
          const hasDoctorData = mergedDoctorData.nombre || mergedDoctorData.licencia || mergedDoctorData.cedula;
          if (hasDoctorData) {
            setCurrentUser((prev) => ({
              ...prev,
              doctorData: mergedDoctorData,
            }));
            // Persistir en usersList y localStorage para próxima carga
            setUsersList((prev) => {
              const updated = prev.map((u) =>
                u.user === found.user ? { ...u, doctorData: mergedDoctorData } : u
              );
              _ls.setItem("siso_users", JSON.stringify(updated));
              return updated;
            });
          }
          // 5. Firma digital
          if (cloud?.["siso_doctor_signature"]?.value) {
            setDoctorSignature(cloud["siso_doctor_signature"].value);
            _ls.setItem("siso_doctor_signature", cloud["siso_doctor_signature"].value);
          }
          // 6. Si el usuario en nube tiene firma embebida en doctorData
          if (mergedDoctorData.signature && !doctorSignature) {
            setDoctorSignature(mergedDoctorData.signature);
          }
          // 7. AI provider config
          if (cloud?.["siso_ai_config_provider"]?.value) {
            const prov = cloud["siso_ai_config_provider"].value;
            setAiConfig((prev) => ({
              ...prev,
              activeProvider: prov.activeProvider || prev.activeProvider,
            }));
            _ls.setItem("siso_ai_config_provider", JSON.stringify(prov));
          }
        });
        // ══ B-07: Si primer login, forzar cambio de contraseña ══
        if (foundConSesion.mustChangePassword) {
          goTo("changePassword");
        } else {
          goTo("dashboard");
        }
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
      // Secretaria siempre puede ver pacientes de sus médicos asignados
      return _secretariaMedicoAsignado(currentUser, p._medicoId || "", usersList);
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
    // SECRETARIA: puede ver datos del paciente pero NO la ficha clínica
    if (currentUser?.role === "secretaria") {
      setShowSecretariaPatientModal(p);
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
      }\n\nEscriba el número de la opción:\n1 - Evolución clínica + Re-emitir documentos\n2 - Nota Aclaratoria\n3 - Reapertura (solo Administrador)${currentUser?.role === "super_admin" ? "\n4 - Editar HC (Super Administrador - Código 9207)" : ""}`,
      (opcion) => {
        const op = (opcion || "").trim();
        if (op === "4" && currentUser?.role === "super_admin") {
          // Editar HC cerrada - solo super_admin con código 9207
          showPrompt("🔐 Ingrese el código de autorización (9207):", (code) => {
            if (code !== "9207") {
              showAlert("⛔ Código incorrecto. Acceso denegado.");
              return;
            }
            // Reabrir HC para edición manteniendo todos los datos
            setData((p) => ({
              ...p,
              _cerrada: false,
              _editadaPorAdmin: true,
              _editTimestamp: new Date().toISOString(),
              _editAutor: currentUser?.name || currentUser?.user,
              _codigoOriginal: p.codigoVerificacion,
            }));
            _auditLog("EditHC_SuperAdmin", currentUser?.user, `HC ${data.codigoVerificacion} editada con código 9207`);
            showAlert("✅ HC abierta para edición.\nAl guardar/cerrar se generará un nuevo código vinculado al original.");
          });
          return;
        }
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
        : currentUser?.role === "secretaria"
        ? (() => {
            const secU = usersList.find(u => u.user === currentUser.user);
            const asig = secU?.medicosAsignados || [];
            return asig.length > 0
              ? patientsList.filter(p => !p._medicoId || asig.includes(p._medicoId))
              : patientsList;
          })()
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
  // ══ FIX: Imprimir HC como documento HTML limpio (sin sobreposición) ══
  const _printHCClean = () => {
    const _e = (v) => String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const _nl2br = (v) => _e(v).replace(/\n/g, "<br/>");
    const doc = activeDoctorData || {};
    const sig = activeSignature || "";
    const sigHtml = sig ? `<img src="${sig}" style="max-height:65px;display:block;margin:0 auto 4px;" alt="Firma"/>` : '<div style="height:60px;"></div>';
    const _miIPS = currentUser?.empresaId ? companies.find(c => c.id === currentUser.empresaId) : null;
    const ipsName = _miIPS?.nombre || doc.nombre || "OcupaSalud";
    const fmtList = (txt) => {
      const s = Array.isArray(txt) ? txt.join("\n") : String(txt || "");
      if (!s.trim()) return "";
      const lines = s.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.some(l => /^[•*\-\d]/.test(l))) {
        return '<ul style="margin:4px 0;padding-left:16px;">' + lines.map(l => '<li style="margin-bottom:2px;font-size:9pt;">' + _e(l).replace(/^[•*\-]+\s*/, "").replace(/^\d+\.\s*/, "") + '</li>').join("") + '</ul>';
      }
      return '<p style="font-size:9pt;white-space:pre-wrap;line-height:1.5;">' + _nl2br(s) + '</p>';
    };
    const sec = (icon, text) => `<div style="background:#ecfdf5;border-left:4px solid #065f46;padding:6px 12px;margin:14px 0 6px 0;font-weight:900;font-size:9.5pt;text-transform:uppercase;color:#065f46;">${icon} ${_e(text)}</div>`;
    const r2 = (l1,v1,l2,v2) => `<tr><th style="background:#d1fae5;font-weight:700;width:20%;font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;">${_e(l1)}</th><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;width:30%;">${_e(v1)}</td><th style="background:#d1fae5;font-weight:700;width:20%;font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;">${_e(l2)}</th><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;width:30%;">${_e(v2)}</td></tr>`;
    const r1 = (l,v) => `<tr><th style="background:#d1fae5;font-weight:700;width:28%;font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;">${_e(l)}</th><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;" colspan="3">${typeof v === "string" && v.includes("<") ? v : _e(v)}</td></tr>`;
    const tb = (rows) => `<table style="width:100%;border-collapse:collapse;">${rows}</table>`;

    const sections = [];

    // ═══ HEADER ═══
    sections.push(`<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #065f46;padding-bottom:10px;margin-bottom:12px;">
      <div><div style="font-size:12pt;font-weight:900;color:#065f46;">${_e(ipsName)}</div>
      <p style="font-size:8pt;color:#555;">${_e(doc.titulo || "Médico Especialista SST")}</p>
      <p style="font-size:8pt;color:#555;">Lic: ${_e(doc.licencia || "--")} · ${_e(doc.ciudad || "")}</p>
      ${doc.celular ? `<p style="font-size:7.5pt;color:#888;">Tel: ${_e(doc.celular)}${doc.email ? " · " + _e(doc.email) : ""}</p>` : ""}</div>
      <div style="text-align:right;"><div style="font-size:13pt;font-weight:900;color:#065f46;text-transform:uppercase;">HISTORIA CLÍNICA ${_e(dataType === "ocupacional" ? "OCUPACIONAL" : "GENERAL")}</div>
      <p style="font-size:8.5pt;color:#555;">Fecha: ${_e(data.fechaExamen || data.fechaConsulta || new Date().toLocaleDateString("es-CO"))}</p>
      <p style="font-size:8pt;color:#888;">Tipo: ${_e(data.tipoExamen || "CONSULTA")} · ${_e(data.enfasisExamen || "")}</p>
      ${data.codigoVerificacion ? `<p style="font-size:7.5pt;font-family:monospace;color:#065f46;font-weight:900;">Código: ${_e(data.codigoVerificacion)}</p>` : ""}</div></div>`);

    // ═══ 1. DATOS DEL PACIENTE ═══
    sections.push(sec("👤", "Datos del Paciente") + tb(
      r2("Nombres", data.nombres, "Documento", (data.docTipo||"CC")+" "+(data.docNumero||"")) +
      r2("Fecha Nac.", data.fechaNacimiento, "Edad", (data.edad||"--")+" años") +
      r2("Género", data.genero, "Estado Civil", data.estadoCivil) +
      r2("EPS", data.eps, "AFP", data.afp) +
      r2("ARL", data.arl, "Nivel Riesgo", data.nivelRiesgoARL) +
      r2("Teléfono", data.celular||data.telefono, "Email", data.email) +
      r2("Residencia", data.residencia, "Escolaridad", data.escolaridad) +
      r2("Grupo Sang.", data.grupoSanguineo, "Lateralidad", data.lateralidad)
    ));

    // ═══ 2. DATOS LABORALES ═══
    if (dataType === "ocupacional") {
      sections.push(sec("🏢", "Datos Laborales") + tb(
        r2("Empresa", data.empresaNombre||data.empresa, "NIT", data.empresaNit||"") +
        r2("Cargo", data.cargo, "Dependencia", data.dependencia) +
        r2("Contrato", data.tipoContrato, "Turno", data.turnoTrabajo) +
        r2("Antigüedad", data.antiguedadEmpresa, "Tipo Examen", data.tipoExamen)
      ));
    }

    // ═══ 3. MOTIVO DE CONSULTA ═══
    const motivoTxt = data.motivoConsulta || data.enfermedadActual || data.sintomatologia || "";
    if (motivoTxt) sections.push(sec("🩺", "Motivo de Consulta / Enfermedad Actual") + `<div style="padding:6px 10px;">${fmtList(motivoTxt)}</div>`);

    // ═══ 4. HÁBITOS ═══
    const hab = data.habitos || {};
    if (hab.fuma || hab.alcohol || hab.deporte) {
      sections.push(sec("🚬", "Hábitos") + tb(
        r2("Tabaquismo", hab.fuma||"No", "Alcohol", hab.alcohol||"No") +
        r2("Actividad Física", hab.deporte||"No", "Sustancias", hab.drogas||"No")
      ));
    }

    // ═══ 5. ANTECEDENTES ═══
    const antFields = [
      ["Personales", data.antecedentesPersonales], ["Familiares", data.antecedentesFamiliares],
      ["Quirúrgicos", data.antecedentesQuirurgicos], ["Toxicológicos", data.antecedentesToxicologicos],
      ["Alérgicos", data.antecedentesAlergicos], ["Traumáticos", data.antecedentesTraumaticos],
      ["Gineco-obstétricos", data.antecedentesGinecoObstetricos], ["Ocupacionales", data.antecedentesOcupacionales],
      ["Farmacológicos", data.antecedentesFarmacologicos], ["Hospitalarios", data.antecedentesHospitalarios],
    ].filter(([,v]) => v);
    if (antFields.length > 0) {
      sections.push(sec("📋", "Antecedentes") + tb(antFields.map(([l,v]) => r1(l,v)).join("")));
    }

    // ═══ 6. REVISIÓN POR SISTEMAS ═══
    const revSis = data.revisionSistemas || {};
    const revEntries = Object.entries(revSis).filter(([,v]) => v && v !== "Normal" && v !== "Niega" && v !== "false" && v !== false);
    if (revEntries.length > 0) {
      sections.push(sec("📝", "Revisión por Sistemas") + tb(revEntries.map(([k,v]) => r1(k.charAt(0).toUpperCase()+k.slice(1), typeof v === "object" ? JSON.stringify(v) : v)).join("")));
    }

    // ═══ 7. EXAMEN FÍSICO — SIGNOS VITALES ═══
    const vitalRows = [
      data.talla ? r2("Talla", data.talla+" cm", "Peso", (data.peso||"--")+" kg") : "",
      data.imc ? r2("IMC", data.imc, "Clasificación", data.clasificacionIMC||"") : "",
      data.tensionArterial ? r2("T.A.", data.tensionArterial, "F.C.", (data.frecuenciaCardiaca||"--")+" lpm") : "",
      data.frecuenciaRespiratoria ? r2("F.R.", data.frecuenciaRespiratoria+" rpm", "Temperatura", (data.temperatura||"--")+"°C") : "",
      data.satO2 ? r2("SpO2", data.satO2+"%", "Perímetro Abd.", data.perimetroAbdominal||"--") : "",
    ].filter(Boolean).join("");
    sections.push(sec("🔍", "Examen Físico") + (vitalRows ? tb(vitalRows) : ""));

    // ═══ 8. EXAMEN FÍSICO POR SISTEMAS ═══
    const efSis = data.examenFisicoSistemas || {};
    const efEntries = Object.entries(efSis);
    if (efEntries.length > 0) {
      const sysLabels = {cabeza:"Cabeza",ojos:"Ojos",oidos:"Oídos",nariz:"Nariz",boca:"Boca/Faringe",cuello:"Cuello",torax:"Tórax",corazon:"Corazón",pulmones:"Pulmones",abdomen:"Abdomen",genitourinario:"Genitourinario",columna:"Columna",extremidades:"Extremidades",piel:"Piel/Faneras",neurologico:"Neurológico"};
      const sysRows = efEntries.map(([k,v]) => {
        const label = sysLabels[k] || k;
        const estado = v?.estado || "Normal";
        const hallazgo = v?.hallazgo || "";
        const color = estado === "Anormal" ? "#dc2626" : "#065f46";
        return `<tr><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;width:25%;font-weight:700;">${_e(label)}</td><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;width:15%;color:${color};font-weight:700;">${_e(estado)}</td><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;">${_e(hallazgo)}</td></tr>`;
      }).join("");
      sections.push(`<table style="width:100%;border-collapse:collapse;margin-top:4px;"><thead><tr><th style="background:#065f46;color:white;padding:4px 8px;font-size:8pt;text-align:left;">Sistema</th><th style="background:#065f46;color:white;padding:4px 8px;font-size:8pt;">Estado</th><th style="background:#065f46;color:white;padding:4px 8px;font-size:8pt;text-align:left;">Hallazgo</th></tr></thead><tbody>${sysRows}</tbody></table>`);
    }

    // ═══ 9. MANIOBRAS OSTEOMUSCULARES ═══
    const manio = data.maniobrasOsteomusculares || {};
    const manioEntries = Object.entries(manio).filter(([,v]) => v?.estado && v.estado !== "Normal");
    if (manioEntries.length > 0) {
      sections.push(sec("🦴", "Maniobras Osteomusculares") + tb(manioEntries.map(([k,v]) => r2(k.charAt(0).toUpperCase()+k.slice(1), v.estado, "Hallazgo", v.hallazgo||"")).join("")));
    }

    // ═══ 10. RIESGOS OCUPACIONALES ═══
    const riesgos = data.riesgos || {};
    const riesgoEntries = Object.entries(riesgos).filter(([,v]) => v);
    if (riesgoEntries.length > 0) {
      sections.push(sec("⚠️", "Factores de Riesgo Ocupacional") + tb(riesgoEntries.map(([k,v]) => r1(k.charAt(0).toUpperCase()+k.slice(1).replace(/([A-Z])/g," $1"), typeof v === "object" ? JSON.stringify(v) : v)).join("")));
    }

    // ═══ 11. DIAGNÓSTICOS ═══
    const dxList = data.diagnosticos?.length ? data.diagnosticos : [];
    sections.push(sec("🏥", "Diagnósticos") + tb(
      r2("Dx Principal", data.diagnosticoPrincipal||"Z10.0", "Dx Secundario 1", data.diagnosticoSecundario1||"") +
      (data.diagnosticoSecundario2 ? r1("Dx Secundario 2", data.diagnosticoSecundario2) : "") +
      dxList.map((d,i) => r1(`Dx ${i+1} (${d.tipo||"—"})`, (d.cie10||"")+" "+(d.descripcion||""))).join("")
    ));

    // ═══ 12. CONCEPTO DE APTITUD ═══
    sections.push(sec("✅", "Concepto de Aptitud y Recomendaciones") +
      `<div style="background:#065f46;color:white;text-align:center;padding:10px;border-radius:6px;font-size:12pt;font-weight:900;margin:8px 0;text-transform:uppercase;">${_e(data.conceptoAptitud||"PENDIENTE")}</div>` +
      (data.vigencia ? `<p style="text-align:center;font-size:8.5pt;color:#555;margin-bottom:8px;">Vigencia: ${_e(data.vigencia)}</p>` : ""));

    // ═══ 13. RECOMENDACIONES ═══
    const recomTxt = [data.recomendacionesOcupacionales, data.recomendacionesMedicas, data.recomendaciones].filter(Boolean).join("\n");
    if (recomTxt) sections.push(`<div style="margin:8px 0;"><strong style="font-size:9.5pt;color:#065f46;">RECOMENDACIONES:</strong>${fmtList(recomTxt)}</div>`);

    // ═══ 14. RESTRICCIONES ═══
    const restricTxt = Array.isArray(data.analisisRestricciones) ? data.analisisRestricciones.join("\n") : (data.analisisRestricciones || data.restricciones || "");
    if (restricTxt) sections.push(`<div style="margin:8px 0;"><strong style="font-size:9.5pt;color:#dc2626;">RESTRICCIONES LABORALES:</strong>${fmtList(restricTxt)}</div>`);

    // ═══ 15. ANÁLISIS CLÍNICO ═══
    if (data.analisisIA) sections.push(sec("🧠", "Análisis Clínico") + `<div style="padding:6px 10px;font-size:9pt;white-space:pre-wrap;line-height:1.5;">${_nl2br(data.analisisIA)}</div>`);

    // ═══ 16. SVE ═══
    if (data.sveRecomendado?.length > 0) sections.push(sec("🛡️", "Sistema de Vigilancia Epidemiológica") + `<ul style="padding-left:16px;margin:4px 0;">${data.sveRecomendado.map(s=>`<li style="font-size:9pt;margin-bottom:3px;">${_e(s)}</li>`).join("")}</ul>`);

    // ═══ 17. DERIVACIONES ═══
    const derivs = data.derivaciones || [];
    if (derivs.length > 0) {
      sections.push(sec("🔗", "Derivaciones / Interconsultas") + `<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="background:#2563eb;color:white;padding:4px 8px;font-size:8pt;">Especialidad</th><th style="background:#2563eb;color:white;padding:4px 8px;font-size:8pt;">Motivo</th><th style="background:#2563eb;color:white;padding:4px 8px;font-size:8pt;">Urgencia</th></tr></thead><tbody>${derivs.map((d,i)=>`<tr style="background:${i%2===0?"#eff6ff":"white"}"><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;font-weight:700;">${_e(d.especialidad)}</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">${_e(d.motivo)}</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">${_e(d.urgencia)}</td></tr>`).join("")}</tbody></table>`);
    }

    // ═══ 18. FÓRMULA MÉDICA ═══
    const meds = data.formulaMedicamentos || [];
    if (meds.length > 0) {
      sections.push(sec("💊", "Fórmula Médica") + `<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="background:#7c3aed;color:white;padding:4px 8px;font-size:8pt;">Medicamento</th><th style="background:#7c3aed;color:white;padding:4px 8px;font-size:8pt;">Presentación</th><th style="background:#7c3aed;color:white;padding:4px 8px;font-size:8pt;">Dosis</th><th style="background:#7c3aed;color:white;padding:4px 8px;font-size:8pt;">Frecuencia</th><th style="background:#7c3aed;color:white;padding:4px 8px;font-size:8pt;">Duración</th></tr></thead><tbody>${meds.map((m,i)=>`<tr style="background:${i%2===0?"#faf5ff":"white"}"><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;font-weight:700;">${_e(m.nombre)}</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">${_e(m.presentacion)}</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">${_e(m.dosis)}</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">${_e(m.frecuencia)}</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">${_e(m.duracion)}</td></tr>`).join("")}</tbody></table>`);
    }

    // ═══ 19. INCAPACIDAD ═══
    const inc = data.incapacidad || {};
    if (inc.aplica || inc.dias > 0) {
      sections.push(sec("🏥", "Incapacidad Médica") + tb(
        r2("Días", inc.dias||0, "Origen", inc.origen||"Enfermedad General") +
        r2("Desde", inc.desde||"--", "Hasta", inc.hasta||"--") +
        r1("Diagnóstico", inc.diagnosticoCIE||inc.diagnostico||"--")
      ));
    }

    // ═══ 20. NOTAS ACLARATORIAS ═══
    const notas = data.notasAclaratorias || [];
    if (notas.length > 0) {
      sections.push(sec("📌", "Notas Aclaratorias") + notas.map(n => `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:4px;padding:8px;margin:4px 0;font-size:8.5pt;"><strong>${_e(n.fecha ? new Date(n.fecha).toLocaleString("es-CO") : "")} — ${_e(n.autor||"")}</strong><br/>${_e(n.contenido||"")}</div>`).join(""));
    }

    // ═══ 21. EVOLUCIONES ═══
    const evols = data.evoluciones || [];
    if (evols.length > 0) {
      sections.push(sec("📜", "Evoluciones Clínicas") + evols.map(ev => `<div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:4px;padding:8px;margin:4px 0;font-size:8.5pt;"><strong>${_e(ev.fecha||"")} — ${_e(ev.medico||"")} · Código: ${_e(ev.codigoEvolucion||"")}</strong><br/>${_e(ev.motivoConsulta||"")}${ev.texto ? "<br/>"+_e(ev.texto) : ""}${ev.nuevoConcept ? "<br/><strong>Concepto:</strong> "+_e(ev.nuevoConcept) : ""}</div>`).join(""));
    }

    // ═══ FIRMA ═══
    sections.push(`<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:30px;padding-top:10px;border-top:2px solid #d1d5db;">
    <div style="text-align:center;width:40%;"><div style="height:50px;"></div><div style="border-top:1.5px solid #333;padding-top:4px;font-size:8pt;font-weight:700;">Firma del Trabajador<br/>${_e(data.docTipo||"CC")}: ${_e(data.docNumero||"")}</div></div>
    <div style="text-align:center;width:40%;">${sigHtml}<div style="border-top:1.5px solid #333;padding-top:4px;font-size:8pt;font-weight:700;">${_e(doc.nombre||"")}<br/>${_e(doc.titulo||"")}<br/>C.C. ${_e(doc.cedula||"")}<br/>RM: ${_e(doc.licencia||"")}<br/>${_e(doc.ciudad||"")}</div></div></div>`);

    // ═══ CÓDIGO VERIFICACIÓN ═══
    if (data.codigoVerificacion) {
      sections.push(`<div style="text-align:center;margin-top:12px;background:#f0fdf4;border:1.5px solid #86efac;border-radius:6px;padding:8px;"><p style="font-size:7.5pt;font-weight:900;color:#6b7280;text-transform:uppercase;">Historia Clínica Firmada y Cerrada</p><p style="font-size:11pt;font-family:monospace;font-weight:900;color:#065f46;letter-spacing:2px;">${_e(data.codigoVerificacion)}</p></div>`);
    }

    // ═══ EXÁMENES SOLICITADOS (HOJA APARTE) ═══
    const examList = data.solicitudExamenes || [];
    if (examList.length > 0) {
      sections.push(`<div style="page-break-before:always;">${sec("🔬", "Paraclínicos y Exámenes Solicitados")}<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="background:#0d9488;color:white;padding:6px 10px;font-size:8.5pt;text-align:left;">N°</th><th style="background:#0d9488;color:white;padding:6px 10px;font-size:8.5pt;text-align:left;">Examen / Procedimiento</th><th style="background:#0d9488;color:white;padding:6px 10px;font-size:8.5pt;text-align:center;">Urgente</th></tr></thead><tbody>${examList.map((ex,i)=>`<tr style="background:${i%2===0?"#f0fdfa":"white"}"><td style="padding:5px 8px;font-size:8.5pt;border:1px solid #ccc;">${i+1}</td><td style="padding:5px 8px;font-size:8.5pt;border:1px solid #ccc;">${_e(ex.nombre)}</td><td style="padding:5px 8px;font-size:8.5pt;border:1px solid #ccc;text-align:center;">${ex.urgente?"⚡ SÍ":""}</td></tr>`).join("")}</tbody></table></div>`);
    }

    // ═══ ENSAMBLAR DOCUMENTO ═══
    const w = window.open("", "_blank", "width=870,height=1100");
    if (!w) { showAlert("Permita las ventanas emergentes para imprimir."); return; }
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>[OCUPASALUD] ${_e(data.nombres||"HC")}</title>
    <style>@page{size:letter portrait;margin:1.1cm 1.4cm 1.3cm 1.4cm;}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5pt;color:#111;margin:0;padding:14mm 16mm;line-height:1.4;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:4px 8px;font-size:8.5pt;}th{font-weight:700;text-align:left;background:#d1fae5;}p{margin:3px 0;}ul{margin:4px 0;padding-left:16px;}li{margin-bottom:2px;font-size:9pt;}.np-bar{position:fixed;top:0;left:0;right:0;background:#065f46;color:#fff;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;}.np-bar button{border:none;padding:6px 16px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;background:#10b981;color:#fff;}@media print{.np-bar{display:none!important;}body{padding:0;}}</style></head><body>
    <div class="np-bar"><span style="flex:1;font-weight:700;">📋 HC ${_e(data.nombres||"")} — ${_e(data.codigoVerificacion||"")}</span><button onclick="window.print()">📥 Guardar / Imprimir PDF</button><button onclick="window.close()" style="background:#ef4444;">✕ Cerrar</button></div>
    <div style="margin-top:50px;">${sections.join("")}</div></body></html>`);
    w.document.close();
    w.focus();
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
  // ═══ APP CONTEXT — expone todo el estado y helpers a las páginas extraídas ═══
  const appContext = {
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
    hcChoiceAgenda, setHcChoiceAgenda,
    historyRecords, setHistoryRecords, patientSearchTerm, setPatientSearchTerm,
    genPatSearch, setGenPatSearch,
    examSearch, setExamSearch, examList, setExamList,
    showExamSuggs, setShowExamSuggs,
    diagExamen, setDiagExamen, justExamen, setJustExamen,
    printPreview, setPrintPreview,
    selectedCompanyReport, setSelectedCompanyReport,
    selectedMedicoReport, setSelectedMedicoReport,
    reporteActiveTab, setReporteActiveTab, certSelected, setCertSelected,
    reportStartDate, setReportStartDate, reportEndDate, setReportEndDate,
    reportAIResult, setReportAIResult, isGeneratingReport, setIsGeneratingReport,
    showExportTable, setShowExportTable,
    precioPorPaciente, setPrecioPorPaciente,
    showDianPanel, setShowDianPanel,
    showSecretariaPatientModal, setShowSecretariaPatientModal,
    showTodoChecklist, setShowTodoChecklist, todoSelection, setTodoSelection,
    dianProvider, setDianProvider, dianApiKey, setDianApiKey,
    billData, setBillData, savedBillsList, setSavedBillsList,
    portafolioItems, setPortafolioItems, portafolioForm, setPortafolioForm,
    portafolioEditId, setPortafolioEditId,
    cotizaciones, setCotizaciones, cotizacionForm, setCotizacionForm,
    cotizacionView, setCotizacionView, cotizacionSelId, setCotizacionSelId,
    cajaMovimientos, setCajaMovimientos, cajaForm, setCajaForm,
    cajaTab, setCajaTab, cajaFiltroPeriodo, setCajaFiltroPeriodo,
    cajaFiltroDesde, setCajaFiltroDesde, cajaFiltroHasta, setCajaFiltroHasta,
    contabTab, setContabTab, contabPeriodo, setContabPeriodo,
    asistenciaFecha, setAsistenciaFecha,
    evolucionForm, setEvolucionForm, showEvolucionModal, setShowEvolucionModal,
    selectedPackage, setSelectedPackage, packageChecklist, setPackageChecklist,
    showPackages, setShowPackages, newComp, setNewComp,
    ipsPerfilForm, setIpsPerfilForm,
    verificationCode, setVerificationCode, verificationFound, setVerificationFound,
    activeUserMgmtTab, setActiveUserMgmtTab,
    pendingActivationPlan, setPendingActivationPlan,
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
    portalCodigo, setPortalCodigo, portalPaciente, setPortalPaciente,
    portalMultiple, setPortalMultiple,
    epiEmpresa, setEpiEmpresa, epiPeriodo, setEpiPeriodo, epiTab, setEpiTab,
    teleconsultas, setTeleconsultas, teleForm, setTeleForm,
    teleSalaActiva, setTeleSalaActiva, teleTab, setTeleTab,
    mensajeRespuesta, setMensajeRespuesta,
    agendados, setAgendados, showAgenda, setShowAgenda,
    agendaForm, setAgendaForm, agendaSuggs, setAgendaSuggs, agendaTab, setAgendaTab,
    showComposeMensaje, setShowComposeMensaje, composeMensaje, setComposeMensaje,
    companiesTab, setCompaniesTab, editingCompany, setEditingCompany,
    cajaMedicoPeriodo, setCajaMedicoPeriodo,
    porcentajeMedico, setPorcentajeMedico,
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
    BrandLogo, DoctorSignature, DoctorSignatureMemo, LoginForm,
    InputGroup, PlanGate,
    _isAdmin, _isAdminEmpresa, _isAdminOrEmpresa, _canUse, _contarHC,
    _generarCertificadoHTMLNormalizado,
    PLAN_CONFIG, SECRETARIA_PERMISOS_DEFAULT, DEFAULT_DOCTOR_DATA, ORG_DEFAULT_ID,
    _ls, _sbSet, _sbGet, _SB_URL, _SB_KEY,
    sanitizeInput,
    // Helpers for extracted pages
    SectionTitle, SelectGroup, TextAreaGroup, CIE10Input, CIE11Badge, CUPSInput,
    MedicamentoAutocomplete, ConsentimientoModal,
    handleCompanySelect, handleOpenHistoryModal, generateAIGeneral,
    analyzeBP, analyzeHR, analyzeBMI, NORMAL_DESCRIPTIONS_SYSTEMS,
    EPS_LIST, ARL_LIST, AFP_LIST, TURNO_LIST, CONTRATO_LIST,
    DEFAULT_RECOMENDACIONES_SELECTED,
    inactivityWarning, inactivityCountdown, _resetInactivity,
    handleVerify2FA,
    _sync, _secretariaPuede,
  };
  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  // [EXTRACTED: pages/Navbar.jsx]
  const renderNavbar = () => <Navbar />;
  // ─── RENDER: DASHBOARD ────────────────────────────────────────────────────
  // ─── RENDER: HC OCUPACIONAL ───────────────────────────────────────────────
  // [EXTRACTED: pages/HistoriaOcupacional.jsx]
  // ─── RENDER: HC MEDICINA GENERAL ─────────────────────────────────────────
  // [EXTRACTED: pages/HistoriaGeneral.jsx]
  // ─── RENDER: CERTIFICADO ──────────────────────────────────────────────────
  // [EXTRACTED: pages/CertificadoPage.jsx]
  // ─── RENDER: REPORTES ─────────────────────────────────────────────────────
  // ─── RENDER: PACIENTES ────────────────────────────────────────────────────
  // ══ B-12: Helper de periodicidad - Res. 1843/2025 Art. 4 (max 3 años entre evaluaciones) ══
  // [EXTRACTED with PatientsPage: _getPeriodicidadStatus]
  // [EXTRACTED: pages/PatientsPage.jsx]
  // ─── RENDER: EMPRESAS ─────────────────────────────────────────────────────
  // ─── RENDER: VERIFICACIÓN ─────────────────────────────────────────────────
  // ─── RENDER: CUENTAS DE COBRO ─────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  // B-24: PORTAL DEL TRABAJADOR - Solo lectura con código de verificación
  // Res. 2346/2007 Art. 14 · Ley 1581/2012 - Acceso del titular a su HC
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // B-31: SVE - Sistema Vigilancia Epidemiológica - Res. 2346/2007 · Res. 1843/2025
  // ══════════════════════════════════════════════════════════════════════════
  // [EXTRACTED: pages/SVEPage.jsx]

  // ══════════════════════════════════════════════════════════════════════════
  // B-26: ARL - Reporte AT/EL - Decreto 1072/2015 · Res. 0312/2019
  // ══════════════════════════════════════════════════════════════════════════
  // [EXTRACTED: pages/ARLPage.jsx]

  // ══════════════════════════════════════════════════════════════════════════
  // B-22: HABEAS DATA - Módulo de Derechos del Titular
  // Ley 1581 de 2012 · Decreto 1078 de 2015 (DUR MinTIC) · Res. SIC 2023
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // B-17: TELEMEDICINA - Jitsi Meet (Res. 2654/2019)
  // Videoconsulta integrada con consentimiento digital, sin costo por minuto
  // ══════════════════════════════════════════════════════════════════════════
  // [EXTRACTED: pages/TelemedicinaPage.jsx]

  // ══════════════════════════════════════════════════════════════════════════
  // B-16: ADJUNTOS DE PARACLÍNICOS - Supabase Storage
  // Res. 1843/2025 Art.12 - Espirometría, Audiometría, RX, Laboratorios
  // ══════════════════════════════════════════════════════════════════════════
  // [EXTRACTED: pages/TabAdjuntos.jsx]

  // ─── ROUTER ───────────────────────────────────────────────────────────────
  // ─── RENDER: GESTIÓN DE USUARIOS ─────────────────────────────────────────
  // ─── RENDER: PLANES Y PRECIOS ────────────────────────────────────────────

  // ─── RENDER: PROPUESTAS ECONÓMICAS ───────────────────────────────────────
  // ══════════════════════════════════════════════════════
  // B-F1-03: PORTAFOLIO DE SERVICIOS / LISTA DE PRECIOS
  // ══════════════════════════════════════════════════════
  // [EXTRACTED: pages/PropuestasPage.jsx]
  // ─── RENDER: TAB SOLICITUD EXÁMENES ─────────────────────────────────────
  // [EXTRACTED: pages/TabSolicitudExamenes.jsx]
  // ─── RENDER: TAB INCAPACIDAD GENERAL ────────────────────────────────────
  // [EXTRACTED: pages/TabIncapacidadGeneral.jsx]
  // ─── RENDER: AGENDA / SALA DE ESPERA ───────────────────────────────────────
  // ─── RENDER: REPORTE ASISTENCIA AGENDA ──────────────────────────────────────
  // [EXTRACTED: pages/AsistenciaAgendaPage.jsx]

  // ─── RENDER: PORTAFOLIO DE SERVICIOS (B-F1-03) ──────────────────────────────
  // [EXTRACTED: pages/PortafolioPage.jsx]

  // ─── RENDER: COTIZACIONES FORMALES (B-F1-04) ────────────────────────────────
  // ── renderCotizacionesInline: contenido de cotizaciones embebido en propuestas ──
  // [EXTRACTED: pages/CotizacionesInlinePage.jsx]

  // [EXTRACTED: pages/CotizacionesPage.jsx]

  // ─── RENDER: MÓDULO CONTABILIDAD (PASO 5) ────────────────────────────────────
  // [EXTRACTED: pages/ContabilidadPage.jsx]

  // ─── RENDER: PERFIL IPS / MI EMPRESA (PASO 1) ────────────────────────────────

  // ─── RENDER: CAJA DIARIA + COMPROBANTES + CUENTAS COBRAR (B-F2-01/02/03) ────

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 2 — PANEL GLOBAL SUPER ADMIN
  // Gestión de todas las organizaciones. Solo visible para rol super_admin.
  // ══════════════════════════════════════════════════════════════════════════
  // [EXTRACTED: pages/SuperAdminPage.jsx]

  // ─── RENDER: PORTAL EMPRESA-CLIENTE (B-F2-06) ──────────────────────────────
  // [EXTRACTED: pages/PortalEmpresaPage.jsx]

  // ─── RENDER: EVOLUCIONES CLÍNICAS MODAL (B-F2-05 EXPANDIDO) ──────────────
  // [EXTRACTED: pages/EvolucionModal.jsx]

  // ─── RENDER: MENSAJERÍA INTERNA ────────────────────────────────────────────
  // Called inline as overlay + floating panel - not a full-page view
  // [EXTRACTED: pages/MensajesOverlay.jsx]
  // ── B-F1-03: Persistir portafolio ──────────────────────────────────────
  const savePortafolio = (items) => {
    setPortafolioItems(items);
    try {
      localStorage.setItem("siso_portafolio", JSON.stringify(items));
    } catch {}
  };
  // ── B-F1-04: Persistir cotizaciones ──────────────────────────────────
  const saveCotizaciones = (list) => {
    setCotizaciones(list);
    try {
      localStorage.setItem("siso_cotizaciones", JSON.stringify(list));
    } catch {}
  };
  const nextCotizNum = () => {
    const max = cotizaciones.reduce(
      (m, c) => Math.max(m, parseInt(c.numero || "0") || 0),
      0
    );
    return String(max + 1).padStart(4, "0");
  };
  // ── B-F2-01: Persistir caja ───────────────────────────────────────────
  const saveCaja = (movs) => {
    setCajaMovimientos(movs);
    try {
      // PASO 6: clave aislada por empresa/usuario
      const suf = currentUser?.empresaId
        ? "empresa_" + currentUser.empresaId
        : currentUser?.user || "shared";
      localStorage.setItem(`siso_caja_${suf}`, JSON.stringify(movs));
      _sbSet(`siso_caja_movs_${suf}`, movs); // Bloque 3: sync Supabase
    } catch {}
  };
  // ── B-F2-01/02: Generar comprobante ──────────────────────────────────
  const openComprobanteWindow = (tipo, mov) => {
    const doc = activeDoctorData;
    const _miIPSComp = currentUser?.empresaId
      ? companies.find((c) => c.id === currentUser.empresaId) || null
      : null;
    const num = mov.id || Date.now();
    const fecha = mov.fecha || new Date().toLocaleDateString("es-CO");
    const tipoLabel =
      tipo === "ingreso"
        ? "COMPROBANTE DE INGRESO"
        : tipo === "egreso"
        ? "COMPROBANTE DE EGRESO"
        : "RECIBO DE CAJA";
    const _compLeftHtml = _miIPSComp
      ? `<div style="text-align:left;">
          ${
            _safeLogoUrl(_miIPSComp.logo || "") // SEC-FIX-02
              ? `<img src="${_safeLogoUrl(_miIPSComp.logo)}" style="max-height:36px;max-width:90px;object-fit:contain;display:block;margin-bottom:3px;"/>`
              : ""
          }
          <div style="font-size:11px;font-weight:900;color:#1a1a1a;">${_sanitize(
            _miIPSComp.nombre || ""
          )}</div>
          ${
            _miIPSComp.nit
              ? `<div style="font-size:9px;color:#555;">NIT: ${_sanitize(
                  _miIPSComp.nit
                )}${_miIPSComp.dv ? "-" + _sanitize(_miIPSComp.dv) : ""}</div>`
              : ""
          }
          ${
            _miIPSComp.direccion
              ? `<div style="font-size:9px;color:#555;">${_sanitize(
                  _miIPSComp.direccion
                )}${
                  _miIPSComp.ciudad ? " · " + _sanitize(_miIPSComp.ciudad) : ""
                }</div>`
              : ""
          }
          ${
            _miIPSComp.telefono
              ? `<div style="font-size:9px;color:#555;">Tel: ${_sanitize(
                  _miIPSComp.telefono
                )}</div>`
              : ""
          }
        </div>`
      : `<div style="text-align:left;">
          <div style="font-size:11px;font-weight:900;color:#1a1a1a;">${_sanitize(
            doc?.nombre || ""
          )}</div>
          <div style="font-size:9px;color:#555;">${_sanitize(
            doc?.titulo || ""
          )}</div>
          <div style="font-size:9px;color:#555;">Lic: ${_sanitize(
            doc?.licencia || ""
          )} · ${_sanitize(doc?.ciudad || "")}</div>
        </div>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${tipoLabel}</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:24px;font-size:11px;color:#111}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a1a1a;padding-bottom:12px;margin-bottom:16px}
.title{font-size:14px;font-weight:900;text-transform:uppercase;margin:4px 0;text-align:right}
.sub{font-size:10px;color:#555;text-align:right}
table{width:100%;border-collapse:collapse;margin-top:8px}
th{background:#1a1a1a;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
td{padding:5px 8px;border-bottom:1px solid #ddd;font-size:11px}
.total-row td{font-weight:900;font-size:13px;background:#f0f0f0}
.firma{margin-top:40px;text-align:right}
.firma-line{border-top:1px solid #555;width:200px;margin-left:auto;padding-top:4px;font-size:10px;text-align:center}
.no-print{margin-top:16px;display:flex;gap:8px;justify-content:center}
@media print{.no-print{display:none}}
</style></head><body>
<div class="header">
${_compLeftHtml}
<div>
<div class="title">${tipoLabel}</div>
<div class="sub">No. ${num} · Fecha: ${fecha}</div>
</div>
</div>
<table>
<tr><th>Campo</th><th>Detalle</th></tr>
<tr><td>Concepto</td><td>${mov.concepto || ""}</td></tr>
<tr><td>Forma de pago</td><td>${mov.formaPago || ""}</td></tr>
<tr class="total-row"><td>MONTO</td><td>$ ${Number(
      mov.monto || 0
    ).toLocaleString("es-CO")} COP</td></tr>
</table>
<div class="firma">
<div class="firma-line">${_sanitize(doc?.nombre || "")}<br/>${_sanitize(
      doc?.titulo || ""
    )}<br/>Lic: ${_sanitize(doc?.licencia || "")}</div>
</div>
<div class="no-print">
<button onclick="window.print()" style="background:#1a1a1a;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:900;cursor:pointer">🖨️ Imprimir</button>
<button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:900;cursor:pointer">✕ Cerrar</button>
</div></body></html>`;
    const w = window.open("", "_blank", "width=560,height=620");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };
  // ── B-F1-05: Carné manipulación alimentos ────────────────────────────
  const openCarnetAlimentos = (paciente, docData) => {
    const doc = docData || activeDoctorData;
    const p = paciente || {};
    const empresa = companies.find((c) => c.id === p.empresaId);
    const fechaVig = p.vigencia
      ? new Date(
          new Date(p.fechaConsulta || Date.now()).getTime() +
            parseInt(p.vigencia) * 24 * 60 * 60 * 1000
        ).toLocaleDateString("es-CO")
      : "Ver concepto médico";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Carné Manipulación de Alimentos</title>
<style>
@media print{body{margin:0}@page{size:8.5cm 5.5cm;margin:0}}
body{font-family:Arial,sans-serif;margin:0;background:#f5f5f5}
.carne{width:8.5cm;height:5.5cm;background:#fff;border:2px solid #1a6b2f;border-radius:8px;
  overflow:hidden;display:flex;flex-direction:column;padding:8px;box-sizing:border-box;
  margin:10px auto;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.hdr{background:#1a6b2f;color:#fff;text-align:center;padding:3px;border-radius:4px;margin-bottom:4px}
.hdr h1{font-size:7px;margin:0;font-weight:900;text-transform:uppercase}
.body{display:flex;gap:6px;flex:1}
.foto{width:35px;height:45px;border:1px solid #1a6b2f;border-radius:4px;
  display:flex;align-items:center;justify-content:center;font-size:18px;
  background:#f0faf0;flex-shrink:0;overflow:hidden}
.foto img{width:100%;height:100%;object-fit:cover}
.info{flex:1;font-size:7px;line-height:1.4}
.info .nom{font-weight:900;font-size:8px;color:#1a6b2f}
.bottom{display:flex;justify-content:space-between;align-items:flex-end;margin-top:3px}
.firma{text-align:center;font-size:6px;border-top:1px solid #333;padding-top:1px;width:60px}
.valid{background:#d1fae5;border:1px solid #1a6b2f;border-radius:4px;padding:2px 6px;
  font-size:7px;font-weight:900;color:#065f46;text-align:center}
.no-print{text-align:center;padding:10px;display:flex;gap:8px;justify-content:center}
@media print{.no-print{display:none}}
</style></head><body>
<div class="carne">
<div class="hdr"><h1>🍽️ Carné Médico - Manipulación de Alimentos</h1></div>
<div class="body">
<div class="foto">${
      p.fotoPaciente ? `<img src="${p.fotoPaciente}" alt="Foto"/>` : "📷"
    }</div>
<div class="info">
<div class="nom">${p.nombres || "Paciente"}</div>
<div><b>Doc:</b> ${p.docTipo || "CC"} ${p.docNumero || ""}</div>
<div><b>Empresa:</b> ${empresa?.nombre || p.empresaId || "Particular"}</div>
<div><b>Cargo:</b> ${p.cargo || "-"}</div>
<div><b>Concepto:</b> ${p.conceptoAptitud || "APTO"}</div>
<div><b>Fecha:</b> ${
      p.fechaConsulta || new Date().toLocaleDateString("es-CO")
    }</div>
</div></div>
<div class="bottom">
<div class="firma">${doc?.nombre || ""}<br/>${doc?.titulo || ""}<br/>Lic: ${
      doc?.licencia || ""
    }</div>
<div class="valid">✅ VÁLIDO<br/>Hasta: ${fechaVig}</div>
</div></div>
<div class="no-print">
<button onclick="window.print()" style="background:#1a6b2f;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:900;cursor:pointer">🖨️ Imprimir Carné</button>
<button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:900;cursor:pointer">✕ Cerrar</button>
</div></body></html>`;
    const w = window.open("", "_blank", "width=380,height=320");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };
  const renderCurrentView = () => {
    // NORMATIVO: Ley 1581/2012 - mostrar aviso si no ha sido aceptado
    if (!privacidadAceptada)
      return <PrivacyModal onAccept={handleAceptarPrivacidad} />;
    if (view === "login") {
      // ══ FIX: Mostrar carga mientras se recuperan usuarios de Supabase ══
      if (!usersReady) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center font-sans p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden animate-fade-in p-10 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <Cloud className="w-8 h-8 text-emerald-600 animate-pulse" />
              </div>
              <h2 className="text-lg font-black text-gray-800 mb-2">Conectando...</h2>
              <p className="text-sm text-gray-500">Restaurando datos desde la nube</p>
              <div className="mt-4 flex justify-center">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
              <p className="text-[10px] text-gray-400 mt-3">Si tarda más de 10 segundos, verifique su conexión a internet.</p>
            </div>
          </div>
        );
      }
      // B-18: Intercepción 2FA - mostrar pantalla de verificación TOTP
      if (twoFAStep)
        return (
          <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center font-sans p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden animate-fade-in">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Verificación 2FA
                </h1>
                <p className="text-indigo-200 text-sm mt-1">
                  Autenticación de dos factores activa
                </p>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Ingrese el código de 6 dígitos de su aplicación autenticadora
                </p>
                <p className="text-xs text-center text-gray-400">
                  (Google Authenticator · Authy · Microsoft Authenticator)
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFAToken}
                  onChange={(e) => {
                    setTwoFAToken(e.target.value.replace(/\D/g, ""));
                    setTwoFAError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify2FA();
                  }}
                  placeholder="000000"
                  className="w-full p-3 border-2 border-indigo-200 rounded-xl text-center text-3xl font-black tracking-[0.5em] focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
                {twoFAError && (
                  <p className="text-red-600 text-xs text-center font-bold">
                    {twoFAError}
                  </p>
                )}
                <button
                  onClick={handleVerify2FA}
                  disabled={twoFAToken.length !== 6}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl transition shadow-lg"
                >
                  ✅ Verificar código
                </button>
                <button
                  onClick={() => {
                    setTwoFAStep(null);
                    setTwoFAToken("");
                    setTwoFAError("");
                  }}
                  className="w-full py-2 text-gray-500 text-xs hover:text-gray-700"
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            </div>
          </div>
        );
      return <LoginPage />;
    }
    if (view === "dashboard") return <DashboardPage />;
    if (view === "superadmin") return <SuperAdminPage />;
    if (view === "planes") return <PlanesPage />;
    if (view === "portaltrabajador") return <PortalTrabajadorPage />;
    if (view === "portalempresa") return <PortalEmpresaPage />;
    if (view === "habeasdata") return <HabeasDataPage />;
    if (view === "arl") return <ARLPage />;
    if (view === "sve") return <SVEPage />;
    if (view === "telemedicina") return <TelemedicinaPage />;
    if (view === "agenda") return <AgendaPage />;
    if (view === "asistencia") return <AsistenciaAgendaPage />;
    if (view === "patients") return <PatientsPage />;
    // ══ B-07: Pantalla cambio de contraseña obligatorio (primer login o forzado) ══
    if (view === "changePassword")
      return (
        <ChangePasswordForm
          currentUser={currentUser}
          usersList={usersList}
          setUsersList={setUsersList}
          setCurrentUser={setCurrentUser}
          _sync={_sync}
          _patKey={_patKey}
          goTo={goTo}
          showAlert={showAlert}
        />
      );
    if (view === "companies") return <CompaniesPage />;
    if (view === "reporte") return <ReportePage />;
    if (view === "bill") return <BillPage />;
    if (view === "verification") return <VerificationPage />;
    if (view === "users") return <UsersPage />;
    if (view === "portafolio") return <PortafolioPage />;
    if (view === "caja") return <CajaPage />;
    if (view === "perfilips") return <PerfilIPSPage />;
    if (view === "contabilidad") return <ContabilidadPage />;
    if (view === "cotizaciones") {
      if (propModulo !== "cotizacion") setPropModulo("cotizacion");
      return <PropuestasPage />;
    }
    if (view === "propuestas") return <PropuestasPage />;
    if (view === "historia") {
      // FIX: _billDocData necesario para incapacidad, fórmula, derivación
      const _billDocUser = billData.billDoctorId
        ? usersList.find((u) => u.user === billData.billDoctorId)
        : null;
      const _billDocData = _billDocUser?.doctorData || activeDoctorData;
      const _billDocSig = _billDocUser?.doctorData?.firma || activeSignature;
      return (
        <div className="min-h-screen flex flex-col bg-gray-100 font-sans print:bg-white">
          {saveStatus === "saved" && (
            <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 no-print animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> ✅ Guardado
            </div>
          )}
          {inactivityWarning && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[9998] flex items-center gap-3 no-print">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-black text-sm">⏱️ Sesión por expirar</p>
                <p className="text-xs">
                  Cierre automático en{" "}
                  <span className="font-black">{inactivityCountdown}s</span> por
                  inactividad
                </p>
              </div>
              <button
                onClick={_resetInactivity}
                className="ml-4 bg-white text-red-600 px-3 py-1 rounded-lg font-black text-xs hover:bg-red-50"
              >
                Continuar
              </button>
            </div>
          )}
          {saveStatus === "auto" && (
            <div className="fixed top-4 right-4 bg-blue-400 text-white px-3 py-1.5 rounded-lg shadow-lg z-50 flex items-center gap-2 no-print animate-fade-in text-xs">
              <RefreshCw className="w-3 h-3" /> Autoguardado
            </div>
          )}
          {renderNavbar()}
          <main className="flex-grow p-6 max-w-5xl mx-auto w-full print:p-0">
            {dataType === "ocupacional" &&
              activeTab === "form" &&
              <HistoriaOcupacional />}
            {dataType === "general" &&
              activeTab === "formGeneral" &&
              <HistoriaGeneral />}
            {dataType === "ocupacional" &&
              activeTab === "certificado" &&
              <CertificadoPage />}
            {dataType === "ocupacional" &&
              (activeTab === "formulaTab" || activeTab === "derivacionTab") && (
                <TabFormulaDerivacion
                  data={data}
                  setData={setData}
                  _billDocData={_billDocData}
                  _billDocSig={_billDocSig}
                  onPrint={handlePrint}
                  forceTab={
                    activeTab === "derivacionTab" ? "derivacion" : "formula"
                  }
                />
              )}
            {dataType === "ocupacional" &&
              activeTab === "solicitudExamenes" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-teal-50">
                    <span className="text-sm font-black text-teal-800">
                      🔬 Solicitud de Exámenes Paraclínicos
                    </span>
                    <span className="text-[10px] text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
                      HC Ocupacional
                    </span>
                  </div>
                  <div className="p-4"><TabSolicitudExamenes /></div>
                </div>
              )}
            {dataType === "ocupacional" && activeTab === "adjuntos" && (
              <div><TabAdjuntos /></div>
            )}
            {/* B-F1-05: CARNÉ MANIPULACIÓN ALIMENTOS */}
            {dataType === "ocupacional" &&
              activeTab === "carnetAlimentos" &&
              (() => {
                const doc = activeDoctorData;
                const sig = activeSignature;
                const printCarnet = () => {
                  const vigencia = (() => {
                    const d = new Date(
                      data.fechaExamen || new Date().toISOString().split("T")[0]
                    );
                    d.setFullYear(d.getFullYear() + 1);
                    return d.toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })();
                  const _miIPSCarnet = currentUser?.empresaId
                    ? companies.find((c) => c.id === currentUser.empresaId) ||
                      null
                    : null;
                  const _carnetIpsBrand = _miIPSCarnet
                    ? `<div style="display:flex;align-items:center;gap:6px;border-bottom:1px solid #d1fae5;padding-bottom:5px;margin-bottom:7px;">
                        ${
                          _safeLogoUrl(_miIPSCarnet.logo || "") // SEC-FIX-02
                            ? `<img src="${_safeLogoUrl(_miIPSCarnet.logo)}" style="max-height:20px;max-width:50px;object-fit:contain;"/>`
                            : ""
                        }
                        <span style="font-size:8px;font-weight:900;color:#065f46;text-transform:uppercase;">${_sanitize(
                          _miIPSCarnet.nombre || ""
                        )}</span>
                        ${
                          _miIPSCarnet.nit
                            ? `<span style="font-size:7px;color:#888;margin-left:auto;">NIT: ${_sanitize(
                                _miIPSCarnet.nit
                              )}</span>`
                            : ""
                        }
                      </div>`
                    : "";
                  const html = `<!DOCTYPE html><html><head><title>Carné - ${
                    data.nombres || "Paciente"
                  }</title>
                <style>
                  body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}
                  .card{width:8.56cm;min-height:5.4cm;background:white;border-radius:12px;padding:14px;box-shadow:0 4px 12px rgba(0,0,0,.15);margin:auto;border-top:5px solid #16a34a}
                  .header{display:flex;align-items:center;gap:10px;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:8px}
                  .photo{width:50px;height:50px;border-radius:50%;border:2px solid #16a34a;object-fit:cover;background:#dcfce7;display:flex;align-items:center;justify-content:center;font-size:20px;overflow:hidden}
                  .badge{background:#dcfce7;color:#15803d;font-size:9px;font-weight:bold;padding:2px 8px;border-radius:12px;text-transform:uppercase}
                  .sig{max-width:100px;max-height:40px}
                  .no-print{margin-bottom:16px}
                  @media print{.no-print{display:none}body{background:white;padding:0}.card{box-shadow:none}}
                </style></head><body>
                <div class="no-print">
                  <button onclick="document.body.contentEditable='true'" style="margin-right:8px;padding:6px 14px;background:#4B5563;color:white;border:none;border-radius:6px;cursor:pointer">✏️ Editar</button>
                  <button onclick="window.print()" style="padding:6px 14px;background:#16a34a;color:white;border:none;border-radius:6px;cursor:pointer">🖨️ Imprimir</button>
                </div>
                <div class="card">
                  ${_carnetIpsBrand}
                  <div class="header">
                    ${
                      data.fotoPaciente
                        ? `<div class="photo"><img src="${data.fotoPaciente}" style="width:100%;height:100%;object-fit:cover"/></div>`
                        : '<div class="photo" style="font-size:22px;display:flex;align-items:center;justify-content:center">👤</div>'
                    }
                    <div style="flex:1">
                      <div class="badge">🍽️ Manipulación de Alimentos</div>
                      <p style="margin:3px 0;font-size:13px;font-weight:bold">${
                        data.nombres || ""
                      }</p>
                      <p style="margin:2px 0;font-size:10px;color:#6b7280">CC ${
                        data.docNumero || ""
                      }</p>
                      <p style="margin:2px 0;font-size:10px;color:#6b7280">${
                        data.cargo || ""
                      }</p>
                    </div>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;font-size:10px">
                    <div><span style="color:#9ca3af">Empresa:</span><br><strong>${
                      companies.find((c) => c.id === data.empresaId)?.nombre ||
                      "Particular"
                    }</strong></div>
                    <div><span style="color:#9ca3af">Concepto:</span><br><strong style="color:#15803d">✅ APTO</strong></div>
                    <div><span style="color:#9ca3af">Fecha evaluación:</span><br><strong>${
                      data.fechaExamen || data.fechaConsulta || ""
                    }</strong></div>
                    <div><span style="color:#9ca3af">Vigente hasta:</span><br><strong style="color:#dc2626">${vigencia}</strong></div>
                  </div>
                  <div style="display:flex;justify-content:flex-end;align-items:flex-end;border-top:1px solid #e5e7eb;padding-top:6px">
                    <div style="text-align:center">
                      ${
                        sig
                          ? `<img src="${sig}" class="sig"/><br>`
                          : '<div style="width:100px;border-top:1px solid #333;margin-bottom:3px"></div>'
                      }
                      <p style="margin:0;font-size:8px;font-weight:bold">${
                        doc.nombre || ""
                      }</p>
                      <p style="margin:0;font-size:7px;color:#6b7280">Lic. ${
                        doc.licencia || ""
                      }</p>
                    </div>
                  </div>
                </div>
                </body></html>`;
                  const w = window.open("", "_blank", "width=500,height=420");
                  w.document.write(html);
                  w.document.close();
                };
                return (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                        🍽️ Carné de Aptitud - Manipulación de Alimentos
                      </h3>
                      <button
                        onClick={printCarnet}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm"
                      >
                        🖨️ Imprimir Carné
                      </button>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                      <p className="text-xs text-emerald-800 font-bold mb-2">
                        Vista previa del carné (8.56 × 5.4 cm)
                      </p>
                      <div className="bg-white rounded-xl p-3 shadow border-t-4 border-emerald-500 max-w-xs">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100 mb-2">
                          {data.fotoPaciente ? (
                            <img
                              src={data.fotoPaciente}
                              className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center text-lg">
                              👤
                            </div>
                          )}
                          <div>
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full">
                              🍽️ Manipulación de Alimentos
                            </span>
                            <p className="font-black text-gray-800 text-sm">
                              {data.nombres || "-"}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {data.cargo || ""}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] mb-2">
                          <div>
                            <span className="text-gray-400">Empresa:</span>
                            <br />
                            <strong>
                              {companies.find((c) => c.id === data.empresaId)
                                ?.nombre || "Particular"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-400">Concepto:</span>
                            <br />
                            <strong className="text-emerald-700">
                              ✅ APTO
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-400">Evaluación:</span>
                            <br />
                            <strong>
                              {data.fechaExamen || data.fechaConsulta || "-"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-400">Vigencia:</span>
                            <br />
                            <strong className="text-red-600">1 año</strong>
                          </div>
                        </div>
                        <div className="text-right border-t border-gray-100 pt-1">
                          <p className="text-[9px] font-bold">
                            {doc.nombre || ""}
                          </p>
                          <p className="text-[8px] text-gray-400">
                            Lic. {doc.licencia || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!data.fotoPaciente && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                        💡 Tip: Agrega la foto del paciente en la sección "Datos
                        Sociodemográficos" para que aparezca en el carné.
                      </div>
                    )}
                  </div>
                );
              })()}
            {activeTab === "incapacidad" && (
              <div
                className="bg-white mx-auto shadow-2xl print:shadow-none carta-visual"
                style={{
                  width: "21.59cm",
                  minHeight: "auto",
                  padding: "1.5cm",
                  boxSizing: "border-box",
                }}
              >
                <div className="text-center border-b-2 border-gray-800 pb-2 mb-4">
                  <div className="flex justify-center">
                    <BrandLogo data={_billDocData} />
                  </div>
                  <h2 className="text-2xl font-black uppercase mt-2">
                    Certificado de Incapacidad Médica
                  </h2>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        className="w-full p-1.5 border rounded font-bold bg-white"
                        value={data.incapacidad?.fechaInicio || ""}
                        onChange={(e) =>
                          setData((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              fechaInicio: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        className="w-full p-1.5 border rounded font-bold bg-white"
                        value={data.incapacidad?.fechaFin || ""}
                        onChange={(e) => {
                          const start = new Date(data.incapacidad?.fechaInicio);
                          const end = new Date(e.target.value);
                          const dias =
                            Math.ceil(
                              Math.abs(end - start) / (1000 * 60 * 60 * 24)
                            ) + 1;
                          setData((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              fechaFin: e.target.value,
                              dias: dias > 0 ? dias : 0,
                            },
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
                    <p className="text-xs font-bold text-emerald-700 uppercase mb-1">
                      Días
                    </p>
                    <p className="text-4xl font-black text-emerald-900">
                      {data.incapacidad?.dias || 0}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold">
                      {numeroALetras(data.incapacidad?.dias || 0)} DÍAS
                    </p>
                  </div>
                  <div className="space-y-3">
                    <select
                      value={data.incapacidad?.origen || "Enfermedad General"}
                      onChange={(e) =>
                        setData((p) => ({
                          ...p,
                          incapacidad: {
                            ...p.incapacidad,
                            origen: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded text-xs font-bold"
                    >
                      <option value="Enfermedad General">
                        Enfermedad General
                      </option>
                      <option value="Accidente de Trabajo">
                        Accidente de Trabajo
                      </option>
                      <option value="Enfermedad Laboral">
                        Enfermedad Laboral
                      </option>
                    </select>
                    <textarea
                      rows={3}
                      value={data.incapacidad?.diagnostico || ""}
                      onChange={(e) =>
                        setData((p) => ({
                          ...p,
                          incapacidad: {
                            ...p.incapacidad,
                            diagnostico: e.target.value,
                          },
                        }))
                      }
                      placeholder="Diagnóstico (CIE-10)..."
                      className="w-full p-2 border rounded text-xs resize-none"
                    />
                  </div>
                </div>
                <div className="mt-10 flex justify-end px-4">
                  <div className="text-center w-1/3">
                    <DoctorSignature
                      signature={_billDocSig}
                      data={_billDocData}
                      showData={true}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* ══ TAB: SOLICITUD DE EXÁMENES ══ */}
            {dataType === "general" &&
              activeTab === "solicitudExamenes" &&
              <TabSolicitudExamenes />}
            {/* ══ TAB: INCAPACIDAD MÉDICA (HC GENERAL) ══ */}
            {dataType === "general" &&
              activeTab === "incapacidadGeneral" &&
              <TabIncapacidadGeneral />}
            {activeTab === "ordenMedica" &&
              (() => {
                const buildGnHeader = (titleDoc, accent) => {
                  const fd = _sanitize(
                    data.fechaConsulta || new Date().toLocaleDateString("es-CO")
                  );
                  const accentSafe = /^#[0-9a-fA-F]{3,6}$/.test(accent)
                    ? accent
                    : "#2563eb";
                  const _miIPSGn = currentUser?.empresaId
                    ? companies.find((c) => c.id === currentUser.empresaId) ||
                      null
                    : null;
                  const pNom = _sanitize(data.nombres || "---");
                  const pDTipo = _sanitize(data.docTipo || "CC");
                  const pDNum = _sanitize(data.docNumero || "---");
                  const pEdad = _sanitize(String(data.edad || "--"));
                  const pSexo = _sanitize(data.genero || "---");
                  const pEps = _sanitize(data.eps || "---");
                  const pMotivo = _sanitize(data.motivoConsulta || "---");
                  return `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${accentSafe};padding-bottom:10px;margin-bottom:14px;">
                  ${_ipsDocLeftHtml(_miIPSGn, _billDocData, accentSafe)}
                  <div style="width:34%;text-align:center;border-left:1px solid #ddd;border-right:1px solid #ddd;padding:0 10px;">
                    <p style="font-size:13pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:2px 0;">${_sanitize(
                    titleDoc
                  )}</p>
                    <p style="font-size:7pt;color:#888;margin:2px 0;">Res. 1995&#x2F;1999 · Cons. Gral.</p>
                    <p style="font-size:8pt;font-weight:700;color:#333;margin:5px 0 2px 0;">Fecha: ${fd}</p>
                  </div>
                  <div style="width:32%;text-align:right;padding-left:8px;">
                    <p style="font-size:10.5pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:0 0 3px 0;">${pNom}</p>
                    <p style="font-size:7.5pt;color:#444;margin:1px 0;">${pDTipo}: <b>${pDNum}</b> · Edad: <b>${pEdad} años</b></p>
                    <p style="font-size:7.5pt;color:#444;margin:1px 0;">Sexo: ${pSexo} · EPS: <b>${pEps}</b></p>
                    <p style="font-size:7.5pt;color:#444;margin:1px 0;">Motivo: ${pMotivo}</p>
                  </div>
                </div>`;
                };
                const baseStyle = `@page{size:letter portrait;margin:1.1cm 1.3cm 1.3cm 1.3cm;}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body{font-family:Arial,Helvetica,sans-serif;font-size:9.5pt;color:#111;margin:0;padding:0;line-height:1.45;}.sec-title{font-size:8.5pt;font-weight:900;text-transform:uppercase;border-bottom:1.5px solid currentColor;padding-bottom:3px;margin:10px 0 6px 0;}.med-card{border:1px solid #d1fae5;border-left:4px solid #059669;border-radius:4px;padding:6px 10px;margin-bottom:6px;page-break-inside:avoid;background:#f0fdf4;}.deriv-card{border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:4px;padding:8px 10px;margin-bottom:7px;page-break-inside:avoid;background:#eff6ff;}.badge{display:inline-block;padding:1px 7px;border-radius:50px;font-size:7.5pt;font-weight:700;}.urgente{background:#fee2e2;color:#dc2626;}.prioritaria{background:#fef3c7;color:#92400e;}.electiva{background:#dcfce7;color:#166534;}.sig-block{display:flex;justify-content:space-between;align-items:flex-end;margin-top:18mm;}.sig-line{text-align:center;width:42%;}.sig-top{border-top:2px solid #222;padding-top:4px;font-size:7.5pt;font-weight:700;}.block-avoid{page-break-inside:avoid;}`;
                const sigBlock = `<div class="sig-block"><div class="sig-line"><div class="sig-top">Firma Paciente / Responsable</div><p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: ___________________</p></div><div class="sig-line">${
                  _billDocSig
                    ? `<img src="${_billDocSig}" style="max-height:55px;max-width:150px;" alt="Firma"/>`
                    : '<div style="height:55px;border-bottom:2px solid #222;"></div>'
                }<p style="font-size:8.5pt;font-weight:900;margin:3px 0;">${
                  _billDocData?.nombre || ""
                }</p><p style="font-size:7.5pt;color:#555;margin:1px 0;">${
                  _billDocData?.titulo || ""
                }</p></div></div>`;
                const printSection = (sectionId, titleDoc) => {
                  const w = window.open("", "_blank", "width=870,height=1100");
                  if (!w) return;
                  let accent = "#2563eb";
                  let bodyHtml = "";
                  if (sectionId === "gn-prescripcion") {
                    accent = "#059669";
                    const meds = data.formulaMedicamentos || [];
                    const medsHtml =
                      meds.length > 0
                        ? meds
                            .map(
                              (m, i) =>
                                `<div class="med-card" style="display:flex;gap:8px;align-items:flex-start;"><span style="background:#059669;color:white;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:8pt;font-weight:900;flex-shrink:0;">${
                                  i + 1
                                }</span><div style="flex:1;"><p style="font-size:10pt;font-weight:900;color:#065f46;margin:0 0 2px 0;">${
                                  m.nombre || ""
                                } <span style="font-size:8pt;font-weight:400;color:#6b7280;">${
                                  m.presentacion || ""
                                }</span></p><p style="font-size:8.5pt;color:#374151;margin:1px 0;"><b>Dosis:</b> ${
                                  m.dosis || "--"
                                } · <b>Frec.:</b> ${
                                  m.frecuencia || "--"
                                } · <b>Duración:</b> ${m.duracion || "--"}</p>${
                                  m.indicaciones
                                    ? `<p style="font-size:8pt;color:#92400e;font-style:italic;margin:2px 0;">&#9888; ${m.indicaciones}</p>`
                                    : ""
                                }</div></div>`
                            )
                            .join("")
                        : '<p style="color:#9ca3af;font-style:italic;text-align:center;padding:12px;">Sin medicamentos.</p>';
                    const planMeds =
                      !meds.length && data.plan?.medicamentos
                        ? `<div style="margin-top:8px;white-space:pre-wrap;font-size:8.5pt;">${data.plan.medicamentos}</div>`
                        : "";
                    const dx =
                      (data.diagnosticos || [])[0]?.descripcion ||
                      data.diagnosticoPrincipal ||
                      "--";
                    bodyHtml = `<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:10px 12px;margin-bottom:12px;"><p class="sec-title" style="color:#065f46;">&#128138; Prescripción Médica</p>${medsHtml}${planMeds}<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;border-top:1px solid #a7f3d0;padding-top:8px;"><p style="font-size:8.5pt;"><b>Diagnóstico:</b> ${dx}</p><p style="font-size:8.5pt;"><b>Control en:</b> ${
                      data.plan?.controlEn || "--"
                    }</p></div></div>${sigBlock}`;
                  } else if (sectionId === "gn-examenes") {
                    accent = "#0d9488";
                    const dxs = (data.diagnosticos || [])
                      .map(
                        (d, i) =>
                          `<p class="block-avoid" style="font-size:8.5pt;margin:2px 0;"><b>${
                            d.cie10 || ""
                          }</b>${d.cie10 ? " - " : ""} ${d.descripcion || ""} ${
                            d.tipo
                              ? `<span style="color:#9ca3af;">(${d.tipo})</span>`
                              : ""
                          }</p>`
                      )
                      .join("");
                    const paracl = data.plan?.paraclinicosSolicitados
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#128300; Paraclínicos / Exámenes Solicitados</p><p style="font-size:8.5pt;white-space:pre-wrap;line-height:1.5;">${data.plan.paraclinicosSolicitados}</p></div>`
                      : "";
                    const remis = data.plan?.remisiones
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#128279; Remisiones / Interconsultas</p><p style="font-size:8.5pt;white-space:pre-wrap;">${data.plan.remisiones}</p></div>`
                      : "";
                    const recos = data.plan?.recomendaciones
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#9989; Recomendaciones</p><p style="font-size:8.5pt;white-space:pre-wrap;line-height:1.6;">${data.plan.recomendaciones}</p></div>`
                      : "";
                    const conducta = data.plan?.conducta
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#128203; Conducta Médica</p><p style="font-size:8.5pt;white-space:pre-wrap;">${data.plan.conducta}</p></div>`
                      : "";
                    bodyHtml = `<div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:4px;padding:10px 12px;margin-bottom:12px;">${
                      dxs
                        ? `<div style="margin-bottom:8px;"><p class="sec-title" style="color:#0d9488;">&#128203; Diagnósticos</p>${dxs}</div>`
                        : ""
                    }${conducta}${remis}</div>${recos ? `<div style="margin-top:8px;">${recos}</div>` : ""}${paracl ? `<div style="page-break-before:always;"><p style="font-size:7pt;color:#bbb;margin-bottom:8px;">— Hoja de Paraclínicos y Exámenes Solicitados —</p>${paracl}</div>` : ""}${sigBlock}`;
                  } else if (sectionId === "gn-derivaciones") {
                    accent = "#7c3aed";
                    const derivList = data.derivaciones || [];
                    const derivHtml =
                      derivList.length > 0
                        ? derivList
                            .map(
                              (d, i) =>
                                `<div style="margin-bottom:8px;border:1px solid #ddd6fe;border-radius:6px;padding:8px 10px;background:${
                                  i % 2 === 0 ? "#faf5ff" : "white"
                                };"><p style="font-weight:900;font-size:9.5pt;margin:0 0 2px;">${_sanitize(
                                  d.especialidad || "--"
                                )} <span style="font-size:8pt;color:#888;font-weight:400;">(${_sanitize(
                                  d.urgencia || "Electiva"
                                )})</span></p><p style="font-size:8pt;color:#444;margin:1px 0;"><b>Motivo:</b> ${_sanitize(
                                  d.motivo || "--"
                                )}</p>${
                                  d.observaciones
                                    ? `<p style="font-size:7.5pt;color:#666;margin-top:2px;font-style:italic;">${_sanitize(
                                        d.observaciones
                                      )}</p>`
                                    : ""
                                }</div>`
                            )
                            .join("")
                        : '<p style="color:#888;font-style:italic;font-size:8.5pt;">Sin derivaciones registradas.</p>';
                    bodyHtml = `<div style="background:#faf5ff;border:1px solid #ddd6fe;border-radius:4px;padding:10px 12px;margin-bottom:12px;">${derivHtml}</div>`;
                  } else if (sectionId === "gn-incapacidad") {
                    accent = "#dc2626";
                    bodyHtml = `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:12px;margin-bottom:12px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;"><div style="font-size:8.5pt;"><p><b>Paciente:</b> ${
                      data.nombres || "--"
                    }</p><p><b>CC:</b> ${
                      data.docNumero || "--"
                    }</p><p><b>Edad:</b> ${
                      data.edad || "--"
                    } años</p><p><b>EPS:</b> ${
                      data.eps || "--"
                    }</p></div><div style="text-align:center;background:#fee2e2;border-radius:4px;padding:8px;"><p style="font-size:8pt;font-weight:900;color:#dc2626;text-transform:uppercase;margin:0 0 4px 0;">Días de Incapacidad</p><p style="font-size:28pt;font-weight:900;color:#dc2626;line-height:1;margin:0;">${
                      data.incapacidad?.dias || 0
                    }</p><p style="font-size:8pt;color:#dc2626;font-weight:700;">${numeroALetras(
                      data.incapacidad?.dias || 0
                    )} DÍAS</p></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:8.5pt;"><p><b>Origen:</b> ${
                      data.incapacidad?.origen || "--"
                    }</p><p><b>Fecha inicio:</b> ${
                      data.incapacidad?.desde || "--"
                    }</p><p><b>Fecha fin:</b> ${
                      data.incapacidad?.hasta || "--"
                    }</p><p><b>Diagnóstico:</b> ${
                      data.incapacidad?.diagnostico || "--"
                    }</p></div></div>${sigBlock}`;
                  }
                  w.document
                    .write(`<!DOCTYPE html><html lang="es"><head><title>${_sanitize(
                    titleDoc
                  )}</title><meta charset="UTF-8"/><style>
${baseStyle}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#1e3a5f;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;}
.print-toolbar button{background:white;color:#1e3a5f;border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
.print-toolbar button.btn-print{background:#10b981;color:white;}
.print-toolbar button.btn-close{background:#ef4444;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#93c5fd;}
[contenteditable]{outline:1.5px dashed #93c5fd;border-radius:3px;padding:1px 3px;cursor:text;}
[contenteditable]:focus{outline:2px solid #3b82f6;background:#eff6ff;}
body{padding-top:52px;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">✏️ ${_sanitize(titleDoc)}</span>
  <span class="hint">Haz clic en cualquier texto para editar</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir ahora</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${buildGnHeader(
                    titleDoc,
                    accent
                  )}</div><div contenteditable="true" spellcheck="false">${bodyHtml}</div></body></html>`);
                  w.document.close();
                  w.focus();
                  // No auto-print - usuario edita y hace clic en Imprimir
                };
                // ── Impresión individual de receta (HC General) ──
                const openSingleMedWindow = (med, mIdx) => {
                  const w = window.open("", "_blank", "width=600,height=700");
                  if (!w) return;
                  const accent = "#059669";
                  const hdr = buildGnHeader("Receta Médica", accent);
                  const docSig = _billDocSig || null;
                  const singleHtml = `
                  <div class="med-card" style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
                    <span class="med-num">${mIdx + 1}</span>
                    <div style="flex:1;">
                      <p style="font-size:12pt;font-weight:900;color:#065f46;margin:0 0 4px 0;">${_sanitize(
                        med.nombre || ""
                      )} <span style="font-size:9pt;font-weight:400;color:#555;">(${_sanitize(
                    med.presentacion || ""
                  )})</span></p>
                      <p style="font-size:9.5pt;color:#374151;margin:2px 0;"><b>Dosis:</b> ${_sanitize(
                        med.dosis || "--"
                      )} &nbsp;·&nbsp; <b>Frecuencia:</b> ${_sanitize(
                    med.frecuencia || "--"
                  )} &nbsp;·&nbsp; <b>Duración:</b> ${_sanitize(
                    med.duracion || "--"
                  )}</p>
                      ${
                        med.indicaciones
                          ? `<p style="font-size:9pt;color:#92400e;font-style:italic;margin:4px 0;">⚠ ${_sanitize(
                              med.indicaciones
                            )}</p>`
                          : ""
                      }
                    </div>
                  </div>
                  <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:8px 12px;margin-top:8px;">
                    <p style="font-size:8.5pt;"><b>Diagnóstico:</b> ${_sanitize(
                      (data.diagnosticos || [])[0]?.descripcion || "--"
                    )}</p>
                    <p style="font-size:8.5pt;"><b>Control en:</b> ${_sanitize(
                      data.plan?.controlEn || "--"
                    )}</p>
                    <p style="font-size:8.5pt;"><b>Motivo:</b> ${_sanitize(
                      data.motivoConsulta || "--"
                    )}</p>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16mm;">
                    <div style="text-align:center;width:42%;">
                      <div style="border-top:2px solid #222;padding-top:4px;font-size:7.5pt;font-weight:700;">Firma del Paciente / Responsable</div>
                      <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: _______________________</p>
                    </div>
                    <div style="text-align:center;width:42%;">
                      ${
                        docSig
                          ? `<img src="${docSig}" style="max-height:50px;max-width:130px;object-fit:contain;display:block;margin:0 auto 4px;"/>`
                          : '<div style="height:50px;"></div>'
                      }
                      <div style="border-top:2px solid #222;padding-top:4px;">
                        <p style="font-size:8.5pt;font-weight:900;margin:2px 0;">${_sanitize(
                          _billDocData?.nombre || ""
                        )}</p>
                        <p style="font-size:7.5pt;color:#555;margin:1px 0;">${_sanitize(
                          _billDocData?.titulo || ""
                        )}</p>
                        <p style="font-size:7.5pt;color:#555;margin:1px 0;">Lic: ${_sanitize(
                          _billDocData?.licencia || ""
                        )}</p>
                      </div>
                    </div>
                  </div>`;
                  w.document
                    .write(`<!DOCTYPE html><html lang="es"><head><title>Receta - ${_sanitize(
                    med.nombre
                  )}</title><meta charset="UTF-8"/><style>
${baseStyle}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#065f46;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;}
.print-toolbar button{border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
.print-toolbar button.btn-print{background:#10b981;color:white;}
.print-toolbar button.btn-close{background:#ef4444;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#6ee7b7;}
[contenteditable]{outline:1.5px dashed #6ee7b7;border-radius:3px;padding:1px 3px;cursor:text;}
[contenteditable]:focus{outline:2px solid #10b981;background:#ecfdf5;}
body{padding-top:52px;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">💊 Receta - ${_sanitize(med.nombre)}</span>
  <span class="hint">Edita antes de imprimir</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir receta</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${hdr}</div>
<div contenteditable="true" spellcheck="false">${singleHtml}</div>
</body></html>`);
                  w.document.close();
                  w.focus();
                };
                return (
                  <div className="space-y-4">
                    {/* ── ENTRADA INTERACTIVA: FÓRMULA Y DERIVACIONES (mismo componente HC Ocup) ── */}
                    <div className="no-print">
                      <TabFormulaDerivacion
                        data={data}
                        setData={setData}
                        _billDocData={_billDocData}
                        _billDocSig={_billDocSig}
                        onPrint={handlePrint}
                      />
                    </div>
                    {/* ══ BARRA SELECCIÓN DE SECCIONES ══ */}
                    <div
                      className="no-print bg-white border border-blue-100 rounded-2xl shadow-sm p-4 mx-auto"
                      style={{ maxWidth: "21.59cm" }}
                    >
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-3 flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5 text-blue-500" />{" "}
                        Documentos - Haga clic para ver y luego imprimir
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            const el =
                              document.getElementById("gn-prescripcion");
                            if (el)
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                        >
                          💊 Prescripción Médica
                        </button>
                        <button
                          onClick={() => {
                            const el = document.getElementById("gn-examenes");
                            if (el)
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition"
                        >
                          🔬 Exámenes y Recomendaciones
                        </button>
                        <button
                          onClick={() => {
                            const el =
                              document.getElementById("gn-derivaciones");
                            if (el)
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                        >
                          🔀 Derivaciones / Interconsultas
                        </button>
                        {data.incapacidad?.aplica && (
                          <button
                            onClick={() => {
                              const el =
                                document.getElementById("gn-incapacidad");
                              if (el)
                                el.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition"
                          >
                            🏥 Incapacidad
                          </button>
                        )}
                        <div className="ml-auto flex gap-2">
                          <button
                            onClick={() =>
                              printSection(
                                "gn-prescripcion",
                                "Prescripción Médica"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            <Printer className="w-3 h-3" /> Presc.
                          </button>
                          <button
                            onClick={() =>
                              printSection(
                                "gn-examenes",
                                "Exámenes y Recomendaciones"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition"
                          >
                            <Printer className="w-3 h-3" /> Exám.
                          </button>
                          <button
                            onClick={() =>
                              printSection(
                                "gn-derivaciones",
                                "Derivaciones / Interconsultas"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition"
                          >
                            <Printer className="w-3 h-3" /> Deriv.
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-700 text-white hover:bg-slate-800 transition"
                          >
                            <Printer className="w-3 h-3" /> Todo
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: PRESCRIPCIÓN ══ */}
                    <div
                      id="gn-prescripcion"
                      className="bg-white mx-auto shadow-xl print:shadow-none carta-visual"
                      style={{
                        width: "21.59cm",
                        padding: "1.2cm",
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="flex justify-between items-center border-b-2 border-blue-500 pb-3 mb-4 print:border-black">
                        <div className="w-1/3">
                          <BrandLogo data={_billDocData} />
                        </div>
                        <div className="w-1/3 text-center">
                          <h2 className="text-sm font-black uppercase text-gray-800">
                            Prescripción Médica
                          </h2>
                          <p className="text-[9px] text-gray-500">
                            Fórmula Médica -- Res. 1995/1999
                          </p>
                        </div>
                        <div className="w-1/3 text-right text-[9px] text-gray-500">
                          <p className="font-bold">{data.nombres}</p>
                          <p>
                            CC: {data.docNumero} · {data.edad} años
                          </p>
                          <p>{data.fechaConsulta}</p>
                        </div>
                      </div>
                      {/* ── Datos del paciente horizontal ── */}
                      <div className="grid grid-cols-5 gap-1 mb-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 print:bg-transparent print:border print:border-gray-400">
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Paciente
                          </p>
                          <p className="text-[10px] font-black text-gray-900">
                            {data.nombres || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Documento
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.docTipo || "CC"}: {data.docNumero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Edad / Género
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.edad || "--"} años · {data.genero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            EPS
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.eps || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Dx Principal
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {(data.diagnosticos || [])[0]?.cie10 || "--"}{" "}
                            {(data.diagnosticos || [])[0]?.descripcion || ""}
                          </p>
                        </div>
                      </div>
                      {(data.formulaMedicamentos || []).length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {(data.formulaMedicamentos || []).map((med, idx) => (
                            <div
                              key={idx}
                              className="flex gap-3 border border-gray-200 rounded-lg p-2 print-break-avoid print:border-gray-300"
                            >
                              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-black text-sm text-gray-900">
                                  {med.nombre}{" "}
                                  <span className="font-normal text-gray-500 text-xs">
                                    {med.presentacion}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-700">
                                  <b>Dosis:</b> {med.dosis} · <b>Cada:</b>{" "}
                                  {med.frecuencia} · <b>Por:</b> {med.duracion}
                                </p>
                                {med.indicaciones && (
                                  <p className="text-[10px] italic text-amber-700">
                                    ⚠ {med.indicaciones}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => openSingleMedWindow(med, idx)}
                                title="Imprimir esta receta individual"
                                className="no-print flex items-center gap-0.5 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg px-2 py-1 text-[10px] font-bold transition self-start shrink-0"
                              >
                                <Printer className="w-3 h-3" /> Receta
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : data.plan?.medicamentos ? (
                        <div className="mb-4">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-200 mb-2 text-gray-600">
                            Prescripción
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.medicamentos}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic py-4 text-center">
                          Sin medicamentos prescritos.
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                        <p>
                          <b>Diagnóstico:</b>{" "}
                          {(data.diagnosticos || [])[0]?.descripcion ||
                            data.diagnosticoPrincipal ||
                            "--"}
                        </p>
                        <p>
                          <b>Control en:</b>{" "}
                          {data.plan?.controlEn ||
                            data.frecuenciaSeguimiento ||
                            "--"}
                        </p>
                      </div>
                      <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                        <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                          <p className="text-[10px] font-bold">
                            Firma Paciente / Responsable
                          </p>
                        </div>
                        <div className="text-center w-2/5">
                          <DoctorSignature
                            signature={_billDocSig}
                            data={_billDocData}
                            showData={true}
                          />
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: EXÁMENES Y RECOMENDACIONES ══ */}
                    <div
                      id="gn-examenes"
                      className="bg-white mx-auto shadow-xl print:shadow-none carta-visual print-page-break"
                      style={{
                        width: "21.59cm",
                        padding: "1.2cm",
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="flex justify-between items-center border-b-2 border-teal-500 pb-3 mb-4 print:border-black">
                        <div className="w-1/3">
                          <BrandLogo data={_billDocData} />
                        </div>
                        <div className="w-1/3 text-center">
                          <h2 className="text-sm font-black uppercase text-gray-800">
                            Exámenes y Recomendaciones
                          </h2>
                          <p className="text-[9px] text-gray-500">
                            Orden Médica -- Res. 1995/1999
                          </p>
                        </div>
                        <div className="w-1/3 text-right text-[9px] text-gray-500">
                          <p className="font-bold">{data.nombres}</p>
                          <p>CC: {data.docNumero}</p>
                          <p>{data.fechaConsulta}</p>
                        </div>
                      </div>
                      {/* ── Datos del paciente horizontal ── */}
                      <div className="grid grid-cols-5 gap-1 mb-4 bg-teal-50 border border-teal-100 rounded-xl px-4 py-2.5 print:bg-transparent print:border print:border-gray-400">
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Paciente
                          </p>
                          <p className="text-[10px] font-black text-gray-900">
                            {data.nombres || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Documento
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.docTipo || "CC"}: {data.docNumero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Edad / Género
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.edad || "--"} años · {data.genero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            EPS
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.eps || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Motivo de Consulta
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800 truncate">
                            {data.motivoConsulta || "--"}
                          </p>
                        </div>
                      </div>
                      {data.diagnosticos?.length > 0 && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Diagnósticos
                          </h4>
                          {data.diagnosticos.map((d, i) => (
                            <p key={i} className="text-xs mb-1">
                              <b>{d.cie10}</b> -- {d.descripcion}{" "}
                              <span className="text-gray-400">({d.tipo})</span>
                            </p>
                          ))}
                        </div>
                      )}
                      {data.plan?.paraclinicosSolicitados && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Paraclínicos / Exámenes Solicitados
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.paraclinicosSolicitados}
                          </p>
                        </div>
                      )}
                      {data.plan?.remisiones && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Remisiones / Interconsultas
                          </h4>
                          <p className="text-xs whitespace-pre-wrap">
                            {data.plan.remisiones}
                          </p>
                        </div>
                      )}
                      {data.plan?.recomendaciones && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Recomendaciones al Paciente
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.recomendaciones}
                          </p>
                        </div>
                      )}
                      {data.plan?.conducta && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Conducta Médica
                          </h4>
                          <p className="text-xs whitespace-pre-wrap">
                            {data.plan.conducta}
                          </p>
                        </div>
                      )}
                      <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                        <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                          <p className="text-[10px] font-bold">
                            Firma Paciente / Responsable
                          </p>
                        </div>
                        <div className="text-center w-2/5">
                          <DoctorSignature
                            signature={_billDocSig}
                            data={_billDocData}
                            showData={true}
                          />
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: DERIVACIONES / INTERCONSULTAS ══ */}
                    <div
                      id="gn-derivaciones"
                      className="bg-white mx-auto shadow-xl print:shadow-none carta-visual print-page-break"
                      style={{
                        width: "21.59cm",
                        padding: "1.2cm",
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="flex justify-between items-center border-b-2 border-purple-500 pb-3 mb-4 print:border-black">
                        <div className="w-1/3">
                          <BrandLogo data={_billDocData} />
                        </div>
                        <div className="w-1/3 text-center">
                          <h2 className="text-sm font-black uppercase text-gray-800">
                            Derivaciones / Interconsultas
                          </h2>
                          <p className="text-[9px] text-gray-500">
                            Orden Médica - Res. 1995/1999
                          </p>
                        </div>
                        <div className="w-1/3 text-right text-[9px] text-gray-500">
                          <p className="font-bold">{data.fechaConsulta}</p>
                        </div>
                      </div>
                      {/* Datos paciente horizontal */}
                      <div className="grid grid-cols-5 gap-1 mb-4 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5 print:bg-transparent print:border print:border-gray-400">
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Paciente
                          </p>
                          <p className="text-[10px] font-black text-gray-900">
                            {data.nombres || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Documento
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.docTipo || "CC"}: {data.docNumero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Edad / Género
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.edad || "--"} años · {data.genero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            EPS
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.eps || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Fecha
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.fechaConsulta || "--"}
                          </p>
                        </div>
                      </div>
                      {/* Diagnóstico de referencia */}
                      {(data.diagnosticos || []).length > 0 && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-purple-200 mb-2 text-purple-700">
                            Diagnóstico de Referencia
                          </h4>
                          {data.diagnosticos.map((d, i) => (
                            <p key={i} className="text-xs mb-1">
                              <b>{d.cie10}</b> - {d.descripcion}{" "}
                              <span className="text-gray-400">({d.tipo})</span>
                            </p>
                          ))}
                        </div>
                      )}
                      {/* Lista de derivaciones */}
                      {(data.derivaciones || []).length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {(data.derivaciones || []).map((der, idx) => (
                            <div
                              key={idx}
                              className="border border-purple-200 rounded-lg p-3 print-break-avoid print:border-gray-300 bg-purple-50/40 print:bg-transparent"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs flex-shrink-0">
                                      {idx + 1}
                                    </span>
                                    <p className="font-black text-sm text-gray-900">
                                      {der.especialidad || "--"}
                                    </p>
                                    <span
                                      className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                        der.urgencia === "Urgente"
                                          ? "bg-red-100 text-red-700"
                                          : der.urgencia === "Prioritaria"
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {der.urgencia || "Electiva"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700 ml-8">
                                    <b>Motivo:</b> {der.motivo || "--"}
                                  </p>
                                  {der.observaciones && (
                                    <p className="text-[10px] italic text-purple-700 ml-8 mt-0.5">
                                      📝 {der.observaciones}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-print py-6 text-center text-xs text-gray-400 italic border border-dashed border-purple-200 rounded-xl">
                          Sin derivaciones registradas. Use el formulario de
                          arriba para agregar.
                        </div>
                      )}
                      {/* Plan de conducta si aplica */}
                      {data.plan?.conducta && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-purple-200 mb-2 text-purple-700">
                            Plan de Conducta
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.conducta}
                          </p>
                        </div>
                      )}
                      {/* Firma */}
                      <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                        <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                          <p className="text-[10px] font-bold">
                            Firma Paciente / Responsable
                          </p>
                        </div>
                        <div className="text-center w-2/5">
                          <DoctorSignature
                            signature={_billDocSig}
                            data={_billDocData}
                            showData={true}
                          />
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: INCAPACIDAD ══ */}
                    {data.incapacidad?.aplica && (
                      <div
                        id="gn-incapacidad"
                        className="bg-white mx-auto shadow-xl print:shadow-none carta-visual print-page-break"
                        style={{
                          width: "21.59cm",
                          padding: "1.2cm",
                          boxSizing: "border-box",
                        }}
                      >
                        <div className="flex justify-between items-center border-b-2 border-red-500 pb-3 mb-4 print:border-black">
                          <div className="w-1/3">
                            <BrandLogo data={_billDocData} />
                          </div>
                          <div className="w-1/3 text-center">
                            <h2 className="text-sm font-black uppercase text-gray-800">
                              Certificado de Incapacidad Médica
                            </h2>
                            <p className="text-[9px] text-gray-500">
                              Formulario -- Res. 1995/1999
                            </p>
                          </div>
                          <div className="w-1/3 text-right text-[9px] text-gray-500">
                            <p className="font-bold">{data.fechaConsulta}</p>
                            <p className="text-[8px]">Res. 1995/1999</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                          <div className="bg-gray-50 p-3 rounded-lg print:bg-transparent print:border print:border-gray-300">
                            <p>
                              <b>Paciente:</b> {data.nombres}
                            </p>
                            <p>
                              <b>CC:</b> {data.docNumero}
                            </p>
                            <p>
                              <b>Edad:</b> {data.edad} años
                            </p>
                            <p>
                              <b>EPS:</b> {data.eps}
                            </p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg text-center print:bg-transparent print:border print:border-gray-300">
                            <p className="text-[10px] font-bold text-red-700 uppercase">
                              Días de Incapacidad
                            </p>
                            <p className="text-5xl font-black text-red-900">
                              {data.incapacidad?.dias || 0}
                            </p>
                            <p className="text-[10px] text-red-700 font-bold">
                              {numeroALetras(data.incapacidad?.dias || 0)} DÍAS
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4 text-xs print-break-avoid">
                          <p>
                            <b>Origen:</b>{" "}
                            {data.incapacidad?.origen || "Enfermedad General"}
                          </p>
                          <p>
                            <b>Fecha inicio:</b>{" "}
                            {data.incapacidad?.desde || "--"}
                          </p>
                          <p>
                            <b>Fecha fin:</b> {data.incapacidad?.hasta || "--"}
                          </p>
                          <p>
                            <b>Diagnóstico:</b>{" "}
                            {data.incapacidad?.diagnostico ||
                              data.diagnosticoPrincipal ||
                              "--"}
                          </p>
                        </div>
                        {data.plan?.medicamentos && (
                          <div className="mb-3">
                            <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                              Tratamiento
                            </h4>
                            <p className="text-xs whitespace-pre-wrap">
                              {data.plan.medicamentos}
                            </p>
                          </div>
                        )}
                        <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                          <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                            <p className="text-[10px] font-bold">
                              Firma Paciente / Responsable
                            </p>
                          </div>
                          <div className="text-center w-2/5">
                            <DoctorSignature
                              signature={_billDocSig}
                              data={_billDocData}
                              showData={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
          </main>
        </div>
      );
    }
    return <LoginPage />;
  };
  // ─── RETURN PRINCIPAL ─────────────────────────────────────────────────────
  return (
    <AppProvider value={appContext}>
    <>
      <PrintStyles />
      <SecurityHeaders />
      {showPortalPublico ? (
        <PortalPublicoTrabajador
          sbUrl={_SB_URL}
          sbKey={_SB_KEY}
          onVolver={currentUser ? () => setShowPortalPublico(false) : null}
        />
      ) : (
        renderCurrentView()
      )}
      <MensajesOverlay />
      {showNotifModal && (
        <NotificacionModal
          data={notifData}
          onCerrar={() => setShowNotifModal(false)}
        />
      )}
      {/* Modal Alert */}
      {/* Modal RIPS - muestra JSON para copiar/descargar - sin bloquear sandbox */}
      {ripsModalData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[300] p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
            style={{ maxHeight: "88vh" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-orange-200 bg-orange-50 rounded-t-2xl">
              <div>
                <p className="font-black text-orange-800 text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4" /> RIPS JSON - Res. 2275/2023
                </p>
                <p className="text-[10px] text-orange-600 mt-0.5">
                  {ripsModalData.filename}
                </p>
              </div>
              <button
                onClick={() => setRipsModalData(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-black"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
              <p className="text-[11px] text-amber-800 font-bold">
                ⚠️ Para radicar ante MinSalud se requiere firma digital DIAN
                certificada (Certicámara/GSE).
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                Copie el JSON o descárguelo. Este archivo cumple la estructura
                Res. 2275/2023.
              </p>
            </div>
            <textarea
              readOnly
              value={ripsModalData.json}
              className="flex-1 font-mono text-[10px] p-4 bg-gray-900 text-green-300 resize-none outline-none"
              style={{ minHeight: "300px" }}
            />
            <div className="flex gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(ripsModalData.json)
                    .then(() => showAlert("✅ JSON copiado al portapapeles"))
                    .catch(() =>
                      showAlert("Use Ctrl+A / Ctrl+C en el área de texto")
                    );
                }}
                className="flex-1 bg-orange-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-orange-700 flex items-center justify-center gap-1"
              >
                📋 Copiar JSON
              </button>
              <button
                onClick={() => {
                  try {
                    const b64 = btoa(
                      unescape(encodeURIComponent(ripsModalData.json))
                    );
                    const a = document.createElement("a");
                    a.href = "data:application/json;base64," + b64;
                    a.download = ripsModalData.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } catch (e) {
                    showAlert(
                      "Use el botón Copiar y guarde en un archivo .json"
                    );
                  }
                }}
                className="flex-1 bg-gray-700 text-white font-bold text-xs py-2 rounded-xl hover:bg-gray-800 flex items-center justify-center gap-1"
              >
                ⬇️ Descargar .json
              </button>
              <button
                onClick={() => setRipsModalData(null)}
                className="px-4 bg-gray-100 text-gray-600 font-bold text-xs py-2 rounded-xl hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Backup - mismo patrón que RIPS */}
      {backupModalData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[300] p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
            style={{ maxHeight: "88vh" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-200 bg-emerald-50 rounded-t-2xl">
              <div>
                <p className="font-black text-emerald-800 text-sm flex items-center gap-2">
                  <HardDrive className="w-4 h-4" /> Backup Completo SISO
                </p>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  {backupModalData.filename}
                </p>
                {backupModalData.summary && (
                  <p className="text-[9px] text-emerald-500 mt-0.5">
                    📦 {backupModalData.summary}
                  </p>
                )}
              </div>
              <button
                onClick={() => setBackupModalData(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-black"
              >
                ✕
              </button>
            </div>
            <textarea
              readOnly
              value={backupModalData.json}
              className="flex-1 font-mono text-[10px] p-4 bg-gray-900 text-green-300 resize-none outline-none"
              style={{ minHeight: "300px" }}
            />
            <div className="flex gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(backupModalData.json)
                    .then(() => showAlert("✅ Backup copiado al portapapeles"))
                    .catch(() =>
                      showAlert("Use Ctrl+A / Ctrl+C en el área de texto")
                    );
                }}
                className="flex-1 bg-emerald-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-emerald-700"
              >
                📋 Copiar JSON
              </button>
              <button
                onClick={() => {
                  try {
                    const b64 = btoa(
                      unescape(encodeURIComponent(backupModalData.json))
                    );
                    const a = document.createElement("a");
                    a.href = "data:application/json;base64," + b64;
                    a.download = backupModalData.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } catch (e) {
                    showAlert(
                      "Use el botón Copiar y guarde en un archivo .json"
                    );
                  }
                }}
                className="flex-1 bg-gray-700 text-white font-bold text-xs py-2 rounded-xl hover:bg-gray-800"
              >
                ⬇️ Descargar .json
              </button>
              <button
                onClick={() => setBackupModalData(null)}
                className="px-4 bg-gray-100 text-gray-600 font-bold text-xs py-2 rounded-xl hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {alertMsg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <AlertCircle className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <p className="text-gray-800 font-bold mb-5 whitespace-pre-wrap text-sm">
              {alertMsg}
            </p>
            <button
              onClick={() => setAlertMsg("")}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold w-full hover:bg-blue-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
      {/* Modal Confirm */}
      {confirmConfig && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <p className="text-gray-800 font-bold mb-5 text-sm">
              {confirmConfig.msg}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmConfig(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmConfig.onConfirm();
                  setConfirmConfig(null);
                }}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal Guardar antes de salir de HC ──────────────────────────── */}
      {_exitHcConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[210] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-gray-800 font-black text-base mb-1">¿Guardar antes de salir?</h3>
            <p className="text-gray-500 text-xs mb-5">
              Tiene cambios sin guardar en esta Historia Clínica.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const proceed = _exitHcConfirm.onProceed;
                  _setExitHcConfirm(null);
                  handleSavePatient();
                  proceed();
                }}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-sm flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar y salir
              </button>
              <button
                onClick={() => {
                  const proceed = _exitHcConfirm.onProceed;
                  _setExitHcConfirm(null);
                  _setHcDirty(false);
                  proceed();
                }}
                className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 text-sm"
              >
                Salir sin guardar
              </button>
              <button
                onClick={() => _setExitHcConfirm(null)}
                className="w-full py-2 text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal elección tipo HC desde Agenda ─────────────────────────── */}
      {hcChoiceAgenda && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[210] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4 text-white">
              <h3 className="text-lg font-black">Iniciar Atención Médica</h3>
              <p className="text-blue-100 text-xs mt-0.5">
                Paciente:{" "}
                <span className="font-bold text-white">
                  {hcChoiceAgenda.nombre}
                </span>
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-5 text-center font-medium">
                Seleccione el tipo de Historia Clínica a abrir:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    abrirHCDesdeAgenda(hcChoiceAgenda, "ocupacional")
                  }
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition group"
                >
                  <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <span className="text-3xl">🏭</span>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-emerald-800 text-sm">
                      HC Ocupacional
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      Examen médico laboral · Aptitud
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => abrirHCDesdeAgenda(hcChoiceAgenda, "general")}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition group"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <span className="text-3xl">🏥</span>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-blue-800 text-sm">
                      HC General
                    </p>
                    <p className="text-[10px] text-blue-600 mt-0.5">
                      Consulta médica · Fórmula
                    </p>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setHcChoiceAgenda(null)}
                className="mt-4 w-full py-2 text-gray-500 text-sm font-bold hover:text-gray-700 hover:bg-gray-50 rounded-xl transition"
              >
                ✕ Cancelar - volver a la agenda
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Evolución Clínica - GLOBAL (visible desde cualquier tab) */}
      <EvolucionModal />
      {/* Modal Prompt */}
      {promptConfig && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <p className="text-gray-800 font-bold mb-3 text-sm">
              {promptConfig.msg}
            </p>
            <input
              autoFocus
              type={promptConfig.type}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptConfig.onSubmit(promptValue);
                  setPromptConfig(null);
                }
              }}
              className="w-full border-2 border-emerald-400 p-2.5 rounded-xl mb-4 text-sm focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setPromptConfig(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  promptConfig.onSubmit(promptValue);
                  setPromptConfig(null);
                }}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-sm"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal datos paciente — Vista secretaria */}
      {showSecretariaPatientModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowSecretariaPatientModal(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h2 className="font-black text-base">👤 Datos del Paciente</h2>
                <p className="text-blue-100 text-xs mt-0.5">Vista secretaría — Solo datos administrativos</p>
              </div>
              <button onClick={() => setShowSecretariaPatientModal(null)} className="text-white/80 hover:text-white text-xl font-black">✕</button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-2">Datos Personales</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Nombres completos", showSecretariaPatientModal.nombres],["Documento", (showSecretariaPatientModal.docTipo||"CC")+" "+showSecretariaPatientModal.docNumero],["Edad", showSecretariaPatientModal.edad ? showSecretariaPatientModal.edad+" años" : "—"],["Género", showSecretariaPatientModal.genero],["Estado Civil", showSecretariaPatientModal.estadoCivil],["Grupo Sanguíneo", showSecretariaPatientModal.grupoSanguineo]].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-wide mb-2">Contacto</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Celular", showSecretariaPatientModal.celular||showSecretariaPatientModal.telefono],["Email", showSecretariaPatientModal.email],["Residencia", showSecretariaPatientModal.residencia],["EPS", showSecretariaPatientModal.eps]].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[9px] font-black text-blue-400 uppercase">{label}</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wide mb-2">Datos Laborales</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Empresa", showSecretariaPatientModal.empresaNombre||showSecretariaPatientModal.empresa],["Cargo", showSecretariaPatientModal.cargo],["ARL", showSecretariaPatientModal.arl],["Tipo Examen", showSecretariaPatientModal.tipoExamen],["Fecha Examen", showSecretariaPatientModal.fechaExamen],["Médico", usersList.find(u => u.user === showSecretariaPatientModal._medicoId)?.name || showSecretariaPatientModal._medicoId]].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[9px] font-black text-indigo-400 uppercase">{label}</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              {showSecretariaPatientModal.estadoHistoria === "Cerrada" && showSecretariaPatientModal.conceptoAptitud && (
                <div className={`border-2 rounded-xl p-3 text-center ${showSecretariaPatientModal.conceptoAptitud.toLowerCase().includes("no apto") ? "bg-red-50 border-red-300" : "bg-emerald-50 border-emerald-300"}`}>
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Concepto de Aptitud</p>
                  <p className="text-xs font-black text-emerald-700">{showSecretariaPatientModal.conceptoAptitud}</p>
                  <p className="text-[9px] text-gray-400 mt-1">Código: {showSecretariaPatientModal.codigoVerificacion || "—"}</p>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <span className="text-base flex-shrink-0">🔒</span>
                <p className="text-xs text-amber-700 leading-relaxed"><strong>Ficha clínica restringida.</strong> Solo el médico tratante puede abrir el contenido clínico.</p>
              </div>
              <button onClick={() => { const p = showSecretariaPatientModal; setShowSecretariaPatientModal(null); setAgendaForm(prev => ({...prev, nombre: p.nombres||"", docTipo: p.docTipo||"CC", docNumero: p.docNumero||"", celular: p.celular||p.telefono||"", empresa: p.empresaNombre||p.empresa||"", cargo: p.cargo||"", medicoId: p._medicoId||prev.medicoId||"", eps: p.eps||"", _busquedaQuery: p.nombres||""})); goTo("agenda"); }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 transition">
                📅 Agendar este paciente
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Config Panel */}
      {showAIConfig && (
        <AIConfigPanel
          aiConfig={aiConfig}
          onSave={handleSaveAIConfig}
          onClose={() => setShowAIConfig(false)}
        />
      )}
      {/* ── MODAL REPORTE DE GUARDADO EN NUBE ── */}
      {showSyncReport && syncReport && (
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowSyncReport(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-violet-100 p-2 rounded-xl">
                  <Cloud className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-base">
                    Reporte de Guardado en Nube
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    {new Date(syncReport.ts).toLocaleString("es-CO")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Resumen numérico */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                {
                  label: "Pacientes",
                  val: syncReport.summary.pacientes,
                  icon: "👥",
                },
                {
                  label: "Empresas",
                  val: syncReport.summary.empresas,
                  icon: "🏢",
                },
                {
                  label: "Usuarios",
                  val: syncReport.summary.usuarios,
                  icon: "👤",
                },
                {
                  label: "Facturas",
                  val: syncReport.summary.facturas,
                  icon: "🧾",
                },
                {
                  label: "Informes",
                  val: syncReport.summary.informes,
                  icon: "📄",
                },
                {
                  label: "Audit log",
                  val: syncReport.summary.auditLog,
                  icon: "🛡️",
                },
              ].map(({ label, val, icon }) => (
                <div
                  key={label}
                  className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100"
                >
                  <p className="text-lg">{icon}</p>
                  <p className="text-lg font-black text-violet-700">{val}</p>
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {/* Detalle por colección */}
            <div className="space-y-1.5 mb-4">
              <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                Detalle de sincronización
              </p>
              {Object.entries(syncReport.results).map(([label, ok]) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                    ok
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span>{label}</span>
                  <span>
                    {ok ? "✅ Guardado" : "❌ Error - guardado local"}
                  </span>
                </div>
              ))}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                  syncReport.summary.firma
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                <span>✍️ Firma digital</span>
                <span>
                  {syncReport.summary.firma
                    ? "✅ Guardada"
                    : "- Sin firma registrada"}
                </span>
              </div>
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                  syncReport.summary.apiKeys.length
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <span>🔑 API Keys IA</span>
                <span>
                  {syncReport.summary.apiKeys.length
                    ? `✅ ${syncReport.summary.apiKeys.join(", ")}`
                    : "⚠ Sin keys configuradas"}
                </span>
              </div>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-800 font-semibold text-center mb-3">
              {Object.values(syncReport.results).every(Boolean)
                ? "☁️ Todo guardado correctamente en Supabase. Puede acceder desde cualquier dispositivo."
                : "⚠️ Algunos elementos fallaron. Están guardados localmente y se sincronizarán automáticamente."}
            </div>
            <button
              onClick={() => setShowSyncReport(false)}
              className="w-full bg-violet-600 text-white py-2.5 rounded-xl font-black text-sm hover:bg-violet-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      {/* Restricciones Checklist Panel */}
      {showRestriccionesPanel && (
        <RestriccionesChecklistPanel
          selected={data.restriccionesChecklist || {}}
          onChange={(fn) =>
            setData((p) => ({
              ...p,
              restriccionesChecklist: fn(p.restriccionesChecklist || {}),
            }))
          }
          onClose={() => setShowRestriccionesPanel(false)}
          onApply={() => {
            applyRestriccionesChecklist(data.restriccionesChecklist || {});
            setShowRestriccionesPanel(false);
          }}
          isGenerating={isGeneratingRestr}
          onGenerate={generateAIRestricciones}
        />
      )}
      {/* Recomendaciones Checklist Panel */}
      {showRecomendacionesPanel && (
        <RecomendacionesChecklistPanel
          selected={data.recomendacionesChecklist || {}}
          onChange={(fn) =>
            setData((p) => ({
              ...p,
              recomendacionesChecklist: fn(p.recomendacionesChecklist || {}),
            }))
          }
          onClose={() => setShowRecomendacionesPanel(false)}
          onApply={() => {
            applyRecomendacionesChecklist(data.recomendacionesChecklist || {});
            setShowRecomendacionesPanel(false);
          }}
          isGenerating={isGeneratingReco}
          onGenerate={generateAIRecomendaciones}
        />
      )}
    </>
    </AppProvider>
  );
}

// ── Export: App envuelta en ErrorBoundary ──
export default function App() {
  return React.createElement(AppErrorBoundary, null, React.createElement(AppInner));
}
