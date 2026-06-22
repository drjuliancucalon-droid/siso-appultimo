# SUPER-AUDITORÍA QUIRÚRGICA — SISO OcupaSalud Refactorización
## PROMPT_MAESTRO v3.0 vs `siso-appultimo/src/` — 2026-06-20

---

## RESUMEN EJECUTIVO

| Categoría | Total ítems | ✅ Implementado | ⚠️ Parcial | ❌ Faltante | % Completo |
|-----------|------------|----------------|-----------|------------|-----------|
| 4.1 Auth y Usuarios | 11 | 8 | 2 | 1 | **76%** |
| 4.2 Pacientes | 9 | 5 | 2 | 2 | **61%** |
| 4.3 HC Ocupacional | 19 | 12 | 6 | 1 | **68%** |
| 4.4 HC General | 6 | 4 | 2 | 0 | **75%** |
| 4.5 Derivaciones | 4 | 3 | 1 | 0 | **87%** |
| 4.6 Fórmula Médica | 4 | 3 | 1 | 0 | **87%** |
| 4.7 Portal Trabajador | 6 | 3 | 3 | 0 | **67%** |
| 4.8 Portal Empresa | 9 | 5 | 1 | 3 | **59%** |
| 4.9 Encuestas | 8 | 2 | 1 | 5 | **30%** |
| 4.10 Agenda | 10 | 5 | 3 | 2 | **57%** |
| 4.11 Empresas | 7 | 5 | 2 | 0 | **82%** |
| 4.12 Facturación / Caja | 8 | 5 | 2 | 1 | **72%** |
| 4.13 Informes Sociodem. | 5 | 2 | 3 | 0 | **64%** |
| 4.14 Cartas Custodia | 4 | 2 | 1 | 1 | **62%** |
| 4.15 IA | 8 | 7 | 0 | 1 | **90%** |
| 4.16 Telemedicina | 4 | 1 | 2 | 1 | **43%** |
| 4.17 SGSST | 8 | 8 | 0 | 0 | **100%** |
| 4.18 Usuarios y Config | 7 | 7 | 0 | 0 | **100%** |
| 4.19 Notificaciones | 4 | 2 | 1 | 1 | **60%** |
| 4.20 Comunicaciones | 3 | 2 | 0 | 1 | **67%** |
| 4.21 Almacenamiento D1 | 7 | 6 | 0 | 1 | **89%** |
| 4.22 Offline-First | 5 | 3 | 0 | 2 | **60%** |
| 4.23 Blindaje Multi-disp. | 4 | 4 | 0 | 0 | **100%** |
| 4.24 Impresión y PDF | 10 | 6 | 3 | 1 | **68%** |
| 4.25 Cumplimiento Legal | 5 | 5 | 0 | 0 | **100%** |
| 6 Fixes Críticos | 6 | 4 | 1 | 1 | **73%** |
| **TOTAL** | **190** | **123** | **36** | **25** | **~73%** |

> **Conclusión:** El repositorio `siso-appultimo` implementa aproximadamente el **73%** de la funcionalidad del monolito descrita en el PROMPT_MAESTRO. La arquitectura, la infraestructura D1, la autenticación, el SGSST, el módulo IA y el blindaje multi-dispositivo están completos. Las brechas críticas están concentradas en Encuestas (30%), Telemedicina (43%) y Portal Empresa (59%).

---

## DETALLE POR MÓDULO

