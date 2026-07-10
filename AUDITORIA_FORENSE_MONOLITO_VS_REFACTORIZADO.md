# AUDITORÍA FORENSE QUIRÚRGICA — Monolito vs Refactorizado

_Última actualización: 2026-07-09 15:05 (v2 — roles corregidos)_

---

## 🔬 METODOLOGÍA

- **82 archivos del refactorizado (meta final)** analizados por 5 subagentes en paralelo
- **55 archivos del monolito (actual)** analizados por 3 subagentes en paralelo
- Comparación estructural, funcional y de líneas de código
- **Cero cambios realizados.** Solo lectura forense.

---

## 📂 CARPETAS COMPARADAS — ROLES CORRECTOS

| | ⚠️ MONOLITO (lo que hay que transformar) | ✅ REFACTORIZADO (meta final a alcanzar) |
|---|---|---|
| **Ruta** | `C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\` | `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\` |
| **Repo** | `ocupasaludparadesplegar` | `siso-appultimo` |
| **Commit** | `9416b68` | `175512e` (79 commits más avanzado) |
| **Estructura** | Monolítica: `App.jsx` de 59,766 líneas (3MB), `pages/` son stubs | Modular: `stores/`, `modules/`, `pages/`, `hooks/`, `lib/`, `app/Layout.jsx` |
| **Routing** | Switch manual `if (view === "...")` inline en App.jsx | React Router con `<Outlet />` en `app/Layout.jsx` |
| **Estado** | ❌ Contiene TODA la lógica pero en 1 solo archivo | ✅ Arquitectura limpia, modular, mantenible |

---

## 🧬 DIAGNÓSTICO ESTRUCTURAL

### La verdad: el "refactorizado" real es `Refactorizacion 30 de junio`

Esa carpeta tiene la arquitectura modular correcta:

```
src/
├── app/Layout.jsx          ← Navegación con React Router
├── stores/                 ← Zustand: auth, ui, ai, companies
├── modules/                ← 10 módulos de negocio
│   ├── agenda/             ← 3 componentes
│   ├── ai/                 ← AIAssistant + servicios IA
│   ├── auth/               ← LoginForm, 2FA, ChangePassword
│   ├── billing/            ← CashBox, BillGenerator, DIAN, Proposals
│   ├── clinical/           ← 13 componentes clínicos + hook + printService
│   ├── companies/          ← 6 componentes (CRUD, portal, encuestas, propuesta)
│   ├── notifications/      ← NotificationModal + notificationService
│   ├── patients/           ← PatientList, WorkerPortal, UnsafeConditionReport
│   ├── reports/            ← 5 componentes + fhirService + ripsService
│   ├── sgsst/              ← 8 componentes SG-SST
│   ├── telemedicine/       ← 3 componentes
│   └── users/              ← 4 componentes + hook
├── pages/                  ← 36 páginas con implementación real
├── hooks/                  ← 7 hooks personalizados
├── lib/                    ← d1Client, printService, apiClient, email, migrateStorage
├── sections/               ← 5 secciones compartidas
├── shared/                 ← Componentes, datos, liberías compartidas
├── stores/                 ← 4 stores Zustand
└── test/                   ← 14 archivos de test
```

### El `ocupasaludparadesplegar` es el monolito disfrazado

El archivo `App.jsx` (59,766 líneas, 3MB) contiene **TODA la lógica de la aplicación** en un solo archivo:
- Sistema de autenticación inline (~2000 líneas)
- Router manual con `if (view === "...")` para ~25 vistas
- Seguridad inline (XSS, timeout sesión)
- Storage híbrido inline (localStorage/sessionStorage/IndexedDB/D1/Supabase)
- Renderizado inline de todas las vistas con `renderCurrentView()`

**Las páginas en `src/pages/` son STUBS: 9 de 13 son `export default null` (3-5 líneas).**

---

## 🎯 LO QUE EL MONOLITO NECESITA PARA IGUALAR AL REFACTORIZADO

### 📊 RESUMEN DE BRECHAS — 57 en total

Lo que el REFACTORIZADO (meta) YA TIENE y el MONOLITO (`ocupasaludparadesplegar`) NO tiene implementado de forma modular:

### 🔴 CRÍTICO (Infraestructura — el sistema no es mantenible sin esto) — 12 brechas

| # | Componente/Sistema | Dónde está en el REFACTORIZADO | Cómo está en el MONOLITO | Severidad |
|---|---|---|---|---|
| 1 | **Auth Store (Zustand)** | `stores/authStore.js` (603 líneas) con login/logout, CRUD usuarios, permisos, TOTP, rate-limiting | Inline en App.jsx (~2000 líneas), sin store separado | 🔴 Crítico |
| 2 | **Sistema de permisos/roles** | `authStore` con `canAccess`, `canUse`, `getPlanConfig`, `getHCLimit`, roles admin/médico/secretaria | Inline en App.jsx sin separación de concerns | 🔴 Crítico |
| 3 | **2FA/TOTP** | `modules/auth/components/TwoFactorAuth.jsx` (169 líneas) + `authStore.generateTOTPSecret/verifyTOTP` | Inline en App.jsx | 🔴 Crítico |
| 4 | **D1 Client** | `lib/d1Client.js` (278 líneas, 14 funciones: d1Get, d1Set, d1WriteArrayMerge, d1List, etc.) | `utils/supabase.js` y App.jsx inline, mezclado | 🔴 Crítico |
| 5 | **Print Service** | `lib/printService.js` (167 líneas, 14 funciones) + `modules/clinical/services/printService.js` con tests | `utils/bulkDownload.js` solo parcial | 🔴 Crítico |
| 6 | **React Router + Layout** | `app/Layout.jsx` (389 líneas) con Outlet, tabs de navegación, header con acciones, menú móvil | Switch manual `if(view===...)` en App.jsx | 🔴 Crítico |
| 7 | **Error Boundary** | `components/ErrorBoundary.jsx` (42 líneas) | No existe | 🔴 Crítico |
| 8 | **API Client** | `lib/apiClient.js` (fetch wrapper con manejo de errores) | Inline en App.jsx | 🔴 Crítico |
| 9 | **Email Service** | `lib/emailService.js` (envío de correos) | No existe | 🔴 Crítico |
| 10 | **Migrate Storage** | `lib/migrateStorage.js` (migración localStorage→D1) | Inline en App.jsx | 🔴 Crítico |
| 11 | **AI Store** | `stores/aiStore.js` (Zustand, gestión de IA, proveedores, configuración) | `utils/aiProviders.js` + AIConfigPanel, pero sin store centralizado | 🔴 Crítico |
| 12 | **UI Store + Companies Store** | `stores/uiStore.js` (44 líneas, sidebar, tema, vista) + `stores/companiesStore.js` | No existen stores separados | 🔴 Crítico |

### 🟠 ALTO (Páginas y módulos principales con stubs) — 18 brechas

| # | Componente/Sistema | Dónde está en el REFACTORIZADO | Cómo está en el MONOLITO | Severidad |
|---|---|---|---|---|
| 13 | **Dashboard completo** | `pages/DashboardPage.jsx` (902 líneas): 7 KPIs, turno médico con toggle, alertas inteligentes, CTAs Nueva HC, banner IPS, resumen IA, UltimosPacientes con badges | `pages/Dashboard.jsx` → 5 líneas (STUB: `export default null`) | 🟠 Alto |
| 14 | **Historia Clínica General** | `modules/clinical/components/GeneralHC.jsx` (13 secciones: datos básicos, motivo, enfermedad, antecedentes, hábitos, revisión sistemas) | `pages/Historia.jsx` → 3 líneas (STUB) | 🟠 Alto |
| 15 | **Historia Clínica Ocupacional** | `modules/clinical/components/OccupationalHC.jsx` + `sections/HistoriaOcupacional.jsx` | Solo inline en App.jsx, sin módulo separado | 🟠 Alto |
| 16 | **Agenda médica completa** | `pages/AgendaPage.jsx` + `modules/agenda/` (3 componentes: AgendaView con vistas Semanal/Mensual/Día, QueueManager 4 contadores, AppointmentForm) | `pages/Agenda.jsx` → 3 líneas (STUB) | 🟠 Alto |
| 17 | **Empresas CRUD completo** | `pages/CompaniesPage.jsx` + `modules/companies/` (6 componentes: CompanyList, CompanyForm, CompanyPortal, AnalisisDocsTab, EncuestasTab, PropuestaEconomicaModal) | `pages/Companies.jsx` → 3 líneas (STUB) | 🟠 Alto |
| 18 | **Portal Empresa** | `pages/PortalEmpresaPage.jsx` (546 líneas): login 3 tipos (NIT+código, auto-login URL, admin), tabs certificados/docs/estadísticas, generador certificados premium | `pages/PortalCertificadosEmpresa.jsx` → 18 líneas (TRUNCADO, sin export declarado) | 🟠 Alto |
| 19 | **Pacientes** | `pages/PatientsPage.jsx` + `modules/patients/` (PatientList con toggle cards/tabla, badge HCs, Email+WhatsApp, filtro fechas, botón ⊕ Nueva HC, WorkerPortal, UnsafeConditionReport) | Solo lógica inline en App.jsx, sin página separada | 🟠 Alto |
| 20 | **Settings/Configuración** | `pages/SettingsPage.jsx` (679 líneas): backup/restore, import/export CSV, plan, licencias, configuración IPS, importar pacientes CSV | No existe página separada en el monolito | 🟠 Alto |
| 21 | **SG-SST completo** | `pages/SGSSTPage.jsx` + `modules/sgsst/` (8 componentes: RiskMatrix, SSTDashboard, TrainingModule, AccidentInvestigation, AnnualPlan, DocumentRepository, InspectionChecklist, PolicyGenerator) + 4,432 líneas contenido SG-SST | No existe en absoluto | 🟠 Alto |
| 22 | **Users/Gestión** | `pages/UsersPage.jsx` + `modules/users/` (4 componentes: UserList, UserForm, DoctorProfile, LicenseManager) + hook useUsers | `pages/Users.jsx` → 3 líneas (STUB) | 🟠 Alto |
| 23 | **Examen Físico** | `modules/clinical/components/PhysicalExam.jsx` (29 sistemas con checkboxes, hallazgos, observaciones) | No existe como módulo separado | 🟠 Alto |
| 24 | **Signos Vitales** | `modules/clinical/components/VitalSigns.jsx` (TA, FC, FR, T°, SatO2, peso, talla, IMC, glucosa) | No existe como módulo separado | 🟠 Alto |
| 25 | **Prescripciones/Medicación** | `modules/clinical/components/PrescriptionTab.jsx` (medicamentos, dosis, frecuencia, duración) | No existe como módulo separado | 🟠 Alto |
| 26 | **Solicitud de Exámenes** | `modules/clinical/components/ExamRequestTab.jsx` (exámenes laboratorio, imagenología, procedimientos) | No existe como módulo separado | 🟠 Alto |
| 27 | **Adjuntos** | `modules/clinical/components/AttachmentsTab.jsx` (upload/download Cloudinary, vista previa) | No existe como módulo separado | 🟠 Alto |
| 28 | **Incapacidades** | `modules/clinical/components/DisabilityTab.jsx` (tipo, días, fecha inicio/fin, diagnóstico, observaciones) | No existe como módulo separado | 🟠 Alto |
| 29 | **Evolución** | `modules/clinical/components/EvolucionModal.jsx` (notas de evolución con timestamp y firma) | No existe como módulo separado | 🟠 Alto |
| 30 | **Certificados médicos** | `modules/clinical/components/CertificateView.jsx` (generación y vista previa de certificados) | No existe como módulo separado | 🟠 Alto |

### 🟡 MEDIO (Funcionalidad complementaria) — 15 brechas

| # | Componente/Sistema | Dónde está en el REFACTORIZADO | Cómo está en el MONOLITO | Severidad |
|---|---|---|---|---|
| 31 | **Reportes** | `pages/ReportsPage.jsx` + `modules/reports/` (5 componentes: EpidemiologicalReport, AnalyticsDashboard, ARLReports, ComplianceReport, SVEPrograms) + fhirService + ripsService | `pages/Reporte.jsx` → 3 líneas (STUB) | 🟡 Medio |
| 32 | **Facturación** | `modules/billing/` (BillGenerator, DIANExport, Proposals) | `pages/Bill.jsx` → 3 líneas (STUB) | 🟡 Medio |
| 33 | **Caja** | `pages/CajaPage.jsx` + `modules/billing/components/CashBox.jsx` (319 líneas, CSV export, categorías egreso) | `pages/Caja.jsx` → 3 líneas (STUB) | 🟡 Medio |
| 34 | **Contabilidad** | `pages/ContabilidadPage.jsx` | `pages/ContabilidadV2.jsx` → 1448 líneas (✅ ACTIVO, implementado) | 🟡 Medio |
| 35 | **Habeas Data** | `pages/HabeasDataPage.jsx` (migrado localStorage→D1, gestión consentimientos) | No existe separado | 🟡 Medio |
| 36 | **ARL** | `pages/ARLPage.jsx` + `modules/reports/components/ARLReports.jsx` | No existe separado | 🟡 Medio |
| 37 | **Encuestas** | `pages/EncuestasPage.jsx` + `modules/companies/components/EncuestasTab.jsx` (anti-duplicados, import Excel) | Solo parcial en AnalisisDocsEmpresas | 🟡 Medio |
| 38 | **Telemedicina** | `modules/telemedicine/` (3 componentes: AppointmentScheduler, ProfesiogramaAI, VideoConsult) | No existe | 🟡 Medio |
| 39 | **Notificaciones** | `modules/notifications/` (NotificationModal + notificationService) | `NotificacionModal.jsx` parcial en componentes | 🟡 Medio |
| 40 | **Mensajes** | `pages/MensajesPage.jsx` + `shared/components/MensajesDrawer.jsx` | No existe | 🟡 Medio |
| 41 | **Perfil médico** | `pages/ProfilePage.jsx` + `modules/users/components/DoctorProfile.jsx` | No existe separado | 🟡 Medio |
| 42 | **Verificación** | `pages/VerificacionPage.jsx` (validación documentos) | No existe | 🟡 Medio |
| 43 | **Super Admin** | `pages/SuperAdminPage.jsx` (gestión multi-tenant) | No existe | 🟡 Medio |
| 44 | **Backup** | `pages/BackupPage.jsx` (backup/restore completo) | No existe separado | 🟡 Medio |
| 45 | **Cotizaciones** | `pages/CotizacionesPage.jsx` | No existe separado | 🟡 Medio |

### 🟢 BAJO (Utilidades, servicios, calidad) — 12 brechas

| # | Componente/Sistema | Dónde está en el REFACTORIZADO | Cómo está en el MONOLITO | Severidad |
|---|---|---|---|---|
| 46 | **Hooks personalizados** | 7 hooks: `useBackendData`, `useCompanies`, `usePatients`, `useSaveData`, `useSGSSTData`, `useAuth`, `useClinicalRecord` | Solo 2: `useAppState`, `useCompanyDocuments` | 🟢 Bajo |
| 47 | **Módulo IA** | `modules/ai/` (AIAssistant, aiAnalysis con 468 líneas, predictiveModels) | `utils/aiProviders.js` (419 líneas) + AIConfigPanel, sin módulo | 🟢 Bajo |
| 48 | **Print Utils** | `shared/lib/printUtils.js` (funciones PDF, impresión, QR) | No existe separado | 🟢 Bajo |
| 49 | **Crypto/Seguridad** | `shared/lib/crypto.js` + `security_utils.js` + `utils/cleanFirma.js` | `utils/security.js` parcial | 🟢 Bajo |
| 50 | **FHIR/RIPS** | `modules/reports/services/fhirService.js` + `ripsService.js` | No existe | 🟢 Bajo |
| 51 | **Change Password** | `modules/auth/components/ChangePasswordForm.jsx` | No existe separado | 🟢 Bajo |
| 52 | **Privacy Modal** | `modules/auth/components/PrivacyModal.jsx` | No existe separado | 🟢 Bajo |
| 53 | **Initial States** | `shared/data/initialStates.js` (estados iniciales D1) | No existe | 🟢 Bajo |
| 54 | **Derivaciones/Recomend./Restric. data** | `shared/data/derivaciones.js`, `recomendaciones.js`, `restricciones.js`, `validateFn.js` | `TabFormulaDerivacion.jsx` (1015 líneas, ✅) + paneles parciales | 🟢 Bajo |
| 55 | **CIEBadge** | `shared/components/CIE11Badge.jsx` | No existe | 🟢 Bajo |
| 56 | **Mensajes Drawer** | `shared/components/MensajesDrawer.jsx` | No existe | 🟢 Bajo |
| 57 | **Tests** | 14 archivos en `src/test/` (backend, connection, crypto, data, hc-features, hc-general, render-crash, render-pages, runtime, sections-imports, security, sprint1-forense) | 0 tests | 🟢 Bajo |

---

## 🔢 ESTADÍSTICAS TOTALES

| Categoría | Cantidad |
|---|---|
| 🔴 Crítico (infraestructura) | 12 |
| 🟠 Alto (páginas/módulos principales) | 18 |
| 🟡 Medio (funcionalidad complementaria) | 15 |
| 🟢 Bajo (utilidades/servicios/calidad) | 12 |
| **TOTAL BRECHAS** | **57** |

### Porcentaje de completitud estimado del MONOLITO vs REFACTORIZADO

| Área | % Modularizado | Estado |
|---|---|---|
| Autenticación/Seguridad | 0% | Inline en App.jsx, sin stores Zustand |
| Dashboard | 5% | Stub de 5 líneas |
| Historia Clínica | 5% | Stub de 3 líneas |
| Agenda | 5% | Stub de 3 líneas |
| Empresas/Portal | 5% | Stubs + 1 archivo truncado |
| Pacientes | 0% | Sin página separada |
| Settings/Admin | 0% | Sin página separada |
| Reportes | 5% | Stub de 3 líneas |
| Facturación/Caja | 5% | Stubs de 3 líneas |
| Contabilidad | 80% | ✅ Implementado (1448 líneas) |
| SG-SST | 0% | No existe |
| Telemedicina | 0% | No existe |
| Users/Gestión | 5% | Stub de 3 líneas |
| Tests | 0% | 0 tests |
| **PROMEDIO MODULARIZACIÓN** | **~8%** | |

> ⚠️ ACLARACIÓN IMPORTANTE: Toda la lógica de negocio SÍ existe en el `App.jsx` de 59,766 líneas del monolito. El sistema FUNCIONA. Las 57 brechas son de **modularización y arquitectura**, no de funcionalidad ausente. El objetivo es pasar de 1 archivo de 60K líneas a la estructura modular del refactorizado.

---

## 📋 LO QUE EL MONOLITO YA TIENE BIEN IMPLEMENTADO

Estos archivos ya existen en `ocupasaludparadesplegar` con implementación completa. Solo necesitan conectarse al sistema modular:

| Archivo | Líneas | Estado |
|---|---|---|
| `pages/ContabilidadV2.jsx` | 1448 | ✅ Completo |
| `pages/AnalisisDocsEmpresas.jsx` | 487 | ✅ Completo |
| `pages/CartaCustodia.jsx` | 567 | ✅ Completo |
| `components/panels/AIConfigPanel.jsx` | 460 | ✅ Completo |
| `components/panels/LicenciasTab.jsx` | 796 | ✅ Completo |
| `components/panels/RecomendacionesChecklistPanel.jsx` | 152 | ✅ Completo |
| `components/panels/RestriccionesChecklistPanel.jsx` | 183 | ✅ Completo |
| `components/modals/ConsentimientoModal.jsx` | 289 | ✅ Completo |
| `components/modals/NotificacionModal.jsx` | 178 | ✅ Completo |
| `components/modals/PortalPublicoTrabajador.jsx` | 541 | ✅ Completo |
| `components/forms/TabFormulaDerivacion.jsx` | 1015 | ✅ Completo |
| `components/CartaCustodia.jsx` | 193 | ✅ Completo |
| `components/D1ChangesWatcher.jsx` | 152 | ✅ Completo |
| `components/StorageHealth.jsx` | 279 | ✅ Completo |
| `components/VersionWatcher.jsx` | 165 | ✅ Completo |
| `components/ui/` (11 archivos) | Varios | ✅ Completo |
| `data/` (6 archivos) | Varios | ✅ Completo |
| `utils/` (13 archivos) | Varios | ✅ Completo |

---

## 🗺️ PROTOCOLO DETALLADO PARA ALCANZAR 100% DE PARIDAD

### Estrategia general

El `App.jsx` del monolito (59,766 líneas) YA contiene toda la lógica. La tarea es **extraer y modularizar**, usando el `Refactorizacion 30 de junio` como REFERENTE de la estructura final deseada.

---

### FASE A: Infraestructura Core (Inicio — estimado 2 días)

#### A1. Instalar dependencias necesarias
```bash
yarn add zustand react-router-dom
```

#### A2. Crear sistema de stores (Zustand)
```
src/stores/
├── authStore.js       ← Extraer de App.jsx (~2000 líneas) + copiar del refactorizado
├── uiStore.js          ← Copiar del refactorizado (44 líneas)
├── aiStore.js          ← Extraer de App.jsx + utils/aiProviders.js
└── companiesStore.js   ← Copiar del refactorizado
```
**Pasos concretos:**
1. Extraer lógica de login/logout/usuarios/permisos de App.jsx a `authStore.js`
2. Copiar rate-limiting (5 intentos, 15 min), TOTP, seed users, hash correction
3. Conectar persistencia localStorage/D1
4. Migrar funciones `canAccess`, `canUse`, `getPlanConfig`, `getHCLimit`, `getFilteredUsers`
5. Migrar `loginLocal` con migración localStorage→D1

#### A3. Crear sistema de routing (React Router)
```
src/app/
├── Layout.jsx          ← Copiar del refactorizado (389 líneas)
└── router.jsx           ← Definir rutas basadas en las 36 páginas del refactorizado
```
**Pasos concretos:**
1. Crear Layout con header, tabs de navegación, menú móvil, panel IA, drawer mensajes
2. Definir rutas para todas las páginas del refactorizado
3. Reemplazar `renderCurrentView()` en App.jsx por `<Outlet />`

#### A4. Crear directorio `src/lib/` con librerías compartidas
```
src/lib/
├── d1Client.js          ← Copiar del refactorizado (278 líneas, 14 funciones)
├── printService.js      ← Copiar del refactorizado (167 líneas)
├── apiClient.js         ← Copiar del refactorizado
├── emailService.js      ← Copiar del refactorizado
└── migrateStorage.js    ← Copiar del refactorizado
```

#### A5. Crear directorio `src/shared/` con componentes y datos
```
src/shared/
├── components/          ← Copiar del refactorizado (CIE10Input, CUPSInput, CIE11Badge, MedicamentoAutocomplete, MensajesDrawer, PlanGate)
│   └── ui/              ← Copiar BrandLogo, DoctorSignature, FortalezaPass, InputGroup, SectionTitle, SelectGroup, TextAreaGroup
├── data/                ← Copiar del refactorizado (catalogs, cie10, cie11, cups, derivaciones, initialStates, medicamentos, planConfig, recomendaciones, restricciones, validateFn)
└── lib/                 ← Copiar del refactorizado (aiProviders, connectionStatus, crypto, formatters, normativa, offlineDB, printUtils, security, security_utils, storage, supabase, syncManager, totp, cleanFirma)
```

#### A6. Migrar hooks personalizados
```
src/hooks/
├── useBackendData.js    ← Copiar del refactorizado
├── useCompanies.js       ← Copiar del refactorizado
├── usePatients.js        ← Copiar del refactorizado
├── useSaveData.js        ← Copiar del refactorizado
├── useSGSSTData.js       ← Copiar del refactorizado
├── useAuth.js            ← Copiar del refactorizado
└── useClinicalRecord.js  ← Copiar del refactorizado
```

---

### FASE B: Módulos de Negocio (Días 2-5)

#### B1. Migrar módulo de autenticación
```
src/modules/auth/
├── index.js
├── components/
│   ├── LoginForm.jsx        ← Copiar del refactorizado (85 líneas)
│   ├── TwoFactorAuth.jsx    ← Copiar del refactorizado (169 líneas)
│   ├── ChangePasswordForm.jsx ← Copiar del refactorizado
│   └── PrivacyModal.jsx     ← Copiar del refactorizado
└── hooks/
    └── useAuth.js           ← Ya migrado en A6
