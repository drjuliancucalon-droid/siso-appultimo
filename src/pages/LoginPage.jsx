// src/pages/LoginPage.jsx — Login page with ocupasalud original color scheme
// Palette: emerald-600 → teal-500 gradient (from monolith BrandLogo + LoginForm)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Stethoscope, Eye, EyeOff, AlertCircle, Loader2, Shield } from 'lucide-react';

// ── Helpers de hash (igual que el monolito) ─────────────────────
const _sha256 = async (str) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
};
const _pbkdf2Verify = async (password, saltHex, hashHex) => {
  const saltBytes = Uint8Array.from(saltHex.match(/.{2}/g).map(h => parseInt(h, 16)));
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const computed = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2,'0')).join('');
  return computed === hashHex;
};
const _verifyHash = async (password, passHash, passSalt) => {
  if (!passHash) return false;
  if (passSalt) return _pbkdf2Verify(password, passSalt, passHash);
  return (await _sha256(password)) === passHash;
};

// Usuarios semilla — siempre disponibles como recuperación de emergencia
// Contraseña de drcucalon: cucalon2026
const SEED_USERS = [
  {
    id: 'usr_drcucalon_001',
    user: 'drcucalon',
    usuario: 'drcucalon',
    nombre: 'Dr. Julián Cucalón',
    role: 'super_admin',
    license: 'clinica',
    licenseExpiry: '2099-12-31',
    activo: true,
    password: 'cucalon2026',       // texto plano para comparación rápida
    passHash: '11177743b7227bd517fd7a05e0c9576b3497830f72ccfec4a5a0e1c9f65d9892', // SHA-256 backup
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginLocal, isAuthenticated, loginAttempts, blockedUntil } = useAuthStore();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user.trim() || !pass.trim()) {
      setError('Ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const { loginLocal: localFallback } = useAuthStore.getState();
      const uName = user.trim();
      const pVal  = pass.trim();

      // ── 1. Seed users (siempre funciona — recuperación de emergencia) ──
      const seedMatch = SEED_USERS.find(
        u => (u.user === uName || u.usuario === uName) && u.activo !== false
      );
      if (seedMatch) {
        const ok = seedMatch.password === pVal
          || await _verifyHash(pVal, seedMatch.passHash, seedMatch.passSalt);
        if (ok) {
          localFallback({
            id: seedMatch.id,
            user: seedMatch.user,
            nombre: seedMatch.nombre,
            role: seedMatch.role,
            license: seedMatch.license || 'libre',
            licenseExpiry: seedMatch.licenseExpiry || null,
            email: seedMatch.email || '',
            activo: true,
          });
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      // ── 2. Usuarios en localStorage (importados desde backup) ──
      const storedUsers = JSON.parse(localStorage.getItem('siso_users') || '[]');
      let found = null;
      for (const u of storedUsers) {
        if ((u.user === uName || u.usuario === uName) && u.activo !== false) {
          // Soporte texto plano, SHA-256 y PBKDF2
          const ok = (u.password && u.password === pVal)
            || await _verifyHash(pVal, u.passHash, u.passSalt);
          if (ok) { found = u; break; }
        }
      }

      if (!found) {
        // ── 3. Fallback a Supabase (usuarios creados en otro dispositivo) ──
        try {
          const SB_URL = import.meta.env.VITE_SUPABASE_URL;
          const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
          if (SB_URL && SB_KEY) {
            const r = await fetch(
              `${SB_URL}/rest/v1/siso_store?key=eq.siso_users&select=value`,
              { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
            );
            if (r.ok) {
              const rows = await r.json();
              const sbUsers = rows?.[0]?.value;
              if (Array.isArray(sbUsers)) {
                for (const u of sbUsers) {
                  if ((u.user === uName || u.usuario === uName) && u.activo !== false) {
                    const ok = (u.password && u.password === pVal)
                      || await _verifyHash(pVal, u.passHash, u.passSalt);
                    if (ok) { found = u; break; }
                  }
                }
              }
            }
          }
        } catch (sbErr) {
          console.warn('Supabase user lookup failed:', sbErr.message);
        }
      }

      if (!found) {
        // Incrementar intentos solo en credenciales realmente incorrectas
        useAuthStore.setState(s => ({ loginAttempts: s.loginAttempts + 1 }));
        const attempts = useAuthStore.getState().loginAttempts;
        throw new Error(`Credenciales incorrectas. Intentos fallidos: ${attempts}/5`);
      }

      localFallback({
        id: found.id || ('usr_' + uName),
        user: found.user || found.usuario || uName,
        nombre: found.nombre || found.name || uName,
        role: found.role || 'medico',
        license: found.license || 'libre',
        licenseExpiry: found.licenseExpiry || null,
        email: found.email || '',
        activo: true,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo — matches BrandLogo.jsx from monolith */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-700 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="flex flex-col items-center leading-none">
              <Stethoscope className="w-6 h-6 text-white mb-0.5" strokeWidth={2.5} />
              <span className="text-[9px] font-black text-white/90 tracking-tighter">SISO</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">OCUPASALUD</h1>
          <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500 to-teal-400 mx-auto my-2 rounded-full" />
          <p className="text-gray-500 text-sm">Sistema Integral de Salud Ocupacional</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-800">Iniciar Sesión</h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-colors"
                placeholder="Tu usuario"
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-colors pr-10"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-black text-sm hover:opacity-90 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {loginAttempts > 0 && (
            <p className="text-xs text-orange-600 mt-3 text-center">
              ⚠️ Intentos fallidos: {loginAttempts}/5
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          SISO OcupaSalud Pro v2.0 — Res. 1843/2025 · Decreto 1072/2015
        </p>
      </div>
    </div>
  );
}
