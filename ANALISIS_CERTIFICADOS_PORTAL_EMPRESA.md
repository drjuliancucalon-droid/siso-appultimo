# 🔍 ANÁLISIS EXHAUSTIVO: Módulo de Certificados y Portal Empresa

## 📋 RESUMEN EJECUTIVO

Se realizó un análisis completo del sistema SISO-OcupaSalud para verificar el funcionamiento del **Portal de Certificados** y el **acceso por NIT de empresa**. Se encontraron **8 errores críticos** y **5 funcionalidades faltantes** que impiden el correcto funcionamiento del sistema según los requisitos.

---

## ✅ FUNCIONALIDADES EXISTENTES (Que funcionan correctamente)

### 1. Generación de Certificados
- **Archivo**: `src/utils/normativa.jsx` → `_generarCertificadoHTMLNormalizado()`
- Genera certificados HTML idénticos a los de la plataforma
- Incluye todos los datos del paciente, concepto de aptitud, firma digital
- Cumple con Resolución 1843/2025

### 2. Visualización de Certificados Individuales
- **Archivo**: `src/pages/CertificadoPage.jsx`
- Muestra certificado completo del paciente
- Permite imprimir/descargar PDF

### 3. Verificación Pública por Código/Cédula
- **Archivo**: `src/pages/VerificacionPage.jsx`
- Búsqueda por código QR o número de cédula
- Muestra datos del trabajador y concepto de aptitud
- Permite imprimir carné digital

### 4. Búsqueda por NIT de Empresa (Básica)
- **Archivo**: `src/pages/VerificacionPage.jsx` → `buscarPorNIT()`
- Muestra lista de trabajadores de la empresa
- Muestra concepto de aptitud por trabajador
- Permite ver detalle individual

### 5. Reportes Estadísticos por Empresa
- **Archivo**: `src/sections/ReporteSection.jsx`
- Estadísticas completas (sociodemográficas, clínicas)
- Análisis de riesgos, estilos de vida
- Matriz legal de condiciones de salud
- Análisis IA (generación de informes)

### 6. Generación de Cuentas de Cobro
- **Archivo**: `src/modules/billing/components/BillGenerator.jsx`
- Filtra por empresa y período
- Selección de trabajadores/atenciones
- Cálculo automático de totales
- Guardado en backend (`siso_saved_bills_${userId}`)

### 7. Generación de Cartas de Custodia
- **Archivo**: `src/pages/CartaCustodiaPage.jsx`
- Formulario completo con datos de empresa
- Guardado en Supabase (`siso_cartas_custodia`)
- Impresión PDF y envío por email

### 8. Backend Básico
- **Archivo**: `backend/src/routes/data.js` y `write.js`
- CRUD para pacientes, empresas, citas, facturas
- Autenticación y autorización
- Audit logging

---

## ❌ ERRORES CRÍTICOS IDENTIFICADOS

### ERROR #1: Portal Empresa por NIT NO muestra todos los documentos
**Severidad**: 🔴 CRÍTICA
**Archivo**: `src/pages/VerificacionPage.jsx`

**Problema**: Cuando se ingresa por NIT de empresa, solo se muestra:
- Lista básica de trabajadores
- Concepto de aptitud por trabajador

**Falta mostrar**:
- ❌ Certificados completos de todos los trabajadores (solo se ve uno a la vez)
- ❌ Informes generados para la empresa
- ❌ Cuentas de cobro (facturas) de la empresa
- ❌ Cartas de custodia enviadas a la empresa
- ❌ Descarga masiva de certificados como archivos (no solo imprimir)

**Código problemático**:
```jsx
// Solo muestra tabla básica, sin acceso a documentos completos
{empresaWorkers.map((w, i) => (
  <tr key={i}>
    <td>{w.nombres}</td>
    <td>{w.conceptoAptitud}</td>
    // ... NO hay enlaces a certificados, informes, facturas
  </tr>
))}
```

---

### ERROR #2: No existe ruta backend para guardar informes por empresa
**Severidad**: 🔴 CRÍTICA
**Archivo**: `backend/src/routes/write.js`

