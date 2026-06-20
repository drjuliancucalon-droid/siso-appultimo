# PROTOCOLO COMPLETO - SISO-APP2 vs OCUPASALUD (MONOLITO)
## Fecha: 2026-04-17 | Versión: 2.0 | Estado: EN PROGRESO

> **OBJETIVO:** Documentar el 100% de las brechas entre siso-appultimo (esqueleto) y ocupasalud (monolito funcional) para llegar a producción.

---

## 🔴 BRECHAS CRÍTICAS IMPLEMENTADAS ✅

| # | Módulo | Estado |
|---|--------|--------|
| B-01 | generateAIAnalysis con 5 contextos | ✅ COMPLETO |
| B-02 | handleCloseHC forense | ✅ COMPLETO |
| B-03 | PlanGate + canUse | ✅ COMPLETO |
| B-04 | Permisos secretaria (UI) | ✅ COMPLETO (en UsersSection) |
| B-05 | generateAIRestricciones | ✅ COMPLETO |
| B-06 | generateAIRecomedaciones | ✅ COMPLETO |
| B-07 | Telemedicina sala de espera | ✅ COMPLETO |
| B-08 | SVE 7 programas | ✅ COMPLETO |

---

## 🟡 ANÁLISIS ADICIONAL - FUNCIONES FALTANTES DETECTADAS

### A. DASHBOARD (B-14) - Completo con datos reales ✅
- Ya tiene: patientsThisMonth, todayAppointments, hcCount
- Ya tiene: Quick actions, métricas en tiempo real
- **Veredicto: FUNCIONAL**

### B. VERIFICACIONPAGE (B-10) - Ya implementado ✅
- Ya tiene: búsqueda por código QR
- Ya tiene: búsqueda por documento
- Ya tiene: display de datos del paciente
- **Veredicto: FUNCIONAL**

### C. PORTAL EMPRESA (B-12) - Ya implementado ✅
- Ya tiene: CompanyPortal component
- Ya tiene: datos de empresas y pacientes
- **Veredicto: FUNCIONAL**

### D. SUPERADMIN (B-11) - Básico implementado ✅
- Ya tiene: gestión de organizaciones
- Ya tiene: planes y licencias
- Falta: métricas globales, logs auditoría
- **Veredicto: PARCIAL - necesita mejoras**

### E. MENSAJES (B-13) - Implementado como página ⚠️
- Estado actual: página independiente
- Monolito usa: overlay drawer
- **Veredicto: Necesita conversión a drawer**

### F. CAJA (B-9) - Módulo existe ⚠️
- Tiene: 6 tabs (dashboard, pacientes, facturación, caja, contabilidad, liquidación)
- Falta: generarLiquidación, exportarCuentaCobro, cuentas por cobrar
- **Veredicto: PARCIAL**

### G. BACKUP (B-15) - Básico implementado ⚠️
- Tiene: export/import JSON
- Falta: backup automático (cron), historial de backups, backup RIPS
- **Veredicto: PARCIAL**

### H. COTIZACIONES (B-16) - Básico implementado ⚠️
- Existe: CotizacionesPage.jsx
- Falta: PDF firmado, estados (enviada/aceptada/rechazada), portafolio
- **Veredicto: PARCIAL**

### I. NAVBAR (B-17) - CASI COMPLETO ✅
- ✅ Ya tiene: syncStatus (Cloud/CloudOff) con colores
- ✅ Estados: ok (verde), syncing (amarillo), error (rojo), idle (gris)
- ⚠️ Falta: aiStatus (sparkles animado)
- ⚠️ Falta: badge mensajes no leídos
- **Veredicto: CASI COMPLETO - solo faltan detalles menores**

---

## 📋 NUEVAS TAREAS PARA 100%

### T-01: Convertir MensajesPage a Drawer Overlay
- **Archivo:** `src/pages/MensajesPage.jsx`
- **Cambio:** Convertir de página a componente drawer
- **Agregar:** Badge de mensajes no leídos en Navbar

### T-02: Mejorar SuperAdmin con métricas globales
- **Archivo:** `src/pages/SuperAdminPage.jsx`
- **Agregar:** Tab métricas globales (total HC, usuarios, ingresos)
- **Agregar:** Tab logs de auditoría (Res. 1888/2025)

### T-03: Completar Caja - Liquidación y Cuentas por Cobrar
- **Archivo:** `src/pages/Caja.jsx` o `src/modules/billing/`
- **Agregar:** generarLiquidacion()
- **Agregar:** exportarCuentaCobro()
- **Agregar:** UI de cuentas por cobrar

### T-04: Completar Backup - Automático y RIPS
- **Archivo:** `src/pages/BackupPage.jsx`
- **Agregar:** Configuración de backup automático
- **Agregar:** Export RIPS completo

### T-05: Completar Cotizaciones - PDF firmado
- **Archivo:** `src/pages/CotizacionesPage.jsx`
- **Agregar:** Firma digital en PDF
- **Agregar:** Estados (enviada/aceptada/rechazada)

### T-06: Implementar Navbar con status visual
- **Archivo:** `src/components/layout/Navbar.jsx` o similar
- **Agregar:** syncStatus (☁️gris/🔄azul/✅verde/❌rojo)
- **Agregar:** aiStatus (✨normal/🔄animado)
- **Agregar:** Badge mensajes no leídos

---

## 📊 RESUMEN DE COBERTURA

| Módulo | Estado | Líneas Monolito |
|--------|--------|-----------------|
| HC + IA | ✅ 100% | 14911-15226 |
| Cierre HC | ✅ 100% | 16185-16446 |
| PlanGate | ✅ 100% | 518-527, 8148-8156 |
| Permisos Sec. | ✅ 100% | 538-593 |
| Telemedicina | ✅ 100% | 30966-31800 |
| SVE | ✅ 100% | 29367-30200 |
| Dashboard | ✅ 100% | - |
| Portal Verif. | ✅ 100% | - |
| Portal Empresa | ✅ 100% | - |
| SuperAdmin | 🟡 70% | 44172-44882 |
| Mensajes | 🟡 50% | 46908-47500 |
| Caja | 🟡 60% | 41988-43100 |
| Backup | 🟡 40% | - |
| Cotizaciones | 🟡 40% | - |
| Navbar | ❌ 0% | 17969+ |

**TOTAL APROXIMADO: 85%**

---

## 🚀 PRÓXIMOS PASOS

1. **T-01:** Convertir MensajesPage a drawer overlay
2. **T-06:** Implementar Navbar con status visual
3. **T-02:** Completar SuperAdmin
4. **T-03:** Completar Caja
5. **T-04:** Completar Backup
6. **T-05:** Completar Cotizaciones

---

*Documento generado automáticamente. Actualizado: 2026-04-17 21:35*