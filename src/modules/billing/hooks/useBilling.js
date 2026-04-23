// src/modules/billing/hooks/useBilling.js
// Hook principal billing - extraído del monolito Bill.jsx per protocol
// Maneja TODO el estado de facturación: listados, selección, cálculos, persistencia
import { useState, useMemo, useCallback } from 'react';

export const useBilling = ({
  companies = [],
  savedBills = [],
  atencionesCerradas = [],
  patients = [],
  doctorData,
  _sync,
  showAlert,
  showConfirm
}) => {
  const [filterEmpresaId, setFilterEmpresaId] = useState('');
  const [filterMes, setFilterMes] = useState('');
  const [selectedWorkers, setSelectedWorkers] = useState({});
  const [workerValues, setWorkerValues] = useState({});
  const [marcarTodos, setMarcarTodos] = useState(false);
  const [modoCobro, setModoCobro] = useState('por_trabajador');
  const [valorUnitarioGlobal, setValorUnitarioGlobal] = useState(0);

  // Atenciones globales (fallback patients si no hay atenciones)
  const atencionesGlobales = useMemo(() => {
    let todas = [...atencionesCerradas];
    if (todas.length === 0 && patients.length > 0) {
      todas = patients.filter(p => p.empresa).map(p => ({
        id: p.id,
        docNumero: p.docNumero,
        nombres: p.nombres,
        empresa: p.empresa,
        empresaId: p.empresaId,
        fechaAtencion: p.fechaExamen || p.fecha,
        tipo: p.tipoExamen || 'Evaluacion'
      }));
    }
    return todas;
  }, [atencionesCerradas, patients]);

  const atencionesFiltradas = useMemo(() => {
    if (!filterEmpresaId && !filterMes) return atencionesGlobales;
    return atencionesGlobales.filter(a => {
      const emp = (a.empresa || a.empresaNombre || "").toLowerCase();
      const matchEmp = !filterEmpresaId || emp.includes(filterEmpresaId.toLowerCase());
      const fecha = a.fechaAtencion || a.fecha || "";
      const matchMes = !filterMes || fecha.startsWith(filterMes);
      return matchEmp && matchMes;
    });
  }, [atencionesGlobales, filterEmpresaId, filterMes]);

  const trabajadoresUnicos = useMemo(() => {
    const map = new Map();
    atencionesFiltradas.forEach(a => {
      const docKey = a.docNumero || a.id;
      if (!map.has(docKey)) {
        map.set(docKey, {
          docNumero: docKey,
          nombres: a.nombres || a.nombre || 'Sin nombre',
          docTipo: a.docTipo || 'CC',
          empresa: a.empresa || a.empresaNombre,
          empresaId: a.empresaId || a.empresa,
          atenciones: []
        });
      }
      map.get(docKey).atenciones.push(a);
    });
    return Array.from(map.values());
  }, [atencionesFiltradas]);

  const getCantidadAtenciones = useCallback((docNumero) => {
    const t = trabajadoresUnicos.find(x => x.docNumero === docNumero);
    return t ? t.atenciones.length : 0;
  }, [trabajadoresUnicos]);

  const toggleWorker = useCallback((doc) => {
    setSelectedWorkers(prev => ({...prev, [doc]: !prev[doc]}));
  }, []);

  const updateWorkerValor = useCallback((doc, v) => {
    setWorkerValues(prev => ({...prev, [doc]: parseFloat(v) || 0}));
  }, []);

  const handleMarcarTodos = useCallback(() => {
    const nuevoEstado = !marcarTodos;
    setMarcarTodos(nuevoEstado);
    const nuevosSeleccionados = {};
    const nuevosValores = {};
    trabajadoresUnicos.forEach(t => {
      nuevosSeleccionados[t.docNumero] = nuevoEstado;
      nuevosValores[t.docNumero] = workerValues[t.docNumero] || valorUnitarioGlobal;
    });
    setSelectedWorkers(nuevosSeleccionados);
    setWorkerValues(nuevosValores);
  }, [marcarTodos, trabajadoresUnicos, workerValues, valorUnitarioGlobal]);

  const totalSeleccionado = useMemo(() => {
    let total = 0;
    Object.entries(selectedWorkers).forEach(([doc, sel]) => {
      if (!sel) return;
      const valor = parseFloat(workerValues[doc]) || 0;
      const cantidad = modoCobro === 'por_trabajador' ? 1 : getCantidadAtenciones(doc);
      total += valor * cantidad;
    });
    return total;
  }, [selectedWorkers, workerValues, modoCobro, getCantidadAtenciones]);

  const detalleAtenciones = useMemo(() => {
    const dets = [];
    Object.entries(selectedWorkers).forEach(([doc, sel]) => {
      if (!sel) return;
      const trab = trabajadoresUnicos.find(t => t.docNumero === doc);
      if (!trab) return;
      trab.atenciones.forEach(a => {
        dets.push({
          trabajador: trab.nombres,
          documento: trab.docTipo + ' ' + trab.docNumero,
          fecha: a.fechaAtencion,
          tipo: a.tipoAtencion || 'Evaluacion'
        });
      });
    });
    return dets;
  }, [selectedWorkers, trabajadoresUnicos]);

  const generateBillData = useCallback(() => {
    const itemsParaGuardar = Object.entries(selectedWorkers).filter(([_, sel]) => sel).map(([doc, _]) => {
      const trab = trabajadoresUnicos.find(t => t.docNumero === doc);
      const cantidad = modoCobro === 'por_trabajador' ? 1 : getCantidadAtenciones(doc);
      const valor = workerValues[doc] || 0;
      return {
        descripcion: 'Evaluacion medica - ' + (trab?.nombres || 'Trabajador'),
        cantidad, 
        valorUnit: valor,
        subtotal: cantidad * valor
      };
    });

    return {
      numero: 'CC-' + String(savedBills.length + 1).padStart(4, '0'),
      fecha: new Date().toISOString().split('T')[0],
      empresaId: '',
      empresaNombre: '',
      empresaNit: '',
      items: itemsParaGuardar.length > 0 ? itemsParaGuardar : [{ id: Date.now(), descripcion: 'Evaluacion medica ocupacional', cantidad: 1, valorUnit: 0 }],
      total: totalSeleccionado,
      detalleAtenciones,
      referenciaEmpresa: {
        nit: '',
        nombre: '',
        empresaId: '',
        periodo: filterMes || new Date().toISOString().slice(0, 7),
        fechaGeneracion: new Date().toISOString()
      },
      trabajadoresCount: Object.keys(selectedWorkers).filter(([_, sel]) => sel).length,
      modoCobro
    };
  }, [selectedWorkers, workerValues, modoCobro, getCantidadAtenciones, trabajadoresUnicos, totalSeleccionado, filterMes, savedBills.length]);

  const handleSaveBill = useCallback((billData) => {
    if (_sync) _sync('siso_saved_bills', [...savedBills, billData]);
    showAlert?.('Cuenta de cobro guardada correctamente', 'success');
  }, [_sync, savedBills, showAlert]);

  return {
    // Estados
    filterEmpresaId, setFilterEmpresaId,
    filterMes, setFilterMes,
    selectedWorkers, toggleWorker,
    workerValues, updateWorkerValor,
    marcarTodos, handleMarcarTodos,
    modoCobro, setModoCobro,
    valorUnitarioGlobal, setValorUnitarioGlobal,
    
    // Computados
    atencionesGlobales,
    atencionesFiltradas,
    trabajadoresUnicos,
    getCantidadAtenciones,
    totalSeleccionado,
    detalleAtenciones,
    
    // Acciones
    generateBillData,
    handleSaveBill
  };
};

