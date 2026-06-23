# PROMPT MAESTRO DE IMPLEMENTACIÓN — siso-appultimo
> **Para la IA:** Lee este documento completo ANTES de tocar cualquier archivo.
> Al terminar cada cambio, marca su checkbox `[x]` y actualiza `## ESTADO DE SESIÓN`.
> Si el contexto se agota, actualiza el estado antes de que se corte y la próxima sesión retoma desde donde está.

---

## ⚠️ REGLAS DE SEGURIDAD — PERMANENTES — NO NEGOCIABLES

```
1. No expongas el valor de VITE_WORKER_TOKEN en ningún log, comentario o informe.
2. No cambies CF_API_TOKEN ni otros secrets salvo que sea estrictamente necesario.
3. No cambies claves D1 ni nombres de rutas existentes.
4. No mezcles cambios de dominio/infra con sprints funcionales.
5. Si VITE_WORKER_TOKEN no existe en .env, DETENTE y pídele al usuario que lo proporcione.
6. No sobreescribas datos en D1. Solo lectura salvo que el cambio lo requiera explícitamente.
7. Nunca hagas git push --force salvo que el usuario lo pida expresamente.
```

---

## ESTADO DE SESIÓN
> **La IA actualiza esta sección al inicio y al final de cada sesión.**

```
Última sesión:    2026-06-22
Build actual:     v.2b7f4f0  (siso-appultimo-arp.pages.dev)
Repo local:       C:\Users\JQK3\Desktop\siso-appultimo
Worker URL:       https://siso-api.dr-juliancucalon.workers.dev
Commit activo:    (ejecutar: git log --oneline -1)

BLOQUEADORES ACTIVOS:
  - .git/index.lock puede existir → siempre limpiarlo antes de git add/commit
    Comando: Remove-Item .\.git\index.lock -Force -ErrorAction SilentlyContinue

ESTADO DE SPRINTS:
  BUG-IA-01  [ ] PENDIENTE  — EpidemiologicalReport.jsx falta import React/useState
  BUG-IA-02  [ ] PENDIENTE  — HC General sin botón ⚙️ Config IA
  BUG-IA-03  [ ] PENDIENTE  — aiStore no sincroniza keys de D1 al iniciar sesión
  BUG-D1-01  [ ] PENDIENTE  — d1Client.js no lee chunks formato monolito (0 pacientes)
  SPR-A2     [ ] PENDIENTE  — QR real en certificado (instalar qrcode)
  SPR-A3     [ ] PENDIENTE  — PhysicalExam.jsx → 29 sistemas completos
  SPR-A4     [ ] PENDIENTE  — RecommendationsPanel + RestrictionsPanel completos
  SPR-B      [ ] PENDIENTE  — Encuestas: ver respuestas + importar pacientes
  SPR-C4     [ ] PENDIENTE  — CartaCustodiaPage: migrar Supabase → D1
  SPR-D1     [ ] PENDIENTE  — Link WhatsApp (wa.me) en certificado
  SPR-D2     [ ] PENDIENTE  — Auto-registro caja al cerrar HC
  SPR-E1     [ ] PENDIENTE  — Botones IA en SG-SST (Política, Matriz, Plan Anual)
  SPR-E2     [ ] PENDIENTE  — Botones IA en Facturación (Propuestas)
  SPR-E3     [ ] PENDIENTE  — Botones IA en Telemedicina (Transcripción/Resumen)
  SPR-F1     [ ] PENDIENTE  — Fix login normal (sin localStorage injection)
  SPR-F2     [ ] PENDIENTE  — siso_atenciones_cerradas vacío → Reportes muestra 0
```

---

## INSTRUCCIONES PARA LA IA — PROTOCOLO DE INICIO DE SESIÓN

Al iniciar, ejecuta en orden:

