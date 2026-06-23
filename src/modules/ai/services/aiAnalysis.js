// src/modules/ai/services/aiAnalysis.js
// ══════════════════════════════════════════════════════════════════════════════
// Motor de análisis IA — réplica fiel del monolito ocupasalud
// Ref. monolito: App.jsx líneas 14911-15226
// v2: contexto completo HC + salida estructurada (TRABAJADOR/EMPLEADOR/EMPRESA)
// ══════════════════════════════════════════════════════════════════════════════
import { AI_PROVIDERS } from '../../../shared/lib/aiProviders';
import { useUIStore } from '../../../stores/uiStore';

const _setAILoading = (val, label) => {
  try { useUIStore.getState().setAIGenerating(val, label); } catch {}
};

const DEFAULT_SYSTEM_PROMPT =
  'Eres un médico especialista en Medicina del Trabajo con más de 15 años de experiencia en evaluaciones ' +
  'ocupacionales en Colombia. Conoces la normatividad colombiana: Res. 1843/2025 (deroga Res. 2346/2007), ' +
  'Dec. 1072/2015, Guías GATISO, GTC-45, Dec. 1477/2014. Respondes siempre en español formal y técnico.';

// ── parseAIJSON ───────────────────────────────────────────────────────────────
export const parseAIJSON = (text) => {
  if (!text) return {};
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const startIdx = clean.indexOf('{');
  const endIdx = clean.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1) return {};
  try {
    return JSON.parse(clean.slice(startIdx, endIdx + 1));
  } catch {
    try {
      return JSON.parse(clean.slice(startIdx, endIdx + 1).replace(/,\s*}/g, '}').replace(/,\s*]/g, ']'));
    } catch { return {}; }
  }
};

// ── callAIWithFailover ────────────────────────────────────────────────────────
export const callAIWithFailover = async (prompt, systemPrompt, aiConfig) => {
  const providers = ['gemini', 'groq', 'together', 'openrouter'];
  const ordered = [
    aiConfig?.activeProvider,
    ...providers.filter((p) => p !== aiConfig?.activeProvider),
  ].filter(Boolean);

  let lastError = null;
  for (const providerKey of ordered) {
    const key = aiConfig?.keys?.[providerKey];
    if (!key?.trim()) continue;
    const provider = AI_PROVIDERS[providerKey];
    if (!provider) continue;
    try {
      const result = await provider.call(prompt, systemPrompt || DEFAULT_SYSTEM_PROMPT, key.trim());
      if (result && result.length > 0) return result;
    } catch (e) { lastError = e; continue; }
  }
  throw lastError || new Error('No hay proveedores de IA configurados o disponibles');
};

