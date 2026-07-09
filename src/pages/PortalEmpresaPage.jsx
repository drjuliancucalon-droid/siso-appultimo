// src/pages/PortalEmpresaPage.jsx — Portal Empresa v3 (paridad monolito PortalPublicoTrabajador)
// FASE 2A: Certificados premium + FASE 2B: Documentos D1 + FASE 2C: Estadísticas enriquecidas
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Building2, Loader2, Download, Search, FileText, BarChart3, Users, Activity, Printer, Shield, TrendingUp, CheckSquare, Square } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { d1Get } from '../lib/d1Client';
import { _generarCertificadoHTMLNormalizado, _generarQRDataUrl } from '../shared/lib/printUtils';
import { _openPrintRecetaDeriv, _mkPrintHeaderMod } from '../lib/printService';

// ── Helpers ──────────────────────────────────────────────────────────────
const colorAptitud = (c = '') => {
  const cl = (c || '').toLowerCase();
  if (cl.includes('no apto')) return { bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-100 text-red-800', border: 'border-l-red-400' };
  if (cl.includes('restricc') || cl.includes('condicion')) return { bg: 'bg-amber-50', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800', border: 'border-l-amber-400' };
  if (cl.includes('apto')) return { bg: 'bg-emerald-50', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800', border: 'border-l-emerald-400' };
  return { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700', border: 'border-l-gray-300' };
};

const formatDate = (d) => { if(!d) return ''; const [y,m,day] = d.split('-'); return `${day}/${m}/${y}`; };

const fetchKey = async (key) => {
  try { const { value } = await d1Get(key); return { ok: true, data: value ?? null }; }
  catch (e) { return { ok: false, status: 0, text: e?.message || 'error' }; }
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
  const [authenticated, setAuthenticated] = useState(null);
  const [resultadosEmpresa, setResultadosEmpresa] = useState([]);
  const [empresaAtenciones, setEmpresaAtenciones] = useState(null);
  const [resultadoIndividual, setResultadoIndividual] = useState(null);
  const [tabActiva, setTabActiva] = useState('certificados');

  // ── Certificados: selección + filtro fecha ────────────────────────────
  const [certSeleccionados, setCertSeleccionados] = useState({});
  const [fechaFiltro, setFechaFiltro] = useState('');

  // ── Documentos: datos D1 ─────────────────────────────────────────────
  const [docsCuentas, setDocsCuentas] = useState([]);
  const [docsCustodia, setDocsCustodia] = useState([]);
  const [docsInformes, setDocsInformes] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const autoLoginRef = useRef(false);

  // ═══ AUTO-LOGIN ═══
  useEffect(() => {
    const nitParam = searchParams.get('nit');
    const codeParam = searchParams.get('code');
    if (nitParam && codeParam && !autoLoginRef.current) {
      autoLoginRef.current = true;
      setTipoBusqueda('empresa');
      setBusqueda(nitParam);
      setCodigoPortal(codeParam);
      setTimeout(() => buscarEmpresa(nitParam, codeParam), 150);
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
      let codigoValido = true; let docsKeyFound = false;
      const nitVariants = [nitClean];
      for (let dv = 0; dv <= 9; dv++) nitVariants.push(nitClean + dv);
      if (nitClean.length > 6) nitVariants.push(nitClean.slice(0, -1));

      if (cod) {
        for (const nv of nitVariants) {
          const rd = await fetchKey(`siso_portal_empresa_docs_${nv}`);
          if (rd.ok && rd.data?.codigoAcceso) {
            docsKeyFound = true;
            if (String(rd.data.codigoAcceso).trim().toUpperCase() === cod.toUpperCase()) { codigoValido = true; break; }
          }
        }
        if (docsKeyFound && !codigoValido) {
          setError('🔒 Código de acceso incorrecto.\n\nVerifique el código enviado al correo de la empresa.\nFormato: EMP-XXXX-XXXX');
          setLoading(false); return;
        }
      }

      const _atMap = new Map(); let baseAtenciones = null;
      for (const nv of nitVariants) {
        const rAt = await fetchKey(`siso_portal_empresa_atenciones_${nv}`);
        if (rAt.ok && rAt.data && typeof rAt.data === 'object') {
          if (!baseAtenciones) baseAtenciones = rAt.data;
          (rAt.data.atenciones || []).forEach(a => {
            const dn = String(a?.docNumero || '').replace(/\s/g, '').trim();
            if (dn && !_atMap.has(dn)) _atMap.set(dn, a);
          });
        }
      }

      if (_atMap.size > 0 && baseAtenciones) {
        const grupo = { ...baseAtenciones, atenciones: [..._atMap.values()] };
        setEmpresaAtenciones(grupo);
        setResultadosEmpresa(grupo.atenciones);
        setAuthenticated({ nombre: grupo.nombre || 'Empresa', nit: nitClean });
        setCertSeleccionados({});
        // Cargar documentos
        cargarDocumentos(nitClean);
        setLoading(false); return;
      }
      setError(`📭 No se encontraron certificados para esta empresa.`);
    } catch (e) { setError('Error: ' + (e.message || 'desconocido')); }
    finally { setLoading(false); }
  };

  // ═══ CARGAR DOCUMENTOS (cuentas, custodia, informes) ═══
  const cargarDocumentos = async (nitClean) => {
    setDocsLoading(true);
    const userId = (() => { try { const s = JSON.parse(localStorage.getItem('siso-auth') || '{}'); return s?.state?.currentUser?.user || 'drcucalon'; } catch { return 'drcucalon'; } })();

    try {
      // Cuentas de cobro — leer siso_saved_bills (igual que el monolito)
      const billsKey = `siso_saved_bills_${userId}`;
      let cuentas = [];
      try {
        const { value: billsRaw } = await d1Get(billsKey);
        const bills = Array.isArray(billsRaw) ? billsRaw : [];
        // También leer caja_movs por si hay auto-billing
        const { value: cajaRaw } = await d1Get(`siso_caja_movs_${userId}`);
        const cajaMovs = Array.isArray(cajaRaw) ? cajaRaw : [];
        // Unir ambas fuentes y filtrar por NIT de empresa
        const todas = [...bills, ...cajaMovs];
        cuentas = todas
          .filter(m => {
            const idMatch = (m.empresaClienteId || '').replace(/[^0-9]/g, '') === nitClean;
            const nombreMatch = (m.empresaClienteNombre || '').toLowerCase().includes(nitClean);
            return idMatch || !idMatch && nombreMatch;
          })
          .slice(0, 30);
      } catch (_) {}
      setDocsCuentas(cuentas);

      // Cartas de custodia
      let custodias = [];
      try {
        const custKey = `siso_cartas_custodia_${userId}`;
        const { value: custRaw } = await d1Get(custKey);
        custodias = Array.isArray(custRaw) ? custRaw.filter(c => {
          const nitC = (c.empresaNit || c.nit || '').replace(/[^0-9]/g, '');
          return nitC === nitClean || nitC.includes(nitClean) || nitClean.includes(nitC);
        }) : [];
      } catch (_) {}
      setDocsCustodia(custodias);

      // Informes sociodemográficos — desde siso_portal_empresa_docs_{nit} (como monolito)
      let informes = [];
      try {
        const { value: docsRaw } = await d1Get(`siso_portal_empresa_docs_${nitClean}`);
        const docs = Array.isArray(docsRaw) ? docsRaw : [];
        // Filtrar solo los que son informes
        informes = docs.filter(d => d.tipo === 'informe' || d.informe || !d.custodia);
      } catch (_) {}
      setDocsInformes(informes);
    } catch (_) {}
    finally { setDocsLoading(false); }
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
        const variantes = [`siso_portal_${qUp}`, !qUp.startsWith('CV-') && !qUp.startsWith('SISO-') ? `siso_portal_CV-${qUp}` : null, `siso_portal_${qUp.replace(/-/g, '')}`].filter(Boolean);
        for (const key of variantes) { const r = await fetchKey(key); if (r.ok && r.data) { pac = r.data; break; } }
      } else {
        const r = await fetchKey(`siso_portal_doc_${q.replace(/\s/g, '')}`);
        if (r.ok && r.data) pac = r.data;
      }
      if (!pac) setError(tipoBusqueda === 'codigo' ? '🔍 Código no encontrado.' : '🔍 Cédula no encontrada.');
      else setResultadoIndividual(pac);
    } catch (e) { setError('Error: ' + (e.message || 'desconocido')); }
    finally { setLoading(false); }
  };

  const handleSearch = () => tipoBusqueda === 'empresa' ? buscarEmpresa() : buscarIndividual();

  // ═══ CALCULOS ═══
  const fechasUnicas = useMemo(() => [...new Set(resultadosEmpresa.map(a => a.fechaExamen))].filter(Boolean).sort().reverse(), [resultadosEmpresa]);
  const atencionesVisibles = fechaFiltro ? resultadosEmpresa.filter(a => a.fechaExamen === fechaFiltro) : resultadosEmpresa;

  const stats = {
    total: resultadosEmpresa.length,
    aptos: resultadosEmpresa.filter(a => (a.conceptoAptitud || '').toLowerCase().includes('apto') && !(a.conceptoAptitud || '').toLowerCase().includes('no apto') && !(a.conceptoAptitud || '').toLowerCase().includes('restricc')).length,
    conRestricciones: resultadosEmpresa.filter(a => (a.conceptoAptitud || '').toLowerCase().includes('restricc') || (a.conceptoAptitud || '').toLowerCase().includes('condicion')).length,
    noAptos: resultadosEmpresa.filter(a => (a.conceptoAptitud || '').toLowerCase().includes('no apto')).length,
  };

  // ═══ GENERADOR DE CERTIFICADO HTML (P2+P3: wrapper de _generarCertificadoHTMLNormalizado + QR) ═══
  const generarCertHTML = async (res) => {
    // Mapear portalData como el monolito _generarCertificadoDesdePortal (L13832-13863)
    const mappedData = {
      nombres: res.nombres || '',
      docTipo: res.docTipo || 'CC',
      docNumero: res.docNumero || '',
      edad: res.edad || '',
      cargo: res.cargo || '',
      empresaNombre: res.empresaNombre || 'PARTICULAR',
      empresaNit: res.empresaNit || '',
      tipoExamen: res.tipoExamen || '',
      enfasisExamen: res.enfasisExamen || 'GENERAL',
      fechaExamen: res.fechaExamen || '',
      conceptoAptitud: res.conceptoAptitud || '',
      restricciones: res.restricciones || res.analisisRestricciones || '',
      analisisRestricciones: res.analisisRestricciones || res.restricciones || '',
      recomendaciones: res.recomendaciones || res.recomendacionesMedicas || '',
      vigencia: res.vigencia || '1 año',
      codigoVerificacion: res.codigoVerificacion || '',
      diagnosticoPrincipal: res.diagnosticoPrincipal || '',
      eps: res.eps || '',
      arl: res.arl || '',
      estadoHistoria: 'Cerrada',
    };
    const doctorData = res._doctorData || empresaAtenciones?._doctorData || { nombre: 'MÉDICO OCUPACIONAL' };
    const firma = res._firma || empresaAtenciones?._firma || '';
    // P3: QR code
    const qrDataUrl = res.codigoVerificacion ? await _generarQRDataUrl(res.codigoVerificacion) : '';
    return _generarCertificadoHTMLNormalizado(mappedData, doctorData, firma, null, qrDataUrl);
  };

  const handlePrintTodos = async () => {
    const sel = atencionesVisibles.filter((_, i) => certSeleccionados[i]);
    const pacs = sel.length > 0 ? sel : atencionesVisibles;
    // Generar certificados en paralelo (cada uno genera QR code)
    const certsHTML = await Promise.all(pacs.map(async (p) => {
      const certDiv = await generarCertHTML(p);
      return `<div style="page-break-after:always">${certDiv}</div>`;
    }));
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Certificados - ${authenticated?.nombre}</title>
<style>@page{size:letter portrait;margin:12mm 14mm 14mm 14mm}body{font-family:Arial;color:#111}@media print{body{padding:0!important}}</style></head><body>
<div style="position:fixed;top:10px;right:10px;z-index:9999"><button onclick="window.print()" style="background:#065f46;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:900;cursor:pointer;font-size:12px;box-shadow:0 4px 12px rgba(0,0,0,.2)">🖨️ Imprimir / Guardar PDF (${pacs.length})</button></div>
${certsHTML.join('')}</body></html>`;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const handlePrintSingle = async (res) => {
    const certHTML = await generarCertHTML(res);
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Certificado ${res.nombres}</title></head><body>
<button onclick="window.print()" style="position:fixed;top:10px;right:10px;z-index:9999;background:#059669;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;font-size:11pt;box-shadow:0 4px 12px rgba(0,0,0,.2)">🖨️ Imprimir / Guardar PDF</button>
${certHTML}<script>setTimeout(()=>window.print(),300)</script></body></html>`;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (w) { w.document.write(html); w.document.close(); }
  };

  // ═══ RENDER: LOGIN ═══
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin"/></div>;

  if (!resultadosEmpresa.length && !resultadoIndividual) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"><Building2 className="w-8 h-8 text-white" /></div>
          <h2 className="text-lg font-black text-gray-800">Portal Empresa</h2>
          <p className="text-xs text-gray-500">Acceda a las evaluaciones de sus trabajadores</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[{ id: 'empresa', label: '🏢 Empresa' }, { id: 'codigo', label: '🔢 Código' }, { id: 'cedula', label: '🪪 Cédula' }].map(t => (
            <button key={t.id} onClick={() => { setTipoBusqueda(t.id); setError(''); setBusqueda(''); setCodigoPortal(''); }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition ${tipoBusqueda === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
          ))}
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">{error}</div>}
        {tipoBusqueda === 'empresa' && (<>
          <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">NIT de la Empresa</label><input value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Ej: 900123456" className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none" autoFocus /></div>
          <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Contraseña de Acceso</label><input type="password" value={codigoPortal} onChange={e => setCodigoPortal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="EMP-XXXX-XXXX" className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none" /></div>
        </>)}
        {(tipoBusqueda === 'codigo' || tipoBusqueda === 'cedula') && (
          <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">{tipoBusqueda === 'codigo' ? 'Código de Verificación' : 'Número de Cédula'}</label>
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder={tipoBusqueda === 'codigo' ? 'CV-XXXX o SISO-...' : '1234567890'} className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none" autoFocus /></div>
        )}
        <button onClick={handleSearch} disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-sm rounded-xl hover:from-indigo-700 hover:to-blue-700 shadow-lg transition">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : <><Search className="w-4 h-4 inline mr-1"/> Buscar</>}
        </button>
      </div>
    </div>
  );

  // ═══ RENDER: VISTA INDIVIDUAL ═══
  if (resultadoIndividual) {
    const r = resultadoIndividual; const c = colorAptitud(r.conceptoAptitud);
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-black text-gray-800 flex items-center gap-2"><Shield className="w-6 h-6 text-indigo-600"/> Certificado Individual</h1>
          <button onClick={() => { setResultadoIndividual(null); setAuthenticated(null); setBusqueda(''); }} className="text-xs text-gray-500 hover:text-gray-700 font-bold">← Nueva búsqueda</button></div>
        <div className={`bg-white rounded-2xl shadow-sm border p-6 ${c.border} border-l-4`}>
          <div className="flex justify-between items-start mb-4"><div><h2 className="text-lg font-black text-gray-800">{r.nombres}</h2><p className="text-sm text-gray-500">{r.docTipo || 'CC'}: {r.docNumero} · {r.empresaNombre}</p></div>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${c.badge}`}>{r.conceptoAptitud || '—'}</span></div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {r.cargo && <p><b>Cargo:</b> {r.cargo}</p>}{r.tipoExamen && <p><b>Tipo:</b> {r.tipoExamen}</p>}
            {r.fechaExamen && <p><b>Fecha:</b> {formatDate(r.fechaExamen)}</p>}{r.codigoVerificacion && <p><b>Código:</b> <span className="font-mono text-indigo-600">{r.codigoVerificacion}</span></p>}
            {r.vigencia && <p><b>Vigencia:</b> {r.vigencia}</p>}
          </div>
          <button onClick={() => handlePrintSingle(r)} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700"><Printer className="w-4 h-4"/> Imprimir Certificado</button>

          {/* ── Documentos Emitidos (medicamentos, derivaciones, exámenes, incapacidad) ── */}
          {(() => {
            const meds = r.formulaMedicamentos || [];
            const derivs = r.derivaciones || [];
            const exams = r.solicitudExamenes || [];
            const incap = r.incapacidad?.aplica ? r.incapacidad : null;
            const docBtns = [
              meds.length > 0 && { section: "formula", label: "📋 Receta Médica", sub: `${meds.length} medicamento${meds.length !== 1 ? "s" : ""}`, color: "bg-emerald-600 hover:bg-emerald-700" },
              derivs.length > 0 && { section: "derivacion", label: "🔬 Derivaciones", sub: `${derivs.length} especialidad${derivs.length !== 1 ? "es" : ""}`, color: "bg-violet-600 hover:bg-violet-700" },
              exams.length > 0 && { section: "examenes", label: "🧪 Exámenes", sub: `${exams.length} examen${exams.length !== 1 ? "es" : ""}`, color: "bg-teal-600 hover:bg-teal-700" },
              incap && { section: "incapacidad", label: "🩺 Incapacidad", sub: `${incap.dias || 0} día${(incap.dias || 0) !== 1 ? "s" : ""}`, color: "bg-red-600 hover:bg-red-700" },
            ].filter(Boolean);
            if (docBtns.length === 0) return null;
            return (
              <div className="mt-4 border border-indigo-100 bg-indigo-50 rounded-xl p-3">
                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider mb-2">📄 Documentos Emitidos en tu Consulta</p>
                <div className="grid grid-cols-2 gap-2">
                  {docBtns.map(btn => (
                    <button key={btn.section} onClick={() => _openPrintRecetaDeriv(btn.section, btn.label.replace(/^[^\s]+\s/, ''), r, null, null, null, _safeLogoUrl)} className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-white font-black text-[11px] shadow-sm transition ${btn.color}`}>
                      <span className="text-sm">{btn.label}</span>
                      <span className="text-[9px] font-normal opacity-90">{btn.sub}</span>
                      <span className="text-[9px] opacity-75 mt-0.5">📥 Descargar PDF</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // ═══ RENDER: VISTA EMPRESA (tabs) ═══
  const allSelected = atencionesVisibles.length > 0 && Object.keys(certSeleccionados).length === atencionesVisibles.length;
  const multiDate = fechasUnicas.length > 1;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><Building2 className="w-6 h-6 text-indigo-600"/><div><h1 className="text-2xl font-bold text-gray-800">{authenticated?.nombre || 'Empresa'}</h1><p className="text-xs text-gray-500">NIT: {authenticated?.nit} · {resultadosEmpresa.length} trabajadores evaluados</p></div></div>
        <button onClick={() => { setResultadosEmpresa([]); setEmpresaAtenciones(null); setAuthenticated(null); setBusqueda(''); setCodigoPortal(''); }} className="text-xs text-gray-500 hover:text-gray-700 font-bold">← Cerrar sesión</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[{ label: 'Total', val: stats.total, color: 'blue' },{ label: 'Aptos', val: stats.aptos, color: 'emerald' },{ label: 'Con Restricciones', val: stats.conRestricciones, color: 'amber' },{ label: 'No Aptos', val: stats.noAptos, color: 'red' }].map(({ label, val, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-3 text-center`}><p className={`text-[9px] font-black text-${color}-700 uppercase mb-1`}>{label}</p><p className={`text-2xl font-black text-${color}-800`}>{val}</p></div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-xl p-1">
        {[{ id: 'certificados', label: '📄 Certificados', icon: FileText },{ id: 'documentos', label: '📁 Documentos', icon: Download },{ id: 'estadisticas', label: '📊 Estadísticas', icon: BarChart3 }].map(t => (
          <button key={t.id} onClick={() => setTabActiva(t.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-lg transition ${tabActiva === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}><t.icon size={13}/> {t.label}</button>
        ))}
      </div>

      {/* ═══ TAB: CERTIFICADOS (FASE 2A premium) ═══ */}
      {tabActiva === 'certificados' && (
        <div className="space-y-3">
          {/* Banner documentos adicionales */}
          <div onClick={() => setTabActiva('documentos')} className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-emerald-100 transition">
            <span className="text-xl">📁</span>
            <div className="flex-1 min-w-0"><p className="text-xs font-black text-emerald-800">Informes, Custodia y Cuentas de cobro</p><p className="text-[10px] text-emerald-600 leading-tight">Informes sociodemográficos · Cartas de custodia · Cuentas de cobro disponibles en la pestaña Documentos</p></div>
            <span className="text-emerald-600 font-black text-xs flex-shrink-0">Ver →</span>
          </div>

          {resultadosEmpresa.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><FileText size={48} className="mx-auto mb-3 opacity-30"/><p className="text-sm font-bold">No hay certificados disponibles</p></div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Toolbar azul */}
              <div className="bg-blue-800 px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
                <div><p className="text-white font-black text-sm">📋 Certificados de aptitud</p><p className="text-blue-300 text-[10px]">{atencionesVisibles.length} atención(es){multiDate && <span className="ml-1 text-yellow-300 font-black">· {fechasUnicas.length} fechas</span>}</p></div>
                <div className="flex gap-2 flex-wrap">
                  {multiDate && (
                    <select value={fechaFiltro} onChange={e => { setFechaFiltro(e.target.value); setCertSeleccionados({}); }}
                      className="px-2 py-1 text-[10px] font-black bg-white/20 text-white border border-white/30 rounded-lg">
                      <option value="" className="text-gray-800">Todas las fechas</option>
                      {fechasUnicas.map(f => <option key={f} value={f} className="text-gray-800">{formatDate(f)}</option>)}
                    </select>
                  )}
                  <button onClick={() => { const all = {}; atencionesVisibles.forEach((_, i) => { all[i] = true; }); setCertSeleccionados(allSelected ? {} : all); }}
                    className="px-3 py-1.5 bg-white/20 text-white text-[10px] font-black rounded-xl hover:bg-white/30 transition">{allSelected ? '☐ Deseleccionar' : '☑ Seleccionar todos'}</button>
                  <button onClick={handlePrintTodos}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-xl hover:bg-emerald-700 transition flex items-center gap-1">
                    <Printer size={11}/> Imprimir ({Object.keys(certSeleccionados).filter(k => certSeleccionados[k]).length || atencionesVisibles.length})
                  </button>
                </div>
              </div>

              {/* Lista de trabajadores con checkboxes */}
              <div className="divide-y divide-gray-100">
                {atencionesVisibles.map((a, i) => {
                  const c = colorAptitud(a.conceptoAptitud);
                  const isSel = !!certSeleccionados[i];
                  return (
                    <div key={i} className={`p-4 flex items-center gap-3 hover:bg-gray-50 transition ${isSel ? 'bg-indigo-50' : ''}`}>
                      <button onClick={() => setCertSeleccionados(p => ({ ...p, [i]: !p[i] }))}
                        className="flex-shrink-0 text-indigo-600 hover:text-indigo-800">
                        {isSel ? <CheckSquare size={18}/> : <Square size={18} className="text-gray-300"/>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-gray-800">{a.nombres}</p>
                        <p className="text-[10px] text-gray-500">{a.docNumero} · {a.cargo || '—'} · {a.tipoExamen} · {formatDate(a.fechaExamen)}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${c.badge}`}>{a.conceptoAptitud || '—'}</span>
                      <button onClick={() => handlePrintSingle(a)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700 flex-shrink-0">
                        <Printer size={12}/> PDF
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: DOCUMENTOS (FASE 2B — datos reales D1) ═══ */}
      {tabActiva === 'documentos' && (
        <div className="space-y-4">
          {docsLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin"/></div> : (
            <>
              {/* Cuentas de cobro */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2">🧾 Cuentas de Cobro <span className="text-[9px] font-normal text-gray-400">— Descargables</span></h3>
                {docsCuentas.length === 0 ? <p className="text-xs text-gray-400">Sin cuentas de cobro registradas</p> : (
                  <div className="overflow-x-auto"><table className="w-full text-[10px] text-left">
                    <thead><tr className="bg-gray-50 text-gray-600 uppercase"><th className="p-2 font-black">Fecha</th><th className="p-2 font-black">Concepto</th><th className="p-2 font-black text-right">Monto</th><th className="p-2 font-black">Estado</th><th className="p-2"></th></tr></thead>
                    <tbody>{docsCuentas.map((c,i) => (
                      <tr key={c.id || i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2">{c.fecha || '—'}</td><td className="p-2">{c.concepto || '—'}</td>
                        <td className="p-2 text-right font-bold">${Number(c.monto||0).toLocaleString('es-CO')}</td>
                        <td className="p-2"><span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${c.estado === 'pagada' || c.pagada ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.estado || (c.pagada ? 'Pagada' : 'Pendiente')}</span></td>
                        <td className="p-2"><button onClick={() => { const html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cuenta de Cobro</title><style>@page{size:letter;margin:2cm}body{font-family:Arial;font-size:11pt}h2{color:#059669;border-bottom:2px solid #059669;padding-bottom:6px}table{width:100%;border-collapse:collapse;margin:12px 0}td,th{border:1px solid #ddd;padding:8px}th{background:#f0fdf4}.total{font-size:14pt;font-weight:900;color:#059669;text-align:right}</style></head><body><h2>Cuenta de Cobro</h2><p><b>Empresa:</b> '+(authenticated?.nombre||'—')+'</p><p><b>NIT:</b> '+(authenticated?.nit||'—')+'</p><p><b>Fecha:</b> '+(c.fecha||'—')+'</p><p><b>Concepto:</b> '+(c.concepto||'—')+'</p><table><tr><th>Descripción</th><th>Cantidad</th><th>Valor</th><th>Total</th></tr><tr><td>'+(c.concepto||'Servicios')+'</td><td>1</td><td>$'+Number(c.monto||0).toLocaleString('es-CO')+'</td><td>$'+Number(c.monto||0).toLocaleString('es-CO')+'</td></tr></table><p class="total">TOTAL: $'+Number(c.monto||0).toLocaleString('es-CO')+'</p><script>setTimeout(()=>window.print(),400)</'+'script></body></html>'; const w=window.open('','_blank','width=900,height=700');if(w){w.document.write(html);w.document.close()} }} className="px-3 py-1 bg-amber-600 text-white rounded-lg text-[9px] font-black hover:bg-amber-700 flex items-center gap-1"><Download size={10}/>Descargar</button></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                )}
              </div>

              {/* Cartas de custodia */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2">📁 Cartas de Custodia</h3>
                {docsCustodia.length === 0 ? <p className="text-xs text-gray-400">Sin cartas de custodia emitidas</p> : (
                  <div className="space-y-2">{docsCustodia.map((c,i) => (
                    <div key={c.id || i} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div><p className="text-xs font-black text-gray-800">{c.empresaNombre || 'Empresa'}</p><p className="text-[10px] text-gray-500">{c.mesTexto || ''} {c.anio || ''} · {c.savedAt ? new Date(c.savedAt).toLocaleDateString('es-CO') : ''}</p></div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-600">✅ Emitida</span>
                        <button onClick={() => { const html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Carta de Custodia</title><style>@page{size:letter;margin:2cm}body{font-family:Arial;font-size:10pt}h2{color:#059669;border-bottom:2px solid #059669;padding-bottom:6px}p{margin:4px 0}</style></head><body><h2>Carta de Custodia de Historias Clínicas</h2><p><b>Empresa:</b> '+(c.empresaNombre||authenticated?.nombre||'—')+'</p><p><b>Período:</b> '+(c.mesTexto||'')+' '+(c.anio||'')+'</p><p style="margin-top:20px">Se certifica que las historias clínicas ocupacionales han sido custodiadas conforme a la Resolución 1995/1999 por 20 años.</p><div style="margin-top:40px;border-top:1px solid #333;padding-top:8px;width:50%"><p style="font-weight:700">'+(authenticated?.nombre||'Médico')+'</p></div><script>setTimeout(()=>window.print(),400)</'+'script></body></html>'; const w=window.open('','_blank','width=900,height=700');if(w){w.document.write(html);w.document.close()} }} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black hover:bg-emerald-700 flex items-center gap-1"><Download size={10}/>Ver</button>
                      </div>
                    </div>
                  ))}</div>
                )}
              </div>

              {/* Informes sociodemográficos */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2">📊 Informes Sociodemográficos</h3>
                {docsInformes.length === 0 ? <p className="text-xs text-gray-400">Sin informes generados</p> : (
                  <div className="space-y-2">{docsInformes.map((inf,i) => (
                    <div key={inf.id || i} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div><p className="text-xs font-black text-gray-800">{inf.empresaNombre || inf.nombre || 'Informe'}</p><p className="text-[10px] text-gray-500">{inf.periodo || ''} · {inf.fechaGeneracion ? new Date(inf.fechaGeneracion).toLocaleDateString('es-CO') : ''}</p></div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600">📋 Disponible</span>
                        <button onClick={() => { const html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Informe</title><style>@page{size:letter landscape;margin:1.5cm}body{font-family:Arial;font-size:10pt}h2{color:#1e40af}</style></head><body><h2>Informe Sociodemográfico</h2><p><b>Empresa:</b> '+(inf.empresaNombre||authenticated?.nombre||'—')+'</p><p><b>Período:</b> '+(inf.periodo||'—')+'</p><p style="margin-top:20px">Informe completo con estadísticas de población evaluada, diagnóstico de condiciones de salud, distribución demográfica y matriz de cumplimiento normativo.</p><script>setTimeout(()=>window.print(),400)</'+'script></body></html>'; const w=window.open('','_blank','width=1100,height=800');if(w){w.document.write(html);w.document.close()} }} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black hover:bg-blue-700 flex items-center gap-1"><Download size={10}/>Ver</button>
                      </div>
                    </div>
                  ))}</div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ TAB: ESTADÍSTICAS (FASE 2C enriquecido) ═══ */}
      {tabActiva === 'estadisticas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Distribución por Tipo */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><Activity size={16} className="text-indigo-600"/> Distribución por Tipo</h3>
              {(() => { const tipos = {}; resultadosEmpresa.forEach(a => { const t = a.tipoExamen || '—'; tipos[t] = (tipos[t] || 0) + 1; });
                return Object.entries(tipos).sort((a,b) => b[1]-a[1]).map(([t,c]) => (
                  <div key={t} className="flex items-center gap-2 mb-2"><div className="flex-1"><div className="flex justify-between mb-0.5"><span className="text-xs text-gray-600">{t}</span><span className="text-xs font-black text-indigo-600">{c}</span></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{width:`${Math.min((c/resultadosEmpresa.length)*100,100)}%`}}/></div></div></div>
                ));
              })()}
              {resultadosEmpresa.length === 0 && <p className="text-xs text-gray-400">Sin datos</p>}
            </div>

            {/* Por Período */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><Users size={16} className="text-emerald-600"/> Por Período</h3>
              {(() => { const periodos = {}; resultadosEmpresa.forEach(a => { const p = (a.fechaExamen || '').slice(0,7) || '—'; periodos[p] = (periodos[p] || 0) + 1; });
                const maxVal = Math.max(...Object.values(periodos), 1);
                return Object.entries(periodos).sort((a,b) => b[0].localeCompare(a[0])).slice(0,12).map(([p,c]) => (
                  <div key={p} className="flex items-center gap-2 mb-2"><div className="flex-1"><div className="flex justify-between mb-0.5"><span className="text-xs text-gray-600">{p}</span><span className="text-xs font-black text-emerald-600">{c}</span></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width:`${Math.min((c/maxVal)*100,100)}%`}}/></div></div></div>
                ));
              })()}
              {resultadosEmpresa.length === 0 && <p className="text-xs text-gray-400">Sin datos</p>}
            </div>

            {/* Top Diagnósticos CIE-10 */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-purple-600"/> Top Diagnósticos CIE-10</h3>
              {(() => { const diags = {}; resultadosEmpresa.forEach(a => { if(a.diagnosticoPrincipal){ const d = a.diagnosticoPrincipal; diags[d] = (diags[d] || 0) + 1; } });
                return Object.entries(diags).sort((a,b) => b[1]-a[1]).slice(0,8).map(([d,c],i) => (
                  <div key={d} className="flex items-center gap-2 mb-1.5"><span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[9px] font-black flex items-center justify-center flex-shrink-0">{i+1}</span><span className="text-xs text-gray-700 flex-1 truncate">{d}</span><span className="text-xs font-bold text-purple-600">{c}</span></div>
                ));
              })()}
              {resultadosEmpresa.length === 0 && <p className="text-xs text-gray-400">Sin diagnósticos</p>}
            </div>

            {/* Riesgos laborales */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><Shield size={16} className="text-orange-600"/> Riesgos Laborales</h3>
              {(() => { const riesgos = {}; resultadosEmpresa.forEach(a => { if(a.riesgos && typeof a.riesgos === 'object') Object.entries(a.riesgos).filter(([,v])=>v).forEach(([k]) => { const lbl = k.replace(/([A-Z])/g,' $1').trim(); riesgos[lbl] = (riesgos[lbl]||0)+1; }); });
                return Object.entries(riesgos).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([r,c]) => (
                  <div key={r} className="flex items-center gap-2 mb-1.5"><span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700">{r}</span><span className="text-xs font-bold text-orange-600 ml-auto">{c}</span></div>
                ));
              })()}
              {resultadosEmpresa.length === 0 && <p className="text-xs text-gray-400">Sin riesgos registrados</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}