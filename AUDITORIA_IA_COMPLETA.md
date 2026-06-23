# AUDITORÍA FORENSE DE IA — SISO OCUPASALUD PRO
> Documento vivo de auditoría, brechas, prompts forenses y protocolo de implementación  
> Última actualización: 2026-06-22 12:00 (America/Santiago)  
> Commit base: `ea628f2` / `dff1893`

---

## RESUMEN EJECUTIVO

El monolito (`ocupasaludparadesplegar`) tiene **15 funciones IA** distribuidas en historias clínicas (ocupacional y general), reportes, SGSST, facturación, agenda, dashboard, caja y telemedicina. La app refactorizada tiene solo **6/15 funciones IA implementadas** (3 en HC Ocupacional + 3 en HC General) y **9 funciones IA completamente ausentes**.

**Cobertura IA actual**: 40% (6/15 funciones básicas, 0/9 integraciones UI en módulos no-HC)

---

## 1. INVENTARIO DE ARCHIVOS IA

### Monolito (referencia) — Funciones IA extraídas

| # | Función | Archivo monolito (línea aprox.) | Descripción |
|---|---|---|---|
| 1 | `_analisisHC` | App.jsx ~14911 | Análisis completo HC ocupacional (10 campos auto-aplicados) |
| 2 | `_generarRestricciones` | App.jsx ~15146 | Restricciones con checklist |
| 3 | `_generarRecomendaciones` | App.jsx ~15196 | Recomendaciones categorizadas |
| 4 | `_analisisHCGeneral` | App.jsx ~21000 | Plan manejo, diagnósticos, recomendaciones HC general |
| 5 | `_generarInformeEpi` | App.jsx ~25000 | Informe morbilidad sentida con IA |
| 6 | `_prediccionRiesgo` | App.jsx ~25200 | Modelos predictivos de salud |
| 7 | `_generarPlanAnual` | App.jsx ~31000 | Plan anual SGSST con IA |
| 8 | `_generarPolitica` | App.jsx ~31200 | Política SST generada por IA |
| 9 | `_evaluarGTC45` | App.jsx ~31400 | Matriz de riesgos GTC-45 |
| 10 | `_profesiogramaIA` | App.jsx ~34000 | Profesiograma asistido por IA |
| 11 | `_optimizarAgenda` | App.jsx ~38000 | Optimización de horarios |
| 12 | `_cotizacionIA` | App.jsx ~42000 | Generación de propuestas/cotizaciones |
| 13 | `_resumenIA` | App.jsx ~5000 | Resumen IA del dashboard |
| 14 | `_conciliacionIA` | App.jsx ~43000 | Detección de anomalías en caja |
| 15 | `callAIWithFailover` | App.jsx ~120 | Orquestador de IA (4 proveedores + failover) |

### App Refactorizada — Archivos IA existentes

| Archivo | Descripción | Estado |
|---|---|---|
| `src/stores/aiStore.js` | Store Zustand con configuración de proveedores y llaves (49 líneas) | ✅ Implementado |
| `src/modules/ai/services/aiAnalysis.js` | Análisis HC, restricciones, recomendaciones, HC general, SVE, CIE-10, CUPS (409 líneas) | ✅ Implementado |
| `src/modules/ai/components/AIAssistant.jsx` | Asistente IA flotante | 🔶 UI sin conectar |
| `src/modules/ai/components/AIConfigPanel.jsx` | Panel de configuración de proveedores con guías paso a paso (219 líneas) | ✅ Implementado |
| `src/shared/lib/aiProviders.js` | 4 proveedores (gemini, groq, together, openrouter) + parseAIJSON + callAIWithFailover (416 líneas) | ✅ Implementado |
| `src/utils/aiProviders.js` | Duplicado del mismo archivo en `shared/lib/` (413 líneas) | ⚠️ DUPLICADO |

---

## 2. MATRIZ DE BRECHAS — POR MÓDULO

### 2.1 HC OCUPACIONAL (`HistoriaPage.jsx`)

