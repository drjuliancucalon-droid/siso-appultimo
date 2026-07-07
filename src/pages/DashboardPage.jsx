// src/pages/DashboardPage.jsx — Dashboard with real data from backend
// B-14: Plan gate wrappers for SVE/ARL/Telemedicina cards + plan status banner
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import { PLAN_CONFIG } from '../shared/data/planConfig';
import {
  Users, Building2, Calendar, FileText, FileCheck, BarChart3,
  Shield, Stethoscope, Activity, AlertTriangle, TrendingUp,
  Cloud, HardDrive, Video, Sparkles, Loader2, Search, ExternalLink, Lock, CheckCircle, XCircle, Clock,
  FileSearch, UserCheck, Heart, Receipt, Unlock, Calculator, Briefcase
} from 'lucide-react';
import { useAIStore } from '../stores/aiStore';
import { dailySummary } from '../modules/ai/services/aiAnalysis';
import { AIConfigPanel } from '../modules/ai/components/AIConfigPanel';

const QUICK_ACTIONS = [
  { path: '/hc/new', icon: Stethoscope, label: 'Nueva HC', color: 'from-emerald-600 to-teal-500', desc: 'Historia Clínica' },
  { path: '/patients', icon: Users, label: 'Pacientes', color: 'from-teal-600 to-teal-500', desc: 'Gestionar pacientes' },
  { path: '/agenda', icon: Calendar, label: 'Agenda', color: 'from-indigo-600 to-violet-500', desc: 'Citas y cola' },
  { path: '/companies', icon: Building2, label: 'Empresas', color: 'from-emerald-700 to-emerald-500', desc: 'Gestionar empresas' },
  { path: '/reports', icon: BarChart3, label: 'Reportes', color: 'from-teal-700 to-teal-500', desc: 'Epidemiología' },
  { path: '/sgsst', icon: Shield, label: 'SG-SST', color: 'from-emerald-800 to-emerald-600', desc: 'Gestión SST' },
];


// ─────────────────────────────────────────────────────────────
// UltimosPacientes — 30 últimos pacientes, idéntico al monolito
// ─────────────────────────────────────────────────────────────
function getInitials(p) {
  const ap = p.apellidos || '';
  const nm = p.nombres || p.nombreCompleto || '';
  const parts = (ap + ' ' + nm).trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return '??';
}

function getAvatarColor(nombre) {
  const colors = [
    'bg-emerald-500','bg-teal-500','bg-cyan-500','bg-blue-500',
    'bg-indigo-500','bg-violet-500','bg-purple-500','bg-fuchsia-500',
  ];
  let h = 0;
  for (let c of (nombre || '')) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[h % colors.length];
}

