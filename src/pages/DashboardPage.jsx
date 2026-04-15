// src/pages/DashboardPage.jsx — Dashboard with real data from backend
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import {
  Users, Building2, Calendar, FileText, BarChart3,
  Shield, Stethoscope, Activity, AlertTriangle, TrendingUp,
  Cloud, HardDrive
} from 'lucide-react';

const QUICK_ACTIONS = [
  { path: '/hc/new', icon: Stethoscope, label: 'Nueva HC', color: 'from-emerald-600 to-teal-500', desc: 'Historia Clínica' },
  { path: '/patients', icon: Users, label: 'Pacientes', color: 'from-teal-600 to-teal-500', desc: 'Gestionar pacientes' },
  { path: '/agenda', icon: Calendar, label: 'Agenda', color: 'from-indigo-600 to-violet-500', desc: 'Citas y cola' },
  { path: '/companies', icon: Building2, label: 'Empresas', color: 'from-emerald-700 to-emerald-500', desc: 'Gestionar empresas' },
  { path: '/reports', icon: BarChart3, label: 'Reportes', color: 'from-teal-700 to-teal-500', desc: 'Epidemiología' },
  { path: '/sgsst', icon: Shield, label: 'SG-SST', color: 'from-emerald-800 to-emerald-600', desc: 'Gestión SST' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { data: patients, source: patSource } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
  const { data: companies } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const { data: agenda } = useBackendData('/data/agenda', 'siso_agendados', 'appointments');
  const { data: doctor } = useBackendObject('/data/doctor', 'siso_doctor_data', 'doctor');

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7); // YYYY-MM
  const patientsThisMonth = patients.filter(p => (p.fechaExamen || '').startsWith(thisMonth)).length;
  const todayAppointments = agenda.filter(a => (a.fecha || '').startsWith(today)).length;
  const hcCount = patients.filter(p => p.fechaExamen).length;

  const displayName = doctor?.nombre || currentUser?.nombre || currentUser?.user || 'Doctor';

  return (
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
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Acciones Rápidas</h2>
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
    </div>
  );
}
