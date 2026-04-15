// src/pages/PatientsPage.jsx — Patient management page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientList } from '../modules/patients/components/PatientList';
import { Users } from 'lucide-react';

export default function PatientsPage() {
  const navigate = useNavigate();

  const handleSelectPatient = (patient) => {
    if (patient?.docNumero) {
      navigate(`/patients/${patient.docNumero}/hc`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Pacientes</h1>
      </div>
      <PatientList onSelect={handleSelectPatient} />
    </div>
  );
}