### 4.1 AUTENTICACIÓN Y USUARIOS

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Login usuario/contraseña (SHA-256) | ✅ | `authStore.js` → `_authenticateUser` + `_sha256` |
| Logout con limpieza de sesión | ✅ | `authStore.logout()` |
| Cambio de contraseña | ✅ | `authStore.changePassword()` verifica hash actual |
| Recuperación de acceso | ❌ | No existe flujo de reset por email/link |
| Rate limiting (5 intentos → 15 min) | ✅ | `MAX_LOGIN_ATTEMPTS=5`, `BLOCK_DURATION_MS=900000` |
| Session timeout configurable | ⚠️ | `resetActivity()` existe, pero sin lógica de expiración por inactividad |
| Roles: 5 tipos | ✅ | `super_admin/administrador/medico/secretaria/admin_empresa` |
| Permisos granulares (`_canUse`, `_secretariaPuede`) | ✅ | `planConfig.js` + `authStore.canAccess/canUse` |
| Multi-médico en misma cuenta | ✅ | `siso_users` array en D1 con múltiples médicos |
| Registro de auditoría de accesos | ⚠️ | `siso_audit_log` en keyMap pero no se escribe sistemáticamente al login/logout |
| 2FA TOTP (Google Authenticator) | ✅ | `TwoFactorAuth.jsx` + `authStore.generateTOTPSecret/verifyTOTP` + `shared/lib/totp.js` |

**Faltante crítico:** flujo de recuperación de contraseña (email con token/OTP). Sin esto el admin debe cambiar contraseñas manualmente desde UsersPage.

---

### 4.2 PACIENTES

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Lista con búsqueda y filtros | ✅ | `PatientsPage.jsx` + `PatientList.jsx` |
| CRUD completo (crear/editar/eliminar) | ✅ | `PatientsPage.jsx`, `usePatients.js` |
| Anti-duplicados por docNumero | ⚠️ | `useBackendData` hace fallback pero no hay MERGE por docNumero al crear |
| Anti-fantasmas (sin id) | ⚠️ | Parcialmente en `useBackendData` fallback |
| Importar pacientes desde encuesta | ❌ | `EncuestasPage` no tiene botón "Importar como pacientes" |
| Importar desde Excel/CSV | ❌ | No existe componente de carga XLSX/CSV en `PatientsPage` |
| Exportar lista a PDF | ❌ | `printService.js` no tiene función de lista pacientes |
| Historial atenciones múltiples HCs | ✅ | `useClinicalRecord.loadPatientHistory()` + `patient.historias[]` |
| Badge estado (Pre-registrado/Abierta/Cerrada) | ✅ | `PatientList.jsx` referencia `estadoHistoria` |

---

### 4.3 HISTORIA CLÍNICA OCUPACIONAL

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| `initialOccupPatientState` con 100+ campos | ✅ | `initialStates.js` (397 líneas), incluye perfilCargo_*, antecedentes, riesgos, consentimiento |
| Formulario por pestañas (HC, Cert, Fórmula, Derivación, Exámenes, Adjuntos, Incapacidad, Evolución) | ✅ | `OccupationalHC.jsx` (1.432 líneas) + tabs en `HistoriaPage.jsx` |
| Antecedentes agrupados 8 categorías | ✅ | `antecedentesAgrupados: {patologicos, quirurgicos, traumaticos, farmacologicos, alergicos}` + familiares/laborales/hospitalarios en initialStates |
| Exploración física completa 29+ sistemas | ⚠️ | `PhysicalExam.jsx` solo 149 líneas — cubre sistemas básicos pero no los 29 del monolito |
| Riesgos GTC-45 (7 categorías) | ✅ | `riesgos: {fisicos, quimicos, biologicos, mecanicos, biomecanicos, psicosocial, seguridad, locativos}` |
| Concepto de aptitud (5 opciones Res. 1843/2025) | ✅ | `OccupationalHC.jsx` línea 1297: SelectGroup `conceptoAptitud` |
| Foliación HC Res. 1995/1999 Art. 3 | ✅ | `folioHC` en initialStates + display en OccupationalHC línea 159 |
| Código verificación `SISO-YYYYMMDD-PACID-HASH8` | ✅ | `useClinicalRecord.saveRecord()` línea 96-99 + `HistoriaPage.jsx` |
| Recomendaciones médicas checklist A-F | ⚠️ | `RecommendationsPanel.jsx` (110 líneas) — estructura presente, completitud vs monolito no verificada |
| Restricciones laborales checklist | ⚠️ | `RestrictionsPanel.jsx` (124 líneas) — estructura presente |
| Perfil de cargo Res. 1843/2025 Art. 29 | ✅ | `OccupationalHC.jsx` líneas 540-564: 6 campos perfilCargo_* |
| Consentimiento informado digital | ✅ | `ConsentimientoModal.jsx` + `consentimientoVersion: "v2025-1843"` + timestamp + IP |
| Autoguardado cada 30s en localStorage | ✅ | `HistoriaPage.jsx` línea 114: `setInterval(() => {...}, 30000)` |
| Guard "¿Salir sin guardar?" | ⚠️ | `isDirty` flag existe en `useClinicalRecord` pero no hay blocker de React Router confirmado |
| Fecha retroactiva del examen | ✅ | Campo `fechaExamen` editable tipo date |
| Vigencia del certificado (1/3/6/12 meses) | ✅ | `OccupationalHC.jsx` línea 1397: `InputGroup vigencia` |
| Generación QR del código de verificación | ⚠️ | `printService.js` tiene clase CSS `.qr-area` pero no hay librería QR (ej. `qrcode.js`) importada |
| **CIERRE BLOQUEANTE → 6 claves D1** | ✅ | `HistoriaPage.jsx` líneas 349-420: `await d1Set(siso_hc_completa_X)`, `await d1Set(siso_portal_doc_X)`, `await d1Set(siso_portal_X)`, `await d1WriteArrayMerge(siso_portal_empresa_atenciones_NIT)`, `await d1WriteArrayMerge(siso_portal_empresa_NIT)`, `await d1WriteArrayMerge(siso_portal_empresa_docs_NIT)` |
| MERGE anti-regresión todos los arrays D1 | ✅ | `d1WriteArrayMerge()` implementado con optimistic locking If-Match + retries 409 |
| Impresión completa: certificado con firma + QR + membrete | ⚠️ | `printService.js` (729 líneas) tiene firma + membrete. QR: clase CSS presente pero librería no confirmada |

