# 🔬 PROTOCOLO MAESTRO DEFINITIVO — SISO OcupaSalud Pro
## Comparativa Forense Completa: Monolito vs Refactorizado

**Fecha de compilación:** 2026-07-06  
**Versión del protocolo:** v4.0 DEFINITIVO  
**Commit actual refactorizado:** `78957f4dd963d289967ba815456811c6cb08ae5f`  
**Repositorio refactorizado:** `drjuliancucalon-droid/siso-appultimo`  
**Repositorio monolito:** `drjuliancucalon-droid/ocupasaludparadesplegar`  
**Backend compartido:** Cloudflare Worker `siso-api` + D1 `siso-db`  
**Metodología:** 7 sub-agentes de exploración paralela + lectura de 22 documentos + 892 líneas de protocolos previos + inspección de código fuente completo

---

# 📑 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Backend: Cloudflare Worker + D1](#3-backend-cloudflare-worker--d1)
4. [Modelo de Datos Canónico](#4-modelo-de-datos-canónico)
5. [Comparativa Módulo por Módulo](#5-comparativa-módulo-por-módulo)
6. [GAPS Consolidados (47 gaps)](#6-gaps-consolidados-47-gaps)
7. [Nuevos GAPS V2 (9 gaps)](#7-nuevos-gaps-v2-9-gaps)
8. [Plan de Acción por Sprints](#8-plan-de-acción-por-sprints)
9. [Checklist de Validación](#9-checklist-de-validación)
10. [Referencia de Archivos](#10-referencia-de-archivos)
11. [Historial de Sesiones](#11-historial-de-sesiones)

---

# 1. RESUMEN EJECUTIVO

## Estado General

Se auditaron exhaustivamente **ambas plataformas** (monolito `ocupasaludparadesplegar` y refactorizado `siso-appultimo`) que comparten el **mismo backend** Cloudflare Worker `siso-api` + D1 `siso-db`.

| Métrica | Valor |
|---------|-------|
| Total módulos auditados | 18 |
| Total GAPS encontrados | 56 (47 originales + 9 nuevos V2) |
| 🔴 CRÍTICO | 11 gaps (funcionalidad core ausente o rota) |
| 🟠 ALTO | 18 gaps (funcionalidad incompleta) |
| 🟡 MEDIO | 20 gaps (UX diferente o feature menor) |
| 🟢 BAJO | 7 gaps (mejora cosmética) |
| % Completitud estimada | ~82% respecto al monolito |

## Diferencia Clave entre Plataformas

| Aspecto | Monolito | Refactorizado |
|---------|----------|---------------|
| Arquitectura | Single-file (App.jsx 2.8MB) | Modular (34 páginas + 13 módulos) |
| Estilos | Tailwind CSS vía CDN | Tailwind utility classes + styles.css |
| State Management | useState locales + localStorage | Zustand stores + React Query |
| Almacenamiento | localStorage + D1 (vía worker) | D1 (vía worker) + localStorage fallback |
| Backend API | Mismo worker `siso-api` | Mismo worker `siso-api` |
| Build | Vite 6 | Vite 6 |
| Dependencias extra | html2canvas, jspdf | file-saver, xlsx, qrcode, js-jwt |

---

# 2. ARQUITECTURA DEL SISTEMA

## 2.1 Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (SPA)                            │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Monolito   │  │ Refactorizado│  │    Ambos comparten:    │  │
│  │  (Pages)    │  │  (Pages)     │  │  - Mismo Worker D1     │  │
│  │  ocupasalud │  │  siso-app    │  │  - Mismas claves D1    │  │
│  │  paradesple │  │  ultimo-arp  │  │  - Mismo SISO_TOKEN    │  │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────────┘  │
│         │                │                                       │
│         └───────┬────────┘                                       │
│                 │                                                │
└─────────────────┼────────────────────────────────────────────────┘
                  │  HTTPS + X-Siso-Token header
                  ▼
┌──────────────────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKER: siso-api                         │
│         https://siso-api.dr-juliancucalon.workers.dev            │
│                                                                  │
│  Endpoints:                                                      │
│  GET  /store/:key        → Leer clave D1                         │
│  GET  /store             → Listar claves (userId opcional)       │
│  GET  /store/prefix/:p   → Buscar por prefijo                    │
│  POST /store             → Upsert (batch 50, If-Match soporte)   │
│  DELETE /store/:key      → Eliminar clave                        │
│  GET  /health            → Healthcheck + conteos                 │
│  POST /snapshot          → Snapshot manual                       │
│  GET  /snapshot/list     → Listar snapshots                      │
│  CRON daily 6AM          → Snapshot automático + rotación 7d     │
└──────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                    D1 DATABASE: siso-db                           │
│              ID: 76da5895-478f-4486-a5d4-05069f9aa45a            │
│                                                                  │
│  Tabla: siso_store                                               │
│  ┌─────────────┬──────────┬──────────────────────────────────┐   │
│  │ key (TEXT)  │ PK       │ Ej: siso_patients_drcucalon      │   │
│  │ value (TEXT)│ JSON     │ Datos serializados                │   │
│  │ updated_at  │ TEXT     │ datetime('now')                   │   │
│  └─────────────┴──────────┴──────────────────────────────────┘   │
│                                                                  │
│  Auto-chunking: keys con sufijos __c0..cN + __meta para >600KB   │
│  Snapshot diario: siso_snapshot_YYYY-MM-DD__cN + __manifest      │
└──────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────────────┐
│              SUPABASE (Legacy / Fallback)                        │
│         Tabla: siso_store (key-value, RLS activo)                │
│         Usado solo por módulos NO migrados a D1:                 │
│         - UsersPage.jsx (CRÍTICO - debe migrarse)                │
│         - Algunos fallbacks en useBackendData.js                 │
└──────────────────────────────────────────────────────────────────┘
```

## 2.2 Estructura de Archivos del Refactorizado

```
Refactorizacion 30 de junio/
├── index.html                    # Entry point HTML
├── package.json                  # v2.0.0, React 18, Vite 6
├── vite.config.js                # Build + version.json plugin
├── tsconfig.json                 # TypeScript config (allowJs)
├── vitest.config.js              # Testing config
├── .env.example                  # Variables de entorno
│
├── public/
│   ├── _headers                  # CORS/Security headers Cloudflare Pages
│   ├── _redirects                # SPA fallback routing
│   └── favicon.svg               # Logo SISO
│
├── src/
│   ├── main.jsx                  # Entry: React.StrictMode + BrowserRouter + QueryClientProvider
│   ├── App.jsx                   # Router shell: lazy() loading + Suspense + error boundaries
│   ├── styles.css                # Estilos globales (~100 líneas)
│   │
│   ├── app/
│   │   └── Layout.jsx            # Header + nav tabs + sidebar móvil
│   │
│   ├── pages/                    # 34 páginas (ruteables)
│   │   ├── LoginPage.jsx         # Login con configuración IA
│   │   ├── DashboardPage.jsx     # KPIs + alertas + pacientes recientes
│   │   ├── HistoriaPage.jsx      # HC Ocupacional + General
│   │   ├── PatientsPage.jsx      # Lista de pacientes
│   │   ├── AgendaPage.jsx        # Sala de espera + calendario
│   │   ├── CompaniesPage.jsx     # Empresas
│   │   ├── BillingPage.jsx       # Facturación
│   │   ├── CajaPage.jsx          # Caja
│   │   ├── ContabilidadPage.jsx  # Contabilidad V2
│   │   ├── CotizacionesPage.jsx  # Propuestas económicas (BUG: useBackendObject crash)
│   │   ├── ReportsPage.jsx       # Reportes epidemiológicos
│   │   ├── SGSSTPage.jsx         # SG-SST (BUG: onNavigate no pasado)
│   │   ├── TelemedicinePage.jsx  # Telemedicina
│   │   ├── CertificadoPage.jsx   # Generar certificado
│   │   ├── VerificacionPage.jsx  # Verificar certificado
│   │   ├── CartaCustodiaPage.jsx # Carta custodia HC
│   │   ├── HabeasDataPage.jsx    # Habeas Data (solo localStorage)
│   │   ├── UsersPage.jsx         # Gestión usuarios (usa Supabase)
│   │   ├── PlanesPage.jsx        # Planes/suscripción
│   │   ├── PortafolioPage.jsx    # Portafolio servicios
│   │   ├── PortalEmpresaPage.jsx # Portal empresa
│   │   ├── WorkerPortalPage.jsx  # Portal trabajador
│   │   ├── ProfilePage.jsx       # Perfil médico
│   │   ├── SettingsPage.jsx      # Configuración
│   │   ├── ARLPage.jsx           # ARL (solo localStorage)
│   │   ├── EncuestasPage.jsx     # Gestión encuestas
│   │   ├── EnviarEncuestaPage.jsx
│   │   ├── SurveyResponsePage.jsx
│   │   ├── NotificacionesPage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── IAConfigPage.jsx
│   │   └── ...
│   │
│   ├── modules/                  # 13 módulos de dominio
│   │   ├── agenda/components/    # QueueManager, AgendaView
│   │   ├── ai/components/        # AIAssistant, AIDoctorPanel
│   │   ├── auth/components/      # LoginForm, RegisterForm, TOTPSetup
│   │   ├── billing/components/   # BillGenerator, CashBox, DianExport
│   │   ├── clinical/components/  # PhysicalExam, RecommendationsPanel, RestrictionsPanel
│   │   ├── companies/components/ # AnalisisDocsTab, EncuestasTab, PropuestaEconomicaModal
│   │   ├── notifications/        # Sistema notificaciones
│   │   ├── patients/components/  # PatientList, PatientCard
│   │   ├── reports/components/   # EpidemiologicalReport (1113 líneas)
│   │   ├── sgsst/components/     # 7 sub-módulos (4,432 líneas total)
│   │   ├── telemedicine/         # Video consulta
│   │   └── users/                # Gestión usuarios
│   │
│   ├── sections/                 # Secciones de HC
│   │   ├── CompaniesSection.jsx  # 1794 líneas
│   │   └── HistoriaOcupacional.jsx # 2206 líneas
│   │
│   ├── components/               # Componentes compartidos
│   │   ├── ui/                   # Button, Input, Modal, Card, Badge, etc.
│   │   └── ...
│   │
│   ├── hooks/                    # Custom hooks (7)
│   │   ├── useAppState.js        # Inventario de ~180 useState del monolito
│   │   ├── useBackendData.js     # Fetch con fallback D1→Supabase→localStorage
│   │   ├── useCompanies.js
│   │   ├── useSaveData.js        # Save con D1
│   │   └── ...
│   │
│   ├── stores/                   # Zustand stores (4)
│   │   ├── authStore.js          # Auth + CRUD usuarios + TOTP + permisos
│   │   ├── aiStore.js            # Config IA (4 proveedores)
│   │   ├── companiesStore.js     # UI empresas + encuestas
│   │   └── uiStore.js            # UI global (alertas, sync, sidebar)
│   │
│   ├── lib/                      # Utilidades (10+)
│   │   ├── d1Client.js           # Cliente D1 (chunking, batch, retry)
│   │   ├── printService.js       # Servicio impresión PDF
│   │   └── ...
│   │
│   ├── shared/data/              # Datos iniciales
│   │   └── initialStates.js      # Estados iniciales (29 sistemas examen físico)
│   │
│   ├── utils/                    # Utilidades
│   └── test/                     # Tests
│
├── backend/                      # Express API local
│   ├── package.json
│   └── src/
│       └── server.js             # Express 5 + helmet + CORS + rateLimit
│
├── siso-worker/                  # Cloudflare Worker
│   ├── index.js                  # 318 líneas (todos los endpoints)
│   ├── schema.sql                # Esquema D1
│   └── wrangler.json             # Config despliegue
│
├── siso-db-mcp/                  # MCP Server para debug D1
│   └── index.js
│
├── scripts/
│   └── pre-build.ps1             # Pre-build PowerShell
│
├── .cline/
│   ├── rules/                    # Reglas del agente
│   │   └── siso-storage.md
│   └── skills/                   # Skills especializados
│       ├── siso-auditoria.md
│       ├── siso-deploy.md
│       └── siso-testing.md
│
└── docs/                         # Documentación
    ├── AUDITORIA_FORENSE_COMPLETA.md
    ├── AUDITORIA_FUNCIONES.md
    ├── AUDITORIA_INICIAL.md
    ├── INVENTARIO.md
    ├── PROTOCOLO_DEFINITIVO.md
    └── PROTOCOLO_HC_TABS.md
```

---

# 3. BACKEND: CLOUDFLARE WORKER + D1

## 3.1 Worker: siso-api

**URL:** `https://siso-api.dr-juliancucalon.workers.dev`  
**Dashboard:** `https://dash.cloudflare.com/0b9efca009317f8624843e4fa61d17ed/workers/services/view/siso-api/production`

### Configuración (wrangler.json)
```json
{
  "name": "siso-api",
  "main": "index.js",
  "compatibility_date": "2024-01-01",
  "d1_databases": [{
    "binding": "DB",
    "database_name": "siso-db",
    "database_id": "76da5895-478f-4486-a5d4-05069f9aa45a"
  }],
  "triggers": {
    "crons": ["0 6 * * *"]
  }
}
```

### Autenticación
- Header: `X-Siso-Token` → comparado con `env.SISO_TOKEN` (secret)
- Sin token → `401 {"error":"Unauthorized"}`

### Orígenes Permitidos (CORS)
```
https://ocupasaludparadesplegar.pages.dev
https://ocupasaludparadesplegar-f4q.pages.dev
https://siso-appultimo-arp.pages.dev
http://localhost:5173
http://localhost:4173
+ wildcards: *.ocupasaludparadesplegar.pages.dev, *.siso-appultimo-arp.pages.dev
```

### Endpoints Completos

| Método | Path | Auth | Descripción | Body/Params | Response |
|--------|------|------|-------------|-------------|----------|
| OPTIONS | `*` | ❌ | Preflight CORS | - | 204 No Content |
| GET | `/health` | ✅ | Healthcheck + conteos | - | `{ok, counts: {total, patients_keys, portal_docs, hc_completas, portal_empresa_keys}, latencyMs, ts}` |
| GET | `/store/:key` | ✅ | Leer clave | - | `[{key, value, ts}]` con headers `ETag`, `X-Siso-Ts` |
| GET | `/store` | ✅ | Listar todas | `?userId=X` opcional | `[{key, value, updated_at}]` (max 2000) |
| GET | `/store/prefix/:prefix` | ✅ | Buscar por prefijo | - | `[{key, value}]` (max 2000) |
| POST | `/store` | ✅ | Upsert | `[{key, value}]` o `{key, value}` | `{ok: true, count: N}` |
| POST | `/store` | ✅ | Upsert con If-Match | Header `If-Match: "ts"` | `{ok: true}` o `409 {error: "etag_mismatch"}` |
| DELETE | `/store/:key` | ✅ | Eliminar clave | - | `{ok: true}` |
| POST | `/snapshot` | ✅ | Snapshot manual | - | `{ok, snapshotKey, manifest, log}` |
| GET | `/snapshot/list` | ✅ | Listar snapshots | - | `[{key, updated_at}]` |

### Cron Trigger (diario 6AM)
- Genera snapshot `siso_snapshot_YYYY-MM-DD__cN`
- Reconstruye claves chunked
- Serializa estado completo
- Rota snapshots > 7 días

## 3.2 D1 Database: siso-db

**ID:** `76da5895-478f-4486-a5d4-05069f9aa45a`

### Tabla: siso_store
```sql
CREATE TABLE IF NOT EXISTS siso_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Chunking Automático
- Claves > 600KB se dividen en chunks de 500KB
- `{key}__meta` → `{chunked: true, count: N, totalBytes, hash, ts}`
- `{key}__c0`, `{key}__c1`, ... → piezas serializadas
- Verify-after-write con hash MD5-like (`_hash64`)
- Promoción atómica: temp → verify → rename → cleanup

### Snapshots Diarios
- Prefijo: `siso_snapshot_YYYY-MM-DD`
- Estructura: `__c0..cN` + `__meta` + `__manifest`
- Reconstrucción completa de estado en memoria
- Rotación automática > 7 días
- Excluye snapshots y legacy de ser respaldados (no respaldar respaldos)

## 3.3 Supabase (Legacy/Fallback)

**Tabla:** `siso_store` (id, key, value, created_at)  
**RLS:** Activo con `user_isolation` policy  
**Portal público:** Policy `portal_public_read` para keys `siso_portal_%`  
**URL/Key:** Inyectadas vía `window.__SISO_CONFIG` en producción  

---

# 4. MODELO DE DATOS CANÓNICO

## 4.1 Estructura Completa de una Historia Clínica Ocupacional

```javascript
{
  // ══════ IDENTIFICACIÓN ══════
  id, docNumero, docTipo, nombres, genero, fechaNacimiento, edad,
  identidadGenero, grupoEtnico, estrato, grupoSanguineo, lateralidad,

  // ══════ CONTACTO ══════
  email, celular, telefono, ciudad, residencia, zonaResidencia,

  // ══════ SOCIODEMOGRÁFICO ══════
  escolaridad, estadoCivil, numPersonasCargo, tipoVivienda, ingresosMensuales,

  // ══════ LABORAL ══════
  empresaId, empresaNombre, empresaNit, cargo, dependencia, tipoContrato,
  turnoTrabajo, antiguedadEmpresa, nivelRiesgoARL, actividadEconomica,
  esConvenio, tipoExamen, enfasisExamen,

  // ══════ ASEGURAMIENTO ══════
  eps, arl, afp,

  // ══════ SIGNOS VITALES ══════
  ta, fc, fr, temp, peso, talla, imc,

  // ══════ RIESGOS LABORALES (GTC-45) ══════
  riesgos: {
    fisicos: [{agente, fuente, exposicion, controles}],
    quimicos: [{agente, fuente, exposicion, controles}],
    biologicos: [{agente, fuente, exposicion, controles}],
    mecanicos: [{agente, fuente, exposicion, controles}],
    biomecanicos: [{agente, fuente, exposicion, controles}],
    psicosocial: [{agente, fuente, exposicion, controles}],
    seguridad: [{agente, fuente, exposicion, controles}],
    locativos: [{agente, fuente, exposicion, controles}],
  },

  // ══════ ANTECEDENTES ══════
  antecedentesAgrupados: {
    patologicos: [{nombre, fecha, observaciones}],
    quirurgicos: [{nombre, fecha, observaciones}],
    traumaticos: [{nombre, fecha, observaciones}],
    farmacologicos: [{medicamento, dosis, frecuencia}],
    alergicos: [{alergeno, reaccion, severidad}],
  },
  habitos: {
    fuma: {activo: false, cantidad: '', frecuencia: ''},
    alcohol: {activo: false, cantidad: '', frecuencia: ''},
    psicoactivas: {activo: false, sustancia: '', frecuencia: ''},
    deporte: {activo: false, tipo: '', frecuencia: ''},
  },
  vacunas: [{nombre, fecha, dosis, lote}],

  // ══════ EXAMEN FÍSICO — 29 SISTEMAS ══════
  examenFisicoSistemas: {
    pielFaneras: {estado: 'normal', hallazgo: ''},
    ganglios: {estado: 'normal', hallazgo: ''},
    cabeza: {estado: 'normal', hallazgo: ''},
    ojos: {estado: 'normal', hallazgo: ''},
    oidos: {estado: 'normal', hallazgo: ''},
    nariz: {estado: 'normal', hallazgo: ''},
    bocaOrofaringe: {estado: 'normal', hallazgo: ''},
    cuello: {estado: 'normal', hallazgo: ''},
    tiroides: {estado: 'normal', hallazgo: ''},
    torax: {estado: 'normal', hallazgo: ''},
    mamario: {estado: 'normal', hallazgo: ''},
    cardiovascular: {estado: 'normal', hallazgo: ''},
    pulmonar: {estado: 'normal', hallazgo: ''},
    abdomen: {estado: 'normal', hallazgo: ''},
    genitourinario: {estado: 'normal', hallazgo: ''},
    columna: {estado: 'normal', hallazgo: ''},
    lumbar: {estado: 'normal', hallazgo: ''},
    extremidadesSuperiores: {estado: 'normal', hallazgo: ''},
    extremidadesInferiores: {estado: 'normal', hallazgo: ''},
    vascularPeriferico: {estado: 'normal', hallazgo: ''},
    osteoarticular: {estado: 'normal', hallazgo: ''},
    musculoEsqueletico: {estado: 'normal', hallazgo: ''},
    neurologico: {estado: 'normal', hallazgo: ''},
    psiquiatrico: {estado: 'normal', hallazgo: ''},
    respiratorioAlto: {estado: 'normal', hallazgo: ''},
    digestivo: {estado: 'normal', hallazgo: ''},
    endocrino: {estado: 'normal', hallazgo: ''},
    hematologico: {estado: 'normal', hallazgo: ''},
    inmunologico: {estado: 'normal', hallazgo: ''},
  },

  // ══════ EXÁMENES ESPECIALES ══════
  agudezaVisual: {od: '', oi: '', ao: '', correccion: ''},
  examenCorazon: {hallazgos: '', ritmo: '', soplos: ''},
  examenAlturas: {apto: null, hallazgos: '', restricciones: ''},
  examenOsteomuscular: {hallazgos: '', restricciones: '', segmentos: []},
  examenConfinados: {apto: null, hallazgos: '', restricciones: ''},
  examenAlimentos: {apto: null, hallazgos: '', restricciones: ''},

  // ══════ DIAGNÓSTICO ══════
  diagnosticoPrincipal: {codigo: '', descripcion: ''},
  diagnosticoSecundario1: {codigo: '', descripcion: ''},
  conceptoAptitud: '',       // 'apto' | 'apto_restricciones' | 'no_apto'
  analisisRestricciones: '',

  // ══════ RECOMENDACIONES ══════
  recomendaciones: '',
  restriccionesChecklist: [],
  recomendacionesChecklist: [],
  recomendacionesOcupacionales: '',
  recomendacionesMedicas: '',

  // ══════ ACCIONES MÉDICAS ══════
  formulaMedica: {medicamentos: [], indicaciones: ''},
  formulaMedicamentos: [{nombre, dosis, frecuencia, duracion}],
  solicitudExamenes: [{examen, justificacion, diagnostico}],
  solicitudExamenesDiag: '',
  solicitudExamenesJust: '',
  paraclinicosCheck: false,
  derivaciones: [{especialidad, motivo, urgencia}],
  incapacidad: false,
  diasIncapacidad: 0,

  // ══════ SVE ══════
  sveRecomendado: '',
  conductaSeguir: '',

  // ══════ METADATOS ══════
  fechaExamen: '',           // ISO 8601
  fechaRegistro: '',
  fechaConsentimiento: '',
  estadoHistoria: '',        // 'abierta' | 'cerrada'
  folioHC: '',
  versionDocumento: 'FOR-SST-001 v4.0',
  conteoEdiciones: 0,
  motivoEdicion: '',
  vigencia: '',
  codigoVerificacion: '',   // CV-SISO-XXXXX

  // ══════ IA ══════
  analisisIA: '',

  // ══════ CONSENTIMIENTO ══════
  consentimientoInformado: false,
  tipoConsentimiento: '',
  consentimientoIp: '',

  // ══════ MÉDICO/IPS ══════
  _medicoId: '',
  _orgId: '',
  _userId: '',
  _firma: '',
  _ipsName: '',
  _doctorData: {},
  firmaDigital: '',

  // ══════ FOTOS/ADJUNTOS ══════
  foto: '',
  adjuntos: [],

  // ══════ BILLING ══════
  valorAtencion: 0,

  // ══════ FLAGS ══════
  _autoSaved: false,
  _cloudSaved: false,
  _archivado: false,
}
```

## 4.2 Claves D1 Principales

| Key Pattern | Contenido | Tipo |
|-------------|-----------|------|
| `siso_patients_{userId}` | Array de pacientes | Array |
| `siso_empresas_{userId}` | Array de empresas | Array |
| `siso_hc_completa_{docNumero}` | HC individual completa | Object |
| `siso_db_patients_{userId}` | Pacientes (formato db) | Array |
| `siso_autosave_cloud_{userId}_{docNumero}` | Autosave HC en progreso | Object |
| `siso_agendados_{userId}` | Citas agendadas | Array |
| `siso_saved_bills_{userId}` | Facturas guardadas | Array |
| `siso_caja_movs_{userId}` | Movimientos de caja | Array |
| `siso_users` | Usuarios del sistema | Array |
| `siso_doctor_data` | Datos del médico | Object |
| `siso_portal_doc_{docNumero}` | Portal verificación por doc | Object |
| `siso_portal_CV-SISO-{code}` | Portal verificación por código | Object |
| `siso_portal_empresa_{nit}` | Portal empresa | Object |
| `siso_portal_empresa_docs_{nit}` | Documentos portal empresa | Array |
| `siso_survey_{id}` | Encuesta | Object |
| `siso_survey_responses_{id}` | Respuestas encuesta | Array |
| `siso_cotizaciones_{userId}` | Cotizaciones | Array |
| `siso_habeas_data_requests` | Solicitudes habeas data | Array |
| `siso_atl_cases` | Casos ARL | Array |
| `siso_snapshot_YYYY-MM-DD__cN` | Snapshot diario | Array de piezas |
| `siso_snapshot_YYYY-MM-DD__manifest` | Manifest snapshot | Object |

---

# 5. COMPARATIVA MÓDULO POR MÓDULO

## 5.1 LOGIN

### Monolito (renderLogin en App.jsx)
- Formulario: email/user + password
- Validación: rate limiting (5 intentos, 15 min bloqueo)
- Configuración IA: toggle en mismo formulario con 4 proveedores (Gemini, Groq, Together, OpenRouter)
- Botón "Restaurar Copia de Seguridad": carga backup desde D1
- Estilo: Tailwind inline, fondo gradiente emerald-teal

### Refactorizado (LoginPage.jsx)
- **PROPS:** Ninguna (usa useNavigate, useAuthStore, useAIStore)
- **ESTADO LOCAL:** user, pass, showPass, error, loading, showAIConfig (boolean), fileInputRef (useRef)
- **COLORES:** bg-gradient from-emerald-600 to-teal-500, text-white, rounded-xl, shadow-lg
- **BOTONES:**
  1. "Iniciar Sesión" — gradiente emerald-teal, texto blanco, font-black. Muestra "Verificando..." con Loader2 cuando loading
  2. Toggle ojo (Eye/EyeOff) — absolute right-3, text-gray-400, hover:text-emerald-600
  3. "Configurar IA (Recomendado)" — bg-indigo-50, text-indigo-700, border-indigo-200, icono BrainCircuit
  4. "Activar" / "Guardar Configuración" en panel IA
- **FORMULARIOS:** user + password (type text/password toggle)
- **PANEL IA:** 4 tabs (Gemini, Groq, Together, OpenRouter), cada uno con campo API Key + toggle activar
- **RATE LIMITING:** Implementado en authStore (localStorage-based)
- **RESPONSIVE:** Mobile-first, padding condicional

### GAPS LOGIN
| ID | Severidad | Feature | Monolito | Refactorizado |
|----|-----------|---------|----------|---------------|
| GAP-L01 | 🟡 MEDIO | Botón "Restaurar Copia" | Sí | No |

## 5.2 DASHBOARD

### Monolito
**Header Row 1 (siempre visible):**
- Doctor profile card: foto, nombre, especialidad, RM, ciudad
- Botones: `IA` · `Importar` · `Backup` · `RIPS` · `Guardar en Nube` · `Nube` · `Exámenes` · `Firma` · `Cargando...`

**Header Row 2:**
- `Custodia` · `Tele` · `Agenda` · `[mensajes]` · `Planes` · `Salir`

**KPIs (6 cards):**
- HISTORIAS REGISTRADAS, EMPRESAS, HC CERRADAS, HC ABIERTAS, MÉDICOS ACTIVOS
- CUENTAS PENDIENTES: 8 ← **con monto en $**
- CONVENIOS POR VENCER: 0

**Badge:** `⚠️ Sin médico de turno` — funcionalidad de asignación de turno

**Plan banner:** `⭐ Pro · HC ilimitadas`

**CTAs principales:**
- `Nueva HC Ocupacional` — card verde grande
- `Nueva HC General` — card azul grande

**Módulos por categoría:**
- GESTIÓN CLÍNICA: Pacientes | Agenda | Verificar
- ADMINISTRACIÓN: Empresas | Usuarios | Portafolio
- FINANCIERO & REPORTES: Cuentas de Cobro | Módulo Financiero | Contabilidad V2 | Reportes | Propuestas | Contabilidad

**Sección inferior:**
- Productividad por Médico: tabla multi-médico
- Registros Recientes: tabla últimas HCs

**Sistema de alertas (banner amarillo):**
- "8 cuentas de cobro pendientes por $X" — con botón "Ver →"
- "11 HCs sin cerrar" — con botón "Cerrar →"
- "Dr. X no tiene firma digital cargada" — con botón "Cargar →"

### Refactorizado (DashboardPage.jsx)
**Header:**
- Logo | 5 nav buttons (Pacientes, Agenda, Empresas, Facturación, Reportes)
- Config IA | Mensajes | User info | Plan badge | Logout

**Sub-tabs horizontales:** todos los módulos en scrollable tab bar

**KPIs (8 cards, 2 filas):**
- Fila 1: Pacientes atendidos | Empresas activas | Citas hoy | HC generadas
- Fila 2: HC Cerradas | HC Abiertas | Médicos activos | Convenios por vencer

**Módulos especializados (plan-gated):** SVE | Telemedicina | Módulo ARL | Portal Empresa

**Alertas:** Solo "X historia(s) clínica(s) sin cerrar" — sin monto de cuentas

**IA:** Panel de estado de IA + botón "IA Resumen del Día"

**Últimos Pacientes Atendidos:** Tabla con búsqueda (30 registros) + columnas NOMBRE | DOCUMENTO | EMPRESA/CARGO | TIPO EXAMEN | CONCEPTO APTITUD | ESTADO HC | FECHA | ACCIONES

**Citas de Hoy:** Lista de citas con hora + nombre + empresa

**Productividad Médica:** Tabla simplificada (solo médico activo del session)

### GAPS DASHBOARD
| ID | Severidad | Feature | Estado |
|----|-----------|---------|--------|
| GAP-D01 | 🔴 CRÍTICO | Botones header: Importar, Backup, RIPS, Guardar en Nube, Nube, Exámenes, Firma | Ausentes |
| GAP-D02 | 🔴 CRÍTICO | CUENTAS PENDIENTES con monto $ en KPI | Solo count sin monto |
| GAP-D03 | 🟠 ALTO | Sistema de alertas inteligentes con "Ver →" links | Solo alerta de HC sin cerrar |
| GAP-D04 | 🟠 ALTO | "Nueva HC Ocupacional" y "Nueva HC General" CTAs prominentes | Solo Quick Actions pequeñas |
| GAP-D05 | 🟠 ALTO | Gestión de turno médico | Badge sin funcionalidad real |
| GAP-D06 | 🟠 ALTO | Productividad por Médico multi-médico con Ingresos mes | Siempre 1 fila |
| GAP-D07 | 🟡 MEDIO | Módulo Contabilidad V2 en categoría FINANCIERO | Ausente del dashboard |
| GAP-D08 | 🟡 MEDIO | Header shortcuts: Custodia, Tele, Agenda en row 2 | En tab nav, no en header |
| GAP-D09 | 🟡 MEDIO | Portafolio en sección ADMINISTRACIÓN | Ausente de categorías |

## 5.3 PACIENTES

### Monolito
**Título:** "Gestión de Pacientes (331)"
**Layout:** Tabla con columnas: NOMBRE | DOCUMENTO | EMPRESA / CARGO | HISTORIAL | ACCIONES
**Filtros:**
- Búsqueda texto: `Nombre o documento...`
- Select empresa
- Date range: desde/hasta (2 inputs fecha)
**HISTORIAL column:** Badge azul `N HC Propias` + Badge gris `🔍 Todos médicos`
**ACCIONES:** `⊕` nueva HC | `HC Ocup.` (botón azul) | `📧` email | `📱` WhatsApp | `🗑️` eliminar

### Refactorizado
**Título:** "Pacientes 374 registros"
**Layout:** Cards grid 2 columnas
**Card:** Avatar inicial | Nombre completo | CC | Empresa | Tipo examen | Fecha | Resumen concepto
**Filtros:** Búsqueda texto | Dropdown empresa | Dropdown tipo | Orden: `Fecha ↓`
**Acciones:** Click card → HC | "+ Nuevo Paciente" modal

### GAPS PACIENTES
| ID | Severidad | Feature | Estado |
|----|-----------|---------|--------|
| GAP-P01 | 🟠 ALTO | Layout tabla vs cards | Cards (más visual, menos acciones) |
| GAP-P02 | 🟠 ALTO | HISTORIAL column: contador HCs | No |
| GAP-P03 | 🟠 ALTO | Botón email por paciente | No |
| GAP-P04 | 🟠 ALTO | Botón WhatsApp por paciente | No |
| GAP-P05 | 🟡 MEDIO | Filtro rango fechas | No |
| GAP-P06 | 🟡 MEDIO | Botón "⊕ Nueva HC" por fila | No |
| GAP-P07 | 🟢 BAJO | Vista tabla vs cards | Cards |

## 5.4 AGENDA

### Monolito
**KPIs (4):** `0 En espera` | `0 Atendiendo` | `0 Atendidos` | `0 Programadas`
**Vistas:** `📋 Hoy` | `📅 Próximas` | `📅 Semanal` | `📊 Mensual` | `➕ Nueva Cita`
**Botones extra:** `📊 Reporte asistencia` (top right)
**CTA vacío:** `+ Registrar paciente`
**Sección inferior:** "Resumen de Agenda" HOY/SEMANA

### Refactorizado
**Sala de Espera:** header naranja, `0 En espera` | `0 Atendiendo` (solo 2 contadores)
**Botón:** `Llamar siguiente paciente` (teal)
**Calendario de Citas:** citas programadas
**Badge fuente:** "Supabase" (debe ser "D1")

### GAPS AGENDA
| ID | Severidad | Feature | Estado |
|----|-----------|---------|--------|
| GAP-A01 | 🟠 ALTO | Contadores Atendidos + Programadas | Solo 2 de 4 |
| GAP-A02 | 🟠 ALTO | Vista Semanal | No |
| GAP-A03 | 🟠 ALTO | Vista Mensual | No |
| GAP-A04 | 🟠 ALTO | Reporte de asistencia | No |
| GAP-A05 | 🟡 MEDIO | Resumen de Agenda | Parcial |
| GAP-A06 | 🟡 MEDIO | Badge dice "Supabase" en vez de "D1" | Bug visual |

## 5.5 EMPRESAS

### Monolito
**Lista:** Cards con NIT, nombre, ciudad, actividad económica
**Tabs por empresa:**
1. Datos — formulario completo
2. Pacientes — lista filtrada inline
3. Historial — timeline de HCs
4. Facturación — cuentas de cobro
5. Encuestas — gestión de encuestas
6. Portal — activación portal empresarial
7. Documentos — documentos corporativos
**Global:** Portafolio integrado, Convenio vencimiento tracker

### Refactorizado
**Tabs:** Empresas (lista) | `+ Nueva Empresa` | Convenios | Encuestas | Análisis Docs
**Por empresa:** Editar | Eliminar | Portal desactivado badge | Contador pacientes
**Fuente:** D1

### GAPS EMPRESAS
| ID | Severidad | Feature | Estado |
|----|-----------|---------|--------|
| GAP-E01 | 🟠 ALTO | Tab Historial de HCs | No |
| GAP-E02 | 🟠 ALTO | Tab Facturación inline | No |
| GAP-E03 | 🟠 ALTO | Tab Documentos | Parcial (AnalisisDocsTab) |
| GAP-E04 | 🟠 ALTO | Tab Pacientes filtrados inline | No (solo contador) |
| GAP-E05 | 🟡 MEDIO | Portafolio integrado | No |
| GAP-E06 | 🟡 MEDIO | Tracker convenio vencimiento | Sin alerta visual |

## 5.6 HC OCUPACIONAL

### Monolito — 26 secciones implementadas
1. Encabezado FOR-SST-001 v4.0
2. Consentimiento informado digital
3. Datos personales
4. Datos laborales
5. Antecedentes patológicos agrupados
6. Hábitos
7. Vacunación
8. Examen físico — 29 sistemas corporales ✅
9. Riesgos laborales (8 categorías)
10. Agudeza visual
11. Examen corazón
12. Examen alturas
13. Examen osteomuscular
14. Examen espacios confinados
15. Examen manipulación alimentos
16. Signos vitales
17. Diagnóstico CIE-10 con IA
18. Concepto de aptitud + Restricciones + Recomendaciones
19. Fórmula médica
20. Solicitud de paraclinicos
21. Incapacidad
22. Derivaciones
23. Análisis IA completo
24. Consentimiento final + firma digital
25. Código de verificación
26. Perfil de cargo

### Refactorizado — HistoriaOcupacional.jsx (2206 líneas)
Implementado con spread completo del paciente.

### GAPS HC OCUPACIONAL
| ID | Severidad | Feature | Estado |
|----|-----------|---------|--------|
| GAP-HC01 | 🟠 ALTO | Examen físico 29 sistemas | ✅ RESUELTO (Sprint A3) |
| GAP-HC02 | 🟠 ALTO | RecommendationsPanel | ✅ RESUELTO (Sprint A4) |
| GAP-HC03 | 🟠 ALTO | RestrictionsPanel | ✅ RESUELTO (Sprint A4) |
| GAP-HC04 | 🟡 MEDIO | Vacunación tab/sección | Campo existe, sin UI |
| GAP-HC05 | 🟡 MEDIO | Examen alturas detallado | Campo existe, sin UI dedicada |
| GAP-HC06 | 🟡 MEDIO | Examen confinados detallado | Campo existe, sin UI dedicada |
| GAP-HC07 | 🟡 MEDIO | Examen alimentos detallado | Campo existe, sin UI dedicada |
| GAP-HC08 | 🟡 MEDIO | Contador ediciones + motivoEdicion | Parcial |
| GAP-HC09 | 🟢 BAJO | QR real en certificado | ✅ RESUELTO (qrcode npm) |

## 5.7 FACTURACIÓN / CONTABILIDAD

### Monolito
1. Cuentas de Cobro — facturas con templates
2. Módulo Financiero — Caja + Cuentas
3. Contabilidad V2 — Pagos · Pendientes (conciliación)
4. Propuestas — Cotizaciones con PDF
5. Contabilidad — P&L · KPIs · Fiscal

### Refactorizado
**Tabs:** Facturación | Propuestas | DIAN
**Caja:** CajaPage separada (`/caja`)
**Contabilidad:** ContabilidadPage.jsx (312 líneas, ContabilidadV2 completa)

### GAPS FACTURACIÓN
| ID | Severidad | Feature | Estado |
|----|-----------|---------|--------|
| GAP-F01 | ✅ RESUELTO | Contabilidad V2 | Implementada (312 líneas) |
| GAP-F02 | 🟠 ALTO | Conciliación de pagos pendientes | Parcial |
| GAP-F03 | 🟡 MEDIO | RIPS export desde header | Solo en /billing/dian |

## 5.8 HEADER / ACCIONES GLOBALES

### Monolito Header — Row 1
| Botón | Refactorizado |
|-------|---------------|
| `IA` | Parcial (Config IA en header) |
| `Importar` | 🔴 Ausente |
| `Backup` | Settings (más pasos) |
| `RIPS` | 🔴 Ausente del header |
| `Guardar en Nube` | Presente en sync indicator |
| `Nube` | Presente como badge |
| `Exámenes` | 🔴 Ausente |
| `Firma` | En ProfilePage |

### Monolito Header — Row 2
| Botón | Refactorizado |
|-------|---------------|
| `Custodia` | En tab nav |
| `Tele` | En tab nav |
| `Agenda` | En tab nav + main nav |
| `[chat]` | Bell icon en header |
| `Planes` | En tab nav |

### GAPS HEADER
| ID | Severidad | Feature | Estado |
|----|-----------|---------|--------|
| GAP-G01 | 🔴 CRÍTICO | Importar pacientes en lote | No |
| GAP-G02 | 🔴 CRÍTICO | RIPS generación rápida desde header | Solo en /billing/dian |
| GAP-G03 | 🔴 CRÍTICO | Portal de exámenes externos | No |
| GAP-G04 | 🟡 MEDIO | Backup manual con un click | Solo en Settings |
| GAP-G05 | 🟡 MEDIO | Header compacto con acciones frecuentes | Acciones dispersas |

## 5.9 SG-SST

### Monolito
Módulo SG-SST completo en el monolito.

### Refactorizado — El módulo más completo (4,432 líneas)
7 sub-componentes existen pero están **ENCLAUSTRADOS** porque `SGSSTPage.jsx` no pasa `onNavigate`:

| Sub-módulo | Archivo | Líneas |
|------------|---------|--------|
| Dashboard principal | SSTDashboard.jsx | 530 |
| Matriz de Riesgos (IPEVR) | RiskMatrix.jsx | 676 |
| Módulo Capacitaciones | TrainingModule.jsx | 485 |
| Investigación de Accidentes | AccidentInvestigation.jsx | 595 |
| Inspecciones | InspectionChecklist.jsx | 582 |
| Repositorio Documentos | DocumentRepository.jsx | 525 |
| Plan Anual | AnnualPlan.jsx | 497 |
| Generador de Política | PolicyGenerator.jsx | 542 |
| **TOTAL** | | **4,432** |

⚠️ **BUG:** `SSTDashboard` tiene 6 botones "Acciones rápidas" y 4 KPI cards con `handleNav()` pero `SGSSTPage.jsx` renderiza `<SSTDashboard />` sin pasar `onNavigate`. Todos los botones son no-ops.

## 5.10 REPORTES

### Monolito
Reportes epidemiológicos completos.

### Refactorizado
**EpidemiologicalReport.jsx:** 1113 líneas — reescrito completamente en sesión anterior.
- Gráficos, tablas, exportación, filtros avanzados
- Diagnósticos más frecuentes, distribución por edad/género/empresa
- ✅ COMPLETO

## 5.11 CERTIFICADOS / PORTAL

### Monolito
- Portal por código: `/portal/:code` → `siso_portal_CV-SISO-*`
- Portal por doc: `/portal/doc_:docNumero` → `siso_portal_doc_*`
- Portal empresa: `siso_portal_empresa_docs_*`

### Refactorizado
- CertificadoPage.jsx — genera PDF con QR real (✅ Sprint A2)
- VerificacionPage.jsx — leer desde D1
- WorkerPortalPage.jsx — portal público
- PortalEmpresaPage.jsx — portal empresa
- WhatsApp link en certificado (✅ Sprint D1)

### GAPS CERTIFICADOS
| ID | Severidad | Feature | Estado |
|----|-----------|---------|--------|
| GAP-C01 | ✅ RESUELTO | QR apunta a URL verificación | Implementado |
| GAP-C02 | 🟡 MEDIO | Portal empresa por NIT | PortalCertificadosEmpresa.jsx existe |

## 5.12 OTROS MÓDULOS

| Módulo | Monolito | Refactorizado | Estado |
|--------|----------|---------------|--------|
| Telemedicina | ✅ | ✅ | 🟢 OK |
| Custodia | ✅ | ✅ (migrado a D1) | 🟢 OK |
| Habeas Data | ✅ | ⚠️ Solo localStorage | 🟡 MEDIO |
| Usuarios | ✅ | ⚠️ Usa Supabase (no D1) | 🔴 CRÍTICO |
| Planes | ✅ | ✅ | 🟢 OK |
| Portafolio | ✅ | ⚠️ Stub (59 líneas, localStorage) | 🟢 BAJO |
| ARL | ✅ | ⚠️ Solo localStorage | 🟡 MEDIO |
| Encuestas | ✅ | ⚠️ Sin vista respuestas | 🟡 MEDIO |
| Cotizaciones | ✅ | ⚠️ BUG CRASH useBackendObject | 🔴 CRÍTICO |
| Caja | ✅ | ⚠️ Simplificado | 🟡 MEDIO |

---

# 6. GAPS CONSOLIDADOS (47 GAPS ORIGINALES)

## 🔴 CRÍTICOS (9)

| ID | Módulo | Descripción |
|----|--------|-------------|
| GAP-D01 | Dashboard | Botones header: Importar, Backup, RIPS, Guardar en Nube, Exámenes, Firma |
| GAP-D02 | Dashboard | CUENTAS PENDIENTES con monto $ |
| GAP-F01* | Facturación | Contabilidad V2 (✅ RESUELTO) |
| GAP-G01 | Header | Importar pacientes en lote (CSV) |
| GAP-G02 | Header | RIPS desde header |
| GAP-G03 | Header | Portal exámenes externos |
| GAP-U01* | Usuarios | UsersPage usa Supabase → migrar D1 |
| GAP-CO01* | Cotizaciones | useBackendObject crash |
| GAP-SG01* | SG-SST | onNavigate no pasado (4,432 líneas enclaustradas) |

*Nuevos gaps V2

## 🟠 ALTOS (18)

| ID | Módulo | Descripción |
|----|--------|-------------|
| GAP-D03 | Dashboard | Alertas inteligentes con "Ver →" |
| GAP-D04 | Dashboard | CTAs prominentes Nueva HC |
| GAP-D05 | Dashboard | Gestión turno médico |
| GAP-D06 | Dashboard | Productividad multi-médico |
| GAP-P01 | Pacientes | Layout tabla |
| GAP-P02 | Pacientes | HISTORIAL column |
| GAP-P03 | Pacientes | Botón email |
| GAP-P04 | Pacientes | Botón WhatsApp |
| GAP-A01 | Agenda | Contadores Atendidos + Programadas |
| GAP-A02 | Agenda | Vista Semanal |
| GAP-A03 | Agenda | Vista Mensual |
| GAP-A04 | Agenda | Reporte asistencia |
| GAP-E01 | Empresas | Tab Historial |
| GAP-E02 | Empresas | Tab Facturación inline |
| GAP-E03 | Empresas | Tab Documentos |
| GAP-E04 | Empresas | Tab Pacientes inline |
| GAP-F02 | Facturación | Conciliación pagos pendientes |
| GAP-EM05* | Empresas | Tabs empresa ausentes |

*Nuevo gap V2

## 🟡 MEDIOS (20)

| ID | Módulo | Descripción |
|----|--------|-------------|
| GAP-D07 | Dashboard | Contabilidad V2 en dashboard |
| GAP-D08 | Dashboard | Header shortcuts row 2 |
| GAP-D09 | Dashboard | Portafolio en ADMINISTRACIÓN |
| GAP-P05 | Pacientes | Filtro rango fechas |
| GAP-P06 | Pacientes | Botón Nueva HC por fila |
| GAP-A05 | Agenda | Resumen Agenda |
| GAP-A06 | Agenda | Badge "Supabase" → "D1" |
| GAP-E05 | Empresas | Portafolio integrado |
| GAP-E06 | Empresas | Tracker convenio vencimiento |
| GAP-F03 | Facturación | RIPS en header |
| GAP-C02 | Certificados | Portal empresa |
| GAP-L01 | Login | Botón Restaurar Copia |
| GAP-HC04 | HC | Vacunación UI |
| GAP-HC05 | HC | Examen alturas UI |
| GAP-HC06 | HC | Examen confinados UI |
| GAP-HC07 | HC | Examen alimentos UI |
| GAP-HC08 | HC | Contador ediciones |
| GAP-G04 | Header | Backup 1-click |
| GAP-G05 | Header | Header compacto |

## 🟢 BAJOS (7)

| ID | Módulo | Descripción |
|----|--------|-------------|
| GAP-P07 | Pacientes | Vista tabla vs cards |
| GAP-HC09 | HC | QR real (✅ RESUELTO) |
| GAP-DATA01 | Datos | Campos principales (✅ RESUELTO) |
| GAP-DATA05 | Datos | _archivado flag |
| GAP-PF02 | Portafolio | Solo localStorage |
| GAP-ENC01 | Encuestas | Sin vista respuestas |
| GAP-HD02 | Habeas Data | Solo localStorage |
| GAP-ARL02 | ARL | Solo localStorage |
| GAP-CJ02 | Caja | CashBox simplificado |

---

# 7. NUEVOS GAPS V2 (9 GAPS)

| ID | Severidad | Módulo | Descripción | Archivo | Esfuerzo |
|----|-----------|--------|-------------|---------|----------|
| GAP-U01 | 🔴 CRÍTICO | Usuarios | UsersPage usa Supabase → migrar a D1 | `UsersPage.jsx` | 30 min |
| GAP-CO01 | 🔴 CRÍTICO | Cotizaciones | `useBackendObject` no importado → crash | `CotizacionesPage.jsx` L:7 | 2 min |
| GAP-SG01 | 🟠 ALTO | SG-SST | `onNavigate` no pasado → sub-módulos inaccesibles | `SGSSTPage.jsx` | 2 h |
| GAP-EM05 | 🟠 ALTO | Empresas | Tabs Historial/Facturación/Docs/Pacientes ausentes | `CompaniesSection.jsx` | 4 h |
| GAP-ENC01 | 🟡 MEDIO | Encuestas | Sin vista de respuestas recibidas | `EncuestasPage.jsx` | 2 h |
| GAP-HD02 | 🟡 MEDIO | Habeas Data | Solo localStorage, sin D1 | `HabeasDataPage.jsx` | 30 min |
| GAP-ARL02 | 🟡 MEDIO | ARL | Solo localStorage, sin D1 | `ARLPage.jsx` | 30 min |
| GAP-CJ02 | 🟡 MEDIO | Caja | CashBox simplificado (sin % médico, CSV, categorías) | `CashBox.jsx` | 3 h |
| GAP-PF02 | 🟢 BAJO | Portafolio | Solo localStorage, sin D1 | `PortafolioPage.jsx` | 20 min |

---

# 8. PLAN DE ACCIÓN POR SPRINTS

## P0 — CRÍTICOS INMEDIATOS (bugs que crashean o datos no persisten)

| ID | Tarea | Archivo | Esfuerzo |
|----|-------|---------|----------|
| P0-01 | `GAP-CO01`: Agregar `useBackendObject` al import | `CotizacionesPage.jsx` L:7 | 2 min |
| P0-02 | `GAP-U01`: Migrar UsersPage a D1 | `UsersPage.jsx` | 30 min |

## P1 — ALTO IMPACTO, BAJO ESFUERZO

| ID | Tarea | Archivo | Esfuerzo |
|----|-------|---------|----------|
| P1-01 | `GAP-SG01`: Pasar `onNavigate` y mapear sub-módulos SG-SST | `SGSSTPage.jsx` | 2 h |
| P1-02 | `GAP-HD02`: Migrar HabeasData a D1 | `HabeasDataPage.jsx` | 30 min |
| P1-03 | `GAP-ARL02`: Migrar ARL a D1 | `ARLPage.jsx` | 30 min |
| P1-04 | `GAP-PF02`: Migrar Portafolio a D1 | `PortafolioPage.jsx` | 20 min |

## P2 — FEATURES QUE AMPLÍAN FUNCIONALIDAD

| ID | Tarea | Archivo | Esfuerzo |
|----|-------|---------|----------|
| P2-01 | `GAP-EM05`: Tabs empresa: Historial/Facturación/Docs/Pacientes | `CompaniesSection.jsx` | 4 h |
| P2-02 | `GAP-CJ02`: Ampliar CashBox (% médico, CSV, categorías) | `CashBox.jsx` | 3 h |
| P2-03 | `GAP-ENC01`: Vista respuestas encuestas | `EncuestasPage.jsx` | 2 h |
| P2-04 | `GAP-D02`: KPI cuentas pendientes con monto $ | `DashboardPage.jsx` | 1 h |

## P3 — SPRINTS ORIGINALES PENDIENTES

| Sprint | Tarea | Archivo | Esfuerzo |
|--------|-------|---------|----------|
| P1-01 | Botón Importar pacientes | `SettingsPage.jsx` | 3 h |
| P1-02 | RIPS en header | `Layout.jsx` | 1 h |
| P1-03 | Contabilidad V2 | Ya existe ✅ | - |
| P2-01 | HISTORIAL column pacientes | `PatientList.jsx` | 1 h |
| P2-02 | Email + WhatsApp buttons | `PatientList.jsx` | 30 min |
| P2-03 | Agenda vistas Semanal + Mensual | `AgendaView.jsx` | 3 h |
| P2-04 | Agenda 4 contadores | `QueueManager.jsx` | 30 min |
| P2-05 | Agenda reporte asistencia | `AgendaView.jsx` | 2 h |
| P2-06 | Empresas tab Historial | `CompaniesSection.jsx` | 2 h |
| P2-07 | Empresas tab Facturación | `CompaniesSection.jsx` | 2 h |
| P2-08 | Dashboard alertas inteligentes | `DashboardPage.jsx` | 2 h |
| P3-01 | Header botones globales | `Layout.jsx` | 2 h |
| P3-02 | Pacientes date range filter | `PatientList.jsx` | 1 h |
| P3-03 | HC sección Vacunas | `HistoriaOcupacional.jsx` | 2 h |
| P3-04 | HC exámenes especiales UI | `HistoriaOcupacional.jsx` | 3 h |
| P3-05 | Dashboard turno médico | `DashboardPage.jsx` | 2 h |
| P3-06 | Portafolio completo | `PortafolioPage.jsx` | 3 h |

---

# 9. CHECKLIST DE VALIDACIÓN

Antes de implementar cualquier cambio:

- [ ] Leer el archivo fuente completo (no asumir)
- [ ] Verificar campo D1 exacto (`p.nombresDelCampo` vs `p.otroNombre`)
- [ ] No cambiar claves D1 ni nombres de rutas
- [ ] No exponer `VITE_WORKER_TOKEN` en logs, console, o código
- [ ] Build con `npx vite build --emptyOutDir=false`
- [ ] Git commit desde PowerShell Windows (no bash sandbox)
- [ ] Verificar en prod `siso-appultimo-arp.pages.dev` tras deploy
- [ ] No modificar archivos `.env` sin confirmación explícita
- [ ] Verificar tests existentes pasan

---

# 10. REFERENCIA DE ARCHIVOS

| Módulo | Archivo Refactorizado | Líneas |
|--------|-----------------------|--------|
| App Router | `src/App.jsx` | - |
| Layout/Header | `src/app/Layout.jsx` | - |
| Login | `src/pages/LoginPage.jsx` | - |
| Dashboard | `src/pages/DashboardPage.jsx` | - |
| Pacientes | `src/pages/PatientsPage.jsx` | - |
| Pacientes List | `src/modules/patients/components/PatientList.jsx` | - |
| Agenda | `src/pages/AgendaPage.jsx` | - |
| Agenda View | `src/modules/agenda/components/AgendaView.jsx` | - |
| Queue Manager | `src/modules/agenda/components/QueueManager.jsx` | - |
| Empresas | `src/pages/CompaniesPage.jsx` | - |
| Companies Section | `src/sections/CompaniesSection.jsx` | 1,794 |
| HC Ocupacional | `src/sections/HistoriaOcupacional.jsx` | 2,206 |
| Examen Físico | `src/modules/clinical/components/PhysicalExam.jsx` | - |
| Recomendaciones | `src/modules/clinical/components/RecommendationsPanel.jsx` | - |
| Restricciones | `src/modules/clinical/components/RestrictionsPanel.jsx` | - |
| Historia Page | `src/pages/HistoriaPage.jsx` | - |
| Reportes | `src/modules/reports/components/EpidemiologicalReport.jsx` | 1,113 |
| Facturación | `src/pages/BillingPage.jsx` | - |
| Bill Generator | `src/modules/billing/components/BillGenerator.jsx` | - |
| Caja | `src/pages/CajaPage.jsx` | - |
| CashBox | `src/modules/billing/components/CashBox.jsx` | 136 |
| Contabilidad | `src/pages/ContabilidadPage.jsx` | 312 |
| Cotizaciones | `src/pages/CotizacionesPage.jsx` | ⚠️ BUG |
| SG-SST | `src/pages/SGSSTPage.jsx` | ⚠️ BUG |
| SST Dashboard | `src/modules/sgsst/components/SSTDashboard.jsx` | 530 |
| Risk Matrix | `src/modules/sgsst/components/RiskMatrix.jsx` | 676 |
| Training Module | `src/modules/sgsst/components/TrainingModule.jsx` | 485 |
| Accident Invest. | `src/modules/sgsst/components/AccidentInvestigation.jsx` | 595 |
| Inspection Checklist | `src/modules/sgsst/components/InspectionChecklist.jsx` | 582 |
| Document Repository | `src/modules/sgsst/components/DocumentRepository.jsx` | 525 |
| Annual Plan | `src/modules/sgsst/components/AnnualPlan.jsx` | 497 |
| Policy Generator | `src/modules/sgsst/components/PolicyGenerator.jsx` | 542 |
| Telemedicina | `src/pages/TelemedicinePage.jsx` | - |
| Certificado | `src/pages/CertificadoPage.jsx` | - |
| Verificación | `src/pages/VerificacionPage.jsx` | - |
| Custodia | `src/pages/CartaCustodiaPage.jsx` | ✅ D1 |
| Habeas Data | `src/pages/HabeasDataPage.jsx` | ⚠️ localStorage |
| Usuarios | `src/pages/UsersPage.jsx` | ⚠️ Supabase |
| Planes | `src/pages/PlanesPage.jsx` | - |
| Portafolio | `src/pages/PortafolioPage.jsx` | 59 (stub) |
| Portal Empresa | `src/pages/PortalEmpresaPage.jsx` | - |
| Worker Portal | `src/pages/WorkerPortalPage.jsx` | - |
| ARL | `src/pages/ARLPage.jsx` | ⚠️ localStorage |
| Encuestas | `src/pages/EncuestasPage.jsx` | 272 |
| Auth Store | `src/stores/authStore.js` | - |
| AI Store | `src/stores/aiStore.js` | - |
| UI Store | `src/stores/uiStore.js` | - |
| Companies Store | `src/stores/companiesStore.js` | - |
| D1 Client | `src/lib/d1Client.js` | - |
| Initial States | `src/shared/data/initialStates.js` | 29 sistemas |
| Worker | `siso-worker/index.js` | 318 |
| D1 Schema | `siso-worker/schema.sql` | - |
| Wrangler Config | `siso-worker/wrangler.json` | - |

---

# 11. HISTORIAL DE SESIONES

## Sesión 2026-06-20
- EpidemiologicalReport reescrito (703L → 1113L)
- AnalisisDocsTab creado (268L)
- CompaniesSection actualizado (1794L)

## Sesión 2026-06-23 (Re-auditoría V2)
- Corregidos falsos positivos del protocolo V1
- Descubiertos 9 nuevos gaps (U01, CO01, SG01, EM05, ENC01, HD02, ARL02, CJ02, PF02)
- PhysicalExam 29 sistemas → ✅ COMPLETO
- RecommendationsPanel/RestrictionsPanel → ✅ COMPLETO
- QR real en certificado → ✅ COMPLETO
- CartaCustodiaPage D1 → ✅ COMPLETO
- WhatsApp en certificado → ✅ COMPLETO
- Auto-registro caja → ✅ COMPLETO

## Sesión 2026-06-30
- PhysicalExam expandido: 15→29 sistemas
- Mapa de 10 vistas con % completitud
- Tracking oficial de migración

## Sesión 2026-07-06 (PROTOCOLO MAESTRO DEFINITIVO)
- 7 sub-agentes de exploración paralela
- 22 documentos de protocolo consolidados
- 56 gaps totales documentados
- Mapa completo de arquitectura
- Modelo de datos canónico documentado
- Plan de acción por prioridad

---

# APÉNDICE A: COLORES Y ESTILOS DEL MONOLITO

## Paleta de Colores Principal
- **Primario:** emerald-600 (#059669) → teal-500 (#14b8a6)
- **Secundario:** indigo-600 (#4f46e5)
- **Success:** green-500 (#22c55e)
- **Warning:** amber-500 (#f59e0b), yellow-50 (#fefce8)
- **Danger:** red-500 (#ef4444), red-600 (#dc2626)
- **Info:** blue-500 (#3b82f6)
- **Neutral:** gray-50..900, slate-50..900

## Componentes UI Clave del Monolito
- **Botones primarios:** `bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all`
- **Cards:** `bg-white rounded-2xl shadow-md border border-gray-100 p-6`
- **Inputs:** `w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent`
- **Badges:** `px-3 py-1 rounded-full text-xs font-semibold`
- **Tabs:** `border-b-2 border-transparent hover:border-emerald-500 pb-2 transition-colors`

---

# APÉNDICE B: INTERACCIONES CON IA

## Configuración IA (4 proveedores)
1. **Google Gemini** — `generativelanguage.googleapis.com`
2. **Groq** — `api.groq.com`
3. **Together AI** — `api.together.ai`
4. **OpenRouter** — `openrouter.ai`

## Uso de IA en la Aplicación
- **LoginPage:** Configuración de API keys en panel toggle
- **DashboardPage:** Botón "IA Resumen del Día"
- **HistoriaPage:** Análisis IA de HC, generación de diagnósticos CIE-10
- **aiStore.js:** Gestión centralizada de proveedores y API keys
- **AIDoctorPanel:** Panel de asistente IA para el médico
- **AIAssistant:** Asistente contextual por módulo

## Almacenamiento de API Keys
- **sessionStorage** (se limpia al cerrar pestaña) — política de seguridad
- NO se persisten en D1 ni localStorage
- Clave: `siso_ai_config` con estructura `{provider: {apiKey, enabled}}`

---

# APÉNDICE C: COMANDOS ÚTILES

```bash
# Desarrollo local
npm run dev                 # Frontend Vite (puerto 5173)
npm run dev:backend         # Backend Express (puerto 3001)
npm run dev:all             # Ambos concurrentemente

# Build
npm run build               # Vite build
npx vite build --emptyOutDir=false  # Build sin borrar public/

# Testing
npm test                    # Vitest run
npm run test:watch          # Vitest watch

# Linting
npm run lint                # ESLint

# Git (PowerShell)
.\commit-fixes.ps1          # Commit de fixes
.\commit-chunks.ps1         # Commit por chunks
.\commit-paridad.ps1        # Commit de paridad
.\commit-sprint-A.ps1       # Commit sprint A
.\revert-chunks.ps1         # Revertir chunks

# Deploy (Cloudflare Pages)
# El deploy es automático vía git push a la rama principal
# URL producción: https://siso-appultimo-arp.pages.dev
# URL monolito: https://ocupasaludparadesplegar-f4q.pages.dev
```

---

# APÉNDICE D: MAPA DE RUTAS COMPLETO

| Ruta | Página | Estado |
|------|--------|--------|
| `/` | DashboardPage | 🟠 80% |
| `/login` | LoginPage | 🟡 85% |
| `/patients` | PatientsPage | 🟠 75% |
| `/patients/:docNumero/hc` | HistoriaPage (HC Ocupacional) | 🟡 85% |
| `/patients/:docNumero/hc-general` | HistoriaPage (HC General) | 🟢 95% |
| `/agenda` | AgendaPage | 🟠 70% |
| `/companies` | CompaniesPage | 🟠 70% |
| `/billing` | BillingPage | 🟡 85% |
| `/billing/dian` | DianExport | 🟡 80% |
| `/caja` | CajaPage | 🟡 75% |
| `/contabilidad` | ContabilidadPage | 🟢 90% |
| `/cotizaciones` | CotizacionesPage | 🔴 CRASH |
| `/reports` | ReportsPage | 🟢 95% |
| `/sgsst` | SGSSTPage | 🟠 60% (BUG onNavigate) |
| `/telemedicine` | TelemedicinePage | 🟢 90% |
| `/certificado/:docNumero` | CertificadoPage | 🟢 95% |
| `/verificar/:codigo` | VerificacionPage | 🟢 90% |
| `/carta-custodia` | CartaCustodiaPage | 🟢 95% |
| `/habeas-data` | HabeasDataPage | 🟡 80% |
| `/users` | UsersPage | 🔴 Supabase |
| `/planes` | PlanesPage | 🟢 90% |
| `/portafolio` | PortafolioPage | 🟢 60% (stub) |
| `/portal-empresa` | PortalEmpresaPage | 🟡 85% |
| `/portal-trabajador` | WorkerPortalPage | 🟡 80% |
| `/profile` | ProfilePage | 🟢 90% |
| `/settings` | SettingsPage | 🟡 80% |
| `/arl` | ARLPage | 🟡 80% |
| `/encuestas` | EncuestasPage | 🟡 75% |
| `/encuestas/enviar/:id` | EnviarEncuestaPage | 🟢 90% |
| `/encuestas/responder/:id` | SurveyResponsePage | 🟢 90% |
| `/notificaciones` | NotificacionesPage | 🟢 90% |
| `/chat` | ChatPage | 🟡 80% |
| `/ia-config` | IAConfigPage | 🟢 95% |

---

*Protocolo Maestro Definitivo compilado: 2026-07-06 | 7 sub-agentes | 22 documentos | 892 líneas de protocolos previos | Código fuente completo auditado*