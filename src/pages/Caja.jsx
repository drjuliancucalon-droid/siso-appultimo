// src/pages/Caja.jsx — Adapter wrapper for CashBox module
// Bridges the prop interface from CajaPage to the CashBox component
import React from 'react';
import { CashBox } from '../modules/billing';

export default function Caja({
  cajaMovimientos = [],
  setCajaMovimientos,
  currentUser,
  patientsList = [],
  savedBillsList = [],
  setSavedBillsList,
  showAlert,
  showConfirm,
  ...rest
}) {
  const handleAddMovement = (movement) => {
    setCajaMovimientos?.([...cajaMovimientos, movement]);
  };

  const handleDeleteMovement = (id) => {
    setCajaMovimientos?.(cajaMovimientos.filter((m) => m.id !== id));
  };

  const handleMarkPaid = (id) => {
    setCajaMovimientos?.(
      cajaMovimientos.map((m) => (m.id === id ? { ...m, pagado: true } : m))
    );
  };

  return (
    <CashBox
      movements={cajaMovimientos}
      onAddMovement={handleAddMovement}
      onDeleteMovement={handleDeleteMovement}
      onMarkPaid={handleMarkPaid}
      savedBills={savedBillsList}
    />
  );
}