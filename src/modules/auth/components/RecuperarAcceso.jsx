// F3-01: RecuperarAcceso.jsx — Formulario de recuperación de contraseña
// Monolito referencia: líneas 8920-9000
import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { _sha256 } from '../../../shared/lib/crypto';
import { d1Get, d1Set } from '../../../lib/d1Client';

const SISO_USERS_KEY = 'siso_users';

export default function RecuperarAcceso({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleRecover = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Ingrese su correo electrónico o nombre de usuario.'); return; }
    setLoading(true);
    try {
      const { value: users } = await d1Get(SISO_USERS_KEY);
      const list = Array.isArray(users) ? users : [];
      const user = list.find(u => u.user === email.trim() || u.email === email.trim());
      if (!user) {
        // No revelar si el usuario existe o no por seguridad
        setSent(true);
        setLoading(false);
        return;
      }
      // Generar token de recuperación temporal (24h válido)
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      // Guardar token en D1
      await d1Set(`siso_reset_token_${resetToken}`, {
        userId: user.user,
        token: resetToken,
        expiry: tokenExpiry,
        createdAt: new Date().toISOString(),
      });
      // Guardar en el usuario el campo resetToken
      const updatedUsers = list.map(u => u.user === user.user ? { ...u, resetToken, resetTokenExpiry: tokenExpiry } : u);
      await d1Set(SISO_USERS_KEY, updatedUsers);
      setSent(true);
    } catch (err) {
      setError('Error al procesar la solicitud. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-lg font-black text-gray-800 mb-2">Solicitud Enviada</h2>
        <p className="text-sm text-gray-600 mb-4">
          Si el usuario o correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
        </p>
        <p className="text-xs text-gray-400 mb-4">Revisa tu bandeja de entrada y spam.</p>
        <button onClick={onBack}
          className="flex items-center justify-center gap-2 mx-auto px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <Mail className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-lg font-black text-gray-800">Recuperar Acceso</h2>
        <p className="text-xs text-gray-500 mt-1">
          Ingresa tu nombre de usuario o correo electrónico registrado
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg mb-4 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleRecover} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-1">
            Usuario o Correo Electrónico
          </label>
          <input
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Ej: drcucalon o correo@ejemplo.com"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {loading ? 'Enviando...' : 'Enviar Instrucciones de Recuperación'}
        </button>
      </form>

      <button onClick={onBack}
        className="flex items-center justify-center gap-1.5 mx-auto mt-6 text-xs font-bold text-gray-500 hover:text-emerald-700">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio de sesión
      </button>
    </div>
  );
}