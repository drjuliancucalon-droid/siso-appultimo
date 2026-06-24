# PROTOCOLO AUDITORÍA COMPLETA — SISO OcupaSalud Pro
## Comparativa Forense: Monolito vs Refactorizado

**Fecha:** 2026-06-23  
**Monolito:** `ocupasaludparadesplegar-f4q.pages.dev` (localStorage + D1)  
**Refactorizado:** `siso-appultimo-arp.pages.dev` (React + Vite + Cloudflare D1)  
**Metodología:** Inspección visual de ambas plataformas en vivo + lectura completa del source code + dump de localStorage del monolito

---

## RESUMEN EJECUTIVO

Se auditaron **16 módulos** en ambas plataformas. Se encontraron **47 gaps** clasificados en 4 categorías:

| Categoría | Descripción | Cantidad |
|-----------|-------------|----------|
| 🔴 CRÍTICO | Funcionalidad core completamente ausente | 9 |
| 🟠 ALTO | Funcionalidad presente pero incompleta respecto al monolito | 18 |
| 🟡 MEDIO | UX diferente o feature menor ausente | 14 |
| 🟢 BAJO | Mejora cosmética o diferencia de diseño intencional | 6 |

**Estado por módulo:**

| Módulo | Monolito | Refactorizado | Estado |
|--------|----------|---------------|--------|
| Dashboard | ✅ Completo | ⚠️ Gaps importantes | 🟠 ALTO |
| Pacientes | ✅ Completo | ⚠️ Layout diferente + features ausentes | 🟠 ALTO |
| Agenda | ✅ Completo | ⚠️ Vistas faltantes | 🟠 ALTO |
| Empresas | ✅ Completo | ⚠️ Tabs faltantes | 🟠 ALTO |
| HC Ocupacional | ✅ Completo | ⚠️ Examen físico incompleto | 🟠 ALTO |
| HC General | ✅ Completo | ✅ Implementado | 🟢 OK |
| Facturación | ✅ Completo | ⚠️ Contabilidad V2 ausente | 🟡 MEDIO |
| Caja | ✅ Completo | ✅ Implementado | 🟢 OK |
| Reportes | ✅ Completo | ✅ Reescrito (sesión anterior) | 🟢 OK |
| SG-SST | ✅ Completo | ✅ Implementado | 🟢 OK |
| Telemedicina | ✅ Completo | ✅ Implementado | 🟢 OK |
| Custodia | ✅ Completo | ✅ Implementado | 🟢 OK |
| Habeas Data | ✅ Completo | ✅ Implementado | 🟢 OK |
| Usuarios | ✅ Completo | ✅ Implementado | 🟢 OK |
| Certificados | ✅ Completo | ✅ Implementado | 🟢 OK |
| Portafolio | ✅ Completo | ⚠️ Stub básico | 🟡 MEDIO |
| Contabilidad V2 | ✅ Completo | 🔴 Ausente del nav | 🔴 CRÍTICO |
| RIPS / Importar | ✅ En header | 🔴 Ausentes | 🔴 CRÍTICO |

---

## MÓDULO 1: DASHBOARD

### Monolito — Features observados en vivo

**Header Row 1 (siempre visible):**
- Doctor profile card: foto, nombre, especialidad, RM, ciudad
- Botones: `IA` · `Importar` · `Backup` · `RIPS` · `Guardar en Nube` · `Nube` · `Exámenes` · `Firma` · `Cargando...`

**Header Row 2:**
- `Custodia` · `Tele` · `Agenda` · `[mensajes]` · `Planes` · `Salir`

**KPIs (6 cards):**
- HISTORIAS REGISTRADAS: 299
- EMPRESAS: 34
- HC CERRADAS: 287
- HC ABIERTAS: 12
- MÉDICOS ACTIVOS: 2
- CUENTAS PENDIENTES: 8 ← *con monto en $*
- CONVENIOS POR VENCER: 0

**Badge:** `⚠️ Sin médico de turno` — con funcionalidad de asignación de turno

**Plan banner:** `⭐ Pro · HC ilimitadas`

**CTAs principales:**
- `Nueva HC Ocupacional` — card verde grande
- `Nueva HC General` — card azul grande

**Módulos por categoría:**
- GESTIÓN CLÍNICA: Pacientes (Expedientes) | Agenda (Sala de espera) | Verificar (Certificados)
- ADMINISTRACIÓN: Empresas (Clientes) | Usuarios (Accesos) | Portafolio (Precios · Servicios)
- FINANCIERO & REPORTES: Cuentas de Cobro (Facturación) | Módulo Financiero (Caja · Cuentas) | Contabilidad V2 (Pagos · Pendientes) | Reportes (Diagnóstico) | Propuestas (Cotizaciones) | Contabilidad (P&L · KPIs · Fiscal)

**Sección inferior:**
- Productividad por Médico: tabla Médico | Atenciones | HCs cerradas | HCs abiertas | Ingresos mes | % del total
- Registros Recientes: tabla últimas HCs

**Sistema de alertas (banner amarillo):**
- "8 cuentas de cobro pendientes por $X" — con botón "Ver →"
- "11 HCs sin cerrar" — con botón "Cerrar →"
- "Dr. X no tiene firma digital cargada" — con botón "Cargar →"

### Refactorizado — Features implementados

**Header:**
- Logo | 5 nav buttons (Pacientes, Agenda, Empresas, Facturación, Reportes) | Config IA | Mensajes | User info | Plan badge | Logout

**Sub-tabs horizontales:** todos los módulos en scrollable tab bar

**KPIs (8 cards, 2 filas):**
- Fila 1: Pacientes atendidos | Empresas activas | Citas hoy | HC generadas
- Fila 2: HC Cerradas | HC Abiertas | Médicos activos | Convenios por vencer

**Módulos especializados (plan-gated):**
- SVE | Telemedicina | Módulo ARL | Portal Empresa

**Alertas:** Solo "X historia(s) clínica(s) sin cerrar" — sin monto de cuentas

**IA:** Panel de estado de IA + botón "IA Resumen del Día"

**Últimos Pacientes Atendidos:** Tabla con búsqueda (30 registros) + columnas NOMBRE | DOCUMENTO | EMPRESA/CARGO | TIPO EXAMEN | CONCEPTO APTITUD | ESTADO HC | FECHA | ACCIONES

**Citas de Hoy:** Lista de citas con hora + nombre + empresa

**Productividad Médica:** Tabla simplificada (solo médico activo del session)

### GAPS DASHBOARD

