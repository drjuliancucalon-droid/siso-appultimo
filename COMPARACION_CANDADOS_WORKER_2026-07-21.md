# Comparación de candados: Worker monolito (producción) vs Worker refactor

Archivos leídos completos:
- **Monolito (verdad):** `C:\Users\JQK3\ocupasaludparadesplegar\siso-worker\index.js` (671 líneas)
- **Refactor:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\siso-worker\index.js` (694 líneas)
- **Refactor "deploy":** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\siso-worker-deploy\index.js` — **byte a byte idéntico** al anterior (`diff` sin salida). Se tratan como un solo archivo en todo este informe.

---

## 0. HALLAZGO CRÍTICO — el worker del refactor probablemente NO es el que corre en producción

Esto condiciona todo lo demás y debe leerse primero:

- `src/lib/d1Client.js` del refactor apunta a `WORKER_URL = https://siso-api.dr-juliancucalon.workers.dev` (línea 6) — **el mismo worker compartido del monolito** (consistente con tu memoria `worker_compartido_refactor.md`).
- `d1Client.js` (función `_chunkSet`, líneas ~126-148) ya fue actualizado para llamar **PRIMERO** al contrato nuevo y atómico `POST /store/chunked` con body `{ key, value }` (el mismo formato que el monolito implementó HOY), y solo si falla cae a troceo por cliente.
- Pero el `POST /store/chunked` que existe en `siso-worker/index.js` y `siso-worker-deploy/index.js` **del refactor** espera un contrato viejo y distinto: `{ baseKey, pieces[], meta }` (líneas 336-403).
- Conclusión: **los dos `index.js` del refactor están desactualizados respecto al contrato que su propio frontend ya asume.** Si alguien alguna vez ejecuta `wrangler deploy` desde `siso-worker-deploy/` (en vez de git push del monolito, que es el flujo correcto según tu memoria `project_deploy_workflow.md`), sobrescribiría el worker compartido de producción con el contrato viejo. Efecto en cadena:
  1. El `_chunkSet` de AMBAS apps (monolito y refactor) probaría `/store/chunked` con `{key,value}` → el worker viejo respondería 400 (`"baseKey y pieces[] requeridos"`) o simplemente no reconocería el body.
  2. `d1Client.js` cae al fallback de troceo por cliente (líneas 150-217) — pero ese fallback **ABORTA por completo** para claves protegidas (`siso_patients_`, `siso_db_patients_`, `siso_atenciones`, `siso_hc_`, línea 152-156): `return { ok:false, error:'chunked_unavailable_for_protected_key' }`.
  3. Resultado: pacientes, HC e historias grandes dejarían de guardarse en D1 para ambas apps hasta revertir el deploy.
- Este riesgo es el punto **#1 de la lista de cambios prioritarios** al final.

---

## 1. Endpoints — presencia y contrato

