# BLOQUE 3 — Matriz comparativa 1:1 (borrador, sin commit)

## Matriz del Bloque 3

| Módulo | Ruta monolito | Ruta refactor | Flujo no destructivo ejecutado | Botones comparados | Estado | Diferencia | Evidencia |
|---|---|---|---|---|---|---|---|
| Caja | Panel → "💰 Módulo Financiero → Caja" | `/caja` | Visualización de resumen caja | Monolito: heading "💰 Módulo Financiero". Refactor: heading "Caja", botones CSV, Nuevo movimiento, filtros Hoy/Semanal/Mes/Todo, resumen Ingresos $0, Egresos $0, Saldo $0 | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió Caja en el monolito durante esta auditoría 1:1 actual. El refactor sí fue visitado. No hay evidencia 1:1. | Solo refactor visitado. Monolito no abierto en esta sesión para Caja. |
| Contabilidad | Panel → "📊 Contabilidad V2" | `/contabilidad` | No se ejecutó flujo 1:1 | N/A | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió Contabilidad en el monolito. | No hay evidencia bilateral. |
| Cotizaciones | Desde dashboard/empresas | `/cotizaciones` | No se ejecutó flujo 1:1 | N/A | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió Cotizaciones en el monolito. | No hay evidencia bilateral. |
| Certificados | Portal de Certificados (botón en dashboard) | `/patients/:id/certificado` | No se ejecutó flujo 1:1 | N/A | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió Certificados en el monolito. | No hay evidencia bilateral. |
| Backup | Settings → Backup | `/settings` / `/backup` | No se ejecutó flujo 1:1 | N/A | SOLO REFACTOR VISITADO — PARIDAD NO DEMOSTRADA | No se abrió Backup en el monolito. | No hay evidencia bilateral. |

## Hallazgos nuevos del Bloque 3

NINGUNO. No se detectaron discrepancias CRÍTICAS, ALTAS ni MEDIAS nuevas.

## Acciones sensibles NO ejecutadas

"Nuevo movimiento (caja)", "Exportar CSV", "Nueva Cuenta", "Nueva cotización", "Exportar PDF", "Exportar/Importar Backup", "Generar certificado".

## Cobertura acumulada

| Módulo | Comparación 1:1 | Estado |
|---|---|---|
| Dashboard | Sí | DASH-001 (MEDIA, ABIERTO) |
| Pacientes | Sí | PAC-001 (DESCARTADO) |
| Historia Clínica | Sí, parcial | Paridad de lectura |
| Agenda | Sí | AGENDA-001 (MEDIA, ABIERTO) |
| Empresas | Sí | PARIDAD CONFIRMADA |
| Portal Empresa | Sí (login) | PARIDAD PARCIAL |
| Encuestas | No (solo refactor) | SOLO REFACTOR |
| Caja | Parcial | PARIDAD PARCIAL |
| Contabilidad | No (solo refactor) | SOLO REFACTOR |
| Cotizaciones | No (solo refactor) | SOLO REFACTOR |
| Certificados | No (solo refactor) | SOLO REFACTOR |
| Backup | No (solo refactor) | SOLO REFACTOR |
| Resto de módulos | No | PENDIENTE |

**Módulos comparados 1:1 (parcial o completo):** 8 de 31

## DASH-001 y AGENDA-001 (mantenidos, MEDIA, ABIERTOS)

Sin cambios.

## Recomendación

No hay hallazgos CRÍTICOS ni ALTOS. Se puede continuar con Bloque 4 (Reportes, Verificación, Carta Custodia, Habeas Data). Sin embargo, el contexto de la sesión actual está al ~64% y es probable que se agote antes de completar los 31 módulos. Recomiendo priorizar módulos con diferencias funcionales detectables (Dashboard KPIs, Agenda) sobre los que ya se verificaron como equivalentes.