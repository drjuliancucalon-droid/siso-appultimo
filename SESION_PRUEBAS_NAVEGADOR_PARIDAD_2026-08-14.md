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

## Próxima acción recomendada

1. Analizar causa raíz de `DASH-001` (máxima prioridad).
2. Ejecutar FASE E (bloqueo de HC cerrada) y FASE F (escritura reversible) tras autorización explícita del usuario.
3. Migrar `ConfigIPSPage.jsx` de localStorage a D1.