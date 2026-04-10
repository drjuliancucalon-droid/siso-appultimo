// security.js - Security utilities extracted from App.jsx

// SECURITY UTILITIES v1.0 - OcupaSalud
// ============================================================

// SEC-U1: Sanitización de inputs para prevenir XSS
export const sanitizeInput = (str) => {
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
export const validatePasswordStrength = (password) => {
  const errors = [];
  if (!password || password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Al menos una mayúscula');
  if (!/[a-z]/.test(password)) errors.push('Al menos una minúscula');
  if (!/[0-9]/.test(password)) errors.push('Al menos un número');
  return { valid: errors.length === 0, errors };
};

// SEC-U3: Logger de auditoría
export const _auditLog = (action, user, detail = '') => {
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
export const _rl = {
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
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
export let _sessionTimer = null;
export const _resetSessionTimer = (logoutCallback) => {
  if (_sessionTimer) clearTimeout(_sessionTimer);
  _sessionTimer = setTimeout(() => {
    if (logoutCallback) logoutCallback();
  }, SESSION_TIMEOUT_MS);
};
export const _clearSessionTimer = () => {
  if (_sessionTimer) { clearTimeout(_sessionTimer); _sessionTimer = null; }
};

