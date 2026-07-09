# AUDITORÍA DE IMPRESIÓN + PROTOCOLO FINAL DE IGUALACIÓN

_Última actualización: 2026-07-09 16:40_

---

## 🎯 ROLES

| Carpeta | Rol | Se modifica |
|---|---|---|
| **`ocupasaludparadesplegar`** (`App.jsx` 60,458 líneas) | 📋 **GUÍA** — Contiene TODA la lógica de negocio | ❌ NO |
| **`Refactorizacion 30 de junio`** (estructura modular) | 🛠️ **DESTINO** — Debe igualar 100% al monolito | ✅ SÍ |

---

## 📄 SECCIÓN DE IMPRESIÓN — Auditoría completa

### Funciones de impresión en el MONOLITO (App.jsx)

| # | Función | Línea | Líneas | Qué genera | HTML/CSS |
|---|---|---|---|---|---|
| 1 | `_generarHCPortalHTML(p)` | 1665 | ~200 | HC completa para portal público | CSS inline, 18 secciones: header médico, datos paciente, laborales, signos vitales, antecedentes, anamnesis, motivo consulta, revisión sistemas, examen físico, paraclínicos, diagnóstico, concepto aptitud (badge color), restricciones, recomendaciones, prescripción, firma |
| 2 | `_mkPrintHeaderMod(titleDoc, accentColor, data, doctor, miIPS)` | 13783 | 50 | Header premium 3 columnas para documentos médicos | Columna izq: IPS/doctor, centro: título documento + fecha + reg#, derecha: datos paciente. CSS inline con color acento |
| 3 | `_BASE_PRINT_STYLE_MOD` | 13833 | 15 | CSS base de impresión | `@page letter`, `print-color-adjust:exact`, badges, section-title, med-card, deriv-card, sig-block, sig-line, responsive |
| 4 | `_openPrintRecetaDeriv(section, titleDoc, data, doctor, signature, miIPS, opts)` | 13848 | ~200 | Receta/Fórmula, Derivación, Exámenes | Header 3 columnas + sección específica según `section`. Colores: verde (fórmula), azul (derivación), teal (exámenes) |
| 5 | `_generarCertificadoHTML(data, doctor, signature, miIPS)` | ~13500 | ~270 | Certificado de aptitud laboral | Header premium + datos paciente + concepto aptitud (badge color: verde/ámbar/rojo) + restricciones + recomendaciones + firma + QR + script auto-escalado |
| 6 | `_generarCertificadoDesdePortal(resultado)` | ~14000 | ~100 | Certificado desde portal empresa | Similar a _generarCertificadoHTML pero con datos del portal |
| 7 | `_generarHCPortalHTML(hcCompleta)` | 1665 | ~200 | HC completa para portal trabajador | 18 secciones completas con todos los datos clínicos |
| 8 | `_buildCertificadosEmpresaHTML(hidratados)` | ~14500 | ~100 | Lote de certificados para empresa (varios trabajadores) | Concatena múltiples certificados en un solo HTML, cada uno con su script de auto-escalado |
| 9 | `_portalPrint(section, resultado)` | ~14600 | ~50 | Impresión desde portal empresa | Llama a _openPrintRecetaDeriv o _generarCertificadoHTML según sección |
| 10 | `handlePrint` | ~14700 | ~30 | Handler general de impresión | Abre ventana con HTML generado + script auto-escalado |
| 11 | `handlePrintReport` | ~14800 | ~50 | Impresión de reportes | Genera HTML con tabla de datos + header + footer |
| 12 | `_handleEnviarPDF` | ~14900 | ~40 | Enviar PDF por email/WhatsApp | Genera PDF con html2canvas + jsPDF, descarga o comparte |
| 13 | Script auto-escalado | 13755 | 17 | Script JS inline que ajusta zoom para que quepa en 1 hoja | Detecta scrollHeight, calcula escala (mín 70%), aplica CSS zoom. No aplica si está dentro de iframe (html2canvas) |
| 14 | `_htmlToPdfBlobMod` | ~15000 | ~80 | Convierte HTML a PDF blob usando html2canvas + jsPDF | Captura cada sección como imagen, genera PDF multipágina |
| 15 | `handleEnviar` | ~15100 | ~60 | Enviar documentos por email/WhatsApp | Abre modal con opciones: PDF, Email, WhatsApp |
| 16 | `handleWhatsApp` | ~15200 | ~20 | Compartir por WhatsApp | Genera enlace `wa.me` con mensaje predefinido |
| 17 | `handleEmail` | ~15300 | ~30 | Enviar por email | Abre cliente de correo con asunto y cuerpo predefinido |