**Problema**: Los informes se generan en el frontend pero **NO se guardan** en el backend con referencia a la empresa.

**Falta**:
- ❌ Endpoint `POST /reports/save` para guardar informes generados
- ❌ Estructura de datos para almacenar informes por empresa y período
- ❌ Referencias cruzadas entre informes y empresas

**Consecuencia**: Los informes generados se pierden cuando se cierra la sesión o se cambia de página. No se pueden recuperar posteriormente.

---

### ERROR #3: No existe ruta backend para obtener informes por empresa
**Severidad**: 🔴 CRÍTICA
**Archivo**: `backend/src/routes/data.js`

**Problema**: No hay endpoint para recuperar informes guardados de una empresa específica.

**Falta**:
- ❌ Endpoint `GET /reports?companyId=XXX` 
- ❌ Endpoint `GET /reports/by-nit/:nit`
- ❌ Búsqueda de informes por período

---

### ERROR #4: No existe ruta backend para obtener cuentas de cobro por empresa/NIT
**Severidad**: 🟠 ALTA
**Archivo**: `backend/src/routes/data.js`

**Problema**: Las cuentas de cobro se guardan pero no se pueden consultar por empresa.

**Existe**:
```javascript
// Solo devuelve TODAS las facturas del usuario
router.get('/bills', async (req, res) => {
  const { data } = await getUserScopedData('siso_saved_bills', userId);
});
```

**Falta**:
- ❌ Filtrado por `empresaId` o NIT
- ❌ Endpoint `GET /bills/by-company/:companyId`
- ❌ Endpoint `GET /bills/by-nit/:nit`

---

### ERROR #5: No existe ruta backend para obtener cartas de custodia por empresa
**Severidad**: 🟠 ALTA
**Archivo**: `backend/src/routes/data.js` y `CartaCustodiaPage.jsx`

**Problema**: Las cartas se guardan en `siso_cartas_custodia` pero sin referencia a la empresa que permite consultarlas posteriormente.

**Código problemático en CartaCustodiaPage.jsx**:
```javascript
// Guarda la carta pero NO indexa por empresa/NIT
const nueva = {
  id: `cust_${Date.now()}`,
  empresaId: selectedCompanyId,  // ← Esto existe pero NO se usa para búsqueda
  // ...
};
await fetch(`${SB_URL}/rest/v1/siso_store`, {
  body: JSON.stringify({ key: 'siso_cartas_custodia', value: [...prev, nueva] })
});
```

**Falta**:
- ❌ Indexación por `empresaId` o NIT
- ❌ Endpoint `GET /custodia/by-company/:companyId`
- ❌ Endpoint `GET /custodia/by-nit/:nit`

---

### ERROR #6: No existe funcionalidad de descarga masiva de certificados como archivos
**Severidad**: 🟠 ALTA
**Archivo**: `src/sections/ReporteSection.jsx`

**Problema**: Solo permite "imprimir" múltiples certificados, pero NO descargarlos como archivos individuales o ZIP.

**Código actual** (solo imprime):
```javascript
const printSelectedCerts = () => {
  if (selectedList.length === 1) {
    // Abre ventana para imprimir
    w.document.write(html);
  } else {
    // Concatena HTML para imprimir múltiples
    w.document.write(certs);
  }
};
```

**Falta**:
- ❌ Generación de archivos PDF individuales
- ❌ Compresión ZIP con todos los certificados
- ❌ Descarga automática de archivos

---

### ERROR #7: No existe vista unificada de todos los documentos de una empresa
**Severidad**: 🟡 MEDIA
**Archivo**: No existe archivo dedicado

**Problema**: Los documentos están dispersos en diferentes módulos:
- Certificados: `CertificadoPage.jsx` (individual) y `ReporteSection.jsx` (múltiple)
- Informes: `ReporteSection.jsx` (generación, NO guardado)
- Facturas: `BillingPage.jsx` y `BillGenerator.jsx`
- Cartas: `CartaCustodiaPage.jsx`

