# PROMPT MAESTRO — Igualación quirúrgica del refactor SISO al monolito de producción

> Copia y pega este documento completo como instrucción inicial al agente/desarrollador que va a ejecutar el trabajo. Está escrito para ser usado directamente, no como referencia de lectura pasiva.

---

## Quién eres y cuál es tu misión

Vas a trabajar sobre el repositorio `siso-appultimo` (carpeta local `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio`), un refactor modular de una app médica ocupacional llamada SISO. Existe un monolito hermano — `C:\Users\JQK3\ocupasaludparadesplegar` — que **está en producción, funciona al 100% y es la única fuente de verdad** sobre cómo debe comportarse, verse y guardar datos la aplicación. Tu misión es lograr que el refactor iguale QUIRÚRGICAMENTE al monolito: mismas funciones, misma organización, mismo comportamiento de guardado/edición, misma presentación visual — hasta que un usuario que conoce el monolito no note diferencia alguna al usar el refactor.

**No estás partiendo de cero.** Ya existe una auditoría exhaustiva completada hoy (2026-07-21), verificada código-contra-código en ambos proyectos. Antes de escribir una sola línea, lee estos 3 documentos en esta carpeta, en este orden:

1. `MATRIZ_PARIDAD_MONOLITO_VS_REFACTOR_2026-07-21.md` — el diagnóstico: qué está a la par, qué falta, qué está roto, con archivos y líneas exactas.
2. `COMPARACION_CANDADOS_WORKER_2026-07-21.md` — el detalle técnico completo de la capa de datos/candados de ambos workers.
3. `INVENTARIO_COMPLETO_MONOLITO_2026-07-21.md` — el inventario pantalla por pantalla del monolito, tu referencia de verdad para cualquier duda de comportamiento/UI.

## Regla de oro sobre la documentación previa del proyecto

Los ~40 archivos `.md` que ya existen en esta carpeta (`PROTOCOLO_INTERVENCION.md`, `AUDITORIA_QUIRURGICA_2026-07-16.md`, `PROGRESO_IGUALACION.md`, etc.) están **confirmados desactualizados** — afirman que ciertos ítems están "pendientes" cuando el propio código ya los tiene implementados, y viceversa. **No confíes en el estado que esos documentos afirman.** Si necesitas contexto histórico, úsalos, pero para determinar qué está hecho y qué falta, **verifica siempre el código fuente real**, o confía en los 3 documentos de hoy listados arriba, que sí fueron verificados línea por línea. Cuando termines cada fase de este prompt, **actualiza o reemplaza esos documentos viejos** (o créalos de nuevo) para que reflejen el estado real — no dejes que la próxima persona (humana o IA) vuelva a perder tiempo con información falsa.

## Reglas de seguridad — no negociables

1. **Nunca toques el monolito** (`C:\Users\JQK3\ocupasaludparadesplegar`). Es de solo lectura para ti — únicamente para consultar cómo se comporta algo. Cualquier cambio que necesites hacer va en el refactor.
2. **Nunca ejecutes `wrangler deploy` desde `siso-worker/` ni `siso-worker-deploy/` de este proyecto hasta completar la FASE 0.** Ambos workers comparten el mismo backend en producción (`https://siso-api.dr-juliancucalon.workers.dev`) con el monolito. Desplegar el worker del refactor tal como está HOY rompería el guardado de pacientes/HC de **ambas** aplicaciones en producción real (ver FASE 0, ítem 1).
3. Revoca o rota cualquier credencial que encuentres embebida en texto plano en el código o en `.git/config` antes de continuar — hay al menos un token de GitHub y contraseñas de usuario en texto plano confirmadas (ver FASE 1, seguridad).
4. Antes de cualquier cambio no trivial, deja un comentario en el código explicando el "por qué" si no es obvio — el monolito tiene ese hábito documentado (`FIX 2026-XX-XX: ...`) y ayuda a que la próxima auditoría no repita el trabajo de entender el porqué de una decisión.
5. Verifica cada cambio contra el comportamiento REAL del monolito (ábrelo, pruébalo, lee el código exacto) antes de darlo por "igualado" — no asumas por el nombre de una función que hace lo mismo que su equivalente.

---

## FASE 0 — Congelar el riesgo de romper producción (hacer esto primero, antes que cualquier otra cosa)

