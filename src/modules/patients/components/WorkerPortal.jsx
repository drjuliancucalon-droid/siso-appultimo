// src/modules/patients/components/WorkerPortal.jsx — SPRINT 5
// Conectado a D1: búsqueda por cédula vía siso_portal_doc_<cc>
// y por código vía siso_portal_<code> + siso_portal_CV-<code>
import React, { useState } from 'react';
import { Shield, Search, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { d1Get } from '../../../lib/d1Client';
import { CertificateView } from '../../clinical/components/CertificateView';

export const WorkerPortal = () => {
  const [codigo, setCodigo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const buscar = async () => {
    const q = codigo.trim();
    if (!q) { setError('Ingrese su código de verificación o número de cédula'); return; }
    setCargando(true); setError(''); setResultados([]); setSelected(null);

    try {
      const results = [];
      const isCedula = /^\d{5,15}$/.test(q);
      if (isCedula) {
        const { value } = await d1Get(`siso_portal_doc_${q}`);
        if (value) results.push(value);
        // Fallback localStorage
        try {
          const raw = localStorage.getItem('siso_atenciones_cerradas');
          if (raw) {
            const all = JSON.parse(raw);
            (Array.isArray(all) ? all : []).filter(a => (a.docNumero||'').replace(/\s/g,'')===q).forEach(m => results.push(m));
          }
        } catch {}
      } else {
        const qUp = q.toUpperCase();
        const { value: v1 } = await d1Get(`siso_portal_${qUp}`);
        if (v1) results.push(v1);
        const { value: v2 } = await d1Get(`siso_portal_CV-${qUp}`);
        if (v2 && !results.some(r=>r.codigoVerificacion===v2.codigoVerificacion)) results.push(v2);
        if (results.length===0) {
          try {
            const raw = localStorage.getItem('siso_pacientes');
            if (raw) {
              const match = (JSON.parse(raw)||[]).find(p=>(p.codigoVerificacion||p.codigo||'').toUpperCase()===qUp);
              if (match) results.push(match);
            }
          } catch {}
        }
      }
      if (results.length===0) setError(isCedula?'No se encontraron evaluaciones con ese número de cédula.':'No se encontraron resultados con ese código.');
      else { setResultados(results); if(results.length===1) setSelected(results[0]); }
    } catch(e) { setError('Error de conexión: '+(e.message||'desconocido')); }
    finally { setCargando(false); }
  };

  const conceptoColor = (c) => {
    const cl = (c||'').toLowerCase();
    if (cl.includes('apto sin')||cl==='apto') return 'bg-green-100 text-green-800 border-green-300';
    if (cl.includes('apto con')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (cl.includes('no apto')||cl.includes('aplazado')) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  if (selected) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button onClick={()=>setSelected(null)} className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-teal-700">← Volver a resultados</button>
      <CertificateView data={selected} activeDoctorData={selected._doctorData||{nombre:selected.medicoNombre||'Médico Ocupacional'}} activeSignature={null} />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center"><Shield className="w-12 h-12 text-teal-600 mx-auto mb-3"/><h2 className="text-xl font-black text-gray-800">Portal del Trabajador</h2><p className="text-sm text-gray-500 mt-1">Consulte los resultados de su examen médico ocupacional</p><p className="text-xs text-gray-400 mt-1">No requiere inicio de sesión · Res. 1552/2013</p></div>
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Código de verificación o número de cédula</label>
        <div className="flex gap-2">
          <input type="text" value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase().trim())} onKeyDown={e=>e.key==='Enter'&&buscar()} placeholder="Ej: SISO-2025-XXXX o 1234567890" className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none" autoFocus/>
          <button onClick={buscar} disabled={cargando||!codigo.trim()} className="flex items-center gap-2 px-5 py-3 bg-teal-700 text-white rounded-lg font-bold text-sm hover:bg-teal-800 disabled:opacity-50">{cargando?<span className="animate-spin">⏳</span>:<Search className="w-4 h-4"/>}Buscar</button>
        </div>
      </div>
      {error&&<div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/><p className="text-sm text-red-700">{error}</p></div>}
      {resultados.length>1&&!selected&&<div className="space-y-3"><h3 className="text-sm font-black text-gray-700">{resultados.length} evaluaciones encontradas</h3>{resultados.map((r,i)=><button key={i} onClick={()=>setSelected(r)} className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-sm transition-all"><div className="flex justify-between items-start"><div><p className="font-bold text-sm text-gray-800">{r.nombres}</p><p className="text-xs text-gray-500">{r.docTipo||'CC'} {r.docNumero}</p><p className="text-xs text-gray-500">{r.empresaNombre} · {r.cargo}</p></div><div className="text-right"><span className={`inline-block px-2 py-1 text-xs font-bold rounded-full border ${conceptoColor(r.conceptoAptitud)}`}>{r.conceptoAptitud||'Pendiente'}</span><p className="text-[10px] text-gray-400 mt-1">{r.fechaExamen}</p></div></div><div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400"><FileText className="w-3 h-3"/><span className="font-mono">{r.codigoVerificacion}</span></div></button>)}</div>}
    </div>
  );
};

export default WorkerPortal;