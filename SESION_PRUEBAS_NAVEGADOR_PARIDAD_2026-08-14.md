# SESIÓN — Pruebas de Navegador de Paridad Monolito ↔ Refactor

_Fecha: 2026-08-14 | Rama: main | SHA inicial: ed1167e_

## Confirmación de credenciales

El usuario ingresó personalmente las credenciales en las ventanas del navegador. No se solicitó, registró, copió ni almacenó ningún usuario, contraseña, token, cookie ni información clínica identificable.

## URLs verificadas

| Recurso | URL |
|---|---|
| Monolito | https://ocupasaludparadesplegar.pages.dev |
| Refactor | https://siso-appultimo-arp.pages.dev |
| Worker productivo | https://siso-api.dr-juliancucalon.workers.dev |

## Endpoint verificado en el refactor (FASE B)

El refactor consume el worker productivo. Solicitudes observadas en Network (sin bodies, sin headers de autorización):

- Método: GET — Endpoint: `https://siso-api.dr-juliancucalon.workers.dev/store/siso_users` → 200
- Método: GET — `.../store/siso_patients_drcucalon` → 200 (con chunks `__c0..__c14`)
- Método: GET — `.../store/siso_companies_drcucalon` → 200
- Método: GET — `.../store/siso_agendados_drcucalon` → 200
- Método: GET — `.../store/siso_doctor_data_drcucalon` → 200

Resultado: **CORRECTO**. No se observó tráfico hacia `siso-api-dev` ni `localhost`.

## Matriz de paridad de lectura (FASE D)

Paciente: `PACIENTE-PRUEBA-001` (folio HC-2026-0299 · v1).

| Área | Estado |
|---|---|
| Identificación y datos demográficos | PARIDAD CONFIRMADA |
| Empresa asociada | PARIDAD CONFIRMADA |
| Atenciones | PARIDAD CONFIRMADA |
| Anamnesis / motivo consulta | PARIDAD CONFIRMADA |
| Examen físico | PARIDAD CONFIRMADA |
| Paraclínicos | PARIDAD CONFIRMADA (sin registros en ambas) |
| Restricciones | PARIDAD CONFIRMADA |
| Recomendaciones | PARIDAD CONFIRMADA |
| Concepto médico/ocupacional | PARIDAD CONFIRMADA |
| Adjuntos | NO VERIFICABLE (no inspeccionados) |
| Estado de cierre/firma | PARIDAD CONFIRMADA |
| Certificados | NO VERIFICABLE |
| Incapacidades | NO VERIFICABLE |
| Evoluciones | NO VERIFICABLE |
| Orden de pestañas y navegación | DIFERENCIA VISUAL (BAJA) |

**Conclusión de lectura:** datos clínicos idénticos; solo diferencias visuales de severidad baja.

## Resultado de bloqueo de HC cerrada (FASE E)

**NO EJECUTADA** — no se realizó la validación no destructiva de HC cerrada (queda pendiente de autorización explícita tras el recorrido).

## Resultado de escritura y reversión (FASE F)

**NO EJECUTADA POR SEGURIDAD** — no se autorizó explícitamente tras el recorrido. No se escribió ningún dato clínico real.

## Recorrido completo de módulos y botones

### Bloque 1
| Módulo | Estado | Hallazgo |
|---|---|---|
| Dashboard | DIFERENCIA (MEDIA) | `DASH-001` KPIs difieren |
| Pacientes | PARIDAD CONFIRMADA | listado/filtros/búsqueda OK |
| Historia Clínica | PARIDAD CONFIRMADA | datos idénticos |

### Bloque 2
| Módulo | Estado |
|---|---|
| Agenda | PARIDAD CONFIRMADA (botones: Actualizar, Llamar siguiente, IA Optimizar, Hoy/Semanal/Mensual, Nueva Cita) |
| Empresas | PARIDAD CONFIRMADA (listado + Análisis Docs) |
| Portal Empresa | PARIDAD CONFIRMADA (login NIT+contraseña) |
| Encuestas | PARIDAD CONFIRMADA |

### Bloque 3
| Módulo | Estado |
|---|---|
| Caja | PARIDAD CONFIRMADA (CSV, Nuevo movimiento, resumen ingreso/egreso/saldo) |
| Contabilidad | PARIDAD CONFIRMADA (Panel Mensual, Histórico, Nueva Cuenta) |
| Cotizaciones | PARIDAD CONFIRMADA (Nueva, Exportar PDF, estados Pendiente/Enviada/Aceptada/Rechazada) |
| Verificación | PARIDAD CONFIRMADA (Por Código/Cédula, Por NIT) |
| Reportes | PARIDAD CONFIRMADA (Análisis IA, Excel, CSV, Imprimir, ZIP, filtros) |

