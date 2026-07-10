# 🎯 PROTOCOLO DE IGUALACIÓN 100% — Monolito → Refactorizado

_Última actualización: 2026-07-09 15:25_

---

## ⚠️ ROLES DEFINITIVOS (sin confusión)

| Término | Carpeta | Qué es | Función |
|---|---|---|---|
| **MONOLITO** | La lógica en `App.jsx` (59,766 líneas) | Fuente de verdad de NEGOCIO | Contiene TODAS las funciones, handlers, reglas, flujos |
| **REFACTORIZADO (META)** | `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio` | Arquitectura final DESEADA | Misma lógica pero MODULARIZADA + 79 commits extras |
| **PROYECTO ACTUAL** | `C:\Users\JQK3\Desktop\ocupasaludparadesplegar` | Lo que se va a TRANSFORMAR | Contiene la lógica en App.jsx pero SIN modularizar |

---

## 🎯 OBJETIVO

**Transformar `ocupasaludparadesplegar` para que sea 100% idéntico en funcionalidad y estructura a `Refactorizacion 30 de junio`.**

El `Refactorizacion 30 de junio` YA logró:
1. Extraer TODA la lógica del App.jsx monolítico a módulos separados
2. Implementar React Router + Zustand stores
3. Crear 36 páginas funcionales
4. Añadir 79 commits de mejoras (auditoría 56/56 GAPS, portal empresas, impresión premium, modo offline, etc.)

---

## 📊 ESTADO ACTUAL DEL PROYECTO (`ocupasaludparadesplegar`)

| Métrica | Valor |
|---|---|
| App.jsx | 59,766 líneas (3MB) — TODA la lógica |
| Páginas en `src/pages/` | 13 archivos, 9 son stubs vacíos (69%) |
| Stores Zustand | 0 |
| Módulos `src/modules/` | Solo `clinical/store/clinicalStore.jsx` (1 línea) |
| Hooks `src/hooks/` | 2 (useAppState, useCompanyDocuments) |
| Tests | 0 |
| React Router | No instalado |
| Commit | `9416b68` (79 commits detrás del refactorizado) |

---

## 🗺️ PROTOCOLO PASO A PASO

### ESTRATEGIA: COPIAR desde `Refactorizacion 30 de junio` hacia `ocupasaludparadesplegar`

Como ambos proyectos comparten la MISMA base de lógica de negocio (el App.jsx monolítico), la ruta más rápida es copiar directamente los archivos modulares del refactorizado. Los archivos del monolito que ya están bien implementados (listados abajo) se conservan.

---

## 📦 PASO 0: Instalar dependencias

```bash
cd C:\Users\JQK3\Desktop\ocupasaludparadesplegar
yarn add zustand react-router-dom
```

---

## 📦 PASO 1: Copiar sistema de STORES (Zustand)

