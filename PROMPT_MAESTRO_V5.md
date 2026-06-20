# PROMPT MAESTRO V5 — SISO OCUPASALUD
# Modo: 2 repos, tokens mínimos, bitácora persistente, Cloudflare externo
# Versión: 5.0 | Fecha base: 2026-06-18

---

## REGLA CERO — LEE ESTO PRIMERO

Antes de escribir una sola línea de código, haz esto en orden:

1. Lee este prompt completo.
2. Lee el archivo `BITACORA_CONTEXTO.md` si existe en el repo.
3. Ejecuta: `npm install && npm run build`
4. Responde con el bloque ESTADO INICIAL (ver sección 13).
5. Espera confirmación del usuario para empezar.

No improvises. No asumas. No codifiques antes del paso 4.

---

## 1. MISIÓN

Refactorizar el monolito `ocupasaludparadesplegar` (58.389 líneas en un solo
App.jsx) en una arquitectura modular limpia, trabajando ÚNICAMENTE sobre
`siso-appultimo` como repositorio destino final.

Meta: 100% de paridad funcional con el monolito. Ni más, ni menos.
Deploy destino: Cloudflare Pages (proyecto a configurar sobre Repo B).

---

## 2. REPOSITORIOS — SOLO DOS

### REPO A — MONOLITO FUENTE DE VERDAD (SOLO LECTURA)
- GitHub: https://github.com/drjuliancucalon-droid/ocupasaludparadesplegar
- Local: C:\Users\JQK3\Desktop\ocupasaludparadesplegar
- Archivo clave: src/App.jsx (58.389 líneas)
- Regla: NUNCA modificar. Solo leer y extraer lógica.
- Referencias críticas de líneas:
  - 8630  → initialOccupPatientState (100+ campos)
  - 8960  → Roles y permisos
  - 11490 → openPrintWindow()
  - 16853 → function AppInner()
  - 17024 → _publicarAlPortalEmpresa()
  - 19600 → cierre HC bloqueante (6 claves D1)
  - 21366 → _writeArrayMergeD1() — MERGE anti-regresión
  - 23485 → goTo() con guard HC dirty
  - 32296 → botón HC Ocup. con spread completo del paciente
  - 45517 → abrirHCDesdeAgenda() — FIX 1

### REPO B — DESTINO FINAL (ÚNICO REPO DE TRABAJO)
- GitHub: https://github.com/drjuliancucalon-droid/siso-appultimo
- Local: donde lo tengas clonado
- Rama: main
- Stack: React + Vite + React Router v7 + Zustand v5 + React Query v5
- Tests: Vitest + 14 test suites existentes
- Ya tiene: 44 páginas, 77 módulos, stores, hooks, shared, offlineDB, syncManager

### REPO C — SOLO PARA SAQUEO INICIAL (NO ES EL DESTINO)
- GitHub: https://github.com/drjuliancucalon-droid/siso-ocupasalud
- Local: C:\Users\JQK3\Desktop\refactorizacion total
- Uso: copiar exactamente estos archivos a Repo B UNA SOLA VEZ en el Pre-Sprint
  y luego olvidarlo:
  - src/components/VersionWatcher.jsx
  - src/components/D1ChangesWatcher.jsx
  - src/components/StorageHealth.jsx
  - siso-worker/ (directorio completo)
  - vite.config.js (verificar que tenga version.json plugin)
  - public/_headers
  - public/_redirects
  - .github/workflows/deploy.yml (adaptar a Repo B)

---

## 3. INFRAESTRUCTURA CLOUDFLARE — ES EXTERNA AL REPO

CRÍTICO: Los datos NO viven en el repositorio. Viven en Cloudflare.

### Arquitectura real:
```
[Repo B — código fuente]
        ↓ push a main
[Cloudflare Pages CI/CD]
        ↓ build + deploy
[siso-refactor.pages.dev — frontend]
        ↓ fetch con token
[siso-api.dr-juliancucalon.workers.dev — Worker D1]
        ↓ CRUD con locking
[Cloudflare D1 — base de datos real]
        2.441 claves activas en producción
```

### Variables de entorno requeridas en .env local:
```
VITE_WORKER_URL=https://siso-api.dr-juliancucalon.workers.dev
VITE_WORKER_TOKEN=[secret — configurar en GitHub Secrets de Repo B]
VITE_STABLE_DOMAIN=https://siso-refactor.pages.dev
```

