import React from 'react';
import UserList from '../modules/users/components/UserList';
import { Settings } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-800">Usuarios y Configuración</h1>
      </div>
      <UserList />
    </div>
  );
}
