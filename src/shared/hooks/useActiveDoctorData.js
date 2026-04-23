import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import { useBackendObject } from '../../hooks/useBackendData.js';

// Hook compartido: activeDoctorData para todos los módulos (extraído de monolito)
// Retorna datos del médico activo para facturas, certificados, etc.
export const useActiveDoctorData = () => {
  const { currentUser } = useAuthStore();
  const { data: doctorData } = useBackendObject('/data/doctor', 'siso_doctor_data', 'doctor');
  const { data: signatureData } = useBackendObject('/data/doctor_signature', 'siso_doctor_signature', 'signature');
  
  const [activeDoctor, setActiveDoctor] = useState(null);
  
  useEffect(() => {
    const doctor = doctorData || {
      nombre: currentUser?.nombre || currentUser?.user || 'Médico Ocupacional',
      cedula: currentUser?.cedula || '',
      titulo: currentUser?.titulo || 'Medicina del Trabajo',
      licencia: currentUser?.licencia || '',
      ciudad: currentUser?.ciudad || 'Popayán',
      celular: currentUser?.celular || '',
      email: currentUser?.email || '',
      // Datos bancarios (de shared data o doctor profile)
      banco: currentUser?.banco || '',
      tipoCuenta: currentUser?.tipoCuenta || 'Ahorros',
      numeroCuenta: currentUser?.numeroCuenta || '',
    };
    setActiveDoctor(doctor);
  }, [doctorData, currentUser]);
  
  return {
    activeDoctor,
    signature: signatureData?.signature || null,
    isLoading: !doctorData && !currentUser,
  };
};

