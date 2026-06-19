# BITÁCORA DE CONTEXTO — SISO OCUPASALUD
Última actualización: 2026-06-19 11:07 (America/Santiago)
Sprint actual: SPRINT 4 — HC General + Fórmula + Derivaciones (COMPLETADO)
Porcentaje estimado de completitud: 35%

## ESTADO DEL REPOSITORIO
- Build: PASA — 1764 modules, 51 chunks, 6.25s + version.json
- Tests: 1 suite pasando (8/8 d1Client.test.js)
- Rama: main
- Último commit: 5fd909b — sprint4: hc-general completo con incapacidad + plan + campos faltantes
- Worker D1: NO VERIFICADO (vía health endpoint)

## COMPLETADO EN SESIONES ANTERIORES
### PRE-SPRINT → SPRINT 3
- Infraestructura, d1Client, authStore, HC Ocupacional cierre bloqueante + paraclínicos + QR + signos vitales

### SPRINT 4 (commit: 5fd909b)
- **GeneralHC.jsx** completado:
  - Sección Incapacidad: checkbox "Aplica Incapacidad" + días, desde, hasta, origen (5 opciones)
  - Campos Plan: medicamentos, paraclínicos, remisiones, controlEn — todos conectados a `data.plan`
  - Datos demográficos: escolaridad (SelectGroup, 7 opciones) + email (InputGroup type=email)
  - Cobertura GeneralHC: 80% → **95%** (40/42 campos de initialGeneralPatientState)
- **TabFormulaDerivacion**: YA integrado en HistoriaGeneralPage.jsx con tabs fórmula + derivación
- **ExamRequestTab**: 100% completo con búsqueda CUPS + impresión
- **QR fix**: dominio ahora usa `VITE_STABLE_DOMAIN` con fallback

## EN CURSO
- Ninguno. SPRINT 4 completado. Listo para SPRINT 5.

## PRÓXIMO PASO EXACTO
Iniciar SPRINT 5 — PORTALES:
1. WorkerPortalPage — login cédula/código
2. PortalEmpresaPage — login NIT+código, periodos, descarga ZIP
3. FIX 5: cleanFirma antes de publicar
4. FIX 4: window.open() anti-popup blocker en impresión
Commit sugerido: sprint5: portales trabajador empresa

## DEUDA TÉCNICA DETECTADA
- modules/clinical/services/printService.js: stub "1", real está en src/lib/printService.js
- 14 suites legacy aún fallan por imports rotos — no bloqueante
- FIX 4 (anti-popup window.open) pendiente en tabs de impresión

## RIESGOS ACTIVOS
- D1 tiene 2.441 claves activas: protegido con d1WriteArrayMerge
- Worker token debe configurarse en GitHub Secrets de Repo B antes de CI/CD

## INVENTARIO DE COBERTURA
### Módulos completos ✅
- Infraestructura PRE-SPRINT
- D1 Client SPRINT 1
- Auth + Router SPRINT 2
- HC Ocupacional SPRINT 3 (95%)
- HC General SPRINT 4 (95%)

### Módulos parciales 🔶
- Páginas (44 en Repo B, build pasa)
- TabFormulaDerivacion integrado en ambas HC

### Módulos ausentes ❌
- .github/workflows/deploy.yml
- SPRINT 5 en adelante (Portales, Encuestas, Agenda, Facturación, IA, SGSST...)

## ARCHIVOS TOCADOS EN ÚLTIMA SESIÓN (SPRINT 4)
- src/modules/clinical/components/GeneralHC.jsx: +85 líneas (incapacidad, plan campos, escolaridad, email)
- src/modules/clinical/components/CertificateView.jsx: QR domain fix

## CONTEXTO TÉCNICO CLAVE PARA PRÓXIMA SESIÓN (SPRINT 5)
- WorkerPortalPage.jsx y PortalEmpresaPage.jsx ya existen en src/pages/
- FIX 5: cleanFirma(firma) antes de guardar — usar regex replace(/^"+|"+$/g, '')
- FIX 4: En cada window.open(), agregar: `if (!w) alert('Popup bloqueado...')`
- Las rutas de portal ya están en App.jsx: /portal/:code, /portal-empresa