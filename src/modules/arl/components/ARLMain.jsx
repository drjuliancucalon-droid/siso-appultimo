import React, { useState } from 'react';
import { useARL } from '../hooks/useARL';


import { 
  FileText, Calendar, User, Briefcase, CheckCircle2, XCircle,
  Save, Printer, Search, Filter, Download, Users
} from 'lucide-react';
import { InputGroup } from '../../../shared/components/ui/InputGroup';

export const ARLMain = ({ patients, companies, currentUser, showAlert, showConfirm }) => {
  const { atlCases, saveATL } = useARL();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [newCase, setNewCase] = useState({ 
    empresa: '', 
    nit: '', 
    fecha: '', 
    tipo: 'ATL', 
    descripcion: '', 
    estado: 'pendiente',
    trabajadores: []
  });
  
  const filteredCases = atlCases.filter(c => 
    (c.empresa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.nit || '').includes(searchTerm) ||
    (c.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveCase = () => {
    const caseToSave = {
      ...newCase,
      id: Date.now(),
      fechaCreacion: new Date().toISOString(),
      estado: 'pendiente'
    };
    saveATL([...atlCases, caseToSave]);
    setNewCase({ empresa: '', nit: '', fecha: '', tipo: 'ATL', descripcion: '', estado: 'pendiente', trabajadores: [] });
    showAlert?.('✅ Caso ATL guardado');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <Briefcase className="w-8 h-8" />
          Gestión ARL - ATL
        </h2>
        <p className="text-orange-100">{atlCases.length} casos registrados</p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
            placeholder="Buscar casos..."
          />
        </div>
        <select 
          value={filterEmpresa}
          onChange={(e) => setFilterEmpresa(e.target.value)}
          className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Todas las empresas</option>
          {companies.map(c => (
            <option key={c.id} value={c.nit}>{c.nombre} ({c.nit})</option>
          ))}
        </select>
      </div>

      {/* Nuevo caso */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Caso ATL
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputGroup 
            label="Empresa" 
            value={newCase.empresa}
            onChange={(e) => setNewCase({...newCase, empresa: e.target.value})}
          />
          <InputGroup 
            label="NIT" 
            value={newCase.nit}
            onChange={(e) => setNewCase({...newCase, nit: e.target.value})}
          />
          <InputGroup 
            label="Fecha" 
            type="date"
            value={newCase.fecha}
            onChange={(e) => setNewCase({...newCase, fecha: e.target.value})}
          />
          <select 
            value={newCase.tipo}
            onChange={(e) => setNewCase({...newCase, tipo: e.target.value})}
            className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
          >
            <option value="ATL">ATL</option>
            <option value="Enfermedad Laboral">Enfermedad Laboral</option>
          </select>
          <InputGroup 
            label="Estado" 
            value={newCase.estado}
            onChange={(e) => setNewCase({...newCase, estado: e.target.value})}
          />
          <div>
            <button 
              onClick={handleSaveCase}
              className="w-full p-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Caso
            </button>
          </div>
        </div>
        <textarea 
          value={newCase.descripcion}
          onChange={(e) => setNewCase({...newCase, descripcion: e.target.value})}
          className="w-full p-3 mt-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
          rows="3"
          placeholder="Descripción detallada del caso..."
        />
      </div>

      {/* Lista casos */}
      <div className="space-y-3">
        {filteredCases.map((caso, idx) => (
          <div key={caso.id || idx} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    caso.estado === 'cerrado' ? 'bg-emerald-100 text-emerald-800' : 
                    caso.estado === 'pendiente' ? 'bg-amber-100 text-amber-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {caso.estado}
                  </div>
                  <h4 className="font-black text-lg">{caso.empresa}</h4>
                  <p className="text-sm text-gray-500">NIT: {caso.nit}</p>
                </div>
                <p className="text-sm text-gray-600 mb-3">{caso.descripcion}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span><Calendar className="w-3 h-3 inline mr-1" />{caso.fecha}</span>
                  <span><Users className="w-3 h-3 inline mr-1" />{caso.trabajadores?.length || 0} trabajadores</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Printer className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredCases.length === 0 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gray-700 mb-2">Sin casos ATL</h3>
            <p className="text-gray-500">Registre el primer caso usando el formulario superior</p>
          </div>
        )}
      </div>
    </div>
  );
};

