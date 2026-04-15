// src/pages/HistoriaGeneralPage.jsx — MINIMAL version to debug #185
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function HistoriaGeneralPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a pacientes
      </button>
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <FileText className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Historia Clínica General</h1>
        <p className="text-gray-500 mb-4">El formulario de HC General está en proceso de integración.</p>
        <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-4 text-left text-sm">
          <p className="font-bold text-teal-800 mb-2">Estado:</p>
          <ul className="text-teal-700 space-y-1">
            <li>✅ Componente GeneralHC.jsx (33 KB) listo</li>
            <li>🔄 Integración con nueva arquitectura — en proceso</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
