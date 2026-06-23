# PROTOCOLO GAP — MÓDULO REPORTES
## Monolito vs Refactorizado · Análisis Forense Completo
**Fecha:** 2026-06-23 | **Auditor:** Claude (Cowork) | **Repo:** siso-appultimo

---

## 1. RESUMEN EJECUTIVO

El módulo de reportes del refactorizado (`EpidemiologicalReport.jsx`) tiene **4 bugs de campo críticos** que causan que el filtro de empresa, los nombres, los hallazgos y los riesgos siempre muestren 0 o vacío. Adicionalmente le faltan **6 funcionalidades completas** que el monolito sí tiene.

**Impacto actual:** Con FISIOSALUD DEL CAUCA IPS SAS (21 pacientes), el refactorizado muestra 0 pacientes en el filtro. Con AMEZQUITA (6 pacientes), los KPIs de hallazgos y riesgos muestran 0. Las columnas Paciente y Empresa en la tabla Resumen están vacías.

---

## 2. MAPA DE CAMPOS — DATO REAL vs CÓDIGO ACTUAL

La causa raíz de todos los bugs de datos es que el refactorizado usa **nombres de campo que no existen** en el modelo de datos de `initialOccupPatientState`. Tabla de corrección:

| Qué representa | Campo REAL en D1 / initialStates.js | Código ERRÓNEO actual | Fix |
|---|---|---|---|
| Nombre del paciente | `p.nombres` | `p.nombreCompleto` | → `p.nombres` |
| Nombre de la empresa | `p.empresaNombre` | `p.empresa` | → `p.empresaNombre` |
| NIT empresa | `p.empresaNit` | (no usado) | — |
| ID empresa | `p.empresaId` | (no usado) | — |
| Riesgos laborales | `p.riesgos` (objeto: `{fisicos, quimicos, biologicos, mecanicos, biomecanicos, psicosocial, seguridad, locativos}`) | `p.riesgosLaborales` (array inexistente) | → `Object.values(p.riesgos||{}).some(Boolean)` |
| Hallazgos físicos | `p.examenFisicoSistemas[sys].estado !== 'Normal'` OR `p.examenFisicoSistemas[sys].hallazgo !== ''` | `p.hallazgos` (campo inexistente) | → ver BUG-R3 |
| Tensión arterial | `p.ta` (string: "120/80") | No incluido | Agregar |
| IMC | `p.imc` (string: "24.5") | Usa `p.imc` ✅ | OK |
| Peso / Talla | `p.peso`, `p.talla` | No incluidos | Agregar |
| Antecedentes patológicos | `p.antecedentesAgrupados.patologicos.det` | No incluido | Agregar |
| Hábitos | `p.habitos` (objeto: `{fuma, alcohol, psicoactivas, deporte, detalle}`) | No incluido | Agregar |
| Días incapacidad | `p.incapacidad.dias` ✅ (objeto: `{aplica, dias, origen, tipo}`) | Correcto | OK |
| Diagnóstico principal | `p.diagnosticoPrincipal` ✅ | Correcto | OK |
| Concepto aptitud | `p.conceptoAptitud` ✅ | Correcto pero `.includes('APTO')` case-sensitive | Normalizar con `.toUpperCase()` |
| Médico | `p.medicoId` o `p.medicoUser` | Correcto ✅ | OK |
| Restricciones | `p.analisisRestricciones` | No incluido | Agregar a Sección 4 |

---

## 3. BUGS CRÍTICOS — FIX QUIRÚRGICO

### BUG-R1: Filtro de empresa devuelve 0 pacientes
**Archivo:** `src/modules/reports/components/EpidemiologicalReport.jsx`
**Líneas afectadas:** 81, 105, 327, 392

**Causa:** El código busca `p.empresa` pero el campo real es `p.empresaNombre`.

```jsx
// ❌ ACTUAL (líneas 81, 105, 327, 392)
p.empresa?.toLowerCase()...
[...new Set(patients.map(p => p.empresa).filter(Boolean))]

// ✅ FIX — reemplazar TODO p.empresa → p.empresaNombre
p.empresaNombre?.toLowerCase()...
[...new Set(patients.map(p => p.empresaNombre).filter(Boolean))]
```

También actualizar las líneas de exportación (274, 275, 288, 289, 125, 127, 515):
```jsx
// ❌ ACTUAL
p.empresa || '—'
// ✅ FIX
p.empresaNombre || '—'
```

---

### BUG-R2: Columnas PACIENTE y EMPRESA vacías en tabla Resumen
**Líneas afectadas:** 125, 274, 288, 514, 515

**Causa:** El campo se llama `nombres`, no `nombreCompleto`.

