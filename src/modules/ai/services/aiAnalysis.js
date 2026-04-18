import { AI_PROVIDERS } from '../../../shared/lib/aiProviders';

/**
 * AI Analysis Service - Funciones de análisis IA para HC, reportes, restricciones
 * Usa el motor multi-proveedor con failover automático
 */

const DEFAULT_SYSTEM_PROMPT =
  'Eres un médico ocupacional colombiano experto. Respondes siempre en español. ' +
  'Conoces la normatividad colombiana (Res.1843/2025, Decreto 1072/2015, Guías GATISO, GTC-45). ' +
  'Responde en formato estructurado con viñetas cuando sea apropiado.';

/**
 * Call AI with automatic failover across configured providers
 */
export const callAIWithFailover = async (prompt, systemPrompt, aiConfig) => {
  const providers = ['gemini', 'groq', 'together', 'openrouter'];
  const ordered = [
    aiConfig.activeProvider,
    ...providers.filter((p) => p !== aiConfig.activeProvider),
  ].filter(Boolean);

  let lastError = null;
  for (const providerKey of ordered) {
    const key = aiConfig.keys?.[providerKey];
    if (!key?.trim()) continue;
    const provider = AI_PROVIDERS[providerKey];
    if (!provider) continue;
    try {
      const result = await provider.call(prompt, systemPrompt || DEFAULT_SYSTEM_PROMPT, key.trim());
      if (result && result.length > 0) return result;
    } catch (e) {
      lastError = e;
      continue; // try next provider
    }
  }
  throw lastError || new Error('No hay proveedores de IA configurados o disponibles');
};

// B-01: Construir hallazgos desde examenFisicoSistemas (monolito líneas 14923-14937)
const _buildHallazgos = (data) => {
  const hallazgos = Object.entries(data.examenFisicoSistemas || {})
    .filter(([, v]) => v?.estado === 'Anormal')
    .map(([k, v]) => `${k}: ${v.hallazgo || 'Anormal'}`)
    .join('; ') || 'Sin hallazgos patológicos';
  
  const antecedentes = Object.entries(data.antecedentesAgrupados || {})
    .filter(([, v]) => v?.val)
    .map(([k, v]) => `${k}: ${v.det || 'Presente'}`)
    .join(' | ') || 'Niega antecedentes';
  
  const riesgos = Object.entries(data.riesgos || {})
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ') || 'No reportados';
  
  return { hallazgos, antecedentes, riesgos };
};

// B-01: Contexto clínico adaptado por tipo de examen (monolito líneas 14939-14960)
const _buildContextoTipo = (tipoExamen) => {
  const t = (tipoExamen || '').toUpperCase();
  
  if (t.includes('INGRESO')) {
    return 'Contexto: EXAMEN DE INGRESO — Evaluar aptitud inicial, establecer línea de base, identificar medidas preventivas necesarias, considerar exámenes paraclínicos de ingreso según riesgo del cargo.';
  }
  if (t.includes('PERIÓDICO') || t.includes('PERIODICO')) {
    return 'Contexto: EXAMEN PERIÓDICO — Comparar con evaluaciones previas, identificar cambios evolutivos, evaluar PVE activos, analizar ausentismo relacionado, actualizar concepto de aptitud.';
  }
  if (t.includes('EGRESO') || t.includes('RETIRO')) {
    return 'Contexto: EXAMEN DE EGRESO/RETIRO — Evaluar posibles secuelas laborales, aplicar Decreto 1477/2014 (enfermedades laborales), determinar condiciones de salud post-retiro.';
  }
  if (t.includes('POST') || t.includes('INCAPACIDAD') || t.includes('REINTEGRO')) {
    return 'Contexto: REINTEGRO POST-INCAPACIDAD — Evaluar capacidad laboral actual, proponer reintegro gradual, definir restricciones laborales, coordinar con ARL y empleador.';
  }
  if (t.includes('SEGUIMIENTO')) {
    return 'Contexto: SEGUIMIENTO — Evaluar respuesta a tratamientos previos, ajustar concepto de aptitud si es necesario, determinar próxima fecha de control.';
  }
  return 'Contexto: EVALUACIÓN OCUPACIONAL — Determinar aptitud laboral según hallazgos clínicos, riesgos del cargo y normativa colombiana vigente.';
};

