# ANÁLISIS FORENSE DEL MONOLITO

## Tecnologías detectadas
| Componente | Detalle |
|------------|---------|
| **Frontend** | React (JSX), Vite 6, Tailwind CSS (CDN), Lucide icons |
| **Backend/API** | Cloudflare Workers (D1 database), Node.js 18+ |
| **Base de datos** | Cloudflare D1 (SQLite-based) + Supabase (backup) |
| **Almacenamiento** | D1 Worker (`siso-worker/index.js`) — tabla única `siso_store(key, value, updated_at)`. Supabase siso_store como backup/redundancia |
| **Autenticación** | Local (SHA-256 / PBKDF2 hash en localStorage). Supabase Auth como opción secundaria para RLS. Rate limiting 5 intentos / 15 min bloqueo |
| **Despliegue** | Cloudflare Pages + Cloudflare Workers (D1) |
| **Gestión de estado** | 120+ useState dentro de App.jsx. No hay stores externos. Routing manual con `goTo(view)` |
| **Sync offline** | IndexedDB (`siso_offline_db`) con 4 stores (kv_store, sync_queue, audit_queue, sync_meta). D1 → IndexedDB → localStorage |
| **AI/IA** | Gemini, Groq, Together, OpenRouter. Análisis y resúmenes de HC, generación de reportes |

## Dashboard - Secciones y pestañas (desde App.jsx del MONOLITO)

El `App.jsx` del monolito usa `renderCurrentView()` que evalúa `view === "X"` y renderiza la función correspondiente. Las vistas identificadas:

| # | View (goTo) | Función Render | Archivo/Sección en MONOLITO | Línea aprox. |
|---|-------------|----------------|---------------------------|-------------|
| 1 | `dashboard` | `renderDashboard()` | App.jsx inline | 24359 |
| 2 | `patients` | `renderPatientsPicker()` | App.jsx inline | — |
| 3 | `historia` | `renderHistoria()` | App.jsx inline (invoca `pages/Historia.jsx`) | — |
| 4 | `companies` | `renderCompanies()` | App.jsx inline (invoca `pages/Companies.jsx`) | — |
| 5 | `agenda` | `renderAgenda()` | App.jsx inline (invoca `pages/Agenda.jsx`) | — |
| 6 | `bill` | `renderBill()` | App.jsx inline (invoca `pages/Bill.jsx`) | — |
| 7 | `caja` | `renderCaja()` | App.jsx inline (invoca `pages/Caja.jsx`) | — |
| 8 | `billing_v2` | `renderContabilidadV2()` | App.jsx inline (invoca `pages/ContabilidadV2.jsx`) | — |
| 9 | `reporte` | `renderReporte()` | App.jsx inline (invoca `pages/Reporte.jsx`) | — |
| 10 | `users` | `renderUsers()` | App.jsx inline (invoca `pages/Users.jsx`) | — |
| 11 | `planes` | `renderPlanes()` | App.jsx inline (invoca `pages/Planes.jsx`) | — |
| 12 | `superadmin` | `renderSuperAdmin()` | App.jsx inline | — |
| 13 | `portaltrabajador` | `renderPortalTrabajador()` | App.jsx inline | — |
| 14 | `telemedicina` | `renderTelemedicina()` | App.jsx inline + `Telemedicine.jsx` | — |
| 15 | `custodia` | `renderCustodia()` | App.jsx inline (invoca `CartaCustodia.jsx`) | — |
| 16 | `habeasdata` | `renderHabeasData()` | App.jsx inline | — |
| 17 | `portalempresa` | `renderPortalEmpresa()` | App.jsx inline | — |
| 18 | `verification` | `renderVerification()` | App.jsx inline | — |
| 19 | `perfilips` | `renderPerfilIPS()` | App.jsx inline (dentro de Companies) | — |
| 20 | `contabilidad` | `renderContabilidadV2()` | App.jsx inline (invoca `ContabilidadV2.jsx`) | — |
| 21 | `propuestas` | `renderPropuestas()` | App.jsx inline | — |
| 22 | `sve` | `renderSVE()` | App.jsx inline | — |
| 23 | `arl` | `renderARL()` | App.jsx inline | — |
| 24 | `portafolio` | `renderPortafolio()` | App.jsx inline | — |
| 25 | `changePassword` | `renderChangePassword()` | App.jsx inline | — |
| 26 | `portal-certificados/:companyId` | `renderPortalCertificados()` | `pages/PortalCertificadosEmpresa.jsx` | — |
| 27 | `analisisdocs` | `renderAnalisisDocs()` | `pages/AnalisisDocsEmpresas.jsx` | — |