// ══════════════════════════════════════════════════════════════════════════════
// _buildFullContext — contexto completo de la HC para todos los prompts
// Incluye TODOS los campos relevantes: perfil cargo, antecedentes, maniobras,
// exámenes especiales, paraclínicos, turno, antigüedad, nivel riesgo ARL
// ══════════════════════════════════════════════════════════════════════════════
const _buildFullContext = (hcData) => {
  // ── Hallazgos físicos (solo anormales) ───────────────────────────────────
  const hallazgos = Object.entries(hcData.examenFisicoSistemas || {})
    .filter(([, v]) => v?.estado === 'Anormal')
    .map(([k, v]) => `${k}: ${v.hallazgo}`)
    .join('; ') || 'Sin hallazgos patológicos';

  // ── Antecedentes ─────────────────────────────────────────────────────────
  const antecedentes = Object.entries(hcData.antecedentesAgrupados || {})
    .filter(([, v]) => v?.val)
    .map(([k, v]) => `${k}: ${v.det || 'Sí'}`)
    .join(' | ') || 'Niega antecedentes relevantes';

  // ── Riesgos ocupacionales ────────────────────────────────────────────────
  const riesgos = Object.entries(hcData.riesgos || {})
    .filter(([, v]) => v === true)
    .map(([k]) => k)
    .join(', ') || 'No reportados';

  // ── Maniobras osteomusculares positivas ──────────────────────────────────
  const maniobras = Object.entries(hcData.maniobrasOsteomusculares || {})
    .filter(([, v]) => v?.estado === 'Anormal')
    .map(([k, v]) => `${k}: ${v.hallazgo || v.nombre || k}`)
    .join('; ') || 'Ninguna positiva';

  // ── Examen osteomuscular resumen ─────────────────────────────────────────
  const osteo = hcData.examenOsteomuscular || {};
  const osteoRes = [
    osteo.columna !== 'Normal' ? `Columna: ${osteo.columna}` : '',
    osteo.miembrosSup !== 'Normal' ? `Miembros sup: ${osteo.miembrosSup}` : '',
    osteo.miembrosInf !== 'Normal' ? `Miembros inf: ${osteo.miembrosInf}` : '',
    osteo.postural !== 'Normal' ? `Postural: ${osteo.postural}` : '',
    osteo.hallazgos ? `Hallazgos: ${osteo.hallazgos}` : '',
    osteo.diagnosticoFuncional ? `Dx funcional: ${osteo.diagnosticoFuncional}` : '',
  ].filter(Boolean).join('; ') || 'Sin alteraciones osteomusculares';

  // ── Paraclínicos marcados ─────────────────────────────────────────────────
  const paraclinicos = Object.entries(hcData.paraclinicosCheck || {})
    .filter(([k, v]) => v === true && k !== 'otros')
    .map(([k]) => k)
    .join(', ');
  const paraclinicosFull = [paraclinicos, hcData.paraclinicosCheck?.otros].filter(Boolean).join(', ') || 'Ninguno';

  // ── Agudeza visual ────────────────────────────────────────────────────────
  const av = hcData.agudezaVisual || {};
  const agudeza = (av.lejanaOD || av.lejanaOI)
    ? `OD ${av.lejanaOD || 'N/R'} / OI ${av.lejanaOI || 'N/R'} (lejos) | OD ${av.proximaOD || 'N/R'} / OI ${av.proximaOI || 'N/R'} (cerca) | Corrección: ${av.correccion ? 'Sí' : 'No'}`
    : 'N/R';

  // ── Exámenes especiales ───────────────────────────────────────────────────
  const enf = hcData.enfasisExamen || 'GENERAL';
  let examenEspecial = '';
  if (enf.includes('ALTURA') || enf.includes('ALTURAS')) {
    const e = hcData.examenAlturas || {};
    examenEspecial = `TRABAJO EN ALTURAS — Romberg: ${e.romberg || 'N/R'} | Marcha: ${e.marcha || 'N/R'} | Vértigo: ${e.vertigo || 'N/R'} | Coordinación: ${e.coordinacion || 'N/R'} | Nistagmus: ${e.nistagmus || 'N/R'} | Test miedo: ${e.testMiedo || 'N/R'} | Obs: ${e.observaciones || ''}`;
  } else if (enf.includes('ALIMENTO')) {
    const e = hcData.examenAlimentos || {};
    examenEspecial = `MANIPULACIÓN ALIMENTOS — Piel/faneras: ${e.pielFaneras || 'N/R'} | ORL: ${e.orl || 'N/R'} | GI: ${e.gastrointestinal || 'N/R'} | Obs: ${e.observaciones || ''}`;
  } else if (enf.includes('CONFIN')) {
    const e = hcData.examenConfinados || {};
    examenEspecial = `ESPACIOS CONFINADOS — CV: ${e.cardiovascular || 'N/R'} | Resp: ${e.respiratorio || 'N/R'} | Neuro: ${e.neurologico || 'N/R'} | Psico: ${e.psicologico || 'N/R'} | ORL: ${e.otorrino || 'N/R'} | EPP: ${e.usoEpp || 'N/R'}`;
  }

  // ── Perfil del cargo ──────────────────────────────────────────────────────
  const perfilCargo = [
    hcData.perfilCargo_funciones ? `Funciones: ${hcData.perfilCargo_funciones}` : '',
    hcData.perfilCargo_demandasFisicas ? `Demandas físicas: ${hcData.perfilCargo_demandasFisicas}` : '',
    hcData.perfilCargo_demandasMentales ? `Demandas mentales/psicosociales: ${hcData.perfilCargo_demandasMentales}` : '',
    hcData.perfilCargo_factoresRiesgo ? `Factores de riesgo del cargo: ${hcData.perfilCargo_factoresRiesgo}` : '',
    hcData.perfilCargo_nivelExposicion ? `Nivel de exposición: ${hcData.perfilCargo_nivelExposicion}` : '',
    hcData.perfilCargo_medidasControl ? `Medidas de control existentes: ${hcData.perfilCargo_medidasControl}` : '',
    hcData.perfilCargo_tiempoAcumulado ? `Tiempo acumulado en el cargo: ${hcData.perfilCargo_tiempoAcumulado}` : '',
  ].filter(Boolean).join('\n  ') || 'No diligenciado';

  return {
    hallazgos,
    antecedentes,
    riesgos,
    maniobras,
    osteoRes,
    paraclinicosFull,
    agudeza,
    examenEspecial,
    perfilCargo,
  };
};

