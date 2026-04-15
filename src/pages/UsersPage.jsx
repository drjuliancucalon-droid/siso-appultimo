// src/pages/UsersPage.jsx — User management with backend data
import React from 'react';
import { UserList } from '../modules/users/components/UserList';
import { useBackendData } from '../hooks/useBackendData';
import { useAuthStore } from '../stores/authStore';
import { Settings, Loader2, Cloud, HardDrive } from 'lucide-react';

export default function UsersPage() {
  const { currentUser } = useAuthStore();
  const { data: users, loading, source } = useBackendData(
    '/data/users', 'siso_users', 'users'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          {!loading && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {users.length} usuarios
            </span>
          )}
        </div>
        {!loading && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {source === 'backend' ? <Cloud className="w-3 h-3 text-emerald-500" /> : <HardDrive className="w-3 h-3" />}
            <span>{source === 'backend' ? 'Supabase' : 'Local'}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-gray-500">Cargando usuarios...</span>
        </div>
      ) : (
        <UserList users={users} currentUser={currentUser} />
      )}
    </div>
  );
}