| ID | Severidad | Feature | Estado Monolito | Estado Refactorizado |
|----|-----------|---------|-----------------|----------------------|
| GAP-D01 | 🔴 CRÍTICO | Botones header: Importar, Backup, RIPS, Guardar en Nube, Nube, Exámenes, Firma | Presentes en header | Ausentes (sin implementar) |
| GAP-D02 | 🔴 CRÍTICO | CUENTAS PENDIENTES con monto $ en KPI | Muestra $1.370.000 | Solo muestra count sin monto |
| GAP-D03 | 🟠 ALTO | Sistema de alertas inteligentes con "Ver →" links | 3 tipos de alertas | Solo alerta de HC sin cerrar |
| GAP-D04 | 🟠 ALTO | "Nueva HC Ocupacional" y "Nueva HC General" CTAs prominentes | Cards grandes en dashboard | Solo Quick Actions pequeñas |
| GAP-D05 | 🟠 ALTO | Gestión de turno médico ("Sin médico de turno" → asignar turno) | Badge + modal asignación | Badge sin funcionalidad real |
| GAP-D06 | 🟠 ALTO | Productividad por Médico multi-médico con Ingresos mes | Tabla multi-fila | Siempre 1 fila (médico actual) |
| GAP-D07 | 🟡 MEDIO | Módulo Contabilidad V2 en categoría FINANCIERO | Presente | Ausente del dashboard |
| GAP-D08 | 🟡 MEDIO | Header shortcuts: Custodia, Tele, Agenda en row 2 | Presentes | En tab nav, no en header |
| GAP-D09 | 🟡 MEDIO | Portafolio (Precios · Servicios) en sección ADMINISTRACIÓN | Presente | Ausente de categorías |

---

## MÓDULO 2: PACIENTES

### Monolito — Features observados

**Título:** "Gestión de Pacientes (331)"

**Layout:** Tabla con columnas: NOMBRE | DOCUMENTO | EMPRESA / CARGO | HISTORIAL | ACCIONES

**Filtros:**
- Búsqueda de texto: `Nombre o documento...`
- Select de empresa (filtro por empresa)
- Date range: 2 inputs de fecha (desde/hasta)

**HISTORIAL column por paciente:**
- Badge azul: `N HC Propias` (clickable → ver HCs del médico actual)
- Badge gris: `🔍 Todos médicos` (clickable → ver HCs de todos los médicos)

**ACCIONES column por paciente:**
- `⊕` — agregar nueva HC
- `HC Ocup.` — abrir/crear HC Ocupacional (botón azul)
- `📧` — enviar email al paciente
- `📱` — enviar WhatsApp al paciente
- `🗑️` — eliminar paciente (rojo)

### Refactorizado — Features implementados

**Título:** "Pacientes 374 registros"

**Layout:** Cards grid 2 columnas

**Card por paciente:**
- Avatar inicial | Nombre completo | CC | Empresa | Tipo examen | Fecha | Resumen concepto
- Click en card → navega a HC

**Filtros:**
- Búsqueda texto: `Buscar por nombre o documento...`
- Dropdown empresa: `Todas las empresas`
- Dropdown tipo: `Todos los tipos`
- Ordenamiento: `Fecha ↓`

**Acciones:**
- Click card → `/patients/:docNumero/hc`
- "+ Nuevo Paciente" modal con campos básicos

**Fuente:** Badge D1 / Local

### GAPS PACIENTES

| ID | Severidad | Feature | Monolito | Refactorizado |
|----|-----------|---------|----------|---------------|
| GAP-P01 | 🟠 ALTO | Layout tabla vs cards | Tabla (más densa, más acciones) | Cards (más visual, menos acciones) |
| GAP-P02 | 🟠 ALTO | HISTORIAL column: contador de HCs por paciente | Sí (propias + todos médicos) | No — solo click a HC |
| GAP-P03 | 🟠 ALTO | Botón email por paciente | Sí (`📧`) | No |
| GAP-P04 | 🟠 ALTO | Botón WhatsApp por paciente | Sí (`📱`) | No |
| GAP-P05 | 🟡 MEDIO | Filtro por rango de fechas (desde/hasta) | Sí (2 date inputs) | No (solo orden) |
| GAP-P06 | 🟡 MEDIO | Botón "⊕ Nueva HC" por fila de paciente | Sí | No (solo desde dashboard) |
| GAP-P07 | 🟢 BAJO | Vista tabla vs vista cards | Tabla | Cards |

---

## MÓDULO 3: AGENDA

### Monolito — Features observados

**KPIs (4 contadores):**
- `0 En espera` | `0 Atendiendo` | `0 Atendidos` | `0 Programadas`

**Vistas:**
- `📋 Hoy (0)` | `📅 Próximas (0)` | `📅 Semanal` | `📊 Mensual` | `➕ Nueva Cita`

**Botones extra:**
- `📊 Reporte asistencia` (top right) → exporta/visualiza reporte de asistencia

**CTA vacío:** `+ Registrar paciente` cuando no hay citas

**Sección inferior:** "Resumen de Agenda" con datos HOY/SEMANA

### Refactorizado — Features implementados

**Sala de Espera (header naranja):**
- `0 En espera` | `0 Atendiendo` (solo 2 contadores)
- `Llamar siguiente paciente` button (teal)
- "No hay pacientes en sala de espera hoy"

**Calendario de Citas:** Sección con citas programadas

**Fuente:** `Supabase` badge (debe ser D1)

### GAPS AGENDA

| ID | Severidad | Feature | Monolito | Refactorizado |
|----|-----------|---------|----------|---------------|
| GAP-A01 | 🟠 ALTO | Contadores Atendidos + Programadas | Sí (4 total) | No (2 total) |
| GAP-A02 | 🟠 ALTO | Vista Semanal | Sí | No |
| GAP-A03 | 🟠 ALTO | Vista Mensual | Sí | No |
| GAP-A04 | 🟠 ALTO | Reporte de asistencia | Sí | No |
| GAP-A05 | 🟡 MEDIO | Resumen de Agenda (HOY/SEMANA stats) | Sí | Parcial |
| GAP-A06 | 🟡 MEDIO | Fuente de datos: badge dice "Supabase" en vez de "D1" | N/A | Bug visual |

---

## MÓDULO 4: EMPRESAS

### Monolito — Features (de sesiones anteriores + localStorage)

**Lista:** Cards de empresa con NIT, nombre, ciudad, actividad económica

