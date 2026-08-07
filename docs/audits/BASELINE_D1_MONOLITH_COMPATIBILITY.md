# Baseline — Compatibilidad de datos Monolito ↔ Refactor

**Fecha:** 2026-08-07
**Fase:** 0 (inventario, sin cambios de código) + 0.5 (contrato HTTP del Worker, solo lectura)
**Autor:** auditoría automatizada (Claude Code)

## 0. Identificación de repositorios y estado

| | Monolito (solo lectura) | Refactor (único modificable) |
|---|---|---|
| Carpeta | `C:\Users\JQK3\ocupasaludparadesplegar` | `C:\Users\JQK3\siso-appultimo` |
| Remote | `github.com/drjuliancucalon-droid/ocupasaludparadesplegar` | `github.com/drjuliancucalon-droid/siso-appultimo` |
| Rama | `main` | `main` |
| HEAD (SHA completo) | `1b268b4a0fa1d2c1c06e4f4fae7130926cd008c3` | `a8d3113ca5915feadf8784f98ddd7828eec55817` |
| `git status --short` al iniciar | limpio | limpio |
| `git status --short` al terminar | limpio | *(ver §9)* |
| `git diff --exit-code` monolito | `0` (sin cambios) | — |

⚠️ **Nota de higiene fuera de alcance, no tocada:** `C:\Users\JQK3` (la carpeta personal del usuario) es *en sí misma* la raíz de un tercer repositorio git, con remote `siso-appultimo` **y un Personal Access Token embebido en texto plano** en `.git/config`. No es la carpeta de trabajo del refactor — el repo real y correctamente delimitado es `C:\Users\JQK3\siso-appultimo` (su propio `.git`, remote sin token). Esta auditoría trabajó exclusivamente en ese subdirectorio. Se recomienda revocar ese token y limpiar esa URL cuanto antes (ya reportado al usuario en la sesión anterior); no se modificó nada de eso aquí.

---

## 1. Hallazgo central (léase antes que el resto del documento)

**El refactor, tal como está hoy, NO se conecta al Worker `siso-api` ni a D1 en ningún punto del código.** Se buscó la cadena `siso-api` en todo `src/` y `backend/`: **cero resultados**.

En su lugar, el refactor tiene una arquitectura propia de tres capas por endpoint (`useBackendData`/`useSaveData` → `src/hooks/*`):

```
1) Backend propio (Express, carpeta backend/) — JWT, solo si isLocalAuth=false
2) Supabase DIRECTO (mismo proyecto y tabla que el monolito, ver §2)
3) localStorage (último recurso)
```

El monolito, en cambio, es **D1-autoritativo**: escribe a D1 primero, y trata a Supabase como *backup best-effort* que explícitamente **nunca** usa como fuente de lectura para no pisar datos más nuevos (comentario textual en el propio código, `src/utils/syncManager.js`):

> `// FIX 2026-06-05: D1 AUTORITATIVO en sync periódico ... SB queda como backup de escritura pero NUNCA como fuente de lectura para sobrescribir local.`

Es decir: **hoy no hay compatibilidad bidireccional real vía D1** (el mecanismo que asume la misión), sino una compatibilidad *parcial, unidireccional y no confiable* vía Supabase, descrita en el §2. La misión pide construir el contrato D1 (Fase 1+) partiendo de cero en el refactor, no "corregir" un cliente D1 existente — porque no existe ninguno.

---

## 2. El canal que sí comparten hoy: Supabase `siso_store` (y por qué no es seguro)

Se confirmó **la misma URL de proyecto y la misma clave pública** en ambos repos:

```
https://yqrrktrgoijgzccrxnpz.supabase.co
sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7
```

Monolito: `src/App.jsx:977` (`_SB_URL`) — usado como *backup*, nunca como lectura primaria.
Refactor: hardcodeado como *default* en 8 archivos (`useBackendData.js`, `useSaveData.js`, `BackupPage.jsx`, `CartaCustodiaPage.jsx`, `SettingsPage.jsx`, etc.) — usado como **fuente primaria de lectura y escritura** cuando no hay JWT del backend propio.

### Por qué este canal ya es responsable de pérdida/divergencia de datos, con evidencia de esta misma sesión de trabajo sobre el monolito:

- El monolito reportó repetidamente en producción (sesión previa, misma consola): `[_workerSet] verify-after-write falló`, `POST .../rest/v1/siso_store 500 (Internal Server Error)` y escrituras de respaldo a Supabase omitidas quirúrgicamente cuando el array local está vacío (guardia anti-borrado agregada recién, commit `9622d36`) — es decir, el propio equipo del monolito ya tuvo que blindarse contra que su backup a Supabase falle o llegue vacío.
- **Consecuencia para el refactor:** si el refactor lee `siso_store` como fuente primaria, puede estar leyendo una copia **atrasada o incompleta** de lo que realmente existe en D1 (la fuente de verdad real), sin ningún indicio visual de que está desactualizada.

- `src/hooks/useSaveData.js` (refactor), al no encontrar backend propio, hace: `GET siso_store?key=eq.<key>` → **merge en el cliente** (por `docNumero` o `id`) → `POST siso_store` con `Prefer: resolution=merge-duplicates` reemplazando el `value` completo de esa fila.
  - Esto escribe **solo en Supabase**, nunca en D1. El monolito no lo verá jamás por su propia lectura primaria (D1).
  - Peor: si el monolito hace después uno de sus backups periódicos a Supabase de esa misma clave (`_sbSet`), con su propio array — que no conoce el registro agregado por el refactor — **puede sobrescribir y borrar silenciosamente lo que el refactor acababa de guardar en Supabase**, porque ninguno de los dos sistemas hace merge consciente del otro.

- **Bug adicional encontrado en el mismo archivo:** la lectura en `useBackendData.js:106` asume que `rows[0].value` siempre es un array (`Array.isArray(rows[0].value) ? rows[0].value : []`). Para claves cuyo esquema canónico es un **objeto**, no un array — el caso explícito que la misión ya advierte para `siso_portal_empresa_docs_<nit>` (`{nit, nombre, codigoAcceso, periodos:[...]}`) — esta lectura devolvería silenciosamente `[]`, vaciando en apariencia toda la información de la empresa en el refactor aunque en Supabase/D1 esté intacta. **No se encontró en el refactor ningún uso actual de `siso_portal_empresa_docs_*`** (no forma parte del `keyMap` de `useBackendData.js`), así que este bug concreto hoy no se dispara — pero es la primera trampa que hay que evitar al implementar Fase 4.

