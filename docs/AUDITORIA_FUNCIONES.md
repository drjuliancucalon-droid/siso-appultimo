# AUDITORÍA: Funciones del monolito ocupasalud vs siso-appultimo
## Fecha: 2026-04-15 13:00

---

## MONOLITO: 36 render functions, 54 handlers, ~20 AI functions, ~23 print functions

## COMPARACIÓN DETALLADA

### ✅ FUNCIONES IMPLEMENTADAS (existen en módulos de siso-appultimo)

| Render del monolito | Módulo en siso-appultimo | Estado |
|---------------------|--------------------------|--------|
| renderLogin | modules/auth/components/LoginForm.jsx | ✅ Funcional |
| renderDashboard | pages/DashboardPage.jsx | ✅ Con datos reales |
| renderHistoriaOcupacional | modules/clinical/components/OccupationalHC.jsx (79KB) | ✅ Renderiza |
| renderPatients | modules/patients/components/PatientList.jsx | ✅ 162 pacientes |
| renderCompanies | modules/companies/components/CompanyList.jsx + CompanyForm.jsx | ✅ 26 empresas |
| renderUsers | modules/users/components/UserList.jsx + UserForm.jsx | ✅ 4 usuarios |
| renderAgenda | modules/agenda/components/AgendaView.jsx + QueueManager.jsx | ✅ Renderiza |
| renderBill | modules/billing/components/BillGenerator.jsx | ✅ Renderiza |
| renderCaja | modules/billing/components/CashBox.jsx | ✅ Renderiza |
| renderPlanes | modules/users/components/LicenseManager.jsx | ✅ Renderiza |
| renderTelemedicina | modules/telemedicine/components/VideoConsult.jsx | ✅ Renderiza |
| renderPortalTrabajador | modules/patients/components/WorkerPortal.jsx | ✅ Renderiza |
| renderReporte | modules/reports/components/AnalyticsDashboard.jsx | ✅ Renderiza |
| renderARL | modules/reports/components/ARLReports.jsx | ✅ Existe |
| renderSVE | modules/reports/components/SVEPrograms.jsx + EpidemiologicalReport.jsx | ✅ Existe |
| renderNavbar | app/Layout.jsx (header + tabs) | ✅ Funcional |

### 🔴 FUNCIONES QUE FALTAN (existen en monolito, NO implementadas en siso-appultimo)

| Render del monolito | Qué hace | Impacto |
|---------------------|----------|---------|
| **renderHistoriaGeneral** | HC General (no ocupacional) — formulario completo | 🔴 ALTO — es otro tipo de HC |
| **renderCertificado** | Vista de certificado de aptitud para imprimir | 🔴 ALTO — documento médico oficial |
| **renderVerification** | Verificación de HC por código externo | 🟠 MEDIO — portal público |
| **renderHabeasData** | Panel de solicitudes de Habeas Data (Ley 1581/2012) | 🟠 MEDIO — obligatorio por ley |
| **renderTabAdjuntos** | Tab de adjuntos/paraclínicos dentro de la HC | 🟠 MEDIO — upload de exámenes |
| **renderTabSolicitudExamenes** | Solicitud de exámenes paraclínicos | 🟠 MEDIO — flujo médico |
| **renderTabIncapacidadGeneral** | Generación de incapacidades | 🟠 MEDIO — documento oficial |
| **renderPropuestas** | Generación de propuestas comerciales | 🟡 BAJO — módulo billing |
| **renderPortafolio** | Portafolio de servicios de la IPS | 🟡 BAJO — catálogo |
| **renderCotizaciones** | Sistema de cotizaciones | 🟡 BAJO — módulo billing |
| **renderCotizacionesInline** | Cotizaciones inline en facturación | 🟡 BAJO |
| **renderContabilidad** | Módulo de contabilidad/honorarios | 🟡 BAJO |
| **renderPerfilIPS** | Perfil de la IPS (datos, logo, sedes) | 🟡 BAJO |
| **renderSuperAdmin** | Panel de super admin (multi-org) | 🟡 BAJO |
| **renderPortalEmpresa** | Portal para admin de empresa | 🟡 BAJO |
| **renderEvolucionModal** | Modal de evolución clínica | 🟡 BAJO |
| **renderMensajesOverlay** | Sistema de mensajes internos | 🟡 BAJO |
| **renderAsistenciaAgenda** | Control de asistencia en agenda | 🟡 BAJO |
| **renderCurrentView** | Switch central de vistas (ya reemplazado por Router) | ✅ No necesario |
| **renderCell** | Helper de celdas (utilidad interna) | ✅ No necesario |

### 🔴 HANDLERS/FUNCIONES DE IA QUE FALTAN