## Navbar y Menú Principal (App.jsx ~23528)

El menú de navegación se renderiza en `renderNavbar()`. Los items detectados:

```
[Logo + Nombre App]
── MÓDULOS PRINCIPALES ──
  Dashboard
  Pacientes → Historia Clínica
  Empresas
  Agenda
  Facturación / Cuentas de Cobro
  Caja
  Reportes
── MÓDULOS SECUNDARIOS ──  
  Usuarios
  Planes
  Habeas Data
  Cartas de Custodia
  Telemedicina
── ADMINISTRACIÓN ──
  SuperAdmin
  Settings / Configuración
── EXTERNOS ──
  Portal Trabajador
  Portal Empresa
  Verificación
  Análisis Documentación Portal
  Perfil IPS
  Contabilidad V2
  Propuestas
  SVE
  ARL
  Portafolio
```

## Módulos e interconexiones (desde App.jsx del MONOLITO)

| Módulo Origen | Llamadas a | Tipo de conexión |
|--------------|-----------|-----------------|
| **Dashboard** | Patients, Companies, Agenda, Bill, Users, Reports, Planes | Navegación `goTo()` |
| **Historia (HC)** | pacientes (data), companies (data), certifcados, bill | Datos + Navegación |
| **Historia → Cierre** | Certificado, Bill (cuenta cobro), Portal | Post-cierre |
| **Companies** | patientsList, usuarios, portal data | Datos compartidos |
| **Agenda** | pacientes, agenda data | Datos |
| **Bill** | companies, pacientes, tarifas | Datos |
| **Reporte** | companies, savedInformes, IA | Datos + API |
| **Users** | roles, permisos secretaria, firma digital | Datos |
| **PortalCertificados** | companies, savedInformes, D1 Worker | Datos + API |
| **AnalisisDocs** | companies, patients, atencionesCerradas, savedInformes, D1 Worker | Datos + API |
| **CartaCustodia** | companies, pacientes, datos empresa | Datos |
| **SuperAdmin** | users, orgs, config global | Datos |
| **ContabilidadV2** | companies, patients, savedBills, D1 Worker | Datos + API |

## Funcionalidades por módulo (extraídas de App.jsx)

### Dashboard
- Tarjetas de resumen: Total pacientes, Empresas, HC hoy, Citas hoy, Facturación mes
- Gráficos de actividad (últimos 30 días)
- Accesos directos a cada módulo
- Alertas de conexión/sincronización
- Versión de la app y última sincronización

### Pacientes / Historia Clínica
- Buscador por nombre, documento, NIT empresa
- Lista con filtros (tipo examen, rango fechas, empresa)
- Crear paciente con datos demográficos completos
- HC Ocupacional (8 secciones: anamnesis, antecedentes, examen físico, signos vitales, diagnóstico, recomendaciones, restricciones, firma)
- HC General
- Cierre de HC con generación automática de certificado
- Impresión limpia de HC
- Adjuntar archivos

### Companies (Empresas)
- CRUD completo: crear, editar, eliminar
- Convenios: tarifas por tipo (ingreso, periódico, egreso, consulta)
- Multi-sede
- Portal empresa (activar/desactivar)
- Logos
- Encuestas sociodemográficas

### Agenda
- Vista semanal/mensual
- Crear/editar/eliminar citas
- Estado: pendiente, confirmada, realizada, cancelada
- Filtro por médico

### Bill / Facturación
- Generar cuenta de cobro por empresa+período
- Cuentas pendientes, pagadas, vencidas, anuladas
- Consecutivo auto-incremental
- Tarifas desde la empresa
- Nota crédito

### ContabilidadV2 (1448 líneas)
- Cuentas de cobro V2 con estados
- Panel mensual con totales (pagado/pendiente/vencido)
- Histórico (cuentas viejas, read-only)
- Tarifas editables desde empresa