### 0.1 — Confirmar qué worker corre realmente en producción hoy

Antes de tocar nada, verifica con una petición real cuál contrato de `/store/chunked` responde el worker en `https://siso-api.dr-juliancucalon.workers.dev` ahora mismo. Si el monolito lo despliega vía `git push` (su flujo normal, confirmado), lo más probable es que el worker en vivo sea el del monolito (con el contrato atómico `{key,value}`) y los dos `index.js` de esta carpeta (`siso-worker/` y `siso-worker-deploy/`, que son idénticos entre sí) sean código desactualizado que nadie ha desplegado — pero **confírmalo, no lo asumas**.

### 0.2 — Actualizar el contrato de `POST /store/chunked` en ambos `index.js` del refactor

El `d1Client.js` de este proyecto YA llama primero al contrato nuevo `{key, value}` (atómico, servidor trocea). Los `index.js` de `siso-worker/` y `siso-worker-deploy/` todavía esperan el contrato viejo `{baseKey, pieces[], meta}`. Porta **tal cual, sin modificar la lógica**, el bloque completo del monolito (`C:\Users\JQK3\ocupasaludparadesplegar\siso-worker\index.js`, la ruta `POST /store/chunked`, ~líneas 300-347 y toda la función `_mergeProtegido`/`_mergePeriodosObjeto` que invoca antes de trocear). Esto incluye:
- Recibir `{key, value}`.
- Llamar a `_mergeProtegido(env, key, value)` ANTES de trocear (la brecha #5 de la matriz: hoy el refactor no fusiona por id en esta ruta, solo compara tamaño total).
- Calcular hash (`_hash64`, mismo algoritmo del cliente).
- Trocear en piezas de 500KB, escribir piezas + `__meta` + borrar la clave base + borrar piezas sobrantes, todo en un solo `env.DB.batch` transaccional.

**Criterio de aceptación**: escribe un paciente de prueba >600KB desde el refactor, verifica que se trocea correctamente, y simula una escritura "vieja" (subset de ids) para confirmar que `_mergeProtegido` preserva los ids faltantes — igual que ya se verificó hoy en el monolito para `siso_companies` y `siso_portal_empresa_docs`.

### 0.3 — Corregir el bug de esquema en `siso_portal_empresa_docs_<nit>`

En `src/pages/HistoriaPage.jsx`, líneas ~465-469, **elimina** la llamada:
```js
await d1WriteArrayMerge(`siso_portal_empresa_docs_${nitClean}`, [periodoDoc], 'periodo');
```
Reemplázala por: leer el objeto existente completo (`d1Get`), fusionar `periodoDoc` dentro de `existente.periodos` por el campo `periodo` (mismo criterio que `_mergePeriodosObjeto` del worker: si el periodo ya existe, preservar `informe`/`cuenta`/`custodia`/`certificados` que `periodoDoc` traiga en null pero el existente ya tenía; si no existe, agregarlo), y escribir de vuelta el **objeto completo** `{nit, nombre, codigoAcceso, periodos: [...]}` con `d1Set` (no con `d1WriteArrayMerge`, que asume arrays).

Después de corregir este punto, **audita todos los demás botones/flujos del refactor que escriban `siso_portal_empresa_docs`** (equivalentes a "Publicar en portal", "Enviar TODO a Empresa", "Marcar como pagada", "Activar todas" del monolito — busca en `CompaniesPage.jsx`, `CompaniesSection.jsx`, cualquier hook `useCompanyDocuments`) para confirmar que todos usan el mismo esquema objeto+periodos correcto. La matriz de paridad solo verificó `HistoriaPage.jsx`; puede haber más puntos con el mismo bug.

**Criterio de aceptación**: cierra una HC de prueba dos veces seguidas para la misma empresa/periodo, y confirma que el objeto en D1 conserva el `codigoAcceso` y cualquier informe/custodia/cuenta previamente publicado — no debe quedar reducido a un array de un solo elemento.

### 0.4 — Seguridad de credenciales

- El archivo `.git/config` de este repo tiene (o tuvo) un token de GitHub en texto plano en la URL del remoto. Verifica y, si sigue ahí, díselo al usuario para que lo revoque en GitHub — no lo revoques tú mismo sin confirmar con él primero.
- Las 8 contraseñas en texto plano de `SEED_USERS` en `LoginPage.jsx` deben tratarse como el problema de seguridad #1 del proyecto — ver FASE 1.

---

## FASE 1 — Autenticación (la brecha de seguridad más seria)

**Objetivo**: una sola implementación de login, coherente, sin contraseñas en texto plano en el código, con 2FA real.

1. Decide y documenta explícitamente cuál es el camino "oficial" de aquí en adelante: recomendamos consolidar en `authStore.login()`, pero corrigiéndolo para que:
   - Soporte verificación PBKDF2+salt (`passSalt`), no solo SHA-256 simple — copia el patrón `_verifyPassword` del monolito (`App.jsx` línea 2454, compatible con hashes legacy sin salt) o el `_verifyHash` que ya existe en `LoginPage.jsx`.
   - Implemente `verifyTOTP` de verdad: RFC 6238, HMAC-SHA1 vía Web Crypto, ventana de tolerancia ±1 paso de 30s — copia `_totpVerify` del monolito (`App.jsx` línea 13483). El placeholder actual que acepta cualquier código de 6 dígitos debe eliminarse por completo.
2. Elimina `LoginPage.jsx`'s `SEED_USERS` en texto plano y su llamada a `loginLocal` sin verificación. Si necesitas usuarios de emergencia/semilla (el monolito los tiene, `initialUsers` en `App.jsx` línea 9332), deben ser el **último** fallback tras verificar hash real, no la primera vía, y con hashes ya calculados (no contraseñas en texto plano en el código ni en comentarios).
3. Fallback a Supabase si el usuario no está en D1 (patrón del monolito, `handleLogin` línea 22770): permitido, pero SIEMPRE verificando el hash de la contraseña contra lo que traiga Supabase, nunca asumiendo autenticado.
4. Elimina `src/modules/auth/hooks/useAuth.js` (hook huérfano, ningún import activo) — o si decides que es la base de la consolidación, entonces elimina `authStore.js` y `LoginPage.jsx`'s lógica propia en su lugar. No dejes las tres implementaciones coexistiendo.
5. Rate limiting: el monolito bloquea tras 5 intentos fallidos por 15 minutos (`_rl`, `App.jsx` línea 119) — confirma que la implementación final del refactor lo tenga con los mismos parámetros.

**Criterio de aceptación**: crea un usuario nuevo vía `UserForm.jsx`, cierra sesión, inicia sesión con ese usuario por el camino oficial único — debe funcionar sin pasos manuales. Activa 2FA para un usuario y confirma que un código incorrecto de 6 dígitos es rechazado.

---

## FASE 2 — Portales públicos: enrutamiento y consolidación

1. Mueve las rutas `portal-empresa` y `portal-certificados/:companyId` **fuera** de `ProtectedRoute` en `App.jsx` — deben ser accesibles sin sesión interna de SISO, ya que ambas páginas implementan su propio login NIT+código pensado exactamente para eso.
2. Decide cuál de `PortalEmpresaPage.jsx` (622 líneas) o `PortalCertificadosEmpresa.jsx` (715 líneas) es la versión canónica — son funcionalmente duplicadas (ambas leen las mismas claves D1, generan los mismos documentos). Recomendamos conservar la que tenga la implementación más completa/reciente y eliminar la otra, migrando cualquier funcionalidad única de la descartada antes de borrarla. Documenta la decisión.
3. Elimina `src/components/modals/PortalPublicoTrabajador.jsx` (555 líneas, arquitectura Supabase pre-D1, sin ningún import activo confirmado) — o si prefieres conservarlo como referencia histórica, muévelo fuera de `src/` para que quede claro que no es código activo.
4. Elimina `modules/clinical/services/printService.js` (archivo vacío, contenido literal `"1"`) y su test asociado si también está roto/obsoleto.
5. Conecta `_readSmart` (ya escrita en `d1Client.js`, líneas 492-513) a los puntos reales de lectura de `siso_portal_empresa_docs_<nit>` (`PortalEmpresaPage.jsx` línea 141, y cualquier otro punto de lectura que encuentres en `CompaniesSection.jsx`/`EpidemiologicalReport.jsx`), en vez de `d1Get` directo. Agrégale el catch-up a D1 que hoy le falta: si Supabase gana la comparación de timestamp, escribe de vuelta a D1 (`d1Set`) antes de retornar — copia el patrón exacto de `App.jsx` líneas 804 y 813 del monolito. También corrige `_tsOf` para que revise `v.updatedAt`/`v.updated_at` además de `v._updatedAt`, y use el `updated_at` real de la fila de Supabase como fallback (no solo lo embebido en el valor).

**Criterio de aceptación**: abre el portal de empresa desde una ventana de incógnito (sin sesión interna) y confirma que el login NIT+código funciona de punta a punta sin ningún acceso previo al sistema.

---

## FASE 3 — Formulario de captura CONDUCCIÓN DE VEHÍCULOS

El único punto donde el protocolo viejo del proyecto tenía razón. Agrega a `src/modules/clinical/components/OccupationalHC.jsx` (1432 líneas) una sección condicional (visible solo si `enfasisExamen === "CONDUCCION"`, igual patrón que las otras 5 secciones de énfasis que ya existen ahí) con los campos exactos que ya consumen impresión/certificado/IA (verifica el shape exacto en `src/lib/printService.js` línea 396 y en `CertificateView.jsx`):

- Agudeza visual lejana y cercana.
- Campimetría.
- Discriminación de colores.
- Visión de profundidad.
- Audiometría.
- Antecedentes neurológicos (epilepsia/síncope/apnea).
- Consumo de alcohol/psicoactivos/sedantes.
- Evaluación Psicomotriz — 5 pruebas (resistencia a la monotonía, reacción múltiple, anticipación de velocidad, coordinación bimanual, reacción al frenado), cada una con radio Bajo/Medio/Alto + detalle libre.
- Valoración Psicológica General.
- Observaciones/Restricciones finales.

Consulta el detalle completo de esta sección en `INVENTARIO_COMPLETO_MONOLITO_2026-07-21.md`, sección 6 (Historia Clínica Ocupacional), bloque "CONDUCCION DE VEHICULOS".

**Criterio de aceptación**: diligencia una HC completa con énfasis CONDUCCIÓN desde el formulario (sin usar la IA para rellenar los campos), ciérrala, y confirma que el certificado y la impresión muestran exactamente los datos que ingresaste manualmente.

---

## FASE 4 — SGSST y Telemedicina: conectar a D1

Ambos módulos hoy viven 100% en `localStorage`. Migra su persistencia al mismo patrón que usa el resto del sistema (pacientes, empresas, HC, encuestas, facturación):

1. **SGSST** (`sgsstService.js`, 9 colecciones): reemplaza el CRUD genérico que solo toca `localStorage` por uno que use `d1WriteArrayMerge` (merge por id) para cada colección, con clave D1 por usuario/empresa (sigue el patrón `siso_sgsst_<coleccion>_<userId>` o similar, coherente con el resto de prefijos del proyecto). No necesitas tocar los 8 componentes de UI (`RiskMatrix.jsx`, `AccidentInvestigation.jsx`, etc.) si ya usan el service como capa de abstracción — solo el service.
2. **Telemedicina** (`VideoConsult.jsx`): migra el estado de consultas/cola de espera a D1 con el mismo patrón. La integración con Jitsi (link público) puede quedar igual — el gap es solo de persistencia, no de la funcionalidad de video en sí.

**Criterio de aceptación**: crea un registro en cada módulo (ej. un riesgo en la matriz GTC-45, una teleconsulta), cierra sesión, abre en un navegador distinto (o borra localStorage) y confirma que el dato persiste vía D1.

---

## FASE 5 — Correcciones menores de la capa de datos (worker)

Todas estas son portes directos y acotados desde `C:\Users\JQK3\ocupasaludparadesplegar\siso-worker\index.js` — cópialas tal cual, sin reinterpretar la lógica:

1. Agrega `decompressValue` en `GET /store/:key`, `GET /store/prefix`, `GET /store` y en `runDailySnapshot` — por si quedan valores `gz:` legacy en el D1 compartido.
2. `GET /store/prefix`: agrega la exclusión de piezas de chunk (`NOT GLOB '*__c[0-9]*' AND NOT LIKE '%__new%' AND NOT GLOB '*_chunk_[0-9]*_of_[0-9]*'`) y el modo `_raw` sin `JSON.parse` server-side — evita reproducir el 503 por CPU timeout que el monolito ya resolvió.
3. `GET /health`: modo ping barato por defecto (`SELECT 1`), los 5 `COUNT(*)` solo con `?full=1`.
4. `GET /storage-stats`: reemplaza la estimación `filas*2048` por el cálculo real `SUM(LENGTH(value))`.
5. `runDailySnapshot`: reordena para rotar snapshots viejos ANTES de escribir el nuevo (no después), y agrega el paso de GC de chunks temporales `__new*` abandonados con más de 1 hora.
6. Decide conscientemente sobre CANDADO 3 (`X-Siso-UserId`): hoy está inerte porque ningún cliente manda ese header. O lo conectas de verdad (haz que `d1Client.js` mande `X-Siso-App`/`X-Siso-UserId` en cada request) o lo retiras para no dejar código muerto que confunda a futuro.

**Criterio de aceptación**: corre el mismo tipo de prueba funcional que se usó hoy para verificar el monolito — simula una escritura vieja/parcial y confirma que el candado correspondiente la corrige, no que falla silenciosamente.

---

## FASE 6 — Verificación de las áreas aún no auditadas (Sección C de la matriz de paridad)

Antes de declarar el proyecto en paridad total, verifica código-contra-código estas áreas del monolito que la auditoría de hoy **no llegó a comparar en detalle** contra el refactor (todas están completamente documentadas en `INVENTARIO_COMPLETO_MONOLITO_2026-07-21.md`, así que tienes la referencia exacta):

- Navbar (todos los botones/badges contextuales por vista y rol).
- Dashboard (8 tarjetas de estadísticas, panel de alertas, tabla de productividad, registros recientes — incluida la regla de que "Contabilidad V2" está restringida por username literal `drcucalon`, no por rol; decide si el refactor debe replicar esa restricción exacta o generalizarla a un rol).
- Agenda y Sala de Espera/Asistencia — el monolito usa reemplazo total (no merge) para `siso_agendados`, sin protección anti-vacío; decide si el refactor debe corregir esto (recomendado) o replicarlo tal cual por consistencia de comportamiento.
- SVE, ARL, Habeas Data — revisa las asimetrías de persistencia documentadas en la matriz (ARL nunca escribe a D1 pero sí se lee de D1 al login; Habeas Data nunca toca D1 en absoluto).
- Verificación de Certificados, Gestión de Pacientes (filtros, deduplicación, badge de vencimiento).
- Planes/Precios, Propuestas Comerciales (confirma que el refactor no repite el bug histórico de reemplazo total que el monolito ya documentó y corrigió).
- Perfil IPS, Caja, Contabilidad, Portafolio, Cotizaciones (Portafolio en el monolito es 100% local sin nube — decide si el refactor debe igualar esa limitación o mejorarla conscientemente).
- Super Admin, Modal de Evolución, Overlay de Mensajería.
- Router: confirma que las rutas de react-router del refactor cubren el mismo conjunto de 27 vistas que el router `if/else` del monolito, sin huecos.
- El diagnóstico fijo `Z10.0` hardcodeado en el certificado del monolito, y el posible `ReferenceError` en las funciones de facturación por trabajador definidas a nivel de módulo (`_getBillTrabajadores` y relacionadas) — verifica en el monolito real (no solo leyendo el código) si esa función efectivamente funciona en producción, antes de decidir si el refactor debe replicar el comportamiento o corregirlo.

Para cada ítem de esta fase: documenta el hallazgo (a la par / brecha / decisión consciente de divergir) en una actualización de la matriz de paridad, con el mismo nivel de detalle (archivo, línea, criterio de aceptación) que las fases anteriores.

---

## Cómo reportar avance

Actualiza (o crea de nuevo, reemplazando las versiones viejas confirmadas desactualizadas) un único documento de seguimiento con: ítem, archivo(s), estado (✅/⚠️/❌), y — a diferencia del protocolo viejo — **con evidencia verificable** (un comando que se pueda correr, una captura, o un test) de que el estado marcado es real. No marques nada "✅ Completado" solo porque se escribió código; márcalo completado cuando pasó su criterio de aceptación específico.
