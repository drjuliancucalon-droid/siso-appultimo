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
  if (!storedSalt) return (await _sha256(password)) === storedHash;
  const { hash } = await _pbkdf2Hash(password, storedSalt);
  return hash === storedHash;
};

// ══════════════════════════════════════════════════
// FIX 2026-07-21 (FASE 1 PROMPT_MAESTRO): 2FA TOTP real (RFC 6238, HMAC-SHA1),
// portado tal cual del monolito (App.jsx:13449-13527). Reemplaza el placeholder
// que aceptaba cualquier código de 6 dígitos sin validar el secreto real.
// ══════════════════════════════════════════════════
const _totpBase32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const _totpBase32ToBytes = (base32) => {
  const s = base32.toUpperCase().replace(/=+$/, "").replace(/[^A-Z2-7]/g, "");
  const bytes = [];
  let buf = 0, bitsLeft = 0;
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

// Verifica un código TOTP de 6 dígitos contra el secreto base32, con ventana
// de tolerancia de +/-1 paso de 30s (compensa desfase de reloj del cliente).
export const _totpVerify = async (secret, token, window = 1) => {
  try {
    const keyBytes = _totpBase32ToBytes(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
    );
    const now = Math.floor(Date.now() / 30000);
    for (let delta = -window; delta <= window; delta++) {
      const counter = now + delta;
      const msg = new DataView(new ArrayBuffer(8));
      msg.setUint32(4, counter & 0xffffffff, false);
      const sig = await crypto.subtle.sign("HMAC", cryptoKey, msg.buffer);
      const hmac = new Uint8Array(sig);
      const offset = hmac[hmac.length - 1] & 0x0f;
      const code = (((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff)) % 1000000;
      if (String(code).padStart(6, "0") === String(token).padStart(6, "0")) return true;
    }
    return false;
  } catch {
    return false;
  }
};
