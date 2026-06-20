# QA Report — Refactoring Phase 2-3
## Date: 2026-04-13T15:30 (America/Santiago)

---

## Summary

**Build: ✅ PASS** — `npx vite build` succeeds, all 5 section chunks generated.  
**Runtime: ⚠️ CRITICAL ISSUES** — Multiple undefined references will cause `ReferenceError` at runtime.  
**Structure: ✅ GOOD** — All sections properly use `export default function`, `ctx` prop, React imports, lazy loading.

---

### Files Checked

| File | Lines | Size (KB) | Export OK | ctx Prop OK | React Import | Return JSX | Lucide Icons | Issues |
|------|-------|-----------|-----------|-------------|--------------|------------|--------------|--------|
| AgendaSection.jsx | 1,761 | 80.6 | ✅ | ✅ (38 props) | ✅ | ✅ | ✅ | None |
| CompaniesSection.jsx | 1,691 | 76.4 | ✅ | ✅ (27 props) | ✅ | ✅ | ✅ | ⚠️ Missing imports |
| HistoriaOcupacional.jsx | 2,197 | 88.0 | ✅ | ✅ (28 props) | ✅ | ✅ | ✅ | ⚠️ Missing imports |
| ReporteSection.jsx | 1,826 | 90.5 | ✅ | ✅ (44 props) | ✅ | ✅ | ✅ | ⚠️ Missing imports |
| UsersSection.jsx | 2,935 | 140.8 | ✅ | ✅ (48 props) | ✅ | ✅ | ✅ | 🔴 Many missing imports |

**App.jsx**: 37,931 lines (reduced from ~48K monolith).

---

### App.jsx Integration Check

| Check | Status | Details |
|-------|--------|---------|
| React.lazy() imports | ✅ | All 5 sections at lines 72-76 |
| Suspense wrapping | ✅ | Each section wrapped in `<React.Suspense>` |
| ctx object defined | ✅ | Line 17236, contains 134 properties |
| Section rendering | ✅ | All sections rendered with `ctx={ctx}` |
| Sections receive props correctly | ✅ | All destructured props exist in ctx |

---

### Build Result

```
✅ PASS — vite v8.0.8, built in 899ms
1580 modules transformed

Output chunks:
  AgendaSection     40.48 KB (gzip: 10.19 KB)
  CompaniesSection  36.81 KB (gzip:  7.81 KB)
  HistoriaOcupacional 51.74 KB (gzip: 12.69 KB)
  ReporteSection    45.86 KB (gzip: 12.58 KB)
  UsersSection      65.65 KB (gzip: 14.60 KB)
  index (App.jsx)  1,022.35 KB (gzip: 262.32 KB) ← still large, warning issued

Warning: index chunk > 500 KB. Consider further code-splitting.
```

---

### Cross-Reference Results

#### HistoriaOcupacional ✅ (mostly)
| Pattern | In Monolith | In Section | Status |
|---------|-------------|------------|--------|
| examenFisicoSistemas | ✅ | ✅ | OK |
| maniobrasOsteomusculares | ✅ | ✅ | OK |
| conceptoAptitud | ✅ | ✅ | OK |
| restricciones | ✅ | ✅ | OK |
| antecedentesPersonales | ✅ | ✅ (via `data.`) | OK — accessed as `data.antecedentesPersonales` |
| antecedentesOcupacionales | ✅ | ✅ (via `data.`) | OK — accessed as `data.antecedentesOcupacionales` |

#### UsersSection ✅
| Pattern | In Monolith | In Section | Status |
|---------|-------------|------------|--------|
| LicenciasTab | ✅ | ✅ | OK |
| secretariaPermisos | ✅ | ✅ | OK |
| usersList / setUsersList | ✅ | ✅ | OK |
| newUserForm / setNewUserForm | ✅ | ✅ | OK |
| userEditId / setUserEditId | ✅ | ✅ | OK |
| activeUserMgmtTab | ✅ | ✅ | OK |