### Hallazgo P0 adicional: mapeo de claves hardcodeado a un solo usuario

En `useBackendData.js`, el `keyMap` traduce endpoints a claves D1 **literales, no parametrizadas por sesión**:

```js
'/data/patients': 'siso_patients_drcucalon',
'/data/companies': 'siso_companies_drcucalon',
```

Es decir: el modo "Supabase directo" del refactor **solo funciona correctamente para el usuario `drcucalon`**. Cualquier otro médico/usuario/empresa que inicie sesión en el refactor y caiga a este modo leerá/escribirá sobre las claves de `drcucalon`, no las suyas. El monolito, en cambio, deriva el sufijo dinámicamente por sesión (`currentUser?.user`, con prefijo `empresa_<id>` para cuentas de empresa — ver §4). Esto es consistente con que el refactor fue construido/probado contra una sola cuenta real.

---

## 3. Inventario de claves D1 (`siso_*`)

### 3.1 Monolito — familias canónicas confirmadas en código (171 literales/patrones únicos, agrupados)

| Familia | Patrón de sufijo observado en `src/App.jsx` | Notas |
|---|---|---|
| `siso_patients_<suf>` | `uid`, `userId`, `sessionUser`, `_loginUid`, `patSuf` (**no siempre el mismo derivador**, ver §4) | lista "primaria" (autosave-friendly) |
| `siso_db_patients_<suf>` | igual variedad de sufijos | lista "secundaria/legacy", único respaldo LS real (ver informe de sesión anterior) |
| `siso_companies_<suf>` + `siso_companies_shared` | igual | doble escritura primaria + respaldo compartido |
| `siso_agendados_<suf>` | `_agMedicoKey`, `_agSuf`, `_asSuf`, `_bkSuf`, `_hcSuf`, `_initSuf`, `_storageUserId`, `uid` | **9 derivadores distintos** de sufijo para la misma familia — riesgo de fragmentación ya conocido en el propio monolito (mismo patrón que causó la fragmentación por NIT documentada en la sesión anterior, `[[worker_compartido_refactor]]`) |
| `siso_caja_<suf>` / `siso_caja_movs_<suf>` | `_cajaSuf`, `_storageUserId`, `_loginSuf`, `_u`, `suffix`, `suf` | igual patrón de múltiples derivadores |
| `siso_saved_bills_<suf>` | `_asSuf`, `_billSuf`, `_bkSuf`, `_initSuf`, `_loginSuf`, `_storageUserId`, `bkSuf`, `suffix`, `suf` | **9 derivadores** — la clave con más variantes de sufijo detectadas |
| `siso_informes_<suf>` | `_infSuf`, `_informesSuf`, `_loginUid`, `_u`, `uid`, `userId` | ligado al loop de `verify-after-write` reportado en la sesión anterior |
| `siso_cartas_custodia_<suf>` | `_custSuf`, `_informesSuf`, `_loginUid`, `uid`, `userId` | |
| `siso_encuestas_<suf>` | `_encSuf`, `_loginUid`, `_u`, `uid` | + clave global `siso_encuestas` |
| `siso_hc_completa_<documento>` | por número de documento, no por usuario | historia clínica individual |
| `siso_hc_completa_codigo_<código>` | por código de acceso del paciente | |
| `siso_portal_<código>` | por código de acceso | |
| `siso_portal_doc_<documento>` | por número de documento | **una sola copia por persona** — un segundo certificado sobreescribe el primero (limitación ya conocida, no resuelta) |
| `siso_portal_empresa_<nit>` | NIT limpio (solo dígitos) | |
| `siso_portal_empresa_atenciones_<nit>` | NIT limpio | |
| `siso_portal_empresa_docs_<nit>` | NIT limpio | **objeto**, no array — ver §2 y regla de la misión |
| Globales sin sufijo de usuario | `siso_users`, `siso_agendados`, `siso_encuestas`, `siso_audit_log`, `siso_mensajes`, `siso_ai_config_provider`, `siso_atenciones_cerradas`, `siso_arl_reportes`, `siso_cotizaciones`, `siso_custom_meds`, `siso_orgs_list`, `siso_saved_reports`, `siso_privacidad_aceptada`, `siso_teleconsultas`, `siso_portafolio`, `siso_habeas_requests`, `siso_pending_d1_writes` (solo cliente, no D1), `siso_store` (nombre de la tabla D1, no una clave) | |

Lista cruda completa (171 líneas, con todas las variantes de variable de sufijo tal como aparecen literalmente en el código) disponible para consulta en el historial de comandos de esta auditoría; no se transcribe entera aquí por ser mayormente ruido de nombres de variable repetidos.

### 3.2 Refactor — claves `siso_*` referenciadas hoy (89 literales únicas)

La mayoría coincide con el monolito **en la parte fija**, pero varias tienen **drift de nombre** que no tiene equivalente literal en el monolito y por tanto **nunca conectarán con datos reales de producción** aunque se implemente el Worker correctamente:

| Clave en refactor | ¿Existe literal equivalente en monolito? | Riesgo |
|---|---|---|
| `siso_pacientes` (`src/hooks/useCompanies.js` u otro — grep genérico) | ❌ No — el monolito usa `siso_patients_`/`siso_db_patients_`, nunca `pacientes` | P1 — módulo fantasma, nunca verá datos reales |
| `siso_caja_movimientos` | ❌ No — monolito usa `siso_caja_movs_<suf>` | P1 |
| `siso_billing_v2` | ❌ No tiene equivalente — parece exclusivo del refactor | P2 — confirmar si es intencional (feature nueva) o resto de un experimento |
| `siso_offline_db` | ❌ No es una clave D1 — es el nombre de la base IndexedDB local, capturado por el grep genérico | Falso positivo, no requiere acción |
| `siso_condiciones_inseguras`, `siso_evoluciones_` | Sin verificar contra el monolito completo (módulos SGSST/clínicos) | P2 — revisar en Fase 6 |
| `siso_agenda`, `siso_bills`, `siso_atenciones` (sin sufijo, como *localStorageKey* de fallback en `useBackendData`) | Coexisten con las claves "reales" (`siso_agendados_drcucalon`, `siso_saved_bills_drcucalon`) como claves de **caché local**, no de D1 | Correcto si se documenta que son solo caché — confirmar que ningún código las trata como fuente de verdad |
| El resto (`siso_patients_drcucalon`, `siso_companies_drcucalon`, `siso_users`, `siso_agendados`, `siso_atenciones_cerradas`, `siso_encuestas`, `siso_cotizaciones`, `siso_custom_meds`, `siso_privacidad_aceptada`, `siso_teleSala`, `siso_teleEspera`, `siso_teleconsultas`, `siso_portafolio`, `siso_sgsst_drcucalon`, `siso_ips_perfil`, `siso_orgs`, `siso_ai_config_provider`, `siso_doctor_signature`, `siso_email_config`, `siso_audit_log`, `siso_rl_login`, `siso_habeas_data_requests`, `siso_atl_cases`) | ✅ Sí, coinciden literalmente | Compatibles en nombre — pendiente compatibilidad de esquema (Fase 2) |

