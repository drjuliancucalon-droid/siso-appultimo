# PROTOCOLO DEFINITIVO: REFACTORIZACIÓN OCUPASALUD → SISO-APPULTIMO
## Versión 2.0 — Consolidado 2026-04-15
## Integra: Protocolo original (5 fases) + Auditoría de funciones (36 vistas) + Progreso actual

---

## PRINCIPIOS RECTORES
1. Repositorio `ocupasalud` es INTOCABLE — solo referencia de lectura
2. Todo se ejecuta sobre `siso-appultimo`, rama `refactor/v2-clean-start`
3. CERO RIESGO — cada paso funcional antes del siguiente
4. Build con 0 errores después de cada paso
5. NUNCA poner credenciales en código fuente
6. Los datos de Supabase NUNCA se pierden
7. La normativa colombiana se respeta siempre

---

## FASE 0: PREPARACIÓN ✅ COMPLETADA
| Paso | Tarea | Estado | Commit |
|------|-------|--------|--------|
| 0.1 | Limpiar repo (.vite, dist, monolito 1.6MB, contexts rotos) | ✅ | 48ea6a1 |
| 0.2 | Crear rama refactor/v2-clean-start | ✅ | — |
| 0.3 | .gitignore actualizado, .env.example creado | ✅ | 48ea6a1 |

---

## FASE 1: BACKEND REAL ✅ COMPLETADA
| Paso | Tarea | Estado | Commit |
|------|-------|--------|--------|
| 1.1 | Express v5 + Helmet + CORS + rate limiting | ✅ | 831dd87 |
| 1.2 | Auth JWT (login PBKDF2, refresh, requireAuth, requireRole) | ✅ | 831dd87 |
| 1.3 | Endpoints lectura (patients, companies, users, agenda, bills, doctor, ai-config, audit) | ✅ | 3539c3a |
| 1.4 | Endpoints escritura (save patient, HC, company, agenda, bill, delete) | ✅ | b813b2f |
| 1.5 | AI proxy seguro (4 providers, keys solo en servidor) | ✅ | 831dd87 |
| 1.6 | Admin endpoints (reset password) | ✅ | bfa8ff8 |
| 1.7 | Supabase conectado (383 registros, 162 pac, 26 emp) | ✅ | ec52cd0 |
| 1.8 | Login real verificado (drcucalon / Cucalon2026!) | ✅ | bfa8ff8 |
| | **Pendiente Fase 1:** | | |
| 1.9 | Storage seguro (upload/download archivos) | ❌ PENDIENTE | |
| 1.10 | Endpoint POST /api/auth/register (crear usuarios) | ❌ PENDIENTE | |
| 1.11 | Endpoint POST /api/auth/verify-2fa (TOTP) | ❌ PENDIENTE | |

---

## FASE 2: FRONTEND FUNDAMENTOS ✅ COMPLETADA (parcial)
| Paso | Tarea | Estado | Commit |
|------|-------|--------|--------|
| 2.1 | React Router con 17 rutas + lazy loading | ✅ | cc1ed47 |
| 2.2 | Zustand stores (auth, ui, ai) | ✅ | cc1ed47 |
| 2.3 | API client con JWT auto-attach + refresh | ✅ | cc1ed47 |
| 2.4 | Layout horizontal (header + tabs, idéntico a ocupasalud) | ✅ | f5b2d43 |
| 2.5 | Paleta emerald/teal | ✅ | d11c32e |
| 2.6 | useBackendData hook (backend → Supabase direct → localStorage) | ✅ | 3539c3a |
| 2.7 | useSaveData hook (guardar con fallback) | ✅ | b813b2f |
| 2.8 | Deploy config (Netlify, headers, favicon) | ✅ | 0be4d00 |
| | **Pendiente Fase 2:** | | |
| 2.9 | Migrar a TypeScript | ❌ PENDIENTE (futuro) |
| 2.10 | Tailwind CSS instalación local (no CDN) | ❌ PENDIENTE (futuro) |
| 2.11 | Vitest + React Testing Library | ❌ PENDIENTE (futuro) |

---

## FASE 3: CONECTAR LAS 36 VISTAS DEL MONOLITO

### Inventario completo — estado de cada vista:

#### GRUPO A: Conectadas y funcionales (16/36) ✅
| # | Vista monolito | Componente | Ruta | Datos reales |
|---|---------------|-----------|------|-------------|
| 1 | renderLogin | LoginPage.jsx | /login | ✅ JWT |
| 2 | renderNavbar | Layout.jsx | — | ✅ |
| 3 | renderDashboard | DashboardPage.jsx | /dashboard | ✅ 162 pac, 26 emp |
| 4 | renderHistoriaOcupacional | HistoriaPage.jsx → OccupationalHC.jsx | /hc/new | ✅ Guardar + Imprimir |
| 5 | renderPatients | PatientsPage.jsx → PatientList.jsx | /patients | ✅ 162 pacientes |
| 6 | renderCompanies | CompaniesPage.jsx → CompanyList.jsx | /companies | ✅ 26 empresas |
| 7 | renderUsers | UsersPage.jsx → UserList.jsx | /users | ✅ 4 usuarios |
| 8 | renderAgenda | AgendaPage.jsx → AgendaView.jsx | /agenda | ✅ |
| 9 | renderBill | BillingPage.jsx → BillGenerator.jsx | /billing | ✅ |
| 10 | renderCaja | CajaPage.jsx → CashBox.jsx | /caja | ✅ |
| 11 | renderPlanes | PlanesPage.jsx → LicenseManager.jsx | /planes | ✅ |
| 12 | renderTelemedicina | TelemedicinePage.jsx → VideoConsult.jsx | /telemedicine | ✅ |
| 13 | renderPortalTrabajador | WorkerPortalPage.jsx → WorkerPortal.jsx | /portal/:code | ✅ |
| 14 | renderReporte | ReportsPage.jsx → AnalyticsDashboard.jsx | /reports | ✅ |
| 15 | renderCurrentView | App.jsx (React Router) | — | ✅ Reemplazado |
| 16 | renderCell | — | — | ✅ No necesario |

#### GRUPO B: Componente existe, falta conectar página + ruta (6/36) — SPRINT 1
| # | Vista monolito | Componente existente | Página necesaria | Ruta |
|---|---------------|---------------------|-----------------|------|
| 17 | renderHistoriaGeneral | GeneralHC.jsx (33KB) | HistoriaGeneralPage.jsx | /hc/general |
| 18 | renderCertificado | CertificateView.jsx (24KB) | CertificadoPage.jsx | /patients/:id/certificado |
| 19 | renderARL | ARLReports.jsx (6.6KB) | Integrar en ReportsPage | /reports (tab) |
| 20 | renderSVE | SVEPrograms.jsx + EpidemiologicalReport.jsx | Integrar en ReportsPage | /reports (tab) |
| 21 | renderPropuestas | Proposals.jsx (7.5KB) | Integrar en BillingPage | /billing (tab) |
| 22 | renderPortalEmpresa | CompanyPortal.jsx (6.1KB) | PortalEmpresaPage.jsx | /portal-empresa |

#### GRUPO C: No existe, hay que crear (14/36) — SPRINTS 2-6
| # | Vista monolito | Componente a crear | Ruta | Sprint |
|---|---------------|-------------------|------|--------|
| 23 | renderVerification | VerificacionPage.jsx | /verificar | 1 |
| 24 | renderHabeasData | HabeasDataPage.jsx | /habeas-data | 3 |
| 25 | renderTabAdjuntos | AttachmentsTab.jsx | Tab dentro de HC | 2 |
| 26 | renderTabSolicitudExamenes | ExamRequestTab.jsx | Tab dentro de HC | 2 |
| 27 | renderTabIncapacidadGeneral | DisabilityTab.jsx | Tab dentro de HC | 2 |
| 28 | renderPortafolio | PortafolioPage.jsx | /portafolio | 4 |
| 29 | renderCotizaciones | CotizacionesPage.jsx | /cotizaciones | 4 |
| 30 | renderCotizacionesInline | Integrar en CotizacionesPage | — | 4 |
| 31 | renderContabilidad | ContabilidadPage.jsx | /contabilidad | 4 |
| 32 | renderPerfilIPS | PerfilIPSPage.jsx | /config/ips | 4 |
| 33 | renderSuperAdmin | SuperAdminPage.jsx | /admin | 5 |
| 34 | renderEvolucionModal | EvolucionModal.jsx | Modal en HC | 4 |
| 35 | renderMensajesOverlay | MensajesPage.jsx | /mensajes | 5 |
| 36 | renderAsistenciaAgenda | Integrar en AgendaPage | /agenda (tab) | 4 |

---

### FUNCIONES TRANSVERSALES — Estado y plan:

#### IA (9 funciones)
| Función | Estado | Sprint |
|---------|--------|--------|
| callAIWithFailover | ✅ Existe en aiAnalysis.js | — |
| analyzeHC (resumen HC ocupacional) | ✅ Existe, falta conectar a botón UI | 2 |
| generateRestrictions | ✅ Existe, falta conectar a botón UI | 2 |
| generateRecommendations | ✅ Existe, falta conectar a botón UI | 2 |
| analyzeEpidemiologicalData | ✅ Existe | — |
| generateAIGeneral (HC general) | ❌ Crear | 2 |
| aiDxPrincipal (sugerir CIE-10) | ❌ Crear | 2 |
| newAIExams (sugerir exámenes) | ❌ Crear | 2 |
| AIConfigPanel conectado a settings | ⚠️ Existe, no conectado | 2 |