```

#### B2. Migrar módulo clínico (13 componentes)
```
src/modules/clinical/
├── index.js
├── components/
│   ├── GeneralHC.jsx            ← Copiar del refactorizado
│   ├── OccupationalHC.jsx       ← Copiar del refactorizado
│   ├── PhysicalExam.jsx         ← Copiar del refactorizado (29 sistemas)
│   ├── VitalSigns.jsx           ← Copiar del refactorizado
│   ├── PrescriptionTab.jsx      ← Copiar del refactorizado
│   ├── ExamRequestTab.jsx       ← Copiar del refactorizado
│   ├── AttachmentsTab.jsx       ← Copiar del refactorizado
│   ├── DisabilityTab.jsx        ← Copiar del refactorizado
│   ├── EvolucionModal.jsx       ← Copiar del refactorizado
│   ├── CertificateView.jsx      ← Copiar del refactorizado
│   ├── ConsentModal.jsx         ← Copiar del refactorizado
│   ├── RecommendationsPanel.jsx ← Copiar del refactorizado
│   └── RestrictionsPanel.jsx    ← Copiar del refactorizado
├── hooks/
│   └── useClinicalRecord.js     ← Ya migrado en A6
├── services/
│   └── printService.js          ← Copiar del refactorizado (con tests)
└── store/
    └── clinicalStore.jsx        ← Ya existe parcialmente
