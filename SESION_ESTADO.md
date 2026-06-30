# SESION_ESTADO.md — Documento maestro persistente SISO OcupaSalud
# ⚠️ LEER ESTE ARCHIVO AL INICIO DE CADA SESIÓN NUEVA
# Actualizado automáticamente cada sesión

---

## PLATAFORMA
- **Repo local**: `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio`
- **URL producción**: `https://0e14e2ed.siso-appultimo-arp.pages.dev`
- **Monolito referencia**: `https://ocupasaludparadesplegar-f4q.pages.dev`
- **Worker D1**: `https://siso-api.dr-juliancucalon.workers.dev` (header `X-Siso-Token`)
- **Cloudflare Pages**: construye con `npm run build` — NO sirve dist comprometido

## SEGURIDAD (PERMANENTE — NO CAMBIAR NUNCA)
- ❌ No exponer VITE_WORKER_TOKEN en ningún log
- ❌ No cambiar CF_API_TOKEN ni secrets salvo necesidad crítica
- ❌ No cambiar claves D1 ni nombres de rutas
- ❌ No mezclar cambios dominio/infra con sprints funcionales
- ✅ Si VITE_WORKER_TOKEN no existe → detener y pedir al usuario

## CLAVES D1
- `siso_companies_${userId}`
- `siso_patients_${userId}`
- `siso_users`
- `siso_encuestas`
- `siso_encuesta_resps_${encId}`
- `siso_portal_empresa_atenciones_${nit}`

---

## ESTADO ACTUAL (sesión 2026-06-30)

### ✅ CAMBIOS IMPLEMENTADOS Y BUILD EXITOSO (Sesión #2 — 2026-06-30)

#### Sprint A3: PhysicalExam.jsx — Expandido a 29 sistemas ✅
- `src/modules/clinical/components/PhysicalExam.jsx`
- ✅ Comentario actualizado: 15 → 29 sistemas
- ✅ Catálogo NORMAL_DESCRIPTIONS_SYSTEMS ya contiene los 29 sistemas
- ✅ Build verificado: 1817 módulos compilados sin errores

#### Sprint A4: RecommendationsPanel + RestrictionsPanel — Verificados ✅
- `src/modules/clinical/components/RecommendationsPanel.jsx` (110 líneas) — Completo
- `src/modules/clinical/components/RestrictionsPanel.jsx` (124 líneas) — Completo
- ✅ Ambos con checklist por categoría, IA, GTC-45/GATISO

#### Sprint C4: CartaCustodiaPage — Migración Supabase→D1 ✅
- `src/pages/CartaCustodiaPage.jsx` (506 líneas) — Ya migrado en sesión anterior
- ✅ Guarda en D1 vía `d1WriteArrayMerge`, historial funcional

#### Documentación ✅
- ✅ `PROMPT-SESION.md` copiado al directorio de trabajo
- ✅ `PROTOCOLO-MIGRACION-FINAL.md` creado como tracking oficial
- ✅ BrowserTools MCP server corriendo para screenshots

### ✅ CAMBIOS IMPLEMENTADOS (Sesión #1 — 2026-06-22)

#### EpidemiologicalReport.jsx — REESCRITO COMPLETO (703 líneas)
- `src/modules/reports/components/EpidemiologicalReport.jsx`
- ✅ R1: Siempre carga desde D1 (eliminado early-return bug)
- ✅ R2: filterEmpresa ahora es `<select>` con empresas de D1/monolito
- ✅ R3: Stats expandidas: conHallazgos, conRiesgos, edadPromedio, tasaNoAptos
- ✅ R4: Perfil Sociodemográfico con 11 variables + PctBar
- ✅ R5: Perfil Clínico (IMC, aptitud, CIE-10, hallazgos, riesgos)
- ✅ R6: Módulo precios (único / individual / por fecha)
- ✅ R7: handleExportCSV + botón imprimir
- ✅ Tendencia mensual bar chart
- ✅ TOP 5 CIE-10 summary
- ✅ filterMedico desde usersList
- ✅ Tab "📊 Diagnóstico" nuevo
- ✅ "🏢 Abrir Portal" directo desde empresa (tab empresas)

