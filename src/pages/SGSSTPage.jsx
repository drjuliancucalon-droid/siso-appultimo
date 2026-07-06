import React, { useState } from 'react';
import SSTDashboard from '../modules/sgsst/components/SSTDashboard';
import RiskMatrix from '../modules/sgsst/components/RiskMatrix';
import AnnualPlan from '../modules/sgsst/components/AnnualPlan';
import TrainingModule from '../modules/sgsst/components/TrainingModule';
import AccidentInvestigation from '../modules/sgsst/components/AccidentInvestigation';
import DocumentRepository from '../modules/sgsst/components/DocumentRepository';
import InspectionChecklist from '../modules/sgsst/components/InspectionChecklist';
import PolicyGenerator from '../modules/sgsst/components/PolicyGenerator';
import { Shield, ArrowLeft } from 'lucide-react';

const SUB_MODULES = {
  riesgos: { component: RiskMatrix, title: 'Matriz de Riesgos (IPEVR)' },
  actividades: { component: AnnualPlan, title: 'Plan Anual de Trabajo' },
  capacitaciones: { component: TrainingModule, title: 'Capacitaciones' },
  accidentes: { component: AccidentInvestigation, title: 'Investigación de Accidentes' },
  documentos: { component: DocumentRepository, title: 'Repositorio de Documentos' },
  inspecciones: { component: InspectionChecklist, title: 'Inspecciones de Seguridad' },
  politicas: { component: PolicyGenerator, title: 'Generador de Políticas' },
};

export default function SGSSTPage() {
  const [section, setSection] = useState(null);

  const handleBack = () => setSection(null);

  // Si hay un sub-módulo seleccionado, mostrarlo
  if (section && SUB_MODULES[section]) {
    const { component: SubModule, title } = SUB_MODULES[section];
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Dashboard SG-SST
        </button>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </div>
        <SubModule onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-800">SG-SST — Sistema de Gestión</h1>
      </div>
      <SSTDashboard onNavigate={setSection} />
    </div>
  );
}