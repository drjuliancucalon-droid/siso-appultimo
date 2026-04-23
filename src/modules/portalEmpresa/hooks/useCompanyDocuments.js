// Moved from src/hooks/useCompanyDocuments.js
// Now portalEmpresa specific - all company doc fetching

// [COMPLETE CONTENT FROM PREVIOUS read_file useCompanyDocuments.js]
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useCompanyDocuments(companyId, nit) {
  const { currentUser, token } = useAuthStore();
  const [documents, setDocuments] = useState({
    certificates: [],
    reports: [],
    bills: [],
    custodia: [],
    loading: true,
    error: null
  });

  const fetchDocuments = useCallback(async () => {
    if (!companyId && !nit) {
      setDocuments(prev => ({ ...prev, loading: false }));
      return;
    }

    setDocuments(prev => ({ ...prev, loading: true, error: null }));

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const basePath = companyId 
        ? `/data/${companyId}` 
        : `/data/by-nit/${nit}`;

      const [
        certsRes,
        reportsRes,
        billsRes,
        custodiaRes
      ] = await Promise.all([
        fetch(`${API_URL}/certificates${companyId ? `/by-company/${companyId}` : `/by-nit/${nit}`}`, { headers }),
        fetch(`${API_URL}/reports${companyId ? `/by-company/${companyId}` : `/by-nit/${nit}`}`, { headers }),
        fetch(`${API_URL}/bills${companyId ? `/by-company/${companyId}` : `/by-nit/${nit}`}`, { headers }),
        fetch(`${API_URL}/custodia${companyId ? `/by-company/${companyId}` : `/by-nit/${nit}`}`, { headers })
      ]);

      const certificates = certsRes.ok ? (await certsRes.json()).certificates || [] : [];
      const reports = reportsRes.ok ? (await reportsRes.json()).reports || [] : [];
      const bills = billsRes.ok ? (await billsRes.json()).bills || [] : [];
      const custodia = custodiaRes.ok ? (await custodiaRes.json()).cartas || [] : [];

      setDocuments({
        certificates,
        reports,
        bills,
        custodia,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Error fetching company documents:', err);
      setDocuments(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Error al obtener documentos'
      }));
    }
  }, [companyId, nit, token]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const refresh = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    ...documents,
    refresh,
    totalDocuments: documents.certificates.length + 
                   documents.reports.length + 
                   documents.bills.length + 
                   documents.custodia.length,
    hasDocuments: documents.certificates.length > 0 || 
                  documents.reports.length > 0 || 
                  documents.bills.length > 0 || 
                  documents.custodia.length > 0
  };
}

// Sub-hooks mantidos...
// [resto del contenido original]
