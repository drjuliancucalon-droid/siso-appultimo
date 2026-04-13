// src/pages/Users.jsx
// Gestión de usuarios, licencias y perfil médico
import React, { useState, useMemo } from 'react';
import {
  Users as UsersIcon, Plus, Edit3, Trash2, Shield, Key,
  UserCheck, UserX, Settings, CreditCard, Search, X, Save,
  Stethoscope, Lock
} from 'lucide-react';

const ROLES = [
  { id: 'super_admin', label: 'Super Admin', color: 'red' },
  { id: 'administrador', label: 'Administrador', color: 'purple' },
  { id: 'medico', label: 'Médico', color: 'blue' },
  { id: 'secretaria', label: 'Secretaria', color: 'teal' },
  { id: 'admin_empresa', label: 'Admin Empresa', color: 'amber' },
];

const TABS = [
  { id: 'lista', label: 'Usuarios', icon: UsersIcon },
  { id: 'licencias', label: 'Licencias', icon: CreditCard },
  { id: 'perfil', label: 'Perfil Médico', icon: Stethoscope },
];

export default function UsersPage({
  currentUser,
  usersList = [],
  onAddUser,
  onEditUser,
  onDeleteUser,
  onChangeLicense,
  doctorData,
  onDoctorDataChange,
}) {
  const [tab, setTab] = useState('lista');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ user: '', name: '', role: 'medico', pass: '' });

  const filtered = useMemo(() => {
    if (!search.trim()) return usersList;
    const q = search.toLowerCase();
    return usersList.filter(u =>
      (u.user || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [usersList, search]);

  const handleSave = () => {
    if (!form.user.trim() || !form.name.trim()) return;
    if (editing) {
      onEditUser?.({ ...editing, ...form });
    } else {
      if (!form.pass.trim()) return;
      onAddUser?.({ ...form, id: 'usr_' + Date.now() });
    }
    setShowForm(false);
  };

  const renderUsersList = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar usuario..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none shadow-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <UsersIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {filtered.map((u, i) => {
            const roleInfo = ROLES.find(r => r.id === u.role) || { label: u.role, color: 'gray' };
            return (
              <div key={u.id || u.user || i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${roleInfo.color}-100 flex items-center justify-center`}>
                    <Shield className={`w-5 h-5 text-${roleInfo.color}-600`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{u.name || u.user}</p>
                    <p className="text-xs text-gray-500">@{u.user} · <span className={`text-${roleInfo.color}-600 font-medium`}>{roleInfo.label}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.active !== false ? (
                    <span className="text-xs text-green-600 flex items-center gap-1"><UserCheck className="w-3 h-3" />Activo</span>
                  ) : (
                    <span className="text-xs text-red-500 flex items-center gap-1"><UserX className="w-3 h-3" />Inactivo</span>
                  )}
                  <button
                    onClick={() => { setEditing(u); setForm({ user: u.user, name: u.name || '', role: u.role || 'medico', pass: '' }); setShowForm(true); }}
                    className="p-1.5 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4 text-blue-500" />
                  </button>
                  {u.user !== currentUser?.user && (
                    <button onClick={() => onDeleteUser?.(u)} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderLicencias = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-purple-500" />
        Gestión de Licencias
      </h3>
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-purple-800">Plan Actual</p>
              <p className="text-sm text-purple-600">{currentUser?.license || 'libre'}</p>
            </div>
            <button
              onClick={onChangeLicense}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700"
            >
              Cambiar Plan
            </button>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Usuarios activos:</strong> {usersList.filter(u => u.active !== false).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Médicos registrados:</strong> {usersList.filter(u => u.role === 'medico').length}
          </p>
        </div>
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-blue-500" />
        Perfil del Médico
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Datos del profesional que aparecerán en la firma digital de las historias clínicas.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'doctorNombre', label: 'Nombre completo' },
          { key: 'doctorRegistro', label: 'Registro Médico' },
          { key: 'doctorEspecialidad', label: 'Especialidad' },
          { key: 'doctorTelefono', label: 'Teléfono' },
          { key: 'doctorEmail', label: 'Email' },
          { key: 'doctorDireccion', label: 'Dirección consultorio' },
          { key: 'doctorCiudad', label: 'Ciudad' },
          { key: 'licenciaSSOT', label: 'Licencia SST No.' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-gray-600 block mb-1">{f.label}</label>
            <input
              type="text"
              value={doctorData?.[f.key] || ''}
              onChange={e => onDoctorDataChange?.({ ...doctorData, [f.key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <UsersIcon className="w-7 h-7 text-indigo-500" />
            Usuarios y Configuración
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {usersList.length} usuario(s) en el sistema
          </p>
        </div>
        {tab === 'lista' && (
          <button
            onClick={() => { setEditing(null); setForm({ user: '', name: '', role: 'medico', pass: '' }); setShowForm(true); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === 'lista' && renderUsersList()}
      {tab === 'licencias' && renderLicencias()}
      {tab === 'perfil' && renderPerfil()}

      {/* Modal Nuevo/Editar Usuario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">
                {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Usuario *</label>
                <input type="text" value={form.user} onChange={e => setForm(p => ({ ...p, user: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  disabled={!!editing} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nombre completo *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Rol *</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400">
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  {editing ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                </label>
                <input type="password" value={form.pass} onChange={e => setForm(p => ({ ...p, pass: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {editing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
