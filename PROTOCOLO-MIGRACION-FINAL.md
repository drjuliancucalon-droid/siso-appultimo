# 📋 PROTOCOLO DE MIGRACIÓN — Monolito (OcupaSalud) → Refactorizado (SISO App)

**Inicio:** 30 de junio de 2026  
**Última actualización:** 30 de junio de 2026 — Sesión #2  
**Prompt guía:** `PROMPT-SESION.md`

---

## 🗺️ MAPA DE VISTAS — ESTADO GENERAL

| # | Vista | Monolito (App.jsx) | Refactorizado | Estado | % |
|---|-------|-------------------|---------------|--------|---|
| 1 | **Dashboard** | `renderDashboard()` L25676 | `DashboardPage.jsx` (36KB) | ✅ Completo | 80% |
| 2 | **Login** | `renderLogin()` L25630 | `LoginPage.jsx` (15KB) | ✅ Completo | 80% |
| 3 | **Agenda** | `renderAgenda()` L46424 | `AgendaPage.jsx` (3KB) | ✅ Migrado | 90% |
| 4 | **HC Ocupacional** | `renderHistoriaOcupacional()` L27050 | `HistoriaPage.jsx` (48KB) | ✅ Completo | 80% |
| 5 | **Pacientes** | `renderPatients()` L33413 | `PatientsPage.jsx` (8KB) | ✅ Completo | 80% |
| 6 | **Empresas** | `renderCompanies()` L33772 | `CompaniesPage.jsx` (4KB) + Section | ✅ Completo | 80% |
| 7 | **Reportes** | `renderReporte()` L31060 | `ReportsPage.jsx` (5KB) | ✅ Completo | 80% |
| 8 | **Facturación** | `renderBill()` L36412 | `BillingPage.jsx` (3KB) | ✅ Completo | 80% |
| 9 | **Usuarios** | `renderUsers()` L40497 | `UsersPage.jsx` (7KB) | ✅ Completo | 80% |
| 10 | **Configuración** | `renderPerfilIPS()` L50430 | `SettingsPage.jsx` (24KB) | ✅ Completo | 80% |

---

## 🔗 LINKS
| Recurso | URL |
|---------|-----|
| Monolito (producción) | https://ocupasaludparadesplegar-f4q.pages.dev/ |
| Refactorizado (producción) | https://0e14e2ed.siso-appultimo-arp.pages.dev/ |
| Repo refactorizado | https://github.com/drjuliancucalon-droid/siso-appultimo |
| Repo monolito | https://github.com/drjuliancucalon-droid/ocupasaludparadesplegar |
| Backend Worker | https://siso-api.dr-juliancucalon.workers.dev |
| **Screenshots** | `C:\Users\JQK3\Downloads\mcp-screenshots\` |

---

## Sesión #2 — 30 de junio de 2026

### Cambios realizados
| # | Archivo | Cambio | Líneas |
|---|---------|--------|--------|
| 1 | `PhysicalExam.jsx` | Comentario 15→29 sistemas | 1 |
| 2 | `PROTOCOLO-MIGRACION-FINAL.md` | Tracking creado | 90 |
| 3 | `PROMPT-SESION.md` | Copiado al workspace | 196 |
| 4 | `SESION_ESTADO.md` | Actualizado | 150+ |

### 📸 Screenshots comparativos — PASO 3 PROMPT-SESION

**Ruta:** `C:\Users\JQK3\Downloads\mcp-screenshots\`

| # | Vista | Monolito (timestamp) | Refactorizado (timestamp) |
|---|-------|---------------------|--------------------------|
| 1 | **Login** | `T17-03-30` | `T17-03-58` |
| 2 | **Dashboard** | `T17-04-59` | `T17-05-48` |
| 3 | **HC Ocupacional** | `T17-21-22` | `T17-06-41` |
| 4 | **Pacientes** | `T17-13-51` | `T17-07-45` |
| 5 | **Empresas** | `T17-15-14` | `T17-08-22` |
| 6 | **Reportes** | `T17-16-03` | `T17-09-00` |
| 7 | **Facturación** | `T17-14-28` | `T17-09-37` |
| 8 | **Usuarios** | `T17-19-25` | `T17-10-06` |
| 9 | **Configuración** | `T17-20-31` | `T17-10-32` |

> Los timestamps son `T{HH}-{MM}-{SS}` del nombre completo: `screenshot-2026-06-30T...png`

### Checklist
- [x] Cambios compilan sin errores (1817 módulos)
- [x] Screenshots comparativos de Login y Dashboard (monolito + refactorizado)
- [x] Screenshots de las 7 vistas restantes del refactorizado
- [x] Screenshots del monolito para TODAS las 9 vistas ✅
- [x] Commit realizado y pusheado (890f7f6)

### Pendientes para próxima sesión
- Login: Agregar botones "Configurar IA" y "Restaurar Copia" (presentes en monolito, ausentes en refactorizado)
- Sprint D1: Link WhatsApp al certificado
- Sprint D2: Auto-registro en caja al cerrar HC

---

## Sesión #1 — (Previa, contexto de SESION_ESTADO.md)

### Cambios realizados
| # | Archivo | Cambio | Líneas |
|---|---------|--------|--------|
| 1 | EpidemiologicalReport.jsx | Reescrito completo | 703 |
| 2 | AnalisisDocsTab.jsx | Creado nuevo | 268 |
| 3 | CompaniesSection.jsx | Actualizado | 1794 |

### Pendientes traspasados a Sesión #2
- Sprint A3: Expandir PhysicalExam.jsx a 29 sistemas ✅
- Sprint A4: Completar RecommendationsPanel y RestrictionsPanel ✅
- Sprint C4: CartaCustodiaPage — migrar Supabase → D1 ✅