**Tabs por empresa:**
1. **Datos** — formulario completo (razón social, NIT, ARL, actividad, convenio, etc.)
2. **Pacientes** — lista filtrada de pacientes de esa empresa
3. **Historial** — timeline de HCs emitidas para la empresa
4. **Facturación** — cuentas de cobro / facturas de la empresa
5. **Encuestas** — gestión de encuestas pre-examen
6. **Portal** — activación de portal empresarial + código de acceso
7. **Documentos** — documentos corporativos (convenio, carta, etc.)

**Global:**
- Portafolio integrado (precios por servicio)
- Convenio vencimiento tracker

### Refactorizado — Features implementados

**Tabs:**
- `Empresas` (lista) | `+ Nueva Empresa` | `Convenios` | `Encuestas`
- Botón adicional: `Análisis Docs` (AnalisisDocsTab)

**Por empresa:**
- `Editar` | `Eliminar` | `Portal desactivado` badge
- Contador de pacientes: `N paciente(s)`

**Fuente:** D1 (34 empresas cargadas)

### GAPS EMPRESAS

| ID | Severidad | Feature | Monolito | Refactorizado |
|----|-----------|---------|----------|---------------|
| GAP-E01 | 🟠 ALTO | Tab Historial de HCs por empresa | Sí | No |
| GAP-E02 | 🟠 ALTO | Tab Facturación / Cuentas de cobro por empresa | Sí | No |
| GAP-E03 | 🟠 ALTO | Tab Documentos por empresa | Sí | No (AnalisisDocsTab parcial) |
| GAP-E04 | 🟠 ALTO | Tab Pacientes filtrados por empresa (inline) | Sí | No (solo contador) |
| GAP-E05 | 🟡 MEDIO | Portafolio integrado en empresa (precios por servicio) | Sí | No |
| GAP-E06 | 🟡 MEDIO | Tracker convenio vencimiento con alerta | Sí | Campo existe, sin alerta visual |

---

## MÓDULO 5: HC OCUPACIONAL

### Monolito — Features (de localStorage + source code anterior)

**Campos del paciente (completos en localStorage `siso_autosave_cloud_*`):**
```
fc, fr, id, ta, afp, arl, eps, imc, edad, foto, peso, temp, type, cargo, email, talla,
_orgId, ciudad, genero, _userId, celular, docTipo, estrato, folioHC, habitos, nombres,
riesgos, vacunas, adjuntos, telefono, vigencia, _medicoId, docNumero, empresaId,
_autoSaved, analisisIA, empresaNit, esConvenio, residencia, tipoExamen, _cloudSaved,
dependencia, escolaridad, estadoCivil, fechaExamen, grupoEtnico, incapacidad, lateralidad,
antecedentes, derivaciones, tipoContrato, tipoVivienda, turnoTrabajo, agudezaVisual,
empresaNombre, enfasisExamen, examenAlturas, examenCorazon, fechaRegistro, formulaMedica,
motivoEdicion, valorAtencion, estadoHistoria, grupoSanguineo, motivoConsulta,
nivelRiesgoARL, sveRecomendado, zonaResidencia, conceptoAptitud, conteoEdiciones,
diasIncapacidad, examenAlimentos, fechaNacimiento, identidadGenero, recomendaciones,
consentimientoIp, examenConfinados, numPersonasCargo, versionDocumento, antiguedadEmpresa,
ingresosMensuales, paraclinicosCheck, solicitudExamenes, actividadEconomica,
codigoVerificacion, tipoConsentimiento, vacunacionCompleta, examenOsteomuscular,
fechaConsentimiento, formulaMedicamentos, diagnosticoPrincipal, diagnosticoSecundario1...
```

**Secciones implementadas en monolito:**
1. Encabezado: FOR-SST-001 v4.0 · Res. 1843/2025
2. Consentimiento informado digital (Ley 23/1981 · Res.8430/1993)
3. Datos personales (nombre, CC, edad, ciudad, etc.)
4. Datos laborales (empresa, cargo, ARL, EPS, AFP, etc.)
5. Antecedentes patológicos agrupados (patológicos, quirúrgicos, traumáticos, farmacológicos, alérgicos)
6. Hábitos (fuma, alcohol, psicoactivas, deporte)
7. Vacunación
8. Examen físico — 29 sistemas corporales
9. Riesgos laborales (fisicos, químicos, biológicos, mecánicos, biomecanicos, psicosocial, seguridad, locativos)
10. Agudeza visual
11. Examen corazón
12. Examen alturas
13. Examen osteomuscular
14. Examen espacios confinados
15. Examen manipulación alimentos
16. Signos vitales (TA, FC, FR, Temp, Peso, Talla, IMC)
17. Diagnóstico (CIE-10 con IA)
18. Concepto de aptitud + Restricciones + Recomendaciones
19. Fórmula médica
20. Solicitud de paraclinicos/exámenes
21. Incapacidad
22. Derivaciones
23. Análisis IA completo
24. Consentimiento final + firma digital
25. Código de verificación
26. Perfil de cargo (énfasis examen, SVE recomendado)

### Refactorizado — Features en HistoriaOcupacional.jsx (2206 líneas)

Implementado correctamente con el spread completo del paciente.

### GAPS HC OCUPACIONAL

| ID | Severidad | Feature | Monolito | Refactorizado |
|----|-----------|---------|----------|---------------|
| GAP-HC01 | 🟠 ALTO | Examen físico 29 sistemas completos | Sí (completo) | Parcial (Sprint A3 pendiente) |
| GAP-HC02 | 🟠 ALTO | RecommendationsPanel completo | Sí | Stub (Sprint A4 pendiente) |
| GAP-HC03 | 🟠 ALTO | RestrictionsPanel completo | Sí | Stub (Sprint A4 pendiente) |
| GAP-HC04 | 🟡 MEDIO | Vacunación tab/sección | Sí (campo `vacunas`) | Campo existe, sin UI de vacunas |
| GAP-HC05 | 🟡 MEDIO | Examen de alturas detallado | Sí (`examenAlturas`) | Campo existe, sin UI dedicada |
| GAP-HC06 | 🟡 MEDIO | Examen confinados detallado | Sí (`examenConfinados`) | Campo existe, sin UI dedicada |
| GAP-HC07 | 🟡 MEDIO | Examen manipulación alimentos | Sí (`examenAlimentos`) | Campo existe, sin UI dedicada |
| GAP-HC08 | 🟡 MEDIO | Contador de ediciones + motivoEdicion | Sí (`conteoEdiciones`) | Parcial |
| GAP-HC09 | 🟢 BAJO | QR code real en certificado | URL monolito | Sprint A2 pendiente |

---

## MÓDULO 6: FACTURACIÓN / CONTABILIDAD

### Monolito — Módulos financieros

