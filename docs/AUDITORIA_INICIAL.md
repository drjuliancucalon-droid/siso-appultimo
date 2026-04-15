# AUDITORÍA COMPLETA: ocupasalud → siso-appultimo
## Fecha: 2026-04-15 | Autor: Yulia

---

## 1. ESTADO ACTUAL DE AMBOS REPOSITORIOS

### ocupasalud (ORIGEN — Monolito Original)
- **Stack:** React 18 + Vite 6 + Tailwind CDN + Lucide React
- **Backend:** Supabase (REST directo desde el frontend — NO hay servidor)
- **Archivo principal:** `src/App.jsx` — **2.2 MB / ~48,000 líneas** (todo en un archivo)
- **Dependencias:** Solo react, react-dom, lucide-react (3 deps)
- **Sin router**, sin state management externo, sin testing

### siso-appultimo (DESTINO — Intento de Refactorización)
- **Stack:** Mismo + Vite 8 (actualizado)
- **Tiene:** estructura modular parcial (`src/modules/`), docs de QA, specs
- **PERO:** Build pasa, runtime CRASHEA (imports faltantes documentados)
- **`src/App.jsx`:** Todavía 1.6 MB (monolito reducido pero no funcional)
- **`src/app/App.jsx`:** 106 KB (intento de App shell, ~38K líneas)
- **Errores:** `.vite/deps` commiteado al repo, `dist/` commiteado

---

## 2. FALLAS CRÍTICAS IDENTIFICADAS

### 🔴 NIVEL CATASTRÓFICO (la app no funciona o es insegura)

**F-01: API Keys hardcodeadas en frontend**
- `supabase.js` tiene la URL y API Key de Supabase en el código fuente
- Cualquiera con DevTools puede ver y usar esas credenciales
- Aunque son "anon keys", permiten CRUD completo sin RLS real

**F-02: SIN BACKEND REAL**
- Toda la lógica (auth, CRUD, sync) corre en el browser
- Las API keys de IA (Gemini, Groq, Together, OpenRouter) se envían y almacenan en localStorage
- No hay servidor que proteja las credenciales ni valide permisos

**F-03: Autenticación FALSA**
- Los passwords se hashean con SHA-256/PBKDF2... pero en el CLIENTE
- Los hashes se guardan en localStorage y se comparan en JavaScript
- No hay JWT, no hay sesiones reales, no hay servidor que valide
- El rate limiting de login es en localStorage (se bypasea limpiando storage)

**F-04: Monolito de 48K líneas en un solo archivo**
- `App.jsx` tiene 120+ useState, ~90 funciones render, toda la lógica
- Imposible de mantener, testear o debuggear
- Cada cambio arriesga romper todo

**F-05: Refactorización anterior ROTA**
- siso-appultimo tiene la estructura modular pero NO funciona en runtime
- 20+ imports faltantes documentados en QA_ISSUES.md
- Dos copias de App.jsx (monolito + shell) = confusión total

### 🟠 NIVEL ALTO (funciona pero es frágil)

**F-06: Sin manejo de errores global** — No hay Error Boundary
**F-07: Sin testing** — Ni un solo test
**F-08: Sin environment variables** — Todo hardcodeado
**F-09: localStorage como "base de datos"** — Se pierden datos al limpiar browser
**F-10: Sin validación de datos en backend** — Cualquier JSON va a Supabase
**F-11: Tailwind por CDN** — No tree-shaking, carga completa
**F-12: Sin TypeScript** — En una app médica con datos sensibles
**F-13: .vite/deps y dist/ commiteados** — Basura en el repo

### 🟡 NIVEL MEDIO (deuda técnica)

**F-14: useAppState.js es un placeholder** — Nunca se implementó
**F-15: Componentes UI duplicados** — Mismos componentes en components/ y modules/
**F-16: Sin lazy loading real** — Se intentó pero no se completó
**F-17: Sin internacionalización** — Strings hardcodeados en español
**F-18: Sin PWA/offline** — Dice "offline support" pero es solo localStorage

