// src/pages/EncuestasPage.jsx — SPRINT 6 FASE 4.1: Administrador de encuestas
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { d1Get, d1WriteArrayMerge } from '../lib/d1Client';
import { ClipboardList, Plus, Loader2, Cloud, HardDrive, Trash2, CheckCircle, X } from 'lucide-react';

const SURVEYS_KEY = 'siso_encuestas';

export default function EncuestasPage() {
  const currentUser = useAuthStore.getState().currentUser;
  const userId = currentUser?.user || 'drcucalon';

  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('local');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Nueva encuesta
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [preguntas, setPreguntas] = useState([
    { id: 'p1', texto: '', tipo: 'texto', opciones: [] },
  ]);

  // Cargar encuestas desde D1
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let list = [];
      try {
        const { value: v } = await d1Get(SURVEYS_KEY);
        if (Array.isArray(v) && v.length > 0) { list = v; if (!cancelled) setSource('d1'); }
      } catch {}
      if (list.length === 0 && !cancelled) {
        try { const r = localStorage.getItem(SURVEYS_KEY); if (r) { const p = JSON.parse(r); if (Array.isArray(p)) list = p; } } catch {}
        if (!cancelled) setSource('local');
      }
      if (!cancelled) { setEncuestas(list); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Agregar pregunta
  const addPregunta = () => {
    setPreguntas(prev => [
      ...prev,
      { id: `p${prev.length + 1}`, texto: '', tipo: 'texto', opciones: [] },
    ]);
  };

  // Actualizar campo de pregunta
  const updatePregunta = (idx, field, value) => {
    setPreguntas(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  // Toggle opción múltiple → inicializar opciones si es necesario
  const setTipoPregunta = (idx, tipo) => {
    setPreguntas(prev => prev.map((p, i) => i === idx
      ? { ...p, tipo, opciones: tipo === 'opcion_multiple' ? (p.opciones.length ? p.opciones : ['Opción 1']) : [] }
      : p
    ));
  };

  // Agregar opción a pregunta multiple
  const addOpcion = (idx) => {
    setPreguntas(prev => prev.map((p, i) => i === idx
      ? { ...p, opciones: [...p.opciones, `Opción ${p.opciones.length + 1}`] }
      : p
    ));
  };

  // Actualizar texto de opción
  const updateOpcion = (pIdx, oIdx, value) => {
    setPreguntas(prev => prev.map((p, i) => i === pIdx
      ? { ...p, opciones: p.opciones.map((o, j) => j === oIdx ? value : o) }
      : p
    ));
  };

  // Guardar encuesta
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) { setError('El nombre de la encuesta es obligatorio'); return; }
    const preguntasValidas = preguntas.filter(p => p.texto.trim());
    if (preguntasValidas.length === 0) { setError('Agregue al menos una pregunta'); return; }

    setSaving(true);
    try {
      const encuesta = {
        id: `enc_${Date.now()}`,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        preguntas: preguntasValidas.map(p => ({
          ...p,
          texto: p.texto.trim(),
          opciones: p.tipo === 'opcion_multiple' ? p.opciones.filter(o => o.trim()) : [],
        })),
        creadoPor: userId,
        creadoEn: new Date().toISOString(),
        activo: true,
      };

      await d1WriteArrayMerge(SURVEYS_KEY, [encuesta], 'id');
      setEncuestas(prev => [encuesta, ...prev]);
      setSource('d1');

      // Reset form
      setNombre('');
      setDescripcion('');
      setPreguntas([{ id: 'p1', texto: '', tipo: 'texto', opciones: [] }]);
      setShowForm(false);
    } catch (err) {
      setError('Error al guardar: ' + (err.message || 'desconocido'));
    } finally {
      setSaving(false);
    }
  }, [nombre, descripcion, preguntas, userId]);

  // GAP-ENC01: Cargar respuestas de una encuesta
  const handleViewResponses = useCallback(async (encuesta) => {
    if (selectedSurvey?.id === encuesta.id) {
      setSelectedSurvey(null);
      setResponses([]);
      return;
    }
    setSelectedSurvey(encuesta);
    setLoadingResponses(true);
    try {
      const respKey = `siso_survey_responses_${encuesta.id}`;
      const { value } = await d1Get(respKey);
      if (Array.isArray(value)) {
        setResponses(value);
      } else {
        // Fallback a localStorage
        const local = localStorage.getItem(respKey);
        setResponses(local ? JSON.parse(local) : []);
      }
    } catch {
      const respKey = `siso_survey_responses_${encuesta.id}`;
      const local = localStorage.getItem(respKey);
      setResponses(local ? JSON.parse(local) : []);
    } finally {
      setLoadingResponses(false);
    }
  }, [selectedSurvey]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Encuestas</h1>
          {!loading && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {encuestas.length} creadas
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              {source === 'd1' ? <Cloud className="w-3 h-3 text-emerald-500" /> : <HardDrive className="w-3 h-3" />}
              <span>{source === 'd1' ? 'D1' : 'Local'}</span>
            </div>
          )}
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> {showForm ? 'Cancelar' : 'Nueva Encuesta'}
          </button>
        </div>
      </div>

      {/* Formulario crear encuesta */}
      {showForm && (
        <div className="mb-6 bg-white border border-indigo-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-black text-indigo-800 mb-4">Crear Nueva Encuesta</h3>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs border border-red-100">
              <X className="w-3.5 h-3.5" />{error}
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Nombre *</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm" placeholder="Ej: Satisfacción del servicio" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Descripción</label>
                <input value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm" placeholder="Propósito de la encuesta" />
              </div>
            </div>

            {/* Preguntas */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black text-gray-700 uppercase">Preguntas</h4>
                <button type="button" onClick={addPregunta}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800">
                  <Plus className="w-3 h-3" /> Agregar pregunta
                </button>
              </div>

              <div className="space-y-3">
                {preguntas.map((p, idx) => (
                  <div key={p.id} className="bg-white border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-gray-400 w-6">{idx + 1}.</span>
                      <input value={p.texto} onChange={e => updatePregunta(idx, 'texto', e.target.value)}
                        className="flex-1 p-1.5 border rounded text-xs" placeholder="Texto de la pregunta" />
                      <select value={p.tipo} onChange={e => setTipoPregunta(idx, e.target.value)}
                        className="p-1.5 border rounded text-[10px]">
                        <option value="texto">Texto libre</option>
                        <option value="opcion_multiple">Opción múltiple</option>
                      </select>
                      {preguntas.length > 1 && (
                        <button type="button" onClick={() => setPreguntas(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Opciones para múltiple */}
                    {p.tipo === 'opcion_multiple' && (
                      <div className="ml-8 space-y-1">
                        <p className="text-[9px] text-gray-400 mb-1">Opciones de respuesta:</p>
                        {p.opciones.map((op, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-1">
                            <span className="text-[9px] text-gray-400 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                            <input value={op} onChange={e => updateOpcion(idx, oIdx, e.target.value)}
                              className="flex-1 p-1 border rounded text-[10px]" placeholder={`Opción ${oIdx + 1}`} />
                          </div>
                        ))}
                        <button type="button" onClick={() => addOpcion(idx)}
                          className="text-[9px] text-indigo-500 font-bold hover:text-indigo-700 mt-1">+ Agregar opción</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full p-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? 'Guardando...' : 'Crear Encuesta'}
            </button>
          </form>
        </div>
      )}

      {/* Listado de encuestas */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {encuestas.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>No hay encuestas creadas</p>
            </div>
          ) : (
            encuestas.map(e => (
              <div key={e.id} className="bg-white border rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{e.nombre}</h3>
                    <p className="text-xs text-gray-500 mt-1">{e.descripcion || 'Sin descripción'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.activo !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {e.activo !== false ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-400">
                  <span>{e.preguntas?.length || 0} preguntas</span>
                  <span>Creada: {new Date(e.creadoEn).toLocaleDateString('es-CO')}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <a href={`/encuesta/${e.id}`} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline">
                    🔗 Link público
                  </a>
                  <button onClick={(ev) => { ev.preventDefault(); handleViewResponses(e); }}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 underline">
                    📊 Ver respuestas
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* GAP-ENC01: Panel de respuestas */}
      {selectedSurvey && (
        <div className="mt-6 bg-white border border-emerald-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-gray-800">
                📊 Respuestas: {selectedSurvey.nombre}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {selectedSurvey.descripcion || 'Sin descripción'} · {responses.length} respuesta(s)
              </p>
            </div>
            <button onClick={() => { setSelectedSurvey(null); setResponses([]); }}
              className="text-xs text-gray-400 hover:text-gray-600 font-bold">
              ✕ Cerrar
            </button>
          </div>

          {loadingResponses ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay respuestas recibidas aún</p>
              <p className="text-xs mt-1">Comparte el link público para recibir respuestas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((resp, rIdx) => (
                <div key={resp.id || rIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500">
                      Respuesta #{rIdx + 1}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {resp.fecha ? new Date(resp.fecha).toLocaleString('es-CO') : 'Sin fecha'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedSurvey.preguntas?.map((preg, pIdx) => {
                      const respuesta = resp.respuestas?.[preg.id] || resp[preg.id] || resp[pIdx] || '—';
                      const respuestaStr = typeof respuesta === 'string' ? respuesta : Array.isArray(respuesta) ? respuesta.join(', ') : String(respuesta);
                      return (
                        <div key={pIdx} className="bg-white rounded-lg p-2.5 border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-600 mb-0.5">
                            {pIdx + 1}. {preg.texto}
                          </p>
                          <p className="text-xs text-gray-800">
                            {respuestaStr || 'Sin respuesta'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