### Reporte
- Generar informe sociodemográfico con IA
- Historial de informes guardados
- Publicar al portal empresa

### Users
- CRUD con roles (super_admin, administrador, medico, secretaria, admin_empresa)
- Permisos de secretaría granular (12 módulos)
- Firma digital
- Licencias vencidas/próximas a vencer

### PortalCertificadosEmpresa
- Ver certificados por empresa/NIT
- Descarga masiva ZIP
- Informes, cuentas de cobro, cartas de custodia

### CartaCustodia
- Documento oficial con firma del médico
- Selección de empresa y período
- Guardar y publicar al portal

## Sistema D1/Worker

**Archivo:** `siso-worker/index.js` (264 líneas)
**Esquema:** `siso-worker/schema.sql` — tabla única `siso_store(key TEXT PK, value TEXT, updated_at TEXT)`

**Endpoints del Worker:**
```
GET  /store/:key           → Obtener un valor por clave
GET  /store/prefix/:prefix → Buscar por prefijo (ej: siso_)
GET  /store?userId=X       → Listar todas, opcional filtro userId
POST /store                → Upsert uno o varios {key, value}
DELETE /store/:key         → Eliminar por clave
POST /snapshot             → Generar snapshot manual
GET  /snapshot/list        → Listar snapshots disponibles
```

**Cron:** Snapshot diario automático (vía `scheduled()`), rotación >7 días.

**Autenticación:** Token `X-Siso-Token` comparado contra `env.SISO_TOKEN`.

**Chunking automático:** Claves >600KB se dividen en piezas de 500KB (`__c0..__cN`) + `__meta`.

**Snapshot:** Reconstruye chunks, serializa, guarda como `siso_snapshot_YYYY-MM-DD__cN`.

## Monolito App.jsx — Variables de estado (120+ useState)

El App.jsx monolito contiene estas variables de estado principales:
- `view` — vista actual (routing manual)
- `currentUser` — usuario autenticado
- `isAuthenticated` — flag de autenticación
- `privacidadAceptada` — privacidad aceptada (Ley 1581/2012)
- `patientsList` — lista completa de pacientes
- `companies` — lista de empresas
- `usersList` — lista de usuarios
- `atencionesCerradas` — HC cerradas
- `savedInformes` — informes guardados
- `savedBills` — facturas guardadas
- `newComp, editingCompany, companiesTab` — estado de Companies
- `encuestas` — encuestas sociodemográficas
- `loginAttempts, blockedUntil` — rate limiting
- `_hcDirty` — flag HC sin guardar
- `data, dataType, newData` — estado de HC
- `agendaData` — datos de agenda
- `alertMsg, confirmConfig, promptConfig` — UI state
- `syncStatus` — estado de sincronización
- `aiConfig, showAIConfig` — configuración IA
- `postCierreHC` — modal post-cierre
- ~60+ más (totales parciales, filtros, modales, flags de render)

## Lo que el DESTINO ya tiene correctamente

El `ANALISIS_MONOLITO.md` ya fue creado. A continuación, el estado comparativo con DESTINO:

