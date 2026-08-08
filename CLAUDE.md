# Reglas del proyecto — siso-appultimo (refactor)

## Datos sintéticos obligatorios en cualquier artefacto guardado en disco

**Precedente:** el 2026-08-07, al redactar un documento de diseño de seguridad, se incluyó como "ejemplo ilustrativo" un número de documento real de un paciente, recordado del contexto de la conversación (no leído de código ni de una base de datos). Se corrigió antes de comitear y se confirmó — mediante inspección exhaustiva de todos los objetos de git alcanzables en el repositorio afectado — que el valor nunca llegó a entrar al historial de git. Aun así, el hecho de que se haya escrito a disco es un hallazgo de seguridad en sí mismo bajo Ley 1581/2012 y Res. 1843/2025 (protección de datos de salud), no un detalle ya resuelto por la corrección posterior.

**Alcance de esa auditoría:** confirma ausencia del dato en el historial de Git. No cubre editor swap files, autoguardado, historial de terminal local, ni logs de la sesión del agente que generó el archivo. El titular del proyecto debe revisar esas superficies por separado. El riesgo se declara MITIGADO EN GIT, no ELIMINADO EN TODOS LOS SISTEMAS.

**Regla, sin excepción, para cualquier fase futura de este proyecto:**

1. Todo ejemplo en documentación, código, pruebas o fixtures debe usar datos sintéticos **declarados explícitamente como falsos** desde el primer borrador — nunca un valor real visto en el código, en D1/Supabase, ni recordado del contexto de la conversación. Ejemplos válidos de formato:
   - Documento: `000000000` o `TEST-DOC-0001`
   - NIT: `900000000`
   - Nombre: `Paciente de Prueba` / `Empresa de Prueba SAS`
   - Código de acceso: `EMP-TEST-0000`
2. Prohibido usar cualquier dato mencionado en el contexto de la conversación (documentos, nombres, NIT, códigos, cifras clínicas, montos) como "ejemplo ilustrativo" en un archivo que se escribe a disco, aunque no se vaya a comitear todavía — escribir a disco ya es el momento de riesgo, no el commit.
3. Antes de escribir cualquier archivo nuevo en `docs/`, `src/`, `tests/` o fixtures: autochequeo obligatorio — *"¿este valor viene de un dato real visto en esta sesión, o es sintético y está declarado como tal?"*. Ante la duda, usar sintético.
4. Después de cada archivo nuevo o editado y **antes** de reportarlo como listo (no como paso opcional posterior), correr un grep de patrones identificables: documentos de 6-12 dígitos, NIT de 9-10 dígitos, nombres completos, emails, teléfonos.
5. Si el archivo ya fue comiteado y el grep encuentra algo, no basta con corregir en un commit nuevo — hay que verificar si el dato quedó en el historial (`git log --all -p`, o mejor, un dump completo de objetos vía `git cat-file --batch` para no depender de que el path/mensaje coincida) y tratarlo como incidente de cumplimiento hasta confirmar lo contrario, deteniéndose antes de cualquier `push` si el resultado es positivo.

## HALLAZGO P0 — Token maestro expuesto en bundle de producción

Fecha de inicio real de exposición: 2026-07-22 (deployment `6eb4574`).
Fecha de detección: 2026-08-07.
Severidad: P0 — Secreto maestro con acceso total de lectura/escritura/borrado sobre D1 productiva con datos clínicos.

Evidencia:
- `VITE_WORKER_TOKEN` configurado en entorno Production de Cloudflare Pages del proyecto `siso-appultimo-arp`.
- Prefijo `VITE_` causa inclusión automática en el bundle de cliente por defecto de Vite — confirmado sin excepción: `vite.config.js` no tiene ningún `define`/`envPrefix` que trate esa variable de forma especial.
- Confirmado en el bundle real servido (`https://siso-appultimo-arp.pages.dev/assets/index-CNxAGKMf.js`): cadena `"X-Siso-Token"` seguida de un literal de 32 caracteres ya sustituido en build-time, junto a la URL del Worker minificada — no una referencia dinámica, un valor horneado en el JavaScript público.
- Código fuente: `src/lib/d1Client.js`, importado por 30 archivos incluyendo `PatientsPage.jsx`, `CompaniesPage.jsx`, `HistoriaPage.jsx`, `BillingPage.jsx`, `UsersPage.jsx`, `authStore.js` — código activo, no muerto.