### GitHub Secrets a configurar en Repo B:
```
CF_API_TOKEN
CF_ACCOUNT_ID
CF_PAGES_PROJECT=siso-refactor
VITE_WORKER_URL=https://siso-api.dr-juliancucalon.workers.dev
VITE_WORKER_TOKEN=[token del Worker]
```

### Reglas absolutas sobre D1:
- El Worker ya está desplegado. No lo toques si no cambias siso-worker/index.js
- Si cambias siso-worker/, debes hacer: cd siso-worker && wrangler deploy
- Antes de cualquier sprint que toque almacenamiento, hacer snapshot:
  curl -H "X-Siso-Token: $TOKEN" \
    https://siso-api.dr-juliancucalon.workers.dev/health
- Los datos D1 sobreviven aunque borres el repo. Son independientes.
- Nunca escribir a D1 sin MERGE cuando el valor es un array.

---

## 4. CLAVES D1 — NOMBRES EXACTOS, NUNCA CAMBIAR

```
siso_db_patients_<userId>
siso_patients_<userId>
siso_companies_drcucalon
siso_companies_shared
siso_atenciones_cerradas
siso_hc_completa_<cc>
siso_portal_doc_<cc>
siso_portal_<code>
siso_portal_CV-<code>
siso_portal_empresa_<NIT>
siso_portal_empresa_atenciones_<NIT>
siso_portal_empresa_docs_<NIT>
siso_encuestas
siso_encuesta_resp_<token>
siso_informes
siso_saved_bills_<userId>
siso_cartas_custodia_<userId>
siso_doctor_signature
siso_doctor_data_<userId>
siso_users
siso_agendados_<userId>
siso_caja_movs_<userId>
siso_arl_<userId>
siso_mensajes
```

---

## 5. FIXES CRÍTICOS — DEBEN EXISTIR SÍ O SÍ

### FIX 1 — HC desde agenda/lista carga datos completos
Buscar paciente por docNumero en patientsList y hacer spread completo.
NUNCA abrir HC vacía. Ver línea 45517 monolito.

### FIX 2 — MERGE anti-regresión en siso_atenciones_cerradas
Leer remoto → merge por id → escribir. Ver línea 21366 monolito.

### FIX 3 — Cierre HC bloqueante
Al cerrar HC: await a las 6 claves D1 del portal. Ver línea 19600 monolito.

### FIX 4 — Popup bloqueado en impresión
window.open() puede retornar null. Si pasa: alert con instrucciones claras.

### FIX 5 — Firma base64 sin comillas extra
cleanFirma(firma) antes de guardar o publicar.

### FIX 6 — Deduplicación en importación
Merge por docNumero, no solo por id.

---

## 6. PROTOCOLO DE TOKENS MÍNIMOS

Objetivo: gastar el menor contexto posible por sesión sin perder continuidad.

### Reglas de sesión:
1. Al inicio de cada sesión: leer solo BITACORA_CONTEXTO.md
2. No reanalizar el repo completo cada vez
3. Trabajar máximo 3-5 archivos por sesión
4. Máximo 1 módulo crítico por sesión
5. Al finalizar la sesión: actualizar BITACORA_CONTEXTO.md SIEMPRE

### Cómo leer el monolito sin explotar tokens:
- No cargues App.jsx completo nunca
- Usa grep o búsqueda por número de línea para extraer solo lo necesario:
  grep -n "función_que_buscas" src/App.jsx | head -20
  sed -n '8630,8700p' src/App.jsx
- Extrae solo el bloque necesario, trabájalo, cierra

### Qué incluir en cada prompt de sesión:
- Este archivo (PROMPT_MAESTRO_V5.md)
- BITACORA_CONTEXTO.md actualizado
- Solo los archivos del módulo en curso
- Nada más

---

## 7. SISTEMA DE BITÁCORA DE CONTEXTO

### Archivo: BITACORA_CONTEXTO.md
Vive en la raíz del Repo B.
Se actualiza AL FINAL de cada sesión sin excepción.
Se lee AL INICIO de cada sesión nueva.

### Estructura obligatoria del archivo:

```markdown
# BITÁCORA DE CONTEXTO — SISO OCUPASALUD
Última actualización: [fecha y hora]
Sprint actual: [número y nombre]
Porcentaje estimado de completitud: [X%]

## ESTADO DEL REPOSITORIO
- Build: [PASA / FALLA — detalle si falla]
- Tests: [X/Y pasando — cuáles fallan]
- Rama: [nombre]
- Último commit: [hash corto + mensaje]
- Worker D1: [OK / NO VERIFICADO]

## COMPLETADO EN SESIÓN ANTERIOR
- [módulo o archivo]: [qué se hizo exactamente]
- [módulo o archivo]: [qué se hizo exactamente]

## EN CURSO
- [módulo o archivo]: [estado actual + qué falta]

## PRÓXIMO PASO EXACTO
[instrucción atómica de qué hacer primero en la siguiente sesión]
[máximo 3 líneas]

## DEUDA TÉCNICA DETECTADA
- [deuda]: [impacto] [sprint donde se debe atacar]

## RIESGOS ACTIVOS
- [riesgo]: [mitigación]

## INVENTARIO DE COBERTURA
### Módulos completos ✅
- [lista]

### Módulos parciales 🔶
- [módulo]: [qué falta]

### Módulos ausentes ❌
- [lista]

## ARCHIVOS TOCADOS EN ÚLTIMA SESIÓN
- [ruta archivo]: [tipo de cambio]

## CONTEXTO TÉCNICO CLAVE PARA PRÓXIMA SESIÓN
[máximo 5 líneas de contexto crítico que el agente DEBE saber antes de empezar]
```

---

## 8. CONSTRAINTS ABSOLUTOS

1. Nunca perder datos en D1 (2.441 claves activas en producción).
2. Nunca renombrar claves D1 existentes.
3. Nunca sobrescribir arrays D1 sin MERGE por id.
4. Nunca usar Supabase para escritura nueva.
5. Nunca modificar Repo A.
6. Nunca pasar al siguiente sprint sin build exitoso.
7. Nunca hacer push --force a main.
8. Nunca abrir HC sin cargar datos completos del paciente existente.
9. Nunca cerrar HC sin publicación bloqueante a las 6 claves D1.
10. Nunca declarar un módulo completo sin compararlo contra el monolito.
11. Nunca cargar App.jsx completo en contexto. Usar grep/sed por bloques.
12. Nunca terminar una sesión sin actualizar BITACORA_CONTEXTO.md.

---

## 9. INVENTARIO FUNCIONAL — CHECKLIST MAESTRO

Marca cada item con ✅ completo / 🔶 parcial / ❌ ausente.
Este inventario vive también en BITACORA_CONTEXTO.md.

### 9.1 Auth y usuarios
- login, logout, cambio contraseña, recuperación
- rate limiting, session timeout
- roles: super_admin, administrador, medico, secretaria, admin_empresa
- permisos granulares, multi-médico, auditoría, 2FA TOTP

### 9.2 Pacientes
- listado, búsqueda, filtros, CRUD
- anti-duplicados, anti-fantasmas
- importar encuesta, importar Excel/CSV
- exportar PDF, historial, badges estado

### 9.3 HC Ocupacional
- initialOccupPatientState completo (línea 8630 monolito)
- tabs: datos, ocupacional, antecedentes, exploración, riesgos GTC-45,
  recomendaciones, restricciones, cargo, consentimiento, fórmula/derivaciones
- antecedentes 8 categorías, exploración 29 sistemas, riesgos GTC-45
- aptitud, foliación, código verificación, QR
- recomendaciones A-F, restricciones, perfil cargo, consentimiento
- autoguardado 30s, dirty guard, fecha retroactiva, vigencia
- cierre bloqueante 6 claves D1, MERGE anti-regresión, impresión

### 9.4 HC General
- initialGeneralPatientState, motivo, CIE-10, exploración
- plan, fórmula, evolución, incapacidades, impresión

### 9.5 Derivaciones y exámenes
- interconsulta, urgencia, solicitud, popup editable, alerta popup bloqueado

### 9.6 Fórmula médica
- CRUD medicamentos, autocompletar, impresión individual, receta, CIE-10

### 9.7 Portal trabajador
- acceso código/cédula, certificado, historial, PDF, firma, QR, datos IPS

### 9.8 Portal empresa
- login NIT+código, atenciones, filtro periodo, contador
- descargas individuales, ZIP, informes, custodia, cuentas cobro

### 9.9 Encuestas
- crear, link estable Worker D1, responsive, respuestas
- importar pacientes, agendar, PDF, Excel

### 9.10 Agenda
- diaria, próximas, semanal, mensual
- crear cita, recurrencia, solapamiento, multi-médico
- estados cita, HC desde cita con datos completos (FIX 1)

