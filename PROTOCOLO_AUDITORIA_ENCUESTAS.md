# PROTOCOLO DE AUDITORÍA COMPLETA — MÓDULO DE ENCUESTAS
## Monolito Forense vs Refactorizado
_Última actualización: 2026-07-10 10:22_

---

## 1. RESUMEN EJECUTIVO

Se realizó auditoría forense con **5 agentes especializados en paralelo** (134 tool calls) comparando el módulo de encuestas del monolito (`ocupasaludparadesplegar-forense/src/App.jsx`, 60,389 líneas) contra el refactorizado (`src/modules/companies/components/EncuestasTab.jsx`, 722 líneas + `src/pages/EncuestasPage.jsx`, 371 líneas).

**Hallazgo principal**: El refactorizado `EncuestasTab.jsx` (722 líneas) es una implementación POST-auditoría que YA contiene la mayoría de las 9 funciones requeridas, pero con brechas específicas que deben cerrarse.

---

## 2. TABLA COMPARATIVA DE LAS 9 FUNCIONES

| # | Función | Monolito (línea aprox.) | Refactorizado | Estado | Brecha |
|---|---------|------------------------|---------------|--------|--------|
| 1 | **⟳ Recargar desde nube** | L19493-19549 `_reloadEncuestasFromSupabase` | `EncuestasTab.jsx:51-58` carga inicial | ⚠️ PARCIAL | Falta botón de recarga manual + merge D1→local |
| 2 | **💾 Guardar en nube** | L35630 `_sbSet` + `_writeArrayMergeD1` | `EncuestasTab.jsx:76` `d1WriteArrayMerge` | ✅ EXISTE | Guarda en D1 con merge, pero sin botón explícito "Guardar en nube" |
| 3 | **✅ Importada** | L35728-35739 | `EncuestasTab.jsx:543` badge condicional | ✅ EXISTE | Badge "✅ Importada" visible cuando `numImports > 0` |
| 4 | **📋 Copiar Link** | L35644 `_sisoStableOrigin + enc.token` | `EncuestasTab.jsx:69-74` `genToken()` | ✅ EXISTE | Genera token aleatorio, copia al portapapeles con feedback |
| 5 | **👁️ Ver Respuestas** | L35650 D1→Supabase fallback | `EncuestasTab.jsx:154-161` `d1Get` con fallback | ✅ EXISTE | Carga de D1, expande tabla inline, muestra conteo |
| 6 | **⬆️ Importar Pacientes** | L35660-35740 flujo completo | `EncuestasTab.jsx:167-238` `handleExcelImport` | ⚠️ PARCIAL | Importa desde Excel, no desde respuestas de encuesta directas |
| 7 | **📄 Descargar PDF** | L35680 HTML imprimible via `window.print()` | `EncuestasTab.jsx:251-296` HTML imprimible premium | ✅ EXISTE | Ventana nueva con estilos, botón imprimir, datos formateados |
| 8 | **📅 Agendar Todos** | L35700 agenda desde respuestas | `EncuestasTab.jsx:241-248` marca "Agendado" | ⚠️ PARCIAL | Solo marca estado, no crea citas reales en Agenda |
| 9 | **📊 Cargar Excel** | L35485 XLSX/SheetJS | `EncuestasTab.jsx:167-238` `handleExcelImport` | ✅ EXISTE | Importa XLSX con mapeo de columnas + anti-duplicados |

### Leyenda
- ✅ EXISTE: Funcionalidad implementada y funcional
- ⚠️ PARCIAL: Existe base pero falta completitud
- ❌ AUSENTE: No implementado

---

## 3. ESTRATEGIA DE PERSISTENCIA — PROTECCIÓN ANTI-PÉRDIDA

### 3.1 Arquitectura 3-capas (monolito)
```
Capa 1 (AUTORITATIVA): Cloudflare Worker D1 → siso-api.dr-juliancucalon.workers.dev
Capa 2 (BACKUP):        Supabase REST API → yqrrktrgoijgzccrxnpz.supabase.co  
Capa 3 (LOCAL):         localStorage (5-10MB) + IndexedDB (espejo)
```