#### ReporteSection ✅ (note: SVE/RIPS/FHIR are separate)
| Pattern | In Monolith | In Section | Status |
|---------|-------------|------------|--------|
| epidemiológico | ✅ | ✅ | OK |
| reporteActiveTab | ✅ | ✅ | OK |
| reportStartDate / reportEndDate | ✅ | ✅ | OK |
| selectedCompanyReport | ✅ | ✅ | OK |
| generateAIReport | ✅ | ✅ | OK |
| BarChart | ✅ | ✅ | OK |
| SVE | ✅ | ❌ | **Expected** — SVE is a separate `renderSVE()` view (line 23117 in App.jsx), not part of ReporteSection |
| RIPS | ✅ | ❌ | **Expected** — RIPS is a utility function + modal, not part of ReporteSection |
| FHIR | ✅ | ❌ | **Expected** — FHIR export is in the HC view, not ReporteSection |

#### AgendaSection ⚠️
| Pattern | In Monolith | In Section | Status |
|---------|-------------|------------|--------|
| agendados | ✅ | ✅ | OK |
| agendaForm / setAgendaForm | ✅ | ✅ | OK |
| agendaTab | ✅ | ✅ | OK |
| agendaSuggs | ✅ | ✅ | OK |
| agendaRecurrente | ✅ | ✅ | OK |
| medicoTurnoActivo | ✅ | ❌ | ⚠️ Used in monolith's renderAgenda for "Médico de Turno" selector — not present in extracted section. However, the indicator IS in App.jsx navbar (line 18474). May need review. |
| espera / cola | ✅ | ✅ | OK |

#### CompaniesSection ✅
| Pattern | In Monolith | In Section | Status |
|---------|-------------|------------|--------|
| convenio | ✅ | ✅ | OK |
| tarifas | ✅ | ✅ | OK |
| portal | ✅ | ✅ | OK |
| companies / setCompanies | ✅ | ✅ | OK |
| editingCompany / setEditingCompany | ✅ | ✅ | OK |
| companiesTab | ✅ | ✅ | OK |
| newComp / setNewComp | ✅ | ✅ | OK |
| portalActivadoInfo | ✅ | ✅ | OK |
| precioPorPaciente | ✅ | ❌ | ⚠️ Not found as literal in section (may be accessed differently) |

---

### 🔴 Issues Found

#### CRITICAL: Missing Imports — Will Cause Runtime `ReferenceError`

These helper functions/constants are **used** in section files but **not imported** and **not in ctx**. They ARE available in `src/shared/` — they just need import statements added.

**1. CompaniesSection.jsx** — 2 missing
| Identifier | Available In | Fix |
|-----------|-------------|-----|
| `_secretariaMedicoAsignado` | `../shared/data/planConfig` | Add to import |
| `_sha256` | `../shared/lib/crypto` | Add import |

**2. HistoriaOcupacional.jsx** — 3 missing constants
| Identifier | Available In | Fix |
|-----------|-------------|-----|
| `TURNO_LIST` | `../shared/data/catalogs` | Add import |
| `NORMAL_DESCRIPTIONS_SYSTEMS` | `../shared/data/catalogs` | Add import |
| `DEFAULT_RECOMENDACIONES_SELECTED` | `../shared/data/recomendaciones` | Add import |

**3. ReporteSection.jsx** — 3 missing
| Identifier | Available In | Fix |
|-----------|-------------|-----|
| `_generarCertificadoHTMLNormalizado` | `../shared/lib/printUtils` | Add import |
| `_safeLogoUrl` | `../shared/lib/security` | Add import |
| `_sanitize` | `../shared/lib/security` | Add import |

