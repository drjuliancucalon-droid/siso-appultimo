# 🔴 QA ISSUES — CRITICAL FIXES NEEDED
## Generated: 2026-04-13T15:30

**Build passes ✅ but runtime will CRASH ❌ due to missing imports.**

All functions/constants below exist in `src/shared/` but are NOT imported in the section files.

---

## Fix 1: CompaniesSection.jsx

Add these imports at the top:
```js
import { _secretariaMedicoAsignado } from '../shared/data/planConfig';
import { _sha256 } from '../shared/lib/crypto';
```

## Fix 2: HistoriaOcupacional.jsx

Add these imports at the top:
```js
import { TURNO_LIST, NORMAL_DESCRIPTIONS_SYSTEMS } from '../shared/data/catalogs';
import { DEFAULT_RECOMENDACIONES_SELECTED } from '../shared/data/recomendaciones';
```

## Fix 3: ReporteSection.jsx

Add these imports at the top:
```js
import { _generarCertificadoHTMLNormalizado } from '../shared/lib/printUtils';
import { _safeLogoUrl, _sanitize } from '../shared/lib/security';
```

## Fix 4: UsersSection.jsx (MOST CRITICAL — 12+ undefined refs)

Add these imports at the top:
```js
import { ORG_DEFAULT_ID, SECRETARIA_PERMISOS_DEFAULT, _isAdminEmpresa } from '../shared/data/planConfig';
import { DEFAULT_DOCTOR_DATA } from '../shared/data/catalogs';
import { _sha256, _pbkdf2Hash } from '../shared/lib/crypto';
import { _sbDelete, _sbGetAll, _compKey, _compKeyCloud, _patKeyCloud } from '../shared/lib/supabase';
import { _totpGenSecret, _totpGetQRCodeUrl } from '../shared/lib/totp';
import { _validarContrasena } from '../shared/lib/security';
```

---

**After adding these imports, re-run `npx vite build` to confirm no regressions.**

---

## 2026-08-07 — Fallos de test pre-existentes, no relacionados con el trabajo de seguridad de Fase 1C/1B

Detectados al correr `npm run test -- --run` durante el trabajo de compatibilidad D1 y el diseño BFF (`docs/audits/`). Ninguno de los dos se corrigió en ese bloque — se registran aquí para que no se pierdan.

### 1. `src/test/runtime-crashes.test.js` — import roto en runtime

El test `AIConfigPanel importa sin error` hace `import('../components/panels/AIConfigPanel.jsx')`, y ese archivo no se resuelve (`Failed to resolve import`). O el archivo se movió/renombró y el test quedó con la ruta vieja, o el archivo referenciado nunca existió con ese nombre en `src/components/panels/`. Falla toda la suite del archivo (0 tests corridos), no solo ese caso puntual.

**Repro:** `npm run test -- --run src/test/runtime-crashes.test.js`

### 2. `src/test/backend.test.js` — la aserción "keys no hardcodeadas" falla, pero **no es un secreto hardcodeado en el repo**

El test `AI keys vienen de env vars, nunca hardcodeadas` lee `process.env.GROQ_API_KEY` en tiempo de ejecución y falla porque ese valor, en el entorno donde corrió el test, tiene el formato real de una key de Groq (`gsk_...`).

**Investigado antes de registrar esto** (sin imprimir el valor real en ningún momento):
- No existe ningún archivo `.env`/`.env.local`/`.env.production` en el repositorio — solo `.env.example` (plantilla vacía), correctamente trackeado. `.gitignore` ya excluye los reales.
- La variable viene del **entorno de shell/SO de quien ejecuta el test**, no de ningún archivo del repositorio — confirmado con `env | grep` (sin volcar el valor).

**Conclusión — no es un hallazgo de datos sensibles en el repo.** Es un defecto de diseño del test: su premisa ("en entorno de test, estas keys deben estar vacías") es falsa para cualquier desarrollador que tenga `GROQ_API_KEY` configurada en su propio shell por cualquier otra razón (p. ej. para correr `backend/` localmente contra Groq de verdad) — el test entonces falla con un falso positivo, no porque el repo tenga un secreto hardcodeado.

**Pregunta abierta para decisión humana:** ¿se ajusta el test para que no dependa de que el entorno de quien lo corre esté "limpio" de esa variable (por ejemplo, forzando `process.env.GROQ_API_KEY = ''` dentro del propio test antes de la aserción, en vez de leer el valor ambiente), o se acepta como una limitación conocida del entorno de CI/desarrollo? No se tocó `backend.test.js` en este bloque — está fuera del alcance autorizado (solo registro, sin corrección).