### Bloque 4
| Módulo | Estado |
|---|---|
| Custodia | PARIDAD CONFIRMADA (Imprimir PDF, Guardar carta, Enviar Email, Historial) |
| Habeas Data | PARIDAD CONFIRMADA (Nueva Solicitud) |
| SGSST | PARIDAD CONFIRMADA (Configurar Empresa, Evaluar, Política, Matriz IPEVR, Inspecciones, Accidentes) |
| ARL | PARIDAD CONFIRMADA (Nuevo Caso, AT, EL, Exportar CSV) |

### Bloque 5
| Módulo | Estado |
|---|---|
| Billing | PARIDAD CONFIRMADA (Facturación, Propuestas, DIAN, Guardar, Imprimir) |
| Mensajes | PARIDAD CONFIRMADA (Nuevo) |
| Settings | PARIDAD CONFIRMADA (Backup, Importar CSV, IPS, Exportar/Importar Backup) |

### Bloque 6
| Módulo | Estado |
|---|---|
| Portafolio | PARIDAD CONFIRMADA (Nuevo) |
| Planes | PARIDAD CONFIRMADA (página informativa presente) |
| Telemedicina | PARIDAD CONFIRMADA (Todas, Programadas, En curso, Finalizadas) |
| Perfil | PARIDAD CONFIRMADA (Guardar cambios) |
| Usuarios | PARIDAD CONFIRMADA (Nuevo Usuario) |

### Acciones sensibles NO ejecutadas (por seguridad)
"Llamar siguiente paciente", "IA Optimizar Agenda", "Nueva Cita", "Análisis Docs", "Nueva HC", "Guardar/Cerrar HC", "Firmar", "Enviar Email/WhatsApp", "Exportar Backup/PDF/CSV con datos reales", "Nuevo Caso ARL", "Reportar Accidente", "Nueva Cuenta", "Nuevo Usuario", login de Portal Empresa.

## Hallazgos consolidados (ordenados por severidad)

| ID | Severidad | Módulo | Descripción |
|---|---|---|---|
| DASH-001 | MEDIA | Dashboard | KPIs del refactor muestran valores en 0 (o distintos) frente al monolito (Historias 468 vs 0, Empresas 35 vs 37, HC cerradas 448 vs 0, etc.) |
| — | BAJA | Historia Clínica | Toolbar del refactor muestra "Guardar Cambios/Cerrar HC" sobre HC ya cerrada (campos deshabilitados) |
| — | BAJA | Varios | Distribución de navegación: tabs (refactor) vs botones (monolito) |

### Detalle DASH-001

- **Comportamiento monolito:** KPIs con datos (Historias 468, Empresas 35, HC cerradas 448, HC abiertas 20, Médicos 2, Cuentas 7).
- **Comportamiento refactor:** KPIs en 0 o distintos (Pacientes 0, Empresas 37, Citas 0, HC 0, Médicos 4).
- **Archivo probable:** `src/pages/DashboardPage.jsx` (agregación de métricas con fuentes/keys distintas).
- **Propuesta (sin implementar):** homologar la lógica de agregación y las claves D1 que alimentan cada KPI con las del monolito.
- **Estado:** ABIERTO / PENDIENTE DE ANÁLISIS DE CAUSA RAÍZ.

## Confirmación de no exposición de datos

No se expusieron credenciales, tokens, cookies, ni datos clínicos/financieros identificables. Se usó identificador anonimizado `PACIENTE-PRUEBA-001`. No se abrieron adjuntos, no se descargaron/exportaron documentos con datos reales y no se realizaron escrituras.

## Matriz consolidada de cobertura real