---

## 4. Diferencias en el cálculo de `userId`

**Monolito:** no existe una única función `normalizeUserId`. El sufijo de clave se deriva de forma **ad-hoc en cada sitio de llamada**, con al menos 3 patrones distintos observados:

```js
// Patrón A — el más común
const uid = currentUser?.user || "shared";   // o "drcucalon", o "default" según el sitio

// Patrón B — cuentas de empresa con prefijo especial
const _suid = currentUser?.empresaId
  ? "empresa_" + currentUser.empresaId
  : currentUser?.user || "shared";

// Patrón C — sufijos con nombre propio por dominio (_asSuf, _bkSuf, _cajaSuf, _billSuf...)
// cada uno con su propia lógica de fallback, no siempre idéntica entre sí
```

Esto es una inconsistencia **ya existente dentro del propio monolito**, no introducida por el refactor. Cualquier `normalizeUserId` que se diseñe en Fase 1 debe replicar el patrón B (prefijo `empresa_<id>` para cuentas de empresa) como mínimo, o se romperá la compatibilidad de lectura para todas las cuentas de tipo empresa. Los fallbacks inconsistentes (`"shared"` vs `"drcucalon"` vs `"default"`) son un riesgo P2 a documentar, no a "corregir" unilateralmente sin evidencia de cuál es el correcto en cada caso.

**Refactor:** `authStore.js` usa `username`/`isLocalAuth`; el mapeo real a clave D1 en `useBackendData.js` **ignora el usuario logueado** y usa el literal `drcucalon` (ver hallazgo P0 en §2). No hay lógica de prefijo `empresa_<id>` en ningún punto del código explorado.

**Conclusión:** `normalizeUserId` propuesto en la misión (`user?.username ?? user?.userId ?? user?.id ?? user?.email`) **no es compatible tal cual** con el patrón real del monolito — falta el caso `empresaId` → prefijo `empresa_`. Debe ampliarse antes de usarse, documentando la decisión como pide la misión.

---

## 5. Mapa de compatibilidad por dominio

| Dominio | Monolito lee/escribe | Refactor lee/escribe hoy | Compatible hoy? |
|---|---|---|---|
| Pacientes | D1 directo (`siso_patients_<uid>` + `siso_db_patients_<uid>`, doble escritura con merge anti-regresión) | Supabase directo (`siso_patients_drcucalon` fijo) o backend propio | ❌ No — usuario fijo, sin D1, sin merge anti-regresión |
| Empresas | D1 directo + `siso_companies_shared` | Supabase directo (`siso_companies_drcucalon` fijo) | ❌ No |
| Agenda | D1, 9 derivadores de sufijo distintos | Supabase directo (`siso_agendados_drcucalon`) | ❌ No |
| Facturas/cuentas de cobro | D1, guardia anti-borrado reciente (commit `9622d36`) | Supabase directo, `useSaveData` con merge cliente propio (ver riesgo §2) | ❌ No |
| Caja | D1 | `siso_caja_movs_drcucalon` + posible `siso_caja_movimientos` divergente (ver §3.2) | ❌ No |
| Informes | D1, con bug conocido de reintento infinito (`verify-after-write`) | Supabase directo | ⚠️ Parcial — mismo nombre de clave pero mismo riesgo de datos atrasados |
| Encuestas | D1 | Supabase directo, mismo nombre | ⚠️ Parcial |
| Cartas de custodia | D1, bug de mes/firma corregido recientemente (commit `9622d36`) | `CartaCustodiaPage.jsx` usa Supabase directo | ⚠️ Parcial |
| Portal empresa (documentos por NIT) | D1, esquema objeto (`{nit,nombre,codigoAcceso,periodos}`) | **No implementado** en el `keyMap` de `useBackendData.js` | ❌ No existe todavía en el refactor |
| Historia clínica completa | D1 por documento (`siso_hc_completa_<doc>`) | No localizado en el `keyMap` explorado | ❌ No existe todavía |

---

## 6. Riesgos clasificados

### P0 — bloquean cualquier compatibilidad real, deben resolverse antes de escrituras bidireccionales
1. El refactor no tiene ningún cliente D1/Worker — toda la Fase 1 debe construirse desde cero, no "adaptar" código existente.
2. El mapeo de claves del refactor está hardcodeado a un único usuario (`drcucalon`) — cualquier otra cuenta corrompe o pierde de vista sus propios datos.
3. `useSaveData.js` escribe en Supabase con merge-en-cliente basado en una copia potencialmente atrasada (Supabase no es fuente de verdad del monolito) — riesgo de que escrituras del refactor queden invisibles para el monolito, y de que un backup posterior del monolito a Supabase las borre silenciosamente.
4. No existe en el refactor ningún tratamiento especial para `siso_portal_empresa_docs_<nit>` como objeto — el primer código que la toque debe implementar `mergePortalCompanyPeriod` desde cero (ya lo especifica la misión, Fase 4), no reutilizar `useSaveData` genérico.

