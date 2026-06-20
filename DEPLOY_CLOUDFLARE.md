# 🚀 GUÍA DEPLOY CLOUDFLARE PAGES — SISO OcupaSalud Pro

## Estado actual del proyecto

✅ **Todo está listo para deploy:**
- Repositorio: `https://github.com/drjuliancucalon-droid/siso-appultimo`
- Rama: `main`
- Build: `npm run build` → carpeta `dist/`
- `_redirects` y `_headers` ya están en `public/`

---

## 📋 Paso a paso: Conectar con Cloudflare Pages

### Opción A — Conectar GitHub directo (RECOMENDADO)

1. **Ir a Cloudflare Dashboard**
   - https://dash.cloudflare.com/
   - Inicia sesión

2. **Crear nuevo Pages project**
   - Menú lateral → `Workers & Pages` → `Create application` → `Pages`
   - Click en **"Connect to Git"**

3. **Seleccionar repositorio**
   - Click en `GitHub`
   - Autoriza Cloudflare a acceder a tu GitHub
   - Busca: **`drjuliancucalon-droid/siso-appultimo`**
   - Click en `Begin setup`

4. **Configurar build**
   - **Project name:** `siso-ocupasalud` (será `siso-ocupasalud.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** *(dejar vacío)*
   - **Environment variables:** *(ninguna requerida por ahora)*

5. **Click en "Save and Deploy"**
   - Espera 2-3 minutos mientras compila
   - Una vez listo te muestra la URL: `https://siso-ocupasalud.pages.dev`

6. **Listo** — La app está en producción.

---

### Opción B — Deploy manual con Wrangler (CLI)

```bash
# 1. Instalar Wrangler globalmente
npm install -g wrangler

# 2. Login a Cloudflare
wrangler login

# 3. Build local
cd C:\Users\JQK3\siso-appultimo
npm run build

# 4. Deploy
wrangler pages deploy dist --project-name=siso-ocupasalud
```

---

### Opción C — Deploy con Cloudflare Worker + D1 (avanzado)

Si quieres replicar también el **Worker D1** del monolito (almacenamiento en nube):

```bash
# 1. Crear D1 database
wrangler d1 create siso_store
# Copia el "database_id" que devuelve

# 2. Aplicar schema
wrangler d1 execute siso_store --file=siso-worker/schema.sql

# 3. Configurar secrets
wrangler secret put SISO_TOKEN
# Ingresa un token aleatorio seguro (ej: tu-token-secreto-2026)

# 4. Deploy del Worker
cd siso-worker
wrangler deploy
# Te da URL del worker: https://siso-api.<sub>.workers.dev

# 5. En el código del frontend, configurar la URL del Worker
# Editar src/shared/lib/syncManager.js, agregar al inicio:
# const _D1_WORKER_URL = 'https://siso-api.<sub>.workers.dev';
# const _D1_WORKER_TOKEN = '<tu-token-secreto-2026>';
```

---

## 🌐 URLs resultantes

| Recurso | URL |
|---------|-----|
| **App (Cloudflare Pages)** | `https://siso-ocupasalud.pages.dev` |
| **Worker D1 (si se despliega)** | `https://siso-api.<sub>.workers.dev` |
| **Repositorio GitHub** | `https://github.com/drjuliancucalon-droid/siso-appultimo` |

---

## 🔑 Credenciales de acceso

- **Usuario:** `drcucalon`
- **Contraseña:** `cucalon2026`
- (Otros seed users: `dr.garcia` / `medico2026`, `admin.ips` / `admin2026`, etc.)

---

## ⚙️ Verificación post-deploy

Una vez desplegado, verificar:

1. ✅ `https://siso-ocupasalud.pages.dev/login` → debe mostrar pantalla de login
2. ✅ Login con `drcucalon` / `cucalon2026`
3. ✅ Dashboard aparece con navbar blanco superior
4. ✅ Botones de navegación (Pacientes, Agenda, Empresas, etc.)
5. ✅ Acciones Rápidas (Nueva HC, Pacientes, Agenda, Empresas, Reportes, SG-SST)

---

## 🔄 Deploys automáticos

Cloudflare Pages detecta automáticamente cada `git push` a la rama `main`:

```bash
git add .
git commit -m "..."
git push origin main
```

→ Cloudflare recompila y redespliega en 2-3 minutos.
→ Ver el estado en `https://dash.cloudflare.com/` → Workers & Pages → tu proyecto → `Deployments`

---

## 🛠️ Configuración recomendada post-deploy

### Custom domain (opcional)
- Cloudflare Pages → tu proyecto → **Custom domains** → `siso.tudominio.com`

### Variables de entorno (opcional)
Para que el frontend use D1 Worker en lugar de Supabase:
- `VITE_D1_WORKER_URL` = `https://siso-api.<sub>.workers.dev`
- `VITE_D1_WORKER_TOKEN` = tu-token-secreto

### CORS
Si despliegas el Worker D1, ya está configurado con los origins:
- `https://siso-ocupasalud.pages.dev`
- `https://ocupasaludparadesplegar-f4q.pages.dev`
- `http://localhost:5173`

---

## ⚠️ Si el deploy no aparece

1. **Espera 3-5 minutos** — el primer deploy puede tardar
2. **Verifica en Cloudflare Dashboard** → Workers & Pages → tu proyecto
3. **Revisa los logs de build** en la pestaña "Builds"
4. **Confirma que `npm run build` funciona localmente** sin errores

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| `Build failed: Command not found: npm` | Verificar que Cloudflare detecte Node 18+ |
| `404 Not Found` en rutas | Verificar que `public/_redirects` exista con `/* /index.html 200` |
| Assets 404 (JS/CSS) | Verificar que `vite.config.js` use `base: '/'` |
| CORS errors | Agregar dominio a `corsHeaders` en `siso-worker/index.js` |
| Login falla | Las credenciales semilla son `drcucalon` / `cucalon2026` |

---

## 📞 Soporte

Si tienes problemas, revisa:
- `npm run build` funciona localmente → ✅ confirmado
- `_redirects` existe en `public/` → ✅ confirmado
- `_headers` existe en `public/` → ✅ confirmado
- Todos los commits están en `origin/main` → ✅ confirmado
- Build genera carpeta `dist/` → ✅ confirmado (1752 módulos)

**El proyecto está 100% listo para deploy. Solo necesitas conectarlo desde Cloudflare Dashboard.**