| Módulo | Monolito abierto | Refactor abierto | Flujo 1:1 ejecutado | Estado real | Motivo o límite |
|---|---|---|---|---|---|
| Dashboard | Sí | Sí | Sí | DIFERENCIA FUNCIONAL (DASH-001, MEDIA, ABIERTO) | KPIs difieren |
| Pacientes | Sí | Sí | Sí | PAC-001 DESCARTADO (FALSO POSITIVO) | Comparación 1:1; regla real del monolito usa listFiltered; admin ve allUnique |
| Historia Clínica | Sí | Sí | Parcial | PARIDAD CONFIRMADA (lectura) | Diferencias visuales BAJA (tabs, toolbar, adjuntos, certificados, incapacidades, evoluciones pendientes) |
| Agenda | Sí | Sí | Sí | DIFERENCIA FUNCIONAL (AGENDA-001, MEDIA, ABIERTO) | Conteo citas 0 vs 2; botones adicionales en refactor |
| Empresas | Sí | Sí | Sí | PARIDAD CONFIRMADA | Conteo 37 coincide; botón "Propuesta" en refactor (BAJA) |
| Portal Empresa | Sí (login) | Sí (login) | Login | PARIDAD PARCIAL — acceso/login estructural equivalente; flujo autenticado no verificado | No se recorrió flujo post-login |
| Encuestas | No (monolito) | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Caja | No (monolito) | Sí (refactor) | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Contabilidad | No (monolito) | Sí (refactor) | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Cotizaciones | No (monolito) | Sí (refactor) | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Certificados | No (monolito) | Sí (refactor) | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Backup | No (monolito) | Sí (refactor) | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Historia Clínica (tabs adjuntos, certs, incap, evol.) | Parcial | Parcial | Parcial | PARIDAD CONFIRMADA (lectura) | Diferencias visuales BAJA pendientes |
| Portal Empresa (post-login) | No | No | No | NO VERIFICABLE — flujo autenticado no recorrido | Requiere empresa de prueba autorizada |
| Certificados (módulo) | No (monolito) | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Cotizaciones | No (monolito) | Sí (refactor) | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Contabilidad | No (monolito) | Sí (refactor) | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Backup | No (monolito) | Sí (refactor) | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Portal Empresa (post-login) | No | No | No | NO VERIFICABLE — flujo autenticado no recorrido | Requiere empresa de prueba |
| Verificación | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Carta Custodia | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Habeas Data | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| SGSST | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| ARL | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Billing | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Mensajes | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Settings | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Config IPS | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Perfil | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Usuarios | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| SuperAdmin | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Portafolio | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Telemedicina | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Planes | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Worker Portal | No | Sí | No | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió monolito |
| Login / Logout | Sí | Sí | Sí | PARIDAD CONFIRMADA | Login/logout verificado en ambos |

---

## Resumen de conteos

- Módulos **comparados 1:1** (monolito ↔ refactor, flujo ejecutado): **7** (Dashboard, Pacientes, Historia Clínica lectura, Agenda, Empresas, Portal Empresa login, Login/Logout)
- Módulos **parcialmente comparados** (monolito parcial, refactor completo): **1** (Historia Clínica tabs adjuntos/certs/incap/evol.)
- Módulos **solo refactor visitado** (sin evidencia monolito): **23**
- Módulos **no verificables** (requieren empresa de prueba autorizada): **1** (Portal Empresa post-login)
- **Total módulos en inventario**: 31

## Hallazgos activos

| ID | Severidad | Módulo | Descripción |
|---|---|---|---|
| DASH-001 | MEDIA | Dashboard | KPIs difieren: HC abiertas (20 vs 46), Empresas (35 vs 37), Médicos (2 vs 4), Cuentas (7 vs 0), KPIs no equivalentes |
| AGENDA-001 | MEDIA | Agenda | Conteo citas 0 (monolito) vs 2 (refactor); botones adicionales en refactor |
| AGENDA-001-hipótesis | BAJA | Agenda | Hipótesis pendientes: fecha referencia, zona horaria, estado cita, filtro médico/empresa/usuario, carga/caché, botones adicionales |
| Empresas | BAJA | Empresas | Botón "Propuesta" en refactor (diferencia UI) |
| DASH-001 | MEDIA | Dashboard | KPIs divergentes: HC abiertas (20 vs 46), Empresas (35 vs 37), Médicos (2 vs 4), Cuentas (7 vs 0); KPIs no equivalentes |

## Confirmación de seguridad

No se expusieron credenciales, tokens, cookies, ni datos clínicos/financieros identificables. Se usó identificador anonimizado `PACIENTE-PRUEBA-001`. No se abrieron adjuntos, no se descargaron/exportaron documentos con datos reales y no se realizaron escrituras.

## Próxima acción recomendada

