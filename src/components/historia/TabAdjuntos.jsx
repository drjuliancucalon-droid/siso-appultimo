import React from 'react';
// ============================================================
// TabAdjuntos.jsx — Extraído del monolito App.jsx
// Usa useApp() para acceder al estado centralizado
// ============================================================
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useApp } from "../../AppContext.jsx";
// Globals (helpers, constantes, componentes base)
// Los componentes base ya están disponibles via globals
import * as G from "../../globals.jsx";

export default function TabAdjuntos() {
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
  const renderTabAdjuntos = () => {
    const TIPOS_ADJUNTO = [
      { valor: "espirometria", etiqueta: "🫁 Espirometría" },
      { valor: "audiometria", etiqueta: "👂 Audiometría" },
      { valor: "rayos_x", etiqueta: "🩻 Rayos X / Imágenes" },
      { valor: "laboratorio", etiqueta: "🧪 Laboratorio" },
      { valor: "optometria", etiqueta: "👁 Optometría" },
      { valor: "ecg", etiqueta: "❤️ ECG / Holter" },
      { valor: "vacunacion", etiqueta: "💉 Carnet Vacunación" },
      { valor: "otro", etiqueta: "📄 Otro documento" },
    ];
    const adjuntos = data.adjuntos || [];
    const MAX_MB = 10;
    const MAX_BYTES = MAX_MB * 1024 * 1024;
    const TIPOS_MIME = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/tiff",
      "image/webp",
    ];

    const handleSubirAdjunto = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!TIPOS_MIME.includes(file.type)) {
        showAlert("⚠️ Solo se permiten PDF, PNG, JPG, TIFF o WebP.");
        return;
      }
      if (file.size > MAX_BYTES) {
        showAlert(`⚠️ El archivo supera el límite de ${MAX_MB} MB.`);
        return;
      }

      const tipoSelect = document.getElementById("adjunto-tipo-select");
      const tipoVal = tipoSelect ? tipoSelect.value : "otro";
      const tipoLabel =
        TIPOS_ADJUNTO.find((t) => t.valor === tipoVal)?.etiqueta || "Documento";

      const ts = Date.now();
      const ext = file.name.split(".").pop().toLowerCase();
      const userId = currentUser?.user || "unknown";
      const hcId = data.id || "hc_" + ts;
      const storagePath = `${userId}/${hcId}/${ts}-${tipoVal}.${ext}`;
      const nombreVisible = `${tipoLabel.replace(/[^\w\s]/g, "").trim()} - ${
        file.name
      }`;

      showAlert("⏳ Subiendo archivo a Supabase Storage...");

      const result = await _sbStorageUpload(storagePath, file);
      if (!result.ok) {
        showAlert(
          `❌ Error al subir: ${
            result.error ||
            "Verifica que el bucket siso-adjuntos esté habilitado en Supabase."
          }`
        );
        return;
      }

      const nuevoAdj = {
        id: `adj_${ts}`,
        nombre: nombreVisible,
        tipo: tipoVal,
        tipoLabel,
        mimeType: file.type,
        tamano: file.size,
        fecha: new Date().toISOString(),
        subidoPor: userId,
        path: storagePath,
      };

      const nuevosAdjuntos = [...adjuntos, nuevoAdj];
      setData((prev) => ({ ...prev, adjuntos: nuevosAdjuntos }));
      showAlert(`✅ "${file.name}" subido correctamente como ${tipoLabel}.`);
      if (tipoSelect) tipoSelect.value = "otro";
      e.target.value = "";
    };

    const handleVerAdjunto = async (adj) => {
      const url = await _sbStorageGetSignedUrl(adj.path);
      if (url) {
        window.open(url, "_blank");
      } else {
        showAlert(
          "⚠️ No se pudo obtener el enlace. Verifica la conexión con Supabase."
        );
      }
    };

    const handleEliminarAdjunto = async (adj) => {
      if (data.estadoHistoria === "Cerrada") {
        showAlert("ℹ️ No se pueden eliminar adjuntos de una HC cerrada.");
        return;
      }
      const ok = await new Promise((res) =>
        setConfirmConfig({
          msg: `¿Eliminar "${adj.nombre}"? Esta acción no se puede deshacer.`,
          onConfirm: () => res(true),
          onCancel: () => res(false),
        })
      );
      if (!ok) return;
      await _sbStorageDelete(adj.path);
      const filtrados = adjuntos.filter((a) => a.id !== adj.id);
      setData((prev) => ({ ...prev, adjuntos: filtrados }));
      showAlert("🗑 Adjunto eliminado.");
    };

    const formatBytes = (b) =>
      b < 1024 * 1024
        ? `${(b / 1024).toFixed(1)} KB`
        : `${(b / 1024 / 1024).toFixed(2)} MB`;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-teal-50">
          <span className="text-sm font-black text-teal-800">
            📎 Adjuntos de Paraclínicos
          </span>
          <span className="text-[10px] text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
            Res. 1843/2025 · Supabase Storage
          </span>
          <span className="ml-auto text-[10px] text-gray-400">
            {adjuntos.length} archivo{adjuntos.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Upload area */}
          {data.estadoHistoria !== "Cerrada" && (
            <div className="border-2 border-dashed border-teal-300 rounded-xl p-4 bg-teal-50/40 space-y-3">
              <p className="text-xs font-bold text-teal-800">
                Subir nuevo adjunto
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase">
                    Tipo de documento
                  </label>
                  <select
                    id="adjunto-tipo-select"
                    className="p-2 border rounded-lg text-xs bg-white min-w-[180px]"
                    defaultValue="otro"
                  >
                    {TIPOS_ADJUNTO.map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-lg flex items-center gap-2">
                  <span>⬆ Seleccionar archivo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.tiff,.webp"
                    onChange={handleSubirAdjunto}
                  />
                </label>
              </div>
              <p className="text-[10px] text-gray-400">
                Formatos: PDF, PNG, JPG, TIFF, WebP · Máx. {MAX_MB} MB · Se
                almacena en Supabase Storage
              </p>
            </div>
          )}

          {/* Lista de adjuntos */}
          {adjuntos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📂</p>
              <p className="text-sm font-bold">Sin adjuntos</p>
              <p className="text-xs mt-1">
                Suba espirometrías, audiometrías, resultados de laboratorio u
                otros documentos clínicos
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {adjuntos.map((adj) => (
                <div
                  key={adj.id}
                  className="flex items-center justify-between gap-3 py-3 px-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">
                      {adj.mimeType === "application/pdf" ? "📄" : "🖼️"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {adj.nombre}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatBytes(adj.tamano)} ·{" "}
                        {new Date(adj.fecha).toLocaleDateString("es-CO")} ·{" "}
                        {adj.subidoPor}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleVerAdjunto(adj)}
                      className="px-3 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                    >
                      👁 Ver
                    </button>
                    {data.estadoHistoria !== "Cerrada" && (
                      <button
                        onClick={() => handleEliminarAdjunto(adj)}
                        className="px-3 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nota normativa */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-[10px] text-amber-800 font-bold">
              📋 Normativa aplicable
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5">
              Los resultados de paraclínicos forman parte integral de la
              Historia Clínica Ocupacional según la Res. 1843/2025 Art. 12 y la
              Res. 1995/1999 (retención 20 años). Los archivos se almacenan en
              Supabase Storage con acceso restringido por credenciales del
              médico.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ─── ROUTER ───────────────────────────────────────────────────────────────
  // ─── RENDER: GESTIÓN DE USUARIOS ─────────────────────────────────────────

  // ─────────────────────────────────────────────────────────

  return renderTabAdjuntos();
}