```jsx
// ❌ ACTUAL (línea 514)
<td>{p.nombreCompleto}</td>
// ✅ FIX
<td>{p.nombres || '—'}</td>
```

Mismo fix en exportaciones CSV/Excel/ZIP:
```jsx
// ❌ ACTUAL (líneas 125, 274, 288)
p.nombreCompleto || '—'
// ✅ FIX
p.nombres || '—'
```

---

### BUG-R3: Con Hallazgos = 0 y Con Riesgos = 0 siempre
**Líneas afectadas:** 171, 172

**Causa:** `p.hallazgos` y `p.riesgosLaborales` no existen en el modelo.

```jsx
// ❌ ACTUAL (línea 171-172)
const conHallazgos = filteredData.filter(p =>
  p.hallazgos && Object.keys(p.hallazgos).some(k => p.hallazgos[k])
).length;
const conRiesgos = filteredData.filter(p =>
  Array.isArray(p.riesgosLaborales) && p.riesgosLaborales.length > 0
).length;

// ✅ FIX — usar campos reales
const conHallazgos = filteredData.filter(p => {
  const efs = p.examenFisicoSistemas || {};
  return Object.values(efs).some(s => s.estado !== 'Normal' || (s.hallazgo && s.hallazgo.trim() !== ''));
}).length;

const conRiesgos = filteredData.filter(p =>
  p.riesgos && Object.values(p.riesgos).some(Boolean)
).length;
```

**También en Ausentismo (línea 205):**
```jsx
// ❌ ACTUAL
casos.push({ paciente: p.nombreCompleto, empresa: p.empresa, ... });
// ✅ FIX
casos.push({ paciente: p.nombres, empresa: p.empresaNombre, ... });
```

---

### BUG-R4: KPI APTOS/CON RESTRICCIONES/NO APTOS = 0 (case mismatch)
**Líneas afectadas:** 168-170

El monolito guarda conceptos como `"Apto"`, `"Con Restricciones"`, `"No Apto"`. El código del refactorizado busca `"APTO"`, `"RESTRICCIONES"` en mayúsculas.

```jsx
// ❌ ACTUAL
p.conceptoAptitud?.includes('APTO') && !p.conceptoAptitud.includes('RESTRICCIONES')
// ✅ FIX
const ca = (p.conceptoAptitud || '').toUpperCase();
// aptos:
ca.includes('APTO') && !ca.includes('RESTRICCI')
// conRestricciones:
ca.includes('RESTRICCI')
// noAptos:
ca.includes('NO APTO') || ca.includes('NO APT')
```

---

## 4. FUNCIONALIDADES FALTANTES

### NUEVA-R1: Secciones faltantes en tab DIAGNÓSTICO

El monolito muestra en "Perfil Clínico y de Salud" campos que el refactorizado omite:

**a) TENSIÓN ARTERIAL** — campo `p.ta` (string "120/80")
```jsx
// Agrupar en categorías:
// Normal: ta == "120/80" ≈ sistólica <= 129 y diastólica <= 84
// Pre-HTA: 130-139 / 85-89
// HTA I: 140-159 / 90-99
// N/R: ta vacío o no parseable
```

**b) ANTECEDENTES PATOLÓGICOS** — campo `p.antecedentesAgrupados`
```js
// Estructura: { patologicos: {val, det}, quirurgicos: {val, det},
//               traumaticos: {val, det}, farmacologicos: {val, det}, alergicos: {val, det} }
// Mostrar: conteo de cuántos tienen cada tipo activo (val === true)
```

**c) ESTILOS DE VIDA Y HÁBITOS** — campo `p.habitos`
```js
// Estructura: { fuma: "No"|"Sí", alcohol: "No"|"Sí", psicoactivas: "No"|"Sí",
//               deporte: "No"|"Sí", detalle: "" }
// Mostrar: % fumadores, % alcohol, % deporte
```

**d) REVISIÓN POR SISTEMAS ALTERADOS** — campo `p.examenFisicoSistemas`
```js
// Mostrar: lista de sistemas con estado !== 'Normal' y su hallazgo
// Ejemplo: cardiovascular (HTA estadio I), columna (escoliosis leve)
```

**Implementación:** Agregar 4 sub-secciones dentro del tab `diagnóstico`, después de la sección IMC existente, antes del botón "Generar Análisis IA".

---

### NUEVA-R2: Sección 4 — MATRIZ LEGAL INDIVIDUAL POR TRABAJADOR

El monolito muestra una tabla al final del tab diagnóstico con una fila por trabajador:

| # | Trabajador | CC | Edad | Riesgos Ocupacionales | Diagnóstico CIE-10 | Restricciones | Normativa |
|---|---|---|---|---|---|---|---|
| 1 | JUAN PEREZ | 1234567 | 35 | Biomecánico, Psicosocial | Z10.0, M54.5 | Evitar levantamiento > 10kg | Res 1843/2025 Art. 17 |