```

#### B3. Migrar módulo de agenda
```
src/modules/agenda/
├── index.js
└── components/
    ├── AgendaView.jsx       ← Copiar del refactorizado
    ├── QueueManager.jsx     ← Copiar del refactorizado
    └── AppointmentForm.jsx  ← Copiar del refactorizado
```

#### B4. Migrar módulo de empresas
```
src/modules/companies/
├── index.js
├── components/
│   ├── CompanyList.jsx              ← Copiar del refactorizado (120 líneas)
│   ├── CompanyForm.jsx              ← Copiar del refactorizado (132 líneas)
│   ├── CompanyPortal.jsx            ← Copiar del refactorizado
│   ├── AnalisisDocsTab.jsx          ← Copiar del refactorizado
│   ├── EncuestasTab.jsx             ← Copiar del refactorizado
│   └── PropuestaEconomicaModal.jsx  ← Copiar del refactorizado
└── hooks/
    └── useCompanies.js      ← Ya migrado en A6
```

#### B5. Migrar módulo de pacientes
```
src/modules/patients/
├── index.js
└── components/
    ├── PatientList.jsx           ← Copiar del refactorizado
    ├── WorkerPortal.jsx          ← Copiar del refactorizado
    └── UnsafeConditionReport.jsx ← Copiar del refactorizado