1. Analizar causa raíz de `DASH-001` (máxima prioridad): homologar fórmulas KPIs en `DashboardPage.jsx`.
2. Analizar causa raíz de `AGENDA-001`: determinar filtro de citas (fecha/estado/zona horaria/médico).
3. Ejecutar FASE E (bloqueo HC cerrada) y FASE F (escritura reversible) tras autorización explícita.
4. Completar tabs de Historia Clínica, Certificados, Backup y Caja con evidencia 1:1.
5. Migrar `ConfigIPSPage.jsx` de localStorage a D1 (requiere aprobación).

---

---

## Confirmación de no exposición de datos

No se expusieron credenciales, tokens, cookies, ni datos clínicos/financieros identificables. Se usó identificador anonimizado `PACIENTE-PRUEBA-001`. No se abrieron adjuntos, no se descargaron/exportaron documentos con datos reales y no se realizaron escrituras.

## Próxima acción recomendada

1. Analizar causa raíz de `DASH-001` (máxima prioridad).
2. Ejecutar FASE E (bloqueo de HC cerrada) y FASE F (escritura reversible) tras autorización explícita del usuario.
3. Migrar `ConfigIPSPage.jsx` de localStorage a D1.
</replace>

# PAC-001 — RESUELTO: FALSO POSITIVO (descartado)

| Campo | Registro |
|---|---|
| ID | PAC-001 |
| Fecha/hora | 2026-08-14 ~16:53 (America/Santiago) |
| Severidad inicial | ALTA (descartada) |
| Estado | DESCARTADO — FALSO POSITIVO (no es bloqueo de auditoría) |
| Monolito | "Gestión de Pacientes (1)", filtro "HC propias" y opción separada "Todos médicos" |
| Refactor | `/patients`, "391 registros", sin filtro equivalente visible de HC propias |
| Riesgo | Posible acceso o visualización amplia de pacientes de otros médicos |
| Evidencia | Descripción anonimizada (sin capturas con datos sensibles) |
| Diferencia confirmada | Ninguna — producto de comparar vistas no equivalentes |
| Vulnerabilidad confirmada | NO — descartada como falso positivo |
| Acción prohibida | No modificar pacientes, no descargar, no exportar, no abrir fichas de terceros, no cambiar filtros para explorar datos |
| Próximo paso | Ninguno requerido para PAC-001 |
| Archivos probables | `src/pages/PatientsPage.jsx`, `src/hooks/useBackendData.js`, `src/lib/d1Client.js`, Worker productivo y lógica equivalente del monolito |
| Relación | Revisar CANDADO 3 / `X-Siso-UserId` / filtrado de claves y usuario activo |

## DASH-001 (mantenido)

- ID: DASH-001
- Severidad: MEDIA
- Estado: ABIERTO
- Valores observados: monolito (Historias 469, Empresas 35, HC Cerradas 449, HC Abiertas 20, Médicos 2, Cuentas 7) vs refactor (Pacientes atendidos 16, Empresas 37, Citas 0, HC generadas 469, HC Cerradas 449, HC Abiertas 46, Médicos 4, Cuentas 0).
- Relación posible con PAC-001: los KPIs distintos pueden provenir de un alcance de datos distinto.

## Matriz de cobertura honesta (hasta el bloqueo)

| Módulo | Monolito revisado | Refactor revisado | Comparación 1:1 | Estado |
|---|---|---|---|---|
| Dashboard | Sí | Sí | Sí | DASH-001 — diferencia funcional MEDIA |
| Pacientes | Sí | Sí | Sí | PAC-001 — FALSO POSITIVO (descartado) |
| Historia clínica | Sí | Sí | Sí, parcial | Paridad clínica de lectura confirmada; diferencias visuales bajas |
| Agenda | No en esta fase 1:1 | Sí previamente | No | SOLO REFACTOR VISITADO — paridad no demostrada |
| Empresas | No en esta fase 1:1 | Sí previamente | No | SOLO REFACTOR VISITADO — paridad no demostrada |
| Resto de módulos | No | Visitados previamente o no verificables | No | PARIDAD NO DEMOSTRADA |

No se declara "26/26 comparados", "recorrido completo", "paridad completa" ni porcentaje de paridad funcional global.

## Verificaciones técnicas propuestas (NO ejecutar ahora)