// ── _buildContextoTipo ────────────────────────────────────────────────────────
const _buildContextoTipo = (tipoExamen = '') => {
  const t = tipoExamen.toUpperCase();
  if (t.includes('INGRESO'))
    return 'EXAMEN DE INGRESO: Evalúa la aptitud INICIAL para el cargo. Las recomendaciones deben incluir: ' +
      '(A) Medidas preventivas desde el inicio de la relación laboral, ' +
      '(B) Identificación de factores de riesgo preexistentes vs laborales, ' +
      '(C) Línea de base para seguimiento futuro, ' +
      '(D) Programa de inducción en SST, ' +
      '(E) Exámenes paraclínicos de ingreso recomendados según riesgos.';
  if (t.includes('PERIÓDICO') || t.includes('PERIODICO'))
    return 'EXAMEN PERIÓDICO: Evalúa cambios en el estado de salud respecto al examen anterior. Las recomendaciones deben incluir: ' +
      '(A) Comparación con hallazgos previos y tendencias, ' +
      '(B) Seguimiento de patologías crónicas ya identificadas, ' +
      '(C) Adherencia a PVE (Programas de Vigilancia Epidemiológica) activos, ' +
      '(D) Refuerzo de medidas de control de riesgos laborales, ' +
      '(E) Indicadores de salud ocupacional: ausentismo, accidentes recientes.';
  if (t.includes('EGRESO') || t.includes('RETIRO'))
    return 'EXAMEN DE EGRESO: Evalúa el estado de salud AL FINALIZAR el vínculo laboral. Las recomendaciones deben incluir: ' +
      '(A) Detección de enfermedades o secuelas de origen laboral (Decreto 1477/2014), ' +
      '(B) Determinación de origen laboral o común de hallazgos, ' +
      '(C) Indicar si el trabajador requiere seguimiento médico post-retiro, ' +
      '(D) Documentación de condiciones para eventual reporte a ARL, ' +
      '(E) Concepto sobre relación de causalidad con el cargo/empresa.';
  if (t.includes('POST') || t.includes('INCAPACIDAD') || t.includes('REINTEGRO'))
    return 'EXAMEN POST-INCAPACIDAD / REINTEGRO LABORAL: Evalúa aptitud para retornar al trabajo tras incapacidad. Las recomendaciones deben incluir: ' +
      '(A) Condiciones específicas para el reintegro (gradual, modificado, pleno), ' +
      '(B) Restricciones temporales o permanentes con plazos y seguimiento, ' +
      '(C) Adaptaciones del puesto de trabajo necesarias, ' +
      '(D) Plan de rehabilitación laboral si aplica, ' +
      '(E) Criterios de seguimiento médico post-reintegro, ' +
      '(F) Articular con ARL para plan de reincorporación.';
  if (t.includes('SEGUIMIENTO'))
    return 'EXAMEN DE SEGUIMIENTO: Evalúa la evolución de condiciones ya identificadas. Las recomendaciones deben incluir: ' +
      '(A) Respuesta al tratamiento o intervención previa, ' +
      '(B) Actualización del concepto de aptitud si hay cambios clínicos, ' +
      '(C) Ajuste de restricciones según evolución, ' +
      '(D) Próxima cita de seguimiento, ' +
      '(E) Indicadores de mejora o deterioro documentados.';
  return 'Evalúa la aptitud del trabajador según los hallazgos clínicos actuales. Las recomendaciones deben ser específicas para el cargo, la empresa y los riesgos identificados.';
};

