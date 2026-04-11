// Seguridad: rate limiting, sesión, validación contraseña

export const _SESSION_TIMEOUT_MS = 30 * 60 * 1000;
let _sessionTimer = null;
export const _resetSessionTimer = (logoutFn) => {
  if (_sessionTimer) clearTimeout(_sessionTimer);
  if (typeof logoutFn === "function") {
    _sessionTimer = setTimeout(() => {
      logoutFn();
    }, _SESSION_TIMEOUT_MS);
  }
};
// Headers con soporte para proxy o Supabase directo

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
export const _rlCheck = () => {
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
export const _validarContrasena = (pw) => {
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
export const _FortalezaPass = ({ pw }) => {
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