| Endpoint | Monolito (verdad) | Refactor | Diferencia |
|---|---|---|---|
| `OPTIONS *` | Sí | Sí | igual |
| `GET /store/:key` | Sí, con `?raw=1`, decodifica gzip legacy (`decompressValue`) | Sí, con `?raw=1`, **sin** `decompressValue` (línea 172: `JSON.parse(row.value)` directo) | Refactor no soporta valores `gz:` legacy |
| `GET /store/prefix/:prefix` | Sí. Excluye piezas de chunk (`__cN`, `__new*`, `_chunk_i_of_N`) del escaneo (fix CPU-timeout 2026-07-11/12); modo raw devuelve strings crudos sin `JSON.parse` | Sí, pero **no excluye piezas de chunk** — escanea/serializa TODO bajo el prefijo, incluidas piezas de 500KB; y **no usa `decompressValue`** | Riesgo de reproducir el 500 por CPU timeout que el monolito ya solucionó |
| `GET /store` (listar) | Sí, `_raw:true`, sin `JSON.parse` server-side (fix V11 CPU) | Sí, pero hace `JSON.parse(r.value)` en el servidor (sin `_raw`) | Refactor reintrodujo el costo de CPU que el monolito quitó |
| `POST /store` | Upsert + If-Match + `_mergeProtegido` | Upsert + If-Match + `_mergeProtegido` **idéntico** + además CANDADO 2 y CANDADO 3 | Refactor tiene protecciones extra (ver sección 2) |
| `POST /store/chunked` | **Atómico server-side** (2026-07-11): body `{key, value}`; el worker trocea, hashea, hace `_mergeProtegido` ANTES de trocear, y escribe piezas+meta+borrado de base en un solo `env.DB.batch` | Body `{baseKey, pieces[], meta}` (troceo ya hecho en el cliente); **NO llama a `_mergeProtegido`**; solo compara `totalBytes` nuevo vs viejo (anti-encogimiento por tamaño) | **Brecha real**: los candados por-id (`_PROTECTED`) NO se aplican en la ruta chunked del refactor. Ver sección 3 |
| `POST /store/append` | Sí, fusiona por `idField` (default `id`) o `token` | Sí, igual + regla especial: si `key.includes('siso_encuesta')` usa `encuestaId` como idField | Extensión propia del refactor, no rompe nada |
| `POST /store/merge` (CANDADO 6) | **No existe** | Sí — fusión atómica read-merge-write por `idField` sobre un array completo | Mecanismo nuevo del refactor, ver sección 3 |
| `GET /health` | Ping barato por defecto (`SELECT 1`); 5 `COUNT(*)` completos solo con `?full=1` (fix 2026-07-10, ahorra ~11K filas leídas/llamada) | **Siempre** ejecuta los 5 `COUNT(*)` — sin modo ping | Refactor reintrodujo el consumo de cuota de lecturas D1 que el monolito corrigió (relevante para tu incidente de cuota, memoria `localstorage_quota_solucion.md` / D1) |
| `DELETE /store/:key` | Borra directo, sin restricciones | CANDADO 4 (prefijos no borrables: `siso_users`, `siso_portal_empresa_*`, `siso_ai_keys_`, `siso_snapshot_`) + CANDADO 5 (backup automático `siso_deleted_<ts>_<key>` antes de borrar) | Refactor más protegido en DELETE, pero no probado contra el flujo real del monolito |
| `POST /snapshot`, `GET /snapshot/list` | Sí | Sí | Igual |
| `POST /cleanup` | Sí, 3 secciones con logging individual (rotación snapshots, chunks `__new*`, autosaves >48h) | Sí, mismas 3 acciones pero sin logging por sección | Funcionalmente equivalente |
| `GET /storage-stats` | Cálculo **real**: `SUM(LENGTH(value))` | Cálculo **estimado**: `filas * 2048 bytes` | Refactor da una cifra de uso de D1 mucho menos precisa |
| CRON `scheduled` → `runDailySnapshot` | Rotación de snapshots ANTES de escribir (fix 2026-06-15: si la escritura falla, igual rota); + GC de chunks `__new` abandonados (>1h); usa `decompressValue` al reconstruir | Rotación DESPUÉS de escribir (orden viejo, pre-fix); **sin** el paso de GC de `__new` abandonados; **sin** `decompressValue` al reconstruir | Refactor tiene la versión pre-fix de este flujo — mismo bug que el monolito ya resolvió el 2026-06-15 |
| CORS headers permitidos | `Content-Type,X-Siso-Token` | `Content-Type, X-Siso-App, X-Siso-Token, X-Siso-UserId` | Refactor agrega headers para CANDADO 3 |

---

## 2. `_PROTECTED` / `_mergeProtegido` / `_mergePeriodosObjeto` — comparación función por función

**Resultado sorprendente y tranquilizador:** el refactor ya tiene una copia **textualmente idéntica** (carácter por carácter, incluida la regex) de:

- La regex `_PROTECTED` (línea 75 monolito == línea 50 refactor).
- `_mergePeriodosObjeto(env, key, incoming)` (líneas 83-107 monolito == líneas 56-80 refactor).
- `_mergeProtegido(env, key, incoming)` (líneas 111-150 monolito == líneas 86-125 refactor).

El refactor incluso conserva comentarios que referencian commits del monolito (`COMMIT 3531448`, `COMMIT a28c77e`, `COMMIT 1661b5f`, `COMMIT 50f852b`) — es decir, en algún punto **portearon manualmente** esta lógica desde el monolito hacia `POST /store`. Esto significa que para `siso_companies`, `siso_cartas_custodia`, `siso_saved_reports`, `siso_informes`, `siso_users`, `siso_portal_empresa_atenciones` y `siso_portal_empresa_docs` (incluida la fusión por `periodo` con preservación de `informe/cuenta/custodia/certificados`), **la ruta `POST /store` del refactor está a la par del monolito, byte por byte**.

### Pero hay una brecha real: `POST /store/chunked`

- Monolito: `_mergeProtegido` se invoca **también** en `/store/chunked` (línea 315), porque los arrays de pacientes/HC suelen superar 500KB y viajan por esa ruta.
- Refactor: `/store/chunked` **no llama a `_mergeProtegido` en absoluto**. Solo compara `totalBytes` nuevo vs `totalBytes` viejo (guardado en el `__meta` anterior) y rechaza con `409 shrink_detected` si el nuevo es más chico. Esto:
  - No previene la pérdida de ids específicos si el payload nuevo tiene el MISMO tamaño o más (p. ej. una sesión vieja que reemplaza 30 pacientes por otros 30 de tamaño similar, borrando los que faltan — pasa el check de tamaño y aun así pierde datos).
  - No hace fusión por `periodo` para objetos tipo `siso_portal_empresa_docs_<nit>` cuando ese valor viaja chunked (poco común dado su tamaño pequeño, pero posible).
- **Esta es la brecha #1 en la propia lógica de candados** (aparte del problema de contrato de endpoint de la sección 0).

---

## 3. Candados exclusivos del refactor (CANDADO 2, 3, 4, 5, 6) — qué hacen exactamente

| Candado | Ruta | Qué hace | Claves que cubre | Existe algo similar en monolito |
|---|---|---|---|---|
| **CANDADO 2** | `POST /store` (líneas 246-259) | Rechaza (423) cualquier escritura a una clave que matchee `siso_hc_cerrada_*` o `/siso_hc_.*_cerrada$/` — "HC inmutable" | HC cerradas | No existe en el monolito. Es una protección **adicional**, no un reemplazo de `_mergeProtegido` |
| **CANDADO 3** | `POST /store` (líneas 228-244) | Compara el sufijo numérico/id de la clave (`siso_patients_<userId>`, etc.) contra el header `X-Siso-UserId`; si no coinciden y `keyUserId.length>=3`, rechaza 403 | `siso_patients_`, `siso_db_patients_`, `siso_hc_` | No existe en monolito. **Actualmente inerte**: ningún cliente (ni monolito ni refactor `d1Client.js`, que solo manda `Content-Type` y `X-Siso-Token`, línea 16-23) envía `X-Siso-UserId`, así que `userId` llega vacío y la condición nunca dispara. Diseñado pero no conectado. |
| **CANDADO 4** | `DELETE /store/:key` (líneas 521-531) | Prefijos no borrables: `siso_users`, `siso_portal_empresa_`, `siso_portal_empresa_docs_`, `siso_portal_empresa_atenciones_`, `siso_ai_keys_`, `siso_snapshot_` → 403 | Los mismos prefijos que `_PROTECTED` cubre en escritura, pero para DELETE | Enfoque distinto y válido — el monolito no restringe DELETE en absoluto |
| **CANDADO 5** | `DELETE /store/:key` (líneas 533-542) | Antes de borrar, copia el valor viejo a `siso_deleted_<timestamp>_<key>` (backup silencioso) | Cualquier clave que sí se deje borrar | No existe en monolito |
| **CANDADO 6** | `POST /store/merge` (líneas 454-487) | Lee el array completo en `key`, fusiona `items[]` por `idField` (reemplaza si el id existe, agrega si no) y escribe el resultado en una sola operación server-side | Cualquier array — genérico, no restringido a `_PROTECTED` | Es la versión "on-demand" de lo que el monolito hace **automáticamente y sin que el cliente lo pida** vía `_mergeProtegido` en `/store` y `/store/chunked` |

