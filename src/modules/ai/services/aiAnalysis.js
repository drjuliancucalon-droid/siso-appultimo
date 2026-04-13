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

/**
 * Analyze HC data and generate clinical analysis
 */
export const analyzeHC = async (hcData, aiConfig) => {
  const prompt =
    `Analiza la siguiente historia clínica ocupacional y genera:\n` +
    `1. Resumen clínico (3-4 líneas)\n` +
    `2. Hallazgos relevantes\n` +
    `3. Factores de riesgo identificados\n` +
    `4. Recomendaciones específicas\n\n` +
    `Datos HC:\n` +
    `- Paciente: ${hcData.nombres || 'N/A'}, ${hcData.edad || 'N/A'} años, ${hcData.genero || 'N/A'}\n` +
    `- Cargo: ${hcData.cargo || 'N/A'}\n` +
    `- Tipo examen: ${hcData.tipoExamen || 'N/A'}\n` +
    `- Antecedentes: ${hcData.antPatologicos || 'Niega'}\n` +
    `- TA: ${hcData.tensionArterial || 'N/R'}, FC: ${hcData.frecuenciaCardiaca || 'N/R'}\n` +
    `- IMC: ${hcData.imc || 'N/R'}\n` +
    `- Diagnósticos: ${hcData.diagnostico1 || 'Pendiente'}\n` +
    `- Concepto: ${hcData.conceptoAptitud || 'Pendiente'}`;

  return callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
};

/**
 * Generate restrictions based on diagnoses and job type
 */
export const generateRestrictions = async (hcData, aiConfig) => {
  const prompt =
    `Genera restricciones médico-laborales para un trabajador con base en:\n` +
    `- Cargo: ${hcData.cargo || 'N/A'}\n` +
    `- Diagnósticos: ${hcData.diagnostico1 || 'N/A'}, ${hcData.diagnostico2 || ''}\n` +
    `- Hallazgos: ${hcData.analisis || 'N/A'}\n` +
    `- Factores de riesgo: ${hcData.riesgoBiomecanico ? 'Biomecánico' : ''} ${hcData.riesgoFisico ? 'Físico' : ''}\n\n` +
    `Lista las restricciones en formato:\n` +
    `- Restricción específica (Normativa aplicable)\n` +
    `Basado en GTC-45, GATISO y Res. 1843/2025.`;

  return callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
};

/**
 * Generate recommendations based on clinical findings
 */
export const generateRecommendations = async (hcData, aiConfig) => {
  const prompt =
    `Genera recomendaciones médicas para un trabajador:\n` +
    `- Edad: ${hcData.edad || 'N/A'} años, Sexo: ${hcData.genero || 'N/A'}\n` +
    `- IMC: ${hcData.imc || 'N/R'}\n` +
    `- TA: ${hcData.tensionArterial || 'N/R'}\n` +
    `- Diagnósticos: ${hcData.diagnostico1 || 'N/A'}\n` +
    `- Hábitos: Tabaco: ${hcData.tabaquismo || 'No'}, Alcohol: ${hcData.alcoholismo || 'No'}\n\n` +
    `Lista recomendaciones en viñetas, incluyendo:\n` +
    `- Recomendaciones de salud general\n` +
    `- Recomendaciones laborales/ergonómicas\n` +
    `- Seguimiento médico necesario`;

  return callAIWithFailover(prompt, DEFAULT_SYSTEM_PROMPT, aiConfig);
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