```bash
# 1. Verificar estado del repo
cd C:\Users\JQK3\Desktop\siso-appultimo
git log --oneline -3
git status

# 2. Limpiar lock si existe
Remove-Item .\.git\index.lock -Force -ErrorAction SilentlyContinue

# 3. Verificar que VITE_WORKER_TOKEN existe (NO mostrar su valor)
if (Test-Path .env) { Select-String "VITE_WORKER_TOKEN" .env | ForEach-Object { if ($_.Line -match "=.+") { Write-Host "TOKEN: OK" } else { Write-Host "TOKEN: VACÍO — DETENER" } } }

# 4. Leer este archivo para saber dónde estaba el trabajo
# 5. Ejecutar solo el siguiente ítem PENDIENTE en ESTADO DE SESIÓN
```

---

## CAMBIOS PENDIENTES — ORDEN DE PRIORIDAD

---

### 🔴 BUG-IA-01 — CRÍTICO: Reportes crash "useState is not defined"
**Impacto:** Módulo Reportes 100% inutilizable. Bloquea acceso a análisis epidemiológico IA.  
**Archivo:** `src/modules/reports/components/EpidemiologicalReport.jsx`  
**Diagnóstico:** El archivo usa `useState`, `useEffect`, `useMemo`, `useCallback` sin importarlos.

**Cambio quirúrgico:**
```diff
--- a/src/modules/reports/components/EpidemiologicalReport.jsx
+++ b/src/modules/reports/components/EpidemiologicalReport.jsx
@@ -1,3 +1,4 @@
+import React, { useState, useEffect, useMemo, useCallback } from 'react';
 import { useAuthStore } from '../../../stores/authStore';
 import { Download, FileText, BarChart3, Users, Activity, Briefcase, Calendar, Sparkles, Loader2, AlertCircle } from 'lucide-react';
 import { useAIStore } from '../../../stores/aiStore';
```

**Verificación post-fix:**
1. `npm run build` → sin errores
2. Navegar a `/reports` → página carga sin "useState is not defined"
3. Verificar que aparecen tabs de reportes

**Commit:**
```
fix: BUG-IA-01 — agregar import React/useState a EpidemiologicalReport.jsx

EpidemiologicalReport usaba useState/useEffect/useMemo/useCallback sin
importarlos. Causa: archivo copiado del monolito sin cabecera de imports.
Síntoma en prod: "useState is not defined" → módulo /reports roto al 100%.
```

---

### 🔴 BUG-D1-01 — CRÍTICO: 0 pacientes mostrados (chunks monolito no leídos)
**Impacto:** 373 pacientes en D1 nunca se muestran. La plataforma parece vacía.  
**Archivo:** `src/lib/d1Client.js`  
**Diagnóstico:** D1 almacena los pacientes en formato chunked del monolito:
- Clave meta: `siso_patients_drcucalon__meta` → `{chunked: true, count: 9}`
- Chunks: `siso_patients_drcucalon__c0` ... `siso_patients_drcucalon__c8`
- La función `_chunkGet()` actual solo conoce el formato Platform A (`key_chunk_N_of_TOTAL`).
- Lee la clave principal → null → devuelve null → 0 pacientes.

**Contexto importante:** Este fix fue implementado y luego REVERTIDO por el usuario ("quita ese commit"). Antes de re-aplicar, confirmar con el usuario: "¿Autoriza re-aplicar el fix de lectura de chunks monolito en d1Client.js?"

**Cambio quirúrgico — agregar al final del bloque en `_chunkGet()` DESPUÉS del bloque de formato Platform A (línea ~173), ANTES del `return { value, ts: ... }`:**