| Función IA | Monolito | App Refactorizada | Brecha |
|---|---|---|---|
| **IA Resumen** | 10 campos auto-aplicados | 7/10 implementados | Faltan: exámenes sugeridos, incapacidad sugerida (aplica/días/CIE), SVE automático |
| **IA Restricciones** | Botón + checklist | ✅ Implementado (línea 241) | Sin brecha |
| **IA Recomendaciones** | Botón + checklist | ✅ Implementado (línea 255) | Sin brecha |
| **Cierre IA** | Sugerencia final antes de firmar | ❌ No existe | Sin validación IA final |
| **Plan gate** | `_canUse('ia_analisis')` | ✅ Implementado (línea 157) | Sin brecha |

**Botones visibles en UI** (línea 626-639):
```
✅ "IA Resumen"    — onGenerateAI
✅ "IA Restr"      — onGenerateRestrictions  
✅ "IA Reco"       — onGenerateRecommendations
⚙️  Config IA       — botón settings (abre AIConfigPanel)
```
**Ubicación**: Sticky action bar, grupo `bg-indigo-50/50`

### 2.2 HC GENERAL (`HistoriaGeneralPage.jsx`)

| Función IA | Monolito | App Refactorizada | Brecha |
|---|---|---|---|
| **IA General** | Análisis con diagnósticos, plan, recomendaciones | ✅ Implementado (línea 105) | Campos parciales |
| **IA Restricciones** | Botón independiente | ✅ (línea 124) | Sin brecha |
| **IA Recomendaciones** | Botón independiente | ✅ (línea 134) | Sin brecha |

**Botones visibles en UI** (línea 204-216):
```
✅ "IA General"     — onGenerateAI
✅ "IA Restr"       — onGenerateRestrictions  
✅ "IA Reco"        — onGenerateRecommendations
⚙️  Config IA       — botón settings
```
**Ubicación**: Sticky action bar, grupo `bg-indigo-50/50`

### 2.3 REPORTES (`ReportsPage.jsx` + `src/modules/reports/`)

| Función IA | Monolito | App Refactorizada | Brecha |
|---|---|---|---|
| **Análisis Epidemiológico** | Informe completo con IA | ❌ NO EXISTE | Estructura (`EpidemiologicalReport.jsx`) sin IA |
| **Predicción de Riesgo** | Modelos predictivos | ❌ NO EXISTE | `predictiveModels.js` sin integración UI |

### 2.4 SGSST (`src/modules/sgsst/`)

| Función IA | Monolito | App Refactorizada | Brecha |
|---|---|---|---|
| **Plan Anual IA** | Generación automática | ❌ NO EXISTE | `AnnualPlan.jsx` sin IA |
| **Matriz de Riesgos IA** | Evaluación GTC-45 | ❌ NO EXISTE | `RiskMatrix.jsx` sin IA |
| **Políticas IA** | Generación de políticas | ❌ NO EXISTE | `PolicyGenerator.jsx` sin IA |

### 2.5 AGENDA, FACTURACIÓN, DASHBOARD, TELEMEDICINA

| Función IA | Brecha |
|---|---|
| Optimizar horario IA | ❌ NO EXISTE |
| Generar propuesta IA | ❌ NO EXISTE |
| Resumen IA del día | ❌ NO EXISTE |
| Profesiograma IA | ❌ NO EXISTE |

---

## 3. RESUMEN DE BRECHAS (GLOBAL)

| Categoría | Implementado | Ausente | % Cobertura |
|---|---|---|---|
| HC Ocupacional | 3 funciones | 1 (cierre IA) | 75% |
| HC General | 3 funciones | 0 | 100% |
| Reportes | 0 | 2 | 0% |
| SGSST | 0 | 3 | 0% |
| Agenda | 0 | 1 | 0% |
| Facturación | 0 | 1 | 0% |
| Dashboard | 0 | 1 | 0% |
| Telemedicina | 0 | 1 | 0% |

**TOTAL**: 6/15 funciones IA — **40% cobertura**

---

## 4. PROTOCOLO DE IMPLEMENTACIÓN (6 FASES)

### FASE 1 — IA en Reportes (P1: CRÍTICA)
**Archivos a modificar**:
- `src/modules/reports/components/EpidemiologicalReport.jsx`
- `src/modules/reports/components/AnalyticsDashboard.jsx`
- `src/modules/ai/services/aiAnalysis.js` (agregar `generateEpiReport()`)

