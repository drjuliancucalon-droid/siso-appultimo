// src/pages/Companies.jsx
// Página orquestadora de Empresas — carga datos propios y maneja Supabase
// Encuestas: lee de Supabase al montar, guarda a Supabase + localStorage en cada cambio
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CompaniesMain } from '../modules/companies/components/CompaniesMain.jsx';
import { useBackendData } from '../hooks/useBackendData';
import { useAuthStore } from '../stores/authStore';
import { syncArrayToSupabase, readArrayFromSupabase } from '../lib/supabaseSync';

// Claves Supabase
const SB_KEY_COMPANIES = 'siso_companies_drcucalon';
const SB_KEY_ENCUESTAS  = 'siso_encuestas';
const LS_KEY_COMPANIES  = 'siso_companies';
const LS_KEY_ENCUESTAS  = 'siso_encuestas';

export default function CompaniesPage() {
  // ── Auth ──────────────────────────────────────────────────────────
  const currentUser = useAuthStore.getState().currentUser;

  // ── Companies — vía useBackendData (Supabase → localStorage) ─────
  const {
    data: companies,
    setData: setCompaniesData,
    loading: loadingCompanies,
  } = useBackendData('/data/companies', LS_KEY_COMPANIES, 'companies');

  // ── Encuestas — carga directa desde Supabase al montar ───────────
  const [encuestas, setEncuestasState] = useState(() => {
    // Seed inmediato desde localStorage mientras carga Supabase
    try {
      const stored = JSON.parse(localStorage.getItem(LS_KEY_ENCUESTAS) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch { return []; }
  });
  const [loadingEncuestas, setLoadingEncuestas] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null); // null | 'saving' | 'ok' | 'error'
  const syncTimer = useRef(null);

  // Al montar: leer encuestas desde Supabase (sobreescribe localStorage si hay datos más recientes)
  useEffect(() => {
    let cancelled = false;
    setLoadingEncuestas(true);
    readArrayFromSupabase(SB_KEY_ENCUESTAS, LS_KEY_ENCUESTAS).then((data) => {
      if (!cancelled) {
        setEncuestasState(data);
        setLoadingEncuestas(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // ── Función para actualizar encuestas + sincronizar Supabase ──────
  const setEncuestas = useCallback((updaterOrArray) => {
    setEncuestasState((prev) => {
      const next =
        typeof updaterOrArray === 'function'
          ? updaterOrArray(prev)
          : updaterOrArray;

      // Guardar localStorage inmediatamente
      try { localStorage.setItem(LS_KEY_ENCUESTAS, JSON.stringify(next)); } catch {}

      // Debounce Supabase sync (300ms para evitar dobles guardados)
      clearTimeout(syncTimer.current);
      setSyncStatus('saving');
      syncTimer.current = setTimeout(() => {
        syncArrayToSupabase(SB_KEY_ENCUESTAS, next)
          .then((r) => setSyncStatus(r.ok ? 'ok' : 'error'))
          .catch(() => setSyncStatus('error'));
      }, 300);

      return next;
    });
  }, []);

  // ── Función para sincronizar companies a Supabase ─────────────────
  const _syncCompanies = useCallback((updated) => {
    setCompaniesData(updated);
    try { localStorage.setItem(LS_KEY_COMPANIES, JSON.stringify(updated)); } catch {}
    syncArrayToSupabase(SB_KEY_COMPANIES, updated).catch(() => {});
  }, [setCompaniesData]);

  // ── Estado de formulario nueva empresa ───────────────────────────
  const [newComp, setNewComp] = useState({
    nombre: '', nit: '', dv: '', codActividad: '', actividad: '',
    direccion: '', ciudad: '', telefono: '', correo: '', arl: '', gerente: '',
    tarifaIngreso: '', tarifaPeriodico: '', tarifaEgreso: '', tarifaConsulta: '',
    condicionesPago: 'contado', convenioFecha: '', convenioVencimiento: '',
    descuento: '', portalActivo: false, notasConvenio: '',
    medicoIds: [], sedes: [], logo: '', lema: '',
    representanteLegal: '', actividadEconomica: '', claseRiesgo: '',
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const [sedeForm, setSedeForm] = useState({ nombre: '', ciudad: '', direccion: '' });

  // ── showAlert / showConfirm simples ───────────────────────────────
  const [alertMsg, setAlertMsg] = useState(null);
  const [confirmState, setConfirmState] = useState(null); // {msg, onConfirm}

  const showAlert = useCallback((msg) => {
    setAlertMsg(String(msg));
  }, []);

  const showConfirm = useCallback((msg, onConfirm) => {
    setConfirmState({ msg, onConfirm });
  }, []);

  // Patients (para contar por empresa)
  const { data: patientsList } = useBackendData(
    '/data/patients', 'siso_db_patients', 'patients'
  );

  // ── Cleanup timer ─────────────────────────────────────────────────
  useEffect(() => () => clearTimeout(syncTimer.current), []);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <CompaniesMain
        companies={companies}
        setCompanies={setCompaniesData}
        _syncCompanies={_syncCompanies}
        newComp={newComp}
        setNewComp={setNewComp}
        editingCompany={editingCompany}
        setEditingCompany={setEditingCompany}
        patientsList={patientsList}
        currentUser={currentUser}
        encuestas={encuestas}
        setEncuestas={setEncuestas}
        loadingEncuestas={loadingEncuestas}
        syncStatus={syncStatus}
        sedeForm={sedeForm}
        setSedeForm={setSedeForm}
        showAlert={showAlert}
        showConfirm={showConfirm}
      />

      {/* ── Alert modal ── */}
      {alertMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <p className="text-gray-800 font-medium text-sm whitespace-pre-line">{alertMsg}</p>
            <button
              onClick={() => setAlertMsg(null)}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm modal ── */}
      {confirmState && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <p className="text-gray-800 font-medium text-sm">{confirmState.msg}</p>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => {
                  confirmState.onConfirm?.();
                  setConfirmState(null);
                }}
                className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmState(null)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