### Veredicto sobre CANDADO 6 vs `_mergeProtegido` automático

Son enfoques distintos, **no equivalentes**, y el del monolito es estrictamente más fuerte:

- `_mergeProtegido` (monolito) protege **siempre**, en el propio `POST /store` normal — el servidor decide fusionar según el nombre de la clave (`_PROTECTED.test(key)`), sin que el cliente tenga que saber nada. Un cliente viejo, con bug, o de un tercer proyecto, que llame `POST /store` normal sin fusionar, **igual queda protegido**.
- `/store/merge` (refactor, CANDADO 6) es **opt-in**: solo protege si el código cliente elige llamar a ese endpoint específico en vez de `POST /store`. Si cualquier ruta del frontend (o una versión vieja de la app, u otro proyecto que comparta el worker) sigue llamando `POST /store` con el array completo, **no hay fusión — se sobreescribe todo**, salvo que la clave matchee `_PROTECTED` (que si aplica en `/store`, por la copia idéntica de la sección 2).
- En la práctica: para las claves que están en `_PROTECTED` (companies, custodias, informes, usuarios, portal_empresa_*, patients, hc, atenciones, encuestas), el refactor SÍ tiene la protección automática igual que el monolito, **siempre que la escritura pase por `POST /store` y no por `/store/chunked`** (brecha de la sección 2) ni sea sobre-escrita por un `wrangler deploy` del contrato viejo (brecha de la sección 0).
- Para arrays que NO están en `_PROTECTED`, el monolito no los protege tampoco — ahí `/store/merge` sería una mejora real del refactor, pero no está siendo usado consistentemente (ver sección 4: `d1WriteArrayMerge` en el cliente hace el merge él mismo, sin llamar a `/store/merge`).

---

## 4. `siso_portal_empresa_docs_<nit>` — verificación específica pedida (punto 4 de la tarea)

Aquí aparece el segundo hallazgo crítico, **independiente del worker**: está en el **frontend** del refactor.

- El *worker* del refactor sí tiene `_mergePeriodosObjeto` idéntico al monolito (sección 2) — a nivel de servidor, si te llega un objeto `{periodos:[...]}` bien formado por `POST /store`, se fusiona correctamente por `periodo`.
- Pero el **frontend** del refactor no siempre envía ese objeto. En `src/pages/HistoriaPage.jsx` líneas 393-398 y 465-469 (flujo de "cierre de atención / publicar en portal", equivalente al botón del monolito):

```js
const periodoDoc = {
  periodo,
  docNumero: data.docNumero, nombres: data.nombres,
  codigoVerificacion: code, tipoExamen: data.tipoExamen,
  fechaExamen: data.fechaExamen, conceptoAptitud: data.conceptoAptitud,
};
...
// Clave 6 (array — MERGE, idField='periodo')
await d1WriteArrayMerge(`siso_portal_empresa_docs_${nitClean}`, [periodoDoc], 'periodo');
```

  Esto trata `siso_portal_empresa_docs_<nit>` como si fuera directamente un **array de registros por paciente** (con campos `docNumero`, `codigoVerificacion`, `conceptoAptitud`...), cuando el esquema real (usado en el propio refactor por `PortalEmpresaPage.jsx` línea 136-158, y en el monolito) es un **objeto** `{nit, nombre, codigoAcceso, periodos:[{periodo, informe, cuenta, custodia, certificados}]}`.