### FASE 2 — IA en SGSST (P1: CRÍTICA)
**Archivos**: `PolicyGenerator.jsx`, `RiskMatrix.jsx`, `AnnualPlan.jsx`

### FASE 3 — IA en Agenda (P1)
**Archivos**: `AgendaView.jsx`, `aiAnalysis.js`

### FASE 4 — IA en Facturación (P2)
**Archivos**: `CotizacionesPage.jsx`, `aiAnalysis.js`

### FASE 5 — IA en Dashboard (P2)
**Archivos**: `DashboardPage.jsx`

### FASE 6 — Telemedicina (P3)
**Archivos**: `TelemedicinePage.jsx`, `ProfesiogramaAI.jsx`

---

## 5. TRAZABILIDAD DE SESIONES

| Sesión | Fecha | Fase completada | Commits | Estado |
|---|---|---|---|---|
| 1 | 2026-06-22 | Auditoría completa + API keys + prompts | — | ✅ |
| 2 | Pendiente | FASE 1 (Reportes) | — | ❌ Sin iniciar |
| 3 | Pendiente | FASE 2 (SGSST) | — | ❌ Sin iniciar |

---

## 6. ARQUITECTURA DE SERVICIOS IA

```
src/modules/ai/
├── index.js
├── services/
│   ├── aiAnalysis.js       ← 6 funciones exportadas + 2 helpers
│   └── predictiveModels.js ← Modelos predictivos (sin UI)
├── components/
│   ├── AIConfigPanel.jsx   ← Panel configuración ✅ (219 líneas)
│   └── AIAssistant.jsx     ← Asistente flotante 🔶
src/stores/
├── aiStore.js              ← Store Zustand persistido en localStorage ✅ (49 líneas)
src/shared/lib/
├── aiProviders.js          ← 4 providers + callAIWithFailover + parseAIJSON ✅ (416 líneas)
src/utils/
├── aiProviders.js          ← ❗DUPLICADO de shared/lib/aiProviders.js
```

---

## 7. REGLAS DE IMPLEMENTACIÓN

1. **NO duplicar** `callAIWithFailover`. Usar el existente en `src/shared/lib/aiProviders.js`
2. **NO crear nuevos paneles IA**. Reusar `AIConfigPanel.jsx`
3. **Cada botón IA** debe mostrar `<Sparkles>` + `<Loader2>` durante carga
4. **Plan gate**: validar que `useAIStore.getState().getConfig()` tenga al menos una key configurada
5. **Commit separado** por cada fase completada
6. **NO cambiar prompts existentes** — son réplica forense del monolito

---

# ══════════════════════════════════════════════════════════════════════════════
# SECCIÓN 8 — CONFIGURACIÓN DE API KEYS
# ══════════════════════════════════════════════════════════════════════════════

## 8.1 Dónde se ingresan las API Keys

### UI: `src/modules/ai/components/AIConfigPanel.jsx` (219 líneas)

**Punto de acceso**: Botón ⚙️ "Settings" en la barra de acciones de HistoriaPage y HistoriaGeneralPage. También accesible desde `App.jsx` línea 778 (modal).

**Componente**: `AIConfigPanel` — renderizado condicionalmente en `src/pages/HistoriaPage.jsx` línea 775-790 y en `src/pages/HistoriaGeneralPage.jsx` línea 249-257.

**Flujo de UI**:
1. El usuario hace clic en ⚙️ "Config IA" → se abre modal `AIConfigPanel`
2. El panel muestra 4 tarjetas de proveedores (Gemini, Groq, Together AI, OpenRouter)
3. Cada tarjeta tiene:
   - Botón "📋 Cómo obtener" (guía paso a paso en español)
   - Link externo "🔗 Obtener key" → sitio del proveedor
   - Campo `<input type="password">` para pegar la API Key
   - Botón "Probar" → llama al proveedor con prompt "Responde SOLO con la palabra: CONECTADO"
   - Indicador de estado: ✅ funciona / ❌ error con mensaje
4. El usuario selecciona proveedor principal (radio buttons)
5. Botón "Guardar Configuración" → `onSave(cfg)` → `useAIStore.setKey()` + `useAIStore.setActiveProvider()`

### Store: `src/stores/aiStore.js` (49 líneas)

**Persistencia**: Zustand `persist` middleware → `localStorage` bajo la clave `siso-ai-config`.

