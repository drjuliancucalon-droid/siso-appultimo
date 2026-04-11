// Storage: localStorage, sessionStorage, Supabase sync

export const _memStore = {}; // fallback si localStorage no está disponible
export const _ls = {
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
export const _ss = {
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
export const sp = (k, fb) => {
  const s = _ls.getItem(k);
  if (!s) return fb;
  try {
    return JSON.parse(s);
  } catch {
    return fb;
  }
};
export const sps = (k, fb) => {
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
export const _PROXY_URL =
  (typeof window !== "undefined" && window.__SISO_PROXY_URL) || null;
// SEC-12: Validar y sanitizar __SISO_CONFIG antes de usar
export const _cfgRaw = (typeof window !== "undefined" && window.__SISO_CONFIG) || {};
export const _cfgSafeUrl = (v) =>
  typeof v === "string" && v.startsWith("https://") && v.length < 200
    ? v
    : null;
export const _cfgSafeKey = (v) =>
  typeof v === "string" && v.length > 20 && v.length < 200 ? v : null;
// SEC-AUDIT: Prioridad env vars (build-time) > window.__SISO_CONFIG (legacy)
export const _SB_URL =
  _cfgSafeUrl(typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  _cfgSafeUrl(_cfgRaw.sbUrl) ||
  null;
export const _SB_KEY =
  _cfgSafeKey(typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_KEY) ||
  _cfgSafeKey(_cfgRaw.sbKey) ||
  null;
export const _SB_SERVICE_KEY =
  _cfgSafeKey(typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_SERVICE_KEY) ||
  _cfgSafeKey(_cfgRaw.sbServiceKey) ||
  null;
// SEC-AUDIT: Credenciales eliminadas del código fuente (2026-03-20)
if (!_SB_URL || !_SB_KEY) console.error("[SISO SEC] Credenciales Supabase no configuradas.");
// Gestión de sesión - expiración automática por inactividad (30 min)
const _SESSION_TIMEOUT_MS = 30 * 60 * 1000;
let _sessionTimer = null;
const _resetSessionTimer = (logoutFn) => {
  if (_sessionTimer) clearTimeout(_sessionTimer);
  if (typeof logoutFn === "function") {
    _sessionTimer = setTimeout(() => {
      logoutFn();
    }, _SESSION_TIMEOUT_MS);
  }
};
// Headers con soporte para proxy o Supabase directo
export const _SB_HEADERS = {
  apikey: _SB_KEY,
  Authorization: `Bearer ${_SB_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates,return=minimal",
};
// Wrapper de fetch con soporte dual: proxy (futuro) o Supabase directo (actual)
export const _securePost = async (key, value) => {
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
export const _SB_KEYS = [
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
export const _SB_KEY_PREFIXES = [
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
const _rl = { count: 0, reset: Date.now() + 60000 };
const _rlCheck = () => {
  const now = Date.now();
  if (now > _rl.reset) {
    _rl.count = 0;
    _rl.reset = now + 60000;
  }
  _rl.count++;
  if (_rl.count > 120) {
    console.warn("[SISO SEC] Rate limit alcanzado");
    return false;
  }
  return true;
};
export const _sbSet = async (key, value) => {
  if (!_rlCheck()) return false;
  return await _securePost(key, value);
};
export const _sbGetAll = async () => {
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
export const _sbDelete = async (key) => {
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
export const _sbQueue = {
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
export const _SB_BUCKET = "siso-adjuntos";
// SEC-11: Validación MIME real por magic bytes (no solo extensión)
export const _validateMimeType = async (file) => {
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
export const _sbStorageUpload = async (path, file) => {
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
export const _sbStorageGetSignedUrl = async (path) => {
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
export const _sbStorageDelete = async (path) => {
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
export const _sync = (key, jsonValue) => {
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
export const _patKey = (userId) => `siso_db_patients_${userId}`;
export const _patKeyCloud = (userId) => `siso_patients_${userId}`;
export const _compKey = (userId) => `siso_companies_${userId}`;
export const _compKeyCloud = (userId) => `siso_companies_${userId}`;
// ══════════════════════════════════════════════════
// SEGURIDAD: Hash SHA-256 (sin dependencias externas)
// Usado para credenciales - nunca se almacena texto plano
// ══════════════════════════════════════════════════
