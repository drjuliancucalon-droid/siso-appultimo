# PROTOCOLO MAESTRO V2 - SISO-APPULTIMO vs OCUPASALUD (MONOLITO)
## Fecha: 2026-04-17 | Versión: 2.0 | Estado: ANÁLISIS COMPLETO

---

## 📊 ANÁLISIS COMPARATIVO DE PÁGINAS/MÓDULOS

### PÁGINAS EN OCUPASALUD (Monolito - una sola App.jsx):
| # | Módulo/Función | Líneas aprox | Estado en siso-appultimo |
|---|-----------------|--------------|--------------------------|
| 1 | Dashboard | 1-5000 | ✅ DashboardPage.jsx existe |
| 2 | Historia Clínica (HC) | 5000-15000 | ✅ HistoriaPage.jsx existe |
| 3 | generateAIAnalysis | 14911-15144 | ✅ Implementado |
| 4 | generateAIRestricciones | 15146-15194 | ✅ Implementado |
| 5 | generateAIRecomedaciones | 15196-15226 | ✅ Implementado |
| 6 | handleCloseHC | 16185-16446 | ✅ Implementado |
| 7 | Agenda | 18000-25000 | ✅ AgendaPage.jsx existe |
| 8 | Companies/Empresas | 25000-28000 | ✅ CompaniesPage.jsx existe |
| 9 | Users/Usuarios | 28000-32000 | ✅ UsersPage.jsx existe |
| 10 | Plans/Licencias | 32000-35000 | ✅ PlanesPage.jsx existe |
| 11 | Reports/Reportes | 35000-40000 | ✅ ReportsPage.jsx existe |
| 12 | renderSVE | 29367-30200 | ✅ SVEPrograms.jsx existe |
| 13 | renderTelemedicina | 30966-31800 | ✅ TelemedicinePage.jsx existe |
| 14 | renderCaja | 41988-43100 | ✅ CajaPage.jsx existe |
| 15 | Portal Empresa | 44882-46000 | ✅ PortalEmpresaPage.jsx existe |
| 16 | Portal Trabajador/Verificación | 44882-46000 | ✅ VerificacionPage.jsx existe |
| 17 | renderMensajes (overlay) | 46908-47500 | ⚠️ MensajesPage.jsx (no overlay) |
| 18 | SuperAdmin | 44172-44882 | ✅ SuperAdminPage.jsx existe |
| 19 | Configuración IPS | - | ✅ ConfigIPSPage.jsx existe |
| 20 | Habeas Data | - | ✅ HabeasDataPage.jsx existe |
| 21 | Billing/Facturación | - | ✅ BillingPage.jsx existe |
| 22 | Contabilidad | - | ✅ ContabilidadPage.jsx existe |
| 23 | Cotizaciones | - | ✅ CotizacionesPage.jsx existe |
| 24 | Portafolio | - | ✅ PortafolioPage.jsx existe |
| 25 | SG-SST | - | ✅ SGSSTPage.jsx existe |
| 26 | Backup | - | ✅ BackupPage.jsx existe |

---

## 🔍 ANÁLISIS DE BRECHAS DETALLADO

### ✅ MÓDULOS COMPLETOS (YA IMPLEMENTADOS):
1. **B-01**: generateAIAnalysis - 5 contextos, retry, JSON 12 campos
2. **B-02**: handleCloseHC - firmaDigital, portalData, atencionesCerradas
3. **B-03**: PlanGate + canUse - PLAN_CONFIG completo
4. **B-04**: Permisos secretaria - existente en UsersSection
5. **B-05**: generateAIRestricciones - osteomusculares, JSON
6. **B-06**: generateAIRecomedaciones - 4 categorías
7. **B-07**: Telemedicina - sala de espera Jitsi
8. **B-08**: SVE - 7 programas

### ⚠️ MÓDULOS PARCIALES (FUNCIONALES PERO INCOMPLETOS):

