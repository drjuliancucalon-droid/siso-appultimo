import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import {
  MessageSquare
} from "lucide-react";
import { useAuthStore } from '../stores/authStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { usePatientsStore } from '../stores/patientsStore.js';
import { useCompaniesStore } from '../stores/companiesStore.js';

export const MensajesOverlay = (props) => {
  const { currentUser, setCurrentUser, privacidadAceptada, setPrivacidadAceptada } = useAuthStore();
  const { view, setView, navStack, setNavStack, navigate, goBack, alertMsg, setAlertMsg, activeTab, setActiveTab, dataType, setDataType, showAIConfig, setShowAIConfig, aiStatus, setAiStatus, syncStatus, setSyncStatus, confirmConfig, setConfirmConfig, promptConfig, setPromptConfig, promptValue, setPromptValue } = useUIStore();
  const { patientsList, setPatientsList, patientSearchTerm, setSearchTerm, savedReports, setSavedReports, atencionesCerradas, setAtencionesCerradas, savedBills, setSavedBills } = usePatientsStore();
  const { companies, setCompaniesList, usersList, setUsersList, doctorSignature, setDoctorSignature, aiConfig, setAiConfig } = useCompaniesStore();
  // Props spread for backward compat
  const { data, ...rest } = props;

  // -------- EXTRACTED FROM MONOLITH: renderMensajesOverlay --------
  // This component was auto-extracted. Review and refactor as needed.

    if (!showMensajePanel) return null;
    const esMensajeAdmin = _isAdmin(currentUser?.role);
    // Mensajes que me corresponden (como destinatario) o que yo envié
    const misMensajes = mensajes
      .filter(
        (m) =>
          m.destinatarios?.includes(currentUser?.user) ||
          m.from === currentUser?.user
      )
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const noLeidos = misMensajes.filter(
      (m) => !m.leido && m.destinatarios?.includes(currentUser?.user)
    ).length;
    const saveMensajes = (upd) => {
      setMensajes(upd);
      _sync("siso_mensajes", JSON.stringify(upd));
      _sbSet("siso_mensajes", upd);
    };
    const enviarMensaje = () => {
      if (!composeMensaje.texto.trim()) {
        showAlert("Escriba un mensaje.");
        return;
      }
      if (!composeMensaje.destinatarios.length) {
        showAlert("Seleccione al menos un destinatario.");
        return;
      }
      const nm = {
        id: "msg_" + Date.now(),
        from: currentUser?.user,
        fromName: currentUser?.name,
        destinatarios: composeMensaje.destinatarios,
        texto: composeMensaje.texto.trim(),
        fecha: new Date().toISOString(),
        leido: false,
        respuesta: null,
        respondido: false,
      };
      saveMensajes([...mensajes, nm]);
      setComposeMensaje({ destinatarios: [], texto: "" });
      setShowComposeMensaje(false);
      showAlert("✅ Aviso enviado.");
    };
    const responderMensaje = (msg) => {
      if (!mensajeRespuesta.trim()) {
        showAlert("Escriba una respuesta.");
        return;
      }
      const upd = mensajes.map((m) =>
        m.id === msg.id
          ? {
              ...m,
              respuesta: mensajeRespuesta.trim(),
              respondido: true,
              leido: true,
              respondidoPor: currentUser?.name,
              respondidoEn: new Date().toISOString(),
            }
          : m
      );
      saveMensajes(upd);
      setMensajeRespuesta("");
      showAlert("✅ Respuesta enviada.");
    };
    const marcarLeido = (msgId) => {
      const upd = mensajes.map((m) =>
        m.id === msgId ? { ...m, leido: true } : m
      );
      saveMensajes(upd);
    };
    const todosUsuarios = usersList.filter(
      (u) => u.user !== currentUser?.user && u.activo !== false
    );
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-start pointer-events-none">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 pointer-events-auto"
          onClick={() => setShowMensajePanel(false)}
        />
        {/* Panel */}
        <div
          className="relative pointer-events-auto m-4 w-96 max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxWidth: "calc(100vw - 2rem)" }}
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white px-5 py-3 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <p className="font-black text-sm">Mensajes Internos</p>
              {noLeidos > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {noLeidos}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {esMensajeAdmin && (
                <button
                  onClick={() => setShowComposeMensaje((v) => !v)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1"
                >
                  ✏️ Nuevo
                </button>
              )}
              <button
                onClick={() => setShowMensajePanel(false)}
                className="text-white/80 hover:text-white text-lg font-black leading-none"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Compose (admin only) */}
          {esMensajeAdmin && showComposeMensaje && (
            <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex-shrink-0">
              <p className="text-[10px] font-black text-indigo-700 uppercase mb-2">
                Nuevo Aviso
              </p>
              <div className="mb-2">
                <p className="text-[10px] font-bold text-gray-500 mb-1">
                  Destinatarios:
                </p>
                <div className="flex flex-wrap gap-1">
                  {todosUsuarios.map((u) => (
                    <button
                      key={u.user}
                      onClick={() =>
                        setComposeMensaje((p) => ({
                          ...p,
                          destinatarios: p.destinatarios.includes(u.user)
                            ? p.destinatarios.filter((d) => d !== u.user)
                            : [...p.destinatarios, u.user],
                        }))
                      }
                      className={`text-[9px] px-2 py-1 rounded-full font-bold border transition ${
                        composeMensaje.destinatarios.includes(u.user)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                      }`}
                    >
                      {u.name}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setComposeMensaje((p) => ({
                        ...p,
                        destinatarios: todosUsuarios.map((u) => u.user),
                      }))
                    }
                    className="text-[9px] px-2 py-1 rounded-full font-bold border bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                  >
                    ✓ Todos
                  </button>
                </div>
              </div>
              <textarea
                value={composeMensaje.texto}
                onChange={(e) =>
                  setComposeMensaje((p) => ({ ...p, texto: e.target.value }))
                }
                placeholder="Escriba el aviso para los usuarios seleccionados..."
                rows={3}
                className="w-full p-2 border border-indigo-200 rounded-lg text-xs resize-none focus:ring-2 focus:ring-indigo-300 outline-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={enviarMensaje}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-black hover:bg-indigo-700"
                >
                  Enviar Aviso
                </button>
                <button
                  onClick={() => setShowComposeMensaje(false)}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {/* Lista de mensajes */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {misMensajes.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-xs font-bold">Sin mensajes</p>
              </div>
            )}
            {misMensajes.map((msg) => {
              const esParaMi = msg.destinatarios?.includes(currentUser?.user);
              const esMio = msg.from === currentUser?.user;
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    if (esParaMi && !msg.leido) marcarLeido(msg.id);
                  }}
                  className={`rounded-xl border p-3 cursor-default transition ${
                    !msg.leido && esParaMi
                      ? "bg-indigo-50 border-indigo-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="text-[10px] font-black text-gray-600">
                      {esMio
                        ? `📤 Tú → ${
                            msg.destinatarios?.length > 1
                              ? "Varios"
                              : usersList.find(
                                  (u) => u.user === msg.destinatarios?.[0]
                                )?.name || "?"
                          }`
                        : `📥 ${msg.fromName || msg.from}`}
                    </p>
                    <p className="text-[9px] text-gray-400 flex-shrink-0">
                      {new Date(msg.fecha).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    {msg.texto}
                  </p>
                  {/* Respuesta ya enviada */}
                  {msg.respondido && (
                    <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                      <p className="text-[9px] font-black text-emerald-700">
                        Respondido por {msg.respondidoPor}:
                      </p>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        {msg.respuesta}
                      </p>
                    </div>
                  )}
                  {/* Form responder (si es para mí y no ha sido respondido) */}
                  {esParaMi && !msg.respondido && (
                    <div className="mt-2 space-y-1.5">
                      <textarea
                        value={mensajeRespuesta}
                        onChange={(e) => setMensajeRespuesta(e.target.value)}
                        placeholder="Respuesta libre (opcional)..."
                        rows={2}
                        className="w-full p-1.5 border border-gray-300 rounded-lg text-xs resize-none focus:ring-1 focus:ring-indigo-300 outline-none"
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => responderMensaje(msg)}
                          className="flex-1 bg-indigo-600 text-white py-1.5 rounded-lg text-[10px] font-black hover:bg-indigo-700"
                        >
                          Responder
                        </button>
                        <button
                          onClick={() => {
                            const upd = mensajes.map((m) =>
                              m.id === msg.id ? { ...m, leido: true } : m
                            );
                            saveMensajes(upd);
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded-lg text-[10px] font-black hover:bg-gray-300"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => {
                            const upd = mensajes.map((m) =>
                              m.id === msg.id
                                ? { ...m, leido: true, rechazado: true }
                                : m
                            );
                            saveMensajes(upd);
                          }}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-[10px] font-black hover:bg-red-200"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  // ── B-F1-03: Persistir portafolio ──────────────────────────────────────
  const savePortafolio = (items) => {
    setPortafolioItems(items);
    try {
      localStorage.setItem("siso_portafolio", JSON.stringify(items));
    } catch {}
  };
  // ── B-F1-04: Persistir cotizaciones ──────────────────────────────────
  const saveCotizaciones = (list) => {
    setCotizaciones(list);
    try {
      localStorage.setItem("siso_cotizaciones", JSON.stringify(list));
    } catch {}
  };
  const nextCotizNum = () => {
    const max = cotizaciones.reduce(
      (m, c) => Math.max(m, parseInt(c.numero || "0") || 0),
      0
    );
    return String(max + 1).padStart(4, "0");
  };
  // ── B-F2-01: Persistir caja ───────────────────────────────────────────
  const saveCaja = (movs) => {
    setCajaMovimientos(movs);
    try {
      // PASO 6: clave aislada por empresa/usuario
      const suf = currentUser?.empresaId
        ? "empresa_" + currentUser.empresaId
        : currentUser?.user || "shared";
      localStorage.setItem(`siso_caja_${suf}`, JSON.stringify(movs));
    } catch {}
  };
  // ── B-F2-01/02: Generar comprobante ──────────────────────────────────
  const openComprobanteWindow = (tipo, mov) => {
    const doc = activeDoctorData;
    const _miIPSComp = currentUser?.empresaId
      ? companies.find((c) => c.id === currentUser.empresaId) || null
      : null;
    const num = mov.id || Date.now();
    const fecha = mov.fecha || new Date().toLocaleDateString("es-CO");
    const tipoLabel =
      tipo === "ingreso"
        ? "COMPROBANTE DE INGRESO"
        : tipo === "egreso"
        ? "COMPROBANTE DE EGRESO"
        : "RECIBO DE CAJA";
    const _compLeftHtml = _miIPSComp
      ? `<div style="text-align:left;">
          ${
            _miIPSComp.logo
              ? `<img src="${_miIPSComp.logo}" style="max-height:36px;max-width:90px;object-fit:contain;display:block;margin-bottom:3px;"/>`
              : ""
          }
          <div style="font-size:11px;font-weight:900;color:#1a1a1a;">${_sanitize(
            _miIPSComp.nombre || ""
          )}</div>
          ${
            _miIPSComp.nit
              ? `<div style="font-size:9px;color:#555;">NIT: ${_sanitize(
                  _miIPSComp.nit
                )}${_miIPSComp.dv ? "-" + _sanitize(_miIPSComp.dv) : ""}</div>`
              : ""
          }
          ${
            _miIPSComp.direccion
              ? `<div style="font-size:9px;color:#555;">${_sanitize(
                  _miIPSComp.direccion
                )}${
                  _miIPSComp.ciudad ? " · " + _sanitize(_miIPSComp.ciudad) : ""
                }</div>`
              : ""
          }
          ${
            _miIPSComp.telefono
              ? `<div style="font-size:9px;color:#555;">Tel: ${_sanitize(
                  _miIPSComp.telefono
                )}</div>`
              : ""
          }
        </div>`
      : `<div style="text-align:left;">
          <div style="font-size:11px;font-weight:900;color:#1a1a1a;">${_sanitize(
            doc?.nombre || ""
          )}</div>
          <div style="font-size:9px;color:#555;">${_sanitize(
            doc?.titulo || ""
          )}</div>
          <div style="font-size:9px;color:#555;">Lic: ${_sanitize(
            doc?.licencia || ""
          )} · ${_sanitize(doc?.ciudad || "")}</div>
        </div>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${tipoLabel}</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:24px;font-size:11px;color:#111}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a1a1a;padding-bottom:12px;margin-bottom:16px}
.title{font-size:14px;font-weight:900;text-transform:uppercase;margin:4px 0;text-align:right}
.sub{font-size:10px;color:#555;text-align:right}
table{width:100%;border-collapse:collapse;margin-top:8px}
th{background:#1a1a1a;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
td{padding:5px 8px;border-bottom:1px solid #ddd;font-size:11px}
.total-row td{font-weight:900;font-size:13px;background:#f0f0f0}
.firma{margin-top:40px;text-align:right}
.firma-line{border-top:1px solid #555;width:200px;margin-left:auto;padding-top:4px;font-size:10px;text-align:center}
.no-print{margin-top:16px;display:flex;gap:8px;justify-content:center}
@media print{.no-print{display:none}}
</style></head><body>
<div class="header">
${_compLeftHtml}
<div>
<div class="title">${tipoLabel}</div>
<div class="sub">No. ${num} · Fecha: ${fecha}</div>
</div>
</div>
<table>
<tr><th>Campo</th><th>Detalle</th></tr>
<tr><td>Concepto</td><td>${mov.concepto || ""}</td></tr>
<tr><td>Forma de pago</td><td>${mov.formaPago || ""}</td></tr>
<tr class="total-row"><td>MONTO</td><td>$ ${Number(
      mov.monto || 0
    ).toLocaleString("es-CO")} COP</td></tr>
</table>
<div class="firma">
<div class="firma-line">${_sanitize(doc?.nombre || "")}<br/>${_sanitize(
      doc?.titulo || ""
    )}<br/>Lic: ${_sanitize(doc?.licencia || "")}</div>
</div>
<div class="no-print">
<button onclick="window.print()" style="background:#1a1a1a;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:900;cursor:pointer">🖨️ Imprimir</button>
<button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:900;cursor:pointer">✕ Cerrar</button>
</div></body></html>`;
    const w = window.open("", "_blank", "width=560,height=620");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };
  // ── B-F1-05: Carné manipulación alimentos ────────────────────────────
  const openCarnetAlimentos = (paciente, docData) => {
    const doc = docData || activeDoctorData;
    const p = paciente || {};
    const empresa = companies.find((c) => c.id === p.empresaId);
    const fechaVig = p.vigencia
      ? new Date(
          new Date(p.fechaConsulta || Date.now()).getTime() +
            parseInt(p.vigencia) * 24 * 60 * 60 * 1000
        ).toLocaleDateString("es-CO")
      : "Ver concepto médico";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Carné Manipulación de Alimentos</title>
<style>
@media print{body{margin:0}@page{size:8.5cm 5.5cm;margin:0}}
body{font-family:Arial,sans-serif;margin:0;background:#f5f5f5}
.carne{width:8.5cm;height:5.5cm;background:#fff;border:2px solid #1a6b2f;border-radius:8px;
  overflow:hidden;display:flex;flex-direction:column;padding:8px;box-sizing:border-box;
  margin:10px auto;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.hdr{background:#1a6b2f;color:#fff;text-align:center;padding:3px;border-radius:4px;margin-bottom:4px}
.hdr h1{font-size:7px;margin:0;font-weight:900;text-transform:uppercase}
.body{display:flex;gap:6px;flex:1}
.foto{width:35px;height:45px;border:1px solid #1a6b2f;border-radius:4px;
  display:flex;align-items:center;justify-content:center;font-size:18px;
  background:#f0faf0;flex-shrink:0;overflow:hidden}
.foto img{width:100%;height:100%;object-fit:cover}
.info{flex:1;font-size:7px;line-height:1.4}
.info .nom{font-weight:900;font-size:8px;color:#1a6b2f}
.bottom{display:flex;justify-content:space-between;align-items:flex-end;margin-top:3px}
.firma{text-align:center;font-size:6px;border-top:1px solid #333;padding-top:1px;width:60px}
.valid{background:#d1fae5;border:1px solid #1a6b2f;border-radius:4px;padding:2px 6px;
  font-size:7px;font-weight:900;color:#065f46;text-align:center}
.no-print{text-align:center;padding:10px;display:flex;gap:8px;justify-content:center}
@media print{.no-print{display:none}}
</style></head><body>
<div class="carne">
<div class="hdr"><h1>🍽️ Carné Médico - Manipulación de Alimentos</h1></div>
<div class="body">
<div class="foto">${
      p.fotoPaciente ? `<img src="${p.fotoPaciente}" alt="Foto"/>` : "📷"
    }</div>
<div class="info">
<div class="nom">${p.nombres || "Paciente"}</div>
<div><b>Doc:</b> ${p.docTipo || "CC"} ${p.docNumero || ""}</div>
<div><b>Empresa:</b> ${empresa?.nombre || p.empresaId || "Particular"}</div>
<div><b>Cargo:</b> ${p.cargo || "-"}</div>
<div><b>Concepto:</b> ${p.conceptoAptitud || "APTO"}</div>
<div><b>Fecha:</b> ${
      p.fechaConsulta || new Date().toLocaleDateString("es-CO")
    }</div>
</div></div>
<div class="bottom">
<div class="firma">${doc?.nombre || ""}<br/>${doc?.titulo || ""}<br/>Lic: ${
      doc?.licencia || ""
    }</div>
<div class="valid">✅ VÁLIDO<br/>Hasta: ${fechaVig}</div>
</div></div>
<div class="no-print">
<button onclick="window.print()" style="background:#1a6b2f;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:900;cursor:pointer">🖨️ Imprimir Carné</button>
<button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:900;cursor:pointer">✕ Cerrar</button>
</div></body></html>`;
    const w = window.open("", "_blank", "width=380,height=320");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };
};

export default MensajesOverlay;
