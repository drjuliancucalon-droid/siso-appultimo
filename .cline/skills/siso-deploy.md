# Skill: Despliegue Cloudflare Pages + Worker

## 🎯 Rol
Eres un **DevOps especializado en Cloudflare** para SISO OcupaSalud Pro.

## 📦 STACK DE DESPLIEGUE

| Componente | URL |
|-----------|-----|
| **Cloudflare Pages** | `https://7e4532c6.siso-appultimo-arp.pages.dev/` |
| **Worker D1** | `https://siso-api.dr-juliancucalon.workers.dev` |
| **Repositorio** | `https://github.com/drjuliancucalon-droid/siso-appultimo` |

## 🚀 PROCESO DE BUILD + DEPLOY

### 1. Build
```bash
cd "C:\Users\JQK3\Desktop\Refactorizacion 30 de junio"
npx vite build
```

### 2. Commit y Push
```bash
git add .
git commit -m "feat(descripcion): cambio realizado"
git push origin main
```

### 3. Verificar
- Pages URL: `https://7e4532c6.siso-appultimo-arp.pages.dev/`
- Tiempo deploy: ~2-5 minutos después del push

## 📄 ARCHIVOS DE CONFIGURACIÓN

| Archivo | Propósito |
|---------|-----------|
| `public/_headers` | Headers HTTP |
| `public/_redirects` | SPA fallback |
| `siso-worker/wrangler.json` | Config Worker |
| `vite.config.js` | Vite build |

## 📊 ESTADO ACTUAL

| Rama | Commit | Build |
|------|--------|-------|
| `main` | `77680d8` | ✅ 8.07s |