/**
 * Analyze HC data and generate clinical analysis (B-01 completo)
 * Monolito líneas 14911-15144
 */
export const analyzeHC = async (hcData, aiConfig) => {
  const { hallazgos, antecedentes, riesgos } = _buildHallazgos(hcData);
  const contextoTipo = _buildContextoTipo(hcData.tipoExamen);
  
  const isOcupacional = ['INGRESO', 'PERIODICO', 'PERIÓDICO', 'EGRESO', 'RETIRO', 'POST-INCAPACIDAD', 'REINTEGRO', 'SEGUIMIENTO']
    .some(t => (hcData.tipoExamen || '').toUpperCase().includes(t));

  const prompt = `Eres un médico ocupacional colombiano experto con conocimiento profundo de:
- Resolución 1843/2025 (conceptos de aptitud)
- Decreto 1072/2015 (SG-SST)
- Guías GATISO (DME, HNIR, TME, Neurológico, Derm)
- GTC-45:2012 (identificación de peligros)
- Decreto 1477/2014 (enfermedades laborales)

Analiza la siguiente Historia Clínica Ocupacional y devuelve UNICAMENTE un objeto JSON válido (sin texto adicional):

{
  "diagnosticoPrincipal": "Z10.0 - EXAMEN MÉDICO OCUPACIONAL" (si es ocupacional, sino el dx sugerido),
  "diagnosticoSecundario1": "Código CIE-10",
  "diagnosticoSecundario2": "Código CIE-10",
  "conceptoAptitud": "APTO / APTO CON RESTRICCIONES / NO APTO / NO OPERA",
  "vigencia": "X meses (1, 3, 6, 12 según normativa)",
  "recomendaciones": "Texto con recomendaciones médicas y laborales",
  "restriccionesTexto": "Texto con restricciones específicas por segmento corporal",
  "derivaciones": [{"especialidad": "nombre", "motivo": "razón", "urgencia": "Electiva/Urgente"}],
  "examenesSugeridos": ["nombre examen paraclínico"],
  "incapacidadSugerida": {"aplica": true/false, "dias": 0, "motivo": "", "diagnosticoCIE": ""},
  "analisisClinico": "Análisis clínico detallado de al menos 200 palabras",
  "sveRecomendado": ["SVE Osteomuscular si aplica", "SVE Psicosocial si aplica"]
}

DATOS DEL PACIENTE:
- Nombre: ${hcData.nombres || 'N/A'}
- Edad: ${hcData.edad || 'N/A'} años
- Género: ${hcData.genero || 'N/A'}
- Cargo: ${hcData.cargo || 'N/A'}
- Empresa: ${hcData.empresaNombre || 'N/A'}
- Tipo examen: ${hcData.tipoExamen || 'N/A'}
- ARL: ${hcData.arl || 'N/A'}

SIGNOS VITALES:
- TA: ${hcData.tensionArterial || 'N/R'}
- FC: ${hcData.frecuenciaCardiaca || 'N/R'}
- IMC: ${hcData.imc || 'N/R'}
- Peso: ${hcData.peso || 'N/R'} kg
- Talla: ${hcData.talla || 'N/R'} cm

HALLAZGOS DEL EXAMEN FÍSICO POR SISTEMAS:
${hallazgos}

ANTECEDENTES AGRUPADOS:
${antecedentes}

FACTORES DE RIESGO:
${riesgos}

HÁBITOS:
- Tabaquismo: ${hcData.tabaquismo || 'No'}
- Alcohol: ${hcData.alcoholismo || 'No'}
- Deporte: ${hcData.deporte || 'No'}

DIAGNÓSTICOS ACTUALES:
- Principal: ${hcData.diagnostico1 || 'Pendiente'}
- Secundario 1: ${hcData.diagnostico2 || 'N/A'}
- Secundario 2: ${hcData.diagnostico3 || 'N/A'}

MANIOBRAS OSTEOMUSCULARES:
${Object.entries(hcData.maniobrasOsteomusculares || {})
  .filter(([, v]) => v?.estado === 'Anormal')
  .map(([k, v]) => `${k}: ${v.hallazgo || 'Anormal'}`)
  .join('\n') || 'Sin anormalidades'}

${contextoTipo}

Responde SOLO con el JSON, sin texto adicional.`;

  // B-01: Retry mechanism (monolito líneas 14983-14991)
  try {
    return await callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
  } catch (e1) {
    try {
      const retryPrompt = `Analiza esta HC ocupacional y devuelve JSON con los 12 campos requeridos:
{"diagnosticoPrincipal","diagnosticoSecundario1","diagnosticoSecundario2","conceptoAptitud","vigencia","recomendaciones","restriccionesTexto","derivaciones","examenesSugeridos","incapacidadSugerida","analisisClinico","sveRecomendado"}

Datos: cargo=${hcData.cargo}, hallazgos=${hallazgos}, antecedentes=${antecedentes}, riesgos=${riesgos}, edad=${hcData.edad}, tipoExamen=${hcData.tipoExamen}`;
      return await callAIWithFailover(retryPrompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
    } catch (e2) { throw e1; }
  }
};

// B-05: generateAIRestricciones con datos osteomusculares (monolito líneas 15146-15194)
export const generateRestrictions = async (hcData, aiConfig) => {
  const anormalManiobras = Object.entries(hcData.maniobrasOsteomusculares || {})
    .filter(([, v]) => v?.estado === 'Anormal')
    .map(([k, v]) => `${k}: ${v.hallazgo || 'Anormal'}`)
    .join('\n') || 'Sin anormalidades';

  const prompt = `Eres un médico ocupacional colombiano experto en restricciones laborales.
Genera restricciones específicas según GTC-45:2012, GATISO-DME, GATISO-TME y Res. 1843/2025.

DATOS DEL PACIENTE:
- Cargo: ${hcData.cargo || 'N/A'}
- Diagnóstico principal: ${hcData.diagnostico1 || 'N/A'}
- IMC: ${hcData.imc || 'N/R'}
- TA: ${hcData.tensionArterial || 'N/R'}

MANIOBRAS OSTEOMUSCULARES ANORMALES:
${anormalManiobras}

HALLASGOS DEL EXAMEN FÍSICO:
${hcData.analisis || 'Sin análisis clínico'}

Responde EXACTAMENTE en este formato JSON (sin texto adicional):
{
  "restricciones": [{
    "segmento": "Miembro Superior / Lumbar / Cervical / Postural / General",
    "tipo": "TEMPORAL / PERMANENTE / PREVENTIVA",
    "duracion": "X semanas o N/A",
    "texto": "Restricción operativa y cuantificable",
    "normativa": "GTC-45:2012 / GATISO-DME / GATISO-TME / Res. 1843/2025"
  }]
}

Formato de salida requerido:
1. [TEMPORAL - 4 semanas] (Lumbar) No levantar cargas >5kg — GTC-45:2012
2. [PERMANENTE] (Postural) No permanencia de pie >2 horas — Res. 1843/2025`;

  const result = await callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
  
  // Parsear y formatear como lista numerada
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.restricciones && Array.isArray(parsed.restricciones)) {
        return parsed.restricciones.map((r, i) => 
          `${i + 1}. [${r.tipo}${r.duracion !== 'N/A' ? ' - ' + r.duracion : ''}] (${r.segmento}) ${r.texto} — ${r.normativa}`
        ).join('\n');
      }
    }
  } catch {}
  return result;
};

