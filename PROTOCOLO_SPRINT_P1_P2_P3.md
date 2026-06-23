# PROTOCOLO QUIRÚRGICO — SISO OcupaSalud
## Estado Real del Sistema + Plan de Cambios Pendientes
### Fecha: 2026-06-23 · Basado en lectura directa del código fuente

> ⚠️ NO HACER CAMBIOS hasta autorización explícita.
> Cada incisión está identificada por archivo, número de línea y riesgo.

---

## PARTE 0 — CORRECCIÓN CRÍTICA: TAREAS MAL CLASIFICADAS COMO PENDIENTES

Tras leer el código fuente directamente, estas tareas **YA ESTÁN IMPLEMENTADAS**
y no requieren trabajo adicional:

| Tarea | Estado Real | Evidencia |
|-------|-------------|-----------|
| Sprint A3 — PhysicalExam 29 sistemas | ✅ YA TIENE 29 | `initialStates.js` líneas 107-144: 29 claves exactas |
| Sprint A4 — RecommendationsPanel/RestrictionsPanel | ✅ YA COMPLETOS | `RecommendationsPanel.jsx` 110 líneas + catálogo 223 líneas; `RestrictionsPanel.jsx` 124 líneas + catálogo 470 líneas; ambos conectados en `HistoriaPage.jsx` líneas 796-835 |
| Sprint C4 — CartaCustodiaPage Supabase→D1 | ✅ YA MIGRADO | Comentario línea 24: "Supabase eliminado"; `handleSave` usa `d1WriteArrayMerge` línea 104; `useBackendData` tiene D1 como primario |
| Sprint D2 — Auto-registro caja al cerrar HC | ✅ YA IMPLEMENTADO | `HistoriaPage.jsx` líneas 463-490: `handleCloseHC` escribe a `siso_caja_movs_${userId}` con tarifa por tipo de examen |
| Sprint B — Encuestas ver respuestas + importar | ✅ YA IMPLEMENTADO | `EncuestasTab.jsx` líneas 147-165 (verRespuestas), 166-209 (handleExcelImport XLSX), 209-228 (descargarPDF), botones líneas 498-535 |

**Impacto:** No desperdiciar esfuerzo en código que ya funciona.

---

## PARTE 1 — BUGS REALES ENCONTRADOS (5 problemas)

---

### 🔴 BUG-C1 — CartaCustodiaPage.jsx: userId Hardcodeado
**Archivo:** `src/pages/CartaCustodiaPage.jsx`
**Severidad:** MEDIA — afecta solo cuando el usuario NO es drcucalon

**Problema exacto:**
```
Línea 28: const { currentUser } = useAuthStore();
Línea 29: useBackendData('/data/companies', 'siso_companies_drcucalon', ...)  ← hardcoded
Línea 30: useBackendObject('/data/doctor',  'siso_doctor_data_drcucalon', ...) ← hardcoded
Línea 73: const userId = currentUser?.id || 'drcucalon'  ← .id en vez de .user
```

El hook `useBackendData` usa D1 correctamente (endpoint mapea a `siso_companies_${userId}` dinámico),
pero el parámetro `localStorageKey` como fallback está hardcodeado → si D1 falla, carga datos de drcucalon.

**Fix quirúrgico (3 líneas):**
```jsx
// ANTES línea 28-30:
const { currentUser } = useAuthStore();
const { data: companies } = useBackendData('/data/companies', 'siso_companies_drcucalon', 'companies');
const { data: doctor }    = useBackendObject('/data/doctor', 'siso_doctor_data_drcucalon', 'doctor');

// DESPUÉS:
const { currentUser } = useAuthStore();
const userId = currentUser?.user || currentUser?.id || 'drcucalon';
const { data: companies } = useBackendData('/data/companies', `siso_companies_${userId}`, 'companies');
const { data: doctor }    = useBackendObject('/data/doctor',  `siso_doctor_data_${userId}`, 'doctor');

// Y línea 73 cambia:
// ANTES:  const userId = currentUser?.id || 'drcucalon';
// DESPUÉS: (eliminar esta línea — userId ya declarado arriba)
```