#### Impresión (9 funciones)
| Función | Estado | Sprint |
|---------|--------|--------|
| openPrintWindow | ✅ Existe en printService.js | — |
| generateHCPrintHTML | ✅ Existe, parcial | 3 |
| _generarCertificadoHTMLNormalizado | ✅ Existe en printUtils.js | 1 |
| _printHCClean (HC completa todas secciones) | ❌ Completar | 3 |
| printSelectedCerts (batch) | ❌ Crear | 3 |
| printIncap (incapacidad) | ❌ Crear | 3 |
| printCarnet (carnet trabajador) | ❌ Crear | 3 |
| _generarCertificadoDesdePortal | ❌ Crear | 3 |
| enviarCertificadosMasivo (email) | ❌ Crear | 5 |

#### Guardado/Exportación (10 funciones)
| Función | Estado | Sprint |
|---------|--------|--------|
| handleSavePatient / hc/save | ✅ Backend endpoint | — |
| RIPS export (generateRIPSBatch) | ✅ Existe en ripsService.js | — |
| FHIR export (generateFHIRBundle) | ✅ Existe en fhirService.js | — |
| RDA export (_generarRDA) | ✅ Existe en normativa.js | — |
| DIAN UBL (_generarFacturaDIAN_UBL) | ✅ Existe en normativa.js | — |
| exportBillsToCSV | ✅ Existe en billingService.js | — |
| handleExportData (backup JSON completo) | ❌ Crear | 3 |
| handleImportData (restore JSON) | ❌ Crear | 3 |
| doAutoBackup (periódico) | ❌ Crear | 3 |
| handleManualCloudSave (sync) | ❌ Crear | 3 |

---

## PLAN DE EJECUCIÓN — 6 SPRINTS RESTANTES

### SPRINT 1: Conectar componentes existentes (GRUPO B)
**Meta: 6 componentes ya escritos → conectarlos a páginas y rutas**
**Riesgo: BAJO — no se crea código nuevo, solo se conecta**

| Paso | Tarea | Acción |
|------|-------|--------|
| 1.1 | HC General | HistoriaGeneralPage.jsx → GeneralHC.jsx + ruta /hc/general ✅ HECHO |
| 1.2 | Certificado | CertificadoPage.jsx → CertificateView.jsx + ruta + imprimir ✅ HECHO |
| 1.3 | Verificación HC | VerificacionPage.jsx (pública) + ruta /verificar ✅ HECHO |
| 1.4 | ARL en Reportes | Integrar ARLReports.jsx como tab en ReportsPage |
| 1.5 | SVE en Reportes | Integrar SVEPrograms.jsx + EpidemiologicalReport.jsx en ReportsPage |
| 1.6 | Propuestas en Facturación | Integrar Proposals.jsx como tab en BillingPage |
| 1.7 | Portal Empresa | PortalEmpresaPage.jsx → CompanyPortal.jsx + ruta |
| **Test** | Cada componente renderiza y muestra datos | Build 0 errores |

### SPRINT 2: IA + Tabs HC (funciones core médicas)
**Meta: Todos los botones de IA funcionan + tabs de adjuntos/exámenes/incapacidades**
**Riesgo: MEDIO**

| Paso | Tarea | Acción |
|------|-------|--------|
| 2.1 | Conectar IA a botones en HC Ocupacional | analyzeHC → mostrar en UI |
| 2.2 | Conectar IA a botones en HC General | generateAIGeneral → crear + conectar |
| 2.3 | Diagnóstico CIE-10 sugerido por IA | aiDxPrincipal → extraer de monolito |
| 2.4 | Sugerencia de exámenes por IA | newAIExams → extraer de monolito |
| 2.5 | AIConfigPanel en settings | Conectar panel de configuración de IA |
| 2.6 | Tab Adjuntos en HC | AttachmentsTab.jsx → upload Supabase Storage |
| 2.7 | Tab Solicitud Exámenes en HC | ExamRequestTab.jsx → búsqueda CUPS + imprimir |
| 2.8 | Tab Incapacidades en HC | DisabilityTab.jsx → formato oficial + imprimir |
| **Test** | Click IA → loading → resultado; Upload → lista; Imprimir exámenes | |

### SPRINT 3: Impresión completa + Backup/Restore + Habeas Data
**Meta: Todos los documentos se imprimen + compliance legal**
**Riesgo: BAJO**

