# Verificación de la implementación del PROMPT_MAESTRO_IGUALACION_2026-07-21

**Commits verificados:** `dcc44a0` (implementación FASE 0-6) y `8d17bc5` (fix de seguimiento sobre login).
**Método:** verificación código-contra-código de cada criterio de aceptación del prompt maestro, no solo revisión de que existan líneas nuevas. Se detectaron regresiones nuevas además de brechas ya conocidas sin cerrar.

## Resumen ejecutivo — qué sí quedó bien, qué no

| Fase | Resultado |
|---|:---:|
| FASE 0.2 (`/store/chunked` contrato atómico + merge) | ✅ Correcto |
| FASE 0.3 (esquema `siso_portal_empresa_docs`) | ✅ Correcto, y se verificó un segundo punto de escritura no auditado antes (`EpidemiologicalReport.jsx`) también correcto |
| FASE 1 (autenticación) | ❌ A medias — se corrigió lo visible (contraseñas en texto plano), pero un usuario nuevo real **no puede iniciar sesión**, el 2FA sigue siendo falso, el bloqueo se resetea con F5 |
| FASE 2 (portales) | ❌ Routing movido correctamente, pero surgió una **exposición de seguridad nueva** (ver hallazgo crítico #2) |
| FASE 3 (CONDUCCIÓN) | ✅ Genuinamente completa y verificada |
| FASE 4 (SGSST/Telemedicina) | ❌ SGSST quedó **roto** (regresión nueva, peor que antes); Telemedicina no se tocó |
| FASE 5 (worker menor) | ⚠️ Correcto en `siso-worker/index.js`, pero **no replicado** en `siso-worker-deploy/index.js` — hallazgo nuevo |

---

## 🔴 Hallazgos críticos nuevos (regresiones causadas por esta implementación, no brechas del diagnóstico original)

### 1. SGSST quedó roto — probable crash en los 8 componentes de UI

`sgsstService.js` se convirtió a `async` (para llamar a `d1Get`/`d1WriteArrayMerge`) pero **ningún componente de UI se actualizó** para usar `await`. Los 8 componentes (`RiskMatrix.jsx`, `AccidentInvestigation.jsx`, `AnnualPlan.jsx`, `DocumentRepository.jsx`, `TrainingModule.jsx`, `PolicyGenerator.jsx`, `InspectionChecklist.jsx`, `SSTDashboard.jsx`) hacen `useState(xCRUD.getAll())` — ahora `getAll()` devuelve una `Promise`, no un array. `RiskMatrix.jsx` línea 80 hace `riesgos.map(...)` sobre esa Promise dentro de un `useMemo` → `TypeError: riesgos.map is not a function` en el primer render. **Antes de este commit, SGSST funcionaba (solo local); es plausible que ahora no cargue en absoluto.**

Nota adicional: las claves D1 usadas (`riesgos`, `planes`, `documentos`, etc.) no tienen prefijo `siso_sgsst_` ni sufijo de usuario — riesgo de colisión de nombres en el D1 compartido con el monolito.

### 2. `PortalCertificadosEmpresa.jsx` quedó público sin ningún control de acceso

Al mover la ruta fuera de `ProtectedRoute` (correcto para `PortalEmpresaPage.jsx`, que sí tiene su propio login NIT+código), `PortalCertificadosEmpresa.jsx` quedó expuesta también — pero este componente **nunca tuvo un formulario de login**. Resuelve la empresa directamente por NIT/ID en la URL vía `useBackendData` (llamada D1 real y funcional) sin pedir ningún código de acceso: cualquier visitante que adivine un NIT o `companyId` en la URL ve nombre, NIT y actividad económica de esa empresa. Además, el contenido de documentos depende de `useCompanyDocuments`, que apunta a `http://localhost:3001/api/...` — un backend que no existe en este repo ni en el worker — así que esa parte falla siempre, pero la fuga de identidad de empresa es real y funcional.

---

## 🟠 Brechas del diagnóstico original que NO se cerraron

### 3. Autenticación (FASE 1) — ningún commit tocó `authStore.js`

- Un usuario creado vía `UserForm.jsx` no puede loguearse: mismatch de campo (`user` vs `usuario`) + `_authenticateUser` solo verifica SHA-256 simple, nunca lee `passSalt` (PBKDF2). Ya existe en el repo `_verifyPassword` en `src/shared/lib/crypto.js`, correcta y con tests que pasan, pero nadie la conectó.
- `verifyTOTP` sigue aceptando cualquier código de 6 dígitos — comentario explícito en el código: *"Para MVP... Validación real TOTP requiere librería otplib"*.
- `loginAttempts`/`blockedUntil` no están en el `partialize` del `persist` de Zustand — el bloqueo por intentos fallidos se resetea con F5.
- `src/modules/auth/index.js` sigue re-exportando el `useAuth.js` ya borrado (import roto latente, hoy inofensivo porque nada lo importa).

### 4. `siso-worker/index.js` y `siso-worker-deploy/index.js` se desincronizaron

La auditoría previa los había confirmado "byte a byte idénticos". Ya no lo son: los 5 fixes de FASE 5 (decompressValue, exclusión de chunks en `/store/prefix`, `GET /health` barato, `storage-stats` real, orden de rotación de snapshots) se aplicaron **solo** en `siso-worker/index.js`. Si se despliega desde `siso-worker-deploy/` (el nombre sugiere que es el destinado a `wrangler deploy`), se reintroducen todos esos problemas en producción compartida con el monolito.

### 5. Otros puntos de FASE 5 sin cerrar

- `decompressValue` solo se agregó en 1 de los 4 puntos de lectura pedidos (`GET /store`).
- El modo `_raw` sin `JSON.parse` server-side en `/store/prefix` quedó opt-in (`?raw=1`) — el único caller real (`syncManager.js`) no lo activa, así que en la práctica se sigue pagando el costo de CPU que se quería evitar.
- El GC de chunks `__new*` huérfanos (>1h) dentro de `runDailySnapshot` no se agregó en ningún archivo.
- CANDADO 3 (`X-Siso-UserId`): no se conectó ni se retiró — se agregó un comentario reconociendo que sigue inerte, que no es ninguna de las dos decisiones que pedía el protocolo.

### 6. FASE 2 — resto pendiente

- No se decidió cuál portal es el canónico (`PortalEmpresaPage.jsx` vs `PortalCertificadosEmpresa.jsx`) — y el que quedó público es precisamente el roto.
- `_readSmart` sigue huérfana (cero imports en el resto del código) y sin el catch-up a D1 que le faltaba — solo se corrigió `_tsOf` para revisar `updatedAt`/`updated_at`.
- `PortalPublicoTrabajador.jsx` (555 líneas) y `modules/clinical/services/printService.js` (vacío) siguen sin eliminarse.

### 7. FASE 4 — Telemedicina

Cero referencias a `d1Get`/`d1Set`/`d1WriteArrayMerge` en `src/modules/telemedicine/` — no se tocó en absoluto.

---

## ✅ Lo que sí está genuinamente resuelto (no re-trabajar)

- **FASE 0.2**: contrato atómico `{key,value}` de `/store/chunked` con `_mergeProtegido` antes de trocear — porte verbatim correcto.
- **FASE 0.3**: esquema objeto+periodos de `siso_portal_empresa_docs` — corregido en `HistoriaPage.jsx` y también en `EpidemiologicalReport.jsx` (punto no auditado antes, y ya estaba bien).
- **FASE 3 completa**: los 10 bloques de campos de CONDUCCIÓN están todos en `OccupationalHC.jsx`, con el mismo patrón condicional de las otras 5 secciones, y los nombres de campo coinciden carácter por carácter con lo que ya consumían impresión/certificado/IA.
- **FASE 1, parcial real**: ya no hay contraseñas en texto plano en el código ni `loginLocal` sin verificación — avance genuino, aunque insuficiente (ver hallazgo #3).
- **FASE 5, parcial real**: los 5 fixes SÍ están bien implementados, solo falta replicarlos en el segundo archivo del worker.

---

## Correcciones aplicadas en esta pasada (commit `ddc56b0`)

Se corrigieron directamente, verificando con build (`vite build`, 1824 módulos, sin errores) y suite de tests (163 passing):

1. **SGSST (hallazgo crítico #1) — arreglado.** Los 8 componentes (`RiskMatrix.jsx`, `AccidentInvestigation.jsx`, `AnnualPlan.jsx`, `DocumentRepository.jsx`, `TrainingModule.jsx`, `PolicyGenerator.jsx`, `InspectionChecklist.jsx`, `SSTDashboard.jsx`) ahora manejan correctamente el CRUD async (`useEffect` + `.then()`/`await` en vez de asignar la Promise directo al `useState`). Además se namespacearon las 9 claves D1 con prefijo `siso_sgsst_` (antes literales como `"riesgos"`, riesgo de colisión con el D1 compartido).

2. **`PortalCertificadosEmpresa.jsx` (hallazgo crítico #2) — arreglado.** Devuelta detrás de `ProtectedRoute` en `App.jsx` (no tiene gate propio y depende de un backend inexistente). `PortalEmpresaPage.jsx` queda como el portal público canónico — ya cubre certificados con su propio login NIT+código funcional.

3. **`siso-worker/index.js` vs `siso-worker-deploy/index.js` (hallazgo #4) — resincronizados.** Además se completaron los puntos de FASE 5 que faltaban en ambos: `decompressValue` en los 3 puntos restantes (`GET /store/:key`, `GET /store/prefix`, `runDailySnapshot`) y el GC de chunks `__new*` huérfanos (>1h) dentro de `runDailySnapshot`.

4. **Autenticación (hallazgo #3) — corregida en `authStore.js`.**
   - `_authenticateUser` ahora usa `_verifyPassword` (PBKDF2+salt con fallback SHA-256 legacy, ya escrita y probada en `crypto.js`) en vez de solo SHA-256, y busca por `.user` o `.usuario` (antes solo `.user`, que `UserForm.jsx` nunca escribe).
   - `verifyTOTP` ahora usa `_totpVerify` real (HMAC-SHA1, RFC 6238, ventana ±1×30s, portado tal cual del monolito) en vez de aceptar cualquier código de 6 dígitos.
   - `loginAttempts`/`blockedUntil` agregados al `partialize` del `persist` — el bloqueo ya no se resetea con F5.
   - Limpieza de código muerto en `LoginPage.jsx` (`_sha256`/`_pbkdf2Verify`/`_verifyHash`/`loginLocal` sin usar) y del import roto en `modules/auth/index.js` hacia el `useAuth.js` ya eliminado.

5. **`_readSmart` — conectada.** Se le agregó el catch-up a D1 (escribe de vuelta si Supabase gana la comparación de timestamp) y se enganchó en la lectura principal de `siso_portal_empresa_docs` en `PortalEmpresaPage.jsx` (antes `d1Get` directo, sin reconciliación).

6. **Limpieza de código muerto confirmado.** `PortalPublicoTrabajador.jsx` y `modules/clinical/services/printService.js` (vacío) eliminados, junto con sus referencias rotas (`modules/patients/index.js`, y el test forense que los verificaba — actualizado para apuntar al portal público real, `WorkerPortalPage.jsx`).

7. **Bug preexistente no relacionado, corregido de paso:** `src/test/setup.js` usaba `beforeEach` sin importarlo — bloqueaba la ejecución de TODA la suite de tests (0 tests corrían). Una vez arreglado, se pudo verificar que 163 tests pasan; quedan 9 fallos preexistentes en 4 archivos (`src/sections/*` legacy con imports a rutas movidas, `LicenciasTab.jsx`, y 3 tests con rutas de import incorrectas) — no relacionados con el protocolo de igualación, documentados aquí para una futura limpieza separada.

**Pendiente para una siguiente iteración** (no corregido en esta pasada, por alcance/tiempo): Telemedicina sin conexión a D1 (hallazgo #7 de la matriz), y la verificación completa de la Sección C (áreas del monolito aún no comparadas contra el refactor).