```

#### B6. Migrar módulo de reportes
```
src/modules/reports/
├── index.js
├── components/
│   ├── EpidemiologicalReport.jsx  ← Copiar del refactorizado
│   ├── AnalyticsDashboard.jsx     ← Copiar del refactorizado
│   ├── ARLReports.jsx            ← Copiar del refactorizado
│   ├── ComplianceReport.jsx      ← Copiar del refactorizado
│   └── SVEPrograms.jsx           ← Copiar del refactorizado
└── services/
    ├── fhirService.js            ← Copiar del refactorizado
    └── ripsService.js            ← Copiar del refactorizado
```

#### B7. Migrar módulo de facturación
```
src/modules/billing/
├── index.js
├── components/
│   ├── CashBox.jsx       ← Copiar del refactorizado (319 líneas)
│   ├── BillGenerator.jsx ← Copiar del refactorizado
│   ├── DIANExport.jsx    ← Copiar del refactorizado
│   └── Proposals.jsx     ← Copiar del refactorizado
└── services/
    └── billingService.js ← Copiar del refactorizado
```

#### B8. Migrar módulos restantes
```
src/modules/users/         ← 4 componentes + hook
src/modules/notifications/ ← NotificationModal + service
src/modules/ai/            ← AIAssistant + aiAnalysis + predictiveModels
src/modules/sgsst/         ← 8 componentes + hook + service
src/modules/telemedicine/  ← 3 componentes
```

---

### FASE C: Páginas (Días 4-6)

Reemplazar los 9 stubs vacíos y crear las páginas faltantes:

| Página actual (stub) | Acción | Referencia en refactorizado |
|---|---|---|
| `pages/Dashboard.jsx` (5 líneas) | **REEMPLAZAR** | `DashboardPage.jsx` (902 líneas) |
| `pages/Historia.jsx` (3 líneas) | **REEMPLAZAR** | `HistoriaPage.jsx` + `HistoriaGeneralPage.jsx` |
| `pages/Agenda.jsx` (3 líneas) | **REEMPLAZAR** | `AgendaPage.jsx` |
| `pages/Companies.jsx` (3 líneas) | **REEMPLAZAR** | `CompaniesPage.jsx` |
| `pages/Users.jsx` (3 líneas) | **REEMPLAZAR** | `UsersPage.jsx` |
| `pages/Bill.jsx` (3 líneas) | **REEMPLAZAR** | `BillingPage.jsx` |
| `pages/Caja.jsx` (3 líneas) | **REEMPLAZAR** | `CajaPage.jsx` |
| `pages/Reporte.jsx` (3 líneas) | **REEMPLAZAR** | `ReportsPage.jsx` |
| `pages/Planes.jsx` (3 líneas) | **REEMPLAZAR** | `PlanesPage.jsx` |
| `pages/PortalCertificadosEmpresa.jsx` (18 líneas) | **REPARAR** | `PortalEmpresaPage.jsx` (546 líneas) |

Páginas a CREAR desde cero (no existen en el monolito):
- `LoginPage.jsx`
- `PatientsPage.jsx`
- `SettingsPage.jsx`
- `SGSSTPage.jsx`
- `ARLPage.jsx`
- `EncuestasPage.jsx`
- `HabeasDataPage.jsx`
- `ProfilePage.jsx`
- `SuperAdminPage.jsx`
- `BackupPage.jsx`
- `CotizacionesPage.jsx`
- `VerificacionPage.jsx`
- `WorkerPortalPage.jsx`
- `CertificadoPage.jsx`
- `SurveyResponsePage.jsx`
- `ConfigIPSPage.jsx`
- `PortafolioPage.jsx`
- `MensajesPage.jsx`
- `TelemedicinePage.jsx`
- `BillingPage.jsx`

---

### FASE D: Tests, Secciones y Finalización (Días 6-8)

#### D1. Migrar secciones compartidas
```
src/sections/
├── AgendaSection.jsx     ← Copiar del refactorizado
├── CompaniesSection.jsx  ← Copiar del refactorizado
├── HistoriaOcupacional.jsx ← Copiar del refactorizado
├── ReporteSection.jsx    ← Copiar del refactorizado
└── UsersSection.jsx      ← Copiar del refactorizado
```

#### D2. Migrar tests
```
src/test/
├── backend.test.js
├── connection.test.js
├── crypto.test.js
├── data.test.js
├── hc-features.test.js
├── hc-general.test.js
├── protocolo-maestro.test.js
├── render-crash.test.js
├── render-pages.test.js
├── runtime-crashes.test.js
├── sections-imports.test.js
├── security.test.js
├── setup.js
└── sprint1-forense.test.js
```

#### D3. Migrar documentación
- `PROTOCOLO_MAESTRO_DEFINITIVO.md`
- `AUDIT_REPORT.md`
- `BITACORA_CAMBIOS.md`
- `SESION_ESTADO.md`

#### D4. Actualizar App.jsx
Una vez todo modularizado, el App.jsx pasará de 59,766 líneas a ~200 líneas que solo importan el router y providers.

---

## 🕐 ESTIMACIÓN DE TIEMPO

| Fase | Descripción | Días | Brechas cubiertas |
|---|---|---|---|
| A | Infraestructura Core (stores, routing, lib, hooks, shared) | 2 | 12 críticas + ~15 bajas |
| B | Módulos de negocio (auth, clinical, agenda, companies, patients, reports, billing, users, ai, sgsst, telemedicine, notifications) | 3 | ~20 altas + 5 medias |
| C | Páginas (reemplazar 9 stubs + crear 20 páginas) | 2 | ~18 altas + 10 medias |
| D | Tests, secciones, documentación, limpieza App.jsx | 1 | 12 bajas |
| **TOTAL** | | **8 días** | **57 brechas** |

---

## ⚠️ ACLARACIÓN FINAL

1. **El `Refactorizacion 30 de junio` es el PRODUCTO FINAL DESEADO.** Representa la arquitectura modular correcta y contiene 79 commits más de avance funcional que el monolito.

2. **El `ocupasaludparadesplegar` es el MONOLITO A TRANSFORMAR.** Su `App.jsx` de 59,766 líneas contiene toda la lógica pero en un solo archivo inmantenible. El 92% de las páginas en `src/pages/` son stubs vacíos.

3. **La tarea NO es crear funcionalidad nueva** sino extraer, modularizar y conectar lo que ya existe en el `App.jsx` monolítico, usando la estructura del refactorizado como guía.

4. **Se puede acelerar significativamente** copiando directamente los módulos, páginas, stores, hooks y librerías desde `Refactorizacion 30 de junio` hacia `ocupasaludparadesplegar`, ya que ambos comparten la misma lógica de negocio base.

---

_Informe generado por auditoría forense automatizada con 8 subagentes analizando 137 archivos en total. v2 con roles corregidos._