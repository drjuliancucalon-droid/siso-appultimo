# PROTOCOLO MAESTRO: REFACTORIZACIÓN OCUPASALUD
## Documento único y definitivo — 2026-04-15
## Repositorio destino: jqklony/siso-appultimo
## Repositorio referencia (INTOCABLE): jqklony/ocupasalud

---

## 1. ORIGEN Y CONTEXTO

### 1.1 — El monolito (ocupasalud)
- `App.jsx` de 2.2 MB / 48,000 líneas
- 36 vistas (render functions)
- 54 handlers
- ~20 funciones de IA
- ~23 funciones de impresión
- ~18 funciones de búsqueda/filtro
- ~48 funciones de guardado/exportación
- Backend: NINGUNO (todo corre en el browser)
- Auth: hashes en localStorage (inseguro)
- API keys: expuestas en el frontend

### 1.2 — Objetivo final
Replicar el **100% de las funciones** de ocupasalud en una arquitectura:
- Modular (módulos por dominio)
- Con backend real (Express + JWT)
- Con API keys protegidas en servidor
- Con code-splitting (lazy loading por ruta)
- Manteniendo la misma paleta visual (emerald/teal)
- Manteniendo la misma distribución (header horizontal + tabs)
- Compatible con los datos existentes en Supabase

---

## 2. INVENTARIO COMPLETO: 36 FUNCIONES DEL MONOLITO

### 2.1 — Estado de cada función

| # | Función del monolito | Componente en siso-appultimo | Conectado | Funcional |
|---|---------------------|------------------------------|-----------|-----------|
| 1 | renderLogin | LoginPage.jsx + LoginForm.jsx | ✅ | ✅ JWT real |
| 2 | renderNavbar | Layout.jsx (header + tabs) | ✅ | ✅ |
| 3 | renderDashboard | DashboardPage.jsx | ✅ | ✅ Datos reales |
| 4 | renderHistoriaOcupacional | OccupationalHC.jsx (79KB) | ✅ | ✅ Renderiza |
| 5 | renderHistoriaGeneral | GeneralHC.jsx (33KB) | ❌ NO conectado | ⚠️ Existe, falta página |
| 6 | renderCertificado | CertificateView.jsx (24KB) | ❌ NO conectado | ⚠️ Existe, falta página |
| 7 | renderPatients | PatientList.jsx | ✅ | ✅ 162 pacientes |
| 8 | renderCompanies | CompanyList.jsx + CompanyForm.jsx | ✅ | ✅ 26 empresas |
| 9 | renderUsers | UserList.jsx + UserForm.jsx | ✅ | ✅ 4 usuarios |
| 10 | renderAgenda | AgendaView.jsx + QueueManager.jsx | ✅ | ✅ |
| 11 | renderBill | BillGenerator.jsx | ✅ | ✅ |
| 12 | renderCaja | CashBox.jsx | ✅ | ✅ |
| 13 | renderPlanes | LicenseManager.jsx | ✅ | ✅ |
| 14 | renderTelemedicina | VideoConsult.jsx | ✅ | ✅ |
| 15 | renderPortalTrabajador | WorkerPortal.jsx | ✅ | ✅ |
| 16 | renderReporte | AnalyticsDashboard.jsx | ✅ | ✅ |
| 17 | renderARL | ARLReports.jsx | ✅ | ⚠️ Existe, no conectado a página propia |
| 18 | renderSVE | SVEPrograms.jsx + EpidemiologicalReport.jsx | ✅ | ⚠️ Existe, no en UI |
| 19 | renderVerification | — | ❌ NO existe | ❌ Crear |
| 20 | renderHabeasData | — | ❌ NO existe | ❌ Crear |
| 21 | renderTabAdjuntos | — | ❌ NO existe | ❌ Crear |
| 22 | renderTabSolicitudExamenes | — | ❌ NO existe | ❌ Crear |
| 23 | renderTabIncapacidadGeneral | — | ❌ NO existe | ❌ Crear |
| 24 | renderPropuestas | Proposals.jsx (7.5KB) | ❌ NO conectado | ⚠️ Existe |
| 25 | renderPortafolio | — | ❌ NO existe | ❌ Crear |
| 26 | renderCotizaciones | — | ❌ NO existe | ❌ Crear |
| 27 | renderCotizacionesInline | — | ❌ NO existe | ❌ Crear |
| 28 | renderContabilidad | — | ❌ NO existe | ❌ Crear |
| 29 | renderPerfilIPS | — | ❌ NO existe | ❌ Crear |
| 30 | renderSuperAdmin | — | ❌ NO existe | ❌ Crear |
| 31 | renderPortalEmpresa | CompanyPortal.jsx (6.1KB) | ❌ NO conectado | ⚠️ Existe |
| 32 | renderEvolucionModal | — | ❌ NO existe | ❌ Crear |
| 33 | renderMensajesOverlay | — | ❌ NO existe | ❌ Crear |
| 34 | renderAsistenciaAgenda | — | ❌ NO existe | ❌ Crear |
| 35 | renderCurrentView | App.jsx Router | ✅ | ✅ Reemplazado por React Router |
| 36 | renderCell | — | ✅ | ✅ No necesario (helper interno) |

