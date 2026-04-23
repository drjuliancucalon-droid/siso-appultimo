import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import PortalCertificadosEmpresa from './PortalCertificadosEmpresa.jsx';

export default function PortalEmpresaMain() {
  return (
    <Routes>
      <Route path="certificados/:companyId" element={<PortalCertificadosEmpresa />} />
      <Route path="certificados" element={<Navigate to="/companies" replace />} />
      <Route index element={<Navigate to="/portal-certificados" replace />} />
    </Routes>
  );
}