1. **Cuentas de Cobro** — facturas completas con templates
2. **Módulo Financiero** — Caja + Cuentas bancarias
3. **Contabilidad V2** — Pagos · Pendientes (conciliación)
4. **Propuestas** — Cotizaciones con PDF
5. **Contabilidad** — P&L · KPIs · Fiscal (P&G, balance, etc.)

### Refactorizado — Features en BillingPage.jsx

**Tabs:** Facturación | Propuestas | DIAN

**Caja:** CajaPage separada (`/caja`)

### GAPS FACTURACIÓN

| ID | Severidad | Feature | Monolito | Refactorizado |
|----|-----------|---------|----------|---------------|
| GAP-F01 | 🔴 CRÍTICO | Contabilidad V2 (P&L, balance, KPIs fiscales) | Sí | No (`/contabilidad` ruta existe pero stub) |
| GAP-F02 | 🟠 ALTO | Conciliación de pagos pendientes | Sí (Contabilidad V2) | No |
| GAP-F03 | 🟡 MEDIO | RIPS export desde header | Sí (botón RIPS en header) | No en header (sin botón rápido) |

---

## MÓDULO 7: HEADER / ACCIONES GLOBALES

### Monolito Header — Row 1 (siempre visible)

| Botón | Función | Refactorizado |
|-------|---------|---------------|
| `IA` | Abre asistente IA con datos del día | Parcial (Config IA en header) |
| `Importar` | Importar pacientes en lote (CSV/Excel) | 🔴 Ausente |
| `Backup` | Descargar backup completo de datos | Ruta `/settings` con backup básico |
| `RIPS` | Generar archivo RIPS (DIAN-Salud) | 🔴 Ausente del header |
| `Guardar en Nube` | Sync manual forzado a D1/nube | Presente en sync indicator |
| `Nube` | Estado de conexión/sync | Presente como badge |
| `Exámenes` | Portal de solicitud de exámenes a laboratorios | 🔴 Ausente |
| `Firma` | Gestión de firma digital del médico | En DoctorProfile/ProfilePage |

### Monolito Header — Row 2

| Botón | Función | Refactorizado |
|-------|---------|---------------|
| `Custodia` | Acceso rápido a Carta Custodia | En tab nav |
| `Tele` | Acceso rápido a Telemedicina | En tab nav |
| `Agenda` | Acceso rápido a Agenda | En tab nav + main nav |
| `[chat]` | Mensajes internos | En header como bell icon |
| `Planes` | Gestión de planes/suscripción | En tab nav |

### GAPS HEADER/GLOBAL

| ID | Severidad | Feature | Monolito | Refactorizado |
|----|-----------|---------|----------|---------------|
| GAP-G01 | 🔴 CRÍTICO | Importar pacientes en lote (CSV) | Sí (botón Importar) | No |
| GAP-G02 | 🔴 CRÍTICO | RIPS generación rápida desde header | Sí (botón RIPS) | Solo en /billing/dian |
| GAP-G03 | 🔴 CRÍTICO | Portal de exámenes externos | Sí (botón Exámenes) | No |
| GAP-G04 | 🟡 MEDIO | Backup manual con un click | Sí (botón Backup) | Solo en Settings (más pasos) |
| GAP-G05 | 🟡 MEDIO | Header compacto con acciones frecuentes | Sí (12 botones en 2 rows) | No (acciones dispersas) |

---

## MÓDULO 8: CERTIFICADOS / VERIFICACIÓN

### Monolito
- `siso_portal_*` keys: estructura completa con `{arl, eps, edad, cargo, _firma, _doctorData, codigoVerificacion, diagnosticoPrincipal, recomendacionesMedicas, restriccionesChecklist, recomendacionesChecklist, recomendacionesOcupacionales}`
- Portal por código: `/portal/:code` → `siso_portal_CV-SISO-*`
- Portal por doc: `/portal/doc_:docNumero` → `siso_portal_doc_*`
- Portal empresa: `siso_portal_empresa_docs_*`

### Refactorizado
- CertificadoPage.jsx — genera PDF con QR
- VerificacionPage.jsx — leer desde D1
- WorkerPortalPage.jsx — portal público

### GAPS CERTIFICADOS

| ID | Severidad | Feature | Monolito | Refactorizado |
|----|-----------|---------|----------|---------------|
| GAP-C01 | 🟡 MEDIO | QR apunta a URL de verificación estable | `verificar/:codigo` | Implementado en sesión anterior |
| GAP-C02 | 🟡 MEDIO | Portal empresa por NIT con periodos | `siso_portal_empresa_docs_*` | PortalCertificadosEmpresa.jsx |

---

## MÓDULO 9: DATOS Y STORAGE

### Modelo de datos canónico (del monolito - campo completo)

El localStorage del monolito revela el modelo completo de una HC:

```javascript
// Campos presentes en siso_autosave_cloud_* y siso_hc_completa_*
{
  // Identificación
  id, docNumero, docTipo, nombres, genero, fechaNacimiento, edad,
  identidadGenero, grupoEtnico, estrato, grupoSanguineo, lateralidad,
  
  // Contacto
  email, celular, telefono, ciudad, residencia, zonaResidencia,
  
  // Sociodemográfico
  escolaridad, estadoCivil, numPersonasCargo, tipoVivienda, ingresosMensuales,
  
  // Laboral
  empresaId, empresaNombre, empresaNit, cargo, dependencia, tipoContrato,
  turnoTrabajo, antiguedadEmpresa, nivelRiesgoARL, actividadEconomica,
  esConvenio, tipoExamen, enfasisExamen,
  
  // Aseguramiento
  eps, arl, afp,
  
  // Signos vitales
  ta, fc, fr, temp, peso, talla, imc,
  
  // Riesgos
  riesgos: { fisicos, quimicos, biologicos, mecanicos, biomecanicos, psicosocial, seguridad, locativos },
  
  // Antecedentes
  antecedentesAgrupados: { patologicos, quirurgicos, traumaticos, farmacologicos, alergicos },
  habitos: { fuma, alcohol, psicoactivas, deporte },
  vacunas: [],
  
  // Examen físico
  examenFisicoSistemas: { [sistema]: { estado, hallazgo } },
  agudezaVisual: {},
  examenCorazon: {},
  examenAlturas: {},
  examenOsteomuscular: {},
  examenConfinados: {},
  examenAlimentos: {},
  
  // Diagnóstico
  diagnosticoPrincipal, diagnosticoSecundario1,
  conceptoAptitud, analisisRestricciones, recomendaciones,
  restriccionesChecklist: [], recomendacionesChecklist: [],
  recomendacionesOcupacionales, recomendacionesMedicas,
  
  // Acciones
  formulaMedica, formulaMedicamentos, solicitudExamenes,
  solicitudExamenesDiag, solicitudExamenesJust,
  paraclinicosCheck, derivaciones, incapacidad, diasIncapacidad,
  
  // SVE
  sveRecomendado, conductaSeguir,
  
  // Metadatos
  fechaExamen, fechaRegistro, fechaConsentimiento, estadoHistoria,
  folioHC, versionDocumento, conteoEdiciones, motivoEdicion,
  vigencia, codigoVerificacion,
  
  // IA
  analisisIA,
  
  // Consentimiento
  consentimientoInformado, tipoConsentimiento, consentimientoIp,
  
  // Médico/IPS
  _medicoId, _orgId, _userId, _firma, _ipsName, _doctorData, firmaDigital,
  
  // Fotos/adjuntos
  foto, adjuntos: [],
  
  // Billing
  valorAtencion,
  
  // Flags
  _autoSaved, _cloudSaved, _archivado
}
```

