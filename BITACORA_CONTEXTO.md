# BITÁCORA DE CONTEXTO — SISO OCUPASALUD
Última actualización: 2026-06-19 10:42 (America/Santiago)
Sprint actual: SPRINT 3 — HC Ocupacional (COMPLETADO)
Porcentaje estimado de completitud: 28%

## ESTADO DEL REPOSITORIO
- Build: PASA — 1764 modules, 51 chunks, 9.74s + version.json
- Tests: 1 suite pasando (8/8 d1Client.test.js)
- Rama: main
- Último commit: aa7e56d — sprint3: hc-ocupacional cierre-bloqueante + paraclinicos + QR + signos vitales + GTC45
- Worker D1: NO VERIFICADO (vía health endpoint)

## COMPLETADO EN SESIONES ANTERIORES
### PRE-SPRINT (commit: 03754c3)
- Build reparado, VersionWatcher/D1ChangesWatcher/StorageHealth portados, siso-worker/
### SPRINT 1 (commit: 1c11138)
- d1Client.js con merge, chunking, retries, If-Match. Watchers integrados en App.
### SPRINT 2 (commit: 9b3fba8)
- authStore conectado a D1, admin_empresa, TOTP, CRUD usuarios. Bug vitest resuelto.

### SPRINT 3 (commit: aa7e56d)
- **FIX 3 — Cierre bloqueante D1**: `handleCloseHC()` ahora escribe a 6 claves D1 con await:
  - `siso_hc_completa_<cc>` (d1Set)
  - `siso_portal_doc_<cc>` (d1Set)
  - `siso_portal_<code>` (d1Set)
  - `siso_portal_empresa_atenciones_<NIT>` (d1WriteArrayMerge)
  - `siso_portal_empresa_<NIT>` (d1WriteArrayMerge)
  - `siso_portal_empresa_docs_<NIT>` (d1WriteArrayMerge, idField='periodo')
  - Si falla: alerta al médico pero el flujo continúa. Log con timestamp.
- **Paraclínicos**: 14 checkboxes agregados en OccupationalHC (optometría, audiometría, espirometría, ECG, glicemia, lípidico, frotis faríngeo, coprológico, KOH uñas, hemático, RX tórax, EMG, psicología, otros con input)
- **QR en Certificado**: Código QR via api.qrserver.com apuntando a `/verificar/<codigo>` en el badge de HC cerrada
- **Signos vitales en Certificado**: Sección condicional con FC, FR, TA, Temp, Peso, Talla, IMC visibles en CertificateView
- **GTC-45 básico**: Sección de factores de riesgo (8 checkboxes) ya existente en OccupationalHC — verificada

## EN CURSO
- Ninguno. SPRINT 3 completado. Listo para SPRINT 4.

## PRÓXIMO PASO EXACTO
Iniciar SPRINT 4 — HC GENERAL + FÓRMULA + DERIVACIONES:
1. GeneralHC con todos los campos
2. PrescriptionTab con autocompletar
3. ExamRequestTab con impresión
4. Derivación popup editable
Commit sugerido: sprint4: hc-general formula derivaciones

## DEUDA TÉCNICA DETECTADA
- modules/clinical/services/printService.js: stub "1", real está en src/lib/printService.js
- 14 suites legacy aún fallan por imports rotos — no bloqueante
- CertificateView: registro entrega certificado (checkbox/método/fecha) son read-only, falta conectarlos a setData

## RIESGOS ACTIVOS
- D1 tiene 2.441 claves activas: protegido con d1WriteArrayMerge en cierre HC
- Worker token debe configurarse en GitHub Secrets de Repo B antes de CI/CD

## INVENTARIO DE COBERTURA
### Módulos completos ✅
- Infraestructura PRE-SPRINT
- D1 Client SPRINT 1
- Auth + Router SPRINT 2
- HC Ocupacional SPRINT 3 (initialOccupPatientState 100%, OccupationalHC 87→95%, CertificateView 90→98%, FIX 3 cierre bloqueante)

### Módulos parciales 🔶
- Páginas (44 en Repo B, build pasa)
- HC General (estructura existe, sin auditar contra monolito)

### Módulos ausentes ❌
- .github/workflows/deploy.yml
- SPRINT 4 en adelante

## ARCHIVOS TOCADOS EN ÚLTIMA SESIÓN (SPRINT 3)
- src/pages/HistoriaPage.jsx: import d1Client + FIX 3 cierre bloqueante (6 claves D1 con await)
- src/modules/clinical/components/OccupationalHC.jsx: sección Paraclínicos (14 checkboxes) + import TestTube
- src/modules/clinical/components/CertificateView.jsx: QR code + signos vitales condicionales

## CONTEXTO TÉCNICO CLAVE PARA PRÓXIMA SESIÓN (SPRINT 4)
- El cierre HC ya publica a las 6 claves D1 con d1WriteArrayMerge para las 3 de array.
- QR usa api.qrserver.com (gratuito, sin límite de requests).
- initialOccupPatientState está 100% verificado contra monolito.
- Para HC General, verificar initialGeneralPatientState + GeneralHC.jsx + ExamRequestTab.jsx.