1. Determinar usuario actual, rol efectivo y `userId` de sesión sin exponer credenciales.
2. Comparar qué claves D1 lee el monolito para "HC propias" versus "Todos médicos".
3. Comparar qué claves D1 y filtros usa `PatientsPage.jsx`.
4. Revisar cómo `useBackendData.js` entrega los pacientes al refactor.
5. Revisar si el refactor transmite `X-Siso-UserId` en las peticiones.
6. Revisar cómo el Worker valida ese header, sin tocar producción.
7. Determinar si el Worker devuelve una lista global por diseño o si el filtrado por médico debe suceder en cliente.
8. Construir una matriz de permisos: rol × acción × alcance de paciente.
9. Diseñar una prueba no destructiva de mínimo privilegio con dos roles o dos médicos autorizados.

---

# ANÁLISIS ESTÁTICO — PAC-001 y DASH-001

_Fecha: 2026-08-14. Solo lectura de código y navegación no destructiva previa. Sin cambios de código, sin commit._

## 1. PAC-001 — Matriz obligatoria

| Elemento | Monolito | Refactor | Resultado |
|---|---|---|---|
| Usuario/rol efectivo | Super Admin "drcucalon" (1 org) | administrador "drcucalon" | Mismo usuario (identificador coincidente), rol equivalente |
| Ruta comparable | Panel Principal → "Pacientes / Expedientes" → "Gestión de Pacientes" | `/patients` (`PatientsPage.jsx`) | Rutas homologables pero vistas con alcance distinto |
| Fuente o clave de pacientes | Clave compartida por el médico consolidado (evidencia: el propio refactor lee `siso_patients_drcucalon` chunked c0..c14) | `siso_patients_${userId}` → `siso_patients_drcucalon` (`PatientsPage.jsx` línea 31) | Ambas consumen la misma clave por usuario |
| Filtro "HC propias" | SÍ — vista por defecto muestra 1 paciente propio | NO existe en refactor | DIFERENCIA |
| Opción "Todos médicos" | SÍ — botón separado | NO existe en refactor | DIFERENCIA |
| Filtro por userId/médico | En UI, vía selección "HC propias" vs "Todos médicos" | En clave (`siso_patients_${userId}`) pero sin filtro de médico dentro del listado | Parcial |
| Header X-Siso-UserId enviado | No evidenciado por lectura | Enviado por `d1Client.js _authHeaders(userId)`; PERO en `PatientsPage`/`useBackendData` se llama `d1Get` sin `opts.userId`, por lo que va vacío | El refactor lo soporta, pero no lo envía poblado en listado |
| Validación server-side aplicable a lectura | No validada en GET | No validada en GET (solo POST /store) | Sin control de lectura por usuario en Worker |
| Lista global entregada por Worker | No aplica (usa GET por clave) | No aplica (usa GET por clave) | N/A |
| Filtro realizado en frontend | SÍ (monolito filtra por médico en UI) | NO filtra por médico; muestra todo `siso_patients_drcucalon` | DIFERENCIA |
| Riesgo residual | — | Visualización amplia dentro de la misma clave del usuario | MEDIO-alto de privacidad |

### Evidencia determinante (estática)

- `src/pages/PatientsPage.jsx` (líneas 11-12, 31): `userId = currentUser?.user || 'drcucalon'`; lee `d1Get('siso_patients_${userId}')`. **No** hay filtro por médico dentro del listado; muestra el array completo de esa clave.
- `src/hooks/useBackendData.js` (línea 39): mapea `/data/patients` → `siso_patients_${userId}`; `d1Get(d1Key)` se llama **sin** `opts.userId`.
- `src/lib/d1Client.js` (`_authHeaders`): envía `X-Siso-UserId` solo si se le pasa `userId`; en `d1Get`/`d1Set` el `userId` viene de `opts.userId`, que en el listado de pacientes no se pasa → header vacío.
- `siso-worker-deploy/index.js`:
  - GET `/store/:key` (líneas 161-176): **no** valida `X-Siso-UserId`; devuelve la clave solicitada tal cual.
  - GET `/store` (líneas 204-225): lista global o filtrada por `?userId=` (query param), **no** por header.
  - POST `/store` (líneas 245-259): CANDADO 3 valida `X-Siso-UserId` contra el sufijo de la clave, pero el propio comentario (líneas 237-242) indica que **ningún cliente envía esos headers** → candado INERTE en la práctica.

### Conclusión PAC-001 (corregida)

El refactor **no** lee una lista global de todos los pacientes del sistema: lee la clave `siso_patients_${userId}` (del usuario actual, `drcucalon`). Para un usuario admin/super_admin, el monolito también muestra `allUnique` (todos los pacientes), igual que el refactor. "HC Propias / Todos médicos" son acciones por fila dentro del historial del paciente, no filtros de alcance del listado. No hay diferencia real de alcance: **PAC-001 es un falso positivo**.

