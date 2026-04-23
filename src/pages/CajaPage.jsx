// src/pages/CajaPage.jsx
// Caja financiera — gate de secretaria + render módulo
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBackendData } from '../hooks/useBackendData';
import CajaMain from '../modules/cashbox/components/CajaMain';

export default function CajaPage() {
  const navigate = useNavigate();
  const { currentUser, canAccessModule } = useAuthStore();

  // ── Datos necesarios para CajaMain (hooks siempre antes de returns condicionales) ──
  const { data: billsList = [] } = useBackendData('/data/bills', 'siso_db_bills', 'bills');
  const { data: companiesList = [] } = useBackendData('/data/companies', 'siso_db_companies', 'companies');

  // ── Gate: secretaria sin permiso ──
  if (currentUser?.role === 'secretaria' && !canAccessModule('caja')) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-black text-gray-800 mb-1">Acceso restringido</p>
          <p className="text-xs text-gray-500">
            El módulo financiero no está habilitado para su perfil. Solicite acceso al administrador.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-bold"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <CajaMain
        bills={billsList}
        companies={companiesList}
        currentUser={currentUser}
        onUpdateBillStatus={() => {}}
      />
    </div>
  );
}