**Estructura del estado**:
```js
{
  activeProvider: 'gemini',        // Proveedor principal (por defecto)
  keys: {
    gemini: '',       // API Key de Google Gemini (AIza...)
    groq: '',          // API Key de Groq (gsk_...)
    together: '',      // API Key de Together AI
    openrouter: '',    // API Key de OpenRouter (sk-or-...)
  },
  showConfig: false,   // Control de visibilidad del panel
  status: null,        // 'loading' | 'ok' | 'error'
}
```

**Funciones del store**:
- `getConfig()` → retorna `{ activeProvider, keys }` para pasar a `callAIWithFailover`
- `hasAnyKey()` → verifica si al menos un proveedor tiene key configurada
- `setKey(provider, key)` → actualiza una key individual
- `setActiveProvider(provider)` → cambia el proveedor principal

**Seguridad**: Las keys se persisten en localStorage (`siso-ai-config`). NO se envían al Worker D1. Se envían directamente desde el navegador a las APIs de los proveedores.

---

## 8.2 Cómo se usan las API Keys en las llamadas

### `src/shared/lib/aiProviders.js` — `callAIWithFailover()` (líneas 37-63)

**Orden de failover**:
1. Usa `activeProvider` del store como primer intento
2. Si falla, itera por los otros 3 proveedores que tengan key configurada

```js
export const callAIWithFailover = async (prompt, systemPrompt, aiConfig) => {
  const providers = ['gemini', 'groq', 'together', 'openrouter'];
  const ordered = [
    aiConfig?.activeProvider,
    ...providers.filter((p) => p !== aiConfig?.activeProvider),
  ].filter(Boolean);

  for (const providerKey of ordered) {
    const key = aiConfig?.keys?.[providerKey];
    if (!key?.trim()) continue;
    const provider = AI_PROVIDERS[providerKey];
    if (!provider) continue;
    try {
      const result = await provider.call(prompt, systemPrompt || DEFAULT_SYSTEM_PROMPT, key.trim());
      if (result && result.length > 0) return result;
    } catch (e) {
      lastError = e;
      continue; // Siguiente proveedor
    }
  }
  throw lastError || new Error('No hay proveedores de IA configurados o disponibles');
};
```

**Formato de API keys por proveedor**:

| Proveedor | Prefijo key | Endpoint | Autenticación | Modelos |
|---|---|---|---|---|
| Gemini | `AIza...` | `generativelanguage.googleapis.com/v1beta/models/` | Query param `?key=` | gemini-2.5-flash, gemini-2.0-flash... |
| Groq | `gsk_...` | `api.groq.com/openai/v1/chat/completions` | Header `Authorization: Bearer` | llama-3.3-70b-versatile, gemma2-9b-it... |
| Together AI | texto libre | `api.together.ai/v1/chat/completions` | Header `Authorization: Bearer` | Llama-3.3-70B-Instruct-Turbo... |
| OpenRouter | `sk-or-...` | `openrouter.ai/api/v1/chat/completions` | Header `Authorization: Bearer` | 10 modelos free |

---

# ══════════════════════════════════════════════════════════════════════════════
# SECCIÓN 9 — PROMPTS QUIRÚRGICOS COMPLETOS (SIN MODIFICAR)
# ══════════════════════════════════════════════════════════════════════════════

> **ADVERTENCIA**: Los siguientes prompts son extracción forense literal del código fuente.  
> **NO modificar, NO minimizar**. Son la réplica exacta de los prompts del monolito.

---

## 9.1 analyzeHC — Análisis completo HC Ocupacional

### DEFAULT_SYSTEM_PROMPT (compartido por todas las funciones ocupacionales)

```
Eres un médico especialista en Medicina del Trabajo con más de 15 años de experiencia en evaluaciones 
ocupacionales en Colombia. Conoces la normatividad colombiana: Res. 1843/2025 (deroga Res. 2346/2007), 
Dec. 1072/2015, Guías GATISO, GTC-45, Dec. 1477/2014. Respondes siempre en español formal y técnico.
```

### User Prompt (líneas 138-170 de aiAnalysis.js)

