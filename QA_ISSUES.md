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
