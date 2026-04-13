// src/pages/Caja.jsx
// Módulo Financiero / Caja — movimientos diarios, filtros, balance, por médico, cuentas pendientes
import React, { useState, useMemo, useCallback } from 'react';
import { LogOut, Plus, Trash2, Printer } from 'lucide-react';
import { _isAdmin, _isAdminOrEmpresa, _secretariaPuede } from '../shared/data/planConfig.js';

export default function Caja({
  currentUser, usersList = [], patientsList = [], companies = [],
  cajaMovimientos = [], setCajaMovimientos,
  cajaForm, setCajaForm,
  cajaTab, setCajaTab,
  cajaFiltroPeriodo, setCajaFiltroPeriodo,
  cajaFiltroDesde, setCajaFiltroDesde,
  cajaFiltroHasta, setCajaFiltroHasta,
  savedBillsList = [], setSavedBillsList,
  porcentajeMedico = 100,
  cajaMedicoPeriodo, setCajaMedicoPeriodo,
  goBack, showAlert,
  saveCajaDebounced,
  _syncCaja,
}) {
  const [showForm, setShowForm] = useState(false);

  // ── SECRETARIA GATE ──
  if (currentUser?.role === "secretaria" && !_secretariaPuede("caja", currentUser, usersList)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 space-y-3">
          <div className="text-5xl">🔐</div>
          <p className="font-black text-amber-800 text-xl">Módulo restringido</p>
          <p className="text-amber-600 text-xs">Solicita permiso "Módulo Financiero" al administrador.</p>
          <button onClick={() => goBack()} className="mt-3 bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-bold">← Volver</button>
        </div>
      </div>
    );
  }

  const hoy = new Date().toISOString().split("T")[0];
  const inicioSemana = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split("T")[0]; })();
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  // Filter movements by period
  const movsFiltrados = useMemo(() => {
    let desde = "", hasta = "";
    if (cajaFiltroPeriodo === "hoy") { desde = hoy; hasta = hoy; }
    else if (cajaFiltroPeriodo === "semana") { desde = inicioSemana; hasta = hoy; }
    else if (cajaFiltroPeriodo === "mes") { desde = inicioMes; hasta = hoy; }
    else if (cajaFiltroPeriodo === "custom") { desde = cajaFiltroDesde; hasta = cajaFiltroHasta || hoy; }
    else { return cajaMovimientos; }
    return cajaMovimientos.filter(m => m.fecha >= desde && m.fecha <= hasta);
  }, [cajaMovimientos, cajaFiltroPeriodo, hoy, inicioSemana, inicioMes, cajaFiltroDesde, cajaFiltroHasta]);

  const totalIngresos = useMemo(() => movsFiltrados.filter(m => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto || 0), 0), [movsFiltrados]);
  const totalEgresos = useMemo(() => movsFiltrados.filter(m => m.tipo === "egreso").reduce((s, m) => s + Number(m.monto || 0), 0), [movsFiltrados]);
  const balance = totalIngresos - totalEgresos;

  const categorias = ["Examen ocupacional", "Consulta general", "Propuesta / Informe", "Paraclínico", "Insumos", "Arriendo", "Servicios", "Nómina / Honorarios", "Impuestos", "Otro"];

  const handleAddMovimiento = useCallback(() => {
    if (!cajaForm.monto || !cajaForm.descripcion) { showAlert("Complete monto y descripción."); return; }
    const newMov = {
      id: "mov_" + Date.now(), tipo: cajaForm.tipo || "ingreso",
      monto: cajaForm.monto, descripcion: cajaForm.descripcion,
      categoria: cajaForm.categoria || "Otro",
      fecha: cajaForm.fecha || hoy, medicoId: cajaForm.medicoId || currentUser?.user,
      pacienteId: cajaForm.pacienteId || "", empresaId: cajaForm.empresaId || "",
      medio: cajaForm.medio || "efectivo",
    };
    const updated = [...cajaMovimientos, newMov];
    setCajaMovimientos(updated);
    if (saveCajaDebounced) saveCajaDebounced(updated);
    if (_syncCaja) _syncCaja(updated);
    setCajaForm({ tipo: "ingreso", monto: "", descripcion: "", categoria: "", fecha: hoy, medicoId: currentUser?.user || "", pacienteId: "", empresaId: "", medio: "efectivo" });
    setShowForm(false);
    showAlert("✅ Movimiento registrado.");
  }, [cajaForm, cajaMovimientos, setCajaMovimientos, saveCajaDebounced, _syncCaja, setCajaForm, hoy, currentUser, showAlert]);

  const handleDeleteMov = useCallback((id) => {
    const updated = cajaMovimientos.filter(m => m.id !== id);
    setCajaMovimientos(updated);
    if (saveCajaDebounced) saveCajaDebounced(updated);
  }, [cajaMovimientos, setCajaMovimientos, saveCajaDebounced]);

  // Cuentas pendientes
  const cuentasPendientes = useMemo(() => savedBillsList.filter(b => !b.pagada), [savedBillsList]);
  const totalPendiente = cuentasPendientes.reduce((s, b) => s + Number(b.amount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-black text-green-900 flex items-center gap-2">💰 Módulo Financiero</h2>
        <button onClick={() => goBack()} className="text-gray-500 font-bold text-sm flex items-center gap-1"><LogOut className="rotate-180 w-4 h-4" /> Volver</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex-wrap">
        {[{ k: "hoy", l: "📊 Movimientos" }, { k: "cuentas", l: `💳 Cuentas (${cuentasPendientes.length})` }, { k: "por_medico", l: "👨‍⚕️ Por médico" }, { k: "resumen", l: "📈 Resumen" }].map(t => (
          <button key={t.k} onClick={() => setCajaTab(t.k)} className={`flex-1 py-2 text-xs font-black rounded-lg transition ${cajaTab === t.k ? "bg-green-700 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{t.l}</button>
        ))}
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-[10px] font-black text-emerald-600 uppercase">Ingresos</p>
          <p className="text-2xl font-black text-emerald-700">$ {totalIngresos.toLocaleString("es-CO")}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-[10px] font-black text-red-600 uppercase">Egresos</p>
          <p className="text-2xl font-black text-red-700">$ {totalEgresos.toLocaleString("es-CO")}</p>
        </div>
        <div className={`border rounded-xl p-4 text-center ${balance >= 0 ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"}`}>
          <p className="text-[10px] font-black text-gray-600 uppercase">Balance</p>
          <p className={`text-2xl font-black ${balance >= 0 ? "text-blue-700" : "text-red-700"}`}>$ {balance.toLocaleString("es-CO")}</p>
        </div>
      </div>

      {/* Filtro de periodo */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {[{ k: "hoy", l: "Hoy" }, { k: "semana", l: "Semana" }, { k: "mes", l: "Mes" }, { k: "todo", l: "Todo" }, { k: "custom", l: "Rango" }].map(f => (
          <button key={f.k} onClick={() => setCajaFiltroPeriodo(f.k)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${cajaFiltroPeriodo === f.k ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f.l}</button>
        ))}
        {cajaFiltroPeriodo === "custom" && (
          <div className="flex gap-2 items-center">
            <input type="date" value={cajaFiltroDesde} onChange={e => setCajaFiltroDesde(e.target.value)} className="border rounded-lg px-2 py-1 text-xs" />
            <span className="text-xs text-gray-400">→</span>
            <input type="date" value={cajaFiltroHasta || hoy} onChange={e => setCajaFiltroHasta(e.target.value)} className="border rounded-lg px-2 py-1 text-xs" />
          </div>
        )}
      </div>

      {/* TAB: MOVIMIENTOS */}
      {cajaTab === "hoy" && (
        <div className="space-y-3">
          <button onClick={() => setShowForm(!showForm)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-green-700">
            <Plus className="w-4 h-4" /> {showForm ? "Cancelar" : "Nuevo movimiento"}
          </button>

          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Tipo</label>
                  <select value={cajaForm.tipo} onChange={e => setCajaForm(p => ({ ...p, tipo: e.target.value }))} className="w-full p-2 border rounded-lg text-sm">
                    <option value="ingreso">💰 Ingreso</option><option value="egreso">💸 Egreso</option>
                  </select></div>
                <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Monto *</label>
                  <input type="number" value={cajaForm.monto} onChange={e => setCajaForm(p => ({ ...p, monto: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" placeholder="$ 0" /></div>
                <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Categoría</label>
                  <select value={cajaForm.categoria} onChange={e => setCajaForm(p => ({ ...p, categoria: e.target.value }))} className="w-full p-2 border rounded-lg text-sm">
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Medio de pago</label>
                  <select value={cajaForm.medio} onChange={e => setCajaForm(p => ({ ...p, medio: e.target.value }))} className="w-full p-2 border rounded-lg text-sm">
                    {["efectivo", "transferencia", "nequi", "daviplata", "tarjeta", "cheque"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select></div>
                <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Fecha</label>
                  <input type="date" value={cajaForm.fecha || hoy} onChange={e => setCajaForm(p => ({ ...p, fecha: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Empresa (opcional)</label>
                  <select value={cajaForm.empresaId} onChange={e => setCajaForm(p => ({ ...p, empresaId: e.target.value }))} className="w-full p-2 border rounded-lg text-sm">
                    <option value="">Sin empresa</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select></div>
                <div className="col-span-2"><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Descripción *</label>
                  <input value={cajaForm.descripcion} onChange={e => setCajaForm(p => ({ ...p, descripcion: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" placeholder="Descripción del movimiento" /></div>
              </div>
              <button onClick={handleAddMovimiento} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-black">💾 Registrar movimiento</button>
            </div>
          )}

          {/* Lista de movimientos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-800 text-white">
                <tr>{["Fecha", "Tipo", "Descripción", "Categoría", "Medio", "Monto", ""].map(h => <th key={h} className="p-2 text-left font-black">{h}</th>)}</tr>
              </thead>
              <tbody>
                {movsFiltrados.sort((a, b) => b.fecha.localeCompare(a.fecha)).map((m, i) => (
                  <tr key={m.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-2 text-gray-600">{m.fecha}</td>
                    <td className="p-2"><span className={`font-black ${m.tipo === "ingreso" ? "text-emerald-600" : "text-red-600"}`}>{m.tipo === "ingreso" ? "💰" : "💸"} {m.tipo}</span></td>
                    <td className="p-2 text-gray-800 font-bold">{m.descripcion}</td>
                    <td className="p-2 text-gray-500">{m.categoria || "-"}</td>
                    <td className="p-2 text-gray-500">{m.medio || "-"}</td>
                    <td className={`p-2 font-black ${m.tipo === "ingreso" ? "text-emerald-700" : "text-red-700"}`}>
                      {m.tipo === "ingreso" ? "+" : "-"} ${Number(m.monto).toLocaleString("es-CO")}
                    </td>
                    <td className="p-2"><button onClick={() => handleDeleteMov(m.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
                {movsFiltrados.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-400">Sin movimientos para este periodo.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CUENTAS PENDIENTES */}
      {cajaTab === "cuentas" && (
        <div className="space-y-3">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-orange-800">💳 Total cuentas pendientes</p>
              <p className="text-2xl font-black text-orange-700">$ {totalPendiente.toLocaleString("es-CO")}</p>
            </div>
            <p className="text-sm font-black text-orange-600">{cuentasPendientes.length} cuentas</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-800 text-white">
                <tr>{["No.", "Cliente", "Fecha", "Valor", "Estado", "Acción"].map(h => <th key={h} className="p-2 text-left font-black">{h}</th>)}</tr>
              </thead>
              <tbody>
                {savedBillsList.map((b, i) => (
                  <tr key={b.id || i} className={`${b.pagada ? "bg-emerald-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="p-2 font-mono">{b.number || "--"}</td>
                    <td className="p-2 font-bold text-gray-800">{b.clientName || "--"}</td>
                    <td className="p-2 text-gray-600">{b.date || b.savedAt?.split("T")[0] || "--"}</td>
                    <td className="p-2 font-black text-gray-800">$ {Number(b.amount || 0).toLocaleString("es-CO")}</td>
                    <td className="p-2">{b.pagada ? <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">✅ Pagada</span> : <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black">⏳ Pendiente</span>}</td>
                    <td className="p-2">
                      {!b.pagada && (
                        <button onClick={() => {
                          const upd = savedBillsList.map(x => x.id === b.id ? { ...x, pagada: true, fechaPago: hoy } : x);
                          setSavedBillsList(upd); showAlert("✅ Marcada como pagada.");
                        }} className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-emerald-700">💰 Marcar pagada</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: POR MÉDICO */}
      {cajaTab === "por_medico" && (
        <div className="space-y-3">
          <div className="flex gap-2 mb-3">
            {[{ k: "mes", l: "Mes actual" }, { k: "semana", l: "Semana" }, { k: "todo", l: "Todo" }].map(p => (
              <button key={p.k} onClick={() => setCajaMedicoPeriodo && setCajaMedicoPeriodo(p.k)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg ${cajaMedicoPeriodo === p.k ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}>{p.l}</button>
            ))}
          </div>
          {(() => {
            const medActivos = usersList.filter(u => ["medico", "administrador", "super_admin", "admin_empresa"].includes(u.role) && u.activo !== false);
            let desde = "";
            if (cajaMedicoPeriodo === "mes") desde = inicioMes;
            else if (cajaMedicoPeriodo === "semana") desde = inicioSemana;
            const movsP = desde ? cajaMovimientos.filter(m => m.tipo === "ingreso" && m.fecha >= desde) : cajaMovimientos.filter(m => m.tipo === "ingreso");
            const totalP = movsP.reduce((s, m) => s + Number(m.monto || 0), 0);
            return (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-800 text-white">
                    <tr>{["Médico", "Atenciones", "Ingresos", "%", "Médico (%)", "Clínica (%)"].map(h => <th key={h} className="p-2 text-left font-black">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {medActivos.map((med, i) => {
                      const movsMed = movsP.filter(m => m.medicoId === med.user || (!m.medicoId && _isAdmin(med.role)));
                      const ingresosMed = movsMed.reduce((s, m) => s + Number(m.monto || 0), 0);
                      const pctMed = med.porcentajeHonorarios || porcentajeMedico;
                      const paraMedico = Math.round(ingresosMed * pctMed / 100);
                      const paraClinica = ingresosMed - paraMedico;
                      const pct = totalP > 0 ? ((ingresosMed / totalP) * 100).toFixed(1) : "0";
                      return (
                        <tr key={med.user} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-2 font-bold text-gray-800">{med.name || med.user}</td>
                          <td className="p-2 text-center">{movsMed.filter(m => m.pacienteId).length}</td>
                          <td className="p-2 font-black text-emerald-700">$ {ingresosMed.toLocaleString("es-CO")}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, Number(pct))}%` }} /></div>
                              <span className="text-[10px] font-black">{pct}%</span>
                            </div>
                          </td>
                          <td className="p-2 font-bold text-blue-700">$ {paraMedico.toLocaleString("es-CO")} ({pctMed}%)</td>
                          <td className="p-2 font-bold text-purple-700">$ {paraClinica.toLocaleString("es-CO")} ({100 - pctMed}%)</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB: RESUMEN */}
      {cajaTab === "resumen" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm font-black text-gray-800 mb-3">📊 Resumen por categoría</p>
            {(() => {
              const byCat = {};
              movsFiltrados.forEach(m => { const cat = m.categoria || "Otro"; if (!byCat[cat]) byCat[cat] = { ingresos: 0, egresos: 0 }; if (m.tipo === "ingreso") byCat[cat].ingresos += Number(m.monto || 0); else byCat[cat].egresos += Number(m.monto || 0); });
              return (
                <table className="w-full text-xs">
                  <thead className="bg-gray-100"><tr>{["Categoría", "Ingresos", "Egresos", "Neto"].map(h => <th key={h} className="p-2 text-left font-black">{h}</th>)}</tr></thead>
                  <tbody>
                    {Object.entries(byCat).map(([cat, v], i) => (
                      <tr key={cat} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-2 font-bold">{cat}</td>
                        <td className="p-2 text-emerald-700 font-black">$ {v.ingresos.toLocaleString("es-CO")}</td>
                        <td className="p-2 text-red-700 font-black">$ {v.egresos.toLocaleString("es-CO")}</td>
                        <td className={`p-2 font-black ${(v.ingresos - v.egresos) >= 0 ? "text-blue-700" : "text-red-700"}`}>$ {(v.ingresos - v.egresos).toLocaleString("es-CO")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm font-black text-gray-800 mb-3">📈 Distribución médico/clínica</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-[10px] font-black text-blue-600 uppercase">Para el Médico ({porcentajeMedico}%)</p>
                <p className="text-2xl font-black text-blue-700">$ {Math.round(totalIngresos * porcentajeMedico / 100).toLocaleString("es-CO")}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                <p className="text-[10px] font-black text-purple-600 uppercase">Para la Clínica ({100 - porcentajeMedico}%)</p>
                <p className="text-2xl font-black text-purple-700">$ {Math.round(totalIngresos * (100 - porcentajeMedico) / 100).toLocaleString("es-CO")}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