### Botones de impresión en el MONOLITO (renderNavbar + vistas)

| # | Botón/UI | Vista | Función que llama |
|---|---|---|---|
| 1 | "📄 Descargar / Imprimir Informe Completo" | Dashboard/Reporte | `handlePrint` |
| 2 | "📋 Receta Médica" | HC (panel Descargar/Enviar) | `_openPrintRecetaDeriv("formula", ...)` |
| 3 | "🔬 Derivaciones" | HC (panel Descargar/Enviar) | `_openPrintRecetaDeriv("derivacion", ...)` |
| 4 | "🔬 Exámenes" | HC (panel Descargar/Enviar) | `_openPrintRecetaDeriv("examenes", ...)` |
| 5 | "🩺 Incapacidad" | HC (panel Descargar/Enviar) | `_openPrintRecetaDeriv("incapacidad", ...)` |
| 6 | "Descargar Certificado PDF" | Portal Empresa | `_generarCertificadoDesdePortal` |
| 7 | "Ver / Descargar Historia Clínica Completa" | Portal Empresa | `_generarHCPortalHTML` |
| 8 | "📄 Certificado" | Navbar (vista HC) | `_generarCertificadoHTML` |
| 9 | "📄 Descargar Docs" (checklist) | Navbar | `handleEnviar` |
| 10 | "📤 Enviar" | Navbar | `handleEnviar` |
| 11 | "📱 WhatsApp" | Navbar | `handleWhatsApp` |
| 12 | "📧 Email" | Navbar | `handleEmail` |
| 13 | "📊 Descargar Reporte" | Reportes | `handlePrintReport` |
| 14 | "📄 Carta de Custodia" | Empresas | `handlePrintCustodia` |
| 15 | "📄 Certificados Empresa" | Empresas | `_buildCertificadosEmpresaHTML` |

### Funciones de impresión en el REFACTORIZADO (`Refactorizacion 30 de junio`)

| # | Archivo | Función | Líneas | Qué genera |
|---|---|---|---|---|
| 1 | `src/lib/printService.js` | `PrintStyles` (const) | 9 | CSS global para impresión |
| 2 | `src/lib/printService.js` | `printSection` | 37 | Envuelve contenido en HTML imprimible |
| 3 | `src/lib/printService.js` | `openPrintWindow` | 70 | Abre ventana de impresión |
| 4 | `src/lib/printService.js` | `generateHCPrintHTML` | 324 | HC Ocupacional (18 secciones) |
| 5 | `src/lib/printService.js` | `printHC` | 14 | Wrapper HC |
| 6 | `src/lib/printService.js` | `printCertificateBatch` | 47 | Certificados aptitud lote |
| 7 | `src/lib/printService.js` | `printDisability` | ~50 | Incapacidad médica |
| 8 | `src/lib/printService.js` | `printPrescription` | ~40 | Prescripción/Fórmula |
| 9 | `src/lib/printService.js` | `printExamRequest` | ~40 | Solicitud exámenes |
| 10 | `src/lib/printService.js` | `printDerivation` | ~40 | Derivación |
| 11 | `src/lib/printService.js` | `printReport` | ~50 | Reporte |
| 12 | `src/modules/clinical/services/printService.js` | Servicio clínico | ~100 | Impresión HC con datos clínicos |
| 13 | `src/shared/lib/printUtils.js` | Utilidades | ~80 | Funciones auxiliares PDF |

### BRECHAS DE IMPRESIÓN

