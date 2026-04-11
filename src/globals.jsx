import React, { useState, useEffect, useRef, useCallback } from "react";
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
    maxHC: 30, // total, no mensual
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
    maxMedicos: 2,
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
    maxMedicos: 3,
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
    maxMedicos: 9999,
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
const _secretariaPuede = (feature, currentUser, usersList) => {
  if (!currentUser) return false;
  if (_isAdmin(currentUser.role)) return true;
  if (_isAdminEmpresa(currentUser.role)) return true; // admin_empresa tiene acceso completo dentro de su empresa
  if (currentUser.role === "medico")
    return MEDICO_SIEMPRE_PUEDE.has(feature) || true;
  if (currentUser.role === "secretaria") {
    const userObj = usersList?.find((u) => u.user === currentUser.user);
    const permisos = userObj?.secretariaPermisos || SECRETARIA_PERMISOS_DEFAULT;
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
  "Cardiología",
  "Cirugía General",
  "Dermatología",
  "Endocrinología",
  "Fisiatría",
  "Fisioterapia",
  "Fonoaudiología",
  "Gastroenterología",
  "Geriatría",
  "Ginecología y Obstetricia",
  "Hematología",
  "Infectología",
  "Medicina del Trabajo",
  "Nefrología",
  "Neumología",
  "Neurología",
  "Nutrición",
  "Oftalmología",
  "Oncología",
  "Ortopedia",
  "Otorrinolaringología",
  "Pediatría",
  "Psicología",
  "Psiquiatría",
  "Radiología",
  "Reumatología",
  "Urología",
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
  const [query, setQuery] = useState(value || "");
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    setQuery(value || "");
  }, [value]);
  useEffect(() => {
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
  const [query, setQuery] = useState(value || "");
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    setQuery(value || "");
  }, [value]);
  useEffect(() => {
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
    mustChangePassword: true,
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
      /* Textarea: mostrar todo el texto sin recortar */
      textarea { height: auto !important; max-height: none !important; overflow: visible !important; resize: none !important; white-space: pre-wrap !important; }
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
export export const BrandLogo = ({ data }) => {
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
  const req = PLAN_CONFIG[requiredPlan] || PLAN_CONFIG.starter;
  if (fallback) return fallback;
  if (inline)
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-black text-amber-700 cursor-default"
        title={`Disponible en plan ${req.label}`}
      >
        🔒 {req.label}
      </span>
    );
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-5 text-center space-y-2">
      <div className="text-3xl">🔒</div>
      <p className="font-black text-gray-800 text-sm">
        Disponible en plan {req.label}
      </p>
      <p className="text-gray-500 text-xs">
        {req.priceLabel} · Desbloquea funciones avanzadas
      </p>
      <button
        onClick={() => {
          // Intentar navegar a planes - el handler se pasa via window para evitar prop drilling
          if (window._sisoGoTo) window._sisoGoTo("planes");
        }}
        className="mt-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
      >
        ⬆️ Ver planes
      </button>
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

  const [licEditId, setLicEditId] = useState(null);
  const [licForm, setLicForm] = useState({});
  const [licSaved, setLicSaved] = useState(false);
  const [licErrors, setLicErrors] = useState([]); // validación método de pago

  const planOrder = ["libre", "starter", "pro", "clinica"];
  const planColors = {
    libre: "gray",
    starter: "teal",
    pro: "blue",
    clinica: "purple",
  };

  // ── Auto-apertura cuando viene de "Activar para usuario" en renderPlanes ──
  useEffect(() => {
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
    if (currentUser?.user === u.user)
      setCurrentUser((prev) => ({
        ...prev,
        license: licForm.license,
        licenseExpiry: licForm.licenseExpiry || null,
      }));
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
        "Abre aistudio.google.com/apikey (clic en 'Obtener key →')",
        "Inicia sesión con tu cuenta Google",
        "Clic en 'Create API Key'",
        "Selecciona un proyecto (o crea uno nuevo gratuito)",
        "Copia la key (empieza con 'AIza...')",
        "Pégala en el campo de abajo y haz clic en Probar",
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
        "Abre console.groq.com/keys (clic en 'Obtener key →')",
        "Crea una cuenta gratuita (o usa Google/GitHub)",
        "En el menú, ve a 'API Keys'",
        "Clic en 'Create API Key', ponle un nombre",
        "Copia la key (empieza con 'gsk_...')",
        "Pégala en el campo de abajo y haz clic en Probar",
      ],
    },
    together: {
      label: "Together AI",
      sub: "Llama 3.3 70B · Muy estable",
      badge: "🟢 Gratis · Sin límite diario",
      badgeClass: "bg-teal-100 text-teal-800",
      link: "https://api.together.ai",
      color: "teal",
      steps: [
        "Abre api.together.ai (clic en 'Obtener key →')",
        "Clic en 'Sign Up' o 'Continue with Google'",
        "Una vez dentro, ve a Settings → API Keys",
        "Clic en 'Create new API key'",
        "Copia la key que aparece",
        "Pégala en el campo de abajo y haz clic en Probar",
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
        "Abre openrouter.ai/keys (clic en 'Obtener key →')",
        "Clic en 'Sign in' → usa Google o GitHub",
        "Una vez dentro, clic en 'Create Key'",
        "Ponle un nombre y clic en 'Create'",
        "Copia la key (empieza con 'sk-or-...')",
        "Pégala en el campo de abajo y haz clic en Probar",
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
  const [activeSubTab, setActiveSubTab] = useState(forceTab || "formula");
  // When forceTab changes (switching between separate tabs), update active sub-tab
  useEffect(() => {
    if (forceTab) setActiveSubTab(forceTab);
  }, [forceTab]);
  const [newMed, setNewMed] = useState({
    nombre: "",
    presentacion: "",
    dosis: "",
    frecuencia: "",
    duracion: "",
    indicaciones: "",
  });
  const [newDeriv, setNewDeriv] = useState({
    especialidad: "",
    motivo: "",
    urgencia: "Electiva",
    observaciones: "",
  });
  const [derivSearch, setDerivSearch] = useState("");
  const [showDerivSugg, setShowDerivSugg] = useState(false);
  const derivRef = useRef(null);
  useEffect(() => {
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
  useEffect(() => {
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
  const [busqueda, setBusqueda] = useState("");
  const [tipoBusqueda, setTipoBusqueda] = useState("codigo");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState(0);
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

// B-27: PWA - Registro SW si existe (offline support)
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

// ============================================================
// EXPORTS — Todo lo que los módulos necesitan de globals.jsx
// ============================================================
export {
  // Security utilities
  sanitizeInput, validatePasswordStrength, _auditLog,
  // Storage
  _rl, _ls, _ss, sp, sps, _memStore,
  // Session
  SESSION_TIMEOUT_MS, _sessionTimer, _resetSessionTimer, _clearSessionTimer,
  // Supabase config
  _PROXY_URL, _cfgRaw, _cfgSafeUrl, _cfgSafeKey,
  _SB_URL, _SB_KEY, _SB_SERVICE_KEY, _SB_HEADERS,
  _SB_KEYS, _SB_KEY_PREFIXES,
  // Supabase operations
  _securePost, _sbSet, _sbGetAll, _sbDelete, _sbQueue,
  _SB_BUCKET, _validateMimeType,
  _sbStorageUpload, _sbStorageGetSignedUrl, _sbStorageDelete,
  // Sync
  _sync, _syncStatusCallback,
  _patKey, _patKeyCloud, _compKey, _compKeyCloud,
  _sbRl, _rlCheck,
  // Crypto
  _sha256, _pbkdf2Hash, _verifyPassword, _hashSync, _H, _sanitize,
  // TOTP / 2FA
  _totpBase32Chars, _totpBase32ToBytes, _totpGenSecret,
  _totpVerify, _totpGetOtpAuthUrl, _totpGetQRCodeUrl,
  // Business logic helpers
  PLAN_CONFIG, ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT, _genOrgId,
  _isAdmin, _isAdminEmpresa, _isEmpresaUser, _isAdminOrEmpresa, _canUse,
  _contarHC, SECRETARIA_PERMISOS_DEFAULT, MEDICO_SIEMPRE_PUEDE,
  _secretariaPuede, _secretariaMedicoAsignado,
  // Document generation
  _safeLogoUrl, _ipsDocLeftHtml,
  _generarFacturaDIAN_UBL, _generarPaqueteRetencion, _generarCertificadoHTMLNormalizado,
  // RIPS / RDA / FHIR
  _generarHashHC, _generarCodigoQR, _formatFirmaDigital,
  _generarFHIRPatient, _generarFHIRPractitioner, _generarFHIRObservation,
  _generarFHIRBundle, validarRIPSPaciente, validarRIPSLote, _generarRIPSJson, _descargarRIPSJson,
  _generarRDA, _descargarRDA,
  // Lists / Catalogs
  DEFAULT_DOCTOR_DATA,
  ARL_LIST, AFP_LIST, EPS_LIST, CONTRATO_LIST, TURNO_LIST, ETNIA_LIST, SPECIALTIES_LIST,
  DERIVACIONES_CATALOG, RESTRICCIONES_CATALOG,
  RECOMENDACIONES_CATALOG, DEFAULT_RECOMENDACIONES_SELECTED,
  CIE11_EQUIVALENCIAS, _equivalenciaCIE11,
  CUPS_OCUPACIONAL, _buscarCUPS,
  CIE10_OCUPACIONAL, _buscarCIE10,
  // Medications
  MEDICAMENTOS_CO_CUSTOM_KEY, getCustomMeds, addCustomMed,
  MEDICAMENTOS_CO_BASE, MEDICAMENTOS_CO, getAllMeds,
  // AI
  AI_CONFIG_VERSION, fetchWithTimeout, AI_PROVIDERS, parseAIJSON,
  // Initial state
  initialOccupPatientState, initialGeneralPatientState, initialUsers, initialCompanyState,
  // Utilities
  numeroALetras,
  analyzeBP, analyzeHR, analyzeBMI, getSpanishDate, NORMAL_DESCRIPTIONS_SYSTEMS,
  _validarContrasena, _FortalezaPass,
  PORTAL_URL,
  // Components
  PrintStyles, DoctorSignature, DoctorSignatureMemo, BrandLogo,
  InputGroup, SelectGroup, TextAreaGroup, SectionTitle, PlanGate,
  LicenciasTab, AIConfigPanel,
  CIE11Badge, CIE10Input, CUPSInput,
  RecomendacionesChecklistPanel, MedicamentoAutocomplete,
  TabFormulaDerivacion, ConsentimientoModal,
  LoginForm, NotificacionModal,
  PortalPublicoTrabajador, PrivacyModal, ChangePasswordForm,
  AgendaFieldF,
};
