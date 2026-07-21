# Inventario funcional exhaustivo — SISO OcupaSalud (monolito)

> Documento de referencia para auditoria de paridad frente a un refactor paralelo.
> Fuente: `App.jsx` (61,556 lineas) y `siso-worker/index.js` (671 lineas), ambos en
> `C:\Users\JQK3\ocupasaludparadesplegar\`.
> Generado leyendo el archivo completo por secciones sistematicas (offset/limit),
> con 18 pasadas de lectura cubriendo el 100% de las lineas del monolito.

---

## Indice

0. Backend - Cloudflare Worker (siso-worker/index.js)
1. Arquitectura de sincronizacion, estado y helpers D1 (lineas 1-7000)
2. Modulos de dominio, catalogos, componentes reutilizables (lineas 7000-14000)
3. Logica de negocio: portal, encuestas, publicacion (lineas 14000-20000)
4. Logica de negocio: auto-refresh, boot, IA, cierre de HC (lineas 20000-26060)
5. Navbar, Login (2FA/recuperacion), Dashboard (lineas 26060-28381)
6. Historia Clinica Ocupacional (lineas 28381-30840)
7. Historia Clinica General + Certificado de Aptitud (lineas 30840-32658)
8. Reportes Epidemiologicos + Gestion de Pacientes (lineas 32658-35272)
9. Gestion de Empresas / Portal de acceso (lineas 35272-37846)
10. Verificacion de Certificados + Cuentas de Cobro (lineas 37846-39308)
11. Portal Trabajador, SVE, ARL, Habeas Data (lineas 39308-41243)
12. Telemedicina, Adjuntos, Usuarios y Permisos (lineas 41243-45189)
13. Planes, Propuestas Comerciales, Solicitud de Examenes (lineas 45189-47884)
14. Incapacidad General, Agenda, Sala de Espera/Asistencia (lineas 47884-50132)
15. Portafolio, Cotizaciones, Contabilidad (lineas 50132-52151)
16. Perfil IPS, Caja (lineas 52151-54626)
17. Super Admin + Portal Empresa (lineas 54626-56373)
18. Modal Evolucion, Overlay Mensajes, Carta de Custodia, Router principal, cierre de archivo (lineas 56373-61556)

---

## 0. Backend - Cloudflare Worker (siso-worker/index.js)

Este worker es el backend HTTP que habla directamente con Cloudflare D1 (tabla `siso_store`,
esquema clave-valor: key, value, updated_at). Reemplazo a Supabase (siso_store) como
almacenamiento en la nube; Supabase se mantiene como fallback/lectura en algunos flujos del
cliente (_readSmart). Es compartido entre el monolito (ocupasaludparadesplegar) y el
refactor en desarrollo (siso-appultimo / siso-api-dev).

### CORS y autenticacion
- Origenes permitidos explicitos: ocupasaludparadesplegar.pages.dev,
  ocupasaludparadesplegar-f4q.pages.dev (dominio ESTABLE de pruebas),
  siso-appultimo-arp.pages.dev (refactor), localhost:5173, localhost:4173.
  Tambien acepta cualquier subdominio *.ocupasaludparadesplegar(-f4q).pages.dev y
  *.siso-appultimo-arp.pages.dev (previews de Cloudflare Pages).
- Toda request (excepto OPTIONS) requiere header X-Siso-Token igual a env.SISO_TOKEN; si no, 401.

### Compresion gzip - DESACTIVADA
compressValue() es un no-op (guarda JSON plano). decompressValue() sigue activo para leer
valores legacy con prefijo "gz:". Se desactivo por un bug de produccion: valores gz: no se
descomprimian bien en el edge, JSON.parse fallaba, causando 500s.

### Claves protegidas - fusion por id, nunca reemplazo total (_PROTECTED regex)
Patron: siso_(db_)?patients_ | siso_atenciones | siso_hc_ | siso_encuestas | siso_companies |
siso_cartas_custodia | siso_saved_reports | siso_informes | siso_users |
siso_portal_empresa_docs | siso_portal_empresa_atenciones

Para estas claves, el SERVIDOR (no solo el cliente) fusiona por id (o por token si no hay id):
lo entrante gana por-id, pero los registros existentes que el payload entrante no trae se
preservan (_mergeProtegido). Candado anti-encogimiento server-side: ninguna sesion con estado
viejo puede borrar registros nuevos de otra sesion, incluso si reemplaza el array completo.
Caso especial: siso_portal_empresa_docs_<nit> es un OBJETO (no array) con forma
{nit, nombre, codigoAcceso, periodos:[{periodo, informe, cuenta, custodia, certificados}]} -
se fusiona por periodo dentro de periodos (_mergePeriodosObjeto), preservando informe/cuenta/
custodia/certificados que el entrante traiga en null pero el viejo si tenia.

### Endpoints HTTP
- GET /store/:key - devuelve [{key, value, ts}] (o [] si no existe). Header ETag/X-Siso-Ts con
  updated_at para soporte de If-Match optimista. Soporta ?raw=1 para saltar el JSON.parse
  server-side (evita 503 por CPU timeout en el free tier con valores grandes).
- GET /store/prefix/:prefix - busqueda por prefijo, excluye piezas de chunks (__cN, __new*,
  _chunk_N_of_M). Devuelve siempre _raw:true. Limite 2000 filas.
- GET /store - lista todas las claves (o filtradas por ?userId=). _raw:true, limite 2000.
- POST /store - upsert de una o varias {key, value}. Soporta escritura optimista con header
  If-Match/X-Siso-If-Match: si el ts actual no coincide, responde 409 etag_mismatch. Solo
  aplica si se envia UNA clave. Corre _mergeProtegido antes de guardar. Batching de 50 filas.
- POST /store/chunked - escritura chunked ATOMICA (agregada 2026-07-11, via primaria actual
  segun el commit 34d26b9). Aplica _mergeProtegido, calcula hash (h1/h2, mismo algoritmo
  _hash64 del cliente), trocea en piezas de 500KB, escribe piezas + __meta + borra la clave
  base + borra piezas sobrantes, TODO en un solo env.DB.batch (transaccional). Resuelve el
  problema de troceo-cliente no atomico (dos pestanas/apps escribiendo a la vez entrelazaban
  piezas, causando "hash mismatch"/corrupcion).
- POST /store/append - agrega/actualiza UN item dentro de un array, fusion en el servidor por
  idField (default "id"): reemplaza si ya existe, agrega si no; nunca borra.
- GET /health - healthcheck. Por defecto barato (SELECT 1). Con ?full=1 corre 5 COUNT(*).
- DELETE /store/:key - borra una clave.
- POST /snapshot - dispara manualmente runDailySnapshot.
- POST /cleanup - limpieza de emergencia: rota snapshots >7 dias, borra chunks temporales
  huerfanos __new*, borra autosaves de sesion (siso_autosave_cloud_*) de mas de 48h.
- GET /snapshot/list - lista snapshots disponibles.
- GET /storage-stats - monitoreo de uso de D1: filas, bytes, % de uso sobre limite de 500MB,
  alertas en 70%/90%, top 25 grupos de claves por tamano.

### Cron / snapshot diario (runDailySnapshot)
Corre automatico via scheduled() (cron en wrangler.json). Pasos: 1) rota snapshots >7 dias
PRIMERO; 2) limpia chunks temporales __new<ts>__c*/__meta con mas de 1h; 3) lee TODAS las
claves operacionales (excluye siso_snapshot_% y siso_legacy_%); 4) reconstruye en memoria las
claves chunked; 5) serializa todo el estado y lo trocea en piezas de 500KB; 6) escribe
siso_snapshot_YYYY-MM-DD__c0..cN + __meta + __manifest en batches de 50.

**Lineas en siso-worker/index.js:** CORS/auth 1-36; compresion 38-65; fusion protegida 67-150;
handler fetch y endpoints 152-515; cron 517-526; runDailySnapshot 528-671.

---

## 1. Arquitectura de sincronizacion, estado y helpers D1 (lineas 1-7000)

Nota metodologica: el componente principal AppInner() (con los useState de datos centrales:
pacientes, empresas, usuario actual, etc.) empieza en la linea 18060, fuera de este rango.
Todo lo que hay entre las lineas 1 y 7000 es codigo de nivel modulo (fuera de cualquier
componente React): constantes, catalogos estaticos y, sobre todo, el "plumbing" de
sincronizacion D1/Supabase.

### Funciones helper de sincronizacion D1 - bajo nivel (acceso directo al Worker)

- _workerFetch(url, opts, retries=3) (linea 334): wrapper de fetch con limitador de
  concurrencia (max 5 peticiones simultaneas) y reintento con backoff exponencial
  (200/400/800ms) para errores transitorios. Los 4xx que no sean 429 no se reintentan.
- _workerSetRaw(key, value) (linea 351): POST a WORKER_URL/store. Escribe una sola clave
  sin chunking. No hace merge (sobrescribe). Retorna true o false.
- _workerGetRaw(key) (linea 360): GET a WORKER_URL/store/key. Devuelve value o null.
- _workerGetChunkPiece(key) (linea 374): igual que _workerGetRaw pero con raw=1 (evita
  timeouts de CPU en free tier); parse se hace en cliente.
- _workerDeleteRaw(key) (linea 387): DELETE a WORKER_URL/store/key.

### Auto-chunking transparente

Constantes: _CHUNK_THRESHOLD = 600KB (397), _CHUNK_SIZE = 500KB (398), _CHUNK_SUF_META =
"__meta" (399), _CHUNK_SUF_PIECE = "__c" (400). _hash64(s) (404): hash deterministico no
criptografico usado como detector de corrupcion.

- _workerSet(key, value) (linea 419), firma async boolean. Logica:
  1. Path directo (serializado menor a 600KB): _workerSetRaw + verify-after-write (relee y
     compara hash con _hash64; si no coincide retorna false).
  2. Path chunked (mayor a 600KB): intenta primero POST /store/chunked (endpoint atomico del
     servidor, timeout 180s) - via PRIMARIA desde el fix 2026-07-11.
  3. Si /store/chunked no esta disponible: fallback de troceo en cliente. Para claves
     protegidas (_PROTECTED_KEY, linea 486) el fallback se RECHAZA explicitamente (retorna
     false, reintenta despues) porque el troceo cliente no tiene el candado atomico del
     servidor. Para claves no protegidas: escribe piezas temporales, verifica reconstruccion
     con hash, promociona, y solo entonces borra la clave directa antigua.
- _workerGet(key) (linea 564), firma async any o null. Lee _workerGetRaw primero. Detecta y
  migra automaticamente el formato de chunking del refactor paralelo. Si no hay valor directo,
  busca key__meta; si es chunked, lee piezas en paralelo (concurrencia limitada a 2), concatena
  y valida meta.hash antes de parsear. Si el hash no coincide, descarta la reconstruccion en
  vez de devolver datos posiblemente corruptos.
- _workerGetAll(userId) (linea 819): GET /store con userId. Trae todas las filas del usuario,
  reconstruye automaticamente cualquier clave chunked completa.

### Cola de pendientes / resiliencia

- _enqueuePendingD1(key, value) (linea 651): persiste en localStorage bajo
  siso_pending_d1_writes cuando _workerSet falla. Tope por entrada: 5MB (linea 645; antes
  60KB, insuficiente). Si excede 5MB, guarda solo una referencia ligera que se resuelve al
  reintentar.
- _getPendingD1() (686), _clearPendingD1(key) (753). Un useEffect en AppInner procesa la
  cola cada 30s.
- _markUnsyncedHC(failed, source) (705) y _hasUnsyncedHC() (717): mantienen un mapa
  fuente-timestamp en siso_hc_sin_respaldo para alimentar el badge "HCs sin respaldo en
  nube" del header.

### Lecturas comparativas D1 vs Supabase

- _d1GetMany(keys) (729): lectura masiva desde D1 para restaurar el login.
- _mergeCloudLocalById(cloudVal, localRaw) (744): merge por id, la nube gana en los ids que
  trae, pero preserva items locales que la nube no conoce.
- _readSmart(key, options) (777): lee D1 y Supabase en paralelo, compara updatedAt/ts y
  devuelve el mas reciente. Si solo responde Supabase, hace catch-up escribiendo a D1. D1
  gana en empates. Reservada para claves criticas (portal, informes, cartas, contabilidad).

### Capa Supabase (backup) y wrapper unificado

- _securePost(key, value) (973): orden 1 Worker D1, 2 proxy si configurado, 3 Supabase
  directo.
- _sbSet(key, value) (1309, con rate-limit: max 120 req/min).
- _sbBulkSet(rows) (1314): upsert masivo, Worker D1 en chunks de 50 primero, fallback
  Supabase en chunks de 200.
- _sbGetAll(userId) (1353): intenta _workerGetAll primero, fallback Supabase.
- _sbGetMany(keys) (1426): lecturas paralelas por clave, D1 primero.
- _sbDelete(key) (1569): borra de D1 y Supabase (cumplimiento Habeas Data, Ley 1581/2012).
- _sbQueue (1590): cola de reintentos de escritura fallida a Supabase.

### Slim/strip para Supabase (egress guard)

- _stripBase64Deep(val) (1468): elimina recursivamente strings base64 mayores a 8000 chars
  antes de Supabase.
- _slimPatient(p) (1485): quita campos raw pesados (audio/vision/espirometria, adjuntos
  binarios) antes de subir a Supabase (los datos completos quedan solo en localStorage/D1).
- _saveRawStudies(patient) (1504): guarda campos raw en D1 bajo clave dedicada por paciente
  (retencion 20 anos, Res. 2346/2007 Art.8). No va a Supabase.
- _sbSetSafe(key, value) (1525): como _sbSet pero aplica _stripBase64Deep; excluye
  siso_doctor_signature por completo; si la clave empieza con prefijo de pacientes, primero
  llama _saveRawStudies.

### _sync - el punto de entrada principal usado en toda la app

_sync(key, jsonValue) (1754), fire-and-forget:
1. Escribe a localStorage; si QuotaExceededError, purga claves obsoletas y reintenta.
2. Guardia anti-borrado (_EMPTY_GUARD, linea 1806): si el valor es un array vacio y la
   clave es siso_saved_reports, siso_cartas_custodia, siso_atenciones_cerradas o siso_users,
   BLOQUEA la escritura a D1 (previene que una sesion con estado vacio pise la nube;
   incidente real el 2026-07-09).
3. Si _shouldSyncToD1(key) y no bloqueado, escribe a D1 via _workerSet (fire-and-forget).
4. Si matchea claves/prefijos de Supabase, tambien escribe a Supabase; si falla, encola.

_shouldSyncToD1(key) (1750): true si la clave esta en la lista exacta (siso_users,
siso_atenciones_cerradas, siso_saved_reports, siso_cartas_custodia, siso_audit_log,
siso_doctor_signature) o empieza con algun prefijo D1 (siso_db_patients_, siso_patients_,
siso_companies_, siso_atenciones_, siso_informes_, siso_caja_, siso_saved_bills_,
siso_encuestas, siso_cartas_custodia, siso_audit_log).

_patKey/_patKeyCloud/_compKey/_compKeyCloud(userId) (1834-1837): generan claves con
aislamiento por usuario.

### Portal del trabajador (republicacion masiva)

_rePublicarPortalTodos(patients, activeDoctorData, activeSignature) (2110): recolecta
pacientes de TODOS los medicos, filtra HC cerradas, valida contenido real (firma mayor a
100 chars mas medico) antes de republicar (fix anti-degradado), construye filas para las
claves de portal por cedula y por codigo, consolida NITs que difieren solo en digito de
verificacion, upsert masivo via _sbBulkSet. Tambien reconstruye las claves de portal por
empresa (indice y documentos por periodo).

### Variables de estado (useState) en este rango

No hay useState de datos de negocio en 1-7000 (viven en AppInner, linea 18060). Unico
hallado: linea 6294, "expandido"/"setExpandido" en RestriccionesChecklistPanel
(subcomponente UI, controla acordeon de categorias, valor inicial objeto vacio).

### Claves D1 encontradas (lineas 1-7000)

siso_db_patients y siso_db_patients_userId, siso_patients_userId, siso_companies y
siso_companies_userId y siso_companies_shared, siso_users (protegida contra vacio),
siso_saved_bills y siso_saved_bills_userId, siso_saved_reports (protegida contra vacio),
siso_audit_log, siso_mensajes, siso_agendados, siso_ai_config_provider,
siso_doctor_signature (excluida de Supabase), siso_privacidad_aceptada,
siso_atenciones_cerradas (protegida contra vacio), siso_arl_reportes,
siso_atenciones_ (prefijo), siso_informes y siso_informes_ (prefijo), siso_caja_ (prefijo),
siso_encuestas, siso_cotizaciones, siso_cartas_custodia (protegida contra vacio),
siso_habeas_ (prefijo), siso_adj_ (prefijo), siso_portal_ (prefijo generico) y variantes por
documento y por codigo, siso_portal_empresa_nit, siso_portal_empresa_docs_nit,
siso_hc_completa_cedula y siso_hc_completa_codigo_codigo, siso_custom_meds,
siso_raw_field_patientId (solo D1), siso_pending_d1_writes, siso_hc_sin_respaldo,
siso_last_sync_ts, siso_worker_token_cache y siso_worker_url_cache, siso_session,
siso_rl_login, siso_snapshot_ y siso_backup_ (prefijos, candidatos a purga por quota).

### Constantes de configuracion importantes

- _WORKER_URL (276): configuracion inyectada, con cache local y fallback hardcodeado al
  worker de Cloudflare.
- _WORKER_TOKEN (285): misma cascada de fallback.
- _SISO_STABLE_HOST (303): dominio estable de pages.dev al que se redirige cuando se
  detecta un preview inmutable de Cloudflare Pages.
- _SB_URL (879) y _SB_KEY (881): proyecto y publishable key de Supabase.
- _CLOUDINARY_CLOUD/_PRESET/_ENABLED (891-893): almacenamiento de adjuntos, prioridad
  sobre Supabase Storage.
- PLAN_CONFIG (1030-1168): unica fuente de verdad de planes (libre, starter, pro, clinica)
  con limites (maxHC, maxEmpresas, maxPacientes, maxMedicos, storageMB, trialDays).
- ORG_DEFAULT_ID (1175-1183): config multi-tenant del super_admin por defecto.
- SECRETARIA_PERMISOS_DEFAULT (1226) y MEDICO_SIEMPRE_PUEDE (1242): matriz de permisos.
- AI_CONFIG_VERSION / AI_PROVIDERS (6644-6989): config multi-proveedor IA (Gemini, Groq,
  Cerebras, OpenRouter), fallback de modelos, rotacion de multiples keys (solo Gemini).
- Catalogos estaticos grandes: ARL_LIST, AFP_LIST, EPS_LIST, CONTRATO_LIST, TURNO_LIST,
  ETNIA_LIST, SPECIALTIES_LIST (unas 100 especialidades), MEDICAMENTOS_CO_BASE
  (2768-5634, unos 286 medicamentos), DERIVACIONES_CATALOG (5641, 26 especialidades),
  RESTRICCIONES_CATALOG (5814, 10 categorias), RECOMENDACIONES_CATALOG (6464, 4 categorias).

### Autenticacion / Login - infraestructura de soporte en este rango

No hay UI de login aqui (LoginForm/RecuperarAcceso/TOTP estan mas adelante). Si aparece:
- sanitizeInput (79), validatePasswordStrength (92, min 8 chars mas mayuscula, minuscula y
  numero), _auditLog (102, tope 200 entradas), _rl (119, rate limiter: max 5 intentos,
  bloqueo 15 min), _resetSessionTimer (144, timeout de sesion inactiva 30 min).
- _sha256 (2417), _pbkdf2Hash (2428, 100000 iteraciones mas salt de 16 bytes),
  _verifyPassword (2454, compatible con hashes legacy sin salt).
- Supabase Auth REST sin SDK (903-969): _sbAuthSignIn (903), _sbAuthSignUp (923),
  _sbAuthSignOut (941).
- _isAdmin(role) (1197), _isAdminEmpresa(role) (1200), _canUse(feature,user) (1206, valida
  plan y expiracion), _secretariaPuede(feature, currentUser, usersList) (1265).

---

## 2. Modulos de dominio, catalogos y componentes reutilizables (lineas 7000-14000)

Nota: este tramo tiene poca logica de "plumbing" D1 (esa esta antes de linea 2000 y se usa
masivamente despues de linea 18000). Aqui viven generadores normativos (RIPS/FHIR/RDA),
catalogos clinicos con autocomplete, utilidades de dominio, estados iniciales de
paciente/usuario/empresa, componentes UI reutilizables, el modulo de licencias/planes, el
motor de formula medica/derivaciones, y el arranque de login/consentimiento/facturacion.

### Utilidades normativas y de integridad

- parseAIJSON (6995): repara JSON mal formado devuelto por proveedores de IA.
- _generarHashHC(data) (7091): SHA-256 sobre campos clave de la HC (Ley 527/1999), se invoca
  al cerrar una historia clinica para generar evidencia de integridad.
- _generarCodigoQR(id, hash, fecha) (7118): arma el codigo SISO-YYYYMMDD-ID-HASH, codigo de
  verificacion publico del certificado.
- _formatFirmaDigital(firma) (7126): da forma a los datos de firma para mostrarlos truncados.
- Generadores HL7 FHIR R4, Res. 1888/2025 (7149-7290): _generarFHIRPatient,
  _generarFHIRPractitioner, _generarFHIRObservation, _generarFHIRBundle - exportacion para
  interoperabilidad con el IHCE, no persisten nada.
- RIPS JSON, Res. 2275/2023 (7295-7418): validarRIPSPaciente, validarRIPSLote (validan campos
  obligatorios), _generarRIPSJson (arma 3 archivos RIPS: AF/AT/AC), _descargarRIPSJson
  (descarga base64 via enlace, evita createObjectURL por CSP).
- RDA, Res. 1888/2025 (7424-7492): _generarRDA arma el Resumen Digital de Atencion,
  _descargarRDA lo descarga como JSON.

### CIE-11, CUPS, CIE-10 - catalogos y autocomplete

- CIE11_EQUIVALENCIAS (7497): tabla estatica CIE-10 a CIE-11 (Res. 1442/2024).
  _equivalenciaCIE11 (7638) busca coincidencia exacta o por prefijo. CIE11Badge (7646)
  componente visual de referencia.
- CUPS_OCUPACIONAL (7700): catalogo estatico de unos 90 procedimientos. _buscarCUPS (8108)
  filtra normalizando tildes/mayusculas. CUPSInput (8124) componente de autocomplete.
- CIE10_OCUPACIONAL (8272): catalogo amplio de diagnosticos ocupacionales. _buscarCIE10
  (8675) y CIE10Input (8689) buscador/autocomplete usado en diagnostico principal y
  secundarios de la HC ocupacional y general.

### Utilidades de dominio medico (8822-8989)

- numeroALetras(num) (8822): convierte montos a letras (cuentas de cobro/facturas).
- analyzeBP (8902), analyzeHR (8918), analyzeBMI (8926): clasifican presion arterial,
  frecuencia cardiaca e IMC con color, feedback visual en el examen fisico.
- getSpanishDate(d) (8938): formatea fechas en espanol largo.
- NORMAL_DESCRIPTIONS_SYSTEMS (8961): texto de hallazgo normal por defecto por sistema del
  examen fisico.

### Estados iniciales (8993-9490)

- initialOccupPatientState (8993): plantilla completa de HC ocupacional nueva - folio,
  version, perfil de cargo (Res. 1843/2025 Art.29), incapacidad/ausencia, consentimiento
  informado, riesgos, antecedentes agrupados, examen fisico por sistemas, maniobras
  osteomusculares, examenes especializados (alturas, alimentos, confinados, osteomuscular,
  corazon), paraclinicos, formula medica, derivaciones, adjuntos.
- initialGeneralPatientState (9239): plantilla equivalente para HC de medicina general.
- initialUsers (9332): usuarios semilla de recuperacion de emergencia (drcucalon
  super_admin, dr.garcia medico, admin.ips administrador, secre.maria y secre.ana
  secretaria, empresas admin_empresa) con hashes SHA-256 hardcodeados de contrasenas de
  prueba. Se usan solo si Supabase falla.
- initialCompanyState (9451): plantilla de empresa nueva - convenio (tarifas, condiciones de
  pago, vencimiento), multi-medico/multi-sede, portal cliente, perfil IPS (logo, lema).

### Componentes UI y validacion reutilizables (9494-9990)

- _validarContrasena(pw) (9494): politica de contrasenas (min 10 caracteres, mayuscula,
  minuscula, numero, especial, lista negra de palabras comunes incluyendo siso/cucalon).
- _FortalezaPass (9521): barra visual de fortaleza.
- SecurityHeaders (9563): meta-tags CSP/X-Content-Type-Options/X-Frame-Options -
  CSP permite unsafe-inline/unsafe-eval y restringe connect-src a supabase, gemini, groq,
  cerebras, openrouter y anthropic.
- PrintStyles (9571): hoja de estilos de impresion extensa (mas de 120 reglas), compartida
  por todos los modulos de impresion.
- DoctorSignature/DoctorSignatureMemo (9705/9752), BrandLogo (9754): bloques de firma y
  membrete reutilizados en certificados, formulas, derivaciones, cartas.
- InputGroup, SelectGroup, TextAreaGroup, SectionTitle (9791-9909): campos de formulario
  estandar usados en toda la HC.

### PlanGate (9916)

Control de acceso por plan de suscripcion. Si _canUse(feature, currentUser) es falso, muestra
fallback: si el plan esta vencido, pantalla de renovacion con contacto del medico; si no,
candado con el plan requerido y boton a planes. Envuelve features premium (IA, SVE,
telemedicina, etc.) en toda la app.

### LicenciasTab (9998-10800) - gestion de planes y licencias

- Guard de rol (10009): solo currentUser.role igual a administrador puede usarla.
- Auto-apertura (10040): al venir de "Activar para usuario" en renderPlanes, abre
  automaticamente el editor del primer usuario no-admin.
- saveLic(u) (10079), funcion de negocio central con validacion estricta segun metodo de
  pago: plan de pago con manual/referido exige monto obligatorio y minimo 50 por ciento del
  precio de lista; tipo cortesia exige nota justificativa de al menos 10 caracteres; forma de
  pago Transferencia/Nequi/Daviplata exige monto; todo plan de pago requiere fecha de
  vencimiento; tipo prueba tiene tope de dias segun config del plan (default 15). Al pasar
  validacion, escribe siso_users via _sync mas _sbSetSafe (linea 10153-10154) - unica
  escritura real a D1/Supabase en todo el rango 7000-14000.
- getDaysLeft, getStatusBadge (10171/10176): calculan estado (vencido, vence pronto, limite
  de HC alcanzado) para pintar badges.

### AIConfigPanel (10805)

Panel de configuracion de las 4 API keys de IA gratuitas (Gemini, Groq, Cerebras,
OpenRouter). testProvider (10914) hace una llamada de prueba real y clasifica errores (401
o 403 key invalida, 429 limite alcanzado, CORS/network proveedor bloqueado, 404 modelo no
disponible). Muestra contador de llamadas por proveedor.

### RecomendacionesChecklistPanel (11296) y MedicamentoAutocomplete (11446)

El primero: catalogo de recomendaciones organizado por categoria, seleccion multiple o
generacion IA. El segundo: autocomplete de medicamentos contra base colombiana mas
personalizados; handleAddCustom (11497) permite agregar medicamento no catalogado.

### TabFormulaDerivacion (11591-12660) - formula medica y derivaciones

Componente de pestanas para prescripcion medica, derivaciones e interconsultas dentro de la
HC. addMedicamento/removeMed (11631/11659) sobre data.formulaMedicamentos.
addDerivacion/removeDerivacion (11666/11683) sobre data.derivaciones, con catalogo de
sugerencias filtrado por especialidad/motivo. buildPrintHeader (11699) arma el header HTML
de impresion. openSingleMedWindow (11825) y openPrintWindow (11891) abren ventanas de
impresion editable para receta individual, formula completa, derivacion o solicitud de
examenes. No hay lectura/escritura D1 aqui; el estado vive en data/setData del padre.

### ConsentimientoModal (12669) - consentimiento informado digital, Res. 1843/2025 Art.12

handleConfirmar (12692) valida nombre de al menos 3 caracteres y casilla marcada; produce
evidencia probatoria (nombre, timestamp ISO, version, IP simbolica). Modo solo-lectura si la
HC ya esta cerrada.

### LoginForm (12877) y RecuperarAcceso (12963)

- LoginForm: rate-limiting visual con cuenta regresiva; trunca usuario/contrasena a 64/128
  caracteres (anti-DoS/fuzzing).
- RecuperarAcceso (12963) - HALLAZGO RELEVANTE PARA AUDITORIA: expone un codigo de
  recuperacion hardcodeado, literal "9207". Si el usuario lo ingresa correctamente, la
  funcion intentar() (12969): (1) borra las claves de rate-limit de localStorage; (2)
  recalcula el hash SHA-256 de la contrasena de emergencia y SOBREESCRIBE DIRECTAMENTE en
  localStorage el passHash del usuario drcucalon, sin pasar por _workerSet/D1 ni por _sbSet.
  Es una puerta de recuperacion de emergencia que vive solo en el cliente y no queda
  registrada en D1 en el momento del reseteo. Un refactor podria omitirla o implementarla de
  forma distinta.

### NotificacionModal (13044) - Res. 1552/2013, notificacion de resultado

Genera enlaces de WhatsApp, mailto y SMS con mensaje prellenado (codigo de verificacion,
fecha, empresa, concepto de aptitud). No usa servidor propio ni D1.

### _generarFacturaDIAN_UBL (13238) - facturacion electronica DIAN

Genera el XML UBL 2.1 base (Decreto 358/2020, Res. DIAN 000012/2021) para un documento de
venta de servicios medicos exentos de IVA (Art. 476 E.T.). Plantilla para enviar a un
proveedor autorizado externo (Siigo/Alegra/Facture); no radica directamente ante la DIAN.

### Helpers de facturacion por trabajador - POSIBLE BUG (13346-13439)

_getAllBillAtenciones (13346), _getBillAtencionesFiltradas (13383), _getBillTrabajadores
(13407), _getBillTotalSeleccionado (13428) estan definidos a NIVEL DE MODULO (fuera de
cualquier funcion/componente), pero referencian variables libres (pacsMed, agendaList,
pacientesList, billFilterEmp, billFilterMes, billSelectedWorkers, billWorkerValues,
billModoCobro) que solo existen como useState locales dentro de AppInner, en scopes
totalmente distintos. Estas funciones se invocan luego desde dentro de AppInner (linea
37908 y siguientes). Dado que la definicion de modulo no tiene closure sobre esos useState,
cualquier llamada real deberia lanzar ReferenceError en tiempo de ejecucion. Sugiere codigo
muerto o mal ubicado, posiblemente artefacto de copy-paste de un refactor previo. Vale la
pena verificar en runtime si el flujo de "Cuenta de cobro por trabajador" realmente funciona
en produccion, para no replicar el bug sin decidir conscientemente que hacer.

### 2FA TOTP - RFC 6238 (13449-13527)

_totpBase32ToBytes, _totpGenSecret (13472), _totpVerify (13483, HMAC-SHA1 via Web Crypto con
ventana de tolerancia +/-1 paso de 30s), _totpGetOtpAuthUrl (13516), _totpGetQRCodeUrl (13525,
usa api.qrserver.com externo). Pensado para 2FA de medicos/administradores (Res. 3100/2019).

### _generarPaqueteRetencion (13528) - retencion legal 20 anos, Res. 1995/1999 Art.15

Genera paquete JSON con hash SHA-256 de la HC, metadata de trazabilidad, fecha de
vencimiento legal (ano actual mas 20).

### _generarCertificadoHTMLNormalizado (13572, continua mas alla de linea 14000)

Funcion central de generacion del Certificado de Aptitud Laboral estandarizado (Res.
1843/2025). Resuelve la firma con fallback en cascada para evitar firma rota. Determina
color del bloque de concepto segun el texto (no apto rojo oscuro, condicion/restriccion
ambar, apto verde, default azul). Compone documento HTML completo pensado para una sola hoja
carta. Invocada casi con certeza desde handleCloseHistory/renderCertificado al cerrar/emitir
el certificado.

### Claves D1 en este rango

Solo una escritura real encontrada: siso_users (lineas 10153-10154, tras editar licencia,
via _sync mas _sbSetSafe). Tambien lectura/escritura DIRECTA a localStorage (no D1) de
siso_users dentro de RecuperarAcceso.intentar() (12982, 12989). Las funciones
_workerSet/_writeArrayMergeD1/_persistBillsSafe/_persistReportsSafe/_readSmart estan
definidas antes de linea 2000 y se usan masivamente desde linea 18000 en adelante; este
tramo 7000-14000 es sobre todo catalogos, utilidades y generadores de documentos que operan
sobre datos ya cargados en memoria.

---

## 3. Logica de negocio: portal, encuestas, publicacion (lineas 14000-20000)

### Generadores de documentos del portal/ZIP

- _generarCertificadoDesdePortal(portalData) (14234): mapea el objeto del portal al shape
  del certificado normalizado, para descarga publica.
- _abrirVentanaPDF, _tryFitCanvasOnePage, _htmlToPdfBlobMod (14273-14350): utilidades de
  exportacion PDF via html2canvas mas jsPDF.
- _buildCertificadosEmpresaHTML(pacientes) (14354): concatena certificados de varios
  pacientes para descarga masiva desde el portal empresa.
- _buildCartaCustodiaHTML(c) (14368): HTML completo de la Carta de Custodia.
- _buildCuentaCobroHTMLMod(c) (14414): replica del documento de Cuenta de Cobro.
- _buildInformeHTMLMod(informe, d, empName) (14530): HTML completo del Informe
  Epidemiologico (KPIs, bloques estadisticos, matriz legal, analisis IA).

### EncuestaPublicaForm (14615) - formulario publico de encuesta sociodemografica

Sin login, accedido por token. Lee metadata desde D1 (clave siso_encuesta_TOKEN, fallback
Supabase). handleSubmit (14738): valida campos obligatorios, verifica duplicado por
docNumero, escribe primero via endpoint atomico /store/append (fusion server-side), con
hasta 3 fallbacks. Si NINGUNA fuente de lectura responde antes de escribir, ABORTA sin
escribir (anti-perdida, referencia a un incidente real documentado en el codigo). Verifica
persistencia leyendo de vuelta antes de confirmar exito.

### Portal empresa - pago, examenes, custodia

- _sbPortalSave (15162): intenta _workerSet primero, si falla usa Supabase con merge.
- _portalVerifyPayment (15181): verifica comprobantes de pago con Gemini Vision.
- _analizarExamenIA (15217): analiza examenes paraclinicos subidos como imagen/PDF.
- PortalCustodiaViewer (15317), handleSave (15343): guarda Carta de Custodia en clave global
  siso_cartas_custodia (array), con patron anti-perdida (si falla lectura y la clave existe,
  ABORTA en vez de sobreescribir vacio) y merge por id.
- PortalCuentaCobroCard (15549): muestra Cuenta de Cobro en el portal, permite subir
  comprobante verificado automaticamente.
- CargaMasivaExamenes (15826): modal de carga masiva de examenes con deteccion de paciente
  por cedula (del texto del PDF o del nombre del archivo) y deteccion de tipo de examen.

### PortalInformeViewer (16170) y PortalEmpresaDocsPeriodos (16439)

El primero carga el detalle completo del informe epidemiologico usando la statsKey (sin
fallback Supabase por CORS). El segundo carga y agrupa por periodo TODOS los documentos de
una empresa desde la clave de documentos por NIT - logica critica: prueba el NIT limpio y
todas las variantes con digito verificador 0 a 9 mas el NIT sin el ultimo digito, y FUSIONA
los periodos de todas las variantes (no se detiene en la primera encontrada), evitando que
un documento desaparezca por quedar bajo una variante de NIT distinta.

### PortalPublicoTrabajador (16654) - componente del portal publico real

buscar() (16696): rate limiting (max 6 intentos, bloqueo 5 min). Busqueda por codigo (con
variantes de prefijo/formato), por cedula, o por empresa (NIT) - en este ultimo caso valida
primero el codigo de acceso contra el documento de la empresa (probando variantes de NIT);
si no coincide, BLOQUEA el acceso. Luego busca el indice de documentos de la empresa y las
atenciones agregadas multi-fecha, combinandolos (nunca reemplazando). Solo muestra HC con
estadoHistoria Cerrada. _portalPrint (17074) genera documentos individuales (formula,
derivaciones, examenes, incapacidad) como HTML en ventana nueva.

### Otros modulos en este tramo

- PrivacyModal, AgendaFieldF, ChangePasswordForm (17677-17940): modal de politica de
  privacidad (Ley 1581/2012), campo reutilizable de agenda, formulario de cambio de
  contrasena obligatorio.
- AppErrorBoundary (17955): error boundary de React, loguea a localStorage
  siso_error_log (maximo 50 entradas).
- Cifrado AES-GCM (18011-18050): _getEncryptKey, _encryptData, _decryptData para datos
  sensibles en localStorage, clave persistida en sessionStorage.

### AppInner() (18060) - inicio del componente principal, funciones clave en este tramo

- logAccess(accion, pacienteId, extra, seccion) (18126): registro de auditoria RDA (Res.
  1888/2025) en siso_audit_log, tope aproximado de 1000 registros.
- _publicarAlPortalEmpresa(informe) (18298) - FUNCION CRITICA: publica un informe
  sociodemografico o carta de custodia en el portal empresa. Busca la empresa tolerando
  id/NIT/nombre. Calcula periodo canonico. Lee el documento de la empresa con fallback a NIT
  sin ultimo digito. ANTI-SOBREESCRITURA: si la lectura falla, verifica si la clave existe
  realmente en D1 antes de asumir que puede crear una vacia; si existe, ABORTA. Deduplica
  periodos por label canonico o legado. Escritura D1 bloqueante con verificacion, Supabase
  como backup en background.
- saveInforme(informe) (18471): guarda informe/custodia con merge anti-regresion via
  _writeArrayMergeD1 en dos claves (global y por usuario), localStorage mas IndexedDB,
  Supabase backup, luego llama _publicarAlPortalEmpresa; si tipo es custodia, limpia
  custodias huerfanas (periodos sin atenciones reales de esa empresa).
- enviarCertificadosMasivo(pacientes, empresaEmail, modo) (18688): envio de certificados por
  email (EmailJS si configurado, o mailto). Modo empresa envia un solo correo con lista y
  link al portal; modo individual itera pacientes con email.
- _descargarPaqueteEmpresa() (18807): genera ZIP con certificados individuales, informe,
  cuenta de cobro y carta de custodia, leyendo el periodo emitido desde el portal (union de
  variantes de NIT) como fuente de verdad.
- exportPatientTable (18938): exporta CSV de trabajadores sin datos clinicos sensibles
  (Res. 1843/2025 Art.19).
- Deep-links (19486): hash portaltrabajador o portal activa portal publico; hash encuesta
  con token activa encuesta publica; hash portalempresa con code activa portal empresa con
  auto-busqueda.
- Salud/monitoreo D1 (19552): chequeo periodico de endpoint health cada 5 min, auto-
  recuperacion si lleva mas de 90s en error.
- Cola de reintentos D1 (19600, processQueue): cada 30s reintenta escrituras pendientes;
  purga entradas que excedan el valor maximo; descarta tras el limite de reintentos.
- Purga de autoguardados huerfanos (19646): borra autoguardados locales de mas de 24h.
- Deduplicacion de firma en localStorage (19683): detecta la firma mas repetida en
  pacientes/atenciones/custodias y la elimina de cada registro individual (ahorro de
  espacio).
- Hidratacion desde IndexedDB (19725): si pacientes/atenciones/empresas quedan vacios,
  rehidrata desde IndexedDB como red de seguridad.
- GC de chunks temporales D1 (19752): borra piezas temporales huerfanas con mas de 1 hora.
- Auditoria localStorage vs D1 (19798): detecta HC cerradas locales ausentes en D1 y las
  sube; solo loguea (sin auto-merge) las que estan en D1 pero no localmente.
- Polling de permisos de secretaria (19883): cada 5 min recarga permisos para aplicar
  cambios del admin en tiempo real.

### Claves D1 encontradas en este rango (14000-20000)

siso_encuesta_TOKEN (lectura, metadata), siso_encuesta_resp_TOKEN (lectura y escritura via
store/append e escritura completa fallback), siso_cartas_custodia (lectura y escritura merge
por id), siso_portal_empresa_docs_NIT y variantes de digito verificador (lectura y
escritura, clave central del portal empresa), siso_portal_empresa_NIT y variantes (lectura,
indice de documentos), siso_portal_empresa_atenciones_NIT y variantes (lectura, agregado
multi-fecha), siso_portal_CODIGO y variantes de formato (lectura), siso_portal_doc_CEDULA
(lectura), siso_hc_completa_CEDULA (lectura), busqueda por prefijo siso_portal_empresa_
(lectura), siso_informes y siso_informes_USER (lectura y escritura merge por id via
_writeArrayMergeD1), siso_ai_calls_count_USER (lectura), siso_caja_movs_EMPRESA_O_USER
(escritura backup), siso_email_config_USER (escritura), siso_pending_d1_writes (lectura y
escritura, cola de reintentos), siso_atenciones_cerradas y siso_atenciones_USER (lectura y
escritura, GC de chunks huerfanos), siso_permisos_USER (lectura, polling), siso_encuestas y
siso_encuestas_USER (lectura y escritura, merge D1 mas Supabase mas local), siso_users
(escritura tras cambio de contrasena). Patron recurrente de robustez: antes de escribir un
array/objeto agregado a D1, el codigo intenta primero leer el valor existente; si la lectura
falla pero se detecta que la clave existe, se ABORTA la escritura en vez de sobreescribir
con datos vacios o parciales. Igualmente recurrente: la resolucion de NIT de empresa siempre
prueba el NIT limpio mas variantes con digito verificador 0 a 9 mas NIT sin ultimo digito, y
en las versiones mas recientes FUSIONA resultados de todas las variantes en vez de detenerse
en la primera coincidencia.

---

## 4. Logica de negocio: auto-refresh, boot, IA, cierre de HC (lineas 20000-26060)

### Recarga y refresco automatico

- _reloadEncuestasFromSupabase: recarga encuestas desde D1/Supabase al entrar al tab
  encuestas o al hacer login, siempre hace merge (nunca reemplazo), preservando encuestas
  locales que la nube desconoce.
- Carga del codigo de acceso del portal empresa (20073-20123): al abrir la pestana lista de
  empresas, trae el codigo de acceso de cada empresa desde D1 con fallback Supabase; corrige
  discrepancias silenciosamente en localStorage.
- AUTO-REFRESH por vista (20125-20304): al cambiar de vista, recarga solo las claves
  relevantes a esa vista, con cooldown de 5 minutos por vista mas usuario. Regla clave: si se
  viene de la vista historia, se OMITEN las claves de pacientes en todas las vistas (evita
  que un auto-refresh muestre version vieja de un paciente cuyo cierre aun no llego a la
  nube). Merge por coleccion: pacientes con estado Cerrada local se preservan aunque la nube
  no lo refleje aun; empresas/cuentas/informes solo se aplican si el tamano de la nube es
  mayor o igual al local (nunca reduce); atenciones cerradas: la nube siempre gana.

### Arranque de la app y restauracion de sesion (20453-21064)

Bloque de boot completo dentro de un unico useEffect inicial: carga inmediata desde
localStorage con filtro anti-fantasma (descarta pacientes sin id); restauracion desde
D1 primero y Supabase como fallback si D1 no responde; espera hasta 8 segundos a Supabase en
cache vacio (usuario nuevo/navegador limpio); AUTO-PUSH D1 de pacientes si localStorage tiene
datos que D1 no tiene (con flag anti-repeticion); AUTO-PUSH D1 de firma del medico (sin flag,
reintenta cada login); AUTO-PUSH D1 de HC cerradas cada 7 dias, con regla anti-degradado
(solo republica si el paciente local tiene firma real y datos del medico); sync principal de
login con ventana de frescura de 2 horas, lee en paralelo D1 y Supabase de una lista larga de
claves y aplica cada coleccion con merge por id (nunca reemplazo total).

### Autoguardados y timers de la Historia Clinica (21065-21136)

Autoguardado cada 2 minutos si la vista es historia y hay datos; advertencia al cerrar
pestana si hay cambios sin guardar; autoguardado local cada 15 segundos; sync a la nube cada
60 segundos SOLO si hay cambios pendientes; auto-calculo de IMC.

### AUTO-SYNC global cada 2 minutos (21136-21304)

Sincronizacion periodica de TODAS las colecciones a Supabase/D1, con guardia de que los
datos ya esten inicializados (no sincroniza con listas vacias). Anti-fantasma de pacientes:
si localStorage tiene mas pacientes que la memoria (otra pestana ya sincronizo), toma la
union; filtra siempre entradas sin id. Escribe doble clave (primaria y respaldo) para
pacientes, empresas, usuarios, cuentas de cobro, informes, auditoria, mensajes, agenda,
atenciones cerradas (con merge D1), config IA, datos del medico, caja, ARL, teleconsultas,
habeas data, cartas de custodia, cotizaciones, encuestas. La firma del medico queda excluida
del sync masivo por peso.

### Motor de IA (callAI y funciones de generacion)

- callAI (21457): motor central de llamadas a IA con failover multi-proveedor (gemini,
  openrouter, groq, cerebras), reintenta con el siguiente proveedor ante rate-limit o error
  de auth. Escribe contador de llamadas en localStorage y en D1 por usuario.
- buildFullContextHC(d) (21562): construye el contexto clinico completo para alimentar los
  prompts de IA (hallazgos, antecedentes, riesgos, maniobras, examen osteomuscular, agudeza
  visual, paraclinicos, examen especial segun enfasis, extras).
- _contextoEnfasisHC(d) (21676): bloque normativo especifico por enfasis del examen
  (alturas, alimentos, confinados, conduccion, cardiovascular, osteomuscular).
- Escalado de profundidad por reintento IA (21693-21720): cuenta reintentos por paciente y
  tipo de boton, y desde el segundo intento inyecta instrucciones de mayor rigor en el
  prompt.
- generateAIAnalysis (21723): genera concepto de aptitud, diagnosticos, derivaciones,
  examenes sugeridos, incapacidad, analisis clinico y SVE recomendado para HC ocupacional.
  Requiere plan Pro y cargo no vacio. Si el examen es ocupacional, FUERZA el diagnostico
  principal a Z10.0 y reubica el diagnostico real de la IA a secundario.
- generateAIRestricciones (21993) y generateAIRecomendaciones (22084): generan restricciones
  y recomendaciones respectivamente, con prohibicion legal explicita (Res. 1843/2025 Art.21)
  de mencionar diagnosticos o medicamentos, solo limitacion funcional.
- generateAIGeneral (22151): analogo para HC de medicina general.
- generateAIReport (22323): genera informe epidemiologico de empresa (2 llamadas IA
  secuenciales), requiere plan Pro.

### Guardado, cierre y reapertura de Historia Clinica

- handleManualCloudSave (22408): boton Guardar en Nube manual, con guardias anti-vacio y
  reporte de resultado por coleccion.
- handleDiagnosticoNube (22531) / handleRestaurarDesdeKey (22635): herramienta de
  diagnostico/recuperacion de emergencia comparando conteos pantalla versus nube.
- handleRecuperarDesdeHC (22666): recupera pacientes reconstruyendolos desde filas
  individuales del portal.
- handleSaveAIConfig (22711): guarda config IA en sessionStorage, localStorage y D1,
  prioridad D1.
- handleLogin (22734): flujo completo de autenticacion. Rate limiting (bloqueo tras 5
  intentos fallidos por 15 minutos). Verificacion PBKDF2 con salt o SHA-256 legacy sin salt.
  Fallback a Supabase si el usuario no esta local (reemplaza usuarios completo con la version
  de la nube). Ultimo recurso: usuarios hardcodeados de emergencia. 2FA si esta activado.
  Supabase Auth en paralelo para JWT. Para secretaria: carga permisos actualizados antes de
  fijar sesion. Merge por id entre localStorage y la nube al cargar pacientes/empresas
  (nunca reemplazo). Auto-backup: descarga JSON de respaldo 3.5 segundos tras login exitoso.
- handleVerify2FA (23232): verifica TOTP y continua el flujo de login.
- canViewPatient(p) / isHcOwner(p) (23288-23333): reglas de permisos por rol, incluye
  aislamiento multi-organizacion, cross-read entre medicos de la misma IPS, restriccion de
  secretaria a sus medicos asignados.

- openPatient(p) (23334): abre HC verificando permisos; ofrece restaurar autoguardado si
  tiene menos de 24h.
- handleNewOccupHistory / handleNewGeneralHistory (23373, 23433): crean nueva HC con gate de
  plan (limite de HC segun licencia, exento para admin), auto-tag de empresa si aplica.
- abrirHCDesdeAgenda(ag, tipo) (23487): abre HC desde un agendamiento, heredando datos
  historicos del paciente si existe.
- _stripFirmaLS(list) (23601) y _syncPatients(list) (23624): persistencia central de la
  lista de pacientes. Quita firma repetida antes de guardar en localStorage; escribe
  localStorage e IndexedDB sincrono; async Supabase backup; MERGE ANTI-REGRESION con D1: lee
  primero, preserva pacientes remotos ausentes localmente (por id o documento), luego
  escribe D1 en ambas claves. Si falla, encola pendiente y marca badge de sin respaldo.
- _writeArrayMergeD1(key, list, idField) (23709): helper generico de merge por id, usado por
  atenciones cerradas, empresas, facturas, informes.
- _persistBillsSafe (23739) / _persistReportsSafe (23762): persistencia segura anti-
  sobreescritura de facturas y propuestas.
- _deleteReportSafe / _deleteBillSafe (23774, 23785): borrado seguro, lee D1 primero, filtra
  solo el id borrado.
- _syncCompanies(list) (23796): persistencia de empresas con merge anti-regresion por id.
- checkAlertasObligatorias(d) (23823): valida Res. 1843/2025 Art.9/13 (incapacidad mayor o
  igual a 30 dias sin ser post-incapacidad; ausencia no medica mayor a 90 dias sin ser
  retorno laboral).
- handleSavePatient (23848): guarda HC sin cerrar, borra autoguardado, registra auditoria.

### handleCloseHistory (23875) - funcion central de cierre y firma

Valida concepto de aptitud obligatorio si es ocupacional; auto-guarda antes del modal de
confirmacion; avisa (no bloquea) si falta vigencia. Genera hash de la HC, codigo QR, y objeto
firmaDigital (hash, codigo QR, firmado por, medico, fecha, ley, verificable). Permite cierre
retroactivo (fecha elegida por el usuario). Escribe: pacientes actualizados mas sync;
resumen publico del portal en D1 bloqueante mas Supabase backup (multiples claves de
compatibilidad); portal empresa (tres claves coordinadas: indice, atenciones agregadas,
documentos por periodo); auto-marca el agendamiento relacionado como atendido; registra en
atenciones cerradas con merge anti-regresion; AUTO-FACTURACION: calcula tarifa segun
convenio, crea movimiento en Caja pendiente, guarda estado para modal posterior de decision
sobre cuenta de cobro. Fallback robusto de firma si esta vacia localmente (intenta D1).

### handleEditHistory (24393) - reapertura y notas aclaratorias

Solo admins. Ofrece: evolucion clinica, nota aclaratoria (minimo 10 caracteres, no reabre),
reapertura completa (requiere codigo de administrador hasheado mas motivo minimo 20
caracteres, incrementa contador de ediciones, registra en array de reaperturas con
auditoria), editar campos especificos post-cierre (tambien protegido por codigo admin).

- handleDeletePatient (24727): Res. 1995/1999 Art.15, retencion 20 anos. Si la HC esta
  cerrada o tiene menos de 20 anos, ARCHIVA en vez de borrar. Solo borra definitivo si han
  pasado 20 o mas anos y no esta cerrada.
- handleSignatureUpload, handleExportData/handleImportData (24772, 24784, 24833): subida de
  firma; backup/restore completo con merge por id al importar, y re-publicacion automatica al
  portal de pacientes cerrados con codigo.
- handleNameChange/selectPatientSuggestion (25067, 25106): autocompletado con memoria de
  antecedentes (copia antecedentes/habitos/riesgos previos, no copia examen fisico ni
  diagnosticos).
- handleOpenHistoryModal (25184): busca historial por documento normalizado, con opcion de
  buscar entre todos los medicos via Supabase.
- _printHCClean(silentMode) (25413): construye HTML completo autocontenido de la HC (26
  secciones) para PDF/impresion, con bloques de enfasis condicionados al tipo de examen.
- Navegacion con guardia de salida de HC (25972-26056): confirma antes de navegar si hay
  cambios sin guardar; al entrar a dashboard relee localStorage preservando estado Cerrada en
  memoria si la nube aun no lo refleja.

---

## 5. Navbar, Login, Dashboard (lineas 26060-28381)

### Navbar (renderNavbar, lineas 26060-26960)

Barra superior fija, presente en todas las vistas autenticadas, contextual segun view y rol.
Indicadores calculados: estado IA (verde ok, rojo error, gris idle), badge de sync (verde
nube ok, azul syncing, rojo sin nube, gris sin sync), contador de pacientes en sala de
espera hoy (solo administrador/secretaria/medico/admin_empresa), mensajes internos no
leidos.

Botones siempre visibles: logo (va a dashboard), bloque de medico activo (firma o inicial),
boton de configuracion IA.

Solo en view historia: volver (a dashboard si cerrada, si no goBack), badge de historia
cerrada con codigo, boton morado Evolucion/Nuevo Certificado si cerrada, mini-boton amarillo
de Nota Aclaratoria/Reapertura/Editar (solo admin/admin_empresa), boton rojo Firma y Cerrar
si no cerrada, tabs internos segun tipo de HC (ocupacional o general), boton PDF, panel
Enviar/Descargar con checklist de documentos y 3 acciones (PDF, Email, WhatsApp), boton
morado "20 anos" para paquete de preservacion (solo ocupacional cerrada), boton verde
Notificar, badge ambar de "solo lectura" cuando el medico ve HC de otro medico, boton verde
Guardar (solo si es el dueno de la HC).

Solo en view dashboard: Importar (JSON), Backup, RIPS (JSON con validacion), Guardar en Nube,
boton Nube de diagnostico, boton Examenes (carga masiva), boton Firma (subir imagen).

Indicadores de estado a la derecha: badge Offline con contador de cambios pendientes, badge
de estado de sync, badge ambar de pendientes en cola D1, badge rojo de "Datos sin respaldo en
nube" (clic reintenta sync de pacientes/facturas/reportes/informes), accesos a Privacidad,
Custodia, Telemedicina, Agenda (con badge de espera), Mensajes (badge de no leidos), Planes,
Salir (invalida JWT, borra sesion).

### Login (renderLogin, lineas 26961-27005)

Pantalla de autenticacion con fondo degradado, componente LoginForm (definido en linea
12877): limites de longitud en usuario/contrasena, bloqueo por intentos fallidos con cuenta
regresiva en vivo, banner de advertencia de intentos restantes.

RecuperarAcceso (subcomponente, enlace discreto "Problemas para acceder"): pide un codigo de
administrador del sistema hardcodeado como 9207. Si coincide, limpia el rate-limiting y
restaura por la fuerza el hash de contrasena de emergencia para el usuario drcucalon en
localStorage, precargando el formulario. Es una puerta trasera de recuperacion con
credenciales fijas embebidas en el cliente, relevante para auditoria de seguridad.

handleLogin (invocado desde aqui, definido en linea 22734): verifica hash de contrasena (sin
fallback a texto plano), migra usuarios legacy, fallback a Supabase si no se encuentra
localmente, fallback final a usuarios de fabrica, 2FA si esta activado, JWT de Supabase Auth
en paralelo, recarga permisos para secretaria.

Otros botones en login: Configurar IA (recomendado), Restaurar Copia (importar JSON).

### Dashboard (renderDashboard, lineas 27007-28379)

Panel principal (o Panel IPS si el usuario tiene empresa asociada). Incluye navbar, banner
de empresa (si aplica), indicador de medico de turno (solo admin), banner de plan con
contador de HC usadas y aviso de vencimiento, 8 tarjetas de estadisticas (Historias
Registradas, Empresas, HC Cerradas, HC Abiertas, Medicos IPS, Cuentas Pendientes, Convenios
por Vencer, con scoping por IPS si aplica).

Botones grandes: Nueva HC Ocupacional, Nueva HC General.

Modulos agrupados: Gestion Clinica (Pacientes, Agenda, Verificar), Administracion (Empresas,
Usuarios, Mi Empresa o Portafolio), Financiero y Reportes (Cuentas de Cobro con gate de plan,
Modulo Financiero/Caja, Contabilidad V2 visible SOLO para el usuario literal drcucalon -
hardcodeado por username, no por rol -, Reportes, Propuestas, Contabilidad), Modulos
Especializados (SVE, ARL, Portafolio, todos con gate de plan y mensajes de upsell con
precios especificos), Datos y Sincronizacion (solo admin con token de worker: Sincronizar a
D1 manual, Exportar Backup, indicador Cloudinary), Portales y Acceso Externo (Portal de
Certificados, Habeas Data), Super Admin (solo ese rol, Panel Global).

Panel de Alertas Administrativas (solo admin/empresa): convenios por vencer, cuentas
pendientes (si mas de 5, con total en pesos), HC sin cerrar (informativo), medicos activos
sin firma digital. Maximo 5 alertas.

Tabla Productividad por Medico (solo admin/empresa, mes actual): atenciones, HC
cerradas/abiertas, ingresos del mes, porcentaje del total con barra de progreso.

Tabla Registros Recientes: ultimos 20 pacientes con fechaExamen, filtrados por permiso de
vista (control de acceso por rol/propiedad), con acciones ver, certificado, eliminar,
preservar 20 anos (solo ocupacional cerrada), exportar FHIR (solo ocupacional cerrada).

Reglas no obvias destacadas: Contabilidad V2 restringida por username literal drcucalon, no
por rol; upsells de plan muestran precios especificos hardcodeados; el scoping por empresa
filtra estadisticas y modulos, un refactor que lo omita mostraria datos cruzados entre
empresas a un admin_empresa; visibilidad de Caja para secretaria depende de permiso granular,
no solo del rol.

---

## 6. Historia Clinica Ocupacional (renderHistoriaOcupacional, lineas 28381-30840)

Formulario mas complejo del sistema. Todo el contenido editable esta dentro de un unico
fieldset con disabled cuando estadoHistoria es Cerrada - bloqueo TODO O NADA a nivel HTML
nativo (no hay bloqueo campo por campo). Formato carta, folio, version de documento, codigo
FOR-SST-001 v4.0, referencia Res. 1843/2025.

Secciones en orden:

1. Notificacion de historial previo (banner verde si se cargaron antecedentes automaticos).
2. Consentimiento Informado Digital (modal, obligatorio registrar nombre y checkbox; escribe
   consentimientoInformado, nombre, tipo, fecha, timestamp ISO, IP simbolica, version legal;
   no editable si la HC esta cerrada).
3. Empresa / Enfasis / Tipo de Evaluacion: select de empresa, select de ENFASIS (GENERAL,
   OSTEOMUSCULAR, CORAZON, ALTURAS, ALIMENTOS, CONFINADOS, CONDUCCION), radio de tipo de
   evaluacion (INGRESO, PERIODICO, RETIRO, POST-INCAPACIDAD, RETORNO-LABORAL, SEGUIMIENTO,
   con campos condicionales de dias de incapacidad/ausencia segun el tipo).
4. Datos Sociodemograficos y Laborales: autocompletado de paciente existente, identificacion
   completa, afiliaciones (EPS/ARL/AFP), datos laborales (cargo, contrato, turno), contacto y
   residencia, grupo etnico e identidad de genero, aviso legal Res. 1843/2025 Art.10 sobre
   pruebas prohibidas si el examen es ingreso o periodico, motivo de consulta obligatorio,
   campos Art.25/26 (plazo de implementacion de recomendaciones, pausas activas), foto del
   paciente opcional comprimida en canvas.
5. Perfil del Cargo, Res. 1843/2025 Art.29: funciones y tareas (obligatorio), demandas
   fisicas/mentales, factores de riesgo, nivel de exposicion, tiempo acumulado, medidas de
   control - reemplaza el profesiograma tradicional.
6. Factores de Riesgo del Cargo: 8 categorias checkbox (fisicos, quimicos, biologicos,
   mecanicos, biomecanicos, psicosocial, seguridad, locativos).
7. Antecedentes Personales: 5 grupos (patologicos, quirurgicos, traumaticos,
   farmacologicos, alergicos), radio Si/No con detalle si es Si.
8. Estilos de Vida: cigarrillo, alcohol, psicoactivas, ejercicio.
9. Signos Vitales y Antropometria: FC, FR, T/A, temperatura, peso, talla con IMC calculado,
   lateralidad, agudeza visual.
10. Examen Fisico por Sistemas: boton "Todos Normal" que rellena 14 sistemas de una vez;
    cada sistema radio Normal/Anormal, con descripcion estandar si Normal y textarea
    obligatorio si Anormal.

### Bloques de enfasis especializado (condicionales segun el enfasis elegido)

- ALTURAS (Res. 4272/2021): Romberg, vertigo, coordinacion, marcha tandem, nistagmus, test
  miedo alturas; sub-bloque audiometria; sub-bloque paraclinicos (laboratorios, EKG/Holter,
  espirometria, optometria, Rx, psicosensometrico).
- ALIMENTOS (Res. 2674/2013): piel/faneras, ORL, gastrointestinal.
- CONFINADOS (Res. 0491/2020): cardiovascular, respiratorio, neurologico, evaluacion
  psicologica, ORL/oido, capacidad de uso de EPP respiratorio.
- OSTEOMUSCULAR (Res. 2404/2019): 6 sistemas, mas 8 maniobras especiales (Phalen, Tinel,
  Finkelstein, Jobe, Lasegue, Adams, Schober, Wells), diagnostico funcional/restricciones.
- CONDUCCION DE VEHICULOS (Res. 217/2014) - enfasis solicitado especificamente: agudeza
  visual lejana/cercana, campimetria, discriminacion de colores, vision de profundidad,
  audiometria, antecedentes neurologicos (epilepsia/sincope/apnea), consumo de
  alcohol/psicoactivos/sedantes. Evaluacion Psicomotriz: 5 pruebas de tiempos de
  reaccion/coordinacion (resistencia a la monotonia, reaccion multiple, anticipacion de
  velocidad, coordinacion bimanual, reaccion al frenado), cada una radio Bajo/Medio/Alto mas
  detalle libre. Valoracion Psicologica General y Observaciones/Restricciones finales.
- CARDIOVASCULAR/CORAZON (Res. 1843/2025, default): frecuencia cardiaca, presion arterial,
  ritmo y tonos, pulsos perifericos, edemas, perfusion periferica, riesgo cardiovascular
  segun escala Framingham (bajo/moderado/alto/muy alto).

### Concepto Medico y Recomendaciones (seccion final, la mas critica)

Botones de IA: Analisis IA Completo, Recomendaciones (panel de checklist), Restricciones
(panel de checklist), indicador en vivo del proveedor y contador de llamadas por proveedor.
Diagnosticos CIE-10 con badge de equivalencia CIE-11 automatica (principal obligatorio,
secundarios 1 y 2). Concepto de Aptitud (obligatorio) con 10 opciones de texto fijo exactas
(sin restricciones, hallazgos que no interfieren, con recomendaciones, con restricciones,
requiere reubicacion, aplazado, egreso satisfactorio, egreso con hallazgos, periodico
satisfactorio, periodico con hallazgos). Recomendaciones y Restricciones Medico-Laborales
(textareas). Analisis Clinico IA (campo independiente editable). Conducta a Seguir y
Determinaciones Medico-Administrativas. SVE recomendado (lista editable con 9 opciones
predefinidas). Vigencia del Concepto (obligatoria).

Firma de impresion: dos columnas, firma del trabajador y DoctorSignature (solo visible en
modo impresion).

Fuera de esta funcion pero directamente relacionado (viven en el toolbar/navbar compartido):
boton Firma y Cerrar (handleCloseHistory), banner de historia cerrada, boton de reapertura
(handleEditHistory, solo admin, requiere codigo mas motivo de al menos 20 caracteres).

No se observo escritura directa a D1 dentro de esta funcion - todo vive en el estado data en
memoria; la persistencia ocurre en handleCloseHistory/_syncPatients al guardar/cerrar la HC.

Rango de lineas: 28381-30838 (funcion completa).

---

## 7. Historia Clinica General y Certificado de Aptitud (lineas 30840-32658)

### Historia Clinica General (renderHistoriaGeneral, lineas 30840-31779)

Formulario de medicina general (consulta comun, no ocupacional), formato carta, basado en
Res. 1995/1999, codigo FOR-MG-001. Secciones: busqueda de paciente existente con "memoria de
antecedentes" (al seleccionar un paciente hereda antecedentes/habitos/vacunacion de su HC mas
reciente, pero no examen fisico ni diagnosticos), datos del paciente, motivo de consulta y
enfermedad actual, 7 categorias de antecedentes (radio No/Si con detalle), revision por 9
sistemas (radio Normal/Anormal), examen fisico con signos vitales e IMC y boton "Todos
Normal", impresion diagnostica con boton Analisis IA (requiere plan Pro y motivo de consulta
no vacio), diagnosticos CIE-10 con badge CIE-11, conducta y plan de manejo, firma y
verificacion (solo visible si la historia esta cerrada o en impresion).

Filtro de pacientes por medico dueno salvo rol admin (aislamiento entre medicos). Formulario
deshabilitado completo si la historia esta cerrada. No hay escritura directa a D1 dentro de
esta funcion, todo vive en el estado data.

### Certificado de Aptitud (renderCertificado, lineas 31781-32656)

Genera/muestra el Certificado de Aptitud Laboral final, basado en Res. 1843/2025. Datos
generales (nombre, documento, edad, empresa, cargo, EPS, ARL, enfasis, tipo de evaluacion,
fecha, medico evaluador). HALLAZGO IMPORTANTE: el "Diagnostico Principal" mostrado en el
certificado esta SIEMPRE HARDCODEADO como el texto fijo "Z10.0 - EXAMEN MEDICO OCUPACIONAL",
sin importar lo que se haya registrado realmente como diagnostico del examen - punto critico
a verificar en la paridad del refactor.

Resultados de enfasis especializado (solo si el enfasis no es GENERAL): mismo set de 6
bloques que en la HC ocupacional (alturas, alimentos, confinados, osteomuscular, conduccion,
corazon), cada uno con color distintivo propio, mostrando lo ya registrado en la HC (no se
recalcula aqui).

Concepto Emitido: recuadro central grande con el concepto de aptitud (o PENDIENTE si vacio)
y Vigencia (badge verde o advertencia roja si falta el registro de vigencia, cumplimiento Res.
1843/2025). Recomendaciones y Restricciones si existen. Banner de Historia Firmada y Cerrada
(solo si esta cerrada) con codigo de verificacion. Firma del Trabajador, Panel de Notas
Aclaratorias, boton Descargar RDA (Res. 1888/2025, genera archivo JSON local descargable, no
escribe a D1), Firma digital del medico. Carne de Manipulacion de Alimentos (solo si el
enfasis es ALIMENTOS, con boton de impresion). Registro de "Entrega de copia al trabajador"
(checkbox, fecha, metodo: fisica/email/whatsapp).

Los botones reales de generar PDF/enviar por email o whatsapp NO estan dentro de esta
funcion, viven en la barra/toolbar superior compartida (boton Enviar del navbar). No hay
escritura directa a D1 dentro de esta funcion, todo vive en el estado data; la persistencia
real ocurre al guardar/cerrar la HC completa por el mismo mecanismo que la historia general.

---

## 8. Reportes Epidemiologicos y Gestion de Pacientes (lineas 32658-35270)

### Reporte / Informes (renderReporte, lineas 32658-34982)

Pantalla de Reportes Epidemiologicos / Diagnostico de Condiciones de Salud por empresa.
Gate de permiso especifico para rol secretaria (permiso "reporte", distinto del generico de
medico asignado). Filtros: rango de fechas, empresa (auto-seleccionada si el usuario es
tipo empresa), medico (restringido a los medicos asignados si la secretaria los tiene
definidos).

Botones: Imprimir, Guardar Informe (escribe estadisticas en clave dedicada por
empresa/timestamp, doble escritura D1 mas Supabase), Publicar en Portal (con verificacion
anti-sobreescritura antes de crear registro nuevo, generacion de codigo de acceso si falta),
Enviar TODO a Empresa (abre modal de Envio Integral), indicador de "Emitido" con boton
Descargar ZIP.

Dos tabs: Estadisticas y Diagnostico (KPIs, panel de precio con 3 modos - global, individual,
por fecha - boton Generar Cuenta de Cobro, exportacion CSV/PDF, tablas sociodemograficas
ampliadas de 14 categorias, perfil clinico y de salud, riesgos laborales, panel de Analisis
IA con resumen ejecutivo/conclusiones/matriz legal/PVE recomendados, marco normativo SST de
10 normas) y Certificados por Empresa (seleccion multiple, impresion en lote, descarga ZIP
via html2canvas mas jsPDF, envio por email/whatsapp masivo o individual).

Persistencia: clave dedicada de estadisticas via escritura dual D1 mas Supabase (sin merge,
registro nuevo por informe); saveInforme usa merge por id via _writeArrayMergeD1 en dos
claves (global y por usuario), backup Supabase, auto-publicacion al portal.

### Gestion de Pacientes (renderPatients, lineas 35017-35270)

Lista de pacientes deduplicados por numero de documento (un registro por documento, el mas
reciente, con contador de historias propias). Filtrado por rol: empresa ve solo su empresa
(con fallback por NIT), admin ve todo, medico regular solo sus propios pacientes.

Filtros de UI: buscar por nombre/documento, empresa (incluye opcion Particular), rango de
fechas desde/hasta. Columnas: Nombre (con badge de vencimiento de periodicidad, Res. 1843
Art.4, calculado sobre la fecha de examen mas reciente de TODAS las HC del documento),
Documento, Empresa/Cargo, Historial (boton "N HC Propias" y boton "Todos medicos" que
consulta cross-usuario via Supabase), Acciones (boton "+ HC Ocup." que precarga todos los
datos sociodemograficos del paciente en una HC nueva, botones de envio de certificado por
email/whatsapp SOLO si la historia esta cerrada, boton eliminar).

Regla de retencion documental (handleDeletePatient): si la HC esta cerrada o tiene menos de
20 anos, ARCHIVA en vez de eliminar (Res. 1995/1999 Art.15); solo elimina definitivo si han
pasado 20 anos o mas y no esta cerrada.

Persistencia (_syncPatients): localStorage con firma removida (ahorro de espacio) mas espejo
IndexedDB completo, backup Supabase async, y proteccion anti-regresion D1: lee el remoto y
fusiona (nunca reemplaza) pacientes que D1 conoce y el cliente local no.

---

## 9. Gestion de Empresas / Portal de acceso (renderCompanies, lineas 35272-37844)

CRUD central de empresas cliente con 5 pestanas: Lista, Documentos, Nueva Empresa, Convenios,
Encuestas. Bloqueo de modulo para secretaria sin permiso ni medico asignado. Secretaria
autorizada ve solo empresas filtradas por sus medicos asignados.

Tab Lista: boton "Activar todas" (genera codigo de portal EMP-XXXX-XXXX para empresas sin
codigo), por empresa: editar, eliminar, badges de medicos/sedes, badges de vencimiento de
convenio, chips clicables de 4 documentos (certificados, sociodemografico, custodia, cuenta
de cobro - verde si existe con enlace a verlo, rojo si falta con enlace a crearlo), badges
de tarifas, bloque Portal con NIT/Contrasena/boton copiar/boton abrir portal.

Tab Nueva Empresa: unico campo obligatorio es Razon Social; seccion de convenio (medico
responsable, tarifas por tipo de examen, condicion de pago, fechas de convenio, descuento),
checkboxes de portal activo y facturacion agrupada, multi-medico asignado, sedes, acceso
admin del portal con contrasena hasheada con SHA-256 antes de guardar.

Tab Documentos: inventario de 4 documentos por empresa con boton de Resumen IA. Tab
Convenios: resumen de solo lectura con contadores y tabla. Tab Encuestas: crear encuesta
(genera token, guarda metadata D1 mas Supabase), importar pacientes desde respuestas (con
escritura D1 bloqueante ANTES de marcar como importado, para permitir reintento si falla),
importacion masiva desde Excel con mapeo automatico de columnas.

Modal Editar Empresa: mismos campos, mas boton Regenerar codigo del portal, boton Enviar
(abre modal Portal Activado). Modal Portal Activado: celebratorio, explica el portal,
codigo grande, URL directa, boton "Copiar mensaje para WhatsApp/Email", boton de vista previa.

Regla de negocio clave: generacion del codigo del portal en formato EMP mas ultimos 4 del NIT
mas 4 caracteres aleatorios (alfabeto sin caracteres confusos 0/1/I/O). Distincion critica
entre portalCode (acceso simple por NIT mas codigo) y Admin del Portal (credenciales
separadas hasheadas, para que la propia empresa gestione sus medicos/secretarias). Unico
campo obligatorio para crear empresa es Razon Social. Emparejamiento tolerante
empresa-documento por id, nombre exacto, o NIT igual/prefijo (resuelve empresas recreadas con
id nuevo pero mismo NIT).

Escrituras: companies (local mas sync), siso_portal_empresa_docs_NIT (Supabase mas D1, con
_readSmart para reconciliar antes de sobrescribir), siso_encuesta_TOKEN y
siso_encuesta_resp_TOKEN, siso_encuestas (merge por id via _writeArrayMergeD1), y al importar
pacientes de encuesta: escritura D1 bloqueante con merge por id antes de marcar importado.

---

## 10. Verificacion de Certificados y Cuentas de Cobro (lineas 37846-39303)

### Verificacion de Certificados (renderVerification, lineas 37846-38157)

Vista publica de validacion: cualquier perfil puede verificar un certificado cerrado
buscando por codigo de verificacion o numero de documento (busqueda en TODOS los pacientes
sin importar medico ni rol - comentario explicito en el codigo). Por documento solo se
muestran HC cerradas. Si hay multiples HC cerradas del mismo documento, aparece selector.
HALLAZGO: el bloque superior de esta funcion contiene un mini-configurador de facturacion
(filtros de empresa/mes, modalidad de cobro, checklist de trabajadores) que en realidad
pertenece conceptualmente a Cuentas de Cobro - mezcla de responsabilidades en una sola
funcion render, posible hallazgo de auditoria. No escribe nada a D1, es de solo lectura.

### Cuentas de Cobro / Facturacion (renderBill, lineas 38159-39303)

Gates: plan minimo starter, y permiso especifico de secretaria. Botones: Guardar/Guardar
cambios (nuevo o edicion), Guardadas con badge de pendientes, Imprimir, panel de Factura
Electronica DIAN (gate de plan Pro, genera XML UBL 2.1 para proveedor externo, IVA siempre 0
por exencion de servicios medicos). Selector de medico emisor (organizacion o independiente).

Panel de cuentas guardadas: editar, imprimir, marcar pagada (sincroniza tambien el portal
empresa marcando el periodo como pagado), eliminar (borrado seguro, lee D1 primero y filtra
solo el id borrado).

Documento imprimible con barra de formato de texto flotante, campos editables, datos
bancarios y del acreedor, nota legal fija de retencion Art.383 E.T.

Persistencia: _persistBillsSafe escribe localStorage en dos claves mas D1 via
_writeArrayMergeD1 (merge por id, no reemplazo) mas Supabase; si falla marca badge de sin
respaldo. Eliminacion via _deleteBillSafe (lee D1, filtra solo el id borrado, reescribe).

---

## 11. Portal Trabajador, SVE, ARL, Habeas Data (lineas 39308-41237)

### Portal Trabajador (renderPortalTrabajador, lineas 39308-39639)

Vista INTERNA (dentro del dashboard logueado) para generar/copiar el link publico y buscar
pacientes directamente. NOTA IMPORTANTE: el acceso publico real sin login ocurre por un
hash-router distinto que activa un componente DIFERENTE, PortalPublicoTrabajador (linea
59590). No confundir ambos en la auditoria de paridad.

Busqueda por codigo de verificacion (prioridad) o por documento (solo entre HC cerradas y no
archivadas). Sin gate de plan ni de rol. Descarga de Certificado de Aptitud en PDF. No
escribe nada persistente.

### SVE - Sistema de Vigilancia Epidemiologica (renderSVE, lineas 39644-40461)

Gate de plan (minimo Starter, con limite de programas segun plan: 0 libre, 2 starter, 7
pro/clinica) y gate de permiso de secretaria. Identificacion HEURISTICA por texto: un
paciente entra a un programa (DME, Precursores Cardiovasculares, Respiratorio, Dermatosis,
Psicosocial, Ruido, Quimicos) si algun diagnostico o el texto de riesgos contiene ciertas
palabras clave por programa - no es un campo estructurado asignado manualmente. Analisis IA
adicional agrupado por empresa (gate de plan Pro). No hay clave de localStorage/D1 propia,
es una vista derivada/computada en memoria; exportaciones CSV son locales.

### ARL - Accidentes de Trabajo y Enfermedad Laboral (renderARL, lineas 40466-40840)

Gate solo de plan (Pro), sin gate de rol de secretaria (a diferencia de SVE). 3 tabs:
Accidente de Trabajo, Enfermedad Laboral, Historial. Validacion de campos obligatorios por
formulario. HALLAZGO DE PARIDAD: el guardado trunca el historial a 200 registros
(.slice(0,200)), y usa reemplazo completo del array (no merge por id) via _sync, pero la
clave siso_arl_reportes NO esta en la lista de sincronizacion exacta a D1 ni matchea ningun
prefijo D1 - los reportes ARL NUNCA se escriben a D1 via _workerSet, solo a localStorage y
Supabase (dos claves distintas, redundancia). Sin embargo SI se lee de D1 en el merge de
login - asimetria potencialmente riesgosa entre lo que se lee y lo que se escribe.

### Habeas Data (renderHabeasData, lineas 40846-41237)

Sin gate de plan ni de rol - cualquier usuario autenticado puede usarlo. Es un registro
administrativo de solicitudes de derechos ARCO (conocer, actualizar, suprimir, revocar,
queja SIC, acceso a HC), NO es el modal de aceptacion de tratamiento de datos que bloquea el
login (ese es otro mecanismo separado). Por tanto esta vista NO bloquea nada, es de gestion
pura. Calculo de plazo aproxima 10 dias habiles como 14 dias calendario, colorea segun
urgencia. HALLAZGO DE PARIDAD: la persistencia (_syncHabeas) escribe SOLO a localStorage y
Supabase por usuario, nunca pasa por _sync ni por D1/_workerSet, y la clave tampoco aparece
en la lista de restauracion D1-al-login - es la persistencia mas fragil de las 4 vistas de
este bloque; en un dispositivo nuevo o tras limpiar localStorage, solo Supabase podria
rescatar estas solicitudes.

---

## 12. Telemedicina, Adjuntos, Usuarios y Permisos (lineas 41243-45188)

### Telemedicina (renderTelemedicina, lineas 41243-41842)

Modulo de teleconsulta via Jitsi Meet (Res. 2654/2019), gratuito, con sala de espera,
consentimiento informado obligatorio (checkbox bloquea el boton de iniciar), y creacion de HC
post-consulta. Gate de permiso de secretaria (pero medico siempre puede). roomName se genera
deterministicamente a partir de documento, fecha y hora. Persistencia via clave por usuario
en Supabase directo (_sbSet), sin pasar por _sync ni D1.

### Tab Adjuntos (renderTabAdjuntos, lineas 41848-42313)

Gestion de adjuntos de paraclinicos (Res. 1843/2025 Art.12): espirometria, audiometria, Rx,
laboratorio, optometria, ECG, vacunacion, otro. Boton de subir y analizar con IA de vision
(resultado se anexa al texto de resultados paraclinicos). Dos rutas de subida: Cloudinary
(preferida, sin limite practico) o fallback base64 en D1/Supabase con compresion agresiva y
limites estrictos (PDF maximo 750KB crudo). HC cerrada bloquea analisis IA, subida y borrado
(solo permite ver).

### Usuarios y Permisos (renderUsers, lineas 42317-45188)

Pantalla central de administracion. Roles: super_admin (control total, cualquier
organizacion), administrador (control total en su organizacion), admin_empresa (administra
solo su propio equipo IPS, solo puede crear medico/secretaria), medico (sin empresa: solo su
propio perfil; con empresa: ve la lista de su IPS en modo lectura, con permisos automaticos
amplios via MEDICO_SIEMPRE_PUEDE), secretaria (todo bloqueado por defecto, el admin activa
12 permisos granulares uno por uno, mas restriccion opcional a medicos asignados).

Tabs: lista, nuevo usuario, reasignacion (solo admin, distribucion equitativa de pacientes
sin medico, con preferencia por continuidad), licencias (delega a LicenciasTab), auditoria
(log con boton de limpiar solo para rol literal "administrador", posible inconsistencia con
super_admin), storage (calculo de tamano por usuario, boton de descarga y boton de
ELIMINAR TODO protegidos por codigo hardcodeado 9207).

Edicion de perfil: datos de acceso, permisos de secretaria (12 toggles mas medicos
asignados), 2FA TOTP, perfil profesional, datos financieros, tarifas, firma digital.

HALLAZGOS DE PARIDAD: alta de usuario hashea contrasena con SHA-256 simple, pero edicion usa
PBKDF2 con salt - inconsistencia de algoritmo entre creacion y edicion. El codigo 9207 esta
hardcodeado en el cliente para dos operaciones muy sensibles (descarga y borrado total de
datos de un usuario). El boton de limpiar auditoria compara el rol exacto "administrador" en
vez de usar el helper _isAdmin, lo que podria excluir a super_admin.

---

## 13. Planes, Propuestas Comerciales, Solicitud de Examenes (lineas 45189-47882)

### Planes de Exámenes / Planes y Precios (renderPlanes, lineas 45189-45794)

Pese al nombre de la vista, es la pantalla de PRECIOS/SUSCRIPCION de la app (no de examenes
medicos): compara 4 planes (Libre, Starter, Pro, Clinica). Boton dinamico por tarjeta: si es
el plan actual, bloque verde; si el usuario es admin, boton que redirige a Usuarios tab
Licencias para activar el plan a un usuario; si no es admin, solo muestra alerta con
instruccion de contactar al administrador (no hace nada transaccional). Tabla comparativa de
30 funciones. Ninguna escritura persistente en esta funcion.

### Propuestas Comerciales (renderPropuestas, lineas 45800-46833)

Gate de plan Starter y de permiso de secretaria. 3 tabs: Propuesta Economica, Cotizacion
Rapida (delega en renderCotizacionesInline), Historial. Catalogo de 10 servicios con precios
combinando valores fijos y tarifas configuradas por el medico. HALLAZGO IMPORTANTE
DOCUMENTADO EN EL PROPIO CODIGO: antes esta funcion usaba reemplazo total al guardar
(escritura directa sin merge) y esto causo perdida real de propuestas en produccion; el fix
actual usa _persistReportsSafe con merge por id via _writeArrayMergeD1 - el refactor debe
replicar el merge, no un set directo. Eliminar usa _deleteReportSafe (lee remoto, filtra solo
el id borrado).

### Tab Solicitud de Examenes (renderTabSolicitudExamenes, lineas 46835-47882)

Sub-tab dentro de la HC para solicitar examenes complementarios. Buscador dual por codigo
CUPS y por texto libre contra catalogo estatico de unos 300 examenes. Boton de paquetes
predefinidos (10 paquetes por grupo de riesgo: ingreso, periodico, alturas, alimentos,
cardiovascular, respiratorio, osteomuscular, ruido, quimico, visual). REGLA DE NEGOCIO NO
OBVIA CLAVE (Res. 1843/2025 Art.10): si el examen a agregar coincide con terminos prohibidos
(prueba de embarazo, VIH, serologia/VDRL) Y el tipo de examen actual es una evaluacion
ocupacional de ingreso/periodico/retiro, el sistema NO lo agrega directamente - exige
justificacion clinica escrita antes de permitirlo, marcando el item con alerta normativa. Un
refactor podria omitir facilmente esta validacion legal. No hay escritura directa a D1 en
esta funcion, todo vive en el estado data de la HC en curso.

---

## 14. Incapacidad General, Agenda, Sala de Espera/Asistencia (lineas 47884-50129)

### Tab Incapacidad General (renderTabIncapacidadGeneral, lineas 47884-48240)

Certificado de Incapacidad Medica dentro de la HC general (Ley 100/1993 Art.227, Decreto
2943/2013). Unico boton de accion es Imprimir Certificado, que abre ventana editable antes de
imprimir. Calculo de dias inclusive de ambos extremos, con conversion a letras. No escribe a
D1 directamente, solo modifica el estado local data.

### Agenda (renderAgenda, lineas 48242-49911)

Modulo central de citas y sala de espera. Gates de plan (Starter) y de permiso de secretaria.
Tabs Hoy/Proximas/Semanal/Mensual mas Nueva Cita. Por paciente: Iniciar/Reabrir HC, marcar
Atendido, eliminar cita, enlace de WhatsApp de recordatorio. Bloqueo de horarios superpuestos
por medico/fecha/hora. Citas recurrentes (control periodico) generan una segunda cita
clonada automaticamente. Scoping multi-tenant por empresa si aplica.

Persistencia: clave siso_agendados_SUFIJO (por empresa/usuario), escritura mediante REEMPLAZO
COMPLETO del array (no merge por id) via _sync mas Supabase. HALLAZGO: esta clave NO esta en
la lista de proteccion anti-vacio de _sync (a diferencia de otras claves criticas), por lo
que un estado vacio en cliente podria en teoria sobreescribir la nube - riesgo potencial de
perdida si dos sesiones desincronizadas escriben.

### Sala de Espera / Reporte de Asistencia (renderAsistenciaAgenda, lineas 49913-50129)

Pese al nombre, NO es una sala de espera operativa (eso vive en renderAgenda, tab Hoy) sino
un REPORTE HISTORICO de asistencia de los ultimos 30 dias con exportacion CSV e impresion.
HALLAZGO: no filtra por medico ni por empresa (a diferencia de renderAgenda), muestra todas
las citas del rango sin importar el usuario logueado - posible diferencia de comportamiento a
verificar en el refactor. Vista de solo lectura, no escribe nada.

---

## 15. Portafolio, Cotizaciones, Contabilidad (lineas 50132-52148)

### Portafolio (renderPortafolio, lineas 50132-50411)

Catalogo interno de servicios/precios del medico o IPS, fuente de autocompletado para
Cotizaciones y Cuentas de Cobro. HALLAZGO: es 100 por ciento LOCAL, sin respaldo en la nube -
la persistencia (savePortafolio) solo escribe a localStorage, sin _workerSet, sin
_writeArrayMergeD1, sin _sbSet en ningun punto del archivo. No aparece en las claves
restauradas al login ni en los backups automaticos.

### Cotizaciones Inline y Cotizaciones (renderCotizacionesInline lineas 50415-50834,
renderCotizaciones lineas 50836-51369)

Dos implementaciones casi duplicadas de un mismo modulo de cotizaciones: la version inline es
un fragmento embebido (sin navbar propio, sin impresion formal, confirmacion con
window.confirm nativo, campo de nombre "validez"), la version completa tiene navbar propio,
genera documento HTML imprimible con membrete de la IPS, usa datalist del Portafolio para
autocompletar precios, y usa el campo "validezDias" (inconsistencia de nombre de campo entre
ambas versiones). Persistencia (saveCotizaciones): localStorage inmediato mas Supabase
diferido (sin D1) via clave compartida siso_cotizaciones.

### Contabilidad (renderContabilidad, lineas 51372-52148)

Restringido a administrador o admin_empresa. Envuelto en try/catch propio (indicando que es
considerado mas fragil). 6 tabs: P&L (resumen), Cartera, Por Empresa, KPIs, Fiscal
(estimados de retencion segun sea IPS 4 por ciento o independiente 10.5 por ciento, Art.392
E.T., con disclaimer legal), Exportar (4 CSV). Es una vista puramente derivada/de solo
lectura sobre cajaMovimientos, no escribe nada salvo descargas de archivos locales.

Nota transversal de paridad: Portafolio, Cotizaciones y Caja/Contabilidad quedaron FUERA de
la migracion a D1 (worker), dependen solo de localStorage mas Supabase como respaldo en la
nube - contraste con otros modulos (informes, bills) que si usan _writeArrayMergeD1/D1.

---

## 16. Perfil IPS y Caja (lineas 52151-54620)

### Perfil IPS (renderPerfilIPS, lineas 52151-52439)

Configuracion institucional (logo, datos legales, contacto) que alimenta la cabecera de todos
los documentos generados. Acceso EXCLUSIVO al rol admin_empresa. Limite de logo 200KB sin
compresion. HALLAZGO: a diferencia de otros modulos financieros, el guardado NO llama a
_writeArrayMergeD1 ni a _workerSet - solo localStorage y Supabase (_sbSet), sin paso
explicito por D1 dentro de esta funcion.

### Caja (renderCaja, lineas 52442-54620)

Modulo Financiero: caja diaria (ingresos/egresos), checklist de cobro de pacientes del dia,
cuentas por cobrar agrupadas por empresa, historial con comprobantes imprimibles,
contabilidad mensual, y liquidacion medico-clinica (solo visible para admin). Gate de
permiso de secretaria; boton eliminar movimiento bloqueado para secretaria; editar/eliminar
cuentas de cobro requieren el mismo codigo de seguridad hardcodeado 9207 usado en otros
modulos. No existe concepto formal de apertura/cierre de caja con arqueo, es un libro de
movimientos filtrable por periodo.

Persistencia de movimientos de caja (saveCaja): localStorage mas Supabase (_sbSet), SIN
_writeArrayMergeD1 ni _workerSet - a diferencia de las cuentas de cobro (que si usan merge
D1 via _persistBillsSafe dentro de esta misma pantalla). El reparto de honorarios por medico
individual en Liquidacion es explicitamente NO persistente (comentario en el codigo: solo
vale para la sesion actual).

---

## 17. Super Admin y Portal Empresa (lineas 54626-56370)

### Super Admin (renderSuperAdmin, lineas 54626-55303)

Panel Global multi-tenant/multi-organizacion, exclusivo del rol super_admin. 4 tabs:
Organizaciones (estadisticas por org, con boton "Ver datos (auditado)" que registra
explicitamente el acceso a datos de otra organizacion en la auditoria), Nueva Org (crea
organizacion completa mas usuario administrador con contrasena temporal), IPS/Empresas
(genera credenciales admin_empresa para cualquier empresa del sistema, saltandose el flujo
normal de auto-creacion), Todos los usuarios (tabla global de TODOS los usuarios de TODAS las
organizaciones). Es el unico rol que ve todas las organizaciones a la vez.

### Portal Empresa (renderPortalEmpresa, lineas 55306-56370)

Portal de autoservicio para la empresa cliente, dos modos: modo trabajador/simple (login por
NIT o codigo, solo ve conceptos de aptitud) y modo administrador de empresa (panel de gestion
donde el admin de la empresa crea sus propios medicos/secretarias/ve sedes). CONFIDENCIALIDAD
VERIFICADA EN EL CODIGO: en ninguna parte de esta funcion se renderiza diagnostico, CIE-10,
hallazgos clinicos detallados, notas de evolucion ni antecedentes - solo concepto de aptitud,
cargo, fecha, y documentos administrativos ya generados. Mensaje legal explicito repetido en
login y footer: diagnosticos clinicos confidenciales, no disponibles (Art.16 Res. 1843/2025).

Diferencia de filtro segun submodo: portal simple solo muestra HC con estadoHistoria Cerrada;
panel admin de empresa muestra TODOS los pacientes no archivados (incluye HC en proceso).
Autenticacion del admin de empresa via SHA-256 simple, mas debil que el PBKDF2 usado para
cuentas de medico/organizacion - posible inconsistencia de seguridad. Descargas en lote
(certificados, formulas, derivaciones, examenes, interconsultas, informe epidemiologico)
generadas client-side via iframe oculto mas html2canvas mas jsPDF, empaquetadas en ZIP.

---

## 18. Modal Evolucion, Overlay Mensajes, Carta de Custodia, Router principal (lineas 56373-61556)

### Modal de Evolucion (renderEvolucionModal, lineas 56373-57312)

Modal global (montado al final del arbol, visible desde cualquier vista) de evolucion
clinica/seguimiento de un paciente con HC ya cerrada. 7 tabs internos (nota, diagnosticos,
plan, formula, examenes, incapacidad, concepto medico). guardarEvolucion hace merge por id en
patientsList (no reemplazo total), pero persiste SOLO a localStorage dentro de esta funcion -
la sincronizacion a D1/Supabase depende del autosave general de la HC. Permite expedir un
nuevo certificado con nuevo codigo vinculado al original.

### Overlay de Mensajes (renderMensajesOverlay, lineas 57314-57608)

Panel flotante de mensajeria interna. Solo admin compone mensajes nuevos. Persistencia
(saveMensajes): clave siso_mensajes, reemplazo TOTAL del array (no merge por id) via _sync
mas Supabase.

### Carta de Custodia (renderCartaCustodia, lineas 57814-57829)

Wrapper delgado que delega toda la logica a un componente externo CartaCustodia, sin logica
propia en este archivo. Cuando se genera desde el modal de Envio Integral, se guarda tambien
en clave dedicada siso_cartas_custodia con deduplicacion por empresa mas periodo (merge, no
reemplazo ciego).

### Router Principal (renderCurrentView, lineas 57831-59576)

Router tipo cadena if/else con 27 valores de view mapeados explicitamente (login, dashboard,
superadmin, planes, portaltrabajador, portalempresa, habeasdata, arl, sve, telemedicina,
agenda, asistencia, patients, changePassword, companies, reporte, bill, verification, users,
portafolio, caja, perfilips, contabilidad, cotizaciones, propuestas, custodia, analisis_docs,
billing_v2, historia), mas fallback final a renderLogin para cualquier valor no reconocido.

view igual a historia no delega a una unica funcion sino que arma un layout inline que
selecciona contenido segun tipo de HC (ocupacional/general) y tab activo, incluyendo un
certificado de incapacidad inline y un flujo de "orden medica" con 4 documentos imprimibles
independientes solo para HC general.

Vistas analisis_docs y billing_v2 instancian componentes externos completos directamente
desde el router (patron distinto al resto), con acceso directo expuesto al worker D1
(_workerGet, _workerSet) via props.

### Modales globales y cierre del archivo (lineas 59577-61556)

Tras el router, se montan modales globales sin importar la vista activa: post-cierre de HC,
seleccion de fecha de cierre retroactivo, overlay de mensajes, modal de Envio Integral (por
empresa, escribe merge no destructivo en la clave de documentos del portal por NIT), config de
email, notificaciones, RIPS, backup, alertas/confirmaciones genericas, eleccion de tipo de HC
desde agenda, modal de evolucion, agendar en bloque desde encuesta, vista de secretaria
restringida a datos administrativos, config de IA, carga masiva de examenes, historial
clinico por documento, DOS modales de "Diagnostico de Nube" aparentemente solapados
(posible duplicacion o resto de refactor previo, digno de revisar), reporte de sincronizacion,
paneles de checklist de restricciones/recomendaciones, monitor de salud de almacenamiento con
auto-limpieza, y un watcher de cambios remotos de otros dispositivos que aplica merge por
id/NIT/token (nunca reemplazo total, con comentarios explicitos de un fix que antes hacia
reemplazo total y borraba datos locales no sincronizados aun).

El archivo cierra exportando el componente App envuelto en un ErrorBoundary mas un
VersionWatcher alrededor del componente principal AppInner. No hay ReactDOM.render en este
archivo (vive en otro archivo de entrada del proyecto).

---
