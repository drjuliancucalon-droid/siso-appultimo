// src/pages/Bill.jsx
// Cuentas de Cobro — Facturación completa con print, DIAN, selección de médico
import React, { useState, useMemo } from 'react';
import { Receipt, LogOut, Save, Printer } from 'lucide-react';
import { InputGroup } from '../shared/ui/InputGroup.jsx';
import { BrandLogo } from '../shared/ui/BrandLogo.jsx';
import { DoctorSignature } from '../shared/ui/DoctorSignature.jsx';
import { PlanGate } from '../shared/ui/PlanGate.jsx';
import { _canUse, _isAdmin, _secretariaPuede, ORG_DEFAULT_ID } from '../shared/data/planConfig.js';
import { getSpanishDate, numeroALetras } from '../shared/lib/formatters.js';
import { _generarFacturaDIAN_UBL } from '../shared/lib/normativa.js';
import { _sync } from '../shared/lib/supabase.js';
import { _ss } from '../shared/lib/storage.js';

export default function Bill({
  currentUser, usersList = [], companies = [], patientsList = [],
  activeDoctorData, activeSignature, orgsList = [],
  billData, setBillData, savedBillsList = [], setSavedBillsList,
  goBack, goTo, showAlert, setCajaTab,
  handlePrint,
}) {
  const [showDianPanel, setShowDianPanel] = useState(false);
  const [dianProvider, setDianProvider] = useState("manual");
  const [dianApiKey, setDianApiKey] = useState(_ss.getItem("siso_dian_apikey") || "");

  // ── PLAN GATE ──
  if (!_canUse("factura_basica", currentUser)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <PlanGate feature="factura_basica" requiredPlan="starter" currentUser={currentUser} />
        <div className="mt-4 text-center"><button onClick={() => goBack()} className="text-sm text-gray-500 hover:text-gray-700">← Volver</button></div>
      </div>
    );
  }

  // ── SECRETARIA GATE ──
  if (currentUser?.role === "secretaria" && !_secretariaPuede("bill", currentUser, usersList)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 space-y-3">
          <div className="text-5xl">🔐</div>
          <p className="font-black text-amber-800 text-xl">Módulo restringido</p>
          <p className="text-amber-700 text-sm font-bold">Cuentas de Cobro</p>
          <p className="text-amber-600 text-xs leading-relaxed">Solicita que habilite el permiso <strong>"Cuentas de Cobro"</strong> en tu perfil.</p>
          <button onClick={() => goBack()} className="mt-3 bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition">← Volver al panel</button>
        </div>
      </div>
    );
  }

  const _billDocUser = billData.billDoctorId ? usersList.find(u => u.user === billData.billDoctorId) : null;
  const _billDocData = _billDocUser?.doctorData || activeDoctorData;
  const _billDocSig = _billDocUser?.doctorData?.firma || activeSignature;
  const medicos = usersList.filter(u => ["medico", "administrador", "super_admin"].includes(u.role) && u.activo !== false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-2xl p-6 mb-6 no-print">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-orange-800 flex items-center gap-2"><Receipt className="w-5 h-5" /> Cuentas de Cobro</h2>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => goBack()} className="text-gray-500 font-bold text-sm flex items-center gap-1"><LogOut className="rotate-180 w-4 h-4" /> Volver</button>
              <button onClick={() => {
                if (!billData.clientName && !billData.companyId) { showAlert("Seleccione cliente."); return; }
                const nb = { ...billData, id: "bill_" + Date.now(), savedAt: new Date().toISOString(), pagada: false };
                const upd = [...savedBillsList, nb]; setSavedBillsList(upd);
                const _bSuf = currentUser?.empresaId ? "empresa_" + currentUser.empresaId : currentUser?.user || "shared";
                _sync(`siso_saved_bills_${_bSuf}`, JSON.stringify(upd));
                showAlert("✅ Cuenta de cobro guardada.\nPuede verla en Módulo Financiero → 💳 Cuentas");
              }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-emerald-700"><Save className="w-4 h-4" /> Guardar</button>
              <button onClick={() => { goTo("caja"); if (setCajaTab) setTimeout(() => setCajaTab("cuentas"), 100); }}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-800">💳 Ver cuentas ({savedBillsList.filter(b => !b.pagada).length} pend.)</button>
              {handlePrint && <button onClick={() => handlePrint("Cuenta-de-Cobro")} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"><Printer className="w-4 h-4" /> Imprimir</button>}
              <button onClick={() => {
                if (!_canUse("dian_xml", currentUser)) { showAlert("🔒 Factura Electrónica DIAN disponible en plan ⭐ Pro ($79.000/mes)."); return; }
                setShowDianPanel(v => !v);
              }} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${showDianPanel ? "bg-green-700 text-white" : "bg-green-600 text-white hover:bg-green-700"}`}>
                🧾 {showDianPanel ? "Ocultar DIAN" : "⚡ Factura Electrónica DIAN"}
              </button>
            </div>
          </div>

          {/* Selector de médico para secretaria */}
          {["secretaria", "administrador"].includes(currentUser?.role) && (
            <>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-3">
                <p className="text-xs font-black text-indigo-800 mb-2">🏢 Emitida por (Facturación Mixta — Fase 2)</p>
                <div className="flex gap-2 flex-wrap mb-2">
                  {[{ v: "organizacion", l: "🏢 Organización", desc: "Usa datos de OcupaSalud Popayán" }, { v: "medico_independiente", l: "👨‍⚕️ Médico independiente", desc: "Usa datos del médico seleccionado" }].map(({ v, l, desc }) => (
                    <button key={v} onClick={() => setBillData(p => ({ ...p, emitidaPor: v }))}
                      className={`flex-1 min-w-[160px] p-2 rounded-lg border-2 text-left text-xs transition ${billData.emitidaPor === v ? "border-indigo-500 bg-indigo-100 text-indigo-800" : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200"}`}>
                      <p className="font-black">{l}</p><p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                <p className="text-xs font-black text-blue-800 mb-2">👨‍⚕️ Médico que emite la cuenta de cobro</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Seleccionar Médico</label>
                    <select className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white" value={billData.billDoctorId || ""}
                      onChange={e => setBillData(p => ({ ...p, billDoctorId: e.target.value }))}>
                      <option value="">-- Mi perfil --</option>
                      {medicos.map(u => <option key={u.user} value={u.user}>{u.doctorData?.nombre || u.nombre || u.user} ({u.role})</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Empresa / Cliente</label>
              <select className="w-full p-2 border rounded-lg text-sm" value={billData.companyId}
                onChange={e => {
                  const c = companies.find(x => x.id === e.target.value);
                  setBillData(p => ({ ...p, companyId: e.target.value, clientName: c?.nombre || "", clientNit: c ? `${c.nit}${c.dv ? "-" + c.dv : ""}` : "", amount: c ? c.tarifaIngreso || c.tarifaConsulta || p.amount : p.amount }));
                }}>
                <option value="">Particular...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <InputGroup label="NIT / CC" value={billData.clientNit} onChange={e => setBillData(p => ({ ...p, clientNit: e.target.value }))} width="w-full" />
            <InputGroup label="No. Consecutivo" value={billData.number} onChange={e => setBillData(p => ({ ...p, number: e.target.value }))} width="w-full" />
            <InputGroup label="Fecha" value={billData.date} onChange={e => setBillData(p => ({ ...p, date: e.target.value }))} type="date" width="w-full" />
            <InputGroup label="Valor ($)" value={billData.amount} onChange={e => setBillData(p => ({ ...p, amount: e.target.value }))} type="number" width="w-full" />
            <InputGroup label="Banco" value={billData.bankName} onChange={e => setBillData(p => ({ ...p, bankName: e.target.value }))} width="w-full" />
          </div>
        </div>

        {/* Documento imprimible */}
        <style>{`.doc-editable [contenteditable]:hover { outline: 2px dashed #3b82f6; outline-offset:2px; border-radius:3px; cursor:text; }
.doc-editable [contenteditable]:focus { outline: 2px solid #2563eb; outline-offset:2px; border-radius:3px; background:#eff6ff; }
.doc-editable [contenteditable]:empty:before { content: attr(data-placeholder); color: #9ca3af; font-style: italic; }
@media print { .doc-editable [contenteditable] { outline:none !important; background:transparent !important; } }`}</style>
        <div className="doc-editable">
          <div className="bg-white mx-auto shadow-2xl print:shadow-none carta-visual" style={{ width: "21.59cm", minHeight: "auto", padding: "2.5cm", boxSizing: "border-box" }}>
            <div className="flex justify-between items-center border-b-4 border-emerald-600 pb-5 mb-7">
              <div className="scale-110 origin-left"><BrandLogo data={_billDocData} /></div>
              <div className="text-right">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight" contentEditable suppressContentEditableWarning data-placeholder="Título">Cuenta de Cobro</h2>
                <div contentEditable suppressContentEditableWarning className="bg-emerald-600 text-white font-bold px-3 py-0.5 rounded-l mt-1 inline-block">No. {(billData.number || "01").padStart(3, "0")}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-7">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 print:bg-transparent">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Cliente</p>
                <p contentEditable suppressContentEditableWarning className="text-lg font-black text-gray-800 uppercase">{billData.clientName || ""}</p>
                <p contentEditable suppressContentEditableWarning className="text-sm font-medium text-gray-600 mt-1">NIT/CC: {billData.clientNit || ""}</p>
              </div>
              <div className="text-right flex flex-col justify-center">
                <p className="text-sm font-bold text-gray-400 uppercase">Fecha de Emisión</p>
                <p contentEditable suppressContentEditableWarning className="text-base font-medium text-gray-800">{getSpanishDate(billData.date)}</p>
              </div>
            </div>
            <div className="mb-6">
              <div className="bg-emerald-600 text-white p-2 rounded-t-xl text-xs font-bold uppercase flex justify-between"><span>Concepto del Servicio</span><span>Valor</span></div>
              <div className="border border-emerald-600 rounded-b-xl p-5 flex justify-between items-center">
                <div className="w-3/4 pr-4">
                  <p contentEditable suppressContentEditableWarning className="text-sm font-medium text-gray-800 uppercase leading-relaxed">{billData.concept}</p>
                </div>
                <div className="w-1/4 text-right">
                  <p contentEditable suppressContentEditableWarning className="text-2xl font-black text-gray-900">$ {parseFloat(billData.amount || 0).toLocaleString("es-CO")}</p>
                </div>
              </div>
              <div className="mt-1 text-right">
                <p contentEditable suppressContentEditableWarning className="text-xs italic text-gray-500 bg-gray-50 p-1.5 rounded inline-block">
                  Son: {numeroALetras(billData.amount) || "____________________"} PESOS M/CTE
                </p>
              </div>
            </div>
            <div className="mb-7 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2 border-b pb-1">Información de Pago</p>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs print:bg-transparent">
                  <p className="font-bold uppercase">{_billDocData.banco || billData.bankName || "BANCOLOMBIA"}</p>
                  <p>Tipo: {_billDocData.tipoCuenta || billData.accountType || "Ahorros"}</p>
                  <p className="font-mono text-sm mt-1">No. {_billDocData.numeroCuenta || billData.accountNumber || "--"}</p>
                  {_billDocData.rut && <p className="text-gray-500 mt-1">RUT: {_billDocData.rut}</p>}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2 border-b pb-1">Acreedor</p>
                <div className="text-xs text-gray-700">
                  <p className="font-black text-sm">{_billDocData.nombre}</p>
                  <p>NIT/CC: {_billDocData.cedula?.split(" ")[0]}</p>
                  <p>Lic: {_billDocData.licencia}</p>
                  <p>Cel: {_billDocData.celular}</p>
                  <p>{_billDocData.email}</p>
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-between items-end">
              <div className="w-1/2"><DoctorSignature signature={_billDocSig} data={_billDocData} showData={true} /></div>
              <div className="w-2/5 text-right text-[8px] text-gray-400">
                <p contentEditable suppressContentEditableWarning>Me acojo al Art. 383 E.T. Tarifa mínima 0%. No practicar retención.</p>
              </div>
            </div>
          </div>
        </div>

        {/* DIAN Panel */}
        {showDianPanel && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg border-2 border-green-300 no-print overflow-hidden">
            <div className="bg-green-700 px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-white font-black text-sm">🧾 Facturación Electrónica DIAN</p>
                <p className="text-green-200 text-[10px]">Decreto 358/2020 · Resolución DIAN 000012/2021 · UBL 2.1</p>
              </div>
              <button onClick={() => setShowDianPanel(false)} className="text-green-200 hover:text-white font-black text-lg">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                {[{ id: "siigo", label: "Siigo", desc: "Integración API REST", color: "blue" }, { id: "alegra", label: "Alegra", desc: "Integración API REST", color: "orange" }, { id: "manual", label: "XML Manual", desc: "Descargar UBL 2.1", color: "gray" }].map(p => (
                  <button key={p.id} onClick={() => setDianProvider(p.id)}
                    className={`p-3 rounded-xl border-2 text-left transition ${dianProvider === p.id ? `border-${p.color}-500 bg-${p.color}-50` : "border-gray-200 hover:border-gray-300"}`}>
                    <p className="font-black text-sm text-gray-800">{p.label}</p><p className="text-[10px] text-gray-500">{p.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <button onClick={() => {
                  try {
                    const xml = _generarFacturaDIAN_UBL(billData, activeDoctorData, billData.number || "001");
                    const blob = new Blob([xml], { type: "application/xml" });
                    const url = URL.createObjectURL(blob); const a = document.createElement("a");
                    a.href = url; a.download = `FE-SISO-${String(billData.number || "001").padStart(6, "0")}-${new Date().toISOString().split("T")[0]}.xml`;
                    a.click(); URL.revokeObjectURL(url);
                    showAlert("✅ XML UBL 2.1 descargado. Cárguelo en su software de facturación autorizado por DIAN.");
                  } catch (e) { showAlert("Error: " + e.message); }
                }} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black text-sm rounded-xl flex items-center gap-2">⬇ Descargar XML UBL 2.1</button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10px] text-amber-800 space-y-1">
                <p className="font-black">⚖️ Marco normativo Decreto 358 de 2020</p>
                <p>Los servicios médicos ocupacionales están <strong>exentos de IVA</strong> (Art. 476 E.T. num. 1). El CUFE es generado por el software autorizado.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
