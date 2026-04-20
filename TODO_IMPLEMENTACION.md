# 🚀 PLAN DE IMPLEMENTACIÓN - Portal de Certificados y Empresas

## FASE 1: Backend - Nuevas Rutas API (Día 1-2) ✅ COMPLETADO

### 1.1 Modificar `backend/src/routes/data.js` ✅
- [x] Agregar endpoint `GET /reports` - Obtener todos los informes
- [x] Agregar endpoint `GET /reports/by-company/:companyId` - Informes por empresa
- [x] Agregar endpoint `GET /reports/by-nit/:nit` - Informes por NIT
- [x] Agregar endpoint `GET /custodia/by-company/:companyId` - Cartas por empresa
- [x] Agregar endpoint `GET /custodia/by-nit/:nit` - Cartas por NIT
- [x] Agregar endpoint `GET /bills/by-company/:companyId` - Facturas por empresa
- [x] Agregar endpoint `GET /bills/by-nit/:nit` - Facturas por NIT
- [x] Agregar endpoint `GET /certificates/by-company/:companyId` - Certificados por empresa
- [x] Agregar endpoint `GET /certificates/by-nit/:nit` - Certificados por NIT

### 1.2 Modificar `backend/src/routes/write.js` ✅
- [x] Agregar endpoint `POST /reports/save` - Guardar informe con referencias
- [x] Modificar `POST /custodia/save` - Agregar indexación por empresa/NIT
- [x] Modificar `POST /bills/save` - Agregar array de trabajadorIds y atencionesIds

## FASE 2: Frontend - Nuevos Componentes (Día 3-4) ✅ COMPLETADO

### 2.1 Crear `src/pages/PortalCertificadosEmpresa.jsx` ✅
- [x] Pestaña "Certificados" - Lista con filtros y descarga masiva
- [x] Pestaña "Informes" - Historial de informes generados
- [x] Pestaña "Cuentas de Cobro" - Historial de facturas
- [x] Pestaña "Cartas de Custodia" - Historial de cartas
- [x] Componente de filtros por período (mes/año)
- [x] Botón de descarga masiva (ZIP)

### 2.2 Crear `src/utils/bulkDownload.js` ✅
- [x] Función `generatePDFfromHTML()` - Convertir HTML a PDF
- [x] Función `downloadCertificatesAsZip()` - Comprimir certificados en ZIP
- [x] Función `downloadSingleCertificate()` - Descargar certificado individual

### 2.3 Crear `src/hooks/useCompanyDocuments.js` ✅
- [x] Hook personalizado para obtener todos los documentos de una empresa

### 2.4 Modificar `src/pages/VerificacionPage.jsx` ✅
- [x] Agregar sección "Documentos de la Empresa"
- [x] Agregar botón "Ver Portal Completo" que redirija a PortalCertificadosEmpresa
- [x] Mostrar resumen de documentos disponibles

### 2.5 Modificar `src/App.jsx` ✅
- [x] Agregar ruta `/portal-certificados-empresa/:nit` para el nuevo portal

## FASE 3: Integración y Persistencia (Día 5) ✅ COMPLETADO

### 3.1 Modificar `src/sections/ReporteSection.jsx` ✅
- [x] Agregar guardado automático de informes al generar
- [x] Llamar a `POST /api/reports/save` después de generar informe IA
- [x] Agregar referencias a empresa y período
- [x] Verificar que el resultado del IA existe antes de guardar
- [x] Incluir todos los datos del resultado del IA en el reportData
- [x] Agregar referencias completas a la empresa para el portal
- [x] Manejo de errores con alertas al usuario

### 3.2 Modificar `src/modules/billing/components/BillGenerator.jsx` ✅
- [x] Agregar `referenciaEmpresa` al guardar factura
- [x] Agregar `trabajadoresCount` al guardar factura
- [x] Agregar `modoCobro` al guardar factura
- [x] Agregar `empresaNit` para indexación

### 3.3 Modificar `src/pages/CartaCustodiaPage.jsx` ✅
- [x] Usar nuevo endpoint con indexación por empresa/NIT
- [x] Agregar `empresaNit` al guardar
- [x] Agregar `referenciaEmpresa` con todos los datos necesarios
- [x] Incluir datos completos del médico para el portal

## FASE 4: Testing y Validación (Día 6)

### 4.1 Pruebas Backend
- [ ] Probar todas las nuevas rutas con curl/Postman
- [ ] Verificar que los datos se guarden con referencias correctas
- [ ] Verificar que las consultas por empresa/NIT funcionen

### 4.2 Pruebas Frontend
- [ ] Ingresar por NIT y verificar que aparezcan todos los documentos
- [ ] Generar informe y verificar que se guarde
- [ ] Generar cuenta de cobro y verificar referencias
- [ ] Generar carta de custodia y verificar indexación
- [ ] Descargar certificados masivamente y verificar ZIP