### GAPS DE DATOS

| ID | Severidad | Campo | Monolito | Refactorizado |
|----|-----------|-------|----------|---------------|
| GAP-DATA01 | 🟢 OK | Campos principales | Completos | Corregidos en sesión anterior |
| GAP-DATA02 | 🟡 MEDIO | `vacunas` array | Sí | Campo existe, sin UI |
| GAP-DATA03 | 🟡 MEDIO | `sveRecomendado` | Sí | Campo existe |
| GAP-DATA04 | 🟡 MEDIO | `conductaSeguir` | Sí | Verificar |
| GAP-DATA05 | 🟢 BAJO | `_archivado` flag | Sí | No implementado |

---

## MÓDULO 10: MÓDULOS ESPECIALIZADOS (SOLO MONOLITO)

Los siguientes módulos existen en el monolito pero NO tienen equivalente funcional completo en el refactorizado:

| Módulo | Ruta Monolito | Ruta Refactorizado | Estado |
|--------|--------------|-------------------|--------|
| Contabilidad P&L | Dashboard → Contabilidad | `/contabilidad` | 🔴 Stub |
| Contabilidad V2 | Dashboard → Contabilidad V2 | Sin ruta dedicada | 🔴 Ausente |
| RIPS | Botón header | Solo en `/billing/dian` | 🟡 Parcial |
| Importar pacientes | Botón header | Ausente | 🔴 Ausente |
| Portafolio de servicios | Dashboard → Portafolio | `/portafolio` | 🟡 Stub básico |
| Exámenes externos | Botón header | Ausente | 🔴 Ausente |
| Turno médico | Dashboard badge | Badge sin funcionalidad | 🟠 Parcial |

---

## PLAN DE IMPLEMENTACIÓN POR SPRINTS

### SPRINT P1 — CRÍTICOS (Semana 1)

**P1-01: Botón Importar pacientes**
- Archivo: `src/pages/SettingsPage.jsx` o nueva `ImportPage.jsx`
- Función: Importar CSV/Excel → `d1WriteArrayMerge(siso_patients_${userId})`
- UI: Modal con drag-drop de archivo CSV, preview tabla, botón importar

**P1-02: RIPS en header**
- Archivo: `src/app/Layout.jsx`
- Función: Botón que navega a `/billing?tab=dian` o abre modal RIPS
- UI: Botón `RIPS` en header row junto a Backup

**P1-03: Contabilidad V2**
- Archivo: `src/pages/ContabilidadPage.jsx`
- Función: P&L mensual, pagos pendientes, conciliación
- Data: `siso_caja_movs_drcucalon` (Array[25] disponible en monolito)

### SPRINT P2 — ALTOS PRIORIDAD (Semana 2)

**P2-01: Pacientes — HISTORIAL column**
- Archivo: `src/modules/patients/components/PatientList.jsx`
- Función: Contar HCs por paciente mostrando badge "N HC"
- Implementación: `patients.filter(p => p.docNumero === currentPatient.docNumero).length`

**P2-02: Pacientes — Email + WhatsApp buttons**
- Archivo: `src/modules/patients/components/PatientList.jsx`
- Función: `mailto:${p.email}` y `https://wa.me/57${p.celular}`
- UI: Botones icono por fila

**P2-03: Agenda — Vistas Semanal + Mensual**
- Archivo: `src/modules/agenda/components/AgendaView.jsx`
- Función: Tabs adicionales que filtran por semana/mes
- Data: `siso_agendados_drcucalon` disponible

**P2-04: Agenda — Contadores Atendidos + Programadas**
- Archivo: `src/modules/agenda/components/QueueManager.jsx`
- Función: 4 KPI cards en vez de 2
- Campos: `estado === 'atendido'` y `estado === 'programada'`

**P2-05: Agenda — Reporte asistencia**
- Archivo: `src/modules/agenda/components/AgendaView.jsx`
- Función: Generar reporte PDF/CSV de asistencias del período
- UI: Botón "📊 Reporte asistencia" en header de módulo

**P2-06: Empresas — Tab Historial**
- Archivo: `src/sections/CompaniesSection.jsx`
- Función: Timeline de HCs emitidas filtradas por `empresaNombre`
- Data: patients filtrados por empresa

**P2-07: Empresas — Tab Facturación inline**
- Archivo: `src/sections/CompaniesSection.jsx`
- Función: Facturas/cuentas filtradas por empresa
- Data: `siso_saved_bills_drcucalon` filtrado

**P2-08: Dashboard — Alertas inteligentes**
- Archivo: `src/pages/DashboardPage.jsx`
- Función: Alertas con monto $ en cuentas pendientes + links "Ver →"
- Data: `bills.filter(b => b.estado === 'pendiente')` → sum of `b.total`

### SPRINT P3 — MEDIOS PRIORIDAD (Semana 3)

**P3-01: Header botones globales**
- Archivo: `src/app/Layout.jsx`
- Botones a agregar: Importar, RIPS, Backup (quick), Exámenes

**P3-02: Pacientes — Date range filter**
- Archivo: `src/modules/patients/components/PatientList.jsx`
- 2 inputs fecha: `fechaDesde` / `fechaHasta`

**P3-03: HC — Sección Vacunas**
- Archivo: `src/sections/HistoriaOcupacional.jsx`
- Campos: `vacunas` array con nombre, fecha, dosis

**P3-04: HC — Exámenes especiales UI**
- Archivo: `src/sections/HistoriaOcupacional.jsx`
- Secciones dedicadas: Alturas, Confinados, Alimentos

