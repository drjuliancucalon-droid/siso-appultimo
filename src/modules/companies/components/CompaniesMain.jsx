// src/modules/companies/components/CompaniesMain.jsx
// Componente principal - UI + lógica extraída del monolito

import React from 'react';
import { 
  Building2, Plus, Search, Trash2, Edit3, Eye, X, Save, Upload,
  Users, MapPin, Phone, Mail, FileText, ExternalLink 
} from 'lucide-react';
import { _isAdmin } from '../../../shared/data/planConfig.js';
import { useCompanies } from '../hooks/useCompanies.js';

export const CompaniesMain = ({
  companies, setCompanies, newComp, setNewComp,
  patientsList = [], currentUser, _syncCompanies, goTo,
  encuestas, setEncuestas, sedeForm, setSedeForm,
  showAlert, showConfirm,
}) => {
  const [newEncuesta, setNewEncuesta] = React.useState({ empresaId: '', empresaNombre: '', tipoExamen: 'INGRESO', fechaLimite: '' });
  
  const { 
    searchTerm, setSearchTerm, showModal, setShowModal, detailCompany, setDetailCompany,
    showConvenio, setShowConvenio, formatCOP, filteredCompanies, getPatientCount,
    resetForm, handleSaveCompany, handleEditCompany, handleDeleteCompany,
    handleLogoUpload, handleTogglePortal, handleAddSede, handleRemoveSede,
    logoInputRef
  } = useCompanies({
    companies, setCompanies, newComp, setNewComp, patientsList, currentUser,
    _syncCompanies, showAlert, showConfirm, sedeForm, setSedeForm,
    encuestas, setEncuestas
  });
  
  const handleCrearEncuesta = () => {
    if (!newEncuesta.empresaId || !newEncuesta.empresaNombre) {
      showAlert?.('⚠️ Seleccione una empresa.');
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
    setEncuestas(updated);
    localStorage.setItem("siso_encuestas", JSON.stringify(updated));
    const url = window.location.origin + window.location.pathname + "#encuesta?token=" + token;
    showAlert?.("✅ Encuesta creada!\n\n📋 Link:\n" + url + "\n\nComparta este link con los trabajadores.");
    setNewEncuesta({ empresaId: '', empresaNombre: '', tipoExamen: 'INGRESO', fechaLimite: '' });
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Building2 className="w-6 h-6" /> Empresas
            </h2>
            <p className="text-purple-100 text-sm mt-1">{companies.length} empresas registradas</p>
          </div>
          {_isAdmin(currentUser?.role) && (
            <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm">
              <Plus className="w-4 h-4" /> Nueva Empresa
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 -translate-y-1/2" />
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" placeholder="Buscar por nombre, NIT..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCompanies.map(comp => {
          const patCount = getPatientCount(comp);
          return (
            <div key={comp.id} className="bg-white border rounded-xl p-5 hover:shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-800 text-sm">{comp.nombre}</p>
                  <p className="text-xs text-gray-500">NIT: {comp.nit}</p>
                  <span className="text-[10px] text-blue-600 font-bold">{patCount} pacientes</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setDetailCompany(comp)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">Ver</button>
                <button onClick={() => handleEditCompany(comp)} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">Editar</button>
                <button onClick={() => handleTogglePortal(comp)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">Portal</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl p-5 text-white flex items-center justify-between">
              <h3 className="font-black text-lg">Nueva Empresa</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 block mb-1">Razón Social *</label>
                  <input type="text" value={newComp.nombre || ''} onChange={e => setNewComp(p => ({ ...p, nombre: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Nombre de la empresa" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">NIT *</label>
                  <input type="text" value={newComp.nit || ''} onChange={e => setNewComp(p => ({ ...p, nit: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" placeholder="900.123.456-7" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Teléfono</label>
                  <input type="text" value={newComp.telefono || ''} onChange={e => setNewComp(p => ({ ...p, telefono: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" placeholder="601 234 5678" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Correo electrónico</label>
                  <input type="email" value={newComp.correo || ''} onChange={e => setNewComp(p => ({ ...p, correo: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" placeholder="empresa@correo.com" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Dirección</label>
                  <input type="text" value={newComp.direccion || ''} onChange={e => setNewComp(p => ({ ...p, direccion: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Calle 123 # 45-67" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Ciudad</label>
                  <input type="text" value={newComp.ciudad || ''} onChange={e => setNewComp(p => ({ ...p, ciudad: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Bogotá" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">ARL</label>
                  <select value={newComp.arl || ''} onChange={e => setNewComp(p => ({ ...p, arl: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm">
                    <option value="">Seleccionar ARL</option>
                    <option>Sura</option>
                    <option>Positiva</option>
                    <option>Colmena</option>
                    <option>Bolívar</option>
                    <option>Equidad</option>
                    <option>Liberty</option>
                    <option>Alfa</option>
                    <option>Mapfre</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Clase de Riesgo</label>
                  <select value={newComp.claseRiesgo || ''} onChange={e => setNewComp(p => ({ ...p, claseRiesgo: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm">
                    <option value="">Seleccionar</option>
                    <option value="I">I — Mínimo</option>
                    <option value="II">II — Bajo</option>
                    <option value="III">III — Medio</option>
                    <option value="IV">IV — Alto</option>
                    <option value="V">V — Máximo</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 block mb-1">Actividad Económica</label>
                  <input type="text" value={newComp.actividadEconomica || ''} onChange={e => setNewComp(p => ({ ...p, actividadEconomica: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Ej: Manufactura, Servicios, Comercio..." />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 block mb-1">Representante Legal</label>
                  <input type="text" value={newComp.representanteLegal || ''} onChange={e => setNewComp(p => ({ ...p, representanteLegal: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Nombre completo del representante legal" />
                </div>
              </div>
              <button onClick={handleSaveCompany} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold mt-2">
                <Save className="w-4 h-4" /> Guardar Empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

