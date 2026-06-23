// src/pages/CompaniesPage.jsx — Wrapper completo para CompaniesSection (parity monolito)
// Extrae logica directamente de CompaniesSection.jsx y provee el ctx esperado
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CompaniesSection from '../sections/CompaniesSection';
import { useAuthStore } from '../stores/authStore';
import { d1Get, d1WriteArrayMerge } from '../lib/d1Client';
import { ARL_LIST } from '../shared/data/catalogs';
import { initialCompanyState } from '../shared/data/initialStates';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore.getState().currentUser;
  const userId = currentUser?.user || 'drcucalon';

  const [companies, setCompanies] = useState([]);
  const [loadingComp, setLoadingComp] = useState(true);
  const [patientsList, setPatientsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [companiesTab, setCompaniesTab] = useState('lista');
  const [editingCompany, setEditingCompany] = useState(null);
  const [newComp, setNewComp] = useState(initialCompanyState);
  const [sedeForm, setSedeForm] = useState({ nombre: '', ciudad: '', direccion: '' });
  const [portalActivadoInfo, setPortalActivadoInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      try {
        const { value: v } = await d1Get(`siso_companies_${userId}`);
        if (!cancelled && Array.isArray(v) && v.length > 0) {
          setCompanies(v);
        } else if (!cancelled) {
          try {
            const raw = localStorage.getItem(`siso_companies_${userId}`) || localStorage.getItem('siso_companies');
            if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) setCompanies(p); }
          } catch {}
        }
      } catch {}

      try {
        const { value: vp } = await d1Get(`siso_patients_${userId}`);
        if (!cancelled && Array.isArray(vp)) {
          setPatientsList(vp);
        } else if (!cancelled) {
          try {
            const raw = localStorage.getItem(`siso_patients_${userId}`);
            if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) setPatientsList(p); }
          } catch {}
        }
      } catch {}

      try {
        const { value: vu } = await d1Get('siso_users');
        if (!cancelled && Array.isArray(vu)) {
          setUsersList(vu);
        } else if (!cancelled) {
          try {
            const raw = localStorage.getItem('siso_users');
            if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) setUsersList(p); }
          } catch {}
        }
      } catch {}

      if (!cancelled) setLoadingComp(false);
    };
    loadAll();
    return () => { cancelled = true; };
  }, [userId]);

  const _syncCompanies = useCallback(async (list) => {
    try {
      await d1WriteArrayMerge(`siso_companies_${userId}`, list, 'id');
      localStorage.setItem(`siso_companies_${userId}`, JSON.stringify(list));
    } catch {}
  }, [userId]);

  const goBack = useCallback(() => navigate('/dashboard'), [navigate]);
  const goTo = useCallback((route) => {
    if (route === 'portalempresa') navigate('/portal-empresa');
    else if (route === 'portal-certificados') navigate('/portal-certificados');
    else navigate('/' + route);
  }, [navigate]);

  const showAlert = useCallback((msg) => alert(msg), []);
  const showConfirm = useCallback((msg, cb) => { if (window.confirm(msg)) cb(); }, []);
  const setPortalEmpresaCodigo = useCallback((code) => {
    sessionStorage.setItem('siso_portal_codigo_activo', code);
  }, []);

  if (loadingComp) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Cargando empresas...
      </div>
    );
  }

  const ctx = {
    ARL_LIST,
    _syncCompanies,
    companies,
    companiesTab,
    currentUser,
    editingCompany,
    goBack,
    goTo,
    lista: companies,
    newComp,
    p: null,
    patientsList,
    portalActivadoInfo,
    sedeForm,
    setCompanies,
    setCompaniesTab,
    setEditingCompany,
    setNewComp,
    setPortalActivadoInfo,
    setPortalEmpresaCodigo,
    setSedeForm,
    showAlert,
    showConfirm,
    u: currentUser,
    usersList,
  };

  return <CompaniesSection ctx={ctx} />;
}