### Resumen:
- **✅ Conectadas y funcionales:** 16 (44%)
- **⚠️ Componente existe, falta conectar:** 6 (17%)
- **❌ No existe, hay que crear:** 12 (33%)
- **✅ No necesarias (reemplazadas):** 2 (6%)

---

## 3. FUNCIONES TRANSVERSALES (IA, impresión, búsqueda, guardado)

### 3.1 — Inteligencia Artificial

| Función del monolito | Equivalente en siso-appultimo | Estado |
|---------------------|-------------------------------|--------|
| callAI (failover 4 providers) | callAIWithFailover | ✅ Existe |
| generateAIAnalysis (análisis HC) | analyzeHC | ✅ Existe |
| generateAIRestricciones | generateRestrictions | ✅ Existe |
| generateAIRecomendaciones | generateRecommendations | ✅ Existe |
| generateAIReport (epidemiología) | analyzeEpidemiologicalData | ✅ Existe |
| generateAIGeneral (HC general) | — | ❌ FALTA |
| handleAiResumen (resumen en UI) | — | ❌ FALTA conexión a UI |
| aiDxPrincipal (sugerir CIE-10) | — | ❌ FALTA |
| newAIExams (sugerir exámenes) | — | ❌ FALTA |
| AIConfigPanel (config provider) | AIConfigPanel.jsx (10.9KB) | ⚠️ Existe, no conectado |

### 3.2 — Impresión

| Función del monolito | Equivalente | Estado |
|---------------------|-------------|--------|
| openPrintWindow | openPrintWindow (printService.js) | ✅ |
| _generarCertificadoHTMLNormalizado | Existe en printUtils.js | ✅ No conectado a UI |
| _printHCClean (HC completa) | generateHCPrintHTML (printService.js) | ⚠️ Parcial, falta completar |
| printSelectedCerts (batch) | — | ❌ FALTA |
| printIncap (incapacidad) | — | ❌ FALTA |
| printCarnet (carnet trabajador) | — | ❌ FALTA |
| printSection (sección específica) | — | ❌ FALTA |
| _generarCertificadoDesdePortal | — | ❌ FALTA |
| enviarCertificadosMasivo (email) | — | ❌ FALTA |
| PrintStyles (estilos print) | Existe en printService.js | ✅ |
| buildPrintHeader (cabecera) | _ipsDocLeftHtml (printUtils.js) | ✅ |

### 3.3 — Guardado / Exportación

| Función del monolito | Equivalente | Estado |
|---------------------|-------------|--------|
| handleSavePatient | POST /api/write/hc/save | ✅ |
| handleExportData (backup JSON) | — | ❌ FALTA |
| handleImportData (restore JSON) | — | ❌ FALTA |
| exportarSVE | — | ❌ FALTA |
| exportCSV | exportBillsToCSV (billing) | ⚠️ Solo facturación |
| doAutoBackup | — | ❌ FALTA |
| handleManualCloudSave | — | ❌ FALTA |
| RIPS export | generateRIPSBatch (ripsService.js) | ✅ Existe |
| FHIR export | generateFHIRBundle (fhirService.js) | ✅ Existe |
| RDA export | _generarRDA (normativa.js) | ✅ Existe |
| DIAN UBL export | _generarFacturaDIAN_UBL (normativa.js) | ✅ Existe |

---

## 4. INFRAESTRUCTURA (ya implementada)

