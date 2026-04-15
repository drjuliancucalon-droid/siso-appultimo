// src/app/Layout.jsx — Main layout with sidebar navigation
// Color scheme: emerald/teal gradient (matches ocupasalud original)
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import {
  LayoutDashboard, Users, Building2, Calendar, FileText, 
  Receipt, DollarSign, BarChart3, Shield, Video, 
  CreditCard, LogOut, Menu, X, Brain, ChevronDown,
  Stethoscope, Bell, Settings, Activity
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: null },
  { path: '/patients', icon: Users, label: 'Pacientes', roles: null },
  { path: '/hc/new', icon: Stethoscope, label: 'Historia Clínica', roles: ['medico', 'administrador', 'super_admin'] },
  { path: '/companies', icon: Building2, label: 'Empresas', roles: null },
  { path: '/agenda', icon: Calendar, label: 'Agenda', roles: null },
  { path: '/billing', icon: Receipt, label: 'Facturación', roles: ['administrador', 'super_admin'] },
  { path: '/caja', icon: DollarSign, label: 'Caja', roles: null },
  { path: '/reports', icon: BarChart3, label: 'Reportes', roles: null },
  { path: '/sgsst', icon: Shield, label: 'SG-SST', roles: null },
  { path: '/telemedicine', icon: Video, label: 'Telemedicina', roles: null },
  { path: '/users', icon: Settings, label: 'Usuarios', roles: ['administrador', 'super_admin'] },
  { path: '/planes', icon: CreditCard, label: 'Planes', roles: ['administrador', 'super_admin'] },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentUser?.role);
  });

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Get initials for avatar
  const getInitials = () => {
    const name = currentUser?.nombre || currentUser?.user || '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length > 2 ? 2 : 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase() || 'DR';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-16'} 
        bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white 
        transition-all duration-300 flex-shrink-0
        hidden lg:flex flex-col
      `}>
        {/* Brand */}
        <div className="p-4 border-b border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-700 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <div className="flex flex-col items-center leading-none">
                <Stethoscope className="w-3.5 h-3.5 mb-0.5" strokeWidth={2.5} />
                <span className="text-[8px] font-black tracking-tighter">{getInitials()}</span>
              </div>
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="font-black text-sm truncate tracking-tight">OCUPASALUD</h1>
                <div className="h-0.5 w-8 bg-gradient-to-r from-emerald-400 to-teal-300 my-0.5 rounded-full" />
                <p className="text-[10px] font-bold text-emerald-300 truncate uppercase">Sistema SST Pro</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {filteredNav.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200
                ${isActive(item.path)
                  ? 'bg-emerald-600/40 text-white border-r-3 border-teal-400 font-bold'
                  : 'text-emerald-200/80 hover:bg-emerald-700/40 hover:text-white'
                }
              `}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-teal-300' : ''}`} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sync status indicator */}
        <div className="px-4 py-2 border-t border-emerald-700/50">
          {sidebarOpen && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Activity className="w-3 h-3" />
              <span>v2.0 — Modular</span>
            </div>
          )}
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-emerald-700/50">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black">{getInitials()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{currentUser?.nombre || currentUser?.user || 'Usuario'}</p>
                  <p className="text-[10px] text-emerald-300 truncate capitalize">{currentUser?.role || 'Sin rol'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-emerald-400 hover:text-white p-1 transition-colors" title="Cerrar sesión">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="text-emerald-400 hover:text-white mx-auto block transition-colors" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="p-3 border-t border-emerald-700/50 text-emerald-400 hover:text-white hover:bg-emerald-700/40 transition-colors"
        >
          <Menu className="w-5 h-5 mx-auto" />
        </button>
      </aside>

      {/* ── Mobile menu overlay ─────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-emerald-900 to-teal-900 text-white z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-emerald-700/50">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-300" />
                <h1 className="font-black text-sm">OCUPASALUD</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="py-3">
              {filteredNav.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                    ${isActive(item.path) ? 'bg-emerald-600/40 text-white font-bold' : 'text-emerald-200/80 hover:bg-emerald-700/40'}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-emerald-700/50">
              <button onClick={handleLogout} className="flex items-center gap-2 text-emerald-300 hover:text-white text-sm">
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={() => setMobileMenuOpen(true)} className="text-emerald-700">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            <h1 className="font-black text-sm text-gray-800">OCUPASALUD</h1>
          </div>
          <div className="w-6" />
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
