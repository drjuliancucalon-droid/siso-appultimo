// src/modules/companies/hooks/useCompanies.js
// Hook principal para gestión de empresas (extraído de Companies.jsx)
import { useState, useMemo, useCallback, useRef } from 'react';

export const useCompanies = ({
  companies = [],
  setCompanies,
  newComp = {},
  setNewComp,
  patientsList = [],
  currentUser,
  _syncCompanies,
  showAlert = () => {},
  showConfirm = () => {},
  editingCompany,
  setEditingCompany,
  encuestas = [],
  setEncuestas,
  sedeForm,
  setSedeForm,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [detailCompany, setDetailCompany] = useState(null);
  const [showConvenio, setShowConvenio] = useState(false);
  const logoInputRef = useRef(null);

  // Estado de nueva encuesta — centralizado aquí para evitar scope error
  const [newEncuesta, setNewEncuesta] = useState({
    empresaId: '', empresaNombre: '', tipoExamen: 'INGRESO', fechaLimite: ''
  });

  const formatCOP = useCallback((n) => {
    const v = parseFloat(n) || 0;
    return v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return companies;
    const q = searchTerm.toLowerCase();
    return companies.filter(c =>
      (c.nombre || '').toLowerCase().includes(q) ||
      (c.nit || '').toLowerCase().includes(q) ||
      (c.ciudad || '').toLowerCase().includes(q) ||
      (c.gerente || '').toLowerCase().includes(q)
    );
  }, [companies, searchTerm]);

  const getPatientCount = useCallback((comp) => {
    return patientsList.filter(p =>
      p.empresaId === comp.id || p.empresaNit === comp.nit ||
      (p.empresaNombre || '').toLowerCase() === (comp.nombre || '').toLowerCase()
    ).length;
  }, [patientsList]);

  const resetForm = useCallback(() => {
    setNewComp({
      nombre: '', nit: '', dv: '', codActividad: '', actividad: '',
      direccion: '', ciudad: '', telefono: '', correo: '', arl: '', gerente: '',
      tarifaIngreso: '', tarifaPeriodico: '', tarifaEgreso: '', tarifaConsulta: '',
      condicionesPago: 'contado', convenioFecha: '', convenioVencimiento: '',
      descuento: '', portalActivo: false, notasConvenio: '',
      medicoIds: [], sedes: [], logo: '', lema: '',
    });
  }, [setNewComp]);

  const handleSaveCompany = useCallback(() => {
    if (!newComp.nombre || !newComp.nit) {
      showAlert('⚠️ Nombre y NIT son obligatorios.');
      return;
    }

    const companyToSave = {
      ...newComp,
      id: editingCompany?.id || 'EMP-' + Date.now(),
      fechaCreacion: editingCompany?.fechaCreacion || new Date().toISOString(),
      ultimaModificacion: new Date().toISOString(),
      creadoPor: currentUser?.user,
    };

    setCompanies(prev => {
      const exists = prev.findIndex(c => c.id === companyToSave.id);
      const updated = exists >= 0
        ? prev.map(c => c.id === companyToSave.id ? companyToSave : c)
        : [...prev, companyToSave];
      _syncCompanies?.(updated);
      return updated;
    });

    resetForm();
    setShowModal(false);
    setEditingCompany?.(null);
    showAlert(`✅ Empresa "${companyToSave.nombre}" guardada.`);
  }, [newComp, editingCompany, currentUser, setCompanies, _syncCompanies, showAlert, resetForm, setShowModal, setEditingCompany]);

  const handleEditCompany = useCallback((comp) => {
    setNewComp({ ...comp });
    setEditingCompany?.(comp);
    setShowModal(true);
  }, [setNewComp, setEditingCompany, setShowModal]);

  const handleDeleteCompany = useCallback((comp) => {
    showConfirm(`¿Eliminar la empresa "${comp.nombre}"?`, () => {
      setCompanies(prev => {
        const updated = prev.filter(c => c.id !== comp.id);
        _syncCompanies?.(updated);
        return updated;
      });
      showAlert(`🗑️ Empresa "${comp.nombre}" eliminada.`);
    });
  }, [setCompanies, _syncCompanies, showConfirm, showAlert]);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      showAlert('⚠️ El logo debe ser menor a 500 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNewComp(prev => ({ ...prev, logo: reader.result }));
    reader.readAsDataURL(file);
  }, [setNewComp, showAlert]);

  const handleTogglePortal = useCallback((comp) => {
    setCompanies(prev => {
      const updated = prev.map(c => c.id === comp.id ? { ...c, portalActivo: !c.portalActivo } : c);
      _syncCompanies?.(updated);
      return updated;
    });
    showAlert(comp.portalActivo ? '🔒 Portal empresa desactivado.' : '🌐 Portal empresa activado.');
  }, [setCompanies, _syncCompanies, showAlert]);

  const handleAddSede = useCallback(() => {
    if (!sedeForm?.nombre || !sedeForm?.ciudad) {
      showAlert('⚠️ Complete nombre y ciudad de la sede.');
      return;
    }
    setNewComp(prev => ({
      ...prev,
      sedes: [...(prev.sedes || []), { ...sedeForm, id: 'SEDE-' + Date.now() }],
    }));
    setSedeForm?.({ nombre: '', ciudad: '', direccion: '' });
  }, [sedeForm, setNewComp, setSedeForm, showAlert]);

  const handleRemoveSede = useCallback((sedeId) => {
    setNewComp(prev => ({
      ...prev,
      sedes: (prev.sedes || []).filter(s => s.id !== sedeId),
    }));
  }, [setNewComp]);

  const handleCrearEncuesta = useCallback(() => {
    if (!newEncuesta.empresaId || !newEncuesta.empresaNombre) {
      showAlert('⚠️ Seleccione una empresa.');
      return;
    }
    const token = Math.random().toString(36).substring(2, 10);
    const enc = {
      id: Date.now(),
      token,
      empresaId: newEncuesta.empresaId,
      empresaNombre: newEncuesta.empresaNombre,
      tipoExamen: newEncuesta.tipoExamen,
      fechaLimite: newEncuesta.fechaLimite,
      fechaCreacion: new Date().toISOString(),
      respuestas: [],
      estado: 'activa',
    };
    const updated = [...encuestas, enc];
    setEncuestas?.(updated);
    localStorage.setItem("siso_encuestas", JSON.stringify(updated));
    const url = window.location.origin + window.location.pathname + "#encuesta?token=" + token;
    showAlert("✅ Encuesta creada!\n\n📋 Link:\n" + url + "\n\nComparta este link con los trabajadores.");
    setNewEncuesta({ empresaId: '', empresaNombre: '', tipoExamen: 'INGRESO', fechaLimite: '' });
  }, [newEncuesta, encuestas, setEncuestas, showAlert]);

  return {
    searchTerm, setSearchTerm,
    showModal, setShowModal,
    detailCompany, setDetailCompany,
    showConvenio, setShowConvenio,
    formatCOP,
    filteredCompanies,
    getPatientCount,
    resetForm,
    handleSaveCompany,
    handleEditCompany,
    handleDeleteCompany,
    handleLogoUpload,
    handleTogglePortal,
    handleAddSede,
    handleRemoveSede,
    handleCrearEncuesta,
    newEncuesta, setNewEncuesta,
    logoInputRef,
  };
};

