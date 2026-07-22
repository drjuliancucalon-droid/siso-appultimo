// src/pages/PlanesPage.jsx — Plans and licenses
import React, { useState } from 'react';
import { LicenseManager } from '../modules/users/components/LicenseManager';
import { useAuthStore } from '../stores/authStore';
import { CreditCard, ShieldAlert } from 'lucide-react';

const USERS_KEY = 'siso_users';

function loadFromStorage(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
  catch { return fallback; }
}

export default function PlanesPage() {
  const { currentUser } = useAuthStore();
  const [users] = useState(() => loadFromStorage(USERS_KEY));

  // FIX 2026-07-21 (Sección C): la ruta /planes no tenía ningún guard de rol
  // — cualquier usuario autenticado podía editar el plan/vencimiento de
  // cualquier otro usuario. El componente equivalente del monolito
  // (LicenciasTab) restringe esta gestión a administrador/super_admin.
  const puedeGestionar = currentUser?.role === 'administrador' || currentUser?.role === 'super_admin';
  if (!puedeGestionar) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="font-black text-red-800 text-lg">Acceso denegado</p>
          <p className="text-sm text-red-600 mt-2">
            La gestión de planes y licencias es <strong>exclusiva del administrador</strong>.
          </p>
          <p className="text-xs text-red-500 mt-2">
            Si necesitas un cambio de plan, comunícate con el administrador de tu organización.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">Planes y Licencias</h1>
      </div>
      <LicenseManager users={users} currentUser={currentUser} />
    </div>
  );
}
