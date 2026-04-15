// src/pages/UsersPage.jsx — User management page
import React, { useState, useEffect } from 'react';
import { UserList } from '../modules/users/components/UserList';
import { useAuthStore } from '../stores/authStore';
import { Settings } from 'lucide-react';

const USERS_KEY = 'siso_users';

function loadFromStorage(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
  catch { return fallback; }
}

function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function UsersPage() {
  const { currentUser } = useAuthStore();
  const [users, setUsers] = useState(() => loadFromStorage(USERS_KEY));

  useEffect(() => {
    saveToStorage(USERS_KEY, users);
  }, [users]);

  const handleDelete = (user) => {
    if (window.confirm(`¿Eliminar usuario "${user.nombre || user.user}"?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-800">Usuarios y Configuración</h1>
      </div>
      <UserList
        users={users}
        currentUser={currentUser}
        onDelete={handleDelete}
      />
    </div>
  );
}
