// src/pages/TelemedicinePage.jsx
// Secretary gate + tabs: VideoConsult + ProfesiogramaAI
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoConsult } from '../modules/telemedicine/components/VideoConsult';
import { ProfesiogramaAI } from '../modules/telemedicine/components/ProfesiogramaAI';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { Video, Brain } from 'lucide-react';

const TABS = [
  { id: 'video', label: 'Videoconsulta', icon: Video },
  { id: 'profesiograma', label: 'Profesiograma IA', icon: Brain },
];

export default function TelemedicinePage() {
  const navigate = useNavigate();
  const { currentUser, canAccessModule } = useAuthStore();
  const aiConfig = useAIStore((s) => ({
    activeProvider: s.activeProvider,
    keys: s.keys || {},
  }));
  const [activeTab, setActiveTab] = useState('video');

  // ── SECRETARIA GATE ──
  if (currentUser?.role === 'secretaria' && !canAccessModule('telemedicina')) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 space-y-3">
          <div className="text-5xl">🔐</div>
          <p className="font-black text-amber-800 text-xl">Módulo restringido</p>
          <p className="text-amber-700 text-sm font-bold">Telemedicina</p>
          <p className="text-amber-600 text-xs leading-relaxed">
            Este módulo requiere autorización explícita del administrador.
            <br />
            Solicita que habilite el permiso <strong>"Telemedicina"</strong> en tu perfil.
            <br />
            (Usuarios → tu nombre → 🔐 Permisos de secretaria)
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-3 bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition"
          >
            ← Volver al panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Tab nav */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${
                isActive
                  ? 'text-blue-700 border-blue-600 bg-blue-50'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'video' && <VideoConsult currentUser={currentUser} />}
      {activeTab === 'profesiograma' && <ProfesiogramaAI aiConfig={aiConfig} />}
    </div>
  );
}
