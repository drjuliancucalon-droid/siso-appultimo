// src/pages/LoginPage.jsx — Login page with ocupasalud original color scheme
// Palette: emerald-600 → teal-500 gradient (from monolith BrandLogo + LoginForm)
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { migrateLocalStorageToCloud } from '../lib/migrateStorage';
import { Stethoscope, Eye, EyeOff, AlertCircle, Loader2, Shield, BrainCircuit, UploadCloud } from 'lucide-react';
import { AIConfigPanel } from '../modules/ai/components/AIConfigPanel';
import { useAIStore } from '../stores/aiStore';

// FIX 2026-07-21 (FASE 1 PROMPT_MAESTRO): SEED_USERS con contraseñas en texto
// plano ELIMINADO — era el problema de seguridad más grave del proyecto.
// La autenticación ahora depende exclusivamente de D1 (siso_users) con
// verificación de hash real vía PBKDF2+salt + fallback SHA-256 legacy,
// con rate limiting de 5 intentos/15 min implementado en authStore.login().
// Si necesita crear usuarios de emergencia, use el panel Usuarios de la app
// o restaure desde copia de seguridad.

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loginAttempts } = useAuthStore();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const fileInputRef = useRef(null);
  const { activeProvider, keys: aiKeys } = useAIStore();
  const aiConfig = React.useMemo(() => ({ activeProvider, keys: aiKeys }), [activeProvider, aiKeys]);

  // ── Importar datos desde archivo JSON (Restaurar Copia) ───────
  const handleImportData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // Guardar en localStorage y D1
      let importados = 0; let errores = 0;
      try { if (data.siso_users) { localStorage.setItem('siso_users', JSON.stringify(data.siso_users)); importados++; } } catch { errores++; }
      try { if (data.siso_companies) { localStorage.setItem('siso_companies', JSON.stringify(data.siso_companies)); importados++; } } catch { errores++; }
      try { if (data.siso_patients) { localStorage.setItem('siso_patients', JSON.stringify(data.siso_patients)); importados++; } } catch { errores++; }
      try { if (data.siso_db_patients) { localStorage.setItem('siso_db_patients', JSON.stringify(data.siso_db_patients)); importados++; } } catch { errores++; }
      const msg = `✅ ${importados} datos restaurados exitosamente.`;
      alert(errores > 0 ? msg + `\n⚠️ ${errores} dato(s) no se pudieron guardar (almacenamiento lleno). Limpie datos antiguos desde Configuración.` : msg + ' Los usuarios importados ya están disponibles para iniciar sesión.');
    } catch (err) {
      alert('❌ Error al leer el archivo: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };

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
      const uName = user.trim();
      const pVal  = pass.trim();

      console.log('[login] attempt', uName);
      // ── 1. Autenticación vía authStore.login() (D1 primario, PBKDF2+salt) ──
      // FIX 2026-07-21: SEED_USERS con contraseñas en texto plano eliminado.
      // authStore.login() maneja rate limiting (5 intentos/15 min) y navega
      // automáticamente al dashboard vía Zustand (isAuthenticated → useEffect).
      try {
        await useAuthStore.getState().login(uName, pVal);
        console.log('[login] ✅ authStore.login OK');
        // La navegación ocurre vía el useEffect que vigila isAuthenticated
        return;
      } catch (authErr) {
        // authStore.login() lanza errores descriptivos: credenciales incorrectas,
        // cuenta bloqueada, etc. Se muestran directamente al usuario.
        setError(authErr.message);
        setLoading(false);
        return;
      }

    } catch (err) {
      console.error('[login] ❌ login error', err);
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
        {/* Logo */}
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

          {/* ── Acciones adicionales (como el monolito) ── */}
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setShowAIConfig(true)}
              className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition"
            >
              <BrainCircuit className="w-4 h-4" /> Configurar IA (Recomendado)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".json"
              onChange={handleImportData}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-full bg-gray-50 text-gray-600 border border-gray-200 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-100 transition"
            >
              <UploadCloud className="w-4 h-4" /> Restaurar Copia
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          SISO OcupaSalud Pro v2.0 — Res. 1843/2025 · Decreto 1072/2015
        </p>
      </div>

      {/* ── Modal Configuración IA ── */}
      {showAIConfig && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4"
          onClick={() => setShowAIConfig(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <AIConfigPanel
              aiConfig={aiConfig}
              onSave={async (newConfig) => {
                const store = useAIStore.getState();
                if (newConfig.activeProvider) store.setActiveProvider(newConfig.activeProvider);
                if (newConfig.keys) Object.entries(newConfig.keys).forEach(([p, k]) => store.setKey(p, k));
                const userId = 'drcucalon';
                try { await store.saveToD1(userId); } catch (_) {}
                setShowAIConfig(false);
              }}
              onClose={() => setShowAIConfig(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
