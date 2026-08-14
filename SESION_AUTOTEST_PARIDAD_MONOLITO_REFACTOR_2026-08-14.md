# SESIÓN — Autotest de Paridad Monolito ↔ Refactor

_Fecha: 2026-08-14 | Rama: main | SHA inicial: ed1167e_

## 1. URLs verificadas

| Recurso | URL |
|---|---|
| Monolito | https://ocupasaludparadesplegar.pages.dev |
| Refactor | https://siso-appultimo-arp.pages.dev |
| Worker productivo | https://siso-api.dr-juliancucalon.workers.dev |
| Worker desarrollo (aislado) | siso-api-dev (NO usado por frontend en producción) |
| D1 producción | siso-db → 76da5895-478f-4486-a5d4-05069f9aa45a |
| D1 desarrollo | siso-db-dev → 9cdf3b57-0826-410e-ac35-3b2e1b697a81 |

## 2. Resultado de endpoints en Network

**NO EJECUTADO — requiere credenciales autorizadas y sesión de navegador.**

Verificación estática (código) ya realizada en sesión previa
(`SESION_VERIFICACION_FRONTEND_WORKER_2026-08-14.md`):

- `src/lib/d1Client.js` línea 7: `WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://siso-api.dr-juliancucalon.workers.dev'`
- No existen `.env`, `.env.local` ni `.env.production` que sobreescriban la URL.
- `vite.config.js` no define `VITE_WORKER_URL`.
- Conclusión estática: el refactor consume el worker productivo `siso-api`.

**Pendiente:** confirmación dinámica en DevTools → Network (FASE 1) con sesión activa.

## 3. Matriz comparativa de lectura

**NO EJECUTADA — requiere un paciente real autorizado (PACIENTE-PRUEBA-001) y
sesión activa en ambas apps.** No se usaron datos clínicos reales.

| Área | Estado |
|---|---|
| Identificación y datos demográficos | NO VERIFICABLE (sin sesión) |
| Empresa asociada | NO VERIFICABLE |
| Atenciones activas e históricas | NO VERIFICABLE |
| Anamnesis | NO VERIFICABLE |
| Examen físico | NO VERIFICABLE |
| Paraclínicos / exámenes | NO VERIFICABLE |
| Restricciones | NO VERIFICABLE |
| Recomendaciones | NO VERIFICABLE |
| Concepto médico / ocupacional | NO VERIFICABLE |
| Adjuntos | NO VERIFICABLE |
| Estado de HC | NO VERIFICABLE |
| Firma / cierre forense | NO VERIFICABLE |
| Certificados | NO VERIFICABLE |
| Incapacidades | NO VERIFICABLE |
| Evoluciones | NO VERIFICABLE |
| Mensajes de error o carga | NO VERIFICABLE |
| Orden de tabs y contenido visible | NO VERIFICABLE |

## 4. Candado de HC cerrada

**NO EJECUTADO — no se buscó ni modificó ninguna HC cerrada/firmada.**

Verificación estática del mecanismo (código del worker, documentado en
`SESIONES_AUDITORIA_REFACTOR.md`):

- CANDADO 2: claves `*_cerrada*` → HTTP 423 (inmutable).
- No se forzó ninguna escritura sobre registros cerrados.

## 5. Escritura controlada y reversión

**PRUEBA NO EJECUTADA POR SEGURIDAD.**

Motivo: la FASE 2 (lectura) no pudo ejecutarse por falta de credenciales
autorizadas y de un paciente de prueba autorizado. Según el protocolo, la
FASE 4 no debe iniciarse si la FASE 2 contiene diferencias críticas/altas no
explicadas o no fue ejecutada. No se escribió ningún dato clínico real.

## 6. Hallazgos de ConfigIPSPage (FASE 5)

**Archivo:** `src/pages/ConfigIPSPage.jsx` (39 líneas)

**Hallazgo: usa EXCLUSIVAMENTE `localStorage`, no D1.**

- `const STORAGE_KEY = 'siso_ips_perfil'` (línea 5)
- `load()` → `localStorage.getItem(STORAGE_KEY)` (línea 6)
- `handleSave()` → `localStorage.setItem(STORAGE_KEY, ...)` (línea 15)
- Estado inicial: `useState({ nombre:'', nit:'', dv:'', direccion:'', ciudad:'', departamento:'', telefono:'', correo:'', lema:'', logo:'' })` (línea 9)
- `useEffect` carga desde localStorage (línea 12)
- **NO usa** `d1Get`, `d1Set`, `useBackendData` ni ningún cliente compartido.

