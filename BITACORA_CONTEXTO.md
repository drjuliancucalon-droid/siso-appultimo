# BITÁCORA DE CONTEXTO — SISO OCUPASALUD
Última actualización: 2026-06-19 12:18 (America/Santiago)
Sprint actual: SPRINT 5 — Portales (COMPLETADO)
Porcentaje estimado de completitud: 42%

## ESTADO DEL REPOSITORIO
- Build: PASA — 1765 modules, 51 chunks, 7.68s + version.json
- Tests: 1 suite pasando (8/8 d1Client.test.js)
- Rama: main
- Último commit: fda5675 — sprint5: PortalEmpresa conectado a D1 + login NIT-codigo + periodo + ZIP
- Worker D1: NO VERIFICADO

## COMPLETADO EN SESIONES ANTERIORES
### PRE-SPRINT → SPRINT 4
- Infraestructura, d1Client, authStore, HC Ocupacional (cierre bloqueante + paraclínicos + QR + signos vitales), HC General (incapacidad + plan completo)

### SPRINT 5 (commits: eb4f87f → e848b9f → c52b9d5 → fda5675)
- **FIX 5 — cleanFirma()**: `src/shared/lib/utils/cleanFirma.js` CREADO. Aplicado en 4/4 archivos
- **FIX 4 — Anti-popup**: `printService.js` openPrintWindow() con validación
- **WorkerPortal**: Conectado a D1 con `d1Get('siso_portal_doc_<cc>')` + `d1Get('siso_portal_<code>')` + `d1Get('siso_portal_CV-<code>')`. Historial de atenciones con CertificateView integrado
- **PortalEmpresa**: Login NIT+código, filtro por período, descarga ZIP con JSZip, conexión D1 (`siso_portal_empresa_atenciones_<NIT>`, `siso_portal_empresa_docs_<NIT>`, `siso_companies_shared`)

## EN CURSO
- Ninguno. SPRINT 5 completado. Listo para SPRINT 6.

## PRÓXIMO PASO EXACTO
Iniciar SPRINT 6 — ENCUESTAS + AGENDA + PACIENTES

## DEUDA TÉCNICA DETECTADA
- 14 suites legacy fallan por imports rotos — no bloqueante

## INVENTARIO DE COBERTURA
### Módulos completos ✅
- PRE-SPRINT, D1 Client, Auth + Router, HC Ocupacional (95%), HC General (95%), Portales SPRINT 5

### Módulos parciales 🔶
- SPRINT 6 en adelante (Encuestas, Agenda, Pacientes, Facturación, IA, SGSST)

### Módulos ausentes ❌
- .github/workflows/deploy.yml

## ARCHIVOS TOCADOS EN ÚLTIMA SESIÓN (SPRINT 5)
- src/shared/lib/utils/cleanFirma.js: CREADO
- src/pages/HistoriaPage.jsx, CertificateView.jsx, DoctorSignature.jsx, PortalPublicoTrabajador.jsx: cleanFirma
- src/lib/printService.js: FIX 4 anti-popup
- src/modules/patients/components/WorkerPortal.jsx: REWRITE completo con D1
- src/pages/PortalEmpresaPage.jsx: REWRITE completo con D1 + JSZip

## CONTEXTO TÉCNICO CLAVE PARA PRÓXIMA SESIÓN (SPRINT 6)
- Las 6 claves D1 del portal se escriben en handleCloseHC y se leen desde WorkerPortal/PortalEmpresa
- cleanFirma centralizado en src/shared/lib/utils/cleanFirma.js
- JSZip ya importado para PortalEmpresa ZIP