| Componente | Estado | Detalle |
|-----------|--------|---------|
| Backend Express v5 | ✅ | JWT, Helmet, CORS, rate limiting |
| Auth PBKDF2 + JWT | ✅ | Login real con drcucalon |
| Supabase conectado | ✅ | 383 registros, lectura + escritura |
| AI proxy seguro | ✅ | 4 providers, keys solo en servidor |
| API endpoints lectura | ✅ | patients, companies, users, agenda, bills, doctor, ai-config, audit |
| API endpoints escritura | ✅ | patients/save, hc/save, companies/save, agenda/save, bills/save, delete |
| Admin endpoints | ✅ | reset-password, list users |
| Zustand stores | ✅ | auth, ui, ai |
| React Router | ✅ | 14 rutas con lazy loading |
| useBackendData hook | ✅ | Backend → Supabase direct → localStorage |
| useSaveData hook | ✅ | Backend → Supabase direct → localStorage |
| Deploy config | ✅ | Netlify + Railway ready |

---

## 5. PLAN DE EJECUCIÓN — 8 SPRINTS

### SPRINT 1: HC General + Certificado + Verificación
**Meta: Las 3 funciones médicas core que faltan**

| Paso | Tarea | Componente | Acción |
|------|-------|-----------|--------|
| 1.1 | HC General | GeneralHC.jsx (33KB) | Crear página, conectar, ruta /hc/general |
| 1.2 | Certificado Aptitud | CertificateView.jsx (24KB) | Crear página, conectar, imprimir |
| 1.3 | Verificación HC | Nuevo | Crear página pública /verificar/:codigo |
| 1.4 | Navegación | Layout.jsx | Agregar acceso a HC General y Certificado |
| | **Verificación** | | HC General renderiza, Certificado imprime, Verificación busca |

### SPRINT 2: IA conectada a la UI
**Meta: Todos los botones de IA funcionan**

| Paso | Tarea | Fuente | Acción |
|------|-------|--------|--------|
| 2.1 | Resumen IA en HC Ocupacional | analyzeHC() | Conectar botón → mostrar resultado |
| 2.2 | Diagnóstico CIE-10 sugerido | Extraer de monolito | Crear aiDxPrincipal() |
| 2.3 | Sugerencia de exámenes | Extraer de monolito | Crear newAIExams() |
| 2.4 | IA en HC General | generateAIGeneral | Crear función + conectar |
| 2.5 | AIConfigPanel conectado | AIConfigPanel.jsx (10.9KB) | Conectar a settings |
| | **Verificación** | | Click IA → loading → texto aparece en HC |

### SPRINT 3: Tabs dentro de HC (Adjuntos, Exámenes, Incapacidades)
**Meta: HC tiene todas las tabs del monolito**

| Paso | Tarea | Acción |
|------|-------|--------|
| 3.1 | Tab Adjuntos | Crear AttachmentsTab.jsx — upload Supabase Storage |
| 3.2 | Tab Solicitud Exámenes | Crear ExamRequestTab.jsx — búsqueda CUPS + imprimir |
| 3.3 | Tab Incapacidades | Crear DisabilityTab.jsx — formato oficial + imprimir |
| 3.4 | Integrar tabs | Agregar como tabs dentro de OccupationalHC y GeneralHC |
| | **Verificación** | Adjuntos suben, exámenes se imprimen, incapacidades se generan |

### SPRINT 4: Impresión completa
**Meta: Todos los documentos se imprimen como en ocupasalud**

| Paso | Tarea | Acción |
|------|-------|--------|
| 4.1 | HC impresa completa | Mejorar generateHCPrintHTML con TODAS las secciones |
| 4.2 | Certificados en batch | Seleccionar múltiples pacientes → imprimir batch |
| 4.3 | Incapacidad impresa | Formato oficial |
| 4.4 | Carnet trabajador | printCarnet — formato tarjeta |
| 4.5 | Solicitud exámenes impresa | Formato con membrete |
| 4.6 | Fórmula médica impresa | Prescripción con datos completos |
| | **Verificación** | Cada documento abre ventana de impresión correcta |

### SPRINT 5: Legal + Backup (Habeas Data, exportación)
**Meta: Compliance legal completo**