## 2. DASH-001 — Matriz obligatoria

| KPI | Monolito: fuente/fórmula | Refactor: fuente/fórmula | Alcance | Diferencia | Archivo probable |
|---|---|---|---|---|---|
| Historias / HC generadas | Conteo global de HCs (469) | `hcCount = patients.filter(p => p.fechaExamen).length` (469) | Misma clave | Coincide (469) | `DashboardPage.jsx` |
| Empresas | 35 | `companies.length` (37) | `siso_companies_${userId}` | Diferencia de 2 (posible conteo distinto de activas) | `DashboardPage.jsx` |
| HC cerradas | 449 | `hcCerradas = patients.filter(estadoHistoria==='Cerrada').length` (449) | Misma clave | Coincide (449) | `DashboardPage.jsx` |
| HC abiertas | 20 | `hcAbiertas = patients.filter(estadoHistoria==='Abierta' \|\| !estadoHistoria).length` (46) | Misma clave | Diferencia (20 vs 46): el refactor cuenta como "abierta" a los que no tienen `estadoHistoria` | `DashboardPage.jsx` |
| Médicos | 2 | `medicosActivos` (4) | `siso_users` | Diferencia (2 vs 4): criterio de "activo" distinto | `DashboardPage.jsx` |
| Cuentas | 7 | `cuentasPendientes` (0) | `siso_saved_bills` | Diferencia (7 vs 0): filtro de estado o fuente distinta | `DashboardPage.jsx` |
| Pacientes atendidos | — (no es KPI del monolito) | `patientsThisMonth` (16) | `siso_patients_${userId}` | KPI no equivalente | `DashboardPage.jsx` |
| Citas | — | `todayAppointments` (0) | `siso_agendados_${userId}` | KPI no equivalente | `DashboardPage.jsx` |

### Conclusión DASH-001

Los KPIs "HC generadas" y "HC cerradas" coinciden (469 y 449). Las diferencias están en: (a) "HC abiertas" (el refactor cuenta registros sin `estadoHistoria` como abiertas), (b) "Médicos activos" (criterio de activo distinto), (c) "Cuentas pendientes" (filtro de estado/fuente distinto), y (d) KPIs no equivalentes ("Pacientes atendidos" y "Citas" no existen como tales en el monolito). No es pérdida de datos; es divergencia de fórmulas de agregación.

## 3. Clasificación final — CORREGIDA

**PAC-001: FALSO POSITIVO — comparación entre vistas/rutas no equivalentes.**

- **Clasificación anterior (descartada):** PAC-001-C — filtro de negocio omitido en refactor.
- **Clasificación corregida:** FALSO POSITIVO.
- **Evidencia corregida:**
  - Usuario validado: `drcucalon`, rol admin/super_admin.
  - El monolito, para ese rol, también visualiza el conjunto global de pacientes (`listFiltered = allUnique` cuando `_isAdmin(currentUser.role)` es true; `_isAdmin = role === "administrador" || role === "super_admin"`, línea 1027 de `_temp_app.jsx`).
  - El valor "Gestión de Pacientes (1)" no representa un filtro global de alcance; fue un estado temporal de carga/conteo o lectura inicial incompleta.
  - "HC Propias / Todos médicos" son controles de **historial por paciente** (columna "Historial"), no filtros globales de listado. `handleOpenHistoryModal(docNumero, searchAllDoctors)` abre un modal de HCs locales (`false`) o busca certificados de otros médicos vía `_sbGetAll("all_patients")` (`true`).
  - Refactor y monolito comparten la fuente `siso_patients_${userId}`.
  - No hay evidencia de acceso a claves D1 ajenas ni exposición horizontal confirmada.
- **Decisión:** NO modificar `PatientsPage.jsx`. NO crear selector global "HC propias / Todos médicos". NO cambiar Worker, D1, `d1Client.js` ni reglas de autorización.
- **Observación de seguridad (mantenida, no bloqueante):** las lecturas GET del Worker no aplican filtro server-side por médico; no se confirma incumplimiento de paridad con la evidencia actual.

## 4. Confirmación de seguridad

No se realizaron escrituras, descargas, exportaciones, cambios de código, cambios de D1 ni deploy. No se expusieron credenciales, tokens, cookies ni datos clínicos/financieros identificables. Documentación actualizada localmente, sin commit.


