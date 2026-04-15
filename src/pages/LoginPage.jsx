// src/pages/LoginPage.jsx — Login page with ocupasalud original color scheme
// Palette: emerald-600 → teal-500 gradient (from monolith BrandLogo + LoginForm)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Stethoscope, Eye, EyeOff, AlertCircle, Loader2, Shield } from 'lucide-react';

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

    if (blockedUntil && Date.now() < blockedUntil) {
      const minLeft = Math.ceil((blockedUntil - Date.now()) / 60000);
      setError(`Cuenta bloqueada temporalmente. Intenta en ${minLeft} minuto(s).`);
      return;
    }

    if (!user.trim() || !pass.trim()) {
      setError('Ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      // Try backend auth first (real JWT)
      const { login, loginLocal: localFallback } = useAuthStore.getState();
      try {
        await login(user.trim(), pass.trim());
      } catch (backendErr) {
        // If backend is unavailable (network error), fall back to local auth
        if (backendErr.message?.includes('Failed to fetch') || backendErr.message?.includes('NetworkError')) {
          console.warn('Backend no disponible, usando auth local');
          localFallback({
            id: 'local_' + Date.now(),
            user: user.trim(),
            nombre: user.trim(),
            role: 'administrador',
          });
        } else {
          throw backendErr;
        }
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Usuario o contraseña incorrectos');
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
