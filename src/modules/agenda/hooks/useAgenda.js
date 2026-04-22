// src/modules/agenda/hooks/useAgenda.js
// ═══════════════════════════════════════════════════════════════════════
// Hook para gestión de agenda - Extraído del monolito Agenda.jsx
// ═══════════════════════════════════════════════════════════════════════
import { useState, useMemo, useCallback } from 'react';

const TIPOS_CONSULTA = [
  { v: 'ingreso', l: 'Ingreso', mins: 20 },
  { v: 'egreso', l: 'Egreso', mins: 20 },
  { v: 'periodico', l: 'Periódico', mins: 20 },
  { v: 'seguimiento', l: 'Seguimiento', mins: 40 },
  { v: 'post_incapacidad', l: 'Post-Incapacidad', mins: 40 },
];

const DURACION = { ingreso: 20, egreso: 20, periodico: 20, seguimiento: 40, post_incapacidad: 40 };

const addMins = (hhmm, mins) => {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const horaActual = () => new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');

const calcEdad = (fNac) => {
  if (!fNac) return '';
  const parts = String(fNac).split('-');
  if (parts.length !== 3) return '';
  const nacY = parseInt(parts[0], 10);
  const nacM = parseInt(parts[1], 10) - 1;
  const nacD = parseInt(parts[2], 10);
  if (isNaN(nacY) || isNaN(nacM) || isNaN(nacD)) return '';
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacY;
  const mDiff = hoy.getMonth() - nacM;
  if (mDiff < 0 || (mDiff === 0 && hoy.getDate() < nacD)) edad--;
  return String(Math.max(0, edad));
};

export const useAgenda = ({ currentUser, patientsList = [], companies = [], appointments = [] }) => {
  const [agendaTab, setAgendaTab] = useState('hoy');
  const [agendaSuggs, setAgendaSuggs] = useState([]);
  const [agendaForm, setAgendaForm] = useState({
    nombre: '', docTipo: 'CC', docNumero: '', fechaNacimiento: '', edad: '',
    genero: '', celular: '', email: '', eps: '', arl: '',
    empresa: '', cargo: '', tipoConsulta: 'ingreso',
    fechaCita: '', horaCita: '', observacion: '', medicoId: currentUser?.user || '',
    _busquedaQuery: '',
  });

  const today = new Date().toISOString().split('T')[0];

  const miAgendaHoy = useMemo(() =>
    appointments.filter(a => a.fecha === today).sort((a, b) => (a.horaCita || '').localeCompare(b.horaCita || '')),
    [appointments, today]
  );

  const enEspera = useMemo(() => miAgendaHoy.filter(a => a.estado === 'espera'), [miAgendaHoy]);
  const atendiendo = useMemo(() => miAgendaHoy.filter(a => a.estado === 'atendiendo'), [miAgendaHoy]);
  const atendidos = useMemo(() => miAgendaHoy.filter(a => a.estado === 'atendido' || a.completed), [miAgendaHoy]);
  
  const proximas = useMemo(() =>
    appointments.filter(a => a.fecha > today).sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.horaCita || '').localeCompare(b.horaCita || '')),
    [appointments, today]
  );

  const handleBusqueda = useCallback((val) => {
    setAgendaForm(p => ({ ...p, nombre: val, _busquedaQuery: val }));
    if (val.length < 2) { setAgendaSuggs([]); return; }
    const q = val.toLowerCase();
    setAgendaSuggs(patientsList.filter(p => p.nombres?.toLowerCase().includes(q) || p.docNumero?.toLowerCase().includes(q)).slice(0, 8));
  }, [patientsList]);

  const seleccionarPaciente = useCallback((p) => {
    setAgendaForm(prev => ({
      ...prev,
      nombre: p.nombres || '', docTipo: p.docTipo || 'CC', docNumero: p.docNumero || '',
      fechaNacimiento: p.fechaNacimiento || '', edad: p.edad || calcEdad(p.fechaNacimiento),
      genero: p.genero || '', celular: p.celular || '', email: p.email || '',
      eps: p.eps || '', arl: p.arl || '',
      empresa: p.empresa || companies.find(c => c.id === p.companyId)?.nombre || '',
      cargo: p.cargo || '', _busquedaQuery: p.nombres || '',
    }));
    setAgendaSuggs([]);
  }, [companies]);

  const registrarPaciente = useCallback((onAddAppointment, showAlert) => {
    if (!agendaForm.nombre.trim()) { showAlert('Ingrese el nombre del paciente.'); return; }
    const fechaCita = agendaForm.fechaCita || today;
    const horaCita = agendaForm.horaCita || horaActual();
    const duracion = DURACION[agendaForm.tipoConsulta] || 20;
    const horaFin = addMins(horaCita, duracion);
    const esHoy = fechaCita === today;

    const nuevo = {
      id: 'ag_' + Date.now(),
      nombre: agendaForm.nombre.trim(),
      docTipo: agendaForm.docTipo,
      docNumero: agendaForm.docNumero.trim(),
      fechaNacimiento: agendaForm.fechaNacimiento,
      edad: agendaForm.edad || calcEdad(agendaForm.fechaNacimiento),
      genero: agendaForm.genero,
      celular: agendaForm.celular,
      email: agendaForm.email,
      eps: agendaForm.eps,
      arl: agendaForm.arl,
      empresa: agendaForm.empresa,
      cargo: agendaForm.cargo,
      medicoId: agendaForm.medicoId || currentUser?.user,
      medicoNombre: currentUser?.name || currentUser?.user,
      tipoConsulta: agendaForm.tipoConsulta,
      fecha: fechaCita,
      horaCita,
      horaFinCita: horaFin,
      duracion,
      hora: horaCita,
      observacion: agendaForm.observacion,
      estado: esHoy ? 'espera' : 'programado',
      registradoPor: currentUser?.user,
      registradoEn: new Date().toISOString(),
    };

    onAddAppointment?.(nuevo);
    setAgendaForm({
      nombre: '', docTipo: 'CC', docNumero: '', fechaNacimiento: '', edad: '',
      genero: '', celular: '', email: '', eps: '', arl: '',
      empresa: '', cargo: '', tipoConsulta: 'ingreso',
      fechaCita: '', horaCita: '', observacion: '', medicoId: currentUser?.user || '',
      _busquedaQuery: '',
    });
    setAgendaSuggs([]);
    setAgendaTab('hoy');
    showAlert(`✅ ${esHoy ? 'Paciente en sala de espera' : 'Cita programada para ' + fechaCita + ' a las ' + horaCita}.\nDuración: ${duracion} min`);
  }, [agendaForm, currentUser, today]);

  const resetForm = useCallback(() => {
    setAgendaForm({
      nombre: '', docTipo: 'CC', docNumero: '', fechaNacimiento: '', edad: '',
      genero: '', celular: '', email: '', eps: '', arl: '',
      empresa: '', cargo: '', tipoConsulta: 'ingreso',
      fechaCita: '', horaCita: '', observacion: '', medicoId: currentUser?.user || '',
      _busquedaQuery: '',
    });
    setAgendaSuggs([]);
  }, [currentUser]);

  return {
    // Estado
    agendaTab,
    setAgendaTab,
    agendaSuggs,
    agendaForm,
    setAgendaForm,
    // Computados
    today,
    miAgendaHoy,
    enEspera,
    atendiendo,
    atendidos,
    proximas,
    // Funciones
    handleBusqueda,
    seleccionarPaciente,
    registrarPaciente,
    resetForm,
    // Constantes
    TIPOS_CONSULTA,
    DURACION,
    // Helpers
    addMins,
    horaActual,
    calcEdad,
  };
};
