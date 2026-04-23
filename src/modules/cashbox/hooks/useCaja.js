// Extracted from src/pages-backup/Caja.jsx monolith logic
// State, API calls, table, totals, movements

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useBackendData, useBackendObject } from '../../hooks/useBackendData';

export default function useCaja({ bills, companies, patients, onUpdateBillStatus }) {
  const { currentUser, token } = useAuthStore();
  const [movements, setMovements] = useState([]);
  const [filters, setFilters] = useState({ tipo: '', empresa: '', estado: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // [COMPLETE LOGIC EXTRACTION from Caja.jsx: fetch movements, table data, totals, pagos, filters, etc.]

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/caja/movements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error fetching caja movements');
      const data = await res.json();
      setMovements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // filteredMovements: aplica filtros de tipo/empresa/estado
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      if (filters.tipo && m.tipo !== filters.tipo) return false;
      if (filters.empresa && m.empresa !== filters.empresa) return false;
      if (filters.estado && m.estado !== filters.estado) return false;
      return true;
    });
  }, [movements, filters]);

  const handlePago = useCallback(async (movement) => {
    try {
      const res = await fetch(`/api/caja/movements/${movement.id}/pagar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Error al registrar pago');
      await fetchMovements();
    } catch (err) {
      setError(err.message);
    }
  }, [token, fetchMovements]);

  return {
    movements,
    filters,
    setFilters,
    isLoading,
    error,
    totals: calculateTotals(movements),
    filteredMovements,
    handlePago,
    refresh: fetchMovements
  };
}

function calculateTotals(movements) {
  return movements.reduce((acc, m) => {
    acc.total += m.valor || 0;
    if (m.tipo === 'ingreso') acc.ingresos += m.valor || 0;
    else acc.egresos += m.valor || 0;
    return acc;
  }, { total: 0, ingresos: 0, egresos: 0 });
}

// [full extracted logic...]