| Paso | Tarea | Acción |
|------|-------|--------|
| 3.1 | HC impresa completa (todas las secciones) | Mejorar generateHCPrintHTML |
| 3.2 | Certificados en batch | Seleccionar pacientes → imprimir batch |
| 3.3 | Incapacidad impresa | Formato oficial |
| 3.4 | Carnet trabajador | printCarnet → formato tarjeta |
| 3.5 | Solicitud exámenes impresa | Formato membrete |
| 3.6 | Fórmula médica impresa | Prescripción completa |
| 3.7 | Habeas Data | HabeasDataPage.jsx → solicitudes ARCO (Ley 1581/2012) |
| 3.8 | Backup JSON | Exportar todos los datos descargable |
| 3.9 | Restore JSON | Importar con validación |
| 3.10 | Sync manual | Botón "Sincronizar ahora" en header |
| **Test** | Cada documento imprime; backup descarga/restaura; Habeas Data funciona | |

### SPRINT 4: Módulos secundarios
**Meta: Portafolio, cotizaciones, contabilidad, perfil IPS, evolución, asistencia**
**Riesgo: BAJO**

| Paso | Tarea |
|------|-------|
| 4.1 | Cotizaciones (crear + imprimir) |
| 4.2 | Portafolio de servicios IPS |
| 4.3 | Contabilidad / honorarios médico |
| 4.4 | Perfil IPS (datos, logo, sedes) |
| 4.5 | Evolución clínica (modal de seguimiento) |
| 4.6 | Asistencia en agenda |
| **Test** | Cada módulo renderiza y funciona |

### SPRINT 5: Admin avanzado + Comunicaciones
**Meta: Super Admin, mensajes, email masivo**
**Riesgo: MEDIO**

| Paso | Tarea |
|------|-------|
| 5.1 | Super Admin (gestión multi-org) |
| 5.2 | Mensajes internos entre usuarios |
| 5.3 | Envío masivo de certificados por email |
| 5.4 | Portal empresa con login propio |
| **Test** | Multi-org funciona, mensajes se envían |

### SPRINT 6: Deploy + QA final
**Meta: App en producción con 100% de funciones**
**Riesgo: BAJO**

| Paso | Tarea |
|------|-------|
| 6.1 | Tests E2E (Login → HC → Guardar → Imprimir) |
| 6.2 | Frontend → Netlify |
| 6.3 | Backend → Railway |
| 6.4 | Variables de entorno en producción |
| 6.5 | README final con todas las funciones |
| 6.6 | Migración TypeScript (opcional, futuro) |
| 6.7 | Tailwind local (opcional, futuro) |
| **Test** | App accesible por internet, todo funciona |

---

## MÉTRICAS OBJETIVO

| Métrica | Monolito | Actual (50%) | Objetivo (100%) |
|---------|----------|--------------|-----------------|
| Vistas funcionales | 36 | 19 | 36 |
| Funciones IA en UI | 9 | 1 (parcial) | 9 |
| Documentos imprimibles | 8 | 2 | 8 |
| Legal/compliance | 3 | 0 | 3 |
| Backend endpoints | 0 | 14 | 25+ |
| Build chunks | 1 × 1MB | 21 | 25+ |
| Core gzip | ~300KB | 73KB | <80KB |

---

## PROGRESO: 19 commits en refactor/v2-clean-start

```
c008fca feat: SPRINT 1 — HC General + Certificado + Verificación HC
aea18a7 docs: protocolo maestro + auditorías en docs/
5d80c50 docs: add PROTOCOLO MAESTRO + AUDITORIA to repo  
0be4d00 chore: FASE 5 — deploy config, favicon, README
2806386 fix: PatientList field mapping (nombres/docNumero)
bfa8ff8 feat: print system + password reset + real JWT login
b813b2f feat: WRITE endpoints + save HC to Supabase
b01981a feat: connect ALL pages + wire OccupationalHC
50da2fb fix: login always works (backend + local fallback)
c125d74 feat: Supabase direct fallback — real data in browser
3539c3a feat: FASE 3 — connect pages to real Supabase data
ec52cd0 feat: connect frontend to backend — real auth + JWT
f5b2d43 style: replicate ocupasalud horizontal layout
d11c32e style: apply emerald/teal color scheme
296cec7 feat: wire pages to modules with proper props
831dd87 feat: FASE 1 — Backend Express con auth JWT + AI proxy
7f49606 fix: correct named imports + successful build
cc1ed47 feat: FASE 2 — App shell + Router + Zustand
48ea6a1 chore: FASE 0 — limpieza total del repo
```

---

## SIGUIENTE ACCIÓN: SPRINT 1 pasos 1.4-1.7
(1.1-1.3 ya completados: HC General, Certificado, Verificación)

