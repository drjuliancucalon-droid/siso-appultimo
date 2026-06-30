# 📋 PROTOCOLO DE MIGRACIÓN — Monolito (OcupaSalud) → Refactorizado (SISO App)

**Inicio:** 30 de junio de 2026  
**Última actualización:** 30 de junio de 2026 — Sesión #2  
**Prompt guía:** `PROMPT-SESION.md`

---

## 🗺️ MAPA DE VISTAS — ESTADO GENERAL

| # | Vista | Monolito (App.jsx) | Refactorizado | Estado | % |
|---|-------|-------------------|---------------|--------|---|
| 1 | **Dashboard** | `renderDashboard()` L25676 | `DashboardPage.jsx` | 🔄 En progreso | 0% |
| 2 | **Login** | `renderLogin()` | `LoginPage.jsx` | ⬜ Pendiente | 0% |
| 3 | **Agenda** | `renderAgenda()` L46424 | `AgendaPage.jsx` | ✅ Migrado | 90% |
| 4 | **HC Ocupacional** | `renderHistoriaOcupacional()` | `HistoriaPage.jsx` | ⬜ Pendiente revisar | 0% |
| 5 | **Pacientes** | `renderPatients()` | `PatientsPage.jsx` | ⬜ Pendiente | 0% |
| 6 | **Empresas** | `renderCompanies()` | `CompaniesPage.jsx` | ⬜ Pendiente | 0% |
| 7 | **Reportes** | `renderReportes()` | `ReportsPage.jsx` | ⬜ Pendiente | 0% |
| 8 | **Facturación** | `renderFacturacion()` | `BillingPage.jsx` | ⬜ Pendiente | 0% |
| 9 | **Usuarios** | `renderUsers()` | `UsersPage.jsx` | ⬜ Pendiente | 0% |
| 10 | **Configuración** | `renderSettings()` | `SettingsPage.jsx` | ⬜ Pendiente | 0% |

---

## 🔗 LINKS
| Recurso | URL |
|---------|-----|
| Monolito (producción) | https://ocupasaludparadesplegar-f4q.pages.dev/ |
| Refactorizado (producción) | https://0e14e2ed.siso-appultimo-arp.pages.dev/ |
| Repo refactorizado | https://github.com/drjuliancucalon-droid/siso-appultimo |
| Repo monolito | https://github.com/drjuliancucalon-droid/ocupasaludparadesplegar |
| Backend Worker | https://siso-api.dr-juliancucalon.workers.dev |

---

## Sesión #2 — 30 de junio de 2026

### Cambios realizados
| # | Archivo | Cambio | Líneas |
|---|---------|--------|--------|
| — | — | — | — |

### Screenshots
| Vista | Monolito | Refactorizado ANTES | Refactorizado DESPUÉS |
|-------|----------|---------------------|----------------------|
| — | — | — | — |

### Checklist
- [ ] Cambios compilan sin errores
- [ ] Screenshot comparativo guardado
- [ ] Commit realizado y pusheado
- [ ] Verificado en producción

### Pendientes para próxima sesión
- ...

---

## Sesión #1 — (Previa, contexto de SESION_ESTADO.md)

### Cambios realizados
| # | Archivo | Cambio | Líneas |
|---|---------|--------|--------|
| 1 | EpidemiologicalReport.jsx | Reescrito completo | 703 |
| 2 | AnalisisDocsTab.jsx | Creado nuevo | 268 |
| 3 | CompaniesSection.jsx | Actualizado | 1794 |

### Pendientes traspasados a Sesión #2
- Sprint A3: Expandir PhysicalExam.jsx a 29 sistemas
- Sprint A4: Completar RecommendationsPanel y RestrictionsPanel
- Sprint C4: CartaCustodiaPage — migrar Supabase → D1