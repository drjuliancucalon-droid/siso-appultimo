// src/pages/VerificacionPage.jsx — Public HC verification by code
// Sprint 1.3: Anyone can verify an HC by entering the verification code
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Search, Loader2, AlertCircle, CheckCircle, Stethoscope } from 'lucide-react';

const SB_URL = 'https://yqrrktrgoijgzccrxnpz.supabase.co';
const SB_KEY = 'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7';

export default function VerificacionPage() {
  const { codigo: urlCodigo } = useParams();
  const [codigo, setCodigo] = useState(urlCodigo || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const buscar = async () => {
    if (!codigo.trim()) { setError('Ingresa un código de verificación'); return; }
    setLoading(true); setError(''); setResult(null);

    try {
      // Search in portal codes
      const portalKey = `siso_portal_${codigo.trim()}`;
      const res = await fetch(
        `${SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(portalKey)}&select=value`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
      );

      if (res.ok) {
        const rows = await res.json();
        if (rows?.[0]?.value) {
          setResult(rows[0].value);
          setLoading(false);
          return;
        }
      }

      // Also search by doc number prefix
      const docKey = `siso_portal_doc_${codigo.trim()}`;
      const res2 = await fetch(
        `${SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(docKey)}&select=value`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
      );

      if (res2.ok) {
        const rows2 = await res2.json();
        if (rows2?.[0]?.value) {
          setResult(rows2[0].value);
          setLoading(false);
          return;
        }
      }

      setError('No se encontró ninguna historia clínica con ese código.');
    } catch (err) {
      setError('Error al buscar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if URL has code
  React.useEffect(() => {
    if (urlCodigo) buscar();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-700 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-800">Verificación de Historia Clínica</h1>
          <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500 to-teal-400 mx-auto my-2 rounded-full" />
          <p className="text-gray-500 text-sm">Ingresa el código de verificación para consultar la HC</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
              placeholder="Código de verificación o cédula"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
              disabled={loading}
            />
            <button
              onClick={buscar}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold text-sm">Historia Clínica verificada</span>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
                {result.nombres && (
                  <div className="flex justify-between"><span className="text-gray-500">Paciente</span><span className="font-bold">{result.nombres}</span></div>
                )}
                {result.docNumero && (
                  <div className="flex justify-between"><span className="text-gray-500">Documento</span><span className="font-medium">{result.docTipo || 'CC'} {result.docNumero}</span></div>
                )}
                {result.empresaNombre && (
                  <div className="flex justify-between"><span className="text-gray-500">Empresa</span><span className="font-medium">{result.empresaNombre}</span></div>
                )}
                {result.cargo && (
                  <div className="flex justify-between"><span className="text-gray-500">Cargo</span><span className="font-medium">{result.cargo}</span></div>
                )}
                {result.tipoExamen && (
                  <div className="flex justify-between"><span className="text-gray-500">Tipo examen</span><span className="font-medium">{result.tipoExamen}</span></div>
                )}
                {result.fechaExamen && (
                  <div className="flex justify-between"><span className="text-gray-500">Fecha</span><span className="font-medium">{result.fechaExamen}</span></div>
                )}
                {result.conceptoAptitud && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Concepto</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                      result.conceptoAptitud.includes('Apto') && !result.conceptoAptitud.includes('No')
                        ? 'bg-green-100 text-green-700'
                        : result.conceptoAptitud.includes('No apto')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>{result.conceptoAptitud}</span>
                  </div>
                )}
                {result.restricciones && (
                  <div><span className="text-gray-500 block mb-1">Restricciones</span><p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">{result.restricciones}</p></div>
                )}
                {result.recomendaciones && (
                  <div><span className="text-gray-500 block mb-1">Recomendaciones</span><p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">{result.recomendaciones}</p></div>
                )}
                {result.codigoVerificacion && (
                  <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-500">Código</span><span className="font-mono text-xs text-emerald-600">{result.codigoVerificacion}</span></div>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          SISO OcupaSalud Pro — Res. 1843/2025 · Ley 527/1999
        </p>
      </div>
    </div>
  );
}