### 3.2 Evaluación de riesgos

| Riesgo | Severidad | Monolito | Refactorizado | Acción requerida |
|--------|-----------|----------|---------------|------------------|
| **D1 caído** | Media | ✅ Fallback a Supabase automático | ⚠️ Solo localStorage fallback | Agregar `_readSmart()` con Supabase |
| **Supabase 522** | Media | ✅ Timeout 8s + abort | ❌ No usa Supabase | No aplica (solo D1) |
| **Escritura sin verificar** | Alta | ✅ Write-back verify con reintentos | ⚠️ D1 con retry (3 intentos), sin verify explícito | Agregar `verificarEscritura()` post-save |
| **Pérdida offline** | Alta | ✅ Cola `siso_pending_d1_writes` + re-sync | ❌ Sin cola offline | Implementar `_enqueuePendingD1` |
| **Sobreescritura concurrente** | Media | ✅ `If-Match` locking en D1 | ✅ `ifMatchTs` en `d1Set` | Ya cubierto |
| **Datos solo en localStorage** | Alta | ✅ 3-capas siempre | ⚠️ Si D1 falla, solo LS | Agregar alerta "Datos solo locales" |
| **Snapshot/backup** | Baja | ✅ Snapshots diarios automáticos (cron 6AM) | ✅ Mismo worker D1 | Ya cubierto |

### 3.3 Cross-device / multi-usuario

| Escenario | Monolito | Refactorizado |
|-----------|----------|---------------|
| Trabajador llena desde celular | ✅ D1 es fuente de verdad, cualquier dispositivo lee de ahí | ⚠️ Si D1 tiene token, sí; sin token solo localStorage local |
| Admin ve respuestas en otro PC | ✅ Lectura D1→Supabase fallback | ⚠️ Depende de D1 con token |
| Dos personas responden simultáneamente | ✅ `d1WriteArrayMerge` con `If-Match` previene pérdida | ✅ Mismo mecanismo |
| Sincronización inmediata | ✅ <1s D1, ~2-5s Supabase | ⚠️ <1s D1 (si token configurado) |

---

## 4. BRECHAS DETECTADAS — PLAN DE ACCIÓN

### Prioridad CRÍTICA (Alta)

#### B-1: `⟳ Recargar desde nube` — Botón de recarga manual
- **Qué falta**: Botón visible "⟳ Recargar desde nube" en `EncuestasTab.jsx`
- **Monolito**: `_reloadEncuestasFromSupabase` — busca en D1 por prefijo `siso_encuestas`, mergea con localStorage
- **Implementar**: Botón con `onClick={recargarDesdeD1}` que llame a `d1Get(SURVEYS_KEY)` y actualice estado

#### B-2: `⬆️ Importar Pacientes desde respuestas` (no Excel)
- **Qué falta**: Botón que convierta respuestas de encuesta → pacientes directamente
- **Monolito**: L35660-35740 — lee respuestas, mapea campos (nombres, docNumero, eps, cargo, etc.), crea paciente con `id: "pac_enc_..."`
- **Implementar**: Nueva función `importarDesdeRespuestas(encId)` que lea `d1Get(siso_encuesta_resps_${encId})`, mapee campos del perfil sociodemográfico a `initialOccupPatientState`, y use `d1WriteArrayMerge` en `siso_db_patients_${userId}`

#### B-3: `📅 Agendar Todos` — Crear citas reales
- **Qué falta**: El botón actual solo marca estado "Agendado", no crea citas en el módulo Agenda
- **Monolito**: Agenda citas de tipo "Valoración Ocupacional" para cada trabajador importado
- **Implementar**: Conectar con `src/modules/agenda/components/AgendaView.jsx` o el store de agenda para crear citas reales

### Prioridad MEDIA