// ══════════════════════════════════════════════════════════════════════════════
// analyzeHC — Análisis IA completo
// Ref. monolito: App.jsx líneas 14911-15144
// v2: contexto completo + salida estructurada TRABAJADOR/EMPLEADOR/EMPRESA
// ══════════════════════════════════════════════════════════════════════════════
export const analyzeHC = async (hcData, aiConfig) => {
  const ctx = _buildFullContext(hcData);
  const _contextoTipo = _buildContextoTipo(hcData.tipoExamen);

  const prompt =
    `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia. ` +
    `Analiza con criterio clínico-ocupacional experto la siguiente historia clínica COMPLETA y genera ` +
    `el concepto médico ocupacional conforme a Res. 1843/2025. Devuelve ÚNICAMENTE JSON.\n\n` +
    `═══ DATOS DEL TRABAJADOR ═══\n` +
    `Nombre: ${hcData.nombres || 'N/E'} | Cargo: ${hcData.cargo || 'N/E'} | Empresa: ${hcData.empresaNombre || 'N/E'} (${hcData.actividadEconomica || 'N/E'})\n` +
    `Tipo examen: ${hcData.tipoExamen || 'N/E'} | Énfasis: ${hcData.enfasisExamen || 'GENERAL'} | ARL: ${hcData.arl || 'N/R'} | Nivel riesgo ARL: ${hcData.nivelRiesgoARL || 'N/R'}\n` +
    `Edad: ${hcData.edad || 'N/E'}a | Género: ${hcData.genero || 'N/E'} | Escolaridad: ${hcData.escolaridad || 'N/E'}\n` +
    `Turno: ${hcData.turnoTrabajo || 'N/R'} | Antigüedad empresa: ${hcData.antiguedadEmpresa || 'N/R'} | Tipo contrato: ${hcData.tipoContrato || 'N/R'}\n` +
    `Motivo consulta: ${hcData.motivoConsulta || 'N/E'}\n\n` +
    `═══ PERFIL DEL CARGO (Res. 1843/2025 Art. 29) ═══\n  ${ctx.perfilCargo}\n\n` +
    `═══ SIGNOS VITALES Y ANTROPOMETRÍA ═══\n` +
    `TA: ${hcData.ta || 'N/R'} | FC: ${hcData.fc || 'N/R'} | FR: ${hcData.fr || 'N/R'} | Temp: ${hcData.temp || 'N/R'}\n` +
    `Peso: ${hcData.peso || 'N/R'}kg | Talla: ${hcData.talla || 'N/R'}cm | IMC: ${hcData.imc || 'N/R'}\n\n` +
    `═══ ANTECEDENTES PERSONALES ═══\n${ctx.antecedentes}\n\n` +
    `═══ HÁBITOS Y ESTILO DE VIDA ═══\n` +
    `Tabaquismo: ${hcData.habitos?.fuma || 'No'} | Alcohol: ${hcData.habitos?.alcohol || 'No'} | ` +
    `Psicoactivas: ${hcData.habitos?.psicoactivas || 'No'} | Actividad física: ${hcData.habitos?.deporte || 'No'}\n` +
    `${hcData.habitos?.detalle ? `Detalle hábitos: ${hcData.habitos.detalle}` : ''}\n\n` +
    `═══ RIESGOS OCUPACIONALES IDENTIFICADOS ═══\n${ctx.riesgos}\n\n` +
    `═══ HALLAZGOS EXAMEN FÍSICO (solo anormales) ═══\n${ctx.hallazgos}\n\n` +
    `═══ MANIOBRAS OSTEOMUSCULARES POSITIVAS ═══\n${ctx.maniobras}\n\n` +
    `═══ EXAMEN OSTEOMUSCULAR ═══\n${ctx.osteoRes}\n\n` +
    `═══ AGUDEZA VISUAL ═══\n${ctx.agudeza}\n\n` +
    `${ctx.examenEspecial ? `═══ EXAMEN ESPECIAL ═══\n${ctx.examenEspecial}\n\n` : ''}` +
    `═══ PARACLÍNICOS SOLICITADOS/REALIZADOS ═══\n${ctx.paraclinicosFull}\n\n` +
    `═══ CONTEXTO TIPO DE EXAMEN ═══\n${_contextoTipo}\n\n` +
    `═══ CRITERIOS OBLIGATORIOS ═══\n` +
    `1) Concepto de aptitud debe citar artículo Res. 1843/2025 (norma vigente desde 29 abril 2025).\n` +
    `2) Si es egreso o post-incapacidad, incluir análisis de reintegro laboral.\n` +
    `3) Restricciones deben ser operativas, cuantificables y con base normativa (GTC-45, GATISO).\n` +
    `4) Campo "recomendaciones" DEBE estar estructurado en 3 secciones con mínimo 5 ítems cada una:\n` +
    `   AL TRABAJADOR:\\n1. ...\\n2. ...\\n\\nAL EMPLEADOR:\\n1. ...\\n\\nA LA EMPRESA / ÁREA SST:\\n1. ...\n` +
    `5) Campo "analisisClinico" DEBE tener mínimo 300 palabras con 5 sub-secciones:\n` +
    `   (1) Resumen clínico, (2) Análisis nexo causal cargo-hallazgos, (3) Análisis riesgos laborales,\n` +
    `   (4) Concepto de aptitud con base en Res. 1843/2025, (5) Plan de seguimiento y vigilancia.\n\n` +
    `JSON REQUERIDO (sin markdown, sin texto adicional):\n` +
    `{"diagnosticoPrincipal":"Z10.0 - EXAMEN MÉDICO OCUPACIONAL",` +
    `"diagnosticoSecundario1":"CIE-10 código y descripción o vacío",` +
    `"diagnosticoSecundario2":"CIE-10 código y descripción o vacío",` +
    `"conceptoAptitud":"APTO / APTO CON RESTRICCIONES / NO APTO — justificación clínica y cita Art. Res. 1843/2025",` +
    `"vigencia":"X meses — justificación según tipo de examen y hallazgos",` +
    `"recomendaciones":"AL TRABAJADOR:\\n1. [específica para el trabajador]\\n2. ...\\n3. ...\\n4. ...\\n5. ...\\n\\nAL EMPLEADOR:\\n1. [específica para el empleador / área SST]\\n2. ...\\n3. ...\\n4. ...\\n5. ...\\n\\nA LA EMPRESA / ÁREA SST:\\n1. [medida de control / programa / intervención]\\n2. ...\\n3. ...\\n4. ...\\n5. ...",` +
    `"restriccionesTexto":"1. [TEMPORAL/PERMANENTE/PREVENTIVA - duración] (Segmento) descripción cuantificable — norma\\n2. ...",` +
    `"derivaciones":[{"especialidad":"","motivo":"","urgencia":"Electiva/Prioritaria/Urgente"}],` +
    `"examenesSugeridos":["examen con justificación"],` +
    `"incapacidadSugerida":{"aplica":false,"dias":0,"motivo":"","diagnosticoCIE":""},` +
    `"analisisClinico":"(1) RESUMEN CLÍNICO: ... (2) NEXO CAUSAL CARGO-HALLAZGOS: ... (3) ANÁLISIS DE RIESGOS LABORALES: ... (4) CONCEPTO DE APTITUD (Res. 1843/2025 Art. 20): ... (5) PLAN DE SEGUIMIENTO Y VIGILANCIA: ...",` +
    `"sveRecomendado":["SVE Osteomuscular","SVE Psicosocial"]}`;

  let text;
  _setAILoading(true, 'Analizando HC completa con IA...');
  try {
    text = await callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
  } catch (e1) {
    try {
      const retryPrompt =
        'Analiza esta HC ocupacional y devuelve JSON: ' +
        JSON.stringify({
          cargo: hcData.cargo, hallazgos: ctx.hallazgos,
          antecedentes: ctx.antecedentes, riesgos: ctx.riesgos,
          maniobras: ctx.maniobras, perfilCargo: ctx.perfilCargo,
          edad: hcData.edad, tipoExamen: hcData.tipoExamen,
        });
      text = await callAIWithFailover(retryPrompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
    } catch {
      _setAILoading(false);
      throw e1;
    }
  } finally {
    _setAILoading(false);
  }

  const parsed = parseAIJSON(text);

  const TIPOS_OCUP = ['INGRESO', 'PERIODICO', 'PERIÓDICO', 'EGRESO', 'RETIRO', 'POST-INCAPACIDAD', 'REINTEGRO', 'SEGUIMIENTO'];
  const isOcupacional =
    (hcData.enfasisExamen || 'GENERAL').toUpperCase() !== 'GENERAL' ||
    TIPOS_OCUP.some((t) => (hcData.tipoExamen || '').toUpperCase().includes(t));

  const dxPrincipalFinal = 'Z10.0 - EXAMEN MÉDICO OCUPACIONAL';
  const aiDxPrincipal = parsed.diagnosticoPrincipal || '';
  const dxSec1Final = isOcupacional
    ? (aiDxPrincipal && !aiDxPrincipal.includes('Z10') ? aiDxPrincipal : parsed.diagnosticoSecundario1 || '')
    : (parsed.diagnosticoSecundario1 || '');
  const dxSec2Final = isOcupacional
    ? (aiDxPrincipal && !aiDxPrincipal.includes('Z10') && parsed.diagnosticoSecundario1
      ? parsed.diagnosticoSecundario1
      : parsed.diagnosticoSecundario2 || '')
    : (parsed.diagnosticoSecundario2 || '');

  const sveRecomendadoFinal = (parsed.sveRecomendado || []).filter(
    (s) => s && !s.toLowerCase().includes('si aplica') && !s.toLowerCase().includes('según hallazgos')
  );

  return {
    diagnosticoPrincipal: isOcupacional ? dxPrincipalFinal : (parsed.diagnosticoPrincipal || dxPrincipalFinal),
    diagnosticoSecundario1: dxSec1Final,
    diagnosticoSecundario2: dxSec2Final,
    conceptoAptitud: parsed.conceptoAptitud || '',
    vigencia: parsed.vigencia || '',
    recomendaciones: parsed.recomendaciones || '',
    analisisRestricciones: parsed.restriccionesTexto || '',
    derivaciones: (parsed.derivaciones || []).map((d, i) => ({
      id: Date.now() + i,
      especialidad: d.especialidad || '',
      motivo: d.motivo || '',
      urgencia: d.urgencia || 'Electiva',
      _fromAI: true,
    })),
    examenesSugeridos: parsed.examenesSugeridos || [],
    incapacidadSugerida: parsed.incapacidadSugerida || { aplica: false, dias: 0, motivo: '', diagnosticoCIE: '' },
    analisisIA: parsed.analisisClinico || '',
    sveRecomendado: sveRecomendadoFinal,
  };
};

// ══════════════════════════════════════════════════════════════════════════════
// generateRestrictions — contexto completo + antecedentes + perfil cargo
// Ref. monolito: App.jsx líneas 15146-15194
// ══════════════════════════════════════════════════════════════════════════════
export const generateRestrictions = async (hcData, aiConfig) => {
  const ctx = _buildFullContext(hcData);

  const prompt =
    `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia, ` +
    `experto en restricciones médico-laborales (GTC-45, GATISO, Res. 1843/2025). ` +
    `Con base en la historia clínica COMPLETA, genera restricciones médico-laborales. Devuelve ÚNICAMENTE JSON.\n\n` +
    `═══ DATOS DEL TRABAJADOR ═══\n` +
    `Cargo: ${hcData.cargo || 'N/E'} | Empresa: ${hcData.empresaNombre || 'N/E'} | Tipo examen: ${hcData.tipoExamen || 'N/E'}\n` +
    `Turno: ${hcData.turnoTrabajo || 'N/R'} | Antigüedad: ${hcData.antiguedadEmpresa || 'N/R'} | Nivel riesgo ARL: ${hcData.nivelRiesgoARL || 'N/R'}\n` +
    `IMC: ${hcData.imc || 'N/R'} | TA: ${hcData.ta || 'N/R'} | Diagnóstico principal: ${hcData.diagnosticoPrincipal || 'N/R'}\n\n` +
    `═══ PERFIL DEL CARGO ═══\n  ${ctx.perfilCargo}\n\n` +
    `═══ ANTECEDENTES PERSONALES ═══\n${ctx.antecedentes}\n\n` +
    `═══ RIESGOS OCUPACIONALES ═══\n${ctx.riesgos}\n\n` +
    `═══ HALLAZGOS FÍSICOS PATOLÓGICOS ═══\n${ctx.hallazgos}\n\n` +
    `═══ MANIOBRAS OSTEOMUSCULARES POSITIVAS ═══\n${ctx.maniobras}\n\n` +
    `═══ EXAMEN OSTEOMUSCULAR ═══\n${ctx.osteoRes}\n\n` +
    `${ctx.examenEspecial ? `═══ EXAMEN ESPECIAL ═══\n${ctx.examenEspecial}\n\n` : ''}` +
    `INSTRUCCIÓN: Genera restricciones médico-laborales ESPECÍFICAS basadas en los hallazgos anteriores.\n` +
    `Cada restricción debe ser operativa y cuantificable (kg, min, grados, frecuencias/hora).\n` +
    `Incluir: segmento anatómico, tipo (TEMPORAL/PERMANENTE/PREVENTIVA), duración específica, norma exacta.\n` +
    `Si es post-incapacidad o reintegro, incluir plan de reintegro progresivo (Res. 1843/2025 Art. 13).\n` +
    `Mínimo 4 restricciones si hay hallazgos relevantes. Si no hay hallazgos, generar restricciones PREVENTIVAS.\n\n` +
    `JSON REQUERIDO:\n` +
    `{"restricciones":[` +
    `{"segmento":"Lumbar/Miembro Superior/Cervical/Postural/General/Visual/Auditivo",` +
    `"tipo":"TEMPORAL/PERMANENTE/PREVENTIVA",` +
    `"duracion":"X semanas / X meses / Permanente / N/A",` +
    `"texto":"Restricción específica cuantificable (ej: No levantamiento >12.5 kg)",` +
    `"normativa":"GTC-45:2012 / GATISO-DME 2015 / Res. 1843/2025 Art. X / Res. 0312/2019"}` +
    `]}`;

  const text = await callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
  const parsed = parseAIJSON(text);

  if (parsed.restricciones?.length > 0) {
    return parsed.restricciones
      .map((r, i) =>
        `${i + 1}. [${(r.tipo || 'TEMPORAL').toUpperCase()}${r.duracion && r.duracion !== 'N/A' ? ' - ' + r.duracion : ''}] ` +
        `(${r.segmento || 'General'}) ${r.texto || r.descripcion || ''} — ${r.normativa || 'Res. 1843/2025'}`
      )
      .join('\n');
  }
  return text;
};

// ══════════════════════════════════════════════════════════════════════════════
// generateRecommendations — contexto completo + 3 secciones monolito
// Ref. monolito: App.jsx líneas 15196-15225
// ══════════════════════════════════════════════════════════════════════════════
export const generateRecommendations = async (hcData, aiConfig) => {
  const ctx = _buildFullContext(hcData);

  const prompt =
    `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia. ` +
    `Genera recomendaciones médico-laborales ESPECÍFICAS y personalizadas para este trabajador. ` +
    `NO uses recomendaciones genéricas. Texto plano numerado, español formal. SIN JSON.\n\n` +
    `═══ DATOS DEL TRABAJADOR ═══\n` +
    `Cargo: ${hcData.cargo || 'N/E'} | Empresa: ${hcData.empresaNombre || 'N/E'} | Actividad económica: ${hcData.actividadEconomica || 'N/E'}\n` +
    `Turno: ${hcData.turnoTrabajo || 'N/R'} | Antigüedad: ${hcData.antiguedadEmpresa || 'N/R'} | Nivel riesgo ARL: ${hcData.nivelRiesgoARL || 'N/R'}\n` +
    `IMC: ${hcData.imc || 'N/R'} | TA: ${hcData.ta || 'N/R'} | Diagnóstico: ${hcData.diagnosticoPrincipal || 'N/R'}\n` +
    `Tabaquismo: ${hcData.habitos?.fuma || 'No'} | Alcohol: ${hcData.habitos?.alcohol || 'No'} | Actividad física: ${hcData.habitos?.deporte || 'No'}\n` +
    `Tipo de examen: ${hcData.tipoExamen || 'N/E'}\n\n` +
    `═══ ANTECEDENTES PERSONALES ═══\n${ctx.antecedentes}\n\n` +
    `═══ PERFIL DEL CARGO ═══\n  ${ctx.perfilCargo}\n\n` +
    `═══ RIESGOS OCUPACIONALES ═══\n${ctx.riesgos}\n\n` +
    `═══ HALLAZGOS FÍSICOS PATOLÓGICOS ═══\n${ctx.hallazgos}\n\n` +
    `═══ MANIOBRAS OSTEOMUSCULARES POSITIVAS ═══\n${ctx.maniobras}\n\n` +
    `INSTRUCCIÓN: Genera mínimo 15 recomendaciones numeradas, organizadas en 3 secciones obligatorias.\n` +
    `Cada recomendación debe ser ESPECÍFICA para el cargo, empresa y hallazgos clínicos del trabajador.\n` +
    `Citar normativa colombiana aplicable (Res. 1843/2025, Dec. 1072/2015, GTC-45, etc.).\n\n` +
    `AL TRABAJADOR:\n` +
    `(Mínimo 6 recomendaciones — conductas médicas, hábitos, autocuidado, seguimiento personal)\n\n` +
    `AL EMPLEADOR:\n` +
    `(Mínimo 5 recomendaciones — adaptaciones del puesto, EPP, pausas activas, programa SST — Res. 1843/2025 Art. 25)\n\n` +
    `A LA EMPRESA / ÁREA SST:\n` +
    `(Mínimo 4 recomendaciones — programas de vigilancia, inspecciones, PVE, intervenciones estructurales — Dec. 1072/2015)`;

  return callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
};

// ══════════════════════════════════════════════════════════════════════════════
// optimizeSchedule
// ══════════════════════════════════════════════════════════════════════════════
export const optimizeSchedule = async (agendaData, aiConfig) => {
  const prompt = `Eres especialista en Medicina del Trabajo y gestión de consultas médicas ocupacionales en Colombia. Analiza la agenda médica y genera recomendaciones de optimización.\nDATOS DE AGENDA:\n- Total citas del día: ${agendaData.totalCitas}\n- Citas por tipo de examen: ${JSON.stringify(agendaData.porTipo)}\n- Citas por empresa: ${JSON.stringify(agendaData.porEmpresa)}\n- Horario disponible: ${agendaData.horarioInicio} a ${agendaData.horarioFin}\n- Médicos disponibles: ${agendaData.medicos}\nDevuelve ÚNICAMENTE JSON:\n{"distribucionOptima":[{"hora":"08:00","tipo":"INGRESO/PERIODICO/EGRESO","empresa":"","duracionMin":30,"justificacion":""}],"alertas":[""],"recomendaciones":[""],"tiempoEsperaPromedio":"","eficienciaEstimada":""}`;
  const systemPrompt = 'Eres especialista en gestión de consultas médicas ocupacionales colombianas. Responde SOLO con JSON.';
  const raw = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  return parseAIJSON(raw);
};

// ══════════════════════════════════════════════════════════════════════════════
// generateProposal
// ══════════════════════════════════════════════════════════════════════════════
export const generateProposal = async (proposalData, aiConfig) => {
  const prompt = `Eres especialista en salud ocupacional colombiana con experiencia en propuestas comerciales para empresas. Genera una propuesta económica profesional para servicios de medicina ocupacional.\nDATOS DE LA EMPRESA:\n- Nombre: ${proposalData.empresa}\n- NIT: ${proposalData.nit}\n- No. trabajadores: ${proposalData.numTrabajadores}\n- Actividad económica: ${proposalData.actividadEconomica}\n- Clase de riesgo ARL: ${proposalData.claseRiesgo}\n- Servicios requeridos: ${JSON.stringify(proposalData.servicios)}\n- Ciudad: ${proposalData.ciudad}\nGenera propuesta económica conforme a Res. 1843/2025.\nDevuelve ÚNICAMENTE JSON:\n{"introduccion":"","serviciosDetallados":[{"nombre":"","descripcion":"","frecuencia":"","precioUnitario":0,"cantidad":0,"subtotal":0}],"totalSinIVA":0,"iva":0,"totalConIVA":0,"condicionesComerciales":"","validezDias":30,"observaciones":""}`;
  const systemPrompt = 'Eres especialista en servicios de salud ocupacional colombiana. Precios en COP. Responde SOLO JSON.';
  const raw = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  return parseAIJSON(raw);
};

// ══════════════════════════════════════════════════════════════════════════════
// profesiogramaIA
// ══════════════════════════════════════════════════════════════════════════════
export const profesiogramaIA = async (cargoData, aiConfig) => {
  const prompt = `Eres médico especialista en Medicina del Trabajo colombiano con más de 15 años de experiencia en profesiogramas. Genera un profesiograma conforme a Res. 1843/2025 Art. 29.\nDATOS DEL CARGO:\n- Nombre del cargo: ${cargoData.cargo}\n- Empresa: ${cargoData.empresa}\n- Actividad económica: ${cargoData.actividadEconomica}\n- Descripción de tareas: ${cargoData.tareas}\n- Riesgos identificados: ${JSON.stringify(cargoData.riesgos)}\n- Periodicidad examen médico: ${cargoData.periodicidad}\nGenera profesiograma completo.\nDevuelve ÚNICAMENTE JSON:\n{"cargo":"","empresa":"","examenesRequeridos":[{"nombre":"","cups":"","frecuencia":"Ingreso/Anual/Retiro","obligatorio":true,"justificacion":""}],"aptitudFisica":{"vision":"","audicion":"","capacidadFisica":"","saludMental":""},"restriccionesGenerales":[""],"factoresRiesgo":[{"tipo":"","nivel":"Alto/Medio/Bajo","control":""}],"sveProgramas":[""],"periodicidadExamen":"","normativaAplicable":["Res. 1843/2025"]}`;
  const systemPrompt = 'Eres médico ocupacional colombiano experto en profesiogramas. Res. 1843/2025. Responde SOLO JSON.';
  const raw = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  return parseAIJSON(raw);
};

// ══════════════════════════════════════════════════════════════════════════════
// dailySummary
// ══════════════════════════════════════════════════════════════════════════════
export const dailySummary = async (dashboardData, aiConfig) => {
  const prompt = `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia. Analiza los datos del día y genera un resumen ejecutivo para el médico.\nDATOS DEL DÍA:\n- Pacientes atendidos hoy: ${dashboardData.pacientesHoy}\n- Citas pendientes: ${dashboardData.citasPendientes}\n- HCs abiertas sin cerrar: ${dashboardData.hcSinCerrar}\n- Empresas activas: ${dashboardData.empresasActivas}\n- Alertas de salud identificadas: ${JSON.stringify(dashboardData.alertas)}\n- Ingresos del día: ${dashboardData.ingresosDia}\nGenera resumen ejecutivo del día con:\n1. Situación actual de la consulta\n2. Prioridades para las próximas horas\n3. Alertas médicas a atender\n4. Recomendaciones operativas\nDevuelve ÚNICAMENTE JSON:\n{"resumen":"","prioridades":[""],"alertasMedicas":[""],"recomendacionesOperativas":[""],"indicadorDelDia":""}`;
  const systemPrompt = 'Eres médico especialista en Medicina del Trabajo colombiano. Responde SOLO con JSON.';
  const raw = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  return parseAIJSON(raw);
};

// ══════════════════════════════════════════════════════════════════════════════
// analyzeGeneralHC
// ══════════════════════════════════════════════════════════════════════════════
export const analyzeGeneralHC = async (hcData, aiConfig) => {
  const systemPrompt =
    'Eres un médico general colombiano experto. Respondes siempre en español. ' +
    'Genera análisis clínicos estructurados con diagnósticos CIE-10 y planes basados en evidencia.';

  const prompt =
    `Eres médico general con más de 15 años de experiencia en Colombia. Analiza la consulta y elabora ` +
    `plan de manejo completo. Devuelve ÚNICAMENTE JSON.\n` +
    `DATOS: ${hcData.nombres || 'N/E'} | Edad: ${hcData.edad || 'N/E'}a | Género: ${hcData.genero || 'N/E'}\n` +
    `Motivo: ${hcData.motivoConsulta || 'N/E'}\n` +
    `Enfermedad actual: ${hcData.enfermedadActual || 'No detallada'}\n` +
    `TA: ${hcData.examenFisico?.ta || 'N/R'} | FC: ${hcData.examenFisico?.fc || 'N/R'} | IMC: ${hcData.examenFisico?.imc || 'N/R'}\n` +
    `Hallazgos: ${hcData.examenFisico?.hallazgos || 'Ninguno'}\n` +
    `JSON REQUERIDO:\n` +
    `{"diagnosticos":[{"cie10":"","descripcion":"","tipo":"Principal"}],"plan":{"conducta":"","medicamentos":"",` +
    `"formulaMedicamentos":[{"nombre":"","presentacion":"","dosis":"","frecuencia":"","duracion":"","indicaciones":""}],` +
    `"paraclinicosSolicitados":"","remisiones":"","recomendaciones":"","controlEn":""},` +
    `"analisis":"Razonamiento clínico 4-5 líneas"}`;

  const text = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  return parseAIJSON(text);
};

// ══════════════════════════════════════════════════════════════════════════════
// suggestDiagnosis
// ══════════════════════════════════════════════════════════════════════════════
export const suggestDiagnosis = async (hcData, aiConfig) => {
  const prompt =
    `Basándote en los hallazgos clínicos, sugiere los 3 diagnósticos CIE-10 más probables.\n` +
    `Paciente: ${hcData.edad || 'N/A'} años, ${hcData.genero || 'N/A'}, cargo: ${hcData.cargo || 'N/A'}\n` +
    `Hallazgos: ${Object.entries(hcData.examenFisicoSistemas || {}).filter(([, v]) => v?.estado === 'Anormal').map(([k, v]) => `${k}: ${v.hallazgo}`).join('; ') || 'N/R'}\n` +
    `Responde EXACTAMENTE: [{"code": "Z10.0", "description": "..."}]`;

  const systemPrompt = 'Eres médico colombiano experto en CIE-10. Responde SOLO el array JSON.';
  const result = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  try {
    const m = result.match(/\[[\s\S]*?\]/);
    if (m) return JSON.parse(m[0]);
  } catch { /* fallback */ }
  return result;
};

// ══════════════════════════════════════════════════════════════════════════════
// suggestExams
// ══════════════════════════════════════════════════════════════════════════════
export const suggestExams = async (hcData, aiConfig) => {
  const prompt =
    `Sugiere exámenes paraclínicos para este trabajador.\n` +
    `Cargo: ${hcData.cargo || 'N/A'}, edad ${hcData.edad || 'N/A'}a, tipo: ${hcData.tipoExamen || 'N/A'}\n` +
    `Riesgos: ${Object.entries(hcData.riesgos || {}).filter(([, v]) => v).map(([k]) => k).join(', ') || 'N/E'}\n` +
    `Responde EXACTAMENTE: [{"cups": "903801", "description": "...", "justification": "..."}]`;

  const systemPrompt = 'Eres médico ocupacional colombiano. Responde SOLO el array JSON con códigos CUPS válidos.';
  const result = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  try {
    const m = result.match(/\[[\s\S]*?\]/);
    if (m) return JSON.parse(m[0]);
  } catch { /* fallback */ }
  return result;
};

// ══════════════════════════════════════════════════════════════════════════════
// analyzeEpidemiologicalData
// ══════════════════════════════════════════════════════════════════════════════
export const analyzeEpidemiologicalData = async (patients, aiConfig, programa = '') => {
  const totalPats = patients.length;
  const dxCounts = {};
  patients.forEach((p) => {
    [p.diagnosticoPrincipal, p.diagnosticoSecundario1, p.diagnosticoSecundario2]
      .filter(Boolean)
      .forEach((d) => { dxCounts[d] = (dxCounts[d] || 0) + 1; });
  });
  const topDx = Object.entries(dxCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const prompt =
    `Analiza datos epidemiológicos${programa ? ` del programa ${programa}` : ''}:\n` +
    `- Total trabajadores: ${totalPats}\n` +
    `- Diagnósticos frecuentes:\n${topDx.map(([d, n]) => `  ${d}: ${n} casos`).join('\n')}\n\n` +
    `Genera:\n1. Análisis de morbilidad ocupacional\n2. Factores de riesgo predominantes\n` +
    `3. Programas de vigilancia recomendados\n4. Acciones inmediatas\n5. Indicadores del grupo`;

  return callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
};