**Riesgo del fix:** BAJO. Solo cambia la clave de localStorage-fallback. D1 ya funcionaba bien.
**Archivos tocados:** 1 (CartaCustodiaPage.jsx)

---

### 🔴 BUG-D1 — CertificateView.jsx: Sin enlace WhatsApp
**Archivo:** `src/modules/clinical/components/CertificateView.jsx`
**Severidad:** MEDIA — funcionalidad del monolito ausente

**Problema:**
El monolito tiene un botón que genera un mensaje WhatsApp pre-llenado con:
- Nombre del paciente
- Concepto de aptitud
- Fecha del examen
- URL de verificación QR

La versión refactorizada solo tiene el QR, sin el botón wa.me para compartir.

**Dónde insertar (sin tocar lógica existente):**
El certificado no tiene acciones — el botón vive en la PAGE que envuelve la vista
(`CertificadoPage.jsx`), NO dentro del documento imprimible.

**Fix quirúrgico:**
En `src/pages/CertificadoPage.jsx`, después del botón "Imprimir" existente, agregar:

```jsx
// Importar al inicio:
import { MessageCircle } from 'lucide-react';

// Después del botón handlePrint (aprox. línea 68):
<button
  onClick={() => {
    if (!patient) return;
    const domain = import.meta.env?.VITE_STABLE_DOMAIN || 'https://siso-appultimo-arp.pages.dev';
    const url = `${domain}/verificar/${patient.codigoVerificacion}`;
    const msg = encodeURIComponent(
      `✅ *Certificado de Aptitud Laboral*\n` +
      `👤 ${patient.nombreCompleto || patient.nombres || ''}\n` +
      `🏥 Concepto: ${patient.conceptoAptitud || ''}\n` +
      `📅 Fecha: ${patient.fechaExamen || ''}\n` +
      `🔗 Verificar: ${url}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }}
  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold"
>
  <MessageCircle size={16} /> Compartir WhatsApp