- `d1WriteArrayMerge` (en `src/lib/d1Client.js` líneas 557-638) hace `Array.isArray(currentValue) ? currentValue : []` — como el valor real en D1 es un objeto (no un array), `currentList` queda `[]`, y termina escribiendo (`d1Set`) un **array crudo `[periodoDoc]`** en el lugar del objeto completo. Esto:
  1. Destruye `nit`, `nombre`, `codigoAcceso` de la clave.
  2. Borra todos los `periodos` existentes (informes, cuentas de cobro, custodias, certificados ya publicados), dejando solo el registro nuevo del paciente que cerró la atención.
  3. Deja la clave en un formato que `PortalEmpresaPage.jsx` (que espera `val.periodos` como array) ya no puede leer correctamente — el portal de empresa mostraría "sin documentos" tras el próximo cierre de HC.
- Es decir: **incluso si el worker fusiona perfecto, el cliente del refactor está escribiendo la forma equivocada de dato para esta clave en uno de sus flujos**, y esa escritura pasa por `POST /store` (`d1Set` normal, no chunked) — así que si el objeto es pequeño, ni siquiera el candado de tamaño de `/store/chunked` lo salva.
- **No encontré ningún otro punto** en el refactor (`CompaniesSection.jsx`, `AnalisisDocsEmpresas.jsx`, `EpidemiologicalReport.jsx`) que escriba correctamente el objeto `{periodos:[...]}` con la forma que `PortalEmpresaPage.jsx` espera leer — sugiere que el equivalente refactor de "Publicar en portal / Enviar TODO a Empresa / Marcar como pagada / Activar todas" (botones del monolito) **no está implementado con el mismo esquema de datos**, y hoy mismo el monolito ya solidificó ese esquema con `_mergePeriodosObjeto`.

**Veredicto punto 4:** el refactor NO protege `siso_portal_empresa_docs` igual que el monolito, pese a tener el candado de servidor idéntico. El bug está antes de llegar al worker: el frontend arma el payload con el esquema incorrecto.

---

## 5. `_readSmart` — ¿existe un equivalente en el refactor?

- Sí existe una función `_readSmart(key, supabaseQuery)` en `src/lib/d1Client.js` líneas 492-513, con lógica de comparación de timestamps similar en espíritu (D1 || Supabase, gana el más nuevo).
- Pero **difiere del monolito en dos formas importantes**:
  1. **No hace catch-up.** El monolito, cuando Supabase tiene la versión más nueva (o D1 no tiene nada), escribe de vuelta a D1 (`_workerSet(key, sbResult.value)`, líneas 804 y 813 de `App.jsx`). El `_readSmart` del refactor **solo retorna el valor** — nunca llama a ningún `d1Set`/`_workerSet` de vuelta. Sin catch-up, D1 se queda desactualizado indefinidamente, lo cual además interfiere con `_mergeProtegido` del lado servidor: si D1 nunca se pone al día, la próxima fusión por-id en el servidor comparará contra una versión vieja de D1, no contra el estado real.
  2. **Extrae el timestamp de forma distinta y más limitada.** Monolito: `_tsOf` mira `v.updatedAt || v.updated_at || v.ts`, y además usa el `updated_at` real de la fila de Supabase (columna, más confiable) como fallback. Refactor: `_tsOf` solo mira `v._updatedAt || v.ts` (nota el guion bajo distinto: `_updatedAt` vs `updatedAt`/`updated_at`) — no usa la columna `updated_at` de la fila de Supabase en absoluto, solo lo que venga embebido en el propio valor.
- **Más importante: `_readSmart` del refactor está huérfana.** Busqué en todo `src/` y la única aparición del identificador es su propia definición en `d1Client.js`. Ningún componente la importa ni la llama.
  - Los puntos reales de lectura de `siso_portal_empresa_docs_<nit>` en el refactor (`PortalEmpresaPage.jsx` línea 141: `const r = await d1Get(...)`) usan **solo D1**, sin ningún fallback/reconciliación con Supabase.
  - Es decir: la función existe en el código pero no está conectada a ningún flujo real — el refactor todavía lee "D1 solamente" en la práctica, un paso *detrás* de donde estaba el monolito ANTES del fix de hoy (que ya usaba "D1 primero, Supabase si D1 vacío") y dos pasos detrás de donde está el monolito HOY (`_readSmart` con catch-up + doble escritura).

