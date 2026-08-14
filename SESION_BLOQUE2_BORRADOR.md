# BLOQUE 2 — Matriz comparativa 1:1 (borrador, sin commit)

_Generado tras comparación real en ambas apps. Sin datos personales/clínicos._

## Matriz obligatoria del Bloque 2

| Módulo | Ruta monolito | Ruta refactor | Flujo no destructivo | Botones comparados | Estado | Diferencia | Evidencia anonimizada |
|---|---|---|---|---|---|---|---|
| Agenda | Panel → "🗓️ Agenda" | `/agenda` | Vista de agenda con tabs de período | Monolito: 📊 Reporte asistencia, 📋 Hoy (0), 📅 Próximas (0), 📅 Semanal, 📊 Mensual. Refactor: Actualizar, Llamar siguiente, IA Optimizar, Reporte asistencia, 📋 Hoy, 📅 Semanal, 📊 Mensual, ➕ Nueva Cita | DIFERENCIA FUNCIONAL (MEDIA) | Monolito muestra "Hoy (0) / Próximas (0)" (sin citas); refactor muestra "2 cita" con botones adicionales (Actualizar, Llamar siguiente, IA Optimizar, Nueva Cita) | AGENDA-001: conteo de citas difiere (0 vs 2). |
| Empresas | Panel → "Empresas / Clientes" → "Empresas / Convenios (37)" | `/companies` | Listado + navegación de empresa | Monolito: 37 empresas; botones: Análisis Docs, Nueva Empresa, Convenios, Encuestas, y por fila Editar/Eliminar/Copiar/Abrir Portal. Refactor: 37 empresas (coincide); botones: Análisis Docs, Nueva Empresa, Convenios, Encuestas, y por fila Editar/Eliminar/Copiar/Abrir Portal + Propuesta | PARIDAD CONFIRMADA | Conteo coincide (37). Botones equivalentes (refactor añade "Propuesta" por fila; DIFERENCIA VISUAL BAJA) | Sin diferencias funcionales. |
| Portal Empresa | Desde Empresas → "🏢 Abrir Portal" por fila (login NIT+clave) | `/portal-empresa` (ruta pública) | Pantalla de login con tabs | Monolito: login NIT+clave desde botón en empresa. Refactor: "Portal Empresa", tabs 🏢 Empresa, 🔢 Código, 🪪 Cédula, botón Buscar | PARIDAD PARCIAL — acceso/login estructural equivalente; flujo autenticado no verificado | No se puede certificar paridad del portal sin recorrer flujo post-login con empresa de prueba | Solo login verificado. Resto del flujo pendiente. |
| Encuestas | Desde Empresas → "📋 Encuestas" por fila | `/encuestas` | Listado de encuestas | Monolito: acceso desde cada empresa. Refactor: módulo completo de Encuestas | SOLO REFACTOR VISITADO — paridad no demostrada | No se abrió el módulo de Encuestas en el monolito en esta sesión 1:1 | Pendiente para próxima sesión. |

## Hallazgos nuevos del Bloque 2

| ID | Severidad | Módulo | Descripción |
|---|---|---|---|
| AGENDA-001 | MEDIA | Agenda | Monolito "Hoy (0)" y "Próximas (0)" vs refactor "2 cita". Hipótesis pendientes (sin decidir/corregir): diferencia de fecha de referencia (hoy/semana/mes), zona horaria, estado (agendada/cancelada/atendida), filtro por médico/empresa/usuario, carga/caché de `siso_agendados_${userId}`, o botones adicionales del refactor que podrían ser funcionalidades no equivalentes. |

## Acciones sensibles NO ejecutadas

"Llamar siguiente paciente", "IA Optimizar Agenda", "Nueva Cita", "Editar/Eliminar empresa", "Abrir Portal empresa", "Crear/editar encuesta", login de Portal Empresa.

## Cobertura acumulada

| Módulo | Comparación 1:1 | Estado |
|---|---|---|
| Dashboard | Sí | DASH-001 (MEDIA, ABIERTO) |
| Pacientes | Sí | PAC-001 (DESCARTADO) |
| Historia Clínica | Sí, parcial | Paridad de lectura confirmada |
| Agenda | Sí | AGENDA-001 (MEDIA, ABIERTO) |
| Empresas | Sí | PARIDAD CONFIRMADA |
| Portal Empresa | Sí (login) | PARIDAD PARCIAL (flujo autenticado no verificado) |
| Encuestas | No (solo refactor) | SOLO REFACTOR VISITADO |
| Resto de módulos | No | PENDIENTE |

**Módulos comparados 1:1:** 6 de 31 (Dashboard, Pacientes, HC, Agenda, Empresas, Portal Empresa parcial)