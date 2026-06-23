import React, { useState, useMemo } from 'react';
import { useAIStore } from '../../../stores/aiStore';
import { analyzeEpidemiologicalData } from '../../ai/services/aiAnalysis';
import { Sparkles, Loader2, FileText, Users, ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

/**
 * AnalisisDocsTab — Módulo de bloques documentales
 * Replica la función "📊 Análisis Docs" del monolito.
 *
 * Regla: un "bloque periódico" = empresa con ≥3 pacientes con tipoExamen PERIODICO
 * en el mismo mes/año. Estos bloques REQUIEREN: informe sociodemográfico + carta de custodia.
 *
 * Props:
 *  - companies: array de empresas
 *  - patientsList: array de pacientes
 *  - currentUser: objeto usuario actual
 *  - showAlert: función(msg)
 */
export default function AnalisisDocsTab({ companies = [], patientsList = [], currentUser, showAlert }) {
  const [expanded, setExpanded] = useState(null);
  const [generatingIA, setGeneratingIA] = useState(null); // key del bloque generando
  const [iaResults, setIaResults] = useState({}); // { key: resultado }
  const [cartasGeneradas, setCartasGeneradas] = useState({}); // { key: true }

  // Detectar bloques periódicos
  const bloques = useMemo(() => {
    const mapa = {};
    patientsList.forEach(p => {
      const tipo = (p.tipoExamen || '').toUpperCase();
      if (!tipo.includes('PERI')) return;
      const mes = (p.fechaExamen || '').slice(0, 7);
      if (!mes) return;
      const nombre = p.empresa || p.empresaNombre || 'Sin Empresa';
      const nit = p.empresaNit || p.empresaId || '';
      const key = `${nombre}__${mes}`;
      if (!mapa[key]) mapa[key] = { key, empresa: nombre, nit, mes, pacientes: [] };
      mapa[key].pacientes.push(p);
    });
    return Object.values(mapa)
      .filter(b => b.pacientes.length >= 3)
      .sort((a, b) => b.mes.localeCompare(a.mes));
  }, [patientsList]);

  // Individuales = total - pacientes en bloques
  const pacientesEnBloques = new Set(bloques.flatMap(b => b.pacientes.map(p => p.docNumero || p.id)));
  const individuales = patientsList.filter(p => {
    const tipo = (p.tipoExamen || '').toUpperCase();
    if (tipo.includes('PERI') && (p.docNumero || p.id) && pacientesEnBloques.has(p.docNumero || p.id)) return false;
    return true;
  }).length;

  const bloquesCompletos = bloques.filter(b => cartasGeneradas[b.key] && iaResults[b.key]);
  const bloquesIncompletos = bloques.filter(b => !(cartasGeneradas[b.key] && iaResults[b.key]));

  const handleGenerarIA = async (bloque) => {
    const { canUse, getConfig, hasAnyKey } = useAIStore.getState();
    if (!hasAnyKey()) {
      if (showAlert) showAlert('⚠️ Configure un proveedor de IA en ⚙️ para usar esta función.');
      return;
    }
    setGeneratingIA(bloque.key);
    try {
      const config = getConfig();
      const result = await analyzeEpidemiologicalData(bloque.pacientes, config);
      setIaResults(prev => ({ ...prev, [bloque.key]: result }));
    } catch (err) {
      if (showAlert) showAlert('Error IA: ' + (err.message || 'desconocido'));
    } finally {
      setGeneratingIA(null);
    }
  };

  const handleGenerarCarta = (bloque) => {
    // Genera una carta de custodia básica como texto
    const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const [año, mes] = bloque.mes.split('-');
    const meses = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const mesNombre = meses[parseInt(mes)] || mes;
    const carta = [
      `CARTA DE CUSTODIA DE DOCUMENTOS MÉDICOS OCUPACIONALES`,
      ``,
      `Fecha: ${fecha}`,
      ``,
      `Empresa: ${bloque.empresa}`,
      `NIT: ${bloque.nit || 'N/D'}`,
      `Periodo evaluado: ${mesNombre} ${año}`,
      `Número de trabajadores evaluados: ${bloque.pacientes.length}`,
      ``,
      `Por medio de la presente, SISO OcupaSalud certifica que se han realizado y`,
      `custodiado los siguientes documentos para el periodo indicado:`,
      ``,
      `- Historia(s) clínica(s) ocupacional(es): ${bloque.pacientes.length}`,
      `- Informe sociodemográfico de condiciones de salud`,
      `- Certificado(s) de aptitud laboral: ${bloque.pacientes.length}`,
      ``,
      `Trabajadores incluidos:`,
      ...bloque.pacientes.map((p, i) => `  ${i+1}. ${p.nombreCompleto || 'N/D'} — ${p.docNumero || 'N/D'} — ${p.cargo || 'N/D'}`),
      ``,
      `Los documentos se encuentran bajo custodia médica según lo establecido`,
      `en la Resolución 8430 de 1993 y demás normativa vigente en SST.`,
      ``,
      `Atentamente,`,
      ``,
      `${currentUser?.name || 'Médico Ocupacional'}`,
      `${currentUser?.especialidad || 'Médico Especialista en SST'}`,
      `RM: ${currentUser?.registroMedico || 'N/D'}`,
    ].join('\n');

    // Descargar como txt
    const blob = new Blob([carta], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carta_custodia_${bloque.empresa.replace(/\s+/g,'_').slice(0,20)}_${bloque.mes}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setCartasGeneradas(prev => ({ ...prev, [bloque.key]: true }));
    if (showAlert) showAlert('✅ Carta de custodia generada y descargada.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Regla */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
        <p className="text-xs font-black text-blue-800 mb-1">📐 Regla de detección automática</p>
        <p className="text-[11px] text-blue-700">
          Bloque periódico = más de 3 trabajadores con examen <strong>PERIODICO</strong> de la misma empresa en el mismo mes.
          Los bloques REQUIEREN: certificados + informe sociodemográfico + carta de custodia.
          Exámenes individuales (ingreso, egreso, post-incapacidad, seguimiento) y particulares NO requieren informe.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'BLOQUES DETECTADOS', val: bloques.length, color: 'blue' },
          { label: '✅ COMPLETOS', val: bloquesCompletos.length, color: 'green' },
          { label: '⚠️ INCOMPLETOS', val: bloquesIncompletos.length, color: 'amber' },
          { label: 'INDIVIDUALES', val: individuales, color: 'gray' },
          { label: 'EMPRESAS CON BLOQUE', val: new Set(bloques.map(b => b.empresa)).size, color: 'indigo' },
        ].map(({ label, val, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-3 text-center`}>
            <p className={`text-[9px] font-black text-${color}-700 uppercase mb-1`}>{label}</p>
            <p className={`text-2xl font-black text-${color}-800`}>{val}</p>
          </div>
        ))}
      </div>

      {bloques.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-bold">No se detectaron bloques periódicos</p>
          <p className="text-[11px] mt-1">Se necesitan ≥3 exámenes PERIÓDICO de la misma empresa en el mismo mes</p>
        </div>
      )}

      {/* Bloques incompletos */}
      {bloquesIncompletos.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-black text-red-700 uppercase mb-2">Bloques INCOMPLETOS — requieren acción</h3>
          <div className="space-y-2">
            {bloquesIncompletos.map(bloque => {
              const isOpen = expanded === bloque.key;
              const tieneIA = !!iaResults[bloque.key];
              const tieneCarta = !!cartasGeneradas[bloque.key];
              return (
                <div key={bloque.key} className="bg-white border border-red-100 rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : bloque.key)}
                    className="w-full flex items-center justify-between p-3 hover:bg-red-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-800">{bloque.empresa}</p>
                        <p className="text-[10px] text-gray-500">NIT {bloque.nit || 'N/D'} · {bloque.mes} · {bloque.pacientes.length} trabajadores</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tieneIA
                        ? <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600"><CheckCircle2 size={12}/> INF</span>
                        : <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-500"><XCircle size={12}/> INF</span>
                      }
                      {tieneCarta
                        ? <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600"><CheckCircle2 size={12}/> CUS</span>
                        : <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-500"><XCircle size={12}/> CUS</span>
                      }
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 p-3">
                      {/* Lista de trabajadores */}
                      <div className="mb-3">
                        <p className="text-[10px] font-black text-gray-600 mb-1.5 flex items-center gap-1">
                          <Users size={11}/> {bloque.pacientes.length} trabajadores incluidos
                        </p>
                        <div className="bg-gray-50 rounded-lg p-2 max-h-40 overflow-y-auto">
                          {bloque.pacientes.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 py-0.5 border-b border-gray-100 last:border-0">
                              <span className="text-[9px] text-gray-400 w-4">{i+1}</span>
                              <span className="text-[10px] font-medium text-gray-700 flex-1">{p.nombreCompleto || 'N/D'}</span>
                              <span className="text-[9px] text-gray-400">{p.docNumero || ''}</span>
                              <span className="text-[9px] text-gray-400 truncate max-w-[80px]">{p.cargo || ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerarIA(bloque)}
                          disabled={generatingIA === bloque.key}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {generatingIA === bloque.key ? <Loader2 size={11} className="animate-spin"/> : <Sparkles size={11}/>}
                          {tieneIA ? 'Regenerar con IA' : 'Generar con IA'}
                        </button>
                        <button
                          onClick={() => handleGenerarCarta(bloque)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700"
                        >
                          <FileText size={11}/> {tieneCarta ? 'Regenerar carta' : 'Generar carta'}
                        </button>
                      </div>

                      {/* Resultado IA */}
                      {iaResults[bloque.key] && (
                        <div className="mt-3 bg-indigo-50 rounded-lg p-3">
                          <p className="text-[9px] font-black text-indigo-700 uppercase mb-1">Informe Sociodemográfico IA</p>
                          <pre className="text-[10px] text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto">
                            {iaResults[bloque.key]}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bloques completos */}
      {bloquesCompletos.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-green-700 uppercase mb-2">Bloques COMPLETOS</h3>
          <div className="space-y-2">
            {bloquesCompletos.map(bloque => (
              <div key={bloque.key} className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-gray-800">{bloque.empresa}</p>
                  <p className="text-[10px] text-gray-500">NIT {bloque.nit || 'N/D'} · {bloque.mes} · {bloque.pacientes.length} trabajadores</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600"><CheckCircle2 size={12}/> INF ✓</span>
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600"><CheckCircle2 size={12}/> CUS ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