### P1 — afectan la calidad de la migración pero no corrompen datos por sí solos
5. Claves con drift de nombre en el refactor sin equivalente en el monolito (`siso_pacientes`, `siso_caja_movimientos`) — módulos que hoy nunca verán datos reales de producción.
6. El monolito mismo tiene hasta 9 derivadores de sufijo distintos para una misma familia de claves (agenda, cuentas de cobro) — cualquier `storageContract.js` del refactor debe decidir explícitamente a cuál replicar como canónico, con evidencia, no promediar/inventar uno nuevo.
7. Fallbacks de `userId` inconsistentes en el propio monolito (`"shared"` / `"drcucalon"` / `"default"` según el sitio).
8. `useBackendData.js:106` asume que todo valor de `siso_store` es array — se rompería en silencio el día que se conecte una clave de esquema objeto sin el adaptador correspondiente.

### P2 — mejoras/observaciones, sin urgencia
9. `siso_billing_v2`, `siso_condiciones_inseguras`, `siso_evoluciones_` — confirmar si son features nuevas intencionales del refactor (SGSST/Telemedicina, Fase 6) o resabios de una migración anterior sin terminar.
10. El backend Express propio del refactor (`backend/`, con su propio JWT y cliente Supabase) es una tercera arquitectura no contemplada explícitamente en la misión original — se recomienda decidir su rol futuro (¿se conserva como proxy hacia el Worker? ¿se retira?) antes de Fase 5, porque hoy compite como fuente de verdad con el modo "Supabase directo" del propio refactor.

---

## 7. Archivos que se modificarían en Fase 1 (propuesta, sin implementar aún)

- **Nuevo:** `src/shared/data/storageContract.js` — claves canónicas + `normalizeUserId` (ampliado con el caso `empresaId`, ver §4), `normalizeNit`, `normalizeDocument`.
- **Sin tocar todavía:** `src/hooks/useBackendData.js`, `src/hooks/useSaveData.js`, `src/lib/apiClient.js` — se dejan intactos hasta Fase 2 (lectura) para no romper lo que hoy funciona en producción del refactor mientras se construye el contrato en paralelo.
- **Sin tocar todavía:** `backend/**` — su rol se decide en Fase 5+, no en Fase 1.

No se creará ni modificará ningún archivo del monolito ni del Worker en ningún punto de este plan.

---

## 8. Resumen ejecutivo para decisión

El supuesto de partida de la misión ("el refactor debe usar el Worker productivo actual") **no describe el estado real del código**: hoy el refactor no lo usa en absoluto, y el canal que sí comparte con el monolito (Supabase `siso_store`) es explícitamente *no autoritativo* incluso para el propio monolito, y además el refactor lo usa con un usuario hardcodeado. Antes de construir el contrato D1 (Fase 1), vale la pena decidir explícitamente si:

(a) se construye el cliente D1/Worker desde cero en el refactor (ruta que sigue la misión tal como está escrita), o
(b) se prioriza primero apagar el modo "Supabase directo con usuario fijo" del refactor (fuente activa de confusión/pérdida hoy) antes de sumar una tercera vía de datos.

Ambas son compatibles con las fases de la misión; (b) es más rápida de mitigar el riesgo P0 #2/#3 mientras se construye (a) en paralelo.

---

## 9. Confirmación final

- ❌ **NO** se modificó ningún archivo dentro de `../ocupasaludparadesplegar/**`. Verificado con `git -C ../ocupasaludparadesplegar status --short` (vacío) y `git diff --exit-code` (código de salida `0`, sin diferencias) antes y después de esta auditoría.
- ❌ **NO** se ejecutó `wrangler deploy` ni ningún comando de escritura contra el Worker de producción o D1.
- ❌ **NO** se creó ninguna rama, commit ni cambio de código de negocio en el refactor durante esta fase — únicamente este documento y el directorio `docs/audits/` que lo contiene.
- Todos los comandos ejecutados contra ambos repositorios fueron de solo lectura (`git status`, `git log`, `git diff --exit-code`, `git rev-parse`, `grep`, `find`, `cat`, `ls`).

**Fin de Fase 0.** Continúa en Fase 0.5 (§10 en adelante) antes de cualquier aprobación de Fase 1.

---

## 10. Fase 0.5 — Contrato HTTP del Worker de Producción

Evidencia leída directamente del código fuente real del Worker, encontrado dentro del propio monolito (no en `siso-appultimo/siso-worker/**` como suponía la misión — no existe tal carpeta en el refactor):

```
../ocupasaludparadesplegar/siso-worker/index.js       (implementación completa, 672 líneas)
../ocupasaludparadesplegar/siso-worker/schema.sql     (esquema D1)
../ocupasaludparadesplegar/siso-worker/wrangler.json  (config, sin secretos)
../ocupasaludparadesplegar/functions/_middleware.js   (inyección del token al HTML)
```

Todo lo que sigue es lectura de estos 4 archivos — cero suposiciones.

### 10.1 URL de API

```
https://siso-api.dr-juliancucalon.workers.dev
```

Cloudflare D1 binding: `DB` → base `siso-db` (`database_id` visible en `wrangler.json`, no es secreto). Tabla única: `siso_store (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT)`.

### 10.2 Endpoints, métodos y parámetros

| Método | Ruta | Parámetros | Descripción |
|---|---|---|---|
| `OPTIONS` | cualquiera | — | Preflight CORS, `204` |
| `GET` | `/store/:key` | query `?raw=1` (opcional) | Una clave. `raw=1` evita el `JSON.parse` del lado del servidor (el cliente parsea) — usado para piezas grandes que si no dan 503 por CPU-timeout del free tier |
| `GET` | `/store/prefix/:prefix` | — | Todas las claves que empiezan por el prefijo, **excluye** piezas de chunk (`__cN`, `__new*`, formato legacy `_chunk_N_of_M`), `LIMIT 2000`, siempre `_raw:true` |
| `GET` | `/store` | query `?userId=` (opcional) | Todas las claves, o filtradas por `LIKE '%_<userId>' OR LIKE '%_<userId>_%'` (match de subcadena, no exacto — ver riesgo P2 abajo), `LIMIT 2000` |
| `POST` | `/store` | body `{key,value}` o array de esos; header opcional `If-Match`/`X-Siso-If-Match` | Upsert. Fusión automática server-side para claves protegidas (§10.5). Optimistic concurrency solo si se manda `If-Match` Y el body es de una sola clave |
| `POST` | `/store/chunked` | body `{key, value}` | Escritura atómica troceada (transacción `env.DB.batch`), con la misma fusión server-side que `/store`. Es el método recomendado para valores >500KB |
| `POST` | `/store/append` | body `{key, item, idField?}` | Agrega/reemplaza UN elemento dentro de un array, fusión hecha en el servidor — evita la carrera read-modify-write de clientes concurrentes. **No requiere leer el array completo antes de escribir** |
| `GET` | `/health` | query `?full=1` (opcional) | Ping barato por defecto (`SELECT 1`); con `?full=1` cuenta filas por familia de clave (caro, limitar su uso) |
| `DELETE` | `/store/:key` | — | Borrado directo, **sin ninguna protección ni fusión** — ver riesgo P0 en §10.6 |
| `POST` | `/snapshot`, `/cleanup` | — | Mantenimiento/administración, no relevantes para lectura de dominio |
| `GET` | `/snapshot/list`, `/storage-stats` | — | Monitoreo |

