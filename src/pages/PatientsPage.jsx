// src/pages/PatientsPage.jsx — SPRINT 6: Conectado a D1 con anti-duplicados
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientList } from '../modules/patients/components/PatientList';
import { useAuthStore } from '../stores/authStore';
import { d1Get, d1WriteArrayMerge } from '../lib/d1Client';
import { Users, Loader2, Cloud, HardDrive, Plus, AlertCircle } from 'lucide-react';

export default function PatientsPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore.getState().currentUser;
  const userId = currentUser?.user || 'drcucalon';

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('local');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [newPatient, setNewPatient] = useState({
    nombres: '', docNumero: '', docTipo: 'CC', empresaNombre: '', cargo: '',
    tipoExamen: 'PERIODICO', fechaExamen: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let list = [];
      try { const { value: v } = await d1Get(`siso_db_patients_${userId}`); if (Array.isArray(v) && v.length > 0) { list = v; if (!cancelled) setSource('d1'); } } catch {}
      if (list.length === 0 && !cancelled) {
        try { const { value: v } = await d1Get(`siso_patients_${userId}`); if (Array.isArray(v) && v.length > 0) { list = v; if (!cancelled) setSource('d1-fallback'); } } catch {}
      }
      if (list.length === 0 && !cancelled) {
        try { const raw = localStorage.getItem('siso_pacientes'); if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) list = p; } } catch {}
        if (!cancelled) setSource('local');
      }
      if (!cancelled) { setPatients(list); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const handleCreatePatient = useCallback(async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newPatient.nombres.trim() || !newPatient.docNumero.trim()) { setCreateError('Nombre y documento son obligatorios'); return; }
    const docClean = newPatient.docNumero.trim();
    if (patients.some(p => (p.docNumero||'').replace(/\s/g,'')===docClean)) { setCreateError('Ya existe un paciente con ese número de documento'); return; }
    setCreating(true);
    try {
      const paciente = { id: `pac_${Date.now()}`, nombres: newPatient.nombres.trim(), docNumero: docClean, docTipo: newPatient.docTipo||'CC', empresaNombre: newPatient.empresaNombre?.trim()||'', cargo: newPatient.cargo?.trim()||'', tipoExamen: newPatient.tipoExamen||'PERIODICO', fechaExamen: newPatient.fechaExamen||new Date().toISOString().split('T')[0], fechaRegistro: new Date().toISOString(), _medicoId: userId };
      await d1WriteArrayMerge(`siso_db_patients_${userId}`, [paciente], 'docNumero');
      setPatients(prev => [paciente, ...prev]);
      setNewPatient({ nombres:'', docNumero:'', docTipo:'CC', empresaNombre:'', cargo:'', tipoExamen:'PERIODICO', fechaExamen: new Date().toISOString().split('T')[0] });
      setShowCreateForm(false); setSource('d1');
    } catch(err) { setCreateError('Error: '+(err.message||'desconocido')); }
    finally { setCreating(false); }
  }, [newPatient, patients, userId]);

  const handleSelectPatient = (p) => { if (p?.docNumero) navigate(`/patients`); };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><Users className="w-6 h-6 text-emerald-600"/><h1 className="text-2xl font-bold text-gray-800">Pacientes</h1>{!loading&&<span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{patients.length} registros</span>}</div>
        <div className="flex items-center gap-3">
          {!loading&&<div className="flex items-center gap-1 text-xs text-gray-400">{source==='d1'||source==='d1-fallback'?<Cloud className="w-3 h-3 text-emerald-500"/>:<HardDrive className="w-3 h-3"/>}{source==='d1'?'D1':source==='d1-fallback'?'D1 (legacy)':'Local'}</div>}
          <button onClick={()=>setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"><Plus className="w-4 h-4"/>{showCreateForm?'Cancelar':'Nuevo Paciente'}</button>
        </div>
      </div>
      {showCreateForm&&(
        <div className="mb-6 bg-white border border-emerald-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-black text-emerald-800 mb-4">Crear Nuevo Paciente</h3>
          {createError&&<div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs border border-red-100"><AlertCircle className="w-3.5 h-3.5"/>{createError}</div>}
          <form onSubmit={handleCreatePatient} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><label className="block text-[10px] font-bold text-gray-600 mb-0.5">Nombres *</label><input value={newPatient.nombres} onChange={e=>setNewPatient(p=>({...p,nombres:e.target.value}))} className="w-full p-2 border rounded-lg text-sm" placeholder="Nombres y apellidos"/></div>
            <div><label className="block text-[10px] font-bold text-gray-600 mb-0.5">Documento *</label><div className="flex gap-1"><select value={newPatient.docTipo} onChange={e=>setNewPatient(p=>({...p,docTipo:e.target.value}))} className="w-20 p-2 border rounded-lg text-sm"><option>CC</option><option>CE</option><option>TI</option><option>Pasaporte</option></select><input value={newPatient.docNumero} onChange={e=>setNewPatient(p=>({...p,docNumero:e.target.value}))} className="flex-1 p-2 border rounded-lg text-sm" placeholder="Número"/></div></div>
            <div><label className="block text-[10px] font-bold text-gray-600 mb-0.5">Empresa</label><input value={newPatient.empresaNombre} onChange={e=>setNewPatient(p=>({...p,empresaNombre:e.target.value}))} className="w-full p-2 border rounded-lg text-sm" placeholder="Nombre empresa"/></div>
            <div><label className="block text-[10px] font-bold text-gray-600 mb-0.5">Cargo</label><input value={newPatient.cargo} onChange={e=>setNewPatient(p=>({...p,cargo:e.target.value}))} className="w-full p-2 border rounded-lg text-sm" placeholder="Cargo"/></div>
            <div><label className="block text-[10px] font-bold text-gray-600 mb-0.5">Tipo Examen</label><select value={newPatient.tipoExamen} onChange={e=>setNewPatient(p=>({...p,tipoExamen:e.target.value}))} className="w-full p-2 border rounded-lg text-sm"><option>INGRESO</option><option>PERIODICO</option><option>RETIRO</option><option>POST-INCAPACIDAD</option><option>SEGUIMIENTO</option></select></div>
            <div className="flex items-end"><button type="submit" disabled={creating} className="w-full p-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">{creating?'Creando...':'Crear Paciente'}</button></div>
          </form>
        </div>
      )}
      {loading?<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin"/><span className="ml-3 text-gray-500">Cargando pacientes...</span></div>:<PatientList onSelect={handleSelectPatient} pacientes={patients}/>}
    </div>
  );
}