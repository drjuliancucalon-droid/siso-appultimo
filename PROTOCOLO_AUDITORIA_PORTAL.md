# 🔬 PROTOCOLO — Auditoría de Portal, Firma e Impresión
## Fecha: 4 de julio de 2026 · 10:45 AM
## Commit actual: `5bbdd2f`

---

## 🔴 PROBLEMA 1: Certificados NO aparecen en Portal Empresa (aparece "PARTICULAR")

### Caso de prueba: ANDRES MAURICIO RUALES ZUÑIGA 1061819348

- **Empresa asignada**: ERMITA
- **Al buscar en Portal Empresa**: No aparece ningún certificado. El portal muestra "PARTICULAR"
- **Causa raíz detectada**: `handleCloseHC` publica a `siso_portal_empresa_atenciones_{nitClean}` (Clave 4) SOLO si `nitClean && nitClean.length >= 3`. Si la empresa ERMITA no tiene NIT en la base de datos de empresas (`companies`), o el NIT es corto (<3 caracteres), NO se publica en el portal por empresa.
- **Causa secundaria**: `portalData.empresaNombre` se toma de `data.empresaNombre`. Si el paciente fue guardado con `empresaNombre: ''` o `null`, en el portal aparecerá "PARTICULAR" como fallback.

### Evidencia en el código

```js
// HistoriaPage.jsx L401 - handleCloseHC
const company = companies.find((c) => c.id === data.empresaId || c.nit === data.empresaNit);
```

```js
// L442-451 - Claves 4-6 solo si NIT >= 3
if (nitClean && nitClean.length >= 3) {
  // CLAVE 4: empresa_atenciones
  try { await d1WriteArrayMerge(`siso_portal_empresa_atenciones_${nitClean}`, [atencion], ...) } catch {}
  // CLAVE 5: empresa
  try { await d1WriteArrayMerge(`siso_portal_empresa_${nitClean}`, [empresaReg], 'id'); } catch {}
  // CLAVE 6: empresa_docs
  try { await d1WriteArrayMerge(`siso_portal_empresa_docs_${nitClean}`, [periodoDoc], 'periodo'); } catch {}
}
```

### Problema: Si la empresa NO tiene NIT o tiene NIT corto → NO se publica en el portal.

### Plan de corrección
| # | Cambio | Archivo | Descripción |
|---|--------|---------|-------------|
| 1a | Agregar fallback `empresaId` | `HistoriaPage.jsx` | Usar `empresaId` como key alternativa cuando NIT es corto/inexistente |
| 1b | Validar empresa al cerrar | `HistoriaPage.jsx` | Si `empresaNombre` está vacío, usar el nombre de la empresa desde `companies[]` |
| 1c | Publicar SIEMPRE en portal | `HistoriaPage.jsx` | Aunque no haya NIT, publicar con `empresaId` como identificador |

---

## 🔴 PROBLEMA 2: Firma del profesional NO aparece

### 2a — En el Portal de Certificados (PortalEmpresaPage)

El `generarCertHTML` llama a `_generarCertificadoHTMLNormalizado(mappedData, doctorData, firma, null, qrDataUrl)`.

- `firma` se toma de `res._firma || empresaAtenciones?._firma || ''`
- **Causa**: `empresaAtenciones._firma` viene de la CLAVE 4 (`siso_portal_empresa_atenciones_{nit}`). En `handleCloseHC`, esta clave se guarda con `_firma: data._firmaDigital || null`. Pero `data._firmaDigital` NO se está asignando en ningún momento del flujo de cierre. El campo real que contiene la firma es `activeSignature` (data URL base64 de la firma del médico).

**Corrección**: En `handleCloseHC`, agregar `_firma: activeSignature` en el `portalData`.

### 2b — En la impresión de HC Ocupacional

El `generateHCPrintHTML` en `printService.js` NO incluye la firma gráfica (imagen base64). Solo incluye texto del nombre del médico y licencia.

- **Monolito**: `buildPrintHeader` incluye `<img src="${activeSignature}" ...>` en el bloque de firma.
- **Refactorizado**: El header 3-columnas (recién agregado) no incluye la imagen de firma.

**Corrección**: Agregar `<img>` con la firma en el bloque de signature de `generateHCPrintHTML`.

### 2c — En "Descargar Docs" (handleEnviar)

Cuando se imprime el paquete de documentos, la firma NO aparece porque `openPrintWindow` recibe HTML que no incluye imagen de firma.

**Corrección**: Incluir `activeSignature` como `<img>` en el HTML combinado del paquete de documentos.

---

## 🔴 PROBLEMA 3: Impresión de HC faltan secciones completas

### Comparativa Monolito vs Refactorizado

