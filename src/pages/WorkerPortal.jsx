// src/pages/WorkerPortal.jsx
// Portal del Trabajador — Verificación de resultados HC
import React, { useState } from 'react';
import {
  UserCheck, Search, FileText, Shield, AlertCircle,
  CheckCircle2, Key, Eye, Printer
} from 'lucide-react';

export default function WorkerPortal({
  patientsList = [],
  atencionesCerradas = [],
}) {
  const [code, setCode] = useState('');
  const [doc, setDoc] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    setError('');
    setResult(null);

    if (!code.trim() && !doc.trim()) {
      setError('Ingrese el código de verificación o número de documento.');
      return;
    }

    setSearching(true);

    // Simulate search delay
    setTimeout(() => {
      let found = null;

      if (code.trim()) {
        found = patientsList.find(p => p.codigoVerificacion === code.trim());
      }
      if (!found && doc.trim()) {
        // Search in closed records
        found = atencionesCerradas.find(a => a.docNumero === doc.trim());
        if (!found) {
          found = patientsList.find(p => p.docNumero === doc.trim() && p.estadoHistoria === 'Cerrada');
        }
      }

      if (found) {
        setResult(found);
      } else {
        setError('No se encontraron resultados. Verifique el código o documento ingresado.');
      }
      setSearching(false);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg text-center">
        <UserCheck className="w-10 h-10 mx-auto mb-2" />
        <h1 className="text-2xl font-black">Portal del Trabajador</h1>
        <p className="text-teal-100 mt-1 text-sm">
          Verifique los resultados de su examen médico ocupacional
        </p>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-lg mx-auto">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-teal-500" />
          Verificar Resultados
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Código de verificación</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Ej: VER-2026-XXXX"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-400 text-center font-mono text-lg tracking-wider"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400 font-medium">o</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Número de documento</label>
            <input
              type="text"
              value={doc}
              onChange={e => setDoc(e.target.value)}
              placeholder="Número de cédula"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-400 text-center"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={searching}
            className="w-full py-3 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Consultar
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-lg mx-auto animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-black text-gray-800">Resultado Encontrado</h3>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="font-bold text-gray-800 text-sm">{result.nombres} {result.apellidos || ''}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Documento</p>
                <p className="font-bold text-gray-800 text-sm">{result.docTipo} {result.docNumero}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Fecha Examen</p>
                <p className="font-bold text-gray-800 text-sm">{result.fechaExamen || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Tipo</p>
                <p className="font-bold text-gray-800 text-sm">{result.tipoExamen || result.type || 'N/A'}</p>
              </div>
            </div>

            {result.conceptoAptitud && (
              <div className={`p-4 rounded-xl border ${
                result.conceptoAptitud?.includes('APTO') && !result.conceptoAptitud?.includes('NO')
                  ? 'bg-green-50 border-green-200'
                  : result.conceptoAptitud?.includes('NO APTO')
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className="text-xs text-gray-600 mb-1">Concepto de Aptitud</p>
                <p className="text-lg font-black">{result.conceptoAptitud}</p>
              </div>
            )}

            {result.restricciones && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-600 font-semibold mb-1">⚠️ Restricciones / Recomendaciones</p>
                <p className="text-sm text-amber-800">{result.restricciones}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Shield className="w-4 h-4 text-teal-500" />
              <p className="text-xs text-gray-500">
                Documento verificado digitalmente. Estado: <strong>{result.estadoHistoria || 'Cerrada'}</strong>
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2 print-visible"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center max-w-lg mx-auto">
        <p className="text-xs text-blue-700">
          <strong>🔒 Privacidad:</strong> Este portal cumple con la Ley 1581 de 2012 (Habeas Data).
          Solo se muestran datos del concepto de aptitud, no la historia clínica completa.
        </p>
      </div>
    </div>
  );
}