// B-06: generateAIRecomedaciones con 4 categorías (monolito líneas 15196-15226)
export const generateRecommendations = async (hcData, aiConfig) => {
  const prompt = `Eres un médico ocupacional colombiano experto en recomendaciones de salud ocupacional.
Genera al menos 12 recomendaciones estructuradas en 4 categorías según Res. 1843/2025 y Decreto 1072/2015.

DATOS DEL PACIENTE:
- Edad: ${hcData.edad || 'N/A'} años
- Sexo: ${hcData.genero || 'N/A'}
- IMC: ${hcData.imc || 'N/R'}
- TA: ${hcData.tensionArterial || 'N/R'}
- Actividad económica (CIIU): ${hcData.actividadEconomica || 'N/A'}

HÁBITOS:
- Tabaquismo: ${hcData.tabaquismo || 'No'}
- Alcohol: ${hcData.alcoholismo || 'No'}
- Deporte/ejercicio: ${hcData.deporte || 'No'}

DIAGNÓSTICO PRINCIPAL:
${hcData.diagnostico1 || 'Pendiente'}

RIESGOS IDENTIFICADOS:
- Biomecánico: ${hcData.riesgoBiomecanico ? 'Sí' : 'No'}
- Físico: ${hcData.riesgoFisico ? 'Sí' : 'No'}
- Químico: ${hcData.riesgoQuimico ? 'Sí' : 'No'}
- Psicosocial: ${hcData.riesgoPsicosocial ? 'Sí' : 'No'}
- Biológico: ${hcData.riesgoBiologico ? 'Sí' : 'No'}

Formatea las recomendaciones así:

**1. MÉDICAS Y ESTILO DE VIDA**
1.1. Recomendación...
1.2. Recomendación...

**2. ERGONÓMICAS ESPECÍFICAS PARA EL CARGO**
2.1. Recomendación...
2.2. Recomendación...

**3. VIGILANCIA EPIDEMIOLÓGICA Y SEGUIMIENTO**
3.1. Recomendación...
3.2. Recomendación...

**4. AL EMPLEADOR (según Res. 1843/2025 y Dec. 1072/2015)**
4.1. Recomendación...
4.2. Recomendación...

Total mínimo: 12 recomendaciones distribuidas en las 4 categorías.`;

  return callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
};