#### AnalisisDocsTab.jsx — CREADO NUEVO (268 líneas)
- `src/modules/companies/components/AnalisisDocsTab.jsx`
- ✅ Detecta bloques periódicos (≥3 PERIODICO mismo mes/empresa)
- ✅ Stats: BLOQUES DETECTADOS / COMPLETOS / INCOMPLETOS / INDIVIDUALES
- ✅ Por bloque: expandir lista trabajadores, Generar con IA, Generar carta custodia
- ✅ Carta de custodia descarga como .txt
- ✅ Estado INF (informe) + CUS (carta) por bloque

#### CompaniesSection.jsx — ACTUALIZADO (1794 líneas)
- `src/sections/CompaniesSection.jsx`
- ✅ E1: Import AnalisisDocsTab + estado showAnalisisDocs
- ✅ E2: Botón "📊 Análisis Docs" en header
- ✅ E3: Vista separada AnalisisDocsTab con botón Volver
- ✅ E4: Alerta "🔑 Activar todas" para empresas sin código de portal
- ✅ E5: Botón "🏢 Abrir Portal" por empresa en modal instrucciones

---

## SPRINTS PENDIENTES (próximas sesiones)

### ✅ COMPLETADOS ESTA SESIÓN (2026-06-30)
- Sprint A3: Expandir PhysicalExam.jsx a 29 sistemas ✅
- Sprint A4: Completar RecommendationsPanel y RestrictionsPanel ✅
- Sprint C4: CartaCustodiaPage — migrar Supabase → D1 ✅

### PRIORIDAD ALTA

### PRIORIDAD MEDIA
- Sprint D1: Agregar link WhatsApp (wa.me) al certificado
- Sprint D2: Auto-registro en caja al cerrar HC
- Sprint B: Encuestas — ver respuestas individuales + importar pacientes desde encuesta

### PRIORIDAD BAJA
- Reportes: Exportar PDF Tabla, Matriz Legal, Marco Normativo SST
- AnalisisDocsTab: Integrar con generación PDF real (no solo txt)

---

## ARCHIVOS CRÍTICOS A CONOCER

| Archivo | Líneas | Estado |
|---------|--------|--------|
| src/modules/reports/components/EpidemiologicalReport.jsx | 703 | ✅ Reescrito |
| src/sections/CompaniesSection.jsx | 1794 | ✅ Actualizado |
| src/modules/companies/components/AnalisisDocsTab.jsx | 268 | ✅ Nuevo |
| src/modules/companies/components/EncuestasTab.jsx | 638 | ✅ OK |
| src/pages/CompaniesPage.jsx | 128 | ✅ OK (sin cambios) |
| src/pages/HistoriaPage.jsx | 865 | ✅ Fix duplicado previo |
| src/modules/clinical/components/PhysicalExam.jsx | 149 | ✅ 29 sistemas |
| src/modules/clinical/components/RecommendationsPanel.jsx | 110 | ✅ Completo |
| src/modules/clinical/components/RestrictionsPanel.jsx | 124 | ✅ Completo |
| src/pages/CartaCustodiaPage.jsx | 506 | ✅ D1 migrado |
| PROTOCOLO_MIGRACION_FINAL.md | — | ✅ Tracking |

---

## PATRÓN DE DATOS (para nuevas sesiones)
- **ctx**: CompaniesSection espera objeto ctx con TODO el estado/helpers desde CompaniesPage.jsx
- **Patient-company match**: empresaId, empresaNit, empresa (string), empresaNombre
- **D1 siempre primero**: cargar desde D1, localStorage solo como caché/fallback
- **TDZ**: declarar const ANTES de usarlos (no después de funciones que los referencian)
- **Bloque periódico**: ≥3 PERIODICO mismo empresa/mes → requiere INF + CUS

---

## COMMITS REALIZADOS

### Sesión #2 — 2026-06-30
```powershell
cd C:\Users\JQK3\Desktop\Refactorizacion 30 de junio
git add src/modules/clinical/components/PhysicalExam.jsx
git add PROTOCOLO-MIGRACION-FINAL.md
git add PROMPT-SESION.md
git add SESION_ESTADO.md
git commit -m "feat(sprint-A3): PhysicalExam 29 sistemas + docs tracking sesion #2"
git push
```

### Sesión #1 — 2026-06-22
- `feat: Reportes completo + AnalisisDocs + Empresas portales mejorados`
  - `src/modules/reports/components/EpidemiologicalReport.jsx`
  - `src/modules/companies/components/AnalisisDocsTab.jsx`
  - `src/sections/CompaniesSection.jsx`