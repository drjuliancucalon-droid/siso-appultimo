// src/pages/SurveyResponsePage.jsx — SPRINT 6 FASE 4.2: Respuesta pública de encuestas
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { d1Get, d1Set } from '../lib/d1Client';
import { ClipboardList, Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';

const SURVEYS_KEY = 'siso_encuestas';

export default function SurveyResponsePage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [encuesta, setEncuesta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respuestas, setRespuestas] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Cargar definición de la encuesta
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { value: encuestas } = await d1Get(SURVEYS_KEY);
        if (Array.isArray(encuestas)) {
          const found = encuestas.find(e => e.id === token);
          if (!cancelled) {
            if (found) setEncuesta(found);
            else setError('Encuesta no encontrada o expirada');
            setLoading(false);
          }
        } else if (!cancelled) {
          setError('No se pudo cargar la encuesta');
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Error de conexión: ' + (err.message || 'desconocido'));
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  // Actualizar respuesta
  const setRespuesta = (preguntaId, value) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: value }));
  };

  // Enviar encuesta
  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    if (!encuesta) return;

    // Validar que todas las preguntas estén respondidas
    const faltantes = encuesta.preguntas.filter(p => !respuestas[p.id]?.trim());
    if (faltantes.length > 0) {
      setError('Responda todas las preguntas antes de enviar');
      return;
    }

    setSending(true);
    setError('');

    const responseToken = `resp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    try {
      const respuesta = {
        token: responseToken,
        encuestaId: encuesta.id,
        encuestaNombre: encuesta.nombre,
        respuestas: Object.entries(respuestas).map(([preguntaId, respuesta]) => ({
          preguntaId,
          respuesta,
        })),
        respondidoEn: new Date().toISOString(),
      };

      await d1Set(`siso_encuesta_resp_${responseToken}`, respuesta);
      setSent(true);
    } catch (err) {
      setError('Error al enviar: ' + (err.message || 'desconocido'));
    } finally {
      setSending(false);
    }
  }, [encuesta, respuestas]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );

  if (error && !encuesta) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-black text-gray-800">Encuesta no disponible</h2>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    </div>
  );

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h2 className="text-lg font-black text-gray-800">¡Respuesta enviada!</h2>
        <p className="text-sm text-gray-500 mt-2">
          Gracias por completar la encuesta <strong>{encuesta.nombre}</strong>.
          Tus respuestas han sido registradas exitosamente.
        </p>
        <p className="text-[10px] text-gray-400 mt-4">
          SISO OcupaSalud — Res. 1843/2025
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-gray-800">{encuesta.nombre}</h1>
          {encuesta.descripcion && (
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{encuesta.descripcion}</p>
          )}
          <p className="text-[10px] text-gray-400 mt-2">{encuesta.preguntas.length} preguntas</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-xs border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-6">
            {encuesta.preguntas.map((p, idx) => (
              <div key={p.id} className="border-b border-gray-100 pb-4 last:border-0">
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  {idx + 1}. {p.texto}
                  <span className="text-red-500 ml-1">*</span>
                </label>

                {p.tipo === 'opcion_multiple' && p.opciones.length > 0 ? (
                  <div className="space-y-2">
                    {p.opciones.map((op, oIdx) => (
                      <label key={oIdx} className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                        <input
                          type="radio"
                          name={p.id}
                          value={op}
                          checked={respuestas[p.id] === op}
                          onChange={() => setRespuesta(p.id, op)}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{op}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={respuestas[p.id] || ''}
                    onChange={e => setRespuesta(p.id, e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                    placeholder="Escriba su respuesta aquí..."
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black text-sm hover:opacity-90 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? 'Enviando...' : 'Enviar Respuestas'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-gray-400 pb-8">
          SISO OcupaSalud Pro · Res. 1843/2025 · Esta encuesta es anónima
        </p>
      </div>
    </div>
  );
}