### 9.11 Empresas
- CRUD, NIT, ARL, tarifas, código portal, actividad, docs, MERGE

### 9.12 Facturación y caja
- cobro, items, numeroALetras, PDF, histórico, por facturar
- caja, auto-registro al cerrar HC

### 9.13 Informes sociodemográficos
- generar, gráficos, publicar portal, PDF, D1

### 9.14 Cartas de custodia
- generar, descargar, D1

### 9.15 IA
- multi-provider (Gemini, Groq, OpenRouter, Together, OpenAI)
- recomendaciones, justificaciones, derivaciones, cargo, evolución, config

### 9.16 Telemedicina
- agendar, formulario, crear HC, historial

### 9.17 SGSST
- dashboard, GTC-45, plan anual, accidentes, checklists
- capacitaciones, docs, políticas, SVE

### 9.18 Configuración
- usuarios, firma canvas, datos médico, IPS, EmailJS, sistema

### 9.19 Notificaciones y mensajería
- mensajes internos, alertas vencimientos, toasts

### 9.20 Comunicaciones
- email (EmailJS auto + mailto), WhatsApp wa.me, HTML profesional

### 9.21 D1 y almacenamiento
- d1Client: get/set/getMany/delete/writeArrayMerge
- chunking >500KB, retries, If-Match locking
- VersionWatcher, D1ChangesWatcher, StorageHealth

### 9.22 Offline-first
- IndexedDB, cola pendientes, sync, banner, idempotencia UUID

### 9.23 Impresión y PDF
- certificado, HC general, fórmula, derivación, solicitud, factura
- informe, lista pacientes, custodia, popup editable, alerta bloqueado

### 9.24 Cumplimiento legal
- Res. 1843/2025, Res. 1995/1999, Ley 1581/2012, GTC-45, verificación URL

---

## 10. ARQUITECTURA OBJETIVO

```
siso-appultimo/
├── .github/workflows/deploy.yml    ← portado de Repo C
├── .env.example
├── package.json                    ← ya existe en Repo B
├── vite.config.js                  ← versión de Repo C (con version.json plugin)
├── vitest.config.js
├── index.html
├── public/
│   ├── _headers                    ← portado de Repo C
│   ├── _redirects
│   ├── sw.js
│   └── manifest.json
├── siso-worker/                    ← portado de Repo C
│   ├── index.js
│   ├── schema.sql
│   └── wrangler.json
├── BITACORA_CONTEXTO.md            ← NUEVO — sistema de continuidad
└── src/
    ├── App.jsx                     ← router limpio
    ├── main.jsx
    ├── styles.css
    ├── stores/
    │   ├── authStore.js
    │   ├── companiesStore.js
    │   ├── aiStore.js
    │   └── uiStore.js
    ├── app/
    │   └── Layout.jsx
    ├── components/
    │   ├── VersionWatcher.jsx      ← portado de Repo C
    │   ├── D1ChangesWatcher.jsx    ← portado de Repo C
    │   ├── StorageHealth.jsx       ← portado de Repo C
    │   └── ErrorBoundary.jsx
    ├── shared/
    │   ├── lib/
    │   │   ├── d1Client.js         ← MERGE + chunking + retries
    │   │   ├── storage.js
    │   │   ├── supabase.js         ← solo fallback lectura
    │   │   ├── syncManager.js
    │   │   ├── offlineDB.js
    │   │   ├── aiProviders.js
    │   │   ├── printUtils.js
    │   │   ├── formatters.js
    │   │   ├── security.js
    │   │   ├── crypto.js
    │   │   └── normativa.js
    │   ├── data/
    │   │   ├── initialStates.js    ← initialOccupPatientState línea 8630
    │   │   ├── cie10.js, cups.js, medicamentos.js
    │   │   ├── recomendaciones.js, restricciones.js
    │   │   └── planConfig.js
    │   ├── components/
    │   │   ├── CIE10Input.jsx, CUPSInput.jsx
    │   │   ├── MedicamentoAutocomplete.jsx
    │   │   ├── DoctorSignature.jsx
    │   │   └── ...UI compartida
    │   └── utils/
    │       ├── validators.js, helpers.js
    │       └── storageKeys.js      ← todas las claves D1
    ├── modules/
    │   ├── auth/
    │   ├── clinical/
    │   ├── patients/
    │   ├── companies/
    │   ├── agenda/
    │   ├── billing/
    │   ├── reports/
    │   ├── sgsst/
    │   ├── ai/
    │   ├── users/
    │   ├── telemedicine/
    │   └── notifications/
    └── pages/
        ├── LoginPage.jsx
        ├── DashboardPage.jsx
        ├── PatientsPage.jsx
        ├── HistoriaPage.jsx
        ├── HistoriaGeneralPage.jsx
        ├── CompaniesPage.jsx
        ├── AgendaPage.jsx
        ├── BillingPage.jsx
        ├── CajaPage.jsx
        ├── ReportsPage.jsx
        ├── SGSSTPage.jsx
        ├── TelemedicinePage.jsx
        ├── WorkerPortalPage.jsx
        ├── PortalEmpresaPage.jsx
        ├── UsersPage.jsx
        ├── SettingsPage.jsx
        ├── CartaCustodiaPage.jsx
        ├── CertificadoPage.jsx
        └── VerificacionPage.jsx
```

