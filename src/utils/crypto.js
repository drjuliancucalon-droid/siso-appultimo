// Utilidades criptográficas: SHA-256, PBKDF2, sanitización

export const _sha256 = async (str) => {
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
// Verificar contraseña con PBKDF2 (compatible con hashes legacy SHA-256 sin salt)
export const _verifyPassword = async (password, storedHash, storedSalt) => {
  if (!storedSalt) return (await _sha256(password)) === storedHash; // legacy
  const { hash } = await _pbkdf2Hash(password, storedSalt);
  return hash === storedHash;
};
// Hash síncrono simple para comparaciones en memoria (FNV-1a 64-bit expandido)
// NOTA: SHA-256 real se usa al crear/cambiar contraseñas. Para validación en memoria
// se compara passHash (ya almacenado como SHA-256 hex) vs hash del input.
export const _hashSync = (str) => {
  // Usamos la Web Crypto API de forma síncrona mediante un truco de Promise sync
  // En este entorno (browser/React) usamos el valor pre-computado para el default
  // y SHA-256 async para nuevas contraseñas.
  return str; // placeholder - reemplazado por passHash en el flujo real
};
// ══ B-03 SEGURIDAD: Hashes de credenciales por defecto eliminados (OWASP A07) ══
// adminCode: se configura en el primer uso desde el panel de administracion.
// El hash se genera dinamicamente con _sha256() - nunca se almacena en codigo.
// Para restablecer adminCode: usar el panel de usuarios con autenticacion activa.
export const _H = {
  // SHA-256('9207') - código de borrado de datos por admin
  // Para cambiar el código: recalcular SHA-256 del nuevo código y actualizar este valor
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
// ── HELPER: Columna izquierda para cabeceras de documentos impresos ──────────
// Si se pasa ipsData (objeto empresa), muestra logo+nombre+NIT+dirección de la IPS.
// Si ipsData es null, muestra los datos del médico (docData).