**4. UsersSection.jsx** — 12 missing (MOST CRITICAL)
| Identifier | Available In | Fix |
|-----------|-------------|-----|
| `_compKey` | `../shared/lib/supabase` | Add import |
| `_compKeyCloud` | `../shared/lib/supabase` | Add import |
| `_isAdminEmpresa` | `../shared/data/planConfig` | Add import |
| `_patKeyCloud` | `../shared/lib/supabase` | Add import |
| `_pbkdf2Hash` | `../shared/lib/crypto` | Add import |
| `_sbDelete` | `../shared/lib/supabase` | Add import |
| `_sbGetAll` | `../shared/lib/supabase` | Add import |
| `_sha256` | `../shared/lib/crypto` | Add import |
| `_totpGenSecret` | `../shared/lib/totp` | Add import |
| `_totpGetQRCodeUrl` | `../shared/lib/totp` | Add import |
| `_validarContrasena` | `../shared/lib/security` | Add import |
| `DEFAULT_DOCTOR_DATA` | `../shared/data/catalogs` | Add import |
| `SECRETARIA_PERMISOS_DEFAULT` | `../shared/data/planConfig` | Add import |
| `ORG_DEFAULT_ID` | `../shared/data/planConfig` | Add import |

#### MEDIUM: Missing Feature in AgendaSection

- The monolith's `renderAgenda` includes a "Médico de Turno Activo" selector (select dropdown to choose active doctor shift). This feature uses `medicoTurnoActivo` and `setMedicoTurnoActivo`. While the indicator exists in App.jsx's navbar, the full selector from the monolith is missing from the extracted AgendaSection.

#### LOW: App.jsx still very large

- At 37,931 lines and ~1 MB output chunk, `App.jsx` would benefit from further extraction (renderSVE, renderNavbar, etc.)

---

### Recommendations

1. **IMMEDIATE (Critical)**: Add missing import statements to all 4 affected section files. All the functions/constants exist in `src/shared/` — they just need `import { ... } from '...'` lines added at the top of each file. See the tables above for exact paths.

2. **IMPORTANT**: Review whether the "Médico de Turno Activo" selector (currently in monolith's renderAgenda) should be added to AgendaSection.jsx. It needs `medicoTurnoActivo`, `setMedicoTurnoActivo`, and `medicos` (filtered from `usersList`).

3. **FUTURE**: Consider extracting `renderSVE` (~700 lines), `renderNavbar` (~500 lines), and other remaining render functions to further reduce App.jsx.

4. **TESTING**: After fixing imports, run a full browser test to verify all views render without errors. The build passes but runtime errors won't surface until the lazy-loaded chunks execute.

---

### Fix Templates

**CompaniesSection.jsx** — add after existing imports:
```js
import { _secretariaMedicoAsignado } from '../shared/data/planConfig';
import { _sha256 } from '../shared/lib/crypto';
```

**HistoriaOcupacional.jsx** — add:
```js
import { TURNO_LIST, NORMAL_DESCRIPTIONS_SYSTEMS } from '../shared/data/catalogs';
import { DEFAULT_RECOMENDACIONES_SELECTED } from '../shared/data/recomendaciones';
```

**ReporteSection.jsx** — add:
```js
import { _generarCertificadoHTMLNormalizado } from '../shared/lib/printUtils';
import { _safeLogoUrl, _sanitize } from '../shared/lib/security';
```

**UsersSection.jsx** — add:
```js
import { ORG_DEFAULT_ID, SECRETARIA_PERMISOS_DEFAULT, _isAdminEmpresa } from '../shared/data/planConfig';
import { DEFAULT_DOCTOR_DATA } from '../shared/data/catalogs';
import { _sha256, _pbkdf2Hash } from '../shared/lib/crypto';
import { _sbDelete, _sbGetAll, _compKey, _compKeyCloud, _patKeyCloud } from '../shared/lib/supabase';
import { _totpGenSecret, _totpGetQRCodeUrl } from '../shared/lib/totp';
import { _validarContrasena } from '../shared/lib/security';
```
