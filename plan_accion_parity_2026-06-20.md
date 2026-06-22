# PLAN DE ACCIÓN — Cierre de Brecha 73% → 100%
## SISO OcupaSalud `siso-appultimo` — 2026-06-20

---

## ORDEN DE PRIORIDAD

Criterio de priorización:
1. **Bloqueo clínico / legal** — sin esto la plataforma no cumple Res. 1843/2025
2. **Pérdida de datos** — riesgos de regresión D1
3. **Funcionalidad completa de portales** — valor visible para empresas y trabajadores
4. **UX y completitud** — funciones que mejoran la experiencia del médico

---

## SPRINT A — CRÍTICO CLÍNICO (1-2 días)
*Impacto: correctitud del certificado + datos completos al abrir HC*

### A1 — FIX 1: `initNewRecord` spread completo de paciente
**Archivo:** `src/modules/clinical/hooks/useClinicalRecord.js`
**Brecha:** Solo propaga ~10 campos. Faltan residencia, afp, dependencia, tipoContrato, turnoTrabajo, estrato, tipoVivienda, grupoSanguineo, identidadGenero, zonaResidencia, grupoEtnico, numPersonasCargo, ingresosMensuales, lateralidad, foto, actividadEconomicaTrabajador, empresaNit, actividadEconomica, nivelRiesgoARL.
**Fix:**
```js
// En initNewRecord(), extender el spread:
if (patientData) {
  Object.assign(base, {
    // Ya presentes:
    nombres, docTipo, docNumero, fechaNacimiento, edad, genero, celular, eps, arl, afp, cargo, empresaId, empresaNombre,
    // AGREGAR:
    residencia: patientData.residencia || '',
    dependencia: patientData.dependencia || '',
    tipoContrato: patientData.tipoContrato || '',
    turnoTrabajo: patientData.turnoTrabajo || '',
    estrato: patientData.estrato || '',
    tipoVivienda: patientData.tipoVivienda || '',
    grupoSanguineo: patientData.grupoSanguineo || '',
    grupoEtnico: patientData.grupoEtnico || '',
    identidadGenero: patientData.identidadGenero || '',
    zonaResidencia: patientData.zonaResidencia || '',
    lateralidad: patientData.lateralidad || '',
    numPersonasCargo: patientData.numPersonasCargo || '',
    ingresosMensuales: patientData.ingresosMensuales || '',
    foto: patientData.foto || '',
    empresaNit: patientData.empresaNit || '',
    nivelRiesgoARL: patientData.nivelRiesgoARL || '',
    actividadEconomicaTrabajador: patientData.actividadEconomicaTrabajador || '',
    email: patientData.email || '',
    telefono: patientData.telefono || '',
  });
}
```

### A2 — QR real en certificado
**Archivo:** `src/lib/printService.js`
**Brecha:** Clase CSS `.qr-area` existe pero no hay librería de generación.
**Fix:** En `printService.js`, antes de `window.open()`, generar el QR inline con `qrcode` (ya disponible como `qrcode` o `qrcode-generator` via CDN o npm):
```js
// Opción 1: CDN en index.html → <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js">
// Opción 2: npm install qrcode → import QRCode from 'qrcode'
// En printService.js:
import QRCode from 'qrcode';
export async function _generarQRDataUrl(text) {
  return QRCode.toDataURL(text, { width: 120, margin: 1 });
}
// Luego en el HTML del certificado: <img src="${qrDataUrl}" class="qr-area" />
```

### A3 — PhysicalExam.jsx: completar los 29 sistemas
**Archivo:** `src/modules/clinical/components/PhysicalExam.jsx` (actualmente 149 líneas)
**Brecha:** El monolito (línea ~10000) tiene 29 sistemas de exploración física.
**Fix:** Expandir `PhysicalExam.jsx` para cubrir:
Sistemas ausentes (comparar con monolito): piel/faneras, tejido celular subcutáneo, ganglios, cabeza, cuello, tiroides, ojos, oídos, nariz, boca/orofaringe, cardiovascular, pulmonar, abdomen, región lumbar, genitourinario, extremidades superiores/inferiores, columna vertebral, neurológico, psiquiátrico/mental, osteoarticular, vascular periférico — cada uno con `normal/anormal + detalle`.

### A4 — RecommendationsPanel y RestrictionsPanel: completar checklists
**Archivos:** `src/components/panels/RecommendationsPanel.jsx` (110 ln), `RestrictionsPanel.jsx` (124 ln)
**Fix:** Verificar vs `recomendaciones.js` y `restricciones.js` en `shared/data/` que todos los ítems categorías A-F estén renderizados con su checkbox + campo de detalle.

---

## SPRINT B — ENCUESTAS COMPLETO (1 día)
*El módulo más incompleto (30%) con alto valor clínico-empresarial*

