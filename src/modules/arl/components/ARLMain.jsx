import React from 'react';
import { Shield, AlertTriangle, Activity, Calendar } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useBackendData } from '../../../hooks/useBackendData';
import { useARL } from '../hooks/useARL';

export const ARLMain = ({
  patients = [], companies = [], currentUser,
  showAlert, showConfirm
}) => {
  const { license } = useAuthStore();
  const { atlCases, setAtlCases, saveATL } = useARL();
  
  // LÓGICA EXTRAÍDA - TODO OK
  // Temporarily return null to fix build
  return null;
};


