// src/pages/Reporte.jsx — Adapter wrapper for EpidemiologicalReport module
// Bridges the prop interface from ReportsPage to the module component
import React from 'react';
import EpidemiologicalReport from '../modules/reports/components/EpidemiologicalReport';

export default function Reporte(props) {
  return <EpidemiologicalReport {...props} />;
}