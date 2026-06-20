// src/pages/ContabilidadPage.jsx
// PORTED FROM MONOLITH: ContabilidadV2.jsx (1448 lines)
// Cuentas de cobro V2 con consecutivo, estados, tarifas desde empresa, panel mensual, histórico
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from "react";
import {
  DollarSign, Plus, Calendar, CheckCircle2, Clock, AlertTriangle, X,
  Edit2, Trash2, FileText, Building2, Users, Search, Download,
  Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useBackendData } from "../hooks/useBackendData";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const fmtCOP = (n) => { const num = Number(n) || 0; return "$" + num.toLocaleString("es-CO"); };
const ymLabel = (ym) => { if (!ym) return "Sin periodo"; const [y, m] = ym.split("-"); return `${MESES[parseInt(m) - 1]} ${y}`; };
const yearMonth = (date) => { if (!date) return null; const m = String(date).match(/^(\d{4})-(\d{2})/); return m ? `${m[1]}-${m[2]}` : null; };
const todayISO = () => new Date().toISOString().slice(0, 10);
const nitNorm = (n) => (n || "").toString().replace(/[^0-9]/g, "");

const EMPTY_BILLING = { version: "v2", consecutivo: 0, cuentas: [], historial: [] };
const BILLING_KEY = "siso_billing_v2";

const lsRead = () => {
  try {
    const raw = localStorage.getItem(BILLING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.cuentas)) return { ...EMPTY_BILLING, ...parsed };
  } catch {}
  return null;
};
const lsWrite = (data) => {
  try { localStorage.setItem(BILLING_KEY, JSON.stringify(data)); return true; } catch { return false; }
};

const SUBTIPOS = ["PERIODICO", "INGRESO", "EGRESO", "POSTINCAPACIDAD", "SEGUIMIENTO", "PARTICULAR", "OTRO"];
const SUBTIPO_TARIFA_MAP = { "INGRESO":"tarifaIngreso", "PERIODICO":"tarifaPeriodico", "EGRESO":"tarifaEgreso", "PARTICULAR":"tarifaConsulta", "POSTINCAPACIDAD":"tarifaConsulta", "SEGUIMIENTO":"tarifaConsulta" };