```javascript
// ── Formato monolito: manifest en key__meta, chunks en key__c0..cN ──────────
// Activo cuando la clave principal está vacía/null (pacientes, por ejemplo)
if (!value) {
  try {
    const metaResp = await _retry(
      () =>
        fetch(`${WORKER_URL}/store/${encodeURIComponent(key + '__meta')}`, {
          method: 'GET',
          headers: _authHeaders(),
        }).then(_checkResponse),
      `d1Get meta (${key})`
    );
    const metaRows = metaResp.json || (Array.isArray(metaResp) ? metaResp : []);
    const meta = metaRows?.[0]?.value;
    if (meta && (meta.chunked || meta.count)) {
      const count = meta.count || meta.chunks || 1;
      let assembled = '';
      for (let i = 0; i < count; i++) {
        const chunkResp = await _retry(
          () =>
            fetch(`${WORKER_URL}/store/${encodeURIComponent(key + '__c' + i)}`, {
              method: 'GET',
              headers: _authHeaders(),
            }).then(_checkResponse),
          `d1Get monolith-chunk ${i}/${count} (${key})`
        );
        const chunkRows = chunkResp.json || (Array.isArray(chunkResp) ? chunkResp : []);
        const chunkVal = chunkRows?.[0]?.value;
        if (typeof chunkVal === 'string') assembled += chunkVal;
        else if (chunkVal?.data) assembled += chunkVal.data;
      }
      try {
        return { value: JSON.parse(assembled), ts: metaRows[0]?.ts || null };
      } catch {
        return { value: assembled, ts: null };
      }
    }
  } catch {
    // Meta no existe → clave realmente vacía
  }
}
```

**Posición exacta:** Insertar entre la línea `}` que cierra el bloque `if (value && typeof value === 'object' && value._chunked)` y la línea `return { value, ts: row?.ts || null };`

**Verificación post-fix:**
1. Navegar a `/patients` → debe mostrar 373 pacientes
2. Consola: no debe haber errores `_chunkGet`
3. D1 no debe haber sido modificado (solo lectura)

**Commit:**
```
fix: BUG-D1-01 — d1Get soporta formato chunked del monolito (key__meta + key__cN)

El monolito guarda arrays >500KB en D1 usando:
  key__meta  → {chunked: true, count: N}
  key__c0..cN → fragmentos JSON string

d1Client solo conocía el formato Platform A (key_chunk_N_of_TOTAL).
Resultado: siso_patients_drcucalon leía null → 0 pacientes mostrados.

Fix: _chunkGet() detecta clave principal null, busca key__meta,
reconstruye desde key__c0..cN. Compatible con ambos formatos. Sin escritura D1.
```

---

### 🟡 BUG-IA-02 — MEDIO: HC General sin botón ⚙️ Config IA
**Impacto:** Usuario en HC General no puede configurar su API key de IA.  
**Archivo:** `src/modules/clinical/components/GeneralHC.jsx`  
**Referencia:** El botón existe en `OccupationalHC.jsx` con `title="Configuracion IA"`.

**Pasos:**
1. Leer `OccupationalHC.jsx` — buscar el botón con `title="Configuracion IA"` y el componente `AIConfigPanel`
2. Localizar en `GeneralHC.jsx` la barra de botones IA (donde están "IA General", "IA Restr", etc.)
3. Insertar el mismo botón ⚙️ justo antes o después del bloque de botones IA
4. Asegurarse que `AIConfigPanel` también esté importado y renderizado en `GeneralHC.jsx`

**Verificación:**
- Ir a `/hc/general` → debe aparecer botón gear (⚙️) en la barra superior
- Click → abre panel de configuración IA con 4 proveedores

**Commit:**
```
fix: BUG-IA-02 — agregar botón Config IA (⚙️) a HC General

HC General tenía 6 botones IA pero ningún acceso al panel de configuración.
Se agrega el mismo gear button que existe en HC Ocupacional.
```

---

### 🟡 BUG-IA-03 — MEDIO: aiStore no sincroniza keys de D1 al login
**Impacto:** API keys guardadas en D1 (`siso_ai_keys_drcucalon`) no aparecen en el store al iniciar sesión. Usuario debe re-configurar cada vez.  
**Archivos:** `src/stores/aiStore.js` y/o `src/stores/authStore.js`

**Diagnóstico:**
- `siso_ai_keys_drcucalon` existe en D1 como objeto con las keys
- `aiStore` inicia siempre con `keys: { gemini:'', groq:'', together:'', openrouter:'' }`
- No hay ningún `useEffect` ni `onRehydrateStorage` que lea D1 al arrancar