**P3-05: Dashboard — Turno médico**
- Archivo: `src/pages/DashboardPage.jsx`
- Función: Badge "Sin médico de turno" → modal asignar turno
- Data: nueva key `siso_turno_${userId}` en D1

**P3-06: Portafolio**
- Archivo: `src/pages/PortafolioPage.jsx`
- Función: Lista de servicios con precios, tarifas
- Data: `siso_cotizaciones` → extraer servicios del monolito

---

## CHECKLIST DE VALIDACIÓN ANTES DE CADA SPRINT

Antes de implementar cualquier cambio:

- [ ] Leer el archivo fuente completo (no asumir)
- [ ] Verificar campo D1 exacto (`p.nombresDelCampo` vs `p.otroNombre`)
- [ ] No cambiar claves D1 ni nombres de rutas
- [ ] No exponer VITE_WORKER_TOKEN en logs
- [ ] Build con `npx vite build --emptyOutDir=false`
- [ ] Git commit desde PowerShell Windows (no bash sandbox)
- [ ] Verificar en prod `siso-appultimo-arp.pages.dev` tras deploy

---

## REFERENCIAS DE ARCHIVOS

| Módulo | Archivo Refactorizado |
|--------|-----------------------|
| Dashboard | `src/pages/DashboardPage.jsx` |
| Pacientes | `src/pages/PatientsPage.jsx` + `src/modules/patients/components/PatientList.jsx` |
| Agenda | `src/pages/AgendaPage.jsx` + `src/modules/agenda/components/AgendaView.jsx` |
| Empresas | `src/pages/CompaniesPage.jsx` + `src/sections/CompaniesSection.jsx` |
| HC Ocupacional | `src/sections/HistoriaOcupacional.jsx` (2206 líneas) |
| Examen físico | `src/modules/clinical/components/PhysicalExam.jsx` |
| Recomendaciones | `src/modules/clinical/components/RecommendationsPanel.jsx` |
| Restricciones | `src/modules/clinical/components/RestrictionsPanel.jsx` |
| Reportes | `src/modules/reports/components/EpidemiologicalReport.jsx` (1113 líneas - reescrito) |
| Facturación | `src/pages/BillingPage.jsx` + `src/modules/billing/components/BillGenerator.jsx` |
| Caja | `src/pages/CajaPage.jsx` + `src/modules/billing/components/CashBox.jsx` |
| Contabilidad | `src/pages/ContabilidadPage.jsx` (stub) |
| SG-SST | `src/pages/SGSSTPage.jsx` |
| Telemedicina | `src/pages/TelemedicinePage.jsx` |
| Certificado | `src/pages/CertificadoPage.jsx` |
| Verificación | `src/pages/VerificacionPage.jsx` |
| Custodia | `src/pages/CartaCustodiaPage.jsx` |
| Habeas Data | `src/pages/HabeasDataPage.jsx` |
| Usuarios | `src/pages/UsersPage.jsx` |
| Planes | `src/pages/PlanesPage.jsx` |
| Portafolio | `src/pages/PortafolioPage.jsx` (stub) |
| Layout/Header | `src/app/Layout.jsx` |
| Router | `src/App.jsx` |

---

## ESTADO PENDIENTE DE SPRINTS ANTERIORES

| Sprint | Tarea | Estado |
|--------|-------|--------|
| A2 | QR real en certificado | ✅ YA HECHO (CertificateView.jsx usa `qrcode` npm) |
| A3 | PhysicalExam.jsx → 29 sistemas | ✅ YA HECHO (initialStates.js tiene 29 sistemas) |
| A4 | RecommendationsPanel + RestrictionsPanel | ✅ YA HECHO (implementados con catálogo + IA) |
| C4 | CartaCustodiaPage migrar Supabase → D1 | ✅ YA HECHO (usa d1Get / d1WriteArrayMerge) |
| D1 | WhatsApp link en certificado | ✅ YA HECHO (CertificadoPage.jsx handleWhatsApp) |
| D2 | Auto-registro caja al cerrar HC | ✅ YA HECHO (HistoriaPage.jsx línea 479) |
| B | Encuestas: ver respuestas | 🟡 Pendiente |
| GAP-U01 | UsersPage migrar Supabase → D1 | 🔴 NUEVO CRÍTICO |
| GAP-CO01 | CotizacionesPage: bug useBackendObject no importado | 🔴 NUEVO CRÍTICO (crash) |
| GAP-SG01 | SGSSTPage no pasa onNavigate a SSTDashboard | 🟠 NUEVO ALTO |
| GAP-EM05 | CompaniesSection sin tabs: Historial / Facturación / Docs / Pacientes | 🟠 NUEVO ALTO |

---

## RE-AUDITORÍA V2 — 2026-06-23
### Segunda pasada quirúrgica: lectura completa de source + nuevos hallazgos

---

### CORRECCIONES AL PROTOCOLO V1

Los siguientes gaps del protocolo original **ya estaban resueltos** antes de esta sesión. El protocolo V1 los marcó como pendientes por error.

| GAP V1 | Descripción | Evidencia de que está RESUELTO |
|--------|-------------|-------------------------------|
| A3 - PhysicalExam 29 sistemas | Sprint marcado pendiente | `src/shared/data/initialStates.js` → `examenFisicoSistemas` tiene los 29 sistemas: pielFaneras, ganglios, cabeza, ojos, oídos, nariz, bocaOrofaringe, cuello, tiroides, tórax, mamario, cardiovascular, pulmonar, abdomen, genitourinario, columna, lumbar, extremidadesSuperiores, extremidadesInferiores, vascularPeriférico, osteoarticular, músculoEsquelético, neurológico, psiquiátrico, respiratorioAlto, digestivo, endocrino, hematológico, inmunológico. PLUS exámenes especiales: `examenAlturas`, `examenAlimentos`, `examenConfinados`, `examenOsteomuscular`. |
| A4 - RecommendationsPanel/RestrictionsPanel | Sprint marcado pendiente | Ambos componentes existen en `src/modules/clinical/components/` con catálogos completos GTC-45/GATISO + generación IA. RecommendationsPanel: 4 categorías expandibles. RestrictionsPanel: 12 categorías por segmento corporal. |
| A2 - QR real en certificado | Sprint marcado in_progress | `qrcode: "^1.5.4"` en package.json. `CertificateView.jsx` línea 7: `import QRCode from 'qrcode'`. `printUtils.js` línea 19: QRCode dynamic import. COMPLETADO. |
| D1 - WhatsApp en certificado | Sprint marcado pendiente | `CertificadoPage.jsx` → `handleWhatsApp()` en línea 42: genera enlace `wa.me` con datos del certificado. Botón visible en UI. |
| D2 - Auto-registro caja al cerrar HC | Sprint marcado pendiente | `HistoriaPage.jsx` línea 479: `await save('/write/caja/add', {...})` con concepto, monto (tarifa por tipo examen), empresa, médico. SE EJECUTA al cerrar HC. |
| C4 - CartaCustodiaPage Supabase→D1 | Sprint marcado pendiente | `CartaCustodiaPage.jsx` líneas 4-5: importa `d1Get, d1WriteArrayMerge`. Usa D1 para cargar historial y guardar cartas. Migración COMPLETA. |
| GAP-F01 - ContabilidadV2 ausente | Marcado como CRÍTICO ausente | `src/pages/ContabilidadPage.jsx` tiene 312 líneas — ContabilidadV2 COMPLETA: cuentas de cobro individuales + bloque periódico, estados (pendiente/pagada/vencida/anulada), consecutivo, tarifas por empresa, impresión PDF con firma, histórico. Ruta `/contabilidad` existe en App.jsx. |