Estado de auditoría de accesos durante la ventana de exposición: **sin visibilidad retroactiva disponible.** Verificado en el dashboard de Cloudflare, Worker `siso-api` → Observability: "Registros de Workers: Deshabilitado" y "Trazas de Workers: Deshabilitado" (texto literal). Única telemetría: métricas agregadas de las últimas 24h, sin desglose por IP/método/clave y sin alcance histórico de 16 días. Logpush nunca configurado (la página mostró material de onboarding, no jobs activos). No se afirma "sin actividad sospechosa" — se afirma que no existe ningún registro contra el cual verificarlo.

Acciones tomadas:
- [x] Rotación del token en el Worker productivo (ejecutada por el propietario del proyecto — confirmada en el contexto de trabajo del 2026-08-07).
- [ ] Eliminación de `VITE_WORKER_TOKEN`/`VITE_WORKER_URL` de Production (pendiente hasta completar migración BFF de los consumidores de `d1Client.js` — eliminar antes rompería la app, ver Fase A/B/C/D abajo).
- [~] Migración de `d1Client.js` al patrón BFF server-side — **Fase A en progreso** (verify/worker-portal, portal-empresa-nit, portal-empresa-docs migrados; el resto de los 30 importadores queda en `d1Client.js` sin cambios, ver plan de fases).
- [ ] Confirmación de que el build no incluye ningún secreto — el scanner (`tests/security/scan-dist-for-token.mjs`) corre limpio en cada verificación de este trabajo, pero la migración completa (Fase D) sigue pendiente.

Lección: cualquier variable con prefijo `VITE_` debe tratarse como pública por defecto. Ningún secreto de backend puede tener ese prefijo bajo ninguna circunstancia, en ningún entorno, sin excepción.

## Segundo precedente — vector de fuga de token latente en código heredado (`syncManager.js`)

**Fecha:** 2026-08-07. **Archivo:** `src/shared/lib/syncManager.js`.
**Patrón:** funciones `_d1Config()`, `_d1GetAll()`, `_d1Get()` leían `window.__SISO_CONFIG?.workerToken`/`workerUrl` y enviaban ese valor como header `X-Siso-Token` en un `fetch` hecho **desde el navegador** directamente contra el Worker `siso-api` — el mismo patrón (aunque un mecanismo distinto de `VITE_WORKER_TOKEN`) que el hallazgo P0 de arriba. Código heredado, portado del monolito (comentario propio: *"Ported from monolith"*).
**Estado encontrado:** inerte pero explotable — `window.__SISO_CONFIG` nunca es poblado por nada en el refactor (ni por el middleware BFF nuevo, que deliberadamente nunca lo hace).
**Verificación de alcance antes de tocar el archivo** (`rg -n "syncManager" src/`, repetida sobre la base real `origin/main`): dos importadores — `src/shared/lib/connectionStatus.jsx:42` (dinámico, usa `trySync`, disparado manualmente al hacer clic en `ConnectionBadge`) y `src/hooks/useSaveData.js:97` (dinámico, intenta desestructurar `enqueueSync`, que `syncManager.js` **no exporta** — bug preexistente independiente, no relacionado con el vector de token, no corregido aquí por estar fuera de alcance). Ninguno de los dos depende de `_d1Config`/`_d1GetAll`/`_d1Get`/`_refreshFromD1`.
**Decisión tomada:** eliminadas `_d1Config`, `_d1GetAll`, `_d1Get` y `_refreshFromD1` por completo. `hybridGet()`/`syncNow()` quedan con su fallback a Supabase intacto (key pública, no secreto maestro). Aplicado sobre `origin/main` real (rama `security/bff-fase-a-resync`) — la corrección anterior de este mismo hallazgo, hecha en una sesión previa, vivió únicamente en una rama aislada que nunca se fusionó a `main` y nunca llegó a producción; esta vez sí está sobre la base real.

