# PROTOCOLO IA COMPLETO - ANÁLISIS Y COMPLEMENTOS
## Módulo de Inteligencia Artificial - siso-appultimo vs Monolito

---

## 📊 ANÁLISIS ACTUAL DEL MÓDULO IA

### 1. AIConfigPanel (Panel de Configuración) ✅
**Estado:** Implementado en `src/modules/ai/components/AIConfigPanel.jsx`

**Funcionalidades:**
- ✅ Configuración de 4 proveedores: Gemini, Groq, Together AI, OpenRouter
- ✅ Campo para ingresar API Keys
- ✅ Botón de prueba de conexión por proveedor
- ✅ Sistema de fallback automático
- ✅ Persistencia en localStorage

**Monolito tiene:**
- ✅ Mismo panel de configuración
- ✅ Keys en sessionStorage (no localStorage)
- ✅ Botón "Obtener nuevas API keys" con enlaces a proveedores

**Estado siso-appultimo:** ✅ COMPLETO (90%)

---

### 2. AI_PROVIDERS (Proveedores) ✅
**Estado:** Implementado en `src/shared/lib/aiProviders.js` (o similar)

**Proveedores configurados:**
- ✅ Gemini (Google) - API Key
- ✅ Groq - API Key
- ✅ Together AI - API Key
- ✅ OpenRouter - API Key

**Monolito tiene:**
- ✅ Mismos 4 proveedores
- ✅ URLs de API endpoints
- ✅ Funciones de fetch con timeout

**Estado siso-appultimo:** ✅ COMPLETO

---

### 3. generateAIAnalysis (Análisis de HC) ✅
**Estado:** Implementado en `src/modules/ai/services/aiAnalysis.js`

**Funcionalidades:**
- ✅ analyzeHC() - Análisis completo de HC ocupacional
- ✅ 5 contextos: INGRESO, PERIÓDICO, EGRESO, POST-INCAPACIDAD, SEGUIMIENTO
- ✅ Retry mechanism con fallback
- ✅ JSON estructurado con 12 campos
- ✅ Integración con UI en HistoriaPage.jsx

**Monolito tiene:**
- ✅ Misma función con mismo prompt
- ✅ Llamado desde botón "Analizar HC con IA"

**Estado siso-appultimo:** ✅ COMPLETO (B-01)

---

### 4. generateAIRestricciones ✅
**Estado:** Implementado en `src/modules/ai/services/aiAnalysis.js`

**Funcionalidades:**
- ✅ generateRestrictions() - Restricciones laborales
- ✅ Incluye maniobras osteomusculares (Phalen, Tinel, etc.)
- ✅ Formato JSON con categoría, descripción, duración
- ✅ Normativa GTC-45/GATISO

**Monolito tiene:**
- ✅ Misma función

**Estado siso-appultimo:** ✅ COMPLETO (B-05)

---

### 5. generateAIRecomedaciones ✅
**Estado:** Implementado en `src/modules/ai/services/aiAnalysis.js`

**Funcionalidades:**
- ✅ generateRecommendations() - Recomendaciones laborales
- ✅ 4 categorías: Médicas, Ergonómicas, Vigilancia, Empleador
- ✅ Formato JSON estructurado

**Monolito tiene:**
- ✅ Misma función

**Estado siso-appultimo:** ✅ COMPLETO (B-06)

---

### 6. generateAIReport (Análisis por Empresa) ⚠️
**Estado:** PARCIAL - La función existe en aiAnalysis.js pero no está conectada completamente

**Funcionalidades implementadas:**
- ✅ analyzeEpidemiologicalData() en aiAnalysis.js
- ✅ recibe patients, aiConfig
- ✅ Genera reporte epidemiológicopor empresa

**Falta por conectar:**
- ❌ Botón en ReporteSection.jsx para activar análisis IA
- ❌ Integración con selectedCompanyReport
- ❌ Mostrar resultado en UI

**Monolito tiene:**
- ✅ Botón en sección de reportes "🤖 Generar Reporte IA"
- ✅ Análisis por empresa específico
- ✅ Muestra resultado en modal/panel

**Estado siso-appultimo:** ⚠️ 60% - Falta integración UI

---

## 📋 COMPLEMENTOS NECESARIOS PARA 100%

### C-01: Conectar generateAIReport en ReporteSection
**Archivo:** `src/sections/ReporteSection.jsx`

**Cambios necesarios:**
1. Importar analyzeEpidemiologicalData desde aiAnalysis
2. Agregar estado para reportAIResult
3. Crear función handleGenerateAIReport()
4. Agregar botón en sección de reportes
5. Mostrar resultado en UI

### C-02: Mejorar AIConfigPanel
**Archivo:** `src/modules/ai/components/AIConfigPanel.jsx`

**Mejoras necesarias:**
1. Agregar botón "Obtener API Keys" con enlaces a cada proveedor
2. Mover keys a sessionStorage (como monolito)
3. Validación de formato de keys

### C-03: Agregar más funciones IA
**Archivos:** `src/modules/ai/services/aiAnalysis.js`

**Funciones faltantes (del monolito):**
- analyzeGeneralHC() - HC Medicina General
- suggestDiagnosis() - Sugerencia de diagnósticos
- suggestExams() - Sugerencia de exámenes paraclinicos

---

## 📁 ARCHIVO: aiAnalysis.js - FUNCIONES ACTUALES

```javascript
// Exports actuales:
export const callAIWithFailover      // ✅ Failover entre proveedores
export const analyzeHC               // ✅ B-01: Análisis HC completo
export const generateRestrictions    // ✅ B-05: Restricciones
export const generateRecommendations // ✅ B-06: Recomendaciones
export const analyzeGeneralHC        // ⚠️ Existe pero no conectada
export const suggestDiagnosis        // ⚠️ Existe pero no conectada
export const suggestExams           // ⚠️ Existe pero no conectada
export const analyzeEpidemiologicalData // ✅ Análisis por empresa
```

---

## 🎯 PRÓXIMOS PASOS PARA COMPLETAR IA

### Inmediato:
1. **C-01:** Conectar analyzeEpidemiologicalData al botón de reportes
2. **C-02:** Agregar botón de enlaces a API keys en AIConfigPanel

### A futuro:
3. Conectar analyzeGeneralHC en HistoriaGeneralPage
4. Conectar suggestDiagnosis en formulario de HC
5. Conectar suggestExams en solicitud de exámenes

---

*Documento generado: 2026-04-17 22:02*
*Análisis del módulo de IA completado*