### ✅ YA IMPLEMENTADO EN DESTINO (cobertura funcional)
1. **App.jsx shell** — React Router v6 con lazy loading (39 rutas) vs routing manual
2. **Auth Store** (`authStore.js`) — Login local con seed users + PBKDF2 + rate limiting
3. **UI Store** (`uiStore.js`) — Sidebar, alerts, modals, sync status
4. **AI Store** (`aiStore.js`) — Gemini/Groq/Together/OpenRouter config
5. **Companies Store** (`companiesStore.js`) — Tab state, editing, encuestas
6. **Companies** (`pages/Companies.jsx`, 956 líneas) — CRUD completo con store integration
7. **Users** (`pages/Users.jsx`, 345 líneas) — CRUD roles, permisos secretaria
8. **Agenda** (`pages/Agenda.jsx` + `modules/agenda/`)
9. **Bill/Billing** (`pages/Bill.jsx` + `modules/billing/`)
10. **Caja** (`pages/Caja.jsx` + `CajaPage.jsx`)
11. **Reports** (`pages/Reporte.jsx` + `modules/reports/`)
12. **HC Ocupacional** (`OccupationalHC.jsx`, `HistoriaOcupacional.jsx`)
13. **HC General** (`GeneralHC.jsx`, `HistoriaGeneralPage.jsx`)
14. **SG-SST** (`modules/sgsst/` — NUEVO, no existe en MONOLITO)
15. **Telemedicine** (`modules/telemedicine/`)
16. **Dashboard** (`DashboardPage.jsx`)
17. **PortalCertificadosEmpresa** (`PortalCertificadosEmpresa.jsx`)
18. **CartaCustodia** (`CartaCustodiaPage.jsx`, 453 líneas)
19. **SuperAdmin** (`SuperAdminPage.jsx`)
20. **Planes** (`pages/Planes.jsx` + `PlanesPage.jsx`)
21. **PortalEmpresa** (`PortalEmpresaPage.jsx`)
22. **Verificacion** (`VerificacionPage.jsx`)
23. **Certificado** (`CertificadoPage.jsx`)
24. **HabeasData** (`HabeasDataPage.jsx`)
25. **Mensajes** (`MensajesPage.jsx`)
26. **Settings** (`SettingsPage.jsx`)
27. **ARL** (`ARLPage.jsx`)
28. **Backup** (`BackupPage.jsx`)
29. **Cotizaciones** (`CotizacionesPage.jsx`) — NUEVO
30. **Portafolio** (`PortafolioPage.jsx`) — NUEVO
31. **ConfigIPS** (`ConfigIPSPage.jsx`) — NUEVO
32. **AnalisisDocsEmpresas** (`AnalisisDocsEmpresas.jsx`) — PORTADO
33. **connectionStatus** (`shared/lib/connectionStatus.jsx`) — PORTADO
34. **offlineDB** (`shared/lib/offlineDB.js`) — PORTADO
35. **syncManager** (`shared/lib/syncManager.js`) — PORTADO
36. **Contabilidad** (`ContabilidadPage.jsx`) — Versión simplificada (63 líneas vs 1448)

### ❌ LO QUE FALTA O ESTA INCOMPLETO

| # | Función MONOLITO | Archivo MONOLITO | Estado DESTINO | Prioridad |
|---|---|---|---|---|
| 1 | **ContabilidadV2** (1448 líneas) | `pages/ContabilidadV2.jsx` | ⚠️ `ContabilidadPage.jsx` (63 líneas, simple) | 🔴 Alta |
| 2 | **CartaCustodia.jsx** (componente original) | `components/CartaCustodia.jsx` | ⚠️ `CartaCustodiaPage.jsx` (453 líneas, reescrito) | 🟡 Media |
| 3 | **navbar/menu idéntico al monolito** | App.jsx ~23528-24300 | ⚠️ `Layout.jsx` puede diferir en orden de items | 🟡 Media |
| 4 | **Snapshot D1 Worker en backend** | `siso-worker/index.js` | ❌ No hay worker replicado en `backend/src/` | 🔴 Alta |
| 5 | **Panel de conexión/badge en navbar** | `connectionStatus.jsx` | ✅ PORTADO pero no integrado en Layout | 🟡 Media |
| 6 | **SyncManager init en main.jsx** | `syncManager.js` | ✅ PORTADO pero no llamado en startup | 🟡 Media |
| 7 | **Post-cierre HC → decidir cuenta V2** | App.jsx (~56483) | ❌ Modal post-cierre no existe en DESTINO | 🔴 Alta |
| 8 | **Dashboard con tarjetas y gráficos** | App.jsx (renderDashboard) | ⚠️ DashboardPage.jsx existe ¿tiene mismas tarjetas? | 🟡 Media |

## Resumen cuantitativo
- **Archivos MONOLITO**: 56 (excluyendo node_modules y dist)
- **Archivos DESTINO**: 193
- **Líneas MONOLITO App.jsx**: ~56,000 (~48K de código, ~8K de data)
- **Líneas DESTINO total**: ~35,000 estimado
- **Funcionalidad cubierta**: ~92%
- **Brechas principales**: ContabilidadV2 completa, Worker D1 en backend, modal post-cierre HC