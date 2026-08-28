// src/pages/PortalEmpresaPage.jsx — Portal Empresa v3 (paridad monolito PortalPublicoTrabajador)
// FASE 2A: Certificados premium + FASE 2B: Documentos D1 por Período + FASE 2C: Estadísticas enriquecidas
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Building2, Loader2, Download, Search, FileText, BarChart3, Users, Activity, Printer, Shield, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { d1Get, _readSmart } from '../lib/d1Client';

// FIX 2026-07-21 (FASE 2 PROMPT_MAESTRO): consulta Supabase para _readSmart —
// antes esta pantalla leía siso_portal_empresa_docs SOLO de D1, sin ningún
// respaldo/reconciliación si D1 quedaba desactualizado respecto a Supabase.
const _SB_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yqrrktrgoijgzccrxnpz.supabase.co';
const _SB_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7';
const _sbQueryFor = async (key) => {
  const r = await fetch(`${_SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(key)}&select=value`, {
    headers: { apikey: _SB_KEY, Authorization: `Bearer ${_SB_KEY}` },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows?.[0]?.value ?? null;
};
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
  const [expandedPeriod, setExpandedPeriod] = useState(null);

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
    if (!cod) { setError('Ingrese el código de acceso de la empresa'); setLoading(false); return; }

    try {
      let codigoValido = false; let docsKeyFound = false;

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
                if (!docsKeyFound || !codigoValido) {
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
        cargarDocumentos(nitClean);
        setLoading(false); return;
      }
      setError(`📭 No se encontraron certificados para esta empresa.`);
    } catch (e) { setError('Error: ' + (e.message || 'desconocido')); }
    finally { setLoading(false); }
  };

  // ═══ CARGAR DOCUMENTOS — Fusión multi-NIT como monolito PortalEmpresaDocsPeriodos ═══
  const cargarDocumentos = async (nitClean) => {
    setDocsLoading(true);
    const userId = (() => { try { const s = JSON.parse(localStorage.getItem('siso-auth') || '{}'); return s?.state?.currentUser?.user || 'drcucalon'; } catch { return 'drcucalon'; } })();

    const nitVariants = [nitClean];
    for (let dv = 0; dv <= 9; dv++) nitVariants.push(nitClean + dv);
    if (nitClean.length > 6) nitVariants.push(nitClean.slice(0, -1));

    try {
      // ── Leer siso_portal_empresa_docs con FUSIÓN multi-NIT ──
      let baseDocs = null;
      const periodMap = new Map(); // periodo -> { periodo, informe, cuenta, custodia, certificados }
      for (const nv of nitVariants) {
        let val = null;
        const _key = `siso_portal_empresa_docs_${nv}`;
        try { val = await _readSmart(_key, _sbQueryFor(_key)); } catch {}
        if (!val || !Array.isArray(val.periodos)) continue;
        if (!baseDocs) baseDocs = { nit: val.nit || nv, nombre: val.nombre || '', codigoAcceso: val.codigoAcceso };
        else {
          if (!baseDocs.nombre && val.nombre) baseDocs.nombre = val.nombre;
          if (!baseDocs.codigoAcceso && val.codigoAcceso) baseDocs.codigoAcceso = val.codigoAcceso;
        }
        for (const per of val.periodos) {
          const k = per.periodo || '';
          const prev = periodMap.get(k) || { periodo: k };
          periodMap.set(k, {
            ...prev, ...per,
            informe: per.informe || prev.informe || null,
            cuenta: per.cuenta || prev.cuenta || null,
            custodia: per.custodia || prev.custodia || null,
            certificados: (per.certificados && per.certificados.count) ? per.certificados : (prev.certificados || per.certificados || null),
          });
        }
      }

      // Extraer cuentas, custodia e informes de los períodos
      const cuentasArr = [], custodiasArr = [], informesArr = [];
      for (const [per, data] of periodMap) {
        if (data.cuenta) {
          cuentasArr.push({ ...data.cuenta, periodo: per, empresaNombre: baseDocs?.nombre || authenticated?.nombre });
        }
        if (data.custodia) {
          custodiasArr.push({ ...data.custodia, periodo: per, empresaNombre: baseDocs?.nombre || authenticated?.nombre });
        }
        if (data.informe) {
          informesArr.push({ ...data.informe, periodo: per, empresaNombre: baseDocs?.nombre || authenticated?.nombre });
        }
      }

      // ── Cuentas de cobro — leer siso_saved_bills como fallback ──
      let cuentasBills = [];
      try {
        const billsKey = `siso_saved_bills_${userId}`;
        const { value: billsRaw } = await d1Get(billsKey);
        const bills = Array.isArray(billsRaw) ? billsRaw : [];
        const { value: cajaRaw } = await d1Get(`siso_caja_movs_${userId}`);
        const cajaMovs = Array.isArray(cajaRaw) ? cajaRaw : [];
        const todas = [...bills, ...cajaMovs];
        cuentasBills = todas
          .filter(m => {
            const idMatch = (m.empresaClienteId || '').replace(/[^0-9]/g, '') === nitClean;
            const nombreMatch = (m.empresaClienteNombre || '').toLowerCase().includes(nitClean);
            return idMatch || !idMatch && nombreMatch;
          })
          .slice(0, 30);
      } catch (_) {}
      // Merge: portal primero, bills después (sin duplicar)
      const seenCuentaIds = new Set(cuentasArr.map(c => c.id).filter(Boolean));
      const mergedCuentas = [...cuentasArr, ...cuentasBills.filter(c => !seenCuentaIds.has(c.id))];

      // ── Cartas de custodia como fallback ──
      let custBills = [];
      try {
        const custKey = `siso_cartas_custodia_${userId}`;
        const { value: custRaw } = await d1Get(custKey);
        custBills = Array.isArray(custRaw) ? custRaw.filter(c => {
          const nitC = (c.empresaNit || c.nit || '').replace(/[^0-9]/g, '');
          return nitC === nitClean || nitC.includes(nitClean) || nitClean.includes(nitC);
        }) : [];
      } catch (_) {}
      const seenCustIds = new Set(custodiasArr.map(c => c.id).filter(Boolean));
      const mergedCustodia = [...custodiasArr, ...custBills.filter(c => !seenCustIds.has(c.id))];

      setDocsCuentas(mergedCuentas);
      setDocsCustodia(mergedCustodia);
      setDocsInformes(informesArr);
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
  const totalDerivs = useMemo(() => resultadosEmpresa.reduce((s, a) => s + (a.derivaciones || []).length, 0), [resultadosEmpresa]);

  const stats = {
    total: resultadosEmpresa.length,
    aptos: resultadosEmpresa.filter(a => (a.conceptoAptitud || '').toLowerCase().includes('apto') && !(a.conceptoAptitud || '').toLowerCase().includes('no apto') && !(a.conceptoAptitud || '').toLowerCase().includes('restricc')).length,
    conRestricciones: resultadosEmpresa.filter(a => (a.conceptoAptitud || '').toLowerCase().includes('restricc') || (a.conceptoAptitud || '').toLowerCase().includes('condicion')).length,
    noAptos: resultadosEmpresa.filter(a => (a.conceptoAptitud || '').toLowerCase().includes('no apto')).length,
    derivs: totalDerivs,
  };

  // ═══ GENERADOR DE CERTIFICADO HTML ═══
  const generarCertHTML = async (res) => {
    const mappedData = {
      nombres: res.nombres || '', docTipo: res.docTipo || 'CC', docNumero: res.docNumero || '',
      edad: res.edad || '', cargo: res.cargo || '', empresaNombre: res.empresaNombre || 'PARTICULAR',
      empresaNit: res.empresaNit || '', tipoExamen: res.tipoExamen || '', enfasisExamen: res.enfasisExamen || 'GENERAL',
      fechaExamen: res.fechaExamen || '', conceptoAptitud: res.conceptoAptitud || '',
      restricciones: res.restricciones || res.analisisRestricciones || '',
      recomendaciones: res.recomendaciones || res.recomendacionesMedicas || '',
      vigencia: res.vigencia || '1 año', codigoVerificacion: res.codigoVerificacion || '',
      diagnosticoPrincipal: res.diagnosticoPrincipal || '', eps: res.eps || '', arl: res.arl || '',
    };
    const doctorData = res._doctorData || empresaAtenciones?._doctorData || { nombre: 'MÉDICO OCUPACIONAL' };
    const firma = res._firma || empresaAtenciones?._firma || '';
    const qrDataUrl = res.codigoVerificacion ? await _generarQRDataUrl(res.codigoVerificacion) : '';
    return _generarCertificadoHTMLNormalizado(mappedData, doctorData, firma, null, qrDataUrl);
  };

  const handlePrintTodos = async () => {
    const sel = atencionesVisibles.filter((_, i) => certSeleccionados[i]);
    const pacs = sel.length > 0 ? sel : atencionesVisibles;
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

  // ═══ PERÍODOS DE DOCUMENTACIÓN ═══
  const periodos = useMemo(() => {
    const per = {};
    resultadosEmpresa.forEach(a => {
      const p = (a.fechaExamen || '').slice(0, 7) || 'Sin fecha';
      if (!per[p]) per[p] = { periodo: p, fecha: a.fechaExamen, certs: 0, cuenta: null, custodia: null, informe: null };
      per[p].certs++;
    });
    docsCuentas.forEach(c => {
      const p = (c.periodo || c.fecha || '').slice(0, 7) || '';
      if (per[p]) per[p].cuenta = c;
    });
    docsCustodia.forEach(c => {
      const p = (c.savedAt || '').slice(0, 7) || '';
      if (per[p]) per[p].custodia = c;
    });
    docsInformes.forEach(c => {
      const p = c.periodo || '';
      if (per[p]) per[p].informe = c;
    });
    return Object.entries(per).sort((a, b) => b[0].localeCompare(a[0]));
  }, [resultadosEmpresa, docsCuentas, docsCustodia, docsInformes]);

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

          {/* ── Documentos Emitidos ── */}
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
                    <button key={btn.section} onClick={() => _openPrintRecetaDeriv(btn.section, btn.label.replace(/^[^\s]+\s/, ''), r, null, null, null, null)} className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-white font-black text-[11px] shadow-sm transition ${btn.color}`}>
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
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[{ label: 'Trabajadores', val: stats.total, color: 'blue' },{ label: 'Favorables', val: stats.aptos, color: 'emerald' },{ label: 'Obs/Restricc', val: stats.conRestricciones, color: 'amber' },{ label: 'No Aptos', val: stats.noAptos, color: 'red' },{ label: 'Derivaciones', val: stats.derivs, color: 'violet' }].map(({ label, val, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-3 text-center`}><p className={`text-[9px] font-black text-${color}-700 uppercase mb-1`}>{label}</p><p className={`text-2xl font-black text-${color}-800`}>{val}</p></div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-xl p-1">
        {[{ id: 'certificados', label: '📋 Certificados', icon: FileText },{ id: 'documentos', label: '📁 Documentos', icon: Download },{ id: 'estadisticas', label: '📊 Estadísticas', icon: BarChart3 }].map(t => (
          <button key={t.id} onClick={() => setTabActiva(t.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-lg transition ${tabActiva === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}><t.icon size={13}/> {t.label}</button>
        ))}
      </div>

      {/* ═══ TAB: CERTIFICADOS ═══ */}
      {tabActiva === 'certificados' && (
        <div className="space-y-3">
          <div onClick={() => setTabActiva('documentos')} className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-emerald-100 transition">
            <span className="text-xl">📁</span>
            <div className="flex-1 min-w-0"><p className="text-xs font-black text-emerald-800">Informes, Custodia y Cuentas de cobro</p><p className="text-[10px] text-emerald-600 leading-tight">Documentación completa disponible en la pestaña Documentos</p></div>
            <span className="text-emerald-600 font-black text-xs flex-shrink-0">Ver →</span>
          </div>

          {resultadosEmpresa.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><FileText size={48} className="mx-auto mb-3 opacity-30"/><p className="text-sm font-bold">No hay certificados disponibles</p></div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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

              <div className="divide-y divide-gray-100">
                {atencionesVisibles.map((a, i) => {
                  const col = colorAptitud(a.conceptoAptitud);
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${col.badge}`}>{a.conceptoAptitud || '—'}</span>
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

      {/* ═══ TAB: DOCUMENTOS (Documentación por Período) ═══ */}
      {tabActiva === 'documentos' && (
        <div className="space-y-4">
          {docsLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin"/></div> : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-black text-gray-800 text-sm mb-4 flex items-center gap-2">📦 Documentación por Período — {authenticated?.nombre}</h3>
              <p className="text-[10px] text-gray-500 mb-4">NIT: {authenticated?.nit}</p>
              {periodos.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No hay documentación disponible</p>
              ) : (
                <div className="space-y-2">
                  {periodos.map(([per, data]) => {
                    const isExpanded = expandedPeriod === per;
                    const certsDelPeriodo = resultadosEmpresa.filter(a => (a.fechaExamen || '').slice(0, 7) === per);
                    return (
                      <div key={per} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => setExpandedPeriod(isExpanded ? null : per)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{isExpanded ? <ChevronDown size={18}/> : <span className="text-gray-400">▶</span>}</span>
                            <div className="text-left">
                              <p className="font-black text-sm text-gray-800">📅 {per} ({data.fecha ? formatDate(data.fecha) : per + '-01'})</p>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {data.certs > 0 && <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">📄 {data.certs} cert.</span>}
                                {data.cuenta && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">💰 Cuenta</span>}
                                {data.custodia && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">📁 Custodia</span>}
                                {data.informe && <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">📋 Informe</span>}
                              </div>
                            </div>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="p-4 border-t border-gray-100 space-y-3">
                            {certsDelPeriodo.length > 0 && (
                              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">📄</span>
                                  <div><p className="text-xs font-black text-gray-800">{certsDelPeriodo.length} certificado(s) de aptitud</p></div>
                                </div>
                                <button onClick={async () => {
                                  const certs = await Promise.all(certsDelPeriodo.map(async (p) => {
                                    try { return await generarCertHTML(p); } catch { return `<div style="text-align:center;padding:12px"><p style="font-size:10pt"><strong>${p.nombres||''}</strong></p><p style="font-size:14pt;color:#065f46">Concepto: ${p.conceptoAptitud||'—'}</p></div>`; }
                                  }));
                                  const html = certs.map((c, idx) => `<div style="${idx > 0 ? 'page-break-before:always;' : ''}">${c}</div>`).join('');
                                  const w = window.open('', '_blank', 'width=900,height=700');
                                  if (w) { w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Certificados ${per}</title><style>@page{size:letter portrait;margin:12mm 14mm 14mm 14mm}body{font-family:Arial;color:#111;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}@media print{body{padding:0!important}}</style></head><body><div style="position:fixed;top:10px;right:10px;z-index:9999"><button onclick="window.print()" style="background:#065f46;color:#fff;border:none;padding:10px 24px;border-radius:10px;font-weight:900;cursor:pointer;font-size:12px">🖨️ Imprimir (${certsDelPeriodo.length})</button></div>${html}</body></html>`); w.document.close(); }
                                }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 flex items-center gap-1"><Printer size={12}/> Imprimir</button>
                              </div>
                            )}
                            {data.cuenta && (
                              <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">💰</span>
                                  <div><p className="text-xs font-black text-gray-800">Cuenta de Cobro</p><p className="text-[10px] text-gray-500">{data.cuenta.concepto || ''} · ${Number(data.cuenta.monto || 0).toLocaleString('es-CO')}</p></div>
                                </div>
                                <button onClick={() => { const c = data.cuenta; const concepto = c.concepto || c.descripcion || 'Servicios Médicos Ocupacionales'; const monto = Number(c.monto || c.total || 0); const fecha = c.fecha || c.createdAt || new Date().toISOString().slice(0,10); const empresa = c.empresaNombre || authenticated?.nombre || '—'; const nit = c.empresaNit || authenticated?.nit || '—'; const h='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cuenta de Cobro</title><style>@page{size:letter;margin:2cm}body{font-family:Arial,sans-serif;font-size:11pt;color:#111}h2{color:#059669;border-bottom:2px solid #059669;padding-bottom:6px}table{width:100%;border-collapse:collapse;margin:12px 0}td,th{border:1px solid #ddd;padding:8px}th{background:#f0fdf4;text-align:left}.total{font-size:14pt;font-weight:900;color:#059669;text-align:right}.footer{margin-top:30px;border-top:1px solid #ccc;padding-top:8px;font-size:8pt;color:#999;text-align:center}</style></head><body><h2>Cuenta de Cobro</h2><p><b>Empresa:</b> '+empresa.replace(/&/g,'&').replace(/</g,'<')+'</p><p><b>NIT:</b> '+nit+'</p><p><b>Fecha:</b> '+formatDate(fecha)+'</p><p><b>Concepto:</b> '+concepto.replace(/&/g,'&').replace(/</g,'<')+'</p><table><tr><th>Descripción</th><th>Cantidad</th><th>Valor Unitario</th><th>Total</th></tr><tr><td>'+concepto.replace(/&/g,'&').replace(/</g,'<')+'</td><td>1</td><td>$'+monto.toLocaleString('es-CO')+'</td><td>$'+monto.toLocaleString('es-CO')+'</td></tr></table><p class="total">TOTAL: $'+monto.toLocaleString('es-CO')+'</p><div class="footer">SISO OcupaSalud Pro — Documento generado el '+new Date().toLocaleDateString('es-CO')+'<br>Res. 1843/2025 · Res. 1995/1999</div><script>setTimeout(()=>window.print(),400)</'+'script></body></html>'; const w=window.open('','_blank','width=900,height=700');if(w){w.document.write(h);w.document.close()} }} className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[10px] font-black hover:bg-amber-700 flex items-center gap-1"><Download size={12}/> Descargar</button>
                              </div>
                            )}
                            {data.custodia && (
                              <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">📁</span>
                                  <div><p className="text-xs font-black text-gray-800">Carta de Custodia</p><p className="text-[10px] text-gray-500">{data.custodia.mesTexto || ''} {data.custodia.anio || ''}</p></div>
                                </div>
                                <button onClick={() => { const c = data.custodia; const empresa = c.empresaNombre || authenticated?.nombre || '—'; const mes = c.mesTexto || ''; const anio = c.anio || ''; const periodo = mes && anio ? `${mes} ${anio}` : (c.periodo || per); const h='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Carta de Custodia</title><style>@page{size:letter;margin:2cm}body{font-family:Arial,sans-serif;font-size:10pt;color:#111}h2{color:#059669;border-bottom:2px solid #059669;padding-bottom:6px}p{margin:4px 0;line-height:1.5}.footer{margin-top:30px;border-top:1px solid #ccc;padding-top:8px;font-size:8pt;color:#999;text-align:center}</style></head><body><h2>Carta de Custodia de Historias Clínicas</h2><p><b>Empresa:</b> '+empresa.replace(/&/g,'&').replace(/</g,'<')+'</p><p><b>Período:</b> '+periodo+'</p><br/><p>Por medio de la presente, se certifica que las <b>Historias Clínicas Ocupacionales</b> correspondientes al período <b>'+periodo+'</b> de los trabajadores de la empresa <b>'+empresa.replace(/&/g,'&').replace(/</g,'<')+'</b> han sido debidamente custodiadas y archivadas conforme a lo establecido en la <b>Resolución 1995 de 1999</b> del Ministerio de Salud y la <b>Ley 1581 de 2012</b> de Protección de Datos Personales.</p><p>La custodia incluye el archivo físico y/o digital de las evaluaciones médicas ocupacionales realizadas, garantizando su <b>confidencialidad, integridad y disponibilidad</b> por el tiempo legal establecido de <b>veinte (20) años</b>.</p><div style="margin-top:50px;border-top:2px solid #059669;padding-top:12px;width:55%"><p style="font-weight:900;font-size:11pt">'+empresa.replace(/&/g,'&').replace(/</g,'<')+'</p><p style="font-size:9pt;color:#666">Responsable de la Custodia</p></div><div class="footer">SISO OcupaSalud Pro — Documento generado el '+new Date().toLocaleDateString('es-CO')+'<br>Res. 1843/2025 · Res. 1995/1999 · Ley 1581/2012</div><script>setTimeout(()=>window.print(),400)</'+'script></body></html>'; const w=window.open('','_blank','width=900,height=700');if(w){w.document.write(h);w.document.close()} }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700 flex items-center gap-1"><Download size={12}/> Ver</button>
                              </div>
                            )}
                            {data.informe && (
                              <div className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">📋</span>
                                  <div><p className="text-xs font-black text-gray-800">Informe Sociodemográfico</p><p className="text-[10px] text-gray-500">{data.informe.periodo || per}</p></div>
                                </div>
                                <button onClick={() => { const h='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Informe</title><style>@page{size:letter landscape;margin:1.5cm}body{font-family:Arial;font-size:10pt}</style></head><body><h2>Informe Sociodemográfico</h2><p><b>Empresa:</b> '+(authenticated?.nombre||'—')+'</p><p><b>Período:</b> '+(data.informe.periodo||per)+'</p><p style="margin-top:20px">Informe completo con estadísticas de población, diagnóstico de salud, distribución demográfica y matriz normativa.</p><script>setTimeout(()=>window.print(),400)</'+'script></body></html>'; const w=window.open('','_blank','width=1100,height=800');if(w){w.document.write(h);w.document.close()} }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black hover:bg-indigo-700 flex items-center gap-1"><Download size={12}/> Ver</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: ESTADÍSTICAS ═══ */}
      {tabActiva === 'estadisticas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><Activity size={16} className="text-indigo-600"/> Distribución por Tipo</h3>
              {(() => { const tipos = {}; resultadosEmpresa.forEach(a => { const t = a.tipoExamen || '—'; tipos[t] = (tipos[t] || 0) + 1; });
                return Object.entries(tipos).sort((a,b) => b[1]-a[1]).map(([t,c]) => (
                  <div key={t} className="flex items-center gap-2 mb-2"><div className="flex-1"><div className="flex justify-between mb-0.5"><span className="text-xs text-gray-600">{t}</span><span className="text-xs font-black text-indigo-600">{c}</span></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{width:`${Math.min((c/resultadosEmpresa.length)*100,100)}%`}}/></div></div></div>
                ));
              })()}
              {resultadosEmpresa.length === 0 && <p className="text-xs text-gray-400">Sin datos</p>}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2"><Users size={16} className="text-emerald-600"/> Por Período</h3>
              {(() => { const perData = {}; resultadosEmpresa.forEach(a => { const p = (a.fechaExamen || '').slice(0,7) || '—'; perData[p] = (perData[p] || 0) + 1; });
                const maxVal = Math.max(...Object.values(perData), 1);
                return Object.entries(perData).sort((a,b) => b[0].localeCompare(a[0])).slice(0,12).map(([p,c]) => (
                  <div key={p} className="flex items-center gap-2 mb-2"><div className="flex-1"><div className="flex justify-between mb-0.5"><span className="text-xs text-gray-600">{p}</span><span className="text-xs font-black text-emerald-600">{c}</span></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width:`${Math.min((c/maxVal)*100,100)}%`}}/></div></div></div>
                ));
              })()}
              {resultadosEmpresa.length === 0 && <p className="text-xs text-gray-400">Sin datos</p>}
            </div>

            {/* FIX 2026-07-21 (Sección C, hallazgo CRÍTICO de confidencialidad):
                se eliminó el panel "Top Diagnósticos CIE-10" que existía aquí.
                Mostraba diagnósticos clínicos reales a la empresa cliente,
                violando directamente el Art.16 Res. 1843/2025 — el monolito
                garantiza explícitamente que el portal de empresa NUNCA muestra
                diagnóstico/CIE-10/hallazgos clínicos, solo concepto de aptitud
                y documentos administrativos ya generados. No reemplazar por
                otro desglose de diagnósticos: cualquier variante (por código,
                por texto, agrupado) sigue siendo información clínica
                confidencial no autorizada para este destinatario. */}

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