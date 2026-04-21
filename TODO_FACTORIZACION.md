# TODO_FACTORIZACION.md - NUEVO PROTOCOLO OPTIMIZADO

**META**: Monolito → Modules en 10 semanas | Riesgo bajo | Costo $0

## **PASO 1: 10 ARCHIVOS MÁS GRANDES src/pages/**

Prioridad basada en tamaño/complejidad (estimado por líneas):

1. **Historia.jsx** (HC Ocupacional - **1500+ líneas**) → `clinical/`
2. **Reporte.jsx** (Reportes + Certificados - **1200 líneas**) → `reports/`
3. **Companies.jsx** (**800 líneas**) → `companies/` ✓ **INICIADO**
4. **Bill.jsx** (Billing - **600 líneas**) → `billing/` ✓ **INICIADO**
5. **Caja.jsx** (Caja - **500 líneas**) → `cashbox/` ✓ **INICIADO**
6. **Dashboard.jsx** (**400 líneas**) → `dashboard/`
7. **BackupPage.jsx** (**350 líneas**) → `backup/`
8. **PortalCertificadosEmpresa.jsx** (**300 líneas**) → `portal/` ✓ **CREADO**
9. **Agenda.jsx** (**250 líneas**) → `agenda/`
10. **SGSST.jsx** (**200 líneas**) → `sgsst/`

## **PASO 2: PROTOCOLO POR ARCHIVO (5 DÍAS)**

**Ejemplo Bill.jsx → billing/** (repetir x10):
```
D1: "Lee src/pages/Bill.jsx" → ANÁLISIS SIMPLE
D2: "Crea src/modules/billing/components/BillMain.jsx" → COPIA lógica
D3: "Crea src/modules/billing/hooks/useBill.js" → EXTRAE funciones
D4: "Actualiza BillingPage.jsx" → IMPORTA useBill + BillMain  
D5: "Prueba billing" → npm test + dev ✓
```

## **ESTADO ACTUAL** (Semana 1 - Piloto)
```
✅ Companies.jsx → companies/ (Main + useCompanies)
✅ Bill.jsx → billing/ (Main + useBill)  
✅ Caja.jsx → cashbox/ (Main + useCaja)
✅ PortalCertificadosEmpresa.jsx → portal/ (completo)
```

## **SEMANA 2: Dashboard.jsx**
```
[ ] D1: Análisis Dashboard.jsx
[ ] D2: DashboardMain.jsx  
[ ] D3: useDashboard.js
[ ] D4: DashboardPage.jsx actualizada
[ ] D5: Test + dev
```

## **COMANDOS EXACTOS BLACKBOXAI:**
```
1. "Lee src/pages/[NOMBRE].jsx"
2. "Crea src/modules/[nombre]/components/[Nombre]Main.jsx"
3. "Crea src/modules/[nombre]/hooks/use[Nombre].js" 
4. "Actualiza [Page].jsx → imports"
5. "npm test + compara funcionalidad"
```

**PRÓXIMO: SEMANA 2 Dashboard.jsx → Comenzar HOY** 🚀