---

### NUEVOS GAPS ENCONTRADOS EN RE-AUDITORÍA V2

#### GAP-U01 🔴 CRÍTICO — UsersPage.jsx usa Supabase (no D1)
**Archivo:** `src/pages/UsersPage.jsx`  
**Líneas:** 20-21 y 56-57  
**Problema:** Toda la carga y escritura de usuarios usa `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` directamente con `fetch()`. En el refactorizado estas variables pueden no existir o diferir del worker D1.  
**Síntoma:** Usuarios se cargan de Supabase, no de D1. Si Supabase desaparece, el módulo falla silenciosamente (solo muestra localStorage).  
**Fix:** Reemplazar con `d1Get('siso_users')` / `d1WriteArrayMerge('siso_users', ...)` igual que el resto del sistema.  
**Esfuerzo:** 30 min · Solo UsersPage.jsx líneas de load/save.

---

#### GAP-CO01 🔴 CRÍTICO — CotizacionesPage.jsx crash: useBackendObject no importado
**Archivo:** `src/pages/CotizacionesPage.jsx`  
**Línea:** 77  
**Problema:** `const { data: doctor } = useBackendObject('/data/doctor', 'siso_doctor_data', 'doctor');` pero el hook `useBackendObject` NO está importado en las líneas 3-8. Solo se importa `useBackendData`.  
**Síntoma:** La página `/cotizaciones` lanza `ReferenceError: useBackendObject is not defined` en runtime. Crash total.  
**Fix:**
```js
// Línea 7 de CotizacionesPage.jsx — agregar useBackendObject
import { useBackendData, useBackendObject } from '../hooks/useBackendData';
```
**Esfuerzo:** 1 línea, 2 min.

---

#### GAP-SG01 🟠 ALTO — SSTDashboard: botones sub-módulo son no-op
**Archivos:** `src/pages/SGSSTPage.jsx` + `src/modules/sgsst/components/SSTDashboard.jsx`  
**Problema:** `SSTDashboard` tiene prop `onNavigate` y llama `handleNav('riesgos')`, `handleNav('capacitaciones')`, `handleNav('accidentes')`, etc. en 6 botones de "Acciones rápidas" y 4 KPI cards. Pero `SGSSTPage.jsx` renderiza `<SSTDashboard />` **sin pasar la prop `onNavigate`**.  
**Síntoma:** Todos los botones de navegación a sub-módulos (RiskMatrix, TrainingModule, AccidentInvestigation, InspectionChecklist, DocumentRepository, AnnualPlan, PolicyGenerator) son silenciosamente no-ops. El usuario no puede acceder a ningún sub-módulo desde el dashboard SG-SST.  
**Fix:** Agregar estado de navegación en `SGSSTPage.jsx`:
```jsx
// SGSSTPage.jsx
const [ssstSection, setSsstSection] = useState(null);
// Mapear section → componente y pasar onNavigate={setSsstSection} a SSTDashboard
```
Los 7 sub-componentes SG-SST ya existen (RiskMatrix 676 líneas, TrainingModule 485, AccidentInvestigation 595, InspectionChecklist 582, DocumentRepository 525, AnnualPlan 497, PolicyGenerator 542).  
**Esfuerzo:** 2 horas — SGSSTPage.jsx necesita switch de sección + wrapper para cada sub-módulo.

---

#### GAP-EM05 🟠 ALTO — CompaniesSection sin tabs de empresa: Historial / Facturación / Documentos / Pacientes
**Archivo:** `src/sections/CompaniesSection.jsx`  
**Tabs actuales:** `lista` | `nueva` | `convenios` | `encuestas`  
**Tabs en monolito (ausentes):**
- **Historial** — lista de HCs emitidas para esa empresa (pacientes atendidos)
- **Facturación** — cuentas de cobro generadas para esa empresa, monto pendiente
- **Documentos** — evidencias documentales por empresa (contratos, licencias)
- **Pacientes inline** — ver todos los trabajadores de la empresa desde su perfil  

**Evidencia monolito:** CompaniesSection del monolito tiene vista de empresa expandida con pestañas que muestran: `hcsDeEmpresa`, `cuentasDeEmpresa`, `trabajadoresList`, `documentosList`.  
**Síntoma:** En refactorizado, al hacer clic en una empresa solo se puede editar su ficha básica. No hay visibilidad de actividad clínica/financiera por empresa.  
**Esfuerzo:** 4 horas — Crear 3-4 sub-tabs + filtrar patientsList/billingData por empresa.

---

#### GAP-ENC01 🟡 MEDIO — EncuestasPage sin vista de respuestas recibidas
**Archivo:** `src/pages/EncuestasPage.jsx` (272 líneas)  
**Problema:** La página permite crear encuestas y tiene el `SurveyResponsePage` público para responder. Pero `EncuestasPage` no muestra las respuestas recibidas. No hay componente de "Ver respuestas" ni tabla de resultados.  
**Fix:** Agregar panel lateral o tab de respuestas por encuesta — `d1Get('siso_survey_responses_' + encuestaId)`.  
**Esfuerzo:** 2 horas.

---

#### GAP-HD02 🟡 MEDIO — HabeasDataPage solo localStorage (sin D1)
**Archivo:** `src/pages/HabeasDataPage.jsx`  
**Línea:** 22: `const STORAGE_KEY = 'siso_habeas_data_requests';` → solo `localStorage`.  
**Fix:** Migrar a `d1Get/d1WriteArrayMerge` igual que resto del sistema.  
**Esfuerzo:** 30 min.

