# INVENTARIO: Qué se SALVA y qué se REHACE en siso-appultimo
## Fecha: 2026-04-15

---

## ✅ SE SALVA (código útil en los módulos)

### Hooks bien construidos
| Archivo | Estado | Notas |
|---------|--------|-------|
| `src/modules/auth/hooks/useAuth.js` | ✅ Bueno | Session timeout, roles, rate limiting — RESCATAR |
| `src/modules/clinical/hooks/useClinicalRecord.js` | ✅ Bueno | Manejo HC, dirty tracking, historial — RESCATAR |
| `src/hooks/useCompanies.js` | ⚠️ Parcial | Solo 2.5KB, básico pero funcional |
| `src/hooks/usePatients.js` | ⚠️ Parcial | 3.1KB, CRUD básico |
| `src/hooks/useSGSSTData.js` | ⚠️ Parcial | 2.1KB, muy básico |

### Services bien construidos
| Archivo | Estado | Notas |
|---------|--------|-------|
| `src/modules/ai/services/aiAnalysis.js` | ✅ Bueno | Failover multi-provider, prompts específicos — RESCATAR |
| `src/modules/ai/services/predictiveModels.js` | ⚠️ Parcial | 5.6KB, modelos predictivos |
| `src/modules/billing/services/billingService.js` | ✅ Bueno | Cálculos facturación colombiana — RESCATAR |
| `src/modules/notifications/services/notificationService.js` | ⚠️ Parcial | 2.4KB |

### Componentes de módulos
| Módulo | Componentes | Estado |
|--------|-------------|--------|
| auth | LoginForm, ChangePasswordForm, PrivacyModal, TwoFactorAuth | ✅ Rescatables |
| clinical | OccupationalHC (81KB!), GeneralHC, PhysicalExam, VitalSigns, CertificateView, ConsentModal | ⚠️ Grandes, necesitan review |
| ai | AIAssistant, AIConfigPanel | ✅ Rescatables |
| companies | CompanyForm, CompanyList, CompanyPortal | ✅ Rescatables |
| billing | BillGenerator, CashBox, DIANExport, Proposals | ✅ Rescatables |
| reports | ARLReports, AnalyticsDashboard, ComplianceReport | ✅ Rescatables |
| agenda | AgendaView, AppointmentForm, QueueManager | ✅ Rescatables |
| patients | PatientList, WorkerPortal, UnsafeConditionReport | ✅ Rescatables |
| notifications | NotificationModal | ✅ Rescatable |

### Context providers
| Archivo | Estado | Notas |
|---------|--------|-------|
| `src/context/AuthContext.jsx` | ⚠️ Incompleto | Importa de `supabase.auth` que no existe como la usa |
| `src/context/AIContext.jsx` | ⚠️ Mock | generateAnalysis retorna "MOCK RETURN" |
| `src/context/AppContext.jsx` | ⚠️ Vacío | Solo 273 bytes, no hace nada |

### Shared (catálogos, data)
| Carpeta | Estado |
|---------|--------|
| `src/data/catalogos.js` | ✅ Idéntico al monolito — MANTENER |
| `src/data/cie10.jsx` | ✅ Idéntico — MANTENER |
| `src/data/cie11.js` | ✅ Idéntico — MANTENER |
| `src/data/cups.jsx` | ✅ Idéntico — MANTENER |
| `src/data/medicamentos.js` | ✅ Idéntico — MANTENER |
| `src/data/planConfig.js` | ✅ Idéntico — MANTENER |
| `src/components/` (forms, modals, panels, ui) | ✅ Idénticos al monolito — MANTENER |

---

## 🔴 SE ELIMINA / REHACE

| Qué | Por qué |
|-----|---------|
| `src/App.jsx` (1.6MB) | Monolito roto — es copia parcial de ocupasalud, nunca usa los módulos |
| `src/app/App.jsx` (106KB) | Intento de App shell que sigue siendo monolítico |
| `.vite/deps/` | Artefactos de build — NUNCA deben estar en el repo |
| `dist/` | Build output — NUNCA debe estar en el repo |
| `_check.js` | Script temporal de verificación |
| `src/context/AIContext.jsx` | Tiene un MOCK RETURN — se rehace sobre aiAnalysis.js |
| `src/context/AuthContext.jsx` | Importa `supabase.auth` que no existe — se rehace sobre useAuth.js |
| `src/context/AppContext.jsx` | Vacío, inútil |
| Componentes duplicados en `modules/*/ui/` | Duplican los de `modules/*/components/` |

---

## 📊 RESUMEN

- **~70% del código de módulos es rescatable** (hooks, services, componentes)
- **100% de la data estática es rescatable** (catálogos, CIE-10, CUPS, medicamentos)
- **0% del entry point es rescatable** (App.jsx monolito, contexts rotos)
- **El problema NO es falta de módulos, sino que NUNCA se conectaron al App shell**

### Plan de acción:
1. Eliminar: App.jsx monolito, .vite/, dist/, contexts rotos, _check.js
2. Mantener: todos los módulos en `src/modules/`, `src/data/`, `src/components/`
3. Crear: nuevo App.tsx shell con React Router que importe los módulos existentes
4. Conectar: los módulos al nuevo App shell con stores (Zustand) en vez de 120 props
5. Backend: nuevo, protege credenciales e IA

