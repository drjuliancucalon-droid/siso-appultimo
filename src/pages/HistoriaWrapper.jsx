import React from 'react';
// ============================================================
// HistoriaWrapper.jsx — Contenedor para vista de Historia Clínica
// Maneja los tabs: ocupacional, general, certificado, etc.
// ============================================================
import React from "react";
import { useUIStore } from "../stores/uiStore.js";
import HistoriaOcupacional from "./HistoriaOcupacional.jsx";
import HistoriaGeneral from "./HistoriaGeneral.jsx";
import Certificado from "./Certificado.jsx";

export default function HistoriaWrapper() {
  const { dataType, activeTab } = useUIStore();

  if (dataType === "ocupacional") {
    if (activeTab === "form") return <HistoriaOcupacional />;
    if (activeTab === "certificado") return <Certificado />;
    // Para otros tabs (formulaTab, derivacionTab, solicitudExamenes, adjuntos, carnetAlimentos)
    // se renderiza desde HistoriaOcupacional que los maneja internamente
    return <HistoriaOcupacional />;
  }

  if (dataType === "general") {
    if (activeTab === "formGeneral") return <HistoriaGeneral />;
    return <HistoriaGeneral />;
  }

  return <HistoriaOcupacional />;
}