| Paso | Tarea | Acción |
|------|-------|--------|
| 5.1 | Habeas Data | Crear página /habeas-data — solicitudes ARCO |
| 5.2 | Backup JSON | Exportar todos los datos como JSON descargable |
| 5.3 | Restore JSON | Importar JSON con validación |
| 5.4 | Sync manual | Botón "Sincronizar ahora" en header |
| 5.5 | Auto-backup | Backup automático periódico a Supabase |
| | **Verificación** | Backup se descarga, se restaura, sync funciona |

### SPRINT 6: Módulos secundarios
**Meta: Portafolio, cotizaciones, contabilidad, portal empresa, mensajes, evolución**

| Paso | Tarea | Componente existente |
|------|-------|---------------------|
| 6.1 | Propuestas comerciales | Proposals.jsx (7.5KB) — conectar |
| 6.2 | Cotizaciones | Crear nuevo |
| 6.3 | Portafolio de servicios | Crear nuevo |
| 6.4 | Contabilidad/honorarios | Crear nuevo |
| 6.5 | Perfil IPS | Crear nuevo |
| 6.6 | Portal Empresa | CompanyPortal.jsx (6.1KB) — conectar |
| 6.7 | Evolución clínica | Crear modal |
| 6.8 | Mensajes internos | Crear nuevo |
| 6.9 | Asistencia en agenda | Crear nuevo |
| | **Verificación** | Cada módulo renderiza y funciona |

### SPRINT 7: Super Admin + Multi-org
**Meta: Gestión multi-organización**

| Paso | Tarea | Acción |
|------|-------|--------|
| 7.1 | Panel Super Admin | Crear página /admin — gestión global |
| 7.2 | CRUD organizaciones | Crear, editar, desactivar orgs |
| 7.3 | Aislamiento datos por org | Filtrar datos por orgId |
| 7.4 | Switch de organización | Selector en header |
| | **Verificación** | Crear org → cambiar → datos aislados |

### SPRINT 8: Deploy + QA final
**Meta: App en producción con 100% de funciones**

| Paso | Tarea | Acción |
|------|-------|--------|
| 8.1 | Tests E2E | Login → HC → Guardar → Imprimir |
| 8.2 | Frontend → Netlify | Deploy automático |
| 8.3 | Backend → Railway | Deploy con env vars |
| 8.4 | DNS / dominio | Opcional |
| 8.5 | Monitoreo (Sentry) | Opcional |
| 8.6 | README final | Documentación completa |
| | **Verificación** | App accesible por internet, todo funciona |

---

## 6. REGLAS INQUEBRANTABLES

1. **NUNCA tocar el repositorio ocupasalud** — es solo referencia de lectura
2. **NUNCA romper lo que ya funciona** — cada sprint es aditivo
3. **NUNCA poner credenciales en el código fuente** — solo en .env (gitignored)
4. **Build con 0 errores** después de cada sprint
5. **Commit + push** después de cada sprint exitoso
6. **Si un componente ya existe**, conectarlo — no reescribirlo
7. **Verificación en browser** al final de cada sprint
8. **Los datos de Supabase NUNCA se pierden**

---

## 7. PROGRESO ACTUAL

### Completado:
- ✅ INFRAESTRUCTURA: Backend, JWT, Supabase, stores, router, deploy config
- ✅ SPRINT 1 PARCIAL: HC Ocupacional conectada, PatientList con datos reales
- ✅ IMPRESIÓN PARCIAL: printService.js con HC básica
- ✅ LOGIN REAL: drcucalon / Cucalon2026!
- ✅ ESCRITURA: Guardar HC a Supabase

### Próximo: SPRINT 1 (HC General + Certificado + Verificación)

### Rama: `refactor/v2-clean-start` — 17 commits

---

## 8. MÉTRICAS OBJETIVO

| Métrica | Monolito | Actual (44%) | Objetivo (100%) |
|---------|----------|--------------|-----------------|
| Vistas funcionales | 36 | 16 | 36 |
| Funciones IA en UI | ~9 | 1 (parcial) | 9 |
| Documentos imprimibles | ~8 | 1 (HC básica) | 8 |
| Funciones legal/compliance | 3 | 0 | 3 |
| Build chunks | 1 × 1MB | 19 | 20-25 |
| Core gzip | ~300KB | 73KB | <80KB |
| Backend endpoints | 0 | 12 | 20+ |
| Tests E2E | 0 | 0 | 10+ |