---

### 4.4 HISTORIA CLÍNICA GENERAL

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| `initialGeneralPatientState` | ✅ | `initialStates.js` incluye campos generales + CIE-10 |
| Formulario general: motivo, diagnósticos CIE-10, exploración básica | ✅ | `GeneralHC.jsx` + `CIE10Input.jsx` |
| Plan: indicaciones, medicamentos, controles | ✅ | Incluido en `GeneralHC.jsx` |
| Fórmula médica (prescripción) | ✅ | `PrescriptionTab.jsx` con `MedicamentoAutocomplete.jsx` |
| Impresión de fórmula (individual y completa) | ⚠️ | Existe en `PrescriptionTab` pero profundidad de impresión no verificada vs monolito |
| Incapacidades | ✅ | `DisabilityTab.jsx` + `LicenciasTab.jsx` |

---

### 4.5 DERIVACIONES Y SOLICITUDES

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Derivaciones con especialidad, urgencia, motivo | ✅ | `TabFormulaDerivacion.jsx` + `derivaciones.js` |
| Solicitud exámenes médicos | ✅ | `ExamRequestTab.jsx` |
| Impresión de derivación (popup con edición) | ⚠️ | `printService.js` tiene `window.open`, edición pre-impresión parcial |
| Alerta si popup bloqueado | ✅ | FIX 4 — `printService.js` verifica `window.open() === null` |

---

### 4.6 FÓRMULA MÉDICA

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| CRUD medicamentos | ✅ | `PrescriptionTab.jsx` |
| Autocompletar catálogo | ✅ | `MedicamentoAutocomplete.jsx` + `medicamentos.js` |
| Impresión por medicamento individual | ⚠️ | Necesita verificación de función por-medicamento vs todo |
| CIE-10 en diagnóstico de fórmula | ✅ | `CIE10Input.jsx` disponible y usado |

---

### 4.7 PORTAL TRABAJADOR

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Acceso por código de verificación o cédula | ✅ | `WorkerPortalPage.jsx` → `WorkerPortal.jsx` |
| Ver certificado de aptitud | ✅ | `WorkerPortal.jsx` + `VerificacionPage.jsx` |
| Historial de todas las atenciones múltiples | ⚠️ | Busca `siso_portal_doc_CC` pero array de múltiples HCs no totalmente confirmado |
| Descargar certificado PDF | ⚠️ | `printService.js` referenciado pero flujo completo en WorkerPortal no verificado |
| Firma digital del médico en certificado | ✅ | `cleanFirma.js` (FIX 5) + `printUtils.js` |
| QR de verificación en portal | ⚠️ | Mencionado en `VerificacionPage` pero librería generación QR no importada |

