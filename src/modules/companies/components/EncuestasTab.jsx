// src/modules/companies/components/EncuestasTab.jsx
// Parity total con tab "Encuestas" del monolito ocupasalud
// Lógica extraída de: CompaniesSection.jsx (monolito) + EncuestasPage.jsx (refactorizado)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { d1Get, d1WriteArrayMerge, d1Set } from '../../../lib/d1Client';
import {
  ClipboardList, Plus, Loader2, Trash2, CheckCircle, X,
  Eye, Users, FileText, Calendar, Upload, Copy, RefreshCw,
  Cloud, Download
} from 'lucide-react';

const SURVEYS_KEY = 'siso_encuestas';
const TIPOS_EXAMEN = ['PERIODICO', 'INGRESO', 'EGRESO', 'POST-INCAPACIDAD', 'RETIRO'];

// Genera token corto para el link público
const genToken = (id) => id; // el id ya sirve como token (enc_TIMESTAMP)

export default function EncuestasTab({ companies = [], currentUser }) {
  const userId = currentUser?.user || 'drcucalon';
  const excelRef = useRef(null);

  // ── Encuestas lista ───────────────────────────────────────────────
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // ── Formulario crear ──────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [formEmpresa, setFormEmpresa] = useState('');
  const [formTipo, setFormTipo] = useState('PERIODICO');
  const [formFecha, setFormFecha] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPreguntas, setFormPreguntas] = useState([
    { id: 'p1', texto: '', tipo: 'texto', opciones: [] },
  ]);
  const [formError, setFormError] = useState('');

  // ── Respuestas / importados (expandido por encuesta) ──────────────
  const [expandedId, setExpandedId] = useState(null);
  const [respuestas, setRespuestas] = useState({});   // { encId: [...] }
  const [importados, setImportados] = useState({});   // { encId: [...] }
  const [loadingResps, setLoadingResps] = useState({});

  // ── Cargar encuestas desde D1 ────────────────────────────────────
  const cargarEncuestas = useCallback(async (silente = false) => {
    if (!silente) setLoading(true);
    else setSyncing(true);
    try {
      const { value: v } = await d1Get(SURVEYS_KEY);
      if (Array.isArray(v)) setEncuestas(v);
      else {
        try {
          const raw = localStorage.getItem(SURVEYS_KEY);
          if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) setEncuestas(p); }
        } catch {}
      }
    } catch {
      try {
        const raw = localStorage.getItem(SURVEYS_KEY);
        if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) setEncuestas(p); }
      } catch {}
    } finally {
      if (!silente) setLoading(false);
      else setSyncing(false);
    }
  }, []);

  useEffect(() => { cargarEncuestas(); }, [cargarEncuestas]);

  // ── Guardar en nube ───────────────────────────────────────────────
  const guardarNube = useCallback(async () => {
    setSyncing(true);
    try {
      await d1WriteArrayMerge(SURVEYS_KEY, encuestas, 'id');
      localStorage.setItem(SURVEYS_KEY, JSON.stringify(encuestas));
      alert('✅ Encuestas guardadas en la nube.');
    } catch { alert('Error al guardar.'); }
    finally { setSyncing(false); }
  }, [encuestas]);

  // ── Crear encuesta ────────────────────────────────────────────────
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formNombre.trim()) { setFormError('El nombre es obligatorio'); return; }
    const pvals = formPreguntas.filter(p => p.texto.trim());
    if (pvals.length === 0) { setFormError('Agregue al menos una pregunta'); return; }

    setSaving(true);
    try {
      const empresaObj = companies.find(c =>
        c.nit === formEmpresa || c.id === formEmpresa || c.nombre === formEmpresa
      );
      const enc = {
        id: `enc_${Date.now()}`,
        nombre: formNombre.trim(),
        descripcion: formDesc.trim(),
        empresaId: empresaObj?.nit || empresaObj?.id || formEmpresa,
        empresaNombre: empresaObj?.nombre || '',
        tipoExamen: formTipo,
        fechaLimite: formFecha,
        preguntas: pvals.map(p => ({
          ...p,
          texto: p.texto.trim(),
          opciones: p.tipo === 'opcion_multiple' ? p.opciones.filter(o => o.trim()) : [],
        })),
        creadoPor: userId,
        creadoEn: new Date().toISOString(),
        activo: true,
      };

      const nuevas = [enc, ...encuestas];
      await d1WriteArrayMerge(SURVEYS_KEY, [enc], 'id');
      localStorage.setItem(SURVEYS_KEY, JSON.stringify(nuevas));
      setEncuestas(nuevas);

      // Reset form
      setFormNombre(''); setFormDesc(''); setFormEmpresa('');
      setFormTipo('PERIODICO'); setFormFecha('');
      setFormPreguntas([{ id: 'p1', texto: '', tipo: 'texto', opciones: [] }]);
      setShowForm(false);
    } catch (err) { setFormError('Error: ' + (err.message || 'desconocido')); }
    finally { setSaving(false); }
  }, [formNombre, formDesc, formEmpresa, formTipo, formFecha, formPreguntas, encuestas, companies, userId]);

  // ── Eliminar encuesta ─────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar esta encuesta?')) return;
    const upd = encuestas.filter(e => e.id !== id);
    await d1WriteArrayMerge(SURVEYS_KEY, upd, 'id');
    setEncuestas(upd);
  }, [encuestas]);

  // ── Copiar link ───────────────────────────────────────────────────
  const copiarLink = (enc) => {
    const base = window.location.origin;
    const url = `${base}/encuesta/${genToken(enc.id)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => alert('✅ Link copiado:\n' + url));
    } else {
      alert('Link: ' + url);
    }
  };

  // ── Ver respuestas (carga lazy por encuesta) ──────────────────────
  const verRespuestas = useCallback(async (encId) => {
    if (expandedId === encId) { setExpandedId(null); return; }
    setExpandedId(encId);
    if (respuestas[encId]) return; // ya cargadas
    setLoadingResps(prev => ({ ...prev, [encId]: true }));
    try {
      const { value: v } = await d1Get(`siso_encuesta_resps_${encId}`);
      setRespuestas(prev => ({ ...prev, [encId]: Array.isArray(v) ? v : [] }));
      const { value: vi } = await d1Get(`siso_encuesta_importados_${encId}`);
      setImportados(prev => ({ ...prev, [encId]: Array.isArray(vi) ? vi : [] }));
    } catch {
      setRespuestas(prev => ({ ...prev, [encId]: [] }));
      setImportados(prev => ({ ...prev, [encId]: [] }));
    } finally {
      setLoadingResps(prev => ({ ...prev, [encId]: false }));
    }
  }, [expandedId, respuestas]);

  // ── Importar pacientes desde Excel ───────────────────────────────
  const handleExcelImport = useCallback(async (encId, file) => {
    if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const workers = rows.map((r, i) => ({
        id: `imp_${encId}_${Date.now()}_${i}`,
        nombre: r['Nombre'] || r['nombre'] || r['NOMBRE'] || '',
        documento: r['Documento'] || r['documento'] || r['CC'] || r['cedula'] || '',
        genero: r['Género'] || r['Genero'] || r['genero'] || r['GENERO'] || '',
        cargo: r['Cargo'] || r['cargo'] || r['CARGO'] || '',
        eps: r['EPS'] || r['eps'] || '',
        celular: String(r['Celular'] || r['celular'] || r['Tel'] || ''),
        estado: 'Importado',
      })).filter(w => w.nombre || w.documento);

      if (workers.length === 0) { alert('No se encontraron filas válidas.'); return; }

      const existentes = importados[encId] || [];
      const merged = [...existentes, ...workers];
      await d1WriteArrayMerge(`siso_encuesta_importados_${encId}`, workers, 'id');
      setImportados(prev => ({ ...prev, [encId]: merged }));
      alert(`✅ ${workers.length} trabajadores importados.`);
    } catch (err) {
      alert('Error al leer Excel: ' + (err.message || 'verifique el formato'));
    }
  }, [importados]);

  // ── Agendar todos (marca importados como "Agendado") ─────────────
  const agendarTodos = useCallback(async (encId) => {
    const list = importados[encId] || [];
    if (list.length === 0) { alert('Primero importe trabajadores.'); return; }
    const upd = list.map(w => ({ ...w, estado: 'Agendado' }));
    await d1WriteArrayMerge(`siso_encuesta_importados_${encId}`, upd, 'id');
    setImportados(prev => ({ ...prev, [encId]: upd }));
    alert(`✅ ${upd.length} trabajadores agendados.`);
  }, [importados]);

  // ── Descargar PDF respuestas (HTML imprimible premium) ────────────
  const descargarPDF = useCallback((enc) => {
    const resps = respuestas[enc.id] || [];
    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Encuesta: ${enc.nombre}</title>
<style>
  @page { margin: 1.5cm; size: A4 portrait; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
  .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
  .header h1 { font-size: 20pt; font-weight: 900; color: #4f46e5; margin: 0 0 8px; }
  .header .meta { font-size: 9pt; color: #6b7280; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
  .header .meta span { background: #f3f4f6; padding: 4px 12px; border-radius: 20px; }
  .total { text-align: center; font-size: 24pt; font-weight: 900; color: #059669; margin: 20px 0; }
  .respuesta { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 15px; margin-bottom: 12px; }
  .respuesta .num { font-weight: 900; color: #4f46e5; font-size: 10pt; margin-bottom: 8px; }
  .respuesta .item { padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 10pt; }
  .respuesta .item:last-child { border-bottom: none; }
  .pregunta { font-weight: 700; color: #374151; }
  .valor { color: #6b7280; margin-left: 6px; }
  .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 8pt; color: #9ca3af; }
  @media print { body { padding: 0; } .no-print { display: none; } }
  button { background: #4f46e5; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 11pt; margin: 20px auto; display: block; }
  button:hover { background: #4338ca; }
</style></head>
<body>
  <div class="header">
    <h1>📋 ${enc.nombre}</h1>
    <div class="meta">
      <span>🏢 ${enc.empresaNombre || 'Sin empresa'}</span>
      <span>📌 ${enc.tipoExamen || '—'}</span>
      <span>📅 Límite: ${enc.fechaLimite || '—'}</span>
    </div>
  </div>
  <div class="total">📊 ${resps.length} respuesta(s)</div>
  ${resps.map((r, i) => `
    <div class="respuesta">
      <div class="num">#${i + 1} — ${r.respondidoEn ? new Date(r.respondidoEn).toLocaleString('es-CO') : 'Sin fecha'}</div>
      ${(r.respuestas || []).map(rv => `
        <div class="item">
          <span class="pregunta">${rv.preguntaId || 'Pregunta'}:</span>
          <span class="valor">${rv.respuesta || '—'}</span>
        </div>
      `).join('')}
    </div>
  `).join('')}
  <button class="no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
  <div class="footer">SISO OcupaSalud Pro · Encuesta generada ${new Date().toLocaleDateString('es-CO')} · Res. 1843/2025</div>
  <script>window.onload = () => { setTimeout(() => window.print(), 500); }</script>
</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      // fallback: descargar como .html
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `encuesta_${enc.id}.html`; a.click();
      URL.revokeObjectURL(url);
    }
  }, [respuestas]);

  // ── Helpers pregunta ──────────────────────────────────────────────
  const addPregunta = () => setFormPreguntas(prev => [
    ...prev, { id: `p${prev.length + 1}`, texto: '', tipo: 'texto', opciones: [] }
  ]);
  const updPregunta = (idx, field, val) =>
    setFormPreguntas(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  const setTipo = (idx, tipo) =>
    setFormPreguntas(prev => prev.map((p, i) => i === idx
      ? { ...p, tipo, opciones: tipo === 'opcion_multiple' ? (p.opciones.length ? p.opciones : ['Opción 1']) : [] } : p
    ));
  const addOpcion = (idx) =>
    setFormPreguntas(prev => prev.map((p, i) => i === idx
      ? { ...p, opciones: [...p.opciones, `Opción ${p.opciones.length + 1}`] } : p
    ));
  const updOpcion = (pi, oi, val) =>
    setFormPreguntas(prev => prev.map((p, i) => i === pi
      ? { ...p, opciones: p.opciones.map((o, j) => j === oi ? val : o) } : p
    ));

  // ─── RENDER ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-black text-gray-800">
            Encuestas de Salud Ocupacional
          </h3>
          {!loading && (
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {encuestas.length} creadas
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => cargarEncuestas(true)}
            disabled={syncing}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
            Recargar desde nube
          </button>
          <button
            onClick={guardarNube}
            disabled={syncing}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 disabled:opacity-50"
          >
            <Cloud className="w-3 h-3" />
            Guardar en nube
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? 'Cancelar' : 'Crear Encuesta'}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white border border-indigo-200 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-black text-indigo-800 mb-4">Nueva Encuesta</h4>
          {formError && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs border border-red-100">
              <X className="w-3.5 h-3.5" /> {formError}
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Empresa */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Empresa</label>
                <select
                  value={formEmpresa}
                  onChange={e => setFormEmpresa(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs"
                >
                  <option value="">— Seleccione empresa —</option>
                  {companies.map((c, i) => (
                    <option key={c.nit || c.id || i} value={c.nit || c.id || c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              {/* Tipo examen */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Tipo Examen</label>
                <select
                  value={formTipo}
                  onChange={e => setFormTipo(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs"
                >
                  {TIPOS_EXAMEN.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {/* Fecha límite */}
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Fecha Límite</label>
                <input
                  type="date"
                  value={formFecha}
                  onChange={e => setFormFecha(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Nombre *</label>
                <input
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs"
                  placeholder="Ej: Satisfacción del servicio médico"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Descripción</label>
                <input
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs"
                  placeholder="Propósito de la encuesta"
                />
              </div>
            </div>

            {/* Preguntas */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-[10px] font-black text-gray-700 uppercase">Preguntas</h5>
                <button type="button" onClick={addPregunta}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600">
                  <Plus className="w-3 h-3" /> Agregar pregunta
                </button>
              </div>
              <div className="space-y-2">
                {formPreguntas.map((p, idx) => (
                  <div key={p.id} className="bg-white border rounded-lg p-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black text-gray-400 w-5">{idx + 1}.</span>
                      <input
                        value={p.texto}
                        onChange={e => updPregunta(idx, 'texto', e.target.value)}
                        className="flex-1 p-1.5 border rounded text-[11px]"
                        placeholder="Texto de la pregunta"
                      />
                      <select
                        value={p.tipo}
                        onChange={e => setTipo(idx, e.target.value)}
                        className="p-1.5 border rounded text-[10px]"
                      >
                        <option value="texto">Texto libre</option>
                        <option value="opcion_multiple">Opción múltiple</option>
                      </select>
                      {formPreguntas.length > 1 && (
                        <button type="button"
                          onClick={() => setFormPreguntas(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {p.tipo === 'opcion_multiple' && (
                      <div className="ml-7 space-y-1">
                        {p.opciones.map((op, oi) => (
                          <div key={oi} className="flex items-center gap-1">
                            <span className="text-[9px] text-gray-400 w-4">{String.fromCharCode(65 + oi)}.</span>
                            <input
                              value={op}
                              onChange={e => updOpcion(idx, oi, e.target.value)}
                              className="flex-1 p-1 border rounded text-[10px]"
                            />
                          </div>
                        ))}
                        <button type="button" onClick={() => addOpcion(idx)}
                          className="text-[9px] text-indigo-500 font-bold mt-0.5">+ Agregar opción</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full p-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? 'Guardando...' : '🔗 Crear Encuesta y Generar Link'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de encuestas */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      ) : encuestas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay encuestas creadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {encuestas.map(enc => {
            const numResps = (respuestas[enc.id] || []).length;
            const numImports = (importados[enc.id] || []).length;
            const expanded = expandedId === enc.id;
            const loadingR = loadingResps[enc.id];
            const base = window.location.origin;
            const linkPublico = `${base}/encuesta/${enc.id}`;

            return (
              <div key={enc.id} className="bg-white border border-gray-200 rounded-xl shadow-sm">
                {/* Cabecera tarjeta */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm text-gray-800 truncate">{enc.nombre}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${enc.activo !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {enc.activo !== false ? 'Activa' : 'Inactiva'}
                        </span>
                        {numImports > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-700">
                            Importada
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {enc.empresaNombre && <span className="font-bold text-purple-700">{enc.empresaNombre}</span>}
                        {enc.empresaNombre && ' · '}
                        {enc.tipoExamen && <span>{enc.tipoExamen}</span>}
                        {enc.fechaLimite && <span> · Límite: {enc.fechaLimite}</span>}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {enc.preguntas?.length || 0} preguntas ·
                        Creada: {new Date(enc.creadoEn).toLocaleDateString('es-CO')}
                      </p>
                      {/* Contadores */}
                      {expanded && (
                        <p className="text-[10px] text-indigo-600 font-bold mt-0.5">
                          {numResps} respuesta(s){enc.empresaNombre ? ` de ${enc.empresaNombre}` : ''} · {numImports} importado(s)
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(enc.id)}
                      className="text-red-400 hover:text-red-600 flex-shrink-0 mt-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Botones de acción — 6 botones del monolito */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => copiarLink(enc)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[10px] font-bold hover:bg-indigo-100"
                    >
                      <Copy className="w-3 h-3" /> Copiar Link
                    </button>
                    <button
                      onClick={() => verRespuestas(enc.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold hover:bg-blue-100"
                    >
                      <Eye className="w-3 h-3" />
                      {expanded ? 'Ocultar' : 'Ver Respuestas'}
                    </button>
                    <button
                      onClick={() => {
                        if (!expanded) verRespuestas(enc.id);
                        excelRef.current?.click();
                        // bind to this enc
                        excelRef.current?.setAttribute('data-enc-id', enc.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-[10px] font-bold hover:bg-purple-100"
                    >
                      <Upload className="w-3 h-3" /> Importar Pacientes
                    </button>
                    <button
                      onClick={() => descargarPDF(enc)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-[10px] font-bold hover:bg-gray-100"
                    >
                      <FileText className="w-3 h-3" /> Descargar PDF
                    </button>
                    <button
                      onClick={() => agendarTodos(enc.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-100"
                    >
                      <Calendar className="w-3 h-3" /> Agendar Todos
                    </button>
                    <label className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[10px] font-bold hover:bg-amber-100 cursor-pointer">
                      <Download className="w-3 h-3" /> Cargar Excel
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleExcelImport(enc.id, f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Tabla de respuestas expandida */}
                {expanded && (
                  <div className="border-t border-gray-100 p-4">
                    {loadingR ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {/* Importados */}
                        {numImports > 0 && (
                          <div className="mb-4">
                            <p className="text-[10px] font-black text-amber-700 mb-2">
                              👥 Trabajadores importados ({numImports})
                            </p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-[10px] border-collapse">
                                <thead>
                                  <tr className="bg-amber-50">
                                    {['#', 'Nombre', 'Documento', 'Género', 'Cargo', 'EPS', 'Celular', 'Estado'].map(h => (
                                      <th key={h} className="px-2 py-1.5 text-left font-black text-amber-800 border border-amber-100">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(importados[enc.id] || []).map((w, i) => (
                                    <tr key={w.id || i} className="hover:bg-amber-50/50">
                                      <td className="px-2 py-1 border border-gray-100">{i + 1}</td>
                                      <td className="px-2 py-1 border border-gray-100 font-medium">{w.nombre}</td>
                                      <td className="px-2 py-1 border border-gray-100">{w.documento}</td>
                                      <td className="px-2 py-1 border border-gray-100">{w.genero}</td>
                                      <td className="px-2 py-1 border border-gray-100">{w.cargo}</td>
                                      <td className="px-2 py-1 border border-gray-100">{w.eps}</td>
                                      <td className="px-2 py-1 border border-gray-100">{w.celular}</td>
                                      <td className="px-2 py-1 border border-gray-100">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${w.estado === 'Agendado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                          {w.estado}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Respuestas del link público */}
                        <p className="text-[10px] font-black text-blue-700 mb-2">
                          📋 Respuestas del link público ({numResps})
                        </p>
                        {numResps === 0 ? (
                          <p className="text-[10px] text-gray-400 text-center py-3">Sin respuestas aún — comparte el link con los trabajadores</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-[10px] border-collapse">
                              <thead>
                                <tr className="bg-blue-50">
                                  <th className="px-2 py-1.5 text-left font-black text-blue-800 border border-blue-100">#</th>
                                  <th className="px-2 py-1.5 text-left font-black text-blue-800 border border-blue-100">Fecha</th>
                                  <th className="px-2 py-1.5 text-left font-black text-blue-800 border border-blue-100">Respuestas</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(respuestas[enc.id] || []).map((r, i) => (
                                  <tr key={r.token || i} className="hover:bg-blue-50/30">
                                    <td className="px-2 py-1 border border-gray-100">{i + 1}</td>
                                    <td className="px-2 py-1 border border-gray-100 whitespace-nowrap">
                                      {r.respondidoEn ? new Date(r.respondidoEn).toLocaleString('es-CO') : '—'}
                                    </td>
                                    <td className="px-2 py-1 border border-gray-100">
                                      {(r.respuestas || []).map(rv => (
                                        <span key={rv.preguntaId} className="inline-block mr-2 text-[9px] text-gray-600">
                                          <span className="font-bold">{rv.preguntaId}:</span> {rv.respuesta}
                                        </span>
                                      ))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