### B1 — Ver respuestas de encuesta
**Archivo:** `src/pages/EncuestasPage.jsx`
**Fix:** Agregar pestaña "Respuestas" en `EncuestasPage`:
```jsx
// Al seleccionar una encuesta → cargar d1Get(`siso_encuesta_resp_${encuesta.id}`)
// Mostrar tabla con: respondente, fecha, respuestas
const [respuestas, setRespuestas] = useState([]);
// useEffect: cargar respuestas de D1 cuando se selecciona encuesta
```

### B2 — Importar respuestas como pacientes
**Archivo:** `src/pages/EncuestasPage.jsx`
**Fix:** Botón "Importar como pacientes" que:
1. Lee respuestas de la encuesta seleccionada
2. Mapea campos de encuesta → campos de paciente (nombres, docNumero, celular, email, empresa, cargo)
3. Llama `d1WriteArrayMerge('siso_db_patients_drcucalon', nuevos, 'docNumero')` — MERGE por docNumero (FIX 6)

### B3 — Agendar todos los respondentes
**Archivo:** `src/pages/EncuestasPage.jsx`
**Fix:** Botón "Agendar todos" que:
1. Itera la lista de respondentes importados
2. Crea citas en `siso_agendados_drcucalon` con `d1WriteArrayMerge` con fecha/hora auto-distribuida

### B4 — Exportar respuestas a PDF
**Fix:** Botón "Exportar PDF" que usa `printService.js` o `window.print()` sobre tabla de respuestas.

### B5 — Importar desde Excel/XLSX
**Fix:** Input tipo `file` + `SheetJS (xlsx)`:
```js
import * as XLSX from 'xlsx';
// parse → rows → mapear a estructura de respuestas → importar como pacientes
```

---

## SPRINT C — PORTAL EMPRESA COMPLETO (1 día)

### C1 — Ver informes sociodemográficos publicados
**Archivo:** `src/pages/PortalEmpresaPage.jsx`
**Fix:** Pestaña "Informes" en el portal empresa autenticado:
```js
// d1Get(`siso_informes`) → filtrar por empresa NIT
// Mostrar lista de informes publicados con botón "Ver" / "Descargar"
```

### C2 — Ver cartas de custodia
**Archivo:** `src/pages/PortalEmpresaPage.jsx`
**Fix:** Pestaña "Custodia" → `d1Get('siso_cartas_custodia_drcucalon')` → filtrar por empresaNit → mostrar/descargar.

### C3 — Ver cuentas de cobro
**Archivo:** `src/pages/PortalEmpresaPage.jsx`
**Fix:** Pestaña "Cobros" → `d1Get('siso_saved_bills_drcucalon')` → filtrar por empresaId/NIT → mostrar tabla.

### C4 — CartaCustodiaPage: migrar de Supabase a D1
**Archivo:** `src/pages/CartaCustodiaPage.jsx`
**Brecha:** `handleSave()` escribe en Supabase. Viola constraint 7 del PROMPT_MAESTRO.
**Fix:**
```js
// Reemplazar fetch a Supabase por:
import { d1WriteArrayMerge } from '../lib/d1Client';
await d1WriteArrayMerge(`siso_cartas_custodia_${userId}`, [nueva], 'id');
```

---

## SPRINT D — COMUNICACIONES Y CAJA (medio día)