---

## 11. SECUENCIA DE SPRINTS

NO saltar sprints. NO mezclar. NO avanzar sin build exitoso.

### PRE-SPRINT — SAQUEO DE REPO C (hacer una sola vez, hoy)
Copiar de Repo C a Repo B:
- src/components/VersionWatcher.jsx
- src/components/D1ChangesWatcher.jsx
- src/components/StorageHealth.jsx
- siso-worker/ completo
- vite.config.js (con version.json plugin)
- public/_headers + public/_redirects
- .github/workflows/deploy.yml (ajustar nombre de repo)
Luego: npm install && npm run build → debe pasar
Commit: `presprint: infraestructura portada de repo-c`

### SPRINT 1 — D1 CLIENT COMPLETO
Verificar/completar d1Client.js:
- d1Get, d1Set, d1GetMany, d1Delete
- d1WriteArrayMerge(key, list, idField) ← CRÍTICO
- chunking automático si payload >500KB
- retries 3 intentos con backoff exponencial
- If-Match header para locking optimista
Integrar VersionWatcher + D1ChangesWatcher en App.jsx
Tests: d1Client.test.js
Commit: `sprint1: d1client merge-antirregresion completo`

### SPRINT 2 — AUTH + ROUTER + LAYOUT
- authStore con todos los roles
- LoginPage con rate limiting y 2FA
- UsersPage con CRUD
- authStore conectado a siso_users en D1
- Router completo (todas las rutas)
- Layout navbar + sidebar responsive
Commit: `sprint2: auth router usuarios`

### SPRINT 3 — HC OCUPACIONAL (2-3 sesiones)
- Verificar initialOccupPatientState contra línea 8630 del monolito
- Completar todos los campos por tab
- PhysicalExam 29 sistemas
- RecommendationsPanel checklist A-F
- RestrictionsPanel
- TabFormulaDerivacion con impresión
- Cierre bloqueante D1 (FIX 3) — línea 19600 monolito
- Código verificación SISO-YYYYMMDD-PACID-HASH8
- QR
- Impresión certificado completo
Commit: `sprint3: hc-ocupacional cierre-bloqueante completo`

### SPRINT 4 — HC GENERAL + FÓRMULA + DERIVACIONES
- GeneralHC con todos los campos
- PrescriptionTab con autocompletar
- ExamRequestTab con impresión
- Derivación popup editable
Commit: `sprint4: hc-general formula derivaciones`

### SPRINT 5 — PORTALES
- WorkerPortalPage login cédula/código
- PortalEmpresaPage login NIT+código, periodos, descarga ZIP
- FIX 5: cleanFirma antes de publicar
Commit: `sprint5: portales trabajador empresa`

### SPRINT 6 — ENCUESTAS + AGENDA + PACIENTES
- Encuestas: crear, link D1, importar, agendar
- Agenda: 4 vistas, recurrencia, multi-médico, estados
- FIX 1: HC desde agenda con datos completos (línea 45517)
- FIX 6: deduplicar por docNumero
Commit: `sprint6: encuestas agenda pacientes`

### SPRINT 7 — FACTURACIÓN + CAJA + INFORMES
- BillingPage + numeroALetras
- CajaPage + auto-registro
- Informes sociodemográficos + publicar portal
Commit: `sprint7: facturacion caja informes`