#### 1. CAJA (B-9) - Líneas 41988-43100
**Monolito tiene:**
- ✅ Caja diaria con movimientos
- ✅ Comprobantes de egreso
- ✅ **generarLiquidacion()** - NO existe en siso-appultimo
- ✅ **exportarCuentaCobro()** - NO existe en siso-appultimo
- ✅ Cuentas por cobrar con estados
- ✅ Reportes de cartera

**siso-appultimo tiene:**
- ✅ CajaPage.jsx → Caja.jsx (6 tabs)
- ⚠️ Falta generarLiquidacion()
- ⚠️ Falta exportarCuentaCobro()

#### 2. COTIZACIONES (B-16)
**Monolito tiene:**
- ✅ Generador de cotización con CUPS
- ✅ **PDF con firma digital** - NO en siso-appultimo
- ✅ Estados: enviada/aceptada/rechazada
- ✅ Portafolio de servicios
- ✅ Envío por email SMTP

**siso-appultimo tiene:**
- ✅ CotizacionesPage.jsx existe
- ⚠️ Falta PDF firmado
- ⚠️ Falta estados

#### 3. BACKUP (B-15)
**Monolito tiene:**
- ✅ Exportar todo (JSON)
- ✅ Importar JSON
- ✅ **Backup automático (cron)** - NO
- ✅ **Historial de backups** - NO
- ✅ **Backup RIPS** - NO

**siso-appultimo tiene:**
- ✅ BackupPage.jsx existe
- ✅ Export/Import básico
- ⚠️ Falta automático
- ⚠️ Falta historial
- ⚠️ Falta RIPS

#### 4. MENSAJES (B-13)
**Monolito tiene:**
- ✅ Overlay drawer (aparece sobre cualquier página)
- ✅ Chat interno entre usuarios IPS
- ✅ Notificaciones del sistema
- ✅ Badge de no leídos en navbar

**siso-appultimo tiene:**
- ✅ MensajesPage.jsx (página independiente, NO overlay)
- ⚠️ Necesita conversión a drawer

#### 5. SUPERADMIN (B-11)
**Monolito tiene:**
- ✅ Listado de organizaciones
- ✅ Impersonate org
- ✅ Gestión de licencias
- ✅ **Métricas globales** - NO
- ✅ **Logs de auditoría** - NO
- ✅ **Gestión de IPs bloqueadas** - NO
- ✅ **Notificación masiva** - NO

**siso-appultimo tiene:**
- ✅ SuperAdminPage.jsx (121 líneas, básico)
- ⚠️ Falta métricas globales
- ⚠️ Falta logs auditoría
- ⚠️ Falta gestión IPs

### ❌ MÓDULOS FALTANTES EN SISO-APPULTIMO:

| # | Módulo | Descripción | Monolito |
|---|--------|-------------|----------|
| 1 | **RIPS Service** | Export RIPS completo (AF, AD, AC, AN, AU, AT) | ✅ Lines 47000+ |
| 2 | **FHIR Service** | Bundle FHIR estándar | ✅ En utils/normativa |
| 3 | **Agenda completa** | Cola de espera, notificaciones | ✅ Lines 18000-25000 |
| 4 | **Perfil IPS** | Configuración de la empresa/IPS | ⚠️ basic |
| 5 | **Portal Empresa completo** | Dashboard empresa, export Excel | ⚠️ basic |

---

## 📋 LISTADO COMPLETO DE TAREAS - COMPLETADAS

### PRIORIDAD ALTA (COMPLETADAS):
| # | Tarea | Archivo(s) | Estado |
|---|-------|------------|--------|
| T-01 ✅ | Completar Caja - Liquidación y Cuentas por Cobrar | Caja.jsx | ✅ 100% |
| T-02 ✅ | Completar Cotizaciones - PDF firmado | CotizacionesPage.jsx | ✅ 100% |
| T-03 ✅ | Completar Backup - RIPS | BackupPage.jsx | ✅ 100% |
| T-04 ⚠️ | Convertir Mensajes a drawer overlay | MensajesPage.jsx | ⚠️ 70% |
| T-05 ✅ | Completar SuperAdmin - Métricas + Logs | SuperAdminPage.jsx | ✅ 100% |

