// src/app/Layout.jsx — Main layout with sidebar navigation
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import {
  LayoutDashboard, Users, Building2, Calendar, FileText, 
  Receipt, DollarSign, BarChart3, Shield, Video, 
  CreditCard, LogOut, Menu, X, Brain, ChevronDown,
  Stethoscope, Bell, Settings
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
  const { currentUser, logout, isAdmin } = useAuthStore();
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

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-16'} 
        bg-gradient-to-b from-blue-900 to-blue-800 text-white 
        transition-all duration-300 flex-shrink-0
        hidden lg:flex flex-col
      `}>
        {/* Brand */}
        <div className="p-4 border-b border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm truncate">OcupaSalud Pro</h1>
                <p className="text-xs text-blue-300 truncate">Sistema SST</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredNav.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                ${isActive(item.path)
                  ? 'bg-blue-700/50 text-white border-r-2 border-white'
                  : 'text-blue-200 hover:bg-blue-700/30 hover:text-white'
                }
              `}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-blue-700/50">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.nombre || currentUser?.user || 'Usuario'}</p>
                <p className="text-xs text-blue-300 truncate capitalize">{currentUser?.role || 'Sin rol'}</p>
              </div>
              <button onClick={handleLogout} className="text-blue-300 hover:text-white p-1" title="Cerrar sesión">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="text-blue-300 hover:text-white mx-auto block" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="p-3 border-t border-blue-700/50 text-blue-300 hover:text-white hover:bg-blue-700/30 transition-colors"
        >
          <Menu className="w-5 h-5 mx-auto" />
        </button>
      </aside>

      {/* ── Mobile menu overlay ─────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-blue-900 text-white z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-blue-700/50">
              <h1 className="font-bold">OcupaSalud Pro</h1>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="py-4">
              {filteredNav.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                    ${isActive(item.path) ? 'bg-blue-700/50 text-white' : 'text-blue-200 hover:bg-blue-700/30'}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-blue-700/50">
              <button onClick={handleLogout} className="flex items-center gap-2 text-blue-300 hover:text-white text-sm">
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="font-semibold text-gray-800">OcupaSalud Pro</h1>
          <div className="w-6" /> {/* spacer */}
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