```
Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en evaluaciones 
ocupacionales en Colombia (ingresos, egresos, periódicos, reintegros, post-incapacidad). Analiza con 
criterio clínico-ocupacional experto la siguiente historia y genera el concepto médico ocupacional 
conforme a Res. 1843/2025 (norma vigente - deroga Res. 2346/2007). Devuelve ÚNICAMENTE JSON.

DATOS DEL TRABAJADOR: Cargo: [HC_CARGO] | Empresa: [HC_EMPRESA] ([HC_ACT_ECON]) | Tipo examen: [HC_TIPO] |
Énfasis: [HC_ENFASIS]
Edad: [HC_EDAD]a | Género: [HC_GENERO] | Escolaridad: [HC_ESCOLARIDAD] | ARL: [HC_ARL]
Signos vitales: TA [HC_TA] | FC [HC_FC] | IMC [HC_IMC] | Talla [HC_TALLA]cm | Peso [HC_PESO]kg
Hallazgos físicos patológicos: [HALLAZGOS]
Antecedentes personales relevantes: [ANTECEDENTES]
Riesgos ocupacionales identificados: [RIESGOS]
Hábitos: Tabaquismo [HC_FUMA] | Alcohol [HC_ALCOHOL] | Actividad física [HC_DEPORTE]

CONTEXTO ESPECÍFICO DEL TIPO DE EXAMEN: [CONTEXTO_TIPO]

CRITERIOS OBLIGATORIOS: 1) El concepto de aptitud debe citar el artículo de la Res. 1843/2025 
correspondiente (norma vigente desde 29 abril 2025). 2) Si es egreso o post-incapacidad, incluir 
análisis de reintegro laboral. 3) Las restricciones deben ser operativas, cuantificables y con base 
normativa (GTC-45, GATISO). 4) Las recomendaciones deben responder al contexto del tipo de examen.

JSON REQUERIDO (sin markdown, sin texto adicional):
{"diagnosticoPrincipal":"Z10.0 - EXAMEN MÉDICO OCUPACIONAL","diagnosticoSecundario1":"CIE-10 o vacío",
"diagnosticoSecundario2":"CIE-10 o vacío","conceptoAptitud":"APTO/APTO CON RESTRICCIONES/NO APTO 
con justificación. Conforme Res. 1843/2025 Art. 20","vigencia":"X meses justificados",
"recomendaciones":"Mínimo 10 recomendaciones específicas para cargo y riesgos",
"restriccionesTexto":"Restricciones operativas cuantificables, formato [TIPO](Segmento) desc — norma",
"derivaciones":[{"especialidad":"","motivo":"","urgencia":"Electiva"}],
"examenesSugeridos":["examen 1"],"interconsultaResumen":"",
"incapacidadSugerida":{"aplica":false,"dias":0,"motivo":"","diagnosticoCIE":""},
"analisisClinico":"Análisis técnico-formal >=200 palabras con normativa colombiana",
"sveRecomendado":["SVE Osteomuscular","SVE Psicosocial"]}
```

### Retry prompt (si el primero falla — línea 179-181)

```
Analiza esta HC ocupacional y devuelve JSON: [JSON_COMPACTO_DATOS]
```

### Contextos por tipo de examen (`_buildContextoTipo`, líneas 68-107)

Cada tipo de examen inyecta un contexto específico de 5 puntos (A,B,C,D,E) en el prompt. Los tipos son: INGRESO, PERIÓDICO, EGRESO/RETIRO, POST-INCAPACIDAD/REINTEGRO, y SEGUIMIENTO. Cada uno define criterios de evaluación, recomendaciones requeridas y normativa aplicable específica al tipo de examen.

---

## 9.2 generateRestrictions — Restricciones médico-laborales

### User Prompt (líneas 257-275)

