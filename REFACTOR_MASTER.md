# REFACTOR MASTER - OcupaSalud

## Repositorios
- **MONOLITO (base - solo lectura):** `C:\Users\JQK3\ocupasaludparadesplegar\`
  - Estructura `src/`: `components`, `data`, `hooks`, `pages`, `utils`
  - Monolito funcional (~48K líneas, 2700+ KB) — NO MODIFICAR
- **DESTINO (refactorización activa):** `C:\Users\JQK3\siso-appultimo\`
  - Estructura `src/`: `app`, `components`, `data`, `hooks`, `lib`, `modules`, `pages`, `sections`, `shared`, `stores`, `test`, `utils`
  - Estrategia: **Strangler Fig Pattern** (migración incremental)

---

## Estado de Módulos (Actualizado 6 Jun 2026)

| Módulo | Estado | Notas |
|--------|--------|-------|
| **Code Splitting** (React.lazy todas las rutas) | ✅ Completado | 30+ páginas lazy-loaded con Suspense |
| **Auth Store** (Zustand) | ✅ Completado | Login, JWT, roles, permisos, 2FA, sesión |
| **UI Store** (Zustand) | ✅ Completado | Sidebar, alerts, modals, sync status, AI badge |
| **AI Store** (Zustand + persist) | ✅ Completado | Provider keys (gemini/groq/together/openrouter) |
| **Companies Store** (Zustand) | ✅ Completado | Extraído de App.jsx: companiesTab, editingCompany, encuestas |
| **SG-SST** (módulo nuevo en `modules/`) | ✅ Completado | ~4857 líneas, lazy loading |
| **Catálogos/Shared** (`shared/`) | ✅ Completado | Componentes compartidos extraídos del monolito |
| **App.jsx shell** (router moderno) | ✅ Completado | Sin estado local, todo vía stores |
| **Portal Certificados Empresa** | ✅ Completado | Portal por NIT: certificados, informes, cuentas de cobro |
| **Backend API** (nuevas rutas) | ✅ Completado | Endpoints reports, custodia, bills, certificates |
| **Layout** (`app/Layout.jsx`) | ✅ Completado | Navegación, sidebar, header |
| **AppContext** (extraer estado masivo) | ⚠️ Parcial | Companies ya extraído a store. Resto del estado del monolito (~120 useState) no migrado porque el App.jsx destino ya no usa ese patrón |
| **Empresas (Companies)** | ✅ Completado | Componente completo con CRUD, convenios, portal, sedes, encuestas |
| **Usuarios (Users)** | ✅ Completado | CRUD, roles, permisos secretaria, firma digital |
| **Facturación (Billing)** | ✅ Completado | Facturación, cuentas de cobro |
| **Reportes** | ✅ Completado | Reportes IA, epidemiológicos, históricos |
| **Agenda** | ✅ Completado | Gestión de citas, calendario |
| **Telemedicina** | ✅ Completado | Teleconsultas |
| **Historia Clínica Ocupacional (HC)** | ✅ Completado | HC ocupacional + general |
| **Verificación/Certificados** | ✅ Completado | Portal de verificación y certificados |
| **Carta Custodia** | ✅ Completado | Cartas de custodia con indexación |
| **Testing** | ⏳ Pendiente | Tests unitarios e integración |
| **Build (vite)** | ⚠️ Con errores | Error preexistente: vite:html-inline-proxy con CSS |
| **Documentación** | ⏳ Pendiente | Manual de uso, API docs |

---

## Reglas de Trabajo

1. **NUNCA modificar el MONOLITO** — es solo lectura, fuente de referencia
2. **Leer del MONOLITO, escribir en DESTINO** — toda refactorización se hace en `C:\Users\JQK3\siso-appultimo\`
3. **Máximo 3 archivos leídos por acción** — evitar saturación de contexto
4. **Mostrar diff antes de aplicar cambios** — revisión explícita antes de modificar
5. **Detenerse y esperar OK después de cada módulo** — no avanzar sin confirmación
6. **Mantener el monolito funcional como núcleo** — la app nunca debe quedar rota (Strangler Fig)
7. **Usar React.lazy() + Suspense** para code-splitting y carga bajo demanda
8. **Un módulo a la vez** — probar exhaustivamente antes de pasar al siguiente

---

## Arquitectura del Destino

```
src/
├── App.jsx                    ← Shell ligero (solo router + lazy loading + stores)
├── main.jsx                   ← Entry point
├── styles.css                 ← Estilos globales
├── app/
│   └── Layout.jsx             ← Layout principal (sidebar + header + router outlet)
├── stores/                    ← Estado global (Zustand)
│   ├── authStore.js           ← Auth, roles, permisos, sesión
│   ├── uiStore.js             ← UI state (sidebar, alerts, modals, sync)
│   ├── aiStore.js             ← AI config (providers, keys)
│   └── companiesStore.js      ← Companies tab, editing, encuestas
├── pages/                     ← 42 páginas lazy-loaded
│   ├── Companies.jsx           ← CRUD completo empresas (956 líneas)
│   ├── CompaniesPage.jsx       ← Wrapper page
│   ├── Users.jsx               ← Gestión usuarios
│   ├── UsersPage.jsx           ← Wrapper page
│   ├── Agenda.jsx / AgendaPage.jsx
│   ├── Bill.jsx / BillingPage.jsx
│   ├── Historia.jsx / HistoriaPage.jsx
│   ├── HistoriaGeneralPage.jsx
│   ├── ... (32 archivos más)
├── sections/                  ← Secciones grandes del monolito
│   ├── AgendaSection.jsx
│   ├── CompaniesSection.jsx
│   ├── HistoriaOcupacional.jsx
│   ├── ReporteSection.jsx
│   └── UsersSection.jsx
├── modules/                   ← Módulos nuevos independientes
│   └── sgsst/                 ← SG-SST completo
├── shared/                    ← Código compartido
│   ├── data/                  ← Catálogos, planConfig, constantes
│   ├── lib/                   ← Utilidades (apiClient, security, etc.)
│   └── ui/                    ← Componentes UI reutilizables
├── components/                ← Componentes (portal, etc.)
├── hooks/                     ← Custom hooks
├── data/                      ← Data helpers
├── utils/                     ← Utilidades (bulkDownload, etc.)
├── lib/                       ← Librerías (apiClient)
└── test/                      ← Tests
```

---

## Stores (Zustand) — Estado Global Extraído

| Store | Archivo | Estado extraído | Persistencia |
|-------|---------|----------------|-------------|
| `authStore` | `stores/authStore.js` | currentUser, token, isAuthenticated, loginAttempts, blockedUntil, lastActivity, privacidadAceptada, mustChangePassword, twoFARequired | localStorage |
| `uiStore` | `stores/uiStore.js` | sidebarOpen, activeTab, alertMsg, confirmConfig, promptConfig, syncStatus, aiGenerating | No |
| `aiStore` | `stores/aiStore.js` | activeProvider, keys (gemini/groq/together/openrouter), showConfig, status | localStorage |
| `companiesStore` | `stores/companiesStore.js` | companiesTab, editingCompany, encuestas (add/delete) | localStorage |

---

## Módulos Completados vs Pendientes

### ✅ Completados (refactorización/extracción terminada)
- [x] Code Splitting (lazy loading en todas las rutas)
- [x] Auth Store (Zustand con persistencia)
- [x] UI Store (Zustand)
- [x] AI Store (Zustand con persistencia)
- [x] Companies Store (extraído de App.jsx)
- [x] Companies CRUD completo (956 líneas con store integration)
- [x] Portal Certificados Empresa
- [x] Backend API endpoints (data.js, write.js)
- [x] SG-SST módulo nuevo
- [x] Shared components/catalogs
- [x] Users module
- [x] Agenda module
- [x] Billing module
- [x] Reports module
- [x] HC Ocupacional + General
- [x] Telemedicina
- [x] Carta Custodia
- [x] Verificación/Certificados

### ⏳ Pendientes
- [ ] Build (Vite) — error preexistente con CSS proxy
- [ ] Tests unitarios e integración
- [ ] Documentación de usuario
- [ ] Auditoría de funciones faltantes vs monolito
- [ ] Validación completa de data flow

---

## Problemas Conocidos

1. **Build Vite falla** — Error `Could not load index.html?html-proxy&inline-css&index=0.css` — es un bug preexistente, no relacionado con los cambios de refactorización. Posible solución: verificar configuración de `vite.config.js` o actualizar `@vitejs/plugin-react`.

---

## Archivos Clave del Destino

| Archivo | Propósito |
|---------|-----------|
| `src/App.jsx` | Shell ligero (router + lazy loading + stores) |
| `src/stores/authStore.js` | Store de autenticación (Zustand) |
| `src/stores/uiStore.js` | Store de UI (sidebar, modals, etc.) |
| `src/stores/aiStore.js` | Store de configuración IA |
| `src/stores/companiesStore.js` | Store de companies (extraído de App.jsx) |
| `src/pages/Companies.jsx` | CRUD completo de empresas (~956 líneas) |
| `src/pages/CompaniesPage.jsx` | Wrapper page para lazy loading |
| `src/app/Layout.jsx` | Layout principal con navegación |
| `src/shared/data/planConfig.js` | Configuración de planes (fuente de verdad) |
| `src/modules/` | Módulos nuevos independientes |
| `ESTRATEGIA_MIGRACION.md` | Documento de estrategia Strangler Fig |
| `TODO_IMPLEMENTACION.md` | Checklist de implementación |
| `REFACTOR_MASTER.md` | Este documento |

---

> **Nota:** Este documento se actualizó el 6 de Junio 2026. No existen los archivos `ROOT_PLAN.md` ni `QWEN.md` en el destino. La información de planificación se obtuvo de `ESTRATEGIA_MIGRACION.md` y `TODO_IMPLEMENTACION.md`.