**Campos fuente:**
- Trabajador: `p.nombres`
- CC: `p.docNumero`
- Edad: `p.edad`
- Riesgos: `Object.entries(p.riesgos||{}).filter(([,v])=>v).map(([k])=>LABELS_RIESGOS[k]).join(', ')`
- Diagnóstico: `p.diagnosticoPrincipal + ', ' + p.diagnosticoSecundario1`
- Restricciones: `p.analisisRestricciones`
- Normativa: auto-generada según riesgos y concepto

**Implementación:** Agregar como Sección 4 dentro del tab `diagnóstico`, después del botón "Generar Análisis IA".

---

### NUEVA-R3: Tab "Certificados por empresa" (tab completo faltante)

El monolito tiene un segundo tab completo con:
- Header: `"Certificados de Aptitud - {empresa} · {n} trabajadores"`
- Botones fila 1: `Seleccionar todos` | `Imprimir ({n})` | `Descargar Seleccionados ({n})` | `Todos en PDF ({total})`
- Botones fila 2: `Email Empresa` | `Individual ({n}/{total})` | `WhatsApp ({n})`
- Lista por trabajador: checkbox, índice, nombre, CC·cargo·tipo, concepto aptitud (badge color), fecha, `Ver / PDF`

**Datos fuente:**
- Lista: `filteredData` ya filtrado por empresa
- Para generar PDF individual: navegar a `/certificado?id={p.id}` o abrir `CertificadoPage`
- Email empresa: `companies.find(c => c.nombre === filterEmpresa)?.email`
- WhatsApp: `wa.me/?text=...` con resumen de aptitudes

**Implementación:** Agregar tab `{ id: 'certificados', label: 'Certificados', icon: FileText }` en el array `REPORT_TYPES`, con componente propio o sección dentro de EpidemiologicalReport.

---

### NUEVA-R4: Indicador "✅ Emitido"

El monolito muestra junto a los botones de acción:
```
✅ Emitido el 2026-06-22 · 4 docs
```

**Datos fuente:** El monolito lee un campo `emitidoInfo` desde localStorage: `siso_emitido_${empresaId}` con `{ fecha, count }`.

**Implementación en refactorizado:**
```js
// Al hacer "Enviar TODO a Empresa":
const emitidoKey = `siso_emitido_${filteredData[0]?.empresaId || filterEmpresa}`;
localStorage.setItem(emitidoKey, JSON.stringify({ fecha: new Date().toISOString(), count: filteredData.length }));

// Al cargar (useEffect sobre filterEmpresa):
const emitidoKey = `siso_emitido_${filteredData[0]?.empresaId || filterEmpresa}`;
const saved = localStorage.getItem(emitidoKey);
setEmitidoInfo(saved ? JSON.parse(saved) : null);
```

El badge ya tiene su `emitidoInfo` state y render — solo falta escribir/leer la clave correcta.

---

### NUEVA-R5: Exportar PDF Tabla

El monolito tiene botón "Exportar PDF Tabla" que genera un PDF con la tabla de pacientes (nombre, empresa, diagnóstico, concepto).

**Implementación:**
```js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const handleExportPDFTabla = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Paciente', 'Empresa', 'Tipo', 'Diagnóstico', 'Concepto']],
    body: filteredData.map(p => [
      p.nombres, p.empresaNombre, p.tipoExamen,
      p.diagnosticoPrincipal, p.conceptoAptitud
    ])
  });
  doc.save(`reporte_${filterEmpresa || 'todos'}.pdf`);
};
```

Requiere: `npm install jspdf jspdf-autotable`

---

## 5. PLAN DE IMPLEMENTACIÓN — ORDEN PRIORITARIO

### FASE A: Bugs de campo (1-2h) — IMPLEMENTAR PRIMERO
Afecta todo el módulo. Sin este fix, ninguna otra feature funciona correctamente.

| ID | Fix | Líneas | Impacto |
|---|---|---|---|
| FIX-R1 | `p.empresa` → `p.empresaNombre` en todo el archivo | 15 ocurrencias | Filtro, dropdown, ZIP, CSV, Excel |
| FIX-R2 | `p.nombreCompleto` → `p.nombres` en todo el archivo | 8 ocurrencias | Tabla, ZIP, CSV, Excel |
| FIX-R3 | Hallazgos: leer `examenFisicoSistemas[sys].estado` | líneas 171 | KPI Con Hallazgos |
| FIX-R4 | Riesgos: leer `p.riesgos` objeto | línea 172 | KPI Con Riesgos |
| FIX-R5 | Concepto aptitud case-insensitive | líneas 168-170, 259-261 | KPIs Aptos/Restricc/No Apto |
| FIX-R6 | Ausentismo paciente/empresa | línea 205 | Tab Ausentismo |

