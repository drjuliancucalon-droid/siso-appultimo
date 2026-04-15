// src/modules/clinical/components/ExamRequestTab.jsx
// Sprint 2.6: Tab for searching CUPS codes and requesting paraclinical exams
import React, { useState, useCallback, useMemo } from 'react';
import { Search, Plus, Trash2, Printer, FlaskConical, X } from 'lucide-react';
import { _buscarCUPS } from '../../../shared/data/cups';
import { openPrintWindow } from '../../../lib/printService';

export const ExamRequestTab = ({ patientData = {}, doctorData = {}, exams = [], onExamsChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExams, setSelectedExams] = useState(exams);
  const [justificacion, setJustificacion] = useState('');

  const searchResults = useMemo(() => {
    return _buscarCUPS(searchQuery, 10);
  }, [searchQuery]);

  const updateExams = useCallback((newExams) => {
    setSelectedExams(newExams);
    if (onExamsChange) onExamsChange(newExams);
  }, [onExamsChange]);

  const addExam = useCallback((cup) => {
    // Prevent duplicates
    if (selectedExams.some((e) => e.code === cup.code)) return;
    const newExam = {
      ...cup,
      id: `exam_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      addedAt: new Date().toISOString(),
    };
    updateExams([...selectedExams, newExam]);
    setSearchQuery('');
  }, [selectedExams, updateExams]);

  const removeExam = useCallback((id) => {
    updateExams(selectedExams.filter((e) => e.id !== id));
  }, [selectedExams, updateExams]);

  const handlePrint = useCallback(() => {
    if (selectedExams.length === 0) {
      alert('Agregue al menos un examen para imprimir la solicitud.');
      return;
    }

    const html = `
      <div style="text-align:center;margin-bottom:20px;">
        <h1 style="margin:0;font-size:16pt;color:#059669;">SOLICITUD DE EXÁMENES PARACLÍNICOS</h1>
        <p style="font-size:9pt;color:#6b7280;margin:4px 0;">Seguridad y Salud en el Trabajo — Res. 1843/2025</p>
        <hr style="border:none;border-top:2px solid #059669;margin:8px 0;" />
      </div>

      <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
        <div style="width:48%;">
          <h2 style="font-size:10pt;color:#047857;margin:0 0 6px;">Datos del Paciente</h2>
          <table style="width:100%;font-size:8.5pt;">
            <tr><td style="font-weight:700;width:35%;padding:2px 4px;">Nombre:</td><td style="padding:2px 4px;">${patientData.nombres || '—'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 4px;">Documento:</td><td style="padding:2px 4px;">${patientData.docTipo || ''} ${patientData.docNumero || '—'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 4px;">Edad:</td><td style="padding:2px 4px;">${patientData.edad || '—'} años</td></tr>
            <tr><td style="font-weight:700;padding:2px 4px;">Cargo:</td><td style="padding:2px 4px;">${patientData.cargo || '—'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 4px;">Empresa:</td><td style="padding:2px 4px;">${patientData.empresaNombre || '—'}</td></tr>
          </table>
        </div>
        <div style="width:48%;">
          <h2 style="font-size:10pt;color:#047857;margin:0 0 6px;">Médico Solicitante</h2>
          <table style="width:100%;font-size:8.5pt;">
            <tr><td style="font-weight:700;width:35%;padding:2px 4px;">Nombre:</td><td style="padding:2px 4px;">${doctorData.nombre || '—'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 4px;">R.M.:</td><td style="padding:2px 4px;">${doctorData.licencia || '—'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 4px;">Especialidad:</td><td style="padding:2px 4px;">${doctorData.titulo || 'Salud Ocupacional'}</td></tr>
          </table>
        </div>
      </div>

      <h2 style="font-size:10pt;color:#047857;margin:12px 0 6px;">Exámenes Solicitados</h2>
      <table style="width:100%;border-collapse:collapse;font-size:8.5pt;">
        <thead>
          <tr style="background:#ecfdf5;">
            <th style="text-align:left;padding:4px 6px;border:1px solid #a7f3d0;font-size:8pt;">#</th>
            <th style="text-align:left;padding:4px 6px;border:1px solid #a7f3d0;font-size:8pt;">Código CUPS</th>
            <th style="text-align:left;padding:4px 6px;border:1px solid #a7f3d0;font-size:8pt;">Descripción</th>
            <th style="text-align:left;padding:4px 6px;border:1px solid #a7f3d0;font-size:8pt;">Grupo</th>
          </tr>
        </thead>
        <tbody>
          ${selectedExams.map((exam, i) => `
            <tr>
              <td style="padding:3px 6px;border:1px solid #e5e7eb;">${i + 1}</td>
              <td style="padding:3px 6px;border:1px solid #e5e7eb;font-weight:700;">${exam.code}</td>
              <td style="padding:3px 6px;border:1px solid #e5e7eb;">${exam.desc}</td>
              <td style="padding:3px 6px;border:1px solid #e5e7eb;">${exam.group || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${justificacion ? `
        <div style="margin-top:12px;">
          <h2 style="font-size:10pt;color:#047857;margin:0 0 4px;">Justificación Clínica</h2>
          <p style="font-size:8.5pt;border:1px solid #e5e7eb;padding:6px;border-radius:4px;">${justificacion}</p>
        </div>
      ` : ''}

      <div style="border-top:2px solid #059669;margin-top:30px;padding-top:10px;">
        <div style="width:45%;">
          <div style="border-top:1px solid #333;margin-top:40px;padding-top:4px;">
            <p style="font-size:8pt;font-weight:700;">${doctorData.nombre || '—'}</p>
            <p style="font-size:7pt;color:#6b7280;">Médico Especialista en SST</p>
            <p style="font-size:7pt;color:#6b7280;">R.M.: ${doctorData.licencia || '—'}</p>
          </div>
        </div>
      </div>
    `;

    openPrintWindow(`Solicitud Exámenes — ${patientData.nombres || 'Paciente'}`, html);
  }, [selectedExams, patientData, doctorData, justificacion]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-black text-gray-800 uppercase">Solicitud de Exámenes</h3>
        </div>
        <button
          onClick={handlePrint}
          disabled={selectedExams.length === 0}
          className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" /> Imprimir Solicitud
        </button>
      </div>

      {/* Search CUPS */}
      <div className="relative">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-emerald-400">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar exámenes por código CUPS o descripción..."
            className="flex-1 text-xs outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((cup) => {
              const alreadyAdded = selectedExams.some((e) => e.code === cup.code);
              return (
                <button
                  key={cup.code}
                  onClick={() => !alreadyAdded && addExam(cup)}
                  disabled={alreadyAdded}
                  className={`w-full text-left px-3 py-2 text-xs border-b border-gray-50 flex items-center justify-between ${
                    alreadyAdded ? 'bg-gray-50 text-gray-400' : 'hover:bg-emerald-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-emerald-700 mr-2">{cup.code}</span>
                    <span className="text-gray-700">{cup.desc}</span>
                    <span className="text-gray-400 ml-2">({cup.group})</span>
                  </div>
                  {!alreadyAdded && <Plus className="w-4 h-4 text-emerald-500" />}
                  {alreadyAdded && <span className="text-[10px] text-gray-400">Agregado</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected exams list */}
      {selectedExams.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-emerald-50 text-emerald-800">
                <th className="text-left px-3 py-2 font-bold w-8">#</th>
                <th className="text-left px-3 py-2 font-bold">Código</th>
                <th className="text-left px-3 py-2 font-bold">Descripción</th>
                <th className="text-left px-3 py-2 font-bold hidden sm:table-cell">Grupo</th>
                <th className="text-right px-3 py-2 font-bold w-10"></th>
              </tr>
            </thead>
            <tbody>
              {selectedExams.map((exam, i) => (
                <tr key={exam.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                  <td className="px-3 py-2 font-bold text-emerald-700">{exam.code}</td>
                  <td className="px-3 py-2 text-gray-700">{exam.desc}</td>
                  <td className="px-3 py-2 text-gray-500 hidden sm:table-cell">{exam.group}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => removeExam(exam.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedExams.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-xs">
          <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Busque y agregue exámenes paraclínicos usando el campo de búsqueda</p>
        </div>
      )}

      {/* Justification */}
      <div>
        <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">
          Justificación Clínica (opcional)
        </label>
        <textarea
          value={justificacion}
          onChange={(e) => setJustificacion(e.target.value)}
          rows={2}
          placeholder="Motivo de la solicitud de exámenes..."
          className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs resize-none"
        />
      </div>
    </div>
  );
};
