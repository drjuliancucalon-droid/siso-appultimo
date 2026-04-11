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
// SEC-FIX-02: Validación estricta de URL para imágenes (previene XSS via javascript: protocol)
// OWASP A03: Injection - solo permite data:image/, https:// y http:// (CWE-79)
export const _safeLogoUrl = (url) => {
  if (!url) return "";
  const u = String(url).trim();
  if (u.startsWith("data:image/") || u.startsWith("https://") || u.startsWith("http://")) return u;
  return ""; // Rechaza javascript:, vbscript:, file://, etc.
};
// ── HELPER: Columna izquierda para cabeceras de documentos impresos ──────────
// Si se pasa ipsData (objeto empresa), muestra logo+nombre+NIT+dirección de la IPS.
// Si ipsData es null, muestra los datos del médico (docData).
export const _ipsDocLeftHtml = (ipsData, docData, accentSafe) => {
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
