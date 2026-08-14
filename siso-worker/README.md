# ⚠️ siso-worker — WORKER DE DESARROLLO ÚNICAMENTE

## ADVERTENCIA CRÍTICA

Este directorio contiene el worker de **DESARROLLO**.

- **NO hacer `wrangler deploy` desde esta carpeta** — contaminaría producción.
- El worker de **PRODUCCIÓN** es `siso-worker-deploy/` (nombre: `siso-api`).
- El worker de desarrollo (nombre: `siso-api-dev`) debe apuntar a una base de datos D1 **separada**.

## Pasos para activar el entorno de desarrollo

### 1. Crear la base de datos D1 de desarrollo (solo primera vez)

```bash
npx wrangler d1 create siso-db-dev
```

Copia el `database_id` que genera este comando y reemplaza `REEMPLAZAR_CON_ID_DEV` en el `wrangler.json` de esta carpeta.

### 2. Aplicar el schema de la base de datos de desarrollo

```bash
npx wrangler d1 execute siso-db-dev --file=../siso-worker-deploy/schema.sql
```

### 3. Iniciar el worker en modo local

```bash
npx wrangler dev --local
```

## Diferencias con producción

| | siso-worker (dev) | siso-worker-deploy (prod) |
|---|---|---|
| Nombre worker | `siso-api-dev` | `siso-api` |
| Base de datos | `siso-db-dev` | `siso-db` |
| URL | `http://localhost:8787` | `https://siso-api.dr-juliancucalon.workers.dev` |
| VITE_WORKER_URL | Cambiar a localhost en `.env.local` | `https://siso-api.dr-juliancucalon.workers.dev` |

## Para el frontend refactor en desarrollo

Crea un archivo `.env.local` en la raíz del proyecto con:

```
VITE_WORKER_URL=http://localhost:8787
VITE_WORKER_TOKEN=<token_de_desarrollo>
```

Este archivo está en `.gitignore` y **nunca** debe ser commiteado.

---
*Sesión de auditoría: 2026-08-14 — Fix 1.2: aislamiento D1 dev/prod*