function TipoExamenBadge({ tipo }) {
  const map = {
    'INGRESO':         'bg-blue-100 text-blue-800',
    'PERIODICO':       'bg-indigo-100 text-indigo-800',
    'PERIÓDICO':       'bg-indigo-100 text-indigo-800',
    'EGRESO':          'bg-orange-100 text-orange-800',
    'POST-INCAPACIDAD':'bg-yellow-100 text-yellow-800',
    'POST INCAPACIDAD':'bg-yellow-100 text-yellow-800',
    'REUBICACION':     'bg-purple-100 text-purple-800',
    'REUBICACIÓN':     'bg-purple-100 text-purple-800',
  };
  const t = (tipo || '').toUpperCase();
  const cls = map[t] || 'bg-gray-100 text-gray-700';
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${cls}`}>{tipo || '—'}</span>;
}

function ConceptoBadge({ concepto }) {
  const c = (concepto || '').toUpperCase();
  if (c.includes('NO APTO'))
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 whitespace-nowrap"><XCircle className="w-2.5 h-2.5" />NO APTO</span>;
  if (c.includes('RESTRICC'))
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-700 whitespace-nowrap"><Clock className="w-2.5 h-2.5" />CON RESTRICCIONES</span>;
  if (c.includes('APTO'))
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 whitespace-nowrap"><CheckCircle className="w-2.5 h-2.5" />APTO</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 whitespace-nowrap">{concepto || 'Pendiente'}</span>;
}

function EstadoHCBadge({ estado }) {
  const e = (estado || '').toLowerCase();
  if (e === 'cerrada')
    return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600"><Lock className="w-2.5 h-2.5" />Cerrada</span>;
  return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700"><Clock className="w-2.5 h-2.5" />Abierta</span>;
}

function UltimosPacientes({ patients, navigate }) {
  const [busqueda, setBusqueda] = useState('');

  const sorted = useMemo(() => {
    if (!Array.isArray(patients)) return [];
    return [...patients].sort((a, b) => {
      const fa = a.fechaExamen || a.fechaCreacion || '';
      const fb = b.fechaExamen || b.fechaCreacion || '';
      return fb.localeCompare(fa);
    });
  }, [patients]);

  const filtered = useMemo(() => {
    if (!busqueda.trim()) return sorted.slice(0, 30);
    const q = busqueda.toLowerCase();
    return sorted.filter(p =>
      (p.nombres || '').toLowerCase().includes(q) ||
      (p.apellidos || '').toLowerCase().includes(q) ||
      (p.nombreCompleto || '').toLowerCase().includes(q) ||
      (p.empresa || '').toLowerCase().includes(q) ||
      (p.empresaNombre || '').toLowerCase().includes(q) ||
      (p.docNumero || '').toLowerCase().includes(q) ||
      (p.cargo || '').toLowerCase().includes(q)
    ).slice(0, 30);
  }, [sorted, busqueda]);

  const handleAbrirHC = (p) => {
    if (p.docNumero) navigate(`/patients/${encodeURIComponent(p.docNumero)}/hc`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ gridColumn: '1 / -1' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-gray-800 text-sm">Últimos Pacientes Atendidos</h3>
            <p className="text-[10px] text-gray-400">
              {patients?.length > 0 ? `${filtered.length} de ${patients.length} registros` : 'Sin registros'}
            </p>
          </div>
        </div>
        {/* Buscador */}
        <div className="relative w-56">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa, doc..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-300 outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Users className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-bold">{busqueda ? 'Sin resultados para esa búsqueda' : 'No hay pacientes registrados'}</p>
          {busqueda && <button onClick={() => setBusqueda('')} className="mt-2 text-xs text-emerald-600 underline">Limpiar filtro</button>}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-100 text-[10px] uppercase tracking-wide">
                <th className="text-left py-2.5 px-3 font-black">Paciente</th>
                <th className="text-left py-2.5 px-3 font-black">Documento</th>
                <th className="text-left py-2.5 px-3 font-black">Empresa / Cargo</th>
                <th className="text-left py-2.5 px-3 font-black">Tipo Examen</th>
                <th className="text-left py-2.5 px-3 font-black">Concepto Aptitud</th>
                <th className="text-left py-2.5 px-3 font-black">Estado HC</th>
                <th className="text-left py-2.5 px-3 font-black">Fecha</th>
                <th className="text-center py-2.5 px-3 font-black">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const nombre = [p.apellidos, p.nombres].filter(Boolean).join(', ') || p.nombreCompleto || 'Sin nombre';
                const initials = getInitials(p);
                const avatarColor = getAvatarColor(nombre);
                const fecha = p.fechaExamen || p.fechaCreacion || '';
                const fechaFmt = fecha ? fecha.split('-').reverse().join('/') : '—';
                const empresa = p.empresaNombre || p.empresa || '—';
                const cargo = p.cargo || p.perfilCargo || '';
                const doc = [p.tipoDocumento, p.docNumero].filter(Boolean).join(' ') || '—';
                return (
                  <tr
                    key={p.id || p.docNumero || idx}
                    className="border-b border-gray-50 hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                    onClick={() => handleAbrirHC(p)}
                  >
                    {/* Paciente */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-black ${avatarColor}`}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 truncate max-w-[160px] text-[11px]">{nombre}</p>
                        </div>
                      </div>
                    </td>
                    {/* Documento */}
                    <td className="py-2.5 px-3 text-gray-500 font-mono text-[10px] whitespace-nowrap">{doc}</td>
                    {/* Empresa / Cargo */}
                    <td className="py-2.5 px-3">
                      <p className="text-gray-700 font-semibold text-[11px] truncate max-w-[140px]">{empresa}</p>
                      {cargo && <p className="text-gray-400 text-[9px] truncate max-w-[140px]">{cargo}</p>}
                    </td>
                    {/* Tipo Examen */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <TipoExamenBadge tipo={p.tipoExamen} />
                    </td>
                    {/* Concepto */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <ConceptoBadge concepto={p.conceptoAptitud} />
                    </td>
                    {/* Estado HC */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <EstadoHCBadge estado={p.estadoHistoria || p.estado} />
                    </td>
                    {/* Fecha */}
                    <td className="py-2.5 px-3 text-gray-400 text-[10px] whitespace-nowrap">{fechaFmt}</td>
                    {/* Acciones */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={e => { e.stopPropagation(); handleAbrirHC(p); }}
                        disabled={!p.docNumero}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="w-3 h-3" /> Abrir HC
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser, canUse } = useAuthStore();
  const { data: patients, source: patSource } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
  const { data: companies } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const { data: agenda } = useBackendData('/data/agenda', 'siso_agendados', 'appointments');
  const { data: bills } = useBackendData('/data/billing', 'siso_saved_bills', 'bills');
  const { data: doctor } = useBackendObject('/data/doctor', 'siso_doctor_data', 'doctor');

  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiResult, setAiResult] = React.useState(null);
  const [aiError, setAiError] = React.useState(null);
  const [showAIConfig, setShowAIConfig] = React.useState(false);
  const [showTurnoModal, setShowTurnoModal] = React.useState(false);
  const [storedTurno, setStoredTurno] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('siso_medico_turno') || 'null'); } catch { return null; }
  });

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7);
  const patientsThisMonth = patients.filter(p => (p.fechaExamen || '').startsWith(thisMonth)).length;
  const todayAppointments = agenda.filter(a => (a.fecha || '').startsWith(today)).length;
  const hcCount = patients.filter(p => p.fechaExamen).length;
  const hcAbiertas = patients.filter(p => p.estadoHistoria === 'Abierta' || p.estado === 'abierta' || !p.estadoHistoria).length;

  // GAP-D02: Cuentas pendientes con monto $
  const cuentasPendientes = bills.filter(b => b.estado === 'pendiente' || b.estado === 'Pendiente' || !b.estado);
  const montoPendiente = cuentasPendientes.reduce((sum, b) => sum + (parseInt(b.total) || parseInt(b.valor) || 0), 0);

  const displayName = doctor?.nombre || currentUser?.nombre || currentUser?.user || 'Doctor';

  const { activeProvider, keys: aiKeys } = useAIStore();
  const aiConfig = React.useMemo(() => ({ activeProvider, keys: aiKeys }), [activeProvider, aiKeys]);
  const hasKey = Object.values(aiKeys || {}).some(k => k?.trim()?.length > 0);

  const handleIADailySummary = async () => {
    if (!hasKey) { setShowAIConfig(true); return; }
    setAiLoading(true); setAiError(null);
    try {
      const dashboardData = {
        pacientesHoy: todayAppointments, citasPendientes: todayAppointments,
        hcSinCerrar: hcAbiertas, empresasActivas: companies.length,
        alertas: hcAbiertas > 0 ? [`${hcAbiertas} HC(s) sin cerrar`] : [],
        ingresosDia: '$0'
      };
      const result = await dailySummary(dashboardData, aiConfig);
      setAiResult(result);
    } catch (e) { setAiError(e.message||'Error IA'); }
    finally { setAiLoading(false); }
  };

  return (
    <>
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-5 h-5 text-teal-200" />
            <span className="text-emerald-200 text-xs font-bold uppercase tracking-wide">OcupaSalud Pro</span>
            {patSource === 'backend' && (
              <span className="flex items-center gap-1 text-emerald-300 text-[10px] ml-2">
                <Cloud className="w-3 h-3" /> Conectado a Supabase
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black">
            Bienvenido, {displayName}
          </h1>
          <p className="text-emerald-100 mt-1 text-sm">
            {new Date().toLocaleDateString('es-CO', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          {doctor?.licencia && (
            <p className="text-emerald-200 text-xs mt-1">RM: {doctor.licencia}</p>
          )}
          {/* Plan activo — real from PLAN_CONFIG */}
          {(() => {
            const plan = PLAN_CONFIG[currentUser?.license || 'libre'] || PLAN_CONFIG.libre;
            return (
              <p className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Plan: <span className="font-bold">{plan.label}</span>
                {plan.maxHC < 9999 && (
                  <span className="ml-1 opacity-75">· máx {plan.maxHC} HC</span>
                )}
              </p>
            );
          })()}
        </div>
      </div>

      {/* ═══ BANNER IPS — usuario con empresaId (como monolito L25682-25710) ═══ */}
      {currentUser?.empresaId && (() => {
        const _miEmpBanner = companies.find(c => c.id === currentUser.empresaId);
        return (
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-black text-lg tracking-tight">
                  {_miEmpBanner?.nombre || 'IPS'}
                </p>
                <p className="text-teal-100 text-xs">
                  NIT: {_miEmpBanner?.nit || '-'} · {_miEmpBanner?.ciudad || ''}
                  {' '}
                  {currentUser.role === 'admin_empresa' ? 'Admin IPS'
                    : currentUser.role === 'medico' ? 'Médico IPS'
                    : 'Secretaria IPS'}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ PLAN STATUS BANNER con progreso HC (como monolito L25759-25822) ═══ */}
      {(() => {
        const plan = PLAN_CONFIG[currentUser?.license || 'libre'] || PLAN_CONFIG.libre;
        const hcUsadas = patients.filter(p => p.fechaExamen).length;
        const pct = plan.maxHC < 9999 ? Math.round((hcUsadas / plan.maxHC) * 100) : -1;
        const _expDays = currentUser?.licenseExpiry
          ? Math.ceil((new Date(currentUser.licenseExpiry) - new Date()) / 86400000) : 99;
        const isExpiring = plan.price > 0 && _expDays >= 0 && _expDays <= 7 ? _expDays : false;
        const colorMap = { libre: 'gray', starter: 'teal', pro: 'blue', clinica: 'purple' };
        const col = colorMap[currentUser?.license || 'libre'] || 'gray';
        return (
          <div className={`mt-0 flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl bg-${col}-50 border border-${col}-200`}>
            <span className={`font-black text-sm text-${col}-700`}>{plan.label}</span>
            <span className="text-gray-400 text-xs">·</span>
            {plan.maxHC < 9999 ? (
              <span className={`text-xs font-bold ${pct >= 100 ? 'text-red-600' : pct >= 80 ? 'text-amber-600' : 'text-gray-600'}`}>
                📋 {hcUsadas}/{plan.maxHC} HC {pct >= 80 && '⚠️'}
                {pct >= 0 && (
                  <span className="ml-2 w-20 h-1.5 bg-gray-200 rounded-full inline-block align-middle">
                    <span className={`block h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </span>
                )}
              </span>
            ) : (
              <span className="text-xs text-gray-500">📋 HC ilimitadas</span>
            )}
            {isExpiring !== false && isExpiring >= 0 && (
              <span className="text-xs font-bold text-amber-600">⚠ Vence en {isExpiring}d</span>
            )}
            {plan.price === 0 && (
              <button onClick={() => navigate('/planes')}
                className={`ml-auto text-xs font-black bg-${col}-600 text-white px-3 py-1 rounded-lg hover:opacity-90 transition`}>
                ⭐ Ver planes
              </button>
            )}
          </div>
        );
      })()}

      {/* ═══ INDICADOR MÉDICO DE TURNO (como monolito L25716-25748) ═══ */}
      {currentUser?.role && ['super_admin', 'administrador'].includes(currentUser.role) && (
        <div className="flex items-center justify-end gap-2 mt-2">
          {(() => {
            const usersFromStorage = (() => { try { return JSON.parse(localStorage.getItem('siso_users') || '[]'); } catch { return []; } })();
            const turnoMedicoNombre = storedTurno
              ? (usersFromStorage.find(u => u.user === storedTurno.user)?.nombre || storedTurno.user)
              : null;
            return storedTurno ? (
              <div onClick={() => setShowTurnoModal(true)}
                className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-green-100 transition"
                title="Click para cambiar médico de turno">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-black text-green-700">
                  🩺 Turno: {turnoMedicoNombre}
                </span>
              </div>
            ) : (
              <div onClick={() => setShowTurnoModal(true)}
                className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-amber-100 transition"
                title="Click para asignar médico de turno">
                <span className="text-xs text-amber-600 font-bold">⚠ Sin médico de turno</span>
              </div>
            );
          })()}
        </div>
      )}

      {/* P3-05: Modal asignar médico de turno */}
      {showTurnoModal && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4" onClick={() => setShowTurnoModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-700 to-teal-500 rounded-t-2xl p-4">
              <p className="text-white font-black text-lg">🩺 Asignar Médico de Turno</p>
              <p className="text-emerald-100 text-xs mt-1">Selecciona el médico que estará de turno hoy</p>
            </div>
            <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
              {(() => {
                const usersFromStorage = (() => { try { return JSON.parse(localStorage.getItem('siso_users') || '[]'); } catch { return []; } })();
                const medicos = usersFromStorage.filter(u => u.role === 'medico' || u.role === 'administrador');
                if (medicos.length === 0) return <p className="text-gray-400 text-sm text-center py-4">No hay médicos registrados</p>;
                return medicos.map(m => {
                  const isActive = storedTurno?.user === m.user;
                  return (
                    <button key={m.user}
                      onClick={() => {
                        const turno = { user: m.user, nombre: m.nombre, asignadoEn: new Date().toISOString() };
                        localStorage.setItem('siso_medico_turno', JSON.stringify(turno));
                        setStoredTurno(turno);
                        setShowTurnoModal(false);
                      }}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-xl transition ${isActive ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                          {m.nombre ? m.nombre.substring(0, 2).toUpperCase() : m.user.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{m.nombre || m.user}</p>
                          <p className="text-xs text-gray-500">@{m.user} · {m.role}</p>
                        </div>
                      </div>
                      {isActive && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </button>
                  );
                });
              })()}
            </div>
            <div className="p-3 border-t border-gray-100 flex justify-between">
              {storedTurno && (
                <button onClick={() => { localStorage.removeItem('siso_medico_turno'); setStoredTurno(null); setShowTurnoModal(false); }}
                  className="text-xs text-red-600 font-bold hover:text-red-800">Quitar turno</button>
              )}
              <button onClick={() => setShowTurnoModal(false)} className="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* GAP-D04: CTAs principales Nueva HC Ocupacional/General (como monolito) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        <button
          onClick={() => navigate('/hc/new')}
          className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="font-black text-lg">Nueva HC Ocupacional</p>
              <p className="text-emerald-100 text-xs mt-1">FOR-SST-001 v4.0 · Res. 1843/2025</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate('/hc/general')}
          className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="font-black text-lg">Nueva HC General</p>
              <p className="text-blue-100 text-xs mt-1">Consulta médica general</p>
            </div>
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div>
        {/* ═══ CONFIG IA — Panel de estado y configuración (como en el monolito) ═══ */}
        <div className="mb-4">
          <div className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
            hasKey
              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                hasKey ? 'bg-indigo-600' : 'bg-amber-500'
              }`}>
                <span className="text-white text-lg">🤖</span>
              </div>
              <div>
                <p className="text-sm font-black text-gray-800">Inteligencia Artificial</p>
                {hasKey ? (
                  <p className="text-xs text-indigo-700 font-bold">
                    ✅ Proveedor activo: <span className="capitalize">{activeProvider}</span>
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 font-bold">
                    ⚠️ Sin configurar — Las funciones IA no funcionarán
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowAIConfig(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                hasKey
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
              }`}
            >
              ⚙️ {hasKey ? 'Cambiar Config IA' : 'Configurar IA ahora'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Acciones Rápidas</h2>
          <button onClick={handleIADailySummary} disabled={aiLoading}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
            {aiLoading ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
            {aiLoading ? 'Analizando...' : 'IA Resumen del Día'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all text-left group"
            >
              <div className={`bg-gradient-to-r ${action.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-sm text-gray-800">{action.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Módulos Especializados (B-14: plan-gated cards) ── */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">⚡ Módulos Especializados</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* SVE — requiere Starter */}
          <button
            onClick={() =>
              canUse('sve_starter')
                ? navigate('/reports')
                : alert('🔒 SVE está disponible en el plan 🌱 Starter ($45.000/mes, 2 programas) o ⭐ Pro ($79.000/mes, 7 programas).\n\nMenú → ⭐ Ver Planes')
            }
            className={`bg-white border rounded-xl p-3 flex items-center gap-2.5 transition group shadow-sm text-left ${
              canUse('sve_starter') ? 'border-gray-100 hover:border-teal-200 hover:bg-teal-50/40' : 'border-gray-100 opacity-70'
            }`}
          >
            <div className={`${canUse('sve_starter') ? 'bg-teal-50' : 'bg-gray-50'} p-2 rounded-lg flex-shrink-0`}>
              <BarChart3 className={`w-4 h-4 ${canUse('sve_starter') ? 'text-teal-600' : 'text-gray-400'}`} />
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                SVE {!canUse('sve_starter') && <span className="text-[8px] bg-amber-100 text-amber-700 px-0.5 rounded">🔒</span>}
              </p>
              <p className="text-[10px] text-gray-400 truncate">Vigilancia epidemiológica</p>
            </div>
          </button>

          {/* Telemedicina — requiere Starter */}
          <button
            onClick={() =>
              canUse('telemedicina_starter')
                ? navigate('/telemedicine')
                : alert('🔒 Telemedicina está disponible en el plan 🌱 Starter ($45.000/mes) o ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes')
            }
            className={`bg-white border rounded-xl p-3 flex items-center gap-2.5 transition group shadow-sm text-left ${
              canUse('telemedicina_starter') ? 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40' : 'border-gray-100 opacity-70'
            }`}
          >
            <div className={`${canUse('telemedicina_starter') ? 'bg-indigo-50' : 'bg-gray-50'} p-2 rounded-lg flex-shrink-0`}>
              <Video className={`w-4 h-4 ${canUse('telemedicina_starter') ? 'text-indigo-600' : 'text-gray-400'}`} />
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Telemedicina {!canUse('telemedicina_starter') && <span className="text-[8px] bg-amber-100 text-amber-700 px-0.5 rounded">🔒</span>}
              </p>
              <p className="text-[10px] text-gray-400 truncate">Teleconsultas</p>
            </div>
          </button>

          {/* ARL — requiere Pro */}
          <button
            onClick={() =>
              canUse('arl')
                ? navigate('/arl')
                : alert('🔒 Módulo ARL está disponible en el plan ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes')
            }
            className={`bg-white border rounded-xl p-3 flex items-center gap-2.5 transition group shadow-sm text-left ${
              canUse('arl') ? 'border-gray-100 hover:border-red-200 hover:bg-red-50/40' : 'border-gray-100 opacity-70'
            }`}
          >
            <div className={`${canUse('arl') ? 'bg-red-50' : 'bg-gray-50'} p-2 rounded-lg flex-shrink-0`}>
              <AlertTriangle className={`w-4 h-4 ${canUse('arl') ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Módulo ARL {!canUse('arl') && <span className="text-[8px] bg-amber-100 text-amber-700 px-0.5 rounded">🔒</span>}
              </p>
              <p className="text-[10px] text-gray-400 truncate">Reportes AT/EL</p>
            </div>
          </button>

          {/* Portal Empresa */}
          <button
            onClick={() => navigate('/portal-empresa')}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-emerald-200 hover:bg-emerald-50/40 transition group shadow-sm text-left"
          >
            <div className="bg-emerald-50 p-2 rounded-lg flex-shrink-0">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">Portal Empresa</p>
              <p className="text-[10px] text-gray-400 truncate">Acceso por NIT</p>
            </div>
          </button>

          {/* GAP-D07: Contabilidad V2 */}
          <button
            onClick={() => navigate('/contabilidad')}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-emerald-200 hover:bg-emerald-50/40 transition group shadow-sm text-left"
          >
            <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
              <Calculator className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">Contabilidad V2</p>
              <p className="text-[10px] text-gray-400 truncate">P&L · Pagos · KPIs</p>
            </div>
          </button>

          {/* GAP-D09: Portafolio */}
          <button
            onClick={() => navigate('/portafolio')}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-emerald-200 hover:bg-emerald-50/40 transition group shadow-sm text-left"
          >
            <div className="bg-amber-50 p-2 rounded-lg flex-shrink-0">
              <Briefcase className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">Portafolio</p>
              <p className="text-[10px] text-gray-400 truncate">Precios · Servicios</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Panel IA Resumen del Día (FASE 4) ── */}
      {aiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 inline mr-1" />{aiError}
        </div>
      )}
      {aiResult && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-indigo-800">Resumen IA del Día</h3>
          </div>
          {aiResult.resumen && <p className="text-sm text-gray-700 mb-3">{aiResult.resumen}</p>}
          {aiResult.prioridades?.length > 0 && (
            <div className="mb-2"><p className="font-bold text-amber-700 text-sm">Prioridades:</p><ul className="list-disc ml-4 text-amber-600 text-sm">{aiResult.prioridades.map((p,i)=><li key={i}>{p}</li>)}</ul></div>
          )}
          {aiResult.recomendacionesOperativas?.length > 0 && (
            <div className="mb-2"><p className="font-bold text-indigo-700 text-sm">Recomendaciones:</p><ul className="list-disc ml-4 text-gray-700 text-sm">{aiResult.recomendacionesOperativas.map((r,i)=><li key={i}>{r}</li>)}</ul></div>
          )}
          {aiResult.indicadorDelDia && <p className="text-xs text-gray-500 mt-2">📊 {aiResult.indicadorDelDia}</p>}
        </div>
      )}

      {/* Stats — now with REAL data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Pacientes atendidos', value: patientsThisMonth || patients.length, sub: patientsThisMonth ? 'Este mes' : 'Total', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { icon: Building2, label: 'Empresas activas', value: companies.length, sub: 'Total', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
          { icon: Calendar, label: 'Citas hoy', value: todayAppointments, sub: 'Pendientes', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { icon: Activity, label: 'HC generadas', value: hcCount, sub: 'Total', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-xl p-5 shadow-sm border ${stat.border}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.bg} p-2.5 rounded-xl`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-2xl font-black text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── KPIs ADICIONALES (como monolito) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(() => {
          const hcCerradas = patients.filter(p => p.estadoHistoria === 'Cerrada' || p.estado === 'cerrada').length;
          const hcAbiertas = patients.filter(p => p.estadoHistoria === 'Abierta' || p.estado === 'abierta' || !p.estadoHistoria).length;
          const medicosActivos = (() => {
            try {
              const users = JSON.parse(localStorage.getItem('siso_users') || '[]');
              return users.filter(u => u.activo !== false && (u.role === 'medico' || u.role === 'administrador')).length;
            } catch { return 1; }
          })();
          const conveniosPorVencer = companies.filter(c => {
            if (!c.convenioVencimiento) return false;
            const vence = new Date(c.convenioVencimiento);
            const thirtyDays = new Date();
            thirtyDays.setDate(thirtyDays.getDate() + 30);
            return vence <= thirtyDays && vence >= new Date();
          });
          return [
            { icon: FileCheck, label: 'HC Cerradas', value: hcCerradas, sub: 'Completadas', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { icon: FileText, label: 'HC Abiertas', value: hcAbiertas, sub: 'Pendientes', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { icon: Stethoscope, label: 'Médicos activos', value: medicosActivos, sub: 'En sistema', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { icon: Receipt, label: 'Cuentas pendientes', value: montoPendiente > 0 ? `$${montoPendiente.toLocaleString('es-CO')}` : 0, sub: `${cuentasPendientes.length} facturas`, color: montoPendiente > 0 ? 'text-red-600' : 'text-gray-600', bg: montoPendiente > 0 ? 'bg-red-50' : 'bg-gray-50', border: montoPendiente > 0 ? 'border-red-100' : 'border-gray-100' },
            // GAP-E06: Convenios tracker detallado
            ...(conveniosPorVencer.length > 0 ? [
              { icon: Shield, label: 'Convenios por vencer', value: conveniosPorVencer.length, sub: conveniosPorVencer.map(c => `${c.nombre} (${c.convenioVencimiento})`).join(' · '), color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
            ] : [
              { icon: Shield, label: 'Convenios por vencer', value: 0, sub: 'Próximos 30 días', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100' },
            ]),
          ].map((stat, i) => (
            <div key={`kpi-${i}`} className={`bg-white rounded-xl p-5 shadow-sm border ${stat.border}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.bg} p-2.5 rounded-xl`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          ));
        })()}
      </div>

      {/* ── ALERTAS (como monolito) ── */}
      {(() => {
        const hcAbiertas = patients.filter(p => p.estadoHistoria === 'Abierta' || p.estado === 'abierta' || !p.estadoHistoria).length;
        const tieneFirma = !!(doctor?.firma || doctor?.firmaDigital);
        const hasAlerts = hcAbiertas > 0 || cuentasPendientes.length > 0 || !tieneFirma;
        if (!hasAlerts) return null;
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" /> Alertas del Sistema
            </h3>
            <div className="space-y-1">
              {hcAbiertas > 0 && (
                <p className="text-sm text-amber-700">📋 {hcAbiertas} historia(s) clínica(s) sin cerrar — <button onClick={() => navigate('/patients')} className="underline font-bold hover:text-amber-900">Cerrar →</button></p>
              )}
              {cuentasPendientes.length > 0 && (
                <p className="text-sm text-amber-700">💰 {cuentasPendientes.length} cuenta(s) de cobro pendiente(s) por ${montoPendiente.toLocaleString('es-CO')} — <button onClick={() => navigate('/billing')} className="underline font-bold hover:text-amber-900">Ver →</button></p>
              )}
              {!tieneFirma && (
                <p className="text-sm text-amber-700">🖊️ No tiene firma digital cargada — <button onClick={() => navigate('/perfil')} className="underline font-bold hover:text-amber-900">Cargar →</button></p>
              )}
            </div>
          </div>
        );
      })()}

      {/* D-04: Últimos 30 Pacientes Atendidos — fiel al monolito */}
      <UltimosPacientes patients={patients} navigate={navigate} />

      {/* D-05: Próximas Citas (como monolito) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          Citas de Hoy
        </h3>
        {agenda && agenda.length > 0 ? (
          <ul className="space-y-2">
            {agenda.filter(a => (a.fecha || '').startsWith(today)).slice(0, 5).map((a, i) => (
              <li key={a.id || i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-600">{a.hora || '--:--'}</span>
                  <span>{a.paciente || a.nombre || 'Sin nombre'}</span>
                </div>
                <span className="text-gray-500 text-xs">{a.empresa || a.empresaNombre || '-'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No hay citas para hoy</p>
        )}
      </div>

      {/* ── PRODUCTIVIDAD MÉDICA (como monolito) ── */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          Productividad Médica
        </h3>
        {patients && patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b text-xs bg-gray-50">
                  <th className="text-left py-2 px-3 font-bold">Médico</th>
                  <th className="text-right py-2 px-3 font-bold">Atenciones</th>
                  <th className="text-right py-2 px-3 font-bold">HC Cerradas</th>
                  <th className="text-right py-2 px-3 font-bold">HC Abiertas</th>
                  <th className="text-right py-2 px-3 font-bold">% Participación</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const hcCerradas = patients.filter(p => p.estadoHistoria === 'Cerrada' || p.estado === 'cerrada').length;
                  const hcAbiertas = patients.filter(p => p.estadoHistoria === 'Abierta' || p.estado === 'abierta' || !p.estadoHistoria).length;
                  const atenciones = hcCerradas + hcAbiertas;
                  const participacion = patients.length > 0 ? ((atenciones / patients.length) * 100).toFixed(1) : 0;
                  const doctorName = doctor?.nombre || 'Dr. Julian Cucalon';
                  return (
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-bold text-gray-800">{doctorName}</td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-600">{atenciones}</td>
                      <td className="py-3 px-3 text-right font-bold text-green-600">{hcCerradas}</td>
                      <td className="py-3 px-3 text-right font-bold text-amber-600">{hcAbiertas}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                          {participacion}%
                        </span>
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Sin datos de productividad</p>
        )}
      </div>
    </div>

      {/* Modal Config IA */}
      {showAIConfig && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4"
          onClick={() => setShowAIConfig(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <AIConfigPanel
              aiConfig={aiConfig}
              onSave={async (newConfig) => {
                const store = useAIStore.getState();
                if (newConfig.activeProvider) store.setActiveProvider(newConfig.activeProvider);
                if (newConfig.keys) Object.entries(newConfig.keys).forEach(([p, k]) => store.setKey(p, k));
                const userId = JSON.parse(localStorage.getItem('siso-auth') || '{}')?.state?.currentUser?.user;
                if (userId) await store.saveToD1(userId);
              }}
              onClose={() => setShowAIConfig(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