**Origen:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\stores\`  
**Destino:** `C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\stores\`

```
src/stores/
├── authStore.js         ← 603 líneas, login/logout, CRUD usuarios, permisos, TOTP, rate-limiting
├── uiStore.js           ← 44 líneas, sidebar, tema, vista activa
├── aiStore.js           ← Gestión de IA, proveedores, configuración
└── companiesStore.js    ← Gestión centralizada de empresas
```

---

## 📦 PASO 2: Crear sistema de ROUTING

**Origen:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\app\`  
**Destino:** `C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\app\`

```
src/app/
└── Layout.jsx           ← 389 líneas, header con acciones, tabs navegación, menú móvil, panel IA, drawer mensajes, <Outlet />
```

Crear también `src/router.jsx` con la definición de rutas para las 36 páginas.

**Reemplazar en App.jsx:**
- Eliminar `renderCurrentView()` y el switch `if (view === "...")`
- Reemplazar por `<BrowserRouter>` + `<Routes>` + `<Layout><Outlet /></Layout>`

---

## 📦 PASO 3: Copiar librerías compartidas (`src/lib/`)

**Origen:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\lib\`  
**Destino:** `C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\lib\`

```
src/lib/
├── d1Client.js           ← 278 líneas, 14 funciones (d1Get, d1Set, d1WriteArrayMerge, d1List, etc.)
├── printService.js       ← 167 líneas, 14 funciones (PrintStyles, printSection unificado)
├── apiClient.js          ← Fetch wrapper con manejo de errores
├── emailService.js       ← Envío de correos
└── migrateStorage.js     ← Migración localStorage→D1
```

---

## 📦 PASO 4: Copiar directorio `src/shared/` completo

**Origen:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\shared\`  
**Destino:** `C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\shared\`

```
src/shared/
├── components/
│   ├── CIE10Input.jsx
│   ├── CIE11Badge.jsx           ← NUEVO (no existe en monolito)
│   ├── CUPSInput.jsx
│   ├── MedicamentoAutocomplete.jsx
│   ├── MensajesDrawer.jsx       ← NUEVO (no existe en monolito)
│   ├── PlanGate.jsx
│   └── ui/
│       ├── BrandLogo.jsx
│       ├── DoctorSignature.jsx
│       ├── FortalezaPass.jsx
│       ├── InputGroup.jsx
│       ├── PlanGate.jsx
│       ├── SectionTitle.jsx
│       ├── SelectGroup.jsx
│       └── TextAreaGroup.jsx
├── data/
│   ├── catalogs.js
│   ├── cie10.js
│   ├── cie11.js
│   ├── cups.js
│   ├── derivaciones.js         ← NUEVO
│   ├── initialStates.js        ← NUEVO (estados iniciales D1)
│   ├── medicamentos.js
│   ├── planConfig.js
│   ├── recomendaciones.js      ← NUEVO
│   ├── restricciones.js        ← NUEVO
│   └── validateFn.js           ← NUEVO
└── lib/
    ├── aiProviders.js
    ├── connectionStatus.jsx
    ├── crypto.js               ← NUEVO (funciones de encriptación)
    ├── formatters.js
    ├── normativa.js
    ├── offlineDB.js
    ├── printUtils.js           ← NUEVO (PDF, QR, impresión)
    ├── security.js
    ├── security_utils.js       ← NUEVO
    ├── storage.js
    ├── supabase.js
    ├── syncManager.js
    ├── totp.js
    └── utils/
        └── cleanFirma.js       ← NUEVO
```

---

## 📦 PASO 5: Migrar HOOKS personalizados

**Origen:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\hooks\`  
**Destino:** `C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\hooks\`

**Conservar los 2 hooks existentes** (`useAppState.js`, `useCompanyDocuments.js`) y AGREGAR:

```
src/hooks/
├── useAppState.js           ← YA EXISTE ✅
├── useCompanyDocuments.js   ← YA EXISTE ✅
├── useBackendData.js        ← NUEVO: lectura/escritura D1 con caché
├── useCompanies.js          ← NUEVO: CRUD empresas + portal
├── usePatients.js           ← NUEVO: CRUD pacientes + búsqueda
├── useSaveData.js           ← NUEVO: persistencia automática con debounce
├── useSGSSTData.js          ← NUEVO: datos SG-SST
├── useAuth.js               ← NUEVO: hook de autenticación
└── useClinicalRecord.js     ← NUEVO: hook de historia clínica
```

---

## 📦 PASO 6: Copiar MÓDULOS de negocio

**Origen:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\modules\`  
**Destino:** `C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\modules\`

### 6A. Módulo auth/
```
src/modules/auth/
├── index.js
├── components/
│   ├── LoginForm.jsx           ← 85 líneas, formulario login con bloqueo anti fuerza bruta
│   ├── TwoFactorAuth.jsx       ← 169 líneas, TOTP RFC 6238, Google Authenticator
│   ├── ChangePasswordForm.jsx  ← Cambio de contraseña con validación
│   └── PrivacyModal.jsx        ← Modal de privacidad/consentimiento
└── hooks/
    └── useAuth.js              ← Hook de autenticación