```
Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia, 
experto en restricciones médico-laborales y vigilancia epidemiológica. 
Con base en los hallazgos clínicos, genera restricciones médico-laborales. Devuelve ÚNICAMENTE JSON.

DATOS: Cargo: [HC_CARGO] | Empresa: [HC_EMPRESA] | Tipo examen: [HC_TIPO]
Riesgos ocupacionales: [RIESGOS]
Hallazgos físicos patológicos: [HALLAZGOS]
Maniobras osteomusculares positivas: [OSTEO]
IMC: [HC_IMC] | TA: [HC_TA] | Diagnóstico principal: [HC_DX]

INSTRUCCIÓN: Restricciones operativas, cuantificables (kg/min/grados/frecuencias), 
segmento anatómico, tipo TEMPORAL/PERMANENTE/PREVENTIVA, duración, base normativa. 
Si es post-incapacidad o reintegro (Res. 1843/2025 Art. 13), incluir reintegro progresivo.

JSON REQUERIDO (sin markdown):
{"restricciones":[{"segmento":"Lumbar/Miembro Superior/Cervical/Postural/General",
"tipo":"TEMPORAL/PERMANENTE/PREVENTIVA","duracion":"X semanas o N/A",
"texto":"Restricción específica cuantificable",
"normativa":"GTC-45:2012 / GATISO-DME / Res. 1843/2025"}]}
```

---

## 9.3 generateRecommendations — Recomendaciones (4 categorías)

### User Prompt (líneas 302-318)

```
Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia. 
Genera recomendaciones médico-laborales ESPECÍFICAS para el trabajador evaluado. 
No uses recomendaciones genéricas. Texto plano numerado, sin JSON, español formal.

DATOS: Cargo: [HC_CARGO] | Empresa: [HC_EMPRESA] | Actividad económica: [HC_ACT_ECON]
Riesgos laborales: [RIESGOS]
IMC: [HC_IMC] | TA: [HC_TA] | Tabaquismo: [HC_FUMA] | Alcohol: [HC_ALCOHOL] | Actividad física: [HC_DEPORTE]
Diagnóstico principal: [HC_DX]
Tipo de examen: [HC_TIPO]

INSTRUCCIÓN: Genera mínimo 12 recomendaciones numeradas en 4 secciones:
(A) Recomendaciones médicas y de estilo de vida
(B) Recomendaciones ergonómicas específicas para el cargo
(C) Vigilancia epidemiológica y seguimiento médico
(D) Recomendaciones al empleador — Res. 1843/2025 y Dec. 1072/2015
```

---

## 9.4 analyzeGeneralHC — HC Medicina General

### System Prompt (línea 329)

```
Eres un médico general colombiano experto. Respondes siempre en español. 
Genera análisis clínicos estructurados con diagnósticos CIE-10 y planes basados en evidencia.
```

### User Prompt (líneas 332-344)

```
Eres médico general con más de 15 años de experiencia en Colombia. Analiza la consulta y elabora 
plan de manejo completo. Devuelve ÚNICAMENTE JSON.

DATOS: [HC_NOMBRES] | Edad: [HC_EDAD]a | Género: [HC_GENERO]
Motivo: [HC_MOTIVO]
Enfermedad actual: [HC_ENF_ACTUAL]
TA: [HC_TA] | FC: [HC_FC] | IMC: [HC_IMC]
Hallazgos: [HC_HALLAZGOS]

JSON REQUERIDO:
{"diagnosticos":[{"cie10":"","descripcion":"","tipo":"Principal"}],
"plan":{"conducta":"","medicamentos":"",
"formulaMedicamentos":[{"nombre":"","presentacion":"","dosis":"","frecuencia":"","duracion":"","indicaciones":""}],
"paraclinicosSolicitados":"","remisiones":"","recomendaciones":"","controlEn":""},
"analisis":"Razonamiento clínico 4-5 líneas"}
```

---

## 9.5 suggestDiagnosis — Sugerencia CIE-10 (líneas 353-358)

### User Prompt
```
Basándote en los hallazgos clínicos, sugiere los 3 diagnósticos CIE-10 más probables.
Paciente: [EDAD] años, [GENERO], cargo: [CARGO]
Hallazgos: [HALLAZGOS_ANORMALES]
Responde EXACTAMENTE: [{"code": "Z10.0", "description": "..."}]
```

### System Prompt
```
Eres médico colombiano experto en CIE-10. Responde SOLO el array JSON.
```

---

## 9.6 suggestExams — Sugerencia paraclínicos CUPS (líneas 372-377)

### User Prompt
```
Sugiere exámenes paraclínicos para este trabajador.
Cargo: [CARGO], edad [EDAD]a, tipo: [TIPO_EXAMEN]
Riesgos: [RIESGOS]
Responde EXACTAMENTE: [{"cups": "903801", "description": "...", "justification": "..."}]
```

