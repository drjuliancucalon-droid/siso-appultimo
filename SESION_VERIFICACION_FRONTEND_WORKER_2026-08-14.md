# SESIÓN — Verificación de endpoint frontend → Worker productivo

_Última actualización: 2026-08-14 15:50 (America/Santiago)_

## Objetivo de la sesión

Confirmar que el frontend refactorizado consume el **worker de producción** (`siso-api`)
y las **mismas claves canónicas** que el monolito, sin perder el aislamiento de
la base D1 de desarrollo (`siso-db-dev`) completado en la sesión anterior.

## Estado confirmado de la infraestructura

| Componente | Valor |
|---|---|
| Worker producción | `siso-api` → `https://siso-api.dr-juliancucalon.workers.dev` |
| D1 producción | `siso-db` → `76da5895-478f-4486-a5d4-05069f9aa45a` |
| Worker desarrollo | `siso-api-dev` |
| D1 desarrollo | `siso-db-dev` → `9cdf3b57-0826-410e-ac35-3b2e1b697a81` |

## Archivos revisados

| Archivo | Hallazgo |
|---|---|
| `src/lib/d1Client.js` (línea 7) | `WORKER_URL = import.meta.env.VITE_WORKER_URL \|\| 'https://siso-api.dr-juliancucalon.workers.dev'` → apunta a **producción** por defecto. |
| `.env.example` | **NO** define `VITE_WORKER_URL` ni `VITE_WORKER_TOKEN`. |
| `.env` / `.env.local` / `.env.production` | **NO existen**. No hay override local. |
| `vite.config.js` | No define `VITE_WORKER_URL`. No hay override. |
| `vitest.config.js` | Define `VITE_WORKER_URL: 'https://siso-api.dr-juliancucalon.workers.dev'` (producción) y `VITE_WORKER_TOKEN: 'test-token-123-for-vitest'` (solo tests). |
| `siso-db-mcp/index.js` | `SISO_WORKER_URL \|\| 'https://siso-api.dr-juliancucalon.workers.dev'` → producción por defecto. |
| `src/hooks/useBackendData.js` | Mapa de claves D1 (ver abajo). |
| `src/utils/supabase.js` / `src/shared/lib/supabase.js` | Prefijos y claves canónicas. |
| `src/pages/BackupPage.jsx` | `MONOLITH_KEY_MAP` para import/export de backup. |
| `extractos-monolito/renderDashboard.txt` | Claves que usa el monolito en runtime. |

## Configuración activa (resultado)

El frontend refactorizado **ya consume el worker productivo**:

```
Endpoint efectivo: https://siso-api.dr-juliancucalon.workers.dev
```

No hubo que modificar código: el fallback hardcodeado en `src/lib/d1Client.js`
y la ausencia de variables `VITE_WORKER_URL` en build hacen que el refactor use
producción. El worker de desarrollo `siso-api-dev` queda **sin usar** por el
frontend en producción.

> ⚠️ Para trabajar contra el worker dev, bastaría con definir
> `VITE_WORKER_URL=https://siso-api-dev.dr-juliancucalon.workers.dev` en un
> `.env.local` (solo desarrollo local). No está definido actualmente.

## Claves canónicas verificadas (refactor == monolito)

Ambas apps leen/escriben las mismas claves. Confirmado por coincidencia entre
`src/hooks/useBackendData.js`, los `supabase.js` y el extracto del monolito:

| Clave | Refactor | Monolito |
|---|---|---|
| `siso_patients_${userId}` | ✅ (useBackendData, CompaniesPage, PatientsPage) | ✅ (renderDashboard: `push('siso_patients_${uid}')`) |
| `siso_db_patients_${userId}` | ✅ (EncuestasTab, Layout, migrateStorage) | ✅ (renderDashboard: `siso_db_patients_${uid}`) |
| `siso_companies_${userId}` | ✅ (useBackendData, CompaniesPage) | ✅ (renderDashboard: `siso_companies_${uid}`) |
| `siso_atenciones_${userId}` | ✅ (useBackendData, HistoriaPage) | ✅ (renderDashboard: `siso_atenciones_${uid}`) |
| `siso_atenciones_cerradas` | ✅ (useBackendData, WorkerPortal) | ✅ (renderDashboard: `siso_atenciones_cerradas`) |
| `siso_hc_*` | ✅ (HistoriaPage: `siso_hc_completa_${docClean}`; `siso_hc_sin_respaldo`) | ✅ (prefijo protegido en worker) |
| `siso_companies_*` | ✅ (incl. `siso_companies_shared` en D1ChangesWatcher) | ✅ (renderDashboard: `siso_companies_shared`) |
| `siso_users` | ✅ (authStore, useBackendData) | ✅ (renderDashboard: `siso_users`) |
| `siso_ips_perfil` | ✅ (ConfigIPSPage: `STORAGE_KEY = 'siso_ips_perfil'`) | ✅ (índice de perfil IPS) |

### Formato de chunking (NO cambia)

`src/lib/d1Client.js` escribe en el **formato canónico del monolito**:

- Piezas: `${key}__c0`, `${key}__c1`, ... (strings crudas)
- Manifiesto: `${key}__meta` = `{ chunked: true, count, totalBytes, ts }`
- La clave base `${key}` se **borra** al chunquear.

`_chunkGet` además conserva lectura del formato legacy propio (manifiesto
`{_chunked:true}` + `${key}_chunk_i_of_N`) para leer residuos durante la
transición. No se modificó nada.

## Reglas respetadas en esta sesión

- ❌ NO se modificó `siso-worker/wrangler.json`.
- ❌ NO se modificó `siso-worker-deploy/wrangler.json`.
- ❌ NO se tocó `siso-db-dev`.
- ❌ NO se cambiaron nombres de claves.
- ❌ NO se cambió el formato de chunking.
- ✅ Solo se documentó el estado real.

## Cómo probar el refactor contra producción sin tocar el worker dev

1. Abrir el refactor en producción:
   `https://siso-appultimo-arp.pages.dev`

2. Verificar que no existe `VITE_WORKER_URL` en el build productivo:
   ```bash
   grep -r "VITE_WORKER_URL" src/ vite.config.js .env* 2>/dev/null
   ```
   (solo debe aparecer el fallback en `src/lib/d1Client.js` y el test en `vitest.config.js`)

3. En DevTools → Network, confirmar que las llamadas van a:
   `https://siso-api.dr-juliancucalon.workers.dev/store/...`
   (y NO a `siso-api-dev...`)

4. Validar lectura de datos del monolito:
   ```js
   // En la consola del navegador sobre el refactor
   const { d1Get } = await import('/src/lib/d1Client.js');
   console.log(await d1Get('siso_users'));                 // usuarios del monolito
   console.log(await d1Get('siso_patients_drcucalon'));    // pacientes
   console.log(await d1Get('siso_companies_drcucalon'));   // empresas
   ```
   Deben devolver exactamente los mismos datos que ve el monolito.

5. Verificar el aislamiento dev (no tocar `siso-db-dev`):
   ```bash
   npx wrangler d1 execute siso-db-dev --remote --config=siso-worker/wrangler.json \
     --command="SELECT COUNT(*) AS n FROM siso_store;"
   ```
   Debe devolver `n = 0` (vacía, sin datos clínicos copiados).

## Cambios realizados

- **Ningún cambio de código.** El frontend ya apuntaba a producción.
- Un solo archivo nuevo: este documento de sesión.

## SHA de commits

- No se generaron commits en esta sesión (sin cambios de código).
- Commit previo de aislamiento D1 (referencia): `d044915` —
  `fix(infra): aislar worker dev en D1 siso-db-dev [SESION-2026-08-14]`