</button>
```

**Riesgo del fix:** MÍNIMO. Agrega un botón new, no modifica lógica existente.
**Archivos tocados:** 1 (CertificadoPage.jsx)

---

### 🟡 BUG-C2 — CertificadoPage.jsx: clave localStorage obsoleta
**Archivo:** `src/pages/CertificadoPage.jsx`
**Severidad:** BAJA — solo afecta fallback offline

**Problema línea 7:**
```jsx
const { data: patients, loading } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
```
La clave localStorage `siso_db_patients` es la clave LEGACY del monolito antiguo.
La clave actual del sistema es `siso_patients_${userId}`.

Si un dispositivo tiene datos en la clave legacy, el fallback carga datos obsoletos.

**Fix quirúrgico (1 línea):**
```jsx
// ANTES:
const { data: patients, loading } = useBackendData('/data/patients', 'siso_db_patients', 'patients');
// DESPUÉS:
const userId = useAuthStore.getState().currentUser?.user || 'drcucalon';
const { data: patients, loading } = useBackendData('/data/patients', `siso_patients_${userId}`, 'patients');
```

**Riesgo:** MÍNIMO. D1 es primario, esto solo alinea el fallback.
**Archivos tocados:** 1 (CertificadoPage.jsx)

---

### 🟡 BUG-ANA1 — AnalisisDocsTab.jsx: Carta de custodia como .txt plano
**Archivo:** `src/modules/companies/components/AnalisisDocsTab.jsx`
**Severidad:** BAJA — funciona pero sin membrete

**Problema:**
La carta de custodia se genera como archivo `.txt` sin formato.
El monolito genera un PDF con membrete idéntico a `CartaCustodiaPage.jsx`.

**Solución sin riesgo (navegar a CartaCustodiaPage pre-filtrada):**
En lugar de generar el .txt, el botón "Generar carta" debe:
1. Guardar en sessionStorage: empresa, nit, mes
2. Navegar a `/carta-custodia`
CartaCustodiaPage ya tiene toda la lógica de impresión/PDF.

**Fix quirúrgico:**
```jsx
// En AnalisisDocsTab.jsx, reemplazar handleGenerarCarta con:
const handleGenerarCarta = (bloque) => {
  sessionStorage.setItem('siso_carta_preselect', JSON.stringify({
    empresa: bloque.empresa,
    nit: bloque.nit,
    mes: bloque.mes,  // formato 'YYYY-MM'
  }));
  window.location.hash = '#carta-custodia';
  // O si usa react-router:
  // navigate('/carta-custodia');
};
```

Y en `CartaCustodiaPage.jsx`, al montar, leer el preselect:
```jsx
useEffect(() => {
  const preselect = sessionStorage.getItem('siso_carta_preselect');
  if (preselect) {
    try {
      const { empresa, nit, mes } = JSON.parse(preselect);
      const empresa_id = (companies || []).find(c => c.nit === nit || c.nombre === empresa)?.id;
      if (empresa_id) setSelectedCompanyId(empresa_id);
      if (mes) {
        const [anio, mesNum] = mes.split('-');
        setMesVal(Number(mesNum) - 1);
        setAnioVal(Number(anio));
      }
      sessionStorage.removeItem('siso_carta_preselect');
    } catch {}
  }
}, [companies]);
```

**Riesgo:** BAJO. Usa sessionStorage temporal. No modifica flujos existentes.
**Archivos tocados:** 2 (AnalisisDocsTab.jsx + CartaCustodiaPage.jsx)

---

### 🟡 BUG-RS1 — ReporteSection.jsx: Componente DESCONECTADO (dead code)
**Archivo:** `src/sections/ReporteSection.jsx` (1908 líneas)
**Severidad:** INFORMATIVA — no causa errores pero es código muerto

**Hallazgo:**
`ReporteSection` solo es importado en `src/test/sections-imports.test.js`.
Ninguna página del router lo usa. El app usa `Reporte.jsx` → `EpidemiologicalReport.jsx` (reescrito).

`ReporteSection` espera un `ctx.exportPatientTable` que nunca se provee.

**Opciones:**
A) MANTENER como referencia (no borrar) — recomendado por seguridad
B) Crear `ReportesPage.jsx` que lo envuelva con un ctx correcto

**Recomendación:** No tocar por ahora. El `EpidemiologicalReport.jsx` ya cubre toda la funcionalidad.
Si en el futuro se quiere recuperar `Matriz Legal` o `Marco Normativo` de ReporteSection,
se migra esa sección a EpidemiologicalReport como tab adicional.

---

## PARTE 2 — NUEVAS FUNCIONALIDADES DETECTADAS EN EL MONOLITO

Estas funciones existen en el monolito pero NO en el refactorizado:

---

### 🆕 NUEVA-1 — Tab "Matriz Legal" en Reportes
**Referencia:** `src/sections/ReporteSection.jsx` líneas 1396-1420
**Estado:** Existe en ReporteSection (dead code), NO en EpidemiologicalReport.jsx

El monolito muestra una tabla: Diagnóstico → Norma aplicable → Artículo → Obligación del empleador.
Ejemplo: "Hipoacusia → Res.1843/2025 Art.42 → Examen periódico obligatorio"

**Plan de implementación:**
Agregar un tab "⚖️ Marco Legal" a `EpidemiologicalReport.jsx` que renderice:
1. Tabla estática con normativa SST aplicable (ya existe en ReporteSection líneas 1530-1560)
2. Si hay diagnósticos CIE-10, cruzarlos con normativa (IA o lookup table)

**Archivos a tocar:** 1 (EpidemiologicalReport.jsx — agregar tab y contenido estático)
**Riesgo:** MÍNIMO. Solo agrega un tab nuevo. No toca lógica existente.

---

### 🆕 NUEVA-2 — Botón "Exportar PDF Tabla" en Reportes
**Referencia:** `src/sections/ReporteSection.jsx` líneas 330-367
**Estado:** Existe en ReporteSection, SÍ existe en EpidemiologicalReport.jsx (botón Imprimir)

El botón Imprimir actual llama `window.print()` — correcto.
La diferencia es que el monolito abre una VENTANA NUEVA con HTML estilizado.

**Mejora opcional (no crítica):**
Reemplazar `window.print()` con `openPrintWindow()` (ya importado en otros archivos):
```jsx
import { openPrintWindow } from '../../../lib/printService';
// ...
const handlePrintTabla = () => {
  const html = generarHTMLTablaResultados(filteredData, filterEmpresa);
  openPrintWindow('Reporte SISO', html);
};
```

**Riesgo:** BAJO. printService ya existe y funciona.

---

### 🆕 NUEVA-3 — Historial de Cartas de Custodia por Empresa
**Referencia:** `siso_cartas_custodia_${userId}` — se guarda pero nunca se muestra

CartaCustodiaPage guarda las cartas en D1 (handleSave) pero no hay UI para ver el historial.
El monolito mostraba una tabla de "Cartas emitidas" con empresa, mes, fecha.

**Plan:** Agregar sección en CartaCustodiaPage:
```jsx
const [cartasHistorial, setCartasHistorial] = useState([]);
useEffect(() => {
  d1Get(`siso_cartas_custodia_${userId}`)
    .then(({ value }) => { if (Array.isArray(value)) setCartasHistorial(value); })
    .catch(() => {});
}, [userId]);
// Render: tabla con empresa, mesTexto, anioVal, fecha, botón re-imprimir
```

**Archivos a tocar:** 1 (CartaCustodiaPage.jsx)
**Riesgo:** MÍNIMO. Solo agrega estado y lectura D1. No modifica nada existente.

---

## PARTE 3 — TABLA RESUMEN DE CAMBIOS

| ID | Tipo | Archivo | Línea(s) | Cambio | Riesgo | Prioridad |
|----|------|---------|----------|--------|--------|-----------|
| BUG-C1 | Fix | CartaCustodiaPage.jsx | 28-30, 73 | userId dinámico | BAJO | 🔴 ALTA |
| BUG-D1 | Feature | CertificadoPage.jsx | ~68 | Botón WhatsApp wa.me | MÍNIMO | 🟠 MEDIA |
| BUG-C2 | Fix | CertificadoPage.jsx | 7 | Clave localStorage correcta | MÍNIMO | 🟡 BAJA |
| BUG-ANA1 | Mejora | AnalisisDocsTab.jsx + CartaCustodiaPage.jsx | handleGenerarCarta | Carta vía navigate | BAJO | 🟡 BAJA |
| BUG-RS1 | Info | ReporteSection.jsx | — | Documentar como dead code | NINGUNO | — |
| NUEVA-1 | Feature | EpidemiologicalReport.jsx | nuevo tab | Tab Matriz Legal | MÍNIMO | 🟠 MEDIA |
| NUEVA-2 | Mejora | EpidemiologicalReport.jsx | handlePrint | openPrintWindow | BAJO | 🟡 BAJA |
| NUEVA-3 | Feature | CartaCustodiaPage.jsx | nuevo state | Historial de cartas | MÍNIMO | 🟡 BAJA |

---

## PARTE 4 — ORDEN DE EJECUCIÓN RECOMENDADO

### SPRINT P1 (Alta prioridad — 1 sesión, build seguro):
1. **BUG-C1**: CartaCustodiaPage líneas 28-30 + 73 → 4 cambios quirúrgicos
2. **BUG-D1**: CertificadoPage.jsx → 1 import + 1 botón nuevo
3. **BUG-C2**: CertificadoPage.jsx línea 7 → 1 línea

### SPRINT P2 (Media prioridad — 1 sesión):
4. **NUEVA-1**: EpidemiologicalReport.jsx → Tab "⚖️ Marco Legal" (contenido estático + normativa)
5. **BUG-ANA1**: AnalisisDocsTab.jsx + CartaCustodiaPage.jsx → navegación + preselect

### SPRINT P3 (Baja prioridad — 1 sesión):
6. **NUEVA-3**: CartaCustodiaPage.jsx → Historial de cartas emitidas
7. **NUEVA-2**: EpidemiologicalReport.jsx → openPrintWindow

---

## PARTE 5 — REGLAS ANTI-DAÑO (PERMANENTES)

Estas reglas aplican en TODOS los sprints sin excepción:

1. ❌ No exponer VITE_WORKER_TOKEN en ningún log, alerta, console.log o comentario
2. ❌ No cambiar nombres de claves D1 (`siso_companies_${userId}`, `siso_patients_${userId}`, etc.)
3. ❌ No modificar rutas del router (`/historia`, `/portal-empresa`, `/certificado/:id`, etc.)
4. ❌ No cambiar la interfaz del `ctx` que recibe CompaniesSection o ReporteSection
5. ✅ Siempre: `npm run build` local antes de commit, verificar 0 errores
6. ✅ Siempre: Al agregar imports, verificar que el paquete existe en package.json
7. ✅ Siempre: Si se toca `initialStates.js`, verificar que HistoriaPage.jsx y HC General no rompan
8. ✅ Siempre actualizar SESION_ESTADO.md al final de cada sesión
9. ❌ No mezclar cambios de infraestructura (CF Worker, D1 bindings) con cambios de UI en el mismo PR
10. ✅ Si un cambio toca más de 50 líneas de un archivo, leerlo completo primero

---

## PARTE 6 — CHECKLIST DE VERIFICACIÓN POST-CAMBIO

Para cada sprint, antes de hacer `git push`:

- [ ] `npx vite build` sin errores
- [ ] Módulo afectado es accesible en localhost (no pantalla en blanco)
- [ ] D1 sigue leyendo (verificar Network tab: petición a `siso-api.dr-juliancucalon.workers.dev`)
- [ ] El cambio no mueve ni renombra ninguna clave D1
- [ ] SESION_ESTADO.md actualizado con los cambios de esta sesión

---

## PARTE 7 — LO QUE YA ESTÁ 100% FUNCIONAL (NO TOCAR)

| Módulo | Estado | Nota |
|--------|--------|------|
| PhysicalExam.jsx | ✅ COMPLETO | 29 sistemas, NORMAL_DESCRIPTIONS_SYSTEMS cubiertos |
| RecommendationsPanel.jsx | ✅ COMPLETO | Catálogo 223 líneas, conectado en HistoriaPage |
| RestrictionsPanel.jsx | ✅ COMPLETO | Catálogo 470 líneas, conectado en HistoriaPage |
| CartaCustodiaPage.jsx — D1 | ✅ MIGRADO | d1WriteArrayMerge, comentario línea 24 confirma |
| handleCloseHC — auto-billing | ✅ IMPLEMENTADO | Líneas 463-490 HistoriaPage.jsx |
| EncuestasTab — verRespuestas | ✅ IMPLEMENTADO | Lazy load D1, tabla expandida |
| EncuestasTab — importar XLSX | ✅ IMPLEMENTADO | SheetJS, mapeo de columnas |
| EncuestasTab — agendar todos | ✅ IMPLEMENTADO | d1WriteArrayMerge |
| EpidemiologicalReport.jsx | ✅ REESCRITO (esta sesión) | 703 líneas, D1 first |
| AnalisisDocsTab.jsx | ✅ CREADO (esta sesión) | Bloques periódicos, IA + carta |
| CompaniesSection.jsx | ✅ ACTUALIZADO (esta sesión) | Activar todas + Abrir Portal |
| QR en certificado | ✅ FUNCIONAL | qrcode, dominio estable VITE_STABLE_DOMAIN |
| VerificacionPage | ✅ MIGRADO | Lee desde D1 |

---

*Fin del protocolo. Pendiente autorización para iniciar Sprint P1.*