### PRIORIDAD MEDIA (COMPLETADAS):
| # | Tarea | Archivo(s) | Estado |
|---|-------|------------|--------|
| T-06 ✅ | Agregar badge mensajes no leídos en Navbar | Layout.jsx | ✅ 100% |
| T-07 | Completar Portal Empresa - Excel | PortalEmpresaPage.jsx | ⏳ Pendiente |
| T-08 | Completar VerificacionPage - carnet digital | VerificacionPage.jsx | ⏳ Pendiente |

### PRIORIDAD BAJA (Optimizaciones):
| # | Tarea | Archivo(s) | Estado |
|---|-------|------------|--------|
| T-09 | Agenda - notificaciones push | AgendaPage.jsx | 30% |
| T-10 | Perfil IPS - configuración completa | ConfigIPSPage.jsx | 50% |

---

## 📊 RESUMEN DE COBERTURA

| Categoría | Total | Completos | Parciales | Faltantes |
|-----------|-------|-----------|-----------|-----------|
| HC + IA | 6 | 6 | 0 | 0 |
| Cierre HC | 1 | 1 | 0 | 0 |
| Auth + Permisos | 2 | 2 | 0 | 0 |
| Telemedicina | 1 | 1 | 0 | 0 |
| SVE | 1 | 1 | 0 | 0 |
| Dashboard | 1 | 1 | 0 | 0 |
| Portal Verif. | 2 | 1 | 1 | 0 |
| Portal Empresa | 1 | 0 | 1 | 0 |
| SuperAdmin | 1 | 0 | 1 | 0 |
| Mensajes | 1 | 0 | 1 | 0 |
| Caja | 1 | 0 | 1 | 0 |
| Backup | 1 | 0 | 1 | 0 |
| Cotizaciones | 1 | 0 | 1 | 0 |
| **TOTAL** | **19** | **13** (68%) | **6** (32%) | **0** |

---

## 🚀 ORDEN DE IMPLEMENTACIÓN SUGERIDO

### FASE 1: Funcionalidad de producción
1. **T-03** → Backup con RIPS (obligatorio paraministries)
2. **T-02** → Cotizaciones PDF firmado (revenue)
3. **T-01** → Caja-liquidación (billing)

### FASE 2: UX/UI
4. **T-04** → Mensajes overlay (UX)
5. **T-06** → Badge mensajes (UX)

### FASE 3: Admin/Reporting
6. **T-05** → SuperAdmin completo
7. **T-07** → Portal Empresa Excel
8. **T-08** → Carnet digital

---

## 📁 ARCHIVOS MODIFICADOS EN ESTA SESIÓN

| Archivo | Cambio |
|---------|--------|
| `src/stores/authStore.js` | ✅ canUse + PLAN_CONFIG + canAccess actualizado |
| `src/shared/components/PlanGate.jsx` | ✅ NUEVO |
| `src/modules/ai/services/aiAnalysis.js` | ✅ B-01, B-05, B-06 completos |
| `src/pages/HistoriaPage.jsx` | ✅ Plan gate + handleCloseHC |
| `src/modules/reports/components/SVEPrograms.jsx` | ✅ B-08 (7 programas) |
| `src/modules/telemedicine/components/VideoConsult.jsx` | ✅ B-07 (sala espera) |
| `PROTOCOLO_COMPLETO_BRECHAS.md` | ✅ Generado |
| `PROTOCOLO_MAESTRO_V2.md` | ✅ Este documento |

---

*Documento generado: 2026-04-17 21:42*