// src/app/Layout.jsx — Layout replicating ocupasalud original distribution
// Top header with brand + sync + user, horizontal tab navigation below
// Full-width content area (no sidebar stealing space)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAIStore } from '../stores/aiStore';
import { AIConfigPanel } from '../modules/ai/components/AIConfigPanel';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { ConnectionBadge } from '../shared/lib/connectionStatus';
import {
  LayoutDashboard, Users, Building2, Calendar, FileText,
  Receipt, DollarSign, BarChart3, Shield, Video,
  CreditCard, LogOut, Menu, X, Stethoscope, Activity,
  Cloud, CloudOff, Settings, ChevronLeft, ChevronRight,
  Bell, RefreshCw, ShieldCheck, Briefcase, Calculator,
  MessageCircle, Crown, BrainCircuit, Loader2
} from 'lucide-react';
import { useBackendObject } from '../hooks/useBackendData';
import { MensajesDrawer } from '../shared/components/MensajesDrawer';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/patients', icon: Users, label: 'Pacientes' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/companies', icon: Building2, label: 'Empresas' },
  { path: '/billing', icon: Receipt, label: 'Facturación', roles: ['administrador', 'super_admin', 'medico'] },
  { path: '/reports', icon: BarChart3, label: 'Reportes' },
  { path: '/hc/new', icon: Stethoscope, label: 'HC Ocup.', roles: ['medico', 'administrador', 'super_admin'] },
  { path: '/hc/general', icon: FileText, label: 'HC General', roles: ['medico', 'administrador', 'super_admin'] },
  { path: '/caja', icon: DollarSign, label: 'Caja' },
  { path: '/sgsst', icon: Shield, label: 'SG-SST' },
  { path: '/telemedicine', icon: Video, label: 'Telemedicina' },
  { path: '/users', icon: Settings, label: 'Usuarios', roles: ['administrador', 'super_admin'] },
  { path: '/planes', icon: CreditCard, label: 'Planes', roles: ['administrador', 'super_admin'] },
  { path: '/custodia', icon: FileText, label: 'Custodia', roles: ['medico', 'administrador', 'super_admin'] },
  { path: '/habeas-data', icon: ShieldCheck, label: 'Habeas Data' },
  { path: '/arl', icon: Shield, label: 'ARL', roles: ['medico', 'administrador', 'super_admin'] },
  { path: '/contabilidad', icon: Calculator, label: 'Contab.', roles: ['medico', 'administrador', 'super_admin'] },
  { path: '/mensajes', icon: MessageCircle, label: 'Mensajes' },
  { path: '/perfil', icon: Users, label: 'Mi Perfil' },
  { path: '/admin', icon: Crown, label: 'Admin', roles: ['super_admin'] },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  const { syncStatus, setSyncStatus, aiGenerating, aiGeneratingLabel } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showMensajesDrawer, setShowMensajesDrawer] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const { activeProvider, keys: aiKeys } = useAIStore();
  const aiConfig = { activeProvider, keys: aiKeys };
  const { data: doctor } = useBackendObject('/data/doctor', 'siso_doctor_data', 'doctor');
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Sync handler
  const handleManualSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      const keysToRefresh = ['siso_db_patients', 'siso_companies', 'siso_doctor_data', 'siso_agenda', 'siso_bills'];
      for (const key of keysToRefresh) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed._lastSync) { parsed._lastSync = null; localStorage.setItem(key, JSON.stringify(parsed)); }
          } catch {}
        }
      }
      window.location.reload();
    } catch { setSyncStatus('error'); setIsSyncing(false); }
  }, [isSyncing, setSyncStatus]);

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentUser?.role);
  });

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const doctorName = doctor?.nombre || currentUser?.nombre || currentUser?.user || '';
  const getInitials = () => {
    const parts = doctorName.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length > 2 ? 2 : 1][0]}`.toUpperCase();
    return doctorName.substring(0, 2).toUpperCase() || 'DR';
  };

  const checkScroll = () => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => { checkScroll(); window.addEventListener('resize', checkScroll); return () => window.removeEventListener('resize', checkScroll); }, []);

  const scrollTabs = (dir) => {
    const el = tabsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const activeBtn = el.querySelector('[data-active="true"]');
    if (activeBtn) { activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); setTimeout(checkScroll, 300); }
  }, [location.pathname]);

  const syncIcon = syncStatus === 'ok' || syncStatus === 'idle' ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />;
  const syncColor = syncStatus === 'ok' || syncStatus === 'idle' ? 'text-emerald-400' : syncStatus === 'syncing' ? 'text-yellow-400' : 'text-red-400';
  const syncText = syncStatus === 'ok' ? 'Sincronizado' : syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'error' ? 'Error sync' : 'Local';

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* ═══ TOP HEADER — Brand + Sync + User ═══ */}
      <header className="bg-white border-b border-gray-100 shadow-sm flex-shrink-0 no-print sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Left: Brand logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 mr-1"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="h-10 w-10 bg-gradient-to-tr from-emerald-700 to-teal-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <div className="flex flex-col items-center leading-none">
                  <Stethoscope className="w-3.5 h-3.5 mb-0.5 text-white" strokeWidth={2.5} />
                  <span className="text-[7px] font-black text-white/90 tracking-tighter">SO</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-black text-gray-800 uppercase leading-tight tracking-wide">OCUPASALUD</p>
                <div className="h-0.5 w-8 bg-gradient-to-r from-emerald-500 to-teal-400 my-0.5 rounded-full" />
                <p className="text-[9px] font-bold text-emerald-600 uppercase">SALUD OCUPACIONAL</p>
              </div>
            </div>
          </div>

          {/* Center: Nav buttons (MONOLITO style) */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              { path: '/patients', icon: Users, label: 'Pacientes' },
              { path: '/agenda', icon: Calendar, label: 'Agenda' },
              { path: '/companies', icon: Building2, label: 'Empresas' },
              { path: '/billing', icon: Receipt, label: 'Facturación' },
              { path: '/reports', icon: BarChart3, label: 'Reportes' },
            ].map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: ConnectionStatus + Plan + User */}
          <div className="flex items-center gap-2.5">
            {/* Connection badge (igual al MONOLITO) */}
            <div className="hidden sm:block">
              <ConnectionBadge />
            </div>

            {/* Sync indicator */}
            <div className={`hidden sm:flex items-center gap-1 text-xs ${syncColor}`}>
              {syncIcon}
              <span className="text-gray-500">{syncText}</span>
            </div>

            {/* AI badge */}
            {aiGenerating && (
              <div className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 rounded-lg text-[10px] font-bold">
                <Loader2 className="w-3 h-3 animate-spin" /> {aiGeneratingLabel || 'IA...'}
              </div>
            )}

            {/* Config IA global */}
            <button
              onClick={() => setShowAIConfig(true)}
              className="flex items-center gap-1 px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-[10px] font-bold transition-colors border border-violet-200"
              title="Configurar proveedor de IA"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Config IA</span>
            </button>

            {/* Messages badge */}
            <button onClick={() => setShowMensajesDrawer(true)} className="relative p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Mensajes">
              <MessageCircle className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>

            {/* User info */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-700 leading-tight">{currentUser?.user || 'usuario'}</p>
                <p className="text-[10px] text-gray-500 capitalize">{currentUser?.role || 'Sin rol'}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-[10px] font-black text-emerald-700">{getInitials()}</span>
              </div>
            </div>

            {/* Plan badge (MONOLITO style) */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <Shield className="w-3 h-3" /> {currentUser?.license === 'clinica' ? '🏢 Clínica' : currentUser?.license === 'pro' ? '⭐ Pro' : '🆓 Libre'}
            </div>

            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg" title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══ HORIZONTAL TAB NAVIGATION ═══ */}
      <nav className="bg-white border-b border-gray-100 flex-shrink-0 relative shadow-sm">
        {canScrollLeft && (
          <button onClick={() => scrollTabs(-1)} className="absolute left-0 top-0 bottom-0 z-10 px-1.5 bg-gradient-to-r from-white via-white/95 to-transparent text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div ref={tabsRef} onScroll={checkScroll} className="flex overflow-x-auto scrollbar-hide px-2 gap-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filteredNav.map((item) => {
            const active = isActive(item.path);
            return (
              <button key={item.path} data-active={active} onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 border-b-2 flex-shrink-0 ${
                  active
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <item.icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-600' : ''}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
        {canScrollRight && (
          <button onClick={() => scrollTabs(1)} className="absolute right-0 top-0 bottom-0 z-10 px-1.5 bg-gradient-to-l from-white via-white/95 to-transparent text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white text-gray-800 z-50 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-tr from-emerald-700 to-teal-500 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-gray-800">OCUPASALUD</p>
                  <p className="text-[9px] text-gray-500">{currentUser?.role || 'Pro'}</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="py-3">
              {filteredNav.map((item) => (
                <button key={item.path} onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                    isActive(item.path) ? 'bg-emerald-50 text-emerald-700 font-bold border-l-3 border-emerald-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-emerald-600' : ''}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-100 mt-auto">
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm w-full py-2">
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* AI Config Modal — global, accesible desde cualquier módulo */}
      {showAIConfig && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowAIConfig(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <AIConfigPanel
              aiConfig={aiConfig}
              onSave={(newConfig) => {
                const store = useAIStore.getState();
                if (newConfig.activeProvider) store.setActiveProvider(newConfig.activeProvider);
                if (newConfig.keys) Object.entries(newConfig.keys).forEach(([p, k]) => store.setKey(p, k));
                const userId = useAuthStore.getState().currentUser?.user;
                if (userId) store.saveToD1(userId).catch(() => {});
                setShowAIConfig(false);
              }}
              onClose={() => setShowAIConfig(false)}
            />
          </div>
        </div>
      )}

      <MensajesDrawer isOpen={showMensajesDrawer} onClose={() => setShowMensajesDrawer(false)} />
    </div>
  );
}