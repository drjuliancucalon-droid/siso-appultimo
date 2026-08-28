# Worker canónico de SISO

## Regla de fuente única

El archivo canónico para publicar el servicio compartido `siso-api` es `siso-worker-deploy/index.js` junto con `siso-worker-deploy/wrangler.json`. Este Worker conserva el contrato del monolito, el dual-write/lectura piloto relacional, el chunking atómico, el merge protegido, ETag/If-Match, descompresión legacy y CORS para los dos dominios Pages.

`../siso-worker/index.js` debe permanecer semánticamente idéntico al Worker canónico, pero su `wrangler.json` apunta exclusivamente al D1 de desarrollo `siso-db-dev` (`9cdf3b57-0826-410e-ac35-3b2e1b697a81`). Nunca se debe ejecutar una publicación de dev contra el D1 de producción.

## Configuración de producción

| Campo | Valor |
|---|---|
| Worker | `siso-api` |
| Binding | `DB` |
| Base D1 | `siso-db` |
| Database ID | `76da5895-478f-4486-a5d4-05069f9aa45a` |
| Compatibility date | `2024-01-01` |
| Cron | `0 6 * * *` |
| Secreto requerido | `SISO_TOKEN` — nunca versionarlo |

## Puertas antes de publicar

Se debe ejecutar `node --check index.js`, comparar el hash de `siso-worker/index.js` y `siso-worker-deploy/index.js`, aplicar las migraciones idempotentes de `schema.sql` en el entorno correspondiente y ejecutar build/tests del frontend. Después se valida el preflight desde ambos dominios con todos los headers que usa `d1Client`: `Content-Type`, `X-Siso-Token`, `X-Siso-App`, `X-Siso-UserId`, `X-Siso-Tenant`, `If-Match` y `X-Siso-If-Match`.

La publicación en producción requiere confirmación explícita después de que el parche local haya superado estas puertas. No se deben ejecutar POST, DELETE, snapshot, cleanup ni pruebas de escritura sobre la base de producción para demostrar paridad.
