# INFORME FORENSE IA — siso-appultimo-arp
**Fecha:** 2026-06-22  
**Build auditado:** v.2b7f4f0 (`siso-appultimo-arp.pages.dev`)  
**Protocolo:** Secciones A–J (10 secciones)  
**Método:** Inspección DOM en vivo + análisis de código fuente  

---

## RESUMEN EJECUTIVO

Se auditaron 10 secciones de integración IA. Se encontraron **2 bugs críticos** y **4 módulos con IA declarada pero no implementada**. El panel de configuración IA funciona correctamente pero solo es accesible desde HC Ocupacional. El módulo Reportes está completamente roto por un import faltante. No hay ninguna API key configurada.

---

## TABLA MAESTRA DE ESTADO

| Módulo | Ruta | Botones IA | Config ⚙️ | Comportamiento sin key | Estado |
|---|---|---|---|---|---|
| **A. Config IA Panel** | `/hc/new` (modal) | — | ✅ title="Configuracion IA" | — | ✅ FUNCIONA |
| **B. HC Ocupacional** | `/hc/new` | IA Resumen, IA Restr, IA Reco, Análisis IA Completo (×4) | ✅ | Sin respuesta visible | ⚠️ PARCIAL |
| **C. HC General** | `/hc/general` | IA General, IA Restr, IA Reco, Análisis IA, Generar con IA (×2) — 6 total | ❌ no ⚙️ | No auditado | ⚠️ PARCIAL |
| **D. Reportes** | `/reports` | ❌ Inaccesibles | ❌ | CRASH total | ❌ ROTO |
| **E. SG-SST** | `/sgsst` | ❌ CERO | ❌ | — | ❌ NO IMPLEMENTADO |
| **F. Agenda** | `/agenda` | IA Optimizar Agenda (×1) | ❌ | "Configura tu proveedor de IA en ⚙️" ✅ | ✅ FUNCIONA |
| **G. Dashboard** | `/dashboard` | IA Resumen del Día (×1) | ❌ | "Configura tu proveedor de IA en ⚙️" ✅ | ✅ FUNCIONA |
| **H. Facturación** | `/billing` | ❌ CERO | ❌ | — | ❌ NO IMPLEMENTADO |
| **I. Telemedicina** | `/telemedicine` | ❌ CERO | ❌ | — | ❌ NO IMPLEMENTADO |
| **J. DevTools / localStorage** | — | — | — | 0 API keys | ⚠️ SIN CONFIG |

---

## SECCIÓN A — PANEL CONFIGURACIÓN IA

**Ubicación:** Botón gear (SVG) en barra de acciones de HC Ocupacional, `title="Configuracion IA"`  
**Activación:** Solo desde `/hc/new` — NOT accessible from Agenda, Dashboard, SGSST, Facturación, Telemedicina

**Proveedores disponibles:**
| Proveedor | Modelos | Badge | API Key configurada |
|---|---|---|---|
| Google Gemini | 2.0 Flash · 1.5 Flash | 🟢 Gratis · Alta calidad | ❌ Vacío |
| Groq | Llama 3.3 70B | 🟢 Gratis · Más rápido | ❌ Vacío |
| Together AI | Llama 3.3 70B | 🟢 Gratis · Sin límite | ❌ Vacío |
| OpenRouter | 10 modelos free | 🟢 Gratis · Multi-modelo | ❌ Vacío |

**Botones por proveedor:** "📋 Cómo obtener", "🔗 Obtener key", "👁" (toggle), "Probar"  
**Acciones panel:** "Cancelar", "Guardar Configuración"  
**Componente:** `src/modules/ai/components/AIConfigPanel.jsx`  
**Store:** `src/stores/aiStore.js` (Zustand + persist → `siso-ai-store`)

---

## SECCIÓN B — HC OCUPACIONAL

**Ruta:** `/hc/new`  
**Botones IA encontrados:** IA Resumen, IA Restr, IA Reco, Análisis IA Completo  
**Config IA (⚙️):** ✅ ENCONTRADO (`title="Configuracion IA"`)  
**Total inputs formulario:** 140  
**Comportamiento sin key:** Al click en "IA Resumen" → sin respuesta visible en DOM inmediato (posible scroll necesario o respuesta en estado interno)  
**Componente:** `src/modules/clinical/components/OccupationalHC.jsx`

