import React from 'react';
import { Users, AlertTriangle, ShieldCheck } from 'lucide-react';

// WorkersTable - Extraído de renderTablaWorkers() del monolito Reporte.jsx
export const WorkersTable = ({
  filteredPatients,
  certSelected, setCertSelected,
  total, pacientesConRestricciones,
  handlePrintTable,
  showAlert
}) => {
  const allIds = filteredPatients.map(p => p.id);
  const allChecked = allIds.every(id => certSelected?.[id]);
  const someChecked = allIds.some(id => certSelected?.[id]);

  return (
    <div className="space-y-6">
      {/* Header resumen */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Trabajadores con Restricciones Laborales
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Listado de trabajadores que requieren adaptaciones o restricciones en su labor
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-amber-600">{pacientesConRestricciones}</p>
            <p className="text-xs text-amber-500">de {total} evaluados</p>
          </div>
        </div>
      </div>

      {/* Checkbox header */}
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-3">
        <input
          type="checkbox"
          checked={allChecked}
          ref={el => {
            if (el) el.indeterminate = someChecked && !allChecked;
          }}
          onChange={() => {
            const newSel = {};
            if (!allChecked) filteredPatients.forEach(p => { newSel[p.id] = true; });
            setCertSelected(newSel);
          }}
          className="w-4 h-4 accent-blue-600 cursor-pointer"
        />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wide">Seleccionar todo</span>
        <span className="ml-auto text-[10px] text-gray-400">{filteredPatients.length} certificados disponibles</span>
      </div>

      {/* Tabla 9 columnas */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 text-left font-bold">#</th>
              <th className="p-3 text-left font-bold">Trabajador</th>
              <th className="p-3 text-left font-bold">Documento</th>
              <th className="p-3 text-left font-bold">Cargo / Área</th>
              <th className="p-3 text-left font-bold">Fecha Exam</th>
              <th className="p-3 text-left font-bold">Dx Principal (CIE-10)</th>
              <th className="p-3 text-left font-bold">Restricciones</th>
              <th className="p-3 text-left font-bold">Base Normativa</th>
              <th className="p-3 text-left font-bold">Concepto</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p, idx) => {
              const restricciones = p.restriccionesLaborales || [];
              const tieneRestricciones = restricciones.length > 0;
              
              const conceptoLower = (p.conceptoAptitud || '').toLowerCase();
              const esApto = conceptoLower.includes('apto') && !conceptoLower.includes('no apto');
              const esNoApto = conceptoLower.includes('no apto');
              
              return (
                <tr key={p.id || idx} className={`border-b hover:bg-gray-50 ${tieneRestricciones ? 'bg-amber-50' : ''}`}>
                  <td className="p-2 text-center font-bold text-gray-500">{idx + 1}</td>
                  <td className="p-2 font-bold text-gray-800">{p.nombres || '—'}</td>
                  <td className="p-2 text-gray-600">{p.docNumero || '—'}</td>
                  <td className="p-2">
                    <div className="text-gray-800 font-medium">{p.cargo || '—'}</div>
                    <div className="text-gray-400 text-[10px]">{p.area || '—'}</div>
                  </td>
                  <td className="p-2 text-gray-600">{p.fechaExamen || '—'}</td>
                  <td className="p-2">
                    <div className="text-gray-800 font-medium">{p.diagPrincipal || '—'}</div>
                    <div className="text-gray-400 text-[10px]">{p.cie10Principal || '—'}</div>
                  </td>
                  <td className="p-2">
                    {tieneRestricciones ? (
                      <div className="space-y-1">
                        {restricciones.map((r, i) => (
                          <div key={i} className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded text-[10px]">
                            {r}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-medium">Sin restricciones</span>
                    )}
                  </td>
                  <td className="p-2">
                    {p.baseNormativa && p.baseNormativa.length > 0 ? (
                      <div className="space-y-1">
                        {p.baseNormativa.map((n, i) => (
                          <div key={i} className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-[10px]">
                            {n}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                      esApto ? 'bg-emerald-100 text-emerald-700'
                        : esNoApto ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.conceptoAptitud || p.conceptoOcupacional || '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400">
                  No hay trabajadores para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer totales */}
      {filteredPatients.length > 0 && (
        <div className="flex justify-between items-center text-xs text-gray-500">
          <p>Total: {filteredPatients.length} trabajadores</p>
          <p>Con restricciones: {pacientesConRestricciones.length}</p>
        </div>
      )}

      {/* Botones acción */}
      <div className="flex gap-2 pt-3 border-t">
        <button 
          onClick={handlePrintTable}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
        >
          <Printer className="w-3.5 h-3.5" /> Imprimir Tabla
        </button>
      </div>
    </div>
  );
};

