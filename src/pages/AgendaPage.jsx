// src/pages/AgendaPage.jsx — Agenda con backend data + Sala de espera
import React from 'react';
import { AgendaMain } from '../modules/agenda/components/AgendaMain';
import { useAuthStore } from '../stores/authStore';
import { useBackendData } from '../hooks/useBackendData';
import { Calendar, Loader2, Cloud, HardDrive } from 'lucide-react';

export default function AgendaPage() {
  const { currentUser } = useAuthStore();
  const { data: appointments, loading, source } = useBackendData(
    '/data/agenda', 'siso_agendados', 'appointments'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
          {!loading && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {appointments.length} citas
            </span>
          )}
        </div>
        {!loading && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {source === 'backend' || source === 'supabase-direct' ? <Cloud className="w-3 h-3 text-emerald-500" /> : <HardDrive className="w-3 h-3" />}
            <span>{source === 'local' ? 'Local' : 'Supabase'}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <AgendaMain
          currentUser={currentUser}
          goTo={() => {}}
          patientsList={[]}
          companies={[]}
          appointments={appointments}
          onAddAppointment={(nuevo) => {
            const actuales = JSON.parse(localStorage.getItem('siso_agendados') || '[]');
            const actualizados = [...actuales, nuevo];
            localStorage.setItem('siso_agendados', JSON.stringify(actualizados));
            window.location.reload();
          }}
          onCompleteAppointment={(id) => {
            const actuales = JSON.parse(localStorage.getItem('siso_agendados') || '[]');
            const actualizados = actuales.map(a => 
              a.id === id ? { ...a, estado: 'atendido', completed: true } : a
            );
            localStorage.setItem('siso_agendados', JSON.stringify(actualizados));
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