| # | Función del MONOLITO | Existe en REFACTORIZADO | Diferencia |
|---|---|---|---|
| 1 | `_generarHCPortalHTML` (HC portal público) | ❌ **NO** | No existe versión portal en refactorizado |
| 2 | `_generarCertificadoDesdePortal` | ❌ **NO** | No existe generación de certificados desde portal |
| 3 | `_buildCertificadosEmpresaHTML` (lote) | ❌ **NO** | `printCertificateBatch` existe pero con diferente implementación |
| 4 | `_mkPrintHeaderMod` (header 3 columnas premium) | ❌ **NO** | El refactorizado tiene header diferente, sin soporte IPS |
| 5 | `_BASE_PRINT_STYLE_MOD` (CSS impresión) | ❌ **NO** | `PrintStyles` existe pero con CSS diferente |
| 6 | `_openPrintRecetaDeriv` (receta/derivación/exámenes) | ❌ **NO** | `printPrescription`, `printExamRequest`, `printDerivation` existen pero con firma y estilo diferentes |
| 7 | Script auto-escalado (zoom para 1 hoja) | ❌ **NO** | No existe en refactorizado |
| 8 | `_htmlToPdfBlobMod` (HTML→PDF con html2canvas) | ❌ **NO** | No existe conversión a PDF blob |
| 9 | `handleEnviar` (modal PDF/Email/WhatsApp) | ❌ **NO** | No existe modal de envío |
| 10 | `handleWhatsApp` | ❌ **NO** | No existe |
| 11 | `handleEmail` | ❌ **NO** | No existe |
| 12 | `_generarCertificadoHTML` (certificado aptitud) | ⚠️ **PARCIAL** | `printCertificateBatch` genera certificados pero sin el mismo diseño premium, sin QR, sin script auto-escalado |
| 13 | `handlePrintReport` | ⚠️ **PARCIAL** | `printReport` existe pero con formato diferente |
| 14 | Botones "Descargar/Enviar" en navbar | ❌ **NO** | El refactorizado no tiene el panel de descarga con checklist |

---

## 📋 PROTOCOLO DE IGUALACIÓN — 13 pasos

### Paso 1: Agregar funciones de Storage/Seguridad faltantes
**Archivo:** `src/shared/lib/security.js`
**Agregar:**
- `_memStore`, `_ls`, `_ss`, `sp`, `sps` con fallback IndexedDB (líneas 160-240 del App.jsx)
- `_auditLog` (ya existe, verificar que tenga el límite de 200 registros)
- `_resetSessionTimer`, `_clearSessionTimer` con timeout de 30 min

### Paso 2: Agregar chunking D1
**Archivo:** `src/lib/d1Client.js`
**Agregar:**
- `_hash64` (función hash para verificación de integridad)
- `_workerSet` con chunking (600KB threshold, verify-after-write, promoción atómica)
- `_workerGet` con reconstrucción paralela (6 concurrencia)
- `_CHUNK_THRESHOLD`, `_CHUNK_SIZE`, `_CHUNK_SUF_META`, `_CHUNK_SUF_PIECE`

### Paso 3: Agregar smart read + pending writes
**Archivo:** `src/lib/d1Client.js`
**Agregar:**
- `_readSmart` (D1 + Supabase race, merge híbrido por timestamp)
- `_tsOf` (extraer timestamp de valor)
- `_enqueuePendingD1`, `_getPendingD1`, `_clearPendingD1`
- `_PENDING_D1_KEY`, `_PENDING_D1_MAX_RETRIES`, `_PENDING_D1_MAX_VALUE`

### Paso 4: Agregar loginLocal + handleImportData
**Archivo:** `src/stores/authStore.js`
**Agregar:**
- `loginLocal` con migración localStorage→D1 + rate limiting
- `handleImportData` con try/catch por item, protección localStorage lleno
- `_resetSessionTimer`, `_clearSessionTimer` con logout automático

### Paso 5: Completar Portal Empresa
**Archivo:** `src/pages/PortalEmpresaPage.jsx`
**Agregar:**
- `PortalEmpresaDocsPeriodos` (componente de periodos con fusión multi-NIT)
- `_rePublicarPortalTodos` (re-publicar todos los documentos al portal)
- `_generarCertificadoDesdePortal` (certificado desde portal)
- `_generarHCPortalHTML` (HC para portal público)
- `_buildCertificadosEmpresaHTML` (lote de certificados)

### Paso 6: Completar Email Service
**Archivo:** `src/lib/emailService.js`
**Agregar:**
- `_generarEmailHTML` (generar HTML de correo con datos empresa)
- `sendEmail` con configuración pk/sid/tid
- `email-cfg-*` inputs de configuración