### System Prompt
```
Eres médico ocupacional colombiano. Responde SOLO el array JSON con códigos CUPS válidos.
```

---

## 9.7 analyzeEpidemiologicalData — SVE (líneas 391-406)

### User Prompt
```
Analiza datos epidemiológicos[ del programa PROGRAMA]:

- Total trabajadores: [TOTAL]
- Diagnósticos frecuentes:
  [DIAGNOSTICO]: [N] casos
  ...

Genera:
1. Análisis de morbilidad ocupacional
2. Factores de riesgo predominantes
3. Programas de vigilancia recomendados
4. Acciones inmediatas
5. Indicadores del grupo
```

---

# ══════════════════════════════════════════════════════════════════════════════
# SECCIÓN 10 — ANÁLISIS DE BOTONES DUPLICADOS
# ══════════════════════════════════════════════════════════════════════════════

## 10.1 Inventario de todos los botones IA en la app

| # | Archivo | Botón | Función llamada | Línea |
|---|---|---|---|---|
| 1 | `HistoriaPage.jsx` | "IA Resumen" | `onGenerateAI` → `analyzeHC()` | 628 |
| 2 | `HistoriaPage.jsx` | "IA Restr" | `onGenerateRestrictions` → `generateRestrictions()` | 632 |
| 3 | `HistoriaPage.jsx` | "IA Reco" | `onGenerateRecommendations` → `generateRecommendations()` | 634 |
| 4 | `HistoriaPage.jsx` | ⚙️ Settings | `setShowAIConfig(true)` | 637 |
| 5 | `HistoriaGeneralPage.jsx` | "IA General" | `onGenerateAI` → `analyzeGeneralHC()` | 206 |
| 6 | `HistoriaGeneralPage.jsx` | "IA Restr" | `onGenerateRestrictions` → `generateRestrictions()` | 208 |
| 7 | `HistoriaGeneralPage.jsx` | "IA Reco" | `onGenerateRecommendations` → `generateRecommendations()` | 212 |
| 8 | `HistoriaGeneralPage.jsx` | ⚙️ Settings | `setShowAIConfig(true)` | 214 |

## 10.2 Análisis de duplicación

### ¿Hay botones duplicados?

**NO**. Los botones IA están correctamente separados por contexto:

- **HC Ocupacional** (`HistoriaPage.jsx`): 3 botones + settings → funciones de análisis ocupacional
- **HC General** (`HistoriaGeneralPage.jsx`): 3 botones + settings → funciones de análisis general

Las funciones llamadas son DIFERENTES:
- `analyzeHC()` → HC ocupacional (prompt con normativa SST, 5 contextos de tipo examen)
- `analyzeGeneralHC()` → HC general (prompt con plan de manejo, fórmula médica, CIE-10)
- `generateRestrictions()` → compartida por ambas (el prompt incluye maniobras osteomusculares si existen)
- `generateRecommendations()` → compartida por ambas (el prompt incluye datos del contexto)

### ¿Hay archivos duplicados?

**SÍ** — `src/utils/aiProviders.js` es un DUPLICADO de `src/shared/lib/aiProviders.js`. Ambos tienen 413-416 líneas con exactamente la misma lógica. El duplicado en `src/utils/` NO es importado por ningún otro archivo según la búsqueda global. **Se debe eliminar** para evitar divergencia de código.

## 10.3 Botones IA faltantes (no duplicados, simplemente ausentes)

| Módulo | Botón faltante | Función IA requerida |
|---|---|---|
| Reportes | "IA Análisis Epidemiológico" | `analyzeEpidemiologicalData()` (ya existe en aiAnalysis.js línea 391) |
| Reportes | "IA Predicción de Riesgo" | Nueva función `predictRisk()` en aiAnalysis.js |
| SGSST | "IA Generar Política" | Nueva función `generatePolicy()` |
| SGSST | "IA Evaluar GTC-45" | Nueva función `evaluateGTC45()` |
| SGSST | "IA Plan Anual" | Nueva función `generateAnnualPlan()` |
| Agenda | "IA Optimizar Horario" | Nueva función `optimizeSchedule()` |
| Facturación | "IA Generar Propuesta" | Nueva función `generateProposal()` |
| Dashboard | "IA Resumen del Día" | Nueva función `dailySummary()` |