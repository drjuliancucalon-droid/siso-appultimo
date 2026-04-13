import React, { useState } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Shield, Key } from 'lucide-react';

/**
 * UserList - Gestión de usuarios del sistema
 */
export const UserList = ({ users = [], currentUser, onEdit, onDelete, onAdd, onResetPassword }) => {
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (u.nombre || u.usuario || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q);
  });

  const roleBadge = (role) => {
    const map = {
      administrador: 'bg-purple-100 text-purple-800',
      super_admin: 'bg-red-100 text-red-800',
      medico: 'bg-blue-100 text-blue-800',
      secretaria: 'bg-teal-100 text-teal-800',
      admin_empresa: 'bg-indigo-100 text-indigo-800',
    };
    return map[role] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" /> Usuarios
        </h2>
        <button onClick={onAdd} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar usuario..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none" />
      </div>

      <div className="space-y-2">
        {filtered.map((user) => (
          <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:border-purple-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{user.role === 'administrador' ? '👨‍💼' : user.role === 'medico' ? '👨‍⚕️' : user.role === 'secretaria' ? '👩‍💻' : '👤'}</span>
              </div>
              <div>
                <p className="text-xs font-black text-gray-800">{user.nombre || user.usuario}</p>
                <p className="text-[10px] text-gray-500">@{user.usuario}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black px-2 py-1 rounded-full ${roleBadge(user.role)}`}>
                {user.role}
              </span>
              {user.twoFAEnabled && <Shield className="w-3.5 h-3.5 text-indigo-500" title="2FA activo" />}
              {user.id !== currentUser?.id && (
                <>
                  <button onClick={() => onResetPassword?.(user)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg" title="Resetear contraseña">
                    <Key className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onEdit?.(user)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete?.(user.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
