// src/pages/Agenda.jsx
// Agenda completa — sala de espera, citas del día, nueva cita, navegación por fecha, autocomplete paciente
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Clock, Plus, Search, ChevronLeft, ChevronRight, X, Users, CheckCircle2 } from 'lucide-react';
import { _isAdmin, _isAdminOrEmpresa, _canUse, _secretariaPuede } from '../shared/data/planConfig.js';
import { PlanGate } from '../shared/ui/PlanGate.jsx';

export default function Agenda({
  currentUser, usersList = [], patientsList = [], companies = [],
  agendados = [], setAgendados,
  agendaForm, setAgendaForm,
  agendaTab, setAgendaTab,
  agendaFecha, setAgendaFecha,
  agendaSuggs = [], setAgendaSuggs,
  goBack, goTo, showAlert,
  handleNewOccupHistory, handleNewGeneralHistory,
  openPatient, setData, setDataType, setActiveTab, setView,
  atencionesCerradas = [], setAtencionesCerradas,
  hcChoiceAgenda, setHcChoiceAgenda,
  medicoTurnoActivo,
  _syncAgenda,
}) {
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // ── PLAN GATE ──
  if (!_canUse("agenda", currentUser)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <PlanGate feature="agenda" requiredPlan="starter" currentUser={currentUser} />
        <div className="mt-4 text-center"><button onClick={() => goBack()} className="text-sm text-gray-500 hover:text-gray-700">← Volver</button></div>
      </div>
    );
  }

  // ── SECRETARIA GATE ──
  if (currentUser?.role === "secretaria" && !_secretariaPuede("agenda", currentUser, usersList)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 space-y-3">
          <div className="text-5xl">🔐</div>
          <p className="font-black text-amber-800 text-xl">Módulo restringido</p>
          <p className="text-amber-600 text-xs">Solicita permiso "Agenda" al administrador.</p>
          <button onClick={() => goBack()} className="mt-3 bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-bold">← Volver</button>
        </div>
      </div>
    );
  }

  const hoy = new Date().toISOString().split("T")[0];
  const fechaActual = agendaFecha || hoy;

  const agendadosHoy = useMemo(() => agendados.filter(a => a.fecha === fechaActual).sort((a, b) => (a.hora || "").localeCompare(b.hora || "")), [agendados, fechaActual]);
  const enEspera = agendadosHoy.filter(a => a.estado === "espera");
  const atendiendo = agendadosHoy.filter(a => a.estado === "atendiendo");
  const atendidos = agendadosHoy.filter(a => a.estado === "atendido");

  // Autocomplete pacientes
  const handleSearch = useCallback((q) => {
    if (!q || q.length < 2) { if (setAgendaSuggs) setAgendaSuggs([]); return; }
    const qLow = q.toLowerCase();
    const results = patientsList.filter(p => (p.nombres || "").toLowerCase().includes(qLow) || (p.docNumero || "").includes(q)).slice(0, 8);
    if (setAgendaSuggs) setAgendaSuggs(results);
  }, [patientsList, setAgendaSuggs]);

  const handleCallNext = useCallback(() => {
    if (enEspera.length === 0) { showAlert("No hay pacientes en espera."); return; }
    const next = enEspera[0];
    const updated = agendados.map(a => a.id === next.id ? { ...a, estado: "atendiendo", horaInicio: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":") } : a);
    setAgendados(updated); if (_syncAgenda) _syncAgenda(updated);
  }, [enEspera, agendados, setAgendados, _syncAgenda, showAlert]);

  const handleComplete = useCallback((id) => {
    const horaFin = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":");
    const updated = agendados.map(a => a.id === id ? { ...a, estado: "atendido", horaFin } : a);
    setAgendados(updated); if (_syncAgenda) _syncAgenda(updated);
    // Register in atenciones cerradas
    const pac = agendados.find(a => a.id === id);
    if (pac && setAtencionesCerradas) {
      setAtencionesCerradas(prev => [...prev, { id: "at_" + Date.now(), nombre: pac.nombre, documento: pac.doc, fecha: fechaActual, horaFin, tipo: pac.tipo || "ocupacional" }]);
    }
  }, [agendados, setAgendados, _syncAgenda, setAtencionesCerradas, fechaActual]);

  const handleAddAppointment = useCallback(() => {
    if (!agendaForm.nombre) { showAlert("Ingrese el nombre del paciente."); return; }
    if (!agendaForm.hora) { showAlert("Ingrese la hora."); return; }
    const newAppt = {
      id: "ag_" + Date.now(), nombre: agendaForm.nombre, doc: agendaForm.doc || "",
      tipo: agendaForm.tipo || "ocupacional", hora: agendaForm.hora,
      fecha: agendaForm.fecha || hoy, estado: "espera",
      empresa: agendaForm.empresa || "", cargo: agendaForm.cargo || "",
      medicoId: agendaForm.medicoId || currentUser?.user,
      notas: agendaForm.notas || "",
    };
    const updated = [...agendados, newAppt];
    setAgendados(updated); if (_syncAgenda) _syncAgenda(updated);
    setAgendaForm({ nombre: "", doc: "", tipo: "ocupacional", hora: "", fecha: hoy, empresa: "", cargo: "", medicoId: currentUser?.user || "", notas: "" });
    if (setAgendaSuggs) setAgendaSuggs([]);
    showAlert("✅ Cita agendada.");
    setAgendaTab("hoy");
  }, [agendaForm, agendados, setAgendados, _syncAgenda, setAgendaForm, setAgendaSuggs, hoy, currentUser, showAlert, setAgendaTab]);

  const navegarFecha = (dir) => {
    const d = new Date(fechaActual); d.setDate(d.getDate() + dir);
    if (setAgendaFecha) setAgendaFecha(d.toISOString().split("T")[0]);
  };

  const statusBadge = (estado) => {
    const map = { espera: { bg: "bg-amber-100", text: "text-amber-700", label: "⏳ En espera" }, atendiendo: { bg: "bg-blue-100", text: "text-blue-700", label: "🔵 Atendiendo" }, atendido: { bg: "bg-emerald-100", text: "text-emerald-700", label: "✅ Atendido" } };
    const s = map[estado] || map.espera;
    return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-5 text-white mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => goBack()} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold">← Volver</button>
            <div>
              <h2 className="text-lg font-black">🗓️ Agenda / Sala de Espera</h2>
              <p className="text-blue-200 text-xs mt-0.5">{fechaActual === hoy ? "Hoy" : fechaActual} · {agendadosHoy.length} pacientes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAgendaTab("hoy")} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${agendaTab === "hoy" ? "bg-white text-blue-700" : "bg-blue-800 text-blue-200"}`}>📋 Hoy ({agendadosHoy.length})</button>
            <button onClick={() => setAgendaTab("nueva")} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${agendaTab === "nueva" ? "bg-white text-blue-700" : "bg-blue-800 text-blue-200"}`}>➕ Nueva cita</button>
            <button onClick={() => setAgendaTab("proximas")} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${agendaTab === "proximas" ? "bg-white text-blue-700" : "bg-blue-800 text-blue-200"}`}>📅 Próximas</button>
          </div>
        </div>
      </div>

      {/* Navegación fecha */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button onClick={() => navegarFecha(-1)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><ChevronLeft className="w-4 h-4" /></button>
        <input type="date" value={fechaActual} onChange={e => setAgendaFecha && setAgendaFecha(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm font-bold" />
        <button onClick={() => navegarFecha(1)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><ChevronRight className="w-4 h-4" /></button>
        <button onClick={() => setAgendaFecha && setAgendaFecha(hoy)} className="text-xs font-bold text-blue-600 hover:text-blue-800">Hoy</button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-amber-700">{enEspera.length}</p>
          <p className="text-[10px] font-bold text-amber-600">En espera</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-blue-700">{atendiendo.length}</p>
          <p className="text-[10px] font-bold text-blue-600">Atendiendo</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-700">{atendidos.length}</p>
          <p className="text-[10px] font-bold text-emerald-600">Atendidos</p>
        </div>
      </div>

      {/* Botón llamar siguiente */}
      {enEspera.length > 0 && agendaTab === "hoy" && (
        <button onClick={handleCallNext} className="w-full mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition">
          📢 Llamar siguiente: {enEspera[0].nombre} ({enEspera[0].hora})
        </button>
      )}

      {/* TAB: HOY */}
      {agendaTab === "hoy" && (
        <div className="space-y-2">
          {agendadosHoy.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-bold text-gray-600">Sin citas para {fechaActual === hoy ? "hoy" : fechaActual}</p>
              <button onClick={() => setAgendaTab("nueva")} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">➕ Agendar cita</button>
            </div>
          ) : agendadosHoy.map(a => (
            <div key={a.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${a.estado === "atendiendo" ? "border-blue-400 ring-2 ring-blue-100" : a.estado === "atendido" ? "border-emerald-200" : "border-gray-100"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm text-gray-800">{a.nombre}</p>
                    {statusBadge(a.estado)}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${a.tipo === "general" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>{a.tipo === "general" ? "General" : "Ocupacional"}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">🕐 {a.hora} · {a.doc || "Sin doc"} · {a.empresa || "Particular"} · {a.cargo || ""}</p>
                  {a.horaInicio && <p className="text-[10px] text-blue-600 font-bold mt-0.5">Inicio: {a.horaInicio}{a.horaFin ? ` → Fin: ${a.horaFin}` : ""}</p>}
                  {a.notas && <p className="text-[10px] text-gray-400 mt-0.5">📝 {a.notas}</p>}
                </div>
                <div className="flex gap-1.5">
                  {a.estado === "espera" && (
                    <button onClick={() => {
                      const updated = agendados.map(x => x.id === a.id ? { ...x, estado: "atendiendo", horaInicio: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":") } : x);
                      setAgendados(updated); if (_syncAgenda) _syncAgenda(updated);
                    }} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700">▶ Llamar</button>
                  )}
                  {a.estado === "atendiendo" && (
                    <>
                      <button onClick={() => handleComplete(a.id)} className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg hover:bg-emerald-700">✅ Finalizar</button>
                      <button onClick={() => {
                        // Open HC for this patient
                        if (setHcChoiceAgenda) setHcChoiceAgenda(a);
                      }} className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:bg-indigo-700">📋 Crear HC</button>
                    </>
                  )}
                  <button onClick={() => {
                    const updated = agendados.filter(x => x.id !== a.id);
                    setAgendados(updated); if (_syncAgenda) _syncAgenda(updated);
                  }} className="px-2 py-1.5 bg-red-100 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-200">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: NUEVA CITA */}
      {agendaTab === "nueva" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="text-sm font-black text-gray-800">Nueva cita</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 relative">
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Paciente *</label>
              <input value={agendaForm.nombre} onChange={e => { setAgendaForm(p => ({ ...p, nombre: e.target.value })); handleSearch(e.target.value); }}
                className="w-full p-2 border rounded-lg text-sm" placeholder="Nombre del paciente (autocomplete)" />
              {agendaSuggs.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                  {agendaSuggs.map(p => (
                    <button key={p.id} onClick={() => {
                      setAgendaForm(prev => ({ ...prev, nombre: p.nombres, doc: p.docNumero, empresa: p.empresaNombre || "", cargo: p.cargo || "" }));
                      if (setAgendaSuggs) setAgendaSuggs([]);
                    }} className="w-full text-left px-3 py-2 hover:bg-teal-50 text-xs border-b border-gray-50">
                      <p className="font-bold text-gray-800">{p.nombres}</p>
                      <p className="text-[10px] text-gray-500">{p.docNumero} · {p.empresaNombre || "Particular"}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Documento</label>
              <input value={agendaForm.doc} onChange={e => setAgendaForm(p => ({ ...p, doc: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" placeholder="CC / CE" /></div>
            <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Tipo examen</label>
              <select value={agendaForm.tipo} onChange={e => setAgendaForm(p => ({ ...p, tipo: e.target.value }))} className="w-full p-2 border rounded-lg text-sm">
                <option value="ocupacional">Ocupacional</option><option value="general">General</option>
              </select></div>
            <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Fecha *</label>
              <input type="date" value={agendaForm.fecha || hoy} onChange={e => setAgendaForm(p => ({ ...p, fecha: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Hora *</label>
              <input type="time" value={agendaForm.hora} onChange={e => setAgendaForm(p => ({ ...p, hora: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Empresa</label>
              <select value={agendaForm.empresa} onChange={e => setAgendaForm(p => ({ ...p, empresa: e.target.value }))} className="w-full p-2 border rounded-lg text-sm">
                <option value="">Particular</option>
                {companies.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select></div>
            <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Cargo</label>
              <input value={agendaForm.cargo} onChange={e => setAgendaForm(p => ({ ...p, cargo: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" /></div>
            <div className="col-span-2"><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Notas</label>
              <input value={agendaForm.notas} onChange={e => setAgendaForm(p => ({ ...p, notas: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" placeholder="Observaciones..." /></div>
          </div>
          <button onClick={handleAddAppointment} disabled={!agendaForm.nombre || !agendaForm.hora}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black rounded-xl">🗓️ Agendar cita</button>
        </div>
      )}

      {/* TAB: PRÓXIMAS */}
      {agendaTab === "proximas" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-blue-50"><p className="text-sm font-black text-blue-800">Próximas citas</p></div>
          {agendados.filter(a => a.fecha >= hoy && a.estado !== "atendido").sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)).length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-sm font-bold">Sin citas pendientes</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {agendados.filter(a => a.fecha >= hoy && a.estado !== "atendido").sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)).map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div>
                    <p className="text-xs font-bold text-gray-800">{a.nombre} <span className="text-gray-400"> · {a.doc}</span></p>
                    <p className="text-[10px] text-gray-500">📅 {a.fecha} {a.hora} · {a.empresa || "Particular"} · {a.tipo}</p>
                  </div>
                  {statusBadge(a.estado)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HC Choice modal */}
      {hcChoiceAgenda && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <p className="font-black text-gray-800">Crear HC para: {hcChoiceAgenda.nombre}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { if (handleNewOccupHistory) handleNewOccupHistory(hcChoiceAgenda); setHcChoiceAgenda(null); }}
                className="bg-emerald-600 text-white py-3 rounded-xl font-black text-sm">🩺 Ocupacional</button>
              <button onClick={() => { if (handleNewGeneralHistory) handleNewGeneralHistory(hcChoiceAgenda); setHcChoiceAgenda(null); }}
                className="bg-blue-600 text-white py-3 rounded-xl font-black text-sm">❤ General</button>
            </div>
            <button onClick={() => setHcChoiceAgenda(null)} className="w-full text-gray-500 text-sm font-bold">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
