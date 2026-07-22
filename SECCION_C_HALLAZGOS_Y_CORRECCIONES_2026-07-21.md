# Sección C — Hallazgos y correcciones (áreas del monolito no comparadas antes)

**Fecha:** 2026-07-21. Continúa `MATRIZ_PARIDAD_MONOLITO_VS_REFACTOR_2026-07-21.md` (Sección C: lista de áreas pendientes de auditar).
**Método:** 4 investigaciones en paralelo código-contra-código (monolito `App.jsx` vs refactor), seguidas de corrección directa de lo más crítico.

---

## Resumen — qué se corrigió en esta pasada (commits `634abcf`, `e9be95f`, `f923f9a`, y los de Telemedicina/authStore)

| # | Hallazgo | Severidad | Estado |
|---|---|:---:|:---:|
| 1 | Propuestas (Facturación): `onSave` no conectado → pérdida garantizada de todo lo guardado | 🔴 Crítico | ✅ Corregido |
| 2 | Cuentas de Cobro (Facturación → BillGenerator): mismo patrón, `onSave` no conectado | 🔴 Crítico | ✅ Corregido |
| 3 | Portal Empresa mostraba diagnósticos CIE-10 reales — viola Art.16 Res. 1843/2025 | 🔴 Crítico (legal) | ✅ Corregido |
| 4 | `/planes`: sin guard de rol, cualquiera edita licencias de cualquiera | 🔴 Crítico (seguridad) | ✅ Corregido |
| 5 | `/admin` (Super Admin): permitía rol `administrador`, el monolito exige solo `super_admin` | 🟠 Alto (seguridad) | ✅ Corregido |
| 6 | `/contabilidad`: sin ninguna protección de ruta | 🟠 Alto (seguridad) | ✅ Corregido |
| 7 | Agenda: botón "Nueva Cita" con `ReferenceError` (crash) | 🟠 Alto (funcional) | ✅ Corregido |
| 8 | Agenda: ningún cambio de cita persistía (solo memoria) | 🟠 Alto (datos) | ✅ Corregido |
| 9 | Mensajería: dos claves de storage distintas (drawer vs página) | 🟠 Alto (datos) | ✅ Corregido |
| 10 | Telemedicina 100% local sin D1 | 🟠 Alto (datos) | ✅ Corregido (pasada anterior) |
| 11 | `authStore.js`: 3 funciones con hash sin salt / búsqueda solo por `.user` | 🟡 Medio (deuda técnica) | ✅ Corregido (pasada anterior) |

---

## Pendiente para una siguiente iteración (documentado, no corregido — requiere más alcance o una decisión de producto)

### Crítico / alto, requieren trabajo sustancial

1. **Modal de Evolución Clínica completamente desconectado** (`src/modules/clinical/components/EvolucionModal.jsx`): guarda en `localStorage` bajo `siso_evoluciones_<patientId>`, aislado de `patientsList`/HC, sin ningún respaldo en la nube. Solo 4 campos SOAP vs. los 7 tabs del monolito (nota/diagnósticos/plan/fórmula/exámenes/incapacidad/concepto médico). Riesgo real de pérdida silenciosa de notas de seguimiento clínico.

2. **Caja — código de seguridad 9207 ausente**: `CashBox.jsx` borra/edita movimientos sin ninguna confirmación (el monolito exige el mismo código usado en Usuarios). Además `savedBillsList` (cuentas de cobro) en `CajaPage.jsx` es solo `localStorage`, perdiendo el merge D1 que sí tiene el monolito (`_persistBillsSafe`).

3. **Contabilidad sustituida por un módulo distinto**: `ContabilidadPage.jsx` no es la vista P&L/Cartera/KPIs/Fiscal (retención 4%/10.5%) de solo lectura del monolito — es un tercer sistema paralelo de "Cuentas de Cobro V2" (`siso_billing_v2`, 100% local). **Esto puede ser una decisión de producto intencional, no un bug** — requiere confirmar con el usuario si se quiere recuperar la vista original, mantener la sustitución, u ofrecer ambas.

4. **SVE y "Análisis de Documentos" completamente inalcanzables**: `SVEPrograms.jsx` (624 líneas, réplica fiel de la heurística de 7 programas del monolito) y `AnalisisDocsEmpresas.jsx` existen y están bien construidos, pero **no tienen ninguna ruta** en `App.jsx` — el botón del Dashboard para SVE navega a `/reports` (módulo distinto). Fix simple: agregar las rutas faltantes.

5. **Agenda: creación de cita sin gate de plan/rol de secretaria**, y Sala de Espera (`QueueManager.jsx`) escribe directo a `localStorage['siso_agendados']` sin pasar por D1 ni por el estado de `AgendaPage` — desincronizada del calendario.

6. **Cambio de contraseña obligatorio inalcanzable**: `mustChangePassword` nunca se lee en `App.jsx`/`Layout.jsx`, `ChangePasswordForm.jsx` nunca se monta — un usuario marcado para cambiar contraseña nunca ve el formulario.

### Medio — riesgo de pérdida de datos por falta de respaldo en la nube (sin D1 ni Supabase)

- Cotizaciones (`CotizacionesPage.jsx`) — regresión: el monolito al menos respalda en Supabase, el refactor no.
- Perfil IPS (`ConfigIPSPage.jsx`) — regresión: mismo caso, y además falta la función de subir logo institucional (el campo existe en el modelo, no hay UI).
- Super Admin (organizaciones) — solo local.
- Mensajería — ya unificada la clave (ver arriba), pero sigue sin ningún respaldo en la nube (el monolito sí tenía Supabase).

### Bajo / cosmético

- Badge de mensajes no leídos en el navbar hardcodeado al literal `"3"`.
- Tabla "Productividad por Médico" del dashboard solo muestra una fila (usuario actual), no el desglose real multi-médico.
- ARL perdió los campos normativos FURAT/FUREP (existen en un componente huérfano `ARLReports.jsx` sin conectar).
- Habeas Data perdió el cálculo dinámico de plazo/urgencia (aunque ganó persistencia D1, mejora neta).

### Nota positiva — mejoras confirmadas del refactor sobre el monolito

- **Portafolio de Servicios**: migrado a D1 con merge por id — el monolito lo deja 100% local sin ningún respaldo.
- **ARL y Habeas Data**: ambos ahora escriben a D1 con merge por id — el monolito nunca los sube a D1 (solo localStorage/Supabase).
- **Verificación de Certificados**: separada correctamente de Facturación (el monolito las mezclaba en una sola función).

---

## Archivos corregidos en esta pasada
`src/pages/BillingPage.jsx`, `src/pages/PlanesPage.jsx`, `src/pages/PortalEmpresaPage.jsx`, `src/pages/SuperAdminPage.jsx`, `src/pages/AgendaPage.jsx`, `src/App.jsx`, `src/lib/printService.js`, `src/modules/agenda/components/AgendaView.jsx`, `src/shared/components/MensajesDrawer.jsx`, `src/modules/telemedicine/services/telemedicineService.js` (nuevo), `src/modules/telemedicine/components/{VideoConsult,AppointmentScheduler}.jsx`, `src/stores/authStore.js`.

Todo verificado con `npx vite build` (limpio) y `npx vitest run` (172/172) antes de cada commit.