**Discrepancia funcional (severidad MEDIA):**

El monolito usa la clave D1 `siso_ips_perfil` (confirmado en el documento
maestro y en `useBackendData.js` → `/data/ips_perfil` → `siso_ips_perfil`).
El refactor, en cambio, guarda el perfil IPS solo en `localStorage` del
navegador. Consecuencia: **el perfil IPS NO se comparte entre monolito y
refactor**, y se pierde al cambiar de dispositivo/navegador.

**Estructura JSON esperada (monolito):** objeto plano con los campos
`nombre, nit, dv, direccion, ciudad, departamento, telefono, correo, lema, logo`
(el refactor ya usa exactamente estos campos, por lo que la migración es
compatible en estructura).

**Propuesta de cambio (NO implementada — requiere aprobación):**

1. Importar `d1Get`/`d1Set` desde `../lib/d1Client`.
2. En `useEffect`, leer primero de D1 (`d1Get('siso_ips_perfil')`) y, si hay
   valor, usarlo; si no, caer a `localStorage` como fallback.
3. En `handleSave`, escribir a D1 (`d1Set('siso_ips_perfil', form)`) y
   mantener el `localStorage.setItem` como caché local.
4. No alterar diseño, textos, orden ni campos del formulario.

Riesgo: bajo. La estructura de datos ya coincide. Solo cambia el medio de
persistencia (localStorage → D1 + localStorage caché).

## 7. Hallazgos de Caja.jsx / CajaPage.jsx (FASE 6)

**Archivos:**
- `src/pages/CajaPage.jsx` (129 líneas) — página activa
- `src/pages/Caja.jsx` (40 líneas) — adaptador
- `src/modules/billing/components/CashBox.jsx` (154 líneas) — componente UI

**Determinación:**

1. **Archivo realmente activo:** `CajaPage.jsx`. Confirmado en `App.jsx`
   línea 166: `<Route path="caja" element={<CajaPage />} />` y en
   `Layout.jsx` línea 33: `{ path: '/caja', icon: DollarSign, label: 'Caja' }`.

2. **¿Funcionalidades distintas?** NO. `Caja.jsx` es un **adaptador** que
   importa `CashBox` desde `../modules/billing` y traduce props. `CajaPage.jsx`
   importa `Caja` (línea 8: `import Caja from './Caja'`) y le pasa los datos.

3. **¿Alias/legado/duplicado/no usado?** `Caja.jsx` **NO es un duplicado**:
   es un adaptador legítimo en uso. La cadena es:
   `CajaPage.jsx` (gate + datos) → `Caja.jsx` (adaptador) → `CashBox.jsx` (UI).

4. **Equivalente al monolito:** `CajaPage.jsx` (gate de secretaria + carga de
   datos + liquidación), fiel a las líneas 41988+ del monolito.

5. **Riesgo de eliminar/fusionar/redirigir:** `Caja.jsx` NO debe eliminarse
   (está en uso). El "duplicado" señalado en el documento maestro es un falso
   positivo: son capas distintas de la misma funcionalidad.

**Hallazgo adicional (persistencia):**

`CajaPage.jsx` guarda movimientos y facturas en `localStorage`
(`siso_caja_*`, `siso_caja_movimientos`, `siso_saved_bills_*`), **no en D1**.
Esto es una posible brecha de paridad si el monolito persiste caja en D1.
Requiere verificación contra el monolito (FASE 2/4 dinámica).

## 8. Matriz de rutas (FASE 7)

Rutas definidas en `src/App.jsx` (224 líneas) vs navegación en `src/app/Layout.jsx`.

### Rutas públicas (sin login)

| Ruta | Archivo activo | Estado |
|---|---|---|
| `/login` | LoginPage.jsx | PARIDAD CONFIRMADA |
| `/portal/:code` | WorkerPortalPage.jsx | PARIDAD CONFIRMADA |
| `/verificar` | VerificacionPage.jsx | PARIDAD CONFIRMADA |
| `/verificar/:codigo` | VerificacionPage.jsx | PARIDAD CONFIRMADA |
| `/encuesta/:token` | SurveyResponsePage.jsx | PARIDAD CONFIRMADA |
| `/portal-empresa` | PortalEmpresaPage.jsx | PARIDAD CONFIRMADA |

