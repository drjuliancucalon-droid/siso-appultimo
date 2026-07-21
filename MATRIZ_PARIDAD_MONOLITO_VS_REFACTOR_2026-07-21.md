# Matriz de Paridad — Monolito (producción) vs Refactor (siso-appultimo)

**Fecha:** 2026-07-21
**Referencia de verdad:** `C:\Users\JQK3\ocupasaludparadesplegar\src\App.jsx` (61,556 líneas) + `siso-worker\index.js` (671 líneas), el sistema que **está en producción y funciona al 100%**.
**Objeto de comparación:** `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\` (225 archivos, ~62,000 líneas) + su propio `siso-worker\index.js`.

## ⚠️ Nota metodológica importante — léela antes de usar este documento

Los ~40 documentos `.md` de auditoría/protocolo que ya existen en esta carpeta (`PROTOCOLO_INTERVENCION.md`, `AUDITORIA_QUIRURGICA_2026-07-16.md`, etc.) están **confirmados desactualizados**: marcan como "⬜ Pendiente" ítems que el propio historial de git muestra como ya completados, y el propio `PROTOCOLO_INTERVENCION.md` tiene dos cifras de progreso distintas (69% en el encabezado, 51% en la tabla) que no coinciden entre sí. Este documento se construyó **leyendo el código fuente real de ambos proyectos**, no confiando en el estado que esos protocolos afirman. Si un ítem aparece aquí como "✅ Ya a la par" y el protocolo viejo lo marca "⬜ Pendiente", **confía en este documento** — fue verificado línea por línea.

Este documento cubre en profundidad las áreas de mayor riesgo (capa de datos/candados, autenticación, cierre de HC/portal, énfasis CONDUCCIÓN, SGSST/Telemedicina, IA, reportes, encuestas, empresas/facturación). La Sección C lista las áreas del monolito que aún **no se verificaron línea por línea contra el refactor** en esta pasada — no asumas que están bien ni que están mal, hay que auditarlas antes de darlas por cerradas.

---

## Resumen ejecutivo — los 10 hallazgos que más importan, en orden de severidad

| # | Severidad | Hallazgo | Impacto si no se corrige |
|---|:---:|---|---|
| 1 | 🔴 P0 | El `POST /store/chunked` del worker del refactor usa un contrato viejo (`{baseKey,pieces,meta}`) incompatible con el que su propio `d1Client.js` ya intenta usar (`{key,value}`, el atómico del monolito). Si alguna vez se hace `wrangler deploy` de ese worker sobre el backend compartido, **rompe el guardado de pacientes/HC de ambas apps**. | Pérdida total de guardado de pacientes/HC en producción |
| 2 | 🔴 P0 | En `HistoriaPage.jsx`, al cerrar una HC se escribe `siso_portal_empresa_docs_<nit>` como si fuera un **arreglo** (`d1WriteArrayMerge(...,'periodo')`), cuando el esquema real es un **objeto** `{nit,nombre,codigoAcceso,periodos:[...]}`. Esto **borra nit/nombre/código y todos los periodos previos** (informes, custodias, cuentas) cada vez que se cierra una HC. | El portal de empresa queda "sin documentos" tras el primer cierre de HC posterior a la migración |
| 3 | 🔴 P0 (seguridad) | Autenticación real (`LoginPage.jsx`) usa 8 usuarios semilla con **contraseñas en texto plano en el código fuente** (incluida una cuenta `super_admin`), no pasa por el store "oficial" (`authStore.login`), y el 2FA (`verifyTOTP`) acepta **cualquier código de 6 dígitos** sin validar el secreto real. | Cualquiera con acceso al bundle JS lee las contraseñas; el 2FA no protege nada |
| 4 | 🟠 P1 | `PortalEmpresaPage.jsx` y `PortalCertificadosEmpresa.jsx` están enrutados **dentro** de `ProtectedRoute` — una empresa cliente no puede llegar a su propio portal sin credenciales internas de SISO, a pesar de que ambas páginas ya implementan su propio login NIT+código. | El portal de empresa es inalcanzable para el usuario real al que está dirigido |
| 5 | 🟠 P1 | El worker del refactor **no aplica `_mergeProtegido`** en `/store/chunked` (solo compara tamaño total) — la fusión por id que sí funciona en `POST /store` normal no cubre pacientes/HC grandes que viajan trozeados. | Un cliente con estado viejo puede borrar pacientes/HC específicos aunque el array resultante tenga tamaño similar |
| 6 | 🟠 P1 | El formulario real de captura (`OccupationalHC.jsx`) no tiene **ningún campo** para el énfasis CONDUCCIÓN DE VEHÍCULOS, aunque impresión/certificado/IA sí lo soportan. | El médico no puede diligenciar ese énfasis manualmente |
| 7 | 🟠 P1 | SGSST y Telemedicina viven **100% en localStorage**, sin ninguna llamada a D1 — a diferencia de pacientes/empresas/HC/encuestas/facturación, que sí usan el patrón D1+merge+candado. | Se pierde matriz de riesgos, capacitaciones, accidentes, historial de teleconsultas al cambiar de dispositivo o limpiar el navegador |
| 8 | 🟡 P2 | `_readSmart` existe en `d1Client.js` del refactor pero **no la usa ningún componente** — todas las lecturas de `siso_portal_empresa_docs` son D1-solo, sin reconciliación con Supabase ni catch-up. | Regresión de un paso respecto al monolito de ANTES de hoy, y de dos pasos respecto al de HOY |
| 9 | 🟡 P2 | El QR de la firma digital **no se genera ni persiste al cerrar la HC** — solo el código de texto; la imagen se regenera cada vez que se imprime. | Inconsistencia menor, no bloqueante, pero distinto del comportamiento esperado |
| 10 | 🟡 P2 | Código muerto que puede confundir futuras auditorías: `PortalPublicoTrabajador.jsx` (555 líneas, arquitectura Supabase pre-D1, sin importar en ningún lado), `useAuth.js` (hook de auth huérfano), `modules/clinical/services/printService.js` (archivo vacío, contenido literal `"1"`). | Ninguno afecta el comportamiento actual, pero desperdicia tiempo de auditoría futura si no se elimina |

---

## Sección A — Hallazgos confirmados en detalle (verificados código-contra-código)

### A.1 Capa de datos y candados del worker

| Ítem | Monolito | Refactor | Veredicto |
|---|---|---|---|
| Regex `_PROTECTED` (patients, atenciones, hc, encuestas, companies, cartas_custodia, saved_reports, informes, users, portal_empresa_docs, portal_empresa_atenciones) | ✅ Implementado en `POST /store` y `POST /store/chunked` | ✅ Copia **idéntica carácter por carácter** en `POST /store` (incluye comentarios con hashes de commits del monolito: `3531448`, `a28c77e`, `1661b5f`, `50f852b`) | **A la par en `POST /store`** |
| `_mergeProtegido` (fusión por id/token para arrays) | ✅ | ✅ Idéntica | **A la par en `POST /store`** |
| `_mergePeriodosObjeto` (fusión por periodo para `siso_portal_empresa_docs`) | ✅ | ✅ Idéntica a nivel servidor | **A la par en el servidor**, pero inútil en la práctica porque el frontend no arma el objeto correcto (ver hallazgo #2) |
| `_mergeProtegido`/`_mergePeriodosObjeto` en `/store/chunked` | ✅ Se invoca antes de trocear | ❌ No se invoca — solo compara `totalBytes` | **Atrás** (hallazgo #5) |
| Contrato de `/store/chunked` | `{key, value}` atómico, servidor trocea | `{baseKey, pieces[], meta}` — troceo ya hecho en cliente | **Roto/incompatible** (hallazgo #1) |
| `GET /store/:key`, `/store/prefix`, `/store` — `decompressValue` (legacy gzip) | ✅ en las 3 rutas | ❌ Falta en las 3 | Riesgo de no leer valores `gz:` legacy compartidos |
| `GET /store/prefix` — exclusión de piezas de chunk | ✅ (`NOT GLOB '*__c[0-9]*'` etc., fix CPU-timeout 2026-07-11/12) | ❌ Escanea también las piezas de 500KB | Riesgo de reproducir el 503 por CPU timeout ya resuelto |
| `GET /health` | Ping barato (`SELECT 1`) salvo `?full=1` | Siempre corre 5 `COUNT(*)` | Consume cuota de lecturas D1 innecesariamente |
| `GET /storage-stats` | `SUM(LENGTH(value))` real | Estimado `filas*2048` | Cifras de uso de D1 poco confiables |
| `runDailySnapshot` (cron) | Rota snapshots ANTES de escribir + GC de chunks `__new` huérfanos | Rota DESPUÉS (orden viejo pre-fix), sin GC de huérfanos | Regresión a un bug ya corregido el 2026-06-15 |
| CANDADO 2 (HC cerrada inmutable por nombre de clave) | No existe | ✅ Existe, protección adicional | Válido, no conflictúa |
| CANDADO 3 (userId vs sufijo de clave) | No existe | Existe pero **inerte** — ningún cliente manda `X-Siso-UserId` | Diseñado pero no conectado |
| CANDADO 4/5 (DELETE: prefijos protegidos + backup automático) | No existe (DELETE sin restricciones) | ✅ Existe, protección adicional válida | El refactor está mejor aquí |
| CANDADO 6 (`/store/merge`, fusión on-demand) | No existe (la fusión automática de `_mergeProtegido` lo hace innecesario) | Existe pero es **opt-in** y el propio cliente del refactor no lo usa (usa su propio merge y llama a `POST /store` normal) | Enfoque más débil que el automático del monolito |
| `_readSmart` (lectura D1+Supabase reconciliada por fecha, con catch-up) | ✅ Con catch-up a D1 | Existe en `d1Client.js` pero **huérfana** (nadie la llama) y sin catch-up | **Atrás** (hallazgo #8) |

### A.2 `siso_portal_empresa_docs_<nit>` — el bug de esquema (hallazgo #2, detalle técnico)

En `src/pages/HistoriaPage.jsx` (líneas 465-469 del refactor):

```js
const periodoDoc = {
  periodo, docNumero: data.docNumero, nombres: data.nombres,
  codigoVerificacion: code, tipoExamen: data.tipoExamen,
  fechaExamen: data.fechaExamen, conceptoAptitud: data.conceptoAptitud,
};
await d1WriteArrayMerge(`siso_portal_empresa_docs_${nitClean}`, [periodoDoc], 'periodo');
```

`d1WriteArrayMerge` hace `Array.isArray(currentValue) ? currentValue : []` — como el valor real es un objeto `{nit,nombre,codigoAcceso,periodos:[...]}`, no un array, `currentList` queda `[]` y se escribe un array crudo `[periodoDoc]` **sobre** el objeto completo. Esto borra `nit`/`nombre`/`codigoAcceso` y todos los `periodos` previos (informes, custodias, cuentas ya publicadas). El propio `PortalEmpresaPage.jsx` del refactor (línea 141) espera `val.periodos` como array — tras el bug, ya no puede leer nada.

**Corrección exacta**: en vez de `d1WriteArrayMerge`, leer el objeto existente (`d1Get`), fusionar `periodoDoc` dentro de `existente.periodos` por `periodo` (mismo criterio de `_mergePeriodosObjeto`: preservar `informe`/`cuenta`/`custodia`/`certificados` no-null), y escribir de vuelta el objeto completo con `d1Set`.

### A.3 Autenticación (hallazgo #3, detalle)

Tres implementaciones coexistiendo, incompatibles entre sí:

1. **`src/stores/authStore.js`** — el store "oficial": SHA-256 simple sin salt, `verifyTOTP` acepta cualquier código de 6 dígitos.
2. **`src/pages/LoginPage.jsx`** — la que REALMENTE se usa: `SEED_USERS` con 8 usuarios y contraseñas en texto plano en un comentario y en el campo `password` del objeto; si no matchea, hace fetch directo a Supabase con la anon key hardcodeada; llama a `loginLocal(user)`, que **no verifica contraseña en absoluto** (asume que ya se autenticó antes). Tiene su propio `_verifyHash` que sí soporta PBKDF2+salt.
3. **`src/modules/auth/hooks/useAuth.js`** — hook huérfano, ningún import activo, reimplementa sesión in-memory sin persistencia real.

Consecuencia práctica: un usuario creado vía `UserForm.jsx` (PBKDF2+salt real) **no podría loguearse** por `authStore.login()`, porque esa función no sabe leer `passSalt`. El camino "seguro" y el camino "usado" no son compatibles entre sí.

**Correspondencia con el monolito**: el monolito SÍ tiene una puerta de recuperación de emergencia con código hardcodeado (`9207`, en `RecuperarAcceso`) y usuarios semilla (`initialUsers`) — pero esos usuarios de emergencia solo se usan como ÚLTIMO fallback si Supabase falla, y el flujo normal (`handleLogin`) sí verifica hash PBKDF2/SHA-256 real contra `siso_users`, con 2FA TOTP real (`_totpVerify`, HMAC-SHA1, RFC 6238) cuando está activado. La diferencia crítica es que en el refactor, el camino de **8 usuarios en texto plano es el PRIMARIO**, no un último recurso, y el 2FA no es real.

### A.4 Portales públicos (hallazgo #4, detalle)

- `WorkerPortalPage.jsx` → `WorkerPortal.jsx`: ruta pública real `/portal/:code`, fuera de `ProtectedRoute`, conectado a D1, funcional (87 líneas, correcto para su tamaño).
- `PortalPublicoTrabajador.jsx` (555 líneas): implementación completa pero **huérfana** — usa Supabase directo (arquitectura pre-D1), no está importada en ningún lado. Candidata a eliminar.
- `PortalEmpresaPage.jsx` (622 líneas) y `PortalCertificadosEmpresa.jsx` (715 líneas): **ambas** dentro de `ProtectedRoute` — inalcanzables para la empresa cliente real, a pesar de tener su propio login NIT+código construido. Además duplicadas funcionalmente entre sí (ambas leen las mismas claves, generan los mismos documentos) sin que quede claro cuál es la canónica.

**Corrección necesaria**: mover las rutas `portal-empresa` y `portal-certificados/:companyId` FUERA de `ProtectedRoute`, y decidir cuál de las dos implementaciones es la definitiva (eliminar la otra o fusionarlas).

### A.5 Énfasis CONDUCCIÓN DE VEHÍCULOS (hallazgo #6, detalle)

| Capa | Estado en refactor |
|---|:---:|
| Impresión (`src/lib/printService.js`) | ✅ Completo |
| Certificado (`CertificateView.jsx`) | ✅ Completo |
| IA (`aiAnalysis.js`) | ✅ Completo |
| **Formulario de captura (`OccupationalHC.jsx`)** | ❌ **Cero campos** — el médico no tiene dónde ingresar los datos |

Esta es la ÚNICA de las brechas que el protocolo interno viejo del proyecto acierta plenamente. Falta ~1 sección/tab en `OccupationalHC.jsx` (1432 líneas) con los inputs de: agudeza visual lejana/cercana, campimetría, discriminación de colores, visión de profundidad, audiometría, antecedentes neurológicos, consumo de sustancias, y las 5 pruebas psicomotrices (radio Bajo/Medio/Alto + detalle libre cada una), más valoración psicológica y observaciones finales — ver el detalle completo en la Sección D del monolito (Historia Clínica Ocupacional).

### A.6 Cierre de HC + Publicación al portal (hallazgo #5 y #9)

**Corrección al protocolo viejo del proyecto**: la afirmación de que este flujo está en "0%" es **falsa**. Vive en `src/pages/HistoriaPage.jsx`, función `handleCloseHC` (líneas 292-546), y está implementada al ~80-85%: valida concepto de aptitud, pide confirmación, genera hash SHA-256 + código de verificación, publica de forma bloqueante a 6 claves D1 (con el bug de esquema de A.2 en una de ellas), marca la cita de agenda como atendida, registra en atenciones, auto-genera movimiento de caja, y cierra la HC.

Lo que sí falta genuinamente:
- La imagen QR (librería `qrcode` real, no un placeholder) **no se genera ni persiste** en el momento del cierre — solo el código de texto. Se regenera bajo demanda cada vez que se imprime.
- No hay locking de concurrencia real para evitar doble cierre desde dos pestañas — el CANDADO 2 del worker solo protege claves cuyo *nombre* contiene `_cerrada`, y este flujo marca el estado *dentro* del objeto (`estadoHistoria: 'Cerrada'`), no en el nombre de la clave, así que ese candado no cubre este camino.

### A.7 SGSST y Telemedicina (hallazgo #7, detalle)

- **SGSST** (`sgsstService.js`, 9 colecciones: riesgos, planes, capacitaciones, inspecciones, documentos, accidentes, políticas, actividades, empleados): CRUD genérico que lee/escribe **exclusivamente `localStorage`** (prefijo `siso_sgsst_`). Los 8 componentes de UI (matriz de riesgos GTC-45, generador de políticas, etc.) son sustanciales, no placeholders — el problema es solo de persistencia.
- **Telemedicina** (`VideoConsult.jsx`): el "video" es un link a `meet.jit.si` público sin autenticación; todo el estado (consultas, cola de espera) vive en `localStorage`, sin ninguna llamada a D1.

Esto contrasta con el patrón del resto del sistema (pacientes, empresas, HC, encuestas, facturación), que sí usa D1+merge+candado del worker.

### A.8 Otros hallazgos menores confirmados

- **Key de Supabase hardcodeada como fallback** en 3 archivos (`useSaveData.js`, `useBackendData.js`, `LoginPage.jsx`): `sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7`. Es una key "publishable"/anon (no crítica en sí misma), pero debería venir solo de variable de entorno, sin fallback hardcodeado repetido en 3 lugares.
- **Duplicación posible**: `src/sections/CompaniesSection.jsx` (2009 líneas, legacy-style) vs los componentes de `src/modules/companies/` — no se verificó en esta pasada cuál es la fuente activa; requiere confirmación antes de decidir cuál conservar.
- **Código muerto**: `PortalPublicoTrabajador.jsx`, `useAuth.js`, `modules/clinical/services/printService.js` (vacío, contenido literal `"1"`) — no rompen nada activo, pero conviene eliminarlos para no confundir futuras auditorías (incluida la próxima pasada de este mismo documento).

---

## Sección B — Áreas ya verificadas como funcionales y sustanciales en el refactor (para no re-trabajar)

Estas áreas se revisaron código-contra-código y **sí tienen contenido real, no placeholders** — no requieren reconstruirse desde cero, solo ajustes puntuales si el prompt maestro los señala:

- Empresas: `CompanyForm.jsx`, `CompanyList.jsx`, `AnalisisDocsTab.jsx`, `EncuestasTab.jsx` (1005 líneas), `PropuestaEconomicaModal.jsx`.
- Facturación: `BillGenerator.jsx`, `CashBox.jsx`, `DIANExport.jsx`, `Proposals.jsx`.
- Usuarios: `UserForm.jsx` (PBKDF2+salt real, checklist de permisos), `UserList.jsx`, `LicenseManager.jsx`, `DoctorProfile.jsx`.
- IA: `aiProviders.js` (4 proveedores reales con failover), `aiAnalysis.js` (llamadas reales, no mocks).
- Reportes: `ripsService.js` (funcional, con fallback propio), `fhirService.js`, `EpidemiologicalReport.jsx` (1244 líneas), `SVEPrograms.jsx` (624 líneas).
- Encuestas: `SurveyResponsePage.jsx` (618 líneas, conectado a `d1Append`, de los módulos mejor integrados con el worker).
- Custodia: `CartaCustodiaPage.jsx` (506 líneas, funcional, con historial vía D1).
- Impresión: `src/lib/printService.js` (1361 líneas) y `printUtils.js` — sistema real, no placeholder, con QR real (`_generarQRDataUrl`) y hash SHA-256 real.

---

## Sección C — Áreas del monolito AÚN NO verificadas contra el refactor (pendientes para la próxima pasada)

Estas pantallas/funciones del monolito están completamente documentadas en el Apéndice (inventario completo), pero **no se comparó línea por línea contra su equivalente en el refactor** en esta auditoría. No asumas que están bien ni que están mal — es trabajo pendiente, no una brecha confirmada:

- Navbar completo (todos los botones/badges contextuales por vista y rol).
- Dashboard (8 tarjetas de estadísticas, panel de alertas administrativas, tabla de productividad por médico, registros recientes) — incluye la regla no obvia de que "Contabilidad V2" está restringida por username literal `drcucalon`, no por rol.
- Agenda y Sala de Espera/Asistencia (incluyendo el hallazgo de que `siso_agendados` en el monolito usa reemplazo total, no merge, y no está en la lista de protección anti-vacío).
- SVE (identificación heurística por texto de programas de vigilancia epidemiológica).
- ARL (el hallazgo de que `siso_arl_reportes` en el monolito nunca se escribe a D1, solo localStorage+Supabase, pero SÍ se lee de D1 en el merge de login — asimetría a verificar si el refactor la replica o la corrige).
- Habeas Data (persistencia más frágil del monolito: solo localStorage+Supabase, nunca D1).
- Verificación de Certificados (vista pública de validación por código/documento).
- Gestión de Pacientes — filtros, deduplicación por documento, badge de vencimiento de periodicidad.
- Planes/Precios, Propuestas Comerciales (el monolito ya documentó en su propio código un incidente real de pérdida de propuestas por reemplazo total, corregido con merge — confirmar que el refactor no repite ese patrón viejo en ningún punto no auditado).
- Perfil IPS, Caja, Contabilidad, Portafolio, Cotizaciones (en el monolito, Portafolio queda 100% local sin ningún respaldo en la nube — confirmar si el refactor lo iguala o lo mejora).
- Super Admin (panel multi-tenant/multi-organización).
- Modal de Evolución clínica, Overlay de Mensajería.
- Router principal — el monolito mapea 27 valores de `view` explícitos; confirmar que el router de rutas del refactor (`App.jsx`, react-router) cubre el mismo conjunto de pantallas sin huecos.
- 2FA TOTP real (RFC 6238) — el monolito sí lo implementa correctamente (`_totpVerify`); confirmar si en algún punto el refactor conecta esto de verdad o si `verifyTOTP` placeholder sigue siendo el único camino.
- Helpers de facturación por trabajador con posible `ReferenceError` en el monolito (`_getBillTrabajadores` y relacionados, definidos a nivel de módulo referenciando variables de otro scope) — verificar en runtime si esa función del monolito realmente funciona en producción antes de decidir si el refactor debe replicar el mismo patrón o corregirlo.
- Diagnóstico fijo `Z10.0` hardcodeado en el certificado del monolito sin importar el diagnóstico real — decidir conscientemente si el refactor debe replicar este comportamiento (probablemente intencional por norma) o corregirlo.

---

## Apéndice — Inventario completo del monolito por pantalla (referencia de verdad)

> Documento completo generado esta misma auditoría: `C:\Users\JQK3\AppData\Local\Temp\claude\C--Users-JQK3\c4a59b11-5783-4a4f-801d-7d83d7dcb39f\scratchpad\inventario_monolito.md` (1436 líneas). Cópialo a esta carpeta si necesitas conservarlo junto a este documento — contiene, pantalla por pantalla, cada botón, cada clave D1 exacta, y cada regla de negocio no obvia de los 20+ módulos del monolito (Login/2FA/Recuperación, Dashboard, HC Ocupacional completa con los 6 énfasis, HC General, Certificado de Aptitud, Reportes Epidemiológicos, Gestión de Pacientes, Empresas, Verificación de Certificados, Cuentas de Cobro, Portal Trabajador, SVE, ARL, Habeas Data, Telemedicina, Adjuntos, Usuarios y Permisos, Planes, Propuestas, Solicitud de Exámenes, Incapacidad General, Agenda, Sala de Espera, Portafolio, Cotizaciones, Contabilidad, Perfil IPS, Caja, Super Admin, Portal Empresa, Modal Evolución, Mensajería, Carta de Custodia, Router principal).