## HALLAZGO — Bypass de autorización en monolito y refactor (portal empresa por NIT)

**Severidad:** P1 (requiere NIT específico conocido, no acceso total al sistema, pero expone certificados médicos de trabajadores sin control de acceso efectivo).

**Evidencia — monolito** (`../ocupasaludparadesplegar/src/App.jsx:17185-17215`, solo lectura): si `siso_portal_empresa_docs_{nit}` nunca tuvo un `codigoAcceso` configurado, la validación se salta sin bloquear (`docsKeyFound === false` → no se ejecuta el `return` de error), permitiendo lectura de certificados de trabajadores de esa empresa sin ningún código.

**Evidencia — refactor, más grave** (`src/pages/PortalEmpresaPage.jsx`, commit `6eb4574`): `let codigoValido = true` se inicializa **fuera** del `if (cod)`. Si el cliente simplemente no envía ningún código (campo vacío), la rama de validación nunca se ejecuta y `codigoValido` conserva su valor inicial `true` — la búsqueda pasa sin ningún bloqueo, incluso si el NIT sí tiene un `codigoAcceso` configurado. Es un bypass más flagrante que el del monolito: no requiere que falte configuración, basta con no escribir nada en el campo.

**Estado:** presente en producción real (commit `6eb4574` del refactor; monolito no verificado en cuanto a si esto fue corregido después, por ser solo-lectura). No corregido en el código legado de ninguno de los dos sistemas en este trabajo.

**Decisión pendiente del propietario:** si se corrige también en el monolito y en el flujo legado de `PortalEmpresaPage.jsx` (`buscarEmpresa` antes de esta migración), y con qué prioridad respecto al resto de la migración BFF en curso.

**El BFF nuevo NO replica ninguno de los dos comportamientos** — `functions/api/internal-store/_portalEmpresaAuth.js` (`validateAccessCode`) deniega siempre que no haya código enviado por el cliente O que no haya `codigoAcceso` almacenado para ninguna variante de NIT probada. Ninguna ruta de bypass por ausencia de configuración ni por campo vacío. Ver comentario `DIVERGENCIA DELIBERADA` en ese archivo.

## HALLAZGO P0 — Fuga de facturación/caja/custodia en portal empresa (`PortalEmpresaPage.jsx.cargarDocumentos()`)

**Severidad:** P0 — datos PHI-adyacentes de pacientes de TODAS las empresas del consultorio, expuestos en el payload de red de una pantalla pública sin autenticación de doctor.

**Evidencia — mecanismo:** `cargarDocumentos()` (código real, commit `6eb4574`, líneas 145-233 antes de esta corrección) leía `siso_saved_bills_{userId}`, `siso_caja_movs_{userId}` y `siso_cartas_custodia_{userId}` **completos** vía `d1Get()` directo desde el navegador — es decir, TODA la facturación, movimientos de caja y cartas de custodia de TODO el consultorio, de TODAS las empresas, no solo de la empresa autenticada. `userId` usa el fallback hardcodeado `'drcucalon'` porque el visitante del portal público no tiene sesión de doctor en `localStorage`. El filtrado por NIT (`idMatch`/`nombreMatch` para cuentas, coincidencia de NIT para custodia) ocurría **únicamente en el navegador, después de que el array completo ya había llegado**.

**Evidencia — shape del dato filtrado (confirmado en `src/pages/HistoriaPage.jsx:551-561`, donde se construye cada entrada de `siso_caja_movs_{userId}`):** cada registro incluye `pacienteNombre` (nombre completo del paciente), `pacienteDoc` (documento del paciente), `tipoConsulta`, `medicoId`, `medicoNombre`, `codigoVerificacion` — no son cifras financieras puras, son datos PHI-adyacentes de pacientes de empresas ajenas a la que se autenticó.