const estadoVisuales = {
  pendiente: { label: "Pendiente", bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", icon: Clock },
  pagada:    { label: "Pagada",    bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300", icon: CheckCircle2 },
  vencida:   { label: "Vencida",   bg: "bg-red-100", text: "text-red-800", border: "border-red-300", icon: AlertTriangle },
  anulada:   { label: "Anulada",   bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300", icon: X },
};
const tipoVisual = (tipo) => tipo === "bloque_periodico"
  ? { label: "Bloque periódico", color: "bg-purple-100 text-purple-800 border-purple-300" }
  : { label: "Individual", color: "bg-blue-100 text-blue-800 border-blue-300" };

function imprimirCuenta(cuenta, doctorData, firma) {
  const w = window.open("", "_blank", "width=920,height=1150");
  if (!w) { alert("Permite ventanas emergentes para imprimir."); return; }
  const dd = doctorData || {};
  const trabajadoresHtml = (cuenta.trabajadores || []).map((t, i) =>
    `<tr><td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${i+1}</td>
     <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${(t.nombres || "")}</td>
     <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;font-family:monospace;">${(t.docNumero || "")}</td></tr>`
  ).join("");
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Cuenta de Cobro #${String(cuenta.consecutivo).padStart(3,"0")}</title>
<style>
  @page { size: letter portrait; margin: 14mm; }
  * { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color:#111; margin:0; padding:20px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #065f46; padding-bottom:12px; margin-bottom:20px; }
  .doctor-info { font-size:9pt; line-height:1.4; }
  .titulo { text-align:center; font-size:22pt; font-weight:900; letter-spacing:-1px; margin:20px 0; text-transform:uppercase; color:#065f46; }
  .info-row { display:flex; justify-content:space-between; margin-bottom:8px; font-size:11pt; }
  table { width:100%; border-collapse:collapse; margin:10px 0; }
  th { background:#065f46; color:white; padding:6px 8px; text-align:left; font-weight:bold; font-size:10pt;}
  td { padding:6px 8px; border-bottom:1px solid #e5e7eb; font-size:10pt;}
  .firma { margin-top:30px; border-top:1px solid #ccc; padding-top:8px; font-size:10pt; }
  .footer-nota { margin-top:10px; font-size:8pt; text-align:center; color:#888; }
</style></head><body>
<div class="header"><div class="doctor-info"><strong>${dd.nombre || "Dr. Julián Cucalón"}</strong><br/>
${dd.especialidad || "Medicina del Trabajo"}<br/>RM: ${dd.licencia || ""}<br/>NIT: ${dd.nit || "000.000.000-0"}</div>
<div style="text-align:right;"><strong style="color:#065f46;">CUENTA DE COBRO</strong><br/>N° ${String(cuenta.consecutivo).padStart(3,"0")}<br/>${cuenta.fechaEmision || todayISO()}</div></div>
<div class="titulo">CUENTA DE COBRO</div>
<div class="info-row"><span><strong>Empresa:</strong> ${cuenta.empresaNombre || ""}</span><span><strong>NIT:</strong> ${cuenta.nit || ""}</span></div>
<div class="info-row"><span><strong>Período:</strong> ${cuenta.periodo || ""}</span><span><strong>Vencimiento:</strong> ${cuenta.fechaVencimiento || ""}</span></div>
<div class="info-row"><span><strong>Tipo:</strong> ${cuenta.tipo === "bloque_periodico" ? "Bloque Periódico" : "Individual"}</span>
<span><strong>Valor Unitario:</strong> ${fmtCOP(cuenta.tarifaAplicada)}</span></div>
${trabajadoresHtml ? `<table><thead><tr><th>#</th><th>Trabajador</th><th>Documento</th></tr></thead><tbody>${trabajadoresHtml}</tbody></table>` : ""}
<div style="text-align:right;margin-top:16px;font-size:14pt;"><strong>Total: ${fmtCOP(cuenta.total)}</strong></div>
${firma ? `<div class="firma"><img src="${firma}" style="max-height:60px;"/><br/>${dd.nombre || ""}</div>` : ""}
<div class="footer-nota">Sistema SISO OcupaSalud Pro — Documento generado electrónicamente</div>
</body></html>`;
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 300);
}

export default function ContabilidadPage() {
  const { currentUser } = useAuthStore();
  const { data: companies } = useBackendData("/data/companies", "siso_companies", "companies");
  const [tab, setTab] = useState("panel"); // panel | historico
  const [searchT, setSearchT] = useState("");
  const [periodoFilter, setPeriodoFilter] = useState(todayISO().slice(0, 7)); // YYYY-MM
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // billing data from LS
  const [billingData, setBillingData] = useState(() => lsRead() || EMPTY_BILLING);
  const saveBilling = useCallback((data) => { lsWrite(data); setBillingData({ ...data }); }, []);

  // New bill form
  const [form, setForm] = useState({
    empresaId: "", empresaNombre: "", nit: "", periodo: todayISO().slice(0, 7),
    tipo: "individual", subtipo: "PERIODICO",
    tarifaAplicada: 0, total: 0, trabajadores: [],
    fechaEmision: todayISO(), fechaVencimiento: "",
  });

  const resetForm = () => {
    setForm({ empresaId: "", empresaNombre: "", nit: "", periodo: todayISO().slice(0, 7),
      tipo: "individual", subtipo: "PERIODICO", tarifaAplicada: 0, total: 0,
      trabajadores: [], fechaEmision: todayISO(), fechaVencimiento: "" });
    setEditId(null);
  };

  const empresasFiltradas = useMemo(() => {
    if (!searchT) return companies;
    const q = searchT.toLowerCase();
    return companies.filter(c => (c.nombre || "").toLowerCase().includes(q) || (c.nit || "").includes(q));
  }, [companies, searchT]);

  const selectEmpresa = (emp) => {
    const tarifaKey = SUBTIPO_TARIFA_MAP[form.subtipo] || "tarifaIngreso";
    const tarifa = parseFloat(emp[tarifaKey]) || 0;
    setForm(prev => ({ ...prev, empresaId: emp.id || emp.nit, empresaNombre: emp.nombre, nit: emp.nit, tarifaAplicada: tarifa, total: tarifa }));
    setSearchT("");
  };

  const handleCrear = () => {
    if (!form.empresaNombre || !form.nit) { alert("Selecciona una empresa."); return; }
    const consecutivo = billingData.consecutivo + 1;
    const now = new Date();
    const venc = form.fechaVencimiento || new Date(now.getFullYear(), now.getMonth() + 1, 5).toISOString().slice(0, 10);
    const nueva = {
      id: `BILL-${Date.now()}`,
      consecutivo,
      ...form,
      fechaVencimiento: venc,
      fechaCreacion: now.toISOString(),
      estado: "pendiente",
      creadoPor: currentUser?.user,
    };
    const updated = { ...billingData, consecutivo, cuentas: [...billingData.cuentas, nueva] };
    saveBilling(updated);
    resetForm();
    setShowForm(false);
  };

  const handleUpdateEstado = (id, nuevoEstado) => {
    const updated = { ...billingData, cuentas: billingData.cuentas.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c) };
    saveBilling(updated);
  };

  const handleDelete = (id) => {
    if (!window.confirm("¿Anular esta cuenta de cobro?")) return;
    const updated = { ...billingData, cuentas: billingData.cuentas.map(c => c.id === id ? { ...c, estado: "anulada" } : c) };
    saveBilling(updated);
  };

  // Panel mensual stats
  const stats = useMemo(() => {
    const cuentasMes = billingData.cuentas.filter(c => (c.periodo || "").startsWith(periodoFilter));
    const pendiente = cuentasMes.filter(c => c.estado === "pendiente").reduce((s, c) => s + (parseFloat(c.total) || 0), 0);
    const pagada = cuentasMes.filter(c => c.estado === "pagada").reduce((s, c) => s + (parseFloat(c.total) || 0), 0);
    const vencida = cuentasMes.filter(c => c.estado === "vencida").reduce((s, c) => s + (parseFloat(c.total) || 0), 0);
    return { total: pendiente + pagada + vencida, pendiente, pagada, vencida, count: cuentasMes.length };
  }, [billingData, periodoFilter]);

  const isAdmin = currentUser?.role === "super_admin" || currentUser?.role === "administrador";

  if (!isAdmin) return <div className="p-6 text-center text-gray-500">Solo administradores pueden acceder a Contabilidad.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-600" /> Contabilidad
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setTab("panel")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${tab === "panel" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Panel Mensual</button>
          <button onClick={() => setTab("historico")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${tab === "historico" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Histórico</button>
          {tab === "panel" && <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"><Plus className="w-3 h-3" /> Nueva Cuenta</button>}
        </div>
      </div>

      {tab === "panel" && (
        <>
          {/* Panel mensual */}
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input type="month" value={periodoFilter} onChange={e => setPeriodoFilter(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded-xl p-4"><p className="text-xs text-gray-500 font-bold uppercase">Total mes</p><p className="text-2xl font-black text-gray-800">{fmtCOP(stats.total)}</p><p className="text-xs text-gray-400">{stats.count} cuentas</p></div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><p className="text-xs text-amber-700 font-bold uppercase">Pendiente</p><p className="text-2xl font-black text-amber-700">{fmtCOP(stats.pendiente)}</p></div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"><p className="text-xs text-emerald-700 font-bold uppercase">Pagada</p><p className="text-2xl font-black text-emerald-700">{fmtCOP(stats.pagada)}</p></div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-xs text-red-700 font-bold uppercase">Vencida</p><p className="text-2xl font-black text-red-700">{fmtCOP(stats.vencida)}</p></div>
          </div>

          {/* Lista del mes */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b font-bold text-sm text-gray-700">Cuentas del período</div>
            {billingData.cuentas.filter(c => (c.periodo || "").startsWith(periodoFilter)).length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay cuentas para este período</div>
            ) : (
              billingData.cuentas.filter(c => (c.periodo || "").startsWith(periodoFilter)).sort((a, b) => b.consecutivo - a.consecutivo).map(cuenta => {
                const est = estadoVisuales[cuenta.estado] || estadoVisuales.pendiente;
                const EstIcon = est.icon;
                const tip = tipoVisual(cuenta.tipo);
                return (
                  <div key={cuenta.id} className="border-b border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-800">#{String(cuenta.consecutivo).padStart(3, "0")}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${tip.color}`}>{tip.label}</span>
                        <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${est.bg} ${est.text} ${est.border}`}><EstIcon className="w-3 h-3" />{est.label}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-700 mt-1">{cuenta.empresaNombre}</p>
                      <p className="text-xs text-gray-500">{ymLabel(cuenta.periodo)} · {fmtCOP(cuenta.total)} · {(cuenta.trabajadores || []).length} trabajadores</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => imprimirCuenta(cuenta, {}, "")} className="p-1.5 text-gray-400 hover:text-emerald-600" title="Imprimir"><Download className="w-4 h-4" /></button>
                      {cuenta.estado === "pendiente" && (
                        <>
                          <button onClick={() => handleUpdateEstado(cuenta.id, "pagada")} className="p-1.5 text-emerald-400 hover:text-emerald-600" title="Marcar pagada"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(cuenta.id)} className="p-1.5 text-red-400 hover:text-red-600" title="Anular"><X className="w-4 h-4" /></button>
                        </>
                      )}
                      {cuenta.estado === "pagada" && <button onClick={() => handleUpdateEstado(cuenta.id, "pendiente")} className="p-1.5 text-amber-400 hover:text-amber-600" title="Reabrir"><Clock className="w-4 h-4" /></button>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {tab === "historico" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b font-bold text-sm text-gray-700">Todas las cuentas</div>
          {billingData.cuentas.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No hay cuentas registradas</div>
          ) : (
            billingData.cuentas.sort((a, b) => b.consecutivo - a.consecutivo).map(cuenta => {
              const est = estadoVisuales[cuenta.estado] || estadoVisuales.pendiente;
              const EstIcon = est.icon;
              return (
                <div key={cuenta.id} className="border-b border-gray-100 p-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <span className="font-bold text-sm">#{String(cuenta.consecutivo).padStart(3, "0")}</span>
                    <span className="text-sm text-gray-700 ml-2">{cuenta.empresaNombre}</span>
                    <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${est.bg} ${est.text}`}><EstIcon className="w-3 h-3 inline mr-1" />{est.label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{ymLabel(cuenta.periodo)} · {fmtCOP(cuenta.total)} · {cuenta.fechaCreacion?.split("T")[0]}</p>
                  </div>
                  <button onClick={() => imprimirCuenta(cuenta, {}, "")} className="p-1.5 text-gray-400 hover:text-emerald-600"><Download className="w-4 h-4" /></button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal nueva cuenta */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-500 rounded-t-2xl p-4 text-white flex justify-between items-center">
              <h3 className="font-black"><DollarSign className="w-5 h-5 inline" /> Nueva Cuenta de Cobro</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Empresa</label>
                <input type="text" value={searchT} onChange={e => setSearchT(e.target.value)} placeholder="Buscar empresa..." className="w-full p-2 border rounded-lg text-sm mb-1" />
                {searchT && empresasFiltradas.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border rounded-lg">
                    {empresasFiltradas.map(emp => (
                      <button key={emp.id || emp.nit} onClick={() => selectEmpresa(emp)} className="w-full text-left p-2 text-sm hover:bg-emerald-50 border-b">{emp.nombre} ({emp.nit})</button>
                    ))}
                  </div>
                )}
                {form.empresaNombre && <p className="text-xs text-emerald-700 font-bold mt-1">✓ {form.empresaNombre}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-600 block mb-1">Período</label><input type="month" value={form.periodo} onChange={e => setForm(p => ({ ...p, periodo: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs font-bold text-gray-600 block mb-1">Vencimiento</label><input type="date" value={form.fechaVencimiento} onChange={e => setForm(p => ({ ...p, fechaVencimiento: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs font-bold text-gray-600 block mb-1">Tipo</label><select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className="w-full p-2 border rounded-lg text-sm">
                  <option value="individual">Individual</option><option value="bloque_periodico">Bloque periódico</option>
                </select></div>
                <div><label className="text-xs font-bold text-gray-600 block mb-1">Subtipo</label><select value={form.subtipo} onChange={e => setForm(p => ({ ...p, subtipo: e.target.value }))} className="w-full p-2 border rounded-lg text-sm">
                  {SUBTIPOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select></div>
                <div><label className="text-xs font-bold text-gray-600 block mb-1">Valor unitario</label><input type="number" min="0" value={form.tarifaAplicada} onChange={e => setForm(p => ({ ...p, tarifaAplicada: parseFloat(e.target.value) || 0, total: parseFloat(e.target.value) || 0 }))} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div><label className="text-xs font-bold text-gray-600 block mb-1">Total</label><p className="p-2 text-lg font-black text-emerald-700">{fmtCOP(form.total)}</p></div>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold">Cancelar</button>
                <button onClick={handleCrear} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700">Crear Cuenta</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}