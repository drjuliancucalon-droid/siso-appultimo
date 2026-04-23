// CajaPage.jsx RESTAURADO Y FIJADO DESDE BACKUP
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBackendData } from '../hooks/useBackendData';
import { CajaMain } from '../modules/cashbox/components/CajaMain.jsx';

export default function CajaPage() {
  const navigate = useNavigate();
  const { currentUser, canAccessModule } = useAuthStore();

  if (currentUser?.role === 'secretaria' && !canAccessModule('caja')) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-black text-gray-800 mb-1">Acceso restringido</p>
          <p className="text-xs text-gray-500">
            El módulo financiero no está habilitado para su perfil. Solicite acceso al administrador.
          </p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-bold">
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const { currentUser: user } = useAuthStore();
  const storageKey = useMemo(() => `siso_caja_${user?.empresaId || user?.user || 'shared'}`, [user]);
  const [cajaMovimientos, setCajaMovimientos] = useState([]);
  const [savedBillsList, setSavedBillsList] = useState([]);
  const [cajaForm, setCajaForm] = useState({ tipo: 'ingreso', concepto: '', monto: '', formaPago: 'Efectivo', fecha: new Date().toISOString().split('T')[0], categoria: '' });
  const [cajaTab, setCajaTab] = useState('movimientos');
  const [cajaFiltroPeriodo, setCajaFiltroPeriodo] = useState('hoy');
  const [porcentajeMedico, setPorcentajeMedico] = useState(40);

  const { data: patientsList } = useBackendData('/data/patients', 'siso_db_patients', 'patients');

  const saveCajaDebounced = useCallback((movements) => {
    setCajaMovimientos(movements);
    try { localStorage.setItem(storageKey, JSON.stringify(movements)); } catch {}
  }, [storageKey]);

  const showAlert = useCallback((msg) => alert(msg), []);
  const showConfirm = useCallback((msg) => window.confirm(msg), []);

  return (
    <CajaMain
      cajaMovimientos={cajaMovimientos}
      setCajaMovimientos={saveCajaDebounced}
      cajaForm={cajaForm}
      setCajaForm={setCajaForm}
      currentUser={currentUser}
      cajaTab={cajaTab}
      setCajaTab={setCajaTab}
      cajaFiltroPeriodo={cajaFiltroPeriodo}
      setCajaFiltroPeriodo={setCajaFiltroPeriodo}
      porcentajeMedico={porcentajeMedico}
      setPorcentajeMedico={setPorcentajeMedico}
      patientsList={patientsList || []}
      savedBillsList={savedBillsList}
      showAlert={showAlert}
      showConfirm={showConfirm}
    />
  );
}