### Paso 7: Agregar Backup/Reindex/CSV
**Archivo:** `src/pages/SettingsPage.jsx`
**Agregar:**
- `handleBackup`, `handleRestore`
- `_reindexPatients`, `reindexAll`, `fixConfianzaData`
- `_exportToCSV`, `_importFromCSV`

### Paso 8: IGUALAR SISTEMA DE IMPRESIÓN (CRÍTICO)
**Archivos a modificar:**
- `src/lib/printService.js` (786 líneas)
- `src/modules/clinical/services/printService.js`
- `src/shared/lib/printUtils.js`

**Agregar/Reemplazar:**

#### 8A. Header premium 3 columnas
Agregar `_mkPrintHeaderMod(titleDoc, accentColor, data, doctor, miIPS)`:
- Columna izquierda: datos IPS (logo, nombre, NIT, dirección, teléfono, email, lema) o datos del médico
- Columna central: título del documento, fecha, número de registro
- Columna derecha: datos del paciente (nombre, documento, edad, sexo, EPS, ARL, AFP, empresa, cargo, tipo examen)
- CSS inline con color acento configurable

#### 8B. CSS de impresión base
Agregar `_BASE_PRINT_STYLE_MOD`:
- `@page{size:letter portrait;margin:1.1cm 1.3cm 1.3cm 1.3cm;}`
- `print-color-adjust:exact`
- Badges, section-title, med-card, deriv-card, sig-block, sig-line
- Responsive para @media print

#### 8C. Función unificada de impresión
Agregar `_openPrintRecetaDeriv(section, titleDoc, data, doctor, signature, miIPS, opts)`:
- Soporta: "formula" (verde), "derivacion" (azul), "examenes" (teal), "incapacidad" (rojo)
- Header 3 columnas + sección específica
- Script auto-escalado inline

#### 8D. Script auto-escalado
Agregar script JS inline que:
- Detecta scrollHeight del wrapper
- Calcula escala = max(0.70, innerH / scrollHeight) donde innerH = 1056 - 80
- Aplica CSS zoom
- NO aplica si está dentro de iframe (html2canvas)
- Muestra casilla de diagnóstico con métricas

#### 8E. Certificado de aptitud premium
Reemplazar `printCertificateBatch` con `_generarCertificadoHTML`:
- Header premium 3 columnas
- Badge de aptitud (verde: apto, ámbar: condicionado, rojo: no apto)
- Restricciones y recomendaciones
- Firma digital + QR code
- Script auto-escalado

#### 8F. HC para portal
Agregar `_generarHCPortalHTML(p)`:
- 18 secciones completas
- CSS inline específico para portal
- Badge de aptitud con color

#### 8G. Lote de certificados para empresa
Agregar `_buildCertificadosEmpresaHTML(hidratados)`:
- Concatena múltiples certificados
- Cada uno con su script auto-escalado
- Separador entre certificados

#### 8H. Modal de envío (PDF/Email/WhatsApp)
Agregar en navbar:
- Botón "📄 Descargar Docs" con checklist de documentos
- `handleEnviar`: modal con opciones PDF, Email, WhatsApp
- `handleWhatsApp`: enlace `wa.me`
- `handleEmail`: cliente de correo

#### 8I. Conversión HTML→PDF
Agregar `_htmlToPdfBlobMod`:
- Usa html2canvas para capturar cada sección
- jsPDF para generar PDF multipágina
- Soporte para imágenes de firma

### Paso 9: Verificar botones en renderNavbar
**Archivo:** `src/app/Layout.jsx`
**Verificar que tenga:**
- Botón Config AI (Wifi/WifiOff/BrainCircuit)
- Vista HC: tabs según dataType, botones PDF/Descargar/Enviar/WhatsApp/Email
- Vista Dashboard: Importar, Backup, RIPS, Guardar en Nube, Diagnóstico Nube, Carga Masiva, Firma
- Badge Offline/Sync, Pending D1 count
- Privacidad, Custodia, Telemedicina, Agenda (contador espera)

### Paso 10: Conectar TOTP con authStore
**Archivo:** `src/modules/auth/components/TwoFactorAuth.jsx`
**Conectar:**
- `handleGenerateTOTP` → `authStore.generateTOTPSecret`
- `handleVerifyTOTP` → `authStore.verifyTOTP`
- QR code URL, OTP Auth URL

