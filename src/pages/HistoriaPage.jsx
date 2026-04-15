// src/pages/HistoriaPage.jsx — Historia Clínica wrapper
// OccupationalHC has both named and default export — use default
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OccupationalHC from '../modules/clinical/components/OccupationalHC';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { Stethoscope } from 'lucide-react';

export default function HistoriaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const aiConfig = useAIStore((s) => s.getConfig());

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <OccupationalHC
        patientId={id}
        currentUser={currentUser}
        aiConfig={aiConfig}
        onBack={() => navigate('/patients')}
      />
    </div>
  );
}