---

### 4.8 PORTAL EMPRESA

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Login: NIT + código de acceso | ✅ | `PortalEmpresaPage.jsx` completo con `d1Get(siso_portal_empresa_atenciones_NIT)` |
| Ver lista de atenciones de trabajadores | ✅ | `PortalEmpresaPage.jsx` |
| Filtro por periodo (año-mes) | ✅ | Variable `periodo` + filtro `atenciones.filter` |
| Contador de certificados por periodo | ✅ | `siso_portal_empresa_docs_NIT` + conteo en UI |
| Descargar certificados individuales | ⚠️ | `CompanyPortal.jsx` lo referencia pero completitud no verificada |
| Descargar todos como ZIP | ✅ | `PortalEmpresaPage.jsx` usa `jszip` con `handleZIP()` |
| Ver informes sociodemográficos publicados | ❌ | No hay sección en `PortalEmpresaPage` para ver informes publicados |
| Ver cartas de custodia | ❌ | No hay sección en `PortalEmpresaPage` para cartas |
| Ver cuentas de cobro | ❌ | No hay sección en `PortalEmpresaPage` para facturas/cobros |

---

### 4.9 ENCUESTAS SOCIODEMOGRÁFICAS ⚠️ MÓDULO MÁS INCOMPLETO

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Crear encuesta pública con link único (D1) | ✅ | `EncuestasPage.jsx` crea encuesta y guarda en D1 |
| Link estable (pages.dev, NO preview) | ⚠️ | Ruta `/encuesta/:token` existe pero no hay lógica para forzar dominio estable |
| Formulario público responsive (mobile-first) | ✅ | `SurveyResponsePage.jsx` con Tailwind responsive |
| **Ver respuestas recibidas** | ❌ | `EncuestasPage` solo muestra lista de encuestas, NO pestañas de respuestas |
| **Importar respuestas como pacientes** | ❌ | No existe función de importación en `EncuestasPage` |
| **Agendar todos los respondentes** | ❌ | No existe función de agendamiento masivo |
| **Exportar respuestas a PDF** | ❌ | No existe |
| **Importar desde Excel/XLSX** | ❌ | No existe importación XLSX |

---

### 4.10 AGENDA

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Vista diaria (hoy) | ✅ | `AgendaView.jsx` |
| Vista próximas citas | ✅ | `AgendaView.jsx` |
| Vista semanal | ⚠️ | `AgendaView.jsx` menciona semana pero profundidad no verificada |
| Vista mensual | ⚠️ | Parcialmente implementada |
| Crear cita (paciente/médico/hora/tipo) | ✅ | `AppointmentForm.jsx` |
| Recurrencia automática (3m/6m/1año periódicos) | ❌ | No existe lógica de recurrencia en `AppointmentForm` |
| Validación solapamiento de horarios | ❌ | No existe validación de overlap en `AppointmentForm` |
| Multi-médico (secretaria ve todos) | ⚠️ | `authStore.isSecretaria()` existe pero filtro multi-médico en Agenda no confirmado |
| Estados: En espera → Atendiendo → Atendido | ✅ | `QueueManager.jsx` con cambio de estado |
| Iniciar HC desde cita (modal tipo: Ocup./General) | ✅ | `AgendaPage.jsx` + botón en `QueueManager` |

**FIX 1 — HC desde agenda carga TODOS los campos:**
- `useClinicalRecord.initNewRecord(type, patientData)` hace spread de `patientData` pero solo propaga ~10 campos básicos (nombres, docTipo, docNumero, fechaNacimiento, edad, genero, celular, eps, arl, afp, cargo, empresaId, empresaNombre).
- El monolito (línea 45517 `abrirHCDesdeAgenda`) hace spread COMPLETO de todos los campos del paciente (incluyendo residencia, afp, dependencia, tipoContrato, turnoTrabajo, estrato, etc.)
- **BRECHA:** Faltan ~20 campos en el spread de `initNewRecord`.