**Veredicto punto 5:** no hay equivalente funcional en el refactor. La pieza de código existe pero no está enchufada; y aunque lo estuviera, le falta el catch-up a D1.

---

## Tabla resumen de veredictos

| Protección | Refactor: ¿a la par, atrás, o distinto? |
|---|---|
| `_PROTECTED` regex (server, `POST /store`) | **A la par** (copia idéntica) |
| `_mergeProtegido` en `POST /store` | **A la par** (copia idéntica) |
| `_mergePeriodosObjeto` en `POST /store` | **A la par a nivel servidor**, pero **inútil en la práctica** porque el frontend (`HistoriaPage.jsx`) no arma el objeto correcto para esta clave — ver sección 4 |
| `_mergeProtegido`/`_mergePeriodosObjeto` en `POST /store/chunked` | **Atrás** — el refactor no llama a estas funciones en su ruta chunked, solo compara tamaño total |
| Contrato del endpoint `/store/chunked` | **Atrás / roto** — formato viejo (`baseKey/pieces/meta`) incompatible con lo que el propio `d1Client.js` del refactor ya intenta usar como vía primaria (`{key,value}`, atómico) |
| `GET /store`, `/store/prefix` sin JSON.parse server-side + exclusión de piezas | **Atrás** — reintroduce el riesgo de 500 por CPU timeout que el monolito ya arregló |
| `GET /health` modo ping barato | **Atrás** — siempre gasta 5 `COUNT(*)`, contribuye a agotar cuota de lecturas D1 |
| Orden de rotación + GC de chunks `__new` en `runDailySnapshot` | **Atrás** — tiene la versión pre-fix (rota al final, sin GC de huérfanos) |
| CANDADO 2 (HC cerrada inmutable) | **Enfoque distinto, adicional** — no existe en monolito, no conflictúa |
| CANDADO 3 (userId vs sufijo de clave) | **Enfoque distinto, pero inerte** (ningún cliente manda el header necesario) |
| CANDADO 4/5 (DELETE: prefijos protegidos + backup) | **Enfoque distinto, adicional y válido** — monolito no restringe DELETE |
| CANDADO 6 (`/store/merge`) | **Enfoque distinto, opt-in** — más débil que la fusión automática del monolito porque depende de que el cliente elija usarlo; y de hecho el cliente del refactor (`d1WriteArrayMerge`) NI SIQUIERA lo usa, hace su propio merge y llama a `POST /store` |
| `_readSmart` (frontend) | **Atrás** — existe pero está desconectada (no se llama desde ningún flujo real) y carece de catch-up a D1 |
| Escritura dual D1+Supabase en flujos de portal empresa | **Atrás** — no confirmé ningún punto que escriba simultáneamente a D1 y Supabase con el esquema correcto para `siso_portal_empresa_docs` |

---

## 6. Lista priorizada de cambios exactos para igualar al monolito de HOY

### P0 — Antes de tocar nada más: congelar el riesgo de deploy
1. **No permitir `wrangler deploy` desde `Desktop\Refactorizacion 30 de junio\siso-worker-deploy\`** hasta actualizar su `/store/chunked` al contrato atómico `{key, value}` del monolito. Si alguien ya lo desplegó alguna vez, verificar contra el worker en producción (`GET https://siso-api.dr-juliancucalon.workers.dev/store/chunked` con un POST de prueba) cuál contrato responde hoy.
2. Confirmar cuál `index.js` está realmente detrás de `siso-api.dr-juliancucalon.workers.dev` ahora mismo (probablemente el del monolito, vía el flujo `git push a drjuliancucalon-droid` de tu memoria) — si es así, los dos archivos de refactor analizados aquí son código **muerto/desactualizado** que conviene sincronizar o eliminar para que nadie los despliegue por error.