### 10.3 Encabezados (nombres, sin valores)

| Header | Uso |
|---|---|
| `X-Siso-Token` | **Obligatorio en toda request** (excepto `OPTIONS`). Comparado con `env.SISO_TOKEN` del Worker; si falta o no coincide → `401`. Es un secreto único y compartido — no hay scopes ni por-usuario (ver §10.6). |
| `Content-Type: application/json` | En todo `POST` |
| `If-Match` o `X-Siso-If-Match` | Opcional, solo aplica en `POST /store` de una sola clave — valor esperado: el `updated_at` (`ts`) que la clave tenía la última vez que se leyó |

### 10.4 Formato de respuesta por endpoint

```jsonc
// GET /store/:key  (existe)
[{ "key": "...", "value": <any>, "ts": "2026-08-07 12:00:00" }]
// GET /store/:key  (NO existe) — 200 OK, NO 404
[]
// GET /store/:key?raw=1
[{ "key": "...", "value": "<json-string-sin-parsear>", "ts": "...", "_raw": true }]

// GET /store/prefix/:prefix
[{ "key": "...", "value": "<string, siempre _raw>", "_raw": true }, ...]

// GET /store
[{ "key": "...", "value": "<string, _raw>", "updated_at": "...", "_raw": true }, ...]

// POST /store (éxito)
{ "ok": true, "count": <n> }
// POST /store (conflicto If-Match, solo escritura de 1 clave)
// status 409, header extra X-Siso-Current-Ts
{ "ok": false, "error": "etag_mismatch", "currentTs": "...", "expectedTs": "..." }

// POST /store/chunked
{ "ok": true, "chunks": <n>, "hash": "<h1>_<h2>" }

// POST /store/append
{ "ok": true, "count": <n> }  // tamaño del array resultante

// DELETE /store/:key
{ "ok": true }

// Cualquier excepción no controlada
// status 500
{ "error": "<mensaje de la excepción>" }

// Ruta no reconocida
// status 404
{ "error": "Not found" }
```

**Importante — `GET /store/:key` en un valor inexistente devuelve `200 OK` con `[]`, NUNCA `404`.** Cualquier cliente (incluido el futuro `workerStoreClient.js` del refactor) debe distinguir "clave no existe" (`array vacío`) de "la request falló" (excepción/status≥400) — el monolito ya tuvo que resolver esta ambigüedad explícitamente con una función dedicada (`_workerGetChecked`, ver commit de sesión anterior) porque conflacionarlas causó un incidente real de pérdida de datos.

### 10.5 Cómo se detectan y recuperan valores chunked

- Un valor troceado se guarda como: `<key>__c0`, `<key>__c1`, ..., `<key>__cN-1` (piezas de 500KB de texto) + `<key>__meta` = `{chunked:true, count, totalBytes, hash, ts}`. La clave base (`<key>` sin sufijo) se **borra** en la misma transacción — su ausencia es la señal de "esta clave está chunked, ve a `__meta`".
- El hash es determinista (`h1` base-31 + `h2` base-127×31 sobre el JSON serializado completo) — el mismo algoritmo que usa el monolito en cliente (`_hash64`) para verificar integridad tras escribir.
- La reconstrucción (lectura de todas las piezas + concatenación + `JSON.parse`) **la hace el cliente**, no el servidor, excepto dentro de `_mergeProtegido` (el servidor sí reconstruye internamente cuando necesita comparar contra lo viejo antes de fusionar — ver §10.6).
- `GET /store/prefix/:prefix` excluye explícitamente las piezas (`__cN`, `__new*`) de sus resultados — un consumidor que liste por prefijo nunca las verá sueltas, solo el `__meta`.

### 10.6 Hallazgo que corrige el riesgo P0 #3/#4 de la Fase 0

**El servidor YA implementa la fusión protegida que la misión pedía construir en el cliente (Fase 4).** Existe una whitelist server-side:

```js
const _PROTECTED = /^siso_(db_)?patients_|^siso_atenciones|^siso_hc_|^siso_encuestas|^siso_companies|^siso_cartas_custodia|^siso_saved_reports|^siso_informes|^siso_users|^siso_portal_empresa_docs|^siso_portal_empresa_atenciones/;
```

- Para **arrays**: fusión por `id` (o `token` si `id` es null, caso encuestas) — lo entrante gana por-id, lo que ya existía en D1 y el entrante no menciona **se preserva**, nunca se pierde por un cliente con vista parcial. Se aplica igual en `POST /store` y `POST /store/chunked`.
- Para **`siso_portal_empresa_docs_<nit>`** (el objeto `{nit,nombre,codigoAcceso,periodos:[...]}` que la misión marca como caso especial): fusión por `periodo`, preservando `informe`/`cuenta`/`custodia`/`certificados` de un periodo existente cuando el entrante trae ese campo en `null`. Esto es **exactamente** el comportamiento que la misión pedía implementar en `portalCompanyDocsRepository.js` (Fase 4) — ya existe, en el servidor, hoy.
- **Consecuencia práctica:** si el futuro `workerStoreClient.js` del refactor escribe usando los nombres de clave canónicos correctos (`siso_patients_<uid>`, `siso_portal_empresa_docs_<nit>`, etc.) contra `POST /store` o `POST /store/chunked`, obtiene la protección anti-pérdida **gratis**, sin tener que reimplementar el merge en el cliente. El trabajo de Fase 4 se reduce a: (a) usar las claves correctas, (b) enviar los `id`/`periodo` correctos para que el merge del servidor los reconozca, (c) no usar `DELETE` sobre estas claves (§ siguiente).

