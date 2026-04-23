import { useState, useCallback, useMemo } from 'react';
import { numeroALetras, getSpanishDate } from '../../../shared/lib/formatters.js';
import { _isAdmin } from '../../../shared/data/planConfig.js';

// ═══════════════════════════════════════════════════════════════════════
// BILL HOOK - Extraído de Bill.jsx monolito
// ═══════════════════════════════════════════════════════════════════════
export const useBill = ({
  companies = [], savedBillsList = [], setSavedBillsList = () => {},
  currentUser, activeDoctorData, _sync = () => {}, 
  showAlert = () => {}, showConfirm = () => {},
  patientsList = [], usersList = [],
  dianProvider, setDianProvider, dianApiKey, setDianApiKey
}) => {
  // ══ ESTADOS del monolito ══
  const [lineItems, setLineItems] = useState([
    { id: Date.now(), servicio: 'Examen médico ocupacional de ingreso', cantidad: 1, precioUnitario: 0, subtotal: 0 },
  ]);
  const [searchBill, setSearchBill] = useState('');
  const [previewBill, setPreviewBill] = useState(null);
  const [editingBillId, setEditingBillId] = useState(null);

  // ══ HELPERS del monolito ══
  const formatCOP = useCallback((n) => {
    const v = parseFloat(n) || 0;
    return v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  }, []);

  const calcTotal = useCallback(() => 
    lineItems.reduce((s, li) => s + (parseFloat(li.cantidad) || 0) * (parseFloat(li.precioUnitario) || 0), 0), [lineItems]);

  // ══ FUNCIONES CRUD del monolito ══
  const addLineItem = useCallback(() => {
    setLineItems(prev => [...prev, {
      id: Date.now(), servicio: '', cantidad: 1, precioUnitario: 0, subtotal: 0,
    }]);
  }, []);

  const removeLineItem = useCallback((id) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter(li => li.id !== id));
  }, [lineItems.length]);

  const updateLineItem = useCallback((id, field, value) => {
    setLineItems(prev => prev.map(li => {
      if (li.id !== id) return li;
      const updated = { ...li, [field]: value };
      updated.subtotal = (parseFloat(updated.cantidad) || 0) * (parseFloat(updated.precioUnitario) || 0);
      return updated;
    }));
  }, []);

  const handleCompanySelect = useCallback((compId, setBillData) => {
    const comp = companies.find(c => c.id === compId);
    if (comp) {
      setBillData(prev => ({
        ...prev,
        companyId: comp.id,
        clientName: comp.nombre,
        clientNit: comp.nit,
      }));
    }
  }, [companies]);

  const handleSaveBill = useCallback((billData, setBillData, setActiveTab) => {
    const total = calcTotal();
    if (!billData.clientName) {
      showAlert('⚠️ Seleccione o ingrese un cliente.');
      return;
    }
    if (total <= 0) {
      showAlert('⚠️ El total debe ser mayor a cero.');
      return;
    }

    const newBill = {
      id: editingBillId || 'BILL-' + Date.now(),
      ...billData,
      amount: total,
      amountWords: numeroALetras(total).toLowerCase() + ' pesos mcte',
      lineItems: [...lineItems],
      total,
      fechaCreacion: new Date().toISOString(),
      creadoPor: currentUser?.user,
      doctorNombre: activeDoctorData?.nombre || '',
      doctorCedula: activeDoctorData?.cedula || '',
      doctorLicencia: activeDoctorData?.licencia || '',
      banco: activeDoctorData?.banco || '',
      tipoCuenta: activeDoctorData?.tipoCuenta || '',
      numeroCuenta: activeDoctorData?.numeroCuenta || '',
      estado: 'Emitida',
    };

    setSavedBillsList(prev => {
      const exists = prev.findIndex(b => b.id === newBill.id);
      const updated = exists >= 0
        ? prev.map(b => b.id === newBill.id ? newBill : b)
        : [newBill, ...prev];
      _sync('siso_saved_bills', JSON.stringify(updated));
      return updated;
    });

    showAlert('✅ Cuenta de cobro guardada correctamente.');
    setBillData({});
    setEditingBillId(null);
    setActiveTab('lista');
  }, [calcTotal, editingBillId, lineItems, currentUser, activeDoctorData, _sync, setSavedBillsList, showAlert]);

  const handlePrint = useCallback((bill) => {
    const b = bill || { lineItems, total: calcTotal() };
    // HTML template del monolito - EXACTO
    const htmlTemplate = `
<!DOCTYPE html><html><head><title>Cuenta de Cobro ${b.number || '001'}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:auto}
h1{text-align:center;color:#065f46;border-bottom:3px solid #065f46;padding-bottom:10px}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:13px}
th{background:#f0fdf4;font-weight:bold}
.total{font-size:18px;font-weight:bold;text-align:right;margin:20px 0}
.bank{background:#f0f9ff;padding:15px;border-radius:8px;margin:20px 0}
.footer{margin-top:60px;text-align:center;font-size:11px;color:#666}
.firma{margin-top:80px;text-align:center;border-top:1px solid #333;display:inline-block;padding-top:5px;min-width:300px}
@media print{body{padding:20px}}</style></head><body>
<h1>CUENTA DE COBRO N° ${b.number || '001'}</h1>
<p><strong>Fecha:</strong> ${getSpanishDate(b.date)}</p>
<p><strong>Señores:</strong> ${b.clientName}</p>
<p><strong>NIT:</strong> ${b.clientNit}</p>
<hr/>
<p><strong>Concepto:</strong> ${b.concept}</p>
<table><thead><tr><th>Servicio</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
<tbody>${b.lineItems.map(li => `<tr><td>${li.servicio}</td><td>${li.cantidad}</td><td>$${(li.precioUnitario || 0).toLocaleString('es-CO')}</td><td>$${(li.subtotal || 0).toLocaleString('es-CO')}</td></tr>`).join('')}</tbody></table>
<div class="total">TOTAL: $${b.total.toLocaleString('es-CO')} COP</div>
<p><em>Son: ${b.amountWords}</em></p>
<div class="bank"><strong>Datos Bancarios:</strong><br/>
Banco: ${b.banco}<br/>
Tipo: ${b.tipoCuenta}<br/>
N° Cuenta: ${b.numeroCuenta}<br/>
Titular: ${b.doctorNombre}<br/>
Cédula: ${b.doctorCedula}</div>
<div style="text-align:center;margin-top:60px">
<div class="firma">${b.doctorNombre}<br/>
${activeDoctorData?.titulo}<br/>
Lic. ${b.doctorLicencia}</div>
</div>
<div class="footer">Generado por SISO OcupaSalud Pro</div>
</body></html>`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlTemplate);
    printWindow.document.close();
    printWindow.print();
  }, [activeDoctorData, calcTotal, lineItems]);


  // ══ FILTERED BILLS COMPUTED (desde monolito) ══
  const filteredBills = useMemo(() => {
    if (!searchBill.trim()) return savedBillsList;
    const q = searchBill.toLowerCase();
    return savedBillsList.filter(b =>
      b.number.toLowerCase().includes(q) ||
      b.clientName.toLowerCase().includes(q) ||
      b.clientNit.includes(q)
    );
  }, [savedBillsList, searchBill]);

  // ══ RETORNO del hook ══
  return {
    // Estados
    lineItems, searchBill, previewBill, editingBillId,
    setLineItems, setSearchBill, setPreviewBill, setEditingBillId,
    
    // Helpers
    formatCOP, calcTotal,
    
    // CRUD
    addLineItem, removeLineItem, updateLineItem,
    handleCompanySelect, handleSaveBill, handlePrint,
    
    // Computed
    filteredBills,
  };
};


