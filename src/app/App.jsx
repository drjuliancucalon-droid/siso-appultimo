// src/app/App.jsx
// ═══════════════════════════════════════════════════════════════════════
// SISO OcupaSalud Pro — Application Shell (Coordinator)
// Thin orchestrator: routing, auth, nav, sync. No business logic here.
// ═══════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, ClipboardList, Stethoscope, Building2,
  Users, Calendar, Receipt, Wallet, CreditCard, BarChart3,
  Shield, Video, UserCheck, LogOut, RefreshCw, Menu, X,
  ChevronRight, Settings, Bell, Moon, Sun
} from 'lucide-react';

// Shared utilities
import { _ls, _memStore } from '../shared/lib/storage.js';
import { _verifyPassword } from '../shared/lib/crypto.js';
import { _isAdmin, _canUse, _secretariaPuede, PLAN_CONFIG } from '../shared/data/planConfig.js';
import { initialUsers } from '../shared/data/initialStates.js';
import { _sync, setSyncStatusCallback } from '../shared/lib/supabase.js';

// Auth UI
import LoginForm from '../modules/auth/ui/LoginForm.jsx';
import PrivacyModal from '../modules/auth/ui/PrivacyModal.jsx';
import ChangePasswordForm from '../modules/auth/ui/ChangePasswordForm.jsx';

// Pages
import Dashboard from '../pages/Dashboard.jsx';
import Historia from '../pages/Historia.jsx';
import Companies from '../pages/Companies.jsx';
import UsersPage from '../pages/Users.jsx';
import Agenda from '../pages/Agenda.jsx';
import Bill from '../pages/Bill.jsx';
import Caja from '../pages/Caja.jsx';
import Planes from '../pages/Planes.jsx';
import Reporte from '../pages/Reporte.jsx';
import SGSST from '../pages/SGSST.jsx';
import Telemedicine from '../pages/Telemedicine.jsx';
import WorkerPortal from '../pages/WorkerPortal.jsx';

// ═══════════════════════════════════════════════════════════════════════
// NAV ITEMS — sidebar navigation definition
// ═══════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Dashboard',          icon: LayoutDashboard, color: 'blue',    roles: ['all'] },
  { id: 'hc_ocupacional',  label: 'HC Ocupacional',     icon: ClipboardList,   color: 'blue',    roles: ['super_admin', 'administrador', 'medico'] },
  { id: 'hc_general',      label: 'HC General',         icon: Stethoscope,     color: 'emerald', roles: ['super_admin', 'administrador', 'medico'] },
  { id: 'empresas',        label: 'Empresas',           icon: Building2,       color: 'emerald', roles: ['super_admin', 'administrador', 'medico', 'secretaria'], perm: 'empresas' },
  { id: 'usuarios',        label: 'Usuarios',           icon: Users,           color: 'indigo',  roles: ['super_admin', 'administrador'] },
  { id: 'agenda',          label: 'Agenda',             icon: Calendar,        color: 'green',   roles: ['super_admin', 'administrador', 'medico', 'secretaria'], perm: 'agenda' },
  { id: 'facturacion',     label: 'Facturación',        icon: Receipt,         color: 'amber',   roles: ['super_admin', 'administrador', 'medico', 'secretaria'], perm: 'bill' },
  { id: 'caja',            label: 'Caja',               icon: Wallet,          color: 'emerald', roles: ['super_admin', 'administrador', 'medico', 'secretaria'], perm: 'caja' },
  { id: 'planes',          label: 'Planes',             icon: CreditCard,      color: 'purple',  roles: ['super_admin', 'administrador'] },
  { id: 'reportes',        label: 'Reportes',           icon: BarChart3,       color: 'blue',    roles: ['super_admin', 'administrador', 'medico', 'secretaria'], perm: 'reporte' },
  { id: 'sgsst',           label: 'SG-SST',             icon: Shield,          color: 'red',     roles: ['super_admin', 'administrador', 'medico'] },
  { id: 'telemedicina',    label: 'Telemedicina',       icon: Video,           color: 'purple',  roles: ['super_admin', 'administrador', 'medico', 'secretaria'], perm: 'telemedicina' },
  { id: 'portal',          label: 'Portal Trabajador',  icon: UserCheck,       color: 'teal',    roles: ['all'] },
];

