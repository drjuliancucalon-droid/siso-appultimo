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
// COMMIT 16ca375: contador de uso por proveedor/key
const usageCounts = {};
export const getUsageCounts = () => ({ ...usageCounts });
export const resetUsageCounts = () => { Object.keys(usageCounts).forEach(k => delete usageCounts[k]); };

export const callAIWithFailover = async (prompt, systemPrompt, aiConfig) => {
  const providers = ['gemini', 'groq', 'cerebras', 'openrouter'];
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
      // COMMIT ffc12e6: rotación multi-key Gemini — probar cada key separada por coma
      const keysToTry = providerKey === 'gemini'
        ? key.split(',').map(k => k.trim()).filter(Boolean)
        : [key.trim()];
      for (const singleKey of keysToTry) {
        try {
          const result = await provider.call(prompt, systemPrompt || DEFAULT_SYSTEM_PROMPT, singleKey);
          if (result && result.length > 0) {
            // COMMIT 16ca375: incrementar contador de uso
            const keyShort = singleKey.slice(-6);
            if (!usageCounts[providerKey]) usageCounts[providerKey] = {};
            usageCounts[providerKey][keyShort] = (usageCounts[providerKey][keyShort] || 0) + 1;
            return result;
          }
        } catch (e2) {
          lastError = e2;
          if (e2.message?.includes('API Key inválida') || e2.message?.includes('401')) continue;
          continue; // probar siguiente key
        }
      }
    } catch (e) { lastError = e; continue; }
  }
  // COMMIT b9935fb: mensaje de error específico con último error
  const detail = lastError?.message || 'sin detalles';
  throw lastError || new Error(`No hay proveedores de IA configurados o disponibles. Último error: ${detail}`);
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
  } else if (enf.includes('CONDUC') || enf.includes('CONDUCCION')) {
    const e = hcData.examenConduccion || {};
    const mC = hcData.maniobrasConduccion || {};
    const labelsC = { resistenciaMonotonia: "Resistencia a la Monotonía", reaccionMultiple: "Reacción Múltiple", anticipacionVelocidad: "Anticipación de la Velocidad", coordinacionBimanual: "Coordinación Bimanual", reaccionFrenado: "Reacción al Frenado" };
    const psicomotriz = Object.entries(mC)
      .filter(([, v]) => v?.estado)
      .map(([k, v]) => `${labelsC[k] || k}: ${v.estado}${v.hallazgo ? ` (${v.hallazgo})` : ""}`)
      .join(" | ") || "Sin evaluación psicomotriz registrada";
    examenEspecial = `TRABAJO CONDUCCIÓN — Agudeza visual: lejana ${e.agudezaVisualLejana || 'N/R'} / cercana ${e.agudezaVisualCercana || 'N/R'} | Campimetría: ${e.campimetria || 'N/R'} | Colores: ${e.discriminacionColores || 'N/R'} | Profundidad: ${e.visionProfundidad || 'N/R'} | Audiometría: ${e.audiometriaResultado || 'N/R'} | Epilepsia/Síncope/Apnea: ${e.antecedentesNeurologicos || 'N/R'} | Consumo alcohol/psicoactivos: ${e.consumoSustancias || 'N/R'}${e.valoracionPsicologica ? ` | Valoración psicológica: ${e.valoracionPsicologica}` : ""}${e.observaciones ? ` | Obs: ${e.observaciones}` : ""} | EVALUACIÓN PSICOMOTRIZ: ${psicomotriz}`;
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
// COMMIT 7cd3434: escalado de profundidad al re-presionar análisis
const _buildDepthInstructions = (depth = 0) => {
  if (depth <= 0) return '';
  if (depth === 1) return '\n⚠️ RE-ANÁLISIS SOLICITADO — Sé más exhaustivo que en el análisis anterior. Incluye más detalles clínicos, correlaciona hallazgos con riesgos ocupacionales y fundamenta cada conclusión con evidencia de la HC.';
  if (depth === 2) return '\n⚠️ ANÁLISIS PROFUNDO (3er intento) — Realiza un análisis ultra-detallado. Desglosa cada sistema por separado, correlaciona con antecedentes y perfil del cargo, y genera un concepto de aptitud con fundamentación extensa.';
  return '\n⚠️ ANÁLISIS MÁXIMO — Nivel exhaustivo. Revisa cada hallazgo, antecedente, riesgo y signo vital. Genera un análisis de la más alta calidad posible con todas las correlaciones clínicas y ocupacionales pertinentes.';
};

export const analyzeHC = async (hcData, aiConfig) => {
  // EXTRACCIÓN COMPLETA DEL CONTEXTO HC (monolito L20987-21080)
  const hallazgosAnorm =
    Object.entries(hcData.examenFisicoSistemas || {})
      .filter(([, v]) => v.estado === 'Anormal')
      .map(([k, v]) => `${k}: ${v.hallazgo}`)
      .join('; ') || 'Sin hallazgos patológicos al examen físico';
  const hallazgosNorm =
    Object.entries(hcData.examenFisicoSistemas || {})
      .filter(([, v]) => v.estado === 'Normal')
      .map(([k]) => k)
      .join(', ') || '';
  // COMMIT cd2c963: campos osteomusculares que se perdían (muscular, articular)
  const osteoBase = Object.entries(hcData.maniobrasOsteomusculares || {})
    .filter(([, v]) => v.estado === 'Anormal')
    .map(([k, v]) => `${k}: ${v.hallazgo}`)
    .join('; ') || 'Ninguna positiva';
  const osteoM = hcData.osteo?.muscular || hcData.maniobrasOsteomusculares?.muscular?.hallazgo || '';
  const osteoA = hcData.osteo?.articular || hcData.maniobrasOsteomusculares?.articular?.hallazgo || '';
  const osteo = [osteoBase, osteoM, osteoA].filter(Boolean).join(' | ') || 'Ninguna positiva';
  const antec = Object.entries(hcData.antecedentesAgrupados || {})
    .filter(([, v]) => v.val)
    .map(([k, v]) => `${k}: ${v.det}`)
    .join(' | ') || 'Niega antecedentes relevantes';
  const riesgos = Object.entries(hcData.riesgos || {})
    .filter(([, v]) => v).map(([k]) => k).join(', ') || 'No reportados';
  const dxActivos = [hcData.diagnosticoPrincipal, hcData.diagnosticoSecundario1, hcData.diagnosticoSecundario2]
    .filter(Boolean).join(' | ') || 'Pendiente';
  const motivo = hcData.motivoConsulta || 'Examen médico ocupacional';

  // COMMIT 687f256: detectar énfasis para enriquecer el prompt
  const enfasis = hcData.enfasisExamen || '';
  let enfasisBlock = '';
  let cardioBlock = '';
  if (/CORAZON|CARDIO/i.test(enfasis)) {
    enfasisBlock = '\n⚠️ ÉNFASIS CARDIOVASCULAR — Presta especial atención a FC, TA, ritmo, pulsos, edemas y perfusión.';
    cardioBlock = `\nBATERÍA CARDIOVASCULAR:\nFC: ${hcData.fc || 'N/R'} lpm | TA: ${hcData.ta || 'N/R'} mmHg | Ritmo/Tonos: ${hcData.ritmoTonos || 'N/R'} | Pulsos: ${hcData.pulsos || 'N/R'} | Edemas: ${hcData.edemas || 'Ausentes'} | Perfusión: ${hcData.perfusion || 'Normal'} | RiesgoCV: ${hcData.riesgoCV || 'N/R'}`;
  }
  if (/OSTEO/i.test(enfasis)) {
    enfasisBlock += '\n⚠️ ÉNFASIS OSTEOMUSCULAR — Usa las secciones "Examen osteomuscular" y "Maniobras" como foco principal del análisis.';
  }
  // COMMIT 687f256: incluir exámenes subidos en el contexto
  let examenesBlock = '';
  try {
    const examenesSubidos = hcData.examenesSubidos || hcData.examenes || [];
    if (Array.isArray(examenesSubidos) && examenesSubidos.length > 0) {
      examenesBlock = '\nEXÁMENES DE APOYO SUBIDOS:\n' + examenesSubidos.map((e, i) => `${i + 1}. ${e.nombre || e.tipo || 'Examen'} — ${e.resultado || e.hallazgo || e.descripcion || 'Sin descripción'} ${e.fecha ? '(' + e.fecha + ')' : ''}`).join('\n');
    }
  } catch {}

  const systemPrompt = 'Eres médico ocupacional con más de 15 años de experiencia en Colombia. Conoces la normatividad colombiana: Res. 1843/2025 (deroga Res. 2346/2007), Dec. 1072/2015, Guías GATISO, GTC-45, Dec. 1477/2014. Evalúas al trabajador como un TODO integral: sus antecedentes, sus riesgos, sus hallazgos físicos anormales y normales, sus signos vitales, sus hábitos, y generas un concepto de aptitud laboral claro, preciso y fundamentado. Respondes SOLO con JSON en español formal y técnico.';

  const prompt = `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia. Evalúa esta Historia Clínica Ocupacional COMPLETA y genera un análisis clínico-ocupacional integral conforme a Res. 1843/2025. Devuelve UNICAMENTE JSON.

════════════ HISTORIA CLINICA COMPLETA ════════════
DATOS GENERALES:
Cargo: ${hcData.cargo || 'N/R'} | Empresa: ${hcData.empresaNombre || 'N/R'}
Tipo examen: ${hcData.tipoExamen || 'N/R'} | Énfasis: ${hcData.enfasisExamen || 'GENERAL'}
Edad: ${hcData.edad || 'N/R'} años | Género: ${hcData.genero || 'N/R'} | ARL: ${hcData.arl || 'N/R'}
Escolaridad: ${hcData.escolaridad || 'N/R'} | Estado civil: ${hcData.estadoCivil || 'N/R'}

SIGNOS VITALES:
TA: ${hcData.ta || 'N/R'} mmHg | FC: ${hcData.fc || 'N/R'} lpm | FR: ${hcData.fr || 'N/R'} rpm
IMC: ${hcData.imc || 'N/R'} kg/m² | Peso: ${hcData.peso || 'N/R'} kg | Talla: ${hcData.talla || 'N/R'} cm

HÁBITOS:
Tabaquismo: ${hcData.habitos?.fuma || 'No'} | Alcohol: ${hcData.habitos?.alcohol || 'No'}
Actividad física: ${hcData.habitos?.deporte || 'No refiere'} | Psicoactivas: ${hcData.habitos?.psicoactivas || 'No'}

ANTECEDENTES RELEVANTES:
${antec}

RIESGOS OCUPACIONALES IDENTIFICADOS:
${riesgos}

HALLAZGOS PATOLÓGICOS AL EXAMEN FÍSICO:
${hallazgosAnorm}

SISTEMAS NORMALES AL EXAMEN FÍSICO:
${hallazgosNorm || 'No registrados'}

MANIOBRAS OSTEOMUSCULARES POSITIVAS:
${osteo}
${cardioBlock}

MOTIVO DE CONSULTA / SOLICITUD:
${motivo}

DIAGNÓSTICOS ACTIVOS (CIE-10):
${dxActivos}

ANÁLISIS CLÍNICO IA PREVIO:
${hcData.analisisIA ? hcData.analisisIA.substring(0, 500) + '...' : 'No disponible'}
${examenesBlock}
${enfasisBlock}
${_buildDepthInstructions(hcData._analysisDepth || 0)}
═══════════════════════════════════════════════════

INSTRUCCIONES:
1. Genera un concepto de aptitud laboral claro: APTO / APTO CON RESTRICCIONES / NO APTO / APTO CONDICIONADO. Justifica el concepto.
2. Diagnóstico principal CIE-10 obligatorio (Z10.0 si es examen ocupacional de rutina sin patología).
3. Diagnósticos secundarios si hay hallazgos relevantes (CIE-10).
4. Análisis clínico detallado: interpreta los hallazgos, relación con el cargo, riesgos y pronóstico laboral (mínimo 200 palabras).
5. Restricciones médico-laborales: SOLO si hay hallazgos que las justifiquen. Cada restricción debe citar el hallazgo que la origina, ser cuantificable (kg, horas, grados) y operativa.
6. Recomendaciones personalizadas basadas en los hallazgos de ESTA HC.
7. Vigencia del certificado según tipo de examen y hallazgos (ej: 1 año, 6 meses, 2 años).
8. Derivaciones a especialistas solo si los hallazgos lo justifican (especialidad + motivo clínico).
9. Exámenes complementarios sugeridos solo si los hallazgos los justifican (ej: audiometría, espirometría).
10. Incapacidad sugerida solo si hay hallazgos que la justifiquen (días + diagnóstico CIE + motivo).

⚠️ PROHIBICIÓN LEGAL EXPRESA (Res. 1843/2025 Art. 21): En las restricciones NO incluyas diagnósticos clínicos. Solo describe la limitación funcional en términos operativos.

JSON REQUERIDO (sin markdown):
{"diagnosticoPrincipal":"Z10.0 EXAMEN MÉDICO OCUPACIONAL","diagnosticoSecundario1":"","diagnosticoSecundario2":"","conceptoAptitud":"APTO / APTO CON RESTRICCIONES / NO APTO","justificacionConcepto":"","vigencia":"1 año","analisisIA":"Análisis detallado mínimo 200 palabras...","recomendaciones":"","analisisRestricciones":"Solo si hay hallazgos","derivaciones":[{"especialidad":"","motivo":""}],"examenesSugeridos":[""],"incapacidadSugerida":{"aplica":false,"dias":0,"motivo":"","diagnosticoCIE":""},"sveRecomendado":[""]}`;

  const text = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  const parsed = parseAIJSON(text);
  return parsed;
};

export const generateRestrictions = async (hcData, aiConfig) => {
  const hallazgosAnorm =
    Object.entries(hcData.examenFisicoSistemas || {})
      .filter(([, v]) => v.estado === 'Anormal')
      .map(([k, v]) => `${k}: ${v.hallazgo}`)
      .join('; ') || 'Sin hallazgos patológicos al examen físico';
  const hallazgosNorm =
    Object.entries(hcData.examenFisicoSistemas || {})
      .filter(([, v]) => v.estado === 'Normal')
      .map(([k]) => k)
      .join(', ') || '';
  const osteo = Object.entries(hcData.maniobrasOsteomusculares || {})
    .filter(([, v]) => v.estado === 'Anormal')
    .map(([k, v]) => `${k}: ${v.hallazgo}`)
    .join('; ') || 'Ninguna positiva';
  const antec = Object.entries(hcData.antecedentesAgrupados || {})
    .filter(([, v]) => v.val)
    .map(([k, v]) => `${k}: ${v.det}`)
    .join(' | ') || 'Niega antecedentes relevantes';
  const riesgos = Object.entries(hcData.riesgos || {})
    .filter(([, v]) => v).map(([k]) => k).join(', ') || 'No reportados';
  const dxActivos = [hcData.diagnosticoPrincipal, hcData.diagnosticoSecundario1, hcData.diagnosticoSecundario2]
    .filter(Boolean).join(' | ') || 'Pendiente';

  const prompt = `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia, experto en restricciones médico-laborales, reintegro laboral y vigilancia epidemiológica. Con base en la historia clínica COMPLETA del trabajador que se presenta a continuación, genera las restricciones médico-laborales personalizadas y adaptadas a los hallazgos encontrados. Devuelve UNICAMENTE JSON.

════════ HISTORIA CLINICA COMPLETA DEL TRABAJADOR ════════
Cargo: ${hcData.cargo} | Empresa: ${hcData.empresaNombre} | Tipo examen: ${hcData.tipoExamen}
Edad: ${hcData.edad} años | Género: ${hcData.genero} | ARL: ${hcData.arl || 'N/R'}
Signos vitales: TA ${hcData.ta || 'N/R'} mmHg | FC ${hcData.fc || 'N/R'} lpm | IMC ${hcData.imc || 'N/R'} kg/m² | Peso ${hcData.peso || 'N/R'} kg | Talla ${hcData.talla || 'N/R'} cm
Hábitos: Tabaquismo ${hcData.habitos?.fuma || 'No'} | Alcohol ${hcData.habitos?.alcohol || 'No'} | Actividad física ${hcData.habitos?.deporte || 'No refiere'}
Antecedentes relevantes: ${antec}
Riesgos ocupacionales identificados: ${riesgos}
Hallazgos PATOLÓGICOS al examen físico: ${hallazgosAnorm}
Sistemas NORMALES al examen: ${hallazgosNorm || 'No registrados'}
Maniobras osteomusculares positivas: ${osteo}
Diagnósticos activos (CIE-10): ${dxActivos}
Concepto de aptitud previo: ${hcData.conceptoAptitud || 'Pendiente'}
Análisis clínico IA: ${hcData.analisisIA ? hcData.analisisIA.substring(0, 400) + '...' : 'No disponible'}
═══════════════════════════════════════════════════

INSTRUCCIONES OBLIGATORIAS:
1. PERSONALIZACION: Cada restricción DEBE derivar directamente de un hallazgo clínico específico encontrado en ESTA historia clínica. Cita el hallazgo que justifica cada restricción.
2. Si no hay hallazgos patológicos relevantes para una restricción, NO la incluyas. No generes restricciones genéricas sin sustento clínico.
3. CUANTIFICACION: Cada restricción debe ser operativa y cuantificable: en kg, minutos, grados, frecuencias o porcentajes.
4. SEGMENTO ANATOMICO: Identifica el segmento afectado (Miembro Superior D/I, Columna Lumbar, Columna Cervical, Miembros Inferiores, Cardiovascular, Respiratorio, General).
5. TIPO: TEMPORAL (con duración específica) / PERMANENTE / PREVENTIVA.
6. BASE NORMATIVA: Citar GTC-45:2012, GATISO-DME, GATISO-TME, Res. 1843/2025, Res. 2404/2019 según corresponda.
7. Si el examen es egreso, post-incapacidad o reintegro (Res. 1843/2025 Art. 13): incluir restricciones de reintegro progresivo.
8. Si NO hay hallazgos patológicos que justifiquen restricciones: devolver array vacío con "sinRestricciones": true y justificación.
9. ⚠️ PROHIBICION LEGAL EXPRESA (Res. 1843/2025 Art. 21 - confidencialidad del diagnóstico): En el campo "texto" y "hallazgoQueJustifica" NO incluyas nombres de diagnósticos clínicos (enfermedades, síndromes, patologías), NO menciones medicamentos, NO describas tratamientos. Solo describe la LIMITACION FUNCIONAL LABORAL en términos operativos: qué actividad está limitada, en qué medida y por cuánto tiempo. Ejemplo correcto: "Evitar levantamiento de cargas superiores a 10 kg" - NO: "Por lumbalgia crónica L4-L5 no levantar pesos".

JSON REQUERIDO (sin markdown):
{"sinRestricciones":false,"justificacionSinRestricciones":"","restricciones":[{"numero":1,"segmento":"Segmento anatómico específico","tipo":"TEMPORAL|PERMANENTE|PREVENTIVA","duracion":"X semanas / Permanente / N/A","hallazgoQueJustifica":"Hallazgo funcional observado (NO diagnóstico, NO enfermedad) que sustenta la restricción","texto":"Restricción operativa y cuantificable: describe QUÉ actividad está limitada, EN QUÉ MEDIDA y POR CUÁNTO TIEMPO. Sin diagnósticos, sin medicamentos, sin tratamientos.","normativa":"GTC-45:2012 / GATISO-DME / GATISO-TME / Res. 1843/2025 / Res. 2404/2019"}]}`;

  const systemPrompt = 'Eres médico especialista en Medicina del Trabajo colombiano. Responde SOLO con JSON. Sin markdown.';
  const text = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  const parsed = parseAIJSON(text);

  // Formatear como texto legible
  if (parsed.sinRestricciones) {
    return `Sin restricciones médico-laborales activas.\n${parsed.justificacionSinRestricciones || 'Trabajador apto sin restricciones según hallazgos clínicos evaluados.'}`;
  }
  return (parsed.restricciones || [])
    .map(r => `${r.numero || ''}. [${(r.tipo || 'TEMPORAL').toUpperCase()}${r.duracion && r.duracion !== 'N/A' ? ' - ' + r.duracion : ''}] (${r.segmento || 'General'})\n   ${r.texto || r.descripcion}\n   ⚖ Justificación clínica: ${r.hallazgoQueJustifica || 'Ver hallazgos HC'}\n   📋 Normativa: ${r.normativa || 'Res. 1843/2025'}`)
    .join('\n\n');
};

export const generateRecommendations = async (hcData, aiConfig) => {
  const hallazgosReco =
    Object.entries(hcData.examenFisicoSistemas || {})
      .filter(([, v]) => v.estado === 'Anormal')
      .map(([k, v]) => `${k}: ${v.hallazgo}`)
      .join('; ') || 'Sin hallazgos patológicos';
  const antecReco = Object.entries(hcData.antecedentesAgrupados || {})
    .filter(([, v]) => v.val)
    .map(([k, v]) => `${k}: ${v.det}`)
    .join(' | ') || 'Niega';
  const riesgosReco = Object.entries(hcData.riesgos || {})
    .filter(([, v]) => v).map(([k]) => k).join(', ') || 'No reportados';
  const dxRecoActivos = [hcData.diagnosticoPrincipal, hcData.diagnosticoSecundario1, hcData.diagnosticoSecundario2]
    .filter(Boolean).join(' | ') || 'Pendiente';

  const prompt = `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia. Genera recomendaciones médico-laborales PERSONALIZADAS Y ESPECIFICAS para el trabajador evaluado, basadas DIRECTAMENTE en los hallazgos clínicos de ESTA historia clínica. Cada recomendación debe derivar de un hallazgo, antecedente, riesgo o característica específica de ESTE paciente. NO generes recomendaciones genéricas desconectadas de la HC. Responde en texto plano numerado, sin JSON, en español formal y directo.

════════ HISTORIA CLINICA COMPLETA DEL TRABAJADOR ════════
Cargo: ${hcData.cargo} | Empresa: ${hcData.empresaNombre} | Actividad económica: ${hcData.actividadEconomica || 'N/E'}
Tipo examen: ${hcData.tipoExamen} | Énfasis: ${hcData.enfasisExamen || 'N/E'}
Edad: ${hcData.edad} años | Género: ${hcData.genero} | Escolaridad: ${hcData.escolaridad || 'N/R'}
Signos vitales: TA ${hcData.ta || 'N/R'} mmHg | FC ${hcData.fc || 'N/R'} lpm | IMC ${hcData.imc || 'N/R'} kg/m² | Peso ${hcData.peso || 'N/R'} kg | Talla ${hcData.talla || 'N/R'} cm
Hábitos: Tabaquismo ${hcData.habitos?.fuma || 'No'} | Alcohol ${hcData.habitos?.alcohol || 'No'} | Actividad física ${hcData.habitos?.deporte || 'No refiere'}
Antecedentes relevantes: ${antecReco}
Riesgos ocupacionales identificados: ${riesgosReco}
Hallazgos patológicos al examen físico: ${hallazgosReco}
Diagnósticos activos (CIE-10): ${dxRecoActivos}
Concepto de aptitud: ${hcData.conceptoAptitud || 'Pendiente'}
Análisis clínico IA previo: ${hcData.analisisIA ? hcData.analisisIA.substring(0, 500) + '...' : 'No disponible'}
═══════════════════════════════════════════════════

⚠️ PROHIBICION LEGAL EXPRESA (Res. 1843/2025 Art. 21 - confidencialidad diagnóstica): NO incluyas nombres de diagnósticos clínicos, nombres de enfermedades, síndromes ni patologías en las recomendaciones. NO menciones medicamentos específicos, dosis ni tratamientos farmacológicos. Las recomendaciones son de medicina preventiva, ergonomía, vigilancia epidemiológica y conducta laboral - NO de tratamiento médico. Ejemplo correcto: "Realizar pausas activas de 10 minutos cada 2 horas por el cargo de trabajo con exposición biomecánica" - NO: "Por hernia discal L4-L5 no flexionar columna y tomar ibuprofeno".

INSTRUCCION: Genera MINIMO 14 recomendaciones numeradas. Organiza en las siguientes secciones (indica la sección antes del grupo):

(A) RECOMENDACIONES MÉDICAS Y DE ESTILO DE VIDA - Derivadas de los hallazgos clínicos específicos (TA, IMC, diagnósticos, antecedentes). Cada una debe citar el hallazgo que la genera.
(B) RECOMENDACIONES ERGONOMICAS Y PREVENTIVAS - Específicas para el CARGO y los RIESGOS identificados en ESTA HC. No genéricas.
(C) EXAMENES COMPLEMENTARIOS SUGERIDOS - Los que se justifican por los hallazgos de ESTA evaluación (laboratorios, imágenes, audiometría, espirometría, etc.).
(D) DERIVACIONES A ESPECIALISTAS - Solo si los hallazgos de ESTA HC lo justifican. Especificar especialidad + motivo clínico concreto.
(E) VIGILANCIA EPIDEMIOLOGICA Y SEGUIMIENTO - SVE que corresponden según hallazgos y riesgos (GATISO-DME, SVE Osteomuscular, Psicosocial, Visual, Auditivo, Respiratorio, Cardiovascular, etc.).
(F) RECOMENDACIONES AL EMPLEADOR - Conforme Res. 1843/2025, Dec. 1072/2015, Res. 0312/2019. Específicas para este cargo y hallazgos.

Lenguaje técnico-médico-ocupacional, formal, directo y puntual. Cada recomendación en máximo 2 líneas.`;

  const systemPrompt = 'Eres médico especialista en Medicina del Trabajo colombiano. Responde en texto plano, sin JSON.';
  const text = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  return text.trim();
};

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

// ══════════════════════════════════════════════════════════════════════════════
// evaluateGTC45 — Análisis IA de matriz de riesgos GTC-45
// Usado por RiskMatrix.jsx (SG-SST)
// ══════════════════════════════════════════════════════════════════════════════
export const evaluateGTC45 = async (gtcData, aiConfig) => {
  const prompt = `Eres especialista en Seguridad y Salud en el Trabajo colombiano con experiencia en metodología GTC-45 (2012). 
Evalúa la siguiente matriz de riesgos laborales y genera recomendaciones de control según la jerarquía (eliminación, sustitución, controles de ingeniería, controles administrativos, EPP).

DATOS DE EMPRESA:
- Empresa: ${gtcData.company || 'N/E'}
- Área/Proceso: ${gtcData.area || 'N/E'}

RIESGOS IDENTIFICADOS:
${gtcData.risks || 'No especificados'}

Devuelve ÚNICAMENTE JSON:
{
  "analisisGeneral": "Análisis general de 3-4 líneas del perfil de riesgos",
  "hallazgosCriticos": ["hallazgo1", "hallazgo2"],
  "recomendaciones": [
    {"peligro": "", "controlActual": "", "controlPropuesto": "", "jerarquia": "Eliminación/Sustitución/Ingeniería/Administrativo/EPP", "plazo": "Inmediato/Corto/Mediano/Largo"},
    ...
  ],
  "cumplimientoLegal": "Evaluación de cumplimiento normativo (Decreto 1072, Res. 0312)",
  "prioridades": ["prioridad1", "prioridad2", "prioridad3"]
}`;
  const systemPrompt = 'Eres especialista en SST colombiano experto en GTC-45. Responde SOLO JSON válido.';
  const raw = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  return parseAIJSON(raw);
};

// ══════════════════════════════════════════════════════════════════════════════
// generateAnnualPlan — IA para plan anual de trabajo SG-SST
// Usado por AnnualPlan.jsx (SG-SST)
// ══════════════════════════════════════════════════════════════════════════════
export const generateAnnualPlan = async (planData, aiConfig) => {
  const prompt = `Eres especialista en Seguridad y Salud en el Trabajo colombiano. Genera un plan anual de trabajo conforme al Decreto 1072/2015 y Resolución 0312/2019.

DATOS DE LA EMPRESA:
- Empresa: ${planData.company || 'N/E'}
- Tipo de empresa: ${planData.tipoEmpresa || 'N/E'}
- Número de trabajadores: ${planData.numTrabajadores || 'N/E'}
- Actividades planificadas: ${planData.activities || 'No especificadas'}

Devuelve ÚNICAMENTE JSON:
{
  "planAnual": [
    {"mes": "Enero", "actividades": [{"actividad": "", "responsable": "", "fecha": "", "estado": "Planificado"}]}
  ],
  "recomendaciones": ["recomendación1", "recomendación2"],
  "cumplimientoEstandares": "Porcentaje estimado de cumplimiento de estándares mínimos"
}`;
  const systemPrompt = 'Eres especialista en SST colombiano. Responde SOLO JSON válido.';
  const raw = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  return parseAIJSON(raw);
};

// ══════════════════════════════════════════════════════════════════════════════
// generatePolicy — IA para generación de políticas SG-SST
// Usado por PolicyGenerator.jsx (SG-SST)
// ══════════════════════════════════════════════════════════════════════════════
export const generatePolicy = async (policyData, aiConfig) => {
  const prompt = `Eres especialista en Seguridad y Salud en el Trabajo colombiano. Genera una política de SST conforme al Decreto 1072/2015.

DATOS DE LA EMPRESA:
- Empresa: ${policyData.company || 'N/E'}
- Alcance: ${policyData.scope || 'General'}
- Objetivos: ${policyData.objectives || 'No especificados'}

Devuelve ÚNICAMENTE JSON:
{
  "titulo": "Política de Seguridad y Salud en el Trabajo",
  "contenido": "Texto completo de la política...",
  "objetivos": ["objetivo1", "objetivo2"],
  "compromisos": ["compromiso1", "compromiso2"],
  "fechaVigencia": "YYYY-MM-DD"
}`;
  const systemPrompt = 'Eres especialista en SST colombiano. Responde SOLO JSON válido.';
  const raw = await callAIWithFailover(prompt, systemPrompt, aiConfig);
  return parseAIJSON(raw);
};