**Cambio en `src/stores/aiStore.js` — agregar acción `loadFromD1` y llamarla en `onRehydrateStorage`:**

```javascript
// En el objeto de acciones del store, agregar:
loadFromD1: async (userId) => {
  try {
    const { d1Get } = await import('../lib/d1Client');
    const { value } = await d1Get(`siso_ai_keys_${userId}`);
    if (value && typeof value === 'object') {
      const safeKeys = {};
      if (value.gemini)    safeKeys.gemini    = value.gemini;
      if (value.groq)      safeKeys.groq      = value.groq;
      if (value.together)  safeKeys.together  = value.together;
      if (value.openrouter) safeKeys.openrouter = value.openrouter;
      if (value.activeProvider) set({ activeProvider: value.activeProvider });
      if (Object.keys(safeKeys).length > 0) set({ keys: safeKeys });
    }
  } catch (e) {
    console.warn('[aiStore] No se pudo cargar keys de D1:', e.message);
  }
},
```

**Y en `authStore.js` o en el componente raíz App.jsx, llamar `useAIStore.getState().loadFromD1(userId)` justo después de que el usuario se autentica.**

**Verificación:**
- Configurar una API key en el panel Config IA → Guardar
- Recargar la página → la key debe seguir visible (no vacía)

**Commit:**
```
fix: BUG-IA-03 — aiStore sincroniza API keys desde D1 al iniciar sesión

Al autenticar, se hace d1Get(siso_ai_keys_<userId>) y se pobla aiStore.
Evita que el usuario deba re-configurar su proveedor IA en cada sesión.
```

---

### 🟡 SPR-F1 — MEDIO: Login normal falla (requiere inyección localStorage)
**Síntoma:** Tras el revert a v.295f6e6, login con `Siso2025*` y `cucalon2026` falla.  
**Archivos a inspeccionar:**
- `src/stores/authStore.js` — verificar seed hash (ya corregido en sprint paridad)
- `src/modules/auth/components/LoginForm.jsx` — verificar flujo de hash

**Diagnóstico a hacer:**
1. Abrir `/login`
2. DevTools → Network → buscar requests al Worker
3. Verificar qué hash se calcula para la contraseña ingresada
4. Comparar con el hash guardado en D1 `siso_users`

**Hash conocido:** SHA-256("Siso2025\*") = `49679f37304820e18bae7ed12292e42a7722a7d1a55f12e41b1abca5cc5162fd`

**Si el hash en authStore.js NO es ese, corregirlo:**
```javascript
// src/stores/authStore.js — línea ~36
passHash: '49679f37304820e18bae7ed12292e42a7722a7d1a55f12e41b1abca5cc5162fd',
```

---

### 🟡 SPR-A2 — MEDIO: QR real en certificado
**Archivo:** `src/modules/clinical/components/CertificateView.jsx`  
**Diagnóstico:** El certificado muestra un QR placeholder o ningún QR.  
**Dependencia requerida:** `qrcode` npm package

**Pasos:**
```bash
cd C:\Users\JQK3\Desktop\siso-appultimo
npm install qrcode
```

**Cambio en CertificateView.jsx:**
```javascript
import QRCode from 'qrcode';

// En el componente, al generar el QR:
const [qrDataUrl, setQrDataUrl] = useState('');
useEffect(() => {
  const verifyUrl = `https://siso-appultimo-arp.pages.dev/verificar/${record?.id || record?.docNumero}`;
  QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 })
    .then(url => setQrDataUrl(url))
    .catch(() => {});
}, [record?.id, record?.docNumero]);

// En el JSX, reemplazar el QR placeholder:
{qrDataUrl && <img src={qrDataUrl} alt="QR verificación" style={{width:80,height:80}} />}
```

**Verificación:** Abrir un certificado → debe verse un QR escaneable que apunta a la URL de verificación.

**Commit:**
```
feat: SPR-A2 — QR real en certificado (qrcode npm)

