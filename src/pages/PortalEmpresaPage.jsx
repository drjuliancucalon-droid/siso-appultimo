// src/pages/PortalEmpresaPage.jsx — SPRINT 5: Portal Empresa conectado a D1
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Building2, Loader2, Download, Lock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { d1Get } from '../lib/d1Client';
import { CompanyPortal } from '../modules/companies/components/CompanyPortal';
import { useBackendData } from '../hooks/useBackendData';

export default function PortalEmpresaPage() {
  const [searchParams] = useSearchParams();
  const { data: companies } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const { data: patients } = useBackendData('/data/patients', 'siso_db_patients', 'patients');

  const [nit, setNit] = useState('');
  const [codigoPortal, setCodigoPortal] = useState('');
  const [authenticated, setAuthenticated] = useState(null);
  const [atenciones, setAtenciones] = useState([]);
  const [periodo, setPeriodo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const autoLoginRef = useRef(false);

  // ═══ AUTO-LOGIN: detecta ?nit=X&code=Y y autentica automáticamente ═══
  useEffect(() => {
    const nitParam = searchParams.get('nit');
    const codeParam = searchParams.get('code');
    if (nitParam && codeParam && !autoLoginRef.current) {
      autoLoginRef.current = true;
      setNit(nitParam);
      setCodigoPortal(codeParam);
      // Trigger login after a short delay to ensure state is set
      setTimeout(() => {
        const nitClean = nitParam.replace(/[^0-9]/g, '');
        if (nitClean && codeParam.trim()) {
          setLoading(true);
          (async () => {
            try {
              const { value: companyData } = await d1Get('siso_companies_shared');
              const shared = Array.isArray(companyData) ? companyData : [];
              let company = shared.find(c => (c.nit||'').replace(/[^0-9]/g,'') === nitClean);
              if (!company && companies?.length) {
                company = companies.find(c => (c.nit||'').replace(/[^0-9]/g,'') === nitClean);
              }
              if (!company) { setError('Empresa no encontrada. Verifique el NIT.'); setLoading(false); return; }
              if (company.portalCode !== codeParam.trim() && company.codigoPortal !== codeParam.trim()) {
                setError('Código de portal incorrecto.'); setLoading(false); return;
              }
              setAuthenticated(company);
              const { value: ats } = await d1Get(`siso_portal_empresa_atenciones_${nitClean}`);
              setAtenciones(Array.isArray(ats) ? ats : []);
              const { value: docs } = await d1Get(`siso_portal_empresa_docs_${nitClean}`);
              const d = Array.isArray(docs) ? docs : [];
              if (d.length > 0) setPeriodo(d[d.length-1].periodo||'');
            } catch(e) { setError('Error: '+(e.message||'desconocido')); }
            finally { setLoading(false); }
          })();
        }
      }, 100);
    }
  }, [searchParams, companies]);

  const handleLogin = useCallback(async () => {
    const nitClean = nit.replace(/[^0-9]/g, '');
    if (!nitClean || nitClean.length < 3) { setError('Ingrese un NIT válido'); return; }
    if (!codigoPortal.trim()) { setError('Ingrese el código del portal'); return; }
    setLoading(true); setError('');

    try {
      const { value: companyData } = await d1Get('siso_companies_shared');
      const shared = Array.isArray(companyData) ? companyData : [];
      let company = shared.find(c => (c.nit||'').replace(/[^0-9]/g,'') === nitClean);
      if (!company && companies?.length) {
        company = companies.find(c => (c.nit||'').replace(/[^0-9]/g,'') === nitClean);
      }
      if (!company) { setError('Empresa no encontrada. Verifique el NIT.'); setLoading(false); return; }
      if (company.portalCode !== codigoPortal.trim() && company.codigoPortal !== codigoPortal.trim()) {
        setError('Código de portal incorrecto.'); setLoading(false); return;
      }
      setAuthenticated(company);
      const { value: ats } = await d1Get(`siso_portal_empresa_atenciones_${nitClean}`);
      setAtenciones(Array.isArray(ats) ? ats : []);
      const { value: docs } = await d1Get(`siso_portal_empresa_docs_${nitClean}`);
      const d = Array.isArray(docs) ? docs : [];
      if (d.length > 0 && !periodo) setPeriodo(d[d.length-1].periodo||'');
    } catch(e) { setError('Error: '+(e.message||'desconocido')); }
    finally { setLoading(false); }
  }, [nit, codigoPortal, companies]);

  const filtered = periodo ? atenciones.filter(a=>a.periodo===periodo||a.periodo?.startsWith(periodo)) : atenciones;

  const handleZIP = useCallback(async () => {
    if (!filtered.length) { alert('No hay atenciones'); return; }
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder(`atenciones_${periodo||'todas'}`);
      filtered.forEach((a,i) => {
        folder.file(`${a.docNumero||i}_${a.nombres||'paciente'}.html`,
          `<html><body><h1>Certificado</h1><p>Nombre: ${a.nombres||'--'}</p><p>Doc: ${a.docNumero||'--'}</p><p>Concepto: ${a.conceptoAptitud||'--'}</p><p>Código: ${a.codigoVerificacion||'--'}</p><p>Fecha: ${a.fechaExamen||'--'}</p></body></html>`);
      });
      const blob = await zip.generateAsync({type:'blob'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url;
      a.download=`portal_empresa_${periodo||'todas'}_${filtered.length}atenciones.zip`; a.click();
      URL.revokeObjectURL(url);
    } catch(e) { alert('Error ZIP: '+e.message); }
  }, [filtered, periodo]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin"/></div>;

  if (!authenticated) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="text-center"><Lock className="w-10 h-10 text-blue-600 mx-auto mb-2"/><h2 className="text-lg font-black text-gray-800">Portal Empresa</h2><p className="text-xs text-gray-500">Acceda a las evaluaciones de sus trabajadores</p></div>
        {error&&<div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">{error}</div>}
        <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">NIT de la Empresa</label><input value={nit} onChange={e=>setNit(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="Ej: 900123456-7" className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none" autoFocus/></div>
        <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Código de Acceso</label><input type="password" value={codigoPortal} onChange={e=>setCodigoPortal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="Código entregado por el administrador" className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"/></div>
        <button onClick={handleLogin} disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg">{loading?<Loader2 className="w-4 h-4 animate-spin mx-auto"/>:'Acceder al Portal'}</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><Building2 className="w-6 h-6 text-orange-600"/><div><h1 className="text-2xl font-bold text-gray-800">{authenticated.nombre}</h1><p className="text-xs text-gray-500">NIT: {authenticated.nit} · {filtered.length} atenciones</p></div></div>
        <div className="flex items-center gap-3">
          <select value={periodo} onChange={e=>setPeriodo(e.target.value)} className="p-2 border border-gray-200 rounded-lg text-xs font-bold"><option value="">Todos los períodos</option>{[...new Set(atenciones.map(a=>a.periodo).filter(Boolean))].sort().reverse().map(p=><option key={p} value={p}>{p}</option>)}</select>
          <button onClick={handleZIP} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700"><Download className="w-4 h-4"/> Descargar ZIP</button>
          <button onClick={()=>setAuthenticated(null)} className="text-xs text-gray-500 hover:text-gray-700 font-bold">← Cerrar sesión</button>
        </div>
      </div>
      <CompanyPortal company={authenticated} patients={filtered}/>
    </div>
  );
}