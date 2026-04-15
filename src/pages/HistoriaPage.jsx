// src/pages/HistoriaPage.jsx — MINIMAL version to debug #185
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ArrowLeft } from 'lucide-react';

export default function HistoriaPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a pacientes
      </button>
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Stethoscope className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Historia Clínica Ocupacional</h1>
        <p className="text-gray-500 mb-4">El formulario de HC está en proceso de integración con la nueva arquitectura modular.</p>
        <p className="text-sm text-emerald-600">Mientras tanto, puedes acceder a las HC existentes desde la lista de Pacientes.</p>
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left text-sm">
          <p className="font-bold text-emerald-800 mb-2">Funciones disponibles:</p>
          <ul className="text-emerald-700 space-y-1">
            <li>✅ Ver y buscar pacientes (162 registros)</li>
            <li>✅ Ver certificado de aptitud</li>
            <li>✅ Imprimir documentos</li>
            <li>✅ Verificar HC por código</li>
            <li>🔄 Formulario HC completo — en integración</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
