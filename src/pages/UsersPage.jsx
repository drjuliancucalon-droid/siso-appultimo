// src/pages/UsersPage.jsx — User management with backend data + UserForm + secretary perms
import React, { useState, useCallback } from 'react';
import { UserList } from '../modules/users/components/UserList';
import { UserForm } from '../modules/users/components/UserForm';
import { useBackendData } from '../hooks/useBackendData';
import { useAuthStore } from '../stores/authStore';
import { Settings, Loader2, Cloud, HardDrive } from 'lucide-react';

const USERS_KEY = 'siso_users';
const loadLocal = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; } };
const saveLocal = (d) => { try { localStorage.setItem(USERS_KEY, JSON.stringify(d)); } catch {} };

export default function UsersPage() {
  const { currentUser } = useAuthStore();
  const { data: usersFromBE, loading, source } = useBackendData('/data/users', USERS_KEY, 'users');

  // Use local copy so we can mutate
  const [users, setUsers] = useState(() => {
    const be = usersFromBE;
    return be.length > 0 ? be : loadLocal();
  });

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Sync with backend data when it loads
  React.useEffect(() => {
    if (!loading && usersFromBE.length > 0) setUsers(usersFromBE);
  }, [loading, usersFromBE]);

  const handleAdd = useCallback(() => {
    setEditingUser(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((user) => {
    setEditingUser(user);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveLocal(updated);
  }, [users]);

  const handleResetPassword = useCallback((user) => {
    alert(`🔐 Se enviará un correo a ${user.email || user.usuario} para restablecer la contraseña.\n\nEn la versión con backend, esto enviará el email real.`);
  }, []);

  const handleSave = useCallback((userData) => {
    let updated;
    if (editingUser?.id) {
      updated = users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u);
    } else {
      updated = [...users, { ...userData, id: userData.id || `usr_${Date.now()}`, activo: true, createdAt: new Date().toISOString() }];
    }
    setUsers(updated);
    saveLocal(updated);
    setShowForm(false);
    setEditingUser(null);
  }, [users, editingUser]);

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

      {showForm && (
        <div className="mb-6">
          <UserForm
            user={editingUser}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingUser(null); }}
            existingUsers={users}
            usersList={users}
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-gray-500">Cargando usuarios...</span>
        </div>
      ) : (
        <UserList
          users={users}
          currentUser={currentUser}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onResetPassword={handleResetPassword}
        />
      )}
    </div>
  );
}
