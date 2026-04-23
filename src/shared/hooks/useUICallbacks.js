import { toast } from 'react-hot-toast'; // Si no existe, usar alert fallback
import { useState } from 'react';

export const useUICallbacks = () => {
  // Reemplazo modular de showAlert / showConfirm del monolito
  const [confirming, setConfirming] = useState(false);
  
  const showAlert = (message, type = 'info') => {
    toast(message, { 
      type,
      duration: 4000,
      position: 'top-right',
    });
  };
  
  const showConfirm = (message, onConfirm, options = {}) => {
    const confirmText = options.confirmText || 'Confirmar';
    const cancelText = options.cancelText || 'Cancelar';
    
    if (confirming) return;
    
    const confirmed = window.confirm(message);
    if (confirmed) {
      onConfirm();
    }
    return confirmed;
  };
  
  return { showAlert, showConfirm };
};