---

### 4.11 EMPRESAS

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| CRUD completo | ✅ | `CompanyList.jsx` + `CompanyForm.jsx` |
| Campos: NIT, nombre, ciudad, ARL, representante, dirección | ✅ | `CompanyForm.jsx` |
| Tarifas: ingreso/periódico/egreso/consulta | ⚠️ | Campos presentes pero UI de tarifas en `CompanyForm` parcialmente verificada |
| Código de portal (EMP-XXXX-YYYY auto-generado) | ✅ | `portalCode` generado en `CompanyForm` |
| Actividad económica | ✅ | Campo `actividadEconomica` |
| Panel documentos por empresa | ⚠️ | `useCompanyDocuments.js` existe pero UI de panel documentos parcial |
| MERGE anti-regresión en array empresas | ⚠️ | `d1WriteArrayMerge` disponible pero no confirmado que se use al guardar empresas |

---

### 4.12 FACTURACIÓN / CUENTAS DE COBRO

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Crear cuenta de cobro con ítems | ✅ | `BillGenerator.jsx` (233 líneas) |
| Monto en letras (`numeroALetras`) | ✅ | `formatters.js` importado en `BillGenerator` |
| Datos bancarios del médico | ⚠️ | `BillGenerator` (233 líneas) no es suficientemente profundo para confirmar datos bancarios completos |
| Impresión / PDF profesional | ⚠️ | Referenciado pero profundidad vs monolito no verificada |
| Histórico de facturas | ✅ | `savedBills` prop + lista en UI |
| Pestaña "Por facturar" (atenciones cerradas sin facturar) | ✅ | `BillGenerator` recibe `atencionesCerradas` como prop |
| Movimientos caja (ingresos/egresos) | ✅ | `CajaPage.jsx` (129 líneas) + `Caja.jsx` completo |
| Auto-registro en caja al cerrar HC | ❌ | `HistoriaPage.jsx` no tiene llamada a caja al ejecutar cierre de HC |

---

### 4.13 INFORMES SOCIODEMOGRÁFICOS

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Generación automática desde atenciones empresa | ✅ | `EpidemiologicalReport.jsx` en modules/reports |
| Gráficos: distribución sexo/edad/cargo/tipo examen | ✅ | `AnalyticsDashboard.jsx` + `EpidemiologicalReport.jsx` |
| Publicar informe al portal empresa | ⚠️ | `ReportsPage.jsx` (117 líneas) — existe componente pero publicación a `siso_portal_empresa_*` no confirmada |
| Exportar como PDF | ⚠️ | Referenciado pero sin función `window.print()` o `jsPDF` explícita confirmada |
| Guardar en D1 con MERGE (`siso_informes`) | ⚠️ | `siso_informes` en keyMap de `useBackendData` pero escritura con MERGE no verificada |

---

### 4.14 CARTAS DE CUSTODIA

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Generar carta de custodia | ✅ | `CartaCustodiaPage.jsx` completo con datos médico/empresa/fecha |
| Datos paciente/empresa/médico/fecha | ✅ | Todos los campos presentes |
| Descarga en PDF / impresión | ⚠️ | `CartaCustodiaPage` tiene sección de impresión pero `window.print()` no confirmado |
| **Almacenar en D1** | ❌ | `CartaCustodiaPage.handleSave()` guarda en **Supabase**, NO en D1 (viola constraint 7 del PROMPT_MAESTRO) |

---