/**
 * Analyze General HC data (medicina general, no ocupacional)
 * Sprint 2.2
 */
export const analyzeGeneralHC = async (hcData, aiConfig) => {
  const prompt =
    `Analiza la siguiente historia clínica de medicina general y genera:\n` +
    `1. Resumen clínico (3-4 líneas)\n` +
    `2. Diagnósticos diferenciales\n` +
    `3. Plan de manejo sugerido\n` +
    `4. Exámenes paraclínicos recomendados\n` +
    `5. Seguimiento y control\n\n` +
    `Datos del paciente:\n` +
    `- Paciente: ${hcData.nombres || 'N/A'}, ${hcData.edad || 'N/A'} años, ${hcData.genero || 'N/A'}\n` +
    `- Motivo de consulta: ${hcData.motivoConsulta || 'N/A'}\n` +
    `- Enfermedad actual: ${hcData.enfermedadActual || 'N/A'}\n` +
    `- Antecedentes: ${hcData.antPatologicos || 'Niega'}\n` +
    `- TA: ${hcData.tensionArterial || 'N/R'}, FC: ${hcData.frecuenciaCardiaca || 'N/R'}\n` +
    `- IMC: ${hcData.imc || 'N/R'}\n` +
    `- Examen físico: ${hcData.examenFisico || 'N/R'}\n` +
    `- Revisión por sistemas: ${hcData.revisionSistemas || 'N/R'}\n` +
    `- Diagnósticos actuales: ${hcData.diagnostico1 || 'Pendiente'}`;

  const systemPrompt =
    'Eres un médico general colombiano experto. Respondes siempre en español. ' +
    'Conoces las guías de práctica clínica colombianas y la normatividad vigente. ' +
    'Genera análisis clínicos estructurados con diagnósticos CIE-10 y planes de manejo basados en evidencia.';

  return callAIWithFailover(prompt, systemPrompt, aiConfig);
};

/**
 * Suggest CIE-10 diagnosis codes based on clinical findings
 * Sprint 2.3
 * Returns text with suggested codes (to be parsed by the UI)
 */
