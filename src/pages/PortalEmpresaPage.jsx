// src/pages/PortalEmpresaPage.jsx — Portal Empresa v2 (paridad monolito PortalPublicoTrabajador)
// FASE 2: Login 3 tipos (código/cc/empresa) + tabs certificados/documentos/estadisticas
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Building2, Loader2, Download, Lock, Search, FileText, BarChart3, Users, Activity, Printer, Shield } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { d1Get } from '../lib/d1Client';

// ── Helpers ──────────────────────────────────────────────────────────────
const colorAptitud = (c = '') => {
  const cl = (c || '').toLowerCase();
  if (cl.includes('no apto')) return { bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-100 text-red-800', border: 'border-l-red-400' };
  if (cl.includes('restricc') || cl.includes('condicion')) return { bg: 'bg-amber-50', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800', border: 'border-l-amber-400' };
  if (cl.includes('apto')) return { bg: 'bg-emerald-50', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800', border: 'border-l-emerald-400' };
  return { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700', border: 'border-l-gray-300' };
};

const formatDate = (d) => { if(!d) return ''; const [y,m,day] = d.split('-'); return `${day}/${m}/${y}`; };

// ── fetchKey helper ──────────────────────────────────────────────────────
const fetchKey = async (key) => {
  try {
    const { value } = await d1Get(key);
    return { ok: true, data: value ?? null };
  } catch (e) {
    return { ok: false, status: 0, text: e?.message || 'error' };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
export default function PortalEmpresaPage() {
  const [searchParams] = useSearchParams();

  // ── Estado login ─────────────────────────────────────────────────────
  const [tipoBusqueda, setTipoBusqueda] = useState('empresa');
  const [busqueda, setBusqueda] = useState('');
  const [codigoPortal, setCodigoPortal] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Estado post-login ─────────────────────────────────────────────────
  const [authenticated, setAuthenticated] = useState(null);    // { nombre, nit }
  const [resultadosEmpresa, setResultadosEmpresa] = useState([]);
  const [empresaAtenciones, setEmpresaAtenciones] = useState(null); // objeto {atenciones, _firma, _doctorData}
  const [resultadoIndividual, setResultadoIndividual] = useState(null); // búsqueda por código/cc
  const [tabActiva, setTabActiva] = useState('certificados'); // certificados|documentos|estadisticas

  const autoLoginRef = useRef(false);

  // ═══ AUTO-LOGIN: detecta ?nit=X&code=Y ═══
  useEffect(() => {
    const nitParam = searchParams.get('nit');
    const codeParam = searchParams.get('code');
    if (nitParam && codeParam && !autoLoginRef.current) {
      autoLoginRef.current = true;
      setTipoBusqueda('empresa');
      setBusqueda(nitParam);
      setCodigoPortal(codeParam);
      setTimeout(() => {
        buscarEmpresa(nitParam, codeParam);
      }, 150);
    }
  }, [searchParams]);

  // ═══ BÚSQUEDA POR EMPRESA ═══
  const buscarEmpresa = async (nitOverride, codeOverride) => {
    const q = (nitOverride || busqueda).trim();
    const cod = (codeOverride || codigoPortal).trim();
    if (!q) { setError('Ingrese el NIT de la empresa'); return; }
    setLoading(true); setError(''); setResultadosEmpresa([]); setEmpresaAtenciones(null); setResultadoIndividual(null);

    const nitClean = q.replace(/[^0-9]/g, '');
    if (!nitClean || nitClean.length < 3) { setError('NIT inválido'); setLoading(false); return; }

    try {
      // 1) Validar código de acceso
      let codigoValido = true;
      let docsKeyFound = false;
      const nitVariants = [nitClean];
      for (let dv = 0; dv <= 9; dv++) nitVariants.push(nitClean + dv);
      if (nitClean.length > 6) nitVariants.push(nitClean.slice(0, -1));

      if (cod) {
        for (const nv of nitVariants) {
          const rd = await fetchKey(`siso_portal_empresa_docs_${nv}`);
          if (rd.ok && rd.data?.codigoAcceso) {
            docsKeyFound = true;
            if (String(rd.data.codigoAcceso).trim().toUpperCase() === cod.toUpperCase()) {
              codigoValido = true;
              break;
            }
          }
        }
        if (docsKeyFound && !codigoValido) {
          setError('🔒 Código de acceso incorrecto.\n\nVerifique el código enviado al correo de la empresa.\nFormato: EMP-XXXX-XXXX');
          setLoading(false);
          return;
        }
      }

      // 2) Cargar atenciones agrupadas (objeto enriquecido)
      const _atMap = new Map();
      let baseAtenciones = null;
      for (const nv of nitVariants) {
        const rAt = await fetchKey(`siso_portal_empresa_atenciones_${nv}`);
        if (rAt.ok && rAt.data && typeof rAt.data === 'object') {
          const obj = rAt.data;
          if (!baseAtenciones) baseAtenciones = obj;
          (obj.atenciones || []).forEach(a => {
            const dn = String(a?.docNumero || '').replace(/\s/g, '').trim();
            if (dn && !_atMap.has(dn)) _atMap.set(dn, a);
          });
        }
      }

      if (_atMap.size > 0 && baseAtenciones) {
        const grupo = { ...baseAtenciones, atenciones: [..._atMap.values()] };
        setEmpresaAtenciones(grupo);
        setResultadosEmpresa(grupo.atenciones);
        setAuthenticated({ nombre: grupo.nombre || baseAtenciones.nombre || 'Empresa', nit: nitClean });
        setLoading(false);
        return;
      }

      setError(`📭 No se encontraron certificados para esta empresa.\n\nSolo aparecen empresas con historias clínicas cerradas.`);
    } catch (e) { setError('Error: ' + (e.message || 'desconocido')); }
    finally { setLoading(false); }
  };

  // ═══ BÚSQUEDA POR CÓDIGO O CÉDULA ═══
  const buscarIndividual = async () => {
    const q = busqueda.trim();
    if (!q) { setError('Ingrese el código de verificación o cédula'); return; }
    setLoading(true); setError(''); setResultadosEmpresa([]); setEmpresaAtenciones(null);

    try {
      let pac = null;
      if (tipoBusqueda === 'codigo') {
        const qUp = q.toUpperCase();
        // Intentar variantes
        const variantes = [
          `siso_portal_${qUp}`,
          !qUp.startsWith('CV-') && !qUp.startsWith('SISO-') ? `siso_portal_CV-${qUp}` : null,
          `siso_portal_${qUp.replace(/-/g, '')}`,
        ].filter(Boolean);

        for (const key of variantes) {
          const r = await fetchKey(key);
          if (r.ok && r.data) { pac = r.data; break; }
        }
      } else {
        // cédula
        const docClean = q.replace(/\s/g, '');
        const r = await fetchKey(`siso_portal_doc_${docClean}`);
        if (r.ok && r.data) pac = r.data;
      }

      if (!pac) {
        setError(tipoBusqueda === 'codigo'
          ? '🔍 Código no encontrado. Formatos: CV-XXXXXXX o SISO-FECHA-ID-HASH. Verifique mayúsculas.'
          : '🔍 Cédula no encontrada. Solo aparecen evaluaciones con historia clínica cerrada.');
      } else {
        setResultadoIndividual(pac);
        setAuthenticated({ nombre: pac.empresaNombre || 'Trabajador', nit: '' });
      }
    } catch (e) { setError('Error: ' + (e.message || 'desconocido')); }
    finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (tipoBusqueda === 'empresa') buscarEmpresa();
    else buscarIndividual();
  };

  // ═══ GENERADOR DE DOCUMENTOS (certificado individual) ═══
  const imprimirDocumento = (res) => {
    const sf = (v) => (v || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
    const doc = res._doctorData || empresaAtenciones?._doctorData || {};
    const firma = res._firma || empresaAtenciones?._firma || '';
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Certificado ${sf(res.nombres)}</title>
<style>@page{size:letter portrait;margin:1.5cm}body{font-family:Arial,sans-serif;color:#111;font-size:10pt;line-height:1.5}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #059669;padding-bottom:10px;margin-bottom:15px}
.header-left{width:32%}.h-name{font-size:10pt;font-weight:900;color:#059669;text-transform:uppercase;margin:0}.h-sub{font-size:7.5pt;color:#555;margin:2px 0}
.header-center{width:34%;text-align:center;border-left:1px solid #ddd;border-right:1px solid #ddd;padding:0 10px}
.header-center h2{font-size:13pt;font-weight:900;color:#059669;margin:2px 0;text-transform:uppercase}
.header-center p{font-size:7pt;color:#888;margin:2px 0}
.header-right{width:32%;text-align:right}.paciente{font-size:10pt;font-weight:900;color:#059669;margin:0;text-transform:uppercase}
.row{display:flex;justify-content:space-between;margin-bottom:8px;padding:8px 12px;background:#f9fafb;border-radius:6px}
.row .label{font-size:8pt;color:#6b7280;text-transform:uppercase;font-weight:700}
.row .value{font-size:9pt;color:#111;font-weight:600}
.concepto{display:inline-block;padding:4px 12px;border-radius:20px;font-size:10pt;font-weight:900;margin:12px 0}
.apto{background:#d1fae5;color:#065f46}.restric{background:#fef3c7;color:#92400e}.noapto{background:#fee2e2;color:#991b1b}
.sig-block{display:flex;justify-content:space-between;margin-top:25mm}
.sig-line{text-align:center;width:42%}.sig-top{border-top:2px solid #222;padding-top:4px;font-size:8pt;font-weight:700}
.footer{text-align:center;font-size:7pt;color:#9ca3af;margin-top:15px;border-top:1px solid #e5e7eb;padding-top:10px}
@media print{body{font-size:9pt}.no-print{display:none!important}}
button{background:#059669;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;margin:15px auto;display:block;font-size:10pt}
</style></head><body>
<div class="header">
  <div class="header-left">
    <p class="h-name">${sf(doc.nombre || 'MÉDICO OCUPACIONAL')}</p>
    <p class="h-sub">${sf(doc.titulo || 'Especialista SST')}</p>
    <p class="h-sub">Lic: ${sf(doc.licencia || '—')}</p>
    <p class="h-sub">${sf(doc.ciudad || '')} · ${sf(doc.email || '')}</p>
  </div>
  <div class="header-center">
    <h2>CERTIFICADO DE APTITUD LABORAL</h2>
    <p>Res. 1843/2025 · Decreto 1072/2015</p>
    <p style="font-weight:700">Fecha: ${sf(formatDate(res.fechaExamen))}</p>
  </div>
  <div class="header-right">
    <p class="paciente">${sf(res.nombres)}</p>
    <p class="h-sub">${sf(res.docTipo || 'CC')}: <b>${sf(res.docNumero)}</b></p>
    <p class="h-sub">Empresa: <b>${sf(res.empresaNombre)}</b></p>
    <p class="h-sub">Cargo: <b>${sf(res.cargo)}</b></p>
  </div>
</div>
<div class="row"><span class="label">Concepto de Aptitud</span><span class="value"><span class="concepto ${(res.conceptoAptitud||'').toLowerCase().includes('no apto')?'noapto':(res.conceptoAptitud||'').toLowerCase().includes('restricc')?'restric':'apto'}">${sf(res.conceptoAptitud || '—')}</span></span></div>
<div class="row"><span class="label">Vigencia</span><span class="value">${sf(res.vigencia || '1 año')}</span></div>
<div class="row"><span class="label">Código Verificación</span><span class="value" style="font-family:monospace;font-size:11pt">${sf(res.codigoVerificacion)}</span></div>
<div class="row"><span class="label">Diagnóstico</span><span class="value">${sf(res.diagnosticoPrincipal || '—')}</span></div>
${res.recomendaciones ? `<div class="row"><span class="label">Recomendaciones</span><span class="value">${sf(res.recomendaciones)}</span></div>` : ''}
<div class="sig-block">
  <div class="sig-line"><div class="sig-top">Firma Paciente / Responsable</div><p style="font-size:7.5pt;color:#6b7280">Nombre: ___________________</p></div>
  <div class="sig-line">${firma ? `<img src="${firma}" style="max-height:55px;max-width:150px;object-fit:contain;display:block;margin:0 auto 4px"/>` : '<div style="height:55px;border-bottom:2px solid #222"></div>'}<p class="sig-top">${sf(doc.nombre || 'MÉDICO OCUPACIONAL')}</p><p style="font-size:7.5pt;color:#555;margin:1px 0">${sf(doc.titulo || '')}</p><p style="font-size:7.5pt;color:#555;margin:1px 0">Lic: ${sf(doc.licencia || '—')}</p></div>
</div>
<div class="footer">SISO OcupaSalud Pro · Certificado generado ${new Date().toLocaleDateString('es-CO')} · Código: ${sf(res.codigoVerificacion)} · Ley 527/1999</div>
<script>setTimeout(()=>window.print(),300)</script>
</body></html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    if (w) { w.document.write(html); w.document.close(); }
  };

  // ── Cálculo de estadísticas ────────────────────────────────────────────
  const stats = {
    total: resultadosEmpresa.length,
    aptos: resultadosEmpresa.filter(a => (a.conceptoAptitud || '').toLowerCase().includes('apto') && !(a.conceptoAptitud || '').toLowerCase().includes('no apto') && !(a.conceptoAptitud || '').toLowerCase().includes('restricc')).length,
    conRestricciones: resultadosEmpresa.filter(a => (a.conceptoAptitud || '').toLowerCase().includes('restricc') || (a.conceptoAptitud || '').toLowerCase().includes('condicion')).length,
    noAptos: resultadosEmpresa.filter(a => (a.conceptoAptitud || '').toLowerCase().includes('no apto')).length,
  };

  // ═══ RENDER: PANTALLA DE LOGIN ═══
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin"/></div>;

  if (!resultadosEmpresa.length && !resultadoIndividual) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-black text-gray-800">Portal Empresa</h2>
          <p className="text-xs text-gray-500">Acceda a las evaluaciones de sus trabajadores</p>
        </div>

        {/* Tabs de tipo de búsqueda */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[
            { id: 'empresa', label: '🏢 Empresa' },
            { id: 'codigo', label: '🔢 Código' },
            { id: 'cedula', label: '🪪 Cédula' },
          ].map(t => (
            <button key={t.id}
              onClick={() => { setTipoBusqueda(t.id); setError(''); setBusqueda(''); setCodigoPortal(''); }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition ${tipoBusqueda === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">{error}</div>}

        {tipoBusqueda === 'empresa' && (
          <>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">NIT de la Empresa</label>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Ej: 900123456" className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none" autoFocus />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Contraseña de Acceso</label>
              <input type="password" value={codigoPortal} onChange={e => setCodigoPortal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="EMP-XXXX-XXXX" className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
            </div>
          </>
        )}

        {(tipoBusqueda === 'codigo' || tipoBusqueda === 'cedula') && (
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">
              {tipoBusqueda === 'codigo' ? 'Código de Verificación' : 'Número de Cédula'}
            </label>
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={tipoBusqueda === 'codigo' ? 'Ej: CV-ABC123 o SISO-20260401-ID-HASH' : 'Ej: 1234567890'}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none" autoFocus />
          </div>
        )}

        <button onClick={handleSearch} disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-sm rounded-xl hover:from-indigo-700 hover:to-blue-700 shadow-lg transition">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : <><Search className="w-4 h-4 inline mr-1"/> Buscar</>}
        </button>
      </div>
    </div>
  );

  // ═══ RENDER: VISTA INDIVIDUAL (código/cc) ═══
  if (resultadoIndividual) {
    const r = resultadoIndividual;
    const c = colorAptitud(r.conceptoAptitud);
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" /> Certificado Individual
          </h1>
          <button onClick={() => { setResultadoIndividual(null); setAuthenticated(null); setBusqueda(''); }}
            className="text-xs text-gray-500 hover:text-gray-700 font-bold">← Nueva búsqueda</button>
        </div>
        <div className={`bg-white rounded-2xl shadow-sm border p-6 ${c.border} border-l-4`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-black text-gray-800">{r.nombres}</h2>
              <p className="text-sm text-gray-500">{r.docTipo || 'CC'}: {r.docNumero} · {r.empresaNombre}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${c.badge}`}>{r.conceptoAptitud || '—'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {r.cargo && <p><b>Cargo:</b> {r.cargo}</p>}
            {r.tipoExamen && <p><b>Tipo:</b> {r.tipoExamen}</p>}
            {r.fechaExamen && <p><b>Fecha:</b> {formatDate(r.fechaExamen)}</p>}
            {r.codigoVerificacion && <p><b>Código:</b> <span className="font-mono text-indigo-600">{r.codigoVerificacion}</span></p>}
            {r.vigencia && <p><b>Vigencia:</b> {r.vigencia}</p>}
          </div>
          <button onClick={() => imprimirDocumento(r)}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700">
            <Printer className="w-4 h-4" /> Imprimir Certificado
          </button>
        </div>
      </div>
    );
  }

  // ═══ RENDER: VISTA EMPRESA (tabs) ═══
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{authenticated?.nombre || 'Empresa'}</h1>
            <p className="text-xs text-gray-500">NIT: {authenticated?.nit} · {resultadosEmpresa.length} trabajadores evaluados</p>
          </div>
        </div>
        <button onClick={() => { setResultadosEmpresa([]); setEmpresaAtenciones(null); setAuthenticated(null); setBusqueda(''); setCodigoPortal(''); }}
          className="text-xs text-gray-500 hover:text-gray-700 font-bold">← Cerrar sesión</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', val: stats.total, color: 'blue' },
          { label: 'Aptos', val: stats.aptos, color: 'emerald' },
          { label: 'Con Restricciones', val: stats.conRestricciones, color: 'amber' },
          { label: 'No Aptos', val: stats.noAptos, color: 'red' },
        ].map(({ label, val, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-3 text-center`}>
            <p className={`text-[9px] font-black text-${color}-700 uppercase mb-1`}>{label}</p>
            <p className={`text-2xl font-black text-${color}-800`}>{val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-xl p-1">
        {[
          { id: 'certificados', label: '📄 Certificados', icon: FileText },
          { id: 'documentos', label: '📁 Documentos', icon: Download },
          { id: 'estadisticas', label: '📊 Estadísticas', icon: BarChart3 },
        ].map(t => (
          <button key={t.id} onClick={() => setTabActiva(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-lg transition ${tabActiva === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* TAB: CERTIFICADOS */}
      {tabActiva === 'certificados' && (
        <div className="space-y-3">
          {resultadosEmpresa.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No hay certificados disponibles</p>
              <p className="text-xs mt-1">Las historias clínicas cerradas aparecerán aquí automáticamente</p>
            </div>
          ) : (
            resultadosEmpresa.map((a, i) => {
              const c = colorAptitud(a.conceptoAptitud);
              return (
                <div key={i} className={`bg-white rounded-xl shadow-sm border p-4 ${c.border} border-l-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-sm text-gray-800">{a.nombres}</p>
                      <p className="text-[10px] text-gray-500">{a.docNumero} · {a.cargo || '—'} · {a.tipoExamen}</p>
                      <p className="text-[10px] text-gray-400">Fecha: {formatDate(a.fechaExamen)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${c.badge}`}>{a.conceptoAptitud || '—'}</span>
                      <button onClick={() => imprimirDocumento(a)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700">
                        <Printer size={12} /> Imprimir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: DOCUMENTOS */}
      {tabActiva === 'documentos' && (
        <div className="space-y-3">
          <p className="text-[10px] text-gray-400 mb-2">Documentos disponibles para esta empresa (cuentas de cobro, custodia, informes)</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-black text-amber-800 mb-1">📌 Información</p>
            <p className="text-[10px] text-amber-700">
              Los documentos (cuentas de cobro, cartas de custodia e informes sociodemográficos) se generan desde el módulo de empresas y el portal de certificados.
              Consulte con su médico ocupacional para la emisión de documentos.
            </p>
          </div>
        </div>
      )}

      {/* TAB: ESTADÍSTICAS */}
      {tabActiva === 'estadisticas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><Activity size={16} className="text-indigo-600"/> Distribución por Tipo</h3>
              {(() => {
                const tipos = {};
                resultadosEmpresa.forEach(a => { const t = a.tipoExamen || '—'; tipos[t] = (tipos[t] || 0) + 1; });
                return Object.entries(tipos).sort((a,b) => b[1]-a[1]).map(([t,c]) => (
                  <div key={t} className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">{t}</span>
                    <span className="text-xs font-black text-indigo-600">{c}</span>
                  </div>
                ));
              })()}
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><Users size={16} className="text-emerald-600"/> Por Período</h3>
              {(() => {
                const periodos = {};
                resultadosEmpresa.forEach(a => { const p = (a.fechaExamen || '').slice(0,7) || '—'; periodos[p] = (periodos[p] || 0) + 1; });
                return Object.entries(periodos).sort((a,b) => b[0].localeCompare(a[0])).slice(0,10).map(([p,c]) => (
                  <div key={p} className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">{p}</span>
                    <span className="text-xs font-black text-emerald-600">{c}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}