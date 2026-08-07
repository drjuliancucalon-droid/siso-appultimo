# Reglas del proyecto — siso-appultimo (refactor)

## Datos sintéticos obligatorios en cualquier artefacto guardado en disco

**Precedente:** el 2026-08-07, al redactar `docs/audits/REFRACTOR_D1_BFF_SECURITY_DESIGN.md`, se incluyó como "ejemplo ilustrativo" un número de documento real de un paciente, recordado del contexto de la conversación (no leído de código ni de una base de datos), en la sección de diseño de logging de auditoría. Se corrigió antes de comitear y se confirmó — mediante inspección exhaustiva de todos los objetos de git alcanzables en el repositorio — que el valor nunca llegó a entrar al historial de git. Aun así, el hecho de que se haya escrito a disco es un hallazgo de seguridad en sí mismo bajo Ley 1581/2012 y Res. 1843/2025 (protección de datos de salud), no un detalle ya resuelto por la corrección posterior.

**Alcance de esta auditoría:** esta auditoría confirma ausencia del dato en el historial de Git. No cubre editor swap files, autoguardado, historial de terminal local, ni logs de la sesión del agente que generó el archivo. El titular del proyecto debe revisar esas superficies por separado. El riesgo se declara MITIGADO EN GIT, no ELIMINADO EN TODOS LOS SISTEMAS.

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

## Segundo precedente — vector de fuga de token latente en código heredado

**Fecha:** 2026-08-07.
**Archivo:** `src/shared/lib/syncManager.js` (compilado a `dist/assets/syncManager-*.js` en cada build), detectado por `tests/security/scan-dist-for-token.mjs` al escanear el bundle del navegador tras el build de Fase 1C.
**Patrón:** funciones `_d1Config()`, `_d1GetAll()`, `_d1Get()` leían `window.__SISO_CONFIG?.workerToken`/`workerUrl` y enviaban ese valor como header `X-Siso-Token` en un `fetch` hecho **desde el navegador** directamente contra el Worker `siso-api` — el mismo patrón que el diseño BFF de Fase 1B (`docs/audits/REFRACTOR_D1_BFF_SECURITY_DESIGN.md`) existe para evitar. Es código heredado, portado del monolito junto con el resto de `syncManager.js` (comentario propio del archivo: *"Ported from monolith"*), no código introducido en esta sesión.
**Estado encontrado:** inerte pero explotable. `window.__SISO_CONFIG` nunca es poblado por nada en el refactor hoy (no existe ningún `_middleware.js` propio antes de Fase 1C, y el `_middleware.js` de Fase 1C tampoco lo puebla — ver diseño BFF §2). Por eso `_d1Config()` siempre devolvía `{url:'', token:''}` y las tres funciones siempre retornaban `null` sin llegar a mandar la request. El vector es real y explotable en el momento en que cualquier código futuro popule esa variable global (p.ej. copiando ingenuamente el `_middleware.js` del monolito).
**Uso legítimo verificado antes de tocar el archivo** (`rg -n "syncManager" src/`): un único importador, `src/shared/lib/connectionStatus.jsx:42`, que hace `import('./syncManager.js')` dinámico y usa solo `trySync` (alias de `syncManager.syncNow`). Ese `syncNow` se dispara **manualmente**, al hacer clic en `ConnectionBadge` (botón de estado de conexión) → `useConnectionStatus().retry()` — no hay ninguna sincronización automática al cargar la app: `initSyncManager()` (que sí registraría listeners de online/offline y un intervalo periódico) **no está llamado en ningún punto del código** — es, en sí mismo, código muerto adicional, no tocado en esta corrección por estar fuera del vector de fuga.
**Decisión tomada:** eliminar `_d1Config`, `_d1GetAll`, `_d1Get` y `_refreshFromD1` (dependía de `_d1Get`) por completo — es la rama de código muerta que la instrucción autoriza a remover, ya que hoy no completa ninguna llamada funcional. `hybridGet()` y `syncNow()` quedan con su fallback a Supabase intacto (la key pública de Supabase no es un secreto maestro equivalente — ver discusión repetida en `docs/audits/BASELINE_D1_MONOLITH_COMPATIBILITY.md`). No se agrega ninguna llamada al Worker vía el patrón BFF en su lugar — eso queda para una fase futura explícitamente autorizada, no para esta corrección.

## Límites de repositorio (vigentes mientras dure el trabajo de compatibilidad D1)

- `../ocupasaludparadesplegar/**` es solo lectura: nunca `git add/commit/push/reset/checkout/merge`, nunca `npm install/build/dev`, nunca `wrangler deploy`/`wrangler d1 execute --remote` ahí.
- `siso-appultimo/siso-worker/**` no se modifica ni se despliega sin aprobación explícita separada.
- Nunca `POST`/`PUT`/`PATCH`/`DELETE` contra el Worker de producción (`siso-api.dr-juliancucalon.workers.dev`) ni escrituras remotas contra D1/Supabase, salvo aprobación explícita y acotada a una acción concreta.
- El secreto `SISO_TOKEN` nunca viaja al navegador (HTML, bundle JS, `window.*`, headers de respuesta, logs) — ver `docs/audits/REFRACTOR_D1_BFF_SECURITY_DESIGN.md` para el diseño BFF que reemplaza el patrón de inyección del monolito.