#### B-4: `💾 Guardar en nube` — Botón explícito
- **Qué falta**: Botón dedicado "💾 Guardar en nube" visible, similar al monolito
- **Monolito**: Botón con indicador de estado (saving→ok/error)
- **Implementar**: Agregar botón con `useState` para tracking de sync status

#### B-5: Write-back verify en escrituras
- **Qué falta**: Verificación post-escritura (leer después de guardar para confirmar)
- **Monolito**: `_verifyWrite(respId)` re-lectura de D1/Supabase
- **Implementar**: En `handleExcelImport` y `agendarTodos`, agregar verificación post-`d1WriteArrayMerge`

#### B-6: Indicador de fuente de datos (D1 vs Local)
- **Qué falta**: Mostrar badge "☁️ D1" o "💾 Local" como en `EncuestasPage.jsx`
- **Implementar**: Agregar indicador visual de si los datos vienen de D1 o localStorage

---

## 5. ESTADOS VISUALES DE ENCUESTA

| Estado | Badge | Condición | Refactorizado |
|--------|-------|-----------|---------------|
| **Activa** | 🟢 Activa | `enc.activo !== false` y sin importaciones | ✅ `EncuestasTab.jsx:526` |
| **Importada** | ✅ Importada | `numImports > 0` (trabajadores importados) | ✅ `EncuestasTab.jsx:543` |
| **Cerrada/Inactiva** | ⚫ Inactiva | `enc.activo === false` | ❌ No implementado |
| **Error sync** | 🔴 Error | Falló guardado en D1 | ❌ No implementado |

---

## 6. FLUJO END-TO-END (MONOLITO)

```
ADMINISTRADOR                          TRABAJADOR
───────────                            ──────────
1. Crea encuesta (empresa, tipo)       
2. Copia link (token único) ────────→ 3. Abre link público (sin login)
                                       4. Llena perfil sociodemográfico (25+ campos)
                                       5. Envía → D1 + verify → ✅ confirmación
6. Ve respuestas en tabla ←──────────
7. Importa pacientes (resp→HC)
8. Agenda citas (valoración ocup.)
9. Descarga PDF
10. Carga Excel (batch import)
```

---

## 7. PRÓXIMOS PASOS CONCRETOS

1. **[CRÍTICO]** Implementar botón `⟳ Recargar desde nube` en `EncuestasTab.jsx`
2. **[CRÍTICO]** Implementar `⬆️ Importar Pacientes` desde respuestas (no Excel)
3. **[CRÍTICO]** Conectar `📅 Agendar Todos` con módulo Agenda
4. **[MEDIO]** Agregar botón `💾 Guardar en nube` con indicador de sync status
5. **[MEDIO]** Agregar write-back verify en todas las escrituras D1
6. **[MEDIO]** Agregar badge de fuente (D1/Local) en listado de encuestas
7. **[BAJO]** Implementar estado "Cerrada/Inactiva" para encuestas
8. **[BAJO]** Implementar cola offline `siso_pending_d1_writes` en el frontend

---

## 8. ARCHIVOS INVOLUCRADOS

| Archivo | Acción |
|---------|--------|
| `src/modules/companies/components/EncuestasTab.jsx` | Modificar — agregar brechas B-1 a B-8 |
| `src/pages/EncuestasPage.jsx` | Sin cambios (legacy, reemplazado por EncuestasTab) |
| `src/pages/SurveyResponsePage.jsx` | ✅ Ya actualizado (perfil sociodemográfico completo) |
| `src/lib/d1Client.js` | Sin cambios (ya soporta todas las operaciones necesarias) |
| `siso-worker/index.js` | Sin cambios (D1 Worker ya tiene snapshots, merge, etc.) |

---

_Protocolo generado por 5 agentes de auditoría forense en paralelo._
_Auditado contra: monolito `ocupasaludparadesplegar-forense/src/App.jsx` (60,389 líneas) y refactorizado `src/` (722 líneas EncuestasTab)._