**Combinado con** el hallazgo ya documentado arriba ("Bypass de autorización en monolito y refactor — portal empresa por NIT"): antes de esta corrección, el bypass de `codigoAcceso` vacío permitía llegar a `cargarDocumentos()` sin ningún código real, haciendo esta fuga explotable **sin autenticación efectiva alguna**, visible en el payload de red (pestaña Network de cualquier navegador) de cualquier visitante.

**Alcance verificado:** este patrón (descarga completa + filtrado client-side, en un flujo sin sesión de doctor) es **único** a la ruta pública de `PortalEmpresaPage.jsx`. Todos los demás consumidores de las mismas claves D1 (`BillingPage.jsx`, `CajaPage.jsx`, `CartaCustodiaPage.jsx`, `useBackendData.js`, `BackupPage.jsx`, `SettingsPage.jsx`, `UsersSection.jsx`, `authStore.js`) son pantallas internas con sesión de doctor autenticada, donde ver los datos completos del propio consultorio es un comportamiento legítimo — no se tocaron.

**Corrección aplicada:**
- Nuevo endpoint `functions/api/internal-store/portal-empresa-financiero/[nit].js` — mismo gate de `codigoAcceso` (`_portalEmpresaAuth.js`) que `portal-empresa-nit`/`portal-empresa-docs`. Filtra por NIT **server-side**, antes de construir la respuesta — el array completo nunca sale del servidor. Proyecta únicamente `concepto, monto, periodo, fecha, mesTexto, anio, savedAt, empresaNombre` (confirmados contra el JSX real que los renderiza, `PortalEmpresaPage.jsx:558,567`) — nunca `pacienteNombre`, `pacienteDoc`, `medicoId`, `medicoNombre`, `tipoConsulta`, `codigoVerificacion`, `empresaClienteId`/`empresaClienteNombre` (metadata de filtrado, no de render), ni `codigoAcceso`.
- `src/lib/bffPortalClient.js`: nueva función `getEmpresaFinancieroPublic(nit, codigoAcceso)`.
- `PortalEmpresaPage.jsx.cargarDocumentos()`: reemplazado el bloque que llamaba `d1Get()` directo sobre bills/caja/custodia por una llamada a `getEmpresaFinancieroPublic()`. Ya no existe ningún filtrado por NIT en el navegador para esta familia de datos.
- Pruebas: `tests/security/portal-empresa-financiero.negative.test.js` — incluye una prueba que construye un NIT-A autorizado y un NIT-B ajeno y verifica sobre el **texto crudo de la respuesta HTTP** (no sobre lo que la UI renderiza) que ningún dato de NIT-B (montos, nombres de empresa, nombres/documentos de pacientes) aparece jamás en la respuesta de NIT-A.
- **No corregido en este bloque, deliberadamente:** el `userId` server-side sigue hardcodeado a `'drcucalon'` (mismo comportamiento que el código real) — resolver identidad real de sesión para bills/caja/custodia queda fuera de alcance; este bloque contiene la fuga con el modelo de datos actual, no lo rediseña. `buscarIndividual()` de `PortalEmpresaPage.jsx` tampoco se tocó (no toca estas claves).

**Estado:** [x] Endpoint creado con filtrado server-side y proyección mínima. [x] Cliente/UI migrados, filtrado client-side eliminado. [x] Pruebas negativas de fuga cruzada de NIT sobre payload crudo. [x] Verificación completa (build limpio, scanner con el mismo resultado pre-existente y ya documentado, 214/214 tests, monolito sin cambios). [ ] Push a `origin/security/bff-fase-a-resync` — pendiente, requiere que el propietario del repositorio ejecute el comando manualmente (limitación de credenciales de git en este entorno, ver más abajo). [ ] Merge a `main` y despliegue a preview — no autorizado todavía, a evaluar junto con el resto del trabajo de Fase A.