Reemplaza placeholder de QR por código QR dinámico generado con qrcode.
URL de verificación: /verificar/<id_o_docNumero>
```

---

### 🟠 SPR-E1 — BAJO-MEDIO: Botones IA en SG-SST
**Archivo:** `src/pages/SGSSTPage.jsx`  
**Qué agregar:**
1. Botón "Generar Política SST con IA" → junto al botón "Crear Política SST"
2. Botón "Analizar Matriz GTC-45 con IA" → junto a "Actualizar Matriz IPEVR"
3. Botón "Generar Plan Anual SST con IA" → en sección Plan Anual (si existe)

**Patrón a seguir (copiar de DashboardPage.jsx o AgendaPage.jsx):**
```jsx
import { useAIStore } from '../stores/aiStore';
import AIAssistant from '../modules/ai/components/AIAssistant';

// En el componente:
const { activeProvider, keys } = useAIStore();
const hasAIConfig = keys[activeProvider]?.length > 0;

// Botón ejemplo:
<button
  onClick={() => hasAIConfig ? handlePoliticaIA() : setShowAIConfig(true)}
  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm"
>
  ✨ Generar Política SST con IA
</button>
```

---

### 🟠 SPR-A3 — BAJO: PhysicalExam.jsx → 29 sistemas completos
**Archivo:** `src/modules/clinical/components/PhysicalExam.jsx`  
**Diagnóstico:** Actualmente tiene menos de 29 sistemas del examen físico.  
**Referencia:** PROMPT_MAESTRO_V5.md sección examen físico / monolito líneas de PhysicalExam  
**Sistemas que deben estar:**
```
1. Aspecto General  2. Piel y Faneras  3. Cabeza  4. Ojos  5. Oídos
6. Nariz  7. Boca y Faringe  8. Cuello  9. Tórax  10. Cardiovascular
11. Respiratorio  12. Abdomen  13. Genitourinario  14. Columna
15. Extremidades Superiores  16. Extremidades Inferiores  17. Neurológico
18. Psiquiátrico  19. Dermatológico  20. Vascular Periférico
21. Linfático  22. Endocrino  23. Osteoarticular  24. Muscular
25. Auditivo  26. Visual  27. Olfatorio  28. Sistema Mano-Brazo  29. Postura
```

---

### 🟠 SPR-A4 — BAJO: RecommendationsPanel + RestrictionsPanel completos
**Archivos:**
- `src/components/panels/RecomendacionesChecklistPanel.jsx`
- `src/components/panels/RestriccionesChecklistPanel.jsx`
- `src/modules/clinical/components/RecommendationsPanel.jsx`
- `src/modules/clinical/components/RestrictionsPanel.jsx`

**Verificar:** Que los paneles muestren el checklist completo según el PROMPT_MAESTRO y que el botón "IA Reco" / "IA Restr" pre-rellene desde la respuesta IA.

---

### 🟠 SPR-C4 — BAJO: CartaCustodiaPage migrar Supabase → D1
**Archivo:** `src/pages/CartaCustodiaPage.jsx`  
**Diagnóstico:** Usa Supabase directamente. Debe migrar a `d1Get`/`d1Set`.  
**Clave D1:** `siso_custodia_drcucalon`

**Patrón de migración:**
```javascript
// ANTES (Supabase):
const { data } = await supabase.from('siso_store').select('value').eq('key', 'siso_custodia_drcucalon');