**Falta**:
- ❌ Vista unificada "Portal Empresa" que muestre:
  - Todos los certificados por período
  - Todos los informes generados
  - Todas las cuentas de cobro
  - Todas las cartas de custodia
  - Filtros por fecha, período, tipo de documento

---

### ERROR #8: Las cuentas de cobro NO guardan referencia completa a trabajadores
**Severidad**: 🟡 MEDIA
**Archivo**: `src/modules/billing/components/BillGenerator.jsx`

**Problema**: Al guardar una cuenta de cobro, se guardan los items pero NO se guarda la relación completa con los trabajadores y sus atenciones.

**Código**:
```javascript
const handleSave = () => {
  const itemsParaGuardar = Object.entries(selectedWorkers)
    .filter(([_, sel]) => sel)
    .map(([doc, _]) => ({
      descripcion: 'Evaluacion medica - ' + (trab?.nombres || 'Trabajador'),
      cantidad, valorUnit: valor, subtotal
    }));
  // NO guarda IDs de trabajadores ni referencias a atenciones
  onSave?.(billCompleto);
};
```

**Falta**:
- ❌ Array de `trabajadorIds` en la factura
- ❌ Referencias a las atenciones facturadas
- ❌ Link para ver detalle de cada trabajador desde la factura

---

## 🔧 PLAN DE SOLUCIÓN COMPLETO

### FASE 1: Backend - Nuevas Rutas y Modelos de Datos

#### 1.1 Crear nuevas rutas en `backend/src/routes/data.js`:

```javascript
// ═══ REPORTS (Informes guardados) ═══════════════════
router.get('/reports', async (req, res) => {
  // Obtener todos los informes del usuario
});

router.get('/reports/by-company/:companyId', async (req, res) => {
  // Filtrar por empresa
});

router.get('/reports/by-nit/:nit', async (req, res) => {
  // Filtrar por NIT
});

// ═══ CUSTODIA (Cartas por empresa) ══════════════════
router.get('/custodia/by-company/:companyId', async (req, res) => {
  // Obtener cartas de custodia por empresa
});

router.get('/custodia/by-nit/:nit', async (req, res) => {
  // Obtener cartas por NIT
});

// ═══ BILLS (Cuentas de cobro por empresa) ═══════════
router.get('/bills/by-company/:companyId', async (req, res) => {
  // Filtrar cuentas de cobro por empresa
});

router.get('/bills/by-nit/:nit', async (req, res) => {
  // Filtrar por NIT
});

// ═══ CERTIFICATES (Certificados por empresa) ════════
router.get('/certificates/by-company/:companyId', async (req, res) => {
  // Obtener todos los certificados de trabajadores de una empresa
});

router.get('/certificates/by-nit/:nit', async (req, res) => {
  // Obtener certificados por NIT de empresa
});
```

#### 1.2 Crear nuevas rutas en `backend/src/routes/write.js`:

```javascript
// ═══ SAVE REPORT ════════════════════════════════════
router.post('/reports/save', async (req, res) => {
  // Guardar informe con referencia a empresa y período
});

// ═══ SAVE CUSTODIA (con indexación) ══════════════════
router.post('/custodia/save', async (req, res) => {
  // Guardar carta con indexación por empresaId y NIT
});
```

---

### FASE 2: Frontend - Nuevos Componentes y Vistas

#### 2.1 Crear `src/pages/PortalCertificadosEmpresa.jsx`:

Vista unificada que muestre:
- **Pestaña 1: Certificados**
  - Lista de todos los trabajadores con certificados
  - Filtros por período (mes/año)
  - Botón "Descargar todos" (genera ZIP)
  - Botón "Ver/Descargar" individual
  
- **Pestaña 2: Informes**
  - Lista de informes generados por período
  - Descarga de informes en PDF
  - Vista previa del informe
  
- **Pestaña 3: Cuentas de Cobro**
  - Historial de cuentas de cobro
  - Detalle de cada cuenta (trabajadores incluidos)
  - Descarga de cuenta de cobro en PDF
  