### 4.3 Pruebas de Integración
- [ ] Flujo completo: Generar HC → Cerrar → Generar certificado → Ver en portal
- [ ] Flujo: Generar informe → Guardar automáticamente → Ver en portal
- [ ] Flujo: Generar cuenta de cobro → Guardar → Ver en portal con detalles
- [ ] Flujo: Generar carta de custodia → Guardar → Ver en portal

## FASE 5: Documentación y Entrega (Día 7)

### 5.1 Actualizar documentación
- [ ] Actualizar `ANALISIS_CERTIFICADOS_PORTAL_EMPRESA.md` con implementación
- [ ] Crear `MANUAL_USO_PORTAL_EMPRESA.md`
- [ ] Documentar nuevas APIs en backend

### 5.2 Verificación final
- [ ] Revisar que todos los errores identificados estén corregidos
- [ ] Verificar que no se hayan introducido nuevos errores
- [ ] Confirmar que el sistema cumple con todos los requisitos

---

## 🎯 MÉTRICAS DE ÉXITO

- ✅ Portal por NIT muestra: Certificados, Informes, Cuentas de Cobro, Cartas de Custodia
- ✅ Todos los documentos se guardan con referencias a empresa/NIT
- ✅ Se pueden descargar certificados individualmente y en masa (ZIP)
- ✅ Los informes se guardan automáticamente al generar
- ✅ Las cuentas de cobro muestran detalle de trabajadores incluidos
- ✅ Las cartas de custodia se pueden consultar por empresa

---

## 📁 ARCHIVOS A MODIFICAR/CREAR

### Backend (5 archivos)
1. `backend/src/routes/data.js` - 9 nuevos endpoints
2. `backend/src/routes/write.js` - 3 modificaciones/nuevos endpoints
3. `backend/src/routes/portal.js` - NUEVO: Rutas específicas del portal
4. `backend/src/services/companyIndex.js` - NUEVO: Servicio de indexación por empresa
5. `backend/src/middleware/companyAccess.js` - NUEVO: Middleware de acceso por empresa

### Frontend (8 archivos)
1. `src/pages/PortalCertificadosEmpresa.jsx` - NUEVO: Vista principal del portal
2. `src/utils/bulkDownload.js` - NUEVO: Utilidades de descarga masiva
3. `src/hooks/useCompanyDocuments.js` - NUEVO: Hook para obtener documentos por empresa
4. `src/components/portal/CertificadosList.jsx` - NUEVO: Lista de certificados
5. `src/components/portal/InformesList.jsx` - NUEVO: Lista de informes
6. `src/components/portal/CuentasCobroList.jsx` - NUEVO: Lista de cuentas de cobro
7. `src/components/portal/CartasCustodiaList.jsx` - NUEVO: Lista de cartas de custodia
8. `src/pages/VerificacionPage.jsx` - MODIFICAR: Agregar sección de documentos

### Tests (3 archivos)
1. `src/test/portal-empresa.test.js` - NUEVO: Tests del portal
2. `src/test/bulk-download.test.js` - NUEVO: Tests de descarga masiva
3. `src/test/backend-routes.test.js` - NUEVO: Tests de nuevas rutas backend

---

## ⏱️ ESTIMACIÓN DE TIEMPO

| Fase | Días | Entregable |
|------|------|------------|
| 1 - Backend | 2 | APIs funcionales con Postman |
| 2 - Frontend | 2 | Componentes visuales básicos |
| 3 - Integración | 1 | Flujo completo funcional |
| 4 - Testing | 1 | Tests pasando, bugs corregidos |
| 5 - Documentación | 1 | Documentación completa |
| **TOTAL** | **7 días** | Sistema completo funcional |

---

## 🚦 DECISIONES PENDIENTES

1. **¿Usar librería PDF o mantener HTML+print?**
   - Opción A: jsPDF + html2canvas (más complejo, mejor calidad)
   - Opción B: Mantener HTML con window.print() (más simple, suficiente)
   - **Recomendación**: Opción B para mantener consistencia con sistema actual

2. **¿ZIP en frontend o backend?**
   - Opción A: Frontend con JSZip (más carga en cliente, menos servidor)
   - Opción B: Backend con archiver (más carga en servidor, mejor UX)
   - **Recomendación**: Opción A para evitar sobrecarga de servidor

3. **¿Autenticación para portal por NIT?**
   - Opción A: Público (cualquiera con NIT puede acceder)
   - Opción B: Requiere login de empresa (más seguro)
   - **Recomendación**: Opción A según requerimientos actuales

---

**¿Procedo con la implementación siguiendo este plan?**
