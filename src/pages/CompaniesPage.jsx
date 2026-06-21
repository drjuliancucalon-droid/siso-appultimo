// src/pages/CompaniesPage.jsx — Conectado a D1 con fallback localStorage
import React, { useState, useEffect, useCallback } from 'react';
import { CompanyList } from '../modules/companies';
import { useAuthStore } from '../stores/authStore';
import { d1Get, d1WriteArrayMerge } from '../lib/d1Client';

export default function CompaniesPage() {
  const currentUser = useAuthStore.getState().currentUser;
  const userId = currentUser?.user || 'drcucalon';

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let list = [];

      // 1. Try D1 user-namespaced key
      try {
        const { value: v } = await d1Get(`siso_companies_${userId}`);
        if (Array.isArray(v) && v.length > 0) list = v;
      } catch {}

      // 2. Fallback: localStorage (user-namespaced then legacy)
      if (list.length === 0) {
        try {
          const raw = localStorage.getItem(`siso_companies_${userId}`)
            || localStorage.getItem('siso_companies');
          if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) list = parsed; }
        } catch {}
      }

      if (!cancelled) { setCompanies(list); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const handleAdd = useCallback(async (company) => {
    const nueva = { ...company, id: company.id || `comp_${Date.now()}`, _medicoId: userId };
    try {
      await d1WriteArrayMerge(`siso_companies_${userId}`, [nueva], 'id');
    } catch {}
    setCompanies(prev => [nueva, ...prev]);
  }, [userId]);

  const handleEdit = useCallback(async (id, updates) => {
    const updated = companies.map(c => c.id === id ? { ...c, ...updates } : c);
    try {
      await d1WriteArrayMerge(`siso_companies_${userId}`, updated, 'id');
    } catch {}
    setCompanies(updated);
  }, [companies, userId]);

  const handleDelete = useCallback(async (id) => {
    const updated = companies.filter(c => c.id !== id);
    try {
      await d1WriteArrayMerge(`siso_companies_${userId}`, updated, 'id');
    } catch {}
    setCompanies(updated);
  }, [companies, userId]);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Cargando empresas...
    </div>
  );

  return (
    <CompanyList
      companies={companies}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