// Session timeout: 30 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// ═══════════════════════════════════════════════════════════════════════
// APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function App() {
  // ─── Auth state ───
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siso_currentUser')); } catch { return null; }
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginBlockedUntil, setLoginBlockedUntil] = useState(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);

  // ─── App state ───
  const [view, setView] = useState(() => window.location.hash.slice(1) || 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | loading | syncing | ok | error

  // ─── Data state (loaded from localStorage / Supabase) ───
  const [usersList, setUsersList] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siso_users')) || initialUsers; } catch { return initialUsers; }
  });
  const [patientsList, setPatientsList] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siso_patients')) || []; } catch { return []; }
  });
  const [companies, setCompanies] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siso_companies')) || []; } catch { return []; }
  });
  const [savedBills, setSavedBills] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siso_bills')) || []; } catch { return []; }
  });
  const [movimientos, setMovimientos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siso_movimientos')) || []; } catch { return []; }
  });
  const [appointments, setAppointments] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siso_appointments')) || []; } catch { return []; }
  });
  const [atencionesCerradas, setAtencionesCerradas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siso_atenciones')) || []; } catch { return []; }
  });
  const [consultations, setConsultations] = useState([]);

  // HC state
  const [activeTab, setActiveTab] = useState('ocupacional');
  const [hcData, setHcData] = useState(null);

  // Session timer
  const lastActivity = useRef(Date.now());
  const sessionTimer = useRef(null);

  // ─── Hash-based routing ───
  const goTo = useCallback((v) => {
    setView(v);
    window.location.hash = v;
    setMobileSidebar(false);
    lastActivity.current = Date.now();
  }, []);

  useEffect(() => {
    const handler = () => setView(window.location.hash.slice(1) || 'dashboard');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // ─── Persist data to localStorage on change ───
  useEffect(() => { localStorage.setItem('siso_patients', JSON.stringify(patientsList)); }, [patientsList]);
  useEffect(() => { localStorage.setItem('siso_companies', JSON.stringify(companies)); }, [companies]);
  useEffect(() => { localStorage.setItem('siso_bills', JSON.stringify(savedBills)); }, [savedBills]);
  useEffect(() => { localStorage.setItem('siso_movimientos', JSON.stringify(movimientos)); }, [movimientos]);
  useEffect(() => { localStorage.setItem('siso_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('siso_users', JSON.stringify(usersList)); }, [usersList]);

  // ─── Session timeout ───
  useEffect(() => {
    if (!currentUser) return;
    const checkTimeout = () => {
      if (Date.now() - lastActivity.current > SESSION_TIMEOUT_MS) {
        handleLogout();
      }
    };
    sessionTimer.current = setInterval(checkTimeout, 60000);
    const resetTimer = () => { lastActivity.current = Date.now(); };
    window.addEventListener('click', resetTimer);
    window.addEventListener('keydown', resetTimer);
    return () => {
      clearInterval(sessionTimer.current);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [currentUser]);

  // ─── Supabase sync on login ───
  useEffect(() => {
    if (!currentUser) return;
    setSyncStatusCallback?.(setSyncStatus);
    // Initial sync (non-blocking)
    setSyncStatus('loading');
    try { _sync?.(); } catch { /* silent */ }
    setSyncStatus('ok');
  }, [currentUser]);

  // ─── Auth handlers ───
  const handleLogin = useCallback(async (user, pass) => {
    if (loginBlockedUntil && Date.now() < loginBlockedUntil) return;

    const found = usersList.find(u => u.user === user);
    if (!found) {
      setLoginAttempts(a => {
        const next = a + 1;
        if (next >= 5) setLoginBlockedUntil(Date.now() + 120000);
        return next;
      });
      return;
    }

    // Password verification (plain text or hashed)
    let valid = false;
    if (found.passHash) {
      try { valid = await _verifyPassword(pass, found.passHash); } catch { valid = false; }
    } else {
      valid = found.pass === pass;
    }

    if (!valid) {
      setLoginAttempts(a => {
        const next = a + 1;
        if (next >= 5) setLoginBlockedUntil(Date.now() + 120000);
        return next;
      });
      return;
    }

    const userSession = {
      user: found.user,
      name: found.name,
      role: found.role,
      license: found.license || 'libre',
      licenseExpiry: found.licenseExpiry,
      secretariaPermisos: found.secretariaPermisos,
    };

    setCurrentUser(userSession);
    localStorage.setItem('siso_currentUser', JSON.stringify(userSession));
    setLoginAttempts(0);
    setLoginBlockedUntil(null);
    lastActivity.current = Date.now();
    goTo('dashboard');
  }, [usersList, loginBlockedUntil, goTo]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('siso_currentUser');
    goTo('dashboard');
  }, [goTo]);

  // ─── Role-based nav visibility ───
  const canSeeNav = useCallback((item) => {
    if (!currentUser) return item.roles.includes('all');
    if (item.roles.includes('all')) return true;
    if (_isAdmin(currentUser.role)) return true;
    if (!item.roles.includes(currentUser.role)) return false;
    if (item.perm && currentUser.role === 'secretaria') {
      return _secretariaPuede(item.perm, currentUser, usersList);
    }
    return true;
  }, [currentUser, usersList]);

  const canUseSGSST = currentUser && (
    _isAdmin(currentUser.role) || currentUser.role === 'medico'
  );

  // ─── Sync handler ───
  const handleSync = useCallback(() => {
    setSyncStatus('syncing');
    try { _sync?.(); setSyncStatus('ok'); }
    catch { setSyncStatus('error'); }
  }, []);

  // ─── Render login if not authenticated ───
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-800">SISO OcupaSalud Pro</h1>
            <p className="text-sm text-gray-500 mt-1">Sistema Integral de Salud Ocupacional</p>
          </div>
          <LoginForm
            onLogin={handleLogin}
            blockedUntil={loginBlockedUntil}
            attempts={loginAttempts}
          />
          <div className="mt-4 text-center">
            <button onClick={() => setShowPrivacy(true)} className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
              Política de Privacidad
            </button>
          </div>
        </div>
        {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      </div>
    );
  }

  // ─── Sync status indicator ───
  const SyncIndicator = () => {
    const colors = { idle: 'bg-gray-400', loading: 'bg-yellow-400', syncing: 'bg-yellow-400', ok: 'bg-green-400', error: 'bg-red-400' };
    const labels = { idle: 'Sin sincronizar', loading: 'Cargando...', syncing: 'Sincronizando...', ok: 'Sincronizado', error: 'Error sync' };
    return (
      <button onClick={handleSync} className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors" title={labels[syncStatus]}>
        <span className={`w-2 h-2 rounded-full ${colors[syncStatus]} ${syncStatus === 'syncing' ? 'animate-sync-pulse' : ''}`} />
        <span className="text-[10px] text-gray-500 hidden lg:inline">{labels[syncStatus]}</span>
      </button>
    );
  };

  // ─── Session remaining time display ───
  const sessionMinutes = Math.max(0, Math.floor((SESSION_TIMEOUT_MS - (Date.now() - lastActivity.current)) / 60000));

  // ─── Render view ───
  const renderView = () => {
    const commonProps = { currentUser, goTo };

    switch (view) {
      case 'dashboard':
        return <Dashboard {...commonProps} patientsList={patientsList} companies={companies} atencionesCerradas={atencionesCerradas} canUseSGSST={canUseSGSST} />;
      case 'hc_ocupacional':
        return <Historia {...commonProps} patientsList={patientsList} companies={companies} activeTab="ocupacional" onTabChange={setActiveTab} data={hcData} onDataChange={setHcData} onNewPatient={() => setHcData({})} onSelectPatient={(p) => setHcData(p)} />;
      case 'hc_general':
        return <Historia {...commonProps} patientsList={patientsList} companies={companies} activeTab="general" onTabChange={setActiveTab} data={hcData} onDataChange={setHcData} onNewPatient={() => setHcData({})} onSelectPatient={(p) => setHcData(p)} />;
      case 'empresas':
        return <Companies companies={companies} patientsList={patientsList} onAdd={(c) => setCompanies(prev => [...prev, c])} onEdit={(c) => setCompanies(prev => prev.map(x => x.id === c.id ? c : x))} onDelete={(c) => setCompanies(prev => prev.filter(x => x.id !== c.id))} />;
      case 'usuarios':
        return <UsersPage {...commonProps} usersList={usersList} onAddUser={(u) => setUsersList(prev => [...prev, u])} onEditUser={(u) => setUsersList(prev => prev.map(x => x.user === u.user ? { ...x, ...u } : x))} onDeleteUser={(u) => setUsersList(prev => prev.filter(x => x.user !== u.user))} />;
      case 'agenda':
        return <Agenda {...commonProps} patientsList={patientsList} companies={companies} appointments={appointments} onAddAppointment={(a) => setAppointments(prev => [...prev, a])} onCompleteAppointment={(id) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, completed: true } : a))} />;
      case 'facturacion':
        return <Bill {...commonProps} companies={companies} savedBills={savedBills} onSaveBill={(b) => setSavedBills(prev => [...prev, b])} onDeleteBill={(id) => setSavedBills(prev => prev.filter(b => b.id !== id))} />;
      case 'caja':
        return <Caja {...commonProps} movimientos={movimientos} onAddMovimiento={(m) => setMovimientos(prev => [...prev, m])} />;
      case 'planes':
        return <Planes currentUser={currentUser} />;
      case 'reportes':
        return <Reporte {...commonProps} patientsList={patientsList} companies={companies} atencionesCerradas={atencionesCerradas} />;
      case 'sgsst':
        return <SGSST {...commonProps} companies={companies} />;
      case 'telemedicina':
        return <Telemedicine {...commonProps} consultations={consultations} patientsList={patientsList} onNewConsultation={(c) => setConsultations(prev => [...prev, c])} onStartConsultation={(id) => setConsultations(prev => prev.map(c => c.id === id ? { ...c, estado: 'activa' } : c))} onEndConsultation={(id) => setConsultations(prev => prev.map(c => c.id === id ? { ...c, estado: 'finalizada' } : c))} />;
      case 'portal':
        return <WorkerPortal patientsList={patientsList} atencionesCerradas={atencionesCerradas} />;
      default:
        return <Dashboard {...commonProps} patientsList={patientsList} companies={companies} atencionesCerradas={atencionesCerradas} canUseSGSST={canUseSGSST} />;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN LAYOUT
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ─── Mobile overlay ─── */}
      {mobileSidebar && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileSidebar(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${mobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-gray-200 shadow-sm
        flex flex-col transition-all duration-300 no-print
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h2 className="text-sm font-black text-gray-800 truncate">OcupaSalud Pro</h2>
                <p className="text-[10px] text-gray-400 truncate">Sistema SST v1.0</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV_ITEMS.filter(canSeeNav).map(item => {
            const Icon = item.icon;
            const isActive = view === item.id ||
              (item.id === 'hc_ocupacional' && view === 'hc_ocupacional') ||
              (item.id === 'hc_general' && view === 'hc_general');
            return (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? `bg-${item.color}-50 text-${item.color}-700 font-semibold`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? `text-${item.color}-600` : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {sidebarOpen && (
                  <span className="truncate">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                  <ChevronRight className={`w-4 h-4 ml-auto text-${item.color}-400`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-gray-100">
          {sidebarOpen && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600">
                  {(currentUser?.name || currentUser?.user || '?')[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{currentUser?.name || currentUser?.user}</p>
                <p className="text-[10px] text-gray-400 truncate">{currentUser?.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 no-print shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (window.innerWidth < 1024) setMobileSidebar(!mobileSidebar); else setSidebarOpen(!sidebarOpen); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="hidden sm:block">
              <h3 className="text-sm font-bold text-gray-800">
                {NAV_ITEMS.find(n => n.id === view)?.label || 'Dashboard'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SyncIndicator />
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 text-[10px] text-gray-400 session-timer">
              <RefreshCw className="w-3 h-3" />
              Sesión: {sessionMinutes}min
            </div>
            <button onClick={() => setShowChangePass(true)} className="p-2 hover:bg-gray-100 rounded-lg" title="Configuración">
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 content-area main-content">
          {renderView()}
        </main>
      </div>

      {/* ─── Modals ─── */}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showChangePass && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowChangePass(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">Configuración</h2>
              <button onClick={() => setShowChangePass(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <ChangePasswordForm
              currentUser={currentUser}
              onClose={() => setShowChangePass(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
