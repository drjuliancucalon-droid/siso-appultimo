// src/modules/cashbox/hooks/useCaja.js
// Hook principal extraído de Caja.jsx monolito
import { useState, useCallback, useMemo } from 'react';

export const useCaja = ({
  cajaMovimientos: initialMovimientos = [],
  cajaForm: initialForm = {},
  setCajaMovimientos,
  setCajaForm,
  saveCajaDebounced,
  currentUser,
  showAlert = () => {},
  showConfirm = () => {},
  cajaTab,
  setCajaTab,
  cajaFiltroPeriodo,
  setCajaFiltroPeriodo,
  cajaFiltroDesde,
  setCajaFiltroDesde,
  cajaFiltroHasta,
  setCajaFiltroHasta,
  cajaMedicoPeriodo,
  setCajaMedicoPeriodo,
  porcentajeMedico,
  setPorcentajeMedico,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [today] = useState(new Date().toISOString().split('T')[0]);

  const getWeekStart = useCallback(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  }, []);

  const getMonthStart = useCallback(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);

  const filteredMovimientos = useMemo(() => {
    const periodo = cajaFiltroPeriodo || 'hoy';
    return initialMovimientos.filter(m => {
      if (!m.fecha) return false;
      switch (periodo) {
        case 'hoy': return m.fecha === today;
        case 'semana': return m.fecha >= getWeekStart();
        case 'mes': return m.fecha >= getMonthStart();
        case 'personalizado':
          if (cajaFiltroDesde && m.fecha < cajaFiltroDesde) return false;
          if (cajaFiltroHasta && m.fecha > cajaFiltroHasta) return false;
          return true;
        default: return true;
      }
    });
  }, [initialMovimientos, cajaFiltroPeriodo, cajaFiltroDesde, cajaFiltroHasta, today, getWeekStart, getMonthStart]);

  const stats = useMemo(() => {
    const ingresos = filteredMovimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
    const egresos = filteredMovimientos.filter(m => m.tipo === 'egreso').reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
    return { ingresos, egresos, saldo: ingresos - egresos };
  }, [filteredMovimientos]);

  const handleAddMovimiento = useCallback(() => {
    if (!initialForm.concepto || !initialForm.monto || parseFloat(initialForm.monto) <= 0) {
      showAlert('⚠️ Complete concepto y monto válido.');
      return;
    }

    const newMov = {
      id: editingId || 'MOV-' + Date.now(),
      tipo: initialForm.tipo || 'ingreso',
      concepto: initialForm.concepto,
      monto: parseFloat(initialForm.monto),
      formaPago: initialForm.formaPago || 'Efectivo',
      fecha: initialForm.fecha || today,
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      usuario: currentUser?.user,
      nombreUsuario: currentUser?.name,
    };

    setCajaMovimientos(prev => {
      let updated;
      if (editingId) {
        updated = prev.map(m => m.id === editingId ? newMov : m);
      } else {
        updated = [newMov, ...prev];
      }
      saveCajaDebounced?.(updated);
      return updated;
    });

    setCajaForm({
      tipo: 'ingreso', concepto: '', monto: '', formaPago: 'Efectivo', fecha: today,
    });
    setEditingId(null);
    setShowForm(false);
  }, [initialForm, editingId, currentUser, today, setCajaMovimientos, setCajaForm, saveCajaDebounced, showAlert]);

  const handleDelete = useCallback((id) => {
    showConfirm('¿Eliminar este movimiento?', () => {
      setCajaMovimientos(prev => {
        const updated = prev.filter(m => m.id !== id);
        saveCajaDebounced?.(updated);
        return updated;
      });
    });
  }, [setCajaMovimientos, saveCajaDebounced, showConfirm]);

  const handleEdit = useCallback((mov) => {
    setCajaForm({
      tipo: mov.tipo,
      concepto: mov.concepto,
      monto: String(mov.monto),
      formaPago: mov.formaPago || 'Efectivo',
      fecha: mov.fecha,
    });
    setEditingId(mov.id);
    setShowForm(true);
  }, [setCajaForm]);

  const handleExportCSV = useCallback(() => {
    const headers = 'Fecha,Hora,Tipo,Concepto,Monto,Forma de Pago,Usuario\n';
    const rows = filteredMovimientos.map(m =>
      `${m.fecha},${m.hora || ''},${m.tipo},${(m.concepto || '').replace(/,/g, ';')},${m.monto},${m.formaPago || ''},${m.nombreUsuario || ''}`
    ).join('\n');
    const csv = '\uFEFF' + headers + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caja_${cajaFiltroPeriodo || 'hoy'}_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('✅ CSV exportado.');
  }, [filteredMovimientos, cajaFiltroPeriodo, today, showAlert]);

  return {
    // Estados
    editingId, showForm, filteredMovimientos, stats,
    setEditingId, setShowForm,
    
    // Actions
    handleAddMovimiento, handleDelete, handleEdit, handleExportCSV,
    
    // Helpers
    formatCOP, today, getWeekStart, getMonthStart,
  };
};

