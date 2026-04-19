import React, { useState } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Shield, Key, Crown, Lock, AlertTriangle } from 'lucide-react';
import { PLAN_CONFIG } from '../../../shared/data/planConfig';

const ROLE_EMOJI = {
  super_admin:   '👑',
  administrador: '👨‍💼',
  medico:        '👨‍⚕️',
  secretaria:    '👩‍💻',
  admin_empresa: '🏢',
};

const PLAN_BADGE = {
  clinica: 'bg-purple-100 text-purple-800',
  pro:     'bg-blue-100 text-blue-800',
  starter: 'bg-teal-100 text-teal-800',
  libre:   'bg-gray-100 text-gray-600',
};

/**
 * UserList - Gestión de usuarios del sistema
 */
export const UserList = ({ users = [], currentUser, onEdit, onDelete, onAdd, onResetPassword }) => {
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (u.nombre || u.usuario || u.user || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q);
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

  const isProtected = (u) =>
    u.user === 'drcucalon' || u.usuario === 'drcucalon' || u.role === 'super_admin';

  const getDaysLeft = (u) => {
    if (!u.licenseExpiry && !u.licenciaFin) return null;
    const exp = new Date(u.licenseExpiry || u.licenciaFin);
    if (isNaN(exp.getTime())) return null;
    return Math.ceil((exp - new Date()) / 86400000);
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
        {filtered.map((user) => {
          const daysLeft = getDaysLeft(user);
          const plan = user.license || user.plan || 'libre';
          const protectedUser = isProtected(user);

          return (
            <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:border-purple-200 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                  <span className="text-lg">{ROLE_EMOJI[user.role] || '👤'}</span>
                  {protectedUser && (
                    <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5 border border-white">
                      <Crown className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-gray-800">{user.nombre || user.usuario || user.user}</p>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${PLAN_BADGE[plan]}`}>
                      {PLAN_CONFIG[plan]?.label || plan}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-gray-500">@{user.usuario || user.user}</p>
                    {daysLeft !== null && (
                      <span className={`text-[9px] flex items-center gap-0.5 ${daysLeft < 0 ? 'text-red-500 font-bold' : daysLeft < 30 ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                        {daysLeft < 0 ? (
                          <><AlertTriangle className="w-2.5 h-2.5" /> Vencida</>
                        ) : (
                          `Vence en ${daysLeft} días`
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black px-2 py-1 rounded-full ${roleBadge(user.role)}`}>
                  {user.role}
                </span>
                {user.twoFAEnabled && <Shield className="w-3.5 h-3.5 text-indigo-500" title="2FA activo" />}
                
                {protectedUser ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                    <Lock className="w-3 h-3" />
                    <span className="text-[9px] font-bold">Protegido</span>
                  </div>
                ) : (
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
          );
        })}
      </div>
    </div>
  );
};