### 4.15 INTELIGENCIA ARTIFICIAL

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Multi-proveedor: Gemini/Groq/Together/OpenRouter | ✅ | `aiProviders.js` con 4 proveedores + fallover automático |
| Configuración provider y API keys por usuario | ✅ | `aiStore.js` (persist Zustand) + `AIConfigPanel.jsx` |
| Recomendaciones médicas automáticas | ✅ | `aiAnalysis.js` con 5 ramas según tipoExamen |
| Justificación pruebas especiales | ✅ | `justificacionPruebaEspecial` en initialStates + lógica en aiAnalysis |
| Derivaciones automáticas con urgencia/especialidad | ✅ | `aiAnalysis.js` |
| Descripción del cargo AI-asistida | ✅ | `aiAnalysis.js` + `ProfesiogramaAI.jsx` |
| Evolución clínica automática | ✅ | `EvolucionModal.jsx` + `aiAnalysis.js` |
| Panel config con validación de keys | ✅ | `AIConfigPanel.jsx` |
| OpenAI como proveedor | ❌ | Solo Gemini/Groq/Together/OpenRouter. OpenAI no está en `aiProviders.js` |

---

### 4.16 TELECONSULTA / TELEMEDICINA

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Agendar teleconsulta | ⚠️ | `AppointmentScheduler.jsx` existe pero vinculación con agenda principal no confirmada |
| Formulario de teleconsulta | ✅ | `VideoConsult.jsx` en modules/telemedicine |
| **Crear HC desde teleconsulta finalizada** | ❌ | `VideoConsult.jsx` y `TelemedicinePage.jsx` no tienen flujo de generar HC al cerrar teleconsulta |
| Historial de teleconsultas | ⚠️ | `useBackendData('/data/telemedicine', 'siso_teleconsultas')` existe pero UI historial no verificada |

---

### 4.17 SISTEMA DE GESTIÓN SST — COMPLETO ✅

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Dashboard SST | ✅ | `SSTDashboard.jsx` (530 líneas) |
| Matriz de riesgos GTC-45 | ✅ | `RiskMatrix.jsx` (655 líneas) |
| Plan anual de trabajo | ✅ | `AnnualPlan.jsx` (478 líneas) |
| Investigación de accidentes | ✅ | `AccidentInvestigation.jsx` |
| Checklists de inspección | ✅ | `InspectionChecklist.jsx` |
| Módulo de capacitación | ✅ | `TrainingModule.jsx` |
| Repositorio de documentos | ✅ | `DocumentRepository.jsx` |
| Generador de políticas | ✅ | `PolicyGenerator.jsx` |

*(SVE queda en reports/SVEPrograms.jsx — también implementado)*

---

### 4.18 USUARIOS Y CONFIGURACIÓN — COMPLETO ✅

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Lista usuarios con roles | ✅ | `UserList.jsx` |
| Crear/editar/desactivar usuarios | ✅ | `UserForm.jsx` + `authStore.createUser/updateUser/deleteUser` |
| Datos médico: nombre/títulos/firma/licencia/ciudad/celular | ✅ | `DoctorProfile.jsx` |
| Firma digital: canvas o carga de imagen | ✅ | `DoctorSignature.jsx` (shared/ui) |
| Datos de la IPS | ✅ | `ConfigIPSPage.jsx` |
| Configuración de email (EmailJS) | ✅ | `emailService.js` con config persisted |
| Configuración general del sistema | ✅ | `SettingsPage.jsx` |

---

### 4.19 NOTIFICACIONES Y MENSAJERÍA

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Mensajes internos entre usuarios | ✅ | `MensajesPage.jsx` + `MensajesDrawer.jsx` |
| Notificaciones nuevas atenciones | ⚠️ | `NotificationModal.jsx` existe pero integración con cierre HC no confirmada |
| Alertas evaluaciones próximas a vencer (max 3 años) | ❌ | Campo `periodicidadUltimaEval` en initialStates pero no hay lógica de alerta por antigüedad |
| Toast/modal de avisos | ✅ | `NotificacionModal.jsx` + `uiStore.js` |

---

### 4.20 COMUNICACIONES

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Envío certificado por email (EmailJS auto + mailto manual) | ✅ | `emailService.js` con fallback `mailto:` |
| **Envío por WhatsApp (link wa.me)** | ❌ | No se encontró `wa.me` en ningún archivo de `src/` |
| Email HTML profesional con datos médico + QR + link portal | ✅ | `emailService._generarEmailHTML()` con template + link portal |