### SPRINT 8 — IA + TELEMEDICINA + SGSST
- aiProviders multi-provider
- Panel config AI con validación keys
- Telemedicina: agendar, formulario, crear HC
- SGSST: dashboard, GTC-45, plan, accidentes
Commit: `sprint8: ia telemedicina sgsst`

### SPRINT 9 — CARTAS + COMUNICACIONES
- CartaCustodia: generar + D1
- Email: EmailJS auto + mailto
- WhatsApp: wa.me
- Mensajería interna
Commit: `sprint9: cartas comunicaciones mensajeria`

### SPRINT 10 — QA FINAL
- E2E: login → paciente → HC → cierre → portal empresa
- E2E: encuesta → importar → agendar
- Verificar firma sin comillas extra
- Verificar VersionWatcher y D1ChangesWatcher
- Conteo de cobertura funcional ≥ 95%
- Build + tests todo verde
- Push → CI/CD → verificar en Cloudflare Pages
Commit: `sprint10: qa final produccion`

---

## 12. METODOLOGÍA FORENSE POR MÓDULO

Antes de implementar cualquier módulo, entregar esta matriz:

| Campo | Detalle |
|---|---|
| Función en monolito | nombre exacto |
| Línea en App.jsx | número |
| Archivo destino en Repo B | ruta |
| Estado actual | existente / parcial / ausente / roto |
| Brecha | qué falta exactamente |
| Riesgo clínico | alto / medio / bajo |
| Acción | implementar / completar / portar / eliminar |

No improvises. No asumas. Extrae el bloque del monolito con sed antes de implementar.

---

## 13. BLOQUE ESTADO INICIAL — RESPUESTA OBLIGATORIA AL INICIO DE SESIÓN

Al iniciar cualquier sesión, responde SOLO esto primero:

```
ESTADO INICIAL DE SESIÓN
========================
Fecha y hora: [timestamp]
Sprint actual: [número y nombre]
Último commit: [hash + mensaje]
Build: [PASA / FALLA]
Tests: [X/Y — cuáles fallan]
Worker D1: [OK / NO VERIFICADO]
Próximo paso según bitácora: [texto exacto del campo PRÓXIMO PASO]

PLAN DE ESTA SESIÓN:
- Módulo/archivo 1: [acción concreta]
- Módulo/archivo 2: [acción concreta]
- Módulo/archivo 3: [acción concreta]

Confirmar para empezar.
```

---

## 14. BLOQUE CIERRE DE SESIÓN — OBLIGATORIO AL TERMINAR

Al finalizar cualquier sesión, actualizar BITACORA_CONTEXTO.md con la estructura
de la sección 7 y responder:

```
CIERRE DE SESIÓN
================
Completado hoy:
- [archivo]: [qué se hizo]

Estado del build: [PASA / FALLA]
Commit realizado: [hash + mensaje]
Próximo paso exacto: [máximo 3 líneas]
Riesgo remanente: [si existe]
Bitácora actualizada: SÍ
```

---

## 15. COMANDOS DE REFERENCIA RÁPIDA

```bash
# Extraer bloque del monolito sin cargar todo
sed -n '8630,8700p' C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\App.jsx

# Buscar función específica
grep -n "nombre_funcion" C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\App.jsx

# Build
cd [ruta-repo-b] && npm run build

# Tests
npm test

# Deploy Worker (solo si cambias siso-worker/)
cd siso-worker && wrangler deploy

# Verificar Worker D1
curl -H "X-Siso-Token: $VITE_WORKER_TOKEN" \
  https://siso-api.dr-juliancucalon.workers.dev/health

# Commit estándar
git add -A
git commit -m "sprintX(scope): descripcion precisa"
git push origin main
```

---

## 16. CRITERIOS DE ÉXITO

El proyecto está completo cuando simultáneamente:

1. Build exitoso sin errores.
2. Tests críticos pasando.
3. Flujo completo funciona: login → paciente → HC → cierre → portal empresa.
4. D1 sin pérdida de datos (conteo ≥ al inicial).
5. Portales consultables.
6. Los 6 FIX implementados y verificados.
7. Cobertura funcional ≥ 95% del inventario sección 9.
8. Deploy estable en Cloudflare Pages.
9. BITACORA_CONTEXTO.md actualizada y coherente.

---

*PROMPT MAESTRO V5 — 2 repos, tokens mínimos, bitácora persistente*
*Monolito: 58.389 líneas | Destino: siso-appultimo | Deploy: Cloudflare Pages*