---

## 3. FUNCIONALIDADES EXISTENTES (QUE SE DEBEN PRESERVAR)

### Core Médico
- [ ] HC Ocupacional completa
- [ ] HC General
- [ ] Examen físico por sistemas
- [ ] Signos vitales
- [ ] Diagnóstico CIE-10/CIE-11
- [ ] CUPS (procedimientos)
- [ ] Fórmulas/Prescripciones
- [ ] Derivaciones/Interconsultas
- [ ] Restricciones médicas (12 categorías)
- [ ] Recomendaciones médicas

### AI (4 proveedores)
- [ ] Análisis AI de HC
- [ ] Profesiograma AI
- [ ] Reportes epidemiológicos AI
- [ ] Configuración multi-proveedor (Gemini, Groq, Together, OpenRouter)
- [ ] Parse robusto de JSON de IA

### Normativa Colombiana
- [ ] RIPS (Res. 2275/2023)
- [ ] FHIR R4 (Res. 1888/2025)
- [ ] RDA (Resumen Digital)
- [ ] DIAN UBL 2.1
- [ ] Firma digital (Ley 527/1999)
- [ ] Consentimiento informado (Ley 1581/2012)
- [ ] Habeas Data

### Gestión
- [ ] Multi-tenant/organizaciones
- [ ] Roles (super_admin, admin, medico, secretaria, admin_empresa)
- [ ] Planes (libre/starter/pro/clinica)
- [ ] Gestión de empresas con convenios
- [ ] Gestión de usuarios
- [ ] Agenda/citas
- [ ] Facturación/caja
- [ ] Portal trabajador
- [ ] Portal empresa
- [ ] Notificaciones
- [ ] Auditoría
- [ ] Backup/restore
- [ ] Impresión de documentos

---

## 4. ARQUITECTURA PROPUESTA (LA NUEVA)

### Backend REAL (Lo que falta)
```
backend/                    # Node.js + Express/Fastify
├── src/
│   ├── config/            # Variables de entorno
│   ├── middleware/         # Auth JWT, rate-limit, validation
│   ├── routes/            # API REST
│   │   ├── auth.js        # Login, registro, 2FA, refresh
│   │   ├── patients.js    # CRUD pacientes
│   │   ├── companies.js   # CRUD empresas
│   │   ├── clinical.js    # HC, prescripciones
│   │   ├── ai.js          # Proxy a proveedores IA
│   │   ├── reports.js     # RIPS, FHIR, epidemiología
│   │   └── storage.js     # Upload/download archivos
│   ├── services/          # Lógica de negocio
│   ├── models/            # Schema Supabase / Prisma
│   └── utils/             # Helpers
├── .env                   # Credenciales (NUNCA en código)
└── package.json
```

### Frontend Modular (Reestructuración)
```
frontend/
├── src/
│   ├── app/               # Shell
│   │   ├── App.tsx        # Router + layout
│   │   ├── providers.tsx  # Context providers
│   │   └── routes.tsx     # Definición de rutas
│   ├── modules/           # Módulos por dominio
│   │   ├── auth/
│   │   ├── clinical/
│   │   ├── ai/
│   │   ├── companies/
│   │   ├── billing/
│   │   ├── agenda/
│   │   ├── reports/
│   │   ├── patients/
│   │   ├── users/
│   │   ├── notifications/
│   │   └── sgsst/         # NUEVO
│   ├── shared/
│   │   ├── components/    # UI reutilizable
│   │   ├── hooks/
│   │   ├── lib/           # Utilidades
│   │   ├── data/          # Catálogos estáticos
│   │   └── types/         # TypeScript types
│   ├── pages/             # Componentes de ruta
│   └── styles/
├── .env                   # VITE_API_URL, etc.
└── package.json
```

---

## 5. PROTOCOLO DE REFACTORIZACIÓN (20 PASOS)

Ver PROTOCOLO_REFACTORIZACION.md