**Riesgo P0 que sí sigue vigente — `DELETE /store/:key` no tiene ninguna protección**, ni siquiera para claves de la whitelist `_PROTECTED`. Borra la fila entera sin fusión, sin confirmación, sin importar el key pattern. `workerStoreClient.js` **no debe exponer un método `delete()` genérico** para dominios compartidos sin una capa explícita de confirmación/autorización aparte.

**Riesgo P1 — `LIMIT 2000` en `GET /store` y `GET /store/prefix/:prefix`, sin paginación.** El propio `/health` de producción (consultado en la sesión de trabajo anterior sobre el monolito) reportó `"total":2823` claves — **ya por encima del límite de 2000**. Cualquier consumidor (monolito, refactor, o esta misma auditoría en el futuro) que use `GET /store` sin filtrar por prefijo/userId recibe hoy una lista **truncada silenciosamente**, sin ningún indicador de que faltan filas. `GET /store/prefix/siso_portal_doc_` por sí sola ya tiene 423 registros (`portal_docs` en `/health`) y `siso_hc_completa_` 899 — ninguna familia individual choca el límite todavía, pero un listado global sí.

**Riesgo P2 — filtro `?userId=` en `GET /store` usa `LIKE` de subcadena, no coincidencia exacta.** `WHERE key LIKE '%_<userId>' OR key LIKE '%_<userId>_%'` — un `userId` que sea subcadena de otro (ej. `"ana"` dentro de `"diana"`) devolvería filas ajenas. No se encontró evidencia de que esto se explote hoy, pero es una función a evitar/blindar en `workerStoreClient.js`.

### 10.7 Códigos de respuesta

| Código | Cuándo | Cuerpo |
|---|---|---|
| `200` | Éxito, incluida una clave que no existe en `GET /store/:key` (devuelve `[]`, no 404) | según endpoint |
| `204` | `OPTIONS` (preflight) | vacío |
| `400` | `POST /store/chunked` sin `key` o `value` | `{ok:false, error:"key y value requeridos"}` |
| `401` | Header `X-Siso-Token` ausente o no coincide con `env.SISO_TOKEN` | `{error:"Unauthorized"}` |
| `404` | Solo cuando la **ruta** no existe (método+path no reconocidos) — nunca por "clave no encontrada" | `{error:"Not found"}` |
| `409` | `POST /store` de una sola clave con `If-Match` que no coincide con el `updated_at` actual | `{ok:false, error:"etag_mismatch", currentTs, expectedTs}` + header `X-Siso-Current-Ts` |
| `500` | Cualquier excepción no controlada (incluye errores de D1) | `{error: "<mensaje>"}` |

### 10.8 Política CORS

```js
const ALLOWED_ORIGINS = [
  "https://ocupasaludparadesplegar.pages.dev",
  "https://ocupasaludparadesplegar-f4q.pages.dev",
  "https://siso-appultimo-arp.pages.dev",   // ← el dominio de despliegue del REFACTOR ya está permitido
  "http://localhost:5173",
  "http://localhost:4173",
];
```

Más cualquier subdominio de vista previa bajo `*.ocupasaludparadesplegar.pages.dev`, `*.ocupasaludparadesplegar-f4q.pages.dev` y `*.siso-appultimo-arp.pages.dev`. **El Worker ya anticipa al refactor como consumidor** — el comentario en el propio código lo dice explícitamente: *"Refactor en desarrollo (siso-appultimo): comparte este mismo backend/D1 mientras se construye."* No hay ningún bloqueo CORS que resolver para que el refactor empiece a leer del Worker desde `localhost:5173` o desde su dominio de producción.

### 10.9 Seguridad del token — hallazgo P0 confirmado

`functions/_middleware.js` (Cloudflare Pages Function del monolito) inyecta el token así:

```js
window.__SISO_CONFIG.workerToken = "<SISO_TOKEN del entorno de Cloudflare Pages>";
```

en un `<script>` insertado antes de `</head>` de **toda respuesta HTML**, leyendo la variable de entorno cifrada `SISO_TOKEN` configurada en Cloudflare Pages. El propio comentario del archivo dice la intención: *"Mantiene credenciales FUERA del bundle JS (no visible en F12 → Sources)"*.

**Confirmación de la auditoría: esa mitigación es parcial, no total.** Es cierto que el token no queda en el JS versionado en git ni en `dist/assets/*.js` (no se puede extraer clonando el repo público). Pero **sí es legible en tiempo de ejecución por cualquier visitante** del sitio desplegado — es exactamente el mecanismo que se usó en la sesión de trabajo anterior sobre este mismo proyecto para leer `window.__SISO_CONFIG.workerToken` desde la consola del navegador y probar el Worker directamente. Es un **secreto único, compartido por todos los usuarios y sesiones**, sin expiración, sin scopes, con permisos de lectura **y escritura y borrado** sobre toda la base D1 — el Worker no distingue usuarios ni roles en absoluto; toda la autorización por usuario/rol vive en la lógica de cada app cliente (monolito o refactor), no en el Worker.

**Marca P0 de seguridad, tal como pide la misión: no replicar este patrón sin más para nada que no sea ya el mismo nivel de exposición que hoy existe.** Concretamente:
- Un cliente de **solo lectura** del refactor (Fase 2) que reutilice el mismo token no empeora el riesgo actual — el token ya circula así hoy vía el monolito, y el mismo dominio del refactor ya está en la allowlist CORS.
- Cualquier diseño futuro que dependa de este token para **autorizar operaciones sensibles diferenciadas por usuario/rol** (ej. "solo el admin puede borrar") es una falsa sensación de seguridad — el Worker no lo va a hacer cumplir; hay que seguir controlándolo 100% en la app cliente, igual que hoy.
- El refactor **no tiene hoy ningún `functions/_middleware.js` propio** (verificado: no existe la carpeta `functions/` en `siso-appultimo/`). Antes de que `workerStoreClient.js` pueda funcionar en el refactor desplegado, hay que crear ese mismo mecanismo de inyección server-side (o uno equivalente) — **nunca hardcodear el token directamente en el código fuente del refactor**, porque eso sí sería estrictamente peor que el estado actual (quedaría en el bundle JS versionado en git, visible para siempre en el historial).

### 10.10 Tabla: dominio → clave → derivador de identidad → lector monolito → lector objetivo refactor