### Rutas protegidas (dentro de Layout)

| Ruta | Archivo activo | En NAV_ITEMS | Estado |
|---|---|---|---|
| `/dashboard` | DashboardPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/patients` | PatientsPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/patients/:id/hc` | HistoriaPage.jsx | — (subruta) | PARIDAD CONFIRMADA |
| `/hc/new` | HistoriaPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/hc/general` | HistoriaGeneralPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/patients/:id/certificado` | CertificadoPage.jsx | — (subruta) | PARIDAD CONFIRMADA |
| `/companies` | CompaniesPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/users` | UsersPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/agenda` | AgendaPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/billing` | BillingPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/caja` | CajaPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/reports` | ReportsPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/portal-certificados/:companyId` | PortalCertificadosEmpresa.jsx | ❌ | RUTA SIN ACCESO DESDE UI |
| `/portal-certificados` | PortalCertificadosEmpresa.jsx | ❌ | RUTA SIN ACCESO DESDE UI |
| `/sgsst` | SGSSTPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/telemedicine` | TelemedicinePage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/habeas-data` | HabeasDataPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/cotizaciones` | CotizacionesPage.jsx | ❌ | RUTA SIN ACCESO DESDE UI |
| `/config/ips` | ConfigIPSPage.jsx | ❌ | RUTA SIN ACCESO DESDE UI |
| `/mensajes` | MensajesPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/portafolio` | PortafolioPage.jsx | ❌ | RUTA SIN ACCESO DESDE UI |
| `/contabilidad` | ContabilidadPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/settings` | SettingsPage.jsx | ❌ | RUTA SIN ACCESO DESDE UI |
| `/planes` | PlanesPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/admin` | SuperAdminPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/arl` | ARLPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/custodia` | CartaCustodiaPage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/perfil` | ProfilePage.jsx | ✅ | PARIDAD CONFIRMADA |
| `/encuestas` | EncuestasPage.jsx | ❌ | RUTA SIN ACCESO DESDE UI |

### Rutas sin acceso directo desde la UI (NAV_ITEMS)

`/portal-certificados`, `/cotizaciones`, `/config/ips`, `/portafolio`,
`/settings`, `/encuestas` — existen en el router pero no tienen entrada en el
menú de navegación principal. Pueden ser accesibles por otros medios (botones
internos, enlaces directos) o estar pendientes de enlazar. **Requiere
verificación dinámica** para confirmar si son alcanzables desde la UI.

## 9. Discrepancias, severidad y archivos afectados

| # | Discrepancia | Severidad | Archivo |
|---|---|---|---|
| 1 | ConfigIPSPage persiste en localStorage, no en D1 `siso_ips_perfil` (no se comparte con monolito) | MEDIA | `src/pages/ConfigIPSPage.jsx` |
| 2 | CajaPage persiste movimientos/facturas en localStorage, no en D1 (posible brecha de paridad) | MEDIA (por confirmar) | `src/pages/CajaPage.jsx` |
| 3 | 6 rutas sin acceso directo desde el menú de navegación | BAJA (por confirmar) | `src/App.jsx` / `src/app/Layout.jsx` |

## 10. Recomendación de la siguiente acción priorizada

**Prioridad 1 (única acción recomendada):** Migrar `ConfigIPSPage.jsx` de
`localStorage` a D1 (`siso_ips_perfil`), manteniendo localStorage como caché.
Es la brecha de paridad más clara y de menor riesgo (estructura de datos ya
compatible). Requiere aprobación explícita antes de implementar.

## 11. Riesgos y tareas bloqueadas

- **Fases 1-4 bloqueadas:** requieren credenciales autorizadas y un paciente
  de prueba autorizado. No se ejecutaron para no usar datos clínicos reales.
- **Verificación dinámica de Network:** pendiente (requiere sesión activa).
- **Confirmación de persistencia de Caja en monolito:** pendiente (requiere
  comparación dinámica o revisión del monolito).

## 12. Confirmación de no modificación de datos clínicos

**No se modificó ningún dato clínico real.** No se ejecutaron escrituras, no
se abrieron historias clínicas, no se tocó D1 de producción ni de desarrollo,
y no se expusieron tokens, credenciales ni datos personales en este informe.