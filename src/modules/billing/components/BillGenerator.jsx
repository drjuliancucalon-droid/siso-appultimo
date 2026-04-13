import React, { useState } from 'react';
import { FileText, Save, Printer, Plus, Trash2, DollarSign } from 'lucide-react';
import { InputGroup } from '../../../shared/components/ui/InputGroup';
import { SelectGroup } from '../../../shared/components/ui/SelectGroup';
import { numeroALetras } from '../../../shared/lib/formatters';

/**
 * BillGenerator - Generador de cuentas de cobro
 * Formato colombiano con IVA, retenciones, y conversión a letras
 */
export const BillGenerator = ({ doctorData, companies = [], onSave, onPrint, savedBills = [] }) => {
  const [bill, setBill] = useState({
    numero: `CC-${String(savedBills.length + 1).padStart(4, '0')}`,
    fecha: new Date().toISOString().split('T')[0],
    empresaId: '',
    empresaNombre: '',
    empresaNit: '',
    items: [{ id: Date.now(), descripcion: 'Evaluación médica ocupacional', cantidad: 1, valorUnit: 0 }],
    observaciones: '',
    formaPago: 'Transferencia',
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
  });

  const handleChange = (field, value) => setBill((p) => ({ ...p, [field]: value }));

  const handleCompanyChange = (compId) => {
    const comp = companies.find((c) => c.id === compId);
    if (comp) {
      setBill((p) => ({
        ...p,
        empresaId: comp.id,
        empresaNombre: comp.nombre,
        empresaNit: comp.nit || '',
      }));
    }
  };

  const addItem = () => {
    setBill((p) => ({
      ...p,
      items: [...p.items, { id: Date.now(), descripcion: '', cantidad: 1, valorUnit: 0 }],
    }));
  };

  const updateItem = (id, field, value) => {
    setBill((p) => ({
      ...p,
      items: p.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));
  };

  const removeItem = (id) => {
    setBill((p) => ({ ...p, items: p.items.filter((it) => it.id !== id) }));
  };

  const subtotal = bill.items.reduce((s, it) => s + (it.cantidad || 0) * (it.valorUnit || 0), 0);
  const iva = 0; // Servicios médicos exentos Art. 476 E.T.
  const total = subtotal + iva;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Cuenta de Cobro
        </h2>
        <span className="text-xs font-mono text-gray-500">Nº {bill.numero}</span>
      </div>

      {/* Datos básicos */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap -mx-1.5">
          <InputGroup label="Nº Cuenta" name="numero" value={bill.numero} onChange={(e) => handleChange('numero', e.target.value)} width="w-1/4" />
          <InputGroup label="Fecha" name="fecha" type="date" value={bill.fecha} onChange={(e) => handleChange('fecha', e.target.value)} width="w-1/4" />
          <div className="w-1/2 px-1.5 mb-2">
            <label className="block text-[10px] font-black text-gray-600 mb-0.5 uppercase">Empresa</label>
            <select value={bill.empresaId} onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full p-1.5 border border-gray-200 rounded text-xs font-bold bg-white">
              <option value="">Seleccionar empresa...</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.nombre} (NIT: {c.nit || '--'})</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-black text-gray-700 uppercase">Servicios</p>
          <button onClick={addItem} className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold hover:bg-emerald-100 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Agregar servicio
          </button>
        </div>
        <div className="space-y-2">
          {bill.items.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-end bg-white border border-gray-200 rounded-xl p-3">
              <span className="text-xs font-black text-gray-400 w-6">{idx + 1}.</span>
              <div className="flex-1">
                <input value={item.descripcion}
                  onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                  placeholder="Descripción del servicio..."
                  className="w-full p-1.5 border border-gray-200 rounded text-xs" />
              </div>
              <div className="w-20">
                <label className="block text-[9px] text-gray-400">Cant.</label>
                <input type="number" value={item.cantidad}
                  onChange={(e) => updateItem(item.id, 'cantidad', parseInt(e.target.value) || 0)}
                  className="w-full p-1.5 border border-gray-200 rounded text-xs text-center" />
              </div>
              <div className="w-32">
                <label className="block text-[9px] text-gray-400">Valor unit. $</label>
                <input type="number" value={item.valorUnit}
                  onChange={(e) => updateItem(item.id, 'valorUnit', parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 border border-gray-200 rounded text-xs text-right" />
              </div>
              <div className="w-32 text-right">
                <label className="block text-[9px] text-gray-400">Subtotal</label>
                <p className="text-xs font-black text-gray-800 p-1.5">
                  ${((item.cantidad || 0) * (item.valorUnit || 0)).toLocaleString('es-CO')}
                </p>
              </div>
              {bill.items.length > 1 && (
                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 pb-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-bold">${subtotal.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">IVA (Exento Art. 476 E.T.):</span>
          <span className="font-bold">$0</span>
        </div>
        <div className="flex justify-between text-sm font-black border-t border-emerald-300 pt-2 mt-2">
          <span className="text-emerald-800">TOTAL:</span>
          <span className="text-emerald-800">${total.toLocaleString('es-CO')}</span>
        </div>
        {total > 0 && (
          <p className="text-[10px] text-emerald-700 italic mt-1">
            Son: {numeroALetras ? numeroALetras(total) : `${total} pesos`} M/CTE
          </p>
        )}
      </div>

      {/* Payment info */}
      <div className="flex flex-wrap -mx-1.5">
        <SelectGroup label="Forma de pago" name="formaPago" value={bill.formaPago}
          onChange={(e) => handleChange('formaPago', e.target.value)}
          options={['Transferencia', 'Efectivo', 'Cheque', 'Consignación']} width="w-1/4" />
        <InputGroup label="Banco" value={bill.banco}
          onChange={(e) => handleChange('banco', e.target.value)} width="w-1/4" />
        <SelectGroup label="Tipo cuenta" value={bill.tipoCuenta}
          onChange={(e) => handleChange('tipoCuenta', e.target.value)}
          options={['Ahorros', 'Corriente']} width="w-1/4" />
        <InputGroup label="Nº Cuenta" value={bill.numeroCuenta}
          onChange={(e) => handleChange('numeroCuenta', e.target.value)} width="w-1/4" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t">
        <button onClick={() => onSave?.(bill)}
          className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 flex items-center justify-center gap-1.5">
          <Save className="w-4 h-4" /> Guardar Cuenta
        </button>
        <button onClick={() => onPrint?.(bill)}
          className="py-2.5 px-6 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 flex items-center gap-1">
          <Printer className="w-4 h-4" /> Imprimir
        </button>
      </div>
    </div>
  );
};