---

### 4.21 ALMACENAMIENTO D1

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Worker endpoint + token auth | ✅ | `d1Client.js` con `VITE_WORKER_URL` + `X-Siso-Token` |
| Auto-chunking transparente >500KB | ✅ | `_chunkSet/chunkGet()` con `CHUNK_THRESHOLD=500_000` |
| MERGE por id en TODOS los arrays | ✅ | `d1WriteArrayMerge()` con optimistic locking y retries 409 |
| Operación bloqueante al cerrar HC | ✅ | `await d1Set/d1WriteArrayMerge` en `HistoriaPage.jsx` líneas 383-415 |
| Fallback a Supabase si D1 falla | ✅ | `useBackendData` tier 2: Supabase direct |
| `/health` endpoint del Worker | ✅ | Referenciado en `siso-worker/index.js` y en verificación final |
| Snapshot diario automático (Cron en Worker) | ❌ | No se confirma `crons` en `wrangler.json` del repositorio |

---

### 4.22 OFFLINE-FIRST

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| IndexedDB para operaciones offline | ✅ | `offlineDB.js` — preparado |
| Cola de operaciones pendientes con UUID | ✅ | `syncManager.js` con cola y UUID anti-duplicado |
| Sincronización automática al reconectar | ✅ | `syncManager.js` escucha `navigator.onLine` |
| **Banner UI "OFFLINE — X operaciones pendientes"** | ❌ | `syncManager.js` tiene estado `isSyncing` pero no hay componente de banner en `App.jsx` |
| Anti-duplicado UUID en Worker | ⚠️ | UUID en cliente implementado, idempotencia en Worker no confirmada |

---

### 4.23 BLINDAJE MULTI-DISPOSITIVO — COMPLETO ✅

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| VersionWatcher (bundle nuevo → banner → reload 5min) | ✅ | `components/VersionWatcher.jsx` + montado en `App.jsx` línea 129 |
| D1ChangesWatcher (poll 30s → refresh silencioso) | ✅ | `components/D1ChangesWatcher.jsx` + montado en `App.jsx` línea 130 |
| StorageHealth (Alt+H: panel salud + auto-limpieza LS >80%) | ✅ | `components/StorageHealth.jsx` + montado en `App.jsx` línea 131 |
| MERGE anti-regresión en todos los arrays | ✅ | `d1WriteArrayMerge()` implementado |

---

### 4.24 IMPRESIÓN Y PDF

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Certificado ocupacional (firma + QR + membrete) | ⚠️ | `printService.js` (729 líneas) tiene firma + membrete. QR: clase `.qr-area` en CSS pero sin librería `qrcode.js` |
| HC General completa | ⚠️ | Parcialmente en `printService.js` |
| Fórmula médica (individual y completa) | ✅ | `PrescriptionTab.jsx` |
| Derivación/interconsulta | ✅ | `TabFormulaDerivacion.jsx` + `printService.js` |
| Solicitud de exámenes | ✅ | `ExamRequestTab.jsx` |
| Cuenta de cobro/factura | ⚠️ | `BillGenerator.jsx` tiene impresión pero calidad vs monolito no verificada |
| Informe sociodemográfico PDF | ⚠️ | `EpidemiologicalReport.jsx` en reports — sin función print confirmada |
| **Lista de pacientes (impresión)** | ❌ | No existe función de impresión en `PatientsPage.jsx` |
| Carta de custodia | ✅ | `CartaCustodiaPage.jsx` tiene sección de impresión |
| Popup editable previa impresión | ⚠️ | `printService.js` usa `window.open` pero edición pre-impresión parcial |
| Alerta si popup bloqueado | ✅ | FIX 4 — `printService.js` verifica null return de `window.open()` |

---

