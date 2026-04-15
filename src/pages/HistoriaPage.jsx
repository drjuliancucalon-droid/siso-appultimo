import React from 'react';
import { useParams } from 'react-router-dom';
import OccupationalHC from '../modules/clinical/components/OccupationalHC';
import { Stethoscope } from 'lucide-react';

export default function HistoriaPage() {
  const { id } = useParams();
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Stethoscope className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Historia Clínica Ocupacional</h1>
      </div>
      <OccupationalHC patientId={id} />
    </div>
  );
}