export const suggestDiagnosis = async (hcData, aiConfig) => {
  const prompt =
    `Basándote en los siguientes hallazgos clínicos, sugiere los 3 diagnósticos CIE-10 más probables.\n\n` +
    `Datos del paciente:\n` +
    `- Edad: ${hcData.edad || 'N/A'} años, Sexo: ${hcData.genero || 'N/A'}\n` +
    `- Cargo: ${hcData.cargo || 'N/A'}\n` +
    `- Motivo consulta: ${hcData.motivoConsulta || hcData.tipoExamen || 'N/A'}\n` +
    `- Antecedentes: ${hcData.antPatologicos || 'Niega'}\n` +
    `- Signos vitales: TA ${hcData.tensionArterial || 'N/R'}, FC ${hcData.frecuenciaCardiaca || 'N/R'}, IMC ${hcData.imc || 'N/R'}\n` +
    `- Hallazgos examen físico: ${hcData.examenFisico || hcData.analisis || 'N/R'}\n` +
    `- Síntomas reportados: ${hcData.revisionSistemas || 'N/R'}\n\n` +
    `Responde EXACTAMENTE en este formato JSON (un array):\n` +
    `[{"code": "Z10.0", "description": "Descripción del diagnóstico"}, ...]\n` +
    `Solo incluye los 3 diagnósticos más probables con códigos CIE-10 válidos.`;

  const systemPrompt =
    'Eres un médico colombiano experto en codificación CIE-10. ' +
    'Respondes SOLO con el array JSON solicitado, sin texto adicional. ' +
    'Usa códigos CIE-10 actualizados y válidos para Colombia.';

  const result = await callAIWithFailover(prompt, systemPrompt, aiConfig);

  // Try to parse JSON from the response
  try {
    const jsonMatch = result.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // If parsing fails, return as text
  }

  return result;
};

/**
 * Suggest paraclinical exams based on cargo, risks, and age
 * Sprint 2.4
 * Returns array of suggested exams with CUPS codes
 */
export const suggestExams = async (hcData, aiConfig) => {
  const prompt =
    `Basándote en el perfil del trabajador, sugiere los exámenes paraclínicos necesarios.\n\n` +
    `Datos:\n` +
    `- Edad: ${hcData.edad || 'N/A'} años, Sexo: ${hcData.genero || 'N/A'}\n` +
    `- Cargo: ${hcData.cargo || 'N/A'}\n` +
    `- Tipo examen: ${hcData.tipoExamen || 'N/A'}\n` +
    `- Factores de riesgo: ${[
      hcData.riesgoBiomecanico ? 'Biomecánico' : '',
      hcData.riesgoFisico ? 'Físico (ruido/vibración)' : '',
      hcData.riesgoQuimico ? 'Químico' : '',
      hcData.riesgoPsicosocial ? 'Psicosocial' : '',
      hcData.riesgoBiologico ? 'Biológico' : '',
    ].filter(Boolean).join(', ') || 'No especificados'}\n` +
    `- Antecedentes: ${hcData.antPatologicos || 'Niega'}\n` +
    `- Diagnósticos actuales: ${hcData.diagnostico1 || 'Pendiente'}\n\n` +
    `Responde EXACTAMENTE en este formato JSON (un array):\n` +
    `[{"cups": "903801", "description": "Descripción del examen", "justification": "Razón clínica"}]\n` +
    `Incluye exámenes pertinentes según Res. 1843/2025 y guías GATISO.`;

  const systemPrompt =
    'Eres un médico ocupacional colombiano experto en exámenes paraclínicos. ' +
    'Respondes SOLO con el array JSON solicitado, sin texto adicional. ' +
    'Usa códigos CUPS válidos de Colombia (Res. 2175/2015).';

  const result = await callAIWithFailover(prompt, systemPrompt, aiConfig);

  // Try to parse JSON from the response
  try {
    const jsonMatch = result.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // If parsing fails, return as text
  }

  return result;
};

/**
 * Generate epidemiological report analysis
 */
export const analyzeEpidemiologicalData = async (patients, aiConfig) => {
  const totalPats = patients.length;
  const dxCounts = {};
  patients.forEach((p) => {
    (p.diagnosticos || []).forEach((d) => {
      dxCounts[d] = (dxCounts[d] || 0) + 1;
    });
  });
  const topDx = Object.entries(dxCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const prompt =
    `Analiza los siguientes datos epidemiológicos de una empresa:\n` +
    `- Total trabajadores evaluados: ${totalPats}\n` +
    `- Diagnósticos más frecuentes:\n${topDx.map(([d, n]) => `  ${d}: ${n} casos`).join('\n')}\n\n` +
    `Genera:\n1. Análisis de morbilidad ocupacional\n2. Factores de riesgo predominantes\n` +
    `3. Programas de vigilancia recomendados\n4. Acciones inmediatas sugeridas`;

  return callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
};