// DESPUÉS (D1):
import { d1Get, d1WriteArrayMerge } from '../lib/d1Client';
const { value } = await d1Get('siso_custodia_drcucalon');
```

---

### 🟠 SPR-D1 — BAJO: Link WhatsApp en certificado
**Archivo:** `src/modules/clinical/components/CertificateView.jsx`  
**Cambio:**
```javascript
// Agregar link wa.me en sección de contacto del certificado:
const waLink = `https://wa.me/57${doctorData?.celular?.replace(/\D/g,'')}`;
// En JSX:
<a href={waLink} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
```

---

### 🟠 SPR-D2 — BAJO: Auto-registro en caja al cerrar HC
**Archivos:** `src/pages/HistoriaPage.jsx` y `src/modules/billing/components/CashBox.jsx`  
**Lógica:** Cuando el usuario presiona "CERRAR HC", registrar automáticamente una entrada en caja con:
- Fecha: hoy
- Paciente: nombre del paciente
- Concepto: "Consulta médica laboral"
- Valor: precio configurado en `siso_doctor_data_drcucalon.precioConsulta`

---

### 🟠 SPR-F2 — BAJO: siso_atenciones_cerradas vacío → Reportes muestra 0 estadísticas
**Archivo:** `src/modules/reports/components/EpidemiologicalReport.jsx` (después de fix BUG-IA-01)  
**Diagnóstico:** `siso_atenciones_cerradas` en D1 = vacío. Reportes no tiene datos.  
**Solución:** Agregar fallback que lea desde localStorage `siso_atenciones_cerradas` y si también está vacío, intentar reconstruir desde las HCs guardadas en localStorage.

---

### 🟠 SPR-B — BAJO: Encuestas — ver respuestas + importar pacientes
**Archivo:** `src/pages/EncuestasPage.jsx`  
**Pendiente:** Implementar vista de respuestas recibidas y botón "Importar como paciente".

---

## PROTOCOLO DE COMMIT — USAR SIEMPRE ESTE SCRIPT

```powershell
# commit-fix.ps1
# Uso: .\commit-fix.ps1 "src/archivo.jsx" "mensaje de commit"
param([string]$files, [string]$msg)
Set-Location "C:\Users\JQK3\Desktop\siso-appultimo"
Remove-Item .\.git\index.lock -Force -ErrorAction SilentlyContinue
git add $files
git commit -m $msg
git push origin main
Write-Host "OK — push completado." -ForegroundColor Green
git log --oneline -3
```

---

## VERIFICACIÓN FINAL ANTES DE CADA PUSH

```bash
# 1. Build sin errores
npm run build

# 2. No hay import de Supabase fuera de los archivos permitidos
grep -r "from.*supabase" src/ --include="*.jsx" --include="*.js" | grep -v "shared/lib/supabase"

# 3. No hay VITE_WORKER_TOKEN expuesto en código
grep -r "gRxbhIfKs" src/ --include="*.jsx" --include="*.js"
# → debe devolver vacío

# 4. Verificar que d1Client exporta correctamente
grep "export async function" src/lib/d1Client.js
```

---

## CONTEXTO TÉCNICO RÁPIDO

```
Repo:          C:\Users\JQK3\Desktop\siso-appultimo
Worker:        https://siso-api.dr-juliancucalon.workers.dev
Header auth:   X-Siso-Token: <VITE_WORKER_TOKEN>
D1 user key:   drcucalon
Pacientes D1:  siso_patients_drcucalon (373 en chunks __meta + __c0..__c8)
Empresas D1:   siso_companies_drcucalon (35)
Usuarios D1:   siso_users (11)
Agenda D1:     siso_agendados_drcucalon (2)
AI keys D1:    siso_ai_keys_drcucalon (objeto)

Stores Zustand:
  authStore  → siso-auth (localStorage)
  aiStore    → siso-ai-store (localStorage)
  uiStore    → no persistido

SHA-256("Siso2025*") = 49679f37304820e18bae7ed12292e42a7722a7d1a55f12e41b1abca5cc5162fd
```

---

## INSTRUCCIONES DE AUTOACTUALIZACIÓN PARA LA IA

Al TERMINAR cada cambio:
1. Cambiar `[ ]` a `[x]` en `## ESTADO DE SESIÓN` para ese ítem
2. Actualizar `Última sesión:` con la fecha de hoy
3. Actualizar `Commit activo:` con el nuevo hash
4. Si se encontró un bug nuevo, agregarlo al listado con `[ ] PENDIENT