### FASE B: Secciones de Diagnóstico faltantes (2-3h)
| ID | Feature | Campos | Donde agregar |
|---|---|---|---|
| NUEVA-R1a | Tensión Arterial | `p.ta` | Tab diagnóstico, sección 2 |
| NUEVA-R1b | Antecedentes Patológicos | `p.antecedentesAgrupados` | Tab diagnóstico, sección 2 |
| NUEVA-R1c | Hábitos | `p.habitos` | Tab diagnóstico, sección 2 |
| NUEVA-R1d | Revisión Sistemas Alterados | `p.examenFisicoSistemas` | Tab diagnóstico, sección 2 |

### FASE C: Sección 4 Matriz Legal Individual (1-2h)
| ID | Feature | Campos | Donde agregar |
|---|---|---|---|
| NUEVA-R2 | Tabla por trabajador con riesgos, Dx, restricciones, normativa | `p.nombres, p.riesgos, p.diagnosticoPrincipal, p.analisisRestricciones` | Tab diagnóstico, al final |

### FASE D: Tab Certificados por empresa (3-4h)
| ID | Feature | Detalle |
|---|---|---|
| NUEVA-R3 | Tab completo | Lista workers + checkboxes + botones acción |
| NUEVA-R4 | Indicador Emitido | Leer/escribir `siso_emitido_{empresaId}` |
| NUEVA-R5 | PDF tabla | jsPDF + autoTable |

---

## 6. CHECKLIST DE REPLACE — FASE A (implementación inmediata)

En `src/modules/reports/components/EpidemiologicalReport.jsx`, realizar los siguientes reemplazos globales:

```
REPLACE ALL: p.empresa  → p.empresaNombre
             (excepto p.empresaId y p.empresaNit que son campos distintos)

REPLACE ALL: p.nombreCompleto  → p.nombres

REPLACE: Array.isArray(p.riesgosLaborales) && p.riesgosLaborales.length > 0
    WITH: p.riesgos && Object.values(p.riesgos).some(Boolean)

REPLACE: p.hallazgos && Object.keys(p.hallazgos).some(k => p.hallazgos[k])
    WITH: Object.values(p.examenFisicoSistemas||{}).some(s => s.estado !== 'Normal' || (s.hallazgo||'').trim())

REPLACE: p.conceptoAptitud?.includes('APTO') && !p.conceptoAptitud.includes('RESTRICCIONES')
    WITH: (p.conceptoAptitud||'').toUpperCase().includes('APTO') && !(p.conceptoAptitud||'').toUpperCase().includes('RESTRICCI')

REPLACE: p.conceptoAptitud?.includes('RESTRICCIONES')
    WITH: (p.conceptoAptitud||'').toUpperCase().includes('RESTRICCI')

REPLACE: p.conceptoAptitud?.includes('NO APTO')
    WITH: (p.conceptoAptitud||'').toUpperCase().includes('NO APT')
```

---

## 7. FUENTES DE DATOS — DONDE LEE CADA PLATAFORMA

### Monolito
- Pacientes: `localStorage['siso_patients_drcucalon']` (JSON array, cargado completo al inicio)
- Empresa en paciente: campo `empresa` (string nombre directo, ej: `"FISIOSALUD DEL CAUCA IPS SAS"`)
- Hallazgos: campo `hallazgos` (objeto legacy `{sistema: true/false}`)
- Riesgos: campo `riesgosLaborales` (array de strings, ej: `["Biomecánico", "Psicosocial"]`)

### Refactorizado (D1 vía Worker)
- Pacientes: `d1Get('siso_patients_${userId}')` → array
- Empresa en paciente: campo `empresaNombre` (campo `empresa` NO existe)
- Hallazgos: campo `examenFisicoSistemas[sys].estado` / `[sys].hallazgo`
- Riesgos: campo `riesgos` (objeto `{fisicos: bool, quimicos: bool, ...}`)

**Diferencia clave:** El monolito y el refactorizado guardan los mismos datos clínicos con **nombres de campo diferentes**. El módulo de reportes fue escrito asumiendo los nombres del monolito pero debe usar los del refactorizado.

---

## 8. ARCHIVOS A MODIFICAR

| Archivo | Fase | Tipo de cambio |
|---|---|---|
| `src/modules/reports/components/EpidemiologicalReport.jsx` | A, B, C, D | Bugs + nuevas secciones |
| `src/modules/reports/components/CertificadosEmpresaTab.jsx` | D | Nuevo archivo |
| `package.json` | D | Agregar jspdf + jspdf-autotable |

---

*Protocolo generado antes de cualquier implementación · Confirmar con usuario antes de continuar*
