// src/pages/CertificadoPage.jsx — Certificate of Aptitude view
// BUG-C2: clave localStorage correcta | BUG-D1: botón WhatsApp
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CertificateView } from '../modules/clinical/components/CertificateView';
import { useAuthStore } from '../stores/authStore';
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
import { _generarCertificadoHTMLNormalizado } from '../shared/lib/printUtils';
import { openPrintWindow } from '../lib/printService';
import { ArrowLeft, Printer, FileText, Loader2, MessageCircle } from 'lucide-react';

export default function CertificadoPage() {
  const { id } = useParams(); // patient docNumero
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  // BUG-C2 fix: clave localStorage correcta (no legacy siso_db_patients)
  const userId = currentUser?.user || currentUser?.id || 'drcucalon';
  const { data: patients, loading } = useBackendData('/data/patients', `siso_patients_${userId}`, 'patients');
  const { data: doctor } = useBackendObject('/data/doctor', `siso_doctor_data_${userId}`, 'doctor');

  const [patient, setPatient] = useState(null);

  useEffect(() => {
    if (id && patients.length > 0) {
      const found = patients.find((p) => p.docNumero === id || p.id === id);
      setPatient(found || null);
    }
  }, [id, patients]);

  const activeDoctorData = doctor || { nombre: currentUser?.nombre || 'Medico', licencia: '' };

  const handlePrint = () => {
    if (!patient) return;
    try {
      const html = _generarCertificadoHTMLNormalizado(patient, activeDoctorData, null, '#059669');
      openPrintWindow(`Certificado - ${patient.nombres || 'Paciente'}`, html);
    } catch (err) {
      window.print();
    }
  };

  // BUG-D1 fix: compartir por WhatsApp con enlace de verificacion
  const handleWhatsApp = () => {
    if (!patient) return;
    const domain = import.meta.env?.VITE_STABLE_DOMAIN || 'https://siso-appultimo-arp.pages.dev';
    const verUrl = patient.codigoVerificacion
      ? domain + '/verificar/' + patient.codigoVerificacion
      : domain;
    const nombre = patient.nombreCompleto || patient.nombres || '';
    const empresa = patient.empresa || patient.empresaNombre || '';
    const concepto = patient.conceptoAptitud || '';
    const fecha = patient.fechaExamen || '';
    const msg = encodeURIComponent(
      '✅ *Certificado de Aptitud Laboral*\n' +
      '👤 ' + nombre + '\n' +
      '🏢 Empresa: ' + empresa + '\n' +
      '🩺 Concepto: ' + concepto + '\n' +
      '📅 Fecha: ' + fecha + '\n' +
      '🔗 Verificar: ' + verUrl
    );
    window.open('https://wa.me/?text=' + msg, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver a pacientes
        </button>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <FileText className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <p className="text-yellow-800 font-bold">Paciente no encontrado</p>
          <p className="text-yellow-600 text-sm mt-1">No se encontro un paciente con documento: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="flex items-center gap-2">
          {/* BUG-D1: boton WhatsApp wa.me */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg transition"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
          <button onClick={handlePrint} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:opacity-90 flex items-center gap-2">
            <Printer className="w-4 h-4" /> Imprimir Certificado
          </button>
        </div>
      </div>

      <CertificateView
        data={patient}
        activeDoctorData={activeDoctorData}
        activeSignature={null}
        currentUser={currentUser}
        onDownloadRDA={() => {}}
        onPrintCarnet={() => {}}
      />
    </div>
  );
}
