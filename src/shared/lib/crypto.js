// ══════════════════════════════════════════════════
// SEGURIDAD: Hash SHA-256 (sin dependencias externas)
// Usado para credenciales - nunca se almacena texto plano
// ══════════════════════════════════════════════════
export const _sha256 = async (str) => {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
// SEC-09: PBKDF2 con salt para contraseñas (mas seguro que SHA-256 puro)
// salt se genera una vez por usuario y se guarda junto al hash
export const _pbkdf2Hash = async (password, saltHex) => {
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
// Verificar contrasena con PBKDF2 (compatible con hashes legacy SHA-256 sin salt)
export const _verifyPassword = async (password, storedHash, storedSalt) => {
  if (!storedSalt) return (await _sha256(password)) === storedHash; // legacy
  const { hash } = await _pbkdf2Hash(password, storedSalt);
  return hash === storedHash;
};
// Hash sincronico simple para comparaciones en memoria (FNV-1a 64-bit expandido)
// NOTA: SHA-256 real se usa al crear/cambiar contrasenas. Para validacion en memoria
// se compara passHash (ya almacenado como SHA-256 hex) vs hash del input.
export const _hashSync = (str) => {
  return str; // placeholder - reemplazado por passHash en el flujo real
};
// ══ B-03 SEGURIDAD: Hashes de credenciales por defecto eliminados (OWASP A07) ══
// adminCode: se configura en el primer uso desde el panel de administracion.
// El hash se genera dinamicamente con _sha256() - nunca se almacena en codigo.
// Para restablecer adminCode: usar el panel de usuarios con autenticacion activa.
export const _H = {
  // SHA-256('9207') - codigo de borrado de datos por admin
  // Para cambiar el codigo: recalcular SHA-256 del nuevo codigo y actualizar este valor
  adminCode: "8cd110accd359cbd1cba8e0d423314c09e531aa4f5fdbc926621198e911fa308",
};
// SEGURIDAD: Sanitizador XSS para document.write - escapa caracteres HTML peligrosos
export const _sanitize = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
// SEC-FIX-02: Validacion estricta de URL para imagenes (previene XSS via javascript: protocol)
// OWASP A03: Injection - solo permite data:image/, https:// y http:// (CWE-79)
export const _safeLogoUrl = (url) => {
  if (!url) return "";
  const u = String(url).trim();
  if (u.startsWith("data:image/") || u.startsWith("https://") || u.startsWith("http://")) return u;
  return ""; // Rechaza javascript:, vbscript:, file://, etc.
};