### P1 — Puertos de candados de servidor (una vez resuelto el contrato de endpoint)
3. En `POST /store/chunked` del refactor: reemplazar el body `{baseKey, pieces, meta}` por `{key, value}` y portar **tal cual** el bloque completo del monolito (líneas 300-347), incluyendo la llamada a `_mergeProtegido(env, key, value)` ANTES de trocear, el hash `h1/h2`, y el borrado de piezas huérfanas (`oldCount` vs `pieces.length`).
4. Portar el modo ping barato de `GET /health` (monolito líneas 386-417) — solo `SELECT 1` salvo `?full=1`.
5. Portar la exclusión de piezas de chunk en `GET /store/prefix` (monolito líneas 211-220: `NOT GLOB '*__c[0-9]*' AND NOT LIKE '%__new%' AND NOT GLOB '*_chunk_[0-9]*_of_[0-9]*'`) y el modo `_raw` sin `JSON.parse` server-side.
6. Agregar `decompressValue` en los 3 puntos de lectura del refactor donde falta (`GET /store/:key` línea 172, `GET /store/prefix` línea 189, `GET /store` línea 212, y en `runDailySnapshot`) — por si quedan valores `gz:` legacy en el D1 compartido.
7. Reordenar `runDailySnapshot` del refactor: rotación de snapshots ANTES de escribir el nuevo (no después), y agregar el paso de GC de chunks `__new*` abandonados (>1h) que tiene el monolito.

### P2 — Frontend: esquema de datos y `_readSmart`
8. **Corregir `HistoriaPage.jsx` líneas 465-469** (`Clave 6`): dejar de tratar `siso_portal_empresa_docs_<nit>` como array vía `d1WriteArrayMerge(..., 'periodo')`. Debe leer el objeto existente (`d1Get`), fusionar `periodoDoc` dentro de `existente.periodos` por `periodo` (igual criterio que `_mergePeriodosObjeto` del worker: preservar `informe/cuenta/custodia/certificados` no-null), y escribir de vuelta el objeto completo `{nit, nombre, codigoAcceso, periodos: [...]}` con `d1Set`, no con `d1WriteArrayMerge`.
9. Conectar `_readSmart` (ya escrita en `d1Client.js`) a los puntos reales de lectura de `siso_portal_empresa_docs_<nit>` (`PortalEmpresaPage.jsx` línea 141, `AnalisisDocsEmpresas.jsx`, `CompaniesSection.jsx`, `EpidemiologicalReport.jsx`) en vez de `d1Get` directo — y agregarle el catch-up a D1 que hoy le falta (si Supabase gana, escribir de vuelta a D1 con `d1Set`, igual que el monolito hace en `App.jsx` líneas 804 y 813).
10. Alinear `_tsOf` del refactor con el del monolito: revisar también `v.updatedAt`/`v.updated_at` (no solo `v._updatedAt`) y usar el `updated_at` de la fila de Supabase como con el monolito, no solo lo embebido en el valor.
11. Auditar todos los botones equivalentes a "Publicar en portal", "Enviar TODO a Empresa", "Marcar como pagada", "Activar todas" en el refactor (`CompaniesPage.jsx`, `CompaniesSection.jsx`, `useCompanyDocuments.js`) para verificar que todos escriban `siso_portal_empresa_docs_<nit>` con el esquema objeto+periodos correcto, y no solo el de `HistoriaPage.jsx` que se auditó aquí.

### P3 — Consistencia menor
12. Decidir si CANDADO 3 (X-Siso-UserId) se activa de verdad (hacer que `d1Client.js` mande `X-Siso-App`/`X-Siso-UserId`) o se retira por ser código muerto que puede confundir a futuro.
13. `GET /storage-stats` del refactor: reemplazar la estimación `filas*2048` por el cálculo real `SUM(LENGTH(value))` del monolito para que las alertas de 70%/90% sean confiables.
