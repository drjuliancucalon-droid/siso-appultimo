# CLAVES MAESTRAS D1 — Referencia de Seguridad OcupaSalud
**Generado:** 2026-08-16 | **Worker:** siso-api (producción)

> ⚠️ REGLA ABSOLUTA: No eliminar ninguna clave de esta lista sin confirmación explícita.
> Las claves marcadas con 🔒 tienen CANDADO en el worker — no pueden sobrescribirse ni eliminarse.

---

## GRUPO A — Claves de Datos Clínicos (PROTEGIDAS + NO CACHEAR)

| Patrón | CANDADO | Descripción | Visualización activa |
|---|---|---|---|
| `siso_patients_{userId}` | 🔒 CANDADO 1 | Lista maestra de pacientes | DashboardPage, HistoriaPage |
| `siso_db_patients_{userId}` | 🔒 CANDADO 1 | Lista maestra alt. | DashboardPage, HistoriaPage |
| `siso_hc_{id}` | 🔒 CANDADO 1 | Historia clínica individual | HistoriaPage (49 KB) |
| `siso_hc_cerrada_{id}` | 🔒 CANDADO 2 | HC inmutable (Ley 527/1999) | Solo lectura |
| `siso_atenciones_{userId}` | 🔒 CANDADO 1 | Registro de atenciones | DashboardPage |
| `siso_atenciones_cerradas` | 🔒 CANDADO 1 | Atenciones cerradas | BackupPage, DashboardPage |
| `siso_encuestas_{userId}` | 🔒 CANDADO 1 | Encuestas de salud | SurveyResponsePage, EncuestasPage |
| `siso_agendados_{userId}` | Sin candado | Agenda de citas | AgendaPage |

## GRUPO B — Claves de Empresas y Portal (PROTEGIDAS + CACHEABLE 30s)

| Patrón | CANDADO | Descripción | Visualización activa |
|---|---|---|---|
| `siso_companies_{userId}` | 🔒 CANDADO 1 | Lista de empresas | CompaniesPage, PortalEmpresaPage |
| `siso_portal_empresa_docs_{nit}` | 🔒 CANDADO 1 | Docs portal empresa (obj .periodos[]) | PortalCertificadosEmpresa |
| `siso_portal_empresa_atenciones_{nit}` | 🔒 CANDADO 1 | Atenciones del portal empresa | PortalEmpresaPage |
| `siso_cartas_custodia_{userId}` | 🔒 CANDADO 1 | Cartas de custodia | CartaCustodiaPage (24 KB) |

## GRUPO C — Claves de Documentos y Reportes (PROTEGIDAS)

| Patrón | CANDADO | Descripción | Visualización activa |
|---|---|---|---|
| `siso_informes_{userId}` | 🔒 CANDADO 1 | Informes médicos | AnalisisDocsEmpresas, HistoriaPage |
| `siso_saved_reports_{userId}` | 🔒 CANDADO 1 | Reportes guardados | ReportsPage, BackupPage |
| `siso_users_{userId}` | 🔒 CANDADO 1 | Usuarios del sistema | UsersPage, SuperAdminPage |

## GRUPO D — Claves de Configuración (CACHEABLE 30s / INDELETABLES)

| Patrón | CANDADO | Descripción | Cacheable |
|---|---|---|---|
| `siso_ai_keys_{userId}` | 🔒 CANDADO 4 | Llaves de IA del médico | ✅ 30s |
| `siso_ips_perfil` | Sin candado | Perfil IPS | ✅ 30s |
| `siso_portafolio` | Sin candado | Portafolio de servicios | ✅ 30s |
| `siso_ai_config_provider` | Sin candado | Config proveedor IA | ✅ 30s |
| `siso_doctor_signature` | Sin candado | Firma digital médico | ✅ 30s |

## GRUPO E — Claves Internas del Sistema (NO TOCAR)

| Patrón | Descripción | Acción |
|---|---|---|
| `{clave}__c{N}` | Pieza N del chunking | Interna — solo el worker la maneja |
| `{clave}__meta` | Metadata del chunk | Interna — no leer directamente |
| `siso_snapshot_{YYYY-MM-DD}__*` | Snapshot diario | Auto-rotación 7 días |
| `siso_deleted_{ts}_{key}` | Backup pre-DELETE | Auto-generado, no eliminar manualmente |
| `siso_autosave_cloud_{id}` | Auto-guardado temporal | Limpieza automática >48h |

---

## REGLAS DE ORO

1. **Antes de eliminar cualquier clave:** grep en _temp_app.jsx (2.9 MB) y en todos los src/pages/*.jsx
2. **Antes de modificar el worker:** verificar que _PROTECTED regex sigue cubriendo todas las claves del Grupo A, B y C
3. **Para agregar una clave nueva protegida:** actualizar _PROTECTED en index.js Y este archivo
4. **Para cambiar el schema D1:** probar en siso-db-dev primero, luego producción
5. **Para confirmar claves huérfanas:** ejecutar: `grep -r 'siso_informes\|siso_cartas_custodia' src/pages/`
