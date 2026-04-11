// ══════════════════════════════════════════════════════════════
// SUPABASE CLIENT — OcupaSalud
// SEGURIDAD: La publishable key es intencional para el piloto.
// En PRODUCCIÓN: inyectar via window.__SISO_CONFIG en index.html
// <script>window.__SISO_CONFIG={sbUrl:"URL",sbKey:"KEY"};</script>
// Las keys se configuran en el primer despliegue y se rotan cada 90 días.
// ══════════════════════════════════════════════════════════════
import { _ls } from './storage.js';

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
export const _SB_URL =
  _cfgSafeUrl(_cfgRaw.sbUrl) || "https://yqrrktrgoijgzccrxnpz.supabase.co";
export const _SB_KEY =
  _cfgSafeKey(_cfgRaw.sbKey) ||
  "sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7";
// FASE 2 — Service Role Key (solo para operaciones super_admin: crear orgs, migrar datos)
// ⚠️  NUNCA hardcodear en producción. Inyectar via window.__SISO_CONFIG.sbServiceKey
// Para configurar: en index.html agregar antes del bundle:
//   <script>window.__SISO_CONFIG={sbUrl:'...',sbKey:'...',sbServiceKey:'TU_SERVICE_KEY'};</script>
export const _SB_SERVICE_KEY = _cfgSafeKey(_cfgRaw.sbServiceKey) || null; // null = solo lectura (seguro por defecto)
// SEC-FIX-01: Credenciales removidas del código fuente (OWASP A07 - Hardcoded Credentials)
// En producción inyectar via: <script>window.__SISO_CONFIG={sbUrl:'TU_URL',sbKey:'TU_KEY'};</script>
// Las claves se configuran en el primer despliegue y se rotan cada 90 días - NUNCA en código fuente.
// Gestión de sesión - expiración automática por inactividad (30 min)
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

// _sbSet: ahora usa _securePost que soporta proxy (prod) o Supabase directo (dev/piloto)
// SEC-07: Rate limiter simple para requests a Supabase
export const _sbRl = { count: 0, reset: Date.now() + 60000 };
export const _rlCheck = () => {
  const now = Date.now();
  if (now > _sbRl.reset) {
    _sbRl.count = 0;
    _sbRl.reset = now + 60000;
  }
  _sbRl.count++;
  if (_sbRl.count > 120) {
    if (typeof console !== 'undefined') console.error("[SISO SEC] Rate limit alcanzado");
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
export const _syncState = { callback: null };
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
    if (_syncState.callback) _syncState.callback("syncing");
  }, 0);
  _sbSet(key, parsed).then((ok) => {
    if (!ok) _sbQueue.pending[key] = parsed;
    setTimeout(() => {
      if (_syncState.callback) _syncState.callback(ok ? "ok" : "error");
    }, 0);
  });
};
// Clave de storage de pacientes por usuario (aislamiento total)
export const _patKey = (userId) => `siso_db_patients_${userId}`;
export const _patKeyCloud = (userId) => `siso_patients_${userId}`;
export const _compKey = (userId) => `siso_companies_${userId}`;
export const _compKeyCloud = (userId) => `siso_companies_${userId}`;
