# SISO OcupaSalud v2.0

Historia Clínica Ocupacional · Colombia · Res. 1843/2025

Aplicación React completamente modularizada a partir del monolito original (`App.jsx`, 45 085 líneas). Arquitectura limpia con Vite + Zustand + Tailwind CSS v3 y suite de auto-tests Vitest.

---

## Estructura del proyecto

```
siso-app-v2/
├── src/
│   ├── App.jsx                     # Router principal (~226 líneas)
│   ├── main.jsx
│   ├── index.css
│   │
│   ├── stores/                     # Estado global (Zustand)
│   │   ├── authStore.js            # Usuario, login, bloqueo
│   │   ├── uiStore.js              # Vista, navStack, alertas
│   │   ├── patientsStore.js        # Pacientes, reportes
│   │   └── companiesStore.js       # Empresas, usuarios, firma, AI
│   │
│   ├── utils/                      # Lógica de negocio
│   │   ├── crypto.js               # SHA-256, PBKDF2, sanitize
│   │   ├── security.jsx            # Rate limit, sesión, FortalezaPass
│   │   ├── helpers.js              # numeroALetras, analyzeBP/HR/BMI
│   │   ├── firma.js                # Hash HC, QR, firma digital
│   │   ├── rips.js                 # RIPS JSON Res. 2275/2023 + FHIR R4
│   │   ├── storage.js              # localStorage/Supabase helpers
│   │   ├── rda.js                  # RDA Res. 1888/2025
│   │   ├── aiEngine.js             # Providers IA + parseAIJSON
│   │   └── certificado.js          # HTML certificado médico
│   │
│   ├── data/                       # Catálogos y constantes
│   │   ├── initialState.js         # Estados iniciales HC, permisos
│   │   ├── medicamentos.js         # 286+ medicamentos CO
│   │   ├── cie10.js                # CIE-10 ocupacional
│   │   ├── cups.js                 # CUPS ocupacional
│   │   ├── cie11.js                # Equivalencias CIE-11
│   │   ├── derivaciones.js         # Especialidades derivación
│   │   ├── restricciones.js        # Restricciones laborales
│   │   ├── recomendaciones.js      # Recomendaciones médicas
│   │   ├── planConfig.js           # Planes libre/starter/pro/clinica
│   │   └── dropdowns.js            # ARL, AFP, EPS, contratos, etc.
│   │
│   ├── components/                 # Componentes reutilizables
│   │   ├── ui/                     # InputGroup, PlanGate, PrintStyles, AIConfigPanel
│   │   ├── medico/                 # DoctorSignature, CIE10Input
│   │   ├── historia/               # TabFormula, TabAdjuntos, TabSolicitud,
│   │   │                           #   TabIncapacidad, EvolucionModal,
│   │   │                           #   RestriccionesPanel, RecomendacionesPanel
│   │   ├── admin/                  # LicenciasTab
│   │   ├── layout/                 # Navbar
│   │   ├── portal/                 # PortalPublicoTrabajador
│   │   ├── MensajesOverlay.jsx
│   │   └── Cotizacion.jsx
│   │
│   ├── pages/                      # 27 páginas extraídas
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── HistoriaOcupacional.jsx
│   │   ├── HistoriaGeneral.jsx
│   │   ├── Certificado.jsx
│   │   ├── Reporte.jsx
│   │   ├── Patients.jsx
│   │   ├── Companies.jsx
│   │   ├── Agenda.jsx
│   │   ├── AsistenciaAgenda.jsx
│   │   ├── Bill.jsx
│   │   ├── Caja.jsx
│   │   ├── Contabilidad.jsx
│   │   ├── Cotizaciones.jsx
│   │   ├── PerfilIPS.jsx
│   │   ├── Planes.jsx
│   │   ├── Portafolio.jsx
│   │   ├── Propuestas.jsx
│   │   ├── Users.jsx
│   │   ├── SVE.jsx
│   │   ├── ARL.jsx
│   │   ├── HabeasData.jsx
│   │   ├── Telemedicina.jsx
│   │   ├── Verification.jsx
│   │   ├── PortalTrabajador.jsx
│   │   ├── PortalEmpresa.jsx
│   │   └── SuperAdmin.jsx
│   │
│   └── test/                       # Suite Vitest
│       ├── setup.js                # Mocks localStorage, webcrypto
│       ├── crypto.test.js          # 21 tests
│       ├── security.test.js        # 12 tests
│       ├── helpers.test.js         # 21 tests
│       ├── firma.test.js           # 10 tests
│       ├── rips.test.js            # 13 tests
│       ├── data.test.js            # 16 tests
│       └── stores.test.js          # 17 tests
│
├── vite.config.js                  # Vitest configurado (jsdom, v8)
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .gitignore
```

---

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests (107 tests, 0 fallas)
npm test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage

# Build de producción
npm run build
```

---

## Tests — Resultado final

| Suite | Tests | Estado |
|---|---|---|
| crypto.test.js | 21 | ✅ |
| security.test.js | 12 | ✅ |
| helpers.test.js | 21 | ✅ |
| firma.test.js | 10 | ✅ |
| rips.test.js | 13 | ✅ |
| data.test.js | 16 | ✅ |
| stores.test.js | 17 | ✅ |
| **Total** | **107** | **✅ 0 fallas** |

---

## Tecnologías

- **Vite 6** + **React 18**
- **Zustand** (estado global)
- **Tailwind CSS v3**
- **Vitest** + **jsdom** (tests)
- **Web Crypto API** (seguridad)

## Normativa colombiana implementada

- Res. 1843/2025 — Historia Clínica Ocupacional
- Res. 2275/2023 — RIPS
- Res. 1888/2025 — RDA / FHIR R4
- Ley 1581/2012 — Habeas Data
- Ley 527/1999 — Firma electrónica

---

*OcupaSalud · Dr. Julian Cucalon · Popayán, Colombia*