| Dominio | Clave canónica (monolito) | Derivador de identidad usado hoy | Lee hoy en monolito | Lee hoy en refactor |
|---|---|---|---|---|
| Pacientes (primaria) | `siso_patients_<uid>` | `currentUser?.user \|\| "shared"` (o `empresa_<id>`) | D1 directo (`_workerGet`) | Supabase directo, **`<uid>` fijo en `"drcucalon"`** (`useBackendData.js`) |
| Pacientes (respaldo) | `siso_db_patients_<uid>` | igual | D1 directo + único respaldo real en `localStorage` | Supabase directo, `<uid>` fijo |
| Empresas | `siso_companies_<uid>` + `siso_companies_shared` | igual | D1 directo, doble escritura | Supabase directo, `<uid>` fijo; también vía `shared/lib/supabase.js` desde `useCompanies.js` |
| Agenda | `siso_agendados_<uid>` (9 derivadores distintos en monolito) | variable | D1 directo | Supabase directo (`siso_agendados_drcucalon`), también `AgendaSection.jsx` vía capa genérica |
| Cuentas de cobro | `siso_saved_bills_<uid>` | variable | D1 directo, guardia anti-borrado (commit `9622d36`) | Supabase directo, `<uid>` fijo |
| Caja | `siso_caja_movs_<uid>` | variable | D1 directo | `siso_caja_movs_drcucalon` (fijo) — posible drift con `siso_caja_movimientos` (ver Fase 0 §3.2) |
| Informes | `siso_informes_<uid>` | variable | D1 directo, bug conocido de reintento infinito | Supabase directo |
| Cartas de custodia | `siso_cartas_custodia_<uid>` (y `siso_cartas_custodia` global usada por el monolito en algún punto) | variable | D1 directo | `CartaCustodiaPage.jsx` lee/escribe `siso_cartas_custodia` (sin sufijo) directo a Supabase — **posible mismatch de nombre de clave, no solo de fuente** — requiere confirmación línea por línea en Fase 1, no asumir |
| Usuarios/credenciales | `siso_users` (global, sin sufijo) | — | D1 directo | `LoginPage.jsx` (lectura), `UsersPage.jsx`/`SettingsPage.jsx`/`ProfilePage.jsx` (**escritura** con upsert de array completo, sin merge contra remoto) — el de mayor sensibilidad porque son credenciales |
| Portal empresa docs | `siso_portal_empresa_docs_<nit>` | NIT limpio (`replace(/\D/g,'')`) | D1 directo, objeto con `periodos[]` | **No implementado en el refactor** (no está en el `keyMap` de `useBackendData.js`, no se encontró en `BackupPage.jsx`) |
| Historia clínica completa | `siso_hc_completa_<documento>` | número de documento | D1 directo | No localizado en el refactor |

### 10.11 Clasificación de las rutas de lectura/escritura Supabase del refactor

| Archivo | Tipo | Claves que toca | Clasificación |
|---|---|---|---|
| `src/hooks/useBackendData.js` | READ | `keyMap` fijo, 26 claves, `<uid>` hardcodeado a `drcucalon` | **Compartida, peligrosa** (usuario fijo — ver P0 §Fase 0) |
| `src/hooks/useSaveData.js` | WRITE | cualquier `supabaseKey` que le pase el caller — genérico | **Compartida, peligrosa** (merge en cliente sobre copia potencialmente atrasada, nunca toca D1) |
| `src/shared/lib/supabase.js` + `src/shared/lib/syncManager.js` | READ+WRITE | genérico (`_sbSet`/`_sbGetAll`/`_sbDelete`) — puerto casi idéntico del módulo homónimo del monolito | **Compartida, peligrosa** — usado por `useCompanies.js`, `usePatients.js`, `useSGSSTData.js`, `Telemedicine.jsx`, `AgendaSection.jsx`, `UsersSection.jsx`, `connectionStatus.jsx`. Requiere auditoría fila-por-fila en Fase 1 antes de habilitar escritura desde ninguno de estos 6 sitios |
| `src/pages/ProfilePage.jsx` | WRITE | `siso_users` (upsert del array completo `updated`, sin releer remoto primero) | **Compartida, peligrosa — máxima prioridad**: credenciales de acceso, riesgo de pisar altas/bajas de usuario hechas en el monolito |
| `src/pages/UsersPage.jsx`, `src/pages/SettingsPage.jsx` | READ+WRITE | `siso_users` | **Compartida, peligrosa** — mismo riesgo que arriba |
| `src/pages/CartaCustodiaPage.jsx` | READ+WRITE | `siso_cartas_custodia` (sin sufijo — confirmar si coincide con lo que usa el monolito) | **Compartida, peligrosa; posible mismatch de nombre** |
| `src/pages/BackupPage.jsx` | READ+WRITE | lista explícita `BACKUP_KEYS` con comentario propio *"Compatible con backups del monolito OcupaSalud"* — usa las claves canónicas correctas (`siso_patients_drcucalon`, etc.) y **solo escribe si el destino está vacío** (`Paso 5: escribir solo las claves vacías`) | **Compartida, pero es la más cuidadosa de las encontradas** — ya reconoce la compatibilidad de nombres y tiene guardia anti-sobrescritura. Buen punto de partida/referencia para Fase 1, no punto de riesgo |
| `src/pages/VerificacionPage.jsx` | READ | por clave exacta, portal de verificación pública de certificados | **Compartida, bajo riesgo** — solo lectura |
| `src/pages/LoginPage.jsx` | READ | `siso_users` | **Compartida, bajo riesgo** — solo lectura, es el mecanismo de autenticación |
| `src/components/modals/PortalPublicoTrabajador.jsx` | READ | `siso_portal_*`, con manejo explícito de RLS de Supabase (mensaje de error propio si falta la policy) | **Compartida, bajo riesgo** — solo lectura, ya contempla que Supabase necesita política RLS propia |
| `src/utils/supabase.js` | READ+WRITE | genérico, **no importado por ningún otro archivo** | **Código muerto** — confirmar y candidatear a eliminación en limpieza futura, no ahora |
| `src/data/planConfig.js`, `src/hooks/useAppState.js`, `src/lib/emailService.js`, `src/modules/clinical/components/AttachmentsTab.jsx`, `src/pages/DashboardPage.jsx`, `src/pages/PatientsPage.jsx`, `src/pages/BillingPage.jsx`, `src/pages/AgendaPage.jsx`, `src/pages/Planes.jsx` | **Incierta** | mencionan "supabase" en el grep inicial pero no se confirmó línea por línea si son llamadas propias, imports de los hooks ya clasificados arriba, o solo texto/comentarios | Pendiente de confirmación individual antes de Fase 1 — no asumir ninguna clasificación |

