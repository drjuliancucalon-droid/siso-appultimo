// src/modules/patients/hooks/usePatients.js
// ═══════════════════════════════════════════════════════════════════════
// Hook para gestión de pacientes - Extraído del monolito PatientList
// ═══════════════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from 'react';
import { sp } from '../../../shared/lib/storage';

const PACIENTES_KEY = 'siso_pacientes';

export const usePatients = (pacientesExternos = null) => {
  // ── Estado ───────────────────────────────────────────────────────────
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [ordenDir, setOrdenDir] = useState('desc');

  // ── Efecto: Cargar pacientes ─────────────────────────────────────────
  useEffect(() => {
    if (pacientesExternos) {
      setPacientes(pacientesExternos);
    } else {
      setPacientes(sp(PACIENTES_KEY, []));
    }
  }, [pacientesExternos]);

  // ── Memo: Empresas únicas ────────────────────────────────────────────
  const empresas = useMemo(() => {
    const set = new Set();
    pacientes.forEach((p) => {
      const emp = p.empresa || p.empresaNombre;
      if (emp) set.add(emp);
    });
    return Array.from(set).sort();
  }, [pacientes]);

  // ── Memo: Tipos únicos ────────────────────────────────────────────────
  const tipos = useMemo(() => {
    const set = new Set();
    pacientes.forEach((p) => {
      const tipo = p.tipoExamen || p.tipo;
      if (tipo) set.add(tipo);
    });
    return Array.from(set).sort();
  }, [pacientes]);

  // ── Memo: Pacientes filtrados y ordenados ────────────────────────────
  const filtrados = useMemo(() => {
    let lista = pacientes.filter((p) => {
      const q = busqueda.toLowerCase();
      const coincideBusqueda =
        !busqueda ||
        (p.nombres || p.nombre || p.paciente || '').toLowerCase().includes(q) ||
        (p.docNumero || p.documento || '').toLowerCase().includes(q);
      const coincideEmpresa =
        !filtroEmpresa || (p.empresa || p.empresaNombre || '') === filtroEmpresa;
      const coincideTipo =
        !filtroTipo || (p.tipoExamen || p.tipo || '') === filtroTipo;
      return coincideBusqueda && coincideEmpresa && coincideTipo;
    });

    lista.sort((a, b) => {
      const fa = a.fechaExamen || a.fecha || '';
      const fb = b.fechaExamen || b.fecha || '';
      return ordenDir === 'desc' ? fb.localeCompare(fa) : fa.localeCompare(fb);
    });

    return lista;
  }, [pacientes, busqueda, filtroEmpresa, filtroTipo, ordenDir]);

  // ── Utilidad: Badge de concepto ───────────────────────────────────────
  const conceptoBadge = (concepto) => {
    const c = (concepto || '').toLowerCase();
    if (c.includes('apto sin') || c === 'apto') return 'bg-green-100 text-green-700';
    if (c.includes('apto con')) return 'bg-yellow-100 text-yellow-700';
    if (c.includes('no apto') || c.includes('aplazado')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  };

  // ── Retorno ──────────────────────────────────────────────────────────
  return {
    // Estado
    pacientes,
    busqueda,
    filtroEmpresa,
    filtroTipo,
    ordenDir,
    // Setters
    setBusqueda,
    setFiltroEmpresa,
    setFiltroTipo,
    setOrdenDir,
    // Datos derivados
    empresas,
    tipos,
    filtrados,
    // Utilidades
    conceptoBadge,
  };
};