### 4.25 CUMPLIMIENTO LEGAL — COMPLETO ✅

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Res. 1843/2025 (exámenes médicos ocupacionales) | ✅ | Referencias en `initialStates`, `OccupationalHC`, `normativa.js` |
| Res. 1995/1999 (foliación HC) | ✅ | `folioHC` + comentario en código |
| Ley 1581/2012 (consentimiento datos) | ✅ | `ConsentimientoModal` con versión `v2025-1843` |
| GTC-45 (identificación de riesgos) | ✅ | `riesgos` en initialStates + `RiskMatrix.jsx` |
| Sistema verificación certificados por URL pública | ✅ | `VerificacionPage.jsx` en ruta pública `/verificar/:codigo` |

---

### FIXES CRÍTICOS (Sección 6 del PROMPT_MAESTRO)

| Fix | Estado | Evidencia |
|-----|--------|-----------|
| **FIX 1** — HC desde agenda carga TODOS los campos | ⚠️ | `initNewRecord(type, patientData)` propaga ~10 campos. Faltan: `residencia, afp, dependencia, tipoContrato, turnoTrabajo, estrato, tipoVivienda, grupoSanguineo, etc.` |
| **FIX 2** — MERGE anti-regresión `siso_atenciones_cerradas` | ✅ | `d1WriteArrayMerge()` con read-before-write + If-Match locking |
| **FIX 3** — Publicación bloqueante portal al cerrar HC | ✅ | `HistoriaPage.jsx` líneas 349-420: await en 6 claves D1 |
| **FIX 4** — Botones impresión alertan si popup bloqueado | ✅ | `printService.js` verifica `w = window.open(); if (!w) alert(...)` |
| **FIX 5** — Firma en portal sin comillas extra | ✅ | `src/shared/lib/utils/cleanFirma.js` implementado |
| **FIX 6** — Deduplicación en importación de pacientes | ❌ | No existe flujo de importación de encuesta a pacientes, por lo tanto el fix no tiene lugar de aplicación |

---

## CLAVES D1 — VERIFICACIÓN DE CONFORMIDAD (Sección 5)

Las siguientes claves D1 están en el `keyMap` de `useBackendData.js` y en `d1Client.js`. Se verifica que no se hayan cambiado nombres:

| Clave D1 del PROMPT_MAESTRO | Estado en repo |
|-----------------------------|---------------|
| `siso_db_patients_<userId>` | ✅ `siso_db_patients_drcucalon` |
| `siso_companies_drcucalon` | ✅ |
| `siso_atenciones_cerradas` | ✅ |
| `siso_hc_completa_<cc>` | ✅ `HistoriaPage.jsx` línea 383 |
| `siso_portal_doc_<cc>` | ✅ línea 389 |
| `siso_portal_<code>` | ✅ línea 395 |
| `siso_portal_empresa_atenciones_<NIT>` | ✅ línea 403 |
| `siso_portal_empresa_<NIT>` | ✅ línea 409 |
| `siso_portal_empresa_docs_<NIT>` | ✅ línea 415 |
| `siso_encuestas` | ✅ |
| `siso_saved_bills_<userId>` | ✅ `siso_saved_bills_drcucalon` |
| `siso_cartas_custodia_<userId>` | ✅ en CartaCustodiaPage (pero via Supabase, no D1) |
| `siso_doctor_signature` | ✅ |
| `siso_agendados_<userId>` | ✅ |
| `siso_caja_movs_<userId>` | ⚠️ Repo usa `siso_caja_<user>` (nombre ligeramente distinto) |
| `siso_mensajes` | ✅ |

---

## INVENTARIO DE ARCHIVOS — CONTEO FINAL

```
src/pages/         → 35 páginas
src/modules/       → 12 dominios × promedio 4 componentes = 48 componentes de dominio
src/components/    → VersionWatcher, D1ChangesWatcher, StorageHealth, ErrorBoundary, modals, panels, forms
src/stores/        → authStore, aiStore, companiesStore, uiStore, clinicalStore
src/shared/        → lib (12 utilidades), data (10 catálogos), components (8 UI), ui (7 UI)
src/lib/           → d1Client, apiClient, printService (729 ln), emailService, migrateStorage
src/hooks/         → useBackendData, usePatients, useCompanies, useSGSSTData, useSaveData, etc.
src/test/          → 14 test suites
Total archivos src: ~170 archivos
```
