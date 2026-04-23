# PROTOCOLO DE CORRECCIÓN DE ERRORES - 100% SEGURO Y RESPETANDO MONOLITO

## ERRORES REPORTADOS
```
1. CAJA: "Caja is not defined" 
2. FACTURACIÓN: "filteredBills is not defined"
3. EMPRESAS: "newEncuesta is not defined"
4. HISTORIA OCUPACIONAL: Botones repetidos
5. PORTAL EMPRESA: Datos legales + acceso completo
6. NUEVO: Análisis IA SVE por empresa (Res. 4065)
```

## ESTRATEGIA (0 DAÑOS)
```
1. BACKUP ← FUENTE DE VERDAD (src/pages-backup/)
2. Fix UNO por módulo
3. Test runtime inmediato
4. Validar vs monolito
5. Protocolo auditado
```

## FASE 1: CAJA - FIX "Caja is not defined"

**DIAGNÓSTICO:**
```
CajaPage.jsx importa CajaMain.jsx
Llama <Caja /> (no existe)
```

**SOLUCIÓN:**
```
Agregar alias: const Caja = CajaMain;
```

## FASE 2: FACTURACIÓN - "filteredBills"

**ACCIONES PENDIENTES:**
```
1. Leer src/pages-backup/Bill.jsx
2. Comparar BillingPage.jsx vs monolito
3. Restaurar filteredBills logic
```

## FASE 3: EMPRESAS - "newEncuesta"

**ACCIONES PENDIENTES:**
```
1. Leer src/pages-backup/Companies.jsx
2. Restaurar newEncuesta state en CompaniesMain.jsx
```

## FASE 4: IA SVE POR EMPRESA (NUEVO FEATURE)

**REQUISITOS:**
```
- Seleccionar empresa
- Analizar todas HCs de empresa
- Clasificar SVE (Res. 4065/2012)
- Factores riesgo, diagnóstico, fecha control
- Sistema epidemiológico vigilancia
```

**IMPLEMENTACIÓN:**
```
1. Nuevo hook: useSVEAnalysis(empresaId)
2. Backend endpoint: /data/sve-analysis/:empresaId
3. Componente en PortalCertificadosEmpresa → Tab SVE
4. Prompt IA optimizado por resolución legal
```

## AUDITORÍA DE CAMBIOS
```
✓ Portal Certificados Empresa (funcional)
✓ Backend rutas data/write
✗ Módulos factorizados (3 errores identificados)
✓ Tests 164/164 previos
```

## PRÓXIMOS PASOS (SEC