- **Pestaña 4: Cartas de Custodia**
  - Historial de cartas enviadas
  - Descarga de cartas en PDF
  - Fecha de envío y período cubierto

#### 2.2 Modificar `src/pages/VerificacionPage.jsx`:

Agregar sección de "Documentos de la Empresa" que incluya:
- Enlaces a los 4 tipos de documentos
- Resumen por período
- Acceso al portal completo

#### 2.3 Crear utilidad de descarga masiva:

```javascript
// src/utils/bulkDownload.js
export const downloadCertificatesAsZip = async (certificates) => {
  // Generar PDFs individuales
  // Comprimir en ZIP
  // Descargar archivo
};
```

---

### FASE 3: Integración y Flujo de Datos

#### 3.1 Modificar `ReporteSection.jsx`:

Al generar un informe, guardarlo automáticamente:

```javascript
const generateAndSaveReport = async () => {
  const reportData = await generateAIReport(stats, total, compName);
  
  // GUARDAR el informe
  await fetch('/api/reports/save', {
    method: 'POST',
    body: JSON.stringify({
      companyId: selectedCompanyReport,
      period: { start: reportStartDate, end: reportEndDate },
      data: reportData,
      generatedAt: new Date().toISOString()
    })
  });
  
  setReportAIResult(reportData);
};
```

#### 3.2 Modificar `BillGenerator.jsx`:

Agregar referencias completas al guardar:

```javascript
const handleSave = () => {
  const billCompleto = {
    ...bill,
    trabajadorIds: selectedWorkersList.map(w => w.id),
    atencionesIds: selectedAtenciones.map(a => a.id),
    empresaId: selectedCompanyId,
    empresaNit: selectedCompany.nit,
    // ... resto de datos
  };
  onSave?.(billCompleto);
};
```

---

### FASE 4: Testing y Validación

#### 4.1 Casos de prueba:

1. **Ingresar por NIT** → Verificar que aparezcan todos los documentos
2. **Generar informe** → Verificar que se guarde y aparezca en el portal
3. **Generar cuenta de cobro** → Verificar que se guarde con referencias
4. **Generar carta de custodia** → Verificar que se indexe por empresa
5. **Descargar certificados masivamente** → Verificar ZIP generado correctamente
6. **Verificar permisos** → Solo usuarios autorizados pueden ver documentos de cada empresa

---

## 📊 PRIORIDADES DE IMPLEMENTACIÓN

| Prioridad | Error/Feature | Esfuerzo | Impacto |
|-----------|-------------|----------|---------|
| 🔴 P0 | ERROR #1: Portal Empresa unificado | 3-4 días | CRÍTICO |
| 🔴 P0 | ERROR #2: Guardar informes backend | 1-2 días | CRÍTICO |
| 🔴 P0 | ERROR #3: Obtener informes por empresa | 1 día | CRÍTICO |
| 🟠 P1 | ERROR #6: Descarga masiva ZIP | 2 días | ALTO |
| 🟠 P1 | ERROR #4: Cuentas de cobro por empresa | 1 día | ALTO |
| 🟠 P1 | ERROR #5: Cartas de custodia por empresa | 1 día | ALTO |
| 🟡 P2 | ERROR #7: Vista unificada completa | 2-3 días | MEDIO |
| 🟡 P2 | ERROR #8: Referencias en facturas | 1 día | MEDIO |

---

## 🎯 CONCLUSIÓN

El sistema tiene una **base sólida** para la generación de certificados y documentos, pero **falta la capa de persistencia y consulta** que permita a las empresas acceder a su historial completo de documentos. 

Los **8 errores identificados** deben resolverse en el orden de prioridad establecido para garantizar que el Portal de Certificados funcione según los requisitos:
1. Visualización completa por NIT
2. Certificados idénticos a los de la plataforma
3. Descarga masiva
4. Acceso a informes, cuentas de cobro y cartas de custodia
5. Persistencia de todos los documentos generados

**¿Desea que proceda con la implementación de estas soluciones?**