### D1 — Envío por WhatsApp (wa.me)
**Archivo:** `src/pages/HistoriaPage.jsx` y/o `src/modules/clinical/components/OccupationalHC.jsx`
**Fix:** Botón "WhatsApp" en la barra de acciones del certificado:
```jsx
const handleWhatsApp = () => {
  const msg = encodeURIComponent(
    `Hola ${data.nombres}, su certificado médico ocupacional está disponible en: ` +
    `${import.meta.env.VITE_STABLE_DOMAIN}/portal/${data.codigoVerificacion}`
  );
  window.open(`https://wa.me/${data.celular?.replace(/\D/g,'')}?text=${msg}`, '_blank');
};
```

### D2 — Auto-registro en caja al cerrar HC
**Archivo:** `src/pages/HistoriaPage.jsx`
**Fix:** Al completar el cierre bloqueante (después de las 6 claves D1), agregar movimiento en caja:
```js
// Después de publicación D1 exitosa:
const tarifa = company?.tarifas?.[data.tipoExamen?.toLowerCase()] || 0;
if (tarifa > 0) {
  const mov = { id: `caja_${Date.now()}`, tipo: 'ingreso', concepto: `HC ${data.tipoExamen} - ${data.nombres}`, monto: tarifa, fecha: new Date().toISOString() };
  await d1WriteArrayMerge(`siso_caja_movs_${userId}`, [mov], 'id');
}
```

---

## SPRINT E — AGENDA + TELEMEDICINA (1 día)

### E1 — Recurrencia automática en citas (3m/6m/1 año)
**Archivo:** `src/modules/agenda/components/AppointmentForm.jsx`
**Fix:** Campo `frecuenciaRecurrencia: ['ninguna', '3meses', '6meses', '1anio']` en el formulario. Al guardar, si hay recurrencia, generar citas futuras y hacer `d1WriteArrayMerge` con todas.

### E2 — Validación de solapamiento de horarios
**Archivo:** `src/modules/agenda/components/AppointmentForm.jsx`
**Fix:**
```js
const overlap = citas.some(c =>
  c.medicoId === form.medicoId &&
  c.fecha === form.fecha &&
  Math.abs(timeToMin(c.hora) - timeToMin(form.hora)) < 30
);
if (overlap) { alert('El médico ya tiene una cita en ese horario'); return; }
```

### E3 — Crear HC desde teleconsulta finalizada
**Archivo:** `src/modules/telemedicine/components/VideoConsult.jsx`
**Fix:** Al "Finalizar teleconsulta", botón "Abrir HC" que navega a `/hc/new` con los datos del paciente de la teleconsulta pre-cargados.

### E4 — Banner OFFLINE en UI
**Archivo:** `src/App.jsx` o nuevo `src/components/OfflineBanner.jsx`
**Fix:**
```jsx
function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOps, setPendingOps] = useState(0);
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  if (isOnline) return null;
  return <div className="fixed top-0 w-full bg-yellow-500 text-white text-xs font-bold py-1 px-4 text-center z-50">OFFLINE — {pendingOps} operaciones pendientes</div>;
}
```

---

## SPRINT F — FLUJOS FALTANTES MENORES (medio día)

### F1 — Alerta de evaluaciones próximas a vencer (3 años)
**Archivo:** `src/pages/DashboardPage.jsx` o `src/components/alerts/`
**Fix:**
```js
const hoy = new Date();
const vencidos = patients.filter(p => {
  const ultima = new Date(p.fechaUltimaEval || p.fechaExamen || 0);
  const diffYears = (hoy - ultima) / (1000 * 60 * 60 * 24 * 365);
  return diffYears >= 2.5; // Alerta a 2.5 años → vence en 3
});
// Mostrar badge rojo en Dashboard + lista en notificaciones
```

### F2 — Exportar lista de pacientes a PDF
**Archivo:** `src/pages/PatientsPage.jsx`
**Fix:** Botón "Imprimir lista" que genera tabla HTML con `window.open + window.print()` con los pacientes filtrados.

### F3 — Importar pacientes desde Excel/CSV
**Archivo:** `src/pages/PatientsPage.jsx`
**Fix:** Input file + SheetJS → mapear columnas → `d1WriteArrayMerge` por docNumero.

### F4 — Session timeout configurable
**Archivo:** `src/stores/authStore.js`
**Fix:**
```js
// En el store, agregar checkInactivity():
checkInactivity: () => {
  const { lastActivity, currentUser } = get();
  const timeout = (currentUser?.sessionTimeout || 30) * 60 * 1000;
  if (lastActivity && Date.now() - lastActivity > timeout) {
    get().logout();
  }
}
// En App.jsx: setInterval(useAuthStore.getState().checkInactivity, 60000)
```

### F5 — Recuperación de contraseña
**Archivo:** `src/pages/LoginPage.jsx` + `src/modules/auth/components/`
**Fix:** Link "¿Olvidé mi contraseña?" → formulario que envía email via EmailJS con token temporal → página de reset.

### F6 — Registro de auditoría de accesos
**Archivo:** `src/stores/authStore.js`
**Fix:** Al login/logout, escribir en `siso_audit_log` via D1:
```js
// En login():
const entry = { ts: new Date().toISOString(), user: username, action: 'login', ip: 'web' };
d1WriteArrayMerge('siso_audit_log', [entry], 'ts').catch(() => {});
```

### F7 — Cron snapshot diario en Worker
**Archivo:** `siso-worker/wrangler.json`
**Fix:**
```json
{
  "triggers": { "crons": ["0 2 * * *"] }
}
```
En `siso-worker/index.js`, agregar handler:
```js
async scheduled(event, env, ctx) {
  // Copiar siso_db_patients_drcucalon → siso_snapshot_YYYYMMDD
  const ts = new Date().toISOString().split('T')[0].replace(/-/g,'');
  const { value } = await d1Get(env, 'siso_db_patients_drcucalon');
  if (value) await d1Set(env, `siso_snapshot_${ts}`, value);
}
```

### F8 — OpenAI como proveedor IA
**Archivo:** `src/shared/lib/aiProviders.js`
**Fix:** Agregar entrada `openai` en `AI_PROVIDERS`:
```js
openai: {
  name: "OpenAI",
  badge: "🟡 GPT-4o",
  call: async (prompt, systemPrompt, apiKey) => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }] })
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content || '';
  }
}
```

### F9 — Clave D1 caja: alinear nombre
**Archivo:** `src/pages/CajaPage.jsx`
**Brecha:** Usa `siso_caja_${user}` pero PROMPT_MAESTRO define `siso_caja_movs_<userId>`.
**Fix:**
```js
const storageKey = `siso_caja_movs_${currentUser?.user || 'shared'}`;
```

### F10 — Guard "¿Salir sin guardar?" con React Router
**Archivo:** `src/pages/HistoriaPage.jsx`
**Fix:**
```jsx
import { useBeforeUnload } from 'react-router-dom'; // v6.4+
useBeforeUnload(
  React.useCallback(
    (e) => { if (isDirty) e.preventDefault(); },
    [isDirty]
  )
);
```

---

## RESUMEN DE ARCHIVOS A MODIFICAR/CREAR

| Archivo | Acción | Sprint |
|---------|--------|--------|
| `src/modules/clinical/hooks/useClinicalRecord.js` | Modificar — spread completo paciente | A1 |
| `src/lib/printService.js` | Modificar — QR real con qrcode | A2 |
| `src/modules/clinical/components/PhysicalExam.jsx` | Expandir — 29 sistemas | A3 |
| `src/components/panels/RecommendationsPanel.jsx` | Verificar/completar — checklist A-F | A4 |
| `src/components/panels/RestrictionsPanel.jsx` | Verificar/completar | A4 |
| `src/pages/EncuestasPage.jsx` | Modificar — ver respuestas, importar pacientes, agendar, PDF, XLSX | B1-B5 |
| `src/pages/PortalEmpresaPage.jsx` | Modificar — pestañas informes/custodia/cobros | C1-C3 |
| `src/pages/CartaCustodiaPage.jsx` | Modificar — Supabase → D1 | C4 |
| `src/pages/HistoriaPage.jsx` | Modificar — WhatsApp link, auto-caja, guard salir | D1, D2, F10 |
| `src/modules/agenda/components/AppointmentForm.jsx` | Modificar — recurrencia, validación overlap | E1, E2 |
| `src/modules/telemedicine/components/VideoConsult.jsx` | Modificar — crear HC al finalizar | E3 |
| `src/App.jsx` | Modificar — OfflineBanner, checkInactivity interval | E4, F4 |
| `src/components/OfflineBanner.jsx` | Crear | E4 |
| `src/pages/DashboardPage.jsx` | Modificar — alertas evaluaciones vencidas | F1 |
| `src/pages/PatientsPage.jsx` | Modificar — exportar PDF, importar XLSX | F2, F3 |
| `src/stores/authStore.js` | Modificar — timeout, auditLog, recuperación | F4, F5, F6 |
| `siso-worker/wrangler.json` | Modificar — cron snapshot | F7 |
| `siso-worker/index.js` | Modificar — scheduled handler | F7 |
| `src/shared/lib/aiProviders.js` | Modificar — agregar OpenAI | F8 |
| `src/pages/CajaPage.jsx` | Modificar — nombre clave D1 | F9 |

**Total: 19 archivos a modificar + 1 a crear**

---

## ORDEN DE EJECUCIÓN RECOMENDADO

```
Sprint A (día 1): A1→A2→A3→A4   ← impacto clínico inmediato
Sprint B (día 2): B1→B2→B3→B4→B5  ← Encuestas completo
Sprint C (día 3): C1→C2→C3→C4   ← Portales completos
Sprint D (día 3 tarde): D1→D2    ← Comunicaciones + Caja
Sprint E (día 4): E1→E2→E3→E4   ← Agenda + Telemedicina
Sprint F (día 5): F1→F2→...→F10  ← Menores y detalles
```

Al finalizar los 6 sprints: **objetivo ~98% de paridad con el monolito**.

---

## CONSTRAINTS ABSOLUTOS A RESPETAR (Sección 9 del PROMPT_MAESTRO)

1. NUNCA perder datos en D1 — siempre `d1WriteArrayMerge` para arrays
2. NUNCA cambiar nombre de una clave D1 existente (excepto FIX F9 que corrige un error)
3. NUNCA push --force a main
4. NUNCA Supabase para escritura — solo D1 (CartaCustodiaPage: FIX C4 obligatorio)
5. SIEMPRE await bloqueante en cierre HC — ya implementado, no romper
6. SIEMPRE verificar popup bloqueado en impresión — ya implementado, mantener
7. SIEMPRE spread completo de paciente al abrir HC — objetivo de FIX A1
