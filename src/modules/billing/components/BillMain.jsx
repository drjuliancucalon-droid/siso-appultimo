import React, { useState, useMemo } from 'react';
import { Receipt, Plus, Trash2, Printer, FileText, Download, Save, Search, Edit3, Building2, DollarSign } from 'lucide-react';
import { numeroALetras, getSpanishDate } from '../../../shared/lib/formatters.js';
import { useBill } from '../hooks/useBill.js';

// ═══════════════════════════════════════════════════════════════════════
// BILL MAIN COMPONENT - Lógica principal extraída del monolito Bill.jsx
// ═══════════════════════════════════════════════════════════════════════
export const BillMain = ({
  companies = [], savedBillsList = [], setSavedBillsList = () => {},
  currentUser, activeDoctorData, _sync = () => {}, 
  showAlert = () => {}, showConfirm = () => {},
  patientsList = [], usersList = [],
  dianProvider, setDianProvider, dianApiKey, setDianApiKey
}) => {
  const [activeTab, setActiveTab] = useState('nueva');
  const [billData, setBillData] = useState({
    number: '001',
    type: 'empresa',
    companyId: '',
    clientName: '',
    clientNit: '',
    medicoId: '',
    tipoServicio: 'ingreso',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    amountWords: '',
    concept: '',
    bankName: '',
    accountType: '',
    accountNumber: '',
    totalPacientes: 0,
    precioPaciente: 0,
    billDoctorId: '',
    emitidaPor: 'organizacion',
  });
  
  // 🎯 USE BILL HOOK - Toda la lógica del monolito
  const {
    lineItems, searchBill, previewBill, editingBillId,
    setLineItems, setSearchBill, setPreviewBill, setEditingBillId,
    formatCOP, calcTotal,
    addLineItem, removeLineItem, updateLineItem,
    handleCompanySelect, handleSaveBill, handlePrint,
    filteredBills
  } = useBill({
    companies, savedBillsList, setSavedBillsList, currentUser, activeDoctorData,
    _sync, showAlert, showConfirm, patientsList, usersList, dianProvider,
    billData, setBillData, setActiveTab
  });

  // ══ RENDER NUEVA CUENTA ══
  const renderNuevaCuenta = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-black flex items-center gap-2">
          <Receipt className="w-6 h-6" />
          {editingBillId ? 'Editar Cuenta de Cobro' : 'Nueva Cuenta de Cobro'}
        </h2>
      </div>

      {/* Datos generales */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-black text-gray-800 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" /> Datos Generales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" value={billData.number || ''} onChange={e => setBillData(prev => ({ ...prev, number: e.target.value }))}
            placeholder="001" className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          <input type="date" value={billData.date || ''} onChange={e => setBillData(prev => ({ ...prev, date: e.target.value }))}
            className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          <select value={billData.type || 'empresa'} onChange={e => setBillData(prev => ({ ...prev, type: e.target.value }))}
            className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
            <option value="empresa">Empresa</option>
            <option value="particular">Particular</option>
          </select>
        </div>
      </div>

      {/* Cliente */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-black text-gray-800 text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-600" /> Cliente
        </h3>
        {billData.type === 'empresa' && companies.length > 0 && (
          <select value={billData.companyId || ''} onChange={e => handleCompanySelect(e.target.value, setBillData)}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
            <option>— Seleccione empresa —</option>
            {companies.map(c => <option key={c.id || c.nit} value={c.id}>{c.nombre} (NIT: {c.nit})</option>)}
          </select>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={billData.clientName || ''} onChange={e => setBillData(prev => ({ ...prev, clientName: e.target.value }))}
            placeholder="Nombre del cliente" className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          <input type="text" value={billData.clientNit || ''} onChange={e => setBillData(prev => ({ ...prev, clientNit: e.target.value }))}
            placeholder="NIT o cédula" className="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      {/* Ítems y Total */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex justify-between">
          <h3 className="font-black text-gray-800 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-600" /> Ítems
          </h3>
          <button onClick={addLineItem} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200">
            <Plus className="w-3 h-3" /> Agregar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 text-xs font-bold text-gray-600">Servicio</th>
                <th className="w-20 p-2 text-xs font-bold text-gray-600">Cant.</th>
                <th className="w-32 p-2 text-xs font-bold text-gray-600">Precio Unit.</th>
                <th className="w-32 p-2 text-xs font-bold text-gray-600">Subtotal</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map(li => (
                <tr key={li.id} className="border-b border-gray-100">
                  <td><input type="text" value={li.servicio} onChange={e => updateLineItem(li.id, 'servicio', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-xs" /></td>
                  <td><input type="number" min="1" value={li.cantidad} onChange={e => updateLineItem(li.id, 'cantidad', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-xs text-center" /></td>
                  <td><input type="number" min="0" value={li.precioUnitario} onChange={e => updateLineItem(li.id, 'precioUnitario', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-xs text-right" /></td>
                  <td className="p-2 text-right text-xs font-bold text-gray-700">{formatCOP((parseFloat(li.cantidad) || 0) * (parseFloat(li.precioUnitario) || 0))}</td>
                  <td><button onClick={() => removeLineItem(li.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 min-w-[250px]">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">TOTAL:</span>
              <span className="text-xl font-black text-emerald-700">{formatCOP(calcTotal())}</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 italic">Son: {numeroALetras(calcTotal()).toLowerCase()} pesos mcte</p>
          </div>
        </div>
      </div>

      {/* Datos bancarios */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-2">
        <h3 className="font-black text-blue-800 text-sm flex items-center gap-2">🏦 Datos Bancarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p><strong>Banco:</strong> {activeDoctorData?.banco || 'No configurado'}</p>
          <p><strong>N° Cuenta:</strong> {activeDoctorData?.numeroCuenta || 'N/A'}</p>
          <p><strong>Titular:</strong> {activeDoctorData?.nombre || 'N/A'}</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => handleSaveBill(billData, setBillData, setActiveTab)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow">
          <Save className="w-4 h-4" /> Guardar
        </button>
        <button onClick={() => handlePrint()} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow">
          <Printer className="w-4 h-4" /> Imprimir
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 shadow">
          <Download className="w-4 h-4" /> DIAN XML
        </button>
      </div>
    </div>
  );

  // ══ RENDER LISTA ══
  const renderListaCuentas = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-800">Cuentas Guardadas ({savedBillsList.length})</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchBill} onChange={e => setSearchBill(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64" placeholder="Buscar..." />
        </div>
      </div>

      {filteredBills.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-bold">No hay cuentas</p>
        </div>
      ) : (
        filteredBills.map(bill => (
          <div key={bill.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-sm">Cuenta {bill.number} — {bill.clientName}</p>
                <p className="text-xs text-gray-500">{getSpanishDate(bill.date)} · NIT: {bill.clientNit}</p>
              </div>
              <div className="text-lg font-black text-emerald-700">{formatCOP(bill.total)}</div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handlePrint(bill)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">
                <Printer className="w-3 h-3" /> Imprimir
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200">
                <Download className="w-3 h-3" /> DIAN
              </button>
              <button onClick={() => { /* edit logic */ }} className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200">
                <Edit3 className="w-3 h-3" /> Editar
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200">
                <Trash2 className="w-3 h-3" /> Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // ══ MAIN RENDER ══
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('nueva')} 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${activeTab === 'nueva' ? 'bg-emerald-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          <Plus className="w-4 h-4" /> Nueva Cuenta
        </button>
        <button onClick={() => setActiveTab('lista')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${activeTab === 'lista' ? 'bg-emerald-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          <FileText className="w-4 h-4" /> Guardadas ({savedBillsList.length})
        </button>
      </div>

      {activeTab === 'nueva' && renderNuevaCuenta()}
      {activeTab === 'lista' && renderListaCuentas()}
    </div>
  );
};

