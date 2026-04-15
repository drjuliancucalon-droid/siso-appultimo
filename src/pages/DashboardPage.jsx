// src/pages/DashboardPage.jsx — Main dashboard
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  Users, Building2, Calendar, FileText, BarChart3,
  Shield, Brain, Stethoscope, TrendingUp, Activity,
  Clock, AlertTriangle
} from 'lucide-react';

const QUICK_ACTIONS = [
  { path: '/hc/new', icon: Stethoscope, label: 'Nueva HC', color: 'bg-blue-500', desc: 'Historia Clínica' },
  { path: '/patients', icon: Users, label: 'Pacientes', color: 'bg-teal-500', desc: 'Gestionar pacientes' },
  { path: '/agenda', icon: Calendar, label: 'Agenda', color: 'bg-purple-500', desc: 'Citas y cola' },
  { path: '/companies', icon: Building2, label: 'Empresas', color: 'bg-orange-500', desc: 'Gestionar empresas' },
  { path: '/reports', icon: BarChart3, label: 'Reportes', color: 'bg-green-500', desc: 'Epidemiología' },
  { path: '/sgsst', icon: Shield, label: 'SG-SST', color: 'bg-red-500', desc: 'Gestión SST' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">
          Bienvenido, {currentUser?.nombre || currentUser?.user || 'Doctor'}
        </h1>
        <p className="text-blue-100 mt-1">
          Sistema Integral de Salud Ocupacional — {new Date().toLocaleDateString('es-CO', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left group"
            >
              <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium text-sm text-gray-800">{action.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Pacientes atendidos', value: '--', sub: 'Este mes', color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Building2, label: 'Empresas activas', value: '--', sub: 'Total', color: 'text-teal-600', bg: 'bg-teal-50' },
          { icon: Calendar, label: 'Citas hoy', value: '--', sub: 'Pendientes', color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: Activity, label: 'HC generadas', value: '--', sub: 'Este mes', color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Versión 2.0 en desarrollo</p>
          <p className="text-xs text-amber-600 mt-1">
            Esta es la nueva versión modular de OcupaSalud Pro. Los datos se conectarán
            al backend cuando esté listo. Las estadísticas se poblarán automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