### 10.12 Diseño propuesto de `src/lib/workerStoreClient.js` (solo diseño — NO se crea el archivo en esta fase)

```js
// PROPUESTA — no implementado todavía
// Contrato mínimo, solo lectura (Fase 2), ampliable a escritura en Fase 5
// una vez el usuario apruebe explícitamente cada dominio.

export async function workerGet(key)                 // GET /store/:key → distingue [] (no existe) de excepción (falló)
export async function workerGetPrefix(prefix)         // GET /store/prefix/:prefix → advertir si count === 2000 (posible truncado)
export async function workerGetChecked(key)           // { failed, value } — replica _workerGetChecked del monolito
// Fase 5+ (no antes):
export async function workerSet(key, value, { ifMatch } = {})   // POST /store — aprovecha el merge server-side automático para claves _PROTECTED
export async function workerSetChunked(key, value)               // POST /store/chunked — para valores > 500KB
export async function workerAppend(key, item, idField = 'id')    // POST /store/append — evita el read-modify-write en el cliente
// NO exponer un workerDelete() genérico para dominios compartidos sin
// una capa de confirmación/autorización explícita aparte (ver riesgo P0 §10.6).
```

El token (`X-Siso-Token`) se leería de `window.__SISO_CONFIG.workerToken`, exactamente igual que en el monolito — lo que exige crear primero el equivalente de `functions/_middleware.js` en el refactor (ver §10.9), o el cliente simplemente no tendría credencial que usar en producción.

### 10.13 Plan de migración Supabase → Worker, por dominio (propuesta, no ejecutar aún)

Orden sugerido por menor riesgo / mayor valor de verificación temprana:

1. **Verificación pública de certificados** (`VerificacionPage.jsx`) — ya es solo lectura, cambiar la fuente de Supabase al Worker es el cambio de menor riesgo posible y sirve como prueba de humo del cliente nuevo.
2. **Login / lista de usuarios** (`LoginPage.jsx` lectura) — solo lectura, alto valor porque valida que la autenticación sigue funcionando contra la fuente real (D1) antes de tocar nada más.
3. **Dashboard / Pacientes / Empresas en modo lectura** — reemplazar `useBackendData.js` para que intente `workerGet`/`workerGetPrefix` ANTES de Supabase directo, dejando Supabase como fallback de lectura (no eliminar todavía).
4. Recién después de validar 1–3 en producción real durante un periodo de observación: abordar escritura, dominio por dominio, en el orden que ya especifica la misión (Empresas → Agenda → Facturas → Caja → Informes → Cartas de custodia → Pacientes → Historia clínica → Cierre de HC/portal), reemplazando primero `ProfilePage.jsx`/`UsersPage.jsx`/`SettingsPage.jsx` (escritura de `siso_users`) por ser la de mayor sensibilidad detectada.

### 10.14 Pruebas que deben existir antes de habilitar cualquier escritura desde el refactor

1. `workerGet` distingue correctamente `[]` (no existe) de una excepción de red/5xx — no debe interpretar ambas como "vacío, se puede sobrescribir".
2. `workerGetPrefix` advierte (log o valor de retorno) cuando el resultado tiene exactamente 2000 filas — señal de posible truncado por el `LIMIT` del Worker.
3. Escritura de una clave `_PROTECTED` con un array que **no** incluye un registro que sí existe en D1 → confirmar que el registro sobrevive (verifica que se está apoyando en el merge server-side, no reimplementándolo mal en el cliente).
4. Escritura en `siso_portal_empresa_docs_<nit>` de un solo periodo nuevo → confirmar que los periodos históricos y `nit`/`nombre`/`codigoAcceso` sobreviven intactos.
5. Conflicto `409` con `If-Match` desactualizado → el cliente relee, refusiona y reintenta como máximo 2 veces (tal como pide la misión en Fase 4), nunca sobrescribe a ciegas.
6. Ningún test ni código de Fase 2 (solo lectura) debe invocar `workerSet`/`workerSetChunked`/`workerAppend` — verificable por grep/lint, no solo por revisión manual.
7. El equivalente de `functions/_middleware.js` en el refactor nunca deja el token en el JS versionado en git (test de "el token no aparece en `dist/assets/*.js` tras `npm run build`").
8. Lectura de una clave chunked reconstruida vía piezas `__cN` + `__meta` produce el mismo resultado que la clave equivalente sin chunkear en un fixture sintético (no producción).

---

## 11. Confirmación final (Fase 0.5)

- ❌ **NO** se modificó, creó, borró ni ejecutó nada dentro de `../ocupasaludparadesplegar/**`. Solo se leyeron 4 archivos existentes (`siso-worker/index.js`, `siso-worker/schema.sql`, `siso-worker/wrangler.json`, `functions/_middleware.js`) con la herramienta de lectura, sin ninguna escritura.
- ❌ **NO** se ejecutó `wrangler deploy`, `wrangler d1 execute --remote`, ni ningún comando de escritura contra Cloudflare, D1 o Supabase.
- ❌ **NO** se hizo ningún `POST`, `PUT`, `PATCH` ni `DELETE` contra el Worker de producción — toda la evidencia de contrato HTTP proviene de leer el código fuente, no de invocar el Worker en esta fase.
- ❌ **NO** se imprimió, copió ni incluyó en este documento ningún valor real de `SISO_TOKEN`, claves de Supabase más allá de la clave pública (`sb_publishable_...`, ya no-secreta por diseño — es la misma que ambos repos traen como *default* hardcodeado en su propio código fuente, visible para cualquiera con acceso al repo), JWT, cookies ni datos clínicos identificables.
- ❌ **NO** se hizo ningún commit ni push.
- `docs/audits/BASELINE_D1_MONOLITH_COMPATIBILITY.md` sigue sin trackear en git (`git status --short` → `?? docs/audits/`).

**Fin de Fase 0.5. Se detiene aquí y se espera aprobación explícita antes de iniciar Fase 1.**