```

### 6B. Módulo clinical/ (13 componentes)
```
src/modules/clinical/
├── index.js
├── components/
│   ├── GeneralHC.jsx               ← Historia clínica general (13 secciones)
│   ├── OccupationalHC.jsx          ← Historia clínica ocupacional completa
│   ├── PhysicalExam.jsx            ← Examen físico 29 sistemas
│   ├── VitalSigns.jsx              ← Signos vitales
│   ├── PrescriptionTab.jsx         ← Prescripciones/medicación
│   ├── ExamRequestTab.jsx          ← Solicitud exámenes
│   ├── AttachmentsTab.jsx          ← Adjuntos (Cloudinary)
│   ├── DisabilityTab.jsx           ← Incapacidades
│   ├── EvolucionModal.jsx          ← Notas evolución
│   ├── CertificateView.jsx         ← Vista previa certificados
│   ├── ConsentModal.jsx            ← Consentimiento informado
│   ├── RecommendationsPanel.jsx    ← Panel recomendaciones
│   └── RestrictionsPanel.jsx       ← Panel restricciones
├── hooks/
│   └── useClinicalRecord.js        ← Hook HC
├── services/
│   ├── printService.js             ← Impresión certificados + tests
│   └── __tests__/
│       └── printService.test.js
└── store/
    └── clinicalStore.jsx           ← YA EXISTE parcialmente (1 línea), REEMPLAZAR
```

### 6C. Módulo agenda/
```
src/modules/agenda/
├── index.js
└── components/
    ├── AgendaView.jsx          ← Vistas Semanal/Mensual/Día
    ├── QueueManager.jsx        ← 4 contadores (Espera, Atendiendo, Atendidos, Programadas)
    └── AppointmentForm.jsx     ← Formulario cita
```

### 6D. Módulo companies/
```
src/modules/companies/
├── index.js
├── components/
│   ├── CompanyList.jsx                 ← 120 líneas, listado con búsqueda, cards
│   ├── CompanyForm.jsx                 ← 132 líneas, formulario + datos laborales + sedes
│   ├── CompanyPortal.jsx               ← Portal con indicador docs, NIT, contraseña
│   ├── AnalisisDocsTab.jsx             ← Tab análisis documentos
│   ├── EncuestasTab.jsx                ← Tab encuestas (anti-duplicados, import Excel)
│   └── PropuestaEconomicaModal.jsx     ← Modal propuesta económica
└── hooks/
    └── useCompanies.js
```

### 6E. Módulo patients/
```
src/modules/patients/
├── index.js
└── components/
    ├── PatientList.jsx              ← Toggle cards/tabla, badge HCs, Email+WhatsApp, filtro fechas, ⊕ Nueva HC
    ├── WorkerPortal.jsx             ← Portal trabajador
    └── UnsafeConditionReport.jsx    ← Reporte condición insegura
```

### 6F. Módulo reports/
```
src/modules/reports/
├── index.js
├── components/
│   ├── EpidemiologicalReport.jsx    ← Reporte epidemiológico
│   ├── AnalyticsDashboard.jsx       ← Dashboard analítico
│   ├── ARLReports.jsx               ← Reportes ARL
│   ├── ComplianceReport.jsx         ← Reporte cumplimiento
│   └── SVEPrograms.jsx              ← Programas SVE
└── services/
    ├── fhirService.js               ← Servicio FHIR
    └── ripsService.js               ← Servicio RIPS
```

### 6G. Módulo billing/
```
src/modules/billing/
├── index.js
├── components/
│   ├── CashBox.jsx          ← 319 líneas, caja con CSV export, categorías egreso
│   ├── BillGenerator.jsx    ← Generador facturas
│   ├── DIANExport.jsx       ← Exportación DIAN
│   └── Proposals.jsx        ← Propuestas económicas
└── services/
    └── billingService.js    ← Servicio facturación
