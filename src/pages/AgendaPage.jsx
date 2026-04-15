import React from 'react';
import AgendaView from '../modules/agenda/components/AgendaView';
import { Calendar } from 'lucide-react';

export default function AgendaPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
      </div>
      <AgendaView />
    </div>
  );
}
