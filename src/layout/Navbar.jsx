import React from 'react';
import { BrainCircuit, ClipboardList, Cloud, Download, FileCheck, FileSignature, HardDrive, Lock, LogOut, MessageSquare, Printer, Save, Unlock, UploadCloud, Wifi, WifiOff } from "lucide-react";
// ============================================================
// Navbar.jsx — Extraído del monolito App.jsx
// Usa useApp() para acceder al estado centralizado
// ============================================================
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useApp } from "../AppContext.jsx";
// Globals (helpers, constantes, componentes base)
// Los componentes base ya están disponibles via globals
import * as G from "../globals.jsx";

export default function Navbar() {
  const app = useApp();
  const {
    // Desestructura todo el estado que necesites
    view, setView, currentUser, setCurrentUser,
    data, setData, dataType, setDataType,
    activeTab, setActiveTab,
    patientsList, setPatientsList,
    companies, setCompanies,
    usersList, setUsersList,
    billData, setBillData,
    saveStatus, setSaveStatus,
    alertMsg, setAlertMsg,
    showAlert, goTo,
    ...app_rest
  } = app;

  // ── Cuerpo original del render function ──────────────────
  const renderNavbar = () => {
    const _aiBg =
      aiStatus === "ok"
        ? "bg-green-50 text-green-700 border-green-200"
        : aiStatus === "error"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-gray-50 text-gray-600 border-gray-200";
    const _syncBg =
      syncStatus === "ok"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : syncStatus === "syncing" || syncStatus === "loading"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-red-50 text-red-500 border-red-200";
    const _syncTxt =
      syncStatus === "ok"
        ? "Nube ✓"
        : syncStatus === "syncing"
        ? "Sync..."
        : syncStatus === "loading"
        ? "Cargando..."
        : "Sin nube";
    const _syncTitle =
      syncStatus === "ok"
        ? "Sincronizado"
        : syncStatus === "syncing"
        ? "Sincronizando..."
        : syncStatus === "loading"
        ? "Cargando datos..."
        : syncStatus === "error"
        ? "Error de sincronización"
        : "Listo";
    const _agCls =
      view === "agenda"
        ? "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
        : "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100";
    const _agN = [
      "administrador",
      "secretaria",
      "medico",
      "admin_empresa",
    ].includes(currentUser?.role)
      ? agendados.filter(
          (a) =>
            a.fecha === new Date().toISOString().split("T")[0] &&
            a.estado === "espera" &&
            (currentUser?.role !== "medico" || a.medicoId === currentUser?.user)
        ).length
      : 0;
    const _noLeidos = mensajes.filter(
      (m) => m.destinatarios?.includes(currentUser?.user) && !m.leido
    ).length;
    const _tabCls = (k) =>
      activeTab === k
        ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white"
        : "px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100";
    const _tabBlue = (k) =>
      activeTab === k
        ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white"
        : "px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100";
    return (
      <nav className="bg-white border-b border-gray-100 px-4 py-2.5 shadow-sm no-print sticky top-0 z-50 flex justify-between items-center">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => goTo("dashboard")}
        >
          <BrandLogo data={activeDoctorData} />
          {/* ── IPS: nombre de empresa en navbar ── */}
          {currentUser?.empresaId &&
            (() => {
              const _navEmp = companies.find(
                (c) => c.id === currentUser.empresaId
              );
              return _navEmp ? (
                <span className="text-[10px] font-black text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg ml-1 hidden sm:inline-block">
                  🏥{" "}
                  {_navEmp.nombre?.length > 25
                    ? _navEmp.nombre.substring(0, 25) + "…"
                    : _navEmp.nombre}
                </span>
              ) : null;
            })()}
        </div>
        {/* ── Bloque 1: Datos médico activo en header ── */}
        {currentUser && activeDoctorData?.nombre && (
          <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-2">
            {activeSignature ? (
              <img
                src={activeSignature}
                alt="Firma"
                className="h-7 w-auto max-w-[60px] object-contain opacity-80"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-black">
                {(activeDoctorData.nombre || "?")[0]}
              </div>
            )}
            <div className="leading-tight">
              <p className="text-[10px] font-black text-gray-800 truncate max-w-[140px]">{activeDoctorData.nombre}</p>
              {activeDoctorData.titulo && (
                <p className="text-[9px] text-teal-600 truncate max-w-[140px]">{activeDoctorData.titulo}</p>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setShowAIConfig(true)}
            className={
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition " +
              _aiBg
            }
          >
            {aiStatus === "ok" ? (
              <Wifi className="w-3 h-3" />
            ) : aiStatus === "error" ? (
              <WifiOff className="w-3 h-3" />
            ) : (
              <BrainCircuit className="w-3 h-3" />
            )}
            {" ⚙️ IA"}
          </button>
          {view === "historia" && (
            <>
              <button
                onClick={() => data.estadoHistoria === "Cerrada" ? goTo("dashboard") : goBack()}
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 flex items-center gap-1 border border-gray-200 no-print"
              >
                ← Volver
              </button>
              <div className="w-px h-6 bg-gray-200 no-print" />
              {data.estadoHistoria === "Cerrada" && (
                <div className="hidden no-print bg-red-50 border border-red-300 rounded-lg px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold text-red-700">
                  <Lock className="w-3 h-3" /> Historia Cerrada ·{" "}
                  {data.firmaDigital?.codigoQR || data.codigoVerificacion || ""}
                </div>
              )}
              {data.estadoHistoria === "Cerrada" ? (
                <div className="flex items-center gap-1">
                  {/* Botón principal: Evolución */}
                  <button
                    onClick={() => {
                      setEvolucionForm({
                        texto: "",
                        nuevoConcept: "",
                        fecha: new Date().toISOString().split("T")[0],
                        codigoEvolucion:
                          "EV-" +
                          Date.now().toString(36).toUpperCase().slice(-6),
                        activeEvTab: "nota",
                        motivoConsulta: "",
                        diagnosticos: [
                          { cie10: "", descripcion: "", tipo: "Principal" },
                        ],
                        planConducta: "",
                        recomendaciones: "",
                        formulaMedicamentos: [],
                        derivaciones: [],
                        incapacidad: {
                          aplica: false,
                          dias: 0,
                          origen: "Común",
                          diagnostico: "",
                          desde: "",
                          hasta: "",
                        },
                      });
                      setShowEvolucionModal(true);
                    }}
                    className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 flex items-center gap-1"
                  >
                    <ClipboardList className="w-3 h-3" /> Evolución
                  </button>
                                <button
                onClick={() => {
                  setEvolucionForm((p) => ({ ...p, activeEvTab: "concepto", nuevoConcept: p.nuevoConcept || "", recomendaciones: p.recomendaciones || "" }));
                  setShowEvolucionModal(true);
                }}
                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow hover:bg-emerald-700"
              >
                📄 Nuevo Certificado
              </button>
                  {/* Mini-botón admin: Nota Aclaratoria / Reapertura */}
                  {(_isAdmin(currentUser?.role) ||
                    currentUser?.role === "admin_empresa") && (
                    <button
                      onClick={handleEditHistory}
                      className="bg-yellow-500 text-white px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-600 flex items-center gap-1"
                      title="Admin: Nota Aclaratoria / Reapertura"
                    >
                      <Unlock className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleCloseHistory}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Firma y Cerrar
                </button>
              )}
              <div className="w-px h-6 bg-gray-200" />
              {dataType === "ocupacional" && (
                <>
                  <button
                    onClick={() => setActiveTab("form")}
                    className={_tabCls("form")}
                  >
                    HC Ocup.
                  </button>
                  <button
                    onClick={() => setActiveTab("certificado")}
                    className={_tabCls("certificado")}
                  >
                    Certificado
                  </button>
                  <button
                    onClick={() => setActiveTab("incapacidad")}
                    className={_tabCls("incapacidad")}
                  >
                    Incapacidad
                  </button>
                  <button
                    onClick={() => setActiveTab("formulaTab")}
                    className={_tabBlue("formulaTab")}
                  >
                    Formula/Deriv.
                  </button>
                  <button
                    onClick={() => setActiveTab("solicitudExamenes")}
                    className={_tabBlue("solicitudExamenes")}
                  >
                    🔬 Exámenes
                  </button>
                  <button
                    onClick={() => setActiveTab("adjuntos")}
                    className={_tabBlue("adjuntos")}
                  >
                    📎 Adjuntos
                  </button>
                  {data.enfasisExamen === "ALIMENTOS" && (
                    <button
                      onClick={() => setActiveTab("carnetAlimentos")}
                      className={_tabBlue("carnetAlimentos")}
                    >
                      🍽️ Carné
                    </button>
                  )}
                </>
              )}
              {dataType === "general" && (
                <>
                  <button
                    onClick={() => setActiveTab("formGeneral")}
                    className={_tabBlue("formGeneral")}
                  >
                    HC General
                  </button>
                  <button
                    onClick={() => setActiveTab("ordenMedica")}
                    className={_tabBlue("ordenMedica")}
                  >
                    Orden/Formula
                  </button>
                  <button
                    onClick={() => setActiveTab("solicitudExamenes")}
                    className={_tabBlue("solicitudExamenes")}
                  >
                    Examenes
                  </button>
                  <button
                    onClick={() => setActiveTab("incapacidadGeneral")}
                    className={_tabBlue("incapacidadGeneral")}
                  >
                    Incapacidad
                  </button>
                </>
              )}
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={() => handlePrint(data.nombres)}
                className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Printer className="w-3 h-3" /> PDF
              </button>

              {/* ── Descargar Todo: Certificado + Incapacidad + Fórmula/Derivación ── */}
              {dataType === "ocupacional" && (
                <button
                  onClick={() => {
                    const docData = activeDoctorData || {};
                    const sig = activeSignature || "";
                    const _esc = (v) =>
                      String(v || "")
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;");

                    // ── Estilos compartidos ────────────────────────────────────────────
                    const sharedCss = `
                    *{margin:0;padding:0;box-sizing:border-box;}
                    body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5pt;color:#111;}
                    .page{padding:14mm 16mm;min-height:100vh;}
                    .page-break{page-break-before:always;}
                    .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid var(--accent,#065f46);padding-bottom:10px;margin-bottom:14px;}
                    .hdr-left .doc-name{font-size:11pt;font-weight:900;color:var(--accent,#065f46);}
                    .hdr-left p,.hdr-right p{font-size:8pt;color:#555;margin-top:1px;}
                    .hdr-right{text-align:right;}
                    .doc-title{font-size:13pt;font-weight:900;text-transform:uppercase;color:var(--accent,#065f46);}
                    table{width:100%;border-collapse:collapse;margin:8px 0;}
                    td,th{border:1px solid #ccc;padding:6px 10px;font-size:9pt;}
                    th{font-weight:900;text-align:left;}
                    .sig-row{margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;}
                    .sig-block{text-align:center;}
                    .sig-line{border-top:1.5px solid #333;padding-top:4px;font-size:8pt;font-weight:700;margin-top:50px;width:200px;}
                    .dl-bar{position:fixed;top:0;left:0;right:0;background:#065f46;color:#fff;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.3);}
                    .dl-bar .title{flex:1;font-size:9.5pt;font-weight:700;}
                    .dl-bar button{border:none;padding:6px 16px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
                    .btn-print{background:#10b981;color:#fff;} .btn-close{background:#ef4444;color:#fff;}
                    .toc{background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:10px 14px;margin-bottom:16px;}
                    .toc p{font-size:8.5pt;color:#166534;margin:2px 0;}
                    .toc .toc-title{font-size:10pt;font-weight:900;color:#14532d;margin-bottom:6px;}
                    .badge{display:inline-block;padding:3px 10px;border-radius:4px;font-size:11pt;font-weight:900;color:#fff;}
                    .alerta{background:#fef9c3;border:1px solid #fde047;padding:7px 12px;border-radius:6px;font-size:8.5pt;color:#713f12;margin:8px 0;}
                    .consent{margin-top:8px;font-size:7pt;color:#9ca3af;border-top:1px dashed #e5e7eb;padding-top:6px;}
                    @page{size:letter portrait;margin:0;}
                    @media print{.dl-bar{display:none!important;}.page{padding:12mm 15mm;}}
                  `;

                    // ── 1. CERTIFICADO DE APTITUD ──────────────────────────────────────
                    const cLow = (data.conceptoAptitud || "").toLowerCase();
                    const aptBg = cLow.includes("no apto")
                      ? "#7f1d1d"
                      : cLow.includes("condic")
                      ? "#78350f"
                      : cLow.includes("apto")
                      ? "#14532d"
                      : "#1e3a5f";
                    const fmtTxt = (txt) => {
                      const s = Array.isArray(txt)
                        ? txt.join("\n")
                        : String(txt || "");
                      if (!s.trim()) return "";
                      const lines = s
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean);
                      if (
                        lines.some(
                          (l) =>
                            /^[•*\-]/.test(l) ||
                            /^\*\*/.test(l) ||
                            /^\d+\./.test(l)
                        )
                      ) {
                        return (
                          '<ul style="margin:5px 0;padding-left:18px;">' +
                          lines
                            .map(
                              (l) =>
                                '<li style="margin-bottom:2px;font-size:9.5pt;">' +
                                l
                                  .replace(/^[•*\-]+\s*/, "")
                                  .replace(/^\d+\.\s*/, "")
                                  .replace(
                                    /\*\*(.+?)\*\*/g,
                                    "<strong>$1</strong>"
                                  ) +
                                "</li>"
                            )
                            .join("") +
                          "</ul>"
                        );
                      }
                      return (
                        '<p style="font-size:9.5pt;margin-top:4px;line-height:1.5;">' +
                        s.replace(/\n/g, "<br/>") +
                        "</p>"
                      );
                    };
                    const sigHtml = sig
                      ? `<img src="${sig}" style="max-height:68px;display:block;margin:0 auto 4px;" alt="Firma"/>`
                      : '<div style="height:60px;"></div>';
                    const restricTxt = Array.isArray(data.analisisRestricciones)
                      ? data.analisisRestricciones.join("\n")
                      : data.analisisRestricciones || data.restricciones || "";
                    const recomTxt = [
                      data.recomendacionesOcupacionales,
                      data.recomendacionesMedicas,
                      data.recomendaciones,
                    ]
                      .filter(Boolean)
                      .join("\n");
                    const certSec = `
                    <div class="page" style="--accent:#065f46;">
                      <div class="hdr">
                        <div class="hdr-left">
                          <div class="doc-name">${_esc(
                            docData.nombre || "MÉDICO OCUPACIONAL"
                          )}</div>
                          <p>${_esc(
                            docData.titulo ||
                              "Médico Especialista en Salud Ocupacional"
                          )}</p>
                          <p>Lic. ${_esc(docData.licencia || "--")} · ${_esc(
                      docData.ciudad || "Popayán"
                    )}</p>
                        </div>
                        <div class="hdr-right">
                          <p>Res. 1843/2025</p>
                          <p>Generado: ${new Date().toLocaleDateString(
                            "es-CO"
                          )}</p>
                        </div>
                      </div>
                      <h2 style="text-align:center;font-size:14pt;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:8px 0 4px;">Certificado de Aptitud Laboral</h2>
                      <p style="text-align:center;font-size:8.5pt;color:#6b7280;margin-bottom:10px;">Conforme a la Resolución 1843 de 2025</p>
                      <p style="font-size:9.5pt;margin-bottom:10px;line-height:1.5;">El suscrito Médico Especialista en Salud Ocupacional certifica que realizó la evaluación de tipo <strong>${_esc(
                        data.tipoExamen || "--"
                      )}</strong> con énfasis <strong>${_esc(
                      data.enfasisExamen || "GENERAL"
                    )}</strong> a:</p>
                      <table style="margin-bottom:10px;">
                        <tr><th style="background:#d1fae5;width:20%;">Nombre</th><td>${_esc(
                          data.nombres
                        )}</td><th style="background:#d1fae5;width:20%;">Documento</th><td>${_esc(
                      data.docTipo || "CC"
                    )} ${_esc(data.docNumero)}</td></tr>
                        <tr><th style="background:#d1fae5;">Cargo</th><td>${_esc(
                          data.cargo
                        )}</td><th style="background:#d1fae5;">Empresa</th><td>${_esc(
                      data.empresaNombre || data.empresa || "PARTICULAR"
                    )}</td></tr>
                        <tr><th style="background:#d1fae5;">Fecha</th><td>${_esc(
                          data.fechaExamen
                        )}</td><th style="background:#d1fae5;">Vigencia</th><td>${_esc(
                      data.vigencia || "1 año"
                    )}</td></tr>
                      </table>
                      <p style="text-align:center;font-size:8pt;font-weight:900;text-transform:uppercase;color:#6b7280;margin:6px 0 4px;">Concepto Emitido</p>
                      <div style="background:${aptBg};border-radius:8px;padding:14px;text-align:center;margin-bottom:10px;">
                        <div style="font-size:14pt;font-weight:900;color:#fff;text-transform:uppercase;">${_esc(
                          data.conceptoAptitud || "PENDIENTE DE CONCEPTO"
                        )}</div>
                        <div style="font-size:8pt;color:#e5e7eb;margin-top:4px;">Concepto emitido bajo Res. 1843 de 2025, Art. 20</div>
                      </div>
                      ${
                        recomTxt
                          ? '<div style="margin-bottom:10px;"><p style="font-size:9pt;font-weight:900;text-transform:uppercase;border-bottom:2px solid #d1d5db;padding-bottom:3px;margin-bottom:6px;">Recomendaciones</p>' +
                            fmtTxt(recomTxt) +
                            "</div>"
                          : ""
                      }
                      ${
                        restricTxt
                          ? '<div style="margin-bottom:10px;"><p style="font-size:9pt;font-weight:900;text-transform:uppercase;border-bottom:2px solid #d1d5db;padding-bottom:3px;margin-bottom:6px;">Restricciones Laborales</p>' +
                            fmtTxt(restricTxt) +
                            "</div>"
                          : ""
                      }
                      <div class="alerta">⚠ <strong>Confidencialidad:</strong> El diagnóstico clínico no es entregado al empleador (Art. 16 Res. 1843/2025).</div>
                      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:20px;align-items:end;border-top:2px solid #d1d5db;padding-top:12px;margin-top:4px;">
                        <div style="text-align:center;"><div style="height:50px;"></div><div style="border-top:1px solid #333;width:180px;margin:0 auto;padding-top:4px;font-size:8pt;font-weight:700;">Firma del Trabajador<br/>${_esc(
                          data.docTipo || "CC"
                        )}: ${_esc(data.docNumero)}</div></div>
                        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:8px 16px;text-align:center;"><p style="font-size:7.5pt;font-weight:900;color:#6b7280;text-transform:uppercase;">Código Verificación</p><p style="font-size:13pt;font-family:monospace;font-weight:900;letter-spacing:3px;color:#065f46;">${_esc(
                          data.codigoVerificacion || "--"
                        )}</p></div>
                        <div style="text-align:center;">${sigHtml}<div style="border-top:1px solid #333;width:180px;margin:0 auto;padding-top:4px;font-size:8pt;font-weight:700;">${_esc(
                      docData.nombre || ""
                    )}<br/>${_esc(docData.titulo || "")}<br/>Lic: ${_esc(
                      docData.licencia || ""
                    )}${
                      docData.celular
                        ? "<br/>Cel: " + _esc(docData.celular)
                        : ""
                    }${
                      docData.email ? "<br/>" + _esc(docData.email) : ""
                    }</div></div>
                      </div>
                      <div class="consent">El suscrito Médico Especialista certifica la evaluación realizada. Res. 1843/2025 · Ley 1581/2012 · Ley 23/1981.</div>
                    </div>`;

                    // ── 2. CERTIFICADO DE INCAPACIDAD ──────────────────────────────────
                    const inc = data.incapacidad || {};
                    const diasInc =
                      inc.dias ||
                      (() => {
                        if (!inc.desde || !inc.hasta) return 0;
                        return (
                          Math.ceil(
                            Math.abs(
                              new Date(inc.hasta) - new Date(inc.desde)
                            ) /
                              (1000 * 60 * 60 * 24)
                          ) + 1
                        );
                      })();
                    const incapSec = `
                    <div class="page page-break" style="--accent:#dc2626;">
                      <div class="hdr">
                        <div class="hdr-left">
                          <div class="doc-name">${_esc(
                            docData.nombre || "MÉDICO OCUPACIONAL"
                          )}</div>
                          <p>${_esc(docData.titulo || "")} · Lic: ${_esc(
                      docData.licencia || ""
                    )}</p>
                          <p>Tel: ${_esc(docData.celular || "")} · ${_esc(
                      docData.ciudad || ""
                    )}</p>
                        </div>
                        <div class="hdr-right">
                          <div class="doc-title" style="color:#dc2626;">Certificado de Incapacidad Médica</div>
                          <p>Expedición: ${new Date().toLocaleDateString(
                            "es-CO"
                          )}</p>
                          <p style="font-size:7.5pt;color:#888;">Res. 1995/1999 · Ley 100/1993 Art. 227 · Dec. 2943/2013</p>
                        </div>
                      </div>
                      <table>
                        <tr><th style="background:#fee2e2;">Paciente</th><td>${_esc(
                          data.nombres
                        )}</td><th style="background:#fee2e2;">Documento</th><td>${_esc(
                      data.docTipo || "CC"
                    )} ${_esc(data.docNumero)}</td></tr>
                        <tr><th style="background:#fee2e2;">EPS / Aseguradora</th><td>${_esc(
                          data.eps || "--"
                        )}</td><th style="background:#fee2e2;">Género</th><td>${_esc(
                      data.genero || "--"
                    )}</td></tr>
                        <tr><th style="background:#fee2e2;">Diagnóstico (CIE-10)</th><td colspan="3">${_esc(
                          inc.diagnosticoCIE ||
                            inc.diagnostico ||
                            data.diagnosticoPrincipal ||
                            "--"
                        )}</td></tr>
                        <tr><th style="background:#fee2e2;">Origen</th><td>${_esc(
                          inc.origen || "Enfermedad General"
                        )}</td><th style="background:#fee2e2;">Prórroga N°</th><td>${_esc(
                      inc.prorroga || "N/A"
                    )}</td></tr>
                        <tr><th style="background:#fee2e2;">Fecha inicio</th><td>${_esc(
                          inc.desde || "--"
                        )}</td><th style="background:#fee2e2;">Fecha fin</th><td>${_esc(
                      inc.hasta || "--"
                    )}</td></tr>
                        <tr>
                          <th colspan="2" style="background:#dc2626;color:white;text-align:center;font-size:13pt;padding:10px;">DÍAS DE INCAPACIDAD: ${diasInc}</th>
                          <th colspan="2" style="text-align:center;font-size:11pt;padding:10px;">${_esc(
                            inc.motivo || "Incapacidad Médica"
                          )}</th>
                        </tr>
                        <tr><th style="background:#fee2e2;">Restricciones</th><td colspan="3">${_esc(
                          inc.restricciones ||
                            "Reposo relativo. Evitar esfuerzo físico intenso."
                        )}</td></tr>
                        <tr><th style="background:#fee2e2;">Recomendaciones</th><td colspan="3">${_esc(
                          inc.recoIncapacidad ||
                            "Consultar nuevamente si no hay mejoría."
                        )}</td></tr>
                      </table>
                      <p style="font-size:7.5pt;color:#888;margin-top:8px;">Incapacidad expedida conforme Ley 100/1993 Art. 227, Decreto 2943/2013.</p>
                      <div class="sig-row">
                        <div class="sig-block"><div class="sig-line">Firma Paciente / Responsable</div></div>
                        <div class="sig-block">${sigHtml}<div class="sig-line">${_esc(
                      docData.nombre || ""
                    )}<br/>${_esc(docData.titulo || "")} · Lic: ${_esc(
                      docData.licencia || ""
                    )}</div></div>
                      </div>
                    </div>`;

                    // ── 3. FÓRMULA MÉDICA ──────────────────────────────────────────────
                    const meds = data.formulaMedicamentos || [];
                    const medRows =
                      meds.length > 0
                        ? meds
                            .map(
                              (m) => `<tr>
                        <td>${_esc(m.nombre)}</td>
                        <td>${_esc(m.presentacion)}</td>
                        <td>${_esc(m.dosis)}</td>
                        <td>${_esc(m.frecuencia)}</td>
                        <td>${_esc(m.duracion)}</td>
                        <td>${_esc(m.indicaciones || "")}</td>
                      </tr>`
                            )
                            .join("")
                        : `<tr><td colspan="6" style="text-align:center;color:#9ca3af;font-style:italic;padding:14px;">Sin medicamentos formulados</td></tr>`;
                    const formulaSec = `
                    <div class="page page-break" style="--accent:#7c3aed;">
                      <div class="hdr">
                        <div class="hdr-left">
                          <div class="doc-name">${_esc(
                            docData.nombre || "MÉDICO OCUPACIONAL"
                          )}</div>
                          <p>${_esc(docData.titulo || "")} · Lic: ${_esc(
                      docData.licencia || ""
                    )}</p>
                          <p>Tel: ${_esc(docData.celular || "")} · ${_esc(
                      docData.ciudad || ""
                    )}</p>
                        </div>
                        <div class="hdr-right">
                          <div class="doc-title" style="color:#7c3aed;">Fórmula Médica</div>
                          <p>Fecha: ${_esc(
                            data.fechaExamen ||
                              new Date().toLocaleDateString("es-CO")
                          )}</p>
                        </div>
                      </div>
                      <p style="margin-bottom:10px;font-size:9.5pt;">Paciente: <strong>${_esc(
                        data.nombres
                      )}</strong> &nbsp;·&nbsp; ${_esc(
                      data.docTipo || "CC"
                    )} ${_esc(data.docNumero)} &nbsp;·&nbsp; ${_esc(
                      String(data.edad || "--")
                    )} años &nbsp;·&nbsp; EPS: ${_esc(data.eps || "--")}</p>
                      <table>
                        <thead><tr style="background:#ede9fe;">
                          <th>Medicamento</th><th>Presentación</th><th>Dosis</th><th>Frecuencia</th><th>Duración</th><th>Indicaciones</th>
                        </tr></thead>
                        <tbody>${medRows}</tbody>
                      </table>
                      ${
                        data.formulaMedica
                          ? '<p style="font-size:9pt;margin-top:8px;"><strong>Indicaciones adicionales:</strong> ' +
                            _esc(data.formulaMedica) +
                            "</p>"
                          : ""
                      }
                      <div class="sig-row" style="margin-top:40px;">
                        <div></div>
                        <div class="sig-block">${sigHtml}<div class="sig-line">${_esc(
                      docData.nombre || ""
                    )}<br/>${_esc(docData.titulo || "")}<br/>Lic: ${_esc(
                      docData.licencia || ""
                    )}</div></div>
                      </div>
                    </div>`;

                    // ── 4. DERIVACIONES / INTERCONSULTAS ──────────────────────────────
                    const derivs = data.derivaciones || [];
                    const derivRows =
                      derivs.length > 0
                        ? derivs
                            .map(
                              (d) => `<tr>
                        <td>${_esc(d.especialidad || "--")}</td>
                        <td>${_esc(d.motivo || "--")}</td>
                        <td>${_esc(d.urgencia || "Electiva")}</td>
                      </tr>`
                            )
                            .join("")
                        : `<tr><td colspan="3" style="text-align:center;color:#9ca3af;font-style:italic;padding:14px;">Sin derivaciones registradas</td></tr>`;
                    const derivSec = `
                    <div class="page page-break" style="--accent:#065f46;">
                      <div class="hdr">
                        <div class="hdr-left">
                          <div class="doc-name">${_esc(
                            docData.nombre || "MÉDICO OCUPACIONAL"
                          )}</div>
                          <p>${_esc(docData.titulo || "")} · Lic: ${_esc(
                      docData.licencia || ""
                    )}</p>
                          <p>Tel: ${_esc(docData.celular || "")} · ${_esc(
                      docData.ciudad || ""
                    )}</p>
                        </div>
                        <div class="hdr-right">
                          <div class="doc-title">Fórmula de Derivación / Interconsulta</div>
                          <p>Fecha: ${_esc(
                            data.fechaExamen ||
                              new Date().toLocaleDateString("es-CO")
                          )}</p>
                        </div>
                      </div>
                      <p style="margin-bottom:10px;font-size:9.5pt;">Remito a <strong>${_esc(
                        data.nombres
                      )}</strong> (${_esc(data.docTipo || "CC")} ${_esc(
                      data.docNumero
                    )}) para valoración especializada:</p>
                      <table>
                        <thead><tr style="background:#d1fae5;">
                          <th>Especialidad / Servicio</th><th>Motivo de consulta / Hallazgo clínico</th><th>Prioridad</th>
                        </tr></thead>
                        <tbody>${derivRows}</tbody>
                      </table>
                      ${
                        data.otrasObservaciones
                          ? '<p style="font-size:9pt;margin-top:10px;"><strong>Observaciones:</strong> ' +
                            _esc(data.otrasObservaciones) +
                            "</p>"
                          : ""
                      }
                      <div class="sig-row" style="margin-top:40px;">
                        <div></div>
                        <div class="sig-block">${sigHtml}<div class="sig-line">${_esc(
                      docData.nombre || ""
                    )}<br/>${_esc(docData.titulo || "")}<br/>Lic: ${_esc(
                      docData.licencia || ""
                    )}</div></div>
                      </div>
                    </div>`;

                    // ── Ensamblar ventana ──────────────────────────────────────────────
                    const w = window.open(
                      "",
                      "_blank",
                      "width=950,height=1200"
                    );
                    if (!w) {
                      showAlert(
                        "El navegador bloqueó la ventana emergente. Permita los popups e intente de nuevo."
                      );
                      return;
                    }
                    w.document
                      .write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
                    <title>Documentos - ${_esc(data.nombres)} · ${_esc(
                      data.fechaExamen || ""
                    )}</title>
                    <style>${sharedCss}</style>
                    </head><body>
                    <div class="dl-bar">
                      <span class="title">📄 4 documentos - ${_esc(
                        data.nombres
                      )} · ${_esc(data.fechaExamen || "")}</span>
                      <button class="btn-print" onclick="window.print()">📥 Guardar / Imprimir PDF</button>
                      <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
                    </div>
                    ${certSec}${incapSec}${formulaSec}${derivSec}
                    </body></html>`);
                    w.document.close();
                    w.focus();
                  }}
                  className="bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 no-print hover:bg-cyan-800"
                  title="Descargar todos los documentos: certificado + incapacidad + fórmula + derivaciones"
                >
                  <Download className="w-3 h-3" /> Todo
                </button>
              )}

              {dataType === "ocupacional" &&
                data.estadoHistoria === "Cerrada" && (
                  <button
                    onClick={async () => {
                      try {
                        showAlert("⏳ Generando paquete SHA-256...");
                        const pkg = await _generarPaqueteRetencion(
                          data,
                          activeDoctorData
                        );
                        const blob = new Blob([JSON.stringify(pkg, null, 2)], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download =
                          "HC_SHA256_" +
                          (data.docNumero || "").replace(/\s+/g, "_") +
                          "_" +
                          (data.fechaExamen || "sin-fecha") +
                          ".json";
                        a.click();
                        URL.revokeObjectURL(url);
                        const entrada = {
                          id: Date.now(),
                          fecha: new Date().toISOString(),
                          usuario: currentUser?.user,
                          accion: "PRESERVACION_CERTIFICADA",
                          paciente: data.nombres,
                          hash: pkg.hashSHA256.substring(0, 16),
                        };
                        setAuditLog((prev) => {
                          const n = [entrada, ...prev].slice(0, 500);
                          _sync("siso_audit_log", JSON.stringify(n));
                          return n;
                        });
                        showAlert(
                          "✅ HC preservada.\nHash SHA-256: " +
                            pkg.hashSHA256.substring(0, 16) +
                            "...\nVigente hasta: " +
                            pkg.metadata.anioVencimientoLegal
                        );
                      } catch (e) {
                        showAlert("Error: " + e.message);
                      }
                    }}
                    className="bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 no-print hover:bg-purple-800"
                    title="Preservar HC (Res.1995/1999 - 20 años)"
                  >
                    <HardDrive className="w-3 h-3" /> 20 años
                  </button>
                )}
              <button
                onClick={() => {
                  setNotifData(data);
                  setShowNotifModal(true);
                }}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 no-print hover:bg-green-700"
                title="Notificar resultado al paciente (Res. 1552/2013)"
              >
                📲 Notificar
              </button>
              {/* FASE 2: Indicador HC de otro médico (modo lectura) */}
              {currentUser?.role === "medico" &&
                data._medicoId &&
                data._medicoId !== currentUser?.user && (
                  <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                    👁 Lectura — HC del Dr.{" "}
                    {usersList.find((u) => u.user === data._medicoId)?.name ||
                      data._medicoId}
                  </span>
                )}
              {isHcOwner(data) && (
                <button
                  onClick={handleSavePatient}
                  className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Save className="w-3 h-3" /> Guardar
                </button>
              )}
            </>
          )}
          {view === "dashboard" && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".json"
                onChange={handleImportData}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="text-xs flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-bold hover:bg-blue-100"
              >
                <UploadCloud className="w-3 h-3 mr-1" /> Importar
              </button>
              <button
                onClick={handleExportData}
                className="text-xs flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold hover:bg-emerald-100"
              >
                <HardDrive className="w-3 h-3 mr-1" /> Backup
              </button>
              {/* NORMATIVO: Res. 2275/2023 - Exportación RIPS JSON */}
              <button
                onClick={() => {
                  try {
                    const pats = patientsList.filter(
                      (p) => p.fechaExamen && !p._archivado
                    );
                    if (!pats.length) {
                      showAlert(
                        "Sin pacientes con fecha de examen registrada."
                      );
                      return;
                    }
                    // B-25: Validar antes de generar
                    const ripsErrs = validarRIPSLote(pats);
                    if (ripsErrs.length > 0) {
                      const msg = `⚠️ ${
                        ripsErrs.length
                      } paciente(s) con datos incompletos para RIPS:\n\n${ripsErrs
                        .slice(0, 5)
                        .join("\n")}${
                        ripsErrs.length > 5 ? "\n...y más" : ""
                      }\n\n¿Generar RIPS de todas formas?`;
                      if (!window.confirm(msg)) return;
                    }
                    const rips = _generarRIPSJson(
                      pats,
                      activeDoctorData,
                      new Date().toISOString().substring(0, 7)
                    );
                    const jsonStr = JSON.stringify(rips, null, 2);
                    const filename = `RIPS_SISO_${new Date()
                      .toISOString()
                      .substring(0, 7)}.json`;
                    setRipsModalData({ json: jsonStr, filename });
                  } catch (e) {
                    showAlert("Error al generar RIPS: " + e.message);
                  }
                }}
                className="text-xs flex items-center bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-200 font-bold hover:bg-orange-100"
              >
                <FileCheck className="w-3 h-3 mr-1" /> RIPS
              </button>
              <button
                onClick={handleManualCloudSave}
                disabled={syncStatus === "syncing"}
                className="text-xs flex items-center bg-violet-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-violet-700 disabled:opacity-60 gap-1 shadow-sm"
              >
                {syncStatus === "syncing" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Cloud className="w-3 h-3" />
                )}
                {" Guardar en Nube"}
              </button>
              <input
                type="file"
                ref={fileInputSigRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleSignatureUpload}
              />
              <button
                onClick={() => fileInputSigRef.current.click()}
                className="text-xs flex items-center bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-200 font-bold hover:bg-teal-100"
              >
                <FileSignature className="w-3 h-3 mr-1" /> Firma
              </button>
            </>
          )}
          <span
            title={_syncTitle}
            className={
              "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border no-print " +
              _syncBg
            }
          >
            {syncStatus === "syncing" || syncStatus === "loading" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : syncStatus === "ok" ? (
              <Cloud className="w-3 h-3" />
            ) : syncStatus === "error" ? (
              <WifiOff className="w-3 h-3" />
            ) : (
              <Cloud className="w-3 h-3 opacity-40" />
            )}{" "}
            {_syncTxt}
          </span>
          {["administrador", "medico", "super_admin"].includes(
            currentUser?.role
          ) && (
            <button
              onClick={() => goTo("habeasdata")}
              className={
                view === "habeasdata"
                  ? "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white"
                  : "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
              }
              title="Habeas Data - Ley 1581/2012"
            >
              🔐 Privacidad
            </button>
          )}
          {(_isAdmin(currentUser?.role) ||
            currentUser?.role === "medico" ||
            (currentUser?.role === "secretaria" &&
              _secretariaPuede("telemedicina", currentUser, usersList))) && (
            <button
              onClick={() => goTo("telemedicina")}
              className={
                view === "telemedicina"
                  ? "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
                  : "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
              }
              title="Telemedicina - Res. 2654/2019"
            >
              🩺 Tele
            </button>
          )}
          {["administrador", "secretaria", "medico", "super_admin"].includes(
            currentUser?.role
          ) && (
            <button onClick={() => goTo("agenda")} className={_agCls}>
              {"🗓️ Agenda"}
              {_agN > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[8px] font-black px-1 rounded-full">
                  {_agN}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setShowMensajePanel((v) => !v)}
            className="relative p-2 rounded-xl hover:bg-indigo-50 transition"
            title="Mensajes internos"
          >
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            {_noLeidos > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {_noLeidos}
              </span>
            )}
          </button>
          {/* ── VER PLANES ── */}
          <button
            onClick={() => goTo("planes")}
            className={
              view === "planes"
                ? "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
                : "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
            }
            title="Ver planes y precios"
          >
            ⭐ Planes
          </button>
          <button
            onClick={() => {
              setCurrentUser(null);
              setView("login");
              _ls.removeItem("siso_session");
              _ls.removeItem("siso_active_form");
            }}
            className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 ml-1"
          >
            <LogOut className="w-3 h-3" /> Salir
          </button>
        </div>
      </nav>
    );
  };

  // ─────────────────────────────────────────────────────────

  return renderNavbar();
}