```

### 6H. Módulos restantes
```
src/modules/users/           ← 4 componentes (UserList, UserForm, DoctorProfile, LicenseManager) + hook useUsers
src/modules/notifications/   ← NotificationModal + notificationService
src/modules/ai/              ← AIAssistant + aiAnalysis (468 líneas) + predictiveModels
src/modules/sgsst/           ← 8 componentes SG-SST + hook useSGSST + sgsstService
src/modules/telemedicine/    ← 3 componentes (AppointmentScheduler, ProfesiogramaAI, VideoConsult)
```

---

## 📦 PASO 7: Páginas — Reemplazar 9 stubs + crear 20 páginas nuevas

### 7A. REEMPLAZAR stubs existentes (9 páginas)

| Archivo actual (stub) | Reemplazar con | Líneas |
|---|---|---|
| `pages/Dashboard.jsx` (5 líneas) | `DashboardPage.jsx` | 902 |
| `pages/Historia.jsx` (3 líneas) | `HistoriaPage.jsx` + `HistoriaGeneralPage.jsx` | ~500 |
| `pages/Agenda.jsx` (3 líneas) | `AgendaPage.jsx` | ~200 |
| `pages/Companies.jsx` (3 líneas) | `CompaniesPage.jsx` | ~300 |
| `pages/Users.jsx` (3 líneas) | `UsersPage.jsx` | ~200 |
| `pages/Bill.jsx` (3 líneas) | `BillingPage.jsx` | ~200 |
| `pages/Caja.jsx` (3 líneas) | `CajaPage.jsx` | ~250 |
| `pages/Reporte.jsx` (3 líneas) | `ReportsPage.jsx` | ~150 |
| `pages/Planes.jsx` (3 líneas) | `PlanesPage.jsx` | ~150 |

### 7B. REPARAR archivo truncado
| `pages/PortalCertificadosEmpresa.jsx` (18 líneas) | `PortalEmpresaPage.jsx` | 546 |

### 7C. CREAR páginas que no existen (20 páginas)

Todas desde **Origen:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\pages\`

```
src/pages/
├── LoginPage.jsx              ← Login completo con authStore
├── PatientsPage.jsx           ← Listado pacientes con todas las features
├── SettingsPage.jsx           ← 679 líneas, backup, import/export, plan, licencias
├── SGSSTPage.jsx              ← SG-SST completo
├── ARLPage.jsx                ← ARL reports
├── EncuestasPage.jsx          ← Encuestas con anti-duplicados
├── HabeasDataPage.jsx         ← Habeas data (localStorage→D1)
├── ProfilePage.jsx            ← Perfil médico
├── SuperAdminPage.jsx         ← Super admin multi-tenant
├── BackupPage.jsx             ← Backup/restore
├── CotizacionesPage.jsx       ← Cotizaciones
├── VerificacionPage.jsx       ← Verificación documentos
├── WorkerPortalPage.jsx       ← Portal trabajador
├── CertificadoPage.jsx        ← Certificados
├── SurveyResponsePage.jsx     ← Respuestas encuestas
├── ConfigIPSPage.jsx          ← Configuración IPS
├── PortafolioPage.jsx         ← Portafolio servicios
├── MensajesPage.jsx           ← Mensajería
├── TelemedicinePage.jsx       ← Telemedicina
└── BillingPage.jsx            ← Facturación
```

### 7D. CONSERVAR páginas existentes que YA están bien (3 páginas)

| Archivo | Líneas | Estado |
|---|---|---|
| `pages/ContabilidadV2.jsx` | 1448 | ✅ CONSERVAR |
| `pages/AnalisisDocsEmpresas.jsx` | 487 | ✅ CONSERVAR |
| `pages/CartaCustodia.jsx` | 567 | ✅ CONSERVAR |

---

## 📦 PASO 8: Copiar secciones compartidas

**Origen:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\sections\`  
**Destino:** `C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\sections\`

```
src/sections/
├── AgendaSection.jsx         ← Sección agenda reutilizable
├── CompaniesSection.jsx      ← Sección empresas reutilizable (313 líneas)
├── HistoriaOcupacional.jsx   ← Sección HC ocupacional reutilizable (75 líneas)
├── ReporteSection.jsx        ← Sección reportes reutilizable
└── UsersSection.jsx          ← Sección usuarios reutilizable
```

---

## 📦 PASO 9: Copiar tests

**Origen:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\test\`  
**Destino:** `C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\test\`

14 archivos de test + setup.js

---

## 📦 PASO 10: Copiar componentes adicionales

Del refactorizado, agregar al `src/components/` del monolito:

```
src/components/
├── ErrorBoundary.jsx         ← NUEVO (42 líneas, captura errores renderizado)
└── (conservar TODOS los existentes: CartaCustodia, D1ChangesWatcher, StorageHealth, VersionWatcher, forms/, modals/, panels/, ui/)
```

---

## 📦 PASO 11: Actualizar App.jsx

**De 59,766 líneas a ~200 líneas:**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './app/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// ... importar todas las 36 páginas

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pacientes" element={<PatientsPage />} />
          <Route path="/historia/:id?" element={<HistoriaPage />} />
          {/* ... resto de rutas */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 📦 PASO 12: Copiar documentación

Del refactorizado al monolito:
- `PROTOCOLO_MAESTRO_DEFINITIVO.md`
- `AUDIT_REPORT.md`
- `BITACORA_CAMBIOS.md`
- `SESION_ESTADO.md`
- `ALMACENAMIENTO_D1.md`

---

## 🔢 RESUMEN DE ARCHIVOS A COPIAR/CREAR

| Categoría | Archivos a copiar/crear | Tamaño estimado |
|---|---|---|
| Stores | 4 | ~700 líneas |
| Routing (Layout + router) | 2 | ~500 líneas |
| Libs | 5 | ~600 líneas |
| Shared | ~35 archivos | ~5,000 líneas |
| Hooks | 5 nuevos (+ 2 existentes) | ~1,000 líneas |
| Módulos | ~60 archivos en 12 módulos | ~15,000 líneas |
| Páginas | 29 (9 reemplazar + 20 crear) | ~8,000 líneas |
| Secciones | 5 | ~1,000 líneas |
| Tests | 14 | ~3,000 líneas |
| Docs | 5 | ~3,000 líneas |
| **TOTAL** | **~168 archivos** | **~37,000 líneas** |

---

## 🕐 ESTIMACIÓN DE TIEMPO POR LOTE

| Lote | Archivos | Tiempo |
|---|---|---|
| 1. Dependencias + Stores + Routing | ~10 | 30 min |
| 2. Lib/ + Shared/ + Hooks | ~45 | 1 hora |
| 3. Módulos (12 carpetas) | ~60 | 2 horas |
| 4. Páginas (29 archivos) | ~29 | 2 horas |
| 5. Secciones + Tests + Docs | ~24 | 1 hora |
| 6. App.jsx final + verificación | ~1 | 30 min |
| **TOTAL** | **~168** | **~7 horas** |

---

## ✅ VERIFICACIÓN FINAL

Después de completar todos los pasos, verificar:

1. `yarn install` sin errores
2. `yarn dev` arranca sin errores
3. Navegación por todas las rutas funciona
4. Login/logout funcional
5. Dashboard con KPIs, turno médico, alertas
6. Historia clínica con todas las tabs
7. Agenda con vistas y QueueManager
8. Empresas con CRUD, portal, propuesta económica
9. `git status` muestra solo archivos modificados (sin node_modules)
10. `git push` al repo `ocupasaludparadesplegar`

---

_Protocolo generado a partir de auditoría forense de 137 archivos con 8 subagentes._