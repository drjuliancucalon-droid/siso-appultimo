// src/modules/clinical/components/DisabilityTab.jsx
// Sprint 2.7: Disability certificate tab
// Fields: días, tipo, origen, diagnóstico, prórroga + date range auto-calc + print
import React, { useState, useCallback, useMemo } from 'react';
import { Printer, Calendar, AlertTriangle, PlusCircle, Trash2, FileText } from 'lucide-react';
import { openPrintWindow } from '../../../lib/printService';

const TIPOS_INCAPACIDAD = ['Ambulatoria', 'Hospitalaria'];
const ORIGENES = ['Enfermedad General', 'Accidente de Trabajo', 'Enfermedad Laboral', 'Accidente Fuera del Trabajo'];

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + parseInt(days, 10) - 1);
  return d.toISOString().split('T')[0];
};

const initialIncapacidad = {
  dias: '',
  tipo: 'Ambulatoria',
  origen: 'Enfermedad General',
  diagnostico: '',
  codigoCIE10: '',
  fechaInicio: new Date().toISOString().split('T')[0],
  fechaFin: '',
  prorroga: false,
  prorrogaNumero: '',
  observaciones: '',
};

export const DisabilityTab = ({ patientData = {}, doctorData = {}, disabilities = [], onDisabilitiesChange }) => {
  const [current, setCurrent] = useState({ ...initialIncapacidad });
  const [incapacidades, setIncapacidades] = useState(disabilities);

  // Auto-calculate end date
  const fechaFin = useMemo(() => {
    if (current.dias && current.fechaInicio && parseInt(current.dias, 10) > 0) {
      return addDays(current.fechaInicio, current.dias);
    }
    return '';
  }, [current.dias, current.fechaInicio]);

  const handleChange = useCallback((field, value) => {
    setCurrent((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAdd = useCallback(() => {
    if (!current.dias || !current.diagnostico) {
      alert('Complete al menos los días y el diagnóstico.');
      return;
    }
    const newIncap = {
      ...current,
      fechaFin,
      id: `incap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...incapacidades, newIncap];
    setIncapacidades(updated);
    if (onDisabilitiesChange) onDisabilitiesChange(updated);
    setCurrent({ ...initialIncapacidad });
  }, [current, fechaFin, incapacidades, onDisabilitiesChange]);

  const handleRemove = useCallback((id) => {
    const updated = incapacidades.filter((i) => i.id !== id);
    setIncapacidades(updated);
    if (onDisabilitiesChange) onDisabilitiesChange(updated);
  }, [incapacidades, onDisabilitiesChange]);

  const handlePrint = useCallback((incap) => {
    const html = `
      <div style="text-align:center;margin-bottom:20px;">
        <h1 style="margin:0;font-size:16pt;color:#059669;">CERTIFICADO DE INCAPACIDAD</h1>
        <p style="font-size:9pt;color:#6b7280;margin:4px 0;">Res. 1843/2025 · Ley 776/2002</p>
        <hr style="border:none;border-top:2px solid #059669;margin:8px 0;" />
      </div>

      <div class="section">
        <h2>📋 Datos del Paciente</h2>
        <table>
          <tr><td class="label" width="25%">Nombre</td><td>${patientData.nombres || '—'}</td></tr>
          <tr><td class="label">Documento</td><td>${patientData.docTipo || ''} ${patientData.docNumero || '—'}</td></tr>
          <tr><td class="label">Edad</td><td>${patientData.edad || '—'} años</td></tr>
          <tr><td class="label">Empresa</td><td>${patientData.empresaNombre || '—'}</td></tr>
          <tr><td class="label">Cargo</td><td>${patientData.cargo || '—'}</td></tr>
          <tr><td class="label">EPS</td><td>${patientData.eps || '—'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>📝 Datos de la Incapacidad</h2>
        <table>
          <tr>
            <td class="label" width="25%">Días de incapacidad</td>
            <td style="font-size:14pt;font-weight:900;color:#059669;">${incap.dias} días</td>
          </tr>
          <tr><td class="label">Tipo</td><td>${incap.tipo}</td></tr>
          <tr><td class="label">Origen</td><td>${incap.origen}</td></tr>
          <tr><td class="label">Fecha inicio</td><td>${new Date(incap.fechaInicio).toLocaleDateString('es-CO')}</td></tr>
          <tr><td class="label">Fecha fin</td><td>${incap.fechaFin ? new Date(incap.fechaFin).toLocaleDateString('es-CO') : '—'}</td></tr>
          <tr><td class="label">Diagnóstico</td><td>${incap.diagnostico}</td></tr>
          <tr><td class="label">Código CIE-10</td><td>${incap.codigoCIE10 || '—'}</td></tr>
          ${incap.prorroga ? `<tr><td class="label">Prórroga #</td><td>${incap.prorrogaNumero || '1'}</td></tr>` : ''}
          ${incap.observaciones ? `<tr><td class="label">Observaciones</td><td>${incap.observaciones}</td></tr>` : ''}
        </table>
      </div>

      <div style="margin-top:20px;padding:10px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;font-size:8pt;">
        <strong>NOTA:</strong> Este certificado se expide para los fines pertinentes ante la EPS del trabajador.
        La incapacidad debe ser radicada dentro de los 3 días hábiles siguientes a su expedición.
      </div>

      <div class="signature-area">
        <div style="width:45%;">
          <div style="border-top:1px solid #333;margin-top:50px;padding-top:4px;">
            <p style="font-size:8pt;font-weight:700;">${doctorData.nombre || '—'}</p>
            <p style="font-size:7pt;color:#6b7280;">Médico Especialista en SST</p>
            <p style="font-size:7pt;color:#6b7280;">R.M.: ${doctorData.licencia || '—'}</p>
          </div>
        </div>
      </div>
    `;

    openPrintWindow(`Incapacidad — ${patientData.nombres || 'Paciente'} — ${incap.dias} días`, html);
  }, [patientData, doctorData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <h3 className="text-sm font-black text-gray-800 uppercase">Incapacidades</h3>
      </div>

      {/* Form */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Días */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Días *</label>
            <input
              type="number"
              min="1"
              max="365"
              value={current.dias}
              onChange={(e) => handleChange('dias', e.target.value)}
              className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-amber-400 outline-none text-xs"
              placeholder="Días"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Tipo</label>
            <select
              value={current.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-amber-400 outline-none text-xs bg-white"
            >
              {TIPOS_INCAPACIDAD.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Fecha Inicio</label>
            <input
              type="date"
              value={current.fechaInicio}
              onChange={(e) => handleChange('fechaInicio', e.target.value)}
              className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-amber-400 outline-none text-xs"
            />
          </div>

          {/* Fecha fin (auto) */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Fecha Fin (auto)</label>
            <input
              type="date"
              value={fechaFin}
              readOnly
              className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Origen */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Origen</label>
            <select
              value={current.origen}
              onChange={(e) => handleChange('origen', e.target.value)}
              className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-amber-400 outline-none text-xs bg-white"
            >
              {ORIGENES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Diagnóstico *</label>
            <input
              type="text"
              value={current.diagnostico}
              onChange={(e) => handleChange('diagnostico', e.target.value)}
              className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-amber-400 outline-none text-xs"
              placeholder="Diagnóstico principal"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Código CIE-10 */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Código CIE-10</label>
            <input
              type="text"
              value={current.codigoCIE10}
              onChange={(e) => handleChange('codigoCIE10', e.target.value)}
              className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-amber-400 outline-none text-xs"
              placeholder="Ej: M54.5"
            />
          </div>

          {/* Prórroga */}
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={current.prorroga}
                onChange={(e) => handleChange('prorroga', e.target.checked)}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-[10px] font-bold text-gray-600 uppercase">Prórroga</span>
            </label>
            {current.prorroga && (
              <input
                type="number"
                min="1"
                value={current.prorrogaNumero}
                onChange={(e) => handleChange('prorrogaNumero', e.target.value)}
                className="w-16 p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-amber-400 outline-none text-xs"
                placeholder="#"
              />
            )}
          </div>

          {/* Add button */}
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 shadow-sm w-full justify-center"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Agregar Incapacidad
            </button>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Observaciones</label>
          <textarea
            value={current.observaciones}
            onChange={(e) => handleChange('observaciones', e.target.value)}
            rows={2}
            className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-amber-400 outline-none text-xs resize-none"
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>

      {/* List of incapacidades */}
      {incapacidades.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-amber-50 text-amber-800">
                <th className="text-left px-3 py-2 font-bold">Días</th>
                <th className="text-left px-3 py-2 font-bold">Tipo</th>
                <th className="text-left px-3 py-2 font-bold">Diagnóstico</th>
                <th className="text-left px-3 py-2 font-bold hidden sm:table-cell">Periodo</th>
                <th className="text-right px-3 py-2 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incapacidades.map((incap) => (
                <tr key={incap.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-bold text-amber-700">{incap.dias}</td>
                  <td className="px-3 py-2">{incap.tipo}</td>
                  <td className="px-3 py-2">
                    {incap.diagnostico}
                    {incap.codigoCIE10 && <span className="text-gray-400 ml-1">({incap.codigoCIE10})</span>}
                    {incap.prorroga && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Prórroga #{incap.prorrogaNumero || '1'}</span>}
                  </td>
                  <td className="px-3 py-2 text-gray-500 hidden sm:table-cell">
                    {new Date(incap.fechaInicio).toLocaleDateString('es-CO')} → {incap.fechaFin ? new Date(incap.fechaFin).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handlePrint(incap)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Imprimir">
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleRemove(incap.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Eliminar">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {incapacidades.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-xs">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No hay incapacidades registradas. Complete el formulario y presione &quot;Agregar&quot;.</p>
        </div>
      )}
    </div>
  );
};
