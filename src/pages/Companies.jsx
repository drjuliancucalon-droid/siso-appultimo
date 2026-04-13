// src/pages/Companies.jsx
// Gestión de empresas clientes
import React, { useState, useMemo } from 'react';
import {
  Building2, Search, Plus, Edit3, Trash2, Eye, Globe,
  Users, MapPin, Phone, Mail, X, Save, ChevronDown
} from 'lucide-react';

const EMPTY_COMPANY = {
  nombre: '', nit: '', direccion: '', telefono: '', email: '',
  ciudad: 'Popayán', departamento: 'Cauca', contacto: '',
  actividadEconomica: '', nivelRiesgo: '', arl: '',
  portalEnabled: false, portalCode: '',
};

export default function Companies({
  companies = [],
  onAdd,
  onEdit,
  onDelete,
  patientsList = [],
}) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_COMPANY });

  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(c =>
      (c.nombre || '').toLowerCase().includes(q) ||
      (c.nit || '').includes(q) ||
      (c.ciudad || '').toLowerCase().includes(q)
    );
  }, [companies, search]);

  const patientsPerCompany = useMemo(() => {
    const map = {};
    patientsList.forEach(p => {
      const key = p.empresa || p.companyId || '';
      if (key) map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [patientsList]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_COMPANY });
    setShowForm(true);
  };

  const openEdit = (company) => {
    setEditing(company);
    setForm({ ...EMPTY_COMPANY, ...company });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nombre.trim()) return;
    if (editing) {
      onEdit?.({ ...editing, ...form });
    } else {
      onAdd?.({ ...form, id: 'emp_' + Date.now() });
    }
    setShowForm(false);
  };

  const riesgoColors = { 1: 'green', 2: 'blue', 3: 'yellow', 4: 'orange', 5: 'red', I: 'green', II: 'blue', III: 'yellow', IV: 'orange', V: 'red' };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-emerald-500" />
            Empresas Clientes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {companies.length} empresa(s) registrada(s)
          </p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Empresa
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar empresa por nombre, NIT o ciudad..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none shadow-sm"
        />
      </div>

      {/* Lista de empresas */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-500">
            {search ? 'Sin resultados' : 'Sin empresas registradas'}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {search ? 'Intente con otro término de búsqueda.' : 'Registre su primera empresa cliente.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const nPat = patientsPerCompany[c.nombre] || patientsPerCompany[c.id] || 0;
            const rc = riesgoColors[c.nivelRiesgo] || 'gray';
            return (
              <div key={c.id || i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{c.nombre}</h3>
                    {c.nit && <p className="text-xs text-gray-500">NIT: {c.nit}</p>}
                  </div>
                  {c.nivelRiesgo && (
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-${rc}-100 text-${rc}-700 font-bold`}>
                      Riesgo {c.nivelRiesgo}
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  {c.ciudad && (
                    <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.ciudad}{c.departamento ? `, ${c.departamento}` : ''}</p>
                  )}
                  {c.telefono && (
                    <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.telefono}</p>
                  )}
                  {c.email && (
                    <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</p>
                  )}
                  <p className="flex items-center gap-1"><Users className="w-3 h-3" />{nPat} trabajador(es)</p>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                  <button onClick={() => openEdit(c)} className="flex-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg py-1.5 flex items-center justify-center gap-1">
                    <Edit3 className="w-3 h-3" /> Editar
                  </button>
                  <button onClick={() => onDelete?.(c)} className="text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg py-1.5 px-3 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {c.portalEnabled && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Portal
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">
                {editing ? 'Editar Empresa' : 'Nueva Empresa'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'nombre', label: 'Razón Social *', type: 'text' },
                { key: 'nit', label: 'NIT', type: 'text' },
                { key: 'direccion', label: 'Dirección', type: 'text' },
                { key: 'ciudad', label: 'Ciudad', type: 'text' },
                { key: 'departamento', label: 'Departamento', type: 'text' },
                { key: 'telefono', label: 'Teléfono', type: 'tel' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'contacto', label: 'Persona de contacto', type: 'text' },
                { key: 'actividadEconomica', label: 'Actividad Económica', type: 'text' },
                { key: 'arl', label: 'ARL', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key] || ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nivel de Riesgo ARL</label>
                <select
                  value={form.nivelRiesgo || ''}
                  onChange={e => setForm(prev => ({ ...prev, nivelRiesgo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {['I', 'II', 'III', 'IV', 'V'].map(n => (
                    <option key={n} value={n}>Nivel {n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700">
                Cancelar
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {editing ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