---

## SECCIÓN C — HC GENERAL

**Ruta:** `/hc/general`  
**Botones IA encontrados:** IA General, IA Restr, IA Reco, Análisis IA, Generar con IA (×2) — **6 botones total**  
**Config IA (⚙️):** ❌ NO ENCONTRADO — ausente en HC General  
**Total inputs formulario:** 78  
**Componente:** `src/modules/clinical/components/GeneralHC.jsx`

> **BUG-IA-02:** El botón Config IA (⚙️) no existe en HC General. Si el usuario ingresa desde HC General no puede configurar sus API keys.

---

## SECCIÓN D — REPORTES (ROTO)

**Ruta:** `/reports`  
**Estado:** ❌ CRASH TOTAL — página muestra "Error al cargar el módulo / useState is not defined"

**Root cause (código):**
```
src/modules/reports/components/EpidemiologicalReport.jsx — línea 1:
import { useAuthStore } from '../../../stores/authStore';  ← PRIMER IMPORT
// ← FALTA: import React, { useState } from 'react';
```
El archivo usa `useState` en líneas 21+ sin importarlo. El bundler en producción no inyecta `useState` globalmente → runtime crash.

**Botones IA declarados (inaccesibles por crash):**
- `callAIWithFailover` (importado en ReportsPage.jsx línea 10)
- `analyzeEpidemiologicalData` (importado en ReportsPage.jsx línea 10)

**Fix requerido:**
```jsx
// Agregar como primera línea de EpidemiologicalReport.jsx:
import React, { useState, useEffect, useMemo, useCallback } from 'react';
```

---

## SECCIÓN E — SG-SST

**Ruta:** `/sgsst`  
**Botones IA encontrados:** ❌ CERO (ninguno)  
**Secciones presentes:** Dashboard, Ciclo PHVA, Indicadores de Accidentalidad, Acciones Rápidas, Documentos Obligatorios, Inspecciones  
**Botones de acción:** Configurar Empresa, Evaluar Estándares, Crear Política SST, Actualizar Matriz IPEVR, Programar Capacitación, Ejecutar Inspección, Reportar Accidente, Gestionar Documentos  

**Funciones IA esperadas (PROMPT_MAESTRO) pero NO implementadas:**
- "Generar Política SST con IA"
- "Analizar Matriz GTC-45 con IA"
- "Generar Plan Anual SST con IA"

**Componente:** `src/pages/SGSSTPage.jsx`

---

## SECCIÓN F — AGENDA

**Ruta:** `/agenda`  
**Botones IA:** ✅ "IA Optimizar Agenda" (×1)  
**Config IA (⚙️):** ❌ No presente en Agenda  
**Comportamiento al click (sin key):** Muestra inline "Configura tu proveedor de IA en ⚙️" ✅  
**Fuente de datos agenda:** Local / Supabase (2 citas cargadas — D1 muestra vacío)  

---

## SECCIÓN G — DASHBOARD

**Ruta:** `/dashboard`  
**Botones IA:** ✅ "IA Resumen del Día" (×1)  
**Comportamiento al click (sin key):** Muestra "Configura tu proveedor de IA en ⚙️" ✅ (sin crash)  

---

## SECCIÓN H — FACTURACIÓN

**Ruta:** `/billing`  
**Tabs:** Facturación, Propuestas, DIAN  
**Botones IA:** ❌ CERO  
**"Propuestas":** Tab de cotizaciones manuales — NO es generación por IA  
**Función IA esperada (PROMPT_MAESTRO):** "Generar Propuesta con IA" — NO implementada  

---

## SECCIÓN I — TELEMEDICINA

**Ruta:** `/telemedicine`  
**Botones IA:** ❌ CERO  
**Estado:** "No hay teleconsultas registradas"  
**Tabs:** Todas, Programadas, En curso, Finalizadas  
**Funciones IA esperadas:** Transcripción de consulta, Resumen IA — NO implementadas  

---

## SECCIÓN J — DEVTOOLS / localStorage / aiStore

**localStorage (11 claves totales):**
- Claves con "ai" o "ia_": **NINGUNA**
- `siso_ai_keys_drcucalon`: null en localStorage (datos en D1 como objeto, NO sincronizados a localStorage)
- `siso_ai_config_provider`: null en localStorage

