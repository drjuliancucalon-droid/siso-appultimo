# Protocolo de Intervención: Factorización SISO-App
Monolito: ocupasalud-paradesplegar → Modular: siso-appultimo

## FASE 1: DIAGNÓSTICO (Completada)
- [x] Inventario brechas (billing 30%, caja 20%, reports 5%)
- [x] TODO_FACTORIZACION.md creado

## FASE 2: SHARED HOOKS
- [ ] src/shared/hooks/useActiveDoctorData.js
- [ ] src/shared/hooks/useSync.js  
- [ ] src/shared/hooks/useUICallbacks.js

## FASE 3: MODULES POR PRIORIDAD
### 1. BILLING (Bill.jsx 37KB → 100% módulo)
  - [x] useBilling.js (estado)
  - [x] BillGenerator.jsx (refactor hook ✅)
  - [ ] BillList.jsx (renderListaCuentas)
  - [ ] Portafolio.jsx (renderPortafolio)
  - [ ] Cotizaciones.jsx (renderCotizaciones)
  - [ ] DIANExport.jsx (XML completo)

### 2. CAJA (Caja.jsx 34KB → módulo cashbox) STARTED
  - [x] useCaja.js (logic extracted)
  - [ ] CajaMain.jsx
  - [ ] CajaList.jsx

### 3. REPORTES (Reporte.jsx 132KB → módulo reports)
  - [ ] Análisis Reporte.jsx (20+ tipos)
  - [ ] useReports.js
  - [ ] 5 componentes por sesión

## FASE 4: VERIFICACIÓN
- [ ] npm test 100%
- [ ] npm run dev → paridad visual
- [ ] git push blackboxai/factorizacion-portal-empresa

### 4. PORTAL EMPRESA MODULE (FASE 3.5) ✓
  - modules/portalEmpresa/ created
  - hooks/useCompanyDocuments.js moved
  - utils/bulkDownload.js moved
  - components/PortalCertificadosEmpresa.jsx moved
  - App.jsx route + Layout nav updated

**Next: CAJA module FASE 3.2**

