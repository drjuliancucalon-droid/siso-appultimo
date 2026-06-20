# PROTOCOLO: Tabs de acción dentro de HC Ocupacional y HC General
## Fecha: 2026-04-15 15:19
## Referencia: Screenshots de ocupasalud proporcionados por Julian

---

## SITUACIÓN ACTUAL

### Lo que tiene ocupasalud (monolito):
Dentro de cada HC hay una **barra de tabs/botones de acción** con:

| Tab/Botón | Función | Imprime |
|-----------|---------|---------|
| 🖨️ **Imprimir HC** | Imprime toda la HC limpia con todas las secciones | ✅ |
| 📋 **Certificado** | Genera/muestra certificado de aptitud del paciente | ✅ |
| 💊 **Fórmula** | Prescripción médica con autocompletado de medicamentos | ✅ |
| 🔀 **Derivación** | Interconsulta/derivación a especialista | ✅ |
| 🔬 **Exámenes** | Solicitud de exámenes paraclínicos (CUPS) | ✅ |
| 📎 **Adjuntos** | Upload de paraclínicos (PDF, imágenes) | — |
| 🏥 **Incapacidad** | Certificado de incapacidad con días, origen, Dx | ✅ |
| ✨ **IA** | Análisis inteligente, sugerencia Dx, restricciones | — |
| 📊 **RIPS** | Exportar RIPS (Res. 2275/2023) JSON | — |
| 📄 **FHIR** | Exportar FHIR R4 Bundle (Res. 1888/2025) | — |
| 📑 **RDA** | Resumen Digital de Atención | — |
| 🔒 **Cerrar HC** | Cierra la HC, genera código verificación, firma digital | — |
| 📝 **Evolución** | Nota de evolución clínica para seguimiento | ✅ |
| 🪪 **Carnet** | Carnet del trabajador (formato tarjeta) | ✅ |

### Lo que tiene siso-appultimo ACTUALMENTE:
- ✅ Formulario de HC Ocupacional renderiza (79 KB) con TODOS los campos
- ✅ Guardar HC a Supabase (botón flotante)
- ✅ Imprimir HC (botón flotante — versión básica)
- ✅ Análisis IA (botón dentro del formulario)
- ❌ **SIN barra de tabs de acción** (Fórmula, Derivación, Exámenes, etc.)
- ❌ **SIN tabs internos** que cambien el contenido

### Componentes que YA EXISTEN pero NO están conectados:
| Componente | Tamaño | Estado |
|-----------|--------|--------|
| `TabFormulaDerivacion.jsx` | 45.8 KB | ✅ Existe — completo con medicamentos |
| `PrescriptionTab.jsx` | 12.5 KB | ✅ Existe |
| `CertificateView.jsx` | 24 KB | ✅ Existe — ya conectado en /patients/:id/certificado |
| `AttachmentsTab.jsx` | 7.8 KB | ✅ Existe — creado en Sprint 2 |
| `ExamRequestTab.jsx` | 8.9 KB | ✅ Existe — creado en Sprint 2 |
| `DisabilityTab.jsx` | 10.9 KB | ✅ Existe — creado en Sprint 2 |
| `ConsentModal.jsx` | 7.1 KB | ✅ Existe |
| `RecommendationsPanel.jsx` | 5.3 KB | ✅ Existe |
| `RestrictionsPanel.jsx` | 6.2 KB | ✅ Existe |
| `EvolucionModal.jsx` | 9 KB | ✅ Existe |

---

## QUÉ FALTA HACER

### 1. Crear barra de tabs de acción en HistoriaPage.jsx
- Barra horizontal debajo del header de la HC
- Tabs: Formulario | Certificado | Fórmula | Derivación | Exámenes | Adjuntos | Incapacidad | Evolución
- Click en cada tab muestra el componente correspondiente debajo del formulario principal
- El formulario principal (OccupationalHC) se mantiene visible o se oculta según el tab

### 2. Conectar cada tab a su componente existente
| Tab | Componente a usar | Acción |
|-----|-------------------|--------|
| Formulario | OccupationalHC (actual) | Ya conectado |
| Certificado | CertificateView.jsx | Importar + pasar data del paciente |
| Fórmula/Derivación | TabFormulaDerivacion.jsx (45.8KB) | Importar + pasar data |
| Exámenes | ExamRequestTab.jsx | Ya creado, importar |
| Adjuntos | AttachmentsTab.jsx | Ya creado, importar |
| Incapacidad | DisabilityTab.jsx | Ya creado, importar |
| Evolución | EvolucionModal.jsx | Importar como panel |

### 3. Agregar botones de acción en la barra
| Botón | Acción |
|-------|--------|
| 🖨️ Imprimir HC | printHC() — ya existe |
| 📊 RIPS | generateRIPSBatch() — existe en ripsService.js |
| 📄 FHIR | generateFHIRBundle() — existe en fhirService.js |
| 📑 RDA | _generarRDA() — existe en normativa.js |
| 🔒 Cerrar HC | Cambiar estadoHistoria → 'Cerrada', generar código verificación |
| 🪪 Carnet | printCarnet() — existe en printService.js |

### 4. Lo mismo para HC General
- Misma barra de tabs pero con tabs relevantes para HC general
- Tabs: Formulario | Fórmula | Exámenes | Adjuntos | Incapacidad | Evolución

---

## PLAN DE EJECUCIÓN

### Paso 1: Crear barra de tabs en HistoriaPage.jsx
- Array de tabs con: id, label, icono, componente
- Estado: `activeHCTab` que controla qué se muestra
- Tab "Formulario" es el default (muestra OccupationalHC)
- Los demás tabs muestran su componente debajo

### Paso 2: Importar y conectar cada componente
- Lazy load de cada tab (code splitting)
- Pasar `data` del paciente actual a cada componente
- Pasar `doctorData` para firmas
- Pasar callbacks de guardar/imprimir

### Paso 3: Botones de acción (RIPS, FHIR, RDA, Cerrar, Carnet)
- Barra de botones de acción rápida
- Cada botón llama a su servicio existente
- Cerrar HC: genera código verificación + cambia estado

### Paso 4: Replicar para HC General
- Misma estructura pero con tabs relevantes

### Reglas:
- NO modificar OccupationalHC.jsx (79 KB) — funciona y no se toca
- NO modificar ningún componente de tab existente
- Solo modificar HistoriaPage.jsx y HistoriaGeneralPage.jsx
- Build con 0 errores después de cada paso

---

## ESTIMACIÓN
- Paso 1-2: 1 sesión (conectar tabs)
- Paso 3: 30 min (botones de acción)
- Paso 4: 30 min (replicar para HC General)
- Total: ~2 horas