## Plan de migración de `d1Client.js` al patrón BFF — estado por fase

**Fase A (en progreso, este bloque):** `VerificacionPage.jsx` (buscarPorCodigo + buscarPorNIT), `WorkerPortal.jsx`, y la porción de `PortalEmpresaPage.jsx.buscarEmpresa()` que lee el gate + `atenciones_<nit>` — migrados a `functions/api/internal-store/{verify,portal-empresa-nit,portal-empresa-docs}`. `PortalEmpresaPage.jsx.cargarDocumentos()` y `.buscarIndividual()` **NO se tocaron** — siguen en `d1Client.js` sin cambios (ver comentario `TEMPORAL` en el propio archivo).

**Por qué `cargarDocumentos()` no se migró junto con el resto:** `siso_portal_empresa_docs_{nit}.periodos[]` mezcla intrínsecamente `informe`, `cuenta` (facturación) y `custodia` (cartas de custodia) dentro de la misma estructura — no son campos separables sin filtrar periodo por periodo. Migrarla habría requerido tocar datos de facturación/custodia, fuera del alcance explícitamente acordado para Fase A.

**Fase B (pendiente, no autorizada):** `SettingsPage.jsx`, `aiStore.js`, `EpidemiologicalReport.jsx`, `CompaniesSection.jsx`, `RecuperarAcceso.jsx`.

**Fase C (pendiente, no autorizada):** `AgendaPage.jsx`, `EncuestasPage.jsx`, `EncuestasTab.jsx`, `SurveyResponsePage.jsx`, `PortafolioPage.jsx`, `ARLPage.jsx`, `HabeasDataPage.jsx`, `CartaCustodiaPage.jsx`, `PropuestaEconomicaModal.jsx`, `sgsstService.js`, `telemedicineService.js`, `migrateStorage.js`, `Layout.jsx`.

**Fase D (pendiente, no autorizada, la más sensible):** `CompaniesPage.jsx`, `useSaveData.js`, `PatientsPage.jsx`, `HistoriaPage.jsx`, `BillingPage.jsx`, `UsersPage.jsx`, `authStore.js`. Incluye `buscarIndividual()` de `PortalEmpresaPage.jsx` y el resto de accesos internos autenticados a `siso_saved_bills_*`/`siso_caja_movs_*`/`siso_cartas_custodia_*`. **La porción pública de `cargarDocumentos()` (lectura de bills/caja/custodia desde el portal sin sesión de doctor) ya se corrigió fuera de orden de fase, como P0 aislado — ver "HALLAZGO P0 — Fuga de facturación/caja/custodia en portal empresa" arriba — porque era explotable hoy, no una migración programada.**

`VITE_WORKER_TOKEN`/`VITE_WORKER_URL` **no se eliminan de Production hasta que las 4 fases estén completas** — eliminarlas antes rompería toda la app, ya que 30 archivos siguen dependiendo de `d1Client.js`.

## Límites de repositorio (vigentes mientras dure el trabajo de compatibilidad D1)

- `../ocupasaludparadesplegar/**` es solo lectura: nunca `git add/commit/push/reset/checkout/merge`, nunca `npm install/build/dev`, nunca `wrangler deploy`/`wrangler d1 execute --remote` ahí.
- `siso-appultimo/siso-worker/**` no se modifica ni se despliega sin aprobación explícita separada.
- Nunca `POST`/`PUT`/`PATCH`/`DELETE` contra el Worker de producción (`siso-api.dr-juliancucalon.workers.dev`) ni escrituras remotas contra D1/Supabase, salvo aprobación explícita y acotada a una acción concreta.
- Ningún secreto (`SISO_TOKEN` ni ningún otro) puede tener prefijo `VITE_`, ni viajar al navegador en ninguna forma (HTML, bundle JS, `window.*`, headers de respuesta, logs) — el patrón correcto es el BFF same-origin (`functions/api/internal-store/*`), token solo server-side vía `context.env`.