| Función | Qué hace | Estado en siso-appultimo |
|---------|----------|--------------------------|
| **callAI** | Llamada principal a IA con failover | ✅ Existe en aiAnalysis.js |
| **generateAIAnalysis** | Análisis completo de HC | ✅ Existe (analyzeHC) |
| **generateAIRestricciones** | Generar restricciones con IA | ✅ Existe (generateRestrictions) |
| **generateAIRecomendaciones** | Generar recomendaciones con IA | ✅ Existe (generateRecommendations) |
| **generateAIGeneral** | Análisis IA para HC General | 🔴 FALTA — no hay equivalente para HC General |
| **generateAIReport** | Reporte epidemiológico con IA | ✅ Existe (analyzeEpidemiologicalData) |
| **handleAiResumen** | Resumen inteligente de HC | 🔴 FALTA — no conectado a UI |
| **aiDxPrincipal** | Sugerencia de diagnóstico CIE-10 con IA | 🔴 FALTA |
| **newAIExams** | Sugerencia de exámenes paraclínicos con IA | 🔴 FALTA |

### 🔴 FUNCIONES DE IMPRESIÓN QUE FALTAN

| Función | Qué hace | Estado |
|---------|----------|--------|
| **openPrintWindow** | Abrir ventana de impresión | ✅ Existe en printService.js |
| **_printHCClean** | Imprimir HC limpia | 🔴 FALTA — función específica del monolito |
| **printSelectedCerts** | Imprimir certificados seleccionados en batch | 🔴 FALTA |
| **printIncap** | Imprimir incapacidad | 🔴 FALTA |
| **openPrintCotiz** | Imprimir cotización | 🔴 FALTA |
| **printCarnet** | Imprimir carnet del trabajador | 🔴 FALTA |
| **printSection** | Imprimir sección específica | 🔴 FALTA |
| **_generarCertificadoDesdePortal** | Certificado desde portal público | 🔴 FALTA |
| **enviarCertificadosMasivo** | Envío masivo de certificados por email | 🔴 FALTA |

### 🔴 FUNCIONES DE BÚSQUEDA/FILTRO QUE FALTAN

| Función | Qué hace | Estado |
|---------|----------|--------|
| **_buscarCUPS** | Autocompletado CUPS | ✅ Existe en shared/data/cups.js |
| **_buscarCIE10** | Autocompletado CIE-10 | ✅ Existe en shared/data/cie10.js |
| **selectPatientSuggestion** | Seleccionar paciente de sugerencias | ✅ Implementado en HistoriaPage |
| **handleNameChange** | Buscar pacientes mientras escribe | ✅ Implementado en HistoriaPage |

### 🔴 FUNCIONES DE SAVE/EXPORT QUE FALTAN

| Función | Qué hace | Estado |
|---------|----------|--------|
| **handleExportData** | Exportar backup JSON completo | 🔴 FALTA |
| **handleImportData** | Importar backup JSON | 🔴 FALTA |
| **exportarSVE** | Exportar datos SVE | 🔴 FALTA |
| **exportCSV** | Exportar a CSV | 🔴 FALTA (billingService tiene exportBillsToCSV pero no conectado) |
| **doAutoBackup** | Backup automático periódico | 🔴 FALTA |
| **handleManualCloudSave** | Sincronización manual a la nube | 🔴 FALTA |

---

## RESUMEN EJECUTIVO

### Lo que SÍ tiene siso-appultimo (funcional):
- ✅ 16 de 36 render functions (44%)
- ✅ Login, Dashboard, Pacientes, Empresas, HC Ocupacional, Agenda, Facturación, Caja
- ✅ Reportes, SG-SST, Telemedicina, Usuarios, Planes, Portal Trabajador
- ✅ Backend con JWT, AI proxy, escritura a Supabase
- ✅ Datos reales (162 pac, 26 emp)

### Lo que FALTA (por prioridad):

#### PRIORIDAD ALTA (funcionalidad core médica):
1. **HC General** (renderHistoriaGeneral) — segundo tipo de HC
2. **Certificado de Aptitud** (renderCertificado) — documento oficial
3. **Resumen IA conectado a UI** — botón existe pero no hace nada útil aún
4. **Sugerencia de diagnóstico IA** (aiDxPrincipal)
5. **Tab de Adjuntos** (paraclínicos) — upload de exámenes
6. **Incapacidades** (renderTabIncapacidadGeneral)
7. **Solicitud de Exámenes** (renderTabSolicitudExamenes)

#### PRIORIDAD MEDIA (legal/compliance):
8. **Habeas Data** (Ley 1581/2012 — obligatorio)
9. **Verificación de HC** por código externo
10. **Backup/Restore** completo (exportar/importar JSON)
11. **Impresión de certificados en batch**
12. **Impresión de incapacidades**
13. **Impresión de carnet trabajador**

#### PRIORIDAD BAJA (mejoras):
14. Propuestas comerciales
15. Cotizaciones
16. Portafolio de servicios
17. Contabilidad/honorarios
18. Perfil IPS
19. Super Admin (multi-org)
20. Portal Empresa
21. Evolución clínica modal
22. Mensajes internos