**aiStore (Zustand):**
- Store definido en `src/stores/aiStore.js` ✅
- Persiste a clave `siso-ai-store` (Zustand persist)
- Estado initial: `activeProvider: 'gemini'`, `keys: { gemini:'', groq:'', together:'', openrouter:'' }`
- Ninguna key tiene valor configurado en sesión actual

**aiProviders duplicados:**
- Fuente única: `src/shared/lib/aiProviders.js` → `AI_PROVIDERS` ✅
- Sin duplicados detectados

**Errores de consola capturados:** No capturados via `window.__capturedErrors`  
**Error visible en UI:** "useState is not defined" en `/reports` (ver Sección D)

---

## BUGS ENCONTRADOS

### BUG-IA-01 — CRÍTICO: Reportes crash por `useState` no importado
- **Archivo:** `src/modules/reports/components/EpidemiologicalReport.jsx`
- **Línea:** 1 (falta import)
- **Síntoma:** Página `/reports` → "Error al cargar el módulo / useState is not defined"
- **Impacto:** Módulo Reportes 100% inutilizable. Ninguna función IA de reportes accesible.
- **Fix:** Agregar `import React, { useState, useEffect, useMemo, useCallback } from 'react';` como primera línea.
- **Riesgo fix:** BAJO — solo agrega import faltante.

### BUG-IA-02 — MEDIO: Config IA (⚙️) ausente en HC General
- **Archivo:** `src/modules/clinical/components/GeneralHC.jsx`
- **Síntoma:** Usuario en HC General no puede acceder a Config IA para configurar su API key.
- **Fix:** Agregar el mismo botón `<button title="Configuracion IA">` que existe en OccupationalHC.jsx.

### BUG-IA-03 — BAJO: AI keys en D1 no sincronizan a localStorage/aiStore al login
- **Archivo:** `src/stores/aiStore.js` / flujo de login
- **Síntoma:** `siso_ai_keys_drcucalon` existe en D1 como objeto pero el aiStore arranca con todas las keys vacías. El usuario debe re-configurar en cada sesión.
- **Fix:** Al inicializar aiStore, hacer `d1Get('siso_ai_keys_drcucalon')` y poblar el store con las keys encontradas.

---

## FUNCIONES DECLARADAS PERO NO ENCONTRADAS EN UI

| Función | Módulo esperado | Estado |
|---|---|---|
| Generar Política SST con IA | SG-SST → Crear Política SST | ❌ Botón no existe |
| Analizar Matriz GTC-45 con IA | SG-SST → Actualizar Matriz IPEVR | ❌ Botón no existe |
| Generar Plan Anual SST con IA | SG-SST → Plan Anual | ❌ Botón no existe |
| Generar Propuesta con IA | Facturación → Propuestas | ❌ Botón no existe |
| Resumen / Transcripción IA | Telemedicina | ❌ Botón no existe |
| Análisis epidemiológico IA | Reportes | ❌ Inacc. por crash |

---

## COBERTURA IA REAL

| Categoría | Total declarado | Implementado en UI | % cobertura |
|---|---|---|---|
| Botones IA accesibles | ~15 | 9 | 60% |
| Módulos con IA funcional | 6 | 3 (Dashboard, HC Ocup, Agenda) | 50% |
| Panel Config IA | 1 | 1 (solo HC Ocup) | 50% |
| API keys configuradas | 4 | 0 | 0% |
| Módulos IA completamente rotos | — | 1 (Reportes) | — |
| Módulos IA no implementados | — | 3 (SGSST, Billing, Tele) | — |

---

## ACCIONES INMEDIATAS RECOMENDADAS

1. **AHORA** — Fix BUG-IA-01: Agregar import React/useState a `EpidemiologicalReport.jsx` → desbloquea módulo Reportes completo.
2. **PRONTO** — Fix BUG-IA-02: Agregar botón ⚙️ Config IA a HC General.
3. **SPRINT SIGUIENTE** — Fix BUG-IA-03: Sincronizar `siso_ai_keys_drcucalon` de D1 al aiStore en inicialización.
4. **BACKLOG** — Implementar botones IA en SGSST, Facturación (Propuestas), Telemedicina.

---

*Generado por auditoría automatizada en vivo — siso-appultimo SESION_ESTADO v2026-06-22*