---

#### GAP-ARL02 🟡 MEDIO — ARLPage solo localStorage (sin D1)
**Archivo:** `src/pages/ARLPage.jsx`  
**Línea:** 11: `const STORAGE_KEY = 'siso_atl_cases';` → solo `localStorage`.  
**Fix:** Migrar a D1.  
**Esfuerzo:** 30 min.

---

#### GAP-CJ02 🟡 MEDIO — CashBox simplificado vs monolito
**Archivo:** `src/modules/billing/components/CashBox.jsx` (136 líneas)  
**Monolito tenía:**
- Distribución % por médico (ej. médico recibe 40%, IPS 60%)
- Selector de período personalizado (desde/hasta con rango)
- Pacientes del día (lista de quién se atendió)
- Export CSV de movimientos
- Categorías de egreso (arriendo, insumos, laboratorio, etc.)  

**Refactorizado tiene:** Básico: ingreso/egreso + filtro hoy/semana/mes + 3 cards de totales.  
**Esfuerzo:** 3 horas para paridad completa con monolito.

---

#### GAP-PF02 🟢 BAJO — PortafolioPage solo localStorage
**Archivo:** `src/pages/PortafolioPage.jsx` (59 líneas)  
**Fix:** Agregar D1 sync.  
**Esfuerzo:** 20 min.

---

### TABLA CONSOLIDADA NUEVA — GAPS V2

| ID | Severidad | Módulo | Descripción | Archivo | Esfuerzo |
|----|-----------|--------|-------------|---------|----------|
| GAP-U01 | 🔴 CRÍTICO | Usuarios | UsersPage usa Supabase → migrar a D1 | `UsersPage.jsx` | 30 min |
| GAP-CO01 | 🔴 CRÍTICO | Cotizaciones | `useBackendObject` no importado → crash | `CotizacionesPage.jsx` | 2 min |
| GAP-SG01 | 🟠 ALTO | SG-SST | `onNavigate` no pasado → sub-módulos inaccesibles | `SGSSTPage.jsx` | 2 h |
| GAP-EM05 | 🟠 ALTO | Empresas | Tabs Historial/Facturación/Docs/Pacientes ausentes | `CompaniesSection.jsx` | 4 h |
| GAP-ENC01 | 🟡 MEDIO | Encuestas | Sin vista de respuestas recibidas | `EncuestasPage.jsx` | 2 h |
| GAP-HD02 | 🟡 MEDIO | Habeas Data | Solo localStorage, sin D1 | `HabeasDataPage.jsx` | 30 min |
| GAP-ARL02 | 🟡 MEDIO | ARL | Solo localStorage, sin D1 | `ARLPage.jsx` | 30 min |
| GAP-CJ02 | 🟡 MEDIO | Caja | CashBox simplificado (sin % médico, sin CSV, sin categorías) | `CashBox.jsx` | 3 h |
| GAP-PF02 | 🟢 BAJO | Portafolio | Solo localStorage, sin D1 | `PortafolioPage.jsx` | 20 min |

---

### ESTADO REAL DE TODOS LOS SPRINTS (post re-auditoría)

| Sprint | Tarea | Estado Real |
|--------|-------|-------------|
| A1 | Fix spread paciente en initNewRecord | ✅ COMPLETO |
| A2 | QR real en certificado (qrcode npm) | ✅ COMPLETO |
| A3 | PhysicalExam 29 sistemas | ✅ COMPLETO |
| A4 | RecommendationsPanel + RestrictionsPanel | ✅ COMPLETO |
| B | Encuestas: ver respuestas | 🟡 PENDIENTE |
| C4 | CartaCustodiaPage Supabase → D1 | ✅ COMPLETO |
| D1 | WhatsApp link en certificado | ✅ COMPLETO |
| D2 | Auto-registro caja al cerrar HC | ✅ COMPLETO |
| - | CotizacionesPage crash (useBackendObject) | 🔴 NUEVO - fix inmediato |
| - | UsersPage migrar Supabase → D1 | 🔴 NUEVO - fix prioritario |
| - | SGSSTPage sub-módulos navegables | 🟠 NUEVO |
| - | CompaniesSection tabs empresa | 🟠 NUEVO |

---

### HALLAZGOS DE ARQUITECTURA — SG-SST

**El módulo SG-SST es el más completo del refactorizado.** 7 sub-componentes totales:

| Sub-módulo | Archivo | Líneas |
|------------|---------|--------|
| Dashboard principal | `SSTDashboard.jsx` | 530 |
| Matriz de Riesgos (IPEVR) | `RiskMatrix.jsx` | 676 |
| Módulo Capacitaciones | `TrainingModule.jsx` | 485 |
| Investigación de Accidentes | `AccidentInvestigation.jsx` | 595 |
| Inspecciones | `InspectionChecklist.jsx` | 582 |
| Repositorio Documentos | `DocumentRepository.jsx` | 525 |
| Plan Anual | `AnnualPlan.jsx` | 497 |
| Generador de Política | `PolicyGenerator.jsx` | 542 |
| **TOTAL** | | **4,432 líneas** |

Problema: Todo este trabajo está encerrado porque `SGSSTPage.jsx` no pasa `onNavigate`. Con un fix de 30 líneas se desbloquean 4,432 líneas de funcionalidad.

---

### PRIORIDAD DE EJECUCIÓN (post re-auditoría)

**P0 — Ejecutar INMEDIATO (bugs que crashean o datos no persisten):**
1. `GAP-CO01` — CotizacionesPage: agregar `useBackendObject` al import (2 min)
2. `GAP-U01` — UsersPage: migrar a D1 (30 min)

**P1 — Alto impacto, bajo esfuerzo:**
3. `GAP-SG01` — SGSSTPage: pasar `onNavigate` y mapear sub-módulos (2 h) → desbloquea 4,432 líneas ya escritas
4. `GAP-HD02` / `GAP-ARL02` / `GAP-PF02` — Migrar 3 módulos a D1 (1.5 h total)

**P2 — Features que amplían funcionalidad:**
5. `GAP-EM05` — Tabs empresa: Historial / Facturación / Docs / Pacientes (4 h)
6. `GAP-CJ02` — Ampliar CashBox con % médico + export + categorías (3 h)
7. `GAP-ENC01` — Ver respuestas de encuestas (2 h)

---

*Re-auditoría completada: 2026-06-23.*  
*Metodología: lectura completa del source code de 25 archivos + conteo de sistemas + verificación de imports + grep forense.*  
*NO exponer VITE_WORKER_TOKEN en ningún log, informe o consola.*