### Paso 11: Verificar Dashboard
**Archivo:** `src/pages/DashboardPage.jsx`
**Verificar:**
- 7 KPIs (pacientes, empresas, citas, cuentas pendientes, cuentas cobradas, médicos activos, convenios)
- Turno médico con toggle y modal de asignación
- Alertas inteligentes (firma digital, docs vencidos)
- CTAs Nueva HC Ocupacional/General
- Banner IPS + estado del plan
- Resumen IA del día
- Componente UltimosPacientes con badges

### Paso 12: Verificar módulos restantes
**Archivos:** `src/modules/` (todos)
**Verificar que cada módulo tenga:**
- `index.js` con exports
- Componentes completos
- Hooks conectados
- Servicios funcionando

### Paso 13: Tests y verificación final
**Archivo:** `src/test/`
**Ejecutar:**
- `yarn test` — todos los tests pasan
- `yarn dev` — servidor arranca sin errores
- Navegación manual por todas las rutas

---

## 🔢 RESUMEN DE ARCHIVOS A MODIFICAR

| Archivo en refactorizado | Acción | Funciones a agregar |
|---|---|---|
| `src/shared/lib/security.js` | Agregar | `_memStore`, `_ls`, `_ss`, `sp`, `sps`, `_resetSessionTimer`, `_clearSessionTimer` |
| `src/lib/d1Client.js` | Agregar | `_hash64`, chunking, smart read, pending writes |
| `src/stores/authStore.js` | Agregar | `loginLocal`, `handleImportData`, session timer |
| `src/lib/printService.js` | **REESCRIBIR** | Header 3 columnas, CSS impresión, `_openPrintRecetaDeriv`, script auto-escalado, certificado premium, HC portal, lote certificados, modal envío, HTML→PDF |
| `src/modules/clinical/services/printService.js` | Actualizar | Conectar con nuevo printService |
| `src/shared/lib/printUtils.js` | Agregar | `_htmlToPdfBlobMod`, `_generarHCPortalHTML` |
| `src/pages/PortalEmpresaPage.jsx` | Agregar | `PortalEmpresaDocsPeriodos`, `_rePublicarPortalTodos`, `_generarCertificadoDesdePortal`, `_generarHCPortalHTML`, `_buildCertificadosEmpresaHTML` |
| `src/lib/emailService.js` | Completar | `_generarEmailHTML`, `sendEmail` |
| `src/pages/SettingsPage.jsx` | Agregar | Backup, reindex, CSV |
| `src/app/Layout.jsx` | Verificar | Botones navbar completos |
| `src/modules/auth/components/TwoFactorAuth.jsx` | Conectar | TOTP con authStore |
| `src/pages/DashboardPage.jsx` | Verificar | KPIs, turno, alertas, CTAs |

**Total: ~12 archivos a modificar | ~40 funciones a agregar | ~3-4 horas de trabajo**

---

## 🕐 ESTIMACIÓN POR PASO

| Paso | Archivo | Tiempo |
|---|---|---|
| 1 | `src/shared/lib/security.js` | 15 min |
| 2 | `src/lib/d1Client.js` (chunking) | 30 min |
| 3 | `src/lib/d1Client.js` (smart read + pending) | 20 min |
| 4 | `src/stores/authStore.js` | 20 min |
| 5 | `src/pages/PortalEmpresaPage.jsx` | 30 min |
| 6 | `src/lib/emailService.js` | 15 min |
| 7 | `src/pages/SettingsPage.jsx` | 20 min |
| 8 | **Sistema de impresión** (printService + printUtils) | **60 min** |
| 9 | `src/app/Layout.jsx` (navbar) | 15 min |
| 10 | `src/modules/auth/components/TwoFactorAuth.jsx` | 10 min |
| 11 | `src/pages/DashboardPage.jsx` | 10 min |
| 12 | Módulos restantes (verificación) | 15 min |
| 13 | Tests + verificación final | 20 min |
| **TOTAL** | | **~4 horas** |

---

_Protocolo generado a partir de auditoría de 14 subagentes analizando 137+ archivos y 60,458 líneas de código._