| Sección | Monolito | Refactorizado (`generateHCPrintHTML`) |
|---------|----------|--------------------------------------|
| Header 3 columnas | ✅ Con firma + datos completos | ✅ Agregado en `5bbdd2f` pero SIN firma |
| Identificación | ✅ | ✅ |
| Información Laboral | ✅ | ✅ |
| Perfil del Cargo | ✅ | ✅ |
| Factores de Riesgo | ✅ | ✅ |
| Antecedentes Ocupacionales | ✅ | ✅ |
| Antecedentes Personales | ✅ | ✅ |
| Estilos de Vida | ✅ | ✅ |
| **Motivo de Consulta** | ✅ "Motivo de Consulta / Anamnesis" | ❌ NO aparece |
| Signos Vitales | ✅ | ✅ |
| **Examen Físico Segmentario** | ✅ (cabeza, cuello, tórax, abdomen, extremidades, neurológico) | ❌ NO aparece — solo `examenFisicoSistemas` |
| Examen Físico por Sistemas | ✅ | ✅ |
| Maniobras Osteomusculares | ✅ | ✅ |
| **Revisión por Sistemas** | ✅ | ✅ |
| Resultados Paraclínicos | ✅ | ✅ |
| **Análisis Clínico (analisisIA)** | ✅ | ✅ |
| Diagnósticos | ✅ | ✅ |
| Concepto de Aptitud | ✅ | ✅ |
| Restricciones | ✅ | ✅ |
| Recomendaciones | ✅ | ✅ |
| Programas SVE | ✅ | ✅ |
| **Firma del médico (imagen)** | ✅ | ❌ Solo texto |
| **Firma del paciente** | ✅ | ✅ |
| **Código QR de verificación** | ❌ No en HC | ❌ No en HC (solo en certificado) |

### Items faltantes en la impresión HC:
1. **Motivo de Consulta / Anamnesis** (campo `data.motivoConsulta`)
2. **Examen Físico Segmentario** (campo `data.examenSegmentario` con subcampos: cabeza, cuello, torax, abdomen, extremidades, neurologico)
3. **Firma gráfica del médico** (`activeSignature` como `<img>`)
4. **Diagnóstico Principal + Secundarios** (actualmente usa `data.diagnostico1` en lugar de `data.diagnosticoPrincipal`)

---

## 🔴 PROBLEMA 4: Custodia e Informe Sociodemográfico NO se publican

### Al cerrar HC:
- **Custodia**: NO se genera automáticamente. El monolito genera la carta de custodia al cerrar la HC. El refactorizado requiere que el usuario vaya manualmente a `AnalisisDocsTab` → "Generar Carta Custodia".
- **Informe Sociodemográfico**: NO se publica en `siso_portal_empresa_docs_{nit}`. Solo se guarda en localStorage.

### Plan de corrección:
| # | Cambio | Archivo |
|---|--------|---------|
| 4a | Auto-generar custodia al cerrar HC si hay empresa | `HistoriaPage.jsx` |
| 4b | Auto-publicar informe sociodemográfico en D1 | `HistoriaPage.jsx` o `EpidemiologicalReport.jsx` |

---

## 📐 PLAN COMPLETO DE IMPLEMENTACIÓN

| # | Problema | Archivo(s) | Cambio | Prioridad |
|---|----------|-----------|--------|-----------|
| 1 | Portal vacío / PARTICULAR | `HistoriaPage.jsx` | Usar empresaId como fallback + validar empresaNombre + publicar siempre | 🔴 ALTA |
| 2a | Firma no en portal | `HistoriaPage.jsx` | Agregar `_firma: activeSignature` en portalData | 🔴 ALTA |
| 2b | Firma no en impresión HC | `printService.js` | Agregar `<img src="${firma}">` en signature block + `HistoriaPage.jsx` pasar firma | 🔴 ALTA |
| 2c | Firma no en Descargar Docs | `HistoriaPage.jsx` | Incluir activeSignature en HTML del paquete | 🟡 MEDIA |
| 3a | Faltan secciones impresión | `printService.js` | Agregar Motivo de Consulta + Examen Segmentario + Diagnóstico Principal | 🔴 ALTA |
| 3b | Diagnósticos mal mapeados | `printService.js` | Usar `diagnosticoPrincipal` en lugar de `diagnostico1` | 🟡 MEDIA |
| 4 | Custodia + Informe no público | `HistoriaPage.jsx` | Auto-publicar al cerrar HC | 🟡 MEDIA |

---

## 📊 ESTADO ACTUAL

| Indicador | Valor |
|-----------|-------|
| HC cerradas que publican en portal | Solo si NIT >= 3 |
| Empresas sin NIT visible en portal | Aparecen como "PARTICULAR" |
| Firma del médico en portal | ❌ Ausente |
| Firma del médico en impresión | ❌ Ausente |
| Impresión HC completa | 17/21 secciones (81%) |
| Custodia auto-generada al cerrar | ❌ No |
| Informe sociodemográfico público | ❌ No |

---

*Documento creado para tracking. Se actualizará a medida que se implementen los cambios.*
*Última actualización: 4 de julio de 2026 · 10:45 AM*